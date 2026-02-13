// MobileApp.jsx - Simulador de App Móvil para Conductores
import React, { useState, useEffect } from 'react';
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
  Smartphone
} from 'lucide-react';

const MobileApp = () => {
  const [conductorId, setConductorId] = useState(null);
  const [conductores, setConductores] = useState([]);
  const [rutaActiva, setRutaActiva] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [view, setView] = useState('login'); // login, list, detail
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchConductores();
  }, []);

  // Suscripción Realtime para entregas
  useEffect(() => {
    if (!rutaActiva) return;

    const channel = supabase
      .channel('mobile_entregas')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tms_entregas', filter: `ruta_id=eq.${rutaActiva.id}` },
        () => {
          fetchEntregasRuta(rutaActiva.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rutaActiva]);

  const fetchConductores = async () => {
    const { data } = await supabase
      .from('tms_conductores')
      .select('*')
      .in('estado', ['DISPONIBLE', 'EN_RUTA', 'OCUPADO'])
      .order('nombre');
    setConductores(data || []);
  };

  const handleLogin = async (id) => {
    setLoading(true);
    setConductorId(id);
    await fetchRutaActiva(id);
    setLoading(false);
  };

  const fetchRutaActiva = async (id) => {
    const { data: rutas } = await supabase
      .from('tms_rutas')
      .select('*')
      .eq('conductor_id', id)
      .in('estado', ['PLANIFICADA', 'EN_CURSO'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (rutas && rutas.length > 0) {
      const ruta = rutas[0];
      setRutaActiva(ruta);

      // Cambiar estado a EN_CURSO si estaba PLANIFICADA
      if (ruta.estado === 'PLANIFICADA') {
        await supabase
          .from('tms_rutas')
          .update({ estado: 'EN_CURSO', fecha_inicio: new Date().toISOString() })
          .eq('id', ruta.id);
        
        await supabase
          .from('tms_conductores')
          .update({ estado: 'EN_RUTA' })
          .eq('id', id);
      }

      await fetchEntregasRuta(ruta.id);
      setView('list');
    } else {
      setRutaActiva(null);
      setEntregas([]);
      setView('list');
    }
  };

  const fetchEntregasRuta = async (rutaId) => {
    const { data } = await supabase
      .from('tms_entregas')
      .select('*')
      .eq('ruta_id', rutaId)
      .order('created_at', { ascending: true });
    setEntregas(data || []);
  };

  const handleEntregaClick = (entrega) => {
    setSelectedEntrega(entrega);
    setView('detail');
  };

  const completarEntrega = async (estado) => {
    if (!selectedEntrega) return;
    setLoading(true);

    await supabase
      .from('tms_entregas')
      .update({
        estado: estado,
        fecha_entrega_real: new Date().toISOString()
      })
      .eq('id', selectedEntrega.id);

    await fetchEntregasRuta(rutaActiva.id);
    setLoading(false);
    setView('list');
    setSelectedEntrega(null);
  };

  const handleLogout = () => {
    setConductorId(null);
    setRutaActiva(null);
    setEntregas([]);
    setView('login');
    setShowMenu(false);
  };

  const conductorActual = conductores.find(c => c.id === conductorId);
  const entregasPendientes = entregas.filter(e => e.estado === 'PENDIENTE' || e.estado === 'EN_RUTA');
  const entregasCompletadas = entregas.filter(e => e.estado === 'ENTREGADO');
  const entregasFallidas = entregas.filter(e => e.estado === 'FALLIDO');

  // --- PANTALLA LOGIN ---
  if (view === 'login') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="w-full max-w-md">
          {/* Logo y Título */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <Truck size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">TMS Driver</h1>
            <p className="text-slate-400">Selecciona tu perfil para comenzar</p>
          </div>

          {/* Lista de Conductores */}
          <div className="space-y-3">
            {conductores.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                <p>Cargando conductores...</p>
              </div>
            ) : (
              conductores.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleLogin(c.id)}
                  disabled={loading}
                  className="w-full bg-slate-800/50 backdrop-blur hover:bg-slate-700/50 p-4 rounded-2xl flex items-center justify-between transition-all border border-slate-700/50 hover:border-indigo-500/50 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center font-bold text-white text-lg shadow-inner">
                      {c.nombre?.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{c.nombre} {c.apellido}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{c.vehiculo_patente || 'Sin vehículo'}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          c.estado === 'EN_RUTA' ? 'bg-green-500/20 text-green-400' :
                          c.estado === 'DISPONIBLE' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {c.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-xs mt-8">
            TMS CCO v1.0 • Desarrollado por tu equipo
          </p>
        </div>
      </div>
    );
  }

  // --- LAYOUT APP MÓVIL ---
  return (
    <div className="flex justify-center bg-slate-100 min-h-screen p-4">
      {/* Marco de Celular */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[12px] border-slate-900 flex flex-col relative" style={{ height: '85vh', maxHeight: '850px' }}>
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 pt-10 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-200 text-xs">Bienvenido</p>
              <h2 className="font-bold text-xl">{conductorActual?.nombre}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-indigo-200">En línea</span>
              </div>
            </div>
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Stats Rápidas */}
          {rutaActiva && (
            <div className="flex gap-3 mt-4">
              <div className="flex-1 bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{entregasPendientes.length}</p>
                <p className="text-[10px] text-indigo-200">Pendientes</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-300">{entregasCompletadas.length}</p>
                <p className="text-[10px] text-indigo-200">Completadas</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-300">{entregasFallidas.length}</p>
                <p className="text-[10px] text-indigo-200">Fallidas</p>
              </div>
            </div>
          )}
        </div>

        {/* Menú Desplegable */}
        {showMenu && (
          <div className="absolute top-24 right-4 bg-white rounded-xl shadow-xl border border-slate-200 z-30 overflow-hidden w-48">
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <RefreshCw className="animate-spin mx-auto text-indigo-600 mb-2" size={32} />
                <p className="text-sm text-slate-600">Procesando...</p>
              </div>
            </div>
          )}

          {/* VISTA: Lista de Entregas */}
          {view === 'list' && (
            <div className="p-4 space-y-4">
              {!rutaActiva ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={40} className="text-slate-300" />
                  </div>
                  <h3 className="font-semibold text-slate-700 mb-1">Sin Ruta Asignada</h3>
                  <p className="text-sm text-slate-400">No tienes entregas programadas para hoy</p>
                  <button 
                    onClick={() => fetchRutaActiva(conductorId)}
                    className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium"
                  >
                    Actualizar
                  </button>
                </div>
              ) : (
                <>
                  {/* Info de Ruta */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800">{rutaActiva.nombre}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          Inicio: {new Date(rutaActiva.fecha_inicio || rutaActiva.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg uppercase">
                        {rutaActiva.estado}
                      </span>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Progreso</span>
                        <span>{entregasCompletadas.length} de {entregas.length}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${entregas.length > 0 ? (entregasCompletadas.length / entregas.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Paradas */}
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    Paradas ({entregas.length})
                  </h4>

                  <div className="space-y-3">
                    {entregas.map((entrega, index) => {
                      const isCompleted = entrega.estado === 'ENTREGADO';
                      const isFailed = entrega.estado === 'FALLIDO';

                      return (
                        <div
                          key={entrega.id}
                          onClick={() => handleEntregaClick(entrega)}
                          className={`p-4 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer ${
                            isCompleted ? 'bg-emerald-50 border-emerald-200' :
                            isFailed ? 'bg-red-50 border-red-200' :
                            'bg-white border-slate-200 shadow-sm hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Número de parada */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              isCompleted ? 'bg-emerald-500 text-white' :
                              isFailed ? 'bg-red-500 text-white' :
                              'bg-indigo-100 text-indigo-600'
                            }`}>
                              {isCompleted ? <CheckCircle size={16} /> :
                               isFailed ? <XCircle size={16} /> :
                               index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold text-slate-800 truncate">{entrega.cliente}</h4>
                                <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                <MapPin size={10} className="inline mr-1" />
                                {entrega.direccion}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                  NV: {entrega.nv}
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                  {entrega.bultos} bultos
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* VISTA: Detalle de Entrega */}
          {view === 'detail' && selectedEntrega && (
            <div className="flex flex-col h-full">
              {/* Header con botón volver */}
              <div className="bg-white px-4 py-3 border-b border-slate-100 sticky top-0 z-10">
                <button 
                  onClick={() => setView('list')}
                  className="flex items-center gap-1 text-indigo-600 font-medium text-sm"
                >
                  <ChevronLeft size={18} /> Volver
                </button>
              </div>

              <div className="p-4 space-y-4 flex-1">
                {/* Info Cliente */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800">{selectedEntrega.cliente}</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} />
                    {selectedEntrega.direccion}
                  </p>
                  {selectedEntrega.comuna && (
                    <p className="text-xs text-slate-400 mt-0.5">{selectedEntrega.comuna}, {selectedEntrega.region}</p>
                  )}
                </div>

                {/* Mapa Placeholder */}
                <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="text-center">
                    <Map size={32} className="text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Vista del mapa</p>
                  </div>
                  <button className="absolute bottom-3 right-3 bg-white px-3 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-1 text-blue-600">
                    <Navigation size={14} /> Abrir en Maps
                  </button>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold text-sm">
                    <Phone size={18} /> Llamar
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-semibold text-sm">
                    <Navigation size={18} /> Navegar
                  </button>
                </div>

                {/* Detalle del Pedido */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">
                    Detalle del Pedido
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Nota de Venta</span>
                      <span className="font-mono font-bold text-slate-800">{selectedEntrega.nv}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Bultos</span>
                      <span className="font-bold text-slate-800">{selectedEntrega.bultos || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Peso Total</span>
                      <span className="font-bold text-slate-800">{selectedEntrega.peso_kg || 0} kg</span>
                    </div>
                    {selectedEntrega.observaciones && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">Observaciones:</p>
                        <p className="text-sm text-slate-700 mt-1">{selectedEntrega.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones según estado */}
                {(selectedEntrega.estado === 'PENDIENTE' || selectedEntrega.estado === 'EN_RUTA') && (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => completarEntrega('ENTREGADO')}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={24} /> Confirmar Entrega
                    </button>
                    <button
                      onClick={() => completarEntrega('FALLIDO')}
                      className="w-full py-3 bg-white text-red-600 border-2 border-red-200 rounded-2xl font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} /> Reportar Problema
                    </button>
                  </div>
                )}

                {selectedEntrega.estado === 'ENTREGADO' && (
                  <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle size={28} className="text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-emerald-800 text-lg">¡Entrega Completada!</h3>
                    <p className="text-sm text-emerald-600 mt-1">
                      {selectedEntrega.fecha_entrega_real && 
                        `Registrada a las ${new Date(selectedEntrega.fecha_entrega_real).toLocaleTimeString()}`
                      }
                    </p>
                  </div>
                )}

                {selectedEntrega.estado === 'FALLIDO' && (
                  <div className="bg-red-50 p-6 rounded-2xl text-center border border-red-100">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={28} className="text-red-600" />
                    </div>
                    <h3 className="font-bold text-red-800 text-lg">Entrega Fallida</h3>
                    <p className="text-sm text-red-600 mt-1">Se reportó un problema con esta entrega</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex justify-around">
          <button 
            onClick={() => setView('list')}
            className={`flex flex-col items-center gap-1 ${view === 'list' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Truck size={22} />
            <span className="text-[10px] font-semibold">Ruta</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Map size={22} />
            <span className="text-[10px] font-semibold">Mapa</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <User size={22} />
            <span className="text-[10px] font-semibold">Perfil</span>
          </button>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full opacity-30"></div>
      </div>

      {/* Info Panel (solo desktop) */}
      <div className="hidden lg:block ml-8 w-80">
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="text-indigo-600" size={24} />
            <h3 className="font-bold text-slate-800">Simulador Móvil</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Esta es una simulación de cómo vería la app un conductor en su dispositivo móvil.
          </p>
          <div className="space-y-2 text-xs text-slate-500">
            <p>• Selecciona un conductor para "iniciar sesión"</p>
            <p>• Ve las entregas asignadas a su ruta</p>
            <p>• Marca entregas como completadas o fallidas</p>
            <p>• Los cambios se sincronizan en tiempo real</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;
