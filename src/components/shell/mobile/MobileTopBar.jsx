// PR-014 · MobileTopBar (TXT 04 §3). Barra superior móvil: título corto +
// acciones (búsqueda, menú). Targets táctiles ≥44px.

import { Menu, Search } from 'lucide-react';

const MobileTopBar = ({ title, subtitle = null, onMenu = null, onSearch = null, right = null, className = '' }) => (
  <header
    className={`flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-[var(--surface-elevated)] px-3 ${className}`}
  >
    <div className="flex min-w-0 items-center gap-2">
      {onMenu && (
        <button
          onClick={onMenu}
          aria-label="Abrir menú"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800"
        >
          <Menu size={22} />
        </button>
      )}
      <div className="min-w-0">
        <h1 className="truncate text-sm font-bold text-slate-100 leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-[11px] text-slate-400 leading-tight">{subtitle}</p>}
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-1">
      {onSearch && (
        <button
          onClick={onSearch}
          aria-label="Buscar"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800"
        >
          <Search size={22} />
        </button>
      )}
      {right}
    </div>
  </header>
);

export default MobileTopBar;