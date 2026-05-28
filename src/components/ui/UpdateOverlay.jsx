import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, CheckCircle, Zap } from 'lucide-react';

/**
 * Overlay fullscreen que se muestra cuando una actualización OTA está lista.
 * Se integra con mobileService.js via onUpdateAvailable(cb).
 *
 * Props:
 *  - updateInfo: { version, bundleId } | null
 *  - onApplyNow: (bundleId) => void  — aplicar inmediatamente
 */
const UpdateOverlay = ({ updateInfo, onApplyNow }) => {
  const [countdown, setCountdown] = useState(4);
  const [phase, setPhase] = useState('downloading'); // downloading | ready | applying

  useEffect(() => {
    if (!updateInfo) return;
    setPhase('ready');
    setCountdown(4);
  }, [updateInfo]);

  // Cuenta regresiva de 4 segundos antes del auto-apply
  useEffect(() => {
    if (phase !== 'ready') return;
    if (countdown <= 0) {
      setPhase('applying');
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  if (!updateInfo) return null;

  const handleApplyNow = () => {
    setPhase('applying');
    onApplyNow?.(updateInfo.bundleId);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative w-full max-w-sm mx-4 text-center">
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30">
            {phase === 'applying' ? (
              <RefreshCw size={40} className="text-white animate-spin" />
            ) : (
              <Download size={40} className="text-white" />
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
          {phase === 'applying' ? 'Aplicando...' : 'Nueva Actualización'}
        </h1>

        {/* Version badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6">
          <Zap size={14} className="text-orange-400" />
          <span className="text-sm font-bold text-orange-300">
            v{updateInfo.version}
          </span>
        </div>

        {/* Status text */}
        <p className="text-slate-400 text-sm font-medium mb-8 px-4">
          {phase === 'applying'
            ? 'Reiniciando la aplicación con la nueva versión...'
            : 'Se descargó una nueva versión. La app se reiniciará automáticamente.'}
        </p>

        {/* Progress / countdown */}
        {phase === 'ready' && (
          <>
            {/* Countdown bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4 mx-auto max-w-xs">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((4 - countdown) / 4) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Reinicio automático en {countdown}s
            </p>

            {/* Manual button */}
            <button
              onClick={handleApplyNow}
              className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-500/25 active:scale-95 transition-all"
            >
              <RefreshCw size={20} />
              Actualizar Ahora
            </button>
          </>
        )}

        {phase === 'applying' && (
          <div className="flex items-center justify-center gap-2 text-orange-400 text-sm font-bold animate-pulse">
            <CheckCircle size={16} />
            No cierres la aplicación
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateOverlay;
