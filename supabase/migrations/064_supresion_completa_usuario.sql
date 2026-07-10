-- 064 — Privacidad/Ley 21.719 (Bloque A): supresión COMPLETA de un usuario
-- (derecho de supresión). Antes, "eliminar usuario" solo borraba la fila de
-- tms_usuarios: la cuenta quedaba viva en auth.users (email + hash bcrypt
-- huérfanos), y su rastro nominativo persistía en el log de accesos, las
-- mediciones de productividad, los errores de picking y la auditoría.
--
-- Criterio aplicado (documentado para el registro de tratamiento):
--   * Se ELIMINA: cuenta auth, fila de usuario, log de accesos, presencia,
--     y las filas de auditoría del propio registro.
--   * Se ANONIMIZA (la fila operativa se conserva sin el nombre): mediciones
--     de tiempos, errores de picking, tickets TI.
--   * Se CONSERVA con nombre: firmas de certificados de calidad y columnas
--     creado_por_nombre de registros de calidad/inventario (trazabilidad
--     exigible del rubro médico — base de licitud: obligación legal/interés
--     legítimo; revisar con asesoría legal si se pide suprimir también).

CREATE OR REPLACE FUNCTION public.eliminar_usuario_completo(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_auth uuid; v_actor uuid := auth.uid();
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden eliminar usuarios';
  END IF;

  SELECT auth_uid INTO v_auth FROM tms_usuarios WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Usuario no encontrado'; END IF;

  -- Monitoreo/productividad: anonimizar (la métrica agregada sobrevive, el nombre no)
  UPDATE tms_mediciones_tiempos SET usuario_nombre = '(usuario eliminado)' WHERE usuario_id = p_id;
  UPDATE tms_errores_picking SET usuario_picking_nombre = '(usuario eliminado)' WHERE usuario_picking_id = p_id;
  UPDATE tms_errores_picking SET usuario_packing_nombre = '(usuario eliminado)' WHERE usuario_packing_id = p_id;
  UPDATE tms_tickets SET usuario_nombre = '(usuario eliminado)' WHERE usuario_id = p_id;

  -- Rastro directo: eliminar
  DELETE FROM tms_accesos WHERE usuario_id = p_id;
  DELETE FROM tms_usuarios_activos WHERE usuario_id = p_id;

  -- Fila principal (el trigger de auditoría registra el DELETE con sus datos…)
  DELETE FROM tms_usuarios WHERE id = p_id;
  -- …y acto seguido se elimina TODO el rastro de auditoría de ese registro
  -- (incluida esa última entrada), dejando solo una marca anónima de supresión.
  DELETE FROM tms_auditoria WHERE tabla = 'tms_usuarios' AND registro_id = p_id::text;
  INSERT INTO tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
  VALUES (v_actor, 'ADMIN', 'tms_usuarios', 'SUPRESION_COMPLETA', p_id::text, NULL, NULL);

  -- Cuenta de autenticación (email + hash): eliminar de auth.users
  -- (las identities/sesiones caen por cascade de Supabase).
  IF v_auth IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_auth;
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.eliminar_usuario_completo(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.eliminar_usuario_completo(uuid) TO authenticated, service_role;
