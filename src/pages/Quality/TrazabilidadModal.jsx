import { X, Loader2, PackageSearch, MapPin, GitBranch } from 'lucide-react';
import { useTrazabilidadProducto, HITO_META, FLAG_META } from '../../services/calidadService';

const ESTADO_EV_CLS = (estado) => {
  const e = (estado || '').toUpperCase();
  if (['CONFORME', 'LIBERAR', 'LIBERADO', 'RESUELTA'].includes(e)) return 'text-emerald-600';
  if (['NO_CONFORME', 'RECHAZAR', 'BAJA', 'MALO', 'ANULADA'].includes(e)) return 'text-rose-600';
  if (['CUARENTENA', 'PENDIENTE', 'EN_PROCESO', 'EN_REVISION', 'REPROCESO'].includes(e))
    return 'text-amber-600';
  return 'text-slate-500';
};

const fmt = (f) => {
  if (!f) return '—';
  try {
    return new Date(f).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return f;
  }
};

// Modal reutilizable: línea de tiempo de un producto por todo el proceso.
const TrazabilidadModal = ({ codigo, partida, ubicacion, producto, onClose }) => {
  const { data, isLoading } = useTrazabilidadProducto(codigo, partida, ubicacion);
  const eventos = data?.eventos || [];
  const flag = data?.estado_actual;
  const flagMeta = flag ? FLAG_META[flag.estado_calidad] || {} : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <GitBranch size={18} className="text-emerald-600" /> Trazabilidad
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              <span className="font-bold">{codigo}</span>
              {producto ? ` · ${producto}` : ''}
              {ubicacion ? (
                <span className="inline-flex items-center gap-0.5 ml-1">
                  <MapPin size={11} /> {ubicacion}
                </span>
              ) : null}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Estado actual */}
        {flag && (
          <div className="px-5 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Estado actual
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${flagMeta?.cls || 'bg-slate-100 text-slate-600 border-slate-200'}`}
              >
                {flagMeta?.label || flag.estado_calidad}
              </span>
              {flag.nota && <span className="text-xs text-slate-400 truncate">— {flag.nota}</span>}
            </div>
          </div>
        )}

        <div className="p-5 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-emerald-500" size={28} />
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-10">
              <PackageSearch size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">Sin eventos de trazabilidad</p>
              <p className="text-xs text-slate-300">
                Este producto aún no tiene checklist, dictamen, acción ni salida registrada.
              </p>
            </div>
          ) : (
            <ol className="relative border-l-2 border-slate-100 ml-2 space-y-4">
              {eventos.map((ev, i) => {
                const hm = HITO_META[ev.hito] || {};
                return (
                  <li key={i} className="ml-4">
                    <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-white border-2 border-emerald-400" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${hm.cls || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {hm.label || ev.hito}
                      </span>
                      <span className="text-sm font-black text-slate-800">{ev.titulo}</span>
                      {ev.estado && (
                        <span className={`text-xs font-black ${ESTADO_EV_CLS(ev.estado)}`}>
                          {ev.estado.replace('_', ' ')}
                        </span>
                      )}
                      {ev.folio && (
                        <span className="text-[10px] font-mono font-black text-slate-400">
                          {ev.folio}
                        </span>
                      )}
                    </div>
                    {ev.detalle && <p className="text-xs text-slate-500 mt-0.5">{ev.detalle}</p>}
                    <p className="text-[11px] text-slate-400 mt-0.5">{fmt(ev.fecha)}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrazabilidadModal;
