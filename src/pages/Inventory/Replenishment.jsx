import React, { useState, useEffect } from 'react';
import { 
  ArrowDownToLine, RefreshCw, Filter, Layers, 
  ArrowRight, CheckCircle, AlertTriangle, Package,
  MapPin, Truck, History
} from 'lucide-react';
import { supabase } from '../../supabase';
import { InventoryService } from '../../services/inventoryService'; // NUEVO
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const Replenishment = () => {
  const [activeTab, setActiveTab] = useState('needs'); // needs | tasks
  const [needs, setNeeds] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'needs') fetchNeeds();
    else fetchTasks();
  }, [activeTab]);

  const fetchNeeds = async () => {
    setLoading(true);
    try {
      // Simulación: En producción esto sería una Vista Materializada en Supabase
      // SELECT * FROM v_replenishment_needs WHERE stock_picking < min_stock
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockNeeds = [
        { id: 'SKU-1001', producto: 'Paracetamol 500mg', zona: 'Picking A', stock_actual: 5, min: 20, max: 100, sugerido: 95 },
        { id: 'SKU-2045', producto: 'Ibuprofeno Jarabe', zona: 'Picking B', stock_actual: 2, min: 15, max: 60, sugerido: 58 },
        { id: 'SKU-3099', producto: 'Vendas Elásticas', zona: 'Picking A', stock_actual: 0, min: 10, max: 50, sugerido: 50 },
      ];
      setNeeds(mockNeeds);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockTasks = [
        { id: 'REP-001', sku: 'SKU-1001', producto: 'Paracetamol 500mg', origen: 'RES-05-A', destino: 'PICK-01-02', cantidad: 95, estado: 'PENDIENTE', operario: null },
        { id: 'REP-002', sku: 'SKU-5500', producto: 'Amoxicilina 500mg', origen: 'RES-02-B', destino: 'PICK-03-01', cantidad: 200, estado: 'EN_PROCESO', operario: 'Juan Perez' },
      ];
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  const generateTask = async (need) => {
    setLoading(true);
    try {
      // Simular lógica de asignación de ubicación de reserva (FEFO)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTask = {
        id: `REP-${Math.floor(Math.random() * 1000)}`,
        sku: need.id,
        producto: need.producto,
        origen: 'RES-XX-Y (Automático)',
        destino: `${need.zona}-XX`,
        cantidad: need.sugerido,
        estado: 'PENDIENTE',
        operario: null
      };

      setTasks(prev => [newTask, ...prev]);
      setNeeds(prev => prev.filter(n => n.id !== need.id));
      alert(`Tarea de reabastecimiento generada para ${need.producto}`);
      setActiveTab('tasks');
    } finally {
      setLoading(false);
    }
  };

  const confirmTask = async (task) => {
    if (confirm('¿Confirmar movimiento físico completado?')) {
      setLoading(true);
      try {
        // Usar servicio transaccional para mover el stock
        const result = await InventoryService.moveStock({
            sku: task.sku,
            batch: 'BATCH-DEFAULT', // En un caso real vendría de la tarea
            fromLoc: task.origen,
            toLoc: task.destino,
            qty: task.cantidad,
            userId: 'user-uuid', // Debería venir de auth context
            reason: 'REPLENISHMENT'
        });

        if (result.success) {
            setTasks(prev => prev.filter(t => t.id !== task.id));
            alert('✅ Stock actualizado correctamente en ubicación de picking.');
        } else {
            alert('❌ Error al mover stock: ' + result.message);
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200">
              <Layers size={24} />
            </div>
            REABASTECIMIENTO
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Reposición de zonas de picking desde reserva (Min/Max)</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('needs')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'needs' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle size={16} /> Necesidades
            {needs.length > 0 && <span className="bg-white text-amber-600 px-1.5 rounded-full text-[10px]">{needs.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tasks' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Truck size={16} /> Tareas Activas
            {tasks.length > 0 && <span className="bg-white text-slate-800 px-1.5 rounded-full text-[10px]">{tasks.length}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'needs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
          {needs.map(need => (
            <div key={need.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package size={64} className="text-amber-500" />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{need.id}</span>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100 flex items-center gap-1">
                    <ArrowDownToLine size={12} /> CRÍTICO
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 mb-1">{need.producto}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-6">
                  <MapPin size={14} /> {need.zona}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Actual</span>
                    <span className="block text-xl font-black text-red-600">{need.stock_actual}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Mínimo</span>
                    <span className="block text-xl font-black text-slate-700">{need.min}</span>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                    <span className="block text-[10px] font-bold text-amber-600 uppercase">Reponer</span>
                    <span className="block text-xl font-black text-amber-600">+{need.sugerido}</span>
                  </div>
                </div>

                <button 
                  onClick={() => generateTask(need)}
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw size={18} />}
                  GENERAR TAREA
                </button>
              </div>
            </div>
          ))}
          
          {needs.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Todo en orden</h3>
              <p className="text-slate-500 text-sm">No hay zonas de picking con stock crítico.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">ID Tarea</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Origen (Reserva)</th>
                  <th className="px-6 py-4">Destino (Picking)</th>
                  <th className="px-6 py-4">Cantidad</th>
                  <th className="px-6 py-4">Operario</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{task.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{task.producto}</div>
                      <div className="text-xs text-slate-500 font-mono">{task.sku}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">{task.origen}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{task.destino}</td>
                    <td className="px-6 py-4 font-black text-lg">{task.cantidad}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                      {task.operario || <span className="text-amber-500">Sin Asignar</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => confirmTask(task)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-2 mx-auto"
                      >
                        <CheckCircle size={14} /> CONFIRMAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Replenishment;
