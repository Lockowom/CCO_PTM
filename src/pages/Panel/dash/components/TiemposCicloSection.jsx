export default function TiemposCicloSection({ tiemposCiclo }) {
  if (!tiemposCiclo) return null;
  return (
    <div className="table-container">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-bold text-gray-800">Tiempos de ciclo</h3>
        <span className="text-[11px] text-gray-400">
          Días promedio · calculado desde fechas por estado. La cobertura del desglose
          fino crece a medida que las NVs pasan por el flujo nuevo.
        </span>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="rounded-xl border border-gray-200 p-3.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Lead time total</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: "#f57c00" }}>
            {tiemposCiclo.leadTimeTotal !== null ? `${tiemposCiclo.leadTimeTotal} d` : "—"}
          </p>
          <p className="text-[10px] text-gray-400">Aprobación → entrega · n={tiemposCiclo.leadTimeTotalN}</p>
        </div>
        {tiemposCiclo.etapas.map((e) => (
          <div key={e.nombre} className="rounded-xl border border-gray-200 p-3.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">{e.nombre}</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">
              {e.dias !== null ? `${e.dias} d` : "—"}
            </p>
            <p className="text-[10px] text-gray-400">n={e.n}</p>
          </div>
        ))}
      </div>

      {/* Cuello de botella */}
      {tiemposCiclo.cuelloBotella && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-[12px] text-red-700">
          <span>🚨 Cuello de botella:</span>
          <strong>{tiemposCiclo.cuelloBotella.nombre}</strong>
          <span>({tiemposCiclo.cuelloBotella.dias} d)</span>
        </div>
      )}

      {/* Gráfico de barras: días por etapa */}
      <div className="space-y-2.5">
        {(() => {
          const maxDias = Math.max(1, ...tiemposCiclo.etapas.map((e) => e.dias ?? 0));
          return tiemposCiclo.etapas.map((e) => (
            <div key={e.nombre} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-[12px] text-gray-600 text-right">{e.nombre}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md flex items-center justify-end pr-2 text-[11px] font-semibold text-white transition-all"
                  style={{
                    width: e.dias !== null ? `${Math.max(6, (e.dias / maxDias) * 100)}%` : "0%",
                    background: tiemposCiclo.cuelloBotella?.nombre === e.nombre ? "#dc2626" : "#f57c00",
                  }}
                >
                  {e.dias !== null ? `${e.dias} d` : ""}
                </div>
              </div>
              {e.dias === null && <span className="text-[11px] text-gray-300">sin datos</span>}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
