-- 080_backfill_tareas_checklist_faltantes.sql
-- Fix comunicación Recepción → Calidad para recepciones ANTIGUAS: las creadas
-- antes de que existiera el trigger crear_tarea_checklist_ingreso (mig 075) nunca
-- generaron su tarea de CheckList, así que en Recepción figuraban "Pendiente de
-- Calidad" sin una tarea que completar en el módulo Calidad (no había forma de
-- cerrarlas). Este backfill idempotente crea la tarea PENDIENTE que falte.
-- Nacionales: se aplica aquí. Importaciones: ver nota al final.

insert into public.tms_calidad_tareas
  (recepcion_id, origen, proveedor, oc, fecha_recepcion, bultos, estado, contexto, tipo)
select rn.id, 'NACIONAL', rn.proveedor, rn.oc, rn.fecha_recepcion, rn.cant_bultos, 'PENDIENTE',
       jsonb_build_object('pallets', rn.pallets_usados, 'tipo_contenedor', rn.tipo_contenedor),
       'CHECKLIST_INGRESO'
from public.tms_recepciones_nacionales rn
where not exists (
  select 1 from public.tms_calidad_tareas t
  where t.recepcion_id = rn.id and t.origen = 'NACIONAL' and t.tipo = 'CHECKLIST_INGRESO'
);

-- Importaciones (tms_recepciones): mismo patrón. Descomentar/ejecutar cuando se
-- confirme que se quieren generar sus tareas pendientes (son ~64 recepciones
-- antiguas y aparecerían todas como PENDIENTE en Calidad).
-- insert into public.tms_calidad_tareas
--   (recepcion_id, origen, proveedor, oc, fecha_recepcion, bultos, estado, contexto, tipo)
-- select r.id, 'IMPORTACION', r.proveedor, r.oc, r.fecha_recepcion, r.cant_bultos, 'PENDIENTE',
--        jsonb_build_object('pallets', r.pallets_usados, 'tipo_contenedor', r.tipo_contenedor),
--        'CHECKLIST_INGRESO'
-- from public.tms_recepciones r
-- where not exists (
--   select 1 from public.tms_calidad_tareas t
--   where t.recepcion_id = r.id and t.origen = 'IMPORTACION' and t.tipo = 'CHECKLIST_INGRESO'
-- );
