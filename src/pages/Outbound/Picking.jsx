import React, { useState, useEffect } from 'react';
import { 
  Hand, Search, Filter, Play, ArrowLeft, 
  CheckCircle, AlertTriangle, Package, User, Calendar, 
  ClipboardList, Box, MoreVertical, XCircle 
} from 'lucide-react';
import { supabase } from '../../supabase';

const Picking = () => {
  // Views: 'LIST' | 'ACTIVE' | 'MONITOR'
  const [view, setView] = useState('LIST');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Active Picking State
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const [pickedState, setPickedState] = useState({}); // { sku: { status: 'OK'|'NO_STOCK', quantity: 10 } }

  // Stats
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders in 'PICKING' or 'PENDIENTE PICKING'
      // Note: In legacy, 'PENDIENTE PICKING' is the initial state.
      // We also fetch 'EN_PICKING' to resume or show in monitor.
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .in('estado', ['PICKING', 'PENDIENTE PICKING', 'EN_PICKING', 'PARCIALIZADA'])
        .order('fecha_emision', { ascending: true });

      if (error) throw error;

      // Group by NV
      const grouped = {};
      data.forEach(row => {
        if (!grouped[row.nv]) {
          grouped[row.nv] = {
            nv: row.nv,
            cliente: row.cliente,
            fecha_emision: row.fecha_emision,
            vendedor: row.vendedor,
            estado: row.estado,
            items: [],
            total_items: 0
          };
        }
        grouped[row.nv].items.push(row);
        grouped[row.nv].total_items += 1;
      });

      const orderList = Object.values(grouped);
      setOrders(orderList);

      // Calc stats
      setStats({
        pending: orderList.filter(o => o.estado === 'PENDIENTE PICKING' || o.estado === 'PICKING').length,
        inProgress: orderList.filter(o => o.estado === 'EN_PICKING' || o.estado === 'PARCIALIZADA').length,
        completed: 0 // We don't fetch completed here usually
      });

    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const startPicking = (order) => {
    setActiveOrder(order);
    setActiveItems(order.items);
    // Initialize picked state based on existing data if we had persistence
    // For now, init empty
    const initialState = {};
    order.items.forEach(item => {
        initialState[item.codigo_producto] = {
            status: 'PENDIENTE',
            quantity: 0,
            required: item.cantidad
        };
    });
    setPickedState(initialState);
    setView('ACTIVE');
  };

  const handlePickItem = (sku, quantity, status = 'OK') => {
    setPickedState(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        status: status,
        quantity: quantity
      }
    }));
  };

  const completePicking = async () => {
    // Validate
    const pendingItems = Object.values(pickedState).filter(s => s.status === 'PENDIENTE');
    if (pendingItems.length > 0) {
      if (!window.confirm(`Quedan ${pendingItems.length} productos pendientes. ¿Desea continuar y marcarlos como pendientes?`)) {
        return;
      }
    }

    try {
      setLoading(true);
      
      // 1. Guardar cambios de cantidades (Picking Parcial)
      const updates = [];
      
      // Recorrer items activos para ver si cambiaron
      for (const item of activeItems) {
          const state = pickedState[item.codigo_producto];
          if (state && state.status === 'OK' && state.quantity !== item.cantidad) {
              // Si la cantidad pickeada es diferente a la original, actualizamos
              updates.push(
                  supabase.from('tms_nv_diarias')
                  .update({ cantidad: state.quantity })
                  .eq('nv', activeOrder.nv)
                  .eq('codigo_producto', item.codigo_producto)
              );
          } else if (state && state.status === 'NO_STOCK') {
              // Si no hubo stock, ponemos cantidad a 0 (o podríamos marcar estado SIN_STOCK)
              updates.push(
                  supabase.from('tms_nv_diarias')
                  .update({ cantidad: 0, estado: 'SIN_STOCK' })
                  .eq('nv', activeOrder.nv)
                  .eq('codigo_producto', item.codigo_producto)
              );
          }
      }

      // Ejecutar actualizaciones de cantidad en paralelo
      if (updates.length > 0) await Promise.all(updates);

      // 2. Mover toda la orden a PACKING (excepto los que quedaron SIN_STOCK)
      const { error } = await supabase
        .from('tms_nv_diarias')
        .update({ estado: 'PACKING' })
        .eq('nv', activeOrder.nv)
        .neq('estado', 'SIN_STOCK'); // No mover los que marcamos sin stock

      if (error) throw error;

      alert(`Picking completado para N.V ${activeOrder.nv}`);
      setView('LIST');
      fetchOrders(); // Recargar lista

    } catch (err) {
      alert("Error completando picking: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.nv.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.cliente && o.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- RENDER HELPERS ---

  const renderStatusBadge = (status) => {
    const styles = {
      'PENDIENTE PICKING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PICKING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'EN_PICKING': 'bg-blue-100 text-blue-800 border-blue-200',
      'PARCIALIZADA': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (view === 'ACTIVE' && activeOrder) {
    // --- ACTIVE PICKING VIEW ---
    const progress = Object.values(pickedState).filter(s => s.status === 'OK' || s.status === 'NO_STOCK').length;
    const total = activeItems.length;
    const progressPercent = Math.round((progress / total) * 100);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header Active */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Picking Activo</span>
                {renderStatusBadge(activeOrder.estado)}
              </div>
              <h2 className="text-3xl font-black text-slate-800">N.V {activeOrder.nv}</h2>
              <p className="text-slate-500 font-medium">{activeOrder.cliente}</p>
            </div>
            <button 
              onClick={() => setView('LIST')}
              className="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Volver
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Progreso</span>
            <span>{progress} / {total} Items ({progressPercent}%)</span>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Box size={20} className="text-indigo-600" /> Productos
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {activeItems.map((item, idx) => {
              const state = pickedState[item.codigo_producto] || {};
              const isDone = state.status === 'OK';
              const isNoStock = state.status === 'NO_STOCK';

              return (
                <div key={idx} className={`p-4 transition-colors ${isDone ? 'bg-green-50/50' : isNoStock ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    {/* Checkbox Visual */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 flex-shrink-0 ${
                      isDone ? 'bg-green-500 border-green-500 text-white' : 
                      isNoStock ? 'bg-red-500 border-red-500 text-white' : 
                      'border-slate-300 text-transparent'
                    }`}>
                      {isDone ? <CheckCircle size={20} /> : isNoStock ? <XCircle size={20} /> : <CheckCircle size={20} />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-sm">
                          {item.codigo_producto}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase">{item.unidad}</span>
                      </div>
                      <p className="text-slate-800 font-medium truncate">{item.descripcion_producto}</p>
                    </div>

                    {/* Quantity */}
                    <div className="text-right px-4">
                      <div className="text-xs text-slate-400 font-bold uppercase">Solicitado</div>
                      <div className="text-2xl font-black text-slate-800">{item.cantidad}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full md:w-auto justify-end">
                      {!isDone && !isNoStock ? (
                        <>
                          <button 
                            onClick={() => handlePickItem(item.codigo_producto, item.cantidad, 'OK')}
                            className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle size={16} /> Completo
                          </button>
                          <button 
                            onClick={() => {
                                const qty = prompt('Cantidad encontrada:', item.cantidad);
                                if (qty !== null) handlePickItem(item.codigo_producto, Number(qty), 'OK');
                            }}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-200 px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors"
                          >
                            <AlertTriangle size={16} /> Parcial
                          </button>
                          <button 
                            onClick={() => handlePickItem(item.codigo_producto, 0, 'NO_STOCK')}
                            className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 px-3 py-2 rounded-lg font-bold text-sm transition-colors"
                          >
                            Sin Stock
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handlePickItem(item.codigo_producto, 0, 'PENDIENTE')}
                          className="text-slate-400 hover:text-slate-600 font-bold text-sm underline"
                        >
                          Deshacer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <button 
             onClick={() => setView('LIST')}
             className="w-full py-4 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
           >
             Cancelar / Guardar Parcial
           </button>
           <button 
             onClick={completePicking}
             disabled={loading}
             className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
           >
             {loading ? 'Procesando...' : 'Confirmar Picking y Finalizar'}
           </button>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Picking</h2>
          <p className="text-slate-500 text-sm">Gestión de recolección de pedidos</p>
        </div>
        
        {/* Stats Mini Dashboard */}
        <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Pendientes</span>
                <span className="text-xl font-black text-yellow-600">{stats.pending}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">En Proceso</span>
                <span className="text-xl font-black text-blue-600">{stats.inProgress}</span>
            </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm flex-1 max-w-md">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
                type="text" 
                placeholder="Buscar por N.V, Cliente..." 
                className="outline-none text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <button 
            onClick={fetchOrders}
            className="bg-white border hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
        >
            <Filter size={16} /> Recargar
        </button>
      </div>

      {/* Grid of Orders */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Cargando órdenes...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
            <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
            <p>No hay órdenes pendientes de picking</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
                <div key={order.nv} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg font-bold text-xs">
                                    NV
                                </div>
                                <span className="text-xl font-black text-slate-800">{order.nv}</span>
                            </div>
                            {renderStatusBadge(order.estado)}
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                                <User size={18} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-slate-700">{order.cliente}</p>
                                    <p className="text-xs text-slate-400">{order.vendedor}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-slate-400" />
                                <p className="text-sm text-slate-600">
                                    {new Date(order.fecha_emision).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Package size={18} className="text-slate-400" />
                                <p className="text-sm text-slate-600 font-medium">
                                    {order.total_items} items
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => startPicking(order)}
                            className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <Play size={18} /> Empezar Picking
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Picking;
