import React, { useState, useEffect } from 'react';
import { Truck, Search, MapPin, Calendar, ExternalLink } from 'lucide-react';

const API_URL = 'https://cco-ptm.onrender.com/api';

const Shipping = () => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntregas();
  }, []);

  const fetchEntregas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/entregas?estado=EN_RUTA&limit=50`);
      const data = await res.json();
      setEntregas(data);
    } catch (error) {
      console.error("Error cargando despachos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Despachos</h2>
          <p className="text-slate-500 text-sm">Monitoreo de camiones en ruta</p>
        </div>
        <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm">
            <Search size={18} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Buscar patente o chofer..." className="outline-none text-sm w-64" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">ID Entrega</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Dirección</th>
                <th className="px-6 py-4 font-medium">Conductor</th>
                <th className="px-6 py-4 font-medium text-center">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Cargando despachos en curso...</td></tr>
              ) : entregas.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No hay despachos activos en este momento</td></tr>
              ) : (
                entregas.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{e.nv}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{e.cliente}</td>
                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{e.direccion}</td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {(e.conductor_id || 'C').charAt(0)}
                                </div>
                                <span>{e.conductor_id || 'Sin Asignar'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold border border-blue-200 animate-pulse">
                                EN RUTA
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center justify-end gap-1">
                                Ver Mapa <ExternalLink size={14} />
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

export default Shipping;
