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

  // Calcular porcentaje de efectividad
  const efectividad = nvStats.total > 0 
    ? Math.round((nvStats.despachado / nvStats.total) * 100) 
    : 0;

  // Obtener config de estado
  const getEstadoConfig = (estado) => {
    const normalized = estado === 'PENDIENTE' ? 'Pendiente' : estado;
    return ESTADOS_NV.find(e => e.key === normalized) || ESTADOS_NV[0];
  };

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* Header */}
      <div className="dash-header flex justify-between items-end p-2 -m-2 rounded-xl transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Operacional</h2>
          <p className="text-slate-500 text-sm">Resumen en tiempo real de la operación</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {lastUpdate.toLocaleTimeString()}
          </div>
          <button 
            onClick={fetchAllData}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <RefreshCw size={16} className="refresh-icon" />
            Actualizar
          </button>
        </div>
      </div>

      {/* KPI Cards - Fila Principal */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard 
          title="Total N.V." 
          value={nvStats.total}
          icon={<FileText className="text-slate-600" size={20} />}
          color="slate"
        />
        <KPICard 
          title="Pendientes" 
          value={nvStats.pendiente}
          icon={<Hourglass className="text-slate-600" size={20} />}
          color="slate"
          subtitle="Por aprobar"
        />
        <KPICard 
          title="En Picking" 
          value={nvStats.picking}
          icon={<Hand className="text-cyan-600" size={20} />}
          color="cyan"
        />
        <KPICard 
          title="Quiebre Stock" 
          value={nvStats.quiebreStock}
          icon={<AlertCircle className="text-red-600" size={20} />}
          color="red"
        />
        <KPICard 
          title="En Packing" 
          value={nvStats.packing}
          icon={<Box className="text-indigo-600" size={20} />}
          color="indigo"
        />
        <KPICard 
          title="Listo Despacho" 
          value={nvStats.listoDespacho + nvStats.shipping}
          icon={<Send className="text-purple-600" size={20} />}
          color="purple"
        />
        <KPICard 
          title="Despachados" 
          value={nvStats.despachado}
          icon={<Truck className="text-emerald-600" size={20} />}
          color="emerald"
          trend={`${efectividad}%`}
          trendUp={efectividad > 50}
        />
      </div>

      {/* Segunda fila de KPIs - Entregas y Conductores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow cursor-default">
          <div className="flex justify-between items-start mb-3">
            <Users size={24} className="opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{conductoresStats.enRuta} en ruta</span>
          </div>
          <p className="text-3xl font-bold">{conductoresStats.total}</p>
          <p className="text-sm opacity-80">Conductores</p>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow cursor-default">
          <div className="flex justify-between items-start mb-3">
            <CheckCircle size={24} className="opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight size={12} /> {entregasStats.total > 0 ? Math.round((entregasStats.entregadas / entregasStats.total) * 100) : 0}%
            </span>
          </div>
          <p className="text-3xl font-bold">{entregasStats.entregadas}</p>
          <p className="text-sm opacity-80">Entregas Completadas</p>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow cursor-default">
          <div className="flex justify-between items-start mb-3">
            <Clock size={24} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{entregasStats.pendientes}</p>
          <p className="text-sm opacity-80">Entregas Pendientes</p>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-red-500 to-red-600 p-5 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow cursor-default">
          <div className="flex justify-between items-start mb-3">
            <AlertCircle size={24} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{nvStats.refacturacion}</p>
          <p className="text-sm opacity-80">Refacturación</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Barras - Flujo Operativo */}
        <div className="chart-container lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-500" />
                Flujo de Notas de Venta
              </h3>
              <p className="text-sm text-slate-500">Distribución por estado en el proceso</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                    padding: '12px 16px'
                  }}
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value) => [`${value} N.V.`, 'Cantidad']}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Pie - Distribución */}
        <div className="chart-container bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Distribución General</h3>
          <p className="text-sm text-slate-500 mb-4">Estado actual de todas las N.V.</p>
          
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} N.V.`, '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{nvStats.total}</span>
              <span className="text-xs text-slate-400">Total</span>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Actividad Reciente */}
      <div className="recent-table bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-indigo-500" />
            <div>
              <h3 className="font-bold text-slate-800">Notas de Venta Recientes</h3>
              <p className="text-xs text-slate-500">Últimas N.V. en el sistema</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left font-medium">N.V.</th>
                <th className="px-5 py-3 text-left font-medium">Fecha</th>
                <th className="px-5 py-3 text-left font-medium">Cliente</th>
                <th className="px-5 py-3 text-left font-medium">Producto</th>
                <th className="px-5 py-3 text-right font-medium">Cantidad</th>
                <th className="px-5 py-3 text-center font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentNV.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                recentNV.map((nv, index) => {
                  const config = getEstadoConfig(nv.estado);
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-bold text-indigo-600">#{nv.nv}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">
                        {nv.fecha_emision ? new Date(nv.fecha_emision).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-700 truncate max-w-[150px]">{nv.cliente}</p>
                        <p className="text-xs text-slate-400">{nv.vendedor}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs text-slate-600">{nv.codigo_producto}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-800">
                        {nv.cantidad} <span className="text-slate-400 font-normal text-xs">{nv.unidad}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ 
                            backgroundColor: `${config.color}15`,
                            color: config.color,
                            border: `1px solid ${config.color}30`
                          }}
                        >
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente KPI Card
function KPICard({ title, value, icon, color, subtitle, trend, trendUp }) {
  const colorClasses = {
    slate: 'bg-slate-50 border-slate-200',
    cyan: 'bg-cyan-50 border-cyan-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    purple: 'bg-purple-50 border-purple-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`kpi-card p-4 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-md hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
            trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{title}</p>
      {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
    </div>
  );
}

export default Dashboard;
