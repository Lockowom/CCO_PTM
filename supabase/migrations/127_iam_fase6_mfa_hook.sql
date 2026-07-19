-- ============================================================================
--  127_iam_fase6_mfa_hook.sql — Identity & Security · FASE 6 (Seguridad avanzada)
--  MFA (TOTP) es nativo de Supabase Auth (auth.mfa_factors) → se opera desde el
--  cliente (enroll/challenge/verify). Aquí: el ESPEJO de estado (mfa_enabled),
--  el hook de claims IAM en el JWT (listo para activar en el Dashboard) y AAL/MFA
--  en el listado de sesiones. OAuth/SSO requieren secretos de proveedor en el
--  Dashboard (no se pueden fijar desde aquí) → documentados, no forzados.
--  NO destructivo.
-- ============================================================================

-- Espejo del estado MFA (iam.users.mfa_enabled ya existe desde Fase 0).
alter table public.tms_usuarios add column if not exists mfa_enabled boolean not null default false;

-- ── Estado MFA del usuario en sesión (lee auth.mfa_factors) ─────────────────
create or replace function public.iam_mfa_estado()
returns jsonb language sql stable security definer set search_path = public, iam, auth as $$
  select jsonb_build_object(
    'enabled', exists (
      select 1 from auth.mfa_factors f
      where f.user_id = auth.uid() and f.status = 'verified'),
    'factors', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id, 'type', f.factor_type, 'status', f.status,
        'nombre', f.friendly_name, 'created_at', f.created_at) order by f.created_at)
      from auth.mfa_factors f where f.user_id = auth.uid()), '[]'::jsonb)
  );
$$;
revoke all on function public.iam_mfa_estado() from public, anon;
grant execute on function public.iam_mfa_estado() to authenticated;

-- ── Sincroniza mfa_enabled (espejo) tras enroll/unenroll ────────────────────
create or replace function public.iam_mfa_sync()
returns jsonb language plpgsql security definer set search_path = public, iam, auth as $$
declare v_enabled boolean;
begin
  v_enabled := exists (select 1 from auth.mfa_factors f
                       where f.user_id = auth.uid() and f.status = 'verified');
  update iam.users set mfa_enabled = v_enabled, updated_at = now() where id = auth.uid();
  update public.tms_usuarios set mfa_enabled = v_enabled where auth_uid = auth.uid();
  return jsonb_build_object('ok', true, 'mfa_enabled', v_enabled);
end $$;
revoke all on function public.iam_mfa_sync() from public, anon;
grant execute on function public.iam_mfa_sync() to authenticated;

-- ── Sesiones: + AAL (nivel de aseguramiento) y flag MFA ─────────────────────
create or replace function public.iam_sesiones()
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz, auth as $$
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'session_id', s.id, 'auth_uid', s.user_id,
      'usuario_id', tu.id, 'nombre', coalesce(tu.nombre,'(desconocido)'),
      'correo', tu.email, 'rol', tu.rol,
      'ip', host(s.ip), 'user_agent', s.user_agent,
      'created_at', s.created_at, 'refreshed_at', s.refreshed_at, 'not_after', s.not_after,
      'aal', s.aal,
      'mfa', exists (select 1 from auth.mfa_factors f where f.user_id = s.user_id and f.status='verified'),
      'estado', ua.estado, 'modulo', ua.modulo_actual, 'ultima_actividad', ua.ultima_actividad
    ) order by s.refreshed_at desc nulls last, s.created_at desc)
    from auth.sessions s
    left join public.tms_usuarios tu on tu.auth_uid = s.user_id
    left join public.tms_usuarios_activos ua on ua.usuario_id = tu.id
  ), '[]'::jsonb);
end $$;
revoke all on function public.iam_sesiones() from public, anon;
grant execute on function public.iam_sesiones() to authenticated;

-- ── Custom Access Token Hook: inyecta claims IAM en el JWT ──────────────────
--  INERTE hasta activarlo: Dashboard → Authentication → Hooks →
--  "Customize Access Token (JWT) Claims" → seleccionar iam.custom_access_token_hook.
--  Agrega claims.app_metadata.iam = { rol, es_admin, permisos[] }.
create or replace function iam.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable security definer set search_path = iam, public as $$
declare
  v_uid uuid := (event->>'user_id')::uuid;
  v_rol text;
  v_perms jsonb;
  v_claims jsonb := coalesce(event->'claims', '{}'::jsonb);
  v_app jsonb;
begin
  select rol into v_rol from public.tms_usuarios where auth_uid = v_uid and coalesce(activo,true) limit 1;
  select coalesce(jsonb_agg(distinct e.permission), '[]'::jsonb) into v_perms
    from iam.user_effective_permissions e where e.user_id = v_uid;
  v_app := coalesce(v_claims->'app_metadata', '{}'::jsonb)
           || jsonb_build_object('iam', jsonb_build_object(
                'rol', v_rol, 'es_admin', (v_rol = 'ADMIN'), 'permisos', v_perms));
  v_claims := jsonb_set(v_claims, '{app_metadata}', v_app, true);
  return jsonb_set(event, '{claims}', v_claims, true);
end $$;
grant execute on function iam.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant usage on schema iam to supabase_auth_admin;
grant select on iam.user_effective_permissions to supabase_auth_admin;
