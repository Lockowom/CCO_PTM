import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import {
  Save, Search, Loader2, Hash, Truck, ClipboardList, Sparkles, PackagePlus,
  Trash2, X, Plus, Layers,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import PanelModal from '../PanelModal';
import {
  CANALES, VARIOS_TIPOS, ESTADOS_SELECCIONABLES, ESTADOS_ACTIVOS, TIPOS_DESPACHO, ACCENT, colorFor,
  listaActivas, opciones, lookup, guardar, eliminar,
  listarConsolidados, guardarConsolidado, eliminarConsolidado, buscarNvBasico,
} from '../ingresar/ingresarService';

const hoy = () => new Date().toLocaleDateString('en-CA');
const soloFecha = (v) => (v ? String(v).slice(0, 10) : '');

function SectionHead({ n, icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-xl border bg-orange-50 border-orange-100 text-orange-600 flex items-center justify-center shrink-0"><Icon size={15} /></div>
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-black text-slate-300">{n}</span>
        <h2 className="text-[12px] font-black text-slate-600 uppercase tracking-wider">{title}</h2>
      </div>
    </div>
  );
}

// Días hábiles (+2) para F. Compromiso — igual que el original.
function addBusinessDays(start, days) {
  const r = new Date(start); let added = 0; const dow = r.getDay();
  if (dow === 0) r.setDate(r.getDate() + 1); else if (dow === 6) r.setDate(r.getDate() + 2);
  while (added < days) { r.setDate(r.getDate() + 1); const d = r.getDay(); if (d !== 0 && d !== 6) added++; }
  return r;
}
function calcFechaCompromiso(aprob, aprobReal) {
  const base = aprobReal || aprob; if (!base) return '';
  const d = new Date(base + 'T12:00:00'); if (isNaN(d.getTime())) return '';
  const r = addBusinessDays(d, 2);
  return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, '0')}-${String(r.getDate()).padStart(2, '0')}`;
}

// ── Stepper — timeline del flujo (port fiel) ────────────────────────────────
const STEPS = [
  { label: 'Registrada', dateKey: 'fecha_registro_nv' },
  { label: 'Aprobada', dateKey: 'fecha_aprobacion' },
  { label: 'En Proceso', dateKey: 'fecha_en_proceso' },
  { label: 'Shipping', dateKey: 'fecha_shipping' },
  { label: 'Despachada', dateKey: 'fecha_despacho' },
  { label: 'En Ruta', dateKey: 'fecha_en_ruta' },
  { label: 'Entregada', dateKey: 'fecha_entregado' },
];
function diffDias(a, b) {
  if (!a || !b) return null;
  const ta = new Date(a).getTime(), tb = new Date(b).getTime();
  if (isNaN(ta) || isNaN(tb)) return null;
  const d = Math.round((tb - ta) / 86400000);
  return d >= 0 ? d : null;
}
function Stepper({ data }) {
  const dates = STEPS.map((s) => soloFecha(data[s.dateKey]));
  let lastCompleted = -1;
  for (let i = dates.length - 1; i >= 0; i--) { if (dates[i]) { lastCompleted = i; break; } }
  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const fecha = dates[i]; const completed = !!fecha; const isCurrent = i === lastCompleted;
        const prevFecha = i > 0 ? dates[i - 1] : '';
        const dias = i > 0 && fecha && prevFecha ? diffDias(prevFecha, fecha) : null;
        const slow = dias !== null && dias > 3;
        return (
          <div key={step.label} className="flex items-start gap-3" style={{ minHeight: 44 }}>
            <div className="flex flex-col items-center w-5 shrink-0">
              {i > 0 && <div className="w-0.5 h-3" style={{ background: completed ? (slow ? '#ef4444' : '#22c55e') : '#e5e7eb' }} />}
              {i === 0 && <div className="h-1" />}
              <div className={`rounded-full shrink-0 flex items-center justify-center transition-all ${isCurrent ? 'w-5 h-5 ring-4 ring-orange-100' : completed ? 'w-4 h-4' : 'w-3.5 h-3.5 border-2 border-gray-300'}`}
                style={{ background: isCurrent ? '#f57c00' : completed ? '#22c55e' : 'transparent' }}>
                {completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              {i < STEPS.length - 1 && <div className="w-0.5 flex-1 min-h-[8px]" style={{ background: completed && dates[i + 1] ? '#22c55e' : '#e5e7eb' }} />}
            </div>
            <div className="flex-1 min-w-0 pb-1 pt-0.5">
              <div className="flex items-center gap-2">
                <span className={`text-[12px] font-semibold ${isCurrent ? 'text-orange-600' : completed ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</span>
                {dias !== null && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${slow ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>{dias}d</span>}
              </div>
              {fecha && <span className="text-[11px] text-gray-400 font-medium">{fecha}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Modal de detalle (panel lateral, port fiel del ModalDetalle) ────────────
function DetalleDrawer({ item, puedeEscribir, opts, onClose, onSaved, onDeleted }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState({});          // valores editados
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [estadoQuery, setEstadoQuery] = useState('');
  const [result, setResult] = useState(null);
  const estadoRef = useRef(null);

  useEffect(() => {
    let on = true; setLoading(true);
    lookup(item.canal, item.nv).then((r) => { if (!on) return; setData(r.found ? r.data : null); setLoading(false); });
    return () => { on = false; };
  }, [item]);
  useEffect(() => {
    const onClick = (e) => { if (estadoRef.current && !estadoRef.current.contains(e.target)) setEstadoOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const detailVal = (field) => (field in edit ? edit[field] : (data?.[field] ?? '') ?? '');
  const setDetailField = (field, value) => {
    setEdit((p) => {
      const next = { ...p, [field]: value };
      // F. Aprobación Real recalcula F. Compromiso (+2 días hábiles), como el original.
      if (field === 'fecha_aprobacion_real') {
        next.fecha_compromiso = calcFechaCompromiso(soloFecha(data?.fecha_aprobacion), value);
      }
      return next;
    });
  };
  const dirty = useMemo(() => {
    const d = {};
    Object.keys(edit).forEach((k) => { const orig = data?.[k] ?? ''; if (String(edit[k] ?? '') !== String(orig ?? '')) d[k] = edit[k]; });
    return d;
  }, [edit, data]);

  const COL_A_FORM = { estado: 'estado', urgente: 'urgente', transportista: 'transportista', tipo_despacho: 'tipoDespacho', fecha_compromiso: 'fechaCompromiso', fecha_aprobacion_real: 'fechaAprobacionReal', fecha_facturacion: 'fechaFacturacion', fecha_despacho: 'fechaDespacho', factura: 'factura', guia: 'guia', bultos: 'bultos', valor_factura: 'valorFactura', numero_envio: 'numeroEnvio' };
  const onGuardar = async () => {
    setSaving(true); setResult(null);
    const payload = { id: item.id };
    Object.entries(dirty).forEach(([k, v]) => { payload[COL_A_FORM[k] || k] = k === 'urgente' ? (String(v) === 'true') : v; });
    const res = await guardar(payload);
    setSaving(false);
    if (res.ok) {
      setResult({ success: true, message: 'Cambios guardados' });
      onSaved?.({ ...item, estado: detailVal('estado') || item.estado, transportista: detailVal('transportista'), urgente: String(detailVal('urgente')) === 'true' });
      setTimeout(onClose, 700);
    } else setResult({ success: false, message: res.error || 'No se pudo guardar' });
  };
  const onEliminar = async () => {
    setDeleting(true);
    const res = await eliminar(item.id);
    setDeleting(false);
    if (res.ok) { toast.success(`NV ${item.nv} eliminada`); onDeleted?.(item); onClose(); }
    else { setResult({ success: false, message: res.error || 'No se pudo eliminar' }); setDelConfirm(false); }
  };

  const transportistasOpts = opts?.transportistas || [];
  const esUrgente = String(detailVal('urgente')) === 'true';

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl anim-fade-up">
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2"><span className="text-[16px] font-bold text-gray-900">NV {item.nv}</span><span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{item.canal}</span></div>
            <div className="flex items-center gap-1.5 mt-1"><span className="w-2 h-2 rounded-full" style={{ background: colorFor(item.estado) }} /><span className="text-[12px] text-gray-500">{item.estado}</span></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {!data && loading ? (
            <div className="py-20 text-center"><span className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /><p className="text-sm text-gray-400 mt-3">Cargando datos…</p></div>
          ) : !data ? (
            <div className="py-20 text-center text-sm text-gray-400">No se pudieron cargar los datos de esta NV.</div>
          ) : (
            <div className="p-5 space-y-5">
              <section>
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Información</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[{ l: 'Cliente', v: data.cliente }, { l: 'Vendedor', v: data.vendedor }, { l: 'C. Costo', v: data.ccosto || data.centro_costo }, { l: 'División', v: data.division }].filter((x) => x.v).map((x) => (
                    <div key={x.l} className="bg-gray-50 rounded-lg px-3 py-2"><div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{x.l}</div><div className="text-[13px] text-gray-700 font-medium truncate">{x.v}</div></div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Progreso</h3>
                <div className="bg-gray-50 rounded-xl p-3"><Stepper data={data} /></div>
              </section>

              {!puedeEscribir ? (
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">Solo lectura · necesitas el permiso <b>manage_panel</b> para editar.</div>
              ) : (
                <>
                  <section>
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Estado y Logística</h3>
                    <label className="field-label">Estado</label>
                    <div className="relative mb-3" ref={estadoRef}>
                      <button type="button" onClick={() => { setEstadoOpen((o) => !o); setEstadoQuery(''); }} className="field-input flex items-center justify-between text-left" style={estadoOpen ? { borderColor: ACCENT, boxShadow: `0 0 0 4px ${ACCENT}1f` } : undefined}>
                        <span className="inline-flex items-center gap-2.5 min-w-0"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorFor(detailVal('estado')) }} /><span className="text-gray-800 font-medium truncate">{detailVal('estado') || 'Seleccionar'}</span></span>
                        <span className={`text-gray-300 text-xs transition-transform shrink-0 ${estadoOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      {estadoOpen && (
                        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                          <div className="p-2 border-b border-gray-100"><input autoFocus value={estadoQuery} onChange={(e) => setEstadoQuery(e.target.value)} placeholder="Buscar estado…" className="field-input py-2 text-sm" /></div>
                          <div className="max-h-60 overflow-y-auto py-1">
                            {ESTADOS_SELECCIONABLES.filter((c) => c.toLowerCase().includes(estadoQuery.toLowerCase())).map((c) => {
                              const s = detailVal('estado') === c;
                              return (<button key={c} type="button" onClick={() => { setDetailField('estado', c); setEstadoOpen(false); setEstadoQuery(''); }} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm ${s ? 'bg-orange-50' : 'hover:bg-gray-50'}`}><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorFor(c) }} /><span className={s ? 'font-semibold text-gray-900' : 'text-gray-700'}>{c}</span>{s && <span className="ml-auto font-bold" style={{ color: ACCENT }}>✓</span>}</button>);
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="field-label">Tipo Despacho</label><select value={detailVal('tipo_despacho')} onChange={(e) => setDetailField('tipo_despacho', e.target.value)} className="field-input"><option value="">—</option>{(opts?.tiposDespacho || TIPOS_DESPACHO).map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
                      <div><label className="field-label">Transportista</label>{transportistasOpts.length > 0 ? (<select value={detailVal('transportista')} onChange={(e) => setDetailField('transportista', e.target.value)} className="field-input"><option value="">—</option>{transportistasOpts.map((t) => <option key={t} value={t}>{t}</option>)}</select>) : (<input type="text" value={detailVal('transportista')} onChange={(e) => setDetailField('transportista', e.target.value)} className="field-input" />)}</div>
                    </div>
                    <div className="flex items-center justify-between mt-3 px-1">
                      <div className="flex items-center gap-2"><span className="text-red-500 text-sm">🚨</span><span className="text-[13px] font-medium text-gray-700">Marcar como Urgente</span></div>
                      <button type="button" onClick={() => setDetailField('urgente', esUrgente ? 'false' : 'true')} className={`relative w-11 h-6 rounded-full transition-colors ${esUrgente ? 'bg-red-500' : 'bg-gray-200'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${esUrgente ? 'translate-x-5' : ''}`} /></button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Fechas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="field-label">F. Aprobación Real</label><input type="date" value={detailVal('fecha_aprobacion_real')} onChange={(e) => setDetailField('fecha_aprobacion_real', e.target.value)} className="field-input" /><p className="mt-0.5 text-[9px] text-gray-400">Recalcula F. Compromiso (+2 días hábiles)</p></div>
                      <div><label className="field-label">F. Compromiso <span className="normal-case" style={{ color: detailVal('fecha_compromiso') ? ACCENT : '#9ca3af' }}>(auto)</span></label><input type="date" value={detailVal('fecha_compromiso')} readOnly className="field-input bg-gray-50 text-gray-500 cursor-not-allowed" /></div>
                      <div><label className="field-label">F. Facturación</label><input type="date" value={detailVal('fecha_facturacion')} onChange={(e) => setDetailField('fecha_facturacion', e.target.value)} className="field-input" /></div>
                      <div><label className="field-label">F. Despacho</label><input type="date" value={detailVal('fecha_despacho')} onChange={(e) => setDetailField('fecha_despacho', e.target.value)} className="field-input" /></div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Documentos</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="field-label">Factura</label><input type="text" value={detailVal('factura')} onChange={(e) => setDetailField('factura', e.target.value)} className="field-input" /></div>
                      <div><label className="field-label">Guía</label><input type="text" value={detailVal('guia')} onChange={(e) => setDetailField('guia', e.target.value)} className="field-input" /></div>
                      <div><label className="field-label">N° Envío</label><input type="text" value={detailVal('numero_envio')} onChange={(e) => setDetailField('numero_envio', e.target.value)} className="field-input" /></div>
                      <div><label className="field-label">Bultos</label><input type="number" value={detailVal('bultos')} onChange={(e) => setDetailField('bultos', e.target.value)} className="field-input" /></div>
                      <div><label className="field-label">Valor Factura</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">$</span><input type="text" inputMode="numeric" value={detailVal('valor_factura')} onChange={(e) => setDetailField('valor_factura', e.target.value.replace(/[^0-9.]/g, ''))} className="field-input pl-7" /></div></div>
                    </div>
                  </section>
                </>
              )}

              {result && <div className={`rounded-xl px-3.5 py-3 text-[13px] ${result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>{result.success ? '✓ ' : '⚠ '}{result.message}</div>}
            </div>
          )}
        </div>

        {data && puedeEscribir && (
          <div className="shrink-0 bg-white border-t border-gray-200 p-4 space-y-2">
            {Object.keys(dirty).length > 0 && (
              <button onClick={onGuardar} disabled={saving} className="w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: ACCENT }}>
                {saving ? <span className="inline-flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando…</span> : `Guardar ${Object.keys(dirty).length} cambio${Object.keys(dirty).length !== 1 ? 's' : ''}`}
              </button>
            )}
            {!delConfirm ? (
              <button onClick={() => setDelConfirm(true)} className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">Eliminar NV</button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <p className="text-sm text-red-700 font-medium">¿Estás seguro de eliminar la NV <strong>{item.nv}</strong>?</p>
                <p className="text-xs text-red-500">Esta acción no se puede deshacer.</p>
                <div className="flex gap-2">
                  <button onClick={() => setDelConfirm(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <button onClick={onEliminar} disabled={deleting} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60">{deleting ? 'Eliminando…' : 'Sí, eliminar'}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ── Fila de la lista (port fiel de NvRow) ───────────────────────────────────
function NvRow({ i, onOpen }) {
  return (
    <div onClick={() => onOpen(i)} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border bg-white hover:border-gray-300 text-left transition-all cursor-pointer ${i.urgente ? 'border-red-200' : 'border-gray-200'}`}>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2"><span className="text-[14px] font-semibold text-gray-900">NV {i.nv}</span><span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{i.canal}</span>{i.urgente && <span className="text-[11px]">🚨</span>}</span>
        <span className="block text-[12px] text-gray-500 truncate mt-0.5">{i.cliente || '—'}{i.vendedor ? ` · ${i.vendedor}` : ''}</span>
        {(i.guia || i.factura) && <span className="block text-[11px] text-gray-400 truncate mt-0.5">{i.guia ? `Guía: ${i.guia}` : ''}{i.guia && i.factura ? ' · ' : ''}{i.factura ? `Fact: ${i.factura}` : ''}</span>}
        {(i.fechaAprobacion || i.fechaAprobacionReal) && <span className="block text-[11px] text-gray-400 truncate mt-0.5">{i.fechaAprobacion ? `Aprob: ${i.fechaAprobacion}` : ''}{i.fechaAprobacion && i.fechaAprobacionReal ? ' · ' : ''}{i.fechaAprobacionReal ? `Real: ${i.fechaAprobacionReal}` : ''}</span>}
      </span>
      <span className="flex flex-col items-end gap-1 shrink-0">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-gray-50 border border-gray-100"><span className="w-1.5 h-1.5 rounded-full" style={{ background: colorFor(i.estado) }} /><span className="text-gray-600">{i.estado}</span></span>
      </span>
      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="m9 5 7 7-7 7" /></svg>
    </div>
  );
}

// ── Pestaña Buscar (lista de N.V. activas) ──────────────────────────────────
function TabBuscar({ puedeEscribir }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todos');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [opts, setOpts] = useState(null);

  const cargar = useCallback(() => {
    setLoading(true);
    listaActivas().then((rows) => { setLista(rows); setLoading(false); }).catch(() => { setLista([]); setLoading(false); });
  }, []);
  useEffect(() => { cargar(); opciones().then(setOpts).catch(() => {}); }, [cargar]);

  const filtrada = useMemo(() => {
    const term = q.trim().toLowerCase();
    return lista.filter((r) => (filtro === 'Todos' || r.estado === filtro)
      && (!term || [r.nv, r.cliente, r.vendedor, r.guia, r.factura, r.transportista].filter(Boolean).some((v) => String(v).toLowerCase().includes(term))));
  }, [lista, filtro, q]);
  const conteo = useMemo(() => { const m = {}; lista.forEach((r) => { m[r.estado] = (m[r.estado] || 0) + 1; }); return m; }, [lista]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por NV, guía o factura…" className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none bg-white" />
      </div>
      <div className="flex flex-wrap gap-2">
        {ESTADOS_ACTIVOS.filter((e) => (conteo[e] || 0) >= 0).map((e) => (
          <button key={e} onClick={() => setFiltro(filtro === e ? 'Todos' : e)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-all ${filtro === e ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
            {e} <span className={`text-[11px] ${filtro === e ? 'text-gray-300' : 'text-gray-400'}`}>{conteo[e] || 0}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-gray-400">{filtrada.length} resultados de {lista.length} activas</span>
        <button onClick={cargar} className="inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-orange-600 font-medium">↻ Recargar</button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={30} /></div>
      ) : filtrada.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Sin N.V. activas para este filtro.</div>
      ) : (
        <div className="space-y-2">
          {filtrada.map((r) => <NvRow key={r.key} i={r} onOpen={setSel} />)}
        </div>
      )}

      {sel && (
        <DetalleDrawer item={sel} puedeEscribir={puedeEscribir} opts={opts}
          onClose={() => setSel(null)}
          onSaved={(upd) => setLista((ls) => ls.map((x) => (x.key === upd.key ? { ...x, ...upd } : x)))}
          onDeleted={(del) => setLista((ls) => ls.filter((x) => x.key !== del.key))} />
      )}
    </div>
  );
}

// ── Pestaña Ingresar (formulario alta/edición) ──────────────────────────────
const FORM0 = {
  canal: 'ptm', nv: '', mode: 'idle', lookup: null,
  variosTipo: '', variosCliente: '', variosVendedor: '', variosDivision: '', variosCcosto: '',
  estado: '', urgente: false, tipoDespacho: '', transportista: '',
  fechaCompromiso: '', fechaAprobacion: '', fechaAprobacionReal: '', fechaFacturacion: '', fechaDespacho: '',
  factura: '', guia: '', bultos: '', valorFactura: '', numeroEnvio: '',
};
function TabIngresar() {
  const [f, setF] = useState(FORM0);
  const set = (patch) => setF((p) => ({ ...p, ...patch }));
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [estadoQuery, setEstadoQuery] = useState('');
  const estadoRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (estadoRef.current && !estadoRef.current.contains(e.target)) setEstadoOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  const estadoFiltered = useMemo(() => ESTADOS_SELECCIONABLES.filter((e) => e.toLowerCase().includes(estadoQuery.toLowerCase())), [estadoQuery]);

  const buscar = () => {
    const nv = f.nv.trim(); if (!nv) return;
    setLookupLoading(true);
    lookup(f.canal, nv).then((r) => {
      if (r.found) set({ mode: 'update', lookup: { found: true, row: r.row, data: r.data }, estado: r.data.estado || '', transportista: r.data.transportista || '', tipoDespacho: r.data.tipo_despacho || '', fechaCompromiso: r.data.fecha_compromiso || '', fechaAprobacion: r.data.fecha_aprobacion ? String(r.data.fecha_aprobacion).slice(0, 10) : '', factura: r.data.factura || '', guia: r.data.guia || '', bultos: r.data.bultos ?? '', numeroEnvio: r.data.numero_envio || '', urgente: r.data.urgente === true });
      else set({ mode: 'create', lookup: { found: false, autoFill: r.autoFill }, fechaAprobacion: hoy() });
      setLookupLoading(false);
    });
  };
  const onGuardar = () => {
    if (f.mode === 'idle') return toast.error('Busca una N.V. primero');
    if (!f.estado) return toast.error('Falta el Estado');
    setSaving(true);
    guardar({ ...f }).then((res) => {
      setSaving(false);
      if (res.ok) { toast.success(`N.V. ${f.nv} ${f.mode === 'update' ? 'actualizada' : 'creada'}`); setF(FORM0); }
      else toast.error(res.error || 'No se pudo guardar');
    });
  };

  const af = f.lookup?.found ? f.lookup.data : f.lookup?.autoFill;
  const cells = af ? [{ l: 'Cliente', v: af.cliente }, { l: 'Vendedor', v: af.vendedor }, { l: 'C. Costo', v: af.ccosto }, { l: 'División', v: af.division }].filter((x) => x.v) : [];

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-24">
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionHead n="01" icon={Hash} title="Identificación" />
        <label className="field-label">Canal</label>
        <div className="mb-4 flex flex-wrap items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
          {CANALES.map((c) => (
            <button key={c.value} type="button" onClick={() => set({ canal: c.value, lookup: null, mode: 'idle' })}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-colors ${f.canal === c.value ? 'bg-orange-500 text-white shadow' : 'text-slate-500 hover:text-orange-600 hover:bg-white'}`}>{c.label}</button>
          ))}
        </div>
        <label className="field-label">N° Nota de Venta</label>
        <div className="flex gap-2">
          <input type="text" value={f.nv} placeholder="Ej: 97125" className="field-input"
            onChange={(e) => { const v = e.target.value; set(!v.trim() ? { nv: v, mode: 'idle', lookup: null } : { nv: v }); }}
            onKeyDown={(e) => e.key === 'Enter' && buscar()} />
          <button onClick={buscar} disabled={lookupLoading || !f.nv.trim()} className="px-5 rounded-xl bg-slate-900 text-white text-sm font-black active:scale-95 disabled:opacity-40 flex items-center gap-1.5">
            {lookupLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Buscar
          </button>
        </div>
        {f.lookup && (
          <div className="mt-4">
            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-bold ${f.lookup.found ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <span>{f.lookup.found ? '✎' : '✨'}</span>
              {f.lookup.found ? <span>NV encontrada · <b>actualizar</b></span> : <span>NV nueva · <b>crear</b></span>}
            </div>
            {cells.length > 0 && (
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {cells.map((x) => (<div key={x.l} className="bg-slate-50 rounded-lg px-3 py-2"><div className="text-[10px] uppercase tracking-wide text-slate-400 font-black">{x.l}</div><div className="text-[13px] text-slate-700 font-bold truncate">{x.v}</div></div>))}
              </div>
            )}
          </div>
        )}
      </section>

      {f.mode === 'idle' && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-100 rounded-2xl px-6 py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-orange-500 mx-auto mb-3 shadow-sm"><Sparkles size={26} /></div>
          <p className="text-sm font-black text-slate-700">Busca una N.V. para comenzar</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Escribe el número y presiona <b>Buscar</b>: si existe, la actualizas; si no, se crea.</p>
        </div>
      )}

      {f.canal === 'varios' && f.mode === 'create' && (
        <section className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm">
          <SectionHead n="02" icon={PackagePlus} title={`${f.variosTipo || 'Varios'} — Datos manuales`} />
          <label className="field-label">Tipo *</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {VARIOS_TIPOS.map((t) => (<button key={t} type="button" onClick={() => set({ variosTipo: t })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${f.variosTipo === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}>{t}</button>))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="field-label">Cliente *</label><input className="field-input" value={f.variosCliente} onChange={(e) => set({ variosCliente: e.target.value })} /></div>
            <div><label className="field-label">Vendedor *</label><input className="field-input" value={f.variosVendedor} onChange={(e) => set({ variosVendedor: e.target.value })} /></div>
            <div><label className="field-label">División</label><input className="field-input" value={f.variosDivision} onChange={(e) => set({ variosDivision: e.target.value })} /></div>
            <div><label className="field-label">Centro Costo</label><input className="field-input" value={f.variosCcosto} onChange={(e) => set({ variosCcosto: e.target.value })} /></div>
          </div>
        </section>
      )}

      {f.mode !== 'idle' && (
        <>
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <SectionHead n={f.canal === 'varios' ? '03' : '02'} icon={Truck} title="Logística" />
            <label className="field-label">Estado *</label>
            <div className="relative mb-5" ref={estadoRef}>
              <button type="button" onClick={() => { setEstadoOpen((v) => !v); setEstadoQuery(''); }} className="field-input flex items-center justify-between text-left">
                <span className="inline-flex items-center gap-2.5 min-w-0"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorFor(f.estado) }} /><span className="text-slate-800 font-bold truncate">{f.estado || 'Seleccionar estado'}</span></span>
                <span className={`text-slate-300 text-xs transition-transform ${estadoOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {estadoOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                  <div className="p-2 border-b border-slate-100"><input autoFocus value={estadoQuery} onChange={(e) => setEstadoQuery(e.target.value)} placeholder="Buscar estado…" className="field-input py-2 text-sm" /></div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {estadoFiltered.map((c) => (<button key={c} type="button" onClick={() => { set({ estado: c }); setEstadoOpen(false); }} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm ${f.estado === c ? 'bg-orange-50' : 'hover:bg-slate-50'}`}><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorFor(c) }} /><span className={f.estado === c ? 'font-black text-slate-900' : 'text-slate-700'}>{c}</span></button>))}
                  </div>
                </div>
              )}
            </div>
            <button type="button" onClick={() => set({ urgente: !f.urgente })} className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-3.5 border-2 ${f.urgente ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}>
              <span className="flex items-center gap-2.5"><span className={`text-xl ${f.urgente ? 'scale-110' : 'opacity-40 grayscale'}`}>🚨</span><span className="flex flex-col items-start"><span className={`text-sm font-black ${f.urgente ? 'text-red-600' : 'text-slate-700'}`}>NV Urgente</span><span className="text-[11px] text-slate-400">Se destaca en el panel TV</span></span></span>
              <span className={`relative w-12 h-6 rounded-full shrink-0 ${f.urgente ? 'bg-red-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.urgente ? 'translate-x-6' : ''}`} /></span>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div><label className="field-label">Tipo Despacho</label><select value={f.tipoDespacho} onChange={(e) => set({ tipoDespacho: e.target.value })} className="field-input"><option value="">— Seleccionar —</option>{TIPOS_DESPACHO.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="field-label">Transportista</label><input className="field-input" value={f.transportista} onChange={(e) => set({ transportista: e.target.value })} /></div>
              <div><label className="field-label">Fecha Aprobación Real</label><input type="date" value={f.fechaAprobacionReal} onChange={(e) => set({ fechaAprobacionReal: e.target.value })} className="field-input" /></div>
              <div><label className="field-label">Fecha Facturación</label><input type="date" value={f.fechaFacturacion} onChange={(e) => set({ fechaFacturacion: e.target.value })} className="field-input" /></div>
              <div><label className="field-label">Fecha Despacho</label><input type="date" value={f.fechaDespacho} onChange={(e) => set({ fechaDespacho: e.target.value })} className="field-input" /></div>
            </div>
          </section>
          <details className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-slate-50/60"><span className="flex items-center gap-2.5"><span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center"><ClipboardList size={15} /></span><h2 className="text-[12px] font-black text-slate-600 uppercase tracking-wider">Datos adicionales <span className="text-slate-300 normal-case font-bold">· opcional</span></h2></span><span className="text-slate-300 text-xs transition-transform group-open:rotate-180">▼</span></summary>
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div><label className="field-label">Facturas</label><input className="field-input" value={f.factura} onChange={(e) => set({ factura: e.target.value })} /></div>
              <div><label className="field-label">Guía</label><input className="field-input" value={f.guia} onChange={(e) => set({ guia: e.target.value })} /></div>
              <div><label className="field-label">Bultos</label><input type="number" className="field-input" value={f.bultos} onChange={(e) => set({ bultos: e.target.value })} /></div>
              <div><label className="field-label">Valor Factura</label><input inputMode="numeric" className="field-input" value={f.valorFactura} onChange={(e) => set({ valorFactura: e.target.value.replace(/[^0-9.]/g, '') })} /></div>
              <div><label className="field-label">N° de Envío</label><input className="field-input" value={f.numeroEnvio} onChange={(e) => set({ numeroEnvio: e.target.value })} /></div>
            </div>
          </details>
        </>
      )}

      {f.mode !== 'idle' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Canal <b className="text-slate-600 uppercase">{f.canal}</b> · N° <b className="text-slate-600">{f.nv || '—'}</b></span>
            <button onClick={onGuardar} disabled={saving} className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{f.mode === 'update' ? 'Actualizar N.V.' : 'Crear N.V.'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pestaña Consolidados ────────────────────────────────────────────────────
function TabConsolidados() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nueva, setNueva] = useState({ fecha_comprometida: '', observacion: '', nvs: [] });
  const [nvInput, setNvInput] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const cargar = useCallback(() => { setLoading(true); listarConsolidados().then((r) => { setLista(r); setLoading(false); }).catch(() => setLoading(false)); }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const agregarNv = async () => {
    const t = nvInput.trim(); if (!t) return;
    setAddLoading(true);
    const r = await buscarNvBasico(t);
    setAddLoading(false);
    if (!r) return toast.error(`N.V. ${t} no encontrada`);
    if (nueva.nvs.some((x) => x.nv === r.nv && x.canal === r.canal)) return toast.error('Ya está en la lista');
    setNueva((p) => ({ ...p, nvs: [...p.nvs, r] }));
    setNvInput('');
  };
  const guardarCons = async () => {
    if (nueva.nvs.length === 0) return toast.error('Agrega al menos una N.V.');
    setSaving(true);
    const res = await guardarConsolidado({ ...nueva, created_by: user?.nombre || null });
    setSaving(false);
    if (res.ok) { toast.success(`Consolidado ${res.ticket} creado`); setNueva({ fecha_comprometida: '', observacion: '', nvs: [] }); cargar(); }
    else toast.error(res.error || 'No se pudo guardar');
  };
  const borrar = async (c) => {
    if (!window.confirm(`¿Eliminar el consolidado ${c.ticket}?`)) return;
    const res = await eliminarConsolidado(c.id);
    if (res.ok) { toast.success('Consolidado eliminado'); cargar(); } else toast.error(res.error || 'Error');
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionHead n="01" icon={Layers} title="Nuevo consolidado" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3">
          <div><label className="field-label">Fecha comprometida</label><input type="date" className="field-input" value={nueva.fecha_comprometida} onChange={(e) => setNueva((p) => ({ ...p, fecha_comprometida: e.target.value }))} /></div>
          <div><label className="field-label">Observación</label><input className="field-input" value={nueva.observacion} onChange={(e) => setNueva((p) => ({ ...p, observacion: e.target.value }))} /></div>
        </div>
        <label className="field-label">Agregar N.V.</label>
        <div className="flex gap-2">
          <input value={nvInput} onChange={(e) => setNvInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && agregarNv()} placeholder="N° de N.V." className="field-input" />
          <button onClick={agregarNv} disabled={addLoading} className="px-4 rounded-xl bg-slate-900 text-white text-sm font-black flex items-center gap-1.5 disabled:opacity-40">{addLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}</button>
        </div>
        {nueva.nvs.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {nueva.nvs.map((n) => (
              <div key={`${n.canal}:${n.nv}`} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 text-sm">
                <span className="font-bold text-slate-700">{n.nv}</span><span className="text-[11px] uppercase text-slate-400">{n.canal}</span>
                <span className="text-slate-500 truncate flex-1">{n.cliente || '—'}</span>
                <button onClick={() => setNueva((p) => ({ ...p, nvs: p.nvs.filter((x) => !(x.nv === n.nv && x.canal === n.canal)) }))} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
        <button onClick={guardarCons} disabled={saving} className="mt-4 w-full px-5 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Crear consolidado</button>
      </section>

      <section>
        <h3 className="text-sm font-black text-slate-600 mb-2">Consolidados ({lista.length})</h3>
        {loading ? <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={24} /></div>
          : lista.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">Sin consolidados.</p>
          : (
            <div className="space-y-2">
              {lista.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="font-black text-slate-800">{c.ticket}</span><span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">{c.estado}</span>{c.fecha_comprometida && <span className="text-xs text-slate-400">📅 {c.fecha_comprometida}</span>}</div>
                    <button onClick={() => borrar(c)} className="text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                  {c.observacion && <p className="text-xs text-slate-500 mt-1">{c.observacion}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">{c.nvs.map((n) => <span key={n.id} className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">{n.nv}</span>)}</div>
                </div>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}

// ── Módulo ───────────────────────────────────────────────────────────────────
export default function PanelIngresar() {
  const { hasPermission } = useAuth();
  const puedeEscribir = hasPermission('manage_panel');
  const [tab, setTab] = useState('buscar');
  const TABS = [
    { v: 'buscar', label: 'Buscar' },
    { v: 'ingresar', label: 'Ingresar' },
    ...(puedeEscribir ? [{ v: 'consolidados', label: 'Consolidados' }] : []),
  ];

  return (
    <div className="anim-fade-up space-y-4">
      <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={`px-4 py-1.5 rounded-xl text-sm font-black transition-colors ${tab === t.v ? 'bg-white text-orange-600 shadow' : 'text-slate-500 hover:text-orange-600'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'buscar' && <TabBuscar puedeEscribir={puedeEscribir} />}
      {tab === 'ingresar' && <TabIngresar />}
      {tab === 'consolidados' && puedeEscribir && <TabConsolidados />}
    </div>
  );
}
