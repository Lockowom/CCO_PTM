import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Truck, User, FileText, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { withTimeout } from '../../lib/supabaseQuery';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setIsLoading(true);
      
      try {
        // Buscar en productos (wms_ubicaciones) — con timeout para que el
        // spinner del palette no quede colgado si la red no responde.
        const { data: locs } = await withTimeout(
          supabase
            .from('wms_ubicaciones')
            .select('codigo, descripcion, ubicacion')
            .ilike('codigo', `%${query}%`)
            .limit(3),
          { ms: 10000, label: 'búsqueda rápida' }
        );

        // Buscar en notas de venta (tms_nv_diarias)
        const { data: nvs } = await withTimeout(
          supabase
            .from('tms_nv_diarias')
            .select('nv, cliente, estado')
            .ilike('nv', `%${query}%`)
            .limit(3),
          { ms: 10000, label: 'búsqueda rápida' }
        );

        const newResults = [];
        
        if (locs) {
          locs.forEach(l => {
            newResults.push({
              type: 'product',
              icon: <Package size={16} className="text-emerald-400" />,
              title: l.codigo,
              subtitle: l.descripcion,
              action: () => navigate(`/queries/kardex?q=${l.codigo}`)
            });
          });
        }

        if (nvs) {
          nvs.forEach(n => {
            newResults.push({
              type: 'nv',
              icon: <FileText size={16} className="text-indigo-400" />,
              title: `NV #${n.nv}`,
              subtitle: `${n.cliente} - ${n.estado}`,
              action: () => navigate(`/queries/historial-nv?q=${n.nv}`)
            });
          });
        }

        // Acciones globales
        const globalActions = [
          { title: 'Dashboard TMS', path: '/tms/dashboard', icon: <Truck size={16} className="text-blue-400"/> },
          { title: 'Kardex', path: '/queries/kardex', icon: <Package size={16} className="text-emerald-400"/> },
          { title: 'Picking', path: '/outbound/picking', icon: <FileText size={16} className="text-amber-400"/> },
        ].filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

        globalActions.forEach(a => {
          newResults.push({
            type: 'action',
            icon: a.icon,
            title: a.title,
            subtitle: 'Navegar',
            action: () => navigate(a.path)
          });
        });

        setResults(newResults);
        setSelectedIndex(0);
      } catch (_) {
        console.error('Command execution error:', _);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query, navigate]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:px-0">
      <div className="fixed inset-0 bg-slate-50/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div 
        className="bg-white border border-slate-300 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4"
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className="flex items-center px-4 border-b border-slate-300">
          <Search size={20} className="text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none text-slate-900 px-4 py-4 outline-none placeholder-slate-500 font-medium text-lg"
            placeholder="Buscar notas de venta, SKU o acciones..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="p-1 text-slate-500 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 text-sm">Buscando...</div>
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-slate-100' : 'hover:bg-slate-100/50'
                }`}
                onClick={() => {
                  result.action();
                  setIsOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="p-2 bg-slate-50 rounded-lg shadow-inner">
                  {result.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{result.title}</h4>
                  <p className="text-xs text-slate-500">{result.subtitle}</p>
                </div>
              </div>
            ))
          ) : query ? (
            <div className="p-4 text-center text-slate-500 text-sm">No se encontraron resultados para "{query}"</div>
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm">Empieza a escribir para buscar...</div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50/50 p-3 border-t border-slate-300 flex justify-between items-center text-xs text-slate-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded">↑</kbd> <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded">↓</kbd> Navegar</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded">Enter</kbd> Seleccionar</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded">Esc</kbd> Cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
