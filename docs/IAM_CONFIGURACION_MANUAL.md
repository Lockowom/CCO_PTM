# Configuracion Manual IAM

Guia operativa para administrar permisos IAM del proyecto CCO de forma manual, indicando:

- donde se configura
- como se configura
- cuando usar UI
- cuando usar SQL o RPC manual
- como diagnosticar bloqueos tipo `No tienes permisos IAM...`

Este documento complementa `docs/IAM_ARQUITECTURA.md` y esta pensado para uso practico de administracion.

## 1. Donde se configura

Hay 2 niveles reales de administracion:

### A. Desde la UI del sistema

Ruta:

- `Admin > Identidad y Seguridad`

Pantalla real:

- `Usuarios`
- `Roles y Permisos`
- `Ambitos`
- `Equipos y Grupos`

Implementacion:

- `src/pages/Admin/AccessControl.jsx`

Subvistas:

- `/admin/users`
- `/admin/roles`
- `/admin/roles?vista=scopes`
- `/admin/roles?vista=teams`

Usa la UI cuando:

- quieres otorgar acceso a un usuario puntual
- necesitas agregar o quitar alcance por `centro_costo`
- quieres revisar asignaciones sin tocar SQL
- quieres administrar equipos o grupos

### B. Desde Supabase

Lugar:

- `Supabase Dashboard > SQL Editor`

Usa Supabase manualmente cuando:

- la UI no responde
- necesitas corregir un usuario bloqueado con urgencia
- quieres aplicar permisos en lote
- estas haciendo soporte o auditoria

## 2. Como esta modelado IAM

La capa IAM no funciona solo por `rol` legacy en `tms_usuarios`.

La autorizacion efectiva se arma con:

- `iam.users`
- `iam.roles`
- `iam.permissions`
- `iam.role_permissions`
- `iam.assignments`
- `iam.user_effective_permissions`

En simple:

- el usuario existe en `tms_usuarios`
- el espejo IAM vive en `iam.users`
- el rol define permisos base
- las asignaciones en `iam.assignments` agregan alcance
- el motor efectivo se consulta desde `iam.user_effective_permissions`

## 3. Regla practica importante

No edites a mano `iam.assignments` con `insert` directo salvo emergencia.

La forma correcta es usar RPCs:

- `iam_asignar_scope(...)`
- `iam_revocar_asignacion(...)`
- `iam_principal_asignar_rol(...)`
- `iam_principal_revocar_asignacion(...)`
- `iam_refresh_dynamic_groups(...)`

Esto evita inconsistencia de tipos, scopes y auditoria.

## 4. Que se configura en cada pantalla

### Usuarios

Pantalla:

- `/admin/users`

Sirve para:

- revisar usuarios
- revisar rol base
- administrar alta o mantenimiento general

Importante:

- el rol de `tms_usuarios` sigue siendo relevante
- pero no siempre basta por si solo
- varios modulos ya exigen tambien `scope` o policy ABAC

### Roles y Permisos

Pantalla:

- `/admin/roles`

Sirve para:

- revisar roles IAM
- revisar permisos base que trae cada rol

Ejemplos de permisos relevantes:

- `manage_panel`
- `view_panel`
- `manage_workflows`
- `view_workflows`
- `manage_quality`
- `manage_postventa`
- `deploy_ota`

### Ambitos

Pantalla:

- `/admin/roles?vista=scopes`

Sirve para:

- dar acceso a un usuario en un eje puntual
- por ejemplo `centro_costo`

Caso comun:

- un usuario tiene `manage_panel`
- pero no puede editar una N.V.
- normalmente falta el scope de `centro_costo`

### Equipos y Grupos

Pantalla:

- `/admin/roles?vista=teams`

Sirve para:

- crear `teams`
- crear `groups`
- asignar miembros
- asignar roles heredables a teams o groups

Uso recomendado:

- permisos repetitivos para varias personas
- operaciones por area o celula de trabajo
- herencia centralizada en vez de grants usuario por usuario

## 5. Metodo recomendado para configurar permisos

Orden recomendado:

1. Verifica que el usuario exista y este activo
2. Verifica su rol base en `tms_usuarios`
3. Revisa si el modulo necesita permiso base
4. Revisa si ademas necesita `scope`
5. Revisa si la accion esta bloqueada por politica ABAC o workflow

## 6. Ejemplo practico: permitir editar N.V. en Panel

Para editar una N.V. en Panel normalmente intervienen 3 capas:

1. permiso base

- `manage_panel`

2. alcance

- `scope_type = 'centro_costo'`
- `scope_code = <centro de costo de la N.V.>`

3. politica de negocio

- estado de la N.V.
- workflow
- reglas ABAC

Eso significa que un usuario puede tener rol correcto y aun asi fallar si:

- no tiene scope
- la N.V. esta en estado bloqueado
- el flujo de transicion no permite ese cambio

## 7. Configuracion manual desde la UI

### Dar acceso por centro de costo

1. Ir a `Admin > Identidad y Seguridad`
2. Abrir `Ambitos`
3. Buscar el usuario
4. Seleccionar el rol correcto
5. Elegir:

- `scope_type = centro_costo`
- `scope_code = <codigo>`

6. Guardar

Ejemplo:

- usuario: `nilo@ptm.cl`
- rol: `SUPERVISOR`
- scope_type: `centro_costo`
- scope_code: `150`

### Dar acceso por herencia usando team o group

1. Ir a `Admin > Identidad y Seguridad > Equipos y Grupos`
2. Crear o seleccionar un `team`
3. Agregar miembros
4. Asignar rol heredable al `team`
5. Opcionalmente usar `group` si quieres un conjunto mas flexible

Ventaja:

- no repites grants en muchos usuarios

## 8. Configuracion manual desde Supabase SQL

## 8.1 Buscar el usuario

```sql
select id, nombre, email, rol, auth_uid, activo
from public.tms_usuarios
where lower(email) = 'nilo@ptm.cl';
```

```sql
select id, nombre, correo, activo
from iam.users
where lower(correo) = 'nilo@ptm.cl';
```

## 8.2 Ver permisos efectivos del usuario

```sql
select *
from iam.user_effective_permissions
where user_id = '<AUTH_UID_DEL_USUARIO>'
order by permission, scope_type, scope_code;
```

## 8.3 Ver asignaciones con scope del usuario

La UI de `Ambitos` usa esta RPC:

```sql
select public.iam_asignaciones('<AUTH_UID_DEL_USUARIO>'::uuid);
```

## 8.4 Otorgar un scope a un usuario

Usa esta RPC:

```sql
select public.iam_asignar_scope(
  p_user       => '<AUTH_UID_DEL_USUARIO>'::uuid,
  p_role       => 'SUPERVISOR',
  p_scope_type => 'centro_costo',
  p_scope_code => '150',
  p_expires    => null
);
```

Notas:

- `p_user` es el `auth_uid`
- `p_role` debe existir en `iam.roles`
- `p_scope_type = 'global'` no se usa aqui

## 8.5 Revocar un scope

Primero obtienes el `id` de la asignacion y luego:

```sql
select public.iam_revocar_asignacion('<ASSIGNMENT_ID>'::uuid);
```

## 8.6 Asignar rol heredable a un team o group

```sql
select public.iam_principal_asignar_rol(
  p_principal_type => 'team',
  p_principal_id   => '<TEAM_ID>'::uuid,
  p_role           => 'SUPERVISOR',
  p_scope_type     => 'centro_costo',
  p_scope_code     => '150',
  p_expires        => null
);
```

Tambien puede ser:

- `p_principal_type = 'group'`

## 8.7 Refrescar grupos dinamicos

```sql
select public.iam_refresh_dynamic_groups();
```

Para uno especifico:

```sql
select public.iam_refresh_dynamic_groups('<GROUP_ID>'::uuid);
```

## 9. Como dar acceso global

Un acceso global no se administra con `iam_asignar_scope(...)`.

Para ambito global:

- el rol se asigna como `scope_type = global`
- normalmente eso se maneja por rol base o por una asignacion global en `iam.assignments`

Regla importante:

- usa global solo cuando realmente quieres acceso total
- si el modulo es sensible, prefiere `centro_costo`

## 10. Donde revisar si un usuario sigue bloqueado

Si aparece:

- `No tienes permisos IAM...`

revisa en este orden:

### A. Usuario activo

```sql
select nombre, email, activo
from public.tms_usuarios
where lower(email) = 'usuario@dominio.com';
```

### B. Espejo IAM

```sql
select id, nombre, correo, activo
from iam.users
where lower(correo) = 'usuario@dominio.com';
```

### C. Permisos efectivos

```sql
select permission, scope_type, scope_code
from iam.user_effective_permissions
where user_id = '<AUTH_UID_DEL_USUARIO>'
order by permission, scope_type, scope_code;
```

### D. Politica especifica del modulo

Ejemplo Panel:

- `manage_panel`
- `centro_costo`
- estado permitido
- workflow permitido

## 11. Diferencia entre permiso, scope y policy

### Permiso

Es la capacidad funcional.

Ejemplo:

- `manage_panel`

### Scope

Es sobre que ambito aplica ese permiso.

Ejemplo:

- `centro_costo = 150`

### Policy ABAC / Workflow

Es la regla de negocio adicional.

Ejemplo:

- no se puede editar una N.V. `Entregado`
- no se puede pasar a cierto estado si el workflow no lo permite

## 12. Consultas utiles para soporte

### Ver roles disponibles

```sql
select codigo, nombre, activo
from iam.roles
order by codigo;
```

### Ver permisos de un rol

```sql
select r.codigo as role_code, p.codigo as permission_code
from iam.roles r
join iam.role_permissions rp on rp.role_id = r.id
join iam.permissions p on p.id = rp.permission_id
where r.codigo = 'SUPERVISOR'
order by p.codigo;
```

### Ver todas las asignaciones de un usuario

```sql
select a.id, a.principal_type, a.scope_type, a.scope_code, r.codigo as role_code
from iam.assignments a
join iam.roles r on r.id = a.role_id
where a.principal_id = '<AUTH_UID_DEL_USUARIO>'::uuid
order by r.codigo, a.scope_type, a.scope_code;
```

## 13. Buenas practicas

- no usar `global` si basta con `centro_costo`
- no editar tablas IAM sensibles con SQL crudo si existe RPC
- revisar siempre `iam.user_effective_permissions`
- si el usuario sigue bloqueado, revisar policy ABAC y workflow, no solo roles
- para muchos usuarios, usar `teams` o `groups`

## 14. Procedimiento recomendado para soporte rapido

Si un usuario reporta bloqueo:

1. identificar email
2. revisar `tms_usuarios`
3. revisar `iam.users`
4. revisar `iam.user_effective_permissions`
5. confirmar permiso base del modulo
6. confirmar scope
7. confirmar estado o workflow del registro
8. corregir por UI o RPC

## 15. Archivos clave del proyecto

- `docs/IAM_ARQUITECTURA.md`
- `src/pages/Admin/AccessControl.jsx`
- `src/services/iamService.js`
- `supabase/migrations/125_iam_fase4_scopes.sql`
- `supabase/migrations/156_iam_org_admin_and_postventa_cutover.sql`

## 16. Resumen corto

Si quieres configurar IAM manualmente:

- UI: `Admin > Identidad y Seguridad`
- SQL: `Supabase > SQL Editor`
- usuario puntual por centro: `iam_asignar_scope(...)`
- herencia por grupo o equipo: `iam_principal_asignar_rol(...)`
- diagnostico real: `iam.user_effective_permissions`

