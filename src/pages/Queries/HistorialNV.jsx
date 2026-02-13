// HistorialNV.jsx - Historial completo de Notas de Venta
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
  TrendingUp,
  BarChart3,
  CalendarDays
} from 'lucide-react';
import { supabase } from '../../supabase';

// Todos los estados posibles
const TODOS_ESTADOS = [
  { key: 'PENDIENTE', label: 'Pendiente', icon: Hourglass, bgColor: 'bg-slate-500', lightBg: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-300' },
  { key: 'APROBADA', label: 'Aprobada', icon: ThumbsUp, bgColor: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { key: 'PICKING', label: 'En Picking', icon: Hand, bgColor: 'bg-cyan-500', lightBg: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
  { key: 'PACKING', label: 'En Packing', icon: Box, bgColor: 'bg-indigo-500', lightBg: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
  { key: 'DESPACHO', label: 'Listo Despacho', icon: Send, bgColor: 'bg-purple-500', lightBg: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
  { key: 'DESPACHADO', label: 'Despachado', icon: Truck, bgColor: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  { key: 'ENTREGADO', label: 'Entregado', icon: CheckCircle, bgColor: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { key: 'ANULADA', label: 'Anulada', icon: Ban, bgColor: 'bg-red-500', lightBg: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
];

const HistorialNV = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');
  
  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    entregadas: 0,
    despachadas: 0,
    anuladas: 0,
    enProceso: 0
  });
  
  // Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cargar órdenes
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar TODAS las N.V. (historial completo)
      let query = supabase
        .from('tms_nv_diarias')
        .select('*')
        .order('fecha_emision', { ascending: false });

      // Aplicar filtro de fecha si existe
      if (filterFechaDesde) {
        query = query.gte('fecha_emision', filterFechaDesde);
      }
      if (filterFechaHasta) {
        query = query.lte('fecha_emision', filterFechaHasta + 'T23:59:59');
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;

      setOrders(data || []);
      
      // Calcular estadísticas
      const all = data || [];
      setStats({
        total: all.length,
        entregadas: all.filter(o => o.estado === 'ENTREGADO').length,
        despachadas: all.filter(o => o.estado === 'DESPACHADO').length,
        anuladas: all.filter(o => o.estado === 'ANULADA').length,
        enProceso: all.filter(o => ['PENDIENTE', 'APROBADA', 'PICKING', 'PACKING', 'DESPACHO'].includes(o.estado)).length
      });
      
    } catch (error) {
      console.error("Error cargando historial:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filterFechaDesde, filterFechaHasta]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const matchEstado = filterEstado === 'TODOS' || order.estado === filterEstado;
    const matchSearch = !searchTerm || 
      order.nv?.toString().includes(searchTerm) ||
      order.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendedor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  // Obtener config del estado
  const getEstadoConfig = (estado) => {
    return TODOS_ESTADOS.find(e => e.key === estado) || TODOS_ESTADOS[0];
  };

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['NV', 'Fecha', 'Cliente', 'Vendedor', 'Código', 'Producto', 'Cantidad', 'Unidad', 'Estado'];
    const rows = filteredOrders.map(o => [
      o.nv,
      o.fecha_emision ? new Date(o.fecha_emision).toLocaleDateString() : '',
      o.cliente,
      o.vendedor,
      o.codigo_producto,
      o.descripcion_producto,
      o.cantidad,
      o.unidad,
      o.estado
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_nv_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <History className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Historial de N.V.</h2>
            <p className="text-slate-500 text-sm">Registro completo de todas las notas de venta</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <button 
            onClick={fetchOrders}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase">Total</span>
            <BarChart3 size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-600 text-xs font-semibold uppercase">Entregadas</span>
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.entregadas}</p>
          <p className="text-xs text-emerald-500">{stats.total > 0 ? Math.round((stats.entregadas / stats.total) * 100) : 0}% del total</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-600 text-xs font-semibold uppercase">Despachadas</span>
            <Truck size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.despachadas}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-600 text-xs font-semibold uppercase">En Proceso</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.enProceso}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-600 text-xs font-semibold uppercase">Anuladas</span>
            <Ban size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.anuladas}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-700">Filtros</h3>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Buscar</label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3 py-2">
              <Search size={16} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="NV, cliente, producto, vendedor..." 
                className="outline-none text-sm bg-transparent w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Estado */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="TODOS">Todos los estados</option>
              {TODOS_ESTADOS.map(estado => (
                <option key={estado.key} value={estado.key}>{estado.label}</option>
              ))}
            </select>
          </div>
          
          {/* Fecha Desde */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Desde</label>
            <input
              type="date"
              value={filterFechaDesde}
              onChange={e => setFilterFechaDesde(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          
          {/* Fecha Hasta */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
            <input
              type="date"
              value={filterFechaHasta}
              onChange={e => setFilterFechaHasta(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>
        
        {/* Botones de filtro rápido por estado */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setFilterEstado('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterEstado === 'TODOS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({stats.total})
          </button>
          {TODOS_ESTADOS.map(estado => {
            const count = orders.filter(o => o.estado === estado.key).length;
            return (
              <button
                key={estado.key}
                onClick={() => setFilterEstado(estado.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  filterEstado === estado.key 
                    ? `${estado.bgColor} text-white` 
                    : `${estado.lightBg} ${estado.textColor} hover:opacity-80`
                }`}
              >
                <estado.icon size={12} />
                {estado.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Info de resultados */}
      <div className="bg-violet-50 rounded-xl p-4 border border-violet-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-violet-600" />
          <div>
            <p className="font-bold text-violet-800">
              {filteredOrders.length} notas de venta encontradas
            </p>
            <p className="text-sm text-violet-600">
              {filterEstado !== 'TODOS' && `Filtrado por: ${getEstadoConfig(filterEstado).label}`}
              {filterFechaDesde && ` | Desde: ${filterFechaDesde}`}
              {filterFechaHasta && ` | Hasta: ${filterFechaHasta}`}
            </p>
          </div>
        </div>
        {(filterEstado !== 'TODOS' || filterFechaDesde || filterFechaHasta || searchTerm) && (
          <button
            onClick={() => {
              setFilterEstado('TODOS');
              setFilterFechaDesde('');
              setFilterFechaHasta('');
              setSearchTerm('');
            }}
            className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center gap-1"
          >
            <X size={14} /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>Error: {error}</span>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">N.V</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Vendedor</th>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium text-right">Cantidad</th>
                <th className="px-6 py-4 font-medium text-center">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <RefreshCw className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-400">Cargando historial...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No se encontraron notas de venta con los filtros aplicados</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const config = getEstadoConfig(order.estado);
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-indigo-600">#{order.nv}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {order.fecha_emision ? new Date(order.fecha_emision).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{order.cliente}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {order.vendedor}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-slate-600">{order.codigo_producto}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[180px]">{order.descripcion_producto}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-800">{order.cantidad}</span>
                        <span className="text-xs text-slate-400 ml-1">{order.unidad}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                          <config.icon size={12} />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Eye size={14} /> Ver Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación info */}
        {filteredOrders.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            Mostrando {filteredOrders.length} de {orders.length} registros
          </div>
        )}
      </div>

      {/* MODAL DETALLE */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            {(() => {
              const config = getEstadoConfig(selectedOrder.estado);
              return (
                <div className={`${config.lightBg} p-6 flex justify-between items-start border-b ${config.borderColor}`}>
                  <div className="flex items-center gap-4">
                    <div className={`${config.bgColor} p-3 rounded-xl text-white shadow-lg`}>
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className={`${config.textColor} text-sm font-bold uppercase tracking-wide`}>Nota de Venta</p>
                      <h2 className="text-3xl font-black text-slate-900">{selectedOrder.nv}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold border ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                      <config.icon size={16} />
                      {config.label}
                    </span>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="p-6 bg-slate-50/50 max-h-[60vh] overflow-y-auto">
              {/* Info Principal */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <User size={14} /> Información del Cliente
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-400">Cliente</p>
                      <p className="font-bold text-slate-800">{selectedOrder.cliente}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Vendedor</p>
                      <p className="font-medium text-slate-700">{selectedOrder.vendedor}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Calendar size={14} /> Fechas
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-400">Fecha Emisión</p>
                      <p className="font-bold text-slate-800">
                        {selectedOrder.fecha_emision ? new Date(selectedOrder.fecha_emision).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    {selectedOrder.updated_at && (
                      <div>
                        <p className="text-xs text-slate-400">Última Actualización</p>
                        <p className="font-medium text-slate-700">
                          {new Date(selectedOrder.updated_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Producto */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Package size={18} className="text-slate-500" />
                  <h3 className="font-bold text-slate-800">Detalle del Producto</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Package size={32} className="text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-indigo-600 font-bold text-lg">{selectedOrder.codigo_producto}</p>
                      <p className="text-slate-700">{selectedOrder.descripcion_producto}</p>
                    </div>
                    <div className="text-right bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-200">
                      <p className="text-3xl font-black text-emerald-600">{selectedOrder.cantidad}</p>
                      <p className="text-sm text-emerald-700 font-medium">{selectedOrder.unidad}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline del estado (representación visual) */}
              <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <TrendingUp size={14} /> Flujo del Pedido
                </h3>
                <div className="flex items-center justify-between">
                  {TODOS_ESTADOS.filter(e => !['ANULADA'].includes(e.key)).map((estado, index, arr) => {
                    const isCurrent = selectedOrder.estado === estado.key;
                    const isAnulada = selectedOrder.estado === 'ANULADA';
                    const currentIndex = TODOS_ESTADOS.findIndex(e => e.key === selectedOrder.estado);
                    const estadoIndex = TODOS_ESTADOS.findIndex(e => e.key === estado.key);
                    const isPast = !isAnulada && estadoIndex < currentIndex;
                    
                    return (
                      <React.Fragment key={estado.key}>
                        <div className="flex flex-col items-center">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all
                            ${isCurrent ? `${estado.bgColor} text-white scale-110 shadow-lg` : 
                              isPast ? 'bg-emerald-500 text-white' : 
                              isAnulada ? 'bg-red-200 text-red-400' : 'bg-slate-200 text-slate-400'}
                          `}>
                            {isPast ? <CheckCircle size={18} /> : <estado.icon size={18} />}
                          </div>
                          <p className={`text-[10px] mt-1 font-medium ${isCurrent ? estado.textColor : 'text-slate-400'}`}>
                            {estado.label}
                          </p>
                        </div>
                        {index < arr.length - 1 && (
                          <div className={`flex-1 h-1 mx-1 rounded ${isPast ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                {selectedOrder.estado === 'ANULADA' && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                    <p className="text-red-700 font-bold flex items-center justify-center gap-2">
                      <Ban size={16} /> Esta N.V. fue ANULADA
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialNV;
