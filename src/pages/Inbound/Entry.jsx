import { useState, useEffect, useRef } from 'react';
import {
  PackagePlus,
  QrCode,
  Trash2,
  Save,
  Wifi,
  WifiOff,
  Box,
  AlertCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSyncItem } from '../../lib/syncManager';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';

const Entry = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  // Put Away solo registra referencias visuales; no altera el inventario.
  useRealtimeTable('wms_ubicaciones', [['putaway_visual'], ['warehouse-data']]);

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
    descripcion: ''
  });

  const codigoInputRef = useRef(null);

  // Initial Animation
  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.out',
        clearProps: 'all'
      });
    },
    { scope: containerRef }
  );

  // Queue Item Animation (Enter)
  useEffect(() => {
    if (queue.length > 0) {
      const firstItem = queueItemsRef.current[0];
      if (firstItem) {
        gsap.fromTo(
          firstItem,
          { y: -20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
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
        const savedItems = JSON.parse(saved);
        setQueue(
          savedItems.map((item) => ({
            ...item,
            id:
              typeof item.id === 'string' &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                item.id
              )
                ? item.id
                : globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
          }))
        );
      } catch (_) {
        console.error('Entry data load error:', _);
      }
    }
  }, []);

  // Guardar cola al cambiar
  useEffect(() => {
    localStorage.setItem('wms_entry_queue', JSON.stringify(queue));
  }, [queue]);

  // ── BÚSQUEDA DE DESCRIPCIÓN (fix: useRef para evitar reset por re-renders) ──
  const descCacheRef = useRef(new Map()); // Caché local SKU → descripción
  const descAbortRef = useRef(null); // AbortController para cancelar fetch anterior
  const descTimerRef = useRef(null); // Timer del debounce
  const lastCodigoRef = useRef(''); // Último código procesado

  useEffect(() => {
    const codigo = form.codigo;

    // Limpiar timer anterior (debounce manual con ref, inmune a re-renders)
    if (descTimerRef.current) clearTimeout(descTimerRef.current);

    // Si código vacío o muy corto, limpiar
    if (!codigo || codigo.length < 3) {
      setLoadingDesc(false);
      if (lastCodigoRef.current && !codigo) {
        setForm((prev) => ({ ...prev, descripcion: '' }));
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
      setForm((prev) => ({ ...prev, descripcion: cached || '' }));
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
        const { data } = await supabase
          .from('tms_matriz_codigos')
          .select('producto')
          .eq('codigo_producto', codigo)
          .maybeSingle()
          .abortSignal(controller.signal);

        if (controller.signal.aborted) return;

        if (data?.producto) {
          descCacheRef.current.set(codigo, data.producto);
          setForm((prev) =>
            prev.codigo === codigo ? { ...prev, descripcion: data.producto } : prev
          );
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
          setForm((prev) =>
            prev.codigo === codigo ? { ...prev, descripcion: dataWms.descripcion } : prev
          );
        } else {
          descCacheRef.current.set(codigo, '');
          setForm((prev) => (prev.codigo === codigo ? { ...prev, descripcion: '' } : prev));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'ubicacion') {
      finalValue = value.toUpperCase().slice(0, 12);
    } else if (name === 'codigo') {
      finalValue = value.toUpperCase().slice(0, 20);
    }

    setForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const addToQueue = (e) => {
    e.preventDefault();
    if (!form.ubicacion || !form.codigo) {
      setError('Faltan campos obligatorios (Ubicación y Código)');
      gsap.to(formRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 });
      return;
    }

    const newItem = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      ...form,
      timestamp: new Date().toISOString()
    };

    setQueue([newItem, ...queue]);

    gsap.fromTo('.add-btn', { scale: 0.95 }, { scale: 1, duration: 0.2, ease: 'power2.out' });

    setForm((prev) => ({
      ...prev,
      codigo: '',
      serie: '',
      partida: '',
      pieza: '',
      fecha_vencimiento: '',
      talla: '',
      color: '',
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
        setQueue(queue.filter((item) => item.id !== id));
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

  const buildVisualLocationRows = (items) =>
    items.map((item) => ({
      ubicacion: item.ubicacion,
      codigo: item.codigo,
      descripcion: item.descripcion || null,
      serie: item.serie || null,
      partida: item.partida || null,
      pieza: item.pieza || null,
      fecha_vencimiento: item.fecha_vencimiento || null,
      talla: item.talla || null,
      color: item.color || null,
      creado_por: user?.id || null,
      creado_por_nombre: user?.nombre || user?.email || null
    }));

  const syncMutation = useMutation({
    mutationFn: async () => {
      const rowsToInsert = buildVisualLocationRows(queue);

      const { data: saved, error } = await supabase.rpc('registrar_putaway_ubicaciones', {
        p_items: rowsToInsert
      });

      if (error) throw error;
      if (!saved || Number(saved.guardados) !== rowsToInsert.length) {
        throw new Error('Supabase no confirmó todos los registros de Put Away');
      }

      if (user) {
        try {
          await supabase.from('tms_historial_cargas').insert([
            {
              usuario_id: user.id,
              usuario_nombre: user.nombre || user.email || 'Usuario Desconocido',
              modulo: 'Put Away visual',
              tabla_destino: 'wms_ubicaciones',
              registros_totales: queue.length,
              registros_nuevos: queue.length,
              registros_actualizados: 0,
              registros_error: 0
            }
          ]);
        } catch (_) {
          console.error('Entry operation error:', _);
        }
      }
      return { saved: rowsToInsert.length };
    },
    onSuccess: ({ saved }) => {
      toast.success(
        `✅ ${saved} ubicación(es) guardadas y verificadas. Ya están disponibles en Ubicaciones.`
      );
      gsap.to(listRef.current, { y: 10, duration: 0.1, yoyo: true, repeat: 1 });
      setQueue([]);
      queryClient.invalidateQueries({ queryKey: ['putaway_visual'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-data'] });
    },
    onError: async (err) => {
      // Si estamos offline o es error de red, encolar en Dexie para sync automático
      const isOfflineError =
        !navigator.onLine ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('ERR_INTERNET_DISCONNECTED') ||
        err.code === 'PGRST301';

      if (isOfflineError) {
        try {
          const rowsToInsert = buildVisualLocationRows(queue);

          const enqueued = await enqueueSyncItem({
            type: 'rpc',
            tableName: 'registrar_putaway_ubicaciones',
            recordId: `putaway_batch_${Date.now()}`,
            data: { p_items: rowsToInsert }
          });

          if (enqueued) {
            toast.info(
              `📦 ${queue.length} registros guardados offline. Se sincronizarán al recuperar conexión.`,
              {
                duration: 6000
              }
            );
            setQueue([]);
          } else {
            toast.error('Cola offline llena. No se pudieron guardar los datos.');
          }
        } catch (offlineErr) {
          console.error('[Entry] Error al encolar offline:', offlineErr);
          toast.error('Error al guardar offline: ' + offlineErr.message);
        }
      } else {
        toast.error('Error al guardar: ' + err.message);
      }
    }
  });

  const handleSync = async () => {
    if (queue.length === 0) return;
    if (
      !window.confirm(
        `¿Guardar ${queue.length} ubicaciones visuales? El inventario no se modificará.`
      )
    )
      return;

    // Si estamos offline, encolar directamente sin intentar Supabase
    if (!navigator.onLine) {
      try {
        const rowsToInsert = buildVisualLocationRows(queue);

        const enqueued = await enqueueSyncItem({
          type: 'rpc',
          tableName: 'registrar_putaway_ubicaciones',
          recordId: `putaway_batch_${Date.now()}`,
          data: { p_items: rowsToInsert }
        });

        if (enqueued) {
          toast.info(
            `📦 ${queue.length} registros guardados offline. Se sincronizarán automáticamente.`,
            {
              duration: 6000
            }
          );
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

  const requiredReady = Boolean(form.ubicacion && form.codigo);
  const BRAND = {
    navy: '#0D1B2A',
    blue: '#163D63',
    slate: '#475569',
    soft: '#E2E8F0',
    orange: '#FF6D00',
    amber: '#FFB26B',
    green: '#22C55E'
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-50 px-3 pb-20 pt-3 text-slate-700 sm:px-6 sm:pt-6"
    >
      <div className="mx-auto max-w-[1680px] space-y-4 sm:space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.35)] sm:p-6 md:p-8">
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${BRAND.navy} 0%, ${BRAND.blue} 35%, ${BRAND.orange} 72%, ${BRAND.amber} 100%)`
            }}
          />
          <div
            className="absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
            style={{ background: `${BRAND.orange}14` }}
          />
          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-[0_20px_35px_-28px_rgba(13,27,42,0.75)]"
                style={{
                  borderColor: `${BRAND.blue}30`,
                  background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.blue} 100%)`,
                  color: '#fff'
                }}
              >
                <PackagePlus size={28} strokeWidth={2.4} />
              </div>
              <div className="space-y-3">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{
                    border: `1px solid ${BRAND.soft}`,
                    background: '#fff',
                    color: BRAND.slate
                  }}
                >
                  <span
                    className="rounded-md px-2 py-0.5 text-[9px] text-white"
                    style={{ background: BRAND.orange }}
                  >
                    SYSTEM
                  </span>
                  CCO OPERACIONAL
                </div>
                <div>
                  <h2
                    className="text-2xl font-black tracking-tight sm:text-4xl"
                    style={{ color: BRAND.navy }}
                  >
                    Ingreso de <span style={{ color: BRAND.orange }}>Mercancía</span>
                  </h2>
                  <p
                    className="mt-1 text-sm font-medium sm:text-base"
                    style={{ color: BRAND.slate }}
                  >
                    Centro Control Operacional. Registra entradas en ubicaciones, valida SKU y
                    consolida la cola antes del guardado final.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[620px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: BRAND.slate }}
                >
                  Estado
                </div>
                <div
                  className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
                    isOnline
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                  {isOnline ? 'Sistema en línea' : 'Sin conexión'}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {isOnline
                    ? 'Las asignaciones visuales se enviarán a Supabase al guardar.'
                    : 'Se usará la cola offline y se sincronizará al recuperar conexión.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Cola actual
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-black tracking-tight text-slate-900">
                    {queue.length}
                  </span>
                  <span className="pb-1 text-xs font-semibold text-slate-400">registros</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {queue.length > 0
                    ? 'Asignaciones visuales listas para guardar sin cambiar el inventario.'
                    : 'La cola está limpia y lista para una nueva captura.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Captura
                </div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700">
                  {requiredReady ? (
                    <PackagePlus size={14} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={14} className="text-amber-500" />
                  )}
                  {requiredReady ? 'Lista para agregar' : 'Completa obligatorios'}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Solo se requiere ubicación y código para la referencia visual.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[430px_minmax(0,1fr)] xl:gap-6">
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
                    style={{
                      border: `1px solid ${BRAND.soft}`,
                      background: `${BRAND.blue}08`,
                      color: BRAND.blue
                    }}
                  >
                    Paso 1
                  </div>
                  <h3
                    className="mt-3 text-lg font-black tracking-tight sm:text-xl"
                    style={{ color: BRAND.navy }}
                  >
                    Datos del producto
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                    Asigna una ubicación visual al SKU. Este flujo no descuenta ni modifica
                    cantidades de inventario.
                  </p>
                </div>
                <div
                  className="rounded-2xl px-3 py-2 text-right"
                  style={{ border: `1px solid ${BRAND.soft}`, background: `${BRAND.orange}08` }}
                >
                  <div
                    className="text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: BRAND.slate }}
                  >
                    Flujo
                  </div>
                  <div className="mt-1 text-sm font-black" style={{ color: BRAND.navy }}>
                    Put Away
                  </div>
                </div>
              </div>

              <form ref={formRef} onSubmit={addToQueue} className="space-y-5">
                <div
                  className="grid grid-cols-2 gap-3 rounded-2xl p-3"
                  style={{ border: `1px solid ${BRAND.soft}`, background: `${BRAND.blue}06` }}
                >
                  <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                    <div
                      className="text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: BRAND.slate }}
                    >
                      Ubicación
                    </div>
                    <div className="mt-2 truncate text-sm font-black" style={{ color: BRAND.navy }}>
                      {form.ubicacion || 'Pendiente'}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                    <div
                      className="text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: BRAND.slate }}
                    >
                      SKU
                    </div>
                    <div className="mt-2 truncate text-sm font-black" style={{ color: BRAND.navy }}>
                      {form.codigo || 'Pendiente'}
                    </div>
                  </div>
                </div>

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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-lg font-bold uppercase outline-none transition-all placeholder:text-slate-400 focus:bg-white"
                        style={{ color: BRAND.navy }}
                        placeholder="AA-01-01A"
                        value={form.ubicacion}
                        onChange={handleInputChange}
                        onBlur={handleUbicacionBlur}
                        maxLength={12}
                        required
                        autoFocus
                      />
                      <QrCode
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: BRAND.slate }}
                        size={20}
                      />
                    </div>
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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-lg font-bold uppercase outline-none transition-all placeholder:text-slate-400 focus:bg-white"
                        style={{ color: BRAND.navy }}
                        placeholder="SKU-123..."
                        value={form.codigo}
                        onChange={handleInputChange}
                        maxLength={20}
                        required
                      />
                      {loadingDesc ? (
                        <Loader2
                          className="loading-spinner absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: BRAND.orange }}
                          size={20}
                        />
                      ) : (
                        <QrCode
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: BRAND.slate }}
                          size={20}
                        />
                      )}
                    </div>
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
                    className="desc-field w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold transition-colors focus:outline-none"
                    style={{ color: BRAND.slate }}
                    placeholder="Se llenará automáticamente..."
                    value={form.descripcion}
                    readOnly
                    tabIndex="-1"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-wms-danger/10 border border-wms-danger/30 rounded-lg flex items-center gap-2 text-sm text-wms-danger">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  className="add-btn mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-black text-white shadow-[0_22px_40px_-24px_rgba(13,27,42,0.85)] transition-all active:scale-95 sm:text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.blue} 46%, ${BRAND.orange} 100%)`
                  }}
                >
                  <PackagePlus size={24} />
                  <span>AGREGAR A COLA</span>
                </button>
              </form>
            </div>
          </div>

          <div className="min-w-0">
            <div
              ref={listRef}
              className="flex h-[560px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_22px_55px_-38px_rgba(15,23,42,0.35)] sm:h-[760px]"
            >
              <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
                      style={{
                        border: `1px solid ${BRAND.soft}`,
                        background: `${BRAND.blue}08`,
                        color: BRAND.blue
                      }}
                    >
                      Paso 2
                    </div>
                    <h3
                      className="mt-3 text-lg font-black tracking-tight sm:text-xl"
                      style={{ color: BRAND.navy }}
                    >
                      Cola de procesamiento
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                      Revisa las asignaciones visuales antes de guardarlas. El stock no cambia.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Registros
                      </div>
                      <div className="mt-1 text-2xl font-black text-slate-900">{queue.length}</div>
                    </div>
                    <button
                      onClick={clearQueue}
                      disabled={queue.length === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      Vaciar todo
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-5">
                {queue.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 px-6 text-center text-slate-500">
                    <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                      <Box size={44} className="opacity-25" />
                    </div>
                    <p className="text-xl font-black text-slate-900">La cola está vacía</p>
                    <p className="mt-2 max-w-md text-sm">
                      Agrega productos desde el formulario para asignar una ubicación visual. El
                      stock no cambia.
                    </p>
                  </div>
                ) : (
                  (() => {
                    queueItemsRef.current = [];
                    return null;
                  })() || (
                    <div className="space-y-3">
                      {queue.map((item, index) => (
                        <div
                          key={item.id}
                          ref={(el) => {
                            if (el) queueItemsRef.current[index] = el;
                          }}
                          className="group rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-[0_18px_40px_-32px_rgba(13,27,42,0.32)]"
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex min-w-0 gap-4">
                              <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white"
                                style={{
                                  background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.orange} 100%)`
                                }}
                              >
                                {queue.length - index}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                      Ubicación
                                    </p>
                                    <p className="mt-1 truncate font-mono text-lg font-black text-slate-900">
                                      {item.ubicacion}
                                    </p>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                      Código
                                    </p>
                                    <p
                                      className="mt-1 truncate font-mono text-lg font-black"
                                      style={{ color: BRAND.orange }}
                                    >
                                      {item.codigo}
                                    </p>
                                    {item.descripcion && (
                                      <p className="mt-1 truncate text-xs text-slate-500">
                                        {item.descripcion}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                      Captura
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                      {new Date(item.timestamp).toLocaleTimeString('es-CL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {(item.serie ||
                                  item.partida ||
                                  item.pieza ||
                                  item.fecha_vencimiento ||
                                  item.talla ||
                                  item.color) && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {item.serie && (
                                      <span
                                        className="rounded-full border px-2.5 py-1 text-[11px] font-bold"
                                        style={{
                                          borderColor: `${BRAND.blue}25`,
                                          background: `${BRAND.blue}10`,
                                          color: BRAND.blue
                                        }}
                                      >
                                        Serie: {item.serie}
                                      </span>
                                    )}
                                    {item.partida && (
                                      <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                                        Partida: {item.partida}
                                      </span>
                                    )}
                                    {item.pieza && (
                                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                        Pieza: {item.pieza}
                                      </span>
                                    )}
                                    {item.fecha_vencimiento && (
                                      <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">
                                        Vence: {item.fecha_vencimiento}
                                      </span>
                                    )}
                                    {item.talla && (
                                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                        Talla: {item.talla}
                                      </span>
                                    )}
                                    {item.color && (
                                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                        Color: {item.color}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => removeFromQueue(item.id, index)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className="border-t border-slate-200 bg-white p-5 sm:p-6">
                <button
                  onClick={handleSync}
                  disabled={queue.length === 0 || syncMutation.isPending}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-lg font-black text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_22px_40px_-24px_rgba(13,27,42,0.85)]"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.blue} 50%, ${BRAND.orange} 100%)`
                  }}
                >
                  {syncMutation.isPending ? (
                    <>
                      <Loader2 size={24} className="animate-spin" /> GUARDANDO...
                    </>
                  ) : (
                    <>
                      <Save size={24} /> GUARDAR UBICACIONES VISUALES ({queue.length})
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-xs text-slate-400">
                  {isOnline
                    ? 'Se guardará una referencia visual. No se descuenta ni modifica stock.'
                    : 'Se guardará en la cola offline como referencia visual para sincronización posterior.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entry;
