// ── Servicios de logística: geocodificación + distancia real ───────────────
// Usa servicios públicos GRATUITOS de OpenStreetMap:
//   • Nominatim  → geocodifica (dirección de texto → lat/long). Límite de uso:
//     ~1 petición/segundo. El caller DEBE throttlear (ver `sleep`).
//   • OSRM       → distancia REAL de carretera (ruta de manejo) entre 2 puntos.
// Ambos responden con CORS y no requieren API key. Para volúmenes grandes
// conviene migrar a un proveedor pagado (Google/Mapbox) o self-host de OSRM.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Distancia geodésica (línea recta) en km — fallback instantáneo si OSRM falla.
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
  const parts = [direccion, comuna, ciudad, region, 'Chile']
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter(Boolean);
  if (parts.length <= 1) return null; // solo "Chile" → no hay nada que geocodificar
  const q = parts.join(', ');
  const url = `${NOMINATIM_URL}?format=jsonv2&limit=1&countrycodes=cl&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' }, signal });
  if (!res.ok) throw new Error(`Geocoder HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
}

/**
 * Distancia REAL de carretera (km) entre origen y destino vía OSRM.
 * Lanza si OSRM no responde o no hay ruta (el caller puede caer a haversine).
 */
export async function routeDistanceKm(origin, dest, { signal } = {}) {
  const coords = `${origin.lon},${origin.lat};${dest.lon},${dest.lat}`;
  const url = `${OSRM_URL}/${coords}?overview=false&alternatives=false&steps=false`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.length) throw new Error('OSRM: sin ruta');
  return data.routes[0].distance / 1000; // metros → km
}
