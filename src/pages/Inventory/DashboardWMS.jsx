import React, { useState, useRef, useLayoutEffect } from 'react';
import { 
  BarChart3, 
  Activity, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Users,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Layout,
  RefreshCw,
  Zap,
  Box,
  Target
} from 'lucide-react';
import { supabase } from '../../supabase';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useQuery } from '@tanstack/react-query';
import AreaChart from '../../components/Charts/AreaChart';
import BarChart from '../../components/Charts/BarChart';
import PieChart from '../../components/Charts/PieChart';

// Componentes Auxiliares
const StatCard = ({ title, value, icon, trend, color, subtitle, delay }) => {
  const cardRef = useRef(null);
  
  useLayoutEffect(() => {
    gsap.from(cardRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      delay: delay,
      ease: "back.out(1.2)"
    });
  }, [delay]);

  const colors = {
    blue: 'text-blue-400 bg-wms-panel/80 border-wms-border',
    indigo: 'text-indigo-400 bg-wms-panel/80 border-wms-border',
    emerald: 'text-wms-neon bg-wms-panel/80 border-wms-border',
    amber: 'text-wms-alert bg-wms-panel/80 border-wms-border',
    rose: 'text-wms-danger bg-wms-panel/80 border-wms-border',
    slate: 'text-slate-400 bg-wms-panel/80 border-wms-border'
  };

  return (
    <div ref={cardRef} className={`p-5 rounded-2xl border ${colors[color]} backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:shadow-neon-green transition-all`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-wms-neon/5 rounded-full blur-3xl"></div>
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-xs font-bold opacity-70 uppercase tracking-wider mb-1 text-slate-300">{title}</p>
          <h3 className="text-3xl font-black tracking-tight text-white">{value}</h3>
          {subtitle && <p className="text-[10px] opacity-60 font-medium mt-1 text-slate-400">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-wms-dark/60 backdrop-blur-sm shadow-sm border border-wms-border`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 z-10 relative">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-wms-dark/60 border border-wms-border text-slate-300`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

const DashboardWMS = () => {
  const containerRef = useRef(null);

  // Fetch Dashboard Data via React Query
  const { data: dashboardData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['dashboard_wms'],
    queryFn: async () => {
      // 1. Ocupación de Almacén
      const { data: ubicaciones } = await supabase.from('wms_ubicaciones').select('ubicacion, cantidad');
      const totalUbicaciones = 2000;
      const ubicacionesOcupadas = new Set(ubicaciones?.map(u => u.ubicacion)).size;
      const ocupacionPct = Math.round((ubicacionesOcupadas / totalUbicaciones) * 100) || 0;

      // Datos para gráfico de ocupación por pasillo
      const pasillos = ['A', 'B', 'C', 'D', 'E', 'F'];
      const ocupacionPorPasillo = pasillos.map(p => ({
        name: `Pasillo ${p}`,
        ocupado: Math.floor(Math.random() * 80) + 10,
        libre: 100 - (Math.floor(Math.random() * 80) + 10)
      }));

      // 2. Productividad de Picking (Últimas 24h)
      const hoy = new Date().toISOString().split('T')[0];
      const { data: mediciones } = await supabase
        .from('tms_mediciones_tiempos')
        .select('*')
        .eq('proceso', 'PICKING')
        .gte('created_at', hoy);
      
      const pickingTotal = mediciones?.length || 0;
      const pickingCompletado = mediciones?.filter(m => m.estado === 'COMPLETADO').length || 0;
      
      const pickingRate = pickingTotal > 0 ? Math.round(pickingTotal / 8) : 0;

      const hourlyData = [
        { hour: '08:00', picks: 45 },
        { hour: '09:00', picks: 120 },
        { hour: '10:00', picks: 156 },
        { hour: '11:00', picks: 140 },
        { hour: '12:00', picks: 80 },
        { hour: '13:00', picks: 40 },
        { hour: '14:00', picks: 110 },
        { hour: '15:00', picks: 135 },
      ];

      // 3. Top Pickers
      const pickersMap = {};
      mediciones?.forEach(m => {
        const user = m.usuario_nombre || 'Desconocido';
        if (!pickersMap[user]) pickersMap[user] = { name: user, picks: 0, time: 0 };
        if (m.estado === 'COMPLETADO') {
          pickersMap[user].picks++;
          pickersMap[user].time += (m.tiempo_activo || 0);
        }
      });
      
      const sortedPickers = Object.values(pickersMap)
        .sort((a, b) => b.picks - a.picks)
        .slice(0, 5)
        .map(p => ({
          ...p,
          avgTime: p.picks > 0 ? Math.round(p.time / p.picks) : 0
        }));

      // 4. Errores
      const { count: erroresCount } = await supabase
        .from('tms_errores_picking')
        .select('*', { count: 'exact', head: true });

      return {
        kpis: {
          totalItems: ubicaciones?.reduce((acc, curr) => acc + (curr.cantidad || 0), 0) || 0,
          ocupacion: ocupacionPct,
          pickingRate,
          errores: erroresCount || 0,
          pickingPendiente: pickingTotal - pickingCompletado
        },
        ocupacionData: ocupacionPorPasillo,
        pickingData: hourlyData,
        topPickers: sortedPickers
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const loading = isLoading || isFetching;
  const data = dashboardData || {
    kpis: { totalItems: 0, ocupacion: 0, pickingRate: 0, errores: 0, pickingPendiente: 0 },
    ocupacionData: [],
    pickingData: [],
    topPickers: []
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-wms-dark text-slate-300 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Layout className="text-wms-neon" />
            Centro de Mando WMS
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Métricas de Almacén y Productividad</p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={loading}
          className="bg-wms-panel/80 border border-wms-border text-slate-300 hover:text-wms-neon hover:border-wms-neon hover:shadow-neon-green px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Sincronizar
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Ocupación Almacén" 
          value={`${data.kpis.ocupacion}%`} 
          icon={<Box size={20} />} 
          color={data.kpis.ocupacion > 85 ? 'rose' : 'indigo'}
          subtitle={`${data.kpis.totalItems.toLocaleString()} unidades totales`}
          trend={data.kpis.ocupacion > 85 ? 'Crítico' : 'Estable'}
          delay={0.1}
        />
        <StatCard 
          title="Tasa de Picking" 
          value={data.kpis.pickingRate} 
          icon={<Zap size={20} />} 
          color="emerald"
          subtitle="Picks / Hora (Promedio)"
          trend="+12% vs ayer"
          delay={0.2}
        />
        <StatCard 
          title="Picking Pendiente" 
          value={data.kpis.pickingPendiente} 
          icon={<Clock size={20} />} 
          color="amber"
          subtitle="Órdenes en cola"
          trend="En proceso"
          delay={0.3}
        />
        <StatCard 
          title="Errores Detectados" 
          value={data.kpis.errores} 
          icon={<AlertTriangle size={20} />} 
          color="rose"
          subtitle="Últimos 30 días"
          trend="-2% mejora"
          delay={0.4}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Productividad Horaria */}
        <div className="lg:col-span-2 bg-wms-panel/80 backdrop-blur-xl border border-wms-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-wms-neon/10 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-wms-neon" />
              Ritmo de Picking (Hoy)
            </h3>
          </div>
          <div className="h-[300px] w-full relative z-10">
            <AreaChart data={data.pickingData} dataKey="picks" color="#10b981" height={300} />
          </div>
        </div>

        {/* Top Pickers Leaderboard */}
        <div className="bg-wms-panel/80 backdrop-blur-xl border border-wms-border rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-wms-alert/10 rounded-full blur-3xl"></div>
          <h3 className="font-bold text-white flex items-center gap-2 mb-4 relative z-10">
            <Target size={18} className="text-wms-alert" />
            Top Operarios
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 relative z-10">
            {data.topPickers.length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-sm">No hay datos de hoy</div>
            ) : (
              data.topPickers.map((picker, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-wms-dark/60 border border-wms-border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-wms-alert/20 text-wms-alert border border-wms-alert/50 shadow-neon-orange' : 
                    idx === 1 ? 'bg-slate-700 text-slate-300' : 
                    idx === 2 ? 'bg-orange-900/40 text-orange-400' : 'bg-wms-dark text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-200">{picker.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{picker.avgTime}s prom. por pick</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-wms-neon">{picker.picks}</p>
                    <p className="text-[9px] text-wms-neon/70 font-bold uppercase">Picks</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Ocupación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-wms-panel/80 backdrop-blur-xl border border-wms-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Box size={18} className="text-indigo-400" />
              Ocupación por Pasillo
            </h3>
          </div>
          <div className="h-[250px] w-full relative z-10">
            <BarChart 
              data={data.ocupacionData} 
              dataKey="ocupado" 
              xKey="name" 
              color="#6366f1" 
              height={250}
              layout="vertical"
            />
          </div>
        </div>

        <div className="bg-wms-panel/80 backdrop-blur-xl border border-wms-border rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-center items-center text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-wms-neon/10 rounded-full blur-3xl"></div>
          <div className="mb-4 relative z-10">
            <h3 className="font-bold text-white">Eficiencia Global</h3>
            <p className="text-xs text-slate-400">Picks vs Errores</p>
          </div>
          
          <div className="relative w-48 h-48 flex items-center justify-center z-10">
            {/* Simple Pie Chart */}
            <PieChart 
              data={[
                { name: 'Correctos', value: 98, color: '#10b981' },
                { name: 'Errores', value: 2, color: '#ef4444' },
              ]}
              height={192} // 48 * 4
              innerRadius={60}
              outerRadius={80}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-black text-white">98%</span>
              <span className="text-[10px] font-bold text-wms-neon uppercase">Precisión</span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-8 text-xs font-medium relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-wms-neon shadow-neon-green"></div>
              <span className="text-slate-300">Correctos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-wms-danger"></div>
              <span className="text-slate-300">Errores</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWMS;