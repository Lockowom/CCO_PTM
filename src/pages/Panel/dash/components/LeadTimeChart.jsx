import { useState, memo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

const METRICAS = {
  dias: {
    label: "Tardanza (días)",
    titulo: "Tardanza Promedio por Semana (días)",
    unidad: "días",
    color: "#f57c00",
  },
  pctAtiempo: {
    label: "% A Tiempo",
    titulo: "% Entregas A Tiempo por Semana",
    unidad: "%",
    color: "#2e7d32",
  },
};

function colorDias(d) {
  return d > 3 ? "#c62828" : d > 1 ? "#f57c00" : "#2e7d32";
}
function colorPct(p) {
  return p >= 80 ? "#2e7d32" : p >= 50 ? "#f57c00" : "#c62828";
}

function LeadTimeChart({ data }) {
  const [tipo, setTipo] = useState("barras");
  const [metrica, setMetrica] = useState("dias");

  const cfg = METRICAS[metrica];

  const tooltipFormatter = (_v, _n, props) => {
    const entry = props.payload;
    return [
      `${entry.dias} días tarde  ·  ${entry.pctAtiempo}% a tiempo  ·  ${entry.count} entregas`,
      metrica === "dias" ? "Tardanza" : "A tiempo",
    ];
  };

  const tooltipProps = {
    contentStyle: { borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
    formatter: tooltipFormatter,
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {cfg.titulo}
        </h3>
        <div className="flex items-center gap-2">
          {/* Selector de métrica */}
          <div className="flex rounded-lg bg-gray-100 p-0.5">
            {Object.keys(METRICAS).map((m) => (
              <button
                key={m}
                onClick={() => setMetrica(m)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  metrica === m ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {METRICAS[m].label}
              </button>
            ))}
          </div>
          {/* Selector de tipo */}
          <div className="flex rounded-lg bg-gray-100 p-0.5">
            <button
              onClick={() => setTipo("barras")}
              title="Barras"
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                tipo === "barras" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ▮ Barras
            </button>
            <button
              onClick={() => setTipo("linea")}
              title="Tendencia"
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                tipo === "linea" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ╱ Tendencia
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        {tipo === "barras" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="semana" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} domain={metrica === "pctAtiempo" ? [0, 100] : undefined} />
            <Tooltip {...tooltipProps} />
            <ReferenceLine y={0} stroke="#ccc" />
            <Bar dataKey={metrica} radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={metrica === "dias" ? colorDias(entry.dias) : colorPct(entry.pctAtiempo)}
                />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="semana" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} domain={metrica === "pctAtiempo" ? [0, 100] : undefined} />
            <Tooltip {...tooltipProps} />
            <ReferenceLine y={0} stroke="#ccc" />
            <Line
              type="monotone"
              dataKey={metrica}
              stroke={cfg.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: cfg.color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default memo(LeadTimeChart);
