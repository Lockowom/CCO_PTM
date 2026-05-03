import React, { useState } from 'react';
import { 
  Package, Search, Download, RefreshCw, Database
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BODEGAS = ['BD 21', 'BD 5', 'BD 24', 'BD 3', 'BD 7', 'BD 99', 'BD 22'];

const fetchInventory = async (bodega) => {
  let query = supabase.from('tms_inventario_general').select('*').limit(5000);
  if (bodega !== 'TODAS') {
    query = query.eq('bodega', bodega);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const Stock = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodega, setSelectedBodega] = useState('TODAS');
  const containerRef = React.useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  // 🚀 Integración de TanStack Query para Caché Automático
  const { data: items = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['inventory', selectedBodega],
    queryFn: () => fetchInventory(selectedBodega),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché antes de refetch automático
  });

  const filteredItems = items.filter(item => 
    (item.producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.codigo_producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.bodega || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="space-y-6 min-h-screen bg-wms-dark p-6 text-slate-300">
      {/* Header Glassmorphism */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-wms-panel/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-wms-border shadow-2xl relative overflow-hidden">
        {/* Destello sutil de fondo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-wms-neon/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-wms-dark/80 border border-wms-neon/50 rounded-2xl flex items-center justify-center text-wms-neon shadow-neon-green">
            <Database size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Inventario <span className="text-wms-neon">General</span></h1>
            <p className="text-slate-400 font-medium mt-1">Gestión consolidada de existencias multibodega</p>
          </div>
        </div>
        
        <div className="flex gap-3 relative z-10 flex-wrap">
          <button className="bg-wms-dark/60 border border-wms-border hover:border-wms-neon hover:text-wms-neon text-slate-300 px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm">
            <Download size={18} /> Exportar
          </button>
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-wms-neon/20 border border-wms-neon text-wms-neon hover:bg-wms-neon hover:text-wms-dark px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-neon-green transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* Main Content Glassmorphism */}
      <div className="bg-wms-panel/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-wms-border flex flex-col relative overflow-hidden mt-2">
        <div className="flex gap-4 overflow-x-auto p-6 border-b border-wms-border bg-wms-dark/40 no-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all flex-shrink-0 ${
              activeTab === 'products' 
                ? 'bg-wms-neon/20 border border-wms-neon text-wms-neon shadow-neon-green scale-[1.02]' 
                : 'bg-wms-dark/60 text-slate-500 hover:text-wms-neon hover:border-wms-neon/50 border border-wms-border'
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
                    className="w-full pl-12 pr-4 py-3.5 bg-wms-dark/80 border border-wms-border rounded-xl outline-none focus:border-wms-neon focus:ring-1 focus:ring-wms-neon transition-all font-bold text-slate-200 placeholder-slate-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Selector de Bodega */}
                <select 
                  value={selectedBodega}
                  onChange={(e) => setSelectedBodega(e.target.value)}
                  className="px-5 py-3.5 bg-wms-dark/80 border border-wms-border hover:border-wms-neon/50 text-slate-300 font-black rounded-xl outline-none focus:border-wms-neon focus:ring-1 focus:ring-wms-neon transition-all cursor-pointer"
                >
                  <option value="TODAS">TODAS LAS BODEGAS</option>
                  {BODEGAS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Tabla de Inventario */}
              <div className="overflow-x-auto rounded-2xl border border-wms-border bg-wms-dark/40 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-wms-dark/80 text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-wms-border">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Bodega</th>
                      <th className="px-6 py-4 whitespace-nowrap">Cod. Producto</th>
                      <th className="px-6 py-4 min-w-[200px]">Producto</th>
                      <th className="px-6 py-4 whitespace-nowrap">U. Medida</th>
                      <th className="px-6 py-4 text-right">Disponible</th>
                      <th className="px-6 py-4 text-right">Reserva</th>
                      <th className="px-6 py-4 text-right">Transitoria</th>
                      <th className="px-6 py-4 text-right">Consignación</th>
                      <th className="px-6 py-4 text-right text-wms-neon">Stock Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wms-border/50">
                    {isLoading ? (
                      <tr><td colSpan="9" className="p-12 text-center text-slate-400 font-bold"><RefreshCw className="animate-spin mx-auto mb-2 text-wms-neon" /> Cargando stock desde DB...</td></tr>
                    ) : filteredItems.length === 0 ? (
                      <tr><td colSpan="9" className="p-12 text-center text-slate-400 font-bold">No se encontraron productos</td></tr>
                    ) : (
                      filteredItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-wms-panel/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="bg-wms-dark border border-wms-border text-slate-300 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">
                              {item.bodega}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-black text-slate-300">{item.codigo_producto}</td>
                          <td className="px-6 py-4 font-bold text-white">{item.producto || '-'}</td>
                          <td className="px-6 py-4 font-mono text-slate-500 text-xs font-bold">{item.unidad_medida || 'UN'}</td>
                          <td className="px-6 py-4 text-right font-black text-wms-neon">{Number(item.disponible || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-wms-alert">{Number(item.reserva || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-400">{Number(item.transitoria || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-purple-400">{Number(item.consignacion || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-black text-white text-base bg-wms-dark/30">{Number(item.stock_total || 0).toLocaleString()}</td>
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
