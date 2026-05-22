import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, Package, ArrowRight, CheckCircle, 
  AlertTriangle, RotateCcw, Search, LogOut, 
  Box, MapPin, ClipboardList, ArrowLeft, Wifi
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';

import { toast } from 'sonner';

// ============================================================================
// WMS PDA / HANDHELD MODE
// Diseñado para pantallas de 320px - 480px (Zebra TC21, Honeywell, etc.)
// ============================================================================

const WarehousePDA = () => {
  const { user, signOut } = useAuth();
  const [mode, setMode] = useState('HOME'); // HOME, PICKING, PUTAWAY, INVENTORY
  const [scannedValue, setScannedValue] = useState('');
  
  // PICKING STATE
  const [activeTask, setActiveTask] = useState(null);
  const [pickStep, setPickStep] = useState('SCAN_LOC'); // SCAN_LOC -> SCAN_SKU -> CONFIRM_QTY

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
  }, [mode, pickStep]);

  // Simular carga de tarea
  const loadPickingTask = async () => {
    // En producción: WmsIntelligence.getNextTask(user.id)
    toast.loading('Buscando tarea...');
    setTimeout(() => {
      setActiveTask({
        id: 'TASK-9901',
        location: 'A-01-04-B',
        sku: 'PARACETAMOL-500',
        desc: 'Paracetamol 500mg Caja 20',
        qty_needed: 50,
        qty_picked: 0,
        batch: 'LOTE-2024'
      });
      setMode('PICKING');
      setPickStep('SCAN_LOC');
      toast.dismiss();
      toast.success('Nueva tarea asignada');
    }, 800);
  };

  const handleScan = (e) => {
    e.preventDefault();
    if (!scannedValue) return;

    processInput(scannedValue.toUpperCase());
    setScannedValue('');
  };

  const processInput = (val) => {
    // Lógica de Picking
    if (mode === 'PICKING') {
      if (pickStep === 'SCAN_LOC') {
        if (val === activeTask.location) {
          playSound('success');
          setPickStep('SCAN_SKU');
          toast.success('Ubicación Correcta');
        } else {
          playSound('error');
          toast.error('Ubicación Incorrecta');
        }
      } else if (pickStep === 'SCAN_SKU') {
        if (val === activeTask.sku || val === activeTask.batch) {
          playSound('success');
          setPickStep('CONFIRM_QTY');
          toast.success('Producto Correcto');
        } else {
          playSound('error');
          toast.error('Producto Incorrecto');
        }
      }
    }
  };

  const confirmQty = (qty) => {
    if (parseInt(qty) === activeTask.qty_needed) {
      playSound('success');
      toast.success('TAREA COMPLETADA');
      setActiveTask(null);
      setMode('HOME');
    } else {
      toast.warning('Cantidad difiere. ¿Confirmar faltante?');
    }
  };

  const playSound = (type) => {
    // Simulación de beeps
    // const audio = new Audio(type === 'success' ? '/beep-ok.mp3' : '/beep-err.mp3');
    // audio.play().catch(e => {});
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
          <button onClick={signOut} className="p-2 bg-slate-100 rounded-lg">
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
            onClick={() => setMode('PUTAWAY')} 
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

  if (mode === 'PICKING' && activeTask) {
    return (
      <div className="min-h-screen bg-black text-slate-900 flex flex-col font-mono">
        {/* Task Header */}
        <div className="bg-slate-50 p-2 border-b border-slate-300 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">TASK: {activeTask.id}</span>
          <button onClick={() => setMode('HOME')} className="text-slate-500">
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
              className="w-full bg-black border border-slate-300 rounded-lg py-3 pl-10 text-slate-900 font-bold outline-none focus:border-indigo-500"
              placeholder="Escanear aquí..."
              autoComplete="off"
            />
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center p-8">
        <Package size={64} className="mx-auto mb-4 text-slate-700" />
        <h2 className="text-xl font-bold text-slate-500">Módulo en Construcción</h2>
        <button onClick={() => setMode('HOME')} className="mt-4 text-indigo-400">Volver</button>
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
