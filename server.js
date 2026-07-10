import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
    // El asistente de IA de Traspasos NO llama a Anthropic desde el navegador:
    // pasa por el proxy same-origin /api/traspasos-ai (la clave vive en el
    // servidor). Por eso connect-src no incluye api.anthropic.com.
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://nominatim.openstreetmap.org https://router.project-osrm.org; font-src 'self';"
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
