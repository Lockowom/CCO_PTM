-- ============================================================================
-- 161_nv_notification_actor_label.sql
-- Ajusta las notificaciones de N.V. para mostrar el usuario que realizó la
-- modificación, en vez del identificador técnico de la N.V. en el mensaje.
-- ============================================================================

-- Regla vigente para eventos de cambio de estado de N.V.
update public.notificacion_regla
set titulo_tpl = 'N.V. actualizada',
    mensaje_tpl = '{actor}: {desde} -> {hasta}',
    updated_at = now(),
    updated_by = coalesce(public._panel_actor(), 'sistema')
where evento_patron = '^NV\.(avanzar|cambiar)$';

-- Backfill de notificaciones ya materializadas desde el motor de eventos.
update public.notificacion n
set titulo = public._notif_render('N.V. actualizada', e),
    mensaje = public._notif_render('{actor}: {desde} -> {hasta}', e)
from public.dominio_eventos e
where n.evento_id = e.id
  and e.nombre ~ '^NV\.(avanzar|cambiar)$';
