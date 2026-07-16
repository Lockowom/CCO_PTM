export default function DivisionsSection({ divisions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="text-left">División</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((d) => (
              <tr key={d.division}>
                <td className="font-medium text-left">{d.division}</td>
                <td>
                  <span className="font-bold" style={{ color: "#f57c00" }}>
                    {d.cantidad.toLocaleString("es-CL")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div />
    </div>
  );
}
