// PR-013 · Topbar del AppShell (TXT 03 §4-5).
// Título de página + breadcrumb (routeMeta-driven) + búsqueda global + acciones
// (sync, notificaciones, usuario). El Layout existente sigue montando Navbar
// para compatibilidad; AppShell reemplaza esa capa en la migración de RELEASE B.

import { Link } from 'react-router-dom';
import { Search, RefreshCw, ChevronRight } from 'lucide-react';
import { getBreadcrumb } from '../../constants/routeMeta';

const Topbar = ({ pathname, onSearch = null, syncing = false, onSync = null }) => {
  const crumbs = getBreadcrumb(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-[var(--surface-elevated)] px-4">
      <div className="flex min-w-0 items-center gap-2">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight size={12} className="text-slate-600 shrink-0" />}
                {c.path && i === crumbs.length - 1 ? (
                  <Link to={c.path} className="truncate font-bold text-slate-100 hover:text-brand-400">
                    {c.label.split(' - ')[1] || c.label}
                  </Link>
                ) : (
                  <span className={`truncate ${i === crumbs.length - 1 ? 'font-bold text-slate-100' : 'text-slate-400'}`}>
                    {c.label.split(' - ')[1] || c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onSearch && (
          <button
            onClick={onSearch}
            aria-label="Buscar (Ctrl+K)"
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800"
          >
            <Search size={14} />
            <span className="hidden md:inline">Buscar…</span>
            <kbd className="hidden md:inline rounded border border-slate-600 px-1 text-[10px] text-slate-500">Ctrl K</kbd>
          </button>
        )}
        {onSync && (
          <button
            onClick={onSync}
            aria-label="Sincronizar"
            disabled={syncing}
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;