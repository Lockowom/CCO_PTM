-- 077_recepcion_item_vencimiento.sql
-- Recepción: fecha de vencimiento por ítem (Importaciones y Nacionales).
-- (Reconstruida en repo: se aplicó vía MCP y faltaba el archivo.)

alter table public.tms_recepcion_items
  add column if not exists fecha_vencimiento date;

alter table public.tms_recepcion_items_nacionales
  add column if not exists fecha_vencimiento date;
