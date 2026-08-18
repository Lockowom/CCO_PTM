# PR-IAM-01 · Inventario real del IAM (baseline 2026-08-18)

> Fotografía de la realidad actual del sistema de acceso de CCO_PTM, tomada el
> **2026-08-18** desde código (`src/`) y base de datos en PROD (Supabase
> `vtrtyzbgpsvqwbfoudaf`) vía Management API. NO se modificó nada.
>
> Este documento es la **entrada del snapshot zero-loss (PR-IAM-00A)**. Su
> contrato de UX es `docs/IAM-001-control-acceso-ux.md`.

## 0. Resumen ejecutivo

| Concepto                                               | Valor                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| Usuarios en `tms_usuarios`                             | **16** (10 activos / 6 inactivos)                               |
| Roles en `tms_roles` (fuente canónica `permisos_json`) | **9**                                                           |
| Permisos en `tms_permisos`                             | **80**                                                          |
| Permisos en catálogo front `APP_PERMISSIONS`           | **80** (idénticos)                                              |
| Rutas declaradas (`ROUTE_PERMISSIONS`)                 | **52**                                                          |
| Módulos en `APP_MODULES`                               | **8** (tms comentado/oculto)                                    |
| Mapas de pestañas (`TAB_PERMISSIONS`)                  | **3** (conteo, analisis, postventa)                             |
| Asignaciones IAM (`iam.assignments`)                   | **18** (17 global + 1 bodega:100)                               |
| Equipos (`iam.teams` + members)                        | **8** (espejo de `tms_usuarios.rol`)                            |
| Delegaciones (`iam.delegations`)                       | **0**                                                           |
| Private beta                                           | **1** módulo (`/panel/rutas`, flag ON, nadie con rol de acceso) |
| RPCs con gate de permiso                               | ~40 (listadas en sección 5)                                     |
| Políticas RLS permisivas tier1 (`003`)                 | **vivientes** (hallazgo 2)                                      |

Regla de resolución del acceso efectivo (front, `AuthContext.loadRoleConfig`):
**`permisos_efectivos = permisos_IAM(iam_me) ∪ permisos_legacy(tms_roles.permisos_json del rol de tms_usuarios)`**
→ la unión garantiza "nunca menos acceso que hoy". ADMIN y `es_admin_delegado` saltan
todos los chequeos de ruta/permiso (menos private beta y rutas no declaradas).

## 1. Usuarios (tms_usuarios + iam.users)

| #   | Nombre           | Email             | Rol (`tms_usuarios.rol`) | Activo | Admin delegado |
| --- | ---------------- | ----------------- | ------------------------ | ------ | -------------- |
| 1   | Admin Respaldo   | admin@cco.cl      | ADMIN                    | ✅     | ✅             |
| 2   | Administrador    | admin@sistema.com | ADMIN                    | ✅     | —              |
| 3   | ARIEL SPOLANSKY  | ariel@ptm.cl      | CEO_PTM                  | ✅     | —              |
| 4   | Christian Vargas | chv@ptm.cl        | OPERARIO_3               | ✅     | —              |
| 5   | Cristopher       | inventary@ptm.cl  | INVENTARIO_              | ❌     | —              |
| 6   | Gisselle Romero  | gisselle@ptm.cl   | SUPERVISOR               | ❌     | —              |
| 7   | Juan Carlos      | jc@ptm.cl         | OPERADOR                 | ❌     | —              |
| 8   | Lucas Toloza     | lmodric@ptm.cl    | OPERADOR                 | ✅     | —              |
| 9   | Marco Negroni    | mnegroni@ptm.cl   | CONTROL_CALIDAD          | ✅     | —              |
| 10  | María Angélica   | angelica@ptm.cl   | SUPERVISOR_              | ✅     | —              |
| 11  | MOISES           | moi@ptm.cl        | OPERADOR                 | ❌     | —              |
| 12  | NILO Langebach   | nilo@ptm.cl       | SUPERVISOR               | ✅     | —              |
| 13  | Oscar Leiva      | oleiva@ptm.cl     | GERENCIA                 | ✅     | —              |
| 14  | PickingBD1       | picking1@ptm.cl   | OPERADOR                 | ❌     | —              |
| 15  | PickingBD3       | picking2@ptm.cl   | OPERADOR                 | ❌     | —              |
| 16  | Revision         | packing@ptm.cl    | OPERADOR                 | ✅     | —              |

## 2. Roles y sus permisos (tms_roles.permisos_json — fuente canónica)

| Rol             | Landing              | #   | Permisos                                                                                                                                                                                                                                                                          |
| --------------- | -------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADMIN           | /admin/users         | 80  | Todos los del catálogo (ver sección 4)                                                                                                                                                                                                                                            |
| CEO_PTM         | /panel               | 4   | panel_info, process_reception, view_panel, panel_tv                                                                                                                                                                                                                               |
| CONTROL_CALIDAD | /quality/monitoreo   | 14  | view_entry, process_entry, view_reception, process_reception, manage_monitoreo, manage_quality, view_acciones_calidad, view_batches, view_locations, view_addresses, view_fichas, view_carteles, view_historial_nv, panel_tv                                                      |
| GERENCIA        | /panel               | 26  | inbound(5), manage_monitoreo, manage_quality, view_acciones_calidad, postventa(9: view/manage/supervise + 6 tabs), panel(7: view_panel, manage_panel, approve_panel_reopen_nv, panel_ingresar, panel_info, panel_tv, panel_builder), view_batches, view_addresses, view_locations |
| INVENTARIO_     | /inventory/traspasos | 30  | view_stock, manage_inventory, view_traspasos, view_carteles, view_insumos, manage_insumos, manage_locations, view_analisis + 7 tabs, view_conteo, manage_conteo + 6 tabs, inbound(5), view_batches, view_locations, view_addresses                                                |
| OPERADOR        | /mobile/pda          | 6   | view_entry, view_reception, view_batches, view_locations, view_sales_status, view_carteles                                                                                                                                                                                        |
| OPERARIO_3      | /queries/batches     | 6   | view_batches, view_addresses, view_locations, view_entry, view_reception, manage_data_import                                                                                                                                                                                      |
| SUPERVISOR      | /panel/ingresar      | 4   | view_panel, panel_ingresar, panel_info, **manage_panel**                                                                                                                                                                                                                          |
| SUPERVISOR_     | /panel/ingresar      | 12  | view_entry, process_entry, view_reception, manage_data_import, view_carteles, view_historial_nv, view_batches, view_addresses, view_locations, **manage_panel**, panel_ingresar, panel_info                                                                                       |

⚠️ Los blueprints front (`src/config/iamBlueprints.js`) NO coinciden con la BD:
OPERADOR (14 vs 6), GERENCIA (29 vs 26), etc. **La BD manda**; los blueprints
solo se usan para sembrar y tests (hallazgo 7).

## 3. Asignaciones IAM (iam.assignments) — 18

| Usuario            | Rol IAM         | Scope                   | Nota                                     |
| ------------------ | --------------- | ----------------------- | ---------------------------------------- |
| Admin Respaldo     | ADMIN           | global                  |                                          |
| Administrador      | ADMIN           | global                  |                                          |
| ARIEL SPOLANSKY    | CEO_PTM         | global                  |                                          |
| Christian Vargas   | OPERARIO_3      | global                  |                                          |
| Cristopher         | INVENTARIO_     | global                  | inactivo                                 |
| Gisselle Romero    | SUPERVISOR      | global                  | inactiva                                 |
| Juan Carlos        | OPERADOR        | global                  | inactivo                                 |
| Lucas Toloza       | OPERADOR        | global                  |                                          |
| Marco Negroni      | CONTROL_CALIDAD | global                  |                                          |
| **María Angélica** | **SUPERVISOR_** | **global + bodega:100** | único scope restringido + global         |
| MOISES             | OPERADOR        | global                  | inactivo                                 |
| **NILO Langebach** | **SUPERVISOR**  | **global**              |                                          |
| Oscar Leiva        | GERENCIA        | global                  | + rol `rendiciones_oscar` global (extra) |
| PickingBD1         | OPERADOR        | global                  | inactivo                                 |
| PickingBD3         | OPERADOR        | global                  | inactivo                                 |
| Revision           | OPERADOR        | global                  |                                          |

Equipos (`iam.teams`, espejo del rol): ROL_ADMIN(2), ROL_CONTROL_CALIDAD(1),
ROL_GERENCIA(1), ROL_INVENTARIO(1), ROL_OPERADOR(6), ROL_OPERARIO_3(1),
ROL_SUPERVISOR(2), ROL_SUPERVISOR_LEGACY(1). **Delegaciones: 0.**

## 4. Catálogo de permisos (80) — grupos

- **inventario (24)**: view_stock, manage_inventory, view_traspasos, view_carteles,
  view_insumos, manage_insumos, manage_locations, view_analisis + analisis_tab_*
  (resumen, antiguos, antiguos_disp, no_activos, duplicados, anomalias, detalle),
  view_conteo, manage_conteo, supervise_conteo + conteo_tab_* (contar, sesiones,
  conciliacion, ajuste, bloques, proyeccion)
- **inbound (5)**: view_entry, process_entry, view_reception, process_reception, manage_data_import
- **queries (9)**: view_historial_nv, view_dispatch_control, view_batches, view_sales_status,
  view_addresses, view_locations, view_fichas, manage_fichas, export_data
- **quality (3)**: manage_monitoreo, manage_quality, view_acciones_calidad
- **panel (7)**: view_panel, manage_panel, approve_panel_reopen_nv, panel_ingresar, panel_info, panel_tv, panel_builder
- **asistente (1)**: view_asistente
- **postventa (9)**: view_postventa, manage_postventa, supervise_postventa + pv_tab_* (tickets, bandeja, calendario, nuevo, dashboard, tecnicos)
- **admin (19)**: view_users, manage_users, view_roles, manage_roles, view_views, manage_views,
  manage_tickets, admin_upload_history, admin_monitor, deploy_ota, view_workflows,
  manage_workflows, view_eventos, manage_eventos, view_api, manage_api, view_rendiciones,
  manage_rendiciones, manage_cleanup
- **tms (3, oculto)**: view_tms, manage_tms, supervise_tms

## 5. Acceso efectivo — NILO (SUPERVISOR) — "¿Qué puede hacer hoy Nilo?"

Permisos efectivos: `{view_panel, panel_ingresar, panel_info, manage_panel}` (legacy ∪ IAM).

| Función                                                 | Estado    | Vía                                                  |
| ------------------------------------------------------- | --------- | ---------------------------------------------------- |
| Entrar a / y /seguridad (2FA)                           | ✅        | autenticado                                          |
| Panel PTM → Dashboard (/panel)                          | ✅        | view_panel / manage_panel                            |
| Panel PTM → Ingresar N.V. (/panel/ingresar)             | ✅        | panel_ingresar / manage_panel                        |
| Panel PTM → Info N.V. (/panel/info)                     | ✅        | panel_info / manage_panel                            |
| Panel PTM → Modo TV (/panel/tv)                         | ✅        | manage_panel                                         |
| Panel PTM → Builder (/panel/builder)                    | ✅        | manage_panel                                         |
| Panel PTM → Solicitudes reapertura (/panel/reaperturas) | ❌        | approve_panel_reopen_nv / manage_roles               |
| Panel PTM → Coordinación Rutas (/panel/rutas)           | ❌        | private beta: sin rol cco_private_beta_rutas         |
| Panel PTM → Configuración (/panel/configuracion)        | ❌        | manage_roles                                         |
| Crear N.V. (guardar_nv)                                 | ✅        | manage_panel + scope global                          |
| Editar N.V. (guardar_nv update)                         | ✅        | manage_panel                                         |
| Cambiar estado N.V. (cambiar_estado_nv)                 | ✅        | manage_panel + scope                                 |
| **Eliminar N.V. (eliminar_nv)**                         | ❌        | allowlist hardcodeada (solo admin + angelica@ptm.cl) |
| Solicitar reapertura (solicitar_reapertura_nv)          | ✅        | manage_panel                                         |
| Resolver reapertura (resolver_reapertura_nv)            | ❌        | approve_panel_reopen_nv                              |
| Asistente IA (ia_*)                                     | ❌        | view_asistente                                       |
| IAM (asignar scope, usuarios, etc.)                     | ❌        | no admin                                             |
| Stock/Insumos/Conteo/Post-Venta/Quality/Admin           | ❌        | sin permisos                                         |
| **bulk_upsert (carga masiva de stock)**                 | ⚠️ **SÍ** | **sin gate por permiso — cualquier authenticated**   |

## 6. Acceso efectivo — ANGÉLICA (SUPERVISOR_) — "¿Qué puede hacer hoy Angélica?"

Permisos efectivos: `{view_entry, process_entry, view_reception, manage_data_import,
view_carteles, view_historial_nv, view_batches, view_addresses, view_locations,
manage_panel, panel_ingresar, panel_info}` + scope **global y bodega:100**.

| Función                                             | Estado           | Vía                                                                                                                                           |
| --------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Entrar a / y /seguridad (2FA)                       | ✅               | autenticado                                                                                                                                   |
| Inbound → Recepción Import./Nac., Cubicaje          | ✅               | view_reception / process_reception                                                                                                            |
| Inbound → Putaway                                   | ✅               | view_entry / process_entry                                                                                                                    |
| Inbound → Carga Masiva                              | ✅               | manage_data_import                                                                                                                            |
| Consultas → Lotes/Series, Grupo por SKU             | ✅               | view_batches                                                                                                                                  |
| Consultas → Historial N.V.                          | ✅               | view_historial_nv                                                                                                                             |
| Consultas → Direcciones, Ubicaciones, Mapa de Calor | ✅               | view_addresses / view_locations                                                                                                               |
| Inventario → Carteles de Bodega                     | ✅               | view_carteles                                                                                                                                 |
| Inventario → Traspasos y Ajustes                    | ✅               | view_batches (aditivo)                                                                                                                        |
| Inventario → Análisis de Códigos                    | ⚠️               | view_batches abre la ruta, **pero ninguna pestaña tiene permiso** (sin view_analisis ni analisis_tab_*) → pantalla sin contenido (hallazgo 5) |
| Inventario → Conteo / Insumos / PDA                 | ❌               | sin view_conteo / view_insumos / view_stock                                                                                                   |
| Panel PTM → Dashboard, Ingresar, Info, TV, Builder  | ✅               | manage_panel                                                                                                                                  |
| Panel PTM → Reaperturas, Configuración, Rutas       | ❌               | approve / manage_roles / beta                                                                                                                 |
| **Eliminar N.V. (eliminar_nv)**                     | ✅ **⚠ Crítico** | **allowlist individual hardcodeada: angelica@ptm.cl** (mig 099)                                                                               |
| Crear / Editar / Cambiar estado N.V.                | ✅               | manage_panel + scope global                                                                                                                   |
| Solicitar reapertura                                | ✅               | manage_panel                                                                                                                                  |
| Resolver reapertura                                 | ❌               | approve_panel_reopen_nv                                                                                                                       |
| IAM / Asistente / Admin / Stock                     | ❌               | sin permisos                                                                                                                                  |
| **bulk_upsert (carga masiva de stock)**             | ⚠️ **SÍ**        | sin gate por permiso                                                                                                                          |

> El ejemplo del ticket IAM-001 es EXACTO: Angélica = Eliminar N.V. ✅ (origen
> **Individual/legacy allowlist**), Nilo = Eliminar N.V. ❌ (No asignado).

## 7. Hallazgos para PR-IAM-00A (snapshot) y decisiones

1. **`bulk_upsert` sin gate por permiso**: cualquier `authenticated` escribe en 11
   tablas de stock (`tms_inventario_general`, `tms_partidas`, `tms_series`, …).
   El baseline zero-loss debe registrar esto como acceso efectivo (hoy NO se puede
   quitar sin romper "acceso actual").
2. **RLS tier1 permisiva (`003`)**: tablas operacionales con `USING (auth.role()='authenticated')`
   = todo autenticado lee/escribe stock directamente (hallazgo histórico, PR-008 phase 1).
3. **`eliminar_nv` con allowlist por email** (mig 099): no es un permiso del catálogo;
   es el caso real de "permiso individual/legacy". El IAM 2.0 debe modelarlo como
   función con origen Individual.
4. **Private beta `/panel/rutas`**: flag ON pero **nadie tiene el rol
   `cco_private_beta_rutas`** → nadie accede. Los permisos `view/manage_rutas_private_beta`
   no existen en el catálogo (backend-only).
5. **Rutas abiertas por permisos aditivos que no abren contenido** (Angélica → Análisis
   de Códigos sin pestañas; traspasos vía view_batches): el comparador Current vs IAM 2.0
   debe comparar por RUTA efectiva, no solo por permiso.
6. **`tms_roles_permisos` desactualizada** (puente legacy; 089 la escribe): la fuente
   canónica es `tms_roles.permisos_json` (y `iam.role_permissions` reconstruida en 122).
7. **Blueprints front desincronizados de BD** (OPERADOR 14 vs 6, GERENCIA 29 vs 26):
   los tests usan blueprints, no la BD. Al construir la UI de Control de Acceso usar
   SIEMPRE la BD como fuente.
8. **Roles "fantasma"**: `ADMIN_DEV` hardcodeado en DataImport/Heatmap (no existe);
   `CEO_PTM` solo en BD (Ariel) sin blueprint.
9. **`private.is_admin()` conserva EXECUTE para anon** (intencional, fail-closed false).
10. **Módulo TMS oculto con permisos/RPCs vivos** (120): superficie inactiva pero
    asignable/ejecutable; decidir en el mapeo si se hereda al IAM 2.0.
11. **Tabs**: los deep-links `?tab=` se filtran por `TAB_PERMISSIONS` en el Navbar,
    pero el guard de ruta NO distingue pestañas → comparar tabs visibles por usuario.
12. **`iam.mv_user_permissions`** no filtra por uid (134 revocó SELECT a authenticated).

## 8. Gates de referencia para la migración (V2)

```
CURRENT_PERMISSION_SNAPSHOT_COMPLETE = true   ← PR-IAM-00A (este inventario es la entrada)
USER_PERMISSION_LOSS = 0 · UNEXPECTED_PRIVILEGE_GAIN = 0 · ROUTE_ACCESS_LOSS = 0
TAB_ACCESS_LOSS = 0 · FUNCTION_ACCESS_LOSS = 0 · SCOPE_ACCESS_LOSS = 0
PRIVATE_BETA_ACCESS_LEAK = 0 · LEGACY_ACCESS_UNMAPPED = 0
```

## Archivos baseline (inmutables de aquí en adelante)

- `docs/iam-v2/baseline/usuarios.csv` · `roles_permisos.csv` · `asignaciones.csv` · `nilo_angelica_acceso_efectivo.csv`
