import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Search, Filter, AlertTriangle, CheckCircle, 
  XCircle, Camera, Package, Truck, ArrowRight, Eye, FileText,
  Thermometer, Scale, Ruler, ScanLine, Save
} from 'lucide-react';
import { supabase } from '../../supabase';

const Inspection = () => {
  const [activeTab, setActiveTab] = useState('pending'); // pending | history
  const [receptions, setReceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Inspection Mode
  const [inspectingItem, setInspectingItem] = useState(null);
  const [checklist, setChecklist] = useState({
    visual_damage: false,
    label_check: false,
    qty_match: false,
    temp_check: false
  });
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [inspectionResult, setInspectionResult] = useState(null); // 'PASSED' | 'FAILED'

  useEffect(() => {
    fetchReceptions();
  }, [activeTab]);

  const fetchReceptions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('tms_recepciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        // En un flujo real, buscaríamos estado 'VERIFICADA' (lista para QC) o 'PENDING_QC'
        // Para demo, incluimos VERIFICADA como pendiente de QC
        query = query.in('estado', ['VERIFICADA', 'PENDING_QC']);
      } else {
        query = query.in('estado', ['QC_APROBADO', 'QC_RECHAZADO']);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReceptions(data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const startInspection = (item) => {
    setInspectingItem(item);
    setChecklist({
      visual_damage: false,
      label_check: false,
      qty_match: false,
      temp_check: false
    });
    setInspectionNotes('');
    setInspectionResult(null);
  };

  const handleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const submitInspection = async (result) => {
    if (!inspectingItem) return;

    try {
      setLoading(true);
      const newState = result === 'PASSED' ? 'QC_APROBADO' : 'QC_RECHAZADO';
      
      const { error } = await supabase
        .from('tms_recepciones')
        .update({
          estado: newState,
          // En una tabla real de QC, guardaríamos el detalle de la inspección
          notas: inspectingItem.notas + ` | QC ${result}: ${inspectionNotes}`
        })
        .eq('id', inspectingItem.id);

      if (error) throw error;

      alert(`Inspección registrada: ${result === 'PASSED' ? 'APROBADO' : 'RECHAZADO'}`);
      setInspectingItem(null);
      fetchReceptions();

    } catch (err) {
      console.error(err);
      alert('Error al guardar inspección');
    } finally {
      setLoading(false);
    }
  };

  const filteredReceptions = receptions.filter(r => 
    r.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.orden_compra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id?.toString().includes(searchTerm)
  );

  // ==================== VISTA: INSPECCIÓN ACTIVA ====================
  if (inspectingItem) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setInspectingItem(null)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowRight className="rotate-180 text-slate-500" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Inspección de Calidad</h2>
            <p className="text-slate-500 text-sm">Recepción #{inspectingItem.id} • {inspectingItem.proveedor}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info del Pedido */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-indigo-500" />
                Detalles
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Proveedor</span>
                  <span className="font-medium text-slate-700">{inspectingItem.proveedor}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Orden de Compra</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {inspectingItem.orden_compra || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Fecha Recepción</span>
                  <span className="text-slate-600">
                    {new Date(inspectingItem.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Items Declarados</span>
                  <span className="text-2xl font-black text-slate-800">{inspectingItem.items_count}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2 text-sm">Productos (Resumen)</h3>
              <p className="text-sm text-slate-600 font-mono">
                {inspectingItem.productos || 'Sin detalle de productos'}
              </p>
            </div>
          </div>

          {/* Checklist de Inspección */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardCheck className="text-blue-600" />
                  Puntos de Control
                </h3>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Requerido
                </span>
              </div>
              
              <div className="p-6 space-y-4">
                <CheckItem 
                  label="Daño Visual / Embalaje" 
                  desc="Cajas sin golpes, roturas o humedad visible."
                  checked={checklist.visual_damage} 
                  onChange={() => handleCheck('visual_damage')}
                  icon={<Package size={20} />}
                />
                <CheckItem 
                  label="Etiquetado y Lotes" 
                  desc="Etiquetas legibles, coinciden con OC y LPN."
                  checked={checklist.label_check} 
                  onChange={() => handleCheck('label_check')}
                  icon={<ScanLine size={20} />}
                />
                <CheckItem 
                  label="Conteo Físico" 
                  desc="La cantidad física coincide con lo declarado."
                  checked={checklist.qty_match} 
                  onChange={() => handleCheck('qty_match')}
                  icon={<Scale size={20} />}
                />
                <CheckItem 
                  label="Temperatura / Condiciones" 
                  desc="Cumple con condiciones de almacenamiento."
                  checked={checklist.temp_check} 
                  onChange={() => handleCheck('temp_check')}
                  icon={<Thermometer size={20} />}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones / Evidencia</label>
              <textarea
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                placeholder="Ingrese detalles adicionales, números de lote fallidos, etc."
              />
              
              <div className="mt-4 flex gap-4">
                <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors border border-slate-200 border-dashed">
                  <Camera size={16} /> Agregar Foto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => submitInspection('FAILED')}
                className="py-4 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all"
              >
                <XCircle size={24} />
                RECHAZAR
              </button>
              <button
                onClick={() => submitInspection('PASSED')}
                disabled={!Object.values(checklist).every(Boolean)}
                className="py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
              >
                <CheckCircle size={24} />
                APROBAR
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== VISTA: DASHBOARD ====================
  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
               <ClipboardCheck size={24} />
             </div>
             CONTROL DE CALIDAD
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Inspección de ingresos y liberaciones</p>
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label="Pendientes" count={receptions.length} />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Historial" />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por Proveedor, OC o ID..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-sm border border-slate-200 hover:bg-slate-100 flex items-center gap-2">
          <Filter size={16} /> Filtros
        </button>
      </div>

      {/* Grid de Tarjetas */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Cargando inspecciones...</p>
        </div>
      ) : filteredReceptions.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <ClipboardCheck size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No hay inspecciones {activeTab === 'pending' ? 'pendientes' : 'en el historial'}</h3>
          <p className="text-slate-400 text-sm">
            {activeTab === 'pending' 
              ? 'Las recepciones verificadas aparecerán aquí para su control.' 
              : 'El historial de inspecciones aparecerá aquí.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReceptions.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className={`h-2 w-full ${
                item.estado === 'QC_APROBADO' ? 'bg-emerald-500' : 
                item.estado === 'QC_RECHAZADO' ? 'bg-red-500' : 
                'bg-blue-500'
              }`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono font-bold text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    #{item.id}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                    item.estado === 'QC_APROBADO' ? 'bg-emerald-100 text-emerald-700' : 
                    item.estado === 'QC_RECHAZADO' ? 'bg-red-100 text-red-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.estado.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-lg mb-1 truncate" title={item.proveedor}>
                  {item.proveedor}
                </h3>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                  <FileText size={14} /> OC: {item.orden_compra || 'N/A'}
                </p>

                <div className="flex items-center gap-4 py-4 border-t border-slate-100 mb-4">
                  <div className="flex-1">
                    <span className="block text-xs text-slate-400 uppercase font-bold">Bultos</span>
                    <span className="text-xl font-black text-slate-800">{item.items_count}</span>
                  </div>
                  <div className="flex-1">
                    <span className="block text-xs text-slate-400 uppercase font-bold">Fecha</span>
                    <span className="text-sm font-bold text-slate-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {activeTab === 'pending' ? (
                  <button 
                    onClick={() => startInspection(item)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]"
                  >
                    <Eye size={18} />
                    INICIAR INSPECCIÓN
                  </button>
                ) : (
                   <div className="text-center p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-500">
                     Inspección Finalizada
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
      active 
        ? 'bg-slate-800 text-white shadow-md' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
        active ? 'bg-white text-slate-800' : 'bg-slate-200 text-slate-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const CheckItem = ({ label, desc, checked, onChange, icon }) => (
  <div 
    onClick={onChange}
    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
      checked 
        ? 'border-emerald-500 bg-emerald-50/50' 
        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
    }`}
  >
    <div className={`mt-1 p-2 rounded-lg ${checked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <h4 className={`font-bold ${checked ? 'text-emerald-900' : 'text-slate-700'}`}>{label}</h4>
        {checked && <CheckCircle size={20} className="text-emerald-500 animate-in zoom-in" />}
      </div>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  </div>
);

export default Inspection;
