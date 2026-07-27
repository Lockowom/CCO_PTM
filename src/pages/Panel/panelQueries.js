// ============================================================================
//  panelQueries — capa de DATOS REALES del Panel PTM (lee tms_operaciones).
//  Port de la lógica de cálculo de lib/queries.ts del repo panel-, adaptada a
//  CCO: consulta la tabla `tms_operaciones` (migrada del Panel) por el cliente
//  supabase de CCO y devuelve las MISMAS formas que consumen las pantallas
//  (Dashboard, Info, TV, Detalle) — las que antes servía mock.js.
//  El estado ya viene NORMALIZADO en la BD (trigger), así que aquí se calcula
//  directo sobre valores canónicos.
// ============================================================================
import { supabase } from '../../supabase';

// ── Estados canónicos (SSOT, espejo de la BD) ───────────────────────────────
const E = {
  EN_PROCESO: 'En Proceso', P_VENDEDOR: 'P / VENDEDOR', P_STOCK: 'P / STOCK', P_RETIRO: 'P / RETIRO',
  SHIPPING: 'Shipping', CURRIER: 'Currier', EN_RUTA: 'En Ruta', ENTREGADO: 'Entregado',
};
const PENDIENTES = [E.P_VENDEDOR, E.P_STOCK, E.P_RETIRO];
const PRE_SHIPPING = [E.EN_PROCESO, ...PENDIENTES];
const ACTIVOS = [E.EN_PROCESO, ...PENDIENTES, E.SHIPPING, E.CURRIER, E.EN_RUTA];
const ENTREGADOS = [E.ENTREGADO];
const DESCARTE = ['NULA', 'REFACTURADO', 'RECHAZADO'];
const FLUJO = [E.EN_PROCESO, E.P_VENDEDOR, E.P_STOCK, E.P_RETIRO, E.SHIPPING, E.CURRIER, E.EN_RUTA, E.ENTREGADO];

const BADGE = {
  [E.ENTREGADO]: 'entregado', [E.EN_PROCESO]: 'proceso', [E.SHIPPING]: 'proceso',
  [E.CURRIER]: 'ruta', [E.EN_RUTA]: 'ruta', [E.P_VENDEDOR]: 'vendedor',
  [E.P_STOCK]: 'stock', [E.P_RETIRO]: 'retiro', NULA: 'nula', REFACTURADO: 'nula', RECHAZADO: 'nula',
};
const TV_META = {
  [E.EN_PROCESO]: { color: '#f59e0b', icon: '⚙' }, [E.P_VENDEDOR]: { color: '#d97706', icon: '👤' },
  [E.P_STOCK]: { color: '#b45309', icon: '📦' }, [E.P_RETIRO]: { color: '#92400e', icon: '🏬' },
  [E.SHIPPING]: { color: '#8b5cf6', icon: '📋' }, [E.CURRIER]: { color: '#7c3aed', icon: '🚛' },
  [E.EN_RUTA]: { color: '#06b6d4', icon: '🛣' }, [E.ENTREGADO]: { color: '#22c55e', icon: '✓' },
};

// ── Helpers de fecha (sin corrimiento de zona) ──────────────────────────────
const soloFecha = (v) => (v ? String(v).slice(0, 10) : '');
const aprobEfectiva = (r) => r.fecha_aprobacion_real || r.fecha_aprobacion || null;
function diffDias(a, b) {
  if (!a || !b) return null;
  const t1 = new Date(a).getTime(), t2 = new Date(b).getTime();
  if (isNaN(t1) || isNaN(t2)) return null;
  const d = (t2 - t1) / 86400000;
  return (d < 0 || d > 365) ? null : d;
}
function addBusinessDays(start, days) {
  const r = new Date(start); let added = 0; const dow = r.getDay();
  if (dow === 0) r.setDate(r.getDate() + 1); else if (dow === 6) r.setDate(r.getDate() + 2);
  while (added < days) { r.setDate(r.getDate() + 1); const d = r.getDay(); if (d !== 0 && d !== 6) added++; }
  return r;
}
function calcFechaCompromiso(aprob, aprobReal) {
  const base = aprobReal || aprob; if (!base) return '';
  const d = new Date(base + 'T12:00:00'); if (isNaN(d.getTime())) return '';
  const r = addBusinessDays(d, 2);
  return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, '0')}-${String(r.getDate()).padStart(2, '0')}`;
}
function promesaEfectiva(r) {
  const comp = r.fecha_compromiso || calcFechaCompromiso(r.fecha_aprobacion, r.fecha_aprobacion_real);
  if (!comp) return null;
  const aprob = aprobEfectiva(r); if (!aprob) return { fecha: comp, diasAtraso: 0 };
  const cMs = new Date(comp).getTime(), aMs = new Date(aprob).getTime();
  if (aMs > cMs) return { fecha: String(aprob).slice(0, 10), diasAtraso: Math.round((aMs - cMs) / 86400000) };
  return { fecha: comp, diasAtraso: 0 };
}
function inicioSemana(fechaStr) {
  const d = new Date(fechaStr + 'T12:00:00'); if (isNaN(d.getTime())) return '';
  const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const m = new Date(d.getFullYear(), d.getMonth(), diff);
  return isNaN(m.getTime()) ? '' : m.toISOString().split('T')[0];
}
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const canalDe = (r) => (r.nv_ptm ? 'PTM' : r.nv_orange ? 'Orange' : r.nv_farmapack ? 'Farmapack' : 'Varios');
const nvDe = (r) => (r.nv_ptm ? String(r.nv_ptm) : (r.nv_orange || r.nv_farmapack || r.varios || '—'));
const nvKey = (r) => {
  const nv = r.nv_ptm ? String(r.nv_ptm) : (r.nv_orange || r.nv_farmapack || r.varios || '');
  if (!nv) return '';
  const canal = r.nv_ptm ? 'ptm' : r.nv_orange ? 'orange' : r.nv_farmapack ? 'farmapack' : 'varios';
  return `${canal}:${nv}`;
};
const recencyScore = (r) => (
  Date.parse(r?.fecha_estado || '')
  || Date.parse(r?.fecha_aprobacion_real || '')
  || Date.parse(r?.fecha_aprobacion || '')
  || 0
);
function dedupeRowsByNv(rows) {
  const best = new Map();
  for (const r of rows) {
    const key = nvKey(r);
    if (!key) continue;
    const prev = best.get(key);
    if (!prev) { best.set(key, r); continue; }
    const ta = recencyScore(r);
    const tb = recencyScore(prev);
    if (ta > tb || (ta === tb && Number(r?.id || 0) > Number(prev?.id || 0))) best.set(key, r);
  }
  return Array.from(best.values());
}

// ── Carga cruda (paginada) con micro-caché de 30 s ──────────────────────────
const COLS = 'id,nv_ptm,nv_orange,nv_farmapack,varios,factura,guia,numero_envio,vendedor,cliente,centro_costo,division,transportista,empresa_transporte,tipo_despacho,estado,urgente,fecha_aprobacion,fecha_aprobacion_real,fecha_facturacion,fecha_despacho,fecha_compromiso,fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,valor_factura,costo_flete,valor_nv,bultos,dias_en_proceso,incidencia,estado_incidencia,observaciones_incidencia,dias_incidencia,fillrate';
let _cache = { at: 0, rows: null, sig: null };
// Invalida el micro-caché (se llama tras una escritura para que la próxima
// lectura traiga los datos frescos de inmediato).
export function invalidarCache() { _cache = { at: 0, rows: null, sig: null }; }

// ── Ámbito del usuario (Identity & Security · Fase 4/8) ─────────────────────
// Un usuario acotado a centro(s) de costo solo ve/consulta las N.V. de esos
// centros. Admin y usuarios GLOBALES ven todo (all=true). FAIL-OPEN: si la RPC
// falla, se asume acceso total (nunca ocultamos datos por un error). Como hoy
// nadie tiene ámbitos asignados, esto es no-op hasta que se asigne un rol
// acotado desde Admin → Ámbitos.
let _scope = { at: 0, val: null };
async function centrosPermitidos() {
  if (_scope.val && Date.now() - _scope.at < 300000) return _scope.val;
  let val = { all: true, codes: [] };
  try {
    const { data } = await supabase.rpc('iam_mis_scopes', { p_code: 'view_panel', p_scope_type: 'centro_costo' });
    if (data) val = { all: data.all !== false, codes: Array.isArray(data.codes) ? data.codes : [] };
  } catch { /* fail-open: acceso total */ }
  _scope = { at: Date.now(), val };
  return val;
}

export async function cargarRows(force = false) {
  const scope = await centrosPermitidos();
  const codes = (!scope.all && scope.codes.length) ? scope.codes : null;   // null = sin filtro
  const sig = codes ? codes.slice().sort().join('|') : '*';
  if (!force && _cache.rows && _cache.sig === sig && Date.now() - _cache.at < 30000) return _cache.rows;

  const all = []; let from = 0; const page = 1000;
  for (;;) {
    let q = supabase.from('tms_operaciones').select(COLS).range(from, from + page - 1);
    if (codes) q = q.in('centro_costo', codes);           // enforcement de ámbito
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < page) break;
    from += page;
  }
  const latest = dedupeRowsByNv(all);
  _cache = { at: Date.now(), rows: latest, sig };
  return latest;
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export async function getDashboard() {
  const rows = await cargarRows();
  const activas = rows.filter((r) => ACTIVOS.includes(r.estado));
  const entregadas = rows.filter((r) => ENTREGADOS.includes(r.estado));
  const ahoraMs = Date.now();

  // KPIs de canal
  const countNvPtm = rows.filter((r) => r.nv_ptm).length;
  const nvOrange = rows.filter((r) => r.nv_orange).length;
  const nvFarmapack = rows.filter((r) => r.nv_farmapack).length;
  const nvVarios = rows.filter((r) => r.varios).length;

  // A tiempo / tardanza (sobre entregadas con fechas)
  let tardSum = 0, tardN = 0, aTiempoN = 0;
  entregadas.forEach((r) => {
    if (!r.fecha_despacho) return;
    const p = promesaEfectiva(r); if (!p) return;
    const dd = (new Date(r.fecha_despacho).getTime() - new Date(p.fecha).getTime()) / 86400000;
    if (Math.abs(dd) > 30) return;
    if (dd > 0) { tardSum += dd; tardN++; } else aTiempoN++;
  });
  const leadTimeTardanza = tardN > 0 ? +(tardSum / tardN).toFixed(1) : 0;
  const pctAtiempo = (tardN + aTiempoN) > 0 ? +((aTiempoN / (tardN + aTiempoN)) * 100).toFixed(0) : 0;

  // Fill Rate (salió de En Proceso a tiempo)
  let frOk = 0, frNo = 0;
  rows.forEach((r) => {
    if (DESCARTE.includes(r.estado || '')) return;
    const p = promesaEfectiva(r); if (!p) return;
    const comp = new Date(p.fecha + 'T23:59:59').getTime();
    if (PRE_SHIPPING.includes(r.estado || '')) { if (ahoraMs > comp) frNo++; return; }
    const salida = r.fecha_shipping || r.fecha_en_ruta || r.fecha_entregado || r.fecha_despacho;
    if (!salida) return;
    if (new Date(salida).getTime() <= comp) frOk++; else frNo++;
  });
  const frEval = frOk + frNo;
  const fillRateShipping = { pct: frEval > 0 ? +((frOk / frEval) * 100).toFixed(0) : 0, evaluables: frEval };

  const kpis = {
    countNvPtm, nvOrange, nvFarmapack, nvVarios,
    activas: activas.length, entregadas: entregadas.length,
    leadTimeTardanza, pctAtiempo, fillRateShipping,
  };

  // Estado table (flujo)
  const estCount = {};
  rows.forEach((r) => { const e = r.estado || 'Sin estado'; if (FLUJO.includes(e)) estCount[e] = (estCount[e] || 0) + 1; });
  const estadoTable = FLUJO.filter((e) => estCount[e]).map((e) => ({ estado: e, count: estCount[e], badge: BADGE[e] || 'default' }));

  // Resumen (activos)
  const resumen = ACTIVOS.filter((e) => estCount[e]).map((e) => ({ estado: e, count: estCount[e] }));

  // Tiempos de ciclo
  const etDef = [
    { nombre: 'Aprobación → Shipping', from: (r) => aprobEfectiva(r), to: (r) => r.fecha_shipping },
    { nombre: 'Shipping → En Ruta', from: (r) => r.fecha_shipping, to: (r) => r.fecha_en_ruta },
    { nombre: 'En Ruta → Entregado', from: (r) => r.fecha_en_ruta, to: (r) => r.fecha_entregado },
  ];
  const etapas = etDef.map((def) => {
    let s = 0, n = 0;
    rows.forEach((r) => { const d = diffDias(def.from(r), def.to(r)); if (d !== null) { s += d; n++; } });
    return { nombre: def.nombre, dias: n > 0 ? +(s / n).toFixed(1) : 0, n };
  });
  let ltS = 0, ltN = 0;
  rows.forEach((r) => { const d = diffDias(aprobEfectiva(r), r.fecha_entregado || r.fecha_despacho); if (d !== null) { ltS += d; ltN++; } });
  const conDatos = etapas.filter((e) => e.dias > 0);
  const cuello = conDatos.length ? conDatos.reduce((m, e) => (e.dias > m.dias ? e : m)) : null;
  const tiempos = {
    leadTimeTotal: ltN > 0 ? +(ltS / ltN).toFixed(1) : 0, leadTimeTotalN: ltN, etapas,
    cuelloBotella: cuello ? { nombre: cuello.nombre, dias: cuello.dias } : null,
  };

  // Tendencia semanal (creadas vs entregadas) — últimas 6 semanas con datos
  const weeks = {};
  rows.forEach((r) => {
    const fa = aprobEfectiva(r); if (!fa) return;
    const wk = inicioSemana(soloFecha(fa)); if (!wk) return;
    if (!weeks[wk]) weeks[wk] = { creadas: 0, entregadas: 0 };
    weeks[wk].creadas++;
    if (ENTREGADOS.includes(r.estado)) weeks[wk].entregadas++;
  });
  const weekly = Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([wk, d]) => {
    const dt = new Date(wk + 'T12:00:00');
    return { semana: `${String(dt.getDate()).padStart(2, '0')}-${MESES[dt.getMonth()]}`, creadas: d.creadas, entregadas: d.entregadas };
  });

  // Lead time semanal (tardanza días) — 6 semanas
  const ltW = {};
  entregadas.forEach((r) => {
    if (!r.fecha_despacho) return; const fa = aprobEfectiva(r); if (!fa) return;
    const wk = inicioSemana(soloFecha(fa)); if (!wk) return;
    const p = promesaEfectiva(r); if (!p) return;
    const dd = (new Date(r.fecha_despacho).getTime() - new Date(p.fecha).getTime()) / 86400000;
    if (Math.abs(dd) > 30) return;
    if (!ltW[wk]) ltW[wk] = { s: 0, n: 0 };
    if (dd > 0) { ltW[wk].s += dd; ltW[wk].n++; }
  });
  const leadTime = Object.entries(ltW).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([wk, d]) => {
    const dt = new Date(wk + 'T12:00:00');
    return { semana: `${String(dt.getDate()).padStart(2, '0')}-${MESES[dt.getMonth()]}`, dias: d.n > 0 ? +(d.s / d.n).toFixed(1) : 0 };
  });

  // Ranking transportistas
  const tp = {};
  entregadas.forEach((r) => {
    const t = (r.transportista || '').trim(); if (!t) return;
    if (!tp[t]) tp[t] = { entregas: 0, aT: 0, n: 0 };
    tp[t].entregas++;
    if (r.fecha_despacho) { const p = promesaEfectiva(r); if (p) { const dd = (new Date(r.fecha_despacho).getTime() - new Date(p.fecha).getTime()) / 86400000; if (Math.abs(dd) <= 30) { tp[t].n++; if (dd <= 0) tp[t].aT++; } } }
  });
  const rankTransp = Object.entries(tp).map(([nombre, d]) => ({ nombre, entregas: d.entregas, atiempoPct: d.n > 0 ? +((d.aT / d.n) * 100).toFixed(0) : 0 }))
    .sort((a, b) => b.entregas - a.entregas).slice(0, 8);

  // Ranking vendedores
  const vp = {};
  rows.forEach((r) => {
    const v = (r.vendedor || '').trim(); if (!v) return;
    if (!vp[v]) vp[v] = { nv: 0, monto: 0 };
    vp[v].nv++; vp[v].monto += Number(r.valor_nv || 0);
  });
  const rankVend = Object.entries(vp).map(([nombre, d]) => ({ nombre, nv: d.nv, monto: Math.round(d.monto) }))
    .sort((a, b) => b.nv - a.nv).slice(0, 8);

  // Divisiones
  const dv = {};
  rows.forEach((r) => { const d = (r.division || 'SIN DIVISIÓN'); if (!dv[d]) dv[d] = { nv: 0, entregadas: 0 }; dv[d].nv++; if (ENTREGADOS.includes(r.estado)) dv[d].entregadas++; });
  const divisions = Object.entries(dv).map(([division, d]) => ({ division, nv: d.nv, entregadas: d.entregadas })).sort((a, b) => b.nv - a.nv).slice(0, 8);

  // Alertas operacionales (estancadas)
  const UMBRAL = { [E.EN_PROCESO]: 3, [E.P_VENDEDOR]: 3, [E.P_STOCK]: 3, [E.P_RETIRO]: 3, [E.SHIPPING]: 2, [E.CURRIER]: 2, [E.EN_RUTA]: 3 };
  const alertasOp = [];
  activas.forEach((r) => {
    const u = UMBRAL[r.estado] || 5; const ref = r.fecha_estado || r.fecha_registro_nv; if (!ref) return;
    const dias = Math.floor((ahoraMs - new Date(ref).getTime()) / 86400000);
    if (dias > u) alertasOp.push({ nv: nvDe(r), cliente: r.cliente || '—', estado: r.estado, dias, riesgo: dias > u * 2 ? 'alto' : 'medio' });
  });
  alertasOp.sort((a, b) => b.dias - a.dias);

  // Tendencia histórica (6 meses)
  const mm = {};
  rows.forEach((r) => {
    const fa = aprobEfectiva(r); if (!fa) return; const d = new Date(fa);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!mm[key]) mm[key] = { label: `${MESES[d.getMonth()]}`, entregadas: 0, otifC: 0, otifT: 0 };
    if (ENTREGADOS.includes(r.estado)) {
      mm[key].entregadas++;
      if (r.fecha_despacho) { const p = promesaEfectiva(r); if (p) { const dd = (new Date(r.fecha_despacho).getTime() - new Date(p.fecha).getTime()) / 86400000; if (Math.abs(dd) <= 30) { mm[key].otifT++; if (dd <= 0) mm[key].otifC++; } } }
    }
  });
  const tendencia = Object.entries(mm).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
    .map(([, m]) => ({ label: m.label, entregadas: m.entregadas, otif: m.otifT > 0 ? +((m.otifC / m.otifT) * 100).toFixed(0) : 0 }));

  // Calidad de datos
  const calTipo = {}; const calDet = [];
  const sumar = (t) => { calTipo[t] = (calTipo[t] || 0) + 1; };
  rows.forEach((r) => {
    const est = String(r.estado || '').trim();
    if (DESCARTE.includes(est) || ENTREGADOS.includes(est)) return;
    const probs = [];
    if (!est) { probs.push('Sin estado'); sumar('Sin estado'); }
    if (!r.cliente) { probs.push('Sin cliente'); sumar('Sin cliente'); }
    if (!r.vendedor) { probs.push('Sin vendedor'); sumar('Sin vendedor'); }
    if (!r.division) { probs.push('Sin división'); sumar('Sin división'); }
    if ([E.CURRIER, E.EN_RUTA].includes(est) && !r.transportista) { probs.push('Sin transportista'); sumar('Sin transportista'); }
    if (probs.length) calDet.push({ nv: nvDe(r), problema: probs[0], cliente: r.cliente || '—' });
  });
  const calidad = { total: calDet.length, porTipo: calTipo, detalle: calDet.slice(0, 50) };

  return { kpis, estadoTable, resumen, weekly, leadTime, rankTransp, rankVend, divisions, alertasOp: alertasOp.slice(0, 30), tendencia, calidad, tiempos };
}

// ── Detalle contextual (click en KPI/estado/canal) ──────────────────────────
export async function getDetalle(titulo, count) {
  const rows = await cargarRows();
  const t = String(titulo || '');
  let sel;
  if (['N° NV PTM', 'PTM'].includes(t)) sel = rows.filter((r) => r.nv_ptm);
  else if (['N.V Orange', 'Orange'].includes(t)) sel = rows.filter((r) => r.nv_orange);
  else if (['N.V Farmapack', 'Farmapack'].includes(t)) sel = rows.filter((r) => r.nv_farmapack);
  else if (['Varios'].includes(t)) sel = rows.filter((r) => r.varios);
  else if (t === 'NVs Activas') sel = rows.filter((r) => ACTIVOS.includes(r.estado));
  else if (t === 'A tiempo' || t === 'Entregas tardías') sel = rows.filter((r) => ENTREGADOS.includes(r.estado));
  else if (FLUJO.includes(t)) sel = rows.filter((r) => r.estado === t);
  else sel = rows.filter((r) => nvDe(r) === t); // por N.V. (alertas)
  if (!sel.length && count) sel = rows.slice(0, count);

  const mostrar = Math.min(sel.length, 8);
  const outRows = sel.slice(0, mostrar).map((r) => ({
    nv: nvDe(r), cliente: r.cliente || '—', vendedor: r.vendedor || '—', estado: r.estado || '—',
    fecha: soloFecha(aprobEfectiva(r)) || '—', monto: Number(r.valor_nv || 0),
  }));
  return { total: sel.length, mostrados: mostrar, rows: outRows };
}

// ── Info N.V. (buscador universal) ──────────────────────────────────────────
export async function buscarNV(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const rows = await cargarRows();
  return rows.filter((r) => [r.nv_ptm, r.nv_orange, r.nv_farmapack, r.varios, r.factura, r.guia, r.numero_envio, r.cliente, r.vendedor, r.transportista, r.estado]
    .filter(Boolean).some((v) => String(v).toLowerCase().includes(q)))
    .slice(0, 50)
    .map((r) => ({ ...r, nv: nvDe(r), canal: canalDe(r) }));
}

// ── Modo TV ──────────────────────────────────────────────────────────────────
export async function getTV() {
  const rows = await cargarRows();
  const activas = rows.filter((r) => ACTIVOS.includes(r.estado));
  const hoyMs = Date.now();
  const grupos = {};
  activas.forEach((r) => {
    const e = r.estado; if (!grupos[e]) grupos[e] = [];
    const ref = r.fecha_estado || r.fecha_registro_nv;
    const dias = ref ? Math.max(0, Math.floor((hoyMs - new Date(ref).getTime()) / 86400000)) : 0;
    grupos[e].push({ nv: nvDe(r), canal: canalDe(r), cliente: r.cliente || '—', vendedor: r.vendedor || '—', transportista: r.transportista || '—', urgente: r.urgente === true, dias });
  });
  const estados = ACTIVOS.filter((e) => (grupos[e]?.length || 0) > 0).map((e) => ({
    estado: e, color: TV_META[e]?.color || '#6b7280', icon: TV_META[e]?.icon || '•',
    nvs: grupos[e].sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0)), cantidad: grupos[e].length,
  }));
  const total = estados.reduce((a, e) => a + e.cantidad, 0);
  const urgentes = activas.filter((r) => r.urgente === true).map((r) => {
    const ref = r.fecha_estado || r.fecha_registro_nv;
    return { nv: nvDe(r), canal: canalDe(r), cliente: r.cliente || '—', vendedor: r.vendedor || '—', transportista: r.transportista || '—', urgente: true, dias: ref ? Math.max(0, Math.floor((hoyMs - new Date(ref).getTime()) / 86400000)) : 0 };
  });
  return { estados, total, urgentes };
}

// ── Catálogos (derivados de operaciones; los maestros llegan en fase posterior)
export async function getCatalogo(tipo) {
  const rows = await cargarRows();
  const campo = tipo === 'transportistas' ? 'transportista' : 'vendedor';
  const set = [...new Set(rows.map((r) => (r[campo] || '').trim()).filter(Boolean))].sort();
  return set.map((nombre) => ({ nombre, activo: true }));
}
