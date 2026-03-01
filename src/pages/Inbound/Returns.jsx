import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, Search, FileText, CheckCircle, 
  XCircle, AlertTriangle, Package, ArrowRight,
  ClipboardList, Truck, RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabase';
import { format } from 'date-fns';

const Returns = () => {
  const [activeTab, setActiveTab] = useState('request'); // request | process
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [returnsList, setReturnsList] = useState([]);

  // Formulario RMA
  const [selectedItems, setSelectedItems] = useState({});
  const [reasons, setReasons] = useState({});

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    // Simular carga de devoluciones existentes
    setLoading(true);
    try {
      // En producción: SELECT * FROM tms_returns
      await new Promise(resolve => setTimeout(resolve, 500));
      setReturnsList([
        { id: 'RMA-2024-001', nv: '10234', cliente: 'Farmacias Ahumada', fecha: new Date().toISOString(), estado: 'PENDIENTE_RECEPCION', items: 3 },
        { id: 'RMA-2024-002', nv: '10220', cliente: 'Hospital Regional', fecha: new Date(Date.now() - 86400000).toISOString(), estado: 'RECIBIDO', items: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const searchOrder = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      // Simular búsqueda de N.V. original
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock result
      setOrderData({
        nv: searchTerm,
        cliente: 'Cliente Demo S.A.',
        fecha_venta: '2024-02-20',
        items: [
          { codigo: 'SKU-1001', descripcion: 'Paracetamol 500mg', cantidad_vendida: 100, precio: 1500 },
          { codigo: 'SKU-1005', descripcion: 'Ibuprofeno 400mg', cantidad_vendida: 50, precio: 2000 },
          { codigo: 'SKU-2020', descripcion: 'Jarabe Tos Adulto', cantidad_vendida: 20, precio: 4500 },
        ]
      });
      setSelectedItems({});
      setReasons({});
    } catch (err) {
      alert('Orden no encontrada');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (codigo, checked) => {
    setSelectedItems(prev => ({
      ...prev,
      [codigo]: checked ? 1 : 0 // Default 1 qty
    }));
  };

  const handleQtyChange = (codigo, qty) => {
    setSelectedItems(prev => ({
      ...prev,
      [codigo]: parseInt(qty)
    }));
  };

  const handleReasonChange = (codigo, reason) => {
    setReasons(prev => ({
      ...prev,
      [codigo]: reason
    }));
  };

  const createRMA = async () => {
    const itemsToReturn = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([codigo, qty]) => ({
        codigo,
        cantidad: qty,
        motivo: reasons[codigo] || 'Sin motivo'
      }));

    if (itemsToReturn.length === 0) {
      alert('Seleccione al menos un ítem para devolver');
      return;
    }

    if (confirm(`¿Generar solicitud de devolución (RMA) para ${itemsToReturn.length} productos?`)) {
      setLoading(true);
      // Simular guardado
      setTimeout(() => {
        alert('✅ RMA Generado Exitosamente: RMA-2024-NEW');
        setOrderData(null);
        setSearchTerm('');
        setActiveTab('process');
        fetchReturns();
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200">
              <RotateCcw size={24} />
            </div>
            LOGÍSTICA INVERSA (RMA)
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Gestión de devoluciones, rechazos y garantías</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'request' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText size={16} /> Nueva Solicitud
          </button>
          <button 
            onClick={() => setActiveTab('process')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'process' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <ClipboardList size={16} /> Gestión RMAs
          </button>
        </div>
      </div>

      {activeTab === 'request' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Buscador */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Buscar Venta Original</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">N° Nota de Venta / Factura</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="Ej: 10234"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchOrder()}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>
                <button 
                  onClick={searchOrder}
                  disabled={loading || !searchTerm}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <Search size={18} />}
                  BUSCAR ORDEN
                </button>
              </div>
            </div>

            {orderData && (
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-2">
                  <CheckCircle size={18} /> Orden Encontrada
                </h4>
                <div className="space-y-2 text-sm text-rose-900">
                  <div className="flex justify-between">
                    <span className="opacity-70">Cliente:</span>
                    <span className="font-bold">{orderData.cliente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Fecha:</span>
                    <span className="font-bold">{orderData.fecha_venta}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selección de Items */}
          <div className="lg:col-span-2">
            {orderData ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">Seleccionar Productos a Devolver</h3>
                  <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded">
                    {orderData.items.length} Items Disponibles
                  </span>
                </div>
                
                <div className="p-6 space-y-4 flex-1">
                  {orderData.items.map((item) => (
                    <div key={item.codigo} className={`p-4 rounded-xl border transition-all ${
                      selectedItems[item.codigo] > 0 ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                    }`}>
                      <div className="flex items-start gap-4">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-5 h-5 accent-rose-600"
                          checked={!!selectedItems[item.codigo]}
                          onChange={(e) => handleItemSelect(item.codigo, e.target.checked)}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-bold text-slate-800">{item.descripcion}</h4>
                            <span className="font-mono text-xs text-slate-500">{item.codigo}</span>
                          </div>
                          
                          {selectedItems[item.codigo] > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cantidad a Devolver</label>
                                <input 
                                  type="number" 
                                  max={item.cantidad_vendida}
                                  min="1"
                                  value={selectedItems[item.codigo]}
                                  onChange={(e) => handleQtyChange(item.codigo, e.target.value)}
                                  className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold"
                                />
                                <span className="text-[10px] text-slate-400">Máx: {item.cantidad_vendida}</span>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Motivo</label>
                                <select 
                                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
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

                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <button 
                    onClick={createRMA}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-lg shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={24} />
                    GENERAR ORDEN DE DEVOLUCIÓN (RMA)
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 min-h-[400px]">
                <Package size={64} className="mb-4 opacity-20" />
                <p className="font-bold">Busca una orden para comenzar</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // VISTA GESTIÓN
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
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
              <tbody className="divide-y divide-slate-100">
                {returnsList.map(rma => (
                  <tr key={rma.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-rose-600">{rma.id}</td>
                    <td className="px-6 py-4 font-mono">{rma.nv}</td>
                    <td className="px-6 py-4">{rma.cliente}</td>
                    <td className="px-6 py-4 text-slate-500">{format(new Date(rma.fecha), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 font-bold">{rma.items}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        rma.estado === 'RECIBIDO' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rma.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {rma.estado === 'PENDIENTE_RECEPCION' ? (
                        <button className="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors flex items-center gap-1 mx-auto">
                          <Truck size={12} /> Recibir
                        </button>
                      ) : (
                        <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 mx-auto">
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
