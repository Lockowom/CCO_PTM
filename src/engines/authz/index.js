export function canAccessAny(required = [], granted = []) {
  if (!required.length) return true;
  const grantedSet = new Set(granted || []);
  return required.some((permission) => grantedSet.has(permission));
}

export function canAccessRoute(routePermissions = {}, route, granted = []) {
  const normalizedRoute = String(route || '').split('?')[0];
  return canAccessAny(routePermissions[normalizedRoute] || [], granted);
}
