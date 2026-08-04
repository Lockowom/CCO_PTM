import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { sendFcm } from '../_shared/fcm.ts';

type Ticket = {
  ticket_id?: string;
  usuario_id?: string;
  estado?: string;
  respuesta_admin?: string;
};
type Webhook = { record?: Ticket; old_record?: Ticket } & Ticket;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);
  try {
    const payload = (await request.json()) as Webhook;
    const ticket = payload.record ?? payload;
    const previous = payload.old_record ?? {};
    if (!ticket.ticket_id || !ticket.usuario_id)
      return json({ error: 'Missing ticket_id or usuario_id' }, 400);
    const changed =
      ticket.estado !== previous.estado || ticket.respuesta_admin !== previous.respuesta_admin;
    if (!changed) return json({ sent: 0, reason: 'No relevant change' });
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: owner, error } = await supabase
      .from('tms_usuarios')
      .select('push_token')
      .eq('id', ticket.usuario_id)
      .maybeSingle();
    if (error) throw error;
    if (!owner?.push_token) return json({ sent: 0, reason: 'No token' });
    const isReply = Boolean(
      ticket.respuesta_admin && ticket.respuesta_admin !== previous.respuesta_admin
    );
    await sendFcm(owner.push_token, {
      notification: {
        title: isReply
          ? `Respuesta a ticket ${ticket.ticket_id}`
          : `Ticket ${ticket.ticket_id} actualizado`,
        body: isReply
          ? ticket.respuesta_admin!.slice(0, 100)
          : `Estado: ${ticket.estado ?? 'actualizado'}`
      },
      data: { ticket_id: ticket.ticket_id, type: 'TICKET_UPDATE' },
      android: { priority: 'high' }
    });
    return json({ sent: 1 });
  } catch (error) {
    console.error('notify-ticket-update failed', error);
    return json({ error: 'Notification delivery failed' }, 500);
  }
});
