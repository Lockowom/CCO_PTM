import { useState, useCallback, useRef } from 'react';
import { Tags, Search, Loader2, Package } from 'lucide-react';
import { supabase } from '../../supabase';

// Consulta de GRUPO comercial por SKU (o nombre). Lee tms_producto_grupo, que se
// alimenta desde Carga Masiva → Grupos de SKU (Excel del ERP).
export default function ConsultaGrupo() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const debRef = useRef(null);

  const buscar = useCallback(async (texto) => {
    const t = (texto ?? '').trim();
    if (!t) {
      setRows([]);
      setBuscado(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('consultar_grupo', { p_q: t, p_limit: 30 });
      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
      setBuscado(true);
    }
  }, []);

  const onChange = (e) => {
    const v = e.target.value;
    setQ(v);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => buscar(v), 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 text-slate-700">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl grid place-items-center text-indigo-600 shrink-0">
          <Tags size={22} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Grupo por <span className="text-indigo-600">SKU</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Escribe el código (o nombre) del producto y ve a qué grupo pertenece
          </p>
        </div>
      </div>

      <div className="relative max-w-2xl">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={onChange}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              clearTimeout(debRef.current);
              buscar(q);
            }
          }}
          placeholder="Ej: N010500005  o  BAJADA DE SUERO…"
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-400 shadow-sm"
        />
        {loading && (
          <Loader2
            size={18}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
          />
        )}
      </div>

      <div className="max-w-2xl space-y-2">
        {rows.map((r) => (
          <div
            key={r.codigo}
            className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 grid place-items-center shrink-0">
              <Package size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono font-bold text-slate-800 text-sm">{r.codigo}</div>
              <div className="text-[12px] text-slate-500 truncate">{r.producto || '—'}</div>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
              <Tags size={13} /> {r.grupo || 'Sin grupo'}
            </span>
          </div>
        ))}
        {buscado && !loading && rows.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            Sin resultados para “{q}”. ¿Ya subiste el archivo en Carga Masiva → Grupos de SKU?
          </div>
        )}
        {!buscado && (
          <p className="text-[12px] text-slate-400 px-1">
            Los grupos se cargan/actualizan desde <b>Carga Masiva → Grupos de SKU</b> (Excel del
            ERP).
          </p>
        )}
      </div>
    </div>
  );
}
