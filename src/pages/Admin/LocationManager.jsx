import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  Download,
  RefreshCw,
  Trash2,
  MoveRight,
  MapPin,
  Package,
  Edit3,
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  Upload,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { logUpload } from '../../utils/logUpload';
import { putawayRowKey } from '../../lib/putawayBulk';
import LocationCatalog from './LocationCatalog';
import PutawayBulkImport from './PutawayBulkImport';

// ─── Helpers ──────────────────────────────────────────
const PAGE_SIZE = 50;
const EXPORT_PAGE_SIZE = 1000;
const BULK_RETIRE_CHUNK_SIZE = 500;

const putawaySelectionKey = (item) =>
  putawayRowKey(
    String(item?.ubicacion || '').trim().toUpperCase(),
    String(item?.codigo || '').trim().toUpperCase()
  );

const uniquePutawayItems = (items) => {
  const byKey = new Map();
  items.forEach((item) => {
    if (item?.ubicacion && item?.codigo) {
      byKey.set(putawaySelectionKey(item), { ubicacion: item.ubicacion, codigo: item.codigo });
    }
  });
  return [...byKey.values()];
};

const uniqueWmsItems = (items) => {
  const byId = new Map();
  items.forEach((item) => {
    if (item?.id) {
      byId.set(item.id, {
        id: item.id,
        ubicacion: item.ubicacion,
        codigo: item.codigo
      });
    }
  });
  return [...byId.values()];
};

const chunk = (items, size) => {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
};

const normalizeLoc = (loc) => {
  if (!loc) return '';
  let cleaned = loc
    .trim()
    .toUpperCase()
    .replace(/[\s.]+/g, '-');
  const parts = cleaned.split('-').filter((p) => p !== '');
  if (parts.length >= 2) {
    const rack = parts[0];
    let p1 = parts[1];
    let p2 = parts[2] || '01';
    const normPos = isNaN(parseInt(p1)) ? p1 : parseInt(p1).toString().padStart(2, '0');
    const normLevel = isNaN(parseInt(p2)) ? p2 : parseInt(p2).toString().padStart(2, '0');
    return `${rack}-${normPos}-${normLevel}`;
  }
  return cleaned;
};

const locationKey = (location) => String(location || '').trim().toUpperCase();

const LOCATION_USE_META = {
  GENERAL: { label: 'General', tone: 'border-slate-200 bg-slate-100 text-slate-600' },
  CALIDAD: { label: 'Calidad protegida', tone: 'border-violet-200 bg-violet-50 text-violet-700' },
  TRANSITORIO: { label: 'Transitorio protegido', tone: 'border-amber-200 bg-amber-50 text-amber-700' }
};

// La descripción visible viene siempre del maestro SKU cuando la fila histórica
// de Put Away no la tenía. Es solo una mejora de presentación: no altera stock
// ni reescribe registros existentes.
const fillMissingDescriptionsFromMaster = async (rows) => {
  const missingCodes = [
    ...new Set(
      rows
        .filter((row) => !String(row.descripcion || '').trim())
        .map((row) => String(row.codigo || '').trim().toUpperCase())
        .filter(Boolean)
    )
  ];
  if (!missingCodes.length) return rows;

  const { data, error } = await supabase
    .from('tms_matriz_codigos')
    .select('codigo_producto, producto')
    .in('codigo_producto', missingCodes);
  if (error) {
    console.error('No se pudieron completar las descripciones desde maestro:', error);
    return rows;
  }
  const descriptions = new Map(
    (data || []).map((item) => [String(item.codigo_producto || '').trim().toUpperCase(), item.producto])
  );
  return rows.map((row) => ({
    ...row,
    descripcion: row.descripcion || descriptions.get(String(row.codigo || '').trim().toUpperCase()) || ''
  }));
};

// ─── Inline Editable Cell ──────────────────────────────
const EditableCell = ({ value, field, rowId, onSave, type = 'text' }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value ?? '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    const finalValue = type === 'number' ? parseInt(tempValue) || 0 : tempValue.trim();
    if (finalValue !== (value ?? '')) {
      onSave(rowId, field, finalValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditing(false);
      setTempValue(value ?? '');
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 text-sm border-2 border-blue-400 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    );
  }

  return (
    <div
      onClick={() => {
        setEditing(true);
        setTempValue(value ?? '');
      }}
      className="group cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1 min-h-[32px]"
      title="Click para editar"
    >
      <span className={`text-sm ${value ? 'text-slate-700' : 'text-slate-300 italic'}`}>
        {value || '—'}
      </span>
      <Edit3
        size={12}
        className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      />
    </div>
  );
};

// ─── Move Modal ──────────────────────────────────────
const MoveModal = ({ item, onClose, onConfirm }) => {
  const [newUbicacion, setNewUbicacion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMove = async () => {
    const normalized = normalizeLoc(newUbicacion);
    if (!normalized || normalized.split('-').length < 3) {
      toast.error('Ubicación inválida. Formato: RACK-POS-NIVEL (ej: A-05-01)');
      return;
    }
    setLoading(true);
    await onConfirm(item, normalized);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-900 mb-1">Mover Producto</h3>
        <p className="text-sm text-slate-500 mb-4">Cambiar la ubicación de este producto</p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase w-20">Código:</span>
            <span className="text-sm font-bold text-blue-700">{item.codigo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase w-20">Desc:</span>
            <span className="text-sm text-slate-700 truncate">{item.descripcion}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase w-20">Actual:</span>
            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              {item.ubicacion}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <MoveRight size={20} className="text-slate-400 shrink-0" />
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
              Nueva Ubicación
            </label>
            <input
              type="text"
              placeholder="Ej: B-10-03"
              value={newUbicacion}
              onChange={(e) => setNewUbicacion(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleMove()}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleMove}
            disabled={loading || !newUbicacion.trim()}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <MoveRight size={16} />}
            Mover
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────
const DeleteModal = ({ item, onClose, onConfirm, isPutaway }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm(item);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Eliminar Registro</h3>
            <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-sm space-y-1">
          <p>
            <span className="font-semibold text-red-800">Código:</span> {item.codigo}
          </p>
          <p>
            <span className="font-semibold text-red-800">Ubicación:</span> {item.ubicacion}
          </p>
          {!isPutaway && (
            <p>
              <span className="font-semibold text-red-800">Cantidad:</span> {item.cantidad}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkRetireModal = ({ items, loading, onClose, onConfirm }) => {
  const count = items?.length || 0;
  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Retirar selección de Put Away"
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Retirar selección de Put Away</h3>
            <p className="mt-1 text-xs text-slate-500">Confirma el retiro visual de las asociaciones elegidas.</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>
        <div className="space-y-4 p-5 text-sm text-slate-600">
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <strong className="block font-black">Retirar {count.toLocaleString('es-CL')} asociación(es) visual(es)</strong>
              <span className="mt-1 block text-xs">Se ocultarán de Put Away visual y quedarán auditadas.</span>
            </div>
          </div>
          <p>No se eliminan SKU ni filas WMS; no cambian cantidades, stock ni ERP.</p>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || count === 0}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Retirar {count.toLocaleString('es-CL')}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
};

const BulkArchiveModal = ({ items, loading, onClose, onConfirm }) => {
  const count = items?.length || 0;
  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Archivar registros WMS filtrados"
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Archivar registros WMS</h3>
            <p className="mt-1 text-xs text-slate-500">Esta acción limpia el resultado filtrado de Inventario WMS.</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>
        <div className="space-y-4 p-5 text-sm text-slate-600">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <strong className="block font-black">Archivar {count.toLocaleString('es-CL')} registro(s)</strong>
              <span className="mt-1 block text-xs">Cada SKU se respalda con su ubicación y trazabilidad antes de retirarse de la vista operativa.</span>
            </div>
          </div>
          <p>El catálogo maestro de ubicaciones se conserva. No cambia cantidades, stock físico, Softland ni ERP.</p>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || count === 0}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Archivar {count.toLocaleString('es-CL')}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
};

// ─── Main Component ──────────────────────────────────
export default function LocationManager() {
  const [source, setSource] = useState('catalog');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [rackFilter, setRackFilter] = useState('');
  const [sortField, setSortField] = useState('ubicacion');
  const [sortDir, setSortDir] = useState('asc');
  const [moveItem, setMoveItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [bulkImportMode, setBulkImportMode] = useState(null);
  const [selectedPutaway, setSelectedPutaway] = useState([]);
  const [bulkRetireItems, setBulkRetireItems] = useState(null);
  const [bulkArchiveItems, setBulkArchiveItems] = useState(null);
  const [selectingAllPutaway, setSelectingAllPutaway] = useState(false);
  const [selectingAllWms, setSelectingAllWms] = useState(false);
  const [specialLocationUses, setSpecialLocationUses] = useState(() => new Map());
  const [putawayStats, setPutawayStats] = useState({
    registros: 0,
    skus: 0,
    ubicaciones: 0,
    hoy: 0,
    ultimos: []
  });
  const isCatalog = source === 'catalog';
  const isPutaway = source === 'putaway';
  const sourceTable = 'wms_ubicaciones';

  const RACKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  const getLocationUse = useCallback(
    (location) => specialLocationUses.get(locationKey(location)) || 'GENERAL',
    [specialLocationUses]
  );

  const fetchSpecialLocationUses = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from('wms_ubicaciones_maestras')
      .select('ubicacion, tipo_uso')
      .in('tipo_uso', ['CALIDAD', 'TRANSITORIO']);
    if (error) {
      console.error('No se pudieron cargar los usos especiales de ubicaciones:', error);
      return;
    }
    setSpecialLocationUses(
      new Map((rows || []).map((row) => [locationKey(row.ubicacion), row.tipo_uso]))
    );
  }, []);

  useEffect(() => {
    fetchSpecialLocationUses();
    const channel = supabase
      .channel('location-manager-special-uses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wms_ubicaciones_maestras' },
        fetchSpecialLocationUses
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchSpecialLocationUses]);

  const applyLocationFilters = useCallback(
    (query) => {
      let filtered = isPutaway ? query.eq('registrado_putaway', true) : query.gt('cantidad', 0);

      if (search.trim()) {
        const s = search.trim();
        filtered = filtered.or(`ubicacion.ilike.%${s}%,codigo.ilike.%${s}%,descripcion.ilike.%${s}%`);
      }

      if (rackFilter) {
        filtered = filtered.ilike('ubicacion', `${rackFilter}-%`);
      }

      return filtered.order(sortField, { ascending: sortDir === 'asc' });
    },
    [isPutaway, rackFilter, search, sortDir, sortField]
  );

  // ─── Fetch Data (paginated + server-side search) ────
  const fetchData = useCallback(async () => {
    if (isCatalog) {
      setData([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let query = applyLocationFilters(supabase.from(sourceTable).select('*', { count: 'exact' }));

      // Pagination
      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data: rows, count, error } = await query;
      if (error) throw error;

      setData(await fillMissingDescriptionsFromMaster(rows || []));
      setTotalCount(count || 0);
    } catch (err) {
      toast.error('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [applyLocationFilters, isCatalog, page, sourceTable]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchPutawayStats = useCallback(async () => {
    if (!isPutaway) return;
    const { data: summary, error } = await supabase.rpc('putaway_admin_resumen');
    if (error) {
      console.error('Put Away summary error:', error);
      return;
    }
    setPutawayStats(summary || {});
  }, [isPutaway]);

  useEffect(() => {
    fetchPutawayStats();
  }, [fetchPutawayStats]);

  useEffect(() => {
    if (isCatalog) return undefined;
    const channel = supabase
      .channel(`location-manager-${sourceTable}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: sourceTable }, () => {
        fetchData();
        fetchPutawayStats();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, fetchPutawayStats, isCatalog, sourceTable]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
    setSelectedPutaway([]);
  }, [search, rackFilter, source]);

  useEffect(() => {
    setSortField('ubicacion');
    setSortDir('asc');
  }, [source]);

  // ─── Actions ────────────────────────────────────────
  const handleInlineSave = async (rowId, field, value) => {
    setSaving(true);
    try {
      const updateData = { [field]: value };
      // If changing ubicacion, normalize it
      if (field === 'ubicacion') {
        updateData.ubicacion = normalizeLoc(value);
      }

      if (field === 'ubicacion' && !updateData.ubicacion) {
        throw new Error('La ubicación no puede quedar vacía');
      }

      let saved;
      let error;
      if (field === 'ubicacion') {
        const result = await supabase.rpc('mover_ubicacion_wms', {
          p_id: rowId,
          p_nueva_ubicacion: updateData.ubicacion
        });
        saved = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from(sourceTable)
          .update(updateData)
          .eq('id', rowId)
          .select('*')
          .single();
        saved = result.data;
        error = result.error;
      }

      if (error) throw error;
      if (!saved) throw new Error('Supabase no confirmó la actualización');

      // La interfaz solo confirma aquello que Supabase devolvió como persistido.
      setData((prev) => prev.map((row) => (row.id === rowId ? saved : row)));
      toast.success(
        field === 'ubicacion'
          ? `Ubicación guardada: ${saved.ubicacion}`
          : 'Actualizado y verificado en Supabase'
      );
      logUpload({
        modulo: isPutaway ? 'Put Away visual' : 'Gestión Ubicaciones WMS',
        tablaDestino: sourceTable,
        totalRegistros: 1,
        actualizados: 1
      });
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (item, newUbicacion) => {
    try {
      const { data: saved, error } = await supabase.rpc('mover_ubicacion_wms', {
        p_id: item.id,
        p_nueva_ubicacion: newUbicacion
      });
      if (error) throw error;
      if (!saved) throw new Error('Supabase no confirmó el cambio de ubicación');

      toast.success(`Ubicación guardada y verificada: ${saved.ubicacion}`);
      logUpload({
        modulo: isPutaway ? 'Put Away visual' : 'Gestión Ubicaciones',
        tablaDestino: 'wms_ubicaciones',
        totalRegistros: 1,
        actualizados: 1
      });

      setMoveItem(null);
      fetchData();
    } catch (err) {
      toast.error('Error al mover: ' + err.message);
    }
  };

  const handleDelete = async (item) => {
    try {
      const { data: deleted, error } = await supabase.rpc('eliminar_ubicacion_wms', {
        p_id: item.id,
        p_solo_putaway: isPutaway
      });

      if (error) throw error;
      if (!deleted) throw new Error('Supabase no confirmó la eliminación');

      toast.success('Registro eliminado');
      setDeleteItem(null);
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  const togglePutawayItem = (item) => {
    if (getLocationUse(item.ubicacion) === 'CALIDAD') {
      toast.error('Ubicación de Calidad protegida: no se puede retirar producto.');
      return;
    }
    const key = putawaySelectionKey(item);
    setSelectedPutaway((previous) => {
      const exists = previous.some((selected) => putawaySelectionKey(selected) === key);
      return exists
        ? previous.filter((selected) => putawaySelectionKey(selected) !== key)
        : uniquePutawayItems([...previous, item]);
    });
  };

  const toggleVisiblePutawayItems = () => {
    const visibleItems = uniquePutawayItems(
      data.filter((item) => getLocationUse(item.ubicacion) !== 'CALIDAD')
    );
    const selectedKeys = new Set(selectedPutaway.map(putawaySelectionKey));
    const allVisibleSelected = visibleItems.length > 0 && visibleItems.every((item) => selectedKeys.has(putawaySelectionKey(item)));
    setSelectedPutaway((previous) =>
      allVisibleSelected
        ? previous.filter((item) => !visibleItems.some((visible) => putawaySelectionKey(visible) === putawaySelectionKey(item)))
        : uniquePutawayItems([...previous, ...visibleItems])
    );
  };

  const selectAllFilteredPutawayItems = async () => {
    setSelectingAllPutaway(true);
    try {
      const allItems = [];
      for (let from = 0; ; from += EXPORT_PAGE_SIZE) {
        const query = applyLocationFilters(supabase.from(sourceTable).select('ubicacion, codigo'));
        const { data: rows, error } = await query.range(from, from + EXPORT_PAGE_SIZE - 1);
        if (error) throw error;
        allItems.push(...(rows || []));
        if (!rows || rows.length < EXPORT_PAGE_SIZE) break;
      }
      const qualityItems = allItems.filter((item) => getLocationUse(item.ubicacion) === 'CALIDAD');
      const items = uniquePutawayItems(
        allItems.filter((item) => getLocationUse(item.ubicacion) !== 'CALIDAD')
      );
      setSelectedPutaway(items);
      if (qualityItems.length) {
        toast.info(`${qualityItems.length.toLocaleString('es-CL')} registro(s) de Calidad fueron protegidos.`);
      }
      toast.success(`${items.length.toLocaleString('es-CL')} asociación(es) seleccionada(s)`);
    } catch (error) {
      toast.error(`No se pudieron seleccionar los resultados: ${error.message}`);
    } finally {
      setSelectingAllPutaway(false);
    }
  };

  const prepareWmsArchiveFiltered = async () => {
    setSelectingAllWms(true);
    try {
      const allItems = [];
      for (let from = 0; ; from += EXPORT_PAGE_SIZE) {
        const query = applyLocationFilters(supabase.from(sourceTable).select('id, ubicacion, codigo'));
        const { data: rows, error } = await query.range(from, from + EXPORT_PAGE_SIZE - 1);
        if (error) throw error;
        allItems.push(...(rows || []));
        if (!rows || rows.length < EXPORT_PAGE_SIZE) break;
      }
      const protectedItems = allItems.filter((item) => getLocationUse(item.ubicacion) !== 'GENERAL');
      const items = uniqueWmsItems(
        allItems.filter((item) => getLocationUse(item.ubicacion) === 'GENERAL')
      );
      if (!items.length && protectedItems.length) {
        toast.info('Los resultados pertenecen a ubicaciones protegidas; no se archivará ninguno.');
        return;
      }
      if (!items.length) {
        toast.info('No hay registros WMS para archivar con el filtro actual');
        return;
      }
      if (protectedItems.length) {
        toast.info(`${protectedItems.length.toLocaleString('es-CL')} registro(s) protegidos se excluyeron del archivo.`);
      }
      setBulkArchiveItems(items);
    } catch (error) {
      toast.error(`No se pudieron preparar los registros para archivo: ${error.message}`);
    } finally {
      setSelectingAllWms(false);
    }
  };

  const handleBulkRetire = async () => {
    const requestedItems = uniquePutawayItems(bulkRetireItems || []);
    const protectedItems = requestedItems.filter(
      (item) => getLocationUse(item.ubicacion) === 'CALIDAD'
    );
    const items = requestedItems.filter((item) => getLocationUse(item.ubicacion) !== 'CALIDAD');
    if (protectedItems.length) {
      toast.info(`${protectedItems.length.toLocaleString('es-CL')} registro(s) de Calidad no se pueden retirar.`);
    }
    if (!items.length) return;
    setSaving(true);
    try {
      let retirados = 0;
      let omitidos = 0;
      for (const batch of chunk(items, BULK_RETIRE_CHUNK_SIZE)) {
        const { data: result, error } = await supabase.rpc('retirar_putaway_ubicaciones', {
          p_items: batch
        });
        if (error) throw error;
        retirados += Number(result?.retirados || 0);
        omitidos += Number(result?.omitidos || 0);
      }
      await logUpload({
        modulo: 'Put Away visual · retiro desde tabla',
        tablaDestino: sourceTable,
        totalRegistros: items.length,
        actualizados: retirados,
        errores: omitidos
      });
      toast.success(`${retirados.toLocaleString('es-CL')} asociación(es) retiradas visualmente.`);
      setBulkRetireItems(null);
      setSelectedPutaway([]);
      fetchData();
      fetchPutawayStats();
    } catch (error) {
      toast.error(error.message || 'No se pudo completar el retiro masivo. No se reintentó automáticamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkArchive = async () => {
    const items = uniqueWmsItems(bulkArchiveItems || []);
    if (!items.length) return;
    setSaving(true);
    try {
      let archivados = 0;
      let omitidos = 0;
      let solicitudesDesvinculadas = 0;
      let protegidasCalidad = 0;
      let protegidasTransitorio = 0;
      for (const batch of chunk(items, BULK_RETIRE_CHUNK_SIZE)) {
        const { data: result, error } = await supabase.rpc('archivar_ubicaciones_wms', {
          p_ids: batch.map((item) => item.id),
          p_motivo: 'Limpieza masiva desde Gestion de Ubicaciones'
        });
        if (error) throw error;
        archivados += Number(result?.archivados || 0);
        omitidos += Number(result?.omitidos || 0);
        solicitudesDesvinculadas += Number(result?.solicitudes_desvinculadas || 0);
        protegidasCalidad += Number(result?.protegidas_calidad || 0);
        protegidasTransitorio += Number(result?.protegidas_transitorio || 0);
      }
      await logUpload({
        modulo: 'Inventario WMS · archivo desde tabla',
        tablaDestino: sourceTable,
        totalRegistros: items.length,
        actualizados: archivados,
        errores: omitidos
      });
      const notice = solicitudesDesvinculadas
        ? ` Se conservó trazabilidad de ${solicitudesDesvinculadas} solicitud(es) previa(s).`
        : '';
      const protectedNotice = protegidasCalidad || protegidasTransitorio
        ? ` ${protegidasCalidad + protegidasTransitorio} registro(s) protegido(s) no se archivaron.`
        : '';
      toast.success(`${archivados.toLocaleString('es-CL')} registro(s) archivado(s).${protectedNotice}${notice}`);
      setBulkArchiveItems(null);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'No se pudo completar el archivo masivo. No se reintentó automáticamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const exportToExcel = async () => {
    if (totalCount === 0) {
      toast.info('No hay ubicaciones para exportar');
      return;
    }

    setExporting(true);
    try {
      const allRows = [];
      for (let from = 0; ; from += EXPORT_PAGE_SIZE) {
        const query = applyLocationFilters(supabase.from(sourceTable).select('*'));
        const { data: rows, error } = await query.range(from, from + EXPORT_PAGE_SIZE - 1);
        if (error) throw error;

        allRows.push(...(rows || []));
        if (!rows || rows.length < EXPORT_PAGE_SIZE) break;
      }

      if (allRows.length === 0) {
        toast.info('No hay ubicaciones para exportar');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(
        allRows.map((r) => ({
        Ubicación: r.ubicacion,
        'Uso especial': LOCATION_USE_META[getLocationUse(r.ubicacion)].label,
        Código: r.codigo,
        Descripción: r.descripcion,
        ...(isPutaway ? {} : { Cantidad: r.cantidad }),
        Serie: r.serie || '',
        Partida: r.partida || '',
        Pieza: r.pieza || '',
        Talla: r.talla || '',
        Color: r.color || ''
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ubicaciones');
    XLSX.writeFile(
      wb,
      `ubicaciones_${rackFilter || 'ALL'}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
      toast.success(`${allRows.length.toLocaleString()} ubicaciones exportadas correctamente`);
    } catch (err) {
      toast.error('Error exportando ubicaciones: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const visibleSelectablePutaway = data.filter(
    (row) => getLocationUse(row.ubicacion) !== 'CALIDAD'
  );
  const qualitySearchResults = search.trim()
    ? data.filter((row) => getLocationUse(row.ubicacion) === 'CALIDAD')
    : [];

  // ─── Render ─────────────────────────────────────────
  if (isCatalog) {
    return <LocationCatalog onOpenRecords={() => setSource('putaway')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <MapPin size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Registros de ubicaciones
            </h1>
            <p className="text-sm text-slate-500">
              Consulta y mantenimiento de registros de Put Away e inventario físico
            </p>
          </div>
        </div>
      </div>

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 mb-4 shadow-sm">
        <button
          type="button"
          onClick={() => setSource('catalog')}
          className="px-4 py-2 rounded-lg text-xs font-black transition-colors text-slate-500 hover:bg-slate-50"
        >
          Catálogo maestro
        </button>
        <button
          type="button"
          onClick={() => setSource('putaway')}
          className={`px-4 py-2 rounded-lg text-xs font-black transition-colors ${
            isPutaway ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Put Away visual
        </button>
        <button
          type="button"
          onClick={() => setSource('wms')}
          className={`px-4 py-2 rounded-lg text-xs font-black transition-colors ${
            !isPutaway ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Inventario WMS
        </button>
      </div>

      {isPutaway && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['Registros Put Away', putawayStats.registros || 0, Package, 'text-indigo-600'],
              ['SKU distintos', putawayStats.skus || 0, Search, 'text-blue-600'],
              ['Ubicaciones usadas', putawayStats.ubicaciones || 0, MapPin, 'text-emerald-600'],
              ['Guardados hoy', putawayStats.hoy || 0, Edit3, 'text-amber-600']
            ].map(([label, value, Icon, tone]) => (
              <article
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {label}
                  </span>
                  <Icon size={17} className={tone} />
                </div>
                <strong className="mt-2 block text-2xl font-black tabular-nums text-slate-900">
                  {Number(value).toLocaleString('es-CL')}
                </strong>
              </article>
            ))}
          </div>
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            Fuente visual sincronizada con Ubicaciones. Los reintentos del mismo SKU, serie, lote y
            ubicación actualizan el registro existente; no crean copias. Cada modificación queda
            auditada y no altera cantidades físicas.
          </div>
        </>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ubicación, código o descripción..."
              className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Rack Filter */}
          <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto no-scrollbar">
            <Filter size={14} className="text-slate-400" />
            <button
              onClick={() => setRackFilter('')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                !rackFilter
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            {RACKS.map((rack) => (
              <button
                key={rack}
                onClick={() => setRackFilter(rack)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  rackFilter === rack
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rack}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {isPutaway && (
              <>
              <button
                onClick={() => setBulkImportMode('LOAD')}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-black text-white transition-colors hover:bg-emerald-700"
                title="Carga masiva de SKU a ubicaciones Put Away"
              >
                <Upload size={15} /> Carga masiva
              </button>
              <button
                onClick={() => setBulkImportMode('RETIRE')}
                className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-black text-rose-700 transition-colors hover:bg-rose-100"
                title="Retira en lote usando un archivo Excel o CSV"
              >
                <Trash2 size={15} /> Retiro por archivo
              </button>
              <button
                onClick={selectAllFilteredPutawayItems}
                disabled={selectingAllPutaway || totalCount === 0}
                className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-black text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="Selecciona todos los resultados del filtro actual para retirarlos juntos"
              >
                {selectingAllPutaway ? <Loader2 size={15} className="animate-spin" /> : <Package size={15} />}
                Seleccionar filtrados
              </button>
              </>
            )}
            {!isPutaway && (
              <button
                onClick={prepareWmsArchiveFiltered}
                disabled={selectingAllWms || totalCount === 0}
                className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-black text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="Archiva todos los resultados del filtro actual después de respaldarlos"
              >
                {selectingAllWms ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Archivar filtrados
              </button>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
              title="Refrescar"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={exportToExcel}
              disabled={exporting || totalCount === 0}
              className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              title="Exportar todas las ubicaciones a Excel"
            >
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            </button>
            <div className="text-xs text-slate-400 font-medium pl-2 border-l border-slate-200">
              <span className="font-bold text-slate-700">{totalCount.toLocaleString()}</span>{' '}
              registros
            </div>
          </div>
        </div>
      </div>

      {qualitySearchResults.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-violet-900">
          <div className="mt-0.5 rounded-xl bg-violet-100 p-2 text-violet-700">
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong className="block text-sm font-black">Ubicación de Calidad protegida</strong>
            <p className="mt-0.5 text-xs leading-relaxed text-violet-800">
              Esta búsqueda encontró {qualitySearchResults.length.toLocaleString('es-CL')} registro(s)
              en Calidad ({[...new Set(qualitySearchResults.map((row) => row.ubicacion))].join(', ')}).
              No se puede sacar, mover, retirar ni archivar producto desde estas ubicaciones.
            </p>
          </div>
        </div>
      )}

      {isPutaway && selectedPutaway.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <Trash2 size={17} />
            </div>
            <div>
              <strong className="block text-sm font-black text-rose-950">
                {selectedPutaway.length.toLocaleString('es-CL')} asociación(es) seleccionada(s)
              </strong>
              <span className="text-xs text-rose-800">Solo se retirarán de Put Away visual; no se borra stock ni SKU.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPutaway([])}
              disabled={saving}
              className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              onClick={() => setBulkRetireItems(selectedPutaway)}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-700 disabled:opacity-50"
            >
              <Trash2 size={15} /> Retirar selección
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Saving indicator */}
        {saving && (
          <div className="h-1 bg-blue-100 overflow-hidden">
            <div className="h-full w-1/3 bg-blue-500 animate-pulse rounded-full"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {isPutaway && (
                  <th className="w-11 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={visibleSelectablePutaway.length > 0 && visibleSelectablePutaway.every((row) => selectedPutaway.some((item) => putawaySelectionKey(item) === putawaySelectionKey(row)))}
                      onChange={toggleVisiblePutawayItems}
                      aria-label="Seleccionar todos los registros permitidos de Put Away"
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                  </th>
                )}
                {[
                  { key: 'ubicacion', label: 'Ubicación', w: 'w-32' },
                  { key: 'codigo', label: 'Código', w: 'w-36' },
                  { key: 'descripcion', label: 'Descripción', w: 'w-64' },
                  ...(!isPutaway ? [{ key: 'cantidad', label: 'Cant.', w: 'w-20' }] : []),
                  { key: 'serie', label: 'Serie', w: 'w-28' },
                  { key: 'partida', label: 'Partida/Lote', w: 'w-28' }
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-3 py-3 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-slate-700 select-none ${col.w}`}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.key && <ArrowUpDown size={12} className="text-blue-500" />}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase w-28 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Cargando...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Package size={32} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No se encontraron registros</p>
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const locationUse = getLocationUse(row.ubicacion);
                  const isQualityLocation = locationUse === 'CALIDAD';
                  const usageMeta = LOCATION_USE_META[locationUse];
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 transition-colors ${
                        isQualityLocation
                          ? 'bg-violet-50/60 hover:bg-violet-50'
                          : isPutaway && selectedPutaway.some((item) => putawaySelectionKey(item) === putawaySelectionKey(row))
                            ? 'bg-rose-50/70 hover:bg-rose-100/70'
                            : 'hover:bg-blue-50/30'
                      }`}
                    >
                    {isPutaway && (
                      <td className="px-3 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPutaway.some((item) => putawaySelectionKey(item) === putawaySelectionKey(row))}
                          onChange={() => togglePutawayItem(row)}
                          aria-label={`Seleccionar ${row.codigo || 'SKU'} en ${row.ubicacion || 'ubicación'}`}
                          disabled={isQualityLocation}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>
                    )}
                    <td className="px-3 py-1">
                      {isQualityLocation ? (
                        <div className="flex flex-col gap-1 px-2 py-1">
                          <span className="font-mono text-sm font-bold text-violet-900">{row.ubicacion}</span>
                          <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black ${usageMeta.tone}`}>
                            <ShieldCheck size={10} /> {usageMeta.label}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <EditableCell
                            value={row.ubicacion}
                            field="ubicacion"
                            rowId={row.id}
                            onSave={handleInlineSave}
                          />
                          {locationUse === 'TRANSITORIO' && (
                            <span className={`ml-2 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black ${usageMeta.tone}`}>
                              <ShieldCheck size={10} /> {usageMeta.label}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-1">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                        {row.codigo}
                      </span>
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell
                        value={row.descripcion}
                        field="descripcion"
                        rowId={row.id}
                        onSave={handleInlineSave}
                      />
                    </td>
                    {!isPutaway && (
                      <td className="px-3 py-1">
                        <EditableCell
                          value={row.cantidad}
                          field="cantidad"
                          rowId={row.id}
                          onSave={handleInlineSave}
                          type="number"
                        />
                      </td>
                    )}
                    <td className="px-3 py-1">
                      <EditableCell
                        value={row.serie}
                        field="serie"
                        rowId={row.id}
                        onSave={handleInlineSave}
                      />
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell
                        value={row.partida}
                        field="partida"
                        rowId={row.id}
                        onSave={handleInlineSave}
                      />
                    </td>
                    <td className="px-3 py-1">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setMoveItem(row)}
                          disabled={isQualityLocation}
                          className="p-1.5 rounded-md text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                          title={isQualityLocation ? 'Calidad protegida: no se puede mover producto' : 'Mover a otra ubicación'}
                        >
                          <MoveRight size={15} />
                        </button>
                        <button
                          onClick={() => (isPutaway ? setBulkRetireItems([row]) : setBulkArchiveItems([row]))}
                          disabled={isQualityLocation || (!isPutaway && locationUse === 'TRANSITORIO')}
                          className="p-1.5 rounded-md text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                          title={isQualityLocation ? 'Calidad protegida: no se puede sacar producto' : locationUse === 'TRANSITORIO' ? 'Transitorio protegido: no se puede archivar' : isPutaway ? 'Retirar de Put Away visual' : 'Archivar registro WMS'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Mostrando <span className="font-bold text-slate-700">{page * PAGE_SIZE + 1}</span>–
              <span className="font-bold text-slate-700">
                {Math.min((page + 1) * PAGE_SIZE, totalCount)}
              </span>{' '}
              de <span className="font-bold text-slate-700">{totalCount.toLocaleString()}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <span className="px-3 py-1.5 text-xs font-bold text-slate-600">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {moveItem && (
        <MoveModal item={moveItem} onClose={() => setMoveItem(null)} onConfirm={handleMove} />
      )}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
          isPutaway={isPutaway}
        />
      )}
      {bulkImportMode && (
        <PutawayBulkImport
          mode={bulkImportMode}
          onClose={() => setBulkImportMode(null)}
          onSaved={() => {
            fetchData();
            fetchPutawayStats();
          }}
        />
      )}
      {bulkRetireItems && (
        <BulkRetireModal
          items={bulkRetireItems}
          loading={saving}
          onClose={() => setBulkRetireItems(null)}
          onConfirm={handleBulkRetire}
        />
      )}
      {bulkArchiveItems && (
        <BulkArchiveModal
          items={bulkArchiveItems}
          loading={saving}
          onClose={() => setBulkArchiveItems(null)}
          onConfirm={handleBulkArchive}
        />
      )}
    </div>
  );
}
