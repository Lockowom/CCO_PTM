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
  // Coordinación de Rutas / TMS (piloto privado ACTIVO) — migrado del UUID
  // hardcodeado: el flag ON solo admite beta users por rol IAM, ya no por auth_uid.
  module_rutas_private_beta: true,
  // PR-016 · Fase D del optimistic concurrency (Panel N.V.): exige `version`
  // en cada UPDATE (los clientes legacy sin versión quedan bloqueados). OFF =
  // compatibility mode (gate opcional). El server-side real es la setting
  // `app.nv_require_version` en la migración 173; este flag es espejo cliente.
  panel_nv_require_version: false,
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