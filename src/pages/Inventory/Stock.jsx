import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, AlertTriangle, 
  ArrowUpRight, ArrowDownLeft, Move, Download, RefreshCw 
} from 'lucide-react';
import { supabase } from '../../supabase';
import BarChart from '../../components/Charts/BarChart';

const Stock = () => {
  const [activeTab, setActiveTab] = useState('products'); // products | movements
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener Inventario Consolidado (Partidas + Series + Farmapack)
      // Aumentado a 5000 para evitar que el límite de 1000 corte resultados silenciosamente
      const [partidas, series, farmapack] = await Promise.all([
        supabase.from('tms_partidas').select('*').limit(5000),
        supabase.from('tms_series').select('*').limit(5000),
        supabase.from('tms_farmapack').select('*').limit(5000)
      ]);

      // Unificar datos
      const allItems = [
        ...(partidas.data || []).map(i => ({ ...i, tipo: 'PARTIDA', cantidad: i.cantidad_actual || i.disponible })),
        ...(series.data || []).map(i => ({ ...i, tipo: 'SERIE', cantidad: i.disponible })),
        ...(farmapack.data || []).map(i => ({ ...i, tipo: 'FARMAPACK', cantidad: i.cantidad || i.disponible }))
      ];

      setItems(allItems);

      // Calcular estadísticas
      const total = allItems.reduce((sum, i) => sum + (Number(i.cantidad) || 0), 0);
      const low = allItems.filter(i => (Number(i.cantidad) || 0) > 0 && (Number(i.cantidad) || 0) <= 10).length;
      const out = allItems.filter(i => (Number(i.cantidad) || 0) <= 0).length;

      setStats({
        totalItems: total,
        lowStock: low,
        outOfStock: out,
        totalValue: allItems.length
      });

      // 2. Obtener Movimientos (Simulados o desde tabla historial si existe)
      // Si no existe tabla de movimientos unificada, usaremos datos dummy por ahora para el gráfico
      // En una implementación real, se consultaría 'tms_movimientos'
      
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    (item.producto || item.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.codigo_producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.ubicacion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Configuración del Gráfico
  const chartData = [
    { name: 'Lun', entradas: 12, salidas: 2 },
    { name: 'Mar', entradas: 19, salidas: 3 },
    { name: 'Mié', entradas: 3, salidas: 20 },
    { name: 'Jue', entradas: 5, salidas: 5 },
    { name: 'Vie', entradas: 2, salidas: 1 },
    { name: 'Sáb', entradas: 3, salidas: 4 },
    { name: 'Dom', entradas: 10, salidas: 7 },
  ];

  return (
    <div className="space-y-6 min-h-screen bg-slate-50/50 p-6">
      {/* Header & KPIs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          {/* Línea superior decorativa */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Package size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventario <span className="text-orange-500">General</span></h1>
              <p className="text-slate-500 font-medium mt-1">Gestión consolidada de existencias</p>
            </div>
          </div>
          
          <div className="flex gap-3 relative z-10">
            <button className="bg-white border-2 border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm">
              <Download size={18} /> Exportar
            </button>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-orange-500 hover:to-amber-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200 flex flex-col relative overflow-hidden mt-2">
        <div className="flex gap-4 overflow-x-auto p-6 border-b border-slate-100 bg-slate-50/50 no-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all flex-shrink-0 ${
              activeTab === 'products' 
                ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]' 
                : 'bg-white text-slate-500 hover:text-orange-600 hover:bg-orange-50 border border-slate-200'
            }`}
          >
            <Package size={18} /> Productos
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all flex-shrink-0 ${
              activeTab === 'movements' 
                ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]' 
                : 'bg-white text-slate-500 hover:text-orange-600 hover:bg-orange-50 border border-slate-200'
            }`}
          >
            <Move size={18} /> Movimientos
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por código, descripción o ubicación..."
                    className="w-full md:w-96 pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-slate-700 placeholder-slate-400 shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="px-5 py-3.5 bg-white border-2 border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                  <Filter size={18} /> Filtros Avanzados
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Código</th>
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Lote / Serie</th>
                      <th className="px-6 py-4">Ubicación</th>
                      <th className="px-6 py-4 text-right">Cantidad</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="7" className="p-8 text-center text-slate-400">Cargando datos...</td></tr>
                    ) : filteredItems.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-slate-400">No se encontraron productos</td></tr>
                    ) : (
                      filteredItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.codigo_producto}</td>
                          <td className="px-6 py-4 font-medium text-slate-800 whitespace-normal" title={item.producto || item.descripcion}>
                            {item.producto || item.descripcion}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono border border-slate-200">
                              {item.lote || item.serie || item.partida || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                            {item.ubicacion || item.ubicacion_actual || '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-800 text-base">
                            {item.cantidad}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              (item.cantidad > 10) 
                                ? 'bg-green-100 text-green-700' 
                                : (item.cantidad > 0) 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {(item.cantidad > 10) ? 'NORMAL' : (item.cantidad > 0) ? 'BAJO' : 'AGOTADO'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-orange-600 hover:text-orange-800 font-medium text-xs hover:underline">
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-md shadow-slate-200/40">
                <h3 className="font-bold text-slate-700 mb-4">Actividad Reciente</h3>
                <div className="h-64">
                  <BarChart 
                    data={chartData} 
                    multipleKeys={[
                        { key: 'entradas', label: 'Entradas', color: '#10b981' },
                        { key: 'salidas', label: 'Salidas', color: '#ef4444' }
                    ]}
                    height={250}
                  />
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-inner">
                <h3 className="font-bold text-slate-700 mb-4">Últimos Movimientos</h3>
                <div className="space-y-3">
                  {[1,2,3,4,5].map((_, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {i % 2 === 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">PROD-00{i}</div>
                          <div className="text-[10px] text-slate-500">Hace {i * 10} min</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-700">
                        {i % 2 === 0 ? '+50' : '-12'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stock;