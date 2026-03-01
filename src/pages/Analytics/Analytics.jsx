import React from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import AreaChart from '../../components/Charts/AreaChart';

const Analytics = () => {
  // Datos simulados para el gráfico de tendencias
  const trendData = [
    { name: 'Ene', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Abr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <FileText size={24} />
            </div>
            REPORTES Y ANALÍTICA
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Descarga de informes históricos y KPIs</p>
        </div>
      </div>

      {/* Gráfico de Tendencias */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Tendencia de Operaciones (Semestral)</h3>
        <div className="h-64">
            <AreaChart data={trendData} dataKey="value" color="#8b5cf6" height={250} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Reporte */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FileText size={24} />
            </div>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Diario</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Cumplimiento de Picking</h3>
          <p className="text-sm text-slate-500 mb-6">Detalle de líneas completadas vs solicitadas por operador.</p>
          <button className="w-full py-2 border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:border-blue-200 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
            <Download size={18} /> Descargar Excel
          </button>
        </div>

        {/* Card Reporte */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileText size={24} />
            </div>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Mensual</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Tiempos de Ciclo</h3>
          <p className="text-sm text-slate-500 mb-6">Promedio de tiempo desde recepción hasta disponible para venta.</p>
          <button className="w-full py-2 border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:border-emerald-200 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2">
            <Download size={18} /> Descargar Excel
          </button>
        </div>

        {/* Card Reporte */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FileText size={24} />
            </div>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Semanal</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Exactitud de Inventario</h3>
          <p className="text-sm text-slate-500 mb-6">Resultados de conteos cíclicos y ajustes realizados.</p>
          <button className="w-full py-2 border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:border-purple-200 hover:text-purple-600 transition-colors flex items-center justify-center gap-2">
            <Download size={18} /> Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
