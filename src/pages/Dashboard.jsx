import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { 
  Activity, 
  Clock, 
  RefreshCw,
  FileText, 
  Hourglass, 
  Hand, 
  AlertCircle, 
  Box, 
  Send, 
  Truck, 
  CheckCircle,
  Users,
  RotateCcw,
  ThumbsUp,
  Ship,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../supabase';
import gsap from 'gsap';
import BarChart from '../components/Charts/BarChart';
import PieChart from '../components/Charts/PieChart';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import ExportButton from '../components/ui/ExportButton';

// --- CONFIGURACIÓN DE ESTADOS ---
const ESTADOS_NV = [
  { key: 'Pendiente', label: 'Pendiente', color: '#64748b', bg: 'bg-slate-100', text: 'text-slate-700' },
  { key: 'Aprobada', label: 'Aprobada', color: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-700' },
  { key: 'Pendiente Picking', label: 'Picking', color: '#06b6d4', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { key: 'QUIEBRE_STOCK', label: 'Quiebre', color: '#ef4444', bg: 'bg-red-100', text: 'text-red-700' },
  { key: 'PACKING', label: 'Packing', color: '#6366f1', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { key: 'LISTO_DESPACHO', label: 'Despacho', color: '#a855f7', bg: 'bg-purple-100', text: 'text-purple-700' },
  { key: 'Pendiente Shipping', label: 'Shipping', color: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-700' },
  { key: 'Despachado', label: 'En Ruta', color: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { key: 'ENTREGADO', label: 'Entregado', color: '#059669', bg: 'bg-green-100', text: 'text-green-700' },
  { key: 'Refacturacion', label: 'Refact.', color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700' },
];

// --- COMPONENTES AUXILIARES (DEFINIDOS PRIMERO) ---

const Sparkline = ({ data, color }) => (
  <div className="h-10 w-24 ml-auto opacity-70">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const StatCard = ({ title, value, icon, trend, colorClass, delay, sparklineData, sparklineColor }) => (
  <div className={`stat-card card p-5 relative overflow-hidden group`}>
    <div className="flex justify-between items-start z-10 relative">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-opacity-100 shadow-sm`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      {trend && (
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${colorClass} bg-opacity-10`}>
            {trend}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">vs ayer</span>
        </div>
      )}
      {sparklineData && <Sparkline data={sparklineData} color={sparklineColor || "#94a3b8"} />}
    </div>
    {/* Decoración de fondo */}
    <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-700`}>
      {React.cloneElement(icon, { size: 100 })}
    </div>
  </div>
);

const PipelineStep = ({ label, value, color, icon, isLast }) => (
  <div className="flex-1 flex flex-col items-center relative group">
    <div className={`w-12 h-12 rounded-2xl ${color} text-slate-900 flex items-center justify-center shadow-md mb-3 transform group-hover:scale-110 transition-transform duration-300 z-10`}>
      {icon}
    </div>
    <div className="text-center">
      <span className="block text-xl font-black text-slate-800 leading-none mb-1">{value}</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    </div>
    {!isLast && (
      <div className="hidden md:block absolute top-6 left-1/2 w-full h-[2px] bg-slate-100 -z-0">
        <div className={`h-full ${color.replace('bg-', 'bg-opacity-20 bg-')} w-0 group-hover:w-full transition-all duration-700`}></div>
      </div>
    )}
  </div>
);

// --- COMPONENTE PRINCIPAL DASHBOARD ---
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const dashboardRef = useRef(null);

  // Estados de datos
  const [kpis, setKpis] = useState({
    total: 0,
    pendientes: 0,
    picking: 0,
    packing: 0,
    despacho: 0,
    quiebres: 0,
    refacturacion: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [recentNV, setRecentNV] = useState([]);
  const [conductores, setConductores] = useState({ total: 0, enRuta: 0 });

  // Animación de entrada
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dash-element", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      });
    }, dashboardRef);
    return () => ctx.revert();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Animación del icono de refresco
      gsap.to(".refresh-spin", { rotation: "+=360", duration: 1 });

      // 1. Obtener N.V. Diarias
      const { data: nvData } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .order('fecha_emision', { ascending: false });
        
      const nv = nvData || [];
      
      // Cálculos
      const counts = nv.reduce((acc, curr) => {
        const estado = curr.estado === 'PENDIENTE' ? 'Pendiente' : curr.estado;
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {});

      setKpis({
        total: nv.length,
        pendientes: (counts['Pendiente'] || 0),
        picking: (counts['Pendiente Picking'] || 0),
        packing: (counts['PACKING'] || 0),
        despacho: (counts['LISTO_DESPACHO'] || 0),
        quiebres: (counts['QUIEBRE_STOCK'] || 0),
        refacturacion: (counts['Refacturacion'] || 0)
      });

      // Datos para gráfico (Actividad por hora simulada o por estado)
      const graphData = [
        { name: 'Pendiente', valor: counts['Pendiente'] || 0, fill: '#64748b' },
        { name: 'Picking', valor: counts['Pendiente Picking'] || 0, fill: '#06b6d4' },
        { name: 'Packing', valor: counts['PACKING'] || 0, fill: '#6366f1' },
        { name: 'Despacho', valor: counts['LISTO_DESPACHO'] || 0, fill: '#a855f7' },
        { name: 'En Ruta', valor: counts['Despachado'] || 0, fill: '#10b981' },
      ];
      setChartData(graphData);

      setRecentNV(nv.slice(0, 7));

      // 2. Conductores
      const { data: drivers } = await supabase.from('tms_conductores').select('estado');
      const driversArr = drivers || [];
      setConductores({
        total: driversArr.length,
        enRuta: driversArr.filter(d => d.estado === 'EN_RUTA').length
      });

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    
    // Suscripción simple para actualizar
    const channel = supabase.channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, fetchData)
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const getEstadoBadge = (estado) => {
    const config = ESTADOS_NV.find(e => e.key === (estado === 'PENDIENTE' ? 'Pendiente' : estado)) || ESTADOS_NV[0];
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${config.bg} ${config.text} border border-transparent`}>
        {config.label}
      </span>
    );
  };

  return (
    <div ref={dashboardRef} className="flex flex-col gap-4 max-w-[100vw] overflow-x-hidden">
      
      {/* 1. Header Ultra Compacto */}
      <div className="dash-element flex justify-between items-center card px-6 py-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight">Centro de Control</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              {lastUpdate.toLocaleDateString()} • {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData} 
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300"
            title="Actualizar datos"
          >
            <RefreshCw size={20} className="refresh-spin" />
          </button>
        </div>
      </div>

      {/* 2. KPIs Críticos (Fila Superior) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard 
          title="N.V. Totales" 
          value={kpis.total} 
          icon={<FileText size={24} />} 
          colorClass="text-slate-600 bg-slate-500" 
          trend="+5%"
          sparklineData={[{value: 10}, {value: 12}, {value: 8}, {value: 15}, {value: 18}, {value: 14}, {value: kpis.total}]}
          sparklineColor="#475569"
        />
        <StatCard 
          title="Pendientes" 
          value={kpis.pendientes} 
          icon={<Hourglass size={24} />} 
          colorClass="text-amber-600 bg-amber-500" 
          trend={kpis.pendientes > 10 ? "Atención" : "Normal"}
          sparklineData={[{value: 5}, {value: 8}, {value: 12}, {value: 7}, {value: 10}, {value: 15}, {value: kpis.pendientes}]}
          sparklineColor="#d97706"
        />
        <StatCard 
          title="En Picking" 
          value={kpis.picking} 
          icon={<Hand size={24} />} 
          colorClass="text-cyan-600 bg-cyan-500" 
          trend="Activo"
          sparklineData={[{value: 2}, {value: 5}, {value: 4}, {value: 8}, {value: 10}, {value: 9}, {value: kpis.picking}]}
          sparklineColor="#0891b2"
        />
        <StatCard 
          title="Quiebres" 
          value={kpis.quiebres} 
          icon={<AlertTriangle size={24} />} 
          colorClass="text-red-600 bg-red-500" 
          trend={kpis.quiebres > 0 ? "Crítico" : "Ok"}
          sparklineData={[{value: 0}, {value: 1}, {value: 0}, {value: 2}, {value: 1}, {value: 3}, {value: kpis.quiebres}]}
          sparklineColor="#dc2626"
        />
      </div>

      {/* 3. Sección Central: Pipeline Visual y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline (2/3 ancho) */}
        <div className="dash-element lg:col-span-2 card p-6 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" />
              Flujo Operativo
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Real</span>
          </div>
          
          {/* GRÁFICO UNIFICADO */}
          <div className="mb-8">
             <BarChart data={chartData} dataKey="valor" color="#6366f1" height={220} />
          </div>

          <div className="flex flex-wrap md:flex-nowrap justify-between gap-6 px-4">
            <PipelineStep label="Pendiente" value={kpis.pendientes} color="bg-slate-100 text-slate-600" icon={<Hourglass size={20}/>} />
            <PipelineStep label="Picking" value={kpis.picking} color="bg-cyan-50 text-cyan-600" icon={<Hand size={20}/>} />
            <PipelineStep label="Packing" value={kpis.packing} color="bg-indigo-50 text-indigo-600" icon={<Box size={20}/>} />
            <PipelineStep label="Despacho" value={kpis.despacho} color="bg-purple-50 text-purple-600" icon={<Send size={20}/>} />
            <PipelineStep label="En Ruta" value={conductores.enRuta} color="bg-emerald-50 text-emerald-600" icon={<Truck size={20}/>} isLast={true} />
          </div>
        </div>

        {/* Panel Lateral: Alertas y Resumen (1/3 ancho) */}
        <div className="dash-element flex flex-col gap-6">
          <div className="card p-6 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
                <RotateCcw size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Refacturación</p>
                <p className="text-sm font-bold text-slate-900">Requiere Acción</p>
              </div>
            </div>
            <span className="text-3xl font-black text-red-500">{kpis.refacturacion}</span>
          </div>

          <div className="card p-6 flex items-center justify-between group flex-1">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conductores</p>
                <p className="text-sm font-bold text-slate-900">{conductores.total - conductores.enRuta} Libres</p>
              </div>
            </div>
            <span className="text-3xl font-black text-blue-500">{conductores.total}</span>
          </div>
        </div>
      </div>

      {/* 4. Tabla de Actividad Reciente */}
      <div className="dash-element card overflow-hidden flex-1 min-h-[400px]">
        <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Últimas Notas de Venta</h3>
          <div className="flex items-center gap-4">
            <ExportButton data={recentNV} filename="nv_recientes" />
            <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1 transition-colors">
              Ver todas <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-8 py-4 text-left">N.V.</th>
                <th className="px-8 py-4 text-left">Cliente</th>
                <th className="px-8 py-4 text-center">Estado</th>
                <th className="px-8 py-4 text-right">Cantidad</th>
                <th className="px-8 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {recentNV.map((nv, i) => (
                <tr key={i} className="hover:bg-orange-50/50 transition-all duration-200 group">
                  <td className="px-8 py-5 font-black text-indigo-600">#{nv.nv}</td>
                  <td className="px-8 py-5 text-slate-600 font-bold">{nv.cliente}</td>
                  <td className="px-8 py-5 text-center">
                    {getEstadoBadge(nv.estado)}
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-black text-slate-400">
                    {nv.cantidad} <span className="text-[10px] uppercase">un.</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button className="p-2 text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-xl transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {recentNV.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                    No hay actividad reciente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
