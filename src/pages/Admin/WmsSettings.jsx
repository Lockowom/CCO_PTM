import React, { useState, useRef } from 'react';
import {
  Settings, Save, AlertTriangle, Printer, Truck,
  Package, Warehouse, RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { toast } from 'sonner';

const DEFAULT_CONFIG = {
  warehouse_name: 'Centro de Distribución Principal',
  warehouse_code: 'CD-01',
  timezone: 'America/Santiago',
  allow_blind_reception: false,
  require_qc: true,
  auto_putaway_strategy: 'NEAREST_EMPTY',
  picking_strategy: 'FIFO',
  allow_partial_picking: true,
  require_staging: true,
  label_printer_ip: '192.168.1.200',
  zpl_density: '8dmm',
  label_size: '4x6'
};

const WmsSettings = () => {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('general');
  const [localConfig, setLocalConfig] = useState(DEFAULT_CONFIG);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const { data: config = DEFAULT_CONFIG, isLoading } = useQuery({
    queryKey: ['wms_settings'],
    queryFn: async () => {
      const saved = localStorage.getItem('wms_settings_v2');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    },
    onSuccess: (data) => setLocalConfig(data)
  });

  const saveMutation = useMutation({
    mutationFn: async (newConfig) => {
      await new Promise(resolve => setTimeout(resolve, 600));
      localStorage.setItem('wms_settings_v2', JSON.stringify(newConfig));
      return newConfig;
    },
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['wms_settings'], newConfig);
      toast.success('Configuración guardada exitosamente', {
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
      });
      gsap.to(".save-btn", { scale: 1.05, duration: 0.1, yoyo: true, repeat: 1 });
    },
    onError: () => toast.error('Error al guardar la configuración')
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const TabButton = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all flex-shrink-0 border ${
        activeTab === id
          ? 'bg-wms-neon/10 text-wms-neon border-wms-neon/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]'
          : 'bg-wms-panel/50 text-slate-400 hover:text-white border-wms-border hover:border-slate-600'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  if (isLoading) return <div className="p-8 text-center text-wms-neon animate-pulse">Cargando Configuración...</div>;

  return (
    <div ref={containerRef} className="bg-wms-dark min-h-[calc(100vh-80px)] p-6 text-slate-300">
      
      {/* Background Decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-wms-neon/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-wms-border pb-6">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <div className="p-2.5 bg-wms-panel border border-wms-border rounded-xl shadow-lg">
                <Settings className="text-wms-neon" size={28} />
              </div>
              Configuración <span className="text-wms-neon">WMS</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">Reglas de negocio y parámetros operativos globales</p>
          </div>
          <button
            onClick={() => saveMutation.mutate(localConfig)}
            disabled={saveMutation.isPending}
            className="save-btn bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-black shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {saveMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            {saveMutation.isPending ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          <TabButton id="general" icon={<Warehouse size={18} />} label="General" />
          <TabButton id="inbound" icon={<Truck size={18} />} label="Recepción (Inbound)" />
          <TabButton id="outbound" icon={<Package size={18} />} label="Despacho (Outbound)" />
          <TabButton id="printers" icon={<Printer size={18} />} label="Impresoras ZPL" />
        </div>

        {/* Content */}
        <div className="bg-wms-panel/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-wms-border p-8 min-h-[400px]">
          
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <h3 className="font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Warehouse className="text-indigo-400" size={20} /> Identificación
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre del Almacén</label>
                    <input
                      type="text" name="warehouse_name" value={localConfig.warehouse_name} onChange={handleChange}
                      className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Código (ID)</label>
                    <input
                      type="text" name="warehouse_code" value={localConfig.warehouse_code} onChange={handleChange}
                      className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl font-mono font-black text-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Clock className="text-indigo-400" size={20} /> Configuración Regional
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Zona Horaria</label>
                    <select
                      name="timezone" value={localConfig.timezone} onChange={handleChange}
                      className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all cursor-pointer"
                    >
                      <option value="America/Santiago">Santiago (UTC-4)</option>
                      <option value="America/Lima">Lima (UTC-5)</option>
                      <option value="America/Buenos_Aires">Buenos Aires (UTC-3)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INBOUND */}
          {activeTab === 'inbound' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-inner">
                  <h3 className="font-black text-white mb-6 flex items-center gap-2">
                    <Truck className="text-wms-neon" /> Reglas de Recepción
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-wms-panel rounded-xl border border-wms-border cursor-pointer hover:border-indigo-500/50 transition-all group">
                      <div>
                        <span className="block text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Recepción Ciega</span>
                        <span className="block text-xs text-slate-500 mt-1 font-medium">Ingresar stock sin orden previa.</span>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200">
                        <input type="checkbox" name="allow_blind_reception" checked={localConfig.allow_blind_reception} onChange={handleChange} className="peer absolute opacity-0 w-0 h-0" />
                        <span className="block bg-slate-700 w-full h-full rounded-full peer-checked:bg-wms-neon transition-colors shadow-inner"></span>
                        <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></span>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-wms-panel rounded-xl border border-wms-border cursor-pointer hover:border-wms-neon/50 transition-all group">
                      <div>
                        <span className="block text-sm font-bold text-white group-hover:text-wms-neon transition-colors">Control de Calidad (QC)</span>
                        <span className="block text-xs text-slate-500 mt-1 font-medium">Inspección antes del almacenaje.</span>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200">
                        <input type="checkbox" name="require_qc" checked={localConfig.require_qc} onChange={handleChange} className="peer absolute opacity-0 w-0 h-0" />
                        <span className="block bg-slate-700 w-full h-full rounded-full peer-checked:bg-wms-neon transition-colors shadow-inner"></span>
                        <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-inner">
                  <h3 className="font-black text-white mb-6 flex items-center gap-2">
                    <Warehouse className="text-blue-400" /> Putaway
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Algoritmo Sugerido</label>
                    <div className="space-y-3">
                      <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${localConfig.auto_putaway_strategy === 'NEAREST_EMPTY' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-wms-panel border-wms-border'}`}>
                        <input type="radio" name="auto_putaway_strategy" value="NEAREST_EMPTY" checked={localConfig.auto_putaway_strategy === 'NEAREST_EMPTY'} onChange={handleChange} className="accent-blue-500" />
                        <div>
                          <span className={`block text-sm font-bold ${localConfig.auto_putaway_strategy === 'NEAREST_EMPTY' ? 'text-blue-400' : 'text-white'}`}>Cercanía (Nearest Empty)</span>
                          <span className="block text-xs text-slate-500 mt-0.5">Llena vacíos cercanos a recepción.</span>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${localConfig.auto_putaway_strategy === 'ABC_ZONING' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-wms-panel border-wms-border'}`}>
                        <input type="radio" name="auto_putaway_strategy" value="ABC_ZONING" checked={localConfig.auto_putaway_strategy === 'ABC_ZONING'} onChange={handleChange} className="accent-blue-500" />
                        <div>
                          <span className={`block text-sm font-bold ${localConfig.auto_putaway_strategy === 'ABC_ZONING' ? 'text-blue-400' : 'text-white'}`}>Zonificación ABC</span>
                          <span className="block text-xs text-slate-500 mt-0.5">Según rotación (Alta/Media/Baja).</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OUTBOUND */}
          {activeTab === 'outbound' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-wms-alert/10 p-4 rounded-xl flex items-center gap-3 border border-wms-alert/20 text-wms-alert text-sm font-bold">
                <AlertTriangle size={20} />
                <span>Los cambios afectarán a las órdenes generadas a partir de ahora.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <h3 className="font-black text-white border-b border-slate-800 pb-3">Estrategia Allocation</h3>
                  <div className="space-y-3">
                    {['FIFO', 'FEFO', 'LIFO'].map(strat => (
                      <label key={strat} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${localConfig.picking_strategy === strat ? 'bg-wms-neon/10 border-wms-neon/30' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}>
                        <input type="radio" name="picking_strategy" value={strat} checked={localConfig.picking_strategy === strat} onChange={handleChange} className="accent-wms-neon" />
                        <div>
                          <span className={`block font-bold ${localConfig.picking_strategy === strat ? 'text-wms-neon' : 'text-white'}`}>{strat}</span>
                          <span className="block text-xs text-slate-500 font-medium">
                            {strat === 'FIFO' ? 'Primeros ingresos salen primero.' : strat === 'FEFO' ? 'Próximos a vencer salen primero.' : 'Últimos ingresos salen primero.'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="font-black text-white border-b border-slate-800 pb-3">Reglas de Proceso</h3>
                  <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 cursor-pointer hover:border-wms-neon/30 transition-all group">
                    <div>
                      <span className="block text-sm font-bold text-white group-hover:text-wms-neon transition-colors">Permitir Picking Parcial</span>
                      <span className="block text-xs text-slate-500 mt-1">Cerrar órdenes con faltantes.</span>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200">
                      <input type="checkbox" name="allow_partial_picking" checked={localConfig.allow_partial_picking} onChange={handleChange} className="peer absolute opacity-0 w-0 h-0" />
                      <span className="block bg-slate-700 w-full h-full rounded-full peer-checked:bg-wms-neon transition-colors shadow-inner"></span>
                      <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PRINTERS */}
          {activeTab === 'printers' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl flex items-center justify-between shadow-inner">
                <div>
                  <h3 className="font-black text-xl flex items-center gap-2">
                    <Printer className="text-wms-neon" /> Servidor de Impresión
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Configuración de impresoras térmicas (ZPL)</p>
                </div>
                <div className="bg-wms-neon/10 text-wms-neon px-4 py-1.5 rounded-lg text-xs font-black border border-wms-neon/20 shadow-neon-green">
                  ACTIVO
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">IP Impresora Principal</label>
                  <input
                    type="text" name="label_printer_ip" value={localConfig.label_printer_ip} onChange={handleChange}
                    className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl font-mono font-bold text-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Formato de Etiqueta</label>
                  <select
                    name="label_size" value={localConfig.label_size} onChange={handleChange}
                    className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all cursor-pointer"
                  >
                    <option value="4x6">4" x 6" (Despacho)</option>
                    <option value="4x2">4" x 2" (Caja)</option>
                    <option value="2x1">2" x 1" (Producto)</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 flex justify-center mt-6">
                <button className="text-wms-neon font-black text-sm flex items-center gap-2 hover:bg-wms-neon/10 border border-transparent hover:border-wms-neon/30 px-6 py-3 rounded-xl transition-all shadow-sm">
                  <Printer size={18} /> ETIQUETA DE PRUEBA
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WmsSettings;