import { useRef } from 'react';
import SidebarFlyout from './SidebarFlyout';
import SidebarGroupTrigger from './SidebarGroupTrigger';
import SidebarNavItem from './SidebarNavItem';

const SidebarGroup = ({
  group,
  collapsed,
  open,
  active,
  flyoutOpen,
  flyoutAnchorRect,
  onToggle,
  onOpenFlyout,
  onCloseFlyout
}) => {
  const triggerRef = useRef(null);
  const flyoutId = collapsed ? `sidebar-flyout-${group.id}` : `sidebar-group-${group.id}`;

  const handleTrigger = () => {
    if (!collapsed) {
      onToggle(group.id);
      return;
    }
    if (flyoutOpen) {
      onCloseFlyout();
      return;
    }
    onOpenFlyout(group.id, triggerRef.current);
  };

  return (
    <div className={collapsed ? 'mb-1.5' : 'mb-1'} data-sidebar-group={group.id}>
      <SidebarGroupTrigger
        ref={triggerRef}
        group={group}
        collapsed={collapsed}
        active={active}
        expanded={collapsed ? flyoutOpen : open}
        flyoutId={flyoutId}
        onToggle={handleTrigger}
        onNavigate={onCloseFlyout}
      />

      {!collapsed && open && (
        <ul id={flyoutId} className="mt-1 space-y-0.5 pl-3" aria-label={`Rutas de ${group.label}`}>
          {group.items.map((item) => (
            <li key={item.path}>
              <SidebarNavItem item={item} />
            </li>
          ))}
        </ul>
      )}

      {collapsed && flyoutOpen && flyoutAnchorRect && (
        <SidebarFlyout
          group={group}
          anchorRect={flyoutAnchorRect}
          triggerElement={triggerRef.current}
          onClose={onCloseFlyout}
        />
      )}
    </div>
  );
};

export default SidebarGroup;
