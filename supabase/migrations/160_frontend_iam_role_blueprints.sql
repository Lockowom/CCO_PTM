-- ============================================================================
-- 160_frontend_iam_role_blueprints.sql
-- IAM simplificado desde frontend: publica una matriz oficial de roles,
-- permisos y landing pages; organiza usuarios actuales por rol sin romper
-- asignaciones adicionales ya existentes.
-- ============================================================================

do $$
begin
  insert into public.tms_permisos (id, nombre, modulo)
  values (
    'approve_panel_reopen_nv',
    'Panel · aprobar/rechazar reaperturas de N.V. entregadas',
    'panel'
  )
  on conflict (id) do update
    set nombre = excluded.nombre,
        modulo = excluded.modulo;

  create temp table tmp_role_manifest (
    role_id text primary key,
    nombre text not null,
    descripcion text,
    landing_page text,
    permisos_json jsonb not null,
    team_code text not null,
    team_name text not null
  ) on commit drop;

  insert into tmp_role_manifest (role_id, nombre, descripcion, landing_page, permisos_json, team_code, team_name)
  values
    (
      'ADMIN',
      'Administrador',
      'Administracion integral del sistema, seguridad, configuracion y soporte.',
      '/admin/users',
      $json$[
        "view_stock","manage_inventory","view_traspasos","view_carteles","view_insumos","manage_insumos","manage_locations",
        "view_analisis","analisis_tab_resumen","analisis_tab_antiguos","analisis_tab_antiguos_disp","analisis_tab_no_activos",
        "analisis_tab_duplicados","analisis_tab_anomalias","analisis_tab_detalle","view_conteo","manage_conteo","supervise_conteo",
        "conteo_tab_contar","conteo_tab_sesiones","conteo_tab_conciliacion","conteo_tab_ajuste","conteo_tab_bloques","conteo_tab_proyeccion",
        "view_entry","process_entry","view_reception","process_reception","manage_data_import","view_historial_nv","view_dispatch_control",
        "view_batches","view_sales_status","view_addresses","view_locations","view_fichas","manage_fichas","export_data","manage_monitoreo",
        "manage_quality","view_acciones_calidad","view_panel","manage_panel","approve_panel_reopen_nv","panel_ingresar","panel_info","panel_tv",
        "panel_builder","view_asistente","view_postventa","manage_postventa","supervise_postventa","pv_tab_tickets","pv_tab_bandeja",
        "pv_tab_calendario","pv_tab_nuevo","pv_tab_dashboard","pv_tab_tecnicos","view_users","manage_users","view_roles","manage_roles",
        "view_views","manage_views","manage_tickets","admin_upload_history","admin_monitor","deploy_ota","view_workflows","manage_workflows",
        "view_eventos","manage_eventos","view_api","manage_api","manage_cleanup"
      ]$json$::jsonb,
      'ROL_ADMIN',
      'Equipo Administracion'
    ),
    (
      'CONTROL_CALIDAD',
      'Control Calidad',
      'Operacion y dictamen de calidad, inbound controlado y consulta transversal.',
      '/quality/monitoreo',
      $json$[
        "view_entry","process_entry","view_reception","process_reception","manage_monitoreo","manage_quality",
        "view_acciones_calidad","view_batches","view_locations","view_addresses","view_fichas",
        "view_carteles","view_historial_nv","panel_info","panel_tv"
      ]$json$::jsonb,
      'ROL_CONTROL_CALIDAD',
      'Equipo Control Calidad'
    ),
    (
      'GERENCIA',
      'Gerencia',
      'Vision ejecutiva con gestion amplia de panel, calidad, postventa y reportabilidad.',
      '/panel',
      $json$[
        "view_entry","process_entry","view_reception","process_reception","manage_data_import","view_batches",
        "view_locations","view_addresses","view_fichas","export_data","view_historial_nv","view_dispatch_control",
        "view_sales_status","manage_monitoreo","manage_quality","view_acciones_calidad","view_postventa","manage_postventa",
        "supervise_postventa","pv_tab_tickets","pv_tab_bandeja","pv_tab_calendario","pv_tab_nuevo","pv_tab_dashboard","pv_tab_tecnicos",
        "view_panel","manage_panel","approve_panel_reopen_nv","panel_ingresar","panel_info","panel_tv","panel_builder","view_workflows"
      ]$json$::jsonb,
      'ROL_GERENCIA',
      'Equipo Gerencia'
    ),
    (
      'INVENTARIO_',
      'Inventario',
      'Rol operativo de bodega extendido para inventario, recepcion y control fisico.',
      '/inventory/traspasos',
      $json$[
        "view_stock","manage_inventory","view_traspasos","view_carteles","view_insumos","manage_insumos","manage_locations",
        "view_analisis","analisis_tab_resumen","analisis_tab_antiguos","analisis_tab_antiguos_disp","analisis_tab_no_activos",
        "analisis_tab_duplicados","analisis_tab_anomalias","analisis_tab_detalle","view_conteo","manage_conteo",
        "conteo_tab_contar","conteo_tab_sesiones","conteo_tab_conciliacion","conteo_tab_ajuste","conteo_tab_bloques","conteo_tab_proyeccion",
        "view_entry","process_entry","view_reception","process_reception","manage_data_import","view_batches","view_locations","view_addresses"
      ]$json$::jsonb,
      'ROL_INVENTARIO',
      'Equipo Inventario'
    ),
    (
      'OPERADOR',
      'Operador Bodega',
      'Operacion diaria de bodega, consultas logisticas y herramientas de conteo.',
      '/mobile/pda',
      $json$[
        "view_stock","manage_inventory","view_traspasos","view_carteles","view_insumos","view_conteo","manage_conteo",
        "conteo_tab_contar","view_entry","view_reception","view_batches","view_locations","view_addresses","view_sales_status"
      ]$json$::jsonb,
      'ROL_OPERADOR',
      'Equipo Operadores'
    ),
    (
      'OPERARIO_3',
      'Operario 3',
      'Rol legacy de apoyo operativo, traspasos, recepcion, consultas y carga puntual.',
      '/inventory/traspasos',
      $json$[
        "view_stock","view_traspasos","view_batches","view_addresses","view_locations","view_entry","view_reception",
        "manage_data_import","view_carteles"
      ]$json$::jsonb,
      'ROL_OPERARIO_3',
      'Equipo Operario 3'
    ),
    (
      'SUPERVISOR',
      'Supervisor',
      'Jefatura operativa del panel con control de estados, reaperturas y consulta ejecutiva.',
      '/panel/ingresar',
      $json$[
        "view_panel","manage_panel","approve_panel_reopen_nv","panel_ingresar","panel_info","panel_tv",
        "view_historial_nv","view_dispatch_control","view_sales_status","export_data","view_batches",
        "view_locations","view_addresses","pv_tab_tickets","pv_tab_dashboard"
      ]$json$::jsonb,
      'ROL_SUPERVISOR',
      'Equipo Supervisores'
    ),
    (
      'SUPERVISOR_',
      'Supervisor Legacy',
      'Supervisor legado alineado al nuevo estandar con apoyo en inbound y consultas.',
      '/panel/ingresar',
      $json$[
        "view_panel","manage_panel","approve_panel_reopen_nv","panel_ingresar","panel_info","panel_tv","view_historial_nv",
        "view_dispatch_control","view_sales_status","view_entry","process_entry","view_reception","manage_data_import",
        "view_batches","view_locations","view_addresses","view_fichas"
      ]$json$::jsonb,
      'ROL_SUPERVISOR_LEGACY',
      'Equipo Supervisores Legacy'
    );

  insert into public.tms_roles (id, nombre, descripcion, landing_page, permisos_json)
  select role_id, nombre, descripcion, landing_page, permisos_json
  from tmp_role_manifest
  on conflict (id) do update
    set nombre = excluded.nombre,
        descripcion = excluded.descripcion,
        landing_page = excluded.landing_page,
        permisos_json = excluded.permisos_json;

  insert into iam.teams (codigo, nombre, activo)
  select team_code, team_name, true
  from tmp_role_manifest
  on conflict (codigo) do update
    set nombre = excluded.nombre,
        activo = true;

  delete from iam.team_members tm
  using iam.teams t
  where tm.team_id = t.id
    and t.codigo in (select team_code from tmp_role_manifest)
    and not exists (
      select 1
      from public.tms_usuarios tu
      join tmp_role_manifest m on m.role_id = tu.rol
      where tu.auth_uid = tm.user_id
        and m.team_code = t.codigo
    );

  insert into iam.team_members (team_id, user_id)
  select distinct t.id, tu.auth_uid
  from public.tms_usuarios tu
  join tmp_role_manifest m on m.role_id = tu.rol
  join iam.teams t on t.codigo = m.team_code
  where tu.auth_uid is not null
    and exists (select 1 from auth.users au where au.id = tu.auth_uid)
  on conflict do nothing;

  perform authz.rebuild_role(role_id)
  from tmp_role_manifest;

  insert into iam.assignments (principal_type, principal_id, role_id, scope_type)
  select 'user', tu.auth_uid, r.id, 'global'
  from public.tms_usuarios tu
  join iam.roles r on r.codigo = tu.rol
  join tmp_role_manifest m on m.role_id = tu.rol
  where tu.auth_uid is not null
    and exists (select 1 from auth.users au where au.id = tu.auth_uid)
  on conflict do nothing;

  perform authz.sync_user_profile(tu.auth_uid)
  from public.tms_usuarios tu
  join tmp_role_manifest m on m.role_id = tu.rol
  where tu.auth_uid is not null
    and exists (select 1 from auth.users au where au.id = tu.auth_uid);
end $$;
