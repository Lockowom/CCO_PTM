import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCode2,
  GitBranch,
  Layers3,
  Network,
  Search,
  Server,
  ShieldCheck,
  Table2,
  Workflow,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import catalog from '../../data/ccoArchitecture.generated.json';

const KIND_META = {
  module: { label: 'Módulo', icon: Boxes, tone: 'bg-orange-50 text-orange-700 border-orange-200' },
  screen: { label: 'Pantalla', icon: Eye, tone: 'bg-sky-50 text-sky-700 border-sky-200' },
  component: {
    label: 'Componente',
    icon: Layers3,
    tone: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  service: {
    label: 'Servicio',
    icon: Server,
    tone: 'bg-violet-50 text-violet-700 border-violet-200'
  },
  function: {
    label: 'Función',
    icon: Code2,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  action: { label: 'Acción UI', icon: Wrench, tone: 'bg-teal-50 text-teal-700 border-teal-200' },
  table: { label: 'Tabla', icon: Table2, tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  rpc: { label: 'RPC', icon: Database, tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  'edge-function': {
    label: 'Edge Function',
    icon: Zap,
    tone: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  storage: { label: 'Storage', icon: Database, tone: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
};

const MODULE_ORDER = [
  'inbound',
  'inventario',
  'quality',
  'panel',
  'queries',
  'postventa',
  'tms',
  'asistente',
  'admin',
  'public'
];

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function KindBadge({ kind, compact = false }) {
  const meta = KIND_META[kind] || KIND_META.component;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border font-black uppercase tracking-[0.08em] ${meta.tone} ${compact ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-1 text-[9px]'}`}
    >
      <Icon size={compact ? 9 : 11} /> {meta.label}
    </span>
  );
}

function MiniNode({ node, relation, onSelect, direction }) {
  if (!node) return null;
  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className="group w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <KindBadge kind={node.kind} compact />
        <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          {direction === 'in' ? 'entra' : relation}
        </span>
      </div>
      <p className="line-clamp-2 text-xs font-black text-slate-800">
        {node.displayLabel || node.label}
      </p>
      {node.source && <p className="mt-1 truncate text-[9px] text-slate-400">{node.source}</p>}
    </button>
  );
}

function ModuleCard({ node, counts, active, onClick }) {
  const totalLogic = (counts.function || 0) + (counts.action || 0);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${active ? 'border-orange-400 ring-2 ring-orange-100' : 'border-slate-200 hover:border-orange-200'}`}
    >
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: node.color }} />
      <div className="flex items-start justify-between gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-sm"
          style={{ background: node.color }}
        >
          <Boxes size={19} />
        </div>
        <div className="flex items-center gap-1.5">
          {node.status !== 'activo' && (
            <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black uppercase text-amber-700">
              {node.status}
            </span>
          )}
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </div>
      <h3 className="mt-3 text-sm font-black text-slate-900">{node.label}</h3>
      <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-4 text-slate-500">
        {node.description}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg bg-sky-50 px-2 py-1.5 text-center">
          <b className="block text-sm text-sky-700">{counts.screen || 0}</b>
          <span className="text-[8px] font-bold uppercase text-sky-600">pantallas</span>
        </div>
        <div className="rounded-lg bg-emerald-50 px-2 py-1.5 text-center">
          <b className="block text-sm text-emerald-700">{totalLogic}</b>
          <span className="text-[8px] font-bold uppercase text-emerald-600">funciones</span>
        </div>
        <div className="rounded-lg bg-violet-50 px-2 py-1.5 text-center">
          <b className="block text-sm text-violet-700">{(counts.table || 0) + (counts.rpc || 0)}</b>
          <span className="text-[8px] font-bold uppercase text-violet-600">datos</span>
        </div>
      </div>
    </button>
  );
}

function NodeDetail({ node, incoming, outgoing, nodeById, onSelect, onClose, onNavigate }) {
  if (!node) return null;
  const related = [...incoming, ...outgoing];
  return (
    <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-3 xl:max-h-[calc(100dvh-120px)] xl:overflow-y-auto">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <KindBadge kind={node.kind} />
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Cerrar detalle"
          >
            <X size={16} />
          </button>
        </div>
        <h2 className="mt-3 break-words text-lg font-black text-slate-950">
          {node.displayLabel || node.label}
        </h2>
        {node.signature && (
          <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-[10px] text-emerald-300">
            {node.signature}
          </code>
        )}
        <p className="mt-3 text-xs leading-5 text-slate-600">{node.description}</p>
      </div>

      <div className="space-y-4 p-4">
        {node.route && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Ruta</p>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-100 px-2.5 py-2 text-[10px] text-slate-700">
                {node.route}
              </code>
              <button
                type="button"
                onClick={() => onNavigate(node.route)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-white hover:bg-orange-500"
                title="Abrir pantalla"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        )}

        {node.permissions?.length > 0 && (
          <div>
            <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
              <ShieldCheck size={11} /> Permisos
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {node.permissions.map((permission) => (
                <span
                  key={permission}
                  className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.operations?.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
              Operaciones
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {node.operations.map((operation) => (
                <span
                  key={operation}
                  className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700"
                >
                  {operation}
                </span>
              ))}
            </div>
          </div>
        )}

        {(node.owner || node.source) && (
          <div className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
            {node.owner && (
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400">Responsable</span>
                <p className="mt-0.5 text-[11px] font-bold text-slate-700">{node.owner}</p>
              </div>
            )}
            {node.source && (
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400">
                  Archivo fuente
                </span>
                <p className="mt-0.5 break-all font-mono text-[9px] text-slate-600">
                  {node.source}
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
              <GitBranch size={11} /> Conexiones directas
            </p>
            <span className="text-[10px] font-black text-slate-500">{related.length}</span>
          </div>
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {related.length === 0 && (
              <p className="rounded-lg bg-slate-50 p-3 text-[10px] text-slate-400">
                Sin conexiones registradas.
              </p>
            )}
            {incoming.map((edge) => {
              const relatedNode = nodeById.get(edge.from);
              return (
                <button
                  key={`in-${edge.id}`}
                  type="button"
                  onClick={() => onSelect(edge.from)}
                  className="flex w-full items-center gap-2 rounded-lg border border-slate-100 p-2 text-left hover:border-orange-200 hover:bg-orange-50/40"
                >
                  <ArrowRight size={12} className="shrink-0 text-orange-500" />
                  <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-slate-700">
                    {relatedNode?.displayLabel || relatedNode?.label}
                  </span>
                  <span className="text-[8px] uppercase text-slate-400">{edge.relation}</span>
                </button>
              );
            })}
            {outgoing.map((edge) => {
              const relatedNode = nodeById.get(edge.to);
              return (
                <button
                  key={`out-${edge.id}`}
                  type="button"
                  onClick={() => onSelect(edge.to)}
                  className="flex w-full items-center gap-2 rounded-lg border border-slate-100 p-2 text-left hover:border-orange-200 hover:bg-orange-50/40"
                >
                  <ArrowLeft size={12} className="shrink-0 text-sky-500" />
                  <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-slate-700">
                    {relatedNode?.displayLabel || relatedNode?.label}
                  </span>
                  <span className="text-[8px] uppercase text-slate-400">{edge.relation}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function ArchitectureExplorer({ onOpenFlow }) {
  const navigate = useNavigate();
  const [view, setView] = useState('overview');
  const [moduleId, setModuleId] = useState('all');
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const nodeById = useMemo(() => new Map(catalog.nodes.map((node) => [node.id, node])), []);
  const incomingById = useMemo(() => {
    const map = new Map();
    for (const edge of catalog.connections) {
      const list = map.get(edge.to) || [];
      list.push(edge);
      map.set(edge.to, list);
    }
    return map;
  }, []);
  const outgoingById = useMemo(() => {
    const map = new Map();
    for (const edge of catalog.connections) {
      const list = map.get(edge.from) || [];
      list.push(edge);
      map.set(edge.from, list);
    }
    return map;
  }, []);

  const modules = useMemo(
    () => MODULE_ORDER.map((id) => nodeById.get(`module:${id}`)).filter(Boolean),
    [nodeById]
  );
  const selectedNode = selectedId ? nodeById.get(selectedId) : null;
  const selectedIncoming = selectedId ? incomingById.get(selectedId) || [] : [];
  const selectedOutgoing = selectedId ? outgoingById.get(selectedId) || [] : [];
  const term = normalize(query.trim());

  const filteredNodes = useMemo(() => {
    return catalog.nodes.filter((node) => {
      if (node.kind === 'module') return false;
      if (moduleId !== 'all' && node.module !== moduleId) return false;
      if (kind !== 'all' && node.kind !== kind) return false;
      if (!term) return true;
      return normalize(
        [
          node.label,
          node.displayLabel,
          node.description,
          node.route,
          node.source,
          ...(node.permissions || [])
        ].join(' ')
      ).includes(term);
    });
  }, [kind, moduleId, term]);

  const activeModule = moduleId === 'all' ? null : nodeById.get(`module:${moduleId}`);
  const flowNode = selectedNode || activeModule || nodeById.get('module:panel');
  const flowIncoming = flowNode ? incomingById.get(flowNode.id) || [] : [];
  const flowOutgoing = flowNode ? outgoingById.get(flowNode.id) || [] : [];

  const chooseModule = (id) => {
    setModuleId(id);
    setSelectedId(`module:${id}`);
    setView('connections');
  };

  const exportCatalog = () => {
    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arquitectura-cco-${catalog.meta.fingerprint}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="anim-fade-up mx-[calc(50%-50vw)] min-h-[calc(100dvh-88px)] bg-slate-50/70 px-3 pb-8 sm:px-5 lg:px-7">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-950/30">
                <Network size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-black sm:text-xl">Arquitectura funcional CCO</h1>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                    sincronizado con código
                  </span>
                </div>
                <p className="mt-1 max-w-3xl text-[11px] leading-4 text-slate-300">
                  Navega desde cada módulo hasta sus pantallas, funciones, RPC, tablas y
                  automatizaciones.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportCatalog}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold hover:bg-white/15"
              >
                <Download size={14} /> Exportar catálogo
              </button>
              <button
                type="button"
                onClick={onOpenFlow}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-[11px] font-black hover:bg-orange-600"
              >
                <Workflow size={14} /> Abrir flujo operativo
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          {[
            ['Módulos', catalog.meta.totals.module, Boxes, 'text-orange-600'],
            ['Pantallas', catalog.meta.totals.screen, Eye, 'text-sky-600'],
            [
              'Funciones',
              catalog.meta.totals.function + catalog.meta.totals.action,
              Code2,
              'text-emerald-600'
            ],
            ['Servicios', catalog.meta.totals.service, Server, 'text-violet-600'],
            [
              'Datos / RPC',
              catalog.meta.totals.table + catalog.meta.totals.rpc,
              Database,
              'text-amber-600'
            ],
            ['Conexiones', catalog.connections.length, GitBranch, 'text-rose-600']
          ].map(([label, value, Icon, tone]) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <Icon size={17} className={tone} />
              <div>
                <b className="block text-base leading-none text-slate-900">{value}</b>
                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex rounded-xl bg-slate-100 p-1">
            {[
              ['overview', 'Vista general', Boxes],
              ['connections', 'Conexiones', GitBranch],
              ['catalog', 'Catálogo técnico', FileCode2]
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black transition sm:flex-none ${view === id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => query && setView('catalog')}
              placeholder="Buscar módulo, pantalla, función, tabla, RPC, ruta o permiso…"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-9 text-xs outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={moduleId}
            onChange={(event) => {
              setModuleId(event.target.value);
              setSelectedId(event.target.value === 'all' ? null : `module:${event.target.value}`);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-bold text-slate-700 outline-none focus:border-orange-400"
          >
            <option value="all">Todos los módulos</option>
            {modules.map((module) => (
              <option key={module.id} value={module.module}>
                {module.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {view === 'overview' && (
        <section className="mt-3">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Construcción completa por dominio
              </h2>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Selecciona un módulo para recorrer todas sus dependencias técnicas.
              </p>
            </div>
            <span className="hidden text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:block">
              Huella {catalog.meta.fingerprint}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                node={module}
                counts={catalog.countsByModule[module.module] || {}}
                active={moduleId === module.module}
                onClick={() => chooseModule(module.module)}
              />
            ))}
          </div>
        </section>
      )}

      {view === 'connections' && flowNode && (
        <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-600">
                    Trazabilidad de conexión
                  </p>
                  <h2 className="mt-1 text-base font-black text-slate-900">
                    {flowNode.displayLabel || flowNode.label}
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">
                  {flowIncoming.length} entradas · {flowOutgoing.length} salidas
                </span>
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-50/70 p-4 sm:p-5">
              <div className="grid min-w-[720px] grid-cols-[1fr_46px_1.08fr_46px_1fr] items-start gap-2">
                <div>
                  <p className="mb-2 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Quién lo usa / entrada
                  </p>
                  <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                    {flowIncoming.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-[10px] text-slate-400">
                        Inicio del flujo
                      </div>
                    ) : (
                      flowIncoming.map((edge) => (
                        <MiniNode
                          key={edge.id}
                          node={nodeById.get(edge.from)}
                          relation={edge.relation}
                          direction="in"
                          onSelect={setSelectedId}
                        />
                      ))
                    )}
                  </div>
                </div>
                <div className="grid min-h-28 place-items-center text-orange-400">
                  <ArrowRight size={22} />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(flowNode.id)}
                  className="relative mt-8 overflow-hidden rounded-2xl border-2 border-orange-400 bg-white p-5 text-center shadow-xl shadow-orange-100"
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-orange-500" />
                  <KindBadge kind={flowNode.kind} />
                  <h3 className="mt-3 break-words text-sm font-black text-slate-950">
                    {flowNode.displayLabel || flowNode.label}
                  </h3>
                  <p className="mt-2 line-clamp-4 text-[10px] leading-4 text-slate-500">
                    {flowNode.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase text-orange-600">
                    Ver ficha completa <ChevronRight size={11} />
                  </span>
                </button>
                <div className="grid min-h-28 place-items-center text-sky-400">
                  <ArrowRight size={22} />
                </div>
                <div>
                  <p className="mb-2 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Qué ejecuta / salida
                  </p>
                  <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                    {flowOutgoing.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-[10px] text-slate-400">
                        Fin del flujo
                      </div>
                    ) : (
                      flowOutgoing.map((edge) => (
                        <MiniNode
                          key={edge.id}
                          node={nodeById.get(edge.to)}
                          relation={edge.relation}
                          direction="out"
                          onSelect={setSelectedId}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <NodeDetail
            node={selectedNode || flowNode}
            incoming={selectedNode ? selectedIncoming : flowIncoming}
            outgoing={selectedNode ? selectedOutgoing : flowOutgoing}
            nodeById={nodeById}
            onSelect={setSelectedId}
            onClose={() => setSelectedId(activeModule?.id || null)}
            onNavigate={(route) => navigate(route)}
          />
        </section>
      )}

      {view === 'catalog' && (
        <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Catálogo técnico verificable</h2>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {filteredNodes.length} elementos coinciden con los filtros actuales.
                </p>
              </div>
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold outline-none focus:border-orange-400"
              >
                <option value="all">Todos los tipos</option>
                {Object.entries(KIND_META)
                  .filter(([id]) => id !== 'module')
                  .map(([id, meta]) => (
                    <option key={id} value={id}>
                      {meta.label}
                    </option>
                  ))}
              </select>
            </div>
            <div className="max-h-[calc(100dvh-310px)] min-h-[420px] divide-y divide-slate-100 overflow-y-auto">
              {filteredNodes.slice(0, 300).map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50/50 ${selectedId === node.id ? 'bg-orange-50' : ''}`}
                >
                  <KindBadge kind={node.kind} compact />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-slate-800">
                      {node.displayLabel || node.label}
                    </p>
                    <p className="mt-0.5 truncate text-[9px] text-slate-400">
                      {node.route || node.signature || node.source || node.description}
                    </p>
                  </div>
                  <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase text-slate-500 sm:block">
                    {node.module}
                  </span>
                  <ChevronRight size={14} className="shrink-0 text-slate-300" />
                </button>
              ))}
              {filteredNodes.length > 300 && (
                <div className="bg-amber-50 p-3 text-center text-[10px] font-bold text-amber-700">
                  Se muestran los primeros 300 resultados. Usa la búsqueda o los filtros para
                  acotar.
                </div>
              )}
              {filteredNodes.length === 0 && (
                <div className="grid min-h-72 place-items-center p-6 text-center">
                  <div>
                    <Search size={28} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-black text-slate-600">Sin coincidencias</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Prueba con otra función, tabla, RPC o permiso.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {selectedNode ? (
            <NodeDetail
              node={selectedNode}
              incoming={selectedIncoming}
              outgoing={selectedOutgoing}
              nodeById={nodeById}
              onSelect={setSelectedId}
              onClose={() => setSelectedId(null)}
              onNavigate={(route) => navigate(route)}
            />
          ) : (
            <aside className="hidden rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center xl:grid xl:place-items-center">
              <div>
                <Activity size={26} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-black text-slate-600">Selecciona un elemento</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  Verás su finalidad, archivo, permisos y todas sus conexiones directas.
                </p>
              </div>
            </aside>
          )}
        </section>
      )}

      <footer className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5 font-bold">
          <CheckCircle2 size={14} /> Catálogo generado automáticamente desde rutas, servicios y
          Supabase.
        </span>
        <span>
          Esquema v{catalog.meta.schemaVersion} · Proyecto {catalog.meta.sourceVersion} ·{' '}
          {catalog.meta.fingerprint}
        </span>
      </footer>
    </div>
  );
}
