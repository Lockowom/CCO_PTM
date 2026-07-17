-- ============================================================================
--  102_retiro_modulos_tms_outbound.sql
--  Retiro de los módulos TMS (Transporte) y Outbound del app.
--  • Quita sus tarjetas de Admin → Vistas (tms_modules_config).
--  • Borra sus permisos huérfanos de tms_permisos.
--  • NO se tocan tablas de datos (son compartidas con Consultas/otros; si el
--    nuevo módulo requiere otro esquema, se define en su propia migración).
--  • Se CONSERVAN view_stock / manage_inventory: los usa la PDA de bodega
--    (/mobile/pda), que se reubicó bajo el módulo Inventario.
-- ============================================================================

delete from public.tms_modules_config where id in ('tms', 'outbound');

delete from public.tms_permisos where id in (
  -- TMS (transporte)
  'view_tms_dashboard','view_routes','create_routes','view_control_tower','manage_control_tower',
  'view_drivers','manage_drivers','view_transport_costs','view_mobile_app','use_mobile_app',
  -- Outbound
  'view_sales_orders','manage_sales_orders','manage_orders','delete_sales_orders',
  'view_picking','process_picking','view_packing','process_packing','view_packing_tv',
  'view_shipping','process_shipping','view_deliveries','manage_deliveries'
);
