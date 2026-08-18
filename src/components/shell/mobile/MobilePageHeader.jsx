// PR-014 · MobilePageHeader (TXT 04 §3). Encabezado de página móvil compacto.

const MobilePageHeader = ({ title, description = null, icon: Icon = null, actions = null, className = '' }) => (
  <div className={`mb-3 flex items-start justify-between gap-3 px-4 pt-3 ${className}`}>
    <div className="flex min-w-0 items-start gap-2.5">
      {Icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
          <Icon size={18} className="text-brand-500" />
        </div>
      )}
      <div className="min-w-0">
        <h1 className="truncate text-base font-bold text-slate-100 leading-tight">{title}</h1>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
  </div>
);

export default MobilePageHeader;