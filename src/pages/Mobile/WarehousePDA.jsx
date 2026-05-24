import React, { useState, useEffect, useRef } from 'react';
import {
  Scan, Package, ArrowRight, CheckCircle,
  AlertTriangle, RotateCcw, Search, LogOut,
  Box, MapPin, ClipboardList, ArrowLeft, Wifi,
  Plus, Minus, ChevronRight, Archive
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import { toast } from 'sonner';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// ============================================================================
// WMS PDA / HANDHELD MODE
// Diseñado para pantallas de 320px - 480px (Zebra TC21, Honeywell, etc.)
// ============================================================================

const hapticSuccess = async () => {
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (_) {}
};

const hapticError = async () => {
  try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (_) {}
};

const WarehousePDA = () => {
  const { user, logout } = useAuth();
  const [mode, setMode] = useState('HOME'); // HOME, PICKING, PUTAWAY, INVENTORY, QUERY
  const [scannedValue, setScannedValue] = useState('');

  // PICKING STATE
  const [activeTask, setActiveTask] = useState(null);
  const [pickStep, setPickStep] = useState('SCAN_LOC'); // SCAN_LOC -> SCAN_SKU -> CONFIRM_QTY

  // PUTAWAY STATE
  const [putawayStep, setPutawayStep] = useState('SCAN_LOC'); // SCAN_LOC -> SCAN_SKU -> ENTER_QTY -> CONFIRM
  const [putawayData, setPutawayData] = useState({ ubicacion: '', codigo: '', descripcion: '', cantidad: 1 });
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
  }, [mode, pickStep, putawayStep]);

  // ==================== PICKING ====================

  const loadPickingTask = async () => {
    try {
      toast.loading('Buscando tarea...', { id: 'loading-task' });

      const { data, error } = await supabase
        .from('tms_picking_tasks')
        .select('id, ubicacion, sku, descripcion, cantidad_requerida, lote, prioridad')
        .eq('estado', 'PENDIENTE')
        .order('prioridad', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      toast.dismiss('loading-task');

      if (error) throw error;

      if (!data) {
        toast.info('No hay tareas de picking pendientes');
        return;
      }

      // Mark task as in progress
      await supabase
        .from('tms_picking_tasks')
        .update({ estado: 'EN_PROCESO', operario_id: user?.id })
        .eq('id', data.id);

      setActiveTask({
        id: data.id,
        location: data.ubicacion,
        sku: data.sku,
        desc: data.descripcion,
        qty_needed: data.cantidad_requerida,
        qty_picked: 0,
        batch: data.lote
      });
      setMode('PICKING');
      setPickStep('SCAN_LOC');
      hapticSuccess();
      toast.success('Nueva tarea asignada');
    } catch (err) {
      console.error('Error loading picking task:', err);
      toast.dismiss('loading-task');
      hapticError();
      toast.error('Error al buscar tarea: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleScan = (e) => {
    e.preventDefault();
    if (!scannedValue) return;

    processInput(scannedValue.trim().toUpperCase());
    setScannedValue('');
  };

  const processInput = (val) => {
    if (mode === 'PICKING') {
      processPickingInput(val);
    } else if (mode === 'PUTAWAY') {
      processPutawayInput(val);
    }
  };

  const processPickingInput = (val) => {
    if (pickStep === 'SCAN_LOC') {
      if (val === activeTask.location) {
        hapticSuccess();
        setPickStep('SCAN_SKU');
        toast.success('Ubicación Correcta');
      } else {
        hapticError();
        toast.error('Ubicación Incorrecta');
      }
    } else if (pickStep === 'SCAN_SKU') {
      if (val === activeTask.sku || val === activeTask.batch) {
        hapticSuccess();
        setPickStep('CONFIRM_QTY');
        toast.success('Producto Correcto');
      } else {
        hapticError();
        toast.error('Producto Incorrecto');
      }
    }
  };

  const confirmQty = async (qty) => {
    if (parseInt(qty) === activeTask.qty_needed) {
      try {
        await supabase
          .from('tms_picking_tasks')
          .update({ estado: 'COMPLETADO', fecha_completado: new Date().toISOString() })
          .eq('id', activeTask.id);

        hapticSuccess();
        toast.success('TAREA COMPLETADA');
      } catch (err) {
        console.error('Error completing task:', err);
        toast.error('Error al completar tarea');
      }
      setActiveTask(null);
      setMode('HOME');
    } else {
      hapticError();
      toast.warning('Cantidad difiere. ¿Confirmar faltante?');
    }
  };

  // ==================== PUTAWAY ====================

  const processPutawayInput = async (val) => {
    if (putawayStep === 'SCAN_LOC') {
      // Validate location exists
      try {
        const { data, error } = await supabase
          .from('wms_ubicaciones')
          .select('ubicacion')
          .eq('ubicacion', val)
          .limit(1);

        if (error) throw error;

        // Accept the location whether it already has items or is new
        hapticSuccess();
        setPutawayData(prev => ({ ...prev, ubicacion: val }));
        setPutawayStep('SCAN_SKU');
        toast.success(`Ubicación: ${val}`);
      } catch (err) {
        hapticError();
        toast.error('Error validando ubicación');
      }
    } else if (putawayStep === 'SCAN_SKU') {
      // Lookup SKU in tms_matriz_codigos
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
        setPutawayData(prev => ({ ...prev, codigo: data.codigo_producto, descripcion: data.producto }));
        setPutawayStep('ENTER_QTY');
        toast.success(`Producto: ${data.producto}`);
      } catch (err) {
        hapticError();
        toast.error('Error buscando producto');
      }
    }
  };

  const confirmPutaway = async () => {
    try {
      toast.loading('Guardando...', { id: 'putaway-save' });

      const { error } = await supabase
        .from('wms_ubicaciones')
        .insert({
          ubicacion: putawayData.ubicacion,
          codigo: putawayData.codigo,
          descripcion: putawayData.descripcion,
          cantidad: putawayData.cantidad
        });

      toast.dismiss('putaway-save');

      if (error) throw error;

      hapticSuccess();
      setPutawayCount(prev => prev + 1);
      toast.success('Producto ubicado correctamente');

      // Reset for next item
      setPutawayData({ ubicacion: '', codigo: '', descripcion: '', cantidad: 1 });
      setPutawayStep('SCAN_LOC');
    } catch (err) {
      toast.dismiss('putaway-save');
      hapticError();
      console.error('Error putaway:', err);
      toast.error('Error al ubicar: ' + (err.message || 'Error desconocido'));
    }
  };

  const goHome = () => {
    setMode('HOME');
    setActiveTask(null);
    setPutawayStep('SCAN_LOC');
    setPutawayData({ ubicacion: '', codigo: '', descripcion: '', cantidad: 1 });
  };

  // ==================== VISTAS ====================

  if (mode === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        {/* Top Bar */}
        <div className="bg-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-xs">
              <div className="font-bold">{user?.email?.split('@')[0]}</div>
              <div className="text-emerald-400 flex items-center gap-1">
                <Wifi size={10} /> Online
              </div>
            </div>
          </div>
          <button onClick={logout} className="p-2 bg-slate-100 rounded-lg">
            <LogOut size={18} />
          </button>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 p-4 grid grid-cols-2 gap-4 content-start mt-4">
          <MenuButton
            icon={<ClipboardList size={32} />}
            label="PICKING"
            color="bg-indigo-600"
            onClick={loadPickingTask}
          />
          <MenuButton
            icon={<ArrowRight size={32} />}
            label="UBICAR (PUTAWAY)"
            color="bg-emerald-600"
            onClick={() => { setMode('PUTAWAY'); setPutawayStep('SCAN_LOC'); }}
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

        <div className="p-4 text-center text-slate-500 text-xs font-mono">
          WMS HANDHELD v2.0
          <br />
          Zebra / Honeywell Compatible
        </div>
      </div>
    );
  }

  // ==================== PICKING VIEW ====================

  if (mode === 'PICKING' && activeTask) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-mono">
        {/* Task Header */}
        <div className="bg-slate-50 p-2 border-b border-slate-300 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">TASK: {activeTask.id}</span>
          <button onClick={goHome} className="text-slate-500">
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="p-2 text-center text-sm font-bold transition-colors bg-white">
          ESPERANDO ESCANEO...
        </div>

        {/* Main Info */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* STEP 1: LOCATION */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            pickStep === 'SCAN_LOC' ? 'border-yellow-400 bg-slate-50' : 'border-slate-200 opacity-50'
          }`}>
            <label className="block text-[10px] text-slate-500 uppercase">IR A UBICACIÓN</label>
            <div className="text-4xl font-black text-yellow-400">{activeTask.location}</div>
          </div>

          {/* STEP 2: PRODUCT */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            pickStep === 'SCAN_SKU' ? 'border-yellow-400 bg-slate-50' : 'border-slate-200 opacity-50'
          }`}>
            <label className="block text-[10px] text-slate-500 uppercase">PRODUCTO / LOTE</label>
            <div className="text-xl font-bold text-slate-900 mb-1">{activeTask.sku}</div>
            <div className="text-sm text-slate-700 truncate">{activeTask.desc}</div>
            <div className="mt-2 inline-block bg-white px-2 py-1 rounded text-xs text-cyan-400">
              LOTE: {activeTask.batch}
            </div>
          </div>

          {/* STEP 3: QTY */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            pickStep === 'CONFIRM_QTY' ? 'border-yellow-400 bg-slate-50' : 'border-slate-200 opacity-50'
          }`}>
            <div className="flex justify-between items-end">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase">CANTIDAD REQUERIDA</label>
                <div className="text-5xl font-black text-slate-900">{activeTask.qty_needed}</div>
              </div>
              {pickStep === 'CONFIRM_QTY' && (
                <button
                  onClick={() => confirmQty(activeTask.qty_needed)}
                  className="bg-yellow-400 text-black px-6 py-4 rounded-lg font-bold text-xl animate-pulse"
                >
                  CONFIRMAR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Input for Scanner */}
        <form onSubmit={handleScan} className="p-2 bg-slate-50">
          <div className="relative">
            <Scan className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={scannedValue}
              onChange={e => setScannedValue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 text-white font-bold outline-none focus:border-indigo-500"
              placeholder="Escanear aquí..."
              autoComplete="off"
            />
          </div>
        </form>
      </div>
    );
  }

  // ==================== PUTAWAY VIEW ====================

  if (mode === 'PUTAWAY') {
    const steps = ['SCAN_LOC', 'SCAN_SKU', 'ENTER_QTY', 'CONFIRM'];
    const currentStepIdx = steps.indexOf(putawayStep) + 1;

    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-mono">
        {/* Header */}
        <div className="bg-emerald-900 p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={goHome} className="text-emerald-300 hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <span className="text-sm font-bold text-emerald-300">PUTAWAY</span>
          </div>
          <div className="flex items-center gap-2">
            <Archive size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-bold">Items ubicados: {putawayCount}</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-slate-900 px-4 py-3 flex items-center gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                idx + 1 < currentStepIdx ? 'bg-emerald-500 text-white' :
                idx + 1 === currentStepIdx ? 'bg-emerald-400 text-black ring-2 ring-emerald-300' :
                'bg-slate-700 text-slate-500'
              }`}>
                {idx + 1 < currentStepIdx ? <CheckCircle size={14} /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 rounded ${idx + 1 < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* STEP 1: SCAN LOCATION */}
          {putawayStep === 'SCAN_LOC' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <MapPin size={48} className="text-emerald-400" />
              <h2 className="text-2xl font-black text-emerald-400">ESCANEAR UBICACIÓN</h2>
              <p className="text-slate-500 text-sm text-center">Escanee o escriba la ubicación destino<br/>(RACK-POSICIÓN-NIVEL)</p>
            </div>
          )}

          {/* STEP 2: SCAN SKU */}
          {putawayStep === 'SCAN_SKU' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="bg-slate-800 rounded-xl p-3 w-full">
                <label className="text-[10px] text-slate-500 uppercase">Ubicación seleccionada</label>
                <div className="text-2xl font-black text-emerald-400">{putawayData.ubicacion}</div>
              </div>
              <Package size={48} className="text-emerald-400 mt-4" />
              <h2 className="text-2xl font-black text-emerald-400">ESCANEAR PRODUCTO</h2>
              <p className="text-slate-500 text-sm text-center">Escanee el código del producto (SKU)</p>
            </div>
          )}

          {/* STEP 3: ENTER QUANTITY */}
          {putawayStep === 'ENTER_QTY' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
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
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPutawayData(prev => ({ ...prev, cantidad: Math.max(1, prev.cantidad - 1) }))}
                  className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center active:bg-slate-600"
                >
                  <Minus size={24} className="text-white" />
                </button>
                <input
                  type="number"
                  value={putawayData.cantidad}
                  onChange={e => setPutawayData(prev => ({ ...prev, cantidad: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-24 h-14 bg-slate-800 border-2 border-emerald-400 rounded-xl text-center text-3xl font-black text-white outline-none"
                  min="1"
                />
                <button
                  onClick={() => setPutawayData(prev => ({ ...prev, cantidad: prev.cantidad + 1 }))}
                  className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center active:bg-slate-600"
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
            <div className="flex-1 flex flex-col gap-4">
              <h2 className="text-xl font-black text-emerald-400 text-center">CONFIRMAR UBICACIÓN</h2>

              <div className="bg-slate-800 rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Ubicación</label>
                  <div className="text-2xl font-black text-emerald-400">{putawayData.ubicacion}</div>
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
                  className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold text-lg active:bg-slate-600"
                >
                  ATRÁS
                </button>
                <button
                  onClick={confirmPutaway}
                  className="flex-1 bg-emerald-500 text-black py-4 rounded-xl font-bold text-lg active:bg-emerald-400 animate-pulse"
                >
                  CONFIRMAR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scanner Input (steps 1 & 2 only) */}
        {(putawayStep === 'SCAN_LOC' || putawayStep === 'SCAN_SKU') && (
          <form onSubmit={handleScan} className="p-2 bg-slate-900 border-t border-slate-700">
            <div className="relative">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={scannedValue}
                onChange={e => setScannedValue(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-10 text-white font-bold outline-none focus:border-emerald-400"
                placeholder={putawayStep === 'SCAN_LOC' ? 'Escanear ubicación...' : 'Escanear producto...'}
                autoComplete="off"
              />
            </div>
          </form>
        )}
      </div>
    );
  }

  // ==================== INVENTORY / QUERY PLACEHOLDER ====================

  if (mode === 'INVENTORY' || mode === 'QUERY') {
    const isInventory = mode === 'INVENTORY';
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-mono">
        {/* Header */}
        <div className={`p-3 flex justify-between items-center ${isInventory ? 'bg-amber-900' : 'bg-blue-900'}`}>
          <div className="flex items-center gap-2">
            <button onClick={goHome} className={`${isInventory ? 'text-amber-300' : 'text-blue-300'} hover:text-white`}>
              <ArrowLeft size={20} />
            </button>
            <span className={`text-sm font-bold ${isInventory ? 'text-amber-300' : 'text-blue-300'}`}>
              {isInventory ? 'CONTEO CÍCLICO' : 'CONSULTA'}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isInventory ? 'bg-amber-900/50' : 'bg-blue-900/50'}`}>
            {isInventory
              ? <RotateCcw size={40} className="text-amber-500" />
              : <Search size={40} className="text-blue-500" />
            }
          </div>
          <h2 className={`text-xl font-black ${isInventory ? 'text-amber-400' : 'text-blue-400'}`}>
            Próximamente
          </h2>
          <p className="text-slate-500 text-sm text-center leading-relaxed">
            {isInventory
              ? 'El módulo de conteo cíclico estará disponible en la próxima actualización. Permitirá realizar conteos parciales y completos con validación en tiempo real.'
              : 'El módulo de consulta permitirá buscar productos por SKU, ubicación o descripción y ver su stock disponible.'
            }
          </p>
          <button
            onClick={goHome}
            className={`mt-4 px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform ${
              isInventory ? 'bg-amber-600 text-black' : 'bg-blue-600 text-white'
            }`}
          >
            VOLVER AL MENÚ
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center p-8">
        <Package size={64} className="mx-auto mb-4 text-slate-700" />
        <h2 className="text-xl font-bold text-slate-500">Error de Estado</h2>
        <button onClick={goHome} className="mt-4 text-indigo-400">Volver</button>
      </div>
    </div>
  );
};

const MenuButton = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} text-slate-900 p-6 rounded-2xl shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center gap-3 h-40`}
  >
    {icon}
    <span className="font-bold text-sm tracking-wide">{label}</span>
  </button>
);

export default WarehousePDA;
