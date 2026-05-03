import React, { useState, useRef } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  MapPin, 
  Package, 
  ArrowRight, 
  CheckCircle, 
  History,
  ScanBarcode,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Mocks para historial
const fetchHistorial = async () => {
  return [
    { id: 1, origen: 'A-01-01', destino: 'B-02-03', producto: 'PARACETAMOL 500MG', cantidad: 50, usuario: 'Juan Pérez', hora: '10:30' },
    { id: 2, origen: 'RECEPCION', destino: 'A-05-02', producto: 'IBUPROFENO 400MG', cantidad: 200, usuario: 'Maria Gonzalez', hora: '09:15' }
  ];
};

const Transfers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1: Origen, 2: Selección, 3: Destino, 4: Confirmación
  
  // Estados de Selección
  const [origenSearch, setOrigenSearch] = useState('');
  const [origenUbicacion, setOrigenUbicacion] = useState(null);
  const [itemsOrigen, setItemsOrigen] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cantidadTransferir, setCantidadTransferir] = useState(1);
  
  const [destinoSearch, setDestinoSearch] = useState('');
  const [destinoUbicacion, setDestinoUbicacion] = useState(null);

  // Referencias para animaciones
  const containerRef = useRef(null);
  const stepRef = useRef(null);

  // Historial Query
  const { data: historial = [] } = useQuery({
    queryKey: ['transferHistory'],
    queryFn: fetchHistorial,
    staleTime: 1000 * 60,
  });

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  useGSAP(() => {
    if (stepRef.current) {
      gsap.fromTo(stepRef.current, 
        { x: 20, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", clearProps: 'all' }
      );
    }
  }, [step]);

  // Buscar Origen Mutation
  const buscarOrigenMutation = useMutation({
    mutationFn: async (search) => {
      const { data, error } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .eq('ubicacion', search.toUpperCase());

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Ubicación no encontrada o vacía");
      return data;
    },
    onSuccess: (data) => {
      setOrigenUbicacion(origenSearch.toUpperCase());
      setItemsOrigen(data);
      setStep(2);
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const seleccionarItem = (item) => {
    setSelectedItem(item);
    setCantidadTransferir(item.cantidad); // Por defecto todo
    setStep(3);
  };

  const verificarDestino = () => {
    if (!destinoSearch.trim()) return;
    setDestinoUbicacion(destinoSearch.toUpperCase());
    setStep(4);
  };

  // Confirmar Transferencia Mutation
  const confirmarTransferenciaMutation = useMutation({
    mutationFn: async () => {
      // 1. Restar de Origen
      const nuevaCantidadOrigen = selectedItem.cantidad - cantidadTransferir;
      
      if (nuevaCantidadOrigen === 0) {
        await supabase.from('wms_ubicaciones').delete().eq('id', selectedItem.id);
      } else {
        await supabase.from('wms_ubicaciones').update({ cantidad: nuevaCantidadOrigen }).eq('id', selectedItem.id);
      }

      // 2. Sumar a Destino
      const { data: existente } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .eq('ubicacion', destinoUbicacion)
        .eq('codigo', selectedItem.codigo)
        .single();

      if (existente) {
        await supabase.from('wms_ubicaciones').update({ cantidad: existente.cantidad + parseInt(cantidadTransferir) }).eq('id', existente.id);
      } else {
        const { id, created_at, ...rest } = selectedItem;
        await supabase.from('wms_ubicaciones').insert({
            ...rest,
            ubicacion: destinoUbicacion,
            cantidad: parseInt(cantidadTransferir),
            pasillo: destinoUbicacion.split('-')[0] || 'GEN',
            columna: parseInt(destinoUbicacion.split('-')[1]) || 0,
            nivel: parseInt(destinoUbicacion.split('-')[2]) || 0,
            updated_at: new Date()
          });
      }
      return true;
    },
    onSuccess: () => {
      setStep(1);
      setOrigenSearch('');
      setDestinoSearch('');
      setSelectedItem(null);
      toast.success("Transferencia realizada con éxito ✅");
      queryClient.invalidateQueries(['transferHistory']);
    },
    onError: (err) => {
      toast.error("Error al procesar transferencia: " + err.message);
    }
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-wms-dark p-4 sm:p-6 lg:p-8 text-slate-300">
      
      {/* Header Glassmorphism */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <ArrowLeftRight size={24} />
            </div>
            Transferencias WMS
          </h1>
          <p className="text-slate-400 text-sm mt-1 ml-1">Mover inventario entre ubicaciones</p>
        </div>
        <button className="bg-wms-dark/80 border border-wms-border text-slate-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:border-blue-500 hover:text-blue-400 transition-colors">
          <History size={16} /> Ver Historial
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel Principal - Wizard */}
        <div className="lg:col-span-2">
          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-wms-border overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
            
            {/* Progress Bar */}
            <div className="flex border-b border-wms-border relative z-10 bg-wms-dark/40">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={`flex-1 h-1.5 transition-all duration-500 ${step >= s ? 'bg-wms-neon shadow-neon-green' : 'bg-wms-dark/50'}`}
                ></div>
              ))}
            </div>

            <div className="p-6 sm:p-8 min-h-[400px] relative z-10" ref={stepRef}>
              
              {/* PASO 1: ORIGEN */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-wms-dark/80 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <MapPin size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-white">¿Desde dónde quieres mover?</h2>
                    <p className="text-slate-400">Escanea o ingresa la ubicación de origen</p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <div className="relative flex items-center">
                      <ScanBarcode className="absolute left-4 text-wms-neon" size={20} />
                      <input
                        type="text"
                        value={origenSearch}
                        onChange={(e) => setOrigenSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscarOrigenMutation.mutate(origenSearch)}
                        placeholder="Ej: A-01-01"
                        className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-lg font-mono font-bold text-white focus:border-wms-neon focus:ring-1 focus:ring-wms-neon outline-none transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder-slate-600 shadow-inner"
                        autoFocus
                      />
                      <button 
                        onClick={() => buscarOrigenMutation.mutate(origenSearch)}
                        disabled={!origenSearch || buscarOrigenMutation.isPending}
                        className="absolute right-2 p-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                      >
                        {buscarOrigenMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                      </button>
                    </div>
                    <div className="mt-4 flex gap-2 justify-center flex-wrap">
                      <span className="px-3 py-1 bg-wms-dark/80 rounded-full text-xs font-bold text-slate-400 border border-slate-700">RECEPCION</span>
                      <span className="px-3 py-1 bg-wms-dark/80 rounded-full text-xs font-bold text-slate-400 border border-slate-700">MERMA</span>
                      <span className="px-3 py-1 bg-wms-dark/80 rounded-full text-xs font-bold text-slate-400 border border-slate-700">DEV_CLIENTE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: SELECCIONAR PRODUCTO */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Productos en <span className="text-wms-neon font-black bg-wms-neon/10 px-2 py-0.5 rounded border border-wms-neon/30">{origenUbicacion}</span></h2>
                    <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-wms-neon transition-colors">Cambiar Origen</button>
                  </div>

                  <div className="space-y-3">
                    {itemsOrigen.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => seleccionarItem(item)}
                        className="p-4 border border-wms-border bg-wms-dark/40 rounded-xl hover:border-wms-neon hover:bg-wms-dark/80 cursor-pointer transition-all group flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-wms-neon group-hover:border-wms-neon/50 transition-colors">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{item.descripcion || 'Sin Descripción'}</p>
                            <p className="text-xs font-mono text-slate-400">{item.codigo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-xl font-black text-wms-neon">{item.cantidad}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Unidades</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PASO 3: DESTINO Y CANTIDAD */}
              {step === 3 && selectedItem && (
                <div className="space-y-6">
                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30 flex items-center gap-4">
                    <div className="w-12 h-12 bg-wms-dark border border-blue-500/50 rounded-lg flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Moviendo</p>
                      <p className="font-bold text-white">{selectedItem.descripcion}</p>
                      <p className="text-xs text-slate-400 font-mono">{selectedItem.codigo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Cantidad a Mover</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={selectedItem.cantidad}
                          value={cantidadTransferir}
                          onChange={(e) => setCantidadTransferir(Math.min(parseInt(e.target.value) || 0, selectedItem.cantidad))}
                          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl font-mono text-lg font-bold text-center text-white outline-none focus:border-wms-neon focus:ring-1 focus:ring-wms-neon"
                        />
                        <button 
                          onClick={() => setCantidadTransferir(selectedItem.cantidad)}
                          className="px-3 py-3 bg-wms-dark/80 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs hover:border-wms-neon hover:text-wms-neon transition-colors"
                        >
                          MAX
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-center">Disponible: {selectedItem.cantidad}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Ubicación Destino</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 text-wms-neon" size={18} />
                        <input
                          type="text"
                          value={destinoSearch}
                          onChange={(e) => setDestinoSearch(e.target.value)}
                          placeholder="Ej: B-05-01"
                          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-wms-neon focus:ring-1 focus:ring-wms-neon font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder-slate-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 bg-wms-dark/80 border border-wms-border text-slate-300 font-bold rounded-xl hover:border-slate-500 transition-colors"
                    >
                      Atrás
                    </button>
                    <button 
                      onClick={verificarDestino}
                      disabled={!destinoSearch || cantidadTransferir <= 0}
                      className="flex-1 py-3 bg-blue-600/90 border border-blue-500 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 4: CONFIRMACIÓN */}
              {step === 4 && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 bg-wms-neon/10 border border-wms-neon/30 rounded-full flex items-center justify-center mx-auto text-wms-neon shadow-neon-green animate-pulse">
                    <CheckCircle size={40} />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black text-white">Confirmar Movimiento</h2>
                    <p className="text-slate-400">Verifica los detalles antes de procesar</p>
                  </div>

                  <div className="bg-wms-dark/60 p-6 rounded-2xl border border-slate-700 max-w-sm mx-auto space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-wms-neon"></div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">Origen</span>
                      <span className="font-mono font-bold text-wms-alert bg-wms-alert/10 border border-wms-alert/30 px-2 py-1 rounded">{origenUbicacion}</span>
                    </div>
                    
                    <div className="flex justify-center text-slate-500">
                      <ArrowRight size={20} className="transform rotate-90" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">Destino</span>
                      <span className="font-mono font-bold text-wms-neon bg-wms-neon/10 border border-wms-neon/30 px-2 py-1 rounded">{destinoUbicacion}</span>
                    </div>

                    <div className="pt-4 border-t border-slate-700 mt-4">
                      <p className="text-sm text-slate-300 font-medium mb-1">{selectedItem.descripcion}</p>
                      <p className="text-3xl font-black text-white">{cantidadTransferir} <span className="text-xs font-bold text-slate-500 align-middle">UNIDADES</span></p>
                    </div>
                  </div>

                  <div className="flex gap-3 max-w-sm mx-auto">
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 bg-wms-dark/80 border border-slate-700 text-slate-300 font-bold rounded-xl hover:border-slate-500 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => confirmarTransferenciaMutation.mutate()}
                      disabled={confirmarTransferenciaMutation.isPending}
                      className="flex-1 py-3 bg-wms-neon/20 border border-wms-neon text-wms-neon font-bold rounded-xl hover:bg-wms-neon hover:text-wms-dark shadow-neon-green transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {confirmarTransferenciaMutation.isPending ? <Loader2 className="animate-spin" /> : 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Panel Lateral - Historial */}
        <div className="hidden lg:block">
          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-wms-border p-6 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-wms-alert/5 rounded-full blur-3xl"></div>
            <h3 className="font-bold text-white flex items-center gap-2 mb-6 relative z-10">
              <History size={18} className="text-wms-alert" />
              Últimos Movimientos
            </h3>

            <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-700 z-10">
              {historial.map((mov) => (
                <div key={mov.id} className="relative group">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-wms-dark border-2 border-wms-alert group-hover:bg-wms-alert transition-colors"></div>
                  <div className="bg-wms-dark/60 p-3 rounded-xl border border-slate-700 group-hover:border-wms-alert/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-400">{mov.hora} • {mov.usuario}</span>
                      <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">INT</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 mb-1 line-clamp-1">{mov.producto}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>{mov.origen}</span>
                      <ArrowRight size={10} className="text-wms-alert" />
                      <span className="text-wms-neon font-bold">{mov.destino}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Transfers;
