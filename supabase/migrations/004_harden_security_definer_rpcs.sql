-- ============================================================
-- MIGRACIÓN 004: Endurecer RPCs SECURITY DEFINER expuestas a anon
-- Fecha: 2026-05-29
-- Origen: Supabase security advisors (lints 0011/0016/0028/0029)
-- ============================================================
-- Problema:
--   public.bulk_upsert y public.search_batches eran SECURITY DEFINER y ejecutables
--   por el rol 'anon' (vía /rest/v1/rpc/...) → escritura/lectura SIN autenticación.
--   Además tenían search_path mutable, y mv_dashboard_kpis era seleccionable por anon.
-- Seguro:
--   La app llama estas RPC siempre autenticada; 'authenticated' conserva acceso.
--   get_dashboard_kpis() es SECURITY INVOKER, por lo que 'authenticated' DEBE conservar
--   SELECT sobre mv_dashboard_kpis (solo se revoca a 'anon').
-- ============================================================

-- 1) Fijar search_path (incluye 'extensions' para pg_trgm.similarity en search_batches)
ALTER FUNCTION public.bulk_upsert(text, jsonb, text)   SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.search_batches(text, integer)     SET search_path = public, extensions, pg_temp;

-- 2) Revocar EXECUTE de PUBLIC y anon
REVOKE EXECUTE ON FUNCTION public.bulk_upsert(text, jsonb, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.search_batches(text, integer)   FROM PUBLIC, anon;

-- 3) Garantizar acceso autenticado (idempotente)
GRANT EXECUTE ON FUNCTION public.bulk_upsert(text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_batches(text, integer)   TO authenticated;

-- 4) Quitar la materialized view del rol anon
REVOKE SELECT ON public.mv_dashboard_kpis FROM anon;
