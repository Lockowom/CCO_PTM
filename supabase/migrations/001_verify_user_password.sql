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
