export default function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div
      className={`fixed top-4 left-1/2 z-[80] w-[min(92vw,56rem)] -translate-x-1/2 rounded-2xl border-2 px-6 py-5 shadow-2xl anim-pop ${
        isSuccess
          ? "border-emerald-200 bg-emerald-600 text-white"
          : "border-red-200 bg-red-600 text-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none">{isSuccess ? "✓" : "⚠"}</div>
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] opacity-90">
            {isSuccess ? "Operacion confirmada" : "Alerta del panel"}
          </div>
          <div className="mt-1 text-base sm:text-lg font-black uppercase leading-snug break-words">
            {toast.message}
          </div>
        </div>
      </div>
    </div>
  );
}
