import React, { useState, useEffect } from 'react';
import { Truck, Box, ClipboardCheck, AlertTriangle, Clock, Save, History, CheckCircle, Package, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';

const Reception = () => {
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    items: 0,
    discrepancies: 0
  });

  const [form, setForm] = useState({
    proveedor: '',
    productos: '',
    cantidades: '',
    notas: ''
  });

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchReceptions();
  }, []);

  const fetchReceptions = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('tms_recepciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);

      // Calcular Stats
      const pending = data.filter(r => r.estado === 'PENDIENTE').length;
      const verified = data.filter(r => r.estado === 'VERIFICADA' && new Date(r.created_at).toDateString() === new Date().toDateString()).length;
      const items = data.reduce((acc, curr) => acc + (curr.items_count || 0), 0);
      const discrepancies = data.filter(r => r.estado === 'CON_DISCREPANCIAS').length;

      setStats({ pending, verified, items, discrepancies });

    } catch (err) {
      console.error('Error fetching receptions:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calcular total items simple (suma de cantidades separadas por coma)
      const cantidadesArr = form.cantidades.split(',').map(n => parseInt(n.trim()) || 0);
      const totalItems = cantidadesArr.reduce((a, b) => a + b, 0);

      const { error } = await supabase
        .from('tms_recepciones')
        .insert({
          proveedor: form.proveedor,
          productos: form.productos,
          cantidades: form.cantidades,
          notas: form.notas,
          items_count: totalItems,
          estado: 'PENDIENTE'
        });

      if (error) throw error;

      alert('Recepción registrada exitosamente');
      setForm({ proveedor: '', productos: '', cantidades: '', notas: '' });
      fetchReceptions();

    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
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
            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? 'Registrando...' : 'Registrar Recepción'}
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
                  {loadingData ? (
                    <tr><td colSpan="4" className="p-4 text-center">Cargando...</td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-400">No hay recepciones registradas</td></tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-slate-600">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-3 font-medium text-slate-800">{item.proveedor}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            item.estado === 'VERIFICADA' ? 'bg-green-100 text-green-700' : 
                            item.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {item.estado}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-slate-600">{item.items_count}</td>
                      </tr>
                    ))
                  )}
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
