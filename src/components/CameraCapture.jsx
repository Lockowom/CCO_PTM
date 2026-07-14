import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, RefreshCw, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Cámara in-app a PANTALLA COMPLETA (getUserMedia) — OTA-safe (sin plugin nativo),
 * funciona en el WebView de Android (Samsung Galaxy S24, Motorola Edge 50 Pro, etc.).
 * Flujo: previsualiza → toma → repetir / usar. Devuelve un File JPEG por onCapture.
 * Adaptada a móvil: `object-cover`, `playsInline`, safe-area (notch/gestos),
 * botón de captura grande y cámara trasera por defecto.
 *
 * Props: onCapture(file:File), onClose()
 */
const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facing, setFacing] = useState('environment'); // trasera por defecto
  const [preview, setPreview] = useState(null);         // objectURL de la foto tomada
  const [blob, setBlob] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(true);

  const stop = useCallback(() => {
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch (_) { /* noop */ }
    streamRef.current = null;
  }, []);

  const start = useCallback(async (mode) => {
    stop();
    setStarting(true); setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('sin getUserMedia');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e) {
      setError('No se pudo abrir la cámara. Revisa el permiso de cámara de la app y vuelve a intentar (o usa "Galería").');
    } finally { setStarting(false); }
  }, [stop]);

  useEffect(() => {
    start(facing);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarCamara = () => {
    const n = facing === 'environment' ? 'user' : 'environment';
    setFacing(n); start(n);
  };

  const tomar = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return toast.error('La cámara aún no está lista');
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((b) => {
      if (!b) return toast.error('No se pudo capturar la foto');
      setBlob(b);
      setPreview(URL.createObjectURL(b));
      stop();
    }, 'image/jpeg', 0.9);
  };

  const repetir = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null); setBlob(null); start(facing);
  };

  const usar = () => {
    if (!blob) return;
    const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
    if (preview) URL.revokeObjectURL(preview);
    onCapture?.(file);
    onClose?.();
  };

  const cerrar = () => { stop(); if (preview) URL.revokeObjectURL(preview); onClose?.(); };

  return (
    <div
      className="fixed inset-0 z-[300] bg-black flex flex-col select-none"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
        <button onClick={cerrar} className="p-2 -m-2" aria-label="Cerrar"><X size={26} /></button>
        <span className="text-sm font-black tracking-wide">CÁMARA</span>
        <button onClick={cambiarCamara} className="p-2 -m-2 disabled:opacity-30" disabled={!!preview || !!error} aria-label="Cambiar cámara"><RefreshCw size={22} /></button>
      </div>

      {/* Visor / preview */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        {error ? (
          <div className="text-white/80 text-center px-8 text-sm leading-relaxed">{error}</div>
        ) : preview ? (
          <img src={preview} alt="captura" className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        {starting && !preview && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            <RefreshCw className="animate-spin" size={30} />
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      <div className="px-6 py-7 flex items-center justify-center gap-10 shrink-0">
        {preview ? (
          <>
            <button onClick={repetir} className="flex flex-col items-center gap-1 text-white active:scale-95">
              <RotateCcw size={28} /><span className="text-[11px] font-bold">Repetir</span>
            </button>
            <button onClick={usar} className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg active:scale-95" aria-label="Usar foto">
              <Check size={32} />
            </button>
          </>
        ) : (
          <button onClick={tomar} disabled={starting || !!error}
            className="w-[76px] h-[76px] rounded-full border-[5px] border-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
            aria-label="Tomar foto">
            <span className="w-14 h-14 rounded-full bg-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
