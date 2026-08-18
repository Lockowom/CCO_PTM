// PR-012 · EmptyState (TXT 03 §3). Estado vacío consistente: icono + título +
// descripción + acción opcional.

const EmptyState = ({ icon: Icon = null, title = 'Sin resultados', description = null, action = null, className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 px-6 py-12 text-center ${className}`}>
    {Icon && (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/60 border border-slate-700">
        <Icon size={22} className="text-slate-400" />
      </div>
    )}
    <div>
      <p className="text-sm font-bold text-slate-200">{title}</p>
      {description && <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">{description}</p>}
    </div>
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export default EmptyState;