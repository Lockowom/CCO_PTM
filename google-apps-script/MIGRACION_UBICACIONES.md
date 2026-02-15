Objetivo
- Migrar la hoja UBICACIONES de Google Sheets a Supabase y exponerla en el módulo Consultas → Ubicaciones.

Pasos
- En Supabase:
  - Ejecuta SETUP_LAYOUT.sql para crear wms_layout y wms_ubicaciones.
  - Ejecuta SETUP_UBICACIONES_V2.sql para agregar FK, índices y políticas RLS mínimas.
- En Google Sheets (archivo con las hojas LAYOUT y UBICACIONES):
  - Abre el editor de Apps Script.
  - En SYNC_LAYOUT.gs, ajusta SUPABASE_URL y SUPABASE_KEY (idealmente usando PropertiesService).
  - Ejecuta syncLayoutCompleto() para enviar LAYOUT y UBICACIONES:
    - syncLayout() publica registros a public.wms_layout con on_conflict=ubicacion.
    - syncUbicaciones() publica registros a public.wms_ubicaciones con on_conflict=ubicacion,codigo.
- En Frontend (CCO_PTM):
  - Asegura VITE_SUPABASE_URL y VITE_SUPABASE_KEY configurados en Render/entorno local.
  - Navega a Consultas → Ubicaciones (/queries/locations). La página [Locations.jsx](file:///c:/Users/crisc/Documents/PROYECT%20CCO/tms-backend-node/CCO_PTM/src/pages/Queries/Locations.jsx) consulta wms_layout y wms_ubicaciones y muestra filtros, totales y detalles.

Notas
- La integridad entre wms_ubicaciones.ubicacion y wms_layout.ubicacion queda garantizada por el FK.
- Las políticas RLS incluidas son abiertas para entorno anon en desarrollo; ajustar para producción.
- Si la cabecera de las hojas cambia, los mapeos en SYNC_LAYOUT.gs toleran variantes (ubicación/ubicacion, código/codigo/sku, descripción/descripcion/nombre).
