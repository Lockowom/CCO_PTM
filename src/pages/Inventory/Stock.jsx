import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, AlertTriangle, 
  ArrowUpRight, ArrowDownLeft, Move, Download, RefreshCw, Database
} from 'lucide-react';
import { supabase } from '../../supabase';

const BODEGAS = ['BD 21', 'BD 5', 'BD 24', 'BD 3', 'BD 7', 'BD 99', 'BD 22'];

const Stock = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodega, setSelectedBodega] = useState('TODAS');
  
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  useEffect(() => {
    fetchData();
  }, [selectedBodega]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('tms_inventario_general')
        .select('*')
        .limit(5000);
        
      if (selectedBodega !== 'TODAS') {
        query = query.eq('bodega', selectedBodega);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error consultando inventario general:", error);
        setItems([]);
        return;
      }

      setItems(data || []);

      // Calcular estadísticas
      const total = (data || []).reduce((sum, i) => sum + (Number(i.stock_total) || 0), 0);
      const low = (data || []).filter(i => (Number(i.stock_total) || 0) > 0 && (Number(i.stock_total) || 0) <= 10).length;
      const out = (data || []).filter(i => (Number(i.stock_total) || 0) <= 0).length;

      setStats({
        totalItems: (data || []).length,
        totalStock: total,
        lowStock: low,
        outOfStock: out
      });

    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    (item.producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.codigo_producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.bodega || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 min-h-screen bg-slate-50/50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Línea superior decorativa */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Database size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventario <span className="text-orange-500">General</span></h1>
            <p className="text-slate-500 font-medium mt-1">Gestión consolidada de existencias multibodega</p>
          </div>
        </div>
        
        <div className="flex gap-3 relative z-10 flex-wrap">
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

      {/* Main Content */}
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
            <Package size={18} /> Stock Consolidado
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Filtros y Buscador */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar producto por código, nombre o bodega..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-slate-700 placeholder-slate-400 shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Selector de Bodega */}
                <select 
                  value={selectedBodega}
                  onChange={(e) => setSelectedBodega(e.target.value)}
                  className="px-5 py-3.5 bg-white border-2 border-slate-200 hover:border-orange-300 text-slate-700 font-black rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm cursor-pointer"
                >
                  <option value="TODAS">TODAS LAS BODEGAS</option>
                  {BODEGAS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Tabla de Inventario */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Bodega</th>
                      <th className="px-6 py-4 whitespace-nowrap">Cod. Producto</th>
                      <th className="px-6 py-4 min-w-[200px]">Producto</th>
                      <th className="px-6 py-4 whitespace-nowrap">Cod. U. Medida</th>
                      <th className="px-6 py-4 text-right">Disponible</th>
                      <th className="px-6 py-4 text-right">Reserva</th>
                      <th className="px-6 py-4 text-right">Transitoria</th>
                      <th className="px-6 py-4 text-right">Consignación</th>
                      <th className="px-6 py-4 text-right">Stock Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="9" className="p-12 text-center text-slate-400 font-bold"><RefreshCw className="animate-spin mx-auto mb-2" /> Cargando stock multibodega...</td></tr>
                    ) : filteredItems.length === 0 ? (
                      <tr><td colSpan="9" className="p-12 text-center text-slate-400 font-bold">No se encontraron productos en el inventario general</td></tr>
                    ) : (
                      filteredItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-orange-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">
                              {item.bodega}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-black text-slate-700">{item.codigo_producto}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{item.producto || '-'}</td>
                          <td className="px-6 py-4 font-mono text-slate-500 text-xs font-bold">{item.unidad_medida || 'UN'}</td>
                          <td className="px-6 py-4 text-right font-black text-emerald-600">{Number(item.disponible || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-amber-500">{Number(item.reserva || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-500">{Number(item.transitoria || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-purple-500">{Number(item.consignacion || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-black text-slate-900 text-base">{Number(item.stock_total || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stock;
