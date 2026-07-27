# IAM Frontend Simplificado

Guia operativa y arquitectura objetivo para administrar accesos desde una matriz de frontend, manteniendo Supabase como persistencia y enforcement runtime.

## 1. Objetivo

Dejar el IAM del proyecto CCO:

- mas simple de mantener
- con una fuente unica de verdad legible
- organizado por rol, permisos y landing page
- listo para incorporar modulos nuevos sin rediseñar autorizacion completa

## 2. Fuente unica de verdad

La matriz oficial de roles queda definida en:

- `src/config/iamBlueprints.js`

Ese archivo concentra:

- roles oficiales
- nombre y descripcion
- `landingPage`
- permisos por rol
- estrategia de scope
- organizacion sugerida por equipo

La navegacion y el guard de vistas siguen usando:

- `src/config/modules.js`
- `src/constants/permissions.js`

La sincronizacion a base de datos queda formalizada en:

- `supabase/migrations/160_frontend_iam_role_blueprints.sql`

## 3. Arquitectura resultante

### Capa frontend

La capa frontend pasa a ser la definicion humana del modelo:

- `iamBlueprints.js` define la plantilla oficial
- `modules.js` define el catalogo funcional
- `permissions.js` define rutas y tabs protegidos

### Capa de persistencia

Supabase sigue guardando:

- `public.tms_roles`
- `public.tms_usuarios`
- `iam.roles`
- `iam.role_permissions`
- `iam.assignments`
- `iam.teams`
- `iam.team_members`

### Capa de sincronizacion

La migracion `160_frontend_iam_role_blueprints.sql` deja el sistema alineado con la matriz frontend:

- actualiza `tms_roles`
- rehace `iam.role_permissions`
- asegura asignaciones globales por rol actual
- crea equipos por rol
- organiza miembros por rol

### Capa de enforcement

La autorizacion real sigue corriendo donde debe correr:

- guards de rutas y tabs en frontend
- helpers IAM / authz en base de datos
- RPCs endurecidas en dominios sensibles

Esto evita el error clasico de confiar solo en el frontend.

## 4. Roles oficiales publicados

### ADMIN

- landing: `/admin/users`
- foco: administracion total, seguridad, workflows, API, limpieza, OTA y operacion transversal
- estrategia: `global`

### CONTROL_CALIDAD

- landing: `/quality/monitoreo`
- foco: inbound controlado, monitoreo, dictamen de calidad y consulta transversal
- estrategia: `global`

### GERENCIA

- landing: `/panel`
- foco: vision ejecutiva, control de panel, calidad, postventa y reportabilidad
- estrategia: `global`

### INVENTARIO_

- landing: `/inventory/traspasos`
- foco: inventario extendido, recepcion, conteo y herramientas de bodega
- estrategia: `global`

### OPERADOR

- landing: `/mobile/pda`
- foco: operacion de bodega y consultas logisticas base
- estrategia: `global`

### OPERARIO_3

- landing: `/inventory/traspasos`
- foco: apoyo operativo, traspasos, recepcion y carga puntual
- estrategia: `global`

### SUPERVISOR

- landing: `/panel/ingresar`
- foco: panel, cambio de estados, reaperturas y control ejecutivo de N.V.
- estrategia: `global`

### SUPERVISOR_

- landing: `/panel/ingresar`
- foco: supervisor legacy alineado al nuevo estandar
- estrategia: `global`

## 5. Usuarios actuales organizados

La entrega deja a los usuarios actuales alineados por rol mediante la migracion.

### ADMIN

- `admin@cco.cl`
- `admin@sistema.com`

### CONTROL_CALIDAD

- `mnegroni@ptm.cl`

### GERENCIA

- `oleiva@ptm.cl`

### INVENTARIO_

- `inventary@ptm.cl`

### OPERADOR

- `jc@ptm.cl`
- `lmodric@ptm.cl`
- `moi@ptm.cl`
- `picking1@ptm.cl`
- `picking2@ptm.cl`
- `packing@ptm.cl`

### OPERARIO_3

- `chv@ptm.cl`

### SUPERVISOR

- `gisselle@ptm.cl`
- `nilo@ptm.cl`

### SUPERVISOR_

- `angelica@ptm.cl`

## 6. Equipos creados para orden futuro

La migracion crea equipos tecnicos por rol para dejar trazabilidad y orden:

- `ROL_ADMIN`
- `ROL_CONTROL_CALIDAD`
- `ROL_GERENCIA`
- `ROL_INVENTARIO`
- `ROL_OPERADOR`
- `ROL_OPERARIO_3`
- `ROL_SUPERVISOR`
- `ROL_SUPERVISOR_LEGACY`

Estos equipos hoy ordenan miembros.

No reemplazan las asignaciones globales de usuario.

## 7. Matriz funcional resumida

| Rol | Modulos base | Observaciones |
| --- | --- | --- |
| `ADMIN` | Todos | Incluye administracion, panel, calidad, postventa, inventario y OTA |
| `CONTROL_CALIDAD` | Inbound, Calidad, Consultas, panel consulta | Mantiene recepcion/editado restringido a calidad/admin |
| `GERENCIA` | Panel, Calidad, Postventa, Consultas, Workflows | Perfil ejecutivo con control transversal |
| `INVENTARIO_` | Inventario, Inbound, Consultas | Rol extendido para operaciones fisicas |
| `OPERADOR` | PDA, Inventario base, Inbound lectura, Consultas | Rol operativo diario |
| `OPERARIO_3` | Inventario base, Inbound lectura, carga puntual | Rol legacy reducido |
| `SUPERVISOR` | Panel, Consultas, dashboards de seguimiento | Incluye reaperturas y control de estados |
| `SUPERVISOR_` | Panel, Inbound de apoyo, Consultas | Queda alineado al estandar sin romper legado |

## 8. Regla de diseno para modulos nuevos

Cuando se cree un modulo nuevo, el orden correcto es:

1. agregar permisos al catalogo en `src/config/modules.js`
2. mapear rutas y tabs en `src/constants/permissions.js`
3. agregar esos permisos a los roles que corresponda en `src/config/iamBlueprints.js`
4. crear una migracion que sincronice la plantilla a `tms_roles`
5. si el modulo requiere enforcement fuerte, endurecer RPCs / RLS

## 9. Regla de mantenimiento futuro

### Si agregas un permiso nuevo

Haz estos pasos:

1. agrega el permiso en `APP_PERMISSIONS`
2. agrega su guard de ruta o tab
3. incluyelo en uno o mas blueprints de `iamBlueprints.js`
4. crea una migracion de sincronizacion
5. ejecuta build y valida las pantallas impactadas

### Si agregas un rol nuevo

Haz estos pasos:

1. define el rol en `iamBlueprints.js`
2. asigna `landingPage`
3. define permisos exactos
4. define `defaultTeamCode`
5. crea migracion que lo publique en `tms_roles`
6. si hay usuarios, reasignalos en `tms_usuarios`

### Si agregas un usuario nuevo

Haz estos pasos:

1. crea el usuario desde `Admin > Usuarios`
2. asigna el rol base correcto
3. verifica que el rol exista en la plantilla
4. confirma que el landing y permisos del rol sean los esperados
5. si el dominio requiere control extra, revisa policy o workflow

## 10. Criterio de simplificacion

Este upgrade simplifica el IAM de la siguiente forma:

- la definicion humana vive en frontend
- la persistencia vive en base de datos
- la app deja de depender de recordar manualmente que rol deberia tener cada permiso
- la organizacion por equipos queda automatizada

No simplifica haciendo inseguro el sistema.

Se mantiene:

- enforcement backend
- asignaciones IAM efectivas
- compatibilidad con rutas y tabs actuales

## 11. Limites conocidos

Esta entrega no elimina el IAM actual; lo ordena.

Por diseno:

- `tms_roles` sigue siendo la tabla operativa visible
- `iam.roles` y `iam.role_permissions` siguen siendo el espejo runtime
- algunos dominios siguen usando helpers y RPCs especificas

Esto es intencional para no romper produccion.

## 12. Procedimiento recomendado de soporte

Si un usuario dice "no veo la vista" o "no puedo hacer la accion":

1. revisar su rol en `tms_usuarios`
2. revisar el blueprint del rol en `src/config/iamBlueprints.js`
3. revisar si la ruta esta mapeada en `src/constants/permissions.js`
4. revisar si la accion requiere policy, workflow o RPC endurecida
5. revisar si el usuario tiene `auth_uid` y asignacion IAM efectiva

## 13. Archivos clave

- `src/config/iamBlueprints.js`
- `src/config/modules.js`
- `src/constants/permissions.js`
- `src/pages/Admin/Roles.jsx`
- `src/pages/Admin/Users.jsx`
- `docs/IAM_CONFIGURACION_MANUAL.md`
- `supabase/migrations/160_frontend_iam_role_blueprints.sql`

## 14. Resultado esperado

Con esta arquitectura:

- los roles quedan centralizados
- los permisos quedan mas legibles
- los usuarios actuales quedan ordenados por rol
- el mantenimiento futuro baja mucho de complejidad
- agregar modulos nuevos deja de ser una tarea improvisada
