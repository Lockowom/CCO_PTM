import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Versión desplegada (package.json de este build). El cliente la consulta en
// /api/version y, si difiere de su __APP_VERSION__, cierra sesión y recarga →
// "al actualizar, obliga a re-loguear" (igual que el Panel).
const APP_VERSION = (() => {
  try { return JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8')).version || null; }
  catch { return null; }
})();

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
    // frame-src: 'self' (iframe propio de Traspasos en /traspasos/). El Panel PTM
    // ahora es NATIVO en CCO — el iframe externo (Vercel) se retiró tras la migración.
    "default-src 'self'; script-src 'self' 'sha256-FS5pu9F1XSI0eqDWQs2P/lSOYdkqq1PG0kBMjc4+SfE='; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io; font-src 'self'; frame-src 'self';"
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
// Asistente IA conversacional (v1, SOLO LECTURA). Igual que el proxy de
// Traspasos la clave de Anthropic vive solo en el servidor; además el modelo
// puede invocar un CONJUNTO CERRADO de herramientas (tool use) que se traducen
// a RPCs seguras de Supabase. Las RPC se ejecutan con el TOKEN DEL USUARIO, de
// modo que la BD aplica exactamente los permisos y el ámbito (centro_costo) de
// esa persona; el servidor nunca usa la service-role para leer datos. Ninguna
// herramienta escribe: es solo consulta. El modelo es configurable por env
// (IA_MODEL) y por defecto reutiliza el mismo que ya opera en Traspasos.
// ============================================================
const IA_MODEL = process.env.IA_MODEL || 'claude-opus-4-8';
// name → { def (esquema para Anthropic), rpc, map(input)→args }
const IA_TOOLS = [
  {
    def: { name: 'kpis', description: 'Indicadores/resumen general del sistema (operaciones/N.V. por estado, urgentes e incidencias; tickets de Post-Venta; stock). Úsalo para preguntas de panorama ("cómo vamos", "cuántas NV pendientes", "resumen").', input_schema: { type: 'object', properties: {} } },
    rpc: 'ia_kpis', map: () => ({}),
  },
  {
    def: { name: 'buscar_operaciones', description: 'Busca notas de venta / operaciones de despacho por texto (NV, cliente, vendedor, factura) y/o estado. Devuelve filas con cliente, estado, fechas, transportista, urgente, valor.', input_schema: { type: 'object', properties: { q: { type: 'string', description: 'Texto a buscar (NV, cliente, vendedor, factura). Opcional.' }, estado: { type: 'string', description: 'Filtrar por estado exacto (p.ej. "En Proceso", "Entregado"). Opcional.' }, limit: { type: 'integer', description: 'Máx filas (1-50, def 20).' } } } },
    rpc: 'ia_buscar_operaciones', map: (i) => ({ p_q: i.q || null, p_estado: i.estado || null, p_limit: i.limit || 20 }),
  },
  {
    def: { name: 'buscar_stock', description: 'Busca stock/inventario consolidado por código de producto (SKU) o descripción. Devuelve disponible, reserva, stock total y bodega.', input_schema: { type: 'object', properties: { q: { type: 'string', description: 'SKU o descripción del producto. Opcional.' }, limit: { type: 'integer', description: 'Máx filas (1-50, def 20).' } } } },
    rpc: 'ia_buscar_stock', map: (i) => ({ p_q: i.q || null, p_limit: i.limit || 20 }),
  },
  {
    def: { name: 'buscar_tickets', description: 'Busca tickets de Post-Venta / servicio técnico por texto (número, cliente, técnico, equipo, serie) y/o estado. Devuelve estado, prioridad, técnico, equipo, región y fechas.', input_schema: { type: 'object', properties: { q: { type: 'string', description: 'Texto a buscar. Opcional.' }, estado: { type: 'string', description: 'Filtrar por estado (p.ej. "Abierto"). Opcional.' }, limit: { type: 'integer', description: 'Máx filas (1-50, def 20).' } } } },
    rpc: 'ia_tickets', map: (i) => ({ p_q: i.q || null, p_estado: i.estado || null, p_limit: i.limit || 20 }),
  },
];
const IA_SYSTEM = [
  'Eres el Asistente CCO, integrado en el sistema WMS/TMS de PTM (logística de equipos médicos en Chile).',
  'Ayudas al equipo a consultar y entender sus datos operativos: notas de venta (N.V.)/despachos, stock de bodega y tickets de Post-Venta.',
  'Reglas:',
  '- Para CUALQUIER dato concreto usa SIEMPRE las herramientas; nunca inventes cifras, estados, clientes ni fechas.',
  '- Si una herramienta devuelve un error de permisos, dilo con naturalidad ("no tienes acceso a ese módulo") y no reintentes.',
  '- Responde en español de Chile, claro y breve. Usa listas o tablas simples cuando ayuden. Da cifras exactas de las herramientas.',
  '- Solo puedes CONSULTAR (lectura). No puedes crear, editar ni eliminar nada; si te lo piden, explica que por ahora solo consultas.',
  '- Si la pregunta no es sobre los datos del sistema, puedes ayudar igual (redactar, explicar), sin usar herramientas.',
].join('\n');

const iaSafeParse = (t) => { try { return JSON.parse(t); } catch { return t; } };

app.post('/api/asistente', express.json({ limit: '1mb' }), async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: { message: 'IA no configurada: falta ANTHROPIC_API_KEY en el servidor.' } });
  const authz = req.headers['authorization'] || '';
  const token = authz.startsWith('Bearer ') ? authz.slice(7) : '';
  if (!token) return res.status(401).json({ error: { message: 'Falta sesión CCO.' } });
  if (!rateLimitOk(`asist:${token.slice(-24) || req.ip}`, 30, 5 * 60 * 1000)) {
    return res.status(429).json({ error: { message: 'Demasiadas consultas al asistente. Espera unos minutos.' } });
  }
  try {
    const u = await fetch(`${SUPA_URL}/auth/v1/user`, { headers: { apikey: SUPA_ANON, Authorization: `Bearer ${token}` } });
    if (!u.ok) return res.status(401).json({ error: { message: 'Sesión CCO inválida.' } });
  } catch (e) {
    return res.status(502).json({ error: { message: 'No se pudo validar la sesión.' } });
  }

  // Saneo del historial: solo user/assistant, contenido acotado, últimas 20 vueltas.
  const raw = Array.isArray(req.body?.messages) ? req.body.messages : null;
  if (!raw || raw.length === 0) return res.status(400).json({ error: { message: 'Falta messages.' } });
  let convo = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-20)
    .map((m) => ({ role: m.role, content: typeof m.content === 'string' ? m.content.slice(0, 8000) : m.content }));
  if (convo.length === 0) return res.status(400).json({ error: { message: 'Historial vacío.' } });

  const anthropicTools = IA_TOOLS.map((t) => t.def);
  const callAnthropic = (messages) => fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: IA_MODEL, max_tokens: 1500, system: IA_SYSTEM, tools: anthropicTools, messages }),
    signal: AbortSignal.timeout(60000),
  });

  try {
    for (let step = 0; step < 6; step++) {
      const r = await callAnthropic(convo);
      if (!r.ok) {
        const errTxt = await r.text();
        return res.status(r.status).type('application/json').send(errTxt);
      }
      const data = await r.json();
      if (data.stop_reason === 'tool_use') {
        convo.push({ role: 'assistant', content: data.content });
        const results = [];
        for (const block of data.content || []) {
          if (block.type !== 'tool_use') continue;
          const tool = IA_TOOLS.find((t) => t.def.name === block.name);
          let result;
          if (!tool) {
            result = { error: 'herramienta desconocida' };
          } else {
            try {
              const args = tool.map(block.input || {});
              const rr = await fetch(`${SUPA_URL}/rest/v1/rpc/${tool.rpc}`, {
                method: 'POST',
                headers: { apikey: SUPA_ANON, Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
                body: JSON.stringify(args),
                signal: AbortSignal.timeout(15000),
              });
              const txt = await rr.text();
              result = rr.ok ? iaSafeParse(txt) : { error: 'Sin acceso o error de datos', detalle: txt.slice(0, 200) };
            } catch (e) {
              result = { error: 'No se pudo consultar', detalle: String(e).slice(0, 200) };
            }
          }
          results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result).slice(0, 12000) });
        }
        convo.push({ role: 'user', content: results });
        continue;
      }
      const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
      return res.json({ text, stop_reason: data.stop_reason, usage: data.usage });
    }
    return res.json({ text: 'No pude completar la consulta (demasiados pasos). Reformula, por favor.', stop_reason: 'max_steps' });
  } catch (e) {
    const timedOut = e?.name === 'TimeoutError' || e?.name === 'AbortError';
    return res.status(timedOut ? 504 : 502).json({ error: { message: timedOut ? 'La IA tardó demasiado en responder.' : 'Error al contactar la IA: ' + String(e) } });
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

// Versión desplegada — el cliente la compara con su build para forzar re-login.
app.get('/api/version', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ version: APP_VERSION });
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
