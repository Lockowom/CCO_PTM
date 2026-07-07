-- 022_monitoreo_flags_preliminares.sql
-- Sincronizada desde la BD live (schema_migrations version 20260707010109,
-- nombre original "018_monitoreo_flags_preliminares"). Renumerada a 022.
-- Toma de auditoría mejorada: cantidad afectada por ítem + reflejo preliminar
-- en Ubicaciones al enviar a Calidad (estado EN_AUDITORIA), que el dictamen refina.
-- NOTA: monitoreo_marcar_preliminar se redefine luego en 024 (no_registrado).

ALTER TABLE public.tms_monitoreo_items
  ADD COLUMN IF NOT EXISTS cantidad_afectada integer;

CREATE OR REPLACE FUNCTION public.monitoreo_marcar_preliminar(p_informe_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user  record;
  v_count int := 0;
  r       record;
BEGIN
  SELECT u.id, u.nombre, u.rol, u.es_admin_delegado,
         (SELECT permisos_json FROM tms_roles rr WHERE rr.id = u.rol) AS permisos
    INTO v_user
  FROM tms_usuarios u
  WHERE u.auth_uid = auth.uid() AND u.activo = true;

  IF v_user.id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  IF NOT (v_user.rol = 'ADMIN' OR v_user.es_admin_delegado
          OR (v_user.permisos ? 'manage_monitoreo') OR (v_user.permisos ? 'manage_quality')) THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere permiso de Monitoreo o Calidad';
  END IF;

  -- Un flag preliminar EN_AUDITORIA por ítem con condición problemática + ubicación.
  FOR r IN
    SELECT * FROM tms_monitoreo_items
    WHERE informe_id = p_informe_id
      AND coalesce(condicion_observada, 'OK') <> 'OK'
      AND coalesce(btrim(ubicacion), '') <> ''
  LOOP
    INSERT INTO tms_calidad_flags
      (codigo_producto, partida, ubicacion, estado_calidad, severidad, item_id,
       nota, vigente, actualizado_por, actualizado_nombre)
    VALUES
      (r.codigo_producto, coalesce(r.partida, ''), coalesce(r.ubicacion, ''),
       'EN_AUDITORIA', 1, r.id,
       coalesce(r.condicion_observada, '') ||
         CASE WHEN coalesce(r.observaciones, '') <> '' THEN ' — ' || r.observaciones ELSE '' END,
       true, v_user.id, v_user.nombre)
    ON CONFLICT (codigo_producto, partida, ubicacion) DO UPDATE
      SET estado_calidad = CASE WHEN tms_calidad_flags.severidad >= 2
                                THEN tms_calidad_flags.estado_calidad ELSE 'EN_AUDITORIA' END,
          severidad      = GREATEST(tms_calidad_flags.severidad, 1),
          nota           = EXCLUDED.nota,
          vigente        = true,
          item_id        = EXCLUDED.item_id,
          actualizado_por    = EXCLUDED.actualizado_por,
          actualizado_nombre = EXCLUDED.actualizado_nombre,
          updated_at     = now();
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('flags', v_count);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.monitoreo_marcar_preliminar(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.monitoreo_marcar_preliminar(uuid) TO authenticated, service_role;
