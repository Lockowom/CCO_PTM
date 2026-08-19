import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  KeyRound,
  LayoutGrid,
  ListTree,
  Search,
  ShieldCheck,
  AlertTriangle,
  Users as UsersIcon,
  XCircle
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { MODULE_REGISTRY } from '../../domain/access/moduleRegistry.js';
import { SCREEN_REGISTRY } from '../../domain/access/screenRegistry.js';
import { FUNCTION_REGISTRY } from '../../domain/access/functionRegistry.js';
import {
  buildEffectiveView,
  ORIGIN_LABEL,
  ORIGIN_TONE,
  DIFF
} from '../../domain/access/effectiveView.js';
import { usuariosLite, permisosEfectivosDe, listarOverridesDe } from '../../services/iamService';

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
  LOW: 'text-slate-400 border-slate-500/30 bg-slate-500/10'
};

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
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
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

function KpiCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className={`text-2xl font-black ${accent || 'text-slate-100'}`}>{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-400">{label}</div>
    </div>
  );
}

function ScreenRow({ screen, override }) {
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
            {screen.routes.join(' Â· ')}
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
    </li>
  );
}

function ModuleSection({ module, overridesByScreen }) {
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
          {module.screens.filter((s) => s.allow).length}/{module.screens.length}
        </span>
      </button>
      {open && (
        <ul className="space-y-2 border-t border-slate-800 px-3 py-3">
          {module.screens.map((s) => (
            <ScreenRow key={s.id} screen={s} override={overridesByScreen[s.id]} />
          ))}
        </ul>
      )}
    </div>
  );
}

function UserDetail({ user, perms, overrideRows, error, onRetry }) {
  const view = useMemo(() => {
    if (!perms) return null;
    const normalized = overrideRows.map((o) => ({ screen: o.surface_id, access: o.access }));
    return buildEffectiveView({
      perms,
      overrides: normalized,
      privateBetaFlags: { 'panel.routes': false }
    });
  }, [perms, overrideRows]);

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

  const overridesByScreen = {};
  for (const o of overrideRows) overridesByScreen[o.surface_id] = o;

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
            label="PÃ©rdidas vs acceso actual"
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
        {view.modules.map((m) => (
          <ModuleSection key={m.id} module={m} overridesByScreen={overridesByScreen} />
        ))}
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
        Vista efectiva calculada con el resolver IAM 2.0 (precedencia: DenegaciÃ³n explÃ­cita â†’
        Permiso individual â†’ Perfil â†’ Legacy â†’ No asignado). El origen de cada pantalla indica
        quÃ© regla la otorga. ComparaciÃ³n "vs hoy" contra el guard actual.
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
          { id: 'modulos', label: 'MÃ³dulos' },
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
                <th className="px-4 py-3">MÃ³dulo</th>
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
                    {s.routes.join(' Â· ')}
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
                <th className="px-4 py-3">FunciÃ³n</th>
                <th className="px-4 py-3">Pantalla</th>
                <th className="px-4 py-3">MÃ³dulo</th>
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
                    {f.backendAction || 'â€”'}
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
  const [tab, setTab] = useState('usuarios');
  const [q, setQ] = useState('');
  const [users, setUsers] = useState(null);
  const [usersError, setUsersError] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const loadUsers = useCallback(async () => {
    setUsersError(false);
    try {
      setUsers(await usuariosLite());
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

  const filtered = useMemo(() => {
    if (!users) return [];
    const t = q.trim().toLowerCase();
    if (!t) return users;
    return users.filter((u) => (u.nombre || '').toLowerCase().includes(t));
  }, [users, q]);

  const selectedUser = users?.find((u) => u.id === selected) || null;
  const selectedDetail = detail && detail.uid === selected ? detail : null;

  return (
    <div className="min-h-screen bg-slate-950 p-3 text-slate-200 sm:p-6">
      <PageHeader
        icon={ShieldCheck}
        title="Control de Acceso (IAM 2.0)"
        description="Muestra exactamente quÃ© tiene cada usuario: pantallas, origen y comparaciÃ³n con el acceso actual"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400">
            <Eye size={14} />
            Solo lectura
          </span>
        }
      />

      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
        Vista de referencia IAM 2.0. La autoridad real sigue siendo{' '}
        <span className="font-semibold text-slate-300">Admin â†’ Identidad y Seguridad</span>; aquÃ­
        no se modifican permisos, roles ni scopes. Los overrides visibles por pantalla provienen de
        la tabla
        <span className="font-mono text-slate-300"> iam.user_overrides</span>.
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Usuarios" value={users ? users.length : 'â€¦'} />
        <KpiCard label="MÃ³dulos" value={MODULE_REGISTRY.length} />
        <KpiCard label="Pantallas" value={SCREEN_REGISTRY.length} />
        <KpiCard label="Funciones" value={FUNCTION_REGISTRY.length} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: 'usuarios', label: 'Usuarios', icon: UsersIcon },
          { id: 'catalogo', label: 'CatÃ¡logo', icon: LayoutGrid }
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
                placeholder="Buscar usuarioâ€¦"
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
                        onClick={() => {
                          setSelected(u.id);
                          loadDetail(u.id);
                        }}
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
                <UserDetail
                  user={selectedUser}
                  perms={selectedDetail?.perms}
                  overrideRows={selectedDetail?.overrideRows || []}
                  error={selectedDetail?.error}
                  onRetry={() => loadDetail(selected)}
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
    </div>
  );
}
