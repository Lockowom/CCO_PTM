import { useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CircleDot,
  Filter,
  Gauge,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
  Wrench,
  X
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import QueryErrorState from '../../components/ui/QueryErrorState';

const LOOKBACK_OPTIONS = [
  { value: '24h', label: '24 horas' },
  { value: '72h', label: '72 horas' },
  { value: '7d', label: '7 días' }
];

const LEVEL_STYLES = {
  error: 'bg-rose-100 text-rose-700 border-rose-200',
  warn: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-sky-100 text-sky-700 border-sky-200'
};

const ALERT_STYLES = {
  critical: 'bg-rose-100 text-rose-700 border-rose-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  medium: 'bg-sky-100 text-sky-700 border-sky-200'
};

const KIND_LABELS = {
  application: 'Aplicación',
  audit: 'Auditoría',
  performance: 'Rendimiento',
  query: 'Query',
  mutation: 'Mutación',
  frontend: 'Frontend',
  realtime: 'Realtime',
  presence: 'Presencia'
};

const fmtDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fmtAgo = (value) => {
  if (!value) return '—';
  const diffMs = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diffMs)) return '—';
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  return `Hace ${Math.floor(diffHours / 24)} d`;
};

const fmtDuration = (ms) => {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return `${(ms / 60000).toFixed(1)} min`;
};

function getSinceIso(lookback) {
  const now = Date.now();
  const map = {
    '24h': 24 * 60 * 60 * 1000,
    '72h': 72 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000
  };
  return new Date(now - (map[lookback] || map['24h'])).toISOString();
}

function chipClass(level) {
  return LEVEL_STYLES[level] || 'bg-slate-100 text-slate-700 border-slate-200';
}

function extractTop(items, pickKey, limit = 5) {
  const acc = new Map();
  items.forEach((item) => {
    const key = pickKey(item);
    if (!key) return;
    acc.set(key, (acc.get(key) || 0) + 1);
  });
  return Array.from(acc.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

async function fetchObservabilitySnapshot({
  lookback,
  level,
  kind,
  moduleFilter,
  search,
  alertStatus
}) {
  const since = getSinceIso(lookback);
  let query = supabase
    .from('system_logs')
    .select(
      'id, created_at, level, kind, module, screen, action, route, status, message, error_name, stack, payload, context, browser, duration_ms, app_version, commit_sha, build_number, correlation_id, session_id, handled, fingerprint, usuario_nombre, usuario_email, rol',
      { count: 'exact' }
    )
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(300);

  if (level !== 'all') query = query.eq('level', level);
  if (kind !== 'all') query = query.eq('kind', kind);
  if (moduleFilter !== 'all') query = query.eq('module', moduleFilter);
  if (search.trim()) {
    const term = search.trim().replace(/[%*,]/g, ' ').slice(0, 60);
    query = query.or(
      `message.ilike.*${term}*,usuario_nombre.ilike.*${term}*,usuario_email.ilike.*${term}*,action.ilike.*${term}*,screen.ilike.*${term}*`
    );
  }

  const errorCountQuery = supabase
    .from('system_logs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('level', 'error');

  const slowCountQuery = supabase
    .from('system_logs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
    .gte('duration_ms', 1000);

  const warnCountQuery = supabase
    .from('system_logs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('level', 'warn');

  const alertsQuery = supabase
    .from('system_alerts')
    .select(
      'id, created_at, status, severity, rule_code, scope_key, titulo, mensaje, payload, occurrences, first_seen_at, last_seen_at, notified_at, acknowledged_at, acknowledged_by, resolved_at, resolved_by, resolution_note'
    )
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(20);

  if (alertStatus !== 'all') alertsQuery.eq('status', alertStatus);

  const [{ data, error, count }, errorRes, slowRes, warnRes, alertsRes] = await Promise.all([
    query,
    errorCountQuery,
    slowCountQuery,
    warnCountQuery,
    alertsQuery
  ]);

  if (error) throw error;
  if (errorRes.error) throw errorRes.error;
  if (slowRes.error) throw slowRes.error;
  if (warnRes.error) throw warnRes.error;
  if (alertsRes.error) throw alertsRes.error;

  const logs = data || [];
  const alerts = alertsRes.data || [];
  const liveAlerts = alerts.filter((item) => isLiveAlert(item));
  const errorLogs = logs.filter((item) => item.level === 'error');
  const usersAffected = new Set(
    logs.map((item) => item.usuario_email || item.usuario_nombre || item.rol).filter(Boolean)
  ).size;
  const avgDuration = (() => {
    const durations = logs
      .map((item) => Number(item.duration_ms))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (!durations.length) return null;
    return Math.round(durations.reduce((acc, value) => acc + value, 0) / durations.length);
  })();

  return {
    logs,
    totals: {
      total: count || 0,
      errors: errorRes.count || 0,
      warns: warnRes.count || 0,
      slow: slowRes.count || 0,
      openAlerts: alerts.filter((item) => item.status === 'open').length,
      liveAlerts: liveAlerts.length,
      historicalOpenAlerts: alerts.filter((item) => item.status === 'open' && !isLiveAlert(item))
        .length,
      usersAffected,
      avgDuration
    },
    alerts,
    topFingerprints: extractTop(errorLogs, (item) => item.fingerprint || item.message, 6),
    topModules: extractTop(logs, (item) => item.module, 6),
    topActions: extractTop(
      logs.filter((item) => Number(item.duration_ms) >= 1000),
      (item) => `${item.module}.${item.action}`,
      6
    ),
    lastError: errorLogs[0] || null,
    modules: Array.from(new Set(logs.map((item) => item.module).filter(Boolean))).sort(),
    kinds: Array.from(new Set(logs.map((item) => item.kind).filter(Boolean))).sort()
  };
}

const StatCard = ({ icon, label, value, tone = 'slate', helper }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-bold">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{value}</p>
        {helper ? <p className="text-[11px] text-slate-400 mt-1">{helper}</p> : null}
      </div>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone === 'rose' ? 'bg-rose-50 text-rose-500' : tone === 'amber' ? 'bg-amber-50 text-amber-500' : tone === 'sky' ? 'bg-sky-50 text-sky-500' : tone === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-500'}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

function alertChipClass(severity) {
  return ALERT_STYLES[severity] || 'bg-slate-100 text-slate-700 border-slate-200';
}

function isLiveAlert(alert) {
  if (!alert || alert.status === 'resolved') return false;
  const seenAt = new Date(alert.last_seen_at || alert.created_at).getTime();
  return Number.isFinite(seenAt) && Date.now() - seenAt < 45 * 60 * 1000;
}

function alertNextStep(alert) {
  const action = alert?.payload?.action || '';
  if (alert?.rule_code === 'OBS_ERROR_BURST_GLOBAL')
    return `Abrir los eventos de ${action || 'la acción afectada'} y revisar el primer error, no la ráfaga.`;
  if (alert?.rule_code === 'OBS_REPEAT_FINGERPRINT')
    return 'Revisar el fingerprint y confirmar si el último evento aún se reproduce.';
  if (alert?.rule_code === 'OBS_SLOW_ACTION_MODULE')
    return `Revisar duración, usuario y ruta de ${action || 'la operación'} antes de escalar.`;
  return 'Abrir evidencia, confirmar impacto y reconocer o resolver el incidente.';
}

export default function Observability() {
  const containerRef = useRef(null);
  const [lookback, setLookback] = useState('24h');
  const [level, setLevel] = useState('all');
  const [kind, setKind] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [alertStatus, setAlertStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        y: 16,
        opacity: 0,
        duration: 0.35,
        ease: 'power3.out',
        clearProps: 'all'
      });
    },
    { scope: containerRef }
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['observability_snapshot', lookback, level, kind, moduleFilter, search, alertStatus],
    queryFn: () =>
      fetchObservabilitySnapshot({ lookback, level, kind, moduleFilter, search, alertStatus }),
    refetchInterval: 15000
  });

  const alertStatusMutation = useMutation({
    mutationFn: async ({ alertId, status, note }) => {
      const { data: updated, error: updateError } = await supabase.rpc(
        'update_system_alert_status',
        {
          p_alert_id: alertId,
          p_status: status,
          p_note: note || null
        }
      );
      if (updateError) throw updateError;
      return updated;
    },
    onSuccess: (_updated, variables) => {
      toast.success(
        variables.status === 'resolved' ? 'Incidente resuelto y auditado.' : 'Incidente reconocido.'
      );
      setSelectedAlert(null);
      setResolutionNote('');
      refetch();
    },
    onError: (mutationError) =>
      toast.error(mutationError?.message || 'No se pudo actualizar el incidente.')
  });

  const forceRefreshMutation = useMutation({
    mutationFn: async () => {
      const { error: refreshError } = await supabase.rpc('force_app_refresh', {
        p_reason: 'Actualización global solicitada desde Observabilidad'
      });
      if (refreshError) throw refreshError;
    },
    onSuccess: () =>
      toast.success('Actualización global activada. Los usuarios recargarán en hasta 20 segundos.'),
    onError: (refreshError) =>
      toast.error(refreshError?.message || 'No se pudo activar la actualización global.')
  });

  const logs = data?.logs || [];
  const alerts = data?.alerts || [];
  const modules = useMemo(() => data?.modules || [], [data]);
  const kinds = useMemo(() => data?.kinds || [], [data]);

  return (
    <div
      ref={containerRef}
      className="space-y-4 sm:space-y-6 bg-slate-50 min-h-screen text-slate-700 p-3 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white grid place-items-center shadow-lg">
              <ShieldAlert size={22} />
            </div>
            Centro de Observabilidad
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Errores, lentitud y trazabilidad técnica del CCO en una sola vista.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-slate-300"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => forceRefreshMutation.mutate()}
            disabled={forceRefreshMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-slate-700 disabled:opacity-60"
          >
            <RefreshCw size={16} className={forceRefreshMutation.isPending ? 'animate-spin' : ''} />
            Forzar actualización global
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter size={16} />
          <span className="text-sm font-black uppercase tracking-wide">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Ventana
            </label>
            <select
              value={lookback}
              onChange={(e) => setLookback(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400"
            >
              {LOOKBACK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Estado incidente
            </label>
            <select
              value={alertStatus}
              onChange={(e) => setAlertStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400"
            >
              <option value="all">Todos</option>
              <option value="open">Pendientes</option>
              <option value="ack">En revisión</option>
              <option value="resolved">Resueltos</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Severidad
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400"
            >
              <option value="all">Todas</option>
              <option value="error">Error</option>
              <option value="warn">Warn</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Tipo
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400"
            >
              <option value="all">Todos</option>
              {kinds.map((item) => (
                <option key={item} value={item}>
                  {KIND_LABELS[item] || item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Módulo
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400"
            >
              <option value="all">Todos</option>
              {modules.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Buscar
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="usuario, mensaje, acción"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400"
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <QueryErrorState
          error={error}
          onRetry={refetch}
          className="rounded-2xl border border-slate-200 bg-white"
        />
      ) : null}

      {!error && (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
            <StatCard
              icon={<Activity size={20} />}
              label="Eventos en ventana"
              value={data?.totals.total ?? (isLoading ? '…' : 0)}
              tone="sky"
              helper={`Vista ${LOOKBACK_OPTIONS.find((x) => x.value === lookback)?.label || lookback}`}
            />
            <StatCard
              icon={<CircleDot size={20} />}
              label="Incidentes vigentes"
              value={data?.totals.liveAlerts ?? (isLoading ? '…' : 0)}
              tone="rose"
              helper={`${data?.totals.historicalOpenAlerts ?? 0} históricos pendientes de cerrar`}
            />
            <StatCard
              icon={<AlertTriangle size={20} />}
              label="Warnings"
              value={data?.totals.warns ?? (isLoading ? '…' : 0)}
              tone="amber"
              helper="Eventos degradados o recuperables"
            />
            <StatCard
              icon={<Gauge size={20} />}
              label="Operaciones lentas"
              value={data?.totals.slow ?? (isLoading ? '…' : 0)}
              tone="emerald"
              helper=">= 1000 ms registrados"
            />
            <StatCard
              icon={<User size={20} />}
              label="Usuarios afectados"
              value={data?.totals.usersAffected ?? (isLoading ? '…' : 0)}
              helper={`Promedio: ${fmtDuration(data?.totals.avgDuration)}`}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 text-white overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                  Triage inmediato
                </p>
                <h2 className="text-lg font-black mt-1">
                  {data?.totals.liveAlerts
                    ? `${data.totals.liveAlerts} incidente(s) requieren revisión ahora`
                    : 'Sin incidentes activos en este momento'}
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Las alertas sin actividad por más de 45 min se muestran como históricas: revísalas
                  y ciérralas con evidencia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAlertStatus('open');
                  setLevel('error');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 px-4 py-2.5 text-sm font-black text-white"
              >
                <Wrench size={16} />
                Ver pendientes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500 mb-3">
                Top errores
              </h3>
              <div className="space-y-2">
                {(data?.topFingerprints || []).length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    Sin errores en el rango actual.
                  </p>
                ) : (
                  data.topFingerprints.map((item, index) => (
                    <div
                      key={`${item.key}-${index}`}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[12px] font-semibold text-slate-700 leading-5">
                          {item.key}
                        </p>
                        <span className="text-[11px] font-black text-rose-600 shrink-0">
                          {item.count}x
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500 mb-3">
                Módulos más ruidosos
              </h3>
              <div className="space-y-2">
                {(data?.topModules || []).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <span className="text-[12px] font-semibold text-slate-700">{item.key}</span>
                    <span className="text-[11px] font-black text-slate-500">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500 mb-3">
                Acciones lentas
              </h3>
              <div className="space-y-2">
                {(data?.topActions || []).length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    Sin lentitud relevante en la ventana actual.
                  </p>
                ) : (
                  data.topActions.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <span className="text-[12px] font-semibold text-slate-700">{item.key}</span>
                      <span className="text-[11px] font-black text-amber-600">{item.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">
                  Alertas automáticas
                </h3>
                <p className="text-[12px] text-slate-400 mt-1">
                  Haz clic para ver la evidencia, reconocer el incidente o cerrarlo con una nota.
                </p>
              </div>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
                Abiertas: {data?.totals.openAlerts ?? 0}
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Aún no hay alertas materializadas en la ventana actual.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setResolutionNote(alert.resolution_note || '');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-[10px] font-black uppercase rounded-lg border px-2 py-1 ${alertChipClass(alert.severity)}`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[10px] font-black uppercase rounded-lg border px-2 py-1 bg-slate-100 text-slate-600 border-slate-200">
                          {alert.status}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {fmtDateTime(alert.created_at)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-800 truncate">
                          {isLiveAlert(alert) ? '● Activa · ' : '○ Histórica · '}
                          {alert.titulo}
                        </p>
                        <p className="text-[12px] text-slate-500 truncate mt-0.5">
                          {alert.mensaje}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                        <span>{alert.rule_code}</span>
                        <span>{alert.occurrences}x</span>
                        <span>{fmtAgo(alert.last_seen_at || alert.created_at)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">
                  Eventos recientes
                </h3>
                <p className="text-[12px] text-slate-400 mt-1">
                  Últimos {logs.length} registros según los filtros actuales.
                </p>
              </div>
              {data?.lastError ? (
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-wide text-rose-500">
                    Último error
                  </p>
                  <p className="text-[12px] text-slate-500">
                    {fmtAgo(data.lastError.created_at)} · {data.lastError.module}.
                    {data.lastError.action}
                  </p>
                </div>
              ) : null}
            </div>

            {isLoading ? (
              <div className="py-14 text-center text-slate-400 text-sm">
                Cargando observabilidad…
              </div>
            ) : logs.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-sm">
                No hay logs para los filtros seleccionados.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
                {logs.map((log) => (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => setSelectedLog(log)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-[10px] font-black uppercase rounded-lg border px-2 py-1 ${chipClass(log.level)}`}
                        >
                          {log.level}
                        </span>
                        <span className="text-[10px] font-black uppercase rounded-lg border px-2 py-1 bg-slate-100 text-slate-600 border-slate-200">
                          {KIND_LABELS[log.kind] || log.kind}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {fmtDateTime(log.created_at)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-800 truncate">
                          {log.message}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {log.module}.{log.action} · {log.screen || 'sin pantalla'} ·{' '}
                          {log.route || 'sin ruta'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                        <span>{log.usuario_nombre || log.usuario_email || 's/usuario'}</span>
                        <span>
                          <Clock3 size={12} className="inline mr-1" />
                          {fmtDuration(log.duration_ms)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {selectedAlert && (
        <div className="fixed inset-0 z-[125] bg-slate-950/55 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase rounded-lg border px-2 py-1 ${alertChipClass(selectedAlert.severity)}`}
                  >
                    {selectedAlert.severity}
                  </span>
                  <span className="text-[10px] font-black uppercase rounded-lg border px-2 py-1 bg-slate-100 text-slate-600 border-slate-200">
                    {selectedAlert.status}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase ${isLiveAlert(selectedAlert) ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {isLiveAlert(selectedAlert) ? 'Actividad vigente' : 'Incidente histórico'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-2">{selectedAlert.titulo}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Última evidencia:{' '}
                  {fmtDateTime(selectedAlert.last_seen_at || selectedAlert.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                aria-label="Cerrar incidente"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <section className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-orange-700">
                  Qué revisar primero
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {alertNextStep(selectedAlert)}
                </p>
              </section>
              <section className="rounded-2xl border border-slate-200 p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Evidencia
                </p>
                <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                  {selectedAlert.mensaje}
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Regla
                    </span>
                    {selectedAlert.rule_code}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Repeticiones
                    </span>
                    {selectedAlert.occurrences} evento(s)
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Primero visto
                    </span>
                    {fmtDateTime(selectedAlert.first_seen_at)}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Último visto
                    </span>
                    {fmtDateTime(selectedAlert.last_seen_at)}
                  </div>
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 p-4">
                <label className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Nota de resolución
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  maxLength={1000}
                  placeholder="Qué ocurrió, qué se corrigió y cómo se verificó."
                  className="mt-2 w-full min-h-24 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-orange-400"
                />
              </section>
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                {selectedAlert.status === 'open' && (
                  <button
                    type="button"
                    disabled={alertStatusMutation.isPending}
                    onClick={() =>
                      alertStatusMutation.mutate({
                        alertId: selectedAlert.id,
                        status: 'ack',
                        note: resolutionNote
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <CircleDot size={16} /> Reconocer
                  </button>
                )}
                {selectedAlert.status !== 'resolved' && (
                  <button
                    type="button"
                    disabled={alertStatusMutation.isPending}
                    onClick={() =>
                      alertStatusMutation.mutate({
                        alertId: selectedAlert.id,
                        status: 'resolved',
                        note: resolutionNote
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} /> Resolver incidente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedLog && (
        <div className="fixed inset-0 z-[120] bg-slate-950/55 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase rounded-lg border px-2 py-1 ${chipClass(selectedLog.level)}`}
                  >
                    {selectedLog.level}
                  </span>
                  <span className="text-[10px] font-black uppercase rounded-lg border px-2 py-1 bg-slate-100 text-slate-600 border-slate-200">
                    {KIND_LABELS[selectedLog.kind] || selectedLog.kind}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {fmtDateTime(selectedLog.created_at)}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-2">{selectedLog.message}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedLog.module}.{selectedLog.action} · {selectedLog.screen || 'sin pantalla'}{' '}
                  · {selectedLog.route || 'sin ruta'}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-4">
                <section className="rounded-2xl border border-slate-200 p-4">
                  <h4 className="text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3">
                    Contexto operativo
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">
                        Usuario
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedLog.usuario_nombre || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">
                        Email
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedLog.usuario_email || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">
                        Rol
                      </span>
                      <span className="font-semibold text-slate-800">{selectedLog.rol || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">
                        Duración
                      </span>
                      <span className="font-semibold text-slate-800">
                        {fmtDuration(selectedLog.duration_ms)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">
                        Status
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedLog.status || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">
                        Versión
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedLog.app_version || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">
                        Correlation ID
                      </span>
                      <span className="font-mono text-[12px] text-slate-700 break-all">
                        {selectedLog.correlation_id || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] uppercase font-bold">
                        Fingerprint
                      </span>
                      <span className="font-mono text-[12px] text-slate-700 break-all">
                        {selectedLog.fingerprint || '—'}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-4">
                  <h4 className="text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3">
                    Payload
                  </h4>
                  <pre className="text-[12px] leading-5 bg-slate-950 text-slate-100 rounded-2xl p-4 overflow-auto max-h-[260px]">
                    {JSON.stringify(selectedLog.payload || {}, null, 2)}
                  </pre>
                </section>
              </div>

              <div className="space-y-4">
                <section className="rounded-2xl border border-slate-200 p-4">
                  <h4 className="text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3">
                    Context
                  </h4>
                  <pre className="text-[12px] leading-5 bg-slate-950 text-slate-100 rounded-2xl p-4 overflow-auto max-h-[260px]">
                    {JSON.stringify(selectedLog.context || {}, null, 2)}
                  </pre>
                </section>

                <section className="rounded-2xl border border-slate-200 p-4">
                  <h4 className="text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3">
                    Stack / navegador
                  </h4>
                  <pre className="text-[12px] leading-5 bg-slate-950 text-slate-100 rounded-2xl p-4 overflow-auto max-h-[260px]">
                    {selectedLog.stack ||
                      JSON.stringify(selectedLog.browser || {}, null, 2) ||
                      'Sin stack registrado'}
                  </pre>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
