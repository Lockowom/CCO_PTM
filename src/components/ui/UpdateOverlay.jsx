import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Overlay fullscreen que se muestra cuando una actualización OTA está lista.
 * Se integra con mobileService.js via onUpdateAvailable(cb).
 *
 * Props:
 *  - updateInfo: { version, bundleId } | null
 *  - onApplyNow: (bundleId) => void  — aplicar inmediatamente
 */
const COUNTDOWN_SECONDS = 4;

const UpdateOverlay = ({ updateInfo, onApplyNow }) => {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [phase, setPhase] = useState('ready'); // ready | applying

  useEffect(() => {
    if (!updateInfo) return;
    setPhase('ready');
    setCountdown(COUNTDOWN_SECONDS);
  }, [updateInfo]);

  // Cuenta regresiva antes del auto-apply
  useEffect(() => {
    if (phase !== 'ready') return;
    if (countdown <= 0) { setPhase('applying'); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  if (!updateInfo) return null;

  const handleApplyNow = () => {
    setPhase('applying');
    onApplyNow?.(updateInfo.bundleId);
  };

  // Anillo de progreso circular
  const R = 52;
  const C = 2 * Math.PI * R;
  const progress = phase === 'applying' ? 1 : (COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS;
  const dashOffset = C * (1 - progress);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-5 animate-in fade-in duration-300">
      {/* Glow de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[140%] h-1/2 bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/4 right-0 w-2/3 h-1/2 bg-amber-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Tarjeta */}
      <div className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Barra superior de marca */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />

        <div className="px-8 pt-7 pb-8 text-center">
          {/* Marca CCO */}
          <div className="flex items-center justify-center gap-2 mb-7">
            <span className="text-base font-black text-white tracking-tighter">CCO</span>
            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-black rounded-md tracking-[0.2em] uppercase">System</span>
          </div>

          {/* Icono con anillo de progreso */}
          <div className="relative mx-auto w-32 h-32 mb-6">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle
                cx="60" cy="60" r={R} fill="none" stroke="url(#cco-up-grad)" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
              <defs>
                <linearGradient id="cco-up-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
              {phase === 'applying'
                ? <RefreshCw size={44} className="text-white animate-spin" />
                : <Download size={44} className="text-white" strokeWidth={2.2} />}
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
            {phase === 'applying' ? 'Aplicando actualización' : 'Actualización disponible'}
          </h1>

          {/* Badge de versión */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full mb-5">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-xs font-black text-amber-300 tracking-wide">Versión {updateInfo.version}</span>
          </div>

          {/* Texto de estado */}
          <p className="text-slate-400 text-sm font-medium mb-7 leading-relaxed">
            {phase === 'applying'
              ? 'Reiniciando con la nueva versión. No cierres la app…'
              : 'Se descargó una mejora. La app se reiniciará automáticamente para aplicarla.'}
          </p>

          {phase === 'ready' ? (
            <>
              <button
                onClick={handleApplyNow}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-500/25 active:scale-[0.97] transition-all"
              >
                <RefreshCw size={20} /> Actualizar ahora
              </button>
              <p className="mt-3 text-xs text-slate-500 font-medium tabular-nums">
                Reinicio automático en {countdown}s
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 text-sm font-bold">
              <CheckCircle2 size={18} /> No cierres la aplicación
            </div>
          )}

          {/* Pie de confianza */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <ShieldCheck size={13} className="text-slate-400" />
            Actualización segura · Centro de Control Operacional
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateOverlay;
