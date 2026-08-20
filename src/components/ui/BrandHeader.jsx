import { ShieldCheck } from 'lucide-react';

/** Identidad visual única para encabezados de producto y módulos CCO. */
const BrandHeader = ({
  eyebrow = 'CCO SYSTEM',
  title,
  description = null,
  icon: Icon = ShieldCheck,
  actions = null,
  className = ''
}) => (
  <header
    className={`rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-sm)] sm:p-5 ${className}`}
  >
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-[var(--shadow-glow-accent)]">
          <Icon size={21} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-brand text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-600">
            {eyebrow}
          </p>
          <h1 className="font-brand truncate text-xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            {title}
          </h1>
          {description && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </header>
);

export default BrandHeader;
