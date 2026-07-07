import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v5.2.2/index.ts";

// Push a móvil (FCM v1) para alertas de Inventario/Calidad. Clon de notify-ticket.
// Envía a los push_token de los usuarios del rol indicado (por defecto ADMIN).
// Requiere secret FCM_SERVICE_ACCOUNT (Service Account JSON de Firebase).

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FCM_SA_RAW = Deno.env.get("FCM_SERVICE_ACCOUNT") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPKCS8(sa.private_key, "RS256");
  const jwt = await new SignJWT({
    iss: sa.client_email,
    sub: sa.client_email,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .sign(privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`OAuth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  const errors: string[] = [];
  try {
    const body = await req.json().catch(() => ({}));
    const record = body.record || body;
    const title = record.titulo || record.title || "🔔 Alerta de Calidad";
    const bodyText = record.mensaje || record.body || "Nueva alerta de inventario";
    const rawData = record.payload || record.data || {};
    const rol = body.rol || "ADMIN";

    const { data: users } = await supabase
      .from("tms_usuarios")
      .select("push_token")
      .eq("rol", rol)
      .not("push_token", "is", null);

    const tokens = (users || []).map((u: any) => u.push_token).filter(Boolean);
    if (tokens.length === 0) return json({ sent: 0, reason: "No tokens" });
    if (!FCM_SA_RAW) return json({ sent: 0, reason: "No FCM config" });

    const dataStr: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawData)) dataStr[k] = String(v ?? "");

    const sa = JSON.parse(FCM_SA_RAW);
    const accessToken = await getAccessToken(sa);
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

    let sent = 0;
    for (const token of tokens) {
      try {
        const res = await fetch(fcmUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body: bodyText },
              data: dataStr,
              android: {
                priority: "high",
                notification: {
                  channel_id: "cco_tickets",
                  sound: "default",
                  default_sound: true,
                  default_vibrate_timings: true,
                  notification_priority: "PRIORITY_MAX",
                  visibility: "PUBLIC",
                },
              },
            },
          }),
        });
        if (res.ok) sent++;
        else errors.push(`FCM ${res.status}: ${await res.text()}`);
      } catch (e) {
        errors.push((e as Error).message);
      }
    }

    return json({ sent, total_tokens: tokens.length, errors });
  } catch (err) {
    return json({ error: (err as Error).message, errors }, 500);
  }
});
