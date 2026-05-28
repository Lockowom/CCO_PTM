import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, X, Download, RefreshCw, Save, Trash2, MoveRight,
  MapPin, Package, Edit3, Check, AlertTriangle, Filter,
  ChevronLeft, ChevronRight, ArrowUpDown, Loader2
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { logUpload } from '../../utils/logUpload';

// ─── Helpers ──────────────────────────────────────────
const PAGE_SIZE = 50;

const normalizeLoc = (loc) => {
  if (!loc) return '';
  let cleaned = loc.trim().toUpperCase().replace(/[\s\.]+/g, '-');
  const parts = cleaned.split('-').filter(p => p !== '');
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
    const finalValue = type === 'number' ? (parseInt(tempValue) || 0) : tempValue.trim();
    if (finalValue !== (value ?? '')) {
      onSave(rowId, field, finalValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setEditing(false); setTempValue(value ?? ''); }
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
      onClick={() => { setEditing(true); setTempValue(value ?? ''); }}
      className="group cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1 min-h-[32px]"
      title="Click para editar"
    >
      <span className={`text-sm ${value ? 'text-slate-700' : 'text-slate-300 italic'}`}>
        {value || '—'}
      </span>
      <Edit3 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
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
            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{item.ubicacion}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <MoveRight size={20} className="text-slate-400 shrink-0" />
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Nueva Ubicación</label>
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
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
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
const DeleteModal = ({ item, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm(item);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={e => e.stopPropagation()}>
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
          <p><span className="font-semibold text-red-800">Código:</span> {item.codigo}</p>
          <p><span className="font-semibold text-red-800">Ubicación:</span> {item.ubicacion}</p>
          <p><span className="font-semibold text-red-800">Cantidad:</span> {item.cantidad}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
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

// ─── Main Component ──────────────────────────────────
export default function LocationManager() {
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

  const RACKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  // ─── Fetch Data (paginated + server-side search) ────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('wms_ubicaciones')
        .select('*', { count: 'exact' });

      // Search filter
      if (search.trim()) {
        const s = search.trim();
        query = query.or(`ubicacion.ilike.%${s}%,codigo.ilike.%${s}%,descripcion.ilike.%${s}%`);
      }

      // Rack filter
      if (rackFilter) {
        query = query.ilike('ubicacion', `${rackFilter}-%`);
      }

      // Sort
      query = query.order(sortField, { ascending: sortDir === 'asc' });

      // Pagination
      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data: rows, count, error } = await query;
      if (error) throw error;

      setData(rows || []);
      setTotalCount(count || 0);
    } catch (err) {
      toast.error('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, rackFilter, sortField, sortDir, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, rackFilter]);

  // ─── Actions ────────────────────────────────────────
  const handleInlineSave = async (rowId, field, value) => {
    setSaving(true);
    try {
      const updateData = { [field]: value };
      // If changing ubicacion, normalize it
      if (field === 'ubicacion') {
        updateData.ubicacion = normalizeLoc(value);
      }

      const { error } = await supabase
        .from('wms_ubicaciones')
        .update(updateData)
        .eq('id', rowId);

      if (error) throw error;

      // Update local state
      setData(prev => prev.map(row =>
        row.id === rowId ? { ...row, ...updateData } : row
      ));
      toast.success('Actualizado correctamente');
      logUpload({ modulo: 'Gestión Ubicaciones', tablaDestino: 'wms_ubicaciones', totalRegistros: 1, actualizados: 1 });
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (item, newUbicacion) => {
    try {
      // Check if same product already exists at target location
      const { data: existing } = await supabase
        .from('wms_ubicaciones')
        .select('id, cantidad')
        .eq('ubicacion', newUbicacion)
        .eq('codigo', item.codigo)
        .limit(1);

      if (existing && existing.length > 0) {
        // Merge: add quantities
        const { error: mergeErr } = await supabase
          .from('wms_ubicaciones')
          .update({ cantidad: (existing[0].cantidad || 0) + (item.cantidad || 0) })
          .eq('id', existing[0].id);

        if (mergeErr) throw mergeErr;

        // Delete original
        const { error: delErr } = await supabase
          .from('wms_ubicaciones')
          .delete()
          .eq('id', item.id);

        if (delErr) throw delErr;

        toast.success(`Producto fusionado en ${newUbicacion} (cantidad sumada)`);
        logUpload({ modulo: 'Gestión Ubicaciones', tablaDestino: 'wms_ubicaciones', totalRegistros: 1, actualizados: 1 });
      } else {
        // Simple move
        const { error } = await supabase
          .from('wms_ubicaciones')
          .update({ ubicacion: newUbicacion })
          .eq('id', item.id);

        if (error) throw error;
        toast.success(`Movido a ${newUbicacion}`);
        logUpload({ modulo: 'Gestión Ubicaciones', tablaDestino: 'wms_ubicaciones', totalRegistros: 1, actualizados: 1 });
      }

      setMoveItem(null);
      fetchData();
    } catch (err) {
      toast.error('Error al mover: ' + err.message);
    }
  };

  const handleDelete = async (item) => {
    try {
      const { error } = await supabase
        .from('wms_ubicaciones')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Registro eliminado');
      setDeleteItem(null);
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const exportToExcel = () => {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data.map(r => ({
      Ubicación: r.ubicacion,
      Código: r.codigo,
      Descripción: r.descripcion,
      Cantidad: r.cantidad,
      Serie: r.serie || '',
      Partida: r.partida || '',
      Pieza: r.pieza || '',
      Talla: r.talla || '',
      Color: r.color || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ubicaciones');
    XLSX.writeFile(wb, `ubicaciones_${rackFilter || 'ALL'}_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success('Exportado correctamente');
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ─── Render ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <MapPin size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestión Ubicaciones</h1>
            <p className="text-sm text-slate-500">Mover, editar y eliminar productos del WMS</p>
          </div>
        </div>
      </div>

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
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
                !rackFilter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            {RACKS.map(rack => (
              <button
                key={rack}
                onClick={() => setRackFilter(rack)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  rackFilter === rack ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rack}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
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
              className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
              title="Exportar Excel"
            >
              <Download size={16} />
            </button>
            <div className="text-xs text-slate-400 font-medium pl-2 border-l border-slate-200">
              <span className="font-bold text-slate-700">{totalCount.toLocaleString()}</span> registros
            </div>
          </div>
        </div>
      </div>

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
                {[
                  { key: 'ubicacion', label: 'Ubicación', w: 'w-32' },
                  { key: 'codigo', label: 'Código', w: 'w-36' },
                  { key: 'descripcion', label: 'Descripción', w: 'w-64' },
                  { key: 'cantidad', label: 'Cant.', w: 'w-20' },
                  { key: 'serie', label: 'Serie', w: 'w-28' },
                  { key: 'partida', label: 'Partida/Lote', w: 'w-28' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-3 py-3 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-slate-700 select-none ${col.w}`}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.key && (
                        <ArrowUpDown size={12} className="text-blue-500" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase w-28 text-center">Acciones</th>
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
                data.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-1">
                      <EditableCell value={row.ubicacion} field="ubicacion" rowId={row.id} onSave={handleInlineSave} />
                    </td>
                    <td className="px-3 py-1">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                        {row.codigo}
                      </span>
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell value={row.descripcion} field="descripcion" rowId={row.id} onSave={handleInlineSave} />
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell value={row.cantidad} field="cantidad" rowId={row.id} onSave={handleInlineSave} type="number" />
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell value={row.serie} field="serie" rowId={row.id} onSave={handleInlineSave} />
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell value={row.partida} field="partida" rowId={row.id} onSave={handleInlineSave} />
                    </td>
                    <td className="px-3 py-1">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setMoveItem(row)}
                          className="p-1.5 rounded-md hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Mover a otra ubicación"
                        >
                          <MoveRight size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteItem(row)}
                          className="p-1.5 rounded-md hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Mostrando <span className="font-bold text-slate-700">{page * PAGE_SIZE + 1}</span>–<span className="font-bold text-slate-700">{Math.min((page + 1) * PAGE_SIZE, totalCount)}</span> de <span className="font-bold text-slate-700">{totalCount.toLocaleString()}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <span className="px-3 py-1.5 text-xs font-bold text-slate-600">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
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
      {moveItem && <MoveModal item={moveItem} onClose={() => setMoveItem(null)} onConfirm={handleMove} />}
      {deleteItem && <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} />}
    </div>
  );
}
