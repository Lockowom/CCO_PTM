import React, { useEffect, useMemo, useState } from 'react';
import { Scale, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabase';
import { conciliacion } from '../../services/inventarioReportes';
import { n, money$, estadoStyle, getSesionActiva, setSesionActiva } from '../../components/inventory/ui';

const FILTROS = [{ k: 'TODOS', label: 'Todos' }, { k: 'FALTA', label: '❌ Faltan' }, { k: 'SOBRA', label: '⚠️ Sobran' }, { k: 'CUADRADO', label: '✅ Cuadrados' }];

export function SesionSelector({ sesion, setSesion, sesiones }) {
  return (
    <select className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm max-w-[60%]" value={sesion} onChange={(e) => { setSesion(e.target.value); setSesionActiva(e.target.value); }}>
      <option value="">Todas las sesiones</option>
      {sesiones.map((s) => <option key={s.id} value={s.id}>{s.estado === 'cerrada' ? '🔒 ' : ''}{s.nombre}</option>)}
    </select>
  );
}

export function useSesiones() {
  const [sesiones, setSesiones] = useState([]);
  useEffect(() => { supabase.from('wms_cc_sesiones').select('id,nombre,estado').order('created_at', { ascending: false }).then(({ data }) => setSesiones(data || [])); }, []);
  return sesiones;
}

export default function Conciliacion() {
  const sesiones = useSesiones();
  const [sesion, setSesion] = useState(getSesionActiva());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODOS');
  const [q, setQ] = useState('');

  useEffect(() => { setLoading(true); conciliacion(sesion || null).then(setRows).catch(() => toast.error('Error al calcular')).finally(() => setLoading(false)); }, [sesion]);

  const filtradas = useMemo(() => rows.filter((r) => (filtro === 'TODOS' || r.estado === filtro) &&
    (!q || r.codigo_producto.toLowerCase().includes(q.toLowerCase()) || (r.descripcion || '').toLowerCase().includes(q.toLowerCase()))), [rows, filtro, q]);

  const tot = useMemo(() => filtradas.reduce((t, r) => ({ skus: t.skus + 1, contado: t.contado + r.contado, dif: t.dif + r.diferencia, impacto: t.impacto + r.impacto }), { skus: 0, contado: 0, dif: 0, impacto: 0 }), [filtradas]);

  const exportar = () => {
    const ws = XLSX.utils.json_to_sheet(filtradas.map((r) => ({ SKU: r.codigo_producto, Descripción: r.descripcion, UM: r.unidad_medida, Contado: r.contado, Sistema: r.sistema, Diferencia: r.diferencia, Estado: r.estado, Ubicaciones: r.ubicaciones, Partidas: r.partidas_distintas, 'Costo unit.': r.costo_unitario, 'Impacto $': r.impacto })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Conciliación'); XLSX.writeFile(wb, 'conciliacion.xlsx');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 grid place-items-center text-indigo-600"><Scale size={22} /></div>
          <div><h1 className="text-lg font-black text-slate-900">Conciliación</h1><p className="text-xs text-slate-500">Contado vs sistema por SKU</p></div></div>
        <button onClick={exportar} disabled={!filtradas.length} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 disabled:opacity-50"><Download size={14} /> Excel</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="SKUs" value={n(tot.skus)} /><Kpi label="Contado" value={n(tot.contado)} />
        <Kpi label="Diferencia" value={n(tot.dif)} tone={tot.dif < 0 ? 'rose' : tot.dif > 0 ? 'amber' : 'emerald'} />
        <Kpi label="Impacto $" value={money$(tot.impacto)} tone={tot.impacto < 0 ? 'rose' : 'emerald'} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SesionSelector sesion={sesion} setSesion={setSesion} sesiones={sesiones} />
        {FILTROS.map((f) => <button key={f.k} onClick={() => setFiltro(f.k)} className={'text-xs font-bold px-3 py-1.5 rounded-full border ' + (filtro === f.k ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600')}>{f.label}</button>)}
        <input className="flex-1 min-w-[140px] rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Buscar SKU o descripción…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? <div className="grid place-items-center py-10"><Loader2 className="animate-spin text-indigo-500" size={30} /></div> :
        filtradas.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400">Sin datos para esta sesión.</div> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400"><tr><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2 text-right">Contado</th><th className="px-3 py-2 text-right">Sistema</th><th className="px-3 py-2 text-right">Dif.</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2 text-right">Impacto $</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map((r) => { const st = estadoStyle(r.estado); return (
                <tr key={r.codigo_producto} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-xs font-bold text-slate-700">{r.codigo_producto}</td>
                  <td className="px-3 py-2 text-slate-600 max-w-[240px] truncate" title={r.descripcion}>{r.descripcion}</td>
                  <td className="px-3 py-2 text-right font-bold">{n(r.contado)}</td><td className="px-3 py-2 text-right text-slate-500">{n(r.sistema)}</td>
                  <td className={'px-3 py-2 text-right font-black ' + (r.diferencia < 0 ? 'text-rose-600' : r.diferencia > 0 ? 'text-amber-600' : 'text-emerald-600')}>{r.diferencia > 0 ? '+' : ''}{n(r.diferencia)}</td>
                  <td className="px-3 py-2"><span className={'text-[11px] font-bold px-2 py-0.5 rounded-full ' + st.cls}>{st.emoji} {st.label}</span></td>
                  <td className={'px-3 py-2 text-right ' + (r.impacto < 0 ? 'text-rose-600' : 'text-slate-600')}>{money$(r.impacto)}</td>
                </tr>); })}
            </tbody>
          </table>
        </div>)}
    </div>
  );
}

export function Kpi({ label, value, tone }) {
  const c = tone === 'rose' ? 'text-rose-600' : tone === 'amber' ? 'text-amber-600' : tone === 'emerald' ? 'text-emerald-600' : 'text-slate-800';
  return <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm"><div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{label}</div><div className={'mt-1 text-lg font-black ' + c}>{value}</div></div>;
}
