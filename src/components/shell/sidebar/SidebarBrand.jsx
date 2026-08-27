const SidebarBrand = ({ collapsed }) => {
  if (collapsed) {
    return (
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--sidebar-border)] bg-[var(--surface-card)] font-brand text-[11px] font-black tracking-tight text-[var(--text-primary)] shadow-sm"
        title="CCO · Centro Control Operacional"
        aria-label="CCO · Centro Control Operacional"
      >
        CCO
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <img src="/logo-ptm.png" alt="PTM Health Care" className="h-9 w-auto shrink-0" />
      <div className="min-w-0 border-l border-[var(--sidebar-border)] pl-2.5">
        <div className="flex items-center gap-1.5">
          <span className="font-brand text-sm font-black tracking-tight text-[var(--text-primary)]">
            CCO
          </span>
          <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[8px] font-extrabold tracking-wide text-white">
            SYSTEM
          </span>
        </div>
        <p className="truncate text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
          Centro Control Operacional
        </p>
      </div>
    </div>
  );
};

export default SidebarBrand;
