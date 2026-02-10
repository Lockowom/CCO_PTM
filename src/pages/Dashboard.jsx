import React, { useState, useEffect } from 'react';
import { Package, Truck, AlertCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({ entregas: 0, pendientes: 0, enRuta: 0, entregados: 0 });
  const [recentEntregas, setRecentEntregas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tms_entregas')
        .select('*')
        .order('fecha_creacion', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const pendientes = data.filter(d => d.estado === 'PENDIENTE').length;
      const enRuta = data.filter(d => d.estado === 'EN_RUTA').length;
      const entregados = data.filter(d => d.estado === 'ENTREGADO').length;
      
      setStats({
        entregas: data.length,
        pendientes,
        enRuta,
        entregados
      });
      setRecentEntregas(data.slice(0, 8)); 
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Pendientes', valor: stats.pendientes, color: '#f97316' },
    { name: 'En Ruta', valor: stats.enRuta, color: '#3b82f6' },
    { name: 'Entregados', valor: stats.entregados, color: '#10b981' }
  ];

  const pieData = [
    { name: 'A Tiempo', value: 400, color: '#10b981' },
    { name: 'Retrasados', value: 30, color: '#ef4444' },
    { name: 'En Proceso', value: 300, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Torre de Control</h2>
          <p className="text-slate-500 text-sm">Resumen operativo en tiempo real</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm flex items-center gap-2">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           Actualizado: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Entregas" 
          value={stats.entregas} 
          icon={<Package className="text-blue-600" />} 
          trend="+12% vs ayer" 
          trendUp={true}
          bg="bg-blue-50"
          border="border-blue-100"
        />
        <StatCard 
          title="Pendientes" 
          value={stats.pendientes} 
          icon={<AlertCircle className="text-orange-600" />} 
          trend="-5% vs ayer" 
          trendUp={true} // Less pending is good
          bg="bg-orange-50"
          border="border-orange-100"
        />
        <StatCard 
          title="En Ruta" 
          value={stats.enRuta} 
          icon={<Truck className="text-indigo-600" />} 
          trend="8 camiones activos"
          bg="bg-indigo-50"
          border="border-indigo-100"
        />
        <StatCard 
          title="Completados" 
          value={stats.entregados} 
          icon={<CheckCircle className="text-emerald-600" />} 
          trend="98% efectividad"
          bg="bg-emerald-50"
          border="border-emerald-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-slate-400" />
            Flujo de Entregas
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart / Side Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Efectividad</h3>
          <p className="text-sm text-slate-500 mb-6">Cumplimiento de ventanas horarias</p>
          
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-bold text-slate-800">92%</span>
              <span className="text-xs text-slate-400">On Time</span>
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
             {pieData.map((item, i) => (
               <div key={i} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                   <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
                   <span className="text-slate-600">{item.name}</span>
                 </div>
                 <span className="font-semibold text-slate-800">{item.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Recent Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Actividad Reciente</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Ver todo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">N.V. / ID</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEntregas.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{e.nv}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{e.cliente}</span>
                      <span className="text-xs text-slate-400">{e.direccion || 'Sin dirección'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(e.fecha_creacion).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={e.estado} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
              {recentEntregas.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    No hay datos recientes disponibles.
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

// Helper Components
function StatCard({ title, value, icon, trend, trendUp, bg, border }) {
  return (
    <div className={`p-6 rounded-xl border ${bg} ${border} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'PENDIENTE': 'bg-orange-100 text-orange-700 border-orange-200',
    'EN_RUTA': 'bg-blue-100 text-blue-700 border-blue-200',
    'ENTREGADO': 'bg-green-100 text-green-700 border-green-200',
    'FALLIDO': 'bg-red-100 text-red-700 border-red-200'
  };
  
  const config = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config}`}>
      {status}
    </span>
  );
}

export default Dashboard;