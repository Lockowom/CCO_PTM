// ── Inventario → Análisis de Códigos ────────────────────────────────────────
// Port nativo del Excel "STOCK NAME" de PTM: clasifica cada SKU del stock según
// la nueva nomenclatura (P/S vs Antiguo), detecta antiguos con disponible,
// duplicados contra P/S, no activos con stock y anomalías de formato, con el
// resumen de avance de la actualización de códigos. Las secciones se navegan
// desde el MENÚ (Inventario → Análisis · …) vía ?tab=, como el resto de los
// módulos. Datos: tms_inventario_general (reporte IW cargado desde el Resumen,
// o Carga Masiva → Consolidado) + catálogo ACTIVO cargado desde esta pantalla.
import { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Search,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Layers,
  Database,
  Send,
  X,
  ExternalLink,
  Mail,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { puedeVerTab } from '../../constants/permissions';
import { exportToExcel } from '../../lib/exportExcel';
import {
  useAnalisisResumen,
  useAnalisisCodigos,
  useCargarActivo,
  parseActivoFile,
  useCargarStock,
  parseStockFile,
  useEnviarEmil
} from '../../services/analisisService';

const TABS = [
  'resumen',
  'antiguos',
  'antiguos_disp',
  'no_activos_stock',
  'duplicados',
  'anomalias',
  'detalle'
];

const n = (v) => Number(v || 0).toLocaleString('es-CL');
const pct = (a, b) => (Number(b) > 0 ? `${((Number(a) / Number(b)) * 100).toFixed(1)}%` : '—');
const fechaCL = (d) =>
  d ? new Date(d).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : 'nunca';

const ESTADO_CLS = {
  'Nuevo (P)': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Nuevo (S)': 'bg-sky-100 text-sky-700 border-sky-200',
  Antiguo: 'bg-amber-100 text-amber-700 border-amber-200'
};
const ACTIVO_CLS = {
  Si: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  No: 'bg-rose-100 text-rose-700 border-rose-200',
  'No encontrado': 'bg-slate-100 text-slate-500 border-slate-200'
};

// Fila → objeto exportable con los mismos encabezados del Excel original.
const filaExport = (r) => ({
  'Cod. Producto': r.codigo,
  Producto: r.producto || '',
  'U. Medida': r.unidad_medida || '',
  Disponible: Number(r.disponible || 0),
  Reserva: Number(r.reserva || 0),
  Transitoria: Number(r.transitoria || 0),
  Consignación: Number(r.consignacion || 0),
  'Stock Total': Number(r.stock_total || 0),
  'Estado Código': r.estado,
  'Antiguo con Disponible': r.antiguo_disponible ? '⚠ Sí' : '',
  '¿Existe con P/S?': r.duplicado || '',
  'Código P/S equivalente': r.ps_equivalente || '',
  'Producto Activo': r.activo,
  'No Activo con Stock': r.no_activo_stock ? '⚠ Sí' : '',
  Anomalía: r.anomalia || ''
});

export default function AnalisisCodigos() {
  const { user, hasPermission } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const canCargar =
    isAdmin || hasPermission('manage_data_import') || hasPermission('manage_inventory');

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'resumen');
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tab) setTab(t);
    else if (!t && tab !== 'resumen') setTab('resumen');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const puedeTab = (id) => puedeVerTab(hasPermission, '/inventory/analisis', id);
  const activeTab =
    TABS.includes(tab) && puedeTab(tab) ? tab : TABS.find((t) => puedeTab(t)) || 'resumen';

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-700">
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <BarChart3 size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Análisis de <span className="text-orange-600">Códigos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Actualización a nomenclatura P/S · antiguos con stock · duplicados · anomalías
            </p>
          </div>
        </div>
      </div>

      {activeTab === 'resumen' && <TabResumen canCargar={canCargar} />}
      {activeTab === 'antiguos' && (
        <TablaAnalisis filtro="antiguos" titulo="Códigos antiguos (faltan actualizar a P/S)" />
      )}
      {activeTab === 'antiguos_disp' && (
        <TablaAnalisis filtro="antiguos_disp" titulo="Antiguos que AÚN tienen Disponible" alerta />
      )}
      {activeTab === 'no_activos_stock' && (
        <TablaAnalisis filtro="no_activos_stock" titulo="Productos NO activos con stock" alerta />
      )}
      {activeTab === 'duplicados' && (
        <TablaAnalisis
          filtro="duplicados"
          titulo="Antiguos duplicados (la descripción ya existe con P/S)"
        />
      )}
      {activeTab === 'anomalias' && (
        <TablaAnalisis
          filtro="anomalias"
          titulo="Anomalías (códigos mal escritos)"
          conDiagnostico
        />
      )}
      {activeTab === 'detalle' && <TabDetalle />}
    </div>
  );
}

// ─── Resumen (la hoja "Resumen" del Excel) + fuentes de datos ────────────────
function TabResumen({ canCargar }) {
  const { data: r = {}, isLoading, refetch, isFetching } = useAnalisisResumen();
  const cargar = useCargarActivo();
  const cargarStock = useCargarStock();
  const fileRef = useRef(null);
  const stockRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [subiendoStock, setSubiendoStock] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSubiendo(true);
    try {
      const rows = await parseActivoFile(file);
      const res = await cargar.mutateAsync(rows);
      toast.success(`Catálogo ACTIVO cargado: ${n(res.total)} códigos`);
    } catch (err) {
      toast.error(err.message || 'No se pudo cargar el catálogo');
    } finally {
      setSubiendo(false);
    }
  };

  const onFileStock = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSubiendoStock(true);
    try {
      const rows = await parseStockFile(file);
      const res = await cargarStock.mutateAsync(rows);
      toast.success(`Stock cargado: ${n(res.total)} SKUs (reemplazó la carga anterior)`);
    } catch (err) {
      toast.error(err.message || 'No se pudo cargar el reporte de stock');
    } finally {
      setSubiendoStock(false);
    }
  };

  const sinStock = !isLoading && Number(r.total || 0) === 0;
  const sinActivo = !isLoading && Number(r.activo_filas || 0) === 0;

  const Kpi = ({ label, value, sub, tone }) => (
    <div
      className={`rounded-2xl border p-4 ${tone === 'alert' ? 'bg-rose-50 border-rose-200' : tone === 'ok' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}
    >
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</div>
      <div
        className={`text-2xl font-black ${tone === 'alert' ? 'text-rose-600' : tone === 'ok' ? 'text-emerald-600' : 'text-slate-900'}`}
      >
        {isLoading ? '…' : n(value)}
      </div>
      {sub && <div className="text-[11px] text-slate-400 font-bold">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Fuentes de datos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-black text-slate-900 flex items-center gap-2">
            <Database size={17} className="text-orange-500" /> Fuentes de datos
          </h2>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div
            className={`rounded-xl border p-4 ${sinStock ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}
          >
            <div className="font-bold text-slate-800 text-sm">1 · Reporte de stock (ERP)</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {n(r.total)} SKUs · última carga: {fechaCL(r.stock_cargado_el)}
            </div>
            {sinStock && (
              <div className="text-xs font-bold text-amber-700 mt-1">
                ⚠ Aún no hay stock cargado: el análisis saldrá vacío.
              </div>
            )}
            {canCargar && (
              <button
                onClick={() => stockRef.current?.click()}
                disabled={subiendoStock}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 disabled:opacity-50"
              >
                {subiendoStock ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Upload size={13} />
                )}{' '}
                Cargar reporte de stock (Excel IW)
              </button>
            )}
            <input
              ref={stockRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onFileStock}
              className="hidden"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Detecta las columnas por nombre ("Cod. Producto", "Disponible", …) y reemplaza la
              carga anterior. Alternativa:{' '}
              <Link to="/inbound/data-import" className="underline">
                Carga Masiva → Consolidado
              </Link>{' '}
              (requiere columna Bodega).
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 ${sinActivo ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}
          >
            <div className="font-bold text-slate-800 text-sm">
              2 · Catálogo ACTIVO (Si/No del ERP)
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {n(r.activo_filas)} códigos · última carga: {fechaCL(r.activo_cargado_el)}
            </div>
            {sinActivo && (
              <div className="text-xs font-bold text-amber-700 mt-1">
                ⚠ Sin catálogo, todo saldrá "No encontrado".
              </div>
            )}
            {canCargar && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={subiendo}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 disabled:opacity-50"
              >
                {subiendo ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}{' '}
                Cargar catálogo ACTIVO (Excel)
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onFile}
              className="hidden"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Se actualiza por código (upsert): columnas "Código producto", "Descripción", "U.
              medida" y "Producto Activo".
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de actualización de códigos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
        <h2 className="font-black text-slate-900 flex items-center gap-2">
          <Layers size={17} className="text-orange-500" /> Resumen de actualización de códigos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi label="Total de códigos" value={r.total} sub="100%" />
          <Kpi label="Nuevos con P" value={r.nuevos_p} sub={pct(r.nuevos_p, r.total)} tone="ok" />
          <Kpi label="Nuevos con S" value={r.nuevos_s} sub={pct(r.nuevos_s, r.total)} tone="ok" />
          <Kpi label="Antiguos (faltan P/S)" value={r.antiguos} sub={pct(r.antiguos, r.total)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi
            label="Antiguos con Disponible"
            value={r.antiguos_disp}
            sub={`${pct(r.antiguos_disp, r.antiguos)} de los antiguos`}
            tone="alert"
          />
          <Kpi label="Antiguos sin Disponible" value={r.antiguos_sin_disp} sub="solo renombrar" />
          <Kpi
            label="Antiguos duplicados"
            value={r.antiguos_dup}
            sub="descripción ya existe con P/S"
          />
          <Kpi
            label="Anomalías"
            value={r.anomalias}
            sub="códigos mal escritos"
            tone={Number(r.anomalias) > 0 ? 'alert' : undefined}
          />
        </div>
      </div>

      {/* Estado activo / no activo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
        <h2 className="font-black text-slate-900 flex items-center gap-2">
          <CheckCircle2 size={17} className="text-orange-500" /> Estado Activo / No Activo
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi
            label="Productos activos (Si)"
            value={r.activos}
            sub={pct(r.activos, r.total)}
            tone="ok"
          />
          <Kpi label="No activos (No)" value={r.no_activos} sub={pct(r.no_activos, r.total)} />
          <Kpi
            label="No encontrados en ACTIVO"
            value={r.no_encontrados}
            sub={pct(r.no_encontrados, r.total)}
          />
          <Kpi
            label="NO activos que AÚN tienen stock"
            value={r.no_activos_stock}
            sub={`${pct(r.no_activos_stock, r.no_activos)} de los no activos`}
            tone="alert"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Tabla de una vista (búsqueda, filtros tipo tabla dinámica y export) ─────
// Referencia ESTABLE para "sin datos": un `= []` inline crearía un array nuevo
// en cada render y el ciclo memo→onProcesadas→setVis entraría en loop infinito.
const SIN_FILAS = [];

function TablaAnalisis({ filtro, titulo, alerta = false, conDiagnostico = false }) {
  const [q, setQ] = useState('');
  const [qLive, setQLive] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQ(qLive.trim()), 400);
    return () => clearTimeout(t);
  }, [qLive]);
  const { data: rows = SIN_FILAS, isLoading } = useAnalisisCodigos(filtro, q);
  const [vis, setVis] = useState(SIN_FILAS);
  const [sel, setSel] = useState(() => new Set());

  // El export respeta los filtros aplicados en la tabla.
  const exportar = () =>
    exportToExcel({
      filename: `analisis_${filtro}`,
      sheets: [{ name: titulo.slice(0, 30), rows: (vis.length ? vis : rows).map(filaExport) }]
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-black text-slate-900 flex items-center gap-2">
          {alerta ? (
            <AlertTriangle size={17} className="text-rose-500" />
          ) : conDiagnostico ? (
            <FileWarning size={17} className="text-amber-500" />
          ) : (
            <Layers size={17} className="text-orange-500" />
          )}
          {titulo}{' '}
          <span className="text-slate-400 font-bold text-sm">
            ({vis.length !== rows.length ? `${n(vis.length)} de ${n(rows.length)}` : n(rows.length)}
            )
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={qLive}
              onChange={(e) => setQLive(e.target.value)}
              placeholder="Buscar código o producto…"
              className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-56"
            />
          </div>
          <button
            onClick={exportar}
            disabled={!rows.length}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            <Download size={13} /> Excel
          </button>
        </div>
      </div>
      <BarraSeleccion sel={sel} setSel={setSel} rows={rows} />
      <Tabla
        rows={rows}
        isLoading={isLoading}
        conDiagnostico={conDiagnostico}
        sel={sel}
        setSel={setSel}
        onProcesadas={setVis}
      />
    </div>
  );
}

// ─── Barra de acciones sobre la selección → Traspaso / Ajuste / Correo ───────
function BarraSeleccion({ sel, setSel, rows }) {
  const [modal, setModal] = useState(null); // 'traspasos' | 'ajustes' | 'correo'
  if (!sel.size) return null;
  const seleccionadas = rows.filter((r) => sel.has(r.codigo));
  return (
    <div className="flex items-center gap-2 flex-wrap bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
      <span className="text-xs font-black text-orange-700">
        {n(sel.size)} seleccionado{sel.size === 1 ? '' : 's'}
      </span>
      <button
        onClick={() => setModal('correo')}
        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 inline-flex items-center gap-1.5"
      >
        <Mail size={13} /> Correo Actualización de Códigos
      </button>
      <button
        onClick={() => setModal('ajustes')}
        className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 inline-flex items-center gap-1.5"
      >
        <Send size={13} /> Generar Ajuste
      </button>
      <button
        onClick={() => setModal('traspasos')}
        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 inline-flex items-center gap-1.5"
      >
        <Send size={13} /> Generar Traspaso
      </button>
      <button
        onClick={() => setSel(new Set())}
        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-500 hover:bg-slate-50 inline-flex items-center gap-1"
      >
        <X size={13} /> Limpiar
      </button>
      {(modal === 'traspasos' || modal === 'ajustes') && (
        <EnviarEmilModal
          tipo={modal}
          rows={seleccionadas}
          onClose={(ok) => {
            setModal(null);
            if (ok) setSel(new Set());
          }}
        />
      )}
      {modal === 'correo' && (
        <CorreoActualizacionModal rows={seleccionadas} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ─── Correo "Actualización de Códigos": crear con P o S (+vencimiento si P) ──
// Por cada código antiguo seleccionado se informa CÓMO debe crearse el código
// nuevo: con sufijo P (requiere fecha de vencimiento) o S, más el código
// P/S equivalente si ya existe (editable). Genera el correo con tabla HTML.
function CorreoActualizacionModal({ rows, onClose }) {
  const { user } = useAuth();
  const [dest, setDest] = useState(() => {
    try {
      return localStorage.getItem('analisis_correo_dest') || '';
    } catch {
      return '';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('analisis_correo_dest', dest);
    } catch {
      /* sin storage */
    }
  }, [dest]);
  const [obs, setObs] = useState('');
  const [info, setInfo] = useState(() => {
    const m = {};
    rows.forEach((r) => {
      m[r.codigo] = {
        // Si ya existe un equivalente, hereda su sufijo; si no, P por defecto.
        tipo: (r.ps_equivalente || '').trim().toUpperCase().endsWith('S') ? 'S' : 'P',
        venc: '',
        nuevo: r.ps_equivalente || ''
      };
    });
    return m;
  });
  const set = (codigo, campo, v) =>
    setInfo((m) => ({ ...m, [codigo]: { ...m[codigo], [campo]: v } }));
  const sinVenc = rows.filter((r) => info[r.codigo]?.tipo === 'P' && !info[r.codigo]?.venc);

  const hoy = new Date().toLocaleDateString('es-CL');
  const fmtVenc = (v) => (v ? v.split('-').reverse().join('-') : 'POR DEFINIR');
  const asunto = `Actualización de códigos a nomenclatura P/S — ${rows.length} código(s)`;

  const cuerpo = [
    'Estimados:',
    '',
    `Se solicita la ACTUALIZACIÓN DE CÓDIGOS a la nomenclatura P/S de los siguientes productos (${hoy}):`,
    '',
    ...rows.flatMap((r) => {
      const i = info[r.codigo] || {};
      return [
        `• ${r.codigo} — ${r.producto || ''} (${r.unidad_medida || 'UNI'})`,
        `   Stock: Disponible ${n(r.disponible)} · Total ${n(r.stock_total)}`,
        `   Crear con: ${i.tipo}${i.tipo === 'P' ? ` · Vencimiento: ${fmtVenc(i.venc)}` : ''}${i.nuevo ? ` · Código nuevo: ${i.nuevo}` : ' · Código nuevo: POR CREAR'}`
      ];
    }),
    ...(obs.trim() ? ['', `Observaciones: ${obs.trim()}`] : []),
    '',
    'Atentamente,',
    user?.nombre || '',
    'Generado desde CCO · Análisis de Códigos'
  ].join('\n');

  const td = 'padding:3px 8px;border:1px solid #cbd5e1';
  const filaHtml = (r) => {
    const i = info[r.codigo] || {};
    return `<tr><td style="${td};font-family:monospace">${r.codigo}</td><td style="${td}">${(r.producto || '').replace(/</g, '&lt;')}</td><td style="${td}">${r.unidad_medida || ''}</td><td style="${td};text-align:right">${n(r.disponible)}</td><td style="${td};text-align:right">${n(r.stock_total)}</td><td style="${td};text-align:center;font-weight:bold;color:${i.tipo === 'P' ? '#c2410c' : '#0369a1'}">${i.tipo}</td><td style="${td};text-align:center">${i.tipo === 'P' ? fmtVenc(i.venc) : '—'}</td><td style="${td};font-family:monospace;font-weight:bold">${i.nuevo || 'POR CREAR'}</td></tr>`;
  };
  const html = `<p>Estimados:</p><p>Se solicita la <b>ACTUALIZACIÓN DE CÓDIGOS</b> a la nomenclatura P/S de los siguientes productos (${hoy}):</p>
<table style="border-collapse:collapse;font-size:13px"><tr>${['Código antiguo', 'Descripción', 'UM', 'Disponible', 'Stock Total', 'Crear con', 'Vencimiento', 'Código nuevo'].map((h) => `<th style="padding:4px 8px;border:1px solid #94a3b8;background:#f1f5f9;text-align:left">${h}</th>`).join('')}</tr>${rows.map(filaHtml).join('')}</table>${obs.trim() ? `<p><b>Observaciones:</b> ${obs.trim().replace(/</g, '&lt;')}</p>` : ''}<p>Atentamente,<br/>${user?.nombre || ''}<br/><span style="color:#94a3b8;font-size:11px">Generado desde CCO · Análisis de Códigos</span></p>`;

  const validar = () => {
    if (sinVenc.length) {
      toast.error(
        `Falta la fecha de vencimiento en ${n(sinVenc.length)} código(s) que se crean con P.`
      );
      return false;
    }
    return true;
  };
  const copiar = async () => {
    if (!validar()) return;
    try {
      if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([cuerpo], { type: 'text/plain' })
          })
        ]);
      } else {
        await navigator.clipboard.writeText(cuerpo);
      }
      toast.success('Correo copiado — pégalo en Outlook (mantiene la tabla)');
    } catch (_) {
      try {
        await navigator.clipboard.writeText(cuerpo);
        toast.success('Correo copiado (texto plano)');
      } catch (e) {
        toast.error('No se pudo copiar');
      }
    }
  };
  const abrirCorreo = () => {
    if (!validar()) return;
    const url = `mailto:${encodeURIComponent(dest)}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    if (url.length > 7500) {
      toast.info('Selección muy grande para abrir directo: usa "Copiar" y pégalo en el correo.');
      return;
    }
    window.location.href = url;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-4xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Mail size={17} className="text-indigo-500" /> Correo · Actualización de Códigos (
            {n(rows.length)})
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                Para (opcional)
              </label>
              <input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                placeholder="correo@ptm.cl; otro@ptm.cl"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                Observaciones (opcional)
              </label>
              <input
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Comentario general del correo…"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/60">
                  <th className="py-2 px-3">Código antiguo</th>
                  <th className="py-2 pr-3">Producto</th>
                  <th className="py-2 pr-3 text-right">Disp.</th>
                  <th className="py-2 pr-3">Crear con</th>
                  <th className="py-2 pr-3">Vencimiento</th>
                  <th className="py-2 pr-3">Código nuevo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const i = info[r.codigo] || {};
                  return (
                    <tr key={r.codigo} className="border-b border-slate-50 align-middle">
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {r.codigo}
                      </td>
                      <td
                        className="py-1.5 pr-3 text-slate-600 max-w-[16rem] truncate"
                        title={r.producto || ''}
                      >
                        {r.producto || '—'}
                      </td>
                      <td className="py-1.5 pr-3 text-right font-bold">{n(r.disponible)}</td>
                      <td className="py-1.5 pr-3">
                        <select
                          value={i.tipo}
                          onChange={(e) => set(r.codigo, 'tipo', e.target.value)}
                          className={`px-2 py-1 rounded-lg border text-xs font-black ${i.tipo === 'P' ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-sky-300 bg-sky-50 text-sky-700'}`}
                        >
                          <option value="P">P (con vencimiento)</option>
                          <option value="S">S (sin vencimiento)</option>
                        </select>
                      </td>
                      <td className="py-1.5 pr-3">
                        {i.tipo === 'P' ? (
                          <input
                            type="date"
                            value={i.venc}
                            onChange={(e) => set(r.codigo, 'venc', e.target.value)}
                            className={`px-2 py-1 rounded-lg border text-xs ${i.venc ? 'border-slate-200' : 'border-rose-300 bg-rose-50'}`}
                          />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3">
                        <input
                          value={i.nuevo}
                          onChange={(e) => set(r.codigo, 'nuevo', e.target.value)}
                          placeholder="POR CREAR"
                          className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono w-36"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sinVenc.length > 0 && (
            <p className="text-xs font-bold text-rose-600">
              ⚠ Falta la fecha de vencimiento en {n(sinVenc.length)} código(s) con creación P.
            </p>
          )}

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Vista previa</div>
            <pre className="text-[11px] text-slate-600 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">
              {cuerpo}
            </pre>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
          <button
            onClick={copiar}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 inline-flex items-center gap-1.5"
          >
            <Copy size={13} /> Copiar (con tabla)
          </button>
          <button
            onClick={abrirCorreo}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 inline-flex items-center gap-1.5"
          >
            <Mail size={13} /> Abrir en correo
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal: envía la selección al módulo Traspasos y Ajustes (aparecen PENDIENTE).
function EnviarEmilModal({ tipo, rows, onClose }) {
  const enviar = useEnviarEmil();
  const esAjuste = tipo === 'ajustes';
  const [accion, setAccion] = useState('DESCONTAR');
  const [cantidadDe, setCantidadDe] = useState('disponible');
  const [obs, setObs] = useState('Actualización de código a nomenclatura P/S');
  const conEquiv = rows.filter((r) => r.ps_equivalente).length;

  const submit = async () => {
    try {
      const res = await enviar.mutateAsync({
        tipo,
        rows,
        accion,
        obs: esAjuste ? obs : '',
        cantidadDe
      });
      toast.success(
        `${n(res.agregados)} registro(s) enviados a ${esAjuste ? 'Ajustes' : 'Traspasos'}${res.omitidos ? ` · ${n(res.omitidos)} ya estaban en la lista` : ''}. Ábrelos en Inventario → Traspasos y Ajustes.`
      );
      onClose(true);
    } catch (e) {
      toast.error(e.message || 'No se pudo enviar la selección');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
      onClick={() => onClose(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <Send size={16} className="text-orange-500" /> Generar{' '}
            {esAjuste ? 'Ajuste' : 'Traspaso'} ({n(rows.length)})
          </h3>
          <button onClick={() => onClose(false)} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50 text-xs">
          {rows.slice(0, 12).map((r) => (
            <div key={r.codigo} className="px-3 py-1.5 flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-slate-700">{r.codigo}</span>
              <span className="text-slate-400 truncate flex-1">{r.producto}</span>
              {r.ps_equivalente && (
                <span className="text-indigo-600 font-bold whitespace-nowrap">
                  → {r.ps_equivalente}
                </span>
              )}
            </div>
          ))}
          {rows.length > 12 && (
            <div className="px-3 py-1.5 text-slate-400">… y {n(rows.length - 12)} más</div>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-black text-slate-600">Cantidad a usar:</span>
            <label className="inline-flex items-center gap-1.5 font-bold text-slate-600">
              <input
                type="radio"
                checked={cantidadDe === 'disponible'}
                onChange={() => setCantidadDe('disponible')}
              />{' '}
              Disponible
            </label>
            <label className="inline-flex items-center gap-1.5 font-bold text-slate-600">
              <input
                type="radio"
                checked={cantidadDe === 'total'}
                onChange={() => setCantidadDe('total')}
              />{' '}
              Stock Total
            </label>
          </div>
          {esAjuste && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-black text-slate-600">Acción:</span>
                <select
                  value={accion}
                  onChange={(e) => setAccion(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 font-bold"
                >
                  <option value="DESCONTAR">DESCONTAR (quitar stock)</option>
                  <option value="SUMAR">SUMAR (agregar stock)</option>
                </select>
              </div>
              <input
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Observación (opcional)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
              {conEquiv > 0 && (
                <p className="text-indigo-600 font-bold">
                  {n(conEquiv)} tienen código P/S equivalente: van como recodificación (destino =
                  código nuevo).
                </p>
              )}
            </>
          )}
          <p className="text-slate-400">
            Quedan como <b>PENDIENTE</b> en el módulo; ahí completas{' '}
            {esAjuste ? 'partidas y observaciones' : 'origen, destino y partidas'} antes de enviar
            el correo.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            to="/inventory/traspasos"
            className="text-xs font-black text-slate-500 hover:text-orange-600 inline-flex items-center gap-1"
          >
            <ExternalLink size={13} /> Abrir Traspasos y Ajustes
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => onClose(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={enviar.isPending}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {enviar.isPending ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}{' '}
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTROS_INICIALES = { um: '', estado: '', activo: '', dup: '', alerta: '', stock: '' };
const COLS_NUM = new Set(['disponible', 'reserva', 'transitoria', 'consignacion', 'stock_total']);

function Tabla({ rows, isLoading, conDiagnostico, sel, setSel, onProcesadas }) {
  const [limite, setLimite] = useState(200);
  const [f, setF] = useState(FILTROS_INICIALES);
  const [orden, setOrden] = useState({ col: 'codigo', dir: 1 });

  const opciones = useMemo(
    () => ({
      um: [...new Set(rows.map((r) => r.unidad_medida || '—'))].sort(),
      estado: [...new Set(rows.map((r) => r.estado))].sort(),
      activo: [...new Set(rows.map((r) => r.activo))].sort()
    }),
    [rows]
  );

  // Tabla dinámica: filtros por columna + orden por encabezado.
  const vis = useMemo(() => {
    let out = rows;
    if (f.um) out = out.filter((r) => (r.unidad_medida || '—') === f.um);
    if (f.estado) out = out.filter((r) => r.estado === f.estado);
    if (f.activo) out = out.filter((r) => r.activo === f.activo);
    if (f.dup) out = out.filter((r) => (r.duplicado === 'Sí (duplicado)') === (f.dup === 'si'));
    if (f.alerta === 'antiguo_disp') out = out.filter((r) => r.antiguo_disponible);
    else if (f.alerta === 'no_activo_stock') out = out.filter((r) => r.no_activo_stock);
    else if (f.alerta === 'anomalia') out = out.filter((r) => r.anomalia);
    else if (f.alerta === 'sin')
      out = out.filter((r) => !r.antiguo_disponible && !r.no_activo_stock && !r.anomalia);
    if (f.stock === 'disp') out = out.filter((r) => Number(r.disponible) > 0);
    else if (f.stock === 'con') out = out.filter((r) => Number(r.stock_total) > 0);
    else if (f.stock === 'sin') out = out.filter((r) => Number(r.stock_total) === 0);
    const { col, dir } = orden;
    return [...out].sort((a, b) =>
      COLS_NUM.has(col)
        ? (Number(a[col] || 0) - Number(b[col] || 0)) * dir
        : String(a[col] ?? '').localeCompare(String(b[col] ?? ''), 'es') * dir
    );
  }, [rows, f, orden]);

  useEffect(() => {
    onProcesadas?.(vis);
  }, [vis, onProcesadas]);

  const totales = useMemo(
    () =>
      vis.reduce(
        (t, r) => ({
          disponible: t.disponible + Number(r.disponible || 0),
          reserva: t.reserva + Number(r.reserva || 0),
          transitoria: t.transitoria + Number(r.transitoria || 0),
          consignacion: t.consignacion + Number(r.consignacion || 0),
          stock_total: t.stock_total + Number(r.stock_total || 0)
        }),
        { disponible: 0, reserva: 0, transitoria: 0, consignacion: 0, stock_total: 0 }
      ),
    [vis]
  );

  const visibles = vis.slice(0, limite);
  const hayFiltro = Object.values(f).some(Boolean);
  const todasSel = vis.length > 0 && vis.every((r) => sel.has(r.codigo));
  const toggleTodas = () =>
    setSel((s) => {
      const nx = new Set(s);
      if (todasSel) vis.forEach((r) => nx.delete(r.codigo));
      else vis.forEach((r) => nx.add(r.codigo));
      return nx;
    });
  const toggle = (codigo) =>
    setSel((s) => {
      const nx = new Set(s);
      if (nx.has(codigo)) nx.delete(codigo);
      else nx.add(codigo);
      return nx;
    });

  const Sel = ({ valor, onChange, opts, label }) => (
    <select
      value={valor}
      onChange={(e) => {
        onChange(e.target.value);
        setLimite(200);
      }}
      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold ${valor ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500'}`}
    >
      <option value="">{label}</option>
      {opts.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );

  const Th = ({ col, children, right }) => (
    <th
      className={`py-2 pr-2 cursor-pointer select-none whitespace-nowrap hover:text-slate-600 ${right ? 'text-right' : ''}`}
      onClick={() => setOrden((o) => ({ col, dir: o.col === col ? -o.dir : 1 }))}
      title="Ordenar"
    >
      {children}
      {orden.col === col ? (orden.dir === 1 ? ' ▲' : ' ▼') : ''}
    </th>
  );

  return (
    <div className="space-y-2">
      {rows.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Sel
            valor={f.estado}
            onChange={(v) => setF((x) => ({ ...x, estado: v }))}
            label="Estado: todos"
            opts={opciones.estado.map((v) => [v, v])}
          />
          <Sel
            valor={f.activo}
            onChange={(v) => setF((x) => ({ ...x, activo: v }))}
            label="Activo: todos"
            opts={opciones.activo.map((v) => [v, v])}
          />
          <Sel
            valor={f.um}
            onChange={(v) => setF((x) => ({ ...x, um: v }))}
            label="UM: todas"
            opts={opciones.um.map((v) => [v, v])}
          />
          <Sel
            valor={f.dup}
            onChange={(v) => setF((x) => ({ ...x, dup: v }))}
            label="Duplicado: todos"
            opts={[
              ['si', 'Con P/S equivalente'],
              ['no', 'Sin equivalente']
            ]}
          />
          <Sel
            valor={f.alerta}
            onChange={(v) => setF((x) => ({ ...x, alerta: v }))}
            label="Alertas: todas"
            opts={[
              ['antiguo_disp', '⚠ Antiguo c/Disponible'],
              ['no_activo_stock', '⚠ No activo c/Stock'],
              ['anomalia', '⚠ Anomalía'],
              ['sin', 'Sin alertas']
            ]}
          />
          <Sel
            valor={f.stock}
            onChange={(v) => setF((x) => ({ ...x, stock: v }))}
            label="Stock: todo"
            opts={[
              ['disp', 'Con Disponible > 0'],
              ['con', 'Con Stock Total > 0'],
              ['sin', 'Sin stock']
            ]}
          />
          {hayFiltro && (
            <button
              onClick={() => {
                setF(FILTROS_INICIALES);
                setLimite(200);
              }}
              className="px-2 py-1.5 rounded-lg text-[11px] font-black text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"
            >
              <X size={12} /> Quitar filtros
            </button>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        {isLoading && <div className="text-slate-400 text-center py-10">Calculando análisis…</div>}
        {!isLoading && !rows.length && (
          <div className="text-slate-400 text-center py-10">
            Sin resultados. ¿Está cargado el stock? (Resumen → Cargar reporte de stock)
          </div>
        )}
        {!isLoading && rows.length > 0 && !vis.length && (
          <div className="text-slate-400 text-center py-10">
            Ningún registro pasa los filtros aplicados.
          </div>
        )}
        {!isLoading && vis.length > 0 && (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <th className="py-2 pr-2 w-6">
                  <input
                    type="checkbox"
                    checked={todasSel}
                    onChange={toggleTodas}
                    title="Seleccionar todo (lo filtrado)"
                  />
                </th>
                <Th col="codigo">Código</Th>
                <Th col="producto">Producto</Th>
                <Th col="unidad_medida">UM</Th>
                <Th col="disponible" right>
                  Disp.
                </Th>
                <Th col="reserva" right>
                  Res.
                </Th>
                <Th col="transitoria" right>
                  Trans.
                </Th>
                <Th col="consignacion" right>
                  Consig.
                </Th>
                <Th col="stock_total" right>
                  Total
                </Th>
                <Th col="estado">Estado</Th>
                <Th col="activo">Activo</Th>
                <th className="py-2 pr-2">Duplicado / P·S equiv.</th>
                <th className="py-2">{conDiagnostico ? 'Diagnóstico' : 'Alertas'}</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((r) => (
                <tr
                  key={r.codigo}
                  className={`border-b border-slate-50 hover:bg-slate-50/60 ${sel.has(r.codigo) ? 'bg-orange-50/60' : ''}`}
                >
                  <td className="py-1.5 pr-2">
                    <input
                      type="checkbox"
                      checked={sel.has(r.codigo)}
                      onChange={() => toggle(r.codigo)}
                    />
                  </td>
                  <td className="py-1.5 pr-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {r.codigo}
                  </td>
                  <td
                    className="py-1.5 pr-3 text-slate-600 max-w-[26rem] truncate"
                    title={r.producto || ''}
                  >
                    {r.producto || '—'}
                  </td>
                  <td className="py-1.5 pr-2 text-slate-400">{r.unidad_medida || ''}</td>
                  <td
                    className={`py-1.5 pr-2 text-right font-bold ${Number(r.disponible) > 0 ? 'text-slate-800' : 'text-slate-300'}`}
                  >
                    {n(r.disponible)}
                  </td>
                  <td className="py-1.5 pr-2 text-right text-slate-500">{n(r.reserva)}</td>
                  <td className="py-1.5 pr-2 text-right text-slate-500">{n(r.transitoria)}</td>
                  <td className="py-1.5 pr-2 text-right text-slate-500">{n(r.consignacion)}</td>
                  <td
                    className={`py-1.5 pr-2 text-right font-black ${Number(r.stock_total) > 0 ? 'text-slate-900' : 'text-slate-300'}`}
                  >
                    {n(r.stock_total)}
                  </td>
                  <td className="py-1.5 pr-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap ${ESTADO_CLS[r.estado] || ''}`}
                    >
                      {r.estado}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap ${ACTIVO_CLS[r.activo] || ''}`}
                    >
                      {r.activo}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {r.duplicado === 'Sí (duplicado)' ? (
                      <span className="text-indigo-600 font-bold">
                        → <span className="font-mono">{r.ps_equivalente}</span>
                      </span>
                    ) : r.estado === 'Antiguo' ? (
                      <span className="text-slate-300">No</span>
                    ) : (
                      ''
                    )}
                  </td>
                  <td className="py-1.5">
                    {conDiagnostico ? (
                      <span className="text-amber-700">{r.anomalia}</span>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {r.antiguo_disponible && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            ⚠ Antiguo c/Disp.
                          </span>
                        )}
                        {r.no_activo_stock && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            ⚠ No activo c/Stock
                          </span>
                        )}
                        {r.anomalia && (
                          <span
                            className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold"
                            title={r.anomalia}
                          >
                            ⚠ Anomalía
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 font-black text-slate-700">
                <td className="py-2" />
                <td className="py-2 pr-3">TOTAL ({n(vis.length)})</td>
                <td />
                <td />
                <td className="py-2 pr-2 text-right">{n(totales.disponible)}</td>
                <td className="py-2 pr-2 text-right">{n(totales.reserva)}</td>
                <td className="py-2 pr-2 text-right">{n(totales.transitoria)}</td>
                <td className="py-2 pr-2 text-right">{n(totales.consignacion)}</td>
                <td className="py-2 pr-2 text-right">{n(totales.stock_total)}</td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        )}
        {!isLoading && vis.length > limite && (
          <div className="text-center pt-3">
            <button
              onClick={() => setLimite((l) => l + 500)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50"
            >
              Mostrar más ({n(vis.length - limite)} restantes)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detalle completo + export del libro entero (todas las hojas del Excel) ──
function TabDetalle() {
  const [q, setQ] = useState('');
  const [qLive, setQLive] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQ(qLive.trim()), 400);
    return () => clearTimeout(t);
  }, [qLive]);
  const { data: rows = SIN_FILAS, isLoading } = useAnalisisCodigos('todos', q);
  const { data: r = {} } = useAnalisisResumen();
  const [vis, setVis] = useState(SIN_FILAS);
  const [sel, setSel] = useState(() => new Set());

  const exportarLibro = () => {
    const detalle = rows.map(filaExport);
    const resumen = [
      { Categoría: 'Total de códigos', Cantidad: Number(r.total || 0), '% del Total': '100%' },
      {
        Categoría: 'Nuevos con P',
        Cantidad: Number(r.nuevos_p || 0),
        '% del Total': pct(r.nuevos_p, r.total)
      },
      {
        Categoría: 'Nuevos con S',
        Cantidad: Number(r.nuevos_s || 0),
        '% del Total': pct(r.nuevos_s, r.total)
      },
      {
        Categoría: 'Antiguos (faltan actualizar a P/S)',
        Cantidad: Number(r.antiguos || 0),
        '% del Total': pct(r.antiguos, r.total)
      },
      {
        Categoría: 'Antiguos que AÚN tienen Disponible (>0)',
        Cantidad: Number(r.antiguos_disp || 0),
        '% del Total': pct(r.antiguos_disp, r.antiguos)
      },
      {
        Categoría: 'Antiguos sin Disponible (solo renombrar)',
        Cantidad: Number(r.antiguos_sin_disp || 0),
        '% del Total': pct(r.antiguos_sin_disp, r.antiguos)
      },
      {
        Categoría: 'Antiguos duplicados (descripción ya existe con P/S)',
        Cantidad: Number(r.antiguos_dup || 0),
        '% del Total': pct(r.antiguos_dup, r.antiguos)
      },
      {
        Categoría: 'Anomalías (códigos mal escritos)',
        Cantidad: Number(r.anomalias || 0),
        '% del Total': ''
      },
      {
        Categoría: 'Productos activos (Si)',
        Cantidad: Number(r.activos || 0),
        '% del Total': pct(r.activos, r.total)
      },
      {
        Categoría: 'Productos no activos (No)',
        Cantidad: Number(r.no_activos || 0),
        '% del Total': pct(r.no_activos, r.total)
      },
      {
        Categoría: 'Códigos no encontrados en ACTIVO',
        Cantidad: Number(r.no_encontrados || 0),
        '% del Total': pct(r.no_encontrados, r.total)
      },
      {
        Categoría: 'NO activos que AÚN tienen stock',
        Cantidad: Number(r.no_activos_stock || 0),
        '% del Total': pct(r.no_activos_stock, r.no_activos)
      }
    ];
    exportToExcel({
      filename: 'analisis_codigos',
      sheets: [
        { name: 'Resumen', rows: resumen },
        { name: 'Detalle', rows: detalle },
        {
          name: 'Antiguos con Disponible',
          rows: rows.filter((x) => x.antiguo_disponible).map(filaExport)
        },
        {
          name: 'No Activos con Stock',
          rows: rows.filter((x) => x.no_activo_stock).map(filaExport)
        },
        {
          name: 'Duplicados',
          rows: rows.filter((x) => x.duplicado === 'Sí (duplicado)').map(filaExport)
        },
        { name: 'Anomalías', rows: rows.filter((x) => x.anomalia).map(filaExport) }
      ]
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-black text-slate-900 flex items-center gap-2">
          <Layers size={17} className="text-orange-500" /> Detalle completo{' '}
          <span className="text-slate-400 font-bold text-sm">
            ({vis.length !== rows.length ? `${n(vis.length)} de ${n(rows.length)}` : n(rows.length)}
            )
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={qLive}
              onChange={(e) => setQLive(e.target.value)}
              placeholder="Buscar código o producto…"
              className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-56"
            />
          </div>
          <button
            onClick={exportarLibro}
            disabled={!rows.length}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            <Download size={13} /> Exportar libro completo (6 hojas)
          </button>
        </div>
      </div>
      <BarraSeleccion sel={sel} setSel={setSel} rows={rows} />
      <Tabla
        rows={rows}
        isLoading={isLoading}
        conDiagnostico={false}
        sel={sel}
        setSel={setSel}
        onProcesadas={setVis}
      />
    </div>
  );
}
