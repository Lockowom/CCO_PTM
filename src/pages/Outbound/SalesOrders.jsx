// SalesOrders.jsx - Notas de Venta con Pipeline de Estados
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
  Hourglass
} from 'lucide-react';
import { supabase } from '../../supabase';

// Configuración del Pipeline de Estados (ORDEN CORRECTO)
const PIPELINE_ESTADOS = [
  { 
    key: 'PENDIENTE', 
    label: 'Pendiente', 
    icon: Hourglass, 
    color: 'slate',
    bgColor: 'bg-slate-500',
    lightBg: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    description: 'Pendiente de aprobación'
  },
  { 
    key: 'APROBADA', 
    label: 'Aprobada', 
    icon: ThumbsUp, 
    color: 'amber',
    bgColor: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    description: 'Lista para Picking'
  },
  { 
    key: 'PICKING', 
    label: 'En Picking', 
    icon: Hand, 
    color: 'cyan',
    bgColor: 'bg-cyan-500',
    lightBg: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    description: 'Recolectando productos'
  },
  { 
    key: 'PACKING', 
    label: 'En Packing', 
    icon: Box, 
    color: 'indigo',
    bgColor: 'bg-indigo-500',
    lightBg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    description: 'Empacando pedido'
  },
  { 
    key: 'DESPACHO', 
    label: 'Listo Despacho', 
    icon: Send, 
    color: 'purple',
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    description: 'Listo para enviar'
  },
  // Estos estados NO aparecen en el pipeline visual pero existen
  { 
    key: 'DESPACHADO', 
    label: 'Despachado', 
    icon: Truck, 
    color: 'blue',
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    description: 'En camino'
  },
  { 
    key: 'ENTREGADO', 
    label: 'Entregado', 
    icon: CheckCircle, 
    color: 'emerald',
    bgColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    description: 'Completado'
  },
];

// Estados que se muestran en el módulo de N.V. (antes de despachar)
const ESTADOS_VISIBLES = ['PENDIENTE', 'APROBADA', 'PICKING', 'PACKING', 'DESPACHO'];

// Acciones por estado
const ACCIONES_POR_ESTADO = {
  'PENDIENTE': { nextState: 'APROBADA', label: 'Aprobar', icon: ThumbsUp },
  'APROBADA': { nextState: 'PICKING', label: 'Enviar a Picking', icon: Hand },
  'PICKING': { nextState: 'PACKING', label: 'Enviar a Packing', icon: Box },
  'PACKING': { nextState: 'DESPACHO', label: 'Listo Despacho', icon: Send },
  'DESPACHO': { nextState: 'DESPACHADO', label: 'Despachar', icon: Truck },
};

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('APROBADA'); // Por defecto APROBADA (listas para procesar)
  
  // Contadores por estado
  const [contadores, setContadores] = useState({});
  
  // Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Cargar órdenes
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar solo las N.V. que están en proceso (NO despachadas ni entregadas)
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .in('estado', ESTADOS_VISIBLES)
        .order('fecha_emision', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      
      // Calcular contadores para estados visibles
      const counts = {};
      ESTADOS_VISIBLES.forEach(estado => {
        counts[estado] = (data || []).filter(o => o.estado === estado).length;
      });
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
    
    // Suscripción Realtime
    const channel = supabase
      .channel('nv_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tms_nv_diarias' },
        () => {
          console.log('📦 N.V. actualizada');
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // Actualizar estado de una N.V.
  const handleUpdateStatus = async (nv, newStatus) => {
    try {
      setModalLoading(true);
      
      const { error } = await supabase
        .from('tms_nv_diarias')
        .update({ 
          estado: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('nv', nv);

      if (error) throw error;

      // Refrescar datos
      await fetchOrders();
      
      // Si el nuevo estado no está en los visibles, cerrar modal (ya se despachó)
      if (!ESTADOS_VISIBLES.includes(newStatus)) {
        setSelectedOrder(null);
      } else {
        // Actualizar el order seleccionado
        setSelectedOrder(prev => prev ? { ...prev, estado: newStatus } : null);
      }
      
    } catch (e) {
      alert('Error actualizando estado: ' + e.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const matchEstado = order.estado === selectedEstado;
    const matchSearch = !searchTerm || 
      order.nv?.toString().includes(searchTerm) ||
      order.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  // Obtener config del estado
  const getEstadoConfig = (estado) => {
    return PIPELINE_ESTADOS.find(e => e.key === estado) || PIPELINE_ESTADOS[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notas de Venta</h2>
          <p className="text-slate-500 text-sm">Gestión de pedidos pendientes de despacho</p>
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          {ESTADOS_VISIBLES.map((estadoKey, index) => {
            const config = getEstadoConfig(estadoKey);
            const Icon = config.icon;
            const isSelected = selectedEstado === estadoKey;
            const count = contadores[estadoKey] || 0;
            
            return (
              <React.Fragment key={estadoKey}>
                {/* Botón de Estado */}
                <button
                  onClick={() => setSelectedEstado(estadoKey)}
                  className={`flex-1 relative group transition-all duration-300 ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div className={`
                    p-4 rounded-2xl border-2 transition-all duration-300 text-center
                    ${isSelected 
                      ? `${config.lightBg} ${config.borderColor} shadow-lg` 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }
                  `}>
                    {/* Icono */}
                    <div className={`
                      w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all
                      ${isSelected 
                        ? `${config.bgColor} text-white shadow-lg` 
                        : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
                      }
                    `}>
                      <Icon size={28} />
                    </div>
                    
                    {/* Label */}
                    <p className={`font-bold text-sm mb-1 ${isSelected ? config.textColor : 'text-slate-600'}`}>
                      {config.label}
                    </p>
                    
                    {/* Contador */}
                    <div className={`
                      inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold
                      ${isSelected 
                        ? `${config.bgColor} text-white` 
                        : 'bg-slate-200 text-slate-600'
                      }
                    `}>
                      {count}
                    </div>
                    
                    {/* Descripción */}
                    <p className={`text-xs mt-2 ${isSelected ? config.textColor : 'text-slate-400'}`}>
                      {config.description}
                    </p>
                  </div>
                  
                  {/* Indicador de selección */}
                  {isSelected && (
                    <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 ${config.bgColor} rotate-45`}></div>
                  )}
                </button>
                
                {/* Flecha entre estados */}
                {index < ESTADOS_VISIBLES.length - 1 && (
                  <div className="flex-shrink-0 px-2">
                    <ChevronRight size={24} className="text-slate-300" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Leyenda */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            💡 Las N.V. <strong>DESPACHADAS</strong> y <strong>ENTREGADAS</strong> no aparecen aquí (ya finalizaron el proceso)
          </p>
        </div>
      </div>

      {/* Info del estado seleccionado */}
      {(() => {
        const config = getEstadoConfig(selectedEstado);
        const accion = ACCIONES_POR_ESTADO[selectedEstado];
        return (
          <div className={`${config.lightBg} rounded-xl p-4 border ${config.borderColor} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <config.icon size={20} className={config.textColor} />
              <div>
                <p className={`font-bold ${config.textColor}`}>
                  {config.label}: {filteredOrders.length} notas de venta
                </p>
                <p className={`text-sm ${config.textColor} opacity-70`}>
                  {config.description}
                </p>
              </div>
            </div>
            {accion && (
              <div className={`text-xs ${config.textColor} flex items-center gap-1`}>
                <ArrowRight size={14} />
                Siguiente: <strong>{accion.label}</strong>
              </div>
            )}
          </div>
        );
      })()}

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>No se pudieron cargar los datos: {error}</span>
        </div>
      )}

      {/* Tabla de N.V. */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">N.V</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium text-right">Cantidad</th>
                <th className="px-6 py-4 font-medium text-center">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <RefreshCw className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-400">Cargando notas de venta...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No hay notas de venta en estado "{getEstadoConfig(selectedEstado).label}"</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const config = getEstadoConfig(order.estado);
                  const accion = ACCIONES_POR_ESTADO[order.estado];
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-indigo-600">#{order.nv}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {order.fecha_emision ? new Date(order.fecha_emision).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{order.cliente}</div>
                        <div className="text-xs text-slate-400">{order.vendedor}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-slate-600">{order.codigo_producto}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{order.descripcion_producto}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-800">{order.cantidad}</span>
                        <span className="text-xs text-slate-400 ml-1">{order.unidad}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* Botón de acción principal */}
                          {accion && (
                            <button 
                              onClick={() => handleUpdateStatus(order.nv, accion.nextState)}
                              className={`${getEstadoConfig(accion.nextState).bgColor} hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1`}
                              title={accion.label}
                            >
                              <accion.icon size={14} />
                              {accion.label}
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Eye size={14} /> Ver
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

      {/* MODAL DETALLE N.V */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Modal */}
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
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 transition-all flex items-center gap-2"
                  >
                    <X size={16} /> Cerrar
                  </button>
                </div>
              );
            })()}

            <div className="p-8 bg-slate-50/50 max-h-[70vh] overflow-y-auto">
              {/* Pipeline Mini en Modal */}
              <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-white rounded-xl border border-slate-200">
                {ESTADOS_VISIBLES.map((estadoKey, index) => {
                  const estado = getEstadoConfig(estadoKey);
                  const isCurrent = selectedOrder.estado === estadoKey;
                  const currentIndex = ESTADOS_VISIBLES.indexOf(selectedOrder.estado);
                  const isPast = index < currentIndex;
                  
                  return (
                    <React.Fragment key={estadoKey}>
                      <div 
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer
                          ${isCurrent ? `${estado.bgColor} text-white scale-125 shadow-lg` : 
                            isPast ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}
                        `}
                        title={estado.label}
                      >
                        {isPast ? <CheckCircle size={18} /> : <estado.icon size={18} />}
                      </div>
                      {index < ESTADOS_VISIBLES.length - 1 && (
                        <div className={`w-8 h-1 rounded ${isPast ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase">
                    <AlertCircle size={14} /> Estado
                  </div>
                  {(() => {
                    const config = getEstadoConfig(selectedOrder.estado);
                    return (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                        {config.label}
                      </span>
                    );
                  })()}
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase">
                    <Calendar size={14} /> Fecha
                  </div>
                  <p className="font-bold text-slate-800">
                    {selectedOrder.fecha_emision ? new Date(selectedOrder.fecha_emision).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase">
                    <User size={14} /> Cliente
                  </div>
                  <p className="font-bold text-slate-800 text-sm leading-tight">{selectedOrder.cliente}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase">
                    <User size={14} /> Vendedor
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{selectedOrder.vendedor}</p>
                </div>
              </div>

              {/* Acciones de Estado */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-slate-400" /> Cambiar Estado
                </h3>
                <div className="flex flex-wrap gap-3">
                  {ESTADOS_VISIBLES.map((estadoKey) => {
                    const estado = getEstadoConfig(estadoKey);
                    const isCurrent = selectedOrder.estado === estadoKey;
                    const accion = ACCIONES_POR_ESTADO[selectedOrder.estado];
                    const isNext = accion?.nextState === estadoKey;
                    
                    return (
                      <button 
                        key={estadoKey}
                        onClick={() => handleUpdateStatus(selectedOrder.nv, estadoKey)}
                        disabled={modalLoading || isCurrent}
                        className={`
                          px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                          ${isCurrent 
                            ? `${estado.bgColor} text-white cursor-not-allowed opacity-50` 
                            : isNext
                              ? `${estado.bgColor} text-white shadow-lg hover:opacity-90 ring-2 ring-offset-2 ring-${estado.color}-300`
                              : `${estado.lightBg} ${estado.textColor} border ${estado.borderColor} hover:shadow-md`
                          }
                        `}
                      >
                        <estado.icon size={16} />
                        {estado.label}
                        {isCurrent && <span className="text-xs">(actual)</span>}
                        {isNext && <span className="text-xs">→</span>}
                      </button>
                    );
                  })}
                  
                  {/* Botón despachar si está en DESPACHO */}
                  {selectedOrder.estado === 'DESPACHO' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.nv, 'DESPACHADO')}
                      disabled={modalLoading}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Truck size={16} /> Despachar (saldrá del módulo)
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.nv, 'ANULADA')}
                    disabled={modalLoading}
                    className="px-4 py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition-all flex items-center gap-2 ml-auto"
                  >
                    <X size={16} /> Anular N.V
                  </button>
                </div>
              </div>

              {/* Productos */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Package size={18} className="text-slate-500" />
                  <h3 className="font-bold text-slate-800">Producto</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Package size={32} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-indigo-600 font-bold">{selectedOrder.codigo_producto}</p>
                      <p className="text-slate-700">{selectedOrder.descripcion_producto}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-emerald-600">{selectedOrder.cantidad}</p>
                      <p className="text-sm text-slate-400">{selectedOrder.unidad}</p>
                    </div>
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

export default SalesOrders;
