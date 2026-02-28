// HistorialNV.jsx - Historial completo de Notas de Venta (estados REALES)
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Eye, 
  AlertCircle, 
  X, 
  Package, 
  Truck, 
  Calendar, 
  User, 
  FileText,
  Hand,
  CheckCircle,
  Clock,
  Box,
  Send,
  RefreshCw,
  Download,
  Filter,
  ThumbsUp,
  Hourglass,
  Ban,
  History,
  BarChart3,
  RotateCcw,
  Ship
} from 'lucide-react';
import { supabase } from '../../supabase';

// Todos los estados REALES
const TODOS_ESTADOS = [
  { key: 'Pendiente', label: 'Pendiente', icon: Hourglass, bgColor: 'bg-slate-500', lightBg: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-300' },
  { key: 'PENDIENTE', label: 'Pendiente', icon: Hourglass, bgColor: 'bg-slate-500', lightBg: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-300' },
  { key: 'Aprobada', label: 'Aprobada', icon: ThumbsUp, bgColor: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { key: 'Pendiente Picking', label: 'En Picking', icon: Hand, bgColor: 'bg-cyan-500', lightBg: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
  { key: 'PACKING', label: 'Packing', icon: Box, bgColor: 'bg-indigo-500', lightBg: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
  { key: 'LISTO_DESPACHO', label: 'Listo Despacho', icon: Send, bgColor: 'bg-purple-500', lightBg: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
  { key: 'Pendiente Shipping', label: 'Pend. Shipping', icon: Ship, bgColor: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  { key: 'Despachado', label: 'Despachado', icon: Truck, bgColor: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { key: 'Refacturacion', label: 'Refacturación', icon: RotateCcw, bgColor: 'bg-orange-500', lightBg: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
];

// Estados únicos para los filtros (sin duplicados)
const ESTADOS_FILTRO = [
  { key: 'Pendiente', label: 'Pendiente' },
  { key: 'Aprobada', label: 'Aprobada' },
  { key: 'Pendiente Picking', label: 'En Picking' },
  { key: 'PACKING', label: 'Packing' },
  { key: 'LISTO_DESPACHO', label: 'Listo Despacho' },
  { key: 'Pendiente Shipping', label: 'Pend. Shipping' },
  { key: 'Despachado', label: 'Despachado' },
  { key: 'Refacturacion', label: 'Refacturación' },
];

const HistorialNV = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');
  const [stats, setStats] = useState({ total: 0, despachados: 0, enProceso: 0, refacturacion: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('tms_nv_diarias')
        .select('*')
        .order('fecha_emision', { ascending: false });

      if (filterFechaDesde) {
        query = query.gte('fecha_emision', filterFechaDesde);
      }
      if (filterFechaHasta) {
        query = query.lte('fecha_emision', filterFechaHasta + 'T23:59:59');
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;

      setOrders(data || []);
      
      const all = data || [];
      setStats({
        total: all.length,
        despachados: all.filter(o => o.estado === 'Despachado').length,
        enProceso: all.filter(o => !['Despachado', 'Refacturacion'].includes(o.estado)).length,
        refacturacion: all.filter(o => o.estado === 'Refacturacion').length
      });
      
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filterFechaDesde, filterFechaHasta]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtrar
  const filteredOrders = orders.filter(order => {
    // Normalizar PENDIENTE a Pendiente para comparación
    const estadoOrder = order.estado === 'PENDIENTE' ? 'Pendiente' : order.estado;
    const matchEstado = filterEstado === 'TODOS' || estadoOrder === filterEstado;
    const matchSearch = !searchTerm || 
      order.nv?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendedor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  const getEstadoConfig = (estado) => {
    return TODOS_ESTADOS.find(e => e.key === estado) || TODOS_ESTADOS[0];
  };

  // Exportar CSV
  const exportToCSV = () => {
    const headers = ['NV', 'Fecha', 'Cliente', 'Vendedor', 'Código', 'Producto', 'Cantidad', 'Unidad', 'Estado'];
    const rows = filteredOrders.map(o => [
      o.nv, 
      o.fecha_emision || '', 
      o.cliente, 
      o.vendedor, 
      o.codigo_producto, 
      o.descripcion_producto, 
      o.cantidad, 
      o.unidad, 
      o.estado
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_nv_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 page-header">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <History className="text-white" size={24} />
            </div>
            Consulta Maestra
          </h1>
          <p className="text-slate-500 text-lg mt-2 ml-1">Visión global y trazabilidad de todas las Notas de Venta</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
          >
            <Download size={20} />
            Exportar CSV
          </button>
          <button 
            onClick={fetchOrders}
            disabled={loading}
            className="p-3 text-slate-500 hover:bg-white hover:shadow-md hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-slate-100"
            title="Actualizar datos"
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Cards Modernos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 border-slate-100">
              <BarChart3 size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Registros</p>
              <p className="text-3xl font-black text-slate-800">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 border-emerald-100">
              <Truck size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Despachados</p>
              <p className="text-3xl font-black text-emerald-600">{stats.despachados}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 border-blue-100">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">En Proceso</p>
              <p className="text-3xl font-black text-blue-600">{stats.enProceso}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-orange-50 text-orange-600 border-orange-100">
              <RotateCcw size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Refacturación</p>
              <p className="text-3xl font-black text-orange-600">{stats.refacturacion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Flotantes Modernos */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/50 flex flex-col lg:flex-row gap-2 items-center filters-bar sticky top-4 z-30 backdrop-blur-xl bg-white/90">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por NV, cliente, producto, vendedor..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400 font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border-transparent rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-600 cursor-pointer transition-colors min-w-[140px]"
          >
            <option value="TODOS">Todos los estados</option>
            {ESTADOS_FILTRO.map(e => (
              <option key={e.key} value={e.key}>{e.label}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={filterFechaDesde}
            onChange={e => setFilterFechaDesde(e.target.value)}
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border-transparent rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-600 cursor-pointer transition-colors"
          />
          <span className="self-center text-slate-300 font-bold">-</span>
          <input
            type="date"
            value={filterFechaHasta}
            onChange={e => setFilterFechaHasta(e.target.value)}
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border-transparent rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-600 cursor-pointer transition-colors"
          />
          
          {(filterEstado !== 'TODOS' || filterFechaDesde || filterFechaHasta || searchTerm) && (
            <button
              onClick={() => { setFilterEstado('TODOS'); setFilterFechaDesde(''); setFilterFechaHasta(''); setSearchTerm(''); }}
              className="px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-colors flex items-center gap-2"
              title="Limpiar filtros"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Error al cargar datos</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Tabla Moderna */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">N.V</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4 text-right">Cant.</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw size={24} className="text-indigo-600" />
                        </div>
                      </div>
                      <p className="text-slate-400 font-medium animate-pulse">Consultando base de datos...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                        <Package size={48} className="text-slate-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-600">No se encontraron registros</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const config = getEstadoConfig(order.estado);
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-black text-indigo-600 text-lg">#{order.nv}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {order.fecha_emision ? new Date(order.fecha_emision).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 truncate max-w-[200px]" title={order.cliente}>
                        {order.cliente}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium uppercase">{order.vendedor}</td>
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-600">{order.codigo_producto}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[250px] font-medium">{order.descripcion_producto}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-black text-slate-800 text-lg">{order.cantidad}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{order.unidad}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                          <config.icon size={12} /> {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 p-2 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md"
                          title="Ver Detalle"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
            <span>Mostrando {filteredOrders.length} registros</span>
            <span>Total en base de datos: {orders.length}</span>
          </div>
        )}
      </div>

      {/* Modal Detalle Moderno */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">
            {(() => {
              const config = getEstadoConfig(selectedOrder.estado);
              return (
                <div className={`${config.lightBg} p-8 flex justify-between items-start border-b ${config.borderColor}`}>
                  <div className="flex items-center gap-4">
                    <div className={`${config.bgColor} p-3 rounded-2xl text-white shadow-lg`}>
                      <FileText size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Nota de Venta</p>
                      <h2 className="text-4xl font-black text-slate-800">#{selectedOrder.nv}</h2>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <button 
                      onClick={() => setSelectedOrder(null)} 
                      className="p-2 bg-white/50 hover:bg-white rounded-full text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <X size={24} />
                    </button>
                    <span className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-wide border shadow-sm flex items-center gap-2 ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                      <config.icon size={16} /> {config.label}
                    </span>
                  </div>
                </div>
              );
            })()}
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Calendar size={16} />
                    <p className="text-xs font-bold uppercase">Fecha Emisión</p>
                  </div>
                  <p className="font-bold text-slate-800 text-lg">
                    {selectedOrder.fecha_emision ? new Date(selectedOrder.fecha_emision).toLocaleDateString() : '-'}
                  </p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <User size={16} />
                    <p className="text-xs font-bold uppercase">Cliente</p>
                  </div>
                  <p className="font-bold text-slate-800 text-lg truncate" title={selectedOrder.cliente}>
                    {selectedOrder.cliente}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Package size={120} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                      <Box size={16} />
                      <p className="text-xs font-bold uppercase">Detalle del Producto</p>
                    </div>
                    <p className="font-mono text-2xl font-black text-indigo-700 mb-1">{selectedOrder.codigo_producto}</p>
                    <p className="text-indigo-900 font-medium text-lg leading-tight">{selectedOrder.descripcion_producto}</p>
                  </div>
                  
                  <div className="flex flex-col items-end justify-center min-w-[120px] bg-white/50 p-4 rounded-2xl backdrop-blur-sm border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Cantidad</p>
                    <p className="text-4xl font-black text-indigo-600">{selectedOrder.cantidad}</p>
                    <p className="text-sm font-bold text-indigo-400">{selectedOrder.unidad}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs font-medium text-slate-400 pt-4 border-t border-slate-100">
                <span>Vendedor: {selectedOrder.vendedor || 'N/A'}</span>
                <span>ID Sistema: {selectedOrder.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialNV;
