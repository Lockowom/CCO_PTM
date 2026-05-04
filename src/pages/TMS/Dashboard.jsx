import React from 'react';
import { Activity, Truck, MapPin, AlertCircle, Clock } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const DashboardTMS = () => {
  const container = React.useRef(null);

  useGSAP(() => {
    gsap.from('.tms-card', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: container });

  return (
    <div ref={container} className="p-6 bg-slate-950 min-h-screen text-slate-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide">TMS Control Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Vehículos en Ruta', value: '12', icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { title: 'Entregas Pendientes', value: '45', icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { title: 'Alertas de Retraso', value: '3', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          { title: 'Tiempo Promedio', value: '42m', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`tms-card ${stat.bg} ${stat.border} border rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group`}>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${stat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 tms-card bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-4">Mapa de Operaciones (Simulado)</h2>
          <div className="h-[400px] bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <MapPin className="w-12 h-12 text-slate-600 animate-bounce" />
             <p className="absolute bottom-4 text-slate-500 text-sm">El mapa en vivo requiere integración con Leaflet/Google Maps</p>
          </div>
        </div>

        <div className="tms-card bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-4">Conductores Activos</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((driver) => (
              <div key={driver} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                    C{driver}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Conductor {driver}</p>
                    <p className="text-emerald-400 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> En Ruta
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 font-bold text-sm">Camión {driver}A</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTMS;
