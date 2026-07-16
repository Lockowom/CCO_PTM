-- 086_ingresar_completo.sql
-- ============================================================================
--  Módulo Ingresar completo (paridad con /ingresar del Panel):
--   • RPC `eliminar_nv(id)` — borrar N.V. (gate manage_panel).
--   • Consolidados: NVs con fecha de despacho manual agrupadas en un ticket
--     (tablas `tms_consolidados` / `tms_consolidado_nvs` + RPCs de escritura).
--     Reemplaza el par consolidados/consolidado_nvs del Panel.
-- ============================================================================

-- ── Eliminar N.V. ───────────────────────────────────────────────────────────
create or replace function public.eliminar_nv(p_id bigint)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare r public.tms_operaciones;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  delete from public.tms_operaciones where id = p_id returning * into r;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;
  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (p_id, 'delete', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), to_jsonb(r));
  return jsonb_build_object('ok', true, 'id', p_id);
end;
$$;
revoke all on function public.eliminar_nv(bigint) from public;
grant execute on function public.eliminar_nv(bigint) to authenticated;

-- ── Consolidados ────────────────────────────────────────────────────────────
create sequence if not exists public.tms_consolidado_seq;
create table if not exists public.tms_consolidados (
  id                 bigint generated always as identity primary key,
  ticket             text unique not null default ('CON-' || lpad(nextval('public.tms_consolidado_seq')::text, 3, '0')),
  fecha_comprometida date,
  estado             text not null default 'abierto',
  observacion        text,
  created_by         text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create table if not exists public.tms_consolidado_nvs (
  id             bigint generated always as identity primary key,
  consolidado_id bigint not null references public.tms_consolidados(id) on delete cascade,
  nv             text not null,
  canal          text,
  cliente        text,
  created_at     timestamptz not null default now()
);
create index if not exists ix_tms_cons_nvs_cid on public.tms_consolidado_nvs (consolidado_id);

alter table public.tms_consolidados     enable row level security;
alter table public.tms_consolidado_nvs  enable row level security;
drop policy if exists p_tms_cons_sel on public.tms_consolidados;
create policy p_tms_cons_sel on public.tms_consolidados for select to authenticated using (true);
drop policy if exists p_tms_cons_nvs_sel on public.tms_consolidado_nvs;
create policy p_tms_cons_nvs_sel on public.tms_consolidado_nvs for select to authenticated using (true);

-- Crear/editar consolidado con su set de NVs (reemplazo del set en cada guardado).
create or replace function public.guardar_consolidado(p jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_nv jsonb;
  r public.tms_consolidados;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  if v_id is null then
    insert into public.tms_consolidados (fecha_comprometida, estado, observacion, created_by)
    values (nullif(p->>'fecha_comprometida','')::date, coalesce(nullif(p->>'estado',''),'abierto'), nullif(p->>'observacion',''), nullif(p->>'created_by',''))
    returning * into r;
  else
    update public.tms_consolidados set
      fecha_comprometida = nullif(p->>'fecha_comprometida','')::date,
      estado = coalesce(nullif(p->>'estado',''), estado),
      observacion = nullif(p->>'observacion',''),
      updated_at = now()
    where id = v_id returning * into r;
    if r.id is null then raise exception 'Consolidado no encontrado'; end if;
  end if;
  -- Reemplaza el set de NVs
  delete from public.tms_consolidado_nvs where consolidado_id = r.id;
  if p ? 'nvs' then
    for v_nv in select * from jsonb_array_elements(p->'nvs') loop
      insert into public.tms_consolidado_nvs (consolidado_id, nv, canal, cliente)
      values (r.id, v_nv->>'nv', v_nv->>'canal', v_nv->>'cliente');
    end loop;
  end if;
  return jsonb_build_object('ok', true, 'id', r.id, 'ticket', r.ticket);
end;
$$;
revoke all on function public.guardar_consolidado(jsonb) from public;
grant execute on function public.guardar_consolidado(jsonb) to authenticated;

create or replace function public.eliminar_consolidado(p_id bigint)
returns jsonb
language plpgsql security definer set search_path = public
as $$
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  delete from public.tms_consolidados where id = p_id;
  return jsonb_build_object('ok', true, 'id', p_id);
end;
$$;
revoke all on function public.eliminar_consolidado(bigint) from public;
grant execute on function public.eliminar_consolidado(bigint) to authenticated;
