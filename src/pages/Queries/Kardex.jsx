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
    setProductInfo(null);
    setMovements([]);

    try {
      const codigoBuscado = searchTerm.toUpperCase().trim();

      // 1. Buscar en Ubicaciones (para obtener la descripción real y stock base)
      const { data: ubicData, error: ubicError } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .eq('codigo', codigoBuscado);

      if (ubicError) throw ubicError;

      // 2. Buscar en Partidas
      const { data: partidasData, error: partError } = await supabase
        .from('tms_partidas')
        .select('*')
        .eq('codigo_producto', codigoBuscado);

      // 3. Buscar en Series
      const { data: seriesData, error: serError } = await supabase
        .from('tms_series')
        .select('*')
        .eq('codigo_producto', codigoBuscado);

      // 4. Buscar en Farmapack
      const { data: farmaData, error: farmError } = await supabase
        .from('tms_farmapack')
        .select('*')
        .eq('codigo_producto', codigoBuscado);

      // 5. Construir Info del Producto
      let totalStock = 0;
      let desc = 'PRODUCTO SIN DESCRIPCIÓN';
      let ubicPrincipal = 'NO ASIGNADA';

      if (ubicData && ubicData.length > 0) {
        desc = ubicData[0].descripcion || desc;
        ubicPrincipal = ubicData[0].ubicacion || ubicPrincipal;
        totalStock += ubicData.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
      }

      if (partidasData) totalStock += partidasData.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
      if (seriesData) totalStock += seriesData.length;
      if (farmaData) totalStock += farmaData.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);

      // Si no existe en ningún lado
      if (totalStock === 0 && (!ubicData || ubicData.length === 0)) {
         setLoading(false);
         return; // Mostramos el mensaje de "No encontrado"
      }

      setProductInfo({
        codigo: codigoBuscado,
        descripcion: desc,
        categoria: 'INVENTARIO WMS',
        stock_total: totalStock,
        ubicacion_principal: ubicPrincipal,
      });

      // 6. Construir Historial de Movimientos (Uniendo las 3 tablas)
      let history = [];

      // Partidas
      if (partidasData) {
        partidasData.forEach(p => {
          history.push({
            id: `P-${p.id}`,
            tipo: p.estado === 'Despachado' ? 'SALIDA' : 'ENTRADA',
            motivo: 'PARTIDA',
            fecha: p.fecha_recepcion || p.created_at || new Date().toISOString(),
            cantidad: p.cantidad,
            doc_ref: p.partida || 'S/N',
            usuario: 'Sistema',
            origen: p.estado === 'Despachado' ? 'BODEGA' : 'RECEPCIÓN',
            destino: p.estado === 'Despachado' ? 'CLIENTE' : 'BODEGA'
          });
        });
      }

      // Series
      if (seriesData) {
        seriesData.forEach(s => {
          history.push({
            id: `S-${s.id}`,
            tipo: s.estado === 'Despachado' ? 'SALIDA' : 'ENTRADA',
            motivo: 'SERIE',
            fecha: s.fecha_recepcion || s.created_at || new Date().toISOString(),
            cantidad: 1, // Las series son unitarias
            doc_ref: s.serie || 'S/N',
            usuario: 'Sistema',
            origen: s.estado === 'Despachado' ? 'BODEGA' : 'RECEPCIÓN',
            destino: s.estado === 'Despachado' ? 'CLIENTE' : 'BODEGA'
          });
        });
      }

      // Farmapack
      if (farmaData) {
        farmaData.forEach(f => {
          history.push({
            id: `F-${f.id}`,
            tipo: f.estado === 'Despachado' ? 'SALIDA' : 'ENTRADA',
            motivo: 'FARMAPACK',
            fecha: f.fecha_recepcion || f.created_at || new Date().toISOString(),
            cantidad: f.cantidad,
            doc_ref: f.lote || 'S/N',
            usuario: 'Sistema',
            origen: f.estado === 'Despachado' ? 'BODEGA' : 'RECEPCIÓN',
            destino: f.estado === 'Despachado' ? 'CLIENTE' : 'BODEGA'
          });
        });
      }

      // Ordenar cronológicamente (más reciente primero)
      history.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setMovements(history);

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
