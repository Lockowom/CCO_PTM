import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase';
import {
  History, Database, Search, FileText, TrendingUp,
  AlertCircle, CheckCircle2, RefreshCw, Download, X,
  Calendar, ChevronDown, ChevronUp, BarChart3, Loader2,
  ArrowUpRight, Clock, Filter, Zap, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ─── KPI Cell ──────────────────────────────────────────
const KpiCell = ({ label, value, sub, icon: Icon, color = 'slate' }) => {
  const colorMap = {
    orange: 'from-orange-500 to-amber-500 shadow-orange-200',
    blue: 'from-blue-500 to-indigo-500 shadow-blue-200',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-200',
    red: 'from-red-500 to-rose-500 shadow-red-200',
    slate: 'from-slate-600 to-slate-800 shadow-slate-200',
    violet: 'from-violet-500 to-purple-500 shadow-violet-200',
  };
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon size={14} className="text-white" />
        </div>
      </div>
      <p className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
      {sub && <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1 sm:mt-1.5 hidden xs:block">{sub}</p>}
    </div>
  );
};

// ─── Detail Row ────────────────────────────────────────
const DetailPanel = ({ row }) => (
  <tr>
    <td colSpan={8} className="px-0 py-0">
      <div className="bg-slate-50 border-y border-slate-200 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tabla Destino</p>
            <p className="text-sm font-bold text-slate-700 font-mono">{row.tabla_destino || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Usuario ID</p>
            <p className="text-xs font-mono text-slate-500 break-all">{row.usuario_id || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha/Hora Exacta</p>
            <p className="text-sm font-bold text-slate-700">
              {row.fecha_carga ? new Date(row.fecha_carga).toLocaleString('es-CL', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tasa de Éxito</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.registros_error > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${row.registros_totales > 0 ? ((row.registros_totales - (row.registros_error || 0)) / row.registros_totales * 100) : 0}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700">
                {row.registros_totales > 0
                  ? `${Math.round((row.registros_totales - (row.registros_error || 0)) / row.registros_totales * 100)}%`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </td>
  </tr>
);

// ─── Mini Chart Tooltip ────────────────────────────────
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">{d.label}</p>
      <p className="text-slate-500">Cargas: <span className="font-bold text-slate-900">{d.count}</span></p>
      <p className="text-slate-500">Registros: <span className="font-bold text-slate-900">{d.registros?.toLocaleString()}</span></p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────
// ═══════════════════════════════════════════════════════
const UploadHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [showChart, setShowChart] = useState(true);

  // ─── Fetch ───────────────────────────────────────────
  useEffect(() => {
    fetchHistory();

    const channel = supabase
      .channel('realtime-uploads')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_historial_cargas' },
        (payload) => {
          setHistory(prev => [payload.new, ...prev].slice(0, 200));
          toast.info('Nueva carga registrada', {
            description: `${payload.new.usuario_nombre} — ${payload.new.modulo}`,
            duration: 4000,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { fetchHistory(); }, [startDate, endDate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tms_historial_cargas')
        .select('*')
        .order('fecha_carga', { ascending: false });

      if (startDate) query = query.gte('fecha_carga', `${startDate}T00:00:00`);
      if (endDate) query = query.lte('fecha_carga', `${endDate}T23:59:59`);

      const { data, error } = await query.limit(200);
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      toast.error('Error cargando historial');
    } finally {
      setLoading(false);
    }
  };

  // ─── Computed ────────────────────────────────────────
  const modules = useMemo(() => {
    const set = new Set(history.map(h => h.modulo));
    return [...set].sort();
  }, [history]);

  const filtered = useMemo(() => {
    return history.filter(item => {
      if (moduleFilter && item.modulo !== moduleFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (
          !(item.usuario_nombre || '').toLowerCase().includes(q) &&
          !(item.modulo || '').toLowerCase().includes(q) &&
          !(item.tabla_destino || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [history, searchTerm, moduleFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const totalRegistros = filtered.reduce((acc, c) => acc + (c.registros_totales || 0), 0);
    const totalNuevos = filtered.reduce((acc, c) => acc + (c.registros_nuevos || 0), 0);
    const totalActualizados = filtered.reduce((acc, c) => acc + (c.registros_actualizados || 0), 0);
    const totalErrores = filtered.reduce((acc, c) => acc + (c.registros_error || 0), 0);
    const hoy = new Date().toLocaleDateString();
    const cargasHoy = filtered.filter(i => new Date(i.fecha_carga).toLocaleDateString() === hoy).length;
    return { total, totalRegistros, totalNuevos, totalActualizados, totalErrores, cargasHoy };
  }, [filtered]);

  // Chart data: cargas por día (últimos 14 días)
  const chartData = useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { label: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }), count: 0, registros: 0 };
    }
    history.forEach(h => {
      const key = h.fecha_carga?.slice(0, 10);
      if (days[key]) {
        days[key].count++;
        days[key].registros += (h.registros_totales || 0);
      }
    });
    return Object.values(days);
  }, [history]);

  // ─── Actions ─────────────────────────────────────────
  const exportToExcel = () => {
    if (filtered.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(filtered.map(r => ({
      Fecha: r.fecha_carga ? new Date(r.fecha_carga).toLocaleString('es-CL') : '',
      Operador: r.usuario_nombre,
      Módulo: r.modulo,
      'Tabla Destino': r.tabla_destino || '',
      Total: r.registros_totales,
      Nuevos: r.registros_nuevos,
      Actualizados: r.registros_actualizados,
      Errores: r.registros_error,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');
    XLSX.writeFile(wb, `historial_cargas_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Exportado correctamente');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setModuleFilter('');
  };

  const hasFilters = searchTerm || startDate || endDate || moduleFilter;

  // ─── Access Check ───────────────────────────────────
  if (user?.rol !== 'ADMIN' && !user?.es_admin_delegado) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Database size={40} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-black text-slate-900">Acceso Denegado</h2>
        <p className="text-sm text-slate-400 mt-1">Solo administradores pueden ver el historial.</p>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-200">
            <History size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Historial de Cargas</h1>
            <p className="text-sm text-slate-500">Auditoría de cargas masivas y actualizaciones de datos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChart(v => !v)}
            className={`p-2.5 border rounded-lg transition-colors ${showChart ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            title="Mostrar/ocultar gráfico"
          >
            <BarChart3 size={16} />
          </button>
          <button onClick={exportToExcel} className="p-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 transition-colors" title="Exportar Excel">
            <Download size={16} />
          </button>
          <button onClick={fetchHistory} disabled={loading} className="p-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 transition-colors" title="Refrescar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-5">
        <KpiCell label="Cargas" value={stats.total} icon={TrendingUp} color="orange" sub="Total registradas" />
        <KpiCell label="Registros" value={stats.totalRegistros.toLocaleString()} icon={Database} color="blue" sub="Procesados" />
        <KpiCell label="Nuevos" value={stats.totalNuevos.toLocaleString()} icon={CheckCircle2} color="emerald" sub="Insertados" />
        <KpiCell label="Actualizados" value={stats.totalActualizados.toLocaleString()} icon={Zap} color="violet" sub="Modificados" />
        <KpiCell label="Errores" value={stats.totalErrores} icon={AlertCircle} color="red" sub="Detectados" />
        <KpiCell label="Hoy" value={stats.cargasHoy} icon={Clock} color="slate" sub="Cargas del día" />
      </div>

      {/* Chart */}
      {showChart && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Cargas por Día — Últimos 14 Días</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.count > 0 ? '#f97316' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar operador, módulo..."
              className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Module filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} className="text-slate-400" />
            <button
              onClick={() => setModuleFilter('')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${!moduleFilter ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Todos
            </button>
            {modules.map(mod => (
              <button
                key={mod}
                onClick={() => setModuleFilter(mod)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${moduleFilter === mod ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {mod}
              </button>
            ))}
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <Calendar size={14} className="text-slate-400" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-400" />
            <span className="text-slate-300">→</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-400" />
            {hasFilters && (
              <button onClick={clearFilters} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500" title="Limpiar filtros">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Count */}
          <div className="text-xs text-slate-400 font-medium pl-2 md:border-l border-slate-200">
            <span className="font-bold text-slate-700">{filtered.length}</span> registros
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-2 sm:px-4 py-3 text-[11px] font-bold text-slate-500 uppercase w-8"></th>
                <th className="px-2 sm:px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Fecha</th>
                <th className="px-2 sm:px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Operador</th>
                <th className="px-2 sm:px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Módulo</th>
                <th className="px-2 sm:px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-center">Total</th>
                <th className="px-4 py-3 text-[11px] font-bold text-emerald-600 uppercase text-center">Nuevos</th>
                <th className="px-4 py-3 text-[11px] font-bold text-blue-600 uppercase text-center">Modif.</th>
                <th className="px-4 py-3 text-[11px] font-bold text-red-600 uppercase text-center">Errores</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <Loader2 size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Cargando historial...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <Database size={32} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-500 mb-1">Sin registros de actividad</p>
                    <p className="text-xs text-slate-400">{hasFilters ? 'Intenta cambiar los filtros' : 'Las cargas aparecerán aquí automáticamente'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className="border-b border-slate-100 hover:bg-orange-50/30 transition-colors group cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}>
                      <td className="px-2 sm:px-4 py-3">
                        <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors">
                          {expandedRow === row.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {row.fecha_carga ? new Date(row.fecha_carga).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={9} />
                            {row.fecha_carga ? new Date(row.fecha_carga).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                            {(row.usuario_nombre || 'U').charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{row.usuario_nombre}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                          <FileText size={11} />
                          {row.modulo}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <span className="text-sm font-black text-slate-900">{row.registros_totales}</span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <span className={`inline-block min-w-[36px] px-2 py-0.5 rounded-md text-xs font-bold ${
                          (row.registros_nuevos || 0) > 0 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'text-slate-300'
                        }`}>
                          {(row.registros_nuevos || 0) > 0 ? `+${row.registros_nuevos}` : '0'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <span className={`inline-block min-w-[36px] px-2 py-0.5 rounded-md text-xs font-bold ${
                          (row.registros_actualizados || 0) > 0 ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-slate-300'
                        }`}>
                          {row.registros_actualizados || '0'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <span className={`inline-block min-w-[36px] px-2 py-0.5 rounded-md text-xs font-bold ${
                          (row.registros_error || 0) > 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'text-slate-300'
                        }`}>
                          {row.registros_error || '0'}
                        </span>
                      </td>
                    </tr>
                    {expandedRow === row.id && <DetailPanel row={row} />}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UploadHistory;
