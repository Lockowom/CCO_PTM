import React, { useEffect, useState } from 'react';
import { Smartphone, RefreshCw, FlaskConical, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { getOTAChannel, setOTAChannel } from '../services/mobileService';

/**
 * Selector de canal OTA de ESTE dispositivo (solo app Android).
 * Permite asignar un PDA de PRUEBA al canal `beta` para validar una versión
 * antes de promoverla a `production` (toda la bodega). Volver a `production`
 * deshace la asignación. No aparece en web.
 */
const CanalOTA = () => {
  const [canal, setCanal] = useState(null);
  const [busy, setBusy] = useState(false);

  const nativo = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!nativo) return;
    getOTAChannel().then(setCanal);
  }, [nativo]);

  if (!nativo) return null; // en web no aplica

  const cambiar = async (destino) => {
    if (destino === canal) return;
    if (destino === 'beta' && !confirm('¿Poner ESTE dispositivo en el canal BETA de pruebas? Recibirá versiones antes que el resto de la bodega.')) return;
    setBusy(true);
    try {
      const r = await setOTAChannel(destino);
      setCanal(r);
      toast.success(destino === 'beta'
        ? 'Dispositivo en canal BETA — recibirá las versiones de prueba'
        : 'Dispositivo en canal PRODUCCIÓN — versión estable');
    } catch (e) {
      toast.error(`No se pudo cambiar el canal: ${e.message}`);
    } finally { setBusy(false); }
  };

  const esBeta = canal === 'beta';

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${esBeta ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Smartphone size={18} className={esBeta ? 'text-amber-600' : 'text-slate-400'} />
          <div>
            <p className="text-sm font-black text-slate-800">Canal de actualizaciones (este dispositivo)</p>
            <p className="text-xs text-slate-500">
              {canal == null ? 'Consultando…' : esBeta
                ? '⚠ En BETA: recibe versiones de prueba antes que la bodega.'
                : 'En PRODUCCIÓN: versión estable, igual que el resto.'}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => cambiar('production')} disabled={busy || canal === 'production'}
            className={`px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5 border transition-colors disabled:opacity-60 ${canal === 'production' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}>
            {busy && canal !== 'production' ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={13} />} Producción
          </button>
          <button onClick={() => cambiar('beta')} disabled={busy || esBeta}
            className={`px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5 border transition-colors disabled:opacity-60 ${esBeta ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'}`}>
            {busy && !esBeta ? <RefreshCw size={13} className="animate-spin" /> : <FlaskConical size={13} />} Beta (pruebas)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanalOTA;
