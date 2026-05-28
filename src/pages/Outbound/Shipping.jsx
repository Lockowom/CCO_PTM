import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, Search, Filter, MapPin, 
  Calendar, Layers, RefreshCw, Save, Edit2, X, Check
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { logUpload } from '../../utils/logUpload';

const Shipping = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado de edición
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
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

  const { data: deliveries = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['shipping_deliveries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_entregas')
        .select('*')
        .order('fecha_creacion', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, form, originalDelivery }) => {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('tms_entregas')
        .update({
            facturas: form.facturas || '',
            guia: form.guia || '',
            empresa_transporte: form.empresa_transporte || 'PROPIO',
            transportista: form.transportista || '',
            division: form.division || '',
            valor_flete: parseFloat(form.valor_flete) || 0,
            num_envio_ot: form.num_envio_ot || '',
            fecha_despacho: now
        })
        .eq('id', id);

      if (error) throw error;

      if (originalDelivery) {
        const controlPayload = {
            fecha_docto: originalDelivery.fecha_creacion || now,
            cliente: originalDelivery.cliente,
            facturas: form.facturas || '',
            guia: form.guia || '',
            bultos: originalDelivery.bultos || 0,
            empresa_transporte: form.empresa_transporte || 'PROPIO',
            transportista: form.transportista || '',
            nv: originalDelivery.nv,
            division: form.division || '',
            vendedor: originalDelivery.vendedor || '', 
            fecha_despacho: now,
            valor_flete: parseFloat(form.valor_flete) || 0,
            numero_envio: form.num_envio_ot || ''
        };

        const { error: controlError } = await supabase
            .from('tms_control_despacho')
            .insert(controlPayload);

        if (controlError) {
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping_deliveries'] });
      setEditingId(null);
      toast.success("Despacho guardado y sincronizado con Control Despacho.", {
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
      });
      logUpload({ modulo: 'Despachos', tablaDestino: 'tms_entregas + tms_control_despacho', totalRegistros: 1, actualizados: 1 });
    },
    onError: (err) => {
      toast.error("Error: " + err.message, {
        style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' }
      });
    }
  });

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

  const handleSave = (id) => {
    const originalDelivery = deliveries.find(d => d.id === id);
    saveMutation.mutate({ id, form: editForm, originalDelivery });
  };

  const filteredDeliveries = deliveries.filter(d => 
    d.nv.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.cliente && d.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 bg-slate-50 min-h-screen text-slate-700 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <Truck className="text-wms-neon flex-shrink-0" size={20} />
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Gestión de Despachos</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Datos para sincronizar con Excel</p>
          </div>
        </div>
      </div>

      <div className="bg-white backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-wms-neon/10 rounded-full blur-3xl"></div>
        <div className="flex gap-3 flex-1 w-full md:w-auto relative z-10">
            <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3 py-2 flex-1 focus-within:border-wms-neon transition-colors">
                <Search size={18} className="text-slate-500 mr-2" />
                <input 
                    type="text" 
                    placeholder="Buscar N.V, Cliente..." 
                    className="bg-transparent outline-none text-sm w-full text-slate-900 placeholder:text-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <button 
            onClick={() => refetch()}
            disabled={loading}
            className="bg-slate-50 border border-slate-200 hover:border-wms-neon hover:text-wms-neon text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all relative z-10"
        >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden relative">
        <div className="overflow-x-auto -mx-2 px-2 relative z-10">
            <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                        <th className="px-2 sm:px-4 py-4 font-bold tracking-wider">N.V</th>
                        <th className="px-2 sm:px-4 py-4 font-bold tracking-wider">Cliente</th>
                        <th className="px-2 sm:px-4 py-4 w-24 font-bold tracking-wider">Facturas</th>
                        <th className="px-2 sm:px-4 py-4 w-24 font-bold tracking-wider">Guía</th>
                        <th className="px-2 sm:px-4 py-4 w-32 font-bold tracking-wider">Empresa</th>
                        <th className="px-2 sm:px-4 py-4 w-32 font-bold tracking-wider">Transportista</th>
                        <th className="px-2 sm:px-4 py-4 w-24 font-bold tracking-wider">Flete ($)</th>
                        <th className="px-2 sm:px-4 py-4 w-24 font-bold tracking-wider">N° Envío</th>
                        <th className="px-2 sm:px-4 py-4 text-center font-bold tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-wms-border">
                    {filteredDeliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-2 sm:px-4 py-3 font-black text-slate-900">#{delivery.nv}</td>
                            <td className="px-2 sm:px-4 py-3 font-medium text-slate-700 truncate max-w-[150px]" title={delivery.cliente}>
                                {delivery.cliente}
                            </td>
                            
                            {/* Campos Editables */}
                            {editingId === delivery.id ? (
                                <>
                                    <td className="px-2 sm:px-4 py-3">
                                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-900 focus:border-wms-neon outline-none" value={editForm.facturas} onChange={e => setEditForm({...editForm, facturas: e.target.value})} placeholder="Facturas" />
                                    </td>
                                    <td className="px-2 sm:px-4 py-3">
                                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-900 focus:border-wms-neon outline-none" value={editForm.guia} onChange={e => setEditForm({...editForm, guia: e.target.value})} placeholder="Guía" />
                                    </td>
                                    <td className="px-2 sm:px-4 py-3">
                                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-900 focus:border-wms-neon outline-none" value={editForm.empresa_transporte} onChange={e => setEditForm({...editForm, empresa_transporte: e.target.value})} placeholder="Empresa" />
                                    </td>
                                    <td className="px-2 sm:px-4 py-3">
                                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-900 focus:border-wms-neon outline-none" value={editForm.transportista} onChange={e => setEditForm({...editForm, transportista: e.target.value})} placeholder="Chofer" />
                                    </td>
                                    <td className="px-2 sm:px-4 py-3">
                                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-900 focus:border-wms-neon outline-none" value={editForm.valor_flete} onChange={e => setEditForm({...editForm, valor_flete: e.target.value})} placeholder="$" />
                                    </td>
                                    <td className="px-2 sm:px-4 py-3">
                                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs text-slate-900 focus:border-wms-neon outline-none" value={editForm.num_envio_ot} onChange={e => setEditForm({...editForm, num_envio_ot: e.target.value})} placeholder="OT" />
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-2 sm:px-4 py-3 text-slate-500 text-xs">{delivery.facturas || '-'}</td>
                                    <td className="px-2 sm:px-4 py-3 text-slate-500 text-xs">{delivery.guia || '-'}</td>
                                    <td className="px-2 sm:px-4 py-3 text-slate-500 text-xs">{delivery.empresa_transporte || '-'}</td>
                                    <td className="px-2 sm:px-4 py-3 text-slate-500 text-xs">{delivery.transportista || '-'}</td>
                                    <td className="px-2 sm:px-4 py-3 text-slate-500 text-xs">{delivery.valor_flete || '-'}</td>
                                    <td className="px-2 sm:px-4 py-3 text-slate-500 text-xs">{delivery.num_envio_ot || '-'}</td>
                                </>
                            )}

                            <td className="px-2 sm:px-4 py-3 text-center">
                                {editingId === delivery.id ? (
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleSave(delivery.id)} disabled={saveMutation.isPending} className="text-wms-neon hover:bg-wms-neon/20 p-1 rounded transition-colors"><Check size={18}/></button>
                                        <button onClick={handleCancelEdit} className="text-wms-danger hover:bg-wms-danger/20 p-1 rounded transition-colors"><X size={18}/></button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleEdit(delivery)} className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 p-1 rounded transition-colors">
                                        <Edit2 size={16}/>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredDeliveries.length === 0 && !loading && (
                        <tr>
                            <td colSpan="9" className="px-2 sm:px-4 py-8 text-center text-slate-500">
                                No se encontraron despachos
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Shipping;