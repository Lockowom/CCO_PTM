import React, { useState, useEffect, useRef } from 'react';
import { PackagePlus, Search, QrCode, Trash2, Save, Wifi, WifiOff, Box, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';

const Entry = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for animations
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const listRef = useRef(null);
  const queueItemsRef = useRef([]);

  // Form State
  const [form, setForm] = useState({
    ubicacion: '',
    codigo: '',
    serie: '',
    partida: '',
    pieza: '',
    fecha_vencimiento: '',
    talla: '',
    color: '',
    cantidad: '',
    descripcion: ''
  });

  const codigoInputRef = useRef(null);
  const cantidadInputRef = useRef(null);

  // Initial Animation
  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: "power3.out",
      clearProps: 'all'
    });
  }, { scope: containerRef });

  // Queue Item Animation (Enter)
  useEffect(() => {
    if (queue.length > 0) {
      const firstItem = queueItemsRef.current[0];
      if (firstItem) {
        gsap.fromTo(firstItem,
          { y: -20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
        );
      }
    }
  }, [queue.length]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Cargar cola local al inicio
  useEffect(() => {
    const saved = localStorage.getItem('wms_entry_queue');
    if (saved) {
      try {
        setQueue(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  // Guardar cola al cambiar
  useEffect(() => {
    localStorage.setItem('wms_entry_queue', JSON.stringify(queue));
  }, [queue]);

  // Buscar descripción al cambiar el código (Debounce o Blur)
  useEffect(() => {
    const fetchDescription = async () => {
      if (!form.codigo || form.codigo.length < 3) return;
      
      setLoadingDesc(true);
      setError(null);
      
      gsap.to(".loading-spinner", { rotation: 360, repeat: -1, duration: 1, ease: "linear" });

      try {
        let { data } = await supabase
          .from('tms_matriz_codigos')
          .select('producto')
          .eq('codigo_producto', form.codigo)
          .maybeSingle();

        if (data && data.producto) {
          setForm(prev => ({ ...prev, descripcion: data.producto }));
          gsap.fromTo(".desc-field", { backgroundColor: "#10b98120" }, { backgroundColor: "transparent", duration: 1 });
        } else {
          const { data: dataWms } = await supabase
            .from('wms_ubicaciones')
            .select('descripcion')
            .eq('codigo', form.codigo)
            .limit(1)
            .maybeSingle();
            
          if (dataWms && dataWms.descripcion) {
             setForm(prev => ({ ...prev, descripcion: dataWms.descripcion }));
             gsap.fromTo(".desc-field", { backgroundColor: "#10b98120" }, { backgroundColor: "transparent", duration: 1 });
          } else {
             setForm(prev => ({ ...prev, descripcion: '' }));
             setError("SKU NO ENCONTRADO");
             gsap.to(codigoInputRef.current, { x: [-5, 5, -5, 5, 0], duration: 0.4 });
          }
        }
      } catch (_) {
      } finally {
        setLoadingDesc(false);
        gsap.killTweensOf(".loading-spinner");
      }
    };

    const timer = setTimeout(fetchDescription, 800);
    return () => clearTimeout(timer);
  }, [form.codigo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'ubicacion') {
      finalValue = value.toUpperCase().slice(0, 8);
    } else if (name === 'codigo') {
      finalValue = value.toUpperCase().slice(0, 12);
    }

    setForm(prev => ({ ...prev, [name]: finalValue }));
  };

  const addToQueue = (e) => {
    e.preventDefault();
    if (!form.ubicacion || !form.codigo || !form.cantidad) {
      setError("Faltan campos obligatorios (Ubicación, Código, Cantidad)");
      gsap.to(formRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 });
      return;
    }

    const newItem = {
      id: Date.now(),
      ...form,
      timestamp: new Date().toISOString()
    };

    setQueue([newItem, ...queue]);
    
    gsap.fromTo(".add-btn", { scale: 0.95 }, { scale: 1, duration: 0.2, ease: "power2.out" });

    setForm(prev => ({
      ...prev,
      codigo: '',
      serie: '',
      partida: '',
      pieza: '',
      fecha_vencimiento: '',
      talla: '',
      color: '',
      cantidad: '',
      descripcion: ''
    }));
    setError(null);
    
    if (codigoInputRef.current) codigoInputRef.current.focus();
  };

  const removeFromQueue = (id, index) => {
    const el = queueItemsRef.current[index];
    gsap.to(el, {
      x: 50,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setQueue(queue.filter(item => item.id !== id));
        gsap.set(el, { x: 0, opacity: 1 });
      }
    });
  };

  const clearQueue = () => {
    if (window.confirm('¿Limpiar toda la cola?')) {
      gsap.to(queueItemsRef.current, {
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.3,
        onComplete: () => setQueue([])
      });
    }
  };

  const syncMutation = useMutation({
    mutationFn: async () => {
      const rowsToInsert = queue.map(item => ({
        ubicacion: item.ubicacion,
        codigo: item.codigo,
        descripcion: item.descripcion,
        cantidad: parseFloat(item.cantidad),
        serie: item.serie || null,
        partida: item.partida || null,
        pieza: item.pieza || null,
        fecha_vencimiento: item.fecha_vencimiento || null,
        talla: item.talla || null,
        color: item.color || null,
      }));

      const { error } = await supabase
        .from('wms_ubicaciones')
        .insert(rowsToInsert);

      if (error) throw error;

      if (user) {
        try {
          await supabase.from('tms_historial_cargas').insert([{
            usuario_id: user.id,
            usuario_nombre: user.nombre || user.email || 'Usuario Desconocido',
            modulo: 'Ingreso Manual WMS',
            tabla_destino: 'wms_ubicaciones',
            registros_totales: queue.length,
            registros_nuevos: queue.length,
            registros_actualizados: 0,
            registros_error: 0
          }]);
        } catch (_) {}
      }
    },
    onSuccess: () => {
      toast.success(`✅ ${queue.length} registros guardados correctamente.`);
      gsap.to(listRef.current, { y: 10, duration: 0.1, yoyo: true, repeat: 1 });
      setQueue([]);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err) => {
      toast.error("❌ Error al guardar: " + err.message);
    }
  });

  const handleSync = () => {
    if (queue.length === 0) return;
    syncMutation.mutate();
  };

  return (
    <div ref={containerRef} className="space-y-6 min-h-screen bg-slate-50 p-6 text-slate-700 pb-20">
      {/* Header Glassmorphism */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-wms-alert/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-slate-50/80 border border-wms-alert/50 rounded-2xl flex items-center justify-center text-wms-alert shadow-neon-orange">
            <PackagePlus size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ingreso de <span className="text-wms-alert">Mercancía</span></h2>
            <p className="text-slate-500 font-medium mt-1">Registro manual de entradas a ubicaciones</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-2xl border font-bold shadow-sm transition-all relative z-10 ${isOnline ? 'bg-wms-neon/10 text-wms-neon border-wms-neon/30' : 'bg-wms-danger/10 text-wms-danger border-wms-danger/30'}`}>
           {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
           {isOnline ? 'SISTEMA EN LÍNEA' : 'SIN CONEXIÓN'}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Formulario de Ingreso */}
        <div className="xl:col-span-1 space-y-6">
          <div ref={formRef} className="bg-white backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
            
            <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-wms-alert/20 border border-wms-alert/50 flex items-center justify-center text-wms-alert text-sm font-black shadow-md">1</span>
              DATOS DEL PRODUCTO
            </h3>

            <form onSubmit={addToQueue} className="space-y-5">
              {/* UBICACION */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Ubicación <span className="text-wms-danger">*</span> (Max 8)
                </label>
                <div className="relative group/input">
                  <input 
                    type="text" 
                    name="ubicacion"
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-900 focus:border-wms-alert outline-none transition-all placeholder:text-slate-600 uppercase"
                    placeholder="A-01-01"
                    value={form.ubicacion}
                    onChange={handleInputChange}
                    maxLength={8}
                    required 
                    autoFocus
                  />
                  <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-wms-alert transition-colors" size={20} />
                </div>
              </div>

              {/* CODIGO */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Código <span className="text-wms-danger">*</span> (Max 12)
                </label>
                <div className="relative group/input">
                  <input 
                    ref={codigoInputRef}
                    type="text" 
                    name="codigo"
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-900 focus:border-wms-alert outline-none transition-all placeholder:text-slate-600 uppercase"
                    placeholder="SKU-123..."
                    value={form.codigo}
                    onChange={handleInputChange}
                    maxLength={12}
                    required 
                  />
                  {loadingDesc ? (
                    <Loader2 className="loading-spinner absolute right-3 top-1/2 -translate-y-1/2 text-wms-alert" size={20} />
                  ) : (
                    <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-wms-alert transition-colors" size={20} />
                  )}
                </div>
              </div>

              {/* DESCRIPCION (AUTO) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Descripción (Automático)
                </label>
                <textarea 
                  name="descripcion"
                  rows="2"
                  className="desc-field w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 resize-none focus:outline-none transition-colors"
                  placeholder="Se llenará automáticamente..."
                  value={form.descripcion}
                  readOnly
                  tabIndex="-1"
                />
              </div>

              {/* CANTIDAD */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Cantidad Contada <span className="text-wms-danger">*</span>
                </label>
                <input 
                  ref={cantidadInputRef}
                  type="number" 
                  name="cantidad"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-wms-neon focus:border-wms-neon outline-none transition-all"
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                  value={form.cantidad}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              {/* CAMPOS OPCIONALES */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Detalles Opcionales</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* SERIE */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Serie</label>
                    <input type="text" name="serie" value={form.serie} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-wms-alert outline-none placeholder:text-slate-600" placeholder="S/N..." />
                  </div>
                  {/* PARTIDA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Partida</label>
                    <input type="text" name="partida" value={form.partida} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-wms-alert outline-none placeholder:text-slate-600" placeholder="Lote..." />
                  </div>
                  {/* PIEZA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pieza</label>
                    <input type="text" name="pieza" value={form.pieza} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-wms-alert outline-none placeholder:text-slate-600" placeholder="Ej: Motor..." />
                  </div>
                  {/* VENCIMIENTO */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vencimiento</label>
                    <div className="relative">
                      <input type="date" name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-wms-alert outline-none" />
                    </div>
                  </div>
                  {/* TALLA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Talla</label>
                    <input type="text" name="talla" value={form.talla} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-wms-alert outline-none placeholder:text-slate-600" placeholder="S, M, L..." />
                  </div>
                  {/* COLOR */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Color</label>
                    <input type="text" name="color" value={form.color} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-wms-alert outline-none placeholder:text-slate-600" placeholder="Rojo..." />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-wms-danger/10 border border-wms-danger/30 rounded-lg flex items-center gap-2 text-sm text-wms-danger">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button className="add-btn w-full bg-wms-alert/20 border border-wms-alert hover:bg-wms-alert text-wms-alert hover:text-wms-dark py-4 rounded-2xl font-black text-lg shadow-neon-orange transition-all active:scale-95 flex items-center justify-center gap-2 mt-6">
                <PackagePlus size={24} />
                <span>AGREGAR A COLA</span>
              </button>
            </form>
          </div>
        </div>

        {/* Cola de Registros */}
        <div className="xl:col-span-2 h-full">
          <div ref={listRef} className="bg-white backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 flex flex-col h-[800px] relative overflow-hidden">

            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/40 sticky top-0 z-20">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-wms-alert/20 border border-wms-alert/50 flex items-center justify-center text-wms-alert text-sm font-black shadow-md">2</span>
                    COLA DE PROCESAMIENTO
                    <span className="bg-wms-alert/20 text-wms-alert px-3 py-1 rounded-full text-xs font-bold border border-wms-alert/30">{queue.length} ÍTEMS</span>
                </h3>
                <button 
                  onClick={clearQueue} 
                  disabled={queue.length===0} 
                  className="px-4 py-2 rounded-lg text-xs font-bold text-wms-danger hover:bg-wms-danger/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Trash2 size={16} /> VACIAR TODO
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                {queue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4">
                          <Box size={48} className="opacity-20" />
                        </div>
                        <p className="font-bold text-lg text-slate-900">La cola está vacía</p>
                        <p className="text-sm">Agrega productos usando el formulario</p>
                    </div>
                ) : (
                    queue.map((item, index) => (
                        <div 
                          key={item.id} 
                          ref={el => queueItemsRef.current[index] = el}
                          className="group bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-wms-alert/50 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center relative overflow-hidden"
                        >
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold text-slate-500 shrink-0 group-hover:bg-wms-alert/20 group-hover:text-wms-alert transition-colors">
                                {queue.length - index}
                            </div>
                            
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ubicación</p>
                                    <p className="font-mono font-bold text-slate-900 text-lg group-hover:text-wms-alert transition-colors">{item.ubicacion}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Código</p>
                                    <p className="font-mono font-bold text-wms-alert text-lg">{item.codigo}</p>
                                    {item.descripcion && <p className="text-xs text-slate-500 truncate max-w-[150px]">{item.descripcion}</p>}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cantidad</p>
                                    <p className="font-black text-wms-neon text-lg">{item.cantidad}</p>
                                </div>
                                <div className="hidden md:block">
                                   {(item.serie || item.partida || item.fecha_vencimiento) && (
                                     <div className="flex flex-wrap gap-1">
                                       {item.serie && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] border border-blue-500/30">S: {item.serie}</span>}
                                       {item.partida && <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] border border-purple-500/30">P: {item.partida}</span>}
                                       {item.fecha_vencimiento && <span className="px-1.5 py-0.5 bg-wms-alert/20 text-wms-alert rounded text-[10px] border border-wms-alert/30">V: {item.fecha_vencimiento}</span>}
                                     </div>
                                   )}
                                </div>
                            </div>

                            <button onClick={() => removeFromQueue(item.id, index)} className="p-2 text-slate-500 hover:text-wms-danger hover:bg-wms-danger/20 rounded-lg transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-white relative z-20">
                <button 
                    onClick={handleSync}
                    disabled={queue.length === 0 || syncMutation.isPending}
                    className="w-full bg-wms-alert/20 border border-wms-alert hover:bg-wms-alert text-wms-alert hover:text-wms-dark py-4 rounded-2xl font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-neon-orange flex items-center justify-center gap-3"
                >
                    {syncMutation.isPending ? (
                      <>
                        <Loader2 size={24} className="animate-spin" /> GUARDANDO...
                      </>
                    ) : (
                      <>
                        <Save size={24} /> GUARDAR EN UBICACIONES ({queue.length})
                      </>
                    )}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entry;
