import React, { useEffect, useMemo, useState } from 'react';
import { Wrench, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { ajusteErp } from '../../services/inventarioReportes';
import { n, money$, getSesionActiva } from '../../components/inventory/ui';
import { SesionSelector, useSesiones, Kpi } from './Conciliacion';

const FILTROS = [{ k: 'TODOS', label: 'Todos' }, { k: 'BAJA', label: 'Bajas (faltan)' }, { k: 'ALTA', label: 'Altas (sobran)' }, { k: 'NOCONT', label: 'No contados' }];

export default function AjusteErp() {
  const sesiones = useSesiones();
  const [sesion, setSesion] = useState(getSesionActiva());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODOS');
  const [q, setQ] = useState('');

  useEffect(() => { setLoading(true); ajusteErp(sesion || null).then(setRows).catch(() => toast.error('Error al calcular')).finally(() => setLoading(false)); }, [sesion]);

  const filtradas = useMemo(() => rows.filter((r) => {
    const okF = filtro === 'TODOS' || (filtro === 'NOCONT' ? r.estado.includes('NO CONTADO') : r.tipo_movimiento === filtro);
    const okQ = !q || r.codigo_producto.toLowerCase().includes(q.toLowerCase()) || (r.descripcion || '').toLowerCase().includes(q.toLowerCase()) || String(r.partida).toLowerCase().includes(q.toLowerCase());
    return okF && okQ;
  }), [rows, filtro, q]);

  const tot = useMemo(() => filtradas.reduce((t, r) => ({ lineas: t.lineas + 1, dif: t.dif + r.diferencia, impacto: t.impacto + r.impacto, altas: t.altas + (r.diferencia > 0 ? 1 : 0), bajas: t.bajas + (r.diferencia < 0 ? 1 : 0) }), { lineas: 0, dif: 0, impacto: 0, altas: 0, bajas: 0 }), [filtradas]);

  const exportar = () => {
    const ws = XLSX.utils.json_to_sheet(filtradas.map((r) => ({ SKU: r.codigo_producto, Partida: r.partida, Descripción: r.descripcion, UM: r.unidad_medida, 'Cant. física': r.contado, 'Cant. sistema': r.sistema, Diferencia: r.diferencia, 'Tipo mov.': r.tipo_movimiento, Estado: r.estado, 'Costo unit.': r.costo_unitario, 'Impacto $': r.impacto, Ubicaciones: r.ubicaciones, Alerta: r.alerta_calidad })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Ajuste ERP'); XLSX.writeFile(wb, 'ajuste_erp.xlsx');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 grid place-items-center text-indigo-600"><Wrench size={22} /></div>
          <div><h1 className="text-lg font-black text-slate-900">Ajuste ERP</h1><p className="text-xs text-slate-500">Por SKU + partida (incluye NO CONTADO y PARTIDA NUEVA)</p></div></div>
        <button onClick={exportar} disabled={!filtradas.length} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 disabled:opacity-50"><Download size={14} /> Excel</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Líneas" value={n(tot.lineas)} /><Kpi label="Altas / Bajas" value={`${tot.altas} / ${tot.bajas}`} />
        <Kpi label="Dif. neta" value={n(tot.dif)} tone={tot.dif < 0 ? 'rose' : 'emerald'} /><Kpi label="Impacto $" value={money$(tot.impacto)} tone={tot.impacto < 0 ? 'rose' : 'emerald'} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SesionSelector sesion={sesion} setSesion={setSesion} sesiones={sesiones} />
        {FILTROS.map((f) => <button key={f.k} onClick={() => setFiltro(f.k)} className={'text-xs font-bold px-3 py-1.5 rounded-full border ' + (filtro === f.k ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600')}>{f.label}</button>)}
        <input className="flex-1 min-w-[140px] rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Buscar SKU / partida…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? <div className="grid place-items-center py-10"><Loader2 className="animate-spin text-indigo-500" size={30} /></div> :
        filtradas.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400">Sin datos.</div> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400"><tr><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Partida</th><th className="px-3 py-2 text-right">Física</th><th className="px-3 py-2 text-right">Sistema</th><th className="px-3 py-2 text-right">Dif.</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2 text-right">Impacto $</th><th className="px-3 py-2">Alerta</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-xs font-bold text-slate-700">{r.codigo_producto}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{r.partida}</td>
                  <td className="px-3 py-2 text-right font-bold">{n(r.contado)}</td><td className="px-3 py-2 text-right text-slate-500">{n(r.sistema)}</td>
                  <td className={'px-3 py-2 text-right font-black ' + (r.diferencia < 0 ? 'text-rose-600' : r.diferencia > 0 ? 'text-amber-600' : 'text-emerald-600')}>{r.diferencia > 0 ? '+' : ''}{n(r.diferencia)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{r.estado}</td>
                  <td className={'px-3 py-2 text-right ' + (r.impacto < 0 ? 'text-rose-600' : 'text-slate-600')}>{money$(r.impacto)}</td>
                  <td className="px-3 py-2 text-xs text-fuchsia-600">{r.alerta_calidad}</td>
                </tr>))}
            </tbody>
          </table>
        </div>)}
    </div>
  );
}
