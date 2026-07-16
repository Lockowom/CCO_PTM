export default function OperadoresSection({ auditKpis }) {
  if (auditKpis.length === 0) return null;
  return (
    <div className="table-container">
      <h3 className="font-bold text-gray-800 mb-3">Actividad por Operador</h3>
      <p className="text-[11px] text-gray-400 mb-3">Registro de operaciones desde la hoja AUDIT.</p>
      <table>
        <thead>
          <tr>
            <th className="text-left">Operador</th>
            <th>Creadas</th>
            <th>Actualizadas</th>
            <th>Lote</th>
            <th>Conflictos</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {auditKpis.filter(op => op.nombre.toUpperCase() !== "ADMIN").map((op) => (
            <tr key={op.nombre}>
              <td className="font-medium text-left">
                <span className="inline-flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "#f57c00" }}>
                    {op.nombre.charAt(0).toUpperCase()}
                  </span>
                  {op.nombre}
                </span>
              </td>
              <td><span className="text-green-600 font-semibold">{op.creates}</span></td>
              <td><span className="text-blue-600 font-semibold">{op.updates}</span></td>
              <td><span className="text-purple-600 font-semibold">{op.bulkUpdates}</span></td>
              <td>
                {op.conflicts > 0 ? (
                  <span className="text-red-600 font-semibold">{op.conflicts}</span>
                ) : <span className="text-gray-300">0</span>}
              </td>
              <td><span className="font-bold" style={{ color: "#f57c00" }}>{op.total}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
