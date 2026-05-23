import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, X, Download, RefreshCw, Package,
  ChevronDown, Layers, Box, Filter, ArrowUpDown
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWarehouseStore } from '../../store/warehouseStore';

const ROW_HEIGHT = 64;

/* ── SKU detail row inside expanded location ── */
const SkuRow = React.memo(({ item }) => (
  <div className="flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-orange-50/50 transition-colors">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
        <Box size={13} className="text-orange-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-slate-800 truncate">{item.descripcion || '—'}</p>
        <p className="text-[11px] text-slate-400 font-medium">{item.codigo}</p>
      </div>
    </div>
    <div className="flex items-center gap-5 shrink-0 text-[11px] text-slate-500 font-medium">
      {item.talla && <span className="hidden md:block bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold">{item.talla}</span>}
      {item.color && <span className="hidden md:block bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold">{item.color}</span>}
      {item.partida && <span className="hidden lg:block text-slate-400 truncate max-w-[90px]">{item.partida}</span>}
      <span className={`text-base font-bold tabular-nums min-w-[40px] text-right ${item.cantidad > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
        {item.cantidad || 0}
      </span>
    </div>
  </div>
));

/* ── Location Row ── */
const LocationRow = React.memo(({ location, isExpanded, onToggle }) => {
  const parts = location.ubicacion?.split('-') || [];
  const skuCount = location.items?.length || 0;
  const totalQty = location.totalStock || 0;
  const hasStock = totalQty > 0;

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      isExpanded
        ? 'bg-white border-orange-200 shadow-md'
        : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
    }`}>
      <button onClick={onToggle} className="w-full px-4 py-3 flex items-center gap-4 text-left">
        {/* Status dot + Location */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className={`w-2 h-2 rounded-full shrink-0 ${hasStock ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          <span className="text-[15px] font-bold text-slate-900 tracking-tight font-mono">{location.ubicacion}</span>
        </div>

        {/* Rack breakdown */}
        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400 font-medium min-w-[180px]">
          <span>Rack <strong className="text-slate-600">{parts[0]}</strong></span>
          <span>Niv <strong className="text-slate-600">{parts[1]}</strong></span>
          <span>Pos <strong className="text-slate-600">{parts[2]}</strong></span>
        </div>

        {/* First product preview */}
        <div className="flex-1 min-w-0 hidden lg:block">
          <p className="text-[12px] text-slate-400 truncate">
            {location.items?.[0]?.descripcion || '—'}
            {skuCount > 1 && <span className="text-slate-300 ml-1">+{skuCount - 1} más</span>}
          </p>
        </div>

        {/* SKU count */}
        <div className="flex items-center gap-1.5 min-w-[60px] justify-end">
          <Layers size={13} className="text-slate-300" />
          <span className="text-[12px] font-semibold text-slate-500 tabular-nums">{skuCount}</span>
        </div>

        {/* Stock total */}
        <div className="min-w-[70px] text-right">
          <span className={`text-lg font-bold tabular-nums ${hasStock ? 'text-slate-900' : 'text-slate-200'}`}>
            {totalQty.toLocaleString()}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown size={16} className={`text-slate-300 transition-transform shrink-0 ${isExpanded ? 'rotate-180 text-orange-500' : ''}`} />
      </button>

      {isExpanded && location.items && (
        <div className="border-t border-slate-100 px-3 py-2 bg-slate-50/60">
          <div className="flex items-center justify-between px-4 py-1.5 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productos en {location.ubicacion}</span>
            <span className="text-[10px] font-bold text-slate-400">{skuCount} item{skuCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-0.5 max-h-[280px] overflow-y-auto custom-scrollbar-flat">
            {location.items.map((item, idx) => (
              <SkuRow key={item.id || idx} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

/* ── Main Component ── */
const WmsLocations = () => {
  const { inventory, stats, loading, fetchWarehouseData } = useWarehouseStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [activeAisle, setActiveAisle] = useState('Todos');
  const [stockFilter, setStockFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('ubicacion');
  const [sortDir, setSortDir] = useState('asc');
  const parentRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => { fetchWarehouseData(); }, [fetchWarehouseData]);

  // URL search param sync
  useEffect(() => {
    const s = searchParams.get('search');
    if (s && s !== search) { setSearch(s); setDebouncedSearch(s); }
  }, []);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setSearchParams(search ? { search } : {}, { replace: true });
    }, 150);
    return () => clearTimeout(t);
  }, [search]);

  // Keyboard: Ctrl+K to focus, Esc to clear
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && e.target.tagName !== 'INPUT')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') { searchRef.current?.blur(); setSearch(''); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Group items by normalized location
  const groupedLocations = useMemo(() => {
    const all = Object.values(inventory).flat();
    const map = {};
    all.forEach(item => {
      const loc = item.ubicacion || 'SIN-UBI';
      if (!map[loc]) map[loc] = { ubicacion: loc, items: [], totalStock: 0 };
      map[loc].items.push(item);
      map[loc].totalStock += (Number(item.cantidad) || 0);
    });
    return Object.values(map);
  }, [inventory]);

  const aisles = useMemo(() => {
    const set = new Set(groupedLocations.map(l => l.ubicacion.split('-')[0]).filter(Boolean));
    return ['Todos', ...Array.from(set).sort()];
  }, [groupedLocations]);

  // Filter + search + sort
  const filteredData = useMemo(() => {
    let r = groupedLocations;
    if (activeAisle !== 'Todos') r = r.filter(l => l.ubicacion.startsWith(activeAisle + '-'));
    if (stockFilter === 'stock') r = r.filter(l => l.totalStock > 0);
    else if (stockFilter === 'empty') r = r.filter(l => l.totalStock === 0);

    const q = debouncedSearch.toLowerCase().trim();
    if (q) {
      const terms = q.split(/\s+/);
      r = r.filter(loc => {
        const h = [loc.ubicacion, ...loc.items.map(i => `${i.codigo} ${i.descripcion} ${i.talla||''} ${i.color||''} ${i.partida|''}`)].join(' ').toLowerCase();
        return terms.every(t => h.includes(t));
      });
    }

    r.sort((a, b) => {
      let c = 0;
      if (sortBy === 'stock') c = a.totalStock - b.totalStock;
      else if (sortBy === 'skus') c = a.items.length - b.items.length;
      else c = a.ubicacion.localeCompare(b.ubicacion);
      return sortDir === 'desc' ? -c : c;
    });
    return r;
  }, [groupedLocations, debouncedSearch, activeAisle, stockFilter, sortBy, sortDir]);

  const filteredStats = useMemo(() => ({
    locations: filteredData.length,
    totalStock: filteredData.reduce((a, l) => a + l.totalStock, 0),
    skus: filteredData.reduce((a, l) => a + l.items.length, 0),
  }), [filteredData]);

  const virtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => {
      if (filteredData[i]?.ubicacion === expandedId) {
        const n = filteredData[i].items?.length || 0;
        return ROW_HEIGHT + Math.min(n * 42 + 56, 340) + 8;
      }
      return ROW_HEIGHT + 6;
    },
    overscan: 10,
  });

  useEffect(() => { virtualizer.measure(); }, [expandedId]);

  const cycleSort = useCallback(() => {
    const order = ['ubicacion', 'stock', 'skus'];
    const idx = order.indexOf(sortBy);
    if (sortDir === 'asc') { setSortDir('desc'); }
    else { setSortDir('asc'); setSortBy(order[(idx + 1) % order.length]); }
  }, [sortBy, sortDir]);

  const exportCSV = useCallback(() => {
    const headers = ['Ubicacion', 'Codigo', 'Descripcion', 'Cantidad', 'Talla', 'Color', 'Partida'];
    const rows = [];
    filteredData.forEach(loc => loc.items.forEach(item => {
      rows.push([
        `"${loc.ubicacion}"`, `"${item.codigo || ''}"`,
        `"${(item.descripcion || '').replace(/"/g, '""')}"`,
        item.cantidad || 0, `"${item.talla || ''}"`,
        `"${item.color || ''}"`, `"${item.partida || ''}"`,
      ]);
    }));
    const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WMS_INVENTARIO_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredData]);

  const sortLabel = sortBy === 'stock' ? 'Stock' : sortBy === 'skus' ? 'SKUs' : 'Ubicación';

  return (
    <div className="h-screen bg-[#F4F5F7] flex overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-16 bg-slate-900 flex flex-col items-center py-4 shrink-0 z-50">
        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center mb-5">
          <Package size={18} className="text-white" />
        </div>

        <div className="flex-1 flex flex-col gap-1 w-full px-1.5 overflow-y-auto no-scrollbar">
          {aisles.map(aisle => {
            const isActive = activeAisle === aisle;
            return (
              <button
                key={aisle}
                onClick={() => { setActiveAisle(aisle); setExpandedId(null); }}
                title={aisle === 'Todos' ? 'Todos los pasillos' : `Rack ${aisle}`}
                className={`w-full py-2 rounded-lg text-center transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <span className="text-[13px] font-bold leading-none block">{aisle === 'Todos' ? 'All' : aisle}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* ── Top bar ── */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 z-40">
          <div className="max-w-[1400px] mx-auto space-y-3">

            {/* Row 1: Title + actions */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Explorador de Ubicaciones</h1>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {stats.ocupacion}% ocupación • {filteredStats.locations} ubicaciones • {filteredStats.skus.toLocaleString()} registros • {filteredStats.totalStock.toLocaleString()} unidades
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-900 text-white pl-4 pr-5 py-2.5 rounded-xl text-[12px] font-bold hover:bg-orange-600 transition-colors active:scale-95">
                  <Download size={15} />
                  Exportar
                </button>
                <button onClick={() => fetchWarehouseData()} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-orange-500 hover:border-orange-300 transition-all active:rotate-180 duration-500">
                  <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Row 2: Search */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar por ubicación, SKU, descripción, talla, color..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-24 py-3 text-sm font-medium text-slate-900 placeholder-slate-300 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {search && (
                  <button onClick={() => { setSearch(''); searchRef.current?.focus(); }} className="w-7 h-7 rounded-md bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                    <X size={13} />
                  </button>
                )}
                <kbd className="hidden sm:block text-[10px] font-semibold text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
              </div>
            </div>

            {/* Row 3: Filters */}
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'stock', label: 'Con stock' },
                  { key: 'empty', label: 'Vacías' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setStockFilter(f.key)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                      stockFilter === f.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button onClick={cycleSort} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-500 hover:border-orange-300 hover:text-orange-600 transition-colors">
                <ArrowUpDown size={13} />
                {sortLabel} {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </header>

        {/* ── Table header ── */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 shrink-0">
          <div className="max-w-[1400px] mx-auto flex items-center py-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="min-w-[180px]">Ubicación</span>
            <span className="hidden md:block min-w-[180px]">Desglose</span>
            <span className="flex-1 hidden lg:block">Producto</span>
            <span className="min-w-[60px] text-right">SKUs</span>
            <span className="min-w-[70px] text-right">Stock</span>
            <span className="w-5" />
          </div>
        </div>

        {/* ── Virtual list ── */}
        <main ref={parentRef} className="flex-1 overflow-y-auto px-6 py-4 bg-[#F4F5F7]">
          {loading && filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28">
              <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-400">Cargando inventario...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200 mx-auto max-w-lg">
              <Search size={40} className="text-slate-200 mb-4" />
              <h3 className="text-base font-bold text-slate-900 mb-1">Sin resultados</h3>
              <p className="text-sm text-slate-400 mb-3">No hay coincidencias para tu búsqueda</p>
              <button onClick={() => { setSearch(''); setActiveAisle('Todos'); setStockFilter('all'); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="max-w-[1400px] mx-auto relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualizer.getVirtualItems().map(vr => {
                const loc = filteredData[vr.index];
                return (
                  <div
                    key={vr.key}
                    className="absolute top-0 left-0 w-full"
                    style={{ height: `${vr.size}px`, transform: `translateY(${vr.start}px)`, paddingBottom: '6px' }}
                  >
                    <LocationRow
                      location={loc}
                      isExpanded={expandedId === loc.ubicacion}
                      onToggle={() => setExpandedId(p => p === loc.ubicacion ? null : loc.ubicacion)}
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
