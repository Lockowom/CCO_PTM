// PR-014 · MobileDrawer (TXT 04 §5). Drawer accesible para móvil: menú de
// navegación por grupos (routeMeta) + acciones. Reutiliza OverlayRoot para
// portal/focus/Escape.

import { NavLink } from 'react-router-dom';
import { Drawer } from '../../ui/Overlay';
import { getNavGroups } from '../../../constants/routeMeta';

const MobileDrawer = ({ open, onClose, footer = null }) => {
  const groups = getNavGroups();

  return (
    <Drawer open={open} onClose={onClose} title="Menú" side="right" width="w-[85%] max-w-sm" footer={footer}>
      <nav aria-label="Menú móvil" className="space-y-4">
        {groups.map((g) => (
          <div key={g.id}>
            <p className="mb-1 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {g.label}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex min-h-[44px] items-center rounded-xl px-3 text-sm
                      ${isActive ? 'bg-brand-500/10 font-semibold text-brand-400' : 'text-slate-200 hover:bg-slate-800'}`
                    }
                  >
                    {item.title.split(' - ')[1] || item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </Drawer>
  );
};

export default MobileDrawer;