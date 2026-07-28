// ============================================================================
//  ingresarService — capa de datos del módulo Ingresar (paridad con /ingresar
//  del Panel), adaptada a CCO: lee `tms_operaciones` y escribe por las RPCs
//  (guardar_nv / cambiar_estado_nv / eliminar_nv / *_consolidado). SIN Apps
//  Script ni login propio: la autenticación es la de CCO (permiso manage_panel).
// ============================================================================
import { supabase } from '../../../supabase';
import { Logger } from '../../../lib/logger';

const OPERACIONES_READ_VIEW = 'tms_operaciones_vigentes';
const OPERACIONES_BASE_TABLE = 'tms_operaciones';
const ACTIVES_CACHE_TTL_MS = 60 * 1000;
const OPTIONS_CACHE_TTL_MS = 5 * 60 * 1000;
const SEARCH_CACHE_TTL_MS = 20 * 1000;
const LOOKUP_CACHE_TTL_MS = 3 * 60 * 1000;
const NV_CATALOGO_CACHE_TTL_MS = 5 * 60 * 1000;
const VENDEDORES_CACHE_TTL_MS = 10 * 60 * 1000;
let listaActivasCache = { ts: 0, data: null, promise: null };
let listaActivasPreviewCache = { ts: 0, data: null, promise: null };
let opcionesCache = { ts: 0, data: null, promise: null };
let opcionesBasicasCache = { ts: 0, data: null, promise: null };
let vendedoresCache = { ts: 0, data: null, promise: null };
const busquedaCache = new Map();
const lookupCache = new Map();
const nvCatalogoCache = new Map();

function resetIngresarCaches() {
  listaActivasCache = { ts: 0, data: null, promise: null };
  listaActivasPreviewCache = { ts: 0, data: null, promise: null };
  opcionesCache = { ts: 0, data: null, promise: null };
  opcionesBasicasCache = { ts: 0, data: null, promise: null };
  vendedoresCache = { ts: 0, data: null, promise: null };
  busquedaCache.clear();
  lookupCache.clear();
  nvCatalogoCache.clear();
}

function hasFreshCacheValue(entry, ttlMs) {
  return Boolean(entry) && Object.prototype.hasOwnProperty.call(entry, 'value') && (Date.now() - entry.ts) < ttlMs;
}

function getFreshMapCache(cache, key, ttlMs) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.promise) return entry.promise;
  if (hasFreshCacheValue(entry, ttlMs)) return entry.value;
  cache.delete(key);
  return null;
}

function setMapCacheValue(cache, key, value) {
  cache.set(key, { ts: Date.now(), value });
  return value;
}

function setMapCachePromise(cache, key, promise) {
  cache.set(key, { ts: Date.now(), promise });
  return promise;
}

function panelDuration(startedAt) {
  return Math.round(Math.max(0, performance.now() - startedAt));
}

function summarizeOperacionPayload(payload = {}) {
  return {
    id: payload?.id ?? null,
    mode: payload?.mode || null,
    canal: payload?.canal || null,
    nv: normNV(payload?.nv || ''),
    estado: payload?.estado || null,
    urgente: payload?.urgente === true,
    transportista: payload?.transportista || null,
    hasIncidencia: Boolean(String(payload?.incidencia || '').trim()),
    reabierta: payload?.reabierta === true,
  };
}

async function runPanelRead(action, fn, { screen = 'PanelIngresar', payload = null, slowMs = 900, message = '' } = {}) {
  const startedAt = performance.now();
  try {
    const result = await fn();
    const durationMs = panelDuration(startedAt);
    if (durationMs >= slowMs) {
      Logger.performance({
        module: 'panel',
        screen,
        action,
        message: message || `Operacion lenta de lectura: ${action}`,
        durationMs,
        status: 'ok',
        payload,
      });
    }
    return result;
  } catch (error) {
    Logger.error(error, {
      module: 'panel',
      screen,
      action,
      message: `Fallo operacion de lectura: ${action}`,
      durationMs: panelDuration(startedAt),
      status: 'error',
      payload,
    });
    throw error;
  }
}

async function runPanelMutation(action, fn, { screen = 'PanelIngresar', payload = null, message = '' } = {}) {
  const startedAt = performance.now();
  try {
    const result = await fn();
    const durationMs = panelDuration(startedAt);
    if (result?.ok === false) {
      Logger.error(new Error(result.error || result.message || `Operacion fallida: ${action}`), {
        module: 'panel',
        screen,
        action,
        message: `Operacion fallida: ${action}`,
        durationMs,
        status: 'failed',
        payload,
        context: {
          result,
        },
      });
      return result;
    }
    Logger.audit({
      module: 'panel',
      screen,
      action,
      message: message || `Operacion ejecutada: ${action}`,
      durationMs,
      status: 'ok',
      payload,
    });
    return result;
  } catch (error) {
    Logger.error(error, {
      module: 'panel',
      screen,
      action,
      message: `Fallo operacion critica: ${action}`,
      durationMs: panelDuration(startedAt),
      status: 'error',
      payload,
    });
    throw error;
  }
}

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

function operacionKey(r) {
  const canal = canalDe(r);
  const nv = nvDe(r);
  return nv ? `${canal}:${nv}` : '';
}

function splitSearchTerms(term) {
  return normWords(term).split(' ').filter(Boolean);
}

function buildOperacionSearchMeta(item) {
  const nv = normNV(item?.nv || '');
  const guia = normText(item?.guia || '');
  const factura = normText(item?.factura || '');
  const cliente = normWords(item?.cliente || '');
  const vendedor = normWords(item?.vendedor || '');
  const transportista = normWords(item?.transportista || '');
  const canal = normText(item?.canal || '');
  const estado = normText(item?.estado || '');
  const searchable = [nv, guia, factura, cliente, vendedor, transportista, canal, estado]
    .filter(Boolean)
    .join(' ');
  const words = new Set(searchable.split(' ').filter(Boolean));
  return { nv, guia, factura, cliente, vendedor, transportista, canal, estado, searchable, words };
}

function scoreOperacionSearch(item, rawTerm) {
  const safeTerm = String(rawTerm || '').trim();
  if (!safeTerm) return Number.NEGATIVE_INFINITY;
  const nvTerm = normNV(safeTerm);
  const textTerm = normText(safeTerm);
  const wordsTerm = normWords(safeTerm);
  const tokens = splitSearchTerms(safeTerm);
  const meta = buildOperacionSearchMeta(item);
  let score = 0;

  if (meta.nv && nvTerm) {
    if (meta.nv === nvTerm) score += 20000;
    else if (meta.nv.startsWith(nvTerm)) score += 12000;
    else if (meta.nv.includes(nvTerm)) score += 8000;
  }
  if (meta.guia && textTerm) {
    if (meta.guia === textTerm) score += 15000;
    else if (meta.guia.startsWith(textTerm)) score += 9000;
    else if (meta.guia.includes(textTerm)) score += 4500;
  }
  if (meta.factura && textTerm) {
    if (meta.factura === textTerm) score += 15000;
    else if (meta.factura.startsWith(textTerm)) score += 9000;
    else if (meta.factura.includes(textTerm)) score += 4500;
  }
  if (wordsTerm) {
    if (meta.cliente === wordsTerm) score += 7000;
    else if (meta.cliente.startsWith(wordsTerm)) score += 4800;
    else if (meta.cliente.includes(wordsTerm)) score += 2800;

    if (meta.vendedor === wordsTerm) score += 6500;
    else if (meta.vendedor.startsWith(wordsTerm)) score += 4400;
    else if (meta.vendedor.includes(wordsTerm)) score += 2400;

    if (meta.transportista === wordsTerm) score += 5000;
    else if (meta.transportista.startsWith(wordsTerm)) score += 3200;
    else if (meta.transportista.includes(wordsTerm)) score += 1800;
  }

  if (tokens.length > 0) {
    let matchedTokens = 0;
    tokens.forEach((token) => {
      if (meta.words.has(token)) {
        matchedTokens += 1;
        score += 950;
        return;
      }
      for (const word of meta.words) {
        if (word.startsWith(token)) {
          matchedTokens += 0.6;
          score += 360;
          return;
        }
      }
      if (meta.searchable.includes(token)) score += 120;
    });
    if (matchedTokens >= tokens.length) score += 1600;
  }

  if (textTerm && meta.searchable.includes(textTerm)) score += 600;
  if (item?.urgente) score += 45;
  score += Math.min(recencyScore(item) / 1000000000, 120);
  return score;
}

function dedupeRankedItems(rows, term, limit = 200) {
  const ranked = new Map();
  (rows || []).forEach((item) => {
    if (!item?.key) return;
    const score = scoreOperacionSearch(item, term);
    if (!Number.isFinite(score) || score <= 0) return;
    const prev = ranked.get(item.key);
    if (!prev || score > prev.score || (score === prev.score && recencyScore(item) > recencyScore(prev.item))) {
      ranked.set(item.key, { item, score });
    }
  });
  return Array.from(ranked.values())
    .sort((a, b) => (b.score - a.score) || (recencyScore(b.item) - recencyScore(a.item)))
    .slice(0, limit)
    .map(({ item }) => item);
}

function recencyScore(r) {
  return (
    Date.parse(r?.fecha_estado || '')
    || Date.parse(r?.fecha_aprobacion_real || '')
    || Date.parse(r?.fecha_aprobacion || '')
    || 0
  );
}

function isMoreRecentOperacion(next, prev) {
  const a = recencyScore(next);
  const b = recencyScore(prev);
  if (a !== b) return a > b;
  return Number(next?.id || 0) > Number(prev?.id || 0);
}

export async function listaActivas({ force = false, full = true, limit = 400 } = {}) {
  return runPanelRead('lista_activas', async () => {
  const now = Date.now();
  const targetCache = full ? listaActivasCache : listaActivasPreviewCache;
  if (!force && targetCache.data && (now - targetCache.ts) < ACTIVES_CACHE_TTL_MS) {
    return targetCache.data;
  }
  if (!force && targetCache.promise) {
    return targetCache.promise;
  }

  const run = async () => {
    if (!full) {
      const { data, error } = await supabase
        .from(OPERACIONES_READ_VIEW)
        .select(LISTA_COLS)
        .in('estado', ESTADOS_ACTIVOS)
        .order('fecha_estado', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false })
        .limit(limit);
      if (error) throw error;
      const mappedPreview = (data || []).map(mapOperacionRow);
      listaActivasPreviewCache = { ts: Date.now(), data: mappedPreview, promise: null };
      return mappedPreview;
    }

    const rows = [];
    let from = 0;
    const page = 500;
    for (;;) {
      const { data, error } = await supabase
        .from(OPERACIONES_READ_VIEW)
        .select(LISTA_COLS)
        .in('estado', ESTADOS_ACTIVOS)
        .order('fecha_estado', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false })
        .range(from, from + page - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      rows.push(...data);
      if (data.length < page) break;
      from += page;
    }
    const mapped = rows.map(mapOperacionRow);
    listaActivasCache = { ts: Date.now(), data: mapped, promise: null };
    return mapped;
  };

  targetCache.promise = run()
    .catch((error) => {
      targetCache.promise = null;
      throw error;
    });
  return targetCache.promise;
  }, {
    payload: { force, full, limit: full ? null : limit },
    slowMs: 700,
    message: 'Carga de N.V. activas del Panel',
  });
}

// Búsqueda en TODA la tabla (cualquier estado: incluye Entregado/NULA/etc.) por
// nº de N.V., cliente, vendedor, guía, factura o transportista. Sirve para que
// en Buscar se pueda encontrar y abrir una N.V. ya entregada o cerrada, que la
// lista de "activas" no muestra. Devuelve el mismo shape que listaActivas.
export async function buscarOperaciones(term, { limit = 300 } = {}) {
  return runPanelRead('buscar_operaciones', async () => {
  const t = String(term || '').trim();
  if (t.length < 2) return [];
  const cacheKey = `${limit}:${normWords(t) || normText(t)}`;
  const cached = getFreshMapCache(busquedaCache, cacheKey, SEARCH_CACHE_TTL_MS);
  if (cached) return cached;
  // PostgREST .or() usa comas/paréntesis como separadores → se neutralizan.
  const safe = t.replace(/[(),*]/g, ' ').trim();
  if (!safe) return [];
  const run = async () => {
    if (/^\d{4,}$/.test(safe)) {
      const exactRows = await Promise.all([
        supabase.from(OPERACIONES_BASE_TABLE).select(LISTA_COLS).eq('nv_ptm', Number(safe)).order('fecha_estado', { ascending: false, nullsFirst: false }).order('id', { ascending: false }).limit(1),
        supabase.from(OPERACIONES_BASE_TABLE).select(LISTA_COLS).eq('nv_orange', safe).order('fecha_estado', { ascending: false, nullsFirst: false }).order('id', { ascending: false }).limit(1),
        supabase.from(OPERACIONES_BASE_TABLE).select(LISTA_COLS).eq('nv_farmapack', safe).order('fecha_estado', { ascending: false, nullsFirst: false }).order('id', { ascending: false }).limit(1),
        supabase.from(OPERACIONES_BASE_TABLE).select(LISTA_COLS).eq('varios', safe).order('fecha_estado', { ascending: false, nullsFirst: false }).order('id', { ascending: false }).limit(1),
      ]);
      const exactErrors = exactRows.find((result) => result.error);
      if (exactErrors?.error) throw exactErrors.error;
      const exactMapped = dedupeRankedItems(
        exactRows.flatMap((result) => (result.data || []).map(mapOperacionRow)),
        t,
        Math.min(limit, 20)
      );
      if (exactMapped.length) {
        return setMapCacheValue(busquedaCache, cacheKey, exactMapped);
      }
    }

    const like = `*${safe}*`;
    const ors = [];
    if (/^\d+$/.test(safe)) ors.push(`nv_ptm.eq.${Number(safe)}`);
    ors.push(
      `nv_orange.ilike.${like}`, `nv_farmapack.ilike.${like}`, `varios.ilike.${like}`,
      `cliente.ilike.${like}`, `vendedor.ilike.${like}`, `guia.ilike.${like}`,
      `factura.ilike.${like}`, `transportista.ilike.${like}`,
    );
    let data = null;
    let error = null;
    ({ data, error } = await supabase.from(OPERACIONES_READ_VIEW).select(LISTA_COLS)
      .or(ors.join(',')).order('fecha_estado', { ascending: false, nullsFirst: false }).limit(limit));
    if (error) {
      const softLimit = Math.min(limit, 60);
      const prefix = `${safe}*`;
      const candidates = await Promise.allSettled([
        /^\d+$/.test(safe)
          ? supabase.from(OPERACIONES_READ_VIEW).select(LISTA_COLS).eq('nv_ptm', Number(safe)).limit(softLimit)
          : Promise.resolve({ data: [] }),
        supabase.from(OPERACIONES_READ_VIEW).select(LISTA_COLS).ilike('nv_orange', prefix).limit(softLimit),
        supabase.from(OPERACIONES_READ_VIEW).select(LISTA_COLS).ilike('nv_farmapack', prefix).limit(softLimit),
        supabase.from(OPERACIONES_READ_VIEW).select(LISTA_COLS).ilike('varios', prefix).limit(softLimit),
        supabase.from(OPERACIONES_READ_VIEW).select(LISTA_COLS).ilike('guia', prefix).limit(softLimit),
        supabase.from(OPERACIONES_READ_VIEW).select(LISTA_COLS).ilike('factura', prefix).limit(softLimit),
        safe.length >= 4
          ? supabase.from(OPERACIONES_READ_VIEW).select(LISTA_COLS).ilike('cliente', prefix).limit(softLimit)
          : Promise.resolve({ data: [] }),
      ]);
      const fallbackRows = candidates
        .filter((entry) => entry.status === 'fulfilled' && Array.isArray(entry.value?.data))
        .flatMap((entry) => entry.value.data || []);
      if (fallbackRows.length) {
        data = fallbackRows;
        error = null;
      } else {
        throw error;
      }
    }
    const dedup = new Map();
    (data || []).forEach((r) => {
      const nv = nvDe(r); if (!nv) return;
      const key = `${canalDe(r)}:${nv}`;
      if (!dedup.has(key)) dedup.set(key, mapOperacionRow(r));
    });
    const ranked = dedupeRankedItems(Array.from(dedup.values()), t, limit);
    return setMapCacheValue(busquedaCache, cacheKey, ranked);
  };

  const promise = run().catch((error) => {
    busquedaCache.delete(cacheKey);
    throw error;
  });
  return setMapCachePromise(busquedaCache, cacheKey, promise);
  }, {
    payload: { term: String(term || '').trim(), limit },
    slowMs: 450,
    message: 'Busqueda remota de operaciones del Panel',
  });
}

export function buscarOperacionesUltraLocal(rows, term, { limit = 120 } = {}) {
  const t = String(term || '').trim();
  if (t.length < 2) return [];
  return dedupeRankedItems(rows || [], t, limit);
}

export function fusionarResultadosBusqueda(localRows, remoteRows, term, { limit = 160 } = {}) {
  return dedupeRankedItems([...(localRows || []), ...(remoteRows || [])], term, limit);
}

// ── Opciones del formulario ─────────────────────────────────────────────────
export async function opciones({ force = false, includeHistoricos = false } = {}) {
  return runPanelRead('cargar_opciones', async () => {
  const now = Date.now();
  const targetCache = includeHistoricos ? opcionesCache : opcionesBasicasCache;
  if (!force && targetCache.data && (now - targetCache.ts) < OPTIONS_CACHE_TTL_MS) {
    return targetCache.data;
  }
  if (!force && targetCache.promise) {
    return targetCache.promise;
  }

  const run = async () => {
  const set = new Set();
  // 1) Catálogo maestro (Configuración → Transportistas): fuente mantenida.
  const { data: cat } = await supabase.from('tms_panel_transportistas')
    .select('nombre').eq('activo', true).order('nombre', { ascending: true });
  (cat || []).forEach((r) => { const t = (r.nombre || '').trim(); if (t) set.add(t); });
  if (includeHistoricos) {
    let from = 0; const page = 1000;
    for (;;) {
      const { data, error } = await supabase.from(OPERACIONES_READ_VIEW)
        .select('transportista').not('transportista', 'is', null)
        .order('id', { ascending: true }).range(from, from + page - 1);
      if (error || !data || data.length === 0) break;
      data.forEach((r) => { const t = (r.transportista || '').trim(); if (t) set.add(t); });
      if (data.length < page) break;
      from += page;
    }
  }
  const transportistas = [...set].sort((a, b) => a.localeCompare(b, 'es'));
    const result = { estados: ESTADOS_SELECCIONABLES, transportistas, tiposDespacho: TIPOS_DESPACHO };
    targetCache.data = result;
    targetCache.ts = Date.now();
    targetCache.promise = null;
    return result;
  };

  targetCache.promise = run()
    .catch((error) => {
      targetCache.promise = null;
      throw error;
    });
  return targetCache.promise;
  }, {
    payload: { force, includeHistoricos },
    slowMs: 1200,
    message: 'Carga de opciones del formulario Panel',
  });
}

// ── Lookup de una N.V. (preview para editar) ────────────────────────────────
const PREVIEW = 'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,centro_costo,division,estado,transportista,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_facturacion,fecha_despacho,fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,factura,guia,bultos,valor_factura,numero_envio,urgente,incidencia,estado_incidencia,observaciones_incidencia,reabierta,fecha_reapertura,motivo_reapertura';
// Catálogo maestro NV → cliente/vendedor (hojas CARGA). Fuente precisa.
export async function buscarNvCatalogo(canal, nv) {
  const t = normNV(nv); if (!t) return null;
  const cacheKey = `${String(canal).toLowerCase()}:${t}`;
  const cached = getFreshMapCache(nvCatalogoCache, cacheKey, NV_CATALOGO_CACHE_TTL_MS);
  if (cached) return cached;
  const run = async () => {
    const { data } = await supabase.from('tms_nv_catalogo')
      .select('cliente, vendedor, fecha_aprobacion, centro_costo, division')
      .eq('canal', String(canal).toLowerCase()).eq('nv', t).limit(1);
    return setMapCacheValue(nvCatalogoCache, cacheKey, (data && data[0]) || null);
  };
  const promise = run().catch((error) => {
    nvCatalogoCache.delete(cacheKey);
    throw error;
  });
  return setMapCachePromise(nvCatalogoCache, cacheKey, promise);
}

// Cascada CENTRO COSTOS: vendedor → centro de costo + división.
// Cruce tolerante a mayúsculas/espacios (ilike sobre el nombre ya recortado).
async function cargarVendedoresActivos() {
  const now = Date.now();
  if (vendedoresCache.data && (now - vendedoresCache.ts) < VENDEDORES_CACHE_TTL_MS) {
    return vendedoresCache.data;
  }
  if (vendedoresCache.promise) {
    return vendedoresCache.promise;
  }

  const run = async () => {
    const { data } = await supabase.from('tms_panel_vendedores')
      .select('nombre, centro_costo, division').eq('activo', true).order('nombre', { ascending: true });
    const rows = data || [];
    vendedoresCache = { ts: Date.now(), data: rows, promise: null };
    return rows;
  };

  vendedoresCache.promise = run().catch((error) => {
    vendedoresCache.promise = null;
    throw error;
  });
  return vendedoresCache.promise;
}

export async function costoDeVendedor(vendedor) {
  const v = String(vendedor || '').trim(); if (!v) return null;
  const data = await cargarVendedoresActivos();
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
  return runPanelRead('lookup_nv', async () => {
  const t = normNV(nv);
  if (!t) return { found: false, autoFill: { cliente: '', vendedor: '', ccosto: '', division: '' } };
  const cacheKey = `${String(canal).toLowerCase()}:${t}`;
  const cached = getFreshMapCache(lookupCache, cacheKey, LOOKUP_CACHE_TTL_MS);
  if (cached) return cached;

  const run = async () => {
    const col = colDe(canal);
    let q = supabase.from(OPERACIONES_READ_VIEW).select(PREVIEW).order('fecha_estado', { ascending: false }).limit(1);
    q = canal === 'ptm' && /^\d+$/.test(t) ? q.eq(col, Number(t)) : q.eq(col, t);
    const [{ data }, cat] = await Promise.all([q, buscarNvCatalogo(canal, t)]);
    const r = data && data.length ? data[0] : null;

    const cliente = r?.cliente || cat?.cliente || '';
    const vendedor = r?.vendedor || cat?.vendedor || '';
    let ccosto = r?.centro_costo || cat?.centro_costo || '';
    let division = r?.division || cat?.division || '';
    if (vendedor && (!ccosto || !division)) {
      const vc = await costoDeVendedor(vendedor);
      if (vc) { ccosto = ccosto || vc.centro_costo || ''; division = division || vc.division || ''; }
    }

    if (r) {
      const result = {
        found: true, row: r.id,
        data: {
          ...r, canal, nv: nvDe(r), estado: r.estado, cliente, vendedor, ccosto, division,
          fecha_compromiso: soloFecha(r.fecha_compromiso), fecha_registro_nv: soloFecha(r.fecha_registro_nv),
        },
      };
      return setMapCacheValue(lookupCache, cacheKey, result);
    }
    return setMapCacheValue(lookupCache, cacheKey, { found: false, autoFill: { cliente, vendedor, ccosto, division } });
  };

  const promise = run().catch((error) => {
    lookupCache.delete(cacheKey);
    throw error;
  });
  return setMapCachePromise(lookupCache, cacheKey, promise);
  }, {
    payload: { canal, nv: normNV(nv) },
    slowMs: 550,
    message: 'Lookup de N.V. en Panel',
  });
}

export async function lookupById(id, { canal = null, nv = null } = {}) {
  return runPanelRead('lookup_nv_by_id', async () => {
    if (!id) return lookup(canal, nv);
    const { data, error } = await supabase
      .from(OPERACIONES_BASE_TABLE)
      .select(PREVIEW)
      .eq('id', id)
      .limit(1);
    if (error) throw error;
    const row = data && data.length ? data[0] : null;
    if (!row) return lookup(canal, nv);

    const normalizedCanal = canal || canalDe(row);
    const normalizedNv = nv || nvDe(row);
    const cat = await buscarNvCatalogo(normalizedCanal, normalizedNv);
    const cliente = row?.cliente || cat?.cliente || '';
    const vendedor = row?.vendedor || cat?.vendedor || '';
    let ccosto = row?.centro_costo || cat?.centro_costo || '';
    let division = row?.division || cat?.division || '';
    if (vendedor && (!ccosto || !division)) {
      const vc = await costoDeVendedor(vendedor);
      if (vc) {
        ccosto = ccosto || vc.centro_costo || '';
        division = division || vc.division || '';
      }
    }
    const result = {
      found: true,
      row: row.id,
      data: {
        ...row,
        canal: normalizedCanal,
        nv: normalizedNv,
        estado: row.estado,
        cliente,
        vendedor,
        ccosto,
        division,
        fecha_compromiso: soloFecha(row.fecha_compromiso),
        fecha_registro_nv: soloFecha(row.fecha_registro_nv),
      },
    };
    return result;
  }, {
    payload: { id, canal, nv: normNV(nv) },
    slowMs: 350,
    message: 'Lookup de N.V. por id en Panel',
  });
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

// ── Export a Excel del maestro vigente de N.V. ───────────────────────────────
// Expone una sola fila actual por N.V. para evitar inconsistencias por
// historial multi-fila en `tms_operaciones`.
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
  return runPanelRead('exportar_operaciones', async () => {
  const cols = EXPORT_COLS.map((c) => c[0]).join(',');
  // Orden estable por id de la fila vigente. La descarga es SOLO LECTURA: no
  // toca ni bloquea la tabla base, así el llenado desde Ingresar sigue normal.
  const all = []; let from = 0; const page = 1000;
  for (;;) {
    const { data, error } = await supabase.from(OPERACIONES_READ_VIEW).select(cols).order('id', { ascending: true }).range(from, from + page - 1);
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
  }, {
    payload: { scope: 'maestro_vigente' },
    slowMs: 1800,
    message: 'Exportacion de operaciones vigentes',
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
  return runPanelMutation('guardar_nv', async () => {
    const { data, error } = await supabase.rpc('guardar_nv', { p });
    const result = rpcResult(data, error);
    if (result?.ok !== false) resetIngresarCaches();
    return result;
  }, {
    payload: summarizeOperacionPayload(p),
    message: 'Guardado de N.V. en Panel',
  });
}
export async function puedeEditarOperacion(id) {
  if (!id) return { permitida: false, message: 'N.V. no encontrada.' };
  const { data, error } = await supabase.rpc('iam_puede_editar_nv', { p_id: id });
  if (error) return { permitida: false, message: error.message || 'No se pudo validar el acceso IAM.' };
  return data || { permitida: false, message: 'No se pudo validar el acceso IAM.' };
}
export async function puedeCambiarEstadoOperacion(id, estado = null) {
  if (!id) return { permitida: false, message: 'N.V. no encontrada.' };
  const { data, error } = await supabase.rpc('iam_puede_cambiar_estado_nv', { p_id: id, p_estado: estado });
  if (error) return { permitida: false, message: error.message || 'No se pudo validar la transición de estado.' };
  return data || { permitida: false, message: 'No se pudo validar la transición de estado.' };
}
export async function cambiarEstado(id, estado, urgente = null) {
  return runPanelMutation('cambiar_estado_nv', async () => {
    const { data, error } = await supabase.rpc('cambiar_estado_nv', { p_id: id, p_estado: estado, p_urgente: urgente });
    const result = rpcResult(data, error);
    if (result?.ok !== false) resetIngresarCaches();
    return result;
  }, {
    payload: { id, estado, urgente },
    message: 'Cambio de estado de N.V. en Panel',
  });
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
  return runPanelMutation('actualizar_campos_nv', async () => {
    const { data, error } = await supabase.rpc('guardar_nv', { p });
    const result = rpcResult(data, error);
    if (result?.ok !== false) resetIngresarCaches();
    return result;
  }, {
    payload: {
      id,
      fields: Object.keys(dirty || {}),
    },
    message: 'Actualizacion parcial de N.V. en Panel',
  });
}

export async function listarSolicitudesReapertura(operacionId) {
  return runPanelRead('listar_reaperturas_nv', async () => {
    if (!operacionId) return [];
    const { data, error } = await supabase
      .from('tms_nv_reaperturas')
      .select('id, operacion_id, nv, canal, estado_origen, motivo, estado, solicitada_por, solicitada_por_nombre, solicitada_at, resuelta_por, resuelta_por_nombre, resuelta_at, observacion_resolucion')
      .eq('operacion_id', operacionId)
      .order('solicitada_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }, {
    payload: { operacionId },
    slowMs: 450,
    message: 'Consulta de historial de reaperturas',
  });
}

export async function solicitarReapertura(id, motivo) {
  return runPanelMutation('solicitar_reapertura_nv', async () => {
    const { data, error } = await supabase.rpc('solicitar_reapertura_nv', { p_operacion_id: id, p_motivo: motivo });
    return rpcResult(data, error);
  }, {
    payload: { id, motivoLength: String(motivo || '').trim().length },
    message: 'Solicitud de reapertura de N.V.',
  });
}

export async function resolverReapertura(requestId, aprobar, observacion = '') {
  return runPanelMutation('resolver_reapertura_nv', async () => {
    const { data, error } = await supabase.rpc('resolver_reapertura_nv', {
      p_request_id: requestId,
      p_aprobar: aprobar,
      p_observacion: observacion || null,
    });
    return rpcResult(data, error);
  }, {
    payload: {
      requestId,
      aprobar,
      observacionLength: String(observacion || '').trim().length,
    },
    message: 'Resolucion de solicitud de reapertura',
  });
}
export async function eliminar(id) {
  return runPanelMutation('eliminar_nv', async () => {
    const { data, error } = await supabase.rpc('eliminar_nv', { p_id: id });
    const result = rpcResult(data, error);
    if (result?.ok !== false) resetIngresarCaches();
    return result;
  }, {
    payload: { id },
    message: 'Eliminacion de N.V. en Panel',
  });
}

// ── Consolidados ─────────────────────────────────────────────────────────────
export async function listarConsolidados() {
  return runPanelRead('listar_consolidados', async () => {
    const [{ data: cons }, { data: nvs }] = await Promise.all([
      supabase.from('tms_consolidados').select('id, ticket, fecha_comprometida, estado, observacion, created_by, created_at').order('id', { ascending: false }),
      supabase.from('tms_consolidado_nvs').select('id, consolidado_id, nv, canal, cliente'),
    ]);
    const byId = {};
    (nvs || []).forEach((n) => { (byId[n.consolidado_id] = byId[n.consolidado_id] || []).push({ id: n.id, nv: n.nv, canal: n.canal, cliente: n.cliente }); });
    return (cons || []).map((c) => ({ ...c, nvs: byId[c.id] || [] }));
  }, {
    payload: { feature: 'consolidados' },
    slowMs: 700,
    message: 'Carga de consolidados del Panel',
  });
}
export async function guardarConsolidado(p) {
  return runPanelMutation('guardar_consolidado', async () => {
    const { data, error } = await supabase.rpc('guardar_consolidado', { p });
    if (error) return { ok: false, error: error.message };
    return data || { ok: true };
  }, {
    payload: {
      id: p?.id ?? null,
      ticket: p?.ticket || '',
      nvs: Array.isArray(p?.nvs) ? p.nvs.length : 0,
    },
    message: 'Guardado de consolidado',
  });
}
export async function eliminarConsolidado(id) {
  return runPanelMutation('eliminar_consolidado', async () => {
    const { data, error } = await supabase.rpc('eliminar_consolidado', { p_id: id });
    if (error) return { ok: false, error: error.message };
    return data || { ok: true };
  }, {
    payload: { id },
    message: 'Eliminacion de consolidado',
  });
}
// Valida una N.V. (para armar consolidados): busca en los 4 canales.
export async function buscarNvBasico(nv) {
  return runPanelRead('buscar_nv_basico', async () => {
    const t = String(nv).trim(); if (!t) return null;
    const ors = [];
    if (/^\d+$/.test(t)) ors.push(`nv_ptm.eq.${Number(t)}`);
    ors.push(`nv_orange.eq.${t}`, `nv_farmapack.eq.${t}`, `varios.ilike.*${t}*`);
    const { data } = await supabase.from(OPERACIONES_READ_VIEW).select('nv_ptm,nv_orange,nv_farmapack,varios,cliente,estado,fecha_estado').or(ors.join(',')).order('fecha_estado', { ascending: false }).limit(1);
    if (!data || data.length === 0) return null;
    const r = data[0];
    return { nv: nvDe(r), canal: canalDe(r), cliente: r.cliente || null, estado: r.estado || null };
  }, {
    payload: { nv: String(nv || '').trim() },
    slowMs: 400,
    message: 'Busqueda basica de N.V. para consolidados',
  });
}
