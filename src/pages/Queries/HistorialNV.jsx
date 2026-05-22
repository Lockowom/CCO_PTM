// HistorialNV.jsx - Historial completo de Notas de Venta (estados REALES)
import React, { useState, useRef } from 'react';
import { 
  Search, Eye, AlertCircle, X, Package, Truck, Calendar, User, FileText,
  Hand, CheckCircle, Clock, Box, Send, RefreshCw, Download, Filter,
  ThumbsUp, Hourglass, Ban, History, BarChart3, RotateCcw, Ship
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Todos los estados REALES
const TODOS_ESTADOS = [
  { key: 'Pendiente', label: 'Pendiente', icon: Hourglass, bgColor: 'bg-slate-500', lightBg: 'bg-slate-500/20', textColor: 'text-slate-700', borderColor: 'border-slate-500/30' },
  { key: 'PENDIENTE', label: 'Pendiente', icon: Hourglass, bgColor: 'bg-slate-500', lightBg: 'bg-slate-500/20', textColor: 'text-slate-700', borderColor: 'border-slate-500/30' },
  { key: 'Aprobada', label: 'Aprobada', icon: ThumbsUp, bgColor: 'bg-amber-500', lightBg: 'bg-amber-500/20', textColor: 'text-amber-400', borderColor: 'border-amber-500/30' },
  { key: 'Pendiente Picking', label: 'En Picking', icon: Hand, bgColor: 'bg-cyan-500', lightBg: 'bg-cyan-500/20', textColor: 'text-cyan-400', borderColor: 'border-cyan-500/30' },
  { key: 'PACKING', label: 'Packing', icon: Box, bgColor: 'bg-indigo-500', lightBg: 'bg-indigo-500/20', textColor: 'text-indigo-400', borderColor: 'border-indigo-500/30' },
  { key: 'LISTO_DESPACHO', label: 'Listo Despacho', icon: Send, bgColor: 'bg-purple-500', lightBg: 'bg-purple-500/20', textColor: 'text-purple-400', borderColor: 'border-purple-500/30' },
  { key: 'Pendiente Shipping', label: 'Pend. Shipping', icon: Ship, bgColor: 'bg-blue-500', lightBg: 'bg-blue-500/20', textColor: 'text-blue-400', borderColor: 'border-blue-500/30' },
  { key: 'Despachado', label: 'Despachado', icon: Truck, bgColor: 'bg-emerald-500', lightBg: 'bg-emerald-500/20', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30' },
  { key: 'Refacturacion', label: 'Refacturación', icon: RotateCcw, bgColor: 'bg-orange-500', lightBg: 'bg-orange-500/20', textColor: 'text-orange-400', borderColor: 'border-orange-500/30' },
];

// Estados únicos para los filtros (sin duplicados)
const ESTADOS_FILTRO = [
  { key: 'Pendiente', label: 'Pendiente' },
  { key: 'Aprobada', label: 'Aprobada' },
  { key: 'Pendiente Picking', label: 'En Picking' },
  { key: 'PACKING', label: 'Packing' },
  { key: 'LISTO_DESPACHO', label: 'Listo Despacho' },
  { key: 'Pendiente Shipping', label: 'Pend. Shipping' },
  { key: 'Despachado', label: 'Despachado' },
  { key: 'Refacturacion', label: 'Refacturación' },
];

const HistorialNV = () => {
  const container = useRef();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useGSAP(() => {
    gsap.from(container.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: container });

  const { data: orders = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['historial_nv', filterFechaDesde, filterFechaHasta],
    queryFn: async () => {
      let query = supabase
        .from('tms_nv_diarias')
        .select('*')
        .order('fecha_emision', { ascending: false });

      if (filterFechaDesde) {
        query = query.gte('fecha_emision', filterFechaDesde);
      }
      if (filterFechaHasta) {
        query = query.lte('fecha_emision', filterFechaHasta + 'T23:59:59');
      }

      // AUMENTADO DE 1000 a 5000 para evitar que desaparezcan registros en el histórico
      const { data, error } = await query.limit(5000);

      if (error) throw error;
      return data || [];
    }
  });

  const stats = {
    total: orders.length,
    despachados: orders.filter(o => o.estado === 'Despachado').length,
    enProceso: orders.filter(o => !['Despachado', 'Refacturacion'].includes(o.estado)).length,
    refacturacion: orders.filter(o => o.estado === 'Refacturacion').length
  };

  // Filtrar
  const filteredOrders = orders.filter(order => {
    // Normalizar PENDIENTE a Pendiente para comparación
    const estadoOrder = order.estado === 'PENDIENTE' ? 'Pendiente' : order.estado;
    const matchEstado = filterEstado === 'TODOS' || estadoOrder === filterEstado;
    const matchSearch = !searchTerm || 
      order.nv?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendedor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  const getEstadoConfig = (estado) => {
    return TODOS_ESTADOS.find(e => e.key === estado) || TODOS_ESTADOS[0];
  };

  // Exportar CSV
  const exportToCSV = () => {
    const headers = ['NV', 'Fecha', 'Cliente', 'Vendedor', 'Código', 'Producto', 'Cantidad', 'Unidad', 'Estado'];
    const rows = filteredOrders.map(o => [
      o.nv, 
      o.fecha_emision || '', 
      o.cliente, 
      o.vendedor, 
      o.codigo_producto, 
      o.descripcion_producto, 
      o.cantidad, 
      o.unidad, 
      o.estado
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_nv_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div ref={container} className="bg-slate-50 min-h-screen text-slate-700 p-6 space-y-8">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 page-header">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-indigo-600/20 p-2 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <History className="text-indigo-400" size={24} />
            </div>
            Consulta Maestra
          </h1>
          <p className="text-slate-500 text-lg mt-2 ml-1">Visión global y trazabilidad de todas las Notas de Venta</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all hover:scale-105 active:scale-95"
          >
            <Download size={20} />
            Exportar CSV
          </button>
          <button 
            onClick={() => refetch()}
            disabled={loading}
            className="p-3 text-slate-500 bg-white border border-slate-200 hover:bg-indigo-600/20 hover:text-indigo-400 hover:border-indigo-500/50 rounded-xl transition-all shadow-lg"
            title="Actualizar datos"
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Cards Modernos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BarChart3 size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Registros</p>
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Truck size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Despachados</p>
              <p className="text-3xl font-black text-emerald-400">{stats.despachados}</p>
            </div>
          </div>
        </div>

        <div className="bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">En Proceso</p>
              <p className="text-3xl font-black text-blue-400">{stats.enProceso}</p>
            </div>
          </div>
        </div>

        <div className="bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <RotateCcw size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Refacturación</p>
              <p className="text-3xl font-black text-orange-400">{stats.refacturacion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Flotantes Modernos */}
      <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 shadow-xl flex flex-col lg:flex-row gap-2 items-center filters-bar sticky top-4 z-30">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-wms-neon transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por NV, cliente, producto, vendedor..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-wms-neon transition-all text-slate-900 placeholder-slate-600 font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="px-4 py-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-wms-neon font-bold text-slate-700 cursor-pointer transition-colors min-w-[140px]"
          >
            <option value="TODOS">Todos los estados</option>
            {ESTADOS_FILTRO.map(e => (
              <option key={e.key} value={e.key}>{e.label}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={filterFechaDesde}
            onChange={e => setFilterFechaDesde(e.target.value)}
            className="px-4 py-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-wms-neon font-bold text-slate-700 cursor-pointer transition-colors [color-scheme:dark]"
          />
          <span className="self-center text-slate-500 font-bold">-</span>
          <input
            type="date"
            value={filterFechaHasta}
            onChange={e => setFilterFechaHasta(e.target.value)}
            className="px-4 py-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-wms-neon font-bold text-slate-700 cursor-pointer transition-colors [color-scheme:dark]"
          />
          
          {(filterEstado !== 'TODOS' || filterFechaDesde || filterFechaHasta || searchTerm) && (
            <button
              onClick={() => { setFilterEstado('TODOS'); setFilterFechaDesde(''); setFilterFechaHasta(''); setSearchTerm(''); }}
              className="px-4 py-3 bg-wms-danger/20 border border-wms-danger/50 text-wms-danger hover:bg-wms-danger/40 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              title="Limpiar filtros"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-wms-danger/10 text-wms-danger p-6 rounded-2xl border border-wms-danger/30 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <div className="p-3 bg-wms-danger/20 rounded-xl border border-wms-danger/50">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Error al cargar datos</h3>
            <p>{error.message}</p>
          </div>
        </div>
      )}

      {/* Tabla Moderna */}
      <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">N.V</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4 text-right">Cant.</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wms-border">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw size={24} className="text-indigo-400" />
                        </div>
                      </div>
                      <p className="text-slate-500 font-medium animate-pulse">Consultando base de datos...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="p-6 bg-slate-50 rounded-full border border-slate-200 shadow-inner">
                        <Package size={48} className="text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-500">No se encontraron registros</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const config = getEstadoConfig(order.estado);
                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-black text-indigo-400 text-lg">#{order.nv}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {order.fecha_emision ? new Date(order.fecha_emision).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 truncate max-w-[200px]" title={order.cliente}>
                        {order.cliente}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium uppercase">{order.vendedor}</td>
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-700">{order.codigo_producto}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[250px] font-medium">{order.descripcion_producto}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-black text-slate-900 text-lg">{order.cantidad}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{order.unidad}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                          <config.icon size={12} /> {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-slate-50 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 p-2 rounded-xl border border-slate-200 hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                          title="Ver Detalle"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
            <span>Mostrando {filteredOrders.length} registros</span>
            <span>Total en base de datos: {orders.length}</span>
          </div>
        )}
      </div>

      {/* Modal Detalle Moderno */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 transform transition-all scale-100">
            {(() => {
              const config = getEstadoConfig(selectedOrder.estado);
              return (
                <div className={`bg-slate-50 p-8 flex justify-between items-start border-b border-slate-200 relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-48 h-48 ${config.lightBg} rounded-full blur-3xl`}></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`${config.lightBg} border ${config.borderColor} p-3 rounded-2xl ${config.textColor} shadow-lg`}>
                      <FileText size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Nota de Venta</p>
                      <h2 className="text-4xl font-black text-slate-900">#{selectedOrder.nv}</h2>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 relative z-10">
                    <button 
                      onClick={() => setSelectedOrder(null)} 
                      className="p-2 bg-slate-50 border border-slate-200 hover:bg-white rounded-full text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <X size={24} />
                    </button>
                    <span className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-wide border shadow-sm flex items-center gap-2 ${config.lightBg} ${config.textColor} ${config.borderColor}`}>
                      <config.icon size={16} /> {config.label}
                    </span>
                  </div>
                </div>
              );
            })()}
            
            <div className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <Calendar size={16} />
                    <p className="text-xs font-bold uppercase">Fecha Emisión</p>
                  </div>
                  <p className="font-bold text-slate-900 text-lg">
                    {selectedOrder.fecha_emision ? new Date(selectedOrder.fecha_emision).toLocaleDateString() : '-'}
                  </p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner col-span-2">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <User size={16} />
                    <p className="text-xs font-bold uppercase">Cliente</p>
                  </div>
                  <p className="font-bold text-slate-900 text-lg truncate" title={selectedOrder.cliente}>
                    {selectedOrder.cliente}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-900/20 p-6 rounded-3xl border border-indigo-500/30 relative overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.1)]">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-300">
                  <Package size={120} />
                </div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                      <Box size={16} />
                      <p className="text-xs font-bold uppercase">Detalle del Producto</p>
                    </div>
                    <p className="font-mono text-2xl font-black text-indigo-300 mb-1">{selectedOrder.codigo_producto}</p>
                    <p className="text-indigo-200 font-medium text-lg leading-tight">{selectedOrder.descripcion_producto}</p>
                  </div>
                  
                  <div className="flex flex-col items-end justify-center min-w-[120px] bg-slate-50/80 p-4 rounded-2xl backdrop-blur-sm border border-indigo-500/30 shadow-inner">
                    <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Cantidad</p>
                    <p className="text-4xl font-black text-indigo-300">{selectedOrder.cantidad}</p>
                    <p className="text-sm font-bold text-indigo-500">{selectedOrder.unidad}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-4 border-t border-slate-200">
                <span>Vendedor: {selectedOrder.vendedor || 'N/A'}</span>
                <span>ID Sistema: {selectedOrder.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialNV;
