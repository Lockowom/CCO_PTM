// DispatchControl.jsx - Módulo de Consulta Control Despacho
import React, { useState, useRef } from 'react';
import {
  Search,
  Truck,
  Calendar,
  FileText,
  RefreshCw,
  Download,
  Filter,
  X,
  Package,
  MapPin,
  DollarSign,
  Hash,
  Activity
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const DispatchControl = () => {
  const containerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const { data: records = [], isLoading: loading, error, refetch, isFetching } = useQuery({
    queryKey: ['dispatch_control', filterFechaDesde, filterFechaHasta],
    queryFn: async () => {
      let query = supabase
        .from('tms_control_despacho')
        .select('*')
        .order('fecha_despacho', { ascending: false });

      if (filterFechaDesde) {
        query = query.gte('fecha_despacho', filterFechaDesde);
      }
      if (filterFechaHasta) {
        query = query.lte('fecha_despacho', filterFechaHasta);
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;
      return data || [];
    }
  });

  const isFilterActive = searchTerm.length > 0 || filterFechaDesde || filterFechaHasta;

  const filteredRecords = React.useMemo(() => {
    if (!isFilterActive) return [];

    return records.filter(record => {
      const term = searchTerm.toLowerCase();
      return !searchTerm ||
        record.nv?.toString().toLowerCase().includes(term) ||
        record.guia?.toString().toLowerCase().includes(term) ||
        record.cliente?.toLowerCase().includes(term) ||
        record.transportista?.toLowerCase().includes(term) ||
        record.numero_envio?.toString().toLowerCase().includes(term);
    });
  }, [records, isFilterActive, searchTerm]);

  const stats = React.useMemo(() => {
    return {
      total: filteredRecords.length,
      totalBultos: filteredRecords.reduce((sum, r) => sum + (parseInt(r.bultos) || 0), 0),
      totalFlete: filteredRecords.reduce((sum, r) => sum + (parseInt(r.valor_flete) || 0), 0)
    };
  }, [filteredRecords]);

  const exportToCSV = () => {
    const headers = [
      'Fecha Docto', 'Cliente', 'Facturas', 'Guía', 'Bultos',
      'Transporte', 'Transportista', 'NV', 'División',
      'Vendedor', 'Fecha Despacho', 'Valor Flete', 'N° Envío'
    ];
    const rows = filteredRecords.map(r => [
      r.fecha_docto,
      r.cliente,
      r.facturas,
      r.guia,
      r.bultos,
      r.empresa_transporte,
      r.transportista,
      r.nv,
      r.division,
      r.vendedor,
      r.fecha_despacho,
      r.valor_flete,
      r.numero_envio
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.map(c => `"${c || ''}"`).join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `control_despacho_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
  };

  return (
    <div ref={containerRef} className="space-y-6 bg-slate-50 min-h-screen text-slate-700 p-6 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-rose-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <Truck className="text-rose-400" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Control Despacho</h2>
            <p className="text-slate-500 font-medium">Registro y seguimiento de guías y envíos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            disabled={filteredRecords.length === 0}
            className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download size={18} /> Exportar CSV
          </button>
          <button
            onClick={() => refetch()}
            disabled={loading || isFetching}
            className="bg-white hover:bg-white border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading || isFetching ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <div className="bg-white backdrop-blur-xl rounded-2xl p-5 border border-slate-200 shadow-xl hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Cantidad Guías</span>
            <div className="p-2 bg-white rounded-lg">
              <FileText size={18} className="text-slate-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white backdrop-blur-xl rounded-2xl p-5 border border-slate-200 shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-amber-500/10 w-24 h-24 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Total Bultos</span>
            <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <Package size={18} className="text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400 relative z-10">{stats.totalBultos}</p>
        </div>
        <div className="bg-white backdrop-blur-xl rounded-2xl p-5 border border-slate-200 shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-emerald-500/10 w-24 h-24 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Total Flete</span>
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <DollarSign size={18} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 relative z-10">{formatCurrency(stats.totalFlete)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-slate-200 shadow-xl relative z-10">
        <div className="flex items-center gap-2 mb-4 text-wms-neon">
          <Filter size={18} />
          <h3 className="font-bold uppercase tracking-wider text-sm">Filtros de Búsqueda</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Búsqueda Rápida</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 py-3 focus-within:border-wms-neon focus-within:ring-2 focus-within:ring-wms-neon/20 transition-all">
              <Search size={18} className="text-slate-500 mr-3" />
              <input
                type="text"
                placeholder="Guía, NV, Cliente, Transportista..."
                className="outline-none text-base bg-transparent w-full text-slate-900 placeholder-slate-600"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Desde (Despacho)</label>
            <input
              type="date"
              value={filterFechaDesde}
              onChange={e => setFilterFechaDesde(e.target.value)}
              className="w-full bg-slate-900 text-white outline-none focus:border-wms-neon focus:ring-2 focus:ring-wms-neon/20 transition-all [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hasta (Despacho)</label>
            <input
              type="date"
              value={filterFechaHasta}
              onChange={e => setFilterFechaHasta(e.target.value)}
              className="w-full bg-slate-900 text-white outline-none focus:border-wms-neon focus:ring-2 focus:ring-wms-neon/20 transition-all [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Toolbar Resultados */}
      <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
            <Activity size={18} />
          </div>
          <p className="font-bold text-rose-400 text-sm">
            {isFilterActive ? `${filteredRecords.length} registros encontrados en la búsqueda` : 'Aplica un filtro para ver los registros'}
          </p>
        </div>
        {(filterFechaDesde || filterFechaHasta || searchTerm) && (
          <button
            onClick={() => { setFilterFechaDesde(''); setFilterFechaHasta(''); setSearchTerm(''); }}
            className="bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <X size={14} /> Limpiar Filtros
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl border border-rose-500/20 flex items-center gap-3 relative z-10">
          <X size={20} /> <span className="font-bold">{error.message || error}</span>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Fecha Desp.</th>
                <th className="px-6 py-4 font-bold">Guía</th>
                <th className="px-6 py-4 font-bold">NV</th>
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Transporte</th>
                <th className="px-6 py-4 font-bold text-right">Bultos</th>
                <th className="px-6 py-4 font-bold text-right">Flete</th>
                <th className="px-6 py-4 font-bold text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wms-border">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                    <RefreshCw className="animate-spin mx-auto text-wms-neon mb-4" size={32} />
                    <p className="text-slate-500 font-bold animate-pulse">Cargando datos de despacho...</p>
                  </td>
                </tr>
              ) : !isFilterActive ? (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center text-slate-500">
                    <div className="bg-slate-50/50 p-6 rounded-full w-fit mx-auto mb-4 border border-slate-200">
                      <Filter size={48} className="text-slate-600" />
                    </div>
                    <p className="font-black text-slate-900 text-xl mb-2">Módulo de Control</p>
                    <p className="text-sm font-medium max-w-md mx-auto">Ingresa un término de búsqueda o selecciona un rango de fechas para cargar las guías de despacho.</p>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center text-slate-500">
                    <div className="bg-slate-50/50 p-6 rounded-full w-fit mx-auto mb-4 border border-slate-200">
                      <Package size={48} className="text-slate-600" />
                    </div>
                    <p className="font-bold text-slate-900 text-lg">No se encontraron registros</p>
                    <p className="text-sm mt-1">Intenta con otros términos o fechas</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-white/50 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono font-bold">
                      {record.fecha_despacho ? new Date(record.fecha_despacho).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 font-black text-rose-400 text-base">{record.guia}</td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-400">#{record.nv}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 truncate max-w-[200px]" title={record.cliente}>
                      {record.cliente}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 truncate max-w-[150px]">
                      {record.empresa_transporte || record.transportista}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-lg">
                      {record.bultos}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
                      {record.valor_flete > 0 ? formatCurrency(record.valor_flete) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="bg-slate-50 hover:bg-rose-500/20 border border-slate-200 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                      >
                        <FileText size={14} /> Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 transform transition-all">
            <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-rose-500/20 border border-rose-500/30 p-3 rounded-2xl text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Guía de Despacho</p>
                  <h2 className="text-3xl font-black text-slate-900">{selectedRecord.guia}</h2>
                </div>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors relative z-10">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Fechas */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Despacho</span>
                  </div>
                  <p className="font-mono font-black text-slate-900 text-lg">
                    {selectedRecord.fecha_despacho ? new Date(selectedRecord.fecha_despacho).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Documento</span>
                  </div>
                  <p className="font-mono font-black text-slate-900 text-lg">
                    {selectedRecord.fecha_docto ? new Date(selectedRecord.fecha_docto).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Info Principal */}
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Cliente Destino</label>
                  <p className="text-2xl font-black text-slate-900">{selectedRecord.cliente}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Nota de Venta</label>
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-indigo-400" />
                      <p className="font-black text-indigo-400 text-xl">{selectedRecord.nv || 'S/N'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Facturas Asoc.</label>
                    <p className="font-bold text-slate-700 text-lg">{selectedRecord.facturas || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Logística */}
              <div className="bg-indigo-500/10 p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.05)]">
                <div className="absolute -right-10 -bottom-10 opacity-5 text-indigo-400">
                  <MapPin size={150} />
                </div>
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
                  <MapPin size={16} /> Información Logística
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-8 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-wider mb-1">Empresa Transporte</p>
                    <p className="font-black text-indigo-300 text-lg leading-tight">{selectedRecord.empresa_transporte || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-wider mb-1">Chofer / Transp.</p>
                    <p className="font-black text-indigo-300 text-lg leading-tight">{selectedRecord.transportista || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-wider mb-1">N° Seguimiento</p>
                    <p className="font-mono font-black text-slate-900 text-lg">{selectedRecord.numero_envio || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-wider mb-1">Total Bultos</p>
                    <p className="font-black text-slate-900 text-3xl">{selectedRecord.bultos}</p>
                  </div>
                </div>
              </div>

              {/* Flete */}
              <div className="flex justify-between items-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Costo Flete Declarado</span>
                <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{formatCurrency(selectedRecord.valor_flete)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchControl;
