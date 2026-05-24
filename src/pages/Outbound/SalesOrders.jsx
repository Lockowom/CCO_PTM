import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Eye, AlertCircle, X, Package, Truck, Calendar, User, FileText, Hand, CheckCircle, Clock, Box, Send, RefreshCw, ChevronRight, ArrowRight, ThumbsUp, Hourglass, RotateCcw, Ship, Trash2
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { groupByNV } from '../../utils/groupOrders';
import useRealtimeTable from '../../hooks/useRealtimeTable';
import { ESTADOS_CONFIG, getEstadoConfig, ACCIONES_ESTADO, ESTADOS_PIPELINE } from '../../constants/estados';

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
      y: 15,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const { data: { orders = [], contadores = {} } = {}, isLoading: loading, refetch } = useQuery({
    queryKey: ['sales_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('id, nv, estado, fecha_emision, cliente, vendedor, codigo_producto, descripcion_producto, cantidad, unidad, usuario_asignado, usuario_nombre, picking_status, cantidad_real')
        .not('estado', 'eq', 'Despachado')
        .order('fecha_emision', { ascending: false })
        .limit(5000);

      if (error) throw error;

      const ordersArray = groupByNV(data).sort((a, b) => new Date(b.fecha_emision) - new Date(a.fecha_emision));

      const counts = {};
      ESTADOS_CONFIG.forEach(e => {
        counts[e.key] = ordersArray.filter(o => o.estado === e.key).length;
      });
      counts['Pendiente'] = (counts['Pendiente'] || 0) + ordersArray.filter(o => o.estado === 'PENDIENTE').length;
      
      return { orders: ordersArray, contadores: counts };
    }
  });

  useRealtimeTable('tms_nv_diarias', ['sales_orders']);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ nv, newStatus }) => {
      const { error } = await supabase.from('tms_nv_diarias').update({ estado: newStatus }).eq('nv', nv);
      if (error) throw error;
      return { nv, newStatus };
    },
    onSuccess: ({ newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['sales_orders'] });
      if (newStatus === 'Despachado') {
        setSelectedOrder(null);
      } else if (selectedOrder) {
        setSelectedOrder(prev => prev ? { ...prev, estado: newStatus } : null);
      }
      toast.success(`Estado actualizado a ${newStatus}`);
    },
    onError: (err) => {
      toast.error('Error: ' + err.message);
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
      queryClient.invalidateQueries({ queryKey: ['sales_orders'] });
      setSelectedOrder(null);
      toast.success('N.V. eliminada correctamente y registrada.');
    },
    onError: (e) => {
      if (e.message?.includes('violates row-level security policy')) {
        setRlsErrorModal(true);
      } else {
        toast.error('Error al eliminar: ' + e.message);
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


  return (
    <div ref={containerRef} className="space-y-6 min-h-screen text-slate-800">
      <div className="flex justify-between items-end relative z-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
             Notas de Venta
          </h2>
          <p className="text-slate-500 text-sm font-medium">Gestión de pedidos en proceso</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 rounded-xl flex items-center px-4 py-2 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
            <Search size={18} className="text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Buscar NV, cliente, producto..."
              className="outline-none text-sm w-64 bg-transparent text-slate-900 placeholder:text-slate-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-orange-500' : 'text-slate-500'} />
            Actualizar
          </button>
        </div>
      </div>

      {/* PIPELINE VISUAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 relative z-10 custom-scrollbar">
          {ESTADOS_PIPELINE.map((estadoKey, index) => {
            const config = getEstadoConfig(estadoKey);
            const Icon = config.icon;
            const isSelected = selectedEstado === estadoKey;
            const count = contadores[estadoKey] || 0;

            return (
              <React.Fragment key={estadoKey}>
                <button
                  onClick={() => setSelectedEstado(estadoKey)}
                  className={`flex-shrink-0 relative group transition-all duration-200 ${isSelected ? 'scale-105' : 'hover:-translate-y-1'}`}
                >
                  <div className={`
                    px-4 py-3 rounded-xl border transition-all text-center min-w-[120px]
                    ${isSelected
                      ? `bg-white ${config.borderColor} shadow-md ring-1 ring-${config.borderColor.split('-')[1]}-500/20`
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }
                  `}>
                    <div className={`
                      w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center transition-all
                      ${isSelected ? `${config.bgColor} text-slate-900 shadow-sm` : 'bg-white text-slate-500 border border-slate-200 shadow-sm'}
                    `}>
                      <Icon size={20} />
                    </div>
                    <p className={`font-bold text-xs mb-1 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                      {config.label}
                    </p>
                    <div className={`
                      inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold border
                      ${isSelected ? `${config.lightBg} ${config.textColor} ${config.borderColor}` : 'bg-white text-slate-500 border-slate-200'}
                    `}>
                      {count}
                    </div>
                  </div>
                </button>

                {index < ESTADOS_PIPELINE.length - 1 && (
                  <ChevronRight size={16} className="text-slate-700 flex-shrink-0" />
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
          <div className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${config.lightBg} ${config.textColor}`}>
                <config.icon size={24} />
              </div>
              <div>
                <p className={`font-black text-lg text-slate-800`}>
                  {config.label}: {filteredOrders.length} <span className="font-medium text-slate-500 text-sm">notas de venta</span>
                </p>
                <p className={`text-sm text-slate-500 font-medium`}>{config.description}</p>
              </div>
            </div>
            {accion && (
              <div className={`text-sm text-slate-600 font-medium flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200`}>
                <ArrowRight size={16} className="text-slate-500" /> Siguiente: <strong className="text-slate-800">{accion.label}</strong>
              </div>
            )}
          </div>
        );
      })()}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-bold border-b border-slate-200">
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
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <RefreshCw className="animate-spin mx-auto text-orange-500 mb-3" size={28} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando datos...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-500">
                    <Package size={40} className="mx-auto mb-3 text-slate-700" />
                    <p className="font-bold text-slate-700 text-lg">Sin resultados</p>
                    <p className="text-sm">No hay N.V. en estado "{getEstadoConfig(selectedEstado).label}"</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const config = getEstadoConfig(order.estado);
                  const accion = ACCIONES_ESTADO[order.estado] || ACCIONES_ESTADO[order.estado === 'PENDIENTE' ? 'Pendiente' : order.estado];

                  return (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-black text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">#{order.nv}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                        {order.fecha_emision ? new Date(order.fecha_emision).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 truncate max-w-[150px]" title={order.cliente}>
                          {order.cliente}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium truncate max-w-[100px]">
                        {order.vendedor}
                      </td>
                      <td className="px-6 py-4">
                        {order.total_items > 1 ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                              {order.total_items} items
                            </span>
                            <span className="text-xs font-medium text-slate-500 truncate max-w-[120px]">
                              Múltiples...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="font-mono text-xs font-bold text-slate-600">{order.codigo_producto}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{order.descripcion_producto}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.total_items > 1 ? (
                          <span className="font-black text-slate-900">{order.total_cantidad} <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</span></span>
                        ) : (
                          <span className="font-black text-slate-900">{order.cantidad} <span className="text-xs font-bold text-slate-500">{order.unidad}</span></span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {accion && (
                            <button
                              onClick={() => handleUpdateStatus(order.nv, accion.next)}
                              disabled={updateStatusMutation.isPending}
                              className={`${config.bgColor} hover:brightness-110 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm`}
                              title={accion.label}
                            >
                              <accion.icon size={14} />
                              {accion.label}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                            title="Ver detalle"
                          >
                            <Eye size={14} />
                          </button>
                          {hasPermission('delete_sales_orders') && (
                            <button
                              onClick={() => handleDeleteOrder(order.nv)}
                              disabled={deleteOrderMutation.isPending}
                              className="bg-white hover:bg-rose-50 text-rose-500 border border-slate-200 hover:border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
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
        <div className="fixed inset-0 bg-slate-50/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {(() => {
              const config = getEstadoConfig(selectedOrder.estado);
              return (
                <div className={`bg-slate-50 p-6 flex justify-between items-start border-b border-slate-200`}>
                  <div className="flex items-center gap-4">
                    <div className={`${config.lightBg} ${config.textColor} border ${config.borderColor} p-3 rounded-xl shadow-sm`}>
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className={`text-slate-500 text-[10px] font-bold uppercase tracking-widest`}>Nota de Venta</p>
                      <h2 className="text-3xl font-black text-slate-900">#{selectedOrder.nv}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasPermission('delete_sales_orders') && (
                      <button
                        onClick={() => handleDeleteOrder(selectedOrder.nv)}
                        className="text-rose-500 hover:text-rose-700 bg-white hover:bg-rose-50 p-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm"
                        title="Eliminar N.V. y bloquear re-importación"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Fecha</p>
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedOrder.fecha_emision ? new Date(selectedOrder.fecha_emision).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Cliente</p>
                  <p className="font-bold text-slate-800 text-sm truncate" title={selectedOrder.cliente}>{selectedOrder.cliente}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Vendedor</p>
                  <p className="font-bold text-slate-800 text-sm truncate" title={selectedOrder.vendedor}>{selectedOrder.vendedor || '-'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Estado</p>
                  {(() => {
                    const c = getEstadoConfig(selectedOrder.estado);
                    return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${c.lightBg} ${c.textColor} ${c.borderColor}`}>{c.label}</span>;
                  })()}
                </div>
              </div>

              {/* Producto (Lista de items) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Package size={16} className="text-slate-700" /> Productos ({selectedOrder.total_items || 1})
                </h3>

                <div className="max-h-60 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                  {(selectedOrder.items || [selectedOrder]).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Box size={20} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-slate-600 font-bold text-xs">{item.codigo_producto}</p>
                        <p className="text-slate-900 text-sm font-bold truncate">{item.descripcion_producto}</p>
                      </div>
                      <div className="text-right bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                        <p className="text-lg font-black text-orange-600 leading-none mb-1">{item.cantidad}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{item.unidad || 'UNI'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Cambiar Estado Manualmente</h3>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS_CONFIG.map((estado) => {
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
                          px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border
                          ${isCurrent
                            ? `bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed`
                            : isNext
                              ? `${estado.bgColor} text-slate-900 border-transparent shadow-md hover:brightness-110`
                              : `bg-white ${estado.textColor} ${estado.borderColor} hover:bg-slate-50`
                          }
                        `}
                      >
                        <estado.icon size={16} />
                        {estado.label}
                        {isCurrent && <span className="text-[10px] font-medium ml-1">(actual)</span>}
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
        <div className="fixed inset-0 bg-slate-50/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-50 p-6 border-b border-rose-100 flex gap-4 items-start">
              <div className="bg-white text-rose-500 p-3 rounded-xl flex-shrink-0 shadow-sm border border-rose-100">
                <AlertCircle size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-rose-700 mb-1">Permiso de Seguridad Requerido</h2>
                <p className="text-rose-600/80 text-sm font-medium">
                  Supabase está bloqueando la eliminación porque la nueva tabla <strong>tms_nv_eliminadas</strong> tiene la seguridad activada.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-slate-50">
              <p className="font-bold text-slate-800 text-sm">Para solucionarlo permanentemente, por favor sigue estos 2 pasos rápidos:</p>

              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-full bg-white text-indigo-600 font-black flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm">1</span>
                <div>
                  <p className="text-slate-600 font-medium mb-2 text-sm">Entra a tu cuenta de Supabase, ve al proyecto y abre el <strong>SQL Editor</strong>.</p>
                  <a href="https://supabase.com/dashboard/project/vtrtyzbgpsvqwbfoudaf/sql/new" target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold text-sm inline-flex items-center gap-1">
                    Abrir SQL Editor de Supabase Aquí <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start pt-2">
                <span className="w-8 h-8 rounded-full bg-white text-indigo-600 font-black flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm">2</span>
                <div className="w-full">
                  <p className="text-slate-600 font-medium mb-2 text-sm">Copia y Pega este código exacto, y dale al botón verde <strong>RUN</strong>:</p>

                  <div className="relative group">
                    <pre className="bg-slate-50 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono border border-slate-200">
                      {`ALTER TABLE public.tms_nv_eliminadas DISABLE ROW LEVEL SECURITY;`}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("ALTER TABLE public.tms_nv_eliminadas DISABLE ROW LEVEL SECURITY;");
                        toast.success("¡Código copiado! Pégalo en Supabase.");
                      }}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Copiar Código
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setRlsErrorModal(false)}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
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