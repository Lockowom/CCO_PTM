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
  - `036_tarea_salida_manual.sql` — RPC `crear_tarea_salida_manual` (hito 3): crear la certificación de salida **manualmente** (N.V. escrita a mano + SKUs elegidos), sin depender de `tms_control_despacho`. Los SKUs quedan en `contexto.skus`.
  - `037_admin_eliminar_tareas_calidad.sql` — borrado **solo ADMIN** (limpieza de pruebas): `_calidad_assert_admin()`, `eliminar_tarea_calidad(uuid)` (hito 1 checklist / hito 3 salida) y `eliminar_asignacion_calidad(uuid)` (hito 2). Gateadas a `rol='ADMIN'`/`es_admin_delegado`; el frontend muestra el botón de papelera solo a admin.
  - `038_acciones_calidad.sql` — **Acciones de Calidad** (la acción recomendada del dictamen se promulga como tarea rastreable por área): `tms_areas_calidad` (áreas→roles: Bodega, Ventas, Calidad, Gerencia, Administración), `tms_calidad_acciones` (folio `ACC-AAAA-NNNN`, tipo de acción, área responsable, estado, resolución) en realtime, permiso `view_acciones_calidad` (otorgado a los roles de área), y RPCs `crear_accion_calidad` (Calidad promulga), `resolver_accion_calidad` (**cierra el área responsable** o admin; exige acuse) y `anular_accion_calidad`.
  - `039_bodegas_softland.sql` — catálogo `tms_bodegas_softland` (código+estado DISPONIBLE/TRANSITORIO del ERP) para que el **destino del dictamen** use las bodegas reales de Softland; semilla con los códigos visibles (21,22,24,5,3,99,7); RPCs admin `guardar_bodega_softland`/`eliminar_bodega_softland`; columna `bodega_destino` en `tms_calidad_acciones` (snapshot del ítem, para filtrar por bodega).
  - `040_trazabilidad_producto.sql` — RPC `trazabilidad_producto(codigo, partida, ubicacion)`: reúne en una **línea de tiempo** la Recepción (checklist), Estancia (dictámenes de monitoreo), Acciones y Salida de un SKU, más el estado de calidad vigente (`tms_calidad_flags`). Alimenta la pantalla "Mi Bandeja" por área.
  - `043_conteo_reportes.sql` — reportes del Conteo Cíclico: RPCs `conteo_conciliacion(p_sesion_id)` (contado Σ vs stock actual por SKU, con impacto valorizado desde `tms_conteo_costos`) y `conteo_ajuste_erp(p_sesion_id)` (por SKU+partida, para cuadrar con el ERP). Sólo lectura, `authenticated`.
  - `042_conteo_ciclico.sql` — **Conteo Cíclico de Inventario** (port nativo de `lockowom/t-o-inventario`): tablas `tms_conteo_sesiones`, `tms_conteos`, `tms_conteo_bloques`(+`_items`), `tms_conteo_auditorias`(+`_items`), `tms_conteo_proyecciones`, `tms_conteo_costos`. Reusa el stock de CCO (`tms_partidas`/`tms_series`) para el snapshot `cantidad_sistema` (RPC `conteo_stock_sistema`, prioridad serie>partida>SKU) y el estado CUADRADO/FALTA/SOBRA/SIN_STOCK. Escrituras por RPCs SECURITY DEFINER (`registrar_conteo`, `editar_conteo`, `crear_conteo_bloque`, `registrar_conteo_auditoria`, …) gateadas por permisos nuevos `view_conteo`/`manage_conteo`/`supervise_conteo`; lectura por RLS `authenticated`. Regla: contador edita solo lo propio en sesión abierta; supervisor/admin, todo.
  - `041_emil_traspasos_supabase.sql` — backend del módulo **Inventario → Traspasos/Ajustes** (app em-il): `tms_emil_sync` (historial compartido blob `{traspasos,ajustes}` por `space`, reemplaza el sync Firestore vía `public/traspasos/cco-bridge.js`) y `tms_emil_catalogo` (catálogo maestro de SKUs blob, sembrado desde el catálogo estático la 1ª vez). Ambas con RLS `authenticated` (ledger interno compartido).
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
