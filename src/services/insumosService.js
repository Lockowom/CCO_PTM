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

// Construye el correo de solicitud (asunto + cuerpo texto plano en tabla
// alineada + cuerpo HTML con tabla real para pegar en Outlook/Gmail).
// items: [{ nombre, categoria, medida, codigo_ptm, unidad, cantidad, pedir }]
export function armarCorreoSolicitud(items, { solicitante = '' } = {}) {
  const fecha = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const asunto = `Solicitud de insumos — ${fecha}`;
  const est = (i) => SEMAFORO_META[semaforo(i)].label;
  const pedirTxt = (i) => (i.pedir != null && String(i.pedir).trim() !== '' ? `${i.pedir}` : '—');
  const detalle = (i) => [i.medida, i.codigo_ptm].filter(Boolean).join(' · ') || '—';

  // ── Texto plano: tabla monoespaciada alineada ──
  const filas = items.map((i, n) => ({
    n: String(n + 1),
    insumo: i.nombre || '',
    detalle: detalle(i),
    quedan: `${i.cantidad} ${i.unidad || ''}`.trim(),
    estado: est(i),
    pedir: pedirTxt(i),
  }));
  const cols = [
    { k: 'n', t: '#' }, { k: 'insumo', t: 'INSUMO' }, { k: 'detalle', t: 'MEDIDA / CÓDIGO' },
    { k: 'quedan', t: 'QUEDAN' }, { k: 'estado', t: 'ESTADO' }, { k: 'pedir', t: 'SOLICITAR' },
  ];
  const w = {};
  cols.forEach((c) => { w[c.k] = Math.max(c.t.length, ...filas.map((f) => String(f[c.k]).length), 3); });
  const pad = (s, k) => String(s).padEnd(w[k]);
  const linea = (obj) => '| ' + cols.map((c) => pad(obj[c.k], c.k)).join(' | ') + ' |';
  const sep = '+' + cols.map((c) => '-'.repeat(w[c.k] + 2)).join('+') + '+';
  const tabla = [sep, linea(Object.fromEntries(cols.map((c) => [c.k, c.t]))), sep, ...filas.map(linea), sep].join('\n');

  const cuerpo = [
    'Estimados,',
    '',
    'Junto con saludar, solicito la reposición de los siguientes insumos de bodega:',
    '',
    tabla,
    '',
    `Total de ítems solicitados: ${items.length}.`,
    'Agradezco confirmar disponibilidad y fecha estimada de entrega.',
    '',
    'Saludos cordiales,',
    solicitante || '',
    `Fecha de solicitud: ${fecha}`,
  ].filter((l) => l !== null).join('\n');

  // ── HTML: tabla real con estilos + estado con color ──
  const th = 'style="background:#f97316;color:#fff;padding:8px 10px;text-align:left;font-size:13px;font-weight:700;border:1px solid #ea580c;"';
  const td = 'style="padding:7px 10px;font-size:13px;border:1px solid #e5e7eb;color:#1f2937;"';
  const rows = items.map((i, n) => {
    const m = SEMAFORO_META[semaforo(i)];
    return `<tr${n % 2 ? ' style="background:#f9fafb;"' : ''}>
      <td ${td}>${n + 1}</td>
      <td ${td}><b>${escapeHtml(i.nombre)}</b></td>
      <td ${td}>${escapeHtml(detalle(i))}</td>
      <td ${td} align="center">${i.cantidad} ${escapeHtml(i.unidad || '')}</td>
      <td ${td} align="center"><span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${m.bg};color:${m.text};font-weight:700;font-size:12px;">${m.label}</span></td>
      <td ${td} align="center">${escapeHtml(pedirTxt(i))}</td>
    </tr>`;
  }).join('');
  const cuerpoHtml = `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:14px;line-height:1.5;">
    <p>Estimados,</p>
    <p>Junto con saludar, solicito la reposición de los siguientes insumos de bodega:</p>
    <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;margin:8px 0;">
      <thead><tr>
        <th ${th}>#</th><th ${th}>Insumo</th><th ${th}>Medida / Código</th>
        <th ${th}>Quedan</th><th ${th}>Estado</th><th ${th}>Solicitar</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin:6px 0;">Total de ítems solicitados: <b>${items.length}</b>. Agradezco confirmar disponibilidad y fecha estimada de entrega.</p>
    <p style="margin:12px 0 0;">Saludos cordiales,<br>${escapeHtml(solicitante || '')}<br>
      <span style="color:#6b7280;font-size:12px;">Fecha de solicitud: ${fecha}</span></p>
  </div>`;

  return { asunto, cuerpo, cuerpoHtml };
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
