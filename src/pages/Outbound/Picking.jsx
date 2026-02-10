import React, { useState, useEffect } from 'react';
import { Hand, Search, CheckSquare, Square, ArrowRight, Package } from 'lucide-react';
import { supabase } from '../../supabase';

const Picking = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchPickingItems();
  }, []);

  const fetchPickingItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .eq('estado', 'PENDIENTE')
        .limit(50);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error cargando picking:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Picking</h2>
          <p className="text-slate-500 text-sm">Preparación de pedidos</p>
        </div>
        <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm">
            <Search size={18} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Escanear producto..." className="outline-none text-sm w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Pendientes */}
        <div className="lg:col-span-2 space-y-4">
            {loading ? (
                <div className="text-center py-12 text-slate-400">Cargando tareas de picking...</div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    <CheckSquare size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No hay tareas de picking pendientes</p>
                </div>
            ) : (
                items.map((item, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => toggleSelection(idx)}
                        className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all flex items-center gap-4 ${
                            selectedItems.includes(idx) ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50' : 'hover:border-indigo-300'
                        }`}
                    >
                        <div className={selectedItems.includes(idx) ? 'text-indigo-600' : 'text-slate-300'}>
                            {selectedItems.includes(idx) ? <CheckSquare size={24} /> : <Square size={24} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-slate-700">N.V: {item.nv}</span>
                                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                    {item.codigo_producto}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600">{item.descripcion_producto}</p>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-xs text-slate-400">{item.cliente}</span>
                                <span className="text-lg font-bold text-slate-800">
                                    {item.cantidad} <span className="text-xs font-normal text-slate-500">{item.unidad}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Resumen / Acción */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Hand size={20} className="text-indigo-600" />
                Acciones
            </h3>
            
            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Seleccionados:</span>
                    <span className="font-bold">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Unidades:</span>
                    <span className="font-bold">
                        {selectedItems.reduce((acc, idx) => acc + (items[idx]?.cantidad || 0), 0)}
                    </span>
                </div>
            </div>

            <button 
                disabled={selectedItems.length === 0}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
                Confirmar Picking
                <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Picking;
