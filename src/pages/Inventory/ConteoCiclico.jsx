import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  RotateCcw, Plus, Lock, Unlock, Download, Search, Package, Boxes,
  ClipboardCheck, Layers, Calculator, X, Trash2, QrCode, ExternalLink, Copy, Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import { exportToExcel } from '../../lib/exportExcel';
import {
  useSesionesConteo, useCrearSesion, useCerrarSesion,
  useConciliacion, useAjusteErp, resumenAnalisis,
  useBloques, useBloque, useCrearBloque, useEditarBloque,
  useAgregarBloqueItem, useEliminarBloqueItem, useRegistrarAuditoria,
  useProyecciones, useGuardarProyeccion, useEliminarProyeccion,
  useRegistrarConteo, useConteos, useEliminarConteo, fetchLotesSeries, conteoStockSistema,
  estadoConteoMeta,
} from '../../services/conteoService';

const money = (v) => (Number(v) || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const n = (v) => (Number(v) || 0).toLocaleString('es-CL');
const chip = (estado) => {
  const map = {
    CUADRADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    FALTA: 'bg-rose-100 text-rose-700 border-rose-200',
    SOBRA: 'bg-amber-100 text-amber-700 border-amber-200',
    NO_CONTADO: 'bg-slate-100 text-slate-500 border-slate-200',
    PARTIDA_NUEVA: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  return map[estado] || 'bg-slate-100 text-slate-600 border-slate-200';
};

const TABS = [
  { id: 'contar', label: 'Contar', icon: Package },
  { id: 'sesiones', label: 'Sesiones', icon: Layers },
  { id: 'conciliacion', label: 'Conciliación', icon: ClipboardCheck },
  { id: 'ajuste', label: 'Ajuste ERP', icon: Download },
  { id: 'bloques', label: 'Bloques / QR', icon: Boxes },
  { id: 'proyeccion', label: 'Proyección', icon: Calculator },
];

export default function ConteoCiclico() {
  const { user } = useAuth();
  // La sección activa la decide el MENÚ (Inventario → Conteo · …) vía ?tab=,
  // igual que los demás módulos; la página no muestra fila de pestañas.
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'contar');
  const [sesionId, setSesionId] = useState('');
  const { data: sesiones = [] } = useSesionesConteo();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tab) setTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const irTab = (id) => {
    setTab(id);
    setSearchParams(id === 'contar' ? {} : { tab: id }, { replace: true });
  };
  const activeTab = TABS.some((t) => t.id === tab) ? tab : 'contar';

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-700">
      {/* Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <RotateCcw size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Conteo <span className="text-orange-600">Cíclico</span></h1>
            <p className="text-xs sm:text-sm text-slate-500">Conteos físicos, conciliación y ajuste para el ERP · reusa el stock de CCO</p>
          </div>
        </div>
        <select value={sesionId} onChange={(e) => setSesionId(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white">
          <option value="">Todas las sesiones</option>
          {sesiones.map((s) => <option key={s.id} value={s.id}>{s.nombre}{s.estado !== 'abierta' ? ' (cerrada)' : ''}</option>)}
        </select>
      </div>

      {activeTab === 'contar' && <TabContar sesionId={sesionId} setSesionId={setSesionId} sesiones={sesiones} />}
      {activeTab === 'sesiones' && <TabSesiones sesiones={sesiones} isAdmin={isAdmin} onOpen={(id) => { setSesionId(id); irTab('conciliacion'); }} />}
      {activeTab === 'conciliacion' && <TabConciliacion sesionId={sesionId} isAdmin={isAdmin} />}
      {activeTab === 'ajuste' && <TabAjuste sesionId={sesionId} />}
      {activeTab === 'bloques' && <TabBloques />}
      {activeTab === 'proyeccion' && <TabProyeccion />}
    </div>
  );
}

// ─── Contar (registro de conteo, igual que la app original) ──────────────────
function TabContar({ sesionId, setSesionId, sesiones }) {
  const crear = useCrearSesion();
  const registrar = useRegistrarConteo();
  const eliminar = useEliminarConteo();
  // Cámara (ML Kit nativo, igual que Recepción Importaciones).
  const { startScan, isScanning } = useBarcodeScanner();
  const abiertas = sesiones.filter((s) => s.estado === 'abierta');
  const sesionObj = sesiones.find((s) => s.id === sesionId);
  const activa = sesionObj && sesionObj.estado === 'abierta' ? sesionObj : null;
  const { data: recientes = [] } = useConteos(activa ? activa.id : undefined);

  const [ubicacion, setUbicacion] = useState('');
  const [sku, setSku] = useState('');
  const [detalle, setDetalle] = useState(null);   // { rows } lotes/series
  const [stockTotal, setStockTotal] = useState(0);
  const [partida, setPartida] = useState('');
  const [serie, setSerie] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [obs, setObs] = useState('');

  const buscarSku = async (codigo) => {
    const c = (codigo || '').trim().toUpperCase();
    if (!c) return;
    setSku(c); setPartida(''); setSerie(''); setDetalle({ rows: [], loading: true });
    try {
      const [rows, total] = await Promise.all([fetchLotesSeries(c, ''), conteoStockSistema(c)]);
      setDetalle({ rows: rows || [], loading: false });
      setStockTotal(Number(total) || 0);
    } catch (e) { setDetalle({ rows: [], loading: false }); toast.error(e.message || 'Error al buscar'); }
  };

  // Stock esperado en vivo según lo elegido/tipeado.
  let esperado = null;
  if (detalle) {
    if (serie) { const r = detalle.rows.find((x) => x.tipo === 'S' && x.valor === serie); esperado = r ? Number(r.disponible) : 0; }
    else if (partida) { const r = detalle.rows.find((x) => x.tipo === 'P' && x.valor === partida); esperado = r ? Number(r.disponible) : 0; }
    else esperado = stockTotal;
  }
  const dif = esperado != null && cantidad !== '' ? Number(cantidad) - esperado : null;
  const step = (d) => setCantidad(String(Math.max(0, (Number(cantidad) || 0) + d)));

  const limpiar = () => { setSku(''); setDetalle(null); setPartida(''); setSerie(''); setCantidad(''); setObs(''); };
  const nueva = async () => {
    const nombre = (window.prompt('Nombre de la sesión de conteo:') || '').trim();
    if (!nombre) return;
    try { const s = await crear.mutateAsync({ nombre }); setSesionId(s.id); toast.success('Sesión creada'); }
    catch (e) { toast.error(e.message); }
  };
  const guardar = async () => {
    if (!activa) { toast.error('Elegí una sesión abierta'); return; }
    if (!sku) { toast.error('Escaneá o escribí el SKU'); return; }
    if (cantidad === '' || isNaN(Number(cantidad)) || Number(cantidad) < 0) { toast.error('Ingresá la cantidad contada'); return; }
    try {
      const row = await registrar.mutateAsync({ sesionId: activa.id, codigo: sku, cantidad: Number(cantidad), ubicacion, partida, serie, observaciones: obs, dispositivo: 'WEB' });
      const m = estadoConteoMeta(row.estado);
      toast[row.estado === 'CUADRADO' ? 'success' : 'info'](`${m.emoji} ${row.codigo_producto} — ${m.label} (contado ${n(row.cantidad_contada)} / sistema ${n(row.cantidad_sistema)})`);
      limpiar();
    } catch (e) { toast.error(e.message || 'No se pudo registrar'); }
  };
  const borrar = async (id) => { if (!window.confirm('¿Eliminar este conteo?')) return; try { await eliminar.mutateAsync({ id }); } catch (e) { toast.error(e.message); } };

  const inp = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-400 outline-none';
  const lbl = 'text-xs font-black uppercase tracking-wide text-slate-500 mb-1 block';

  // Escaneo por campo (mismo patrón de Recepción Importaciones).
  const scanUbicacion = () => startScan({
    onScan: (v) => { const val = v.trim().toUpperCase(); setUbicacion(val); toast.success(`Ubicación escaneada: ${val}`); },
    onError: (msg) => toast.error(msg),
  });
  const scanSku = () => startScan({
    onScan: (v) => { const val = v.trim().toUpperCase(); toast.success(`SKU escaneado: ${val}`); buscarSku(val); },
    onError: (msg) => toast.error(msg),
  });
  const scanPartida = () => startScan({
    onScan: (v) => { setPartida(v.trim()); setSerie(''); toast.success(`Partida escaneada: ${v.trim()}`); },
    onError: (msg) => toast.error(msg),
  });
  const scanSerie = () => startScan({
    onScan: (v) => { setSerie(v.trim()); setPartida(''); toast.success(`Serie escaneada: ${v.trim()}`); },
    onError: (msg) => toast.error(msg),
  });
  const btnScan = 'px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-bold text-sm shadow-md active:scale-95 shrink-0';

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Formulario */}
      <div className="lg:col-span-2 space-y-4">
        {/* Sesión activa / selección */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black uppercase text-slate-400">Sesión</span>
          <select value={sesionId} onChange={(e) => setSesionId(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold flex-1 min-w-[12rem]">
            <option value="">— Elegí una sesión abierta —</option>
            {abiertas.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <button onClick={nueva} className="px-3 py-2 rounded-xl bg-orange-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-orange-700"><Plus size={14} /> Nueva</button>
        </div>

        {!activa && <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">Elegí (o creá) una <b>sesión abierta</b> para agrupar los conteos.</div>}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-3">
          <div>
            <label className={lbl}>Ubicación</label>
            <div className="flex gap-2">
              <input className={inp} value={ubicacion} onChange={(e) => setUbicacion(e.target.value.toUpperCase())} placeholder="Ej: G-29-03" />
              <button type="button" onClick={scanUbicacion} disabled={isScanning} title="Escanear ubicación" className={btnScan}>
                <Camera size={18} /><span className="hidden sm:inline">ESCANEAR</span>
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>Producto (código o descripción)</label>
            <div className="flex gap-2">
              <input className={inp} value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarSku(sku); } }}
                onBlur={() => sku && !detalle && buscarSku(sku)} placeholder="Escaneá o escribí el SKU…" />
              <button type="button" onClick={scanSku} disabled={isScanning} title="Escanear SKU (busca el stock al escanear)" className={btnScan}>
                <Camera size={18} /><span className="hidden sm:inline">ESCANEAR</span>
              </button>
            </div>
          </div>

          {detalle && (
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              {detalle.loading ? <span className="text-slate-400">Buscando stock…</span> : (
                <>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
                    <span>Stock sistema: <b className="text-slate-700">{n(stockTotal)}</b></span>
                    <span>{detalle.rows.length} lote(s)/serie(s)</span>
                  </div>
                  {detalle.rows.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {detalle.rows.map((r, i) => {
                        const on = (r.tipo === 'P' && partida === r.valor) || (r.tipo === 'S' && serie === r.valor);
                        return (
                          <button key={i} type="button"
                            onClick={() => { if (r.tipo === 'P') { setPartida(on ? '' : r.valor); setSerie(''); } else { setSerie(on ? '' : r.valor); setPartida(''); } }}
                            className={'text-xs font-bold px-2 py-1 rounded-lg border ' + (on ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
                            {r.tipo === 'P' ? '' : '🔢 '}{r.valor || '(sin partida)'} · {n(r.disponible)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Partida / Talla</label>
              <div className="flex gap-2">
                <input className={inp} value={partida} onChange={(e) => setPartida(e.target.value)} placeholder="Opcional" />
                <button type="button" onClick={scanPartida} disabled={isScanning} title="Escanear partida/lote" className={btnScan + ' px-3'}>
                  <Camera size={18} />
                </button>
              </div>
            </div>
            <div>
              <label className={lbl}>Serie</label>
              <div className="flex gap-2">
                <input className={inp} value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="Opcional" />
                <button type="button" onClick={scanSerie} disabled={isScanning} title="Escanear serie" className={btnScan + ' px-3'}>
                  <Camera size={18} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className={lbl}>Cantidad contada</label>
            <div className="flex items-stretch gap-2">
              <button type="button" onClick={() => step(-1)} className="w-14 rounded-xl border border-slate-200 text-2xl font-black text-slate-600 hover:bg-slate-50">−</button>
              <input className={inp + ' flex-1 text-center text-2xl font-black'} inputMode="decimal" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); guardar(); } }} placeholder="0" />
              <button type="button" onClick={() => step(1)} className="w-14 rounded-xl border border-slate-200 text-2xl font-black text-slate-600 hover:bg-slate-50">+</button>
            </div>
            {dif != null && (
              <div className={'mt-2 rounded-lg px-3 py-2 text-center text-sm font-bold ' + (dif === 0 ? 'bg-emerald-100 text-emerald-700' : dif < 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700')}>
                {dif === 0 ? '✅ Cuadrado' : dif < 0 ? `❌ Faltan ${n(Math.abs(dif))}` : `⚠️ Sobran ${n(dif)}`} · esperado {n(esperado)}
              </div>
            )}
          </div>

          <input className={inp} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observaciones (opcional)" />

          <div className="flex gap-2">
            <button type="button" onClick={limpiar} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-black hover:bg-slate-50">Limpiar</button>
            <button type="button" onClick={guardar} disabled={registrar.isPending || !activa} className="flex-[2] px-4 py-3 rounded-xl bg-orange-600 text-white font-black flex items-center justify-center gap-2 hover:bg-orange-700 disabled:opacity-50">
              <Package size={18} /> {registrar.isPending ? 'Guardando…' : 'Registrar conteo'}
            </button>
          </div>
        </div>
      </div>

      {/* Recientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-fit">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-slate-700 text-sm">Últimos conteos</h3>
          <span className="text-xs text-slate-400">{recientes.length}</span>
        </div>
        {recientes.length === 0 && <div className="text-slate-400 text-sm">Aún no hay conteos en esta sesión.</div>}
        <div className="divide-y divide-slate-100">
          {recientes.map((r) => {
            const m = estadoConteoMeta(r.estado);
            return (
              <div key={r.id} className="flex items-center gap-2 py-2 text-sm">
                <span>{m.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-slate-700">{r.codigo_producto}{r.partida ? <span className="text-slate-400"> · {r.partida}</span> : ''}</div>
                  <div className="truncate text-xs text-slate-400">{r.ubicacion || 's/ubic'} · contado {n(r.cantidad_contada)} / sist {n(r.cantidad_sistema)}</div>
                </div>
                <button onClick={() => borrar(r.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sesiones ────────────────────────────────────────────────────────────────
function TabSesiones({ sesiones, isAdmin, onOpen }) {
  const crear = useCrearSesion();
  const cerrar = useCerrarSesion();
  const nueva = async () => {
    const nombre = (window.prompt('Nombre de la sesión de conteo:') || '').trim();
    if (!nombre) return;
    try { await crear.mutateAsync({ nombre }); toast.success('Sesión creada'); }
    catch (e) { toast.error(e.message); }
  };
  const toggle = async (s) => {
    try { await cerrar.mutateAsync({ id: s.id, reabrir: s.estado !== 'abierta' }); toast.success(s.estado === 'abierta' ? 'Sesión cerrada' : 'Sesión reabierta'); }
    catch (e) { toast.error(e.message); }
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-slate-900 flex items-center gap-2"><Layers size={18} className="text-orange-500" /> Sesiones de conteo</h2>
        <button onClick={nueva} className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-black flex items-center gap-1.5 hover:bg-orange-700"><Plus size={15} /> Nueva</button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sesiones.length === 0 && <div className="text-slate-400 text-sm col-span-full">No hay sesiones todavía.</div>}
        {sesiones.map((s) => (
          <div key={s.id} className={`rounded-2xl border p-4 flex flex-col gap-2 ${s.estado === 'abierta' ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-slate-900 truncate">{s.nombre}</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${s.estado === 'abierta' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>{s.estado}</span>
            </div>
            <div className="text-[11px] text-slate-500">{s.creado_por_nombre || '—'}{s.semana ? ` · semana ${s.semana}` : ''}</div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => onOpen(s.id)} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-black hover:bg-white flex items-center justify-center gap-1"><ClipboardCheck size={13} /> Reportes</button>
              {isAdmin && (
                <button onClick={() => toggle(s)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-black hover:bg-white flex items-center gap-1">
                  {s.estado === 'abierta' ? <><Lock size={13} /> Cerrar</> : <><Unlock size={13} /> Reabrir</>}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Conciliación ────────────────────────────────────────────────────────────
function TabConciliacion({ sesionId }) {
  const { data: rows = [], isLoading } = useConciliacion(sesionId);
  const r = resumenAnalisis(rows);
  const exportar = () => exportToExcel({
    filename: 'conciliacion_conteo',
    sheets: [{ name: 'Conciliación', rows: rows.map((x) => ({
      SKU: x.codigo_producto, Descripción: x.descripcion, UM: x.unidad_medida,
      Contado: x.contado, Sistema: x.sistema, Diferencia: x.diferencia,
      'Costo unit.': x.costo_unitario, 'Impacto ($)': x.impacto, Estado: x.estado,
    })) }],
  });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="SKUs contados" value={n(r.total)} />
        <Kpi label="Exactitud" value={`${r.exactitud}%`} tone={r.exactitud >= 95 ? 'good' : 'warn'} />
        <Kpi label="Impacto neto" value={money(r.impacto)} tone={r.impacto < 0 ? 'bad' : 'good'} />
        <Kpi label="Faltante valorizado" value={money(r.faltante)} tone="bad" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-black text-slate-900 flex items-center gap-2"><ClipboardCheck size={18} className="text-orange-500" /> Conciliación</h2>
          <button onClick={exportar} disabled={!rows.length} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40"><Download size={14} /> Excel</button>
        </div>
        <TablaReporte isLoading={isLoading} rows={rows} cols={[
          ['codigo_producto', 'SKU', 'mono'], ['descripcion', 'Descripción'], ['contado', 'Contado', 'num'],
          ['sistema', 'Sistema', 'num'], ['diferencia', 'Dif.', 'dif'], ['impacto', 'Impacto', 'money'], ['estado', 'Estado', 'estado'],
        ]} />
      </div>
    </div>
  );
}

// ─── Ajuste ERP ──────────────────────────────────────────────────────────────
function TabAjuste({ sesionId }) {
  const { data: rows = [], isLoading } = useAjusteErp(sesionId);
  const exportar = () => exportToExcel({
    filename: 'ajuste_erp',
    sheets: [{ name: 'Ajuste ERP', rows: rows.map((x) => ({
      SKU: x.codigo_producto, Descripción: x.descripcion, Partida: x.partida,
      Contado: x.contado, Sistema: x.sistema, Ajuste: x.diferencia, 'Impacto ($)': x.impacto, Estado: x.estado,
    })) }],
  });
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-black text-slate-900 flex items-center gap-2"><Download size={18} className="text-orange-500" /> Ajuste para el ERP (por SKU + partida)</h2>
        <button onClick={exportar} disabled={!rows.length} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40"><Download size={14} /> Excel</button>
      </div>
      <TablaReporte isLoading={isLoading} rows={rows} cols={[
        ['codigo_producto', 'SKU', 'mono'], ['descripcion', 'Descripción'], ['partida', 'Partida', 'mono'],
        ['contado', 'Contado', 'num'], ['sistema', 'Sistema', 'num'], ['diferencia', 'Ajuste', 'dif'], ['estado', 'Estado', 'estado'],
      ]} />
    </div>
  );
}

// ─── Bloques + QR ────────────────────────────────────────────────────────────
function TabBloques() {
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState(null); // codigo del bloque abierto
  const { data: bloques = [], isLoading } = useBloques(q);
  const crear = useCrearBloque();
  const nuevo = async () => {
    const bodega = (window.prompt('Bodega del bloque:') || '').trim();
    if (!bodega) return;
    const nombre = (window.prompt('Nombre/descripción del bloque (opcional):') || '').trim();
    try { const b = await crear.mutateAsync({ bodega, nombre }); toast.success(`Bloque ${b.codigo} creado`); setAbierto(b.codigo); }
    catch (e) { toast.error(e.message); }
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="font-black text-slate-900 flex items-center gap-2"><Boxes size={18} className="text-orange-500" /> Bloques / pallets</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar código/bodega…" className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-48" />
          </div>
          <button onClick={nuevo} className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-black flex items-center gap-1.5 hover:bg-orange-700"><Plus size={15} /> Nuevo</button>
        </div>
      </div>
      {isLoading && <div className="text-slate-400 text-sm">Cargando…</div>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {bloques.map((b) => (
          <button key={b.id} onClick={() => setAbierto(b.codigo)} className="text-left rounded-2xl border border-slate-200 p-4 hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-slate-800 text-sm">{b.codigo}</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${b.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>{b.estado}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 truncate">{b.bodega}{b.nombre ? ` · ${b.nombre}` : ''}</div>
          </button>
        ))}
        {!isLoading && bloques.length === 0 && <div className="text-slate-400 text-sm col-span-full">Sin bloques.</div>}
      </div>
      {abierto && <BloqueModal codigo={abierto} onClose={() => setAbierto(null)} />}
    </div>
  );
}

function BloqueModal({ codigo, onClose }) {
  const { data: b, isLoading } = useBloque(codigo);
  const agregar = useAgregarBloqueItem();
  const elimItem = useEliminarBloqueItem();
  const editar = useEditarBloque();
  const auditar = useRegistrarAuditoria();
  const [form, setForm] = useState({ codigo: '', cantidad: '', partida: '', serie: '' });
  const [qr, setQr] = useState('');

  useEffect(() => {
    const url = `${window.location.origin}/inventory/bloque/${codigo}`;
    QRCode.toDataURL(url, { width: 220, margin: 1 }).then(setQr).catch(() => setQr(''));
  }, [codigo]);

  const add = async () => {
    if (!form.codigo || form.cantidad === '') { toast.error('SKU y cantidad'); return; }
    try {
      await agregar.mutateAsync({ bloqueId: b.id, codigoBloque: codigo, codigo: form.codigo.toUpperCase(), cantidad: Number(form.cantidad), partida: form.partida, serie: form.serie });
      setForm({ codigo: '', cantidad: '', partida: '', serie: '' }); toast.success('Ítem agregado');
    } catch (e) { toast.error(e.message); }
  };
  const auditarBloque = async () => {
    // Auditoría: valida las cantidades esperadas (esperada = lo asignado; contada = prompt).
    const items = [];
    for (const it of (b.items || [])) {
      const c = window.prompt(`Contado para ${it.codigo_producto}${it.partida ? ' / ' + it.partida : ''} (esperado ${it.cantidad}):`, String(it.cantidad));
      if (c === null) return;
      items.push({ codigo_producto: it.codigo_producto, descripcion: it.descripcion, unidad_medida: it.unidad_medida, partida: it.partida, serie: it.serie, esperada: Number(it.cantidad) || 0, contada: Number(c) || 0 });
    }
    try { const a = await auditar.mutateAsync({ bloqueId: b.id, codigoBloque: codigo, items }); toast[a.estado === 'cuadrado' ? 'success' : 'info'](`Auditoría ${a.estado} (${a.items_dif} con diferencia)`); }
    catch (e) { toast.error(e.message); }
  };
  const cerrarBloque = async () => {
    try { await editar.mutateAsync({ id: b.id, estado: b.estado === 'activo' ? 'cerrado' : 'activo' }); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <span className="font-mono font-black text-slate-900">{codigo}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        {isLoading || !b ? <div className="p-6 text-slate-400">Cargando…</div> : (
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              {qr && <img src={qr} alt="QR" className="w-32 h-32 rounded-lg border border-slate-200" />}
              <div className="text-sm space-y-1">
                <div><b>Bodega:</b> {b.bodega}</div>
                <div><b>Estado:</b> {b.estado}</div>
                <a href={`/inventory/bloque/${codigo}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold flex items-center gap-1 text-xs"><ExternalLink size={12} /> Abrir página del bloque</a>
                <div className="flex gap-2 pt-1">
                  <button onClick={cerrarBloque} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black hover:bg-slate-50">{b.estado === 'activo' ? 'Cerrar bloque' : 'Reabrir'}</button>
                  <button onClick={auditarBloque} disabled={!b.items?.length} className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-black disabled:opacity-40 flex items-center gap-1"><ClipboardCheck size={13} /> Auditar</button>
                </div>
              </div>
            </div>

            {b.estado === 'activo' && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end bg-slate-50 rounded-xl p-3">
                <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="SKU" className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm col-span-2" />
                <input value={form.partida} onChange={(e) => setForm({ ...form, partida: e.target.value })} placeholder="Partida" className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                <input value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} type="number" placeholder="Cant." className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                <button onClick={add} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-black">+ Ítem</button>
              </div>
            )}

            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="text-left px-3 py-2">SKU</th><th className="text-left px-3 py-2">Partida</th><th className="text-right px-3 py-2">Cant.</th><th></th></tr></thead>
                <tbody>
                  {(b.items || []).map((it) => (
                    <tr key={it.id} className="border-t border-slate-50">
                      <td className="px-3 py-2 font-mono text-xs">{it.codigo_producto}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{it.partida || '—'}</td>
                      <td className="px-3 py-2 text-right font-bold">{n(it.cantidad)}</td>
                      <td className="px-3 py-2 text-right">{b.estado === 'activo' && <button onClick={() => elimItem.mutate({ id: it.id, codigoBloque: codigo })} className="text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>}</td>
                    </tr>
                  ))}
                  {(b.items || []).length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-slate-400 text-center text-xs">Sin ítems.</td></tr>}
                </tbody>
              </table>
            </div>

            {(b.auditorias || []).length > 0 && (
              <div className="text-xs text-slate-500">
                <div className="font-black text-slate-600 mb-1">Auditorías</div>
                {b.auditorias.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 py-0.5">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${a.estado === 'cuadrado' ? chip('CUADRADO') : chip('FALTA')}`}>{a.estado}</span>
                    <span>{a.auditor_nombre} · {a.items_ok}/{a.items_total} OK · esperado {n(a.esperado_total)} / contado {n(a.contado_total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Proyección de palletizado (port fiel de t-o-inventario) ─────────────────
// Cajas = Cant. OC ÷ unid. por caja (redondeo arriba), salvo Cajas (manual) que
// manda. Cajas x pallet = pie × altura. Pallets = cajas ÷ cajas por pallet.
function calcProy(p) {
  const oc = Number(p.cantOc) || 0, manual = Number(p.cantBx) || 0, cxb = Number(p.cantXBx) || 0;
  const pie = Number(p.pie) || 0, alt = Number(p.altura) || 0;
  const cajasAuto = cxb > 0 ? Math.ceil(oc / cxb) : 0;
  const cajas = manual > 0 ? Math.ceil(manual) : cajasAuto;
  const esManual = manual > 0;
  const bxPallet = pie * alt;
  const pallets = bxPallet > 0 ? cajas / bxPallet : 0;
  const palletsEnteros = Math.ceil(pallets);
  const cajasUltimo = bxPallet > 0 ? cajas % bxPallet : 0;
  const unidadesReales = cajas * cxb;
  let balanceado = null;
  if (palletsEnteros >= 2 && cajasUltimo > 0) {
    const base = Math.floor(cajas / palletsEnteros);
    const conUnaMas = cajas % palletsEnteros;
    balanceado = { base, conUnaMas, conBase: palletsEnteros - conUnaMas };
  }
  return { cajas, cajasAuto, esManual, bxPallet, pallets, palletsEnteros, cajasUltimo, unidadesReales, balanceado };
}
function textoBalanceado(b) {
  const total = b.conBase + b.conUnaMas;
  if (b.conUnaMas === 0) return `${total} pallets de ${b.base} cajas`;
  if (b.conBase === 0) return `${total} pallets de ${b.base + 1} cajas`;
  return `${total} pallets: ${b.conUnaMas} de ${b.base + 1} y ${b.conBase} de ${b.base} cajas`;
}
const s0 = (v) => (Number(v) ? String(Number(v)) : '');
const fromRow = (r) => ({ id: r.id, prod: r.prod || '', cantOc: s0(r.cant_oc), cantBx: s0(r.cant_bx), cantXBx: s0(r.cant_x_bx), pie: s0(r.pie), altura: s0(r.altura), creado_por_nombre: r.creado_por_nombre });
const toNums = (p) => ({ prod: p.prod, cantOc: Number(p.cantOc) || 0, cantBx: Number(p.cantBx) || 0, cantXBx: Number(p.cantXBx) || 0, pie: Number(p.pie) || 0, altura: Number(p.altura) || 0 });

function TabProyeccion() {
  const { data: server = [], isLoading } = useProyecciones();
  const guardar = useGuardarProyeccion();
  const eliminar = useEliminarProyeccion();
  const [rows, setRows] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const seeded = useRef(false);
  const timers = useRef({});

  // Sembramos el estado local una vez (luego mandamos nosotros para no pisar el tipeo).
  useEffect(() => {
    if (!seeded.current && !isLoading) { setRows(server.map(fromRow)); seeded.current = true; }
  }, [isLoading, server]);

  const set = (id, campo, valor) => {
    setRows((rs) => {
      const nuevos = rs.map((r) => (r.id === id ? { ...r, [campo]: valor } : r));
      const row = nuevos.find((r) => r.id === id);
      clearTimeout(timers.current[id]);
      setGuardando(true);
      timers.current[id] = setTimeout(async () => {
        try { await guardar.mutateAsync({ id, ...toNums(row) }); }
        catch (e) { toast.error(e.message || 'No se pudo guardar'); }
        finally { setGuardando(false); }
      }, 600);
      return nuevos;
    });
  };
  const agregar = async () => {
    try { const nueva = await guardar.mutateAsync({ id: null, prod: '', cantOc: 0, cantBx: 0, cantXBx: 0, pie: 6, altura: 6 }); setRows((rs) => [...rs, fromRow(nueva)]); }
    catch (e) { toast.error(e.message); }
  };
  const duplicar = async (p) => {
    try { const nueva = await guardar.mutateAsync({ id: null, ...toNums(p) }); setRows((rs) => [...rs, fromRow(nueva)]); }
    catch (e) { toast.error(e.message); }
  };
  const borrar = async (id) => {
    try { await eliminar.mutateAsync({ id }); setRows((rs) => rs.filter((r) => r.id !== id)); }
    catch (e) { toast.error(e.message); }
  };

  const totales = rows.reduce((t, p) => { const c = calcProy(p); return { pallets: t.pallets + c.pallets, enteros: t.enteros + c.palletsEnteros, cajas: t.cajas + c.cajas }; }, { pallets: 0, enteros: 0, cajas: 0 });
  const exportar = () => exportToExcel({ filename: 'proyeccion_pallets', sheets: [{ name: 'Proyección', rows: rows.map((p, i) => {
    const c = calcProy(p);
    return { Proyección: `Proyección ${i + 1}`, Producto: p.prod, 'Cant. OC': Number(p.cantOc) || 0, 'Cant. x caja': Number(p.cantXBx) || 0, Cajas: c.cajas, 'Origen cajas': c.esManual ? 'manual' : 'auto', 'Pie del pallet': Number(p.pie) || 0, Altura: Number(p.altura) || 0, 'Cajas x pallet': c.bxPallet, 'Pallets usados': Math.round(c.pallets * 100) / 100, 'Pallets completos': c.palletsEnteros, 'Distribución pareja': c.balanceado ? textoBalanceado(c.balanceado) : (c.palletsEnteros ? `${c.palletsEnteros} de ${c.bxPallet}` : ''), 'Unidades reales': c.unidadesReales };
  }) }] });

  const inp = 'w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-orange-400 outline-none';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Cajas totales" value={n(totales.cajas)} />
        <Kpi label="Pallets exactos" value={n(Math.round(totales.pallets * 100) / 100)} />
        <Kpi label="Pallets completos" value={n(totales.enteros)} tone="good" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-900 flex items-center gap-2"><Calculator size={18} className="text-orange-500" /> Proyección de palletizado{guardando && <span className="text-[11px] font-bold text-orange-500">· guardando…</span>}</h2>
          <button onClick={exportar} disabled={!rows.length} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40"><Download size={14} /> Excel</button>
        </div>

        {isLoading && <div className="text-slate-400 text-sm">Cargando…</div>}
        {!isLoading && rows.length === 0 && <div className="text-slate-400 text-sm">Sin proyecciones. Agregá una para calcular pallets.</div>}

        {rows.map((p, i) => {
          const c = calcProy(p);
          const ok = c.bxPallet > 0 && c.cajas > 0;
          return (
            <div key={p.id} className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-700 text-sm">Proyección {i + 1}{p.creado_por_nombre && <span className="ml-2 text-xs font-normal text-slate-400">· {p.creado_por_nombre}</span>}</span>
                <div className="flex gap-1">
                  <button onClick={() => duplicar(p)} title="Duplicar" className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"><Copy size={14} /></button>
                  <button onClick={() => borrar(p.id)} title="Eliminar" className="rounded-lg px-2 py-1 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button>
                </div>
              </div>

              <input className={inp} placeholder="Producto (ej: COMPRESA)" value={p.prod} onChange={(e) => set(p.id, 'prod', e.target.value)} />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div><label className="text-[10px] font-black uppercase text-slate-400">Cant. OC</label><input className={inp} inputMode="numeric" placeholder="20000" value={p.cantOc} onChange={(e) => set(p.id, 'cantOc', e.target.value)} /></div>
                <div><label className="text-[10px] font-black uppercase text-slate-400">Cajas (manual)</label><input className={inp} inputMode="numeric" placeholder={c.cajasAuto > 0 ? `auto: ${c.cajasAuto}` : 'auto'} value={p.cantBx} onChange={(e) => set(p.id, 'cantBx', e.target.value)} /></div>
                <div><label className="text-[10px] font-black uppercase text-slate-400">Unid. x caja</label><input className={inp} inputMode="numeric" placeholder="50" value={p.cantXBx} onChange={(e) => set(p.id, 'cantXBx', e.target.value)} /></div>
                <div><label className="text-[10px] font-black uppercase text-slate-400">Pie del pallet</label><input className={inp} inputMode="numeric" placeholder="6" value={p.pie} onChange={(e) => set(p.id, 'pie', e.target.value)} /></div>
                <div><label className="text-[10px] font-black uppercase text-slate-400">Altura (pisos)</label><input className={inp} inputMode="numeric" placeholder="6" value={p.altura} onChange={(e) => set(p.id, 'altura', e.target.value)} /></div>
              </div>

              <div className={'rounded-xl p-3 text-sm ' + (ok ? 'bg-orange-50' : 'bg-slate-50 text-slate-400')}>
                {ok ? (
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-slate-600">
                      <span>📦 Cajas: <b className="text-slate-800">{n(c.cajas)}</b>{c.esManual && <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">manual</span>}</span>
                      <span>🧱 Cajas x pallet: <b className="text-slate-800">{n(c.bxPallet)}</b></span>
                      <span>Unid. reales: <b className="text-slate-800">{n(c.unidadesReales)}</b></span>
                    </div>
                    <div className="text-base font-black text-orange-600">🚛 {n(Math.round(c.pallets * 100) / 100)} pallets<span className="ml-2 text-sm font-semibold text-slate-500">→ {n(c.palletsEnteros)} pallet{c.palletsEnteros === 1 ? '' : 's'}</span></div>
                    {c.balanceado ? (
                      <div className="space-y-0.5 text-sm text-slate-600">
                        <div>🤝 <b>Parejo:</b> {textoBalanceado(c.balanceado)}</div>
                        <div className="text-slate-400">📚 Llenado máximo: {n(c.palletsEnteros - 1)} de {n(c.bxPallet)} y el último con {n(c.cajasUltimo)}</div>
                      </div>
                    ) : c.palletsEnteros >= 1 && (
                      <div className="text-sm text-slate-500">{c.palletsEnteros === 1 ? `Un solo pallet con ${n(c.cajas)} caja${c.cajas === 1 ? '' : 's'}` : `Todos llenos: ${n(c.palletsEnteros)} pallets de ${n(c.bxPallet)} cajas justas`}</div>
                    )}
                  </div>
                ) : 'Completá cantidad, unidades por caja, pie y altura para calcular.'}
              </div>
            </div>
          );
        })}

        <button onClick={agregar} className="w-full px-3 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-black flex items-center justify-center gap-1.5 hover:bg-orange-700"><Plus size={15} /> Agregar proyección</button>

        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm text-slate-500">
          💡 <b>Cajas</b> = Cant. OC ÷ unid. por caja (redondeado hacia arriba), salvo que llenes <b>Cajas (manual)</b>, que manda sobre el cálculo — igual que CANT BX en tu planilla. <b>Cajas x pallet</b> = pie × altura. <b>Pallets</b> = cajas ÷ cajas por pallet. Las proyecciones se guardan en la base: todos ven las mismas.
        </div>
      </div>
    </div>
  );
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────
function Kpi({ label, value, tone }) {
  const t = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-rose-600' : tone === 'warn' ? 'text-amber-600' : 'text-slate-900';
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
      <div className={`text-xl font-black mt-1 ${t}`}>{value}</div>
    </div>
  );
}

function TablaReporte({ isLoading, rows, cols }) {
  if (isLoading) return <div className="p-6 text-slate-400 text-sm">Cargando…</div>;
  if (!rows.length) return <div className="p-6 text-slate-400 text-sm">No hay conteos para mostrar.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
          <tr>{cols.map(([k, label]) => <th key={k} className={`px-3 py-2 ${['num', 'dif', 'money'].includes(cols.find((c) => c[0] === k)[2]) ? 'text-right' : 'text-left'}`}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-50 hover:bg-orange-50/30">
              {cols.map(([k, , type]) => {
                const v = row[k];
                if (type === 'estado') return <td key={k} className="px-3 py-2"><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${chip(v)}`}>{v}</span></td>;
                if (type === 'money') return <td key={k} className={`px-3 py-2 text-right font-bold ${Number(v) < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{money(v)}</td>;
                if (type === 'dif') return <td key={k} className={`px-3 py-2 text-right font-black ${Number(v) < 0 ? 'text-rose-600' : Number(v) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{Number(v) > 0 ? '+' : ''}{n(v)}</td>;
                if (type === 'num') return <td key={k} className="px-3 py-2 text-right">{n(v)}</td>;
                if (type === 'mono') return <td key={k} className="px-3 py-2 font-mono text-xs">{v}</td>;
                return <td key={k} className="px-3 py-2 text-slate-600 max-w-xs truncate">{v}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
