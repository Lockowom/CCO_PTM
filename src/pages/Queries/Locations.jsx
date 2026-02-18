import React, { useState } from 'react';
import { Search, MapPin, Box, Layers, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase';

const LocationsQuery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    
    const term = `%${searchTerm.trim()}%`;

    try {
      // Buscar en wms_ubicaciones por código o descripción
      const { data, error } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .or(`codigo.ilike.${term},descripcion.ilike.${term},ubicacion.ilike.${term}`)
        .limit(100);

      if (error) throw error;

      setResults(data || []);
      setLastUpdated(new Date());

    } catch (err) {
      console.error("Error en búsqueda de ubicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Configuración de columnas para la tabla de resultados
  const COLUMNS = [
    { header: 'Ubicación', accessor: 'ubicacion', render: r => <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 flex items-center gap-2 w-fit"><MapPin size={14}/>{r.ubicacion}</span> },
    { header: 'Código', accessor: 'codigo', render: r => <span className="font-mono font-bold text-slate-700">{r.codigo}</span> },
    { header: 'Descripción', accessor: 'descripcion', render: r => <span className="font-bold text-slate-800">{r.descripcion}</span> },
    { header: 'Cantidad', accessor: 'cantidad', render: r => <span className="font-black text-slate-900 bg-slate-100 px-2 py-1 rounded">{r.cantidad}</span> },
    { header: 'Talla', accessor: 'talla', render: r => r.talla || '-' },
    { header: 'Color', accessor: 'color', render: r => r.color || '-' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      {/* 1. Header de Búsqueda */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
               <div className="p-2 bg-slate-900 rounded-lg text-white">
                 <MapPin size={24} />
               </div>
               CONSULTA DE UBICACIONES
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
              className="w-full pl-14 pr-32 py-4 text-xl bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-inner uppercase font-mono text-slate-800 placeholder:text-slate-400"
              placeholder="BUSCAR POR CÓDIGO O DESCRIPCIÓN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={28} />
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

      {/* 2. Área de Contenido */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto w-full">
          {searched ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50/50 rounded-lg border border-slate-200 border-dashed backdrop-blur-sm">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">No se encontraron productos en ubicaciones con ese término</p>
                </div>
               ) : (
                <div className="overflow-hidden rounded-lg shadow-lg border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-white uppercase bg-orange-600">
                        <tr>
                          {COLUMNS.map((col, i) => (
                            <th key={i} className="px-4 py-3 font-bold whitespace-nowrap tracking-wider">
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.map((row, idx) => (
                          <tr key={idx} className="hover:bg-orange-50 transition-colors even:bg-slate-50/30">
                            {COLUMNS.map((col, cIdx) => (
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
               )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 mt-20">
              <div className="p-8 bg-white rounded-full shadow-sm mb-6 border border-slate-100">
                <MapPin size={64} className="text-orange-200" />
              </div>
              <p className="text-xl font-bold text-slate-400">Ingrese código o descripción para buscar ubicación</p>
              <p className="text-sm text-slate-400 mt-2">Sistema de consulta rápida WMS</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationsQuery;
