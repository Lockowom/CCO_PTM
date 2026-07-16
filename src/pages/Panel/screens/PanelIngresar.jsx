import React, { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Search, Loader2, Hash, Truck, ClipboardList, Sparkles, PackagePlus } from 'lucide-react';
import { lookupNV, guardarNV } from '../panelService';

// Encabezado de sección con chip numerado (look guiado, estilo CCO).
function SectionHead({ n, icon: Icon, title, accent = 'orange' }) {
  const tint = accent === 'orange'
    ? 'bg-orange-50 border-orange-100 text-orange-600'
    : 'bg-slate-100 border-slate-200 text-slate-500';
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${tint}`}>
        <Icon size={15} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-black text-slate-300">{n}</span>
        <h2 className="text-[12px] font-black text-slate-600 uppercase tracking-wider">{title}</h2>
      </div>
    </div>
  );
}

// Ingresar N.V. (port de /ingresar del repo panel-). Estructura fiel: Canal →
// N° NV → lookup → Logística → datos adicionales, con estilo CCO. Lookup y
// guardado SIMULADOS (datos de ejemplo); al conectar, se reemplaza por el
// proxy a Apps Script / Supabase.
const CANALES = [
  { value: 'ptm', label: 'PTM' }, { value: 'orange', label: 'Orange' },
  { value: 'farmapack', label: 'Farmapack' }, { value: 'varios', label: 'Varios' },
];
const VARIOS_TIPOS = ['Reposición', 'Garantía', 'Muestra', 'Comodato', 'Traslado'];
const ESTADOS = [
  { nombre: 'Aprobada', color: '#64748b' },
  { nombre: 'En Proceso', color: '#f97316' },
  { nombre: 'Picking', color: '#2563eb' },
  { nombre: 'Packing', color: '#7c3aed' },
  { nombre: 'Shipping', color: '#0891b2' },
  { nombre: 'En Ruta', color: '#2563eb' },
  { nombre: 'Entregado', color: '#10b981' },
  { nombre: 'Con Vendedor', color: '#e11d48' },
  { nombre: 'Retiro en Bodega', color: '#6a1b9a' },
  { nombre: 'Anulada', color: '#94a3b8' },
];
const colorFor = (n) => ESTADOS.find((e) => e.nombre === n)?.color || '#94a3b8';
const hoy = () => new Date().toLocaleDateString('en-CA');

const FORM0 = {
  canal: 'ptm', nv: '', mode: 'idle', lookup: null,
  variosTipo: '', variosCliente: '', variosVendedor: '', variosDivision: '', variosCcosto: '',
  estado: '', urgente: false, tipoDespacho: '', transportista: '',
  fechaCompromiso: '', fechaAprobacion: '', fechaAprobacionReal: '', fechaFacturacion: '', fechaDespacho: '',
  factura: '', guia: '', bultos: '', valorFactura: '', numeroEnvio: '',
};

export default function PanelIngresar() {
  const [f, setF] = useState(FORM0);
  const set = (patch) => setF((p) => ({ ...p, ...patch }));
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [estadoQuery, setEstadoQuery] = useState('');
  const estadoRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (estadoRef.current && !estadoRef.current.contains(e.target)) setEstadoOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const estadoFiltered = useMemo(
    () => ESTADOS.filter((e) => e.nombre.toLowerCase().includes(estadoQuery.toLowerCase())),
    [estadoQuery]
  );

  // Lookup vía servicio (panelService.lookupNV).
  const buscar = () => {
    const nv = f.nv.trim();
    if (!nv) return;
    setLookupLoading(true);
    lookupNV(nv, f.canal).then((r) => {
      if (r.found) set({ mode: 'update', lookup: { found: true, row: r.row, data: r.data }, fechaAprobacion: r.fechaAprobacion, fechaCompromiso: r.fechaCompromiso, estado: r.estado });
      else set({ mode: 'create', lookup: { found: false, autoFill: r.autoFill }, fechaAprobacion: r.fechaAprobacion });
      setLookupLoading(false);
    });
  };

  const guardar = () => {
    if (f.mode === 'idle') return toast.error('Busca una N.V. primero');
    if (!f.estado) return toast.error('Falta el Estado');
    setSaving(true);
    guardarNV({ ...f }).then((res) => {
      setSaving(false);
      if (res.ok) { toast.success(`N.V. ${f.nv} ${f.mode === 'update' ? 'actualizada' : 'creada'} (ejemplo)`); setF(FORM0); }
      else toast.error('No se pudo guardar');
    });
  };

  const af = f.lookup?.found ? f.lookup.data : f.lookup?.autoFill;
  const cells = af ? [
    { l: 'Cliente', v: af.cliente }, { l: 'Vendedor', v: af.vendedor },
    { l: 'C. Costo', v: af.ccosto }, { l: 'División', v: af.division },
  ].filter((x) => x.v) : [];

  return (
    <div className="anim-fade-up space-y-4 max-w-3xl mx-auto pb-24">
      {/* Identificación */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionHead n="01" icon={Hash} title="Identificación" />
        <label className="field-label">Canal</label>
        <div className="mb-4 flex flex-wrap items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
          {CANALES.map((c) => (
            <button key={c.value} type="button" onClick={() => set({ canal: c.value, lookup: null, mode: 'idle' })}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-colors ${f.canal === c.value ? 'bg-orange-500 text-white shadow' : 'text-slate-500 hover:text-orange-600 hover:bg-white'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <label className="field-label">N° Nota de Venta</label>
        <div className="flex gap-2">
          <input type="text" inputMode="numeric" value={f.nv} placeholder="Ej: 97125" className="field-input"
            onChange={(e) => { const v = e.target.value; if (!v.trim()) set({ nv: v, mode: 'idle', lookup: null }); else set({ nv: v }); }}
            onKeyDown={(e) => e.key === 'Enter' && buscar()} />
          <button onClick={buscar} disabled={lookupLoading || !f.nv.trim()}
            className="px-5 rounded-xl bg-slate-900 text-white text-sm font-black active:scale-95 transition-transform disabled:opacity-40 flex items-center gap-1.5">
            {lookupLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Buscar
          </button>
        </div>
        {f.lookup && (
          <div className="mt-4 anim-fade-up">
            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-bold ${f.lookup.found ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <span>{f.lookup.found ? '✎' : '✨'}</span>
              {f.lookup.found ? <span>NV encontrada (fila {f.lookup.row}) · <b>actualizar</b></span> : <span>NV nueva · <b>crear</b></span>}
            </div>
            {cells.length > 0 && (
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {cells.map((x) => (
                  <div key={x.l} className="bg-slate-50 rounded-lg px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400 font-black">{x.l}</div>
                    <div className="text-[13px] text-slate-700 font-bold truncate">{x.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Estado inicial: guía al operador antes de buscar */}
      {f.mode === 'idle' && (
        <div className="anim-fade-up bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-100 rounded-2xl px-6 py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-orange-500 mx-auto mb-3 shadow-sm">
            <Sparkles size={26} />
          </div>
          <p className="text-sm font-black text-slate-700">Busca una N.V. para comenzar</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Escribe el número y presiona <b>Buscar</b>: si existe, la actualizas; si no, se crea. Luego completas la logística.
          </p>
        </div>
      )}

      {/* Varios — datos manuales */}
      {f.canal === 'varios' && f.mode === 'create' && (
        <section className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm anim-fade-up">
          <SectionHead n="02" icon={PackagePlus} title={`${f.variosTipo || 'Varios'} — Datos manuales`} />
          <label className="field-label">Tipo *</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {VARIOS_TIPOS.map((t) => (
              <button key={t} type="button" onClick={() => set({ variosTipo: t })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${f.variosTipo === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:bg-orange-50'}`}>{t}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="field-label">Cliente *</label><input className="field-input" value={f.variosCliente} onChange={(e) => set({ variosCliente: e.target.value })} placeholder="Ej: Hospital Regional" /></div>
            <div><label className="field-label">Vendedor *</label><input className="field-input" value={f.variosVendedor} onChange={(e) => set({ variosVendedor: e.target.value })} placeholder="Nombre del vendedor" /></div>
            <div><label className="field-label">División <span className="text-slate-400 font-normal normal-case">(auto)</span></label><input className="field-input" value={f.variosDivision} onChange={(e) => set({ variosDivision: e.target.value })} placeholder="Ej: DIV. INSTITUCIONAL" /></div>
            <div><label className="field-label">Centro Costo <span className="text-slate-400 font-normal normal-case">(auto)</span></label><input className="field-input" value={f.variosCcosto} onChange={(e) => set({ variosCcosto: e.target.value })} placeholder="Ej: 1-06" /></div>
            <div><label className="field-label">F. Aprobación Real</label><input type="date" className="field-input" value={f.fechaAprobacionReal} onChange={(e) => set({ fechaAprobacionReal: e.target.value })} /></div>
          </div>
        </section>
      )}

      {/* Logística */}
      {f.mode !== 'idle' && (
        <>
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <SectionHead n={f.canal === 'varios' ? '03' : '02'} icon={Truck} title="Logística" />
            <label className="field-label">Estado *</label>
            <div className="relative mb-5" ref={estadoRef}>
              <button type="button" onClick={() => { setEstadoOpen((v) => !v); setEstadoQuery(''); }}
                className="field-input flex items-center justify-between text-left">
                <span className="inline-flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorFor(f.estado) }} />
                  <span className="text-slate-800 font-bold truncate">{f.estado || 'Seleccionar estado'}</span>
                </span>
                <span className={`text-slate-300 text-xs transition-transform ${estadoOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {estadoOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden anim-fade-up">
                  <div className="p-2 border-b border-slate-100">
                    <input autoFocus value={estadoQuery} onChange={(e) => setEstadoQuery(e.target.value)} placeholder="Buscar estado…" className="field-input py-2 text-sm" />
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {estadoFiltered.length === 0 && <div className="px-4 py-3 text-sm text-slate-400 text-center">Sin resultados</div>}
                    {estadoFiltered.map((c) => (
                      <button key={c.nombre} type="button" onClick={() => { set({ estado: c.nombre }); setEstadoOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm ${f.estado === c.nombre ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                        <span className={f.estado === c.nombre ? 'font-black text-slate-900' : 'text-slate-700'}>{c.nombre}</span>
                        {f.estado === c.nombre && <span className="ml-auto font-black text-orange-500">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Urgente */}
            <button type="button" onClick={() => set({ urgente: !f.urgente })}
              className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-3.5 border-2 transition-all ${f.urgente ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
              <span className="flex items-center gap-2.5">
                <span className={`text-xl ${f.urgente ? 'scale-110' : 'opacity-40 grayscale'}`}>🚨</span>
                <span className="flex flex-col items-start">
                  <span className={`text-sm font-black ${f.urgente ? 'text-red-600' : 'text-slate-700'}`}>NV Urgente</span>
                  <span className="text-[11px] text-slate-400">Se destaca en el panel TV</span>
                </span>
              </span>
              <span className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${f.urgente ? 'bg-red-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.urgente ? 'translate-x-6' : ''}`} />
              </span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="field-label">Tipo Despacho</label>
                <select value={f.tipoDespacho} onChange={(e) => set({ tipoDespacho: e.target.value })} className="field-input">
                  <option value="">— Seleccionar —</option>
                  {['Courier - Inyección', 'Directo', 'Courier (Retiro / Pick-up)'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Transportista</label>
                <input className="field-input" value={f.transportista} onChange={(e) => set({ transportista: e.target.value })} placeholder="Nombre transportista" />
              </div>
              {f.mode === 'update' && (
                <div><label className="field-label">Fecha Compromiso <span className="normal-case text-orange-500">(auto — 2 días hábiles)</span></label><input type="date" value={f.fechaCompromiso} readOnly className="field-input bg-slate-50 text-slate-500 cursor-not-allowed" /></div>
              )}
              <div><label className="field-label">Fecha Creación N.V</label><input type="date" value={f.fechaAprobacion} readOnly className="field-input bg-slate-50 text-slate-500 cursor-not-allowed" /></div>
              <div><label className="field-label">Fecha Aprobación Real</label><input type="date" value={f.fechaAprobacionReal} onChange={(e) => set({ fechaAprobacionReal: e.target.value })} className="field-input" /></div>
              <div><label className="field-label">Fecha Facturación</label><input type="date" value={f.fechaFacturacion} onChange={(e) => set({ fechaFacturacion: e.target.value })} className="field-input" /></div>
              <div><label className="field-label">Fecha Despacho</label><input type="date" value={f.fechaDespacho} onChange={(e) => set({ fechaDespacho: e.target.value })} className="field-input" /></div>
            </div>
          </section>

          <details className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-slate-50/60">
              <span className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center"><ClipboardList size={15} /></span>
                <h2 className="text-[12px] font-black text-slate-600 uppercase tracking-wider">Datos adicionales <span className="text-slate-300 normal-case font-bold">· opcional</span></h2>
              </span>
              <span className="text-slate-300 text-xs transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div><label className="field-label">Facturas</label><input className="field-input" value={f.factura} onChange={(e) => set({ factura: e.target.value })} /></div>
              <div><label className="field-label">Guía</label><input className="field-input" value={f.guia} onChange={(e) => set({ guia: e.target.value })} /></div>
              <div><label className="field-label">Bultos</label><input type="number" inputMode="numeric" className="field-input" value={f.bultos} onChange={(e) => set({ bultos: e.target.value })} /></div>
              <div>
                <label className="field-label">Valor Factura</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">$</span>
                  <input inputMode="numeric" className="field-input pl-7" value={f.valorFactura} onChange={(e) => set({ valorFactura: e.target.value.replace(/[^0-9.]/g, '') })} />
                </div>
              </div>
              <div><label className="field-label">N° de Envío</label><input className="field-input" value={f.numeroEnvio} onChange={(e) => set({ numeroEnvio: e.target.value })} /></div>
            </div>
          </details>
        </>
      )}

      {/* Barra inferior fija: Guardar */}
      {f.mode !== 'idle' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Canal <b className="text-slate-600 uppercase">{f.canal}</b> · N° <b className="text-slate-600">{f.nv || '—'}</b></span>
            <button onClick={guardar} disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {f.mode === 'update' ? 'Actualizar N.V.' : 'Crear N.V.'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
