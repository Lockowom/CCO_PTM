import React, { useState, useRef } from 'react';
import { 
  ArrowDownToLine, RefreshCw, Filter, Layers, 
  ArrowRight, CheckCircle, AlertTriangle, Package,
  MapPin, Truck, History
} from 'lucide-react';
import { supabase } from '../../supabase';
import { InventoryService, useMoveStock } from '../../services/inventoryService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Mocks para simular BD
const fetchNeedsData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { id: 'SKU-1001', producto: 'Paracetamol 500mg', zona: 'Picking A', stock_actual: 5, min: 20, max: 100, sugerido: 95 },
    { id: 'SKU-2045', producto: 'Ibuprofeno Jarabe', zona: 'Picking B', stock_actual: 2, min: 15, max: 60, sugerido: 58 },
    { id: 'SKU-3099', producto: 'Vendas Elásticas', zona: 'Picking A', stock_actual: 0, min: 10, max: 50, sugerido: 50 },
  ];
};

const fetchTasksData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { id: 'REP-001', sku: 'SKU-1001', producto: 'Paracetamol 500mg', origen: 'RES-05-A', destino: 'PICK-01-02', cantidad: 95, estado: 'PENDIENTE', operario: null },
    { id: 'REP-002', sku: 'SKU-5500', producto: 'Amoxicilina 500mg', origen: 'RES-02-B', destino: 'PICK-03-01', cantidad: 200, estado: 'EN_PROCESO', operario: 'Juan Perez' },
  ];
};

const Replenishment = () => {
  const [activeTab, setActiveTab] = useState('needs'); // needs | tasks
  const queryClient = useQueryClient();
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

  const { data: needs = [], isLoading: loadingNeeds } = useQuery({
    queryKey: ['replenishmentNeeds'],
    queryFn: fetchNeedsData,
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['replenishmentTasks'],
    queryFn: fetchTasksData,
  });

  // Mutación para generar tarea
  const generateTaskMutation = useMutation({
    mutationFn: async (need) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: `REP-${Math.floor(Math.random() * 1000)}`,
        sku: need.id,
        producto: need.producto,
        origen: 'RES-XX-Y (Automático)',
        destino: `${need.zona}-XX`,
        cantidad: need.sugerido,
        estado: 'PENDIENTE',
        operario: null
      };
    },
    onSuccess: (newTask, need) => {
      queryClient.setQueryData(['replenishmentTasks'], old => [newTask, ...(old || [])]);
      queryClient.setQueryData(['replenishmentNeeds'], old => (old || []).filter(n => n.id !== need.id));
      toast.success(`Tarea generada para ${need.producto}`);
      setActiveTab('tasks');
    }
  });

  // Mutación para confirmar tarea (usando nuestro hook transaccional)
  const confirmTaskMutation = useMoveStock();

  const handleConfirmTask = async (task) => {
    if (confirm('¿Confirmar movimiento físico completado?')) {
      confirmTaskMutation.mutate({
        sku: task.sku,
        batch: 'BATCH-DEFAULT',
        fromLoc: task.origen,
        toLoc: task.destino,
        qty: task.cantidad,
        userId: 'user-uuid', // Debería venir de auth context
        reason: 'REPLENISHMENT'
      }, {
        onSuccess: (data) => {
          if(data.success) {
            queryClient.setQueryData(['replenishmentTasks'], old => (old || []).filter(t => t.id !== task.id));
            toast.success('Stock actualizado correctamente en ubicación de picking.');
          } else {
            toast.error('Error al mover stock: ' + data.message);
          }
        }
      });
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 pb-20 min-h-screen bg-wms-dark p-6">
      {/* Header Glassmorphism */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-wms-border pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-wms-alert/20 text-wms-alert border border-wms-alert/50 rounded-xl shadow-neon-orange">
              <Layers size={24} />
            </div>
            REABASTECIMIENTO
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium ml-1">Reposición de zonas de picking desde reserva (Min/Max)</p>
        </div>
        
        <div className="flex bg-wms-dark/80 p-1 rounded-xl border border-wms-border shadow-inner">
          <button 
            onClick={() => setActiveTab('needs')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'needs' ? 'bg-wms-alert/20 text-wms-alert border border-wms-alert/50 shadow-neon-orange' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle size={16} /> Necesidades
            {needs.length > 0 && <span className="bg-wms-alert text-wms-dark px-1.5 rounded-full text-[10px]">{needs.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tasks' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck size={16} /> Tareas Activas
            {tasks.length > 0 && <span className="bg-indigo-500 text-white px-1.5 rounded-full text-[10px]">{tasks.length}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'needs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingNeeds ? (
            <div className="col-span-full flex justify-center py-20">
              <RefreshCw className="animate-spin text-wms-alert" size={32} />
            </div>
          ) : needs.map(need => (
            <div key={need.id} className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-2xl p-6 hover:border-wms-alert/50 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-wms-alert group-hover:opacity-10 transition-opacity">
                <Package size={64} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-wms-dark/80 border border-slate-700 px-2 py-1 rounded">{need.id}</span>
                  <span className="text-xs font-bold text-wms-danger bg-wms-danger/10 px-2 py-1 rounded-full border border-wms-danger/30 flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <ArrowDownToLine size={12} /> CRÍTICO
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-white mb-1">{need.producto}</h3>
                <p className="text-sm text-slate-400 flex items-center gap-1 mb-6">
                  <MapPin size={14} className="text-wms-alert" /> {need.zona}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                  <div className="bg-wms-dark/60 rounded-lg p-2 border border-slate-700/50">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Actual</span>
                    <span className="block text-xl font-black text-wms-danger">{need.stock_actual}</span>
                  </div>
                  <div className="bg-wms-dark/60 rounded-lg p-2 border border-slate-700/50">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Mínimo</span>
                    <span className="block text-xl font-black text-slate-300">{need.min}</span>
                  </div>
                  <div className="bg-wms-alert/10 rounded-lg p-2 border border-wms-alert/30">
                    <span className="block text-[10px] font-bold text-wms-alert uppercase">Reponer</span>
                    <span className="block text-xl font-black text-wms-alert">+{need.sugerido}</span>
                  </div>
                </div>

                <button 
                  onClick={() => generateTaskMutation.mutate(need)}
                  disabled={generateTaskMutation.isPending}
                  className="w-full py-3 bg-wms-alert/90 hover:bg-wms-alert text-wms-dark font-black rounded-xl shadow-neon-orange transition-all flex items-center justify-center gap-2"
                >
                  {generateTaskMutation.isPending ? <RefreshCw className="animate-spin" /> : <RefreshCw size={18} />}
                  GENERAR TAREA
                </button>
              </div>
            </div>
          ))}
          
          {needs.length === 0 && !loadingNeeds && (
            <div className="col-span-full text-center py-20 bg-wms-panel/50 backdrop-blur-xl rounded-2xl border border-dashed border-wms-border">
              <CheckCircle size={48} className="mx-auto text-wms-neon mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-white">Todo en orden</h3>
              <p className="text-slate-400 text-sm">No hay zonas de picking con stock crítico.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-wms-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-wms-dark/80 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-wms-border">
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
              <tbody className="divide-y divide-wms-border/50">
                {loadingTasks ? (
                  <tr><td colSpan="7" className="p-8 text-center"><RefreshCw className="animate-spin text-indigo-400 mx-auto" /></td></tr>
                ) : tasks.map(task => (
                  <tr key={task.id} className="hover:bg-wms-dark/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">{task.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{task.producto}</div>
                      <div className="text-xs text-slate-400 font-mono">{task.sku}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300 bg-wms-dark/30">{task.origen}</td>
                    <td className="px-6 py-4 font-mono font-bold text-wms-neon bg-wms-dark/30">{task.destino}</td>
                    <td className="px-6 py-4 font-black text-lg text-white">{task.cantidad}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                      {task.operario || <span className="text-wms-alert bg-wms-alert/10 px-2 py-1 rounded border border-wms-alert/30">Sin Asignar</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleConfirmTask(task)}
                        disabled={confirmTaskMutation.isPending}
                        className="bg-wms-neon/20 hover:bg-wms-neon text-wms-neon hover:text-wms-dark border border-wms-neon px-4 py-2 rounded-lg text-xs font-bold shadow-neon-green transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                      >
                        {confirmTaskMutation.isPending ? <RefreshCw className="animate-spin" size={14}/> : <CheckCircle size={14} />} CONFIRMAR
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
