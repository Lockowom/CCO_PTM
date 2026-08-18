// PR-014 · MobileBottomNav (TXT 04 §4). Navegación inferior: 3-5 accesos
// priorizados por `mobilePriority` de routeMeta + item "Más" que abre el drawer.
// Targets táctiles 44px mínimo / 48px target. La visibilidad se decide por el
// llamador (permisos ya resueltos en Layout); aquí no se duplica lógica.

import { NavLink } from 'react-router-dom';
import { MoreHorizontal, LayoutDashboard, Scan, Package } from 'lucide-react';
import { ROUTE_META } from '../../../constants/routeMeta';

const FALLBACK_ICONS = { LayoutDashboard, Scan, Package };

const ICON_BY_PATH = {
  '/mobile/pda': Scan,
  '/inventory/traspasos': Package,
  '/panel': LayoutDashboard,
  '/inbound/entry': Package,
  '/inventory/conteo': Scan,
};

const MobileBottomNav = ({ onMore = null, maxItems = 4, priorityPaths = null }) => {
  const allowed = priorityPaths || ICON_BY_PATH;
  const items = ROUTE_META.filter((m) => allowed[m.path])
    .sort((a, b) => a.mobilePriority - b.mobilePriority)
    .slice(0, maxItems);

  return (
    <nav
      aria-label="Navegación inferior"
      className="shrink-0 border-t border-slate-800 bg-[var(--surface-elevated)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = ICON_BY_PATH[item.path] || FALLBACK_ICONS.Package;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5
                ${isActive ? 'text-brand-400' : 'text-slate-400'}`
              }
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold leading-none">
                {(item.title.split(' - ')[1] || item.title).split(' · ')[0].slice(0, 12)}
              </span>
            </NavLink>
          );
        })}
        {onMore && (
          <button
            onClick={onMore}
            aria-label="Más opciones"
            className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-slate-400"
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-semibold leading-none">Más</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;