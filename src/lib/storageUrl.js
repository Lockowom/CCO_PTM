// URLs firmadas para los buckets PRIVADOS de Storage (migración 065).
// Los buckets de fotos dejaron de ser públicos (Ley 21.719 — las URLs públicas
// quedaban en informes/exportes y cualquiera podía abrirlas sin login): ahora
// toda imagen se muestra con una URL firmada con expiración, generada con la
// sesión del usuario. Caché en memoria para no re-firmar en cada render.
import { supabase } from '../supabase';

const cache = new Map(); // `${bucket}|${path}` → { url, exp }

export async function signedUrl(bucket, path, expiresIn = 3600) {
  if (!bucket || !path) return '';
  const key = `${bucket}|${path}`;
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now() + 60_000) return hit.url;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) throw error || new Error('No se pudo firmar la URL de la imagen');
  cache.set(key, { url: data.signedUrl, exp: Date.now() + expiresIn * 1000 });
  return data.signedUrl;
}

// Resuelve varias rutas de una vez → { [path]: url } (ignora las que fallen).
export async function signedUrls(bucket, paths, expiresIn = 3600) {
  const out = {};
  await Promise.all(
    [...new Set((paths || []).filter(Boolean))].map(async (p) => {
      try { out[p] = await signedUrl(bucket, p, expiresIn); } catch (_) { /* sin acceso */ }
    })
  );
  return out;
}
