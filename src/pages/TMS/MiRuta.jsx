import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Truck,
  RefreshCw,
  PackageCheck,
  X,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Wifi
} from 'lucide-react';
import {
  ESTADO_META,
  SIGUIENTE,
  listarOrdenes,
  transicionOrden,
  miConductorId
} from '../../services/tmsService';
import PodCapture from './PodCapture';

const ACTIVAS = ['programado', 'en_carga', 'despachado', 'en_ruta'];

export default function MiRuta() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [misOnly, setMisOnly] = useState(true);
  const [conductorId, setConductorId] = useState(null);
  const [pod, setPod] = useState(null); // orden en captura POD
  const [busyId, setBusyId] = useState(null);

  const cargar = useCallback(() => {
    setLoading(true);
    Promise.all([listarOrdenes(), miConductorId()])
      .then(([o, cid]) => {
        setOrdenes(o);
        setConductorId(cid);
        setLoading(false);
      })
      .catch(() => {
        setOrdenes([]);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const lista = useMemo(
    () =>
      ordenes
        .filter((o) => ACTIVAS.includes(o.estado))
        .filter((o) => !(misOnly && conductorId) || o.conductor_id === conductorId)
        .sort((a, b) => ACTIVAS.indexOf(b.estado) - ACTIVAS.indexOf(a.estado)),
    [ordenes, misOnly, conductorId]
  );

  const avanzar = async (o) => {
    const sig = SIGUIENTE[o.estado];
    if (!sig) return;
    setBusyId(o.id);
    const res = await transicionOrden(o.id, sig.to);
    setBusyId(null);
    if (res.ok) {
      toast.success(sig.label);
      cargar();
    } else toast.error(res.error || 'Error');
  };

  return (
    <div className="tms-my-route max-w-md mx-auto pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Truck className="text-orange-500" size={22} /> Mi Ruta
          </h1>
          <p className="text-[12px] text-slate-500">
            Hoja de ruta del chofer · {lista.length} paradas activas
          </p>
        </div>
        <button onClick={cargar} className="p-2 rounded-xl border border-slate-200 text-slate-500">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="sr-only">Sincronizar ruta</span>
        </button>
      </div>

      {conductorId && (
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-4 w-fit">
          {[
            ['mis', true],
            ['todas', false]
          ].map(([k, v]) => (
            <button
              key={k}
              onClick={() => setMisOnly(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${misOnly === v ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
            >
              {v ? 'Mis órdenes' : 'Todas'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400">Cargando…</div>
      ) : lista.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          No tienes entregas activas ahora.
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((o) => {
            const m = ESTADO_META[o.estado];
            const sig = SIGUIENTE[o.estado];
            return (
              <div
                key={o.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[15px] font-black text-slate-800">
                      {o.folio || `#${o.id}`}
                    </div>
                    <div className="text-[13px] text-slate-500 truncate">{o.cliente || '—'}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      N.V. {o.nv || '—'}
                      {o.vehiculo?.patente ? ` · 🚚 ${o.vehiculo.patente}` : ''}
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full text-[10px] font-bold px-2 py-1 shrink-0"
                    style={{ background: m.bg, color: m.text }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    {m.label}
                  </span>
                </div>
                <div className="mt-3">
                  {(o.direccion || o.contacto) && (
                    <div className="tms-stop-context">
                      {o.direccion && (
                        <span>
                          <MapPin size={14} />
                          {o.direccion}
                        </span>
                      )}
                      {o.contacto && (
                        <span>
                          <Phone size={14} />
                          {o.contacto}
                        </span>
                      )}
                    </div>
                  )}
                  {o.direccion && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.direccion)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="tms-navigation-link"
                    >
                      <Navigation size={15} /> Abrir navegación
                    </a>
                  )}
                  {o.estado === 'en_ruta' ? (
                    <button
                      onClick={() => setPod(o)}
                      className="w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-600 inline-flex items-center justify-center gap-2"
                    >
                      <PackageCheck size={17} /> Entregar (POD)
                    </button>
                  ) : sig ? (
                    <button
                      onClick={() => avanzar(o)}
                      disabled={busyId === o.id}
                      className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {sig.label} <ChevronRight size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sheet POD */}
      {pod && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center"
          onClick={() => setPod(null)}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-black text-slate-800 flex items-center gap-2">
                <PackageCheck size={18} className="text-emerald-500" /> Entrega · {pod.folio}
              </h3>
              <button onClick={() => setPod(null)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>
            <PodCapture
              ordenId={pod.id}
              onDone={() => {
                setPod(null);
                cargar();
              }}
              onCancel={() => setPod(null)}
            />
          </div>
        </div>
      )}
      <div className="tms-mobile-sync" role="status">
        <Wifi size={13} /> Datos sincronizados al actualizar
      </div>
    </div>
  );
}
