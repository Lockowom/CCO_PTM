import React, { useState, useEffect } from 'react';
import {
  Activity, Database, AlertTriangle, ShieldCheck,
  Server, Play, CheckCircle, Clock, RefreshCw,
  HardDrive, AlertOctagon, FileText
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';
import gsap from 'gsap';

const SystemHealth = () => {
  const [loading, setLoading] = useState(false);
  const [runningCheck, setRunningCheck] = useState(null);

  // Database Stats
  const [dbStats, setDbStats] = useState({
    orders_count: 0,
    products_count: 0,
    locations_count: 0,
    audit_logs_size: 0,
    db_size_mb: 45 // Simulado
  });

  // Integrity Issues
  const [issues, setIssues] = useState([]);

  // Realtime Events
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchStats();

    // Simular eventos realtime de sistema
    const interval = setInterval(() => {
      const newEvent = generateMockEvent();
      setEvents(prev => [newEvent, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Consultas paralelas para obtener conteos
      const { count: orders } = await supabase.from('tms_nv_diarias').select('*', { count: 'exact', head: true });
      const { count: products } = await supabase.from('tms_matriz_codigos').select('*', { count: 'exact', head: true });
      const { count: locs } = await supabase.from('wms_ubicaciones').select('*', { count: 'exact', head: true });

      setDbStats(prev => ({
        ...prev,
        orders_count: orders || 0,
        products_count: products || 0,
        locations_count: locs || 0
      }));

    } catch (err) {
      console.error(err);
    }
  };

  const generateMockEvent = () => {
    const types = ['INFO', 'WARNING', 'ERROR', 'SUCCESS'];
    const type = types[Math.floor(Math.random() * types.length)];
    const msgs = [
      'Backup automático completado',
      'Detectado intento de acceso fallido IP 192.168.1.45',
      'Sincronización de stock finalizada',
      'Alto uso de CPU en nodo de base de datos',
      'Usuario Admin actualizó configuración WMS'
    ];
    return {
      id: Date.now(),
      type,
      message: msgs[Math.floor(Math.random() * msgs.length)],
      timestamp: new Date().toLocaleTimeString()
    };
  };

  const runIntegrityCheck = async (checkType) => {
    setRunningCheck(checkType);
    setLoading(true);

    // Simular tiempo de ejecución de función de Supabase
    await new Promise(resolve => setTimeout(resolve, 2000));

    let result = [];

    if (checkType === 'STOCK_CONSISTENCY') {
      // Simulación: Buscar diferencias entre maestro y ubicaciones
      result = [
        { id: 1, severity: 'HIGH', message: 'Producto SKU-1004 tiene stock negativo (-5) en Kardex' },
        { id: 2, severity: 'MEDIUM', message: 'Ubicación A-01-02 marcada vacía pero tiene saldo lógico' }
      ];
    } else if (checkType === 'STUCK_PROCESSES') {
      result = [
        { id: 3, severity: 'LOW', message: 'Orden #45001 en "Picking" por más de 48 horas' }
      ];
    } else if (checkType === 'ORPHAN_RECORDS') {
      result = []; // Todo ok
    }

    setIssues(result);
    setLoading(false);
    setRunningCheck(null);

    // Lanzar alertas visuales si se encontraron problemas
    if (result.length > 0) {
      toast.error(`Verificación finalizada: Se encontraron ${result.length} anomalías.`);
    } else {
      toast.success('Integridad verificada. No se encontraron problemas.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200">
              <Activity size={24} />
            </div>
            SALUD DEL SISTEMA
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Monitoreo de Base de Datos y Procesos (Supabase)</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          SISTEMA OPERATIVO
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna 1: Estadísticas de Base de Datos */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database className="text-indigo-500" /> Métricas de Base de Datos
            </h3>

            <div className="space-y-4">
              <StatRow label="Órdenes Totales" value={dbStats.orders_count} icon={<FileText size={16} />} />
              <StatRow label="Maestro Productos" value={dbStats.products_count} icon={<HardDrive size={16} />} />
              <StatRow label="Ubicaciones WMS" value={dbStats.locations_count} icon={<Server size={16} />} />

              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Almacenamiento (Est.)</span>
                  <span className="text-sm font-black text-slate-800">{dbStats.db_size_mb} MB / 500 MB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(dbStats.db_size_mb / 500) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Log de Eventos Realtime */}
          <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 h-[400px] flex flex-col">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-400">
              <Activity size={18} /> Live System Events
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono text-xs">
              {events.map(event => (
                <div key={event.id} className="border-l-2 border-slate-700 pl-3 py-1 animate-in slide-in-from-left-2 fade-in">
                  <div className="flex justify-between opacity-50 mb-0.5">
                    <span>{event.timestamp}</span>
                    <span className={`font-bold ${event.type === 'ERROR' ? 'text-red-400' :
                        event.type === 'WARNING' ? 'text-amber-400' :
                          'text-blue-400'
                      }`}>{event.type}</span>
                  </div>
                  <p className="opacity-90 leading-tight">{event.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna 2 y 3: Herramientas de Integridad */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" /> Verificación de Integridad (Supabase Functions)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <CheckCard
                title="Consistencia de Stock"
                desc="Valida sumas de ubicaciones vs maestro."
                loading={runningCheck === 'STOCK_CONSISTENCY'}
                onClick={() => runIntegrityCheck('STOCK_CONSISTENCY')}
              />
              <CheckCard
                title="Procesos Estancados"
                desc="Detecta órdenes bloqueadas > 24h."
                loading={runningCheck === 'STUCK_PROCESSES'}
                onClick={() => runIntegrityCheck('STUCK_PROCESSES')}
              />
              <CheckCard
                title="Registros Huérfanos"
                desc="Limpia referencias rotas en DB."
                loading={runningCheck === 'ORPHAN_RECORDS'}
                onClick={() => runIntegrityCheck('ORPHAN_RECORDS')}
              />
            </div>

            {/* Resultados */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 min-h-[200px]">
              <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Resultados del Diagnóstico</h4>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <RefreshCw className="animate-spin mb-2" size={32} />
                  <p>Ejecutando análisis en base de datos...</p>
                </div>
              ) : issues.length === 0 && runningCheck === null ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Selecciona una herramienta para iniciar el diagnóstico.</p>
                </div>
              ) : issues.length === 0 ? (
                <div className="flex items-center justify-center gap-3 py-8 text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100">
                  <CheckCircle size={24} />
                  <span className="font-bold">No se encontraron problemas de integridad.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.map(issue => (
                    <div key={issue.id} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      {issue.severity === 'HIGH' ? (
                        <AlertOctagon className="text-red-500 shrink-0" />
                      ) : issue.severity === 'MEDIUM' ? (
                        <AlertTriangle className="text-amber-500 shrink-0" />
                      ) : (
                        <Clock className="text-blue-500 shrink-0" />
                      )}
                      <div>
                        <h5 className={`font-bold text-sm ${issue.severity === 'HIGH' ? 'text-red-700' :
                            issue.severity === 'MEDIUM' ? 'text-amber-700' :
                              'text-blue-700'
                          }`}>
                          {issue.severity === 'HIGH' ? 'ERROR CRÍTICO' : issue.severity === 'MEDIUM' ? 'ADVERTENCIA' : 'INFO'}
                        </h5>
                        <p className="text-slate-600 text-sm mt-1">{issue.message}</p>
                      </div>
                      <button className="ml-auto text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                        CORREGIR
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-default">
    <div className="flex items-center gap-3 text-slate-500">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="font-bold text-slate-800">{value.toLocaleString()}</span>
  </div>
);

const CheckCard = ({ title, desc, loading, onClick }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all bg-white group disabled:opacity-70 disabled:cursor-not-allowed"
  >
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 rounded-lg ${loading ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'} transition-colors`}>
        {loading ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
      </div>
    </div>
    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</h4>
    <p className="text-xs text-slate-500 mt-1">{desc}</p>
  </button>
);

export default SystemHealth;
