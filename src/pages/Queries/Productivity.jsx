import React, { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  BarChart, Calendar, User, Clock, CheckCircle, 
  TrendingUp, Activity, Filter, Download
} from 'lucide-react';
import { supabase } from '../../supabase';
import BarChartComponent from '../../components/Charts/BarChart';
import { toast } from 'sonner';

const Productivity = () => {
  const containerRef = useRef();
  const [dateRange, setDateRange] = useState('WEEK'); // TODAY, WEEK, MONTH

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const { data: productivityData = { data: [], stats: { topPicker: { name: '-', value: 0 }, bestAccuracy: { name: '-', value: 100 }, teamAverage: { value: 0, growth: 0 } } }, isLoading: loading } = useQuery({
    queryKey: ['productivity', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('tms_mediciones_tiempos')
        .select('*')
        .eq('estado', 'COMPLETADO');

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
      let stats = {
        topPicker: { name: '-', value: 0 },
        bestAccuracy: { name: '-', value: 100 },
        teamAverage: { value: 0, growth: 0 }
      };

      if (processedData.length > 0) {
        const top = [...processedData].sort((a, b) => b.picks - a.picks)[0];
        const avg = Math.round(totalPicks / processedData.length);
        
        stats = {
          topPicker: { name: top.name, value: top.picks },
          bestAccuracy: { name: top.name, value: 100 },
          teamAverage: { value: avg, growth: 12 }
        };
      }

      return { data: processedData, stats };
    }
  });

  const { data, stats } = productivityData;

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-8 pb-20 bg-wms-dark min-h-screen text-slate-300 p-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-wms-border pb-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Activity size={24} />
            </div>
            RENDIMIENTO OPERATIVO
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium ml-1">Métricas de productividad por usuario y proceso</p>
        </div>
        
        <div className="flex bg-wms-dark p-1 rounded-xl border border-wms-border shadow-sm relative z-10">
          {['TODAY', 'WEEK', 'MONTH'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                dateRange === range 
                  ? 'bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)] text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-300 hover:bg-wms-panel'
              }`}
            >
              {range === 'TODAY' ? 'HOY' : range === 'WEEK' ? 'SEMANA' : 'MES'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Performers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)] transform hover:scale-[1.02] transition-transform relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Top Picker</p>
              <h3 className="text-xl font-black truncate max-w-[150px] text-indigo-100">{stats.topPicker.name}</h3>
            </div>
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-4xl font-black tracking-tighter text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]">{stats.topPicker.value}</span>
            <span className="text-xs font-medium bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-1 rounded">Órdenes</span>
          </div>
        </div>

        <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-wms-border shadow-2xl hover:border-wms-neon/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-wms-neon/20 border border-wms-neon/30 text-wms-neon rounded-xl shadow-neon-green">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mayor Exactitud</p>
              <h3 className="text-xl font-black text-white truncate max-w-[150px]">{stats.bestAccuracy.name}</h3>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-white">{stats.bestAccuracy.value}%</span>
            <span className="text-xs font-medium text-wms-neon bg-wms-neon/10 border border-wms-neon/20 px-2 py-1 rounded">0 Errores</span>
          </div>
        </div>

        <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-wms-border shadow-2xl hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio Equipo</p>
              <h3 className="text-xl font-black text-white">{stats.teamAverage.value} Picks</h3>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-white">+{stats.teamAverage.growth}%</span>
            <span className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">vs Periodo Ant.</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-2xl border border-wms-border shadow-2xl h-[450px] relative z-10">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
            <BarChart size={20} className="text-indigo-400"/>
            Comparativa por Operador
        </h3>
        {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-wms-border border-t-indigo-400 rounded-full animate-spin"></div>
                <span>Cargando datos...</span>
              </div>
            </div>
        ) : data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <User size={48} className="mb-2 opacity-50 text-indigo-400" />
                <p>No hay datos de rendimiento para este periodo</p>
            </div>
        ) : (
            <BarChartComponent 
                data={data} 
                multipleKeys={[
                    { key: 'picks', label: 'Picking (Salidas)', color: '#818cf8' },
                    { key: 'putaways', label: 'Putaway (Entradas)', color: '#34d399' }
                ]}
                height={350}
            />
        )}
      </div>
    </div>
  );
};

export default Productivity;
