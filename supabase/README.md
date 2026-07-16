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
  - `044_tms_partidas_normalizar_partida.sql` — **fix integridad de stock**: trigger que normaliza `partida` (NULL/espacios → `''`) para que `UNIQUE(codigo_producto, partida)` deduplique las filas sin lote (antes, partida `NULL` no chocaba y cada carga la re-insertaba → 45.681 filas duplicadas; hasta 31 copias). Incluye nota de la limpieza única (respaldo `tms_partidas_backup_20260709`; 51.489→4.784 filas).
  - `045_tms_series_normalizar_serie.sql` — mismo fix para `tms_series` (serie NULL): trigger de normalización + limpieza única (respaldo `tms_series_backup_20260709`; 49.432→5.074 filas).
  - `043_conteo_reportes.sql` — reportes del Conteo Cíclico: RPCs `conteo_conciliacion(p_sesion_id)` (contado Σ vs stock actual por SKU, con impacto valorizado desde `tms_conteo_costos`) y `conteo_ajuste_erp(p_sesion_id)` (por SKU+partida, para cuadrar con el ERP). Sólo lectura, `authenticated`.
  - `042_conteo_ciclico.sql` — **Conteo Cíclico de Inventario** (port nativo de `lockowom/t-o-inventario`): tablas `tms_conteo_sesiones`, `tms_conteos`, `tms_conteo_bloques`(+`_items`), `tms_conteo_auditorias`(+`_items`), `tms_conteo_proyecciones`, `tms_conteo_costos`. Reusa el stock de CCO (`tms_partidas`/`tms_series`) para el snapshot `cantidad_sistema` (RPC `conteo_stock_sistema`, prioridad serie>partida>SKU) y el estado CUADRADO/FALTA/SOBRA/SIN_STOCK. Escrituras por RPCs SECURITY DEFINER (`registrar_conteo`, `editar_conteo`, `crear_conteo_bloque`, `registrar_conteo_auditoria`, …) gateadas por permisos nuevos `view_conteo`/`manage_conteo`/`supervise_conteo`; lectura por RLS `authenticated`. Regla: contador edita solo lo propio en sesión abierta; supervisor/admin, todo.
  - `067_analisis_codigos.sql` — **Inventario → Análisis de Códigos** (port del Excel "STOCK NAME"):
    tabla `tms_productos_activo` (catálogo Activo Si/No; escritura solo vía `bulk_upsert`, agregada a su
    allowlist) + RPCs `analisis_codigos(p_filtro, p_q)` / `analisis_codigos_resumen()` (SECURITY DEFINER,
    gate `_analisis_assert` con permisos de bodega/stock): clasificación P/S/Antiguo, antiguos con
    disponible, duplicados por descripción (+código P/S equivalente, equivale al PS_Index del Excel),
    activo/no encontrado, no activos con stock y anomalías con diagnóstico. Calcula en vivo sobre
    `tms_inventario_general` sumado por SKU entre bodegas.
  - `082_operaciones_migracion.sql` — **Migración Panel PTM → CCO**: tabla `tms_operaciones` (espejo de
    `operaciones` del Panel, Google Sheet → Supabase) como futura fuente de verdad. `id` surrogate estable
    (no se regenera), `origen`/`row_hash`; catálogo `tms_operaciones_estado_cat` (11 estados canónicos) + FK;
    función `tms_operaciones_norm_estado` + trigger que normaliza el estado (`ENTREGADO`→`Entregado`, fusiones
    Recibido*→Entregado) y refresca `updated_at`; índices de lectura; RLS SELECT a `authenticated`. Sin clave
    única de negocio (parcializaciones legítimas). Import histórico server-side con la extensión `http`
    (DB→CCO), reconciliado al 100% (1.970 filas). Escrituras nativas desde CCO: fase siguiente (RPC).
  - `083_operaciones_sync_dual.sql` — **auto-refresco doble corrida**: `pg_cron` (`panel-sync-operaciones`,
    cada 10 min) llama `public.panel_sync_operaciones()` (SECURITY DEFINER, EXECUTE revocado a public) que
    lee la PostgREST del Panel (`http`, config en `private.panel_sync_config`) y reemplaza el set `origen='sheet'`
    en una transacción atómica, preservando filas `origen='cco'`. Estado en `tms_operaciones_sync`. Se apaga en
    el cutover con `cron.unschedule('panel-sync-operaciones')`.
  - `084_consulta_nv_publica.sql` — **consulta pública de N.V.**: RPC `buscar_nv_publico(p_q)` (SECURITY
    DEFINER, `grant execute` a `anon`) para la página abierta `/consulta`. Devuelve estado + logística
    (sin montos ni datos internos: oculta valor_factura/valor_nv/costo_flete, vendedor, centro_costo,
    división, aprob. real, observaciones). Anti-abuso: mín. 3 caracteres, tope 25.
  - `085_operaciones_escrituras_cutover.sql` — **CUTOVER Panel**: apaga el auto-sync
    (`cron.unschedule` + `panel_sync_config.enabled=false`) → CCO fuente de verdad. RPCs de escritura
    `guardar_nv(jsonb)` y `cambiar_estado_nv(id,estado,urgente)` (SECURITY DEFINER, gate
    `_panel_puede_escribir()` = admin o permiso `manage_panel`). El trigger `tms_operaciones_before_write`
    estampa `fecha_estado` + fechas de etapa (proceso/shipping/ruta/entregado) en cambios nativos CCO.
    Bitácora `tms_operaciones_log`. Permiso nuevo `manage_panel`.
  - `086_ingresar_completo.sql` — **módulo Ingresar completo**: RPC `eliminar_nv(id)`; **Consolidados**
    (tablas `tms_consolidados` con ticket `CON-###` + `tms_consolidado_nvs`, RPCs `guardar_consolidado(jsonb)`
    y `eliminar_consolidado(id)`), todo gateado por `manage_panel`.
  - `087_builder_persistencia.sql` — **Builder**: tablas `tms_dashboard_layouts` (dashboards, config jsonb) y
    `tms_builder_calculated_fields` (campos calculados) + RPCs `guardar_dashboard`/`eliminar_dashboard`/
    `guardar_campo_calculado`/`eliminar_campo_calculado` (gate `manage_panel`).
  - `088_config_catalogos.sql` — **Configuración**: catálogos `tms_panel_transportistas` / `tms_panel_vendedores`
    (sembrados desde `tms_operaciones`) + RPCs genéricas `guardar_panel_catalogo`/`toggle_panel_catalogo`/
    `eliminar_panel_catalogo` (por `p_tipo`, gate `manage_panel`).
  - `089_panel_roles_grant.sql` — **acceso al Panel por rol**: GERENCIA + SUPERVISOR + Supervisor reciben
    `view_panel` y `manage_panel` (ADMIN ya accede por bypass).
  - `065_storage_privado.sql` — **Bloque A seguridad**: buckets `fichas-productos` y `monitoreo-evidencias` pasan a **privados** (las fotos se sirven con URLs firmadas desde el frontend, `src/lib/storageUrl.js`); políticas SELECT para `authenticated` en `storage.objects`; `pv_informe_calidad` agrega `storage_path` a las evidencias para que el visor del ticket firme.
  - `064_supresion_completa_usuario.sql` — **derecho de supresión (Ley 21.719)**: RPC `eliminar_usuario_completo(id)` (gate admin) — borra la cuenta `auth.users`, el log de accesos, la presencia y la auditoría del registro; **anonimiza** mediciones de tiempos, errores de picking y tickets TI; deja una marca `SUPRESION_COMPLETA` anónima. Conserva (documentado) las firmas/`creado_por_nombre` de registros de calidad por trazabilidad del rubro.
  - `063_rls_datos_personales.sql` — **RLS de datos personales**: `tms_usuarios` legible solo la fila propia (+admin; match por email para el primer login), `tms_conductores` (RUT/teléfono) solo con permisos TMS/consultas o la fila propia (escrituras: manage_drivers/auto-registro), correos/tickets/técnicos/descartados de Post-Venta solo con permisos del módulo (+gate en la RPC `pv_correos_ticket`), `tms_accesos` y `tms_errores_picking` solo lectura admin, `tms_mediciones_tiempos` solo outbound. Helper `usuario_tiene_algun_permiso(text[])` (SECURITY DEFINER, evita recursión).
  - `062_auditoria_sin_heartbeat_y_retencion.sql` — la auditoría de `tms_usuarios` deja de dispararse con el heartbeat de presencia (trigger `UPDATE OF` columnas de cuenta) y ya no guarda presencia/push_token; **purga** del histórico de latidos (102.441→35 filas, 139 MB→96 kB; + `VACUUM FULL`) y retenciones pg_cron: auditoría 12 m, mediciones 24 m, errores picking 24 m, correos Post-Venta 36 m.
  - `061_pv_hilo_orden_y_permisos_eliminar.sql` — **auditoría full-stack**: `pv_correos_ticket` ordena el hilo con desempate (`recibido, created_at, id` — correos de una misma ráfaga compartían timestamp y el hilo salía en orden no determinista) y `eliminar_pv_ticket`/`eliminar_pv_correo` pasan a exigir **`supervise_postventa`** (`_pv_assert(true)`), alineándose al modelo declarado del permiso; la UI oculta los botones 🗑 sin ese permiso.
  - `060_accion_correo_enviado.sql` — RPC `accion_correo_enviado(accion_id, referencia?)` para la carpeta **CALIDAD TRAZABILIDAD** de Inventario → Traspasos: al marcar "Correo enviado", la Acción de Calidad se **resuelve automáticamente según el dictamen** (acuse *"Correo de traspaso enviado · Dictamen X · Acción Y → BD Z"*, referencia, resuelto_por). Gate: Inventario (`manage_inventory`) / área responsable / Calidad / admin.
  - `059_pv_informe_calidad_visor.sql` — RPC `pv_informe_calidad(numero)`: entrega al ticket de Post-Venta el **informe de Calidad completo** (`{informe, item, evidencias, accion}` vía ticket → acción → ítem dictaminado, con fallback por número de informe + SKU) para que Servicio Técnico lo lea dentro del ticket sin permisos de Calidad. Gate Post-Venta/Calidad/admin.
  - `058_pv_serie_calidad.sql` — serie especial **`CAL-AAAA-NNN`** para los tickets derivados de Calidad: generador genérico `pv_siguiente_folio_serie(prefijo)`; `accion_a_ticket_pv` asigna la serie CAL- y `actualizar_pv_ticket` la **conserva** al reclasificar el tipo. Backfill de casos Calidad existentes.
  - `057_pv_folio_por_tipo.sql` — **correlativo único por tipo de solicitud** en Post-Venta: columna `folio_tipo` (único parcial), `pv_tipo_prefijo()` (INS/CAP/MPR/MCO/FAL/VIS/PEM/GAR/VEN/DIA/OTR) y `pv_siguiente_folio_tipo()` (advisory lock por serie+año); asignan `crear_pv_ticket`, `ingesta_pv_correo` y `accion_a_ticket_pv`; `actualizar_pv_ticket` re-asigna al reclasificar el tipo (el `numero` TKT- no cambia). Backfill de los tickets existentes.
  - `056_pv_folio_sobre_999_fix.sql` — **FIX crítico del folio de Post-Venta**: `lpad(n,3,'0')` truncaba sobre el Nº 999 (`lpad('1000',3)='100'`) → con 999 tickets ya creados ningún ticket nuevo podía generarse. Helper `pv_folio_num()` aplicado a `crear_pv_ticket`, `ingesta_pv_correo`, `accion_a_ticket_pv` y `siguiente_pv_numero`.
  - `055_calidad_acciones_integracion_modulos.sql` — **Calidad ↔ módulos ejecutores**: columnas `ticket_postventa`/`referencia` en `tms_calidad_acciones` y `accion_folio`/`informe_numero` en `tms_postventa_tickets`; RPC `accion_a_ticket_pv` (acción REPARACION/POST_VENTA → ticket TKT- con el informe de calidad adjunto, idempotente; la acción pasa a EN_PROCESO) y `accion_registrar_referencia` (Inventario registra el traspaso/correo generado; gate área responsable/Calidad/admin); `trazabilidad_producto` muestra Ticket ST y Ref. de traspaso en el evento ACCION.
  - `054_modules_config_inventario_postventa.sql` — siembra los módulos `inventario` y `postventa` en `tms_modules_config` para que Admin → Vistas pueda encenderlos/apagarlos (Vistas solo muestra módulos con fila en esa tabla ∩ `APP_MODULES`).
  - `053_drop_restos_conteo_legacy.sql` — **limpieza aprobada** de la auditoría: DROP de 8 tablas muertas (`wms_bloques(+3)`, `wms_cc_*(3)`, `wms_proyecciones`; 0 filas, 0 referencias — restos del primer intento del Conteo Cíclico) y 4 funciones sin uso (`wms_reserve_stock`, `get_fefo_allocation`, `fn_auto_complete_picking`, `fn_trigger_replenishment`). El esquema queda en 61 tablas vivas.
  - `052_harden_funciones_auditoria.sql` — **endurecimiento de la auditoría completa de BD** (ver `DIAGRAMA_BD.md`): revoca `anon` de 11 funciones SECURITY DEFINER que eran ejecutables sin sesión (`pv_dashboard`, `conteo_conciliacion`, `conteo_stock_sistema`, helpers `_*_assert`, …; se conserva pública solo `verificar_certificado` para el QR), fija `search_path` en 7 funciones que lo tenían mutable (incl. `private.calidad_firma_mensaje`) y revoca `anon` de `mv_dashboard_kpis`.
  - `051_postventa_descartados.sql` — Post-Venta: **eliminar/descartar correos**. Tabla `tms_postventa_descartados` (lista negra de `id_correo`); `ingesta_pv_correo` ignora los descartados (RETURN NULL) y sube a 40 reintentos de folio; RPCs `eliminar_pv_ticket(numero)` (descarta los correos del caso) y `eliminar_pv_correo(id_correo)`.
  - `050_postventa_correos_hilo.sql` — Post-Venta: **hilos de correo** (un caso por conversación). Tabla `tms_postventa_correos` (De/Para/CC/Asunto/cuerpo/adjuntos/recibido por correo, dedup por `id_correo`), columna `conversation_id` en el ticket, RPC `ingesta_pv_correo(...)` (guarda el correo y lo enlaza a UN ticket por hilo; crea el ticket solo si el hilo es nuevo) y `pv_correos_ticket(numero)` (hilo ordenado). La Edge Function `postventa-inbox` usa esta RPC.
  - `049_pv_familias_stock.sql` — Post-Venta: RPC `pv_familias_stock()` (solo lectura, `authenticated`) que alimenta el selector **Equipo/Modelo** con las **familias reales del stock** (familia = 3 primeros chars de `tms_partidas.codigo_producto`; devuelve familia + conteo de SKUs + ejemplo).
  - `048_postventa_comuna.sql` — selector **Región → Comuna** en Post-Venta: columna `comuna` en `tms_postventa_tickets`; `crear_pv_ticket` (+param opcional `p_comuna` al final) y `actualizar_pv_ticket` la manejan.
  - `047_postventa_agenda.sql` — **Calendario/Agenda** de Post-Venta: columnas `fecha_programada` (date) + `hora_programada` (text) en `tms_postventa_tickets` (índice en `fecha_programada`); `crear_pv_ticket` se recrea con 2 params opcionales al final (`p_fecha_programada`/`p_hora_programada`) y `actualizar_pv_ticket` maneja ambos campos.
  - `046_postventa_tickets.sql` — módulo **Post-Venta / Servicio Técnico** (port nativo de `lockowom/post-venta`): `tms_postventa_tickets` (folio `TKT-AAAA-###`, cliente/región/equipo/serie, tipo, prioridad, técnico, estado, cotizar, resultado, `origen` Manual|Correo, `id_correo` con índice único parcial para dedup del extractor) y `tms_postventa_tecnicos` (catálogo editable). RPCs SECURITY DEFINER `crear_pv_ticket` (idempotente por `id_correo` + advisory lock del folio), `actualizar_pv_ticket`, `pv_dashboard`, `guardar_pv_tecnico`, `eliminar_pv_tecnico`; helper `_pv_assert` (permite `service_role` para el extractor). Permisos `view_postventa`/`manage_postventa`/`supervise_postventa`; lectura por RLS `authenticated`.
  - `041_emil_traspasos_supabase.sql` — backend del módulo **Inventario → Traspasos/Ajustes** (app em-il): `tms_emil_sync` (historial compartido blob `{traspasos,ajustes}` por `space`, reemplaza el sync Firestore vía `public/traspasos/cco-bridge.js`) y `tms_emil_catalogo` (catálogo maestro de SKUs blob, sembrado desde el catálogo estático la 1ª vez). Ambas con RLS `authenticated` (ledger interno compartido).
- `DIAGRAMA_BD.md` — **mapa completo de la BD** (auditoría 2026-07-09): diagramas ER por módulo
  (FKs reales), relaciones lógicas por texto (sin FK, de diseño), inventario de las 95 funciones
  verificadas, Edge Functions y hallazgos con su estado.
- `functions_snapshot.sql` — **snapshot autoritativo** (idempotente, `CREATE OR REPLACE`) de
  todas las funciones/RPC tal como existen en la BD live (capa de seguridad `private.*` +
  wrappers `public`, y RPC de negocio). Útil para recrear o auditar.
- `functions/send-push/` — Edge Function (push FCM).
- `functions/postventa-extractor/` — Edge Function (Deno) del módulo **Post-Venta**: lee un buzón
  Outlook/M365 vía Microsoft Graph (client credentials, `Mail.Read`), dedup por id de mensaje y crea
  tickets `origen='Correo'` con `crear_pv_ticket`. Secrets: `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`,
  `GRAPH_CLIENT_SECRET`, `PV_MAILBOX` (+ opc. `PV_MAILBOX_FOLDER`, `PV_SOLO_DESDE`). Programar con
  pg_cron+pg_net o invocar manualmente.
- `functions/postventa-inbox/` — Edge Function (Deno) **webhook de ingesta** para el módulo
  **Post-Venta**: alternativa al extractor Graph para buzones **POP**. No lee correos; recibe por
  POST (JSON o form) los datos que un script externo (lector POP) ya extrajo y crea el ticket
  `origen='Correo'` con `crear_pv_ticket` (idempotente por `id_correo`). Acepta objeto o array de
  correos, alias tolerantes de campos, y autentica por **token compartido** (`?token=`, header
  `x-pv-token` o body) contra el secret `PV_INGEST_TOKEN`. `verify_jwt` off (auth propia por token).
- `functions/postventa-publico/` — Edge Function (Deno) del **formulario público** de servicio
  (ruta abierta `/soporte`, sin login). Recibe por POST los datos de la solicitud, aplica anti-spam
  (honeypot, tiempo mínimo de llenado `t_ms`, **Turnstile opcional** por secret `PV_TURNSTILE_SECRET`)
  y crea el ticket con el `service_role` vía la RPC `crear_pv_ticket_publico` (borrador, `origen='Web'`;
  rate-limit por IP y global sobre `tms_postventa_publico_log`). `verify_jwt` **off** (endpoint público).
  Migración `078`. Sin secrets obligatorios (Turnstile opcional).
- `legacy_sql/` — scripts SQL **históricos/obsoletos** movidos desde la raíz del repo.
  Conservados solo como referencia. **No ejecutar**: pueden revertir el estado actual.

## Convención
- Todo cambio de esquema/función va como **nueva migración numerada** y se refleja en
  `functions_snapshot.sql` y en la documentación (`DOCUMENTACION_PROYECTO.md`, regla en
  `CLAUDE.md`).
- La autorización de admin usa **`private.is_admin()`** (por `auth_uid`). No usar helpers por email.
