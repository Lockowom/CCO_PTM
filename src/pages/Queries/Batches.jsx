import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  Search, Barcode, Box, Package, Layers, Scale, MapPin, 
  RefreshCw, Download, ChevronRight, FileSpreadsheet, Activity, X,
  Command, Filter, Zap, Clock, ShieldCheck
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import gsap from 'gsap';
import StockFreshness from '../../components/StockFreshness';
import { STOCK_TABLES } from '../../hooks/useStockFreshness';

// Componente para resaltar el texto buscado
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <span>{text}</span>;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300 text-black font-black px-1 rounded-[3px] ring-1 ring-yellow-500 shadow-sm">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const Batches = () => {
  const containerRef = useRef(null);
  // ?q= permite llegar con la búsqueda pre-cargada (Command Palette → producto).
  const initialQ = (new URLSearchParams(window.location.search).get('q') || '').trim();
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [submittedTerm, setSubmittedTerm] = useState(initialQ);
  const [activeTab, setActiveTab] = useState('partidas');
  const [subFilter, setSubFilter] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Animación del fondo sutil y elementos decorativos
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Entrada inicial coordinada
      const tl = gsap.timeline();
      tl.from(".animate-header", { 
        y: -50, 
        opacity: 0, 
        duration: 1.2, 
        ease: "expo.out" 
      })
      .from(".animate-search", { 
        scale: 0.9, 
        opacity: 0, 
        duration: 1, 
        ease: "elastic.out(1, 0.75)" 
      }, "-=0.8")
      .from(".animate-decor", { 
        opacity: 0, 
        duration: 2 
      }, "-=0.5");

      // Orbes flotantes con movimiento orgánico
      gsap.to(".bg-orb-1", {
        x: "random(-100, 100)",
        y: "random(-50, 50)",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".bg-orb-2", {
        x: "random(-100, 100)",
        y: "random(-50, 50)",
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".bg-orb-3", {
        x: "random(-50, 50)",
        y: "random(-100, 100)",
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Animación de entrada solo para las primeras 15 filas (evita lag con datasets grandes)
  useLayoutEffect(() => {
    if (submittedTerm) {
      const items = document.querySelectorAll(".result-item");
      if (items.length > 0) {
        const limited = Array.from(items).slice(0, 15);
        gsap.fromTo(limited,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.02, ease: "power2.out", clearProps: "all" }
        );
      }
    }
  }, [submittedTerm, activeTab]);

  // Auto-búsqueda (500ms debounce — era 300ms, causaba demasiadas queries)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.trim().length >= 2) {
        setSubmittedTerm(searchTerm.trim());
      } else if (!searchTerm.trim()) {
        setSubmittedTerm('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['batches_search_v3', submittedTerm],
    queryFn: async () => {
      // 1 SOLA llamada RPC que busca en las 4 tablas + fuzzy server-side.
      // p_limit por tabla: subido a 2000 para que un producto con muchas series
      // (p.ej. buscar por su código) muestre TODAS y no se corte en 150.
      const { data, error } = await supabase.rpc('search_batches', {
        p_query: submittedTerm.trim(),
        p_limit: 2000
      });
      if (error) throw error;
      return data || { partidas: [], series: [], farmapack: [], pesos: [] };
    },
    enabled: !!submittedTerm,
  });

  const currentData = data || { partidas: [], series: [], farmapack: [], pesos: [] };
  const searched = !!submittedTerm;

  const TABS = [
    { id: 'partidas', label: 'Partidas / Lotes', icon: Layers, color: 'orange' },
    { id: 'series', label: 'Series / SN', icon: Barcode, color: 'amber' },
    { id: 'farmapack', label: 'Farmapack', icon: Package, color: 'emerald' },
    { id: 'pesos', label: 'Pesos / Cubicaje', icon: Scale, color: 'blue' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSubmittedTerm(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    setSubmittedTerm('');
    setSubFilter('');
  };

  const handleExport = () => {
    const activeData = currentData[activeTab];
    if (!activeData || activeData.length === 0) return;

    const columns = TABLE_CONFIG[activeTab];
    const headers = columns.map(c => c.header);
    
    const csvContent = [
      headers.join(';'),
      ...activeData.map(row => {
        return columns.map(col => {
          let val = row[col.accessor] || '';
          return `="${String(val).replace(/"/g, '""')}"`;
        }).join(';');
      })
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_${activeTab.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const StatusBadge = ({ status }) => {
    if (!status) return <span className="text-slate-500">-</span>;
    const s = status.toUpperCase();
    let color = 'bg-slate-100 text-slate-700 border-slate-300';
    
    if (['DISPONIBLE', 'EN_BODEGA', 'ACTIVO'].includes(s)) color = 'bg-emerald-100 text-emerald-900 border-emerald-200';
    else if (['DESPACHADO', 'ENTREGADO'].includes(s)) color = 'bg-blue-100 text-blue-900 border-blue-200';
    else if (['RESERVA', 'TRANSITO', 'PENDIENTE'].includes(s)) color = 'bg-amber-100 text-amber-900 border-amber-200';
    else if (['CUARENTENA', 'BLOQUEADO', 'MERMA'].includes(s)) color = 'bg-rose-100 text-rose-900 border-rose-200';

    return (
      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border whitespace-nowrap shadow-sm ${color}`}>
        {status}
      </span>
    );
  };

  const TABLE_CONFIG = {
    partidas: [
      { header: 'Estado Crítico', accessor: 'disponible', render: r => {
        const isAvailable = (r.disponible || 0) > 0;
        const hasExpiry = r.fecha_vencimiento;
        const isExpired = hasExpiry && new Date(r.fecha_vencimiento) < new Date();
        
        return (
          <div className="flex flex-col gap-2 min-w-[160px]">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border-2 transition-all ${isAvailable ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-400'}`}>
              {isAvailable ? <ShieldCheck size={20} className="animate-pulse" /> : <X size={20} />}
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">{isAvailable ? 'Disponible' : 'Sin Stock'}</span>
                <span className="text-2xl font-black tracking-tighter leading-none">{r.disponible || 0}</span>
              </div>
            </div>
            {hasExpiry && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${isExpired ? 'bg-red-600 text-white border-red-700 animate-bounce' : 'bg-slate-900 text-white border-slate-800'}`}>
                <Clock size={12} />
                Vence: {r.fecha_vencimiento}
              </div>
            )}
          </div>
        );
      }},
      { header: 'Producto', render: r => (
        <div className="flex flex-col min-w-[200px]">
          <span className="font-mono text-[10px] font-black text-orange-500 uppercase mb-1 tracking-widest"><HighlightText text={r.codigo_producto} highlight={submittedTerm} /></span>
          <span className="font-bold text-slate-900 text-sm leading-tight whitespace-normal break-words"><HighlightText text={r.producto || r.descripcion} highlight={submittedTerm} /></span>
          <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter">{r.unidad_medida}</span>
        </div>
      )},
      { header: 'Identificación', accessor: 'partida', render: r => (
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Partida / Lote</span>
          <span className="font-mono text-xs font-black bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 uppercase tracking-tight shadow-lg inline-block w-fit"><HighlightText text={r.partida} highlight={submittedTerm} /></span>
        </div>
      )},
      { header: 'Distribución de Stock', render: r => (
        <div className="grid grid-cols-2 gap-2 min-w-[220px]">
          <div className={`p-2 rounded-xl border ${r.reserva > 0 ? 'bg-amber-50 border-amber-500' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
            <p className="text-[8px] font-black text-amber-700 uppercase mb-0.5">Reserva</p>
            <p className="text-sm font-black text-slate-900">{r.reserva || 0}</p>
          </div>
          <div className={`p-2 rounded-xl border ${r.transitoria > 0 ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
            <p className="text-[8px] font-black text-blue-700 uppercase mb-0.5">Tránsito</p>
            <p className="text-sm font-black text-slate-900">{r.transitoria || 0}</p>
          </div>
          <div className={`p-2 rounded-xl border ${r.consignacion > 0 ? 'bg-purple-50 border-purple-500' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
            <p className="text-[8px] font-black text-purple-700 uppercase mb-0.5">Consign.</p>
            <p className="text-sm font-black text-slate-900">{r.consignacion || 0}</p>
          </div>
          <div className="p-2 rounded-xl border bg-slate-900 border-slate-800">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Total</p>
            <p className="text-sm font-black text-white">{r.stock_total || 0}</p>
          </div>
        </div>
      )}
    ],
    series: [
      { header: 'Estado Crítico', accessor: 'disponible', render: r => {
        const isAvailable = (r.disponible || 0) > 0;
        return (
          <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border-2 transition-all ${isAvailable ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-400'}`}>
            {isAvailable ? <ShieldCheck size={20} className="animate-pulse" /> : <X size={20} />}
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">{isAvailable ? 'Disponible' : 'No Disponible'}</span>
              <span className="text-2xl font-black tracking-tighter leading-none">{r.disponible || 0}</span>
            </div>
          </div>
        );
      }},
      { header: 'Producto', render: r => (
        <div className="flex flex-col min-w-[200px]">
          <span className="font-mono text-[10px] font-black text-orange-500 uppercase mb-1 tracking-widest"><HighlightText text={r.codigo_producto} highlight={submittedTerm} /></span>
          <span className="font-bold text-slate-900 text-sm leading-tight whitespace-normal break-words"><HighlightText text={r.producto} highlight={submittedTerm} /></span>
        </div>
      )},
      { header: 'Identificación', accessor: 'serie', render: r => (
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Serie (SN)</span>
          <span className="font-mono text-xs font-black bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 uppercase tracking-tight shadow-lg inline-block w-fit"><HighlightText text={r.serie} highlight={submittedTerm} /></span>
        </div>
      )},
      { header: 'Distribución de Stock', render: r => (
        <div className="grid grid-cols-2 gap-2 min-w-[220px]">
          <div className={`p-2 rounded-xl border ${r.reserva > 0 ? 'bg-amber-50 border-amber-500' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
            <p className="text-[8px] font-black text-amber-700 uppercase mb-0.5">Reserva</p>
            <p className="text-sm font-black text-slate-900">{r.reserva || 0}</p>
          </div>
          <div className={`p-2 rounded-xl border ${r.transitoria > 0 ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
            <p className="text-[8px] font-black text-blue-700 uppercase mb-0.5">Tránsito</p>
            <p className="text-sm font-black text-slate-900">{r.transitoria || 0}</p>
          </div>
          <div className={`p-2 rounded-xl border ${r.consignacion > 0 ? 'bg-purple-50 border-purple-500' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
            <p className="text-[8px] font-black text-purple-700 uppercase mb-0.5">Consign.</p>
            <p className="text-sm font-black text-slate-900">{r.consignacion || 0}</p>
          </div>
          <div className="p-2 rounded-xl border bg-slate-900 border-slate-800">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Total</p>
            <p className="text-sm font-black text-white">{r.stock_total || 0}</p>
          </div>
        </div>
      )}
    ],
    farmapack: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-black text-slate-900 whitespace-nowrap"><HighlightText text={r.codigo_producto} highlight={submittedTerm} /></span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-slate-900 text-sm whitespace-normal break-words min-w-[200px]"><HighlightText text={r.producto || r.descripcion} highlight={submittedTerm} /></span> },
      { header: 'Lote', accessor: 'lote', render: r => <span className="font-mono text-[11px] font-black bg-emerald-100 px-3 py-1.5 rounded-lg text-emerald-900 border border-emerald-300 uppercase tracking-tight whitespace-nowrap shadow-sm"><HighlightText text={r.lote} highlight={submittedTerm} /></span> },
      { header: 'Vencimiento', accessor: 'fecha_vencimiento', render: r => <span className="text-xs font-black text-slate-700 whitespace-nowrap">{r.fecha_vencimiento || '-'}</span> },
      { header: 'Disp.', accessor: 'disponible', render: r => <span className="font-black text-emerald-700 text-lg tracking-tighter">{r.disponible}</span> },
      { header: 'Estado', accessor: 'estado', render: r => <StatusBadge status={r.estado} /> }
    ],
    pesos: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-black text-slate-900 whitespace-nowrap"><HighlightText text={r.codigo_producto} highlight={submittedTerm} /></span> },
      { header: 'Descripción', accessor: 'descripcion', render: r => <span className="font-bold text-slate-900 text-sm whitespace-normal break-words min-w-[200px]"><HighlightText text={r.descripcion} highlight={submittedTerm} /></span> },
      { header: 'Peso (kg)', accessor: 'peso_unitario', render: r => <div className="flex items-center gap-2 font-black text-blue-900 bg-blue-100/50 px-3 py-1.5 rounded-lg border border-blue-200 text-sm w-fit whitespace-nowrap"><Scale size={14}/>{r.peso_unitario}</div> },
      { header: 'Dimensiones', render: r => <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap">{r.largo}x{r.ancho}x{r.alto} cm</span> },
      { header: 'Actualizado', accessor: 'updated_at', render: r => <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 whitespace-nowrap"><Clock size={12}/>{r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '-'}</div> }
    ]
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-orange-200 selection:text-orange-900">
      
      {/* BACKGROUND ELEMENTS - Simplificados para Legibilidad */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="bg-orb-1 absolute top-[-15%] right-[-5%] w-[45%] h-[45%] bg-slate-200/30 blur-[130px] rounded-full" />
        <div className="bg-orb-2 absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-slate-100/40 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* HEADER & SEARCH */}
        <div className={`transition-all duration-700 ease-in-out relative z-20 ${searched || loading ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200 shadow-sm sticky top-0' : 'flex flex-col items-center justify-center pt-20 sm:pt-32 pb-10 sm:pb-16 px-3 sm:px-4'}`}>
          <div className={`w-full mx-auto transition-all duration-700 ${searched || loading ? 'max-w-7xl px-3 sm:px-8 py-3 sm:py-4' : 'max-w-4xl'}`}>
            
            {!searched && !loading && (
              <div className="text-center mb-8 sm:mb-12 animate-header">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xl shadow-orange-500/5 mb-5 sm:mb-8 transform hover:scale-110 hover:rotate-3 transition-all duration-500">
                  <Barcode size={28} className="text-orange-500 sm:hidden" strokeWidth={1.5} />
                  <Barcode size={40} className="text-orange-500 hidden sm:block" strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 sm:mb-6 leading-tight">
                  Partidas & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 animate-pulse">Series</span>
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[10px] sm:text-xs opacity-60">Inventory Traceability System</p>
              </div>
            )}

            <div className={`flex flex-col animate-search ${searched || loading ? 'md:flex-row gap-6 items-center' : 'gap-8'}`}>
              
              {(searched || loading) && (
                <div className="hidden md:flex items-center gap-4 cursor-pointer group px-4 py-2 rounded-2xl hover:bg-slate-50 transition-all duration-300" onClick={handleClear}>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Barcode size={22} />
                  </div>
                  <div>
                    <h1 className="text-base font-black text-slate-900 leading-none mb-1">Stock Control</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partidas / Series</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSearch} className={`relative group w-full ${searched || loading ? 'flex-1' : ''}`}>
                {/* Search Aura */}
                <div className={`absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-[3rem] blur-2xl transition-all duration-700 opacity-0 ${isFocused ? 'opacity-100 scale-105' : 'group-hover:opacity-40'}`} />
                
                <div className="relative flex items-center">
                  <Search className={`absolute left-4 sm:left-6 transition-all duration-500 z-10 ${loading ? 'animate-pulse text-orange-500' : isFocused ? 'text-orange-500 scale-110' : 'text-slate-400'}`} size={searched || loading ? 18 : 22} />
                  <input
                    type="text"
                    placeholder="Escribe Código, Lote, Serie..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full bg-white/90 backdrop-blur-md outline-none transition-all duration-500 font-mono uppercase text-slate-900 placeholder:text-slate-300 placeholder:font-sans placeholder:normal-case
                      ${searched || loading
                        ? 'pl-10 sm:pl-16 pr-10 sm:pr-14 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 sm:focus:ring-8 focus:ring-orange-500/5 shadow-sm text-xs sm:text-sm'
                        : 'pl-10 sm:pl-20 pr-10 sm:pr-20 py-5 sm:py-7 rounded-2xl sm:rounded-[2.5rem] border-2 border-slate-100 focus:border-orange-500 focus:ring-8 sm:focus:ring-[12px] focus:ring-orange-500/5 text-base sm:text-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)]'
                      }`}
                    autoFocus
                  />
                  {searchTerm && (
                    <button type="button" onClick={handleClear} className="absolute right-6 text-slate-300 hover:text-rose-500 p-2 rounded-xl transition-all hover:scale-110 active:scale-95">
                      <X size={searched || loading ? 18 : 24} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* AVISO DE FRESCURA / VIGENCIA DEL STOCK (24 hrs, ciclo 06:00→06:00) */}
        <StockFreshness table={STOCK_TABLES[activeTab]} label={TABS.find(t => t.id === activeTab)?.label || ''} />

        {/* RESULTS SECTION */}
        {(searched || loading) && (
          <div className="max-w-7xl mx-auto px-3 sm:px-8 py-6 sm:py-10">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <RefreshCw className="animate-spin text-orange-500" size={32} />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Buscando registros...</p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* TABS / KPI CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
                  {TABS.map(tab => {
                    const count = currentData[tab.id]?.length || 0;
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    const colors = {
                      orange: 'border-orange-500 shadow-orange-500/10 bg-orange-500 text-orange-500',
                      amber: 'border-amber-500 shadow-amber-500/10 bg-amber-500 text-amber-500',
                      emerald: 'border-emerald-500 shadow-emerald-500/10 bg-emerald-500 text-emerald-500',
                      blue: 'border-blue-500 shadow-blue-500/10 bg-blue-500 text-blue-500'
                    };

                    const activeColors = colors[tab.color] || colors.orange;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group relative flex items-center p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border transition-all duration-700 text-left overflow-hidden hover:-translate-y-1 active:scale-[0.98]
                          ${isActive 
                            ? `bg-white ${activeColors.split(' ')[0]} shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] ${activeColors.split(' ')[1]}` 
                            : 'bg-white/60 backdrop-blur-md border-white/40 hover:bg-white hover:border-slate-300 hover:shadow-2xl'
                          }`}
                      >
                        {/* Tab Glow */}
                        {isActive && (
                          <div className={`absolute -inset-4 opacity-20 blur-2xl ${activeColors.split(' ')[2]}`} />
                        )}

                        <div className={`relative w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:rotate-[5deg] flex-shrink-0 ${isActive ? `${activeColors.split(' ')[2]} text-white shadow-xl ${activeColors.split(' ')[1].replace('10', '40')}` : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                          <Icon size={20} className={`sm:hidden ${isActive ? 'animate-[pulse_2s_infinite]' : ''}`} />
                          <Icon size={28} className={`hidden sm:block ${isActive ? 'animate-[pulse_2s_infinite]' : ''}`} />
                        </div>
                        <div className="relative ml-3 sm:ml-6 flex-1 min-w-0">
                          <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em] mb-1 sm:mb-1.5 transition-colors duration-500 truncate ${isActive ? activeColors.split(' ')[3] : 'text-slate-400'}`}>{tab.label}</p>
                          <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-none group-hover:scale-105 transition-transform duration-500 origin-left">{count}</p>
                        </div>
                        {isActive && (
                          <div className={`relative flex items-center justify-center w-8 h-8`}>
                            <div className={`absolute w-full h-full rounded-full animate-ping opacity-20 ${activeColors.split(' ')[2]}`} />
                            <div className={`w-2 h-2 rounded-full ${activeColors.split(' ')[2]}`} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* TABLE TOOLBAR */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6 bg-white/70 backdrop-blur-2xl p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-white/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-3 sm:gap-5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 flex-shrink-0">
                      <Zap size={18} className="animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-black text-slate-900 leading-none mb-1">Resultados Activos</h2>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.3em]">Search Engine v2</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80 group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl sm:rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <div className="relative">
                        <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={14} />
                        <input
                          type="text"
                          placeholder="Filtrar..."
                          value={subFilter}
                          onChange={(e) => setSubFilter(e.target.value)}
                          className="w-full pl-9 sm:pl-12 pr-4 sm:pr-10 py-3 sm:py-4 bg-slate-50/50 border border-slate-100 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold focus:bg-white focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleExport}
                      className="group bg-slate-900 text-white hover:bg-orange-600 px-4 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] flex items-center gap-2 sm:gap-4 transition-all shadow-2xl hover:-translate-y-1 active:scale-95 active:translate-y-0 flex-shrink-0"
                    >
                      <Download size={16} className="group-hover:bounce" />
                      <span className="hidden sm:inline">Exportar</span>
                    </button>
                  </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-[1000px]">
                      <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-200">
                          {TABLE_CONFIG[activeTab].map((col, i) => (
                            <th key={i} className="px-4 py-3 sm:px-8 sm:py-5 text-[10px] sm:text-[11px] font-black text-slate-700 uppercase tracking-widest">
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(subFilter ? currentData[activeTab].filter(row => 
                          TABLE_CONFIG[activeTab].some(col => String(row[col.accessor] || '').toLowerCase().includes(subFilter.toLowerCase()))
                        ) : currentData[activeTab]).map((row, idx) => (
                          <tr key={idx} className="result-item hover:bg-slate-50/50 transition-colors group">
                            {TABLE_CONFIG[activeTab].map((col, cIdx) => (
                              <td key={cIdx} className="px-4 py-4 sm:px-8 sm:py-6">
                                {col.render ? col.render(row) : <span className="text-slate-600 font-bold text-sm">{row[col.accessor] || '-'}</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(!currentData[activeTab] || currentData[activeTab].length === 0) && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <Search size={40} className="text-slate-200" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">No se encontraron registros</h3>
                      <p className="text-slate-400 font-bold max-w-sm">Intenta con otro código o verifica la otra pestaña.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Batches;