import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { fetchTVEstados } from '../dash/dashData';
import { ESTADOS } from '../dash/dashHelpers';
import { supabase } from '../../../supabase';
import { Logger } from '../../../lib/logger';
import CountUp from './ui/CountUp';

const REFRESH_MS = 30_000;
const ROTATE_MS = 8_000;
const PAUSE_AFTER_CLICK_MS = 15_000;

const COLORES = {
  [ESTADOS.EN_PROCESO]: '#f59e0b',
  [ESTADOS.SHIPPING]: '#8b5cf6',
  [ESTADOS.EN_RUTA]: '#06b6d4',
  [ESTADOS.ENTREGADO]: '#22c55e'
};

const ICONOS = {
  [ESTADOS.EN_PROCESO]: '⚙',
  [ESTADOS.SHIPPING]: '📋',
  [ESTADOS.EN_RUTA]: '🛣',
  [ESTADOS.ENTREGADO]: '✓'
};

function diasBadge(dias) {
  if (dias === null) return null;
  const color =
    dias > 5
      ? 'bg-red-500/20 text-red-400'
      : dias > 2
        ? 'bg-amber-500/20 text-amber-400'
        : 'bg-gray-700/40 text-gray-400';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color} tabular-nums`}>
      {dias}d
    </span>
  );
}

function NvCard({ n, estado }) {
  const color = COLORES[estado] || '#6b7280';

  const contextInfo = () => {
    if (estado === ESTADOS.EN_RUTA) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400 text-xs font-bold">
            {n.transportista !== '—' ? n.transportista : ''}
          </span>
          {diasBadge(n.diasEnEstado)}
        </div>
      );
    }
    if (estado === ESTADOS.ENTREGADO) {
      return (
        <div className="flex items-center gap-1.5">
          {n.fecha_entregado && (
            <span className="text-emerald-400 text-[11px] font-medium">{n.fecha_entregado}</span>
          )}
          {n.transportista !== '—' && (
            <span className="text-gray-500 text-[10px]">· {n.transportista}</span>
          )}
        </div>
      );
    }
    if (estado === ESTADOS.SHIPPING || estado === ESTADOS.EN_PROCESO) {
      const aprobReal = !!n.fecha_aprobacion_real;
      return (
        <div className="flex flex-col items-end gap-1">
          {estado === ESTADOS.SHIPPING && n.shippingSubestado && (
            <span className="rounded bg-violet-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-violet-300">
              ⏸{' '}
              {n.shippingSubestado === 'REZAGADA_COMERCIAL'
                ? 'Rezagada comercial'
                : 'Retiro cliente'}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-[9px] uppercase tracking-wide">
              {aprobReal ? 'Aprob. real' : 'Aprob.'}
            </span>
            {n.fecha_aprob_efectiva ? (
              <span
                className={`text-[11px] font-medium ${aprobReal ? 'text-emerald-400' : 'text-gray-400'}`}
              >
                {n.fecha_aprob_efectiva}
              </span>
            ) : (
              <span className="text-gray-600 text-[10px]">sin fecha</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {n.diasDesdeAprobacion !== null
              ? diasBadge(n.diasDesdeAprobacion)
              : diasBadge(n.diasEnEstado)}
            {n.fecha_compromiso && (
              <span className="text-gray-500 text-[10px]">comp: {n.fecha_compromiso}</span>
            )}
          </div>
        </div>
      );
    }
    return n.transportista !== '—' ? (
      <span className="text-gray-500 text-[10px]">{n.transportista}</span>
    ) : null;
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${n.urgente ? 'spotlight-card bg-red-500/10' : 'bg-white/[0.03] border border-gray-800/40 hover:bg-white/[0.05]'}`}
    >
      {n.urgente && <span className="text-sm shrink-0">🚨</span>}
      <div className="w-1 h-8 rounded-full shrink-0" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[15px] font-bold tabular-nums"
            style={{ color: n.urgente ? '#f87171' : '#e5e7eb' }}
          >
            {n.nv}
          </span>
          <span className="text-[8px] uppercase tracking-wider text-gray-500 bg-gray-800/60 rounded px-1.5 py-0.5 font-medium">
            {n.canal}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 truncate">
          {n.cliente}
          {n.vendedor !== '—' ? ` · ${n.vendedor}` : ''}
        </p>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">{contextInfo()}</div>
    </div>
  );
}

export default function TVDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [error, setError] = useState(null);
  const [sel, setSel] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const pauseUntilRef = useRef(0);
  const rotateIdxRef = useRef(0);

  const handleManualSel = useCallback((estado) => {
    setSel((s) => {
      if (s === estado) {
        setAutoRotate(true);
        return null;
      }
      setAutoRotate(false);
      pauseUntilRef.current = Date.now() + PAUSE_AFTER_CLICK_MS;
      return estado;
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      const d = await fetchTVEstados();
      setData(d);
      setError(null);
      setLastUpdate(
        new Date().toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    } catch (e) {
      Logger.error(e, {
        module: 'panel',
        screen: 'PanelTV',
        action: 'fetch_tv_estados',
        message: 'Fallo la carga de estados para Modo TV'
      });
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  // Realtime SIEMPRE: recarga en vivo ante cualquier cambio en operaciones
  // (además del poll de respaldo) y al finalizar sync/import.
  useEffect(() => {
    let t;
    const ch = supabase
      .channel('panel_tv_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_operaciones' }, () => {
        clearTimeout(t);
        t = setTimeout(loadData, 1200);
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_operaciones_sync' },
        () => {
          clearTimeout(t);
          t = setTimeout(loadData, 1200);
        }
      )
      .subscribe();
    return () => {
      clearTimeout(t);
      supabase.removeChannel(ch);
    };
  }, [loadData]);

  useEffect(() => {
    if (!data || data.estados.length === 0) return;
    const timer = setInterval(() => {
      if (!autoRotate && Date.now() < pauseUntilRef.current) return;
      if (!autoRotate && Date.now() >= pauseUntilRef.current) setAutoRotate(true);
      const nombres = data.estados.map((e) => e.estado);
      if (nombres.length === 0) return;
      rotateIdxRef.current = (rotateIdxRef.current + 1) % nombres.length;
      setSel(nombres[rotateIdxRef.current]);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [data, autoRotate]);

  // ⚠️ Hooks SIEMPRE antes de cualquier return condicional (reglas de hooks).
  // Guardamos contra data=null para que el orden de hooks sea estable entre renders.
  const estadosArr = data?.estados ?? [];
  const urgentesArr = data?.urgentes ?? [];
  const maxCantidad = useMemo(
    () => Math.max(...estadosArr.map((e) => e.cantidad), 1),
    [estadosArr]
  );
  const detalleNvs = useMemo(
    () =>
      sel === 'URGENTES'
        ? urgentesArr
        : sel
          ? estadosArr.find((e) => e.estado === sel)?.nvs || []
          : [],
    [sel, estadosArr, urgentesArr]
  );

  // Escalado tipo kiosco: el tablero se diseña a 1920×1080 y se escala para
  // LLENAR cualquier TV 16:9 (32" 1366×768, 55" 1080p, etc.) sin cortes ni scroll.
  const [fit, setFit] = useState({ s: 1, left: 0, top: 0 });
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth,
        vh = window.innerHeight;
      const s = Math.min(vw / 1920, vh / 1080);
      setFit({ s, left: (vw - 1920 * s) / 2, top: (vh - 1080 * s) / 2 });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // Botón para salir del modo kiosco (el TV cubre toda la pantalla).
  const SalirBtn = (
    <button
      onClick={() => navigate('/panel')}
      className="absolute top-4 right-4 z-[71] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/15"
    >
      ✕ Salir
    </button>
  );

  if (loading && !data) {
    return createPortal(
      <div className="fixed inset-0 z-[110] bg-[#0a0a0f] flex items-center justify-center">
        {SalirBtn}
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-400 text-2xl">Cargando…</p>
        </div>
      </div>,
      document.body
    );
  }

  if (!data) {
    return createPortal(
      <div className="fixed inset-0 z-[110] bg-[#0a0a0f] flex items-center justify-center p-8">
        {SalirBtn}
        <div className="text-center max-w-lg">
          <p className="text-red-400 text-2xl font-semibold mb-2">No se pudo cargar</p>
          {error && <p className="text-gray-500 text-sm font-mono break-words">{error}</p>}
          <p className="text-gray-600 text-sm mt-4">Reintentando cada {REFRESH_MS / 1000}s…</p>
        </div>
      </div>,
      document.body
    );
  }

  const { estados, total, urgentes } = data;
  const numEstados = estados.length || 1;
  const detalleColor = sel === 'URGENTES' ? '#ef4444' : sel ? COLORES[sel] || '#6b7280' : '#6b7280';
  const detalleEstado = sel === 'URGENTES' ? 'URGENTES' : sel || '';

  return createPortal(
    <div className="fixed inset-0 z-[110] overflow-hidden bg-black">
      {SalirBtn}
      <div
        className="overflow-hidden bg-[#0a0a0f] text-white flex flex-col p-5"
        style={{
          position: 'absolute',
          width: 1920,
          height: 1080,
          left: fit.left,
          top: fit.top,
          transform: `scale(${fit.s})`,
          transformOrigin: 'top left',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-black text-xl tracking-tight">
              PTM
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight leading-tight">
                Centro de Control Logístico
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                PTM Health Care · Seguimiento en tiempo real
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleManualSel(sel === 'URGENTES' ? null : 'URGENTES')}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all ${urgentes.length > 0 ? 'bg-red-500/15 border-glow-red' : 'bg-gray-800/40 border-2 border-gray-700/50'} ${sel === 'URGENTES' ? 'ring-2 ring-red-400' : ''}`}
            >
              <span className="text-2xl">🚨</span>
              <div className="text-left">
                <CountUp
                  end={urgentes.length}
                  className={`text-3xl font-black tabular-nums leading-none ${urgentes.length > 0 ? 'text-red-400' : 'text-gray-500'}`}
                />
                <p className="text-gray-400 text-[10px] font-medium">Urgentes</p>
              </div>
            </button>
            <div className="text-right">
              <CountUp
                end={total}
                className="text-5xl font-black tabular-nums text-orange-400 leading-none"
              />
              <p className="text-gray-500 text-xs font-medium mt-0.5">NV activas</p>
            </div>
            <div className="flex flex-col items-end gap-1 border-l border-gray-800 pl-5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gray-300 text-xs font-semibold">EN VIVO</span>
              </div>
              <span
                className={`text-[11px] font-medium ${autoRotate ? 'text-orange-400' : 'text-gray-600'}`}
              >
                {autoRotate ? '▶ Auto-rotación' : '⏸ Pausado'}
              </span>
              <span className="text-gray-600 text-[10px] font-mono">{lastUpdate}</span>
            </div>
          </div>
        </div>

        {/* Cuerpo: barras (izq) + detalle (der) */}
        <div className="flex-1 flex gap-5 min-h-0 overflow-hidden">
          {/* Estados — barras horizontales */}
          <div
            className={`flex flex-col justify-center transition-all ${sel ? 'w-[45%]' : 'w-full'}`}
            style={{ gap: `${Math.min(14, Math.max(6, Math.floor(70 / numEstados)))}px` }}
          >
            {estados.map((e) => {
              const pct = maxCantidad > 0 ? (e.cantidad / maxCantidad) * 100 : 0;
              const color = COLORES[e.estado] || '#6b7280';
              const icon = ICONOS[e.estado] || '●';
              const pctTotal = total > 0 ? ((e.cantidad / total) * 100).toFixed(0) : '0';
              const nUrg = e.nvs.filter((n) => n.urgente).length;
              const activo = sel === e.estado;
              const barH = Math.min(60, Math.max(36, Math.floor(520 / numEstados)));
              return (
                <button
                  key={e.estado}
                  onClick={() => handleManualSel(sel === e.estado ? null : e.estado)}
                  className={`flex items-center gap-4 text-left rounded-xl transition-all shrink-0 px-3 py-1 ${activo ? 'bg-white/[0.06] ring-2 ring-white/20 scale-[1.01]' : 'hover:bg-white/[0.03]'}`}
                >
                  <div className="flex items-center gap-2 w-36 shrink-0 justify-end">
                    <span className="text-lg">{icon}</span>
                    <span className="text-gray-200 text-sm font-semibold text-right truncate">
                      {e.estado}
                    </span>
                  </div>
                  <div
                    className="flex-1 bg-gray-800/40 rounded-lg overflow-hidden relative"
                    style={{ height: barH }}
                  >
                    <div
                      className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-between px-4"
                      style={{
                        width: `${Math.max(pct, 5)}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`
                      }}
                    >
                      <CountUp
                        end={e.cantidad}
                        className="text-xl font-black text-white drop-shadow-lg tabular-nums"
                      />
                    </div>
                    {nUrg > 0 && (
                      <span className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] text-red-400 font-bold flex items-center gap-0.5 animate-pulse">
                        🚨 {nUrg}
                      </span>
                    )}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold tabular-nums">
                      {pctTotal}%
                    </span>
                  </div>
                </button>
              );
            })}
            {estados.length === 0 && (
              <p className="text-gray-600 text-2xl text-center">Sin NVs activas</p>
            )}
          </div>

          {/* Panel de detalle — NVs del estado seleccionado */}
          {sel && (
            <div className="w-[55%] bg-[#111118] rounded-2xl border border-gray-800/60 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ background: detalleColor }} />
                  <h2 className="text-xl font-bold">
                    {sel === 'URGENTES' ? '🚨 NVs Urgentes' : `${ICONOS[sel] || ''} ${sel}`}
                  </h2>
                  <span className="text-gray-500 text-base font-medium">({detalleNvs.length})</span>
                </div>
                <div className="flex items-center gap-3">
                  {sel !== 'URGENTES' && (
                    <span className="text-gray-500 text-xs">
                      {sel === ESTADOS.EN_RUTA
                        ? 'Destacado: transportista'
                        : sel === ESTADOS.ENTREGADO
                          ? 'Destacado: fecha entrega'
                          : sel === ESTADOS.SHIPPING
                            ? 'Días desde aprobación'
                            : sel === ESTADOS.EN_PROCESO
                              ? 'Días desde aprobación'
                              : ''}
                    </span>
                  )}
                  <button
                    onClick={() => handleManualSel(null)}
                    className="text-gray-500 hover:text-white text-2xl leading-none px-2 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {detalleNvs.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">Sin NVs</p>
                ) : (
                  detalleNvs.map((n, i) => (
                    <div
                      key={`${n.canal}-${n.nv}-${i}`}
                      className="anim-list-item"
                      style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                    >
                      <NvCard n={n} estado={detalleEstado} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
