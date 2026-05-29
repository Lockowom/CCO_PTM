# Revisión Completa del Proyecto CCO_PTM

> **Fecha:** 2026-05-29 · **Versión auditada:** 1.4.13 · **Rama:** `claude/documentation-review-G3x0i`
> **Alcance:** código (`src/`, 85 archivos JS/JSX), base de datos (`supabase/migrations/` +
> `SUPABASE_*.sql`), y documentación (29 archivos `.md`).
> Este informe es la base para decidir las correcciones. Las acciones de fondo (seguridad,
> consolidación SQL, refactors) se listan en el **Roadmap (§6)** y quedan pendientes de tu decisión.

---

## 1. Resumen ejecutivo

| Categoría | 🔴 Crítico | 🟠 Alto | 🟡 Medio | 🟢 Bajo |
|---|---|---|---|---|
| Seguridad | 2 | 2 | 2 | — |
| Base de datos / SQL | — | 3 | 1 | — |
| Calidad de código | — | 2 | 4 | 2 |
| Documentación | — | 1 | 3 | — |

**Estado general:** la base arquitectónica es sólida (auth migrada a Supabase Auth, RLS en la
mayoría de tablas, headers de seguridad, offline-first, tests). Las debilidades son de
**autorización server-side**, **gestión de SQL no versionada** y **documentación redundante/
desactualizada**.

> ### ⚠️ Actualización 2026-05-29 — corrección de la auditoría tras inspeccionar la BD live
> La auditoría inicial se basó en los archivos `SUPABASE_*.sql`/`migrations` del **repo**, que
> están **obsoletos** respecto a la base de datos en producción. Al inspeccionar la BD live
> (Supabase MCP) se confirmó que:
> - **S-1 ya estaba corregido en prod:** `clean_operational_data` vive como
>   `private.clean_operational_data` (SECURITY DEFINER) con gate `IF NOT private.is_admin() …`.
>   **No es explotable.** Se sincronizó el archivo stale del repo para que no revierta el fix.
> - **S-2 ya estaba corregido en prod:** `tms_inventario_general` **tiene RLS habilitada**.
>   Solo faltaba el `ENABLE` en el archivo de migración del repo (corregido).
> - **Hueco real encontrado (S-0):** los advisors de Supabase mostraron que `bulk_upsert` y
>   `search_batches` (SECURITY DEFINER) eran ejecutables por el rol **`anon`** → escritura/
>   lectura **sin autenticación**. **Corregido y verificado** (migración `004`).
>
> Ver "Estado de remediación" en cada hallazgo abajo.

---

## 2. Seguridad

### ✅ S-0 — `anon` podía ejecutar `bulk_upsert` / `search_batches` (RESUELTO)
Hallazgo **real** (advisors Supabase 0028/0029). `public.bulk_upsert` (escribe en tablas
whitelisted, SECURITY DEFINER → bypassa RLS) y `public.search_batches` eran ejecutables por el
rol `anon` vía `/rest/v1/rpc/...` → **escritura/lectura sin autenticación**. Además tenían
`search_path` mutable.
**Resuelto (migración `004`, aplicada y verificada en prod):** `REVOKE EXECUTE … FROM PUBLIC,
anon` (se conserva `authenticated`), `SET search_path = public, extensions, pg_temp`, y `REVOKE
SELECT … FROM anon` en `mv_dashboard_kpis`. Verificado: `anon` ya no puede ejecutar; la app
(autenticada) sigue operando.

### ✅ S-1 — `clean_operational_data()` (RESUELTO en prod; archivo repo sincronizado)
La versión **del repo** (`SUPABASE_TRANSACTIONAL.sql`) no tenía gate, pero **producción ya está
endurecida**: `private.clean_operational_data` es `SECURITY DEFINER` con
`IF NOT private.is_admin() THEN RAISE EXCEPTION 'Acceso denegado: solo administradores'`, más un
wrapper `public`. **No explotable.** Se actualizó el archivo stale del repo para que coincida y
no revierta la protección si se re-ejecuta.

### ✅ S-2 — RLS en `tms_inventario_general` (RESUELTO en prod; migración repo corregida)
En la BD live la tabla **tiene RLS habilitada** (1 política). El archivo
`supabase/migrations/003_rls_policies.sql:80` solo omitía el `ENABLE ROW LEVEL SECURITY`
(corregido en el repo).

### 🟠 S-3 — Permisos solo client-side (ALTO)
`src/constants/permissions.js`, `src/App.jsx:213-218`, `src/context/AuthContext.jsx:484`.
`ROUTE_PERMISSIONS` y `hasPermission()` se evalúan únicamente en React. Sin respaldo
server-side, los RPC sensibles son invocables saltándose la UI (DevTools / API directa).
**Fix sugerido:** validar autorización dentro de cada RPC sensible (`is_admin()` u owner-check).

### 🟠 S-4 — RLS Tier-1 "auth-only" + exposición de `password_hash` (DECISIÓN + acción pendiente)
`003_rls_policies.sql:26-94`. Política única `auth.role() = 'authenticated'` para `ALL` en las
tablas operacionales (confirmado por advisors: 30+ políticas "always true").
- **Decisión (2026-05-29): se mantiene** el modelo permisivo en tablas **operacionales**. Es un
  WMS/TMS **interno** donde todos los empleados autenticados necesitan operar sobre los mismos
  datos (NV, picking, packing, rutas). Segmentar por fila rompería los flujos. Las tablas
  sensibles (`tms_usuarios`, `tms_roles`, `tms_modules_config`, `tms_tickets`) ya tienen Tier-2
  (escritura solo admin). Se acepta como riesgo de diseño documentado.
- **Sub-hallazgo real pendiente:** la columna legacy **`tms_usuarios.password_hash`** es
  **legible por cualquier autenticado** (política SELECT "always true"). El cliente nunca la lee
  (`Users.jsx` solo escribe un placeholder). Mitigación requiere confirmación (ver §S-5/auth).

### 🟡 S-5 — Legacy de auth: `verify_user_password` + `password_hash` (ACCIÓN PENDIENTE — requiere OK)
Auditoría live: **21/21 usuarios ya migrados** a `auth.users` (`auth_uid` no nulo) → el fallback
legacy `verify_user_password` (que compara contra `password_hash`) **ya no es necesario**.
- **No tocado aún (riesgo de lockout):** eliminar `verify_user_password` + la columna
  `password_hash` + el fallback en `AuthContext.jsx` cierra la exposición de hashes y limpia
  residuo, pero afecta la ruta de login. **Pendiente de tu confirmación.**
- "Leaked password protection" de Supabase Auth está **desactivada** → activar en el dashboard
  de Auth (no es SQL).

### 🟡 S-6 — Sentry 7.114.0 desactualizado (MEDIO)
`package.json`. La línea 8.x es la actual; 7.x puede acumular CVEs. Evaluar upgrade con pruebas.

### 🟢 Positivos
`.env` en `.gitignore`; sin secretos hardcodeados (`src/supabase.js` usa `import.meta.env`);
`server.js` con CSP/HSTS/X-Frame-Options/Permissions-Policy y sin endpoints abiertos (solo SPA);
RPCs auth con queries parametrizadas; guard de sesión realtime (logout si el usuario se desactiva).

---

## 3. Base de datos / SQL

### ✅ DB-1 — SQL sin versionar ni ordenar (RESUELTO)
Los **~15 archivos sueltos** de la raíz + carpeta `database/` se movieron a
`supabase/legacy_sql/` (con README "no ejecutar"). La fuente de verdad ahora es
`supabase/migrations/` (numeradas) + `supabase/functions_snapshot.sql`. Ver `supabase/README.md`.
> Nota: el DDL `CREATE TABLE` de las ~30 tablas sigue sin versionarse (vive en la BD live). Se
> puede generar un `000_schema.sql` con `pg_dump --schema-only` cuando se desee — pendiente menor.

### ✅ DB-2 — Definiciones de "admin" duplicadas (RESUELTO)
Canónica única: **`private.is_admin()`** (por `auth_uid`, SECURITY DEFINER) + wrapper
`public.is_admin()`. Se eliminaron los helpers legacy por email `is_admin_safe()` e
`is_user_admin()` (migración `005`, aplicada en live). Confirmado: sin referencias en políticas,
funciones ni código.

### ✅ DB-3 — RPCs no versionadas (RESUELTO)
Se exportaron desde la BD live e incorporaron a `supabase/functions_snapshot.sql`:
`bulk_upsert`, `search_batches`, `fuzzy_search`, `get_dashboard_kpis`, `batch_update_nv_estado`,
`prepare_nv_import`, `sync_deleted_items` + capa de seguridad `private.*` y wrappers.
> Hallazgo: `wms_move_stock`, `wms_reserve_stock`, `get_fefo_allocation` referencian tablas
> **inexistentes** (`wms_inventory`, `wms_kardex`, `wms_allocations`) → código muerto a nivel de
> datos, pero `InventoryService` se importa en `Picking.jsx` y `syncManager` referencia
> `wms_move_stock`. Limpiar requiere desconectar esas rutas — pendiente (ver C-4).

### 🟡 DB-4 — Migración referencia tablas que no crea (MEDIO)
`003_rls_policies.sql` habilita RLS / crea políticas sobre 30 tablas cuyo DDL no está en
`migrations/`. La migración asume que ya existen (creadas fuera de control de versiones).

---

## 4. Calidad de código

### 🟠 C-1 — Race condition: falta `await` (ALTO)
`src/store/warehouseStore.js:228` — `get().fetchWarehouseData();` sin `await` dentro de
`moveItem()`. La UI puede quedar desincronizada del backend.

### 🟠 C-2 — Promesas sin manejo de error (ALTO)
- `src/pages/TMS/MobileApp.jsx:77` — `update(...).then();` sin `.catch` (falla silenciosa al
  marcar conductor `EN_RUTA`).
- `src/pages/Inbound/Reception.jsx:289` — `lookupDescription(...).then(...)` sin `.catch`.

### 🟡 C-3 — `catch` vacíos que tragan errores (MEDIO)
`src/pages/Admin/DataImport.jsx:765` (`.then(()=>{}).catch(()=>{})` en log a
`tms_historial_cargas`) y `src/context/AuthContext.jsx:431` (borrado de `tms_usuarios_activos`).

### 🟡 C-4 — Código muerto (MEDIO)
Nunca importados: `src/components/Placeholder.jsx`, `src/components/ui/PageTransition.jsx`,
`src/components/ui/SkeletonCard.jsx`, `src/components/ui/SkeletonTable.jsx`.

### 🟡 C-5 — Dos carpetas de store (MEDIO)
Coexisten `src/store/` (warehouseStore, usado en WmsLocations/Heatmap) y `src/stores/`
(pickingStore, usado en Picking). Ambas activas → confusión. Unificar en `src/stores/`.

### 🟡 C-6 — God-components (MEDIO)
`DataImport.jsx` (1269 líneas), `Reception.jsx` (1073), `Picking.jsx` (825), `Entry.jsx` (824),
`Packing.jsx` (818). Candidatos a dividir en subcomponentes.

### 🟢 C-7 — Limpieza menor (BAJO)
- 68 `console.*` en producción (sobre todo `AuthContext.jsx`, `mobileService.js`, `syncManager.js`).
- 69 usos de `new Date().toISOString()` sin util central; código comentado en
  `hooks/useScanner.js:25` y `services/wmsLogic.js:47`.

### 🟢 Positivos
0 TODO/FIXME pendientes; intervalos, listeners y subscripciones realtime se limpian bien
(sin fugas evidentes); 247 try/catch; dependency arrays correctos; sin `eval`/`dangerouslySetInnerHTML`.

---

## 5. Documentación

### 🟠 D-1 — Versiones contradictorias entre docs (ALTO)
Fuente de verdad: `package.json` = **1.4.13**.
- `README.md`, `DOCUMENTACION_OFICIAL.md`, `MANUAL_USUARIO_V2.md` → "v2.0".
- `DOCUMENTACION_TECNICA.md` → "1.0.0".
> **Corregido en esta revisión:** se añadieron notas aclaratorias en los 4 documentos
> (semver 1.4.13 vs hito de producto "v2.0"), y `DOCUMENTACION_TECNICA.md` se marcó como histórico.

### 🟡 D-2 — Versiones de dependencias erróneas (MEDIO)
`DOCUMENTACION_PROYECTO.md` §10/§8 declaraba Zustand 5.0.5 (real `^4.5.2`), Sonner 1.7.4
(real `^2.0.7`), Tailwind 3.4.17 (`^3.3.5`) y plugins Capacitor con patch inventado.
> **Corregido en esta revisión:** alineado a los rangos de `package.json`.

### 🟡 D-3 — Tablas y notas faltantes (MEDIO)
Faltaban `tms_usuarios_activos` y `wms_layout` en §3, y no se aclaraba que varias tablas se
cargan vía `bulk_upsert` ni que parte del DDL/RPC vive fuera de `migrations/`.
> **Corregido en esta revisión.**

### 🟡 D-4 — Redundancia entre 29 documentos (MEDIO)
- 3 docs de navegación solapados: `INICIO_AQUI.md`, `INDICE_VISUAL.md`, `README_DOCUMENTACION.md`.
- 2 maestros casi duplicados: `DOCUMENTACION_PROYECTO.md` ↔ `DOCUMENTACION_TECNICA.md` (~70%).
- Cluster "mejoras" (`INICIO_MEJORAS`, `QUICK_START_MEJORAS`, `GUIA_IMPLEMENTACION_MEJORAS`,
  `ROADMAP_PRIORIZACION`, `CHECKLIST_VERIFICACION`, `ANALISIS_*`, `RESUMEN_*`,
  `INDICE_DOCUMENTOS_MEJORAS`) y docs históricos (`FIX_GUARDADO`, `RESUMEN_CONVERSACION_*`).
**Recomendación:** 1 fuente canónica (`DOCUMENTACION_PROYECTO.md`) + 1 índice; mover lo
histórico/de mejoras a `docs/archivo/`.

### 🟢 Positivos
`DOCUMENTACION_PROYECTO.md` es muy preciso: estructura de archivos, hooks, servicios y rutas
(32/32) coinciden con el código; conteo de tests correcto (21+10+8 = 39).

---

## 6. Roadmap de remediación priorizado

### Inmediato (seguridad) — ✅ HECHO (2026-05-29)
1. ✅ **S-0** Cerrado acceso `anon` a `bulk_upsert`/`search_batches` + `search_path` fijo
   (migración `004`, aplicada y verificada en prod).
2. ✅ **S-1** `clean_operational_data` — ya endurecida en prod; archivo stale del repo sincronizado.
3. ✅ **S-2** RLS en `tms_inventario_general` — ya activa en prod; migración del repo corregida.

### Corto plazo — ✅ HECHO (2026-05-29)
4. ✅ **C-1/C-2/C-3** Fix del `await` (`warehouseStore.js`) y promesas sin `.catch`
   (`MobileApp.jsx`, `Reception.jsx`, `DataImport.jsx`, `AuthContext.jsx`).
5. ✅ **DB-1/DB-2/DB-3** SQL suelto movido a `supabase/legacy_sql/`; `is_admin` unificado en
   `private.is_admin()` (legacy `is_admin_safe`/`is_user_admin` eliminados, migración `005`);
   RPC versionadas en `supabase/functions_snapshot.sql`.
6. ✅ **C-4 (parcial)** Eliminados 4 componentes muertos (`Placeholder`, `PageTransition`,
   `SkeletonCard`, `SkeletonTable`).
7. ⏳ **S-4/S-5** Modelo RLS operacional permisivo: **se mantiene** (decisión documentada).
   **Pendiente de tu OK:** eliminar `verify_user_password` + columna `password_hash` + fallback
   de login (cierra exposición de hashes). Activar "leaked password protection" (dashboard Auth).

### Backlog
8. **C-5/C-6/C-7** Unificar `store/`↔`stores/`, dividir god-components, limpiar `console.*` y
   centralizar utilidades de fecha. Limpiar RPCs/servicio de stock muerto (`wms_move_stock` etc.).
9. **D-4** Consolidar/archivar los 29 documentos.
9. **S-6** Upgrade Sentry 8.x.

> Próximo bloque sugerido: **DB-1/DB-2/DB-3** (consolidar SQL y versionar RPCs) o **S-4/S-5**
> (modelo RLS por rol). Indícame cuál seguir. Cada cambio de código/BD se refleja en la
> documentación (regla en `CLAUDE.md`).

---

## Anexo — Correcciones ya aplicadas en esta revisión
Solo documentación (sin tocar código ni BD):
- `DOCUMENTACION_PROYECTO.md`: versiones §8/§10 alineadas a `package.json`; §3 con
  `tms_usuarios_activos`, `wms_layout` y notas de carga vía `bulk_upsert` / SQL no versionado.
- `README.md`, `DOCUMENTACION_OFICIAL.md`, `MANUAL_USUARIO_V2.md`: nota semver 1.4.13 vs "v2.0".
- `DOCUMENTACION_TECNICA.md`: marcado como histórico (superado por `DOCUMENTACION_PROYECTO.md`).
- `CLAUDE.md` (nuevo): regla de doc-sync + contexto del proyecto.
