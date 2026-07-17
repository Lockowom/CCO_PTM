// ============================================================================
//  insumosService — Panel de Insumos (Inventario)
//  Stock de insumos de embalaje/despacho con semáforo (OK / por acabarse /
//  crítico) y armado del correo de solicitud de reposición.
//  Lectura directa (RLS authenticated); escrituras por RPC gateada
//  (_insumos_puede_gestionar → admin o manage_insumos/manage_inventory).
// ============================================================================
import { supabase } from '../supabase';

export const CATEGORIAS = ['CAJAS', 'PALLETS', 'OTROS'];
export const CATEGORIA_LABEL = { CAJAS: 'Cajas', PALLETS: 'Pallets / Embalaje', OTROS: 'Otros insumos' };

// Semáforo: rojo (<= crítico) · amarillo (<= bajo) · verde (> bajo).
export function semaforo(i) {
  const c = Number(i?.cantidad ?? 0);
  const crit = Number(i?.umbral_critico ?? 0);
  const bajo = Number(i?.umbral_bajo ?? 0);
  if (c <= crit) return 'critico';
  if (c <= bajo) return 'bajo';
  return 'ok';
}
export const SEMAFORO_META = {
  ok:      { label: 'OK',           color: '#10b981', bg: '#ecfdf5', text: '#047857', dot: '🟢' },
  bajo:    { label: 'Por acabarse', color: '#f59e0b', bg: '#fffbeb', text: '#b45309', dot: '🟡' },
  critico: { label: 'Crítico',      color: '#ef4444', bg: '#fef2f2', text: '#b91c1c', dot: '🔴' },
};

export async function listarInsumos() {
  const { data, error } = await supabase.from('tms_insumos')
    .select('*').eq('activo', true).order('orden', { ascending: true }).order('nombre', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function setCantidad(id, cantidad) {
  const { data, error } = await supabase.rpc('insumos_set_cantidad', { p_id: id, p_cantidad: Number(cantidad) || 0 });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

export async function guardarInsumo(payload) {
  const { data, error } = await supabase.rpc('insumos_guardar', { p: payload });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

export async function eliminarInsumo(id) {
  const { data, error } = await supabase.rpc('insumos_eliminar', { p_id: id });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

// Construye el asunto + cuerpo del correo de solicitud para los ítems dados.
// items: [{ nombre, categoria, medida, codigo_ptm, unidad, cantidad, pedir }]
export function armarCorreoSolicitud(items, { solicitante = '' } = {}) {
  const fecha = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const asunto = `Solicitud de insumos — ${fecha}`;
  const lineas = items.map((i) => {
    const cod = i.codigo_ptm ? ` (cód. ${i.codigo_ptm})` : '';
    const med = i.medida ? ` ${i.medida}` : '';
    const pedir = i.pedir != null && String(i.pedir).trim() !== '' ? `${i.pedir} ${i.unidad || ''}`.trim() : 'por definir';
    return `• ${i.nombre}${med}${cod} — quedan ${i.cantidad} ${i.unidad || ''} · solicitar: ${pedir}`;
  });
  const cuerpo = [
    'Estimados,',
    '',
    'Solicito reposición de los siguientes insumos de bodega:',
    '',
    ...lineas,
    '',
    solicitante ? `Solicita: ${solicitante}` : '',
    `Fecha: ${fecha}`,
  ].filter((l) => l !== null).join('\n');
  return { asunto, cuerpo };
}
