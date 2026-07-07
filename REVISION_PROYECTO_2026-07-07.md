# Revisión Completa del Proyecto CCO_PTM — Julio 2026

> **Fecha:** 2026-07-07 · **Versión auditada:** `1.4.59` (`package.json`) · **Rama:** `claude/project-review-zv6vu3`
> **Alcance:** código (`src/`, 91 archivos JS/JSX, ~27.700 líneas), base de datos live (Supabase
> project `WMS-CCO-PTM`, advisors + migraciones), build/tests, y sincronización de documentación.
> **Continuación de** `REVISION_PROYECTO.md` (2026-05-29, v1.4.13). Este informe verifica el estado
> de aquellos hallazgos y cubre todo lo nuevo (v1.4.17→1.4.59: Ficha Técnica, Monitoreo a Calidad,
> Informe de Daños, Costos de Transporte, Recepción Nacional, informes Word/PDF).

---

## 1. Resumen ejecutivo

| Categoría | 🔴 Crítico | 🟠 Alto | 🟡 Medio | 🟢 Bajo |
|---|---|---|---|---|
| Versionado BD / Documentación | — | 1 | 2 | 1 |
| Seguridad | — | 1 | 3 | 2 |
| Bugs — Módulo Calidad/Monitoreo | — | 1 | 5 | 3 |
| Bugs — Infraestructura / Offline | 1 | 3 | 3 | 2 |
| Calidad de código / Mantenibilidad | — | 1 | 3 | 3 |
| Build / Tooling | — | 1 | 1 | 1 |

**Estado de salud:** 🟢 **Tests 45/45 pasan** · 🟢 **`npm run build` compila** · la base arquitectónica
sigue siendo sólida y desde la revisión previa se cerraron fixes de seguridad reales (escalada de
privilegios RBAC, auditoría, hardening de `search_path`). Las debilidades principales hoy son:
**(1)** la carpeta `supabase/migrations/` del repo está **8 migraciones por detrás** de la BD live
(incluyendo fixes de seguridad) — rompe la regla canónica de "fuente de verdad"; **(2)** un puñado de
**bugs de correctitud reales en el módulo Calidad** (operaciones no transaccionales que pueden perder
datos) y en **offline/sync** (items que quedan atascados para siempre); **(3)** deuda de
mantenibilidad acumulada (código muerto, god-components, doble store).

---

## 2. Versionado de BD y Documentación

### 🟠 V-1 — 8 migraciones aplicadas en producción NO están en el repo (ALTO)
La regla canónica del proyecto (`CLAUDE.md`, y `supabase/README.md`) es que `supabase/migrations/`
es la fuente de verdad. Hoy el repo llega a **`016`**, pero la BD live tiene **8 migraciones más ya
aplicadas** que nunca se commitearon:

| Aplicada en live (`schema_migrations`) | Contenido | Repo |
|---|---|---|
| `create_operaciones_table` | tabla `operaciones` + RLS + índices | ❌ |
| `fix_rbac_privilege_escalation` | **fix de seguridad**: revierte `tms_usuarios/roles/permisos/roles_permisos` a lectura-auth + escritura-admin; trigger que congela columnas privilegiadas | ❌ |
| `015_consolidar_roles_basura` | saneo de roles (OPERARIO_3, SUPERVISOR, borra TRANSPORTE) | ❌ |
| `audit_and_hardening` | tabla `tms_auditoria` + triggers de auditoría; endurece `clean_operational_data` y `update_updated_at_column` | ❌ |
| `017_recepcion_nacionales` | tablas espejo Recepción Nacional | ❌ |
| `018_monitoreo_flags_preliminares` | `monitoreo_marcar_preliminar` + `cantidad_afectada` | ❌ |
| `019_calidad_lotes_series` | RPC `calidad_lotes_series` | ❌ |
| `020_monitoreo_no_registrado` | `no_registrado` + alerta a Inventario | ❌ |

Consecuencias: el repo **no puede reconstruir** la BD; dos fixes de **seguridad** (`fix_rbac_privilege_escalation`,
`audit_and_hardening`) viven solo en producción sin control de versiones; funciones que el frontend
llama (`monitoreo_marcar_preliminar`, `calidad_lotes_series`) no tienen respaldo en el repo.
**Acción:** exportar las 8 desde la BD live a `supabase/migrations/` (el SQL ya fue recuperado durante
esta revisión y está listo para commitear).

### 🟡 V-2 — Colisión de numeración de migraciones (MEDIO)
Hay números duplicados: `015_direcciones_transporte_y_busqueda` (repo) vs `015_consolidar_roles_basura`
(live), y `016_perm_view_transport_costs` (repo) vs `audit_and_hardening` (comentado internamente como
`016_audit_and_hardening.sql`). Al sincronizar V-1 hay que renumerar sin colisión (p. ej. `017…024`
por orden cronológico real) y ajustar el orden de aplicación.

### 🟡 V-3 — `functions_snapshot.sql` desactualizado (MEDIO)
El snapshot de RPCs no refleja las funciones nuevas de Calidad/Monitoreo/Fichas
(`monitoreo_dictaminar`, `monitoreo_marcar_preliminar`, `monitoreo_candidatos`, `calidad_lotes_series`,
`can_manage_calidad`, `get_ficha_producto`, `search_productos`, `buscar_direcciones`). Regenerarlo.

### 🟢 V-4 — Changelog al día (POSITIVO)
`DOCUMENTACION_PROYECTO.md` §15 sí llega a `1.4.59`; el detalle por versión es muy preciso. El
desfase es **solo** en los archivos `.sql` versionados, no en la narrativa.

---

## 3. Seguridad

> Verificado contra los advisors live (`get_advisors`) del proyecto `vtrtyzbgpsvqwbfoudaf`.

### 🟠 S-A — Autorización de rutas/permisos solo client-side (ALTO, = S-3 previo, PENDIENTE)
`ROUTE_PERMISSIONS` (`src/constants/permissions.js`) y `hasPermission()`
(`AuthContext.jsx:445-448`) se evalúan solo en React. La protección real recae en RLS. Para RPCs
sensibles la autz debe estar **dentro** de la función. **Bueno:** las RPCs de escritura de Calidad
(`monitoreo_dictaminar`, `monitoreo_marcar_preliminar`) sí validan rol/permiso server-side; las de
lectura (`calidad_lotes_series`, `search_productos`, `buscar_direcciones`) son solo-lectura.

### 🟡 S-B — Modelo RLS operacional permisivo (MEDIO, decisión documentada, se mantiene)
~30 tablas operacionales con política `ALL USING(true)` para `authenticated` (advisor
`rls_policy_always_true`). Es la decisión de diseño aceptada en S-4 (WMS/TMS interno). **Mejora real
lograda** desde la revisión previa: `fix_rbac_privilege_escalation` ya sacó `tms_usuarios/roles/
permisos/roles_permisos` de ese modelo (lectura-auth + escritura-admin + trigger anti-escalada).

### 🟡 S-C — Tabla `operaciones` con RLS abierta a rol público (MEDIO)
`create_operaciones_table` define `FOR SELECT/INSERT/UPDATE USING(true)` **sin** `TO authenticated`
→ aplica al rol por defecto (incluye `anon` si la tabla se expone por API). Es más laxa que el resto.
La tabla **no se usa en el frontend** (sin referencias en `src/`) → parece feature futura o import de
datos. Recomendación: restringir a `authenticated` o quitar del schema expuesto mientras no se use.

### 🟡 S-D — "Leaked password protection" sigue desactivado (MEDIO, acción manual)
Advisor `auth_leaked_password_protection`. Activar en Dashboard → Auth (no configurable por SQL).
Pendiente desde la revisión previa.

### 🟢 S-E — Vista materializada expuesta en API (BAJO)
`mv_dashboard_kpis` es `SELECT`-able por `anon`/`authenticated` (advisor `materialized_view_in_api`).
Bajo impacto (KPIs agregados), pero conviene revocar a `anon`.

### 🟢 S-F — Funciones SECURITY DEFINER ejecutables por `authenticated` (BAJO, por diseño)
14 funciones marcadas por el advisor `0029`. Es **intencional** (se revocó `anon` en migraciones
`004`/`010`/`011`, se conserva `authenticated`). No explotable sin sesión válida.

### 🟢 Positivos de seguridad
`.env` correctamente en `.gitignore` (sin `.env` trackeado); sin secretos hardcodeados en `src/`;
`server.js` con CSP/HSTS/X-Frame/Permissions-Policy; auditoría de cambios sensibles ya activa
(`tms_auditoria`).

---

## 4. Bugs — Módulo Calidad / Monitoreo (código nuevo v1.4.17→1.4.59)

### 🟠 CA-1 — `useActualizarInforme`: DELETE+INSERT sin transacción → pérdida de ítems (ALTO)
`src/services/calidadService.js:188-206`. Editar un informe de Monitoreo hace, en 3 peticiones HTTP
sueltas: `UPDATE cabecera` → `DELETE * ítems` → `INSERT nuevos`. Si el INSERT falla (RLS, timeout,
valor inválido), **los ítems ya se borraron y no se restauran**; queda cabecera con `total_items=N` y
0 filas. **Fix:** RPC transaccional (o `upsert` diff en vez de delete-all).

### 🟡 CA-2 — `monitoreo_next_numero` con carrera → viola UNIQUE en creación concurrente (MEDIO-ALTO)
`011_monitoreo_calidad.sql:225-241` + `calidadService.js:145`. Calcula `max(numero)+1` sin
lock/secuencia y en llamada separada del INSERT. Dos analistas simultáneos obtienen el mismo
`MON-2026-NNNN` → el segundo INSERT viola el `UNIQUE(numero)`. **Fix:** secuencia/`advisory lock`, o
generar el número dentro del mismo INSERT.

### 🟡 CA-3 — `useCrearInforme` no atómico → cabecera huérfana (MEDIO)
`calidadService.js:144-160`. Inserta cabecera y luego ítems por separado; si falla el segundo, queda
un informe con `total_items>0` y sin ítems.

### 🟡 CA-4 — `cantidad_afectada` persiste tras volver la condición a "OK" (MEDIO)
`Monitoreo.jsx:479-485` + `updateItem` (225). El input de "Uds afectadas" solo se muestra si
`condicion !== 'OK'`, pero al volver a "OK" el valor ya puesto queda en estado y **se persiste**.
Contamina Excel, resumen y los informes Word/PDF. **Fix:** limpiar `cantidad_afectada` cuando la
condición vuelve a "OK".

### 🟡 CA-5 — Borrar hallazgos de Daños deja fotos huérfanas en Storage + no transaccional (MEDIO)
`calidadService.js:310-314`. El `ON DELETE CASCADE` borra la fila de `tms_monitoreo_evidencias` pero
**no** el objeto JPG del bucket `monitoreo-evidencias` → fuga de almacenamiento permanente. Borrar el
objeto de Storage antes/junto al `DELETE`.

### 🟡 CA-6 — La precarga en modo edición pisa el trabajo en curso (MEDIO)
`Monitoreo.jsx:134-155` y `565-582`. `useEffect([editMode, itemsExistentes])` hace `setItems(...)`
incondicional cuando resuelve la query; si el usuario empezó a editar antes, se descarta su trabajo.
Ventana reproducible en móvil/conexión lenta. **Fix:** aplicar la precarga una sola vez (guard `ref`).

### 🟡 CA-7 — Reeditar informe DICTAMINADO desincroniza ítems ↔ overlay de calidad (MEDIO)
`Monitoreo.jsx:519` + `useActualizarInforme`. Al reeditar un dictaminado, los ítems se borran/reinsertan
perdiendo `dictamen`/`bodega_destino` (el mapeo de precarga 136-153 no los copia), pero las filas de
`tms_calidad_flags` siguen `vigente=true` apuntando a un `item_id` que ya no existe → Ubicaciones/Lotes
muestran badge viejo mientras el detalle vuelve a "Pendiente".

### 🟢 CA-8 — `crypto.randomUUID()` sin fallback (BAJO)
`calidadService.js:347`, `Monitoreo.jsx:587`. En orígenes no seguros lanza `TypeError` y rompe subida
de evidencia/alta de hallazgo. Añadir fallback.

### 🟢 CA-9 — `exportInformeDanos`: `if (h.cantidad)` truthy con string "0" (BAJO)
`src/lib/exportInformeDanos.js:99,218`. `h.cantidad` es string del input → "0" es truthy y se imprime
"Cantidad afectada: 0"; además la etiqueta "afectada" no corresponde al campo (es cantidad total).

### 🟢 CA-10 — `monitoreo_candidatos`: clasificación PERECIBLE por partida de menor vencimiento (BAJO)
`012_monitoreo_candidatos_fix.sql:47-66`. El `LATERAL … NULLS LAST LIMIT 1` puede heredar la fecha de
otro lote cuando la ubicación no trae partida, marcando PERECIBLE un SKU que no lo es.

---

## 5. Bugs — Infraestructura / Offline / Servicios

### 🔴 IN-1 — Items de la cola offline atascados en `syncing` para siempre → pérdida de datos (CRÍTICO)
`src/lib/syncManager.js:129` (marca `syncing`), `106-116` (filtro de reintento solo `pending`/`failed`),
`224` (`cleanupStaleItems` excluye `syncing`). Si la app/WebView se cierra a mitad del `for` de sync
(muy común en PDA), el item queda `syncing` permanente: nunca se reintenta ni expira, y ocupa un slot
de `MAX_QUEUE_SIZE`. La operación offline se pierde en silencio. **Fix:** al arrancar el sync, re-encolar
(`pending`) los `syncing` viejos, o incluirlos en `cleanupStaleItems` con reintento.

### 🟠 IN-2 — Fuga de listeners de Push en cada `SIGNED_IN` (ALTO)
`src/services/mobileService.js:126-139`, invocado desde `AuthContext.jsx:149-151` dentro de
`setUserState`. `initPushNotifications` registra 4 `addListener` sin `removeAllListeners()` previo; se
ejecuta en cada restauración de sesión / re-login → listeners acumulados = toasts duplicados y fuga.
(Nota: el hook `usePushNotifications.js` que duplicaría el registro es **código muerto**, no importado —
ver M-1; el problema real es el path de `mobileService`.)

### 🟠 IN-3 — CSP de `server.js` bloquea OpenStreetMap → "Costos de Transporte" roto en la web (ALTO)
`server.js:20` `connect-src 'self' https://*.supabase.co … https://*.sentry.io`. El módulo Costos de
Transporte (`logisticaService.js:9-10`) hace `fetch` a `nominatim.openstreetmap.org` y
`router.project-osrm.org`, **no incluidos** en `connect-src` → en el deploy web (Render, servido por
`server.js`) la geocodificación y el cálculo de distancia fallan con `ERR_BLOCKED_BY_CSP`. En móvil
(Capacitor) el CSP de `server.js` no aplica, por eso no se detectó. **Fix:** añadir ambos hosts a
`connect-src`.

### 🟠 IN-4 — Subsistema de inventario ficticio en la ruta caliente de Picking (ALTO/MEDIO)
`inventoryService.js:22,45` (RPC `wms_move_stock`/`wms_reserve_stock`) y `wmsLogic.js` (stubs
`{success:true}` fijos). Las funciones RPC **existen** en la BD pero referencian tablas que **no
existen** (`wms_inventory`, `wms_kardex`, `wms_allocations`) → siempre devuelven `{success:false}`.
`Picking.jsx:227,238` llama `InventoryService.moveStock(...)` e **ignora el valor de retorno**, así que
el fallo es totalmente silencioso; el picking "funciona" solo porque el estado real vive en
`tms_nv_diarias`/`wms_ubicaciones`. Es un subsistema muerto invocado en producción. **Fix:** eliminar
la llamada muerta de Picking y el servicio, o implementar las tablas reales.

### 🟡 IN-5 — `useRealtimeTable`: colisión de topic entre canales (MEDIO)
`src/hooks/useRealtimeTable.js:42`. El canal se nombra `realtime_${tableName}`; dos componentes que
escuchen la misma tabla con distinto `filter` crean el mismo topic → al desmontar uno, `removeChannel`
puede afectar al otro. Incluir el filtro / un id único en el nombre.

### 🟡 IN-6 — Login duplica carga de perfil y registro push (MEDIO)
`AuthContext.jsx:300-330` (`login`) + `217-238` (`onAuthStateChange SIGNED_IN`). `signInWithPassword`
dispara `SIGNED_IN`, que reejecuta `loadUserProfile`+`setUserState` en paralelo con `login()` → doble
carga de perfil/rol y doble init push por inicio de sesión.

### 🟡 IN-7 — `warehouseStore.moveItem` muta stock sin transacción/kardex (MEDIO — latente)
`src/store/warehouseStore.js:253-271`. `update({cantidad, ubicacion})` directo sobre `wms_ubicaciones`
(justo lo que `inventoryService` advierte no hacer): sin atomicidad, sin split de cantidad parcial, sin
traza. **Atenuante:** el método **no está conectado a ninguna UI** hoy (grep sin llamadas) → riesgo
latente, no activo. Limpiar o corregir si se reactiva.

### 🟢 IN-8 — `usePresence` re-suscribe por objeto `user` completo (BAJO)
`src/hooks/usePresence.js:49`. Depende de `user` (objeto nuevo en cada `setUser`) en vez de `user.id`
→ recrea el canal de presencia con join/leave espurios. Usar `user?.id`.

### 🟢 IN-9 — `useBarcodeScanner` no detiene la cámara al desmontar (BAJO)
`src/hooks/useBarcodeScanner.js`. Sin cleanup que llame `stopScan`; navegar durante un escaneo deja el
scanner nativo activo.

---

## 6. Calidad de código / Mantenibilidad

### 🟠 M-1 — 10 archivos de código muerto nuevos (ALTO en deuda, no funcional)
Sin ningún import en todo `src/` (verificado por grep):
`components/AnimatedPage.jsx`, `hooks/useSupabaseTable.js`, `hooks/useSupabaseMutation.js`,
`hooks/useScanner.js`, `hooks/usePushNotifications.js`, `services/labelPrinter.js`,
`services/wmsLogic.js`, `constants/index.js`, `styles/tokens.js`, `utils/isoCoords.js`.
(Los 4 componentes muertos de la revisión previa —Placeholder, PageTransition, Skeleton*— sí se
eliminaron.) Nota: `useSupabaseMutation` además tiene bugs de caché optimista, pero al ser muerto son
inertes. **Acción:** borrarlos.

### 🟡 M-2 — Dos carpetas de store sin unificar (MEDIO, = C-5, PENDIENTE)
Coexisten `src/store/` (warehouseStore, usado en WmsLocations/Heatmap) y `src/stores/` (pickingStore,
usado en Picking). Unificar en `src/stores/`.

### 🟡 M-3 — God-components (MEDIO, = C-6, sin cambios/peor)
`DataImport.jsx` 1274 · `Reception.jsx` 1083 · `ReceptionNacional.jsx` 1083 (clon nuevo) ·
`Monitoreo.jsx` 1205 · `Picking.jsx` 851 · `Entry.jsx` 824 · `Packing.jsx` 818. `ReceptionNacional`
es copia casi literal de `Reception` (duplicación) — candidato a componente parametrizado.

### 🟡 M-4 — `console.*` (75) y `new Date().toISOString()` (51) dispersos (MEDIO/BAJO)
75 `console.*` en 30 archivos (focos: `AuthContext` 11, `mobileService` 12, `Entry` 7) y 51
`new Date().toISOString()` en 25 archivos sin util central. Añadir un logger con nivel y un helper de
timestamp.

### 🟢 M-5 — 21 TODO/FIXME (BAJO)
La revisión previa reportaba 0; ahora hay 21 marcadores en `src/`. Revisar y cerrar/planificar.

### 🟢 Positivos de código
Tests 45/45 verdes; limpieza de intervalos/subscripciones en la mayoría de hooks; sin
`eval`/`dangerouslySetInnerHTML`; import dinámico correcto para `docx`/`pdfmake`/`xlsx` (chunks
aparte); helper `withTimeout` contra spinners infinitos bien aplicado.

---

## 7. Build / Tooling

### 🟠 T-1 — `npm install` falla sin `--ignore-scripts` (ALTO para CI/onboarding)
El postinstall de `sharp` (dep transitiva de `@capacitor/assets`) intenta descargar `libvips` de
GitHub y recibe **403** tras el proxy → aborta todo el install (no se crea `node_modules/.bin`, no
corre `vitest`). Un `npm ci` limpio en CI/entorno nuevo fallaría igual. **Fix:** mover
`@capacitor/assets` a un flujo aparte, fijar `sharp` como opcional, o documentar `npm install
--ignore-scripts` para desarrollo.

### 🟡 T-2 — Chunks de bundle grandes (MEDIO)
`pdfmake` 1.22 MB · `vfs_fonts` 855 KB · `ui-vendor` 557 KB · `xlsx` 282 KB (gzip: pdfmake 585 KB).
Ya hay code-splitting por ruta e import dinámico, pero conviene cargar `vfs_fonts` solo al exportar PDF
y evaluar alternativas más ligeras a `xlsx`/`pdfmake`.

### 🟢 T-3 — Sin lint ejecutable (BAJO)
`.eslintrc.cjs` es formato legacy y **ESLint no está en `devDependencies`**; no hay script `lint` en
`package.json`. `npx eslint` trae v10 y falla (espera `eslint.config.js`). Añadir ESLint fijado + config
flat + script `lint`.

---

## 8. Roadmap priorizado

**Inmediato (datos / seguridad):**
1. **V-1/V-2** — Exportar las 8 migraciones live a `supabase/migrations/` renumeradas (SQL ya recuperado).
2. **IN-1** — Reparar la cola offline (`syncing` atascado) — riesgo de pérdida de operaciones.
3. **CA-1/CA-2/CA-3** — Hacer transaccionales crear/editar informe y el número correlativo.

**Corto plazo (bugs de usuario):**
4. **IN-3** — Añadir hosts OSM al CSP (Costos de Transporte roto en web).
5. **IN-2** — `removeAllListeners()` antes de re-registrar push.
6. **CA-4/CA-6/CA-7** — Limpiar `cantidad_afectada`, guard de precarga, coherencia ítem↔flag.

**Backlog (deuda / limpieza):**
7. **M-1** — Borrar los 10 archivos muertos; **IN-4/IN-7** — quitar el subsistema de inventario ficticio.
8. **M-2/M-3/M-4** — Unificar store, dividir god-components (empezar por parametrizar Reception/ReceptionNacional), logger central.
9. **V-3** — Regenerar `functions_snapshot.sql`. **T-1/T-3** — Arreglar install en CI + lint.
10. **S-D/S-E** — Activar leaked-password protection; revocar `anon` en `mv_dashboard_kpis`.

> Todos los hallazgos fueron verificados leyendo el código/BD reales. Ninguna corrección se aplicó en
> esta revisión (solo se generó este documento). Indica qué bloque quieres que implemente.
