export default function IncidenciasPorVendedorSection({ data = [], onOpenIncidencias }) {
  const totalIncidencias = data.reduce((acc, item) => acc + (item.total || 0), 0);
  const totalFuera48h = data.reduce((acc, item) => acc + (item.fuera48h || 0), 0);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Ranking automático</div>
          <h3 className="mt-1 text-lg font-black text-gray-900">Ranking de errores por vendedor</h3>
          <p className="mt-1 text-sm text-gray-500">
            Consolida automáticamente las incidencias activas por vendedor para medir errores no contabilizados y su impacto sobre el cumplimiento de 48 horas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-500">Activas</div>
            <div className="mt-1 text-lg font-black text-orange-700">{totalIncidencias}</div>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-500">Fuera 48h</div>
            <div className="mt-1 text-lg font-black text-red-700">{totalFuera48h}</div>
          </div>
          <button
            type="button"
            onClick={onOpenIncidencias}
            className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Ver incidencias activas
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="px-5 py-14 text-center text-sm text-gray-400">
          No hay incidencias activas para agrupar por vendedor en el rango seleccionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-[0.14em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Vendedor</th>
                <th className="px-4 py-3 text-center">Incidencias</th>
                <th className="px-4 py-3 text-center">Dirección</th>
                <th className="px-4 py-3 text-center">Transporte</th>
                <th className="px-4 py-3 text-center">Fuera 48h</th>
                <th className="px-4 py-3 text-center">Clientes</th>
                <th className="px-4 py-3 text-center">Transportistas</th>
                <th className="px-4 py-3 text-left">Principal</th>
                <th className="px-4 py-3 text-center">Máx. días</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.vendedor} className="border-t border-gray-100 hover:bg-orange-50/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{row.vendedor}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-black text-orange-600">{row.total}</td>
                  <td className="px-4 py-3 text-center">{row.direccion}</td>
                  <td className="px-4 py-3 text-center">{row.transporte}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex min-w-[44px] items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${
                      row.fuera48h > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {row.fuera48h}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{row.clientes}</td>
                  <td className="px-4 py-3 text-center">{row.transportistas}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{row.topTipo}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-700">{row.maxDias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
