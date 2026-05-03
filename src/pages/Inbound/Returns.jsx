import React, { useState, useRef } from 'react';
import { 
  RotateCcw, Search, FileText, CheckCircle, 
  XCircle, AlertTriangle, Package, ArrowRight,
  ClipboardList, Truck, RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabase';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';

const Returns = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('request');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulario RMA
  const [selectedItems, setSelectedItems] = useState({});
  const [reasons, setReasons] = useState({});

  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const { data: returnsList = [], isLoading: loadingReturns } = useQuery({
    queryKey: ['returns'],
    queryFn: async () => {
      // Simular carga de devoluciones (mock)
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { id: 'RMA-2024-001', nv: '10234', cliente: 'Farmacias Ahumada', fecha: new Date().toISOString(), estado: 'PENDIENTE_RECEPCION', items: 3 },
        { id: 'RMA-2024-002', nv: '10220', cliente: 'Hospital Regional', fecha: new Date(Date.now() - 86400000).toISOString(), estado: 'RECIBIDO', items: 1 },
      ];
    }
  });

  const { data: orderData, isLoading: loadingOrder, refetch: searchOrder } = useQuery({
    queryKey: ['order', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return null;
      // Simular búsqueda de N.V. original
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock result
      return {
        nv: searchTerm,
        cliente: 'Cliente Demo S.A.',
        fecha_venta: '2024-02-20',
        items: [
          { codigo: 'SKU-1001', descripcion: 'Paracetamol 500mg', cantidad_vendida: 100, precio: 1500 },
          { codigo: 'SKU-1005', descripcion: 'Ibuprofeno 400mg', cantidad_vendida: 50, precio: 2000 },
          { codigo: 'SKU-2020', descripcion: 'Jarabe Tos Adulto', cantidad_vendida: 20, precio: 4500 },
        ]
      };
    },
    enabled: false,
    onSuccess: () => {
      setSelectedItems({});
      setReasons({});
    },
    onError: () => {
      toast.error('Orden no encontrada');
    }
  });

  const handleItemSelect = (codigo, checked) => {
    setSelectedItems(prev => ({
      ...prev,
      [codigo]: checked ? 1 : 0
    }));
  };

  const handleQtyChange = (codigo, qty) => {
    setSelectedItems(prev => ({
      ...prev,
      [codigo]: parseInt(qty) || 0
    }));
  };

  const handleReasonChange = (codigo, reason) => {
    setReasons(prev => ({
      ...prev,
      [codigo]: reason
    }));
  };

  const createRMAMutation = useMutation({
    mutationFn: async (itemsToReturn) => {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'RMA-2024-NEW';
    },
    onSuccess: (id) => {
      toast.success(`✅ RMA Generado Exitosamente: ${id}`);
      setSearchTerm('');
      queryClient.setQueryData(['order', searchTerm], null);
      setActiveTab('process');
      queryClient.invalidateQueries(['returns']);
    }
  });

  const createRMA = () => {
    const itemsToReturn = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([codigo, qty]) => ({
        codigo,
        cantidad: qty,
        motivo: reasons[codigo] || 'Sin motivo'
      }));

    if (itemsToReturn.length === 0) {
      toast.error('Seleccione al menos un ítem para devolver');
      return;
    }

    if (confirm(`¿Generar solicitud de devolución (RMA) para ${itemsToReturn.length} productos?`)) {
      createRMAMutation.mutate(itemsToReturn);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 pb-20 min-h-screen bg-wms-dark p-6 text-slate-300">
      {/* Header Glassmorphism */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-wms-panel/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-wms-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-wms-danger/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-wms-dark/80 border border-wms-danger/50 rounded-2xl flex items-center justify-center text-wms-danger shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <RotateCcw size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Logística <span className="text-wms-danger">Inversa</span> (RMA)</h2>
            <p className="text-slate-400 font-medium mt-1">Gestión de devoluciones, rechazos y garantías</p>
          </div>
        </div>
        
        <div className="flex bg-wms-dark/60 p-1 rounded-2xl border border-wms-border shadow-sm relative z-10">
          <button 
            onClick={() => setActiveTab('request')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'request' ? 'bg-wms-danger/20 text-wms-danger shadow-md border border-wms-danger/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={16} /> Nueva Solicitud
          </button>
          <button 
            onClick={() => setActiveTab('process')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'process' ? 'bg-wms-panel text-white shadow-md border border-wms-border' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList size={16} /> Gestión RMAs
          </button>
        </div>
      </div>

      {activeTab === 'request' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Buscador */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-3xl border border-wms-border shadow-xl">
              <h3 className="font-bold text-white mb-4">Buscar Venta Original</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">N° Nota de Venta / Factura</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 bg-wms-dark border border-wms-border rounded-xl font-mono font-bold text-white focus:border-wms-danger outline-none transition-all"
                      placeholder="Ej: 10234"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchOrder()}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  </div>
                </div>
                <button 
                  onClick={() => searchOrder()}
                  disabled={loadingOrder || !searchTerm}
                  className="w-full py-3 bg-wms-danger/20 text-wms-danger border border-wms-danger hover:bg-wms-danger hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingOrder ? <RefreshCw className="animate-spin" /> : <Search size={18} />}
                  BUSCAR ORDEN
                </button>
              </div>
            </div>

            {orderData && (
              <div className="bg-wms-neon/10 p-6 rounded-3xl border border-wms-neon/30">
                <h4 className="font-bold text-wms-neon flex items-center gap-2 mb-2">
                  <CheckCircle size={18} /> Orden Encontrada
                </h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span className="opacity-70">Cliente:</span>
                    <span className="font-bold text-white">{orderData.cliente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Fecha:</span>
                    <span className="font-bold text-white">{orderData.fecha_venta}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selección de Items */}
          <div className="lg:col-span-2">
            {orderData ? (
              <div className="bg-wms-panel/80 backdrop-blur-xl rounded-3xl shadow-xl border border-wms-border overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-wms-border flex justify-between items-center bg-wms-dark/40">
                  <h3 className="font-bold text-white">Seleccionar Productos a Devolver</h3>
                  <span className="text-xs font-bold bg-wms-panel text-slate-400 px-3 py-1 rounded-lg border border-wms-border">
                    {orderData.items.length} Items Disponibles
                  </span>
                </div>
                
                <div className="p-6 space-y-4 flex-1">
                  {orderData.items.map((item) => (
                    <div key={item.codigo} className={`p-4 rounded-2xl border transition-all ${
                      selectedItems[item.codigo] > 0 ? 'border-wms-danger bg-wms-danger/10' : 'border-wms-border bg-wms-dark/40'
                    }`}>
                      <div className="flex items-start gap-4">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-5 h-5 accent-wms-danger bg-wms-dark border-wms-border"
                          checked={!!selectedItems[item.codigo]}
                          onChange={(e) => handleItemSelect(item.codigo, e.target.checked)}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-bold text-white">{item.descripcion}</h4>
                            <span className="font-mono text-xs text-slate-400">{item.codigo}</span>
                          </div>
                          
                          {selectedItems[item.codigo] > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cantidad a Devolver</label>
                                <input 
                                  type="number" 
                                  max={item.cantidad_vendida}
                                  min="1"
                                  value={selectedItems[item.codigo]}
                                  onChange={(e) => handleQtyChange(item.codigo, e.target.value)}
                                  className="w-full p-2 bg-wms-panel border border-wms-border rounded-lg text-sm font-bold text-white focus:border-wms-danger outline-none"
                                />
                                <span className="text-[10px] text-slate-500">Máx: {item.cantidad_vendida}</span>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Motivo</label>
                                <select 
                                  className="w-full p-2 bg-wms-panel border border-wms-border rounded-lg text-sm text-white focus:border-wms-danger outline-none"
                                  onChange={(e) => handleReasonChange(item.codigo, e.target.value)}
                                >
                                  <option value="">Seleccionar...</option>
                                  <option value="DAMAGED">Producto Dañado</option>
                                  <option value="WRONG_ITEM">Producto Incorrecto</option>
                                  <option value="EXPIRED">Vencido / Corta fecha</option>
                                  <option value="CUSTOMER_RETURN">Desistimiento Cliente</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-wms-border bg-wms-dark/40">
                  <button 
                    onClick={createRMA}
                    disabled={createRMAMutation.isPending}
                    className="w-full py-4 bg-wms-danger/20 border border-wms-danger hover:bg-wms-danger text-wms-danger hover:text-white rounded-xl font-black text-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {createRMAMutation.isPending ? <RefreshCw className="animate-spin" /> : <RotateCcw size={24} />}
                    GENERAR ORDEN DE DEVOLUCIÓN (RMA)
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-wms-border rounded-3xl bg-wms-panel/50 min-h-[400px]">
                <Package size={64} className="mb-4 opacity-20" />
                <p className="font-bold">Busca una orden para comenzar</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // VISTA GESTIÓN
        <div className="bg-wms-panel/80 backdrop-blur-xl rounded-3xl shadow-xl border border-wms-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-wms-dark text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-wms-border">
                <tr>
                  <th className="px-6 py-4">ID RMA</th>
                  <th className="px-6 py-4">N.V. Original</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Fecha Solicitud</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wms-border/50">
                {loadingReturns ? (
                   <tr><td colSpan="7" className="p-8 text-center text-slate-400"><RefreshCw className="animate-spin mx-auto" /></td></tr>
                ) : returnsList.map(rma => (
                  <tr key={rma.id} className="hover:bg-wms-dark/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-wms-danger">{rma.id}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{rma.nv}</td>
                    <td className="px-6 py-4 text-white">{rma.cliente}</td>
                    <td className="px-6 py-4 text-slate-500">{format(new Date(rma.fecha), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 font-bold text-wms-neon">{rma.items}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        rma.estado === 'RECIBIDO' 
                          ? 'bg-wms-neon/20 text-wms-neon border-wms-neon/30' 
                          : 'bg-wms-alert/20 text-wms-alert border-wms-alert/30'
                      }`}>
                        {rma.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {rma.estado === 'PENDIENTE_RECEPCION' ? (
                        <button className="text-xs font-bold bg-wms-panel border border-wms-border text-white px-3 py-1.5 rounded-lg hover:border-wms-neon hover:text-wms-neon transition-colors flex items-center gap-1 mx-auto">
                          <Truck size={12} /> Recibir
                        </button>
                      ) : (
                        <button className="text-xs font-bold text-slate-400 hover:text-blue-400 flex items-center gap-1 mx-auto transition-colors">
                          Ver Detalle <ArrowRight size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;
