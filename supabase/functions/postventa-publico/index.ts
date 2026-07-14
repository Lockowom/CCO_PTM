// Formulario PÚBLICO de solicitud de servicio Post-Venta (sin login).
//
// La página abierta /soporte (cualquier cliente/vendedor, sin cuenta) hace POST
// aquí. Esta función aplica el anti-spam y crea el ticket con el service_role a
// través de la RPC dedicada `crear_pv_ticket_publico` (que NO usa _pv_assert y
// además hace rate-limit por IP y global). El ticket entra como BORRADOR
// (origen='Web', "Sin Asignar") para que un técnico lo valide.
//
// `verify_jwt` OFF: es un endpoint público. La defensa es en capas:
//   1) Honeypot: el campo oculto `website` debe venir vacío (los bots lo llenan).
//   2) Tiempo mínimo de llenado: `t_ms` (ms desde que cargó el form) >= 2500.
//   3) Turnstile OPCIONAL: si existe el secret PV_TURNSTILE_SECRET, se verifica
//      el token `cf_token` contra Cloudflare (si no está el secret, se omite).
//   4) Rate-limit por IP y global dentro de la RPC (x-forwarded-for).
//
// Secrets: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (los inyecta Supabase) y
// opcional PV_TURNSTILE_SECRET.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function pick(o: Record<string, any>, keys: string[]): string {
  for (const k of keys) {
    const v = o?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  const first = xff.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip") || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, 405);

    let body: Record<string, any> = {};
    try { body = JSON.parse((await req.text()) || "{}"); } catch { body = {}; }

    // 1) Honeypot — un bot llena el campo oculto. Respondemos "ok" sin crear nada.
    if (pick(body, ["website", "url", "homepage"]) !== "") {
      return json({ ok: true, numero: null });
    }
    // 2) Tiempo mínimo de llenado.
    const tMs = Number(body?.t_ms || 0);
    if (!(tMs >= 2500)) {
      return json({ ok: false, error: "Formulario enviado demasiado rápido. Intenta nuevamente." }, 400);
    }
    // 3) Turnstile opcional.
    const tsSecret = Deno.env.get("PV_TURNSTILE_SECRET") ?? "";
    if (tsSecret) {
      const token = pick(body, ["cf_token", "turnstile", "cf-turnstile-response"]);
      if (!token) return json({ ok: false, error: "Falta la verificación anti-robot." }, 400);
      const form = new URLSearchParams({ secret: tsSecret, response: token, remoteip: clientIp(req) });
      const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
      const out = await r.json().catch(() => ({}));
      if (!out?.success) return json({ ok: false, error: "No se pudo verificar que eres humano." }, 400);
    }

    const cliente = pick(body, ["cliente", "empresa", "razon_social"]);
    const contacto = pick(body, ["contacto", "nombre", "email", "telefono"]);
    const equipo = pick(body, ["equipo_modelo", "equipo", "modelo"]);
    const descripcion = pick(body, ["descripcion", "detalle", "mensaje"]);
    if (!cliente || !contacto || !equipo || !descripcion) {
      return json({ ok: false, error: "Faltan campos obligatorios: empresa/cliente, contacto, equipo/modelo y descripción." }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, serviceKey);

    const { data, error } = await supabase.rpc("crear_pv_ticket_publico", {
      p_cliente: cliente,
      p_contacto: contacto,
      p_equipo_modelo: equipo,
      p_descripcion: descripcion,
      p_tipo_solicitud: pick(body, ["tipo_solicitud", "tipo"]) || "Otro",
      p_prioridad: pick(body, ["prioridad"]) || "Media",
      p_region: pick(body, ["region"]) || "Por Definir",
      p_comuna: pick(body, ["comuna"]) || null,
      p_numero_serie: pick(body, ["numero_serie", "serie"]) || null,
      p_ip: clientIp(req) || null,
      p_observaciones: pick(body, ["observaciones"]) || null,
      p_cotizar: pick(body, ["cotizar"]) || "No",
      p_fecha_programada: pick(body, ["fecha_programada"]) || null,
      p_hora_programada: pick(body, ["hora_programada"]) || null,
    });
    if (error) {
      // Los mensajes de la RPC (rate-limit / validación) son aptos para mostrar.
      return json({ ok: false, error: error.message || "No se pudo registrar la solicitud." }, 429);
    }
    return json({ ok: true, numero: data });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
