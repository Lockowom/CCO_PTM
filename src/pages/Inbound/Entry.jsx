import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { PackagePlus, Search, QrCode, Trash2, Save, Wifi, WifiOff, Box, AlertCircle, Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';

const Entry = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Refs for animations
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const listRef = useRef(null);
  const queueItemsRef = useRef([]);
  const headerRef = useRef(null);

  // Form State
  const [form, setForm] = useState({
    ubicacion: '', // OBLIGATORIO, MAX 8
    codigo: '',    // OBLIGATORIO, MAX 12, UPPERCASE
    serie: '',     // OPCIONAL
    partida: '',   // OPCIONAL
    pieza: '',     // OPCIONAL (PIEZA DEL PRODUCTO)
    fecha_vencimiento: '', // OPCIONAL (CALENDARIO)
    talla: '',     // OPCIONAL
    color: '',     // OPCIONAL
    cantidad: '',  // OBLIGATORIO
    descripcion: '' // AUTOMATICO
  });

  const codigoInputRef = useRef(null);
  const cantidadInputRef = useRef(null);

  // Initial Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      // Form animation
      gsap.from(formRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out"
      });

      // List container animation
      gsap.from(listRef.current, {
        x: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

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
  }, [queue.length]); // Triggers when item added

  // Cargar cola local al inicio
  useEffect(() => {
    const saved = localStorage.getItem('wms_entry_queue');
    if (saved) {
      try {
        setQueue(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing queue", e);
      }
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
      
      // Animate loading spinner
      gsap.to(".loading-spinner", { rotation: 360, repeat: -1, duration: 1, ease: "linear" });

      try {
        // 1. Intentar buscar en MATRIZ DE CODIGOS (tms_matriz_codigos) - PRIORIDAD
        let { data, error } = await supabase
          .from('tms_matriz_codigos')
          .select('producto')
          .eq('codigo_producto', form.codigo)
          .maybeSingle();

        if (data && data.producto) {
          setForm(prev => ({ ...prev, descripcion: data.producto }));
          // Flash success on description field
          gsap.fromTo(".desc-field", { backgroundColor: "#d1fae5" }, { backgroundColor: "#f8fafc", duration: 1 });
        } else {
          // 2. Si no está en maestro, buscar en historial de ubicaciones como fallback
          const { data: dataWms } = await supabase
            .from('wms_ubicaciones')
            .select('descripcion')
            .eq('codigo', form.codigo)
            .limit(1)
            .maybeSingle();
            
          if (dataWms && dataWms.descripcion) {
             setForm(prev => ({ ...prev, descripcion: dataWms.descripcion }));
             gsap.fromTo(".desc-field", { backgroundColor: "#d1fae5" }, { backgroundColor: "#f8fafc", duration: 1 });
          } else {
             // NO ENCONTRADO
             setForm(prev => ({ ...prev, descripcion: '' }));
             setError("SKU NO ENCONTRADO");
             // Shake animation for error
             gsap.to(codigoInputRef.current, { x: [-5, 5, -5, 5, 0], duration: 0.4 });
          }
        }
      } catch (err) {
        console.error("Error buscando descripción:", err);
      } finally {
        setLoadingDesc(false);
        gsap.killTweensOf(".loading-spinner");
      }
    };

    const timer = setTimeout(fetchDescription, 800); // Debounce de 800ms
    return () => clearTimeout(timer);
  }, [form.codigo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Validaciones específicas
    if (name === 'ubicacion') {
      finalValue = value.toUpperCase().slice(0, 8); // Max 8 chars
    } else if (name === 'codigo') {
      finalValue = value.toUpperCase().slice(0, 12); // Max 12 chars, Uppercase
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

    setQueue([newItem, ...queue]); // Agregar al principio
    
    // Animate button press
    gsap.fromTo(".add-btn", { scale: 0.95 }, { scale: 1, duration: 0.2, ease: "power2.out" });

    // Resetear formulario parcial (mantener ubicación para agilizar)
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
    
    // Focus al código para seguir escaneando
    if (codigoInputRef.current) codigoInputRef.current.focus();
  };

  const removeFromQueue = (id, index) => {
    // Animate removal
    const el = queueItemsRef.current[index];
    gsap.to(el, {
      x: 50,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setQueue(queue.filter(item => item.id !== id));
        // Reset transform for reused elements
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

  const handleSync = async () => {
    if (queue.length === 0) return;
    
    setSaving(true);
    try {
      // Preparar datos para inserción en wms_ubicaciones
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
        // fecha_ingreso: new Date().toISOString() // Si la tabla tiene columna de fecha
      }));

      const { error } = await supabase
        .from('wms_ubicaciones')
        .insert(rowsToInsert);

      if (error) throw error;

      // GUARDAR EN HISTORIAL DE CARGAS (AUDITORÍA)
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
        } catch (logErr) {
          console.error('Error guardando en historial:', logErr);
          // No lanzamos error para no interrumpir el flujo principal si el log falla
        }
      }

      // Success Animation
      setSuccessMsg(`✅ ${queue.length} registros guardados correctamente.`);
      gsap.to(listRef.current, { y: 10, duration: 0.1, yoyo: true, repeat: 1 });
      
      setTimeout(() => {
        setQueue([]);
        setSuccessMsg(null);
      }, 2000);

    } catch (err) {
      console.error("Error guardando:", err);
      alert("❌ Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Línea superior decorativa */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <PackagePlus size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ingreso de <span className="text-orange-500">Mercancía</span></h2>
            <p className="text-slate-500 font-medium mt-1">Registro manual de entradas a ubicaciones</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-2xl border font-bold shadow-sm transition-all relative z-10 ${isOnline ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
           {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
           {isOnline ? 'SISTEMA EN LÍNEA' : 'SIN CONEXIÓN'}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Formulario de Ingreso */}
        <div className="xl:col-span-1 space-y-6">
          <div ref={formRef} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-200 relative overflow-hidden group transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500"></div>
            
            <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold shadow-inner">1</span>
              DATOS DEL PRODUCTO
            </h3>

            <form onSubmit={addToQueue} className="space-y-5">
              {/* UBICACION */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Ubicación <span className="text-red-500">*</span> (Max 8)
                </label>
                <div className="relative group/input">
                  <input 
                    type="text" 
                    name="ubicacion"
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-mono font-bold uppercase focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-slate-300"
                    placeholder="A-01-01"
                    value={form.ubicacion}
                    onChange={handleInputChange}
                    maxLength={8}
                    required 
                    autoFocus
                  />
                  <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-orange-500 transition-colors" size={20} />
                </div>
              </div>

              {/* CODIGO */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Código <span className="text-red-500">*</span> (Max 12)
                </label>
                <div className="relative group/input">
                  <input 
                    ref={codigoInputRef}
                    type="text" 
                    name="codigo"
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-mono font-bold uppercase focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-slate-300"
                    placeholder="SKU-123..."
                    value={form.codigo}
                    onChange={handleInputChange}
                    maxLength={12}
                    required 
                  />
                  {loadingDesc ? (
                    <Loader2 className="loading-spinner absolute right-3 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                  ) : (
                    <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-orange-500 transition-colors" size={20} />
                  )}
                </div>
              </div>

              {/* DESCRIPCION (AUTO) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                  Descripción (Automático)
                </label>
                <textarea 
                  name="descripcion"
                  rows="2"
                  className="desc-field w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 resize-none focus:outline-none focus:bg-white transition-colors"
                  placeholder="Se llenará automáticamente al ingresar el código..."
                  value={form.descripcion}
                  readOnly
                  tabIndex="-1"
                />
              </div>

              {/* CANTIDAD */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Cantidad Contada <span className="text-red-500">*</span>
                </label>
                <input 
                  ref={cantidadInputRef}
                  type="number" 
                  name="cantidad"
                  className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xl font-bold text-slate-800 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                  value={form.cantidad}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              {/* CAMPOS OPCIONALES (Accordion style or Grid) */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Detalles Opcionales</p>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* SERIE */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Serie</label>
                    <input type="text" name="serie" value={form.serie} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-orange-400 outline-none transition-all" placeholder="S/N..." />
                  </div>

                  {/* PARTIDA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Partida</label>
                    <input type="text" name="partida" value={form.partida} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-orange-400 outline-none transition-all" placeholder="Lote..." />
                  </div>

                  {/* PIEZA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pieza</label>
                    <input type="text" name="pieza" value={form.pieza} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-orange-400 outline-none transition-all" placeholder="Ej: Motor..." />
                  </div>

                  {/* VENCIMIENTO */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vencimiento</label>
                    <div className="relative">
                      <input type="date" name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-orange-400 outline-none transition-all" />
                      <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  {/* TALLA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Talla</label>
                    <input type="text" name="talla" value={form.talla} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-orange-400 outline-none transition-all" placeholder="S, M, L..." />
                  </div>

                  {/* COLOR */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Color</label>
                    <input type="text" name="color" value={form.color} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-orange-400 outline-none transition-all" placeholder="Rojo..." />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-2 shadow-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button className="add-btn w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-orange-500 hover:to-amber-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-slate-900/20 hover:shadow-orange-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <PackagePlus size={24} className="group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">AGREGAR A COLA</span>
              </button>
            </form>
          </div>
        </div>

        {/* Cola de Registros */}
        <div className="xl:col-span-2 h-full">
          <div ref={listRef} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-200 flex flex-col h-[800px] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-300"></div>

            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm sticky top-0 z-20">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold shadow-inner">2</span>
                    COLA DE PROCESAMIENTO
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 shadow-sm">{queue.length} ÍTEMS</span>
                </h3>
                <button 
                  onClick={clearQueue} 
                  disabled={queue.length===0} 
                  className="px-4 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                    <Trash2 size={16} /> VACIAR TODO
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {queue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4 shadow-inner">
                          <Box size={48} className="opacity-20" />
                        </div>
                        <p className="font-bold text-lg">La cola está vacía</p>
                        <p className="text-sm">Agrega productos usando el formulario</p>
                    </div>
                ) : (
                    queue.map((item, index) => (
                        <div 
                          key={item.id} 
                          ref={el => queueItemsRef.current[index] = el}
                          className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center relative overflow-hidden"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0 shadow-inner group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                {queue.length - index}
                            </div>
                            
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ubicación</p>
                                    <p className="font-mono font-bold text-slate-800 text-lg group-hover:text-orange-800 transition-colors">{item.ubicacion}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código</p>
                                    <p className="font-mono font-bold text-orange-600 text-lg">{item.codigo}</p>
                                    {item.descripcion && <p className="text-xs text-slate-500 truncate max-w-[150px]">{item.descripcion}</p>}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cantidad</p>
                                    <p className="font-black text-slate-900 text-lg">{item.cantidad}</p>
                                </div>
                                <div className="hidden md:block">
                                   {/* Detalles extra */}
                                   {(item.serie || item.lote || item.fecha_vencimiento) && (
                                     <div className="flex flex-wrap gap-1">
                                       {item.serie && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] border border-blue-100">S: {item.serie}</span>}
                                       {item.partida && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] border border-purple-100">P: {item.partida}</span>}
                                       {item.fecha_vencimiento && <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] border border-orange-100">V: {item.fecha_vencimiento}</span>}
                                     </div>
                                   )}
                                </div>
                            </div>

                            <button onClick={() => removeFromQueue(item.id, index)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-90">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white relative z-20">
                {successMsg && (
                  <div className="absolute -top-12 left-0 right-0 mx-6 bg-orange-600 text-white py-2 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <CheckCircle2 size={18} />
                    <span className="font-bold text-sm">{successMsg}</span>
                  </div>
                )}
                
                <button 
                    onClick={handleSync}
                    disabled={queue.length === 0 || saving}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white py-4 rounded-2xl font-black text-lg disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 transition-all shadow-lg shadow-orange-500/30 disabled:shadow-none flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {saving ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        GUARDANDO...
                      </>
                    ) : (
                      <>
                        <Save size={24} />
                        GUARDAR EN UBICACIONES ({queue.length})
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
