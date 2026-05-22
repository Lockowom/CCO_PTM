import React from 'react';
import { FileText, Download, BarChart2, TrendingUp } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Reports = () => {
  const container = React.useRef(null);

  useGSAP(() => {
    gsap.from('.report-card', {
      scale: 0.9,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'back.out(1.2)',
      clearProps: 'all'
    });
  }, { scope: container });

  const reports = [
    { title: 'Productividad de Picking', desc: 'Líneas pickeadas por operario por hora.', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { title: 'Ocupación de Bodega', desc: 'Porcentaje de ubicaciones llenas vs vacías.', icon: BarChart2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { title: 'Fill Rate (Nivel de Servicio)', desc: 'Porcentaje de pedidos despachados completos.', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { title: 'Desempeño de Transportistas', desc: 'Tiempos de entrega y rechazos por conductor.', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  ];

  return (
    <div ref={container} className="p-6 bg-slate-950 min-h-screen text-slate-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <FileText className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-wide">Reportes y BI</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, i) => (
          <div key={i} className={`report-card bg-slate-50/80 border ${report.border} rounded-2xl p-6 backdrop-blur-xl hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all group`}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 ${report.bg} rounded-xl`}>
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{report.title}</h3>
                <p className="text-sm text-slate-500">{report.desc}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200/50 flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                Exportar Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
