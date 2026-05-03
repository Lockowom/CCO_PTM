import React, { useRef } from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import AreaChart from '../../components/Charts/AreaChart';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Analytics = () => {
  const container = useRef();

  useGSAP(() => {
    gsap.from(container.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: container });

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
    <div ref={container} className="bg-wms-dark min-h-screen text-slate-300 p-6 space-y-6">
      <div className="flex justify-between items-end border-b border-wms-border pb-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <FileText size={24} />
            </div>
            REPORTES Y ANALÍTICA
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium ml-1">Descarga de informes históricos y KPIs</p>
        </div>
      </div>

      {/* Gráfico de Tendencias */}
      <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-wms-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <h3 className="text-lg font-bold text-white mb-4 relative z-10">Tendencia de Operaciones (Semestral)</h3>
        <div className="h-64 relative z-10">
            <AreaChart data={trendData} dataKey="value" color="#818cf8" height={250} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Reporte */}
        <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-wms-border hover:border-slate-600 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
              <FileText size={24} />
            </div>
            <span className="bg-wms-dark text-slate-400 border border-wms-border text-xs font-bold px-2 py-1 rounded">Diario</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 relative z-10">Cumplimiento de Picking</h3>
          <p className="text-sm text-slate-400 mb-6 relative z-10">Detalle de líneas completadas vs solicitadas por operador.</p>
          <button className="w-full py-2 bg-wms-dark border border-wms-border text-slate-300 font-bold rounded-xl hover:border-blue-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2 relative z-10">
            <Download size={18} /> Descargar Excel
          </button>
        </div>

        {/* Card Reporte */}
        <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-wms-border hover:border-slate-600 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-emerald-500/20 text-wms-neon rounded-xl border border-emerald-500/30 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
              <FileText size={24} />
            </div>
            <span className="bg-wms-dark text-slate-400 border border-wms-border text-xs font-bold px-2 py-1 rounded">Mensual</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 relative z-10">Tiempos de Ciclo</h3>
          <p className="text-sm text-slate-400 mb-6 relative z-10">Promedio de tiempo desde recepción hasta disponible para venta.</p>
          <button className="w-full py-2 bg-wms-dark border border-wms-border text-slate-300 font-bold rounded-xl hover:border-wms-neon hover:text-wms-neon transition-colors flex items-center justify-center gap-2 relative z-10">
            <Download size={18} /> Descargar Excel
          </button>
        </div>

        {/* Card Reporte */}
        <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-wms-border hover:border-slate-600 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
              <FileText size={24} />
            </div>
            <span className="bg-wms-dark text-slate-400 border border-wms-border text-xs font-bold px-2 py-1 rounded">Semanal</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 relative z-10">Exactitud de Inventario</h3>
          <p className="text-sm text-slate-400 mb-6 relative z-10">Resultados de conteos cíclicos y ajustes realizados.</p>
          <button className="w-full py-2 bg-wms-dark border border-wms-border text-slate-300 font-bold rounded-xl hover:border-purple-400 hover:text-purple-400 transition-colors flex items-center justify-center gap-2 relative z-10">
            <Download size={18} /> Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
