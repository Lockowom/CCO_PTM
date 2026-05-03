import React, { useState, useRef } from 'react';
import { 
  Truck, Clock, CheckCircle, Package, AlertTriangle, 
  ScanBarcode, XCircle, FileCheck, QrCode, Save, Loader2, History, Search, Printer
} from 'lucide-react';
import { supabase } from '../../supabase';
import { InventoryService } from '../../services/inventoryService';
import { LabelPrinter } from '../../services/labelPrinter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';

const generateLPN = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'LPN-';
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const Reception = () => {
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    proveedor: '',
    ordenCompra: '',
    notas: ''
  });

  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current, { 
      y: 20, 
      opacity: 0, 
      duration: 0.4, 
      ease: "power3.out",
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const { data: history = [], isLoading: loadingData } = useQuery({
    queryKey: ['receptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_recepciones')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredHistory = history.filter(item => 
    (item.proveedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.orden_compra || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending: history.filter(r => r.estado === 'PENDIENTE').length,
    verified: history.filter(r => r.estado === 'VERIFICADA').length,
    items: history.reduce((acc, curr) => acc + (curr.items_count || 0), 0),
    discrepancies: history.filter(r => r.estado === 'CON_DISCREPANCIAS').length
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const codigo = e.target.codigo.value.toUpperCase();
    const cantidad = parseInt(e.target.cantidad.value) || 1;
    
    if (!codigo) return;

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
    
    gsap.fromTo(".scanned-item-new", 
      { x: -20, opacity: 0, backgroundColor: "#10b981" }, 
      { x: 0, opacity: 1, backgroundColor: "transparent", duration: 0.5 }
    );
  };

  const printItemLabel = async (item) => {
    const result = await LabelPrinter.printLabel({
        sku: item.codigo,
        desc: 'Producto Recibido',
        batch: item.lpn,
        qty: item.cantidad
    });
    
    if (result.success) {
        toast.success('🖨️ Etiqueta enviada a impresión');
    } else {
        toast.error('Error impresión: ' + result.message);
    }
  };

  const removeScannedItem = (id) => {
    setScannedItems(scannedItems.filter(i => i.id !== id));
  };

  const saveReceptionMutation = useMutation({
    mutationFn: async () => {
      const totalItems = scannedItems.reduce((acc, curr) => acc + curr.cantidad, 0);
      
      const { data: receptionData, error: receptionError } = await supabase
        .from('tms_recepciones')
        .insert({
          proveedor: form.proveedor,
          orden_compra: form.ordenCompra,
          items_count: totalItems,
          productos: scannedItems.map(i => i.codigo).join(', '),
          notas: form.notas,
          estado: 'VERIFICADA',
          fecha_recepcion: new Date()
        })
        .select()
        .single();

      if (receptionError) throw receptionError;

      const movePromises = scannedItems.map(item => 
        InventoryService.moveStock({
          sku: item.codigo,
          batch: item.lpn,
          fromLoc: 'PROVEEDOR',
          toLoc: 'RECEPCION',
          qty: item.cantidad,
          userId: 'user-uuid',
          reason: `RECEPCION OC: ${form.ordenCompra}`
        })
      );

      const results = await Promise.all(movePromises);
      const errors = results.filter(r => !r.success);
      if (errors.length > 0) {
        throw new Error(`${errors.length} items tuvieron problemas al ingresar al stock.`);
      }
      return receptionData;
    },
    onSuccess: (data) => {
      toast.success(`Recepción #${data.id} guardada exitosamente.`);
      setForm({ proveedor: '', ordenCompra: '', notas: '' });
      setScannedItems([]);
      setScanning(false);
      queryClient.invalidateQueries(['receptions']);
      queryClient.invalidateQueries(['inventory']);
    },
    onError: (err) => {
      toast.error('Error al guardar: ' + err.message);
    }
  });

  const handleSubmit = () => {
    if (!form.proveedor || scannedItems.length === 0) {
      toast.error("Debes indicar proveedor y escanear al menos un producto");
      return;
    }
    saveReceptionMutation.mutate();
  };

  return (
    <div ref={containerRef} className="space-y-6 min-h-screen bg-wms-dark p-6 text-slate-300 pb-20">
      {/* Header Glassmorphism */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-wms-panel/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-wms-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-wms-neon/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-wms-dark/80 border border-wms-neon/50 rounded-2xl flex items-center justify-center text-wms-neon shadow-neon-green">
            <Truck size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Recepción <span className="text-wms-neon">Inteligente</span></h1>
            <p className="text-slate-400 font-medium mt-1">Control de Ingresos y Generación LPN</p>
          </div>
        </div>

        <div className="flex gap-2 relative z-10">
          {!scanning ? (
            <button 
              onClick={() => setScanning(true)}
              className="bg-wms-neon/20 border border-wms-neon text-wms-neon hover:bg-wms-neon hover:text-wms-dark px-6 py-3 rounded-2xl font-black shadow-neon-green transition-all active:scale-95 flex items-center gap-2"
            >
              <ScanBarcode size={20} /> NUEVA RECEPCIÓN
            </button>
          ) : (
            <button 
              onClick={() => setScanning(false)}
              className="bg-wms-dark/60 border border-wms-danger text-wms-danger hover:bg-wms-danger hover:text-white px-6 py-3 rounded-2xl font-black transition-all flex items-center gap-2"
            >
              <XCircle size={20} /> CANCELAR
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="text-wms-alert" />} label="Pendientes" value={stats.pending} color="border-wms-alert/30 text-wms-alert bg-wms-alert/10" />
        <StatCard icon={<CheckCircle className="text-wms-neon" />} label="Verificadas Hoy" value={stats.verified} color="border-wms-neon/30 text-wms-neon bg-wms-neon/10" />
        <StatCard icon={<Package className="text-blue-400" />} label="Items Recibidos" value={stats.items} color="border-blue-400/30 text-blue-400 bg-blue-400/10" />
        <StatCard icon={<AlertTriangle className="text-wms-danger" />} label="Discrepancias" value={stats.discrepancies} color="border-wms-danger/30 text-wms-danger bg-wms-danger/10" />
      </div>

      {scanning ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-3xl border border-wms-border shadow-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <FileCheck className="text-blue-400" />
                Datos de Cabecera
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Proveedor *</label>
                  <input 
                    type="text" 
                    value={form.proveedor}
                    onChange={e => setForm({...form, proveedor: e.target.value})}
                    className="w-full p-3 bg-wms-dark border border-wms-border rounded-xl text-sm font-bold focus:border-wms-neon outline-none text-white transition-all"
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
                    className="w-full p-3 bg-wms-dark border border-wms-border rounded-xl text-sm font-bold focus:border-wms-neon outline-none text-white transition-all"
                    placeholder="Ej: OC-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notas</label>
                  <textarea 
                    value={form.notas}
                    onChange={e => setForm({...form, notas: e.target.value})}
                    className="w-full p-3 bg-wms-dark border border-wms-border rounded-xl text-sm focus:border-wms-neon outline-none text-white transition-all resize-none"
                    rows="2"
                    placeholder="Comentarios..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-wms-dark/80 p-6 rounded-3xl border border-wms-border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ScanBarcode size={100} />
              </div>
              <h3 className="font-bold mb-4 flex items-center gap-2 relative z-10 text-white">
                <QrCode className="text-wms-neon" />
                Escáner de Entrada
              </h3>
              
              <form onSubmit={handleAddItem} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Código de Producto (SKU)</label>
                  <div className="relative">
                    <input 
                      name="codigo"
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 bg-wms-panel border border-wms-border rounded-xl text-wms-neon font-mono text-lg font-bold focus:border-wms-neon outline-none placeholder:text-slate-600 uppercase"
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
                      className="w-full p-3 bg-wms-panel border border-wms-border rounded-xl text-white font-bold text-center focus:border-wms-neon outline-none"
                    />
                  </div>
                  <button type="submit" className="bg-wms-neon/20 border border-wms-neon text-wms-neon hover:bg-wms-neon hover:text-wms-dark rounded-xl font-bold text-sm transition-colors flex flex-col items-center justify-center shadow-neon-green">
                    <Package size={20} />
                    AGREGAR
                  </button>
                </div>
              </form>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={saveReceptionMutation.isPending || scannedItems.length === 0}
              className="w-full py-4 bg-blue-600/20 border border-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-black text-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-3"
            >
              {saveReceptionMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={24} />}
              FINALIZAR RECEPCIÓN
            </button>
          </div>

          <div className="xl:col-span-2">
            <div className="bg-wms-panel/80 backdrop-blur-xl rounded-3xl shadow-xl border border-wms-border h-full flex flex-col overflow-hidden">
              <div className="p-6 border-b border-wms-border flex justify-between items-center bg-wms-dark/40">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Package className="text-blue-400" />
                    Items Escaneados
                  </h3>
                  <p className="text-xs text-slate-400">Se generarán etiquetas LPN automáticamente</p>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-white">{scannedItems.length}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bultos</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-wms-dark/20 min-h-[400px]">
                {scannedItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <QrCode size={64} className="mb-4" />
                    <p className="font-medium">Esperando escaneo de productos...</p>
                  </div>
                ) : (
                  scannedItems.map((item, idx) => (
                    <div key={item.id} className="scanned-item-new bg-wms-dark p-4 rounded-xl border border-wms-border shadow-sm flex items-center gap-4 group hover:border-blue-400/50 transition-all">
                      <div className="w-10 h-10 bg-wms-panel rounded-lg flex items-center justify-center font-bold text-slate-400 text-sm">
                        {scannedItems.length - idx}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-white text-lg">{item.codigo}</span>
                          <span className="bg-wms-neon/20 text-wms-neon text-[10px] font-bold px-2 py-0.5 rounded-full border border-wms-neon/30">
                            CANT: {item.cantidad}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <ScanBarcode size={12} />
                          <span className="font-mono text-blue-400 font-bold">{item.lpn}</span>
                          <span className="text-slate-600">•</span>
                          <span>Pendiente Etiquetado</span>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => printItemLabel(item)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg" 
                        >
                          <Printer size={18} />
                        </button>
                        <button onClick={() => removeScannedItem(item.id)} className="p-2 text-slate-400 hover:text-wms-danger hover:bg-wms-danger/10 rounded-lg">
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
        <div className="bg-wms-panel/80 backdrop-blur-xl rounded-3xl shadow-xl border border-wms-border overflow-hidden">
          <div className="p-6 border-b border-wms-border flex justify-between items-center bg-wms-dark/40">
            <h3 className="font-bold text-white flex items-center gap-2">
              <History size={20} className="text-slate-400" /> 
              Historial de Recepciones
            </h3>
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proveedor o OC..." 
                className="pl-9 pr-4 py-2 bg-wms-dark border border-wms-border rounded-xl text-sm focus:border-wms-neon outline-none text-white w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-wms-dark text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-wms-border">
                <tr>
                  <th className="px-6 py-4">ID / Fecha</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">OC</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Items</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wms-border/50">
                {loadingData ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : filteredHistory.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold">No hay recepciones recientes</td></tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-wms-dark/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="block font-bold text-blue-400">#{item.id}</span>
                        <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{item.proveedor}</td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-xs">{item.orden_compra || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          item.estado === 'VERIFICADA' ? 'bg-wms-neon/20 text-wms-neon border-wms-neon/30' : 
                          item.estado === 'PENDIENTE' ? 'bg-wms-alert/20 text-wms-alert border-wms-alert/30' :
                          'bg-wms-danger/20 text-wms-danger border-wms-danger/30'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-300">{item.items_count}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-blue-400 hover:text-blue-300 font-bold text-xs hover:underline">Ver Detalle</button>
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
  <div className={`p-5 rounded-2xl border ${color} flex items-center gap-4 backdrop-blur-sm shadow-sm hover:scale-105 transition-transform bg-wms-panel/80`}>
    <div className="p-3 bg-wms-dark rounded-xl shadow-sm">{icon}</div>
    <div>
      <h4 className="text-3xl font-black text-white tracking-tight">{value}</h4>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
    </div>
  </div>
);

export default Reception;
