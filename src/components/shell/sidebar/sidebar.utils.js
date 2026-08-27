import { matchPath } from 'react-router-dom';

export function routeDisplayTitle(item) {
  const title = item?.title || '';
  return title.split(' - ')[1] || title;
}

export function routePath(path = '') {
  const base = path.split('?')[0].replace(/\/$/, '');
  return base || '/';
}

export function isRouteActive(itemPath, pathname) {
  const path = routePath(itemPath);
  const current = routePath(pathname);
  if (path === '/') return current === '/';
  return Boolean(
    matchPath({ path, end: true }, current) || matchPath({ path: `${path}/*`, end: false }, current)
  );
}

export function isGroupActive(group, pathname) {
  return Boolean(group?.items?.some((item) => isRouteActive(item.path, pathname)));
}
