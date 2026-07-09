import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Inbox, Loader2, AlertTriangle, CheckCircle2, Clock, Package, RefreshCw,
  PlayCircle, GitBranch, Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useAccionesCalidad, useAreasCalidad, useResolverAccion,
  TIPOS_ACCION, ESTADO_ACCION_META,
} from '../../services/calidadService';
import useRealtimeTable from '../../hooks/useRealtimeTable';
import TrazabilidadModal from './TrazabilidadModal';

const TIPO_LABEL = Object.fromEntries(TIPOS_ACCION.map(t => [t.id, t.label]));

const MiBandeja = () => {
  const { user, hasPermission } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const canQuality = hasPermission('manage_quality') || hasPermission('manage_monitoreo');
  const { data: acciones = [], isLoading, refetch, isFetching } = useAccionesCalidad();
  const { data: areas = [] } = useAreasCalidad();
  const resolver = useResolverAccion();
  useRealtimeTable('tms_calidad_acciones', ['calidad_acciones'], { debounceMs: 400 });

  const [verTodas, setVerTodas] = useState(false);   // admin/calidad: ver todas las áreas
  const [soloPend, setSoloPend] = useState(true);
  const [resolviendo, setResolviendo] = useState(null);
  const [texto, setTexto] = useState('');
  const [traza, setTraza] = useState(null);          // acción cuya trazabilidad se ve

  const areaByCode = useMemo(() => Object.fromEntries(areas.map(a => [a.codigo, a])), [areas]);
  const misAreas = useMemo(
    () => new Set(areas.filter(a => Array.isArray(a.roles) && a.roles.includes(user?.rol)).map(a => a.codigo)),
    [areas, user?.rol]
  );
  const puedeVerTodo = isAdmin || canQuality;
  const puedeResolver = (a) => isAdmin || misAreas.has(a.area_responsable);

  // Un supervisor sin área asignada (admin/Calidad) ve todo por defecto; un rol de
  // área ve solo lo suyo salvo que active "ver todas".
  const efectivoTodas = (verTodas && puedeVerTodo) || (puedeVerTodo && misAreas.size === 0);
  const lista = useMemo(() => {
    let l = acciones;
    if (!efectivoTodas) l = l.filter(a => misAreas.has(a.area_responsable));
    if (soloPend) l = l.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO');
    return l;
  }, [acciones, efectivoTodas, misAreas, soloPend]);

  const pendientesMias = acciones.filter(a =>
    (a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO') && misAreas.has(a.area_responsable)).length;

  const nombreAreas = areas.filter(a => misAreas.has(a.codigo)).map(a => a.label).join(', ')
    || (puedeVerTodo ? 'Calidad / Supervisión' : 'Sin área asignada');

  const marcarEnProceso = async (a) => {
    try { await resolver.mutateAsync({ accionId: a.id, resolucion: '', estado: 'EN_PROCESO' }); toast.success('Marcada en proceso'); }
    catch (e) { toast.error(e.message); }
  };
  const cerrar = async (a) => {
    if (!texto.trim()) { toast.error('Escribe qué se hizo para cerrar'); return; }
    try { await resolver.mutateAsync({ accionId: a.id, resolucion: texto.trim(), estado: 'RESUELTA' }); toast.success('Tarea resuelta'); setResolviendo(null); setTexto(''); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="h-full bg-slate-50 p-3 sm:p-6 min-h-screen">
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-7 mb-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 via-emerald-400 to-sky-500" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
            <Inbox size={30} strokeWidth={2.3} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Mi <span className="text-sky-600">Bandeja</span></h1>
            <p className="text-slate-500 font-bold text-sm">{nombreAreas} · {pendientesMias} pendiente(s)</p>
          </div>
        </div>
        <button onClick={() => refetch()} disabled={isFetching}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-black flex items-center gap-2 hover:bg-slate-50">
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Filter size={15} className="text-slate-400" />
        <button onClick={() => setSoloPend(true)}
          className={`px-3 py-2 rounded-xl text-xs font-black border ${soloPend ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Pendientes</button>
        <button onClick={() => setSoloPend(false)}
          className={`px-3 py-2 rounded-xl text-xs font-black border ${!soloPend ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Todas</button>
        {puedeVerTodo && (
          <label className="ml-2 flex items-center gap-2 text-xs font-bold text-slate-600">
            <input type="checkbox" checked={verTodas} onChange={e => setVerTodas(e.target.checked)} /> Ver todas las áreas
          </label>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={36} /></div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox size={44} className="text-slate-200 mb-4" />
          <h3 className="text-base font-bold text-slate-400">Bandeja al día</h3>
          <p className="text-xs text-slate-300">No tienes tareas {soloPend ? 'pendientes' : ''} asignadas a tu área.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map(a => {
            const meta = ESTADO_ACCION_META[a.estado] || {};
            const abierta = a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO';
            const area = areaByCode[a.area_responsable];
            const editando = resolviendo === a.id;
            return (
              <div key={a.id} className={`bg-white rounded-2xl border p-5 flex flex-col ${abierta ? 'border-amber-200' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono font-black text-slate-700 text-sm">{a.folio || '—'}</span>
                  <div className="flex items-center gap-1.5">
                    {a.prioridad === 'URGENTE' && abierta && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-1"><AlertTriangle size={11} /> Urgente</span>
                    )}
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${meta.cls}`}>{meta.label || a.estado}</span>
                  </div>
                </div>

                <p className="font-black text-slate-900 text-sm flex items-center gap-1.5"><Package size={14} className="text-slate-400" />{a.codigo_producto || '—'}</p>
                <p className="text-xs text-slate-500 truncate">{a.producto || ''}</p>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">{TIPO_LABEL[a.tipo_accion] || a.tipo_accion}</span>
                  {(verTodas && puedeVerTodo) && <span className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-teal-50 text-teal-700 border-teal-200">{area?.label || a.area_responsable}</span>}
                  {a.bodega_destino && <span className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200">BD {a.bodega_destino}</span>}
                  {a.dictamen && <span className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200">{a.dictamen}</span>}
                </div>

                {a.descripcion && <p className="text-xs text-slate-600 mt-2 italic">“{a.descripcion}”</p>}
                <p className="text-[11px] text-slate-400 mt-2">{a.ubicacion ? `${a.ubicacion} · ` : ''}{a.cantidad != null ? `${a.cantidad} u · ` : ''}{a.creado_nombre ? `por ${a.creado_nombre}` : ''}</p>

                {a.estado === 'RESUELTA' && a.resolucion && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 mt-2"><b>Resuelta:</b> {a.resolucion}</p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100">
                  {editando ? (
                    <div className="space-y-2">
                      <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={2} autoFocus
                        placeholder="¿Qué se hizo? (acuse de la tarea)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-sky-400 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => cerrar(a)} disabled={resolver.isPending}
                          className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 disabled:opacity-50">
                          <CheckCircle2 size={14} /> Confirmar cierre
                        </button>
                        <button onClick={() => { setResolviendo(null); setTexto(''); }}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 font-black text-xs hover:bg-slate-50">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setTraza(a)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-black text-xs flex items-center gap-1.5 hover:bg-slate-50">
                        <GitBranch size={14} /> Trazabilidad
                      </button>
                      {abierta && puedeResolver(a) && (
                        <>
                          {a.estado === 'PENDIENTE' && (
                            <button onClick={() => marcarEnProceso(a)} disabled={resolver.isPending}
                              className="px-3 py-2 rounded-xl border border-slate-200 text-sky-700 font-black text-xs flex items-center gap-1.5 hover:bg-sky-50">
                              <PlayCircle size={14} /> En proceso
                            </button>
                          )}
                          <button onClick={() => { setResolviendo(a.id); setTexto(''); }}
                            className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700">
                            <CheckCircle2 size={14} /> Resolver
                          </button>
                        </>
                      )}
                      {abierta && !puedeResolver(a) && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1.5"><Clock size={13} /> {area?.label || a.area_responsable}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {traza && (
        <TrazabilidadModal codigo={traza.codigo_producto} partida={traza.partida} ubicacion={traza.ubicacion}
          producto={traza.producto} onClose={() => setTraza(null)} />
      )}
    </div>
  );
};

export default MiBandeja;
