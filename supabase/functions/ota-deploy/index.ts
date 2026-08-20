import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const APP_ID = 'com.cco.wms';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
const VERSION_RE = /^[0-9]+\.[0-9]+\.[0-9]+([+.-][A-Za-z0-9.-]+)?$/;
const DEVICE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const clean = (value: unknown, max = 2000) =>
  String(value ?? '')
    .trim()
    .slice(0, max);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method Not Allowed' }, 405);
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
    );
    const {
      data: { user },
      error: userError
    } = await userClient.auth.getUser(token);
    if (userError || !user) return json({ ok: false, error: 'No autenticado' }, 401);
    const { data: allowed, error: permissionError } = await userClient.rpc('puede_desplegar_ota');
    if (permissionError) throw permissionError;
    if (!allowed) return json({ ok: false, error: 'No tienes permiso para administrar OTA.' }, 403);

    const service = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || 'list');

    if (action === 'list') {
      const [
        { data: bundles, error: bundleError },
        { data: channelRows, error: channelError },
        { data: devices, error: deviceError },
        { data: reviews, error: reviewError }
      ] = await Promise.all([
        service
          .from('mobile_ota_bundles')
          .select('id,version,download_url,checksum_sha256,size_bytes,git_sha,notes,created_at')
          .eq('app_id', APP_ID)
          .eq('enabled', true)
          .order('created_at', { ascending: false }),
        service
          .from('mobile_ota_channels')
          .select('channel,bundle_id,updated_at')
          .eq('app_id', APP_ID),
        service
          .from('mobile_ota_devices')
          .select(
            'device_id,device_alias,channel,current_version,native_version,platform,last_action,last_seen_at,last_error,channel_source,channel_updated_at'
          )
          .eq('app_id', APP_ID)
          .order('last_seen_at', { ascending: false }),
        service
          .from('mobile_ota_release_reviews')
          .select('bundle_id,status,notes,metrics_snapshot,reviewed_at,updated_at')
          .eq('app_id', APP_ID)
      ]);
      if (bundleError || channelError || deviceError || reviewError)
        throw bundleError || channelError || deviceError || reviewError;
      const byId = new Map((bundles || []).map((bundle) => [bundle.id, bundle]));
      const channels = (channelRows || []).map((row) => ({
        name: row.channel,
        version: byId.get(row.bundle_id)?.version || null,
        updated_at: row.updated_at
      }));
      const deviceMap = new Map<
        string,
        { version: string; dispositivos: number; ultima: string | null; errores: number }
      >();
      for (const device of devices || []) {
        const version = device.current_version || 'desconocida';
        const current = deviceMap.get(version) || {
          version,
          dispositivos: 0,
          ultima: null,
          errores: 0
        };
        current.dispositivos += 1;
        if (!current.ultima || (device.last_seen_at && device.last_seen_at > current.ultima))
          current.ultima = device.last_seen_at;
        if (device.last_error) current.errores += 1;
        deviceMap.set(version, current);
      }
      const betaChannel = (channelRows || []).find((row) => row.channel === 'beta');
      const betaBundle = betaChannel ? byId.get(betaChannel.bundle_id) : null;
      const betaReview = (reviews || []).find(
        (review) => review.bundle_id === betaChannel?.bundle_id
      );
      const freshAfter = Date.now() - 24 * 60 * 60 * 1000;
      const betaDevices = (devices || []).filter((device) => device.channel === 'beta');
      const applied = betaDevices.filter(
        (device) => device.current_version === betaBundle?.version
      );
      const healthy = applied.filter(
        (device) => !device.last_error && new Date(device.last_seen_at || 0).getTime() >= freshAfter
      );
      return json({
        ok: true,
        app_id: APP_ID,
        provider: 'github-supabase',
        bundles,
        channels,
        devices: [...deviceMap.values()],
        device_details: devices || [],
        beta_gate: {
          version: betaBundle?.version || null,
          assigned: betaDevices.length,
          applied: applied.length,
          healthy: healthy.length,
          errors: betaDevices.filter((device) => Boolean(device.last_error)).length,
          review: betaReview || null,
          ready: healthy.length > 0 && betaReview?.status === 'APPROVED'
        }
      });
    }

    if (action === 'set-device-channel') {
      const deviceId = clean(body?.device_id, 160).toLowerCase();
      const channel = clean(body?.channel, 20).toLowerCase();
      const alias = clean(body?.device_alias, 80);
      if (!DEVICE_RE.test(deviceId) || !['production', 'beta'].includes(channel))
        return json({ ok: false, error: 'Dispositivo o canal inválido.' }, 400);
      const { data: updated, error } = await service
        .from('mobile_ota_devices')
        .update({
          channel,
          device_alias: alias || null,
          channel_source: 'admin_web',
          channel_updated_at: new Date().toISOString(),
          channel_updated_by: user.id
        })
        .eq('app_id', APP_ID)
        .eq('device_id', deviceId)
        .select('device_id,device_alias,channel,current_version,last_seen_at')
        .maybeSingle();
      if (error) throw error;
      if (!updated) return json({ ok: false, error: 'Dispositivo no registrado.' }, 404);
      await userClient.rpc('registrar_despliegue_ota', {
        p_version: updated.current_version || 'sin-version',
        p_canal: `device:${channel}`,
        p_ok: true,
        p_detalle: `Canal administrado para ${alias || deviceId.slice(0, 8)}`
      });
      return json({ ok: true, device: updated });
    }

    const version = String(body?.version || '').trim();
    if (!VERSION_RE.test(version)) {
      return json({ ok: false, error: 'Versión inválida.' }, 400);
    }
    const { data: bundle, error: findError } = await service
      .from('mobile_ota_bundles')
      .select('id,version')
      .eq('app_id', APP_ID)
      .eq('version', version)
      .eq('enabled', true)
      .maybeSingle();
    if (findError) throw findError;
    if (!bundle) return json({ ok: false, error: 'El bundle no existe o está archivado.' }, 404);

    if (action === 'review-beta') {
      const decision = clean(body?.decision, 20).toUpperCase();
      const notes = clean(body?.notes, 2000);
      if (!['APPROVED', 'REJECTED'].includes(decision) || notes.length < 5)
        return json({ ok: false, error: 'Decisión y nota de prueba son obligatorias.' }, 400);
      const { data: betaChannel, error: betaError } = await service
        .from('mobile_ota_channels')
        .select('bundle_id')
        .eq('app_id', APP_ID)
        .eq('channel', 'beta')
        .maybeSingle();
      if (betaError) throw betaError;
      if (betaChannel?.bundle_id !== bundle.id)
        return json({ ok: false, error: 'Solo puedes revisar la versión beta vigente.' }, 409);
      const freshAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [{ count: assigned }, { count: applied }, { count: healthy }, { count: errors }] =
        await Promise.all([
          service
            .from('mobile_ota_devices')
            .select('*', { count: 'exact', head: true })
            .eq('app_id', APP_ID)
            .eq('channel', 'beta'),
          service
            .from('mobile_ota_devices')
            .select('*', { count: 'exact', head: true })
            .eq('app_id', APP_ID)
            .eq('channel', 'beta')
            .eq('current_version', version),
          service
            .from('mobile_ota_devices')
            .select('*', { count: 'exact', head: true })
            .eq('app_id', APP_ID)
            .eq('channel', 'beta')
            .eq('current_version', version)
            .is('last_error', null)
            .gte('last_seen_at', freshAfter),
          service
            .from('mobile_ota_devices')
            .select('*', { count: 'exact', head: true })
            .eq('app_id', APP_ID)
            .eq('channel', 'beta')
            .not('last_error', 'is', null)
        ]);
      const snapshot = {
        assigned: assigned || 0,
        applied: applied || 0,
        healthy: healthy || 0,
        errors: errors || 0
      };
      if (decision === 'APPROVED' && snapshot.healthy < 1)
        return json(
          {
            ok: false,
            error: 'La beta aún no tiene un dispositivo sano y actualizado en las últimas 24 horas.'
          },
          409
        );
      const { error } = await service.from('mobile_ota_release_reviews').upsert(
        {
          app_id: APP_ID,
          bundle_id: bundle.id,
          status: decision,
          notes,
          metrics_snapshot: snapshot,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'app_id,bundle_id' }
      );
      if (error) throw error;
      await userClient.rpc('registrar_despliegue_ota', {
        p_version: version,
        p_canal: decision === 'APPROVED' ? 'beta_aprobada' : 'beta_rechazada',
        p_ok: decision === 'APPROVED',
        p_detalle: notes
      });
      return json({ ok: true, version, decision, metrics: snapshot });
    }

    if (action === 'promote') {
      const channel = String(body?.channel || 'production').trim();
      if (!['production', 'beta'].includes(channel))
        return json({ ok: false, error: 'Canal inválido.' }, 400);
      if (channel === 'production') {
        const { data: activeChannels, error: activeError } = await service
          .from('mobile_ota_channels')
          .select('channel,bundle_id')
          .eq('app_id', APP_ID)
          .in('channel', ['beta', 'production']);
        if (activeError) throw activeError;
        const betaId = activeChannels?.find((row) => row.channel === 'beta')?.bundle_id;
        const productionId = activeChannels?.find((row) => row.channel === 'production')?.bundle_id;
        const rollback = body?.rollback === true && bundle.id !== betaId;
        const reason = clean(body?.reason, 500);
        if (bundle.id !== betaId && (!rollback || reason.length < 10))
          return json(
            {
              ok: false,
              error:
                'La promoción normal solo admite la beta vigente. Para rollback debes justificarlo.'
            },
            409
          );
        if (!rollback) {
          const freshAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const [{ data: review, error: reviewError }, { count: healthy, error: healthError }] =
            await Promise.all([
              service
                .from('mobile_ota_release_reviews')
                .select('status')
                .eq('app_id', APP_ID)
                .eq('bundle_id', bundle.id)
                .maybeSingle(),
              service
                .from('mobile_ota_devices')
                .select('*', { count: 'exact', head: true })
                .eq('app_id', APP_ID)
                .eq('channel', 'beta')
                .eq('current_version', version)
                .is('last_error', null)
                .gte('last_seen_at', freshAfter)
            ]);
          if (reviewError || healthError) throw reviewError || healthError;
          if (review?.status !== 'APPROVED' || !healthy)
            return json(
              {
                ok: false,
                error:
                  'Beta no aprobada o sin dispositivo sano actualizado en las últimas 24 horas.'
              },
              409
            );
        }
        if (productionId === bundle.id)
          return json({ ok: false, error: 'Esa versión ya está en producción.' }, 409);
      }
      const { error } = await service.from('mobile_ota_channels').upsert(
        {
          app_id: APP_ID,
          channel,
          bundle_id: bundle.id,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        },
        { onConflict: 'app_id,channel' }
      );
      if (error) throw error;
      if (channel === 'production') {
        await service
          .from('mobile_ota_release_reviews')
          .update({
            status: body?.rollback === true ? 'ROLLED_BACK' : 'PRODUCTION',
            updated_at: new Date().toISOString()
          })
          .eq('app_id', APP_ID)
          .eq('bundle_id', bundle.id);
      }
      await userClient.rpc('registrar_despliegue_ota', {
        p_version: version,
        p_canal: channel,
        p_ok: true,
        p_detalle: clean(body?.reason, 500) || 'Beta aprobada · GitHub Releases + Supabase OTA'
      });
      return json({ ok: true, version, channel });
    }

    if (action === 'delete') {
      const { data: active } = await service
        .from('mobile_ota_channels')
        .select('channel')
        .eq('app_id', APP_ID)
        .eq('bundle_id', bundle.id);
      if (active?.length)
        return json(
          { ok: false, error: `Bundle activo en: ${active.map((x) => x.channel).join(', ')}` },
          409
        );
      const { error } = await service
        .from('mobile_ota_bundles')
        .update({ enabled: false })
        .eq('id', bundle.id);
      if (error) throw error;
      await userClient.rpc('registrar_despliegue_ota', {
        p_version: version,
        p_canal: 'eliminado',
        p_ok: true,
        p_detalle: 'Metadato OTA archivado; release conservado para auditoría'
      });
      return json({ ok: true, version, deleted: true });
    }
    return json({ ok: false, error: 'Acción no reconocida.' }, 400);
  } catch (error) {
    console.error('ota-deploy', error);
    return json({ ok: false, error: String((error as Error)?.message || error) }, 500);
  }
});
