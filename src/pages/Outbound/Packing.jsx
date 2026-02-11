import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Play, ArrowLeft, 
  CheckCircle, Truck, Box, User, Calendar 
} from 'lucide-react';
import { supabase } from '../../supabase';

const Packing = () => {
  // Views: 'LIST' | 'ACTIVE'
  const [view, setView] = useState('LIST');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Active Packing State
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  
  // Form State
  const [packingData, setPackingData] = useState({
    bultos: 1,
    pallets: 0,
    pesoBulto: 0,
    pesoPallet: 0,
    observaciones: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .in('estado', ['PACKING', 'PENDIENTE PACKING', 'EN_PACKING'])
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

      setOrders(Object.values(grouped));
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const startPacking = (order) => {
    setActiveOrder(order);
    setActiveItems(order.items);
    setPackingData({
      bultos: 1,
      pallets: 0,
      pesoBulto: 0,
      pesoPallet: 0,
      observaciones: ''
    });
    setView('ACTIVE');
  };

  const completePacking = async () => {
    if (packingData.bultos < 1) {
      alert("Debe ingresar al menos 1 bulto.");
      return;
    }

    try {
      setLoading(true);

      // 1. Update Order Status to 'LISTO_DESPACHO'
      const { error } = await supabase
        .from('tms_nv_diarias')
        .update({ 
            estado: 'LISTO_DESPACHO'
        }) 
        .eq('nv', activeOrder.nv);

      if (error) throw error;

      // 2. Insert/Update 'Entregas' table (Copy to Despacho)
      const { data: existing } = await supabase
        .from('tms_entregas')
        .select('nv')
        .eq('nv', activeOrder.nv)
        .single();

      if (!existing) {
        const { error: insertError } = await supabase
            .from('tms_entregas')
            .insert({
                nv: activeOrder.nv,
                cliente: activeOrder.cliente,
                direccion: '', 
                bultos: packingData.bultos,
                peso_kg: packingData.pesoBulto,
                estado: 'PENDIENTE', 
                observaciones: packingData.observaciones
            });
            
        if (insertError) console.error("Error creating delivery:", insertError);
      } else {
        await supabase
            .from('tms_entregas')
            .update({
                bultos: packingData.bultos,
                peso_kg: packingData.pesoBulto,
                observaciones: packingData.observaciones
            })
            .eq('nv', activeOrder.nv);
      }

      alert(`Packing completado para N.V ${activeOrder.nv}. Lista para despacho.`);
      setView('LIST');
      fetchOrders(); 

    } catch (err) {
      alert("Error completando packing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold border bg-blue-100 text-blue-800 border-blue-200">
        {status}
      </span>
    );
  };

  const filteredOrders = orders.filter(o => 
    o.nv.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.cliente && o.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (view === 'ACTIVE' && activeOrder) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Packing Activo</span>
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

                {/* Formulario de Datos */}
                <div className="space-y-4">
                    <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
                        <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-4">
                            <Box size={20} /> Datos de Empaque
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-amber-700 uppercase mb-2">Cantidad de Bultos</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={packingData.bultos}
                                    onChange={(e) => setPackingData({...packingData, bultos: parseInt(e.target.value) || 0})}
                                    className="w-full text-center text-3xl font-black p-3 rounded-lg border border-amber-200 focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-700 uppercase mb-2">Cantidad de Pallets</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={packingData.pallets}
                                    onChange={(e) => setPackingData({...packingData, pallets: parseInt(e.target.value) || 0})}
                                    className="w-full text-center text-3xl font-black p-3 rounded-lg border border-amber-200 focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-700 uppercase mb-2">Peso Total Bultos (kg)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={packingData.pesoBulto}
                                    onChange={(e) => setPackingData({...packingData, pesoBulto: parseFloat(e.target.value) || 0})}
                                    className="w-full text-center font-bold p-3 rounded-lg border border-amber-200 focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-700 uppercase mb-2">Peso Total c/Pallet (kg)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={packingData.pesoPallet}
                                    onChange={(e) => setPackingData({...packingData, pesoPallet: parseFloat(e.target.value) || 0})}
                                    className="w-full text-center font-bold p-3 rounded-lg border border-amber-200 focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none"
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-xs font-bold text-amber-700 uppercase mb-2">Observaciones Adicionales</label>
                            <textarea 
                                value={packingData.observaciones}
                                onChange={(e) => setPackingData({...packingData, observaciones: e.target.value})}
                                className="w-full p-3 rounded-lg border border-amber-200 focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none text-sm resize-none"
                                rows="3"
                                placeholder="Ej: Frágil, Mantener vertical, etc..."
                            />
                        </div>
                    </div>

                    <button 
                        onClick={completePacking}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 text-lg"
                    >
                        <Truck size={24} /> {loading ? 'Procesando...' : 'Finalizar y Pasar a Despacho'}
                    </button>
                </div>
            </div>
            
            {/* Items List Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Package size={18} className="text-indigo-600" /> Contenido del Pedido ({activeItems.length} items)
                    </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Código</th>
                                <th className="px-4 py-3">Descripción</th>
                                <th className="px-4 py-3 text-right">Cant.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activeItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 font-mono font-bold text-slate-600">{item.codigo_producto}</td>
                                    <td className="px-4 py-3 text-slate-600">{item.descripcion_producto}</td>
                                    <td className="px-4 py-3 text-right font-bold">{item.cantidad} {item.unidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Packing</h2>
          <p className="text-slate-500 text-sm">Registro de bultos y preparación para despacho</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm flex-1 max-w-md">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
                type="text" 
                placeholder="Buscar N.V..." 
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

      {loading && orders.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Cargando órdenes para packing...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p>No hay órdenes pendientes de empaque</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
                <div key={order.nv} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg font-bold text-xs">
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
                                <Box size={18} className="text-slate-400" />
                                <p className="text-sm text-slate-600 font-medium">
                                    {order.total_items} items
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => startPacking(order)}
                            className="w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <Package size={18} /> Iniciar Packing
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Packing;
