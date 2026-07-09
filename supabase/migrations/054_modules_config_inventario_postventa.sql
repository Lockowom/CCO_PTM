-- 054_modules_config_inventario_postventa.sql
-- Vistas (Admin → Vistas) solo muestra módulos con fila en tms_modules_config
-- que además existan en APP_MODULES (config/modules.js). Los módulos nuevos
-- "inventario" (Traspasos + Conteo Cíclico) y "postventa" (Servicio Técnico)
-- no tenían fila → no se podían encender/apagar. Se siembran habilitados.
INSERT INTO public.tms_modules_config (id, enabled, label, description) VALUES
  ('inventario', true, 'Inventario', 'Traspasos/Ajustes y Conteo Cíclico (Operaciones WMS)'),
  ('postventa',  true, 'Post-Venta', 'Servicio Técnico: tickets, bandeja de correos, calendario, técnicos')
ON CONFLICT (id) DO NOTHING;
