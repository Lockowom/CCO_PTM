# PR-001 — Inventario de Rutas y Permisos + Matriz de Regresión

**Programa:** CCO 2.0 · Release A (Foundation)
**PR:** PR-001
**Contrato:** PERMISSION_LOSS = 0 · ROUTE_LOSS = 0
**Fecha:** 2026-08-17

Este documento es el **baseline oficial** de rutas y permisos. La matriz de
regresión automatizada vive en `src/tests/routePermissionMatrix.test.js` y
**falla a propósito** si alguien agrega una ruta sin permiso, un permiso que no
existe en el catálogo, o cambia el acceso de un rol.

---

## 1. Reglas de seguridad (contrato)

1. **Fail-closed:** toda ruta protegida debe estar declarada en
   `ROUTE_PERMISSIONS` (`src/constants/permissions.js`). Una ruta sin entrada en
   el mapa es **DENEGADA** por defecto (`App.jsx`).
2. **Catálogo único:** todo permiso referenciado en rutas, pestañas o blueprints
   debe existir en `APP_PERMISSIONS` (`src/config/modules.js`). No se inventan
   permisos ad-hoc.
3. **Sin retirar permisos legacy:** los permisos de rutas retiradas del menú se
   mantienen en el catálogo hasta probar equivalencia (TXT 00).
4. **Landing dinámica:** el rol aterriza en la primera ruta que sus permisos
   desbloquean (`resolverRutaInicial`), sin listas manuales.

## 2. Puntos a tocar al agregar un módulo/ruta nuevo (checklist)

1. `src/App.jsx` — ruta lazy + `<Route>`.
2. `src/constants/permissions.js` — `ROUTE_PERMISSIONS['/ruta']` (+ `TAB_PERMISSIONS` si usa pestañas).
3. `src/components/Navbar.jsx` — item en `menuCategories` (visibilidad derivada de rutas).
4. `src/config/modules.js` — los 3 catálogos (`APP_MODULES`, `APP_ROUTES`, `APP_PERMISSIONS`).
5. Migración SQL — permisos en `tms_permisos` + fila en `tms_modules_config`.
6. `src/tests/routePermissionMatrix.test.js` — agregar la ruta/permiso al snapshot de regresión.

## 3. Inventario de rutas protegidas (2026-08-17)

### 3.1 Rutas públicas (sin login)
| Ruta | Componente | Nota |
|---|---|---|
| `/login` | `Login.jsx` | Login + MFA TOTP |
| `/verificar` | `VerificarCertificado.jsx` | QR certificado |
| `/soporte` | `SolicitudPublica.jsx` | Form público Post-Venta |
| `/consulta` | `ConsultaNV.jsx` | Consulta pública N.V. |
| `/rendiciones*` | `RendicionPublica.jsx` | 4 patrones con token |
| `*` | `NotFound.jsx` | 404 |

### 3.2 Rutas protegidas por permiso (fail-closed)
| Ruta | Permisos (OR) | Módulo |
|---|---|---|
| `/mobile/pda` | `view_stock`, `manage_inventory` | inventario |
| `/tms/control` | `view_tms`, `manage_tms`, `supervise_tms`, `manage_panel` | tms (oculto) |
| `/tms/pda` | `view_tms`, `manage_tms`, `manage_panel` | tms (oculto) |
| `/inbound/reception` | `view_reception`, `process_reception` | inbound |
| `/inbound/reception-nacional` | `view_reception`, `process_reception` | inbound |
| `/inbound/entry` | `view_entry`, `process_entry` | inbound |
| `/inbound/cubing` | `view_reception`, `process_reception` | inbound |
| `/inbound/data-import` | `manage_data_import` | inbound |
| `/queries/batches` | `view_batches` | queries |
| `/queries/sales-status` | `view_sales_status` | queries |
| `/queries/addresses` | `view_addresses` | queries |
| `/queries/locations` | `view_locations` | queries |
| `/queries/heatmap` | `view_locations` | inventario (URL histórica) |
| `/queries/historial-nv` | `view_historial_nv` | queries |
| `/queries/dispatch-control` | `view_dispatch_control` | queries |
| `/queries/datasheet` | `view_fichas` | queries |
| `/queries/grupo` | `view_batches`+`view_fichas`+`view_stock`+`manage_inventory`+`view_sales_status` | queries |
| `/inventory/traspasos` | `view_traspasos`, `manage_inventory`, `view_stock`, `view_batches`, `view_reception` | inventario |
| `/inventory/conteo` | `view_conteo`, `manage_conteo`, `supervise_conteo`, `manage_inventory` + tabs | inventario |
| `/inventory/bloque/:codigo` | `view_conteo`, `manage_conteo`, `supervise_conteo`, `manage_inventory` | inventario (QR) |
| `/inventory/analisis` | `view_analisis`, `manage_inventory`, `view_stock`, `view_batches`, `manage_data_import` + tabs | inventario |
| `/inventory/carteles` | `view_carteles`, `manage_inventory`, `view_stock`, `view_batches`, `view_reception` | inventario |
| `/inventory/insumos` | `view_insumos`, `manage_insumos`, `manage_inventory`, `view_stock` | inventario |
| `/panel` | `view_panel`, `manage_panel` | panel |
| `/panel/ingresar` | `panel_ingresar`, `manage_panel` | panel |
| `/panel/reaperturas` | `approve_panel_reopen_nv`, `manage_roles` | panel |
| `/panel/info` | `panel_info`, `manage_panel` | panel |
| `/panel/tv` | `panel_tv`, `manage_panel` | panel |
| `/panel/builder` | `panel_builder`, `manage_panel` | panel |
| `/panel/rutas` | gate privado por UID (piloto) | panel |
| `/panel/configuracion` | `manage_roles` (solo admin) | panel |
| `/quality/monitoreo` | `manage_monitoreo`, `manage_quality`, `manage_inventory` | quality |
| `/quality/acciones` | `view_acciones_calidad`, `manage_quality`, `manage_monitoreo` | quality |
| `/quality/bandeja` | `view_acciones_calidad`, `manage_quality`, `manage_monitoreo` | quality |
| `/quality/clasificacion` | `manage_quality`, `manage_monitoreo` | quality |
| `/postventa/tickets` | `view_postventa`, `manage_postventa`, `supervise_postventa` + tabs | postventa |
| `/seguridad` | `[]` (cualquier autenticado) | — |
| `/admin/users` | `manage_users`, `view_users` | admin |
| `/admin/roles` | `manage_roles`, `view_roles` | admin |
| `/admin/views` | `manage_views`, `view_views` | admin |
| `/admin/cleanup` | `manage_cleanup` | admin |
| `/admin/tickets` | `manage_tickets` | admin |
| `/admin/upload-history` | `admin_upload_history` | admin |
| `/admin/locations` | `manage_locations` | admin/inventario |
| `/admin/location-requests` | `manage_locations` | admin/inventario |
| `/admin/bodegas-softland` | `manage_locations` | admin |
| `/admin/monitor` | `admin_monitor` | admin |
| `/admin/observability` | `admin_monitor` | admin |
| `/admin/workflows` | `view_workflows`, `manage_workflows` | admin |
| `/admin/flujo-maestro` | `view_workflows`, `manage_workflows` | admin |
| `/admin/eventos` | `view_eventos`, `manage_eventos` | admin |
| `/admin/api` | `view_api`, `manage_api` | admin |
| `/admin/rendiciones` | `view_rendiciones`, `manage_rendiciones` | admin |

### 3.3 Permisos por pestaña (`?tab=`)
- **Conteo:** `conteo_tab_{contar,sesiones,conciliacion,ajuste,bloques,proyeccion}` + `_amplios`.
- **Análisis:** `analisis_tab_{resumen,antiguos,antiguos_disp,no_activos,duplicados,anomalias,detalle}` + `_amplios`.
- **Postventa:** `pv_tab_{tickets,bandeja,calendario,nuevo,dashboard,tecnicos}` + `_amplios`.

## 4. Matriz ruta × rol (snapshot de regresión)

Roles: `ADMIN` (bypass total) · `CONTROL_CALIDAD` · `GERENCIA` · `INVENTARIO_` ·
`OPERADOR` · `OPERARIO_3` · `SUPERVISOR` · `SUPERVISOR_`.

Acceso verificado por la suite (ver test). Reglas clave:
- **ADMIN** y `es_admin_delegado` pasan siempre.
- **Aditivos intencionales:** bodega entra a Calidad (`manage_inventory`),
  Control Calidad entra a Análisis (`view_batches`), etc. No son fugas: están
  declarados en `ROUTE_PERMISSIONS` y cubiertos por la matriz.
- `/panel/configuracion` exige `manage_roles` → solo admin.
- `/panel/rutas` es piloto privado: ni siquiera otro ADMIN entra.

## 5. Hallazgos detectados y resueltos

1. **Permisos TMS fuera del catálogo.** Las rutas `/tms/*` siguen vivas en
   `App.jsx` y `ROUTE_PERMISSIONS`, pero `view_tms`/`manage_tms`/`supervise_tms`
   habían sido removidos de `APP_PERMISSIONS`. **Resuelto:** se restauraron en el
   catálogo (sin reactivar el menú) para cumplir `PERMISSION_LOSS=0`.
2. **Rutas `/tms/*` fuera de `APP_ROUTES`.** Se restauraron como entradas del
   catálogo (módulo oculto) para que la matriz de regresión sea completa.