
-- Limpiar permisos duplicados o mal formados
UPDATE public.tms_roles
SET permisos_json = (
  SELECT jsonb_agg(DISTINCT elem)
  FROM jsonb_array_elements_text(permisos_json) AS elem
)
WHERE jsonb_typeof(permisos_json) = 'array';

-- Asegurar que el permiso manage_data_import esté asignado correctamente a los roles que lo necesitan
UPDATE public.tms_roles
SET permisos_json = permisos_json || '["manage_data_import"]'::jsonb
WHERE id IN ('ADMIN', 'SUPERVISOR') 
AND NOT (permisos_json @> '["manage_data_import"]'::jsonb);

-- Asegurar que los roles básicos tengan acceso a dashboard
UPDATE public.tms_roles
SET permisos_json = permisos_json || '["view_dashboard"]'::jsonb
WHERE NOT (permisos_json @> '["view_dashboard"]'::jsonb);
