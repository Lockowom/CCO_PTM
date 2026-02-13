// ControlTower.jsx - Torre de Control con monitoreo en tiempo real
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';
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

// Estados de entregas con configuración
const ESTADOS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200', icon: Clock },
  EN_RUTA: { label: 'En Ruta', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200', icon: Truck },
  ENTREGADO: { label: 'Entregado', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', icon: CheckCircle },
  RECHAZADO: { label: 'Rechazado', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200', icon: Ban },
  REPROGRAMADO: { label: 'Reprogramado', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-200', icon: Calendar },
};

const ControlTower = () => {
  const [conductores, setConductores] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [searchText, setSearchText] = useState('');
  const [expandedEntrega, setExpandedEntrega] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enRuta: 0,
    entregadas: 0,
    rechazadas: 0,
    reprogramadas: 0,
    conductoresActivos: 0,
    porcentajeExito: 0
  });

  // Cargar datos
  const fetchData = useCallback(async () => {
    try {
      // Cargar conductores
      const { data: conductoresData } = await supabase
        .from('tms_conductores')
        .select('*')
        .order('nombre');
      setConductores(conductoresData || []);

      // Cargar todas las entregas (no solo de hoy, para ver el historial)
      const { data: entregasData } = await supabase
        .from('tms_entregas')
        .select('*')
        .order('updated_at', { ascending: false });
      setEntregas(entregasData || []);

      // Calcular estadísticas
      const all = entregasData || [];
      const entregadas = all.filter(e => e.estado === 'ENTREGADO').length;
      const rechazadas = all.filter(e => e.estado === 'RECHAZADO').length;
      const totalFinalizadas = entregadas + rechazadas;
      
      setStats({
        total: all.length,
        pendientes: all.filter(e => e.estado === 'PENDIENTE').length,
        enRuta: all.filter(e => e.estado === 'EN_RUTA').length,
        entregadas: entregadas,
        rechazadas: rechazadas,
        reprogramadas: all.filter(e => e.estado === 'REPROGRAMADO').length,
        conductoresActivos: (conductoresData || []).filter(c => c.estado === 'EN_RUTA').length,
        porcentajeExito: totalFinalizadas > 0 ? Math.round((entregadas / totalFinalizadas) * 100) : 0
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suscripción Realtime
  useEffect(() => {
    fetchData();

    // Canal para conductores
    const conductoresChannel = supabase
      .channel('tower_conductores_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_conductores' }, () => {
        console.log('🔄 Conductor actualizado');
        fetchData();
      })
      .subscribe();

    // Canal para entregas
    const entregasChannel = supabase
      .channel('tower_entregas_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_entregas' }, (payload) => {
        console.log('📦 Entrega actualizada:', payload.eventType, payload.new?.estado);
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conductoresChannel);
      supabase.removeChannel(entregasChannel);
    };
  }, [fetchData]);

  // Filtrar entregas
  const entregasFiltradas = entregas.filter(e => {
    const matchEstado = filterEstado === 'TODOS' || e.estado === filterEstado;
    const matchSearch = !searchText || 
      e.cliente?.toLowerCase().includes(searchText.toLowerCase()) ||
      e.nv?.toLowerCase().includes(searchText.toLowerCase()) ||
      e.direccion?.toLowerCase().includes(searchText.toLowerCase());
    const matchConductor = !selectedConductor || e.conductor_id === selectedConductor;
    return matchEstado && matchSearch && matchConductor;
  });

  // Agrupar entregas por conductor
  const entregasPorConductor = (conductorId) => {
    return entregas.filter(e => e.conductor_id === conductorId);
  };

  // Componente Badge de Estado
  const EstadoBadge = ({ estado, size = 'sm' }) => {
    const config = ESTADOS_CONFIG[estado] || { label: estado, bgColor: 'bg-slate-100', textColor: 'text-slate-600', borderColor: 'border-slate-200', icon: Package };
    const Icon = config.icon;
    const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm gap-2' : 'px-2 py-0.5 text-[10px] gap-1';
    
    return (
      <span className={`inline-flex items-center rounded-full font-medium border ${sizeClasses} ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        <Icon size={size === 'lg' ? 14 : 10} />
        {config.label}
      </span>
    );
  };

  // Componente KPI Card
  const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className={`bg-white rounded-xl p-4 border-2 border-${color}-100 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-${color}-600 text-xs font-semibold uppercase tracking-wider`}>{title}</span>
        <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <Icon size={16} className={`text-${color}-600`} />
        </div>
      </div>
      <p className={`text-3xl font-bold text-${color}-700`}>{value}</p>
      {subtitle && <p className={`text-xs text-${color}-500 mt-1`}>{subtitle}</p>}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Radio className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Torre de Control</h2>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-medium"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        <KPICard 
          title="Total" 
          value={stats.total} 
          icon={Package} 
          color="slate"
        />
        <KPICard 
          title="Pendientes" 
          value={stats.pendientes} 
          icon={Clock} 
          color="amber"
        />
        <KPICard 
          title="En Ruta" 
          value={stats.enRuta} 
          icon={Truck} 
          color="blue"
        />
        <KPICard 
          title="Entregadas" 
          value={stats.entregadas}
          subtitle={`${stats.porcentajeExito}% éxito`}
          icon={CheckCircle} 
          color="emerald"
        />
        <KPICard 
          title="Rechazadas" 
          value={stats.rechazadas} 
          icon={Ban} 
          color="red"
        />
        <KPICard 
          title="Reprogramadas" 
          value={stats.reprogramadas} 
          icon={Calendar} 
          color="purple"
        />
        <KPICard 
          title="Conductores" 
          value={stats.conductoresActivos}
          subtitle={`de ${conductores.length} activos`}
          icon={Activity} 
          color="indigo"
        />
      </div>

      {/* Main Content */}
      <div className="flex gap-6 flex-1 overflow-hidden">
        
        {/* Panel Izquierdo: Conductores */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              Conductores
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Opción Todos */}
            <button
              onClick={() => setSelectedConductor(null)}
              className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                !selectedConductor
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'bg-white border-slate-100 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Radio size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Todos</p>
                  <p className="text-xs text-slate-400">{entregas.length} entregas</p>
                </div>
              </div>
            </button>

            {conductores.map((conductor) => {
              const entregasC = entregasPorConductor(conductor.id);
              const completadas = entregasC.filter(e => e.estado === 'ENTREGADO').length;
              const activas = entregasC.filter(e => ['PENDIENTE', 'EN_RUTA'].includes(e.estado)).length;
              
              return (
                <button
                  key={conductor.id}
                  onClick={() => setSelectedConductor(conductor.id)}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    selectedConductor === conductor.id
                      ? 'bg-indigo-50 border-indigo-300'
                      : 'bg-white border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {conductor.nombre?.charAt(0)}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        conductor.estado === 'EN_RUTA' ? 'bg-green-500' :
                        conductor.estado === 'DISPONIBLE' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {conductor.nombre} {conductor.apellido}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          conductor.estado === 'EN_RUTA' ? 'bg-green-100 text-green-700' :
                          conductor.estado === 'DISPONIBLE' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {conductor.estado}
                        </span>
                        <span className="text-[10px] text-slate-400">{conductor.vehiculo_patente}</span>
                      </div>
                    </div>
                    {entregasC.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">{completadas}/{entregasC.length}</p>
                        {activas > 0 && (
                          <p className="text-[10px] text-blue-600 font-medium">{activas} activas</p>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Central: Feed de Entregas */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* Header con filtros */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Package size={18} className="text-indigo-600" />
                Entregas en Tiempo Real
              </h3>
              <span className="text-xs text-slate-400">{entregasFiltradas.length} resultados</span>
            </div>
            
            <div className="flex gap-3">
              {/* Búsqueda */}
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3 py-2">
                <Search size={16} className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, NV, dirección..."
                  className="flex-1 outline-none text-sm bg-transparent"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              
              {/* Filtro de estado */}
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none font-medium text-slate-600"
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

          {/* Lista de entregas */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="animate-spin text-indigo-400" size={32} />
              </div>
            ) : entregasFiltradas.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Package size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No hay entregas</p>
                <p className="text-sm">Ajusta los filtros para ver resultados</p>
              </div>
            ) : (
              entregasFiltradas.map((entrega) => {
                const conductor = conductores.find(c => c.id === entrega.conductor_id);
                const isExpanded = expandedEntrega === entrega.id;
                
                return (
                  <div
                    key={entrega.id}
                    className={`rounded-xl border-2 transition-all ${
                      isExpanded ? 'border-indigo-200 shadow-md' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {/* Fila principal */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedEntrega(isExpanded ? null : entrega.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono de estado */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          ESTADOS_CONFIG[entrega.estado]?.bgColor || 'bg-slate-100'
                        }`}>
                          {React.createElement(ESTADOS_CONFIG[entrega.estado]?.icon || Package, {
                            size: 18,
                            className: ESTADOS_CONFIG[entrega.estado]?.textColor || 'text-slate-600'
                          })}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                {entrega.nv}
                              </span>
                              <EstadoBadge estado={entrega.estado} />
                            </div>
                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </div>
                          
                          <p className="font-medium text-slate-800 truncate">{entrega.cliente}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            <MapPin size={10} className="inline mr-1" />
                            {entrega.direccion}, {entrega.comuna}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                            <span>{entrega.bultos || 0} bultos</span>
                            <span>{entrega.peso_kg || 0} kg</span>
                            {conductor && (
                              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                <User size={10} /> {conductor.nombre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Detalles expandidos */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-100 mt-2 pt-3">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Factura</p>
                            <p className="font-medium text-slate-700">{entrega.facturas || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Guía</p>
                            <p className="font-medium text-slate-700">{entrega.guia || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Teléfono</p>
                            <p className="font-medium text-slate-700">{entrega.telefono || '-'}</p>
                          </div>
                        </div>
                        
                        {entrega.observaciones && (
                          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <p className="text-xs font-medium text-amber-700 mb-1">Observaciones:</p>
                            <p className="text-sm text-amber-800 whitespace-pre-line">{entrega.observaciones}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-3">
                          {entrega.telefono && (
                            <a 
                              href={`tel:${entrega.telefono}`}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                              <Phone size={12} /> Llamar
                            </a>
                          )}
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entrega.direccion + ', ' + entrega.comuna)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                          >
                            <ExternalLink size={12} /> Ver mapa
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
        <div className="w-80 flex flex-col gap-4">
          
          {/* Alertas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Alertas
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {stats.rechazadas > 0 && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Ban size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Entregas Rechazadas</p>
                      <p className="text-xs text-red-600">{stats.rechazadas} requieren revisión</p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.reprogramadas > 0 && (
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">Reprogramadas</p>
                      <p className="text-xs text-purple-600">{stats.reprogramadas} para reagendar</p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.pendientes > 10 && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Alto Volumen</p>
                      <p className="text-xs text-amber-600">{stats.pendientes} pendientes</p>
                    </div>
                  </div>
                </div>
              )}

              {stats.rechazadas === 0 && stats.reprogramadas === 0 && stats.pendientes <= 10 && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Todo en orden</p>
                      <p className="text-xs text-emerald-600">Sin alertas activas</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" />
                Actividad Reciente
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {entregas
                .filter(e => e.estado !== 'PENDIENTE')
                .slice(0, 10)
                .map((entrega) => {
                  const conductor = conductores.find(c => c.id === entrega.conductor_id);
                  const config = ESTADOS_CONFIG[entrega.estado];
                  
                  return (
                    <div key={entrega.id} className={`p-2 border-l-4 ${config?.borderColor || 'border-slate-200'} bg-slate-50 rounded-r-lg`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-slate-500">{entrega.nv}</span>
                        <EstadoBadge estado={entrega.estado} />
                      </div>
                      <p className="text-xs font-medium text-slate-700 truncate">{entrega.cliente}</p>
                      <p className="text-[10px] text-slate-400">
                        {conductor?.nombre || 'Sin asignar'} • {new Date(entrega.updated_at || entrega.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })}
              
              {entregas.filter(e => e.estado !== 'PENDIENTE').length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">Sin actividad reciente</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlTower;
