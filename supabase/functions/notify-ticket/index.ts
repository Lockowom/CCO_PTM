import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { sendFcm } from '../_shared/fcm.ts';

type Ticket = {
  ticket_id?: string;
  usuario_nombre?: string;
  asunto?: string;
  descripcion?: string;
  prioridad?: string;
};
type Webhook = { record?: Ticket } & Ticket;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);
  try {
    const payload = (await request.json()) as Webhook;
    const ticket = payload.record ?? payload;
    if (!ticket.ticket_id) return json({ error: 'Missing ticket_id' }, 400);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: admins, error } = await supabase
      .from('tms_usuarios')
      .select('push_token,nombre')
      .eq('rol', 'ADMIN')
      .not('push_token', 'is', null);
    if (error) throw error;
    const title = `Nuevo ticket ${ticket.ticket_id}`;
    const body = `${ticket.usuario_nombre ?? 'Sistema'}: ${ticket.asunto ?? ticket.descripcion?.slice(0, 80) ?? 'Sin detalle'}`;
    const tokens = (admins ?? [])
      .filter((u) => u.nombre !== ticket.usuario_nombre)
      .map((u) => u.push_token)
      .filter(Boolean);
    const results = await Promise.allSettled(
      tokens.map((token) =>
        sendFcm(token, {
          notification: { title, body },
          data: { ticket_id: ticket.ticket_id, type: 'NEW_TICKET' },
          android: { priority: 'high' }
        })
      )
    );
    return json({
      sent: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length
    });
  } catch (error) {
    console.error('notify-ticket failed', error);
    return json({ error: 'Notification delivery failed' }, 500);
  }
});
