import { useEffect } from "react";

export default function CalidadDatosModal({ open, data, onClose }) {
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

  const tipos = Object.entries(data.porTipo).sort((a, b) => b[1] - a[1]);

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
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                🔍 Calidad de Datos
              </h3>
              <p className="text-xs text-gray-400">
                {data.total} registro(s) con datos incompletos o incoherentes
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

          {/* Resumen por tipo */}
          {tipos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tipos.map(([tipo, n]) => (
                <span
                  key={tipo}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                >
                  {tipo}
                  <span className="font-bold">{n}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="overflow-auto p-2">
          {data.detalle.length === 0 ? (
            <p className="text-center text-gray-400 py-16">
              ✓ Sin problemas de calidad detectados.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-3 py-2">N.V</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Vendedor</th>
                  <th className="px-3 py-2">División</th>
                  <th className="px-3 py-2">Problemas detectados</th>
                </tr>
              </thead>
              <tbody>
                {data.detalle.map((r, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-amber-50/50">
                    <td className="px-3 py-2 font-semibold" style={{ color: "#f57c00" }}>
                      {r.nv}
                    </td>
                    <td className="px-3 py-2">{r.cliente}</td>
                    <td className="px-3 py-2">{r.estado}</td>
                    <td className="px-3 py-2">{r.vendedor}</td>
                    <td className="px-3 py-2">{r.division}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {r.problemas.map((p, j) => (
                          <span
                            key={j}
                            className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
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
