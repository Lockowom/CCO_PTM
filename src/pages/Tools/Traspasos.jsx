import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Loader2, ExternalLink, ArrowLeftRight, FolderOpen, ChevronDown, ChevronUp,
  MailCheck, GitBranch, Package, AlertTriangle, Sparkles, Boxes, ShieldCheck, Workflow,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useAccionesCalidad, useAreasCalidad, useAccionCorreoEnviado,
  TIPOS_ACCION, ESTADO_ACCION_META,
} from '../../services/calidadService';
import useRealtimeTable from '../../hooks/useRealtimeTable';
import TrazabilidadModal from '../Quality/TrazabilidadModal';

// Registro de Traspasos · Correo (app estática vendorizada en public/traspasos).
// Se embebe en un iframe para conservar el framework/navbar de CCO, con la
// cabecera de módulo estándar de CCO alrededor. Datos en Supabase
// (cco-bridge.js) + localStorage. Actualizable con `npm run update:traspasos`.
//
// Carpeta CALIDAD TRAZABILIDAD: aquí caen las solicitudes que Calidad deriva a
// bodega (ajuste/baja/transitorio/reacondicionar). Al generar el correo de
// traspaso y marcar "Correo enviado", la tarea de Calidad se resuelve sola
// según el dictamen (RPC accion_correo_enviado) y queda en la trazabilidad.
const SRC = '/traspasos/index.html';

const TIPOS_BODEGA = new Set(['AJUSTE', 'BAJA', 'TRANSITORIO', 'REACONDICIONAR']);
const TIPO_LABEL = Object.fromEntries(TIPOS_ACCION.map(t => [t.id, t.label]));
const DICTAMEN_CLS = {
  BAJA: 'bg-rose-100 text-rose-700 border-rose-200',
  RECHAZAR: 'bg-rose-100 text-rose-700 border-rose-200',
  CUARENTENA: 'bg-orange-100 text-orange-700 border-orange-200',
  REPROCESO: 'bg-amber-100 text-amber-700 border-amber-200',
  LIBERAR: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function HeroChip({ icon: Icon, children, tone = 'slate' }) {
  const tones = {
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    slate: 'bg-white/80 text-slate-600 border-slate-200',
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] sm:text-xs font-black ${tones[tone] || tones.slate}`}>
      <Icon size={13} />
      <span>{children}</span>
    </div>
  );
}

function HeroMetric({ label, value, helper, tone = 'orange' }) {
  const tones = {
    orange: 'from-orange-500/12 to-amber-500/10 border-orange-200/70',
    emerald: 'from-emerald-500/12 to-teal-500/10 border-emerald-200/70',
    indigo: 'from-indigo-500/12 to-sky-500/10 border-indigo-200/70',
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${tones[tone] || tones.orange} p-4 backdrop-blur-sm`}>
      <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg sm:text-2xl font-black text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{helper}</div>
    </div>
  );
}

// Carpeta con las solicitudes de Calidad pendientes de traspaso.
function CarpetaCalidadTrazabilidad() {
  const { user, hasPermission } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const { data: acciones = [] } = useAccionesCalidad();
  const { data: areas = [] } = useAreasCalidad();
  const correoEnviado = useAccionCorreoEnviado();
  useRealtimeTable('tms_calidad_acciones', ['calidad_acciones'], { debounceMs: 400 });

  const [abierta, setAbierta] = useState(true);
  const [traza, setTraza] = useState(null);

  const misAreas = useMemo(
    () => new Set(areas.filter(a => Array.isArray(a.roles) && a.roles.includes(user?.rol)).map(a => a.codigo)),
    [areas, user?.rol]
  );
  const puedeActuar = (a) => isAdmin || misAreas.has(a.area_responsable)
    || hasPermission('manage_inventory') || hasPermission('manage_quality');

  // Solicitudes de bodega abiertas (pendientes o en proceso).
  const solicitudes = useMemo(
    () => acciones.filter(a => TIPOS_BODEGA.has(a.tipo_accion) && (a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO')),
    [acciones]
  );
  const urgentes = useMemo(
    () => solicitudes.filter(a => a.prioridad === 'URGENTE').length,
    [solicitudes]
  );
  const enProceso = useMemo(
    () => solicitudes.filter(a => a.estado === 'EN_PROCESO').length,
    [solicitudes]
  );

  const marcarEnviado = async (a) => {
    const ref = prompt(`¿Correo de traspaso ENVIADO para ${a.folio}?\nReferencia (opcional, ej. correlativo del traspaso):`, '');
    if (ref === null) return; // canceló
    try {
      const res = await correoEnviado.mutateAsync({ accionId: a.id, referencia: ref.trim() || null });
      toast.success(`${a.folio} resuelta — ${res.resolucion}`);
    } catch (e) { toast.error(e.message || 'Error al marcar el correo'); }
  };

  if (!solicitudes.length) return null; // sin solicitudes, la carpeta no estorba

  return (
    <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 shrink-0">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-200/80 bg-white shadow-[0_18px_50px_-30px_rgba(16,185,129,0.45)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_34%)]" />
        <button
          onClick={() => setAbierta(v => !v)}
          className="relative w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 hover:bg-emerald-50/40 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
              <FolderOpen size={19} />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-black text-slate-900 text-sm sm:text-base tracking-wide">CALIDAD TRAZABILIDAD</div>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                  <Sparkles size={11} />
                  En vivo
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 line-clamp-2">
                Solicitudes derivadas por Calidad a bodega. Genera el traspaso, envía el correo y conserva la trazabilidad operativa.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-1 text-[11px] font-black text-slate-600">
              <span>{urgentes} urgentes</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{enProceso} en proceso</span>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-sm">{solicitudes.length}</span>
            {abierta ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>
        </button>

        {abierta && (
          <div className="relative px-3 sm:px-5 pb-5 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Solicitudes abiertas</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{solicitudes.length}</div>
                <div className="text-xs text-slate-500">Pendientes de traspaso o resolución</div>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">Urgencia</div>
                <div className="mt-2 text-2xl font-black text-rose-700">{urgentes}</div>
                <div className="text-xs text-rose-600">Casos que piden atención inmediata</div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">En proceso</div>
                <div className="mt-2 text-2xl font-black text-amber-700">{enProceso}</div>
                <div className="text-xs text-amber-600">Solicitudes que ya están siendo gestionadas</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {solicitudes.map(a => {
                const meta = ESTADO_ACCION_META[a.estado] || {};
                return (
                  <div
                    key={a.id}
                    className="group rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-25px_rgba(15,23,42,0.28)]"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-black text-slate-700 text-xs tracking-wide">{a.folio}</span>
                      <div className="flex items-center gap-1">
                        {a.prioridad === 'URGENTE' && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-0.5"><AlertTriangle size={10} /> Urgente</span>
                        )}
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${meta.cls}`}>{meta.label || a.estado}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                      <p className="font-black text-slate-900 text-sm flex items-center gap-2"><Package size={14} className="text-slate-400" />{a.codigo_producto}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.producto || 'Sin nombre descriptivo'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <span className="text-[9px] font-black px-2 py-1 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">{TIPO_LABEL[a.tipo_accion] || a.tipo_accion}</span>
                      {a.dictamen && <span className={`text-[9px] font-black px-2 py-1 rounded-md border ${DICTAMEN_CLS[a.dictamen] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{a.dictamen}</span>}
                      {a.bodega_destino && <span className="text-[9px] font-black px-2 py-1 rounded-md border bg-slate-100 text-slate-600 border-slate-200">Destino {a.bodega_destino}</span>}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
                        <div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Partida</div>
                        <div className="mt-1 text-[11px] font-bold text-slate-700 truncate">{a.partida || 'N/A'}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
                        <div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Ubicación</div>
                        <div className="mt-1 text-[11px] font-bold text-slate-700 truncate">{a.ubicacion || 'N/A'}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
                        <div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Cantidad</div>
                        <div className="mt-1 text-[11px] font-bold text-slate-700 truncate">{a.cantidad != null ? `${a.cantidad} u` : 'N/A'}</div>
                      </div>
                    </div>

                    {a.descripcion && <p className="text-[11px] text-slate-600 mt-3 italic line-clamp-2">“{a.descripcion}”</p>}

                    <div className="flex gap-2 mt-3.5 pt-3 border-t border-slate-100">
                      {puedeActuar(a) && (
                        <button onClick={() => marcarEnviado(a)} disabled={correoEnviado.isPending}
                          className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center gap-1.5 hover:bg-emerald-700 shadow-sm disabled:opacity-50">
                          <MailCheck size={13} /> Correo enviado
                        </button>
                      )}
                      <button onClick={() => setTraza(a)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-black text-[11px] flex items-center gap-1.5 hover:bg-slate-50">
                        <GitBranch size={13} /> Traza
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {traza && (
        <TrazabilidadModal codigo={traza.codigo_producto} partida={traza.partida} ubicacion={traza.ubicacion}
          producto={traza.producto} onClose={() => setTraza(null)} />
      )}
    </div>
  );
}

const Traspasos = () => {
  const [cargando, setCargando] = useState(true);
  const [iframeHeight, setIframeHeight] = useState('calc(100vh - 220px)');
  const iframeRef = useRef(null);

  const syncIframeHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const body = doc.body;
      const html = doc.documentElement;
      const nextHeight = Math.max(
        body?.scrollHeight || 0,
        body?.offsetHeight || 0,
        html?.clientHeight || 0,
        html?.scrollHeight || 0,
        html?.offsetHeight || 0
      );
      if (nextHeight > 0) {
        setIframeHeight(`${nextHeight}px`);
      }
    } catch {
      // same-origin esperado; si no se pudiera leer, mantenemos altura base.
    }
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    let frameWindow;
    let resizeObserver;
    let mutationObserver;
    let intervalId;

    const attachObservers = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        const body = doc.body;
        const html = doc.documentElement;

        syncIframeHeight();

        if (window.ResizeObserver && body) {
          resizeObserver = new ResizeObserver(() => syncIframeHeight());
          resizeObserver.observe(body);
          if (html) resizeObserver.observe(html);
        }

        if (window.MutationObserver && body) {
          mutationObserver = new MutationObserver(() => syncIframeHeight());
          mutationObserver.observe(body, { childList: true, subtree: true, attributes: true });
        }

        frameWindow = iframe.contentWindow;
        frameWindow?.addEventListener('resize', syncIframeHeight);
        intervalId = window.setInterval(syncIframeHeight, 1200);
      } catch {
        // no-op
      }
    };

    const onLoad = () => attachObservers();
    iframe.addEventListener('load', onLoad);

    return () => {
      iframe.removeEventListener('load', onLoad);
      frameWindow?.removeEventListener('resize', syncIframeHeight);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [syncIframeHeight]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%),#f8fafc]">
      <div className="relative overflow-hidden bg-white/95 rounded-[1.75rem] sm:rounded-[2rem] border border-slate-200 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] px-5 sm:px-7 py-5 sm:py-7 shrink-0 m-3 sm:m-6 mb-0">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.09),transparent_24%)]" />

        <div className="relative flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 rounded-[1.5rem] flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                <ArrowLeftRight size={26} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <HeroChip icon={Sparkles} tone="orange">Reformado</HeroChip>
                  <HeroChip icon={Boxes} tone="indigo">Operación embebida</HeroChip>
                  <HeroChip icon={ShieldCheck} tone="emerald">Trazabilidad activa</HeroChip>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Registro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Traspasos</span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-3xl">
                  Unificamos la experiencia del módulo para que el acceso a traspasos, ajustes y correos operativos tenga mejor jerarquía visual, mejor foco de acciones y una lectura más clara para bodega.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              <HeroMetric label="Módulo" value="Traspasos y ajustes" helper="Operación centralizada para bodega y soporte." tone="orange" />
              <HeroMetric label="Integración" value="Iframe embebido" helper="Mantiene el shell CCO y el acceso directo al flujo legado." tone="indigo" />
              <HeroMetric label="Trazabilidad" value="Calidad conectada" helper="Las derivaciones se resuelven con contexto y seguimiento." tone="emerald" />
            </div>
          </div>

          <div className="relative flex flex-col gap-3 xl:w-[320px]">
            <a
              href={SRC}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir en pestaña"
              className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-black flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-orange-200 hover:text-orange-600 transition-colors shadow-sm"
            >
              <ExternalLink size={16} /> Abrir módulo completo
            </a>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                <Workflow size={16} className="text-orange-500" />
                Flujo recomendado
              </div>
              <div className="mt-3 space-y-2 text-xs text-slate-500">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">1. Revisa solicitudes derivadas por Calidad.</div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">2. Ejecuta el traspaso o ajuste en el módulo embebido.</div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">3. Marca el correo enviado y conserva la trazabilidad.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CarpetaCalidadTrazabilidad />

      <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 mb-3 sm:mb-6 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 px-1">
          <div>
            <div className="text-sm sm:text-base font-black text-slate-900">Entorno operativo integrado</div>
            <div className="text-xs text-slate-500">Sin marco extra y con altura automática para evitar doble scroll.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-black">
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">Traspasos</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">Ajustes</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">Calidad conectada</span>
          </div>
        </div>

        <div className="relative">
          {cargando && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))] backdrop-blur-sm rounded-[1.5rem]">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-orange-400/20 blur-xl" />
                <div className="relative w-16 h-16 rounded-full border border-orange-100 bg-white flex items-center justify-center shadow-lg">
                  <Loader2 className="animate-spin text-orange-500" size={28} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-700">Cargando módulo operativo</p>
                <p className="text-xs text-slate-400 mt-1">Preparando el entorno de traspasos dentro de CCO.</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={SRC}
            title="Registro de Traspasos"
            onLoad={() => {
              setCargando(false);
              syncIframeHeight();
            }}
            className="w-full border-0 bg-transparent"
            style={{ minHeight: 'calc(100vh - 220px)', height: iframeHeight }}
            allow="clipboard-write; clipboard-read"
          />
        </div>
      </div>
    </div>
  );
};

export default Traspasos;
