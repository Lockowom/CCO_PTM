import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Camera, MapPin, PenLine, Check, X } from 'lucide-react';
import { subirEvidencia, registrarPOD } from '../../services/tmsService';

// Captura de Prueba de Entrega: recibido por + GPS + foto + firma → sube a
// Storage y registra el POD (marca la N.V. Entregado). onDone() al terminar.
export default function PodCapture({ ordenId, onDone, onCancel }) {
  const [recibido, setRecibido] = useState('');
  const [gps, setGps] = useState('');
  const [foto, setFoto] = useState(null);       // File
  const [fotoUrl, setFotoUrl] = useState(null); // preview
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  // ── Firma (canvas) ──
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio; c.height = rect.height * ratio;
    ctx.scale(ratio, ratio); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0f172a';
    const pos = (e) => { const r = c.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; };
    const down = (e) => { e.preventDefault(); drawing.current = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const move = (e) => { if (!drawing.current) return; e.preventDefault(); const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); dirty.current = true; };
    const up = () => { drawing.current = false; };
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);
  const limpiarFirma = () => { const c = canvasRef.current; const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); dirty.current = false; };

  const onFoto = (e) => { const f = e.target.files?.[0]; if (!f) return; setFoto(f); setFotoUrl(URL.createObjectURL(f)); };
  const usarGPS = () => { if (!navigator.geolocation) return toast.info('GPS no disponible'); navigator.geolocation.getCurrentPosition(
    (p) => setGps(`${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`),
    () => toast.error('No se pudo obtener ubicación')); };

  const firmaBlob = () => new Promise((res) => { if (!dirty.current) return res(null); canvasRef.current.toBlob((b) => res(b), 'image/png'); });

  const confirmar = async () => {
    if (!recibido.trim()) return toast.info('Indica quién recibió');
    setBusy(true);
    try {
      const payload = { recibido_por: recibido.trim(), gps };
      if (foto) payload.foto_url = await subirEvidencia(ordenId, 'foto', foto, (foto.name.split('.').pop() || 'jpg'));
      const fb = await firmaBlob();
      if (fb) payload.firma_url = await subirEvidencia(ordenId, 'firma', fb, 'png');
      const res = await registrarPOD(ordenId, payload);
      if (res.ok) { toast.success('Entrega registrada'); onDone?.(); }
      else toast.error(res.error || 'No se pudo registrar');
    } catch (e) { toast.error('Error al subir evidencia: ' + (e?.message || '')); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <input value={recibido} onChange={(e) => setRecibido(e.target.value)} placeholder="Recibido por (nombre)" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />

      <div className="flex gap-2">
        <input value={gps} onChange={(e) => setGps(e.target.value)} placeholder="GPS (lat,lon)" className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
        <button onClick={usarGPS} className="px-3 rounded-xl border border-slate-200 text-slate-600 text-sm inline-flex items-center gap-1"><MapPin size={15} /> Ubicar</button>
      </div>

      <div>
        <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-sm font-semibold cursor-pointer hover:border-emerald-300">
          <Camera size={17} /> {foto ? 'Cambiar foto' : 'Tomar / adjuntar foto'}
          <input type="file" accept="image/*" capture="environment" onChange={onFoto} className="hidden" />
        </label>
        {fotoUrl && <img src={fotoUrl} alt="evidencia" className="mt-2 w-full max-h-44 object-cover rounded-xl border border-slate-200" />}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1"><span className="text-[11px] font-bold text-slate-500 uppercase inline-flex items-center gap-1"><PenLine size={13} /> Firma</span><button onClick={limpiarFirma} className="text-[11px] text-slate-400 hover:text-red-500">Limpiar</button></div>
        <canvas ref={canvasRef} className="w-full h-36 rounded-xl border border-slate-200 bg-white touch-none" style={{ touchAction: 'none' }} />
      </div>

      <div className="flex gap-2 pt-1">
        {onCancel && <button onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold"><X size={15} /></button>}
        <button onClick={confirmar} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 inline-flex items-center justify-center gap-2"><Check size={16} /> {busy ? 'Registrando…' : 'Confirmar entrega'}</button>
      </div>
    </div>
  );
}
