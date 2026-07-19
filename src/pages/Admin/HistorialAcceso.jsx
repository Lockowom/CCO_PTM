import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { LogIn, RefreshCw, Search, CalendarClock, Users as UsersIcon, Clock } from 'lucide-react';
import { historialAcceso, historialAccesoResumen } from '../../services/iamService';
import { ListaSkeleton, ListaError, ListaVacia } from '../../components/ui/EstadoLista';

const inp = 'border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400 bg-white';

const fmt = (ts) => { if (!ts) return '—'; const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); };
const hace = (ts) => {
  if (!ts) return '';
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return 'hace instantes';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
};

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">
    <div className="text-lg font-black text-slate-800 tabular-nums">{value ?? '—'}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</div>
  </div>
);

export default function HistorialAcceso() {
  const [rows, setRows] = useState([]);
  const [resumen, setResumen] = useState({});
  const [f, setF] = useState({ desde: '', hasta: '', q: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await historialAcceso({ desde: f.desde, hasta: f.hasta, q: f.q, limit: 400 })); }
    catch (e) { setError(e.message || 'No autorizado'); }
    finally { setLoading(false); }
  }, [f]);
  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { historialAccesoResumen().then(setResumen).catch(() => {}); }, []);

  const inicial = (n) => (n || '?').charAt(0).toUpperCase();

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Ingresos totales" value={resumen.total} />
        <Stat label="Usuarios" value={resumen.usuarios} />
        <Stat label="Hoy" value={resumen.hoy} />
        <Stat label="Últimos 7 días" value={resumen.semana} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Nombre, email o rol"
            className={`${inp} pl-8 w-56`} />
        </div>
        <input type="date" value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} className={inp} />
        <input type="date" value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} className={inp} />
        <button onClick={cargar} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50">
          <RefreshCw size={14} /> Aplicar
        </button>
        {resumen.ultimo && <span className="ml-auto text-[11px] text-slate-400 inline-flex items-center gap-1.5"><Clock size={12} /> último ingreso {hace(resumen.ultimo)}</span>}
      </div>

      {/* Lista */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <ListaSkeleton />
        ) : error ? (
          <ListaError mensaje={error} onRetry={cargar} />
        ) : rows.length === 0 ? (
          <ListaVacia>Sin ingresos para el filtro.</ListaVacia>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black grid place-items-center shrink-0">{inicial(r.nombre)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-800 truncate">{r.nombre || '(sin nombre)'}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{r.rol}</span>
                    {r.usuario_activo === false && <span className="text-[10px] font-bold text-red-500 bg-red-50 rounded px-1.5 py-0.5">usuario inactivo</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{r.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] text-slate-600 tabular-nums inline-flex items-center gap-1"><LogIn size={12} className="text-emerald-500" /> {fmt(r.fecha)}</div>
                  <div className="text-[10px] text-slate-400">{hace(r.fecha)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400 flex items-center gap-1.5"><CalendarClock size={12} /> Registra los <b>ingresos exitosos</b> (Supabase Auth). Se muestran los 400 más recientes según el filtro.</p>
    </div>
  );
}
