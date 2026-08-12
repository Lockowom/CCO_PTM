import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  History,
  Loader2,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
  X,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchReopenInbox,
  resolveReopenRequest,
  subscribeToReopenRequests
} from './reopenRequestsService';

const FILTERS = [
  { value: 'PENDIENTE', label: 'Pendientes', tone: 'amber' },
  { value: '', label: 'Todas', tone: 'slate' },
  { value: 'APROBADA', label: 'Aprobadas', tone: 'emerald' },
  { value: 'RECHAZADA', label: 'Rechazadas', tone: 'red' }
];

const STATUS_STYLE = {
  PENDIENTE: 'border-amber-200 bg-amber-50 text-amber-700',
  APROBADA: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  RECHAZADA: 'border-red-200 bg-red-50 text-red-700'
};

function formatDate(value, withTime = true) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {})
  }).format(date);
}

function ageLabel(value) {
  const elapsed = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return 'recién';
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 60) return `hace ${Math.max(1, minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

function StatCard({ icon: Icon, label, value, className }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${className}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function RequestDetail({ request, busy, onClose, onResolve }) {
  const [observation, setObservation] = useState('');
  if (!request) return null;
  const pending = request.estado_solicitud === 'PENDIENTE';

  const resolve = (approve) => {
    if (!approve && !observation.trim()) {
      toast.error('Debes indicar por qué se rechaza la solicitud.');
      return;
    }
    onResolve(request, approve, observation);
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/35 backdrop-blur-[2px]">
      <button className="absolute inset-0" onClick={onClose} aria-label="Cerrar detalle" />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-hidden bg-slate-50 shadow-2xl">
        <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.12em] ${STATUS_STYLE[request.estado_solicitud]}`}
                >
                  {request.estado_solicitud}
                </span>
                <span className="text-xs font-bold uppercase text-slate-400">
                  Canal {request.canal}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                Solicitud N.V. {request.nv}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Solicitada {formatDate(request.solicitada_at)} · {ageLabel(request.solicitada_at)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
              aria-label="Cerrar"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-700">
              Motivo informado
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-800">
              {request.motivo}
            </p>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ['Cliente', request.cliente, UserRound],
              ['Vendedor', request.vendedor, UserRound],
              ['Estado actual', request.estado_nv, RotateCcw],
              ['Transportista', request.transportista, Truck],
              ['Solicitó', request.solicitada_por_nombre, UserRound],
              ['Entregada originalmente', formatDate(request.fecha_entregado, false), CalendarClock]
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Icon size={15} />
                  <span className="text-[10px] font-black uppercase tracking-[0.13em]">
                    {label}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-800">{value || '—'}</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={20} />
              <div>
                <p className="text-sm font-black text-blue-900">SLA/OTIF histórico protegido</p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  La reapertura queda auditada y devuelve la N.V. a En Proceso, pero conserva las
                  fechas originales de aprobación, compromiso y primera entrega. No genera una
                  segunda entrega ficticia ni reinicia el SLA histórico.
                </p>
              </div>
            </div>
          </section>

          {!pending && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Resolución
              </p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {request.resuelta_por_nombre || 'Usuario no disponible'} ·{' '}
                {formatDate(request.resuelta_at)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                {request.observacion_resolucion || 'Sin observación adicional.'}
              </p>
            </section>
          )}

          {pending && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                Observación de resolución
              </label>
              <textarea
                value={observation}
                onChange={(event) => setObservation(event.target.value)}
                rows={4}
                maxLength={1000}
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                placeholder="Qué se revisó y por qué se aprueba o rechaza..."
              />
              <p className="mt-1 text-right text-[10px] text-slate-400">
                {observation.length}/1000
              </p>
            </section>
          )}
        </div>

        {pending && (
          <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-4 sm:px-7">
            <button
              type="button"
              disabled={busy}
              onClick={() => resolve(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {busy ? <Loader2 size={17} className="animate-spin" /> : <XCircle size={17} />}
              Rechazar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => resolve(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
              Aprobar y reabrir
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default function BandejaReaperturas() {
  const [status, setStatus] = useState('PENDIENTE');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError('');
      try {
        const result = await fetchReopenInbox({ status, search: debouncedSearch });
        setItems(result.items);
        setStats(result.stats);
        setSelected((current) =>
          current
            ? result.items.find((item) => item.request_id === current.request_id) || current
            : null
        );
      } catch (loadError) {
        setError(loadError.message || 'No fue posible cargar las solicitudes.');
      } finally {
        setLoading(false);
      }
    },
    [status, debouncedSearch]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => subscribeToReopenRequests(() => void load(true)), [load]);

  const resolve = async (request, approve, observation) => {
    setBusy(true);
    try {
      const result = await resolveReopenRequest(request.request_id, approve, observation);
      toast.success(result.message || (approve ? 'Reapertura aprobada.' : 'Solicitud rechazada.'));
      setSelected(null);
      await load(true);
    } catch (resolveError) {
      toast.error(resolveError.message || 'No fue posible resolver la solicitud.');
    } finally {
      setBusy(false);
    }
  };

  const visibleLabel = useMemo(
    () => FILTERS.find((filter) => filter.value === status)?.label || 'Solicitudes',
    [status]
  );

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-950/25">
              <RotateCcw size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                Control de cambios · N.V. entregadas
              </p>
              <h1 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                Solicitudes de reapertura
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-300">
                Revisa, aprueba o rechaza solicitudes sin buscar manualmente cada N.V.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black hover:bg-white/15 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Clock3}
          label="Pendientes"
          value={stats.pendientes}
          className="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Aprobadas"
          value={stats.aprobadas}
          className="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={XCircle}
          label="Rechazadas"
          value={stats.rechazadas}
          className="bg-red-50 text-red-600"
        />
        <StatCard
          icon={History}
          label="Historial total"
          value={stats.total}
          className="bg-blue-50 text-blue-600"
        />
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-black transition ${
                  status === filter.value
                    ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <label className="relative block w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              maxLength={100}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder="Buscar N.V., cliente, vendedor o solicitante..."
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <h2 className="font-black text-slate-900">{visibleLabel}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {items.length} solicitud(es) en esta vista
            </p>
          </div>
          <ShieldCheck className="text-emerald-500" size={21} />
        </div>

        {loading ? (
          <div className="grid min-h-64 place-items-center text-slate-500">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-orange-500" size={28} />
              <p className="mt-3 text-sm font-semibold">Cargando solicitudes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="m-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-black">No se pudo cargar la bandeja</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="grid min-h-64 place-items-center px-5 text-center">
            <div>
              <CheckCircle2 className="mx-auto text-emerald-500" size={34} />
              <p className="mt-3 font-black text-slate-800">No hay solicitudes en esta vista</p>
              <p className="mt-1 text-sm text-slate-500">
                La bandeja se actualizará automáticamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((request) => (
              <button
                key={request.request_id}
                type="button"
                onClick={() => setSelected(request)}
                className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_auto] sm:items-center sm:px-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-slate-950">N.V. {request.nv}</span>
                    {request.urgente && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700">
                        PRIORIDAD
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-600">
                    {request.cliente || 'Cliente no informado'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {request.solicitada_por_nombre || 'Usuario'} · {ageLabel(request.solicitada_at)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm leading-5 text-slate-600">{request.motivo}</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.1em] ${STATUS_STYLE[request.estado_solicitud]}`}
                  >
                    {request.estado_solicitud}
                  </span>
                  <ChevronRight className="text-slate-400" size={18} />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
        <FileText className="mt-0.5 shrink-0 text-slate-500" size={17} />
        <p>
          Cada solicitud, aprobación y rechazo permanece registrado con usuario, fecha, motivo y
          observación. Las incidencias de armado siguen siendo un flujo separado y no requieren
          reabrir la N.V.
        </p>
      </div>

      <RequestDetail
        request={selected}
        busy={busy}
        onClose={() => !busy && setSelected(null)}
        onResolve={resolve}
      />
    </div>
  );
}
