import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, X, Download, RefreshCw,
  Database, Zap, Archive, ArrowRight
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWarehouseStore } from '../../store/warehouseStore';

const ROW_HEIGHT = 88;

const LocationRow = React.memo(({ item }) => {
  const parts = item.ubicacion?.split('-') || [];

  return (
    <div className="group bg-white border border-slate-200 rounded-[2rem] p-4 flex items-center justify-between hover:shadow-2xl hover:shadow-orange-900/5 transition-all duration-300 hover:-translate-x-1">
      <div className="flex items-center gap-6 min-w-[240px]">
        <div className="w-16 h-16 rounded-3xl bg-[#1A1C1E] flex flex-col items-center justify-center text-white shadow-xl group-hover:bg-orange-600 transition-colors">
          <span className="text-[8px] font-black uppercase tracking-tighter opacity-50 mb-0.5">Posición</span>
          <span className="text-xl font-black tracking-tighter leading-none">{item.ubicacion}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{item.codigo}</span>
          <h4 className="text-base font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">{item.descripcion}</h4>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-12 flex-1 px-12">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pasillo</span>
          <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">{parts[0]}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nivel</span>
          <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">{parts[1]}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Columna</span>
          <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">{parts[2]}</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Disponible</span>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-black text-[#1A1C1E] tracking-tighter leading-none">{item.cantidad || 0}</span>
            <Zap size={20} className={`text-emerald-500 ${item.cantidad > 0 ? 'animate-pulse' : 'opacity-20'}`} />
          </div>
        </div>

        <div className="w-[1px] h-12 bg-slate-100 mx-2" />

        <button className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-[#1A1C1E] hover:text-white transition-all shadow-sm">
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
});

const WmsLocations = () => {
  const { inventory, stats, loading, fetchWarehouseData } = useWarehouseStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeAisle, setActiveAisle] = useState('Todos');
  const parentRef = useRef(null);

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(handler);
  }, [search]);

  const allItems = useMemo(() => Object.values(inventory).flat(), [inventory]);

  const aisles = useMemo(() => {
    const unique = new Set(allItems.map(item => (item.ubicacion || '').split('-')[0]).filter(Boolean));
    return ['Todos', ...Array.from(unique).sort()];
  }, [allItems]);

  const filteredData = useMemo(() => {
    let result = allItems;
    if (activeAisle !== 'Todos') {
      result = result.filter(item => (item.ubicacion || '').startsWith(activeAisle));
    }
    const q = debouncedSearch.toLowerCase().trim();
    if (q) {
      result = result.filter(item =>
        (item.ubicacion || '').toLowerCase().includes(q) ||
        (item.codigo || '').toLowerCase().includes(q) ||
        (item.descripcion || '').toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => (a.ubicacion || '').localeCompare(b.ubicacion || ''));
  }, [allItems, debouncedSearch, activeAisle]);

  const totalStock = useMemo(() =>
    filteredData.reduce((acc, curr) => acc + (curr.cantidad || 0), 0),
  [filteredData]);

  const virtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + 16,
    overscan: 10,
  });

  const exportCSV = useCallback(() => {
    const headers = ['Ubicacion', 'Codigo', 'Descripcion', 'Cantidad'];
    const rows = filteredData.map(item => [
      `"${item.ubicacion}"`,
      `"${item.codigo}"`,
      `"${item.descripcion}"`,
      item.cantidad
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WMS_INVENTARIO_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-[#F1F3F6] text-[#1A1C1E] font-jakarta flex overflow-hidden">

      <aside className="w-[100px] bg-[#1A1C1E] flex flex-col items-center py-10 z-50 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mb-12 shadow-lg shadow-orange-900/20">
          <Database size={24} className="text-white" />
        </div>

        <div className="flex-1 flex flex-col gap-4 w-full px-2 overflow-y-auto no-scrollbar">
          {aisles.map(aisle => (
            <button
              key={aisle}
              onClick={() => setActiveAisle(aisle)}
              className={`w-full py-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeAisle === aisle ? 'bg-orange-500 text-white shadow-xl scale-105' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">Pasillo</span>
              <span className="text-xl font-black leading-none">{aisle === 'Todos' ? 'ALL' : aisle}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        <header className="h-28 bg-white border-b border-slate-200 flex items-center justify-between px-12 shrink-0 z-40 shadow-sm">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <h1 className="text-3xl font-black tracking-tighter text-[#1A1C1E] leading-none mb-2">EXPLORADOR WMS</h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-200">Sincronizado</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bodega Principal</span>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-8 bg-slate-50 px-8 py-4 rounded-[2rem] border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resultados</span>
                <span className="text-xl font-black text-slate-900 leading-none">{filteredData.length}</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock Total</span>
                <span className="text-xl font-black text-orange-600 leading-none">{totalStock.toLocaleString()}</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ocupación</span>
                <span className="text-xl font-black text-blue-600 leading-none">{stats.ocupacion}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={exportCSV}
              className="group flex items-center gap-3 bg-[#1A1C1E] text-white px-8 py-4 rounded-[1.5rem] text-sm font-black hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
              DESCARGAR INVENTARIO
            </button>
            <button
              onClick={() => fetchWarehouseData()}
              className="w-14 h-14 flex items-center justify-center bg-white border-2 border-slate-100 rounded-[1.5rem] text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all active:rotate-180 duration-500 shadow-sm"
            >
              <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        <div className="bg-white px-12 py-8 border-b border-slate-200 shadow-sm z-30">
          <div className="relative flex items-center group">
            <div className="absolute left-8 text-slate-300 group-focus-within:text-orange-500 transition-colors">
              <Search size={28} strokeWidth={3} />
            </div>
            <input
              type="text"
              placeholder="Escribe para buscar ubicación, SKU o descripción..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] pl-20 pr-12 py-7 text-2xl font-bold text-[#1A1C1E] placeholder-slate-300 focus:bg-white focus:border-orange-500 focus:shadow-2xl focus:shadow-orange-100 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-8 w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <main ref={parentRef} className="flex-1 overflow-y-auto px-12 py-10 no-scrollbar bg-[#F1F3F6]">

          {loading && filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-20 h-20 border-8 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-8" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Analizando Datos Reales...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-slate-200 shadow-inner mx-auto max-w-4xl">
              <Archive size={64} className="text-slate-200 mb-8" />
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Sin Coincidencias</h3>
              <p className="text-lg font-bold text-slate-400 tracking-tight">No encontramos nada con &quot;{search}&quot; en el pasillo {activeAisle}.</p>
            </div>
          ) : (
            <div
              className="max-w-[1600px] mx-auto relative"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {virtualizer.getVirtualItems().map(virtualRow => (
                <div
                  key={virtualRow.key}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: '16px',
                  }}
                >
                  <LocationRow item={filteredData[virtualRow.index]} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WmsLocations;
