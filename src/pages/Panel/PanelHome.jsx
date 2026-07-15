import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import {
  MOCK_KPIS, MOCK_ESTADO_TABLE, MOCK_RESUMEN, MOCK_WEEKLY, MOCK_LEADTIME,
  MOCK_RANK_TRANSP, MOCK_RANK_VEND, MOCK_DIVISIONS, MOCK_ALERTAS_OP,
  MOCK_TENDENCIA, MOCK_CALIDAD,
} from './mock';

const clp = (n) => '$' + Number(n || 0).toLocaleString('es-CL');
const RIESGO_CLS = { alto: 'bg-red-100 text-red-700', medio: 'bg-amber-100 text-amber-700', bajo: 'bg-emerald-100 text-emerald-700' };

function Kpi({ label, value, sub, accent = 'text-gray-800' }) {
  return (
    <div className="kpi-card">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-black mt-1 ${accent}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Card({ title, children, right }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-gray-700">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

export default function PanelHome() {
  const k = MOCK_KPIS;
  return (
    <div className="space-y-6 anim-fade-up">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi label="Total N.V." value={k.totalNV.toLocaleString('es-CL')} />
        <Kpi label="Entregadas" value={k.entregadas.toLocaleString('es-CL')} accent="text-emerald-600" />
        <Kpi label="En Proceso" value={k.enProceso} accent="text-orange-600" />
        <Kpi label="En Ruta" value={k.enRuta} accent="text-blue-600" />
        <Kpi label="% A Tiempo" value={`${k.atiempoPct}%`} accent="text-emerald-600" />
        <Kpi label="OTIF" value={`${k.otifPct}%`} sub={`Lead time ${k.leadTimeProm} días`} accent="text-indigo-600" />
      </div>

      {/* Banner calidad de datos */}
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 flex items-center gap-3">
        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
        <div className="text-sm text-amber-800">
          <b>{MOCK_CALIDAD.total}</b> notas de venta con datos incompletos ·{' '}
          {Object.entries(MOCK_CALIDAD.porTipo).map(([t, n]) => `${t}: ${n}`).join(' · ')}
        </div>
      </div>

      {/* Grid principal: estado + gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="table-container">
            <table>
              <thead><tr><th className="text-left">Estado</th><th>Cantidad</th></tr></thead>
              <tbody>
                {MOCK_ESTADO_TABLE.map((r) => (
                  <tr key={r.estado} className="cursor-pointer">
                    <td className="text-left"><span className={`badge badge-${r.badge}`}>{r.estado}</span></td>
                    <td className="font-bold">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th className="text-left">Estado activo</th><th>Cantidad</th></tr></thead>
              <tbody>
                {MOCK_RESUMEN.map((r) => (
                  <tr key={r.estado}><td className="text-left font-medium">{r.estado}</td><td className="font-bold">{r.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <Card title="Tendencia semanal (creadas vs entregadas)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MOCK_WEEKLY}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="creadas" fill="#f57c00" radius={[4, 4, 0, 0]} />
                <Bar dataKey="entregadas" fill="#2e7d32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Lead time semanal (días)">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={MOCK_LEADTIME}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="dias" stroke="#1565c0" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Alertas operacionales */}
      <Card title="Alertas operacionales (N.V. estancadas)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 text-xs uppercase">
              <th className="py-1">N.V.</th><th>Cliente</th><th>Estado</th><th>Días</th><th>Riesgo</th>
            </tr></thead>
            <tbody>
              {MOCK_ALERTAS_OP.map((a) => (
                <tr key={a.nv} className="border-t border-gray-100">
                  <td className="py-2 font-mono font-bold text-gray-700">{a.nv}</td>
                  <td>{a.cliente}</td><td>{a.estado}</td><td className="font-bold">{a.dias}</td>
                  <td><span className={`badge ${RIESGO_CLS[a.riesgo]}`}>{a.riesgo}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ranking transportistas">
          <ul className="space-y-2">
            {MOCK_RANK_TRANSP.map((t, i) => (
              <li key={t.nombre} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><b className="text-gray-300">{i + 1}</b> {t.nombre}</span>
                <span className="text-gray-500">{t.entregas} entregas · <b className="text-emerald-600">{t.atiempoPct}%</b></span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Ranking vendedores">
          <ul className="space-y-2">
            {MOCK_RANK_VEND.map((v, i) => (
              <li key={v.nombre} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><b className="text-gray-300">{i + 1}</b> {v.nombre}</span>
                <span className="text-gray-500">{v.nv} N.V. · <b className="text-gray-700">{clp(v.monto)}</b></span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Divisiones */}
      <Card title="Divisiones">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MOCK_DIVISIONS.map((d) => (
            <div key={d.division} className="rounded-lg border border-gray-100 p-3 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase">{d.division}</p>
              <p className="text-xl font-black text-gray-800 mt-1">{d.nv}</p>
              <p className="text-[11px] text-emerald-600">{d.entregadas} entregadas</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tendencia histórica */}
      <Card title="Tendencia histórica (6 meses)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={MOCK_TENDENCIA}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} domain={[80, 100]} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="l" type="monotone" dataKey="entregadas" stroke="#f57c00" strokeWidth={2} />
            <Line yAxisId="r" type="monotone" dataKey="otif" stroke="#2e7d32" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <p className="text-center text-xs text-gray-400 py-2">Datos de ejemplo · pendiente conectar a datos reales</p>
    </div>
  );
}
