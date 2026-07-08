# Supabase — esquema y funciones

**Fuente de verdad del backend.** Proyecto: `WMS-CCO-PTM` (`vtrtyzbgpsvqwbfoudaf`).

## Estructura
- `migrations/` — migraciones **numeradas y ordenadas** (ejecutar en orden):
  - `001_verify_user_password.sql` — RPC legacy de verificación (deprecada).
  - `002_auth_migration.sql` — migración a Supabase Auth (auth_uid, helpers).
  - `003_rls_policies.sql` — RLS en todas las tablas.
  - `004_harden_security_definer_rpcs.sql` — cierre de acceso `anon` a `bulk_upsert`/`search_batches`.
  - `005_drop_legacy_admin_helpers.sql` — elimina `is_admin_safe`/`is_user_admin`.
  - `006`…`016` — auth legacy, ficha técnica, monitoreo a calidad, informe de daños, series únicas por producto, direcciones y permiso de costos.
  - `017`…`024` — **sincronizadas desde la BD live** (2026-07-07): `operaciones`, `fix_rbac_privilege_escalation` (seguridad), `consolidar_roles_basura`, `audit_and_hardening` (seguridad), recepción nacionales, flags preliminares, lotes/series de calidad y no-registrado. Renumeradas cronológicamente; cada archivo mapea a su versión de `schema_migrations`.
  - `025_monitoreo_informe_transaccional.sql` — RPC atómica crear/editar informe de Monitoreo (fix de pérdida de datos y carrera del correlativo).
  - `026_monitoreo_editar_preserva_dictamen.sql` — al reeditar un informe dictaminado se conserva el dictamen y se re-vinculan los flags de calidad (fix CA-7).
  - `027_monitoreo_candidatos_venc_por_partida.sql` — el vencimiento solo se hereda cuando la partida de la ubicación coincide con el lote (fix CA-10).
  - `028_checklist_ingreso_calidad.sql` — hito "Ingreso a bodega": `tms_calidad_tareas` + triggers `AFTER INSERT` en las recepciones (Importaciones/Nacionales) que generan la tarea de CheckList a Calidad; RPC `guardar_checklist_ingreso` (certifica CONFORME con folio o marca NO CONFORME con alerta urgente).
  - `029_realtime_calidad_tareas.sql` — agrega `tms_calidad_tareas` a la publicación `supabase_realtime` (la cola de checklist se refresca en vivo al registrar una recepción).
  - `030_firma_certificado_calidad.sql` — firma electrónica (HMAC-SHA256) del Certificado/Acta: llave secreta en esquema `private`, RPC `firmar_certificado` (SECURITY DEFINER, permiso Calidad) y `verificar_certificado` (público, para el QR; no expone la llave). Columnas de firma en `tms_calidad_tareas`.
  - `031_checklist_disposicion_y_folio.sql` — folio también para NO CONFORME (`ACTA-AAAA-NNNN`; CONFORME sigue `CERT-`), columna `disposicion` y parámetro `p_disposicion` en `guardar_checklist_ingreso`.
  - `032_categorias_producto_calidad.sql` — segmentación del catálogo por **familia** (equipo activo, insumo estéril, mobiliario, ayuda técnica, bienestar/no sanitario, empaque/Farmapack): `clasificar_producto` (clasificador por palabras clave), `tms_categorias_calidad` (metadatos + criterios de aceptación por familia + flags `es_dispositivo_medico`/`requiere_registro_isp`/`clase_riesgo`), columna `categoria` en los ítems de recepción (backfill + trigger `BEFORE INSERT`), RPC `calidad_categorias_tarea` (familias de una recepción para el checklist por familia) y `set_categoria_producto` + `tms_producto_categoria` (override manual persistente). Requisito ISO 13485 §7.4.3 + marco ISP. Ver `MATRIZ_CATEGORIAS_CALIDAD.md`.
  - `033_calidad_asignaciones_instancia.sql` — **Hito 2 "Instancia"**: `tms_calidad_asignaciones` (cola de revisiones que **Inventario asigna a Calidad**: SKUs en jsonb, estado, prioridad, enlace `informe_id`), en la publicación realtime. RPCs `crear_asignacion_calidad` (gate `manage_inventory`/Calidad/admin + notificación), `resolver_asignacion_calidad` (enlaza el informe de Monitoreo generado; gate Calidad) y `anular_asignacion_calidad`. El hito 2 reusa el flujo de informe/dictamen de Monitoreo.
  - `034_calidad_certificado_salida.sql` — **Hito 3 "Salida"** (Certificado de Conformidad de despacho): reutiliza `tms_calidad_tareas` con `tipo='CERTIFICADO_SALIDA'` (se relaja `recepcion_id` a nullable; se agregan `despacho_id` y `contexto` jsonb). `guardar_checklist_ingreso` pasa a ser **tipo-aware** en el folio (salida → `CERT-SAL-`/`ACTA-SAL-`; ingreso sigue `CERT-`/`ACTA-`). RPC `crear_tarea_salida(p_despacho_id)` crea la tarea desde un despacho de `tms_control_despacho` (disparo **manual**; la tabla de despachos es histórica masiva). Reusa folio + firma HMAC + descarga PDF/Word.
  - `035_candidatos_busqueda_por_ubicacion.sql` — `monitoreo_candidatos` también empareja por **ubicación** (antes solo código/descripción), para ver los SKUs de una ubicación al asignar a Calidad (hito 2) y al armar informes de Monitoreo.
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
