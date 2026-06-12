-- 015_consolidar_roles_basura.sql
-- Saneo de datos: consolida/limpia los roles "basura" generados por IDs derivados
-- de nombres con espacios sobrantes (ver fix de slugifyRoleId en src/pages/Admin/Roles.jsx).
-- Decisiones tomadas con el usuario (no automáticas):
--
--  (1) OPERARIO_3_  -> rol LEGÍTIMO (2 usuarios): se limpia el ID y el nombre
--      (OPERARIO_3 / "OPERARIO 3"). Se propaga el nuevo ID a TODAS las columnas
--      de rol del esquema (tms_usuarios, tms_usuarios_activos, tms_accesos y
--      tms_roles_permisos). Nota: tms_usuarios.rol NO es FK formal, por eso el
--      rename debe propagarse a mano.
--
--  (2) SUPERVISOR_  -> se MANTIENE como rol independiente; solo se limpia el
--      nombre ("Supervisor " -> "Supervisor"). El ID se conserva.
--
--  (3) TRANSPORTE   -> se BORRA (0 usuarios); CONDUCTOR queda como rol de
--      conductores. El FK tms_roles_permisos_rol_id_fkey (ON DELETE CASCADE)
--      limpia sus permisos automáticamente.
--
-- Aplicada y verificada en la BD en vivo: 2 usuarios + 71 filas de tms_accesos
-- migrados a OPERARIO_3, 0 usuarios huérfanos tras el cambio.

-- (1) OPERARIO_3_ -> OPERARIO_3 (limpiar ID y nombre)
UPDATE tms_roles            SET id = 'OPERARIO_3', nombre = 'OPERARIO 3' WHERE id     = 'OPERARIO_3_';
UPDATE tms_roles_permisos   SET rol_id = 'OPERARIO_3'                    WHERE rol_id = 'OPERARIO_3_';
UPDATE tms_usuarios         SET rol = 'OPERARIO_3'                       WHERE rol    = 'OPERARIO_3_';
UPDATE tms_usuarios_activos SET rol = 'OPERARIO_3'                       WHERE rol    = 'OPERARIO_3_';
UPDATE tms_accesos          SET rol = 'OPERARIO_3'                       WHERE rol    = 'OPERARIO_3_';

-- (2) SUPERVISOR_ -> solo limpiar el nombre (se mantiene como rol independiente)
UPDATE tms_roles SET nombre = 'Supervisor' WHERE id = 'SUPERVISOR_';

-- (3) TRANSPORTE -> borrar (guard: solo si no quedó ningún usuario asignado)
DELETE FROM tms_roles WHERE id = 'TRANSPORTE'
  AND NOT EXISTS (SELECT 1 FROM tms_usuarios WHERE rol = 'TRANSPORTE');
