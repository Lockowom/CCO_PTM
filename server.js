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
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body || {}),
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (e) {
    res.status(502).json({ error: { message: 'Error al contactar la IA: ' + String(e) } });
  }
});

app.use(express.static(join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true,
}));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
