export default function NotasVentaSummary({ kpis, onSelect }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4" style={{ borderLeftColor: "#f57c00" }}>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Notas de Venta
      </h2>
      <div className="grid grid-cols-4 gap-6">
        <div className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => onSelect("CANAL:PTM")}>
          <div className="text-xs text-gray-400">N° NV PTM</div>
          <div className="text-2xl font-bold" style={{ color: "#f57c00" }}>
            {kpis?.countNvPtm.toLocaleString("es-CL")}
          </div>
        </div>
        <div className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => onSelect("CANAL:ORANGE")}>
          <div className="text-xs text-gray-400">N.V Orange</div>
          <div className="text-2xl font-bold text-gray-800">
            {kpis?.nvOrange.toLocaleString("es-CL")}
          </div>
        </div>
        <div className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => onSelect("CANAL:FARMAPACK")}>
          <div className="text-xs text-gray-400">N.V Farmapack</div>
          <div className="text-2xl font-bold text-gray-800">
            {kpis?.nvFarmapack.toLocaleString("es-CL")}
          </div>
        </div>
        <div className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => onSelect("CANAL:VARIOS")}>
          <div className="text-xs text-gray-400">Varios</div>
          <div className="text-2xl font-bold text-gray-800">
            {kpis?.nvVarios.toLocaleString("es-CL")}
          </div>
        </div>
      </div>
    </div>
  );
}
