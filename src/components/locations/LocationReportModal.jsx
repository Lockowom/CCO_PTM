import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Loader2, MapPin, PackageX, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';

const normalizeLocation = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s.]+/g, '-');

export default function LocationReportModal({ item, locations = [], onClose, onCreated }) {
  const [type, setType] = useState('AGOTADO');
  const [newLocation, setNewLocation] = useState('');
  const [note, setNote] = useState('Producto no se encuentra dentro de la ubicación indicada.');
  const [saving, setSaving] = useState(false);
  const suggestions = useMemo(
    () => [...new Set(locations.filter(Boolean).map(normalizeLocation))].sort(),
    [locations]
  );

  const submit = async () => {
    const normalized = normalizeLocation(newLocation);
    if (!/[\p{L}\p{N}]/u.test(note.trim()) || note.trim().length < 3) {
      toast.error('Escribe una observación real sobre lo ocurrido.');
      return;
    }
    if (type === 'MOVIDO' && (!normalized || normalized === item.ubicacion)) {
      toast.error('Indica una ubicación nueva y distinta de la actual.');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('solicitar_cambio_ubicacion', {
        p_ubicacion_id: item.id,
        p_tipo: type,
        p_nueva_ubicacion: type === 'MOVIDO' ? normalized : null,
        p_observacion: note.trim()
      });
      if (error) throw error;
      toast.success('Solicitud enviada a administración', {
        description: 'La ubicación no cambiará hasta que un administrador la apruebe.'
      });
      onCreated?.(data);
      onClose();
    } catch (error) {
      toast.error(error.message || 'No se pudo enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
              <AlertTriangle size={21} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Reportar problema de ubicación</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Administración revisará y ejecutará el cambio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="font-mono text-sm text-amber-700">{item.codigo}</strong>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm">
                {item.ubicacion}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{item.descripcion || 'Sin descripción'}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setType('AGOTADO')}
              className={`rounded-2xl border-2 p-4 text-left transition ${type === 'AGOTADO' ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <PackageX
                size={20}
                className={type === 'AGOTADO' ? 'text-rose-600' : 'text-slate-400'}
              />
              <strong className="mt-2 block text-sm text-slate-900">
                Ubicación no corresponde
              </strong>
              <span className="mt-1 block text-xs text-slate-500">
                El producto no se encuentra dentro de esa ubicación.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setType('MOVIDO')}
              className={`rounded-2xl border-2 p-4 text-left transition ${type === 'MOVIDO' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <MapPin
                size={20}
                className={type === 'MOVIDO' ? 'text-blue-600' : 'text-slate-400'}
              />
              <strong className="mt-2 block text-sm text-slate-900">Transferencia</strong>
              <span className="mt-1 block text-xs text-slate-500">
                Cambio de ubicación del producto.
              </span>
            </button>
          </div>

          {type === 'MOVIDO' && (
            <div>
              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                Nueva ubicación
              </label>
              <input
                list="wms-location-suggestions"
                value={newLocation}
                onChange={(event) => setNewLocation(event.target.value.toUpperCase())}
                placeholder="Escribe o elige, ej. F-32-02"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-mono text-sm font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                autoFocus
              />
              <datalist id="wms-location-suggestions">
                {suggestions.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
              <p className="mt-1.5 text-xs text-slate-400">
                Puedes elegir una existente o escribir una nueva.
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
              Qué ocurrió
            </label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              placeholder="Describe dónde buscaste o por qué debe corregirse."
            />
          </div>
        </div>

        <footer className="flex gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50 sm:flex-none"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Enviar solicitud
          </button>
        </footer>
      </div>
    </div>
  );
}
