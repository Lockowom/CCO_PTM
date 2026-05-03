import React, { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  FileSearch, Search, Calendar, Filter, Eye, ArrowRightLeft,
  Database, User, Clock, AlertTriangle, Loader2
} from 'lucide-react';
import { supabase } from '../../supabase';
import { format } from 'date-fns';

const AuditLogs = () => {
  const containerRef = useRef();

  // Filtros
  const [filterTable, setFilterTable] = useState('ALL');
  const [filterUser, setFilterUser] = useState('');
  const [dateRange, setDateRange] = useState('TODAY'); // TODAY, WEEK, MONTH
  const [selectedLog, setSelectedLog] = useState(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

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

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit_logs', filterTable, dateRange],
    queryFn: async () => {
      // En un entorno real consultarías Supabase
      // const { data, error } = await supabase.from('audit_logs').select('*');
      // if (error) throw error;
      // return data;
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateMockLogs();
    }
  });

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (filterTable !== 'ALL') {
      filtered = filtered.filter(l => l.table_name === filterTable);
    }

    if (filterUser) {
      filtered = filtered.filter(l => l.user_email.toLowerCase().includes(filterUser.toLowerCase()));
    }

    return filtered;
  }, [logs, filterTable, filterUser]);

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return 'bg-wms-neon/20 text-wms-neon border-wms-neon/30';
      case 'UPDATE': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'DELETE': return 'bg-wms-danger/20 text-wms-danger border-wms-danger/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getTableBadgeColor = (tableName) => {
    if (tableName.startsWith('wms_')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    if (tableName.startsWith('tms_user') || tableName.startsWith('tms_mod')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (tableName.startsWith('tms_')) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto space-y-6 pb-20 bg-wms-dark min-h-screen text-slate-300 p-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-wms-border pb-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <FileSearch size={24} />
            </div>
            AUDITORÍA DE DATOS
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium ml-1">Traza histórica de cambios en base de datos (PostgreSQL Triggers)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Filtros */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-wms-panel/80 backdrop-blur-xl p-6 rounded-2xl border border-wms-border shadow-2xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Filter size={18} className="text-indigo-400" /> Filtros de Búsqueda
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tabla / Entidad</label>
                <select
                  value={filterTable}
                  onChange={(e) => setFilterTable(e.target.value)}
                  className="w-full p-3 border border-wms-border rounded-xl font-medium text-white outline-none focus:ring-2 focus:ring-indigo-500 bg-wms-dark"
                >
                  <option value="ALL">Todas las tablas</option>
                  <option value="tms_nv_diarias">Órdenes (tms_nv_diarias)</option>
                  <option value="wms_ubicaciones">Stock (wms_ubicaciones)</option>
                  <option value="tms_usuarios">Usuarios (tms_usuarios)</option>
                  <option value="tms_modules_config">Configuración</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Usuario (Email)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    placeholder="ej: admin@sistema.com"
                    className="w-full pl-10 pr-4 py-3 border border-wms-border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-wms-dark text-white text-sm placeholder-slate-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Rango de Fecha</label>
                <div className="flex bg-wms-dark p-1 rounded-lg border border-wms-border">
                  {['TODAY', 'WEEK', 'MONTH'].map(range => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${dateRange === range ? 'bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)] text-indigo-400' : 'text-slate-400 hover:text-slate-300 hover:bg-wms-panel'}`}
                    >
                      {range === 'TODAY' ? 'HOY' : range === 'WEEK' ? 'SEMANA' : 'MES'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/10 p-6 rounded-2xl border border-indigo-500/20">
            <h4 className="font-bold text-indigo-400 flex items-center gap-2 mb-2">
              <Database size={18} /> Sobre esta vista
            </h4>
            <p className="text-sm text-indigo-200/80 leading-relaxed">
              Esta herramienta visualiza los registros capturados por los <strong className="text-indigo-300">Triggers de Auditoría</strong> configurados en PostgreSQL.
              <br /><br />
              Cada operación de escritura (INSERT, UPDATE, DELETE) en tablas críticas genera un registro inmutable para trazabilidad y seguridad.
            </p>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-2xl overflow-hidden min-h-[500px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-wms-dark/80 text-slate-400 font-bold uppercase text-xs border-b border-wms-border">
                  <tr>
                    <th className="px-6 py-4">Fecha / Hora</th>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Acción</th>
                    <th className="px-6 py-4">Entidad Afectada</th>
                    <th className="px-6 py-4 text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wms-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-4 text-indigo-500" size={32} />
                        Cargando traza de auditoría...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-500">
                        <FileSearch size={48} className="mx-auto mb-4 opacity-20" />
                        No se encontraron registros.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-wms-dark/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-mono text-slate-400">
                            <Clock size={14} className="text-indigo-400/50" />
                            {format(new Date(log.timestamp), "dd/MM HH:mm:ss")}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-200">
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
                          <span className="block text-[10px] font-mono mt-1 text-slate-500">ID: {log.record_id}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-colors border border-transparent hover:border-indigo-500/30"
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
        <div className="fixed inset-0 bg-wms-dark/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-wms-panel border border-wms-border rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex justify-between items-start border-b border-wms-border pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <ArrowRightLeft className="text-indigo-400" /> Detalle de Cambio
                </h3>
                <p className="text-sm text-slate-400 font-mono mt-1">{selectedLog.id} • {selectedLog.table_name}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-wms-dark rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-wms-border"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-wms-danger/5 p-4 rounded-xl border border-wms-danger/20">
                <h4 className="font-bold text-wms-danger mb-2 text-sm uppercase">Valor Anterior</h4>
                <pre className="text-xs font-mono text-red-200/70 whitespace-pre-wrap overflow-auto max-h-60">
                  {selectedLog.old_data ? JSON.stringify(selectedLog.old_data, null, 2) : <span className="italic opacity-50">NULL (Insert)</span>}
                </pre>
              </div>

              <div className="bg-wms-neon/5 p-4 rounded-xl border border-wms-neon/20">
                <h4 className="font-bold text-wms-neon mb-2 text-sm uppercase">Valor Nuevo</h4>
                <pre className="text-xs font-mono text-emerald-200/70 whitespace-pre-wrap overflow-auto max-h-60">
                  {selectedLog.new_data ? JSON.stringify(selectedLog.new_data, null, 2) : <span className="italic opacity-50">NULL (Delete)</span>}
                </pre>
              </div>
            </div>

            <div className="bg-wms-dark/50 p-4 rounded-xl border border-wms-border">
              <h4 className="font-bold text-slate-300 mb-1 text-sm">Contexto</h4>
              <p className="text-sm text-slate-400">{selectedLog.details}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
