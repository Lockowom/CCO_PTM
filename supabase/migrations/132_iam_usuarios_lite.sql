-- ============================================================================
--  132_iam_usuarios_lite.sql — Lista ligera de usuarios (selectores)
--  id + nombre de usuarios activos, accesible a cualquier autenticado (p.ej.
--  delegar cobertura en la página de Seguridad). Solo nombres, baja sensibilidad.
-- ============================================================================
create or replace function public.iam_usuarios_lite()
returns jsonb language sql stable security definer set search_path = public, iam as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', u.id, 'nombre', u.nombre) order by u.nombre), '[]'::jsonb)
  from iam.users u where u.activo;
$$;
revoke all on function public.iam_usuarios_lite() from public, anon;
grant execute on function public.iam_usuarios_lite() to authenticated;
