import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Save, Trash2, Loader2, Eraser } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { ProductoAutocomplete } from '../../components/inventory/ProductoAutocomplete';
import { detalleProducto, stockSistema, calcEstado } from '../../services/inventario';
import { n, estadoStyle, getSesionActiva, setSesionActiva } from '../../components/inventory/ui';

export default function Conteo() {
  const { user } = useAuth();
  const [sesiones, setSesiones] = useState([]);
  const [activa, setActiva] = useState(getSesionActiva());
  const [ubicacion, setUbicacion] = useState('');
  const [skuQuery, setSkuQuery] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [partida, setPartida] = useState('');
  const [serie, setSerie] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const [recientes, setRecientes] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('wms_cc_sesiones').select('*').order('created_at', { ascending: false });
      const list = data || [];
      setSesiones(list);
      const abiertas = list.filter((s) => s.estado === 'abierta');
      const savedOk = abiertas.find((s) => s.id === getSesionActiva());
      const pick = savedOk?.id || abiertas[0]?.id || '';
      setActiva(pick); setSesionActiva(pick);
    })();
  }, []);

  const sesionActiva = sesiones.find((s) => s.id === activa) || null;

  const cargarRecientes = async () => {
    if (!activa) { setRecientes([]); return; }
    const { data } = await supabase.from('wms_cc_conteos').select('*').eq('sesion_id', activa).order('created_at', { ascending: false }).limit(40);
    setRecientes(data || []);
  };
  useEffect(() => { cargarRecientes(); /* eslint-disable-next-line */ }, [activa]);

  const elegirProducto = async (p) => {
    setSkuQuery(`${p.codigo_producto} — ${p.producto}`);
    setPartida(''); setSerie('');
    setDetalle(await detalleProducto(p.codigo_producto));
  };

  const limpiar = (keepUbic = true) => {
    setSkuQuery(''); setDetalle(null); setPartida(''); setSerie(''); setCantidad(''); setObs('');
    if (!keepUbic) setUbicacion('');
  };

  const cambiarSesion = (id) => { setActiva(id); setSesionActiva(id); };

  const guardar = async () => {
    if (!detalle?.producto) return toast.error('Elegí un producto primero');
    if (cantidad === '' || isNaN(Number(cantidad)) || Number(cantidad) < 0) return toast.error('Ingresá una cantidad válida');
    if (sesionActiva && sesionActiva.estado !== 'abierta') return toast.error('La sesión está cerrada');
    setSaving(true);
    try {
      const cod = detalle.producto.codigo_producto;
      const sistema = await stockSistema({ codigo_producto: cod, partida, serie });
      const estado = calcEstado(Number(cantidad), sistema);
      const { data, error } = await supabase.from('wms_cc_conteos').insert({
        sesion_id: activa || null, ubicacion: ubicacion.trim() || null, codigo_producto: cod,
        descripcion: detalle.producto.producto, unidad_medida: detalle.producto.unidad_medida,
        partida: partida.trim() || null, serie: serie.trim() || null,
        cantidad_contada: Number(cantidad), cantidad_sistema: sistema, observaciones: obs.trim() || null,
        estado, contado_por: user?.id || null, contado_por_nombre: user?.nombre || null,
        dispositivo: /Mobile|Android/i.test(navigator.userAgent) ? 'movil' : 'pc',
      }).select().single();
      if (error) throw error;
      const st = estadoStyle(estado);
      toast[estado === 'CUADRADO' ? 'success' : 'message'](`${st.emoji} ${cod} — ${st.label} (contado ${n(cantidad)} / sistema ${n(sistema)})`);
      limpiar(); cargarRecientes();
    } catch (e) { toast.error(e.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const borrar = async (id) => { await supabase.from('wms_cc_conteos').delete().eq('id', id); cargarRecientes(); };

  const stockEsperado = (() => {
    if (!detalle) return null;
    if (serie) { const s = detalle.series.find((x) => x.serie === serie); return s ? Number(s.stock_total) : 0; }
    if (partida) { const p = detalle.partidas.find((x) => x.partida === partida); return p ? Number(p.stock_total) : 0; }
    return detalle.stock_sistema;
  })();
  const dif = stockEsperado != null && cantidad !== '' ? Number(cantidad) - stockEsperado : null;
  const inputCls = 'w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 grid place-items-center text-indigo-600"><ClipboardList size={22} /></div>
        <div className="flex-1"><h1 className="text-lg font-black text-slate-900">Conteo cíclico</h1><p className="text-xs text-slate-500">Registrá el conteo físico</p></div>
      </div>

      {/* Sesión activa */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex items-center gap-2">
        <span className="text-xs font-bold text-slate-500 shrink-0">Sesión:</span>
        <select className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-medium" value={activa} onChange={(e) => cambiarSesion(e.target.value)}>
          <option value="">— Sin sesión —</option>
          {sesiones.map((s) => <option key={s.id} value={s.id} disabled={s.estado === 'cerrada'}>{s.estado === 'cerrada' ? '🔒 ' : ''}{s.nombre}</option>)}
        </select>
        <Link to="/inventory/sesiones" className="text-xs font-bold text-indigo-600 shrink-0">Gestionar</Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
        <div><label className="block mb-1 text-xs font-bold text-slate-500">Ubicación</label>
          <input className={inputCls} placeholder="Ej: G-29-03" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} /></div>
        <div><label className="block mb-1 text-xs font-bold text-slate-500">Producto (código o descripción)</label>
          <ProductoAutocomplete value={skuQuery} onChange={(v) => { setSkuQuery(v); if (!v) setDetalle(null); }} onSelect={elegirProducto} /></div>

        {detalle?.producto && (
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <div className="font-bold text-slate-800">{detalle.producto.producto}</div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
              <span>UM: <b className="text-slate-700">{detalle.producto.unidad_medida || '-'}</b></span>
              <span>Stock sistema: <b className="text-slate-700">{n(detalle.stock_sistema)}</b></span>
              <span>Costo: <b className="text-slate-700">{detalle.costo_unitario ? n(detalle.costo_unitario) : '—'}</b></span>
            </div>
            {detalle.partidas.length > 0 && (
              <div className="mt-3">
                <div className="mb-1 text-xs font-bold text-slate-500">Partidas del sistema (tocá para elegir)</div>
                <div className="flex flex-wrap gap-2">
                  {detalle.partidas.map((p) => (
                    <button key={p.partida} type="button" onClick={() => setPartida(p.partida)}
                      className={'text-xs font-bold px-2.5 py-1 rounded-full border ' + (partida === p.partida ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600')}>
                      {p.partida || '(sin partida)'} · {n(p.stock_total)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div><label className="block mb-1 text-xs font-bold text-slate-500">Partida / Talla</label><input className={inputCls} placeholder="Opcional" value={partida} onChange={(e) => setPartida(e.target.value)} /></div>
          <div><label className="block mb-1 text-xs font-bold text-slate-500">Serie</label><input className={inputCls} placeholder="Opcional" value={serie} onChange={(e) => setSerie(e.target.value)} /></div>
        </div>

        <div>
          <label className="block mb-1 text-xs font-bold text-slate-500">Cantidad contada</label>
          <div className="flex items-stretch gap-2">
            <button type="button" className="w-14 rounded-xl border border-slate-200 text-2xl font-bold text-slate-600" onClick={() => setCantidad(String(Math.max(0, (Number(cantidad) || 0) - 1)))}>−</button>
            <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-center text-2xl font-black" inputMode="decimal" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0" />
            <button type="button" className="w-14 rounded-xl border border-slate-200 text-2xl font-bold text-slate-600" onClick={() => setCantidad(String((Number(cantidad) || 0) + 1))}>+</button>
          </div>
          {dif != null && (
            <div className={'mt-2 rounded-lg px-3 py-2 text-center text-sm font-bold ' + (dif === 0 ? 'bg-emerald-100 text-emerald-700' : dif < 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700')}>
              {dif === 0 ? '✅ Cuadrado' : dif < 0 ? `❌ Faltan ${n(Math.abs(dif))}` : `⚠️ Sobran ${n(dif)}`} · esperado {n(stockEsperado)}
            </div>
          )}
        </div>

        <input className={inputCls} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observaciones (opcional)" />
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-1.5" onClick={() => limpiar(false)}><Eraser size={16} /> Limpiar</button>
          <button className="flex-[2] py-2.5 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50" onClick={guardar} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Registrar conteo
          </button>
        </div>
      </div>

      {recientes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2"><h3 className="font-black text-slate-700 text-sm">Últimos conteos</h3><span className="text-xs text-slate-400">{recientes.length}</span></div>
          <div className="divide-y divide-slate-100">
            {recientes.map((r) => {
              const st = estadoStyle(r.estado);
              return (
                <div key={r.id} className="flex items-center gap-2 py-2 text-sm">
                  <span className={'text-xs font-bold px-1.5 py-0.5 rounded-full ' + st.cls}>{st.emoji}</span>
                  <div className="min-w-0 flex-1"><div className="truncate font-bold text-slate-700">{r.codigo_producto} {r.partida && <span className="text-slate-400">· {r.partida}</span>}</div>
                    <div className="truncate text-xs text-slate-400">{r.ubicacion || 's/ubic'} · contado {n(r.cantidad_contada)} / sist {n(r.cantidad_sistema)}</div></div>
                  <button className="text-rose-400 hover:text-rose-600" onClick={() => borrar(r.id)}><Trash2 size={15} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
