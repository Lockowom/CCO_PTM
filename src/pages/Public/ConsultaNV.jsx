import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ChevronDown, Package, Truck } from 'lucide-react';
import { supabase } from '../../supabase';

// Consulta PÚBLICA de Nota de Venta (sin login, sin navbar) — único acceso
// público del Panel en CCO. Lee vía la RPC `buscar_nv_publico` (estado +
// logística, SIN montos ni datos internos). Ruta /consulta.
const ESTADO_COLOR = {
  'En Proceso': '#f59e0b', 'P / VENDEDOR': '#d97706', 'P / STOCK': '#b45309', 'P / RETIRO': '#92400e',
  'Shipping': '#8b5cf6', 'Currier': '#7c3aed', 'En Ruta': '#06b6d4', 'Entregado': '#22c55e',
  'NULA': '#94a3b8', 'REFACTURADO': '#94a3b8', 'RECHAZADO': '#94a3b8', 'Sin estado': '#64748b',
};
const val = (v) => (v == null || v === '' ? '—' : String(v));
const fecha = (v) => (v ? String(v).slice(0, 10) : '—');

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

export default function ConsultaNV() {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');

  const q = query.trim();
  useEffect(() => {
    if (q.length < 3) { setResultados([]); setError(''); return undefined; }
    setBuscando(true); setError('');
    const t = setTimeout(async () => {
      const { data, error: e } = await supabase.rpc('buscar_nv_publico', { p_q: q });
      if (e) { setError('No se pudo consultar. Intenta nuevamente.'); setResultados([]); }
      else setResultados(data || []);
      setBuscando(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const searched = q.length >= 3;
  const conteoEstados = useMemo(() => {
    const m = {};
    resultados.forEach((r) => { const e = r.estado || 'Sin estado'; m[e] = (m[e] || 0) + 1; });
    return m;
  }, [resultados]);

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* Header público */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, #f57c00, #e65100)' }}>PTM</div>
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-tight">Consulta tu Nota de Venta</h1>
            <p className="text-xs text-slate-400">Seguimiento de estado y despacho · PTM</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Buscador */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)} autoFocus
              placeholder="N° de NV, Factura, Guía, N° de envío o Cliente…"
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none transition"
            />
            {query && (
              <button onClick={() => { setQuery(''); setExpandedId(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={16} /></button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">Escribe al menos 3 caracteres. Puedes buscar por número de NV, factura, guía, N° de envío o nombre del cliente.</p>
        </div>

        {/* Resumen */}
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
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-400 mx-auto mb-4"><Truck size={30} /></div>
            <p className="text-slate-600 font-black">Consulta el estado de tu pedido</p>
            <p className="text-slate-400 text-xs mt-1">Ingresa tu número de nota de venta, factura o guía</p>
          </div>
        )}

        {error && <div className="text-center text-sm text-red-500 py-4">{error}</div>}

        {/* Sin resultados */}
        {searched && !buscando && !error && resultados.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-4"><Package size={30} /></div>
            <p className="text-slate-500 text-sm font-bold">No se encontraron resultados</p>
            <p className="text-slate-400 text-xs mt-1">Verifica el número e intenta de nuevo</p>
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
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition hover:shadow-md"
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
                      <span className="text-xs text-slate-400 truncate">{r.transportista && r.transportista !== '—' ? r.transportista : ' '}</span>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">{fecha(r.fecha_registro_nv)}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div className="px-4 pb-5 pt-1 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                        <InfoSection titulo="Identificación">
                          <Row label="Canal" value={r.canal} />
                          <Row label="NV PTM" value={r.nv_ptm} /><Row label="NV Orange" value={r.nv_orange} />
                          <Row label="NV Farmapack" value={r.nv_farmapack} /><Row label="Varios" value={r.varios} />
                          <Row label="Factura" value={r.factura} /><Row label="Guía" value={r.guia} /><Row label="N° Envío" value={r.numero_envio} />
                          <Row label="Cliente" value={r.cliente} />
                        </InfoSection>
                        <InfoSection titulo="Despacho">
                          <Row label="Estado" value={est} color={color} />
                          <Row label="Tipo Despacho" value={r.tipo_despacho} />
                          <Row label="Transportista" value={r.transportista} />
                          <Row label="Emp. Transporte" value={r.empresa_transporte} />
                          <Row label="Bultos" value={r.bultos} />
                          <Row label="Incidencia" value={r.incidencia} />
                          <Row label="Estado Incid." value={r.estado_incidencia} />
                        </InfoSection>
                        <InfoSection titulo="Fechas Clave">
                          <Row label="Registro NV" value={fecha(r.fecha_registro_nv)} />
                          <Row label="Creación N.V" value={fecha(r.fecha_aprobacion)} />
                          <Row label="Compromiso" value={fecha(r.fecha_compromiso)} />
                          <Row label="Facturación" value={r.fecha_facturacion} />
                        </InfoSection>
                        <InfoSection titulo="Fechas Logística">
                          <Row label="En Proceso" value={fecha(r.fecha_en_proceso)} /><Row label="Shipping" value={fecha(r.fecha_shipping)} />
                          <Row label="Despacho" value={fecha(r.fecha_despacho)} /><Row label="En Ruta" value={fecha(r.fecha_en_ruta)} />
                          <Row label="Entregado" value={fecha(r.fecha_entregado)} />
                        </InfoSection>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-[11px] text-slate-300 py-6">PTM · Consulta pública de notas de venta</p>
      </main>
    </div>
  );
}
