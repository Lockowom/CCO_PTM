import { useEffect } from "react";
import { fmtFechaCL } from '../dashHelpers';

const fmtFecha = (f) => fmtFechaCL(f, "—");

export default function IncidenciasModal({ open, data, loading, onClose }) {
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
        className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Incidencias Activas
            </h3>
            <p className="text-xs text-gray-400">
              {loading ? "Cargando..." : `${data.length} incidencia(s) no resuelta(s)`}
            </p>
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No hay incidencias activas.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-3 py-2">N.V</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Incidencia</th>
                  <th className="px-3 py-2">Estado Inc.</th>
                  <th className="px-3 py-2">Días</th>
                  <th className="px-3 py-2">Vendedor</th>
                  <th className="px-3 py-2">Transportista</th>
                  <th className="px-3 py-2">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-red-50">
                    <td className="px-3 py-2 font-semibold" style={{ color: "#c62828" }}>
                      {r.nv}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{fmtFecha(r.fecha)}</td>
                    <td className="px-3 py-2">{r.cliente}</td>
                    <td className="px-3 py-2 font-medium">{r.incidencia}</td>
                    <td className="px-3 py-2">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        {r.estado_incidencia}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-bold" style={{ color: r.dias > 5 ? "#c62828" : "#333" }}>
                      {r.dias}
                    </td>
                    <td className="px-3 py-2">{r.vendedor}</td>
                    <td className="px-3 py-2">{r.transportista}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-normal">
                      {r.observaciones}
                    </td>
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
