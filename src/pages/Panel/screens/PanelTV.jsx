import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { getTV } from '../panelService';

// Modo TV (port de /tv): tablero kiosco oscuro con barras por estado + panel de
// detalle, auto-rotación y contadores "en vivo". Datos vía panelService.getTV.
// Botón de pantalla completa (Fullscreen API) para usarlo en un televisor.
const ROTATE_MS = 8000;
const PAUSE_MS = 15000;

// Contador animado simple.
function CountUp({ end, className }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now(); const dur = 800;
    const tick = (t) => { const p = Math.min(1, (t - t0) / dur); setV(Math.round(end * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return <span className={className}>{v.toLocaleString('es-CL')}</span>;
}

function NvRow({ n, color }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${n.urgente ? 'bg-red-500/10 border border-red-500/40' : 'bg-white/[0.03] border border-gray-800/40'}`}>
      {n.urgente && <span className="text-sm shrink-0">🚨</span>}
      <div className="w-1 h-8 rounded-full shrink-0" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold tabular-nums" style={{ color: n.urgente ? '#f87171' : '#e5e7eb' }}>{n.nv}</span>
          <span className="text-[8px] uppercase tracking-wider text-gray-500 bg-gray-800/60 rounded px-1.5 py-0.5 font-medium">{n.canal}</span>
        </div>
        <p className="text-[11px] text-gray-400 truncate">{n.cliente}{n.vendedor !== '—' ? ` · ${n.vendedor}` : ''}</p>
      </div>
      <div className="text-right shrink-0 flex items-center gap-1.5">
        {n.transportista !== '—' && <span className="text-cyan-400 text-xs font-bold">{n.transportista}</span>}
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums ${n.dias > 5 ? 'bg-red-500/20 text-red-400' : n.dias > 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700/40 text-gray-400'}`}>{n.dias}d</span>
      </div>
    </div>
  );
}

export default function PanelTV() {
  const [data, setData] = useState(null); // { estados, total, urgentes }
  const [sel, setSel] = useState('En Proceso');
  const [autoRotate, setAutoRotate] = useState(true);
  const [reloj, setReloj] = useState('');
  const [fs, setFs] = useState(false);
  const rootRef = useRef(null);
  const pauseUntil = useRef(0);
  const idx = useRef(0);

  useEffect(() => { getTV().then(setData); }, []);

  const ESTADOS = data?.estados || [];
  const TOTAL = data?.total || 0;
  const URGENTES = data?.urgentes || [];
  const maxCant = useMemo(() => Math.max(...ESTADOS.map((e) => e.cantidad), 1), [ESTADOS]);

  const selManual = useCallback((estado) => {
    setSel((s) => {
      if (s === estado) { setAutoRotate(true); return null; }
      setAutoRotate(false); pauseUntil.current = Date.now() + PAUSE_MS; return estado;
    });
  }, []);

  // Reloj
  useEffect(() => {
    const t = setInterval(() => setReloj(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-rotación
  useEffect(() => {
    if (!ESTADOS.length) return undefined;
    const t = setInterval(() => {
      if (!autoRotate && Date.now() < pauseUntil.current) return;
      if (!autoRotate) setAutoRotate(true);
      idx.current = (idx.current + 1) % ESTADOS.length;
      setSel(ESTADOS[idx.current].estado);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [autoRotate, ESTADOS]);

  const toggleFs = () => {
    const el = rootRef.current;
    if (!document.fullscreenElement) { el?.requestFullscreen?.(); setFs(true); }
    else { document.exitFullscreen?.(); setFs(false); }
  };
  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const selData = sel === 'URGENTES' ? URGENTES : sel ? (ESTADOS.find((e) => e.estado === sel)?.nvs || []) : [];
  const selColor = sel === 'URGENTES' ? '#ef4444' : ESTADOS.find((e) => e.estado === sel)?.color || '#6b7280';
  const selIcon = ESTADOS.find((e) => e.estado === sel)?.icon || '';

  if (!data) {
    return <div className="bg-[#0a0a0f] rounded-2xl min-h-[70vh] flex flex-col items-center justify-center gap-3"><Loader2 className="animate-spin text-orange-400" size={34} /><p className="text-gray-400 text-sm">Cargando…</p></div>;
  }

  return (
    <div ref={rootRef} className="anim-fade-up bg-[#0a0a0f] text-white rounded-2xl overflow-hidden border border-gray-800/60 p-5 flex flex-col min-h-[70vh]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-black text-lg">PTM</div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-tight">Centro de Control Logístico</h1>
            <p className="text-gray-500 text-[11px]">Seguimiento en tiempo real · datos de ejemplo</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => selManual('URGENTES')}
            className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 transition-all ${URGENTES.length > 0 ? 'bg-red-500/15 border border-red-500/50' : 'bg-gray-800/40 border border-gray-700/50'} ${sel === 'URGENTES' ? 'ring-2 ring-red-400' : ''}`}>
            <span className="text-xl">🚨</span>
            <div className="text-left">
              <CountUp end={URGENTES.length} className={`text-2xl font-black tabular-nums leading-none ${URGENTES.length > 0 ? 'text-red-400' : 'text-gray-500'}`} />
              <p className="text-gray-400 text-[10px] font-medium">Urgentes</p>
            </div>
          </button>
          <div className="text-right">
            <CountUp end={TOTAL} className="text-4xl font-black tabular-nums text-orange-400 leading-none" />
            <p className="text-gray-500 text-[11px] font-medium mt-0.5">NV activas</p>
          </div>
          <div className="flex flex-col items-end gap-1 border-l border-gray-800 pl-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-gray-300 text-xs font-bold">EN VIVO</span></span>
            <span className={`text-[11px] font-medium ${autoRotate ? 'text-orange-400' : 'text-gray-600'}`}>{autoRotate ? '▶ Auto-rotación' : '⏸ Pausado'}</span>
            <span className="text-gray-600 text-[10px] font-mono">{reloj}</span>
          </div>
          <button onClick={toggleFs} title="Pantalla completa" className="p-2 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-300">
            {fs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Barras */}
        <div className={`flex flex-col justify-center gap-2.5 transition-all ${sel ? 'lg:w-[45%]' : 'w-full'}`}>
          {ESTADOS.map((e) => {
            const pct = (e.cantidad / maxCant) * 100;
            const pctTotal = ((e.cantidad / TOTAL) * 100).toFixed(0);
            const nUrg = e.nvs.filter((n) => n.urgente).length;
            const activo = sel === e.estado;
            return (
              <button key={e.estado} onClick={() => selManual(e.estado)}
                className={`flex items-center gap-3 text-left rounded-xl transition-all px-2 py-1 ${activo ? 'bg-white/[0.06] ring-2 ring-white/20' : 'hover:bg-white/[0.03]'}`}>
                <div className="flex items-center gap-2 w-32 shrink-0 justify-end">
                  <span className="text-base">{e.icon}</span>
                  <span className="text-gray-200 text-sm font-bold text-right truncate">{e.estado}</span>
                </div>
                <div className="flex-1 bg-gray-800/40 rounded-lg overflow-hidden relative h-11">
                  <div className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center px-4"
                    style={{ width: `${Math.max(pct, 8)}%`, background: `linear-gradient(90deg, ${e.color}, ${e.color}cc)` }}>
                    <CountUp end={e.cantidad} className="text-lg font-black text-white drop-shadow tabular-nums" />
                  </div>
                  {nUrg > 0 && <span className="absolute right-11 top-1/2 -translate-y-1/2 text-[10px] text-red-400 font-bold animate-pulse">🚨 {nUrg}</span>}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold tabular-nums">{pctTotal}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalle */}
        {sel && (
          <div className="lg:w-[55%] bg-[#111118] rounded-2xl border border-gray-800/60 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60 shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full" style={{ background: selColor }} />
                <h2 className="text-lg font-black">{sel === 'URGENTES' ? '🚨 NVs Urgentes' : `${selIcon} ${sel}`}</h2>
                <span className="text-gray-500 text-sm font-medium">({selData.length})</span>
              </div>
              <button onClick={() => selManual(sel)} className="text-gray-500 hover:text-white text-2xl leading-none px-2">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[52vh]">
              {selData.length === 0 ? <p className="text-gray-600 text-center py-8">Sin NVs</p>
                : selData.map((n, i) => <NvRow key={`${n.nv}-${i}`} n={n} color={selColor} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
