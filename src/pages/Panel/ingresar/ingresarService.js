// ============================================================================
//  ingresarService — capa de datos del módulo Ingresar (paridad con /ingresar
//  del Panel), adaptada a CCO: lee `tms_operaciones` y escribe por las RPCs
//  (guardar_nv / cambiar_estado_nv / eliminar_nv / *_consolidado). SIN Apps
//  Script ni login propio: la autenticación es la de CCO (permiso manage_panel).
// ============================================================================
import { supabase } from '../../../supabase';

// ── Constantes / tipos compartidos ──────────────────────────────────────────
export const CANALES = [
  { value: 'ptm', label: 'PTM', color: '#ea580c' },
  { value: 'orange', label: 'Orange', color: '#f59e0b' },
  { value: 'farmapack', label: 'Farmapack', color: '#0f766e' },
  { value: 'varios', label: 'Varios', color: '#4f46e5' },
];
export const VARIOS_TIPOS = ['N.V ANTICIPADA', 'DEMO', 'REGALO', 'BOLETA', 'GUÍA SALIDA'];
export const INCIDENCIAS_NV = ['PROBLEMAS DE DIRECCIÓN', 'PROBLEMAS DE TRANSPORTE', 'OTRO'];
export const ESTADOS_INCIDENCIA = ['ABIERTA', 'EN GESTIÓN', 'RESUELTA'];
// Estados seleccionables EXACTAMENTE como el proyecto original (Sheet/Panel):
// En Proceso · Shipping · Currier · En Ruta · Entregado.
export const ESTADOS_SELECCIONABLES = ['En Proceso', 'Shipping', 'Currier', 'En Ruta', 'Entregado'];
export const ESTADOS_ACTIVOS = ['En Proceso', 'Shipping', 'Currier', 'En Ruta'];
export const TIPOS_DESPACHO = ['Courier - Inyección', 'Directo', 'Courier (Retiro / Pick-up)'];
export const ESTADO_COLOR = {
  'En Proceso': '#f59e0b', 'P / VENDEDOR': '#e11d48', 'P / STOCK': '#78716c', 'P / RETIRO': '#9333ea',
  'Shipping': '#0d9488', 'Currier': '#4f46e5', 'En Ruta': '#2563eb', 'Entregado': '#65a30d',
  'NULA': '#9ca3af', 'REFACTURADO': '#9ca3af', 'RECHAZADO': '#9ca3af',
};
export const colorFor = (v) => ESTADO_COLOR[v] || '#9ca3af';
export const ACCENT = '#ea580c';

const soloFecha = (v) => (v ? String(v).slice(0, 10) : '');
// Normaliza la N.V. igual que la BD (trigger): quita espacios y sufijo ".0" →
// el match es SIEMPRE exacto (evita el bug del Sheet de datos cruzados).
const normNV = (v) => {
  const t = String(v ?? '').trim();
  return /^\d+\.0+$/.test(t) ? t.split('.')[0] : t;
};
const normText = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const normWords = (v) => normText(v).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const STOP_WORDS_VENDEDOR = new Set(['de', 'del', 'la', 'las', 'los']);
const vendorTokens = (v) => normWords(v).split(' ').filter((token) => token && !STOP_WORDS_VENDEDOR.has(token));
const colDe = (canal) => (canal === 'ptm' ? 'nv_ptm' : canal === 'orange' ? 'nv_orange' : canal === 'farmapack' ? 'nv_farmapack' : 'varios');
const canalDe = (r) => (r.nv_ptm ? 'ptm' : r.nv_orange ? 'orange' : r.nv_farmapack ? 'farmapack' : 'varios');
const nvDe = (r) => (r.nv_ptm ? String(r.nv_ptm) : (r.nv_orange || r.nv_farmapack || r.varios || ''));
export const esClienteOrange = (cliente) => {
  const t = normText(cliente);
  return t.includes('orange');
};

// ── Lista de N.V. activas (pestaña Buscar) ──────────────────────────────────
const LISTA_COLS = 'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,estado,transportista,fecha_compromiso,guia,factura,fecha_aprobacion,fecha_aprobacion_real,urgente,fecha_estado,reabierta,motivo_reapertura';

// Mapea una fila de tms_operaciones al item que consume la lista/drawer de Buscar.
function mapOperacionRow(r) {
  const canal = canalDe(r); const nv = nvDe(r);
  return {
    id: r.id, key: `${canal}:${nv}`, canal, nv, cliente: r.cliente || '', vendedor: r.vendedor || '',
    estado: r.estado || '', transportista: r.transportista || '', fechaCompromiso: soloFecha(r.fecha_compromiso),
    guia: r.guia || '', factura: r.factura || '', fechaAprobacion: soloFecha(r.fecha_aprobacion),
    fechaAprobacionReal: soloFecha(r.fecha_aprobacion_real), urgente: r.urgente === true, _estado: r.estado,
    reabierta: r.reabierta === true, motivoReapertura: r.motivo_reapertura || '',
  };
}

export async function listaActivas() {
  const all = []; let from = 0; const page = 1000;
  for (;;) {
    const { data, error } = await supabase.from('tms_operaciones').select(LISTA_COLS)
      .in('estado', ESTADOS_ACTIVOS).order('id', { ascending: true }).range(from, from + page - 1);
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
      dedup.set(key, mapOperacionRow(r));
    }
  });
  return Array.from(dedup.values());
}

// Búsqueda en TODA la tabla (cualquier estado: incluye Entregado/NULA/etc.) por
// nº de N.V., cliente, vendedor, guía, factura o transportista. Sirve para que
// en Buscar se pueda encontrar y abrir una N.V. ya entregada o cerrada, que la
// lista de "activas" no muestra. Devuelve el mismo shape que listaActivas.
export async function buscarOperaciones(term, { limit = 300 } = {}) {
  const t = String(term || '').trim();
  if (t.length < 2) return [];
  // PostgREST .or() usa comas/paréntesis como separadores → se neutralizan.
  const safe = t.replace(/[(),*]/g, ' ').trim();
  if (!safe) return [];
  const like = `*${safe}*`;
  const ors = [];
  if (/^\d+$/.test(safe)) ors.push(`nv_ptm.eq.${Number(safe)}`);
  ors.push(
    `nv_orange.ilike.${like}`, `nv_farmapack.ilike.${like}`, `varios.ilike.${like}`,
    `cliente.ilike.${like}`, `vendedor.ilike.${like}`, `guia.ilike.${like}`,
    `factura.ilike.${like}`, `transportista.ilike.${like}`,
  );
  const { data, error } = await supabase.from('tms_operaciones').select(LISTA_COLS)
    .or(ors.join(',')).order('fecha_estado', { ascending: false, nullsFirst: false }).limit(limit);
  if (error) throw error;
  const dedup = new Map();
  (data || []).forEach((r) => {
    const nv = nvDe(r); if (!nv) return;
    const key = `${canalDe(r)}:${nv}`;
    if (!dedup.has(key)) dedup.set(key, mapOperacionRow(r));
  });
  return Array.from(dedup.values());
}

// ── Opciones del formulario ─────────────────────────────────────────────────
export async function opciones() {
  const set = new Set();
  // 1) Catálogo maestro (Configuración → Transportistas): fuente mantenida.
  const { data: cat } = await supabase.from('tms_panel_transportistas')
    .select('nombre').eq('activo', true).order('nombre', { ascending: true });
  (cat || []).forEach((r) => { const t = (r.nombre || '').trim(); if (t) set.add(t); });
  // 2) Además, TODO transportista ya usado en N.V. — paginado con .order/.range
  //    para NO depender del tope de 1.000 filas de PostgREST (que dejaba fuera
  //    a los que solo aparecían más allá de la primera página, p.ej. Transfarma).
  let from = 0; const page = 1000;
  for (;;) {
    const { data, error } = await supabase.from('tms_operaciones')
      .select('transportista').not('transportista', 'is', null)
      .order('id', { ascending: true }).range(from, from + page - 1);
    if (error || !data || data.length === 0) break;
    data.forEach((r) => { const t = (r.transportista || '').trim(); if (t) set.add(t); });
    if (data.length < page) break;
    from += page;
  }
  const transportistas = [...set].sort((a, b) => a.localeCompare(b, 'es'));
  return { estados: ESTADOS_SELECCIONABLES, transportistas, tiposDespacho: TIPOS_DESPACHO };
}

// ── Lookup de una N.V. (preview para editar) ────────────────────────────────
const PREVIEW = 'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,centro_costo,division,estado,transportista,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_facturacion,fecha_despacho,fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,factura,guia,bultos,valor_factura,numero_envio,urgente,incidencia,estado_incidencia,observaciones_incidencia,reabierta,fecha_reapertura,motivo_reapertura';
// Catálogo maestro NV → cliente/vendedor (hojas CARGA). Fuente precisa.
export async function buscarNvCatalogo(canal, nv) {
  const t = normNV(nv); if (!t) return null;
  const { data } = await supabase.from('tms_nv_catalogo')
    .select('cliente, vendedor, fecha_aprobacion, centro_costo, division')
    .eq('canal', String(canal).toLowerCase()).eq('nv', t).limit(1);
  return (data && data[0]) || null;
}

// Cascada CENTRO COSTOS: vendedor → centro de costo + división.
// Cruce tolerante a mayúsculas/espacios (ilike sobre el nombre ya recortado).
export async function costoDeVendedor(vendedor) {
  const v = String(vendedor || '').trim(); if (!v) return null;
  const { data } = await supabase.from('tms_panel_vendedores')
    .select('nombre, centro_costo, division').eq('activo', true).order('nombre', { ascending: true });
  if (!data || data.length === 0) return null;
  const base = normWords(v);
  const baseTokens = vendorTokens(v);
  const scored = data
    .map((row) => {
      const name = normWords(row.nombre);
      const nameTokens = vendorTokens(row.nombre);
      const exact = name === base;
      const contains = !exact && (name.includes(base) || base.includes(name));
      const shared = baseTokens.filter((token) => nameTokens.includes(token)).length;
      const coversBase = baseTokens.length > 0 && baseTokens.every((token) => nameTokens.includes(token));
      const coversCandidate = nameTokens.length > 0 && nameTokens.every((token) => baseTokens.includes(token));
      let score = 0;
      if (exact) score += 1000;
      else if (contains) score += 700;
      else if (coversBase || coversCandidate) score += 500;
      score += shared * 100;
      score -= Math.abs(name.length - base.length);
      return { ...row, score };
    })
    .filter((row) => row.score >= 200)
    .sort((a, b) => b.score - a.score);
  const match = scored[0];
  return match ? { centro_costo: match.centro_costo || '', division: match.division || '' } : null;
}

export async function lookup(canal, nv) {
  const col = colDe(canal); const t = normNV(nv);
  let q = supabase.from('tms_operaciones').select(PREVIEW).order('fecha_estado', { ascending: false }).limit(1);
  q = canal === 'ptm' && /^\d+$/.test(t) ? q.eq(col, Number(t)) : q.eq(col, t);
  const [{ data }, cat] = await Promise.all([q, buscarNvCatalogo(canal, t)]);
  const r = data && data.length ? data[0] : null;

  // Cliente/Vendedor: prioriza la operación; si falta, el catálogo NV.
  const cliente = r?.cliente || cat?.cliente || '';
  const vendedor = r?.vendedor || cat?.vendedor || '';
  let ccosto = r?.centro_costo || cat?.centro_costo || '';
  let division = r?.division || cat?.division || '';
  // Cascada: si falta centro de costo/división, se derivan del vendedor.
  if (vendedor && (!ccosto || !division)) {
    const vc = await costoDeVendedor(vendedor);
    if (vc) { ccosto = ccosto || vc.centro_costo || ''; division = division || vc.division || ''; }
  }

  if (r) {
    return {
      found: true, row: r.id,
      data: {
        ...r, canal, nv: nvDe(r), estado: r.estado, cliente, vendedor, ccosto, division,
        fecha_compromiso: soloFecha(r.fecha_compromiso), fecha_registro_nv: soloFecha(r.fecha_registro_nv),
      },
    };
  }
  // N.V. nueva → autocompleta cliente/vendedor/ccosto/división (fuente precisa).
  return { found: false, autoFill: { cliente, vendedor, ccosto, division } };
}

export async function lookupOrangeAssociation(nv, fallback = {}) {
  const t = normNV(nv);
  if (!t) return null;
  const cat = await buscarNvCatalogo('orange', t);
  if (!cat) return null;
  let ccosto = cat.centro_costo || '';
  let division = cat.division || '';
  const vendedorRef = cat.vendedor || fallback.vendedor || '';
  if (vendedorRef && (!ccosto || !division)) {
    const vc = await costoDeVendedor(vendedorRef);
    if (vc) {
      ccosto = ccosto || vc.centro_costo || '';
      division = division || vc.division || '';
    }
  }
  ccosto = ccosto || fallback.ccosto || fallback.centro_costo || '';
  division = division || fallback.division || '';
  return {
    nv: t,
    cliente: cat.cliente || '',
    vendedor: cat.vendedor || fallback.vendedor || '',
    ccosto,
    division,
    fecha_aprobacion: soloFecha(cat.fecha_aprobacion),
  };
}

// ── Export a Excel de TODA la tabla de operaciones (maestro de N.V.) ─────────
// Todas las columnas y todos los datos, con encabezados legibles (paridad con
// la "hoja principal"). Orden estable por id; pagina para traerlo completo.
const EXPORT_COLS = [
  ['id', 'ID'],
  ['nv_ptm', 'N.V PTM'], ['nv_orange', 'N.V ORANGE'], ['nv_farmapack', 'N.V FARMAPACK'], ['varios', 'VARIOS'],
  ['cliente', 'CLIENTE'], ['vendedor', 'VENDEDOR'], ['centro_costo', 'CENTRO COSTO'], ['division', 'DIVISIÓN'],
  ['estado', 'ESTADO'], ['urgente', 'URGENTE'], ['tipo_despacho', 'TIPO DESPACHO'],
  ['transportista', 'TRANSPORTISTA'], ['empresa_transporte', 'EMPRESA TRANSPORTE'],
  ['factura', 'FACTURA'], ['guia', 'GUÍA'], ['numero_envio', 'N° ENVÍO'], ['bultos', 'BULTOS'],
  ['valor_nv', 'VALOR N.V'], ['valor_factura', 'VALOR FACTURA'], ['costo_flete', 'COSTO FLETE'],
  ['fecha_registro_nv', 'F. REGISTRO N.V'], ['fecha_aprobacion', 'F. APROBACIÓN'],
  ['fecha_aprobacion_real', 'F. APROBACIÓN REAL'], ['fecha_facturacion', 'F. FACTURACIÓN'],
  ['fecha_compromiso', 'F. COMPROMISO'], ['fecha_en_proceso', 'F. EN PROCESO'], ['fecha_shipping', 'F. SHIPPING'],
  ['fecha_despacho', 'F. DESPACHO'], ['fecha_en_ruta', 'F. EN RUTA'], ['fecha_entregado', 'F. ENTREGADO'],
  ['fecha_estado', 'F. ÚLTIMO ESTADO'], ['dias_en_proceso', 'DÍAS EN PROCESO'],
  ['incidencia', 'INCIDENCIA'], ['estado_incidencia', 'ESTADO INCIDENCIA'],
  ['observaciones_incidencia', 'OBS. INCIDENCIA'], ['dias_incidencia', 'DÍAS INCIDENCIA'], ['fillrate', 'FILLRATE'],
  ['origen', 'ORIGEN'], ['created_at', 'CREADO'], ['updated_at', 'ACTUALIZADO'],
];
const EXPORT_DERIVED_COLS = [
  ['canal_operacion', 'CANAL OPERACIÓN'],
  ['nv_operacion', 'N.V OPERACIÓN'],
  ['nv_orange_asociada_ptm', 'N.V ORANGE ASOCIADA PTM'],
  ['tiene_asociacion_orange', 'PTM CON ASOCIACIÓN ORANGE'],
];
// Columnas de fecha (date) y de timestamp: se exportan SIEMPRE en formato chileno
// dd/mm/aaaa (y dd/mm/aaaa hh:mm) para que la descarga sea consistente y no
// dependa del locale de Excel. `fecha_facturacion` es texto libre → se deja igual.
const DATE_COLS = new Set([
  'fecha_aprobacion', 'fecha_aprobacion_real', 'fecha_despacho', 'fecha_compromiso',
  'fecha_en_proceso', 'fecha_shipping', 'fecha_en_ruta', 'fecha_entregado',
]);
const TS_COLS = new Set(['fecha_estado', 'fecha_registro_nv', 'created_at', 'updated_at']);
const fmtFecha = (v) => {
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v);
};
const fmtTs = (v) => {
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : fmtFecha(v);
};

export async function exportarOperaciones() {
  const cols = EXPORT_COLS.map((c) => c[0]).join(',');
  // Orden estable por id (orden de ingreso). La descarga es SOLO LECTURA: no
  // toca ni bloquea la tabla, así el llenado desde Ingresar sigue normal.
  const all = []; let from = 0; const page = 1000;
  for (;;) {
    const { data, error } = await supabase.from('tms_operaciones').select(cols).order('id', { ascending: true }).range(from, from + page - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < page) break;
    from += page;
  }
  return all.map((r) => {
    const o = {};
    EXPORT_COLS.forEach(([k, h]) => {
      let v = r[k];
      if (k === 'urgente') v = v === true ? 'SÍ' : 'NO';
      else if (v == null || v === '') v = '';
      else if (DATE_COLS.has(k)) v = fmtFecha(v);       // dd/mm/aaaa
      else if (TS_COLS.has(k)) v = fmtTs(v);            // dd/mm/aaaa hh:mm
      o[h] = v;                                          // números ($ , bultos, días) quedan numéricos
    });
    const canal = canalDe(r);
    const nvOperacion = nvDe(r);
    const nvOrangeAsociadaPtm = r.nv_ptm ? (r.nv_orange || '') : '';
    const derived = {
      'CANAL OPERACIÓN': String(canal || '').toUpperCase(),
      'N.V OPERACIÓN': nvOperacion || '',
      'N.V ORANGE ASOCIADA PTM': nvOrangeAsociadaPtm,
      'PTM CON ASOCIACIÓN ORANGE': r.nv_ptm ? (r.nv_orange ? 'SÍ' : 'NO') : '',
    };
    EXPORT_DERIVED_COLS.forEach(([, header]) => {
      o[header] = derived[header] || '';
    });
    return o;
  });
}

// ── Escrituras (RPCs) ────────────────────────────────────────────────────────
function rpcResult(data, error) {
  if (error) return { ok: false, error: error.message, message: error.message };
  if (data && typeof data === 'object') return data;
  return { ok: true };
}

export async function guardar(payload) {
  const p = { ...payload, id: payload?.id ?? (payload?.mode === 'update' ? payload?.lookup?.row : null) };
  const { data, error } = await supabase.rpc('guardar_nv', { p });
  return rpcResult(data, error);
}
export async function puedeEditarOperacion(id) {
  if (!id) return { permitida: false, message: 'N.V. no encontrada.' };
  const { data, error } = await supabase.rpc('iam_puede_editar_nv', { p_id: id });
  if (error) return { permitida: false, message: error.message || 'No se pudo validar el acceso IAM.' };
  return data || { permitida: false, message: 'No se pudo validar el acceso IAM.' };
}
export async function cambiarEstado(id, estado, urgente = null) {
  const { data, error } = await supabase.rpc('cambiar_estado_nv', { p_id: id, p_estado: estado, p_urgente: urgente });
  return rpcResult(data, error);
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
  return rpcResult(data, error);
}

export async function listarSolicitudesReapertura(operacionId) {
  if (!operacionId) return [];
  const { data, error } = await supabase
    .from('tms_nv_reaperturas')
    .select('id, operacion_id, nv, canal, estado_origen, motivo, estado, solicitada_por, solicitada_por_nombre, solicitada_at, resuelta_por, resuelta_por_nombre, resuelta_at, observacion_resolucion')
    .eq('operacion_id', operacionId)
    .order('solicitada_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function solicitarReapertura(id, motivo) {
  const { data, error } = await supabase.rpc('solicitar_reapertura_nv', { p_operacion_id: id, p_motivo: motivo });
  return rpcResult(data, error);
}

export async function resolverReapertura(requestId, aprobar, observacion = '') {
  const { data, error } = await supabase.rpc('resolver_reapertura_nv', {
    p_request_id: requestId,
    p_aprobar: aprobar,
    p_observacion: observacion || null,
  });
  return rpcResult(data, error);
}
export async function eliminar(id) {
  const { data, error } = await supabase.rpc('eliminar_nv', { p_id: id });
  return rpcResult(data, error);
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
