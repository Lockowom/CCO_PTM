import React, { useState } from 'react';
import { 
  BarChart, Calendar, User, Clock, CheckCircle, 
  TrendingUp, Activity, Filter, Download
} from 'lucide-react';
import { 
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Productivity = () => {
  const [dateRange, setDateRange] = useState('WEEK'); // TODAY, WEEK, MONTH
  
  // Mock Data
  const data = [
    { name: 'Juan Perez', picks: 145, putaways: 80, errors: 2 },
    { name: 'Maria Soto', picks: 120, putaways: 110, errors: 0 },
    { name: 'Pedro Diaz', picks: 180, putaways: 40, errors: 5 },
    { name: 'Ana Lopez', picks: 90, putaways: 95, errors: 1 },
    { name: 'Carlos Ruiz', picks: 160, putaways: 60, errors: 3 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
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
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold opacity-70 uppercase">Top Picker</p>
              <h3 className="text-xl font-black">Pedro Diaz</h3>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black">180</span>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Unidades / Hora</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Mayor Exactitud</p>
              <h3 className="text-xl font-black text-slate-800">Maria Soto</h3>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-slate-800">100%</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">0 Errores</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Promedio Equipo</p>
              <h3 className="text-xl font-black text-slate-800">125 Picks</h3>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-slate-800">+12%</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">vs Semana Anterior</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
        <h3 className="font-bold text-slate-800 mb-6">Comparativa por Operador</h3>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBar data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="picks" name="Picking (Salidas)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            <Bar dataKey="putaways" name="Putaway (Entradas)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
          </RechartsBar>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Productivity;
