-- 062 — Privacidad/Ley 21.719 (Bloque A): la auditoría deja de registrar el
-- heartbeat de presencia, se minimiza lo que guarda, se purga el histórico
-- acumulado y se programan retenciones.
--
-- Problema (informe INFORME_SEGURIDAD_LEY_CHILE.md, hallazgo S1): el trigger
-- de auditoría sobre tms_usuarios disparaba en CADA latido de presencia
-- (cada 30 s) y guardaba la fila completa (email, push_token, módulo actual)
-- → 102.441 filas / 139 MB = historial minuto a minuto de en qué pantalla
-- estuvo cada trabajador, sin límite de retención. Desproporcionado
-- (minimización, art. de proporcionalidad 21.719) y además consumía el 58%
-- de la base de datos.

-- 1) El trigger de tms_usuarios pasa a disparar SOLO cuando cambian columnas
--    relevantes de cuenta/privilegios (los UPDATE de presencia solo tocan
--    last_seen/current_*/session_start y ya no disparan).
DROP TRIGGER IF EXISTS trg_audit_tms_usuarios ON public.tms_usuarios;
CREATE TRIGGER trg_audit_tms_usuarios
  AFTER INSERT OR DELETE OR UPDATE OF nombre, email, rol, activo, es_admin_delegado, auth_uid, id_usuario
  ON public.tms_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.tms_audit_row();

-- 2) Minimización: aunque dispare, la auditoría de tms_usuarios no guarda
--    columnas de presencia ni el push_token (no aportan a auditar privilegios).
CREATE OR REPLACE FUNCTION public.tms_audit_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_rol   text;
  v_strip text[] := ARRAY['last_seen','current_module','current_path','last_action','session_start','push_token'];
  v_old jsonb; v_new jsonb;
BEGIN
  SELECT rol INTO v_rol FROM public.tms_usuarios WHERE auth_uid = v_actor LIMIT 1;

  v_old := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END;
  v_new := CASE WHEN TG_OP IN ('UPDATE','INSERT') THEN to_jsonb(NEW) END;
  IF TG_TABLE_NAME = 'tms_usuarios' THEN
    v_old := v_old - v_strip;
    v_new := v_new - v_strip;
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
    VALUES (v_actor, v_rol, TG_TABLE_NAME, TG_OP, OLD.id::text, v_old, NULL);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
    VALUES (v_actor, v_rol, TG_TABLE_NAME, TG_OP, NEW.id::text, v_old, v_new);
    RETURN NEW;
  ELSE
    INSERT INTO public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
    VALUES (v_actor, v_rol, TG_TABLE_NAME, TG_OP, NEW.id::text, NULL, v_new);
    RETURN NEW;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.tms_audit_row() FROM PUBLIC, anon;

-- 3) Purga del histórico de heartbeats: se eliminan los UPDATE de
--    tms_usuarios cuya única diferencia eran columnas de presencia/push_token.
DELETE FROM public.tms_auditoria
WHERE tabla = 'tms_usuarios' AND accion = 'UPDATE'
  AND (datos_antes  - ARRAY['last_seen','current_module','current_path','last_action','session_start','push_token'])
      IS NOT DISTINCT FROM
      (datos_despues - ARRAY['last_seen','current_module','current_path','last_action','session_start','push_token']);

-- Y se minimizan las filas restantes (quitar presencia/push_token retenidos).
UPDATE public.tms_auditoria
SET datos_antes  = datos_antes  - ARRAY['last_seen','current_module','current_path','last_action','session_start','push_token'],
    datos_despues = datos_despues - ARRAY['last_seen','current_module','current_path','last_action','session_start','push_token']
WHERE tabla = 'tms_usuarios';

-- 4) Retenciones programadas (pg_cron; complementan las ya existentes:
--    accesos 90d, presencia 24h, nv_eliminadas 60d).
SELECT cron.schedule('cleanup-auditoria-1y', '20 3 * * 0',
  $$DELETE FROM public.tms_auditoria WHERE ts < NOW() - INTERVAL '12 months'$$);
SELECT cron.schedule('cleanup-mediciones-24m', '25 3 * * 0',
  $$DELETE FROM public.tms_mediciones_tiempos WHERE created_at < NOW() - INTERVAL '24 months'$$);
SELECT cron.schedule('cleanup-errores-picking-24m', '30 3 * * 0',
  $$DELETE FROM public.tms_errores_picking WHERE fecha_deteccion < NOW() - INTERVAL '24 months'$$);
SELECT cron.schedule('cleanup-pv-correos-36m', '35 3 * * 0',
  $$DELETE FROM public.tms_postventa_correos WHERE recibido < NOW() - INTERVAL '36 months'$$);
