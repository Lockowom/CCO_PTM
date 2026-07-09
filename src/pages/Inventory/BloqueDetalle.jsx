import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Pencil, Lock, Unlock, Trash2, Search, Plus, Loader2, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { QR, qrDataUrl } from '../../components/inventory/QR';
import { ProductoAutocomplete } from '../../components/inventory/ProductoAutocomplete';
import { fechaLocal } from './Bloques';

const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 });
const n = (v) => nf.format(Number(v) || 0);

export default function BloqueDetalle() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const puedeGestionar = hasPermission?.('manage_inventory') ?? true;

  const [bloque, setBloque] = useState(null);
  const [items, setItems] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [bodegaTmp, setBodegaTmp] = useState('');
  const [nombreTmp, setNombreTmp] = useState('');

  const [skuQuery, setSkuQuery] = useState('');
  const [prod, setProd] = useState(null);
  const [partida, setPartida] = useState('');
  const [serie, setSerie] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    const { data: b, error } = await supabase.from('wms_bloques').select('*').eq('codigo', codigo).maybeSingle();
    if (error || !b) { setLoading(false); setBloque(null); return; }
    setBloque(b); setBodegaTmp(b.bodega); setNombreTmp(b.nombre || '');
    const { data: its } = await supabase.from('wms_bloque_items').select('*').eq('bloque_id', b.id).order('created_at');
    setItems(its || []);
    const { data: auds } = await supabase.from('wms_bloque_auditorias').select('*').eq('bloque_id', b.id).order('created_at', { ascending: false });
    setAuditorias(auds || []);
    setLoading(false);
  };
  useEffect(() => { setLoading(true); cargar(); /* eslint-disable-next-line */ }, [codigo]);

  const urlBloque = `${window.location.origin}/inventory/bloque/${bloque?.codigo || ''}`;
  const totalUnidades = items.reduce((s, i) => s + Number(i.cantidad || 0), 0);

  const guardarCabecera = async () => {
    const { error } = await supabase.from('wms_bloques').update({ bodega: bodegaTmp.trim(), nombre: nombreTmp.trim() || null, updated_at: new Date().toISOString() }).eq('id', bloque.id);
    if (error) return toast.error('No se pudo guardar');
    setBloque({ ...bloque, bodega: bodegaTmp.trim(), nombre: nombreTmp.trim() });
    setEditando(false); toast.success('Bloque actualizado');
  };

  const toggleEstado = async () => {
    const nuevo = bloque.estado === 'activo' ? 'cerrado' : 'activo';
    const { error } = await supabase.from('wms_bloques').update({ estado: nuevo, updated_at: new Date().toISOString() }).eq('id', bloque.id);
    if (error) return toast.error('No se pudo cambiar');
    setBloque({ ...bloque, estado: nuevo }); toast.success(`Bloque ${nuevo}`);
  };

  const ingresar = async () => {
    if (!prod) return toast.error('Elegí un producto');
    if (cantidad === '' || Number(cantidad) < 0 || isNaN(Number(cantidad))) return toast.error('Cantidad inválida');
    setGuardando(true);
    const { data, error } = await supabase.from('wms_bloque_items').insert({
      bloque_id: bloque.id, codigo_producto: prod.codigo_producto, descripcion: prod.producto,
      unidad_medida: prod.unidad_medida, partida: partida.trim() || null, serie: serie.trim() || null,
      cantidad: Number(cantidad), creado_por_nombre: user?.nombre || null,
    }).select().single();
    setGuardando(false);
    if (error) return toast.error('No se pudo ingresar');
    setItems((its) => [...its, data]);
    setProd(null); setSkuQuery(''); setPartida(''); setSerie(''); setCantidad('');
    toast.success('Producto ingresado');
  };

  const quitarItem = async (id) => {
    const { error } = await supabase.from('wms_bloque_items').delete().eq('id', id);
    if (error) return toast.error('No se pudo quitar');
    setItems((its) => its.filter((i) => i.id !== id));
  };

  const eliminarBloque = async () => {
    if (!confirm(`¿Eliminar el bloque ${bloque.codigo} y sus productos?`)) return;
    const { error } = await supabase.from('wms_bloques').delete().eq('id', bloque.id);
    if (error) return toast.error('No se pudo eliminar');
    toast.success('Bloque eliminado'); navigate('/inventory/bloques');
  };

  const imprimir = async () => {
    const dataUrl = await qrDataUrl(urlBloque, 300);
    const filas = items.map((i) => `<tr><td>${i.codigo_producto}</td><td>${i.descripcion || ''}</td><td>${i.partida || ''}</td><td>${i.serie || ''}</td><td style="text-align:right">${n(i.cantidad)} ${i.unidad_medida || ''}</td></tr>`).join('');
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return toast.error('Habilitá las ventanas emergentes para imprimir');
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${bloque.codigo}</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;color:#0f172a}.top{display:flex;gap:24px;align-items:center;border-bottom:2px solid #4f46e5;padding-bottom:16px;margin-bottom:16px}h1{margin:0;font-size:26px}.cod{font-family:monospace;font-size:20px;color:#4f46e5;font-weight:bold}.meta{color:#475569;font-size:14px;margin-top:4px}table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left}th{background:#f1f5f9}</style></head><body>
      <div class="top"><img src="${dataUrl}" width="150" height="150"/><div><h1>${bloque.bodega}</h1><div class="cod">${bloque.codigo}</div><div class="meta">${bloque.nombre || ''}</div><div class="meta">${items.length} productos · ${n(totalUnidades)} unidades</div><div class="meta">Creado: ${fechaLocal(bloque.created_at)}</div></div></div>
      <table><thead><tr><th>SKU</th><th>Descripción</th><th>Partida</th><th>Serie</th><th>Cantidad</th></tr></thead><tbody>${filas || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">Sin productos</td></tr>'}</tbody></table></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 350);
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="animate-spin text-indigo-500" size={36} /></div>;
  if (!bloque) return (
    <div className="max-w-md mx-auto p-6 text-center">
      <p className="text-slate-500">Bloque no encontrado.</p>
      <Link to="/inventory/bloques" className="inline-flex mt-3 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">← Volver</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
      <Link to="/inventory/bloques" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Bloques</Link>

      {/* Cabecera + QR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex flex-col items-center gap-2">
            <QR value={urlBloque} size={150} />
            <span className="font-mono text-sm font-black text-indigo-600">{bloque.codigo}</span>
          </div>
          <div className="min-w-0 flex-1">
            {editando ? (
              <div className="space-y-2">
                <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" value={bodegaTmp} onChange={(e) => setBodegaTmp(e.target.value)} placeholder="Bodega" />
                <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" value={nombreTmp} onChange={(e) => setNombreTmp(e.target.value)} placeholder="Nombre del bloque" />
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-black" onClick={guardarCabecera}>Guardar</button>
                  <button className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold" onClick={() => { setEditando(false); setBodegaTmp(bloque.bodega); setNombreTmp(bloque.nombre || ''); }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 flex items-center gap-2"><Warehouse size={20} className="text-indigo-500" /> {bloque.bodega}</h1>
                  <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + (bloque.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')}>{bloque.estado === 'activo' ? 'Activo' : 'Cerrado'}</span>
                </div>
                {bloque.nombre && <div className="text-slate-600">{bloque.nombre}</div>}
                <div className="mt-1 text-sm text-slate-500">{items.length} productos · {n(totalUnidades)} unidades</div>
                <div className="text-xs text-slate-400">Creado por {bloque.creado_por_nombre || '—'} · {fechaLocal(bloque.created_at)}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.length > 0 && <button className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1.5" onClick={() => navigate(`/inventory/bloque/${bloque.codigo}/auditar`)}><Search size={14} /> Auditar</button>}
                  <button className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5" onClick={imprimir}><Printer size={14} /> Imprimir QR</button>
                  <button className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5" onClick={() => setEditando(true)}><Pencil size={14} /> Editar</button>
                  {puedeGestionar && <button className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5" onClick={toggleEstado}>{bloque.estado === 'activo' ? <><Lock size={14} /> Cerrar</> : <><Unlock size={14} /> Reabrir</>}</button>}
                  {puedeGestionar && <button className="px-3 py-2 rounded-xl border border-slate-200 text-rose-600 text-xs font-black flex items-center gap-1.5" onClick={eliminarBloque}><Trash2 size={14} /> Eliminar</button>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ingreso */}
      {bloque.estado === 'activo' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
          <h2 className="font-black text-slate-700 text-sm">Ingresar producto</h2>
          <ProductoAutocomplete value={skuQuery} onChange={(v) => { setSkuQuery(v); if (!v) setProd(null); }}
            onSelect={(p) => { setProd(p); setSkuQuery(`${p.codigo_producto} — ${p.producto}`); }} />
          <div className="grid grid-cols-3 gap-2">
            <input className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Partida" value={partida} onChange={(e) => setPartida(e.target.value)} />
            <input className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Serie" value={serie} onChange={(e) => setSerie(e.target.value)} />
            <input className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" inputMode="decimal" placeholder="Cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </div>
          <button onClick={ingresar} disabled={guardando} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
            {guardando ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Agregar al bloque
          </button>
        </div>
      )}

      {/* Productos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3"><h3 className="font-black text-slate-700 text-sm">Productos del bloque</h3><span className="text-xs text-slate-400">{items.length}</span></div>
        {items.length === 0 ? <div className="px-4 pb-4 text-sm text-slate-400">Todavía no hay productos ingresados.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400"><tr><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2">Partida/Serie</th><th className="px-3 py-2 text-right">Cant.</th><th className="px-3 py-2"></th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-slate-700">{i.codigo_producto}</td>
                    <td className="px-3 py-2 text-slate-600 max-w-[200px] truncate" title={i.descripcion}>{i.descripcion}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{[i.partida, i.serie].filter(Boolean).join(' / ') || '—'}</td>
                    <td className="px-3 py-2 text-right font-bold">{n(i.cantidad)} <span className="text-xs font-normal text-slate-400">{i.unidad_medida}</span></td>
                    <td className="px-3 py-2 text-right">{bloque.estado === 'activo' && <button className="text-rose-400 hover:text-rose-600" onClick={() => quitarItem(i.id)}><Trash2 size={15} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de auditorías */}
      {auditorias.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h3 className="font-black text-slate-700 text-sm mb-2">Historial de auditorías</h3>
          <div className="divide-y divide-slate-100">
            {auditorias.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 text-sm">
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + (a.estado === 'cuadrado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{a.estado === 'cuadrado' ? '✅ Cuadrado' : `⚠️ ${a.items_dif} dif`}</span>
                <div className="min-w-0 flex-1"><div className="truncate text-slate-600">{a.auditor_nombre || '—'}</div><div className="text-xs text-slate-400">{fechaLocal(a.created_at)} · {a.items_ok}/{a.items_total} OK</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
