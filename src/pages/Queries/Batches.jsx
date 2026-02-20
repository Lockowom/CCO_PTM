import React, { useState, useEffect } from 'react';
import { Search, Barcode, Box, Package, Layers, Scale, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase';

const Batches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('partidas');
  const [data, setData] = useState({
    partidas: [],
    series: [],
    farmapack: [],
    peso: [],
    ubicaciones: []
  });
  const [searched, setSearched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Definición de Vistas (Tabs) con Colores "Legacy"
  const TABS = [
    { id: 'partidas', label: 'PARTIDAS', icon: Layers, color: 'blue', shortcut: '1' },
    { id: 'series', label: 'SERIES', icon: Barcode, color: 'indigo', shortcut: '2' },
    { id: 'farmapack', label: 'FARMAPACK', icon: Package, color: 'emerald', shortcut: '3' },
    { id: 'peso', label: 'PESO', icon: Scale, color: 'amber', shortcut: '4' },
    { id: 'ubicaciones', label: 'UBICACIONES', icon: MapPin, color: 'rose', shortcut: '5' }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    
    const term = `%${searchTerm.trim()}%`;
    const newData = { partidas: [], series: [], farmapack: [], peso: [], ubicaciones: [] };

    try {
      // Función helper para buscar en Supabase con OR condition
      const searchTable = async (table, cols) => {
        try {
          // 1. Intentar búsqueda con OR (Code OR Desc)
          let query = supabase.from(table).select('*'); // Sin límite explícito (o default de Supabase)
          const orFilter = cols.map(c => `${c}.ilike.${term}`).join(',');
          query = query.or(orFilter);
          
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        } catch (err) {
          console.warn(`Error buscando en ${table}, reintentando solo por código:`, err);
          // 2. Fallback: Buscar solo por primera columna (usualmente código)
          const { data } = await supabase.from(table).select('*').ilike(cols[0], term);
          return data || [];
        }
      };

      // Ejecutar búsquedas en paralelo
      const [p, s, f, w, u] = await Promise.all([
        searchTable('tms_partidas', ['codigo_producto', 'producto']),
        searchTable('tms_series', ['codigo_producto', 'producto', 'serie']),
        searchTable('tms_farmapack', ['codigo_producto', 'producto', 'lote']),
        searchTable('tms_pesos', ['codigo_producto', 'descripcion']),
        searchTable('tms_ubicaciones_historial', ['codigo_producto', 'descripcion', 'ubicacion'])
      ]);

      newData.partidas = p;
      newData.series = s;
      newData.farmapack = f;
      newData.peso = w; 
      newData.ubicaciones = u;

      setData(newData);
      setLastUpdated(new Date());

      // Auto-seleccionar tab con resultados si el actual está vacío
      if (newData[activeTab].length === 0) {
        const firstWithData = TABS.find(t => newData[t.id].length > 0);
        if (firstWithData) setActiveTab(firstWithData.id);
      }

    } catch (err) {
      console.error("Error en búsqueda global:", err);
    } finally {
      setLoading(false);
    }
  };

  // Componente de Tabla Genérica Estilo "Legacy"
  const ResultTable = ({ columns, rows, color }) => {
    if (rows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50/50 rounded-lg border border-slate-200 border-dashed backdrop-blur-sm">
          <Search size={48} className="mb-4 opacity-20" />
          <p className="font-medium">Sin resultados en esta vista</p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-lg shadow-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`text-xs text-white uppercase bg-${color}-600`}>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 font-bold whitespace-nowrap tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors even:bg-slate-50/30">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-slate-700">
                      {col.render ? col.render(row) : (row[col.accessor] || '-')}
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

  // Configuraciones de Columnas (COMPLETAS SEGÚN REQUERIMIENTO)
  const TABLE_CONFIG = {
    partidas: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono font-bold text-slate-700">{r.codigo_producto}</span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-slate-800 whitespace-normal block" title={r.producto || r.descripcion}>{r.producto || r.descripcion}</span> },
      { header: 'U. Medida', accessor: 'unidad_medida' },
      { header: 'Partida / Talla', accessor: 'partida', render: r => <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{r.partida}</span> },
      { header: 'Fecha Venc', accessor: 'fecha_vencimiento', render: r => r.fecha_vencimiento ? new Date(r.fecha_vencimiento).toLocaleDateString() : '-' },
      { header: 'Disponible', accessor: 'disponible', render: r => <span className="font-bold text-green-600">{r.disponible}</span> },
      { header: 'Reserva', accessor: 'reserva' },
      { header: 'Transitoria', accessor: 'transitoria' },
      { header: 'Consignación', accessor: 'consignacion' },
      { header: 'Stock Total', accessor: 'stock_total', render: r => <span className="font-bold">{r.stock_total || r.cantidad_inicial}</span> },
      { header: 'Estado', accessor: 'estado', render: r => <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{r.estado}</span> }
    ],
    series: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono font-bold text-slate-700">{r.codigo_producto}</span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-slate-800 whitespace-normal block" title={r.producto}>{r.producto}</span> },
      { header: 'U. Medida', accessor: 'unidad_medida' },
      { header: 'Serie (SN)', accessor: 'serie', render: r => <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">{r.serie}</span> },
      { header: 'Disponible', accessor: 'disponible', render: r => <span className="font-bold text-green-600">{r.disponible}</span> },
      { header: 'Reserva', accessor: 'reserva' },
      { header: 'Transitoria', accessor: 'transitoria' },
      { header: 'Consignación', accessor: 'consignacion' },
      { header: 'Stock Total', accessor: 'stock_total', render: r => <span className="font-bold">{r.stock_total}</span> },
      { header: 'Estado', accessor: 'estado', render: r => <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.estado === 'DISPONIBLE' || r.estado === 'EN_BODEGA' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.estado}</span> }
    ],
    farmapack: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono font-bold text-slate-700">{r.codigo_producto}</span> },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-slate-800 whitespace-normal block" title={r.producto}>{r.producto}</span> },
      { header: 'U. Medida', accessor: 'unidad_medida' },
      { header: 'Lote', accessor: 'lote', render: r => <span className="font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{r.lote}</span> },
      { header: 'Fecha Venc', accessor: 'fecha_vencimiento', render: r => r.fecha_vencimiento ? new Date(r.fecha_vencimiento).toLocaleDateString() : '-' },
      { header: 'Disponible', accessor: 'disponible', render: r => <span className="font-bold text-green-600">{r.disponible}</span> },
      { header: 'Reserva', accessor: 'reserva' },
      { header: 'Transitoria', accessor: 'transitoria' },
      { header: 'Consignación', accessor: 'consignacion' },
      { header: 'Stock Total', accessor: 'stock_total', render: r => <span className="font-bold">{r.stock_total}</span> }
    ],
    peso: [
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono font-bold text-slate-700">{r.codigo_producto}</span> },
      { header: 'Descripción', accessor: 'descripcion', render: r => <span className="font-bold text-slate-800 whitespace-normal block">{r.descripcion}</span> },
      { header: 'Peso Unitario (Kg)', accessor: 'peso_unitario', render: r => <span className="font-mono font-bold text-amber-600">{r.peso_unitario}</span> },
      { header: 'Largo', accessor: 'largo' },
      { header: 'Ancho', accessor: 'ancho' },
      { header: 'Alto', accessor: 'alto' }
    ],
    ubicaciones: [
      { header: 'Ubicación', accessor: 'ubicacion', render: r => <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">{r.ubicacion}</span> },
      { header: 'Código', accessor: 'codigo_producto', render: r => <span className="font-mono text-slate-600">{r.codigo_producto}</span> },
      { header: 'Descripción', accessor: 'descripcion', render: r => <span className="font-bold text-slate-800 whitespace-normal block">{r.descripcion}</span> },
      { header: 'Cantidad', accessor: 'cantidad', render: r => <span className="font-bold">{r.cantidad}</span> },
      { header: 'Serie/Lote', accessor: 'serie', render: r => r.serie || r.partida || '-' },
      { header: 'Usuario', accessor: 'usuario', render: r => <span className="text-xs bg-slate-100 px-1 rounded">{r.usuario}</span> },
      { header: 'Fecha', accessor: 'fecha_registro', render: r => <span className="text-xs text-slate-500">{new Date(r.fecha_registro).toLocaleDateString()}</span> }
    ]
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      {/* 1. Header de Búsqueda */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
               <div className="p-2 bg-slate-900 rounded-lg text-white">
                 <Layers size={24} />
               </div>
               CONSULTA MAESTRA
             </h1>
             {searched && (
               <div className="text-xs font-mono text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                 <RefreshCw size={12} />
                 SYNC: {lastUpdated.toLocaleTimeString()}
               </div>
             )}
          </div>
          
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              className="w-full pl-14 pr-32 py-4 text-xl bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner uppercase font-mono text-slate-800 placeholder:text-slate-400"
              placeholder="BUSCAR PRODUCTO, CÓDIGO, LOTE O SERIE..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={28} />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 bg-slate-900 hover:bg-black text-white px-8 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" /> : 'BUSCAR'}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Tabs de Navegación (Chips Estilo Legacy) */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-0">
        <div className="max-w-[1600px] mx-auto w-full px-4">
          <div className="flex space-x-2 overflow-x-auto py-3 no-scrollbar">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const count = data[tab.id].length;
              const Icon = tab.icon;
              
              // Colores específicos para el estado activo
              const colors = {
                blue: 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30',
                indigo: 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/30',
                emerald: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/30',
                amber: 'bg-amber-600 border-amber-600 text-white shadow-amber-500/30',
                rose: 'bg-rose-600 border-rose-600 text-white shadow-rose-500/30',
              };

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all duration-200 min-w-[160px] overflow-hidden
                    ${isActive 
                      ? `${colors[tab.color]} shadow-lg scale-105` 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className={`
                    absolute top-0 right-0 p-2 opacity-10 transform translate-x-1/4 -translate-y-1/4 transition-transform group-hover:scale-110
                    ${isActive ? 'text-white' : 'text-slate-900'}
                  `}>
                    <Icon size={64} />
                  </div>

                  <Icon size={24} className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  
                  <div className="flex flex-col items-start relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">{tab.label}</span>
                    <span className={`text-xl font-black font-mono leading-none ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Área de Contenido */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto w-full">
          {searched ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <ResultTable 
                 columns={TABLE_CONFIG[activeTab]} 
                 rows={data[activeTab]} 
                 color={TABS.find(t => t.id === activeTab).color} 
               />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 mt-20">
              <div className="p-8 bg-white rounded-full shadow-sm mb-6 border border-slate-100">
                <Layers size={64} className="text-slate-200" />
              </div>
              <p className="text-xl font-bold text-slate-400">Ingrese un término para comenzar</p>
              <p className="text-sm text-slate-400 mt-2">Búsqueda multi-tabla optimizada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Batches;