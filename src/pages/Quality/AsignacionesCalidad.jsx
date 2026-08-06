import { useState, useCallback } from 'react';
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
  ArrowRight
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

// ── Panel de asignaciones (cola de tareas del hito 2) ───────────────────────
const AsignacionesPanel = ({ canAssign, canManageQuality, onGenerarInforme }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const { data: asignaciones = [], isLoading } = useAsignacionesCalidad();
  const anular = useAnularAsignacion();
  const eliminar = useEliminarAsignacionCalidad();
  const [modal, setModal] = useState(false);

  const anularAsig = async (a) => {
    if (!confirm('¿Anular esta asignación? No se podrá revertir.')) return;
    try {
      await anular.mutateAsync(a.id);
      toast.success('Asignación anulada');
    } catch (e) {
      toast.error(`No se pudo anular: ${e.message}`);
    }
  };
  const borrarAsig = async (a) => {
    if (!confirm('¿Eliminar esta asignación definitivamente? Esta acción no se puede deshacer.'))
      return;
    try {
      await eliminar.mutateAsync(a.id);
      toast.success('Asignación eliminada');
    } catch (e) {
      toast.error(`No se pudo eliminar: ${e.message}`);
    }
  };

  const pendientes = asignaciones.filter(
    (a) => a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO'
  ).length;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
          <ClipboardList size={16} className="text-emerald-500" /> Revisiones asignadas por
          Inventario
          {pendientes > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {pendientes} pendiente(s)
            </span>
          )}
        </h3>
        {canAssign && (
          <button
            onClick={() => setModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800"
          >
            <UserPlus size={16} /> Asignar SKUs a Calidad
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-emerald-500" size={26} />
        </div>
      ) : asignaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <PackageCheck size={30} className="text-slate-200 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-400">Sin revisiones asignadas</p>
          <p className="text-xs text-slate-300">
            {canAssign
              ? 'Usa “Asignar SKUs a Calidad” para enviar productos a revisión.'
              : 'Inventario aún no ha asignado revisiones.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {asignaciones.map((a) => {
            const meta = ESTADO_ASIGNACION_META[a.estado] || {};
            const skus = Array.isArray(a.skus) ? a.skus : [];
            const abierta = a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO';
            const lockActive =
              abierta &&
              a.locked_by &&
              a.locked_at &&
              Date.now() - new Date(a.locked_at).getTime() < 15 * 60 * 1000;
            const lockedByOther = lockActive && a.locked_by !== user?.id;
            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border p-4 ${abierta ? 'border-amber-200' : 'border-slate-200'}`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${meta.cls}`}
                  >
                    {meta.label || a.estado}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {a.prioridad === 'URGENTE' && a.estado !== 'RESUELTA' && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-1">
                        <AlertTriangle size={11} /> Urgente
                      </span>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => borrarAsig(a)}
                        title="Eliminar (admin)"
                        className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm font-black text-slate-800">{skus.length} SKU(s)</p>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                  {skus
                    .slice(0, 3)
                    .map((s) => s.codigo_producto)
                    .join(', ')}
                  {skus.length > 3 ? '…' : ''}
                </p>
                {a.motivo && <p className="text-xs text-slate-400 mt-1 italic">“{a.motivo}”</p>}
                <p className="text-[11px] text-slate-400 mt-2">
                  {a.asignado_nombre ? `Por ${a.asignado_nombre}` : 'Inventario'} ·{' '}
                  {a.created_at ? new Date(a.created_at).toLocaleDateString('es-CL') : ''}
                </p>
                {lockActive && (
                  <div
                    className={`mt-2 rounded-lg border px-2.5 py-2 text-[11px] font-bold ${lockedByOther ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
                  >
                    🔒 {lockedByOther ? 'En proceso por' : 'Tarea tomada por'}{' '}
                    {a.locked_by_name || 'otro usuario'} desde las{' '}
                    {new Date(a.locked_at).toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}

                {abierta && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {canManageQuality && (
                      <button
                        onClick={() => onGenerarInforme(a)}
                        title={
                          lockedByOther ? 'El sistema verificará el bloqueo antes de abrir' : ''
                        }
                        className={`flex-1 px-3 py-2 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 ${lockedByOther ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                      >
                        <FileText size={14} /> Generar informe / dictamen <ArrowRight size={14} />
                      </button>
                    )}
                    {canAssign && (
                      <button
                        onClick={() => anularAsig(a)}
                        title="Anular"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 font-black text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Ban size={14} />
                      </button>
                    )}
                  </div>
                )}
                {a.estado === 'RESUELTA' && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-3 flex items-center gap-1">
                    <FileText size={12} /> Resuelta
                    {a.resuelto_nombre ? ` por ${a.resuelto_nombre}` : ''}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && <AsignarModal onClose={() => setModal(false)} />}
    </div>
  );
};

export default AsignacionesPanel;
