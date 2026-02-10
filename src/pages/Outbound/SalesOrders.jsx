import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, AlertCircle } from 'lucide-react';

const API_URL = 'https://cco-ptm.onrender.com/api';

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/notas-venta`);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error cargando N.V:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.nv?.toString().includes(searchTerm) ||
    order.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
                            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                <Eye size={18} />
                            </button>
                        </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesOrders;
