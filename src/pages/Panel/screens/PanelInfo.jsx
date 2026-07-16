import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, X, ChevronDown, Clock, Package, Loader2 } from 'lucide-react';
import { buscarNV, cambiarEstado, ESTADO_COLOR } from '../panelService';

// Estados canónicos seleccionables para el cambio rápido.
const ESTADOS_CAMBIO = ['En Proceso', 'P / VENDEDOR', 'P / STOCK', 'P / RETIRO', 'Shipping', 'Currier', 'En Ruta', 'Entregado', 'NULA', 'REFACTURADO', 'RECHAZADO'];

// Info N.V. (port de /info): buscador universal + tarjetas expandibles con el
// detalle completo. Datos de ejemplo (MOCK_NVS); al conectar, se reemplaza la
// búsqueda por la consulta a `operaciones` en Supabase.
const HIST_KEY = 'panel_info_historial';
const clp = (v) => (v == null || v === '' ? '—' : Number(v).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }));
const val = (v) => (v == null || v === '' ? '—' : String(v));

function InfoSection({ titulo, children }) {
  const rows = React.Children.toArray(children).filter(Boolean);
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">{titulo}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ label, value, color }) {
  const d = val(value);
  if (d === '—') return null;
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-slate-400 text-xs w-28 shrink-0">{label}</span>
      {color
        ? <span className="font-black px-1.5 py-0.5 rounded text-white text-xs" style={{ backgroundColor: color }}>{d}</span>
        : <span className="text-slate-700 font-bold">{d}</span>}
    </div>
  );
}

export default function PanelInfo() {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    try { setHistorial(JSON.parse(localStorage.getItem(HIST_KEY) || '[]')); } catch { /* ignore */ }
  }, []);

  const guardarHist = (t) => {
    const term = t.trim();
    if (term.length < 2) return;
    setHistorial((prev) => {
      const next = [term, ...prev.filter((x) => x.toLowerCase() !== term.toLowerCase())].slice(0, 6);
      try { localStorage.setItem(HIST_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const q = query.trim();
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  // Búsqueda con debounce a través del servicio (panelService.buscarNV).
  useEffect(() => {
    if (!q) { setResultados([]); return; }
    setBuscando(true);
    const t = setTimeout(() => { buscarNV(q).then((rows) => { setResultados(rows); setBuscando(false); }); }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const [cambiando, setCambiando] = useState(null);
  const onCambiarEstado = async (r, nuevo) => {
    if (!nuevo || nuevo === r.estado) return;
    const prev = r.estado;
    setCambiando(r.id);
    setResultados((rs) => rs.map((x) => (x.id === r.id ? { ...x, estado: nuevo } : x)));
    const res = await cambiarEstado(r.id, nuevo);
    setCambiando(null);
    if (!res.ok) {
      setResultados((rs) => rs.map((x) => (x.id === r.id ? { ...x, estado: prev } : x)));
      toast.error(res.error || 'No se pudo cambiar el estado');
    } else {
      toast.success(`${r.nv} → ${nuevo}`);
    }
  };

  const searched = q.length > 0;
  const conteoEstados = useMemo(() => {
    const m = {};
    resultados.forEach((r) => { const e = r.estado || 'Sin estado'; m[e] = (m[e] || 0) + 1; });
    return m;
  }, [resultados]);

  return (
    <div className="anim-fade-up space-y-4">
      {/* Barra de búsqueda */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && guardarHist(query)}
            placeholder="Buscar por NV, Factura, Guía, Cliente, Vendedor…"
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none transition"
          />
          {query && (
            <button onClick={() => { setQuery(''); setExpandedId(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={16} /></button>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-400">Búsqueda instantánea mientras escribes · NV PTM/Orange/Farmapack, Factura, Guía, Varios, N° de Envío, cliente o vendedor.</p>
        {historial.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 inline-flex items-center gap-1"><Clock size={13} /> Recientes:</span>
            {historial.map((h) => (
              <button key={h} onClick={() => setQuery(h)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 text-xs font-bold border border-slate-200">{h}</button>
            ))}
            <button onClick={() => { setHistorial([]); try { localStorage.removeItem(HIST_KEY); } catch { /* ignore */ } }}
              className="text-xs text-slate-400 hover:text-red-500 ml-1">Limpiar</button>
          </div>
        )}
      </div>

      {/* Resumen de estados */}
      {resultados.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-black text-slate-600">{resultados.length} resultado{resultados.length !== 1 ? 's' : ''}</span>
          <span className="text-slate-300">|</span>
          {Object.entries(conteoEstados).map(([est, cnt]) => (
            <span key={est} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: ESTADO_COLOR[est] || '#64748b' }}>{est} ({cnt})</span>
          ))}
        </div>
      )}

      {/* Estado inicial */}
      {!searched && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-400 mx-auto mb-4"><Search size={30} /></div>
          <p className="text-slate-600 font-black">Busca información de una nota de venta</p>
          <p className="text-slate-400 text-xs mt-1">Escribe cualquier número de NV, factura, guía o N° de envío</p>
        </div>
      )}

      {/* Sin resultados */}
      {searched && !buscando && resultados.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-4"><Package size={30} /></div>
          <p className="text-slate-500 text-sm font-bold">No se encontraron resultados</p>
          <p className="text-slate-400 text-xs mt-1">Intenta con otro término</p>
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="space-y-3">
          {resultados.map((r) => {
            const est = r.estado || 'Sin estado';
            const color = ESTADO_COLOR[est] || '#64748b';
            const open = expandedId === r.id;
            return (
              <div key={r.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition hover:shadow-md ${r.urgente ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`}
                style={{ borderLeft: `4px solid ${color}` }}>
                <button onClick={() => setExpandedId(open ? null : r.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3">
                  <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black text-white" style={{ backgroundColor: color }}>{est}</span>
                  <div className="flex items-center gap-2 min-w-0 shrink-0">
                    <span className="text-xs font-bold text-slate-400">{r.canal}</span>
                    <span className="font-black text-slate-800 text-sm">{r.nv}</span>
                  </div>
                  <div className="hidden sm:flex flex-col min-w-0 flex-1">
                    <span className="text-sm text-slate-700 font-bold truncate">{r.cliente || '—'}</span>
                    <span className="text-xs text-slate-400 truncate">{[r.vendedor, r.transportista].filter((x) => x && x !== '—').join(' · ') || ' '}</span>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">{r.fecha_registro_nv || '—'}</span>
                  {r.urgente && <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-black rounded animate-pulse">🚨 URGENTE</span>}
                  <ChevronDown size={18} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="px-4 pb-5 pt-1 border-t border-slate-100 anim-fade-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mt-3">
                      <InfoSection titulo="Identificación">
                        <Row label="Canal" value={r.canal} />
                        <Row label="NV PTM" value={r.nv_ptm} /><Row label="NV Orange" value={r.nv_orange} />
                        <Row label="NV Farmapack" value={r.nv_farmapack} /><Row label="Varios" value={r.varios} />
                        <Row label="Factura" value={r.factura} /><Row label="Guía" value={r.guia} /><Row label="N° Envío" value={r.numero_envio} />
                      </InfoSection>
                      <InfoSection titulo="Comercial">
                        <Row label="Cliente" value={r.cliente} /><Row label="Vendedor" value={r.vendedor} />
                        <Row label="División" value={r.division} /><Row label="Centro Costo" value={r.centro_costo} />
                        <Row label="Tipo Despacho" value={r.tipo_despacho} /><Row label="Transportista" value={r.transportista} />
                        <Row label="Emp. Transporte" value={r.empresa_transporte} />
                      </InfoSection>
                      <InfoSection titulo="Valores">
                        <Row label="Valor Factura" value={clp(r.valor_factura)} /><Row label="Valor NV" value={clp(r.valor_nv)} />
                        <Row label="Costo Flete" value={clp(r.costo_flete)} /><Row label="Bultos" value={r.bultos} /><Row label="Fill Rate" value={r.fillrate} />
                      </InfoSection>
                      <InfoSection titulo="Estado">
                        <Row label="Estado" value={est} color={color} />
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400 text-xs w-28 shrink-0">Cambiar a</span>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={r.estado || ''} disabled={cambiando === r.id}
                              onChange={(e) => onCambiarEstado(r, e.target.value)}
                              className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none disabled:opacity-50">
                              {ESTADOS_CAMBIO.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {cambiando === r.id && <Loader2 size={14} className="animate-spin text-orange-500" />}
                          </div>
                        </div>
                        <Row label="Urgente" value={r.urgente ? 'Sí' : 'No'} />
                        <Row label="Incidencia" value={r.incidencia} /><Row label="Estado Incid." value={r.estado_incidencia} />
                        <Row label="Obs. Incid." value={r.observaciones_incidencia} /><Row label="Días Incid." value={r.dias_incidencia} />
                      </InfoSection>
                      <InfoSection titulo="Fechas Clave">
                        <Row label="Registro NV" value={r.fecha_registro_nv} /><Row label="Creación N.V" value={r.fecha_aprobacion} />
                        <Row label="Aprob. Real" value={r.fecha_aprobacion_real} /><Row label="Compromiso" value={r.fecha_compromiso} /><Row label="Facturación" value={r.fecha_facturacion} />
                      </InfoSection>
                      <InfoSection titulo="Fechas Logística">
                        <Row label="En Proceso" value={r.fecha_en_proceso} /><Row label="Shipping" value={r.fecha_shipping} />
                        <Row label="Despacho" value={r.fecha_despacho} /><Row label="En Ruta" value={r.fecha_en_ruta} />
                        <Row label="Entregado" value={r.fecha_entregado} /><Row label="Últ. cambio" value={r.fecha_estado} />
                      </InfoSection>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
