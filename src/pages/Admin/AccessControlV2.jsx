import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  KeyRound,
  LayoutGrid,
  ListTree,
  Loader2,
  Pencil,
  Save,
  Search,
  ShieldCheck,
  AlertTriangle,
  Undo2,
  Users as UsersIcon,
  XCircle
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useAuthz } from '../../components/authz';
import { MODULE_REGISTRY } from '../../domain/access/moduleRegistry.js';
import { SCREEN_REGISTRY } from '../../domain/access/screenRegistry.js';
import { FUNCTION_REGISTRY } from '../../domain/access/functionRegistry.js';
import {
  buildEffectiveView,
  previewPendingChanges,
  ORIGIN_LABEL,
  ORIGIN_TONE,
  DIFF
} from '../../domain/access/effectiveView.js';
import {
  usuariosLite,
  permisosEfectivosDe,
  listarOverridesDe,
  upsertOverride,
  deleteOverride,
  listarModosEnforcement,
  cambiarModoEnforcement
} from '../../services/iamService';

const TONE_CLASSES = {
  red: 'bg-red-500/10 text-red-400 border-red-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
};

const RISK_STYLE = {
  CRITICAL: 'text-red-400 border-red-500/30 bg-red-500/10',
  HIGH: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  MEDIUM: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  LOW: 'text-slate-400 border-slate-500/30 bg-slate-500/10'
};

const TRI_OPTIONS = [
  { id: 'INHERIT', label: 'HEREDAR' },
  { id: 'ALLOW', label: 'PERMITIR' },
  { id: 'DENY', label: 'DENEGAR' }
];

function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function OriginChip({ origin, reasons }) {
  const tone = TONE_CLASSES[ORIGIN_TONE[origin]] || TONE_CLASSES.slate;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}
      title={reasons && reasons.length ? `Por: ${reasons.join(', ')}` : ORIGIN_LABEL[origin]}
    >
      {ORIGIN_LABEL[origin] || origin}
      {reasons && reasons.length > 0 && <span className="opacity-60">({reasons.join(', ')})</span>}
    </span>
  );
}

function DiffChip({ diff }) {
  if (diff === DIFF.SAME) return null;
  if (diff === DIFF.LOSS) {
    return (
      <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-400">
        Pierde vs hoy
      </span>
    );
  }
  return (
    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
      Gana vs hoy
    </span>
  );
}

function OverrideChip({ override }) {
  if (!override) return null;
  const cls =
    override.access === 'DENY'
      ? 'border-red-500/50 bg-red-500/15 text-red-300'
      : override.access === 'ALLOW'
        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
        : 'border-slate-500/50 bg-slate-500/15 text-slate-300';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-black uppercase ${cls}`}
      title={override.reason || 'Override individual'}
    >
      <KeyRound size={10} />
      {override.access}
    </span>
  );
}

function TriState({ value, onChange, disabled }) {
  return (
    <div
      className={`flex shrink-0 rounded-lg border border-slate-700/60 bg-slate-950/60 p-0.5 ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      {TRI_OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className={`rounded-md px-2 py-1 text-[10px] font-black tracking-wide transition-colors ${
            value === o.id
              ? o.id === 'DENY'
                ? 'bg-red-500/25 text-red-300'
                : o.id === 'ALLOW'
                  ? 'bg-emerald-500/25 text-emerald-300'
                  : 'bg-slate-700 text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function KpiCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className={`text-2xl font-black ${accent || 'text-slate-100'}`}>{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-400">{label}</div>
    </div>
  );
}

function ScreenRow({ screen, override, editable, triValue, onTriChange, saving }) {
  return (
    <li className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {screen.allow ? (
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
        ) : (
          <XCircle size={16} className="shrink-0 text-slate-600" />
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-200">{screen.label}</div>
          <div className="truncate text-[11px] text-slate-500">
            {screen.routes.join(' · ')}
            <span className="ml-1 font-mono text-slate-600">{screen.id}</span>
          </div>
        </div>
      </div>
      {screen.risk !== 'LOW' && (
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${RISK_STYLE[screen.risk]}`}
        >
          {screen.risk}
        </span>
      )}
      <OverrideChip override={override} />
      <OriginChip origin={screen.origin} reasons={screen.reasons} />
      <DiffChip diff={screen.diff} />
      {editable && <TriState value={triValue} onChange={onTriChange} disabled={saving} />}
    </li>
  );
}

function ModuleSection({ module, overridesByScreen, editable, triValueOf, onTriChange, saving }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-800/40"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown size={16} className="text-slate-500" />
          ) : (
            <ChevronRight size={16} className="text-slate-500" />
          )}
          <span className="text-sm font-bold text-slate-100">{module.label}</span>
          {module.privateBeta && (
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
              Private Beta
            </span>
          )}
        </div>
        <span
          className={`text-xs font-bold ${module.allow ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          {module.screens.length > 0
            ? `${module.screens.filter((s) => s.allow).length}/${module.screens.length}`
            : 'Sin pantallas'}
        </span>
      </button>
      {open && (
        <ul className="space-y-2 border-t border-slate-800 px-3 py-3">
          {module.screens.map((s) => (
            <ScreenRow
              key={s.id}
              screen={s}
              override={overridesByScreen[s.id]}
              editable={editable}
              triValue={triValueOf(s.id)}
              onTriChange={(access) => onTriChange(s.id, access)}
              saving={saving}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FunctionOverridesSection({
  overridesByFunction,
  editable,
  triValueOf,
  onTriChange,
  saving
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-800/40"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-slate-100">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          Funciones y acciones ({FUNCTION_REGISTRY.length})
        </span>
        <span className="text-xs text-slate-500">Control fino</span>
      </button>
      {open && (
        <div className="max-h-[520px] space-y-2 overflow-y-auto border-t border-slate-800 p-3">
          {FUNCTION_REGISTRY.map((fn) => (
            <div
              key={fn.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2"
            >
              <div className="min-w-[220px] flex-1">
                <div className="text-xs font-bold text-slate-200">{fn.label}</div>
                <div className="font-mono text-[10px] text-slate-500">{fn.id}</div>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${RISK_STYLE[fn.risk]}`}
              >
                {fn.risk}
              </span>
              <OverrideChip override={overridesByFunction[fn.id]} />
              {editable && (
                <TriState
                  value={triValueOf(fn.id)}
                  onChange={(access) => onTriChange(fn.id, access)}
                  disabled={saving}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserDetail({
  user,
  view,
  error,
  onRetry,
  canEdit,
  triValueOf,
  onTriChange,
  saving,
  overridesByScreen,
  overridesByFunction,
  triValueOfFunction,
  onFunctionTriChange
}) {
  if (!view) {
    if (error) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <AlertTriangle className="text-amber-400" size={24} />
          <p className="text-sm text-slate-300">No se pudo cargar el acceso de {user.nombre}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-700"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="h-5 w-1/2 animate-pulse rounded bg-slate-800" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-800" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <KpiCard
          label="Pantallas permitidas"
          value={view.counts.allowed}
          accent="text-emerald-400"
        />
        <KpiCard label="Denegadas" value={view.counts.denied} />
        <KpiCard label="Excepciones" value={view.counts.overrides} accent="text-orange-400" />
        {view.counts.losses > 0 && (
          <KpiCard
            label="Pérdidas vs acceso actual"
            value={view.counts.losses}
            accent="text-red-400"
          />
        )}
        {view.counts.gains > 0 && (
          <KpiCard
            label="Ganancias vs acceso actual"
            value={view.counts.gains}
            accent="text-emerald-400"
          />
        )}
      </div>

      <div className="space-y-3">
        {!view.catalogIntegrity?.valid && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
            El catálogo IAM está incompleto: se agruparon{' '}
            {view.catalogIntegrity?.groupedScreenCount}
            {' de '}
            {view.catalogIntegrity?.expectedScreenCount} pantallas. ENFORCE permanecerá bloqueado
            hasta corregir la matriz.
          </div>
        )}
        {view.modules.map((m) => (
          <ModuleSection
            key={m.id}
            module={m}
            overridesByScreen={overridesByScreen}
            editable={canEdit}
            triValueOf={triValueOf}
            onTriChange={onTriChange}
            saving={saving}
          />
        ))}
        <FunctionOverridesSection
          overridesByFunction={overridesByFunction}
          editable={canEdit}
          triValueOf={triValueOfFunction}
          onTriChange={onFunctionTriChange}
          saving={saving}
        />
      </div>

      {view.unmapped.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-400">
            Permisos sin superficie mapeada
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {view.unmapped.map((p) => (
              <span
                key={p}
                className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-amber-300"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-500">
        Vista efectiva calculada con el resolver IAM 2.0 (precedencia: Denegación explícita →
        Permiso individual → Perfil → Legacy → No asignado). El origen de cada pantalla indica qué
        regla la otorga. Comparación "vs hoy" contra el guard actual. El tri-state aplica una
        excepción individual (tabla iam.user_overrides); los roles no se tocan.
      </p>
    </div>
  );
}

function CatalogSection() {
  const [sub, setSub] = useState('modulos');
  const moduleCards = useMemo(() => {
    const counts = {};
    for (const s of SCREEN_REGISTRY) counts[s.module] = (counts[s.module] || 0) + 1;
    return Object.entries(counts)
      .map(([id, screenCount]) => {
        const mod = MODULE_REGISTRY.find((m) => m.id === id);
        return {
          id,
          label: mod?.label || id,
          description: mod?.description || '',
          privateBeta: mod?.privateBeta || false,
          screenCount
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'modulos', label: 'Módulos' },
          { id: 'pantallas', label: 'Pantallas' },
          { id: 'funciones', label: 'Funciones' }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSub(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              sub === t.id
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'modulos' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {moduleCards.map((m) => (
            <div key={m.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-sm font-bold text-slate-100">{m.label}</div>
              <div className="mt-0.5 font-mono text-[11px] text-slate-500">{m.id}</div>
              <p className="mt-2 text-xs text-slate-400">{m.description}</p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                  {m.screenCount} pantallas
                </span>
                {m.privateBeta && (
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-400">
                    Private Beta
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {sub === 'pantallas' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Pantalla</th>
                <th className="px-4 py-3">Módulo</th>
                <th className="px-4 py-3">Rutas</th>
                <th className="px-4 py-3">Permiso default</th>
                <th className="px-4 py-3">Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {SCREEN_REGISTRY.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-200">{s.label}</div>
                    <div className="font-mono text-[11px] text-slate-500">{s.id}</div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{s.module}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">
                    {s.routes.join(' · ')}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-300">
                    {s.defaultPermission}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${RISK_STYLE[s.risk]}`}
                    >
                      {s.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sub === 'funciones' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Función</th>
                <th className="px-4 py-3">Pantalla</th>
                <th className="px-4 py-3">Módulo</th>
                <th className="px-4 py-3">Riesgo</th>
                <th className="px-4 py-3">Backend</th>
              </tr>
            </thead>
            <tbody>
              {FUNCTION_REGISTRY.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-200">{f.label}</div>
                    <div className="font-mono text-[11px] text-slate-500">{f.id}</div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{f.screen}</td>
                  <td className="px-4 py-2.5 text-slate-400">{f.module}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${RISK_STYLE[f.risk]}`}
                    >
                      {f.risk}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">
                    {f.backendAction || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AccessControlV2() {
  const { hasAny, isAdmin } = useAuthz();
  const canEdit = isAdmin || hasAny(['manage_users']);

  const [tab, setTab] = useState('usuarios');
  const [q, setQ] = useState('');
  const [users, setUsers] = useState(null);
  const [usersError, setUsersError] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [pending, setPending] = useState(new Map());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedOk, setSavedOk] = useState(false);
  const [enforcement, setEnforcement] = useState([]);
  const [modeReason, setModeReason] = useState('');
  const [modeSaving, setModeSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setUsersError(false);
    try {
      const [userRows, modeRows] = await Promise.all([
        usuariosLite(),
        listarModosEnforcement().catch(() => [])
      ]);
      setUsers(userRows);
      setEnforcement(modeRows);
    } catch {
      setUsersError(true);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadDetail = useCallback(async (uid) => {
    setDetail({ uid, loading: true, error: false });
    try {
      const [permRows, overrideRows] = await Promise.all([
        permisosEfectivosDe(uid),
        listarOverridesDe(uid)
      ]);
      const perms = [...new Set(permRows.map((r) => r.permission))].sort();
      setDetail({ uid, loading: false, error: false, perms, overrideRows });
    } catch {
      setDetail({ uid, loading: false, error: true });
    }
  }, []);

  const selectUser = useCallback(
    (uid) => {
      setSelected(uid);
      setPending(new Map());
      setSaveError(null);
      setSavedOk(false);
      setModeReason('');
      loadDetail(uid);
    },
    [loadDetail]
  );

  const filtered = useMemo(() => {
    if (!users) return [];
    const t = q.trim().toLowerCase();
    if (!t) return users;
    return users.filter((u) => (u.nombre || '').toLowerCase().includes(t));
  }, [users, q]);

  const selectedUser = users?.find((u) => u.id === selected) || null;
  const selectedDetail = detail && detail.uid === selected ? detail : null;
  const selectedEnforcement = enforcement.find((row) => row.user_id === selected) || {
    mode: 'SHADOW',
    permission_version: 1
  };

  const view = useMemo(() => {
    if (!selectedDetail?.perms) return null;
    const normalized = (selectedDetail.overrideRows || []).map((o) => ({
      screen: o.surface_id,
      access: o.access
    }));
    return buildEffectiveView({
      perms: selectedDetail.perms,
      overrides: normalized,
      privateBetaFlags: { 'panel.routes': false }
    });
  }, [selectedDetail]);

  const changeEnforcement = useCallback(async () => {
    if (!selected || modeSaving) return;
    if (selectedEnforcement.mode !== 'ENFORCE' && !view?.catalogIntegrity?.valid) {
      setSaveError(
        'No se puede activar ENFORCE: la asociación entre módulos y pantallas está incompleta.'
      );
      return;
    }
    const reason = modeReason.trim();
    if (reason.length < 8) {
      setSaveError('Registra un motivo de al menos 8 caracteres para cambiar el modo.');
      return;
    }
    const nextMode = selectedEnforcement.mode === 'ENFORCE' ? 'SHADOW' : 'ENFORCE';
    setModeSaving(true);
    setSaveError(null);
    try {
      await cambiarModoEnforcement(selected, nextMode, reason);
      setModeReason('');
      setSavedOk(true);
      setEnforcement(await listarModosEnforcement());
    } catch (error) {
      setSaveError(error?.message || 'No se pudo cambiar el modo de aplicación.');
    } finally {
      setModeSaving(false);
    }
  }, [modeReason, modeSaving, selected, selectedEnforcement.mode, view]);

  const overridesByScreen = useMemo(() => {
    const map = {};
    for (const o of selectedDetail?.overrideRows || []) {
      if (o.surface_type === 'screen') map[o.surface_id] = o;
    }
    return map;
  }, [selectedDetail]);

  const overridesByFunction = useMemo(() => {
    const map = {};
    for (const o of selectedDetail?.overrideRows || []) {
      if (o.surface_type === 'function') map[o.surface_id] = o;
    }
    return map;
  }, [selectedDetail]);

  const naturalView = useMemo(() => {
    if (!selectedDetail?.perms) return null;
    return buildEffectiveView({
      perms: selectedDetail.perms,
      overrides: [],
      privateBetaFlags: { 'panel.routes': false }
    });
  }, [selectedDetail]);

  const preview = useMemo(() => {
    if (!view || !naturalView || pending.size === 0) return null;
    const values = [...pending.values()];
    const screenPreview = previewPendingChanges(
      view,
      naturalView,
      values
        .filter((item) => item.surfaceType === 'screen')
        .map((item) => ({ screenId: item.surfaceId, access: item.access }))
    );
    const functionChanges = values
      .filter((item) => item.surfaceType === 'function')
      .map((item) => ({
        screenId: item.surfaceId,
        label: FUNCTION_REGISTRY.find((fn) => fn.id === item.surfaceId)?.label || item.surfaceId,
        before: null,
        after: item.access,
        diff: DIFF.SAME,
        risk: FUNCTION_REGISTRY.find((fn) => fn.id === item.surfaceId)?.risk || 'LOW',
        critical: ['HIGH', 'CRITICAL'].includes(
          FUNCTION_REGISTRY.find((fn) => fn.id === item.surfaceId)?.risk
        )
      }));
    return { ...screenPreview, changes: [...screenPreview.changes, ...functionChanges] };
  }, [view, naturalView, pending]);

  const triValueOf = useCallback(
    (screenId) => {
      const p = pending.get(`screen:${screenId}`);
      if (p) return p.access;
      const current = overridesByScreen[screenId];
      return current && current.access !== 'INHERIT' ? current.access : 'INHERIT';
    },
    [pending, overridesByScreen]
  );

  const triValueOfFunction = useCallback(
    (functionId) => {
      const p = pending.get(`function:${functionId}`);
      if (p) return p.access;
      const current = overridesByFunction[functionId];
      return current && current.access !== 'INHERIT' ? current.access : 'INHERIT';
    },
    [pending, overridesByFunction]
  );

  const onTriChange = useCallback(
    (screenId, access) => {
      if (!canEdit || saving) return;
      setSavedOk(false);
      setSaveError(null);
      setPending((prev) => {
        const next = new Map(prev);
        const key = `screen:${screenId}`;
        const current = prev.get(key);
        if (current && current.access === access) {
          next.delete(key);
        } else {
          next.set(key, { surfaceType: 'screen', surfaceId: screenId, access });
        }
        return next;
      });
    },
    [canEdit, saving]
  );

  const onFunctionTriChange = useCallback(
    (functionId, access) => {
      if (!canEdit || saving) return;
      setSavedOk(false);
      setSaveError(null);
      setPending((previous) => {
        const next = new Map(previous);
        const key = `function:${functionId}`;
        const current = previous.get(key);
        if (current && current.access === access) next.delete(key);
        else next.set(key, { surfaceType: 'function', surfaceId: functionId, access });
        return next;
      });
    },
    [canEdit, saving]
  );

  const discardPending = useCallback(() => {
    setPending(new Map());
    setSaveError(null);
    setSavedOk(false);
  }, []);

  const savePending = useCallback(async () => {
    if (!selected || pending.size === 0 || saving) return;
    setSaving(true);
    setSaveError(null);
    setSavedOk(false);
    try {
      for (const p of pending.values()) {
        const res =
          p.access === 'INHERIT'
            ? await deleteOverride(selected, p.surfaceType, p.surfaceId)
            : await upsertOverride(selected, p.surfaceType, p.surfaceId, p.access);
        if (res && res.ok === false) {
          throw new Error(res.error || 'Error al guardar el cambio');
        }
      }
      setPending(new Map());
      setSavedOk(true);
      await loadDetail(selected);
    } catch (e) {
      setSaveError(e.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  }, [selected, pending, saving, loadDetail]);

  return (
    <div className="min-h-screen bg-slate-950 p-3 pb-24 text-slate-200 sm:p-6 sm:pb-28">
      <PageHeader
        icon={ShieldCheck}
        title="Control de Acceso (IAM 2.0)"
        description="Muestra exactamente qué tiene cada usuario: pantallas, origen y comparación con el acceso actual"
        actions={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
              canEdit
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-orange-500/40 bg-orange-500/10 text-orange-400'
            }`}
          >
            {canEdit ? <Pencil size={14} /> : <Eye size={14} />}
            {canEdit ? 'Administración operativa' : 'Solo lectura'}
          </span>
        }
      />

      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
        {canEdit ? (
          <>
            IAM 2.0 operativo: los cambios se guardan como{' '}
            <span className="font-semibold text-slate-300">overrides individuales</span> en{' '}
            <span className="font-mono text-slate-300">iam.user_overrides</span> y no tocan roles ni
            scopes. Cada usuario permanece en <b>SHADOW</b> hasta que un administrador activa
            <b> ENFORCE</b>. Todo cambio muestra su impacto antes de guardar y queda auditado.
          </>
        ) : (
          <>
            Vista efectiva IAM 2.0. Solo un administrador o gestor de usuarios puede modificar
            excepciones o activar su aplicación.
          </>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Usuarios" value={users ? users.length : '…'} />
        <KpiCard label="Módulos" value={MODULE_REGISTRY.length} />
        <KpiCard label="Pantallas" value={SCREEN_REGISTRY.length} />
        <KpiCard label="Funciones" value={FUNCTION_REGISTRY.length} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: 'usuarios', label: 'Usuarios', icon: UsersIcon },
          { id: 'catalogo', label: 'Catálogo', icon: LayoutGrid }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              tab === t.id
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'catalogo' ? (
        <CatalogSection />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
          <div className="space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar usuario…"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
              />
            </div>

            {usersError && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center">
                <AlertTriangle className="text-amber-400" size={20} />
                <p className="text-xs text-slate-400">No se pudo cargar la lista de usuarios.</p>
                <button
                  type="button"
                  onClick={loadUsers}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-100 hover:bg-slate-700"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!usersError &&
              (filtered.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-xs text-slate-500">
                  {q ? `Sin resultados para "${q}"` : 'Sin usuarios'}
                </div>
              ) : (
                <ul className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                  {filtered.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => selectUser(u.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          selected === u.id
                            ? 'border-orange-500/60 bg-orange-500/10'
                            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-black text-orange-400">
                          {initials(u.nombre)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-200">
                            {u.nombre}
                          </div>
                          <div className="truncate font-mono text-[10px] text-slate-500">
                            {u.id}
                          </div>
                        </div>
                        <ChevronRight size={16} className="shrink-0 text-slate-600" />
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
          </div>

          <div>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-sm font-black text-white">
                    {initials(selectedUser.nombre)}
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-100">{selectedUser.nombre}</div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 size={12} />
                      Activo
                    </div>
                  </div>
                </div>
                <div
                  className={`rounded-2xl border p-4 ${
                    selectedEnforcement.mode === 'ENFORCE'
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-blue-500/30 bg-blue-500/5'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Aplicación del IAM
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-black ${
                            selectedEnforcement.mode === 'ENFORCE'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {selectedEnforcement.mode}
                        </span>
                        <span className="text-xs text-slate-400">
                          versión {selectedEnforcement.permission_version || 1}
                        </span>
                      </div>
                      <p className="mt-2 max-w-2xl text-xs text-slate-400">
                        {selectedEnforcement.mode === 'ENFORCE'
                          ? 'Rutas, menús y acciones integradas respetan ALLOW/DENY de este usuario.'
                          : 'Se calcula el acceso nuevo, pero el usuario continúa con el comportamiento legado.'}
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex min-w-[280px] flex-1 items-center justify-end gap-2">
                        <input
                          value={modeReason}
                          onChange={(event) => setModeReason(event.target.value)}
                          placeholder="Motivo obligatorio del cambio"
                          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={changeEnforcement}
                          disabled={modeSaving}
                          className={`rounded-xl px-3 py-2 text-xs font-black text-white disabled:opacity-50 ${
                            selectedEnforcement.mode === 'ENFORCE'
                              ? 'bg-blue-600 hover:bg-blue-500'
                              : 'bg-emerald-600 hover:bg-emerald-500'
                          }`}
                        >
                          {modeSaving
                            ? 'Aplicando…'
                            : selectedEnforcement.mode === 'ENFORCE'
                              ? 'Volver a SHADOW'
                              : 'Activar ENFORCE'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <UserDetail
                  user={selectedUser}
                  view={view}
                  error={selectedDetail?.error}
                  onRetry={() => loadDetail(selected)}
                  canEdit={canEdit}
                  triValueOf={triValueOf}
                  onTriChange={onTriChange}
                  saving={saving}
                  overridesByScreen={overridesByScreen}
                  overridesByFunction={overridesByFunction}
                  triValueOfFunction={triValueOfFunction}
                  onFunctionTriChange={onFunctionTriChange}
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
                <ListTree className="text-slate-600" size={32} />
                <p className="text-sm text-slate-500">
                  Selecciona un usuario para ver su acceso efectivo
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {pending.size > 0 && preview && (
        <div className="fixed bottom-3 left-1/2 z-50 w-[min(96vw,720px)] -translate-x-1/2">
          <div className="rounded-2xl border border-orange-500/40 bg-slate-900/95 p-4 shadow-2xl shadow-black/50 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-100">
                  {preview.changes.length} cambio{preview.changes.length === 1 ? '' : 's'} pendiente
                  {preview.changes.length === 1 ? '' : 's'}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-1.5 text-[11px]">
                  {preview.losses > 0 && (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-bold text-red-300">
                      {preview.losses} pierde(n)
                    </span>
                  )}
                  {preview.gains > 0 && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-bold text-emerald-300">
                      {preview.gains} gana(n)
                    </span>
                  )}
                  {preview.changes.some((c) => c.critical) && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-bold text-amber-300">
                      Incluye pantalla de riesgo alto/crítico
                    </span>
                  )}
                </div>
                {saveError && (
                  <div className="mt-1 text-[11px] font-semibold text-red-400">{saveError}</div>
                )}
                {savedOk && (
                  <div className="mt-1 text-[11px] font-semibold text-emerald-400">
                    Cambios guardados
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={discardPending}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  <Undo2 size={14} />
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={savePending}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Guardar cambios
                </button>
              </div>
            </div>
            <div className="mt-3 max-h-36 space-y-1 overflow-y-auto border-t border-slate-800 pt-2">
              {preview.changes.map((c) => (
                <div key={c.screenId} className="flex items-center gap-2 text-[11px]">
                  <span className="min-w-0 flex-1 truncate text-slate-300">{c.label}</span>
                  <span className="text-slate-500">
                    {c.before ? 'Permitido' : 'Negado'} →{' '}
                    <span className={c.after ? 'text-emerald-400' : 'text-red-400'}>
                      {c.after ? 'Permitido' : 'Negado'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
