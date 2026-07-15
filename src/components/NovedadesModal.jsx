import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, X, Plus, ArrowUp, Wrench } from 'lucide-react';
import { RELEASE_NOTES } from '../constants/releaseNotes';

// ── Novedades / Notas del parche ────────────────────────────────────────────
// Muestra los cambios de la(s) versión(es) nuevas la primera vez que el usuario
// abre la app tras una actualización (compara con la última versión vista,
// guardada en localStorage). También se puede reabrir a mano disparando el
// evento window 'cco:novedades' (p. ej. tocando la versión en el menú).
const KEY = 'cco_novedades_ultima_version';
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '';

// Compara "1.34.0" vs "1.33.9" → >0 si a es mayor.
function cmpVer(a, b) {
  const pa = String(a || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b || '0').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0); }
  return 0;
}

// API para reabrir el modal desde cualquier parte.
export function mostrarNovedades() {
  window.dispatchEvent(new CustomEvent('cco:novedades'));
}

const TIPO_META = {
  nuevo: { label: 'Nuevo', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Plus },
  mejora: { label: 'Mejora', cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: ArrowUp },
  fix: { label: 'Arreglo', cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: Wrench },
};

export default function NovedadesModal() {
  const [open, setOpen] = useState(false);
  const [notas, setNotas] = useState([]);

  // Auto-mostrar tras actualizar.
  useEffect(() => {
    try {
      const last = localStorage.getItem(KEY);
      if (!last) {
        // Primer uso (o primer despliegue de esta función): no molestar, solo marcar.
        localStorage.setItem(KEY, APP_VERSION);
        return;
      }
      if (cmpVer(APP_VERSION, last) > 0) {
        const nuevas = RELEASE_NOTES.filter((n) => cmpVer(n.version, last) > 0);
        if (nuevas.length) { setNotas(nuevas); setOpen(true); }
        else localStorage.setItem(KEY, APP_VERSION);
      }
    } catch { /* localStorage no disponible: ignorar */ }
  }, []);

  // Reabrir a mano (muestra todas las notas recientes).
  useEffect(() => {
    const onOpen = () => { setNotas(RELEASE_NOTES); setOpen(true); };
    window.addEventListener('cco:novedades', onOpen);
    return () => window.removeEventListener('cco:novedades', onOpen);
  }, []);

  const cerrar = useCallback(() => {
    try { localStorage.setItem(KEY, APP_VERSION); } catch { /* ignore */ }
    setOpen(false);
  }, []);

  if (!open || !notas.length) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={cerrar}>
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-[slideup_.25s_ease]"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <style>{`@keyframes slideup{from{transform:translateY(24px);opacity:.6}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Cabecera */}
        <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 text-white px-6 pt-6 pb-5">
          <button onClick={cerrar} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 text-white/90 text-[11px] font-black uppercase tracking-widest">
            <Sparkles size={15} /> Novedades
          </div>
          <h2 className="text-2xl font-black mt-1 leading-tight">¡La app se actualizó!</h2>
          <p className="text-white/80 text-sm mt-0.5">Versión {notas[0]?.version} · esto es lo nuevo</p>
        </div>

        {/* Lista de versiones */}
        <div className="overflow-y-auto px-5 py-4 space-y-5">
          {notas.map((n) => (
            <div key={n.version}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{n.emoji || '🚀'}</span>
                <div>
                  <div className="font-black text-slate-900 text-sm leading-tight">{n.titulo}</div>
                  <div className="text-[11px] text-slate-400 font-mono">v{n.version} · {n.fecha}</div>
                </div>
              </div>
              <ul className="space-y-2">
                {n.cambios.map((c, i) => {
                  const item = typeof c === 'string' ? { texto: c } : c;
                  const meta = TIPO_META[item.tipo];
                  const Icon = meta?.icon;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      {meta ? (
                        <span className={`shrink-0 inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${meta.cls} mt-0.5`}>
                          {Icon && <Icon size={9} />} {meta.label}
                        </span>
                      ) : (
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" />
                      )}
                      <span className="text-sm text-slate-700 leading-snug">{item.texto}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Pie */}
        <div className="px-5 py-4 border-t border-slate-100">
          <button onClick={cerrar} className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm transition-colors">
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
