import { supabase } from '../supabase';

async function invoke(body) {
  const { data, error } = await supabase.functions.invoke('rendiciones-publicas', { body });
  if (error)
    throw new Error(data?.error || error.message || 'No se pudo conectar con rendiciones.');
  if (!data?.ok) throw new Error(data?.error || 'No se pudo completar la operación.');
  return data;
}

export const rendicionesPublicas = {
  bootstrap: (token) => invoke({ action: 'bootstrap', token }),
  submit: (token, payload, startedAt, website = '') =>
    invoke({
      action: 'submit',
      token,
      payload,
      website,
      t_ms: Date.now() - startedAt
    }),
  view: (token, reportId, viewToken) =>
    invoke({
      action: 'view',
      token,
      report_id: reportId,
      view_token: viewToken
    }),
  async upload(token, viewToken, reportId, itemId, file) {
    const form = new FormData();
    form.append('action', 'upload');
    if (token) form.append('token', token);
    form.append('view_token', viewToken);
    form.append('report_id', reportId);
    form.append('item_id', itemId);
    form.append('file', file, file.name || 'evidencia.jpg');
    return invoke(form);
  }
};

async function rpc(name, params = {}) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  return data;
}

export const rendicionesAdmin = {
  dashboard: (limit = 200) => rpc('rendicion_admin_dashboard', { p_limit: limit }),
  colaboradoresDetalle: () => rpc('rendicion_admin_colaboradores_detalle'),
  detalle: (id) => rpc('rendicion_admin_detalle', { p_id: id }),
  completarCabecera: (id, payload) =>
    rpc('rendicion_admin_completar_cabecera', { p_id: id, p_payload: payload }),
  async eliminar(id) {
    const result = await rpc('rendicion_admin_eliminar', { p_id: id });
    const paths = Array.isArray(result?.storage_paths) ? result.storage_paths : [];
    if (paths.length) {
      const { error } = await supabase.storage.from('rendicion-evidencias').remove(paths);
      if (error) console.error('No se pudieron limpiar todas las evidencias:', error);
    }
    return result;
  },
  crearLink: (nombre, expiresAt, maxSubmissions) =>
    rpc('rendicion_admin_crear_link', {
      p_nombre: nombre,
      p_expires_at: expiresAt || null,
      p_max_submissions: maxSubmissions ? Number(maxSubmissions) : null
    }),
  toggleLink: (id, activo) => rpc('rendicion_admin_toggle_link', { p_id: id, p_activo: activo }),
  guardarCatalogo: (tipo, item) =>
    rpc('rendicion_admin_guardar_catalogo', {
      p_tipo: tipo,
      p_id: item.id || null,
      p_codigo: item.codigo || null,
      p_nombre: item.nombre,
      p_activo: item.activo ?? true
    }),
  guardarColaboradorDetalle: (item) =>
    rpc('rendicion_admin_guardar_colaborador_detalle', {
      p_id: item.id || null,
      p_nombre: item.nombre,
      p_rut: item.rut || null,
      p_direccion_area: item.direccion_area || null,
      p_unidad: item.unidad || null,
      p_tecnico: item.tecnico || null,
      p_activo: item.activo ?? true
    })
};

export async function optimizePhoto(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('El archivo debe ser una imagen.');
  if (/heic|heif/i.test(file.type)) {
    if (file.size > 1_572_864)
      throw new Error('La imagen HEIC supera 1,5 MB. Reduce su tamaño antes de subirla.');
    return file;
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d', { alpha: false }).drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  let quality = 0.8;
  let blob;
  do {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    quality -= 0.12;
  } while (blob?.size > 1_572_864 && quality >= 0.4);
  if (!blob || blob.size > 1_572_864) throw new Error('No fue posible reducir la foto a 1,5 MB.');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'evidencia'}.jpg`, {
    type: 'image/jpeg'
  });
}
