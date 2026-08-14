import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  PackageX,
  RefreshCw,
  Search,
  X,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(value)
      )
    : '—';

const stateStyle = {
  PENDIENTE: 'border-amber-200 bg-amber-50 text-amber-700',
  APROBADA: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  RECHAZADA: 'border-rose-200 bg-rose-50 text-rose-700'
};

function ResolveModal({ request, approve, onClose, onResolved }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!approve && !/[\p{L}\p{N}]/u.test(note.trim())) {
      toast.error('Indica el motivo del rechazo.');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('resolver_cambio_ubicacion', {
        p_solicitud_id: request.id,
        p_aprobar: approve,
        p_nota_admin: note.trim() || null
      });
      if (error) throw error;
      toast.success(approve ? 'Cambio ejecutado y auditado' : 'Solicitud rechazada');
      onResolved(data);
      onClose();
    } catch (error) {
      toast.error(error.message || 'No se pudo resolver la solicitud.', {
        description: 'Actualiza la bandeja y revisa si el producto cambió desde el reporte.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {approve ? 'Confirmar y ejecutar' : 'Rechazar solicitud'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {request.codigo} · {request.ubicacion_actual}
              {request.nueva_ubicacion ? ` → ${request.nueva_ubicacion}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div
          className={`mt-4 rounded-2xl border p-4 text-sm ${approve ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}
        >
          {approve
            ? request.tipo === 'MOVIDO'
              ? `El producto será movido a ${request.nueva_ubicacion}. La cantidad se conserva y se fusiona si el SKU ya existe allí.`
              : 'Se eliminará esta ubicación del producto. El registro quedará respaldado en la auditoría.'
            : 'No se modificará la ubicación. El solicitante podrá ver el rechazo y su motivo.'}
        </div>
        <label className="mt-4 block text-[11px] font-black uppercase tracking-wider text-slate-500">
          Nota administrativa {approve ? '(opcional)' : '(obligatoria)'}
        </label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
          placeholder="Resultado de la revisión física..."
        />
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white disabled:opacity-50 ${approve ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : approve ? (
              <CheckCircle2 size={16} />
            ) : (
              <XCircle size={16} />
            )}
            {approve ? 'Ejecutar' : 'Rechazar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LocationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState('PENDIENTE');
  const [search, setSearch] = useState('');
  const [resolution, setResolution] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wms_ubicacion_solicitudes')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(500);
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar la bandeja.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel('wms-location-requests-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wms_ubicacion_solicitudes' },
        fetchRequests
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchRequests]);

  const counts = useMemo(
    () =>
      requests.reduce(
        (acc, request) => ({ ...acc, [request.estado]: (acc[request.estado] || 0) + 1 }),
        {}
      ),
    [requests]
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (state !== 'TODAS' && request.estado !== state) return false;
      if (!q) return true;
      return [
        request.codigo,
        request.descripcion,
        request.ubicacion_actual,
        request.nueva_ubicacion,
        request.solicitante_nombre
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(q)
      );
    });
  }, [requests, state, search]);

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-200">
              <AlertTriangle size={23} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                Solicitudes de ubicación
              </h1>
              <p className="text-sm text-slate-500">
                Revisa, aprueba y ejecuta correcciones reportadas desde bodega.
              </p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
        </header>

        <section className="mt-4 grid grid-cols-3 gap-3">
          {[
            ['Pendientes', counts.PENDIENTE || 0, Clock3, 'text-amber-600'],
            ['Ejecutadas', counts.APROBADA || 0, CheckCircle2, 'text-emerald-600'],
            ['Rechazadas', counts.RECHAZADA || 0, XCircle, 'text-rose-600']
          ].map(([label, value, Icon, tone]) => (
            <article
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Icon size={18} className={tone} />
              <strong className="mt-2 block text-2xl font-black text-slate-900">{value}</strong>
              <span className="text-xs font-bold text-slate-400">{label}</span>
            </article>
          ))}
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar SKU, ubicación o usuario..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              {['PENDIENTE', 'APROBADA', 'RECHAZADA', 'TODAS'].map((option) => (
                <button
                  key={option}
                  onClick={() => setState(option)}
                  className={`rounded-lg px-3 py-2 text-[10px] font-black ${state === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {loading && requests.length === 0 ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-amber-500" size={30} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <CheckCircle2 className="mx-auto text-emerald-300" size={38} />
              <h3 className="mt-3 font-black text-slate-700">
                No hay solicitudes para este filtro
              </h3>
            </div>
          ) : (
            filtered.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${request.tipo === 'MOVIDO' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}
                  >
                    {request.tipo === 'MOVIDO' ? <MapPin size={20} /> : <PackageX size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="font-mono text-sm text-slate-950">{request.codigo}</strong>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${stateStyle[request.estado]}`}
                      >
                        {request.estado}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">
                        {request.tipo}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-600">
                      {request.descripcion || 'Sin descripción'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 font-black text-slate-700">
                        {request.ubicacion_actual}
                      </span>
                      {request.nueva_ubicacion && (
                        <>
                          <span className="text-slate-300">→</span>
                          <span className="rounded-lg bg-blue-50 px-2 py-1 font-black text-blue-700">
                            {request.nueva_ubicacion}
                          </span>
                        </>
                      )}
                      <span className="text-slate-400">
                        Cant. al reportar: {request.cantidad_snapshot}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-[210px] text-xs text-slate-500">
                    <strong className="block text-slate-700">{request.solicitante_nombre}</strong>
                    <span>{formatDate(request.creado_en)}</span>
                    <p className="mt-1 max-w-sm text-slate-500">{request.observacion}</p>
                  </div>
                  {request.estado === 'PENDIENTE' ? (
                    <div className="flex gap-2 lg:ml-auto">
                      <button
                        onClick={() => setResolution({ request, approve: false })}
                        className="flex-1 rounded-xl border border-rose-200 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => setResolution({ request, approve: true })}
                        className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700"
                      >
                        Aprobar y ejecutar
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-[175px] text-xs text-slate-500">
                      <strong className="block text-slate-700">
                        Resuelto por {request.resuelto_por_nombre}
                      </strong>
                      <span>{formatDate(request.resuelto_en)}</span>
                      {request.nota_admin && <p className="mt-1">{request.nota_admin}</p>}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      {resolution && (
        <ResolveModal
          request={resolution.request}
          approve={resolution.approve}
          onClose={() => setResolution(null)}
          onResolved={(updated) =>
            setRequests((current) =>
              current.map((item) => (item.id === updated.id ? updated : item))
            )
          }
        />
      )}
    </div>
  );
}
