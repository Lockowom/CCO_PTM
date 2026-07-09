import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Boxes, Plus, ScanLine, Loader2, ChevronRight, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';

const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 });
const n = (v) => nf.format(Number(v) || 0);

function nuevoCodigo() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return 'BLQ-' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Extrae el código del bloque de un QR (URL /inventory/bloque/BLQ-XXXX o texto plano)
export function extraerCodigoBloque(texto) {
  const t = (texto || '').trim();
  const m = t.match(/\/bloque\/([^/?#\s]+)/i);
  if (m) return decodeURIComponent(m[1]).toUpperCase();
  const m2 = t.match(/BLQ-[A-Z0-9]+/i);
  return m2 ? m2[0].toUpperCase() : t.toUpperCase();
}

export function fechaLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleString('es-CL');
}

export default function Bloques() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startScan, isSupportedDevice } = useBarcodeScanner();

  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroBodega, setFiltroBodega] = useState('');
  const [q, setQ] = useState('');
  const [bodega, setBodega] = useState('');
  const [nombre, setNombre] = useState('');
  const [creando, setCreando] = useState(false);
  const [manual, setManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');

  const cargar = async () => {
    setLoading(true);
    // Traer bloques y contar items con dos consultas simples
    const { data: bs, error: e1 } = await supabase.from('wms_bloques').select('*').order('created_at', { ascending: false });
    if (e1) { toast.error('No se pudieron cargar los bloques'); setLoading(false); return; }
    const { data: counts } = await supabase.from('wms_bloque_items').select('bloque_id, cantidad');
    const porBloque = {};
    (counts || []).forEach((it) => {
      const b = (porBloque[it.bloque_id] = porBloque[it.bloque_id] || { items: 0, unidades: 0 });
      b.items += 1; b.unidades += Number(it.cantidad) || 0;
    });
    setBloques((bs || []).map((b) => ({ ...b, items: porBloque[b.id]?.items || 0, unidades: porBloque[b.id]?.unidades || 0 })));
    setLoading(false);
  };
  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, []);

  const bodegas = useMemo(() => [...new Set(bloques.map((b) => b.bodega))].sort(), [bloques]);

  const crear = async () => {
    if (!bodega.trim()) { toast.error('Poné el nombre de la bodega'); return; }
    setCreando(true);
    try {
      let intento = 0, data = null, error = null;
      while (intento < 3 && !data) {
        const res = await supabase.from('wms_bloques').insert({
          codigo: nuevoCodigo(), bodega: bodega.trim(), nombre: nombre.trim() || null,
          creado_por: user?.id || null, creado_por_nombre: user?.nombre || null,
        }).select().single();
        data = res.data; error = res.error; intento += 1;
        if (error && !String(error.message).includes('duplicate')) break;
      }
      if (!data) throw error || new Error('No se pudo crear');
      toast.success(`Bloque ${data.codigo} creado`);
      setNombre('');
      navigate(`/inventory/bloque/${data.codigo}`);
    } catch (e) { toast.error(e.message || 'Error al crear'); }
    finally { setCreando(false); }
  };

  const abrirCodigo = (codigo) => {
    const c = extraerCodigoBloque(codigo);
    if (c) navigate(`/inventory/bloque/${c}/auditar`);
  };

  const escanear = async () => {
    if (isSupportedDevice) {
      await startScan({
        onScan: (val) => abrirCodigo(val),
        onError: (msg) => toast.error(msg),
      });
    } else {
      setManual(true);
    }
  };

  const filtrados = useMemo(() => bloques.filter((b) =>
    (!filtroBodega || b.bodega === filtroBodega) &&
    (!q || b.codigo.toLowerCase().includes(q.toLowerCase()) || (b.nombre || '').toLowerCase().includes(q.toLowerCase()))
  ), [bloques, filtroBodega, q]);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><Boxes size={22} /></div>
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900 truncate">Bloques de inventario</h1>
            <p className="text-xs text-slate-500">Trazabilidad por bodega/pallet con QR y auditoría</p>
          </div>
        </div>
        <button onClick={escanear} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-indigo-700 shrink-0">
          <ScanLine size={16} /> Escanear
        </button>
      </div>

      {/* Crear */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
        <h2 className="font-black text-slate-700 text-sm">Nuevo bloque</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-xs font-bold text-slate-500">Bodega</label>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              list="bodegas-list" placeholder="Ej: Bodega Central" value={bodega} onChange={(e) => setBodega(e.target.value)} />
            <datalist id="bodegas-list">{bodegas.map((b) => <option key={b} value={b} />)}</datalist>
          </div>
          <div>
            <label className="block mb-1 text-xs font-bold text-slate-500">Nombre del bloque (opcional)</label>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Ej: Pallet A-12" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
        </div>
        <button onClick={crear} disabled={creando} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
          {creando ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Crear bloque y generar QR
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <select className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm max-w-[45%]" value={filtroBodega} onChange={(e) => setFiltroBodega(e.target.value)}>
          <option value="">Todas las bodegas</option>
          {bodegas.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Buscar código o nombre…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {/* Lista */}
      {loading ? <div className="grid place-items-center py-10"><Loader2 className="animate-spin text-indigo-500" size={30} /></div> :
        filtrados.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400">Todavía no hay bloques.</div> :
        <div className="space-y-2">
          {filtrados.map((b) => (
            <Link key={b.id} to={`/inventory/bloque/${b.codigo}`} className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-3 hover:border-indigo-300 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 grid place-items-center text-indigo-600 shrink-0"><Warehouse size={20} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-slate-800">{b.codigo}</span>
                  <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + (b.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')}>
                    {b.estado === 'activo' ? 'Activo' : 'Cerrado'}
                  </span>
                </div>
                <div className="truncate text-sm text-slate-600">🏬 {b.bodega}{b.nombre ? ` · ${b.nombre}` : ''}</div>
                <div className="text-xs text-slate-400">{n(b.items)} productos · {n(b.unidades)} un · {fechaLocal(b.created_at)}</div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </Link>
          ))}
        </div>}

      {/* Modal ingreso manual del código (web sin cámara nativa) */}
      {manual && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setManual(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-black text-slate-800 mb-1">Ingresar código del bloque</h3>
            <p className="text-xs text-slate-500 mb-3">En el celular con la app se abre la cámara; en web ingresá el código del QR.</p>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm mb-3" placeholder="BLQ-XXXXXXXX"
              value={codigoManual} onChange={(e) => setCodigoManual(e.target.value.toUpperCase())} autoFocus />
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold" onClick={() => setManual(false)}>Cancelar</button>
              <button className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-black" onClick={() => codigoManual.trim() && abrirCodigo(codigoManual)}>Abrir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
