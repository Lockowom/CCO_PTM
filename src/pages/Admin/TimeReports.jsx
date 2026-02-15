import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { 
  Clock, 
  Calendar, 
  User, 
  BarChart2, 
  Download,
  Filter,
  RefreshCw,
  Search,
  Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TimeReports = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState('today'); // today, week, month
  const [processFilter, setProcessFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  useEffect(() => {
    filterData();
  }, [data, processFilter, searchTerm]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tms_mediciones_tiempos')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtro de fecha
      const now = new Date();
      let startDate = new Date();
      
      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      query = query.gte('created_at', startDate.toISOString());

      const { data: metrics, error } = await query;

      if (error) throw error;
      setData(metrics || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let res = [...data];

    if (processFilter !== 'ALL') {
      res = res.filter(item => item.proceso === processFilter);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      res = res.filter(item => 
        item.nv?.toString().includes(lowerTerm) ||
        item.usuario_nombre?.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredData(res);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  // Datos para gráfico
  const chartData = filteredData.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.usuario_nombre);
    if (existing) {
      existing.tiempo_activo += (curr.tiempo_activo || 0) / 60; // en minutos
      existing.tiempo_ocio += (curr.tiempo_ocio || 0) / 60;
    } else {
      acc.push({
        name: curr.usuario_nombre || 'Desconocido',
        tiempo_activo: (curr.tiempo_activo || 0) / 60,
        tiempo_ocio: (curr.tiempo_ocio || 0) / 60
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reportes de Tiempos</h2>
          <p className="text-slate-500 text-sm">Análisis de rendimiento y tiempos operativos (Oculto para operadores)</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="today">Hoy</option>
            <option value="week">Última Semana</option>
            <option value="month">Último Mes</option>
          </select>
          <button 
            onClick={fetchMetrics}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase">
          <Filter size={16} /> Filtros:
        </div>
        
        <div className="flex gap-2">
          {['ALL', 'PACKING', 'PICKING', 'RECEPTION'].map(proc => (
            <button
              key={proc}
              onClick={() => setProcessFilter(proc)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                processFilter === proc 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {proc === 'ALL' ? 'Todos' : proc}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por usuario o N.V..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart2 size={20} className="text-indigo-500" />
          Rendimiento por Operador (Minutos)
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)} min`, '']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar dataKey="tiempo_activo" name="Tiempo Activo" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tiempo_ocio" name="Tiempo Ocio" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Detalle */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-emerald-500" />
            Registro Detallado
          </h3>
          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded">
            {filteredData.length} Registros
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Operador</th>
                <th className="px-6 py-3">Proceso</th>
                <th className="px-6 py-3">Referencia (NV)</th>
                <th className="px-6 py-3 text-center">T. Activo</th>
                <th className="px-6 py-3 text-center">T. Ocio</th>
                <th className="px-6 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                    <User size={16} className="text-slate-400" />
                    {item.usuario_nombre}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      item.proceso === 'PACKING' ? 'bg-indigo-100 text-indigo-700' :
                      item.proceso === 'PICKING' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.proceso}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {item.nv || '-'}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-emerald-600 bg-emerald-50/50">
                    {formatTime(item.tiempo_activo || 0)}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-red-600 bg-red-50/50">
                    {formatTime(item.tiempo_ocio || 0)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.estado === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
                      item.estado === 'ABANDONADO' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeReports;
