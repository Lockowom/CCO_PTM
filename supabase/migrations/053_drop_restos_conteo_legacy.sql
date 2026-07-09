-- 053_drop_restos_conteo_legacy.sql
-- Limpieza aprobada por el usuario (auditoría 2026-07-09, DIAGRAMA_BD.md §6.4):
-- restos del PRIMER intento del módulo de Conteo Cíclico y del subsistema de
-- inventario muerto. Verificado en vivo antes del DROP: 0 filas, 0 referencias
-- en frontend, 0 triggers asociados. El módulo vigente usa tms_conteo_*.
-- NO se tocan: wms_layout, wms_ubicaciones, wms_move_stock, get_dashboard_kpis,
-- mv_dashboard_kpis, fuzzy_search, batch_update_nv_estado, tms_inventario_general.

-- Tablas muertas (hijas primero)
DROP TABLE IF EXISTS public.wms_bloque_auditoria_items;
DROP TABLE IF EXISTS public.wms_bloque_auditorias;
DROP TABLE IF EXISTS public.wms_bloque_items;
DROP TABLE IF EXISTS public.wms_bloques;
DROP TABLE IF EXISTS public.wms_cc_conteos;
DROP TABLE IF EXISTS public.wms_cc_sesiones;
DROP TABLE IF EXISTS public.wms_cc_costos;
DROP TABLE IF EXISTS public.wms_proyecciones;

-- Funciones muertas (sin llamadas ni triggers)
DROP FUNCTION IF EXISTS public.wms_reserve_stock(uuid, text, integer);
DROP FUNCTION IF EXISTS public.get_fefo_allocation(text, integer);
DROP FUNCTION IF EXISTS public.fn_auto_complete_picking();
DROP FUNCTION IF EXISTS public.fn_trigger_replenishment();
