-- 150_quality_recepcion_delete_sync.sql
-- Mantiene conectadas Recepción y Calidad también al eliminar:
-- 1) si se borra una recepción, se elimina su tarea CHECKLIST_INGRESO;
-- 2) si se borra la tarea CHECKLIST_INGRESO, se limpian las columnas calidad_* de la recepción;
-- 3) limpia tareas huérfanas y recepciones con estado de calidad stale.

create or replace function public.sync_recepcion_delete_a_calidad()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_origen text := case when TG_TABLE_NAME = 'tms_recepciones_nacionales' then 'NACIONAL' else 'IMPORTACION' end;
begin
  delete from public.tms_calidad_tareas
  where recepcion_id = old.id
    and origen = v_origen
    and tipo = 'CHECKLIST_INGRESO';

  return old;
end
$function$;

create or replace function public.sync_delete_calidad_a_recepcion()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if old.tipo <> 'CHECKLIST_INGRESO' or old.recepcion_id is null then
    return old;
  end if;

  if old.origen = 'NACIONAL' then
    update public.tms_recepciones_nacionales
      set calidad_estado = null,
          calidad_folio = null,
          calidad_disposicion = null,
          calidad_fecha = null
    where id = old.recepcion_id;
  else
    update public.tms_recepciones
      set calidad_estado = null,
          calidad_folio = null,
          calidad_disposicion = null,
          calidad_fecha = null
    where id = old.recepcion_id;
  end if;

  return old;
end
$function$;

drop trigger if exists trg_recepcion_delete_sync_calidad_imp on public.tms_recepciones;
create trigger trg_recepcion_delete_sync_calidad_imp
  after delete on public.tms_recepciones
  for each row
  execute function public.sync_recepcion_delete_a_calidad();

drop trigger if exists trg_recepcion_delete_sync_calidad_nac on public.tms_recepciones_nacionales;
create trigger trg_recepcion_delete_sync_calidad_nac
  after delete on public.tms_recepciones_nacionales
  for each row
  execute function public.sync_recepcion_delete_a_calidad();

drop trigger if exists trg_delete_calidad_a_recepcion on public.tms_calidad_tareas;
create trigger trg_delete_calidad_a_recepcion
  after delete on public.tms_calidad_tareas
  for each row
  when (old.tipo = 'CHECKLIST_INGRESO')
  execute function public.sync_delete_calidad_a_recepcion();

-- Limpieza de tareas huérfanas de checklist que quedaron sin recepción.
delete from public.tms_calidad_tareas t
where t.tipo = 'CHECKLIST_INGRESO'
  and (
    (t.origen = 'IMPORTACION' and not exists (
      select 1
      from public.tms_recepciones r
      where r.id = t.recepcion_id
    ))
    or
    (t.origen = 'NACIONAL' and not exists (
      select 1
      from public.tms_recepciones_nacionales rn
      where rn.id = t.recepcion_id
    ))
  );

-- Limpieza de recepciones con columnas calidad_* stale por ausencia de tarea vigente.
update public.tms_recepciones r
set calidad_estado = null,
    calidad_folio = null,
    calidad_disposicion = null,
    calidad_fecha = null
where (r.calidad_estado is not null or r.calidad_folio is not null or r.calidad_disposicion is not null or r.calidad_fecha is not null)
  and not exists (
    select 1
    from public.tms_calidad_tareas t
    where t.recepcion_id = r.id
      and t.origen = 'IMPORTACION'
      and t.tipo = 'CHECKLIST_INGRESO'
  );

update public.tms_recepciones_nacionales rn
set calidad_estado = null,
    calidad_folio = null,
    calidad_disposicion = null,
    calidad_fecha = null
where (rn.calidad_estado is not null or rn.calidad_folio is not null or rn.calidad_disposicion is not null or rn.calidad_fecha is not null)
  and not exists (
    select 1
    from public.tms_calidad_tareas t
    where t.recepcion_id = rn.id
      and t.origen = 'NACIONAL'
      and t.tipo = 'CHECKLIST_INGRESO'
  );

revoke execute on function public.sync_recepcion_delete_a_calidad() from public, anon;
revoke execute on function public.sync_delete_calidad_a_recepcion() from public, anon;
