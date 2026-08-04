-- Misma autorización, pero auth.uid()/is_admin() se evalúan una vez por
-- consulta en lugar de una vez por cada fila que PostgreSQL inspecciona.
DROP POLICY IF EXISTS tickets_select_own_or_admin ON public.tms_tickets;
CREATE POLICY tickets_select_own_or_admin
  ON public.tms_tickets
  FOR SELECT
  TO public
  USING (
    usuario_id = (
      SELECT tms_usuarios.id::text
      FROM public.tms_usuarios
      WHERE tms_usuarios.auth_uid = (SELECT auth.uid())
    )
    OR (SELECT public.is_admin())
  );

DROP POLICY IF EXISTS auth_all_usuarios_activos ON public.tms_usuarios_activos;
CREATE POLICY auth_all_usuarios_activos
  ON public.tms_usuarios_activos
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Índices de cobertura para claves foráneas señaladas por el advisor. No
-- cambian el modelo de datos ni las reglas de acceso.
CREATE INDEX IF NOT EXISTS iam_assignments_role_id_idx
  ON iam.assignments (role_id);
CREATE INDEX IF NOT EXISTS iam_delegations_role_id_idx
  ON iam.delegations (role_id);
CREATE INDEX IF NOT EXISTS iam_teams_departamento_id_idx
  ON iam.teams (departamento_id);
CREATE INDEX IF NOT EXISTS iam_users_cd_id_idx
  ON iam.users (cd_id);
CREATE INDEX IF NOT EXISTS iam_users_sucursal_id_idx
  ON iam.users (sucursal_id);
CREATE INDEX IF NOT EXISTS notificacion_evento_id_idx
  ON public.notificacion (evento_id);
CREATE INDEX IF NOT EXISTS tms_nv_reaperturas_resuelta_por_idx
  ON public.tms_nv_reaperturas (resuelta_por);
CREATE INDEX IF NOT EXISTS tms_nv_reaperturas_solicitada_por_idx
  ON public.tms_nv_reaperturas (solicitada_por);
CREATE INDEX IF NOT EXISTS tms_operaciones_reapertura_aprobada_por_idx
  ON public.tms_operaciones (reapertura_aprobada_por);
CREATE INDEX IF NOT EXISTS tms_transporte_ordenes_vehiculo_id_idx
  ON public.tms_transporte_ordenes (vehiculo_id);
CREATE INDEX IF NOT EXISTS workflow_transition_desde_idx
  ON public.workflow_transition (workflow, desde);
CREATE INDEX IF NOT EXISTS workflow_transition_hasta_idx
  ON public.workflow_transition (workflow, hasta);
CREATE INDEX IF NOT EXISTS workflow_transition_permiso_id_idx
  ON public.workflow_transition (permiso_id);
