// ============================================================================
//  ingresarService — capa de datos del módulo Ingresar (paridad con /ingresar
//  del Panel), adaptada a CCO: lee `tms_operaciones` y escribe por las RPCs
//  (guardar_nv / cambiar_estado_nv / eliminar_nv / *_consolidado). SIN Apps
//  Script ni login propio: la autenticación es la de CCO (permiso manage_panel).
// ============================================================================
import { supabase } from '../../../supabase';

// ── Constantes / tipos compartidos ──────────────────────────────────────────
export const CANALES = [
  { value: 'ptm', label: 'PTM' }, { value: 'orange', label: 'Orange' },
  { value: 'farmapack', label: 'Farmapack' }, { value: 'varios', label: 'Varios' },
];
export const VARIOS_TIPOS = ['N.V ANTICIPADA', 'DEMO', 'REGALO', 'BOLETA', 'GUÍA SALIDA'];
// Solo los estados que PTM usa hoy (se quitaron P / VENDEDOR, P / STOCK,
// P / RETIRO, Currier y REFACTURADO — en desuso, siempre en 0).
export const ESTADOS_SELECCIONABLES = ['En Proceso', 'Shipping', 'En Ruta', 'Entregado', 'NULA', 'RECHAZADO'];
export const ESTADOS_ACTIVOS = ['En Proceso', 'Shipping', 'En Ruta'];
export const TIPOS_DESPACHO = ['Courier - Inyección', 'Directo', 'Courier (Retiro / Pick-up)'];
export const ESTADO_COLOR = {
  'En Proceso': '#f59e0b', 'P / VENDEDOR': '#e11d48', 'P / STOCK': '#78716c', 'P / RETIRO': '#9333ea',
  'Shipping': '#0d9488', 'Currier': '#4f46e5', 'En Ruta': '#2563eb', 'Entregado': '#65a30d',
  'NULA': '#9ca3af', 'REFACTURADO': '#9ca3af', 'RECHAZADO': '#9ca3af',
};
export const colorFor = (v) => ESTADO_COLOR[v] || '#9ca3af';
export const ACCENT = '#ea580c';

const soloFecha = (v) => (v ? String(v).slice(0, 10) : '');
const colDe = (canal) => (canal === 'ptm' ? 'nv_ptm' : canal === 'orange' ? 'nv_orange' : canal === 'farmapack' ? 'nv_farmapack' : 'varios');
const canalDe = (r) => (r.nv_ptm ? 'ptm' : r.nv_orange ? 'orange' : r.nv_farmapack ? 'farmapack' : 'varios');
const nvDe = (r) => (r.nv_ptm ? String(r.nv_ptm) : (r.nv_orange || r.nv_farmapack || r.varios || ''));

// ── Lista de N.V. activas (pestaña Buscar) ──────────────────────────────────
export async function listaActivas() {
  const cols = 'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,estado,transportista,fecha_compromiso,guia,factura,fecha_aprobacion,fecha_aprobacion_real,urgente,fecha_estado';
  const all = []; let from = 0; const page = 1000;
  for (;;) {
    const { data, error } = await supabase.from('tms_operaciones').select(cols).in('estado', ESTADOS_ACTIVOS).range(from, from + page - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < page) break;
    from += page;
  }
  const dedup = new Map();
  all.forEach((r) => {
    const canal = canalDe(r); const nv = nvDe(r); if (!nv) return;
    const key = `${canal}:${nv}`;
    const prev = dedup.get(key);
    if (!prev || ESTADOS_ACTIVOS.indexOf(r.estado) > ESTADOS_ACTIVOS.indexOf(prev._estado)) {
      dedup.set(key, {
        id: r.id, key, canal, nv, cliente: r.cliente || '', vendedor: r.vendedor || '',
        estado: r.estado || '', transportista: r.transportista || '', fechaCompromiso: soloFecha(r.fecha_compromiso),
        guia: r.guia || '', factura: r.factura || '', fechaAprobacion: soloFecha(r.fecha_aprobacion),
        fechaAprobacionReal: soloFecha(r.fecha_aprobacion_real), urgente: r.urgente === true, _estado: r.estado,
      });
    }
  });
  return Array.from(dedup.values());
}

// ── Opciones del formulario ─────────────────────────────────────────────────
export async function opciones() {
  const { data } = await supabase.from('tms_operaciones').select('transportista').not('transportista', 'is', null).limit(5000);
  const transportistas = [...new Set((data || []).map((r) => (r.transportista || '').trim()).filter(Boolean))].sort();
  return { estados: ESTADOS_SELECCIONABLES, transportistas, tiposDespacho: TIPOS_DESPACHO };
}

// ── Lookup de una N.V. (preview para editar) ────────────────────────────────
const PREVIEW = 'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,centro_costo,division,estado,transportista,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_facturacion,fecha_despacho,fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,factura,guia,bultos,valor_factura,numero_envio,urgente';
// Catálogo maestro NV → cliente/vendedor (hojas CARGA). Fuente precisa.
export async function buscarNvCatalogo(canal, nv) {
  const t = String(nv).trim(); if (!t) return null;
  const { data } = await supabase.from('tms_nv_catalogo')
    .select('cliente, vendedor, fecha_aprobacion, centro_costo, division')
    .eq('canal', canal).eq('nv', t).limit(1);
  return (data && data[0]) || null;
}

export async function lookup(canal, nv) {
  const col = colDe(canal); const t = String(nv).trim();
  let q = supabase.from('tms_operaciones').select(PREVIEW).order('fecha_estado', { ascending: false }).limit(1);
  q = canal === 'ptm' && /^\d+$/.test(t) ? q.eq(col, Number(t)) : q.eq(col, t);
  const [{ data }, cat] = await Promise.all([q, buscarNvCatalogo(canal, t)]);
  if (data && data.length) {
    const r = data[0];
    return {
      found: true, row: r.id,
      data: {
        ...r, canal, nv: nvDe(r), estado: r.estado,
        // Cliente/Vendedor: prioriza lo que ya tiene la operación; si falta, el catálogo.
        cliente: r.cliente || cat?.cliente || '',
        vendedor: r.vendedor || cat?.vendedor || '',
        ccosto: r.centro_costo || cat?.centro_costo || '',
        division: r.division || cat?.division || '',
        fecha_compromiso: soloFecha(r.fecha_compromiso), fecha_registro_nv: soloFecha(r.fecha_registro_nv),
      },
    };
  }
  // N.V. nueva → autocompleta cliente/vendedor desde el catálogo (fuente precisa).
  return {
    found: false,
    autoFill: {
      cliente: cat?.cliente || '', vendedor: cat?.vendedor || '',
      ccosto: cat?.centro_costo || '', division: cat?.division || '',
    },
  };
}

// ── Escrituras (RPCs) ────────────────────────────────────────────────────────
export async function guardar(payload) {
  const p = { ...payload, id: payload?.id ?? (payload?.mode === 'update' ? payload?.lookup?.row : null) };
  const { data, error } = await supabase.rpc('guardar_nv', { p });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}
export async function cambiarEstado(id, estado, urgente = null) {
  const { data, error } = await supabase.rpc('cambiar_estado_nv', { p_id: id, p_estado: estado, p_urgente: urgente });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}
// Edición inline por columnas: mapea nombres de columna → claves del RPC guardar_nv.
const COL_A_FORM = {
  estado: 'estado', urgente: 'urgente', transportista: 'transportista', tipo_despacho: 'tipoDespacho',
  fecha_compromiso: 'fechaCompromiso', fecha_aprobacion: 'fechaAprobacion', fecha_aprobacion_real: 'fechaAprobacionReal',
  fecha_facturacion: 'fechaFacturacion', fecha_despacho: 'fechaDespacho', factura: 'factura', guia: 'guia',
  bultos: 'bultos', valor_factura: 'valorFactura', numero_envio: 'numeroEnvio',
};
export async function actualizarCampos(id, dirty) {
  const p = { id };
  Object.entries(dirty || {}).forEach(([k, v]) => { const fk = COL_A_FORM[k] || k; p[fk] = v; });
  const { data, error } = await supabase.rpc('guardar_nv', { p });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}
export async function eliminar(id) {
  const { data, error } = await supabase.rpc('eliminar_nv', { p_id: id });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

// ── Consolidados ─────────────────────────────────────────────────────────────
export async function listarConsolidados() {
  const [{ data: cons }, { data: nvs }] = await Promise.all([
    supabase.from('tms_consolidados').select('id, ticket, fecha_comprometida, estado, observacion, created_by, created_at').order('id', { ascending: false }),
    supabase.from('tms_consolidado_nvs').select('id, consolidado_id, nv, canal, cliente'),
  ]);
  const byId = {};
  (nvs || []).forEach((n) => { (byId[n.consolidado_id] = byId[n.consolidado_id] || []).push({ id: n.id, nv: n.nv, canal: n.canal, cliente: n.cliente }); });
  return (cons || []).map((c) => ({ ...c, nvs: byId[c.id] || [] }));
}
export async function guardarConsolidado(p) {
  const { data, error } = await supabase.rpc('guardar_consolidado', { p });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}
export async function eliminarConsolidado(id) {
  const { data, error } = await supabase.rpc('eliminar_consolidado', { p_id: id });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}
// Valida una N.V. (para armar consolidados): busca en los 4 canales.
export async function buscarNvBasico(nv) {
  const t = String(nv).trim(); if (!t) return null;
  const ors = [];
  if (/^\d+$/.test(t)) ors.push(`nv_ptm.eq.${Number(t)}`);
  ors.push(`nv_orange.eq.${t}`, `nv_farmapack.eq.${t}`, `varios.ilike.*${t}*`);
  const { data } = await supabase.from('tms_operaciones').select('nv_ptm,nv_orange,nv_farmapack,varios,cliente,estado,fecha_estado').or(ors.join(',')).order('fecha_estado', { ascending: false }).limit(1);
  if (!data || data.length === 0) return null;
  const r = data[0];
  return { nv: nvDe(r), canal: canalDe(r), cliente: r.cliente || null, estado: r.estado || null };
}
