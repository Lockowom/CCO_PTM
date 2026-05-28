import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, X, Download, RefreshCw,
  ChevronDown, ChevronUp, Package, MapPin,
  Filter, ArrowUpDown, Layers
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWarehouseStore } from '../../store/warehouseStore';

const COLLAPSED_HEIGHT = 82;
const ITEM_HEIGHT = 52;

const LocationGroup = React.memo(({ group, searchQuery, isExpanded, onToggle }) => {
  const matchingItems = group.matchingItems;
  const totalItems = group.allItems.length;
  const totalStock = group.allItems.reduce((acc, i) => acc + (Number(i.cantidad) || 0), 0);
  const matchStock = matchingItems.reduce((acc, i) => acc + (Number(i.cantidad) || 0), 0);
  const parts = group.ubicacion.split('-');
  const hasSearch = searchQuery.length > 0;
  const displayItems = hasSearch ? matchingItems : group.allItems;
  const showItems = isExpanded ? displayItems : displayItems.slice(0, 1);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all">
      <div
        className="px-4 sm:px-5 py-3 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
        onClick={onToggle}
      >
        {/* Row 1: Location name + chevron */}
        <div className="flex items-center justify-between mb-1.5 sm:mb-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${totalStock > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">{group.ubicacion}</span>
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-medium ml-2">
              <span>Rack <strong className="text-slate-600">{parts[0]}</strong></span>
              <span>Pos <strong className="text-slate-600">{parts[1]}</strong></span>
              <span>Niv <strong className="text-slate-600">{parts[2]}</strong></span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 sm:hidden">
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>

        {/* Row 2: Stats (match badge + SKUs + stock) */}
        <div className="flex items-center justify-between sm:justify-end sm:gap-5 ml-5 sm:ml-0">
          <div className="flex items-center gap-3">
            {hasSearch && matchingItems.length < totalItems && (
              <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                {matchingItems.length}/{totalItems} coinciden
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Package size={13} />
              <span className="font-bold text-slate-600">{hasSearch ? matchingItems.length : totalItems}</span>
              <span>SKUs</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">{hasSearch ? matchStock : totalStock}</span>
              <span className="text-[10px] text-slate-400 font-medium ml-1">uds</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 hidden sm:flex items-center justify-center text-slate-400">
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </div>
        </div>
      </div>

      {showItems.length > 0 && (
        <div className="border-t border-slate-100">
          {showItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`flex items-center justify-between px-5 py-2.5 text-sm ${idx > 0 ? 'border-t border-slate-50' : ''} hover:bg-blue-50/30 transition-colors`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shrink-0">{item.codigo}</span>
                <span className="text-slate-600 truncate">{item.descripcion}</span>
              </div>
              <span className="text-sm font-bold text-slate-800 tabular-nums shrink-0 ml-4">{Number(item.cantidad) || 0}</span>
            </div>
          ))}
          {!isExpanded && displayItems.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50/30 transition-colors border-t border-slate-50"
            >
              +{displayItems.length - 1} más
            </button>
          )}
        </div>
      )}
    </div>
  );
});

const WmsLocations = () => {
  const { inventory, stats, loading, fetchWarehouseData } = useWarehouseStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const parentRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => { fetchWarehouseData(); }, [fetchWarehouseData]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const locationGroups = useMemo(() => {
    const groups = {};
    Object.entries(inventory).forEach(([ubicacion, items]) => {
      if (!groups[ubicacion]) {
        groups[ubicacion] = { ubicacion, allItems: [], matchingItems: [] };
      }
      groups[ubicacion].allItems = items;
    });
    return groups;
  }, [inventory]);

  const filteredGroups = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    let results = Object.values(locationGroups);

    results = results.map(group => {
      let matching;
      if (q) {
        matching = group.allItems.filter(item =>
          (item.ubicacion || '').toLowerCase().includes(q) ||
          (item.codigo || '').toLowerCase().includes(q) ||
          (item.descripcion || '').toLowerCase().includes(q)
        );
      } else {
        matching = group.allItems;
      }
      return { ...group, matchingItems: matching };
    });

    if (q) {
      results = results.filter(g => g.matchingItems.length > 0);
    }

    if (stockFilter === 'stock') {
      results = results.filter(g => {
        const items = q ? g.matchingItems : g.allItems;
        return items.some(i => Number(i.cantidad) > 0);
      });
    } else if (stockFilter === 'empty') {
      results = results.filter(g => {
        const total = g.allItems.reduce((acc, i) => acc + (Number(i.cantidad) || 0), 0);
        return total === 0;
      });
    }

    results.sort((a, b) => {
      const cmp = a.ubicacion.localeCompare(b.ubicacion);
      return sortAsc ? cmp : -cmp;
    });

    return results;
  }, [locationGroups, debouncedSearch, stockFilter, sortAsc]);

  const summaryStats = useMemo(() => {
    const totalLocations = filteredGroups.length;
    const totalItems = filteredGroups.reduce((acc, g) => {
      const items = debouncedSearch ? g.matchingItems : g.allItems;
      return acc + items.length;
    }, 0);
    const totalStock = filteredGroups.reduce((acc, g) => {
      const items = debouncedSearch ? g.matchingItems : g.allItems;
      return acc + items.reduce((a, i) => a + (Number(i.cantidad) || 0), 0);
    }, 0);
    return { totalLocations, totalItems, totalStock };
  }, [filteredGroups, debouncedSearch]);

  const toggleExpand = useCallback((key) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const virtualizer = useVirtualizer({
    count: filteredGroups.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const group = filteredGroups[index];
      if (!group) return COLLAPSED_HEIGHT;
      const isExpanded = expandedKeys.has(group.ubicacion);
      const q = debouncedSearch.toLowerCase().trim();
      const displayItems = q ? group.matchingItems : group.allItems;
      if (isExpanded) {
        return COLLAPSED_HEIGHT + displayItems.length * ITEM_HEIGHT + 8;
      }
      return COLLAPSED_HEIGHT + (displayItems.length > 0 ? ITEM_HEIGHT : 0) + (displayItems.length > 1 ? 32 : 0) + 8;
    },
    overscan: 8,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [expandedKeys, debouncedSearch, stockFilter]);

  const exportCSV = useCallback(() => {
    const headers = ['Ubicacion', 'Codigo', 'Descripcion', 'Cantidad'];
    const rows = [];
    filteredGroups.forEach(group => {
      const items = debouncedSearch ? group.matchingItems : group.allItems;
      items.forEach(item => {
        rows.push([
          `"${(item.ubicacion || '').replace(/"/g, '""')}"`,
          `"${(item.codigo || '').replace(/"/g, '""')}"`,
          `"${(item.descripcion || '').replace(/"/g, '""')}"`,
          item.cantidad || 0
        ]);
      });
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["﻿" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WMS_UBICACIONES_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredGroups, debouncedSearch]);

  const filterTabs = [
    { key: 'all', label: 'Todos' },
    { key: 'stock', label: 'Con stock' },
    { key: 'empty', label: 'Vacías' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] overflow-hidden">

      <header className="shrink-0 bg-white border-b border-slate-200 px-3 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">Explorador de Ubicaciones</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {stats.ocupacion}% ocupación · {summaryStats.totalLocations} ubicaciones · {summaryStats.totalItems} registros · {summaryStats.totalStock.toLocaleString()} uds
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-slate-800 text-white px-3 sm:px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors active:scale-[0.97]"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={() => fetchWarehouseData()}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all active:scale-95"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-slate-300 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar ubicación, SKU o descripción..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-20 py-3 text-sm font-medium text-slate-900 placeholder-slate-300 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-12 w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
            >
              <X size={13} />
            </button>
          )}
          <span className="absolute right-4 text-[10px] text-slate-300 font-mono">Ctrl K</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStockFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${stockFilter === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortAsc(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <ArrowUpDown size={13} />
            Ubicación {sortAsc ? '↑' : '↓'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-3 sm:px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-white/50 shrink-0">
          <span className="flex items-center gap-1"><MapPin size={11} /> Ubicación</span>
          <span className="w-[100px]">Desglose</span>
          <span className="w-[200px]">Producto</span>
          <span className="w-[120px] text-right">Stock</span>
        </div>

        <main ref={parentRef} className="flex-1 overflow-y-auto px-2 sm:px-4 py-3">
          {loading && filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-6" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando datos...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Layers size={40} className="text-slate-200 mb-4" />
              <h3 className="text-base font-bold text-slate-400 mb-1">Sin resultados</h3>
              <p className="text-xs text-slate-300">
                {search ? `No se encontró "${search}"` : 'No hay ubicaciones que mostrar'}
              </p>
            </div>
          ) : (
            <div
              className="relative"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {virtualizer.getVirtualItems().map(virtualRow => {
                const group = filteredGroups[virtualRow.index];
                return (
                  <div
                    key={group.ubicacion}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      paddingBottom: '8px',
                    }}
                  >
                    <LocationGroup
                      group={group}
                      searchQuery={debouncedSearch}
                      isExpanded={expandedKeys.has(group.ubicacion)}
                      onToggle={() => toggleExpand(group.ubicacion)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WmsLocations;
