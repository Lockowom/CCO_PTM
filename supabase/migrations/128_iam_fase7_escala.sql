-- ============================================================================
--  128_iam_fase7_escala.sql — Identity & Security · FASE 7 (Escala)
--  (29) Vista materializada de permisos efectivos + refresh (pg_cron).
--  (31) Carga masiva de usuarios (crea identidad auth real + perfil).
--  (30) Retención de auditoría: YA existe (cron `cleanup-auditoria-1y`); la
--       partición es innecesaria al volumen actual → no se añade.
--
--  IMPORTANTE: el gate caliente `usuario_tiene_algun_permiso` SIGUE leyendo la
--  vista VIVA `iam.user_effective_permissions` (no la MV) para NO tener retraso
--  en revocaciones. La MV es para lecturas de reporte a gran escala y queda
--  refrescada por cron. NO destructivo.
-- ============================================================================

-- ── (29) MV de permisos efectivos ───────────────────────────────────────────
create materialized view if not exists iam.mv_user_permissions as
select a.principal_id as user_id, p.codigo as permission,
       a.scope_type, a.scope_id, a.scope_code
from iam.assignments a
join iam.role_permissions rp on rp.role_id = a.role_id
join iam.permissions p on p.id = rp.permission_id
join iam.roles r on r.id = a.role_id and r.activo
where a.principal_type = 'user'
  and (a.expires_at is null or a.expires_at > now())
with data;

-- Índice único → habilita REFRESH ... CONCURRENTLY (sin bloquear lecturas).
create unique index if not exists mv_user_perms_uidx on iam.mv_user_permissions
  (user_id, permission, scope_type, coalesce(scope_id::text,''), coalesce(scope_code,''));

create or replace function authz.refresh_permissions()
returns void language plpgsql security definer set search_path = iam, authz, public as $$
begin
  refresh materialized view concurrently iam.mv_user_permissions;
end $$;

-- Refresco programado (incremental de facto: solo re-materializa lo cambiado en
-- coste de escaneo). pg_cron ya está instalado en el proyecto.
do $$ begin
  perform cron.schedule('refresh-iam-permissions', '*/5 * * * *', 'select authz.refresh_permissions();');
exception when others then null; end $$;

-- Refresco manual + stats (admin).
create or replace function public.iam_refrescar_permisos()
returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  perform authz.refresh_permissions();
  return jsonb_build_object('ok', true, 'filas', (select count(*) from iam.mv_user_permissions));
end $$;
revoke all on function public.iam_refrescar_permisos() from public, anon;
grant execute on function public.iam_refrescar_permisos() to authenticated;

create or replace function public.iam_permisos_stats()
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  return jsonb_build_object(
    'usuarios',       (select count(*) from iam.users where activo),
    'roles',          (select count(*) from iam.roles where activo),
    'permisos',       (select count(*) from iam.permissions),
    'asignaciones',   (select count(*) from iam.assignments),
    'con_ambito',     (select count(*) from iam.assignments where scope_type <> 'global'),
    'filas_mv',       (select count(*) from iam.mv_user_permissions),
    'pares_efectivos',(select count(*) from iam.user_effective_permissions)
  );
end $$;
revoke all on function public.iam_permisos_stats() from public, anon;
grant execute on function public.iam_permisos_stats() to authenticated;

-- ── (31) Carga masiva de usuarios ───────────────────────────────────────────
--  Cada fila: { nombre, email, rol, password? }. Crea la identidad auth real
--  (private.create_auth_user, igual que guardar_usuario) + el perfil; si el email
--  ya existe, ACTUALIZA nombre/rol (idempotente). Los triggers de Fase 1 espejan
--  a iam.*. Devuelve conteos, errores por fila y contraseñas GENERADAS (si no se
--  suministraron) para que el admin las distribuya.
create or replace function public.iam_bulk_usuarios(p_rows jsonb)
returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
declare
  r jsonb; v_nombre text; v_email text; v_rol text; v_pass text; v_genpass text;
  v_auth uuid; v_exist uuid; v_legacy text;
  v_creados int := 0; v_actualizados int := 0;
  v_errores jsonb := '[]'::jsonb; v_detalle jsonb := '[]'::jsonb;
begin
  if not private.is_admin() then raise exception 'Solo administradores pueden cargar usuarios'; end if;
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'Se espera un arreglo de filas'; end if;

  for r in select value from jsonb_array_elements(p_rows) loop
    begin
      v_nombre := btrim(coalesce(r->>'nombre',''));
      v_email  := lower(btrim(coalesce(r->>'email','')));
      v_rol    := nullif(btrim(coalesce(r->>'rol','')), '');
      v_pass   := nullif(r->>'password','');

      if v_nombre = '' or v_email = '' or v_rol is null then
        v_errores := v_errores || jsonb_build_object('email', v_email, 'error', 'nombre, email y rol son obligatorios'); continue;
      end if;
      if not exists (select 1 from public.tms_roles where id = v_rol) then
        v_errores := v_errores || jsonb_build_object('email', v_email, 'error', 'rol inexistente: '||v_rol); continue;
      end if;

      select id into v_exist from public.tms_usuarios where lower(email) = v_email limit 1;
      if v_exist is not null then
        update public.tms_usuarios set nombre = v_nombre, rol = v_rol, activo = true where id = v_exist;
        v_actualizados := v_actualizados + 1;
        v_detalle := v_detalle || jsonb_build_object('email', v_email, 'accion', 'actualizado');
      else
        v_genpass := coalesce(v_pass, upper(substr(md5(v_email||clock_timestamp()::text),1,4))||substr(md5(random()::text),1,6));
        v_auth := private.create_auth_user(v_email, v_genpass);
        v_legacy := 'USR-'||to_char(now(),'YYYYMMDDHH24MISS')||'-'||upper(substr(md5(random()::text),1,6));
        insert into public.tms_usuarios (id_usuario, nombre, email, auth_uid, rol, activo, es_admin_delegado)
        values (v_legacy, v_nombre, v_email, v_auth, v_rol, true, false);
        v_creados := v_creados + 1;
        v_detalle := v_detalle || jsonb_build_object('email', v_email, 'accion', 'creado',
                       'password', case when v_pass is null then v_genpass else null end);
      end if;
    exception when others then
      v_errores := v_errores || jsonb_build_object('email', coalesce(v_email,'?'), 'error', SQLERRM);
    end;
  end loop;

  return jsonb_build_object('ok', true, 'creados', v_creados, 'actualizados', v_actualizados,
                            'errores', v_errores, 'detalle', v_detalle);
end $$;
revoke all on function public.iam_bulk_usuarios(jsonb) from public, anon;
grant execute on function public.iam_bulk_usuarios(jsonb) to authenticated;
