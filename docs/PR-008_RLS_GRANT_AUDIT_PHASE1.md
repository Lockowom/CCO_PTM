# PR-008 · RPC/GRANT/RLS Audit — Phase 1

Estado del repositorio en la rama `release-a-foundation`.

## Alcance

Auditoría estática de la superficie de seguridad de la API (RPCs, GRANTs y
políticas RLS) en `supabase/migrations`. Phase 1 = inventario y verificación de
invariantes automatizables; phase 2 (fuera de RELEASE A) = validación en BD live
con `supabase db` / MCP.

## Hallazgos positivos (ya endurecido)

| Migración                                          | Qué cierra                                                                                                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `018_fix_rbac_privilege_escalation`                | tms_usuarios/roles/permisos salen del modelo `ALL USING(true)`: lectura-auth + escritura-admin + trigger que congela columnas privilegiadas para no-admins. |
| `063_rls_datos_personales`                         | RLS de tablas con datos personales (tms_usuarios, tms_conductores, correos, log de accesos) → "acceso según necesidad".                                     |
| `095_motor_seguridad_advisors`                     | Cierra `EXECUTE` por `PUBLIC` en RPCs de escritura (guardar_usuario, usuarios_bulk, sync_calidad_a_recepcion) y fija search_path mutable.                   |
| `134_iam_hardening_revoke_view_grant`              | Revoca SELECT sobre `iam.user_effective_permissions` para `authenticated` (matriz de todos los usuarios).                                                   |
| `138_ia_revoke_anon`                               | Revoca herramientas del asistente IA de `anon`.                                                                                                             |
| `152_recepcion_rbac_lockdown`                      | Escrituras de recepción solo ADMIN/admin delegado/CONTROL_CALIDAD.                                                                                          |
| `167_enable_rls_system_alert_rules`                | Activa RLS en `system_alert_rules` (hallazgo de Supabase Advisor).                                                                                          |
| `20260804001546_hotfix_security`                   | Revoca `nv_bitacora`, `bulk_upsert`, `tms_operaciones` y `tms_nv_bitacora` de `PUBLIC/anon`.                                                                |
| `20260817163500_optimize_tms_operaciones_read_rls` | RLS de lectura con initplans (sin re-evaluar IAM por fila); políticas con `revoke ... from public, anon`.                                                   |

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

- ~~`supabase db diff` / `db lint` contra la BD live~~ → realizado (2026-08-17, ver abajo).
- Revisar RPCs SECURITY DEFINER cuyo `search_path` no incluya `pg_temp` explícito.
- Revisar que ninguna policy use `to public`/`to anon` residual.
- ~~Confirmar en live que `revoke` de phase 1 no rompió flujos de service_role~~ → realizado (2026-08-17, ver abajo).

---

## Phase 2 — Audit LIVE RPC/GRANT + Telemetría IAM (PR-008b, RELEASE B)

Validación en BD live (PROD `vtrtyzbgpsvqwbfoudaf`) + endurecimiento aplicado el **2026-08-17**, cerrando los pendientes de phase 1.

### Migración 174 — `174_audit_live_revoke_anon_and_iam_telemetry.sql` (APLICADA)

1. **Revoke anon/public** de ~55 funciones sensibles detectadas en el audit live:
   `wms_move_stock`, `batch_update_nv_estado`, `get_dashboard_kpis`, `fuzzy_search`,
   `monitoreo_dictaminar`, `crear_pv_ticket`, triggers/helpers de workflow
   (`registrar_cambio_estado`, `normalizar_texto`, etc.), `authz.*`, `private.*` y los
   duplicados en `public` de `clean_operational_data` / `create_auth_user` /
   `update_auth_password` / `get_user_role`.
   - **Quedan EXECUTE para anon por diseño**: `buscar_nv_publico`, `verificar_certificado`
     (superficie pública intencional) y `private.is_admin()` (la usan quals de políticas RLS;
     sin EXECUTE, las policies de anon fallarían con error — fail-closed correcto).
2. **Telemetría IAM** (bloqueos registrados, trazabilidad):
   - Tabla `public.tms_iam_denegaciones` (RLS activa; lectura solo admin vía `public.is_admin()`).
   - RPC `public.iam_log_denegacion(text, text, text, bigint, text, text)` — SECURITY DEFINER,
     `revoke all from public, anon` + `grant ... to authenticated`.
   - Hooks `perform public.iam_log_denegacion(...)` en las ramas `forbidden` de
     `guardar_nv(jsonb)` y `cambiar_estado_nv(bigint, text, boolean, bigint)` — **cuerpos
     byte-fieles a la migración 173** (verificado contra el origen; la 1ª versión divergía
     en `v_canal` default, `varios*` y `raise exception` y fue reescrita completa).

### Verificación en BD live (todo PASS)

- Firmas de las 2 RPCs en `pg_proc` coinciden con las del repo (query directa a PROD).
- Tras revokes: `wms_move_stock`/`fuzzy_search`/`batch_update_nv_estado`/`crear_pv_ticket`
  → anon=false, authenticated=true; públicas por diseño y `private.is_admin` → anon=true.
- `get_advisors` sin nuevos hallazgos bloqueantes post-174.

### Tests negativos IAM — BD real (documentados en `supabase/verificacion/PR-008c_iam_negative_tests.sql`)

Setup: assignment IAM TEMPORAL (rol SUPERVISOR, `scope_type='centro_costo'`,
`scope_code='TEST-CC'`) para Christian Vargas (OPERARIO_3, auth_uid
`224c7d7d-abe6-41ed-9390-421017dbf578`); sesión authenticated simulada vía
`set local role authenticated` + `request.jwt.claims`.

| Caso                                             | Resultado                                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| A1 anon → `guardar_nv`                           | ERROR 42501 `permission denied for function guardar_nv` (el revoke bloquea antes del gate interno) |
| T1 create en TEST-CC                             | ok (id 12144, v1)                                                                                  |
| T2 create en OTRO-CC                             | `forbidden:true` + telemetría                                                                      |
| T3 update con version correcta                   | ok (v2)                                                                                            |
| T4 `cambiar_estado_nv`                           | ok (v3)                                                                                            |
| T5 update scope ajeno (N.V. real 12137, cc 1-03) | `forbidden:true` + telemetría; fila real INTACTA                                                   |
| T6 `cambiar_estado_nv` scope ajeno               | `forbidden:true` + telemetría                                                                      |
| A2 ADMIN create/update                           | ok (12145, v1/v2)                                                                                  |

Telemetría: 3 filas con uid/rol/accion/permiso/cc/nv/motivo correctos. Cleanup: 0 residuales
(assignment temporal, N.V. de prueba y telemetría eliminadas).

### Flujos service_role (sync/migraciones) — no afectados

Las funciones revocadas se usan vía triggers/RPCs `SECURITY DEFINER` internos y sync con
service_role; verificado que los grants `authenticated` se conservan y el audit live no
encontró dependencias `anon` residuales en los flujos de escritura.

### Pendiente abierto (documentado, no bloqueante)

- Revisar `search_path` de RPCs SECURITY DEFINER que no incluya `pg_temp` explícito.
- Políticas con `to public`/`to anon` residuales en tablas sin datos sensibles (decisión por tabla).
