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
Android (Capacitor + Capgo OTA). Versión actual: **1.4.13**.

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
- `src/pages/` — módulos (Inbound, Outbound, TMS, Queries, Admin, Mobile)
- `src/components/`, `src/hooks/`, `src/services/`, `src/lib/`, `src/constants/`
- `src/store/` y `src/stores/` — **ambas en uso** (warehouseStore vs pickingStore); pendiente unificar
- `supabase/migrations/` — solo 3 migraciones (auth + RLS)
- `SUPABASE_*.sql` (raíz) y `database/` — DDL/RPC sueltos, **no versionados como migraciones**

## Notas de estado (ver `REVISION_PROYECTO.md`)
- Parte del esquema y varias RPC viven en `SUPABASE_*.sql` de la raíz o solo en la BD live.
- Existen hallazgos de seguridad pendientes (p. ej. `clean_operational_data` sin check de
  admin, RLS faltante en `tms_inventario_general`). Revisar antes de tocar BD.

## Git
- Rama de trabajo actual: `claude/documentation-review-G3x0i`.
- No crear PRs salvo petición explícita.
