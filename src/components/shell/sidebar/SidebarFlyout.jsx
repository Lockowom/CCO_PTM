import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SidebarNavItem from './SidebarNavItem';

const VIEWPORT_GAP = 12;

const SidebarFlyout = ({ group, anchorRect, triggerElement, onClose }) => {
  const flyoutRef = useRef(null);
  const [top, setTop] = useState(Math.max(VIEWPORT_GAP, anchorRect.top));

  useLayoutEffect(() => {
    const flyout = flyoutRef.current;
    if (!flyout) return;
    const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - flyout.offsetHeight - VIEWPORT_GAP);
    setTop(Math.min(Math.max(VIEWPORT_GAP, anchorRect.top), maxTop));
  }, [anchorRect.top, group.id]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (flyoutRef.current?.contains(event.target) || triggerElement?.contains(event.target))
        return;
      onClose();
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
      triggerElement?.focus();
    };
    const closeForViewportChange = () => onClose();

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', closeForViewportChange);
    window.addEventListener('scroll', closeForViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', closeForViewportChange);
      window.removeEventListener('scroll', closeForViewportChange, true);
    };
  }, [onClose, triggerElement]);

  return createPortal(
    <div
      ref={flyoutRef}
      id={`sidebar-flyout-${group.id}`}
      role="group"
      aria-label={`Rutas de ${group.label}`}
      className="fixed z-[var(--z-drawer)] max-h-[70vh] w-[var(--sidebar-flyout-width)] overflow-y-auto rounded-2xl border border-[var(--sidebar-flyout-border)] bg-[var(--sidebar-flyout-bg)] p-2 shadow-[var(--sidebar-shadow)] motion-safe:animate-[sidebar-flyout-in_var(--motion-normal)_var(--ease-out)]"
      style={{ left: `${anchorRect.right + 8}px`, top: `${top}px` }}
    >
      <div className="px-3 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {group.label}
      </div>
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <SidebarNavItem key={item.path} item={item} onNavigate={onClose} />
        ))}
      </div>
    </div>,
    document.body
  );
};

export default SidebarFlyout;
