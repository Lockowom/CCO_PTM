import React, { useEffect, useRef, useState } from 'react';
import { buscarProductos } from '../../services/inventario';

// Autocompletado de SKU sobre tms_matriz_codigos. Reutilizable por Bloques y Conteo.
export function ProductoAutocomplete({ value, onChange, onSelect, placeholder = 'Buscá o escaneá el SKU…', autoFocus }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const onInput = (v) => {
    onChange(v);
    clearTimeout(timer.current);
    if (v.trim().length < 1) { setItems([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try { setItems(await buscarProductos(v.trim())); setOpen(true); }
      catch { setItems([]); }
      finally { setLoading(false); }
    }, 220);
  };

  return (
    <div className="relative" ref={boxRef}>
      <input
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        placeholder={placeholder} value={value} autoFocus={autoFocus}
        onChange={(e) => onInput(e.target.value)} onFocus={() => items.length && setOpen(true)}
      />
      {loading && <div className="absolute right-3 top-3 text-xs text-slate-400">…</div>}
      {open && items.length > 0 && (
        <div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {items.map((p) => (
            <button key={p.codigo_producto} type="button"
              className="flex w-full flex-col items-start border-b border-slate-50 px-3 py-2.5 text-left last:border-0 hover:bg-slate-50"
              onClick={() => { onSelect(p); setOpen(false); }}>
              <span className="font-mono text-sm font-bold text-slate-800">{p.codigo_producto}</span>
              <span className="text-xs text-slate-500">{p.producto}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
