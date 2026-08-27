import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getNavGroups } from '../../constants/routeMeta';
import SidebarBrand from './sidebar/SidebarBrand';
import SidebarFooter from './sidebar/SidebarFooter';
import SidebarGroup from './sidebar/SidebarGroup';
import { isGroupActive } from './sidebar/sidebar.utils';

const Sidebar = ({ collapsed, onToggle, canAccessRoute = null }) => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});
  const [flyout, setFlyout] = useState(null);
  const groups = useMemo(() => getNavGroups(canAccessRoute), [canAccessRoute]);

  const closeFlyout = useCallback(() => setFlyout(null), []);

  const toggleGroup = useCallback((id) => {
    setOpenGroups((current) => ({ ...current, [id]: !(current[id] ?? true) }));
  }, []);

  const openFlyout = useCallback((groupId, triggerElement) => {
    if (!triggerElement) return;
    setFlyout({ groupId, anchorRect: triggerElement.getBoundingClientRect() });
  }, []);

  useEffect(() => {
    closeFlyout();
  }, [location.pathname, location.search, closeFlyout]);

  useEffect(() => {
    if (!collapsed) closeFlyout();
  }, [collapsed, closeFlyout]);

  return (
    <aside
      className={`cco-sidebar hidden shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-[width] duration-[var(--motion-slow)] ease-[var(--ease-in-out)] lg:flex ${
        collapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width-expanded)]'
      }`}
      aria-label="Navegación principal"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div
        className={`flex h-[var(--sidebar-header-height)] shrink-0 items-center border-b border-[var(--sidebar-border)] ${
          collapsed ? 'justify-center px-2' : 'px-3'
        }`}
      >
        <SidebarBrand collapsed={collapsed} />
      </div>

      <nav
        className={`custom-scrollbar flex-1 overflow-y-auto py-3 ${collapsed ? 'px-2' : 'px-2.5'}`}
        aria-label="Módulos CCO"
      >
        {groups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
            open={openGroups[group.id] ?? true}
            active={isGroupActive(group, location.pathname)}
            flyoutOpen={flyout?.groupId === group.id}
            flyoutAnchorRect={flyout?.groupId === group.id ? flyout.anchorRect : null}
            onToggle={toggleGroup}
            onOpenFlyout={openFlyout}
            onCloseFlyout={closeFlyout}
          />
        ))}
      </nav>

      <SidebarFooter collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
};

export default Sidebar;
