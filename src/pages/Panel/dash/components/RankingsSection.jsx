export default function RankingsSection({ rankTransp, rankVend }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ranking Transportistas (con rendimiento) */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="text-left">Transportista</th>
              <th>NVs</th>
              <th>% A tiempo</th>
              <th>Tardanza</th>
            </tr>
          </thead>
          <tbody>
            {rankTransp.map((t) => (
              <tr key={t.nombre}>
                <td className="font-medium text-left">{t.nombre}</td>
                <td>
                  <span className="font-bold" style={{ color: "#f57c00" }}>{t.total}</span>
                </td>
                <td>
                  {t.pctATiempo !== null ? (
                    <span className={`font-semibold ${Number(t.pctATiempo) >= 80 ? "text-green-600" : Number(t.pctATiempo) >= 50 ? "text-amber-600" : "text-red-600"}`}>
                      {t.pctATiempo}%
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td>
                  {t.tardanzaProm !== null ? (
                    <span className="text-red-500 text-[12px]">{t.tardanzaProm}d</span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ranking Vendedores */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="text-left">Vendedor</th>
              <th>NVs</th>
              <th>Activas</th>
              <th>% A tiempo</th>
            </tr>
          </thead>
          <tbody>
            {rankVend.map((v) => (
              <tr key={v.nombre}>
                <td className="font-medium text-left">{v.nombre}</td>
                <td>
                  <span className="font-bold" style={{ color: "#f57c00" }}>{v.total}</span>
                </td>
                <td>
                  {v.activas > 0 ? (
                    <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">{v.activas}</span>
                  ) : <span className="text-gray-300">0</span>}
                </td>
                <td>
                  {v.pctATiempo !== null ? (
                    <span className={`font-semibold ${Number(v.pctATiempo) >= 80 ? "text-green-600" : Number(v.pctATiempo) >= 50 ? "text-amber-600" : "text-red-600"}`}>
                      {v.pctATiempo}%
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
