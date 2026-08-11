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
import { WEEKLY_TREND_RELIABLE_FROM, WEEKLY_TREND_RELIABLE_LABEL } from '../weeklyTrendConfig';

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
      <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
        Cobertura confiable desde el <strong>{WEEKLY_TREND_RELIABLE_LABEL}</strong>. El historial
        anterior no se grafica porque no cuenta con fechas de entrega completas.
      </div>
      {data?.length ? (
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
      ) : (
        <div
          className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-xs text-gray-500"
          data-reliable-from={WEEKLY_TREND_RELIABLE_FROM}
        >
          El rango seleccionado no contiene semanas con trazabilidad confiable de entregas.
        </div>
      )}
    </div>
  );
}

export default memo(WeeklyChart);
