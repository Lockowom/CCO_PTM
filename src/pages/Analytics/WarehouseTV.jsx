import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { 
  BarChart, Activity, Truck, Package, CheckCircle, 
  AlertTriangle, Clock, TrendingUp, Users 
} from 'lucide-react';
import BarChartComponent from '../../components/Charts/BarChart';
import { useQuery } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const WarehouseTV = () => {
  const container = useRef();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Reloj en tiempo real
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useGSAP(() => {
    // Animación de entrada
    gsap.fromTo(".metric-card", 
      { scale: 0.9, opacity: 0, y: 20 }, 
      { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out", clearProps: 'all' }
    );
  }, { scope: container });

  // Utilizando useQuery para los datos principales
  const { data: tvData = {
    stats: { pendingOrders: 0, completedOrders: 0, pickingProgress: 0, activeUsers: 0, urgentReplenishments: 0, trucksWaiting: 0 },
    hourlyData: []
  } } = useQuery({
    queryKey: ['tv_dashboard_metrics'],
    queryFn: async () => {
      // 1. Pedidos Pendientes y Completados
      const { data: nvData } = await supabase
        .from('tms_nv_diarias')
        .select('estado');

      const total = nvData?.length || 0;
      const pending = nvData?.filter(n => n.estado === 'Pendiente Picking').length || 0;
      const completed = nvData?.filter(n => n.estado === 'Despachado' || n.estado === 'Entregado').length || 0;
      const inProcess = nvData?.filter(n => ['Picking', 'Packing'].includes(n.estado)).length || 0;
      
      const progress = total > 0 ? Math.round(((completed + inProcess) / total) * 100) : 0;

      // 2. Usuarios Activos (Simulado basado en mediciones recientes - últimos 15 min)
      const fifteenMinAgo = new Date(Date.now() - 15 * 60000).toISOString();
      const { count: activeUsers } = await supabase
        .from('tms_mediciones_tiempos')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', fifteenMinAgo);

      // 3. Picking por Hora (Gráfico)
      const { data: pickingData } = await supabase
        .from('tms_mediciones_tiempos')
        .select('fin_at')
        .eq('proceso', 'PICKING')
        .eq('estado', 'COMPLETADO')
        .gte('fin_at', new Date().setHours(0,0,0,0)); // Hoy

      // Agrupar por hora
      const hoursMap = {};
      (pickingData || []).forEach(item => {
        if (!item.fin_at) return;
        const hour = new Date(item.fin_at).getHours();
        const label = `${hour.toString().padStart(2, '0')}:00`;
        hoursMap[label] = (hoursMap[label] || 0) + 1;
      });

      // Llenar huecos de horas laborales (8AM - 6PM)
      const chartData = [];
      for (let h = 8; h <= 18; h++) {
        const label = `${h.toString().padStart(2, '0')}:00`;
        chartData.push({
          name: label,
          picks: hoursMap[label] || 0
        });
      }

      return {
        stats: {
          pendingOrders: pending,
          completedOrders: completed,
          pickingProgress: progress,
          activeUsers: activeUsers || 0,
          urgentReplenishments: Math.floor(Math.random() * 5), 
          trucksWaiting: Math.floor(Math.random() * 3)
        },
        hourlyData: chartData
      };
    },
    refetchInterval: 5000 // Refetch cada 5 segundos para mantenerlo en vivo sin webhooks complejos
  });

  const { stats, hourlyData } = tvData;

  return (
    <div ref={container} className="min-h-screen bg-wms-dark text-white p-6 overflow-hidden font-sans">
      {/* Top Bar: Reloj y Título */}
      <div className="flex justify-between items-center mb-6 border-b border-wms-border pb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600/20 p-3 rounded-xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Activity size={32} className="animate-pulse text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase text-white">Centro de Distribución - Live</h1>
            <p className="text-slate-400 font-medium">Monitoreo Operativo en Tiempo Real</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black font-mono tracking-wider text-wms-neon drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-1">
            {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Main Grid - Altura Ajustada para evitar scroll infinito */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)] relative z-10">
        
        {/* Columna Izquierda: KPIs Críticos */}
        <div className="col-span-3 flex flex-col gap-6">
          {/* Pedidos Pendientes */}
          <div className="metric-card bg-wms-panel/90 backdrop-blur-xl rounded-3xl p-6 border border-wms-border shadow-2xl flex-1 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-400">
              <Package size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 font-bold uppercase tracking-wider mb-2">Pedidos Pendientes</p>
              <div className="text-7xl font-black text-white">{stats.pendingOrders}</div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="w-full bg-wms-dark rounded-full h-4 overflow-hidden border border-wms-border">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${stats.pickingProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm font-bold">
                <span className="text-indigo-400">{stats.pickingProgress}% Completado</span>
                <span className="text-slate-500">Meta: 95%</span>
              </div>
            </div>
          </div>

          {/* Despachados */}
          <div className="metric-card bg-wms-panel/90 backdrop-blur-xl rounded-3xl p-6 border border-wms-border shadow-2xl flex-1 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-4 mb-2 relative z-10">
              <div className="p-3 bg-wms-neon/20 text-wms-neon border border-wms-neon/30 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-sm">Despachados Hoy</p>
                <div className="text-5xl font-black text-white">{stats.completedOrders}</div>
              </div>
            </div>
          </div>

          {/* Urgencias */}
          <div className="metric-card bg-wms-panel/90 backdrop-blur-xl rounded-3xl p-6 border border-wms-border shadow-2xl flex-1 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
             <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-wms-alert/20 text-wms-alert border border-wms-alert/30 rounded-xl animate-bounce shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <AlertTriangle size={32} />
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-sm">Urgencias</p>
                <div className="text-4xl font-black text-wms-alert drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]">{stats.urgentReplenishments}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Central: Gráfico de Rendimiento */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="metric-card bg-wms-panel/90 backdrop-blur-xl rounded-3xl p-8 border border-wms-border shadow-2xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <TrendingUp className="text-indigo-400" /> Rendimiento de Picking por Hora
            </h3>
            <div className="flex-1 w-full min-h-0 relative z-10">
               {/* Usando componente BarChart con altura fija relativa al contenedor */}
               <div className="absolute inset-0">
                  <BarChartComponent 
                    data={hourlyData} 
                    dataKey="picks" 
                    xKey="name" 
                    color="#818cf8" 
                    height="100%" // Ocupar todo el alto disponible
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Estado Operativo */}
        <div className="col-span-3 flex flex-col gap-6">
          {/* Usuarios Activos */}
          <div className="metric-card bg-indigo-900/40 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(79,70,229,0.15)] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 text-indigo-300">
              <Users size={80} />
            </div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl"></div>
            <p className="font-bold uppercase text-indigo-200 mb-2 relative z-10">Usuarios Activos (15m)</p>
            <div className="text-6xl font-black text-white relative z-10">{stats.activeUsers}</div>
            <div className="mt-4 flex flex-wrap gap-2 relative z-10">
              {Array.from({ length: Math.min(8, stats.activeUsers) }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center text-xs font-bold text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  U{i+1}
                </div>
              ))}
            </div>
          </div>

          {/* Patio de Camiones (Simulado) */}
          <div className="metric-card bg-wms-panel/90 backdrop-blur-xl rounded-3xl p-6 border border-wms-border shadow-2xl flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full blur-2xl"></div>
            <h3 className="font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 relative z-10">
              <Truck size={18} /> Patio de Camiones
            </h3>
            <div className="space-y-4 relative z-10">
              {['Andén 1: Cargando (80%)', 'Andén 2: Espera Salida', 'Andén 3: Disponible'].map((status, i) => (
                <div key={i} className="flex items-center gap-3 bg-wms-dark/80 border border-wms-border p-3 rounded-xl">
                  <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${
                    status.includes('Disponible') ? 'bg-wms-neon text-wms-neon' : 
                    status.includes('Cargando') ? 'bg-blue-400 text-blue-400 animate-pulse' : 'bg-wms-alert text-wms-alert'
                  }`}></div>
                  <span className="font-bold text-sm text-slate-300">{status}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-wms-border flex justify-between items-center">
                <span className="text-slate-400 text-sm font-bold">En Espera:</span>
                <span className="text-2xl font-black text-white">{stats.trucksWaiting}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WarehouseTV;
