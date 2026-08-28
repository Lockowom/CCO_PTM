const SidebarSection = ({ label, collapsed, divider = false, children }) => (
  <section
    aria-label={label}
    className={divider ? 'mt-3 border-t border-[var(--sidebar-border)] pt-3' : ''}
    data-sidebar-section={label.toLowerCase()}
  >
    {!collapsed && (
      <h2 className="mb-1.5 px-3 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-faint)]">
        {label}
      </h2>
    )}
    {children}
  </section>
);

export default SidebarSection;
