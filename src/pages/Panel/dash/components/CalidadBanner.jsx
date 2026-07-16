export default function CalidadBanner({ calidadData, onOpen }) {
  return calidadData.total > 0 ? (
    <button
      onClick={onOpen}
      className="w-full text-left bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between hover:bg-amber-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">🔍</span>
        <div>
          <div className="text-sm font-semibold text-amber-800">
            {calidadData.total} registro{calidadData.total !== 1 ? "s" : ""} con datos incompletos o incoherentes
          </div>
          <div className="text-xs text-amber-600">
            Clic para ver el detalle y corregir en el Sheet
          </div>
        </div>
      </div>
      <span className="text-amber-400 text-lg">→</span>
    </button>
  ) : (
    <div className="w-full bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3">
      <span className="text-xl">✓</span>
      <div className="text-sm font-medium text-green-700">
        Datos consistentes — sin problemas detectados
      </div>
    </div>
  );
}
