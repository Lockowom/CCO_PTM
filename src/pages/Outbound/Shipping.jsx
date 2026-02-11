import React, { useState, useEffect } from 'react';
import { 
  Truck, Search, Filter, MapPin, 
  Calendar, Layers, RefreshCw, Save, Edit2, X, Check
} from 'lucide-react';
import { supabase } from '../../supabase';

const Shipping = () => {
  const [loading, setLoading] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado de edición
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Consultar despachos pendientes
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

  const handleEdit = (delivery) => {
    setEditingId(delivery.id);
    setEditForm({
      facturas: delivery.facturas || '',
      guia: delivery.guia || '',
      transportista: delivery.transportista || '',
      division: delivery.division || '',
      num_envio: delivery.num_envio || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      
      // Actualizar en Supabase
      // NOTA: Asegúrate de que estas columnas existan en tu tabla 'tms_entregas'
      // Si no existen, el update fallará o las ignorará.
      const { error } = await supabase
        .from('tms_entregas')
        .update({
            facturas: editForm.facturas,
            guia: editForm.guia,
            transportista: editForm.transportista,
            // Guardamos campos extra en columnas si existen, o en observaciones si no
            // Asumiremos que vamos a crear estas columnas en Supabase si no están
            observaciones: `DIV:${editForm.division} ENV:${editForm.num_envio}` 
        })
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local
      setDeliveries(deliveries.map(d => 
        d.id === id ? { ...d, ...editForm } : d
      ));
      
      setEditingId(null);
      alert("Datos actualizados. Se sincronizarán con Sheets en breve.");

    } catch (err) {
      alert("Error guardando: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(d => 
    d.nv.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.cliente && d.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Despachos</h2>
          <p className="text-slate-500 text-sm">Complete los datos manuales para sincronizar con Excel</p>
        </div>
      </div>

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-4">N.V</th>
                        <th className="px-4 py-4">Cliente</th>
                        <th className="px-4 py-4 w-32">Facturas</th>
                        <th className="px-4 py-4 w-32">Guía</th>
                        <th className="px-4 py-4 w-40">Transportista</th>
                        <th className="px-4 py-4 text-center">Bultos</th>
                        <th className="px-4 py-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredDeliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-black text-slate-700">{delivery.nv}</td>
                            <td className="px-4 py-3 font-medium text-slate-600 truncate max-w-[200px]" title={delivery.cliente}>
                                {delivery.cliente}
                            </td>
                            
                            {/* Campos Editables */}
                            {editingId === delivery.id ? (
                                <>
                                    <td className="px-4 py-3">
                                        <input 
                                            type="text" 
                                            className="w-full border rounded p-1 text-xs"
                                            value={editForm.facturas}
                                            onChange={e => setEditForm({...editForm, facturas: e.target.value})}
                                            placeholder="Ej: 1234, 5678"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input 
                                            type="text" 
                                            className="w-full border rounded p-1 text-xs"
                                            value={editForm.guia}
                                            onChange={e => setEditForm({...editForm, guia: e.target.value})}
                                            placeholder="Ej: 998877"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input 
                                            type="text" 
                                            className="w-full border rounded p-1 text-xs"
                                            value={editForm.transportista}
                                            onChange={e => setEditForm({...editForm, transportista: e.target.value})}
                                            placeholder="Nombre Chofer"
                                        />
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-4 py-3 text-slate-500">{delivery.facturas || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{delivery.guia || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{delivery.transportista || '-'}</td>
                                </>
                            )}

                            <td className="px-4 py-3 text-center">
                                <span className="bg-slate-100 px-2 py-1 rounded font-bold text-xs">{delivery.bultos}</span>
                            </td>

                            <td className="px-4 py-3 text-center">
                                {editingId === delivery.id ? (
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleSave(delivery.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={18}/></button>
                                        <button onClick={handleCancelEdit} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={18}/></button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleEdit(delivery)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded">
                                        <Edit2 size={16}/>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
