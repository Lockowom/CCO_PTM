import React, { useRef, useLayoutEffect } from 'react';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ExportButton from '../components/ui/ExportButton';
import useRealtimeTable from '../hooks/useRealtimeTable';
import { ESTADOS_CONFIG, getEstadoConfig } from '../constants/estados';

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
  <div className={`stat-card card p-3.5 sm:p-5 relative overflow-hidden group`}>
    <div className="flex justify-between items-start z-10 relative">
      <div>
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
      <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${colorClass} bg-opacity-10 text-opacity-100 shadow-sm flex-shrink-0`}>
        {React.cloneElement(icon, { size: 18, className: 'sm:hidden' })}
        {React.cloneElement(icon, { size: 24, className: 'hidden sm:block' })}
      </div>
    </div>
    <div className="mt-3 sm:mt-4 flex items-center justify-between">
      {trend && (
        <div className="flex items-center gap-1">
          <span className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-lg ${colorClass} bg-opacity-10`}>
            {trend}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase hidden sm:inline">vs ayer</span>
        </div>
      )}
      {sparklineData && <div className="hidden sm:block"><Sparkline data={sparklineData} color={sparklineColor || "#94a3b8"} /></div>}
    </div>
    {/* Decoración de fondo */}
    <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-700`}>
      {React.cloneElement(icon, { size: 100 })}
    </div>
  </div>
);

const PipelineStep = ({ label, value, color, icon, isLast }) => (
  <div className="flex-1 flex flex-col items-center relative group min-w-[55px]">
    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${color} text-slate-900 flex items-center justify-center shadow-md mb-2 sm:mb-3 transform group-hover:scale-110 transition-transform duration-300 z-10`}>
      {React.cloneElement(icon, { size: 16, className: 'sm:hidden' })}
      {React.cloneElement(icon, { size: 20, className: 'hidden sm:block' })}
    </div>
    <div className="text-center">
      <span className="block text-base sm:text-xl font-black text-slate-800 leading-none mb-0.5 sm:mb-1">{value}</span>
      <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
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
  const queryClient = useQueryClient();
  const dashboardRef = useRef(null);

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

  const { data: dashData, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['dashboard_kpis'],
    queryFn: async () => {
      const { data: nvData } = await supabase
        .from('tms_nv_diarias')
        .select('nv, estado, fecha_emision, cliente, cantidad')
        .order('fecha_emision', { ascending: false });

      const nv = nvData || [];

      const counts = nv.reduce((acc, curr) => {
        const estado = curr.estado === 'PENDIENTE' ? 'Pendiente' : curr.estado;
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {});

      const kpis = {
        total: nv.length,
        pendientes: counts['Pendiente'] || 0,
        picking: counts['Pendiente Picking'] || 0,
        packing: counts['PACKING'] || 0,
        despacho: counts['LISTO_DESPACHO'] || 0,
        quiebres: counts['QUIEBRE_STOCK'] || 0,
        refacturacion: counts['Refacturacion'] || 0
      };

      const chartData = [
        { name: 'Pendiente', valor: counts['Pendiente'] || 0, fill: '#64748b' },
        { name: 'Picking', valor: counts['Pendiente Picking'] || 0, fill: '#06b6d4' },
        { name: 'Packing', valor: counts['PACKING'] || 0, fill: '#6366f1' },
        { name: 'Despacho', valor: counts['LISTO_DESPACHO'] || 0, fill: '#a855f7' },
        { name: 'En Ruta', valor: counts['Despachado'] || 0, fill: '#10b981' },
      ];

      const recentNV = nv.slice(0, 7);

      const { data: drivers } = await supabase.from('tms_conductores').select('estado');
      const driversArr = drivers || [];

      return {
        kpis,
        chartData,
        recentNV,
        conductores: {
          total: driversArr.length,
          enRuta: driversArr.filter(d => d.estado === 'EN_RUTA').length
        }
      };
    },
    refetchInterval: 30000,
  });

  const kpis = dashData?.kpis || { total: 0, pendientes: 0, picking: 0, packing: 0, despacho: 0, quiebres: 0, refacturacion: 0 };
  const chartData = dashData?.chartData || [];
  const recentNV = dashData?.recentNV || [];
  const conductores = dashData?.conductores || { total: 0, enRuta: 0 };
  const lastUpdate = new Date();

  useRealtimeTable('tms_nv_diarias', ['dashboard_kpis']);

  const getEstadoBadge = (estado) => {
    const config = getEstadoConfig(estado);
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${config.lightBg} ${config.textColor} border border-transparent`}>
        {config.label}
      </span>
    );
  };

  return (
    <div ref={dashboardRef} className="flex flex-col gap-4 max-w-[100vw] overflow-x-hidden">
      
      {/* 1. Header Ultra Compacto */}
      <div className="dash-element flex justify-between items-center card px-4 sm:px-6 py-3 sm:py-4 mb-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-white shadow-lg shadow-indigo-100 flex-shrink-0">
            <Activity size={18} className="sm:hidden" />
            <Activity size={22} className="hidden sm:block" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 leading-tight tracking-tight">Centro de Control</h1>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* Pipeline (2/3 ancho) */}
        <div className="dash-element lg:col-span-2 card p-4 sm:p-6 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-4 sm:mb-8">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" />
              Flujo Operativo
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Real</span>
          </div>
          
          {/* GRÁFICO UNIFICADO */}
          <div className="mb-8">
             <ResponsiveContainer width="100%" height={220}>
               <ReBarChart data={chartData} barSize={36} radius={[8, 8, 0, 0]}>
                 <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                 <YAxis hide />
                 <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                 <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                   {chartData.map((entry, index) => (
                     <Cell key={index} fill={entry.fill} />
                   ))}
                 </Bar>
               </ReBarChart>
             </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap md:flex-nowrap justify-between gap-3 sm:gap-6 px-0 sm:px-4">
            <PipelineStep label="Pendiente" value={kpis.pendientes} color="bg-slate-100 text-slate-600" icon={<Hourglass size={20}/>} />
            <PipelineStep label="Picking" value={kpis.picking} color="bg-cyan-50 text-cyan-600" icon={<Hand size={20}/>} />
            <PipelineStep label="Packing" value={kpis.packing} color="bg-indigo-50 text-indigo-600" icon={<Box size={20}/>} />
            <PipelineStep label="Despacho" value={kpis.despacho} color="bg-purple-50 text-purple-600" icon={<Send size={20}/>} />
            <PipelineStep label="En Ruta" value={conductores.enRuta} color="bg-emerald-50 text-emerald-600" icon={<Truck size={20}/>} isLast={true} />
          </div>
        </div>

        {/* Panel Lateral: Alertas y Resumen (1/3 ancho) */}
        <div className="dash-element grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-6">
          <div className="card p-4 sm:p-6 flex items-center justify-between group">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-red-50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-red-500 group-hover:scale-110 transition-transform flex-shrink-0">
                <RotateCcw size={18} />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider sm:tracking-widest mb-0.5 sm:mb-1">Refacturación</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">Requiere Acción</p>
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-red-500">{kpis.refacturacion}</span>
          </div>

          <div className="card p-4 sm:p-6 flex items-center justify-between group flex-1">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-blue-500 group-hover:scale-110 transition-transform flex-shrink-0">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider sm:tracking-widest mb-0.5 sm:mb-1">Conductores</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">{conductores.total - conductores.enRuta} Libres</p>
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-blue-500">{conductores.total}</span>
          </div>
        </div>
      </div>

      {/* 4. Tabla de Actividad Reciente */}
      <div className="dash-element card overflow-hidden flex-1 min-h-[300px] sm:min-h-[400px]">
        <div className="px-4 sm:px-8 py-3 sm:py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider sm:tracking-widest">Últimas N.V.</h3>
          <div className="flex items-center gap-2 sm:gap-4">
            <ExportButton data={recentNV} filename="nv_recientes" />
            <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1 transition-colors hidden sm:flex">
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
