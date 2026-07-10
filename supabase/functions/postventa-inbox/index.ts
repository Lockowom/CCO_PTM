// Webhook de ingesta de correos Post-Venta (para scripts externos, ej. lector POP).
//
// A diferencia de `postventa-extractor` (que lee un buzón M365 vía Graph), esta
// función NO lee correos: recibe por POST los datos que TU script POP ya extrae y
// crea el ticket (origen='Correo', idempotente por id_correo). Pensado para
// correos POP: tu script lee el buzón, arma el JSON y hace un POST aquí.
//
// Autenticación: token/API key compartido (no requiere JWT de Supabase). Se
// acepta SOLO por header (X-API-Key — el que usa la macro Outlook de PTM — o
// x-pv-token). Ya no se acepta por query string ni body: un token en la URL
// queda registrado en logs de proxies/accesos (hallazgo S10 del informe de
// seguridad). El valor debe coincidir con el secret PV_INGEST_TOKEN.
//
// Payload (JSON o form-urlencoded). Acepta:
//   - un objeto,   - un array de objetos,   - {"correos":[...]}   o   {"filas":[...]}
//     (este último es el que envía la macro VBA de Outlook de PTM).
// Campos (con alias tolerantes a mayúsculas/acentos):
//   id_correo | id | message_id | uid | EntryID   → clave de dedup (recomendado)
//   cliente   | remitente_nombre | remitente | from | nombre | de
//   contacto  | remitente_email | email | correo | from_email
//   asunto    | subject
//   descripcion | cuerpo | body | mensaje   (si viene asunto, se antepone)
//   adjuntos, recibido, para, cc   → se anexan a observaciones
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

// Outlook/VBA manda fechas "dd/mm/yyyy hh:mm[:ss]" (hora de Chile). El cast
// ::timestamptz de Postgres (DateStyle MDY) intercambiaba día y mes cuando el
// día era ≤ 12, y caía a now() cuando era > 12. Se convierte aquí a ISO con
// offset de Chile (-03:00; ±1 h en invierno, suficiente para orden y fecha).
function normalizarFecha(s: string): string | null {
  const t = String(s || "").trim();
  if (!t) return null;
  const m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return t; // ya viene ISO u otro formato entendible por Postgres
  const [, d, mo, y, h = "0", mi = "00", se = "00"] = m;
  const yyyy = y.length === 2 ? `20${y}` : y;
  return `${yyyy}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${h.padStart(2, "0")}:${mi}:${se}-03:00`;
}

async function crearTicket(supabase: any, raw: Record<string, any>) {
  const asunto = limpiar(pick(raw, ["asunto", "subject", "Asunto", "Subject"]));
  const cuerpo = pick(raw, ["cuerpo", "body", "descripcion", "mensaje", "Cuerpo", "texto"]);
  const remitenteNombre = pick(raw, ["remitente_nombre", "remitente", "from", "nombre", "de", "Remitente", "From", "sender"]);
  const remitenteEmail = pick(raw, ["remitente_email", "email", "correo", "from_email", "Email", "correo_remitente"]);
  const recibido = pick(raw, ["recibido", "receivedDateTime", "fecha", "Recibido"]);
  // Dedup sintético (solo si no viene EntryID): incluye la fecha para que dos
  // correos distintos del mismo remitente con el mismo asunto ("RE: Falla…")
  // no colisionen y el segundo se pierda por la idempotencia.
  const idCorreo = pick(raw, ["id_correo", "id", "message_id", "messageId", "uid", "EntryID", "entryid", "Message-ID", "mensaje_id"]) ||
    (asunto || remitenteNombre ? `pop:${remitenteNombre || remitenteEmail}|${asunto}|${recibido}`.slice(0, 250) : "");
  if (!idCorreo) throw new Error("correo sin id (EntryID/id/message_id)");

  const { data, error } = await supabase.rpc("ingesta_pv_correo", {
    p_id_correo: idCorreo,
    p_conversation_id: pick(raw, ["conversation_id", "conversationId", "ConversationID", "conversationid"]) || null,
    p_recibido: normalizarFecha(recibido),
    p_remitente_nombre: remitenteNombre,
    p_remitente_email: remitenteEmail,
    p_para: pick(raw, ["para", "to", "Para", "To"]),
    p_cc: pick(raw, ["cc", "CC", "Cc"]),
    p_asunto: asunto,
    p_cuerpo: limpiar(cuerpo),
    p_adjuntos: pick(raw, ["adjuntos", "attachments", "Adjuntos"]),
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

    // Body: JSON o form-urlencoded. Se intenta JSON PRIMERO sin importar el
    // Content-Type: WinHttp/VBA suele mandar el JSON como text/plain y antes
    // el body se destruía al parsearlo como URLSearchParams (todas las filas
    // fallaban con "correo sin id").
    let body: any = {};
    const rawText = await req.text();
    try {
      body = JSON.parse(rawText || "{}");
    } catch {
      const p = new URLSearchParams(rawText);
      body = Object.fromEntries(p.entries());
    }

    // Token/API key: SOLO por header (X-API-Key de la macro Outlook o x-pv-token).
    const token = req.headers.get("x-api-key") || req.headers.get("x-pv-token") || "";
    if (token !== expected) {
      return new Response(JSON.stringify({ ok: false, error: "Token inválido" }), {
        status: 401, headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // Uno o varios correos: acepta objeto, array, {correos:[...]} o {filas:[...]}
    // (este último es el envelope de la macro VBA de Outlook de PTM).
    let items: any[];
    if (Array.isArray(body)) items = body;
    else if (Array.isArray(body?.filas)) items = body.filas;
    else if (Array.isArray(body?.correos)) items = body.correos;
    else items = [body];

    const numeros: string[] = [];
    const sinId: string[] = [];      // filas sin EntryID/id: reintentar no las arregla
    const errores: string[] = [];    // errores transitorios (RPC caída, timeout, etc.)
    for (const it of items) {
      try { const num = await crearTicket(supabase, it || {}); if (num) numeros.push(num); }
      catch (e) {
        const msg = String(e?.message || e);
        (msg.includes("correo sin id") ? sinId : errores).push(msg);
      }
    }

    // La macro cuenta st=200 como "enviado" y no reintenta. Antes se respondía
    // 200 SIEMPRE, así que una falla transitoria (RPC caída) marcaba el correo
    // como enviado y se perdía sin rastro. Ahora: 200 solo si no hubo errores
    // transitorios; con errores → 500 para que la macro reintente el lote
    // completo (la ingesta es idempotente por id_correo: reenviar es seguro).
    // Las filas sin id (error permanente) no fuerzan reintento: van informadas.
    const status = errores.length > 0 ? 500 : 200;
    return new Response(JSON.stringify({
      ok: errores.length === 0 && sinId.length === 0, recibidos: items.length, tickets: numeros,
      errores: errores.slice(0, 20), total_errores: errores.length,
      descartados_sin_id: sinId.length,
    }), { status, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
