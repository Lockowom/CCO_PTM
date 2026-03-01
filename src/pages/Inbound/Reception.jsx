import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Truck, ClipboardCheck, AlertTriangle, Clock, Save, History, 
  CheckCircle, Package, Loader2, ScanBarcode, QrCode, FileCheck, 
  Camera, Upload, XCircle, Printer
} from 'lucide-react';
import { supabase } from '../../supabase';
import gsap from 'gsap';

// Generador de ID aleatorio para LPN (License Plate Number)
const generateLPN = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'LPN-';
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const Reception = () => {
  const [stats, setStats] = useState({ pending: 0, verified: 0, items: 0, discrepancies: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estado para modo de escaneo
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  
  // Formulario principal
  const [form, setForm] = useState({
    proveedor: '',
    ordenCompra: '',
    notas: ''
  });

  // Referencias para animación
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const formRef = useRef(null);

  // Animación inicial
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(".stat-card", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.2 });
      gsap.from(formRef.current, { x: -30, opacity: 0, duration: 0.6, delay: 0.4 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

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
      
      const pending = data.filter(r => r.estado === 'PENDIENTE').length;
      const verified = data.filter(r => r.estado === 'VERIFICADA').length;
      const items = data.reduce((acc, curr) => acc + (curr.items_count || 0), 0);
      const discrepancies = data.filter(r => r.estado === 'CON_DISCREPANCIAS').length;

      setStats({ pending, verified, items, discrepancies });
    } catch (err) {
      console.error('Error fetching receptions:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Agregar item escaneado a la lista temporal
  const handleAddItem = (e) => {
    e.preventDefault();
    const codigo = e.target.codigo.value.toUpperCase();
    const cantidad = parseInt(e.target.cantidad.value) || 1;
    
    if (!codigo) return;

    // Generar LPN único para este bulto
    const newItem = {
      id: Date.now(),
      codigo,
      cantidad,
      lpn: generateLPN(),
      estado: 'RECIBIDO'
    };

    setScannedItems([newItem, ...scannedItems]);
    e.target.reset();
    e.target.codigo.focus();
    
    // Animación de entrada
    gsap.fromTo(".scanned-item-new", 
      { x: -20, opacity: 0, backgroundColor: "#d1fae5" }, 
      { x: 0, opacity: 1, backgroundColor: "white", duration: 0.5 }
    );
  };

  const removeScannedItem = (id) => {
    setScannedItems(scannedItems.filter(i => i.id !== id));
  };

  const handleSubmit = async () => {
    if (!form.proveedor || scannedItems.length === 0) {
      alert("Debes indicar proveedor y escanear al menos un producto");
      return;
    }

    setLoading(true);
    try {
      const totalItems = scannedItems.reduce((acc, curr) => acc + curr.cantidad, 0);
      
      // Guardar cabecera
      const { data: receptionData, error: receptionError } = await supabase
        .from('tms_recepciones')
        .insert({
          proveedor: form.proveedor,
          orden_compra: form.ordenCompra,
          items_count: totalItems,
          productos: scannedItems.map(i => i.codigo).join(', '), // Resumen simple
          notas: form.notas,
          estado: 'VERIFICADA', // Asumimos verificada si se escaneó
          fecha_recepcion: new Date()
        })
        .select()
        .single();

      if (receptionError) throw receptionError;

      // Aquí idealmente guardaríamos el detalle en una tabla 'tms_recepciones_detalle'
      // con los LPNs generados para trazabilidad futura.
      
      alert(`Recepción #${receptionData.id} guardada exitosamente con ${scannedItems.length} bultos.`);
      
      // Reset
      setForm({ proveedor: '', ordenCompra: '', notas: '' });
      setScannedItems([]);
      setScanning(false);
      fetchReceptions();

    } catch (err) {
      console.error(err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
              <Truck size={24} />
            </div>
            RECEPCIÓN INTELIGENTE
          </h2>
          <p className="text-slate-500 text-sm mt-1 ml-1 font-medium">Control de Ingresos y Generación LPN</p>
        </div>
        <div className="flex gap-2">
          {!scanning ? (
            <button 
              onClick={() => setScanning(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <ScanBarcode size={20} />
              NUEVA RECEPCIÓN
            </button>
          ) : (
            <button 
              onClick={() => setScanning(false)}
              className="bg-white border-2 border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <XCircle size={20} />
              CANCELAR
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="text-orange-600" />} label="Pendientes" value={stats.pending} color="bg-orange-50 border-orange-100" />
        <StatCard icon={<CheckCircle className="text-emerald-600" />} label="Verificadas Hoy" value={stats.verified} color="bg-emerald-50 border-emerald-100" />
        <StatCard icon={<Package className="text-blue-600" />} label="Items Recibidos" value={stats.items} color="bg-blue-50 border-blue-100" />
        <StatCard icon={<AlertTriangle className="text-rose-600" />} label="Discrepancias" value={stats.discrepancies} color="bg-rose-50 border-rose-100" />
      </div>

      {scanning ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Columna Izquierda: Datos Cabecera y Escáner */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Cabecera */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileCheck className="text-blue-500" />
                Datos de Cabecera
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Proveedor *</label>
                  <input 
                    type="text" 
                    value={form.proveedor}
                    onChange={e => setForm({...form, proveedor: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej: DISTRIBUIDORA S.A."
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Orden de Compra (OC)</label>
                  <input 
                    type="text" 
                    value={form.ordenCompra}
                    onChange={e => setForm({...form, ordenCompra: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej: OC-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notas</label>
                  <textarea 
                    value={form.notas}
                    onChange={e => setForm({...form, notas: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                    rows="2"
                    placeholder="Comentarios sobre la descarga..."
                  />
                </div>
              </div>
            </div>

            {/* Escáner */}
            <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ScanBarcode size={100} />
              </div>
              <h3 className="font-bold mb-4 flex items-center gap-2 relative z-10">
                <QrCode className="text-emerald-400" />
                Escáner de Entrada
              </h3>
              
              <form onSubmit={handleAddItem} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Código de Producto (SKU)</label>
                  <div className="relative">
                    <input 
                      name="codigo"
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono text-lg font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-slate-600 uppercase"
                      placeholder="ESCANEAR AQUI..."
                      autoComplete="off"
                    />
                    <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cantidad</label>
                    <input 
                      name="cantidad"
                      type="number" 
                      defaultValue="1"
                      min="1"
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-center focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors flex flex-col items-center justify-center">
                    <Package size={20} />
                    AGREGAR
                  </button>
                </div>
              </form>
            </div>

            {/* Acciones Finales */}
            <button 
              onClick={handleSubmit}
              disabled={loading || scannedItems.length === 0}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-black text-lg shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
              FINALIZAR RECEPCIÓN
            </button>

          </div>

          {/* Columna Derecha: Lista de Items Escaneados (LPNs) */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Package className="text-indigo-500" />
                    Items Escaneados
                  </h3>
                  <p className="text-xs text-slate-500">Se generarán etiquetas LPN automáticamente</p>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-slate-800">{scannedItems.length}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bultos</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 min-h-[400px]">
                {scannedItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <QrCode size={64} className="mb-4" />
                    <p className="font-medium">Esperando escaneo de productos...</p>
                  </div>
                ) : (
                  scannedItems.map((item, idx) => (
                    <div key={item.id} className="scanned-item-new bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-300 transition-all">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 text-sm">
                        {scannedItems.length - idx}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-slate-800 text-lg">{item.codigo}</span>
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            CANT: {item.cantidad}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <ScanBarcode size={12} />
                          <span className="font-mono text-indigo-600 font-bold">{item.lpn}</span>
                          <span className="text-slate-300">•</span>
                          <span>Pendiente Etiquetado</span>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Imprimir Etiqueta LPN">
                          <Printer size={18} />
                        </button>
                        <button onClick={() => removeScannedItem(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        // VISTA HISTORIAL (Original mejorada)
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History size={20} className="text-slate-400" /> 
              Historial de Recepciones
            </h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar proveedor o OC..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">ID / Fecha</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">OC</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Items</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingData ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">Cargando datos...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">No hay recepciones recientes</td></tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="block font-bold text-indigo-600">#{item.id}</span>
                        <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{item.proveedor}</td>
                      <td className="px-6 py-4 font-mono text-slate-600 text-xs">{item.orden_compra || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          item.estado === 'VERIFICADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          item.estado === 'PENDIENTE' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">{item.items_count}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-blue-600 hover:text-blue-800 font-bold text-xs hover:underline">Ver Detalle</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`stat-card p-5 rounded-2xl border ${color} flex items-center gap-4 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all`}>
    <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
    <div>
      <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h4>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

export default Reception;
