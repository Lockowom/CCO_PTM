// api-v1 — API de Operaciones versionada (blueprint §8).
//
// Contrato público v1 para consumidores máquina-a-máquina (Portal Cliente, ERP,
// integraciones). Autenticación por API-key (header `x-api-key`), NO por JWT de
// Supabase → verify_jwt debe estar OFF. La key se valida con la RPC `_api_validar`
// (service_role) que devuelve los scopes; luego el gateway llama las RPCs
// CANÓNICAS como service_role, reusando TODAS las reglas de negocio (estados,
// sellos, validaciones). Cada llamada se audita en tms_api_log.
//
// Secrets: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (inyectados por Supabase).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-api-key, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const CONTRACT = {
  api: "CCO Operaciones", version: "v1",
  auth: "Header 'x-api-key: cco_...'",
  scopes: ["operaciones:read", "operaciones:write", "tms:read", "tms:write"],
  endpoints: [
    { method: "GET",  path: "/operaciones?nv=123", scope: "operaciones:read", desc: "Consulta una N.V. por número." },
    { method: "POST", path: "/operaciones", scope: "operaciones:write", desc: "Crea/edita una N.V. (body = payload guardar_nv)." },
    { method: "POST", path: "/operaciones/estado", scope: "operaciones:write", desc: "Cambia estado {id, estado, urgente?}." },
    { method: "GET",  path: "/tms/ordenes?estado=", scope: "tms:read", desc: "Lista órdenes de transporte." },
    { method: "POST", path: "/tms/ordenes", scope: "tms:write", desc: "Crea orden desde una operación {oper_id}." },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const url = new URL(req.url);
  // Ruta relativa: quita el prefijo de la función.
  let path = url.pathname.replace(/^.*\/api-v1/, "") || "/";
  if (path === "") path = "/";

  if (path === "/" && req.method === "GET") return json({ ok: true, ...CONTRACT });

  const apiKey = req.headers.get("x-api-key") || "";
  if (!apiKey) return json({ ok: false, error: "Falta el header x-api-key." }, 401);

  const { data: scopes, error: valErr } = await admin.rpc("_api_validar", { p_key: apiKey });
  if (valErr) return json({ ok: false, error: "Error validando la key." }, 500);
  if (!scopes) return json({ ok: false, error: "API key inválida o revocada." }, 401);
  const has = (s: string) => Array.isArray(scopes) && scopes.includes(s);
  const prefijo = apiKey.split("_")[1] || null;

  const log = async (estado_http: number, detalle = "") => {
    await admin.from("tms_api_log").insert({ prefijo, metodo: req.method, ruta: path, estado_http, detalle }).catch(() => {});
  };
  const deny = async (scope: string) => { await log(403, `sin scope ${scope}`); return json({ ok: false, error: `Falta el scope ${scope}.` }, 403); };

  let body: any = {};
  if (req.method === "POST") body = await req.json().catch(() => ({}));

  try {
    // ── OPERACIONES ──
    if (path === "/operaciones" && req.method === "GET") {
      if (!has("operaciones:read")) return await deny("operaciones:read");
      const nv = url.searchParams.get("nv");
      let q = admin.from("tms_operaciones").select("id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,estado,tipo_despacho,transportista,fecha_compromiso,fecha_despacho,fecha_entregado,urgente").limit(50);
      if (nv) q = q.or(`nv_ptm.eq.${/^\d+$/.test(nv) ? nv : 0},nv_orange.eq.${nv},nv_farmapack.eq.${nv},varios.eq.${nv}`);
      const { data, error } = await q;
      if (error) { await log(400, error.message); return json({ ok: false, error: error.message }, 400); }
      await log(200); return json({ ok: true, data });
    }
    if (path === "/operaciones" && req.method === "POST") {
      if (!has("operaciones:write")) return await deny("operaciones:write");
      const { data, error } = await admin.rpc("guardar_nv", { p: body });
      if (error) { await log(400, error.message); return json({ ok: false, error: error.message }, 400); }
      await log(200); return json({ ok: true, data });
    }
    if (path === "/operaciones/estado" && req.method === "POST") {
      if (!has("operaciones:write")) return await deny("operaciones:write");
      const { data, error } = await admin.rpc("cambiar_estado_nv", { p_id: body.id, p_estado: body.estado, p_urgente: body.urgente ?? null });
      if (error) { await log(400, error.message); return json({ ok: false, error: error.message }, 400); }
      await log(200); return json({ ok: true, data });
    }
    // ── TMS ──
    if (path === "/tms/ordenes" && req.method === "GET") {
      if (!has("tms:read")) return await deny("tms:read");
      let q = admin.from("tms_transporte_ordenes").select("id,folio,nv,cliente,estado,fecha_programada,fecha_en_ruta,fecha_entregado").order("id", { ascending: false }).limit(50);
      const est = url.searchParams.get("estado"); if (est) q = q.eq("estado", est);
      const { data, error } = await q;
      if (error) { await log(400, error.message); return json({ ok: false, error: error.message }, 400); }
      await log(200); return json({ ok: true, data });
    }
    if (path === "/tms/ordenes" && req.method === "POST") {
      if (!has("tms:write")) return await deny("tms:write");
      const { data, error } = await admin.rpc("tms_orden_crear_desde_nv", { p_oper_id: body.oper_id });
      if (error) { await log(400, error.message); return json({ ok: false, error: error.message }, 400); }
      await log(200); return json({ ok: true, data });
    }

    await log(404, "ruta no encontrada");
    return json({ ok: false, error: "Ruta no encontrada. GET / para ver el contrato." }, 404);
  } catch (e) {
    await log(500, String((e as Error)?.message || e));
    return json({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
