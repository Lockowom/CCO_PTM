import { NavLink } from 'react-router-dom';
import { Circle } from 'lucide-react';
import { routeDisplayTitle } from './sidebar.utils';

const SidebarNavItem = ({ item, onNavigate, className = '' }) => (
  <NavLink
    to={item.path}
    end
    onClick={onNavigate}
    className={({ isActive }) =>
      `group/nav relative flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors duration-[var(--motion-fast)] ${
        isActive
          ? 'bg-[var(--sidebar-active-bg)] font-semibold text-[var(--sidebar-active-fg)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
      } ${className}`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[var(--sidebar-active-indicator)]"
          />
        )}
        <Circle
          aria-hidden="true"
          size={7}
          strokeWidth={isActive ? 4 : 2.5}
          className="shrink-0 text-current opacity-70"
        />
        <span className="truncate">{routeDisplayTitle(item)}</span>
      </>
    )}
  </NavLink>
);

export default SidebarNavItem;
