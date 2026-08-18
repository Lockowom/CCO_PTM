// PR-012 · Card compartida (TXT 03 §3). Contenedor base de superficie elevada.

const Card = ({ title, description, icon: Icon = null, actions = null, className = '', children }) => (
  <section
    className={`rounded-2xl border border-slate-800 bg-[var(--surface-card)] shadow-sm
      ${className}`}
  >
    {(title || actions) && (
      <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={18} className="text-brand-500 shrink-0" />}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate">{title}</h3>
            {description && (
              <p className="text-xs text-slate-400 truncate">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>
    )}
    {children}
  </section>
);

export default Card;