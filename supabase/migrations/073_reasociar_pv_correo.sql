-- 073_reasociar_pv_correo.sql
-- Post-Venta · Bandeja de Correos: reasociar un correo al ticket CORRECTO.
-- Cada hilo de correo entra como su propio caso (ticket origen='Correo'); a veces
-- un correo cae en el caso equivocado. Esta RPC lo mueve al ticket destino
-- (cambia ticket_id y alinea conversation_id para que el hilo futuro caiga bien).
-- Si el caso de origen queda sin correos, se elimina. Requiere supervisión.
create or replace function public.reasociar_pv_correo(p_id_correo text, p_numero_destino text)
returns tms_postventa_tickets
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v record; r public.tms_postventa_tickets; v_dest public.tms_postventa_tickets; v_origen uuid; v_conv text;
begin
  select * into v from public._pv_assert(true);  -- requiere supervise_postventa/admin

  select * into v_dest from tms_postventa_tickets where numero = btrim(p_numero_destino) limit 1;
  if v_dest.id is null then raise exception 'El ticket destino % no existe', p_numero_destino; end if;

  select ticket_id, conversation_id into v_origen, v_conv from tms_postventa_correos where id_correo = p_id_correo;
  if v_origen is null then raise exception 'El correo % no existe', p_id_correo; end if;
  if v_origen = v_dest.id then return v_dest; end if;  -- ya está en el destino

  -- Alinear conversation_id: si el destino no tiene, adopta el del correo (para que
  -- los próximos correos del hilo caigan en el destino); si tiene, el correo adopta el suyo.
  if v_dest.conversation_id is null and v_conv is not null then
    update tms_postventa_tickets set conversation_id = v_conv, updated_at = now() where id = v_dest.id;
    update tms_postventa_correos set ticket_id = v_dest.id where id_correo = p_id_correo;
  else
    update tms_postventa_correos
      set ticket_id = v_dest.id, conversation_id = coalesce(v_dest.conversation_id, v_conv)
      where id_correo = p_id_correo;
  end if;

  -- Limpieza: si el caso de origen (de correo) quedó vacío, se elimina.
  if not exists (select 1 from tms_postventa_correos where ticket_id = v_origen) then
    delete from tms_postventa_tickets where id = v_origen and origen = 'Correo';
  end if;

  select * into r from tms_postventa_tickets where id = v_dest.id;
  return r;
end $function$;
revoke all on function public.reasociar_pv_correo(text, text) from public, anon;
grant execute on function public.reasociar_pv_correo(text, text) to authenticated;
