import React, { useState, useRef } from 'react';
import { 
  ClipboardList, Search, Play, CheckCircle, AlertTriangle, 
  RotateCcw, Save, BarChart3, MapPin, ScanBarcode, Box,
  ArrowRight, XCircle, Loader2, Calendar
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';

// Función para obtener las tareas de conteo cíclico
const fetchCycleTasks = async () => {
  // Simulando llamada a base de datos (puedes reemplazarlo por tu tabla real de conteos cíclicos)
  return [
    { id: 'CNT-2024-001', zona: 'A (Pasillos 1-3)', estado: 'PENDIENTE', items: 150, prioridad: 'ALTA', fecha: '2024-03-01' },
    { id: 'CNT-2024-002', zona: 'B (Refrigerado)', estado: 'EN_PROCESO', items: 45, prioridad: 'MEDIA', fecha: '2024-03-01' },
    { id: 'CNT-2024-003', zona: 'C (Granel)', estado: 'COMPLETADO', items: 300, prioridad: 'BAJA', fecha: '2024-02-28' },
  ];
};

const CycleCount = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | tasks | execution
  const queryClient = useQueryClient();
  
  // Execution State
  const [activeTask, setActiveTask] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  
  // Stats (Mocked for now, can be connected to TanStack Query later)
  const stats = {
    accuracy: 98.5,
    pending: 12,
    completed: 45,
    discrepancies: 3
  };

  const containerRef = useRef(null);

  // TanStack Query: Caché de tareas
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['cycleTasks'],
    queryFn: fetchCycleTasks,
    staleTime: 1000 * 60 * 5,
  });

  useGSAP(() => {
    gsap.from(containerRef.current, { 
      opacity: 0, 
      y: 20, 
      duration: 0.5,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const startTask = (task) => {
    setActiveTask(task);
    setActiveTab('execution');
    setScannedItems([]);
    setCurrentLocation('');
  };

  const handleScan = (e) => {
    e.preventDefault();
    const codigo = e.target.codigo.value.toUpperCase();
    const cantidad = parseFloat(e.target.cantidad.value);
    
    if (!codigo || !cantidad) return;

    const newItem = {
      id: Date.now(),
      codigo,
      cantidad,
      ubicacion: currentLocation,
      timestamp: new Date().toLocaleTimeString()
    };

    setScannedItems([newItem, ...scannedItems]);
    e.target.reset();
    e.target.codigo.focus();

    // Animación GSAP para el nuevo item escaneado
    gsap.fromTo(".scanned-item-new", 
      { x: -20, opacity: 0, backgroundColor: "rgba(16, 185, 129, 0.2)" }, 
      { x: 0, opacity: 1, backgroundColor: "transparent", duration: 0.5, clearProps: "backgroundColor" }
    );
  };

  const finishTask = () => {
    if (confirm('¿Finalizar conteo y generar reporte de discrepancias?')) {
      toast.success('Conteo finalizado', { description: 'Las discrepancias han sido enviadas a aprobación.' });
      setActiveTask(null);
      setActiveTab('dashboard');
    }
  };

  // ==================== VISTAS ====================

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<BarChart3 />} label="Exactitud Inventario" value={`${stats.accuracy}%`} color="text-wms-neon" bg="bg-wms-neon/20 border-wms-neon/30" />
        <StatCard icon={<ClipboardList />} label="Conteos Pendientes" value={stats.pending} color="text-wms-alert" bg="bg-wms-alert/20 border-wms-alert/30" />
        <StatCard icon={<CheckCircle />} label="Items Contados Hoy" value={stats.completed} color="text-blue-400" bg="bg-blue-500/20 border-blue-500/30" />
        <StatCard icon={<AlertTriangle />} label="Discrepancias" value={stats.discrepancies} color="text-wms-danger" bg="bg-wms-danger/20 border-wms-danger/30" />
      </div>

      {/* Active Tasks Glassmorphism */}
      <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="p-6 border-b border-wms-border flex justify-between items-center relative z-10">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <RotateCcw className="text-indigo-400" /> Tareas de Conteo Activas
          </h3>
          <button 
            onClick={() => setActiveTab('tasks')}
            className="text-sm font-bold text-indigo-400 hover:bg-indigo-500/20 px-3 py-1 rounded-lg transition-colors"
          >
            Ver Todo
          </button>
        </div>
        <div className="divide-y divide-wms-border/50 relative z-10">
          {isLoadingTasks ? (
             <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
               <Loader2 className="animate-spin text-wms-neon" /> Cargando tareas...
             </div>
          ) : tasks.map(task => (
            <div key={task.id} className="p-4 hover:bg-wms-dark/60 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border ${
                  task.estado === 'PENDIENTE' ? 'bg-wms-alert/20 text-wms-alert border-wms-alert/50' :
                  task.estado === 'EN_PROCESO' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                  'bg-wms-neon/20 text-wms-neon border-wms-neon/50'
                }`}>
                  {task.estado === 'PENDIENTE' ? 'P' : task.estado === 'EN_PROCESO' ? 'E' : 'C'}
                </div>
                <div>
                  <h4 className="font-bold text-white">{task.zona}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="font-mono text-indigo-300">{task.id}</span> • {task.items} Items • {task.fecha}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => startTask(task)}
                className="opacity-0 group-hover:opacity-100 bg-indigo-600/80 border border-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all transform translate-x-4 group-hover:translate-x-0 shadow-[0_0_10px_rgba(79,70,229,0.4)] hover:bg-indigo-500"
              >
                {task.estado === 'EN_PROCESO' ? 'CONTINUAR' : 'INICIAR'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExecution = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel Izquierdo: Control */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-wms-panel/90 backdrop-blur-xl border border-wms-border text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-400">
            <ScanBarcode size={120} />
          </div>
          
          <div className="relative z-10">
            <button onClick={() => setActiveTab('dashboard')} className="mb-4 text-slate-400 hover:text-wms-neon transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <ArrowRight className="rotate-180" size={14} /> Volver al Dashboard
            </button>
            
            <h2 className="text-2xl font-black mb-1 text-white">{activeTask?.zona}</h2>
            <p className="text-indigo-400 text-sm mb-6 font-mono">{activeTask?.id}</p>

            {!currentLocation ? (
              <div className="bg-wms-dark/80 backdrop-blur-md p-4 rounded-xl border border-wms-border shadow-inner">
                <label className="block text-xs font-bold text-wms-neon uppercase mb-2">
                  <MapPin size={14} className="inline mr-1" /> Escanear Ubicación
                </label>
                <input 
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentLocation(e.target.value.toUpperCase());
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono text-lg font-bold text-center uppercase focus:ring-1 focus:ring-wms-neon focus:border-wms-neon outline-none"
                  placeholder="Escanear Pasillo/Rack..."
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-wms-neon/10 p-3 rounded-lg border border-wms-neon/30">
                  <span className="font-bold text-wms-neon flex items-center gap-2">
                    <MapPin size={16} /> {currentLocation}
                  </span>
                  <button onClick={() => setCurrentLocation('')} className="text-xs bg-wms-dark/80 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-white font-bold transition-colors">
                    CAMBIAR
                  </button>
                </div>

                <form onSubmit={handleScan} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Producto (SKU)</label>
                    <input name="codigo" autoFocus className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-600" placeholder="Escanear..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cantidad Física</label>
                    <input name="cantidad" type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-600" placeholder="0" />
                  </div>
                  <button className="w-full bg-indigo-600/90 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 border border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all">
                    <ScanBarcode size={18} /> REGISTRAR
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={finishTask}
          className="w-full bg-wms-dark/80 border border-wms-border text-slate-300 hover:border-wms-neon hover:text-wms-neon py-4 rounded-xl font-black text-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={24} /> FINALIZAR CONTEO
        </button>
      </div>

      {/* Panel Derecho: Lista Escaneada */}
      <div className="lg:col-span-2 bg-wms-panel/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-wms-border flex flex-col h-[600px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-wms-neon/5 rounded-full blur-3xl"></div>
        <div className="p-6 border-b border-wms-border flex justify-between items-center bg-wms-dark/40 relative z-10">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Box className="text-indigo-400" /> Items Contados
          </h3>
          <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold">
            {scannedItems.length} Registros
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
          {scannedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
              <RotateCcw size={48} className="mb-4" />
              <p>Esperando primer escaneo...</p>
            </div>
          ) : (
            scannedItems.map((item, idx) => (
              <div key={item.id} className="scanned-item-new bg-wms-dark/60 p-3 rounded-xl border border-wms-border shadow-sm flex items-center justify-between hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                    {scannedItems.length - idx}
                  </span>
                  <div>
                    <p className="font-bold text-white font-mono">{item.codigo}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <MapPin size={10} className="text-wms-neon" /> {item.ubicacion} <span className="text-slate-600">•</span> {item.timestamp}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-black text-wms-neon bg-wms-neon/10 px-3 py-1 rounded-lg border border-wms-neon/30">
                  {item.cantidad}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-6 pb-20 min-h-screen bg-wms-dark p-6">
      {/* Header General Glassmorphism */}
      {activeTab === 'dashboard' && (
        <div className="flex justify-between items-end border-b border-wms-border pb-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/50 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                <RotateCcw size={24} />
              </div>
              INVENTARIO CÍCLICO
            </h2>
            <p className="text-slate-400 text-sm mt-1 font-medium ml-1">Auditoría continua de stock y ubicaciones</p>
          </div>
          <button className="bg-wms-panel/80 border border-wms-border text-slate-300 px-6 py-3 rounded-xl font-bold shadow-lg hover:border-indigo-500 hover:text-indigo-400 transition-all flex items-center gap-2">
            <Calendar size={18} /> PLANIFICAR NUEVO
          </button>
        </div>
      )}

      {activeTab === 'dashboard' ? renderDashboard() : renderExecution()}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="p-6 rounded-2xl border border-wms-border shadow-2xl bg-wms-panel/80 backdrop-blur-xl flex items-center gap-4 relative overflow-hidden group hover:border-slate-600 transition-colors">
    <div className={`p-3 rounded-xl border ${bg} ${color}`}>
      {icon}
    </div>
    <div className="relative z-10">
      <h4 className="text-2xl font-black text-white">{value}</h4>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

export default CycleCount;
