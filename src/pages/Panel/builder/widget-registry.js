export const FILTER_OPS = [
  { v: "=", l: "=" }, { v: "!=", l: "≠" }, { v: "<", l: "<" }, { v: "<=", l: "≤" },
  { v: ">", l: ">" }, { v: ">=", l: "≥" }, { v: "contains", l: "contiene" },
];

let _nextPageId = Date.now() + 1;
export function genPageId() {
  return `page_${_nextPageId++}`;
}

/* ──────────────── Estándar de semáforos (4 niveles) ──────────────── */
export const SEMAFORO_LEVELS = {
  critico:   { label: "Crítico",   color: "#dc2626", bg: "#fee2e2" },
  enRiesgo:  { label: "En riesgo", color: "#f59e0b", bg: "#fef3c7" },
  mejorando: { label: "Mejorando", color: "#2563eb", bg: "#dbeafe" },
  ok:        { label: "OK",        color: "#16a34a", bg: "#dcfce7" },
};

// Clasifica un valor en uno de los 4 niveles del semáforo estándar.
// Reglas (acordadas con el usuario):
//  - OK manda: si ya cumple el umbral OK → verde (aunque haya bajado).
//  - Si NO está OK pero MEJORÓ respecto al período anterior → MEJORANDO (azul).
//  - Si no mejoró y está bajo el umbral crítico → CRÍTICO (rojo); si no → EN RIESGO (ámbar).
// `higherIsBetter=false` invierte las comparaciones (lead time, tardanza: menos es mejor).
export function clasificarSemaforo(value, prev, opts) {
  if (value == null || isNaN(Number(value))) return null;
  const v = Number(value);
  const mejor = opts.higherIsBetter !== false;
  const ok = opts.okThreshold ?? (mejor ? 85 : 1);
  const crit = opts.critThreshold ?? (mejor ? 50 : 5);

  const isOk = mejor ? v >= ok : v <= ok;
  if (isOk) return "ok";

  const p = prev == null || isNaN(Number(prev)) ? null : Number(prev);
  const mejorando = p != null && (mejor ? v > p : v < p);
  if (mejorando) return "mejorando";

  const isCrit = mejor ? v < crit : v > crit;
  return isCrit ? "critico" : "enRiesgo";
}

// Jerarquía de roles para decidir permisos de edición.
export const ROLE_RANK = { operador: 1, supervisor: 2, admin: 3 };
export function puedeEditar(rolUsuario, minRol) {
  return (ROLE_RANK[rolUsuario] || 1) >= (ROLE_RANK[minRol] || 2);
}

export const DATA_SOURCES = [
  {
    key: "none",
    label: "(Sin datos — decorativo)",
    type: "single",
    fields: [],
  },
  {
    // Filas crudas de NV (activas) extendidas con los campos calculados.
    // Consumible por Tabla (columnas) y KPI (count/sum/avg).
    key: "operaciones",
    label: "Operaciones (NVs) — fila + campos calculados",
    type: "array",
    fields: [
      { key: "nv", label: "N° NV", type: "string" },
      { key: "estado", label: "Estado", type: "string" },
      { key: "cliente", label: "Cliente", type: "string" },
      { key: "vendedor", label: "Vendedor", type: "string" },
      { key: "transportista", label: "Transportista", type: "string" },
      { key: "fecha_compromiso", label: "F. Compromiso", type: "string" },
      { key: "fecha_aprobacion", label: "Fecha Creación N.V", type: "string" },
      { key: "fecha_despacho", label: "F. Despacho", type: "string" },
      { key: "fecha_entregado", label: "F. Entregado", type: "string" },
    ],
  },
  {
    key: "kpis",
    label: "KPIs principales",
    type: "single",
    fields: [
      { key: "activas", label: "NVs Activas", type: "number" },
      { key: "entregadas", label: "Entregadas", type: "number" },
      { key: "total", label: "Total NVs", type: "number" },
      { key: "countNvPtm", label: "NVs PTM", type: "number" },
      { key: "nvOrange", label: "NVs Orange", type: "number" },
      { key: "nvFarmapack", label: "NVs Farmapack", type: "number" },
      { key: "nvVarios", label: "NVs Varios", type: "number" },
      { key: "incidencias", label: "Incidencias", type: "number" },
      { key: "tasaEntrega", label: "Tasa Entrega", type: "percent" },
      { key: "pctAtiempo", label: "% A Tiempo", type: "percent" },
      { key: "leadTimeTardanza", label: "Tardanza Promedio", type: "number" },
    ],
  },
  {
    key: "fillRate",
    label: "Fill Rate Shipping",
    type: "single",
    fields: [
      { key: "pct", label: "Porcentaje", type: "percent" },
      { key: "cumple", label: "Cumple", type: "number" },
      { key: "noCumple", label: "No Cumple", type: "number" },
      { key: "evaluables", label: "Evaluables", type: "number" },
    ],
  },
  {
    key: "otif",
    label: "OTIF",
    type: "single",
    fields: [
      { key: "pct", label: "Porcentaje", type: "percent" },
      { key: "cumple", label: "Cumple", type: "number" },
      { key: "total", label: "Total", type: "number" },
    ],
  },
  {
    key: "cumplimientoNV",
    label: "Cumplimiento NV Semanal",
    type: "single",
    fields: [
      { key: "pct", label: "Porcentaje", type: "percent" },
      { key: "cumple", label: "Cumple", type: "number" },
      { key: "noCumple", label: "No Cumple", type: "number" },
      { key: "totalSemana", label: "Total Semana", type: "number" },
    ],
  },
  {
    key: "estadoTable",
    label: "Estados por Canal",
    type: "array",
    fields: [
      { key: "estado", label: "Estado", type: "string" },
      { key: "ptm", label: "PTM", type: "number" },
      { key: "orange", label: "Orange", type: "number" },
      { key: "farmapack", label: "Farmapack", type: "number" },
      { key: "varios", label: "Varios", type: "number" },
      { key: "total", label: "Total", type: "number" },
    ],
  },
  {
    key: "resumen",
    label: "Resumen Estados Activos",
    type: "array",
    fields: [
      { key: "estado", label: "Estado", type: "string" },
      { key: "count", label: "Cantidad", type: "number" },
    ],
  },
  {
    key: "divisions",
    label: "Divisiones",
    type: "array",
    fields: [
      { key: "division", label: "Division", type: "string" },
      { key: "cantidad", label: "Cantidad", type: "number" },
    ],
  },
  {
    key: "transportistas",
    label: "Transportistas",
    type: "array",
    fields: [
      { key: "transportista", label: "Transportista", type: "string" },
      { key: "cantidad", label: "Cantidad", type: "number" },
    ],
  },
  {
    key: "weeklyTrend",
    label: "Tendencia Semanal",
    type: "array",
    fields: [
      { key: "semana", label: "Semana", type: "string" },
      { key: "aprobadas", label: "Aprobadas", type: "number" },
      { key: "entregadas", label: "Entregadas", type: "number" },
      { key: "tardanza", label: "Tardanza", type: "number" },
      { key: "fillRate", label: "Fill Rate", type: "percent" },
    ],
  },
  {
    key: "leadTimeSemanal",
    label: "Lead Time Semanal",
    type: "array",
    fields: [
      { key: "semana", label: "Semana", type: "string" },
      { key: "dias", label: "Dias", type: "number" },
      { key: "count", label: "Cantidad", type: "number" },
      { key: "pctAtiempo", label: "% A Tiempo", type: "percent" },
    ],
  },
  {
    key: "tiemposCiclo",
    label: "Tiempos de Ciclo",
    type: "array",
    fields: [
      { key: "nombre", label: "Etapa", type: "string" },
      { key: "dias", label: "Dias", type: "number" },
      { key: "n", label: "Muestra", type: "number" },
    ],
  },
  {
    key: "rankingTransportistas",
    label: "Ranking Transportistas",
    type: "array",
    fields: [
      { key: "nombre", label: "Transportista", type: "string" },
      { key: "total", label: "Total", type: "number" },
      { key: "entregadas", label: "Entregadas", type: "number" },
      { key: "pctATiempo", label: "% A Tiempo", type: "percent" },
      { key: "tardanzaProm", label: "Tardanza", type: "number" },
    ],
  },
  {
    key: "rankingVendedores",
    label: "Ranking Vendedores",
    type: "array",
    fields: [
      { key: "nombre", label: "Vendedor", type: "string" },
      { key: "total", label: "Total", type: "number" },
      { key: "entregadas", label: "Entregadas", type: "number" },
      { key: "activas", label: "Activas", type: "number" },
      { key: "pctATiempo", label: "% A Tiempo", type: "percent" },
    ],
  },
  {
    key: "alertasOperacionales",
    label: "Alertas Operacionales",
    type: "array",
    fields: [
      { key: "estado", label: "Estado", type: "string" },
      { key: "cantidad", label: "Cantidad", type: "number" },
    ],
  },
  {
    key: "auditKpis",
    label: "KPIs por Operador",
    type: "array",
    fields: [
      { key: "nombre", label: "Operador", type: "string" },
      { key: "creates", label: "Creadas", type: "number" },
      { key: "updates", label: "Actualizadas", type: "number" },
      { key: "bulkUpdates", label: "Lote", type: "number" },
      { key: "conflicts", label: "Conflictos", type: "number" },
      { key: "total", label: "Total", type: "number" },
    ],
  },
  {
    key: "tendencia",
    label: "Tendencia Historica",
    type: "array",
    fields: [
      { key: "label", label: "Mes", type: "string" },
      { key: "entregadas", label: "Entregadas", type: "number" },
      { key: "pctATiempo", label: "% A Tiempo", type: "percent" },
      { key: "otif", label: "OTIF", type: "percent" },
      { key: "leadTime", label: "Lead Time", type: "number" },
      { key: "activas", label: "Activas", type: "number" },
    ],
  },
  {
    key: "cumplimientoDetalle",
    label: "Cumplimiento Desglose (Cumple / No Cumple)",
    type: "array",
    fields: [
      { key: "label", label: "Resultado", type: "string" },
      { key: "valor", label: "Cantidad", type: "number" },
    ],
  },
  {
    key: "riesgoCompromiso",
    label: "NV en Riesgo por Plazo de Compromiso",
    type: "array",
    fields: [
      { key: "rango", label: "Rango", type: "string" },
      { key: "cantidad", label: "Cantidad", type: "number" },
    ],
  },
  {
    key: "funnelEstados",
    label: "Funnel del Flujo",
    type: "array",
    fields: [
      { key: "etapa", label: "Etapa", type: "string" },
      { key: "cantidad", label: "Cantidad", type: "number" },
    ],
  },
  {
    key: "heatmapData",
    label: "Heatmap Estado x Transportista",
    type: "array",
    fields: [
      { key: "estado", label: "Estado", type: "string" },
      { key: "transportista", label: "Transportista", type: "string" },
      { key: "cantidad", label: "Cantidad", type: "number" },
    ],
  },
];

export const WIDGET_TYPES = [
  { type: "kpi", label: "Tarjeta KPI", icon: "#", description: "Muestra un valor unico grande", minW: 2, minH: 2, defaultW: 3, defaultH: 2 },
  { type: "semaforo", label: "Semáforo", icon: "◆", description: "Valor con color e indicador: Crítico / En riesgo / Mejorando / OK", minW: 2, minH: 2, defaultW: 3, defaultH: 3 },
  { type: "bar-chart", label: "Grafico Barras", icon: "|", description: "Barras verticales con multiples series", minW: 4, minH: 4, defaultW: 6, defaultH: 5 },
  { type: "line-chart", label: "Grafico Lineas", icon: "~", description: "Lineas de tendencia temporal", minW: 4, minH: 4, defaultW: 6, defaultH: 5 },
  { type: "pie-chart", label: "Grafico Torta", icon: "O", description: "Distribucion proporcional", minW: 3, minH: 4, defaultW: 4, defaultH: 5 },
  { type: "donut-chart", label: "Grafico Dona", icon: "D", description: "Torta con hueco central", minW: 3, minH: 4, defaultW: 4, defaultH: 5 },
  { type: "table", label: "Tabla", icon: "T", description: "Tabla con columnas configurables", minW: 4, minH: 3, defaultW: 6, defaultH: 5 },
  { type: "horizontal-bars", label: "Barras Horizontales", icon: "=", description: "Barras horizontales comparativas", minW: 4, minH: 3, defaultW: 6, defaultH: 4 },
  { type: "stat-list", label: "Lista de Stats", icon: "L", description: "Lista vertical de etiqueta + valor", minW: 3, minH: 3, defaultW: 4, defaultH: 4 },
  { type: "gauge", label: "Gauge / Medidor", icon: "G", description: "Medidor semicircular para % (OTIF, etc.)", minW: 3, minH: 3, defaultW: 4, defaultH: 4 },
  { type: "heatmap", label: "Heatmap", icon: "H", description: "Matriz de calor (estado vs transportista)", minW: 5, minH: 4, defaultW: 8, defaultH: 6 },
  { type: "funnel", label: "Funnel / Embudo", icon: "V", description: "Embudo de etapas del flujo", minW: 3, minH: 4, defaultW: 5, defaultH: 5 },
  { type: "timeline", label: "Timeline", icon: "I", description: "Línea de tiempo por período", minW: 3, minH: 4, defaultW: 5, defaultH: 5 },
  { type: "area-chart", label: "Gráfico Área", icon: "▲", description: "Área rellena de tendencia", minW: 4, minH: 4, defaultW: 6, defaultH: 5 },
  { type: "scorecard", label: "Scorecard", icon: "S", description: "Número grande con comparación vs período anterior", minW: 2, minH: 2, defaultW: 3, defaultH: 3 },
  { type: "text", label: "Texto Libre", icon: "A", description: "Bloque de texto, título o nota", minW: 2, minH: 1, defaultW: 4, defaultH: 2 },
  { type: "divider", label: "Separador", icon: "—", description: "Línea divisoria visual", minW: 2, minH: 1, defaultW: 12, defaultH: 1 },
  { type: "image", label: "Imagen / Logo", icon: "🖼", description: "Imagen desde URL", minW: 2, minH: 2, defaultW: 3, defaultH: 3 },
];

const CHART_PALETTE = [
  "#f57c00", "#1565c0", "#2e7d32", "#c62828", "#6a1b9a",
  "#00838f", "#ef6c00", "#283593", "#558b2f", "#ad1457",
];

export function getDefaultColor(index) {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

let _nextId = Date.now();
export function genWidgetId() {
  return `w_${_nextId++}`;
}

/**
 * Campos disponibles para una fuente, fusionando los campos calculados cuando
 * la fuente es "operaciones" (filas extendidas). Usado por el ConfigPanel.
 */
export function fieldsForSource(dsKey, calcFields = []) {
  const ds = DATA_SOURCES.find((d) => d.key === dsKey);
  const base = ds ? [...ds.fields] : [];
  if (dsKey === "operaciones" && calcFields.length) {
    const extra = calcFields.map((c) => ({
      key: c.nombre,
      label: `ƒ ${c.nombre}`,
      type: (c.tipo === "numero" ? "number" : c.tipo === "fecha" ? "string" : "string"),
    }));
    return [...base, ...extra];
  }
  return base;
}

// ---------- Filtros (S3) ----------
function looseEq(v, target) {
  if (v === null || v === undefined) return target === "" || target.toLowerCase() === "null";
  const ln = Number(v), rn = Number(target);
  if (!isNaN(ln) && !isNaN(rn) && String(v).trim() !== "" && target.trim() !== "") return ln === rn;
  return String(v).toLowerCase() === target.toLowerCase();
}
function matchFilter(v, op, target) {
  const ln = Number(v), rn = Number(target);
  const bothNum = !isNaN(ln) && !isNaN(rn) && String(v).trim() !== "" && target.trim() !== "";
  switch (op) {
    case "=": return looseEq(v, target);
    case "!=": return !looseEq(v, target);
    case "<": return bothNum && ln < rn;
    case "<=": return bothNum && ln <= rn;
    case ">": return bothNum && ln > rn;
    case ">=": return bothNum && ln >= rn;
    case "contains": return String(v ?? "").toLowerCase().includes(target.toLowerCase());
    default: return true;
  }
}
/** Aplica filtros (AND) a un array de filas. Filtros incompletos (sin campo) se ignoran. */
export function applyFilters(rows, filters) {
  if (!Array.isArray(rows) || !filters || filters.length === 0) return rows;
  const active = filters.filter((f) => f.field);
  if (active.length === 0) return rows;
  return rows.filter((row) => active.every((f) => matchFilter(row[f.field], f.op, f.value)));
}

export function resolveData(dataSource, dashData) {
  if (dataSource === "none") return {};
  if (dataSource === "operaciones") return dashData.operaciones || [];
  if (dataSource === "kpis") return dashData.kpis;
  if (dataSource === "fillRate") return dashData.kpis?.fillRateShipping;
  if (dataSource === "otif") return dashData.otif;
  if (dataSource === "cumplimientoNV") return dashData.kpis?.cumplimientoNV;
  if (dataSource === "tiemposCiclo") return dashData.tiemposCiclo?.etapas;
  if (dataSource === "auditKpis") return dashData.auditKpis;
  if (dataSource === "tendencia") return dashData.tendencia;
  if (dataSource === "funnelEstados") return dashData.funnelEstados;
  if (dataSource === "heatmapData") return dashData.heatmapData;
  if (dataSource === "cumplimientoDetalle") {
    const c = dashData.kpis?.cumplimientoNV;
    if (!c) return [];
    return [
      { label: "Cumple", valor: c.cumple || 0 },
      { label: "No Cumple", valor: c.noCumple || 0 },
    ];
  }
  if (dataSource === "riesgoCompromiso") {
    const det = dashData.alertas?.detalle || [];
    const g = { "Vencida >5d": 0, "Vencida 1-5d": 0, "Vence hoy": 0, "Vence mañana": 0 };
    det.forEach((d) => {
      if (d.diasVencido > 5) g["Vencida >5d"]++;
      else if (d.diasVencido >= 1) g["Vencida 1-5d"]++;
      else if (d.diasVencido === 0) g["Vence hoy"]++;
      else g["Vence mañana"]++;
    });
    return Object.entries(g)
      .filter(([, v]) => v > 0)
      .map(([rango, cantidad]) => ({ rango, cantidad }));
  }
  return dashData[dataSource];
}

export const DEFAULT_LAYOUT = {
  id: "default",
  name: "Dashboard por defecto",
  pages: [{ id: "page_default", name: "Hoja 1", widgets: [], gridLayout: [] }],
};
