export default function TendenciaSection({ tendencia }) {
  if (tendencia.length === 0) return null;
  return (
    <div className="table-container">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-bold text-gray-800">Tendencia Histórica</h3>
        <span className="text-[11px] text-gray-400">Últimos 6 meses · evolución de métricas clave</span>
      </div>

      {/* Gráfico de barras: OTIF + % A Tiempo por mes */}
      <div className="space-y-3 mb-5">
        {tendencia.map((m) => (
          <div key={m.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-[12px] text-gray-600 text-right font-medium">{m.label}</span>
            <div className="flex-1 flex gap-1">
              <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden" title={`OTIF: ${m.otif ?? "—"}%`}>
                <div className="h-full rounded flex items-center justify-end pr-1.5 text-[10px] font-semibold text-white transition-all" style={{ width: `${Math.max(4, m.otif ?? 0)}%`, background: "#0d47a1" }}>
                  {m.otif != null ? `${m.otif}%` : ""}
                </div>
              </div>
              <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden" title={`A Tiempo: ${m.pctATiempo ?? "—"}%`}>
                <div className="h-full rounded flex items-center justify-end pr-1.5 text-[10px] font-semibold text-white transition-all" style={{ width: `${Math.max(4, m.pctATiempo ?? 0)}%`, background: "#2e7d32" }}>
                  {m.pctATiempo != null ? `${m.pctATiempo}%` : ""}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 ml-24 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ background: "#0d47a1" }} /> OTIF</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ background: "#2e7d32" }} /> % A Tiempo</span>
        </div>
      </div>

      {/* Tabla resumen */}
      <table>
        <thead>
          <tr>
            <th className="text-left">Mes</th>
            <th>Entregadas</th>
            <th>OTIF</th>
            <th>% A Tiempo</th>
            <th>Lead Time</th>
          </tr>
        </thead>
        <tbody>
          {tendencia.map((m) => (
            <tr key={m.label}>
              <td className="font-medium text-left">{m.label}</td>
              <td><span className="font-bold" style={{ color: "#f57c00" }}>{m.entregadas}</span></td>
              <td>{m.otif != null ? <span className={`font-semibold ${m.otif >= 80 ? "text-green-600" : m.otif >= 50 ? "text-amber-600" : "text-red-600"}`}>{m.otif}%</span> : <span className="text-gray-300">—</span>}</td>
              <td>{m.pctATiempo != null ? <span className={`font-semibold ${m.pctATiempo >= 80 ? "text-green-600" : m.pctATiempo >= 50 ? "text-amber-600" : "text-red-600"}`}>{m.pctATiempo}%</span> : <span className="text-gray-300">—</span>}</td>
              <td>{m.leadTime != null ? <span className="font-semibold text-gray-700">{m.leadTime}d</span> : <span className="text-gray-300">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
