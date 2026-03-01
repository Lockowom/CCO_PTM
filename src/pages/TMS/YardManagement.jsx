import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Clock, CheckCircle, 
  AlertTriangle, Calendar, ArrowRight,
  Layout, GripHorizontal, Anchor, Timer
} from 'lucide-react';
import { supabase } from '../../supabase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import gsap from 'gsap';

const YardManagement = () => {
  const [docks, setDocks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTruck, setDraggedTruck] = useState(null);

  // Simulación de configuración de andenes
  const DOCK_CONFIG = Array.from({ length: 8 }, (_, i) => ({
    id: `DOCK-${i + 1}`,
    label: `Andén ${i + 1}`,
    type: i < 4 ? 'INBOUND' : 'OUTBOUND', // Primeros 4 Inbound, resto Outbound
    status: 'AVAILABLE' // AVAILABLE, OCCUPIED, MAINTENANCE
  }));

  useEffect(() => {
    fetchYardData();
    
    // Realtime subscription simulation
    const interval = setInterval(fetchYardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchYardData = async () => {
    // En un caso real, esto vendría de una tabla 'tms_yard_status' y 'tms_viajes'
    // Aquí simularemos el estado mezclando config estática con datos dinámicos
    setLoading(true);
    try {
      // 1. Obtener camiones en patio (Simulado)
      const mockQueue = [
        { id: 'TRK-001', patente: 'AB-12-34', chofer: 'Juan Perez', tipo: 'INBOUND', hora_llegada: new Date(Date.now() - 45*60000).toISOString(), proveedor: 'DHL' },
        { id: 'TRK-002', patente: 'CD-56-78', chofer: 'Pedro Soto', tipo: 'OUTBOUND', hora_llegada: new Date(Date.now() - 15*60000).toISOString(), destino: 'Norte' },
        { id: 'TRK-003', patente: 'EF-90-12', chofer: 'Luis Diaz', tipo: 'INBOUND', hora_llegada: new Date(Date.now() - 5*60000).toISOString(), proveedor: 'FedEx' },
      ];
      
      // 2. Estado actual de andenes (Simulado persistence)
      const savedDocks = JSON.parse(localStorage.getItem('yard_docks_state')) || DOCK_CONFIG;
      
      setQueue(mockQueue);
      setDocks(savedDocks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDockAction = (dockId, action, truck = null) => {
    const newDocks = docks.map(dock => {
      if (dock.id !== dockId) return dock;
      
      if (action === 'ASSIGN' && truck) {
        return { ...dock, status: 'OCCUPIED', truck };
      }
      if (action === 'RELEASE') {
        return { ...dock, status: 'AVAILABLE', truck: null };
      }
      if (action === 'MAINTENANCE') {
        return { ...dock, status: dock.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE', truck: null };
      }
      return dock;
    });

    setDocks(newDocks);
    localStorage.setItem('yard_docks_state', JSON.stringify(newDocks));
    
    // Si asignamos, quitar de la cola
    if (action === 'ASSIGN' && truck) {
      setQueue(prev => prev.filter(t => t.id !== truck.id));
      gsap.fromTo(`#dock-${dockId}`, { scale: 1.1 }, { scale: 1, duration: 0.3 });
    }
  };

  const getDockColor = (status, type) => {
    if (status === 'MAINTENANCE') return 'bg-slate-100 border-slate-300 text-slate-400';
    if (status === 'OCCUPIED') return 'bg-red-50 border-red-200 text-red-800';
    return type === 'INBOUND' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-blue-50 border-blue-200 text-blue-800';
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-slate-800 text-white rounded-xl shadow-lg">
              <Anchor size={24} />
            </div>
            GESTIÓN DE PATIOS (YMS)
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Control de tráfico, asignación de andenes y tiempos de espera</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">En Espera</p>
              <p className="text-xl font-black text-slate-800 leading-none">{queue.length}</p>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Ocupación</p>
              <p className="text-xl font-black text-indigo-600 leading-none">
                {Math.round((docks.filter(d => d.status === 'OCCUPIED').length / docks.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Columna Izquierda: Cola de Espera */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Truck size={18} className="text-amber-500" />
              Cola de Llegada
            </h3>
            
            <div className="space-y-3">
              {queue.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                  No hay vehículos en espera
                </div>
              ) : (
                queue.map(truck => (
                  <div 
                    key={truck.id}
                    draggable
                    onDragStart={() => setDraggedTruck(truck)}
                    onDragEnd={() => setDraggedTruck(null)}
                    className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        truck.tipo === 'INBOUND' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {truck.tipo}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{truck.patente}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {truck.chofer.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{truck.chofer}</p>
                        <p className="text-[10px] text-slate-400 truncate w-32">{truck.proveedor || truck.destino}</p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded w-fit">
                      <Clock size={10} />
                      Espera: {formatDistanceToNow(new Date(truck.hora_llegada), { locale: es })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Visualización de Andenes */}
        <div className="xl:col-span-3">
          <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200 relative overflow-hidden min-h-[600px]">
            {/* Warehouse Background Decor */}
            <div className="absolute top-0 left-0 w-full h-8 bg-slate-300 border-b-4 border-slate-400 flex items-center justify-center opacity-50">
              <span className="text-[10px] font-black text-slate-500 tracking-[1em]">WAREHOUSE WALL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {docks.map(dock => (
                <div 
                  key={dock.id}
                  id={`dock-${dock.id}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => draggedTruck && handleDockAction(dock.id, 'ASSIGN', draggedTruck)}
                  className={`
                    relative h-64 rounded-t-lg border-x-4 border-t-4 border-b-0 flex flex-col items-center justify-between p-4 transition-all duration-300
                    ${dock.status === 'AVAILABLE' && draggedTruck ? 'ring-4 ring-indigo-400 ring-opacity-50 scale-105 bg-white' : 'bg-white'}
                    ${getDockColor(dock.status, dock.type)}
                  `}
                >
                  {/* Dock Header */}
                  <div className="w-full flex justify-between items-center border-b border-black/5 pb-2 mb-2">
                    <span className="font-black text-xl opacity-80">{dock.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{dock.type}</span>
                  </div>

                  {/* Dock Content */}
                  <div className="flex-1 w-full flex flex-col items-center justify-center relative">
                    {dock.status === 'OCCUPIED' && dock.truck ? (
                      <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in duration-300">
                        <Truck size={64} className="text-current opacity-80 mb-2" />
                        <span className="font-mono font-black text-lg bg-white/50 px-2 rounded">{dock.truck.patente}</span>
                        <span className="text-xs font-bold mt-1">{dock.truck.chofer}</span>
                        
                        <div className="mt-4 flex gap-2">
                          <button 
                            onClick={() => handleDockAction(dock.id, 'RELEASE')}
                            className="bg-white/80 hover:bg-white text-slate-800 px-3 py-1 rounded shadow-sm text-xs font-bold transition-colors"
                          >
                            Liberar
                          </button>
                        </div>
                        
                        {/* Timer simulado */}
                        <div className="absolute top-0 right-0 bg-black/10 text-current px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                          <Timer size={10} /> 00:15:00
                        </div>
                      </div>
                    ) : dock.status === 'MAINTENANCE' ? (
                      <div className="flex flex-col items-center text-slate-400">
                        <AlertTriangle size={48} className="mb-2" />
                        <span className="text-xs font-bold uppercase">Mantenimiento</span>
                        <button 
                          onClick={() => handleDockAction(dock.id, 'MAINTENANCE')}
                          className="mt-4 text-xs underline hover:text-slate-600"
                        >
                          Habilitar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-current opacity-20">
                        <ArrowRight className="rotate-90 mb-2" size={32} />
                        <span className="text-xs font-bold uppercase">Disponible</span>
                        
                        {/* Botón Mantenimiento (oculto hover) */}
                        <button 
                          onClick={() => handleDockAction(dock.id, 'MAINTENANCE')}
                          className="absolute bottom-0 text-[10px] font-bold opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
                        >
                          Bloquear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dock Floor (Visual) */}
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-yellow-400 flex">
                    {Array.from({length:10}).map((_,i) => (
                      <div key={i} className="flex-1 border-r border-black/20 transform -skew-x-12"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Yard Floor Markings */}
            <div className="mt-12 flex justify-around px-8 opacity-20 pointer-events-none">
               <div className="h-32 w-2 bg-white border-x border-slate-400 dashed"></div>
               <div className="h-32 w-2 bg-white border-x border-slate-400 dashed"></div>
               <div className="h-32 w-2 bg-white border-x border-slate-400 dashed"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default YardManagement;
