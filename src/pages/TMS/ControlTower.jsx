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
  Filter,
  Search,
  Phone,
  Navigation,
  User,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';

const ControlTower = () => {
  const [conductores, setConductores] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [searchText, setSearchText] = useState('');

  // Estadísticas
  const [stats, setStats] = useState({
    totalEntregas: 0,
    entregadas: 0,
    pendientes: 0,
    enRuta: 0,
    fallidas: 0,
    conductoresActivos: 0
  });

  // Cargar datos iniciales
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar conductores
      const { data: conductoresData } = await supabase
        .from('tms_conductores')
        .select('*')
        .order('nombre');
      setConductores(conductoresData || []);

      // Cargar rutas activas
      const { data: rutasData } = await supabase
        .from('tms_rutas')
        .select('*')
        .in('estado', ['PLANIFICADA', 'EN_CURSO'])
        .order('created_at', { ascending: false });
      setRutas(rutasData || []);

      // Cargar entregas de hoy
      const today = new Date().toISOString().split('T')[0];
      const { data: entregasData } = await supabase
        .from('tms_entregas')
        .select('*')
        .gte('fecha_creacion', today)
        .order('fecha_creacion', { ascending: false });
      setEntregas(entregasData || []);

      // Calcular estadísticas
      const allEntregas = entregasData || [];
      setStats({
        totalEntregas: allEntregas.length,
        entregadas: allEntregas.filter(e => e.estado === 'ENTREGADO').length,
        pendientes: allEntregas.filter(e => e.estado === 'PENDIENTE').length,
        enRuta: allEntregas.filter(e => e.estado === 'EN_RUTA').length,
        fallidas: allEntregas.filter(e => e.estado === 'FALLIDO').length,
        conductoresActivos: (conductoresData || []).filter(c => c.estado === 'EN_RUTA').length
      });

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suscripción Realtime
  useEffect(() => {
    fetchData();

    // Escuchar cambios en conductores
    const conductoresChannel = supabase
      .channel('tower_conductores')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_conductores' }, () => {
        fetchData();
      })
      .subscribe();

    // Escuchar cambios en entregas
    const entregasChannel = supabase
      .channel('tower_entregas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_entregas' }, () => {
        fetchData();
      })
      .subscribe();

    // Escuchar cambios en rutas
    const rutasChannel = supabase
      .channel('tower_rutas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_rutas' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conductoresChannel);
      supabase.removeChannel(entregasChannel);
      supabase.removeChannel(rutasChannel);
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

  // Colores de estado
  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'ENTREGADO': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'EN_RUTA': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PENDIENTE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'FALLIDO': return 'bg-red-100 text-red-700 border-red-200';
      case 'DISPONIBLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'OCUPADO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'INACTIVO': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'ENTREGADO': return <CheckCircle size={14} />;
      case 'EN_RUTA': return <Truck size={14} />;
      case 'PENDIENTE': return <Clock size={14} />;
      case 'FALLIDO': return <XCircle size={14} />;
      default: return <Package size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Radio className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Torre de Control</h2>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Monitoreo en tiempo real
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-medium">Total Entregas</span>
            <Package size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalEntregas}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-600 text-xs font-medium">Entregadas</span>
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.entregadas}</p>
          <p className="text-xs text-emerald-500">
            {stats.totalEntregas > 0 ? Math.round((stats.entregadas / stats.totalEntregas) * 100) : 0}% completado
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-600 text-xs font-medium">En Ruta</span>
            <Truck size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.enRuta}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-600 text-xs font-medium">Pendientes</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.pendientes}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-600 text-xs font-medium">Fallidas</span>
            <XCircle size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.fallidas}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-600 text-xs font-medium">Conductores Activos</span>
            <Activity size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{stats.conductoresActivos}</p>
          <p className="text-xs text-indigo-500">de {conductores.length} total</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 flex-1 overflow-hidden">
        
        {/* Panel Izquierdo: Conductores */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <User size={18} />
              Conductores ({conductores.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Opción Todos */}
            <div
              onClick={() => setSelectedConductor(null)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                !selectedConductor
                  ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300'
                  : 'bg-white border-slate-100 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Radio size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Todos los conductores</p>
                  <p className="text-xs text-slate-400">{entregas.length} entregas totales</p>
                </div>
              </div>
            </div>

            {conductores.map((conductor) => {
              const entregasConductor = entregas.filter(e => e.conductor_id === conductor.id);
              const completadas = entregasConductor.filter(e => e.estado === 'ENTREGADO').length;
              
              return (
                <div
                  key={conductor.id}
                  onClick={() => setSelectedConductor(conductor.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedConductor === conductor.id
                      ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300'
                      : 'bg-white border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {conductor.nombre?.charAt(0)}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        conductor.estado === 'EN_RUTA' ? 'bg-green-500' :
                        conductor.estado === 'DISPONIBLE' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`}></span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">
                        {conductor.nombre} {conductor.apellido}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${getEstadoStyle(conductor.estado)}`}>
                          {conductor.estado}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {conductor.vehiculo_patente}
                        </span>
                      </div>
                    </div>
                    {entregasConductor.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">{completadas}/{entregasConductor.length}</p>
                        <p className="text-[10px] text-slate-400">entregas</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Central: Mapa Simulado + Feed */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          
          {/* Mapa Simulado */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-64 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              {/* Grid de mapa simulado */}
              <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              
              {/* Marcadores de conductores */}
              {conductores.filter(c => c.estado === 'EN_RUTA').map((conductor, index) => (
                <div
                  key={conductor.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{
                    left: `${20 + (index * 25) % 60}%`,
                    top: `${30 + (index * 20) % 40}%`
                  }}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      <Truck size={16} />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-white px-1.5 py-0.5 rounded text-[10px] font-medium shadow whitespace-nowrap">
                      {conductor.nombre}
                    </div>
                  </div>
                </div>
              ))}

              {/* Centro del mapa */}
              <div className="z-10 text-center">
                <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg mb-2 mx-auto">
                  <MapPin size={32} className="text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-slate-600">Región Metropolitana</p>
                <p className="text-xs text-slate-400">{conductores.filter(c => c.estado === 'EN_RUTA').length} conductores activos</p>
              </div>
            </div>

            {/* Leyenda */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> En ruta
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Disponible
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span> Inactivo
                </span>
              </div>
            </div>
          </div>

          {/* Feed de Entregas */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {/* Header con filtros */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Package size={18} />
                  Feed de Entregas
                </h3>
                <div className="flex gap-2">
                  <div className="bg-white border rounded-lg flex items-center px-2 py-1">
                    <Search size={14} className="text-slate-400 mr-1" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="outline-none text-xs w-32"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="bg-white border rounded-lg px-2 py-1 text-xs outline-none"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="EN_RUTA">En Ruta</option>
                    <option value="ENTREGADO">Entregados</option>
                    <option value="FALLIDO">Fallidos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de entregas */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="animate-spin text-slate-400" size={24} />
                </div>
              ) : entregasFiltradas.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Package size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No hay entregas que mostrar</p>
                </div>
              ) : (
                entregasFiltradas.map((entrega) => {
                  const conductor = conductores.find(c => c.id === entrega.conductor_id);
                  
                  return (
                    <div
                      key={entrega.id}
                      className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-white transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          entrega.estado === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-600' :
                          entrega.estado === 'EN_RUTA' ? 'bg-blue-100 text-blue-600' :
                          entrega.estado === 'FALLIDO' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {getEstadoIcon(entrega.estado)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-slate-800 text-sm truncate">
                              {entrega.cliente}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex-shrink-0 ${getEstadoStyle(entrega.estado)}`}>
                              {entrega.estado}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{entrega.direccion}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">NV: {entrega.nv}</span>
                            <span>{entrega.bultos} bultos</span>
                            {conductor && (
                              <span className="flex items-center gap-1">
                                <User size={10} /> {conductor.nombre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Alertas y Actividad */}
        <div className="w-72 flex flex-col gap-4">
          
          {/* Alertas */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Alertas
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {stats.fallidas > 0 && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Entregas Fallidas</p>
                      <p className="text-xs text-red-600">{stats.fallidas} entregas requieren atención</p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.pendientes > 10 && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Alto Volumen</p>
                      <p className="text-xs text-amber-600">{stats.pendientes} entregas pendientes</p>
                    </div>
                  </div>
                </div>
              )}

              {conductores.filter(c => c.estado === 'INACTIVO').length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <User size={16} className="text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Conductores Inactivos</p>
                      <p className="text-xs text-slate-500">
                        {conductores.filter(c => c.estado === 'INACTIVO').length} sin asignar
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {stats.fallidas === 0 && stats.pendientes <= 10 && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" />
                Actividad Reciente
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {entregas
                .filter(e => e.estado === 'ENTREGADO')
                .slice(0, 5)
                .map((entrega) => {
                  const conductor = conductores.find(c => c.id === entrega.conductor_id);
                  return (
                    <div key={entrega.id} className="p-2 border-l-2 border-emerald-400 bg-slate-50 rounded-r-lg">
                      <p className="text-xs font-medium text-slate-700 truncate">{entrega.cliente}</p>
                      <p className="text-[10px] text-slate-400">
                        Entregado por {conductor?.nombre || 'Sin asignar'}
                      </p>
                    </div>
                  );
                })}
              
              {entregas.filter(e => e.estado === 'ENTREGADO').length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">Sin actividad reciente</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlTower;
