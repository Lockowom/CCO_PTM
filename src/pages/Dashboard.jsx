import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { 
  Package, 
  Truck, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  RefreshCw,
  FileText,
  Hand,
  Box,
  Send,
  Ship,
  ThumbsUp,
  Hourglass,
  RotateCcw,
  Users,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { supabase } from '../supabase';
import gsap from 'gsap';

// Configuración de estados
const ESTADOS_NV = [
  { key: 'Pendiente', label: 'Pendiente', color: '#64748b', icon: Hourglass },
  { key: 'Aprobada', label: 'Aprobada', color: '#f59e0b', icon: ThumbsUp },
  { key: 'Pendiente Picking', label: 'Picking', color: '#06b6d4', icon: Hand },
  { key: 'QUIEBRE_STOCK', label: 'Quiebre Stock', color: '#ef4444', icon: AlertCircle },
  { key: 'PACKING', label: 'Packing', color: '#6366f1', icon: Box },
  { key: 'LISTO_DESPACHO', label: 'Listo Despacho', color: '#a855f7', icon: Send },
  { key: 'Pendiente Shipping', label: 'Shipping', color: '#3b82f6', icon: Ship },
  { key: 'Despachado', label: 'Despachado', color: '#10b981', icon: Truck },
  { key: 'Refacturacion', label: 'Refacturación', color: '#f97316', icon: RotateCcw },
];

// Componentes Auxiliares Compactos (Definidos antes para evitar problemas de hoisting/scope)
const KPICardCompact = ({ title, value, icon, color, subtitle, trend, alert }) => {
  const colors = {
    slate: 'text-slate-600 bg-slate-50',
    amber: 'text-amber-600 bg-amber-50',
    cyan: 'text-cyan-600 bg-cyan-50',
    red: 'text-red-600 bg-red-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50'
  };

  return (
    <div className={`bg-white p-4 rounded-2xl border ${alert ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} shadow-sm flex items-center justify-between transition-all hover:shadow-md`}>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
        <h4 className="text-2xl font-black text-slate-800">{value}</h4>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colors[color] || colors.slate}`}>
        {icon}
      </div>
    </div>
  );
};

const PipelineStep = ({ label, value, color, icon }) => (
  <div className="flex flex-col items-center gap-2 z-10">
    <div className={`w-10 h-10 rounded-full ${color} text-white flex items-center justify-center shadow-lg border-4 border-white transition-transform hover:scale-110`}>
      {icon}
    </div>
    <div className="text-center">
      <p className="text-lg font-black text-slate-800 leading-none">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Stats de N.V.
  const [nvStats, setNvStats] = useState({
    total: 0,
    pendiente: 0,
    aprobada: 0,
    picking: 0,
    quiebreStock: 0,
    packing: 0,
    listoDespacho: 0,
    shipping: 0,
    despachado: 0,
    refacturacion: 0
  });
  
  // Stats de conductores
  const [conductoresStats, setConductoresStats] = useState({
    total: 0,
    enRuta: 0,
    disponibles: 0
  });
  
  // Stats de entregas
  const [entregasStats, setEntregasStats] = useState({
    total: 0,
    entregadas: 0,
    pendientes: 0,
    rechazadas: 0
  });

  // Datos para gráficos
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentNV, setRecentNV] = useState([]);

  // Refs para animaciones
  const dashboardRef = useRef(null);

  // Animación Inicial
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Header
      gsap.from(".dash-header", { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" });
      
      // KPI Cards Row 1
      gsap.from(".kpi-card", { 
        y: 30, 
        opacity: 0, 
        duration: 0.6, 
        stagger: 0.05, 
        delay: 0.2,
        ease: "back.out(1.2)" 
      });

      // KPI Cards Row 2 (Large cards)
      gsap.from(".stat-card", { 
        scale: 0.9, 
        opacity: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        delay: 0.5,
        ease: "power2.out" 
      });

      // Charts
      gsap.from(".chart-container", { 
        y: 40, 
        opacity: 0, 
        duration: 0.8, 
        stagger: 0.2, 
        delay: 0.7,
        ease: "power3.out" 
      });

      // Table
      gsap.from(".recent-table", { 
        y: 40, 
        opacity: 0, 
        duration: 0.8, 
        delay: 0.9,
        ease: "power3.out" 
      });

    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  // Fetch de todos los datos
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Animate refresh icon
      gsap.to(".refresh-icon", { rotation: 360, duration: 1, repeat: 1 });

      // 1. Cargar N.V.
      const { data: nvData } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .order('fecha_emision', { ascending: false });

      const nv = nvData || [];
      
      // Contar por estado (incluir PENDIENTE mayúsculas)
      const pendiente = nv.filter(n => n.estado === 'Pendiente' || n.estado === 'PENDIENTE').length;
      const aprobada = nv.filter(n => n.estado === 'Aprobada').length;
      const picking = nv.filter(n => n.estado === 'Pendiente Picking').length;
      const quiebreStock = nv.filter(n => n.estado === 'QUIEBRE_STOCK').length;
      const packing = nv.filter(n => n.estado === 'PACKING').length;
      const listoDespacho = nv.filter(n => n.estado === 'LISTO_DESPACHO').length;
      const shipping = nv.filter(n => n.estado === 'Pendiente Shipping').length;
      const despachado = nv.filter(n => n.estado === 'Despachado').length;
      const refacturacion = nv.filter(n => n.estado === 'Refacturacion').length;

      setNvStats({
        total: nv.length,
        pendiente,
        aprobada,
        picking,
        quiebreStock,
        packing,
        listoDespacho,
        shipping,
        despachado,
        refacturacion
      });

      // Datos para gráfico de barras (flujo operativo)
      setChartData([
        { name: 'Pendiente', valor: pendiente, color: '#64748b' },
        { name: 'Aprobada', valor: aprobada, color: '#f59e0b' },
        { name: 'Picking', valor: picking, color: '#06b6d4' },
        { name: 'Quiebre Stock', valor: quiebreStock, color: '#ef4444' },
        { name: 'Packing', valor: packing, color: '#6366f1' },
        { name: 'Despacho', valor: listoDespacho, color: '#a855f7' },
        { name: 'Shipping', valor: shipping, color: '#3b82f6' },
        { name: 'Despachado', valor: despachado, color: '#10b981' },
      ]);

      // Datos para pie (distribución)
      const enProceso = pendiente + aprobada + picking + packing + listoDespacho + shipping + quiebreStock;
      setPieData([
        { name: 'En Proceso', value: enProceso, color: '#3b82f6' },
        { name: 'Quiebre Stock', value: quiebreStock, color: '#ef4444' },
        { name: 'Despachados', value: despachado, color: '#10b981' },
        { name: 'Refacturación', value: refacturacion, color: '#f97316' },
      ]);

      // N.V. recientes
      setRecentNV(nv.slice(0, 8));

      // 2. Cargar Conductores
      const { data: conductoresData } = await supabase
        .from('tms_conductores')
        .select('*');

      const conductores = conductoresData || [];
      setConductoresStats({
        total: conductores.length,
        enRuta: conductores.filter(c => c.estado === 'EN_RUTA').length,
        disponibles: conductores.filter(c => c.estado === 'DISPONIBLE').length
      });

      // 3. Cargar Entregas
      const { data: entregasData } = await supabase
        .from('tms_entregas')
        .select('*');

      const entregas = entregasData || [];
      setEntregasStats({
        total: entregas.length,
        entregadas: entregas.filter(e => e.estado === 'ENTREGADO').length,
        pendientes: entregas.filter(e => e.estado === 'PENDIENTE' || e.estado === 'EN_RUTA').length,
        rechazadas: entregas.filter(e => e.estado === 'RECHAZADO').length
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos y suscribirse a cambios
  useEffect(() => {
    fetchAllData();

    // Auto-refresh cada 30 segundos
    const interval = setInterval(fetchAllData, 30000);

    // Suscripción Realtime
    const channel = supabase
      .channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => {
        console.log('📊 Dashboard: N.V. actualizada');
        // Flash animation for update
        gsap.fromTo(".dash-header", { backgroundColor: "#d1fae5" }, { backgroundColor: "transparent", duration: 0.5 });
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_conductores' }, () => {
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_entregas' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  // Obtener config de estado
  const getEstadoConfig = (estado) => {
    const normalized = estado === 'PENDIENTE' ? 'Pendiente' : estado;
    return ESTADOS_NV.find(e => e.key === normalized) || ESTADOS_NV[0];
  };

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* Header Compacto */}
      <div className="dash-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Activity className="text-indigo-600" />
            Dashboard Operacional
          </h2>
          <p className="text-slate-500 text-xs font-medium">Vista general del Centro de Control</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Clock size={14} className="text-slate-400" />
            <span className="text-slate-600">Actualizado: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={fetchAllData}
            disabled={loading}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin refresh-icon' : 'refresh-icon'} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Grid Principal - Bento Box Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        
        {/* Columna 1: KPIs Principales (Vertical) */}
        <div className="space-y-4 md:col-span-1">
          <KPICardCompact 
            title="Total N.V." 
            value={nvStats.total} 
            icon={<FileText size={18} />} 
            color="slate"
            trend="+12%"
          />
          <KPICardCompact 
            title="Pendientes" 
            value={nvStats.pendiente} 
            icon={<Hourglass size={18} />} 
            color="amber"
            subtitle="Por aprobar"
          />
          <KPICardCompact 
            title="En Picking" 
            value={nvStats.picking} 
            icon={<Hand size={18} />} 
            color="cyan"
          />
          <KPICardCompact 
            title="Quiebre Stock" 
            value={nvStats.quiebreStock} 
            icon={<AlertCircle size={18} />} 
            color="red"
            alert={nvStats.quiebreStock > 0}
          />
        </div>

        {/* Columna 2 y 3: Gráfico Principal y Pipeline */}
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-3 space-y-4">
          {/* Pipeline Visual */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[140px]">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Flujo de Pedidos</h3>
            <div className="flex items-center justify-between relative px-4">
              {/* Línea conectora */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
              
              <PipelineStep label="Pendiente" value={nvStats.pendiente} color="bg-slate-500" icon={<Hourglass size={14}/>} />
              <PipelineStep label="Picking" value={nvStats.picking} color="bg-cyan-500" icon={<Hand size={14}/>} />
              <PipelineStep label="Packing" value={nvStats.packing} color="bg-indigo-500" icon={<Box size={14}/>} />
              <PipelineStep label="Despacho" value={nvStats.listoDespacho} color="bg-purple-500" icon={<Send size={14}/>} />
              <PipelineStep label="En Ruta" value={entregasStats.pendientes} color="bg-blue-500" icon={<Truck size={14}/>} />
              <PipelineStep label="Entregado" value={entregasStats.entregadas} color="bg-emerald-500" icon={<CheckCircle size={14}/>} />
            </div>
          </div>

          {/* Gráfico Principal */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-[340px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Actividad Diaria</h3>
              <div className="flex gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> N.V.</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorNv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="valor" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Columna 4: Stats Operativos (Conductores/Entregas) */}
        <div className="md:col-span-3 lg:col-span-4 xl:col-span-1 grid grid-cols-2 xl:grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={80} className="text-blue-600" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Conductores</p>
            <div className="flex items-end gap-2">
              <h3 className="text-4xl font-black text-slate-800">{conductoresStats.total}</h3>
              <span className="text-sm font-bold text-emerald-600 mb-1.5">{conductoresStats.enRuta} en ruta</span>
            </div>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(conductoresStats.enRuta / conductoresStats.total) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Truck size={80} className="text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Entregas Hoy</p>
            <div className="flex items-end gap-2">
              <h3 className="text-4xl font-black text-slate-800">{entregasStats.entregadas}</h3>
              <span className="text-sm font-bold text-slate-400 mb-1.5">/ {entregasStats.total}</span>
            </div>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(entregasStats.entregadas / entregasStats.total) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group col-span-2 xl:col-span-1">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle size={80} className="text-red-600" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Refacturación</p>
            <h3 className="text-4xl font-black text-red-600">{nvStats.refacturacion}</h3>
            <p className="text-xs text-slate-500 mt-1">Requieren atención inmediata</p>
          </div>
        </div>
      </div>

      {/* Fila Inferior: Tabla Reciente y Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tabla Compacta */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Actividad Reciente</h3>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Ver Todo</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3 text-left">N.V.</th>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                  <th className="px-6 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentNV.map((nv, i) => {
                  const config = getEstadoConfig(nv.estado);
                  return (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-bold text-indigo-600">#{nv.nv}</td>
                      <td className="px-6 py-3 text-slate-600 font-medium truncate max-w-[180px]">{nv.cliente}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2`} style={{backgroundColor: config.color}}></span>
                        <span className="text-xs font-bold text-slate-600">{config.label}</span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-slate-500">{nv.cantidad} un.</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Donut Chart Compacto */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center">
          <h3 className="font-bold text-slate-800 mb-4 self-start w-full">Distribución</h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-black text-slate-800">{nvStats.total}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
            </div>
          </div>
          <div className="w-full mt-4 space-y-2">
            {pieData.slice(0, 3).map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
