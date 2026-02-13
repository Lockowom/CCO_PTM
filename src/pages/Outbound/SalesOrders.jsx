// SalesOrders.jsx - Notas de Venta con estados REALES
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
  ChevronRight,
  ArrowRight,
  ThumbsUp,
  Hourglass,
  RotateCcw,
  Ship
} from 'lucide-react';
import { supabase } from '../../supabase';

// Estados REALES de la base de datos (en orden del flujo)
const PIPELINE_ESTADOS = [
  { 
    key: 'Pendiente', 
    label: 'Pendiente', 
    icon: Hourglass, 
    bgColor: 'bg-slate-500',
    lightBg: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    description: 'Esperando aprobación'
  },
  { 
    key: 'Aprobada', 
    label: 'Aprobada', 
    icon: ThumbsUp, 
    bgColor: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    description: 'Lista para Picking'
  },
  { 
    key: 'Pendiente Picking', 
    label: 'En Picking', 
    icon: Hand, 
    bgColor: 'bg-cyan-500',
    lightBg: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    description: 'Recolectando productos'
  },
  { 
    key: 'PACKING', 
    label: 'Packing', 
    icon: Box, 
    bgColor: 'bg-indigo-500',
    lightBg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    description: 'Empacando pedido'
  },
  { 
    key: 'LISTO_DESPACHO', 
    label: 'Listo Despacho', 
    icon: Send, 
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    description: 'Listo para enviar'
  },
  { 
    key: 'Pendiente Shipping', 
    label: 'Pend. Shipping', 
    icon: Ship, 
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    description: 'Pendiente de envío'
  },
  { 
    key: 'Despachado', 
    label: 'Despachado', 
    icon: Truck, 
    bgColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    description: 'En camino'
  },
  { 
    key: 'Refacturacion', 
    label: 'Refacturación', 
    icon: RotateCcw, 
    bgColor: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    description: 'Requiere refacturación'
  },
];

// Estados que se muestran en el pipeline (antes de despachar)
const ESTADOS_PIPELINE = ['Pendiente', 'Aprobada', 'Pendiente Picking', 'PACKING', 'LISTO_DESPACHO', 'Pendiente Shipping'];

// Acciones: desde qué estado a cuál
const ACCIONES_ESTADO = {
  'Pendiente': { next: 'Aprobada', label: 'Aprobar', icon: ThumbsUp },
  'Aprobada': { next: 'Pendiente Picking', label: 'Enviar a Picking', icon: Hand },
  'Pendiente Picking': { next: 'PACKING', label: 'Enviar a Packing', icon: Box },
  'PACKING': { next: 'LISTO_DESPACHO', label: 'Listo Despacho', icon: Send },
  'LISTO_DESPACHO': { next: 'Pendiente Shipping', label: 'A Shipping', icon: Ship },
  'Pendiente Shipping': { next: 'Despachado', label: 'Despachar', icon: Truck },
};

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('Pendiente');
  const [contadores, setContadores] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Cargar órdenes
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar N.V. que NO están despachadas (en proceso)
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .not('estado', 'eq', 'Despachado')
        .order('fecha_emision', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      
      // Calcular contadores
      const counts = {};
      PIPELINE_ESTADOS.forEach(e => {
        counts[e.key] = (data || []).filter(o => o.estado === e.key).length;
      });
      // También contar PENDIENTE en mayúsculas (datos legacy)
      counts['Pendiente'] = (counts['Pendiente'] || 0) + (data || []).filter(o => o.estado === 'PENDIENTE').length;
      setContadores(counts);
      
    } catch (error) {
      console.error("Error cargando N.V:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    
    const channel = supabase
      .channel('nv_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchOrders]);

  // Actualizar estado
  const handleUpdateStatus = async (nv, newStatus) => {
    try {
      setModalLoading(true);
      
      const { error } = await supabase
        .from('tms_nv_diarias')
        .update({ estado: newStatus })
        .eq('nv', nv);

      if (error) throw error;

      await fetchOrders();
      
      if (newStatus === 'Despachado') {
        setSelectedOrder(null);
      } else {
        setSelectedOrder(prev => prev ? { ...prev, estado: newStatus } : null);
      }
      
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Filtrar órdenes (incluir PENDIENTE mayúsculas como Pendiente)
  const filteredOrders = orders.filter(order => {
    const estadoNormalizado = order.estado === 'PENDIENTE' ? 'Pendiente' : order.estado;
    const matchEstado = estadoNormalizado === selectedEstado;
    const matchSearch = !searchTerm || 
      order.nv?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendedor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  // Obtener config del estado
  const getEstadoConfig = (estado) => {
    const normalized = estado === 'PENDIENTE' ? 'Pendiente' : estado;
    return PIPELINE_ESTADOS.find(e => e.key === normalized) || PIPELINE_ESTADOS[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notas de Venta</h2>
          <p className="text-slate-500 text-sm">Gestión de pedidos en proceso</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar NV, cliente, producto..." 
              className="outline-none text-sm w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
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

      {/* PIPELINE VISUAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {ESTADOS_PIPELINE.map((estadoKey, index) => {
            const config = getEstadoConfig(estadoKey);
            const Icon = config.icon;
            const isSelected = selectedEstado === estadoKey;
            const count = contadores[estadoKey] || 0;
            
            return (
              <React.Fragment key={estadoKey}>
                <button
                  onClick={() => setSelectedEstado(estadoKey)}
                  className={`flex-shrink-0 relative group transition-all duration-200 ${isSelected ? 'scale-105' : 'hover:scale-102'}`}
                >
                  <div className={`
                    px-4 py-3 rounded-xl border-2 transition-all text-center min-w-[120px]
                    ${isSelected 
                      ? `${config.lightBg} ${config.borderColor} shadow-lg` 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }
                  `}>
                    <div className={`
                      w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center transition-all
                      ${isSelected ? `${config.bgColor} text-white shadow-md` : 'bg-slate-200 text-slate-500'}
                    `}>
                      <Icon size={20} />
                    </div>
                    <p className={`font-semibold text-xs mb-1 ${isSelected ? config.textColor : 'text-slate-600'}`}>
                      {config.label}
                    </p>
                    <div className={`
                      inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold
                      ${isSelected ? `${config.bgColor} text-white` : 'bg-slate-200 text-slate-600'}
                    `}>
                      {count}
                    </div>
                  </div>
                </button>
                
                {index < ESTADOS_PIPELINE.length - 1 && (
                  <ChevronRight size={20} className="text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        <p className="text-xs text-slate-400 text-center mt-3 pt-3 border-t border-slate-100">
          💡 Las N.V. <strong>Despachadas</strong> se mueven al <strong>Historial</strong> (Consultas → Historial N.V.)
        </p>
      </div>

      {/* Info estado actual */}
      {(() => {
        const config = getEstadoConfig(selectedEstado);
        const accion = ACCIONES_ESTADO[selectedEstado];
        return (
          <div className={`${config.lightBg} rounded-xl p-4 border ${config.borderColor} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <config.icon size={20} className={config.textColor} />
              <div>
                <p className={`font-bold ${config.textColor}`}>
                  {config.label}: {filteredOrders.length} notas de venta
                </p>
                <p className={`text-sm ${config.textColor} opacity-70`}>{config.description}</p>
              </div>
            </div>
            {accion && (
              <div className={`text-xs ${config.textColor} flex items-center gap-1`}>
                <ArrowRight size={14} /> Siguiente: <strong>{accion.label}</strong>
              </div>
            )}
          </div>
        );
      })()}

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
                    <p className="text-slate-400">Cargando...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No hay N.V. en estado "{getEstadoConfig(selectedEstado).label}"</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const config = getEstadoConfig(order.estado);
                  const accion = ACCIONES_ESTADO[order.estado] || ACCIONES_ESTADO[order.estado === 'PENDIENTE' ? 'Pendiente' : order.estado];
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-indigo-600">#{order.nv}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {order.fecha_emision ? new Date(order.fecha_emision).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700 truncate max-w-[150px]" title={order.cliente}>
                          {order.cliente}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[100px]">
                        {order.vendedor}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-slate-600">{order.codigo_producto}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[150px]">{order.descripcion_producto}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-800">{order.cantidad}</span>
                        <span className="text-xs text-slate-400 ml-1">{order.unidad}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {accion && (
                            <button 
                              onClick={() => handleUpdateStatus(order.nv, accion.next)}
                              className={`${getEstadoConfig(accion.next).bgColor} hover:opacity-90 text-white px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1`}
                              title={accion.label}
                            >
                              <accion.icon size={12} />
                              {accion.label}
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            {(() => {
              const config = getEstadoConfig(selectedOrder.estado);
              return (
                <div className={`${config.lightBg} p-5 flex justify-between items-start border-b ${config.borderColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`${config.bgColor} p-2.5 rounded-xl text-white shadow-lg`}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className={`${config.textColor} text-xs font-bold uppercase`}>Nota de Venta</p>
                      <h2 className="text-2xl font-black text-slate-900">{selectedOrder.nv}</h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-lg border border-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })()}

            <div className="p-5 bg-slate-50/50 max-h-[65vh] overflow-y-auto space-y-4">
              {/* Info Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Fecha</p>
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedOrder.fecha_emision ? new Date(selectedOrder.fecha_emision).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Cliente</p>
                  <p className="font-bold text-slate-800 text-sm truncate">{selectedOrder.cliente}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Vendedor</p>
                  <p className="font-bold text-slate-800 text-sm">{selectedOrder.vendedor || '-'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Estado</p>
                  {(() => {
                    const c = getEstadoConfig(selectedOrder.estado);
                    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.lightBg} ${c.textColor}`}>{c.label}</span>;
                  })()}
                </div>
              </div>

              {/* Producto */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Package size={14} /> Producto
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Package size={28} className="text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-indigo-600 font-bold">{selectedOrder.codigo_producto}</p>
                    <p className="text-slate-600 text-sm">{selectedOrder.descripcion_producto}</p>
                  </div>
                  <div className="text-right bg-emerald-50 px-4 py-2 rounded-xl">
                    <p className="text-2xl font-black text-emerald-600">{selectedOrder.cantidad}</p>
                    <p className="text-xs text-emerald-700">{selectedOrder.unidad}</p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Cambiar Estado</h3>
                <div className="flex flex-wrap gap-2">
                  {PIPELINE_ESTADOS.filter(e => e.key !== 'Refacturacion').map((estado) => {
                    const isCurrent = selectedOrder.estado === estado.key || 
                                     (selectedOrder.estado === 'PENDIENTE' && estado.key === 'Pendiente');
                    const accion = ACCIONES_ESTADO[selectedOrder.estado] || 
                                   ACCIONES_ESTADO[selectedOrder.estado === 'PENDIENTE' ? 'Pendiente' : selectedOrder.estado];
                    const isNext = accion?.next === estado.key;
                    
                    return (
                      <button 
                        key={estado.key}
                        onClick={() => handleUpdateStatus(selectedOrder.nv, estado.key)}
                        disabled={modalLoading || isCurrent}
                        className={`
                          px-3 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5
                          ${isCurrent 
                            ? `${estado.bgColor} text-white opacity-50 cursor-not-allowed` 
                            : isNext
                              ? `${estado.bgColor} text-white shadow-md hover:opacity-90`
                              : `${estado.lightBg} ${estado.textColor} border ${estado.borderColor} hover:shadow`
                          }
                        `}
                      >
                        <estado.icon size={14} />
                        {estado.label}
                        {isCurrent && <span className="text-[10px]">(actual)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrders;
