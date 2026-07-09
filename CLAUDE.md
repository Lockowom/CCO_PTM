# CLAUDE.md — Guía para agentes en CCO_PTM

## Regla permanente: sincronizar documentación
**Toda modificación de código o de base de datos DEBE reflejarse en la documentación.**
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
  (Vite → `dist/traspasos/`, express la sirve), embebida vía iframe en `/tools/traspasos`
  (`src/pages/Tools/Traspasos.jsx`), enlace en menú *Operaciones WMS → Traspasos*. Actualizar con
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

## Módulo nativo: Conteo Cíclico
- **Conteo Cíclico de Inventario** (port nativo del proyecto `lockowom/t-o-inventario`, NO iframe):
  reescrito sobre Supabase reusando el stock de CCO (`tms_partidas`/`tms_series`). Migraciones
  `042` (dominio + RPCs) y `043` (reportes). Frontend: `src/pages/Mobile/ConteoPDA.jsx` (conteo en
  el PDA, reemplaza el placeholder "CONTEO CÍCLICO"), `src/pages/Inventory/ConteoCiclico.jsx`
  (escritorio: sesiones, conciliación, ajuste ERP, bloques/QR, proyección) y `BloqueDetalle.jsx`
  (destino del QR `/inventory/bloque/:codigo`). Servicio `src/services/conteoService.js`. Permisos
  `view_conteo`/`manage_conteo`/`supervise_conteo`. Genera QR con la dependencia `qrcode`.

## Estructura
- `src/pages/` — módulos (Inbound, Outbound, TMS, Queries, Quality, Admin, Mobile)
- `src/components/`, `src/hooks/`, `src/services/`, `src/lib/`, `src/constants/`, `src/context/`
- `src/stores/` — stores Zustand unificadas (`warehouseStore`, `pickingStore`)
- `supabase/migrations/` — migraciones versionadas (`001`…`045`); aplicar nuevas vía MCP/CLI
- `dist/` — **build commiteado a propósito**: Render lo sirve con `server.js` (express static).
  Regenerar con `npm run build` y commitearlo al desplegar.

## Despliegue
- **Web**: push a `main` → Render. La web sirve el `dist/` del repo (commitearlo tras `npm run build`).
  - **Env var** `ANTHROPIC_API_KEY` (Render → Environment): habilita el asistente "Mejorar con IA" del
    módulo Traspasos vía el proxy `POST /api/traspasos-ai` (la clave vive solo en el servidor).
- **Móvil**: `npm run deploy:mobile` (requiere `.env` cargado; auto-incrementa el patch de
  `package.json` y sube bundle a Capgo OTA, canal `production`, app `com.cco.wms`).

## Notas de estado
- Existen hallazgos de seguridad históricos en la BD (políticas RLS permisivas `USING (true)`,
  funciones `SECURITY DEFINER` ejecutables por `authenticated`). Revisar `get_advisors` antes de tocar BD.

## Git
- Rama de trabajo: `main`. No crear PRs salvo petición explícita.
