import { useEffect } from "react";
import { fmtFechaCL } from '../dashHelpers';

const TITULOS = {
  ACTIVAS: "NVs Activas",
  ENTREGADAS: "Entregadas",
  TARDIAS: "Entregas Tardías",
  ATIEMPO: "Entregas A Tiempo",
  "CANAL:PTM": "N° NV PTM",
  "CANAL:ORANGE": "N.V Orange",
  "CANAL:FARMAPACK": "N.V Farmapack",
  "CANAL:VARIOS": "Varios",
  FILLRATE_CUMPLE: "Fill Rate — Cumplieron (salió de En Proceso a tiempo)",
  FILLRATE_NOCUMPLE: "Fill Rate — No Cumplieron (salió de En Proceso atrasado)",
  NVCUMPLE: "NVs de la Semana — Cumple (salió de En Proceso a tiempo)",
  NVNOCUMPLE: "NVs de la Semana — No Cumple (salió tarde o sigue en proceso)",
};

// Formato DD-MM-YYYY sin new Date() → sin corrimiento por zona horaria.
const fmtFecha = (f) => fmtFechaCL(f, "—");
// Fecha para CSV: DD-MM-YYYY o vacío (sin el "—" visual).
const csvFecha = (f) => fmtFechaCL(f, "");

// Exporta el detalle a CSV (compatible con Excel es-CL: separador ";" + BOM UTF-8).
function descargarExcel(estado, data) {
  const headers = [
    "N.V", "Cliente", "Vendedor", "Transportista", "Tipo Desp.", "División",
    "Fecha N.V", "Fecha Creación N.V", "Aprob. Real", "Dif. (días)",
    "Compromiso", "Promesa Efect.", "Atraso Ingreso (días)", "Despacho", "Tiempo (días)",
  ];
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const filas = data.map((r) => [
    r.nv, r.cliente, r.vendedor, r.transportista, r.tipo_despacho || "", r.division,
    csvFecha(r.fecha_registro_nv), csvFecha(r.fecha_aprobacion), csvFecha(r.fecha_aprobacion_real),
    r.dif_aprobacion === null ? "" : r.dif_aprobacion,
    csvFecha(r.fecha_compromiso), csvFecha(r.fecha_promesa_efectiva),
    r.dias_atraso_ingreso > 0 ? r.dias_atraso_ingreso : "",
    csvFecha(r.fecha_despacho),
    r.dias_entrega === null ? "" : r.dias_entrega,
  ].map(esc).join(";"));
  const csv = "﻿" + [headers.join(";"), ...filas].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const nombre = (TITULOS[estado] || estado).replace(/[^\wáéíóúñ]+/gi, "_").replace(/^_+|_+$/g, "");
  const hoy = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `NVs_${nombre}_${hoy}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const COL_INFO = "bg-white";
const COL_APROB = "bg-blue-50/60";
const COL_LOGISTICA = "bg-amber-50/60";

export default function EstadoDetalleModal({ estado, data, loading, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (estado) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [estado, onClose]);

  if (!estado) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              {TITULOS[estado] || (<>Notas de Venta — <span style={{ color: "#f57c00" }}>{estado}</span></>)}
            </h3>
            <p className="text-xs text-gray-400">
              {loading ? "Cargando..." : `${data.length} registro(s)`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-[10px] text-gray-400">
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200" /> Aprobación</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-200" /> Logística</span>
            </div>
            {!loading && data.length > 0 && (
              <button
                onClick={() => descargarExcel(estado, data)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                title="Descargar este listado en Excel"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Excel
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none px-2"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <p className="text-center text-gray-400 py-16">Sin registros en este estado.</p>
          ) : (
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                {/* Group headers */}
                <tr>
                  <th colSpan={6} className={`${COL_INFO} px-3 py-1 text-[10px] font-semibold text-gray-400 text-left border-b border-gray-100`}>INFORMACIÓN</th>
                  <th colSpan={4} className={`${COL_APROB} px-3 py-1 text-[10px] font-semibold text-blue-400 text-left border-b border-blue-100 border-l border-l-blue-200/50`}>APROBACIÓN</th>
                  <th colSpan={5} className={`${COL_LOGISTICA} px-3 py-1 text-[10px] font-semibold text-amber-500 text-left border-b border-amber-100 border-l border-l-amber-200/50`}>LOGÍSTICA</th>
                </tr>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className={`${COL_INFO} px-3 py-2`}>N.V</th>
                  <th className={`${COL_INFO} px-3 py-2`}>Cliente</th>
                  <th className={`${COL_INFO} px-3 py-2`}>Vendedor</th>
                  <th className={`${COL_INFO} px-3 py-2`}>Transportista</th>
                  <th className={`${COL_INFO} px-3 py-2`}>Tipo Desp.</th>
                  <th className={`${COL_INFO} px-3 py-2`}>División</th>
                  <th className={`${COL_APROB} px-3 py-2 border-l border-l-blue-200/50`}>Fecha N.V</th>
                  <th className={`${COL_APROB} px-3 py-2`}>Fecha Creación N.V</th>
                  <th className={`${COL_APROB} px-3 py-2`}>Aprob. Real</th>
                  <th className={`${COL_APROB} px-3 py-2 text-center`}>Dif.</th>
                  <th className={`${COL_LOGISTICA} px-3 py-2 border-l border-l-amber-200/50`}>Compromiso</th>
                  <th className={`${COL_LOGISTICA} px-3 py-2`}>Promesa Efect.</th>
                  <th className={`${COL_LOGISTICA} px-3 py-2 text-center`}>Atraso Ingreso</th>
                  <th className={`${COL_LOGISTICA} px-3 py-2`}>Despacho</th>
                  <th className={`${COL_LOGISTICA} px-3 py-2 text-center`}>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-orange-50/50">
                    {/* Info */}
                    <td className={`${COL_INFO} px-3 py-2 font-semibold`} style={{ color: "#f57c00" }}>
                      {r.nv}
                    </td>
                    <td className={`${COL_INFO} px-3 py-2`}>{r.cliente}</td>
                    <td className={`${COL_INFO} px-3 py-2`}>{r.vendedor}</td>
                    <td className={`${COL_INFO} px-3 py-2`}>{r.transportista}</td>
                    <td className={`${COL_INFO} px-3 py-2`}>{r.tipo_despacho || <span className="text-gray-300">—</span>}</td>
                    <td className={`${COL_INFO} px-3 py-2`}>{r.division}</td>
                    {/* Aprobación (azul sutil) */}
                    <td className={`${COL_APROB} px-3 py-2 whitespace-nowrap border-l border-l-blue-200/30`}>{fmtFecha(r.fecha_registro_nv)}</td>
                    <td className={`${COL_APROB} px-3 py-2 whitespace-nowrap`}>{fmtFecha(r.fecha_aprobacion)}</td>
                    <td className={`${COL_APROB} px-3 py-2 whitespace-nowrap`}>{fmtFecha(r.fecha_aprobacion_real)}</td>
                    <td className={`${COL_APROB} px-3 py-2 text-center`}>
                      {r.dif_aprobacion === null ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-xs font-bold"
                          style={{
                            background: r.dif_aprobacion === 0 ? "#e8f5e9" : "#fff3e0",
                            color: r.dif_aprobacion === 0 ? "#2e7d32" : "#e65100",
                          }}
                          title="Días de diferencia entre aprobación real y del sistema"
                        >
                          {r.dif_aprobacion > 0 ? `+${r.dif_aprobacion}` : r.dif_aprobacion}d
                        </span>
                      )}
                    </td>
                    {/* Logística (ámbar sutil) */}
                    <td className={`${COL_LOGISTICA} px-3 py-2 whitespace-nowrap border-l border-l-amber-200/30`}>{fmtFecha(r.fecha_compromiso)}</td>
                    <td className={`${COL_LOGISTICA} px-3 py-2 whitespace-nowrap`}>
                      {r.dias_atraso_ingreso > 0 ? (
                        <span className="font-medium text-red-600">{fmtFecha(r.fecha_promesa_efectiva)}</span>
                      ) : (
                        fmtFecha(r.fecha_promesa_efectiva)
                      )}
                    </td>
                    <td className={`${COL_LOGISTICA} px-3 py-2 text-center`}>
                      {r.dias_atraso_ingreso > 0 ? (
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-xs font-bold"
                          style={{ background: "#ffebee", color: "#c62828" }}
                          title="NV cayó tarde a logística — compromiso ya estaba vencido al aprobarse"
                        >
                          +{r.dias_atraso_ingreso}d
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className={`${COL_LOGISTICA} px-3 py-2 whitespace-nowrap`}>{fmtFecha(r.fecha_despacho)}</td>
                    <td className={`${COL_LOGISTICA} px-3 py-2 text-center`}>
                      {r.dias_entrega === null ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-xs font-bold"
                          style={{
                            background: r.dias_entrega <= 0 ? "#e8f5e9" : r.dias_entrega <= 2 ? "#fff3e0" : "#ffebee",
                            color: r.dias_entrega <= 0 ? "#2e7d32" : r.dias_entrega <= 2 ? "#e65100" : "#c62828",
                          }}
                          title="Días entre despacho y compromiso (positivo = tarde)"
                        >
                          {r.dias_entrega <= 0 ? "A tiempo" : `+${r.dias_entrega}d`}
                        </span>
                      )}
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
