# Supabase — esquema y funciones

**Fuente de verdad del backend.** Proyecto: `WMS-CCO-PTM` (`vtrtyzbgpsvqwbfoudaf`).

## Estructura
- `migrations/` — migraciones **numeradas y ordenadas** (ejecutar en orden):
  - `001_verify_user_password.sql` — RPC legacy de verificación (deprecada).
  - `002_auth_migration.sql` — migración a Supabase Auth (auth_uid, helpers).
  - `003_rls_policies.sql` — RLS en todas las tablas.
  - `004_harden_security_definer_rpcs.sql` — cierre de acceso `anon` a `bulk_upsert`/`search_batches`.
  - `005_drop_legacy_admin_helpers.sql` — elimina `is_admin_safe`/`is_user_admin`.
- `functions_snapshot.sql` — **snapshot autoritativo** (idempotente, `CREATE OR REPLACE`) de
  todas las funciones/RPC tal como existen en la BD live (capa de seguridad `private.*` +
  wrappers `public`, y RPC de negocio). Útil para recrear o auditar.
- `functions/send-push/` — Edge Function (push FCM).
- `legacy_sql/` — scripts SQL **históricos/obsoletos** movidos desde la raíz del repo.
  Conservados solo como referencia. **No ejecutar**: pueden revertir el estado actual.

## Convención
- Todo cambio de esquema/función va como **nueva migración numerada** y se refleja en
  `functions_snapshot.sql` y en la documentación (`DOCUMENTACION_PROYECTO.md`, regla en
  `CLAUDE.md`).
- La autorización de admin usa **`private.is_admin()`** (por `auth_uid`). No usar helpers por email.
