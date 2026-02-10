import React, { useState, useEffect } from 'react';
import { Truck, Box, ClipboardCheck, AlertTriangle, Clock, Save, History, CheckCircle, Package } from 'lucide-react';

const Reception = () => {
  const [stats, setStats] = useState({
    pending: 5,
    verified: 12,
    items: 156,
    discrepancies: 1
  });

  const [form, setForm] = useState({
    proveedor: '',
    productos: '',
    cantidades: '',
    notas: ''
  });

  const [history, setHistory] = useState([
    { id: 1, fecha: '2024-02-10', proveedor: 'Proveedor A', estado: 'VERIFICADA', items: 12 },
    { id: 2, fecha: '2024-02-09', proveedor: 'Proveedor B', estado: 'PENDIENTE', items: 5 },
    { id: 3, fecha: '2024-02-09', proveedor: 'Importadora X', estado: 'VERIFICADA', items: 150 },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Recepción guardada (Simulación)');
    // Aquí iría la llamada al backend POST /api/reception
    setForm({ proveedor: '', productos: '', cantidades: '', notas: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="text-orange-500" /> Recepción de Mercancía
          </h2>
          <p className="text-slate-500 text-sm">Gestión de ingresos y control de calidad</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 font-medium">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           Conectado
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="text-orange-600" />} label="Pendientes Verificación" value={stats.pending} color="bg-orange-50 border-orange-100" />
        <StatCard icon={<CheckCircle className="text-green-600" />} label="Verificadas Hoy" value={stats.verified} color="bg-green-50 border-green-100" />
        <StatCard icon={<Package className="text-blue-600" />} label="Items Recibidos" value={stats.items} color="bg-blue-50 border-blue-100" />
        <StatCard icon={<AlertTriangle className="text-red-600" />} label="Discrepancias" value={stats.discrepancies} color="bg-red-50 border-red-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <ClipboardCheck size={20} /> Nueva Recepción
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proveedor *</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Nombre del proveedor"
                value={form.proveedor}
                onChange={e => setForm({...form, proveedor: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Productos (IDs) *</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="PRD-001, PRD-002..."
                value={form.productos}
                onChange={e => setForm({...form, productos: e.target.value})}
                required 
              />
              <p className="text-[10px] text-slate-400 mt-1">Separados por coma</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cantidades *</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="10, 20..."
                value={form.cantidades}
                onChange={e => setForm({...form, cantidades: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas</label>
              <textarea 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                rows="3"
                placeholder="Observaciones..."
                value={form.notas}
                onChange={e => setForm({...form, notas: e.target.value})}
              ></textarea>
            </div>
            <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <Save size={18} /> Registrar Recepción
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <History size={20} /> Historial Reciente
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Proveedor</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                    <th className="px-6 py-3 text-right">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-600">{item.fecha}</td>
                      <td className="px-6 py-3 font-medium text-slate-800">{item.proveedor}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          item.estado === 'VERIFICADA' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-slate-600">{item.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`p-4 rounded-xl border ${color} flex items-center gap-4`}>
    <div className="p-3 bg-white rounded-lg shadow-sm">{icon}</div>
    <div>
      <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
      <p className="text-xs font-medium text-slate-500 uppercase">{label}</p>
    </div>
  </div>
);

export default Reception;
