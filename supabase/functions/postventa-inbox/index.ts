// Webhook de ingesta de correos Post-Venta (para scripts externos, ej. lector POP).
//
// A diferencia de `postventa-extractor` (que lee un buzón M365 vía Graph), esta
// función NO lee correos: recibe por POST los datos que TU script POP ya extrae y
// crea el ticket (origen='Correo', idempotente por id_correo). Pensado para
// correos POP: tu script lee el buzón, arma el JSON y hace un POST aquí.
//
// Autenticación: token compartido (no requiere JWT de Supabase). Se acepta en:
//   - query string:  ?token=XXXX      (más simple si el script no manda headers)
//   - header:        x-pv-token: XXXX
//   - body:          {"token":"XXXX", ...}
// El token debe coincidir con el secret PV_INGEST_TOKEN.
//
// Payload (JSON o form-urlencoded). Acepta un objeto o un array de objetos.
// Campos (con alias tolerantes a mayúsculas/acentos):
//   id_correo | id | message_id | uid   → clave de dedup (recomendado; si falta se
//                                          usa asunto+remitente como huella)
//   cliente   | remitente | from | nombre | de
//   contacto  | email | correo | from_email
//   asunto    | subject
//   descripcion | cuerpo | body | mensaje   (si viene asunto, se antepone)
//   region, equipo_modelo, tipo_solicitud, prioridad, numero_serie,
//   tecnico_asignado, estado, cotizar, observaciones  (opcionales)
// Los campos de gestión que no vengan quedan como "Por Definir"/"Otro"/"Media"
// para completarse a mano desde el módulo Post-Venta.
//
// Secrets: PV_INGEST_TOKEN (obligatorio). SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY
// los inyecta Supabase.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

function pick(o: Record<string, any>, keys: string[]): string {
  for (const k of keys) {
    const v = o?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function limpiar(t: string): string {
  return (t || "").replace(/\r/g, "").replace(/_x000D_/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

async function crearTicket(supabase: any, raw: Record<string, any>) {
  const asunto = limpiar(pick(raw, ["asunto", "subject", "Asunto", "Subject"]));
  const cuerpo = limpiar(pick(raw, ["descripcion", "cuerpo", "body", "mensaje", "Descripcion", "Cuerpo", "texto"]));
  const cliente = pick(raw, ["cliente", "remitente", "from", "nombre", "de", "Cliente", "Remitente", "From", "sender"]) || "Correo sin remitente";
  const contacto = pick(raw, ["contacto", "email", "correo", "from_email", "Contacto", "Email", "correo_remitente"]);
  const idCorreo = pick(raw, ["id_correo", "id", "message_id", "messageId", "uid", "Message-ID", "mensaje_id"]) ||
    (asunto || cliente ? `pop:${cliente}|${asunto}`.slice(0, 250) : "");

  const descripcion = [asunto, cuerpo].filter(Boolean).join("\n\n") || asunto || "(correo sin contenido)";
  const observaciones = pick(raw, ["observaciones", "Observaciones"]) || (contacto ? `Correo de ${contacto}` : "");

  // Campos de gestión: se usan si vienen; si no, placeholder para completar a mano.
  const region = pick(raw, ["region", "Region", "región"]) || "Por Definir";
  const equipo = pick(raw, ["equipo_modelo", "equipo", "modelo", "Equipo"]) || "Por Definir";
  const tipo = pick(raw, ["tipo_solicitud", "tipo", "Tipo"]) || "Otro";
  const prioridad = pick(raw, ["prioridad", "Prioridad"]) || "Media";

  const { data, error } = await supabase.rpc("crear_pv_ticket", {
    p_cliente: cliente,
    p_region: region,
    p_equipo_modelo: equipo,
    p_tipo_solicitud: tipo,
    p_prioridad: prioridad,
    p_descripcion: descripcion,
    p_contacto: contacto,
    p_numero_serie: pick(raw, ["numero_serie", "serie", "n_serie"]),
    p_tecnico: pick(raw, ["tecnico_asignado", "tecnico"]) || "Sin Asignar",
    p_estado: pick(raw, ["estado"]) || "Abierto",
    p_cotizar: pick(raw, ["cotizar"]) || "No",
    p_observaciones: observaciones,
    p_origen: "Correo",
    p_id_correo: idCorreo || null,
  });
  if (error) throw new Error(error.message);
  return data?.numero || null;
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const expected = Deno.env.get("PV_INGEST_TOKEN") ?? "";
    if (!expected) {
      return new Response(JSON.stringify({ ok: false, error: "Falta configurar el secret PV_INGEST_TOKEN" }), {
        status: 503, headers: { "Content-Type": "application/json" },
      });
    }

    // Body: JSON o form-urlencoded.
    const ct = req.headers.get("content-type") || "";
    let body: any = {};
    const rawText = await req.text();
    if (ct.includes("application/json")) {
      try { body = JSON.parse(rawText || "{}"); } catch { body = {}; }
    } else {
      const p = new URLSearchParams(rawText); body = Object.fromEntries(p.entries());
    }

    // Token: query > header > body.
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || req.headers.get("x-pv-token") || body?.token || "";
    if (token !== expected) {
      return new Response(JSON.stringify({ ok: false, error: "Token inválido" }), {
        status: 401, headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // Uno o varios correos: acepta objeto, array, o {correos:[...]}.
    let items: any[];
    if (Array.isArray(body)) items = body;
    else if (Array.isArray(body?.correos)) items = body.correos;
    else items = [body];

    const numeros: string[] = [];
    const errores: string[] = [];
    for (const it of items) {
      try { const num = await crearTicket(supabase, it || {}); if (num) numeros.push(num); }
      catch (e) { errores.push(String(e?.message || e)); }
    }

    return new Response(JSON.stringify({
      ok: errores.length === 0, recibidos: items.length, tickets: numeros,
      errores: errores.slice(0, 20), total_errores: errores.length,
    }), { status: errores.length ? 207 : 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
