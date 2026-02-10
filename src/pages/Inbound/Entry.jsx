import React, { useState, useEffect } from 'react';
import { DollyChart, Search, QrCode, Trash2, Save, Wifi, WifiOff, Box } from 'lucide-react';

const Entry = () => {
  const [queue, setQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  
  // Form State
  const [form, setForm] = useState({
    ubicacion: '',
    codigo: '',
    cantidad: '',
    lote: ''
  });

  // Cargar cola local al inicio
  useEffect(() => {
    const saved = localStorage.getItem('wms_entry_queue');
    if (saved) {
      setQueue(JSON.parse(saved));
    }
  }, []);

  // Guardar cola al cambiar
  useEffect(() => {
    localStorage.setItem('wms_entry_queue', JSON.stringify(queue));
  }, [queue]);

  const addToQueue = (e) => {
    e.preventDefault();
    if (!form.ubicacion || !form.codigo || !form.cantidad) return;

    const newItem = {
      id: Date.now(),
      ...form,
      timestamp: new Date().toISOString()
    };

    setQueue([...queue, newItem]);
    setForm({ ...form, codigo: '', cantidad: '' }); // Mantener ubicación para rapidez
    // Focus back to code? (Needs ref)
  };

  const removeFromQueue = (id) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    if (confirm('¿Limpiar toda la cola?')) setQueue([]);
  };

  const handleSync = () => {
    alert(`Sincronizando ${queue.length} registros... (Simulación)`);
    // Aquí llamada POST /api/entry/batch
    setQueue([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Box className="text-emerald-500" /> Ingreso de Mercancía
          </h2>
          <p className="text-slate-500 text-sm">Registro de entrada a ubicaciones</p>
        </div>
        <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full border font-medium ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
           {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
           {isOnline ? 'En línea' : 'Sin conexión'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Nuevo Registro</h3>
          <form onSubmit={addToQueue} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ubicación *</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="A-01-01"
                  value={form.ubicacion}
                  onChange={e => setForm({...form, ubicacion: e.target.value.toUpperCase()})}
                  maxLength={8}
                  required 
                />
                <button type="button" className="p-2 border rounded-lg hover:bg-slate-50 text-slate-500">
                    <QrCode size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código *</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="SKU-123"
                  value={form.codigo}
                  onChange={e => setForm({...form, codigo: e.target.value.toUpperCase()})}
                  required 
                />
                <button type="button" className="p-2 border rounded-lg hover:bg-slate-50 text-slate-500">
                    <QrCode size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cantidad *</label>
                    <input 
                        type="number" 
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="0"
                        min="1"
                        value={form.cantidad}
                        onChange={e => setForm({...form, cantidad: e.target.value})}
                        required 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lote</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Op..."
                        value={form.lote}
                        onChange={e => setForm({...form, lote: e.target.value})}
                    />
                </div>
            </div>

            <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 mt-2">
              Agregar a Cola
            </button>
          </form>
        </div>

        {/* Cola */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    Cola de Registros 
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{queue.length}</span>
                </h3>
                <button onClick={clearQueue} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                    <Trash2 size={14} /> Limpiar
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {queue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Box size={48} className="mb-2 opacity-20" />
                        <p>Cola vacía</p>
                    </div>
                ) : (
                    queue.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                {index + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase">Ubicación</p>
                                    <p className="font-mono font-bold text-slate-700">{item.ubicacion}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase">Código</p>
                                    <p className="font-mono font-medium text-emerald-600">{item.codigo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase">Cantidad</p>
                                    <p className="font-bold text-slate-800">x{item.cantidad}</p>
                                </div>
                            </div>
                            <button onClick={() => removeFromQueue(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-slate-100">
                <button 
                    onClick={handleSync}
                    disabled={queue.length === 0}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex items-center justify-center gap-2"
                >
                    <Save size={18} /> Guardar Todo ({queue.length})
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Entry;
