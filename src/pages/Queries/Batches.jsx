import React, { useState, useEffect } from 'react';
import { 
  Search, Barcode, Box, Package, Layers, Scale, MapPin, 
  RefreshCw, Download, ChevronRight, FileSpreadsheet, Activity, X
} from 'lucide-react';
import { supabase } from '../../supabase';

const Batches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('partidas');
  const [data, setData] = useState({
    partidas: [],
    series: [],
    farmapack: [],
    peso: []
  });
  const [searched, setSearched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [subFilter, setSubFilter] = useState(''); // Estado para la búsqueda rápida interna

  // Definición de Vistas (Tabs) modernizadas sin Ubicaciones ni Peso (Peso se muestra como Header)
  const TABS = [
    { id: 'partidas', label: 'Partidas', icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'series', label: 'Series / SN', icon: Barcode, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { id: 'farmapack', label: 'Farmapack', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    
    const term = `%${searchTerm.trim()}%`;
    const newData = { partidas: [], series: [], farmapack: [], peso: [] };

    try {
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
          const { data } = await supabase.from(table).select('*').ilike(cols[0], term).limit(3000);
          return data || [];
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

      setData(newData);
      setLastUpdated(new Date());

      if (newData[activeTab].length === 0) {
        const firstWithData = TABS.find(t => newData[t.id].length > 0);
        if (firstWithData) setActiveTab(firstWithData.id);
      }

      setSubFilter(''); // Limpiar el filtro rápido al hacer una nueva búsqueda global

    } catch (err) {
      console.error("Error en búsqueda global:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const currentData = data[activeTab];
    if (!currentData || currentData.length === 0) return;

    const columns = TABLE_CONFIG[activeTab];
    const headers = columns.map(c => c.header).filter(h => h !== 'Acciones');
    
    const csvContent = [
      headers.join(';'),
      ...currentData.map(row => {
        return columns
          .filter(c => c.header !== 'Acciones')
          .map(col => {
            let val = row[col.accessor] || '';
            // Preservar ceros a la izquierda para códigos y lotes
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

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    if (!status) return <span className="text-slate-400">-</span>;
    const s = status.toUpperCase();
    let color = 'bg-slate-100 text-slate-600 border-slate-200';
    
    if (['DISPONIBLE', 'EN_BODEGA', 'ACTIVO'].includes(s)) color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (['DESPACHADO', 'ENTREGADO'].includes(s)) color = 'bg-blue-50 text-blue-700 border-blue-200';
    else if (['RESERVA', 'TRANSITO', 'PENDIENTE'].includes(s)) color = 'bg-amber-50 text-amber-700 border-amber-200';
    else if (['CUARENTENA', 'BLOQUEADO', 'MERMA'].includes(s)) color = 'bg-rose-50 text-rose-700 border-rose-200';

    return (
      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${color}`}>
        {status}
      </span>
    );
  };

  // Configuraciones de Columnas Modernizadas
  const TABLE_CONFIG = {
    partidas: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-700">{r.codigo_producto}</span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-semibold text-slate-900">{r.producto || r.descripcion}</span> },
      { header: 'Partida / Talla', accessor: 'partida', render: r => <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600 border border-slate-200">{r.partida}</span> },
      { header: 'Vencimiento', accessor: 'fecha_vencimiento', render: r => r.fecha_vencimiento ? <span className="text-slate-600">{new Date(r.fecha_vencimiento).toLocaleDateString()}</span> : <span className="text-slate-300">-</span> },
      { header: 'Stock Disp.', accessor: 'disponible', render: r => <span className="font-black text-emerald-600 text-base">{r.disponible}</span> },
      { header: 'Reserva', accessor: 'reserva', render: r => <span className="text-amber-600 font-medium">{r.reserva || 0}</span> },
      { header: 'Total', accessor: 'stock_total', render: r => <span className="font-bold text-slate-800">{r.stock_total || r.cantidad_inicial}</span> },
      { header: 'Estado', accessor: 'estado', render: r => <StatusBadge status={r.estado} /> }
    ],
    series: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-700">{r.codigo_producto}</span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-semibold text-slate-900">{r.producto}</span> },
      { header: 'Serie (SN)', accessor: 'serie', render: r => <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">{r.serie}</span> },
      { header: 'Estado', accessor: 'estado', render: r => <StatusBadge status={r.estado} /> }
    ],
    farmapack: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-700">{r.codigo_producto}</span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-semibold text-slate-900">{r.producto}</span> },
      { header: 'Lote', accessor: 'lote', render: r => <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{r.lote}</span> },
      { header: 'Vencimiento', accessor: 'fecha_vencimiento', render: r => r.fecha_vencimiento ? <span className="text-slate-600 font-medium">{new Date(r.fecha_vencimiento).toLocaleDateString()}</span> : '-' },
      { header: 'Stock Disp.', accessor: 'disponible', render: r => <span className="font-black text-emerald-600 text-base">{r.disponible}</span> },
      { header: 'Total', accessor: 'stock_total', render: r => <span className="font-bold text-slate-800">{r.stock_total}</span> }
    ],
    peso: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-xs font-bold text-slate-700">{r.codigo_producto}</span> },
      { header: 'Descripción', accessor: 'descripcion', render: r => <span className="font-semibold text-slate-900">{r.descripcion}</span> },
      { header: 'Peso Unit. (Kg)', accessor: 'peso_unitario', render: r => <span className="font-mono font-bold text-amber-600 text-base">{r.peso_unitario}</span> },
      { header: 'Dimensiones (LxAxA)', accessor: 'dims', render: r => <span className="text-slate-600 text-sm">{r.largo || 0} x {r.ancho || 0} x {r.alto || 0} cm</span> },
      { header: 'Acciones', accessor: 'actions', render: r => (
        <button onClick={() => window.location.href = `/inbound/cubing?code=${r.codigo_producto}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1">
          Editar <ChevronRight size={14} />
        </button>
      )}
    ]
  };

  const ResultTable = ({ columns, rows }) => {
    // Aplicar el filtro rápido (subFilter) a las filas cargadas
    const filteredRows = React.useMemo(() => {
      if (!subFilter.trim()) return rows;
      const lowerFilter = subFilter.toLowerCase().trim();
      return rows.filter(row => {
        // Buscar en todas las columnas visibles de esta tabla
        return columns.some(col => {
          const val = row[col.accessor];
          return val && String(val).toLowerCase().includes(lowerFilter);
        });
      });
    }, [rows, subFilter, columns]);

    if (rows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <Search size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No hay datos en esta categoría</h3>
          <p className="text-slate-500 max-w-sm">Intenta buscar con otro término o revisa las otras pestañas de resultados.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                {columns.map((col, i) => (
                  <th key={i} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row) : <span className="text-slate-600 text-sm">{row[col.accessor] || '-'}</span>}
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      
      {/* Elementos decorativos de fondo (solo visibles en estado inicial) */}
      {!searched && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
          <div className="absolute top-[-10%] w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full"></div>
          
          {/* Grid pattern sutil */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRlcm4gaWQ9InNtYWxsR3JpZCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMTAgMEwwIDBMMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIyNiwgMjMyLCAyNDAsIDAuNSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNzbWFsbEdyaWQpIi8+PHBhdGggZD0iTTQwIDBMMCAwTDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMjYsIDIzMiwgMjQwLCAwLjgkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        </div>
      )}

      {/* HEADER & SEARCH BAR */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] z-10 ${searched ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0' : 'flex-1 flex flex-col items-center justify-center px-4 -mt-20'}`}>
        <div className={`w-full mx-auto ${searched ? 'max-w-[1600px] px-6 flex items-center gap-6' : 'max-w-3xl'}`}>
          
          {!searched && (
            <div className="text-center mb-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xl shadow-indigo-500/30 mb-8 transform hover:scale-105 transition-transform">
                <Layers size={40} strokeWidth={1.5} />
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
                Consulta <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Maestra</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                El motor de búsqueda unificado para tu inventario. Encuentra Partidas, Series, Farmapack y Dimensiones en milisegundos.
              </p>
            </div>
          )}

          {searched && (
            <div className="hidden lg:flex items-center gap-3 min-w-max group cursor-pointer" onClick={() => {setSearched(false); setSearchTerm(''); setData({partidas:[], series:[], farmapack:[], peso:[]});}}>
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Layers size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">Consulta Maestra</h1>
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className={`relative group w-full ${searched ? 'max-w-3xl' : 'animate-in slide-in-from-bottom-10 fade-in duration-700 delay-100'}`}>
            <div className={`absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl transition-opacity duration-500 ${searched ? 'opacity-0' : 'opacity-100 group-focus-within:opacity-100'}`}></div>
            
            <div className="relative flex items-center">
              <Search className={`absolute left-6 transition-colors duration-300 z-10 ${searched ? 'text-slate-400' : 'text-indigo-400'} group-focus-within:text-indigo-600`} size={searched ? 20 : 28} />
              <input
                type="text"
                placeholder="Escanea o escribe Código, Lote, Serie..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full bg-white/90 backdrop-blur-sm border-2 outline-none transition-all duration-300 font-mono uppercase text-slate-800 placeholder:text-slate-400 placeholder:font-sans placeholder:normal-case
                  ${searched 
                    ? 'pl-14 pr-32 py-2.5 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 text-base shadow-sm' 
                    : 'pl-16 pr-44 py-6 rounded-2xl border-slate-200/80 focus:border-indigo-500 focus:ring-[6px] focus:ring-indigo-500/10 text-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'
                  }`}
                autoFocus
              />
              <button 
                type="submit"
                disabled={loading || !searchTerm.trim()}
                className={`absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold transition-all duration-300 disabled:opacity-40 disabled:hover:bg-slate-900 flex items-center gap-2 overflow-hidden
                  ${searched ? 'px-5 rounded-lg text-sm' : 'px-8 rounded-xl text-base shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]'}`}
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>
                    <span className="relative z-10">BUSCAR</span>
                    {!searched && <ChevronRight size={18} className="relative z-10 -mr-2 opacity-70" />}
                  </>
                )}
              </button>
            </div>
          </form>

          {searched && lastUpdated && (
             <div className="ml-auto hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60 backdrop-blur-sm">
               <Activity size={14} className="text-emerald-500" />
               {lastUpdated.toLocaleTimeString()}
             </div>
          )}
        </div>
      </div>

      {/* RESULTADOS */}
      {searched && (
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 animate-in fade-in duration-500">
          
          {/* HEADER DE PRODUCTO Y PESOS (NUEVO) */}
          {data.peso && data.peso.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Box size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{data.peso[0].descripcion}</h3>
                  <p className="text-sm font-mono text-slate-500">{data.peso[0].codigo_producto}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Peso Unitario</span>
                  <div className="flex items-center gap-2">
                    <Scale size={16} className="text-amber-500" />
                    <span className="text-lg font-black text-slate-700">{data.peso[0].peso_unitario} <span className="text-sm font-medium text-slate-500">Kg</span></span>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dimensiones (L x A x A)</span>
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-indigo-500" />
                    <span className="text-lg font-bold text-slate-700">
                      {data.peso[0].largo || 0} <span className="text-slate-400 font-medium text-sm">x</span> {data.peso[0].ancho || 0} <span className="text-slate-400 font-medium text-sm">x</span> {data.peso[0].alto || 0} <span className="text-sm font-medium text-slate-500">cm</span>
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => window.location.href = `/inbound/cubing?code=${data.peso[0].codigo_producto}`} 
                  className="ml-auto bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
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
              const count = data[tab.id].length;
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left overflow-hidden group
                    ${isActive 
                      ? `${tab.border} ${tab.bg} shadow-md scale-[1.02]` 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white shadow-sm' : tab.bg}`}>
                      <Icon size={20} className={isActive ? tab.color : 'text-slate-500'} />
                    </div>
                    {isActive && <div className={`w-2 h-2 rounded-full ${tab.color.replace('text-', 'bg-')}`} />}
                  </div>
                  <span className="text-sm font-bold text-slate-500 mb-1">{tab.label}</span>
                  <span className={`text-3xl font-black font-mono tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                    {count}
                  </span>
                  
                  {/* Decorative background element */}
                  <div className={`absolute -right-6 -bottom-6 opacity-[0.03] transition-transform group-hover:scale-110 ${isActive ? tab.color : 'text-slate-900'}`}>
                    <Icon size={100} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Toolbar de Tabla */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 px-1">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                {TABS.find(t => t.id === activeTab)?.label}
                <span className="text-sm font-medium text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  {data[activeTab].length} resultados
                </span>
              </h2>
            </div>
            
            {/* Controles de la Tabla (Búsqueda Rápida y Exportar) */}
            {data[activeTab].length > 0 && (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder={`Filtrar ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                    value={subFilter}
                    onChange={(e) => setSubFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                  />
                  {subFilter && (
                    <button 
                      onClick={() => setSubFilter('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                >
                  <FileSpreadsheet size={16} />
                  Exportar CSV
                </button>
              </div>
            )}
          </div>

          {/* Tabla */}
          <ResultTable columns={TABLE_CONFIG[activeTab]} rows={data[activeTab]} />
          
        </div>
      )}
    </div>
  );
};

export default Batches;