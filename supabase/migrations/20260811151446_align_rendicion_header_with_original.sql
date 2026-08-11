-- Metadatos necesarios para reproducir la cabecera de la planilla original.
-- Se mantienen en el catalogo y se copian como snapshot en cada rendicion.

alter table public.rendicion_colaboradores
  add column if not exists rut text,
  add column if not exists direccion_area text,
  add column if not exists unidad text,
  add column if not exists tecnico text;

alter table public.rendiciones
  add column if not exists responsable_rut text,
  add column if not exists direccion_area text,
  add column if not exists unidad text,
  add column if not exists tecnico text;

alter table public.rendicion_colaboradores
  drop constraint if exists rendicion_colaborador_rut_formato,
  drop constraint if exists rendicion_colaborador_direccion_letras,
  drop constraint if exists rendicion_colaborador_unidad_letras,
  drop constraint if exists rendicion_colaborador_tecnico_letras;

alter table public.rendicion_colaboradores
  add constraint rendicion_colaborador_rut_formato
    check (rut is null or rut ~ '^[0-9]{1,2}(\.?[0-9]{3}){2}-[0-9Kk]$'),
  add constraint rendicion_colaborador_direccion_letras
    check (direccion_area is null or direccion_area ~* '[[:alpha:]áéíóúñü]'),
  add constraint rendicion_colaborador_unidad_letras
    check (unidad is null or unidad ~* '[[:alpha:]áéíóúñü]'),
  add constraint rendicion_colaborador_tecnico_letras
    check (tecnico is null or tecnico ~* '[[:alpha:]áéíóúñü]');

-- Datos conocidos del documento de referencia entregado por el negocio.
update public.rendicion_colaboradores
set rut = coalesce(rut, '16.068.403-8'),
    direccion_area = coalesce(direccion_area, 'Operaciones'),
    unidad = coalesce(unidad, 'PV - ST'),
    tecnico = coalesce(tecnico, 'David Fuentes'),
    updated_at = now()
where lower(btrim(nombre)) = 'oscar leiva';

create or replace function public.rendicion_snapshot_colaborador()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_colaborador public.rendicion_colaboradores%rowtype;
begin
  select * into v_colaborador
  from public.rendicion_colaboradores
  where id = new.responsable_id;

  if v_colaborador.id is null then
    raise exception 'Responsable invalido';
  end if;

  new.responsable_rut := v_colaborador.rut;
  new.direccion_area := v_colaborador.direccion_area;
  new.unidad := v_colaborador.unidad;
  new.tecnico := v_colaborador.tecnico;
  return new;
end;
$$;

drop trigger if exists trg_rendicion_snapshot_colaborador on public.rendiciones;
create trigger trg_rendicion_snapshot_colaborador
before insert on public.rendiciones
for each row execute function public.rendicion_snapshot_colaborador();

-- Completa documentos existentes sin alterar los valores ya congelados.
update public.rendiciones r
set responsable_rut = coalesce(r.responsable_rut, c.rut),
    direccion_area = coalesce(r.direccion_area, c.direccion_area),
    unidad = coalesce(r.unidad, c.unidad),
    tecnico = coalesce(r.tecnico, c.tecnico)
from public.rendicion_colaboradores c
where c.id = r.responsable_id
  and (
    r.responsable_rut is null
    or r.direccion_area is null
    or r.unidad is null
    or r.tecnico is null
  );

create or replace function public.rendicion_admin_colaboradores_detalle()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not coalesce(
    public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']),
    false
  ) then
    raise exception 'Acceso denegado';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', id,
        'nombre', nombre,
        'rut', rut,
        'direccion_area', direccion_area,
        'unidad', unidad,
        'tecnico', tecnico,
        'activo', activo
      ) order by nombre
    )
    from public.rendicion_colaboradores
  ), '[]'::jsonb);
end;
$$;

create or replace function public.rendicion_admin_guardar_colaborador_detalle(
  p_id uuid,
  p_nombre text,
  p_rut text default null,
  p_direccion_area text default null,
  p_unidad text default null,
  p_tecnico text default null,
  p_activo boolean default true
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text;
  v_rut text;
  v_direccion text;
  v_unidad text;
  v_tecnico text;
  v_id uuid;
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']), false) then
    raise exception 'Acceso denegado';
  end if;

  v_nombre := nullif(regexp_replace(btrim(translate(coalesce(p_nombre,''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g'), '');
  v_rut := nullif(regexp_replace(btrim(coalesce(p_rut,'')), '\s+', '', 'g'), '');
  v_direccion := nullif(regexp_replace(btrim(translate(coalesce(p_direccion_area,''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g'), '');
  v_unidad := nullif(regexp_replace(btrim(translate(coalesce(p_unidad,''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g'), '');
  v_tecnico := nullif(regexp_replace(btrim(translate(coalesce(p_tecnico,''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g'), '');

  if v_nombre is null or length(v_nombre) > 120 or v_nombre !~* '[[:alpha:]áéíóúñü]' then
    raise exception 'El nombre debe contener letras reales';
  end if;
  if v_rut is not null and v_rut !~ '^[0-9]{1,2}(\.?[0-9]{3}){2}-[0-9Kk]$' then
    raise exception 'RUT invalido. Usa formato 12.345.678-9';
  end if;
  if v_direccion is not null and (length(v_direccion) > 120 or v_direccion !~* '[[:alpha:]áéíóúñü]') then
    raise exception 'Direccion/area invalida';
  end if;
  if v_unidad is not null and (length(v_unidad) > 80 or v_unidad !~* '[[:alpha:]áéíóúñü]') then
    raise exception 'Unidad invalida';
  end if;
  if v_tecnico is not null and (length(v_tecnico) > 120 or v_tecnico !~* '[[:alpha:]áéíóúñü]') then
    raise exception 'Tecnico invalido';
  end if;

  if p_id is null then
    insert into public.rendicion_colaboradores (
      nombre, rut, direccion_area, unidad, tecnico, activo
    ) values (
      v_nombre, v_rut, v_direccion, v_unidad, v_tecnico, coalesce(p_activo, true)
    ) returning id into v_id;
  else
    update public.rendicion_colaboradores
    set nombre = v_nombre,
        rut = v_rut,
        direccion_area = v_direccion,
        unidad = v_unidad,
        tecnico = v_tecnico,
        activo = coalesce(p_activo, true),
        updated_at = now()
    where id = p_id
    returning id into v_id;
  end if;

  if v_id is null then raise exception 'Colaborador no encontrado'; end if;

  -- Completa informes antiguos que nacieron sin estos datos. Los valores ya
  -- congelados se preservan para no alterar el historial documental.
  update public.rendiciones
  set responsable_rut = coalesce(responsable_rut, v_rut),
      direccion_area = coalesce(direccion_area, v_direccion),
      unidad = coalesce(unidad, v_unidad),
      tecnico = coalesce(tecnico, v_tecnico),
      updated_at = now()
  where responsable_id = v_id
    and (
      responsable_rut is null
      or direccion_area is null
      or unidad is null
      or tecnico is null
    );

  return v_id;
end;
$$;

revoke all on function public.rendicion_snapshot_colaborador() from public, anon, authenticated;
revoke all on function public.rendicion_admin_colaboradores_detalle() from public, anon;
revoke all on function public.rendicion_admin_guardar_colaborador_detalle(uuid,text,text,text,text,text,boolean) from public, anon;
grant execute on function public.rendicion_admin_colaboradores_detalle() to authenticated, service_role;
grant execute on function public.rendicion_admin_guardar_colaborador_detalle(uuid,text,text,text,text,text,boolean) to authenticated, service_role;

comment on column public.rendiciones.responsable_rut is 'Snapshot del RUT del responsable al enviar la rendicion.';
comment on column public.rendiciones.direccion_area is 'Snapshot de direccion o area del responsable.';
comment on column public.rendiciones.unidad is 'Snapshot de la unidad organizacional del responsable.';
comment on column public.rendiciones.tecnico is 'Snapshot del tecnico asociado a la rendicion.';
