// PR-012 · FilterChip (TXT 03 §3). Chip de filtro con estado activo y cierre.

import { X } from 'lucide-react';

const FilterChip = ({ label, active = false, onClick, onRemove = null, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold
      transition-colors cursor-pointer select-none
      ${active
        ? 'border-brand-500/40 bg-brand-500/10 text-brand-400'
        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800'}
      ${className}`}
    onClick={onClick}
    role="button"
    aria-pressed={active}
  >
    {label}
    {onRemove && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Quitar filtro ${label}`}
        className="rounded-full hover:text-white"
      >
        <X size={12} />
      </button>
    )}
  </span>
);

export default FilterChip;