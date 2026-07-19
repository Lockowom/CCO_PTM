import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, CheckCircle2, ShieldCheck, Sparkles, ArrowUpCircle } from 'lucide-react';

/**
 * Feedback OTA (Capgo) fluido, en tres fases:
 *  - downloading → píldora inferior NO intrusiva con progreso real (%).
 *  - ready       → tarjeta fullscreen con anillo/cuenta regresiva y "Actualizar ahora".
 *  - applying    → tarjeta fullscreen con spinner ("no cierres la app").
 * Se integra con mobileService via onUpdateAvailable(cb) → { phase, version, percent, bundleId }.
 */
const COUNTDOWN_SECONDS = 4;

const UpdateOverlay = ({ updateInfo, onApplyNow }) => {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [applying, setApplying] = useState(false);

  const phase = applying ? 'applying' : updateInfo?.phase;

  // Reinicia el estado cuando llega una descarga lista.
  useEffect(() => {
    if (updateInfo?.phase === 'ready') { setApplying(false); setCountdown(COUNTDOWN_SECONDS); }
  }, [updateInfo?.phase, updateInfo?.version]);

  // Cuenta regresiva → auto-apply, solo en 'ready'.
  useEffect(() => {
    if (phase !== 'ready') return;
    if (countdown <= 0) { setApplying(true); onApplyNow?.(updateInfo?.bundleId); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, onApplyNow, updateInfo?.bundleId]);

  if (!updateInfo || phase === 'error' || !phase) return null;

  const handleApplyNow = () => { setApplying(true); onApplyNow?.(updateInfo.bundleId); };

  // ── Fase DESCARGANDO: píldora inferior fluida (no bloquea la app) ──
  if (phase === 'downloading') {
    const pct = Math.max(0, Math.min(100, updateInfo.percent ?? 0));
    return (
      <div className="fixed bottom-4 inset-x-0 z-[9998] flex justify-center px-4 pointer-events-none anim-fade-up">
        <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 grid place-items-center shrink-0">
              <Download size={17} className="text-white animate-bounce" style={{ animationDuration: '1.4s' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black text-white leading-tight">Descargando actualización</p>
              <p className="text-[11px] text-slate-400">Versión {updateInfo.version} · {pct}%</p>
            </div>
            <span className="text-[15px] font-black text-amber-400 tabular-nums shrink-0">{pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500 ease-out relative" style={{ width: `${pct}%` }}>
              <span className="absolute inset-0 bg-white/25 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Fase READY / APPLYING: tarjeta fullscreen ──
  const R = 52, C = 2 * Math.PI * R;
  const progress = phase === 'applying' ? 1 : (COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS;
  const dashOffset = C * (1 - progress);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-5 animate-in fade-in duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[140%] h-1/2 bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/4 right-0 w-2/3 h-1/2 bg-amber-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="anim-scale-in relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />

        <div className="px-8 pt-7 pb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-7">
            <span className="text-base font-black text-white tracking-tighter">CCO</span>
            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-black rounded-md tracking-[0.2em] uppercase">System</span>
          </div>

          <div className="relative mx-auto w-32 h-32 mb-6">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle cx="60" cy="60" r={R} fill="none" stroke="url(#cco-up-grad)" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
              <defs>
                <linearGradient id="cco-up-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="anim-pop absolute inset-3 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
              {phase === 'applying'
                ? <RefreshCw size={44} className="text-white animate-spin" />
                : <ArrowUpCircle size={44} className="text-white anim-pop" strokeWidth={2.2} />}
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
            {phase === 'applying' ? 'Aplicando actualización' : 'Todo listo'}
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full mb-5">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-xs font-black text-amber-300 tracking-wide">Versión {updateInfo.version}</span>
          </div>

          <p className="text-slate-400 text-sm font-medium mb-7 leading-relaxed">
            {phase === 'applying'
              ? 'Reiniciando con la nueva versión. No cierres la app…'
              : 'La mejora se descargó. La app se reiniciará para aplicarla.'}
          </p>

          {phase === 'ready' ? (
            <>
              <button onClick={handleApplyNow}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-500/25 active:scale-[0.97] transition-all">
                <RefreshCw size={20} /> Actualizar ahora
              </button>
              <p className="mt-3 text-xs text-slate-500 font-medium tabular-nums">Reinicio automático en {countdown}s</p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 text-sm font-bold">
              <CheckCircle2 size={18} /> No cierres la aplicación
            </div>
          )}

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
