// capgo-deploy — Despliegue OTA desde la app (admin).
//
// Permite a un admin: (1) LISTAR los bundles subidos a Capgo y ver qué versión
// tiene cada canal (beta/production), y (2) PROMOVER una versión elegida al canal
// `production` (toda la bodega) — enlazando el bundle existente, sin recompilar.
//
// Seguridad: la API key de Capgo (poderosa) vive SOLO aquí, como secret
// `CAPGO_API_KEY` de la Edge Function — NUNCA se embebe en el cliente. Cada
// invocación se autentica con el JWT del usuario y se autoriza con la RPC
// `puede_desplegar_ota()` (admin o permiso `deploy_ota`). Cada promoción queda
// auditada vía `registrar_despliegue_ota`.
//
// Secrets: CAPGO_API_KEY (obligatorio, rol con permiso de asignar canal),
//   CAPGO_APP_ID (opcional, por defecto com.cco.wms). SUPABASE_URL /
//   SUPABASE_ANON_KEY los inyecta Supabase.
//
// Body JSON: { "action": "list" }  |  { "action": "promote", "version": "1.27.2", "channel": "production" }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CAPGO_BASE = "https://api.capgo.app";
const APP_ID = Deno.env.get("CAPGO_APP_ID") || "com.cco.wms";
const CAPGO_KEY = Deno.env.get("CAPGO_API_KEY") || "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function capgo(path: string, init: RequestInit = {}) {
  const res = await fetch(`${CAPGO_BASE}${path}`, {
    ...init,
    headers: {
      // x-api-key es el header recomendado; authorization se acepta por legacy.
      "x-api-key": CAPGO_KEY,
      "authorization": CAPGO_KEY,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = typeof data === "string" ? data : (data?.error || JSON.stringify(data));
    throw new Error(`Capgo ${res.status}: ${msg}`);
  }
  return data;
}

// Un bundle/canal puede venir con la versión como objeto {name} o como string.
const verName = (v: any) => (v && typeof v === "object" ? v.name : v) || null;
const asArray = (x: any) => (Array.isArray(x) ? x : (x?.data || x?.bundles || x?.channels || []));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, 405);
    if (!CAPGO_KEY) {
      return json({ ok: false, error: "Falta configurar el secret CAPGO_API_KEY en la Edge Function." }, 503);
    }

    // ── Autenticación + autorización con el JWT del usuario ──
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    // Pasar el token EXPLÍCITO a getUser (sin arg no valida el header de forma fiable).
    const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !user) return json({ ok: false, error: "No autenticado: " + (userErr?.message || "sin usuario") }, 401);

    const { data: puede, error: permErr } = await userClient.rpc("puede_desplegar_ota");
    if (permErr) return json({ ok: false, error: "Error verificando permiso: " + permErr.message }, 500);
    if (!puede) return json({ ok: false, error: "No tienes permiso para desplegar OTA a producción." }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body?.action || "list";

    // ── LISTAR bundles + estado de canales ──
    if (action === "list") {
      const [bundlesRaw, channelsRaw] = await Promise.all([
        capgo(`/bundle?app_id=${encodeURIComponent(APP_ID)}`).catch(() => []),
        capgo(`/channel?app_id=${encodeURIComponent(APP_ID)}`).catch(() => []),
      ]);
      const bundles = asArray(bundlesRaw)
        .map((b: any) => ({ version: verName(b.version) || b.name, created_at: b.created_at || null }))
        .filter((b: any) => b.version);
      const channels = asArray(channelsRaw).map((c: any) => ({
        name: c.name,
        version: verName(c.version),
      }));
      return json({ ok: true, app_id: APP_ID, bundles, channels });
    }

    // ── PROMOVER una versión a un canal (por defecto production) ──
    if (action === "promote") {
      const version = String(body?.version || "").trim();
      const canal = String(body?.channel || "production").trim();
      if (!version) return json({ ok: false, error: "Falta la versión a promover." }, 400);

      let ok = true, detalle = "";
      try {
        await capgo(`/channel`, {
          method: "POST",
          body: JSON.stringify({ app_id: APP_ID, channel: canal, version }),
        });
      } catch (e) {
        ok = false;
        detalle = String((e as Error)?.message || e);
      }

      // Auditar (con el JWT del usuario → deja auth.uid()/email). No romper si falla.
      await userClient.rpc("registrar_despliegue_ota", {
        p_version: version, p_canal: canal, p_ok: ok, p_detalle: detalle || null,
      }).catch(() => {});

      if (!ok) return json({ ok: false, error: detalle || "No se pudo promover." }, 502);
      return json({ ok: true, version, channel: canal });
    }

    // ── ELIMINAR un bundle de Capgo (limpieza de versiones viejas) ──
    if (action === "delete") {
      const version = String(body?.version || "").trim();
      if (!version) return json({ ok: false, error: "Falta la versión a eliminar." }, 400);
      let ok = true, detalle = "";
      try {
        await capgo(`/bundle`, {
          method: "DELETE",
          body: JSON.stringify({ app_id: APP_ID, version }),
        });
      } catch (e) {
        ok = false; detalle = String((e as Error)?.message || e);
      }
      await userClient.rpc("registrar_despliegue_ota", {
        p_version: version, p_canal: "eliminado", p_ok: ok, p_detalle: detalle || "bundle eliminado",
      }).catch(() => {});
      if (!ok) return json({ ok: false, error: detalle || "No se pudo eliminar el bundle." }, 502);
      return json({ ok: true, version, deleted: true });
    }

    return json({ ok: false, error: "Acción no reconocida (usa 'list', 'promote' o 'delete')." }, 400);
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
