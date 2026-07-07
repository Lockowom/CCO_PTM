-- 024_monitoreo_no_registrado.sql
-- Sincronizada desde la BD live (schema_migrations version 20260707015846,
-- nombre original "020_monitoreo_no_registrado"). Renumerada a 024.
-- SKU/ubicación hallado en auditoría pero no registrado en sistema:
-- marca no_registrado + alerta a Inventario (notificación) al enviar a Calidad.
-- Redefine monitoreo_marcar_preliminar (supera la versión de 022).

ALTER TABLE public.tms_monitoreo_items
  ADD COLUMN IF NOT EXISTS no_registrado boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.monitoreo_marcar_preliminar(p_informe_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user    record;
  v_flags   int := 0;
  v_alertas int := 0;
  r         record;
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

  -- Flag preliminar EN_AUDITORIA para ítems con condición problemática O no registrados.
  FOR r IN
    SELECT * FROM tms_monitoreo_items
    WHERE informe_id = p_informe_id
      AND coalesce(btrim(ubicacion), '') <> ''
      AND (coalesce(condicion_observada, 'OK') <> 'OK' OR coalesce(no_registrado, false))
  LOOP
    INSERT INTO tms_calidad_flags
      (codigo_producto, partida, ubicacion, estado_calidad, severidad, item_id,
       nota, vigente, actualizado_por, actualizado_nombre)
    VALUES
      (r.codigo_producto, coalesce(r.partida, ''), coalesce(r.ubicacion, ''),
       'EN_AUDITORIA', 1, r.id,
       CASE WHEN coalesce(r.no_registrado,false) THEN 'NO REGISTRADO — ' ELSE '' END ||
         coalesce(r.condicion_observada, '') ||
         CASE WHEN coalesce(r.observaciones, '') <> '' THEN ' — ' || r.observaciones ELSE '' END,
       true, v_user.id, v_user.nombre)
    ON CONFLICT (codigo_producto, partida, ubicacion) DO UPDATE
      SET estado_calidad = CASE WHEN tms_calidad_flags.severidad >= 2
                                THEN tms_calidad_flags.estado_calidad ELSE 'EN_AUDITORIA' END,
          severidad      = GREATEST(tms_calidad_flags.severidad, 1),
          nota           = EXCLUDED.nota, vigente = true, item_id = EXCLUDED.item_id,
          actualizado_por = EXCLUDED.actualizado_por, actualizado_nombre = EXCLUDED.actualizado_nombre,
          updated_at     = now();
    v_flags := v_flags + 1;

    -- Alerta a Inventario para lo NO registrado.
    IF coalesce(r.no_registrado, false) THEN
      INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
      VALUES (
        'CALIDAD_NO_REGISTRADO',
        'SKU no registrado hallado en auditoría',
        format('%s en %s (lote/serie: %s) fue hallado en auditoría de Calidad pero no está registrado en el sistema. Requiere alta/ajuste por Inventario.',
               r.codigo_producto, r.ubicacion, coalesce(nullif(btrim(r.partida),''), '—')),
        NULL,
        jsonb_build_object('codigo_producto', r.codigo_producto, 'ubicacion', r.ubicacion,
                           'partida', r.partida, 'cantidad', r.cantidad,
                           'informe_id', p_informe_id, 'item_id', r.id),
        'calidad_monitoreo'
      );
      v_alertas := v_alertas + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('flags', v_flags, 'alertas', v_alertas);
END;
$function$;
