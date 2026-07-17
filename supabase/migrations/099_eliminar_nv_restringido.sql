-- 099_eliminar_nv_restringido.sql
-- (1) Restringe la ELIMINACIÓN de N.V. (Panel → Ingresar) a solo dos perfiles:
--     administradores + María Angélica (angelica@ptm.cl). El resto de las
--     escrituras (crear/editar/cambiar estado) sigue con manage_panel; solo el
--     borrado destructivo se blinda.
-- (2) Corrige un bug de la migración 098: _panel_actor() cruzaba tms_usuarios
--     por `id` cuando la clave contra auth.uid() es `auth_uid` → el nombre del
--     operador nunca resolvía y caía al UUID. Ahora usa auth_uid.

-- ── (2) Fix _panel_actor: la clave correcta es auth_uid ─────────────────────
create or replace function public._panel_actor()
returns text
language sql
security definer
set search_path to 'public'
stable
as $$
  select coalesce(
    (select nullif(trim(u.nombre), '') from public.tms_usuarios u where u.auth_uid = auth.uid()),
    (select u.email from public.tms_usuarios u where u.auth_uid = auth.uid()),
    nullif(auth.uid()::text, ''),
    'sistema'
  );
$$;

-- ── (1) Allowlist de eliminación de N.V. ────────────────────────────────────
-- Gate propio: admin (o delegado) SIEMPRE; además, usuarios activos cuyo email
-- esté en la lista. Se deja como array para poder sumar/quitar personas con un
-- simple CREATE OR REPLACE, sin tocar el resto del sistema de permisos (que es
-- por ROL y filtraría a todos los SUPERVISOR_, no solo a Angélica).
create or replace function public._panel_puede_eliminar_nv()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(private.is_admin(), false)
      or exists (
        select 1 from public.tms_usuarios u
        where u.auth_uid = auth.uid()
          and u.activo
          and lower(u.email) = any (array['angelica@ptm.cl'])
      );
$$;

revoke all on function public._panel_puede_eliminar_nv() from public, anon;
grant execute on function public._panel_puede_eliminar_nv() to authenticated;

-- ── eliminar_nv ahora usa el gate restringido (antes: _panel_puede_escribir) ─
create or replace function public.eliminar_nv(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare r public.tms_operaciones;
begin
  if not public._panel_puede_eliminar_nv() then
    raise exception 'No autorizado para eliminar N.V. (solo administradores y personal habilitado)';
  end if;
  delete from public.tms_operaciones where id = p_id returning * into r;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;
  insert into public.tms_operaciones_log (oper_id, accion, nv, despues, actor)
  values (p_id, 'delete', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), to_jsonb(r), public._panel_actor());
  return jsonb_build_object('ok', true, 'id', p_id);
end; $function$;
