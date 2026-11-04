import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList,
  Search,
  Loader2,
  X,
  Trash2,
  AlertTriangle,
  PackageCheck,
  UserPlus,
  FileText,
  Ban,
  ArrowRight,
  MapPin,
  PackageSearch,
  Layers3,
  ClipboardCheck
} from 'lucide-react';
import {
  fetchCandidatos,
  useAsignacionesCalidad,
  useCrearAsignacion,
  useAnularAsignacion,
  useEliminarAsignacionCalidad,
  ESTADO_ASIGNACION_META
} from '../../services/calidadService';
import { useAuth } from '../../context/AuthContext';
import {
  assignmentItems,
  assignmentLocations,
  assignmentReference,
  buildProductExplorerRows,
  filterAndSortAssignments,
  matchesProductQuery
} from '../../domain/quality/assignmentExplorer';

// ── Modal: Inventario arma la asignación (busca stock y elige SKUs) ─────────
const AsignarModal = ({ onClose }) => {
  const crear = useCrearAsignacion();
  const [query, setQuery] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [candidatos, setCandidatos] = useState([]);
  const [sel, setSel] = useState([]); // SKUs elegidos
  const [motivo, setMotivo] = useState('');
  const [prioridad, setPrioridad] = useState('NORMAL');

  const buscar = useCallback(async () => {
    setBuscando(true);
    try {
      setCandidatos(await fetchCandidatos(query, false));
    } catch (e) {
      toast.error(`Error buscando stock: ${e.message}`);
    } finally {
      setBuscando(false);
    }
  }, [query]);

  const keyOf = (c) => `${c.codigo_producto}|${c.partida || ''}|${c.ubicacion || ''}`;
  const toSelection = (c) => ({
    _key: keyOf(c),
    codigo_producto: c.codigo_producto,
    producto: c.producto || '',
    ubicacion: c.ubicacion || '',
    partida: c.partida || '',
    cantidad: Number(c.disponible) || 0,
    unidad_medida: c.unidad_medida || 'UN',
    tipo: c.tipo || 'NO_PERECIBLE',
    fecha_vencimiento: c.fecha_vencimiento || null,
    semaforo: c.semaforo || 'NA'
  });
  const add = (c) => {
    const k = keyOf(c);
    if (sel.some((s) => s._key === k)) {
      toast.info('Ese SKU ya está en la asignación');
      return;
    }
    setSel((prev) => [...prev, toSelection(c)]);
  };
  const remove = (k) => setSel((prev) => prev.filter((s) => s._key !== k));
  const toggle = (c) => {
    const key = keyOf(c);
    if (sel.some((item) => item._key === key)) remove(key);
    else add(c);
  };
  const selectAllResults = () => {
    const allSelected = candidatos.every((candidate) =>
      sel.some((item) => item._key === keyOf(candidate))
    );
    if (allSelected) {
      const resultKeys = new Set(candidatos.map(keyOf));
      setSel((prev) => prev.filter((item) => !resultKeys.has(item._key)));
      return;
    }
    setSel((prev) => {
      const known = new Set(prev.map((item) => item._key));
      const missing = candidatos.map(toSelection).filter((item) => {
        if (known.has(item._key)) return false;
        known.add(item._key);
        return true;
      });
      return [...prev, ...missing];
    });
  };

  const enviar = async () => {
    if (sel.length === 0) {
      toast.error('Elige al menos un SKU');
      return;
    }
    try {
      const skus = sel.map(({ _key, ...rest }) => rest);
      await crear.mutateAsync({ skus, motivo, prioridad });
      toast.success(`${skus.length} SKU(s) asignados a Calidad`);
      onClose();
    } catch (e) {
      toast.error(`No se pudo asignar: ${e.message}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <UserPlus size={18} className="text-emerald-600" /> Asignar SKUs a Calidad
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Buscador */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-emerald-400">
              <Search size={16} className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscar()}
                placeholder="Buscar por SKU, descripción o ubicación…"
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
            <button
              onClick={buscar}
              disabled={buscando}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {buscando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}{' '}
              Buscar
            </button>
          </div>

          {/* Resultados */}
          {candidatos.length > 0 && (
            <div className="border border-slate-100 rounded-xl max-h-60 overflow-y-auto">
              <label className="sticky top-0 z-10 flex cursor-pointer items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
                <input
                  type="checkbox"
                  checked={candidatos.every((candidate) =>
                    sel.some((item) => item._key === keyOf(candidate))
                  )}
                  onChange={selectAllResults}
                  className="h-4 w-4 accent-emerald-600"
                />
                Seleccionar todos los resultados ({candidatos.length})
              </label>
              {candidatos.map((c, i) => (
                <label
                  key={i}
                  className="flex w-full cursor-pointer items-center gap-3 border-b border-slate-50 px-3 py-2 text-left hover:bg-emerald-50/50"
                >
                  <input
                    type="checkbox"
                    checked={sel.some((item) => item._key === keyOf(c))}
                    onChange={() => toggle(c)}
                    className="h-4 w-4 shrink-0 accent-emerald-600"
                  />
                  <span className="min-w-0">
                    <span className="font-bold text-sm text-slate-800 truncate block">
                      {c.codigo_producto} · {c.producto}
                    </span>
                    <span className="text-xs text-slate-400">
                      {c.ubicacion || 's/ubic'} · {c.partida || 's/partida'} · {c.disponible}{' '}
                      {c.unidad_medida}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Seleccionados */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              SKUs a asignar ({sel.length})
            </p>
            {sel.length === 0 ? (
              <p className="text-xs text-slate-400">
                Busca y agrega los SKUs que Calidad debe revisar.
              </p>
            ) : (
              <div className="space-y-1.5">
                {sel.map((s) => (
                  <div
                    key={s._key}
                    className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2"
                  >
                    <span className="min-w-0">
                      <span className="font-bold text-sm text-slate-800 truncate block">
                        {s.codigo_producto} · {s.producto}
                      </span>
                      <span className="text-xs text-slate-400">
                        {s.ubicacion || 's/ubic'} · {s.partida || 's/partida'} · {s.cantidad}{' '}
                        {s.unidad_medida}
                      </span>
                    </span>
                    <button
                      onClick={() => remove(s._key)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Motivo + prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Motivo de la revisión
              </label>
              <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. próximo a vencer / daño detectado / reclamo"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Prioridad
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={enviar}
            disabled={crear.isPending || sel.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-40"
          >
            {crear.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}{' '}
            Asignar a Calidad
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({
  assignment,
  user,
  isAdmin,
  canAssign,
  canManageQuality,
  onAnular,
  onEliminar,
  onGenerarInforme,
  onAbrirInforme,
  focused
}) => {
  const meta = ESTADO_ASIGNACION_META[assignment.estado] || {};
  const skus = assignmentItems(assignment);
  const estancias = assignmentLocations(assignment);
  const abierta = assignment.estado === 'PENDIENTE' || assignment.estado === 'EN_PROCESO';
  const lockActive =
    abierta &&
    assignment.locked_by &&
    assignment.locked_at &&
    Date.now() - new Date(assignment.locked_at).getTime() < 15 * 60 * 1000;
  const lockedByOther = lockActive && assignment.locked_by !== user?.id;
  const progress =
    assignment.estado === 'RESUELTA' ? 100 : assignment.estado === 'EN_PROCESO' ? 66 : 33;

  return (
    <article
      className={`quality-mobile-card relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[.99] ${focused ? 'ring-2 ring-emerald-400 ring-offset-2' : ''} ${assignment.estado === 'EN_PROCESO' ? 'border-blue-200' : abierta ? 'border-amber-200' : 'border-emerald-200'}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-slate-100">
        <div
          className={`h-full transition-all ${assignment.estado === 'RESUELTA' ? 'bg-emerald-500' : assignment.estado === 'EN_PROCESO' ? 'bg-blue-500' : 'bg-amber-400'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${meta.cls}`}
        >
          {meta.label || assignment.estado}
        </span>
        <div className="flex items-center gap-1.5">
          {assignment.prioridad === 'URGENTE' && assignment.estado !== 'RESUELTA' && (
            <span className="flex items-center gap-1 rounded-md border border-rose-200 bg-rose-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-rose-700">
              <AlertTriangle size={11} /> Urgente
            </span>
          )}
          {isAdmin && (
            <button
              onClick={() => onEliminar(assignment)}
              title="Eliminar (admin)"
              className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-100 hover:text-rose-600"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-black tracking-wide text-slate-500">
          {assignmentReference(assignment)}
        </span>
        <span className="text-[10px] font-bold text-slate-400">{progress}% del flujo</span>
      </div>
      <p className="text-sm font-black text-slate-800">
        {skus.length} SKU(s) · {estancias.length} estancia(s)
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
        {skus
          .slice(0, 3)
          .map((sku) => sku.producto || sku.codigo_producto)
          .join(' · ')}
        {skus.length > 3 ? '…' : ''}
      </p>
      {estancias.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {estancias.slice(0, 4).map((ubicacion) => (
            <span
              key={ubicacion}
              className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700"
            >
              <MapPin size={10} /> {ubicacion}
            </span>
          ))}
          {estancias.length > 4 && (
            <span className="px-1 py-1 text-[10px] font-bold text-slate-400">
              +{estancias.length - 4}
            </span>
          )}
        </div>
      )}
      {assignment.motivo && (
        <p className="mt-2 text-xs italic text-slate-400">“{assignment.motivo}”</p>
      )}
      <p className="mt-2 text-[11px] text-slate-400">
        {assignment.asignado_nombre ? `Por ${assignment.asignado_nombre}` : 'Inventario'} ·{' '}
        {assignment.created_at ? new Date(assignment.created_at).toLocaleDateString('es-CL') : ''}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-50 p-1.5 text-center text-[9px] font-black uppercase tracking-wide">
        <span className="rounded-lg bg-amber-100 px-1 py-1.5 text-amber-700">1 · Asignada</span>
        <span
          className={`rounded-lg px-1 py-1.5 ${progress >= 66 ? 'bg-blue-100 text-blue-700' : 'text-slate-300'}`}
        >
          2 · Revisión
        </span>
        <span
          className={`rounded-lg px-1 py-1.5 ${progress === 100 ? 'bg-emerald-100 text-emerald-700' : 'text-slate-300'}`}
        >
          3 · Informe
        </span>
      </div>
      {assignment.informe && (
        <button
          onClick={() => onAbrirInforme(assignment.informe.id)}
          className="mt-2 flex w-full items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-2 text-left text-[11px] font-bold text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
        >
          <FileText size={12} /> Informe {assignment.informe.numero || 'vinculado'} ·{' '}
          {assignment.informe.estado || 'emitido'}
        </button>
      )}
      {lockActive && (
        <div
          className={`mt-2 rounded-lg border px-2.5 py-2 text-[11px] font-bold ${lockedByOther ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
        >
          🔒 {lockedByOther ? 'En proceso por' : 'Tarea tomada por'}{' '}
          {assignment.locked_by_name || 'otro usuario'} desde las{' '}
          {new Date(assignment.locked_at).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
      {abierta && (
        <div className="mt-3 flex flex-wrap gap-2">
          {canManageQuality && (
            <button
              onClick={() => onGenerarInforme(assignment)}
              title={lockedByOther ? 'El sistema verificará el bloqueo antes de abrir' : ''}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-white ${lockedByOther ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              <FileText size={14} /> Generar informe / dictamen <ArrowRight size={14} />
            </button>
          )}
          {canAssign && (
            <button
              onClick={() => onAnular(assignment)}
              title="Anular"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <Ban size={14} />
            </button>
          )}
        </div>
      )}
      {assignment.estado === 'RESUELTA' && (
        <p className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
          <ClipboardCheck size={12} /> Resuelta
          {assignment.resuelto_nombre ? ` por ${assignment.resuelto_nombre}` : ''}
        </p>
      )}
    </article>
  );
};

const ProductExplorer = ({ products, selectedKey, onSelect, onOpenTask, onAbrirInforme }) => {
  const selected = products.find((product) => product.key === selectedKey) || products[0];
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-400">
        No hay SKU, descripción, estancia o informe que coincida con la búsqueda.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,.85fr)]">
      <div className="space-y-2">
        {products.map((product) => (
          <button
            key={product.key}
            onClick={() => onSelect(product.key)}
            className={`w-full rounded-2xl border p-4 text-left transition ${selected?.key === product.key ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50'}`}
          >
            <div className="flex gap-3">
              <span className="mt-0.5 rounded-xl bg-slate-900 p-2 text-white">
                <PackageSearch size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-slate-800">{product.codigo}</strong>
                <span className="mt-0.5 block line-clamp-2 text-xs text-slate-500">
                  {product.producto}
                </span>
                <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                  <span>{product.estancias.length} estancia(s)</span>
                  <span>{product.tareas.length} tarea(s)</span>
                  <span>{product.informes.length} informe(s)</span>
                </span>
              </span>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
            Ficha de trazabilidad
          </p>
          <h4 className="mt-1 text-base font-black text-slate-800">{selected.codigo}</h4>
          <p className="mt-0.5 text-sm text-slate-500">{selected.producto}</p>
          <section className="mt-5">
            <p className="flex items-center gap-1.5 text-xs font-black text-slate-700">
              <MapPin size={14} className="text-sky-600" /> Estancias ({selected.estancias.length})
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selected.estancias.map((stay) => (
                <span
                  key={`${stay.ubicacion}|${stay.partida || ''}`}
                  className="rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700"
                >
                  {stay.ubicacion}
                  {stay.partida ? ` · ${stay.partida}` : ''}
                </span>
              ))}
            </div>
          </section>
          <section className="mt-5">
            <p className="flex items-center gap-1.5 text-xs font-black text-slate-700">
              <Layers3 size={14} className="text-amber-600" /> Tareas vinculadas (
              {selected.tareas.length})
            </p>
            <div className="mt-2 space-y-2">
              {selected.tareas.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onOpenTask(task.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <span>
                    <strong className="block font-mono text-[11px] text-slate-700">
                      {assignmentReference(task)}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {ESTADO_ASIGNACION_META[task.estado]?.label || task.estado}
                    </span>
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </button>
              ))}
            </div>
          </section>
          <section className="mt-5">
            <p className="flex items-center gap-1.5 text-xs font-black text-slate-700">
              <FileText size={14} className="text-emerald-600" /> Informes generados (
              {selected.informes.length})
            </p>
            {selected.informes.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">
                Aún no hay informe vinculado para este SKU.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {selected.informes.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => onAbrirInforme(report.id)}
                    className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-left hover:border-emerald-300 hover:bg-emerald-100"
                  >
                    <strong className="block text-xs text-emerald-800">
                      {report.numero || 'Informe vinculado'}
                    </strong>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {report.estado || 'Emitido'}
                      {report.fecha
                        ? ` · ${new Date(report.fecha).toLocaleDateString('es-CL')}`
                        : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </aside>
      )}
    </div>
  );
};

// ── Panel de asignaciones (cola de tareas del hito 2) ───────────────────────
const AsignacionesPanel = ({ canAssign, canManageQuality, onGenerarInforme, onAbrirInforme }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const { data: asignaciones = [], isLoading } = useAsignacionesCalidad();
  const anular = useAnularAsignacion();
  const eliminar = useEliminarAsignacionCalidad();
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('TODAS');
  const [vista, setVista] = useState('TAREAS');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [tareaEnFoco, setTareaEnFoco] = useState(null);

  const anularAsig = async (assignment) => {
    if (!confirm('¿Anular esta asignación? No se podrá revertir.')) return;
    try {
      await anular.mutateAsync(assignment.id);
      toast.success('Asignación anulada');
    } catch (error) {
      toast.error(`No se pudo anular: ${error.message}`);
    }
  };
  const borrarAsig = async (assignment) => {
    if (!confirm('¿Eliminar esta asignación definitivamente? Esta acción no se puede deshacer.'))
      return;
    try {
      await eliminar.mutateAsync(assignment.id);
      toast.success('Asignación eliminada');
    } catch (error) {
      toast.error(`No se pudo eliminar: ${error.message}`);
    }
  };

  const pendientes = asignaciones.filter(
    (assignment) => assignment.estado === 'PENDIENTE' || assignment.estado === 'EN_PROCESO'
  ).length;
  const resueltas = asignaciones.filter((assignment) => assignment.estado === 'RESUELTA').length;
  const visibles = useMemo(
    () => filterAndSortAssignments(asignaciones, { query: busqueda, state: estado }),
    [asignaciones, busqueda, estado]
  );
  const products = useMemo(
    () =>
      buildProductExplorerRows(filterAndSortAssignments(asignaciones, { state: estado })).filter(
        (product) => matchesProductQuery(product, busqueda)
      ),
    [asignaciones, busqueda, estado]
  );

  const abrirTarea = (taskId) => {
    setVista('TAREAS');
    setTareaEnFoco(taskId);
  };

  return (
    <div className="mb-6 space-y-4 anim-fade-up">
      <section className="quality-mobile-hero overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl shadow-emerald-950/10">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
              <ClipboardList size={13} /> Hito 2 · Estancia
            </span>
            <h3 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">
              Tareas, estancias e informes conectados
            </h3>
            <p className="mt-1 max-w-xl text-xs text-slate-300 sm:text-sm">
              Consulta una tarea completa o parte desde un SKU para ver todas sus estancias,
              revisiones e informes sin duplicar el flujo operativo.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['Total', asignaciones.length],
              ['En curso', pendientes],
              ['Resueltas', resueltas]
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-w-20 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center"
              >
                <strong className="block text-xl font-black tabular-nums">{value}</strong>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-400 focus-within:bg-white">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar SKU, descripción, ubicación, tarea o informe…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} title="Limpiar búsqueda">
                <X size={15} />
              </button>
            )}
          </label>
          <select
            value={estado}
            onChange={(event) => setEstado(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-emerald-400"
          >
            <option value="TODAS">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="RESUELTA">Resueltas</option>
            <option value="ANULADA">Anuladas</option>
          </select>
          {canAssign && (
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800"
            >
              <UserPlus size={16} /> Asignar SKUs a Calidad
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {[
            ['TAREAS', ClipboardList, 'Bandeja por tarea'],
            ['PRODUCTOS', PackageSearch, 'Consulta por SKU']
          ].map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setVista(id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${vista === id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
          <span className="self-center text-[11px] font-bold text-slate-400">
            {vista === 'TAREAS' ? `${visibles.length} tarea(s)` : `${products.length} SKU(s)`}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-emerald-500" size={26} />
        </div>
      ) : asignaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <PackageCheck size={30} className="mx-auto mb-2 text-slate-200" />
          <p className="text-sm font-bold text-slate-400">Sin revisiones asignadas</p>
          <p className="text-xs text-slate-300">
            {canAssign
              ? 'Usa “Asignar SKUs a Calidad” para enviar productos a revisión.'
              : 'Inventario aún no ha asignado revisiones.'}
          </p>
        </div>
      ) : vista === 'PRODUCTOS' ? (
        <ProductExplorer
          products={products}
          selectedKey={productoSeleccionado}
          onSelect={setProductoSeleccionado}
          onOpenTask={abrirTarea}
          onAbrirInforme={onAbrirInforme}
        />
      ) : visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-400">
          No hay tarea que coincida con la búsqueda o el estado seleccionado.
        </p>
      ) : (
        <div className="anim-stagger grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibles.map((assignment) => (
            <TaskCard
              key={assignment.id}
              assignment={assignment}
              user={user}
              isAdmin={isAdmin}
              canAssign={canAssign}
              canManageQuality={canManageQuality}
              onAnular={anularAsig}
              onEliminar={borrarAsig}
              onGenerarInforme={onGenerarInforme}
              onAbrirInforme={onAbrirInforme}
              focused={tareaEnFoco === assignment.id}
            />
          ))}
        </div>
      )}
      {modal && <AsignarModal onClose={() => setModal(false)} />}
    </div>
  );
};

export default AsignacionesPanel;
