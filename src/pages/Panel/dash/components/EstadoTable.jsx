import { memo } from "react";

function getBadgeClass(estado) {
  const s = estado.toUpperCase();
  if (s === "ENTREGADO") return "badge badge-entregado";
  if (s.includes("PROCESO") || s === "EN SHIPPING") return "badge badge-proceso";
  if (s.includes("RUTA")) return "badge badge-ruta";
  if (s.includes("VENDEDOR")) return "badge badge-vendedor";
  if (s.includes("RETIRO")) return "badge badge-retiro";
  if (s.includes("STOCK")) return "badge badge-stock";
  if (s === "NULA" || s === "NULL") return "badge badge-nula";
  return "badge badge-default";
}

function EstadoTable({ data, onSelectEstado }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th className="w-10">#</th>
            <th className="text-left">Estado</th>
            <th>N° NV PTM</th>
            <th>N.V Orange</th>
            <th>N.V Farmapack</th>
            <th>Varios</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.estado}
              onClick={() => onSelectEstado?.(row.estado)}
              className={onSelectEstado ? "cursor-pointer hover:bg-orange-50" : ""}
            >
              <td className="text-gray-400 text-xs">{i + 1}.</td>
              <td className="text-left">
                <span className={getBadgeClass(row.estado)}>{row.estado}</span>
              </td>
              <td className="font-bold" style={{ color: "#f57c00" }}>
                {row.ptm.toLocaleString("es-CL")}
              </td>
              <td className="font-medium">{row.orange || <span className="text-gray-300">0</span>}</td>
              <td className="font-medium">{row.farmapack || <span className="text-gray-300">0</span>}</td>
              <td className="font-medium">{row.varios || <span className="text-gray-300">0</span>}</td>
              <td className="font-bold">{row.total.toLocaleString("es-CL")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(EstadoTable);
