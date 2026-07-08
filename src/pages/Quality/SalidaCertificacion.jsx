import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Truck, ArrowLeft, Loader2, Check, X, Minus, ShieldCheck, AlertTriangle,
  Calendar, FileDown, FileText, PenLine, BadgeCheck, RefreshCw, Search, Plus,
  Package, Ban,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CHECKLIST_SALIDA_NIVELES, CHECKLIST_SALIDA_TODOS, DISPOSICIONES_SALIDA, ESTADO_TAREA_META,
  useTareasSalida, useCrearTareaSalida, useGuardarChecklist, useFirmarCertificado, buscarDespachos,
} from '../../services/calidadService';
import { exportChecklistPDF, exportChecklistWord } from '../../lib/exportChecklistIngreso';

// ── Modal: elegir el despacho a certificar ──────────────────────────────────
const DespachoModal = ({ onClose, onCreated }) => {
  const crear = useCrearTareaSalida();
  const [query, setQuery] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [rows, setRows] = useState([]);

  const buscar = useCallback(async () => {
    setBuscando(true);
    try { setRows(await buscarDespachos(query)); }
    catch (e) { toast.error(`Error buscando despachos: ${e.message}`); }
    finally { setBuscando(false); }
  }, [query]);

  useEffect(() => { buscar(); }, []); // primera carga: últimos despachos

  const certificar = async (d) => {
    try {
      const r = await crear.mutateAsync(d.id);
      toast.success(r?.reused ? 'Ya existía una certificación en curso — abierta' : 'Certificación de salida creada');
      onCreated(r?.id);
    } catch (e) { toast.error(`No se pudo crear: ${e.message}`); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-black text-slate-900 flex items-center gap-2"><Truck size={18} className="text-emerald-600" /> Certificar salida — elegir despacho</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-emerald-400">
              <Search size={16} className="text-slate-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()}
                placeholder="Buscar por NV, cliente o guía…" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
            <button onClick={buscar} disabled={buscando}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50">
              {buscando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar
            </button>
          </div>
          {rows.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">{buscando ? 'Buscando…' : 'Sin resultados.'}</p>
          ) : (
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {rows.map(d => (
                <div key={d.id} className="px-3 py-2.5 hover:bg-emerald-50/40 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">NV {d.nv || '—'} · {d.cliente || 's/cliente'}</p>
                    <p className="text-xs text-slate-400">Guía {d.guia || '—'} · {d.bultos ?? 0} bultos · {d.transportista || d.empresa_transporte || 's/transportista'} · {d.fecha_despacho || 's/fecha'}</p>
                  </div>
                  <button onClick={() => certificar(d)} disabled={crear.isPending}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-emerald-700 shrink-0 disabled:opacity-50">
                    <Plus size={14} /> Certificar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Formulario de certificación de una salida ───────────────────────────────
const SalidaForm = ({ tarea, onBack, canManage }) => {
  const guardar = useGuardarChecklist();
  const firmar = useFirmarCertificado();
  const finalizada = tarea.estado === 'CONFORME' || tarea.estado === 'NO_CONFORME';
  const readOnly = finalizada || !canManage;
  const ctx = tarea.contexto || {};

  const [answers, setAnswers] = useState(() => tarea.checklist || {});
  const [obs, setObs] = useState(tarea.observaciones || '');
  const [disp, setDisp] = useState(tarea.disposicion || '');
  useEffect(() => { setAnswers(tarea.checklist || {}); setObs(tarea.observaciones || ''); setDisp(tarea.disposicion || ''); }, [tarea.id]);

  const setResp = (pid, estado) => setAnswers(prev => ({ ...prev, [pid]: { ...prev[pid], estado } }));
  const setNota = (pid, nota) => setAnswers(prev => ({ ...prev, [pid]: { ...prev[pid], nota } }));

  const { answeredAll, hasNo, faltan } = useMemo(() => {
    let answered = 0, no = false;
    for (const p of CHECKLIST_SALIDA_TODOS) {
      const e = answers[p.id]?.estado;
      if (e) answered++;
      if (e === 'NO') no = true;
    }
    return { answeredAll: answered === CHECKLIST_SALIDA_TODOS.length, hasNo: no, faltan: CHECKLIST_SALIDA_TODOS.length - answered };
  }, [answers]);

  const descargar = async (fmt) => {
    try {
      const opts = { tipo: 'SALIDA' };
      if (fmt === 'pdf') await exportChecklistPDF(tarea, CHECKLIST_SALIDA_NIVELES, opts);
      else await exportChecklistWord(tarea, CHECKLIST_SALIDA_NIVELES, opts);
    } catch (e) { toast.error(`No se pudo generar el documento: ${e.message}`); }
  };

  const firmarDoc = async () => {
    if (!confirm('¿Firmar digitalmente este certificado de salida? Quedará sellado y verificable por folio/QR.')) return;
    try { const r = await firmar.mutateAsync(tarea.id); toast.success(`Documento firmado por ${r?.firmado_nombre || ''}`); }
    catch (e) { toast.error(`No se pudo firmar: ${e.message}`); }
  };

  const guardarAvance = async () => {
    try {
      await guardar.mutateAsync({ tareaId: tarea.id, checklist: answers, observaciones: obs, disposicion: disp, finalizar: false });
      toast.success('Avance guardado');
    } catch (e) { toast.error(`No se pudo guardar: ${e.message}`); }
  };

  const finalizar = async () => {
    if (!answeredAll) { toast.error(`Faltan ${faltan} ítem(s) por responder`); return; }
    const resultado = hasNo ? 'NO_CONFORME' : 'CONFORME';
    if (resultado === 'NO_CONFORME' && !disp) { toast.error('Selecciona la disposición antes de finalizar'); return; }
    if (!confirm(resultado === 'CONFORME'
      ? 'Todos los ítems conformes → se emitirá el CERTIFICADO DE CONFORMIDAD DE SALIDA (folio CERT-SAL-) y la tarea quedará bloqueada. ¿Continuar?'
      : `Hay ítems NO conformes → SALIDA NO CONFORME (folio ACTA-SAL-), disposición "${disp}". No despachar hasta resolver. ¿Continuar?`)) return;
    try {
      const res = await guardar.mutateAsync({ tareaId: tarea.id, checklist: answers, observaciones: obs, disposicion: disp, finalizar: true, resultado });
      if (resultado === 'CONFORME') { toast.success(`Salida certificada ${res?.folio || ''}`); onBack(); }
      else toast.warning('Salida NO CONFORME. No despachar hasta resolver.');
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

      {/* Cabecera del despacho */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><Truck size={26} /></div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-slate-900">{tarea.proveedor || ctx.cliente || 'Sin cliente'}</span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.cls || ''}`}>{meta.label || tarea.estado}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3 flex-wrap">
              <span>NV {tarea.oc || ctx.nv || '—'}</span>
              <span>Guía {ctx.guia || '—'}</span>
              {ctx.factura && <span>Factura {ctx.factura}</span>}
              <span className="flex items-center gap-1"><Calendar size={12} /> {tarea.fecha_recepcion || '—'}</span>
              {tarea.bultos != null && <span>· {tarea.bultos} bultos</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {tarea.folio && (
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Certificado</p>
              <p className="font-mono font-black text-emerald-700">{tarea.folio}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => descargar('pdf')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50"><FileDown size={15} /> PDF</button>
            <button onClick={() => descargar('word')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50"><FileText size={15} /> Word</button>
          </div>
        </div>
      </div>

      {/* Firma electrónica */}
      {tarea.firma_digital ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <BadgeCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-sm min-w-0">
            <p className="font-black text-emerald-800">Firmado digitalmente</p>
            <p className="text-emerald-700 text-xs">{tarea.firmado_nombre || '—'} · {tarea.firmado_en ? new Date(tarea.firmado_en).toLocaleString('es-CL') : ''} · {tarea.firma_algoritmo}</p>
          </div>
        </div>
      ) : (finalizada && canManage) ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600 flex items-center gap-2"><PenLine size={18} className="text-slate-400" /> Documento sin firmar.</div>
          <button onClick={firmarDoc} disabled={firmar.isPending}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50">
            <PenLine size={16} /> Firmar digitalmente
          </button>
        </div>
      ) : null}

      {/* Niveles */}
      <div className="space-y-4">
        {CHECKLIST_SALIDA_NIVELES.map(nivel => (
          <div key={nivel.nivel} className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-black text-slate-800 mb-3">{nivel.titulo}</h3>
            <div className="space-y-2.5">
              {nivel.params.map(p => (
                <div key={p.id} className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-semibold">{p.label}</p>
                    {answers[p.id]?.estado === 'NO' && (
                      <input value={answers[p.id]?.nota || ''} disabled={readOnly} onChange={e => setNota(p.id, e.target.value)}
                        placeholder="Detalle de la no conformidad…"
                        className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400" />
                    )}
                    {answers[p.id]?.estado === 'NA' && (
                      <input value={answers[p.id]?.nota || ''} disabled={readOnly} onChange={e => setNota(p.id, e.target.value)}
                        placeholder="Justificación del N/A (recomendada para auditoría)…"
                        className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-slate-400" />
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

        {/* Disposición si hay No Conformes */}
        {(hasNo || disp) && (
          <div className={`rounded-2xl border p-5 ${hasNo ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'}`}>
            <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-rose-500">
              Disposición / Acción a tomar {hasNo && <span>*obligatoria</span>}
            </label>
            <select value={disp} disabled={readOnly} onChange={e => setDisp(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 rounded-xl border border-rose-200 text-sm font-bold outline-none focus:border-rose-400 bg-white">
              <option value="">— Seleccionar disposición —</option>
              {DISPOSICIONES_SALIDA.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}

        {/* Observaciones */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones generales</label>
          <textarea value={obs} disabled={readOnly} onChange={e => setObs(e.target.value)} rows={2}
            placeholder="Notas de la certificación de salida…"
            className="mt-1.5 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 resize-none" />
        </div>
      </div>

      {!readOnly && (
        <div className="sticky bottom-3 mt-5 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-black">
            {faltan > 0
              ? <span className="text-slate-500">{faltan} ítem(s) por responder</span>
              : hasNo
                ? <span className="text-rose-600">Resultado automático: NO CONFORME</span>
                : <span className="text-emerald-600">Resultado automático: CONFORME</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={guardarAvance} disabled={guardar.isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50">Guardar avance</button>
            <button onClick={finalizar} disabled={guardar.isPending || faltan > 0}
              className={`px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${hasNo ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {hasNo ? <><Ban size={16} /> Finalizar (No Conforme)</> : <><ShieldCheck size={16} /> Certificar salida</>}
            </button>
          </div>
        </div>
      )}
      {tarea.estado === 'NO_CONFORME' && (
        <div className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> Salida <b>NO CONFORME</b>. No despachar hasta resolver.{tarea.disposicion ? ` Disposición: ${tarea.disposicion}.` : ''}
        </div>
      )}
    </div>
  );
};

// ── Cola del hito 3 ─────────────────────────────────────────────────────────
const SalidaCertificacion = () => {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_quality') || hasPermission('manage_monitoreo');
  const { data: tareas = [], isLoading, refetch, isFetching } = useTareasSalida();
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(false);

  const selFresh = sel ? tareas.find(t => t.id === sel) || null : null;
  if (selFresh) return <SalidaForm tarea={selFresh} onBack={() => setSel(null)} canManage={canManage} />;

  const pendientes = tareas.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <p className="text-sm font-bold text-slate-500">
          {isLoading ? 'Cargando…' : `${tareas.length} certificación(es) · ${pendientes} pendiente(s)`}
        </p>
        <div className="flex gap-2">
          <button onClick={() => refetch()} disabled={isFetching}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50">
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Actualizar
          </button>
          {canManage && (
            <button onClick={() => setModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-1.5 hover:bg-slate-800">
              <Plus size={14} /> Certificar salida
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={36} /></div>
      ) : tareas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Truck size={44} className="text-slate-200 mb-4" />
          <h3 className="text-base font-bold text-slate-400">Sin certificaciones de salida</h3>
          <p className="text-xs text-slate-300">Usa “Certificar salida” para elegir un despacho y emitir su Certificado de Conformidad.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareas.map(t => {
            const meta = ESTADO_TAREA_META[t.estado] || {};
            const ctx = t.contexto || {};
            const pend = t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO';
            return (
              <button key={t.id} onClick={() => setSel(t.id)}
                className={`text-left bg-white rounded-2xl border p-5 transition-all hover:shadow-lg ${pend ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-emerald-300'}`}>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="flex items-center gap-1.5 font-black text-slate-900 truncate"><Package size={16} className="text-slate-400 shrink-0" />{t.proveedor || ctx.cliente || 'Sin cliente'}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${meta.cls}`}>{meta.label || t.estado}</span>
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-teal-50 text-teal-700 border-teal-200">NV {t.oc || ctx.nv || '—'}</span>
                  {t.folio && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono">{t.folio}</span>}
                </div>
                <p className="text-sm text-slate-500 font-medium">Guía {ctx.guia || '—'} · {t.fecha_recepcion || '—'}</p>
                {t.bultos != null && <p className="text-xs text-slate-400 mt-1">{t.bultos} bultos · {ctx.transportista || ctx.empresa_transporte || 's/transportista'}</p>}
              </button>
            );
          })}
        </div>
      )}

      {modal && <DespachoModal onClose={() => setModal(false)} onCreated={(id) => { setModal(false); if (id) setSel(id); }} />}
    </div>
  );
};

export default SalidaCertificacion;
