// URL base pública de la app (para armar enlaces que se comparten hacia afuera,
// como el formulario público de servicio /soporte).
//
// El problema: `window.location.origin` da `localhost` (o `capacitor://…`) cuando
// se abre desde la app nativa o en desarrollo, así que el link copiado quedaba mal.
//
// Resolución en orden de prioridad:
//   1) VITE_PUBLIC_URL — override explícito (Render → Environment, y CI de Capgo).
//      Úsalo para fijar el dominio propio (ej. https://soporte.ptm.cl).
//   2) window.location.origin — SOLO si es una web real (http/https y no
//      localhost / IP / .local / capacitor). En la web pública ya es correcto solo.
//   3) '' — sin base conocida (app nativa/dev sin env): el UI cae a la ruta relativa.
export function publicBaseUrl() {
  const env = import.meta.env?.VITE_PUBLIC_URL;
  if (env && String(env).trim()) return String(env).trim().replace(/\/+$/, '');

  if (typeof window !== 'undefined' && window.location) {
    const o = window.location.origin || '';
    const esLocalOApp =
      /^(capacitor|file|ionic):/i.test(o) ||
      /\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|\[?::1\]?)/i.test(o) ||
      /\.local(?::\d+)?$/i.test(o);
    if (/^https?:/i.test(o) && !esLocalOApp) return o.replace(/\/+$/, '');
  }
  return '';
}

// Enlace absoluto (o relativo si no hay base) a una ruta pública.
export function publicUrl(path = '/') {
  const base = publicBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
