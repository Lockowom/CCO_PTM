import React, { useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { analisis } from '../../services/inventarioReportes';
import { n, money$, getSesionActiva } from '../../components/inventory/ui';
import { SesionSelector, useSesiones } from './Conciliacion';

const CARDS = [
  { k: 'CUADRADO', label: 'Cuadrados', emoji: '✅', cls: 'from-emerald-500 to-emerald-600' },
  { k: 'FALTA', label: 'Faltantes', emoji: '❌', cls: 'from-rose-500 to-rose-600' },
  { k: 'SOBRA', label: 'Sobrantes', emoji: '⚠️', cls: 'from-amber-500 to-amber-600' },
];

export default function Analisis() {
  const sesiones = useSesiones();
  const [sesion, setSesion] = useState(getSesionActiva());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(true); analisis(sesion || null).then(setData).finally(() => setLoading(false)); }, [sesion]);

  const total = (data?.skus_contados) || 1;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 grid place-items-center text-indigo-600"><BarChart3 size={22} /></div>
          <div><h1 className="text-lg font-black text-slate-900">Análisis</h1><p className="text-xs text-slate-500">Exactitud e impacto valorizado</p></div></div>
        <SesionSelector sesion={sesion} setSesion={setSesion} sesiones={sesiones} />
      </div>

      {loading || !data ? <div className="grid place-items-center py-10"><Loader2 className="animate-spin text-indigo-500" size={30} /></div> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CARDS.map((c) => { const r = data.resumen[c.k] || { cantidad: 0, valorizado: 0 }; const pct = Math.round((r.cantidad / total) * 100); return (
              <div key={c.k} className={'rounded-2xl bg-gradient-to-br p-5 text-white shadow ' + c.cls}>
                <div className="flex items-center justify-between"><span className="text-3xl">{c.emoji}</span><span className="text-3xl font-black">{n(r.cantidad)}</span></div>
                <div className="mt-2 text-sm font-bold">{c.label} <span className="opacity-80">({pct}%)</span></div>
                <div className="mt-1 text-xs opacity-90">Valorizado: {money$(r.valorizado)}</div>
              </div>); })}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="SKUs contados" value={n(data.skus_contados)} />
            <Stat label="Unidades" value={n(data.unidades_contadas)} />
            <Stat label="Exactitud" value={`${Math.round(((data.resumen.CUADRADO?.cantidad || 0) / total) * 100)}%`} tone="emerald" />
            <Stat label="Impacto total" value={money$(data.impacto_total)} tone={data.impacto_total < 0 ? 'rose' : 'emerald'} />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
            La <b>exactitud</b> es el % de SKUs que cuadran exactamente con el sistema. El <b>impacto total</b> suma las diferencias valorizadas al costo unitario (negativo = faltante neto). Cargá costos por SKU para el valorizado.
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  const c = tone === 'rose' ? 'text-rose-600' : tone === 'emerald' ? 'text-emerald-600' : 'text-slate-800';
  return <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm"><div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{label}</div><div className={'mt-1 text-xl font-black ' + c}>{value}</div></div>;
}
