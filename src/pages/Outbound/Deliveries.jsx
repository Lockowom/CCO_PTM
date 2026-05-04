import React from 'react';
import { PackageCheck, CheckCircle2, MapPin, Clock } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Deliveries = () => {
  const container = React.useRef(null);

  useGSAP(() => {
    gsap.from('.delivery-row', {
      x: -20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }, { scope: container });

  const mockDeliveries = [
    { id: 'ENT-001', client: 'Farmacias Ahumada', address: 'Av. Providencia 1234', status: 'ENTREGADO', time: '10:30 AM' },
    { id: 'ENT-002', client: 'Cruz Verde', address: 'Alameda 456', status: 'EN RUTA', time: 'ETA 11:45 AM' },
    { id: 'ENT-003', client: 'Salcobrand', address: 'Mac Iver 789', status: 'PENDIENTE', time: '---' },
  ];

  return (
    <div ref={container} className="p-6 bg-slate-950 min-h-screen text-slate-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <PackageCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Confirmación de Entregas</h1>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="p-4 text-slate-400 font-medium text-sm">ID Entrega</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Cliente</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Dirección</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Estado</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Hora/ETA</th>
                <th className="p-4 text-right text-slate-400 font-medium text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockDeliveries.map((delivery, i) => (
                <tr key={i} className="delivery-row border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-mono text-emerald-400 font-bold">{delivery.id}</td>
                  <td className="p-4 text-white">{delivery.client}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4" />
                      {delivery.address}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      delivery.status === 'ENTREGADO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      delivery.status === 'EN RUTA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      {delivery.time}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {delivery.status !== 'ENTREGADO' && (
                      <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ml-auto">
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmar POD
                      </button>
                    )}
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

export default Deliveries;
