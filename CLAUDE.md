# CLAUDE.md — Guía para agentes en CCO_PTM

## Regla permanente: sincronizar documentación

**Toda modificación de código o de base de datos DEBE reflejarse en la documentación.**

- El **cuadro de Novedades** (modal `NovedadesModal`) se genera **AUTOMÁTICAMENTE** en cada build
  desde el Changelog (§15) por `scripts/gen_release_notes.js` (prebuild) → `releaseNotes.generated.js`.
  NO se edita a mano: basta mantener el changelog al día (que ya es obligatorio). El título de cada
  nota sale del **primer texto en negrita** de la fila del changelog; procura que empiece con un
  resumen claro en negrita.
  - **Estilo _patch notes_ (lenguaje simple para el usuario)**: cada fila puede llevar, dentro de la
    misma celda, dos anotaciones OPCIONALES que el generador usa para el modal (y quita del texto
    técnico): `{{titulo: Título simple}}` y `{{simple: [etiqueta] texto ;; [etiqueta] texto}}`.
    Etiquetas: `nuevo` 🆕 · `mejora` (alias `buff`) ⬆️ · `fix` (alias `arreglo`/`bug`) 🔧 ·
    `ajuste` (alias `nerf`) ⚙️ · `seguridad` 🛡️. Separador de items: `;;` (NUNCA usar `|`
    dentro: rompe la tabla). Si NO hay `{{simple}}`, el generador **auto-clasifica** la versión y
    **limpia la jerga** (quita nº de migración, rutas de archivo, nombres de RPC) tomando solo la
    1ª frase. Recomendado: anota en simple las versiones de cara al usuario.
- Fuente canónica de documentación técnica: **`DOCUMENTACION_PROYECTO.md`**.
- Al cambiar versión, dependencias, rutas, tablas, RPCs, módulos o flujos → actualizar la
  sección correspondiente de `DOCUMENTACION_PROYECTO.md` **y** añadir una entrada en su
  Changelog (§15) en el mismo commit.
- La versión semver de la app vive en `package.json` (fuente de verdad). No introducir
  versiones inventadas en los docs; usar los rangos declarados en `package.json`.

## Qué es el proyecto

WMS + TMS (gestión de bodega y transporte). SPA React desplegada como Web (Render) y app
Android (Capacitor + Capgo OTA). La versión vigente es la de `package.json` (fuente de verdad).

## Stack

React 18 · Vite 5 · TailwindCSS 3 · Supabase (PostgreSQL + RLS + Realtime) · Zustand 4 ·
TanStack React Query 5 · Capacitor 8 (ML Kit barcode, Haptics, Push FCM, Capgo OTA) ·
Dexie (offline) · Vitest.

## Comandos

```bash
npm run dev            # desarrollo (Vite)
npm run build          # build producción → dist/
npm test               # tests (Vitest)
npm run test:watch     # tests en watch
npm run test:coverage  # cobertura
npm run deploy:mobile  # build + cap sync + subir bundle Capgo (scripts/deploy_mobile.js)
npm run update:traspasos # re-sincroniza el módulo Traspasos (lockowom/em-il) → public/traspasos/
```

## Módulos externos integrados

- **Traspasos/Ajustes** (`lockowom/em-il`): app estática vendorizada en `public/traspasos/`
  (Vite → `dist/traspasos/`, express la sirve), embebida vía iframe en `/inventory/traspasos`
  (`src/pages/Tools/Traspasos.jsx`), enlace en menú _Inventario → Traspasos y Ajustes_. Actualizar con
  `npm run update:traspasos` + `npm run build`. Excluida del precache/fallback PWA. `X-Frame-Options`
  es `SAMEORIGIN` (server.js) para permitir el iframe propio.
  - **Backend en Supabase**: `public/traspasos/cco-bridge.js` (archivo propio, no viene de em-il;
    el update script lo re-inyecta en `index.html`) sustituye el sync Firestore de la app por
    tablas Supabase — historial en `tms_emil_sync` (blob `{traspasos,ajustes}`) y catálogo maestro
    en `tms_emil_catalogo` (12.514 SKUs, sembrado desde `data/catalog.js` la 1ª vez). No edita
    `app.js`: intercepta `fetch`/`syncDocUrl` traduciendo el documento con forma Firestore a REST de
    Supabase, autenticando con el `access_token` de la sesión CCO (mismo origen). Migración `041`.
  - **Tema de marca**: `public/traspasos/cco-theme.css` (archivo propio, re-inyectado en `<head>` por
    el update script) re-mapea las variables de diseño de em-il a la identidad CCO (naranja `#f97316`,
    superficies claras/oscuras, verde `#10b981`) y oculta el fondo 3D para una estética minimalista.
    No edita `styles.css`.

## Módulo nativo: Panel PTM (migrado de `lockowom/panel-`)

- **Panel PTM**: dashboard de indicadores + Ingresar/Info N.V. + Modo TV + Builder, **nativo en CCO**
  (rutas `/panel/*`, `src/pages/Panel/**`), leyendo `tms_operaciones` real. El antiguo iframe a la app
  Next.js de Vercel (`/tools/panel`, `PanelPTM.jsx`, dominio `panel-dashboard-ptm.vercel.app`) **se retiró
  tras completar la migración** (ruta, menú, `frame-src` de Vercel en el CSP y el archivo, todo eliminado).
  Permisos: `view_panel` (umbral) + `manage_panel` + por pantalla `panel_ingresar`/`panel_info`/`panel_tv`/
  `panel_builder` (migración `096`). El módulo `panel` sigue en `tms_modules_config` (Vistas).
  - **Ingresar N.V. refactor (PR-016)**: la validación del guardado NO vive inline en el screen;
    está centralizada en módulos puros testeables de `src/pages/Panel/ingresar/`:
    `preflight.js` (reglas con código: `ESTADO_REQUERIDO`/`SHIPPING_PAUSA_SIN_MOTIVO`/
    `SHIPPING_PAUSA_ACTIVA`/`IAM_DENEGADO`/`NV_ENTREGADA`/`ORANGE_ASSOCIATION_REQUERIDA`/
    `CLIENTE_REQUERIDO`), `dataQuality.js` (normalización `normNV`/`normNumber`/`soloFecha`/
    `sanitizePayload`/`tieneCamposInventario`/`diffNvConflict`) y `optimisticVersion.js`
    (token de concurrencia **dedicado `row_version` bigint**, NO `fecha_estado` → detección
    de CONFLICT y de `version_required`/fase D). `ingresarService.guardar/cambiarEstado/
actualizarCampos` envían `version` y tipifican el conflicto sin resetear caches; el
    screen recarga el lookup, NO cierra el modal y muestra el diff (UX conflicto).
    Migración `173`: columna `row_version` + trigger de incremento + RPCs `guardar_nv`/
    `cambiar_estado_nv` con gate `p_version`/`p_expected_version` (devuelven la versión
    nueva) + authz IAM completa + `nv_version_obligatoria()` (fase D). **Estado real**:
    CODE_READY=true, **DB_DEPLOYED=true** (migración 173 aplicada en PROD el 2026-08-17,
    columna+trigger+RPCs+grants verificados; incluye `revoke ... from anon` defensivo en
    ambas RPCs), **CONCURRENCY_ACTIVE=true** (smoke de concurrencia 7 casos PASS en PROD:
    create→ok v1, update version correcta→ok, version vieja→CONFLICT sin pisar, recarga→ok,
    cambiar_estado ok, legacy sin version→compat mode, fase D off).
    Test no-stock en BD real: **PASS** (`STOCK_SIDE_EFFECT_FROM_PANEL_NV=0` verificado con
    snapshots antes/después de tms_partidas/tms_series/tms_inventario_general, rollback sin
    residuales). Hoy sigue **compatibility mode (fase A)**: el gate solo aplica si el cliente
    envía `version` (`nv_version_obligatoria()=false`).
    Enforcement definitivo (fase D) = `set app.nv_require_version='on'` (fase D) +
    flag cliente `panel_nv_require_version` (hoy OFF). Regla transversal **No inventory mutation**:
    este flujo nunca toca stock (solo `tms_operaciones`); gate `STOCK_SIDE_EFFECT_FROM_PANEL_NV=0`
    con test BD transaccional en `supabase/verificacion/PR-016_no_stock_mutation_test.sql`.

## Módulo nativo: Conteo Cíclico

- **Conteo Cíclico de Inventario** (port nativo del proyecto `lockowom/t-o-inventario`, NO iframe):
  reescrito sobre Supabase reusando el stock de CCO (`tms_partidas`/`tms_series`). Migraciones
  `042` (dominio + RPCs) y `043` (reportes). Frontend: `src/pages/Mobile/ConteoPDA.jsx` (conteo en
  el PDA, reemplaza el placeholder "CONTEO CÍCLICO"), `src/pages/Inventory/ConteoCiclico.jsx`
  (escritorio: sesiones, conciliación, ajuste ERP, bloques/QR, proyección) y `BloqueDetalle.jsx`
  (destino del QR `/inventory/bloque/:codigo`). Servicio `src/services/conteoService.js`. Permisos
  `view_conteo`/`manage_conteo`/`supervise_conteo`. Genera QR con la dependencia `qrcode`.

## Módulo nativo: Post-Venta / Servicio Técnico

- **Post-Venta** (port nativo de `lockowom/post-venta`, NO iframe): gestión de tickets de
  servicio técnico de equipos médicos (folio `TKT-AAAA-###`). Migración `046` (dominio + RPCs +
  permisos). Frontend: `src/pages/Postventa/Postventa.jsx` (tabs Tickets, Nuevo, Dashboard,
  Técnicos) y `src/services/postventaService.js` (catálogos como constantes + hooks). Ruta
  `/postventa/tickets`, sección propia _Post-Venta_ en el menú (tabs deep-link vía `?tab=`).
  Permisos `view_postventa`/`manage_postventa`/`supervise_postventa`. Tickets en
  `tms_postventa_tickets`, técnicos editables en `tms_postventa_tecnicos`.
  - **Calendario / Agenda** (migración `047`): pestaña Calendario (grilla mensual) que ubica los
    tickets por fecha (visita programada / apertura / cierre) con filtro por técnico. Campos
    `fecha_programada`/`hora_programada` en el ticket; `crear_pv_ticket` (recreada, +2 params
    opcionales) y `actualizar_pv_ticket` los manejan.
  - **Región → Comuna** (migración `048`): columna `comuna` + selector en cascada
    (`src/constants/comunasChile.js`, 16 regiones → 346 comunas). **Equipo/Modelo desde el stock**
    (migración `049`): RPC `pv_familias_stock()` alimenta el selector con las familias reales del
    stock (familia = 3 primeros chars de `tms_partidas.codigo_producto`).
  - **Extractor de correos**: Edge Function `supabase/functions/postventa-extractor` (Deno, port
    del `main.py` de post-venta). Lee un buzón Outlook/M365 vía Microsoft Graph (client
    credentials, permiso `Mail.Read`), dedup por id de mensaje y crea tickets `origen='Correo'`
    (borrador, campos de gestión "Por Definir") con la RPC idempotente `crear_pv_ticket`. **Secrets
    requeridos** (Supabase → Edge Functions): `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`,
    `GRAPH_CLIENT_SECRET`, `PV_MAILBOX` (+ opcionales `PV_MAILBOX_FOLDER`, `PV_SOLO_DESDE`).
    Programar con pg_cron+pg_net o invocar manualmente (POST, `verify_jwt` on).
  - **Webhook de ingesta (correos POP / macro Outlook)**: Edge Function `supabase/functions/postventa-inbox` —
    un script/macro externo hace POST con los datos del correo y la función llama la RPC
    `ingesta_pv_correo`. Auth por **token compartido** (header `X-API-Key`/`x-pv-token`/`?token=`/body)
    contra el secret `PV_INGEST_TOKEN`; `verify_jwt` off. Acepta objeto, array, `{filas:[…]}` (macro VBA).
  - **Hilos de correo + lector (migración `050`)**: tabla `tms_postventa_correos` (cada correo con
    De/Para/CC/Asunto/cuerpo/adjuntos/recibido, dedup por `id_correo`/EntryID) + `conversation_id` en
    el ticket → **un hilo = un caso** (RPC `ingesta_pv_correo`; `pv_correos_ticket(numero)` devuelve el
    hilo ordenado). Frontend: pestaña **Bandeja Correos** (`TabBandeja`) con chip **Interno/Externo**
    (`DOMINIOS_INTERNOS`, `ptm.cl`) y **lector estilo Outlook** (`ThreadReader`).

## Módulo nativo: Análisis de Códigos (Inventario)

- **Análisis de Códigos** (`/inventory/analisis`, port del Excel "STOCK NAME" de PTM): mide el avance
  de la actualización de códigos a la nomenclatura **P/S** y sus riesgos. Migración `067`:
  tabla `tms_productos_activo` (catálogo Activo Si/No del ERP, se carga desde la propia pantalla
  vía `bulk_upsert` — tabla agregada a su allowlist) + RPCs `analisis_codigos(filtro,q)` y
  `analisis_codigos_resumen()` que calculan EN VIVO sobre `tms_inventario_general` (sumado por SKU
  entre bodegas; se carga por Carga Masiva → Consolidado): estado Nuevo (P)/Nuevo (S)/Antiguo,
  antiguos con Disponible, duplicados por descripción contra P/S (+código equivalente), activos/no
  activos/no encontrados, no activos con stock y **anomalías** con diagnóstico (punto final, código
  corto, sin dígitos, sufijo inválido, filas de prueba). Frontend `src/pages/Inventory/AnalisisCodigos.jsx`
  (secciones por menú `?tab=`), servicio `src/services/analisisService.js`, export Excel de 6 hojas.
  Permisos: los de bodega/stock existentes (sin permiso nuevo). El "HUB" de pallets del Excel ya
  existía como Conteo · Proyección. El stock se carga DIRECTO desde el Resumen ("Cargar reporte de
  stock (Excel IW)": `parseStockFile` mapea columnas por nombre, bodega fija `CONSOLIDADO`, reemplazo
  total); `useAnalisisCodigos` pagina con `.range()` (PostgREST max-rows corta en 1.000). Las tablas
  son dinámicas (filtros por columna, orden por encabezado, fila de totales, export de lo filtrado)
  y la selección genera **Traspasos/Ajustes**: `enviarAEmil` inserta registros PENDIENTE en el blob
  de `tms_emil_sync` (dedup por SKU; con `ps_equivalente` va como recodificación con `destSku`) que
  la app em-il adopta al abrir o en su poll de 12 s.

## Módulo nativo: Carteles de Bodega (Inventario)

- **Carteles de Bodega** (`/inventory/carteles`, port del Excel "CARTELES PTM"): impresión de
  carteles de producto (código gigante + descripción + código de barras **CODE128** generado al
  vuelo con `src/lib/code128.js`, sin dependencias) en formatos **Único / Doble / Cuádruple**
  (1/2/4 por hoja A4, `window.print` con CSS de impresión). La "tabla de códigos" del Excel (hoja
  BD) ES la tabla maestra existente `tms_matriz_codigos`: se busca ahí (con opción de código
  manual), cola con copias por producto y vista previa fiel. Sin migración (sin tablas ni permisos
  nuevos; usa permisos de bodega). Frontend `src/pages/Inventory/Carteles.jsx`.

## Módulo nativo: Panel de Insumos (Inventario)

- **Panel de Insumos** (`/inventory/insumos`, `src/pages/Inventory/Insumos.jsx` + `src/services/insumosService.js`):
  panel didáctico del stock de insumos de embalaje/despacho con **semáforo** (🟢 OK / 🟡 por acabarse /
  🔴 crítico) según `umbral_bajo`/`umbral_critico` por ítem. Migración `100`: tabla `tms_insumos`
  (categoría CAJAS/PALLETS/OTROS + cantidad + umbrales), RLS solo-lectura para `authenticated`, escrituras
  por RPC gateada (`_insumos_puede_gestionar`): `insumos_guardar`/`insumos_set_cantidad`/`insumos_eliminar`.
  Edición inline de cantidad/umbrales (permiso `manage_insumos`). **Solicitud por correo**: se seleccionan
  los insumos por reponer y se arma un `mailto:` (destinatario recordado en localStorage) pidiendo la
  reposición. Permisos `view_insumos`/`manage_insumos` (módulo Inventario).

## Módulo nativo: Asistente IA (chat sobre datos, solo lectura)

- **Asistente CCO** (`src/components/AsistenteIA.jsx`, burbuja flotante montada en `App.jsx`):
  chat conversacional que responde sobre datos REALES (operaciones/N.V., stock, tickets Post-Venta)
  usando **tool use** de Anthropic. **v1 = SOLO LECTURA** (no crea/edita/elimina). La clave vive solo
  en el servidor: proxy `POST /api/asistente` en `server.js` (valida sesión Supabase, rate-limit,
  loop de tool use hasta 6 pasos, modelo `IA_MODEL` env, def. `claude-opus-4-8`). Las herramientas
  se traducen a RPCs seguras y se ejecutan **con el token del usuario**, así la BD aplica sus permisos
  y su ámbito `centro_costo`; el servidor nunca usa la service-role para leer. Servicio cliente
  `src/services/asistenteService.js`. Migración `137` (RPCs `ia_kpis`/`ia_buscar_operaciones`
  [respeta ámbito como el Panel]/`ia_buscar_stock`/`ia_tickets`, todas SECURITY DEFINER **gateadas por
  permiso** del llamante; permiso nuevo `view_asistente`; fila de módulo `asistente`) + `138`
  (revoke a `anon`). Se muestra solo a autenticados con `view_asistente` (ADMIN siempre). Sin ruta
  ni item de menú (es widget global); registrado en `APP_MODULES`/`APP_PERMISSIONS` (Roles/Vistas).
  Requiere `ANTHROPIC_API_KEY` en el servidor (misma env que "Mejorar con IA" de Traspasos).

## Regla permanente: checklist al agregar un MÓDULO nuevo

Cada módulo/pantalla nueva DEBE quedar administrable en **Roles** y **Vistas**. En el mismo
cambio, actualizar SIEMPRE:

1. `src/App.jsx` — ruta lazy + `<Route>`.
2. `src/constants/permissions.js` — `ROUTE_PERMISSIONS['/ruta']` (sin permiso definido se DENIEGA).
3. `src/components/Navbar.jsx` — item en `menuCategories` (la visibilidad se deriva de ROUTE_PERMISSIONS).
4. `src/config/modules.js` — los 3 catálogos: `APP_MODULES` (toggle en Admin → Vistas),
   `APP_ROUTES` (landing pages por rol) y `APP_PERMISSIONS` (checkboxes en Admin → Roles).
5. Migración SQL — permisos nuevos en `tms_permisos` (id/nombre/modulo) **y** fila del módulo en
   `tms_modules_config` (Vistas solo muestra módulos con fila en esa tabla ∩ APP_MODULES).
6. Docs: `DOCUMENTACION_PROYECTO.md` (+changelog), `supabase/README.md` y `supabase/DIAGRAMA_BD.md` si cambia la BD.

## Regla transversal: FEATURE_IMPLEMENTED != FEATURE_RELEASED (HIDDEN_PRIVATE_BETA)

Un módulo implementado y desplegado **NO es sinónimo de publicado**. TODO módulo nuevo de CCO 2.0
nace **oculto** (`NEW_MODULE_PUBLIC_VISIBILITY = 0`, `NEW_MODULE_NAV_VISIBILITY = 0`,
`NEW_MODULE_GENERAL_ACCESS = 0`; `RELEASE STATUS = HIDDEN_PRIVATE_BETA`) hasta que el dueño/Admin
lo libere por etapas (DEVELOPMENT → PRIVATE BETA → INTERNAL PILOT → LIMITED RELEASE → GA). Cada
salto de etapa es una decisión de release, NO consecuencia del merge/deploy.

- Infra: `src/config/featureFlags.js` (flag `module_<nombre>_private_beta`, fail-closed) +
  `src/constants/privateBeta.js` (`PRIVATE_BETA_MODULES`: path/flag/permisos
  `view_<nombre>_private_beta`+`manage_<nombre>_private_beta`/rol IAM `cco_private_beta_<modulo>`/stage).
- Al registrar un módulo nuevo: añadir flag (OFF) y entrada en `PRIVATE_BETA_MODULES`; la ruta se
  oculta sola de nav/búsqueda global (routeMeta) y el guard devuelve **404** si el flag está OFF
  (no filtra la existencia) o AccessDenied sin rol/permiso. Si la ruta NO está en `APP_ROUTES`,
  registrarla en `PRIVATE_BETA_EXTRA` de `routeMeta.js`.
- **NO hardcodear UUIDs** para permitir betas (el viejo `PRIVATE_ROUTE_COORDINATOR_AUTH_UID` se migró
  a rol IAM + permiso). Asignación siempre por rol IAM + permiso en `tms_permisos`/`iam.assignments`,
  y gatear RPC/RLS en el backend (la ruta sola no basta). Referencia: `docs/PR-015B_PRIVATE_BETA_GOVERNANCE.md`.

## Estructura

- `src/pages/` — módulos (Inbound, Inventory, Queries, Quality, Panel, Postventa, Admin, Mobile).
  Los módulos **TMS (Transporte)** y **Outbound** se retiraron (migración `102`); se reconstruirán desde 0.
- `src/components/`, `src/hooks/`, `src/services/`, `src/lib/`, `src/constants/`, `src/context/`
- `src/stores/` — stores Zustand unificadas (`warehouseStore`, `pickingStore`)
- `supabase/migrations/` — migraciones versionadas (`001`…`061`); aplicar nuevas vía MCP/CLI
- `dist/` — **build commiteado a propósito**: Render lo sirve con `server.js` (express static).
  Regenerar con `npm run build` y commitearlo al desplegar.

## Despliegue OTA desde la app (admin)

- **Promover a producción sin GitHub/Capgo**: panel en **Admin → Monitor** (`src/components/DespliegueOTA.jsx`,
  montado tras `CanalOTA`): lista bundles de Capgo, muestra la versión de cada canal y promueve una versión
  elegida a `production` con confirmación. La API key de Capgo vive SOLO en la Edge Function
  `supabase/functions/capgo-deploy` (secret `CAPGO_API_KEY`, rol `all`), nunca en el cliente; se autoriza con
  la RPC `puede_desplegar_ota()` (admin o permiso `deploy_ota`) y audita en `tms_ota_despliegues`
  (`registrar_despliegue_ota`). Migración `068`. Servicio `src/services/otaDeployService.js`. API pública de
  Capgo: `GET/POST https://api.capgo.app/{bundle,channel}` con header `x-api-key`.

## Despliegue

- **Web**: push a `main` → Render. La web sirve el `dist/` del repo (commitearlo tras `npm run build`).
  - **Env var** `ANTHROPIC_API_KEY` (Render → Environment): habilita el asistente "Mejorar con IA" del
    módulo Traspasos vía el proxy `POST /api/traspasos-ai` (la clave vive solo en el servidor).
- **Móvil**: OTA con Capgo en **dos canales** (ver `docs/DESPLIEGUE_MOVIL.md`). Push a `main`
  que cambie la versión → CI sube a **`beta`** (`.github/workflows/capgo-ota.yml`); la bodega
  (`production`) NO se actualiza hasta **promover** con el workflow `capgo-promote.yml`
  (`workflow_dispatch`) o desde el panel Capgo. Los PDA de prueba se asignan a `beta` desde
  **Admin → Monitor** (`src/components/CanalOTA.jsx`, solo nativo). `npm run deploy:mobile`
  sube a beta por defecto (`-- production` para forzar). Rollback: panel Capgo (Set bundle a
  la versión anterior) + auto-rollback por `notifyAppReady`. App `com.cco.wms`. Secreto CI:
  `CAPGO_TOKEN`. **Build nativa** (solo cuando cambian plugins nativos; el OTA no cruza cambios
  nativos): ver `docs/BUILD_APK.md`. `android/app/build.gradle` tiene `versionCode`/`versionName`
  (subir el code en cada build nativa) + `signingConfig` de release desde `keystore.properties`
  (secreto, en `.gitignore`). Generar la APK con el constructor en la nube de Capgo o `./gradlew`.

## Notas de estado

- Existen hallazgos de seguridad históricos en la BD (políticas RLS permisivas `USING (true)`,
  funciones `SECURITY DEFINER` ejecutables por `authenticated`). Revisar `get_advisors` antes de tocar BD.

## Git

- Rama de trabajo: `main`. No crear PRs salvo petición explícita.
