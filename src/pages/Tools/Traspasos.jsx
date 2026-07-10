import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Loader2, ExternalLink, ArrowLeftRight, FolderOpen, ChevronDown, ChevronUp,
  MailCheck, GitBranch, Package, AlertTriangle,
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
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
        <button onClick={() => setAbierta(v => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-emerald-50/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <FolderOpen size={17} />
            </div>
            <div className="text-left min-w-0">
              <div className="font-black text-slate-800 text-sm tracking-wide">CALIDAD TRAZABILIDAD</div>
              <div className="text-[11px] text-slate-500 truncate">Solicitudes del dictamen de Calidad para bodega · genera el traspaso y marca el correo enviado</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white">{solicitudes.length}</span>
            {abierta ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>
        </button>

        {abierta && (
          <div className="px-3 sm:px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {solicitudes.map(a => {
              const meta = ESTADO_ACCION_META[a.estado] || {};
              return (
                <div key={a.id} className="rounded-xl border border-slate-200 p-3.5 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono font-black text-slate-700 text-xs">{a.folio}</span>
                    <div className="flex items-center gap-1">
                      {a.prioridad === 'URGENTE' && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-0.5"><AlertTriangle size={10} /> Urgente</span>
                      )}
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${meta.cls}`}>{meta.label || a.estado}</span>
                    </div>
                  </div>
                  <p className="font-black text-slate-900 text-xs flex items-center gap-1"><Package size={12} className="text-slate-400" />{a.codigo_producto}</p>
                  <p className="text-[11px] text-slate-500 truncate">{a.producto || ''}</p>
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">{TIPO_LABEL[a.tipo_accion] || a.tipo_accion}</span>
                    {a.dictamen && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${DICTAMEN_CLS[a.dictamen] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{a.dictamen}</span>}
                    {a.bodega_destino && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200">→ BD {a.bodega_destino}</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {a.partida ? `Partida ${a.partida} · ` : ''}{a.ubicacion ? `${a.ubicacion} · ` : ''}{a.cantidad != null ? `${a.cantidad} u` : ''}
                  </p>
                  {a.descripcion && <p className="text-[11px] text-slate-600 mt-1 italic line-clamp-2">“{a.descripcion}”</p>}
                  <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100">
                    {puedeActuar(a) && (
                      <button onClick={() => marcarEnviado(a)} disabled={correoEnviado.isPending}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center gap-1 hover:bg-emerald-700 disabled:opacity-50">
                        <MailCheck size={12} /> Correo enviado
                      </button>
                    )}
                    <button onClick={() => setTraza(a)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 font-black text-[11px] flex items-center gap-1 hover:bg-slate-50">
                      <GitBranch size={12} /> Traza
                    </button>
                  </div>
                </div>
              );
            })}
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

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      {/* Cabecera estilo módulo CCO */}
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4 shrink-0 m-3 sm:m-6 mb-0 sm:mb-0">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <ArrowLeftRight size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
              Registro de <span className="text-orange-600">Traspasos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Registra traspasos y ajustes de inventario y genera el correo listo para enviar
            </p>
          </div>
        </div>
        <a
          href={SRC}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir en pestaña"
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-black flex items-center gap-2 hover:bg-slate-50 hover:border-orange-200 hover:text-orange-600 transition-colors shrink-0"
        >
          <ExternalLink size={15} /> <span className="hidden sm:inline">Abrir</span>
        </a>
      </div>

      {/* Carpeta CALIDAD TRAZABILIDAD (solicitudes del dictamen para bodega) */}
      <CarpetaCalidadTrazabilidad />

      {/* Lienzo del módulo (iframe a todo el ancho, sin marco) */}
      <div className="relative flex-1 min-h-[70vh] mt-3 sm:mt-4 bg-slate-50">
        {cargando && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50">
            <Loader2 className="animate-spin text-orange-500" size={34} />
            <p className="text-xs font-bold text-slate-400">Cargando módulo…</p>
          </div>
        )}
        <iframe
          src={SRC}
          title="Registro de Traspasos"
          onLoad={() => setCargando(false)}
          className="w-full h-full min-h-[70vh] border-0"
          allow="clipboard-write; clipboard-read"
        />
      </div>
    </div>
  );
};

export default Traspasos;
