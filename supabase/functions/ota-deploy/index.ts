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
        { data: devices, error: deviceError }
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
          .select('current_version,last_seen_at,last_error')
          .eq('app_id', APP_ID)
      ]);
      if (bundleError || channelError || deviceError)
        throw bundleError || channelError || deviceError;
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
      return json({
        ok: true,
        app_id: APP_ID,
        provider: 'github-supabase',
        bundles,
        channels,
        devices: [...deviceMap.values()]
      });
    }

    const version = String(body?.version || '').trim();
    if (!/^[0-9]+\.[0-9]+\.[0-9]+([+.-][A-Za-z0-9.-]+)?$/.test(version)) {
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

    if (action === 'promote') {
      const channel = String(body?.channel || 'production').trim();
      if (!['production', 'beta'].includes(channel))
        return json({ ok: false, error: 'Canal inválido.' }, 400);
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
      await userClient.rpc('registrar_despliegue_ota', {
        p_version: version,
        p_canal: channel,
        p_ok: true,
        p_detalle: 'GitHub Releases + Supabase OTA'
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
