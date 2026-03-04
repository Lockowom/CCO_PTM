import React, { useState, useEffect } from 'react';
import {
  Settings, Save, AlertTriangle, Printer, Truck,
  Package, Warehouse, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabase';
import gsap from 'gsap';

const WmsSettings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // general | inbound | outbound | printers

  // Estado de configuración (Simulado con localStorage para demo)
  const [config, setConfig] = useState({
    // General
    warehouse_name: 'Centro de Distribución Principal',
    warehouse_code: 'CD-01',
    timezone: 'America/Santiago',

    // Inbound
    allow_blind_reception: false,
    require_qc: true,
    auto_putaway_strategy: 'NEAREST_EMPTY', // NEAREST_EMPTY | ABC_ZONING

    // Outbound
    picking_strategy: 'FIFO', // FIFO | FEFO | LIFO
    allow_partial_picking: true,
    require_staging: true,

    // Printers
    label_printer_ip: '192.168.1.200',
    zpl_density: '8dmm', // 8dmm (203dpi) | 12dmm (300dpi)
    label_size: '4x6'
  });

  useEffect(() => {
    // Cargar config guardada
    const saved = localStorage.getItem('wms_settings_v1');
    if (saved) {
      setConfig(JSON.parse(saved));
    }

    // Animación entrada
    gsap.fromTo(".settings-card",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simular guardado en BD
      await new Promise(resolve => setTimeout(resolve, 800));

      localStorage.setItem('wms_settings_v1', JSON.stringify(config));

      // Animación éxito
      gsap.to(".save-btn", { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1 });
      alert('✅ Configuración guardada exitosamente');

    } catch (error) {
      console.error(error);
      alert('Error guardando configuración');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === id
          ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
          : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
        }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-slate-800 text-white rounded-xl shadow-lg">
              <Settings size={24} />
            </div>
            CONFIGURACIÓN WMS
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Reglas de negocio y parámetros operativos</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={loading}
          className="save-btn bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          GUARDAR CAMBIOS
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-2xl border-b border-slate-200 flex overflow-x-auto">
        <TabButton id="general" icon={<Warehouse size={18} />} label="General" />
        <TabButton id="inbound" icon={<Truck size={18} />} label="Recepción (Inbound)" />
        <TabButton id="outbound" icon={<Package size={18} />} label="Despacho (Outbound)" />
        <TabButton id="printers" icon={<Printer size={18} />} label="Impresoras y Etiquetas" />
      </div>

      {/* Content */}
      <div className="settings-card bg-white rounded-b-2xl shadow-sm border border-slate-200 p-8 min-h-[400px]">

        {/* GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 border-b pb-2">Identificación del Centro</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Almacén</label>
                  <input
                    type="text"
                    name="warehouse_name"
                    value={config.warehouse_name}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código (ID)</label>
                  <input
                    type="text"
                    name="warehouse_code"
                    value={config.warehouse_code}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-lg font-mono font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 border-b pb-2">Configuración Regional</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Zona Horaria</label>
                  <select
                    name="timezone"
                    value={config.timezone}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Truck className="text-indigo-500" /> Reglas de Recepción
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">Permitir Recepción Ciega</span>
                      <span className="block text-xs text-slate-500 mt-1">Ingresar stock sin orden de compra previa.</span>
                    </div>
                    <div className="relative inline-block w-14 h-7 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        name="allow_blind_reception"
                        checked={config.allow_blind_reception}
                        onChange={handleChange}
                        className="peer absolute opacity-0 w-0 h-0"
                      />
                      <span className="block bg-slate-200 w-full h-full rounded-full peer-checked:bg-indigo-600 transition-colors duration-300 shadow-inner"></span>
                      <span className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 peer-checked:translate-x-7 shadow-sm"></span>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">Requerir Control de Calidad (QC)</span>
                      <span className="block text-xs text-slate-500 mt-1">Inspección obligatoria antes del almacenaje.</span>
                    </div>
                    <div className="relative inline-block w-14 h-7 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        name="require_qc"
                        checked={config.require_qc}
                        onChange={handleChange}
                        className="peer absolute opacity-0 w-0 h-0"
                      />
                      <span className="block bg-slate-200 w-full h-full rounded-full peer-checked:bg-emerald-500 transition-colors duration-300 shadow-inner"></span>
                      <span className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 peer-checked:translate-x-7 shadow-sm"></span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Warehouse className="text-indigo-500" /> Estrategia de Putaway
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Algoritmo de Ubicación Sugerida</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${config.auto_putaway_strategy === 'NEAREST_EMPTY' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200'}`}>
                      <input type="radio" name="auto_putaway_strategy" value="NEAREST_EMPTY" checked={config.auto_putaway_strategy === 'NEAREST_EMPTY'} onChange={handleChange} className="accent-indigo-600" />
                      <div>
                        <span className="block text-sm font-bold text-slate-800">Cercanía (Nearest Empty)</span>
                        <span className="block text-xs text-slate-500">Llena vacíos más cercanos a la zona de recepción.</span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${config.auto_putaway_strategy === 'ABC_ZONING' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200'}`}>
                      <input type="radio" name="auto_putaway_strategy" value="ABC_ZONING" checked={config.auto_putaway_strategy === 'ABC_ZONING'} onChange={handleChange} className="accent-indigo-600" />
                      <div>
                        <span className="block text-sm font-bold text-slate-800">Zonificación ABC</span>
                        <span className="block text-xs text-slate-500">Ubica según rotación del producto (Alta/Media/Baja).</span>
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
            <div className="bg-orange-50 p-4 rounded-lg flex items-center gap-3 border border-orange-200 text-orange-800 text-sm font-medium">
              <AlertTriangle size={20} />
              <span>Los cambios en estrategias de picking afectarán a las órdenes generadas a partir de ahora.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-bold text-slate-800 border-b pb-2">Estrategia de Asignación (Allocation)</h3>

                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${config.picking_strategy === 'FIFO' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}>
                    <input type="radio" name="picking_strategy" value="FIFO" checked={config.picking_strategy === 'FIFO'} onChange={handleChange} className="accent-emerald-600" />
                    <div>
                      <span className="block font-bold text-slate-800">FIFO (First In, First Out)</span>
                      <span className="block text-xs text-slate-500">Prioriza lotes más antiguos por fecha de ingreso.</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${config.picking_strategy === 'FEFO' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}>
                    <input type="radio" name="picking_strategy" value="FEFO" checked={config.picking_strategy === 'FEFO'} onChange={handleChange} className="accent-emerald-600" />
                    <div>
                      <span className="block font-bold text-slate-800">FEFO (First Expire, First Out)</span>
                      <span className="block text-xs text-slate-500">Prioriza lotes con fecha de vencimiento más próxima.</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${config.picking_strategy === 'LIFO' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}>
                    <input type="radio" name="picking_strategy" value="LIFO" checked={config.picking_strategy === 'LIFO'} onChange={handleChange} className="accent-emerald-600" />
                    <div>
                      <span className="block font-bold text-slate-800">LIFO (Last In, First Out)</span>
                      <span className="block text-xs text-slate-500">Prioriza lotes más recientes. (No recomendado para perecibles).</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-slate-800 border-b pb-2">Reglas de Proceso</h3>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">Permitir Picking Parcial</span>
                      <span className="block text-xs text-slate-500 mt-1">Habilita cerrar órdenes aunque existan faltantes físicos.</span>
                    </div>
                    <div className="relative inline-block w-14 h-7 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        name="allow_partial_picking"
                        checked={config.allow_partial_picking}
                        onChange={handleChange}
                        className="peer absolute opacity-0 w-0 h-0"
                      />
                      <span className="block bg-slate-200 w-full h-full rounded-full peer-checked:bg-indigo-600 transition-colors duration-300 shadow-inner"></span>
                      <span className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 peer-checked:translate-x-7 shadow-sm"></span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRINTERS */}
        {activeTab === 'printers' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-slate-900 text-white p-6 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Printer className="text-emerald-400" /> Servidor de Impresión
                </h3>
                <p className="text-slate-400 text-sm">Configuración de impresoras térmicas Zebra (ZPL)</p>
              </div>
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/50">
                ACTIVO
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IP Impresora Principal (Zebra)</label>
                <input
                  type="text"
                  name="label_printer_ip"
                  value={config.label_printer_ip}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-200 rounded-lg font-mono font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="192.168.x.x"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Formato de Etiqueta</label>
                <select
                  name="label_size"
                  value={config.label_size}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="4x6">4" x 6" (Despacho / Pallet)</option>
                  <option value="4x2">4" x 2" (Ubicación / Caja)</option>
                  <option value="2x1">2" x 1" (Producto Pequeño)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex justify-center">
              <button className="text-indigo-600 font-bold text-sm flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                <Printer size={16} /> IMPRIMIR ETIQUETA DE PRUEBA
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WmsSettings;
