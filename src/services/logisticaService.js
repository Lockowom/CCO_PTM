// ── Servicios de logística: geocodificación + distancia real ───────────────
// Privacidad (Ley 21.719, hallazgo S7): las direcciones de clientes ya NO se
// envían desde el navegador a los servidores públicos de OpenStreetMap.
// El navegador llama a los proxies same-origin del server (/api/geocode y
// /api/route, ver server.js): el servidor consulta Nominatim/OSRM con caché
// propia, User-Agent identificado y rate-limit, y las IPs de los usuarios
// nunca llegan al tercero. Para volúmenes grandes sigue recomendado contratar
// un proveedor con DPA (Google/Mapbox) — el cambio queda acotado a server.js.

// En la app Android (Capacitor) el origin es https://localhost: se usa la URL
// pública de la web para llegar al proxy.
const API_BASE = /localhost|capacitor/i.test(window.location.origin) ? 'https://cco-ptm.onrender.com' : '';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Distancia geodésica (línea recta) en km — fallback instantáneo si la ruta falla.
 */
export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Geocodifica una dirección chilena. Devuelve { lat, lon } o null si no hay match.
 * Componentes: direccion, comuna, ciudad, region (los vacíos se omiten).
 */
export async function geocodeAddress({ direccion, comuna, ciudad, region }, { signal } = {}) {
  const parts = [direccion, comuna, ciudad, region]
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter(Boolean);
  if (!parts.length) return null;
  const qs = new URLSearchParams({ q: parts.join(', ') });
  const res = await fetch(`${API_BASE}/api/geocode?${qs}`, { headers: { Accept: 'application/json' }, signal });
  if (!res.ok) throw new Error(`Geocoder HTTP ${res.status}`);
  const data = await res.json();
  if (!data || data.lat == null || data.lon == null) return null;
  const lat = parseFloat(data.lat);
  const lon = parseFloat(data.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
}

/**
 * Distancia REAL de carretera (km) entre origen y destino (vía proxy del server).
 * Lanza si no hay ruta (el caller puede caer a haversine).
 */
export async function routeDistanceKm(origin, dest, { signal } = {}) {
  const qs = new URLSearchParams({
    olat: String(origin.lat), olon: String(origin.lon),
    dlat: String(dest.lat), dlon: String(dest.lon),
  });
  const res = await fetch(`${API_BASE}/api/route?${qs}`, { signal });
  if (!res.ok) throw new Error(`Ruta HTTP ${res.status}`);
  const data = await res.json();
  if (data?.km == null) throw new Error('Sin ruta');
  return Number(data.km);
}
