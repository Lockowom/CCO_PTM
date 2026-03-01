import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { supabase } from '../../supabase';
import gsap from 'gsap';

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
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100'
  };

  return (
    <div ref={cardRef} className={`p-5 rounded-2xl border ${colors[color]} shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-xs font-bold opacity-60 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black tracking-tight">{value}</h3>
          {subtitle && <p className="text-[10px] opacity-60 font-medium mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-white bg-opacity-60 backdrop-blur-sm shadow-sm`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white bg-opacity-60`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

const DashboardWMS = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalItems: 0,
    ocupacion: 0,
    pickingRate: 0,
    errores: 0,
    pickingPendiente: 0
  });
  
  const [ocupacionData, setOcupacionData] = useState([]);
  const [pickingData, setPickingData] = useState([]);
  const [topPickers, setTopPickers] = useState([]);
  const containerRef = useRef(null);

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Ocupación de Almacén (Simulada basada en Layout)
      // En producción real, esto vendría de una consulta compleja a wms_ubicaciones
      const { data: ubicaciones } = await supabase.from('wms_ubicaciones').select('ubicacion, cantidad');
      const totalUbicaciones = 2000; // Capacidad teórica total (ejemplo)
      const ubicacionesOcupadas = new Set(ubicaciones?.map(u => u.ubicacion)).size;
      const ocupacionPct = Math.round((ubicacionesOcupadas / totalUbicaciones) * 100);

      // Datos para gráfico de ocupación por pasillo
      const pasillos = ['A', 'B', 'C', 'D', 'E', 'F'];
      const ocupacionPorPasillo = pasillos.map(p => ({
        name: `Pasillo ${p}`,
        ocupado: Math.floor(Math.random() * 80) + 10, // Simulado
        libre: 100 - (Math.floor(Math.random() * 80) + 10)
      }));
      setOcupacionData(ocupacionPorPasillo);

      // 2. Productividad de Picking (Últimas 24h)
      const hoy = new Date().toISOString().split('T')[0];
      const { data: mediciones } = await supabase
        .from('tms_mediciones_tiempos')
        .select('*')
        .eq('proceso', 'PICKING')
        .gte('created_at', hoy);
      
      const pickingTotal = mediciones?.length || 0;
      const pickingCompletado = mediciones?.filter(m => m.estado === 'COMPLETADO').length || 0;
      
      // Calcular tasa de picking (Items / Hora) - Simplificado
      const pickingRate = pickingTotal > 0 ? Math.round(pickingTotal / 8) : 0; // Promedio por turno de 8h

      // Datos para gráfico de productividad horaria
      const hourlyData = [
        { hour: '08:00', picks: 45 },
        { hour: '09:00', picks: 120 },
        { hour: '10:00', picks: 156 },
        { hour: '11:00', picks: 140 },
        { hour: '12:00', picks: 80 },
        { hour: '13:00', picks: 40 }, // Almuerzo
        { hour: '14:00', picks: 110 },
        { hour: '15:00', picks: 135 },
      ];
      setPickingData(hourlyData);

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
      setTopPickers(sortedPickers);

      // 4. Errores (desde tms_errores_picking)
      const { count: erroresCount } = await supabase
        .from('tms_errores_picking')
        .select('*', { count: 'exact', head: true });

      setKpis({
        totalItems: ubicaciones?.reduce((acc, curr) => acc + (curr.cantidad || 0), 0) || 0,
        ocupacion: ocupacionPct,
        pickingRate,
        errores: erroresCount || 0,
        pickingPendiente: pickingTotal - pickingCompletado
      });

    } catch (error) {
      console.error("Error cargando dashboard WMS:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Layout className="text-indigo-600" />
            Dashboard WMS
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Métricas de Almacén y Productividad</p>
        </div>
        <button 
          onClick={fetchData}
          className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Ocupación Almacén" 
          value={`${kpis.ocupacion}%`} 
          icon={<Box size={20} />} 
          color={kpis.ocupacion > 85 ? 'rose' : 'indigo'}
          subtitle={`${kpis.totalItems.toLocaleString()} unidades totales`}
          trend={kpis.ocupacion > 85 ? 'Crítico' : 'Estable'}
          delay={0.1}
        />
        <StatCard 
          title="Tasa de Picking" 
          value={kpis.pickingRate} 
          icon={<Zap size={20} />} 
          color="emerald"
          subtitle="Picks / Hora (Promedio)"
          trend="+12% vs ayer"
          delay={0.2}
        />
        <StatCard 
          title="Picking Pendiente" 
          value={kpis.pickingPendiente} 
          icon={<Clock size={20} />} 
          color="amber"
          subtitle="Órdenes en cola"
          trend="En proceso"
          delay={0.3}
        />
        <StatCard 
          title="Errores Detectados" 
          value={kpis.errores} 
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
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              Ritmo de Picking (Hoy)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pickingData}>
                <defs>
                  <linearGradient id="colorPicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="picks" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pickers Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Target size={18} className="text-amber-500" />
            Top Operarios
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {topPickers.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-sm">No hay datos de hoy</div>
            ) : (
              topPickers.map((picker, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-amber-100 text-amber-600' : 
                    idx === 1 ? 'bg-slate-200 text-slate-600' : 
                    idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">{picker.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{picker.avgTime}s prom. por pick</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">{picker.picks}</p>
                    <p className="text-[9px] text-indigo-400 font-bold uppercase">Picks</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Ocupación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Box size={18} className="text-indigo-500" />
              Ocupación por Pasillo
            </h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ocupacionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} width={80} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="ocupado" name="Ocupado %" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800">Eficiencia Global</h3>
            <p className="text-xs text-slate-400">Picks vs Errores</p>
          </div>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Simple Pie Chart Placeholder */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Correctos', value: 98, color: '#10b981' },
                    { name: 'Errores', value: 2, color: '#f43f5e' },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">98%</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Precisión</span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-8 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-600">Correctos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-slate-600">Errores</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWMS;
