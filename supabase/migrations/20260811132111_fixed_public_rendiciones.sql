begin;

-- Un único acceso operativo sin secreto visible en el navegador. La Edge
-- Function resuelve internamente esta fila y conserva todas las validaciones,
-- límites por IP y el bucket privado existentes.
alter table public.rendicion_public_links
  add column if not exists es_public_default boolean not null default false;

create unique index if not exists rendicion_public_links_one_default_idx
  on public.rendicion_public_links (es_public_default)
  where es_public_default;

insert into public.rendicion_public_links (
  nombre,
  token_hash,
  activo,
  es_public_default,
  max_submissions
)
select
  U&'Rendiciones t\00E9cnicos PTM',
  encode(gen_random_bytes(32), 'hex'),
  true,
  true,
  null
where not exists (
  select 1
  from public.rendicion_public_links
  where es_public_default
);

create or replace function public.rendicion_admin_dashboard(p_limit integer default 100)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare v_ok boolean; v_result jsonb;
begin
  v_ok := coalesce(public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']), false);
  if not v_ok then raise exception 'Acceso denegado'; end if;
  select jsonb_build_object(
    'rendiciones', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select r.id,
             'REN-' || extract(year from r.fecha_rendicion)::int || '-' || lpad(r.folio::text,6,'0') as folio,
             r.fecha_rendicion, r.responsable_nombre, r.centro_costo_codigo,
             r.centro_costo_nombre, r.tipo_fondo, r.estado, r.total, r.created_at,
             (select count(*) from public.rendicion_items i where i.rendicion_id=r.id) as items,
             (select count(*) from public.rendicion_fotos f where f.rendicion_id=r.id) as fotos
      from public.rendiciones r order by r.created_at desc limit greatest(1,least(coalesce(p_limit,100),500))
    ) x), '[]'::jsonb),
    'links', coalesce((select jsonb_agg(to_jsonb(l) order by l.es_public_default desc, l.created_at desc) from (
      select id,nombre,activo,expires_at,max_submissions,submissions_count,created_at,es_public_default
      from public.rendicion_public_links order by es_public_default desc, created_at desc limit 100
    ) l), '[]'::jsonb),
    'centros', coalesce((select jsonb_agg(to_jsonb(c) order by c.codigo) from (
      select id,codigo,nombre,activo from public.rendicion_centros_costo
    ) c), '[]'::jsonb),
    'colaboradores', coalesce((select jsonb_agg(to_jsonb(c) order by c.nombre) from (
      select id,nombre,activo from public.rendicion_colaboradores
    ) c), '[]'::jsonb),
    'storage', jsonb_build_object(
      'archivos', (select count(*) from public.rendicion_fotos),
      'rendicion_bytes', (select coalesce(sum(bytes),0) from public.rendicion_fotos),
      'bytes', (select coalesce(sum((metadata->>'size')::bigint),0) from storage.objects)
    )
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.rendicion_admin_toggle_link(p_id uuid, p_activo boolean)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']), false) then
    raise exception 'Acceso denegado';
  end if;
  if exists (
    select 1 from public.rendicion_public_links
    where id = p_id and es_public_default
  ) then
    raise exception '%', U&'El enlace principal de t\00E9cnicos no se puede desactivar';
  end if;
  update public.rendicion_public_links set activo=p_activo,updated_at=now() where id=p_id;
  if not found then raise exception 'Enlace no encontrado'; end if;
  return true;
end;
$$;

revoke all on function public.rendicion_admin_dashboard(integer) from public, anon;
revoke all on function public.rendicion_admin_toggle_link(uuid,boolean) from public, anon;
grant execute on function public.rendicion_admin_dashboard(integer) to authenticated, service_role;
grant execute on function public.rendicion_admin_toggle_link(uuid,boolean) to authenticated, service_role;

commit;
