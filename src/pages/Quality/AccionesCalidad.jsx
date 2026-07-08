import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  ListChecks, Loader2, AlertTriangle, CheckCircle2, Ban, Clock, Package,
  RefreshCw, Filter, ShieldCheck, PlayCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useAccionesCalidad, useAreasCalidad, useResolverAccion, useAnularAccion,
  TIPOS_ACCION, ESTADO_ACCION_META,
} from '../../services/calidadService';
import useRealtimeTable from '../../hooks/useRealtimeTable';

const TIPO_LABEL = Object.fromEntries(TIPOS_ACCION.map(t => [t.id, t.label]));

const DICTAMEN_CLS = {
  BAJA: 'bg-rose-100 text-rose-700 border-rose-200',
  RECHAZAR: 'bg-rose-100 text-rose-700 border-rose-200',
  CUARENTENA: 'bg-orange-100 text-orange-700 border-orange-200',
  REPROCESO: 'bg-amber-100 text-amber-700 border-amber-200',
  LIBERAR: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const AccionesCalidad = () => {
  const { user, hasPermission } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const canManageQuality = hasPermission('manage_quality');
  const { data: acciones = [], isLoading, refetch, isFetching } = useAccionesCalidad();
  const { data: areas = [] } = useAreasCalidad();
  const resolver = useResolverAccion();
  const anular = useAnularAccion();
  useRealtimeTable('tms_calidad_acciones', ['calidad_acciones'], { debounceMs: 400 });

  const [filtro, setFiltro] = useState('pendientes'); // pendientes | mi_area | todas
  const [resolviendo, setResolviendo] = useState(null); // id en edición
  const [texto, setTexto] = useState('');

  const areaByCode = useMemo(() => Object.fromEntries(areas.map(a => [a.codigo, a])), [areas]);
  // Áreas a las que pertenece el usuario (por su rol) → puede resolver.
  const misAreas = useMemo(
    () => new Set(areas.filter(a => Array.isArray(a.roles) && a.roles.includes(user?.rol)).map(a => a.codigo)),
    [areas, user?.rol]
  );
  const puedeResolver = (a) => isAdmin || misAreas.has(a.area_responsable);

  const lista = useMemo(() => {
    if (filtro === 'todas') return acciones;
    if (filtro === 'mi_area') return acciones.filter(a => misAreas.has(a.area_responsable));
    return acciones.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO');
  }, [acciones, filtro, misAreas]);

  const pendientes = acciones.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO').length;

  const marcarEnProceso = async (a) => {
    try { await resolver.mutateAsync({ accionId: a.id, resolucion: '', estado: 'EN_PROCESO' }); toast.success('Marcada en proceso'); }
    catch (e) { toast.error(e.message); }
  };
  const cerrar = async (a) => {
    if (!texto.trim()) { toast.error('Escribe qué se hizo para cerrar'); return; }
    try {
      await resolver.mutateAsync({ accionId: a.id, resolucion: texto.trim(), estado: 'RESUELTA' });
      toast.success('Acción resuelta'); setResolviendo(null); setTexto('');
    } catch (e) { toast.error(e.message); }
  };
  const anularAccion = async (a) => {
    if (!confirm(`¿Anular la acción ${a.folio}?`)) return;
    try { await anular.mutateAsync(a.id); toast.success('Acción anulada'); }
    catch (e) { toast.error(e.message); }
  };

  const FILTROS = [
    { id: 'pendientes', label: 'Pendientes' },
    { id: 'mi_area', label: 'Mi área' },
    { id: 'todas', label: 'Todas' },
  ];

  return (
    <div className="h-full bg-slate-50 p-3 sm:p-6 min-h-screen">
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-7 mb-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <ListChecks size={30} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Acciones de <span className="text-emerald-600">Calidad</span></h1>
            <p className="text-slate-500 font-bold text-sm">Acciones recomendadas por Calidad, asignadas a cada área · {pendientes} pendiente(s)</p>
          </div>
        </div>
        <button onClick={() => refetch()} disabled={isFetching}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-black flex items-center gap-2 hover:bg-slate-50">
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <Filter size={15} className="text-slate-400" />
        {FILTROS.map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)}
            className={`px-3 py-2 rounded-xl text-xs font-black border transition-colors ${filtro === f.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={36} /></div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ListChecks size={44} className="text-slate-200 mb-4" />
          <h3 className="text-base font-bold text-slate-400">Sin acciones {filtro === 'pendientes' ? 'pendientes' : ''}</h3>
          <p className="text-xs text-slate-300">Las acciones se generan cuando Calidad dictamina un producto y recomienda una acción.</p>
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
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-teal-50 text-teal-700 border-teal-200">→ {area?.label || a.area_responsable}</span>
                  {a.dictamen && <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${DICTAMEN_CLS[a.dictamen] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{a.dictamen}</span>}
                  {a.bodega_destino && <span className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200">BD {a.bodega_destino}</span>}
                </div>

                {a.descripcion && <p className="text-xs text-slate-600 mt-2 italic">“{a.descripcion}”</p>}
                <p className="text-[11px] text-slate-400 mt-2">
                  {a.ubicacion ? `${a.ubicacion} · ` : ''}{a.cantidad != null ? `${a.cantidad} u · ` : ''}{a.creado_nombre ? `por ${a.creado_nombre}` : ''}
                  {a.fecha_limite ? ` · límite ${a.fecha_limite}` : ''}
                </p>

                {a.estado === 'RESUELTA' && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 mt-2">
                    <b>Resuelta</b>{a.resuelto_nombre ? ` por ${a.resuelto_nombre}` : ''}{a.resuelto_en ? ` · ${new Date(a.resuelto_en).toLocaleDateString('es-CL')}` : ''}
                    {a.resolucion ? ` — ${a.resolucion}` : ''}
                  </p>
                )}

                {abierta && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    {editando ? (
                      <div className="space-y-2">
                        <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={2} autoFocus
                          placeholder="¿Qué se hizo? (acuse de la acción)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-400 resize-none" />
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
                        {puedeResolver(a) ? (
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
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5"><Clock size={13} /> Esperando a {area?.label || a.area_responsable}</span>
                        )}
                        {(isAdmin || canManageQuality) && (
                          <button onClick={() => anularAccion(a)} title="Anular"
                            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-400 font-black text-xs hover:bg-rose-50 hover:text-rose-600"><Ban size={14} /></button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccionesCalidad;
