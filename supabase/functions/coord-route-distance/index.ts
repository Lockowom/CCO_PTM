import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OWNER_UID = 'c12e2286-9619-445e-afe4-e9aefc51996c';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function validPlace(value: unknown) {
  const text = String(value || '').trim();
  return (
    text.length >= 2 &&
    text.length <= 160 &&
    /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(text) &&
    !/\b\d{2,}\b/.test(text)
  );
}

async function geocode(place: string) {
  const query = encodeURIComponent(`${place}, Chile`);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=cl&q=${query}`;
  const result = await fetch(url, {
    headers: {
      'User-Agent': 'CCO-PTM-RouteCoordination/1.0 (private internal logistics tool)',
      Accept: 'application/json'
    }
  });
  if (!result.ok) throw new Error(`Geocodificación no disponible (${result.status})`);
  const rows = await result.json();
  if (!Array.isArray(rows) || !rows[0]) throw new Error(`No se encontró “${place}” en Chile`);
  return {
    lat: Number(rows[0].lat),
    lng: Number(rows[0].lon),
    nombre: String(rows[0].display_name || place)
  };
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return response({ error: 'Método no permitido' }, 405);

  try {
    const authorization = request.headers.get('Authorization') || '';
    const token = authorization.replace(/^Bearer\s+/i, '');
    if (!token) return response({ error: 'Sesión requerida' }, 401);

    const authClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) return response({ error: 'Sesión inválida' }, 401);
    if (data.user.id !== OWNER_UID) return response({ error: 'Acceso privado denegado' }, 403);

    const body = await request.json().catch(() => ({}));
    const origen = String(body.origen || 'Santiago').trim();
    const destino = String(body.destino || '').trim();
    if (!validPlace(origen) || !validPlace(destino)) {
      return response(
        { error: 'Usa solo comuna, ciudad o pueblo; no ingreses direcciones privadas' },
        400
      );
    }

    const origenNormalizado = normalize(origen);
    const destinoNormalizado = normalize(destino);
    const { data: cached } = await admin
      .from('coord_rutas_distancias_cache')
      .select('*')
      .eq('origen_normalizado', origenNormalizado)
      .eq('destino_normalizado', destinoNormalizado)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (cached) return response({ ...cached, cache: true });

    const originPoint = await geocode(origen);
    // La instancia pública de Nominatim exige un máximo absoluto de 1 solicitud por segundo.
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const destinationPoint = await geocode(destino);
    const coordinates = `${originPoint.lng},${originPoint.lat};${destinationPoint.lng},${destinationPoint.lat}`;
    const routeUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordinates}?overview=false&steps=false`;
    const routeResponse = await fetch(routeUrl, {
      headers: { 'User-Agent': 'CCO-PTM-RouteCoordination/1.0', Accept: 'application/json' }
    });
    if (!routeResponse.ok) throw new Error(`Ruta vial no disponible (${routeResponse.status})`);
    const routeData = await routeResponse.json();
    const route = routeData?.routes?.[0];
    if (!route) throw new Error('No se encontró una ruta terrestre para el destino');

    const row = {
      origen,
      destino,
      origen_normalizado: origenNormalizado,
      destino_normalizado: destinoNormalizado,
      origen_lat: originPoint.lat,
      origen_lng: originPoint.lng,
      destino_lat: destinationPoint.lat,
      destino_lng: destinationPoint.lng,
      distancia_km: Math.round((Number(route.distance) / 1000) * 100) / 100,
      duracion_minutos: Math.round(Number(route.duration) / 60),
      proveedor: 'routing.openstreetmap.de'
    };
    const { data: stored, error: storeError } = await admin
      .from('coord_rutas_distancias_cache')
      .upsert(row, { onConflict: 'origen_normalizado,destino_normalizado' })
      .select('*')
      .single();
    if (storeError) throw storeError;
    return response({ ...stored, cache: false });
  } catch (error) {
    return response(
      { error: error instanceof Error ? error.message : 'Error calculando ruta' },
      500
    );
  }
});
