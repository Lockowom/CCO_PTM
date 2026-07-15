import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Detrás del proxy de Render: la IP real del cliente llega en X-Forwarded-For
// (necesario para que el rate-limit por IP no vea la IP del balanceador).
app.set('trust proxy', 1);

// Rate-limit simple en memoria (por clave): devuelve false si se excedió.
const rateBuckets = new Map();
function rateLimitOk(key, max, windowMs) {
  const now = Date.now();
  const fresh = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs);
  if (fresh.length >= max) { rateBuckets.set(key, fresh); return false; }
  fresh.push(now);
  rateBuckets.set(key, fresh);
  return true;
}
// Poda periódica para que el Map no crezca sin límite.
setInterval(() => {
  const now = Date.now();
  for (const [k, arr] of rateBuckets) {
    const fresh = arr.filter((t) => now - t < 10 * 60 * 1000);
    if (fresh.length) rateBuckets.set(k, fresh); else rateBuckets.delete(k);
  }
}, 5 * 60 * 1000).unref?.();

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // SAMEORIGIN (no DENY): permite embeber páginas propias como /traspasos en un
  // iframe dentro del framework; sigue bloqueando el enmarcado por sitios externos.
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    // script-src SIN 'unsafe-inline' (hallazgo S3): el único script inline del
    // sitio es el fijador de tema de /traspasos, permitido por su hash sha256
    // (si cambia ese inline, recalcular el hash). El asistente de IA no llama
    // a Anthropic desde el navegador (proxy /api/traspasos-ai) y el geocoding
    // ya no sale del origen (proxy /api/geocode | /api/route) → connect-src
    // sin nominatim/osrm.
    // frame-src: 'self' (iframe propio de Traspasos en /traspasos/) + el Panel PTM
    // (Next.js en Vercel) embebido en /tools/panel.
    "default-src 'self'; script-src 'self' 'sha256-FS5pu9F1XSI0eqDWQs2P/lSOYdkqq1PG0kBMjc4+SfE='; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io; font-src 'self'; frame-src 'self' https://panel-dashboard-ptm.vercel.app;"
  );
  next();
});

// ============================================================
// Proxy IA para el módulo Traspasos ("Mejorar con IA").
// La clave de Anthropic vive SOLO en el servidor (env var
// ANTHROPIC_API_KEY) — nunca se envía al navegador ni se commitea.
// El navegador llama a este endpoint same-origin (permitido por el CSP)
// y el servidor añade la clave real. Se exige un token de sesión de
// Supabase válido para que la clave no pueda usarse anónimamente.
// ============================================================
const SUPA_URL = process.env.SUPABASE_URL || 'https://vtrtyzbgpsvqwbfoudaf.supabase.co';
const SUPA_ANON =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnR5emJncHN2cXdiZm91ZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzMwMDQsImV4cCI6MjA4NjMwOTAwNH0.NijuPeeOMwLyM8H_AiagKXEut1TMr2qkQZ6CHLn4RSM';

app.post('/api/traspasos-ai', express.json({ limit: '1mb' }), async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res
      .status(503)
      .json({ error: { message: 'IA no configurada: falta ANTHROPIC_API_KEY en el servidor.' } });
  }
  // Validar sesión CCO (token de Supabase) antes de gastar la clave.
  const authz = req.headers['authorization'] || '';
  const token = authz.startsWith('Bearer ') ? authz.slice(7) : '';
  if (!token) return res.status(401).json({ error: { message: 'Falta sesión CCO.' } });
  // Rate-limit por sesión (fallback IP): un usuario autenticado no puede quemar
  // la cuota de la API key en bucle.
  if (!rateLimitOk(`ia:${token.slice(-24) || req.ip}`, 20, 5 * 60 * 1000)) {
    return res.status(429).json({ error: { message: 'Demasiadas peticiones de IA. Espera unos minutos.' } });
  }
  try {
    const u = await fetch(`${SUPA_URL}/auth/v1/user`, {
      headers: { apikey: SUPA_ANON, Authorization: `Bearer ${token}` },
    });
    if (!u.ok) return res.status(401).json({ error: { message: 'Sesión CCO inválida.' } });
  } catch (e) {
    return res.status(502).json({ error: { message: 'No se pudo validar la sesión.' } });
  }
  // Reenviar la petición a Anthropic con la clave del servidor.
  // Solo se aceptan los campos que usa el asistente de Traspasos; el resto se
  // descarta para que la clave no pueda usarse con parámetros arbitrarios
  // (modelos caros, streaming, tokens ilimitados) desde otra sesión.
  const b = req.body || {};
  if (typeof b.model !== 'string' || !b.model.startsWith('claude-')) {
    return res.status(400).json({ error: { message: 'Modelo no permitido.' } });
  }
  const payload = {
    model: b.model,
    max_tokens: Math.min(Number(b.max_tokens) || 1024, 2048),
    messages: b.messages,
    ...(b.system ? { system: b.system } : {}),
    ...(typeof b.temperature === 'number' ? { temperature: b.temperature } : {}),
    stream: false,
  };
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000),
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (e) {
    const timedOut = e?.name === 'TimeoutError' || e?.name === 'AbortError';
    res.status(timedOut ? 504 : 502).json({
      error: { message: timedOut ? 'La IA tardó demasiado en responder.' : 'Error al contactar la IA: ' + String(e) },
    });
  }
});

// ============================================================
// Proxies de geocoding (privacidad, Ley 21.719): las direcciones de clientes
// ya no salen del navegador hacia los servicios públicos de OSM. El servidor
// consulta Nominatim/OSRM con caché en memoria, User-Agent identificado
// (requisito de la política de uso de Nominatim) y rate-limit por IP; las IPs
// de los usuarios nunca llegan al tercero. Pendiente organizacional: contratar
// un proveedor con DPA (Google/Mapbox) y apuntar estos proxies allí.
// ============================================================
const GEO_UA = 'CCO-PTM-WMS/1.0 (logistica@ptm.cl)';
const geoCache = new Map();   // q → { v, exp }
const routeCache = new Map(); // coords → { v, exp }
const cacheGet = (m, k) => { const e = m.get(k); return e && e.exp > Date.now() ? e.v : undefined; };
const cachePut = (m, k, v, ttlMs) => { if (m.size > 5000) m.clear(); m.set(k, { v, exp: Date.now() + ttlMs }); };

app.get('/api/geocode', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 300);
  if (!q) return res.status(400).json({ error: { message: 'Falta q.' } });
  if (!rateLimitOk(`geo:${req.ip}`, 90, 60 * 1000)) {
    return res.status(429).json({ error: { message: 'Demasiadas peticiones.' } });
  }
  const hit = cacheGet(geoCache, q.toLowerCase());
  if (hit !== undefined) return res.json(hit);
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=cl&q=${encodeURIComponent(q + ', Chile')}`;
    const r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': GEO_UA }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) return res.status(502).json({ error: { message: `Geocoder HTTP ${r.status}` } });
    const data = await r.json();
    const out = Array.isArray(data) && data.length
      ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      : null;
    cachePut(geoCache, q.toLowerCase(), out, 30 * 24 * 3600 * 1000);
    res.json(out);
  } catch (e) {
    res.status(502).json({ error: { message: 'Geocoder no disponible.' } });
  }
});

app.get('/api/route', async (req, res) => {
  const { olat, olon, dlat, dlon } = req.query;
  const nums = [olat, olon, dlat, dlon].map(Number);
  if (nums.some((n) => Number.isNaN(n))) return res.status(400).json({ error: { message: 'Coordenadas inválidas.' } });
  if (!rateLimitOk(`geo:${req.ip}`, 90, 60 * 1000)) {
    return res.status(429).json({ error: { message: 'Demasiadas peticiones.' } });
  }
  const key = nums.map((n) => n.toFixed(5)).join(',');
  const hit = cacheGet(routeCache, key);
  if (hit !== undefined) return res.json(hit);
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${nums[1]},${nums[0]};${nums[3]},${nums[2]}?overview=false&alternatives=false&steps=false`;
    const r = await fetch(url, { headers: { 'User-Agent': GEO_UA }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) return res.status(502).json({ error: { message: `OSRM HTTP ${r.status}` } });
    const data = await r.json();
    if (data.code !== 'Ok' || !data.routes?.length) return res.status(404).json({ error: { message: 'Sin ruta.' } });
    const out = { km: data.routes[0].distance / 1000 };
    cachePut(routeCache, key, out, 7 * 24 * 3600 * 1000);
    res.json(out);
  } catch (e) {
    res.status(502).json({ error: { message: 'Servicio de rutas no disponible.' } });
  }
});

// Cualquier otra ruta /api inexistente responde 404 en vez de caer al
// fallback SPA (que devolvería index.html con 200 y enmascararía errores).
app.all('/api/*', (req, res) => res.status(404).json({ error: { message: 'Endpoint no existe.' } }));

app.use(express.static(join(__dirname, 'dist'), {
  etag: true,
  setHeaders: (res, filePath) => {
    // HTML, manifest y service worker SIEMPRE revalidan: si se cachean, tras un
    // deploy el navegador pide chunks hasheados que ya no existen → pantalla blanca.
    if (/\.(html|webmanifest)$/.test(filePath) || /(?:^|[\\/])(sw\.js|registerSW\.js|workbox-[^\\/]+\.js)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (/[\\/]assets[\\/]/.test(filePath)) {
      // Assets con hash en el nombre: inmutables por un año.
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  },
}));

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
