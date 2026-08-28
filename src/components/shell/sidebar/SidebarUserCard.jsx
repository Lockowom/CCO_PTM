function initialsFor(name) {
  const parts = String(name || 'Usuario')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (
    parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2) || 'US'
  ).toUpperCase();
}

const SidebarUserCard = ({ user, collapsed }) => {
  const name = user?.nombre || user?.email || 'Usuario';
  const role = user?.rol || 'Sin rol';
  const accessibleLabel = `${name}, rol ${role}`;

  return (
    <div
      className={`flex min-h-10 min-w-0 items-center rounded-xl text-[var(--text-secondary)] ${
        collapsed ? 'w-11 justify-center' : 'gap-2.5 px-2'
      }`}
      aria-label={accessibleLabel}
      title={collapsed ? accessibleLabel : undefined}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--text-primary)] text-[11px] font-black text-[var(--surface-elevated)] shadow-sm">
        {initialsFor(name)}
      </span>
      {!collapsed && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[11px] font-extrabold text-[var(--text-primary)]">
            {name}
          </span>
          <span className="mt-0.5 block truncate text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">
            {role}
          </span>
        </span>
      )}
    </div>
  );
};

export default SidebarUserCard;
