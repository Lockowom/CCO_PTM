// Extractor de correos Post-Venta → tickets de Supabase.
// Port del extractor Python (lockowom/post-venta/main.py) a una Edge Function.
//
// Lee el buzón Outlook/Microsoft 365 configurado vía Microsoft Graph (flujo
// "client credentials", permiso de aplicación Mail.Read + consentimiento admin),
// toma los correos nuevos (dedup por id de mensaje) y los ingesta con la RPC
// idempotente ingesta_pv_correo (service_role): un hilo (conversationId) = un
// caso, correo completo guardado para el lector, y respeto de la lista de
// descartados. Los campos de gestión (región, equipo, técnico…) quedan por
// completar a mano desde el módulo Post-Venta, igual que en el flujo original.
//
// Invocación: POST (sin body, o {"solo_desde":"2026-01-01T00:00:00Z"}).
// Programar con pg_cron + pg_net, o llamar manualmente desde el panel.
//
// Secrets requeridos (Supabase → Edge Functions → Secrets):
//   GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET,
//   PV_MAILBOX (ej. postventa@ptm.cl), PV_MAILBOX_FOLDER (opcional, def. "Inbox"),
//   PV_SOLO_DESDE (opcional, ISO 8601 — solo correos desde esa fecha).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const GRAPH = "https://graph.microsoft.com/v1.0";
const SELECT = [
  "id", "conversationId", "receivedDateTime", "subject", "bodyPreview",
  "from", "toRecipients", "ccRecipients", "hasAttachments",
].join(",");

function limpiar(t: string | null | undefined): string {
  if (!t) return "";
  return t.replace(/\r/g, "").replace(/_x000D_/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

// [{emailAddress:{name,address}}] → "Nombre <correo>; …" (formato del lector de hilos).
function destinatarios(list: any[]): string {
  return (list || [])
    .map((r) => {
      const n = (r?.emailAddress?.name || "").trim();
      const a = (r?.emailAddress?.address || "").trim();
      return n && a && n !== a ? `${n} <${a}>` : (a || n);
    })
    .filter(Boolean)
    .join("; ");
}

async function getGraphToken(tenant: string, clientId: string, secret: string): Promise<string> {
  const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: secret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const data = await resp.json();
  if (!resp.ok || !data.access_token) {
    throw new Error(`No se pudo obtener token de Graph: ${data.error} - ${data.error_description}`);
  }
  return data.access_token as string;
}

async function* iterMensajes(token: string, mailbox: string, folder: string, soloDesde: string): AsyncGenerator<any> {
  let url =
    `${GRAPH}/users/${encodeURIComponent(mailbox)}/mailFolders/${encodeURIComponent(folder)}/messages` +
    `?$select=${SELECT}&$orderby=receivedDateTime asc&$top=50`;
  // encodeURIComponent: un offset "+00:00" (en vez de Z) metía un '+' crudo que
  // Graph decodifica como espacio → 400 en $filter.
  if (soloDesde) url += `&$filter=${encodeURIComponent(`receivedDateTime ge ${soloDesde}`)}`;
  const headers = { Authorization: `Bearer ${token}` };
  while (url) {
    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error(`Graph messages ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    for (const m of data.value || []) yield m;
    url = data["@odata.nextLink"] || "";
  }
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const tenant = Deno.env.get("GRAPH_TENANT_ID") ?? "";
    const clientId = Deno.env.get("GRAPH_CLIENT_ID") ?? "";
    const secret = Deno.env.get("GRAPH_CLIENT_SECRET") ?? "";
    const mailbox = Deno.env.get("PV_MAILBOX") ?? "";
    const folder = (Deno.env.get("PV_MAILBOX_FOLDER") ?? "Inbox").trim() || "Inbox";
    let soloDesde = (Deno.env.get("PV_SOLO_DESDE") ?? "").trim();

    try { const b = await req.json(); if (b?.solo_desde) soloDesde = String(b.solo_desde); } catch { /* sin body */ }

    if (!tenant || !clientId || !secret || !mailbox) {
      return new Response(JSON.stringify({ error: "Faltan secrets: GRAPH_TENANT_ID/GRAPH_CLIENT_ID/GRAPH_CLIENT_SECRET/PV_MAILBOX" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const token = await getGraphToken(tenant, clientId, secret);

    // IDs ya registrados (dedup en cliente para no re-llamar la RPC por cada
    // mensaje histórico). OJO: contra tms_postventa_correos, no contra tickets:
    // una respuesta de un hilo existente tiene ticket pero su correo aún no.
    const yaRegistrados = new Set<string>();
    {
      const { data } = await supabase.from("tms_postventa_correos").select("id_correo").limit(20000);
      for (const r of data || []) if (r.id_correo) yaRegistrados.add(r.id_correo);
    }

    let leidos = 0, creados = 0, omitidos = 0;
    const errores: string[] = [];

    for await (const msg of iterMensajes(token, mailbox, folder, soloDesde)) {
      leidos++;
      const idCorreo: string = msg.id || "";
      if (!idCorreo || yaRegistrados.has(idCorreo)) { omitidos++; continue; }

      const remitente = msg.from?.emailAddress || {};
      const nombre = (remitente.name || "").trim();
      const email = (remitente.address || "").trim();
      const asunto = limpiar(msg.subject) || "(sin asunto)";
      const preview = limpiar(msg.bodyPreview);

      // Misma RPC que el webhook POP (migraciones 050/051): un hilo = un caso
      // (conversationId agrupa las respuestas en el ticket existente), guarda el
      // correo completo para el lector, es idempotente por id_correo y respeta
      // la lista de descartados (un caso eliminado NO reingresa). El antiguo
      // crear_pv_ticket directo duplicaba un ticket por cada respuesta.
      const { error } = await supabase.rpc("ingesta_pv_correo", {
        p_id_correo: idCorreo,
        p_conversation_id: msg.conversationId || null,
        p_recibido: msg.receivedDateTime || null,
        p_remitente_nombre: nombre,
        p_remitente_email: email,
        p_para: destinatarios(msg.toRecipients),
        p_cc: destinatarios(msg.ccRecipients),
        p_asunto: asunto,
        p_cuerpo: preview,
        p_adjuntos: msg.hasAttachments ? "(con adjuntos)" : "",
      });
      if (error) { errores.push(`${idCorreo}: ${error.message}`); continue; }
      yaRegistrados.add(idCorreo);
      creados++;
    }

    return new Response(JSON.stringify({
      ok: true, mailbox, folder, leidos, procesados: creados, omitidos,
      errores: errores.slice(0, 20), total_errores: errores.length,
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
