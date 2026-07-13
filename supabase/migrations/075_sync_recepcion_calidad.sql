-- 075_sync_recepcion_calidad.sql
-- Comunicación Recepción → Calidad: la tarea de CheckList de Ingreso no reflejaba
-- los bultos / OC reales porque el trigger `crear_tarea_checklist_ingreso` corría
-- SOLO en INSERT y con ON CONFLICT DO NOTHING. Si la recepción se guardaba y luego
-- se editaban bultos/OC/pallets, Calidad quedaba en 0. Ahora el trigger:
--   • al INSERT: crea la tarea (o refresca sus datos de cabecera) + notifica;
--   • al UPDATE de la recepción: SINCRONIZA bultos/OC/proveedor/fecha (+pallets y
--     tipo de contenedor en `contexto`) hacia la tarea. Nunca toca las respuestas
--     del checklist, ni el estado/folio de la tarea.

create or replace function public.crear_tarea_checklist_ingreso()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_origen text := case when TG_TABLE_NAME = 'tms_recepciones_nacionales' then 'NACIONAL' else 'IMPORTACION' end;
  v_ctx jsonb := jsonb_build_object('pallets', NEW.pallets_usados, 'tipo_contenedor', NEW.tipo_contenedor);
begin
  if TG_OP = 'INSERT' then
    insert into tms_calidad_tareas (recepcion_id, origen, proveedor, oc, fecha_recepcion, bultos, estado, contexto)
    values (NEW.id, v_origen, NEW.proveedor, NEW.oc, NEW.fecha_recepcion, NEW.cant_bultos, 'PENDIENTE', v_ctx)
    on conflict (recepcion_id, origen) do update
      set proveedor = excluded.proveedor, oc = excluded.oc,
          fecha_recepcion = excluded.fecha_recepcion, bultos = excluded.bultos,
          contexto = coalesce(tms_calidad_tareas.contexto, '{}'::jsonb) || excluded.contexto,
          updated_at = now();

    insert into tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
    values (
      'CHECKLIST_INGRESO_PENDIENTE',
      'Nueva recepción: CheckList de ingreso pendiente',
      format('Recepción %s de %s requiere CheckList de Calidad (revisión documental + inspección de embalajes).',
             coalesce(NEW.oc, '—'), coalesce(NEW.proveedor, 's/proveedor')),
      NULL,
      jsonb_build_object('recepcion_id', NEW.id, 'origen', v_origen, 'proveedor', NEW.proveedor, 'oc', NEW.oc),
      'recepcion_ingreso'
    );
  else  -- UPDATE: sincroniza los datos de cabecera hacia la tarea existente.
    update tms_calidad_tareas
      set proveedor = NEW.proveedor, oc = NEW.oc, fecha_recepcion = NEW.fecha_recepcion,
          bultos = NEW.cant_bultos,
          contexto = coalesce(contexto, '{}'::jsonb) || v_ctx,
          updated_at = now()
    where recepcion_id = NEW.id and origen = v_origen;
  end if;

  return NEW;
end;
$function$;

-- Triggers: mantener el de INSERT y agregar uno de UPDATE que solo dispara cuando
-- cambian los campos de cabecera relevantes (evita trabajo en updates irrelevantes).
drop trigger if exists trg_checklist_ingreso_imp_upd on public.tms_recepciones;
create trigger trg_checklist_ingreso_imp_upd
  after update on public.tms_recepciones
  for each row
  when (old.cant_bultos is distinct from new.cant_bultos
        or old.oc is distinct from new.oc
        or old.proveedor is distinct from new.proveedor
        or old.fecha_recepcion is distinct from new.fecha_recepcion
        or old.pallets_usados is distinct from new.pallets_usados
        or old.tipo_contenedor is distinct from new.tipo_contenedor)
  execute function public.crear_tarea_checklist_ingreso();

drop trigger if exists trg_checklist_ingreso_nac_upd on public.tms_recepciones_nacionales;
create trigger trg_checklist_ingreso_nac_upd
  after update on public.tms_recepciones_nacionales
  for each row
  when (old.cant_bultos is distinct from new.cant_bultos
        or old.oc is distinct from new.oc
        or old.proveedor is distinct from new.proveedor
        or old.fecha_recepcion is distinct from new.fecha_recepcion
        or old.pallets_usados is distinct from new.pallets_usados
        or old.tipo_contenedor is distinct from new.tipo_contenedor)
  execute function public.crear_tarea_checklist_ingreso();

-- Backfill: refrescar las tareas existentes con los datos actuales de su recepción.
update public.tms_calidad_tareas t
  set proveedor = r.proveedor, oc = r.oc, fecha_recepcion = r.fecha_recepcion,
      bultos = r.cant_bultos,
      contexto = coalesce(t.contexto, '{}'::jsonb) || jsonb_build_object('pallets', r.pallets_usados, 'tipo_contenedor', r.tipo_contenedor),
      updated_at = now()
  from public.tms_recepciones r
  where t.recepcion_id = r.id and t.origen = 'IMPORTACION' and t.tipo = 'CHECKLIST_INGRESO';

update public.tms_calidad_tareas t
  set proveedor = r.proveedor, oc = r.oc, fecha_recepcion = r.fecha_recepcion,
      bultos = r.cant_bultos,
      contexto = coalesce(t.contexto, '{}'::jsonb) || jsonb_build_object('pallets', r.pallets_usados, 'tipo_contenedor', r.tipo_contenedor),
      updated_at = now()
  from public.tms_recepciones_nacionales r
  where t.recepcion_id = r.id and t.origen = 'NACIONAL' and t.tipo = 'CHECKLIST_INGRESO';
