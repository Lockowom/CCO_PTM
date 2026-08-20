import { Search, X } from 'lucide-react';

const MobileSearch = ({ value, onChange, onClear, placeholder = 'Buscar…', label = 'Buscar' }) => (
  <label className="relative block">
    <span className="sr-only">{label}</span>
    <Search
      size={18}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
    <input
      type="search"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-12 text-base text-slate-100 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
    />
    {value ? (
      <button
        type="button"
        aria-label="Limpiar búsqueda"
        onClick={onClear}
        className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-slate-400"
      >
        <X size={18} />
      </button>
    ) : null}
  </label>
);

export default MobileSearch;
