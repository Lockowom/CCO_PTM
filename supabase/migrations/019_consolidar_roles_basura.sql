-- 019_consolidar_roles_basura.sql
-- Sincronizada desde la BD live (schema_migrations version 20260612044038,
-- nombre original "015_consolidar_roles_basura"). Renumerada a 019 para evitar
-- la colisión con 015_direcciones_transporte_y_busqueda del repo.
-- Consolidación/saneo de roles basura (decisiones del usuario):
--  1) OPERARIO_3_  -> rol legítimo: limpiar ID y nombre (OPERARIO_3 / "OPERARIO 3")
--  2) SUPERVISOR_  -> mantener separado: solo limpiar el nombre (espacio final)
--  3) TRANSPORTE   -> borrar (0 usuarios); CONDUCTOR queda como rol de conductores

-- 1) Renombrar OPERARIO_3_ -> OPERARIO_3 y propagar a todas las columnas de rol.
--    (tms_roles_permisos.rol_id FK ON UPDATE NO ACTION, pero OPERARIO_3_ no tiene filas allí)
UPDATE tms_roles            SET id = 'OPERARIO_3', nombre = 'OPERARIO 3' WHERE id  = 'OPERARIO_3_';
UPDATE tms_roles_permisos   SET rol_id = 'OPERARIO_3'                    WHERE rol_id = 'OPERARIO_3_';
UPDATE tms_usuarios         SET rol = 'OPERARIO_3'                       WHERE rol = 'OPERARIO_3_';
UPDATE tms_usuarios_activos SET rol = 'OPERARIO_3'                       WHERE rol = 'OPERARIO_3_';
UPDATE tms_accesos          SET rol = 'OPERARIO_3'                       WHERE rol = 'OPERARIO_3_';

-- 2) Limpiar nombre de SUPERVISOR_ (se mantiene como rol independiente)
UPDATE tms_roles SET nombre = 'Supervisor' WHERE id = 'SUPERVISOR_';

-- 3) Borrar TRANSPORTE (sin usuarios). El FK ON DELETE CASCADE limpia tms_roles_permisos.
DELETE FROM tms_roles WHERE id = 'TRANSPORTE'
  AND NOT EXISTS (SELECT 1 FROM tms_usuarios WHERE rol = 'TRANSPORTE');
