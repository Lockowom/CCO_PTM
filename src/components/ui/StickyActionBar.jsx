// PR-012 · StickyActionBar (TXT 03 §9 / TXT 04 §6). Barra de acciones fija al
// final del viewport en móvil, integrada en desktop. Muestra estado dirty/saving.

import { Save } from 'lucide-react';
import Button from './Button';

const StickyActionBar = ({
  dirty = false,
  saving = false,
  onSave,
  onCancel = null,
  saveLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  offline = false,
  conflict = false,
  className = '',
  children = null,
}) => (
  <div
    className={`sticky bottom-0 z-[var(--z-sticky)] flex items-center justify-between gap-3
      border-t border-slate-800 bg-[var(--surface-elevated)]/95 backdrop-blur px-4 py-3 ${className}`}
  >
    <div className="flex items-center gap-2 text-xs min-w-0">
      {conflict && <span className="text-red-400 font-semibold">Conflicto</span>}
      {offline && <span className="text-amber-400 font-semibold">Offline</span>}
      {saving ? (
        <span className="text-slate-400">Guardando…</span>
      ) : dirty ? (
        <span className="text-slate-400">Cambios sin guardar</span>
      ) : null}
      {children}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          {cancelLabel}
        </Button>
      )}
      <Button variant="primary" size="sm" onClick={onSave} loading={saving} icon={Save}>
        {saveLabel}
      </Button>
    </div>
  </div>
);

export default StickyActionBar;