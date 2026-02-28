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
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { supabase } from '../supabase';
import gsap from 'gsap';

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
  { key: 'Refacturacion', label: 'Refact.', color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700' },
];

// --- COMPONENTES AUXILIARES (DEFINIDOS PRIMERO) ---

const StatCard = ({ title, value, icon, trend, colorClass, delay }) => (
  <div className={`stat-card bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
    <div className="flex justify-between items-start z-10 relative">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center gap-1.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colorClass} bg-opacity-10`}>
          {trend}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">vs ayer</span>
      </div>
    )}
    {/* Decoración de fondo */}
    <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500`}>
      {React.cloneElement(icon, { size: 80 })}
    </div>
  </div>
);

const PipelineStep = ({ label, value, color, icon, isLast }) => (
  <div className="flex-1 flex flex-col items-center relative group">
    <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-md mb-3 transform group-hover:scale-110 transition-transform duration-300 z-10`}>
      {icon}
    </div>
    <div className="text-center">
      <span className="block text-xl font-black text-slate-800 leading-none mb-1">{value}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
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
        { name: 'Pend.', valor: counts['Pendiente'] || 0, fill: '#64748b' },
        { name: 'Pick', valor: counts['Pendiente Picking'] || 0, fill: '#06b6d4' },
        { name: 'Pack', valor: counts['PACKING'] || 0, fill: '#6366f1' },
        { name: 'Desp.', valor: counts['LISTO_DESPACHO'] || 0, fill: '#a855f7' },
        { name: 'Ruta', valor: counts['Despachado'] || 0, fill: '#10b981' },
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
      <div className="dash-element flex justify-between items-center bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-tight">Centro de Control</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {lastUpdate.toLocaleDateString()} • {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData} 
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw size={18} className="refresh-spin" />
          </button>
        </div>
      </div>

      {/* 2. KPIs Críticos (Fila Superior) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="N.V. Totales" 
          value={kpis.total} 
          icon={<FileText size={20} />} 
          colorClass="text-slate-600 bg-slate-500" 
          trend="+5%"
        />
        <StatCard 
          title="Pendientes" 
          value={kpis.pendientes} 
          icon={<Hourglass size={20} />} 
          colorClass="text-amber-600 bg-amber-500" 
          trend={kpis.pendientes > 10 ? "Atención" : "Normal"}
        />
        <StatCard 
          title="En Picking" 
          value={kpis.picking} 
          icon={<Hand size={20} />} 
          colorClass="text-cyan-600 bg-cyan-500" 
          trend="Activo"
        />
        <StatCard 
          title="Quiebres" 
          value={kpis.quiebres} 
          icon={<AlertTriangle size={20} />} 
          colorClass="text-red-600 bg-red-500" 
          trend={kpis.quiebres > 0 ? "Crítico" : "Ok"}
        />
      </div>

      {/* 3. Sección Central: Pipeline Visual y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline (2/3 ancho) */}
        <div className="dash-element lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" />
              Flujo Operativo
            </h3>
            <span className="text-xs font-medium text-slate-400">Tiempo Real</span>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap justify-between gap-4 px-2">
            <PipelineStep label="Pendiente" value={kpis.pendientes} color="bg-slate-500" icon={<Hourglass size={20}/>} />
            <PipelineStep label="Picking" value={kpis.picking} color="bg-cyan-500" icon={<Hand size={20}/>} />
            <PipelineStep label="Packing" value={kpis.packing} color="bg-indigo-500" icon={<Box size={20}/>} />
            <PipelineStep label="Despacho" value={kpis.despacho} color="bg-purple-500" icon={<Send size={20}/>} />
            <PipelineStep label="En Ruta" value={conductores.enRuta} color="bg-emerald-500" icon={<Truck size={20}/>} isLast={true} />
          </div>
        </div>

        {/* Panel Lateral: Alertas y Resumen (1/3 ancho) */}
        <div className="dash-element bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm text-red-500">
                <RotateCcw size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-red-800 uppercase">Refacturación</p>
                <p className="text-[10px] text-red-600 font-medium">Requiere acción</p>
              </div>
            </div>
            <span className="text-2xl font-black text-red-600">{kpis.refacturacion}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg flex-1">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm text-blue-500">
                <Users size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800 uppercase">Conductores</p>
                <p className="text-[10px] text-blue-600 font-medium">{conductores.total - conductores.enRuta} disponibles</p>
              </div>
            </div>
            <span className="text-2xl font-black text-blue-600">{conductores.total}</span>
          </div>
        </div>
      </div>

      {/* 4. Tabla de Actividad Reciente */}
      <div className="dash-element bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 min-h-[300px]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Últimas Notas de Venta</h3>
          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-3 text-left">N.V.</th>
                <th className="px-6 py-3 text-left">Cliente</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-right">Monto</th>
                <th className="px-6 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentNV.map((nv, i) => (
                <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-3 font-bold text-indigo-600">#{nv.nv}</td>
                  <td className="px-6 py-3 text-slate-600 font-medium">{nv.cliente}</td>
                  <td className="px-6 py-3 text-center">
                    {getEstadoBadge(nv.estado)}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-slate-500">
                    {nv.cantidad} un.
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {recentNV.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">
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
