import React, { useState, useEffect } from 'react';
import { 
  Truck, Search, Filter, MapPin, 
  Calendar, Layers, RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabase';

const Shipping = () => {
  const [loading, setLoading] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Consultar despachos pendientes (generados desde Packing)
      const { data, error } = await supabase
        .from('tms_entregas')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(d => 
    d.nv.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.cliente && d.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch(status) {
        case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'EN_RUTA': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'ENTREGADO': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monitor de Despachos</h2>
          <p className="text-slate-500 text-sm">Visualización de pedidos listos para ruta</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3 flex-1 w-full md:w-auto">
            <div className="bg-slate-50 border rounded-lg flex items-center px-3 py-2 flex-1">
                <Search size={18} className="text-slate-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Buscar N.V, Cliente..." 
                    className="bg-transparent outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <button 
            onClick={fetchData}
            className="bg-white border hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">N.V</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Dirección</th>
                        <th className="px-6 py-4 text-center">Bultos</th>
                        <th className="px-6 py-4 text-center">Estado</th>
                        <th className="px-6 py-4">Fecha Prep.</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredDeliveries.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                <Truck size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No hay despachos registrados</p>
                            </td>
                        </tr>
                    ) : (
                        filteredDeliveries.map((delivery) => (
                            <tr key={delivery.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-black text-slate-700">{delivery.nv}</td>
                                <td className="px-6 py-4 font-medium text-slate-600">{delivery.cliente}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    <div className="truncate max-w-[200px]">
                                        {delivery.direccion || 'Sin Dirección'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold text-xs border border-slate-200">
                                        {delivery.bultos}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(delivery.estado)}`}>
                                        {delivery.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-xs">
                                    {new Date(delivery.fecha_creacion).toLocaleDateString()}
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

export default Shipping;
