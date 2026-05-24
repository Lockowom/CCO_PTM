import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Truck, Calendar, User, CheckSquare, Square, Save, ArrowRight, Package, Scale, Activity } from 'lucide-react';
import { useConductores } from '../../hooks/useConductores';
import { supabase } from '../../supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const API_URL = 'https://cco-ptm.onrender.com/api';

const RoutePlanning = () => {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  
  const { conductores, loading: loadingConductores } = useConductores(); // Conductores reales de Supabase
  const [selectedEntregas, setSelectedEntregas] = useState([]);
  const [filterText, setFilterText] = useState('');

  // Estado para creación de ruta
  const [rutaNombre, setRutaNombre] = useState(`Ruta-${new Date().toLocaleDateString().replace(/\//g, '-')}`);
  const [selectedConductor, setSelectedConductor] = useState('');

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  // TanStack Query para Entregas Pendientes
  const { data: entregas = [], isLoading: loading } = useQuery({
    queryKey: ['entregas_pendientes'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/entregas?estado=PENDIENTE&limit=200`);
      if (!res.ok) throw new Error('Error fetching entregas');
      return res.json();
    },
  });

  // Suscribirse a cambios en tiempo real en tms_entregas
  useEffect(() => {
    const channel = supabase
      .channel('planning_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_entregas' }, () => {
        queryClient.invalidateQueries({ queryKey: ['entregas_pendientes'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const toggleSelection = (id) => {
    if (selectedEntregas.includes(id)) {
      setSelectedEntregas(selectedEntregas.filter(sid => sid !== id));
    } else {
      setSelectedEntregas([...selectedEntregas, id]);
    }
  };

  // TanStack Mutation para Crear Ruta
  const createRouteMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_URL}/rutas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!result.success) throw new Error('Error creando ruta');
      return result;
    },
    onSuccess: () => {
      toast.success("¡Ruta creada con éxito!", {
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
      });
      queryClient.invalidateQueries({ queryKey: ['entregas_pendientes'] });
      setSelectedEntregas([]);
      setRutaNombre(`Ruta-${new Date().toLocaleDateString().replace(/\//g, '-')}`);
    },
    onError: (e) => {
      toast.error("Error al crear la ruta", {
        style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' }
      });
    }
  });

  const handleCreateRoute = () => {
    if (selectedEntregas.length === 0 || !selectedConductor) {
      toast.warning("Selecciona entregas y un conductor", {
        style: { background: '#1e293b', border: '1px solid #f97316', color: '#f8fafc' }
      });
      return;
    }

    createRouteMutation.mutate({
      nombre: rutaNombre,
      conductor_id: selectedConductor,
      entregas_ids: selectedEntregas
    });
  };

  const filteredEntregas = entregas.filter(e => 
    e.nv.toLowerCase().includes(filterText.toLowerCase()) || 
    (e.cliente && e.cliente.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 text-slate-700 p-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-wms-neon/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4 mb-4 md:mb-0">
          <div className="bg-wms-neon/10 p-3.5 rounded-2xl border border-wms-neon/20 text-wms-neon shadow-neon-green">
            <Truck size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Planificador de Rutas</h2>
            <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
              <Activity size={14} className="text-wms-neon" />
              Asigna entregas pendientes a tus conductores
            </p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl flex items-center px-4 py-3 shadow-sm focus-within:border-wms-neon focus-within:shadow-neon-green transition-all flex-1">
                <Search size={18} className="text-slate-500 mr-2" />
                <input 
                    type="text" 
                    placeholder="Filtrar por Cliente o NV..." 
                    className="outline-none text-sm w-full md:w-64 bg-transparent text-slate-900 placeholder-slate-500 font-medium"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* Panel Izquierdo: Lista de Entregas */}
        <div className="flex-1 bg-white backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center z-10 sticky top-0">
            <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <MapPin size={18} className="text-wms-neon" />
              Pendientes ({filteredEntregas.length})
            </h3>
            <span className="text-xs font-black bg-wms-neon/10 text-wms-neon border border-wms-neon/20 px-3 py-1 rounded-lg shadow-neon-green">
               {selectedEntregas.length} seleccionados
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/20">
            {loading ? (
                <div className="text-center py-10 text-slate-500 font-bold flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-wms-neon rounded-full animate-spin"></div>
                  Cargando entregas...
                </div>
            ) : filteredEntregas.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <CheckSquare size={24} className="text-slate-500" />
                  </div>
                  <p className="font-bold text-lg text-slate-900">No hay entregas pendientes</p>
                </div>
            ) : (
                filteredEntregas.map(entrega => (
                    <div 
                        key={entrega.id}
                        onClick={() => toggleSelection(entrega.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 group ${
                            selectedEntregas.includes(entrega.id) 
                            ? 'bg-wms-neon/10 border-wms-neon shadow-neon-green' 
                            : 'bg-slate-50/50 border-slate-200 hover:border-wms-neon/50'
                        }`}
                    >
                        <div className={`mt-1 transition-colors ${selectedEntregas.includes(entrega.id) ? 'text-wms-neon' : 'text-slate-500 group-hover:text-slate-500'}`}>
                            {selectedEntregas.includes(entrega.id) ? <CheckSquare size={22} strokeWidth={2.5} /> : <Square size={22} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-black text-lg tracking-tight ${selectedEntregas.includes(entrega.id) ? 'text-wms-neon' : 'text-slate-900'}`}>NV: {entrega.nv}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-200">{new Date(entrega.fecha_creacion).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 truncate mb-1">{entrega.cliente}</p>
                            <p className="text-xs font-medium text-slate-500 truncate mb-3">{entrega.direccion || 'Sin dirección'}</p>
                            
                            <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                                    <Package size={14} className="text-wms-neon" /> {entrega.bultos} bultos
                                </span>
                                {entrega.peso > 0 && (
                                  <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                                      <Scale size={14} className="text-wms-neon" /> {entrega.peso} kg
                                  </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Flecha Central */}
        <div className="hidden lg:flex flex-col justify-center items-center text-wms-border">
             <ArrowRight size={40} className="animate-pulse" />
        </div>

        {/* Panel Derecho: Configuración de Ruta */}
        <div className="w-full lg:w-[400px] bg-white backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="p-5 border-b border-slate-200 bg-slate-50/50 z-10">
                <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight">
                    <Truck size={18} className="text-emerald-400" />
                    Nueva Ruta
                </h3>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar z-10">
                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Nombre de Ruta</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-3 bg-slate-900 text-white transition-all shadow-inner"
                            value={rutaNombre}
                            onChange={e => setRutaNombre(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Asignar Conductor</label>
                    <div className="space-y-3">
                        {loadingConductores ? (
                          <div className="text-center py-4 text-slate-500 text-sm font-medium">Cargando conductores...</div>
                        ) : conductores.filter(c => c.estado === 'DISPONIBLE').length === 0 ? (
                          <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold">No hay conductores disponibles</div>
                        ) : (
                          conductores.filter(c => c.estado === 'DISPONIBLE').map(c => (
                            <div 
                                key={c.id}
                                onClick={() => setSelectedConductor(c.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                                    selectedConductor === c.id 
                                    ? 'bg-emerald-500/10 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]' 
                                    : 'bg-slate-50/50 border-slate-200 hover:border-emerald-400/50'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${selectedConductor === c.id ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-white border-slate-200'}`}>
                                        <User size={18} className={selectedConductor === c.id ? 'text-emerald-400' : 'text-slate-500'} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black ${selectedConductor === c.id ? 'text-emerald-400' : 'text-slate-900'}`}>{c.nombre} {c.apellido}</p>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">{c.vehiculo_patente || 'Sin vehículo'}</p>
                                    </div>
                                </div>
                                {selectedConductor === c.id && <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>}
                            </div>
                          ))
                        )}
                    </div>
                </div>

                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Activity size={14}/> Resumen
                    </h4>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 font-bold">Entregas Seleccionadas:</span>
                        <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{selectedEntregas.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">Estado:</span>
                        <span className="text-wms-alert font-black uppercase tracking-widest text-[10px] bg-wms-alert/10 px-2 py-1 rounded-md border border-wms-alert/20">Borrador</span>
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50/50 z-10">
                <button 
                    onClick={handleCreateRoute}
                    disabled={selectedEntregas.length === 0 || !selectedConductor || createRouteMutation.isPending}
                    className="w-full bg-emerald-500 text-slate-900 py-4 rounded-xl font-black hover:bg-emerald-400 disabled:bg-white disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:shadow-none uppercase tracking-widest text-sm"
                >
                    {createRouteMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save size={20} strokeWidth={2.5} />
                    )}
                    {createRouteMutation.isPending ? 'Creando...' : 'Crear y Asignar Ruta'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning;