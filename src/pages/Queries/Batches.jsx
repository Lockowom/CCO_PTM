import React, { useState } from 'react';
import { Search, Barcode, Box, Calendar, AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react';
import { supabase } from '../../supabase';

const Batches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ series: [], lotes: [] });
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    setResults({ series: [], lotes: [] });

    try {
      // 1. Buscar en Series (Equipos)
      const { data: seriesData } = await supabase
        .from('tms_series')
        .select('*')
        .ilike('serie', `%${searchTerm}%`)
        .limit(20);

      // 2. Buscar en Farmapack (Lotes)
      const { data: lotesData } = await supabase
        .from('tms_farmapack')
        .select('*')
        .ilike('lote', `%${searchTerm}%`)
        .limit(20);

      setResults({
        series: seriesData || [],
        lotes: lotesData || []
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiration = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();
    const expDate = new Date(dateStr);
    const diffTime = expDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const ExpirationBadge = ({ date }) => {
    if (!date) return <span className="text-gray-400 text-xs">Sin fecha</span>;
    
    const days = getDaysUntilExpiration(date);
    let colorClass = 'bg-green-100 text-green-700 border-green-200';
    let icon = <CheckCircle size={14} />;
    let text = `${days} días`;

    if (days < 0) {
      colorClass = 'bg-red-100 text-red-700 border-red-200';
      icon = <XCircle size={14} />;
      text = 'VENCIDO';
    } else if (days < 90) {
      colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
      icon = <AlertTriangle size={14} />;
      text = `Vence en ${days} días`;
    }

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
        {icon}
        <span>{text} ({new Date(date).toLocaleDateString()})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Consulta de Lotes y Series</h2>
        <p className="text-slate-500 text-sm">Trazabilidad de productos serializados y lotes farmacéuticos</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Barcode className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Escanea o escribe Lote / N° Serie..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-lg transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
            />
            <button 
                type="submit"
                className="absolute right-2 top-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
                disabled={loading}
            >
                {loading ? 'Buscando...' : 'Buscar'}
            </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Sección Series */}
            {(results.series.length > 0 || results.lotes.length === 0) && (
                <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Box size={20} className="text-blue-500" /> 
                        Equipos Serializados ({results.series.length})
                    </h3>
                    
                    {results.series.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.series.map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-blue-50 text-blue-700 text-xs font-mono font-bold px-2 py-1 rounded">
                                            SN: {item.serie}
                                        </span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.estado === 'DESPACHADO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {item.estado || 'EN BODEGA'}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{item.producto || 'Producto Desconocido'}</h4>
                                    <p className="text-xs text-slate-500 mb-3">SKU: {item.codigo_producto}</p>
                                    
                                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Box size={14} />
                                            <span>{item.ubicacion_actual || 'Bodega Central'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        results.lotes.length === 0 && <p className="text-slate-400 text-sm italic">No se encontraron series.</p>
                    )}
                </div>
            )}

            {/* Sección Lotes */}
            {(results.lotes.length > 0 || results.series.length === 0) && (
                <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Package size={20} className="text-emerald-500" /> 
                        Lotes Farmacéuticos ({results.lotes.length})
                    </h3>
                    
                    {results.lotes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.lotes.map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="bg-emerald-50 text-emerald-700 text-xs font-mono font-bold px-2 py-1 rounded">
                                            LOTE: {item.lote}
                                        </span>
                                        <span className="font-bold text-slate-800 text-lg">{item.cantidad} UN</span>
                                    </div>
                                    
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{item.producto || 'Producto Desconocido'}</h4>
                                    <p className="text-xs text-slate-500 mb-4">SKU: {item.codigo_producto}</p>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400 font-bold uppercase">Vencimiento</span>
                                            <ExpirationBadge date={item.fecha_venc} />
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                            <span className="text-xs text-slate-400">Estado Calidad</span>
                                            <span className={`text-xs font-bold ${item.estado_calidad === 'LIBERADO' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {item.estado_calidad || 'EN CUARENTENA'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        results.series.length === 0 && <p className="text-slate-400 text-sm italic">No se encontraron lotes.</p>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Batches;
