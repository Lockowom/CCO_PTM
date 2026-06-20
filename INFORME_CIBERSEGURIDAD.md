# Informe de Ciberseguridad — CCO_PTM (WMS + TMS)

> **Proyecto:** WMS + TMS (gestión de bodega y transporte)
> **Versión:** 1.4.26
> **Fecha:** 2026-06-20
> **Alcance:** Auditoría de seguridad (BD live `vtrtyzbgpsvqwbfoudaf` + frontend React) y remediación
> **Stack:** React 18 · Vite 5 · Supabase (PostgreSQL + RLS) · Zustand · React Query · Capacitor · Zod

---

## 1. Resumen ejecutivo

Se auditó el proyecto en tres frentes (base de datos, control de acceso, formularios) y se
implementaron cuatro líneas de endurecimiento. **No se encontraron vulnerabilidades de XSS ni
de inyección SQL.** Las escaladas de privilegios críticas ya habían sido cerradas en trabajo
previo (migraciones 004/006/014/015). Este ciclo añade **límites de entrada en formularios**,
**auditoría de acciones privilegiadas** y **hardening** de funciones e infraestructura.

| Estado | Resultado |
|---|---|
| Vulnerabilidades críticas activas | **0** |
| Escalada de privilegios | ✅ Cerrada (migraciones 014/015) |
| XSS (`dangerouslySetInnerHTML`/`innerHTML`/`eval`) | ✅ 0 ocurrencias en código de usuario |
| Inyección SQL | ✅ Mitigada (query builder de Supabase parametriza) |
| RLS habilitado | ✅ 38/38 tablas |
| Auditoría de acciones | ✅ Implementada (migración 016) |
| Validación de formularios | ✅ Implementada (zod + límites HTML) |

---

## 2. Hallazgos y remediación

### 2.1 Límites de entrada en formularios — **RESUELTO**

**Problema:** la mayoría de los inputs no tenían `maxLength`; los campos numéricos de cubicaje
(peso, largo, ancho, alto) aceptaban texto o valores arbitrariamente grandes; no existía librería
de validación. Riesgo de payloads gigantes, datos malformados y spam de envíos (doble-submit).

**Solución:** nueva librería de validación con **zod** y doble capa de defensa.

- `src/lib/validation/limits.js` — constantes de longitud/rango reutilizables.
- `src/lib/validation/schemas.js` — esquemas zod por formulario.
- `src/lib/validation/validateForm.js` — helper que valida y notifica con toast.

Aplicado en 10 formularios (HTML `maxLength` / `type=number min/max` + validación zod en submit +
guarda anti doble-submit): **Users, Roles, Drivers, Reception, CubingRegistry** (peso/dimensiones
con rango), **Entry, RoutePlanning, Tickets, Login**, y límite por celda en la **importación
masiva** (`DataImport`).

### 2.2 Control de acceso — **RESUELTO**

**Problema:** `Cleanup.jsx` (borrado masivo de datos operativos) no verificaba permisos en el
componente; dependía solo del guard de ruta y del `is_admin()` del RPC.

**Solución:** se agregó un gate de permisos en el propio componente
(`ADMIN` / `es_admin_delegado` / `manage_cleanup`) — defensa en profundidad.

> Nota: `es_admin_delegado` otorga acceso total **por diseño**, alineado con `private.is_admin()`
> del backend. Se mantiene intencionalmente.

### 2.3 Auditoría "quién hizo qué" — **RESUELTO** (migración 016, aplicada y verificada en vivo)

**Problema:** los cambios sobre usuarios/roles y la limpieza masiva no dejaban traza.

**Solución:**
- Tabla **`tms_auditoria`** — RLS: `SELECT` solo para administradores; sin escritura directa
  (solo la rellenan triggers/funciones `SECURITY DEFINER`).
- Trigger genérico **`tms_audit_row()`** en `AFTER INSERT/UPDATE/DELETE` de `tms_usuarios` y
  `tms_roles`, registrando actor, acción y datos antes/después.
- Traza de la limpieza masiva dentro de `clean_operational_data`.

Verificado con una prueba en transacción revertida: el trigger registró el cambio correctamente
sin persistir datos.

### 2.4 Hardening de BD e infraestructura — **RESUELTO**

- `public.update_updated_at_column()` con `search_path` fijo → cierra el lint 0011 de Supabase
  (confirmado: el advisor ya no lo reporta).
- `REVOKE EXECUTE` a `authenticated` en las funciones de trigger `tms_audit_row` y
  `tms_usuarios_freeze_privileged` (no deben ser invocables vía `/rpc`).
- Cabeceras de seguridad en `netlify.toml`: `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` y una `Content-Security-Policy` conservadora compatible
  con Supabase/Sentry/Leaflet. (Si el deploy real es Render, replicar en su panel.)
- Eliminado el código legacy `localStorage.getItem('currentUser')` en `AuthContext.jsx`.

---

## 3. Verificación

| Comprobación | Resultado |
|---|---|
| Tests unitarios (`npm test`) | ✅ 45/45 |
| Build de producción (`npm run build`) | ✅ OK |
| Trigger de auditoría (prueba revertida) | ✅ Registra cambios |
| Advisor `update_updated_at_column` | ✅ Desaparecido |
| Migración 016 en BD live | ✅ Aplicada y verificada |

---

## 4. Pendientes (requieren decisión)

1. **RLS permisivo en 25 tablas operativas** (`USING(true)`): es una decisión de diseño
   ("empleados de confianza"). Evaluar segmentar tablas sensibles (`tms_pesos`, `tms_rutas`).
2. **RPC de negocio `SECURITY DEFINER`** ejecutables por cualquier autenticado: varios ya validan
   permisos internamente; convertir el resto a `SECURITY INVOKER` es un cambio mayor.
3. **"Leaked Password Protection"** en Supabase Auth: activar desde el panel (no por SQL).
4. **Política de contraseñas**: actualmente mínimo 6 caracteres sin requisitos de complejidad
   (se mantuvo por decisión de negocio).

---

## 5. Referencias de código

| Componente | Ruta |
|---|---|
| Librería de validación | `src/lib/validation/{limits,schemas,validateForm}.js` |
| Gate de acceso a limpieza | `src/pages/Admin/Cleanup.jsx` |
| Migración de auditoría + hardening | `supabase/migrations/016_audit_and_hardening.sql` |
| Cabeceras de seguridad | `netlify.toml` |
| Control de admin (backend) | `private.is_admin()` |
| Congelado de privilegios | `public.tms_usuarios_freeze_privileged()` |

---

*Documento generado a partir de la auditoría y remediación del ciclo 1.4.26. La documentación
técnica canónica del proyecto vive en `DOCUMENTACION_PROYECTO.md` (§15 Changelog).*
