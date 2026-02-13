// MobileApp.jsx - App Móvil OPERACIONAL para Conductores
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';
import { 
  Truck, 
  MapPin, 
  CheckCircle, 
  Navigation, 
  Phone, 
  Package, 
  Camera,
  XCircle,
  Clock,
  Menu,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Map,
  AlertCircle,
  RefreshCw,
  User,
  List,
  History,
  Settings,
  X,
  Calendar,
  FileText,
  Hash,
  Box,
  Scale,
  MessageSquare,
  Send,
  RotateCcw,
  Ban,
  Play,
  Filter
} from 'lucide-react';

// Estados disponibles para entregas
const ESTADOS_ENTREGA = {
  PENDIENTE: { label: 'Pendiente', color: 'amber', icon: Clock },
  EN_RUTA: { label: 'En Ruta', color: 'blue', icon: Truck },
  ENTREGADO: { label: 'Entregado', color: 'emerald', icon: CheckCircle },
  RECHAZADO: { label: 'Rechazado', color: 'red', icon: XCircle },
  REPROGRAMADO: { label: 'Reprogramado', color: 'purple', icon: Calendar },
};

// Motivos de rechazo
const MOTIVOS_RECHAZO = [
  'Cliente no se encontraba',
  'Dirección incorrecta',
  'Cliente rechazó el pedido',
  'Producto dañado',
  'Fuera de horario',
  'Zona de difícil acceso',
  'Otro motivo'
];

// Motivos de reprogramación
const MOTIVOS_REPROGRAMACION = [
  'Cliente solicitó otro día',
  'Local cerrado',
  'No había quien recibiera',
  'Problema con documentación',
  'Reagendar por capacidad',
  'Otro motivo'
];

const MobileApp = () => {
  // Estados principales
  const [conductorId, setConductorId] = useState(null);
  const [conductorData, setConductorData] = useState(null);
  const [conductores, setConductores] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Navegación
  const [view, setView] = useState('login'); // login, entregas, historial, perfil, detalle, cambiar-estado
  const [showMenu, setShowMenu] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [filterEstado, setFilterEstado] = useState('TODOS');
  
  // Modal cambio de estado
  const [nuevoEstado, setNuevoEstado] = useState(null);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState('');
  const [observacion, setObservacion] = useState('');

  // Cargar conductores al inicio
  useEffect(() => {
    fetchConductores();
  }, []);

  // Suscripción Realtime
  useEffect(() => {
    if (!conductorId) return;

    const channel = supabase
      .channel('mobile_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tms_entregas', filter: `conductor_id=eq.${conductorId}` },
        (payload) => {
          console.log('📱 Realtime:', payload.eventType);
          fetchEntregasConductor(conductorId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conductorId]);

  // Fetch conductores
  const fetchConductores = async () => {
    const { data } = await supabase
      .from('tms_conductores')
      .select('*')
      .neq('estado', 'INACTIVO')
      .order('nombre');
    setConductores(data || []);
  };

  // Fetch entregas del conductor
  const fetchEntregasConductor = useCallback(async (id) => {
    setRefreshing(true);
    const { data } = await supabase
      .from('tms_entregas')
      .select('*')
      .eq('conductor_id', id)
      .order('created_at', { ascending: false });
    setEntregas(data || []);
    setRefreshing(false);
  }, []);

  // Login conductor
  const handleLogin = async (conductor) => {
    setLoading(true);
    setConductorId(conductor.id);
    setConductorData(conductor);
    
    // Actualizar estado del conductor a EN_RUTA si estaba DISPONIBLE
    if (conductor.estado === 'DISPONIBLE') {
      await supabase
        .from('tms_conductores')
        .update({ estado: 'EN_RUTA', updated_at: new Date().toISOString() })
        .eq('id', conductor.id);
    }

    await fetchEntregasConductor(conductor.id);
    setLoading(false);
    setView('entregas');
  };

  // Logout
  const handleLogout = async () => {
    // Cambiar estado del conductor a DISPONIBLE
    if (conductorId) {
      await supabase
        .from('tms_conductores')
        .update({ estado: 'DISPONIBLE', updated_at: new Date().toISOString() })
        .eq('id', conductorId);
    }
    
    setConductorId(null);
    setConductorData(null);
    setEntregas([]);
    setView('login');
    setShowMenu(false);
  };

  // Iniciar entrega (cambiar a EN_RUTA)
  const iniciarEntrega = async (entrega) => {
    setLoading(true);
    await supabase
      .from('tms_entregas')
      .update({ 
        estado: 'EN_RUTA',
        fecha_asignacion: new Date().toISOString()
      })
      .eq('id', entrega.id);
    
    await fetchEntregasConductor(conductorId);
    setLoading(false);
  };

  // Abrir modal para cambiar estado
  const abrirCambioEstado = (estado) => {
    setNuevoEstado(estado);
    setMotivoSeleccionado('');
    setObservacion('');
    setView('cambiar-estado');
  };

  // Confirmar cambio de estado
  const confirmarCambioEstado = async () => {
    if (!selectedEntrega || !nuevoEstado) return;
    
    // Validar motivo para rechazos y reprogramaciones
    if ((nuevoEstado === 'RECHAZADO' || nuevoEstado === 'REPROGRAMADO') && !motivoSeleccionado) {
      alert('Por favor selecciona un motivo');
      return;
    }

    setLoading(true);

    const updateData = {
      estado: nuevoEstado,
      updated_at: new Date().toISOString()
    };

    // Agregar campos según el estado
    if (nuevoEstado === 'ENTREGADO') {
      updateData.fecha_entrega_real = new Date().toISOString();
    }

    // Guardar observaciones
    const obsText = motivoSeleccionado 
      ? `[${nuevoEstado}] ${motivoSeleccionado}${observacion ? ': ' + observacion : ''}`
      : observacion;
    
    if (obsText) {
      updateData.observaciones = selectedEntrega.observaciones 
        ? `${selectedEntrega.observaciones}\n${new Date().toLocaleString()}: ${obsText}`
        : `${new Date().toLocaleString()}: ${obsText}`;
    }

    await supabase
      .from('tms_entregas')
      .update(updateData)
      .eq('id', selectedEntrega.id);

    await fetchEntregasConductor(conductorId);
    setLoading(false);
    setSelectedEntrega(null);
    setNuevoEstado(null);
    setView('entregas');
  };

  // Filtrar entregas
  const entregasFiltradas = entregas.filter(e => 
    filterEstado === 'TODOS' || e.estado === filterEstado
  );

  // Entregas activas (pendientes + en ruta)
  const entregasActivas = entregas.filter(e => 
    e.estado === 'PENDIENTE' || e.estado === 'EN_RUTA'
  );

  // Stats
  const stats = {
    pendientes: entregas.filter(e => e.estado === 'PENDIENTE').length,
    enRuta: entregas.filter(e => e.estado === 'EN_RUTA').length,
    entregadas: entregas.filter(e => e.estado === 'ENTREGADO').length,
    rechazadas: entregas.filter(e => e.estado === 'RECHAZADO').length,
    reprogramadas: entregas.filter(e => e.estado === 'REPROGRAMADO').length,
  };

  // Render estado badge
  const EstadoBadge = ({ estado, size = 'sm' }) => {
    const config = ESTADOS_ENTREGA[estado] || { label: estado, color: 'slate', icon: Package };
    const Icon = config.icon;
    const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-[10px]';
    
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} bg-${config.color}-100 text-${config.color}-700 border border-${config.color}-200`}>
        <Icon size={size === 'lg' ? 14 : 10} />
        {config.label}
      </span>
    );
  };

  // ==================== VISTAS ====================

  // VISTA: LOGIN
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30 rotate-3">
              <Truck size={48} className="text-white -rotate-3" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">TMS Driver</h1>
            <p className="text-indigo-300">Sistema de Gestión de Entregas</p>
          </div>

          <div className="space-y-3">
            {conductores.length === 0 ? (
              <div className="text-center py-12 text-indigo-300">
                <RefreshCw className="animate-spin mx-auto mb-3" size={32} />
                <p>Cargando conductores...</p>
              </div>
            ) : (
              conductores.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleLogin(c)}
                  disabled={loading}
                  className="w-full bg-white/5 backdrop-blur-sm hover:bg-white/10 p-4 rounded-2xl flex items-center justify-between transition-all border border-white/10 hover:border-indigo-500/50 group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg">
                      {c.nombre?.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white text-lg">{c.nombre} {c.apellido}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-indigo-300">{c.vehiculo_patente || 'Sin vehículo'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.estado === 'EN_RUTA' ? 'bg-green-500/20 text-green-400' :
                          c.estado === 'DISPONIBLE' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {c.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-indigo-400 group-hover:text-white transition-colors" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT PRINCIPAL DE LA APP
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-indigo-200 text-xs">Conductor</p>
              <h1 className="font-bold text-xl">{conductorData?.nombre} {conductorData?.apellido}</h1>
            </div>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Stats rápidas */}
          {view === 'entregas' && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              <div className="flex-shrink-0 bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center min-w-[80px]">
                <p className="text-2xl font-bold">{stats.pendientes}</p>
                <p className="text-[10px] text-indigo-200">Pendientes</p>
              </div>
              <div className="flex-shrink-0 bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-blue-300">{stats.enRuta}</p>
                <p className="text-[10px] text-indigo-200">En Ruta</p>
              </div>
              <div className="flex-shrink-0 bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-green-300">{stats.entregadas}</p>
                <p className="text-[10px] text-indigo-200">Entregadas</p>
              </div>
              <div className="flex-shrink-0 bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-red-300">{stats.rechazadas}</p>
                <p className="text-[10px] text-indigo-200">Rechazadas</p>
              </div>
              <div className="flex-shrink-0 bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-purple-300">{stats.reprogramadas}</p>
                <p className="text-[10px] text-indigo-200">Reprogramadas</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Menú lateral */}
      {showMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowMenu(false)} />
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 animate-slide-in">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg">
                  {conductorData?.nombre?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{conductorData?.nombre}</p>
                  <p className="text-xs text-slate-400">{conductorData?.vehiculo_patente}</p>
                </div>
              </div>
            </div>
            
            <nav className="p-4 space-y-1">
              <button 
                onClick={() => { setView('entregas'); setShowMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'entregas' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <List size={20} />
                <span className="font-medium">Mis Entregas</span>
                {entregasActivas.length > 0 && (
                  <span className="ml-auto bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {entregasActivas.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => { setView('historial'); setShowMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'historial' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <History size={20} />
                <span className="font-medium">Historial</span>
              </button>
              
              <button 
                onClick={() => { setView('perfil'); setShowMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'perfil' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <User size={20} />
                <span className="font-medium">Mi Perfil</span>
              </button>
              
              <hr className="my-4" />
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Contenido principal */}
      <main className="pb-20">
        {loading && (
          <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <RefreshCw className="animate-spin mx-auto text-indigo-600 mb-3" size={40} />
              <p className="text-slate-600">Procesando...</p>
            </div>
          </div>
        )}

        {/* VISTA: MIS ENTREGAS */}
        {view === 'entregas' && (
          <div className="p-4 space-y-4">
            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['TODOS', 'PENDIENTE', 'EN_RUTA', 'ENTREGADO', 'RECHAZADO', 'REPROGRAMADO'].map(estado => (
                <button
                  key={estado}
                  onClick={() => setFilterEstado(estado)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterEstado === estado 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {estado === 'TODOS' ? 'Todas' : ESTADOS_ENTREGA[estado]?.label || estado}
                </button>
              ))}
            </div>

            {/* Pull to refresh */}
            <button 
              onClick={() => fetchEntregasConductor(conductorId)}
              disabled={refreshing}
              className="w-full py-2 text-sm text-indigo-600 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Actualizando...' : 'Actualizar entregas'}
            </button>

            {/* Lista de entregas */}
            {entregasFiltradas.length === 0 ? (
              <div className="text-center py-16">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-semibold text-slate-700">Sin entregas</h3>
                <p className="text-sm text-slate-400">No hay entregas {filterEstado !== 'TODOS' ? 'con este estado' : 'asignadas'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entregasFiltradas.map((entrega) => (
                  <div
                    key={entrega.id}
                    onClick={() => { setSelectedEntrega(entrega); setView('detalle'); }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            NV: {entrega.nv}
                          </span>
                          <EstadoBadge estado={entrega.estado} />
                        </div>
                        <h3 className="font-semibold text-slate-800">{entrega.cliente}</h3>
                      </div>
                      <ChevronRight size={20} className="text-slate-400" />
                    </div>
                    
                    <p className="text-sm text-slate-500 flex items-start gap-1 mb-2">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{entrega.direccion}, {entrega.comuna}</span>
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Box size={12} /> {entrega.bultos || 0} bultos
                      </span>
                      <span className="flex items-center gap-1">
                        <Scale size={12} /> {entrega.peso_kg || 0} kg
                      </span>
                    </div>

                    {/* Botón rápido para iniciar */}
                    {entrega.estado === 'PENDIENTE' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); iniciarEntrega(entrega); }}
                        className="mt-3 w-full py-2 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Play size={16} /> Iniciar Entrega
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA: DETALLE DE ENTREGA */}
        {view === 'detalle' && selectedEntrega && (
          <div className="p-4 space-y-4">
            {/* Header */}
            <button 
              onClick={() => setView('entregas')}
              className="flex items-center gap-1 text-indigo-600 font-medium"
            >
              <ChevronLeft size={20} /> Volver
            </button>

            {/* Info NV */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-slate-400">Nota de Venta</p>
                  <p className="text-2xl font-bold font-mono text-slate-800">{selectedEntrega.nv}</p>
                </div>
                <EstadoBadge estado={selectedEntrega.estado} size="lg" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente</span>
                  <span className="font-medium text-slate-800">{selectedEntrega.cliente}</span>
                </div>
                {selectedEntrega.facturas && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Factura</span>
                    <span className="font-medium text-slate-800">{selectedEntrega.facturas}</span>
                  </div>
                )}
                {selectedEntrega.guia && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guía</span>
                    <span className="font-medium text-slate-800">{selectedEntrega.guia}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <MapPin size={16} /> Dirección de Entrega
              </h3>
              <p className="text-slate-800 mb-1">{selectedEntrega.direccion}</p>
              <p className="text-sm text-slate-500">{selectedEntrega.comuna}, {selectedEntrega.region}</p>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <a 
                  href={`tel:${selectedEntrega.telefono}`}
                  className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm"
                >
                  <Phone size={18} /> Llamar
                </a>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEntrega.direccion + ', ' + selectedEntrega.comuna)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium text-sm"
                >
                  <Navigation size={18} /> Navegar
                </a>
              </div>
            </div>

            {/* Detalle del pedido */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Package size={16} /> Detalle del Pedido
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{selectedEntrega.bultos || 0}</p>
                  <p className="text-xs text-slate-500">Bultos</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{selectedEntrega.peso_kg || 0}</p>
                  <p className="text-xs text-slate-500">Kg</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{selectedEntrega.volumen_m3 || 0}</p>
                  <p className="text-xs text-slate-500">m³</p>
                </div>
              </div>
              
              {selectedEntrega.observaciones && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-medium text-amber-700 mb-1">Observaciones:</p>
                  <p className="text-sm text-amber-800 whitespace-pre-line">{selectedEntrega.observaciones}</p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            {(selectedEntrega.estado === 'PENDIENTE' || selectedEntrega.estado === 'EN_RUTA') && (
              <div className="space-y-3 pt-2">
                {selectedEntrega.estado === 'PENDIENTE' && (
                  <button
                    onClick={() => iniciarEntrega(selectedEntrega)}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play size={24} /> Iniciar Entrega
                  </button>
                )}
                
                {selectedEntrega.estado === 'EN_RUTA' && (
                  <>
                    <button
                      onClick={() => abrirCambioEstado('ENTREGADO')}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={24} /> Confirmar Entrega
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => abrirCambioEstado('RECHAZADO')}
                        className="py-3 bg-white text-red-600 border-2 border-red-200 rounded-2xl font-semibold flex items-center justify-center gap-2"
                      >
                        <Ban size={18} /> Rechazar
                      </button>
                      <button
                        onClick={() => abrirCambioEstado('REPROGRAMADO')}
                        className="py-3 bg-white text-purple-600 border-2 border-purple-200 rounded-2xl font-semibold flex items-center justify-center gap-2"
                      >
                        <Calendar size={18} /> Reprogramar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Estado completado */}
            {selectedEntrega.estado === 'ENTREGADO' && (
              <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100">
                <CheckCircle size={48} className="mx-auto text-emerald-600 mb-3" />
                <h3 className="font-bold text-emerald-800 text-xl">¡Entregado!</h3>
                {selectedEntrega.fecha_entrega_real && (
                  <p className="text-sm text-emerald-600 mt-1">
                    {new Date(selectedEntrega.fecha_entrega_real).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {selectedEntrega.estado === 'RECHAZADO' && (
              <div className="bg-red-50 p-6 rounded-2xl text-center border border-red-100">
                <XCircle size={48} className="mx-auto text-red-600 mb-3" />
                <h3 className="font-bold text-red-800 text-xl">Rechazado</h3>
              </div>
            )}

            {selectedEntrega.estado === 'REPROGRAMADO' && (
              <div className="bg-purple-50 p-6 rounded-2xl text-center border border-purple-100">
                <Calendar size={48} className="mx-auto text-purple-600 mb-3" />
                <h3 className="font-bold text-purple-800 text-xl">Reprogramado</h3>
              </div>
            )}
          </div>
        )}

        {/* VISTA: CAMBIAR ESTADO */}
        {view === 'cambiar-estado' && selectedEntrega && (
          <div className="p-4 space-y-4">
            <button 
              onClick={() => setView('detalle')}
              className="flex items-center gap-1 text-indigo-600 font-medium"
            >
              <ChevronLeft size={20} /> Cancelar
            </button>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-1">
                {nuevoEstado === 'ENTREGADO' && 'Confirmar Entrega'}
                {nuevoEstado === 'RECHAZADO' && 'Reportar Rechazo'}
                {nuevoEstado === 'REPROGRAMADO' && 'Reprogramar Entrega'}
              </h2>
              <p className="text-sm text-slate-500">NV: {selectedEntrega.nv} - {selectedEntrega.cliente}</p>
            </div>

            {/* Motivos para rechazo */}
            {nuevoEstado === 'RECHAZADO' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Motivo del rechazo *</h3>
                <div className="space-y-2">
                  {MOTIVOS_RECHAZO.map(motivo => (
                    <button
                      key={motivo}
                      onClick={() => setMotivoSeleccionado(motivo)}
                      className={`w-full p-3 rounded-xl text-left text-sm transition-colors ${
                        motivoSeleccionado === motivo
                          ? 'bg-red-50 border-2 border-red-300 text-red-700'
                          : 'bg-slate-50 border border-slate-200 text-slate-600'
                      }`}
                    >
                      {motivo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Motivos para reprogramación */}
            {nuevoEstado === 'REPROGRAMADO' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Motivo de reprogramación *</h3>
                <div className="space-y-2">
                  {MOTIVOS_REPROGRAMACION.map(motivo => (
                    <button
                      key={motivo}
                      onClick={() => setMotivoSeleccionado(motivo)}
                      className={`w-full p-3 rounded-xl text-left text-sm transition-colors ${
                        motivoSeleccionado === motivo
                          ? 'bg-purple-50 border-2 border-purple-300 text-purple-700'
                          : 'bg-slate-50 border border-slate-200 text-slate-600'
                      }`}
                    >
                      {motivo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Observaciones adicionales */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Observaciones {nuevoEstado === 'ENTREGADO' ? '(opcional)' : 'adicionales'}
              </h3>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Escribe alguna observación..."
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Botón confirmar */}
            <button
              onClick={confirmarCambioEstado}
              disabled={(nuevoEstado !== 'ENTREGADO' && !motivoSeleccionado)}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                nuevoEstado === 'ENTREGADO' ? 'bg-emerald-600 text-white' :
                nuevoEstado === 'RECHAZADO' ? 'bg-red-600 text-white' :
                'bg-purple-600 text-white'
              }`}
            >
              <Send size={20} />
              {nuevoEstado === 'ENTREGADO' && 'Confirmar Entrega'}
              {nuevoEstado === 'RECHAZADO' && 'Confirmar Rechazo'}
              {nuevoEstado === 'REPROGRAMADO' && 'Confirmar Reprogramación'}
            </button>
          </div>
        )}

        {/* VISTA: HISTORIAL */}
        {view === 'historial' && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Historial de Entregas</h2>
            
            {entregas.filter(e => ['ENTREGADO', 'RECHAZADO', 'REPROGRAMADO'].includes(e.estado)).length === 0 ? (
              <div className="text-center py-16">
                <History size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Sin historial todavía</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entregas
                  .filter(e => ['ENTREGADO', 'RECHAZADO', 'REPROGRAMADO'].includes(e.estado))
                  .map(entrega => (
                    <div key={entrega.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-mono text-xs text-slate-500">NV: {entrega.nv}</span>
                          <p className="font-medium text-slate-800">{entrega.cliente}</p>
                        </div>
                        <EstadoBadge estado={entrega.estado} />
                      </div>
                      {entrega.fecha_entrega_real && (
                        <p className="text-xs text-slate-400">
                          {new Date(entrega.fecha_entrega_real).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA: PERFIL */}
        {view === 'perfil' && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-indigo-600">
                {conductorData?.nombre?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-800">{conductorData?.nombre} {conductorData?.apellido}</h2>
              <p className="text-slate-500">{conductorData?.rut}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Teléfono</span>
                <span className="font-medium text-slate-800">{conductorData?.telefono || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Vehículo</span>
                <span className="font-medium text-slate-800">{conductorData?.vehiculo_patente || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Estado</span>
                <span className={`font-medium ${
                  conductorData?.estado === 'EN_RUTA' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {conductorData?.estado}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3">Resumen del Día</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{stats.entregadas}</p>
                  <p className="text-xs text-emerald-700">Entregadas</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.rechazadas}</p>
                  <p className="text-xs text-red-700">Rechazadas</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around z-30">
        <button 
          onClick={() => setView('entregas')}
          className={`flex flex-col items-center gap-1 ${view === 'entregas' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <List size={24} />
          <span className="text-[10px] font-semibold">Entregas</span>
        </button>
        <button 
          onClick={() => setView('historial')}
          className={`flex flex-col items-center gap-1 ${view === 'historial' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <History size={24} />
          <span className="text-[10px] font-semibold">Historial</span>
        </button>
        <button 
          onClick={() => setView('perfil')}
          className={`flex flex-col items-center gap-1 ${view === 'perfil' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-semibold">Perfil</span>
        </button>
      </nav>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MobileApp;
