import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Truck, Plus, Copy, Trash2, Download, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';

const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 });
const n = (v) => nf.format(Number(v) || 0);

// Cálculo de palletizado. Las "cajas" salen de la OC (÷ unidades por caja,
// redondeo hacia arriba) salvo que se tipeen a mano (cant_bx), que manda.
function calc(p) {
  const oc = Number(p.cant_oc) || 0;
  const manual = Number(p.cant_bx) || 0;
  const cxb = Number(p.cant_x_bx) || 0;
  const pie = Number(p.pie) || 0;
  const alt = Number(p.altura) || 0;
  const cajasAuto = cxb > 0 ? Math.ceil(oc / cxb) : 0;
  const cajas = manual > 0 ? Math.ceil(manual) : cajasAuto;
  const esManual = manual > 0;
  const bxPallet = pie * alt;
  const pallets = bxPallet > 0 ? cajas / bxPallet : 0;
  const palletsEnteros = Math.ceil(pallets);
  const cajasUltimo = bxPallet > 0 ? cajas % bxPallet : 0;
  const unidadesReales = cajas * cxb;
  // Reparto parejo: 100 cajas en 2 pallets => 50 y 50 (no 54 y 46)
  let balanceado = null;
  if (palletsEnteros >= 2 && cajasUltimo > 0) {
    const base = Math.floor(cajas / palletsEnteros);
    const conUnaMas = cajas % palletsEnteros;
    balanceado = { base, conUnaMas, conBase: palletsEnteros - conUnaMas };
  }
  return { cajas, cajasAuto, esManual, bxPallet, pallets, palletsEnteros, cajasUltimo, unidadesReales, balanceado };
}

function textoBalanceado(b) {
  const total = b.conBase + b.conUnaMas;
  if (b.conUnaMas === 0) return `${total} pallets de ${b.base} cajas`;
  if (b.conBase === 0) return `${total} pallets de ${b.base + 1} cajas`;
  return `${total} pallets: ${b.conUnaMas} de ${b.base + 1} y ${b.conBase} de ${b.base} cajas`;
}

export default function Proyeccion() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const timers = useRef({});

  const cargar = async () => {
    const { data, error } = await supabase.from('wms_proyecciones').select('*').order('created_at');
    if (error) { toast.error('No se pudieron cargar las proyecciones'); setLoading(false); return; }
    let list = data || [];
    if (!list.length) {
      const nueva = await crearFila({ pie: 6, altura: 6 });
      if (nueva) list = [nueva];
    }
    setRows(list);
    setLoading(false);
  };
  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, []);

  async function crearFila(base = {}) {
    const payload = { prod: '', cant_oc: 0, cant_bx: 0, cant_x_bx: 0, pie: 6, altura: 6, ...base,
      creado_por: user?.id || null, creado_por_nombre: user?.nombre || null };
    const { data, error } = await supabase.from('wms_proyecciones').insert(payload).select().single();
    if (error) { toast.error('No se pudo crear'); return null; }
    return data;
  }

  const set = (id, campo, valor) => {
    setRows((rs) => {
      const nuevos = rs.map((r) => (r.id === id ? { ...r, [campo]: valor } : r));
      const row = nuevos.find((r) => r.id === id);
      clearTimeout(timers.current[id]);
      setGuardando(true);
      timers.current[id] = setTimeout(async () => {
        const { error } = await supabase.from('wms_proyecciones').update({
          prod: row.prod, cant_oc: Number(row.cant_oc) || 0, cant_bx: Number(row.cant_bx) || 0,
          cant_x_bx: Number(row.cant_x_bx) || 0, pie: Number(row.pie) || 0, altura: Number(row.altura) || 0,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
        if (error) toast.error('No se pudo guardar');
        setGuardando(false);
      }, 600);
      return nuevos;
    });
  };

  const agregar = async () => { const nueva = await crearFila(); if (nueva) setRows((rs) => [...rs, nueva]); };
  const duplicar = async (p) => {
    const nueva = await crearFila({ prod: p.prod, cant_oc: p.cant_oc, cant_bx: p.cant_bx, cant_x_bx: p.cant_x_bx, pie: p.pie, altura: p.altura });
    if (nueva) setRows((rs) => [...rs, nueva]);
  };
  const borrar = async (id) => {
    const { error } = await supabase.from('wms_proyecciones').delete().eq('id', id);
    if (error) { toast.error('No se pudo eliminar'); return; }
    setRows((rs) => rs.filter((r) => r.id !== id));
  };

  const totales = rows.reduce((t, p) => {
    const c = calc(p);
    return { pallets: t.pallets + c.pallets, enteros: t.enteros + c.palletsEnteros, cajas: t.cajas + c.cajas };
  }, { pallets: 0, enteros: 0, cajas: 0 });

  const exportar = () => {
    const ws = XLSX.utils.json_to_sheet(rows.map((p, i) => {
      const c = calc(p);
      return {
        'Proyección': `Proyección ${i + 1}`, 'Producto': p.prod, 'Cant. OC': Number(p.cant_oc) || 0,
        'Cajas': c.cajas, 'Origen cajas': c.esManual ? 'manual' : 'auto', 'Unid. x caja': Number(p.cant_x_bx) || 0,
        'Pie del pallet': Number(p.pie) || 0, 'Altura': Number(p.altura) || 0, 'Cajas x pallet': c.bxPallet,
        'Pallets usados': Math.round(c.pallets * 100) / 100, 'Pallets completos': c.palletsEnteros,
        'Distribución pareja': c.balanceado ? textoBalanceado(c.balanceado) : (c.palletsEnteros ? `${c.palletsEnteros} de ${c.bxPallet}` : ''),
        'Unidades reales': c.unidadesReales,
      };
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proyección');
    XLSX.writeFile(wb, 'proyeccion_pallets.xlsx');
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="animate-spin text-indigo-500" size={36} /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Truck size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900 truncate">Proyección de pallets</h1>
            <p className="text-xs text-slate-500">Compartida entre todos los dispositivos {guardando && <span className="text-indigo-500">· guardando…</span>}</p>
          </div>
        </div>
        <button onClick={exportar} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50 shrink-0">
          <Download size={14} /> Excel
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Cajas totales" value={n(totales.cajas)} />
        <Kpi label="Pallets exactos" value={n(Math.round(totales.pallets * 100) / 100)} />
        <Kpi label="Pallets completos" value={n(totales.enteros)} accent />
      </div>

      {rows.map((p, i) => {
        const c = calc(p);
        const ok = c.bxPallet > 0 && c.cajas > 0;
        return (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-700 text-sm">Proyección {i + 1}</span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" onClick={() => duplicar(p)} title="Duplicar"><Copy size={16} /></button>
                <button className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50" onClick={() => borrar(p.id)} title="Eliminar"><Trash2 size={16} /></button>
              </div>
            </div>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Producto (ej: COMPRESA)" value={p.prod || ''} onChange={(e) => set(p.id, 'prod', e.target.value)} />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Campo label="Cant. OC" value={p.cant_oc} onChange={(v) => set(p.id, 'cant_oc', v)} placeholder="20000" />
              <Campo label="Cajas (manual)" value={p.cant_bx} onChange={(v) => set(p.id, 'cant_bx', v)} placeholder={c.cajasAuto > 0 ? `auto: ${c.cajasAuto}` : 'auto'} />
              <Campo label="Unid. x caja" value={p.cant_x_bx} onChange={(v) => set(p.id, 'cant_x_bx', v)} placeholder="50" />
              <Campo label="Pie del pallet" value={p.pie} onChange={(v) => set(p.id, 'pie', v)} placeholder="6" />
              <Campo label="Altura (pisos)" value={p.altura} onChange={(v) => set(p.id, 'altura', v)} placeholder="6" />
            </div>
            <div className={'rounded-xl p-3 text-sm ' + (ok ? 'bg-indigo-50' : 'bg-slate-50 text-slate-400')}>
              {ok ? (
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-slate-600">
                    <span className="inline-flex items-center gap-1"><Package size={14} /> Cajas: <b className="text-slate-800">{n(c.cajas)}</b>
                      {c.esManual && <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-bold text-amber-700">manual</span>}</span>
                    <span>🧱 Cajas x pallet: <b className="text-slate-800">{n(c.bxPallet)}</b></span>
                    <span>Unid. reales: <b className="text-slate-800">{n(c.unidadesReales)}</b></span>
                  </div>
                  <div className="text-base font-black text-indigo-700">
                    🚛 {n(Math.round(c.pallets * 100) / 100)} pallets
                    <span className="ml-2 text-sm font-bold text-slate-500">→ {n(c.palletsEnteros)} pallet{c.palletsEnteros === 1 ? '' : 's'}</span>
                  </div>
                  {c.balanceado ? (
                    <div className="space-y-0.5 text-sm text-slate-600">
                      <div>🤝 <b>Parejo:</b> {textoBalanceado(c.balanceado)}</div>
                      <div className="text-slate-400">📚 Llenado máximo: {n(c.palletsEnteros - 1)} de {n(c.bxPallet)} y el último con {n(c.cajasUltimo)}</div>
                    </div>
                  ) : c.palletsEnteros >= 1 && (
                    <div className="text-sm text-slate-500">
                      {c.palletsEnteros === 1 ? `Un solo pallet con ${n(c.cajas)} caja${c.cajas === 1 ? '' : 's'}` : `Todos llenos: ${n(c.palletsEnteros)} pallets de ${n(c.bxPallet)} cajas justas`}
                    </div>
                  )}
                </div>
              ) : 'Completá cantidad, unidades por caja, pie y altura para calcular.'}
            </div>
          </div>
        );
      })}

      <button onClick={agregar} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:bg-indigo-700">
        <Plus size={18} /> Agregar proyección
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
        💡 <b>Cajas</b> = Cant. OC ÷ unid. por caja (redondeo hacia arriba), salvo que llenes <b>Cajas (manual)</b>, que manda.
        <b> Cajas x pallet</b> = pie × altura. <b>Pallets</b> = cajas ÷ cajas por pallet. Se guardan en la base: todos ven las mismas.
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
      <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{label}</div>
      <div className={'mt-1 text-xl font-black ' + (accent ? 'text-indigo-600' : 'text-slate-800')}>{value}</div>
    </div>
  );
}

function Campo({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block mb-1 text-xs font-bold text-slate-500">{label}</label>
      <input inputMode="numeric" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        placeholder={placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
