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

  // Definición de Vistas (Tabs)
  const TABS = [
    { id: 'partidas', label: 'PARTIDAS', icon: Layers, color: 'blue' },
    { id: 'series', label: 'SERIES', icon: Barcode, color: 'indigo' },
    { id: 'farmapack', label: 'FARMAPACK', icon: Package, color: 'emerald' },
    { id: 'peso', label: 'PESO', icon: Scale, color: 'amber' },
    { id: 'ubicaciones', label: 'UBICACIONES', icon: MapPin, color: 'rose' }
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
          let query = supabase.from(table).select('*').limit(100);
          const orFilter = cols.map(c => `${c}.ilike.${term}`).join(',');
          query = query.or(orFilter);
          
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        } catch (err) {
          console.warn(`Error buscando en ${table}, reintentando solo por código:`, err);
          // 2. Fallback: Buscar solo por primera columna (usualmente código)
          const { data } = await supabase.from(table).select('*').ilike(cols[0], term).limit(100);
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
      newData.peso = w; // Peso ahora es array para tabla
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

  // Componente de Tabla Genérica
  const ResultTable = ({ columns, rows, color }) => {
    if (rows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
          <Search size={48} className="mb-4 opacity-20" />
          <p>Sin resultados en esta vista</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left">
          <thead className={`text-xs text-white uppercase bg-${color}-600`}>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 font-bold whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 whitespace-nowrap text-slate-700">
                    {col.render ? col.render(row) : (row[col.accessor] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Configuraciones de Columnas por Tab
  const TABLE_CONFIG = {
    partidas: [
      { header: 'Código', accessor: 'codigo_producto' },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-slate-800">{r.producto || r.descripcion}</span> },
      { header: 'Lote / Partida', accessor: 'partida', render: r => <span className="font-mono bg-slate-100 px-1 rounded">{r.partida}</span> },
      { header: 'Vencimiento', accessor: 'fecha_venc', render: r => r.fecha_venc ? new Date(r.fecha_venc).toLocaleDateString() : '-' },
      { header: 'Stock Total', accessor: 'stock_total', render: r => <span className="font-mono">{r.stock_total}</span> },
      { header: 'Disponible', accessor: 'cantidad_actual', render: r => <span className="font-bold text-green-600">{r.cantidad_actual || r.disponible}</span> }
    ],
    series: [
      { header: 'Código', accessor: 'codigo_producto' },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-slate-800">{r.producto}</span> },
      { header: 'Serie (SN)', accessor: 'serie', render: r => <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">{r.serie}</span> },
      { header: 'Estado', accessor: 'estado', render: r => <span className={`text-xs px-2 py-1 rounded-full ${r.estado === 'DISPONIBLE' || r.estado === 'EN_BODEGA' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.estado}</span> },
      { header: 'Ubicación', accessor: 'ubicacion_actual' },
      { header: 'Disponible', accessor: 'disponible' }
    ],
    farmapack: [
      { header: 'Código', accessor: 'codigo_producto' },
      { header: 'Producto', accessor: 'producto', render: r => <span className="font-bold text-slate-800">{r.producto}</span> },
      { header: 'Lote', accessor: 'lote', render: r => <span className="font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{r.lote}</span> },
      { header: 'Vencimiento', accessor: 'fecha_venc', render: r => r.fecha_venc ? new Date(r.fecha_venc).toLocaleDateString() : '-' },
      { header: 'Calidad', accessor: 'estado_calidad' },
      { header: 'Disponible', accessor: 'cantidad', render: r => <span className="font-bold text-emerald-600">{r.cantidad || r.disponible}</span> }
    ],
    peso: [
      { header: 'Código', accessor: 'codigo_producto' },
      { header: 'Descripción', accessor: 'descripcion', render: r => <span className="font-bold text-slate-800">{r.descripcion}</span> },
      { header: 'Peso Unitario (Kg)', accessor: 'peso_unitario', render: r => <span className="font-mono">{r.peso_unitario}</span> },
      { header: 'Largo', accessor: 'largo' },
      { header: 'Ancho', accessor: 'ancho' },
      { header: 'Alto', accessor: 'alto' }
    ],
    ubicaciones: [
      { header: 'Ubicación', accessor: 'ubicacion', render: r => <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">{r.ubicacion}</span> },
      { header: 'Código', accessor: 'codigo_producto' },
      { header: 'Descripción', accessor: 'descripcion' },
      { header: 'Cantidad', accessor: 'cantidad', render: r => <span className="font-bold">{r.cantidad}</span> },
      { header: 'Serie/Lote', accessor: 'serie', render: r => r.serie || r.partida || '-' },
      { header: 'Usuario', accessor: 'usuario' },
      { header: 'Fecha', accessor: 'fecha_registro', render: r => new Date(r.fecha_registro).toLocaleDateString() + ' ' + new Date(r.fecha_registro).toLocaleTimeString() }
    ]
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 1. Header de Búsqueda */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
               <Layers className="text-blue-600" />
               CONSULTA MAESTRA
             </h1>
             {searched && (
               <div className="text-xs text-slate-400 flex items-center gap-1">
                 <RefreshCw size={12} />
                 Actualizado: {lastUpdated.toLocaleTimeString()}
               </div>
             )}
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 text-lg bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all shadow-inner uppercase font-mono text-slate-700 placeholder:text-slate-400"
              placeholder="BUSCAR POR CÓDIGO, DESCRIPCIÓN, LOTE O SERIE..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" /> : 'BUSCAR'}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Tabs de Navegación (Estilo Dashboard) */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-0">
        <div className="max-w-7xl mx-auto w-full px-4">
          <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const count = data[tab.id].length;
              const Icon = tab.icon;
              
              // Clases dinámicas según color
              const activeClasses = {
                blue: 'bg-blue-50 border-blue-200 text-blue-700',
                indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                amber: 'bg-amber-50 border-amber-200 text-amber-700',
                rose: 'bg-rose-50 border-rose-200 text-rose-700',
              };

              const badgeClasses = {
                blue: 'bg-blue-600 text-white',
                indigo: 'bg-indigo-600 text-white',
                emerald: 'bg-emerald-600 text-white',
                amber: 'bg-amber-600 text-white',
                rose: 'bg-rose-600 text-white',
              };

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg border-b-4 transition-all min-w-[140px]
                    ${isActive 
                      ? `${activeClasses[tab.color]} border-${tab.color}-500 shadow-sm` 
                      : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? '' : 'opacity-50'} />
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold mt-1 ${isActive ? badgeClasses[tab.color] : 'bg-slate-100 text-slate-500'}`}>
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
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto w-full">
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
              <Layers size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Ingrese un término para comenzar la búsqueda</p>
              <p className="text-sm">Puede buscar en todas las tablas simultáneamente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Batches;