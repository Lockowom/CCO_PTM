-- 076_sync_calidad_a_recepcion.sql
-- Flujo INVERSO Calidad → Recepción: cuando Calidad finaliza el CheckList de
-- Ingreso (CONFORME/NO_CONFORME + folio + disposición), la recepción vinculada
-- lo refleja. Columnas calidad_* en ambas tablas de recepción + trigger sobre
-- tms_calidad_tareas + backfill de las ya finalizadas.
-- (Reconstruida en repo: se aplicó vía MCP y faltaba el archivo — regla de
--  sincronización de CLAUDE.md.)

alter table public.tms_recepciones
  add column if not exists calidad_estado      text,
  add column if not exists calidad_folio        text,
  add column if not exists calidad_disposicion  text,
  add column if not exists calidad_fecha         timestamptz;

alter table public.tms_recepciones_nacionales
  add column if not exists calidad_estado      text,
  add column if not exists calidad_folio        text,
  add column if not exists calidad_disposicion  text,
  add column if not exists calidad_fecha         timestamptz;

create or replace function public.sync_calidad_a_recepcion()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if NEW.recepcion_id is null then return NEW; end if;
  if NEW.origen = 'NACIONAL' then
    update public.tms_recepciones_nacionales
      set calidad_estado = NEW.estado, calidad_folio = NEW.folio,
          calidad_disposicion = NEW.disposicion, calidad_fecha = coalesce(NEW.completado_en, now())
      where id = NEW.recepcion_id;
  else
    update public.tms_recepciones
      set calidad_estado = NEW.estado, calidad_folio = NEW.folio,
          calidad_disposicion = NEW.disposicion, calidad_fecha = coalesce(NEW.completado_en, now())
      where id = NEW.recepcion_id;
  end if;
  return NEW;
end $function$;

drop trigger if exists trg_calidad_a_recepcion on public.tms_calidad_tareas;
create trigger trg_calidad_a_recepcion
  after update on public.tms_calidad_tareas
  for each row
  when (
    new.tipo = 'CHECKLIST_INGRESO'
    and (old.estado is distinct from new.estado
      or old.folio is distinct from new.folio
      or old.disposicion is distinct from new.disposicion)
  )
  execute function public.sync_calidad_a_recepcion();

-- Backfill de las tareas ya finalizadas hacia su recepción.
update public.tms_recepciones_nacionales rn
  set calidad_estado = t.estado, calidad_folio = t.folio,
      calidad_disposicion = t.disposicion, calidad_fecha = coalesce(t.completado_en, now())
from public.tms_calidad_tareas t
where t.recepcion_id = rn.id and t.origen = 'NACIONAL' and t.tipo = 'CHECKLIST_INGRESO'
  and t.estado in ('CONFORME','NO_CONFORME');

update public.tms_recepciones r
  set calidad_estado = t.estado, calidad_folio = t.folio,
      calidad_disposicion = t.disposicion, calidad_fecha = coalesce(t.completado_en, now())
from public.tms_calidad_tareas t
where t.recepcion_id = r.id and t.origen = 'IMPORTACION' and t.tipo = 'CHECKLIST_INGRESO'
  and t.estado in ('CONFORME','NO_CONFORME');
