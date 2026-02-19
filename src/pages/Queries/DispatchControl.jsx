// DispatchControl.jsx - Módulo de Consulta Control Despacho
import React, { useState, useEffect, useCallback } from 'react';
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
  Hash
} from 'lucide-react';
import { supabase } from '../../supabase';

const DispatchControl = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');
  const [stats, setStats] = useState({ total: 0, totalBultos: 0, totalFlete: 0 });
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
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

      setRecords(data || []);
      
      const all = data || [];
      setStats({
        total: all.length,
        totalBultos: all.reduce((sum, r) => sum + (r.bultos || 0), 0),
        totalFlete: all.reduce((sum, r) => sum + (r.valor_flete || 0), 0)
      });
      
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filterFechaDesde, filterFechaHasta]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Filtrar en cliente
  const filteredRecords = records.filter(record => {
    const term = searchTerm.toLowerCase();
    return !searchTerm || 
      record.nv?.toString().toLowerCase().includes(term) ||
      record.guia?.toString().toLowerCase().includes(term) ||
      record.cliente?.toLowerCase().includes(term) ||
      record.transportista?.toLowerCase().includes(term) ||
      record.numero_envio?.toString().toLowerCase().includes(term);
  });

  // Exportar CSV
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
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `control_despacho_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
            <Truck className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Control Despacho</h2>
            <p className="text-slate-500 text-sm">Registro y seguimiento de despachos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <Download size={16} /> Exportar CSV
          </button>
          <button 
            onClick={fetchRecords}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase">Total Guías</span>
            <FileText size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-600 text-xs font-semibold uppercase">Total Bultos</span>
            <Package size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.totalBultos}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-600 text-xs font-semibold uppercase">Total Flete</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalFlete)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-700">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Buscar</label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3 py-2">
              <Search size={16} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Guía, NV, Cliente, Transportista..." 
                className="outline-none text-sm bg-transparent w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Desde (Fecha Despacho)</label>
            <input
              type="date"
              value={filterFechaDesde}
              onChange={e => setFilterFechaDesde(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Hasta (Fecha Despacho)</label>
            <input
              type="date"
              value={filterFechaHasta}
              onChange={e => setFilterFechaHasta(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-rose-50 rounded-xl p-3 border border-rose-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-rose-600" />
          <p className="font-bold text-rose-800 text-sm">{filteredRecords.length} registros encontrados</p>
        </div>
        {(filterFechaDesde || filterFechaHasta || searchTerm) && (
          <button
            onClick={() => { setFilterFechaDesde(''); setFilterFechaHasta(''); setSearchTerm(''); }}
            className="text-rose-600 hover:text-rose-800 text-xs font-medium flex items-center gap-1"
          >
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
          <X size={20} /> {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha Desp.</th>
                <th className="px-4 py-3 font-medium">Guía</th>
                <th className="px-4 py-3 font-medium">NV</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Transporte</th>
                <th className="px-4 py-3 font-medium text-right">Bultos</th>
                <th className="px-4 py-3 font-medium text-right">Flete</th>
                <th className="px-4 py-3 font-medium text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <RefreshCw className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-400">Cargando datos...</p>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No se encontraron registros</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {record.fecha_despacho ? new Date(record.fecha_despacho).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-600">{record.guia}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{record.nv}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[150px]" title={record.cliente}>
                      {record.cliente}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-[120px]">
                      {record.empresa_transporte || record.transportista}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {record.bultos}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600">
                      {record.valor_flete > 0 ? formatCurrency(record.valor_flete) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1"
                      >
                        <FileText size={12} /> Ver
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-rose-50 p-5 flex justify-between items-center border-b border-rose-100">
              <div className="flex items-center gap-3">
                <div className="bg-rose-500 p-2 rounded-lg text-white">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-xs text-rose-600 font-bold uppercase">Guía de Despacho</p>
                  <h2 className="text-xl font-black text-slate-900">{selectedRecord.guia}</h2>
                </div>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Fecha Despacho</span>
                  </div>
                  <p className="font-mono font-bold text-slate-800">
                    {selectedRecord.fecha_despacho ? new Date(selectedRecord.fecha_despacho).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Fecha Documento</span>
                  </div>
                  <p className="font-mono font-bold text-slate-800">
                    {selectedRecord.fecha_docto ? new Date(selectedRecord.fecha_docto).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Info Principal */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Cliente</label>
                  <p className="text-lg font-bold text-slate-800">{selectedRecord.cliente}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase">N° NV</label>
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-indigo-500" />
                      <p className="font-bold text-indigo-700">{selectedRecord.nv || 'S/N'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase">Facturas</label>
                    <p className="font-medium text-slate-700">{selectedRecord.facturas || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Logística */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 uppercase mb-3 flex items-center gap-2">
                  <MapPin size={14} /> Información Logística
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Empresa Transporte</p>
                    <p className="font-bold text-indigo-900">{selectedRecord.empresa_transporte || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Transportista</p>
                    <p className="font-bold text-indigo-900">{selectedRecord.transportista || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">N° Envío / Seguimiento</p>
                    <p className="font-mono font-bold text-indigo-900">{selectedRecord.numero_envio || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Bultos</p>
                    <p className="font-bold text-indigo-900 text-lg">{selectedRecord.bultos}</p>
                  </div>
                </div>
              </div>

              {/* Flete */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-sm font-bold text-slate-500">Valor Flete</span>
                <span className="text-2xl font-black text-emerald-600">{formatCurrency(selectedRecord.valor_flete)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchControl;
