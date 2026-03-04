import React, { useState, useEffect } from 'react';
import {
  FileSearch, Search, Calendar, Filter, Eye, ArrowRightLeft,
  Database, User, Clock, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../supabase';
import { format } from 'date-fns';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterTable, setFilterTable] = useState('ALL');
  const [filterUser, setFilterUser] = useState('');
  const [dateRange, setDateRange] = useState('TODAY'); // TODAY, WEEK, MONTH

  // Detalle
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filterTable, dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Simulación: En un entorno real, esto consultaría una tabla 'audit_logs'
      // llenada por Triggers de PostgreSQL.
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockLogs = generateMockLogs();
      setLogs(mockLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = React.useMemo(() => {
    let filtered = logs;

    if (filterTable !== 'ALL') {
      filtered = filtered.filter(l => l.table_name === filterTable);
    }

    if (filterUser) {
      filtered = filtered.filter(l => l.user_email.toLowerCase().includes(filterUser.toLowerCase()));
    }

    return filtered;
  }, [logs, filterTable, filterUser]);

  const generateMockLogs = () => {
    return [
      {
        id: 'LOG-001',
        timestamp: new Date().toISOString(),
        user_email: 'admin@sistema.com',
        action: 'UPDATE',
        table_name: 'tms_nv_diarias',
        record_id: '10245',
        old_data: { estado: 'Pendiente Picking', usuario_asignado: 'user-123' },
        new_data: { estado: 'Aprobada', usuario_asignado: null },
        details: 'Liberación forzada de orden'
      },
      {
        id: 'LOG-002',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user_email: 'bodega@sistema.com',
        action: 'INSERT',
        table_name: 'wms_ubicaciones',
        record_id: 'A-01-02',
        old_data: null,
        new_data: { codigo: 'SKU-500', cantidad: 50 },
        details: 'Ingreso manual de stock'
      },
      {
        id: 'LOG-003',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user_email: 'admin@sistema.com',
        action: 'DELETE',
        table_name: 'tms_usuarios',
        record_id: 'user-999',
        old_data: { email: 'temp@sistema.com', rol: 'OPERADOR' },
        new_data: null,
        details: 'Eliminación de usuario temporal'
      },
      {
        id: 'LOG-004',
        timestamp: new Date(Date.now() - 8000000).toISOString(),
        user_email: 'jefe@sistema.com',
        action: 'UPDATE',
        table_name: 'tms_modules_config',
        record_id: 'conf-01',
        old_data: { allow_blind_reception: false },
        new_data: { allow_blind_reception: true },
        details: 'Cambio configuración WMS'
      }
    ];
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100';
      case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-100';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200 shadow-sm shadow-red-100';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTableBadgeColor = (tableName) => {
    if (tableName.startsWith('wms_')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (tableName.startsWith('tms_user') || tableName.startsWith('tms_mod')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (tableName.startsWith('tms_')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <FileSearch size={24} />
            </div>
            AUDITORÍA DE DATOS
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Traza histórica de cambios en base de datos (PostgreSQL Triggers)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Filter size={18} /> Filtros de Búsqueda
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tabla / Entidad</label>
                <select
                  value={filterTable}
                  onChange={(e) => setFilterTable(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                >
                  <option value="ALL">Todas las tablas</option>
                  <option value="tms_nv_diarias">Órdenes (tms_nv_diarias)</option>
                  <option value="wms_ubicaciones">Stock (wms_ubicaciones)</option>
                  <option value="tms_usuarios">Usuarios (tms_usuarios)</option>
                  <option value="tms_modules_config">Configuración</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario (Email)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    placeholder="ej: admin@sistema.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rango de Fecha</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {['TODAY', 'WEEK', 'MONTH'].map(range => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${dateRange === range ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      {range === 'TODAY' ? 'HOY' : range === 'WEEK' ? 'SEMANA' : 'MES'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={fetchLogs}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Search size={18} />
                BUSCAR REGISTROS
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
              <Database size={18} /> Sobre esta vista
            </h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Esta herramienta visualiza los registros capturados por los <strong>Triggers de Auditoría</strong> configurados en PostgreSQL.
              <br /><br />
              Cada operación de escritura (INSERT, UPDATE, DELETE) en tablas críticas genera un registro inmutable para trazabilidad y seguridad.
            </p>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Fecha / Hora</th>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Acción</th>
                    <th className="px-6 py-4">Entidad Afectada</th>
                    <th className="px-6 py-4 text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">Cargando traza...</td></tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">No se encontraron registros.</td></tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-mono text-slate-600">
                            <Clock size={14} className="text-slate-400" />
                            {format(new Date(log.timestamp), "dd/MM HH:mm:ss")}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {log.user_email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold border ${getTableBadgeColor(log.table_name)}`}>
                            {log.table_name}
                          </span>
                          <span className="block text-[10px] font-mono mt-1 text-slate-400">ID: {log.record_id}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detalle (Diff) */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <ArrowRightLeft className="text-indigo-500" /> Detalle de Cambio
                </h3>
                <p className="text-sm text-slate-500 font-mono mt-1">{selectedLog.id} • {selectedLog.table_name}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h4 className="font-bold text-red-800 mb-2 text-sm uppercase">Valor Anterior</h4>
                <pre className="text-xs font-mono text-red-900 whitespace-pre-wrap overflow-auto max-h-60">
                  {selectedLog.old_data ? JSON.stringify(selectedLog.old_data, null, 2) : <span className="italic opacity-50">NULL (Insert)</span>}
                </pre>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-800 mb-2 text-sm uppercase">Valor Nuevo</h4>
                <pre className="text-xs font-mono text-emerald-900 whitespace-pre-wrap overflow-auto max-h-60">
                  {selectedLog.new_data ? JSON.stringify(selectedLog.new_data, null, 2) : <span className="italic opacity-50">NULL (Delete)</span>}
                </pre>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-1 text-sm">Contexto</h4>
              <p className="text-sm text-slate-600">{selectedLog.details}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
