// Extractor de correos Post-Venta → tickets de Supabase.
// Port del extractor Python (lockowom/post-venta/main.py) a una Edge Function.
//
// Lee el buzón Outlook/Microsoft 365 configurado vía Microsoft Graph (flujo
// "client credentials", permiso de aplicación Mail.Read + consentimiento admin),
// toma los correos nuevos (dedup por id de mensaje) y crea un ticket "borrador"
// con origen='Correo' vía la RPC idempotente crear_pv_ticket (service_role).
// Los campos de gestión (región, equipo, técnico…) quedan por completar a mano
// desde el módulo Post-Venta, igual que en el flujo original.
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
const SELECT = ["id", "receivedDateTime", "subject", "bodyPreview", "from", "hasAttachments"].join(",");

function limpiar(t: string | null | undefined): string {
  if (!t) return "";
  return t.replace(/\r/g, "").replace(/_x000D_/g, "").replace(/\n{3,}/g, "\n\n").trim();
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
  if (soloDesde) url += `&$filter=receivedDateTime ge ${soloDesde}`;
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

    // IDs ya registrados (dedup en cliente, igual que ids_existentes() del Python).
    const yaRegistrados = new Set<string>();
    {
      const { data } = await supabase.from("tms_postventa_tickets").select("id_correo").not("id_correo", "is", null).limit(10000);
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
      const cliente = nombre || email || "Correo sin remitente";
      const descripcion = [asunto, preview].filter(Boolean).join("\n\n") || asunto;
      const observaciones = email ? `Correo de ${email}` : "";

      // Ticket "borrador": campos de gestión con placeholder para completar a mano.
      const { error } = await supabase.rpc("crear_pv_ticket", {
        p_cliente: cliente,
        p_region: "Por Definir",
        p_equipo_modelo: "Por Definir",
        p_tipo_solicitud: "Otro",
        p_prioridad: "Media",
        p_descripcion: descripcion,
        p_contacto: email,
        p_numero_serie: "",
        p_tecnico: "Sin Asignar",
        p_estado: "Abierto",
        p_cotizar: "No",
        p_observaciones: observaciones,
        p_origen: "Correo",
        p_id_correo: idCorreo,
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
