import React, { useState, useEffect } from 'react';
import { 
  BarChart, Calendar, User, Clock, CheckCircle, 
  TrendingUp, Activity, Filter, Download
} from 'lucide-react';
import { supabase } from '../../supabase';
import BarChartComponent from '../../components/Charts/BarChart';
import { toast } from 'sonner';

const Productivity = () => {
  const [dateRange, setDateRange] = useState('WEEK'); // TODAY, WEEK, MONTH
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    topPicker: { name: '-', value: 0 },
    bestAccuracy: { name: '-', value: 100 },
    teamAverage: { value: 0, growth: 0 }
  });

  useEffect(() => {
    fetchProductivity();
  }, [dateRange]);

  const fetchProductivity = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tms_mediciones_tiempos')
        .select('*')
        .eq('estado', 'COMPLETADO');

      // Filtro de fecha
      const now = new Date();
      let startDate = new Date();
      
      if (dateRange === 'TODAY') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'WEEK') {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setMonth(now.getMonth() - 1);
      }
      
      query = query.gte('fin_at', startDate.toISOString());

      const { data: rawData, error } = await query;
      if (error) throw error;

      // Procesar datos
      const userStats = {};
      let totalPicks = 0;

      rawData.forEach(record => {
        if (!userStats[record.usuario_id]) {
          userStats[record.usuario_id] = {
            name: record.usuario_nombre || 'Desconocido',
            picks: 0,
            putaways: 0,
            errors: 0
          };
        }

        if (record.proceso === 'PICKING') {
          userStats[record.usuario_id].picks++;
          totalPicks++;
        } else if (record.proceso === 'PUTAWAY') {
          userStats[record.usuario_id].putaways++;
        }
      });

      const processedData = Object.values(userStats);
      setData(processedData);

      // Calcular Top Stats
      if (processedData.length > 0) {
        const top = [...processedData].sort((a, b) => b.picks - a.picks)[0];
        const avg = Math.round(totalPicks / processedData.length);
        
        setStats({
          topPicker: { name: top.name, value: top.picks },
          bestAccuracy: { name: top.name, value: 100 }, // Simulado por ahora
          teamAverage: { value: avg, growth: 12 } // Crecimiento simulado
        });
      } else {
          setStats({
            topPicker: { name: '-', value: 0 },
            bestAccuracy: { name: '-', value: 0 },
            teamAverage: { value: 0, growth: 0 }
          });
      }

    } catch (error) {
      console.error('Error fetching productivity:', error);
      toast.error('Error cargando métricas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Activity size={24} />
            </div>
            RENDIMIENTO OPERATIVO
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Métricas de productividad por usuario y proceso</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {['TODAY', 'WEEK', 'MONTH'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                dateRange === range 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {range === 'TODAY' ? 'HOY' : range === 'WEEK' ? 'SEMANA' : 'MES'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Performers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Top Picker</p>
              <h3 className="text-xl font-black truncate max-w-[150px]">{stats.topPicker.name}</h3>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black tracking-tighter">{stats.topPicker.value}</span>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Órdenes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mayor Exactitud</p>
              <h3 className="text-xl font-black text-slate-800 truncate max-w-[150px]">{stats.bestAccuracy.name}</h3>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-slate-800">{stats.bestAccuracy.value}%</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">0 Errores</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio Equipo</p>
              <h3 className="text-xl font-black text-slate-800">{stats.teamAverage.value} Picks</h3>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-slate-800">+{stats.teamAverage.growth}%</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">vs Periodo Ant.</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[450px]">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart size={20} className="text-indigo-500"/>
            Comparativa por Operador
        </h3>
        {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400">Cargando datos...</div>
        ) : data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <User size={48} className="mb-2" />
                <p>No hay datos de rendimiento para este periodo</p>
            </div>
        ) : (
            <BarChartComponent 
                data={data} 
                multipleKeys={[
                    { key: 'picks', label: 'Picking (Salidas)', color: '#6366f1' },
                    { key: 'putaways', label: 'Putaway (Entradas)', color: '#10b981' }
                ]}
                height={350}
            />
        )}
      </div>
    </div>
  );
};

export default Productivity;
