import { j as e } from './query-vendor-BNjBrM5A.js';
import { r as b, b as Ye, u as Oa } from './react-vendor-6aw4XXjH.js';
import {
  X as Ta,
  S as ze,
  ai as Ia,
  x as Qe,
  p as $a,
  aj as Va,
  ak as oa,
  Y as Ne,
  al as xa,
  ah as ha,
  n as Pa,
  t as Ve,
  a7 as Ee,
  am as Fa,
  a0 as Ze,
  an as Ma,
  ao as fa,
  ap as ga,
  aq as qa
} from './ui-vendor-naG2PYVT.js';
import { s as L, L as je, w as Ue, u as ba } from './index-5D5asll0.js';
import { f as La } from './configService-DdWDA1HO.js';
import { e as Ba } from './exportExcel-D85v870c.js';
import { c as za } from './index-DH2X3u_W.js';
import { g as J } from './animation-vendor-JfdD7EdN.js';
import './supabase-vendor-4Fjsfb0a.js';
import './xlsx-B2eTCt_Q.js';
import './charts-vendor-7leLLwOT.js';
function Ua({ titulo: a, onClose: t, children: s, maxWidth: r = 'max-w-3xl', fullscreen: n = !1 }) {
  return (
    b.useEffect(() => {
      const l = (c) => c.key === 'Escape' && (t == null ? void 0 : t());
      document.addEventListener('keydown', l);
      const i = document.body.style.overflow;
      return (
        (document.body.style.overflow = 'hidden'),
        () => {
          (document.removeEventListener('keydown', l), (document.body.style.overflow = i));
        }
      );
    }, [t]),
    Ye.createPortal(
      e.jsx('div', {
        className: `fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex justify-center ${n ? 'items-stretch p-0' : 'items-end sm:items-center p-0 sm:p-4'}`,
        onClick: t,
        style: { animation: 'panelBackdropIn 0.2s ease both' },
        children: e.jsxs('div', {
          className: `bg-white w-full shadow-2xl overflow-hidden flex flex-col ${n ? 'h-screen max-w-none rounded-none' : `${r} sm:rounded-2xl rounded-t-2xl max-h-[88vh]`}`,
          onClick: (l) => l.stopPropagation(),
          style: {
            paddingBottom: 'env(safe-area-inset-bottom)',
            animation: 'panelModalIn 0.28s cubic-bezier(0.16,1,0.3,1) both'
          },
          children: [
            e.jsxs('div', {
              className: `flex items-center justify-between border-b border-slate-100 shrink-0 ${n ? 'px-6 py-4 sm:px-8' : 'px-5 py-3'}`,
              children: [
                e.jsx('h3', {
                  className: `font-black text-slate-800 ${n ? 'text-lg sm:text-2xl' : ''}`,
                  children: a
                }),
                e.jsx('button', {
                  onClick: t,
                  className: `rounded-lg hover:bg-slate-100 text-slate-400 ${n ? 'p-2.5' : 'p-1.5'}`,
                  children: e.jsx(Ta, { size: n ? 22 : 18 })
                })
              ]
            }),
            e.jsx('div', { className: `overflow-y-auto ${n ? 'flex-1' : ''}`, children: s })
          ]
        })
      }),
      document.body
    )
  );
}
const ce = 'tms_operaciones_vigentes',
  Xe = 'tms_operaciones',
  Ga = 60 * 1e3,
  Ka = 5 * 60 * 1e3,
  Wa = 20 * 1e3,
  Ha = 3 * 60 * 1e3,
  Ya = 5 * 60 * 1e3,
  Qa = 10 * 60 * 1e3;
let Ge = { ts: 0, data: null, promise: null },
  Ke = { ts: 0, data: null, promise: null },
  va = { ts: 0, data: null, promise: null },
  Na = { ts: 0, data: null, promise: null },
  oe = { ts: 0, data: null, promise: null };
const he = new Map(),
  ve = new Map(),
  Ae = new Map();
function ja() {
  ((Ge = { ts: 0, data: null, promise: null }),
    (Ke = { ts: 0, data: null, promise: null }),
    (va = { ts: 0, data: null, promise: null }),
    (Na = { ts: 0, data: null, promise: null }),
    (oe = { ts: 0, data: null, promise: null }),
    he.clear(),
    ve.clear(),
    Ae.clear());
}
function Za(a, t) {
  return !!a && Object.prototype.hasOwnProperty.call(a, 'value') && Date.now() - a.ts < t;
}
function Je(a, t, s) {
  const r = a.get(t);
  return r ? (r.promise ? r.promise : Za(r, s) ? r.value : (a.delete(t), null)) : null;
}
function ye(a, t, s) {
  return (a.set(t, { ts: Date.now(), value: s }), s);
}
function ea(a, t, s) {
  return (a.set(t, { ts: Date.now(), promise: s }), s);
}
function Pe(a) {
  return Math.round(Math.max(0, performance.now() - a));
}
function Xa(a) {
  const t = String(
    (a == null ? void 0 : a.message) || (a == null ? void 0 : a.details) || a || ''
  ).toLowerCase();
  return (
    (a == null ? void 0 : a.name) === 'AbortError' ||
    t.includes('request was aborted') ||
    t.includes('signal is aborted')
  );
}
function Ja(a = {}) {
  return {
    id: (a == null ? void 0 : a.id) ?? null,
    mode: (a == null ? void 0 : a.mode) || null,
    canal: (a == null ? void 0 : a.canal) || null,
    nv: xe((a == null ? void 0 : a.nv) || ''),
    estado: (a == null ? void 0 : a.estado) || null,
    urgente: (a == null ? void 0 : a.urgente) === !0,
    transportista: (a == null ? void 0 : a.transportista) || null,
    hasIncidencia: !!String((a == null ? void 0 : a.incidencia) || '').trim(),
    reabierta: (a == null ? void 0 : a.reabierta) === !0
  };
}
async function ue(
  a,
  t,
  { screen: s = 'PanelIngresar', payload: r = null, slowMs: n = 900, message: l = '' } = {}
) {
  const i = performance.now();
  try {
    const c = await t(),
      o = Pe(i);
    return (
      o >= n &&
        je.performance({
          module: 'panel',
          screen: s,
          action: a,
          message: l || `Operacion lenta de lectura: ${a}`,
          durationMs: o,
          status: 'ok',
          payload: r
        }),
      c
    );
  } catch (c) {
    throw (
      Xa(c) ||
        je.error(c, {
          module: 'panel',
          screen: s,
          action: a,
          message: `Fallo operacion de lectura: ${a}`,
          durationMs: Pe(i),
          status: 'error',
          payload: r
        }),
      c
    );
  }
}
function et(a) {
  return /timed out acquiring connection|connection pool/i.test(
    String((a == null ? void 0 : a.message) || a || '')
  );
}
async function We(a, { ms: t, label: s, attempts: r = 3, signal: n } = {}) {
  let l;
  for (let i = 0; i < r; i += 1) {
    if (
      ((l = await Ue(a(), { ms: t, label: s, signal: n })),
      !et(l == null ? void 0 : l.error) || i === r - 1)
    )
      return l;
    const c = 180 * 2 ** i + Math.floor(Math.random() * 70);
    (je.warn(l.error, {
      module: 'panel',
      screen: 'PanelIngresar',
      action: 'pool_acquire_retry',
      message: `Reintento de lectura por saturación transitoria del pool: ${s}`,
      attempt: i + 1,
      delayMs: c
    }),
      await new Promise((o) => setTimeout(o, c)));
  }
  return l;
}
async function _e(a, t, { screen: s = 'PanelIngresar', payload: r = null, message: n = '' } = {}) {
  const l = performance.now();
  try {
    const i = await t(),
      c = Pe(l);
    return (i == null ? void 0 : i.ok) === !1
      ? (je.error(new Error(i.error || i.message || `Operacion fallida: ${a}`), {
          module: 'panel',
          screen: s,
          action: a,
          message: `Operacion fallida: ${a}`,
          durationMs: c,
          status: 'failed',
          payload: r,
          context: { result: i }
        }),
        i)
      : (je.audit({
          module: 'panel',
          screen: s,
          action: a,
          message: n || `Operacion ejecutada: ${a}`,
          durationMs: c,
          status: 'ok',
          payload: r
        }),
        i);
  } catch (i) {
    throw (
      je.error(i, {
        module: 'panel',
        screen: s,
        action: a,
        message: `Fallo operacion critica: ${a}`,
        durationMs: Pe(l),
        status: 'error',
        payload: r
      }),
      i
    );
  }
}
const He = [
    { value: 'ptm', label: 'PTM', color: '#ea580c' },
    { value: 'orange', label: 'Orange', color: '#f59e0b' },
    { value: 'farmapack', label: 'Farmapack', color: '#0f766e' },
    { value: 'varios', label: 'Varios', color: '#4f46e5' }
  ],
  at = ['N.V ANTICIPADA', 'DEMO', 'REGALO', 'BOLETA', 'GUÍA SALIDA'],
  ya = ['PROBLEMAS DE DIRECCIÓN', 'PROBLEMAS DE TRANSPORTE', 'OTRO'],
  _a = ['ABIERTA', 'EN GESTIÓN', 'RESUELTA'],
  wa = ['En Proceso', 'Shipping', 'Currier', 'En Ruta', 'Entregado'],
  Fe = ['En Proceso', 'Shipping', 'Currier', 'En Ruta'],
  Ca = ['Courier - Inyección', 'Directo', 'Courier (Retiro / Pick-up)'],
  tt = {
    'En Proceso': '#f59e0b',
    'P / VENDEDOR': '#e11d48',
    'P / STOCK': '#78716c',
    'P / RETIRO': '#9333ea',
    Shipping: '#0d9488',
    Currier: '#4f46e5',
    'En Ruta': '#2563eb',
    Entregado: '#65a30d',
    NULA: '#9ca3af',
    REFACTURADO: '#9ca3af',
    RECHAZADO: '#9ca3af'
  },
  De = (a) => tt[a] || '#9ca3af',
  re = '#ea580c',
  me = (a) => (a ? String(a).slice(0, 10) : ''),
  xe = (a) => {
    const t = String(a ?? '').trim();
    return /^\d+\.0+$/.test(t) ? t.split('.')[0] : t;
  },
  pe = (a) =>
    String(a || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase(),
  de = (a) =>
    pe(a)
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  st = new Set(['de', 'del', 'la', 'las', 'los']),
  la = (a) =>
    de(a)
      .split(' ')
      .filter((t) => t && !st.has(t)),
  rt = (a) =>
    a === 'ptm'
      ? 'nv_ptm'
      : a === 'orange'
        ? 'nv_orange'
        : a === 'farmapack'
          ? 'nv_farmapack'
          : 'varios',
  Te = (a) => (a.nv_ptm ? 'ptm' : a.nv_orange ? 'orange' : a.nv_farmapack ? 'farmapack' : 'varios'),
  we = (a) => (a.nv_ptm ? String(a.nv_ptm) : a.nv_orange || a.nv_farmapack || a.varios || ''),
  ia = (a) => pe(a).includes('orange'),
  ge =
    'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,estado,transportista,fecha_compromiso,guia,factura,fecha_aprobacion,fecha_aprobacion_real,urgente,fecha_estado,reabierta,motivo_reapertura';
function Re(a) {
  const t = Te(a),
    s = we(a);
  return {
    id: a.id,
    key: `${t}:${s}`,
    canal: t,
    nv: s,
    cliente: a.cliente || '',
    vendedor: a.vendedor || '',
    estado: a.estado || '',
    transportista: a.transportista || '',
    fechaCompromiso: me(a.fecha_compromiso),
    guia: a.guia || '',
    factura: a.factura || '',
    fechaAprobacion: me(a.fecha_aprobacion),
    fechaAprobacionReal: me(a.fecha_aprobacion_real),
    urgente: a.urgente === !0,
    _estado: a.estado,
    reabierta: a.reabierta === !0,
    motivoReapertura: a.motivo_reapertura || ''
  };
}
function nt(a) {
  return de(a).split(' ').filter(Boolean);
}
function ot(a) {
  const t = xe((a == null ? void 0 : a.nv) || ''),
    s = pe((a == null ? void 0 : a.guia) || ''),
    r = pe((a == null ? void 0 : a.factura) || ''),
    n = de((a == null ? void 0 : a.cliente) || ''),
    l = de((a == null ? void 0 : a.vendedor) || ''),
    i = de((a == null ? void 0 : a.transportista) || ''),
    c = pe((a == null ? void 0 : a.canal) || ''),
    o = pe((a == null ? void 0 : a.estado) || ''),
    h = [t, s, r, n, l, i, c, o].filter(Boolean).join(' '),
    u = new Set(h.split(' ').filter(Boolean));
  return {
    nv: t,
    guia: s,
    factura: r,
    cliente: n,
    vendedor: l,
    transportista: i,
    canal: c,
    estado: o,
    searchable: h,
    words: u
  };
}
function lt(a, t) {
  const s = String(t || '').trim();
  if (!s) return Number.NEGATIVE_INFINITY;
  const r = xe(s),
    n = pe(s),
    l = de(s),
    i = nt(s),
    c = ot(a);
  let o = 0;
  if (
    (c.nv &&
      r &&
      (c.nv === r ? (o += 2e4) : c.nv.startsWith(r) ? (o += 12e3) : c.nv.includes(r) && (o += 8e3)),
    c.guia &&
      n &&
      (c.guia === n
        ? (o += 15e3)
        : c.guia.startsWith(n)
          ? (o += 9e3)
          : c.guia.includes(n) && (o += 4500)),
    c.factura &&
      n &&
      (c.factura === n
        ? (o += 15e3)
        : c.factura.startsWith(n)
          ? (o += 9e3)
          : c.factura.includes(n) && (o += 4500)),
    l &&
      (c.cliente === l
        ? (o += 7e3)
        : c.cliente.startsWith(l)
          ? (o += 4800)
          : c.cliente.includes(l) && (o += 2800),
      c.vendedor === l
        ? (o += 6500)
        : c.vendedor.startsWith(l)
          ? (o += 4400)
          : c.vendedor.includes(l) && (o += 2400),
      c.transportista === l
        ? (o += 5e3)
        : c.transportista.startsWith(l)
          ? (o += 3200)
          : c.transportista.includes(l) && (o += 1800)),
    i.length > 0)
  ) {
    let h = 0;
    (i.forEach((u) => {
      if (c.words.has(u)) {
        ((h += 1), (o += 950));
        return;
      }
      for (const d of c.words)
        if (d.startsWith(u)) {
          ((h += 0.6), (o += 360));
          return;
        }
      c.searchable.includes(u) && (o += 120);
    }),
      h >= i.length && (o += 1600));
  }
  return (
    n && c.searchable.includes(n) && (o += 600),
    a != null && a.urgente && (o += 45),
    (o += Math.min(Se(a) / 1e9, 120)),
    o
  );
}
function ke(a, t, s = 200) {
  const r = new Map();
  return (
    (a || []).forEach((n) => {
      if (!(n != null && n.key)) return;
      const l = lt(n, t);
      if (!Number.isFinite(l) || l <= 0) return;
      const i = r.get(n.key);
      (!i || l > i.score || (l === i.score && Se(n) > Se(i.item))) &&
        r.set(n.key, { item: n, score: l });
    }),
    Array.from(r.values())
      .sort((n, l) => l.score - n.score || Se(l.item) - Se(n.item))
      .slice(0, s)
      .map(({ item: n }) => n)
  );
}
function Se(a) {
  return (
    Date.parse((a == null ? void 0 : a.fecha_estado) || '') ||
    Date.parse((a == null ? void 0 : a.fecha_aprobacion_real) || '') ||
    Date.parse((a == null ? void 0 : a.fecha_aprobacion) || '') ||
    0
  );
}
async function it({ force: a = !1, full: t = !0, limit: s = 400 } = {}) {
  return ue(
    'lista_activas',
    async () => {
      const r = Date.now(),
        n = t ? Ge : Ke;
      if (!a && n.data && r - n.ts < Ga) return n.data;
      if (!a && n.promise) return n.promise;
      const l = async () => {
        if (!t) {
          const { data: u, error: d } = await L.from(ce)
            .select(ge)
            .in('estado', Fe)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .limit(s);
          if (d) throw d;
          const g = (u || []).map(Re);
          return ((Ke = { ts: Date.now(), data: g, promise: null }), g);
        }
        const i = [];
        let c = 0;
        const o = 500;
        for (;;) {
          const { data: u, error: d } = await L.from(ce)
            .select(ge)
            .in('estado', Fe)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .range(c, c + o - 1);
          if (d) throw d;
          if (!u || u.length === 0 || (i.push(...u), u.length < o)) break;
          c += o;
        }
        const h = i.map(Re);
        return ((Ge = { ts: Date.now(), data: h, promise: null }), h);
      };
      return (
        (n.promise = l().catch((i) => {
          throw ((n.promise = null), i);
        })),
        n.promise
      );
    },
    {
      payload: { force: a, full: t, limit: t ? null : s },
      slowMs: 700,
      message: 'Carga de N.V. activas del Panel'
    }
  );
}
async function ct(a, { limit: t = 300, signal: s } = {}) {
  return ue(
    'buscar_operaciones',
    async () => {
      const r = String(a || '').trim();
      if (r.length < 2) return [];
      const n = `${t}:${de(r) || pe(r)}`,
        l = Je(he, n, Wa);
      if (l) return l;
      const i = r.replace(/[(),*]/g, ' ').trim();
      if (!i) return [];
      const o = (async () => {
        if (/^\d{4,}$/.test(i)) {
          const _ = await We(
            () =>
              L.from(Xe)
                .select(ge)
                .or(`nv_ptm.eq.${Number(i)},nv_orange.eq.${i},nv_farmapack.eq.${i},varios.eq.${i}`)
                .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                .order('id', { ascending: !1 })
                .limit(4),
            { ms: 2500, label: 'Busqueda exacta de N.V. del Panel', signal: s }
          );
          if (_ != null && _.error) throw _.error;
          const R = ke((_.data || []).map(Re), r, Math.min(t, 20));
          if (R.length) return ye(he, n, R);
          const O = Math.min(t, 60),
            E = `${i}%`,
            V = await We(
              () =>
                L.from(ce)
                  .select(ge)
                  .or(
                    `nv_ptm.eq.${Number(i)},nv_orange.ilike.${E},nv_farmapack.ilike.${E},varios.ilike.${E},guia.ilike.${E},factura.ilike.${E}`
                  )
                  .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                  .order('id', { ascending: !1 })
                  .limit(O),
              { ms: 3e3, label: 'Busqueda numerica del Panel', signal: s }
            );
          if (V != null && V.error) throw V.error;
          const P = ke((V.data || []).map(Re), r, t);
          return ye(he, n, P);
        }
        const u = `*${i}*`,
          d = [];
        d.push(
          `nv_orange.ilike.${u}`,
          `nv_farmapack.ilike.${u}`,
          `varios.ilike.${u}`,
          `cliente.ilike.${u}`,
          `vendedor.ilike.${u}`,
          `guia.ilike.${u}`,
          `factura.ilike.${u}`,
          `transportista.ilike.${u}`
        );
        let g = null,
          v = null;
        if (
          (({ data: g, error: v } = await Ue(
            L.from(ce)
              .select(ge)
              .or(d.join(','))
              .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
              .limit(t),
            { ms: 4e3, label: 'Busqueda remota amplia del Panel', signal: s }
          )),
          v)
        ) {
          const _ = Math.min(t, 60),
            R = `${i}*`,
            O =
              i.length >= 4
                ? L.from(ce).select(ge).ilike('cliente', R).limit(_)
                : L.from(ce)
                    .select(ge)
                    .or(`nv_orange.ilike.${R},nv_farmapack.ilike.${R},varios.ilike.${R}`)
                    .limit(_),
            E = await Ue(O, {
              ms: 2500,
              label: 'Fallback acotado de busqueda del Panel',
              signal: s
            });
          if (E != null && E.error) throw v;
          ((g = E.data || []), (v = null));
        }
        const A = new Map();
        (g || []).forEach((_) => {
          const R = we(_);
          if (!R) return;
          const O = `${Te(_)}:${R}`;
          A.has(O) || A.set(O, Re(_));
        });
        const D = ke(Array.from(A.values()), r, t);
        return ye(he, n, D);
      })().catch((h) => {
        throw (he.delete(n), h);
      });
      return ea(he, n, o);
    },
    {
      payload: { term: String(a || '').trim(), limit: t },
      slowMs: 450,
      message: 'Busqueda remota de operaciones del Panel'
    }
  );
}
function dt(a, t, { limit: s = 120 } = {}) {
  const r = String(t || '').trim();
  return r.length < 2 ? [] : ke(a || [], r, s);
}
function ut(a, t, s, { limit: r = 160 } = {}) {
  return ke([...(a || []), ...(t || [])], s, r);
}
async function Ea({ force: a = !1, includeHistoricos: t = !1 } = {}) {
  return ue(
    'cargar_opciones',
    async () => {
      const s = Date.now(),
        r = t ? va : Na;
      if (!a && r.data && s - r.ts < Ka) return r.data;
      if (!a && r.promise) return r.promise;
      const n = async () => {
        const l = new Set(),
          { data: i } = await L.from('tms_panel_transportistas')
            .select('nombre')
            .eq('activo', !0)
            .order('nombre', { ascending: !0 });
        if (
          ((i || []).forEach((h) => {
            const u = (h.nombre || '').trim();
            u && l.add(u);
          }),
          t)
        ) {
          let h = 0;
          const u = 1e3;
          for (;;) {
            const { data: d, error: g } = await L.from(ce)
              .select('transportista')
              .not('transportista', 'is', null)
              .order('id', { ascending: !0 })
              .range(h, h + u - 1);
            if (
              g ||
              !d ||
              d.length === 0 ||
              (d.forEach((v) => {
                const A = (v.transportista || '').trim();
                A && l.add(A);
              }),
              d.length < u)
            )
              break;
            h += u;
          }
        }
        const c = [...l].sort((h, u) => h.localeCompare(u, 'es')),
          o = { estados: wa, transportistas: c, tiposDespacho: Ca };
        return ((r.data = o), (r.ts = Date.now()), (r.promise = null), o);
      };
      return (
        (r.promise = n().catch((l) => {
          throw ((r.promise = null), l);
        })),
        r.promise
      );
    },
    {
      payload: { force: a, includeHistoricos: t },
      slowMs: 1200,
      message: 'Carga de opciones del formulario Panel'
    }
  );
}
const Aa =
  'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,centro_costo,division,estado,transportista,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_facturacion,fecha_despacho,fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,factura,guia,bultos,valor_factura,numero_envio,urgente,incidencia,estado_incidencia,observaciones_incidencia,reabierta,fecha_reapertura,motivo_reapertura';
async function aa(a, t) {
  const s = xe(t);
  if (!s) return null;
  const r = `${String(a).toLowerCase()}:${s}`,
    n = Je(Ae, r, Ya);
  if (n) return n;
  const i = (async () => {
    const { data: c } = await L.from('tms_nv_catalogo')
      .select('cliente, vendedor, fecha_aprobacion, centro_costo, division')
      .eq('canal', String(a).toLowerCase())
      .eq('nv', s)
      .limit(1);
    return ye(Ae, r, (c && c[0]) || null);
  })().catch((c) => {
    throw (Ae.delete(r), c);
  });
  return ea(Ae, r, i);
}
async function pt() {
  const a = Date.now();
  if (oe.data && a - oe.ts < Qa) return oe.data;
  if (oe.promise) return oe.promise;
  const t = async () => {
    const { data: s } = await L.from('tms_panel_vendedores')
        .select('nombre, centro_costo, division')
        .eq('activo', !0)
        .order('nombre', { ascending: !0 }),
      r = s || [];
    return ((oe = { ts: Date.now(), data: r, promise: null }), r);
  };
  return (
    (oe.promise = t().catch((s) => {
      throw ((oe.promise = null), s);
    })),
    oe.promise
  );
}
async function ta(a) {
  const t = String(a || '').trim();
  if (!t) return null;
  const s = await pt();
  if (!s || s.length === 0) return null;
  const r = de(t),
    n = la(t),
    i = s
      .map((c) => {
        const o = de(c.nombre),
          h = la(c.nombre),
          u = o === r,
          d = !u && (o.includes(r) || r.includes(o)),
          g = n.filter((_) => h.includes(_)).length,
          v = n.length > 0 && n.every((_) => h.includes(_)),
          A = h.length > 0 && h.every((_) => n.includes(_));
        let D = 0;
        return (
          u ? (D += 1e3) : d ? (D += 700) : (v || A) && (D += 500),
          (D += g * 100),
          (D -= Math.abs(o.length - r.length)),
          { ...c, score: D }
        );
      })
      .filter((c) => c.score >= 200)
      .sort((c, o) => o.score - c.score)[0];
  return i ? { centro_costo: i.centro_costo || '', division: i.division || '' } : null;
}
async function Oe(a, t) {
  return ue(
    'lookup_nv',
    async () => {
      const s = xe(t);
      if (!s)
        return { found: !1, autoFill: { cliente: '', vendedor: '', ccosto: '', division: '' } };
      const r = `${String(a).toLowerCase()}:${s}`,
        n = Je(ve, r, Ha);
      if (n) return n;
      const i = (async () => {
        const c = rt(a),
          [o, h] = await Promise.all([
            We(
              () => {
                let _ = L.from(Xe).select(Aa).order('fecha_estado', { ascending: !1 }).limit(1);
                return a === 'ptm' && /^\d+$/.test(s) ? _.eq(c, Number(s)) : _.eq(c, s);
              },
              { ms: 2500, label: 'Lookup exacto de N.V. del Panel' }
            ),
            aa(a, s)
          ]);
        if (o != null && o.error) throw o.error;
        const u = (o == null ? void 0 : o.data) || [],
          d = u && u.length ? u[0] : null,
          g = (d == null ? void 0 : d.cliente) || (h == null ? void 0 : h.cliente) || '',
          v = (d == null ? void 0 : d.vendedor) || (h == null ? void 0 : h.vendedor) || '';
        let A =
            (d == null ? void 0 : d.centro_costo) || (h == null ? void 0 : h.centro_costo) || '',
          D = (d == null ? void 0 : d.division) || (h == null ? void 0 : h.division) || '';
        if (v && (!A || !D)) {
          const _ = await ta(v);
          _ && ((A = A || _.centro_costo || ''), (D = D || _.division || ''));
        }
        if (d) {
          const _ = {
            found: !0,
            row: d.id,
            data: {
              ...d,
              canal: a,
              nv: we(d),
              estado: d.estado,
              cliente: g,
              vendedor: v,
              ccosto: A,
              division: D,
              fecha_compromiso: me(d.fecha_compromiso),
              fecha_registro_nv: me(d.fecha_registro_nv)
            }
          };
          return ye(ve, r, _);
        }
        return ye(ve, r, {
          found: !1,
          autoFill: { cliente: g, vendedor: v, ccosto: A, division: D }
        });
      })().catch((c) => {
        throw (ve.delete(r), c);
      });
      return ea(ve, r, i);
    },
    { payload: { canal: a, nv: xe(t) }, slowMs: 550, message: 'Lookup de N.V. en Panel' }
  );
}
async function mt(a, { canal: t = null, nv: s = null } = {}) {
  return ue(
    'lookup_nv_by_id',
    async () => {
      if (!a) return Oe(t, s);
      const { data: r, error: n } = await L.from(Xe).select(Aa).eq('id', a).limit(1);
      if (n) throw n;
      const l = r && r.length ? r[0] : null;
      if (!l) return Oe(t, s);
      const i = t || Te(l),
        c = s || we(l),
        o = await aa(i, c),
        h = (l == null ? void 0 : l.cliente) || (o == null ? void 0 : o.cliente) || '',
        u = (l == null ? void 0 : l.vendedor) || (o == null ? void 0 : o.vendedor) || '';
      let d = (l == null ? void 0 : l.centro_costo) || (o == null ? void 0 : o.centro_costo) || '',
        g = (l == null ? void 0 : l.division) || (o == null ? void 0 : o.division) || '';
      if (u && (!d || !g)) {
        const A = await ta(u);
        A && ((d = d || A.centro_costo || ''), (g = g || A.division || ''));
      }
      return {
        found: !0,
        row: l.id,
        data: {
          ...l,
          canal: i,
          nv: c,
          estado: l.estado,
          cliente: h,
          vendedor: u,
          ccosto: d,
          division: g,
          fecha_compromiso: me(l.fecha_compromiso),
          fecha_registro_nv: me(l.fecha_registro_nv)
        }
      };
    },
    {
      payload: { id: a, canal: t, nv: xe(s) },
      slowMs: 350,
      message: 'Lookup de N.V. por id en Panel'
    }
  );
}
async function xt(a, t = {}) {
  const s = xe(a);
  if (!s) return null;
  const r = await aa('orange', s);
  if (!r) return null;
  let n = r.centro_costo || '',
    l = r.division || '';
  const i = r.vendedor || t.vendedor || '';
  if (i && (!n || !l)) {
    const c = await ta(i);
    c && ((n = n || c.centro_costo || ''), (l = l || c.division || ''));
  }
  return (
    (n = n || t.ccosto || t.centro_costo || ''),
    (l = l || t.division || ''),
    {
      nv: s,
      cliente: r.cliente || '',
      vendedor: r.vendedor || t.vendedor || '',
      ccosto: n,
      division: l,
      fecha_aprobacion: me(r.fecha_aprobacion)
    }
  );
}
const ca = [
    ['id', 'ID'],
    ['nv_ptm', 'N.V PTM'],
    ['nv_orange', 'N.V ORANGE'],
    ['nv_farmapack', 'N.V FARMAPACK'],
    ['varios', 'VARIOS'],
    ['cliente', 'CLIENTE'],
    ['vendedor', 'VENDEDOR'],
    ['centro_costo', 'CENTRO COSTO'],
    ['division', 'DIVISIÓN'],
    ['estado', 'ESTADO'],
    ['urgente', 'URGENTE'],
    ['tipo_despacho', 'TIPO DESPACHO'],
    ['transportista', 'TRANSPORTISTA'],
    ['empresa_transporte', 'EMPRESA TRANSPORTE'],
    ['factura', 'FACTURA'],
    ['guia', 'GUÍA'],
    ['numero_envio', 'N° ENVÍO'],
    ['bultos', 'BULTOS'],
    ['valor_nv', 'VALOR N.V'],
    ['valor_factura', 'VALOR FACTURA'],
    ['costo_flete', 'COSTO FLETE'],
    ['fecha_registro_nv', 'F. REGISTRO N.V'],
    ['fecha_aprobacion', 'F. APROBACIÓN'],
    ['fecha_aprobacion_real', 'F. APROBACIÓN REAL'],
    ['fecha_facturacion', 'F. FACTURACIÓN'],
    ['fecha_compromiso', 'F. COMPROMISO'],
    ['fecha_en_proceso', 'F. EN PROCESO'],
    ['fecha_shipping', 'F. SHIPPING'],
    ['fecha_despacho', 'F. DESPACHO'],
    ['fecha_en_ruta', 'F. EN RUTA'],
    ['fecha_entregado', 'F. ENTREGADO'],
    ['fecha_estado', 'F. ÚLTIMO ESTADO'],
    ['dias_en_proceso', 'DÍAS EN PROCESO'],
    ['incidencia', 'INCIDENCIA'],
    ['estado_incidencia', 'ESTADO INCIDENCIA'],
    ['observaciones_incidencia', 'OBS. INCIDENCIA'],
    ['dias_incidencia', 'DÍAS INCIDENCIA'],
    ['fillrate', 'FILLRATE'],
    ['origen', 'ORIGEN'],
    ['created_at', 'CREADO'],
    ['updated_at', 'ACTUALIZADO']
  ],
  ht = [
    ['canal_operacion', 'CANAL OPERACIÓN'],
    ['nv_operacion', 'N.V OPERACIÓN'],
    ['nv_orange_asociada_ptm', 'N.V ORANGE ASOCIADA PTM'],
    ['tiene_asociacion_orange', 'PTM CON ASOCIACIÓN ORANGE']
  ],
  ft = new Set([
    'fecha_aprobacion',
    'fecha_aprobacion_real',
    'fecha_despacho',
    'fecha_compromiso',
    'fecha_en_proceso',
    'fecha_shipping',
    'fecha_en_ruta',
    'fecha_entregado'
  ]),
  gt = new Set(['fecha_estado', 'fecha_registro_nv', 'created_at', 'updated_at']),
  Sa = (a) => {
    const t = String(a).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return t ? `${t[3]}/${t[2]}/${t[1]}` : String(a);
  },
  bt = (a) => {
    const t = String(a).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    return t ? `${t[3]}/${t[2]}/${t[1]} ${t[4]}:${t[5]}` : Sa(a);
  };
async function vt() {
  return ue(
    'exportar_operaciones',
    async () => {
      const a = ca.map((n) => n[0]).join(','),
        t = [];
      let s = 0;
      const r = 1e3;
      for (;;) {
        const { data: n, error: l } = await L.from(ce)
          .select(a)
          .order('id', { ascending: !0 })
          .range(s, s + r - 1);
        if (l) throw l;
        if (!n || n.length === 0 || (t.push(...n), n.length < r)) break;
        s += r;
      }
      return t.map((n) => {
        const l = {};
        ca.forEach(([u, d]) => {
          let g = n[u];
          (u === 'urgente'
            ? (g = g === !0 ? 'SÍ' : 'NO')
            : g == null || g === ''
              ? (g = '')
              : ft.has(u)
                ? (g = Sa(g))
                : gt.has(u) && (g = bt(g)),
            (l[d] = g));
        });
        const i = Te(n),
          c = we(n),
          o = (n.nv_ptm && n.nv_orange) || '',
          h = {
            'CANAL OPERACIÓN': String(i || '').toUpperCase(),
            'N.V OPERACIÓN': c || '',
            'N.V ORANGE ASOCIADA PTM': o,
            'PTM CON ASOCIACIÓN ORANGE': n.nv_ptm ? (n.nv_orange ? 'SÍ' : 'NO') : ''
          };
        return (
          ht.forEach(([, u]) => {
            l[u] = h[u] || '';
          }),
          l
        );
      });
    },
    {
      payload: { scope: 'maestro_vigente' },
      slowMs: 1800,
      message: 'Exportacion de operaciones vigentes'
    }
  );
}
function Me(a, t) {
  return t
    ? { ok: !1, error: t.message, message: t.message }
    : a && typeof a == 'object'
      ? a
      : { ok: !0 };
}
async function Ra(a) {
  var s;
  const t = {
    ...a,
    id:
      (a == null ? void 0 : a.id) ??
      ((a == null ? void 0 : a.mode) === 'update'
        ? (s = a == null ? void 0 : a.lookup) == null
          ? void 0
          : s.row
        : null)
  };
  return _e(
    'guardar_nv',
    async () => {
      const { data: r, error: n } = await L.rpc('guardar_nv', { p: t }),
        l = Me(r, n);
      return ((l == null ? void 0 : l.ok) !== !1 && ja(), l);
    },
    { payload: Ja(t), message: 'Guardado de N.V. en Panel' }
  );
}
async function Nt(a) {
  if (!a) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: t, error: s } = await L.rpc('iam_puede_editar_nv', { p_id: a });
  return s
    ? { permitida: !1, message: s.message || 'No se pudo validar el acceso IAM.' }
    : t || { permitida: !1, message: 'No se pudo validar el acceso IAM.' };
}
async function jt(a, t = null) {
  if (!a) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: s, error: r } = await L.rpc('iam_puede_cambiar_estado_nv', {
    p_id: a,
    p_estado: t
  });
  return r
    ? { permitida: !1, message: r.message || 'No se pudo validar la transición de estado.' }
    : s || { permitida: !1, message: 'No se pudo validar la transición de estado.' };
}
async function ka(a) {
  return ue(
    'listar_reaperturas_nv',
    async () => {
      if (!a) return [];
      const { data: t, error: s } = await L.from('tms_nv_reaperturas')
        .select(
          'id, operacion_id, nv, canal, estado_origen, motivo, estado, solicitada_por, solicitada_por_nombre, solicitada_at, resuelta_por, resuelta_por_nombre, resuelta_at, observacion_resolucion'
        )
        .eq('operacion_id', a)
        .order('solicitada_at', { ascending: !1 });
      if (s) throw s;
      return t || [];
    },
    { payload: { operacionId: a }, slowMs: 450, message: 'Consulta de historial de reaperturas' }
  );
}
async function Da(a, t) {
  return _e(
    'solicitar_reapertura_nv',
    async () => {
      const { data: s, error: r } = await L.rpc('solicitar_reapertura_nv', {
        p_operacion_id: a,
        p_motivo: t
      });
      return Me(s, r);
    },
    {
      payload: { id: a, motivoLength: String(t || '').trim().length },
      message: 'Solicitud de reapertura de N.V.'
    }
  );
}
async function yt(a, t, s = '') {
  return _e(
    'resolver_reapertura_nv',
    async () => {
      const { data: r, error: n } = await L.rpc('resolver_reapertura_nv', {
        p_request_id: a,
        p_aprobar: t,
        p_observacion: s || null
      });
      return Me(r, n);
    },
    {
      payload: { requestId: a, aprobar: t, observacionLength: String(s || '').trim().length },
      message: 'Resolucion de solicitud de reapertura'
    }
  );
}
async function _t(a) {
  return _e(
    'eliminar_nv',
    async () => {
      const { data: t, error: s } = await L.rpc('eliminar_nv', { p_id: a }),
        r = Me(t, s);
      return ((r == null ? void 0 : r.ok) !== !1 && ja(), r);
    },
    { payload: { id: a }, message: 'Eliminacion de N.V. en Panel' }
  );
}
async function wt() {
  return ue(
    'listar_consolidados',
    async () => {
      const [{ data: a }, { data: t }] = await Promise.all([
          L.from('tms_consolidados')
            .select('id, ticket, fecha_comprometida, estado, observacion, created_by, created_at')
            .order('id', { ascending: !1 }),
          L.from('tms_consolidado_nvs').select('id, consolidado_id, nv, canal, cliente')
        ]),
        s = {};
      return (
        (t || []).forEach((r) => {
          (s[r.consolidado_id] = s[r.consolidado_id] || []).push({
            id: r.id,
            nv: r.nv,
            canal: r.canal,
            cliente: r.cliente
          });
        }),
        (a || []).map((r) => ({ ...r, nvs: s[r.id] || [] }))
      );
    },
    {
      payload: { feature: 'consolidados' },
      slowMs: 700,
      message: 'Carga de consolidados del Panel'
    }
  );
}
async function Ce(a) {
  return _e(
    'guardar_consolidado',
    async () => {
      const { data: t, error: s } = await L.rpc('guardar_consolidado', { p: a });
      return s ? { ok: !1, error: s.message } : t || { ok: !0 };
    },
    {
      payload: {
        id: (a == null ? void 0 : a.id) ?? null,
        ticket: (a == null ? void 0 : a.ticket) || '',
        nvs: Array.isArray(a == null ? void 0 : a.nvs) ? a.nvs.length : 0
      },
      message: 'Guardado de consolidado'
    }
  );
}
async function Ct(a) {
  return _e(
    'eliminar_consolidado',
    async () => {
      const { data: t, error: s } = await L.rpc('eliminar_consolidado', { p_id: a });
      return s ? { ok: !1, error: s.message } : t || { ok: !0 };
    },
    { payload: { id: a }, message: 'Eliminacion de consolidado' }
  );
}
async function da(a) {
  return ue(
    'buscar_nv_basico',
    async () => {
      const t = String(a).trim();
      if (!t) return null;
      const s = [];
      (/^\d+$/.test(t) && s.push(`nv_ptm.eq.${Number(t)}`),
        s.push(`nv_orange.eq.${t}`, `nv_farmapack.eq.${t}`, `varios.ilike.*${t}*`));
      const { data: r } = await L.from(ce)
        .select('nv_ptm,nv_orange,nv_farmapack,varios,cliente,estado,fecha_estado')
        .or(s.join(','))
        .order('fecha_estado', { ascending: !1 })
        .limit(1);
      if (!r || r.length === 0) return null;
      const n = r[0];
      return { nv: we(n), canal: Te(n), cliente: n.cliente || null, estado: n.estado || null };
    },
    {
      payload: { nv: String(a || '').trim() },
      slowMs: 400,
      message: 'Busqueda basica de N.V. para consolidados'
    }
  );
}
const ae = {
    EN_PROCESO: 'En Proceso',
    SHIPPING: 'Shipping',
    CURRIER: 'Currier',
    EN_RUTA: 'En Ruta',
    ENTREGADO: 'Entregado',
    RECIBIDO_CONFORME: 'Recibido Conforme',
    RECIBIDO_OBS: 'Recibido C/OBS'
  },
  Et = [ae.CURRIER, ae.EN_RUTA, ae.ENTREGADO, ae.RECIBIDO_CONFORME, ae.RECIBIDO_OBS],
  At = [ae.EN_PROCESO, ae.SHIPPING, ae.CURRIER, ae.EN_RUTA, ae.ENTREGADO];
function St(a) {
  const t = (a || '').toUpperCase();
  return Et.some((s) => s.toUpperCase() === t);
}
function Rt(a, t) {
  const s = new Date(a);
  let r = 0;
  const n = s.getDay();
  for (n === 0 ? s.setDate(s.getDate() + 1) : n === 6 && s.setDate(s.getDate() + 2); r < t;) {
    s.setDate(s.getDate() + 1);
    const l = s.getDay();
    l !== 0 && l !== 6 && r++;
  }
  return s;
}
function ua(a, t) {
  const s = t || a;
  if (!s) return '';
  const r = new Date(s + 'T12:00:00');
  if (isNaN(r.getTime())) return '';
  const n = Rt(r, 2),
    l = n.getFullYear(),
    i = String(n.getMonth() + 1).padStart(2, '0'),
    c = String(n.getDate()).padStart(2, '0');
  return `${l}-${i}-${c}`;
}
const pa = {
    nv: '',
    lookupResult: null,
    lookupLoading: !1,
    mode: 'idle',
    orangeAssociationRequired: !1,
    orangeAssociationNv: '',
    orangeAssociationData: null,
    orangeAssociationLoading: !1,
    orangeAssociationError: '',
    estado: ae.EN_PROCESO,
    tipoDespacho: '',
    transportista: '',
    fechaCompromiso: '',
    fechaAprobacion: '',
    fechaAprobacionReal: '',
    fechaFacturacion: '',
    fechaDespacho: '',
    factura: '',
    guia: '',
    bultos: '',
    valorFactura: '',
    numeroEnvio: '',
    urgente: !1,
    variosTipo: '',
    variosCliente: '',
    variosVendedor: '',
    variosDivision: '',
    variosCcosto: '',
    incidencia: '',
    estadoIncidencia: 'ABIERTA',
    observacionesIncidencia: '',
    submitting: !1,
    submitResult: null,
    errors: [],
    autoFilledDates: new Set(),
    estadoOpen: !1,
    estadoQuery: ''
  },
  fe = za((a) => ({
    canal: 'ptm',
    ...pa,
    patch: (t) => a(t),
    markAutoFilled: (t) =>
      a((s) => {
        const r = new Set(s.autoFilledDates);
        return (t.forEach((n) => r.add(n)), { autoFilledDates: r });
      }),
    clearAutoFilled: (t) =>
      a((s) => {
        const r = new Set(s.autoFilledDates);
        return (r.delete(t), { autoFilledDates: r });
      }),
    reset: () =>
      a({
        ...pa,
        variosTipo: '',
        variosCliente: '',
        variosVendedor: '',
        variosDivision: '',
        variosCcosto: ''
      }),
    applyFound: (t) =>
      a(() => {
        const s = t.fecha_compromiso || ua(t.fecha_aprobacion, t.fecha_aprobacion_real),
          r = !t.fecha_compromiso && !!s;
        return {
          mode: 'update',
          estado: t.estado || ae.EN_PROCESO,
          tipoDespacho: t.tipo_despacho || '',
          transportista: t.transportista || '',
          fechaCompromiso: s,
          fechaAprobacion: t.fecha_aprobacion || '',
          fechaAprobacionReal: t.fecha_aprobacion_real || '',
          fechaFacturacion: t.fecha_facturacion || '',
          fechaDespacho: t.fecha_despacho || '',
          factura: t.factura || '',
          guia: t.guia || '',
          bultos: t.bultos ? String(t.bultos) : '',
          valorFactura: t.valor_factura ? String(t.valor_factura) : '',
          numeroEnvio: t.numero_envio || '',
          urgente: String(t.urgente) === 'true' || t.urgente === !0,
          incidencia: t.incidencia || '',
          estadoIncidencia: t.estado_incidencia || 'ABIERTA',
          observacionesIncidencia: t.observaciones_incidencia || '',
          orangeAssociationNv: t.nv_orange || '',
          autoFilledDates: r ? new Set(['fechaCompromiso']) : new Set()
        };
      }),
    applyNew: (t) =>
      a(() => {
        const s = (t && t.fecha_compromiso) || '';
        return {
          mode: 'create',
          estado: ae.EN_PROCESO,
          tipoDespacho: '',
          transportista: '',
          fechaCompromiso: s,
          fechaAprobacion: '',
          fechaAprobacionReal: '',
          fechaFacturacion: '',
          fechaDespacho: '',
          factura: '',
          guia: '',
          bultos: '',
          valorFactura: '',
          numeroEnvio: '',
          urgente: !1,
          incidencia: '',
          estadoIncidencia: 'ABIERTA',
          observacionesIncidencia: '',
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: '',
          orangeAssociationLoading: !1,
          autoFilledDates: s ? new Set(['fechaCompromiso']) : new Set()
        };
      }),
    recalcCompromiso: () =>
      a((t) => {
        if (t.mode === 'idle') return t;
        const s = ua(t.fechaAprobacion, t.fechaAprobacionReal);
        if (!s || s === t.fechaCompromiso) return t;
        const r = new Set(t.autoFilledDates);
        return (r.add('fechaCompromiso'), { fechaCompromiso: s, autoFilledDates: r });
      })
  })),
  kt = ({
    items: a,
    active: t,
    onSelect: s,
    accent: r = '#ea580c',
    ease: n = 'power3.easeOut'
  }) => {
    const l = b.useRef([]),
      i = b.useRef([]),
      c = b.useRef([]),
      o = b.useRef([]);
    (b.useEffect(() => {
      var g;
      const d = () => {
        l.current.forEach((v, A) => {
          var Q;
          if (!(v != null && v.parentElement)) return;
          const D = v.parentElement,
            _ = D.getBoundingClientRect(),
            { width: R, height: O } = _;
          if (R === 0 || O === 0) return;
          const E = ((R * R) / 4 + O * O) / (2 * O),
            V = Math.ceil(2 * E) + 2,
            P = Math.ceil(E - Math.sqrt(Math.max(0, E * E - (R * R) / 4))) + 1,
            Y = V - P;
          ((v.style.width = `${V}px`),
            (v.style.height = `${V}px`),
            (v.style.bottom = `-${P}px`),
            J.set(v, { xPercent: -50, scale: 0, transformOrigin: `50% ${Y}px` }));
          const x = D.querySelector('.pc-label'),
            I = D.querySelector('.pc-label-hover');
          (x && J.set(x, { y: 0 }),
            I && J.set(I, { y: O + 12, opacity: 0 }),
            (Q = i.current[A]) == null || Q.kill());
          const W = J.timeline({ paused: !0 });
          (W.to(v, { scale: 1.2, xPercent: -50, duration: 2, ease: n, overwrite: 'auto' }, 0),
            x && W.to(x, { y: -(O + 8), duration: 2, ease: n, overwrite: 'auto' }, 0),
            I &&
              (J.set(I, { y: Math.ceil(O + 100), opacity: 0 }),
              W.to(I, { y: 0, opacity: 1, duration: 2, ease: n, overwrite: 'auto' }, 0)),
            (i.current[A] = W));
        });
      };
      return (
        d(),
        window.addEventListener('resize', d),
        (g = document.fonts) != null && g.ready && document.fonts.ready.then(d).catch(() => {}),
        () => window.removeEventListener('resize', d)
      );
    }, [a, n]),
      b.useEffect(() => {
        a.forEach((d, g) => {
          var V;
          const v = o.current[g],
            A = i.current[g],
            D = l.current[g],
            _ = v == null ? void 0 : v.querySelector('.pc-label'),
            R = v == null ? void 0 : v.querySelector('.pc-label-hover'),
            O = t === d.value,
            E = d.color || r;
          if (((V = c.current[g]) == null || V.kill(), !(!v || !D || !A))) {
            if (O) {
              ((v.style.background = E),
                (v.style.color = '#ffffff'),
                J.set(D, { scale: 1.2, xPercent: -50 }),
                _ && J.set(_, { y: -(v.offsetHeight + 8) }),
                R && J.set(R, { y: 0, opacity: 1 }),
                A.progress(1).pause());
              return;
            }
            ((v.style.background = ''),
              (v.style.color = ''),
              J.set(D, { scale: 0, xPercent: -50 }),
              _ && J.set(_, { y: 0 }),
              R && J.set(R, { y: v.offsetHeight + 12, opacity: 0 }),
              A.progress(0).pause());
          }
        });
      }, [t, a, r]));
    const h = (d) => {
        var v, A;
        if (t === ((v = a[d]) == null ? void 0 : v.value)) return;
        const g = i.current[d];
        g &&
          ((A = c.current[d]) == null || A.kill(),
          (c.current[d] = g.tweenTo(g.duration(), { duration: 0.3, ease: n, overwrite: 'auto' })));
      },
      u = (d) => {
        var v, A;
        if (t === ((v = a[d]) == null ? void 0 : v.value)) return;
        const g = i.current[d];
        g &&
          ((A = c.current[d]) == null || A.kill(),
          (c.current[d] = g.tweenTo(0, { duration: 0.2, ease: n, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: 'pc-track',
      children: a.map((d, g) => {
        const v = t === d.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(d.value),
            onMouseEnter: () => h(g),
            onMouseLeave: () => u(g),
            className: `pc-pill ${v ? 'pc-active' : ''}`,
            'aria-pressed': v,
            ref: (A) => {
              o.current[g] = A;
            },
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (A) => {
                  l.current[g] = A;
                },
                style: { background: d.color || r }
              }),
              e.jsxs('span', {
                className: 'pc-label-stack',
                children: [
                  e.jsx('span', { className: 'pc-label', children: d.label }),
                  e.jsx('span', {
                    className: 'pc-label-hover',
                    'aria-hidden': 'true',
                    children: d.label
                  })
                ]
              })
            ]
          },
          d.value
        );
      })
    });
  },
  sa = ({ items: a, active: t, onSelect: s, inline: r = !1, ease: n = 'power3.easeOut' }) => {
    const l = b.useRef([]),
      i = b.useRef([]),
      c = b.useRef([]);
    b.useEffect(() => {
      var d;
      const u = () => {
        l.current.forEach((g, v) => {
          var W;
          if (!(g != null && g.parentElement)) return;
          const A = g.parentElement,
            D = A.getBoundingClientRect(),
            { width: _, height: R } = D;
          if (_ === 0 || R === 0) return;
          const O = ((_ * _) / 4 + R * R) / (2 * R),
            E = Math.ceil(2 * O) + 2,
            V = Math.ceil(O - Math.sqrt(Math.max(0, O * O - (_ * _) / 4))) + 1,
            P = E - V;
          ((g.style.width = `${E}px`),
            (g.style.height = `${E}px`),
            (g.style.bottom = `-${V}px`),
            J.set(g, { xPercent: -50, scale: 0, transformOrigin: `50% ${P}px` }));
          const Y = A.querySelector('.pc-label'),
            x = A.querySelector('.pc-label-hover');
          (Y && J.set(Y, { y: 0 }),
            x && J.set(x, { y: R + 12, opacity: 0 }),
            (W = i.current[v]) == null || W.kill());
          const I = J.timeline({ paused: !0 });
          (I.to(g, { scale: 1.2, xPercent: -50, duration: 2, ease: n, overwrite: 'auto' }, 0),
            Y && I.to(Y, { y: -(R + 8), duration: 2, ease: n, overwrite: 'auto' }, 0),
            x &&
              (J.set(x, { y: Math.ceil(R + 100), opacity: 0 }),
              I.to(x, { y: 0, opacity: 1, duration: 2, ease: n, overwrite: 'auto' }, 0)),
            (i.current[v] = I));
        });
      };
      return (
        u(),
        window.addEventListener('resize', u),
        (d = document.fonts) != null && d.ready && document.fonts.ready.then(u).catch(() => {}),
        () => window.removeEventListener('resize', u)
      );
    }, [a, n]);
    const o = (u) => {
        var g, v;
        if (t === ((g = a[u]) == null ? void 0 : g.value)) return;
        const d = i.current[u];
        d &&
          ((v = c.current[u]) == null || v.kill(),
          (c.current[u] = d.tweenTo(d.duration(), { duration: 0.3, ease: n, overwrite: 'auto' })));
      },
      h = (u) => {
        var g, v;
        if (t === ((g = a[u]) == null ? void 0 : g.value)) return;
        const d = i.current[u];
        d &&
          ((v = c.current[u]) == null || v.kill(),
          (c.current[u] = d.tweenTo(0, { duration: 0.2, ease: n, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: `pc-track pc-estado${r ? ' pc-inline' : ''}`,
      children: a.map((u, d) => {
        const g = t === u.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(u.value),
            onMouseEnter: () => o(d),
            onMouseLeave: () => h(d),
            className: `pc-pill ${g ? 'pc-active' : ''}`,
            style: g ? { background: u.color, color: '#fff' } : void 0,
            title: u.label,
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (v) => {
                  l.current[d] = v;
                },
                style: { background: u.color }
              }),
              e.jsxs('span', {
                className: 'pc-label-stack',
                children: [
                  e.jsxs('span', {
                    className: 'pc-label',
                    children: [
                      e.jsx('span', { className: 'pc-dot', style: { background: u.color } }),
                      u.label,
                      u.count != null && e.jsx('span', { className: 'pc-count', children: u.count })
                    ]
                  }),
                  e.jsxs('span', {
                    className: 'pc-label-hover',
                    'aria-hidden': 'true',
                    children: [
                      e.jsx('span', {
                        className: 'pc-dot',
                        style: { background: 'rgba(255,255,255,0.9)' }
                      }),
                      u.label,
                      u.count != null &&
                        e.jsx('span', { className: 'pc-count pc-count-on', children: u.count })
                    ]
                  })
                ]
              })
            ]
          },
          u.value
        );
      })
    });
  };
function Dt({
  options: a,
  transportistasOpts: t,
  vendedoresMaestro: s,
  onLookup: r,
  onLookupOrange: n,
  canRequestReopen: l,
  onOpenReopen: i,
  latestReopenRequest: c
}) {
  var ra, na;
  const o = fe(),
    {
      canal: h,
      nv: u,
      lookupResult: d,
      lookupLoading: g,
      mode: v,
      estado: A,
      tipoDespacho: D,
      transportista: _,
      fechaCompromiso: R,
      fechaAprobacion: O,
      fechaAprobacionReal: E,
      fechaFacturacion: V,
      fechaDespacho: P,
      factura: Y,
      guia: x,
      bultos: I,
      valorFactura: W,
      numeroEnvio: Q,
      urgente: H,
      variosTipo: U,
      variosCliente: ee,
      variosVendedor: z,
      variosDivision: te,
      variosCcosto: y,
      orangeAssociationRequired: j,
      orangeAssociationNv: w,
      orangeAssociationData: k,
      orangeAssociationLoading: C,
      orangeAssociationError: F,
      incidencia: Z,
      estadoIncidencia: p,
      observacionesIncidencia: N,
      errors: S,
      submitResult: q,
      autoFilledDates: G,
      patch: T,
      markAutoFilled: X,
      clearAutoFilled: se,
      recalcCompromiso: le
    } = o;
  (b.useEffect(() => {
    if (v === 'idle') return;
    const m = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }),
      K = St(A),
      ie = A.toUpperCase() === ae.SHIPPING.toUpperCase(),
      Le = {},
      Ie = [];
    (K && !P && ((Le.fechaDespacho = m), Ie.push('fechaDespacho')),
      (ie || K) && !V && ((Le.fechaFacturacion = m), Ie.push('fechaFacturacion')),
      Ie.length > 0 && (T(Le), X(Ie)));
  }, [A, v]),
    b.useEffect(() => {
      v !== 'idle' && le();
    }, [E, v]));
  const ne = b.useMemo(() => {
      const m = new Map();
      return (s.forEach((K) => m.set(K.nombre.trim().toLowerCase(), K)), m);
    }, [s]),
    f = (m) => {
      const K = ne.get(m.trim().toLowerCase());
      T(
        K
          ? {
              variosVendedor: m,
              variosDivision: K.division || '',
              variosCcosto: K.centro_costo || ''
            }
          : { variosVendedor: m }
      );
    },
    $ = ((ra = He.find((m) => m.value === h)) == null ? void 0 : ra.color) || re,
    M = {
      ptm: {
        eyebrow: 'Canal principal',
        title: 'PTM',
        hint: 'Flujo estándar para notas de venta institucionales de PTM.',
        tone: 'from-orange-500/10 to-amber-500/10 border-orange-200',
        badge: 'Operación base',
        color: '#ea580c'
      },
      orange: {
        eyebrow: 'Canal asociado',
        title: 'Orange',
        hint: 'Mantiene lookup y registro dedicado para el canal Orange.',
        tone: 'from-amber-500/10 to-yellow-500/10 border-amber-200',
        badge: 'Canal externo',
        color: '#f59e0b'
      },
      farmapack: {
        eyebrow: 'Canal asociado',
        title: 'Farmapack',
        hint: 'Pensado para seguimiento limpio de notas Farmapack sin mezclar numeración.',
        tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-200',
        badge: 'Canal externo',
        color: '#0f766e'
      },
      varios: {
        eyebrow: 'Canal flexible',
        title: 'Varios',
        hint: 'Permite captura manual para casos especiales, demos y salidas no estándar.',
        tone: 'from-slate-500/10 to-indigo-500/10 border-slate-200',
        badge: 'Manual asistido',
        color: '#4f46e5'
      }
    }[h] || {
      eyebrow: 'Canal',
      title: 'Operación',
      hint: 'Selecciona un canal para comenzar.',
      tone: 'from-slate-500/10 to-slate-500/10 border-slate-200',
      badge: 'Selección',
      color: re
    },
    B = d
      ? d.found
        ? {
            container: 'bg-blue-50 text-blue-700 border-blue-200',
            iconWrap: 'bg-blue-100 text-blue-700',
            title: 'NV encontrada',
            description: `Fila ${d.row} lista para actualizar en el panel.`
          }
        : {
            container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            iconWrap: 'bg-emerald-100 text-emerald-700',
            title: 'NV nueva',
            description: 'No existe una coincidencia previa; el flujo continúa como creación.'
          }
      : null,
    qe =
      (d == null ? void 0 : d.found) &&
      ((na = d == null ? void 0 : d.data) == null ? void 0 : na.estado) === 'Entregado';
  return e.jsxs('div', {
    className: 'anim-fade-up space-y-4',
    children: [
      e.jsxs('section', {
        className:
          'relative overflow-hidden bg-white rounded-[1.75rem] border border-slate-200/90 p-5 sm:p-6 shadow-[0_22px_70px_-45px_rgba(15,23,42,0.32)]',
        children: [
          e.jsx('div', {
            className:
              'absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_22%)]'
          }),
          e.jsxs('div', {
            className: 'relative grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_290px] gap-5',
            children: [
              e.jsxs('div', {
                className: 'min-w-0',
                children: [
                  e.jsxs('div', {
                    className: 'flex flex-wrap items-start justify-between gap-3 mb-4',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsxs('div', {
                            className:
                              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
                            style: { border: `1px solid ${$}33`, background: `${$}12`, color: $ },
                            children: [e.jsx(ze, { size: 12 }), 'Identificación']
                          }),
                          e.jsx('h2', {
                            className:
                              'mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900',
                            children: 'Ingresar nota de venta'
                          }),
                          e.jsx('p', {
                            className: 'mt-1 text-sm text-slate-500 max-w-2xl',
                            children:
                              'Selecciona el canal, consulta la N.V. y continúa con el flujo correcto sin cambiar de pantalla.'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className:
                          'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm',
                        children: [
                          e.jsx('span', {
                            className: `inline-block h-2.5 w-2.5 rounded-full ${v === 'idle' ? 'bg-slate-300' : d != null && d.found ? 'bg-blue-500' : 'bg-emerald-500'}`
                          }),
                          v === 'idle'
                            ? 'Pendiente de consulta'
                            : d != null && d.found
                              ? 'Modo actualización'
                              : 'Modo creación'
                        ]
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center gap-2 mb-3',
                        children: [
                          e.jsx(Ia, { size: 15, className: 'text-slate-400' }),
                          e.jsx('label', {
                            className:
                              'text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em]',
                            children: 'Canal operativo'
                          })
                        ]
                      }),
                      e.jsx(kt, {
                        items: He,
                        active: h,
                        onSelect: (m) =>
                          T({
                            canal: m,
                            lookupResult: null,
                            mode: 'idle',
                            orangeAssociationRequired: !1,
                            orangeAssociationNv: '',
                            orangeAssociationData: null,
                            orangeAssociationError: ''
                          })
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className:
                      'mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end',
                    children: [
                      e.jsxs('div', {
                        className: 'min-w-0',
                        children: [
                          e.jsx('label', {
                            className:
                              'text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-2 block',
                            children: 'N° Nota de venta'
                          }),
                          e.jsxs('div', {
                            className: 'relative',
                            children: [
                              e.jsx(Qe, {
                                size: 18,
                                className: 'absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                              }),
                              e.jsx('input', {
                                type: 'text',
                                inputMode: 'numeric',
                                value: u,
                                onChange: (m) => {
                                  const K = m.target.value;
                                  !K.trim() && v !== 'idle'
                                    ? T({
                                        nv: K,
                                        mode: 'idle',
                                        lookupResult: null,
                                        submitResult: null,
                                        errors: []
                                      })
                                    : T({ nv: K });
                                },
                                onKeyDown: (m) => m.key === 'Enter' && r(),
                                placeholder: 'Ej: 97125',
                                className:
                                  'w-full h-14 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base font-semibold text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400',
                                style: { boxShadow: '0 0 0 0 rgba(0,0,0,0)' }
                              })
                            ]
                          }),
                          e.jsx('p', {
                            className: 'mt-2 text-xs text-slate-400',
                            children:
                              'La consulta detecta si la N.V. existe para actualizarla o si corresponde crear un registro nuevo.'
                          })
                        ]
                      }),
                      e.jsx('button', {
                        type: 'button',
                        onClick: r,
                        disabled: g || !u.trim(),
                        className:
                          'h-14 min-w-[152px] px-5 rounded-2xl text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_16px_30px_-18px_rgba(24,24,27,0.8)] inline-flex items-center justify-center gap-2',
                        style: {
                          background: `linear-gradient(135deg, ${M.color} 0%, #18181b 100%)`
                        },
                        children: g
                          ? e.jsx('span', {
                              className:
                                'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                            })
                          : e.jsxs(e.Fragment, {
                              children: [e.jsx($a, { size: 16 }), ' Buscar N.V.']
                            })
                      })
                    ]
                  }),
                  d &&
                    e.jsx('div', {
                      className: 'mt-4 anim-fade-up',
                      children: e.jsxs('div', {
                        className: `rounded-[1.35rem] border p-4 ${B.container}`,
                        children: [
                          e.jsxs('div', {
                            className:
                              'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-start gap-3',
                                children: [
                                  e.jsx('div', {
                                    className: `h-10 w-10 rounded-2xl flex items-center justify-center ${B.iconWrap}`,
                                    children: d.found
                                      ? e.jsx(Va, { size: 18 })
                                      : e.jsx(ze, { size: 18 })
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx('div', {
                                        className: 'text-sm font-black',
                                        children: B.title
                                      }),
                                      e.jsx('div', {
                                        className: 'text-xs mt-0.5 opacity-90',
                                        children: B.description
                                      })
                                    ]
                                  })
                                ]
                              }),
                              e.jsx('div', {
                                className:
                                  'rounded-full border border-current/20 bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
                                children: d.found ? 'Actualizar' : 'Crear'
                              })
                            ]
                          }),
                          (() => {
                            const m = d.found ? d.data : d.autoFill;
                            if (!m) return null;
                            const K = [
                              { l: 'Cliente', v: m.cliente },
                              { l: 'Vendedor', v: m.vendedor },
                              { l: 'C. Costo', v: m.ccosto || m.centro_costo },
                              { l: 'División', v: m.division }
                            ].filter((ie) => ie.v);
                            return K.length === 0
                              ? null
                              : e.jsx('div', {
                                  className: 'mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5',
                                  children: K.map((ie) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className:
                                          'rounded-2xl border border-white/60 bg-white/70 px-3.5 py-3',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[10px] uppercase tracking-[0.16em] opacity-60 font-bold',
                                            children: ie.l
                                          }),
                                          e.jsx('div', {
                                            className: 'text-[13px] mt-1 font-semibold truncate',
                                            children: ie.v
                                          })
                                        ]
                                      },
                                      ie.l
                                    )
                                  )
                                });
                          })()
                        ]
                      })
                    })
                ]
              }),
              e.jsxs('aside', {
                className: `relative rounded-[1.5rem] border bg-gradient-to-br ${M.tone} p-4 sm:p-5`,
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500',
                    children: M.eyebrow
                  }),
                  e.jsxs('div', {
                    className: 'mt-2 flex items-center justify-between gap-3',
                    children: [
                      e.jsx('div', {
                        className: 'text-2xl font-black text-slate-900',
                        children: M.title
                      }),
                      e.jsx('div', {
                        className:
                          'rounded-full border bg-white/80 px-3 py-1 text-[11px] font-bold',
                        style: { borderColor: `${M.color}33`, color: M.color },
                        children: M.badge
                      })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'mt-3 text-sm leading-6 text-slate-600',
                    children: M.hint
                  }),
                  e.jsxs('div', {
                    className: 'mt-5 rounded-2xl border border-white/70 bg-white/80 p-4',
                    children: [
                      e.jsx('div', {
                        className:
                          'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400',
                        children: 'Buenas prácticas'
                      }),
                      e.jsxs('div', {
                        className: 'mt-3 space-y-2.5',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-start gap-2.5 text-sm text-slate-600',
                            children: [
                              e.jsx('span', {
                                className: 'mt-1 h-2 w-2 rounded-full bg-orange-500 shrink-0'
                              }),
                              e.jsx('span', {
                                children:
                                  'Usa la N.V. exacta del canal seleccionado para evitar cruces de numeración.'
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'flex items-start gap-2.5 text-sm text-slate-600',
                            children: [
                              e.jsx('span', {
                                className: 'mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0'
                              }),
                              e.jsx('span', {
                                children:
                                  'Si existe una coincidencia, el panel entra en modo actualización con los datos recuperados.'
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'flex items-start gap-2.5 text-sm text-slate-600',
                            children: [
                              e.jsx('span', {
                                className: 'mt-1 h-2 w-2 rounded-full bg-sky-500 shrink-0'
                              }),
                              e.jsx('span', {
                                children:
                                  'Si no existe, continúas directo con creación sin salir del formulario.'
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }),
      h === 'ptm' &&
        j &&
        v !== 'idle' &&
        e.jsxs('section', {
          className: 'bg-white rounded-2xl border border-amber-200 p-5 anim-fade-up',
          children: [
            e.jsxs('div', {
              className: 'flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className:
                        'inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 border border-amber-200',
                      children: [e.jsx(oa, { size: 12 }), 'Asociación comercial']
                    }),
                    e.jsx('h2', {
                      className: 'mt-3 text-base font-black text-slate-900',
                      children: 'Asociar N.V. ORANGE'
                    }),
                    e.jsx('p', {
                      className: 'mt-1 text-sm text-slate-500 max-w-3xl',
                      children:
                        'Detectamos que esta N.V. PTM corresponde a un cliente Orange. Vincula la N.V. Orange para cargar automáticamente cliente, vendedor y centro de costo correctos.'
                    })
                  ]
                }),
                e.jsx('div', {
                  className:
                    'rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-800 max-w-sm',
                  children:
                    'Esta asociación ayuda a visibilizar errores y atrasos de despacho por vendedor dentro del dashboard operacional.'
                })
              ]
            }),
            e.jsxs('div', {
              className: 'mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: 'field-label',
                      children: 'N.V. ORANGE asociada *'
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: w,
                      onChange: (m) =>
                        T({
                          orangeAssociationNv: m.target.value,
                          orangeAssociationError: '',
                          orangeAssociationData: null
                        }),
                      onKeyDown: (m) => m.key === 'Enter' && (n == null ? void 0 : n(w)),
                      className: 'field-input',
                      placeholder: 'Ej: ORG-100234'
                    }),
                    e.jsx('p', {
                      className: 'mt-1 text-[11px] text-slate-400',
                      children:
                        'Se busca contra el catálogo Orange y se guarda vinculado en la misma operación.'
                    })
                  ]
                }),
                e.jsxs('button', {
                  type: 'button',
                  onClick: () => (n == null ? void 0 : n(w)),
                  disabled: C || !w.trim(),
                  className:
                    'h-11 px-5 rounded-xl bg-amber-500 text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2',
                  children: [
                    C
                      ? e.jsx('span', {
                          className:
                            'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                        })
                      : e.jsx(oa, { size: 15 }),
                    'Validar asociación'
                  ]
                })
              ]
            }),
            F &&
              e.jsxs('div', {
                className:
                  'mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2',
                children: [e.jsx(Ne, { size: 16 }), F]
              }),
            k &&
              e.jsx('div', {
                className: 'mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3',
                children: [
                  { label: 'Cliente Orange', value: k.cliente || '—' },
                  { label: 'Vendedor', value: k.vendedor || '—' },
                  { label: 'Centro costo', value: k.ccosto || '—' },
                  { label: 'División', value: k.division || '—' }
                ].map((m) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-[10px] uppercase tracking-[0.16em] text-amber-700 font-bold',
                          children: m.label
                        }),
                        e.jsx('div', {
                          className: 'mt-1 text-sm font-semibold text-slate-800 truncate',
                          children: m.value
                        })
                      ]
                    },
                    m.label
                  )
                )
              })
          ]
        }),
      qe &&
        e.jsxs('section', {
          className: 'rounded-2xl border border-red-200 bg-red-50/80 p-5 anim-fade-up',
          children: [
            e.jsxs('div', {
              className: 'flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className:
                        'inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red-700',
                      children: [e.jsx(Ne, { size: 12 }), 'N.V. entregada bloqueada']
                    }),
                    e.jsx('h2', {
                      className: 'mt-3 text-base font-black text-slate-900',
                      children: 'Esta N.V. no puede editarse directo'
                    }),
                    e.jsxs('p', {
                      className: 'mt-1 text-sm text-slate-600 max-w-3xl',
                      children: [
                        'Para no alterar el cumplimiento OTIF/SLA, cualquier cambio debe pasar por una solicitud de reapertura aprobada por otro rol. Al aprobarse, la N.V. vuelve automáticamente a ',
                        e.jsx('strong', { children: 'En Proceso' }),
                        '.'
                      ]
                    })
                  ]
                }),
                l &&
                  e.jsx('button', {
                    type: 'button',
                    onClick: i,
                    className:
                      'h-11 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-sm hover:bg-orange-600',
                    children: 'Solicitar reapertura'
                  })
              ]
            }),
            c &&
              e.jsxs('div', {
                className: 'mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3',
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700',
                    children: 'Solicitud pendiente'
                  }),
                  e.jsx('div', {
                    className: 'mt-1 text-sm font-semibold text-slate-800',
                    children: c.motivo
                  }),
                  e.jsxs('div', {
                    className: 'mt-1 text-xs text-slate-500',
                    children: [
                      'Solicitada por ',
                      c.solicitada_por_nombre || 'Usuario',
                      ' el ',
                      String(c.solicitada_at || '').slice(0, 10) || '—'
                    ]
                  })
                ]
              })
          ]
        }),
      h === 'varios' &&
        v === 'create' &&
        e.jsxs('section', {
          className: 'bg-white rounded-2xl border border-orange-200 p-5 anim-fade-up',
          children: [
            e.jsxs('h2', {
              className: 'text-[11px] font-semibold text-orange-500 uppercase tracking-wider mb-4',
              children: [U || 'Varios', ' — Datos Manuales']
            }),
            e.jsxs('div', {
              className: 'mb-4',
              children: [
                e.jsx('label', { className: 'field-label', children: 'Tipo *' }),
                e.jsx('div', {
                  className: 'flex flex-wrap gap-2',
                  children: at.map((m) =>
                    e.jsx(
                      'button',
                      {
                        type: 'button',
                        onClick: () => T({ variosTipo: m }),
                        className: `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${U === m ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'}`,
                        children: m
                      },
                      m
                    )
                  )
                })
              ]
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-2 gap-4',
              children: [
                e.jsxs('div', {
                  className: 'col-span-2',
                  children: [
                    e.jsx('label', { className: 'field-label', children: 'Nombre del Cliente *' }),
                    e.jsx('input', {
                      type: 'text',
                      value: ee,
                      onChange: (m) => T({ variosCliente: m.target.value }),
                      className: 'field-input',
                      placeholder: 'Ej: Hospital Regional'
                    })
                  ]
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', { className: 'field-label', children: 'Vendedor *' }),
                    s.length > 0
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx('input', {
                              type: 'text',
                              list: 'vendedores-list',
                              value: z,
                              onChange: (m) => f(m.target.value),
                              className: 'field-input',
                              placeholder: 'Selecciona o escribe'
                            }),
                            e.jsx('datalist', {
                              id: 'vendedores-list',
                              children: s.map((m) => e.jsx('option', { value: m.nombre }, m.id))
                            })
                          ]
                        })
                      : e.jsx('input', {
                          type: 'text',
                          value: z,
                          onChange: (m) => T({ variosVendedor: m.target.value }),
                          className: 'field-input',
                          placeholder: 'Nombre del vendedor'
                        })
                  ]
                }),
                e.jsxs('div', {
                  children: [
                    e.jsxs('label', {
                      className: 'field-label',
                      children: [
                        'División ',
                        e.jsx('span', {
                          className: 'text-gray-400 font-normal',
                          children: '(auto)'
                        })
                      ]
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: te,
                      onChange: (m) => T({ variosDivision: m.target.value }),
                      className: 'field-input',
                      placeholder: 'Ej: DIV. INSTITUCIONAL'
                    })
                  ]
                }),
                e.jsxs('div', {
                  children: [
                    e.jsxs('label', {
                      className: 'field-label',
                      children: [
                        'Centro Costo ',
                        e.jsx('span', {
                          className: 'text-gray-400 font-normal',
                          children: '(auto)'
                        })
                      ]
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: y,
                      onChange: (m) => T({ variosCcosto: m.target.value }),
                      className: 'field-input',
                      placeholder: 'Ej: 1-06'
                    })
                  ]
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', { className: 'field-label', children: 'F. Aprobación Real' }),
                    e.jsx('input', {
                      type: 'date',
                      value: E,
                      onChange: (m) => T({ fechaAprobacionReal: m.target.value }),
                      className: 'field-input'
                    })
                  ]
                })
              ]
            })
          ]
        }),
      v !== 'idle' &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsxs('section', {
              className: 'bg-white rounded-2xl border border-gray-200 p-5',
              children: [
                e.jsx('h2', {
                  className:
                    'text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4',
                  children: 'Logística'
                }),
                e.jsx('label', { className: 'field-label', children: 'Estado *' }),
                e.jsx('div', {
                  className: 'mb-5',
                  children: e.jsx(sa, {
                    items: At.map((m) => ({ value: m, label: m, color: De(m) })),
                    active: A,
                    onSelect: (m) => T({ estado: m })
                  })
                }),
                e.jsxs('button', {
                  type: 'button',
                  onClick: () => T({ urgente: !H }),
                  className: `w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-3.5 border-2 transition-all ${H ? 'bg-red-50 border-red-400 shadow-sm shadow-red-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`,
                  children: [
                    e.jsxs('span', {
                      className: 'flex items-center gap-2.5',
                      children: [
                        e.jsx('span', {
                          className: `text-xl transition-transform ${H ? 'scale-110' : 'opacity-40 grayscale'}`,
                          children: '🚨'
                        }),
                        e.jsxs('span', {
                          className: 'flex flex-col items-start',
                          children: [
                            e.jsx('span', {
                              className: `text-sm font-bold ${H ? 'text-red-600' : 'text-gray-700'}`,
                              children: 'NV Urgente'
                            }),
                            e.jsx('span', {
                              className: 'text-[11px] text-gray-400',
                              children: 'Se destaca en el panel TV'
                            })
                          ]
                        })
                      ]
                    }),
                    e.jsx('span', {
                      className: `relative w-12 h-6 rounded-full transition-colors shrink-0 ${H ? 'bg-red-500' : 'bg-gray-300'}`,
                      children: e.jsx('span', {
                        className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${H ? 'translate-x-6' : ''}`
                      })
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-3.5',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Tipo Despacho' }),
                        e.jsxs('select', {
                          value: D,
                          onChange: (m) => T({ tipoDespacho: m.target.value }),
                          className: 'field-input',
                          children: [
                            e.jsx('option', { value: '', children: '— Seleccionar —' }),
                            (
                              (a == null ? void 0 : a.tiposDespacho) || [
                                'Courier - Inyección',
                                'Directo',
                                'Courier (Retiro / Pick-up)'
                              ]
                            ).map((m) => e.jsx('option', { value: m, children: m }, m))
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Transportista' }),
                        t.length > 0
                          ? e.jsxs('select', {
                              value: _,
                              onChange: (m) => T({ transportista: m.target.value }),
                              className: 'field-input',
                              children: [
                                e.jsx('option', { value: '', children: '— Seleccionar —' }),
                                (_ && !t.includes(_) ? [_, ...t] : t).map((m) =>
                                  e.jsx('option', { value: m, children: m }, m)
                                )
                              ]
                            })
                          : e.jsx('input', {
                              type: 'text',
                              value: _,
                              onChange: (m) => T({ transportista: m.target.value }),
                              placeholder: 'Nombre transportista',
                              className: 'field-input'
                            })
                      ]
                    }),
                    v === 'update' &&
                      e.jsxs('div', {
                        children: [
                          e.jsxs('label', {
                            className: 'field-label',
                            children: [
                              'Fecha Compromiso ',
                              G.has('fechaCompromiso')
                                ? e.jsx('span', {
                                    className: 'ml-1 normal-case',
                                    style: { color: re },
                                    children: '(auto — 2 días hábiles)'
                                  })
                                : e.jsx('span', {
                                    className: 'ml-1 normal-case text-gray-400',
                                    children: '(auto)'
                                  })
                            ]
                          }),
                          e.jsx('input', {
                            type: 'date',
                            value: R,
                            readOnly: !0,
                            className: 'field-input bg-gray-50 text-gray-500 cursor-not-allowed'
                          })
                        ]
                      }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: 'field-label',
                          children: 'Fecha de Creación de N.V'
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: O,
                          readOnly: !0,
                          className: 'field-input bg-gray-50 text-gray-500 cursor-not-allowed'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: 'field-label',
                          children: 'Fecha Aprobación Real'
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: E,
                          onChange: (m) => T({ fechaAprobacionReal: m.target.value }),
                          className: 'field-input'
                        }),
                        e.jsx('p', {
                          className: 'mt-1 text-[10px] leading-tight text-gray-400',
                          children:
                            'Fecha en que realmente se aprobó la NV. Corrige el cálculo de Fecha Compromiso si hubo demora.'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsxs('label', {
                          className: 'field-label',
                          children: [
                            'Fecha Facturación ',
                            G.has('fechaFacturacion') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: re },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: V,
                          onChange: (m) => {
                            (T({ fechaFacturacion: m.target.value }), se('fechaFacturacion'));
                          },
                          className: 'field-input'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsxs('label', {
                          className: 'field-label',
                          children: [
                            'Fecha Despacho ',
                            G.has('fechaDespacho') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: re },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: P,
                          onChange: (m) => {
                            (T({ fechaDespacho: m.target.value }), se('fechaDespacho'));
                          },
                          className: 'field-input'
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            e.jsxs('details', {
              className: 'group bg-white rounded-2xl border border-gray-200 overflow-hidden',
              children: [
                e.jsxs('summary', {
                  className:
                    'flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none',
                  children: [
                    e.jsx('h2', {
                      className: 'text-[11px] font-semibold text-gray-400 uppercase tracking-wider',
                      children: 'Datos adicionales'
                    }),
                    e.jsx('span', {
                      className: 'text-gray-300 text-xs transition-transform group-open:rotate-180',
                      children: '▼'
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Facturas' }),
                        e.jsx('input', {
                          type: 'text',
                          value: Y,
                          onChange: (m) => T({ factura: m.target.value }),
                          className: 'field-input'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Guía' }),
                        e.jsx('input', {
                          type: 'text',
                          value: x,
                          onChange: (m) => T({ guia: m.target.value }),
                          className: 'field-input'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Bultos' }),
                        e.jsx('input', {
                          type: 'number',
                          inputMode: 'numeric',
                          value: I,
                          onChange: (m) => T({ bultos: m.target.value }),
                          className: 'field-input'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Valor Factura' }),
                        e.jsxs('div', {
                          className: 'relative',
                          children: [
                            e.jsx('span', {
                              className:
                                'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]',
                              children: '$'
                            }),
                            e.jsx('input', {
                              type: 'text',
                              inputMode: 'numeric',
                              value: W,
                              onChange: (m) =>
                                T({ valorFactura: m.target.value.replace(/[^0-9.]/g, '') }),
                              className: 'field-input pl-7'
                            })
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'N° de Envío' }),
                        e.jsx('input', {
                          type: 'text',
                          value: Q,
                          onChange: (m) => T({ numeroEnvio: m.target.value }),
                          className: 'field-input'
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            v === 'update' &&
              e.jsxs('section', {
                className: 'bg-white rounded-2xl border border-gray-200 p-5 anim-fade-up',
                children: [
                  e.jsxs('div', {
                    className: 'flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('h2', {
                            className:
                              'text-[11px] font-semibold text-gray-400 uppercase tracking-wider',
                            children: 'Reporte de errores / incidencias'
                          }),
                          e.jsx('p', {
                            className: 'mt-2 text-sm text-slate-500 max-w-3xl',
                            children:
                              'Reporta incidencias logísticas de la N.V. para alimentar el dashboard de errores por vendedor y detectar riesgo de cumplimiento sobre 48 horas.'
                          })
                        ]
                      }),
                      e.jsx('div', {
                        className:
                          'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 max-w-sm',
                        children:
                          'Se consolida junto con la operación y después aparece en el tablero operacional como incidencia activa.'
                      })
                    ]
                  }),
                  e.jsx('div', {
                    className: 'mt-4 flex flex-wrap gap-2',
                    children: ya.map((m) => {
                      const K = Z === m,
                        ie =
                          m === 'PROBLEMAS DE DIRECCIÓN'
                            ? xa
                            : m === 'PROBLEMAS DE TRANSPORTE'
                              ? ha
                              : Ne;
                      return e.jsxs(
                        'button',
                        {
                          type: 'button',
                          onClick: () =>
                            T({
                              incidencia: K ? '' : m,
                              estadoIncidencia: K ? 'ABIERTA' : p || 'ABIERTA'
                            }),
                          className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${K ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                          children: [e.jsx(ie, { size: 14 }), m]
                        },
                        m
                      );
                    })
                  }),
                  Z &&
                    e.jsxs('div', {
                      className: 'mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 anim-fade-up',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('label', {
                              className: 'field-label',
                              children: 'Estado incidencia'
                            }),
                            e.jsx('select', {
                              value: p,
                              onChange: (m) => T({ estadoIncidencia: m.target.value }),
                              className: 'field-input',
                              children: _a.map((m) => e.jsx('option', { value: m, children: m }, m))
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsx('label', {
                              className: 'field-label',
                              children: 'Tipo detectado'
                            }),
                            e.jsx('input', {
                              type: 'text',
                              value: Z,
                              readOnly: !0,
                              className: 'field-input bg-gray-50 text-gray-500 cursor-not-allowed'
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          className: 'md:col-span-2',
                          children: [
                            e.jsx('label', { className: 'field-label', children: 'Observaciones' }),
                            e.jsx('textarea', {
                              value: N,
                              onChange: (m) => T({ observacionesIncidencia: m.target.value }),
                              className: 'field-input min-h-[96px] resize-y',
                              placeholder:
                                'Ej: dirección incompleta, contacto sin respuesta, transportista reprogramado, rechazo por zona...'
                            })
                          ]
                        })
                      ]
                    })
                ]
              }),
            S.length > 0 &&
              e.jsx('div', {
                className: 'bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up',
                children: S.map((m, K) =>
                  e.jsxs(
                    'p',
                    {
                      className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                      children: [e.jsx('span', { children: '⚠' }), m]
                    },
                    K
                  )
                )
              }),
            q &&
              !q.success &&
              e.jsx('div', {
                className: 'bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up',
                children: e.jsxs('p', {
                  className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                  children: [e.jsx('span', { children: '⚠' }), q.message]
                })
              })
          ]
        })
    ]
  });
}
function Ot({ toast: a }) {
  if (!a) return null;
  const t = a.type === 'success';
  return e.jsx('div', {
    className: `fixed top-4 left-1/2 z-[80] w-[min(92vw,56rem)] -translate-x-1/2 rounded-2xl border-2 px-6 py-5 shadow-2xl anim-pop ${t ? 'border-emerald-200 bg-emerald-600 text-white' : 'border-red-200 bg-red-600 text-white'}`,
    children: e.jsxs('div', {
      className: 'flex items-start gap-3',
      children: [
        e.jsx('div', { className: 'text-2xl leading-none', children: t ? '✓' : '⚠' }),
        e.jsxs('div', {
          className: 'min-w-0',
          children: [
            e.jsx('div', {
              className: 'text-[11px] font-black uppercase tracking-[0.24em] opacity-90',
              children: t ? 'Operacion confirmada' : 'Alerta del panel'
            }),
            e.jsx('div', {
              className: 'mt-1 text-base sm:text-lg font-black uppercase leading-snug break-words',
              children: a.message
            })
          ]
        })
      ]
    })
  });
}
function Tt(a) {
  const t = a.nvs.map((r) => r.nv).join(' · '),
    s = a.fecha_comprometida ? ` · Compromiso ${a.fecha_comprometida}` : ' · sin fecha';
  return `${a.ticket} · NV ${t || '—'}${s}`;
}
function $e(a, t = {}) {
  return {
    ...{
      id: a.id,
      fecha_comprometida: a.fecha_comprometida || null,
      estado: a.estado,
      observacion: a.observacion || null,
      nvs: a.nvs.map((r) => ({ nv: r.nv, canal: r.canal, cliente: r.cliente }))
    },
    ...t
  };
}
function It({ operador: a }) {
  const [t, s] = b.useState([]),
    [r, n] = b.useState(!0),
    [l, i] = b.useState(''),
    [c, o] = b.useState(''),
    [h, u] = b.useState(!1),
    [d, g] = b.useState(''),
    [v, A] = b.useState(!1),
    [D, _] = b.useState([]),
    [R, O] = b.useState(''),
    [E, V] = b.useState(''),
    [P, Y] = b.useState(!1),
    x = b.useCallback(async () => {
      (n(!0), i(''));
      try {
        s(await wt());
      } catch (y) {
        i((y == null ? void 0 : y.message) || 'Error al cargar consolidados');
      } finally {
        n(!1);
      }
    }, []);
  b.useEffect(() => {
    x();
  }, [x]);
  const I = (y) => {
      (o(y), setTimeout(() => o(''), 3e3));
    },
    W = async () => {
      const y = d.trim();
      if (y) {
        if (D.some((j) => j.nv === y)) {
          I(`La NV ${y} ya está en la lista`);
          return;
        }
        A(!0);
        try {
          const j = await da(y);
          if (!j) {
            I(`NV ${y} no existe en la base`);
            return;
          }
          (_((w) => [...w, { nv: j.nv, canal: j.canal, cliente: j.cliente }]), g(''));
        } finally {
          A(!1);
        }
      }
    },
    Q = async () => {
      if (D.length === 0) {
        I('Agrega al menos una NV');
        return;
      }
      Y(!0);
      const y = await Ce({
        fecha_comprometida: R || null,
        observacion: E || null,
        created_by: a || null,
        nvs: D
      });
      if ((Y(!1), !y.ok)) {
        I(y.error || 'Error al crear');
        return;
      }
      (I(`✓ ${y.ticket || 'Consolidado'} creado`), _([]), O(''), V(''), u(!1), x());
    },
    H = async (y, j) => {
      const w = await Ce($e(y, { fecha_comprometida: j || null }));
      if (!w.ok) {
        I(w.error || 'Error');
        return;
      }
      s((k) => k.map((C) => (C.id === y.id ? { ...C, fecha_comprometida: j || null } : C)));
    },
    U = async (y) => {
      const j = y.estado === 'cerrado' ? 'abierto' : 'cerrado',
        w = await Ce($e(y, { estado: j }));
      if (!w.ok) {
        I(w.error || 'Error');
        return;
      }
      s((k) => k.map((C) => (C.id === y.id ? { ...C, estado: j } : C)));
    },
    ee = async (y) => {
      if (!confirm(`¿Eliminar ${y.ticket}? Las NVs volverán a medirse con las 48 hrs.`)) return;
      const j = await Ct(y.id);
      if (!j.ok) {
        I(j.error || 'Error');
        return;
      }
      (I(`${y.ticket} eliminado`), s((w) => w.filter((k) => k.id !== y.id)));
    },
    z = async (y, j) => {
      const w = y.nvs
          .filter((C) => C.id !== j)
          .map((C) => ({ nv: C.nv, canal: C.canal, cliente: C.cliente })),
        k = await Ce($e(y, { nvs: w }));
      if (!k.ok) {
        I(k.error || 'Error');
        return;
      }
      s((C) => C.map((F) => (F.id === y.id ? { ...F, nvs: F.nvs.filter((Z) => Z.id !== j) } : F)));
    },
    te = async (y, j, w) => {
      const k = j.trim();
      if (!k) return;
      const C = await da(k);
      if (!C) {
        I(`NV ${k} no existe`);
        return;
      }
      const F = [
          ...y.nvs.map((p) => ({ nv: p.nv, canal: p.canal, cliente: p.cliente })),
          { nv: C.nv, canal: C.canal, cliente: C.cliente }
        ],
        Z = await Ce($e(y, { nvs: F }));
      if (!Z.ok) {
        I(Z.error || 'Error');
        return;
      }
      (w(), x());
    };
  return e.jsxs('div', {
    className: 'anim-fade-up',
    children: [
      c &&
        e.jsx('div', {
          className:
            'fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] shadow-lg',
          children: c
        }),
      e.jsxs('div', {
        className: 'flex items-center justify-between mb-4',
        children: [
          e.jsxs('div', {
            children: [
              e.jsx('h2', {
                className: 'text-base font-bold text-gray-800',
                children: 'Consolidados'
              }),
              e.jsx('p', {
                className: 'text-[12px] text-gray-500',
                children:
                  'NVs con fecha de despacho manual (comercial). No se miden con las 48 hrs ni afectan los indicadores.'
              })
            ]
          }),
          !h &&
            e.jsx('button', {
              onClick: () => u(!0),
              className: 'px-3 py-2 rounded-lg text-white text-[13px] font-semibold',
              style: { background: re },
              children: '+ Nuevo consolidado'
            })
        ]
      }),
      h &&
        e.jsxs('div', {
          className: 'mb-5 rounded-xl border border-orange-200 bg-orange-50/40 p-4',
          children: [
            e.jsx('p', {
              className: 'text-[13px] font-semibold text-gray-800 mb-3',
              children: 'Nuevo consolidado'
            }),
            e.jsxs('div', {
              className: 'flex flex-wrap gap-2 mb-3',
              children: [
                e.jsx('input', {
                  value: d,
                  onChange: (y) => g(y.target.value),
                  onKeyDown: (y) => {
                    y.key === 'Enter' && (y.preventDefault(), W());
                  },
                  placeholder: 'N° NV (ej. 5646)',
                  className: 'inp flex-1 min-w-[160px]'
                }),
                e.jsx('button', {
                  onClick: W,
                  disabled: v,
                  className:
                    'px-3 py-2 rounded-lg bg-gray-800 text-white text-[13px] font-medium disabled:opacity-50',
                  children: v ? 'Validando…' : 'Agregar NV'
                })
              ]
            }),
            D.length > 0 &&
              e.jsx('div', {
                className: 'flex flex-wrap gap-1.5 mb-3',
                children: D.map((y) =>
                  e.jsxs(
                    'span',
                    {
                      className:
                        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-200 text-[12px]',
                      children: [
                        e.jsx('b', { children: y.nv }),
                        ' ',
                        e.jsx('span', {
                          className: 'text-gray-400',
                          children: y.cliente || y.canal
                        }),
                        e.jsx('button', {
                          onClick: () => _((j) => j.filter((w) => w.nv !== y.nv)),
                          className: 'text-gray-400 hover:text-red-600',
                          children: '×'
                        })
                      ]
                    },
                    y.nv
                  )
                )
              }),
            e.jsxs('div', {
              className: 'flex flex-wrap gap-3 items-end',
              children: [
                e.jsxs('label', {
                  className: 'flex flex-col gap-1',
                  children: [
                    e.jsx('span', {
                      className: 'text-[10px] uppercase tracking-wide text-gray-400 font-semibold',
                      children: 'Fecha comprometida'
                    }),
                    e.jsx('input', {
                      type: 'date',
                      value: R,
                      onChange: (y) => O(y.target.value),
                      className: 'inp'
                    })
                  ]
                }),
                e.jsxs('label', {
                  className: 'flex flex-col gap-1 flex-1 min-w-[180px]',
                  children: [
                    e.jsx('span', {
                      className: 'text-[10px] uppercase tracking-wide text-gray-400 font-semibold',
                      children: 'Observación (opcional)'
                    }),
                    e.jsx('input', {
                      value: E,
                      onChange: (y) => V(y.target.value),
                      className: 'inp',
                      placeholder: 'Nota…'
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex gap-2 mt-4',
              children: [
                e.jsx('button', {
                  onClick: Q,
                  disabled: P || D.length === 0,
                  className:
                    'px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-50',
                  style: { background: re },
                  children: P ? 'Creando…' : 'Crear consolidado'
                }),
                e.jsx('button', {
                  onClick: () => {
                    (u(!1), _([]), O(''), V(''), g(''));
                  },
                  className:
                    'px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-[13px]',
                  children: 'Cancelar'
                })
              ]
            })
          ]
        }),
      l && e.jsx('p', { className: 'text-[13px] text-red-600 mb-3', children: l }),
      r
        ? e.jsx('p', {
            className: 'text-[13px] text-gray-400 py-8 text-center',
            children: 'Cargando…'
          })
        : t.length === 0
          ? e.jsx('p', {
              className: 'text-[13px] text-gray-400 py-8 text-center',
              children: 'Aún no hay consolidados.'
            })
          : e.jsx('div', {
              className: 'space-y-3',
              children: t.map((y) =>
                e.jsx(
                  $t,
                  { c: y, onSetFecha: H, onToggle: U, onEliminar: ee, onQuitarNv: z, onAddNv: te },
                  y.id
                )
              )
            }),
      e.jsx('style', {
        children: `
        .inp { height: 2.25rem; padding: 0 0.55rem; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 0.5rem; outline: none; background: white; }
        .inp:focus { box-shadow: 0 0 0 2px #fed7aa; }
      `
      })
    ]
  });
}
function $t({ c: a, onSetFecha: t, onToggle: s, onEliminar: r, onQuitarNv: n, onAddNv: l }) {
  const [i, c] = b.useState(''),
    o = a.estado === 'cerrado';
  return e.jsxs('div', {
    className: `rounded-xl border p-4 ${o ? 'border-gray-200 bg-gray-50/60' : 'border-gray-200 bg-white'}`,
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between gap-2 flex-wrap mb-2',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsx('span', {
                className: 'px-2 py-0.5 rounded-lg text-white text-[12px] font-bold',
                style: { background: o ? '#6b7280' : re },
                children: a.ticket
              }),
              e.jsx('span', {
                className: `text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${o ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`,
                children: o ? 'Cerrado' : 'Abierto'
              }),
              a.created_by &&
                e.jsxs('span', {
                  className: 'text-[11px] text-gray-400',
                  children: ['por ', a.created_by]
                })
            ]
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsxs('label', {
                className: 'flex items-center gap-1 text-[11px] text-gray-500',
                children: [
                  'Compromiso:',
                  e.jsx('input', {
                    type: 'date',
                    defaultValue: a.fecha_comprometida || '',
                    onChange: (h) => t(a, h.target.value),
                    className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg'
                  })
                ]
              }),
              e.jsx('button', {
                onClick: () => s(a),
                className:
                  'text-[12px] px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50',
                children: o ? 'Reabrir' : 'Cerrar'
              }),
              e.jsx('button', {
                onClick: () => r(a),
                className:
                  'text-[12px] px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50',
                children: 'Eliminar'
              })
            ]
          })
        ]
      }),
      e.jsx('div', {
        className: 'flex flex-wrap gap-1.5 mb-2',
        children:
          a.nvs.length === 0
            ? e.jsx('span', { className: 'text-[12px] text-gray-400', children: 'Sin NVs' })
            : a.nvs.map((h) =>
                e.jsxs(
                  'span',
                  {
                    className:
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px]',
                    children: [
                      e.jsx('b', { children: h.nv }),
                      ' ',
                      e.jsx('span', { className: 'text-gray-400', children: h.cliente || h.canal }),
                      e.jsx('button', {
                        onClick: () => h.id && n(a, h.id),
                        className: 'text-gray-400 hover:text-red-600',
                        children: '×'
                      })
                    ]
                  },
                  h.id
                )
              )
      }),
      e.jsxs('div', {
        className: 'flex gap-2 items-center',
        children: [
          e.jsx('input', {
            value: i,
            onChange: (h) => c(h.target.value),
            onKeyDown: (h) => {
              h.key === 'Enter' && (h.preventDefault(), l(a, i, () => c('')));
            },
            placeholder: '+ Agregar NV',
            className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg flex-1 max-w-[200px]'
          }),
          e.jsx('button', {
            onClick: () => l(a, i, () => c('')),
            className: 'text-[12px] px-2 py-1 rounded-lg bg-gray-800 text-white',
            children: 'Agregar'
          })
        ]
      }),
      e.jsx('p', {
        className: 'mt-2 text-[11px] text-gray-400 font-mono select-all',
        children: Tt(a)
      })
    ]
  });
}
const be = (a) => (a ? String(a).slice(0, 10) : ''),
  Vt = ['Entregado', 'En Proceso', 'Shipping', 'Currier', 'En Ruta'],
  ma = 60,
  Pt = 80;
function Ft(a, t) {
  const s = new Date(a);
  let r = 0;
  const n = s.getDay();
  for (n === 0 ? s.setDate(s.getDate() + 1) : n === 6 && s.setDate(s.getDate() + 2); r < t;) {
    s.setDate(s.getDate() + 1);
    const l = s.getDay();
    l !== 0 && l !== 6 && r++;
  }
  return s;
}
function Mt(a, t) {
  const s = t || a;
  if (!s) return '';
  const r = new Date(s + 'T12:00:00');
  if (isNaN(r.getTime())) return '';
  const n = Ft(r, 2);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}
const Be = [
  { label: 'Registrada', dateKey: 'fecha_registro_nv' },
  { label: 'Aprobada', dateKey: 'fecha_aprobacion' },
  { label: 'En Proceso', dateKey: 'fecha_en_proceso' },
  { label: 'Shipping', dateKey: 'fecha_shipping' },
  { label: 'Despachada', dateKey: 'fecha_despacho' },
  { label: 'En Ruta', dateKey: 'fecha_en_ruta' },
  { label: 'Entregada', dateKey: 'fecha_entregado' }
];
function qt(a, t) {
  if (!a || !t) return null;
  const s = new Date(a).getTime(),
    r = new Date(t).getTime();
  if (isNaN(s) || isNaN(r)) return null;
  const n = Math.round((r - s) / 864e5);
  return n >= 0 ? n : null;
}
function Lt({ data: a }) {
  const t = Be.map((r) => be(a[r.dateKey]));
  let s = -1;
  for (let r = t.length - 1; r >= 0; r--)
    if (t[r]) {
      s = r;
      break;
    }
  return e.jsx('div', {
    className: 'flex flex-col gap-0',
    children: Be.map((r, n) => {
      const l = t[n],
        i = !!l,
        c = n === s,
        o = n > 0 ? t[n - 1] : '',
        h = n > 0 && l && o ? qt(o, l) : null,
        u = h !== null && h > 3;
      return e.jsxs(
        'div',
        {
          className: 'flex items-start gap-3',
          style: { minHeight: 44 },
          children: [
            e.jsxs('div', {
              className: 'flex flex-col items-center w-5 shrink-0',
              children: [
                n > 0 &&
                  e.jsx('div', {
                    className: 'w-0.5 h-3',
                    style: { background: i ? (u ? '#ef4444' : '#22c55e') : '#e5e7eb' }
                  }),
                n === 0 && e.jsx('div', { className: 'h-1' }),
                e.jsx('div', {
                  className: `rounded-full shrink-0 flex items-center justify-center transition-all ${c ? 'w-5 h-5 ring-4 ring-orange-100' : i ? 'w-4 h-4' : 'w-3.5 h-3.5 border-2 border-gray-300'}`,
                  style: { background: c ? '#f57c00' : i ? '#22c55e' : 'transparent' },
                  children:
                    i &&
                    e.jsx('svg', {
                      className: 'w-2.5 h-2.5 text-white',
                      fill: 'none',
                      viewBox: '0 0 24 24',
                      stroke: 'currentColor',
                      strokeWidth: 3,
                      children: e.jsx('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        d: 'M5 13l4 4L19 7'
                      })
                    })
                }),
                n < Be.length - 1 &&
                  e.jsx('div', {
                    className: 'w-0.5 flex-1 min-h-[8px]',
                    style: { background: i && t[n + 1] ? '#22c55e' : '#e5e7eb' }
                  })
              ]
            }),
            e.jsxs('div', {
              className: 'flex-1 min-w-0 pb-1 pt-0.5',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx('span', {
                      className: `text-[12px] font-semibold ${c ? 'text-orange-600' : i ? 'text-gray-800' : 'text-gray-400'}`,
                      children: r.label
                    }),
                    h !== null &&
                      e.jsxs('span', {
                        className: `text-[10px] font-bold px-1.5 py-0.5 rounded-full ${u ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`,
                        children: [h, 'd']
                      })
                  ]
                }),
                l &&
                  e.jsx('span', { className: 'text-[11px] text-gray-400 font-medium', children: l })
              ]
            })
          ]
        },
        r.label
      );
    })
  });
}
function Bt({
  item: a,
  puedeEscribir: t,
  puedeEliminar: s,
  puedeAprobarReapertura: r,
  opts: n,
  onClose: l,
  onSaved: i,
  onDeleted: c
}) {
  const [o, h] = b.useState(null),
    [u, d] = b.useState(!0),
    [g, v] = b.useState({}),
    [A, D] = b.useState(!1),
    [_, R] = b.useState(!1),
    [O, E] = b.useState(!1),
    [V, P] = b.useState(null),
    [Y, x] = b.useState([]),
    [I, W] = b.useState(!1),
    [Q, H] = b.useState(''),
    [U, ee] = b.useState(''),
    [z, te] = b.useState(!1),
    [y, j] = b.useState(!1),
    w = b.useMemo(
      () => ({
        id: (a == null ? void 0 : a.id) ?? null,
        canal: (a == null ? void 0 : a.canal) || '',
        nv: (a == null ? void 0 : a.nv) || '',
        cliente: (a == null ? void 0 : a.cliente) || '',
        vendedor: (a == null ? void 0 : a.vendedor) || '',
        ccosto: '',
        division: '',
        estado: (a == null ? void 0 : a.estado) || '',
        transportista: (a == null ? void 0 : a.transportista) || '',
        tipo_despacho: '',
        fecha_aprobacion: (a == null ? void 0 : a.fechaAprobacion) || '',
        fecha_aprobacion_real: (a == null ? void 0 : a.fechaAprobacionReal) || '',
        fecha_compromiso: (a == null ? void 0 : a.fechaCompromiso) || '',
        fecha_facturacion: (a != null && a.factura, ''),
        fecha_despacho: '',
        fecha_estado: '',
        fecha_registro_nv: '',
        fecha_en_proceso: '',
        fecha_shipping: '',
        fecha_en_ruta: '',
        fecha_entregado: '',
        factura: (a == null ? void 0 : a.factura) || '',
        guia: (a == null ? void 0 : a.guia) || '',
        bultos: '',
        valor_factura: '',
        numero_envio: '',
        urgente: (a == null ? void 0 : a.urgente) === !0,
        incidencia: '',
        estado_incidencia: '',
        observaciones_incidencia: '',
        reabierta: (a == null ? void 0 : a.reabierta) === !0,
        fecha_reapertura: '',
        motivo_reapertura: (a == null ? void 0 : a.motivoReapertura) || ''
      }),
      [a]
    );
  b.useEffect(() => {
    let f = !0;
    return (
      h(w),
      d(!1),
      mt(a.id, { canal: a.canal, nv: a.nv }).then(($) => {
        f && (h($.found ? $.data : null), v({}), d(!1));
      }),
      () => {
        f = !1;
      }
    );
  }, [a, w]);
  const k = b.useCallback(async () => {
    if (!(a != null && a.id)) return (x([]), []);
    W(!0);
    try {
      const f = await ka(a.id);
      return (x(f), f);
    } catch {
      return (x([]), []);
    } finally {
      W(!1);
    }
  }, [a == null ? void 0 : a.id]);
  b.useEffect(() => {
    k();
  }, [k]);
  const C = (f) => (f in g ? g[f] : ((o == null ? void 0 : o[f]) ?? '' ?? '')),
    F = (f, $) => {
      v((M) => {
        const B = { ...M, [f]: $ };
        return (
          f === 'fecha_aprobacion_real' &&
            (B.fecha_compromiso = Mt(be(o == null ? void 0 : o.fecha_aprobacion), $)),
          B
        );
      });
    },
    Z = b.useMemo(() => {
      const f = {};
      return (
        Object.keys(g).forEach(($) => {
          const M = (o == null ? void 0 : o[$]) ?? '';
          String(g[$] ?? '') !== String(M ?? '') && (f[$] = g[$]);
        }),
        f
      );
    }, [g, o]),
    p = {
      estado: 'estado',
      urgente: 'urgente',
      transportista: 'transportista',
      tipo_despacho: 'tipoDespacho',
      fecha_compromiso: 'fechaCompromiso',
      fecha_aprobacion_real: 'fechaAprobacionReal',
      fecha_facturacion: 'fechaFacturacion',
      fecha_despacho: 'fechaDespacho',
      factura: 'factura',
      guia: 'guia',
      bultos: 'bultos',
      valor_factura: 'valorFactura',
      numero_envio: 'numeroEnvio',
      estado_incidencia: 'estadoIncidencia',
      observaciones_incidencia: 'observacionesIncidencia'
    },
    N = async () => {
      (D(!0), P(null));
      const f = { id: a.id };
      Object.entries(Z).forEach(([M, B]) => {
        f[p[M] || M] = M === 'urgente' ? String(B) === 'true' : B;
      });
      const $ = await Ra(f);
      (D(!1),
        $.ok
          ? (P({ success: !0, message: 'Cambios guardados' }),
            i == null ||
              i({
                ...a,
                estado: C('estado') || a.estado,
                transportista: C('transportista'),
                urgente: String(C('urgente')) === 'true'
              }),
            setTimeout(l, 700))
          : P({ success: !1, message: $.message || $.error || 'No se pudo guardar' }));
    },
    S = async () => {
      R(!0);
      const f = await _t(a.id);
      (R(!1),
        f.ok
          ? (Ve.success(`NV ${a.nv} eliminada`), c == null || c(a), l())
          : (P({ success: !1, message: f.error || 'No se pudo eliminar' }), E(!1)));
    },
    q = (n == null ? void 0 : n.transportistas) || [],
    G = String(C('urgente')) === 'true',
    T = Fe.includes(C('estado')) || !!C('incidencia'),
    X = Y.find((f) => f.estado === 'PENDIENTE') || null,
    se = (o == null ? void 0 : o.estado) === 'Entregado',
    le = async () => {
      const f = String(Q || '').trim();
      if (!f) {
        P({ success: !1, message: 'Debes indicar el motivo de la reapertura.' });
        return;
      }
      te(!0);
      const $ = await Da(a.id, f);
      (te(!1),
        $.ok
          ? (H(''),
            await k(),
            P({ success: !0, message: $.message || 'Solicitud de reapertura enviada.' }))
          : P({
              success: !1,
              message: $.message || $.error || 'No se pudo solicitar la reapertura.'
            }));
    },
    ne = async (f) => {
      if (!(X != null && X.id)) return;
      j(!0);
      const $ = await yt(X.id, f, U);
      if ((j(!1), !$.ok)) {
        P({ success: !1, message: $.message || $.error || 'No se pudo resolver la solicitud.' });
        return;
      }
      const M = await Oe(a.canal, a.nv);
      (M.found &&
        (h(M.data),
        v({}),
        i == null ||
          i({
            ...a,
            estado: M.data.estado || a.estado,
            transportista: M.data.transportista || a.transportista,
            urgente: String(M.data.urgente) === 'true' || M.data.urgente === !0,
            reabierta: M.data.reabierta === !0,
            motivoReapertura: M.data.motivo_reapertura || ''
          })),
        ee(''),
        await k(),
        P({ success: !0, message: $.message || 'Solicitud resuelta correctamente.' }));
    };
  return Ye.createPortal(
    e.jsxs('div', {
      className: 'panel-portal fixed inset-0 z-[120] flex justify-end',
      onClick: l,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (f) => f.stopPropagation(),
          className:
            'relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl anim-fade-up',
          children: [
            e.jsxs('div', {
              className:
                'shrink-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsxs('span', {
                          className: 'text-[16px] font-bold text-gray-900',
                          children: ['NV ', a.nv]
                        }),
                        e.jsx('span', {
                          className:
                            'text-[10px] font-medium text-gray-400 uppercase tracking-wide',
                          children: a.canal
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center gap-1.5 mt-1',
                      children: [
                        e.jsx('span', {
                          className: 'w-2 h-2 rounded-full',
                          style: { background: De(a.estado) }
                        }),
                        e.jsx('span', {
                          className: 'text-[12px] text-gray-500',
                          children: a.estado
                        })
                      ]
                    })
                  ]
                }),
                e.jsx('button', {
                  onClick: l,
                  className:
                    'w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 text-lg',
                  children: '✕'
                })
              ]
            }),
            e.jsx('div', {
              className: 'flex-1 overflow-y-auto min-h-0',
              children:
                !o && u
                  ? e.jsxs('div', {
                      className: 'py-20 text-center',
                      children: [
                        e.jsx('span', {
                          className:
                            'inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin'
                        }),
                        e.jsx('p', {
                          className: 'text-sm text-gray-400 mt-3',
                          children: 'Cargando datos…'
                        })
                      ]
                    })
                  : o
                    ? e.jsxs('div', {
                        className: 'p-5 space-y-5',
                        children: [
                          e.jsxs('section', {
                            children: [
                              e.jsx('h3', {
                                className:
                                  'text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2',
                                children: 'Información'
                              }),
                              e.jsx('div', {
                                className: 'grid grid-cols-2 gap-2',
                                children: [
                                  { l: 'Cliente', v: o.cliente },
                                  { l: 'Vendedor', v: o.vendedor },
                                  { l: 'C. Costo', v: o.ccosto || o.centro_costo },
                                  { l: 'División', v: o.division }
                                ]
                                  .filter((f) => f.v)
                                  .map((f) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className: 'bg-gray-50 rounded-lg px-3 py-2',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[9px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5',
                                            children: f.l
                                          }),
                                          e.jsx('div', {
                                            className:
                                              'text-[13px] text-gray-800 font-medium truncate',
                                            title: f.v || '',
                                            children: f.v
                                          })
                                        ]
                                      },
                                      f.l
                                    )
                                  )
                              })
                            ]
                          }),
                          e.jsxs('section', {
                            children: [
                              e.jsx('h3', {
                                className:
                                  'text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2',
                                children: 'Progreso'
                              }),
                              e.jsx('div', {
                                className: 'bg-gray-50 rounded-xl p-3',
                                children: e.jsx(Lt, { data: o })
                              })
                            ]
                          }),
                          (o == null ? void 0 : o.reabierta) &&
                            e.jsx('section', {
                              className:
                                'rounded-xl border border-orange-200 bg-orange-50/80 px-4 py-3',
                              children: e.jsxs('div', {
                                className: 'flex items-start gap-3',
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'mt-0.5 h-9 w-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center',
                                    children: e.jsx(fa, { size: 16 })
                                  }),
                                  e.jsxs('div', {
                                    className: 'min-w-0',
                                    children: [
                                      e.jsx('div', {
                                        className:
                                          'text-[11px] font-black uppercase tracking-[0.16em] text-orange-700',
                                        children: 'N.V. reabierta'
                                      }),
                                      e.jsx('div', {
                                        className: 'mt-1 text-sm font-semibold text-slate-800',
                                        children: o.motivo_reapertura || 'Sin motivo informado.'
                                      }),
                                      o.fecha_reapertura &&
                                        e.jsxs('div', {
                                          className: 'mt-1 text-xs text-slate-500',
                                          children: ['Aprobada el ', be(o.fecha_reapertura)]
                                        })
                                    ]
                                  })
                                ]
                              })
                            }),
                          se
                            ? e.jsxs(e.Fragment, {
                                children: [
                                  e.jsx('section', {
                                    className:
                                      'rounded-xl border border-red-200 bg-red-50/80 px-4 py-4',
                                    children: e.jsxs('div', {
                                      className: 'flex items-start gap-3',
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'mt-0.5 h-10 w-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center',
                                          children: e.jsx(ga, { size: 18 })
                                        }),
                                        e.jsxs('div', {
                                          className: 'min-w-0',
                                          children: [
                                            e.jsx('div', {
                                              className:
                                                'text-[11px] font-black uppercase tracking-[0.16em] text-red-700',
                                              children: 'N.V. entregada bloqueada'
                                            }),
                                            e.jsx('div', {
                                              className: 'mt-1 text-sm text-slate-700',
                                              children:
                                                'Esta N.V. no puede editarse directo para no alterar el cumplimiento OTIF/SLA. Cualquier cambio debe pasar por una solicitud de reapertura aprobada por otro rol.'
                                            })
                                          ]
                                        })
                                      ]
                                    })
                                  }),
                                  e.jsxs('section', {
                                    children: [
                                      e.jsx('h3', {
                                        className:
                                          'text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2',
                                        children: 'Solicitud de reapertura'
                                      }),
                                      I
                                        ? e.jsx('div', {
                                            className:
                                              'rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500',
                                            children: 'Cargando solicitudes...'
                                          })
                                        : X
                                          ? e.jsxs('div', {
                                              className: 'space-y-3',
                                              children: [
                                                e.jsx('div', {
                                                  className:
                                                    'rounded-xl border border-amber-200 bg-amber-50 px-4 py-3',
                                                  children: e.jsxs('div', {
                                                    className: 'flex items-start gap-3',
                                                    children: [
                                                      e.jsx('div', {
                                                        className:
                                                          'mt-0.5 h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center',
                                                        children: e.jsx(Ze, { size: 16 })
                                                      }),
                                                      e.jsxs('div', {
                                                        className: 'min-w-0',
                                                        children: [
                                                          e.jsx('div', {
                                                            className:
                                                              'text-[11px] font-black uppercase tracking-[0.16em] text-amber-700',
                                                            children: 'Solicitud pendiente'
                                                          }),
                                                          e.jsx('div', {
                                                            className:
                                                              'mt-1 text-sm font-semibold text-slate-800',
                                                            children: X.motivo
                                                          }),
                                                          e.jsxs('div', {
                                                            className:
                                                              'mt-1 text-xs text-slate-500',
                                                            children: [
                                                              'Solicitada por',
                                                              ' ',
                                                              X.solicitada_por_nombre || 'Usuario',
                                                              ' el',
                                                              ' ',
                                                              be(X.solicitada_at)
                                                            ]
                                                          })
                                                        ]
                                                      })
                                                    ]
                                                  })
                                                }),
                                                r &&
                                                  e.jsxs('div', {
                                                    className:
                                                      'rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-4 space-y-3',
                                                    children: [
                                                      e.jsx('div', {
                                                        className:
                                                          'text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700',
                                                        children: 'Aprobación de reapertura'
                                                      }),
                                                      e.jsx('textarea', {
                                                        value: U,
                                                        onChange: (f) => ee(f.target.value),
                                                        className:
                                                          'field-input min-h-[84px] resize-y',
                                                        placeholder:
                                                          'Observación de aprobación o rechazo...'
                                                      }),
                                                      e.jsxs('div', {
                                                        className: 'grid grid-cols-2 gap-2',
                                                        children: [
                                                          e.jsx('button', {
                                                            type: 'button',
                                                            onClick: () => ne(!0),
                                                            disabled: y,
                                                            className:
                                                              'rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50',
                                                            children: y
                                                              ? 'Procesando...'
                                                              : 'Aprobar y reabrir'
                                                          }),
                                                          e.jsx('button', {
                                                            type: 'button',
                                                            onClick: () => ne(!1),
                                                            disabled: y,
                                                            className:
                                                              'rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 disabled:opacity-50',
                                                            children: y
                                                              ? 'Procesando...'
                                                              : 'Rechazar'
                                                          })
                                                        ]
                                                      })
                                                    ]
                                                  })
                                              ]
                                            })
                                          : t
                                            ? e.jsxs('div', {
                                                className: 'space-y-3',
                                                children: [
                                                  e.jsx('textarea', {
                                                    value: Q,
                                                    onChange: (f) => H(f.target.value),
                                                    className: 'field-input min-h-[96px] resize-y',
                                                    placeholder:
                                                      'Motivo obligatorio de reapertura: por qué se necesita devolver esta N.V. a En Proceso...'
                                                  }),
                                                  e.jsx('button', {
                                                    type: 'button',
                                                    onClick: le,
                                                    disabled: z,
                                                    className:
                                                      'w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50',
                                                    children: z
                                                      ? 'Enviando solicitud...'
                                                      : 'Solicitar reapertura'
                                                  })
                                                ]
                                              })
                                            : e.jsx('div', {
                                                className:
                                                  'rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500',
                                                children:
                                                  'Solo un usuario con permisos de gestión puede solicitar la reapertura.'
                                              })
                                    ]
                                  })
                                ]
                              })
                            : t
                              ? e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsxs('section', {
                                      children: [
                                        e.jsx('h3', {
                                          className:
                                            'text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2',
                                          children: 'Estado y Logística'
                                        }),
                                        e.jsx('label', {
                                          className: 'field-label',
                                          children: 'Estado'
                                        }),
                                        e.jsx('div', {
                                          className: 'mb-3',
                                          children: e.jsx(sa, {
                                            items: wa.map((f) => ({
                                              value: f,
                                              label: f,
                                              color: De(f)
                                            })),
                                            active: C('estado'),
                                            onSelect: (f) => F('estado', f)
                                          })
                                        }),
                                        e.jsxs('div', {
                                          className: 'grid grid-cols-2 gap-3',
                                          children: [
                                            e.jsxs('div', {
                                              children: [
                                                e.jsx('label', {
                                                  className: 'field-label',
                                                  children: 'Tipo Despacho'
                                                }),
                                                e.jsxs('select', {
                                                  value: C('tipo_despacho'),
                                                  onChange: (f) =>
                                                    F('tipo_despacho', f.target.value),
                                                  className: 'field-input',
                                                  children: [
                                                    e.jsx('option', { value: '', children: '—' }),
                                                    (
                                                      (n == null ? void 0 : n.tiposDespacho) || Ca
                                                    ).map((f) =>
                                                      e.jsx('option', { value: f, children: f }, f)
                                                    )
                                                  ]
                                                })
                                              ]
                                            }),
                                            e.jsxs('div', {
                                              children: [
                                                e.jsx('label', {
                                                  className: 'field-label',
                                                  children: 'Transportista'
                                                }),
                                                q.length > 0
                                                  ? e.jsxs('select', {
                                                      value: C('transportista'),
                                                      onChange: (f) =>
                                                        F('transportista', f.target.value),
                                                      className: 'field-input',
                                                      children: [
                                                        e.jsx('option', {
                                                          value: '',
                                                          children: '—'
                                                        }),
                                                        (C('transportista') &&
                                                        !q.includes(C('transportista'))
                                                          ? [C('transportista'), ...q]
                                                          : q
                                                        ).map((f) =>
                                                          e.jsx(
                                                            'option',
                                                            { value: f, children: f },
                                                            f
                                                          )
                                                        )
                                                      ]
                                                    })
                                                  : e.jsx('input', {
                                                      type: 'text',
                                                      value: C('transportista'),
                                                      onChange: (f) =>
                                                        F('transportista', f.target.value),
                                                      className: 'field-input'
                                                    })
                                              ]
                                            })
                                          ]
                                        }),
                                        e.jsxs('div', {
                                          className: 'flex items-center justify-between mt-3 px-1',
                                          children: [
                                            e.jsxs('div', {
                                              className: 'flex items-center gap-2',
                                              children: [
                                                e.jsx('span', {
                                                  className: 'text-red-500 text-sm',
                                                  children: '🚨'
                                                }),
                                                e.jsx('span', {
                                                  className:
                                                    'text-[13px] font-medium text-gray-700',
                                                  children: 'Marcar como Urgente'
                                                })
                                              ]
                                            }),
                                            e.jsx('button', {
                                              type: 'button',
                                              onClick: () => F('urgente', G ? 'false' : 'true'),
                                              className: `relative w-11 h-6 rounded-full transition-colors ${G ? 'bg-red-500' : 'bg-gray-200'}`,
                                              children: e.jsx('span', {
                                                className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${G ? 'translate-x-5' : ''}`
                                              })
                                            })
                                          ]
                                        })
                                      ]
                                    }),
                                    e.jsxs('section', {
                                      children: [
                                        e.jsx('h3', {
                                          className:
                                            'text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2',
                                          children: 'Fechas'
                                        }),
                                        e.jsxs('div', {
                                          className: 'grid grid-cols-2 gap-3',
                                          children: [
                                            e.jsxs('div', {
                                              children: [
                                                e.jsxs('label', {
                                                  className: 'field-label',
                                                  children: [
                                                    'F. Aprobación Real',
                                                    ' ',
                                                    e.jsx('span', {
                                                      className:
                                                        'normal-case font-semibold text-gray-400',
                                                      children: '(no editable)'
                                                    })
                                                  ]
                                                }),
                                                e.jsx('input', {
                                                  type: 'date',
                                                  value: C('fecha_aprobacion_real'),
                                                  readOnly: !0,
                                                  className:
                                                    'field-input bg-gray-50 text-gray-500 cursor-not-allowed'
                                                })
                                              ]
                                            }),
                                            e.jsxs('div', {
                                              children: [
                                                e.jsxs('label', {
                                                  className: 'field-label',
                                                  children: [
                                                    'F. Compromiso',
                                                    ' ',
                                                    e.jsx('span', {
                                                      className: 'normal-case font-semibold',
                                                      style: {
                                                        color: C('fecha_compromiso')
                                                          ? re
                                                          : '#9ca3af'
                                                      },
                                                      children: '(auto)'
                                                    })
                                                  ]
                                                }),
                                                e.jsx('input', {
                                                  type: 'date',
                                                  value: C('fecha_compromiso'),
                                                  readOnly: !0,
                                                  className:
                                                    'field-input bg-gray-50 text-gray-500 cursor-not-allowed'
                                                })
                                              ]
                                            }),
                                            e.jsxs('div', {
                                              children: [
                                                e.jsx('label', {
                                                  className: 'field-label',
                                                  children: 'F. Facturación'
                                                }),
                                                e.jsx('input', {
                                                  type: 'date',
                                                  value: C('fecha_facturacion'),
                                                  onChange: (f) =>
                                                    F('fecha_facturacion', f.target.value),
                                                  className: 'field-input'
                                                })
                                              ]
                                            }),
                                            e.jsxs('div', {
                                              children: [
                                                e.jsx('label', {
                                                  className: 'field-label',
                                                  children: 'F. Despacho'
                                                }),
                                                e.jsx('input', {
                                                  type: 'date',
                                                  value: C('fecha_despacho'),
                                                  onChange: (f) =>
                                                    F('fecha_despacho', f.target.value),
                                                  className: 'field-input'
                                                })
                                              ]
                                            })
                                          ]
                                        })
                                      ]
                                    }),
                                    e.jsxs('section', {
                                      children: [
                                        e.jsx('h3', {
                                          className:
                                            'text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2',
                                          children: 'Documentos'
                                        }),
                                        e.jsxs('div', {
                                          className: 'grid grid-cols-2 gap-3',
                                          children: [
                                            e.jsxs('div', {
                                              children: [
                                                e.jsx('label', {
                                                  className: 'field-label',
                                                  children: 'Factura'
                                                }),
                                                e.jsx('input', {
                                                  type: 'text',
                                                  value: C('factura'),
                                                  onChange: (f) => F('factura', f.target.value),
                                                  className: 'field-input'
                                                })
                                              ]
                                            }),
                                            e.jsxs('div', {
                                              children: [
                                                e.jsx('label', {
                                                  className: 'field-label',
                                                  children: 'Guía'
                                                }),
                                                e.jsx('input', {
                                                  type: 'text',
                                                  value: C('guia'),
                                                  onChange: (f) => F('guia', f.target.value),
                                                  className: 'field-input'
                                                })
                                              ]
                                            }),
                                            e.jsxs('div', {
                                              children: [
                                                e.jsx('label', {
                                                  className: 'field-label',
                                                  children: 'N° Envío'
                                                }),
                                                e.jsx('input', {
                                                  type: 'text',
                                                  value: C('numero_envio'),
                                                  onChange: (f) =>
                                                    F('numero_envio', f.target.value),
                                                  className: 'field-input'
                                                })
                                              ]
                                            }),
                                            e.jsxs('div', {
                                              children: [
                                                e.jsx('label', {
                                                  className: 'field-label',
                                                  children: 'Bultos'
                                                }),
                                                e.jsx('input', {
                                                  type: 'number',
                                                  value: C('bultos'),
                                                  onChange: (f) => F('bultos', f.target.value),
                                                  className: 'field-input'
                                                })
                                              ]
                                            }),
                                            e.jsxs('div', {
                                              children: [
                                                e.jsx('label', {
                                                  className: 'field-label',
                                                  children: 'Valor Factura'
                                                }),
                                                e.jsxs('div', {
                                                  className: 'relative',
                                                  children: [
                                                    e.jsx('span', {
                                                      className:
                                                        'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]',
                                                      children: '$'
                                                    }),
                                                    e.jsx('input', {
                                                      type: 'text',
                                                      inputMode: 'numeric',
                                                      value: C('valor_factura'),
                                                      onChange: (f) =>
                                                        F(
                                                          'valor_factura',
                                                          f.target.value.replace(/[^0-9.]/g, '')
                                                        ),
                                                      className: 'field-input pl-7'
                                                    })
                                                  ]
                                                })
                                              ]
                                            })
                                          ]
                                        })
                                      ]
                                    }),
                                    T &&
                                      e.jsxs('section', {
                                        children: [
                                          e.jsx('h3', {
                                            className:
                                              'text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2',
                                            children: 'Reporte de errores / incidencias'
                                          }),
                                          e.jsx('div', {
                                            className:
                                              'rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-500 mb-3',
                                            children:
                                              'Declara incidencias logísticas para esta N.V. mientras esté en proceso operativo y aliméntalas al dashboard por vendedor.'
                                          }),
                                          e.jsx('div', {
                                            className: 'flex flex-wrap gap-2',
                                            children: ya.map((f) => {
                                              const $ = C('incidencia') === f,
                                                M =
                                                  f === 'PROBLEMAS DE DIRECCIÓN'
                                                    ? xa
                                                    : f === 'PROBLEMAS DE TRANSPORTE'
                                                      ? ha
                                                      : Ne;
                                              return e.jsxs(
                                                'button',
                                                {
                                                  type: 'button',
                                                  onClick: () => {
                                                    const B = !$;
                                                    (F('incidencia', B ? f : ''),
                                                      F(
                                                        'estado_incidencia',
                                                        (B && C('estado_incidencia')) || 'ABIERTA'
                                                      ),
                                                      B || F('observaciones_incidencia', ''));
                                                  },
                                                  className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${$ ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                                                  children: [e.jsx(M, { size: 14 }), f]
                                                },
                                                f
                                              );
                                            })
                                          }),
                                          C('incidencia') &&
                                            e.jsxs('div', {
                                              className: 'mt-3 grid grid-cols-1 gap-3',
                                              children: [
                                                e.jsxs('div', {
                                                  children: [
                                                    e.jsx('label', {
                                                      className: 'field-label',
                                                      children: 'Estado incidencia'
                                                    }),
                                                    e.jsx('select', {
                                                      value: C('estado_incidencia') || 'ABIERTA',
                                                      onChange: (f) =>
                                                        F('estado_incidencia', f.target.value),
                                                      className: 'field-input',
                                                      children: _a.map((f) =>
                                                        e.jsx(
                                                          'option',
                                                          { value: f, children: f },
                                                          f
                                                        )
                                                      )
                                                    })
                                                  ]
                                                }),
                                                e.jsxs('div', {
                                                  children: [
                                                    e.jsx('label', {
                                                      className: 'field-label',
                                                      children: 'Observaciones'
                                                    }),
                                                    e.jsx('textarea', {
                                                      value: C('observaciones_incidencia'),
                                                      onChange: (f) =>
                                                        F(
                                                          'observaciones_incidencia',
                                                          f.target.value
                                                        ),
                                                      className:
                                                        'field-input min-h-[88px] resize-y',
                                                      placeholder:
                                                        'Ej: dirección incompleta, rechazo de zona, problema con transportista, contacto no responde...'
                                                    })
                                                  ]
                                                })
                                              ]
                                            })
                                        ]
                                      })
                                  ]
                                })
                              : e.jsxs('div', {
                                  className:
                                    'text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3',
                                  children: [
                                    'Solo lectura · necesitas el permiso ',
                                    e.jsx('b', { children: 'manage_panel' }),
                                    ' para editar.'
                                  ]
                                }),
                          V &&
                            e.jsxs('div', {
                              className: `rounded-xl px-3.5 py-3 text-[13px] ${V.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`,
                              children: [V.success ? '✓ ' : '⚠ ', V.message]
                            })
                        ]
                      })
                    : e.jsx('div', {
                        className: 'py-20 text-center text-sm text-gray-400',
                        children: 'No se pudieron cargar los datos de esta NV.'
                      })
            }),
            o &&
              ((t && !se) || s) &&
              e.jsxs('div', {
                className: 'shrink-0 bg-white border-t border-gray-200 p-4 space-y-2',
                children: [
                  t &&
                    !se &&
                    Object.keys(Z).length > 0 &&
                    e.jsx('button', {
                      onClick: N,
                      disabled: A,
                      className:
                        'w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60',
                      style: { background: re },
                      children: A
                        ? e.jsxs('span', {
                            className: 'inline-flex items-center gap-2',
                            children: [
                              e.jsx('span', {
                                className:
                                  'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                              }),
                              'Guardando…'
                            ]
                          })
                        : `Guardar ${Object.keys(Z).length} cambio${Object.keys(Z).length !== 1 ? 's' : ''}`
                    }),
                  s &&
                    (O
                      ? e.jsxs('div', {
                          className: 'bg-red-50 border border-red-200 rounded-xl p-4 space-y-3',
                          children: [
                            e.jsxs('p', {
                              className: 'text-sm text-red-700 font-medium',
                              children: [
                                '¿Estás seguro de eliminar la NV ',
                                e.jsx('strong', { children: a.nv }),
                                '?'
                              ]
                            }),
                            e.jsx('p', {
                              className: 'text-xs text-red-500',
                              children: 'Esta acción no se puede deshacer.'
                            }),
                            e.jsxs('div', {
                              className: 'flex gap-2',
                              children: [
                                e.jsx('button', {
                                  onClick: () => E(!1),
                                  className:
                                    'flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50',
                                  children: 'Cancelar'
                                }),
                                e.jsx('button', {
                                  onClick: S,
                                  disabled: _,
                                  className:
                                    'flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60',
                                  children: _ ? 'Eliminando…' : 'Sí, eliminar'
                                })
                              ]
                            })
                          ]
                        })
                      : e.jsx('button', {
                          onClick: () => E(!0),
                          className:
                            'w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors',
                          children: 'Eliminar NV'
                        }))
                ]
              })
          ]
        })
      ]
    }),
    document.body
  );
}
const zt = b.memo(function ({ i: t, onOpen: s }) {
  return e.jsxs('div', {
    onClick: () => s(t),
    className: `w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border bg-white hover:border-gray-300 text-left transition-all cursor-pointer ${t.urgente ? 'border-red-200' : 'border-gray-200'}`,
    children: [
      e.jsxs('span', {
        className: 'min-w-0 flex-1',
        children: [
          e.jsxs('span', {
            className: 'flex items-center gap-2',
            children: [
              e.jsxs('span', {
                className: 'text-[14px] font-semibold text-gray-900',
                children: ['NV ', t.nv]
              }),
              e.jsx('span', {
                className: 'text-[10px] font-medium text-gray-400 uppercase tracking-wide',
                children: t.canal
              }),
              t.urgente && e.jsx('span', { className: 'text-[11px]', children: '🚨' })
            ]
          }),
          e.jsxs('span', {
            className: 'block text-[12px] text-gray-500 truncate mt-0.5',
            children: [t.cliente || '—', t.vendedor ? ` · ${t.vendedor}` : '']
          }),
          (t.guia || t.factura) &&
            e.jsxs('span', {
              className: 'block text-[11px] text-gray-400 truncate mt-0.5',
              children: [
                t.guia ? `Guía: ${t.guia}` : '',
                t.guia && t.factura ? ' · ' : '',
                t.factura ? `Fact: ${t.factura}` : ''
              ]
            }),
          (t.fechaAprobacion || t.fechaAprobacionReal) &&
            e.jsxs('span', {
              className: 'block text-[11px] text-gray-400 truncate mt-0.5',
              children: [
                t.fechaAprobacion ? `Aprob: ${t.fechaAprobacion}` : '',
                t.fechaAprobacion && t.fechaAprobacionReal ? ' · ' : '',
                t.fechaAprobacionReal ? `Real: ${t.fechaAprobacionReal}` : ''
              ]
            })
        ]
      }),
      e.jsx('span', {
        className: 'flex flex-col items-end gap-1 shrink-0',
        children: e.jsxs('span', {
          className:
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-gray-50 border border-gray-100',
          children: [
            e.jsx('span', {
              className: 'w-1.5 h-1.5 rounded-full',
              style: { background: De(t.estado) }
            }),
            e.jsx('span', { className: 'text-gray-600', children: t.estado })
          ]
        })
      }),
      e.jsx('svg', {
        className: 'w-4 h-4 text-gray-300 shrink-0',
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        strokeWidth: 2,
        children: e.jsx('path', { strokeLinecap: 'round', d: 'm9 5 7 7-7 7' })
      })
    ]
  });
});
function Ut({ puedeEscribir: a, puedeEliminar: t, puedeAprobarReapertura: s }) {
  const [r, n] = b.useState([]),
    [l, i] = b.useState(!0),
    [c, o] = b.useState('Todos'),
    [h, u] = b.useState(''),
    [d, g] = b.useState(null),
    [v, A] = b.useState([]),
    [D, _] = b.useState(!1),
    [R, O] = b.useState(null),
    [E, V] = b.useState(null),
    [P, Y] = b.useState(!1),
    [x, I] = b.useState(ma),
    W = b.useRef(null),
    Q = b.useRef(0),
    H = b.useCallback((j = !1) => {
      (i(!0),
        it({ force: j, full: !1, limit: 400 })
          .then((w) => {
            (n(w), i(!1));
          })
          .catch(() => {
            (n([]), i(!1));
          }));
    }, []);
  b.useEffect(() => {
    H();
  }, [H]);
  const U = h.trim().length >= 2;
  (b.useEffect(() => {
    const j = h.trim();
    if (j.length < 2) {
      A([]);
      return;
    }
    A(dt(r, j, { limit: 120 }));
  }, [h, r]),
    b.useEffect(() => {
      const j = h.trim();
      if (j.length < 2) {
        (g(null), _(!1));
        return;
      }
      _(!0);
      const w = Q.current + 1;
      Q.current = w;
      const k = new AbortController(),
        C = setTimeout(() => {
          ct(j, { limit: 120, signal: k.signal })
            .then((F) => {
              Q.current === w && g(F);
            })
            .catch(() => {
              Q.current === w && g([]);
            })
            .finally(() => {
              Q.current === w && _(!1);
            });
        }, 450);
      return () => {
        (clearTimeout(C), k.abort());
      };
    }, [h]));
  const ee = b.useCallback(async () => {
      Y(!0);
      try {
        const j = await vt();
        if (!j.length) {
          Ve.warning('No hay operaciones para exportar.');
          return;
        }
        (Ba({ filename: 'Operaciones_NV', sheets: [{ name: 'Notas de Venta', rows: j }] }),
          Ve.success(`Exportadas ${j.length} N.V. a Excel`));
      } catch (j) {
        Ve.error('No se pudo exportar: ' + ((j == null ? void 0 : j.message) || 'error'));
      } finally {
        Y(!1);
      }
    }, []),
    z = b.useMemo(
      () =>
        U ? ut(v, d || [], h, { limit: 160 }) : r.filter((j) => c === 'Todos' || j.estado === c),
      [U, v, d, h, r, c]
    ),
    te = b.useMemo(() => z.slice(0, x), [z, x]),
    y = b.useMemo(() => {
      const j = {};
      return (
        r.forEach((w) => {
          j[w.estado] = (j[w.estado] || 0) + 1;
        }),
        j
      );
    }, [r]);
  return (
    b.useEffect(() => {
      I((j) => {
        const w = Math.min(z.length, ma);
        return j === w && j <= z.length ? j : w;
      });
    }, [U, c, h, z.length]),
    b.useEffect(() => {
      !R ||
        E ||
        Ea()
          .then(V)
          .catch(() => {});
    }, [R, E]),
    b.useEffect(() => {
      if (x >= z.length) return;
      const j = W.current;
      if (!j) return;
      const w = new IntersectionObserver(
        (k) => {
          k.some((C) => C.isIntersecting) && I((C) => Math.min(C + Pt, z.length));
        },
        { root: null, rootMargin: '240px 0px', threshold: 0 }
      );
      return (w.observe(j), () => w.disconnect());
    }, [x, z.length]),
    e.jsxs('div', {
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          className: 'relative',
          children: [
            e.jsx(Qe, {
              size: 16,
              className: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            }),
            e.jsx('input', {
              value: h,
              onChange: (j) => u(j.target.value),
              placeholder: 'Buscar por NV, cliente, guía o factura (cualquier estado)…',
              className:
                'w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none bg-white'
            }),
            D &&
              e.jsx(Ee, {
                size: 16,
                className: 'absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin'
              })
          ]
        }),
        !U &&
          (() => {
            const j = Fe.filter((w) => (y[w] || 0) > 0).map((w) => ({
              value: w,
              label: w,
              color: De(w),
              count: y[w] || 0
            }));
            return j.length === 0
              ? null
              : e.jsx(sa, {
                  items: j,
                  active: c,
                  inline: !0,
                  onSelect: (w) => o(c === w ? 'Todos' : w)
                });
          })(),
        e.jsxs('div', {
          className: 'flex items-center justify-between gap-2 flex-wrap',
          children: [
            e.jsx('span', {
              className: 'text-[12px] text-gray-400',
              children: U
                ? `${te.length} de ${z.length} resultado${z.length !== 1 ? 's' : ''} · búsqueda en todos los estados`
                : `${te.length} de ${z.length} activas visibles · total activas ${r.length}`
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsxs('button', {
                  onClick: ee,
                  disabled: P,
                  className:
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition-colors',
                  title: 'Descargar TODAS las N.V. (todas las columnas) a Excel',
                  children: [
                    P
                      ? e.jsx(Ee, { size: 14, className: 'animate-spin' })
                      : e.jsx(Fa, { size: 14 }),
                    P ? 'Exportando…' : 'Exportar Excel'
                  ]
                }),
                e.jsx('button', {
                  onClick: () => H(!0),
                  className:
                    'inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-orange-600 font-medium',
                  children: '↻ Recargar'
                })
              ]
            })
          ]
        }),
        (l && !U) || (D && !d)
          ? e.jsx('div', {
              className: 'py-16 flex justify-center',
              children: e.jsx(Ee, { className: 'animate-spin text-orange-500', size: 30 })
            })
          : z.length === 0
            ? e.jsx('div', {
                className: 'text-center py-16 text-gray-400 text-sm',
                children: U
                  ? 'Sin N.V. que coincidan con la búsqueda.'
                  : 'Sin N.V. activas para este filtro.'
              })
            : e.jsxs('div', {
                className: 'space-y-2',
                children: [
                  te.map((j) => e.jsx(zt, { i: j, onOpen: O }, j.key)),
                  x < z.length &&
                    e.jsx('div', {
                      ref: W,
                      className: 'flex items-center justify-center py-4',
                      children: e.jsxs('div', {
                        className:
                          'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-500 shadow-sm',
                        children: [
                          e.jsx(Ee, { size: 14, className: 'animate-spin text-orange-500' }),
                          'Cargando más N.V...'
                        ]
                      })
                    })
                ]
              }),
        R &&
          e.jsx(Bt, {
            item: R,
            puedeEscribir: a,
            puedeEliminar: t,
            puedeAprobarReapertura: s,
            opts: E,
            onClose: () => O(null),
            onSaved: (j) => {
              (n((w) => w.map((k) => (k.key === j.key ? { ...k, ...j } : k))),
                g((w) => w && w.map((k) => (k.key === j.key ? { ...k, ...j } : k))));
            },
            onDeleted: (j) => {
              (n((w) => w.filter((k) => k.key !== j.key)),
                g((w) => w && w.filter((k) => k.key !== j.key)));
            }
          })
      ]
    })
  );
}
function Gt({ canal: a, nv: t, onClose: s }) {
  var l;
  const r = Oa(),
    n = (((l = He.find((i) => i.value === a)) == null ? void 0 : l.label) || a || '').toUpperCase();
  return Ye.createPortal(
    e.jsxs('div', {
      className: 'fixed inset-0 z-[60] flex items-center justify-center p-4',
      onClick: s,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (i) => i.stopPropagation(),
          className:
            'relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden anim-fade-up',
          children: [
            e.jsxs('div', {
              className: 'px-6 pt-6 pb-5 text-center',
              children: [
                e.jsx('div', {
                  className:
                    'w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-4',
                  children: e.jsx(Ne, { size: 26 })
                }),
                e.jsx('h3', {
                  className: 'text-[16px] font-black text-gray-900',
                  children: 'Cliente no encontrado'
                }),
                e.jsxs('p', {
                  className: 'mt-2 text-[13px] text-gray-500 leading-relaxed',
                  children: [
                    'La N.V. ',
                    e.jsx('strong', { className: 'text-gray-700', children: t }),
                    ' del canal',
                    ' ',
                    e.jsx('strong', { className: 'text-gray-700', children: n }),
                    ' no está en el catálogo, por lo que no se pueden traer sus datos de cliente/vendedor/centro de costo.'
                  ]
                }),
                e.jsx('p', {
                  className: 'mt-3 text-[13px] font-semibold text-gray-700 leading-relaxed',
                  children: 'Realiza la actualización de la carga de N.V. para poder continuar.'
                })
              ]
            }),
            e.jsxs('div', {
              className: 'px-5 pb-5 flex flex-col gap-2',
              children: [
                e.jsxs('button', {
                  onClick: () => r('/inbound/data-import'),
                  className:
                    'w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform',
                  style: { background: re },
                  children: [e.jsx(qa, { size: 16 }), ' Ir a Carga Masiva']
                }),
                e.jsx('button', {
                  onClick: s,
                  className:
                    'w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50',
                  children: 'Cerrar'
                })
              ]
            })
          ]
        })
      ]
    }),
    document.body
  );
}
function Kt({
  item: a,
  puedeEscribir: t,
  puedeAprobarReapertura: s,
  motivo: r,
  onMotivoChange: n,
  onRequestReopen: l,
  requesting: i,
  onClose: c
}) {
  if (!a) return null;
  const o = a.estado === 'Entregado',
    h = o
      ? 'ALERTA CRITICA: N.V. ENTREGADA Y BLOQUEADA'
      : 'ALERTA CRITICA: N.V. DUPLICADA DETECTADA';
  return e.jsx(Ua, {
    titulo: o ? 'N.V. entregada detectada' : 'N.V. ya registrada',
    onClose: c,
    fullscreen: !0,
    children: e.jsx('div', {
      className:
        'flex min-h-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-5 sm:px-8 sm:py-8',
      children: e.jsxs('div', {
        className: 'mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-6',
        children: [
          e.jsxs('div', {
            className: `rounded-[2rem] border-2 px-5 py-6 sm:px-8 sm:py-8 shadow-2xl ${o ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`,
            children: [
              e.jsx('div', {
                className: `mb-5 rounded-2xl border px-4 py-4 sm:px-6 ${o ? 'border-red-200 bg-red-100 text-red-800' : 'border-amber-200 bg-amber-100 text-amber-800'}`,
                children: e.jsx('div', {
                  className:
                    'text-lg sm:text-3xl font-black uppercase tracking-[0.18em] leading-tight text-center',
                  children: h
                })
              }),
              e.jsxs('div', {
                className: 'flex flex-col gap-5 sm:flex-row sm:items-start',
                children: [
                  e.jsx('div', {
                    className: `mt-0.5 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl ${o ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`,
                    children: o ? e.jsx(ga, { size: 34 }) : e.jsx(Ne, { size: 34 })
                  }),
                  e.jsxs('div', {
                    className: 'min-w-0 flex-1',
                    children: [
                      e.jsxs('div', {
                        className:
                          'text-2xl sm:text-5xl font-black uppercase leading-tight text-slate-900',
                        children: ['N.V. ', a.nv, ' YA EXISTE EN EL SISTEMA']
                      }),
                      e.jsxs('div', {
                        className:
                          'mt-4 text-base sm:text-2xl font-black uppercase text-slate-700 leading-relaxed',
                        children: [
                          'Estado actual: ',
                          e.jsx('span', { className: 'text-slate-900', children: a.estado }),
                          '.',
                          o
                            ? ' QUEDA BLOQUEADA PARA NO ALTERAR OTIF Y SLA UNA VEZ ENTREGADA.'
                            : ' EL FORMULARIO YA QUEDO EN MODO ACTUALIZACION PARA EVITAR GENERAR UN DUPLICADO.'
                        ]
                      }),
                      a.reabierta &&
                        e.jsxs('div', {
                          className:
                            'mt-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-orange-700',
                          children: [e.jsx(fa, { size: 14 }), 'N.V. reabierta']
                        })
                    ]
                  })
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'grid gap-4 lg:grid-cols-2',
            children: [
              a.motivo_reapertura &&
                e.jsxs('div', {
                  className: 'rounded-3xl border border-orange-200 bg-white px-5 py-4 shadow-xl',
                  children: [
                    e.jsx('div', {
                      className:
                        'text-[11px] font-black uppercase tracking-[0.16em] text-orange-700',
                      children: 'Motivo de reapertura'
                    }),
                    e.jsx('div', {
                      className: 'mt-2 text-sm sm:text-base text-slate-700',
                      children: a.motivo_reapertura
                    })
                  ]
                }),
              a.pendingRequest &&
                e.jsxs('div', {
                  className: 'rounded-3xl border border-amber-200 bg-white px-5 py-4 shadow-xl',
                  children: [
                    e.jsx('div', {
                      className:
                        'text-[11px] font-black uppercase tracking-[0.16em] text-amber-700',
                      children: 'Solicitud pendiente'
                    }),
                    e.jsx('div', {
                      className: 'mt-2 text-sm sm:text-base font-semibold text-slate-800',
                      children: a.pendingRequest.motivo
                    }),
                    e.jsxs('div', {
                      className: 'mt-2 text-xs sm:text-sm text-slate-500',
                      children: [
                        'Solicitada por ',
                        a.pendingRequest.solicitada_por_nombre || 'Usuario',
                        ' el',
                        ' ',
                        be(a.pendingRequest.solicitada_at)
                      ]
                    })
                  ]
                })
            ]
          }),
          o &&
            t &&
            !a.pendingRequest &&
            e.jsxs('div', {
              className:
                'rounded-[2rem] border border-slate-200 bg-white px-5 py-5 shadow-2xl sm:px-8 sm:py-6',
              children: [
                e.jsxs('div', {
                  className:
                    'flex items-center gap-3 text-base sm:text-xl font-black uppercase text-slate-800',
                  children: [
                    e.jsx(Ze, { size: 20, className: 'text-orange-600' }),
                    'Solicitar reapertura'
                  ]
                }),
                e.jsx('textarea', {
                  value: r,
                  onChange: (u) => n(u.target.value),
                  className: 'field-input mt-4 min-h-[160px] resize-y',
                  placeholder:
                    'Observación obligatoria: explica por qué se necesita reabrir esta N.V. entregada...'
                }),
                e.jsx('button', {
                  type: 'button',
                  onClick: l,
                  disabled: i,
                  className:
                    'mt-4 w-full rounded-2xl bg-orange-500 px-4 py-4 text-base font-black uppercase tracking-[0.12em] text-white disabled:opacity-50',
                  children: i ? 'Enviando solicitud...' : 'Enviar solicitud de reapertura'
                })
              ]
            }),
          !t &&
            o &&
            !s &&
            e.jsx('div', {
              className:
                'rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm sm:text-base text-slate-500 shadow-xl',
              children: 'Necesitas permisos de gestión para solicitar la reapertura de esta N.V.'
            }),
          e.jsx('div', {
            className: 'flex justify-center pt-2',
            children: e.jsx('button', {
              onClick: c,
              className:
                'min-w-[14rem] rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm sm:text-base font-black uppercase tracking-[0.12em] text-white backdrop-blur hover:bg-white/20',
              children: 'Cerrar alerta'
            })
          })
        ]
      })
    })
  });
}
function Wt({ puedeEscribir: a, puedeAprobarReapertura: t }) {
  var C, F, Z;
  const s = fe(),
    [r, n] = b.useState(null),
    [l, i] = b.useState(null),
    [c, o] = b.useState([]),
    [h, u] = b.useState(null),
    [d, g] = b.useState(null),
    [v, A] = b.useState(''),
    [D, _] = b.useState(!1),
    [R, O] = b.useState([]),
    [E, V] = b.useState(null),
    [P, Y] = b.useState(null);
  (b.useEffect(() => {
    Ea()
      .then(n)
      .catch(() => {});
  }, []),
    b.useEffect(() => {
      La()
        .then(o)
        .catch(() => o([]));
    }, []),
    b.useEffect(() => {
      if (!l) return;
      const p = setTimeout(() => i(null), 3e3);
      return () => clearTimeout(p);
    }, [l]));
  const x = (C = s.lookupResult) != null && C.found ? s.lookupResult : null,
    I = ((F = x == null ? void 0 : x.data) == null ? void 0 : F.estado) === 'Entregado',
    W = R.find((p) => p.estado === 'PENDIENTE') || null,
    Q = b.useMemo(
      () =>
        s.mode !== 'update' || !(x != null && x.data)
          ? !1
          : String(s.estado || '') !== String(x.data.estado || '') ||
            !!s.urgente != !!x.data.urgente ||
            String(s.fechaFacturacion || '') !== String(be(x.data.fecha_facturacion) || '') ||
            String(s.fechaDespacho || '') !== String(be(x.data.fecha_despacho) || ''),
      [
        s.mode,
        s.estado,
        s.urgente,
        s.fechaFacturacion,
        s.fechaDespacho,
        x == null ? void 0 : x.data
      ]
    ),
    H =
      s.mode === 'update' &&
      (E == null ? void 0 : E.permitida) === !1 &&
      (P == null ? void 0 : P.permitida) === !0 &&
      Q;
  b.useEffect(() => {
    var N;
    let p = !1;
    if (!(x != null && x.row) || !a) {
      (V(null), Y(null));
      return;
    }
    return (
      Promise.all([
        Nt(x.row),
        jt(
          x.row,
          s.estado || ((N = x == null ? void 0 : x.data) == null ? void 0 : N.estado) || null
        )
      ])
        .then(([S, q]) => {
          p || (V(S), Y(q));
        })
        .catch(() => {
          p ||
            (V({ permitida: !1, message: 'No se pudo validar el acceso IAM para esta N.V.' }),
            Y({ permitida: !1, message: 'No se pudo validar la transición de estado.' }));
        }),
      () => {
        p = !0;
      }
    );
  }, [
    x == null ? void 0 : x.row,
    (Z = x == null ? void 0 : x.data) == null ? void 0 : Z.estado,
    a,
    s.estado
  ]);
  const U = b.useCallback(async (p) => {
      if (!p) return (O([]), []);
      try {
        const N = await ka(p);
        return (O(N), N);
      } catch {
        return (O([]), []);
      }
    }, []),
    ee = b.useCallback(
      (p, N = R) => {
        if (!p) return;
        const S = N.find((q) => q.estado === 'PENDIENTE') || null;
        g({ ...p, pendingRequest: S });
      },
      [R]
    ),
    z = b.useCallback(
      async (p) => {
        var S, q, G;
        (s.patch({ lookupResult: { found: !0, row: p.row, data: p.data } }), s.applyFound(p.data));
        const N = s.canal === 'ptm' && ia((S = p.data) == null ? void 0 : S.cliente);
        (s.patch({
          orangeAssociationRequired: N,
          orangeAssociationError: '',
          orangeAssociationData: null,
          orangeAssociationNv: ((q = p.data) == null ? void 0 : q.nv_orange) || ''
        }),
          N && (G = p.data) != null && G.nv_orange && (await y(p.data.nv_orange)));
      },
      [s]
    );
  b.useEffect(() => {
    if (!(x != null && x.row)) {
      O([]);
      return;
    }
    U(x.row);
  }, [x == null ? void 0 : x.row, U]);
  const te = b.useCallback(() => {
      var S, q;
      const p = fe.getState(),
        N =
          (S = p.lookupResult) != null && S.found
            ? p.lookupResult.data
            : (q = p.lookupResult) == null
              ? void 0
              : q.autoFill;
      return {
        vendedor: (N == null ? void 0 : N.vendedor) || '',
        ccosto: (N == null ? void 0 : N.ccosto) || (N == null ? void 0 : N.centro_costo) || '',
        centro_costo:
          (N == null ? void 0 : N.centro_costo) || (N == null ? void 0 : N.ccosto) || '',
        division: (N == null ? void 0 : N.division) || ''
      };
    }, []),
    y = b.useCallback(
      async (p) => {
        const N = String(p || '').trim();
        if (!N)
          return (
            s.patch({
              orangeAssociationNv: '',
              orangeAssociationData: null,
              orangeAssociationLoading: !1,
              orangeAssociationError: ''
            }),
            null
          );
        s.patch({
          orangeAssociationNv: N,
          orangeAssociationLoading: !0,
          orangeAssociationError: ''
        });
        try {
          const S = await xt(N, te());
          return S
            ? (s.patch({
                orangeAssociationData: S,
                orangeAssociationLoading: !1,
                orangeAssociationError: ''
              }),
              S)
            : (s.patch({
                orangeAssociationData: null,
                orangeAssociationLoading: !1,
                orangeAssociationError: 'No encontramos esa N.V. en el catálogo Orange.'
              }),
              null);
        } catch {
          return (
            s.patch({
              orangeAssociationData: null,
              orangeAssociationLoading: !1,
              orangeAssociationError: 'No se pudo validar la N.V. Orange asociada.'
            }),
            null
          );
        }
      },
      [te, s]
    ),
    j = async () => {
      var S, q, G, T, X, se, le;
      const p = String(s.nv || '').trim();
      if (!p) return;
      s.patch({ lookupLoading: !0, submitResult: null, errors: [] });
      const N = await Oe(s.canal, p);
      if (N.found) {
        await z(N);
        const ne = ((S = N.data) == null ? void 0 : S.estado) === 'Entregado' ? await U(N.row) : [];
        Vt.includes((q = N.data) == null ? void 0 : q.estado) &&
          ee(
            {
              id: N.row,
              canal: s.canal,
              nv: p,
              estado: (G = N.data) == null ? void 0 : G.estado,
              reabierta: ((T = N.data) == null ? void 0 : T.reabierta) === !0,
              motivo_reapertura: ((X = N.data) == null ? void 0 : X.motivo_reapertura) || ''
            },
            ne
          );
      } else if (s.canal !== 'varios' && !((se = N.autoFill) != null && se.cliente)) {
        (s.patch({
          lookupLoading: !1,
          lookupResult: null,
          mode: 'idle',
          orangeAssociationRequired: !1,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        }),
          u({ canal: s.canal, nv: p }));
        return;
      } else {
        (g(null),
          O([]),
          s.patch({ lookupResult: { found: !1, autoFill: N.autoFill } }),
          s.applyNew(N.autoFill || {}));
        const ne = s.canal === 'ptm' && ia((le = N.autoFill) == null ? void 0 : le.cliente);
        s.patch({
          orangeAssociationRequired: ne,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        });
      }
      s.patch({ lookupLoading: !1 });
    },
    w = async () => {
      const p = (x == null ? void 0 : x.row) || (d == null ? void 0 : d.id),
        N = String(v || '').trim();
      if (!p) return;
      if (!N) {
        s.patch({
          submitResult: { success: !1, message: 'Debes indicar el motivo de la reapertura.' }
        });
        return;
      }
      _(!0);
      const S = await Da(p, N);
      if ((_(!1), !S.ok)) {
        const G = S.message || S.error || 'No se pudo solicitar la reapertura.';
        (s.patch({ submitResult: { success: !1, message: G } }), i({ type: 'error', message: G }));
        return;
      }
      const q = await U(p);
      (A(''),
        x != null &&
          x.data &&
          ee(
            {
              id: x.row,
              canal: s.canal,
              nv: s.nv,
              estado: x.data.estado,
              reabierta: x.data.reabierta === !0,
              motivo_reapertura: x.data.motivo_reapertura || ''
            },
            q
          ),
        s.patch({
          submitResult: { success: !0, message: S.message || 'Solicitud de reapertura enviada.' }
        }),
        i({ type: 'success', message: S.message || 'Solicitud de reapertura enviada.' }));
    },
    k = async () => {
      var X, se, le, ne, f, $, M;
      const p = fe.getState();
      if (p.mode === 'idle') return;
      if (!p.estado) {
        p.patch({ submitResult: { success: !1, message: 'Falta el Estado' } });
        return;
      }
      if (
        p.mode === 'update' &&
        x != null &&
        x.row &&
        (E == null ? void 0 : E.permitida) === !1 &&
        !H
      ) {
        (p.patch({
          submitResult: {
            success: !1,
            message: E.message || 'No tienes permisos IAM para editar esta N.V.'
          }
        }),
          i({
            type: 'error',
            message: E.message || 'No tienes permisos IAM para editar esta N.V.'
          }));
        return;
      }
      if (
        (X = p.lookupResult) != null &&
        X.found &&
        ((le = (se = p.lookupResult) == null ? void 0 : se.data) == null ? void 0 : le.estado) ===
          'Entregado'
      ) {
        const B = await U(p.lookupResult.row);
        (ee(
          {
            id: p.lookupResult.row,
            canal: p.canal,
            nv: p.nv,
            estado: p.lookupResult.data.estado,
            reabierta: p.lookupResult.data.reabierta === !0,
            motivo_reapertura: p.lookupResult.data.motivo_reapertura || ''
          },
          B
        ),
          p.patch({
            submitResult: {
              success: !1,
              message:
                'La N.V. está entregada y bloqueada. Solicita reapertura para volver a gestionarla.'
            }
          }));
        return;
      }
      if (p.orangeAssociationRequired && (!p.orangeAssociationNv || !p.orangeAssociationData)) {
        p.patch({
          submitResult: {
            success: !1,
            message: 'Debes asociar una N.V. Orange válida para este cliente PTM.'
          }
        });
        return;
      }
      p.patch({ submitting: !0, submitResult: null });
      const N =
          (ne = p.lookupResult) != null && ne.found
            ? p.lookupResult.data
            : (f = p.lookupResult) == null
              ? void 0
              : f.autoFill,
        S = p.orangeAssociationData,
        q = {
          id: p.mode === 'update' ? (($ = p.lookupResult) == null ? void 0 : $.row) : null,
          mode: p.mode,
          canal: p.canal,
          nv: p.nv,
          cliente: (S == null ? void 0 : S.cliente) || (N == null ? void 0 : N.cliente) || '',
          vendedor: (S == null ? void 0 : S.vendedor) || (N == null ? void 0 : N.vendedor) || '',
          division: (S == null ? void 0 : S.division) || (N == null ? void 0 : N.division) || '',
          centro_costo:
            (S == null ? void 0 : S.ccosto) ||
            (N == null ? void 0 : N.ccosto) ||
            (N == null ? void 0 : N.centro_costo) ||
            '',
          nvOrangeAsociada: p.orangeAssociationRequired
            ? p.orangeAssociationNv
            : (N == null ? void 0 : N.nv_orange) || '',
          estado: p.estado,
          urgente: p.urgente,
          tipoDespacho: p.tipoDespacho,
          transportista: p.transportista,
          fechaCompromiso: p.fechaCompromiso,
          fechaAprobacion: p.fechaAprobacion,
          fechaAprobacionReal: p.fechaAprobacionReal,
          fechaFacturacion: p.fechaFacturacion,
          fechaDespacho: p.fechaDespacho,
          factura: p.factura,
          guia: p.guia,
          bultos: p.bultos,
          valorFactura: p.valorFactura,
          numeroEnvio: p.numeroEnvio,
          incidencia: p.incidencia,
          estadoIncidencia: p.incidencia ? p.estadoIncidencia || 'ABIERTA' : '',
          observacionesIncidencia: p.observacionesIncidencia,
          variosTipo: p.variosTipo,
          variosCliente: p.variosCliente,
          variosVendedor: p.variosVendedor,
          variosDivision: p.variosDivision,
          variosCcosto: p.variosCcosto
        },
        G = await Ra(q);
      if ((fe.getState().patch({ submitting: !1 }), G.ok)) {
        (g(null),
          O([]),
          i({
            type: 'success',
            message: `NV ${q.nv} ${q.mode === 'update' ? 'actualizada' : 'creada'}`
          }),
          fe.getState().reset());
        return;
      }
      let T = G.message || G.error || 'No se pudo guardar';
      if (G.duplicate || G.locked) {
        const B = await Oe(p.canal, p.nv);
        if (B.found) {
          await z(B);
          const qe =
            ((M = B.data) == null ? void 0 : M.estado) === 'Entregado' ? await U(B.row) : [];
          ee(
            {
              id: B.row,
              canal: p.canal,
              nv: p.nv,
              estado: B.data.estado,
              reabierta: B.data.reabierta === !0,
              motivo_reapertura: B.data.motivo_reapertura || ''
            },
            qe
          );
        }
      }
      (fe.getState().patch({ submitResult: { success: !1, message: T } }),
        i({ type: 'error', message: T }));
    };
  return e.jsxs('div', {
    className: 'pb-24',
    children: [
      e.jsx(Dt, {
        options: r,
        transportistasOpts: (r == null ? void 0 : r.transportistas) || [],
        vendedoresMaestro: c,
        onLookup: j,
        onLookupOrange: y,
        canRequestReopen: a,
        onOpenReopen: () => {
          var p, N, S;
          return ee({
            id: x == null ? void 0 : x.row,
            canal: s.canal,
            nv: s.nv,
            estado: (p = x == null ? void 0 : x.data) == null ? void 0 : p.estado,
            reabierta: ((N = x == null ? void 0 : x.data) == null ? void 0 : N.reabierta) === !0,
            motivo_reapertura:
              ((S = x == null ? void 0 : x.data) == null ? void 0 : S.motivo_reapertura) || ''
          });
        },
        latestReopenRequest: W
      }),
      h && e.jsx(Gt, { canal: h.canal, nv: h.nv, onClose: () => u(null) }),
      d &&
        e.jsx(Kt, {
          item: d,
          puedeEscribir: a,
          puedeAprobarReapertura: t,
          motivo: v,
          onMotivoChange: A,
          onRequestReopen: w,
          requesting: D,
          onClose: () => g(null)
        }),
      s.mode !== 'idle' &&
        e.jsx('div', {
          className:
            'fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3',
          children: e.jsxs('div', {
            className:
              'max-w-2xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
            children: [
              e.jsxs('span', {
                className: 'text-xs text-slate-400',
                children: [
                  'Canal ',
                  e.jsx('b', { className: 'text-slate-600 uppercase', children: s.canal }),
                  ' · N°',
                  ' ',
                  e.jsx('b', { className: 'text-slate-600', children: s.nv || '—' })
                ]
              }),
              e.jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  s.mode === 'update' &&
                    (E == null ? void 0 : E.permitida) === !1 &&
                    !H &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold',
                      children: E.message || 'Sin acceso IAM para editar esta N.V.'
                    }),
                  s.mode === 'update' &&
                    (E == null ? void 0 : E.permitida) === !1 &&
                    H &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold',
                      children:
                        (P == null ? void 0 : P.message) ||
                        'Tienes permiso para cambiar estado, pero no para editar otros campos de esta N.V.'
                    }),
                  I &&
                    a &&
                    e.jsxs('button', {
                      onClick: () => {
                        var p, N, S;
                        return ee({
                          id: x == null ? void 0 : x.row,
                          canal: s.canal,
                          nv: s.nv,
                          estado: (p = x == null ? void 0 : x.data) == null ? void 0 : p.estado,
                          reabierta:
                            ((N = x == null ? void 0 : x.data) == null ? void 0 : N.reabierta) ===
                            !0,
                          motivo_reapertura:
                            ((S = x == null ? void 0 : x.data) == null
                              ? void 0
                              : S.motivo_reapertura) || '',
                          pendingRequest: W
                        });
                      },
                      className:
                        'px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-black text-sm flex items-center gap-2',
                      children: [e.jsx(Ze, { size: 16 }), 'Solicitar reapertura']
                    }),
                  e.jsxs('button', {
                    onClick: k,
                    disabled:
                      s.submitting ||
                      I ||
                      (s.mode === 'update' && (E == null ? void 0 : E.permitida) === !1 && !H),
                    className:
                      'px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2',
                    children: [
                      s.submitting
                        ? e.jsx(Ee, { size: 16, className: 'animate-spin' })
                        : e.jsx(Ma, { size: 16 }),
                      I
                        ? 'N.V. bloqueada'
                        : s.mode === 'update' && (E == null ? void 0 : E.permitida) === !1 && !H
                          ? 'Sin acceso IAM'
                          : s.mode === 'update'
                            ? 'Actualizar N.V.'
                            : 'Crear N.V.'
                    ]
                  })
                ]
              })
            ]
          })
        }),
      e.jsx(Ot, { toast: l })
    ]
  });
}
function Ht() {
  const { user: a } = ba();
  return e.jsx(It, { operador: (a == null ? void 0 : a.nombre) || '' });
}
const Yt = ['angelica@ptm.cl'];
function Qt(a) {
  return a
    ? a.rol === 'ADMIN' ||
        a.es_admin_delegado === !0 ||
        Yt.includes((a.email || '').trim().toLowerCase())
    : !1;
}
function is() {
  const { hasPermission: a, user: t } = ba(),
    s = a('manage_panel'),
    r = a('approve_panel_reopen_nv') || a('manage_roles'),
    n = Qt(t),
    [l, i] = b.useState('buscar'),
    c = [
      { v: 'buscar', label: 'Buscar', hint: 'Seguimiento y consulta', icon: Qe, accent: '#2563eb' },
      { v: 'ingresar', label: 'Ingresar', hint: 'Registro operativo', icon: ze, accent: re },
      ...(s
        ? [
            {
              v: 'consolidados',
              label: 'Consolidados',
              hint: 'Agrupación comercial',
              icon: Pa,
              accent: '#0f766e'
            }
          ]
        : [])
    ];
  return e.jsxs('div', {
    className: 'anim-fade-up space-y-4',
    children: [
      e.jsxs('div', {
        className:
          'w-full max-w-3xl rounded-[1.6rem] border border-slate-200/90 bg-white/95 p-3 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.22)]',
        children: [
          e.jsxs('div', {
            className: 'mb-3 px-1 pt-1',
            children: [
              e.jsx('div', {
                className: 'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400',
                children: 'Vista operativa'
              }),
              e.jsx('div', {
                className: 'mt-1 text-sm font-semibold text-slate-600',
                children: 'Selecciona el flujo que quieres trabajar dentro del panel.'
              })
            ]
          }),
          e.jsx('div', {
            className:
              'grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-[1.35rem] bg-slate-50/75 p-1.5',
            children: c.map((o) => {
              const h = o.icon,
                u = l === o.v;
              return e.jsxs(
                'button',
                {
                  type: 'button',
                  onClick: () => i(o.v),
                  className: `group relative overflow-hidden rounded-[1.15rem] border px-4 py-3.5 text-left transition-all duration-200 ${u ? 'bg-white text-slate-700 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]' : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/80'}`,
                  style: u ? { borderColor: `${o.accent}26` } : void 0,
                  'aria-pressed': u,
                  children: [
                    u &&
                      e.jsx('div', {
                        className: 'absolute inset-x-4 top-0 h-[2px] rounded-full',
                        style: { background: o.accent }
                      }),
                    e.jsx('div', {
                      className: `absolute inset-0 pointer-events-none transition-opacity ${u ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`,
                      style: {
                        background: `radial-gradient(circle at top right, ${o.accent}14, transparent 42%)`
                      }
                    }),
                    e.jsxs('div', {
                      className: 'relative flex items-center gap-3',
                      children: [
                        e.jsx('div', {
                          className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${u ? 'bg-white' : 'border-slate-200 bg-white/90 text-slate-500'}`,
                          style: u
                            ? {
                                borderColor: `${o.accent}26`,
                                color: o.accent,
                                background: `${o.accent}10`
                              }
                            : void 0,
                          children: e.jsx(h, { size: 18 })
                        }),
                        e.jsxs('div', {
                          className: 'min-w-0 flex-1',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center justify-between gap-3',
                              children: [
                                e.jsx('div', {
                                  className: `text-sm font-black tracking-tight ${u ? 'text-slate-900' : 'text-slate-800'}`,
                                  children: o.label
                                }),
                                u &&
                                  e.jsx('span', {
                                    className:
                                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
                                    style: { background: `${o.accent}12`, color: o.accent },
                                    children: 'Activo'
                                  })
                              ]
                            }),
                            e.jsx('div', {
                              className: `mt-1 text-[12px] leading-5 ${u ? 'text-slate-500' : 'text-slate-400'}`,
                              children: o.hint
                            })
                          ]
                        })
                      ]
                    })
                  ]
                },
                o.v
              );
            })
          })
        ]
      }),
      l === 'buscar' &&
        e.jsx(Ut, { puedeEscribir: s, puedeEliminar: n, puedeAprobarReapertura: r }),
      l === 'ingresar' && e.jsx(Wt, { puedeEscribir: s, puedeAprobarReapertura: r }),
      l === 'consolidados' && s && e.jsx(Ht, {})
    ]
  });
}
export { is as default };
