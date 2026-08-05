import { useEffect, useState } from 'react';
import { FileCheck2, Loader2 } from 'lucide-react';
import { supabase } from '../../../supabase';

const fecha = (value) =>
  value
    ? new Date(value).toLocaleString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';

// Se consulta al expandir una N.V.; no añade tráfico a las búsquedas del Panel.
export default function CertificadosSalida({ operacionId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!operacionId) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    supabase
      .rpc('nv_certificados_salida', { p_operacion_id: operacionId })
      .then(({ data, error }) => {
        if (!active) return;
        // Un usuario sin permiso de informes sigue pudiendo usar el Panel normal.
        setItems(error ? [] : data || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [operacionId]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
      <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
        <FileCheck2 size={15} /> Informes de salida — Calidad (Hito 3)
      </h3>
      {loading ? (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <Loader2 size={14} className="animate-spin" /> Cargando informes…
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((item) => {
            const noConforme = item.resultado === 'NO_CONFORME';
            return (
              <article
                key={item.tarea_id}
                className="rounded-lg border border-white bg-white p-3 text-sm shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-800">
                    {item.folio || 'Informe sin folio'}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${noConforme ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
                  >
                    {item.resultado}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Finalizado {fecha(item.completado_en)} por {item.realizado_nombre || '—'}.
                </p>
                {item.disposicion && (
                  <p className="mt-1 text-xs text-slate-600">
                    <b>Disposición:</b> {item.disposicion}
                  </p>
                )}
                {item.observaciones && (
                  <p className="mt-1 text-xs text-slate-600">
                    <b>Observaciones:</b> {item.observaciones}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
