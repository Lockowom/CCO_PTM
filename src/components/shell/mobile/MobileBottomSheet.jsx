import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const MobileBottomSheet = ({ open, onClose, title, children, footer }) => {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (event) => event.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector('button, input, select, textarea')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-end" role="presentation">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 h-full w-full bg-black/60"
        onClick={onClose}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[min(88dvh,760px)] w-full flex-col rounded-t-3xl border border-slate-700 bg-slate-950 pb-[env(safe-area-inset-bottom)] shadow-2xl"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-600" aria-hidden="true" />
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-800 px-4">
          <h2 className="font-semibold text-slate-100">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
        {footer ? <footer className="border-t border-slate-800 p-3">{footer}</footer> : null}
      </section>
    </div>,
    document.body
  );
};

export default MobileBottomSheet;
