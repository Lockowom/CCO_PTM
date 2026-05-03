import React, { useState, useRef } from 'react';
import { 
  ClipboardCheck, Search, Filter, AlertTriangle, CheckCircle, 
  XCircle, Camera, Package, Truck, ArrowRight, Eye, FileText,
  Thermometer, Scale, Ruler, ScanLine, Save
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Inspection = () => {
  const container = useRef();
  const [activeTab, setActiveTab] = useState('pending'); // pending | history
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

  const queryClient = useQueryClient();

  useGSAP(() => {
    gsap.from(container.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: container });

  // 1. Fetching con React Query
  const { data: receptions = [], isLoading: loading } = useQuery({
    queryKey: ['qc_inspections', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('tms_recepciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        query = query.in('estado', ['VERIFICADA', 'PENDING_QC']);
      } else {
        query = query.in('estado', ['QC_APROBADO', 'QC_RECHAZADO']);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // 2. Mutación para guardar inspección
  const submitMutation = useMutation({
    mutationFn: async ({ item, result, notes }) => {
      const newState = result === 'PASSED' ? 'QC_APROBADO' : 'QC_RECHAZADO';
      
      const { data, error } = await supabase
        .from('tms_recepciones')
        .update({
          estado: newState,
          notas: (item.notas || '') + ` | QC ${result}: ${notes}`
        })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      return { data, result };
    },
    onSuccess: (response) => {
      toast.success(`Inspección registrada: ${response.result === 'PASSED' ? 'APROBADA' : 'RECHAZADA'}`, {
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' },
      });
      setInspectingItem(null);
      queryClient.invalidateQueries(['qc_inspections']);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Error al guardar inspección', {
        style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' },
      });
    }
  });

  const startInspection = (item) => {
    setInspectingItem(item);
    setChecklist({
      visual_damage: false,
      label_check: false,
      qty_match: false,
      temp_check: false
    });
    setInspectionNotes('');
  };

  const handleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredReceptions = receptions.filter(r => 
    r.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.orden_compra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id?.toString().includes(searchTerm)
  );

  // ==================== VISTA: INSPECCIÓN ACTIVA ====================
  if (inspectingItem) {
    return (
      <div ref={container} className="bg-wms-dark min-h-screen text-slate-300 p-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setInspectingItem(null)}
            className="p-2 hover:bg-wms-border rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowRight className="rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              Inspección de Calidad
            </h2>
            <p className="text-slate-400 text-sm">Recepción #{inspectingItem.id} • {inspectingItem.proveedor}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info del Pedido */}
          <div className="space-y-6">
            <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-2xl border border-wms-border shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" />
                Detalles
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Proveedor</span>
                  <span className="font-medium text-white">{inspectingItem.proveedor}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Orden de Compra</span>
                  <span className="font-mono bg-wms-dark px-2 py-0.5 rounded border border-wms-border text-slate-300">
                    {inspectingItem.orden_compra || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Fecha Recepción</span>
                  <span className="text-slate-300">
                    {new Date(inspectingItem.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Items Declarados</span>
                  <span className="text-2xl font-black text-wms-neon">{inspectingItem.items_count}</span>
                </div>
              </div>
            </div>

            <div className="bg-wms-dark p-6 rounded-2xl border border-wms-border shadow-inner">
              <h3 className="font-bold text-white mb-2 text-sm">Productos (Resumen)</h3>
              <p className="text-sm text-slate-400 font-mono">
                {inspectingItem.productos || 'Sin detalle de productos'}
              </p>
            </div>
          </div>

          {/* Checklist de Inspección */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-wms-neon/5 rounded-full blur-3xl"></div>
              <div className="p-4 bg-wms-dark/50 border-b border-wms-border flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ClipboardCheck className="text-blue-400" />
                  Puntos de Control
                </h3>
                <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
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

            <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-2xl p-6">
              <label className="block text-sm font-bold text-slate-300 mb-2">Observaciones / Evidencia</label>
              <textarea
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="w-full p-3 bg-wms-dark border border-wms-border rounded-xl text-sm text-white focus:ring-2 focus:ring-wms-neon outline-none h-24 resize-none placeholder-slate-600"
                placeholder="Ingrese detalles adicionales, números de lote fallidos, etc."
              />
              
              <div className="mt-4 flex gap-4">
                <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-400 bg-wms-dark hover:bg-wms-dark/80 px-4 py-2 rounded-lg transition-colors border border-wms-border border-dashed">
                  <Camera size={16} /> Agregar Foto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => submitMutation.mutate({ item: inspectingItem, result: 'FAILED', notes: inspectionNotes })}
                disabled={submitMutation.isLoading}
                className="py-4 bg-wms-dark border-2 border-wms-danger/50 text-wms-danger hover:bg-wms-danger/10 hover:border-wms-danger rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <XCircle size={24} />
                RECHAZAR
              </button>
              <button
                onClick={() => submitMutation.mutate({ item: inspectingItem, result: 'PASSED', notes: inspectionNotes })}
                disabled={!Object.values(checklist).every(Boolean) || submitMutation.isLoading}
                className="py-4 bg-wms-neon hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-wms-dark rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:shadow-none transition-all"
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
    <div ref={container} className="bg-wms-dark min-h-screen text-slate-300 p-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
               <ClipboardCheck size={24} />
             </div>
             CONTROL DE CALIDAD
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium ml-1">Inspección de ingresos y liberaciones</p>
        </div>
        
        <div className="flex gap-2 bg-wms-panel p-1 rounded-xl border border-wms-border shadow-inner">
          <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label="Pendientes" count={receptions.length} />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Historial" />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-wms-panel/80 backdrop-blur-xl p-4 rounded-xl border border-wms-border shadow-lg flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por Proveedor, OC o ID..."
            className="w-full pl-10 pr-4 py-2 bg-wms-dark border border-wms-border text-white rounded-lg focus:ring-2 focus:ring-wms-neon outline-none text-sm placeholder-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 bg-wms-dark text-slate-300 rounded-lg font-bold text-sm border border-wms-border hover:text-white flex items-center gap-2 transition-colors">
          <Filter size={16} /> Filtros
        </button>
      </div>

      {/* Grid de Tarjetas */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Cargando inspecciones...</p>
        </div>
      ) : filteredReceptions.length === 0 ? (
        <div className="text-center py-20 bg-wms-panel/50 rounded-3xl border border-dashed border-wms-border">
          <ClipboardCheck size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white">No hay inspecciones {activeTab === 'pending' ? 'pendientes' : 'en el historial'}</h3>
          <p className="text-slate-400 text-sm">
            {activeTab === 'pending' 
              ? 'Las recepciones verificadas aparecerán aquí para su control.' 
              : 'El historial de inspecciones aparecerá aquí.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReceptions.map(item => (
            <div key={item.id} className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-xl hover:shadow-2xl hover:border-slate-600 transition-all duration-300 group overflow-hidden relative">
              <div className={`h-2 w-full ${
                item.estado === 'QC_APROBADO' ? 'bg-wms-neon shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 
                item.estado === 'QC_RECHAZADO' ? 'bg-wms-danger shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 
                'bg-blue-500'
              }`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono font-bold text-xs text-slate-400 bg-wms-dark border border-wms-border px-2 py-1 rounded-md">
                    #{item.id}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                    item.estado === 'QC_APROBADO' ? 'bg-wms-neon/10 text-wms-neon border-wms-neon/30' : 
                    item.estado === 'QC_RECHAZADO' ? 'bg-wms-danger/10 text-wms-danger border-wms-danger/30' : 
                    'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {item.estado.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-white text-lg mb-1 truncate" title={item.proveedor}>
                  {item.proveedor}
                </h3>
                <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                  <FileText size={14} /> OC: {item.orden_compra || 'N/A'}
                </p>

                <div className="flex items-center gap-4 py-4 border-t border-wms-border mb-4">
                  <div className="flex-1">
                    <span className="block text-xs text-slate-500 uppercase font-bold">Bultos</span>
                    <span className="text-xl font-black text-white">{item.items_count}</span>
                  </div>
                  <div className="flex-1">
                    <span className="block text-xs text-slate-500 uppercase font-bold">Fecha</span>
                    <span className="text-sm font-bold text-slate-300">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {activeTab === 'pending' ? (
                  <button 
                    onClick={() => startInspection(item)}
                    className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-300 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]"
                  >
                    <Eye size={18} />
                    INICIAR INSPECCIÓN
                  </button>
                ) : (
                   <div className="text-center p-2 bg-wms-dark rounded-xl border border-wms-border text-xs font-bold text-slate-500">
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
        ? 'bg-wms-dark text-white shadow-inner border border-wms-border' 
        : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
        active ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-wms-dark text-slate-600'
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
        ? 'border-wms-neon bg-wms-neon/10' 
        : 'border-wms-border bg-wms-dark/50 hover:border-slate-600'
    }`}
  >
    <div className={`mt-1 p-2 rounded-lg ${checked ? 'bg-wms-neon/20 text-wms-neon' : 'bg-wms-panel text-slate-500'}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <h4 className={`font-bold ${checked ? 'text-wms-neon' : 'text-slate-300'}`}>{label}</h4>
        {checked && <CheckCircle size={20} className="text-wms-neon animate-in zoom-in" />}
      </div>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  </div>
);

export default Inspection;
