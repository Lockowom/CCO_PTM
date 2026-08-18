// PR-012 · primitivos de overlay: Drawer, Modal, ConfirmDialog.
// Usan un portal simple + focus y Escape. Sin dependencias externas.
// La semántica operativa (no usar native confirm/prompt) la garantiza el app.

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

// ── helpers de foco ──────────────────────────────────────────────────────────
function useTrapFocus(open) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open || !ref.current) return;
    const node = ref.current;
    const prev = document.activeElement;
    const focusables = () =>
      [...node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
        (el) => !el.hasAttribute('disabled')
      );
    const first = focusables()[0];
    if (first) first.focus();
    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) return;
      const start = list[0];
      const end = list[list.length - 1];
      if (e.shiftKey && document.activeElement === start) {
        e.preventDefault();
        end.focus();
      } else if (!e.shiftKey && document.activeElement === end) {
        e.preventDefault();
        start.focus();
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open]);
  return ref;
}

function OverlayRoot({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(children, document.body);
}

// ── Drawer ───────────────────────────────────────────────────────────────────
export function Drawer({ open, onClose, title, side = 'right', width = 'max-w-md', children, footer = null }) {
  const ref = useTrapFocus(open);
  const sideCls = side === 'left' ? 'left-0' : 'right-0';
  return (
    <OverlayRoot open={open} onClose={onClose}>
      <div className="fixed inset-0 z-[var(--z-drawer)]" role="presentation">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`absolute top-0 ${sideCls} h-full w-full ${width} bg-[var(--surface-elevated)] border-l border-slate-800
            flex flex-col shadow-2xl animate-[slideIn_180ms_var(--ease-out)]`}
        >
          <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-100 truncate">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <footer className="border-t border-slate-800 px-5 py-3">{footer}</footer>}
        </div>
      </div>
    </OverlayRoot>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer = null, maxWidth = 'max-w-lg' }) {
  const ref = useTrapFocus(open);
  return (
    <OverlayRoot open={open} onClose={onClose}>
      <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4" role="presentation">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`relative w-full ${maxWidth} bg-[var(--surface-elevated)] border border-slate-800 rounded-2xl
            shadow-[var(--shadow-lg)] flex flex-col max-h-[85vh] animate-[fadeIn_150ms_ease-out]`}
        >
          <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-100 truncate">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <footer className="border-t border-slate-800 px-5 py-3 flex items-center justify-end gap-2">{footer}</footer>}
        </div>
      </div>
    </OverlayRoot>
  );
}

// ── ConfirmDialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  message = null,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p className="text-sm text-slate-300 leading-relaxed">{message}</p>}
    </Modal>
  );
}