/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import {
  DATA_SOURCES,
  WIDGET_TYPES,
  genWidgetId,
  genPageId,
  getDefaultColor,
  puedeEditar
} from './widget-registry';
import {
  fetchDashboardData,
  fetchAuditStats,
  fetchTendenciaHistorica,
  fetchDashboards,
  saveDashboard,
  deleteDashboard,
  fetchCalculatedFields,
  fetchOperacionesRows
} from './builderService';
import { extendRows } from '../formulaEngine';
import WidgetRenderer from './components/WidgetRenderer';
import ConfigPanel from './components/ConfigPanel';
import WidgetCatalog from './components/WidgetCatalog';
import LayoutManager from './components/LayoutManager';
import CamposCalculados from './components/CamposCalculados';
import { useAuth } from '../../../context/AuthContext';
import { isFeatureFlagEnabled } from '../../../config/featureFlags';

const DATE_PRESETS = [
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: '6m', label: '6 meses' },
  { key: '1y', label: '1 año' },
  { key: 'ytd', label: 'Año actual' },
  { key: 'all', label: 'Todo' },
  { key: 'custom', label: 'Personalizado' }
];

function presetToRange(preset) {
  const today = new Date();
  const to = today.toISOString().split('T')[0];
  const d = new Date(today);
  switch (preset) {
    case '7d':
      d.setDate(d.getDate() - 7);
      break;
    case '30d':
      d.setDate(d.getDate() - 30);
      break;
    case '90d':
      d.setDate(d.getDate() - 90);
      break;
    case '6m':
      d.setMonth(d.getMonth() - 6);
      break;
    case '1y':
      d.setFullYear(d.getFullYear() - 1);
      break;
    case 'ytd':
      return { from: `${today.getFullYear()}-01-01`, to };
    case 'all':
      return { from: '2020-01-01', to };
    default:
      return { from: '2020-01-01', to };
  }
  return { from: d.toISOString().split('T')[0], to };
}

import 'react-grid-layout/css/styles.css';

const ACTIVE_KEY = 'ptm_builder_active';

// El rol del usuario ahora vive en el store global (src/store/useRolStore).
function loadActiveId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_KEY);
}
function saveActiveId(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

// Conversión entre el formato de UI (DashboardLayoutConfig) y el de Supabase (DashboardRecord).
function toRecord(l) {
  return {
    id: l.id,
    name: l.name,
    owner: l.owner ?? null,
    minRoleEdit: l.minRoleEdit || 'supervisor',
    config: { pages: l.pages }
  };
}
function fromRecord(r) {
  // Formato nuevo (con hojas) o migración del legacy (widgets/gridLayout sueltos → "Hoja 1").
  const pages =
    Array.isArray(r.config?.pages) && r.config.pages.length > 0
      ? r.config.pages.map((p, i) => ({
          id: p.id || genPageId(),
          name: p.name || `Hoja ${i + 1}`,
          widgets: p.widgets || [],
          gridLayout: p.gridLayout || []
        }))
      : [
          {
            id: genPageId(),
            name: 'Hoja 1',
            widgets: r.config?.widgets || [],
            gridLayout: r.config?.gridLayout || []
          }
        ];
  return {
    id: r.id,
    name: r.name,
    owner: r.owner,
    minRoleEdit: r.minRoleEdit,
    pages
  };
}

/* ──────────────── CONFIG PANEL ──────────────── */
/* ──────────────── WIDGET CATALOG ──────────────── */
/* ──────────────── LAYOUT MANAGER ──────────────── */
/* ──────────────── MAIN BUILDER PAGE ──────────────── */
export default function PanelBuilderReal() {
  const builderV2 = isFeatureFlagEnabled('web_builder_v2');
  const [editMode, setEditMode] = useState(false);
  const [layouts, setLayouts] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [activePageId, setActivePageId] = useState(''); // hoja activa dentro del dashboard
  const [renamingPage, setRenamingPage] = useState(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [layoutMgrOpen, setLayoutMgrOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  // Dashboard data
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Campos calculados + filas crudas de NV (fuente "operaciones")
  const [calcFields, setCalcFields] = useState([]);
  const [rawOps, setRawOps] = useState([]);

  // Filtros de fecha globales
  const [datePreset, setDatePreset] = useState('6m');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Rol del usuario (derivado de los permisos CCO) + estado de guardado
  const { user, hasPermission } = useAuth();
  const rol = hasPermission('manage_panel') ? 'admin' : 'viewer';
  const [saving, setSaving] = useState('idle');

  // Grid width measurement
  const { width: gridWidth, containerRef: gridRef } = useContainerWidth({ initialWidth: 1200 });

  // Guardado debounced a Supabase, por dashboard
  const saveTimers = useRef({});
  const scheduleSave = useCallback((layout) => {
    const id = layout.id;
    if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
    setSaving('saving');
    saveTimers.current[id] = setTimeout(async () => {
      const ok = await saveDashboard(toRecord(layout));
      setSaving(ok ? 'saved' : 'error');
      if (ok) setTimeout(() => setSaving('idle'), 1500);
    }, 700);
  }, []);

  // Init: cargar dashboards desde Supabase (compartidos). Migrar localStorage si la
  // tabla está vacía y había layouts antiguos. Si todo vacío → crear uno por defecto.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchDashboards();
      if (cancelled) return;
      if (remote.length > 0) {
        const mapped = remote.map(fromRecord);
        setLayouts(mapped);
        const savedActive = loadActiveId();
        setActiveId(
          savedActive && mapped.find((l) => l.id === savedActive) ? savedActive : mapped[0].id
        );
        return;
      }
      // Migración desde localStorage (versión vieja del builder)
      let legacy = [];
      try {
        const raw = localStorage.getItem('ptm_builder_layouts');
        if (raw) legacy = JSON.parse(raw);
      } catch {
        /* ignore */
      }
      const seed =
        legacy.length > 0
          ? legacy.map((l) =>
              l.pages
                ? l
                : {
                    ...l,
                    pages: [
                      {
                        id: genPageId(),
                        name: 'Hoja 1',
                        widgets: l.widgets || [],
                        gridLayout: l.gridLayout || []
                      }
                    ]
                  }
            )
          : [
              {
                id: 'dash_' + Date.now(),
                name: 'Mi Dashboard',
                owner: user?.nombre || '',
                minRoleEdit: 'supervisor',
                pages: [{ id: genPageId(), name: 'Hoja 1', widgets: [], gridLayout: [] }]
              }
            ];
      setLayouts(seed);
      setActiveId(seed[0].id);
      saveActiveId(seed[0].id);
      // subir a Supabase
      for (const l of seed) await saveDashboard(toRecord(l));
      if (legacy.length > 0) {
        try {
          localStorage.removeItem('ptm_builder_layouts');
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = useMemo(() => layouts.find((l) => l.id === activeId) || null, [layouts, activeId]);
  const canEdit = useMemo(
    () => (active ? puedeEditar(rol, active.minRoleEdit || 'supervisor') : false),
    [active, rol]
  );

  // Hoja activa dentro del dashboard. Si el id guardado no existe (cambió de
  // dashboard, hoja borrada), cae a la primera hoja.
  const activePage = useMemo(() => {
    if (!active || active.pages.length === 0) return null;
    return active.pages.find((p) => p.id === activePageId) || active.pages[0];
  }, [active, activePageId]);

  // Al cambiar de dashboard, seleccionar su primera hoja.
  useEffect(() => {
    if (!active) return;
    if (!active.pages.some((p) => p.id === activePageId)) {
      setActivePageId(active.pages[0]?.id || '');
    }
  }, [activeId, active, activePageId]);

  const updateActive = useCallback(
    (patch) => {
      setLayouts((prev) => {
        const next = prev.map((l) => (l.id === activeId ? { ...l, ...patch } : l));
        const updated = next.find((l) => l.id === activeId);
        if (updated) scheduleSave(updated);
        return next;
      });
    },
    [activeId, scheduleSave]
  );

  // Actualiza los widgets/grid de la HOJA activa dentro del dashboard activo.
  const updateActivePage = useCallback(
    (patch) => {
      setLayouts((prev) => {
        const pageId = activePage?.id;
        const next = prev.map((l) =>
          l.id !== activeId
            ? l
            : {
                ...l,
                pages: l.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p))
              }
        );
        const updated = next.find((l) => l.id === activeId);
        if (updated) scheduleSave(updated);
        return next;
      });
    },
    [activeId, activePage, scheduleSave]
  );

  // Cambiar rol (selector manual de respaldo). El rol real se deriva de los permisos.
  const handleSetRol = useCallback(
    (r) => {
      if (!puedeEditar(r, active?.minRoleEdit || 'supervisor')) setEditMode(false);
    },
    [active]
  );

  // Rango de fecha efectivo
  const dateRange = useMemo(() => {
    if (datePreset === 'custom' && customFrom && customTo)
      return { from: customFrom, to: customTo };
    return presetToRange(datePreset);
  }, [datePreset, customFrom, customTo]);

  // Load data (refetch al cambiar dateRange)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [main, audit, trend, calc, ops] = await Promise.all([
        fetchDashboardData(dateRange.from, dateRange.to),
        fetchAuditStats(),
        fetchTendenciaHistorica(6),
        fetchCalculatedFields(),
        fetchOperacionesRows()
      ]);
      setDashData({ ...main, auditKpis: audit.operadores, tendencia: trend });
      setCalcFields(calc);
      setRawOps(ops);
    } catch (err) {
      console.error('Error loading builder data:', err);
    }
    setLoading(false);
  }, [dateRange]);

  // Recarga solo los campos calculados (tras editarlos en el modal).
  const reloadCalcFields = useCallback(async () => {
    try {
      setCalcFields(await fetchCalculatedFields());
    } catch {
      /* ignore */
    }
  }, []);

  // Filas extendidas (raw + campos calculados). Compiladas UNA vez (extendRows
  // compila cada fórmula una sola vez) y memoizadas → todos los widgets las
  // comparten en un render (cache de resultados, no 75k evaluaciones).
  const extendedOps = useMemo(() => extendRows(rawOps, calcFields), [rawOps, calcFields]);
  const calcMeta = useMemo(
    () => calcFields.map((c) => ({ nombre: c.nombre, tipo: c.tipo })),
    [calcFields]
  );
  // Data combinada que consumen los widgets (agregados + operaciones extendidas).
  const widgetData = useMemo(
    () => (dashData ? { ...dashData, operaciones: extendedOps, _calcFields: calcMeta } : dashData),
    [dashData, extendedOps, calcMeta]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add widget
  const handleAddWidget = useCallback(
    (type, dataSource) => {
      if (!active || !activePage) return;
      const wt = WIDGET_TYPES.find((w) => w.type === type);
      const ds = DATA_SOURCES.find((d) => d.key === dataSource);
      const id = genWidgetId();

      const defaultCfg = { color: '#ea580c' };
      if (type === 'kpi' && ds.type === 'array') {
        // KPI sobre filas (operaciones) → por defecto cuenta filas.
        defaultCfg.agg = 'count';
        defaultCfg.format = 'number';
      } else if (type === 'kpi' && ds.fields.length > 0) {
        defaultCfg.valueField = ds.fields[0].key;
        defaultCfg.format = ds.fields[0].type === 'percent' ? 'percent' : 'number';
      }
      if (['bar-chart', 'line-chart'].includes(type) && ds.type === 'array') {
        defaultCfg.xField = ds.fields.find((f) => f.type === 'string')?.key || ds.fields[0].key;
        defaultCfg.yFields = ds.fields
          .filter((f) => f.type === 'number' || f.type === 'percent')
          .slice(0, 2)
          .map((f, i) => ({ key: f.key, label: f.label, color: getDefaultColor(i) }));
      }
      if (
        ['pie-chart', 'donut-chart', 'horizontal-bars', 'stat-list', 'funnel', 'timeline'].includes(
          type
        ) &&
        ds.type === 'array'
      ) {
        defaultCfg.labelField = ds.fields.find((f) => f.type === 'string')?.key || ds.fields[0].key;
        defaultCfg.valueField =
          ds.fields.find((f) => f.type === 'number')?.key || ds.fields[1]?.key;
      }
      if (type === 'gauge') {
        const pf =
          ds.fields.find((f) => f.type === 'percent') || ds.fields.find((f) => f.type === 'number');
        defaultCfg.valueField = pf?.key;
        defaultCfg.min = 0;
        defaultCfg.max = 100;
        defaultCfg.format = 'percent';
      }
      if (type === 'semaforo') {
        const pf =
          ds.fields.find((f) => f.type === 'percent') || ds.fields.find((f) => f.type === 'number');
        defaultCfg.valueField = pf?.key;
        defaultCfg.format = pf?.type === 'percent' ? 'percent' : 'number';
        defaultCfg.higherIsBetter = true;
        defaultCfg.okThreshold = 85;
        defaultCfg.critThreshold = 50;
      }
      if (type === 'heatmap') {
        const strFields = ds.fields.filter((f) => f.type === 'string');
        defaultCfg.rowField = strFields[0]?.key;
        defaultCfg.colField = strFields[1]?.key || strFields[0]?.key;
        defaultCfg.valueField = ds.fields.find((f) => f.type === 'number')?.key;
      }
      if (type === 'table') {
        defaultCfg.columns = ds.fields.slice(0, 5).map((f) => ({ key: f.key, label: f.label }));
      }
      if (type === 'area-chart' && ds.type === 'array') {
        defaultCfg.xField = ds.fields.find((f) => f.type === 'string')?.key || ds.fields[0].key;
        defaultCfg.yFields = ds.fields
          .filter((f) => f.type === 'number' || f.type === 'percent')
          .slice(0, 2)
          .map((f, i) => ({ key: f.key, label: f.label, color: getDefaultColor(i) }));
        defaultCfg.fillOpacity = 0.3;
      }
      if (type === 'scorecard') {
        defaultCfg.valueField = ds.fields[0]?.key;
        defaultCfg.format = ds.fields[0]?.type === 'percent' ? 'percent' : 'number';
      }
      if (type === 'text') {
        defaultCfg.content = 'Título o nota';
      }
      if (type === 'image') {
        defaultCfg.imageFit = 'contain';
      }

      const widget = {
        id,
        type,
        title: ds.label,
        dataSource,
        config: defaultCfg
      };

      const maxY = activePage.gridLayout.reduce((max, g) => Math.max(max, g.y + g.h), 0);
      const gridItem = {
        i: id,
        x: 0,
        y: maxY,
        w: wt.defaultW,
        h: wt.defaultH,
        minW: wt.minW,
        minH: wt.minH
      };

      updateActivePage({
        widgets: [...activePage.widgets, widget],
        gridLayout: [...activePage.gridLayout, gridItem]
      });

      setConfigWidget(id);
    },
    [active, activePage, updateActivePage]
  );

  // Remove widget
  const handleRemoveWidget = useCallback(
    (id) => {
      if (!activePage) return;
      updateActivePage({
        widgets: activePage.widgets.filter((w) => w.id !== id),
        gridLayout: activePage.gridLayout.filter((g) => g.i !== id)
      });
    },
    [activePage, updateActivePage]
  );

  // Save widget config
  const handleSaveConfig = useCallback(
    (updated) => {
      if (!activePage) return;
      updateActivePage({
        widgets: activePage.widgets.map((w) => (w.id === updated.id ? updated : w))
      });
      setConfigWidget(null);
    },
    [activePage, updateActivePage]
  );

  // Grid layout change
  const handleLayoutChange = useCallback(
    (layout) => {
      if (!activePage || !editMode) return;
      const mapped = Array.from(layout).map((l) => ({
        i: l.i,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        minW: l.minW,
        minH: l.minH
      }));
      updateActivePage({ gridLayout: mapped });
    },
    [activePage, editMode, updateActivePage]
  );

  /* ── Gestión de hojas (pestañas) ── */
  const handleAddPage = useCallback(() => {
    if (!active) return;
    const newPage = {
      id: genPageId(),
      name: `Hoja ${active.pages.length + 1}`,
      widgets: [],
      gridLayout: []
    };
    updateActive({ pages: [...active.pages, newPage] });
    setActivePageId(newPage.id);
  }, [active, updateActive]);

  const handleRenamePage = useCallback(
    (pageId, name) => {
      if (!active) return;
      updateActive({ pages: active.pages.map((p) => (p.id === pageId ? { ...p, name } : p)) });
    },
    [active, updateActive]
  );

  const handleDeletePage = useCallback(
    (pageId) => {
      if (!active || active.pages.length <= 1) return;
      if (!confirm('¿Eliminar esta hoja y todos sus widgets?')) return;
      const next = active.pages.filter((p) => p.id !== pageId);
      updateActive({ pages: next });
      if (activePageId === pageId) setActivePageId(next[0].id);
    },
    [active, activePageId, updateActive]
  );

  // Plantilla "Cumplimiento": crea una hoja poblada con semáforos estándar
  // (Estado cumplimiento, OTIF, Fill Rate, Tardanza) + NV en riesgo + tendencia.
  const handlePlantillaCumplimiento = useCallback(() => {
    if (!active) return;
    const sem = (title, dataSource, valueField, opts) => ({
      id: genWidgetId(),
      type: 'semaforo',
      title,
      dataSource,
      config: {
        valueField,
        format: 'percent',
        higherIsBetter: true,
        okThreshold: 85,
        critThreshold: 60,
        ...opts
      }
    });
    const widgets = [
      sem('Estado Cumplimiento', 'cumplimientoNV', 'pct', {
        okThreshold: 90,
        critThreshold: 70,
        trendField: 'pctATiempo'
      }),
      sem('OTIF', 'otif', 'pct', { okThreshold: 90, critThreshold: 70, trendField: 'otif' }),
      sem('Fill Rate', 'fillRate', 'pct', { okThreshold: 85, critThreshold: 60 }),
      sem('Tardanza Prom (días)', 'kpis', 'leadTimeTardanza', {
        format: 'days',
        higherIsBetter: false,
        okThreshold: 1,
        critThreshold: 5,
        trendField: 'leadTime'
      }),
      {
        id: genWidgetId(),
        type: 'horizontal-bars',
        title: 'NV en riesgo por estado',
        dataSource: 'alertasOperacionales',
        config: { labelField: 'estado', valueField: 'cantidad', color: '#dc2626' }
      },
      {
        id: genWidgetId(),
        type: 'line-chart',
        title: 'Tendencia % A Tiempo / OTIF',
        dataSource: 'tendencia',
        config: {
          xField: 'label',
          yFields: [
            { key: 'pctATiempo', label: '% A Tiempo', color: '#2563eb' },
            { key: 'otif', label: 'OTIF', color: '#16a34a' }
          ]
        }
      }
    ];
    const gridLayout = [
      { i: widgets[0].id, x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: widgets[1].id, x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: widgets[2].id, x: 6, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: widgets[3].id, x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: widgets[4].id, x: 0, y: 3, w: 6, h: 5, minW: 4, minH: 3 },
      { i: widgets[5].id, x: 6, y: 3, w: 6, h: 5, minW: 4, minH: 4 }
    ];
    const newPage = { id: genPageId(), name: 'Cumplimiento', widgets, gridLayout };
    updateActive({ pages: [...active.pages, newPage] });
    setActivePageId(newPage.id);
  }, [active, updateActive]);

  // Plantilla "Gráficos Operacionales": 6 visualizaciones solicitadas
  // Estado Cumplimiento, Fecha Compromiso vs Total NV, NV en Riesgo,
  // Fill Rate, Lead Time, Tardanza.
  const handlePlantillaGraficos = useCallback(() => {
    if (!active) return;
    const widgets = [
      // Fila 1: 4 indicadores clave
      {
        id: genWidgetId(),
        type: 'semaforo',
        title: 'Estado Cumplimiento',
        dataSource: 'cumplimientoNV',
        config: {
          valueField: 'pct',
          format: 'percent',
          higherIsBetter: true,
          okThreshold: 90,
          critThreshold: 70,
          trendField: 'pctATiempo'
        }
      },
      {
        id: genWidgetId(),
        type: 'gauge',
        title: 'Fill Rate',
        dataSource: 'fillRate',
        config: { valueField: 'pct', format: 'percent', min: 0, max: 100 }
      },
      {
        id: genWidgetId(),
        type: 'semaforo',
        title: 'Lead Time Promedio',
        dataSource: 'kpis',
        config: {
          valueField: 'leadTimeTardanza',
          format: 'days',
          higherIsBetter: false,
          okThreshold: 1,
          critThreshold: 5,
          trendField: 'leadTime',
          suffix: ' días'
        }
      },
      {
        id: genWidgetId(),
        type: 'scorecard',
        title: 'Tardanza Promedio',
        dataSource: 'kpis',
        config: {
          valueField: 'leadTimeTardanza',
          format: 'days',
          suffix: ' días',
          color: '#dc2626',
          icon: '⏱'
        }
      },
      // Fila 2: Fecha Compromiso vs Total NV (donut) + NV en Riesgo (barras)
      {
        id: genWidgetId(),
        type: 'donut-chart',
        title: 'Fecha Compromiso vs Total NV',
        dataSource: 'cumplimientoDetalle',
        config: {
          labelField: 'label',
          valueField: 'valor',
          yFields: [{ key: 'valor', label: 'Cantidad', color: '#16a34a' }],
          colorField: 'label'
        }
      },
      {
        id: genWidgetId(),
        type: 'horizontal-bars',
        title: 'NV en Riesgo vs Fecha Compromiso',
        dataSource: 'riesgoCompromiso',
        config: { labelField: 'rango', valueField: 'cantidad', color: '#dc2626' }
      },
      // Fila 3: Lead Time semanal (barras) + Tardanza semanal (área)
      {
        id: genWidgetId(),
        type: 'bar-chart',
        title: 'Lead Time Semanal',
        dataSource: 'leadTimeSemanal',
        config: {
          xField: 'semana',
          yFields: [
            { key: 'dias', label: 'Días promedio', color: '#f59e0b' },
            { key: 'pctAtiempo', label: '% A Tiempo', color: '#16a34a' }
          ]
        }
      },
      {
        id: genWidgetId(),
        type: 'area-chart',
        title: 'Tardanza Semanal',
        dataSource: 'weeklyTrend',
        config: {
          xField: 'semana',
          yFields: [{ key: 'tardanza', label: 'Tardanza (días)', color: '#dc2626' }],
          fillOpacity: 0.3
        }
      },
      // Fila 4: Tendencia histórica
      {
        id: genWidgetId(),
        type: 'line-chart',
        title: 'Tendencia % A Tiempo / OTIF',
        dataSource: 'tendencia',
        config: {
          xField: 'label',
          yFields: [
            { key: 'pctATiempo', label: '% A Tiempo', color: '#2563eb' },
            { key: 'otif', label: 'OTIF', color: '#16a34a' }
          ]
        }
      }
    ];
    const gridLayout = [
      { i: widgets[0].id, x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: widgets[1].id, x: 3, y: 0, w: 3, h: 4, minW: 3, minH: 3 },
      { i: widgets[2].id, x: 6, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: widgets[3].id, x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: widgets[4].id, x: 0, y: 4, w: 5, h: 5, minW: 3, minH: 4 },
      { i: widgets[5].id, x: 5, y: 4, w: 7, h: 5, minW: 4, minH: 3 },
      { i: widgets[6].id, x: 0, y: 9, w: 6, h: 5, minW: 4, minH: 4 },
      { i: widgets[7].id, x: 6, y: 9, w: 6, h: 5, minW: 4, minH: 4 },
      { i: widgets[8].id, x: 0, y: 14, w: 12, h: 5, minW: 4, minH: 4 }
    ];
    const newPage = { id: genPageId(), name: 'Gráficos Operacionales', widgets, gridLayout };
    updateActive({ pages: [...active.pages, newPage] });
    setActivePageId(newPage.id);
  }, [active, updateActive]);

  // Layout manager actions (persistencia inmediata en Supabase)
  const handleSelectLayout = (id) => {
    setActiveId(id);
    saveActiveId(id);
    setLayoutMgrOpen(false);
    setEditMode(false);
  };
  const handleCreateLayout = async () => {
    const newLayout = {
      id: 'dash_' + Date.now(),
      name: `Dashboard ${layouts.length + 1}`,
      owner: user?.nombre || '',
      minRoleEdit: 'supervisor',
      pages: [{ id: genPageId(), name: 'Hoja 1', widgets: [], gridLayout: [] }]
    };
    setLayouts((prev) => [...prev, newLayout]);
    setActiveId(newLayout.id);
    setActivePageId(newLayout.pages[0].id);
    saveActiveId(newLayout.id);
    setLayoutMgrOpen(false);
    await saveDashboard(toRecord(newLayout));
  };
  const handleDeleteLayout = async (id) => {
    const next = layouts.filter((l) => l.id !== id);
    if (next.length === 0) return;
    setLayouts(next);
    if (activeId === id) {
      setActiveId(next[0].id);
      saveActiveId(next[0].id);
    }
    await deleteDashboard(id);
  };
  const handleRenameLayout = (id, name) => {
    setLayouts((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, name } : l));
      const u = next.find((l) => l.id === id);
      if (u) scheduleSave(u);
      return next;
    });
  };
  const handleSetMinRole = (id, minRoleEdit) => {
    setLayouts((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, minRoleEdit } : l));
      const u = next.find((l) => l.id === id);
      if (u) scheduleSave(u);
      return next;
    });
  };

  // Duplicate current layout
  const handleDuplicate = async () => {
    if (!active) return;
    const dup = {
      ...JSON.parse(JSON.stringify(active)),
      id: 'dash_' + Date.now(),
      name: active.name + ' (copia)',
      owner: user?.nombre || ''
    };
    setLayouts((prev) => [...prev, dup]);
    setActiveId(dup.id);
    saveActiveId(dup.id);
    await saveDashboard(toRecord(dup));
  };

  const configWidgetObj = configWidget
    ? activePage?.widgets.find((w) => w.id === configWidget)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-ui-surface={builderV2 ? 'builder-v2' : 'builder-legacy'}
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}
            >
              PTM
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight">
                Dashboard <span className="text-orange-600">Builder</span>
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                {active?.name || '—'} · {activePage?.name || ''} · {activePage?.widgets.length || 0}{' '}
                widgets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Indicador de guardado */}
            <span
              className="text-[11px] w-14 text-right"
              style={{ color: saving === 'error' ? '#c62828' : '#9ca3af' }}
            >
              {saving === 'saving'
                ? 'Guardando…'
                : saving === 'saved'
                  ? 'Guardado ✓'
                  : saving === 'error'
                    ? 'Error'
                    : ''}
            </span>

            {/* Selector de rol (respaldo sin login) */}
            <select
              value={rol}
              onChange={(e) => handleSetRol(e.target.value)}
              className="px-2 py-1.5 text-[12px] rounded-lg border border-gray-200 text-gray-600 bg-white"
              title="Tu rol (decide qué dashboards puedes editar)"
            >
              <option value="operador">Operador</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={() => setLayoutMgrOpen(true)}
              className="px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
            >
              Dashboards
            </button>
            {canEdit && (
              <button
                onClick={handleDuplicate}
                className="px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
              >
                Duplicar
              </button>
            )}
            {editMode && canEdit && (
              <button
                onClick={handlePlantillaCumplimiento}
                className="px-3 py-1.5 text-[12px] rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 font-medium"
                title="Crea una hoja 'Cumplimiento' con semáforos estándar + riesgo + tendencia"
              >
                Plantilla
              </button>
            )}
            {editMode && canEdit && (
              <button
                onClick={handlePlantillaGraficos}
                className="px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 font-medium transition-colors"
                title="Crea una hoja con 6 gráficos: Cumplimiento, Fill Rate, Lead Time, Tardanza, NV en Riesgo"
              >
                Gráficos
              </button>
            )}
            {editMode && canEdit && (
              <button
                onClick={() => setCalcOpen(true)}
                className="px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 font-medium transition-colors"
                title="Define métricas con fórmulas (HORAS_RESTANTES, PRIORIDAD, RIESGO_OTIF…)"
              >
                ƒ Campos calc.
              </button>
            )}
            {editMode && canEdit && (
              <button
                onClick={() => setCatalogOpen(true)}
                className="px-3 py-1.5 text-[12px] rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-medium shadow-sm"
              >
                + Agregar Widget
              </button>
            )}
            {canEdit ? (
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-1.5 text-[12px] rounded-lg font-semibold transition-all ${
                  editMode
                    ? 'bg-[#ea580c] text-white hover:bg-[#c2410c]'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700'
                }`}
              >
                {editMode ? 'Listo' : 'Editar'}
              </button>
            ) : (
              <span
                className="px-3 py-1.5 text-[12px] rounded-lg bg-gray-100 text-gray-400 font-medium"
                title={`Requiere rol ${active?.minRoleEdit || 'supervisor'}+`}
              >
                Solo lectura
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Barra de filtros de fecha */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-[53px] z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide shrink-0">
            Período:
          </span>
          <div className="flex gap-1 flex-wrap">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setDatePreset(p.key)}
                className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors ${datePreset === p.key ? 'bg-[#ea580c] text-white' : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {datePreset === 'custom' && (
            <div className="flex items-center gap-1.5 ml-2">
              <input
                type="date"
                className="px-2 py-1 text-[12px] border border-gray-200 rounded-md"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-gray-400 text-[11px]">→</span>
              <input
                type="date"
                className="px-2 py-1 text-[12px] border border-gray-200 rounded-md"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}
          <span className="text-[10px] text-gray-400 ml-auto shrink-0">
            {dateRange.from} — {dateRange.to}
          </span>
          <button
            onClick={loadData}
            className="px-2 py-1 text-[11px] text-gray-500 hover:text-[#ea580c] border border-gray-200 rounded-md hover:border-orange-200"
            title="Refrescar datos"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Barra de hojas (pestañas) */}
      {active && (
        <div className="bg-white border-b border-gray-200 sticky top-[93px] z-40">
          <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-1 overflow-x-auto">
            {active.pages.map((p) => {
              const isActive = p.id === activePage?.id;
              return (
                <div key={p.id} className="flex items-center shrink-0">
                  {renamingPage === p.id ? (
                    <input
                      autoFocus
                      defaultValue={p.name}
                      onBlur={(e) => {
                        handleRenamePage(p.id, e.target.value.trim() || p.name);
                        setRenamingPage(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenamePage(p.id, e.target.value.trim() || p.name);
                          setRenamingPage(null);
                        }
                        if (e.key === 'Escape') setRenamingPage(null);
                      }}
                      className="my-1.5 px-2 py-1 text-[12px] border border-orange-300 rounded-md w-28 focus:outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => setActivePageId(p.id)}
                      onDoubleClick={() => {
                        if (editMode && canEdit) setRenamingPage(p.id);
                      }}
                      className={`px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-[#ea580c] text-[#ea580c]'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                      title={editMode && canEdit ? 'Doble clic para renombrar' : undefined}
                    >
                      {p.name}
                      {isActive && (
                        <span className="ml-1.5 text-[10px] text-gray-400">
                          ({p.widgets.length})
                        </span>
                      )}
                    </button>
                  )}
                  {editMode && canEdit && isActive && active.pages.length > 1 && (
                    <button
                      onClick={() => handleDeletePage(p.id)}
                      className="text-gray-300 hover:text-red-500 text-[11px] px-1"
                      title="Eliminar hoja"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
            {editMode && canEdit && (
              <button
                onClick={handleAddPage}
                className="px-2.5 py-2 text-[12px] text-gray-400 hover:text-[#ea580c] font-medium shrink-0"
                title="Nueva hoja"
              >
                + Hoja
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className={
          builderV2
            ? 'mx-auto grid max-w-[1920px] grid-cols-1 gap-3 px-3 py-4 xl:grid-cols-[220px_minmax(0,1fr)_260px]'
            : ''
        }
      >
        {builderV2 && (
          <aside
            className="sticky top-[142px] hidden h-[calc(100vh-158px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:block"
            aria-label="Paleta de widgets"
          >
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              Paleta
            </p>
            <h2 className="mb-3 text-sm font-black text-slate-900">Widgets</h2>
            <div className="space-y-1.5">
              {WIDGET_TYPES.map((widgetType) => (
                <button
                  key={widgetType.type}
                  type="button"
                  disabled={!editMode || !canEdit}
                  onClick={() => handleAddWidget(widgetType.type, DATA_SOURCES[0]?.key)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="mr-2 font-mono text-xs text-orange-600">{widgetType.icon}</span>
                  <span className="text-xs font-bold text-slate-700">{widgetType.label}</span>
                </button>
              ))}
            </div>
          </aside>
        )}
        <main
          ref={gridRef}
          className={
            builderV2
              ? 'min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3'
              : 'max-w-[1600px] mx-auto px-4 py-4'
          }
        >
          {activePage && activePage.widgets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4">
                +
              </div>
              <p className="text-lg font-medium mb-2">Hoja vacía</p>
              {canEdit ? (
                <>
                  <p className="text-sm mb-4">Agrega widgets para empezar a construir esta hoja</p>
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setCatalogOpen(true);
                    }}
                    className="px-5 py-2 bg-[#ea580c] text-white rounded-xl font-semibold hover:bg-[#c2410c] transition-colors"
                  >
                    + Agregar primer widget
                  </button>
                </>
              ) : (
                <p className="text-sm">
                  No tienes permiso para editar este dashboard (requiere rol{' '}
                  {active?.minRoleEdit || 'supervisor'}+).
                </p>
              )}
            </div>
          )}

          {activePage && activePage.widgets.length > 0 && (
            <ResponsiveGridLayout
              key={activePage.id}
              className="layout"
              width={gridWidth}
              layouts={{ lg: activePage.gridLayout }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={60}
              dragConfig={{
                enabled: editMode && canEdit,
                handle: '.drag-handle',
                bounded: false,
                threshold: 3
              }}
              resizeConfig={{ enabled: editMode && canEdit, handles: ['se'] }}
              onLayoutChange={handleLayoutChange}
              compactor={verticalCompactor}
              margin={[12, 12]}
            >
              {activePage.widgets.map((w) => (
                <div key={w.id}>
                  <WidgetRenderer
                    widget={w}
                    data={widgetData}
                    editMode={editMode && canEdit}
                    onEdit={() => setConfigWidget(w.id)}
                    onRemove={() => handleRemoveWidget(w.id)}
                  />
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </main>
        {builderV2 && (
          <aside
            className="sticky top-[142px] hidden h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:block"
            aria-label="Propiedades del dashboard"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              Propiedades
            </p>
            <h2 className="mt-1 truncate text-sm font-black text-slate-900">
              {active?.name || 'Sin dashboard'}
            </h2>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Hoja</dt>
                <dd className="font-bold text-slate-800">{activePage?.name || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Widgets</dt>
                <dd className="font-bold text-slate-800">{activePage?.widgets.length || 0}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Modo</dt>
                <dd className="font-bold text-slate-800">
                  {editMode ? 'Edición' : 'Vista previa'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Guardado</dt>
                <dd className="font-bold text-slate-800">
                  {saving === 'saving' ? 'En curso' : saving === 'error' ? 'Error' : 'Sincronizado'}
                </dd>
              </div>
            </dl>
          </aside>
        )}
      </div>

      {/* Modals */}
      {catalogOpen && (
        <WidgetCatalog onAdd={handleAddWidget} onClose={() => setCatalogOpen(false)} />
      )}

      {calcOpen && (
        <CamposCalculados
          editable={!!canEdit}
          onClose={() => {
            setCalcOpen(false);
            reloadCalcFields();
          }}
        />
      )}

      {configWidgetObj && (
        <ConfigPanel
          widget={configWidgetObj}
          onSave={handleSaveConfig}
          onCancel={() => setConfigWidget(null)}
          calcFields={calcMeta}
        />
      )}

      {layoutMgrOpen && (
        <LayoutManager
          layouts={layouts}
          activeId={activeId}
          rol={rol}
          onSelect={handleSelectLayout}
          onCreate={handleCreateLayout}
          onDelete={handleDeleteLayout}
          onRename={handleRenameLayout}
          onSetMinRole={handleSetMinRole}
          onClose={() => setLayoutMgrOpen(false)}
        />
      )}

      <style>{`
        .react-grid-item.react-grid-placeholder {
          background: #ea580c !important;
          opacity: 0.15 !important;
          border-radius: 12px !important;
        }
        .react-grid-item > .react-resizable-handle::after {
          border-right-color: #ea580c !important;
          border-bottom-color: #ea580c !important;
        }
      `}</style>
    </div>
  );
}
