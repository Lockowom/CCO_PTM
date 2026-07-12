import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList, Package, ArrowLeft, Loader2, Check, X, Minus,
  ShieldCheck, AlertTriangle, FileWarning, Calendar, Truck, FileDown, FileText, PenLine, BadgeCheck, RefreshCw,
  Layers, Stamp, Info, Trash2, Camera, ImagePlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CHECKLIST_INGRESO_NIVELES, ESTADO_TAREA_META, CATEGORIA_META,
  useTareasChecklist, useGuardarChecklist, useFirmarCertificado, useCategoriasTarea,
  useEliminarTareaCalidad,
  CLASIFICACION_INGRESO, EMBALAJE_INGRESO, DISPOSICION_INMEDIATA_INGRESO,
  EVIDENCIA_OPCIONES, riesgoIngreso, indicadoresIso,
  EVIDENCIAS_INGRESO_TIPOS, uploadEvidenciaIngreso, deleteEvidenciaSalida, EVIDENCIAS_BUCKET,
} from '../../services/calidadService';
import { compressImage } from '../../lib/imageCompress';
import { signedUrls, signedUrl } from '../../lib/storageUrl';
import { exportChecklistPDF, exportChecklistWord } from '../../lib/exportChecklistIngreso';

// Convierte una familia (RPC) en un "nivel" de checklist con sus criterios propios.
const categoriaANivel = (c) => ({
  nivel: `cat_${c.codigo}`,
  titulo: `Requisitos específicos — ${c.label}${c.clase_riesgo ? ` (Clase ${c.clase_riesgo})` : ''}`,
  categoria: c.codigo,
  params: c.params || [],
});

const ORIGEN_META = {
  IMPORTACION: { label: 'Importación', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  NACIONAL:    { label: 'Nacional',    cls: 'bg-teal-100 text-teal-700 border-teal-200' },
};

// ── Formulario del checklist de una tarea ───────────────────────────────────
const ChecklistForm = ({ tarea, onBack, canManage, onGenerarDanos }) => {
  const { user } = useAuth();
  const guardar = useGuardarChecklist();
  const firmar = useFirmarCertificado();
  const { data: catData, isLoading: catLoading } = useCategoriasTarea(tarea.id);
  const finalizada = tarea.estado === 'CONFORME' || tarea.estado === 'NO_CONFORME';
  const readOnly = finalizada || !canManage;

  // El checklist jsonb guarda las respuestas por ítem y, bajo `_extras`, los
  // complementos ISO (clasificación, embalaje, disposición inmediata).
  const partir = (chk) => { const { _extras, ...resp } = chk || {}; return { resp, extras: _extras || {} }; };
  const [answers, setAnswers] = useState(() => partir(tarea.checklist).resp);
  const [extras, setExtras] = useState(() => partir(tarea.checklist).extras);
  const [obs, setObs] = useState(tarea.observaciones || '');
  const [disp, setDisp] = useState(tarea.disposicion || '');

  useEffect(() => {
    const { resp, extras: ex } = partir(tarea.checklist);
    setAnswers(resp); setExtras(ex); setObs(tarea.observaciones || ''); setDisp(tarea.disposicion || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarea.id]);

  const setResp = (pid, estado) => setAnswers(prev => ({ ...prev, [pid]: { ...prev[pid], estado } }));
  const setNota = (pid, nota) => setAnswers(prev => ({ ...prev, [pid]: { ...prev[pid], nota } }));
  const setEvid = (pid, evidencia) => setAnswers(prev => ({ ...prev, [pid]: { ...prev[pid], evidencia } }));
  const setEx = (k, v) => setExtras(prev => ({ ...prev, [k]: v }));
  const checklistCompleto = (ex = extras) => ({ ...answers, _extras: ex });

  const toggleClasif = (id) => setExtras(prev => {
    const cur = new Set(prev.clasificacion || []);
    if (cur.has(id)) cur.delete(id); else cur.add(id);
    return { ...prev, clasificacion: [...cur] };
  });

  // Familias detectadas en la recepción → secciones de criterios específicos.
  const categorias = catData?.categorias || [];
  const soloNoSanitario = !!catData?.solo_no_sanitario;
  const sinClasificar = catData?.sin_clasificar || 0;

  // Niveles del checklist = universales (documental + físico) + un nivel por cada
  // familia con criterios propios. La validación exige TODOS estos ítems.
  const niveles = useMemo(() => {
    const catNiveles = categorias
      .filter(c => (c.params || []).length > 0)
      .map(categoriaANivel);
    return [...CHECKLIST_INGRESO_NIVELES, ...catNiveles];
  }, [categorias]);

  const allParams = useMemo(() => niveles.flatMap(n => n.params), [niveles]);

  const { answeredAll, hasNo, faltan } = useMemo(() => {
    let answered = 0, no = false;
    for (const p of allParams) {
      const e = answers[p.id]?.estado;
      if (e) answered++;
      if (e === 'NO') no = true;
    }
    return { answeredAll: answered === allParams.length, hasNo: no, faltan: allParams.length - answered };
  }, [answers, allParams]);

  const firmarDoc = async () => {
    if (!confirm('¿Firmar digitalmente este documento? Quedará sellado y verificable por folio/QR. No se puede deshacer.')) return;
    try {
      const r = await firmar.mutateAsync(tarea.id);
      toast.success(`Documento firmado digitalmente por ${r?.firmado_nombre || ''}`);
    } catch (e) { toast.error(`No se pudo firmar: ${e.message}`); }
  };

  const descargar = async (fmt) => {
    try {
      const opts = { categorias, soloNoSanitario };
      if (fmt === 'pdf') {
        // Incrustar la evidencia fotográfica en el PDF (URLs firmadas → dataURL).
        const evs = extras.evidencias || [];
        const imgs = [];
        for (const ev of evs) {
          try {
            const u = await signedUrl(EVIDENCIAS_BUCKET, ev.path);
            if (!u) continue;
            const blob = await fetch(u).then(r => (r.ok ? r.blob() : null));
            if (!blob || !/image\/(jpeg|png)/.test(blob.type)) continue;
            const dataUrl = await new Promise((res, rej) => {
              const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob);
            });
            imgs.push({ tipo: ev.tipo, dataUrl });
          } catch { /* foto no disponible: continúa sin ella */ }
        }
        opts.evidenciasImg = imgs;
        await exportChecklistPDF(tarea, niveles, opts);
      } else await exportChecklistWord(tarea, niveles, opts);
    } catch (e) { toast.error(`No se pudo generar el documento: ${e.message}`); }
  };

  const guardarAvance = async () => {
    try {
      await guardar.mutateAsync({ tareaId: tarea.id, checklist: checklistCompleto(), observaciones: obs, disposicion: disp, finalizar: false });
      toast.success('Avance guardado');
    } catch (e) { toast.error(`No se pudo guardar: ${e.message}`); }
  };

  // Certificación AUTOMÁTICA: el resultado se determina solo por las respuestas
  // (todos OK → CONFORME + folio; algún NO → NO CONFORME + tarea urgente de Daños).
  const finalizarAuto = async () => {
    if (catLoading) { toast.error('Cargando las familias de producto de la recepción…'); return; }
    if (!answeredAll) { toast.error(`Faltan ${faltan} ítem(s) por responder`); return; }
    const resultado = hasNo ? 'NO_CONFORME' : 'CONFORME';
    if (resultado === 'NO_CONFORME' && !disp) { toast.error('Selecciona la Disposición / Acción a tomar antes de finalizar'); return; }
    if (resultado === 'NO_CONFORME' && !extras.disposicionInmediata) { toast.error('Marca la Disposición inmediata de la recepción (cuarentena, rechazo, etc.)'); return; }
    if (!confirm(resultado === 'CONFORME'
      ? 'Todos los ítems conformes → se CERTIFICARÁ automáticamente (se emite folio CERT-) y la tarea quedará bloqueada. ¿Continuar?'
      : `Hay ítems NO conformes → se marcará NO CONFORME (folio ACTA-), disposición "${disp}", y se generará la tarea urgente del Informe de Daños. ¿Continuar?`)) return;
    try {
      const res = await guardar.mutateAsync({ tareaId: tarea.id, checklist: checklistCompleto(), observaciones: obs, disposicion: disp, finalizar: true, resultado });
      if (resultado === 'CONFORME') {
        toast.success(`Certificado automáticamente ${res?.folio || ''} — recepción CONFORME`);
        onBack();
      } else {
        toast.warning('Recepción NO CONFORME. Tarea urgente del Informe de Daños generada.');
        // Se queda en el detalle para ofrecer el botón "Generar Informe de Daños".
      }
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

  // Riesgo calculado en vivo (embalaje + no conformidades) e indicadores ISO.
  const riesgo = useMemo(() => riesgoIngreso({ ...answers, _extras: extras }), [answers, extras]);
  const ind = useMemo(() => indicadoresIso({ ...tarea, checklist: { ...answers, _extras: extras } }), [answers, extras, tarea]);
  const minutosRecepcion = ind.minutos ?? (tarea.created_at ? Math.max(0, Math.round((Date.now() - new Date(tarea.created_at).getTime()) / 60000)) : null);
  const embalaje = extras.embalaje || {};

  // ── Evidencia fotográfica (cámara directa + galería) ──
  const fotoRef = React.useRef(null);
  const fotoCamRef = React.useRef(null);
  const puedeCamara = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
  const [tipoFoto, setTipoFoto] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoUrls, setFotoUrls] = useState({});
  const evidencias = extras.evidencias || [];
  useEffect(() => {
    let on = true;
    signedUrls(EVIDENCIAS_BUCKET, evidencias.map(ev => ev.path)).then(m => { if (on) setFotoUrls(m); });
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(evidencias.map(ev => ev.path))]);

  const pedirFoto = (tipo, modo = 'galeria') => {
    setTipoFoto(tipo);
    (modo === 'camara' ? fotoCamRef : fotoRef).current?.click();
  };
  const onFotos = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length || !tipoFoto) return;
    setSubiendoFoto(true);
    try {
      const nuevas = [];
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        const blob = await compressImage(f);
        const path = await uploadEvidenciaIngreso({ tareaId: tarea.id, tipo: tipoFoto, blob });
        nuevas.push({ tipo: tipoFoto, path, subido_en: new Date().toISOString() });
      }
      if (nuevas.length) {
        const nx = { ...extras, evidencias: [...evidencias, ...nuevas] };
        setExtras(nx);
        await guardar.mutateAsync({ tareaId: tarea.id, checklist: checklistCompleto(nx), observaciones: obs, disposicion: disp, finalizar: false });
        toast.success(nuevas.length > 1 ? 'Fotos agregadas' : 'Foto agregada');
      }
    } catch (err) {
      toast.error(err?.message?.includes('row-level security') ? 'No tienes permiso para subir fotos' : `Error al subir: ${err.message}`);
    } finally { setSubiendoFoto(false); setTipoFoto(null); }
  };
  const borrarFoto = async (ev) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await deleteEvidenciaSalida(ev.path);
      const nx = { ...extras, evidencias: evidencias.filter(x => x.path !== ev.path) };
      setExtras(nx);
      await guardar.mutateAsync({ tareaId: tarea.id, checklist: checklistCompleto(nx), observaciones: obs, disposicion: disp, finalizar: false });
      toast.success('Foto eliminada');
    } catch { toast.error('No se pudo eliminar la foto'); }
  };

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
        <div className="flex items-center gap-3">
          {tarea.folio && (
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Certificado</p>
              <p className="font-mono font-black text-emerald-700">{tarea.folio}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => descargar('pdf')} title="Descargar PDF"
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50">
              <FileDown size={15} /> PDF
            </button>
            <button onClick={() => descargar('word')} title="Descargar Word"
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50">
              <FileText size={15} /> Word
            </button>
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
            <p className="text-[10px] font-mono text-emerald-500 break-all mt-0.5">{(tarea.firma_digital || '').slice(0, 40)}…</p>
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

      {/* Familias de producto detectadas en la recepción */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={16} className="text-slate-400" />
          <h3 className="text-sm font-black text-slate-800">Familias de producto de la recepción</h3>
          {catLoading && <Loader2 size={14} className="animate-spin text-slate-300" />}
        </div>
        {categorias.length === 0 ? (
          <p className="text-xs text-slate-400">{catLoading ? 'Detectando familias…' : 'Sin ítems clasificables en la recepción. Se aplican solo los controles universales.'}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categorias.map(c => (
              <span key={c.codigo}
                className={`text-[11px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${CATEGORIA_META[c.codigo]?.cls || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                title={c.descripcion || ''}>
                {c.label} · {c.items}
                {c.clase_riesgo && <span className="opacity-70">Clase {c.clase_riesgo}</span>}
                {!c.es_dispositivo_medico && <span className="opacity-70">· no sanitario</span>}
              </span>
            ))}
          </div>
        )}
        {catData?.requiere_registro_isp && (
          <p className="mt-3 text-[11px] text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2 flex items-start gap-1.5">
            <Info size={13} className="mt-0.5 shrink-0" />
            Contiene insumos de posible <b>control obligatorio ISP</b> (jeringas, agujas, guantes, preservativos): verifique el <b>N° de registro sanitario</b> en la sección de insumo estéril.
          </p>
        )}
        {soloNoSanitario && (
          <p className="mt-3 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-start gap-1.5">
            <Info size={13} className="mt-0.5 shrink-0" />
            Recepción de <b>producto no sanitario</b> (bienestar / empaque). El documento se emite como conformidad de recepción, <b>no como certificado de dispositivo médico ISO 13485</b>.
          </p>
        )}
        {sinClasificar > 0 && (
          <p className="mt-3 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-start gap-1.5">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            {sinClasificar} ítem(s) <b>sin clasificar</b> (sin descripción o familia desconocida): solo se aplican los controles universales; revise su clasificación.
          </p>
        )}
      </div>

      {/* Clasificación del producto (manual, complementa las familias detectadas) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2"><Package size={16} className="text-slate-400" /> Clasificación del producto</h3>
        <div className="flex flex-wrap gap-2">
          {CLASIFICACION_INGRESO.map(c => {
            const on = (extras.clasificacion || []).includes(c.id);
            return (
              <button key={c.id} type="button" disabled={readOnly} onClick={() => toggleClasif(c.id)}
                className={`px-3 py-2 rounded-xl border text-xs font-black transition-colors ${on ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`}>
                {on ? '☑' : '☐'} {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Evaluación del embalaje (bloque exclusivo) + riesgo automático */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><Package size={16} className="text-slate-400" /> Evaluación del embalaje</h3>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${riesgo.cls}`}>
            {riesgo.emoji} {riesgo.label}
          </span>
        </div>
        <div className="space-y-2.5">
          {EMBALAJE_INGRESO.map(f => (
            <div key={f.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0 flex-wrap">
              <p className="text-sm text-slate-700 font-semibold">{f.label}</p>
              <div className="flex gap-1.5 flex-wrap">
                {f.opciones.map(op => {
                  const on = embalaje[f.id] === op;
                  const esMala = ['Malo', 'Incorrecto', 'Sí'].includes(op) || (f.id === 'pallet' && op === 'Regular');
                  return (
                    <button key={op} type="button" disabled={readOnly}
                      onClick={() => setEx('embalaje', { ...embalaje, [f.id]: on ? undefined : op })}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-black transition-colors ${on
                        ? (esMala ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white')
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {op}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">El indicador de riesgo se calcula solo: embalaje dañado y no conformidades del checklist suben el nivel.</p>
      </div>

      {/* Niveles + parámetros */}
      <div className="space-y-4">
        {niveles.map(nivel => (
          <div key={nivel.nivel} className={`bg-white rounded-2xl border p-5 ${nivel.categoria ? 'border-emerald-200' : 'border-slate-200'}`}>
            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              {nivel.categoria && <Stamp size={14} className="text-emerald-500 shrink-0" />}{nivel.titulo}
            </h3>
            <div className="space-y-2.5">
              {nivel.params.map(p => (
                <div key={p.id} className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-semibold">{p.label}</p>
                    {answers[p.id]?.estado && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Evidencia:</span>
                        <select value={answers[p.id]?.evidencia || ''} disabled={readOnly}
                          onChange={e => setEvid(p.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${answers[p.id]?.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`}>
                          <option value="">— cómo se verificó —</option>
                          {EVIDENCIA_OPCIONES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    )}
                    {answers[p.id]?.estado === 'NO' && (
                      <input value={answers[p.id]?.nota || ''} disabled={readOnly}
                        onChange={e => setNota(p.id, e.target.value)} placeholder="Detalle de la no conformidad…"
                        className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400" />
                    )}
                    {answers[p.id]?.estado === 'NA' && (
                      <input value={answers[p.id]?.nota || ''} disabled={readOnly}
                        onChange={e => setNota(p.id, e.target.value)} placeholder="Justificación del N/A (recomendada para auditoría ISO)…"
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

        {/* Disposición inmediata de la recepción (no espera el informe posterior) */}
        <div className={`bg-white rounded-2xl border p-5 ${hasNo && !extras.disposicionInmediata ? 'border-rose-200' : 'border-slate-200'}`}>
          <label className={`text-[10px] font-black uppercase tracking-widest ${hasNo && !extras.disposicionInmediata ? 'text-rose-500' : 'text-slate-400'}`}>
            Disposición inmediata {hasNo && <span>*obligatoria (hay no conformes)</span>}
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {DISPOSICION_INMEDIATA_INGRESO.map(d => {
              const on = extras.disposicionInmediata === d;
              const critica = ['Cuarentena', 'Rechazo proveedor', 'Devuelto'].includes(d);
              return (
                <button key={d} type="button" disabled={readOnly}
                  onClick={() => setEx('disposicionInmediata', on ? undefined : d)}
                  className={`px-3 py-2 rounded-xl border text-xs font-black transition-colors ${on
                    ? (critica ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white')
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {on ? '☑' : '☐'} {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Disposición / Acción a tomar — obligatoria si hay No Conformes */}
        {(hasNo || disp) && (
          <div className={`rounded-2xl border p-5 ${hasNo ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'}`}>
            <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-rose-500">
              Disposición / Acción a tomar {hasNo && <span>*obligatoria</span>}
            </label>
            <select value={disp} disabled={readOnly} onChange={e => setDisp(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 rounded-xl border border-rose-200 text-sm font-bold outline-none focus:border-rose-400 bg-white">
              <option value="">— Seleccionar disposición —</option>
              <option value="Rechazar y devolver al proveedor">Rechazar y devolver al proveedor</option>
              <option value="Cuarentena (retención para evaluación)">Cuarentena (retención para evaluación)</option>
              <option value="Aceptar con salvedades">Aceptar con salvedades</option>
              <option value="Reproceso / reacondicionamiento">Reproceso / reacondicionamiento</option>
              <option value="Solicitud de No Conformidad (NC) al proveedor">Solicitud de No Conformidad (NC) al proveedor</option>
            </select>
          </div>
        )}

        {/* Observaciones */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones generales</label>
          <textarea value={obs} disabled={readOnly} onChange={e => setObs(e.target.value)} rows={2}
            placeholder="Notas del checklist…"
            className="mt-1.5 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 resize-none" />
        </div>

        {/* Evidencia fotográfica (cámara directa + galería) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2"><Camera size={16} className="text-slate-400" /> Evidencia fotográfica</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {EVIDENCIAS_INGRESO_TIPOS.map(t => {
              const fotos = evidencias.filter(ev => ev.tipo === t.id);
              return (
                <div key={t.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">📷 {t.label} ({fotos.length})</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {fotos.map(ev => (
                      <div key={ev.path} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <a href={fotoUrls[ev.path] || '#'} target="_blank" rel="noreferrer">
                          <img src={fotoUrls[ev.path] || ''} alt={t.label} className="w-full h-full object-cover" />
                        </a>
                        {!readOnly && (
                          <button onClick={() => borrarFoto(ev)} title="Eliminar foto"
                            className="absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                    {!readOnly && puedeCamara && (
                      <button type="button" onClick={() => pedirFoto(t.id, 'camara')} disabled={subiendoFoto}
                        title="Tomar foto con la cámara"
                        className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40">
                        {subiendoFoto && tipoFoto === t.id ? <RefreshCw size={16} className="animate-spin" /> : <Camera size={16} />}
                        <span className="text-[8px] font-black uppercase">Cámara</span>
                      </button>
                    )}
                    {!readOnly && (
                      <button type="button" onClick={() => pedirFoto(t.id, 'galeria')} disabled={subiendoFoto}
                        title="Subir foto desde archivos/galería"
                        className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40">
                        {subiendoFoto && tipoFoto === t.id ? <RefreshCw size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                        <span className="text-[8px] font-black uppercase">{puedeCamara ? 'Galería' : 'Foto'}</span>
                      </button>
                    )}
                    {fotos.length === 0 && readOnly && <span className="text-xs text-slate-300">Sin fotos</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Galería/archivos: sin capture → elegir y varias. Cámara: capture directo. */}
          <input ref={fotoRef} type="file" accept="image/*" multiple onChange={onFotos} className="hidden" />
          <input ref={fotoCamRef} type="file" accept="image/*" capture="environment" onChange={onFotos} className="hidden" />
          <p className="text-[10px] text-slate-400 mt-2">Las fotos quedan asociadas al checklist (bucket privado).</p>
        </div>

        {/* Indicadores ISO (alimentan dashboards) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-800 mb-3">Indicadores ISO</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              ['Tiempo recepción', minutosRecepcion != null ? `${minutosRecepcion} min` : '—'],
              ['Inspector', ind.inspector || user?.nombre || '—'],
              ['N° ítems', ind.items || 0],
              ['Conformes', ind.ok || 0],
              ['No conformes', ind.no || 0],
              ['Resultado', ind.pct != null ? `${String(ind.pct).replace('.', ',')}%` : '—'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{k}</div>
                <div className={`text-lg font-black ${k === 'No conformes' && ind.no > 0 ? 'text-rose-600' : 'text-slate-900'} truncate`} title={String(v)}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones — certificación automática según las respuestas */}
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
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50">
              Guardar avance
            </button>
            <button onClick={finalizarAuto} disabled={guardar.isPending || faltan > 0}
              className={`px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${hasNo ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {hasNo ? <><FileWarning size={16} /> Finalizar (No Conforme)</> : <><ShieldCheck size={16} /> Finalizar y certificar</>}
            </button>
          </div>
        </div>
      )}
      {tarea.estado === 'NO_CONFORME' && (
        <div className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2"><AlertTriangle size={16} /> Recepción <b>NO CONFORME</b>. Requiere Informe de Daños / Solicitud NC al proveedor.</span>
          {onGenerarDanos && (
            <button onClick={() => onGenerarDanos(tarea)}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center gap-2 hover:bg-rose-700 shrink-0">
              <FileWarning size={16} /> Generar Informe de Daños
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Cola de tareas de checklist ─────────────────────────────────────────────
const ChecklistIngreso = ({ onGenerarDanos }) => {
  const { hasPermission, user } = useAuth();
  const canManage = hasPermission('manage_quality') || hasPermission('manage_monitoreo');
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const { data: tareas = [], isLoading, refetch, isFetching } = useTareasChecklist();
  const eliminar = useEliminarTareaCalidad();
  const [sel, setSel] = useState(null);

  const borrar = async (t, e) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar la tarea de ${t.proveedor || 'recepción'} (OC ${t.oc || '—'})? Esta acción no se puede deshacer.`)) return;
    try { await eliminar.mutateAsync(t.id); toast.success('Tarea eliminada'); }
    catch (err) { toast.error(`No se pudo eliminar: ${err.message}`); }
  };

  // Refrescar la tarea seleccionada cuando cambian los datos.
  const selFresh = sel ? tareas.find(t => t.id === sel.id) || sel : null;

  if (selFresh) return <ChecklistForm tarea={selFresh} onBack={() => setSel(null)} canManage={canManage} onGenerarDanos={onGenerarDanos} />;

  const pendientes = tareas.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <p className="text-sm font-bold text-slate-500">
          {isLoading ? 'Cargando…' : `${tareas.length} tarea(s) · ${pendientes} pendiente(s)`}
        </p>
        <button onClick={() => refetch()} disabled={isFetching}
          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={36} /></div>
      ) : tareas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList size={44} className="text-slate-200 mb-4" />
          <h3 className="text-base font-bold text-slate-400">Sin tareas de checklist</h3>
          <p className="text-xs text-slate-300">Las tareas se generan solas al registrar una recepción. Usa “Actualizar” si acabas de registrar una.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareas.map(t => {
        const meta = ESTADO_TAREA_META[t.estado] || {};
        const om = ORIGEN_META[t.origen] || {};
        const pend = t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO';
        return (
          <div key={t.id} role="button" tabIndex={0} onClick={() => setSel(t)}
            className={`cursor-pointer text-left bg-white rounded-2xl border p-5 transition-all hover:shadow-lg ${pend ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-emerald-300'}`}>
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="flex items-center gap-1.5 font-black text-slate-900 truncate"><Package size={16} className="text-slate-400 shrink-0" />{t.proveedor || 'Sin proveedor'}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${meta.cls}`}>{meta.label || t.estado}</span>
                {isAdmin && (
                  <button onClick={(e) => borrar(t, e)} title="Eliminar (admin)"
                    className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${om.cls}`}>{om.label || t.origen}</span>
              {t.folio && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono">{t.folio}</span>}
            </div>
            <p className="text-sm text-slate-500 font-medium">OC {t.oc || '—'} · {t.fecha_recepcion || '—'}</p>
            {t.bultos != null && <p className="text-xs text-slate-400 mt-1">{t.bultos} bultos</p>}
          </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChecklistIngreso;
