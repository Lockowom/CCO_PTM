import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, X, Download, MapPin, Box, RefreshCw, 
  Filter, ChevronRight, LayoutGrid, List, ArrowUpDown, 
  ExternalLink, Layers, MoreHorizontal
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useWarehouseStore } from '../../store/warehouseStore';

const WmsLocations = () => {
  const { inventory, loading, fetchWarehouseData } = useWarehouseStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' is more 'detailed' for enterprise
  const [activeAisle, setActiveAisle] = useState('Todos');

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 100);
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

  useGSAP(() => {
    gsap.fromTo('.data-row', 
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.01, ease: 'power2.out' }
    );
  }, [filteredData.length, viewMode]);

  const exportCSV = () => {
    const headers = ['Ubicacion', 'Codigo', 'Descripcion', 'Cantidad'];
    const rows = filteredData.map(item => [
      item.ubicacion,
      item.codigo,
      item.descripcion,
      item.cantidad
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `wms_ubicaciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-slate-900 font-jakarta flex selection:bg-orange-100 selection:text-orange-700">
      
      {/* Dynamic Command Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[88px] bg-white border-r border-slate-100 flex flex-col items-center py-10 z-50">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 mb-12 flex items-center justify-center shadow-2xl shadow-slate-200 group cursor-pointer active:scale-95 transition-all">
          <Layers size={24} className="text-white group-hover:rotate-12 transition-transform" />
        </div>
        <nav className="flex-1 flex flex-col gap-10">
          {[
            { icon: Box, label: 'WMS', active: true },
            { icon: MapPin, label: 'MAPA', active: false },
            { icon: RefreshCw, label: 'SYNC', active: false },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className={`p-4 rounded-2xl transition-all ${item.active ? 'bg-orange-50 text-orange-600 shadow-inner' : 'text-slate-300 group-hover:text-slate-500'}`}>
                <item.icon size={22} strokeWidth={2.5} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${item.active ? 'text-orange-600' : 'text-slate-300'}`}>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Interface */}
      <div className="flex-1 ml-[88px] flex flex-col h-screen overflow-hidden">
        
        {/* Dynamic Header */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-12 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <div className="w-1 h-12 bg-orange-500 rounded-full" />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">CENTRO DE UBICACIONES</h1>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="text-orange-500">PRODUCCIÓN</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span>BODEGA PRINCIPAL</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={exportCSV}
              className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <Download size={18} /> EXPORTAR REPORTE
            </button>
            <div className="w-[1px] h-8 bg-slate-100 mx-2" />
            <button 
              onClick={() => fetchWarehouseData()}
              className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-orange-600 transition-all hover:shadow-lg active:scale-90"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Command Center Bar */}
        <div className="bg-white border-b border-slate-100 px-12 py-6 flex flex-col gap-6 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4">
            {/* Search Engine */}
            <div className="flex-1 relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-50 transition-all group">
              <Search className="text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Busca por ubicación, SKU o descripción técnica..."
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-slate-900 placeholder-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* View Toggles */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}><List size={20} /></button>
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
            </div>
          </div>

          {/* Aisle Quick Selector */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
              <Filter size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">PASILLO</span>
            </div>
            {aisles.map(aisle => (
              <button 
                key={aisle}
                onClick={() => setActiveAisle(aisle)}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap ${activeAisle === aisle ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
              >
                {aisle}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto px-12 py-10 no-scrollbar bg-[#fafafa]/50">
          
          {loading && filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-6" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Analizando Inventario...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6">
                <Search size={32} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">SIN COINCIDENCIAS</h3>
              <p className="text-sm font-bold text-slate-400">Prueba con otro SKU o selecciona un pasillo diferente.</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden mb-20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localización</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto / Identificador</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock Disp.</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((item, idx) => (
                    <tr key={idx} className="data-row group hover:bg-orange-50/30 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                            <MapPin size={16} />
                          </div>
                          <span className="text-lg font-black text-slate-900 tracking-tighter group-hover:text-orange-600 transition-colors">
                            {item.ubicacion}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 max-w-[450px]">
                          <span className="text-xs font-black text-orange-600 bg-orange-50 w-fit px-2 py-0.5 rounded-md border border-orange-100 uppercase tracking-tight">
                            {item.codigo}
                          </span>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">
                            {item.descripcion}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{item.cantidad || 0}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase mt-1">unidades</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-300 shadow-sm transition-all"><Edit2 size={16} /></button>
                          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-300 shadow-sm transition-all"><ExternalLink size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pb-32">
              {filteredData.map((item, idx) => (
                <div key={idx} className="data-row group bg-white border border-slate-100 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-mono text-xs font-black shadow-lg">
                        {item.ubicacion}
                      </span>
                      <button className="text-slate-300 hover:text-orange-600 transition-colors"><MoreHorizontal size={20} /></button>
                    </div>
                    <div className="mb-8 min-h-[70px]">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">{item.codigo}</p>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{item.descripcion}</h4>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">STOCK</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{item.cantidad || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner">
                        <Box size={22} />
                      </div>
                    </div>
                  </div>
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
