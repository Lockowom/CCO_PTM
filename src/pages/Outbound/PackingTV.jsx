import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../supabase';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Box,
  Truck,
  Timer,
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';

// Componente para el Temporizador en Tiempo Real
const ElapsedTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('');
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      if (!startTime) return;
      const start = new Date(startTime).getTime();
      if (isNaN(start)) return;
      
      const now = new Date().getTime();
      const diff = now - start;

      if (diff < 0) {
         setElapsed("00:00");
         return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      setIsLate(minutes >= 15); // Alerta visual si pasa de 15 minutos
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-bold text-lg border ${
      isLate 
        ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' 
        : 'bg-indigo-50 text-indigo-600 border-indigo-100'
    }`}>
      <Timer size={18} className={isLate ? 'text-red-500' : 'text-indigo-500'} />
      {elapsed}
    </div>
  );
};

const PackingTV = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const containerRef = useRef(null);

  // Actualizar reloj
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Animación de entrada
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".anim-column", {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out"
        });
        
        gsap.from(".anim-card", {
          scale: 0.9,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "back.out(1.2)",
          delay: 0.5
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const fetchData = async () => {
    try {
      // 1. Fetch Packing Pendiente y En Proceso
      const { data: packingData, error: packingError } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .in('estado', ['PACKING', 'QUIEBRE_STOCK']);

      if (packingError) throw packingError;

      // 2. Fetch Listos (Últimos 50)
      const { data: finishedData, error: finishedError } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .eq('estado', 'LISTO_DESPACHO')
        .order('updated_at', { ascending: false }) // Ordenar por fecha de actualización
        .limit(20);

      if (finishedError) throw finishedError;

      const allData = [...(packingData || []), ...(finishedData || [])];
      setData(allData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error cargando datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('packing_tv_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const { pendientes, enProceso, listos, stats } = useMemo(() => {
    const grouped = {};
    
    data.forEach(item => {
      if (!grouped[item.nv]) {
        grouped[item.nv] = {
          ...item,
          items: [],
          total_items: 0,
          total_cantidad: 0,
          has_partial: false,
          has_stock_break: false,
          // Usamos updated_at como inicio si está en packing. 
          // Idealmente deberíamos tener un campo 'packing_start_at', pero usaremos updated_at como proxy
          start_time: item.updated_at 
        };
      }
      grouped[item.nv].items.push(item);
      grouped[item.nv].total_items++;
      grouped[item.nv].total_cantidad += parseInt(item.cantidad) || 0;
      
      if (item.picking_status === 'PARCIAL') grouped[item.nv].has_partial = true;
      if (item.picking_status === 'SIN_STOCK' || item.estado === 'QUIEBRE_STOCK') grouped[item.nv].has_stock_break = true;
    });

    const nvs = Object.values(grouped);
    
    const _pendientes = nvs.filter(n => ['PACKING', 'QUIEBRE_STOCK'].includes(n.estado) && !n.usuario_asignado);
    const _enProceso = nvs.filter(n => ['PACKING', 'QUIEBRE_STOCK'].includes(n.estado) && n.usuario_asignado);
    const _listos = nvs.filter(n => n.estado === 'LISTO_DESPACHO').sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    return {
      pendientes: _pendientes,
      enProceso: _enProceso,
      listos: _listos,
      stats: {
        totalPendiente: _pendientes.length,
        totalEnProceso: _enProceso.length,
        totalListo: nvs.filter(n => n.estado === 'LISTO_DESPACHO').length
      }
    };
  }, [data]);

  if (loading) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-3xl font-black text-slate-800 tracking-tight animate-pulse">
          CARGANDO SISTEMA...
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden flex flex-col p-6">
      
      {/* HEADER: Estilo WMS Clean */}
      <header className="flex justify-between items-center mb-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 relative z-20">
        <div className="flex items-center gap-6">
          <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 text-white transform hover:scale-105 transition-transform">
            <Package size={40} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-800 leading-none mb-1">
              PACKING <span className="text-indigo-600">MONITOR</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-wider uppercase">
              <Activity size={16} className="text-emerald-500" />
              <span>Tiempo Real • Centro de Distribución</span>
            </div>
          </div>
        </div>
        
        {/* Stats Chips */}
        <div className="flex gap-4">
           <div className="bg-slate-50 px-8 py-3 rounded-2xl border border-slate-200 flex flex-col items-center min-w-[140px]">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">En Cola</span>
              <span className="text-4xl font-black text-slate-700">{stats.totalPendiente}</span>
           </div>
           <div className="bg-indigo-50 px-8 py-3 rounded-2xl border border-indigo-100 flex flex-col items-center min-w-[140px]">
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Procesando</span>
              <span className="text-4xl font-black text-indigo-600">{stats.totalEnProceso}</span>
           </div>
           <div className="bg-emerald-50 px-8 py-3 rounded-2xl border border-emerald-100 flex flex-col items-center min-w-[140px]">
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Finalizados</span>
              <span className="text-4xl font-black text-emerald-600">{stats.totalListo}</span>
           </div>
        </div>

        {/* Clock */}
        <div className="text-right bg-slate-900 text-white px-8 py-3 rounded-2xl shadow-xl">
          <div className="text-5xl font-black font-mono tracking-wider flex items-center justify-end gap-1">
            <span>{currentTime.getHours().toString().padStart(2, '0')}</span>
            <span className="animate-pulse text-indigo-400">:</span>
            <span>{currentTime.getMinutes().toString().padStart(2, '0')}</span>
          </div>
          <div className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] text-center mt-1">
            {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 grid grid-cols-12 gap-6 h-full overflow-hidden pb-2">
        
        {/* COLUMNA 1: EN COLA (3 cols) */}
        <div className="col-span-3 flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden anim-column">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-700 flex items-center gap-3">
              <Clock className="text-slate-400" size={24} />
              EN COLA
            </h2>
            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg font-bold text-xs">
              {pendientes.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
            {pendientes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Package size={64} className="mb-4 opacity-50" />
                <p className="font-bold opacity-60">Sin pendientes</p>
              </div>
            ) : (
              pendientes.map((nv, idx) => (
                <div key={idx} className="anim-card bg-white border-l-4 border-slate-400 rounded-r-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl font-black text-slate-800">#{nv.nv}</span>
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded font-bold uppercase">
                      {nv.total_items} Items
                    </span>
                  </div>
                  <p className="text-slate-500 font-bold text-xs truncate mb-2">{nv.cliente}</p>
                  
                  <div className="flex gap-2 flex-wrap">
                    {nv.has_stock_break && (
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 font-bold flex items-center gap-1">
                        <AlertCircle size={10} /> QUIEBRE
                      </span>
                    )}
                    {nv.has_partial && (
                      <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100 font-bold flex items-center gap-1">
                        <AlertTriangle size={10} /> PARCIAL
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 2: PREPARANDO (5 cols) - MAIN FOCUS */}
        <div className="col-span-5 flex flex-col bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 shadow-2xl shadow-indigo-100/50 overflow-hidden relative anim-column">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          
          <div className="p-6 border-b border-indigo-100 bg-white/60 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-2xl font-black text-indigo-900 flex items-center gap-3">
              <Box size={28} className="text-indigo-600" />
              PREPARANDO
              <span className="flex h-3 w-3 relative ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
            </h2>
            <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-black text-lg shadow-lg shadow-indigo-500/30">
              {enProceso.length}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
             {enProceso.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-indigo-200">
                <Zap size={80} className="mb-6 opacity-50" />
                <p className="text-2xl font-black tracking-tight opacity-70">ESPERANDO ACTIVIDAD</p>
              </div>
            ) : (
              enProceso.map((nv, idx) => (
                <div key={idx} className="anim-card bg-white border border-indigo-100 rounded-3xl p-6 shadow-xl shadow-indigo-100/50 relative overflow-hidden group">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl font-black text-slate-800 tracking-tight">#{nv.nv}</span>
                        {(nv.has_stock_break || nv.has_partial) && (
                           <div className="animate-bounce text-amber-500 bg-amber-50 p-1.5 rounded-full border border-amber-100">
                             <AlertCircle size={20} />
                           </div>
                        )}
                      </div>
                      <p className="text-slate-500 text-lg font-bold truncate">{nv.cliente}</p>
                      
                      <div className="mt-4 flex items-center gap-3">
                         <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold uppercase">
                           <User size={14} />
                           {nv.usuario_nombre?.split(' ')[0] || 'N/A'}
                         </div>
                         <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase">
                           <Box size={14} />
                           {nv.total_cantidad} Unid.
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                       {/* Timer Component */}
                       <ElapsedTimer startTime={nv.start_time} />
                       
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                         Tiempo en Proceso
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 3: LISTO (4 cols) */}
        <div className="col-span-4 flex flex-col bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-50/50 overflow-hidden anim-column">
          <div className="p-6 border-b border-emerald-100 bg-emerald-50/30 flex justify-between items-center">
            <h2 className="text-xl font-black text-emerald-800 flex items-center gap-3">
              <CheckCircle size={24} className="text-emerald-600" /> 
              LISTOS
            </h2>
            <Truck size={24} className="text-emerald-300" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
             {listos.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-emerald-200/50">
                 <p className="font-bold">Sin finalizados</p>
               </div>
             ) : (
               listos.map((nv, idx) => (
                <div key={idx} className="anim-card bg-white border-l-4 border-emerald-500 rounded-r-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="min-w-0 flex-1">
                    <span className="text-2xl font-black text-slate-800 tracking-tight">#{nv.nv}</span>
                    <p className="text-slate-400 text-xs font-bold truncate">{nv.cliente}</p>
                  </div>
                  <div className="text-right pl-4">
                     <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black border border-emerald-100 uppercase tracking-wider">
                       LISTO
                     </div>
                     <div className="text-[10px] text-slate-300 font-mono mt-1 text-right">
                        {new Date(nv.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </div>
                  </div>
                </div>
               ))
             )}
          </div>
        </div>

      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 1);
        }
      `}</style>
    </div>
  );
};

export default PackingTV;
