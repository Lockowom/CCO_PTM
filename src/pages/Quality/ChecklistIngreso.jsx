import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList, Package, ArrowLeft, Loader2, Check, X, Minus,
  ShieldCheck, AlertTriangle, FileWarning, Calendar, Truck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CHECKLIST_INGRESO_NIVELES, CHECKLIST_TODOS_PARAMS, ESTADO_TAREA_META,
  useTareasChecklist, useGuardarChecklist,
} from '../../services/calidadService';

const ORIGEN_META = {
  IMPORTACION: { label: 'Importación', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  NACIONAL:    { label: 'Nacional',    cls: 'bg-teal-100 text-teal-700 border-teal-200' },
};

// ── Formulario del checklist de una tarea ───────────────────────────────────
const ChecklistForm = ({ tarea, onBack, canManage }) => {
  const guardar = useGuardarChecklist();
  const finalizada = tarea.estado === 'CONFORME' || tarea.estado === 'NO_CONFORME';
  const readOnly = finalizada || !canManage;

  const [answers, setAnswers] = useState(() => tarea.checklist || {});
  const [obs, setObs] = useState(tarea.observaciones || '');

  useEffect(() => { setAnswers(tarea.checklist || {}); setObs(tarea.observaciones || ''); }, [tarea.id]);

  const setResp = (pid, estado) => setAnswers(prev => ({ ...prev, [pid]: { ...prev[pid], estado } }));
  const setNota = (pid, nota) => setAnswers(prev => ({ ...prev, [pid]: { ...prev[pid], nota } }));

  const { answeredAll, hasNo, faltan } = useMemo(() => {
    let answered = 0, no = false;
    for (const p of CHECKLIST_TODOS_PARAMS) {
      const e = answers[p.id]?.estado;
      if (e) answered++;
      if (e === 'NO') no = true;
    }
    return { answeredAll: answered === CHECKLIST_TODOS_PARAMS.length, hasNo: no, faltan: CHECKLIST_TODOS_PARAMS.length - answered };
  }, [answers]);

  const guardarAvance = async () => {
    try {
      await guardar.mutateAsync({ tareaId: tarea.id, checklist: answers, observaciones: obs, finalizar: false });
      toast.success('Avance guardado');
    } catch (e) { toast.error(`No se pudo guardar: ${e.message}`); }
  };

  const finalizar = async (resultado) => {
    if (resultado === 'CONFORME' && (!answeredAll || hasNo)) {
      toast.error(faltan > 0 ? `Faltan ${faltan} ítem(s) por responder` : 'Hay ítems NO conformes: no se puede certificar');
      return;
    }
    if (!confirm(resultado === 'CONFORME'
      ? '¿Certificar la recepción como CONFORME? Se emitirá un folio y quedará bloqueada.'
      : '¿Marcar la recepción como NO CONFORME? Se generará una alerta urgente para el Informe de Daños.')) return;
    try {
      const res = await guardar.mutateAsync({ tareaId: tarea.id, checklist: answers, observaciones: obs, finalizar: true, resultado });
      if (resultado === 'CONFORME') toast.success(`Certificado ${res?.folio || ''} — recepción CONFORME`);
      else toast.warning('Recepción NO CONFORME. Alerta urgente enviada para el Informe de Daños.');
      onBack();
    } catch (e) { toast.error(`No se pudo finalizar: ${e.message}`); }
  };

  const RespBtn = ({ pid, val, icon, activeCls }) => {
    const active = answers[pid]?.estado === val;
    return (
      <button type="button" disabled={readOnly} onClick={() => setResp(pid, val)}
        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${active ? activeCls : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${readOnly ? 'opacity-60 cursor-default' : ''}`}>
        {icon}
      </button>
    );
  };

  const meta = ESTADO_TAREA_META[tarea.estado] || {};

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-slate-800">
        <ArrowLeft size={18} /> Volver a la cola
      </button>

      {/* Cabecera de la recepción */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ClipboardList size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-slate-900">{tarea.proveedor || 'Sin proveedor'}</span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${ORIGEN_META[tarea.origen]?.cls || ''}`}>{ORIGEN_META[tarea.origen]?.label || tarea.origen}</span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.cls || ''}`}>{meta.label || tarea.estado}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1"><Truck size={12} /> OC {tarea.oc || '—'}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {tarea.fecha_recepcion || '—'}</span>
              {tarea.bultos != null && <span>· {tarea.bultos} bultos</span>}
            </p>
          </div>
        </div>
        {tarea.folio && (
          <div className="text-right">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Certificado</p>
            <p className="font-mono font-black text-emerald-700">{tarea.folio}</p>
          </div>
        )}
      </div>

      {/* Niveles + parámetros */}
      <div className="space-y-4">
        {CHECKLIST_INGRESO_NIVELES.map(nivel => (
          <div key={nivel.nivel} className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-black text-slate-800 mb-3">{nivel.titulo}</h3>
            <div className="space-y-2.5">
              {nivel.params.map(p => (
                <div key={p.id} className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-semibold">{p.label}</p>
                    {answers[p.id]?.estado === 'NO' && (
                      <input value={answers[p.id]?.nota || ''} disabled={readOnly}
                        onChange={e => setNota(p.id, e.target.value)} placeholder="Detalle de la no conformidad…"
                        className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RespBtn pid={p.id} val="OK" icon={<Check size={16} />} activeCls="bg-emerald-500 border-emerald-500 text-white" />
                    <RespBtn pid={p.id} val="NO" icon={<X size={16} />} activeCls="bg-rose-500 border-rose-500 text-white" />
                    <RespBtn pid={p.id} val="NA" icon={<Minus size={16} />} activeCls="bg-slate-400 border-slate-400 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Observaciones */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones generales</label>
          <textarea value={obs} disabled={readOnly} onChange={e => setObs(e.target.value)} rows={2}
            placeholder="Notas del checklist…"
            className="mt-1.5 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 resize-none" />
        </div>
      </div>

      {/* Acciones */}
      {!readOnly && (
        <div className="sticky bottom-3 mt-5 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-500">
            {faltan > 0 ? `${faltan} ítem(s) por responder` : hasNo ? 'Hay ítems NO conformes' : 'Todos los ítems conformes'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={guardarAvance} disabled={guardar.isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50">
              Guardar avance
            </button>
            <button onClick={() => finalizar('NO_CONFORME')} disabled={guardar.isPending}
              className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center gap-2 hover:bg-rose-700">
              <FileWarning size={16} /> No Conforme
            </button>
            <button onClick={() => finalizar('CONFORME')} disabled={guardar.isPending || !answeredAll || hasNo}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-40">
              <ShieldCheck size={16} /> Certificar Conforme
            </button>
          </div>
        </div>
      )}
      {tarea.estado === 'NO_CONFORME' && (
        <div className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> Recepción NO CONFORME. Genera el <b>Informe de Daños / Solicitud NC al proveedor</b> desde la pestaña Informes.
        </div>
      )}
    </div>
  );
};

// ── Cola de tareas de checklist ─────────────────────────────────────────────
const ChecklistIngreso = () => {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_quality') || hasPermission('manage_monitoreo');
  const { data: tareas = [], isLoading } = useTareasChecklist();
  const [sel, setSel] = useState(null);

  // Refrescar la tarea seleccionada cuando cambian los datos.
  const selFresh = sel ? tareas.find(t => t.id === sel.id) || sel : null;

  if (selFresh) return <ChecklistForm tarea={selFresh} onBack={() => setSel(null)} canManage={canManage} />;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={36} /></div>;

  if (tareas.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ClipboardList size={44} className="text-slate-200 mb-4" />
      <h3 className="text-base font-bold text-slate-400">Sin tareas de checklist</h3>
      <p className="text-xs text-slate-300">Las tareas se generan solas al registrar una recepción.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tareas.map(t => {
        const meta = ESTADO_TAREA_META[t.estado] || {};
        const om = ORIGEN_META[t.origen] || {};
        const pend = t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO';
        return (
          <button key={t.id} onClick={() => setSel(t)}
            className={`text-left bg-white rounded-2xl border p-5 transition-all hover:shadow-lg ${pend ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-emerald-300'}`}>
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="flex items-center gap-1.5 font-black text-slate-900 truncate"><Package size={16} className="text-slate-400 shrink-0" />{t.proveedor || 'Sin proveedor'}</span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${meta.cls}`}>{meta.label || t.estado}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${om.cls}`}>{om.label || t.origen}</span>
              {t.folio && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono">{t.folio}</span>}
            </div>
            <p className="text-sm text-slate-500 font-medium">OC {t.oc || '—'} · {t.fecha_recepcion || '—'}</p>
            {t.bultos != null && <p className="text-xs text-slate-400 mt-1">{t.bultos} bultos</p>}
          </button>
        );
      })}
    </div>
  );
};

export default ChecklistIngreso;
