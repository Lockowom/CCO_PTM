import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageCheck, AlertTriangle, Clock, User, CalendarClock,
  ArrowRight, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useStockFreshness, getCycleStart, TABLES_24H, RESET_LABEL } from '../hooks/useStockFreshness';
import { useAuth } from '../context/AuthContext';

const fmtDate = (d) =>
  new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
const fmtTime = (d) =>
  new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: true }).format(d);

// Firma "Tío Inventario" con letras en ola + degradado animado
const AnimatedSignature = ({ text }) => (
  <span className="ti-signature font-black tracking-tight text-2xl sm:text-3xl">
    {text.split('').map((ch, i) =>
      ch === ' '
        ? <span key={i}>&nbsp;</span>
        : <span key={i} className="ti-letter" style={{ animationDelay: `${i * 0.06}s` }}>{ch}</span>
    )}
  </span>
);

const StockFreshness = ({ table, label }) => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { data: latest } = useStockFreshness();

  // Solo quien puede usar la Carga Masiva debe ver el botón que lleva ahí; al resto
  // mostrarle el CTA solo provocaría una pantalla de "Acceso Denegado".
  const canImport = user?.rol === 'ADMIN' || user?.es_admin_delegado || hasPermission('manage_data_import');

  const info = useMemo(() => {
    const rec = latest?.[table];
    const lastUpdate = rec?.fecha_carga ? new Date(rec.fecha_carga) : null;
    const cycleStart = getCycleStart();
    const aplica24h = TABLES_24H.includes(table);
    const isFresh = lastUpdate ? lastUpdate >= cycleStart : false;
    const isStale = aplica24h && (!lastUpdate || !isFresh);
    return { rec, lastUpdate, isFresh, isStale, aplica24h };
  }, [latest, table]);

  const { rec, lastUpdate, isFresh, isStale, aplica24h } = info;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-8 mt-4 sm:mt-6 space-y-4">
      {/* ── Tarjeta vistosa: última actualización ── */}
      <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border shadow-[0_18px_45px_-20px_rgba(0,0,0,0.25)]
        ${isStale ? 'border-red-200 bg-gradient-to-br from-red-50 via-orange-50 to-white'
                  : 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-white'}`}>
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-40 ${isStale ? 'bg-red-300' : 'bg-emerald-300'}`} />
        <div className="relative p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shadow-lg
            ${isStale ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
            {isStale ? <ShieldAlert size={26} /> : <PackageCheck size={26} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Estado del stock · {label}
              </p>
              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border
                ${isStale ? 'bg-red-100 text-red-700 border-red-300'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-300'}`}>
                {aplica24h ? (isStale ? 'Desactualizado' : 'Al día') : 'Informativo'}
              </span>
            </div>

            {lastUpdate ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1">
                <div className="flex items-center gap-2 text-slate-800">
                  <CalendarClock size={16} className="text-slate-400 shrink-0" />
                  <span className="font-bold capitalize text-sm sm:text-base truncate">{fmtDate(lastUpdate)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock size={15} className="text-slate-400 shrink-0" />
                  <span className="font-extrabold tabular-nums text-sm sm:text-base">{fmtTime(lastUpdate)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <User size={15} className="text-slate-400 shrink-0" />
                  <span className="font-bold text-sm sm:text-base truncate">{rec.usuario_nombre || 'Desconocido'}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 font-semibold text-sm">Aún no hay registros de carga para esta tabla.</p>
            )}

            {aplica24h && (
              <p className="mt-1.5 text-[11px] sm:text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Clock size={12} /> Vigencia: ciclo diario de <span className="font-black text-slate-500">{RESET_LABEL} a {RESET_LABEL} hrs</span>
              </p>
            )}
          </div>

          {!isStale && aplica24h && (
            <div className="hidden sm:flex items-center gap-2 text-emerald-600 font-black text-sm shrink-0">
              <CheckCircle2 size={18} /> Vigente
            </div>
          )}
        </div>
      </div>

      {/* ── Aviso prominente: stock desactualizado ── */}
      {isStale && (
        <div className="ti-banner-glow relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-red-300 bg-white">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-red-500 to-orange-500" />
          <div className="p-5 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-200 mb-4">
              <AlertTriangle className="text-red-500 animate-bounce" size={28} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Favor actualizar stock
            </h2>
            <p className="text-slate-600 font-semibold max-w-xl mx-auto leading-relaxed">
              El stock se encuentra <span className="text-red-600 font-black">desactualizado</span>.
              Tiene un límite de vigencia de <span className="font-black text-slate-800">24 horas</span>,
              con corte diario a las <span className="font-black text-slate-800">{RESET_LABEL} hrs</span>.
            </p>

            {canImport ? (
              <button
                onClick={() => navigate('/inbound/data-import')}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black rounded-xl shadow-lg shadow-red-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Actualizar ahora <ArrowRight size={18} />
              </button>
            ) : (
              <p className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm">
                <Clock size={16} className="text-slate-400" />
                Avisa al encargado de inventario para actualizar el stock.
              </p>
            )}

            {/* Firma animada */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-0.5">Atte</span>
              <AnimatedSignature text="Tío Inventario" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockFreshness;
