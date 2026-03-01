import React, { useState, useEffect } from 'react';
import { 
  Unlock, RotateCcw, AlertTriangle, PlayCircle, 
  Search, UserX, ShieldAlert, CheckCircle2,
  ArrowRightLeft, Siren
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';

const OpsControl = () => {
  const { user } = useAuth();
  const [activeLocks, setActiveLocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para modal de cambio de estado forzado
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetState, setTargetState] = useState('');

  useEffect(() => {
    fetchLocks();
  }, []);

  const fetchLocks = async () => {
    setLoading(true);
    try {
      // Buscar N.V. que están asignadas o en procesos intermedios
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .not('usuario_asignado', 'is', null) // Solo las que tienen usuario
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setActiveLocks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (orderId) => {
    if (!window.confirm(`¿Liberar N.V. #${orderId}? El usuario actual perderá el control.`)) return;

    try {
      const { error } = await supabase
        .from('tms_nv_diarias')
        .update({ 
          usuario_asignado: null, 
          usuario_nombre: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      alert('✅ Orden liberada correctamente');
      fetchLocks();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleForceState = async () => {
    if (!selectedOrder || !targetState) return;
    
    // Confirmación de seguridad
    const confirmCode = Math.floor(1000 + Math.random() * 9000);
    const input = prompt(`⚠️ CAMBIO DE ESTADO FORZADO ⚠️\n\nEstás moviendo la Orden #${selectedOrder.nv} a "${targetState}".\nEsto puede afectar la consistencia de datos.\n\nIngresa el código ${confirmCode} para confirmar:`);
    
    if (input !== confirmCode.toString()) {
      alert('Código incorrecto. Acción cancelada.');
      return;
    }

    try {
      const updateData = { 
        estado: targetState,
        updated_at: new Date().toISOString()
      };

      // Si volvemos a pendiente, liberamos usuario
      if (targetState === 'Pendiente Picking' || targetState === 'Aprobada') {
        updateData.usuario_asignado = null;
        updateData.usuario_nombre = null;
      }

      const { error } = await supabase
        .from('tms_nv_diarias')
        .update(updateData)
        .eq('id', selectedOrder.id);

      if (error) throw error;

      alert(`✅ Estado cambiado a: ${targetState}`);
      setSelectedOrder(null);
      fetchLocks();

    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filteredLocks = activeLocks.filter(item => 
    item.nv?.toString().includes(searchTerm) || 
    item.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200">
              <Siren size={24} />
            </div>
            CONTROL DE OPERACIONES
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Gestión de bloqueos, liberaciones y cambios de estado forzados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel Izquierdo: Resumen */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
            <h3 className="font-bold text-rose-800 flex items-center gap-2 mb-4">
              <ShieldAlert size={20} /> Zona de Riesgo
            </h3>
            <p className="text-sm text-rose-700 mb-4">
              Las acciones en este panel intervienen directamente en los procesos operativos en curso.
              Úsalo solo cuando sea estrictamente necesario para:
            </p>
            <ul className="text-sm text-rose-700 space-y-2 list-disc list-inside font-medium">
              <li>Liberar órdenes "tomadas" por usuarios ausentes.</li>
              <li>Reiniciar flujos atascados.</li>
              <li>Corregir estados asignados erróneamente.</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Estadísticas de Bloqueo</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Procesos Activos</span>
                <span className="font-black text-slate-800 text-xl">{activeLocks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Usuarios Ocupados</span>
                <span className="font-black text-indigo-600 text-xl">
                  {new Set(activeLocks.map(l => l.usuario_asignado)).size}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Lista y Acciones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar por N.V. o Usuario..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tabla de Bloqueos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">N.V.</th>
                  <th className="px-6 py-4">Usuario Asignado</th>
                  <th className="px-6 py-4">Estado Actual</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-400">Cargando procesos...</td></tr>
                ) : filteredLocks.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-400">No hay procesos bloqueados activos.</td></tr>
                ) : (
                  filteredLocks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-800">#{item.nv}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                          <UserX size={14} /> {item.usuario_nombre || 'Desconocido'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <button 
                          onClick={() => handleUnlock(item.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tooltip-trigger"
                          title="Liberar Bloqueo (Kick User)"
                        >
                          <Unlock size={18} />
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(item)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Cambiar Estado Forzado"
                        >
                          <ArrowRightLeft size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Cambio de Estado */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center gap-3 text-amber-600 border-b border-amber-100 pb-4">
              <AlertTriangle size={28} />
              <h3 className="text-xl font-black">Cambio de Estado Forzado</h3>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase mb-1">Orden Seleccionada</p>
              <p className="text-2xl font-black text-slate-800">N.V. #{selectedOrder.nv}</p>
              <p className="text-sm text-slate-600 mt-1">Estado actual: <span className="font-bold">{selectedOrder.estado}</span></p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">Nuevo Estado Destino</label>
              <select 
                value={targetState}
                onChange={(e) => setTargetState(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-amber-500 outline-none"
              >
                <option value="">Seleccionar estado...</option>
                <option value="Pendiente Picking">Pendiente Picking (Reiniciar)</option>
                <option value="Aprobada">Aprobada (Volver a Cola)</option>
                <option value="PACKING">PACKING (Saltar Picking)</option>
                <option value="Facturada">Facturada (Finalizar)</option>
                <option value="Anulada">Anulada (Cancelar)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleForceState}
                disabled={!targetState}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all"
              >
                Aplicar Cambio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpsControl;
