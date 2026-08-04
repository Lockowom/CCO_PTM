# Hotfix August 2026

## Scope

- `notify-ticket` and `notify-ticket-update` are now versioned under `supabase/functions/`.
- Both functions require a valid JWT through `supabase/config.toml`.
- Database Webhooks must send the service-key Authorization header; browser clients must use their user JWT.
- The two existing `pg_net` trigger functions read that legacy service-role JWT from Vault secret `edge_webhook_service_role`; the migration stops before making changes if it is absent.
- `FCM_SERVICE_ACCOUNT` is the only custom Edge Function secret. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by Supabase.
- The migration gates N.V. audit reads behind `view_panel` or `manage_panel`, revokes anonymous execution, and makes bulk ingestion tolerate blank/zero/malformed dates per row.
- `package-lock.json` was regenerated and received only dependency updates allowed by the existing semver ranges. `npm audit --omit=dev` now reports 0 critical and 0 high vulnerabilities (5 moderate remain).
- The Android and Capgo workflows now explicitly use `package-lock.json` as the `actions/setup-node` cache dependency path; its cache key changes automatically with the regenerated lockfile.

## Public search preserved

The public N.V. tracking contract exposed by `buscar_nv_publico` is intentionally preserved. CCO uses `tms_operaciones`, which has no `telefono_publico` column, and the public page needs the existing N.V. status and logistics fields to operate. This hotfix does not modify that RPC.

## Deploy Edge Functions

```bash
npx supabase@latest link --project-ref vtrtyzbgpsvqwbfoudaf
npx supabase@latest functions deploy notify-ticket
npx supabase@latest functions deploy notify-ticket-update
```

Do not use `--no-verify-jwt`.

## Required Vault secret

Create this once in the Supabase SQL Editor, replacing the placeholder locally. Do not commit the key.

```sql
select vault.create_secret(
  '<legacy-service-role-JWT>',
  'edge_webhook_service_role',
  'JWT used only by pg_net ticket notification triggers'
);
```

## Validate the database migration

```bash
npx supabase@latest db push
npx supabase@latest db advisors --linked
```

## Local validation

```bash
npm ci
npm run typecheck
npm run test
npm run build
```

## Rollback in the first five minutes

Redeploy the previous Edge Function version from the Supabase dashboard or from the prior Git commit. For the database, create a forward-only rollback migration after restoring the previous `bulk_upsert` and `nv_bitacora` definitions from migrations `143` and `146`; never delete an applied migration.
