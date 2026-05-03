import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Barcode, Box, Package, Layers, Scale, MapPin, 
  RefreshCw, Download, ChevronRight, FileSpreadsheet, Activity, X,
  Command, Filter
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Componente para resaltar el texto buscado
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <span>{text}</span>;
  const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-orange-500/40 text-orange-200 font-black px-1 rounded-md shadow-[0_0_8px_rgba(249,115,22,0.4)]">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const Batches = () => {
  const containerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [activeTab, setActiveTab] = useState('partidas');
  const [subFilter, setSubFilter] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power4.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  // Auto-búsqueda con Debounce (600ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.trim().length >= 2) {
        setSubmittedTerm(searchTerm.trim());
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading: loading, isSuccess: searched } = useQuery({
    queryKey: ['batches_search', submittedTerm],
    queryFn: async () => {
      const term = `%${submittedTerm.trim()}%`;
      const newData = { partidas: [], series: [], farmapack: [], peso: [] };

      const searchTable = async (table, cols) => {
        try {
          let query = supabase.from(table).select('*').limit(3000);
          const orFilter = cols.map(c => `${c}.ilike.${term}`).join(',');
          query = query.or(orFilter);
          
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        } catch (err) {
          console.warn(`Error buscando en ${table}:`, err);
          return [];
        }
      };

      const [p, s, f, w] = await Promise.all([
        searchTable('tms_partidas', ['codigo_producto', 'producto']),
        searchTable('tms_series', ['codigo_producto', 'producto', 'serie']),
        searchTable('tms_farmapack', ['codigo_producto', 'producto', 'lote']),
        searchTable('tms_pesos', ['codigo_producto', 'descripcion'])
      ]);

      newData.partidas = p;
      newData.series = s;
      newData.farmapack = f;
      newData.peso = w;

      return newData;
    },
    enabled: !!submittedTerm,
    onSuccess: (newData) => {
      if (newData[activeTab]?.length === 0) {
        const firstWithData = TABS.find(t => newData[t.id]?.length > 0);
        if (firstWithData) setActiveTab(firstWithData.id);
      }
      setSubFilter('');
    }
  });

  const currentData = data || { partidas: [], series: [], farmapack: [], peso: [] };

  const TABS = [
    { id: 'partidas', label: 'Partidas', icon: Layers, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', shadow: 'shadow-orange-500/20' },
    { id: 'series', label: 'Series / SN', icon: Barcode, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', shadow: 'shadow-amber-500/20' },
    { id: 'farmapack', label: 'Farmapack', icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/20' }
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
    const headers = columns.map(c => c.header).filter(h => h !== 'Acciones');
    
    const csvContent = [
      headers.join(';'),
      ...activeData.map(row => {
        return columns
          .filter(c => c.header !== 'Acciones')
          .map(col => {
            let val = row[col.accessor] || '';
            if (col.accessor.includes('codigo') || col.accessor === 'serie' || col.accessor === 'lote' || col.accessor === 'partida') {
              return `="${val}"`;
            }
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(';');
      })
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Consulta_${activeTab.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const StatusBadge = ({ status }) => {
    if (!status) return <span className="text-slate-400">-</span>;
    const s = status.toUpperCase();
    let color = 'bg-slate-800 text-slate-300 border-slate-600';
    
    if (['DISPONIBLE', 'EN_BODEGA', 'ACTIVO'].includes(s)) color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    else if (['DESPACHADO', 'ENTREGADO'].includes(s)) color = 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
    else if (['RESERVA', 'TRANSITO', 'PENDIENTE'].includes(s)) color = 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    else if (['CUARENTENA', 'BLOQUEADO', 'MERMA'].includes(s)) color = 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]';

    return (
      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${color}`}>
        {status}
      </span>
    );
  };

  const TABLE_CONFIG = {
    partidas: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-300"><HighlightText text={r.codigo_producto} highlight={submittedTerm} /></span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-white"><HighlightText text={r.producto || r.descripcion} highlight={submittedTerm} /></span> },
      { header: 'Partida / Talla', accessor: 'partida', render: r => <span className="font-mono text-xs bg-slate-800/80 px-2 py-1 rounded-md text-slate-300 border border-slate-700 shadow-inner">{r.partida}</span> },
      { header: 'Vencimiento', accessor: 'fecha_vencimiento', render: r => r.fecha_vencimiento ? <span className="text-slate-400">{new Date(r.fecha_vencimiento).toLocaleDateString()}</span> : <span className="text-slate-500">-</span> },
      { header: 'Stock Disp.', accessor: 'disponible', render: r => <span className="font-black text-emerald-400 text-base drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{r.disponible}</span> },
      { header: 'Reserva', accessor: 'reserva', render: r => <span className="text-amber-400 font-medium">{r.reserva || 0}</span> },
      { header: 'Total', accessor: 'stock_total', render: r => <span className="font-bold text-white">{r.stock_total || r.cantidad_inicial}</span> },
      { header: 'Estado', accessor: 'estado', render: r => <StatusBadge status={r.estado} /> }
    ],
    series: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-300"><HighlightText text={r.codigo_producto} highlight={submittedTerm} /></span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-white"><HighlightText text={r.producto} highlight={submittedTerm} /></span> },
      { header: 'Serie (SN)', accessor: 'serie', render: r => <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/30"><HighlightText text={r.serie} highlight={submittedTerm} /></span> },
      { header: 'Estado', accessor: 'estado', render: r => <StatusBadge status={r.estado} /> }
    ],
    farmapack: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-300"><HighlightText text={r.codigo_producto} highlight={submittedTerm} /></span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-white"><HighlightText text={r.producto} highlight={submittedTerm} /></span> },
      { header: 'Lote', accessor: 'lote', render: r => <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30"><HighlightText text={r.lote} highlight={submittedTerm} /></span> },
      { header: 'Vencimiento', accessor: 'fecha_vencimiento', render: r => r.fecha_vencimiento ? <span className="text-slate-400 font-medium">{new Date(r.fecha_vencimiento).toLocaleDateString()}</span> : '-' },
      { header: 'Stock Disp.', accessor: 'disponible', render: r => <span className="font-black text-emerald-400 text-base drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{r.disponible}</span> },
      { header: 'Total', accessor: 'stock_total', render: r => <span className="font-bold text-white">{r.stock_total}</span> }
    ]
  };

  const ResultTable = ({ columns, rows }) => {
    const filteredRows = React.useMemo(() => {
      if (!subFilter.trim()) return rows;
      const lowerFilter = subFilter.toLowerCase().trim();
      return rows.filter(row => {
        return columns.some(col => {
          const val = row[col.accessor];
          return val && String(val).toLowerCase().includes(lowerFilter);
        });
      });
    }, [rows, subFilter, columns]);

    if (rows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-wms-panel/40 backdrop-blur-md rounded-2xl border border-wms-border border-dashed shadow-inner">
          <div className="bg-slate-800/80 p-5 rounded-2xl mb-5 shadow-lg border border-slate-700">
            <Search size={40} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No se encontraron registros</h3>
          <p className="text-slate-400 max-w-sm text-sm">El término <span className="text-orange-400 font-mono">"{submittedTerm}"</span> no produjo resultados en esta pestaña. Intenta con otro código o verifica las demás categorías.</p>
        </div>
      );
    }

    return (
      <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-wms-border">
                {columns.map((col, i) => (
                  <th key={i} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-wms-border">
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/60 transition-colors group">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row) : <span className="text-slate-300 text-sm">{row[col.accessor] || '-'}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-wms-dark flex flex-col font-sans relative overflow-hidden text-slate-300">
      
      {/* Background Decorativo Inmersivo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className={`absolute top-[-10%] w-[800px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full transition-opacity duration-1000 ${isFocused ? 'opacity-100' : 'opacity-50'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full transition-opacity duration-1000 ${isFocused ? 'opacity-100' : 'opacity-50'}`}></div>
      </div>

      {/* HEADER & OMNI-SEARCH BAR */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] z-10 ${searched || loading ? 'py-4 bg-wms-panel/90 backdrop-blur-2xl border-b border-wms-border shadow-2xl sticky top-0' : 'flex-1 flex flex-col items-center justify-center px-4 -mt-20'}`}>
        <div className={`w-full mx-auto ${searched || loading ? 'max-w-[1600px] px-6 flex flex-col md:flex-row items-center gap-6' : 'max-w-4xl'}`}>
          
          {!searched && !loading && (
            <div className="text-center mb-12 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-wms-panel to-slate-900 border border-wms-border shadow-[0_0_30px_rgba(249,115,22,0.2)] mb-8 transform hover:scale-105 transition-transform">
                <Command size={48} className="text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" strokeWidth={1.5} />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
                Motor de Búsqueda <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Global</span>
              </h1>
              <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
                Escribe cualquier código, lote, serie o descripción. El sistema filtrará instantáneamente en todas las bases de datos.
              </p>
            </div>
          )}

          {(searched || loading) && (
            <div className="hidden lg:flex items-center gap-4 min-w-max group cursor-pointer bg-slate-900/50 p-2 pr-6 rounded-2xl border border-wms-border hover:border-orange-500/50 transition-colors" onClick={handleClear}>
              <div className="p-2.5 bg-wms-dark border border-wms-border rounded-xl text-orange-400 shadow-sm group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all">
                <Command size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Buscador</p>
                <h1 className="text-sm font-black text-white leading-none group-hover:text-orange-400 transition-colors">Lotes & Series</h1>
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className={`relative group w-full ${searched || loading ? 'max-w-3xl' : 'animate-in slide-in-from-bottom-10 fade-in duration-700 delay-100'}`}>
            <div className="relative flex items-center">
              <Search className={`absolute left-6 transition-all duration-500 z-10 ${isFocused ? 'text-orange-400 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : (searched || loading ? 'text-slate-400' : 'text-orange-400/70')}`} size={searched || loading ? 20 : 28} />
              
              <input
                type="text"
                placeholder="Escanea o escribe Código, Lote, Serie..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full bg-slate-900/60 backdrop-blur-md border-2 outline-none transition-all duration-500 font-mono uppercase text-white placeholder:text-slate-500 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal tracking-wider
                  ${searched || loading 
                    ? 'pl-14 pr-14 py-3.5 rounded-2xl border-wms-border focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-base shadow-sm' 
                    : 'pl-16 pr-16 py-7 rounded-[2rem] border-wms-border focus:border-orange-500 focus:ring-[8px] focus:ring-orange-500/15 text-2xl shadow-2xl focus:bg-slate-900/90'
                  }`}
                autoFocus
              />

              {/* Botón de limpiar dentro del input */}
              {searchTerm && (
                <button 
                  type="button"
                  onClick={handleClear}
                  className={`absolute transition-all duration-300 hover:scale-110 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-1.5
                    ${searched || loading ? 'right-4' : 'right-6'}
                  `}
                >
                  <X size={searched || loading ? 16 : 20} />
                </button>
              )}
            </div>
            
            {!searched && !loading && (
              <div className="absolute -bottom-8 left-0 right-0 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                  Búsqueda automática activada
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* RESULTADOS */}
      {(searched || loading) && (
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 animate-in fade-in duration-500">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Command size={24} className="text-orange-400 animate-pulse" />
                </div>
              </div>
              <p className="text-orange-400 font-bold tracking-widest uppercase text-sm animate-pulse">Escaneando Red...</p>
            </div>
          ) : (
            <>
              {/* HEADER DE PRODUCTO Y PESOS */}
              {currentData.peso && currentData.peso.length > 0 && (
                <div className="bg-gradient-to-br from-wms-panel/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-wms-border shadow-2xl p-6 mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden group">
                  
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors duration-700"></div>

                  <div className="flex items-start gap-5 relative z-10">
                    <div className="p-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                      <Box size={32} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ficha Técnica Principal</p>
                      <h3 className="text-2xl font-black text-white leading-tight mb-1">{currentData.peso[0].descripcion}</h3>
                      <p className="text-sm font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-fit">
                        {currentData.peso[0].codigo_producto}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-8 bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Peso Unitario</span>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                          <Scale size={18} />
                        </div>
                        <span className="text-2xl font-black text-white">{currentData.peso[0].peso_unitario} <span className="text-sm font-medium text-slate-500">Kg</span></span>
                      </div>
                    </div>
                    
                    <div className="w-px h-12 bg-wms-border hidden md:block"></div>
                    
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Dimensiones (L x A x A)</span>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                          <Package size={18} />
                        </div>
                        <span className="text-xl font-bold text-white">
                          {currentData.peso[0].largo || 0} <span className="text-slate-500 font-medium text-sm mx-1">x</span> {currentData.peso[0].ancho || 0} <span className="text-slate-500 font-medium text-sm mx-1">x</span> {currentData.peso[0].alto || 0} <span className="text-sm font-medium text-slate-500 ml-1">cm</span>
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => window.location.href = `/inbound/cubing?code=${currentData.peso[0].codigo_producto}`} 
                      className="ml-auto bg-wms-dark hover:bg-slate-800 border border-wms-border hover:border-orange-500/50 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    >
                      Editar Ficha
                      <ChevronRight size={16} className="text-orange-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* KPI Cards / Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {TABS.map(tab => {
                  const count = currentData[tab.id]?.length || 0;
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-500 text-left overflow-hidden group
                        ${isActive 
                          ? `${tab.border} ${tab.bg} ${tab.shadow} scale-[1.02] shadow-2xl` 
                          : 'border-wms-border bg-wms-panel/40 hover:border-slate-600 hover:bg-wms-panel'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full mb-4 relative z-10">
                        <div className={`p-3 rounded-2xl border transition-colors duration-500 ${isActive ? tab.border : 'border-slate-700'} ${isActive ? tab.bg : 'bg-slate-800/50 group-hover:bg-slate-800'}`}>
                          <Icon size={24} className={isActive ? tab.color : 'text-slate-400 group-hover:text-slate-300'} />
                        </div>
                        {isActive && (
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${tab.bg} border ${tab.border}`}>
                            <div className={`w-2 h-2 rounded-full ${tab.color.replace('text-', 'bg-')} animate-pulse`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${tab.color}`}>Activo</span>
                          </div>
                        )}
                      </div>
                      
                      <span className="text-sm font-bold text-slate-400 mb-1 relative z-10 group-hover:text-slate-300 transition-colors">{tab.label}</span>
                      <span className={`text-4xl font-black font-mono tracking-tight relative z-10 transition-colors duration-500 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                        {count}
                      </span>
                      
                      {/* Gran icono de fondo */}
                      <div className={`absolute -right-8 -bottom-8 opacity-5 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 ${isActive ? tab.color : 'text-slate-500'}`}>
                        <Icon size={140} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Toolbar de Tabla */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-wms-panel/30 p-4 rounded-2xl border border-wms-border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${TABS.find(t => t.id === activeTab)?.bg} ${TABS.find(t => t.id === activeTab)?.color}`}>
                    {React.createElement(TABS.find(t => t.id === activeTab)?.icon || Layers, { size: 20 })}
                  </div>
                  <h2 className="text-xl font-black text-white flex items-center gap-3">
                    Resultados de {TABS.find(t => t.id === activeTab)?.label}
                    <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 shadow-inner">
                      {currentData[activeTab]?.length || 0} registros
                    </span>
                  </h2>
                </div>
                
                {currentData[activeTab]?.length > 0 && (
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72 group">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={16} />
                      <input
                        type="text"
                        placeholder="Filtrar en esta tabla..."
                        value={subFilter}
                        onChange={(e) => setSubFilter(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-slate-600 text-white shadow-inner"
                      />
                      {subFilter && (
                        <button 
                          onClick={() => setSubFilter('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded-md transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleExport}
                      className="flex items-center gap-2 text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-5 py-2.5 rounded-xl transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 whitespace-nowrap"
                    >
                      <FileSpreadsheet size={18} />
                      Exportar CSV
                    </button>
                  </div>
                )}
              </div>

              {/* Tabla */}
              <ResultTable columns={TABLE_CONFIG[activeTab]} rows={currentData[activeTab] || []} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Batches;
