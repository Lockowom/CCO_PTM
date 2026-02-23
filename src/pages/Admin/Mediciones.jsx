// Mediciones.jsx - Módulo de Mediciones de Tiempos
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Timer, 
  User, 
  Clock, 
  RefreshCw, 
  Search,
  Hand,
  Box,
  Truck,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap
} from 'lucide-react';
import { supabase } from '../../supabase';

const Mediciones = () => {
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProceso, setFilterProceso] = useState('TODOS');
  const [filterFecha, setFilterFecha] = useState('');
  
  // Resumen por usuario
  const [resumenUsuarios, setResumenUsuarios] = useState([]);
  
  // Errores de Picking
  const [erroresPicking, setErroresPicking] = useState([]);

  // Stats generales
  const [stats, setStats] = useState({
    totalMediciones: 0,
    completadas: 0,
    abandonadas: 0,
    tiempoPromedioActivo: 0,
    tiempoPromedioOcio: 0
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('tms_mediciones_tiempos')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterFecha) {
        query = query.gte('created_at', filterFecha + 'T00:00:00');
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;

      setMediciones(data || []);
      
      // Calcular stats generales
      const completadas = (data || []).filter(m => m.estado === 'COMPLETADO');
      const abandonadas = (data || []).filter(m => m.estado === 'ABANDONADO');
      
      const tiempoTotalActivo = completadas.reduce((sum, m) => sum + (m.tiempo_activo || 0), 0);
      const tiempoTotalOcio = completadas.reduce((sum, m) => sum + (m.tiempo_ocio || 0), 0);
      
      setStats({
        totalMediciones: (data || []).length,
        completadas: completadas.length,
        abandonadas: abandonadas.length,
        tiempoPromedioActivo: completadas.length > 0 ? Math.round(tiempoTotalActivo / completadas.length) : 0,
        tiempoPromedioOcio: completadas.length > 0 ? Math.round(tiempoTotalOcio / completadas.length) : 0
      });
      
      // Cargar errores de picking
      const { data: erroresData, error: erroresError } = await supabase
        .from('tms_errores_picking')
        .select('*');
        
      if (erroresError) console.error("Error cargando errores:", erroresError);
      setErroresPicking(erroresData || []);

      // Agrupar por usuario
      const porUsuario = {};
      
      // Procesar errores primero para tener contadores
      const erroresPorUsuario = {};
      (erroresData || []).forEach(err => {
        const nombre = err.usuario_picking_nombre || 'Desconocido';
        if (!erroresPorUsuario[nombre]) erroresPorUsuario[nombre] = 0;
        erroresPorUsuario[nombre]++;
      });

      (data || []).forEach(m => {
        const nombre = m.usuario_nombre || 'Sin Usuario';
        if (!porUsuario[nombre]) {
          porUsuario[nombre] = {
            usuario: nombre,
            picking: { cantidad: 0, tiempoActivo: 0, tiempoOcio: 0 },
            packing: { cantidad: 0, tiempoActivo: 0, tiempoOcio: 0 },
            entrega: { cantidad: 0, tiempoActivo: 0, tiempoOcio: 0 },
            total: { cantidad: 0, tiempoActivo: 0, tiempoOcio: 0 },
            errores: erroresPorUsuario[nombre] || 0 // Cargar errores
          };
        } else {
           // Asegurar que se actualice si ya existe (por si no hay mediciones pero sí errores, aunque raro)
           porUsuario[nombre].errores = erroresPorUsuario[nombre] || 0;
        }
        
        if (m.estado === 'COMPLETADO') {
          const proceso = m.proceso?.toLowerCase() || 'otro';
          if (proceso === 'picking') {
            porUsuario[nombre].picking.cantidad++;
            porUsuario[nombre].picking.tiempoActivo += m.tiempo_activo || 0;
            porUsuario[nombre].picking.tiempoOcio += m.tiempo_ocio || 0;
          } else if (proceso === 'packing') {
            porUsuario[nombre].packing.cantidad++;
            porUsuario[nombre].packing.tiempoActivo += m.tiempo_activo || 0;
            porUsuario[nombre].packing.tiempoOcio += m.tiempo_ocio || 0;
          } else if (proceso === 'entrega') {
            porUsuario[nombre].entrega.cantidad++;
            porUsuario[nombre].entrega.tiempoActivo += m.tiempo_activo || 0;
            porUsuario[nombre].entrega.tiempoOcio += m.tiempo_ocio || 0;
          }
          
          porUsuario[nombre].total.cantidad++;
          porUsuario[nombre].total.tiempoActivo += m.tiempo_activo || 0;
          porUsuario[nombre].total.tiempoOcio += m.tiempo_ocio || 0;
        }
      });
      
      setResumenUsuarios(Object.values(porUsuario).sort((a, b) => b.total.cantidad - a.total.cantidad));
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [filterFecha]);

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('mediciones_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_mediciones_tiempos' }, () => {
        fetchData();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchData]);

  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimeShort = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProcesoConfig = (proceso) => {
    const configs = {
      'PICKING': { icon: Hand, color: 'cyan', label: 'Picking' },
      'PACKING': { icon: Box, color: 'indigo', label: 'Packing' },
      'ENTREGA': { icon: Truck, color: 'emerald', label: 'Entrega' }
    };
    return configs[proceso] || { icon: Activity, color: 'slate', label: proceso };
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      'COMPLETADO': { icon: CheckCircle, color: 'emerald', label: 'Completado' },
      'EN_PROCESO': { icon: Clock, color: 'amber', label: 'En Proceso' },
      'ABANDONADO': { icon: XCircle, color: 'red', label: 'Abandonado' },
      'RECHAZADO': { icon: AlertTriangle, color: 'rose', label: 'Devuelto a Picking' }
    };
    return configs[estado] || { icon: Activity, color: 'slate', label: estado };
  };

  // Filtrar mediciones
  const medicionesFiltradas = mediciones.filter(m => {
    const matchProceso = filterProceso === 'TODOS' || m.proceso === filterProceso;
    const matchSearch = !searchTerm || 
      m.nv?.toString().includes(searchTerm) ||
      m.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchProceso && matchSearch;
  });

  // Exportar CSV
  const exportCSV = () => {
    const headers = ['N.V.', 'Proceso', 'Usuario', 'Inicio', 'Fin', 'Tiempo Activo', 'Tiempo Ocio', 'Estado'];
    const rows = medicionesFiltradas.map(m => [
      m.nv,
      m.proceso,
      m.usuario_nombre,
      m.inicio_at ? new Date(m.inicio_at).toLocaleString() : '',
      m.fin_at ? new Date(m.fin_at).toLocaleString() : '',
      formatTime(m.tiempo_activo),
      formatTime(m.tiempo_ocio),
      m.estado
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mediciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <Timer className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Mediciones de Tiempo</h2>
            <p className="text-slate-500 text-sm">Control de tiempos por usuario y proceso</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Download size={16} /> Exportar
          </button>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats generales */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
            <BarChart3 size={14} /> Total
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalMediciones}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase mb-2">
            <CheckCircle size={14} /> Completadas
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.completadas}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 text-red-600 text-xs font-semibold uppercase mb-2">
            <XCircle size={14} /> Abandonadas
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.abandonadas}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase mb-2">
            <Zap size={14} /> Prom. Activo
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatTime(stats.tiempoPromedioActivo)}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase mb-2">
            <AlertTriangle size={14} /> Prom. Ocio
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatTime(stats.tiempoPromedioOcio)}</p>
        </div>
      </div>

      {/* Resumen por Usuario */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-red-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <User size={18} className="text-orange-600" />
            Resumen por Usuario
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Usuario</th>
                <th className="px-4 py-3 text-center font-medium" colSpan="3">
                  <span className="text-cyan-600">Picking</span>
                </th>
                <th className="px-4 py-3 text-center font-medium" colSpan="3">
                  <span className="text-indigo-600">Packing</span>
                </th>
                <th className="px-4 py-3 text-center font-medium" colSpan="3">
                  <span className="text-emerald-600">Entrega</span>
                </th>
                <th className="px-4 py-3 text-center font-medium" colSpan="2">
                  <span className="text-rose-600">Errores</span>
                </th>
                <th className="px-4 py-3 text-center font-medium" colSpan="2">
                  <span className="text-slate-600">Total</span>
                </th>
              </tr>
              <tr className="text-[10px]">
                <th className="px-4 py-2"></th>
                <th className="px-2 py-2 text-center text-cyan-500">Cant</th>
                <th className="px-2 py-2 text-center text-cyan-500">Activo</th>
                <th className="px-2 py-2 text-center text-cyan-500">Ocio</th>
                <th className="px-2 py-2 text-center text-indigo-500">Cant</th>
                <th className="px-2 py-2 text-center text-indigo-500">Activo</th>
                <th className="px-2 py-2 text-center text-indigo-500">Ocio</th>
                <th className="px-2 py-2 text-center text-emerald-500">Cant</th>
                <th className="px-2 py-2 text-center text-emerald-500">Activo</th>
                <th className="px-2 py-2 text-center text-emerald-500">Ocio</th>
                <th className="px-2 py-2 text-center text-rose-500">Devol.</th>
                <th className="px-2 py-2 text-center text-rose-500">Total</th>
                <th className="px-2 py-2 text-center text-slate-500">Cant</th>
                <th className="px-2 py-2 text-center text-slate-500">Eficiencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resumenUsuarios.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center text-slate-400">
                    No hay datos de mediciones
                  </td>
                </tr>
              ) : (
                resumenUsuarios.map((u, index) => {
                  const eficiencia = u.total.tiempoActivo > 0 
                    ? Math.round((u.total.tiempoActivo / (u.total.tiempoActivo + u.total.tiempoOcio)) * 100)
                    : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">{u.usuario}</td>
                      
                      {/* Picking */}
                      <td className="px-2 py-3 text-center font-bold text-cyan-600">{u.picking.cantidad}</td>
                      <td className="px-2 py-3 text-center text-xs text-cyan-700">{formatTimeShort(u.picking.tiempoActivo)}</td>
                      <td className="px-2 py-3 text-center text-xs text-red-500">{formatTimeShort(u.picking.tiempoOcio)}</td>
                      
                      {/* Packing */}
                      <td className="px-2 py-3 text-center font-bold text-indigo-600">{u.packing.cantidad}</td>
                      <td className="px-2 py-3 text-center text-xs text-indigo-700">{formatTimeShort(u.packing.tiempoActivo)}</td>
                      <td className="px-2 py-3 text-center text-xs text-red-500">{formatTimeShort(u.packing.tiempoOcio)}</td>
                      
                      {/* Entrega */}
                      <td className="px-2 py-3 text-center font-bold text-emerald-600">{u.entrega.cantidad}</td>
                      <td className="px-2 py-3 text-center text-xs text-emerald-700">{formatTimeShort(u.entrega.tiempoActivo)}</td>
                      <td className="px-2 py-3 text-center text-xs text-red-500">{formatTimeShort(u.entrega.tiempoOcio)}</td>

                      {/* Errores */}
                      <td className="px-2 py-3 text-center text-xs text-rose-500 font-bold bg-rose-50">{u.errores || 0}</td>
                      <td className="px-2 py-3 text-center text-xs text-slate-400">{(u.errores / (u.picking.cantidad || 1) * 100).toFixed(1)}%</td>
                      
                      {/* Total */}
                      <td className="px-2 py-3 text-center font-bold text-slate-800">{u.total.cantidad}</td>
                      <td className="px-2 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          eficiencia >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          eficiencia >= 60 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {eficiencia}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla Detalle de Errores (Nueva) */}
      <div className="bg-white rounded-xl shadow-sm border border-rose-200 overflow-hidden">
        <div className="p-4 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
          <h3 className="font-bold text-rose-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600" />
            Registro de Errores de Picking ({erroresPicking.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-rose-50/50 text-rose-800 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-medium">N.V.</th>
                <th className="px-4 py-2 text-left font-medium">Picker (Error)</th>
                <th className="px-4 py-2 text-left font-medium">Detectado Por</th>
                <th className="px-4 py-2 text-left font-medium">Fecha</th>
                <th className="px-4 py-2 text-left font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {erroresPicking.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                    No hay errores registrados
                  </td>
                </tr>
              ) : (
                erroresPicking.map((err, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/30">
                    <td className="px-4 py-2 font-bold text-rose-600">#{err.nv}</td>
                    <td className="px-4 py-2 text-slate-700">{err.usuario_picking_nombre}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{err.usuario_packing_nombre}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {new Date(err.fecha_deteccion).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600 italic">
                      "{err.motivo}"
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
        <Filter size={18} className="text-slate-400" />
        <div className="bg-slate-50 border rounded-lg flex items-center px-3 py-2">
          <Search size={16} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Buscar N.V. o usuario..." 
            className="outline-none text-sm bg-transparent w-48"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterProceso}
          onChange={e => setFilterProceso(e.target.value)}
          className="bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="TODOS">Todos los procesos</option>
          <option value="PICKING">Picking</option>
          <option value="PACKING">Packing</option>
          <option value="ENTREGA">Entrega</option>
        </select>
        <input
          type="date"
          value={filterFecha}
          onChange={e => setFilterFecha(e.target.value)}
          className="bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none"
        />
      </div>

      {/* Historial de Mediciones */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Activity size={18} className="text-orange-500" />
            Historial Detallado ({medicionesFiltradas.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-medium">N.V.</th>
                <th className="px-4 py-3 text-left font-medium">Proceso</th>
                <th className="px-4 py-3 text-left font-medium">Usuario</th>
                <th className="px-4 py-3 text-left font-medium">Inicio</th>
                <th className="px-4 py-3 text-left font-medium">Fin</th>
                <th className="px-4 py-3 text-right font-medium">T. Activo</th>
                <th className="px-4 py-3 text-right font-medium">T. Ocio</th>
                <th className="px-4 py-3 text-center font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <RefreshCw className="animate-spin mx-auto text-orange-500" size={24} />
                  </td>
                </tr>
              ) : medicionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                    <Timer size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No hay mediciones registradas</p>
                  </td>
                </tr>
              ) : (
                medicionesFiltradas.map((m, index) => {
                  const procesoConfig = getProcesoConfig(m.proceso);
                  const estadoConfig = getEstadoConfig(m.estado);
                  const ProcesoIcon = procesoConfig.icon;
                  const EstadoIcon = estadoConfig.icon;
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-indigo-600">#{m.nv}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-${procesoConfig.color}-100 text-${procesoConfig.color}-700`}>
                          <ProcesoIcon size={12} /> {procesoConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{m.usuario_nombre || '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {m.inicio_at ? new Date(m.inicio_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {m.fin_at ? new Date(m.fin_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-600">
                        {formatTime(m.tiempo_activo)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-red-500">
                        {m.tiempo_ocio > 0 ? formatTime(m.tiempo_ocio) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-${estadoConfig.color}-100 text-${estadoConfig.color}-700`}>
                          <EstadoIcon size={12} /> {estadoConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Mediciones;
