import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';

const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 });
const n = (v) => nf.format(Number(v) || 0);

export default function BloqueAuditar() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bloque, setBloque] = useState(null);
  const [lineas, setLineas] = useState([]);
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: b } = await supabase.from('wms_bloques').select('*').eq('codigo', codigo).maybeSingle();
      if (!b) { setLoading(false); return; }
      setBloque(b);
      const { data: its } = await supabase.from('wms_bloque_items').select('*').eq('bloque_id', b.id).order('created_at');
      setLineas((its || []).map((i) => ({
        codigo_producto: i.codigo_producto, descripcion: i.descripcion, unidad_medida: i.unidad_medida,
        partida: i.partida, serie: i.serie, esperada: Number(i.cantidad) || 0, contada: '',
      })));
      setLoading(false);
    })();
  }, [codigo]);

  const setContada = (idx, v) => setLineas((ls) => ls.map((l, i) => (i === idx ? { ...l, contada: v } : l)));
  const marcarTodoConforme = () => setLineas((ls) => ls.map((l) => ({ ...l, contada: String(l.esperada) })));

  const resumen = useMemo(() => {
    let ok = 0, dif = 0, pendientes = 0;
    for (const l of lineas) {
      if (l.contada === '') { pendientes++; continue; }
      if ((Number(l.contada) || 0) - l.esperada === 0) ok++; else dif++;
    }
    return { ok, dif, pendientes };
  }, [lineas]);

  const guardar = async () => {
    if (resumen.pendientes > 0 && !confirm(`Quedan ${resumen.pendientes} productos sin contar (se registran como 0). ¿Guardar igual?`)) return;
    setGuardando(true);
    let esperadoTotal = 0, contadoTotal = 0, ok = 0, dif = 0;
    const detalle = lineas.map((l) => {
      const esperada = Number(l.esperada) || 0, contada = Number(l.contada) || 0;
      const diferencia = Math.round((contada - esperada) * 100) / 100;
      const estado = diferencia === 0 ? 'CUADRADO' : diferencia < 0 ? 'FALTA' : 'SOBRA';
      esperadoTotal += esperada; contadoTotal += contada; if (diferencia === 0) ok++; else dif++;
      return { ...l, esperada, contada, diferencia, estado };
    });
    const estadoGeneral = dif === 0 ? 'cuadrado' : 'con_diferencias';

    const { data: aud, error } = await supabase.from('wms_bloque_auditorias').insert({
      bloque_id: bloque.id, bloque_codigo: bloque.codigo, bodega: bloque.bodega,
      auditor_id: user?.id || null, auditor_nombre: user?.nombre || null,
      esperado_total: esperadoTotal, contado_total: contadoTotal, items_total: detalle.length,
      items_ok: ok, items_dif: dif, estado: estadoGeneral, observaciones: obs.trim() || null,
    }).select().single();
    if (error) { setGuardando(false); return toast.error('No se pudo guardar la auditoría'); }

    const { error: e2 } = await supabase.from('wms_bloque_auditoria_items').insert(
      detalle.map((d) => ({
        auditoria_id: aud.id, codigo_producto: d.codigo_producto, descripcion: d.descripcion,
        unidad_medida: d.unidad_medida, partida: d.partida, serie: d.serie,
        esperada: d.esperada, contada: d.contada, diferencia: d.diferencia, estado: d.estado,
      }))
    );
    setGuardando(false);
    if (e2) return toast.error('Se guardó la cabecera pero falló el detalle');
    setResultado({ ...aud, items: detalle });
    toast[estadoGeneral === 'cuadrado' ? 'success' : 'warning'](estadoGeneral === 'cuadrado' ? '✅ Auditoría cuadrada' : `⚠️ ${dif} con diferencia`);
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="animate-spin text-indigo-500" size={36} /></div>;
  if (!bloque) return <div className="max-w-md mx-auto p-6 text-center"><p className="text-slate-500">Bloque no encontrado.</p><Link to="/inventory/bloques" className="inline-flex mt-3 px-3 py-2 rounded-xl border border-slate-200 font-bold">← Volver</Link></div>;

  if (resultado) {
    const cuadrado = resultado.estado === 'cuadrado';
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className={'rounded-2xl p-6 text-center text-white shadow ' + (cuadrado ? 'bg-emerald-600' : 'bg-amber-500')}>
          {cuadrado ? <CheckCircle2 size={48} className="mx-auto" /> : <AlertTriangle size={48} className="mx-auto" />}
          <div className="mt-2 text-2xl font-black">{cuadrado ? 'Auditoría cuadrada' : 'Hay diferencias'}</div>
          <div className="mt-1 text-white/90">{bloque.bodega} · {bloque.codigo}</div>
          <div className="mt-3 flex justify-center gap-4 text-sm"><span>✔️ {resultado.items_ok} OK</span><span>✖️ {resultado.items_dif} con diferencia</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400"><tr><th className="px-3 py-2">Producto</th><th className="px-3 py-2 text-right">Esperado</th><th className="px-3 py-2 text-right">Contado</th><th className="px-3 py-2 text-right">Dif.</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {resultado.items.map((it, i) => (
                <tr key={i}><td className="px-3 py-2"><div className="font-mono text-xs font-bold text-slate-700">{it.codigo_producto}</div><div className="max-w-[160px] truncate text-xs text-slate-400">{it.descripcion}</div></td>
                  <td className="px-3 py-2 text-right text-slate-500">{n(it.esperada)}</td><td className="px-3 py-2 text-right font-bold">{n(it.contada)}</td>
                  <td className={'px-3 py-2 text-right font-black ' + (it.diferencia < 0 ? 'text-rose-600' : it.diferencia > 0 ? 'text-amber-600' : 'text-emerald-600')}>{it.diferencia > 0 ? '+' : ''}{n(it.diferencia)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <Link to={`/inventory/bloque/${bloque.codigo}`} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-center">Ver bloque</Link>
          <Link to="/inventory/bloques" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-center">Terminar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
      <Link to={`/inventory/bloque/${bloque.codigo}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> {bloque.codigo}</Link>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <h1 className="text-lg font-black text-slate-900 flex items-center gap-2"><Search size={20} className="text-indigo-500" /> Auditar bloque</h1>
        <p className="text-sm text-slate-500">🏬 {bloque.bodega}{bloque.nombre ? ` · ${bloque.nombre}` : ''} · {lineas.length} productos</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✔️ {resumen.ok} OK</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">✖️ {resumen.dif} dif</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">⏳ {resumen.pendientes} sin contar</span>
          <button className="ml-auto text-sm font-bold text-indigo-600 hover:underline" onClick={marcarTodoConforme}>Marcar todo conforme</button>
        </div>
      </div>

      {lineas.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400">El bloque no tiene productos para auditar.</div> : (
        <div className="space-y-2">
          {lineas.map((l, idx) => {
            const contada = l.contada === '' ? null : Number(l.contada) || 0;
            const dif = contada == null ? null : contada - l.esperada;
            return (
              <div key={idx} className={'bg-white rounded-2xl border p-4 shadow-sm ' + (dif == null ? 'border-slate-200' : dif === 0 ? 'border-emerald-200' : 'border-amber-200')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><div className="font-bold text-slate-800">{l.descripcion || l.codigo_producto}</div><div className="font-mono text-xs text-slate-500">{l.codigo_producto}</div>{(l.partida || l.serie) && <div className="mt-0.5 text-xs text-slate-400">{[l.partida, l.serie].filter(Boolean).join(' / ')}</div>}</div>
                  <div className="shrink-0 text-right"><div className="text-[10px] uppercase text-slate-400 font-bold">Esperado</div><div className="text-lg font-black text-slate-700">{n(l.esperada)} <span className="text-xs font-normal text-slate-400">{l.unidad_medida}</span></div></div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 items-stretch gap-2">
                    <button type="button" className="w-12 rounded-xl border border-slate-200 text-xl font-bold text-slate-600" onClick={() => setContada(idx, String(Math.max(0, (Number(l.contada) || 0) - 1)))}>−</button>
                    <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-center text-lg font-black" inputMode="decimal" placeholder="contar…" value={l.contada} onChange={(e) => setContada(idx, e.target.value)} />
                    <button type="button" className="w-12 rounded-xl border border-slate-200 text-xl font-bold text-slate-600" onClick={() => setContada(idx, String((Number(l.contada) || 0) + 1))}>+</button>
                  </div>
                  <div className="w-24 text-center">
                    {dif == null ? <span className="text-xs text-slate-300">—</span> :
                      <span className={'text-[11px] font-bold px-2 py-1 rounded-full ' + (dif === 0 ? 'bg-emerald-100 text-emerald-700' : dif < 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700')}>{dif === 0 ? '✅ OK' : dif < 0 ? `❌ ${n(dif)}` : `⚠️ +${n(dif)}`}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Observaciones de la auditoría (opcional)" value={obs} onChange={(e) => setObs(e.target.value)} />
          <button onClick={guardar} disabled={guardando} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
            {guardando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar auditoría
          </button>
        </div>
      )}
    </div>
  );
}
