-- 033_calidad_asignaciones_instancia.sql
-- Hito 2 del proceso de Calidad — "Instancia del producto" (en almacenamiento).
-- El analista de INVENTARIO asigna a Calidad uno o varios SKUs para que los
-- revise y emita un dictamen / informe. La asignación cae en la cola de tareas
-- pendientes del hito 2 y, al resolverla, se enlaza con el informe de Monitoreo
-- generado (reusa todo el flujo de Estancia/dictamen ya existente).

CREATE TABLE IF NOT EXISTS public.tms_calidad_asignaciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estado          text NOT NULL DEFAULT 'PENDIENTE',   -- PENDIENTE | EN_PROCESO | RESUELTA | ANULADA
  prioridad       text NOT NULL DEFAULT 'NORMAL',      -- NORMAL | URGENTE
  motivo          text,
  skus            jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{codigo_producto,producto,ubicacion,partida,cantidad,unidad_medida,tipo,fecha_vencimiento,semaforo}]
  asignado_por    uuid,
  asignado_nombre text,
  informe_id      uuid REFERENCES public.tms_monitoreo_informes(id) ON DELETE SET NULL,
  resuelto_por    uuid,
  resuelto_nombre text,
  resuelto_en     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calidad_asig_estado ON public.tms_calidad_asignaciones (estado, created_at DESC);

ALTER TABLE public.tms_calidad_asignaciones ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.tms_calidad_asignaciones TO authenticated;
DROP POLICY IF EXISTS calidad_asig_select_auth ON public.tms_calidad_asignaciones;
CREATE POLICY calidad_asig_select_auth ON public.tms_calidad_asignaciones
  FOR SELECT USING (auth.role() = 'authenticated');
-- La escritura va SIEMPRE por RPC SECURITY DEFINER (crear/resolver/anular).

-- Realtime: la cola del hito 2 se refresca en vivo al asignar/resolver.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
      AND tablename = 'tms_calidad_asignaciones'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_calidad_asignaciones;
  END IF;
END $$;

-- ── Gate de permiso: Inventario (asigna) o Monitoreo/Calidad o admin ────────
CREATE OR REPLACE FUNCTION public._asignacion_calidad_assert_permiso()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_user record;
BEGIN
  SELECT u.rol, u.es_admin_delegado,
         (SELECT permisos_json FROM tms_roles rr WHERE rr.id = u.rol) AS permisos
    INTO v_user
  FROM tms_usuarios u
  WHERE u.auth_uid = auth.uid() AND u.activo = true;

  IF v_user IS NULL THEN RAISE EXCEPTION 'Usuario no autenticado'; END IF;
  IF NOT (v_user.rol = 'ADMIN' OR v_user.es_admin_delegado
          OR (v_user.permisos ? 'manage_inventory')
          OR (v_user.permisos ? 'manage_monitoreo')
          OR (v_user.permisos ? 'manage_quality')) THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere permiso de Inventario o Calidad';
  END IF;
END;
$function$;

-- ── Crear asignación (Inventario → Calidad) ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.crear_asignacion_calidad(
  p_skus      jsonb,
  p_motivo    text DEFAULT NULL,
  p_prioridad text DEFAULT 'NORMAL'
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user record;
  v_id   uuid;
  v_prio text := CASE WHEN upper(coalesce(p_prioridad,'')) = 'URGENTE' THEN 'URGENTE' ELSE 'NORMAL' END;
  v_n    int  := coalesce(jsonb_array_length(p_skus), 0);
BEGIN
  PERFORM public._asignacion_calidad_assert_permiso();
  IF v_n = 0 THEN RAISE EXCEPTION 'Debe asignar al menos un SKU'; END IF;
  SELECT id, nombre INTO v_user FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;

  INSERT INTO tms_calidad_asignaciones (estado, prioridad, motivo, skus, asignado_por, asignado_nombre)
  VALUES ('PENDIENTE', v_prio, nullif(trim(coalesce(p_motivo,'')),''), p_skus, v_user.id, v_user.nombre)
  RETURNING id INTO v_id;

  INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
  VALUES (
    'ASIGNACION_CALIDAD',
    CASE WHEN v_prio = 'URGENTE' THEN 'URGENTE: revisión de Calidad asignada' ELSE 'Nueva revisión de Calidad asignada' END,
    format('%s SKU(s) asignados a Calidad para revisión/dictamen%s.%s',
           v_n,
           CASE WHEN v_user.nombre IS NOT NULL THEN ' por ' || v_user.nombre ELSE '' END,
           CASE WHEN nullif(trim(coalesce(p_motivo,'')),'') IS NOT NULL THEN ' Motivo: ' || p_motivo ELSE '' END),
    NULL,
    jsonb_build_object('asignacion_id', v_id, 'skus', v_n, 'prioridad', v_prio, 'urgente', v_prio = 'URGENTE'),
    'calidad_instancia'
  );

  RETURN jsonb_build_object('id', v_id, 'estado', 'PENDIENTE', 'prioridad', v_prio);
END;
$function$;

-- ── Resolver asignación: enlazar el informe generado ────────────────────────
CREATE OR REPLACE FUNCTION public.resolver_asignacion_calidad(
  p_asignacion_id uuid,
  p_informe_id    uuid,
  p_estado        text DEFAULT 'RESUELTA'   -- EN_PROCESO | RESUELTA
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user record;
  v_asig tms_calidad_asignaciones;
  v_estado text := CASE WHEN upper(coalesce(p_estado,'')) = 'EN_PROCESO' THEN 'EN_PROCESO' ELSE 'RESUELTA' END;
BEGIN
  PERFORM public._monitoreo_assert_permiso();   -- resolver es potestad de Calidad/Monitoreo
  SELECT * INTO v_asig FROM tms_calidad_asignaciones WHERE id = p_asignacion_id;
  IF v_asig.id IS NULL THEN RAISE EXCEPTION 'Asignación % no encontrada', p_asignacion_id; END IF;
  IF v_asig.estado = 'ANULADA' THEN RAISE EXCEPTION 'La asignación está anulada'; END IF;
  SELECT id, nombre INTO v_user FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;

  UPDATE tms_calidad_asignaciones
     SET estado = v_estado,
         informe_id = coalesce(p_informe_id, informe_id),
         resuelto_por = CASE WHEN v_estado = 'RESUELTA' THEN v_user.id ELSE resuelto_por END,
         resuelto_nombre = CASE WHEN v_estado = 'RESUELTA' THEN v_user.nombre ELSE resuelto_nombre END,
         resuelto_en = CASE WHEN v_estado = 'RESUELTA' THEN now() ELSE resuelto_en END,
         updated_at = now()
   WHERE id = p_asignacion_id;

  RETURN jsonb_build_object('id', p_asignacion_id, 'estado', v_estado, 'informe_id', p_informe_id);
END;
$function$;

-- ── Anular asignación (Inventario que la creó, o Calidad/admin) ──────────────
CREATE OR REPLACE FUNCTION public.anular_asignacion_calidad(p_asignacion_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_asig tms_calidad_asignaciones;
BEGIN
  PERFORM public._asignacion_calidad_assert_permiso();
  SELECT * INTO v_asig FROM tms_calidad_asignaciones WHERE id = p_asignacion_id;
  IF v_asig.id IS NULL THEN RAISE EXCEPTION 'Asignación % no encontrada', p_asignacion_id; END IF;
  IF v_asig.estado = 'RESUELTA' THEN RAISE EXCEPTION 'La asignación ya fue resuelta; no se puede anular'; END IF;
  UPDATE tms_calidad_asignaciones SET estado = 'ANULADA', updated_at = now() WHERE id = p_asignacion_id;
  RETURN jsonb_build_object('id', p_asignacion_id, 'estado', 'ANULADA');
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.crear_asignacion_calidad(jsonb, text, text)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.resolver_asignacion_calidad(uuid, uuid, text)  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.anular_asignacion_calidad(uuid)                FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.crear_asignacion_calidad(jsonb, text, text)   TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.resolver_asignacion_calidad(uuid, uuid, text)  TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.anular_asignacion_calidad(uuid)                TO authenticated, service_role;
