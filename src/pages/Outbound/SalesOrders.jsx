import React, { useState, useEffect } from 'react';
import { Hand, Search, Filter, Eye, AlertCircle, X, Package, Truck, Calendar, User, FileText } from 'lucide-react';
import { supabase } from '../../supabase';

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .order('fecha_emision', { ascending: false })
        .limit(100);

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error("Error cargando N.V:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (nv, newStatus) => {
    try {
      setModalLoading(true);
      const { error } = await supabase
        .from('tms_nv_diarias')
        .update({ estado: newStatus })
        .eq('nv', nv);

      if (error) throw error;

      // Actualizar localmente
      setOrders(orders.map(o => o.nv === nv ? { ...o, estado: newStatus } : o));
      setSelectedOrder(prev => ({ ...prev, estado: newStatus }));
      
      alert(`Estado actualizado a: ${newStatus}`);
    } catch (e) {
      alert('Error actualizando estado: ' + e.message);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.nv?.toString().includes(searchTerm) ||
    order.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
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
                    placeholder="Buscar por N.V o Cliente..." 
                    className="outline-none text-sm w-64"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={fetchOrders}
                className="bg-white border hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
            >
                <Filter size={16} />
                Recargar
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>No se pudieron cargar los datos: {error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">N.V</th>
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
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                        Cargando pedidos...
                    </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                        No se encontraron notas de venta
                    </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-indigo-600">#{order.nv}</td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="font-medium">{order.cliente}</div>
                            <div className="text-xs text-slate-400">{order.vendedor}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="font-medium">{order.codigo_producto}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{order.descripcion_producto}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                            {order.cantidad} <span className="text-xs font-normal text-slate-400">{order.unidad}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                order.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                order.estado === 'DESPACHADO' ? 'bg-green-100 text-green-700 border-green-200' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                                {order.estado}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => handleOpenModal(order)}
                                className="text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ml-auto"
                            >
                                <Eye size={14} /> Ver
                            </button>
                        </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLE N.V */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="bg-orange-50 p-6 flex justify-between items-start border-b border-orange-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-3 rounded-xl text-white shadow-lg shadow-orange-200">
                            <FileText size={28} />
                        </div>
                        <div>
                            <p className="text-orange-800 text-sm font-bold uppercase tracking-wide">Nota de Venta</p>
                            <h2 className="text-3xl font-black text-slate-900">{selectedOrder.nv}</h2>
                        </div>
                    </div>
                    <button 
                        onClick={handleCloseModal}
                        className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 transition-all flex items-center gap-2"
                    >
                        <X size={16} /> Cerrar
                    </button>
                </div>

                <div className="p-8 bg-slate-50/50">
                    {/* Tarjetas de Información */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase">
                                <AlertCircle size={14} /> Estado
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                                selectedOrder.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                selectedOrder.estado === 'DESPACHADO' ? 'bg-green-100 text-green-700 border-green-200' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                                {selectedOrder.estado}
                            </span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase">
                                <Calendar size={14} /> Fecha Emisión
                            </div>
                            <p className="font-bold text-slate-800">
                                {new Date(selectedOrder.fecha_emision).toLocaleDateString()}
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

                    {/* Acciones */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Truck size={18} className="text-slate-400" /> Cambiar Estado
                        </h3>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleUpdateStatus(selectedOrder.nv, 'PICKING')}
                                disabled={modalLoading}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-cyan-200 transition-all flex items-center gap-2"
                            >
                                <Hand size={18} /> Enviar a Picking
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus(selectedOrder.nv, 'ANULADA')}
                                disabled={modalLoading}
                                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-red-200 transition-all flex items-center gap-2"
                            >
                                <X size={18} /> Anular N.V
                            </button>
                        </div>
                    </div>

                    {/* Productos */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                            <Package size={18} className="text-slate-500" />
                            <h3 className="font-bold text-slate-800">Productos</h3>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold ml-2">1 item</span>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Código</th>
                                    <th className="px-6 py-3">Descripción</th>
                                    <th className="px-6 py-3 text-center">U.M</th>
                                    <th className="px-6 py-3 text-right">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-6 py-4 font-mono text-orange-600 font-bold bg-orange-50/30">
                                        {selectedOrder.codigo_producto}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 font-medium">
                                        {selectedOrder.descripcion_producto}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-500">
                                        {selectedOrder.unidad}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600 bg-emerald-50/30">
                                        {selectedOrder.cantidad}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrders;
