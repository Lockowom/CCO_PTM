// Rendiciones publicas con autenticacion por enlace de 256 bits.
// verify_jwt=false es intencional: la funcion valida SHA-256(token) y, para
// consultas/cargas, un segundo secreto independiente de solo lectura.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.98.0';

const MAX_FILE_BYTES = 1_572_864;
const MAX_REPORT_FILES = 10;
const MAX_ITEM_FILES = 3;
const TOKEN_RE = /^[0-9a-f]{64}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

function clientIp(req: Request) {
  return (
    (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    ''
  );
}

function allowedOrigin(req: Request) {
  const origin = req.headers.get('origin') || '';
  const configured = (
    Deno.env.get('RENDICIONES_ALLOWED_ORIGINS') || 'https://cco-ptm-b05m.onrender.com'
  )
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  return origin && (configured.includes(origin) || local) ? origin : '';
}

function responseHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store, max-age=0',
    'Content-Security-Policy': "default-src 'none'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Origin'
  };
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeError(message: string) {
  const known = [
    'Token invalido',
    'El enlace no existe',
    'El enlace alcanzo',
    'Demasiados envios',
    'Centro de costo invalido',
    'Responsable invalido',
    'Tipo de fondo invalido',
    'Fecha de rendicion',
    'El detalle debe',
    'La rendicion debe',
    'La descripcion',
    'Fecha invalida',
    'Monto invalido',
    'Categoria/subcategoria',
    'Tipo de documento',
    'Numero de documento'
  ];
  return known.some((prefix) => message.startsWith(prefix))
    ? message
    : 'No se pudo procesar la rendición. Revisa los datos e intenta nuevamente.';
}

async function parseJson(req: Request) {
  if (!(req.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    throw new Error('CONTENT_TYPE');
  }
  return await req.json();
}

async function resolvePublicLink(db: ReturnType<typeof createClient>, rawToken: unknown) {
  const token = String(rawToken || '').toLowerCase();
  if (token && !TOKEN_RE.test(token)) return null;

  const query = db
    .from('rendicion_public_links')
    .select(
      'id,nombre,token_hash,activo,expires_at,max_submissions,submissions_count,es_public_default'
    );
  const { data: link } = token
    ? await query.eq('token_hash', await sha256(token)).maybeSingle()
    : await query.eq('es_public_default', true).maybeSingle();

  return link ? { link, linkHash: link.token_hash as string } : null;
}

serve(async (req) => {
  const origin = allowedOrigin(req);
  const headers = responseHeaders(origin);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' }
    });

  if (req.method === 'OPTIONS') {
    return origin
      ? new Response('ok', { headers })
      : new Response('Origen no autorizado', { status: 403 });
  }
  if (!origin) return json({ ok: false, error: 'Origen no autorizado.' }, 403);
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido.' }, 405);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.toLowerCase().startsWith('multipart/form-data')) {
      const form = await req.formData();
      if (String(form.get('action') || '') !== 'upload')
        return json({ ok: false, error: 'Acción inválida.' }, 400);

      const token = String(form.get('token') || '').toLowerCase();
      const viewToken = String(form.get('view_token') || '').toLowerCase();
      const reportId = String(form.get('report_id') || '');
      const itemId = String(form.get('item_id') || '');
      const file = form.get('file');
      if (
        (token && !TOKEN_RE.test(token)) ||
        !TOKEN_RE.test(viewToken) ||
        !UUID_RE.test(reportId) ||
        !UUID_RE.test(itemId)
      ) {
        return json({ ok: false, error: 'Credenciales de carga inválidas.' }, 403);
      }
      if (
        !(file instanceof File) ||
        !MIME.has(file.type) ||
        file.size < 1 ||
        file.size > MAX_FILE_BYTES
      ) {
        return json(
          { ok: false, error: 'La foto debe ser JPEG, PNG, WebP o HEIC y pesar máximo 1,5 MB.' },
          400
        );
      }

      const resolved = await resolvePublicLink(db, token);
      if (!resolved) return json({ ok: false, error: 'Enlace no disponible.' }, 403);
      const { link } = resolved;
      if (!link.activo || (link.expires_at && new Date(link.expires_at) <= new Date())) {
        return json({ ok: false, error: 'El enlace expiró o fue desactivado.' }, 403);
      }

      const viewHash = await sha256(viewToken);
      const { data: report } = await db
        .from('rendiciones')
        .select('id,public_link_id,view_token_hash,rendicion_items!inner(id)')
        .eq('id', reportId)
        .eq('view_token_hash', viewHash)
        .eq('public_link_id', link.id)
        .eq('rendicion_items.id', itemId)
        .maybeSingle();
      if (!report)
        return json({ ok: false, error: 'La rendición o el gasto no son válidos.' }, 403);
      const [{ count: reportFiles }, { count: itemFiles }] = await Promise.all([
        db
          .from('rendicion_fotos')
          .select('id', { count: 'exact', head: true })
          .eq('rendicion_id', reportId),
        db
          .from('rendicion_fotos')
          .select('id', { count: 'exact', head: true })
          .eq('item_id', itemId)
      ]);
      if ((reportFiles || 0) >= MAX_REPORT_FILES || (itemFiles || 0) >= MAX_ITEM_FILES) {
        return json({ ok: false, error: 'Se alcanzó el máximo de fotos permitido.' }, 400);
      }

      const ext = (
        {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/heic': 'heic',
          'image/heif': 'heif'
        } as Record<string, string>
      )[file.type];
      const path = `${reportId}/${itemId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await db.storage
        .from('rendicion-evidencias')
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
          cacheControl: '3600'
        });
      if (uploadError) throw uploadError;
      const { data: photo, error: photoError } = await db
        .from('rendicion_fotos')
        .insert({
          rendicion_id: reportId,
          item_id: itemId,
          storage_path: path,
          mime_type: file.type,
          bytes: file.size
        })
        .select('id')
        .single();
      if (photoError) {
        await db.storage.from('rendicion-evidencias').remove([path]);
        throw photoError;
      }
      await db.from('rendicion_public_log').insert({
        link_id: link.id,
        rendicion_id: reportId,
        ip: clientIp(req).slice(0, 120) || null,
        accion: 'upload'
      });
      return json({ ok: true, photo_id: photo.id });
    }

    const body = await parseJson(req);
    const action = String(body?.action || '');
    const resolved = await resolvePublicLink(db, body?.token);
    const link = resolved?.link;
    const linkHash = resolved?.linkHash;
    if (
      !link ||
      !linkHash ||
      (action !== 'view' &&
        (!link.activo ||
          (link.expires_at && new Date(link.expires_at) <= new Date()) ||
          (link.max_submissions != null && link.submissions_count >= link.max_submissions)))
    ) {
      return json({ ok: false, error: 'El enlace no existe, expiró o fue desactivado.' }, 403);
    }

    if (action === 'bootstrap') {
      const [centros, colaboradores, categorias, subcategorias, relaciones] = await Promise.all([
        db
          .from('rendicion_centros_costo')
          .select('id,codigo,nombre')
          .eq('activo', true)
          .order('codigo'),
        db.from('rendicion_colaboradores').select('id,nombre').eq('activo', true).order('nombre'),
        db.from('rendicion_categorias').select('codigo,nombre').eq('activo', true).order('nombre'),
        db
          .from('rendicion_subcategorias')
          .select('codigo,nombre')
          .eq('activo', true)
          .order('nombre'),
        db.from('rendicion_categoria_subcategoria').select('categoria_codigo,subcategoria_codigo')
      ]);
      const firstError = [centros, colaboradores, categorias, subcategorias, relaciones].find(
        (x) => x.error
      )?.error;
      if (firstError) throw firstError;
      return json({
        ok: true,
        link: { nombre: link.nombre, expires_at: link.expires_at },
        catalogs: {
          centros: centros.data,
          colaboradores: colaboradores.data,
          categorias: categorias.data,
          subcategorias: subcategorias.data,
          relaciones: relaciones.data
        }
      });
    }

    if (action === 'submit') {
      if (String(body?.website || '').trim()) return json({ ok: true, ignored: true });
      if (Number(body?.t_ms || 0) < 2500)
        return json({ ok: false, error: 'Formulario enviado demasiado rápido.' }, 400);
      const viewToken = randomToken();
      const { data, error } = await db.rpc('crear_rendicion_publica', {
        p_link_hash: linkHash,
        p_view_hash: await sha256(viewToken),
        p_payload: body?.payload || {},
        p_ip: clientIp(req).slice(0, 120) || null
      });
      if (error) return json({ ok: false, error: safeError(error.message || '') }, 400);
      return json({ ok: true, report: data, view_token: viewToken });
    }

    if (action === 'view') {
      const reportId = String(body?.report_id || '');
      const viewToken = String(body?.view_token || '').toLowerCase();
      if (!UUID_RE.test(reportId) || !TOKEN_RE.test(viewToken))
        return json({ ok: false, error: 'Consulta inválida.' }, 403);
      const viewHash = await sha256(viewToken);
      const { data: report } = await db
        .from('rendiciones')
        .select('*')
        .eq('id', reportId)
        .eq('view_token_hash', viewHash)
        .eq('public_link_id', link.id)
        .maybeSingle();
      if (!report) return json({ ok: false, error: 'Rendición no encontrada.' }, 404);
      const [{ data: items, error: itemsError }, { data: photos, error: photosError }] =
        await Promise.all([
          db.from('rendicion_items').select('*').eq('rendicion_id', reportId).order('orden'),
          db
            .from('rendicion_fotos')
            .select('id,item_id,storage_path,mime_type,bytes,created_at')
            .eq('rendicion_id', reportId)
            .order('created_at')
        ]);
      if (itemsError || photosError) throw itemsError || photosError;
      const signed = await Promise.all(
        (photos || []).map(async (photo) => {
          const { data } = await db.storage
            .from('rendicion-evidencias')
            .createSignedUrl(photo.storage_path, 600);
          return { ...photo, storage_path: undefined, url: data?.signedUrl || '' };
        })
      );
      delete report.view_token_hash;
      delete report.created_ip;
      await db.from('rendicion_public_log').insert({
        link_id: link.id,
        rendicion_id: reportId,
        ip: clientIp(req).slice(0, 120) || null,
        accion: 'view'
      });
      return json({
        ok: true,
        data: {
          rendicion: {
            ...report,
            folio_texto: `REN-${String(report.fecha_rendicion).slice(0, 4)}-${String(report.folio).padStart(6, '0')}`
          },
          items,
          fotos: signed
        }
      });
    }

    return json({ ok: false, error: 'Acción inválida.' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === 'CONTENT_TYPE')
      return json({ ok: false, error: 'Formato de solicitud inválido.' }, 415);
    console.error('rendiciones-publicas', message);
    return json({ ok: false, error: 'No se pudo procesar la solicitud.' }, 500);
  }
});
