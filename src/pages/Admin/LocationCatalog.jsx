import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import { logUpload } from '../../utils/logUpload';

const LOCATION_FORMAT = /^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/;

const normalizeLocation = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s.]+/g, '-')
    .replace(/-+/g, '-');

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(value)
      )
    : '—';

function LocationFormModal({ item, onClose, onSaved }) {
  const [ubicacion, setUbicacion] = useState(item?.ubicacion || '');
  const [descripcion, setDescripcion] = useState(item?.descripcion || '');
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(item);

  const submit = async (event) => {
    event.preventDefault();
    const normalized = normalizeLocation(ubicacion);
    if (!LOCATION_FORMAT.test(normalized)) {
      toast.error('Usa el formato RACK-POS-NIVEL, por ejemplo D-05-02.');
      return;
    }

    setSaving(true);
    try {
      let result;
      if (isEditing) {
        result = await supabase
          .from('wms_ubicaciones_maestras')
          .update({ descripcion: descripcion.trim() || null })
          .eq('id', item.id)
          .select('*')
          .single();
      } else {
        result = await supabase
          .from('wms_ubicaciones_maestras')
          .insert({ ubicacion: normalized, descripcion: descripcion.trim() || null })
          .select('*')
          .single();
      }

      if (result.error) throw result.error;
      if (!result.data) throw new Error('Supabase no confirmó el cambio.');

      await logUpload({
        modulo: 'Catálogo maestro de ubicaciones',
        tablaDestino: 'wms_ubicaciones_maestras',
        totalRegistros: 1,
        nuevos: isEditing ? 0 : 1,
        actualizados: isEditing ? 1 : 0
      });
      toast.success(isEditing ? 'Ubicación actualizada.' : 'Ubicación creada y habilitada.');
      onSaved(result.data);
      onClose();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar la ubicación.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              {isEditing ? 'Editar ubicación' : 'Nueva ubicación'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Las ubicaciones se gestionan sin modificar stock ni ERP.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mt-5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
          Ubicación
        </label>
        <input
          value={ubicacion}
          onChange={(event) => setUbicacion(event.target.value.toUpperCase())}
          disabled={isEditing}
          maxLength={40}
          placeholder="D-05-02"
          className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-mono text-sm font-black outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
        {isEditing && (
          <p className="mt-1 text-xs text-slate-400">
            Para corregir una posición, desactiva la anterior y crea la correcta.
          </p>
        )}

        <label className="mt-4 block text-[11px] font-black uppercase tracking-wider text-slate-500">
          Descripción opcional
        </label>
        <textarea
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ej.: Rack de productos terminados"
          className="mt-2 w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
        />

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !ubicacion.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LocationCatalog({ onOpenRecords }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ACTIVAS');
  const [editor, setEditor] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wms_ubicaciones_maestras')
        .select(
          'id, ubicacion, descripcion, activo, creado_por_nombre, creado_en, actualizado_por_nombre, actualizado_en, desactivado_por_nombre, desactivado_en'
        )
        .order('ubicacion', { ascending: true })
        .limit(2000);
      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar el catálogo de ubicaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    const channel = supabase
      .channel('wms-location-master-catalog')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wms_ubicaciones_maestras' },
        fetchLocations
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchLocations]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return locations.filter((location) => {
      if (status === 'ACTIVAS' && !location.activo) return false;
      if (status === 'INACTIVAS' && location.activo) return false;
      if (!term) return true;
      return [location.ubicacion, location.descripcion]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [locations, search, status]);

  const activeCount = locations.filter((location) => location.activo).length;
  const inactiveCount = locations.length - activeCount;

  const upsertLocal = (saved) =>
    setLocations((current) => {
      const exists = current.some((location) => location.id === saved.id);
      const next = exists
        ? current.map((location) => (location.id === saved.id ? saved : location))
        : [...current, saved];
      return [...next].sort((a, b) => a.ubicacion.localeCompare(b.ubicacion, 'es'));
    });

  const toggleActive = async (location) => {
    const action = location.activo ? 'desactivar' : 'reactivar';
    const confirmation = location.activo
      ? `¿Desactivar ${location.ubicacion}? No podrá usarse en nuevos Put Away; el historial y los registros existentes se conservan.`
      : `¿Reactivar ${location.ubicacion}? Volverá a estar disponible para nuevos Put Away.`;
    if (!window.confirm(confirmation)) return;

    try {
      const { data, error } = await supabase
        .from('wms_ubicaciones_maestras')
        .update({ activo: !location.activo })
        .eq('id', location.id)
        .select('*')
        .single();
      if (error) throw error;
      if (!data) throw new Error('Supabase no confirmó el cambio.');

      await logUpload({
        modulo: 'Catálogo maestro de ubicaciones',
        tablaDestino: 'wms_ubicaciones_maestras',
        totalRegistros: 1,
        actualizados: 1
      });
      upsertLocal(data);
      toast.success(location.activo ? 'Ubicación desactivada.' : 'Ubicación reactivada.');
    } catch (error) {
      toast.error(error.message || `No se pudo ${action} la ubicación.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200">
              <MapPin size={23} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                Catálogo maestro de ubicaciones
              </h1>
              <p className="text-sm text-slate-500">
                Altas, control y bajas lógicas de posiciones físicas. Sin efectos de stock.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenRecords}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Ver registros WMS
            </button>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-700"
            >
              <Plus size={17} /> Nueva ubicación
            </button>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-3 gap-3">
          {[
            ['Activas', activeCount, CheckCircle2, 'text-emerald-600'],
            ['Inactivas', inactiveCount, ToggleLeft, 'text-slate-500'],
            ['Total', locations.length, MapPin, 'text-blue-600']
          ].map(([label, value, Icon, tone]) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Icon size={18} className={tone} />
              <strong className="mt-2 block text-2xl font-black text-slate-900">{value}</strong>
              <span className="text-xs font-bold text-slate-400">{label}</span>
            </article>
          ))}
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar ubicación o descripción..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              {['ACTIVAS', 'INACTIVAS', 'TODAS'].map((option) => (
                <button
                  key={option}
                  onClick={() => setStatus(option)}
                  className={`rounded-lg px-3 py-2 text-[10px] font-black ${status === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={fetchLocations}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Última modificación</th>
                  <th className="px-4 py-3 text-right">Control</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Loader2 className="mx-auto animate-spin text-blue-600" size={28} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm font-bold text-slate-400">
                      No hay ubicaciones para este filtro.
                    </td>
                  </tr>
                ) : (
                  filtered.map((location) => (
                    <tr key={location.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30">
                      <td className="px-4 py-3 font-mono text-sm font-black text-slate-900">
                        {location.ubicacion}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {location.descripcion || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${location.activo ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}
                        >
                          {location.activo ? 'ACTIVA' : 'INACTIVA'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <strong className="block text-slate-700">
                          {location.actualizado_por_nombre || location.creado_por_nombre || 'Sistema'}
                        </strong>
                        {formatDate(location.actualizado_en || location.creado_en)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditor(location)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-blue-100 hover:text-blue-700"
                            title="Editar descripción"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => toggleActive(location)}
                            className={`rounded-lg p-2 ${location.activo ? 'text-amber-600 hover:bg-amber-100' : 'text-emerald-600 hover:bg-emerald-100'}`}
                            title={location.activo ? 'Desactivar ubicación' : 'Reactivar ubicación'}
                          >
                            {location.activo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {creating && (
        <LocationFormModal
          onClose={() => setCreating(false)}
          onSaved={upsertLocal}
        />
      )}
      {editor && (
        <LocationFormModal item={editor} onClose={() => setEditor(null)} onSaved={upsertLocal} />
      )}
    </div>
  );
}
