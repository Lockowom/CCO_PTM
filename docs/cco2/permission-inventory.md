# CCO 2.0 · Inventario de permisos

Catálogo observado: **81** identificadores referenciados por el guard.

- `admin`
- `admin_monitor`
- `admin_upload_history`
- `amplio`
- `analisis_tab_anomalias`
- `analisis_tab_antiguos`
- `analisis_tab_antiguos_disp`
- `analisis_tab_detalle`
- `analisis_tab_duplicados`
- `analisis_tab_no_activos`
- `analisis_tab_resumen`
- `approve_panel_reopen_nv`
- `contar`
- `conteo_tab_ajuste`
- `conteo_tab_bloques`
- `conteo_tab_conciliacion`
- `conteo_tab_contar`
- `conteo_tab_proyeccion`
- `conteo_tab_sesiones`
- `manage_api`
- `manage_cleanup`
- `manage_conteo`
- `manage_data_import`
- `manage_eventos`
- `manage_insumos`
- `manage_inventory`
- `manage_locations`
- `manage_monitoreo`
- `manage_panel`
- `manage_postventa`
- `manage_quality`
- `manage_rendiciones`
- `manage_roles`
- `manage_tickets`
- `manage_tms`
- `manage_users`
- `manage_views`
- `manage_workflows`
- `panel_builder`
- `panel_info`
- `panel_ingresar`
- `panel_tv`
- `process_entry`
- `process_reception`
- `pv_tab_bandeja`
- `pv_tab_calendario`
- `pv_tab_dashboard`
- `pv_tab_nuevo`
- `pv_tab_tecnicos`
- `pv_tab_tickets`
- `resumen`
- `supervise_conteo`
- `supervise_postventa`
- `supervise_tms`
- `tickets`
- `view_acciones_calidad`
- `view_addresses`
- `view_analisis`
- `view_api`
- `view_batches`
- `view_carteles`
- `view_conteo`
- `view_dispatch_control`
- `view_entry`
- `view_eventos`
- `view_fichas`
- `view_historial_nv`
- `view_insumos`
- `view_locations`
- `view_panel`
- `view_postventa`
- `view_reception`
- `view_rendiciones`
- `view_roles`
- `view_sales_status`
- `view_stock`
- `view_tms`
- `view_traspasos`
- `view_users`
- `view_views`
- `view_workflows`

## Contrato de migración

`effectivePermission = IAM OR LEGACY OR ADMIN OR DELEGATED_ADMIN` durante compatibilidad.
El harness en `docs/iam-v2` debe mantener `LOSS=0` antes de retirar legacy.
