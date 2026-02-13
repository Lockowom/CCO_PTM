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
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <Download size={16} /> Exportar CSV
          </button>
          <button 
            onClick={fetchOrders}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase">Total</span>
            <BarChart3 size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-600 text-xs font-semibold uppercase">Despachados</span>
            <Truck size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.despachados}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-600 text-xs font-semibold uppercase">En Proceso</span>
            <Clock size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.enProceso}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-600 text-xs font-semibold uppercase">Refacturación</span>
            <RotateCcw size={16} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.refacturacion}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-700">Filtros</h3>
        </div>
        <div className="grid grid-cols-5 gap-4">
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
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="TODOS">Todos</option>
              {ESTADOS_FILTRO.map(e => (
                <option key={e.key} value={e.key}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Desde</label>
            <input
              type="date"
              value={filterFechaDesde}
              onChange={e => setFilterFechaDesde(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
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
        
        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setFilterEstado('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              filterEstado === 'TODOS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({stats.total})
          </button>
          {ESTADOS_FILTRO.map(estado => {
            const config = getEstadoConfig(estado.key);
            const count = orders.filter(o => o.estado === estado.key || (estado.key === 'Pendiente' && o.estado === 'PENDIENTE')).length;
            if (count === 0) return null;
            return (
              <button
                key={estado.key}
                onClick={() => setFilterEstado(estado.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  filterEstado === estado.key 
                    ? `${config.bgColor} text-white` 
                    : `${config.lightBg} ${config.textColor} hover:opacity-80`
                }`}
              >
                {estado.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-violet-50 rounded-xl p-3 border border-violet-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-violet-600" />
          <p className="font-bold text-violet-800 text-sm">{filteredOrders.length} N.V. encontradas</p>
        </div>
        {(filterEstado !== 'TODOS' || filterFechaDesde || filterFechaHasta || searchTerm) && (
          <button
            onClick={() => { setFilterEstado('TODOS'); setFilterFechaDesde(''); setFilterFechaHasta(''); setSearchTerm(''); }}
            className="text-violet-600 hover:text-violet-800 text-xs font-medium flex items-center gap-1"
          >
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">N.V</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Vendedor</th>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium text-right">Cant.</th>
                <th className="px-4 py-3 font-medium text-center">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <RefreshCw className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-400">Cargando historial...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No se encontraron N.V.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const config = getEstadoConfig(order.estado);
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-indigo-600">#{order.nv}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {order.fecha_emision ? new Date(order.fecha_emision).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[150px]">{order.cliente}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{order.vendedor}</td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-slate-600">{order.codigo_producto}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[150px]">{order.descripcion_producto}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">
                        {order.cantidad} <span className="text-slate-400 font-normal text-xs">{order.unidad}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                          <config.icon size={10} /> {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ml-auto"
                        >
                          <Eye size={12} /> Ver
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
          <div className="px-4 py-2 bg-slate-50 border-t text-xs text-slate-500">
            Mostrando {filteredOrders.length} de {orders.length}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            {(() => {
              const config = getEstadoConfig(selectedOrder.estado);
              return (
                <div className={`${config.lightBg} p-5 flex justify-between items-center border-b ${config.borderColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`${config.bgColor} p-2 rounded-lg text-white`}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Nota de Venta</p>
                      <h2 className="text-xl font-black text-slate-900">{selectedOrder.nv}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.lightBg} ${config.textColor} border ${config.borderColor}`}>
                      {config.label}
                    </span>
                    <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-slate-200 rounded">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              );
            })()}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Fecha</p>
                  <p className="font-bold">{selectedOrder.fecha_emision ? new Date(selectedOrder.fecha_emision).toLocaleDateString() : '-'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Cliente</p>
                  <p className="font-bold truncate">{selectedOrder.cliente}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Vendedor</p>
                  <p className="font-bold">{selectedOrder.vendedor || '-'}</p>
                </div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-indigo-600 font-bold">{selectedOrder.codigo_producto}</p>
                    <p className="text-slate-600">{selectedOrder.descripcion_producto}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-indigo-600">{selectedOrder.cantidad}</p>
                    <p className="text-xs text-indigo-500">{selectedOrder.unidad}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialNV;
