import { useEffect, useMemo, useState } from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { supabase } from '../supabase';

// Tráfico de la Consulta pública (/consulta) — contador diario sin datos
// personales (tabla tms_consulta_metricas, alimentada por buscar_nv_publico).
export default function TraficoConsulta() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dias, setDias] = useState(30);

  const cargar = async () => {
    setLoading(true);
    const desde = new Date();
    desde.setDate(desde.getDate() - (dias - 1));
    const desdeStr = desde.toISOString().slice(0, 10);
    const { data } = await supabase
      .from('tms_consulta_metricas')
      .select('dia,total,con_resultado,sin_resultado')
      .gte('dia', desdeStr)
      .order('dia', { ascending: true });
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => {
    cargar(); /* eslint-disable-next-line */
  }, [dias]);

  const kpi = useMemo(() => {
    const t = rows.reduce((a, r) => a + (r.total || 0), 0);
    const con = rows.reduce((a, r) => a + (r.con_resultado || 0), 0);
    const sin = rows.reduce((a, r) => a + (r.sin_resultado || 0), 0);
    const hoyStr = new Date().toISOString().slice(0, 10);
    const hoy = rows.find((r) => String(r.dia) === hoyStr)?.total || 0;
    return { t, con, sin, hoy, pct: t ? Math.round((con / t) * 100) : 0 };
  }, [rows]);

  const maxDia = Math.max(1, ...rows.map((r) => r.total || 0));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="text-blue-500" size={20} /> Tráfico Consulta pública
          </h3>
          <p className="text-slate-500 text-xs">
            Consultas en <code>/consulta</code> · sin datos personales (solo conteo diario)
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDias(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${dias === d ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={cargar}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Kpi label={`Total (${dias}d)`} value={kpi.t} color="#2563eb" />
        <Kpi label="Hoy" value={kpi.hoy} color="#0ea5e9" />
        <Kpi label="Con resultado" value={`${kpi.con} · ${kpi.pct}%`} color="#10b981" />
        <Kpi label="Sin resultado" value={kpi.sin} color="#f59e0b" />
      </div>

      {/* Barras por día */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">Cargando…</div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          Aún no hay consultas registradas en este período.
        </div>
      ) : (
        <div className="flex items-end gap-0.5 h-28 overflow-x-auto">
          {rows.map((r) => (
            <div
              key={r.dia}
              className="flex-1 min-w-[6px] flex flex-col items-center justify-end group relative"
              title={`${r.dia}: ${r.total} consultas (${r.con_resultado} con resultado)`}
            >
              <div
                className="w-full rounded-t bg-blue-400 group-hover:bg-blue-600 transition-colors"
                style={{ height: `${Math.max(4, ((r.total || 0) / maxDia) * 100)}%` }}
              />
            </div>
          ))}
        </div>
      )}
      {rows.length > 0 && (
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>{rows[0]?.dia}</span>
          <span>{rows[rows.length - 1]?.dia}</span>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="text-xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
    </div>
  );
}
