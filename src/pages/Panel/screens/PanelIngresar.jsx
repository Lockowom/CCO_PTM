import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Save, Search, Loader2, Hash, Truck, ClipboardList, Sparkles, PackagePlus,
  Trash2, X, Plus, Layers, AlertTriangle, UploadCloud, FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import PanelModal from '../PanelModal';
import {
  CANALES, VARIOS_TIPOS, ESTADOS_SELECCIONABLES, ESTADOS_ACTIVOS, TIPOS_DESPACHO, ACCENT, colorFor,
  listaActivas, buscarOperaciones, opciones, lookup, guardar, eliminar,
  listarConsolidados, guardarConsolidado, eliminarConsolidado, buscarNvBasico,
  exportarOperaciones,
} from '../ingresar/ingresarService';
import { fetchVendedores } from '../config/configService';
import { exportToExcel } from '../../../lib/exportExcel';
import FormNV from '../ingresar/components/FormNV';
import PillNavEstado from '../ingresar/components/PillNavEstado';
import Toast from '../ingresar/components/Toast';
import Consolidados from '../ingresar/components/Consolidados';
import { useFormNVStore } from '../ingresar/store/useFormNVStore';
import '../ingresar/components/PillNavCanal.css';

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
function DetalleDrawer({ item, puedeEscribir, puedeEliminar, opts, onClose, onSaved, onDeleted }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState({});          // valores editados
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let on = true; setLoading(true);
    lookup(item.canal, item.nv).then((r) => { if (!on) return; setData(r.found ? r.data : null); setLoading(false); });
    return () => { on = false; };
  }, [item]);

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
    <div className="panel-portal fixed inset-0 z-[120] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
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
              {/* ── SOLO LECTURA: datos comerciales de la N.V. ── */}
              <section>
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Información</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[{ l: 'Cliente', v: data.cliente }, { l: 'Vendedor', v: data.vendedor }, { l: 'C. Costo', v: data.ccosto || data.centro_costo }, { l: 'División', v: data.division }].filter((x) => x.v).map((x) => (
                    <div key={x.l} className="bg-gray-50 rounded-lg px-3 py-2"><div className="text-[9px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">{x.l}</div><div className="text-[13px] text-gray-800 font-medium truncate" title={x.v || ''}>{x.v}</div></div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Progreso</h3>
                <div className="bg-gray-50 rounded-xl p-3"><Stepper data={data} /></div>
              </section>

              {!puedeEscribir ? (
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3">Solo lectura · necesitas el permiso <b>manage_panel</b> para editar.</div>
              ) : (
                <>
                  <section>
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Estado y Logística</h3>
                    <label className="field-label">Estado</label>
                    <div className="mb-3">
                      <PillNavEstado
                        items={ESTADOS_SELECCIONABLES.map((c) => ({ value: c, label: c, color: colorFor(c) }))}
                        active={detailVal('estado')}
                        onSelect={(c) => setDetailField('estado', c)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="field-label">Tipo Despacho</label><select value={detailVal('tipo_despacho')} onChange={(e) => setDetailField('tipo_despacho', e.target.value)} className="field-input"><option value="">—</option>{(opts?.tiposDespacho || TIPOS_DESPACHO).map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
                      <div><label className="field-label">Transportista</label>{transportistasOpts.length > 0 ? (<select value={detailVal('transportista')} onChange={(e) => setDetailField('transportista', e.target.value)} className="field-input"><option value="">—</option>{(detailVal('transportista') && !transportistasOpts.includes(detailVal('transportista')) ? [detailVal('transportista'), ...transportistasOpts] : transportistasOpts).map((t) => <option key={t} value={t}>{t}</option>)}</select>) : (<input type="text" value={detailVal('transportista')} onChange={(e) => setDetailField('transportista', e.target.value)} className="field-input" />)}</div>
                    </div>
                    <div className="flex items-center justify-between mt-3 px-1">
                      <div className="flex items-center gap-2"><span className="text-red-500 text-sm">🚨</span><span className="text-[13px] font-medium text-gray-700">Marcar como Urgente</span></div>
                      <button type="button" onClick={() => setDetailField('urgente', esUrgente ? 'false' : 'true')} className={`relative w-11 h-6 rounded-full transition-colors ${esUrgente ? 'bg-red-500' : 'bg-gray-200'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${esUrgente ? 'translate-x-5' : ''}`} /></button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Fechas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="field-label">F. Aprobación Real <span className="normal-case font-semibold text-gray-400">(no editable)</span></label><input type="date" value={detailVal('fecha_aprobacion_real')} readOnly className="field-input bg-gray-50 text-gray-500 cursor-not-allowed" /></div>
                      <div><label className="field-label">F. Compromiso <span className="normal-case font-semibold" style={{ color: detailVal('fecha_compromiso') ? ACCENT : '#9ca3af' }}>(auto)</span></label><input type="date" value={detailVal('fecha_compromiso')} readOnly className="field-input bg-gray-50 text-gray-500 cursor-not-allowed" /></div>
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

        {data && (puedeEscribir || puedeEliminar) && (
          <div className="shrink-0 bg-white border-t border-gray-200 p-4 space-y-2">
            {puedeEscribir && Object.keys(dirty).length > 0 && (
              <button onClick={onGuardar} disabled={saving} className="w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: ACCENT }}>
                {saving ? <span className="inline-flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando…</span> : `Guardar ${Object.keys(dirty).length} cambio${Object.keys(dirty).length !== 1 ? 's' : ''}`}
              </button>
            )}
            {/* Eliminar N.V. — solo administradores y personal habilitado (Angélica). */}
            {puedeEliminar && (!delConfirm ? (
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
            ))}
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
function TabBuscar({ puedeEscribir, puedeEliminar }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todos');
  const [q, setQ] = useState('');
  const [remoto, setRemoto] = useState(null);   // resultados de búsqueda en TODA la tabla
  const [buscando, setBuscando] = useState(false);
  const [sel, setSel] = useState(null);
  const [opts, setOpts] = useState(null);
  const [exportando, setExportando] = useState(false);

  const cargar = useCallback(() => {
    setLoading(true);
    listaActivas().then((rows) => { setLista(rows); setLoading(false); }).catch(() => { setLista([]); setLoading(false); });
  }, []);
  useEffect(() => { cargar(); opciones().then(setOpts).catch(() => {}); }, [cargar]);

  // Búsqueda contra TODA la tabla (incluye Entregado/NULA/etc.): la lista base
  // solo trae activas, así que sin esto una N.V. entregada no se puede encontrar.
  const enBusqueda = q.trim().length >= 2;
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setRemoto(null); setBuscando(false); return; }
    setBuscando(true);
    const h = setTimeout(() => {
      buscarOperaciones(term).then((rows) => setRemoto(rows)).catch(() => setRemoto([])).finally(() => setBuscando(false));
    }, 350);
    return () => clearTimeout(h);
  }, [q]);

  // Descarga TODA la tabla de operaciones (todas las columnas y datos) a Excel.
  const onExportar = useCallback(async () => {
    setExportando(true);
    try {
      const rows = await exportarOperaciones();
      if (!rows.length) { toast.warning('No hay operaciones para exportar.'); return; }
      exportToExcel({ filename: 'Operaciones_NV', sheets: [{ name: 'Notas de Venta', rows }] });
      toast.success(`Exportadas ${rows.length} N.V. a Excel`);
    } catch (e) {
      toast.error('No se pudo exportar: ' + (e?.message || 'error'));
    } finally {
      setExportando(false);
    }
  }, []);

  // En búsqueda: se muestran los resultados de TODA la tabla (cualquier estado),
  // sin aplicar el filtro de pills (que es solo de estados activos). Sin término:
  // la lista de activas con su filtro por estado.
  const filtrada = useMemo(() => {
    if (enBusqueda) return remoto || [];
    return lista.filter((r) => filtro === 'Todos' || r.estado === filtro);
  }, [enBusqueda, remoto, lista, filtro]);
  const conteo = useMemo(() => { const m = {}; lista.forEach((r) => { m[r.estado] = (m[r.estado] || 0) + 1; }); return m; }, [lista]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por NV, cliente, guía o factura (cualquier estado)…" className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none bg-white" />
        {buscando && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin" />}
      </div>
      {!enBusqueda && (() => {
        const items = ESTADOS_ACTIVOS.filter((e) => (conteo[e] || 0) > 0)
          .map((e) => ({ value: e, label: e, color: colorFor(e), count: conteo[e] || 0 }));
        if (items.length === 0) return null;
        return (
          <PillNavEstado
            items={items}
            active={filtro}
            inline
            onSelect={(e) => setFiltro(filtro === e ? 'Todos' : e)}
          />
        );
      })()}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[12px] text-gray-400">
          {enBusqueda
            ? `${filtrada.length} resultado${filtrada.length !== 1 ? 's' : ''} · búsqueda en todos los estados`
            : `${filtrada.length} resultados de ${lista.length} activas`}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={onExportar} disabled={exportando}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition-colors"
            title="Descargar TODAS las N.V. (todas las columnas) a Excel">
            {exportando ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            {exportando ? 'Exportando…' : 'Exportar Excel'}
          </button>
          <button onClick={cargar} className="inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-orange-600 font-medium">↻ Recargar</button>
        </div>
      </div>

      {(loading && !enBusqueda) || (buscando && !remoto) ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={30} /></div>
      ) : filtrada.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">{enBusqueda ? 'Sin N.V. que coincidan con la búsqueda.' : 'Sin N.V. activas para este filtro.'}</div>
      ) : (
        <div className="space-y-2">
          {filtrada.map((r) => <NvRow key={r.key} i={r} onOpen={setSel} />)}
        </div>
      )}

      {sel && (
        <DetalleDrawer item={sel} puedeEscribir={puedeEscribir} puedeEliminar={puedeEliminar} opts={opts}
          onClose={() => setSel(null)}
          onSaved={(upd) => { setLista((ls) => ls.map((x) => (x.key === upd.key ? { ...x, ...upd } : x))); setRemoto((rs) => rs && rs.map((x) => (x.key === upd.key ? { ...x, ...upd } : x))); }}
          onDeleted={(del) => { setLista((ls) => ls.filter((x) => x.key !== del.key)); setRemoto((rs) => rs && rs.filter((x) => x.key !== del.key)); }} />
      )}
    </div>
  );
}

// ── Aviso emergente: N.V. sin cliente en el catálogo (canales reales) ────────
// El supervisor NO puede crear a ciegas: si la N.V. no está en el catálogo, se
// le pide actualizar la carga (Carga Masiva N.V PTM / ORANGE / FARMAPACK) para
// que los datos de cliente/vendedor/centro de costo sean los correctos.
function ClienteNoEncontradoModal({ canal, nv, onClose }) {
  const navigate = useNavigate();
  const canalLabel = (CANALES.find((c) => c.value === canal)?.label || canal || '').toUpperCase();
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden anim-fade-up">
        <div className="px-6 pt-6 pb-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={26} />
          </div>
          <h3 className="text-[16px] font-black text-gray-900">Cliente no encontrado</h3>
          <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">
            La N.V. <strong className="text-gray-700">{nv}</strong> del canal <strong className="text-gray-700">{canalLabel}</strong> no
            está en el catálogo, por lo que no se pueden traer sus datos de cliente/vendedor/centro de costo.
          </p>
          <p className="mt-3 text-[13px] font-semibold text-gray-700 leading-relaxed">
            Realiza la actualización de la carga de N.V. para poder continuar.
          </p>
        </div>
        <div className="px-5 pb-5 flex flex-col gap-2">
          <button onClick={() => navigate('/inbound/data-import')}
            className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{ background: ACCENT }}>
            <UploadCloud size={16} /> Ir a Carga Masiva
          </button>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Pestaña Ingresar (FormNV + store, port fiel del original) ────────────────
function TabIngresar() {
  const s = useFormNVStore();
  const [opts, setOpts] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [aviso, setAviso] = useState(null);   // { canal, nv } → modal "cliente no encontrado"
  useEffect(() => { opciones().then(setOpts).catch(() => {}); }, []);
  // Catálogo de vendedores (CENTRO COSTOS) para la lista emergente de Varios:
  // al elegir un vendedor se auto-rellenan división + centro de costo.
  useEffect(() => { fetchVendedores().then(setVendedores).catch(() => setVendedores([])); }, []);
  useEffect(() => {
    if (!toastMsg) return undefined;
    const t = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const handleLookup = async () => {
    const nv = String(s.nv || '').trim(); if (!nv) return;
    s.patch({ lookupLoading: true, submitResult: null, errors: [] });
    const r = await lookup(s.canal, nv);
    if (r.found) {
      s.patch({ lookupResult: { found: true, row: r.row, data: r.data } });
      s.applyFound(r.data);
    } else if (s.canal !== 'varios' && !r.autoFill?.cliente) {
      // Canal real sin cliente en el catálogo → NO se crea a ciegas: avisar y
      // pedir actualizar la carga de N.V. (queda en idle hasta que se cargue).
      s.patch({ lookupLoading: false, lookupResult: null, mode: 'idle' });
      setAviso({ canal: s.canal, nv });
      return;
    } else {
      s.patch({ lookupResult: { found: false, autoFill: r.autoFill } });
      s.applyNew(r.autoFill || {});
    }
    s.patch({ lookupLoading: false });
  };

  const handleSubmit = async () => {
    const st = useFormNVStore.getState();
    if (st.mode === 'idle') return;
    if (!st.estado) { st.patch({ submitResult: { success: false, message: 'Falta el Estado' } }); return; }
    st.patch({ submitting: true, submitResult: null });
    // Datos comerciales precisos (del catálogo NV o de la operación encontrada).
    const af = st.lookupResult?.found ? st.lookupResult.data : st.lookupResult?.autoFill;
    const payload = {
      id: st.mode === 'update' ? st.lookupResult?.row : null, mode: st.mode, canal: st.canal, nv: st.nv,
      cliente: af?.cliente || '', vendedor: af?.vendedor || '', division: af?.division || '', centro_costo: af?.ccosto || af?.centro_costo || '',
      estado: st.estado, urgente: st.urgente, tipoDespacho: st.tipoDespacho, transportista: st.transportista,
      fechaCompromiso: st.fechaCompromiso, fechaAprobacion: st.fechaAprobacion, fechaAprobacionReal: st.fechaAprobacionReal,
      fechaFacturacion: st.fechaFacturacion, fechaDespacho: st.fechaDespacho, factura: st.factura, guia: st.guia,
      bultos: st.bultos, valorFactura: st.valorFactura, numeroEnvio: st.numeroEnvio,
      variosTipo: st.variosTipo, variosCliente: st.variosCliente, variosVendedor: st.variosVendedor,
      variosDivision: st.variosDivision, variosCcosto: st.variosCcosto,
    };
    const res = await guardar(payload);
    useFormNVStore.getState().patch({ submitting: false });
    if (res.ok) {
      setToastMsg({ type: 'success', message: `NV ${payload.nv} ${payload.mode === 'update' ? 'actualizada' : 'creada'}` });
      useFormNVStore.getState().reset();
    } else {
      useFormNVStore.getState().patch({ submitResult: { success: false, message: res.error || 'No se pudo guardar' } });
      setToastMsg({ type: 'error', message: res.error || 'No se pudo guardar' });
    }
  };

  return (
    <div className="pb-24">
      <FormNV options={opts} transportistasOpts={opts?.transportistas || []} vendedoresMaestro={vendedores} onLookup={handleLookup} />
      {aviso && <ClienteNoEncontradoModal canal={aviso.canal} nv={aviso.nv} onClose={() => setAviso(null)} />}
      {s.mode !== 'idle' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Canal <b className="text-slate-600 uppercase">{s.canal}</b> · N° <b className="text-slate-600">{s.nv || '—'}</b></span>
            <button onClick={handleSubmit} disabled={s.submitting}
              className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
              {s.submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {s.mode === 'update' ? 'Actualizar N.V.' : 'Crear N.V.'}
            </button>
          </div>
        </div>
      )}
      <Toast toast={toastMsg} />
    </div>
  );
}

// ── Pestaña Consolidados (componente portado) ───────────────────────────────
function TabConsolidados() {
  const { user } = useAuth();
  return <Consolidados operador={user?.nombre || ''} />;
}

// ── Módulo ───────────────────────────────────────────────────────────────────
// Solo administradores y personal explícitamente habilitado pueden ELIMINAR
// N.V. (borrado destructivo). El resto de escrituras usa manage_panel. Debe
// coincidir con el gate de BD `_panel_puede_eliminar_nv()` (migración 099).
const EMAILS_ELIMINAR_NV = ['angelica@ptm.cl'];
function puedeEliminarNV(user) {
  if (!user) return false;
  return user.rol === 'ADMIN' || user.es_admin_delegado === true
    || EMAILS_ELIMINAR_NV.includes((user.email || '').trim().toLowerCase());
}

export default function PanelIngresar() {
  const { hasPermission, user } = useAuth();
  const puedeEscribir = hasPermission('manage_panel');
  const puedeEliminar = puedeEliminarNV(user);
  const [tab, setTab] = useState('buscar');
  const TABS = [
    {
      v: 'buscar',
      label: 'Buscar',
      hint: 'Seguimiento y consulta',
      icon: Search,
      accent: '#2563eb',
    },
    {
      v: 'ingresar',
      label: 'Ingresar',
      hint: 'Registro operativo',
      icon: Sparkles,
      accent: ACCENT,
    },
    ...(puedeEscribir ? [{
      v: 'consolidados',
      label: 'Consolidados',
      hint: 'Agrupación comercial',
      icon: Layers,
      accent: '#0f766e',
    }] : []),
  ];

  return (
    <div className="anim-fade-up space-y-4">
      <div className="w-full max-w-3xl rounded-[1.6rem] border border-slate-200/90 bg-white/95 p-3 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.22)]">
        <div className="mb-3 px-1 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Vista operativa</div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Selecciona el flujo que quieres trabajar dentro del panel.</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-[1.35rem] bg-slate-50/75 p-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.v;
            return (
              <button
                key={t.v}
                type="button"
                onClick={() => setTab(t.v)}
                className={`group relative overflow-hidden rounded-[1.15rem] border px-4 py-3.5 text-left transition-all duration-200 ${
                  active
                    ? 'bg-white text-slate-700 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]'
                    : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/80'
                }`}
                style={active ? { borderColor: `${t.accent}26` } : undefined}
                aria-pressed={active}
              >
                {active && (
                  <div className="absolute inset-x-4 top-0 h-[2px] rounded-full" style={{ background: t.accent }} />
                )}
                <div
                  className={`absolute inset-0 pointer-events-none transition-opacity ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ background: `radial-gradient(circle at top right, ${t.accent}14, transparent 42%)` }}
                />
                <div className="relative flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                      active ? 'bg-white' : 'border-slate-200 bg-white/90 text-slate-500'
                    }`}
                    style={active ? { borderColor: `${t.accent}26`, color: t.accent, background: `${t.accent}10` } : undefined}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className={`text-sm font-black tracking-tight ${active ? 'text-slate-900' : 'text-slate-800'}`}>{t.label}</div>
                      {active && (
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                          style={{ background: `${t.accent}12`, color: t.accent }}
                        >
                          Activo
                        </span>
                      )}
                    </div>
                    <div className={`mt-1 text-[12px] leading-5 ${active ? 'text-slate-500' : 'text-slate-400'}`}>{t.hint}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {tab === 'buscar' && <TabBuscar puedeEscribir={puedeEscribir} puedeEliminar={puedeEliminar} />}
      {tab === 'ingresar' && <TabIngresar />}
      {tab === 'consolidados' && puedeEscribir && <TabConsolidados />}
    </div>
  );
}
