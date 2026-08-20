// ============================================================================
//  Identity & Security · Fase 2 — Primitivas de autorización del cliente
//  Capa declarativa SOBRE AuthContext (fuente única). NO introduce un segundo
//  origen de permisos: reusa `hasPermission` del contexto, que ya consume el IAM
//  (`iam_me()`) con respaldo legado. Ver docs/IAM_ARQUITECTURA.md §9.3/§11/§16.
//
//  Uso:
//    const { hasAny, isAdmin } = useAuthz();
//    <Can perm="view_panel"> … </Can>
//    <Can anyOf={['manage_roles','view_roles']} fallback={<Denegado/>}> … </Can>
//    <RequirePermission allOf={['manage_conteo','supervise_conteo']}> … </RequirePermission>
// ============================================================================
import { useAuth } from '../../context/AuthContext';

/**
 * Hook de autorización. Deriva helpers de conjunto (any/all) y el flag admin
 * a partir del contexto de sesión. El bypass de ADMIN / admin-delegado es el
 * mismo que aplica `hasPermission` y el guard de rutas.
 */
export function useAuthz() {
  const {
    hasPermission,
    hasScreenAccess,
    hasFunctionAccess,
    permissions,
    roles,
    user,
    iamRuntime
  } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado === true;

  const hasAny = (perms = []) =>
    isAdmin || (Array.isArray(perms) && perms.some((p) => hasPermission(p)));
  const hasAll = (perms = []) =>
    isAdmin || (Array.isArray(perms) && perms.length > 0 && perms.every((p) => hasPermission(p)));

  return {
    hasPermission,
    hasScreenAccess,
    hasFunctionAccess,
    hasAny,
    hasAll,
    isAdmin,
    permissions: permissions || [],
    roles: roles || [],
    user,
    iamRuntime
  };
}

/**
 * Resuelve una regla de permisos declarativa a booleano.
 *  - perm  : string   → requiere ese permiso.
 *  - anyOf : string[] → requiere ≥1 (semántica OR, igual que ROUTE_PERMISSIONS).
 *  - allOf : string[] → requiere todos.
 * Sin ninguna prop → permite (útil para envolver sin condición).
 */
function evaluate({ perm, anyOf, allOf, screen, fn, fallbackPermissions }, authz) {
  if (fn) return authz.hasFunctionAccess(fn, fallbackPermissions || []);
  if (screen) return authz.hasScreenAccess(screen, false);
  if (perm) return authz.hasPermission(perm);
  if (anyOf) return authz.hasAny(anyOf);
  if (allOf) return authz.hasAll(allOf);
  return true;
}

/**
 * <Can> — muestra `children` solo si se cumple la regla; si no, `fallback`
 * (por defecto: nada). `children` puede ser función `() => ReactNode` para
 * diferir el render del bloque protegido.
 */
export function Can({
  perm,
  anyOf,
  allOf,
  screen,
  fn,
  fallbackPermissions,
  fallback = null,
  children
}) {
  const authz = useAuthz();
  const ok = evaluate({ perm, anyOf, allOf, screen, fn, fallbackPermissions }, authz);
  if (!ok) return fallback;
  return typeof children === 'function' ? children(authz) : children;
}

/**
 * <RequirePermission> — alias semántico de <Can> para envolver secciones/páginas.
 * Idéntica lógica; se distingue por intención (bloques grandes vs. botones).
 */
export function RequirePermission(props) {
  return <Can {...props} />;
}

export default Can;
