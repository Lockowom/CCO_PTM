import { useEffect } from "react";
import { fmtFechaCL } from '../dashHelpers';

const fmtFecha = (f) => fmtFechaCL(f, "—");

function rowColor(diasVencido) {
  if (diasVencido > 0) return "bg-red-50";
  if (diasVencido === 0) return "bg-orange-50";
  return "bg-yellow-50";
}

function badgeStyle(diasVencido) {
  if (diasVencido > 0) return { background: "#ffebee", color: "#c62828" };
  if (diasVencido === 0) return { background: "#fff3e0", color: "#e65100" };
  return { background: "#fffde7", color: "#f9a825" };
}

export default function AlertasRiesgoModal({ open, data, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Despachos en Riesgo
            </h3>
            <div className="flex gap-3 mt-1">
              {data.vencidos > 0 && (
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: "#ffebee", color: "#c62828" }}
                >
                  {data.vencidos} vencido{data.vencidos !== 1 ? "s" : ""}
                </span>
              )}
              {data.hoy > 0 && (
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: "#fff3e0", color: "#e65100" }}
                >
                  {data.hoy} vence hoy
                </span>
              )}
              {data.manana > 0 && (
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: "#fffde7", color: "#f9a825" }}
                >
                  {data.manana} vence mañana
                </span>
              )}
              {data.total === 0 && (
                <span className="text-xs text-green-600 font-medium">
                  Sin despachos en riesgo
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none px-2"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-auto p-2">
          {data.detalle.length === 0 ? (
            <p className="text-center text-gray-400 py-16">
              Todos los despachos activos están dentro de plazo.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-3 py-2">N.V</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2 text-center">Días</th>
                  <th className="px-3 py-2">Vendedor</th>
                  <th className="px-3 py-2">Transportista</th>
                  <th className="px-3 py-2">División</th>
                  <th className="px-3 py-2">Compromiso</th>
                </tr>
              </thead>
              <tbody>
                {data.detalle.map((r, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${rowColor(r.diasVencido)}`}>
                    <td className="px-3 py-2 font-semibold" style={{ color: "#f57c00" }}>
                      {r.nv}
                    </td>
                    <td className="px-3 py-2">{r.cliente}</td>
                    <td className="px-3 py-2">{r.estado}</td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-xs font-bold"
                        style={badgeStyle(r.diasVencido)}
                      >
                        {r.diasVencido > 0
                          ? `+${r.diasVencido}d`
                          : r.diasVencido === 0
                          ? "HOY"
                          : "1d"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{r.vendedor}</td>
                    <td className="px-3 py-2">{r.transportista}</td>
                    <td className="px-3 py-2">{r.division}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{fmtFecha(r.fecha_compromiso)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
