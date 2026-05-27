-- ============================================================
-- MIGRACIÓN: Custom Auth → Supabase Auth
-- Fecha: 2026-05-26
-- Descripción: Migra la autenticación custom (verify_user_password RPC + bcrypt)
--              a Supabase Auth nativo. Crea funciones auxiliares para admin
--              de usuarios y helpers para RLS.
-- ============================================================

-- 1. Agregar columna auth_uid para vincular tms_usuarios con auth.users
ALTER TABLE tms_usuarios ADD COLUMN IF NOT EXISTS auth_uid UUID UNIQUE;

-- 2. Función para crear usuarios en auth.users (admin)
-- Usada por Users.jsx al crear nuevos usuarios
CREATE OR REPLACE FUNCTION create_auth_user(p_email TEXT, p_password TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    LOWER(p_email),
    crypt(p_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '{}'::jsonb
  )
  RETURNING id INTO new_user_id;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', LOWER(p_email)),
    'email',
    new_user_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  RETURN new_user_id;
END;
$$;

-- 3. Función para actualizar contraseña (admin)
CREATE OR REPLACE FUNCTION update_auth_password(p_auth_uid UUID, p_new_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE id = p_auth_uid;
END;
$$;

-- 4. Helper RLS: obtener rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.rol FROM tms_usuarios u
  WHERE u.auth_uid = auth.uid()
$$;

-- 5. Helper RLS: verificar si es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tms_usuarios u
    WHERE u.auth_uid = auth.uid()
    AND (u.rol = 'ADMIN' OR u.es_admin_delegado = true)
  )
$$;

-- 6. Migración de usuarios existentes (one-time)
-- Inserta cada usuario de tms_usuarios en auth.users con su hash bcrypt original
-- y vincula via auth_uid
DO $$
DECLARE
  usr RECORD;
  new_auth_id UUID;
BEGIN
  FOR usr IN
    SELECT id, email, password_hash, nombre
    FROM tms_usuarios
    WHERE auth_uid IS NULL
  LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at, confirmation_token,
      raw_app_meta_data, raw_user_meta_data
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      LOWER(usr.email),
      usr.password_hash,
      NOW(),
      NOW(),
      NOW(),
      '',
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      jsonb_build_object('nombre', usr.nombre)
    )
    RETURNING id INTO new_auth_id;

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      new_auth_id,
      jsonb_build_object('sub', new_auth_id::text, 'email', LOWER(usr.email)),
      'email',
      new_auth_id::text,
      NOW(),
      NOW(),
      NOW()
    );

    UPDATE tms_usuarios SET auth_uid = new_auth_id WHERE id = usr.id;
  END LOOP;
END;
$$;

-- 7. FIX CRÍTICO: GoTrue (Go) no puede escanear NULL a string
-- Los campos de auth.users que GoTrue lee como string DEBEN ser '' (vacío), no NULL
UPDATE auth.users
SET
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  confirmation_token = COALESCE(confirmation_token, '')
WHERE email_change IS NULL
   OR phone_change IS NULL
   OR phone_change_token IS NULL
   OR recovery_token IS NULL
   OR reauthentication_token IS NULL
   OR email_change_token_new IS NULL
   OR email_change_token_current IS NULL;

-- NOTA: Migración ejecutada manualmente el 2026-05-26.
-- 21 usuarios migrados + fix NULLs aplicado.
