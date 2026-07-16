import { supabase } from '../../../supabase';
import { ESTADOS, ESTADO_MIGRACION, calcFechaCompromiso, soloFecha } from './dashHelpers';

function fechaAprobEfectiva(r) {
  return r.fecha_aprobacion_real || r.fecha_aprobacion || null;
}

// ¿La NV cae dentro del rango de fechas del dashboard, por su fecha de
// aprobación efectiva (real > sistema)?
function dentroRangoAprob(r, from, to) {
  if (!from || !to) return true;
  const f = fechaAprobEfectiva(r);
  if (!f) return false;
  const key = String(f).slice(0, 10);
  return key >= from && key <= to;
}

// Días entre dos fechas (b - a). Descarta nulos, fechas inválidas, negativos
// y outliers > 365 días (datos sucios) para no contaminar los promedios.
function diffDias(a, b) {
  if (!a || !b) return null;
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  if (isNaN(t1) || isNaN(t2)) return null;
  const d = (t2 - t1) / (1000 * 60 * 60 * 24);
  if (d < 0 || d > 365) return null;
  return d;
}

// Tiempos de ciclo a partir de las columnas de fecha por estado (no del AUDIT).
function calcularTiemposCiclo(rows) {
  const etapasDef = [
    { nombre: "En Proceso → Shipping", from: (r) => fechaAprobEfectiva(r), to: (r) => r.fecha_shipping },
    { nombre: "Shipping → En Ruta", from: (r) => r.fecha_shipping, to: (r) => r.fecha_en_ruta },
    { nombre: "En Ruta → Entregado", from: (r) => r.fecha_en_ruta, to: (r) => r.fecha_entregado },
  ];
  const etapas = etapasDef.map((def) => {
    let sum = 0, n = 0;
    rows.forEach((r) => {
      const d = diffDias(def.from(r), def.to(r));
      if (d !== null) { sum += d; n++; }
    });
    return { nombre: def.nombre, dias: n > 0 ? +(sum / n).toFixed(1) : null, n };
  });

  // Lead time total: aprobación → entregado (fallback: despacho).
  let ltSum = 0, ltN = 0;
  rows.forEach((r) => {
    const fin = r.fecha_entregado || r.fecha_despacho;
    const d = diffDias(fechaAprobEfectiva(r), fin);
    if (d !== null) { ltSum += d; ltN++; }
  });
  const leadTimeTotal = ltN > 0 ? +(ltSum / ltN).toFixed(1) : null;

  // Cuello de botella: etapa con mayor promedio de días.
  const conDatos = etapas.filter((e) => e.dias !== null);
  const cuelloBotella = conDatos.length > 0
    ? conDatos.reduce((max, e) => (e.dias > max.dias ? e : max))
    : null;

  return {
    etapas,
    leadTimeTotal,
    leadTimeTotalN: ltN,
    cuelloBotella: cuelloBotella ? { nombre: cuelloBotella.nombre, dias: cuelloBotella.dias } : null,
  };
}

const ESTADOS_DESCARTADOS = ["NULA", "REFACTURADO", "RECHAZADO"];

// Migración estados viejos → nuevos: reusa la SSOT. `normalizaEstado` conserva
// null (a diferencia de `normEstado`) porque varios cálculos lo esperan.
function normalizaEstado(estado) {
  if (!estado) return estado;
  return ESTADO_MIGRACION[estado] || estado;
}

const ESTADOS_PENDIENTES = [ESTADOS.P_VENDEDOR, ESTADOS.P_STOCK, ESTADOS.P_RETIRO];
const ESTADOS_PRE_SHIPPING = [ESTADOS.EN_PROCESO, ...ESTADOS_PENDIENTES];
const ESTADOS_ACTIVOS = [ESTADOS.EN_PROCESO, ...ESTADOS_PENDIENTES, ESTADOS.SHIPPING, ESTADOS.CURRIER, ESTADOS.EN_RUTA];
const ESTADOS_DESPACHADOS = [ESTADOS.CURRIER, ESTADOS.EN_RUTA, ESTADOS.ENTREGADO];
const ESTADOS_ENTREGADOS = [ESTADOS.ENTREGADO];
const ESTADOS_FLUJO = [
  ESTADOS.EN_PROCESO, ESTADOS.P_VENDEDOR, ESTADOS.P_STOCK, ESTADOS.P_RETIRO,
  ESTADOS.SHIPPING, ESTADOS.CURRIER, ESTADOS.EN_RUTA, ESTADOS.ENTREGADO,
];

const ESTADOS_VALIDOS = [
  ...ESTADOS_FLUJO,
  "NULA", "REFACTURADO", "RECHAZADO",
];

// Fecha en que la NV dejó "En Proceso" (cambió a CUALQUIER otro estado).
function fechaSalidaProceso(r) {
  return r.fecha_shipping || r.fecha_en_ruta || r.fecha_entregado || r.fecha_despacho || null;
}

// Fecha promesa efectiva para logística: MAX(compromiso, aprobación).
function fechaPromesaEfectiva(r) {
  const comp = r.fecha_compromiso || calcFechaCompromiso(r.fecha_aprobacion, r.fecha_aprobacion_real);
  if (!comp) return null;
  const aprob = fechaAprobEfectiva(r);
  if (!aprob) return { fecha: comp, diasAtraso: 0 };
  const compMs = new Date(comp).getTime();
  const aprobMs = new Date(aprob).getTime();
  if (aprobMs > compMs) {
    const diasAtraso = Math.round((aprobMs - compMs) / (1000 * 60 * 60 * 24));
    return { fecha: aprob.split("T")[0], diasAtraso };
  }
  return { fecha: comp, diasAtraso: 0 };
}

function evaluaFillRate(r, hoyMs) {
  if (ESTADOS_DESCARTADOS.includes(r.estado || "")) return null;
  const promesa = fechaPromesaEfectiva(r);
  if (!promesa) return null;
  const comp = new Date(promesa.fecha + "T23:59:59").getTime();

  if (ESTADOS_PRE_SHIPPING.includes(r.estado || "")) {
    return hoyMs > comp ? false : null;
  }

  const salida = fechaSalidaProceso(r);
  if (!salida) return null;
  return new Date(salida).getTime() <= comp;
}

// Devuelve el lunes (YYYY-MM-DD) de la semana de `fechaStr`.
function inicioSemana(fechaStr) {
  const d = new Date(fechaStr + "T12:00:00");
  if (isNaN(d.getTime())) return "";
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  if (isNaN(monday.getTime())) return "";
  return monday.toISOString().split("T")[0];
}

const DASHBOARD_COLUMNS = "nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,division,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_en_proceso,incidencia,estado_incidencia,observaciones_incidencia,dias_incidencia,guia,factura,urgente";

async function fetchAll(columns, dateFrom, dateTo) {
  const allRows = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    let query = supabase
      .from('tms_operaciones')
      .select(columns)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (dateFrom && dateTo) {
      query = query.or(
        `and(fecha_aprobacion_real.gte.${dateFrom},fecha_aprobacion_real.lte.${dateTo}),` +
          `and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${dateFrom},fecha_aprobacion.lte.${dateTo})`
      );
    } else if (dateFrom) {
      query = query.or(
        `fecha_aprobacion_real.gte.${dateFrom},` +
          `and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${dateFrom})`
      );
    } else if (dateTo) {
      query = query.or(
        `fecha_aprobacion_real.lte.${dateTo},` +
          `and(fecha_aprobacion_real.is.null,fecha_aprobacion.lte.${dateTo})`
      );
    }
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return allRows;
}

// Valores CRUDOS en Supabase de los estados ACTIVOS (pendientes de avanzar).
const ESTADOS_DB_ACTIVOS = [
  ESTADOS.EN_PROCESO, "EN PROCESO",
  ESTADOS.P_VENDEDOR, ESTADOS.P_STOCK, ESTADOS.P_RETIRO,
  ESTADOS.SHIPPING, "SHIPPING", "EN SHIPPING",
  ESTADOS.CURRIER, "CURRIER",
  ESTADOS.EN_RUTA, "EN RUTA",
];

// Clave canal:nv de una fila cruda de `operaciones`.
function nvKey(r) {
  const canal = r.nv_ptm ? "ptm" : r.nv_orange ? "orange" : r.nv_farmapack ? "farmapack" : "varios";
  const nv = r.nv_ptm ? String(r.nv_ptm) : (r.nv_orange || r.nv_farmapack || r.varios || "");
  return `${canal}:${nv}`;
}

// Deduplica filas por canal:nv quedándose con la de `fecha_estado` MÁS RECIENTE.
function dedupePorNv(rows) {
  const best = new Map();
  for (const r of rows) {
    const key = nvKey(r);
    if (!key.endsWith(":")) {
      const prev = best.get(key);
      if (!prev) { best.set(key, r); continue; }
      const ta = Date.parse(r.fecha_estado || "") || 0;
      const tb = Date.parse(prev.fecha_estado || "") || 0;
      if (ta >= tb) best.set(key, r);
    } else {
      best.set(`__sinnv__${best.size}`, r);
    }
  }
  return Array.from(best.values());
}

// Trae TODAS las filas en estados activos, sin filtro de fecha.
async function fetchActivas(columns) {
  const allRows = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('tms_operaciones')
      .select(columns)
      .in("estado", ESTADOS_DB_ACTIVOS)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return columns === "*" || columns.includes("fecha_estado") ? dedupePorNv(allRows) : allRows;
}

// Estados CRUDOS visibles en la LISTA de /ingresar (pestaña Buscar).
const ESTADOS_DB_LISTA = [
  ESTADOS.EN_PROCESO, "EN PROCESO",
  ESTADOS.P_VENDEDOR, ESTADOS.P_STOCK, ESTADOS.P_RETIRO,
  ESTADOS.SHIPPING, "SHIPPING", "EN SHIPPING",
  ESTADOS.CURRIER, "CURRIER",
  ESTADOS.EN_RUTA, "EN RUTA",
];

// Fast-path: lee las NVs activas de la lista DIRECTO de Supabase.
export async function fetchActivasLista() {
  const cols = "nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,estado,transportista,fecha_compromiso,guia,factura,fecha_aprobacion,fecha_aprobacion_real";
  const allRows = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('tms_operaciones')
      .select(cols)
      .in("estado", ESTADOS_DB_LISTA)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  const mapped = allRows
    .map((r) => {
      const canal = r.nv_ptm ? "ptm" : r.nv_orange ? "orange" : r.nv_farmapack ? "farmapack" : "varios";
      const nv = r.nv_ptm ? String(r.nv_ptm) : (r.nv_orange || r.nv_farmapack || r.varios || "");
      return {
        canal,
        nv,
        cliente: r.cliente || "",
        vendedor: r.vendedor || "",
        estado: normalizaEstado(r.estado) || "",
        transportista: r.transportista || "",
        fecha_compromiso: soloFecha(r.fecha_compromiso) || calcFechaCompromiso(soloFecha(r.fecha_aprobacion), soloFecha(r.fecha_aprobacion_real)),
        guia: r.guia || "",
        factura: r.factura || "",
        fecha_aprobacion: soloFecha(r.fecha_aprobacion),
        fecha_aprobacion_real: soloFecha(r.fecha_aprobacion_real),
      };
    })
    .filter((x) => x.nv);

  // Deduplicar por canal:nv — quedarse con la fila más avanzada en el flujo.
  const ESTADOS_FLUJO_ORDEN = ESTADOS_FLUJO;
  const dedup = new Map();
  for (const item of mapped) {
    const key = `${item.canal}:${item.nv}`;
    const existing = dedup.get(key);
    if (!existing || ESTADOS_FLUJO_ORDEN.indexOf(item.estado) > ESTADOS_FLUJO_ORDEN.indexOf(existing.estado)) {
      dedup.set(key, item);
    }
  }
  return Array.from(dedup.values());
}

// ===================== Consolidados =====================
export async function fetchConsolidados() {
  const [{ data: cons, error: e1 }, { data: nvs, error: e2 }] = await Promise.all([
    supabase.from("consolidados").select("id, ticket, fecha_comprometida, estado, observacion, created_by, created_at").order("id", { ascending: false }),
    supabase.from("consolidado_nvs").select("id, consolidado_id, nv, canal, cliente"),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  const byId = {};
  (nvs || []).forEach((n) => { (byId[n.consolidado_id] = byId[n.consolidado_id] || []).push({ id: n.id, nv: n.nv, canal: n.canal, cliente: n.cliente }); });
  return (cons || []).map((c) => ({ ...c, nvs: byId[c.id] || [] }));
}

// Valida una NV contra operaciones (busca en los 4 canales).
export async function buscarNvBasico(nv) {
  const t = nv.trim();
  if (!t) return null;
  const ors = [];
  if (/^\d+$/.test(t)) ors.push(`nv_ptm.eq.${Number(t)}`);
  ors.push(`nv_orange.eq.${t}`, `nv_farmapack.eq.${t}`, `varios.ilike.*${t}*`);
  const { data, error } = await supabase
    .from('tms_operaciones')
    .select("nv_ptm, nv_orange, nv_farmapack, varios, cliente, estado, fecha_estado")
    .or(ors.join(","))
    .order("fecha_estado", { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) return null;
  const r = data[0];
  const canal = r.nv_ptm ? "ptm" : r.nv_orange ? "orange" : r.nv_farmapack ? "farmapack" : "varios";
  const nvStr = r.nv_ptm ? String(r.nv_ptm) : (r.nv_orange || r.nv_farmapack || r.varios || t);
  return { nv: nvStr, canal, cliente: r.cliente || null, estado: normalizaEstado(r.estado) };
}

// Set de claves canal:nv que están en algún consolidado → para excluir de métricas.
export async function fetchConsolidadoKeys() {
  const { data, error } = await supabase.from("consolidado_nvs").select("nv, canal");
  if (error) return new Set();
  return new Set((data || []).map((n) => `${n.canal || "ptm"}:${n.nv}`));
}

export async function fetchDashboardData(dateFrom, dateTo) {
  const [rows, activasRows, consolidadoKeys] = await Promise.all([
    fetchAll(DASHBOARD_COLUMNS, dateFrom, dateTo),
    fetchActivas(DASHBOARD_COLUMNS),
    fetchConsolidadoKeys(),
  ]);

  const enrichRow = (r) => {
    r.estado = normalizaEstado(r.estado);
    r._consolidado = consolidadoKeys.has(nvKey(r));
    if (!r.fecha_compromiso) {
      r.fecha_compromiso = calcFechaCompromiso(r.fecha_aprobacion, r.fecha_aprobacion_real) || null;
    }
  };
  activasRows.forEach(enrichRow);
  rows.forEach(enrichRow);

  const activasDisplay = activasRows.filter((r) => dentroRangoAprob(r, dateFrom, dateTo));

  const rowsM = rows.filter((r) => !r._consolidado);
  const activasM = activasDisplay.filter((r) => !r._consolidado);

  // === KPIs ===
  const total = rows.length;
  const countNvPtm = rows.filter((r) => r.nv_ptm).length;
  const nvOrange = rows.filter((r) => r.nv_orange).length;
  const nvFarmapack = rows.filter((r) => r.nv_farmapack).length;
  const nvVarios = rows.filter((r) => r.varios).length;

  const estadoCounts = {};
  rows.forEach((r) => {
    const e = r.estado || "null";
    estadoCounts[e] = (estadoCounts[e] || 0) + 1;
  });
  ESTADOS_ACTIVOS.forEach((e) => { estadoCounts[e] = 0; });
  activasDisplay.forEach((r) => {
    const e = r.estado || "null";
    estadoCounts[e] = (estadoCounts[e] || 0) + 1;
  });

  const entregadas = rows.filter((r) => ESTADOS_ENTREGADOS.includes(r.estado)).length;
  const nulas = estadoCounts["NULA"] || 0;
  const refacturados = estadoCounts["REFACTURADO"] || 0;
  const rechazados = estadoCounts["RECHAZADO"] || 0;
  const activas = activasDisplay.length;

  const despachosReales = total - nulas - refacturados - rechazados;
  const tasaEntrega = despachosReales > 0
    ? ((entregadas / despachosReales) * 100).toFixed(1)
    : "0";

  const entregadosConFechas = rowsM.filter(
    (r) => ESTADOS_ENTREGADOS.includes(r.estado) && r.fecha_despacho && r.fecha_compromiso
  );
  let tardanzaSum = 0;
  let tardanzaCount = 0;
  let atiempoCount = 0;
  entregadosConFechas.forEach((r) => {
    const promesa = fechaPromesaEfectiva(r);
    if (!promesa) return;
    const despacho = new Date(r.fecha_despacho);
    const compromiso = new Date(promesa.fecha);
    const diffDays = (despacho.getTime() - compromiso.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.abs(diffDays) > 30) return;
    if (diffDays > 0) {
      tardanzaSum += diffDays;
      tardanzaCount++;
    } else {
      atiempoCount++;
    }
  });
  const leadTimeTardanza = tardanzaCount > 0
    ? (tardanzaSum / tardanzaCount).toFixed(1)
    : "0";
  const validEntregados = tardanzaCount + atiempoCount;
  const pctAtiempo = validEntregados > 0
    ? ((atiempoCount / validEntregados) * 100).toFixed(0)
    : "0";

  const incidencias = rows.filter(
    (r) => r.incidencia && r.estado_incidencia !== "RESUELTA"
  ).length;

  // === Fill Rate (shipping dentro de plazo) ===
  const ahoraMs = Date.now();
  let frCumple = 0;
  let frNoCumple = 0;
  rowsM.forEach((r) => {
    const res = evaluaFillRate(r, ahoraMs);
    if (res === true) frCumple++;
    else if (res === false) frNoCumple++;
  });
  const frEvaluables = frCumple + frNoCumple;
  const fillRateShipping = {
    pct: frEvaluables > 0 ? ((frCumple / frEvaluables) * 100).toFixed(1) : null,
    cumple: frCumple,
    noCumple: frNoCumple,
    evaluables: frEvaluables,
  };

  // === Cumplimiento NV Semanal ===
  const hoyISO = new Date().toISOString().split("T")[0];
  const semanaActualKey = inicioSemana(hoyISO);
  const nowMs = Date.now();

  const nvsSemana = rowsM.filter((r) => {
    if (!r.fecha_registro_nv) return false;
    if (ESTADOS_DESCARTADOS.includes(r.estado || "")) return false;
    const regStr = typeof r.fecha_registro_nv === "string"
      ? r.fecha_registro_nv.split("T")[0]
      : new Date(r.fecha_registro_nv).toISOString().split("T")[0];
    return inicioSemana(regStr) === semanaActualKey;
  });

  let nvCumple = 0;
  let nvNoCumple = 0;
  nvsSemana.forEach((r) => {
    const promesa = fechaPromesaEfectiva(r);
    if (!promesa) return;
    const compromisoMs = new Date(promesa.fecha + "T23:59:59").getTime();

    if (ESTADOS_PRE_SHIPPING.includes(r.estado)) {
      if (nowMs > compromisoMs) nvNoCumple++;
    } else {
      const exitDate = r.fecha_shipping || r.fecha_en_ruta || r.fecha_entregado;
      if (exitDate) {
        if (new Date(exitDate).getTime() <= compromisoMs) nvCumple++;
        else nvNoCumple++;
      }
    }
  });

  const nvEvaluables = nvCumple + nvNoCumple;
  const cumplimientoNV = {
    pct: nvEvaluables > 0 ? ((nvCumple / nvEvaluables) * 100).toFixed(1) : null,
    cumple: nvCumple,
    noCumple: nvNoCumple,
    evaluables: nvEvaluables,
    totalSemana: nvsSemana.length,
  };

  const kpis = {
    total,
    countNvPtm,
    nvVarios,
    nvOrange,
    nvFarmapack,
    estadoCounts,
    entregadas,
    activas,
    tasaEntrega,
    leadTimeTardanza,
    pctAtiempo,
    incidencias,
    fillRateShipping,
    cumplimientoNV,
  };

  // === Estado Table ===
  const estadoGrouped = {};
  const acumular = (r) => {
    const e = r.estado || "null";
    if (!estadoGrouped[e]) estadoGrouped[e] = { farmapack: 0, orange: 0, ptm: 0, varios: 0, total: 0 };
    if (r.nv_farmapack) estadoGrouped[e].farmapack++;
    if (r.nv_orange) estadoGrouped[e].orange++;
    if (r.nv_ptm) estadoGrouped[e].ptm++;
    if (r.varios) estadoGrouped[e].varios++;
    estadoGrouped[e].total++;
  };
  rows.forEach((r) => {
    if (ESTADOS_ACTIVOS.includes(r.estado || "")) return; // los activos se cuentan aparte
    acumular(r);
  });
  activasDisplay.forEach((r) => {
    if (ESTADOS_ACTIVOS.includes(r.estado || "")) acumular(r);
  });
  const estadoTable = Object.entries(estadoGrouped)
    .map(([estado, counts]) => ({ estado, ...counts }))
    .filter((row) => ESTADOS_FLUJO.includes(row.estado))
    .sort((a, b) => ESTADOS_FLUJO.indexOf(a.estado) - ESTADOS_FLUJO.indexOf(b.estado));

  // === Divisions ===
  const divCounts = {};
  rows.forEach((r) => {
    const d = r.division || "SIN DIVISIÓN";
    divCounts[d] = (divCounts[d] || 0) + 1;
  });
  const divisions = Object.entries(divCounts)
    .map(([division, cantidad]) => ({ division, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // === Transportistas ===
  const transCounts = {};
  rows.forEach((r) => {
    const t = r.transportista || "SIN TRANSPORTISTA";
    transCounts[t] = (transCounts[t] || 0) + 1;
  });
  const transportistas = Object.entries(transCounts)
    .map(([transportista, cantidad]) => ({ transportista, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // === Weekly Trend === (indicador → excluye consolidados)
  const weeks = {};
  rowsM.forEach((r) => {
    const fechaAprob = fechaAprobEfectiva(r);
    if (!fechaAprob) return;
    const weekKey = inicioSemana(fechaAprob);
    if (!weekKey) return;
    if (!weeks[weekKey]) weeks[weekKey] = { aprobadas: 0, entregadas: 0, tardanza: [], fillrateOk: 0, fillrateTotal: 0 };
    weeks[weekKey].aprobadas++;
    if (ESTADOS_ENTREGADOS.includes(r.estado)) weeks[weekKey].entregadas++;
    const fr = evaluaFillRate(r, ahoraMs);
    if (fr !== null) {
      weeks[weekKey].fillrateTotal++;
      if (fr) weeks[weekKey].fillrateOk++;
    }
    if (r.fecha_despacho) {
      const promesa = fechaPromesaEfectiva(r);
      if (promesa) {
        const desp = new Date(r.fecha_despacho);
        const comp = new Date(promesa.fecha);
        const tardDays = (desp.getTime() - comp.getTime()) / (1000 * 60 * 60 * 24);
        if (tardDays > 0 && tardDays <= 30) weeks[weekKey].tardanza.push(tardDays);
      }
    }
  });
  const weeklyTrend = Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, d]) => {
      const date = new Date(week + "T12:00:00");
      const dayNum = date.getDate();
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const label = `${String(dayNum).padStart(2, "0")}-${months[date.getMonth()]}`;
      const avgTard = d.tardanza.length > 0
        ? +(d.tardanza.reduce((s, v) => s + v, 0) / d.tardanza.length).toFixed(1)
        : 0;
      const fillRate = d.fillrateTotal > 0
        ? +((d.fillrateOk / d.fillrateTotal) * 100).toFixed(1)
        : 0;
      return { semana: label, entregadas: d.entregadas, aprobadas: d.aprobadas, tardanza: avgTard, fillRate };
    });

  // === Estado Resumen (active states only) ===
  const resumenCounts = {};
  activasDisplay.forEach((r) => {
    if (ESTADOS_ACTIVOS.includes(r.estado || "")) {
      resumenCounts[r.estado] = (resumenCounts[r.estado] || 0) + 1;
    }
  });
  const estadoResumen = Object.entries(resumenCounts)
    .map(([estado, count]) => ({ estado, count }))
    .sort((a, b) => b.count - a.count);

  // === Lead Time Semanal ===
  const ltWeeks = {};
  rowsM.forEach((r) => {
    if (!ESTADOS_ENTREGADOS.includes(r.estado) || !r.fecha_despacho || !r.fecha_compromiso) return;
    const fechaAprob = fechaAprobEfectiva(r);
    if (!fechaAprob) return;
    const weekKey = inicioSemana(fechaAprob);
    if (!weekKey) return;
    if (!ltWeeks[weekKey]) ltWeeks[weekKey] = { tardanzaSum: 0, tardanzaCount: 0, atiempoCount: 0 };
    const promesa = fechaPromesaEfectiva(r);
    if (!promesa) return;
    const desp = new Date(r.fecha_despacho);
    const comp = new Date(promesa.fecha);
    const dias = (desp.getTime() - comp.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.abs(dias) > 30) return;
    if (dias > 0) {
      ltWeeks[weekKey].tardanzaSum += dias;
      ltWeeks[weekKey].tardanzaCount++;
    } else {
      ltWeeks[weekKey].atiempoCount++;
    }
  });
  const leadTimeSemanal = Object.entries(ltWeeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, d]) => {
      const date = new Date(week + "T12:00:00");
      const weekNum = Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
      const totalWeek = d.tardanzaCount + d.atiempoCount;
      return {
        semana: `Semana ${weekNum}`,
        dias: d.tardanzaCount > 0 ? +(d.tardanzaSum / d.tardanzaCount).toFixed(1) : 0,
        count: totalWeek,
        pctAtiempo: totalWeek > 0 ? +((d.atiempoCount / totalWeek) * 100).toFixed(0) : 0,
      };
    });

  // === Alertas de Riesgo ===
  const estadosActivos = ESTADOS_ACTIVOS;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyMs = hoy.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  let alertaVencidos = 0;
  let alertaHoy = 0;
  let alertaManana = 0;
  const alertaDetalle = [];

  rowsM.forEach((r) => {
    if (!estadosActivos.includes(r.estado || "")) return;
    const promesa = fechaPromesaEfectiva(r);
    if (!promesa) return;
    const comp = new Date(promesa.fecha + "T12:00:00");
    comp.setHours(0, 0, 0, 0);
    const diasRestantes = Math.round((comp.getTime() - hoyMs) / msPerDay);

    if (diasRestantes > 1) return;

    if (diasRestantes < 0) alertaVencidos++;
    else if (diasRestantes === 0) alertaHoy++;
    else if (diasRestantes === 1) alertaManana++;

    alertaDetalle.push({
      nv:
        (r.nv_ptm && String(r.nv_ptm)) ||
        r.nv_orange ||
        r.nv_farmapack ||
        r.varios ||
        "—",
      cliente: r.cliente || "—",
      vendedor: r.vendedor || "—",
      transportista: r.transportista || "—",
      estado: r.estado || "—",
      division: r.division || "—",
      fecha_compromiso: r.fecha_compromiso,
      diasVencido: -diasRestantes,
    });
  });

  alertaDetalle.sort((a, b) => b.diasVencido - a.diasVencido);

  const alertas = {
    vencidos: alertaVencidos,
    hoy: alertaHoy,
    manana: alertaManana,
    total: alertaVencidos + alertaHoy + alertaManana,
    detalle: alertaDetalle,
  };

  // === Calidad de Datos ===
  const calidadPorTipo = {};
  const sumarTipo = (t) => {
    calidadPorTipo[t] = (calidadPorTipo[t] || 0) + 1;
  };
  const calidadDetalle = [];

  rows.forEach((r) => {
    const problemas = [];
    const estado = String(r.estado || "").trim();
    const descartado = ESTADOS_DESCARTADOS.includes(estado);

    // 1. Estado vacio o no reconocido (typo)
    if (!estado) {
      problemas.push("Sin estado");
      sumarTipo("Sin estado");
    } else if (!ESTADOS_VALIDOS.includes(estado)) {
      problemas.push(`Estado no reconocido: "${estado}"`);
      sumarTipo("Estado no reconocido");
    }

    const terminado = ESTADOS_ENTREGADOS.includes(estado);
    if (!descartado && !terminado) {
      if (!r.cliente) {
        problemas.push("Sin cliente");
        sumarTipo("Sin cliente");
      }
      if (!r.vendedor) {
        problemas.push("Sin vendedor");
        sumarTipo("Sin vendedor");
      }
      if (!r.division) {
        problemas.push("Sin división");
        sumarTipo("Sin división");
      }
      if (ESTADOS_DESPACHADOS.includes(estado) && !r.transportista) {
        problemas.push("Sin transportista");
        sumarTipo("Sin transportista");
      }
      const fcEfectiva = r.fecha_compromiso || calcFechaCompromiso(r.fecha_aprobacion, r.fecha_aprobacion_real);
      if (ESTADOS_ACTIVOS.includes(estado) && !fcEfectiva) {
        problemas.push("Sin fecha compromiso");
        sumarTipo("Sin fecha compromiso");
      }

      // Coherencia de fechas (solo si ambas existen → sin falsos positivos)
      const aprob = fechaAprobEfectiva(r);
      if (aprob && r.fecha_despacho &&
          new Date(r.fecha_despacho).getTime() < new Date(aprob).getTime()) {
        problemas.push("Despacho anterior a la aprobación");
        sumarTipo("Fecha incoherente");
      }
      if (r.fecha_entregado && r.fecha_despacho &&
          new Date(r.fecha_entregado).getTime() < new Date(r.fecha_despacho).getTime()) {
        problemas.push("Entrega anterior al despacho");
        sumarTipo("Fecha incoherente");
      }
    }

    if (problemas.length > 0) {
      calidadDetalle.push({
        nv:
          (r.nv_ptm && String(r.nv_ptm)) ||
          r.nv_orange ||
          r.nv_farmapack ||
          r.varios ||
          "—",
        cliente: r.cliente || "—",
        estado: estado || "—",
        division: r.division || "—",
        vendedor: r.vendedor || "—",
        problemas,
      });
    }
  });

  calidadDetalle.sort((a, b) => b.problemas.length - a.problemas.length);

  const calidad = {
    total: calidadDetalle.length,
    porTipo: calidadPorTipo,
    detalle: calidadDetalle,
  };

  // === OTIF (On Time In Full) ===
  let otifCumple = 0;
  let otifTotal = 0;
  rowsM.forEach((r) => {
    if (!ESTADOS_ENTREGADOS.includes(r.estado)) return;
    if (!r.fecha_despacho || !r.fecha_compromiso) return;
    const promesa = fechaPromesaEfectiva(r);
    if (!promesa) return;
    otifTotal++;
    const desp = new Date(r.fecha_despacho);
    const comp = new Date(promesa.fecha);
    const onTime = desp.getTime() <= comp.getTime();
    const inFull = true;
    if (onTime && inFull) otifCumple++;
  });
  const otif = {
    pct: otifTotal > 0 ? +((otifCumple / otifTotal) * 100).toFixed(1) : null,
    cumple: otifCumple,
    total: otifTotal,
  };

  // === Ranking Transportistas (con rendimiento) ===
  const transpPerf = {};
  rowsM.forEach((r) => {
    const t = (r.transportista || "").trim();
    if (!t || t === "SIN TRANSPORTISTA") return;
    if (!transpPerf[t]) transpPerf[t] = { total: 0, entregadas: 0, aTiempo: 0, tardanzaSum: 0, tardanzaN: 0 };
    transpPerf[t].total++;
    if (ESTADOS_ENTREGADOS.includes(r.estado)) {
      transpPerf[t].entregadas++;
      if (r.fecha_despacho && r.fecha_compromiso) {
        const promesa = fechaPromesaEfectiva(r);
        if (promesa) {
          const diff = (new Date(r.fecha_despacho).getTime() - new Date(promesa.fecha).getTime()) / (1000 * 60 * 60 * 24);
          if (Math.abs(diff) <= 30) {
            if (diff <= 0) transpPerf[t].aTiempo++;
            else { transpPerf[t].tardanzaSum += diff; transpPerf[t].tardanzaN++; }
          }
        }
      }
    }
  });
  const rankingTransportistas = Object.entries(transpPerf)
    .map(([nombre, d]) => ({
      nombre,
      total: d.total,
      entregadas: d.entregadas,
      pctATiempo: (d.aTiempo + d.tardanzaN) > 0 ? +((d.aTiempo / (d.aTiempo + d.tardanzaN)) * 100).toFixed(0) : null,
      tardanzaProm: d.tardanzaN > 0 ? +(d.tardanzaSum / d.tardanzaN).toFixed(1) : null,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // === Ranking Vendedores ===
  const vendPerf = {};
  rowsM.forEach((r) => {
    const v = (r.vendedor || "").trim();
    if (!v || v === "—") return;
    if (!vendPerf[v]) vendPerf[v] = { total: 0, entregadas: 0, aTiempo: 0, activas: 0 };
    vendPerf[v].total++;
    if (ESTADOS_ENTREGADOS.includes(r.estado)) vendPerf[v].entregadas++;
    if (ESTADOS_ACTIVOS.includes(r.estado)) vendPerf[v].activas++;
    if (ESTADOS_ENTREGADOS.includes(r.estado) && r.fecha_despacho && r.fecha_compromiso) {
      const promesa = fechaPromesaEfectiva(r);
      if (promesa) {
        const diff = (new Date(r.fecha_despacho).getTime() - new Date(promesa.fecha).getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 0 && Math.abs(diff) <= 30) vendPerf[v].aTiempo++;
      }
    }
  });
  const rankingVendedores = Object.entries(vendPerf)
    .map(([nombre, d]) => ({
      nombre,
      total: d.total,
      entregadas: d.entregadas,
      activas: d.activas,
      pctATiempo: d.entregadas > 0 ? +((d.aTiempo / d.entregadas) * 100).toFixed(0) : null,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // === Alertas Operacionales (NVs estancadas por estado) ===
  const UMBRAL_DIAS = {
    [ESTADOS.EN_PROCESO]: 3, [ESTADOS.P_VENDEDOR]: 3, [ESTADOS.P_STOCK]: 3, [ESTADOS.P_RETIRO]: 3,
    [ESTADOS.SHIPPING]: 2, [ESTADOS.CURRIER]: 2, [ESTADOS.EN_RUTA]: 3, [ESTADOS.ENTREGADO]: 5,
  };
  const estancadas = [];
  const hoyAlertMs = Date.now();
  ESTADOS_ACTIVOS.forEach((est) => {
    const umbral = UMBRAL_DIAS[est] || 5;
    const nvsEstancadas = [];
    activasRows.forEach((r) => {
      if (r.estado !== est) return;
      if (r._consolidado) return; // consolidados no se miden por estancamiento de 48hrs
      const fechaRef = r.fecha_estado || r.fecha_registro_nv;
      if (!fechaRef) return;
      const dias = (hoyAlertMs - new Date(fechaRef).getTime()) / (1000 * 60 * 60 * 24);
      if (dias > umbral) {
        const nvStr = (r.nv_ptm && String(r.nv_ptm)) || r.nv_orange || r.nv_farmapack || r.varios || "?";
        nvsEstancadas.push(nvStr);
      }
    });
    if (nvsEstancadas.length > 0) {
      estancadas.push({ estado: est, cantidad: nvsEstancadas.length, nvs: nvsEstancadas.slice(0, 5) });
    }
  });
  const alertasOperacionales = estancadas;

  // === Funnel del flujo (En Proceso → Shipping → En Ruta → Entregado) ===
  const FUNNEL_ETAPAS = [
    { etapa: ESTADOS.EN_PROCESO, incluye: [...ESTADOS_PRE_SHIPPING, ESTADOS.SHIPPING, ESTADOS.CURRIER, ESTADOS.EN_RUTA, ESTADOS.ENTREGADO] },
    { etapa: ESTADOS.SHIPPING, incluye: [ESTADOS.SHIPPING, ESTADOS.CURRIER, ESTADOS.EN_RUTA, ESTADOS.ENTREGADO] },
    { etapa: ESTADOS.EN_RUTA, incluye: [ESTADOS.EN_RUTA, ESTADOS.ENTREGADO] },
    { etapa: ESTADOS.ENTREGADO, incluye: [ESTADOS.ENTREGADO] },
  ];
  const funnelEstados = FUNNEL_ETAPAS.map(({ etapa, incluye }) => {
    let cantidad = 0;
    rows.forEach((r) => { if (incluye.includes(r.estado || "")) cantidad++; });
    activasDisplay.forEach((r) => {
      // sumar activas que estén en esta etapa (dentro del rango de fechas)
      if (ESTADOS_ACTIVOS.includes(r.estado || "") && incluye.includes(r.estado || "")) cantidad++;
    });
    return { etapa, cantidad };
  });

  // === Heatmap Estado × Transportista ===
  const heatPairs = {};
  rows.forEach((r) => {
    const est = r.estado || "Sin estado";
    if (!ESTADOS_FLUJO.includes(est)) return;
    const trans = (r.transportista || "").trim() || "Sin transportista";
    const key = `${est}|||${trans}`;
    heatPairs[key] = (heatPairs[key] || 0) + 1;
  });
  const heatmapData = Object.entries(heatPairs)
    .map(([key, cantidad]) => {
      const [estado, transportista] = key.split("|||");
      return { estado, transportista, cantidad };
    })
    .sort((a, b) => b.cantidad - a.cantidad);

  return {
    kpis,
    estadoTable,
    divisions,
    transportistas,
    weeklyTrend,
    estadoResumen,
    leadTimeSemanal,
    alertas,
    calidad,
    tiemposCiclo: calcularTiemposCiclo(rowsM),
    otif,
    rankingTransportistas,
    rankingVendedores,
    alertasOperacionales,
    funnelEstados,
    heatmapData,
  };
}

export async function getIncidenciasActivas(dateFrom, dateTo) {
  const cols = "nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, incidencia, estado_incidencia, observaciones_incidencia, dias_incidencia, fecha_aprobacion, fecha_aprobacion_real";
  if (!supabase) return [];
  const allRows = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    let q = supabase.from('tms_operaciones').select(cols)
      .not("incidencia", "is", null)
      .neq("estado_incidencia", "RESUELTA")
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (dateFrom) q = q.or(`fecha_aprobacion_real.gte.${dateFrom},and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${dateFrom})`);
    if (dateTo) q = q.or(`fecha_aprobacion_real.lte.${dateTo},and(fecha_aprobacion_real.is.null,fecha_aprobacion.lte.${dateTo})`);
    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows
    .map((r) => ({
      nv:
        (r.nv_ptm && String(r.nv_ptm)) ||
        r.nv_orange ||
        r.nv_farmapack ||
        r.varios ||
        "—",
      fecha: r.fecha_aprobacion_real || r.fecha_aprobacion || null,
      cliente: r.cliente || "—",
      vendedor: r.vendedor || "—",
      transportista: r.transportista || "—",
      estado: normalizaEstado(r.estado) || "—",
      incidencia: r.incidencia || "—",
      estado_incidencia: r.estado_incidencia || "—",
      observaciones: r.observaciones_incidencia || "—",
      dias: r.dias_incidencia || 0,
    }))
    .sort((a, b) => b.dias - a.dias);
}

export async function getOperacionesPorEstado(estado, dateFrom, dateTo) {
  const cols = "nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_despacho, fecha_compromiso, division, fecha_aprobacion, fecha_aprobacion_real, fecha_registro_nv, fecha_shipping, fecha_en_ruta, fecha_entregado, tipo_despacho, fecha_estado";
  const esEstadoActivo = estado === "ACTIVAS" || ESTADOS_ACTIVOS.includes(estado);
  const dataRaw = esEstadoActivo
    ? await fetchActivas(cols)
    : await fetchAll(cols, dateFrom, dateTo);
  const data = esEstadoActivo
    ? dataRaw.filter((r) => dentroRangoAprob(r, dateFrom, dateTo))
    : dataRaw;

  // Normalizar estados viejos → nuevos (igual que en fetchDashboardData)
  data.forEach((r) => {
    r.estado = normalizaEstado(r.estado);
  });

  const filtered = data.filter((r) => {
    if (estado === "ACTIVAS") return ESTADOS_ACTIVOS.includes(r.estado || "");
    if (estado === "TARDIAS") {
      if (!ESTADOS_ENTREGADOS.includes(r.estado) || !r.fecha_despacho || !r.fecha_compromiso) return false;
      const promesa = fechaPromesaEfectiva(r);
      if (!promesa) return false;
      const diff = (new Date(r.fecha_despacho).getTime() - new Date(promesa.fecha).getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && Math.abs(diff) <= 30;
    }
    if (estado === "ATIEMPO") {
      if (!ESTADOS_ENTREGADOS.includes(r.estado) || !r.fecha_despacho || !r.fecha_compromiso) return false;
      const promesa = fechaPromesaEfectiva(r);
      if (!promesa) return false;
      const diff = (new Date(r.fecha_despacho).getTime() - new Date(promesa.fecha).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 0 && Math.abs(diff) <= 30;
    }
    if (estado === "ENTREGADAS") return ESTADOS_ENTREGADOS.includes(r.estado);
    if (estado === "FILLRATE_CUMPLE") return evaluaFillRate(r, Date.now()) === true;
    if (estado === "FILLRATE_NOCUMPLE") return evaluaFillRate(r, Date.now()) === false;
    if (estado === "NVCUMPLE" || estado === "NVNOCUMPLE") {
      if (!r.fecha_registro_nv) return false;
      if (ESTADOS_DESCARTADOS.includes(r.estado || "")) return false;
      const regStr = typeof r.fecha_registro_nv === "string"
        ? r.fecha_registro_nv.split("T")[0]
        : new Date(r.fecha_registro_nv).toISOString().split("T")[0];
      const hoyKey = inicioSemana(new Date().toISOString().split("T")[0]);
      if (inicioSemana(regStr) !== hoyKey) return false;
      const promesa = fechaPromesaEfectiva(r);
      if (!promesa) return false;
      const compMs = new Date(promesa.fecha + "T23:59:59").getTime();
      if (ESTADOS_PRE_SHIPPING.includes(r.estado)) {
        return estado === "NVNOCUMPLE" && Date.now() > compMs;
      }
      const exitDate = r.fecha_shipping || r.fecha_en_ruta || r.fecha_entregado;
      if (!exitDate) return false;
      const cumple = new Date(exitDate).getTime() <= compMs;
      return estado === "NVCUMPLE" ? cumple : !cumple;
    }
    if (estado === "CANAL:PTM") return !!r.nv_ptm;
    if (estado === "CANAL:ORANGE") return !!r.nv_orange;
    if (estado === "CANAL:FARMAPACK") return !!r.nv_farmapack;
    if (estado === "CANAL:VARIOS") return !!r.varios;
    if (estado === "null" || estado === "SIN ESTADO") return !r.estado;
    return r.estado === estado;
  });

  return filtered
    .map((r) => {
      let difAprobacion = null;
      if (r.fecha_aprobacion && r.fecha_aprobacion_real) {
        const sistema = new Date(r.fecha_aprobacion);
        const real = new Date(r.fecha_aprobacion_real);
        difAprobacion = Math.round(
          (real.getTime() - sistema.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      let diasEntrega = null;
      const promesa = fechaPromesaEfectiva(r);
      const fechaPromesaReal = promesa?.fecha || r.fecha_compromiso;
      const diasAtrasoIngreso = promesa?.diasAtraso || 0;
      if (r.fecha_despacho && fechaPromesaReal) {
        const desp = new Date(r.fecha_despacho);
        const comp = new Date(fechaPromesaReal);
        diasEntrega = Math.round(
          (desp.getTime() - comp.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      return {
        nv:
          (r.nv_ptm && String(r.nv_ptm)) ||
          r.nv_orange ||
          r.nv_farmapack ||
          r.varios ||
          "—",
        cliente: r.cliente || "—",
        vendedor: r.vendedor || "—",
        transportista: r.transportista || "—",
        division: r.division || "—",
        fecha_registro_nv: r.fecha_registro_nv || null,
        fecha_aprobacion: r.fecha_aprobacion || null,
        fecha_aprobacion_real: r.fecha_aprobacion_real || null,
        dif_aprobacion: difAprobacion,
        fecha_despacho: r.fecha_despacho || null,
        fecha_compromiso: r.fecha_compromiso || null,
        fecha_promesa_efectiva: fechaPromesaReal || null,
        dias_atraso_ingreso: diasAtrasoIngreso,
        dias_entrega: diasEntrega,
        tipo_despacho: r.tipo_despacho || null,
      };
    })
    .sort((a, b) =>
      (b.fecha_aprobacion || "").localeCompare(a.fecha_aprobacion || "")
    );
}

// La tabla `audit_log` NO existe en la BD destino → sin consulta.
export async function fetchAuditStats() {
  return { operadores: [], total: 0 };
}

export async function fetchAuditRecent(limit = 20) {
  return [];
}

export async function fetchTendenciaHistorica(meses = 6) {
  const desde = new Date();
  desde.setMonth(desde.getMonth() - meses);
  const desdeStr = desde.toISOString().split("T")[0];

  const TENDENCIA_COLS = "estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_entregado,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,nv_ptm,nv_orange,nv_farmapack,varios";
  const rows = await fetchAll(TENDENCIA_COLS, desdeStr);
  rows.forEach((r) => {
    r.estado = normalizaEstado(r.estado);
    if (!r.fecha_compromiso) r.fecha_compromiso = calcFechaCompromiso(r.fecha_aprobacion, r.fecha_aprobacion_real) || null;
  });

  const mesesMap = {};

  const MESES_LABEL = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  rows.forEach((r) => {
    const fechaAprob = fechaAprobEfectiva(r);
    if (!fechaAprob) return;
    const d = new Date(fechaAprob);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!mesesMap[key]) {
      mesesMap[key] = {
        label: `${MESES_LABEL[d.getMonth()]} ${d.getFullYear()}`,
        entregadas: 0, aTiempo: 0, totalEval: 0,
        otifCumple: 0, otifTotal: 0,
        ltSum: 0, ltN: 0, activas: 0,
      };
    }
    const m = mesesMap[key];

    if (ESTADOS_ACTIVOS.includes(r.estado)) m.activas++;

    if (ESTADOS_ENTREGADOS.includes(r.estado)) {
      m.entregadas++;

      if (r.fecha_despacho && r.fecha_compromiso) {
        const promesa = fechaPromesaEfectiva(r);
        if (promesa) {
          const diff = (new Date(r.fecha_despacho).getTime() - new Date(promesa.fecha).getTime()) / (1000 * 60 * 60 * 24);
          if (Math.abs(diff) <= 30) {
            m.totalEval++;
            if (diff <= 0) m.aTiempo++;
            m.otifTotal++;
            if (diff <= 0) m.otifCumple++;
          }
        }
      }

      const fin = r.fecha_entregado || r.fecha_despacho;
      const lt = diffDias(fechaAprobEfectiva(r), fin);
      if (lt !== null) { m.ltSum += lt; m.ltN++; }
    }
  });

  return Object.entries(mesesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, m]) => ({
      label: m.label,
      entregadas: m.entregadas,
      pctATiempo: m.totalEval > 0 ? +((m.aTiempo / m.totalEval) * 100).toFixed(0) : null,
      otif: m.otifTotal > 0 ? +((m.otifCumple / m.otifTotal) * 100).toFixed(0) : null,
      leadTime: m.ltN > 0 ? +(m.ltSum / m.ltN).toFixed(1) : null,
      activas: m.activas,
    }));
}

/* ──────────────── Dashboard Builder: lectura ──────────────── */
export async function fetchDashboards() {
  const { data, error } = await supabase
    .from("dashboard_layouts")
    .select("id, name, owner, min_role_edit, config")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    owner: r.owner,
    minRoleEdit: r.min_role_edit || "supervisor",
    config: r.config || { widgets: [], gridLayout: [] },
  }));
}

/* ──────────────── Módulo Maestro: Transportistas (lectura) ──────────────── */
export async function fetchTransportistas(incluirInactivos = false) {
  if (!supabase) return [];
  let q = supabase
    .from("transportistas")
    .select("id, nombre, codigo, telefono, email, activo")
    .order("nombre", { ascending: true });
  if (!incluirInactivos) q = q.eq("activo", true);
  const { data, error } = await q;
  if (error || !data) return [];
  return data;
}

/* ──────────────── Módulo Maestro: Vendedores (lectura) ──────────────── */
export async function fetchVendedores(incluirInactivos = false) {
  if (!supabase) return [];
  let q = supabase
    .from("vendedores")
    .select("id, nombre, codigo, telefono, email, activo, centro_costo, division")
    .order("nombre", { ascending: true });
  if (!incluirInactivos) q = q.eq("activo", true);
  const { data, error } = await q;
  if (error || !data) return [];
  return data;
}

/* ──────────────── Campos calculados del Builder (lectura) ──────────────── */
export async function fetchCalculatedFields(incluirInactivos = false) {
  if (!supabase) return [];
  let q = supabase
    .from("builder_calculated_fields")
    .select("id, nombre, formula, tipo, descripcion, activo, created_by")
    .order("nombre", { ascending: true });
  if (!incluirInactivos) q = q.eq("activo", true);
  const { data, error } = await q;
  if (error || !data) return [];
  return data;
}

/** Muestra de NVs reales (para el preview del editor de campos calculados). */
const CALC_PREVIEW_COLS = "nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_estado";
export async function fetchOperacionesSample(limit = 25) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tms_operaciones')
    .select(CALC_PREVIEW_COLS)
    .order("fecha_estado", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => mapOperacionRow(r));
}

/** Mapea una fila cruda de `operaciones` a la forma que consumen las fórmulas. */
function mapOperacionRow(r) {
  const fc = soloFecha(r.fecha_compromiso)
    || calcFechaCompromiso(soloFecha(r.fecha_aprobacion), soloFecha(r.fecha_aprobacion_real));
  return {
    ...r,
    estado: normalizaEstado(r.estado) || r.estado,
    fecha_compromiso: fc || null,
    nv: r.nv_ptm ? String(r.nv_ptm) : (r.nv_orange || r.nv_farmapack || r.varios || "—"),
    fecha_entrega: r.fecha_entregado,
    fecha_creacion: r.fecha_registro_nv,
  };
}

/** Eventos de auditoría de una NV — audit_log no existe en la BD destino. */
export async function fetchAuditByNv(nv, limit = 15) {
  return [];
}

/** Filas crudas de NVs ACTIVAS para el Builder (fuente "operaciones"). */
export async function fetchOperacionesRows() {
  const rows = await fetchActivas(CALC_PREVIEW_COLS + ",fecha_estado");
  return rows.map((r) => mapOperacionRow(r));
}

// ---------------------------------------------------------------------------
// TV Dashboard — fetch de estados activos + NVs por estado (panel interactivo)
// ---------------------------------------------------------------------------
export async function fetchTVEstados() {
  const rows = await fetchActivas(
    "nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_compromiso, fecha_estado, fecha_despacho, fecha_entregado, fecha_aprobacion, fecha_aprobacion_real, urgente"
  );
  const hoyMs = Date.now();
  const msPerDay = 1000 * 60 * 60 * 24;
  const diasDesde = (f) => f ? Math.floor((hoyMs - new Date(f + "T12:00:00").getTime()) / msPerDay) : null;

  const grupos = {};
  const urgentes = [];
  let total = 0;

  const FINALIZADOS = [ESTADOS.ENTREGADO, ESTADOS.RECIBIDO_CONFORME, ESTADOS.RECIBIDO_OBS];

  rows.forEach((r) => {
    const est = normalizaEstado(r.estado) || "Sin estado";
    if (FINALIZADOS.includes(est)) return; // fuera de la operación
    const nv = (r.nv_ptm && String(r.nv_ptm)) || r.nv_orange || r.nv_farmapack || r.varios || "?";
    const canal = r.nv_ptm ? "PTM" : r.nv_orange ? "Orange" : r.nv_farmapack ? "Farmapack" : "Varios";
    const esUrgente = r.urgente === true || String(r.urgente) === "true";
    const fechaEst = soloFecha(r.fecha_estado);
    const fechaAprob = soloFecha(r.fecha_aprobacion);
    const fechaAprobReal = soloFecha(r.fecha_aprobacion_real);
    const fechaAprobEfectivaVal = fechaAprobReal || fechaAprob;
    const fcRaw = r.fecha_compromiso || calcFechaCompromiso(r.fecha_aprobacion, r.fecha_aprobacion_real);
    const item = {
      nv,
      canal,
      cliente: r.cliente || "—",
      vendedor: r.vendedor || "—",
      transportista: r.transportista || "—",
      fecha_compromiso: soloFecha(fcRaw),
      fecha_estado: fechaEst,
      fecha_despacho: soloFecha(r.fecha_despacho),
      fecha_entregado: soloFecha(r.fecha_entregado),
      fecha_aprobacion: fechaAprob,
      fecha_aprobacion_real: fechaAprobReal,
      fecha_aprob_efectiva: fechaAprobEfectivaVal,
      diasEnEstado: diasDesde(fechaEst),
      diasDesdeAprobacion: diasDesde(fechaAprobEfectivaVal),
      urgente: esUrgente,
    };
    if (!grupos[est]) grupos[est] = [];
    grupos[est].push(item);
    const estTerminal = [ESTADOS.ENTREGADO, ESTADOS.RECIBIDO_CONFORME, ESTADOS.RECIBIDO_OBS].includes(est);
    if (esUrgente && !estTerminal) urgentes.push(item);
    total++;
  });

  const ORDEN = ESTADOS_ACTIVOS;
  const estados = ORDEN
    .filter(e => (grupos[e]?.length || 0) > 0)
    .map(e => ({
      estado: e,
      cantidad: grupos[e].length,
      nvs: grupos[e].sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0)),
    }));

  return { estados, total, urgentes };
}

// ---------------------------------------------------------------------------
// TV Dashboard v2 — datos completos para centro de control operacional
// ---------------------------------------------------------------------------
export async function fetchTVData() {
  const [tvEstados, dashData] = await Promise.all([
    fetchTVEstados(),
    fetchDashboardData(),
  ]);

  const hoy = new Date().toISOString().slice(0, 10);
  const entregadasHoy = dashData.estadoTable
    ?.filter((r) => r.fecha_entregado?.slice(0, 10) === hoy).length || 0;

  return {
    ...tvEstados,
    otif: dashData.otif,
    alertas: dashData.alertas,
    rankingTransportistas: dashData.rankingTransportistas,
    rankingVendedores: dashData.rankingVendedores,
    alertasOperacionales: dashData.alertasOperacionales,
    funnelEstados: dashData.funnelEstados,
    entregadasHoy,
  };
}

// Exporta funciones puras internas para testing (no para uso en componentes).
export const _internal = {
  normalizaEstado,
  nvKey,
  dedupePorNv,
  diffDias,
  fechaAprobEfectiva,
  dentroRangoAprob,
  fechaPromesaEfectiva,
  evaluaFillRate,
  inicioSemana,
  fechaSalidaProceso,
};
