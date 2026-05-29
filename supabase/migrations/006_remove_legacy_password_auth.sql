-- ============================================================
-- MIGRACIÓN 006: Eliminar legacy de auth pre-Supabase Auth
-- Fecha: 2026-05-29
-- ============================================================
-- Contexto: 21/21 usuarios migrados a auth.users (auth_uid no nulo). La función
-- verify_user_password() comparaba contra tms_usuarios.password_hash, columna que era
-- legible por cualquier usuario autenticado (exposición de hashes bcrypt legacy).
-- El cliente ya no referencia la función (se quitó el fallback de login en AuthContext)
-- ni la columna (se quitó de Users.jsx). Reemplaza a 001_verify_user_password.sql.
-- ============================================================

DROP FUNCTION IF EXISTS public.verify_user_password(text, text);
ALTER TABLE public.tms_usuarios DROP COLUMN IF EXISTS password_hash;
