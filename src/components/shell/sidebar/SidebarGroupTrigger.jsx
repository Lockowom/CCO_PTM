import { forwardRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { getSidebarIcon } from './sidebarIcons';

const baseClass =
  'relative flex items-center rounded-xl transition-colors duration-[var(--motion-fast)] focus-visible:outline-none';

const TriggerContent = ({ group, collapsed, active, expanded }) => {
  const Icon = getSidebarIcon(group.icon);
  return (
    <>
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-[var(--sidebar-active-indicator)]"
        />
      )}
      <Icon
        aria-hidden="true"
        size={20}
        strokeWidth={active ? 2.4 : 2}
        className="shrink-0 text-current"
      />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left text-[11px] font-bold uppercase tracking-[0.08em]">
            {group.label}
          </span>
          {expanded ? (
            <ChevronDown aria-hidden="true" size={15} />
          ) : (
            <ChevronRight aria-hidden="true" size={15} />
          )}
        </>
      )}
    </>
  );
};

const SidebarGroupTrigger = forwardRef(
  ({ group, collapsed, active, expanded, flyoutId, onToggle, onNavigate }, ref) => {
    const visualClass = `${baseClass} ${
      collapsed
        ? 'mx-auto h-11 w-11 justify-center'
        : 'min-h-[var(--sidebar-item-height)] w-full gap-3 px-3'
    } ${
      active
        ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-fg)]'
        : 'text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
    }`;

    if (collapsed && group.items.length === 1) {
      return (
        <NavLink
          ref={ref}
          to={group.items[0].path}
          onClick={onNavigate}
          className={visualClass}
          aria-label={group.label}
          title={group.label}
        >
          <TriggerContent group={group} collapsed active={active} expanded={false} />
        </NavLink>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onToggle();
        }}
        className={visualClass}
        aria-label={
          collapsed
            ? `Abrir ${group.label}`
            : `${expanded ? 'Contraer' : 'Expandir'} ${group.label}`
        }
        aria-expanded={expanded}
        aria-controls={flyoutId}
        aria-haspopup={collapsed ? 'true' : undefined}
        title={collapsed ? group.label : undefined}
      >
        <TriggerContent group={group} collapsed={collapsed} active={active} expanded={expanded} />
      </button>
    );
  }
);

SidebarGroupTrigger.displayName = 'SidebarGroupTrigger';

export default SidebarGroupTrigger;
