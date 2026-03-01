import React, { useState } from 'react';
import { 
  Search, History, ArrowRight, ArrowDownLeft, ArrowUpRight, 
  Package, MapPin, Calendar, User, FileText, AlertCircle 
} from 'lucide-react';
import { supabase } from '../../supabase';
import { format } from 'date-fns';

const Kardex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [movements, setMovements] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    try {
      // Simular búsqueda de producto
      // En producción: SELECT * FROM tms_matriz_codigos WHERE codigo = searchTerm
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock Product Data
      setProductInfo({
        codigo: searchTerm.toUpperCase(),
        descripcion: 'PARACETAMOL 500MG CAJA 20 COMPRIMIDOS',
        categoria: 'FARMACIA',
        stock_total: 1500,
        ubicacion_principal: 'A-04-02',
        precio_promedio: 1250
      });

      // Mock Movements Data
      // En producción: SELECT * FROM tms_kardex WHERE codigo = searchTerm ORDER BY fecha DESC
      setMovements([
        { id: 1, tipo: 'SALIDA', motivo: 'VENTA', fecha: new Date().toISOString(), cantidad: 50, doc_ref: 'NV-10234', usuario: 'juan.perez', origen: 'A-04-02', destino: 'DESPACHO' },
        { id: 2, tipo: 'ENTRADA', motivo: 'COMPRA', fecha: new Date(Date.now() - 86400000).toISOString(), cantidad: 1000, doc_ref: 'OC-5001', usuario: 'maria.soto', origen: 'PROVEEDOR', destino: 'RECEPCION' },
        { id: 3, tipo: 'TRASLADO', motivo: 'REABASTECIMIENTO', fecha: new Date(Date.now() - 172800000).toISOString(), cantidad: 200, doc_ref: 'TASK-99', usuario: 'pedro.diaz', origen: 'R-01-01', destino: 'A-04-02' },
        { id: 4, tipo: 'SALIDA', motivo: 'MERMA', fecha: new Date(Date.now() - 259200000).toISOString(), cantidad: 5, doc_ref: 'AJUSTE-01', usuario: 'admin', origen: 'A-04-02', destino: 'DESTRUCCION' },
      ]);

    } catch (err) {
      console.error(err);
      alert('Error al buscar producto');
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return <ArrowDownLeft className="text-emerald-500" />;
      case 'SALIDA': return <ArrowUpRight className="text-red-500" />;
      default: return <ArrowRight className="text-blue-500" />;
    }
  };

  const getMovementColor = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return 'bg-emerald-50 border-emerald-100';
      case 'SALIDA': return 'bg-red-50 border-red-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <History size={24} />
            </div>
            KARDEX / TRAZABILIDAD
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Historial completo de movimientos por SKU</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ingrese SKU, Código de Barras o Lote..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !searchTerm}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Consultar'}
          </button>
        </form>
      </div>

      {productInfo && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Product Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-xs font-mono font-bold rounded mb-2">
                  {productInfo.codigo}
                </span>
                <h3 className="text-xl font-black text-slate-800 mb-1">{productInfo.descripcion}</h3>
                <span className="text-sm font-medium text-slate-500 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  {productInfo.categoria}
                </span>
              </div>
              
              <div className="flex gap-4 text-right">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Stock Total</span>
                  <span className="block text-3xl font-black text-slate-800">{productInfo.stock_total}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Ubic. Principal</span>
                  <span className="block text-xl font-bold text-indigo-600 font-mono">{productInfo.ubicacion_principal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-8 py-2">
            {movements.map((mov) => (
              <div key={mov.id} className="relative group">
                {/* Dot */}
                <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                  mov.tipo === 'ENTRADA' ? 'bg-emerald-500' : 
                  mov.tipo === 'SALIDA' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                </div>

                {/* Card */}
                <div className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all ${getMovementColor(mov.tipo)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm ${
                        mov.tipo === 'ENTRADA' ? 'text-emerald-700' : 
                        mov.tipo === 'SALIDA' ? 'text-red-700' : 'text-blue-700'
                      }`}>
                        {mov.tipo} por {mov.motivo}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {format(new Date(mov.fecha), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-white/50 px-2 py-1 rounded border border-slate-200">
                      {mov.doc_ref}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-700">
                      <span className="text-slate-400">{mov.origen}</span>
                      <ArrowRight size={14} className="text-slate-300" />
                      <span className="text-slate-800">{mov.destino}</span>
                    </div>
                    <div className="flex-1 h-px bg-slate-200 border-t border-dashed"></div>
                    <span className="text-lg font-black text-slate-800">
                      {mov.tipo === 'SALIDA' ? '-' : '+'}{mov.cantidad}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={12} />
                    <span className="font-medium">{mov.usuario}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!productInfo && !loading && searchTerm && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Producto no encontrado</h3>
          <p className="text-slate-500 text-sm">Verifique el código ingresado e intente nuevamente.</p>
        </div>
      )}
    </div>
  );
};

export default Kardex;
