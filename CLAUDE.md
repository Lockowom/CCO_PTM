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
```

## Estructura
- `src/pages/` — módulos (Inbound, Outbound, TMS, Queries, Quality, Admin, Mobile)
- `src/components/`, `src/hooks/`, `src/services/`, `src/lib/`, `src/constants/`, `src/context/`
- `src/stores/` — stores Zustand unificadas (`warehouseStore`, `pickingStore`)
- `supabase/migrations/` — migraciones versionadas (`001`…`031`); aplicar nuevas vía MCP/CLI
- `dist/` — **build commiteado a propósito**: Render lo sirve con `server.js` (express static).
  Regenerar con `npm run build` y commitearlo al desplegar.

## Despliegue
- **Web**: push a `main` → Render. La web sirve el `dist/` del repo (commitearlo tras `npm run build`).
- **Móvil**: `npm run deploy:mobile` (requiere `.env` cargado; auto-incrementa el patch de
  `package.json` y sube bundle a Capgo OTA, canal `production`, app `com.cco.wms`).

## Notas de estado
- Existen hallazgos de seguridad históricos en la BD (políticas RLS permisivas `USING (true)`,
  funciones `SECURITY DEFINER` ejecutables por `authenticated`). Revisar `get_advisors` antes de tocar BD.

## Git
- Rama de trabajo: `main`. No crear PRs salvo petición explícita.
