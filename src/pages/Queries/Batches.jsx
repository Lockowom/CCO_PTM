import React, { useState, useRef } from 'react';
import { 
  Search, Barcode, Box, Package, Layers, Scale, MapPin, 
  RefreshCw, Download, ChevronRight, FileSpreadsheet, Activity, X
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Batches = () => {
  const containerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [activeTab, setActiveTab] = useState('partidas');
  const [subFilter, setSubFilter] = useState('');

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

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
    { id: 'partidas', label: 'Partidas', icon: Layers, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { id: 'series', label: 'Series / SN', icon: Barcode, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { id: 'farmapack', label: 'Farmapack', icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
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
    
    if (['DISPONIBLE', 'EN_BODEGA', 'ACTIVO'].includes(s)) color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    else if (['DESPACHADO', 'ENTREGADO'].includes(s)) color = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    else if (['RESERVA', 'TRANSITO', 'PENDIENTE'].includes(s)) color = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    else if (['CUARENTENA', 'BLOQUEADO', 'MERMA'].includes(s)) color = 'bg-rose-500/10 text-rose-400 border-rose-500/30';

    return (
      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${color}`}>
        {status}
      </span>
    );
  };

  const TABLE_CONFIG = {
    partidas: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-300">{r.codigo_producto}</span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-white">{r.producto || r.descripcion}</span> },
      { header: 'Partida / Talla', accessor: 'partida', render: r => <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded-md text-slate-300 border border-slate-700">{r.partida}</span> },
      { header: 'Vencimiento', accessor: 'fecha_vencimiento', render: r => r.fecha_vencimiento ? <span className="text-slate-400">{new Date(r.fecha_vencimiento).toLocaleDateString()}</span> : <span className="text-slate-500">-</span> },
      { header: 'Stock Disp.', accessor: 'disponible', render: r => <span className="font-black text-emerald-400 text-base">{r.disponible}</span> },
      { header: 'Reserva', accessor: 'reserva', render: r => <span className="text-amber-400 font-medium">{r.reserva || 0}</span> },
      { header: 'Total', accessor: 'stock_total', render: r => <span className="font-bold text-white">{r.stock_total || r.cantidad_inicial}</span> },
      { header: 'Estado', accessor: 'estado', render: r => <StatusBadge status={r.estado} /> }
    ],
    series: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-300">{r.codigo_producto}</span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-white">{r.producto}</span> },
      { header: 'Serie (SN)', accessor: 'serie', render: r => <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/30">{r.serie}</span> },
      { header: 'Estado', accessor: 'estado', render: r => <StatusBadge status={r.estado} /> }
    ],
    farmapack: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-300">{r.codigo_producto}</span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-white">{r.producto}</span> },
      { header: 'Lote', accessor: 'lote', render: r => <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30">{r.lote}</span> },
      { header: 'Vencimiento', accessor: 'fecha_vencimiento', render: r => r.fecha_vencimiento ? <span className="text-slate-400 font-medium">{new Date(r.fecha_vencimiento).toLocaleDateString()}</span> : '-' },
      { header: 'Stock Disp.', accessor: 'disponible', render: r => <span className="font-black text-emerald-400 text-base">{r.disponible}</span> },
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
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-wms-panel/50 rounded-2xl border border-wms-border border-dashed">
          <div className="bg-slate-800 p-4 rounded-full mb-4">
            <Search size={32} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No hay datos en esta categoría</h3>
          <p className="text-slate-400 max-w-sm">Intenta buscar con otro término o revisa las otras pestañas de resultados.</p>
        </div>
      );
    }

    return (
      <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-wms-border">
                {columns.map((col, i) => (
                  <th key={i} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-wms-border">
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors group">
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
      
      {!searched && !loading && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
          <div className="absolute top-[-10%] w-[800px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full"></div>
        </div>
      )}

      {/* HEADER & SEARCH BAR */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] z-10 ${searched || loading ? 'py-4 bg-wms-panel/80 backdrop-blur-xl border-b border-wms-border shadow-xl sticky top-0' : 'flex-1 flex flex-col items-center justify-center px-4 -mt-20'}`}>
        <div className={`w-full mx-auto ${searched || loading ? 'max-w-[1600px] px-6 flex flex-col md:flex-row items-center gap-6' : 'max-w-3xl'}`}>
          
          {!searched && !loading && (
            <div className="text-center mb-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-wms-panel border border-wms-border shadow-[0_0_20px_rgba(249,115,22,0.2)] mb-8 transform hover:scale-105 transition-transform">
                <Layers size={40} className="text-orange-400" strokeWidth={1.5} />
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight mb-6 leading-tight flex items-center justify-center gap-3 cursor-default">
                <span className="inline-block transition-transform duration-300 hover:-translate-y-2">Lotes</span>
                <span className="inline-block text-orange-400 animate-pulse">-</span>
                <span className="inline-block text-amber-400 transition-transform duration-300 hover:-translate-y-2">Series</span>
              </h1>
            </div>
          )}

          {(searched || loading) && (
            <div className="hidden lg:flex items-center gap-3 min-w-max group cursor-pointer" onClick={handleClear}>
              <div className="p-2 bg-wms-dark border border-wms-border rounded-xl text-orange-400 shadow-sm group-hover:scale-105 transition-transform">
                <Layers size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-white leading-none group-hover:text-orange-400 transition-colors">Lotes - Series</h1>
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className={`relative group w-full ${searched || loading ? 'max-w-3xl' : 'animate-in slide-in-from-bottom-10 fade-in duration-700 delay-100'}`}>
            <div className="relative flex items-center">
              <Search className={`absolute left-6 transition-colors duration-300 z-10 ${searched || loading ? 'text-slate-400' : 'text-orange-400'} group-focus-within:text-orange-500`} size={searched || loading ? 20 : 28} />
              <input
                type="text"
                placeholder="Escanea o escribe Código, Lote, Serie..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full bg-slate-900/50 backdrop-blur-sm border-2 outline-none transition-all duration-300 font-mono uppercase text-white placeholder:text-slate-500 placeholder:font-sans placeholder:normal-case
                  ${searched || loading 
                    ? 'pl-14 pr-32 py-2.5 rounded-xl border-wms-border focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-base shadow-sm' 
                    : 'pl-16 pr-44 py-6 rounded-2xl border-wms-border focus:border-orange-500 focus:ring-[6px] focus:ring-orange-500/10 text-xl shadow-2xl'
                  }`}
                autoFocus
              />
              <button 
                type="submit"
                disabled={loading || !searchTerm.trim()}
                className={`absolute right-2 top-2 bottom-2 bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all duration-300 disabled:opacity-40 disabled:hover:bg-orange-600 flex items-center gap-2 overflow-hidden
                  ${searched || loading ? 'px-5 rounded-lg text-sm' : 'px-8 rounded-xl text-base shadow-lg hover:shadow-orange-500/25 active:scale-[0.98]'}`}
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>
                    <span className="relative z-10">BUSCAR</span>
                    {(!searched && !loading) && <ChevronRight size={18} className="relative z-10 -mr-2 opacity-70" />}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RESULTADOS */}
      {(searched || loading) && (
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 animate-in fade-in duration-500">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-wms-border border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold animate-pulse">Consultando base de datos...</p>
            </div>
          ) : (
            <>
              {/* HEADER DE PRODUCTO Y PESOS */}
              {currentData.peso && currentData.peso.length > 0 && (
                <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
                      <Box size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{currentData.peso[0].descripcion}</h3>
                      <p className="text-sm font-mono text-slate-400">{currentData.peso[0].codigo_producto}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 bg-slate-900/50 p-4 rounded-xl border border-wms-border">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Peso Unitario</span>
                      <div className="flex items-center gap-2">
                        <Scale size={16} className="text-amber-500" />
                        <span className="text-lg font-black text-white">{currentData.peso[0].peso_unitario} <span className="text-sm font-medium text-slate-500">Kg</span></span>
                      </div>
                    </div>
                    
                    <div className="w-px h-8 bg-wms-border hidden md:block"></div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dimensiones (L x A x A)</span>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-orange-500" />
                        <span className="text-lg font-bold text-white">
                          {currentData.peso[0].largo || 0} <span className="text-slate-500 font-medium text-sm">x</span> {currentData.peso[0].ancho || 0} <span className="text-slate-500 font-medium text-sm">x</span> {currentData.peso[0].alto || 0} <span className="text-sm font-medium text-slate-500">cm</span>
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => window.location.href = `/inbound/cubing?code=${currentData.peso[0].codigo_producto}`} 
                      className="ml-auto bg-wms-dark border border-wms-border hover:border-orange-500/50 hover:text-orange-400 text-slate-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      Editar
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* KPI Cards / Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {TABS.map(tab => {
                  const count = currentData[tab.id]?.length || 0;
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden group
                        ${isActive 
                          ? `${tab.border} ${tab.bg} shadow-lg scale-[1.02]` 
                          : 'border-wms-border bg-wms-panel/50 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className={`p-2 rounded-xl border ${isActive ? tab.border : 'border-wms-border'} ${isActive ? tab.bg : 'bg-slate-900'}`}>
                          <Icon size={20} className={isActive ? tab.color : 'text-slate-400'} />
                        </div>
                        {isActive && <div className={`w-2 h-2 rounded-full ${tab.color.replace('text-', 'bg-')}`} />}
                      </div>
                      <span className="text-sm font-bold text-slate-400 mb-1">{tab.label}</span>
                      <span className={`text-3xl font-black font-mono tracking-tight ${isActive ? 'text-white' : 'text-slate-500'}`}>
                        {count}
                      </span>
                      
                      <div className={`absolute -right-6 -bottom-6 opacity-5 transition-transform group-hover:scale-110 ${isActive ? tab.color : 'text-slate-500'}`}>
                        <Icon size={100} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Toolbar de Tabla */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 px-1">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    {TABS.find(t => t.id === activeTab)?.label}
                    <span className="text-sm font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-wms-border">
                      {currentData[activeTab]?.length || 0} resultados
                    </span>
                  </h2>
                </div>
                
                {currentData[activeTab]?.length > 0 && (
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        placeholder={`Filtrar ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                        value={subFilter}
                        onChange={(e) => setSubFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-wms-border rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-slate-600 text-white"
                      />
                      {subFilter && (
                        <button 
                          onClick={() => setSubFilter('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleExport}
                      className="flex items-center gap-2 text-sm font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <FileSpreadsheet size={16} />
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
