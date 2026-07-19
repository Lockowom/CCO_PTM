import React, { useState, useEffect, useRef } from 'react';
import { PackagePlus, Search, QrCode, Trash2, Save, Wifi, WifiOff, Box, AlertCircle, Loader2, AlertTriangle, Camera } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueUpsert } from '../../lib/syncManager';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';

const Entry = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { startScan, isScanning, isSupportedDevice } = useBarcodeScanner();
  const [queue, setQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [error, setError] = useState(null);
  const [ubicacionWarning, setUbicacionWarning] = useState(null);

  // Refs for animations
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const listRef = useRef(null);
  const queueItemsRef = useRef([]);

  // Subscribe to realtime changes on wms_ubicaciones
  useRealtimeTable('wms_ubicaciones', [['inventory']]);

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
      } catch (_) { console.error('Entry data load error:', _); }
    }
  }, []);

  // Guardar cola al cambiar
  useEffect(() => {
    localStorage.setItem('wms_entry_queue', JSON.stringify(queue));
  }, [queue]);

  // ── BÚSQUEDA DE DESCRIPCIÓN (fix: useRef para evitar reset por re-renders) ──
  const descCacheRef = useRef(new Map()); // Caché local SKU → descripción
  const descAbortRef = useRef(null);      // AbortController para cancelar fetch anterior
  const descTimerRef = useRef(null);      // Timer del debounce
  const lastCodigoRef = useRef('');       // Último código procesado

  useEffect(() => {
    const codigo = form.codigo;

    // Limpiar timer anterior (debounce manual con ref, inmune a re-renders)
    if (descTimerRef.current) clearTimeout(descTimerRef.current);

    // Si código vacío o muy corto, limpiar
    if (!codigo || codigo.length < 3) {
      setLoadingDesc(false);
      if (lastCodigoRef.current && !codigo) {
        setForm(prev => ({ ...prev, descripcion: '' }));
        setError(null);
      }
      lastCodigoRef.current = codigo;
      return;
    }

    // Si ya buscamos este código, no repetir
    if (codigo === lastCodigoRef.current) return;

    // Revisar caché primero (instantáneo)
    if (descCacheRef.current.has(codigo)) {
      const cached = descCacheRef.current.get(codigo);
      setForm(prev => ({ ...prev, descripcion: cached || '' }));
      setError(cached ? null : 'SKU NO ENCONTRADO');
      setLoadingDesc(false);
      lastCodigoRef.current = codigo;
      return;
    }

    // Debounce: esperar 400ms después de último cambio
    descTimerRef.current = setTimeout(async () => {
      // Cancelar request anterior si existe
      if (descAbortRef.current) descAbortRef.current.abort();
      const controller = new AbortController();
      descAbortRef.current = controller;

      setLoadingDesc(true);
      setError(null);

      try {
        // 1. Buscar en matriz de códigos (tiene índice PK, muy rápido)
        const { data, error: err1 } = await supabase
          .from('tms_matriz_codigos')
          .select('producto')
          .eq('codigo_producto', codigo)
          .maybeSingle()
          .abortSignal(controller.signal);

        if (controller.signal.aborted) return;

        if (data?.producto) {
          descCacheRef.current.set(codigo, data.producto);
          setForm(prev => prev.codigo === codigo ? { ...prev, descripcion: data.producto } : prev);
          lastCodigoRef.current = codigo;
          setLoadingDesc(false);
          return;
        }

        // 2. Fallback: buscar en wms_ubicaciones
        const { data: dataWms } = await supabase
          .from('wms_ubicaciones')
          .select('descripcion')
          .eq('codigo', codigo)
          .limit(1)
          .maybeSingle()
          .abortSignal(controller.signal);

        if (controller.signal.aborted) return;

        if (dataWms?.descripcion) {
          descCacheRef.current.set(codigo, dataWms.descripcion);
          setForm(prev => prev.codigo === codigo ? { ...prev, descripcion: dataWms.descripcion } : prev);
        } else {
          descCacheRef.current.set(codigo, '');
          setForm(prev => prev.codigo === codigo ? { ...prev, descripcion: '' } : prev);
          setError('SKU NO ENCONTRADO');
        }

        lastCodigoRef.current = codigo;
      } catch (err) {
        if (err?.name === 'AbortError') return; // Cancelado intencionalmente
        console.error('Desc lookup error:', err);
      } finally {
        if (!controller.signal.aborted) setLoadingDesc(false);
      }
    }, 400);

    return () => {
      if (descTimerRef.current) clearTimeout(descTimerRef.current);
      // Abortar también el request en vuelo al desmontar/cambiar de código
      // (evita setState tras unmount → warning de React).
      if (descAbortRef.current) descAbortRef.current.abort();
    };
  }, [form.codigo]);

  // Validate ubicacion exists on blur
  const handleUbicacionBlur = async () => {
    if (!form.ubicacion || form.ubicacion.length < 3) {
      setUbicacionWarning(null);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('wms_ubicaciones')
        .select('ubicacion')
        .eq('ubicacion', form.ubicacion)
        .limit(1)
        .maybeSingle();

      if (queryError) {
        console.error('Ubicacion validation error:', queryError);
        return;
      }

      if (!data) {
        setUbicacionWarning('⚠ Ubicación no registrada en el sistema');
      } else {
        setUbicacionWarning(null);
      }
    } catch (_) {
      console.error('Ubicacion validation error:', _);
    }
  };

  // Escaneo por cámara - Ubicación
  const scanUbicacion = () => {
    startScan({
      onScan: (value) => {
        const val = value.toUpperCase().slice(0, 12);
        setForm(prev => ({ ...prev, ubicacion: val }));
        toast.success(`Ubicación escaneada: ${val}`);
        // Trigger blur validation
        setTimeout(handleUbicacionBlur, 200);
      },
      onError: (msg) => toast.error(msg)
    });
  };

  // Escaneo por cámara - Código
  const scanCodigo = () => {
    startScan({
      onScan: (value) => {
        const val = value.toUpperCase().slice(0, 20);
        setForm(prev => ({ ...prev, codigo: val }));
        toast.success(`Código escaneado: ${val}`);
      },
      onError: (msg) => toast.error(msg)
    });
  };

  // Escaneo por cámara - Serie
  const scanSerie = () => {
    if (isSupportedDevice) {
      startScan({
        onScan: (value) => {
          setForm(prev => ({ ...prev, serie: value.trim() }));
          toast.success(`Serie escaneada: ${value.trim()}`);
        },
        onError: (msg) => toast.error(msg)
      });
    } else {
      const val = window.prompt('Ingrese o pegue la Serie / S.N.:');
      if (val) {
        setForm(prev => ({ ...prev, serie: val.trim() }));
        toast.success(`Serie ingresada: ${val.trim()}`);
      }
    }
  };

  // Escaneo por cámara - Partida/Lote
  const scanPartida = () => {
    if (isSupportedDevice) {
      startScan({
        onScan: (value) => {
          setForm(prev => ({ ...prev, partida: value.trim() }));
          toast.success(`Partida escaneada: ${value.trim()}`);
        },
        onError: (msg) => toast.error(msg)
      });
    } else {
      const val = window.prompt('Ingrese o pegue la Partida / Lote:');
      if (val) {
        setForm(prev => ({ ...prev, partida: val.trim() }));
        toast.success(`Partida ingresada: ${val.trim()}`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'ubicacion') {
      finalValue = value.toUpperCase().slice(0, 12);
    } else if (name === 'codigo') {
      finalValue = value.toUpperCase().slice(0, 20);
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

    if (parseFloat(form.cantidad) <= 0) {
      setError("La cantidad debe ser mayor a 0");
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
    setUbicacionWarning(null);

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

      const { data: upsertedData, error } = await supabase
        .from('wms_ubicaciones')
        .upsert(rowsToInsert, { onConflict: 'ubicacion,codigo' })
        .select('id');

      if (error) throw error;

      // Count new vs updated based on response
      const registrosNuevos = upsertedData ? upsertedData.length : 0;
      const registrosActualizados = queue.length - registrosNuevos;

      if (user) {
        try {
          await supabase.from('tms_historial_cargas').insert([{
            usuario_id: user.id,
            usuario_nombre: user.nombre || user.email || 'Usuario Desconocido',
            modulo: 'Ingreso Manual WMS',
            tabla_destino: 'wms_ubicaciones',
            registros_totales: queue.length,
            registros_nuevos: registrosNuevos,
            registros_actualizados: registrosActualizados >= 0 ? registrosActualizados : 0,
            registros_error: 0
          }]);
        } catch (_) { console.error('Entry operation error:', _); }
      }
    },
    onSuccess: () => {
      toast.success(`✅ ${queue.length} registros guardados correctamente.`);
      gsap.to(listRef.current, { y: 10, duration: 0.1, yoyo: true, repeat: 1 });
      setQueue([]);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: async (err) => {
      // Si estamos offline o es error de red, encolar en Dexie para sync automático
      const isOfflineError = !navigator.onLine
        || err.message?.includes('Failed to fetch')
        || err.message?.includes('NetworkError')
        || err.message?.includes('ERR_INTERNET_DISCONNECTED')
        || err.code === 'PGRST301';

      if (isOfflineError) {
        try {
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

          const enqueued = await enqueueUpsert({
            tableName: 'wms_ubicaciones',
            data: rowsToInsert,
            onConflict: 'ubicacion,codigo',
            userId: user?.id || null,
          });

          if (enqueued) {
            toast.info(`📦 ${queue.length} registros guardados offline. Se sincronizarán al recuperar conexión.`, {
              duration: 6000,
            });
            setQueue([]);
          } else {
            toast.error('Cola offline llena. No se pudieron guardar los datos.');
          }
        } catch (offlineErr) {
          console.error('[Entry] Error al encolar offline:', offlineErr);
          toast.error('Error al guardar offline: ' + offlineErr.message);
        }
      } else {
        toast.error("Error al guardar: " + err.message);
      }
    }
  });

  const handleSync = async () => {
    if (queue.length === 0) return;
    if (!window.confirm(`¿Guardar ${queue.length} registros en ubicaciones?`)) return;

    // Si estamos offline, encolar directamente sin intentar Supabase
    if (!navigator.onLine) {
      try {
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

        const enqueued = await enqueueUpsert({
          tableName: 'wms_ubicaciones',
          data: rowsToInsert,
          onConflict: 'ubicacion,codigo',
          userId: user?.id || null,
        });

        if (enqueued) {
          toast.info(`📦 ${queue.length} registros guardados offline. Se sincronizarán automáticamente.`, {
            duration: 6000,
          });
          setQueue([]);
        } else {
          toast.error('Cola offline llena. Conecta a internet para sincronizar.');
        }
      } catch (err) {
        console.error('[Entry] Error al encolar offline:', err);
        toast.error('Error al guardar offline: ' + err.message);
      }
      return;
    }

    syncMutation.mutate();
  };

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 min-h-screen bg-slate-50 p-3 sm:p-6 text-slate-700 pb-20">
      {/* Header Glassmorphism */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-wms-alert/10 rounded-full blur-3xl"></div>

        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-50/80 border border-wms-alert/50 rounded-xl sm:rounded-2xl flex items-center justify-center text-wms-alert shadow-neon-orange flex-shrink-0">
            <PackagePlus size={22} className="sm:hidden" strokeWidth={2.5} />
            <PackagePlus size={28} className="hidden sm:block" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg sm:text-3xl font-black text-slate-900 tracking-tight">Ingreso de <span className="text-wms-alert">Mercancía</span></h2>
            <p className="text-slate-500 font-medium mt-0.5 sm:mt-1 text-xs sm:text-base">Registro de entradas a ubicaciones</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border font-bold shadow-sm transition-all relative z-10 ${isOnline ? 'bg-wms-neon/10 text-wms-neon border-wms-neon/30' : 'bg-wms-danger/10 text-wms-danger border-wms-danger/30'}`}>
           {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
           <span className="hidden sm:inline">{isOnline ? 'SISTEMA EN LÍNEA' : 'SIN CONEXIÓN'}</span>
           <span className="sm:hidden">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8">
        {/* Formulario de Ingreso */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6">
          <div ref={formRef} className="bg-white backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">

            <h3 className="font-black text-slate-900 text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-wms-alert/20 border border-wms-alert/50 flex items-center justify-center text-wms-alert text-xs sm:text-sm font-black shadow-md flex-shrink-0">1</span>
              DATOS DEL PRODUCTO
            </h3>

            <form onSubmit={addToQueue} className="space-y-4 sm:space-y-5">
              {/* UBICACION */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Ubicación <span className="text-wms-danger">*</span> (RACK-POS-NIVEL)
                </label>
                <div className="flex gap-2">
                  <div className="relative group/input flex-1">
                    <input
                      type="text"
                      name="ubicacion"
                      className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-900 focus:border-wms-alert outline-none transition-all placeholder:text-slate-600 uppercase"
                      placeholder="AA-01-01A"
                      value={form.ubicacion}
                      onChange={handleInputChange}
                      onBlur={handleUbicacionBlur}
                      maxLength={12}
                      required
                      autoFocus
                    />
                    <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-wms-alert transition-colors" size={20} />
                  </div>
                  {isSupportedDevice && (
                    <button
                      type="button"
                      onClick={scanUbicacion}
                      disabled={isScanning}
                      className="px-3.5 bg-wms-alert/20 border border-wms-alert text-wms-alert hover:bg-wms-alert hover:text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Escanear con cámara"
                    >
                      <Camera size={20} />
                    </button>
                  )}
                </div>
                {ubicacionWarning && (
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2 text-xs text-amber-700 font-medium">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    {ubicacionWarning}
                  </div>
                )}
              </div>

              {/* CODIGO */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Código <span className="text-wms-danger">*</span> (Max 20)
                </label>
                <div className="flex gap-2">
                  <div className="relative group/input flex-1">
                    <input
                      ref={codigoInputRef}
                      type="text"
                      name="codigo"
                      className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-900 focus:border-wms-alert outline-none transition-all placeholder:text-slate-600 uppercase"
                      placeholder="SKU-123..."
                      value={form.codigo}
                      onChange={handleInputChange}
                      maxLength={20}
                      required
                    />
                    {loadingDesc ? (
                      <Loader2 className="loading-spinner absolute right-3 top-1/2 -translate-y-1/2 text-wms-alert" size={20} />
                    ) : (
                      <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-wms-alert transition-colors" size={20} />
                    )}
                  </div>
                  {isSupportedDevice && (
                    <button
                      type="button"
                      onClick={scanCodigo}
                      disabled={isScanning}
                      className="px-3.5 bg-wms-alert/20 border border-wms-alert text-wms-alert hover:bg-wms-alert hover:text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Escanear con cámara"
                    >
                      <Camera size={20} />
                    </button>
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
              <div className="pt-3 sm:pt-4 border-t border-slate-200">
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-3 sm:mb-4 tracking-wider">Detalles Opcionales</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* SERIE */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Serie</label>
                    <div className="flex gap-1.5">
                      <input type="text" name="serie" value={form.serie} onChange={handleInputChange} className="flex-1 min-w-0 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-wms-alert outline-none placeholder:text-slate-600" placeholder="S/N..." />
                      <button type="button" onClick={scanSerie} disabled={isScanning} className="px-2.5 bg-wms-alert/10 border border-wms-alert/40 text-wms-alert hover:bg-wms-alert hover:text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0" title="Escanear Serie">
                        <Camera size={16} />
                      </button>
                    </div>
                  </div>
                  {/* PARTIDA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Partida</label>
                    <div className="flex gap-1.5">
                      <input type="text" name="partida" value={form.partida} onChange={handleInputChange} className="flex-1 min-w-0 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-wms-alert outline-none placeholder:text-slate-600" placeholder="Lote..." />
                      <button type="button" onClick={scanPartida} disabled={isScanning} className="px-2.5 bg-wms-alert/10 border border-wms-alert/40 text-wms-alert hover:bg-wms-alert hover:text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0" title="Escanear Partida">
                        <Camera size={16} />
                      </button>
                    </div>
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

              <button className="add-btn w-full bg-wms-alert/20 border border-wms-alert hover:bg-wms-alert text-wms-alert hover:text-wms-dark py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-neon-orange transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 sm:mt-6">
                <PackagePlus size={24} />
                <span>AGREGAR A COLA</span>
              </button>
            </form>
          </div>
        </div>

        {/* Cola de Registros */}
        <div className="xl:col-span-2 h-full">
          <div ref={listRef} className="bg-white backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 flex flex-col h-[500px] sm:h-[800px] relative overflow-hidden">

            <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/40 sticky top-0 z-20">
                <h3 className="font-black text-slate-900 text-sm sm:text-lg flex items-center gap-2 sm:gap-3">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-wms-alert/20 border border-wms-alert/50 flex items-center justify-center text-wms-alert text-xs sm:text-sm font-black shadow-md flex-shrink-0">2</span>
                    <span className="hidden sm:inline">COLA DE PROCESAMIENTO</span>
                    <span className="sm:hidden">COLA</span>
                    <span className="bg-wms-alert/20 text-wms-alert px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border border-wms-alert/30">{queue.length}</span>
                </h3>
                <button
                  onClick={clearQueue}
                  disabled={queue.length===0}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold text-wms-danger hover:bg-wms-danger/20 transition-colors flex items-center gap-1.5 sm:gap-2 disabled:opacity-50"
                >
                    <Trash2 size={14} /> <span className="hidden sm:inline">VACIAR TODO</span><span className="sm:hidden">VACIAR</span>
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
                    (() => { queueItemsRef.current = []; return null; })() ||
                    queue.map((item, index) => (
                        <div
                          key={item.id}
                          ref={el => { if (el) queueItemsRef.current[index] = el; }}
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
