# IAM 2.0 — Runtime enforcement controlado

## Resultado

El IAM 2.0 ya no es solamente una vista previa. La aplicación dispone de dos
modos por usuario:

- `SHADOW`: calcula y muestra el acceso IAM 2.0, pero conserva la decisión legacy.
- `ENFORCE`: rutas, navegación y acciones integradas aplican la precedencia
  `DENY > ALLOW > acceso heredado > denegación por defecto`.

Todos los usuarios nacen y permanecen en `SHADOW` hasta una activación manual.
Esto garantiza que ejecutar la migración por sí sola no quite ni agregue accesos.

## Componentes conectados

1. `iam.users.enforcement_mode` y `permission_version` controlan la versión activa.
2. `iam.user_overrides` mantiene excepciones por `screen` o `function`.
3. `iam_runtime_context()` entrega únicamente el contexto del usuario autenticado.
4. `AuthContext` construye una decisión única y la refresca al volver a la ventana
   o cada 60 segundos.
5. Router, redirección inicial y Navbar consumen la misma decisión.
6. `<Can screen="…">` y `<Can fn="…">` permiten integrar nuevas pantallas y
   botones sin volver a codificar permisos dispersos.
7. Los helpers críticos del Panel PTM aplican overrides en servidor para edición,
   eliminación y aprobación de reaperturas.
8. Todo cambio de modo/override incrementa `permission_version` y registra actor,
   motivo, valor anterior y valor nuevo en `iam.access_change_log`.

## Orden de publicación

1. Publicar primero la migración
   `20260820185353_iam_v2_runtime_enforcement.sql`.
2. Verificar que todos los usuarios aparezcan en `SHADOW`.
3. Publicar el frontend.
4. Probar con un administrador en `SHADOW`.
5. Activar un usuario canary de bajo riesgo en `ENFORCE` desde
   **Admin → Control de Acceso (IAM 2.0)**.
6. Validar rutas directas, menú, inicio, edición N.V., eliminación y reaperturas.
7. Activar los siguientes usuarios únicamente cuando el canary resulte correcto.

## Prueba obligatoria por usuario

- Confirmar que las pantallas esperadas aparecen en verde.
- Probar una URL permitida pegándola directamente en el navegador.
- Probar una URL con `DENY`; debe mostrar acceso denegado aunque exista
  `manage_panel`.
- Confirmar que el menú no muestre la pantalla denegada.
- Aplicar `DENY` a `panel.nv.entry.delete` y comprobar que el botón desaparezca y
  que el RPC sea rechazado por el helper de base de datos.
- Volver a `INHERIT` y comprobar la restauración.
- Revisar que `permission_version` aumente.

## Rollback de los primeros 5 minutos

El rollback operativo no requiere revertir el esquema:

1. En la consola IAM, seleccionar el usuario afectado.
2. Escribir el motivo `Rollback por incidente de acceso`.
3. Pulsar **Volver a SHADOW**.
4. El usuario recupera el comportamiento legacy al enfocar la aplicación o como
   máximo en 60 segundos.

Rollback global de emergencia:

```sql
begin;

update iam.users
set enforcement_mode = 'SHADOW',
    enforcement_changed_at = now(),
    enforcement_reason = 'Rollback global de emergencia',
    permission_version = permission_version + 1,
    updated_at = now()
where enforcement_mode = 'ENFORCE';

commit;
```

No eliminar `iam.user_overrides`: en `SHADOW` quedan inactivos, auditables y listos
para corregirse antes de una nueva activación.

## Extensión a nuevos módulos

Para una pantalla nueva:

1. Declararla en `screenRegistry.js`.
2. Declarar sus acciones en `functionRegistry.js`.
3. Usar `canAccessRoute`, `<Can screen>` o `<Can fn>` en vez de condiciones nuevas.
4. Para operaciones críticas, envolver el gate de servidor con
   `authz.apply_surface_override` y conservar las reglas de scope/ABAC existentes.
5. Añadir pruebas de `ALLOW`, `DENY`, `INHERIT`, acceso por URL y backend.

La activación del override nunca reemplaza las validaciones de datos, workflow,
scope o RLS: solo decide si el usuario puede intentar la acción.
