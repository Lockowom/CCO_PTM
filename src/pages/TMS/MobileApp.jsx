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
  LogOut
} from 'lucide-react';

// Componente simulador de App Móvil para Conductores
const MobileApp = () => {
  const [conductorId, setConductorId] = useState(null);
  const [conductores, setConductores] = useState([]);
  const [rutaActiva, setRutaActiva] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [view, setView] = useState('login'); // login, list, detail, complete
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConductores();
  }, []);

  // Cargar lista de conductores para "Login" simulado
  const fetchConductores = async () => {
    const { data } = await supabase.from('tms_conductores').select('*').order('nombre');
    setConductores(data || []);
  };

  // Login del conductor
  const handleLogin = async (id) => {
    setLoading(true);
    setConductorId(id);
    await fetchRutaActiva(id);
    setLoading(false);
  };

  // Buscar ruta asignada
  const fetchRutaActiva = async (id) => {
    // Buscar ruta EN_CURSO o PLANIFICADA
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
      
      // Si está planificada, pasarla a EN_CURSO automáticamente al entrar
      if (ruta.estado === 'PLANIFICADA') {
        await supabase.from('tms_rutas').update({ estado: 'EN_CURSO', fecha_inicio: new Date() }).eq('id', ruta.id);
        await supabase.from('tms_conductores').update({ estado: 'EN_RUTA' }).eq('id', id);
      }

      // Cargar entregas
      const { data: ents } = await supabase
        .from('tms_entregas')
        .select('*')
        .eq('ruta_id', ruta.id)
        .order('orden_visita', { ascending: true });
      
      setEntregas(ents || []);
      setView('list');
    } else {
      setRutaActiva(null);
      setEntregas([]);
      setView('list'); // Mostrar estado "Sin ruta"
    }
  };

  const handleEntregaClick = (entrega) => {
    setSelectedEntrega(entrega);
    setView('detail');
  };

  const completarEntrega = async (estado) => {
    if (!selectedEntrega) return;
    setLoading(true);
    
    // Actualizar estado
    await supabase
      .from('tms_entregas')
      .update({ 
        estado: estado, 
        fecha_entrega: new Date() 
      })
      .eq('id', selectedEntrega.id);

    // Recargar lista
    await fetchRutaActiva(conductorId);
    setLoading(false);
    setView('list');
  };

  // --- VISTAS ---

  if (view === 'login') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-6">
          <Truck size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">TMS Driver App</h1>
        <p className="text-slate-400 mb-8">Selecciona tu perfil para ingresar</p>
        
        <div className="w-full max-w-sm space-y-3">
          {conductores.map(c => (
            <button
              key={c.id}
              onClick={() => handleLogin(c.id)}
              className="w-full bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center justify-between transition-colors border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold">
                  {c.nombre.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-medium">{c.nombre} {c.apellido}</p>
                  <p className="text-xs text-slate-400">{c.vehiculo_patente}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-500" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Layout móvil simulado
  return (
    <div className="flex justify-center bg-slate-100 min-h-screen p-4">
      {/* Marco de celular */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-slate-900 flex flex-col relative h-[800px]">
        
        {/* Header App */}
        <div className="bg-indigo-600 text-white p-5 pt-8 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">Hola, {conductores.find(c => c.id === conductorId)?.nombre}</h2>
            <p className="text-indigo-200 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              En línea
            </p>
          </div>
          <button onClick={() => setView('login')} className="p-2 hover:bg-indigo-700 rounded-full">
            <LogOut size={18} />
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {view === 'list' && (
            <div className="p-4 space-y-4">
              {!rutaActiva ? (
                <div className="text-center py-10 text-slate-400">
                  <Package size={48} className="mx-auto mb-3 opacity-20" />
                  <p>No tienes ruta asignada hoy.</p>
                </div>
              ) : (
                <>
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-indigo-900">{rutaActiva.nombre}</h3>
                      <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-[10px] font-bold rounded-full uppercase">
                        {rutaActiva.estado}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-indigo-700">
                      <span className="flex items-center gap-1"><Clock size={12}/> Inicio: {new Date(rutaActiva.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="flex items-center gap-1"><Package size={12}/> {entregas.length} Entregas</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Próximas Paradas</h4>
                  
                  <div className="space-y-3">
                    {entregas.map((entrega, index) => {
                      const isCompleted = entrega.estado === 'ENTREGADO';
                      const isFailed = entrega.estado === 'FALLIDO';
                      
                      return (
                        <div 
                          key={entrega.id}
                          onClick={() => handleEntregaClick(entrega)}
                          className={`p-4 rounded-xl border transition-all active:scale-95 cursor-pointer flex gap-3 ${
                            isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : 
                            isFailed ? 'bg-red-50 border-red-100' :
                            'bg-white border-slate-200 shadow-sm hover:border-indigo-300'
                          }`}
                        >
                          <div className={`flex flex-col items-center gap-1 pt-1 ${isCompleted ? 'text-slate-400' : 'text-indigo-600'}`}>
                            <span className="text-xs font-bold w-6 h-6 flex items-center justify-center border rounded-full">
                              {index + 1}
                            </span>
                            {index < entregas.length - 1 && <div className="w-0.5 h-full bg-slate-200 -mb-4"></div>}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-800">{entrega.cliente}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isCompleted ? 'bg-green-100 text-green-700' : 
                                isFailed ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {entrega.estado}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-1">{entrega.direccion}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="bg-slate-100 px-1 rounded">NV: {entrega.nv}</span>
                              <span>{entrega.bultos} Bultos</span>
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

          {view === 'detail' && selectedEntrega && (
            <div className="h-full flex flex-col">
              <div className="bg-white p-4 shadow-sm border-b sticky top-0 z-10">
                <button onClick={() => setView('list')} className="text-indigo-600 flex items-center gap-1 text-sm font-medium mb-2">
                  <ChevronLeft size={16} /> Volver a la lista
                </button>
                <h2 className="text-xl font-bold text-slate-800">{selectedEntrega.cliente}</h2>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {selectedEntrega.direccion}, {selectedEntrega.comuna}
                </p>
              </div>

              <div className="p-4 space-y-4 flex-1">
                {/* Mapa estático simulado */}
                <div className="h-40 bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative">
                  <Map size={32} className="text-slate-400" />
                  <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded shadow text-xs font-bold flex items-center gap-1">
                    <Navigation size={12} className="text-blue-500" /> Waze
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm">
                    <Phone size={16} /> Llamar
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm">
                    <Navigation size={16} /> Navegar
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Detalle del Pedido</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Nota de Venta</span>
                    <span className="font-mono font-bold">{selectedEntrega.nv}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Bultos</span>
                    <span className="font-bold">{selectedEntrega.bultos}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Peso Total</span>
                    <span className="font-bold">{selectedEntrega.peso || 0} kg</span>
                  </div>
                </div>

                {/* Acciones de Entrega */}
                {selectedEntrega.estado === 'PENDIENTE' && (
                  <div className="mt-6 space-y-3">
                    <button 
                      onClick={() => completarEntrega('ENTREGADO')}
                      className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={24} /> Confirmar Entrega
                    </button>
                    
                    <button 
                      onClick={() => completarEntrega('FALLIDO')}
                      className="w-full py-3 bg-white text-red-600 border border-red-200 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} /> Reportar Fallo
                    </button>
                  </div>
                )}
                
                {selectedEntrega.estado === 'ENTREGADO' && (
                  <div className="bg-green-50 p-6 rounded-xl text-center border border-green-100">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                      <CheckCircle size={24} />
                    </div>
                    <h3 className="font-bold text-green-800">Entrega Completada</h3>
                    <p className="text-xs text-green-600 mt-1">Registrada a las {new Date(selectedEntrega.fecha_entrega).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t p-3 flex justify-around text-slate-400">
          <button className={`flex flex-col items-center gap-1 ${view === 'list' ? 'text-indigo-600' : ''}`} onClick={() => setView('list')}>
            <Truck size={20} />
            <span className="text-[10px] font-bold">Ruta</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <Menu size={20} />
            <span className="text-[10px] font-bold">Menú</span>
          </button>
        </div>

        {/* Barra Home iOS */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full opacity-20"></div>
      </div>
    </div>
  );
};

// Icono auxiliar para UI
const ChevronRight = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const ChevronLeft = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

export default MobileApp;
