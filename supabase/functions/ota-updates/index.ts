import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const APP_ID = 'com.cco.wms';
const CHANNELS = new Set(['production', 'beta']);
// El plugin genera un UUID aleatorio persistido por Android Keystore. Aceptar
// solo esa forma evita que un endpoint público se use para llenar la tabla con
// identificadores arbitrarios.
const DEVICE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const VERSION_RE = /^[A-Za-z0-9.+_-]{1,80}$/;
const TRACKED_ACTIONS = new Set([
  'download_complete',
  'download_fail',
  'update_fail',
  'app_launch_ready',
  'app_launch_timeout',
  'set',
  'set_fail',
  'checksum_fail'
]);
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
  'Cache-Control': 'no-store'
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });

const clean = (value: unknown, max = 160) =>
  String(value ?? '')
    .trim()
    .slice(0, max);
const versionParts = (value: unknown) =>
  clean(value, 80)
    .replace(/^v/i, '')
    .split(/[.+_-]/)
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));
const compareVersions = (left: unknown, right: unknown) => {
  const a = versionParts(left);
  const b = versionParts(right);
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const delta = (a[index] || 0) - (b[index] || 0);
    if (delta !== 0) return delta > 0 ? 1 : -1;
  }
  return 0;
};
const validDevice = (body: Record<string, unknown>) => {
  const appId = clean(body.app_id, 100);
  const deviceId = clean(body.device_id, 160);
  return appId === APP_ID && DEVICE_RE.test(deviceId) ? { appId, deviceId } : null;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (!['POST', 'PUT'].includes(req.method)) return json({ error: 'method_not_allowed' }, 405);
  const length = Number(req.headers.get('content-length') || 0);
  if (length > 65536) return json({ error: 'payload_too_large' }, 413);

  const service = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  try {
    const payload = await req.json();

    // El plugin envía estadísticas en lotes. Solo persistimos eventos de salud
    // relevantes y como máximo una vez por acción/versión/dispositivo/día.
    if (Array.isArray(payload)) {
      for (const raw of payload.slice(0, 20)) {
        if (!raw || typeof raw !== 'object') continue;
        const body = raw as Record<string, unknown>;
        const identity = validDevice(body);
        if (!identity) continue;
        const action = clean(body.action, 80);
        const channel = CHANNELS.has(clean(body.defaultChannel, 20))
          ? clean(body.defaultChannel, 20)
          : 'production';
        const version = clean(body.version_name, 80);
        await service.from('mobile_ota_devices').upsert(
          {
            app_id: APP_ID,
            device_id: identity.deviceId,
            channel,
            current_version: VERSION_RE.test(version) ? version : null,
            native_version: clean(body.version_build, 80) || null,
            platform: clean(body.platform, 20) || null,
            plugin_version: clean(body.plugin_version, 40) || null,
            install_source: clean(body.install_source, 80) || null,
            last_action: action || null,
            last_error: action.includes('fail') ? action : null,
            last_seen_at: new Date().toISOString()
          },
          { onConflict: 'app_id,device_id' }
        );
        if (TRACKED_ACTIONS.has(action)) {
          const metadata =
            body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
              ? body.metadata
              : {};
          await service.from('mobile_ota_events').upsert(
            {
              app_id: APP_ID,
              device_id: identity.deviceId,
              action,
              version: VERSION_RE.test(version) ? version : null,
              old_version: clean(body.old_version_name, 80) || null,
              metadata
            },
            { onConflict: 'app_id,device_id,action,version,event_day', ignoreDuplicates: true }
          );
        }
      }
      return json({ ok: true });
    }

    if (!payload || typeof payload !== 'object') return json({ error: 'invalid_payload' }, 400);
    const body = payload as Record<string, unknown>;
    const identity = validDevice(body);
    if (!identity) return json({ error: 'invalid_client' }, 400);
    const requested = clean(body.defaultChannel, 20);
    const channel = CHANNELS.has(requested) ? requested : 'production';

    // PUT = consulta de canal realizada por getChannel().
    if (req.method === 'PUT') return json({ channel, status: 'ok' });

    // POST con channel = setChannel(). El servidor solo admite los dos canales
    // explícitos; la elección también queda persistida por el plugin en el equipo.
    if (Object.hasOwn(body, 'channel')) {
      const next = clean(body.channel, 20);
      if (!CHANNELS.has(next)) return json({ error: 'channel_not_found' }, 400);
      await service.from('mobile_ota_devices').upsert(
        {
          app_id: APP_ID,
          device_id: identity.deviceId,
          channel: next,
          current_version: clean(body.version_name, 80) || null,
          last_action: 'channel_set',
          last_seen_at: new Date().toISOString()
        },
        { onConflict: 'app_id,device_id' }
      );
      return json({ status: 'ok', channel: next });
    }

    const currentVersion = clean(body.version_name, 80);
    const nativeVersion = clean(body.version_build, 80);
    const effectiveVersion =
      compareVersions(nativeVersion, currentVersion) > 0 ? nativeVersion : currentVersion;
    await service.from('mobile_ota_devices').upsert(
      {
        app_id: APP_ID,
        device_id: identity.deviceId,
        channel,
        current_version: VERSION_RE.test(currentVersion) ? currentVersion : null,
        native_version: nativeVersion || null,
        platform: clean(body.platform, 20) || null,
        plugin_version: clean(body.plugin_version, 40) || null,
        install_source: clean(body.install_source, 80) || null,
        last_action: 'update_check',
        last_seen_at: new Date().toISOString()
      },
      { onConflict: 'app_id,device_id' }
    );

    const { data: channelRow, error: channelError } = await service
      .from('mobile_ota_channels')
      .select('bundle_id')
      .eq('app_id', APP_ID)
      .eq('channel', channel)
      .maybeSingle();
    if (channelError) throw channelError;
    if (!channelRow?.bundle_id)
      return json({ version: currentVersion, message: 'No new version available' });

    const { data: bundle, error: bundleError } = await service
      .from('mobile_ota_bundles')
      .select('version,download_url,checksum_sha256,notes')
      .eq('id', channelRow.bundle_id)
      .eq('enabled', true)
      .maybeSingle();
    if (bundleError) throw bundleError;
    // Si quedó activo un OTA anterior al APK, se permite entregar exactamente
    // la versión nativa para reparar ese WebView persistido. Fuera de ese caso,
    // nunca se entrega un bundle igual o inferior a la instalación efectiva.
    const repairingStaleBundle =
      compareVersions(currentVersion, nativeVersion) < 0 &&
      compareVersions(bundle?.version, nativeVersion) === 0;
    if (
      !bundle ||
      (!repairingStaleBundle && compareVersions(bundle.version, effectiveVersion) <= 0)
    ) {
      return json({ version: effectiveVersion, message: 'No new version available' });
    }
    return json({
      version: bundle.version,
      url: bundle.download_url,
      checksum: bundle.checksum_sha256,
      comment: bundle.notes || `CCO ${bundle.version}`,
      link: `https://github.com/Lockowom/CCO_PTM/releases/tag/ota-v${bundle.version}`
    });
  } catch (error) {
    console.error('ota-updates', error);
    return json(
      { error: 'ota_service_error', message: 'No fue posible consultar la actualización.' },
      500
    );
  }
});
