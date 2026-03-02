-- Script para Habilitar Monitor Packing TV

-- 1. Registrar el módulo en la configuración global
INSERT INTO public.tms_modules_config (id, label, enabled, description)
VALUES ('packing-tv', 'Monitor Packing TV', true, 'Vista de monitor para sala de empaque (KDS)')
ON CONFLICT (id) DO UPDATE 
SET label = EXCLUDED.label, description = EXCLUDED.description;

-- 2. Asignar permiso automáticamente a roles clave
-- Esto evita tener que ir manualmente a editar cada rol

-- Función auxiliar para agregar permisos sin duplicar
CREATE OR REPLACE FUNCTION public.add_permission(role_id text, perm text)
RETURNS void AS $$
BEGIN
  UPDATE public.tms_roles
  SET permisos_json = (
    SELECT jsonb_agg(DISTINCT elem)
    FROM jsonb_array_elements_text(permisos_json || jsonb_build_array(perm)) elem
  )
  WHERE id = role_id;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar actualización para ADMIN
SELECT public.add_permission('ADMIN', 'view_packing_tv');

-- Ejecutar actualización para BODEGA (si existe)
SELECT public.add_permission('BODEGA', 'view_packing_tv');

-- Ejecutar actualización para LOGISTICA (si existe)
SELECT public.add_permission('LOGISTICA', 'view_packing_tv');

-- Ejecutar actualización para SUPERVISOR (si existe)
SELECT public.add_permission('SUPERVISOR', 'view_packing_tv');

-- Limpiar función auxiliar
DROP FUNCTION public.add_permission(role_id text, perm text);

-- Confirmación
SELECT 'Monitor Packing TV habilitado y permisos asignados' as resultado;
