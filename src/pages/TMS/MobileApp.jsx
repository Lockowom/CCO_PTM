import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { toast } from 'sonner';
import { 
  Truck, MapPin, CheckCircle, Navigation, Phone, Package, Camera,
  XCircle, Clock, Menu, LogOut, ChevronRight, ChevronLeft,
  RefreshCw, User, List, History, Settings, X, Calendar,
  Box, Scale, Send, Ban, Play, Barcode, ShieldAlert
} from 'lucide-react';

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
  const { user, logout, hasPermission, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const containerRef = useRef(null);

  const [view, setView] = useState('loading');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [actionModal, setActionModal] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [obs, setObs] = useState('');
  const [newDriverData, setNewDriverData] = useState({ rut: '', telefono: '', patente: '' });

  useGSAP(() => {
    if (view === 'home' || view === 'detail') {
      gsap.from(containerRef.current, {
        x: view === 'detail' ? 20 : -20,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }
  }, [view]);

  // Query: Obtener Perfil del Conductor
  const { data: driver, isLoading: loadingDriver, error: driverError } = useQuery({
    queryKey: ['driver_profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_conductores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !authLoading && (hasPermission('view_mobile_app') || user.rol === 'CONDUCTOR' || user.rol === 'ADMIN'),
    onSuccess: (data) => {
      if (data) {
        setView('home');
        // Actualizar a EN_RUTA si estaba disponible
        if (data.estado === 'DISPONIBLE') {
          supabase.from('tms_conductores').update({ estado: 'EN_RUTA', updated_at: new Date().toISOString() }).eq('id', data.id).then();
        }
      } else {
        setView('onboard');
      }
    }
  });

  // Query: Obtener Entregas
  const { data: entregas = [], isLoading: loadingEntregas } = useQuery({
    queryKey: ['mobile_entregas', driver?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_entregas')
        .select('*')
        .eq('conductor_id', driver.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!driver?.id
  });

  // Mutation: Crear Perfil
  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('tms_conductores')
        .insert({
          user_id: user.id,
          nombre: user.nombre || 'Conductor',
          apellido: '',
          rut: newDriverData.rut,
          telefono: newDriverData.telefono,
          vehiculo_patente: newDriverData.patente.toUpperCase(),
          estado: 'EN_RUTA'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['driver_profile', user.id]);
      toast.success('Perfil creado exitosamente');
    },
    onError: (err) => {
      toast.error('Error al crear perfil: ' + err.message);
    }
  });

  // Mutation: Actualizar Entrega
  const updateEntregaMutation = useMutation({
    mutationFn: async ({ id, estado, observaciones, fecha_entrega_real }) => {
      const updateData = { estado, updated_at: new Date().toISOString() };
      if (observaciones) updateData.observaciones = observaciones;
      if (fecha_entrega_real) updateData.fecha_entrega_real = fecha_entrega_real;

      const { error } = await supabase.from('tms_entregas').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onMutate: async (newEntrega) => {
      await queryClient.cancelQueries(['mobile_entregas', driver?.id]);
      const previousEntregas = queryClient.getQueryData(['mobile_entregas', driver?.id]);
      
      queryClient.setQueryData(['mobile_entregas', driver?.id], old => 
        old.map(e => e.id === newEntrega.id ? { ...e, ...newEntrega } : e)
      );
      
      return { previousEntregas };
    },
    onError: (err, newEntrega, context) => {
      queryClient.setQueryData(['mobile_entregas', driver?.id], context.previousEntregas);
      toast.error('Error al actualizar: ' + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['mobile_entregas', driver?.id]);
    },
    onSuccess: (_, variables) => {
      toast.success(`Entrega marcada como ${variables.estado}`);
      setActionModal(null);
      setMotivo('');
      setObs('');
      setSelectedEntrega(null);
      setView('home');
    }
  });

  // Suscripción Realtime
  useEffect(() => {
    if (!driver?.id) return;
    const channel = supabase
      .channel('mobile_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_entregas', filter: `conductor_id=eq.${driver.id}` }, () => {
        queryClient.invalidateQueries(['mobile_entregas', driver.id]);
      })
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err);
      });

    return () => { supabase.removeChannel(channel); };
  }, [driver?.id, queryClient]);

  // Auth Checks
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setView('unauthorized');
    } else if (driverError) {
      setView('unauthorized');
    }
  }, [user, authLoading, driverError]);

  const handleLogout = async () => {
    if (driver?.id) {
      await supabase.from('tms_conductores').update({ estado: 'DISPONIBLE' }).eq('id', driver.id);
    }
    logout();
  };

  const getFilteredEntregas = () => {
    if (filterEstado === 'TODOS') return entregas;
    return entregas.filter(e => e.estado === filterEstado);
  };

  if (view === 'loading' || authLoading || loadingDriver) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="animate-spin text-indigo-500 mx-auto mb-4" size={48} />
          <p className="text-slate-900 font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (view === 'unauthorized') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
          <p className="text-slate-500 mb-6">No tienes permisos para acceder o debes iniciar sesión.</p>
          <button onClick={handleLogout} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (view === 'onboard') {
    return (
      <div className="min-h-screen bg-slate-50 p-3 sm:p-6 flex flex-col justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Perfil de Conductor</h2>
            <p className="text-slate-500">Completa tus datos para activar tu cuenta.</p>
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
              onClick={() => {
                if(!newDriverData.rut || !newDriverData.patente) return toast.error("RUT y Patente son requeridos");
                createProfileMutation.mutate();
              }}
              disabled={createProfileMutation.isPending}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl mt-4 transition-colors disabled:opacity-50"
            >
              {createProfileMutation.isPending ? 'Activando...' : 'Activar Perfil'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-100 pb-20">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
              {driver?.nombre?.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">{driver?.nombre}</h1>
              <p className="text-[10px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded mt-0.5 w-fit">{driver?.vehiculo_patente}</p>
            </div>
          </div>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
          <div className="relative bg-white w-3/4 max-w-xs h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-800">Opciones</h2>
              <p className="text-xs font-medium text-slate-500 bg-slate-100 p-2 rounded-lg mt-2 break-all">{user?.email}</p>
            </div>
            <nav className="space-y-2 flex-1">
              <button onClick={() => { setView('home'); setShowMenu(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 text-slate-700 font-bold transition-colors">
                <List size={20} className="text-indigo-500" /> Mis Entregas
              </button>
              <button onClick={() => { setView('history'); setShowMenu(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 text-slate-700 font-bold transition-colors">
                <History size={20} className="text-indigo-500" /> Historial
              </button>
            </nav>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 font-black hover:bg-red-100 transition-colors">
              <LogOut size={20} /> Salir
            </button>
          </div>
        </div>
      )}

      <main className="p-4">
        {view === 'home' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 border-b-4 border-b-indigo-500">
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Pendientes</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-3xl font-black text-slate-800">
                    {entregas.filter(e => ['PENDIENTE', 'EN_RUTA'].includes(e.estado)).length}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 border-b-4 border-b-emerald-500">
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Completadas</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-3xl font-black text-slate-800">
                    {entregas.filter(e => e.estado === 'ENTREGADO').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {['TODOS', 'PENDIENTE', 'EN_RUTA'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterEstado(st)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all shadow-sm ${
                    filterEstado === st ? 'bg-white text-slate-900 scale-105' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {st === 'TODOS' ? 'Todas' : ESTADOS_ENTREGA[st]?.label || st}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {loadingEntregas ? (
                <div className="text-center py-12"><RefreshCw className="animate-spin mx-auto text-indigo-500" /></div>
              ) : getFilteredEntregas().length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <Package size={48} className="mx-auto mb-3 text-slate-700" />
                  <p className="font-bold text-slate-500">Sin entregas asignadas</p>
                </div>
              ) : (
                getFilteredEntregas().map(entrega => (
                  <div 
                    key={entrega.id}
                    onClick={() => { setSelectedEntrega(entrega); setView('detail'); }}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-black font-mono border border-slate-200">
                        NV: {entrega.nv}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border bg-${ESTADOS_ENTREGA[entrega.estado]?.color}-50 text-${ESTADOS_ENTREGA[entrega.estado]?.color}-700 border-${ESTADOS_ENTREGA[entrega.estado]?.color}-200`}>
                        {ESTADOS_ENTREGA[entrega.estado]?.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">{entrega.cliente}</h3>
                    
                    <div className="flex items-start gap-2 text-slate-500 text-xs mb-4">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-slate-500" />
                      <p className="line-clamp-2 font-medium">{entrega.direccion}, {entrega.comuna}</p>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-500">
                           <Box size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] text-slate-500 font-bold uppercase">Bultos</p>
                           <p className="text-sm font-black text-slate-800">{entrega.bultos || 0}</p>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-500">
                           <Scale size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] text-slate-500 font-bold uppercase">Peso</p>
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
          <div>
            <button 
              onClick={() => setView('home')}
              className="mb-4 flex items-center gap-2 text-slate-500 font-black hover:text-slate-800 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 w-fit transition-all active:scale-95"
            >
              <ChevronLeft size={18} /> Volver
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6 relative">
              <div className={`h-2 w-full bg-${ESTADOS_ENTREGA[selectedEntrega.estado]?.color}-500`}></div>
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-black text-slate-800 leading-tight">{selectedEntrega.cliente}</h2>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">NV: {selectedEntrega.nv}</p>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black bg-${ESTADOS_ENTREGA[selectedEntrega.estado]?.color}-100 text-${ESTADOS_ENTREGA[selectedEntrega.estado]?.color}-700`}>
                    {ESTADOS_ENTREGA[selectedEntrega.estado]?.label}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Destino</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-slate-800 font-bold">{selectedEntrega.direccion}</p>
                      <p className="text-slate-500 text-sm font-medium">{selectedEntrega.comuna}, {selectedEntrega.region}</p>
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEntrega.direccion + ', ' + selectedEntrega.comuna)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 active:scale-95 transition-transform"
                    >
                      <Navigation size={24} />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <a href={`tel:${selectedEntrega.telefono}`} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 active:bg-slate-100 transition-colors block text-center">
                    <Phone size={20} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Llamar</p>
                  </a>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <Clock size={20} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Horario</p>
                    <p className="font-bold text-slate-700 text-sm">09:00 - 18:00</p>
                  </div>
                </div>

                {selectedEntrega.observaciones && (
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Notas Internas</p>
                    <p className="text-amber-800 text-sm font-medium">{selectedEntrega.observaciones}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {selectedEntrega.estado === 'PENDIENTE' && (
                <button 
                  onClick={() => updateEntregaMutation.mutate({ id: selectedEntrega.id, estado: 'EN_RUTA' })}
                  disabled={updateEntregaMutation.isPending}
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-all text-lg"
                >
                  <Play size={24} fill="currentColor" /> INICIAR RUTA
                </button>
              )}

              {selectedEntrega.estado === 'EN_RUTA' && (
                <>
                  <button 
                    onClick={() => setActionModal('ENTREGADO')}
                    className="w-full py-5 bg-emerald-500 text-slate-900 font-black rounded-3xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-all text-lg mb-4"
                  >
                    <CheckCircle size={24} /> ENTREGAR PEDIDO
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setActionModal('RECHAZADO')}
                      className="py-4 bg-white border-2 border-red-100 text-red-500 font-black rounded-2xl active:scale-95 transition-transform"
                    >
                      Rechazar
                    </button>
                    <button 
                      onClick={() => setActionModal('REPROGRAMADO')}
                      className="py-4 bg-white border-2 border-purple-100 text-purple-500 font-black rounded-2xl active:scale-95 transition-transform"
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

      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-sm" onClick={() => setActionModal(null)} />
          <div className="relative bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            
            <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">
              {actionModal === 'ENTREGADO' ? 'Confirmar Entrega' : 
               actionModal === 'RECHAZADO' ? 'Motivo de Rechazo' : 'Reprogramar'}
            </h3>

            {(actionModal === 'RECHAZADO' || actionModal === 'REPROGRAMADO') && (
              <div className="mb-6 space-y-2">
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {(actionModal === 'RECHAZADO' ? MOTIVOS_RECHAZO : MOTIVOS_REPROGRAMACION).map(m => (
                    <button
                      key={m}
                      onClick={() => setMotivo(m)}
                      className={`p-4 rounded-2xl text-left text-sm font-bold transition-all ${
                        motivo === m ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-2 border-transparent text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Observaciones adicionales</label>
              <textarea
                value={obs}
                onChange={e => setObs(e.target.value)}
                placeholder="Escribe aquí..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl resize-none h-28 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>

            <button
              onClick={() => {
                let finalObs = selectedEntrega.observaciones || '';
                if (motivo || obs) {
                  const newEntry = `[${actionModal}] ${motivo} ${obs ? '- ' + obs : ''}`;
                  finalObs = finalObs ? `${finalObs}\n${newEntry}` : newEntry;
                }
                updateEntregaMutation.mutate({ 
                  id: selectedEntrega.id, 
                  estado: actionModal, 
                  observaciones: finalObs,
                  fecha_entrega_real: actionModal === 'ENTREGADO' ? new Date().toISOString() : undefined
                });
              }}
              disabled={updateEntregaMutation.isPending || ((actionModal !== 'ENTREGADO') && !motivo)}
              className="w-full py-5 bg-slate-900 text-white font-black text-lg rounded-2xl disabled:opacity-50 active:scale-95 transition-transform"
            >
              {updateEntregaMutation.isPending ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileApp;