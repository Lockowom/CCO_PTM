-- 071_permisos_inventario_pantallas.sql
-- Permisos PROPIOS por pantalla de Inventario (casilla 1:1 en Admin → Roles).
-- Antes Traspasos/Análisis/Carteles heredaban manage_inventory (de otro grupo) y
-- no tenían casilla propia en Roles. Se agregan de forma ADITIVA: los permisos de
-- bodega existentes siguen dando acceso (ROUTE_PERMISSIONS los conserva), así que
-- ningún rol pierde accesos. Catálogo espejo de APP_PERMISSIONS.
insert into public.tms_permisos (id, nombre, modulo) values
  ('view_traspasos', 'Traspasos y Ajustes', 'Inventario'),
  ('view_analisis',  'Análisis de Códigos', 'Inventario'),
  ('view_carteles',  'Carteles de Bodega',  'Inventario')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;
