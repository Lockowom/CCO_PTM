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
      empresa_transporte: delivery.empresa_transporte || 'PROPIO',
      transportista: delivery.transportista || '',
      division: delivery.division || '',
      valor_flete: delivery.valor_flete || 0,
      num_envio_ot: delivery.num_envio_ot || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('tms_entregas')
        .update({
            facturas: editForm.facturas || '',
            guia: editForm.guia || '',
            empresa_transporte: editForm.empresa_transporte || 'PROPIO',
            transportista: editForm.transportista || '',
            division: editForm.division || '',
            valor_flete: parseFloat(editForm.valor_flete) || 0,
            num_envio_ot: editForm.num_envio_ot || '',
            fecha_despacho: now // Usar string ISO
        })
        .eq('id', id);

      if (error) throw error;

      setDeliveries(prev => prev.map(d => 
        d.id === id ? { 
            ...d, 
            ...editForm, 
            fecha_despacho: now 
        } : d
      ));
      
      setEditingId(null);
      alert("Despacho guardado. Sincronizando con Excel...");

    } catch (err) {
      alert("Error: " + err.message);
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
                        <th className="px-4 py-4 w-24">Facturas</th>
                        <th className="px-4 py-4 w-24">Guía</th>
                        <th className="px-4 py-4 w-32">Empresa</th>
                        <th className="px-4 py-4 w-32">Transportista</th>
                        <th className="px-4 py-4 w-24">Flete ($)</th>
                        <th className="px-4 py-4 w-24">N° Envío</th>
                        <th className="px-4 py-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredDeliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-black text-slate-700">{delivery.nv}</td>
                            <td className="px-4 py-3 font-medium text-slate-600 truncate max-w-[150px]" title={delivery.cliente}>
                                {delivery.cliente}
                            </td>
                            
                            {/* Campos Editables */}
                            {editingId === delivery.id ? (
                                <>
                                    <td className="px-4 py-3">
                                        <input type="text" className="w-full border rounded p-1 text-xs" value={editForm.facturas} onChange={e => setEditForm({...editForm, facturas: e.target.value})} placeholder="Facturas" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="text" className="w-full border rounded p-1 text-xs" value={editForm.guia} onChange={e => setEditForm({...editForm, guia: e.target.value})} placeholder="Guía" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="text" className="w-full border rounded p-1 text-xs" value={editForm.empresa_transporte} onChange={e => setEditForm({...editForm, empresa_transporte: e.target.value})} placeholder="Empresa" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="text" className="w-full border rounded p-1 text-xs" value={editForm.transportista} onChange={e => setEditForm({...editForm, transportista: e.target.value})} placeholder="Chofer" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="number" className="w-full border rounded p-1 text-xs" value={editForm.valor_flete} onChange={e => setEditForm({...editForm, valor_flete: e.target.value})} placeholder="$" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="text" className="w-full border rounded p-1 text-xs" value={editForm.num_envio_ot} onChange={e => setEditForm({...editForm, num_envio_ot: e.target.value})} placeholder="OT" />
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{delivery.facturas || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{delivery.guia || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{delivery.empresa_transporte || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{delivery.transportista || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{delivery.valor_flete || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{delivery.num_envio_ot || '-'}</td>
                                </>
                            )}

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
