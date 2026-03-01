import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, Search, Play, CheckCircle, AlertTriangle, 
  RotateCcw, Save, BarChart3, MapPin, ScanBarcode, Box,
  ArrowRight, XCircle, Loader2, Calendar
} from 'lucide-react';
import { supabase } from '../../supabase';
import gsap from 'gsap';

const CycleCount = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | tasks | execution
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Execution State
  const [activeTask, setActiveTask] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [scanning, setScanning] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    accuracy: 98.5,
    pending: 12,
    completed: 45,
    discrepancies: 3
  });

  const containerRef = useRef(null);

  useEffect(() => {
    // Simular carga de tareas
    const mockTasks = [
      { id: 'CNT-2024-001', zona: 'A (Pasillos 1-3)', estado: 'PENDIENTE', items: 150, prioridad: 'ALTA', fecha: '2024-03-01' },
      { id: 'CNT-2024-002', zona: 'B (Refrigerado)', estado: 'EN_PROCESO', items: 45, prioridad: 'MEDIA', fecha: '2024-03-01' },
      { id: 'CNT-2024-003', zona: 'C (Granel)', estado: 'COMPLETADO', items: 300, prioridad: 'BAJA', fecha: '2024-02-28' },
    ];
    setTasks(mockTasks);
    
    // Animación de entrada
    gsap.from(containerRef.current, { opacity: 0, y: 20, duration: 0.5 });
  }, []);

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

    // Animación item agregado
    gsap.fromTo(".scanned-item-new", 
      { x: -20, opacity: 0, backgroundColor: "#d1fae5" }, 
      { x: 0, opacity: 1, backgroundColor: "white", duration: 0.5 }
    );
  };

  const finishTask = () => {
    if (confirm('¿Finalizar conteo y generar reporte de discrepancias?')) {
      alert('Conteo finalizado. Las discrepancias han sido enviadas a aprobación.');
      setActiveTask(null);
      setActiveTab('dashboard');
    }
  };

  // ==================== VISTAS ====================

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<BarChart3 />} label="Exactitud Inventario" value={`${stats.accuracy}%`} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={<ClipboardList />} label="Conteos Pendientes" value={stats.pending} color="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={<CheckCircle />} label="Items Contados Hoy" value={stats.completed} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={<AlertTriangle />} label="Discrepancias" value={stats.discrepancies} color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* Active Tasks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <RotateCcw className="text-indigo-500" /> Tareas de Conteo Activas
          </h3>
          <button 
            onClick={() => setActiveTab('tasks')}
            className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors"
          >
            Ver Todo
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {tasks.map(task => (
            <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                  task.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-600' :
                  task.estado === 'EN_PROCESO' ? 'bg-blue-100 text-blue-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {task.estado === 'PENDIENTE' ? 'P' : task.estado === 'EN_PROCESO' ? 'E' : 'C'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{task.zona}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-mono">{task.id}</span> • {task.items} Items • {task.fecha}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => startTask(task)}
                className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all transform translate-x-4 group-hover:translate-x-0"
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-8 fade-in duration-500">
      {/* Panel Izquierdo: Control */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ScanBarcode size={120} />
          </div>
          
          <div className="relative z-10">
            <button onClick={() => setActiveTab('dashboard')} className="mb-4 text-white/50 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <ArrowRight className="rotate-180" size={14} /> Volver al Dashboard
            </button>
            
            <h2 className="text-2xl font-black mb-1">{activeTask?.zona}</h2>
            <p className="text-white/60 text-sm mb-6 font-mono">{activeTask?.id}</p>

            {!currentLocation ? (
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 animate-pulse">
                <label className="block text-xs font-bold text-emerald-400 uppercase mb-2">
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono text-lg font-bold text-center uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Escanear Pasillo/Rack..."
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-emerald-500/20 p-3 rounded-lg border border-emerald-500/30">
                  <span className="font-bold text-emerald-400 flex items-center gap-2">
                    <MapPin size={16} /> {currentLocation}
                  </span>
                  <button onClick={() => setCurrentLocation('')} className="text-xs bg-black/20 hover:bg-black/40 px-2 py-1 rounded text-white font-bold">
                    CAMBIAR
                  </button>
                </div>

                <form onSubmit={handleScan} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Producto (SKU)</label>
                    <input name="codigo" autoFocus className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono font-bold focus:border-indigo-500 outline-none" placeholder="Escanear..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cantidad Física</label>
                    <input name="cantidad" type="number" step="0.01" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-bold focus:border-indigo-500 outline-none" placeholder="0" />
                  </div>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2">
                    <ScanBarcode size={18} /> REGISTRAR
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={finishTask}
          className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 py-4 rounded-xl font-black text-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={24} /> FINALIZAR CONTEO
        </button>
      </div>

      {/* Panel Derecho: Lista Escaneada */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Box className="text-indigo-500" /> Items Contados
          </h3>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
            {scannedItems.length} Registros
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {scannedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <RotateCcw size={48} className="mb-4" />
              <p>Esperando primer escaneo...</p>
            </div>
          ) : (
            scannedItems.map((item, idx) => (
              <div key={item.id} className="scanned-item-new bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {scannedItems.length - idx}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 font-mono">{item.codigo}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <MapPin size={10} /> {item.ubicacion} • {item.timestamp}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
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
    <div ref={containerRef} className="space-y-6 pb-20 max-w-[1600px] mx-auto">
      {/* Header General */}
      {activeTab === 'dashboard' && (
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                <RotateCcw size={24} />
              </div>
              INVENTARIO CÍCLICO
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Auditoría continua de stock y ubicaciones</p>
          </div>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2">
            <Calendar size={18} /> PLANIFICAR NUEVO
          </button>
        </div>
      )}

      {activeTab === 'dashboard' ? renderDashboard() : renderExecution()}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className={`p-6 rounded-2xl border border-slate-100 shadow-sm bg-white flex items-center gap-4`}>
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      {icon}
    </div>
    <div>
      <h4 className="text-2xl font-black text-slate-800">{value}</h4>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

export default CycleCount;
