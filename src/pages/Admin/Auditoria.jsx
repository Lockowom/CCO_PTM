import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ScrollText, RefreshCw, ChevronDown, ChevronRight, Plus, Minus, Pencil } from 'lucide-react';
import { auditoria as fetchAuditoria, auditoriaMeta } from '../../services/iamService';

const fmt = (ts) => { if (!ts) return '—'; const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }); };
const inp = 'border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400 bg-white';

const ACCION_COLOR = {
  INSERT: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  UPDATE: 'text-amber-700 bg-amber-50 border-amber-100',
  DELETE: 'text-red-700 bg-red-50 border-red-100',
  FORCE_LOGOUT: 'text-purple-700 bg-purple-50 border-purple-100',
};

// Diff de dos objetos jsonb: campos agregados/quitados/cambiados.
function diff(antes, despues) {
  const a = antes || {}, d = despues || {};
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(d)])).sort();
  const out = [];
  for (const k of keys) {
    const va = a[k], vd = d[k];
    const sa = va === undefined ? undefined : JSON.stringify(va);
    const sd = vd === undefined ? undefined : JSON.stringify(vd);
    if (sa === sd) continue;
    out.push({ k, tipo: sa === undefined ? 'add' : sd === undefined ? 'del' : 'mod', antes: sa, despues: sd });
  }
  return out;
}

function Fila({ r }) {
  const [open, setOpen] = useState(false);
  const cambios = useMemo(() => (r.antes || r.despues ? diff(r.antes, r.despues) : []), [r]);
  const color = ACCION_COLOR[r.accion] || 'text-slate-600 bg-slate-50 border-slate-200';
  return (
    <div className="text-[13px]">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-left">
        {cambios.length > 0 ? (open ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />) : <span className="w-3.5 shrink-0" />}
        <span className={`text-[10px] font-black rounded px-1.5 py-0.5 border shrink-0 ${color}`}>{r.accion}</span>
        <span className="font-mono text-[11px] text-slate-500 shrink-0">{r.tabla}</span>
        <span className="text-slate-600 truncate">reg. <span className="font-mono text-[11px]">{r.registro_id || '—'}</span></span>
        <span className="ml-auto text-slate-500 shrink-0 truncate max-w-[160px]">{r.actor}{r.actor_rol ? ` · ${r.actor_rol}` : ''}</span>
        <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">{fmt(r.ts)}</span>
      </button>
      {open && cambios.length > 0 && (
        <div className="px-4 pb-3 pl-11">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 divide-y divide-slate-100 overflow-hidden">
            {cambios.map((c) => (
              <div key={c.k} className="flex items-start gap-2 px-3 py-1.5 text-[12px]">
                {c.tipo === 'add' ? <Plus size={12} className="text-emerald-500 mt-0.5 shrink-0" /> : c.tipo === 'del' ? <Minus size={12} className="text-red-500 mt-0.5 shrink-0" /> : <Pencil size={11} className="text-amber-500 mt-0.5 shrink-0" />}
                <span className="font-mono font-bold text-slate-600 shrink-0">{c.k}</span>
                <span className="min-w-0 break-all">
                  {c.antes !== undefined && <span className="text-red-500 line-through mr-2">{c.antes}</span>}
                  {c.despues !== undefined && <span className="text-emerald-600">{c.despues}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Auditoria() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ tablas: [], acciones: [], total: 0 });
  const [f, setF] = useState({ tabla: '', accion: '', desde: '', hasta: '' });
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchAuditoria({ tabla: f.tabla, accion: f.accion, desde: f.desde, hasta: f.hasta, limit: 300 })); }
    catch (e) { toast.error(e.message || 'No autorizado'); }
    finally { setLoading(false); }
  }, [f]);
  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { auditoriaMeta().then(setMeta).catch(() => {}); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <select value={f.tabla} onChange={(e) => setF({ ...f, tabla: e.target.value })} className={inp}>
          <option value="">Todas las tablas</option>
          {meta.tablas.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={f.accion} onChange={(e) => setF({ ...f, accion: e.target.value })} className={inp}>
          <option value="">Toda acción</option>
          {meta.acciones.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="date" value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} className={inp} />
        <input type="date" value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} className={inp} />
        <button onClick={cargar} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50">
          <RefreshCw size={14} /> Aplicar
        </button>
        <span className="ml-auto text-[11px] text-slate-400 inline-flex items-center gap-1.5"><ScrollText size={13} /> {meta.total} eventos registrados</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Sin registros para el filtro.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r) => <Fila key={r.id} r={r} />)}
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400">Clic en un evento para ver el diff (antes → después). Cubre roles, usuarios y ámbitos IAM.</p>
    </div>
  );
}
