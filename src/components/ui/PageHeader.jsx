// PR-012 · PageHeader (TXT 03 §3). Encabezado estándar de pantalla: título,
// descripción, acciones a la derecha y breadcrumb opcional.

const PageHeader = ({ title, description = null, actions = null, breadcrumb = null, icon: Icon = null, className = '' }) => (
  <header className={`mb-5 ${className}`}>
    {breadcrumb && <div className="mb-2 text-xs text-slate-500">{breadcrumb}</div>}
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
            <Icon size={20} className="text-brand-500" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-100 leading-tight truncate">{title}</h1>
          {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  </header>
);

export default PageHeader;