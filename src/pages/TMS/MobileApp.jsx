import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  Truck, MapPin, CheckCircle, Navigation, Phone, Package, Camera,
  XCircle, Clock, Menu, LogOut, ChevronRight, ChevronLeft,
  RefreshCw, User, List, History, Settings, X, Calendar,
  Box, Scale, Send, Ban, Play, Barcode, ShieldAlert
} from 'lucide-react';

// ==================== CONFIGURACIÓN ====================
const ESTADOS_ENTREGA = {
  PENDIENTE: { label: 'Pendiente', color: 'amber', icon: Clock },
  EN_RUTA: { label: 'En Ruta', color: 'blue', icon: Truck },
  ENTREGADO: { label: 'Entregado', color: 'emerald', icon: CheckCircle },
  RECHAZADO: { label: 'Rechazado', color: 'red', icon: XCircle },
  REPROGRAMADO: { label: 'Reprogramado', color: 'purple', icon: Calendar },
};

const MOTIVOS_RECHAZO = [
  'Cliente no se encontraba', 'Dirección incorrecta', 'Cliente rechazó el pedido',
  'Producto dañado', 'Fuera de horario', 'Zona de difícil acceso', 'Otro motivo'
];

const MOTIVOS_REPROGRAMACION = [
  'Cliente solicitó otro día', 'Local cerrado', 'No había quien recibiera',
  'Problema con documentación', 'Reagendar por capacidad', 'Otro motivo'
];

const MobileApp = () => {
  // 1. AUTH & CONTEXT
  const { user, signOut, hasPermission, loading: authLoading } = useAuth();

  // 2. ESTADOS GLOBALES
  const [view, setView] = useState('loading'); // loading, unauthorized, onboard, home, history, profile, detail, scanner
  const [driver, setDriver] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 3. ESTADOS UI
  const [showMenu, setShowMenu] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [actionModal, setActionModal] = useState(null); // 'ENTREGADO', 'RECHAZADO', 'REPROGRAMADO'
  const [motivo, setMotivo] = useState('');
  const [obs, setObs] = useState('');

  // 4. ESTADOS ONBOARDING (Crear Perfil)
  const [newDriverData, setNewDriverData] = useState({
    rut: '', telefono: '', patente: ''
  });

  // ==================== EFECTOS PRINCIPALES ====================

  // A. VERIFICACIÓN INICIAL DE ACCESO
  useEffect(() => {
    if (authLoading) return;

    const initApp = async () => {
      console.log('📱 Iniciando App Móvil para:', user?.email);
      
      // 1. Verificar Usuario
      if (!user) {
        setView('unauthorized');
        setError('Debes iniciar sesión para acceder.');
        setLoading(false);
        return;
      }

      // 2. Verificar Permisos (RBAC)
      // El usuario debe tener rol CONDUCTOR o permiso explícito 'view_mobile_app'
      const canAccess = hasPermission('view_mobile_app') || user.rol === 'CONDUCTOR' || user.rol === 'ADMIN';
      
      if (!canAccess) {
        console.warn('⛔ Acceso denegado por roles/permisos');
        setView('unauthorized');
        setError('No tienes permisos para acceder a la aplicación móvil.');
        setLoading(false);
        return;
      }

      // 3. Buscar Perfil de Conductor
      try {
        setLoading(true);
        const { data: driverData, error: driverError } = await supabase
          .from('tms_conductores')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Usamos maybeSingle para evitar error 406

        if (driverError) throw driverError;

        if (driverData) {
          console.log('✅ Perfil conductor encontrado:', driverData);
          setDriver(driverData);
          
          // Actualizar estado a EN_RUTA si estaba DISPONIBLE
          if (driverData.estado === 'DISPONIBLE') {
             await supabase.from('tms_conductores')
               .update({ estado: 'EN_RUTA', updated_at: new Date().toISOString() })
               .eq('id', driverData.id);
          }
          
          await fetchEntregas(driverData.id);
          setView('home');
        } else {
          console.warn('⚠️ Usuario tiene permisos pero NO tiene perfil de conductor.');
          // Si es ADMIN, permitir entrar sin perfil (modo visor) o pedir crear uno
          // Para esta app, mostraremos pantalla de creación de perfil (Onboarding)
          setView('onboard');
        }

      } catch (err) {
        console.error('❌ Error inicializando app:', err);
        setError('Error de conexión al verificar perfil.');
        setView('unauthorized');
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, [user, authLoading, hasPermission]);

  // B. REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!driver?.id) return;

    console.log('📡 Conectando a Supabase Realtime para entregas...');

    const channel = supabase
      .channel('mobile_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tms_entregas' },
        (payload) => {
          console.log('🔔 EVENTO REALTIME DETECTADO:', payload);
          
          // Lógica de filtrado inteligente para actualizar solo cuando es relevante
          const isRelevant = 
            // 1. Nueva asignación: El conductor es el usuario actual
            (payload.new && payload.new.conductor_id === driver.id) ||
            // 2. Desasignación: El conductor ERA el usuario actual (ahora null u otro)
            (payload.old && payload.old.conductor_id === driver.id) ||
            // 3. Actualización de estado: El registro actual pertenece al conductor
            (payload.new && payload.new.conductor_id === driver.id);

          if (isRelevant) {
             console.log('🔄 Actualizando lista de entregas (Evento relevante)...');
             fetchEntregas(driver.id);
          } else {
             console.log('ℹ️ Evento ignorado (No afecta a este conductor)');
          }
        }
      )
      .subscribe((status) => {
        console.log('📶 Estado de conexión Realtime:', status);
        if (status === 'SUBSCRIBED') {
          // Opcional: Mostrar un toast o indicador de "Conectado"
        }
      });

    return () => { 
      console.log('🔌 Desconectando canal Realtime...');
      supabase.removeChannel(channel); 
    };
  }, [driver?.id]);

  // ==================== FUNCIONES DE DATOS ====================

  const fetchEntregas = async (driverId) => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('tms_entregas')
        .select('*')
        .eq('conductor_id', driverId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntregas(data || []);
    } catch (err) {
      console.error('Error cargando entregas:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const createDriverProfile = async () => {
    if (!newDriverData.rut || !newDriverData.patente) {
      alert('Por favor completa RUT y Patente');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tms_conductores')
        .insert({
          user_id: user.id,
          nombre: user.nombre || 'Conductor',
          apellido: '', // Opcional
          rut: newDriverData.rut,
          telefono: newDriverData.telefono,
          vehiculo_patente: newDriverData.patente.toUpperCase(),
          estado: 'DISPONIBLE'
        })
        .select()
        .single();

      if (error) throw error;

      setDriver(data);
      setView('home');
      fetchEntregas(data.id);

    } catch (err) {
      console.error('Error creando perfil:', err);
      alert('Error al crear perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateEntregaStatus = async () => {
    if (!selectedEntrega || !actionModal) return;
    
    // Validaciones
    if ((actionModal === 'RECHAZADO' || actionModal === 'REPROGRAMADO') && !motivo) {
      alert('Debes seleccionar un motivo');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        estado: actionModal,
        updated_at: new Date().toISOString()
      };

      if (actionModal === 'ENTREGADO') {
        updateData.fecha_entrega_real = new Date().toISOString();
      }

      // Construir observación
      let finalObs = selectedEntrega.observaciones || '';
      if (motivo || obs) {
        const newEntry = `[${actionModal}] ${motivo} ${obs ? '- ' + obs : ''}`;
        finalObs = finalObs ? `${finalObs}\n${newEntry}` : newEntry;
        updateData.observaciones = finalObs;
      }

      const { error } = await supabase
        .from('tms_entregas')
        .update(updateData)
        .eq('id', selectedEntrega.id);

      if (error) throw error;

      // Reset y recargar
      setActionModal(null);
      setMotivo('');
      setObs('');
      setSelectedEntrega(null);
      setView('home'); // Volver al inicio
      await fetchEntregas(driver.id);

    } catch (err) {
      console.error('Error actualizando entrega:', err);
      alert('Error al actualizar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (driver?.id) {
      await supabase.from('tms_conductores')
        .update({ estado: 'DISPONIBLE' })
        .eq('id', driver.id);
    }
    signOut();
  };

  // ==================== HELPERS DE UI ====================
  
  const getFilteredEntregas = () => {
    if (filterEstado === 'TODOS') return entregas;
    return entregas.filter(e => e.estado === filterEstado);
  };

  const activeDeliveriesCount = entregas.filter(e => ['PENDIENTE', 'EN_RUTA'].includes(e.estado)).length;

  // ==================== VISTAS (COMPONENTES INTERNOS) ====================

  if (view === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="animate-spin text-indigo-500 mx-auto mb-4" size={48} />
          <p className="text-white font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (view === 'unauthorized') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
          <p className="text-slate-500 mb-6">{error || 'No tienes permisos para acceder.'}</p>
          <button onClick={handleLogout} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (view === 'onboard') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Perfil de Conductor</h2>
            <p className="text-slate-500">Completa tus datos para activar tu cuenta de conductor.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input disabled value={user?.nombre || user?.email} className="w-full p-3 bg-slate-100 rounded-xl border-none text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RUT *</label>
              <input 
                value={newDriverData.rut}
                onChange={e => setNewDriverData({...newDriverData, rut: e.target.value})}
                placeholder="Ej: 12.345.678-9"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patente Vehículo *</label>
              <input 
                value={newDriverData.patente}
                onChange={e => setNewDriverData({...newDriverData, patente: e.target.value})}
                placeholder="Ej: ABCD-12"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input 
                value={newDriverData.telefono}
                onChange={e => setNewDriverData({...newDriverData, telefono: e.target.value})}
                placeholder="+569..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <button 
              onClick={createDriverProfile}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-colors disabled:opacity-50"
            >
              {loading ? 'Activando...' : 'Activar Perfil'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN UI (HOME & DETAIL) ====================
  
  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* HEADER */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
              {driver?.nombre?.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">{driver?.nombre}</h1>
              <p className="text-[10px] text-slate-400">{driver?.vehiculo_patente}</p>
            </div>
          </div>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-white/10">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* MENU DRAWER */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMenu(false)} />
          <div className="relative bg-white w-3/4 max-w-xs h-full shadow-2xl p-6 flex flex-col">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800">Menú</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
            <nav className="space-y-2 flex-1">
              <button onClick={() => { setView('home'); setShowMenu(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">
                <List size={20} /> Mis Entregas
              </button>
              <button onClick={() => { setView('history'); setShowMenu(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">
                <History size={20} /> Historial
              </button>
            </nav>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-600 font-bold mt-auto">
              <LogOut size={20} /> Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <main className="p-4">
        {view === 'home' && (
          <>
            {/* STATS CARDS */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs uppercase font-bold">Pendientes</p>
                <p className="text-2xl font-black text-indigo-600">
                  {entregas.filter(e => ['PENDIENTE', 'EN_RUTA'].includes(e.estado)).length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs uppercase font-bold">Completadas</p>
                <p className="text-2xl font-black text-emerald-500">
                  {entregas.filter(e => e.estado === 'ENTREGADO').length}
                </p>
              </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {['TODOS', 'PENDIENTE', 'EN_RUTA'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterEstado(st)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    filterEstado === st ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {st === 'TODOS' ? 'Todas' : ESTADOS_ENTREGA[st]?.label || st}
                </button>
              ))}
            </div>

            {/* LIST */}
            <div className="space-y-3">
              {getFilteredEntregas().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package size={48} className="mx-auto mb-2 opacity-20" />
                  <p>No hay entregas disponibles</p>
                </div>
              ) : (
                getFilteredEntregas().map(entrega => (
                  <div 
                    key={entrega.id}
                    onClick={() => { setSelectedEntrega(entrega); setView('detail'); }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
                  >
                    {/* ENCABEZADO: NV Y ESTADO */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                         <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-xs font-black tracking-wide border border-indigo-100">
                           NV: {entrega.nv}
                         </span>
                         {entrega.ruta_id && <span className="text-[10px] text-slate-400 font-bold">Ruta Asignada</span>}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold bg-${ESTADOS_ENTREGA[entrega.estado]?.color}-100 text-${ESTADOS_ENTREGA[entrega.estado]?.color}-700`}>
                        {ESTADOS_ENTREGA[entrega.estado]?.label}
                      </span>
                    </div>

                    {/* CLIENTE */}
                    <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">{entrega.cliente}</h3>
                    
                    {/* DIRECCIÓN */}
                    <div className="flex items-start gap-2 text-slate-500 text-xs mb-4">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                      <p className="line-clamp-2 font-medium">{entrega.direccion}, {entrega.comuna}</p>
                    </div>

                    {/* FOOTER: BULTOS Y PESO */}
                    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm text-slate-600">
                           <Box size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Bultos</p>
                           <p className="text-sm font-black text-slate-800">{entrega.bultos || 0}</p>
                        </div>
                      </div>
                      
                      <div className="w-px h-8 bg-slate-200"></div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm text-slate-600">
                           <Scale size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Peso</p>
                           <p className="text-sm font-black text-slate-800">{entrega.peso_kg || 0} kg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {view === 'detail' && selectedEntrega && (
          <div className="animate-in slide-in-from-right duration-200">
            <button 
              onClick={() => setView('home')}
              className="mb-4 flex items-center gap-2 text-slate-500 font-medium hover:text-slate-800"
            >
              <ChevronLeft size={20} /> Volver
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
              <div className="bg-slate-50 p-6 border-b border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-black text-slate-800">{selectedEntrega.cliente}</h2>
                </div>
                <p className="font-mono text-sm text-slate-500">NV: {selectedEntrega.nv}</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Dirección</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-slate-800 font-medium">{selectedEntrega.direccion}</p>
                      <p className="text-slate-500 text-sm">{selectedEntrega.comuna}, {selectedEntrega.region}</p>
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEntrega.direccion + ', ' + selectedEntrega.comuna)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <Navigation size={24} />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Contacto</p>
                    <p className="font-bold text-slate-700">{selectedEntrega.telefono || 'Sin teléfono'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Horario</p>
                    <p className="font-bold text-slate-700">09:00 - 18:00</p>
                  </div>
                </div>

                {selectedEntrega.observaciones && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm">
                    <strong>Nota:</strong> {selectedEntrega.observaciones}
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3">
              {selectedEntrega.estado === 'PENDIENTE' && (
                <button 
                  onClick={async () => {
                    await supabase.from('tms_entregas').update({ estado: 'EN_RUTA' }).eq('id', selectedEntrega.id);
                    setSelectedEntrega({...selectedEntrega, estado: 'EN_RUTA'});
                    fetchEntregas(driver.id);
                  }}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Play size={24} /> Iniciar Ruta
                </button>
              )}

              {selectedEntrega.estado === 'EN_RUTA' && (
                <>
                  <button 
                    onClick={() => setActionModal('ENTREGADO')}
                    className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={24} /> Confirmar Entrega
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setActionModal('RECHAZADO')}
                      className="py-3 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl"
                    >
                      Rechazar
                    </button>
                    <button 
                      onClick={() => setActionModal('REPROGRAMADO')}
                      className="py-3 bg-white border-2 border-purple-100 text-purple-600 font-bold rounded-xl"
                    >
                      Reprogramar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ACTION MODAL */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActionModal(null)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-4">
              {actionModal === 'ENTREGADO' ? 'Confirmar Entrega' : 
               actionModal === 'RECHAZADO' ? 'Reportar Rechazo' : 'Reprogramar Pedido'}
            </h3>

            {(actionModal === 'RECHAZADO' || actionModal === 'REPROGRAMADO') && (
              <div className="mb-4 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Motivo</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {(actionModal === 'RECHAZADO' ? MOTIVOS_RECHAZO : MOTIVOS_REPROGRAMACION).map(m => (
                    <button
                      key={m}
                      onClick={() => setMotivo(m)}
                      className={`p-3 rounded-xl text-left text-sm font-medium transition-colors ${
                        motivo === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Observaciones</label>
              <textarea
                value={obs}
                onChange={e => setObs(e.target.value)}
                placeholder="Comentarios adicionales..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              onClick={updateEntregaStatus}
              disabled={loading || ((actionModal !== 'ENTREGADO') && !motivo)}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar Acción'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileApp;
