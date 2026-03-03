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
  Truck,
  Timer,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const PackingTV = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar reloj cada segundo para parpadeo de dos puntos
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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

      // 2. Fetch Listos (Últimos 50)
      const { data: finishedData, error: finishedError } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .eq('estado', 'LISTO_DESPACHO')
        .order('nv', { ascending: false })
        .limit(50);

      if (finishedError) throw finishedError;

      // Unir datos
      const allData = [...(packingData || []), ...(finishedData || [])];
      setData(allData);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching data:', error);
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
          start_time: item.updated_at // Usamos updated_at como proxy de inicio si está en proceso
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
    const _listos = nvs.filter(n => n.estado === 'LISTO_DESPACHO').slice(0, 7); // Top 7

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
    <div className="h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-white text-3xl font-black animate-pulse flex items-center gap-4">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        CARGANDO MONITOR...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-hidden flex flex-col p-6">
      
      {/* HEADER ULTRA MODERNO */}
      <header className="flex justify-between items-center mb-8 bg-[#1E293B] p-6 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/30">
            <Package size={40} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-1">
              PACKING <span className="text-indigo-400">MONITOR</span>
            </h1>
            <div className="flex items-center gap-3 text-slate-400 font-bold text-sm tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Centro de Distribución • En Vivo
            </div>
          </div>
        </div>
        
        {/* KPI Cards Mini */}
        <div className="hidden xl:flex gap-4 relative z-10">
           <div className="bg-[#0F172A] px-6 py-3 rounded-2xl border border-slate-700/50 flex flex-col items-center min-w-[120px]">
              <span className="text-slate-400 text-xs font-bold uppercase">Pendientes</span>
              <span className="text-3xl font-black text-white">{stats.totalPendiente}</span>
           </div>
           <div className="bg-indigo-900/20 px-6 py-3 rounded-2xl border border-indigo-500/30 flex flex-col items-center min-w-[120px]">
              <span className="text-indigo-300 text-xs font-bold uppercase">En Proceso</span>
              <span className="text-3xl font-black text-indigo-400">{stats.totalEnProceso}</span>
           </div>
           <div className="bg-emerald-900/20 px-6 py-3 rounded-2xl border border-emerald-500/30 flex flex-col items-center min-w-[120px]">
              <span className="text-emerald-300 text-xs font-bold uppercase">Listos Hoy</span>
              <span className="text-3xl font-black text-emerald-400">{stats.totalListo}</span>
           </div>
        </div>

        <div className="text-right relative z-10 bg-[#0F172A] px-6 py-3 rounded-2xl border border-slate-700/50">
          <div className="text-5xl font-black font-mono tracking-wider text-white flex items-center gap-1">
            <span>{currentTime.getHours().toString().padStart(2, '0')}</span>
            <span className="animate-pulse text-indigo-500">:</span>
            <span>{currentTime.getMinutes().toString().padStart(2, '0')}</span>
          </div>
          <div className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em] text-center mt-1">
            {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="flex-1 grid grid-cols-12 gap-8 h-full overflow-hidden pb-4">
        
        {/* COLUMNA 1: EN COLA (30%) */}
        <div className="col-span-3 flex flex-col bg-[#1E293B] rounded-[2rem] border border-slate-700/50 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-transparent pointer-events-none"></div>
          
          <div className="p-6 border-b border-slate-700/50 bg-[#1E293B] relative z-10 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-200 flex items-center gap-3">
              <Clock className="text-slate-400" size={28} strokeWidth={2.5} />
              EN COLA
            </h2>
            <span className="bg-slate-700 text-white px-3 py-1 rounded-lg font-black text-sm border border-slate-600">
              {pendientes.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
            {pendientes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <Package size={64} className="mb-4 opacity-20" />
                <p className="text-xl font-bold opacity-40">Sin pendientes</p>
              </div>
            ) : (
              pendientes.map((nv, idx) => (
                <div key={idx} className="bg-[#0F172A] border-l-4 border-slate-500 rounded-r-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-3xl font-black text-white">#{nv.nv}</span>
                    <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-slate-700">
                      {nv.total_items} Items
                    </span>
                  </div>
                  <p className="text-slate-400 font-bold text-sm truncate mb-3">{nv.cliente}</p>
                  
                  <div className="flex gap-2">
                    {nv.has_stock_break && (
                      <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 font-black flex items-center gap-1 uppercase">
                        <AlertCircle size={12} /> Quiebre
                      </span>
                    )}
                    {nv.has_partial && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20 font-black flex items-center gap-1 uppercase">
                        <AlertTriangle size={12} /> Parcial
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 2: PREPARANDO (45%) - DESTACADA */}
        <div className="col-span-5 flex flex-col bg-indigo-950/20 rounded-[2rem] border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden relative">
           {/* Ambient Glow */}
           <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-600/10 to-transparent pointer-events-none"></div>
           
          <div className="p-6 border-b border-indigo-500/20 bg-indigo-950/30 relative z-10 flex justify-between items-center backdrop-blur-md">
            <h2 className="text-3xl font-black text-white flex items-center gap-4 tracking-wide">
              <div className="relative">
                <Box size={32} className="text-indigo-400" strokeWidth={2.5} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping"></span>
              </div>
              PREPARANDO
            </h2>
            <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-black text-xl shadow-lg shadow-indigo-600/40">
              {enProceso.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
             {enProceso.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-indigo-400/30">
                <Box size={100} className="mb-6 animate-pulse" />
                <p className="text-3xl font-black tracking-tight">ESPERANDO ASIGNACIONES</p>
              </div>
            ) : (
              enProceso.map((nv, idx) => (
                <div key={idx} className="bg-[#1E293B] border border-indigo-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  {/* Card Glow */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                  
                  <div className="flex justify-between items-start relative z-10 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-5xl font-black text-white tracking-tighter">#{nv.nv}</span>
                        {(nv.has_stock_break || nv.has_partial) && (
                           <div className="animate-bounce text-amber-400 bg-amber-400/10 p-2 rounded-full border border-amber-400/20">
                             <AlertCircle size={24} />
                           </div>
                        )}
                      </div>
                      <p className="text-indigo-200 text-xl font-bold truncate max-w-[350px]">{nv.cliente}</p>
                    </div>
                    
                    <div className="text-right">
                       <div className="flex items-center justify-end gap-2 text-indigo-300 font-bold text-sm mb-2 bg-indigo-950/50 px-3 py-1.5 rounded-full border border-indigo-500/20">
                         <User size={16} />
                         <span>{nv.usuario_nombre?.split(' ')[0].toUpperCase() || 'OPERADOR'}</span>
                       </div>
                       <div className="inline-flex flex-col items-end">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Unidades</span>
                         <span className="text-3xl font-black text-white bg-indigo-600/20 px-4 py-1 rounded-xl border border-indigo-500/30">
                            {nv.total_cantidad}
                         </span>
                       </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar simulada */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse-slow w-3/4 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 3: LISTO (25%) */}
        <div className="col-span-4 flex flex-col bg-emerald-950/10 rounded-[2rem] border border-emerald-500/20 overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-emerald-500/20 bg-emerald-950/30 flex justify-between items-center">
            <h2 className="text-2xl font-black text-emerald-100 flex items-center gap-3">
              <CheckCircle size={28} className="text-emerald-400" strokeWidth={2.5} /> 
              LISTOS
            </h2>
            <Truck size={28} className="text-emerald-500/50" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
             {listos.length === 0 ? (
               <div className="p-8 text-center text-emerald-500/30 font-bold text-xl">
                 Sin actividad reciente
               </div>
             ) : (
               listos.map((nv, idx) => (
                <div key={idx} className="bg-[#1E293B] border-l-4 border-emerald-500 rounded-r-2xl p-4 flex items-center justify-between shadow-lg opacity-90 hover:opacity-100 transition-all hover:translate-x-1">
                  <div>
                    <span className="text-3xl font-black text-white tracking-tight">#{nv.nv}</span>
                    <p className="text-emerald-200/60 text-sm font-bold truncate max-w-[180px]">{nv.cliente}</p>
                  </div>
                  <div className="text-right">
                     <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-black border border-emerald-500/20 uppercase tracking-wider flex items-center gap-2">
                       <CheckCircle size={14} /> Listo
                     </div>
                  </div>
                </div>
               ))
             )}
          </div>
        </div>

      </div>
      
      {/* Footer Info */}
      <div className="flex justify-between items-center text-slate-600 text-xs font-bold uppercase tracking-widest px-4">
        <div className="flex gap-8">
           <span className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-500 rounded-full"></div> En Cola</span>
           <span className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div> En Preparación</span>
           <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Finalizado</span>
        </div>
        <div>
           CCO Warehouse OS v3.0 • Conexión Segura
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default PackingTV;
