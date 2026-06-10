-- ============================================================
-- MIGRACIÓN 016: Permiso del módulo Costos de Transporte
-- Fecha: 2026-06-10
-- ============================================================
-- El módulo `/tms/costos` (1.4.30/1.4.31) introdujo el permiso
-- `view_transport_costs`. Como es nuevo, ningún rol lo tenía y solo el rol
-- ADMIN (que saltea permisos en el frontend) veía la entrada del menú.
--
-- Esta migración:
--   1) Registra el permiso en el catálogo `tms_permisos` (FK de roles_permisos).
--   2) Lo asigna a todo rol que ya tenga al menos un permiso del módulo TMS
--      (así el menú aparece a la misma gente que ya ve el resto de TMS).
--
-- Idempotente (ON CONFLICT DO NOTHING / NOT EXISTS).
-- ============================================================

INSERT INTO public.tms_permisos (id, nombre, modulo)
VALUES ('view_transport_costs', 'Ver Costos de Transporte', 'tms')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tms_roles_permisos (rol_id, permiso_id)
SELECT DISTINCT rp.rol_id, 'view_transport_costs'
FROM public.tms_roles_permisos rp
JOIN public.tms_permisos p ON p.id = rp.permiso_id AND p.modulo = 'tms'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tms_roles_permisos x
  WHERE x.rol_id = rp.rol_id AND x.permiso_id = 'view_transport_costs'
);
