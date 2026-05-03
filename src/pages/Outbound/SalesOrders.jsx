import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Eye, AlertCircle, X, Package, Truck, Calendar, User, FileText, Hand, CheckCircle, Clock, Box, Send, RefreshCw, ChevronRight, ArrowRight, ThumbsUp, Hourglass, RotateCcw, Ship, Trash2
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const PIPELINE_ESTADOS = [
  { key: 'Pendiente', label: 'Pendiente', icon: Hourglass, bgColor: 'bg-slate-500', lightBg: 'bg-slate-800', textColor: 'text-slate-300', borderColor: 'border-slate-600', description: 'Esperando aprobación' },
  { key: 'Aprobada', label: 'Aprobada', icon: ThumbsUp, bgColor: 'bg-amber-500', lightBg: 'bg-amber-900/40', textColor: 'text-amber-400', borderColor: 'border-amber-700/50', description: 'Lista para Picking' },
  { key: 'Pendiente Picking', label: 'En Picking', icon: Hand, bgColor: 'bg-cyan-500', lightBg: 'bg-cyan-900/40', textColor: 'text-cyan-400', borderColor: 'border-cyan-700/50', description: 'Recolectando productos' },
  { key: 'PACKING', label: 'Packing', icon: Box, bgColor: 'bg-indigo-500', lightBg: 'bg-indigo-900/40', textColor: 'text-indigo-400', borderColor: 'border-indigo-700/50', description: 'Empacando pedido' },
  { key: 'LISTO_DESPACHO', label: 'Listo Despacho', icon: Send, bgColor: 'bg-purple-500', lightBg: 'bg-purple-900/40', textColor: 'text-purple-400', borderColor: 'border-purple-700/50', description: 'Listo para enviar' },
  { key: 'Pendiente Shipping', label: 'Pend. Shipping', icon: Ship, bgColor: 'bg-blue-500', lightBg: 'bg-blue-900/40', textColor: 'text-blue-400', borderColor: 'border-blue-700/50', description: 'Pendiente de envío' },
  { key: 'Despachado', label: 'Despachado', icon: Truck, bgColor: 'bg-emerald-500', lightBg: 'bg-emerald-900/40', textColor: 'text-emerald-400', borderColor: 'border-emerald-700/50', description: 'En camino' },
  { key: 'NULA', label: 'Nula', icon: X, bgColor: 'bg-rose-500', lightBg: 'bg-rose-900/40', textColor: 'text-rose-400', borderColor: 'border-rose-700/50', description: 'Venta anulada' },
  { key: 'Refacturacion', label: 'Refacturación', icon: RotateCcw, bgColor: 'bg-orange-500', lightBg: 'bg-orange-900/40', textColor: 'text-orange-400', borderColor: 'border-orange-700/50', description: 'Requiere refacturación' },
];

const ESTADOS_PIPELINE = ['Pendiente', 'Aprobada', 'Pendiente Picking', 'PACKING', 'LISTO_DESPACHO', 'Pendiente Shipping', 'NULA', 'Refacturacion'];

const ACCIONES_ESTADO = {
  'Pendiente': { next: 'Aprobada', label: 'Aprobar', icon: ThumbsUp },
  'Aprobada': { next: 'Pendiente Picking', label: 'Enviar a Picking', icon: Hand },
  'Pendiente Picking': { next: 'PACKING', label: 'Enviar a Packing', icon: Box },
  'PACKING': { next: 'LISTO_DESPACHO', label: 'Listo Despacho', icon: Send },
  'LISTO_DESPACHO': { next: 'Pendiente Shipping', label: 'A Shipping', icon: Ship },
  'Pendiente Shipping': { next: 'Despachado', label: 'Despachar', icon: Truck },
};

const SalesOrders = () => {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('Pendiente');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rlsErrorModal, setRlsErrorModal] = useState(false);
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const { data: { orders = [], contadores = {} } = {}, isLoading: loading, refetch } = useQuery({
    queryKey: ['sales_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .not('estado', 'eq', 'Despachado')
        .order('fecha_emision', { ascending: false })
        .limit(5000);

      if (error) throw error;

      const grouped = {};
      (data || []).forEach(item => {
        const nvId = item.nv;
        if (!grouped[nvId]) {
          grouped[nvId] = { ...item, items: [], total_items: 0, total_cantidad: 0 };
        }
        grouped[nvId].items.push(item);
        grouped[nvId].total_items++;
        grouped[nvId].total_cantidad += parseInt(item.cantidad) || 0;
      });

      const ordersArray = Object.values(grouped).sort((a, b) => new Date(b.fecha_emision) - new Date(a.fecha_emision));

      const counts = {};
      PIPELINE_ESTADOS.forEach(e => {
        counts[e.key] = ordersArray.filter(o => o.estado === e.key).length;
      });
      counts['Pendiente'] = (counts['Pendiente'] || 0) + ordersArray.filter(o => o.estado === 'PENDIENTE').length;
      
      return { orders: ordersArray, contadores: counts };
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('nv_realtime_sales')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => {
        queryClient.invalidateQueries(['sales_orders']);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ nv, newStatus }) => {
      const { error } = await supabase.from('tms_nv_diarias').update({ estado: newStatus }).eq('nv', nv);
      if (error) throw error;
      return { nv, newStatus };
    },
    onSuccess: ({ newStatus }) => {
      queryClient.invalidateQueries(['sales_orders']);
      if (newStatus === 'Despachado') {
        setSelectedOrder(null);
      } else if (selectedOrder) {
        setSelectedOrder(prev => prev ? { ...prev, estado: newStatus } : null);
      }
      toast.success(`Estado actualizado a ${newStatus}`, { style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }});
    },
    onError: (err) => {
      toast.error('Error: ' + err.message, { style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' }});
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (nv) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from('tms_nv_eliminadas').insert({
        nv: nv.toString(),
        usuario_elimino: user?.id,
        motivo: 'Eliminación manual desde SalesOrders'
      });
      if (insertError) throw insertError;

      const { error: deleteError } = await supabase.from('tms_nv_diarias').delete().eq('nv', nv);
      if (deleteError) throw deleteError;

      await supabase.from('tms_entregas').delete().eq('nv', nv);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sales_orders']);
      setSelectedOrder(null);
      toast.success('N.V. eliminada correctamente y registrada.', { style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }});
    },
    onError: (e) => {
      console.error('Error al eliminar:', e);
      if (e.message?.includes('violates row-level security policy')) {
        setRlsErrorModal(true);
      } else {
        toast.error('Error al eliminar: ' + e.message, { style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' }});
      }
    }
  });

  const handleUpdateStatus = (nv, newStatus) => updateStatusMutation.mutate({ nv, newStatus });

  const handleDeleteOrder = (nv) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la N.V. #${nv}?\n\nEsta acción registrará la N.V. como eliminada para evitar que se vuelva a importar en el futuro.`)) {
      return;
    }
    deleteOrderMutation.mutate(nv);
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      const estadoNormalizado = order.estado === 'PENDIENTE' ? 'Pendiente' : order.estado;
      const matchEstado = estadoNormalizado === selectedEstado;
      const matchSearch = !searchTerm ||
        order.nv?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(i => i.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) || i.descripcion_producto?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.vendedor?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchEstado && matchSearch;
    });
  }, [orders, selectedEstado, searchTerm]);

  const getEstadoConfig = (estado) => {
    const normalized = estado === 'PENDIENTE' ? 'Pendiente' : estado;
    return PIPELINE_ESTADOS.find(e => e.key === normalized) || PIPELINE_ESTADOS[0];
  };

  return (
    <div ref={containerRef} className="space-y-6 bg-wms-dark min-h-screen text-slate-300 p-6">
      <div className="flex justify-between items-end relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             Notas de Venta
          </h2>
          <p className="text-slate-400 text-sm">Gestión de pedidos en proceso</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-wms-panel border border-wms-border rounded-lg flex items-center px-3 py-2 shadow-sm focus-within:border-wms-neon transition-colors">
            <Search size={18} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar NV, cliente, producto..."
              className="outline-none text-sm w-64 bg-transparent text-white placeholder:text-slate-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="bg-wms-panel border border-wms-border hover:border-wms-neon hover:text-wms-neon text-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* PIPELINE VISUAL */}
      <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-wms-border p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-wms-neon/5 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 relative z-10">
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
                    px-4 py-3 rounded-xl border transition-all text-center min-w-[120px]
                    ${isSelected
                      ? `${config.lightBg} border-${config.bgColor.split('-')[1]}-500 shadow-lg shadow-${config.bgColor.split('-')[1]}-500/20`
                      : 'bg-wms-dark border-wms-border hover:border-slate-600'
                    }
                  `}>
                    <div className={`
                      w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center transition-all
                      ${isSelected ? `${config.bgColor} text-white shadow-md` : 'bg-slate-800 text-slate-500'}
                    `}>
                      <Icon size={20} />
                    </div>
                    <p className={`font-semibold text-xs mb-1 ${isSelected ? config.textColor : 'text-slate-500'}`}>
                      {config.label}
                    </p>
                    <div className={`
                      inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold
                      ${isSelected ? `${config.bgColor} text-white` : 'bg-slate-800 text-slate-400'}
                    `}>
                      {count}
                    </div>
                  </div>
                </button>

                {index < ESTADOS_PIPELINE.length - 1 && (
                  <ChevronRight size={20} className="text-slate-600 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
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

      {/* Tabla */}
      <div className="bg-wms-panel/80 backdrop-blur-xl rounded-xl shadow-2xl border border-wms-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-wms-dark text-slate-400 uppercase text-xs tracking-wider">
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
            <tbody className="divide-y divide-wms-border">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <RefreshCw className="animate-spin mx-auto text-wms-neon mb-2" size={24} />
                    <p className="text-slate-400">Cargando...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-500">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No hay N.V. en estado "{getEstadoConfig(selectedEstado).label}"</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const config = getEstadoConfig(order.estado);
                  const accion = ACCIONES_ESTADO[order.estado] || ACCIONES_ESTADO[order.estado === 'PENDIENTE' ? 'Pendiente' : order.estado];

                  return (
                    <tr key={index} className="hover:bg-wms-dark/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-wms-neon">#{order.nv}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {order.fecha_emision ? new Date(order.fecha_emision).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-300 truncate max-w-[150px]" title={order.cliente}>
                          {order.cliente}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[100px]">
                        {order.vendedor}
                      </td>
                      <td className="px-4 py-3">
                        {order.total_items > 1 ? (
                          <div className="flex items-center gap-1">
                            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-xs font-bold">
                              {order.total_items} items
                            </span>
                            <span className="text-xs text-slate-400 truncate max-w-[100px]">
                              {order.descripcion_producto} ...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="font-mono text-xs text-slate-400">{order.codigo_producto}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{order.descripcion_producto}</div>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {order.total_items > 1 ? (
                          <span className="font-bold text-white">{order.total_cantidad} <span className="text-[10px] font-normal text-slate-500">Total</span></span>
                        ) : (
                          <span className="font-bold text-white">{order.cantidad} <span className="text-xs font-normal text-slate-500">{order.unidad}</span></span>
                        )}
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
                              disabled={updateStatusMutation.isPending}
                              className={`${config.bgColor} hover:opacity-80 text-white px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1`}
                              title={accion.label}
                            >
                              <accion.icon size={12} />
                              {accion.label}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="bg-wms-dark hover:bg-slate-800 text-slate-300 border border-wms-border px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                            title="Ver detalle"
                          >
                            <Eye size={12} />
                          </button>
                          {hasPermission('delete_sales_orders') && (
                            <button
                              onClick={() => handleDeleteOrder(order.nv)}
                              disabled={deleteOrderMutation.isPending}
                              className="bg-wms-danger/20 hover:bg-wms-danger/40 text-rose-400 border border-rose-500/30 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-wms-panel w-full max-w-3xl rounded-2xl shadow-2xl border border-wms-border overflow-hidden">
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
                      <h2 className="text-2xl font-black text-white">{selectedOrder.nv}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasPermission('delete_sales_orders') && (
                      <button
                        onClick={() => handleDeleteOrder(selectedOrder.nv)}
                        className="text-rose-400 hover:text-rose-300 bg-wms-dark hover:bg-rose-500/20 p-2 rounded-lg border border-wms-border transition-colors"
                        title="Eliminar N.V. y bloquear re-importación"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-slate-400 hover:text-white bg-wms-dark hover:bg-slate-800 p-2 rounded-lg border border-wms-border"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="p-5 bg-wms-dark/50 max-h-[65vh] overflow-y-auto space-y-4">
              {/* Info Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-wms-panel p-3 rounded-xl border border-wms-border">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Fecha</p>
                  <p className="font-bold text-white text-sm">
                    {selectedOrder.fecha_emision ? new Date(selectedOrder.fecha_emision).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="bg-wms-panel p-3 rounded-xl border border-wms-border">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Cliente</p>
                  <p className="font-bold text-white text-sm truncate">{selectedOrder.cliente}</p>
                </div>
                <div className="bg-wms-panel p-3 rounded-xl border border-wms-border">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Vendedor</p>
                  <p className="font-bold text-white text-sm">{selectedOrder.vendedor || '-'}</p>
                </div>
                <div className="bg-wms-panel p-3 rounded-xl border border-wms-border">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Estado</p>
                  {(() => {
                    const c = getEstadoConfig(selectedOrder.estado);
                    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.lightBg} ${c.textColor}`}>{c.label}</span>;
                  })()}
                </div>
              </div>

              {/* Producto (Lista de items) */}
              <div className="bg-wms-panel rounded-xl border border-wms-border p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Package size={14} /> Productos ({selectedOrder.total_items || 1})
                </h3>

                <div className="max-h-60 overflow-y-auto space-y-3">
                  {(selectedOrder.items || [selectedOrder]).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-2 bg-wms-dark rounded-lg hover:bg-slate-800 transition-colors border border-wms-border">
                      <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-wms-neon font-bold text-xs">{item.codigo_producto}</p>
                        <p className="text-slate-300 text-sm truncate">{item.descripcion_producto}</p>
                      </div>
                      <div className="text-right bg-wms-panel border border-wms-border px-3 py-1 rounded-lg">
                        <p className="text-lg font-bold text-wms-neon">{item.cantidad}</p>
                        <p className="text-[10px] text-slate-500">{item.unidad || 'UNI'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="bg-wms-panel rounded-xl border border-wms-border p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Cambiar Estado</h3>
                <div className="flex flex-wrap gap-2">
                  {PIPELINE_ESTADOS.map((estado) => {
                    const isCurrent = selectedOrder.estado === estado.key ||
                      (selectedOrder.estado === 'PENDIENTE' && estado.key === 'Pendiente');
                    const accion = ACCIONES_ESTADO[selectedOrder.estado] ||
                      ACCIONES_ESTADO[selectedOrder.estado === 'PENDIENTE' ? 'Pendiente' : selectedOrder.estado];
                    const isNext = accion?.next === estado.key;

                    return (
                      <button
                        key={estado.key}
                        onClick={() => handleUpdateStatus(selectedOrder.nv, estado.key)}
                        disabled={updateStatusMutation.isPending || isCurrent}
                        className={`
                          px-3 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5
                          ${isCurrent
                            ? `${estado.bgColor} text-white opacity-50 cursor-not-allowed`
                            : isNext
                              ? `${estado.bgColor} text-white shadow-md shadow-${estado.bgColor.split('-')[1]}-500/20 hover:opacity-90`
                              : `${estado.lightBg} ${estado.textColor} border ${estado.borderColor} hover:bg-slate-800`
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

      {/* EMERGENCY RLS FIX MODAL */}
      {rlsErrorModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-wms-panel max-w-2xl w-full rounded-2xl shadow-2xl border border-wms-border overflow-hidden">
            <div className="bg-rose-500/10 p-6 border-b border-rose-500/20 flex gap-4 items-start">
              <div className="bg-rose-500/20 text-rose-400 p-3 rounded-xl flex-shrink-0">
                <AlertCircle size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-rose-400 mb-1">Permiso de Seguridad Requerido en Supabase</h2>
                <p className="text-slate-300 text-sm">
                  Supabase está bloqueando la eliminación porque la nueva tabla <strong>tms_nv_eliminadas</strong> tiene la seguridad activada, pero no le hemos dado permiso a la aplicación para escribir en ella.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="font-bold text-white text-sm">Para solucionarlo permanentemente, por favor sigue estos 2 pasos rápidos:</p>

              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center flex-shrink-0 border border-indigo-500/30">1</span>
                <div>
                  <p className="text-slate-400 font-medium mb-2">Entra a tu cuenta de Supabase, ve al proyecto y abre el <strong>SQL Editor</strong>.</p>
                  <a href="https://supabase.com/dashboard/project/vtrtyzbgpsvqwbfoudaf/sql/new" target="_blank" rel="noreferrer" className="text-wms-neon hover:underline font-bold text-sm inline-flex items-center gap-1">
                    Abrir SQL Editor de Supabase Aquí <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start pt-2">
                <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center flex-shrink-0 border border-indigo-500/30">2</span>
                <div className="w-full">
                  <p className="text-slate-400 font-medium mb-2">Copia y Pega este código exacto, y dale al botón verde <strong>RUN</strong>:</p>

                  <div className="relative group">
                    <pre className="bg-wms-dark text-wms-neon p-4 rounded-xl text-xs overflow-x-auto font-mono border border-wms-border">
                      {`ALTER TABLE public.tms_nv_eliminadas DISABLE ROW LEVEL SECURITY;`}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("ALTER TABLE public.tms_nv_eliminadas DISABLE ROW LEVEL SECURITY;");
                        toast.success("¡Código copiado! Pégalo en Supabase.");
                      }}
                      className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Copiar Código
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Este código apaga el bloqueo de seguridad para esa tabla específica, permitiendo que el administrador pueda borrar sin problemas.</p>
                </div>
              </div>
            </div>

            <div className="bg-wms-dark p-4 border-t border-wms-border flex justify-end">
              <button
                onClick={() => setRlsErrorModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
              >
                Entendido, ya lo haré
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrders;