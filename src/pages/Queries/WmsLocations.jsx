import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, X, Download, RefreshCw, Package,
  Database, Zap, Archive, ChevronDown, ChevronUp,
  MapPin, Layers, Hash, Filter, BarChart3, Box
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWarehouseStore } from '../../store/warehouseStore';

/* ── Constantes ── */
const ROW_HEIGHT = 72;
const STOCK_FILTERS = [
  { key: 'all', label: 'Todos', icon: Database },
  { key: 'stock', label: 'Con Stock', icon: Package },
  { key: 'empty', label: 'Sin Stock', icon: Archive },
];

/* ── Componente de SKU dentro del detalle expandido ── */
const SkuRow = React.memo(({ item }) => (
  <div className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-colors group/sku">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
        <Box size={14} className="text-orange-500" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-bold text-slate-900 block truncate">{item.descripcion || '—'}</span>
        <span className="text-[10px] font-bold text-slate-400">{item.codigo}</span>
      </div>
    </div>
    <div className="flex items-center gap-6 shrink-0">
      {item.talla && (
        <div className="text-center">
          <span className="text-[8px] font-black text-slate-300 uppercase block">Talla</span>
          <span className="text-xs font-bold text-slate-600">{item.talla}</span>
        </div>
      )}
      {item.color && (
        <div className="text-center">
          <span className="text-[8px] font-black text-slate-300 uppercase block">Color</span>
          <span className="text-xs font-bold text-slate-600">{item.color}</span>
        </div>
      )}
      {item.partida && (
        <div className="text-center">
          <span className="text-[8px] font-black text-slate-300 uppercase block">Partida</span>
          <span className="text-xs font-bold text-slate-600 truncate max-w-[100px] block">{item.partida}</span>
        </div>
      )}
      <div className="w-16 text-right">
        <span className={`text-lg font-black tabular-nums ${item.cantidad > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
          {item.cantidad || 0}
        </span>
      </div>
    </div>
  </div>
));

/* ── Fila de ubicación (agrupada) ── */
const LocationRow = React.memo(({ location, isExpanded, onToggle }) => {
  const parts = location.ubicacion?.split('-') || [];
  const skuCount = location.items?.length || 0;
  const totalQty = location.totalStock || 0;
  const occupancy = totalQty > 0 ? 'occupied' : 'empty';

  return (
    <div className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${
      isExpanded
        ? 'border-orange-200 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100'
        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
    }`}>
      {/* Cabecera clickeable */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Indicador de estado */}
          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 transition-colors ${
            occupancy === 'occupied'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-400'
          }`}>
            <span className="text-base font-black tracking-tighter leading-none">{parts[0]}</span>
            <span className="text-[8px] font-bold opacity-60">{parts[1]}-{parts[2]}</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 tracking-tight">{location.ubicacion}</h4>
              {occupancy === 'occupied' && (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Layers size={10} /> {skuCount} SKU{skuCount !== 1 ? 's' : ''}
              </span>
              {location.items?.[0]?.descripcion && (
                <span className="text-[10px] font-bold text-slate-300 truncate max-w-[200px] hidden md:block">
                  {location.items[0].descripcion}{skuCount > 1 ? ` +${skuCount - 1}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-center">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Pasillo</span>
              <span className="text-sm font-black text-slate-700">{parts[0]}</span>
            </div>
            <div className="text-center">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Nivel</span>
              <span className="text-sm font-black text-slate-700">{parts[1]}</span>
            </div>
            <div className="text-center">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Pos</span>
              <span className="text-sm font-black text-slate-700">{parts[2]}</span>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-slate-100 hidden sm:block" />

          <div className="text-right min-w-[60px]">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Stock</span>
            <span className={`text-xl font-black tabular-nums leading-none ${totalQty > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
              {totalQty.toLocaleString()}
            </span>
          </div>

          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isExpanded ? 'bg-orange-500 text-white rotate-180' : 'bg-slate-100 text-slate-400'
          }`}>
            <ChevronDown size={16} />
          </div>
        </div>
      </button>

      {/* Detalle expandido */}
      {isExpanded && location.items && (
        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2 px-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Detalle de productos en {location.ubicacion}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{skuCount} registro{skuCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-0.5 max-h-[300px] overflow-y-auto custom-scrollbar-flat">
            {location.items.map((item, idx) => (
              <SkuRow key={item.id || idx} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

/* ── Stat Card ── */
const StatCard = ({ label, value, icon: Icon, color = 'slate' }) => (
  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${color}-50`}>
      <Icon size={18} className={`text-${color}-500`} />
    </div>
    <div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
      <span className="text-lg font-black text-slate-900 tabular-nums leading-none">{value}</span>
    </div>
  </div>
);

/* ── Componente Principal ── */
const WmsLocations = () => {
  const { inventory, stats, loading, fetchWarehouseData } = useWarehouseStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [activeAisle, setActiveAisle] = useState('Todos');
  const [stockFilter, setStockFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('ubicacion'); // 'ubicacion' | 'stock' | 'skus'
  const [sortDir, setSortDir] = useState('asc');
  const parentRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  // Sync URL search param → input
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch && urlSearch !== search) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      // Update URL without navigation
      if (search) {
        setSearchParams({ search }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 150);
    return () => clearTimeout(handler);
  }, [search]);

  // Keyboard shortcut: Ctrl+K or / to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && e.target.tagName !== 'INPUT')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchRef.current?.blur();
        setSearch('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Agrupar items por ubicación normalizada
  const groupedLocations = useMemo(() => {
    const allItems = Object.values(inventory).flat();
    const locationMap = {};

    allItems.forEach(item => {
      const loc = item.ubicacion || 'SIN-UBICACION';
      if (!locationMap[loc]) {
        locationMap[loc] = {
          ubicacion: loc,
          items: [],
          totalStock: 0,
        };
      }
      locationMap[loc].items.push(item);
      locationMap[loc].totalStock += (Number(item.cantidad) || 0);
    });

    return Object.values(locationMap);
  }, [inventory]);

  const aisles = useMemo(() => {
    const unique = new Set(groupedLocations.map(loc => loc.ubicacion.split('-')[0]).filter(Boolean));
    return ['Todos', ...Array.from(unique).sort()];
  }, [groupedLocations]);

  // Filtrado + búsqueda + ordenamiento
  const filteredData = useMemo(() => {
    let result = groupedLocations;

    // Filtro por pasillo
    if (activeAisle !== 'Todos') {
      result = result.filter(loc => loc.ubicacion.startsWith(activeAisle + '-'));
    }

    // Filtro por stock
    if (stockFilter === 'stock') {
      result = result.filter(loc => loc.totalStock > 0);
    } else if (stockFilter === 'empty') {
      result = result.filter(loc => loc.totalStock === 0);
    }

    // Búsqueda multi-campo
    const q = debouncedSearch.toLowerCase().trim();
    if (q) {
      const terms = q.split(/\s+/);
      result = result.filter(loc => {
        const haystack = [
          loc.ubicacion,
          ...loc.items.map(i => `${i.codigo} ${i.descripcion} ${i.talla || ''} ${i.color || ''} ${i.partida || ''}`)
        ].join(' ').toLowerCase();
        return terms.every(term => haystack.includes(term));
      });
    }

    // Ordenamiento
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'stock') cmp = a.totalStock - b.totalStock;
      else if (sortBy === 'skus') cmp = a.items.length - b.items.length;
      else cmp = a.ubicacion.localeCompare(b.ubicacion);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [groupedLocations, debouncedSearch, activeAisle, stockFilter, sortBy, sortDir]);

  // Stats computadas del filtro actual
  const filteredStats = useMemo(() => ({
    locations: filteredData.length,
    totalStock: filteredData.reduce((acc, loc) => acc + loc.totalStock, 0),
    totalSkus: filteredData.reduce((acc, loc) => acc + loc.items.length, 0),
    withStock: filteredData.filter(loc => loc.totalStock > 0).length,
  }), [filteredData]);

  // Virtualizer - altura dinámica para filas expandidas
  const virtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      if (filteredData[index]?.ubicacion === expandedId) {
        const itemCount = filteredData[index].items?.length || 0;
        return ROW_HEIGHT + Math.min(itemCount * 44 + 60, 360);
      }
      return ROW_HEIGHT + 8;
    },
    overscan: 8,
  });

  // Re-measure cuando cambia la fila expandida
  useEffect(() => {
    virtualizer.measure();
  }, [expandedId]);

  const toggleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir(field === 'ubicacion' ? 'asc' : 'desc');
    }
  }, [sortBy]);

  const exportCSV = useCallback(() => {
    const headers = ['Ubicacion', 'Codigo', 'Descripcion', 'Cantidad', 'Talla', 'Color', 'Partida'];
    const rows = [];
    filteredData.forEach(loc => {
      loc.items.forEach(item => {
        rows.push([
          `"${loc.ubicacion}"`,
          `"${item.codigo || ''}"`,
          `"${(item.descripcion || '').replace(/"/g, '""')}"`,
          item.cantidad || 0,
          `"${item.talla || ''}"`,
          `"${item.color || ''}"`,
          `"${item.partida || ''}"`,
        ]);
      });
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const BOM = '﻿';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `WMS_INVENTARIO_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredData]);

  const SortButton = ({ field, label }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors ${
        sortBy === field ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {label}
      {sortBy === field && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F1F3F6] text-[#1A1C1E] flex overflow-hidden">

      {/* Sidebar de pasillos */}
      <aside className="w-[80px] bg-[#1A1C1E] flex flex-col items-center py-6 z-50 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center mb-8 shadow-lg shadow-orange-900/30">
          <MapPin size={20} className="text-white" />
        </div>

        <div className="flex-1 flex flex-col gap-2 w-full px-2 overflow-y-auto no-scrollbar">
          {aisles.map(aisle => {
            const count = aisle === 'Todos'
              ? groupedLocations.length
              : groupedLocations.filter(l => l.ubicacion.startsWith(aisle + '-')).length;
            return (
              <button
                key={aisle}
                onClick={() => { setActiveAisle(aisle); setExpandedId(null); }}
                className={`w-full py-3 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
                  activeAisle === aisle
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                <span className="text-base font-black leading-none">{aisle === 'Todos' ? '★' : aisle}</span>
                <span className="text-[8px] font-bold opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Barra de búsqueda */}
        <div className="bg-white px-6 py-5 border-b border-slate-200 shadow-sm z-40">
          <div className="max-w-[1400px] mx-auto">
            {/* Search */}
            <div className="relative flex items-center group mb-4">
              <div className="absolute left-5 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                <Search size={22} strokeWidth={2.5} />
              </div>
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar ubicación, SKU, descripción, talla, color, partida... (Ctrl+K)"
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-14 pr-28 py-4 text-base font-semibold text-[#1A1C1E] placeholder-slate-300 focus:bg-white focus:border-orange-400 focus:shadow-lg focus:shadow-orange-100/50 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute right-4 flex items-center gap-2">
                {search && (
                  <button
                    onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                    className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <X size={14} />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                  Ctrl K
                </kbd>
              </div>
            </div>

            {/* Filtros + Stats + Acciones */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Stock filter pills */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  {STOCK_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setStockFilter(f.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        stockFilter === f.key
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <f.icon size={12} />
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="w-[1px] h-6 bg-slate-200 mx-1" />

                {/* Sort buttons */}
                <div className="flex items-center gap-3">
                  <SortButton field="ubicacion" label="Ubicación" />
                  <SortButton field="stock" label="Stock" />
                  <SortButton field="skus" label="SKUs" />
                </div>
              </div>

              {/* Stats compactas */}
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-3">
                  <StatCard label="Ubicaciones" value={filteredStats.locations} icon={MapPin} color="blue" />
                  <StatCard label="Stock Total" value={filteredStats.totalStock.toLocaleString()} icon={Package} color="orange" />
                  <StatCard label="Ocupación" value={`${stats.ocupacion}%`} icon={BarChart3} color="emerald" />
                </div>

                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black hover:bg-orange-600 transition-all active:scale-95 shadow-md"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">CSV</span>
                </button>
                <button
                  onClick={() => fetchWarehouseData()}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all active:rotate-180 duration-500"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista virtualizada */}
        <main ref={parentRef} className="flex-1 overflow-y-auto px-6 py-6 bg-[#F1F3F6]">
          {loading && filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-16 h-16 border-[6px] border-orange-100 border-t-orange-500 rounded-full animate-spin mb-6" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Cargando inventario...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200 mx-auto max-w-2xl">
              <Search size={48} className="text-slate-200 mb-6" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Sin resultados</h3>
              <p className="text-sm font-semibold text-slate-400">
                No hay coincidencias para &quot;{search}&quot;
                {activeAisle !== 'Todos' && ` en pasillo ${activeAisle}`}
              </p>
              <button
                onClick={() => { setSearch(''); setActiveAisle('Todos'); setStockFilter('all'); }}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="max-w-[1400px] mx-auto">
              {/* Barra de ordenamiento compacta */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {filteredData.length} ubicacion{filteredData.length !== 1 ? 'es' : ''} • {filteredStats.totalSkus} registros
                </span>
              </div>

              <div
                className="relative"
                style={{ height: `${virtualizer.getTotalSize()}px` }}
              >
                {virtualizer.getVirtualItems().map(virtualRow => {
                  const loc = filteredData[virtualRow.index];
                  return (
                    <div
                      key={virtualRow.key}
                      className="absolute top-0 left-0 w-full"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        paddingBottom: '8px',
                      }}
                    >
                      <LocationRow
                        location={loc}
                        isExpanded={expandedId === loc.ubicacion}
                        onToggle={() => setExpandedId(prev => prev === loc.ubicacion ? null : loc.ubicacion)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WmsLocations;
