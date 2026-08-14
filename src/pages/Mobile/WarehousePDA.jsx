import React, { useState, useEffect, useRef } from 'react';
import {
  Scan,
  Package,
  ArrowRight,
  CheckCircle,
  RotateCcw,
  Search,
  LogOut,
  MapPin,
  ArrowLeft,
  Wifi,
  WifiOff,
  Plus,
  Minus,
  ChevronRight,
  Archive,
  Camera,
  CloudOff,
  UploadCloud
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import useSyncQueue from '../../hooks/useSyncQueue';
import { enqueueSyncItem } from '../../lib/syncManager';
import ConteoPDA from './ConteoPDA';
import ConsultaPDA from './ConsultaPDA';

// ¿El error de una escritura es por falta de red? (para caer a la cola offline)
const esErrorDeRed = (err) =>
  !navigator.onLine ||
  /network|fetch|failed to fetch|timeout|Load failed|ERR_/i.test(err?.message || '');

// Versión real de la app (inyectada por Vite desde package.json).
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

// ============================================================================
// WMS PDA / HANDHELD MODE
// Diseñado para pantallas de 320px - 480px (Zebra TC21, Honeywell, etc.)
// ============================================================================

const hapticSuccess = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (_) {}
};

const hapticError = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (_) {}
};

const WarehousePDA = () => {
  const { user, logout } = useAuth();
  const { startScan, isScanning, isSupportedDevice } = useBarcodeScanner();
  const online = useOnlineStatus();
  const { pending, syncNow } = useSyncQueue();
  const [mode, setMode] = useState('HOME'); // HOME, PUTAWAY, INVENTORY, QUERY
  const [scannedValue, setScannedValue] = useState('');

  // PUTAWAY STATE
  const [putawayStep, setPutawayStep] = useState('SCAN_LOC'); // SCAN_LOC -> SCAN_SKU -> ENTER_QTY -> CONFIRM
  const [putawayData, setPutawayData] = useState({
    ubicacion: '',
    codigo: '',
    descripcion: '',
    cantidad: 1
  });
  const [putawayCount, setPutawayCount] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus para scanners láser
    if (inputRef.current) inputRef.current.focus();

    // Mantener el foco
    const interval = setInterval(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [mode, putawayStep]);

  // NOTA: el antiguo modo "PICKING guiado" se eliminó: leía la tabla
  // tms_picking_tasks, que nunca existió en esta base (el botón siempre
  // terminaba en error). El picking real de CCO vive en /outbound/picking.

  // Abre la cámara nativa para escanear código de barras / QR
  const openCameraScanner = async () => {
    const result = await startScan({
      onScan: (value) => {
        hapticSuccess();
        processInput(value.trim().toUpperCase());
      },
      onError: (msg) => {
        hapticError();
        toast.error(msg);
      }
    });
  };

  const handleScan = (e) => {
    e.preventDefault();
    if (!scannedValue) return;

    processInput(scannedValue.trim().toUpperCase());
    setScannedValue('');
  };

  const processInput = (val) => {
    if (mode === 'PUTAWAY') {
      processPutawayInput(val);
    }
  };

  // ==================== PUTAWAY ====================

  const processPutawayInput = async (val) => {
    if (putawayStep === 'SCAN_LOC') {
      // Offline: no se puede validar contra la BD → se acepta la ubicación tal cual
      // (la operación queda en cola y se valida al sincronizar en el servidor).
      if (!online) {
        hapticSuccess();
        setPutawayData((prev) => ({ ...prev, ubicacion: val }));
        setPutawayStep('SCAN_SKU');
        toast.success(`Ubicación: ${val} (offline)`);
        return;
      }
      try {
        const { error } = await supabase
          .from('wms_ubicaciones')
          .select('ubicacion')
          .eq('ubicacion', val)
          .limit(1);
        if (error) throw error;
        hapticSuccess();
        setPutawayData((prev) => ({ ...prev, ubicacion: val }));
        setPutawayStep('SCAN_SKU');
        toast.success(`Ubicación: ${val}`);
      } catch (err) {
        // Caída de red a mitad → dejar seguir en modo offline.
        if (esErrorDeRed(err)) {
          hapticSuccess();
          setPutawayData((prev) => ({ ...prev, ubicacion: val }));
          setPutawayStep('SCAN_SKU');
          toast.warning(`Ubicación: ${val} (sin validar, offline)`);
          return;
        }
        hapticError();
        toast.error('Error validando ubicación');
      }
    } else if (putawayStep === 'SCAN_SKU') {
      // Offline: sin catálogo → se acepta el código con descripción "por validar".
      if (!online) {
        hapticSuccess();
        setPutawayData((prev) => ({ ...prev, codigo: val, descripcion: 'Por validar (offline)' }));
        setPutawayStep('ENTER_QTY');
        toast.success(`Producto: ${val} (offline)`);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('tms_matriz_codigos')
          .select('codigo_producto, producto')
          .eq('codigo_producto', val)
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          hapticError();
          toast.error('SKU no encontrado en matriz de códigos');
          return;
        }
        hapticSuccess();
        setPutawayData((prev) => ({
          ...prev,
          codigo: data.codigo_producto,
          descripcion: data.producto
        }));
        setPutawayStep('ENTER_QTY');
        toast.success(`Producto: ${data.producto}`);
      } catch (err) {
        if (esErrorDeRed(err)) {
          hapticSuccess();
          setPutawayData((prev) => ({
            ...prev,
            codigo: val,
            descripcion: 'Por validar (offline)'
          }));
          setPutawayStep('ENTER_QTY');
          toast.warning(`Producto: ${val} (sin validar, offline)`);
          return;
        }
        hapticError();
        toast.error('Error buscando producto');
      }
    }
  };

  const confirmPutaway = async () => {
    const registro = {
      ubicacion: putawayData.ubicacion,
      codigo: putawayData.codigo,
      descripcion: putawayData.descripcion
    };

    // Continúa al siguiente ítem (se guardó online o quedó en cola offline).
    const avanzar = () => {
      hapticSuccess();
      setPutawayCount((prev) => prev + 1);
      setPutawayData({ ubicacion: '', codigo: '', descripcion: '', cantidad: 1 });
      setPutawayStep('SCAN_LOC');
    };

    // Guarda la operación en la cola local para subirla al reconectar.
    const encolar = async () => {
      await enqueueSyncItem({
        type: 'rpc',
        tableName: 'registrar_putaway_ubicaciones',
        recordId: `putaway_${registro.ubicacion}_${registro.codigo}_${Date.now()}`,
        data: { p_items: [registro] }
      });
      // enqueueSyncItem ya muestra "Operación guardada offline".
      avanzar();
    };

    // Sin señal → directo a la cola (no intentamos la red).
    if (!online) {
      await encolar();
      return;
    }

    try {
      toast.loading('Guardando...', { id: 'putaway-save' });
      const { data, error } = await supabase.rpc('registrar_putaway_ubicaciones', {
        p_items: [registro]
      });
      toast.dismiss('putaway-save');
      if (error) throw error;
      if (Number(data?.guardados) !== 1) throw new Error('Supabase no confirmó la ubicación');
      toast.success('Producto ubicado correctamente');
      avanzar();
    } catch (err) {
      toast.dismiss('putaway-save');
      console.error('Error putaway:', err);
      // Si fue caída de red → guardar offline en vez de perder el trabajo.
      if (esErrorDeRed(err)) {
        await encolar();
        return;
      }
      hapticError();
      toast.error('Error al ubicar: ' + (err.message || 'Error desconocido'));
    }
  };

  const goHome = () => {
    setMode('HOME');
    setPutawayStep('SCAN_LOC');
    setPutawayData({ ubicacion: '', codigo: '', descripcion: '', cantidad: 1 });
  };

  // ==================== VISTAS ====================

  if (mode === 'HOME') {
    return (
      <div key="home" className="anim-slide-in min-h-dvh bg-slate-900 text-white flex flex-col">
        {/* Top Bar (respeta el notch / barra de estado) */}
        <div
          className="bg-white text-slate-900 p-3 sm:p-4 flex justify-between items-center shadow-md"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              {(user?.nombre || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="text-xs min-w-0">
              <div className="font-bold truncate">
                {user?.nombre || user?.email?.split('@')[0] || 'Operario'}
              </div>
              {online ? (
                <div className="text-emerald-600 flex items-center gap-1">
                  <Wifi size={10} /> Conectado
                </div>
              ) : (
                <div className="text-rose-600 flex items-center gap-1 font-bold">
                  <WifiOff size={10} /> Sin señal
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pending > 0 && (
              <button
                onClick={syncNow}
                title="Sincronizar pendientes"
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black ${online ? 'bg-amber-100 text-amber-700 active:bg-amber-200' : 'bg-slate-200 text-slate-600'}`}
              >
                {online ? <UploadCloud size={14} /> : <CloudOff size={14} />} {pending}
              </button>
            )}
            <button
              onClick={logout}
              className="p-2 bg-slate-100 rounded-lg active:bg-slate-200"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Banner offline: se PUEDE seguir trabajando (queda en cola local) */}
        {!online && (
          <div className="bg-rose-600 text-white text-xs font-bold px-3 py-2 flex items-center gap-2">
            <WifiOff size={14} className="shrink-0" />
            Sin conexión: puedes seguir, las operaciones se guardan y se subirán al reconectar.
          </div>
        )}
        {online && pending > 0 && (
          <div className="bg-amber-500 text-white text-xs font-bold px-3 py-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <UploadCloud size={14} className="shrink-0" /> {pending} operación(es) por subir…
            </span>
            <button onClick={syncNow} className="underline underline-offset-2">
              Sincronizar
            </button>
          </div>
        )}

        {/* Menu Grid — entrada escalonada */}
        <div className="anim-stagger flex-1 p-3 sm:p-4 grid grid-cols-2 gap-3 sm:gap-4 content-start mt-3 sm:mt-4">
          <MenuButton
            icon={<ArrowRight size={32} />}
            label="UBICAR (PUTAWAY)"
            color="bg-emerald-600"
            onClick={() => {
              setMode('PUTAWAY');
              setPutawayStep('SCAN_LOC');
            }}
          />
          <MenuButton
            icon={<RotateCcw size={32} />}
            label="CONTEO CÍCLICO"
            color="bg-amber-600"
            onClick={() => setMode('INVENTORY')}
          />
          <MenuButton
            icon={<Search size={32} />}
            label="CONSULTA"
            color="bg-blue-600"
            onClick={() => setMode('QUERY')}
          />
        </div>

        <div
          className="p-4 text-center text-slate-500 text-xs font-mono"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          WMS HANDHELD · v{APP_VERSION}
        </div>
      </div>
    );
  }

  // ==================== PUTAWAY VIEW ====================

  if (mode === 'PUTAWAY') {
    const steps = ['SCAN_LOC', 'SCAN_SKU', 'ENTER_QTY', 'CONFIRM'];
    const currentStepIdx = steps.indexOf(putawayStep) + 1;

    return (
      <div
        key="putaway"
        className="anim-slide-in min-h-dvh bg-black text-white flex flex-col font-mono"
      >
        {/* Header (respeta el notch / barra de estado) */}
        <div
          className="bg-emerald-900 p-3 flex justify-between items-center"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={goHome}
              className="text-emerald-300 hover:text-white"
              aria-label="Volver"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-sm font-bold text-emerald-300">PUTAWAY</span>
          </div>
          <div className="flex items-center gap-2">
            {pending > 0 && (
              <span
                className="flex items-center gap-1 text-[11px] font-black text-amber-300"
                title="Pendientes de subir"
              >
                {online ? <UploadCloud size={12} /> : <CloudOff size={12} />} {pending}
              </span>
            )}
            {!online && <WifiOff size={13} className="text-rose-400" />}
            <Archive size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-bold">Ubicados: {putawayCount}</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-slate-900 px-4 py-3 flex items-center gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  idx + 1 < currentStepIdx
                    ? 'bg-emerald-500 text-white'
                    : idx + 1 === currentStepIdx
                      ? 'bg-emerald-400 text-black ring-2 ring-emerald-300'
                      : 'bg-slate-700 text-slate-500'
                }`}
              >
                {idx + 1 < currentStepIdx ? <CheckCircle size={14} /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 rounded ${idx + 1 < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-700'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* STEP 1: SCAN LOCATION */}
          {putawayStep === 'SCAN_LOC' && (
            <div
              key="s1"
              className="anim-fade-up flex-1 flex flex-col items-center justify-center gap-4"
            >
              <MapPin size={48} className="text-emerald-400" />
              <h2 className="text-2xl font-black text-emerald-400">ESCANEAR UBICACIÓN</h2>
              <p className="text-slate-500 text-sm text-center">
                Escanee o escriba la ubicación destino
                <br />
                (RACK-POSICIÓN-NIVEL)
              </p>
            </div>
          )}

          {/* STEP 2: SCAN SKU */}
          {putawayStep === 'SCAN_SKU' && (
            <div
              key="s2"
              className="anim-fade-up flex-1 flex flex-col items-center justify-center gap-4"
            >
              <div className="bg-slate-800 rounded-xl p-3 w-full">
                <label className="text-[10px] text-slate-500 uppercase">
                  Ubicación seleccionada
                </label>
                <div className="text-2xl font-black text-emerald-400">{putawayData.ubicacion}</div>
              </div>
              <Package size={48} className="text-emerald-400 mt-4" />
              <h2 className="text-2xl font-black text-emerald-400">ESCANEAR PRODUCTO</h2>
              <p className="text-slate-500 text-sm text-center">
                Escanee el código del producto (SKU)
              </p>
            </div>
          )}

          {/* STEP 3: ENTER QUANTITY */}
          {putawayStep === 'ENTER_QTY' && (
            <div
              key="s3"
              className="anim-fade-up flex-1 flex flex-col items-center justify-center gap-4"
            >
              <div className="bg-slate-800 rounded-xl p-3 w-full">
                <label className="text-[10px] text-slate-500 uppercase">Ubicación</label>
                <div className="text-lg font-bold text-emerald-400">{putawayData.ubicacion}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 w-full">
                <label className="text-[10px] text-slate-500 uppercase">Producto</label>
                <div className="text-lg font-bold text-white">{putawayData.codigo}</div>
                <div className="text-sm text-slate-400 truncate">{putawayData.descripcion}</div>
              </div>

              <h2 className="text-xl font-black text-emerald-400 mt-2">CANTIDAD</h2>
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() =>
                    setPutawayData((prev) => ({
                      ...prev,
                      cantidad: Math.max(1, prev.cantidad - 1)
                    }))
                  }
                  className="w-12 h-12 sm:w-14 sm:h-14 min-w-[44px] min-h-[44px] bg-slate-700 rounded-xl flex items-center justify-center active:bg-slate-600"
                >
                  <Minus size={24} className="text-white" />
                </button>
                <input
                  type="number"
                  value={putawayData.cantidad}
                  onChange={(e) =>
                    setPutawayData((prev) => ({
                      ...prev,
                      cantidad: Math.max(1, parseInt(e.target.value) || 1)
                    }))
                  }
                  className="w-24 h-14 bg-slate-800 border-2 border-emerald-400 rounded-xl text-center text-3xl font-black text-white outline-none"
                  min="1"
                />
                <button
                  onClick={() =>
                    setPutawayData((prev) => ({ ...prev, cantidad: prev.cantidad + 1 }))
                  }
                  className="w-12 h-12 sm:w-14 sm:h-14 min-w-[44px] min-h-[44px] bg-slate-700 rounded-xl flex items-center justify-center active:bg-slate-600"
                >
                  <Plus size={24} className="text-white" />
                </button>
              </div>

              <button
                onClick={() => setPutawayStep('CONFIRM')}
                className="mt-4 w-full bg-emerald-500 text-black py-4 rounded-xl font-bold text-lg active:bg-emerald-400 flex items-center justify-center gap-2"
              >
                SIGUIENTE <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* STEP 4: CONFIRM */}
          {putawayStep === 'CONFIRM' && (
            <div key="s4" className="anim-fade-up flex-1 flex flex-col gap-4">
              <h2 className="text-xl font-black text-emerald-400 text-center">
                CONFIRMAR UBICACIÓN
              </h2>

              <div className="bg-slate-800 rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Ubicación</label>
                  <div className="text-2xl font-black text-emerald-400">
                    {putawayData.ubicacion}
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <label className="text-[10px] text-slate-500 uppercase">Producto</label>
                  <div className="text-lg font-bold text-white">{putawayData.codigo}</div>
                  <div className="text-sm text-slate-400">{putawayData.descripcion}</div>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <label className="text-[10px] text-slate-500 uppercase">Cantidad</label>
                  <div className="text-4xl font-black text-white">{putawayData.cantidad}</div>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setPutawayStep('ENTER_QTY')}
                  className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold text-base sm:text-lg active:bg-slate-600 min-h-[44px]"
                >
                  ATRÁS
                </button>
                <button
                  onClick={confirmPutaway}
                  className="flex-1 bg-emerald-500 text-black py-4 rounded-xl font-bold text-base sm:text-lg active:bg-emerald-400 animate-pulse min-h-[44px]"
                >
                  CONFIRMAR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scanner Input + Camera Button (steps 1 & 2 only) */}
        {(putawayStep === 'SCAN_LOC' || putawayStep === 'SCAN_SKU') && (
          <form onSubmit={handleScan} className="p-2 bg-slate-900 border-t border-slate-700">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Scan
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
                  size={20}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={scannedValue}
                  onChange={(e) => setScannedValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-10 text-white font-bold outline-none focus:border-emerald-400 min-h-[44px]"
                  placeholder={
                    putawayStep === 'SCAN_LOC' ? 'Escanear ubicación...' : 'Escanear producto...'
                  }
                  autoComplete="off"
                />
              </div>
              {isSupportedDevice && (
                <button
                  type="button"
                  onClick={openCameraScanner}
                  disabled={isScanning}
                  className="px-4 min-w-[44px] min-h-[44px] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1 font-bold text-sm disabled:opacity-50 transition-colors"
                >
                  <Camera size={20} />
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    );
  }

  // ==================== CONTEO CÍCLICO (módulo real) ====================

  if (mode === 'INVENTORY') {
    return <ConteoPDA onHome={goHome} />;
  }

  // ==================== CONSULTA DE STOCK (módulo real) ====================

  if (mode === 'QUERY') {
    return <ConsultaPDA onHome={goHome} />;
  }

  // Fallback
  return (
    <div className="min-h-dvh bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center p-8">
        <Package size={64} className="mx-auto mb-4 text-slate-700" />
        <h2 className="text-xl font-bold text-slate-500">Error de Estado</h2>
        <button onClick={goHome} className="mt-4 text-indigo-400">
          Volver
        </button>
      </div>
    </div>
  );
};

const MenuButton = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} text-slate-900 p-4 sm:p-6 rounded-2xl shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center gap-2 sm:gap-3 h-32 sm:h-40 min-h-[44px]`}
  >
    {icon}
    <span className="font-bold text-xs sm:text-sm tracking-wide text-center leading-tight">
      {label}
    </span>
  </button>
);

export default WarehousePDA;
