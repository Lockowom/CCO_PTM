import React, { useState, useRef } from 'react';
import { 
  Search, History, ArrowRight, ArrowDownLeft, ArrowUpRight, 
  Package, MapPin, Calendar, User, FileText, AlertCircle 
} from 'lucide-react';
import { supabase } from '../../supabase';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ExportButton from '../../components/ui/ExportButton';
import { useVirtualizer } from '@tanstack/react-virtual';

const Kardex = () => {
  const container = useRef();
  const parentRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');
  const [productInfo, setProductInfo] = useState(null);
  const [movements, setMovements] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Virtualizador para manejar miles de registros en el Kardex
  const rowVirtualizer = useVirtualizer({
    count: movements.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Altura estimada de la tarjeta
    overscan: 5,
  });

  useGSAP(() => {
    gsap.from(container.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: container });

  const searchMutation = useMutation({
    mutationFn: async (codigoBuscado) => {
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
         return { product: null, history: [] };
      }

      const product = {
        codigo: codigoBuscado,
        descripcion: desc,
        categoria: 'INVENTARIO WMS',
        stock_total: totalStock,
        ubicacion_principal: ubicPrincipal,
      };

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

      return { product, history };
    },
    onSuccess: (data) => {
      setProductInfo(data.product);
      setMovements(data.history);
      setHasSearched(true);
    },
    onError: (error) => {
      console.error(error);
      setProductInfo(null);
      setMovements([]);
      setHasSearched(true);
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    searchMutation.mutate(searchTerm.toUpperCase().trim());
  };

  const getMovementIcon = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return <ArrowDownLeft className="text-emerald-400" />;
      case 'SALIDA': return <ArrowUpRight className="text-wms-danger" />;
      default: return <ArrowRight className="text-blue-400" />;
    }
  };

  const getMovementColor = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'SALIDA': return 'bg-wms-danger/10 border-wms-danger/30';
      default: return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div ref={container} className="bg-wms-dark min-h-screen text-slate-300 p-6 space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-wms-border pb-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <History size={24} />
            </div>
            KARDEX / TRAZABILIDAD
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium ml-1">Historial completo de movimientos por SKU</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-2xl border border-wms-border shadow-xl">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-wms-neon transition-colors" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ingrese SKU, Código de Barras o Lote..."
              className="w-full pl-10 pr-4 py-3 bg-wms-dark border border-wms-border text-white rounded-xl font-mono font-bold focus:ring-2 focus:ring-wms-neon outline-none placeholder-slate-600 transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={searchMutation.isLoading || !searchTerm}
            className="px-6 py-3 bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 hover:text-white hover:bg-indigo-600 font-bold rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:opacity-50"
          >
            {searchMutation.isLoading ? 'Buscando...' : 'Consultar'}
          </button>
        </form>
      </div>

      {productInfo && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Product Summary */}
          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
              <div>
                <span className="inline-block px-2 py-1 bg-wms-dark border border-wms-border text-slate-400 text-xs font-mono font-bold rounded mb-2 shadow-inner">
                  {productInfo.codigo}
                </span>
                <h3 className="text-xl font-black text-white mb-1">{productInfo.descripcion}</h3>
                <span className="text-sm font-medium text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  {productInfo.categoria}
                </span>
              </div>
              
              <div className="flex gap-6 text-right">
                <div className="bg-wms-dark p-4 rounded-xl border border-wms-border shadow-inner">
                  <span className="block text-xs font-bold text-slate-500 uppercase">Stock Total</span>
                  <span className="block text-3xl font-black text-white">{productInfo.stock_total}</span>
                </div>
                <div className="bg-wms-dark p-4 rounded-xl border border-wms-border shadow-inner">
                  <span className="block text-xs font-bold text-slate-500 uppercase">Ubic. Principal</span>
                  <span className="block text-xl font-bold text-wms-neon font-mono drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{productInfo.ubicacion_principal}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <ExportButton data={movements} filename={`kardex_${productInfo.codigo}`} />
          </div>

          {/* Timeline (Virtualizada) */}
          <div 
            ref={parentRef} 
            className="h-[600px] overflow-auto relative border-l-2 border-wms-border ml-4 pl-8 py-2 custom-scrollbar"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const mov = movements[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="pb-6" // Espaciado entre tarjetas
                  >
                    <div className="relative group">
                      {/* Dot */}
                      <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-wms-dark shadow-sm flex items-center justify-center ${
                        mov.tipo === 'ENTRADA' ? 'bg-wms-neon shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                        mov.tipo === 'SALIDA' ? 'bg-wms-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                      }`}>
                      </div>

                      {/* Card */}
                      <div className={`bg-wms-panel/90 backdrop-blur-md rounded-xl border p-4 shadow-lg hover:shadow-xl hover:border-slate-600 transition-all ${getMovementColor(mov.tipo)} relative overflow-hidden`}>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-sm ${
                              mov.tipo === 'ENTRADA' ? 'text-emerald-400' : 
                              mov.tipo === 'SALIDA' ? 'text-wms-danger' : 'text-blue-400'
                            }`}>
                              {mov.tipo} por {mov.motivo}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar size={12} /> {format(new Date(mov.fecha), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-300 bg-wms-dark px-2 py-1 rounded border border-wms-border">
                            {mov.doc_ref}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mb-3 relative z-10">
                          <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-300">
                            <span className="text-slate-500">{mov.origen}</span>
                            <ArrowRight size={14} className="text-slate-600" />
                            <span className="text-white">{mov.destino}</span>
                          </div>
                          <div className="flex-1 h-px bg-wms-border border-t border-dashed"></div>
                          <span className="text-lg font-black text-white">
                            {mov.tipo === 'SALIDA' ? '-' : '+'}{mov.cantidad}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 relative z-10">
                          <User size={12} />
                          <span className="font-medium text-slate-400">{mov.usuario}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!productInfo && hasSearched && !searchMutation.isLoading && (
        <div className="text-center py-20 bg-wms-panel/50 rounded-2xl border border-dashed border-wms-border">
          <AlertCircle size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white">Producto no encontrado</h3>
          <p className="text-slate-400 text-sm">Verifique el código ingresado e intente nuevamente.</p>
        </div>
      )}
    </div>
  );
};

export default Kardex;
