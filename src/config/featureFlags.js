// PR-015B · Feature flags de CCO 2.0 (regla transversal FEATURE_IMPLEMENTED != FEATURE_RELEASED).
//
// Un módulo puede estar 100% implementado y desplegado, pero NO publicado.
// Cada subsistema nuevo en etapa oculta/private-beta vive detrás de un flag
// `module_<nombre>_private_beta` que por defecto está APAGADO (fail-closed).
//
// El flag NO es la única capa: la ruta además exige permiso IAM específico
// (`view_<nombre>_private_beta`) y autorización backend/RPC. Ver
// `src/constants/privateBeta.js` y `docs/PR-015B_PRIVATE_BETA_GOVERNANCE.md`.

// Flags de release. Conmutables por entorno (VITE_FF_<FLAG>=true) o por DB
// (el flag de persistencia lo administra Admin en el futuro). OFF = oculto.
export const FEATURE_FLAGS = {
  core_auth_v2: false,
  core_scope_failclosed: true,
  core_presence_v2: false,
  core_supabase_client_v2: false,
  core_states_ssot_v2: true,
  core_sla_domain_v2: false,
  core_query_cache_v2: false,
  core_logging_v2: true,
  // Runtime implementado. OFF por defecto hasta completar la regresión visual;
  // beta/staging puede activarlo con VITE_FF_WEB_SHELL_V2=true.
  web_shell_v2: false,
  web_sidebar_v2: true,
  web_topbar_v2: true,
  web_page_header_v2: true,
  web_feedback_v2: true,
  web_datatable_v2: false,
  web_forms_v2: false,
  web_login_v2: false,
  web_public_v2: false,
  web_dashboard_v2: false,
  web_panel_nv_v2: false,
  web_routes_v2: false,
  web_tms_v2: false,
  web_inbound_v2: false,
  web_inventory_v2: false,
  web_quality_v2: false,
  web_postventa_v2: false,
  web_admin_v2: false,
  web_builder_v2: false,
  web_tv_v2: false,
  mobile_shell_v2: true,
  mobile_bottom_nav: true,
  mobile_bottom_sheet_v2: false,
  mobile_dashboard_v2: false,
  mobile_form_nv_v2: false,
  mobile_pda_v2: false,
  mobile_routes_v2: false,
  mobile_tms_v2: false,
  mobile_map_v2: false,
  mobile_quality_v2: false,
  // Coordinación de Rutas / TMS (piloto privado ACTIVO) — migrado del UUID
  // hardcodeado: el flag ON solo admite beta users por rol IAM, ya no por auth_uid.
  module_rutas_private_beta: true,
  // PR-016 · Fase D del optimistic concurrency (Panel N.V.): exige `version`
  // en cada UPDATE (los clientes legacy sin versión quedan bloqueados). OFF =
  // compatibility mode (gate opcional). El server-side real es la setting
  // `app.nv_require_version` en la migración 173; este flag es espejo cliente.
  panel_nv_require_version: false
  // FUTUROS MÓDULOS: agregar aquí su flag antes de crear la ruta.
  // module_<nombre>_private_beta: false,
};

/** ¿El flag está habilitado? Override por env (VITE_FF_<FLAG>=true) para staging/beta. */
export function isFeatureFlagEnabled(flag) {
  if (typeof flag !== 'string' || !flag) return false;
  const envKey = `VITE_FF_${flag.toUpperCase()}`;
  const envVal =
    typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[envKey] : undefined;
  if (envVal !== undefined && envVal !== '') return String(envVal).toLowerCase() === 'true';
  return FEATURE_FLAGS[flag] === true;
}

/** Devuelve las claves de flags habilitadas (para diagnóstico/UI de admin). */
export function enabledFeatureFlags() {
  return Object.keys(FEATURE_FLAGS).filter((f) => isFeatureFlagEnabled(f));
}
