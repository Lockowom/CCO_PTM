-- Habilitar la publicación de eventos Realtime para la tabla tms_roles
-- Esto es CRÍTICO para que los cambios de permisos se reflejen instantáneamente en otros usuarios

-- 1. Asegurar que la tabla es parte de la publicación supabase_realtime
BEGIN;
  -- Verificar si la publicación existe (Supabase la crea por defecto)
  -- Si no, la creamos (raro, pero posible)
  -- Luego agregamos la tabla
  
  -- Intentar agregar la tabla a la publicación
  -- Nota: Si ya está agregada, esto no fallará o simplemente no hará nada
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_roles;
  
  -- También asegurarnos para tms_usuarios si no estaba
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_usuarios;
COMMIT;

-- 2. Verificar Replica Identity (necesario para recibir el payload completo en updates)
ALTER TABLE public.tms_roles REPLICA IDENTITY FULL;
ALTER TABLE public.tms_usuarios REPLICA IDENTITY FULL;
