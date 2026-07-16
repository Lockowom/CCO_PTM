import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend,
} from 'recharts';
import { RefreshCw, Loader2 } from 'lucide-react';
import PanelModal from './PanelModal';
import { getDashboard, getDetalle } from './panelService';

const clp = (n) => '$' + Number(n || 0).toLocaleString('es-CL');
const RIESGO_CLS = { alto: 'bg-red-100 text-red-700', medio: 'bg-amber-100 text-amber-700', bajo: 'bg-emerald-100 text-emerald-700' };

function KPICard({ title, value, subtitle, color, icon, onClick }) {
  return (
    <button onClick={onClick} className="kpi-card text-left w-full" style={{ borderTop: `3px solid ${color}` }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{title}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-black mt-1" style={{ color }}>{value}</p>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{subtitle}</p>}
    </button>
  );
}
function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-black text-slate-700">{title}</h3></div>
      {children}
    </div>
  );
}
function DateFilter({ onFilter }) {
  const [from, setFrom] = useState('2026-01-01');
  const [to, setTo] = useState('2026-07-15');
  const presets = [{ label: 'Última semana' }, { label: 'Último mes' }, { label: '3 meses' }, { label: 'Año' }];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
      <span className="text-slate-400 text-xs">a</span>
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
      <button onClick={() => onFilter?.(from, to)} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600">Filtrar</button>
      <div className="flex gap-1">
        {presets.map((p) => <button key={p.label} onClick={() => onFilter?.(p.label)} className="px-2.5 py-1 text-[11px] rounded-full border border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-300">{p.label}</button>)}
      </div>
    </div>
  );
}

// Modal de detalle: pide sus filas al servicio (getDetalle).
function DetalleModal({ sel, onClose }) {
  const [d, setD] = useState(null);
  useEffect(() => { let on = true; getDetalle(sel.titulo, sel.count).then((r) => on && setD(r)); return () => { on = false; }; }, [sel]);
  const suma = d ? d.rows.reduce((a, r) => a + r.monto, 0) : 0;
  return (
    <PanelModal titulo={`Detalle · ${sel.titulo}`} onClose={onClose}>
      {!d ? (
        <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={26} /></div>
      ) : (
        <>
          <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-black text-slate-600">{d.total.toLocaleString('es-CL')} registro{d.total !== 1 ? 's' : ''}</span>
            <span className="text-slate-400">Monto listado: <b className="text-slate-600">{clp(suma)}</b></span>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-400 text-xs uppercase"><th className="py-1">N.V.</th><th>Cliente</th><th>Vendedor</th><th>Estado</th><th>Fecha</th><th className="text-right">Monto</th></tr></thead>
              <tbody>
                {d.rows.map((r) => (
                  <tr key={r.nv} className="border-t border-slate-100">
                    <td className="py-2 font-mono font-bold text-slate-700">{r.nv}</td><td>{r.cliente}</td><td>{r.vendedor}</td>
                    <td className="text-slate-500">{r.estado}</td><td className="text-slate-500">{r.fecha}</td><td className="text-right font-bold">{clp(r.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {d.total > d.mostrados && <p className="text-center text-xs text-slate-400 mt-3">… y {(d.total - d.mostrados).toLocaleString('es-CL')} registros más</p>}
            <p className="text-center text-[11px] text-slate-400 mt-2">Datos de ejemplo</p>
          </div>
        </>
      )}
    </PanelModal>
  );
}

export default function PanelHome() {
  const [d, setD] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(120);
  const cdRef = useRef(120);

  const cargar = () => { setLoading(true); getDashboard().then((res) => { setD(res); setLoading(false); cdRef.current = 120; setCountdown(120); }); };
  useEffect(() => { cargar(); }, []);
  useEffect(() => {
    const t = setInterval(() => { cdRef.current = cdRef.current <= 1 ? 120 : cdRef.current - 1; setCountdown(cdRef.current); }, 1000);
    return () => clearInterval(t);
  }, []);

  if (!d) {
    return <div className="flex flex-col items-center justify-center py-24 gap-3"><Loader2 className="animate-spin text-orange-500" size={34} /><p className="text-xs font-bold text-slate-400">Cargando dashboard…</p></div>;
  }

  const k = d.kpis;
  const maxEtapa = Math.max(1, ...d.tiempos.etapas.map((e) => e.dias || 0));

  return (
    <div className="space-y-6 anim-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateFilter onFilter={cargar} />
        <button onClick={cargar} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
        </button>
      </div>

      {/* Notas de Venta por canal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm border-l-4" style={{ borderLeftColor: '#f97316' }}>
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">Notas de Venta</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ label: 'N° NV PTM', value: k.countNvPtm, color: '#f97316' }, { label: 'N.V Orange', value: k.nvOrange, color: '#1f2937' },
            { label: 'N.V Farmapack', value: k.nvFarmapack, color: '#1f2937' }, { label: 'Varios', value: k.nvVarios, color: '#1f2937' }].map((c) => (
            <button key={c.label} onClick={() => setDetalle({ titulo: c.label, count: c.value })} className="text-left hover:opacity-70 transition-opacity">
              <div className="text-xs text-slate-400">{c.label}</div>
              <div className="text-2xl font-black" style={{ color: c.color }}>{c.value.toLocaleString('es-CL')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* KPIs operacionales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="NVs Activas" value={k.activas} color="#2563eb" icon="📦" onClick={() => setDetalle({ titulo: 'NVs Activas', count: k.activas })} />
        <KPICard title="Tardanza Prom." value={`${k.leadTimeTardanza} días`} subtitle="Solo entregas tardías" color="#e11d48" icon="🕐" onClick={() => setDetalle({ titulo: 'Entregas tardías', count: 26 })} />
        <KPICard title="A Tiempo" value={`${k.pctAtiempo}%`} subtitle="Entregado ≤ compromiso" color="#10b981" icon="✅" onClick={() => setDetalle({ titulo: 'A tiempo', count: k.entregadas })} />
        <KPICard title="Fill Rate" value={`${k.fillRateShipping.pct}%`} subtitle={`${k.fillRateShipping.evaluables} evaluables`} color="#f97316" icon="📋" onClick={() => setDetalle({ titulo: 'Fill rate', count: k.fillRateShipping.evaluables })} />
      </div>

      {/* Banner calidad */}
      <button onClick={() => setDetalle({ titulo: 'Calidad de datos', count: d.calidad.total })}
        className="w-full text-left bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between hover:bg-amber-100 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <div><div className="text-sm font-bold text-amber-800">{d.calidad.total} registros con datos incompletos o incoherentes</div>
            <div className="text-xs text-amber-600">{Object.entries(d.calidad.porTipo).map(([t, n]) => `${t}: ${n}`).join(' · ')}</div></div>
        </div>
        <span className="text-amber-400 text-lg">→</span>
      </button>

      {/* Estado + gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="table-container">
            <table><thead><tr><th className="text-left">Estado</th><th>Cantidad</th></tr></thead>
              <tbody>{d.estadoTable.map((r) => (
                <tr key={r.estado} className="cursor-pointer" onClick={() => setDetalle({ titulo: r.estado, count: r.count })}>
                  <td className="text-left"><span className={`badge badge-${r.badge}`}>{r.estado}</span></td><td className="font-bold">{r.count}</td>
                </tr>))}
              </tbody></table>
          </div>
          <div className="table-container">
            <table><thead><tr><th className="text-left">Estado activo</th><th>Cantidad</th></tr></thead>
              <tbody>{d.resumen.map((r) => (
                <tr key={r.estado} className="cursor-pointer" onClick={() => setDetalle({ titulo: r.estado, count: r.count })}>
                  <td className="text-left font-medium">{r.estado}</td><td className="font-bold">{r.count}</td>
                </tr>))}
              </tbody></table>
          </div>
        </div>
        <div className="space-y-4">
          <Card title="Tendencia semanal (creadas vs entregadas)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d.weekly}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="semana" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="creadas" fill="#f97316" radius={[4, 4, 0, 0]} /><Bar dataKey="entregadas" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Lead time semanal (días)">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={d.leadTime}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="semana" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Line type="monotone" dataKey="dias" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Tiempos de ciclo */}
      <div className="table-container p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2"><h3 className="font-black text-slate-800">Tiempos de ciclo</h3><span className="text-[11px] text-slate-400">Días promedio · calculado desde fechas por estado.</span></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl border border-slate-200 p-3.5"><p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead time total</p><p className="mt-1 text-2xl font-black" style={{ color: '#f97316' }}>{d.tiempos.leadTimeTotal} d</p><p className="text-[10px] text-slate-400">Aprobación → entrega · n={d.tiempos.leadTimeTotalN}</p></div>
          {d.tiempos.etapas.map((e) => (<div key={e.nombre} className="rounded-xl border border-slate-200 p-3.5"><p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{e.nombre}</p><p className="mt-1 text-2xl font-black text-slate-800">{e.dias} d</p><p className="text-[10px] text-slate-400">n={e.n}</p></div>))}
        </div>
        {d.tiempos.cuelloBotella && <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-[12px] text-red-700">🚨 Cuello de botella: <strong>{d.tiempos.cuelloBotella.nombre}</strong> ({d.tiempos.cuelloBotella.dias} d)</div>}
        <div className="space-y-2.5">
          {d.tiempos.etapas.map((e) => (
            <div key={e.nombre} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-[12px] text-slate-600 text-right">{e.nombre}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                <div className="h-full rounded-md flex items-center justify-end pr-2 text-[11px] font-bold text-white" style={{ width: `${Math.max(6, (e.dias / maxEtapa) * 100)}%`, background: d.tiempos.cuelloBotella?.nombre === e.nombre ? '#e11d48' : '#f97316' }}>{e.dias} d</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      <Card title="Alertas operacionales (N.V. estancadas)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="text-left text-slate-400 text-xs uppercase"><th className="py-1">N.V.</th><th>Cliente</th><th>Estado</th><th>Días</th><th>Riesgo</th></tr></thead>
            <tbody>{d.alertasOp.map((a) => (
              <tr key={a.nv} className="border-t border-slate-100 cursor-pointer hover:bg-orange-50" onClick={() => setDetalle({ titulo: a.nv, count: 1 })}>
                <td className="py-2 font-mono font-bold text-slate-700">{a.nv}</td><td>{a.cliente}</td><td>{a.estado}</td><td className="font-bold">{a.dias}</td>
                <td><span className={`badge ${RIESGO_CLS[a.riesgo]}`}>{a.riesgo}</span></td>
              </tr>))}
            </tbody></table>
        </div>
      </Card>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ranking transportistas">
          <ul className="space-y-2">{d.rankTransp.map((t, i) => (<li key={t.nombre} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><b className="text-slate-300">{i + 1}</b> {t.nombre}</span><span className="text-slate-500">{t.entregas} entregas · <b className="text-emerald-600">{t.atiempoPct}%</b></span></li>))}</ul>
        </Card>
        <Card title="Ranking vendedores">
          <ul className="space-y-2">{d.rankVend.map((v, i) => (<li key={v.nombre} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><b className="text-slate-300">{i + 1}</b> {v.nombre}</span><span className="text-slate-500">{v.nv} N.V. · <b className="text-slate-700">{clp(v.monto)}</b></span></li>))}</ul>
        </Card>
      </div>

      {/* Divisiones */}
      <Card title="Divisiones">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{d.divisions.map((x) => (<div key={x.division} className="rounded-lg border border-slate-100 p-3 text-center"><p className="text-xs font-bold text-slate-400 uppercase">{x.division}</p><p className="text-xl font-black text-slate-800 mt-1">{x.nv}</p><p className="text-[11px] text-emerald-600">{x.entregadas} entregadas</p></div>))}</div>
      </Card>

      {/* Tendencia histórica */}
      <Card title="Tendencia histórica (6 meses)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={d.tendencia}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis yAxisId="l" tick={{ fontSize: 11 }} /><YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} domain={[80, 100]} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="l" type="monotone" dataKey="entregadas" stroke="#f97316" strokeWidth={2} /><Line yAxisId="r" type="monotone" dataKey="otif" stroke="#10b981" strokeWidth={2} /></LineChart>
        </ResponsiveContainer>
      </Card>

      <p className="text-center text-xs text-slate-400 py-2">Datos de ejemplo · vía panelService (punto único de conexión)</p>
      {detalle && <DetalleModal sel={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}
