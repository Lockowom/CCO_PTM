-- Habilita la publicación de cambios en tiempo real para wms_ubicaciones
-- Esto es necesario para que el frontend reciba notificaciones automáticas

BEGIN;

-- 1. Asegurar que la tabla está en la publicación 'supabase_realtime'
-- Supabase usa una publicación lógica llamada 'supabase_realtime' para esto.
-- Si no existe, la creamos (aunque en Supabase cloud suele estar).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- 2. Agregar la tabla a la publicación
ALTER PUBLICATION supabase_realtime ADD TABLE wms_ubicaciones;

-- 3. (Opcional) Hacer lo mismo para otras tablas si quieres realtime en ellas
-- ALTER PUBLICATION supabase_realtime ADD TABLE tms_nv_diarias;
-- ALTER PUBLICATION supabase_realtime ADD TABLE tms_partidas;
-- ALTER PUBLICATION supabase_realtime ADD TABLE tms_series;

COMMIT;
