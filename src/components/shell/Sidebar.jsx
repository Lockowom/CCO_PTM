import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getNavGroups } from '../../constants/routeMeta';
import SidebarBrand from './sidebar/SidebarBrand';
import SidebarFooter from './sidebar/SidebarFooter';
import SidebarGroup from './sidebar/SidebarGroup';
import SidebarSection from './sidebar/SidebarSection';
import { isGroupActive } from './sidebar/sidebar.utils';

const SYSTEM_GROUP_IDS = new Set(['admin']);
const OPERATION_GROUP_ORDER = [
  'panel',
  'inventario',
  'inbound',
  'queries',
  'quality',
  'postventa',
  'tms'
];

function sortByOperationalOrder(groups) {
  return [...groups].sort((a, b) => {
    const aIndex = OPERATION_GROUP_ORDER.indexOf(a.id);
    const bIndex = OPERATION_GROUP_ORDER.indexOf(b.id);
    return (
      (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
    );
  });
}

const Sidebar = ({ collapsed, onToggle, canAccessRoute = null, session = null }) => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});
  const [flyout, setFlyout] = useState(null);
  const groups = useMemo(() => getNavGroups(canAccessRoute), [canAccessRoute]);
  const operationGroups = useMemo(
    () => sortByOperationalOrder(groups.filter((group) => !SYSTEM_GROUP_IDS.has(group.id))),
    [groups]
  );
  const systemGroups = useMemo(
    () => groups.filter((group) => SYSTEM_GROUP_IDS.has(group.id)),
    [groups]
  );

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
        <SidebarSection label="Operación" collapsed={collapsed}>
          {operationGroups.map((group) => (
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
        </SidebarSection>

        {systemGroups.length > 0 && (
          <SidebarSection label="Sistema" collapsed={collapsed} divider>
            {systemGroups.map((group) => (
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
          </SidebarSection>
        )}
      </nav>

      <SidebarFooter
        collapsed={collapsed}
        onToggle={onToggle}
        canAccessRoute={canAccessRoute}
        session={session}
      />
    </aside>
  );
};

export default Sidebar;
