-- 063 — Privacidad/Ley 21.719 (Bloque A, hallazgo S4): RLS de las tablas con
-- datos personales. Antes, CUALQUIER usuario autenticado podía leer vía API el
-- directorio completo (emails, push tokens, presencia), los RUT/teléfonos de
-- conductores, los correos íntegros de clientes, las mediciones de tiempos de
-- todos y el log de accesos. Ahora cada tabla se lee solo con el permiso que
-- corresponde ("acceso según necesidad"). Las escrituras importantes ya iban
-- por RPCs SECURITY DEFINER (bypassean RLS con gate propio), así que no cambian.

-- Helper: ¿el usuario actual (activo) tiene alguno de estos permisos?
-- SECURITY DEFINER para poder consultarse desde políticas de tms_usuarios sin
-- recursión. ADMIN y admin delegado siempre pasan.
CREATE OR REPLACE FUNCTION public.usuario_tiene_algun_permiso(p_perms text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tms_usuarios u
    LEFT JOIN tms_roles r ON r.id = u.rol
    WHERE u.auth_uid = auth.uid() AND u.activo
      AND (u.rol = 'ADMIN' OR u.es_admin_delegado OR r.permisos_json ?| p_perms)
  );
$$;
REVOKE EXECUTE ON FUNCTION public.usuario_tiene_algun_permiso(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.usuario_tiene_algun_permiso(text[]) TO authenticated, service_role;

-- ── tms_usuarios: cada quien ve SOLO su fila; admins ven todo ────────────────
-- (el match por email cubre el primer login, cuando auth_uid aún no se enlazó)
DROP POLICY IF EXISTS usuarios_select_auth ON public.tms_usuarios;
CREATE POLICY usuarios_select_self_or_admin ON public.tms_usuarios
  FOR SELECT USING (
    auth_uid = auth.uid()
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR public.is_admin()
  );

-- ── tms_conductores (RUT, teléfono, patente) ────────────────────────────────
DROP POLICY IF EXISTS auth_all_conductores ON public.tms_conductores;
CREATE POLICY conductores_select ON public.tms_conductores
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.usuario_tiene_algun_permiso(ARRAY[
      'view_drivers','manage_drivers','view_control_tower','manage_control_tower',
      'view_tms_dashboard','view_dashboard','view_routes','create_routes',
      'view_mobile_app','use_mobile_app','view_sales_status'
    ])
  );
CREATE POLICY conductores_insert ON public.tms_conductores
  FOR INSERT WITH CHECK (
    user_id = auth.uid()  -- auto-registro del propio conductor en la app
    OR public.usuario_tiene_algun_permiso(ARRAY['manage_drivers'])
  );
CREATE POLICY conductores_update ON public.tms_conductores
  FOR UPDATE USING (
    user_id = auth.uid()
    OR public.usuario_tiene_algun_permiso(ARRAY['manage_drivers','manage_control_tower','use_mobile_app'])
  );
CREATE POLICY conductores_delete ON public.tms_conductores
  FOR DELETE USING (public.usuario_tiene_algun_permiso(ARRAY['manage_drivers']));

-- ── Post-Venta (correos íntegros de clientes y terceros) ────────────────────
DROP POLICY IF EXISTS tms_postventa_correos_sel ON public.tms_postventa_correos;
CREATE POLICY pv_correos_select ON public.tms_postventa_correos
  FOR SELECT USING (public.usuario_tiene_algun_permiso(ARRAY['view_postventa','manage_postventa','supervise_postventa']));

DROP POLICY IF EXISTS tms_postventa_tickets_sel ON public.tms_postventa_tickets;
CREATE POLICY pv_tickets_select ON public.tms_postventa_tickets
  FOR SELECT USING (public.usuario_tiene_algun_permiso(ARRAY[
    'view_postventa','manage_postventa','supervise_postventa',
    'manage_quality','manage_monitoreo'  -- Calidad ve los tickets que derivó
  ]));

DROP POLICY IF EXISTS tms_postventa_tecnicos_sel ON public.tms_postventa_tecnicos;
CREATE POLICY pv_tecnicos_select ON public.tms_postventa_tecnicos
  FOR SELECT USING (public.usuario_tiene_algun_permiso(ARRAY['view_postventa','manage_postventa','supervise_postventa']));

DROP POLICY IF EXISTS tms_postventa_descartados_sel ON public.tms_postventa_descartados;
CREATE POLICY pv_descartados_select ON public.tms_postventa_descartados
  FOR SELECT USING (public.is_admin());

-- El lector de hilos usa esta RPC (SECURITY DEFINER, bypassa RLS): se le añade
-- el mismo gate para que no quede como puerta lateral.
CREATE OR REPLACE FUNCTION public.pv_correos_ticket(p_numero text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v jsonb;
BEGIN
  IF NOT (auth.role() = 'service_role'
          OR public.usuario_tiene_algun_permiso(ARRAY['view_postventa','manage_postventa','supervise_postventa'])) THEN
    RAISE EXCEPTION 'Sin permiso para leer correos de Post-Venta';
  END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id_correo', c.id_correo, 'remitente_nombre', c.remitente_nombre, 'remitente_email', c.remitente_email,
      'para', c.para, 'cc', c.cc, 'asunto', c.asunto, 'cuerpo', c.cuerpo, 'adjuntos', c.adjuntos,
      'recibido', c.recibido) ORDER BY c.recibido, c.created_at, c.id), '[]'::jsonb)
  INTO v
  FROM tms_postventa_correos c JOIN tms_postventa_tickets t ON t.id = c.ticket_id
  WHERE t.numero = p_numero;
  RETURN v;
END $$;
REVOKE EXECUTE ON FUNCTION public.pv_correos_ticket(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pv_correos_ticket(text) TO authenticated, service_role;

-- ── tms_accesos (log de logins): solo se inserta al loguear; solo admin lee ──
DROP POLICY IF EXISTS auth_all_accesos ON public.tms_accesos;
CREATE POLICY accesos_insert ON public.tms_accesos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY accesos_select_admin ON public.tms_accesos
  FOR SELECT USING (public.is_admin());

-- ── tms_mediciones_tiempos (productividad nominativa) ───────────────────────
DROP POLICY IF EXISTS auth_all_mediciones ON public.tms_mediciones_tiempos;
CREATE POLICY mediciones_rw_outbound ON public.tms_mediciones_tiempos
  FOR ALL USING (public.usuario_tiene_algun_permiso(ARRAY[
    'process_picking','process_packing','view_picking','view_packing','view_packing_tv'
  ]))
  WITH CHECK (public.usuario_tiene_algun_permiso(ARRAY['process_picking','process_packing']));

-- ── tms_errores_picking (errores atribuidos con nombre) ─────────────────────
DROP POLICY IF EXISTS auth_all_errores_picking ON public.tms_errores_picking;
CREATE POLICY errores_insert_packing ON public.tms_errores_picking
  FOR INSERT WITH CHECK (public.usuario_tiene_algun_permiso(ARRAY['process_packing']));
CREATE POLICY errores_select_admin ON public.tms_errores_picking
  FOR SELECT USING (public.is_admin());
