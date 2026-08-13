import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const APP_ID = 'com.cco.wms';
const TOKEN_HASH = '02163baef7e64c49a18913943659b09e4badbb6f071c2e45ef9252f85250a7d8';
const VERSION_RE = /^[0-9]+\.[0-9]+\.[0-9]+([+.-][A-Za-z0-9.-]+)?$/;
const CHECKSUM_RE = /^[0-9a-f]{64}$/;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
const hash = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
  if (Number(req.headers.get('content-length') || 0) > 16384)
    return json({ ok: false, error: 'payload_too_large' }, 413);
  try {
    const body = await req.json();
    const token = String(body?.token || '');
    if (token.length < 48 || (await hash(token)) !== TOKEN_HASH) {
      return json({ ok: false, error: 'unauthorized' }, 401);
    }
    const version = String(body?.version || '').trim();
    const downloadUrl = String(body?.download_url || '').trim();
    const checksum = String(body?.checksum_sha256 || '')
      .trim()
      .toLowerCase();
    const size = Number(body?.size_bytes);
    const expectedUrl = `https://github.com/Lockowom/CCO_PTM/releases/download/ota-v${version}/cco-ota-${version}.zip`;
    if (
      !VERSION_RE.test(version) ||
      downloadUrl !== expectedUrl ||
      !CHECKSUM_RE.test(checksum) ||
      !Number.isSafeInteger(size) ||
      size <= 0 ||
      size > 262144000
    ) {
      return json({ ok: false, error: 'invalid_bundle' }, 400);
    }

    // Confirma que GitHub sirve el asset antes de anunciarlo a los PDA.
    const asset = await fetch(downloadUrl, { method: 'HEAD', redirect: 'follow' });
    if (!asset.ok) return json({ ok: false, error: 'release_asset_unavailable' }, 409);

    const service = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data: existing, error: findError } = await service
      .from('mobile_ota_bundles')
      .select('id,download_url,checksum_sha256')
      .eq('app_id', APP_ID)
      .eq('version', version)
      .maybeSingle();
    if (findError) throw findError;
    if (
      existing &&
      (existing.download_url !== downloadUrl || existing.checksum_sha256 !== checksum)
    ) {
      return json({ ok: false, error: 'immutable_version_conflict' }, 409);
    }
    let bundleId = existing?.id;
    if (!bundleId) {
      const { data: inserted, error } = await service
        .from('mobile_ota_bundles')
        .insert({
          app_id: APP_ID,
          version,
          download_url: downloadUrl,
          checksum_sha256: checksum,
          size_bytes: size,
          git_sha: String(body?.git_sha || '').slice(0, 64) || null,
          notes: String(body?.notes || '').slice(0, 1000) || null
        })
        .select('id')
        .single();
      if (error) throw error;
      bundleId = inserted.id;
    } else {
      const { error } = await service
        .from('mobile_ota_bundles')
        .update({ enabled: true, size_bytes: size })
        .eq('id', bundleId);
      if (error) throw error;
    }
    const { error: channelError } = await service.from('mobile_ota_channels').upsert(
      {
        app_id: APP_ID,
        channel: 'beta',
        bundle_id: bundleId,
        updated_at: new Date().toISOString(),
        updated_by: null
      },
      { onConflict: 'app_id,channel' }
    );
    if (channelError) throw channelError;
    return json({ ok: true, version, channel: 'beta' });
  } catch (error) {
    console.error('ota-publish', error);
    return json({ ok: false, error: 'publish_failed' }, 500);
  }
});
