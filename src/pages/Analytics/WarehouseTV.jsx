import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { 
  BarChart, Activity, Truck, Package, CheckCircle, 
  AlertTriangle, Clock, TrendingUp, Users 
} from 'lucide-react';
import BarChartComponent from '../../components/Charts/BarChart'; // Usar componente unificado
import gsap from 'gsap';

const WarehouseTV = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    pendingOrders: 0,
    completedOrders: 0,
    pickingProgress: 0,
    activeUsers: 0,
    urgentReplenishments: 0,
    trucksWaiting: 0
  });

  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    // Reloj en tiempo real
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    fetchRealData();

    // Suscripción Realtime para actualizar métricas
    const subscription = supabase
      .channel('tv_dashboard_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => fetchRealData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_mediciones_tiempos' }, () => fetchRealData())
      .subscribe();

    // Animación de entrada
    gsap.fromTo(".metric-card", 
      { scale: 0.9, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1 }
    );

    return () => {
      clearInterval(timer);
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRealData = async () => {
    try {
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

      setStats(prev => ({
        ...prev,
        pendingOrders: pending,
        completedOrders: completed,
        pickingProgress: progress,
        activeUsers: activeUsers || 0,
        // Datos simulados por falta de tablas específicas
        urgentReplenishments: Math.floor(Math.random() * 5), 
        trucksWaiting: Math.floor(Math.random() * 3)
      }));

      setHourlyData(chartData);

    } catch (error) {
      console.error("Error fetching TV data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 overflow-hidden font-sans">
      {/* Top Bar: Reloj y Título */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/30">
            <Activity size={32} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Centro de Distribución - Live</h1>
            <p className="text-slate-400 font-medium">Monitoreo Operativo en Tiempo Real</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black font-mono tracking-wider text-emerald-400">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-1">
            {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Main Grid - Altura Ajustada para evitar scroll infinito */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        
        {/* Columna Izquierda: KPIs Críticos */}
        <div className="col-span-3 flex flex-col gap-6">
          {/* Pedidos Pendientes */}
          <div className="metric-card bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package size={120} />
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider mb-2">Pedidos Pendientes</p>
              <div className="text-7xl font-black text-white">{stats.pendingOrders}</div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out" 
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
          <div className="metric-card bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-sm">Despachados Hoy</p>
                <div className="text-5xl font-black text-white">{stats.completedOrders}</div>
              </div>
            </div>
          </div>

          {/* Urgencias */}
          <div className="metric-card bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden">
             <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl animate-bounce">
                <AlertTriangle size={32} />
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-sm">Urgencias</p>
                <div className="text-4xl font-black text-amber-400">{stats.urgentReplenishments}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Central: Gráfico de Rendimiento */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="metric-card bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl h-full flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-indigo-400" /> Rendimiento de Picking por Hora
            </h3>
            <div className="flex-1 w-full min-h-0 relative">
               {/* Usando componente BarChart con altura fija relativa al contenedor */}
               <div className="absolute inset-0">
                  <BarChartComponent 
                    data={hourlyData} 
                    dataKey="picks" 
                    xKey="name" 
                    color="#6366f1" 
                    height="100%" // Ocupar todo el alto disponible
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Estado Operativo */}
        <div className="col-span-3 flex flex-col gap-6">
          {/* Usuarios Activos */}
          <div className="metric-card bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Users size={80} />
            </div>
            <p className="font-bold uppercase opacity-80 mb-2">Usuarios Activos (15m)</p>
            <div className="text-6xl font-black">{stats.activeUsers}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: Math.min(8, stats.activeUsers) }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs font-bold">
                  U{i+1}
                </div>
              ))}
            </div>
          </div>

          {/* Patio de Camiones (Simulado) */}
          <div className="metric-card bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex-1">
            <h3 className="font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
              <Truck size={18} /> Patio de Camiones
            </h3>
            <div className="space-y-4">
              {['Andén 1: Cargando (80%)', 'Andén 2: Espera Salida', 'Andén 3: Disponible'].map((status, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${
                    status.includes('Disponible') ? 'bg-emerald-500' : 
                    status.includes('Cargando') ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'
                  }`}></div>
                  <span className="font-bold text-sm">{status}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
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
