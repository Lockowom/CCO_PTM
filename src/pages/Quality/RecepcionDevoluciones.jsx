import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DEVOLUCIONES_INBOUND_PATH,
  DEVOLUCIONES_QUALITY_PATH
} from '../../config/devolucionesRouting';
import {
  ArrowRight,
  BadgeCheck,
  Box,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileSearch,
  Link2,
  Loader2,
  PackageOpen,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  UserRound,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import {
  DEVOLUCION_ESTADOS,
  buscarReferenciaDevolucion,
  estadoDevolucionLabel,
  folioDevolucion,
  useClientesConsignacion,
  useDevoluciones,
  useDevolucionesPendientesCalidad,
  useDictaminarItemConforme,
  useHistorialDevolucion,
  useRegistrarDevolucion
} from '../../services/devolucionesService';

const EMPTY_ITEM = {
  codigo_producto: '',
  descripcion: '',
  serie: '',
  lote: '',
  cantidad: 1,
  detalle: '',
  requiere_calidad: ''
};

const STATUS_CLASS = {
  RECIBIDA: 'border-sky-200 bg-sky-50 text-sky-700',
  EN_INSPECCION: 'border-amber-200 bg-amber-50 text-amber-700',
  CONFORME: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  NO_CONFORME: 'border-rose-200 bg-rose-50 text-rose-700',
  DERIVADA_POSTVENTA: 'border-violet-200 bg-violet-50 text-violet-700',
  CERRADA: 'border-slate-200 bg-slate-100 text-slate-600'
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';

function Stat({ label, value, tone = 'slate', icon: Icon }) {
  const cls = {
    slate: 'bg-slate-50 text-slate-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700'
  }[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${cls}`}>
          <Icon size={19} />
        </span>
      </div>
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.14em] text-slate-500">
        {label} {required && <b className="text-rose-500">*</b>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-slate-400">{hint}</span>}
    </label>
  );
}

const inputClass =
  'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50';

function Modal({
  title,
  subtitle,
  icon: Icon = PackageOpen,
  onClose,
  children,
  wide = false,
  busy = false
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[96dvh] w-full overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:rounded-[1.75rem] ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}
      >
        <header className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Icon size={21} />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-white hover:text-slate-700"
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
          >
            <X size={19} />
          </button>
        </header>
        <div className="max-h-[calc(96dvh-5rem)] overflow-y-auto p-4 sm:p-6">{children}</div>
      </section>
    </div>
  );
}

function NewReturnModal({ onClose }) {
  const { data: consignaciones = [] } = useClientesConsignacion();
  const registrar = useRegistrarDevolucion();
  const [mode, setMode] = useState('ASOCIADA');
  const [term, setTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    consignacion_cliente_id: '',
    nv: '',
    guia: '',
    factura: '',
    cliente: '',
    contacto: '',
    telefono: '',
    email: '',
    motivo: '',
    observaciones_recepcion: ''
  });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const submitting = useRef(false);
  const [submitError, setSubmitError] = useState('');

  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const search = async () => {
    if (term.trim().length < 2) return toast.info('Escribe al menos 2 caracteres');
    setSearching(true);
    try {
      const data = await buscarReferenciaDevolucion(term);
      setMatches(data);
      if (!data.length)
        toast.info('No se encontró una N.V., guía o factura. Puedes usar registro manual.');
    } catch (error) {
      toast.error(error.message || 'No se pudo buscar la referencia');
    } finally {
      setSearching(false);
    }
  };

  const selectReference = (row) => {
    setSelected(row);
    setMatches([]);
    setForm((current) => ({
      ...current,
      nv: row.nv || '',
      guia: row.guia || '',
      factura: row.factura || '',
      cliente: row.cliente || ''
    }));
  };

  const setItem = (index, key, value) =>
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );

  const submit = async () => {
    if (submitting.current || submitError) return;
    if (mode === 'ASOCIADA' && !selected) return toast.error('Selecciona la N.V., guía o factura');
    if (mode !== 'ASOCIADA' && form.cliente.trim().length < 2)
      return toast.error('Indica el cliente');
    if (form.motivo.trim().length < 3) return toast.error('Indica el motivo de la devolución');
    if (items.some((item) => !item.codigo_producto.trim() && !item.descripcion.trim())) {
      return toast.error('Cada producto necesita código o descripción');
    }
    if (items.some((item) => !Number.isFinite(Number(item.cantidad)) || Number(item.cantidad) <= 0))
      return toast.error('La cantidad debe ser mayor que cero');
    if (items.length > 200) return toast.error('Máximo 200 productos por devolución');
    if (mode === 'CONSIGNACION' && !form.consignacion_cliente_id)
      return toast.error('Selecciona un cliente de consignación');
    submitting.current = true;
    try {
      const normalizedReference = term.trim().toLowerCase();
      const referenceType =
        mode !== 'ASOCIADA'
          ? 'MANUAL'
          : String(selected?.guia || '')
                .trim()
                .toLowerCase() === normalizedReference
            ? 'GUIA'
            : String(selected?.factura || '')
                  .trim()
                  .toLowerCase() === normalizedReference
              ? 'FACTURA'
              : 'NV';
      const result = await registrar.mutateAsync({
        ...form,
        origen: mode,
        referencia_tipo: referenceType,
        operacion_id: selected?.operacion_id || null,
        consignacion_cliente_id: mode === 'CONSIGNACION' ? form.consignacion_cliente_id : null,
        items: items.map(({ requiere_calidad, ...item }) => ({
          ...item,
          cantidad: Number(item.cantidad),
          ...(requiere_calidad === '' ? {} : { requiere_calidad })
        }))
      });
      toast.success(
        items.some((item) => item.requiere_calidad === true)
          ? `${result.folio} registrada; ítems pendientes de Calidad`
          : `${result.folio} registrada`
      );
      onClose();
    } catch (error) {
      setSubmitError(error.message || 'No se pudo confirmar el registro');
      toast.error(error.message || 'No se pudo registrar la devolución');
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Modal
      title="Nueva recepción de devolución"
      subtitle="Asocia documentos existentes o registra una devolución externa"
      onClose={onClose}
      busy={registrar.isPending}
      wide
    >
      <div className="grid gap-2 rounded-2xl bg-slate-100 p-1 sm:grid-cols-3">
        {[
          ['ASOCIADA', 'N.V. / guía / factura', Link2],
          ['CONSIGNACION', 'Cliente consignación', UserRound],
          ['MANUAL', 'Registro manual', FileSearch]
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setSelected(null);
            }}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition ${mode === id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {mode === 'ASOCIADA' && (
        <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
          <Field label="Buscar referencia" required hint="Busca por N.V., guía, factura o cliente.">
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && search()}
                placeholder="Ej. 94994, guía, factura…"
              />
              <button
                type="button"
                onClick={search}
                disabled={searching}
                className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white disabled:opacity-50"
              >
                {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}{' '}
                Buscar
              </button>
            </div>
          </Field>
          {matches.length > 0 && (
            <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5">
              {matches.map((row) => (
                <button
                  key={row.operacion_id}
                  type="button"
                  onClick={() => selectReference(row)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left hover:bg-sky-50"
                >
                  <span className="min-w-0">
                    <b className="block text-sm text-slate-900">
                      N.V. {row.nv || '—'} · {row.cliente}
                    </b>
                    <span className="block truncate text-xs text-slate-500">
                      Guía {row.guia || '—'} · Factura {row.factura || '—'} ·{' '}
                      {row.estado || 'Sin estado'}
                    </span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-sky-500" />
                </button>
              ))}
            </div>
          )}
          {selected && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <BadgeCheck size={19} />
              <div>
                <b>N.V. {selected.nv || '—'} asociada</b>
                <div className="text-xs">
                  {selected.cliente} · Guía {selected.guia || '—'} · Factura{' '}
                  {selected.factura || '—'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'CONSIGNACION' && (
        <div className="mt-5">
          <Field
            label="Cliente con consignación"
            required
            hint="Catálogo administrado desde Carga Masiva → Maestros."
          >
            <select
              className={inputClass}
              value={form.consignacion_cliente_id}
              onChange={(event) => {
                const id = event.target.value;
                const client = consignaciones.find((item) => item.id === id);
                setForm((current) => ({
                  ...current,
                  consignacion_cliente_id: id,
                  cliente: client?.nombre || '',
                  contacto: client?.contacto || '',
                  telefono: client?.telefono || '',
                  email: client?.email || ''
                }));
              }}
            >
              <option value="">Seleccionar cliente…</option>
              {consignaciones.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.codigo_cliente} · {client.nombre}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {mode !== 'ASOCIADA' && (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Cliente" required>
            <input
              className={inputClass}
              value={form.cliente}
              onChange={(e) => patch('cliente', e.target.value)}
              disabled={mode === 'CONSIGNACION' && Boolean(form.consignacion_cliente_id)}
            />
          </Field>
          <Field label="N.V. (opcional)">
            <input
              className={inputClass}
              value={form.nv}
              onChange={(e) => patch('nv', e.target.value)}
            />
          </Field>
          <Field label="Guía / factura">
            <div className="flex gap-2">
              <input
                className={inputClass}
                placeholder="Guía"
                value={form.guia}
                onChange={(e) => patch('guia', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Factura"
                value={form.factura}
                onChange={(e) => patch('factura', e.target.value)}
              />
            </div>
          </Field>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Motivo de devolución" required>
          <textarea
            className={`${inputClass} min-h-24 py-3`}
            value={form.motivo}
            onChange={(e) => patch('motivo', e.target.value)}
            placeholder="Qué se devuelve y por qué…"
          />
        </Field>
        <Field label="Observaciones de recepción">
          <textarea
            className={`${inputClass} min-h-24 py-3`}
            value={form.observaciones_recepcion}
            onChange={(e) => patch('observaciones_recepcion', e.target.value)}
            placeholder="Estado del embalaje, documentos, contacto…"
          />
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900">Productos recibidos</h3>
          <p className="text-xs text-slate-400">
            Los productos marcados para revisión aparecerán en la bandeja de Calidad.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setItems((current) => [...current, { ...EMPTY_ITEM }])}
          disabled={items.length >= 200 || registrar.isPending}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-xs font-black text-emerald-700 hover:bg-emerald-100"
        >
          <Plus size={15} /> Producto
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr_.65fr_1fr_1fr_auto]">
              <Field label="SKU">
                <input
                  className={inputClass}
                  value={item.codigo_producto}
                  onChange={(e) => setItem(index, 'codigo_producto', e.target.value)}
                />
              </Field>
              <Field label="Descripción">
                <input
                  className={inputClass}
                  value={item.descripcion}
                  onChange={(e) => setItem(index, 'descripcion', e.target.value)}
                />
              </Field>
              <Field label="Cantidad">
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  className={inputClass}
                  value={item.cantidad}
                  onChange={(e) => setItem(index, 'cantidad', e.target.value)}
                />
              </Field>
              <Field label="Serie">
                <input
                  className={inputClass}
                  value={item.serie}
                  onChange={(e) => setItem(index, 'serie', e.target.value)}
                />
              </Field>
              <Field label="Lote">
                <input
                  className={inputClass}
                  value={item.lote}
                  onChange={(e) => setItem(index, 'lote', e.target.value)}
                />
              </Field>
              <button
                type="button"
                disabled={items.length === 1}
                onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                className="mt-5 grid h-11 w-11 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                aria-label="Quitar producto"
              >
                <Trash2 size={17} />
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Requiere revisión de Calidad">
                <select
                  className={inputClass}
                  value={item.requiere_calidad === '' ? '' : String(item.requiere_calidad)}
                  onChange={(e) =>
                    setItem(
                      index,
                      'requiere_calidad',
                      e.target.value === '' ? '' : e.target.value === 'true'
                    )
                  }
                >
                  <option value="">Sin definir</option>
                  <option value="true">Sí, requiere Calidad</option>
                  <option value="false">No requiere Calidad</option>
                </select>
              </Field>
              <Field label="Detalle del producto">
                <textarea
                  className={inputClass}
                  value={item.detalle}
                  onChange={(e) => setItem(index, 'detalle', e.target.value)}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      {submitError && (
        <p role="alert" className="mt-4 text-sm text-rose-700">
          {submitError}. Cierra y actualiza los registros para comprobar el resultado antes de
          volver a registrar.
        </p>
      )}

      <div className="sticky -bottom-6 mt-6 flex items-center justify-end gap-2 border-t border-slate-100 bg-white/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={onClose}
          disabled={registrar.isPending}
          className="min-h-11 rounded-xl border border-slate-200 px-5 text-xs font-black text-slate-600"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={registrar.isPending || Boolean(submitError)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-black text-white shadow-lg shadow-emerald-200 disabled:opacity-50"
        >
          {registrar.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <PackageOpen size={16} />
          )}{' '}
          Registrar recepción
        </button>
      </div>
    </Modal>
  );
}

function InspectItemModal({ item, onClose }) {
  const dictaminar = useDictaminarItemConforme();
  const [detalle, setDetalle] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const submit = async () => {
    if (submitting.current || !confirmed || error) return;
    if (detalle.trim().replace(/\s+/g, ' ').length < 3)
      return toast.error('Describe el dictamen oficial');
    submitting.current = true;
    try {
      const result = await dictaminar.mutateAsync({
        itemId: item.devolucion_item_id,
        detalle
      });
      toast.success(
        `Ítem conforme. Estado de la devolución: ${estadoDevolucionLabel(result.estado)}`
      );
      onClose();
    } catch (failure) {
      setError(failure.message || 'No se pudo confirmar el dictamen');
    } finally {
      submitting.current = false;
    }
  };
  return (
    <Modal
      title={`Revisar ítem · ${item.folio}`}
      subtitle={item.cliente}
      icon={ClipboardCheck}
      onClose={onClose}
      busy={dictaminar.isPending}
    >
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt>SKU</dt>
          <dd>{item.codigo_producto || 'Sin SKU'}</dd>
        </div>
        <div>
          <dt>Descripción</dt>
          <dd>{item.descripcion || '—'}</dd>
        </div>
        <div>
          <dt>Cantidad</dt>
          <dd>{Number(item.cantidad)}</dd>
        </div>
        <div>
          <dt>Fecha de recepción</dt>
          <dd>{formatDate(item.recibido_en)}</dd>
        </div>
        <div>
          <dt>Lote</dt>
          <dd>{item.lote || '—'}</dd>
        </div>
        <div>
          <dt>Serie</dt>
          <dd>{item.serie || '—'}</dd>
        </div>
        <div>
          <dt>N.V. / Guía / Factura</dt>
          <dd>
            {item.nv || '—'} / {item.guia || '—'} / {item.factura || '—'}
          </dd>
        </div>
        <div>
          <dt>Detalle recibido</dt>
          <dd className="whitespace-pre-wrap">{item.detalle || 'Sin detalle'}</dd>
        </div>
      </dl>
      <details className="my-4">
        <summary>Evidencia registrada</summary>
        <pre className="overflow-auto whitespace-pre-wrap text-xs">
          {JSON.stringify(item.evidencia ?? [], null, 2)}
        </pre>
      </details>
      <Field label="Dictamen oficial del ítem" required>
        <textarea
          className={`${inputClass} min-h-24 py-3`}
          value={detalle}
          disabled={dictaminar.isPending}
          onChange={(e) => setDetalle(e.target.value)}
        />
      </Field>
      <label className="my-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          disabled={dictaminar.isPending}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        Confirmo que revisé este ítem y el dictamen es CONFORME
      </label>
      {error && (
        <p role="alert" className="my-3 text-sm text-rose-700">
          {error}. Cierra y actualiza la bandeja para comprobar el estado antes de continuar.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} disabled={dictaminar.isPending} className="min-h-11 px-4">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={
            !confirmed ||
            detalle.trim().replace(/\s+/g, ' ').length < 3 ||
            dictaminar.isPending ||
            Boolean(error)
          }
          className="min-h-11 rounded-xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-50"
        >
          {dictaminar.isPending ? 'Guardando…' : 'Guardar CONFORME'}
        </button>
      </div>
    </Modal>
  );
}

function QualityQueue({ onInspect }) {
  const {
    data: items = [],
    isPending,
    isError,
    error,
    isFetching,
    refetch
  } = useDevolucionesPendientesCalidad({ enabled: true });
  return (
    <section
      aria-label="Bandeja de Calidad de devoluciones"
      className="mt-4 rounded-2xl border border-slate-200 bg-white p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black text-slate-900">Pendientes de Calidad por ítem</h2>
        <button onClick={() => refetch()} disabled={isFetching} className="min-h-11 px-3">
          Actualizar bandeja
        </button>
      </div>
      <p className="text-sm text-slate-500">
        Productos que requieren Calidad y todavía no tienen dictamen final.
      </p>
      {isError ? (
        <p role="alert" className="mt-3 text-rose-700">
          No se pudo cargar la bandeja: {error.message}. Actualiza antes de dictaminar.
        </p>
      ) : isPending ? (
        <p role="status">Cargando pendientes…</p>
      ) : items.length === 0 ? (
        <p className="mt-3">Sin ítems pendientes de Calidad</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <article
              key={item.devolucion_item_id}
              className="rounded-xl border border-slate-200 p-3"
            >
              <b>
                {item.folio} · {item.cliente}
              </b>
              <p>
                {item.codigo_producto || 'Sin SKU'} · {item.descripcion || 'Sin descripción'} ·
                Cantidad {Number(item.cantidad)}
              </p>
              <p className="text-sm">
                Lote {item.lote || '—'} · Serie {item.serie || '—'} · {formatDate(item.recibido_en)}
              </p>
              <p className="text-sm">{item.detalle || 'Sin detalle'}</p>
              <button
                onClick={() => onInspect(item)}
                disabled={isFetching}
                className="mt-2 min-h-11 rounded-xl bg-emerald-50 px-4 font-bold text-emerald-800 disabled:opacity-50"
              >
                Revisar ítem
              </button>
            </article>
          ))}
          {items.length === 100 && (
            <p role="status">
              Se muestran los primeros 100 pendientes, ordenados por recepción. Actualiza después de
              revisar.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function DetailModal({ row, onClose }) {
  const { data: history = [] } = useHistorialDevolucion(row.id);
  return (
    <Modal
      title={folioDevolucion(row)}
      subtitle={`${row.cliente} · recibido ${formatDate(row.recibido_en)}`}
      onClose={onClose}
      wide
    >
      <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${STATUS_CLASS[row.estado]}`}
              >
                {estadoDevolucionLabel(row.estado)}
              </span>
              {row.ticket_postventa && (
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-black text-violet-700">
                  <ClipboardCheck size={12} className="mr-1 inline" />
                  {row.ticket_postventa}
                </span>
              )}
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[10px] font-black uppercase text-slate-400">N.V.</dt>
                <dd className="font-bold">{row.nv || '—'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase text-slate-400">Guía</dt>
                <dd className="font-bold">{row.guia || '—'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase text-slate-400">Factura</dt>
                <dd className="font-bold">{row.factura || '—'}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <b>Motivo:</b> {row.motivo}
            </p>
          </section>
          <section>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
              Productos
            </h3>
            <div className="space-y-2">
              {(row.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <div>
                    <b className="text-sm text-slate-800">
                      {item.codigo_producto || item.descripcion}
                    </b>
                    <p className="text-xs text-slate-400">
                      {item.descripcion} · Serie {item.serie || '—'} · Lote {item.lote || '—'}
                    </p>
                    <p className="mt-1 text-xs">
                      Calidad:{' '}
                      {item.dictamen_calidad ||
                        (item.requiere_calidad === true
                          ? 'Pendiente'
                          : item.requiere_calidad === false
                            ? 'No requerida'
                            : 'Sin definir')}
                    </p>
                    {item.detalle && <p className="text-xs">{item.detalle}</p>}
                    {item.calidad_accion && (
                      <p className="mt-1 text-[11px] font-bold text-amber-700">
                        Calidad: {item.calidad_accion.folio} · {item.calidad_accion.estado}
                      </p>
                    )}
                    {item.ticket_postventa_ref && (
                      <p className="mt-1 text-[11px] font-bold text-violet-700">
                        Post-Venta: {item.ticket_postventa_ref.numero} ·{' '}
                        {item.ticket_postventa_ref.estado}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-600">
                    {Number(item.cantidad)} un.
                  </span>
                </div>
              ))}
            </div>
          </section>
          {row.detalle_calidad && (
            <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <h3 className="text-xs font-black uppercase text-emerald-700">Dictamen de Calidad</h3>
              <p className="mt-2 text-sm text-emerald-900">{row.detalle_calidad}</p>
              <p className="mt-2 text-xs text-emerald-700">
                {row.inspeccionado_por_nombre} · {formatDate(row.inspeccionado_en)}
              </p>
            </section>
          )}
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Trazabilidad
          </h3>
          <div className="mt-4 space-y-4">
            {history.map((event, index) => (
              <div
                key={`${event.creado_en}-${index}`}
                className="relative pl-6 before:absolute before:left-[7px] before:top-5 before:h-[calc(100%+1rem)] before:w-px before:bg-slate-200 last:before:hidden"
              >
                <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 ring-1 ring-emerald-200" />
                <b className="text-xs text-slate-800">{estadoDevolucionLabel(event.hasta)}</b>
                <p className="text-[11px] text-slate-500">
                  {event.actor || 'Sistema'} · {formatDate(event.creado_en)}
                </p>
                <p className="mt-1 text-xs text-slate-600">{event.nota}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Modal>
  );
}

function RecepcionContent() {
  const { hasPermission, user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado === true;
  const canManage = isAdmin || hasPermission('manage_devoluciones');
  const canInspect = isAdmin || hasPermission('inspect_devoluciones');
  const [q, setQ] = useState('');
  const [deferredQ, setDeferredQ] = useState('');
  const [estado, setEstado] = useState('');
  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
    isError,
    error
  } = useDevoluciones({
    estado,
    q: deferredQ
  });
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setDeferredQ(q.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [q]);
  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.reduce(
        (total, row) =>
          total +
          (row.items || []).filter(
            (item) => item.requiere_calidad === true && item.dictamen_calidad === null
          ).length,
        0
      ),
      rejected: rows.filter((row) => ['NO_CONFORME', 'DERIVADA_POSTVENTA'].includes(row.estado))
        .length,
      conform: rows.filter((row) => row.estado === 'CONFORME').length
    }),
    [rows]
  );

  return (
    <div className="mx-auto w-full max-w-[1500px] p-3 sm:p-5 lg:p-7">
      <header className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500" />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-emerald-300">
              <PackageOpen size={23} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">
                Inbound · trazabilidad operativa
              </p>
              <h1 className="text-xl font-black text-slate-950 sm:text-2xl">
                Recepción de Devoluciones
              </h1>
              <p className="text-xs text-slate-500">
                Registro, consulta e historial de devoluciones recibidas.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {canInspect && (
              <Link
                to={DEVOLUCIONES_QUALITY_PATH}
                className="self-center text-xs font-bold text-sky-700"
              >
                Pendientes de Devoluciones
              </Link>
            )}
            <button
              onClick={() => refetch()}
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="Actualizar"
            >
              <RefreshCw size={17} className={isFetching ? 'animate-spin' : ''} />
            </button>
            {canManage && (
              <button
                onClick={() => setCreating(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-lg shadow-emerald-200"
              >
                <Plus size={17} /> Nueva recepción
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Registros visibles" value={stats.total} icon={Box} />
        <Stat label="Ítems pendientes visibles" value={stats.pending} tone="amber" icon={Clock3} />
        <Stat label="No conformes" value={stats.rejected} tone="rose" icon={AlertTriangle} />
        <Stat label="Conformes" value={stats.conform} tone="emerald" icon={CheckCircle2} />
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar cliente, N.V., guía o factura…"
            />
          </label>
          <select
            className={`${inputClass} sm:w-56`}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {DEVOLUCION_ESTADOS.map((item) => (
              <option key={item} value={item}>
                {estadoDevolucionLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_1.5fr_1.2fr_.8fr_.8fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 lg:grid">
          <span>Folio / fecha</span>
          <span>Cliente / referencia</span>
          <span>Motivo</span>
          <span>Productos</span>
          <span>Estado</span>
          <span>Acción</span>
        </div>
        {isError ? (
          <p role="alert" className="p-4 text-rose-700">
            No se pudieron cargar las devoluciones: {error.message}
          </p>
        ) : isLoading ? (
          <div className="grid min-h-64 place-items-center text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="grid min-h-64 place-items-center px-4 text-center">
            <div>
              <PackageOpen size={34} className="mx-auto text-slate-300" />
              <h2 className="mt-3 text-sm font-black text-slate-600">
                Sin devoluciones para este filtro
              </h2>
              <p className="text-xs text-slate-400">
                Los nuevos registros aparecerán aquí con toda su trazabilidad.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <article
                key={row.id}
                className="grid gap-3 px-4 py-4 transition hover:bg-slate-50/70 lg:grid-cols-[1fr_1.5fr_1.2fr_.8fr_.8fr_auto] lg:items-center"
              >
                <div>
                  <b className="text-sm text-slate-900">{folioDevolucion(row)}</b>
                  <p className="text-[11px] text-slate-400">{formatDate(row.recibido_en)}</p>
                </div>
                <div className="min-w-0">
                  <b className="block truncate text-sm text-slate-800">{row.cliente}</b>
                  <p className="truncate text-xs text-slate-400">
                    N.V. {row.nv || '—'} · Guía {row.guia || '—'} · Factura {row.factura || '—'}
                  </p>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{row.motivo}</p>
                <p className="text-xs font-black text-slate-700">{row.items?.length || 0} SKU(s)</p>
                <span
                  className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black ${STATUS_CLASS[row.estado]}`}
                >
                  {estadoDevolucionLabel(row.estado)}
                </span>
                <button
                  onClick={() => setDetail(row)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                >
                  <FileSearch size={15} /> Ver
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-xs text-sky-800">
        <ShieldCheck size={18} className="shrink-0" />
        <p>
          <b>Flujo controlado:</b> un registro asociado conserva N.V., guía y factura; el manual no
          inventa vínculos. La revisión guarda un dictamen CONFORME por ítem y conserva su
          trazabilidad.
        </p>
      </div>

      {creating && <NewReturnModal onClose={() => setCreating(false)} />}
      {detail && <DetailModal row={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function PendientesContent() {
  const { hasPermission, user } = useAuth();
  const canInspect =
    user?.rol === 'ADMIN' ||
    user?.es_admin_delegado === true ||
    hasPermission('inspect_devoluciones');
  const [inspecting, setInspecting] = useState(null);

  return (
    <div className="mx-auto w-full max-w-[1500px] p-3 sm:p-5 lg:p-7">
      <header className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold text-sky-700">Calidad · inspección por ítem</p>
        <h1 className="text-xl font-black text-slate-950">Pendientes de Devoluciones</h1>
        <p className="my-2 text-xs text-slate-500">
          Ítems que requieren Calidad y todavía no tienen dictamen.
        </p>
        <Link to={DEVOLUCIONES_INBOUND_PATH} className="text-xs font-bold text-sky-700">
          Ir a Inbound · Devoluciones
        </Link>
      </header>
      {canInspect ? (
        <QualityQueue onInspect={setInspecting} />
      ) : (
        <p role="alert" className="mt-4 text-sm text-slate-600">
          No tienes permiso para inspeccionar devoluciones. La recepción y consulta están en
          Inbound.
        </p>
      )}
      {canInspect && inspecting && (
        <InspectItemModal
          key={inspecting.devolucion_item_id}
          item={inspecting}
          onClose={() => setInspecting(null)}
        />
      )}
    </div>
  );
}

// Una única página: recepción en Inbound; Calidad solo monta la bandeja y dictamen.
export default function RecepcionDevoluciones() {
  const { pathname } = useLocation();
  const qualityView = pathname.toLowerCase().replace(/\/+$/, '') === DEVOLUCIONES_QUALITY_PATH;
  return qualityView ? <PendientesContent /> : <RecepcionContent />;
}
