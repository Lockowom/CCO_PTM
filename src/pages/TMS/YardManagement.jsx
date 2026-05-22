import React, { useState, useRef } from 'react';
import { 
  Truck, MapPin, Clock, CheckCircle, 
  AlertTriangle, Calendar, ArrowRight,
  Layout, GripHorizontal, Anchor, Timer
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { toast } from 'sonner';

const DOCK_CONFIG = Array.from({ length: 8 }, (_, i) => ({
  id: `DOCK-${i + 1}`,
  label: `Andén ${i + 1}`,
  type: i < 4 ? 'INBOUND' : 'OUTBOUND',
  status: 'AVAILABLE'
}));

const INITIAL_QUEUE = [
  { id: 'TRK-001', patente: 'AB-12-34', chofer: 'Juan Perez', tipo: 'INBOUND', hora_llegada: new Date(Date.now() - 45*60000).toISOString(), proveedor: 'DHL' },
  { id: 'TRK-002', patente: 'CD-56-78', chofer: 'Pedro Soto', tipo: 'OUTBOUND', hora_llegada: new Date(Date.now() - 15*60000).toISOString(), destino: 'Norte' },
  { id: 'TRK-003', patente: 'EF-90-12', chofer: 'Luis Diaz', tipo: 'INBOUND', hora_llegada: new Date(Date.now() - 5*60000).toISOString(), proveedor: 'FedEx' },
];

const YardManagement = () => {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const [draggedTruck, setDraggedTruck] = useState(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  // Simulating fetching docks
  const { data: docks = [], isLoading: loadingDocks } = useQuery({
    queryKey: ['yard_docks'],
    queryFn: async () => {
      const saved = localStorage.getItem('yard_docks_state');
      return saved ? JSON.parse(saved) : DOCK_CONFIG;
    }
  });

  // Simulating fetching queue
  const { data: queue = [], isLoading: loadingQueue } = useQuery({
    queryKey: ['yard_queue'],
    queryFn: async () => {
      const saved = localStorage.getItem('yard_queue_state');
      return saved ? JSON.parse(saved) : INITIAL_QUEUE;
    }
  });

  const dockMutation = useMutation({
    mutationFn: async ({ dockId, action, truck }) => {
      const newDocks = docks.map(dock => {
        if (dock.id !== dockId) return dock;
        if (action === 'ASSIGN' && truck) return { ...dock, status: 'OCCUPIED', truck };
        if (action === 'RELEASE') return { ...dock, status: 'AVAILABLE', truck: null };
        if (action === 'MAINTENANCE') return { ...dock, status: dock.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE', truck: null };
        return dock;
      });

      let newQueue = [...queue];
      if (action === 'ASSIGN' && truck) {
        newQueue = queue.filter(t => t.id !== truck.id);
      } else if (action === 'RELEASE' && truck) {
        // En un caso real, iría a historial, aquí simplemente desaparece o se puede añadir
      }

      localStorage.setItem('yard_docks_state', JSON.stringify(newDocks));
      localStorage.setItem('yard_queue_state', JSON.stringify(newQueue));
      return { newDocks, newQueue, action };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['yard_docks'], data.newDocks);
      queryClient.setQueryData(['yard_queue'], data.newQueue);
      
      if (data.action === 'ASSIGN') {
        toast.success('Camión asignado exitosamente', { style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }});
        gsap.fromTo(`#dock-${variables.dockId}`, { scale: 1.05 }, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
      }
    }
  });

  const handleDockAction = (dockId, action, truck = null) => {
    dockMutation.mutate({ dockId, action, truck });
  };

  const getDockColor = (status, type) => {
    if (status === 'MAINTENANCE') return 'bg-slate-50 border-wms-alert text-wms-alert/50';
    if (status === 'OCCUPIED') return 'bg-wms-danger/10 border-wms-danger text-wms-danger';
    return type === 'INBOUND' ? 'bg-wms-neon/10 border-wms-neon text-wms-neon' : 'bg-blue-500/10 border-blue-400 text-blue-400';
  };

  if (loadingDocks || loadingQueue) return <div className="p-8 text-center text-wms-neon animate-pulse">Cargando Patio...</div>;

  return (
    <div ref={containerRef} className="space-y-6 pb-20 bg-slate-50 text-slate-700 min-h-[calc(100vh-80px)] p-6">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-wms-neon/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-4 gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-wms-neon/10 border border-wms-neon/30 text-wms-neon rounded-xl shadow-neon-green">
              <Anchor size={24} />
            </div>
            GESTIÓN DE PATIOS <span className="text-wms-neon">(YMS)</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Control de tráfico, asignación de andenes y tiempos de espera</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white backdrop-blur-xl px-6 py-3 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">En Espera</p>
              <p className="text-2xl font-black text-wms-alert leading-none">{queue.length}</p>
            </div>
            <div className="h-10 w-px bg-wms-border"></div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ocupación</p>
              <p className="text-2xl font-black text-wms-neon leading-none">
                {Math.round((docks.filter(d => d.status === 'OCCUPIED').length / docks.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 relative z-10">
        
        {/* Columna Izquierda: Cola de Espera */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Truck size={18} className="text-wms-alert" />
              Cola de Llegada
            </h3>
            
            <div className="space-y-3">
              {queue.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  No hay vehículos en espera
                </div>
              ) : (
                queue.map(truck => (
                  <div 
                    key={truck.id}
                    draggable
                    onDragStart={() => setDraggedTruck(truck)}
                    onDragEnd={() => setDraggedTruck(null)}
                    className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:border-wms-alert/50 cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        truck.tipo === 'INBOUND' ? 'bg-wms-neon/10 text-wms-neon border-wms-neon/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {truck.tipo}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{truck.patente}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {truck.chofer.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200 leading-tight">{truck.chofer}</p>
                        <p className="text-[10px] text-slate-500 truncate w-32">{truck.proveedor || truck.destino}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-wms-alert font-bold bg-wms-alert/10 border border-wms-alert/20 px-2 py-1 rounded w-fit">
                      <Clock size={12} />
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
          <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-200 relative overflow-hidden min-h-[600px] shadow-inner">
            {/* Warehouse Background Decor */}
            <div className="absolute top-0 left-0 w-full h-8 bg-white border-b-4 border-slate-200 flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-600 tracking-[1em]">WAREHOUSE WALL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {docks.map(dock => (
                <div 
                  key={dock.id}
                  id={`dock-${dock.id}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => draggedTruck && handleDockAction(dock.id, 'ASSIGN', draggedTruck)}
                  className={`
                    relative h-64 rounded-t-2xl border-x-4 border-t-4 border-b-0 flex flex-col items-center justify-between p-4 transition-all duration-300 group
                    ${dock.status === 'AVAILABLE' && draggedTruck ? 'ring-4 ring-wms-neon/50 bg-white' : 'bg-white'}
                    ${getDockColor(dock.status, dock.type)}
                  `}
                >
                  {/* Dock Header */}
                  <div className="w-full flex justify-between items-center border-b border-slate-300/50 pb-2 mb-2">
                    <span className="font-black text-xl text-slate-900">{dock.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{dock.type}</span>
                  </div>

                  {/* Dock Content */}
                  <div className="flex-1 w-full flex flex-col items-center justify-center relative">
                    {dock.status === 'OCCUPIED' && dock.truck ? (
                      <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in duration-300">
                        <Truck size={64} className="text-current drop-shadow-lg mb-2" />
                        <span className="font-mono font-black text-lg bg-slate-50 px-3 py-1 rounded-lg border border-current">{dock.truck.patente}</span>
                        <span className="text-xs font-bold mt-2 text-slate-700">{dock.truck.chofer}</span>
                        
                        <div className="mt-4 flex gap-2">
                          <button 
                            onClick={() => handleDockAction(dock.id, 'RELEASE', dock.truck)}
                            className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-600 px-4 py-1.5 rounded-lg shadow-sm text-xs font-bold transition-colors"
                          >
                            Liberar
                          </button>
                        </div>
                        
                        {/* Timer simulado */}
                        <div className="absolute top-0 right-0 bg-slate-50/80 text-current border border-current/20 px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 backdrop-blur-sm">
                          <Timer size={10} /> 00:15:00
                        </div>
                      </div>
                    ) : dock.status === 'MAINTENANCE' ? (
                      <div className="flex flex-col items-center text-wms-alert">
                        <AlertTriangle size={48} className="mb-2 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                        <span className="text-xs font-bold uppercase">Mantenimiento</span>
                        <button 
                          onClick={() => handleDockAction(dock.id, 'MAINTENANCE')}
                          className="mt-4 text-xs font-bold underline hover:text-wms-alert/80"
                        >
                          Habilitar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-current opacity-40 group-hover:opacity-60 transition-opacity">
                        <ArrowRight className="rotate-90 mb-2" size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest">Disponible</span>
                        
                        <button 
                          onClick={() => handleDockAction(dock.id, 'MAINTENANCE')}
                          className="absolute bottom-0 text-[10px] font-bold opacity-0 group-hover:opacity-100 hover:text-slate-900 transition-opacity bg-white px-2 py-1 rounded-md"
                        >
                          Bloquear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dock Floor (Visual) */}
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-yellow-500/80 flex">
                    {Array.from({length:10}).map((_,i) => (
                      <div key={i} className="flex-1 border-r border-black/40 transform -skew-x-12"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Yard Floor Markings */}
            <div className="mt-12 flex justify-around px-8 opacity-20 pointer-events-none">
               <div className="h-32 w-2 bg-wms-neon border-x border-wms-neon dashed shadow-neon-green"></div>
               <div className="h-32 w-2 bg-wms-neon border-x border-wms-neon dashed shadow-neon-green"></div>
               <div className="h-32 w-2 bg-wms-neon border-x border-wms-neon dashed shadow-neon-green"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default YardManagement;
