import { useEffect, useState } from 'react';
import { AlertTriangle, DownloadCloud, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { versionOTA, buscarActualizacion } from '../services/mobileService';
import { obtenerGobernanzaOTA } from '../services/otaDeployService';

// Compara versiones tipo "1.55.40". Devuelve -1 si a<b, 0 igual, 1 si a>b.
const cmp = (a, b) => {
  const pa = String(a || '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const pb = String(b || '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0,
      y = pb[i] || 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
};

/**
 * Banner app-wide (solo app Android) que exige actualizar cuando la versión del
 * dispositivo es menor a la "versión mínima obligatoria" configurada en
 * Admin → Monitor (gobernanza OTA). En web/compliant retorna null.
 */
export default function OtaBanner() {
  const [req, setReq] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    (async () => {
      try {
        const g = await obtenerGobernanzaOTA();
        if (!g?.obligatorio || !g?.min_version) return;
        const v = await versionOTA();
        const cur = v?.bundle || v?.native || '0.0.0';
        if (cmp(cur, g.min_version) < 0) setReq({ min: g.min_version, msg: g.mensaje, cur });
      } catch {
        /* silencioso */
      }
    })();
  }, []);

  if (!req) return null;
  const actualizar = async () => {
    setBusy(true);
    const r = await buscarActualizacion();
    setBusy(false);
    if (r.estado === 'error') toast.error('No se pudo actualizar');
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[200] bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-3 text-[13px] font-bold shadow-lg">
      <AlertTriangle size={16} className="shrink-0" />
      <span className="truncate">
        {req.msg || `Actualización requerida (mín. ${req.min}). Tu versión: ${req.cur}.`}
      </span>
      <button
        onClick={actualizar}
        disabled={busy}
        className="ml-1 inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-lg px-2.5 py-1 shrink-0"
      >
        {busy ? <RefreshCw size={13} className="animate-spin" /> : <DownloadCloud size={13} />}{' '}
        Actualizar
      </button>
    </div>
  );
}
