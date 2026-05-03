import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Activity, Database, AlertTriangle, ShieldCheck,
  Server, Play, CheckCircle, Clock, RefreshCw,
  HardDrive, AlertOctagon, FileText
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';

const SystemHealth = () => {
  const containerRef = useRef();
  const queryClient = useQueryClient();
  const [runningCheck, setRunningCheck] = useState(null);
  const [issues, setIssues] = useState([]);
  const [events, setEvents] = useState([]);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  useEffect(() => {
    // Simular eventos realtime de sistema
    const interval = setInterval(() => {
      const newEvent = generateMockEvent();
      setEvents(prev => [newEvent, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const { data: dbStats = { orders_count: 0, products_count: 0, locations_count: 0, db_size_mb: 45 }, isLoading: isLoadingStats } = useQuery({
    queryKey: ['system_health_stats'],
    queryFn: async () => {
      const { count: orders } = await supabase.from('tms_nv_diarias').select('*', { count: 'exact', head: true });
      const { count: products } = await supabase.from('tms_matriz_codigos').select('*', { count: 'exact', head: true });
      const { count: locs } = await supabase.from('wms_ubicaciones').select('*', { count: 'exact', head: true });

      return {
        orders_count: orders || 0,
        products_count: products || 0,
        locations_count: locs || 0,
        db_size_mb: 45 // Simulado
      };
    },
    refetchInterval: 60000 // Actualizar cada minuto
  });

  const runIntegrityCheck = async (checkType) => {
    setRunningCheck(checkType);

    // Simular tiempo de ejecución de función de Supabase
    await new Promise(resolve => setTimeout(resolve, 2000));

    let result = [];

    if (checkType === 'STOCK_CONSISTENCY') {
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
    setRunningCheck(null);

    if (result.length > 0) {
      toast.error(`Verificación finalizada: Se encontraron ${result.length} anomalías.`, {
        style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' }
      });
    } else {
      toast.success('Integridad verificada. No se encontraron problemas.', {
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
      });
    }
  };

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-8 pb-20 bg-wms-dark min-h-screen text-slate-300 p-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-wms-border pb-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-wms-neon/5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-wms-neon/20 text-wms-neon border border-wms-neon/30 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Activity size={24} />
            </div>
            SALUD DEL SISTEMA
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium ml-1">Monitoreo de Base de Datos y Procesos (Supabase)</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold bg-wms-neon/10 text-wms-neon px-3 py-1 rounded-full border border-wms-neon/30 shadow-[0_0_10px_rgba(16,185,129,0.1)] relative z-10">
          <div className="w-2 h-2 bg-wms-neon rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></div>
          SISTEMA OPERATIVO
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

        {/* Columna 1: Estadísticas de Base de Datos */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-wms-border p-6">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Database className="text-indigo-400" /> Métricas de Base de Datos
            </h3>

            <div className="space-y-4">
              <StatRow label="Órdenes Totales" value={dbStats.orders_count} icon={<FileText size={16} />} loading={isLoadingStats} />
              <StatRow label="Maestro Productos" value={dbStats.products_count} icon={<HardDrive size={16} />} loading={isLoadingStats} />
              <StatRow label="Ubicaciones WMS" value={dbStats.locations_count} icon={<Server size={16} />} loading={isLoadingStats} />

              <div className="pt-4 mt-4 border-t border-wms-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Almacenamiento (Est.)</span>
                  <span className="text-sm font-black text-white">{dbStats.db_size_mb} MB / 500 MB</span>
                </div>
                <div className="w-full bg-wms-dark rounded-full h-2 border border-wms-border">
                  <div className="bg-indigo-500 h-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${(dbStats.db_size_mb / 500) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Log de Eventos Realtime */}
          <div className="bg-wms-dark border border-wms-border rounded-2xl shadow-2xl p-6 h-[400px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-wms-dark pointer-events-none z-10"></div>
            <h3 className="font-bold mb-4 flex items-center gap-2 text-wms-neon relative z-20">
              <Activity size={18} /> Live System Events
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono text-xs relative z-20 pb-10">
              {events.map(event => (
                <div key={event.id} className="border-l-2 border-slate-700 pl-3 py-1 animate-in slide-in-from-left-2 fade-in">
                  <div className="flex justify-between opacity-50 mb-0.5">
                    <span className="text-slate-400">{event.timestamp}</span>
                    <span className={`font-bold ${event.type === 'ERROR' ? 'text-wms-danger' :
                        event.type === 'WARNING' ? 'text-wms-alert' :
                          'text-indigo-400'
                      }`}>{event.type}</span>
                  </div>
                  <p className="text-slate-300 leading-tight">{event.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna 2 y 3: Herramientas de Integridad */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-wms-border p-6">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-wms-neon" /> Verificación de Integridad (Supabase Functions)
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
            <div className="bg-wms-dark/50 rounded-xl border border-wms-border p-6 min-h-[200px]">
              <h4 className="font-bold text-slate-400 mb-4 text-sm uppercase tracking-wider">Resultados del Diagnóstico</h4>

              {runningCheck ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <RefreshCw className="animate-spin mb-2 text-indigo-400" size={32} />
                  <p>Ejecutando análisis en base de datos...</p>
                </div>
              ) : issues.length === 0 && runningCheck === null ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Selecciona una herramienta para iniciar el diagnóstico.</p>
                </div>
              ) : issues.length === 0 ? (
                <div className="flex items-center justify-center gap-3 py-8 text-wms-neon bg-wms-neon/5 rounded-lg border border-wms-neon/20">
                  <CheckCircle size={24} />
                  <span className="font-bold">No se encontraron problemas de integridad.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.map(issue => (
                    <div key={issue.id} className="flex items-start gap-3 p-4 bg-wms-panel border border-wms-border rounded-lg shadow-sm hover:border-slate-500 transition-colors">
                      {issue.severity === 'HIGH' ? (
                        <AlertOctagon className="text-wms-danger shrink-0" />
                      ) : issue.severity === 'MEDIUM' ? (
                        <AlertTriangle className="text-wms-alert shrink-0" />
                      ) : (
                        <Clock className="text-blue-400 shrink-0" />
                      )}
                      <div>
                        <h5 className={`font-bold text-sm ${issue.severity === 'HIGH' ? 'text-wms-danger' :
                            issue.severity === 'MEDIUM' ? 'text-wms-alert' :
                              'text-blue-400'
                          }`}>
                          {issue.severity === 'HIGH' ? 'ERROR CRÍTICO' : issue.severity === 'MEDIUM' ? 'ADVERTENCIA' : 'INFO'}
                        </h5>
                        <p className="text-slate-300 text-sm mt-1">{issue.message}</p>
                      </div>
                      <button className="ml-auto text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-500/30">
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

const StatRow = ({ label, value, icon, loading }) => (
  <div className="flex justify-between items-center p-3 bg-wms-dark/50 border border-wms-border hover:border-slate-500 rounded-lg transition-colors cursor-default">
    <div className="flex items-center gap-3 text-slate-400">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    {loading ? (
      <div className="w-8 h-4 bg-slate-700 animate-pulse rounded"></div>
    ) : (
      <span className="font-bold text-white">{value.toLocaleString()}</span>
    )}
  </div>
);

const CheckCard = ({ title, desc, loading, onClick }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="text-left p-4 rounded-xl border border-wms-border hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all bg-wms-dark group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-wms-border disabled:hover:shadow-none"
  >
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 rounded-lg ${loading ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-wms-panel text-slate-400 border border-wms-border group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/30'} transition-colors`}>
        {loading ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
      </div>
    </div>
    <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</h4>
    <p className="text-xs text-slate-500 mt-1">{desc}</p>
  </button>
);

export default SystemHealth;
