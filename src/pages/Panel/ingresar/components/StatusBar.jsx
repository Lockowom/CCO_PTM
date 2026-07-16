export default function StatusBar({ connectionOk, operador, refreshOptions, sessionLog }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#18181b] text-white px-4 py-1.5">
      <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${connectionOk === null ? "bg-amber-400 animate-pulse" : connectionOk ? "bg-emerald-400" : "bg-red-400"}`} />
          <span className="text-gray-300">{connectionOk === null ? "Verificando…" : connectionOk ? "Conectado a Sheet" : "Sin conexión"}</span>
        </span>
        <span className="text-gray-600">·</span>
        <span className="text-gray-300">{operador}</span>
        <button onClick={refreshOptions} className="text-gray-500 hover:text-gray-200 text-[10px] underline underline-offset-2" title="Recargar listas de estados y transportistas">↻ Opciones</button>
        {sessionLog.length > 0 && (
          <>
            <span className="text-gray-600">·</span>
            <span className="text-gray-300"><span className="text-white font-semibold">{sessionLog.length}</span> NV{sessionLog.length !== 1 ? "s" : ""} esta sesión</span>
            <span className="text-gray-600 hidden sm:inline">·</span>
            <span className="text-gray-400 hidden sm:inline">Última: NV {sessionLog[sessionLog.length - 1].nv} ({sessionLog[sessionLog.length - 1].canal}) · {sessionLog[sessionLog.length - 1].mode} {sessionLog[sessionLog.length - 1].time}</span>
          </>
        )}
      </div>
    </div>
  );
}
