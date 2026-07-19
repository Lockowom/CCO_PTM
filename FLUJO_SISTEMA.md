# FLUJO_SISTEMA.md — Cómo se conecta cada pieza de CCO_PTM

> Mapa maestro de conexiones del sistema, de punta a punta. Complementa a
> `DOCUMENTACION_PROYECTO.md` (referencia técnica por módulo) y
> `supabase/DIAGRAMA_BD.md` (diagrama ER y funciones de la BD).
> Actualizado en la auditoría full-stack v1.18.3 (2026-07-10).

---

## 1. Vista de pájaro

```
                         ┌──────────────────────────────────────────────┐
                         │                  USUARIOS                    │
                         │  Navegador (web) · App Android (Capacitor)   │
                         └───────────────┬──────────────────────────────┘
                                         │ HTTPS
                    ┌────────────────────┴─────────────────────┐
                    │            RENDER (server.js)            │
                    │  express: sirve dist/ (SPA committeada)  │
                    │  + proxy /api/traspasos-ai → Anthropic   │
                    └────────────────────┬─────────────────────┘
                                         │ (la SPA en el navegador habla DIRECTO con Supabase)
   ┌─────────────────────────────────────┴──────────────────────────────────────┐
   │                        SUPABASE (vtrtyzbgpsvqwbfoudaf)                     │
   │  Auth (JWT) · PostgreSQL 17 + RLS + RPCs SECURITY DEFINER · Realtime      │
   │  Storage (fotos) · Edge Functions (postventa-inbox / -extractor / push)   │
   └─────────────▲──────────────────────────────▲──────────────────────────────┘
                 │ POST {filas:[…]} X-API-Key    │ FCM push
        ┌────────┴────────┐             ┌────────┴────────┐
        │  MACRO OUTLOOK  │             │  Firebase (FCM) │
        │  (VBA, correos  │             │  notif. móviles │
        │   POP → webhook)│             └─────────────────┘
        └─────────────────┘
```

Tres verdades que ordenan todo:

1. **La SPA habla directo con Supabase** (supabase-js con la anon key + JWT del
   usuario). El servidor de Render **no** es un backend de datos: solo sirve los
   archivos estáticos y hace de proxy para la IA de Traspasos.
2. **Ninguna escritura importante va directo a una tabla**: pasa por **RPCs
   `SECURITY DEFINER`** que validan al usuario (rol/permisos desde
   `tms_usuarios`/`tms_roles`) dentro de la misma función. Las tablas quedan
   detrás de RLS.
3. **La app Android es la misma SPA** empaquetada con Capacitor; se actualiza
   por OTA (Capgo) sin pasar por Play Store.

---

## 2. Arranque y sesión (quién eres y qué puedes ver)

### 2.1 Carga de la app
1. El navegador pide `https://cco-ptm.onrender.com` → `server.js` (express)
   responde `dist/index.html` (**no-cache**; los assets hasheados de
   `dist/assets/` van con caché inmutable de 1 año).
2. React monta `App.jsx` → `AuthContext` restaura la sesión de Supabase Auth
   desde localStorage (`initSession`).
3. Con el email del token se carga el **perfil real** desde `tms_usuarios`
   (nombre, `rol`, `activo`, `es_admin_delegado`) y la **config del rol** desde
   `tms_roles` (`permisos_json` → array `permissions`, `landing_page`).
   Usuario inexistente o `activo=false` ⇒ `signOut()` inmediato.

### 2.2 Autorización (las 4 capas)
| Capa | Archivo | Qué hace |
|---|---|---|
| Guard de ruta | `App.jsx` (`ProtectedRoute`) | `permisosDeRuta(pathname)` (normaliza mayúsculas/slash y resuelve `:params` con `matchPath`) contra `ROUTE_PERMISSIONS`. **Sin permiso declarado ⇒ DENEGADO**. ADMIN y `es_admin_delegado` pasan todo. |
| Menú | `Navbar.jsx` | La visibilidad se **deriva** de `ROUTE_PERMISSIONS` (un módulo se muestra si puedes entrar a ≥1 de sus rutas); recorta `?tab=` de los deep-links. |
| Botones/acciones | cada página | `hasPermission('x')` del AuthContext (ADMIN/delegado ⇒ true). |
| **Servidor (la real)** | RPCs en Postgres | Cada RPC re-verifica rol/permisos leyendo `tms_usuarios` por `auth.uid()` (helpers `_pv_assert`, `_conteo_assert`, `_calidad_assert_admin`, …). Aunque alguien salte la UI, la BD no le obedece. |

Los catálogos que administran esto viven en `src/config/modules.js`
(`APP_MODULES` → Admin→Vistas, `APP_ROUTES` → landing pages, `APP_PERMISSIONS`
→ checkboxes de Admin→Roles) + la tabla `tms_modules_config` (toggle global por
módulo) y `tms_permisos` (catálogo en BD). **Regla permanente**: todo módulo
nuevo se registra en los 6 lugares (checklist de CLAUDE.md).

### 2.3 Sesión en vivo
- **Session Guard** (`AuthContext`): canal realtime sobre la fila propia de
  `tms_usuarios` — si un admin te desactiva/cambia rol/te quita el delegado, la
  sesión reacciona al instante (logout o refresh de permisos).
- **Presencia**: heartbeat cada 30 s a `tms_usuarios_activos` (módulo actual,
  estado) → alimenta Admin → Monitor.
- **Logout**: borra presencia y push token (ANTES de destruir el JWT), limpia
  la sesión de picking persistida y las cachés del service worker con datos de
  Supabase, y recién entonces `signOut()`.

---

## 3. Flujo de datos genérico de un módulo

Ejemplo canónico (aplica a todos):

```
Página (src/pages/…)  ──usa──▶  Hook (src/services/…Service.js)
     │                              │  useQuery(['clave'], fetcher)     ← LECTURA: supabase.from('tabla').select()  (RLS authenticated)
     │                              │  useMutation(rpc)                 ← ESCRITURA: supabase.rpc('rpc_x', {p_…})   (SECURITY DEFINER + gate)
     │                              └─ onSuccess: qc.invalidateQueries  → la UI se refresca sola
     └── useRealtimeTable('tabla') → INSERT/UPDATE/DELETE de otros usuarios refrescan la vista en vivo
```

- **React Query** es la caché de datos (claves como `['pv_tickets', …]`,
  `['conteos', sesión]`, `['conteo_conciliacion', …]`): cada mutación invalida
  las claves afectadas.
- **Realtime** (websocket `wss://…supabase.co`) se usa donde importa ver lo de
  otros al instante: NVs (picking/packing), recepciones, tickets TI,
  acciones de Calidad (carpeta de Traspasos, tableros), usuarios/roles.
- **Offline (PDA)**: `src/lib/` mantiene una cola en Dexie (IndexedDB); al
  volver la señal, `syncManager` drena la cola (upserts de ubicaciones,
  mediciones de tiempos) con reintentos y backoff.

---

## 4. Módulos y sus conexiones exactas

### 4.1 WMS núcleo (Inbound → Stock → Outbound)
- **Carga masiva** (`Admin → DataImport`): Excel → RPC `bulk_upsert(tabla, filas, claves)`
  y `prepare_nv_import` → tablas maestras `tms_nv_diarias` (notas de venta),
  `tms_partidas`/`tms_series` (stock por lote/serie — triggers `044/045`
  normalizan lote vacío para dedup), `tms_matriz_codigos`, `tms_control_despacho`,
  `wms_ubicaciones`. Cada carga queda en `tms_historial_cargas` (y notifica a
  todos vía realtime).
- **Inbound**: Recepción (import/nacional) → `tms_recepciones(_items)`;
  checklist de Calidad de ingreso se crea solo (trigger → `tms_calidad_tareas`).
  Putaway (`Entry`) escribe `wms_ubicaciones` (con cola offline).
- **Outbound**: ⛔ **RETIRADO** (mig `102`). El flujo `SalesOrders → Picking →
  Packing → Shipping` ya no existe; el estado de las N.V. se gestiona hoy en el
  **Panel PTM** (`tms_operaciones`). El módulo **TMS** (rutas/entregas/app del
  conductor) está **oculto** (mig `120`), pendiente de reconstrucción.
- **PDA** (`/mobile/pda`): Putaway + Conteo Cíclico + consulta de stock
  (el modo "picking guiado" se eliminó en v1.18.3: usaba una tabla inexistente).

### 4.2 Inventario
- **Traspasos/Ajustes** (`/inventory/traspasos`): app externa em-il vendorizada
  en `public/traspasos/`, embebida en iframe. `cco-bridge.js` intercepta su
  sync Firestore y lo traduce a REST de Supabase (`tms_emil_sync` blob de
  historial, `tms_emil_catalogo` catálogo maestro), autenticando con el
  `access_token` de la sesión CCO (mismo origen). El botón "Mejorar con IA"
  llama `POST /api/traspasos-ai` (server.js agrega la ANTHROPIC_API_KEY;
  timeout 60 s, tope de tokens, modelo validado).
- **Conteo Cíclico** (`/inventory/conteo` + PDA): sesiones → conteos con
  snapshot de stock server-side (`registrar_conteo` llama `conteo_stock_sistema`,
  prioridad serie>partida>SKU sobre `tms_partidas`/`tms_series`) → reportes
  `conteo_conciliacion` / `conteo_ajuste_erp` (valorizados con `tms_conteo_costos`)
  → bloques con **QR** (`/inventory/bloque/:codigo`, siempre con la URL pública
  aunque se genere desde la app) → auditorías. Navegación por menú `?tab=`.

### 4.3 Calidad (el hub que deriva trabajo a los demás)
```
Recepción ──trigger──▶ Checklist de Ingreso ──NO CONFORME──▶ Informe de Daños (fotos)
Inventario ──asigna──▶ Monitoreo (informes MON-/DAN-) ──dictamen──▶ tms_calidad_acciones (folio ACC-)
                                                            │
             ┌──────────────────────────────────────────────┴───────────────────────────┐
             ▼ dictamen tipo bodega (AJUSTE/BAJA/TRANSITORIO/REACONDICIONAR)             ▼ tipo técnico (REPARACION/POST_VENTA)
   Carpeta "CALIDAD TRAZABILIDAD" en Traspasos                          Ticket Post-Venta serie CAL- (accion_a_ticket_pv)
   → botón "Correo enviado" (accion_correo_enviado)                     → con el INFORME adjunto legible en el ticket
   → la acción se RESUELVE sola según dictamen                            (pv_informe_calidad: informe+item+evidencias)
             └──────────────────────────► trazabilidad_producto muestra TODO (recepción→dictamen→acción→ticket/ref) ◄──┘
```
- Fotos de evidencia: `PhotoUploader` → `compressImage` (máx 1600px, JPEG 82%)
  → Storage bucket `monitoreo-evidencias` → fila en `tms_monitoreo_evidencias`.
- Certificados de liberación firmados: `firmar_certificado` (HMAC en schema
  `private`) → verificación pública por QR en `/verificar` (única función
  ejecutable por `anon`, a propósito).

### 4.4 Post-Venta / Servicio Técnico
```
Outlook (buzón POP) ─macro VBA─▶ POST /functions/v1/postventa-inbox  (X-API-Key = PV_INGEST_TOKEN)
                                        │  ingesta_pv_correo (service_role, idempotente por EntryID)
                                        ▼
   tms_postventa_correos (cada mail: De/Para/CC/cuerpo)  ──conversation_id──▶ tms_postventa_tickets
   · un HILO = un CASO (las respuestas se acumulan, no duplican)             (TKT-AAAA-N global +
   · descartados (tms_postventa_descartados): lo eliminado NO reingresa       folio por tipo INS-/FAL-/…
   · errores transitorios → HTTP 500 → la macro reintenta el lote             o serie CAL- si viene de Calidad)
                                        ▼
   Módulo /postventa/tickets: Bandeja (triage, por asignar, Interno/Externo ptm.cl, lector de hilo estilo Outlook,
   derivar a técnico) · Tickets (filtros por tipo/origen/estado, export) · Calendario (fecha_programada) ·
   Dashboard (pv_dashboard) · Técnicos (catálogo editable)
```
- Alternativa M365: Edge Function `postventa-extractor` (Graph API, requiere
  secrets GRAPH_*) — desde v1.18.3 usa la **misma** `ingesta_pv_correo`
  (hilos + descartados), así ambos caminos se comportan igual.
- Equipo/Modelo del ticket se alimenta del stock real: `pv_familias_stock()`
  (familia = 3 primeros caracteres de `tms_partidas.codigo_producto`).

### 4.5 Administración
- **Usuarios y Roles** (`/admin/users`, unificado): usuarios en `tms_usuarios`
  (+ `create_auth_user`/`update_auth_password` para el par en Supabase Auth);
  roles en `tms_roles` con `permisos_json` + `landing_page`; la vista previa
  "Accesos que otorga" cruza permisos ↔ rutas con `accesosConPermisos()`.
- **Vistas** (`/admin/views`): enciende/apaga módulos → `tms_modules_config`
  (el Navbar la consulta vía `ConfigContext`, con realtime).
- **Tickets TI**, **Historial de Cargas**, **Monitor** (presencia), **Limpieza**
  (`clean_operational_data`), **Ubicaciones**, **Bodegas Softland**.

---

## 5. Plataforma móvil (Android)

```
Mismo código React ──npm run deploy:mobile──▶ build + cap sync + bundle a Capgo (canal production)
                                                    │
App instalada (com.cco.wms) ── al abrir ──▶ @capgo/capacitor-updater descarga el bundle nuevo (OTA)
Nativo: ML Kit (escáner cámara, useBarcodeScanner) · Haptics · Push FCM (token en tms_usuarios.push_token)
Push server-side: triggers de BD ──pg_net──▶ Edge Functions notify-ticket / notify-inventario / send-push ──▶ FCM
```

---

## 6. Despliegue y entrega

| Destino | Cómo | Detalle |
|---|---|---|
| **Web (Render)** | push a `main` | Render corre `server.js`, que sirve el **`dist/` commiteado** (regenerar con `npm run build` antes de commitear). `index.html`/manifest/SW van `no-cache`; assets hasheados, immutable. Headers de seguridad + CSP en `server.js`. |
| **Android (Capgo)** | `npm run deploy:mobile` | auto-incrementa el patch de `package.json` y sube el bundle OTA. |
| **BD (Supabase)** | migraciones `supabase/migrations/001…061` | se aplican vía MCP/CLI y quedan versionadas en el repo. |
| **Edge Functions** | deploy vía MCP/CLI | `postventa-inbox` (verify_jwt off, auth por token), `postventa-extractor`, `notify-*`/`send-push`. |

PWA: `vite-plugin-pwa` precachea la app (excepto `/traspasos`) y cachea
lecturas de Supabase en runtime (se purga al hacer logout).

---

## 7. Dónde mirar cuando algo falla

| Síntoma | Primer lugar |
|---|---|
| "Acceso denegado" inesperado | `ROUTE_PERMISSIONS` (permissions.js) + permisos del rol en Admin → Roles |
| Un dato no se refresca | claves de invalidación del hook en `src/services/…Service.js` |
| Correos que no llegan a Post-Venta | Logs de la Edge Function `postventa-inbox` (Supabase → Functions) — desde v1.18.3 los errores devuelven 500 y la macro reintenta |
| Correo/caso que "revive" | tabla `tms_postventa_descartados` (si el id está ahí, la ingesta lo ignora) |
| Error de una RPC | el mensaje del toast ES el `RAISE EXCEPTION` de la función en Postgres |
| Pantalla blanca tras deploy | caché del navegador/SW — desde v1.18.3 `index.html` es no-cache (mitigado) |
| Push que no llega | `tms_usuarios.push_token` + logs de `notify-*` |
| Seguridad BD | `supabase/DIAGRAMA_BD.md` §6 + `get_advisors` |
