// ── Inventario → Análisis de Códigos ────────────────────────────────────────
// Port nativo del Excel "STOCK NAME" de PTM: clasifica cada SKU del stock según
// la nueva nomenclatura (P/S vs Antiguo), detecta antiguos con disponible,
// duplicados contra P/S, no activos con stock y anomalías de formato, con el
// resumen de avance de la actualización de códigos. Las secciones se navegan
// desde el MENÚ (Inventario → Análisis · …) vía ?tab=, como el resto de los
// módulos. Datos: tms_inventario_general (reporte IW cargado desde el Resumen,
// o Carga Masiva → Consolidado) + catálogo ACTIVO cargado desde esta pantalla.
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BarChart3, Search, Download, Upload, RefreshCw, AlertTriangle, FileWarning,
  CheckCircle2, XCircle, Layers, Database,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { exportToExcel } from '../../lib/exportExcel';
import {
  useAnalisisResumen, useAnalisisCodigos, useCargarActivo, parseActivoFile,
  useCargarStock, parseStockFile,
} from '../../services/analisisService';

const TABS = ['resumen', 'antiguos', 'antiguos_disp', 'no_activos_stock', 'duplicados', 'anomalias', 'detalle'];

const n = (v) => Number(v || 0).toLocaleString('es-CL');
const pct = (a, b) => (Number(b) > 0 ? `${((Number(a) / Number(b)) * 100).toFixed(1)}%` : '—');
const fechaCL = (d) => (d ? new Date(d).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : 'nunca');

const ESTADO_CLS = {
  'Nuevo (P)': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Nuevo (S)': 'bg-sky-100 text-sky-700 border-sky-200',
  Antiguo: 'bg-amber-100 text-amber-700 border-amber-200',
};
const ACTIVO_CLS = {
  Si: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  No: 'bg-rose-100 text-rose-700 border-rose-200',
  'No encontrado': 'bg-slate-100 text-slate-500 border-slate-200',
};

// Fila → objeto exportable con los mismos encabezados del Excel original.
const filaExport = (r) => ({
  'Cod. Producto': r.codigo, Producto: r.producto || '', 'U. Medida': r.unidad_medida || '',
  Disponible: Number(r.disponible || 0), Reserva: Number(r.reserva || 0),
  Transitoria: Number(r.transitoria || 0), 'Consignación': Number(r.consignacion || 0),
  'Stock Total': Number(r.stock_total || 0), 'Estado Código': r.estado,
  'Antiguo con Disponible': r.antiguo_disponible ? '⚠ Sí' : '',
  '¿Existe con P/S?': r.duplicado || '', 'Código P/S equivalente': r.ps_equivalente || '',
  'Producto Activo': r.activo, 'No Activo con Stock': r.no_activo_stock ? '⚠ Sí' : '',
  'Anomalía': r.anomalia || '',
});

export default function AnalisisCodigos() {
  const { user, hasPermission } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const canCargar = isAdmin || hasPermission('manage_data_import') || hasPermission('manage_inventory');

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'resumen');
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tab) setTab(t);
    else if (!t && tab !== 'resumen') setTab('resumen');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const activeTab = TABS.includes(tab) ? tab : 'resumen';

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-700">
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <BarChart3 size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Análisis de <span className="text-orange-600">Códigos</span></h1>
            <p className="text-xs sm:text-sm text-slate-500">Actualización a nomenclatura P/S · antiguos con stock · duplicados · anomalías</p>
          </div>
        </div>
      </div>

      {activeTab === 'resumen' && <TabResumen canCargar={canCargar} />}
      {activeTab === 'antiguos' && <TablaAnalisis filtro="antiguos" titulo="Códigos antiguos (faltan actualizar a P/S)" />}
      {activeTab === 'antiguos_disp' && <TablaAnalisis filtro="antiguos_disp" titulo="Antiguos que AÚN tienen Disponible" alerta />}
      {activeTab === 'no_activos_stock' && <TablaAnalisis filtro="no_activos_stock" titulo="Productos NO activos con stock" alerta />}
      {activeTab === 'duplicados' && <TablaAnalisis filtro="duplicados" titulo="Antiguos duplicados (la descripción ya existe con P/S)" />}
      {activeTab === 'anomalias' && <TablaAnalisis filtro="anomalias" titulo="Anomalías (códigos mal escritos)" conDiagnostico />}
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
    } finally { setSubiendo(false); }
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
    } finally { setSubiendoStock(false); }
  };

  const sinStock = !isLoading && Number(r.total || 0) === 0;
  const sinActivo = !isLoading && Number(r.activo_filas || 0) === 0;

  const Kpi = ({ label, value, sub, tone }) => (
    <div className={`rounded-2xl border p-4 ${tone === 'alert' ? 'bg-rose-50 border-rose-200' : tone === 'ok' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-black ${tone === 'alert' ? 'text-rose-600' : tone === 'ok' ? 'text-emerald-600' : 'text-slate-900'}`}>{isLoading ? '…' : n(value)}</div>
      {sub && <div className="text-[11px] text-slate-400 font-bold">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Fuentes de datos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-black text-slate-900 flex items-center gap-2"><Database size={17} className="text-orange-500" /> Fuentes de datos</h2>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1.5">
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className={`rounded-xl border p-4 ${sinStock ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
            <div className="font-bold text-slate-800 text-sm">1 · Reporte de stock (ERP)</div>
            <div className="text-xs text-slate-500 mt-0.5">{n(r.total)} SKUs · última carga: {fechaCL(r.stock_cargado_el)}</div>
            {sinStock && <div className="text-xs font-bold text-amber-700 mt-1">⚠ Aún no hay stock cargado: el análisis saldrá vacío.</div>}
            {canCargar && (
              <button onClick={() => stockRef.current?.click()} disabled={subiendoStock}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 disabled:opacity-50">
                {subiendoStock ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />} Cargar reporte de stock (Excel IW)
              </button>
            )}
            <input ref={stockRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFileStock} className="hidden" />
            <p className="text-[10px] text-slate-400 mt-1.5">Detecta las columnas por nombre ("Cod. Producto", "Disponible", …) y reemplaza la carga anterior. Alternativa: <Link to="/inbound/data-import" className="underline">Carga Masiva → Consolidado</Link> (requiere columna Bodega).</p>
          </div>
          <div className={`rounded-xl border p-4 ${sinActivo ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
            <div className="font-bold text-slate-800 text-sm">2 · Catálogo ACTIVO (Si/No del ERP)</div>
            <div className="text-xs text-slate-500 mt-0.5">{n(r.activo_filas)} códigos · última carga: {fechaCL(r.activo_cargado_el)}</div>
            {sinActivo && <div className="text-xs font-bold text-amber-700 mt-1">⚠ Sin catálogo, todo saldrá "No encontrado".</div>}
            {canCargar && (
              <button onClick={() => fileRef.current?.click()} disabled={subiendo}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 disabled:opacity-50">
                {subiendo ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />} Cargar catálogo ACTIVO (Excel)
              </button>
            )}
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="hidden" />
            <p className="text-[10px] text-slate-400 mt-1.5">Se actualiza por código (upsert): columnas "Código producto", "Descripción", "U. medida" y "Producto Activo".</p>
          </div>
        </div>
      </div>

      {/* Resumen de actualización de códigos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
        <h2 className="font-black text-slate-900 flex items-center gap-2"><Layers size={17} className="text-orange-500" /> Resumen de actualización de códigos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi label="Total de códigos" value={r.total} sub="100%" />
          <Kpi label="Nuevos con P" value={r.nuevos_p} sub={pct(r.nuevos_p, r.total)} tone="ok" />
          <Kpi label="Nuevos con S" value={r.nuevos_s} sub={pct(r.nuevos_s, r.total)} tone="ok" />
          <Kpi label="Antiguos (faltan P/S)" value={r.antiguos} sub={pct(r.antiguos, r.total)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi label="Antiguos con Disponible" value={r.antiguos_disp} sub={`${pct(r.antiguos_disp, r.antiguos)} de los antiguos`} tone="alert" />
          <Kpi label="Antiguos sin Disponible" value={r.antiguos_sin_disp} sub="solo renombrar" />
          <Kpi label="Antiguos duplicados" value={r.antiguos_dup} sub="descripción ya existe con P/S" />
          <Kpi label="Anomalías" value={r.anomalias} sub="códigos mal escritos" tone={Number(r.anomalias) > 0 ? 'alert' : undefined} />
        </div>
      </div>

      {/* Estado activo / no activo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
        <h2 className="font-black text-slate-900 flex items-center gap-2"><CheckCircle2 size={17} className="text-orange-500" /> Estado Activo / No Activo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi label="Productos activos (Si)" value={r.activos} sub={pct(r.activos, r.total)} tone="ok" />
          <Kpi label="No activos (No)" value={r.no_activos} sub={pct(r.no_activos, r.total)} />
          <Kpi label="No encontrados en ACTIVO" value={r.no_encontrados} sub={pct(r.no_encontrados, r.total)} />
          <Kpi label="NO activos que AÚN tienen stock" value={r.no_activos_stock} sub={`${pct(r.no_activos_stock, r.no_activos)} de los no activos`} tone="alert" />
        </div>
      </div>
    </div>
  );
}

// ─── Tabla de una vista (con búsqueda y export) ──────────────────────────────
function TablaAnalisis({ filtro, titulo, alerta = false, conDiagnostico = false }) {
  const [q, setQ] = useState('');
  const [qLive, setQLive] = useState('');
  useEffect(() => { const t = setTimeout(() => setQ(qLive.trim()), 400); return () => clearTimeout(t); }, [qLive]);
  const { data: rows = [], isLoading } = useAnalisisCodigos(filtro, q);

  const exportar = () => exportToExcel({
    filename: `analisis_${filtro}`,
    sheets: [{ name: titulo.slice(0, 30), rows: rows.map(filaExport) }],
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-black text-slate-900 flex items-center gap-2">
          {alerta ? <AlertTriangle size={17} className="text-rose-500" /> : conDiagnostico ? <FileWarning size={17} className="text-amber-500" /> : <Layers size={17} className="text-orange-500" />}
          {titulo} <span className="text-slate-400 font-bold text-sm">({n(rows.length)})</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={qLive} onChange={(e) => setQLive(e.target.value)} placeholder="Buscar código o producto…"
              className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-56" />
          </div>
          <button onClick={exportar} disabled={!rows.length}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1.5">
            <Download size={13} /> Excel
          </button>
        </div>
      </div>
      <Tabla rows={rows} isLoading={isLoading} conDiagnostico={conDiagnostico} />
    </div>
  );
}

function Tabla({ rows, isLoading, conDiagnostico }) {
  const [limite, setLimite] = useState(200);
  const visibles = rows.slice(0, limite);
  return (
    <div className="overflow-x-auto">
      {isLoading && <div className="text-slate-400 text-center py-10">Calculando análisis…</div>}
      {!isLoading && !rows.length && <div className="text-slate-400 text-center py-10">Sin resultados. ¿Está cargado el stock? (Resumen → Cargar reporte de stock)</div>}
      {!isLoading && rows.length > 0 && (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="py-2 pr-3">Código</th><th className="py-2 pr-3">Producto</th><th className="py-2 pr-2">UM</th>
              <th className="py-2 pr-2 text-right">Disp.</th><th className="py-2 pr-2 text-right">Res.</th>
              <th className="py-2 pr-2 text-right">Trans.</th><th className="py-2 pr-2 text-right">Consig.</th>
              <th className="py-2 pr-2 text-right">Total</th><th className="py-2 pr-2">Estado</th>
              <th className="py-2 pr-2">Activo</th><th className="py-2 pr-2">Duplicado / P·S equiv.</th>
              <th className="py-2">{conDiagnostico ? 'Diagnóstico' : 'Alertas'}</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((r) => (
              <tr key={r.codigo} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="py-1.5 pr-3 font-mono font-bold text-slate-800 whitespace-nowrap">{r.codigo}</td>
                <td className="py-1.5 pr-3 text-slate-600 max-w-[26rem] truncate" title={r.producto || ''}>{r.producto || '—'}</td>
                <td className="py-1.5 pr-2 text-slate-400">{r.unidad_medida || ''}</td>
                <td className={`py-1.5 pr-2 text-right font-bold ${Number(r.disponible) > 0 ? 'text-slate-800' : 'text-slate-300'}`}>{n(r.disponible)}</td>
                <td className="py-1.5 pr-2 text-right text-slate-500">{n(r.reserva)}</td>
                <td className="py-1.5 pr-2 text-right text-slate-500">{n(r.transitoria)}</td>
                <td className="py-1.5 pr-2 text-right text-slate-500">{n(r.consignacion)}</td>
                <td className={`py-1.5 pr-2 text-right font-black ${Number(r.stock_total) > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{n(r.stock_total)}</td>
                <td className="py-1.5 pr-2"><span className={`inline-block px-1.5 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap ${ESTADO_CLS[r.estado] || ''}`}>{r.estado}</span></td>
                <td className="py-1.5 pr-2"><span className={`inline-block px-1.5 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap ${ACTIVO_CLS[r.activo] || ''}`}>{r.activo}</span></td>
                <td className="py-1.5 pr-2 whitespace-nowrap">
                  {r.duplicado === 'Sí (duplicado)'
                    ? <span className="text-indigo-600 font-bold">→ <span className="font-mono">{r.ps_equivalente}</span></span>
                    : (r.estado === 'Antiguo' ? <span className="text-slate-300">No</span> : '')}
                </td>
                <td className="py-1.5">
                  {conDiagnostico
                    ? <span className="text-amber-700">{r.anomalia}</span>
                    : (
                      <span className="flex flex-wrap gap-1">
                        {r.antiguo_disponible && <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold">⚠ Antiguo c/Disp.</span>}
                        {r.no_activo_stock && <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold">⚠ No activo c/Stock</span>}
                        {r.anomalia && <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold" title={r.anomalia}>⚠ Anomalía</span>}
                      </span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!isLoading && rows.length > limite && (
        <div className="text-center pt-3">
          <button onClick={() => setLimite((l) => l + 500)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50">
            Mostrar más ({n(rows.length - limite)} restantes)
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Detalle completo + export del libro entero (todas las hojas del Excel) ──
function TabDetalle() {
  const [q, setQ] = useState('');
  const [qLive, setQLive] = useState('');
  useEffect(() => { const t = setTimeout(() => setQ(qLive.trim()), 400); return () => clearTimeout(t); }, [qLive]);
  const { data: rows = [], isLoading } = useAnalisisCodigos('todos', q);
  const { data: r = {} } = useAnalisisResumen();

  const exportarLibro = () => {
    const detalle = rows.map(filaExport);
    const resumen = [
      { Categoría: 'Total de códigos', Cantidad: Number(r.total || 0), '% del Total': '100%' },
      { Categoría: 'Nuevos con P', Cantidad: Number(r.nuevos_p || 0), '% del Total': pct(r.nuevos_p, r.total) },
      { Categoría: 'Nuevos con S', Cantidad: Number(r.nuevos_s || 0), '% del Total': pct(r.nuevos_s, r.total) },
      { Categoría: 'Antiguos (faltan actualizar a P/S)', Cantidad: Number(r.antiguos || 0), '% del Total': pct(r.antiguos, r.total) },
      { Categoría: 'Antiguos que AÚN tienen Disponible (>0)', Cantidad: Number(r.antiguos_disp || 0), '% del Total': pct(r.antiguos_disp, r.antiguos) },
      { Categoría: 'Antiguos sin Disponible (solo renombrar)', Cantidad: Number(r.antiguos_sin_disp || 0), '% del Total': pct(r.antiguos_sin_disp, r.antiguos) },
      { Categoría: 'Antiguos duplicados (descripción ya existe con P/S)', Cantidad: Number(r.antiguos_dup || 0), '% del Total': pct(r.antiguos_dup, r.antiguos) },
      { Categoría: 'Anomalías (códigos mal escritos)', Cantidad: Number(r.anomalias || 0), '% del Total': '' },
      { Categoría: 'Productos activos (Si)', Cantidad: Number(r.activos || 0), '% del Total': pct(r.activos, r.total) },
      { Categoría: 'Productos no activos (No)', Cantidad: Number(r.no_activos || 0), '% del Total': pct(r.no_activos, r.total) },
      { Categoría: 'Códigos no encontrados en ACTIVO', Cantidad: Number(r.no_encontrados || 0), '% del Total': pct(r.no_encontrados, r.total) },
      { Categoría: 'NO activos que AÚN tienen stock', Cantidad: Number(r.no_activos_stock || 0), '% del Total': pct(r.no_activos_stock, r.no_activos) },
    ];
    exportToExcel({
      filename: 'analisis_codigos',
      sheets: [
        { name: 'Resumen', rows: resumen },
        { name: 'Detalle', rows: detalle },
        { name: 'Antiguos con Disponible', rows: rows.filter((x) => x.antiguo_disponible).map(filaExport) },
        { name: 'No Activos con Stock', rows: rows.filter((x) => x.no_activo_stock).map(filaExport) },
        { name: 'Duplicados', rows: rows.filter((x) => x.duplicado === 'Sí (duplicado)').map(filaExport) },
        { name: 'Anomalías', rows: rows.filter((x) => x.anomalia).map(filaExport) },
      ],
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-black text-slate-900 flex items-center gap-2">
          <Layers size={17} className="text-orange-500" /> Detalle completo <span className="text-slate-400 font-bold text-sm">({n(rows.length)})</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={qLive} onChange={(e) => setQLive(e.target.value)} placeholder="Buscar código o producto…"
              className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-56" />
          </div>
          <button onClick={exportarLibro} disabled={!rows.length}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 disabled:opacity-40 inline-flex items-center gap-1.5">
            <Download size={13} /> Exportar libro completo (6 hojas)
          </button>
        </div>
      </div>
      <Tabla rows={rows} isLoading={isLoading} conDiagnostico={false} />
    </div>
  );
}
