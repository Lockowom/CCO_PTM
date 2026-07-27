import { useRef, useState, useEffect } from 'react';
import { ImagePlus, RefreshCw, Trash2, ImageOff, X, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../lib/imageCompress';
import { signedUrls } from '../lib/storageUrl';
import CameraCapture from './CameraCapture';
import { uploadEvidencia, deleteEvidencia, EVIDENCIAS_BUCKET } from '../services/calidadService';

/**
 * Cargador de evidencia fotográfica (cámara o galería) reutilizable.
 * Sube de inmediato al bucket `monitoreo-evidencias` y registra la fila.
 *
 * Props:
 *  - informeId  (string)  requerido para subir.
 *  - itemId     (string)  hallazgo al que se asocian las fotos (null = general).
 *  - evidencias (array)   fotos ya guardadas de este hallazgo.
 *  - onChanged  (fn)      callback tras subir/borrar (para refrescar).
 *  - canManage  (bool)    si puede subir/borrar.
 *  - compact    (bool)    miniaturas más pequeñas.
 */
const PhotoUploader = ({
  informeId,
  itemId,
  evidencias = [],
  onChanged,
  canManage = true,
  compact = false
}) => {
  const { user } = useAuth();
  const galleryRef = useRef(null);
  const [camOpen, setCamOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // Mostrar el botón de cámara solo donde tiene sentido (móvil/tablet/app):
  // en un PC de escritorio `capture` abriría igual el diálogo de archivos.
  const puedeCamara =
    Capacitor.isNativePlatform() ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
  const [lightbox, setLightbox] = useState(null);
  // El bucket es PRIVADO (mig 065): las miniaturas usan URLs firmadas.
  const [urls, setUrls] = useState({});
  useEffect(() => {
    let on = true;
    signedUrls(
      EVIDENCIAS_BUCKET,
      evidencias.map((ev) => ev.storage_path)
    ).then((m) => {
      if (on) setUrls(m);
    });
    return () => {
      on = false;
    };
  }, [evidencias]);

  const puedeSubir = canManage && !!informeId && !!itemId;

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length || !informeId) return;
    setBusy(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const blob = await compressImage(file);
        await uploadEvidencia({ informeId, itemId, blob, user });
      }
      toast.success(files.length > 1 ? 'Fotos agregadas' : 'Foto agregada');
      onChanged?.();
    } catch (err) {
      toast.error(
        err?.message?.includes('row-level security')
          ? 'No tienes permiso para subir fotos'
          : `Error al subir: ${err.message}`
      );
    } finally {
      setBusy(false);
    }
  };

  const borrar = async (ev) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await deleteEvidencia(ev);
      toast.success('Foto eliminada');
      onChanged?.();
    } catch (err) {
      toast.error('No se pudo eliminar la foto');
    }
  };

  const thumb = compact ? 'w-16 h-16' : 'w-20 h-20';

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {evidencias.map((ev) => (
          <div
            key={ev.id}
            className={`relative group ${thumb} rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0`}
          >
            <img
              src={urls[ev.storage_path] || ''}
              alt={ev.descripcion || ''}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => urls[ev.storage_path] && setLightbox(urls[ev.storage_path])}
            />
            {canManage && (
              <button
                onClick={() => borrar(ev)}
                title="Eliminar foto"
                className="absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}

        {canManage && puedeCamara && (
          <button
            type="button"
            onClick={() => setCamOpen(true)}
            disabled={!puedeSubir || busy}
            title={!itemId ? 'Guarda el borrador para adjuntar fotos' : 'Tomar foto con la cámara'}
            className={`${thumb} shrink-0 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-1 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {busy ? <RefreshCw size={18} className="animate-spin" /> : <Camera size={18} />}
            <span className="text-[8px] font-black uppercase tracking-wider">Cámara</span>
          </button>
        )}

        {canManage && (
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={!puedeSubir || busy}
            title={
              !itemId
                ? 'Guarda el borrador para adjuntar fotos'
                : 'Subir foto desde archivos/galería'
            }
            className={`${thumb} shrink-0 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-1 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {busy ? <RefreshCw size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            <span className="text-[8px] font-black uppercase tracking-wider">
              {puedeCamara ? 'Galería' : 'Foto'}
            </span>
          </button>
        )}

        {evidencias.length === 0 && !canManage && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ImageOff size={14} /> Sin fotos
          </span>
        )}
      </div>

      {canManage && !itemId && (
        <p className="text-[10px] text-amber-600 mt-1">
          Guarda el borrador para poder adjuntar fotos a este hallazgo.
        </p>
      )}

      {/* Galería / archivos: sin `capture` → permite elegir y varias fotos. */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      {/* Cámara in-app a pantalla completa (getUserMedia). */}
      {camOpen && (
        <CameraCapture
          onCapture={(file) => handleFiles({ target: { files: [file], value: '' } })}
          onClose={() => setCamOpen(false)}
        />
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2">
            <X size={28} />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
