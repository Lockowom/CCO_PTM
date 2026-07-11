import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Truck, ArrowLeft, Loader2, Check, X, Minus, ShieldCheck, AlertTriangle,
  Calendar, FileDown, FileText, PenLine, BadgeCheck, RefreshCw, Search, Plus,
  Package, Ban, Trash2, PencilLine, Scale, Camera, Boxes, ImagePlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CHECKLIST_SALIDA_NIVELES, CHECKLIST_SALIDA_TODOS, DISPOSICIONES_SALIDA, ESTADO_TAREA_META,
  useTareasSalida, useCrearTareaSalidaManual, useGuardarChecklist,
  useFirmarCertificado, fetchCandidatos, useEliminarTareaCalidad,
  RIESGOS_SALIDA, EVIDENCIAS_SALIDA_TIPOS, resultadoPeso, semaforoSalida, SEMAFORO_SALIDA,
  uploadEvidenciaSalida, deleteEvidenciaSalida, EVIDENCIAS_BUCKET, EVIDENCIA_OPCIONES,
} from '../../services/calidadService';
import { fetchNvPanel } from '../../services/panelPtm';
import { compressImage } from '../../lib/imageCompress';
import { signedUrl, signedUrls } from '../../lib/storageUrl';
import { exportChecklistPDF, exportChecklistWord } from '../../lib/exportChecklistIngreso';

// ── Modal: certificación de salida MANUAL (N.V. a mano + SKUs) ──────────────
const ManualModal = ({ onClose, onCreated }) => {
  const crear = useCrearTareaSalidaManual();
  const [nv, setNv] = useState('');
  const [cliente, setCliente] = useState('');
  const [guia, setGuia] = useState('');
  const [transportista, setTransportista] = useState('');
  const [bultos, setBultos] = useState('');
  const [query, setQuery] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [cand, setCand] = useState([]);
  const [sel, setSel] = useState([]);
  const [panelInfo, setPanelInfo] = useState(null);
  const [buscandoNv, setBuscandoNv] = useState(false);

  // Trae los datos de la N.V desde el Panel Dashboard PTM y autollena el
  // formulario (cliente, guía, transportista, bultos) + tarjeta informativa.
  const traerDelPanel = useCallback(async () => {
    if (!nv.trim()) { toast.error('Escribe primero el número de N.V.'); return; }
    setBuscandoNv(true);
    try {
      const info = await fetchNvPanel(nv);
      if (!info) {
        setPanelInfo(null);
        toast.info(`La N.V ${nv.trim()} no está en el Panel PTM (puedes seguir a mano).`);
        return;
      }
      setPanelInfo(info);
      if (info.cliente) setCliente(info.cliente);
      if (info.guia) setGuia(info.guia);
      if (info.transportista) setTransportista(info.transportista);
      if (info.bultos) setBultos(info.bultos);
      toast.success(`N.V ${info.nv} encontrada en el Panel: datos cargados`);
    } catch (e) {
      toast.error(`No se pudo consultar el Panel PTM: ${e.message}`);
    } finally { setBuscandoNv(false); }
  }, [nv]);

  // Para el despacho la ubicación no aporta: se agrupa el stock por SKU+partida
  // (sumando el disponible de todas las ubicaciones) y no se muestra ubicación.
  const agruparPorSku = (lista) => {
    const m = new Map();
    (lista || []).forEach((c) => {
      const k = `${c.codigo_producto}|${c.partida || ''}`;
      const prev = m.get(k);
      if (prev) prev.disponible = Number(prev.disponible || 0) + (Number(c.disponible) || 0);
      else m.set(k, { ...c, ubicacion: '', disponible: Number(c.disponible) || 0 });
    });
    return [...m.values()];
  };

  const buscar = useCallback(async () => {
    setBuscando(true);
    try { setCand(agruparPorSku(await fetchCandidatos(query, false))); }
    catch (e) { toast.error(`Error buscando stock: ${e.message}`); }
    finally { setBuscando(false); }
  }, [query]);

  const keyOf = (c) => `${c.codigo_producto}|${c.partida || ''}`;
  const add = (c) => {
    const k = keyOf(c);
    if (sel.some(s => s._key === k)) { toast.info('Ese SKU ya está agregado'); return; }
    setSel(prev => [...prev, {
      _key: k, codigo_producto: c.codigo_producto, producto: c.producto || '',
      ubicacion: '', partida: c.partida || '',
      cantidad: Number(c.disponible) || 0, unidad_medida: c.unidad_medida || 'UN',
    }]);
  };
  const remove = (k) => setSel(prev => prev.filter(s => s._key !== k));

  const crearCert = async () => {
    if (!nv.trim()) { toast.error('Escribe la N.V.'); return; }
    if (sel.length === 0) { toast.error('Agrega al menos un SKU'); return; }
    try {
      const skus = sel.map(({ _key, ...rest }) => rest);
      const r = await crear.mutateAsync({
        nv: nv.trim(), skus, cliente: cliente.trim() || null, guia: guia.trim() || null,
        transportista: transportista.trim() || null, bultos: bultos ? Number(bultos) : null,
      });
      toast.success('Certificación de salida creada');
      onCreated(r?.id);
    } catch (e) { toast.error(`No se pudo crear: ${e.message}`); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-black text-slate-900 flex items-center gap-2"><PencilLine size={18} className="text-emerald-600" /> Certificar salida (manual)</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Datos del despacho a mano */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">N.V. *</label>
              <div className="flex gap-1.5 mt-1">
                <input value={nv} onChange={e => setNv(e.target.value)} onKeyDown={e => e.key === 'Enter' && traerDelPanel()}
                  placeholder="Ej. 95811"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm font-bold outline-none focus:border-emerald-500" />
                <button onClick={traerDelPanel} disabled={buscandoNv || !nv.trim()} title="Traer datos de la N.V desde el Panel PTM"
                  className="px-3 py-2 rounded-xl bg-indigo-600 text-white shrink-0 hover:bg-indigo-700 disabled:opacity-40">
                  {buscandoNv ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guía</label>
              <input value={guia} onChange={e => setGuia(e.target.value)} placeholder="Opcional"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bultos</label>
              <input value={bultos} onChange={e => setBultos(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" inputMode="numeric"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</label>
              <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Opcional" title={cliente}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transportista</label>
              <input value={transportista} onChange={e => setTransportista(e.target.value)} placeholder="Opcional"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
            </div>
          </div>

          {/* Info de la N.V traída del Panel Dashboard PTM */}
          {panelInfo && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-black text-indigo-700 uppercase tracking-widest text-[10px]">
                  N.V {panelInfo.nv} · Panel Dashboard PTM
                </span>
                <span className="flex items-center gap-1.5">
                  {panelInfo.urgente && <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black">URGENTE</span>}
                  {panelInfo.estado && <span className="px-1.5 py-0.5 rounded-md bg-white text-indigo-700 border border-indigo-200 text-[10px] font-black">{panelInfo.estado}</span>}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-slate-600">
                {panelInfo.vendedor && <span><b className="text-slate-400">Vendedor:</b> {panelInfo.vendedor}</span>}
                {panelInfo.factura && <span><b className="text-slate-400">Factura:</b> {panelInfo.factura}</span>}
                {panelInfo.numeroEnvio && <span><b className="text-slate-400">N° envío:</b> {panelInfo.numeroEnvio}</span>}
                {panelInfo.tipoDespacho && <span><b className="text-slate-400">Tipo despacho:</b> {panelInfo.tipoDespacho}</span>}
                {panelInfo.fechaCompromiso && <span><b className="text-slate-400">Compromiso:</b> {panelInfo.fechaCompromiso.split('-').reverse().join('-')}</span>}
                {panelInfo.fechaDespacho && <span><b className="text-slate-400">Despacho:</b> {panelInfo.fechaDespacho.split('-').reverse().join('-')}</span>}
                {panelInfo.division && <span><b className="text-slate-400">División:</b> {panelInfo.division}</span>}
                {panelInfo.centroCosto && <span><b className="text-slate-400">Centro costo:</b> {panelInfo.centroCosto}</span>}
              </div>
            </div>
          )}

          {/* Buscador de SKUs (por SKU, descripción o ubicación) */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-emerald-400">
              <Search size={16} className="text-slate-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()}
                placeholder="Buscar SKU por código, descripción o ubicación…" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
            <button onClick={buscar} disabled={buscando}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50">
              {buscando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar
            </button>
          </div>
          {cand.length > 0 && (
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-44 overflow-y-auto">
              {cand.map((c, i) => (
                <button key={i} onClick={() => add(c)} className="w-full text-left px-3 py-2 hover:bg-emerald-50/50 flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="font-bold text-sm text-slate-800 truncate block">{c.codigo_producto} · {c.producto}</span>
                    <span className="text-xs text-slate-400">{c.partida || 's/partida'} · {c.disponible} {c.unidad_medida} disponibles</span>
                  </span>
                  <Plus size={16} className="text-emerald-500 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* SKUs elegidos */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">SKUs del despacho ({sel.length})</p>
            {sel.length === 0 ? (
              <p className="text-xs text-slate-400">Agrega los SKUs que se están despachando en esta N.V.</p>
            ) : (
              <div className="space-y-1.5">
                {sel.map(s => (
                  <div key={s._key} className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="min-w-0">
                      <span className="font-bold text-sm text-slate-800 truncate block">{s.codigo_producto} · {s.producto}</span>
                      <span className="text-xs text-slate-400">{s.partida || 's/partida'} · {s.cantidad} {s.unidad_medida}</span>
                    </span>
                    <button onClick={() => remove(s._key)} className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 shrink-0"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50">Cancelar</button>
          <button onClick={crearCert} disabled={crear.isPending || !nv.trim() || sel.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-40">
            {crear.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Crear certificación
          </button>
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

  // El checklist jsonb guarda las respuestas por ítem y, bajo `_extras`, los
  // datos complementarios del certificado (pesos, bultos, riesgos, evidencias).
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
      if (fmt === 'pdf') {
        // Incrustar la evidencia fotográfica en el PDF (URLs firmadas → dataURL).
        const evs = (partir(tarea.checklist).extras.evidencias || extras.evidencias || []);
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
        await exportChecklistPDF(tarea, CHECKLIST_SALIDA_NIVELES, opts);
      } else {
        await exportChecklistWord(tarea, CHECKLIST_SALIDA_NIVELES, opts);
      }
    } catch (e) { toast.error(`No se pudo generar el documento: ${e.message}`); }
  };

  const firmarDoc = async () => {
    if (!confirm('¿Firmar digitalmente este certificado de salida? Quedará sellado y verificable por folio/QR.')) return;
    try { const r = await firmar.mutateAsync(tarea.id); toast.success(`Documento firmado por ${r?.firmado_nombre || ''}`); }
    catch (e) { toast.error(`No se pudo firmar: ${e.message}`); }
  };

  const checklistCompleto = (ex = extras) => ({ ...answers, _extras: ex });

  const guardarAvance = async () => {
    try {
      await guardar.mutateAsync({ tareaId: tarea.id, checklist: checklistCompleto(), observaciones: obs, disposicion: disp, finalizar: false });
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
      const res = await guardar.mutateAsync({ tareaId: tarea.id, checklist: checklistCompleto(), observaciones: obs, disposicion: disp, finalizar: true, resultado });
      if (resultado === 'CONFORME') { toast.success(`Salida certificada ${res?.folio || ''}`); onBack(); }
      else toast.warning('Salida NO CONFORME. No despachar hasta resolver.');
    } catch (e) { toast.error(`No se pudo finalizar: ${e.message}`); }
  };

  // Evidencias fotográficas: suben al bucket privado y se auto-guardan en la
  // tarea (así no quedan fotos huérfanas si el usuario no aprieta Guardar).
  const fotoRef = useRef(null);
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

  const pedirFoto = (tipo) => { setTipoFoto(tipo); fotoRef.current?.click(); };
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
        const path = await uploadEvidenciaSalida({ tareaId: tarea.id, tipo: tipoFoto, blob });
        nuevas.push({ tipo: tipoFoto, path, subido_en: new Date().toISOString() });
      }
      if (nuevas.length) {
        const nx = { ...extras, evidencias: [...evidencias, ...nuevas] };
        setExtras(nx);
        await guardar.mutateAsync({ tareaId: tarea.id, checklist: checklistCompleto(nx), observaciones: obs, disposicion: disp, finalizar: false });
        toast.success(nuevas.length > 1 ? 'Fotos agregadas al certificado' : 'Foto agregada al certificado');
      }
    } catch (err) {
      toast.error(err?.message?.includes('row-level security') ? 'No tienes permiso para subir fotos' : `Error al subir: ${err.message}`);
    } finally { setSubiendoFoto(false); setTipoFoto(null); }
  };
  const borrarFoto = async (ev) => {
    if (!confirm('¿Eliminar esta foto del certificado?')) return;
    try {
      await deleteEvidenciaSalida(ev.path);
      const nx = { ...extras, evidencias: evidencias.filter(x => x.path !== ev.path) };
      setExtras(nx);
      await guardar.mutateAsync({ tareaId: tarea.id, checklist: checklistCompleto(nx), observaciones: obs, disposicion: disp, finalizar: false });
      toast.success('Foto eliminada');
    } catch { toast.error('No se pudo eliminar la foto'); }
  };

  // Riesgos evaluados (NINGUNO es exclusivo).
  const toggleRiesgo = (id) => setExtras(prev => {
    const cur = new Set(prev.riesgos || []);
    if (id === 'NINGUNO') return { ...prev, riesgos: cur.has('NINGUNO') ? [] : ['NINGUNO'] };
    cur.delete('NINGUNO');
    if (cur.has(id)) cur.delete(id); else cur.add(id);
    return { ...prev, riesgos: [...cur] };
  });

  // Bultos: etiquetas por bulto (Bulto i/N — Etiqueta OK).
  const bultosTotal = Number(extras.bultosTotal ?? tarea.bultos) || 0;
  const etiquetas = Array.isArray(extras.bultosEtiquetas) ? extras.bultosEtiquetas : [];
  const toggleEtiqueta = (i) => {
    const nx = Array.from({ length: bultosTotal }, (_, k) => !!etiquetas[k]);
    nx[i] = !nx[i];
    setEx('bultosEtiquetas', nx);
  };

  // Pesos.
  const pesos = extras.pesos || {};
  const resPeso = resultadoPeso(pesos.esperado, pesos.registrado);

  // Semáforo en vivo (mientras se edita) o el del resultado final.
  const sem = finalizada
    ? semaforoSalida(tarea)
    : !answeredAll
      ? { key: 'PENDIENTE', ...SEMAFORO_SALIDA.PENDIENTE }
      : hasNo
        ? (disp === 'Despachar con salvedades (autorizado)'
          ? { key: 'NARANJA', ...SEMAFORO_SALIDA.NARANJA }
          : { key: 'ROJO', ...SEMAFORO_SALIDA.ROJO })
        : { key: 'VERDE', ...SEMAFORO_SALIDA.VERDE };

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

      {/* Semáforo de calidad del despacho */}
      <div className={`rounded-2xl border-2 p-4 mb-4 flex items-center justify-between gap-3 flex-wrap ${sem.cls}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{sem.emoji}</span>
          <div>
            <p className="font-black text-lg tracking-tight">{sem.label}</p>
            <p className="text-xs opacity-80 font-bold">
              {finalizada
                ? (tarea.disposicion ? `Disposición: ${tarea.disposicion}` : `Folio ${tarea.folio || '—'}`)
                : (faltan > 0 ? `${faltan} ítem(s) del checklist por responder` : 'Checklist completo — listo para finalizar')}
            </p>
          </div>
        </div>
        {resPeso && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${resPeso === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
            Peso {resPeso}
          </span>
        )}
      </div>

      {/* SKUs del despacho (si se cargaron al crear) */}
      {Array.isArray(ctx.skus) && ctx.skus.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2"><Package size={16} className="text-slate-400" /> SKUs del despacho ({ctx.skus.length})</h3>
          <div className="space-y-1.5">
            {ctx.skus.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm border-b border-slate-50 last:border-0 py-1.5">
                <span className="min-w-0"><b className="text-slate-800">{s.codigo_producto}</b> <span className="text-slate-500">· {s.producto}</span></span>
                <span className="text-xs text-slate-400 shrink-0">{s.ubicacion || '—'} · {s.cantidad} {s.unidad_medida || ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

        {/* Control de peso */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2"><Scale size={16} className="text-slate-400" /> Control de peso</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso esperado (kg)</label>
              <input value={pesos.esperado || ''} disabled={readOnly} inputMode="decimal"
                onChange={e => setEx('pesos', { ...pesos, esperado: e.target.value.replace(/[^0-9.,]/g, '') })}
                placeholder="Ej. 125"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso registrado (kg)</label>
              <input value={pesos.registrado || ''} disabled={readOnly} inputMode="decimal"
                onChange={e => setEx('pesos', { ...pesos, registrado: e.target.value.replace(/[^0-9.,]/g, '') })}
                placeholder="Ej. 125,3"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              {resPeso ? (
                <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-black ${resPeso === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
                  {resPeso === 'CONFORME' ? <Check size={15} /> : <AlertTriangle size={15} />} {resPeso}
                </span>
              ) : <span className="text-xs text-slate-400 font-bold">Ingresa ambos pesos (tolerancia ±2%). Si falta una caja, el peso cambia.</span>}
            </div>
          </div>
        </div>

        {/* Bultos: etiqueta por bulto */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><Boxes size={16} className="text-slate-400" /> Bultos y etiquetas</h3>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total bultos</label>
              <input value={extras.bultosTotal ?? tarea.bultos ?? ''} disabled={readOnly} inputMode="numeric"
                onChange={e => setEx('bultosTotal', e.target.value.replace(/[^0-9]/g, ''))}
                className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-black text-center outline-none focus:border-emerald-400" />
            </div>
          </div>
          {bultosTotal > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: Math.min(bultosTotal, 60) }, (_, i) => (
                  <button key={i} type="button" disabled={readOnly} onClick={() => toggleEtiqueta(i)}
                    className={`px-3 py-2 rounded-xl border text-xs font-black transition-colors ${etiquetas[i] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`}>
                    Bulto {i + 1}/{bultosTotal} · {etiquetas[i] ? 'Etiqueta OK' : 'Pendiente'}
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold mt-2 text-slate-500">
                {etiquetas.slice(0, bultosTotal).filter(Boolean).length}/{bultosTotal} etiquetas verificadas
              </p>
            </>
          ) : <p className="text-xs text-slate-400">Define el total de bultos para verificar la etiqueta de cada uno.</p>}
        </div>

        {/* Riesgos evaluados */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-slate-400" /> Riesgos evaluados</h3>
          <div className="flex flex-wrap gap-2">
            {RIESGOS_SALIDA.map(r => {
              const on = (extras.riesgos || []).includes(r.id);
              return (
                <button key={r.id} type="button" disabled={readOnly} onClick={() => toggleRiesgo(r.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-black transition-colors ${on ? (r.id === 'NINGUNO' ? 'bg-slate-700 border-slate-700 text-white' : 'bg-amber-500 border-amber-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`}>
                  {on ? '☑' : '☐'} {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidencia fotográfica */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2"><Camera size={16} className="text-slate-400" /> Evidencia fotográfica</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {EVIDENCIAS_SALIDA_TIPOS.map(t => {
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
                    {!readOnly && (
                      <button type="button" onClick={() => pedirFoto(t.id)} disabled={subiendoFoto}
                        className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40">
                        {subiendoFoto && tipoFoto === t.id ? <RefreshCw size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                        <span className="text-[8px] font-black uppercase">Foto</span>
                      </button>
                    )}
                    {fotos.length === 0 && readOnly && <span className="text-xs text-slate-300">Sin fotos</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <input ref={fotoRef} type="file" accept="image/*" capture="environment" multiple onChange={onFotos} className="hidden" />
          <p className="text-[10px] text-slate-400 mt-2">Las fotos quedan asociadas al certificado (bucket privado) y se incrustan en el PDF.</p>
        </div>

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
  const { hasPermission, user } = useAuth();
  const canManage = hasPermission('manage_quality') || hasPermission('manage_monitoreo');
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const { data: tareas = [], isLoading, refetch, isFetching } = useTareasSalida();
  const eliminar = useEliminarTareaCalidad();
  const [sel, setSel] = useState(null);
  const [modalManual, setModalManual] = useState(false); // creación manual

  const borrar = async (t, e) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar la certificación de salida (NV ${t.oc || '—'})? Esta acción no se puede deshacer.`)) return;
    try { await eliminar.mutateAsync(t.id); toast.success('Certificación eliminada'); }
    catch (err) { toast.error(`No se pudo eliminar: ${err.message}`); }
  };

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
            <button onClick={() => setModalManual(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-emerald-700">
              <PencilLine size={14} /> Certificar salida (N.V. + SKU)
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
          <p className="text-xs text-slate-300">Usa “Certificar manual” (escribes la N.V. y agregas los SKUs) o “Desde despacho” para elegir uno existente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareas.map(t => {
            const meta = ESTADO_TAREA_META[t.estado] || {};
            const ctx = t.contexto || {};
            const pend = t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO';
            return (
              <div key={t.id} role="button" tabIndex={0} onClick={() => setSel(t.id)}
                className={`cursor-pointer text-left bg-white rounded-2xl border p-5 transition-all hover:shadow-lg ${pend ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-emerald-300'}`}>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="flex items-center gap-1.5 font-black text-slate-900 truncate"><Package size={16} className="text-slate-400 shrink-0" />{t.proveedor || ctx.cliente || 'Sin cliente'}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${meta.cls}`}>{meta.label || t.estado}</span>
                    {isAdmin && (
                      <button onClick={(e) => borrar(t, e)} title="Eliminar (admin)"
                        className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-teal-50 text-teal-700 border-teal-200">NV {t.oc || ctx.nv || '—'}</span>
                  {t.folio && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono">{t.folio}</span>}
                  {(t.estado === 'CONFORME' || t.estado === 'NO_CONFORME') && (() => {
                    const s = semaforoSalida(t);
                    return <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${s.cls}`}>{s.emoji} {s.label}</span>;
                  })()}
                </div>
                <p className="text-sm text-slate-500 font-medium">Guía {ctx.guia || '—'} · {t.fecha_recepcion || '—'}</p>
                {t.bultos != null && <p className="text-xs text-slate-400 mt-1">{t.bultos} bultos · {ctx.transportista || ctx.empresa_transporte || 's/transportista'}</p>}
              </div>
            );
          })}
        </div>
      )}

      {modalManual && <ManualModal onClose={() => setModalManual(false)} onCreated={(id) => { setModalManual(false); if (id) setSel(id); }} />}
    </div>
  );
};

export default SalidaCertificacion;
