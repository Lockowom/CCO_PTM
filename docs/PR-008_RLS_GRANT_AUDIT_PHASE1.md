# PR-008 · RPC/GRANT/RLS Audit — Phase 1

Estado del repositorio en la rama `release-a-foundation`.

## Alcance

Auditoría estática de la superficie de seguridad de la API (RPCs, GRANTs y
políticas RLS) en `supabase/migrations`. Phase 1 = inventario y verificación de
invariantes automatizables; phase 2 (fuera de RELEASE A) = validación en BD live
con `supabase db` / MCP.

## Hallazgos positivos (ya endurecido)

| Migración | Qué cierra |
|-----------|------------|
| `018_fix_rbac_privilege_escalation` | tms_usuarios/roles/permisos salen del modelo `ALL USING(true)`: lectura-auth + escritura-admin + trigger que congela columnas privilegiadas para no-admins. |
| `063_rls_datos_personales` | RLS de tablas con datos personales (tms_usuarios, tms_conductores, correos, log de accesos) → "acceso según necesidad". |
| `095_motor_seguridad_advisors` | Cierra `EXECUTE` por `PUBLIC` en RPCs de escritura (guardar_usuario, usuarios_bulk, sync_calidad_a_recepcion) y fija search_path mutable. |
| `134_iam_hardening_revoke_view_grant` | Revoca SELECT sobre `iam.user_effective_permissions` para `authenticated` (matriz de todos los usuarios). |
| `138_ia_revoke_anon` | Revoca herramientas del asistente IA de `anon`. |
| `152_recepcion_rbac_lockdown` | Escrituras de recepción solo ADMIN/admin delegado/CONTROL_CALIDAD. |
| `167_enable_rls_system_alert_rules` | Activa RLS en `system_alert_rules` (hallazgo de Supabase Advisor). |
| `20260804001546_hotfix_security` | Revoca `nv_bitacora`, `bulk_upsert`, `tms_operaciones` y `tms_nv_bitacora` de `PUBLIC/anon`. |
| `20260817163500_optimize_tms_operaciones_read_rls` | RLS de lectura con initplans (sin re-evaluar IAM por fila); políticas con `revoke ... from public, anon`. |

## Patrones correctos observados

1. RPCs de escritura son `SECURITY DEFINER` con gate propio vía
   `usuario_tiene_algun_permiso` / `auth.uid()` (bypassean RLS con control interno).
2. Las nuevas funciones siempre acompañan `revoke all ... from public, anon` +
   `grant ... to authenticated` (p.ej. `authz.operaciones_lectura_total()`).
3. Las tablas con datos personales tienen RLS `FOR SELECT` específico por rol.

## Invariantes de phase 1 (verificadas en CI)

- El frontend NO invoca RPCs de escalada ni de administración IAM directamente
  (ver `src/tests/rpcSurfaceContract.test.js`). La superficie de cliente queda
  acotada a RPCs de dominio/lectura.

## Pendiente phase 2 (recomendado, fuera de RELEASE A)

- `supabase db diff` / `db lint` contra la BD live.
- Revisar RPCs SECURITY DEFINER cuyo `search_path` no incluya `pg_temp` explícito.
- Revisar que ninguna policy use `to public`/`to anon` residual.
- Confirmar en live que `revoke` de phase 1 no rompió flujos de service_role
  (los triggers/migraciones de sync usan `service_role` por diseño).