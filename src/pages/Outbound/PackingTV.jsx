import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  ArrowRight,
  Box,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';

const PackingTV = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar reloj cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Packing Pendiente y En Proceso
      const { data: packingData, error: packingError } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .in('estado', ['PACKING', 'QUIEBRE_STOCK']);

      if (packingError) throw packingError;

      // 2. Fetch Listos (Últimos 20)
      const { data: finishedData, error: finishedError } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .eq('estado', 'LISTO_DESPACHO')
        .order('nv', { ascending: false }) // Usamos NV como proxy de tiempo si no hay updated_at confiable
        .limit(50); // Traemos suficientes items para agrupar

      if (finishedError) throw finishedError;

      // Unir datos
      const allData = [...(packingData || []), ...(finishedData || [])];
      setData(allData);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    }
  };

  useEffect(() => {
    fetchData();

    // Realtime Subscription
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

  // Procesar datos agrupados por NV
  const { pendientes, enProceso, listos } = useMemo(() => {
    const grouped = {};
    
    data.forEach(item => {
      if (!grouped[item.nv]) {
        grouped[item.nv] = {
          ...item,
          items: [],
          total_items: 0,
          total_cantidad: 0,
          has_partial: false,
          has_stock_break: false
        };
      }
      grouped[item.nv].items.push(item);
      grouped[item.nv].total_items++;
      grouped[item.nv].total_cantidad += parseInt(item.cantidad) || 0;
      
      if (item.picking_status === 'PARCIAL') grouped[item.nv].has_partial = true;
      if (item.picking_status === 'SIN_STOCK' || item.estado === 'QUIEBRE_STOCK') grouped[item.nv].has_stock_break = true;
    });

    const nvs = Object.values(grouped);
    
    return {
      pendientes: nvs.filter(n => ['PACKING', 'QUIEBRE_STOCK'].includes(n.estado) && !n.usuario_asignado),
      enProceso: nvs.filter(n => ['PACKING', 'QUIEBRE_STOCK'].includes(n.estado) && n.usuario_asignado),
      listos: nvs.filter(n => n.estado === 'LISTO_DESPACHO').slice(0, 8) // Mostrar solo los últimos 8 terminados
    };
  }, [data]);

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-2xl font-bold animate-pulse flex items-center gap-3">
        <Package size={32} /> Cargando Monitor Packing...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 px-2 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
            <Package size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              PACKING MONITOR
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wider uppercase">Centro de Distribución</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-4xl font-black font-mono tracking-widest text-white">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-slate-400 font-medium uppercase text-sm tracking-widest">
            {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 h-full overflow-hidden pb-2">
        
        {/* Columna 1: EN COLA (Pendientes) */}
        <div className="col-span-3 flex flex-col bg-slate-800/30 rounded-3xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">
              <Clock size={24} /> EN COLA
            </h2>
            <span className="bg-slate-700 text-white px-3 py-1 rounded-full font-bold text-sm">
              {pendientes.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {pendientes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <Package size={64} className="mb-4" />
                <p className="text-lg font-medium">No hay pendientes</p>
              </div>
            ) : (
              pendientes.map((nv, idx) => (
                <div key={idx} className="bg-slate-800 border-l-4 border-slate-500 rounded-r-xl p-4 shadow-lg hover:bg-slate-750 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">#{nv.nv}</span>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">
                      {nv.total_items} Items
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium truncate mb-2">{nv.cliente}</p>
                  
                  <div className="flex gap-2 mt-2">
                    {nv.has_stock_break && (
                      <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-1 rounded border border-red-900/50 font-bold flex items-center gap-1">
                        <AlertCircle size={10} /> QUIEBRE
                      </span>
                    )}
                    {nv.has_partial && (
                      <span className="text-[10px] bg-amber-900/50 text-amber-400 px-2 py-1 rounded border border-amber-900/50 font-bold flex items-center gap-1">
                        <AlertCircle size={10} /> PARCIAL
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna 2: EN PROCESO (Activos) - MÁS ANCHA */}
        <div className="col-span-5 flex flex-col bg-indigo-900/10 rounded-3xl border border-indigo-500/20 overflow-hidden backdrop-blur-sm relative">
           {/* Glow Effect */}
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
           
          <div className="bg-indigo-900/40 p-4 border-b border-indigo-500/30 flex justify-between items-center">
            <h2 className="text-2xl font-black text-indigo-100 flex items-center gap-3 tracking-wide">
              <Box size={28} className="animate-pulse" /> PREPARANDO
            </h2>
            <span className="bg-indigo-600 text-white px-4 py-1 rounded-full font-bold text-lg shadow-lg shadow-indigo-900/50">
              {enProceso.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
             {enProceso.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-indigo-400/30">
                <Box size={80} className="mb-6 animate-bounce-subtle" />
                <p className="text-2xl font-bold">Esperando asignaciones...</p>
              </div>
            ) : (
              enProceso.map((nv, idx) => (
                <div key={idx} className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                  {/* Background Decoration */}
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-4xl font-black text-white tracking-tight">#{nv.nv}</span>
                        {(nv.has_stock_break || nv.has_partial) && (
                           <div className="animate-pulse text-amber-400">
                             <AlertCircle size={24} />
                           </div>
                        )}
                      </div>
                      <p className="text-indigo-200 text-lg font-bold truncate max-w-[280px]">{nv.cliente}</p>
                    </div>
                    
                    <div className="text-right">
                       <div className="flex items-center justify-end gap-2 text-indigo-300 font-mono text-sm mb-1">
                         <User size={14} />
                         <span>{nv.usuario_nombre?.split(' ')[0] || 'Operador'}</span>
                       </div>
                       <div className="bg-indigo-600/20 text-indigo-200 px-3 py-1 rounded-lg border border-indigo-500/30 text-center">
                         <span className="block text-xs uppercase opacity-70">Total Un.</span>
                         <span className="font-bold text-xl">{nv.total_cantidad}</span>
                       </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar simulada (Visual only) */}
                  <div className="mt-4 h-1.5 w-full bg-indigo-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-pulse-slow w-2/3"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna 3: LISTO (Completados) */}
        <div className="col-span-4 flex flex-col bg-emerald-900/10 rounded-3xl border border-emerald-500/20 overflow-hidden backdrop-blur-sm">
          <div className="bg-emerald-900/40 p-4 border-b border-emerald-500/30 flex justify-between items-center">
            <h2 className="text-xl font-bold text-emerald-100 flex items-center gap-2">
              <CheckCircle size={24} /> LISTO PARA DESPACHO
            </h2>
            <Truck size={24} className="text-emerald-400" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
             {listos.length === 0 ? (
               <div className="p-8 text-center text-emerald-500/30 font-medium">
                 No hay finalizados recientes
               </div>
             ) : (
               listos.map((nv, idx) => (
                <div key={idx} className="bg-emerald-950/40 border-l-4 border-emerald-500 rounded-r-xl p-4 flex items-center justify-between opacity-90 hover:opacity-100 transition-opacity">
                  <div>
                    <span className="text-2xl font-black text-white/90 decoration-emerald-500/50">#{nv.nv}</span>
                    <p className="text-emerald-200/70 text-sm font-medium truncate max-w-[150px]">{nv.cliente}</p>
                  </div>
                  <div className="text-right">
                     <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-500/20">
                       LISTO
                     </div>
                  </div>
                </div>
               ))
             )}
          </div>
        </div>

      </div>
      
      {/* Footer Info */}
      <div className="mt-4 flex justify-between items-center text-slate-500 text-xs px-2">
        <div className="flex gap-6">
           <span className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-500 rounded-full"></div> EN COLA</span>
           <span className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div> PREPARANDO</span>
           <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> LISTO</span>
        </div>
        <div>
           Sincronización en tiempo real activa • v2.0
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default PackingTV;
