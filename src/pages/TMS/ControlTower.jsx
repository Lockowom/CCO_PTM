import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { toast } from 'sonner';
import {
  Radio,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Phone,
  User,
  Calendar,
  Activity,
  Filter,
  Eye,
  Ban,
  RotateCcw,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

// Estados de entregas con configuración (Cyber-Logística Style)
const ESTADOS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: 'amber', bgColor: 'bg-wms-alert/20', textColor: 'text-wms-alert', borderColor: 'border-wms-alert/30', icon: Clock },
  EN_RUTA: { label: 'En Ruta', color: 'blue', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400', borderColor: 'border-blue-500/30', icon: Truck },
  ENTREGADO: { label: 'Entregado', color: 'emerald', bgColor: 'bg-wms-neon/20', textColor: 'text-wms-neon', borderColor: 'border-wms-neon/30', icon: CheckCircle },
  RECHAZADO: { label: 'Rechazado', color: 'red', bgColor: 'bg-wms-danger/20', textColor: 'text-wms-danger', borderColor: 'border-wms-danger/30', icon: Ban },
  REPROGRAMADO: { label: 'Reprogramado', color: 'purple', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400', borderColor: 'border-purple-500/30', icon: Calendar },
};

const ControlTower = () => {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [searchText, setSearchText] = useState('');
  const [expandedEntrega, setExpandedEntrega] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  // TanStack Queries
  const { data: conductores = [], isLoading: loadingConductores } = useQuery({
    queryKey: ['tower_conductores'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tms_conductores').select('*').order('nombre');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rutas = [], isLoading: loadingRutas } = useQuery({
    queryKey: ['tower_rutas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_rutas')
        .select(`*, conductor:tms_conductores(nombre, apellido, vehiculo_patente)`)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: entregas = [], isLoading: loadingEntregas } = useQuery({
    queryKey: ['tower_entregas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_entregas')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const loading = loadingConductores || loadingRutas || loadingEntregas;

  // Supabase Realtime para Invalidation Optimista
  useEffect(() => {
    const channel = supabase.channel('tower_realtime_v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_conductores' }, () => {
        queryClient.invalidateQueries(['tower_conductores']);
        setLastUpdate(new Date());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_rutas' }, () => {
        queryClient.invalidateQueries(['tower_rutas']);
        setLastUpdate(new Date());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_entregas' }, (payload) => {
        queryClient.invalidateQueries(['tower_entregas']);
        setLastUpdate(new Date());
        
        // Notificación opcional (Gamificación)
        if (payload.eventType === 'UPDATE' && payload.new?.estado === 'ENTREGADO') {
          toast.success(`📦 ¡Entrega completada!`, {
            description: `NV: ${payload.new.nv} entregada a ${payload.new.cliente}`,
            style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
          });
        } else if (payload.eventType === 'UPDATE' && payload.new?.estado === 'RECHAZADO') {
          toast.error(`❌ Alerta de Rechazo`, {
            description: `NV: ${payload.new.nv} fue rechazada.`,
            style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' }
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    }
  }, [queryClient]);

  // Estadísticas Computadas
  const stats = useMemo(() => {
    const entregadas = entregas.filter(e => e.estado === 'ENTREGADO').length;
    const rechazadas = entregas.filter(e => e.estado === 'RECHAZADO').length;
    const totalFinalizadas = entregadas + rechazadas;

    return {
      total: entregas.length,
      pendientes: entregas.filter(e => e.estado === 'PENDIENTE').length,
      enRuta: entregas.filter(e => e.estado === 'EN_RUTA').length,
      entregadas,
      rechazadas,
      reprogramadas: entregas.filter(e => e.estado === 'REPROGRAMADO').length,
      conductoresActivos: conductores.filter(c => c.estado === 'EN_RUTA').length,
      porcentajeExito: totalFinalizadas > 0 ? Math.round((entregadas / totalFinalizadas) * 100) : 0
    };
  }, [entregas, conductores]);

  // Filtrar entregas
  const entregasFiltradas = useMemo(() => {
    return entregas.filter(e => {
      const matchEstado = filterEstado === 'TODOS' || e.estado === filterEstado;
      const matchSearch = !searchText || 
        e.cliente?.toLowerCase().includes(searchText.toLowerCase()) ||
        e.nv?.toLowerCase().includes(searchText.toLowerCase()) ||
        e.direccion?.toLowerCase().includes(searchText.toLowerCase());
      const matchConductor = !selectedRoute || e.ruta_id === selectedRoute;
      return matchEstado && matchSearch && matchConductor;
    });
  }, [entregas, filterEstado, searchText, selectedRoute]);

  const entregasPorRuta = (rutaId) => entregas.filter(e => e.ruta_id === rutaId);

  const EstadoBadge = ({ estado, size = 'sm' }) => {
    const config = ESTADOS_CONFIG[estado] || { label: estado, bgColor: 'bg-white', textColor: 'text-slate-500', borderColor: 'border-slate-300', icon: Package };
    const Icon = config.icon;
    const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm gap-2' : 'px-2 py-0.5 text-[10px] gap-1';
    
    return (
      <span className={`inline-flex items-center rounded-full font-medium border ${sizeClasses} ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        <Icon size={size === 'lg' ? 14 : 10} />
        {config.label}
      </span>
    );
  };

  const KPICard = ({ title, value, subtitle, icon: Icon, glowColor }) => (
    <div className={`bg-white backdrop-blur-xl rounded-2xl p-4 border border-slate-200 relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${glowColor}-500/10 rounded-full blur-2xl group-hover:bg-${glowColor}-500/20 transition-all`}></div>
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className={`text-slate-500 text-xs font-bold uppercase tracking-wider`}>{title}</span>
        <div className={`w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center`}>
          <Icon size={16} className={`text-${glowColor}-400`} />
        </div>
      </div>
      <p className={`text-3xl font-black text-slate-900 relative z-10`}>{value}</p>
      {subtitle && <p className={`text-xs text-slate-500 mt-1 font-medium relative z-10`}>{subtitle}</p>}
    </div>
  );

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 text-slate-700">
      {/* Background Decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Radio className="text-indigo-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Torre de Control <span className="text-indigo-400">TMS</span></h2>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-wms-neon rounded-full animate-pulse shadow-neon-green"></span>
              Sincronizado: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            queryClient.invalidateQueries(['tower_conductores']);
            queryClient.invalidateQueries(['tower_rutas']);
            queryClient.invalidateQueries(['tower_entregas']);
          }}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-white border border-slate-200 text-slate-900 rounded-xl transition-colors font-bold shadow-sm"
        >
          <RefreshCw size={18} className={`${loading ? 'animate-spin text-wms-neon' : 'text-slate-500'}`} />
          {loading ? 'Sincronizando...' : 'Refrescar'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-7 gap-4 mb-6 relative z-10">
        <KPICard title="Total" value={stats.total} icon={Package} glowColor="slate" />
        <KPICard title="Pendientes" value={stats.pendientes} icon={Clock} glowColor="amber" />
        <KPICard title="En Ruta" value={stats.enRuta} icon={Truck} glowColor="blue" />
        <KPICard title="Entregadas" value={stats.entregadas} subtitle={`${stats.porcentajeExito}% éxito`} icon={CheckCircle} glowColor="emerald" />
        <KPICard title="Rechazadas" value={stats.rechazadas} icon={Ban} glowColor="red" />
        <KPICard title="Reprogramadas" value={stats.reprogramadas} icon={Calendar} glowColor="purple" />
        <KPICard title="Conductores" value={stats.conductoresActivos} subtitle={`de ${conductores.length} activos`} icon={Activity} glowColor="indigo" />
      </div>

      {/* Main Content */}
      <div className="flex gap-6 flex-1 overflow-hidden relative z-10">
        
        {/* Panel Izquierdo: Rutas Activas */}
        <div className="w-80 bg-white backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden relative">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500/50 to-indigo-500"></div>
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-indigo-400" />
              Rutas Activas
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            <button
              onClick={() => setSelectedRoute(null)}
              className={`w-full p-3 rounded-xl border transition-all text-left ${
                !selectedRoute
                  ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                  : 'bg-slate-50/50 border-slate-200 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center">
                  <Radio size={18} className={!selectedRoute ? 'text-indigo-400' : 'text-slate-500'} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Todas las Rutas</p>
                  <p className="text-xs font-medium text-slate-500">{entregas.length} entregas totales</p>
                </div>
              </div>
            </button>

            {rutas.map((ruta) => {
              const entregasR = entregasPorRuta(ruta.id);
              const completadas = entregasR.filter(e => e.estado === 'ENTREGADO').length;
              const pendientes = entregasR.length - completadas;
              const conductor = ruta.conductor || conductores.find(c => c.id === ruta.conductor_id);
              
              return (
                <button
                  key={ruta.id}
                  onClick={() => setSelectedRoute(ruta.id)}
                  className={`w-full p-3 rounded-xl border transition-all text-left group ${
                    selectedRoute === ruta.id
                      ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-500 group-hover:text-indigo-400 transition-colors">
                        <Truck size={18} />
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-wms-panel ${
                        ruta.estado === 'EN_RUTA' ? 'bg-wms-neon shadow-neon-green' :
                        ruta.estado === 'PLANIFICADA' ? 'bg-blue-400' :
                        'bg-slate-500'
                      }`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-200 truncate" title={ruta.nombre}>
                        {ruta.nombre}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                           <User size={10} /> {conductor ? `${conductor.nombre} ${conductor.apellido}` : 'Sin Conductor'}
                        </span>
                        <span className={`text-[10px] font-bold tracking-wider ${
                          ruta.estado === 'EN_RUTA' ? 'text-wms-neon' : 'text-blue-400'
                        }`}>
                          {ruta.estado}
                        </span>
                      </div>
                    </div>
                    {entregasR.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{completadas}/{entregasR.length}</p>
                        {pendientes > 0 && (
                          <p className="text-[10px] text-blue-400 font-bold">{pendientes} pend.</p>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {rutas.length === 0 && (
                <div className="text-center py-8 text-slate-500 font-medium text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    No hay rutas recientes
                </div>
            )}
          </div>
        </div>

        {/* Panel Central: Feed de Entregas */}
        <div className="flex-1 bg-white backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden relative">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500/50 to-wms-neon"></div>
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-wms-neon" />
                Feed de Entregas
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">{entregasFiltradas.length} resultados</span>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3 py-2 focus-within:border-wms-neon focus-within:ring-1 focus-within:ring-wms-neon/30 transition-all">
                <Search size={16} className="text-slate-500 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, NV, dirección..."
                  className="flex-1 outline-none text-sm bg-transparent font-medium text-slate-900 placeholder-slate-600"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none font-bold text-slate-700 focus:border-wms-neon focus:ring-1 focus:ring-wms-neon/30 transition-all"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">🕐 Pendientes</option>
                <option value="EN_RUTA">🚚 En Ruta</option>
                <option value="ENTREGADO">✅ Entregadas</option>
                <option value="RECHAZADO">❌ Rechazadas</option>
                <option value="REPROGRAMADO">📅 Reprogramadas</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-wms-neon rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Sincronizando feed...</p>
              </div>
            ) : entregasFiltradas.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-200">
                <Package size={48} className="mx-auto mb-3 text-slate-600 opacity-50" />
                <p className="font-bold text-slate-500">No hay entregas en esta vista</p>
                <p className="text-sm text-slate-500 mt-1">Intenta ajustando los filtros</p>
              </div>
            ) : (
              entregasFiltradas.map((entrega) => {
                const ruta = rutas.find(r => r.id === entrega.ruta_id);
                const conductor = conductores.find(c => c.id === entrega.conductor_id) || 
                                 (ruta ? conductores.find(c => c.id === ruta.conductor_id) : null);
                
                const isExpanded = expandedEntrega === entrega.id;
                
                return (
                  <div
                    key={entrega.id}
                    className={`rounded-xl border transition-all duration-300 bg-slate-50/50 ${
                      isExpanded ? 'border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]' : 'border-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedEntrega(isExpanded ? null : entrega.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          ESTADOS_CONFIG[entrega.estado]?.bgColor || 'bg-white'
                        } ${ESTADOS_CONFIG[entrega.estado]?.borderColor || 'border-slate-300'}`}>
                          {React.createElement(ESTADOS_CONFIG[entrega.estado]?.icon || Package, {
                            size: 20,
                            className: ESTADOS_CONFIG[entrega.estado]?.textColor || 'text-slate-500'
                          })}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs bg-white text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-300 shadow-inner">
                                NV: {entrega.nv}
                              </span>
                              {ruta && (
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 truncate max-w-[120px] font-bold" title={ruta.nombre}>
                                  {ruta.nombre}
                                </span>
                              )}
                              <EstadoBadge estado={entrega.estado} />
                            </div>
                            {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                          </div>
                          
                          <p className="font-black text-slate-900 truncate text-lg mt-1">{entrega.cliente}</p>
                          <p className="text-xs text-slate-500 font-medium truncate mt-1">
                            <MapPin size={12} className="inline mr-1 text-slate-500" />
                            {entrega.direccion}, {entrega.comuna}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-3 text-[11px] font-bold">
                            <span className="bg-white text-slate-700 px-2 py-1 rounded border border-slate-300">{entrega.bultos || 0} bultos</span>
                            <span className="text-slate-500">{entrega.peso_kg || 0} kg</span>
                            {conductor && (
                              <span className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">
                                <User size={12} /> {conductor.nombre} {conductor.apellido}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-200 mt-2 pt-4 bg-slate-50/30 rounded-b-xl">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="bg-white/50 p-2.5 rounded-lg border border-slate-300">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Factura</p>
                            <p className="font-bold text-slate-200">{entrega.facturas || '-'}</p>
                          </div>
                          <div className="bg-white/50 p-2.5 rounded-lg border border-slate-300">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Guía</p>
                            <p className="font-bold text-slate-200">{entrega.guia || '-'}</p>
                          </div>
                          <div className="bg-white/50 p-2.5 rounded-lg border border-slate-300">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Teléfono</p>
                            <p className="font-bold text-slate-200">{entrega.telefono || '-'}</p>
                          </div>
                        </div>
                        
                        {entrega.observaciones && (
                          <div className="mt-3 p-3 bg-wms-alert/10 rounded-lg border border-wms-alert/20">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-wms-alert mb-1">Observaciones del Conductor</p>
                            <p className="text-sm font-medium text-amber-200/80 whitespace-pre-line">{entrega.observaciones}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-3 mt-4">
                          {entrega.telefono && (
                            <a 
                              href={`tel:${entrega.telefono}`}
                              className="flex items-center justify-center gap-2 flex-1 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-bold hover:bg-blue-500/20 transition-colors"
                            >
                              <Phone size={14} /> Llamar Cliente
                            </a>
                          )}
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entrega.direccion + ', ' + entrega.comuna)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 flex-1 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm font-bold hover:bg-indigo-500/20 transition-colors"
                          >
                            <ExternalLink size={14} /> Ruta en Maps
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel Derecho: Alertas y Actividad */}
        <div className="w-80 flex flex-col gap-6 relative z-10">
          
          <div className="bg-white backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl flex-1 flex flex-col overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-wms-alert/50 to-wms-alert"></div>
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-wms-alert" />
                Panel de Alertas
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {stats.rechazadas > 0 && (
                <div className="p-3 bg-wms-danger/10 border border-wms-danger/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-wms-danger/20 rounded-lg">
                      <Ban size={16} className="text-wms-danger" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Entregas Rechazadas</p>
                      <p className="text-xs font-medium text-wms-danger/80 mt-0.5">{stats.rechazadas} requieren revisión</p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.reprogramadas > 0 && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Calendar size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Reprogramadas</p>
                      <p className="text-xs font-medium text-purple-400/80 mt-0.5">{stats.reprogramadas} para reagendar</p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.pendientes > 10 && (
                <div className="p-3 bg-wms-alert/10 border border-wms-alert/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-wms-alert/20 rounded-lg">
                      <Clock size={16} className="text-wms-alert" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Alto Volumen</p>
                      <p className="text-xs font-medium text-wms-alert/80 mt-0.5">{stats.pendientes} entregas pendientes</p>
                    </div>
                  </div>
                </div>
              )}

              {stats.rechazadas === 0 && stats.reprogramadas === 0 && stats.pendientes <= 10 && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle size={24} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-emerald-400">Todo en orden</p>
                  <p className="text-xs text-slate-500 mt-1">Sin alertas activas</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl flex-1 flex flex-col overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500/50 to-blue-500"></div>
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Log de Actividad
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {entregas
                .filter(e => e.estado !== 'PENDIENTE')
                .slice(0, 10)
                .map((entrega) => {
                  const conductor = conductores.find(c => c.id === entrega.conductor_id);
                  const config = ESTADOS_CONFIG[entrega.estado];
                  
                  return (
                    <div key={entrega.id} className={`p-3 border-l-4 ${config?.borderColor || 'border-slate-300'} bg-slate-50/50 rounded-r-xl border-y border-r border-slate-200 hover:bg-white transition-colors`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-300">{entrega.nv}</span>
                        <EstadoBadge estado={entrega.estado} />
                      </div>
                      <p className="text-xs font-bold text-slate-200 truncate">{entrega.cliente}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        {conductor?.nombre || 'Sin asignar'} • {new Date(entrega.updated_at || entrega.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })}
              
              {entregas.filter(e => e.estado !== 'PENDIENTE').length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8 font-medium">Esperando actividad de flota...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlTower;
