import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { fetchTVEstados } from '../dash/dashData';
import { ESTADOS } from '../dash/dashHelpers';
import { supabase } from '../../../supabase';
import { Logger } from '../../../lib/logger';
import CountUp from './ui/CountUp';
import { isFeatureFlagEnabled } from '../../../config/featureFlags';

const REFRESH_MS = 30_000;
const REALTIME_POLL_SUPPRESS_MS = 60_000;
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
  const tvV2 = isFeatureFlagEnabled('web_tv_v2');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [error, setError] = useState(null);
  const [sel, setSel] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [clock, setClock] = useState(() => new Date());
  const pauseUntilRef = useRef(0);
  const rotateIdxRef = useRef(0);
  const inFlightLoadRef = useRef(null);
  const lastLoadAtRef = useRef(0);
  const pollSuppressedUntilRef = useRef(0);

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

  const loadData = useCallback(async (reason = 'manual') => {
    if (reason === 'poll') {
      if (typeof document !== 'undefined' && document.hidden) return null;
      if (Date.now() < pollSuppressedUntilRef.current) return null;
    }
    if (inFlightLoadRef.current) return inFlightLoadRef.current;

    const run = (async () => {
      try {
        const d = await fetchTVEstados();
        lastLoadAtRef.current = Date.now();
        setData(d);
        setError(null);
        setLastUpdate(
          new Date().toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        );
        return d;
      } catch (e) {
        Logger.error(e, {
          module: 'panel',
          screen: 'PanelTV',
          action: 'fetch_tv_estados',
          message: 'Fallo la carga de estados para Modo TV',
          context: { reason }
        });
        setError(e instanceof Error ? e.message : String(e));
        return null;
      } finally {
        setLoading(false);
        inFlightLoadRef.current = null;
      }
    })();

    inFlightLoadRef.current = run;
    return run;
  }, []);

  useEffect(() => {
    void loadData('initial');
    const interval = setInterval(() => {
      void loadData('poll');
    }, REFRESH_MS);
    const onVisibility = () => {
      if (
        typeof document !== 'undefined' &&
        !document.hidden &&
        Date.now() - lastLoadAtRef.current >= REFRESH_MS
      ) {
        void loadData('visibility');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Realtime es la fuente primaria de frescura. El polling queda como respaldo y
  // se suprime temporalmente después de un evento para evitar consultas duplicadas.
  useEffect(() => {
    let t;
    const scheduleRealtimeRefresh = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        pollSuppressedUntilRef.current = Date.now() + REALTIME_POLL_SUPPRESS_MS;
        void loadData('realtime');
      }, 1200);
    };
    const ch = supabase
      .channel('panel_tv_rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_operaciones' },
        scheduleRealtimeRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_operaciones_sync' },
        scheduleRealtimeRefresh
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
    <div
      className="fixed inset-0 z-[110] overflow-hidden bg-black"
      data-ui-surface={tvV2 ? 'tv-v2' : 'tv-legacy'}
    >
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
            {tvV2 && (
              <div
                className="border-r border-gray-800 pr-6 text-right"
                aria-label="Hora del tablero"
              >
                <p className="text-3xl font-black tabular-nums text-white">
                  {clock.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                  {clock.toLocaleDateString('es-CL', {
                    weekday: 'short',
                    day: '2-digit',