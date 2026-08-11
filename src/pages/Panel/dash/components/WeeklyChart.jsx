import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function WeeklyChart({ data }) {
  const TooltipFlujo = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload || {};
    const balance = Number(item.balanceCola || 0);
    return (
      <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-xl border border-gray-100">
        <p className="font-bold text-gray-700 mb-1">Semana {label}</p>
        <p className="text-orange-600">
          Aprobadas: {item.aprobadas || 0} ({item.aprobadasDia || 0}/día)
        </p>
        <p className="text-green-700">
          Entregadas: {item.entregadas || 0} ({item.entregadasDia || 0}/día)
        </p>
        <p className={`mt-1 font-semibold ${balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
          {balance >= 0 ? `Cola reducida en ${balance}` : `Cola aumentó en ${Math.abs(balance)}`}{' '}
          N.V.
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Entradas vs salidas reales por semana
      </h3>
      <p className="text-[11px] text-gray-400 mt-1 mb-4">
        Aprobadas por fecha de aprobación · Entregadas por fecha real de entrega · promedio sobre 5
        días hábiles
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="semana" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip content={<TooltipFlujo />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="aprobadas"
            stroke="#f57c00"
            strokeWidth={2}
            name="NVs Aprobadas"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="entregadas"
            stroke="#2e7d32"
            strokeWidth={2}
            name="NVs Entregadas"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(WeeklyChart);
