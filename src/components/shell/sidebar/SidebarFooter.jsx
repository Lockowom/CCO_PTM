import { ChevronLeft, ChevronRight } from 'lucide-react';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

const SidebarFooter = ({ collapsed, onToggle }) => (
  <footer className="border-t border-[var(--sidebar-border)] p-3">
    <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
      <div
        className={`flex min-w-0 items-center ${collapsed ? 'h-9 w-9 justify-center' : 'gap-2'}`}
        title="CCO operativo"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--status-ok)] opacity-30 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--status-ok)]" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold text-[var(--text-secondary)]">Operativo</p>
            <p className="truncate font-mono text-[9px] text-[var(--text-faint)]">v{APP_VERSION}</p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]"
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        title={collapsed ? 'Expandir navegación' : 'Colapsar navegación'}
      >
        {collapsed ? (
          <ChevronRight aria-hidden="true" size={18} />
        ) : (
          <ChevronLeft aria-hidden="true" size={18} />
        )}
      </button>
    </div>
  </footer>
);

export default SidebarFooter;
