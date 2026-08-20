const FilterBar = ({ children, actions, label = 'Filtros' }) => (
  <section
    aria-label={label}
    className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-3"
  >
    <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">{children}</div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </section>
);

export default FilterBar;
