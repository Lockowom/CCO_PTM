-- ⚠️ OBSOLETO: esta función fue ELIMINADA por la migración 006_remove_legacy_password_auth.sql
-- (junto con la columna tms_usuarios.password_hash). Se conserva el archivo solo como historia.
-- No re-ejecutar: reintroduciría auth legacy ya retirada.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION verify_user_password(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  email TEXT,
  rol TEXT,
  activo BOOLEAN,
  es_admin_delegado BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.nombre::TEXT,
    u.email::TEXT,
    u.rol::TEXT,
    u.activo,
    u.es_admin_delegado
  FROM tms_usuarios u
  WHERE LOWER(u.email) = LOWER(p_email)
    AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$;
