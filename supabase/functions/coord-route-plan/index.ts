import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Point = { id: string; lat: number; lon: number };
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const allowedOrigin = Deno.env.get('APP_ORIGIN') || '*';
const cors = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' }
  });
const validPoint = (point: unknown): point is Point => {
  const value = point as Point;
  return (
    Boolean(value?.id) &&
    Number.isFinite(value?.lat) &&
    Number.isFinite(value?.lon) &&
    value.lat >= -90 &&
    value.lat <= 90 &&
    value.lon >= -180 &&
    value.lon <= 180
  );
};

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  try {
    const authorization = request.headers.get('Authorization') || '';
    const token = authorization.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Sesión requerida' }, 401);
    const client = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    const { data: userData, error: userError } = await client.auth.getUser(token);
    if (userError || !userData.user) return json({ error: 'Sesión inválida' }, 401);
    const { data: allowed, error: gateError } = await client.rpc('coord_rutas_es_propietario');
    if (gateError || allowed !== true) return json({ error: 'Acceso privado denegado' }, 403);

    const body = await request.json().catch(() => ({}));
    const origin = body.origin as Point;
    const stops = Array.isArray(body.stops) ? (body.stops as Point[]) : [];
    const returnToOrigin = body.return === true;
    const optimize = body.optimize !== false;
    if (!validPoint(origin) || stops.length < 1 || stops.length > 50 || !stops.every(validPoint)) {
      return json({ error: 'Origen/paradas inválidos (máximo 50)' }, 400);
    }
    const points = [origin, ...stops, ...(returnToOrigin ? [origin] : [])];
    const coordinates = points.map((point) => `${point.lon},${point.lat}`).join(';');
    const providerBase = (
      Deno.env.get('ROUTING_PROVIDER_URL') || 'https://routing.openstreetmap.de/routed-car'
    ).replace(/\/(route|trip)\/v1\/driving\/?$/i, '');
    const providerKey = Deno.env.get('ROUTING_PROVIDER_KEY');
    const endpoint = optimize ? 'trip' : 'route';
    const tripParams = optimize
      ? `&roundtrip=${returnToOrigin ? 'true' : 'false'}&source=first&destination=${returnToOrigin ? 'any' : 'last'}`
      : '';
    const url =
      `${providerBase}/${endpoint}/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false${tripParams}` +
      (providerKey ? `&key=${encodeURIComponent(providerKey)}` : '');
    const providerResponse = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'CCO-PTM-RoutePlanner/2.0' }
    });
    if (!providerResponse.ok)
      throw new Error(`Proveedor de rutas no disponible (${providerResponse.status})`);
    const payload = await providerResponse.json();
    const route = optimize ? payload?.trips?.[0] : payload?.routes?.[0];
    if (!route) throw new Error('Proveedor sin ruta utilizable');
    return json({
      provider: new URL(providerBase).hostname,
      precision: 'ROUTED',
      km: Math.round(Number(route.distance) / 10) / 100,
      minutes: Math.round(Number(route.duration) / 60),
      order: stops
        .map((stop, index) => ({
          id: stop.id,
          order: Number(payload?.waypoints?.[index + 1]?.waypoint_index ?? index + 1)
        }))
        .sort((a, b) => a.order - b.order)
        .map((item, index) => ({ ...item, order: index + 1 })),
      legs: Array.isArray(route.legs)
        ? route.legs.map((leg: { distance: number; duration: number }, index: number) => ({
            from: points[index].id,
            to: points[index + 1].id,
            km: Math.round(Number(leg.distance) / 10) / 100,
            minutes: Math.round(Number(leg.duration) / 60)
          }))
        : [],
      geometry: route.geometry || null,
      warnings: []
    });
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : 'No fue posible calcular la ruta',
        precision: 'UNKNOWN',
        warnings: ['ROUTE_PROVIDER_UNAVAILABLE']
      },
      503
    );
  }
});
