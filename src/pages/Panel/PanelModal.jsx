import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Modal del Panel renderizado con PORTAL a document.body, para que el fondo
// oscuro cubra TODA la pantalla (incluido el navbar de CCO) y no quede contenido
// dentro del contenedor animado del módulo. Bloquea el scroll de fondo y cierra
// con Escape / clic afuera. Look nativo de CCO.
export default function PanelModal({ titulo, onClose, children, maxWidth = 'max-w-3xl' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose} style={{ animation: 'panelBackdropIn 0.2s ease both' }}>
      <div className={`bg-white w-full ${maxWidth} sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[88vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', animation: 'panelModalIn 0.28s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-slate-800">{titulo}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
