import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, Grid as GridIcon, List as ListIcon, HelpCircle, Bell, TrendingUp, TrendingDown, Download, MapPin, Box, Hash, Trash2, Edit2, Layers } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Mock Data (100 items)
const generateMockData = () => {
  const aisles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const data = [];
  for (let i = 1; i <= 100; i++) {
    const aisle = aisles[Math.floor(Math.random() * aisles.length)];
    const col = String(Math.floor(Math.random() * 50) + 1).padStart(2, '0');
    const level = String(Math.floor(Math.random() * 5) + 1).padStart(2, '0');
    data.push({
      id: `item-${i}`,
      location: `${aisle}${col}-${level}`,
      code: `SKU-${Math.floor(Math.random() * 90000) + 10000}`,
      desc: `Producto Premium ${i} - Variante ${['Alpha', 'Beta', 'Gamma', 'Delta'][Math.floor(Math.random() * 4)]}`,
      qty: Math.floor(Math.random() * 200) + 1,
      size: ['S', 'M', 'L', 'XL', 'XXL'][Math.floor(Math.random() * 5)],
      color: ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde'][Math.floor(Math.random() * 5)],
    });
  }
  return data;
};

const MOCK_DATA = generateMockData();

const WmsLocations = () => {
  const [data, setData] = useState(MOCK_DATA);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todo');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [groupByAisle, setGroupByAisle] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 60);
    return () => clearTimeout(handler);
  }, [search]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('wms-search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setSearch('');
        document.getElementById('wms-search-input')?.blur();
      }
      if (e.key.toLowerCase() === 'g' && document.activeElement.tagName !== 'INPUT') {
        setViewMode('grid');
      }
      if (e.key.toLowerCase() === 'l' && document.activeElement.tagName !== 'INPUT') {
        setViewMode('list');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    let result = data;
    const q = debouncedSearch.toLowerCase();
    
    if (q) {
      result = result.filter(item => {
        if (activeFilter === 'Ubicación') return item.location.toLowerCase().includes(q);
        if (activeFilter === 'Código SKU') return item.code.toLowerCase().includes(q);
        if (activeFilter === 'Descripción') return item.desc.toLowerCase().includes(q);
        // 'Todo'
        return item.location.toLowerCase().includes(q) || 
               item.code.toLowerCase().includes(q) || 
               item.desc.toLowerCase().includes(q);
      });
    }

    if (groupByAisle) {
      result = [...result].sort((a, b) => a.location.localeCompare(b.location));
    }

    return result;
  }, [data, debouncedSearch, activeFilter, groupByAisle]);

  // Entrance Animations
  useGSAP(() => {
    gsap.fromTo('.stagger-item', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
    );
  }, [viewMode, groupByAisle]);

  // Highlight helper
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
            <span key={i} className="bg-wms-accent/30 text-wms-accent rounded px-0.5">{part}</span> : part
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-wms-void text-slate-200 font-jakarta flex selection:bg-wms-accent/30 selection:text-wms-accent">
      
      {/* Sidebar (72px) */}
      <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-wms-base border-r border-[var(--border-10)] flex flex-col items-center py-6 z-50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 mb-8 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
          <Box size={20} className="text-white" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-4 w-full">
          {[
            { icon: MapPin, active: true, label: 'Ubicaciones' },
            { icon: Box, active: false, label: 'Inventario' },
            { icon: TrendingUp, active: false, label: 'Flujos' },
          ].map((item, i) => (
            <div key={i} className="relative group w-full flex justify-center cursor-pointer">
              {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-wms-accent rounded-r shadow-[0_0_10px_var(--color-accent)]" />}
              <button className={`p-3 rounded-xl transition-all duration-200 ${item.active ? 'bg-wms-elevated text-wms-accent' : 'text-slate-500 hover:text-slate-300 hover:bg-wms-surface'}`}>
                <item.icon size={22} />
              </button>
              {/* Tooltip */}
              <div className="absolute left-[76px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-wms-elevated border border-[var(--border-14)] rounded-lg text-xs font-semibold text-white opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-xl whitespace-nowrap">
                {item.label}
              </div>
            </div>
          ))}
        </nav>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-[var(--border-14)] overflow-hidden p-0.5 cursor-pointer hover:border-wms-accent transition-colors">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=transparent`} alt="User" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-[72px] flex flex-col h-screen overflow-hidden">
        
        {/* Topbar (68px) */}
        <header className="sticky top-0 h-[68px] z-40 bg-[rgba(12,14,18,0.85)] backdrop-blur-[24px] saturate-[180%] border-b border-[var(--border-7)] flex items-center justify-between px-8">
          <div className="flex items-center text-sm font-medium text-slate-400">
            <span>WMS</span>
            <span className="mx-2 text-slate-600">/</span>
            <span>Bodega Principal</span>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-white font-bold tracking-wide">Ubicaciones</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors"><HelpCircle size={20} /></button>
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-wms-base">3</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar relative">
          {/* Hero Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-wms-accent opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

          {/* Hero Section */}
          <div className="mb-10 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wms-accent/10 border border-wms-accent/20 text-wms-accent text-xs font-bold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-wms-accent animate-pulse" />
              SISTEMA EN VIVO
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent mb-2">
              Gestor de Ubicaciones
            </h1>
            <p className="text-slate-400 text-lg">Administra, rastrea y optimiza el layout físico de la bodega en tiempo real.</p>
          </div>

          {/* Search & Filters */}
          <div className="mb-10">
            <div className={`relative flex items-center w-full max-w-3xl bg-wms-surface rounded-2xl border transition-all duration-300 ${isSearchFocused ? 'border-wms-accent shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_4px_24px_rgba(16,185,129,0.1)]' : 'border-[var(--border-10)] hover:border-[var(--border-14)]'}`}>
              <Search className={`ml-4 ${isSearchFocused ? 'text-wms-accent' : 'text-slate-500'} transition-colors`} size={20} />
              <input 
                id="wms-search-input"
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 px-4 py-4 font-medium"
                placeholder="Buscar por ubicación, SKU o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <div className="pr-4 flex items-center gap-2">
                {search ? (
                  <button onClick={() => setSearch('')} className="p-1 text-slate-500 hover:text-red-400 bg-wms-elevated rounded-md transition-colors"><X size={16} /></button>
                ) : (
                  <kbd className="hidden sm:inline-block px-2 py-1 bg-wms-elevated border border-[var(--border-10)] rounded text-[10px] font-mono text-slate-500 font-bold">
                    / para buscar
                  </kbd>
                )}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['Todo', 'Ubicación', 'Código SKU', 'Descripción'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                    activeFilter === filter 
                      ? 'bg-wms-accent/10 border-wms-accent/30 text-wms-accent shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                      : 'bg-wms-surface border-[var(--border-7)] text-slate-400 hover:text-slate-200 hover:bg-wms-elevated'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Resultados', value: filteredData.length, icon: Hash, delta: '+12', up: true },
              { label: 'Total Unidades', value: filteredData.reduce((acc, curr) => acc + curr.qty, 0).toLocaleString(), icon: Box, delta: '+5%', up: true },
              { label: 'Pasillos Activos', value: new Set(filteredData.map(d => d.location[0])).size, icon: MapPin, delta: '0', up: true },
              { label: 'Ocupación', value: '84%', icon: Layers, delta: '-2%', up: false }, // Use imported icon later if needed, Box for now
            ].map((stat, i) => (
              <div key={i} className="group relative bg-wms-surface border border-[var(--border-10)] rounded-2xl p-5 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-wms-accent/0 via-wms-accent to-wms-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-semibold text-slate-400">{stat.label}</span>
                  <div className="p-2 bg-wms-elevated rounded-lg text-slate-300 group-hover:text-wms-accent group-hover:bg-wms-accent/10 transition-colors">
                    <stat.icon size={18} />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-black text-white font-mono tracking-tight">{stat.value}</h3>
                  <span className={`flex items-center text-xs font-bold mb-1 ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.up ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                    {stat.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-[var(--border-7)]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setGroupByAisle(!groupByAisle)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${groupByAisle ? 'bg-wms-accent text-wms-void border-wms-accent' : 'bg-wms-surface text-slate-300 border-[var(--border-10)] hover:bg-wms-elevated'}`}
              >
                Agrupar Pasillos
              </button>
              <div className="flex bg-wms-surface border border-[var(--border-10)] rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-wms-elevated text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><GridIcon size={18} /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-wms-elevated text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><ListIcon size={18} /></button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500"><strong className="text-white">{filteredData.length}</strong> registros</span>
              <button className="flex items-center gap-2 bg-wms-accent/10 hover:bg-wms-accent text-wms-accent hover:text-wms-void border border-wms-accent/30 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_0_15px_var(--glow-accent-subtle)] hover:shadow-[0_0_20px_var(--glow-accent-strong)]">
                <Download size={16} /> Exportar CSV
              </button>
            </div>
          </div>

          {/* Content Area */}
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center stagger-item">
              <div className="w-24 h-24 rounded-full bg-wms-surface border border-[var(--border-14)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <Search size={40} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron resultados</h3>
              <p className="text-slate-400 max-w-md">Prueba ajustando los filtros o cambiando el término de búsqueda para "{search}".</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 pb-10">
              {filteredData.map((item) => (
                <div key={item.id} className="stagger-item group relative bg-wms-surface border border-[var(--border-7)] hover:border-[var(--border-14)] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-wms-base to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-wms-accent/10 text-wms-accent font-mono text-sm font-black tracking-wider border border-wms-accent/20">
                      {highlightText(item.location, debouncedSearch)}
                    </span>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                      <button className="p-1.5 bg-wms-elevated hover:bg-slate-700 text-slate-300 rounded-md transition-colors"><Edit2 size={14} /></button>
                      <button className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* SKU & Desc */}
                  <div className="mb-5">
                    <div className="text-lg font-mono font-bold text-white mb-1 tracking-tight">
                      {highlightText(item.code, debouncedSearch)}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {highlightText(item.desc, debouncedSearch)}
                    </p>
                  </div>

                  {/* Metrics Footer */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-7)]">
                    <div className="flex-1 bg-wms-elevated rounded-lg px-3 py-2 border border-[var(--border-4)]">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Cant</div>
                      <div className="text-sm font-mono font-bold text-white">{item.qty}</div>
                    </div>
                    <div className="flex-1 bg-wms-elevated rounded-lg px-3 py-2 border border-[var(--border-4)]">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Talla</div>
                      <div className="text-sm font-mono font-bold text-white">{item.size}</div>
                    </div>
                    <div className="flex-1 bg-wms-elevated rounded-lg px-3 py-2 border border-[var(--border-4)]">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Color</div>
                      <div className="text-sm font-bold text-slate-300">{item.color}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-wms-surface border border-[var(--border-10)] rounded-2xl overflow-hidden pb-10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-wms-elevated/50 border-b border-[var(--border-10)] text-xs uppercase font-bold text-slate-400 tracking-wider">
                      <th className="px-6 py-4 font-jakarta">Ubicación</th>
                      <th className="px-6 py-4 font-jakarta">Código SKU</th>
                      <th className="px-6 py-4 font-jakarta hidden md:table-cell">Descripción</th>
                      <th className="px-6 py-4 font-jakarta">Cantidad</th>
                      <th className="px-6 py-4 font-jakarta hidden sm:table-cell">Talla / Color</th>
                      <th className="px-6 py-4 font-jakarta text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-4)]">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="stagger-item group hover:bg-wms-elevated transition-colors">
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded bg-wms-accent/10 text-wms-accent font-mono text-sm font-black border border-wms-accent/20">
                            {highlightText(item.location, debouncedSearch)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-200">
                           {highlightText(item.code, debouncedSearch)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 hidden md:table-cell max-w-[200px] truncate">
                           {highlightText(item.desc, debouncedSearch)}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-white">
                          {item.qty}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">
                          {item.size} • {item.color}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md transition-colors"><Edit2 size={16} /></button>
                              <button className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-md transition-colors"><Trash2 size={16} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default WmsLocations;