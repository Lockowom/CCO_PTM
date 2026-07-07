import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, X, Download, RefreshCw,
  ChevronDown, ChevronUp, Package, MapPin,
  ArrowUpDown, Layers
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWarehouseStore } from '../../store/warehouseStore';
import { useCalidadFlags } from '../../hooks/useCalidadFlags';
import CalidadBadge from '../../components/ui/CalidadBadge';

// Estimaciones iniciales; la altura real la mide el virtualizer (measureElement).
const COLLAPSED_HEIGHT = 92;
const ITEM_HEIGHT = 44;

const LocationGroup = React.memo(({ group, searchQuery, isExpanded, onToggle, flagForItem }) => {
  const matchingItems = group.matchingItems;
  const totalItems = group.allItems.length;
  const totalStock = group.allItems.reduce((acc, i) => acc + (Number(i.cantidad) || 0), 0);
  const matchStock = matchingItems.reduce((acc, i) => acc + (Number(i.cantidad) || 0), 0);
  const hasSearch = searchQuery.length > 0;
  const displayItems = hasSearch ? matchingItems : group.allItems;
  const showItems = isExpanded ? displayItems : displayItems.slice(0, 1);
  const stock = hasSearch ? matchStock : totalStock;
  const skus = hasSearch ? matchingItems.length : totalItems;
  const conStock = stock > 0;

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl hover:border-amber-200 hover:shadow-[0_4px_20px_-8px_rgba(245,158,11,0.25)] transition-all overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 sm:px-5 py-3.5 cursor-pointer select-none hover:bg-amber-50/30 transition-colors"
        onClick={onToggle}
      >
        {/* Barra de estado (color = con/sin stock) */}
        <div className={`w-1 self-stretch rounded-full shrink-0 ${conStock ? 'bg-emerald-400' : 'bg-slate-200'}`} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${conStock ? 'text-slate-900' : 'text-slate-400'}`}>
              {group.ubicacion}
            </span>
            {hasSearch && matchingItems.length < totalItems && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                {matchingItems.length}/{totalItems}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
            <Package size={11} />
            <span className="font-bold text-slate-500">{skus}</span>
            <span>{skus === 1 ? 'SKU' : 'SKUs'}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={`text-lg sm:text-xl font-black tabular-nums ${conStock ? 'text-slate-900' : 'text-slate-300'}`}>{stock}</span>
          <span className="text-[10px] text-slate-400 font-medium ml-0.5">uds</span>
        </div>
        <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {showItems.length > 0 && (
        <div className="border-t border-slate-100">
          {showItems.map((item, idx) => {
            const flag = flagForItem ? flagForItem(item.codigo, item.ubicacion || group.ubicacion) : null;
            return (
              <div
                key={item.id || idx}
                className={`flex items-center gap-3 px-4 sm:px-5 py-2.5 text-sm ${idx > 0 ? 'border-t border-slate-50' : ''} hover:bg-amber-50/20 transition-colors`}
              >
                <span className="text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 shrink-0">{item.codigo}</span>
                {flag && <CalidadBadge estado={flag.estado_calidad} size="xs" title={flag.nota} />}
                <span className="text-slate-500 truncate flex-1 min-w-0">{item.descripcion}</span>
                <span className="text-sm font-black text-slate-800 tabular-nums shrink-0">{Number(item.cantidad) || 0}</span>
              </div>
            );
          })}
          {!isExpanded && displayItems.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50/30 transition-colors border-t border-slate-50"
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
  const { flagForItem } = useCalidadFlags();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const parentRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => { fetchWarehouseData(); }, [fetchWarehouseData]);

  // Búsqueda INSTANTÁNEA: el inventario ya está en memoria, así que filtramos
  // en cada tecla sin debounce → escribir/borrar refleja al instante.
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
      if (!groups[ubicacion]) groups[ubicacion] = { ubicacion, allItems: [], matchingItems: [] };
      groups[ubicacion].allItems = items;
    });
    return groups;
  }, [inventory]);

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase().trim();
    // Search-first: sin término no renderizamos nada (evita construir/virtualizar
    // miles de tarjetas al entrar → la vista abre instantánea y liviana).
    if (!q) return [];
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

    if (q) results = results.filter(g => g.matchingItems.length > 0);

    if (stockFilter === 'stock') {
      results = results.filter(g => {
        const items = q ? g.matchingItems : g.allItems;
        return items.some(i => Number(i.cantidad) > 0);
      });
    } else if (stockFilter === 'empty') {
      results = results.filter(g => g.allItems.reduce((acc, i) => acc + (Number(i.cantidad) || 0), 0) === 0);
    }

    results.sort((a, b) => {
      const cmp = a.ubicacion.localeCompare(b.ubicacion);
      return sortAsc ? cmp : -cmp;
    });

    return results;
  }, [locationGroups, search, stockFilter, sortAsc]);

  const summaryStats = useMemo(() => {
    const totalLocations = filteredGroups.length;
    const totalItems = filteredGroups.reduce((acc, g) => acc + (search ? g.matchingItems : g.allItems).length, 0);
    const totalStock = filteredGroups.reduce((acc, g) =>
      acc + (search ? g.matchingItems : g.allItems).reduce((a, i) => a + (Number(i.cantidad) || 0), 0), 0);
    return { totalLocations, totalItems, totalStock };
  }, [filteredGroups, search]);

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
      const q = search.toLowerCase().trim();
      const displayItems = q ? group.matchingItems : group.allItems;
      if (isExpanded) return COLLAPSED_HEIGHT + displayItems.length * ITEM_HEIGHT + 8;
      return COLLAPSED_HEIGHT + (displayItems.length > 0 ? ITEM_HEIGHT : 0) + (displayItems.length > 1 ? 32 : 0) + 8;
    },
    overscan: 8,
  });

  useEffect(() => { virtualizer.measure(); }, [expandedKeys, search, stockFilter]);

  const exportCSV = useCallback(() => {
    const headers = ['Ubicacion', 'Codigo', 'Descripcion', 'Cantidad'];
    const rows = [];
    filteredGroups.forEach(group => {
      (search ? group.matchingItems : group.allItems).forEach(item => {
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
  }, [filteredGroups, search]);

  const filterTabs = [
    { key: 'all', label: 'Todos' },
    { key: 'stock', label: 'Con stock' },
    { key: 'empty', label: 'Vacías' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] overflow-hidden">

      {/* HERO — buscador central protagónico */}
      <header className="shrink-0 px-4 pt-6 sm:pt-8 pb-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm items-center justify-center mb-3">
            <MapPin className="text-amber-500" size={28} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter">
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">Ubicaciones</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Escribe y los resultados aparecen al instante</p>

          {/* Barra de búsqueda con halo animado al enfocar */}
          <div className="relative mt-5 group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-[1.4rem] blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl px-4 h-14 sm:h-16 shadow-sm transition-all duration-300 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100/70 focus-within:-translate-y-0.5">
              <Search size={20} className="text-slate-300 group-focus-within:text-amber-500 transition-colors shrink-0" />
              <input
                ref={searchRef}
                type="text"
                autoFocus
                placeholder="Buscar ubicación, SKU o descripción..."
                className="flex-1 min-w-0 bg-transparent outline-none text-base sm:text-lg font-medium text-slate-900 placeholder:text-slate-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search ? (
                <>
                  <span className="text-[11px] text-slate-400 font-mono font-bold shrink-0 tabular-nums">{summaryStats.totalLocations} ubic.</span>
                  <button
                    onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                    className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shrink-0"
                  >
                    <X size={13} />
                  </button>
                </>
              ) : (
                <span className="hidden sm:inline text-[10px] text-slate-300 font-mono shrink-0">Ctrl K</span>
              )}
            </div>
          </div>

          {/* Filtros + acciones */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
            >
              <ArrowUpDown size={13} /> {sortAsc ? 'A→Z' : 'Z→A'}
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
            >
              <Download size={13} /> <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={() => fetchWarehouseData(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
              title="Actualizar"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* RESULTADOS */}
      <main ref={parentRef} className="flex-1 overflow-y-auto px-3 sm:px-4 pb-6">
        <div className="max-w-3xl mx-auto">
          {!search.trim() ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <Search size={40} className="text-slate-200 mb-4" />
              <h3 className="text-base font-bold text-slate-400 mb-1">Empieza a escribir</h3>
              <p className="text-xs text-slate-300">Busca por ubicación, SKU o descripción para ver resultados</p>
            </div>
          ) : loading && filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28">
              <div className="w-11 h-11 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mb-5" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando datos...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28">
              <Layers size={40} className="text-slate-200 mb-4" />
              <h3 className="text-base font-bold text-slate-400 mb-1">Sin resultados</h3>
              <p className="text-xs text-slate-300">No se encontró "{search}"</p>
            </div>
          ) : (
            <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualizer.getVirtualItems().map(virtualRow => {
                const group = filteredGroups[virtualRow.index];
                return (
                  <div
                    key={group.ubicacion}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className="absolute top-0 left-0 w-full"
                    style={{ transform: `translateY(${virtualRow.start}px)`, paddingBottom: '8px' }}
                  >
                    <LocationGroup
                      group={group}
                      searchQuery={search}
                      isExpanded={expandedKeys.has(group.ubicacion)}
                      onToggle={() => toggleExpand(group.ubicacion)}
                      flagForItem={flagForItem}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WmsLocations;
