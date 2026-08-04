import { j as e } from './query-vendor-AW4268wa.js';
import { r as h, b as Ye, u as Ta } from './react-vendor-CczoB5o5.js';
import {
  X as Ia,
  S as Ge,
  ai as $a,
  x as Qe,
  p as Pa,
  aj as Va,
  ak as na,
  Y as je,
  al as xa,
  ah as fa,
  n as Fa,
  t as Ve,
  a7 as Ae,
  am as Ma,
  a0 as Ze,
  an as qa,
  ao as ha,
  ap as ga,
  aq as La
} from './ui-vendor-D9BeWSwh.js';
import { s as M, L as ye, w as me, u as ba } from './index-CRyr4FS8.js';
import { f as Ba } from './configService-CLENAe1_.js';
import { e as za } from './exportExcel-D85v870c.js';
import { c as Ua } from './index-CKBQV3Ro.js';
import { g as ee } from './animation-vendor-Bm2mNA5x.js';
import './supabase-vendor-4Fjsfb0a.js';
import './xlsx-B2eTCt_Q.js';
import './charts-vendor-Bk5-SXWK.js';
function Ga({ titulo: a, onClose: t, children: s, maxWidth: r = 'max-w-3xl', fullscreen: n = !1 }) {
  return (
    h.useEffect(() => {
      const o = (i) => i.key === 'Escape' && (t == null ? void 0 : t());
      document.addEventListener('keydown', o);
      const p = document.body.style.overflow;
      return (
        (document.body.style.overflow = 'hidden'),
        () => {
          (document.removeEventListener('keydown', o), (document.body.style.overflow = p));
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
          onClick: (o) => o.stopPropagation(),
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
                  children: e.jsx(Ia, { size: n ? 22 : 18 })
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
const te = 'tms_operaciones_vigentes',
  va = 'tms_operaciones',
  Ka = 60 * 1e3,
  Wa = 5 * 60 * 1e3,
  Ha = 20 * 1e3,
  Ya = 3 * 60 * 1e3,
  Qa = 5 * 60 * 1e3,
  Za = 10 * 60 * 1e3;
let Ke = { ts: 0, data: null, promise: null },
  We = { ts: 0, data: null, promise: null },
  Na = { ts: 0, data: null, promise: null },
  ja = { ts: 0, data: null, promise: null },
  ie = { ts: 0, data: null, promise: null };
const ge = new Map(),
  Ne = new Map(),
  Se = new Map();
function ya() {
  ((Ke = { ts: 0, data: null, promise: null }),
    (We = { ts: 0, data: null, promise: null }),
    (Na = { ts: 0, data: null, promise: null }),
    (ja = { ts: 0, data: null, promise: null }),
    (ie = { ts: 0, data: null, promise: null }),
    ge.clear(),
    Ne.clear(),
    Se.clear());
}
function Xa(a, t) {
  return !!a && Object.prototype.hasOwnProperty.call(a, 'value') && Date.now() - a.ts < t;
}
function Xe(a, t, s) {
  const r = a.get(t);
  return r ? (r.promise ? r.promise : Xa(r, s) ? r.value : (a.delete(t), null)) : null;
}
function _e(a, t, s) {
  return (a.set(t, { ts: Date.now(), value: s }), s);
}
function Je(a, t, s) {
  return (a.set(t, { ts: Date.now(), promise: s }), s);
}
function Fe(a) {
  return Math.round(Math.max(0, performance.now() - a));
}
function Ja(a = {}) {
  return {
    id: (a == null ? void 0 : a.id) ?? null,
    mode: (a == null ? void 0 : a.mode) || null,
    canal: (a == null ? void 0 : a.canal) || null,
    nv: he((a == null ? void 0 : a.nv) || ''),
    estado: (a == null ? void 0 : a.estado) || null,
    urgente: (a == null ? void 0 : a.urgente) === !0,
    transportista: (a == null ? void 0 : a.transportista) || null,
    hasIncidencia: !!String((a == null ? void 0 : a.incidencia) || '').trim(),
    reabierta: (a == null ? void 0 : a.reabierta) === !0
  };
}
async function pe(
  a,
  t,
  { screen: s = 'PanelIngresar', payload: r = null, slowMs: n = 900, message: o = '' } = {}
) {
  const p = performance.now();
  try {
    const i = await t(),
      l = Fe(p);
    return (
      l >= n &&
        ye.performance({
          module: 'panel',
          screen: s,
          action: a,
          message: o || `Operacion lenta de lectura: ${a}`,
          durationMs: l,
          status: 'ok',
          payload: r
        }),
      i
    );
  } catch (i) {
    throw (
      ye.error(i, {
        module: 'panel',
        screen: s,
        action: a,
        message: `Fallo operacion de lectura: ${a}`,
        durationMs: Fe(p),
        status: 'error',
        payload: r
      }),
      i
    );
  }
}
function et(a) {
  return /timed out acquiring connection|connection pool/i.test(
    String((a == null ? void 0 : a.message) || a || '')
  );
}
async function oa(a, { ms: t, label: s, attempts: r = 3 } = {}) {
  let n;
  for (let o = 0; o < r; o += 1) {
    if (
      ((n = await me(a(), { ms: t, label: s })), !et(n == null ? void 0 : n.error) || o === r - 1)
    )
      return n;
    const p = 180 * 2 ** o + Math.floor(Math.random() * 70);
    (ye.warn(n.error, {
      module: 'panel',
      screen: 'PanelIngresar',
      action: 'pool_acquire_retry',
      message: `Reintento de lectura por saturación transitoria del pool: ${s}`,
      attempt: o + 1,
      delayMs: p
    }),
      await new Promise((i) => setTimeout(i, p)));
  }
  return n;
}
async function we(a, t, { screen: s = 'PanelIngresar', payload: r = null, message: n = '' } = {}) {
  const o = performance.now();
  try {
    const p = await t(),
      i = Fe(o);
    return (p == null ? void 0 : p.ok) === !1
      ? (ye.error(new Error(p.error || p.message || `Operacion fallida: ${a}`), {
          module: 'panel',
          screen: s,
          action: a,
          message: `Operacion fallida: ${a}`,
          durationMs: i,
          status: 'failed',
          payload: r,
          context: { result: p }
        }),
        p)
      : (ye.audit({
          module: 'panel',
          screen: s,
          action: a,
          message: n || `Operacion ejecutada: ${a}`,
          durationMs: i,
          status: 'ok',
          payload: r
        }),
        p);
  } catch (p) {
    throw (
      ye.error(p, {
        module: 'panel',
        screen: s,
        action: a,
        message: `Fallo operacion critica: ${a}`,
        durationMs: Fe(o),
        status: 'error',
        payload: r
      }),
      p
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
  _a = ['PROBLEMAS DE DIRECCIÓN', 'PROBLEMAS DE TRANSPORTE', 'OTRO'],
  wa = ['ABIERTA', 'EN GESTIÓN', 'RESUELTA'],
  Ea = ['En Proceso', 'Shipping', 'Currier', 'En Ruta', 'Entregado'],
  Me = ['En Proceso', 'Shipping', 'Currier', 'En Ruta'],
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
  Oe = (a) => tt[a] || '#9ca3af',
  ne = '#ea580c',
  fe = (a) => (a ? String(a).slice(0, 10) : ''),
  he = (a) => {
    const t = String(a ?? '').trim();
    return /^\d+\.0+$/.test(t) ? t.split('.')[0] : t;
  },
  xe = (a) =>
    String(a || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase(),
  ue = (a) =>
    xe(a)
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  st = new Set(['de', 'del', 'la', 'las', 'los']),
  la = (a) =>
    ue(a)
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
  Ie = (a) => (a.nv_ptm ? 'ptm' : a.nv_orange ? 'orange' : a.nv_farmapack ? 'farmapack' : 'varios'),
  Ee = (a) => (a.nv_ptm ? String(a.nv_ptm) : a.nv_orange || a.nv_farmapack || a.varios || ''),
  ia = (a) => xe(a).includes('orange'),
  le =
    'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,estado,transportista,fecha_compromiso,guia,factura,fecha_aprobacion,fecha_aprobacion_real,urgente,fecha_estado,reabierta,motivo_reapertura';
function ke(a) {
  const t = Ie(a),
    s = Ee(a);
  return {
    id: a.id,
    key: `${t}:${s}`,
    canal: t,
    nv: s,
    cliente: a.cliente || '',
    vendedor: a.vendedor || '',
    estado: a.estado || '',
    transportista: a.transportista || '',
    fechaCompromiso: fe(a.fecha_compromiso),
    guia: a.guia || '',
    factura: a.factura || '',
    fechaAprobacion: fe(a.fecha_aprobacion),
    fechaAprobacionReal: fe(a.fecha_aprobacion_real),
    urgente: a.urgente === !0,
    _estado: a.estado,
    reabierta: a.reabierta === !0,
    motivoReapertura: a.motivo_reapertura || ''
  };
}
function nt(a) {
  return ue(a).split(' ').filter(Boolean);
}
function ot(a) {
  const t = he((a == null ? void 0 : a.nv) || ''),
    s = xe((a == null ? void 0 : a.guia) || ''),
    r = xe((a == null ? void 0 : a.factura) || ''),
    n = ue((a == null ? void 0 : a.cliente) || ''),
    o = ue((a == null ? void 0 : a.vendedor) || ''),
    p = ue((a == null ? void 0 : a.transportista) || ''),
    i = xe((a == null ? void 0 : a.canal) || ''),
    l = xe((a == null ? void 0 : a.estado) || ''),
    g = [t, s, r, n, o, p, i, l].filter(Boolean).join(' '),
    u = new Set(g.split(' ').filter(Boolean));
  return {
    nv: t,
    guia: s,
    factura: r,
    cliente: n,
    vendedor: o,
    transportista: p,
    canal: i,
    estado: l,
    searchable: g,
    words: u
  };
}
function lt(a, t) {
  const s = String(t || '').trim();
  if (!s) return Number.NEGATIVE_INFINITY;
  const r = he(s),
    n = xe(s),
    o = ue(s),
    p = nt(s),
    i = ot(a);
  let l = 0;
  if (
    (i.nv &&
      r &&
      (i.nv === r ? (l += 2e4) : i.nv.startsWith(r) ? (l += 12e3) : i.nv.includes(r) && (l += 8e3)),
    i.guia &&
      n &&
      (i.guia === n
        ? (l += 15e3)
        : i.guia.startsWith(n)
          ? (l += 9e3)
          : i.guia.includes(n) && (l += 4500)),
    i.factura &&
      n &&
      (i.factura === n
        ? (l += 15e3)
        : i.factura.startsWith(n)
          ? (l += 9e3)
          : i.factura.includes(n) && (l += 4500)),
    o &&
      (i.cliente === o
        ? (l += 7e3)
        : i.cliente.startsWith(o)
          ? (l += 4800)
          : i.cliente.includes(o) && (l += 2800),
      i.vendedor === o
        ? (l += 6500)
        : i.vendedor.startsWith(o)
          ? (l += 4400)
          : i.vendedor.includes(o) && (l += 2400),
      i.transportista === o
        ? (l += 5e3)
        : i.transportista.startsWith(o)
          ? (l += 3200)
          : i.transportista.includes(o) && (l += 1800)),
    p.length > 0)
  ) {
    let g = 0;
    (p.forEach((u) => {
      if (i.words.has(u)) {
        ((g += 1), (l += 950));
        return;
      }
      for (const c of i.words)
        if (c.startsWith(u)) {
          ((g += 0.6), (l += 360));
          return;
        }
      i.searchable.includes(u) && (l += 120);
    }),
      g >= p.length && (l += 1600));
  }
  return (
    n && i.searchable.includes(n) && (l += 600),
    a != null && a.urgente && (l += 45),
    (l += Math.min(Re(a) / 1e9, 120)),
    l
  );
}
function De(a, t, s = 200) {
  const r = new Map();
  return (
    (a || []).forEach((n) => {
      if (!(n != null && n.key)) return;
      const o = lt(n, t);
      if (!Number.isFinite(o) || o <= 0) return;
      const p = r.get(n.key);
      (!p || o > p.score || (o === p.score && Re(n) > Re(p.item))) &&
        r.set(n.key, { item: n, score: o });
    }),
    Array.from(r.values())
      .sort((n, o) => o.score - n.score || Re(o.item) - Re(n.item))
      .slice(0, s)
      .map(({ item: n }) => n)
  );
}
function Re(a) {
  return (
    Date.parse((a == null ? void 0 : a.fecha_estado) || '') ||
    Date.parse((a == null ? void 0 : a.fecha_aprobacion_real) || '') ||
    Date.parse((a == null ? void 0 : a.fecha_aprobacion) || '') ||
    0
  );
}
async function ze({ force: a = !1, full: t = !0, limit: s = 400 } = {}) {
  return pe(
    'lista_activas',
    async () => {
      const r = Date.now(),
        n = t ? Ke : We;
      if (!a && n.data && r - n.ts < Ka) return n.data;
      if (!a && n.promise) return n.promise;
      const o = async () => {
        if (!t) {
          const { data: u, error: c } = await M.from(te)
            .select(le)
            .in('estado', Me)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .limit(s);
          if (c) throw c;
          const v = (u || []).map(ke);
          return ((We = { ts: Date.now(), data: v, promise: null }), v);
        }
        const p = [];
        let i = 0;
        const l = 500;
        for (;;) {
          const { data: u, error: c } = await M.from(te)
            .select(le)
            .in('estado', Me)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .range(i, i + l - 1);
          if (c) throw c;
          if (!u || u.length === 0 || (p.push(...u), u.length < l)) break;
          i += l;
        }
        const g = p.map(ke);
        return ((Ke = { ts: Date.now(), data: g, promise: null }), g);
      };
      return (
        (n.promise = o().catch((p) => {
          throw ((n.promise = null), p);
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
async function it(a, { limit: t = 300 } = {}) {
  return pe(
    'buscar_operaciones',
    async () => {
      const s = String(a || '').trim();
      if (s.length < 2) return [];
      const r = `${t}:${ue(s) || xe(s)}`,
        n = Xe(ge, r, Ha);
      if (n) return n;
      const o = s.replace(/[(),*]/g, ' ').trim();
      if (!o) return [];
      const i = (async () => {
        if (/^\d{4,}$/.test(o)) {
          const C = await oa(
            () =>
              M.from(va)
                .select(le)
                .or(`nv_ptm.eq.${Number(o)},nv_orange.eq.${o},nv_farmapack.eq.${o},varios.eq.${o}`)
                .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                .order('id', { ascending: !1 })
                .limit(4),
            { ms: 2500, label: 'Busqueda exacta de N.V. del Panel' }
          );
          if (C != null && C.error) throw C.error;
          const w = De((C.data || []).map(ke), s, Math.min(t, 20));
          if (w.length) return _e(ge, r, w);
          const D = Math.min(t, 60),
            O = `${o}%`,
            E = await oa(
              () =>
                M.from(te)
                  .select(le)
                  .or(
                    `nv_ptm.eq.${Number(o)},nv_orange.ilike.${O},nv_farmapack.ilike.${O},varios.ilike.${O},guia.ilike.${O},factura.ilike.${O}`
                  )
                  .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                  .order('id', { ascending: !1 })
                  .limit(D),
              { ms: 3e3, label: 'Busqueda numerica del Panel' }
            );
          if (E != null && E.error) throw E.error;
          const P = De((E.data || []).map(ke), s, t);
          return _e(ge, r, P);
        }
        const g = `*${o}*`,
          u = [];
        u.push(
          `nv_orange.ilike.${g}`,
          `nv_farmapack.ilike.${g}`,
          `varios.ilike.${g}`,
          `cliente.ilike.${g}`,
          `vendedor.ilike.${g}`,
          `guia.ilike.${g}`,
          `factura.ilike.${g}`,
          `transportista.ilike.${g}`
        );
        let c = null,
          v = null;
        if (
          (({ data: c, error: v } = await me(
            M.from(te)
              .select(le)
              .or(u.join(','))
              .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
              .limit(t),
            { ms: 4e3, label: 'Busqueda remota amplia del Panel' }
          )),
          v)
        ) {
          const C = Math.min(t, 60),
            w = `${o}*`,
            O = (
              await Promise.allSettled([
                me(M.from(te).select(le).ilike('nv_orange', w).limit(C), {
                  ms: 2500,
                  label: 'Fallback nv_orange Panel'
                }),
                me(M.from(te).select(le).ilike('nv_farmapack', w).limit(C), {
                  ms: 2500,
                  label: 'Fallback nv_farmapack Panel'
                }),
                me(M.from(te).select(le).ilike('varios', w).limit(C), {
                  ms: 2500,
                  label: 'Fallback varios Panel'
                }),
                me(M.from(te).select(le).ilike('guia', w).limit(C), {
                  ms: 2500,
                  label: 'Fallback guia Panel'
                }),
                me(M.from(te).select(le).ilike('factura', w).limit(C), {
                  ms: 2500,
                  label: 'Fallback factura Panel'
                }),
                o.length >= 4
                  ? me(M.from(te).select(le).ilike('cliente', w).limit(C), {
                      ms: 2500,
                      label: 'Fallback cliente Panel'
                    })
                  : Promise.resolve({ data: [] })
              ])
            )
              .filter((E) => {
                var P;
                return (
                  E.status === 'fulfilled' && Array.isArray((P = E.value) == null ? void 0 : P.data)
                );
              })
              .flatMap((E) => E.value.data || []);
          if (O.length) ((c = O), (v = null));
          else throw v;
        }
        const N = new Map();
        (c || []).forEach((C) => {
          const w = Ee(C);
          if (!w) return;
          const D = `${Ie(C)}:${w}`;
          N.has(D) || N.set(D, ke(C));
        });
        const A = De(Array.from(N.values()), s, t);
        return _e(ge, r, A);
      })().catch((l) => {
        throw (ge.delete(r), l);
      });
      return Je(ge, r, i);
    },
    {
      payload: { term: String(a || '').trim(), limit: t },
      slowMs: 450,
      message: 'Busqueda remota de operaciones del Panel'
    }
  );
}
function ct(a, t, { limit: s = 120 } = {}) {
  const r = String(t || '').trim();
  return r.length < 2 ? [] : De(a || [], r, s);
}
function dt(a, t, s, { limit: r = 160 } = {}) {
  return De([...(a || []), ...(t || [])], s, r);
}
async function Aa({ force: a = !1, includeHistoricos: t = !1 } = {}) {
  return pe(
    'cargar_opciones',
    async () => {
      const s = Date.now(),
        r = t ? Na : ja;
      if (!a && r.data && s - r.ts < Wa) return r.data;
      if (!a && r.promise) return r.promise;
      const n = async () => {
        const o = new Set(),
          { data: p } = await M.from('tms_panel_transportistas')
            .select('nombre')
            .eq('activo', !0)
            .order('nombre', { ascending: !0 });
        if (
          ((p || []).forEach((g) => {
            const u = (g.nombre || '').trim();
            u && o.add(u);
          }),
          t)
        ) {
          let g = 0;
          const u = 1e3;
          for (;;) {
            const { data: c, error: v } = await M.from(te)
              .select('transportista')
              .not('transportista', 'is', null)
              .order('id', { ascending: !0 })
              .range(g, g + u - 1);
            if (
              v ||
              !c ||
              c.length === 0 ||
              (c.forEach((N) => {
                const A = (N.transportista || '').trim();
                A && o.add(A);
              }),
              c.length < u)
            )
              break;
            g += u;
          }
        }
        const i = [...o].sort((g, u) => g.localeCompare(u, 'es')),
          l = { estados: Ea, transportistas: i, tiposDespacho: Ca };
        return ((r.data = l), (r.ts = Date.now()), (r.promise = null), l);
      };
      return (
        (r.promise = n().catch((o) => {
          throw ((r.promise = null), o);
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
const Sa =
  'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,centro_costo,division,estado,transportista,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_facturacion,fecha_despacho,fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,factura,guia,bultos,valor_factura,numero_envio,urgente,incidencia,estado_incidencia,observaciones_incidencia,reabierta,fecha_reapertura,motivo_reapertura';
async function ea(a, t) {
  const s = he(t);
  if (!s) return null;
  const r = `${String(a).toLowerCase()}:${s}`,
    n = Xe(Se, r, Qa);
  if (n) return n;
  const p = (async () => {
    const { data: i } = await M.from('tms_nv_catalogo')
      .select('cliente, vendedor, fecha_aprobacion, centro_costo, division')
      .eq('canal', String(a).toLowerCase())
      .eq('nv', s)
      .limit(1);
    return _e(Se, r, (i && i[0]) || null);
  })().catch((i) => {
    throw (Se.delete(r), i);
  });
  return Je(Se, r, p);
}
async function ut() {
  const a = Date.now();
  if (ie.data && a - ie.ts < Za) return ie.data;
  if (ie.promise) return ie.promise;
  const t = async () => {
    const { data: s } = await M.from('tms_panel_vendedores')
        .select('nombre, centro_costo, division')
        .eq('activo', !0)
        .order('nombre', { ascending: !0 }),
      r = s || [];
    return ((ie = { ts: Date.now(), data: r, promise: null }), r);
  };
  return (
    (ie.promise = t().catch((s) => {
      throw ((ie.promise = null), s);
    })),
    ie.promise
  );
}
async function aa(a) {
  const t = String(a || '').trim();
  if (!t) return null;
  const s = await ut();
  if (!s || s.length === 0) return null;
  const r = ue(t),
    n = la(t),
    p = s
      .map((i) => {
        const l = ue(i.nombre),
          g = la(i.nombre),
          u = l === r,
          c = !u && (l.includes(r) || r.includes(l)),
          v = n.filter((w) => g.includes(w)).length,
          N = n.length > 0 && n.every((w) => g.includes(w)),
          A = g.length > 0 && g.every((w) => n.includes(w));
        let C = 0;
        return (
          u ? (C += 1e3) : c ? (C += 700) : (N || A) && (C += 500),
          (C += v * 100),
          (C -= Math.abs(l.length - r.length)),
          { ...i, score: C }
        );
      })
      .filter((i) => i.score >= 200)
      .sort((i, l) => l.score - i.score)[0];
  return p ? { centro_costo: p.centro_costo || '', division: p.division || '' } : null;
}
async function Te(a, t) {
  return pe(
    'lookup_nv',
    async () => {
      const s = he(t);
      if (!s)
        return { found: !1, autoFill: { cliente: '', vendedor: '', ccosto: '', division: '' } };
      const r = `${String(a).toLowerCase()}:${s}`,
        n = Xe(Ne, r, Ya);
      if (n) return n;
      const p = (async () => {
        const i = rt(a);
        let l = M.from(te).select(Sa).order('fecha_estado', { ascending: !1 }).limit(1);
        l = a === 'ptm' && /^\d+$/.test(s) ? l.eq(i, Number(s)) : l.eq(i, s);
        const [{ data: g }, u] = await Promise.all([l, ea(a, s)]),
          c = g && g.length ? g[0] : null,
          v = (c == null ? void 0 : c.cliente) || (u == null ? void 0 : u.cliente) || '',
          N = (c == null ? void 0 : c.vendedor) || (u == null ? void 0 : u.vendedor) || '';
        let A =
            (c == null ? void 0 : c.centro_costo) || (u == null ? void 0 : u.centro_costo) || '',
          C = (c == null ? void 0 : c.division) || (u == null ? void 0 : u.division) || '';
        if (N && (!A || !C)) {
          const w = await aa(N);
          w && ((A = A || w.centro_costo || ''), (C = C || w.division || ''));
        }
        if (c) {
          const w = {
            found: !0,
            row: c.id,
            data: {
              ...c,
              canal: a,
              nv: Ee(c),
              estado: c.estado,
              cliente: v,
              vendedor: N,
              ccosto: A,
              division: C,
              fecha_compromiso: fe(c.fecha_compromiso),
              fecha_registro_nv: fe(c.fecha_registro_nv)
            }
          };
          return _e(Ne, r, w);
        }
        return _e(Ne, r, {
          found: !1,
          autoFill: { cliente: v, vendedor: N, ccosto: A, division: C }
        });
      })().catch((i) => {
        throw (Ne.delete(r), i);
      });
      return Je(Ne, r, p);
    },
    { payload: { canal: a, nv: he(t) }, slowMs: 550, message: 'Lookup de N.V. en Panel' }
  );
}
async function pt(a, { canal: t = null, nv: s = null } = {}) {
  return pe(
    'lookup_nv_by_id',
    async () => {
      if (!a) return Te(t, s);
      const { data: r, error: n } = await M.from(va).select(Sa).eq('id', a).limit(1);
      if (n) throw n;
      const o = r && r.length ? r[0] : null;
      if (!o) return Te(t, s);
      const p = t || Ie(o),
        i = s || Ee(o),
        l = await ea(p, i),
        g = (o == null ? void 0 : o.cliente) || (l == null ? void 0 : l.cliente) || '',
        u = (o == null ? void 0 : o.vendedor) || (l == null ? void 0 : l.vendedor) || '';
      let c = (o == null ? void 0 : o.centro_costo) || (l == null ? void 0 : l.centro_costo) || '',
        v = (o == null ? void 0 : o.division) || (l == null ? void 0 : l.division) || '';
      if (u && (!c || !v)) {
        const A = await aa(u);
        A && ((c = c || A.centro_costo || ''), (v = v || A.division || ''));
      }
      return {
        found: !0,
        row: o.id,
        data: {
          ...o,
          canal: p,
          nv: i,
          estado: o.estado,
          cliente: g,
          vendedor: u,
          ccosto: c,
          division: v,
          fecha_compromiso: fe(o.fecha_compromiso),
          fecha_registro_nv: fe(o.fecha_registro_nv)
        }
      };
    },
    {
      payload: { id: a, canal: t, nv: he(s) },
      slowMs: 350,
      message: 'Lookup de N.V. por id en Panel'
    }
  );
}
async function mt(a, t = {}) {
  const s = he(a);
  if (!s) return null;
  const r = await ea('orange', s);
  if (!r) return null;
  let n = r.centro_costo || '',
    o = r.division || '';
  const p = r.vendedor || t.vendedor || '';
  if (p && (!n || !o)) {
    const i = await aa(p);
    i && ((n = n || i.centro_costo || ''), (o = o || i.division || ''));
  }
  return (
    (n = n || t.ccosto || t.centro_costo || ''),
    (o = o || t.division || ''),
    {
      nv: s,
      cliente: r.cliente || '',
      vendedor: r.vendedor || t.vendedor || '',
      ccosto: n,
      division: o,
      fecha_aprobacion: fe(r.fecha_aprobacion)
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
  xt = [
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
  ht = new Set(['fecha_estado', 'fecha_registro_nv', 'created_at', 'updated_at']),
  Ra = (a) => {
    const t = String(a).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return t ? `${t[3]}/${t[2]}/${t[1]}` : String(a);
  },
  gt = (a) => {
    const t = String(a).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    return t ? `${t[3]}/${t[2]}/${t[1]} ${t[4]}:${t[5]}` : Ra(a);
  };
async function bt() {
  return pe(
    'exportar_operaciones',
    async () => {
      const a = ca.map((n) => n[0]).join(','),
        t = [];
      let s = 0;
      const r = 1e3;
      for (;;) {
        const { data: n, error: o } = await M.from(te)
          .select(a)
          .order('id', { ascending: !0 })
          .range(s, s + r - 1);
        if (o) throw o;
        if (!n || n.length === 0 || (t.push(...n), n.length < r)) break;
        s += r;
      }
      return t.map((n) => {
        const o = {};
        ca.forEach(([u, c]) => {
          let v = n[u];
          (u === 'urgente'
            ? (v = v === !0 ? 'SÍ' : 'NO')
            : v == null || v === ''
              ? (v = '')
              : ft.has(u)
                ? (v = Ra(v))
                : ht.has(u) && (v = gt(v)),
            (o[c] = v));
        });
        const p = Ie(n),
          i = Ee(n),
          l = (n.nv_ptm && n.nv_orange) || '',
          g = {
            'CANAL OPERACIÓN': String(p || '').toUpperCase(),
            'N.V OPERACIÓN': i || '',
            'N.V ORANGE ASOCIADA PTM': l,
            'PTM CON ASOCIACIÓN ORANGE': n.nv_ptm ? (n.nv_orange ? 'SÍ' : 'NO') : ''
          };
        return (
          xt.forEach(([, u]) => {
            o[u] = g[u] || '';
          }),
          o
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
function qe(a, t) {
  return t
    ? { ok: !1, error: t.message, message: t.message }
    : a && typeof a == 'object'
      ? a
      : { ok: !0 };
}
async function ka(a) {
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
  return we(
    'guardar_nv',
    async () => {
      const { data: r, error: n } = await M.rpc('guardar_nv', { p: t }),
        o = qe(r, n);
      return ((o == null ? void 0 : o.ok) !== !1 && ya(), o);
    },
    { payload: Ja(t), message: 'Guardado de N.V. en Panel' }
  );
}
async function vt(a) {
  if (!a) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: t, error: s } = await M.rpc('iam_puede_editar_nv', { p_id: a });
  return s
    ? { permitida: !1, message: s.message || 'No se pudo validar el acceso IAM.' }
    : t || { permitida: !1, message: 'No se pudo validar el acceso IAM.' };
}
async function Nt(a, t = null) {
  if (!a) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: s, error: r } = await M.rpc('iam_puede_cambiar_estado_nv', {
    p_id: a,
    p_estado: t
  });
  return r
    ? { permitida: !1, message: r.message || 'No se pudo validar la transición de estado.' }
    : s || { permitida: !1, message: 'No se pudo validar la transición de estado.' };
}
async function Da(a) {
  return pe(
    'listar_reaperturas_nv',
    async () => {
      if (!a) return [];
      const { data: t, error: s } = await M.from('tms_nv_reaperturas')
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
async function Oa(a, t) {
  return we(
    'solicitar_reapertura_nv',
    async () => {
      const { data: s, error: r } = await M.rpc('solicitar_reapertura_nv', {
        p_operacion_id: a,
        p_motivo: t
      });
      return qe(s, r);
    },
    {
      payload: { id: a, motivoLength: String(t || '').trim().length },
      message: 'Solicitud de reapertura de N.V.'
    }
  );
}
async function jt(a, t, s = '') {
  return we(
    'resolver_reapertura_nv',
    async () => {
      const { data: r, error: n } = await M.rpc('resolver_reapertura_nv', {
        p_request_id: a,
        p_aprobar: t,
        p_observacion: s || null
      });
      return qe(r, n);
    },
    {
      payload: { requestId: a, aprobar: t, observacionLength: String(s || '').trim().length },
      message: 'Resolucion de solicitud de reapertura'
    }
  );
}
async function yt(a) {
  return we(
    'eliminar_nv',
    async () => {
      const { data: t, error: s } = await M.rpc('eliminar_nv', { p_id: a }),
        r = qe(t, s);
      return ((r == null ? void 0 : r.ok) !== !1 && ya(), r);
    },
    { payload: { id: a }, message: 'Eliminacion de N.V. en Panel' }
  );
}
async function _t() {
  return pe(
    'listar_consolidados',
    async () => {
      const [{ data: a }, { data: t }] = await Promise.all([
          M.from('tms_consolidados')
            .select('id, ticket, fecha_comprometida, estado, observacion, created_by, created_at')
            .order('id', { ascending: !1 }),
          M.from('tms_consolidado_nvs').select('id, consolidado_id, nv, canal, cliente')
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
  return we(
    'guardar_consolidado',
    async () => {
      const { data: t, error: s } = await M.rpc('guardar_consolidado', { p: a });
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
async function wt(a) {
  return we(
    'eliminar_consolidado',
    async () => {
      const { data: t, error: s } = await M.rpc('eliminar_consolidado', { p_id: a });
      return s ? { ok: !1, error: s.message } : t || { ok: !0 };
    },
    { payload: { id: a }, message: 'Eliminacion de consolidado' }
  );
}
async function da(a) {
  return pe(
    'buscar_nv_basico',
    async () => {
      const t = String(a).trim();
      if (!t) return null;
      const s = [];
      (/^\d+$/.test(t) && s.push(`nv_ptm.eq.${Number(t)}`),
        s.push(`nv_orange.eq.${t}`, `nv_farmapack.eq.${t}`, `varios.ilike.*${t}*`));
      const { data: r } = await M.from(te)
        .select('nv_ptm,nv_orange,nv_farmapack,varios,cliente,estado,fecha_estado')
        .or(s.join(','))
        .order('fecha_estado', { ascending: !1 })
        .limit(1);
      if (!r || r.length === 0) return null;
      const n = r[0];
      return { nv: Ee(n), canal: Ie(n), cliente: n.cliente || null, estado: n.estado || null };
    },
    {
      payload: { nv: String(a || '').trim() },
      slowMs: 400,
      message: 'Busqueda basica de N.V. para consolidados'
    }
  );
}
const se = {
    EN_PROCESO: 'En Proceso',
    SHIPPING: 'Shipping',
    CURRIER: 'Currier',
    EN_RUTA: 'En Ruta',
    ENTREGADO: 'Entregado',
    RECIBIDO_CONFORME: 'Recibido Conforme',
    RECIBIDO_OBS: 'Recibido C/OBS'
  },
  Et = [se.CURRIER, se.EN_RUTA, se.ENTREGADO, se.RECIBIDO_CONFORME, se.RECIBIDO_OBS],
  Ct = [se.EN_PROCESO, se.SHIPPING, se.CURRIER, se.EN_RUTA, se.ENTREGADO];
function At(a) {
  const t = (a || '').toUpperCase();
  return Et.some((s) => s.toUpperCase() === t);
}
function St(a, t) {
  const s = new Date(a);
  let r = 0;
  const n = s.getDay();
  for (n === 0 ? s.setDate(s.getDate() + 1) : n === 6 && s.setDate(s.getDate() + 2); r < t;) {
    s.setDate(s.getDate() + 1);
    const o = s.getDay();
    o !== 0 && o !== 6 && r++;
  }
  return s;
}
function ua(a, t) {
  const s = t || a;
  if (!s) return '';
  const r = new Date(s + 'T12:00:00');
  if (isNaN(r.getTime())) return '';
  const n = St(r, 2),
    o = n.getFullYear(),
    p = String(n.getMonth() + 1).padStart(2, '0'),
    i = String(n.getDate()).padStart(2, '0');
  return `${o}-${p}-${i}`;
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
    estado: se.EN_PROCESO,
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
  be = Ua((a) => ({
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
          estado: t.estado || se.EN_PROCESO,
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
          estado: se.EN_PROCESO,
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
  Rt = ({
    items: a,
    active: t,
    onSelect: s,
    accent: r = '#ea580c',
    ease: n = 'power3.easeOut'
  }) => {
    const o = h.useRef([]),
      p = h.useRef([]),
      i = h.useRef([]),
      l = h.useRef([]);
    (h.useEffect(() => {
      var v;
      const c = () => {
        o.current.forEach((N, A) => {
          var Z;
          if (!(N != null && N.parentElement)) return;
          const C = N.parentElement,
            w = C.getBoundingClientRect(),
            { width: D, height: O } = w;
          if (D === 0 || O === 0) return;
          const E = ((D * D) / 4 + O * O) / (2 * O),
            P = Math.ceil(2 * E) + 2,
            V = Math.ceil(E - Math.sqrt(Math.max(0, E * E - (D * D) / 4))) + 1,
            Y = P - V;
          ((N.style.width = `${P}px`),
            (N.style.height = `${P}px`),
            (N.style.bottom = `-${V}px`),
            ee.set(N, { xPercent: -50, scale: 0, transformOrigin: `50% ${Y}px` }));
          const f = C.querySelector('.pc-label'),
            I = C.querySelector('.pc-label-hover');
          (f && ee.set(f, { y: 0 }),
            I && ee.set(I, { y: O + 12, opacity: 0 }),
            (Z = p.current[A]) == null || Z.kill());
          const H = ee.timeline({ paused: !0 });
          (H.to(N, { scale: 1.2, xPercent: -50, duration: 2, ease: n, overwrite: 'auto' }, 0),
            f && H.to(f, { y: -(O + 8), duration: 2, ease: n, overwrite: 'auto' }, 0),
            I &&
              (ee.set(I, { y: Math.ceil(O + 100), opacity: 0 }),
              H.to(I, { y: 0, opacity: 1, duration: 2, ease: n, overwrite: 'auto' }, 0)),
            (p.current[A] = H));
        });
      };
      return (
        c(),
        window.addEventListener('resize', c),
        (v = document.fonts) != null && v.ready && document.fonts.ready.then(c).catch(() => {}),
        () => window.removeEventListener('resize', c)
      );
    }, [a, n]),
      h.useEffect(() => {
        a.forEach((c, v) => {
          var P;
          const N = l.current[v],
            A = p.current[v],
            C = o.current[v],
            w = N == null ? void 0 : N.querySelector('.pc-label'),
            D = N == null ? void 0 : N.querySelector('.pc-label-hover'),
            O = t === c.value,
            E = c.color || r;
          if (((P = i.current[v]) == null || P.kill(), !(!N || !C || !A))) {
            if (O) {
              ((N.style.background = E),
                (N.style.color = '#ffffff'),
                ee.set(C, { scale: 1.2, xPercent: -50 }),
                w && ee.set(w, { y: -(N.offsetHeight + 8) }),
                D && ee.set(D, { y: 0, opacity: 1 }),
                A.progress(1).pause());
              return;
            }
            ((N.style.background = ''),
              (N.style.color = ''),
              ee.set(C, { scale: 0, xPercent: -50 }),
              w && ee.set(w, { y: 0 }),
              D && ee.set(D, { y: N.offsetHeight + 12, opacity: 0 }),
              A.progress(0).pause());
          }
        });
      }, [t, a, r]));
    const g = (c) => {
        var N, A;
        if (t === ((N = a[c]) == null ? void 0 : N.value)) return;
        const v = p.current[c];
        v &&
          ((A = i.current[c]) == null || A.kill(),
          (i.current[c] = v.tweenTo(v.duration(), { duration: 0.3, ease: n, overwrite: 'auto' })));
      },
      u = (c) => {
        var N, A;
        if (t === ((N = a[c]) == null ? void 0 : N.value)) return;
        const v = p.current[c];
        v &&
          ((A = i.current[c]) == null || A.kill(),
          (i.current[c] = v.tweenTo(0, { duration: 0.2, ease: n, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: 'pc-track',
      children: a.map((c, v) => {
        const N = t === c.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(c.value),
            onMouseEnter: () => g(v),
            onMouseLeave: () => u(v),
            className: `pc-pill ${N ? 'pc-active' : ''}`,
            'aria-pressed': N,
            ref: (A) => {
              l.current[v] = A;
            },
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (A) => {
                  o.current[v] = A;
                },
                style: { background: c.color || r }
              }),
              e.jsxs('span', {
                className: 'pc-label-stack',
                children: [
                  e.jsx('span', { className: 'pc-label', children: c.label }),
                  e.jsx('span', {
                    className: 'pc-label-hover',
                    'aria-hidden': 'true',
                    children: c.label
                  })
                ]
              })
            ]
          },
          c.value
        );
      })
    });
  },
  ta = ({ items: a, active: t, onSelect: s, inline: r = !1, ease: n = 'power3.easeOut' }) => {
    const o = h.useRef([]),
      p = h.useRef([]),
      i = h.useRef([]);
    h.useEffect(() => {
      var c;
      const u = () => {
        o.current.forEach((v, N) => {
          var H;
          if (!(v != null && v.parentElement)) return;
          const A = v.parentElement,
            C = A.getBoundingClientRect(),
            { width: w, height: D } = C;
          if (w === 0 || D === 0) return;
          const O = ((w * w) / 4 + D * D) / (2 * D),
            E = Math.ceil(2 * O) + 2,
            P = Math.ceil(O - Math.sqrt(Math.max(0, O * O - (w * w) / 4))) + 1,
            V = E - P;
          ((v.style.width = `${E}px`),
            (v.style.height = `${E}px`),
            (v.style.bottom = `-${P}px`),
            ee.set(v, { xPercent: -50, scale: 0, transformOrigin: `50% ${V}px` }));
          const Y = A.querySelector('.pc-label'),
            f = A.querySelector('.pc-label-hover');
          (Y && ee.set(Y, { y: 0 }),
            f && ee.set(f, { y: D + 12, opacity: 0 }),
            (H = p.current[N]) == null || H.kill());
          const I = ee.timeline({ paused: !0 });
          (I.to(v, { scale: 1.2, xPercent: -50, duration: 2, ease: n, overwrite: 'auto' }, 0),
            Y && I.to(Y, { y: -(D + 8), duration: 2, ease: n, overwrite: 'auto' }, 0),
            f &&
              (ee.set(f, { y: Math.ceil(D + 100), opacity: 0 }),
              I.to(f, { y: 0, opacity: 1, duration: 2, ease: n, overwrite: 'auto' }, 0)),
            (p.current[N] = I));
        });
      };
      return (
        u(),
        window.addEventListener('resize', u),
        (c = document.fonts) != null && c.ready && document.fonts.ready.then(u).catch(() => {}),
        () => window.removeEventListener('resize', u)
      );
    }, [a, n]);
    const l = (u) => {
        var v, N;
        if (t === ((v = a[u]) == null ? void 0 : v.value)) return;
        const c = p.current[u];
        c &&
          ((N = i.current[u]) == null || N.kill(),
          (i.current[u] = c.tweenTo(c.duration(), { duration: 0.3, ease: n, overwrite: 'auto' })));
      },
      g = (u) => {
        var v, N;
        if (t === ((v = a[u]) == null ? void 0 : v.value)) return;
        const c = p.current[u];
        c &&
          ((N = i.current[u]) == null || N.kill(),
          (i.current[u] = c.tweenTo(0, { duration: 0.2, ease: n, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: `pc-track pc-estado${r ? ' pc-inline' : ''}`,
      children: a.map((u, c) => {
        const v = t === u.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(u.value),
            onMouseEnter: () => l(c),
            onMouseLeave: () => g(c),
            className: `pc-pill ${v ? 'pc-active' : ''}`,
            style: v ? { background: u.color, color: '#fff' } : void 0,
            title: u.label,
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (N) => {
                  o.current[c] = N;
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
function kt({
  options: a,
  transportistasOpts: t,
  vendedoresMaestro: s,
  onLookup: r,
  onLookupOrange: n,
  canRequestReopen: o,
  onOpenReopen: p,
  latestReopenRequest: i
}) {
  var sa, ra;
  const l = be(),
    {
      canal: g,
      nv: u,
      lookupResult: c,
      lookupLoading: v,
      mode: N,
      estado: A,
      tipoDespacho: C,
      transportista: w,
      fechaCompromiso: D,
      fechaAprobacion: O,
      fechaAprobacionReal: E,
      fechaFacturacion: P,
      fechaDespacho: V,
      factura: Y,
      guia: f,
      bultos: I,
      valorFactura: H,
      numeroEnvio: Z,
      urgente: G,
      variosTipo: U,
      variosCliente: Q,
      variosVendedor: ae,
      variosDivision: X,
      variosCcosto: _,
      orangeAssociationRequired: R,
      orangeAssociationNv: q,
      orangeAssociationData: L,
      orangeAssociationLoading: x,
      orangeAssociationError: y,
      incidencia: k,
      estadoIncidencia: d,
      observacionesIncidencia: j,
      errors: S,
      submitResult: B,
      autoFilledDates: K,
      patch: T,
      markAutoFilled: J,
      clearAutoFilled: re,
      recalcCompromiso: ce
    } = l;
  (h.useEffect(() => {
    if (N === 'idle') return;
    const m = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }),
      W = At(A),
      de = A.toUpperCase() === se.SHIPPING.toUpperCase(),
      Be = {},
      $e = [];
    (W && !V && ((Be.fechaDespacho = m), $e.push('fechaDespacho')),
      (de || W) && !P && ((Be.fechaFacturacion = m), $e.push('fechaFacturacion')),
      $e.length > 0 && (T(Be), J($e)));
  }, [A, N]),
    h.useEffect(() => {
      N !== 'idle' && ce();
    }, [E, N]));
  const oe = h.useMemo(() => {
      const m = new Map();
      return (s.forEach((W) => m.set(W.nombre.trim().toLowerCase(), W)), m);
    }, [s]),
    b = (m) => {
      const W = oe.get(m.trim().toLowerCase());
      T(
        W
          ? {
              variosVendedor: m,
              variosDivision: W.division || '',
              variosCcosto: W.centro_costo || ''
            }
          : { variosVendedor: m }
      );
    },
    $ = ((sa = He.find((m) => m.value === g)) == null ? void 0 : sa.color) || ne,
    F = {
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
    }[g] || {
      eyebrow: 'Canal',
      title: 'Operación',
      hint: 'Selecciona un canal para comenzar.',
      tone: 'from-slate-500/10 to-slate-500/10 border-slate-200',
      badge: 'Selección',
      color: ne
    },
    z = c
      ? c.found
        ? {
            container: 'bg-blue-50 text-blue-700 border-blue-200',
            iconWrap: 'bg-blue-100 text-blue-700',
            title: 'NV encontrada',
            description: `Fila ${c.row} lista para actualizar en el panel.`
          }
        : {
            container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            iconWrap: 'bg-emerald-100 text-emerald-700',
            title: 'NV nueva',
            description: 'No existe una coincidencia previa; el flujo continúa como creación.'
          }
      : null,
    Le =
      (c == null ? void 0 : c.found) &&
      ((ra = c == null ? void 0 : c.data) == null ? void 0 : ra.estado) === 'Entregado';
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
                            children: [e.jsx(Ge, { size: 12 }), 'Identificación']
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
                            className: `inline-block h-2.5 w-2.5 rounded-full ${N === 'idle' ? 'bg-slate-300' : c != null && c.found ? 'bg-blue-500' : 'bg-emerald-500'}`
                          }),
                          N === 'idle'
                            ? 'Pendiente de consulta'
                            : c != null && c.found
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
                          e.jsx($a, { size: 15, className: 'text-slate-400' }),
                          e.jsx('label', {
                            className:
                              'text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em]',
                            children: 'Canal operativo'
                          })
                        ]
                      }),
                      e.jsx(Rt, {
                        items: He,
                        active: g,
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
                                  const W = m.target.value;
                                  !W.trim() && N !== 'idle'
                                    ? T({
                                        nv: W,
                                        mode: 'idle',
                                        lookupResult: null,
                                        submitResult: null,
                                        errors: []
                                      })
                                    : T({ nv: W });
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
                        disabled: v || !u.trim(),
                        className:
                          'h-14 min-w-[152px] px-5 rounded-2xl text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_16px_30px_-18px_rgba(24,24,27,0.8)] inline-flex items-center justify-center gap-2',
                        style: {
                          background: `linear-gradient(135deg, ${F.color} 0%, #18181b 100%)`
                        },
                        children: v
                          ? e.jsx('span', {
                              className:
                                'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                            })
                          : e.jsxs(e.Fragment, {
                              children: [e.jsx(Pa, { size: 16 }), ' Buscar N.V.']
                            })
                      })
                    ]
                  }),
                  c &&
                    e.jsx('div', {
                      className: 'mt-4 anim-fade-up',
                      children: e.jsxs('div', {
                        className: `rounded-[1.35rem] border p-4 ${z.container}`,
                        children: [
                          e.jsxs('div', {
                            className:
                              'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-start gap-3',
                                children: [
                                  e.jsx('div', {
                                    className: `h-10 w-10 rounded-2xl flex items-center justify-center ${z.iconWrap}`,
                                    children: c.found
                                      ? e.jsx(Va, { size: 18 })
                                      : e.jsx(Ge, { size: 18 })
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx('div', {
                                        className: 'text-sm font-black',
                                        children: z.title
                                      }),
                                      e.jsx('div', {
                                        className: 'text-xs mt-0.5 opacity-90',
                                        children: z.description
                                      })
                                    ]
                                  })
                                ]
                              }),
                              e.jsx('div', {
                                className:
                                  'rounded-full border border-current/20 bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
                                children: c.found ? 'Actualizar' : 'Crear'
                              })
                            ]
                          }),
                          (() => {
                            const m = c.found ? c.data : c.autoFill;
                            if (!m) return null;
                            const W = [
                              { l: 'Cliente', v: m.cliente },
                              { l: 'Vendedor', v: m.vendedor },
                              { l: 'C. Costo', v: m.ccosto || m.centro_costo },
                              { l: 'División', v: m.division }
                            ].filter((de) => de.v);
                            return W.length === 0
                              ? null
                              : e.jsx('div', {
                                  className: 'mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5',
                                  children: W.map((de) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className:
                                          'rounded-2xl border border-white/60 bg-white/70 px-3.5 py-3',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[10px] uppercase tracking-[0.16em] opacity-60 font-bold',
                                            children: de.l
                                          }),
                                          e.jsx('div', {
                                            className: 'text-[13px] mt-1 font-semibold truncate',
                                            children: de.v
                                          })
                                        ]
                                      },
                                      de.l
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
                className: `relative rounded-[1.5rem] border bg-gradient-to-br ${F.tone} p-4 sm:p-5`,
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500',
                    children: F.eyebrow
                  }),
                  e.jsxs('div', {
                    className: 'mt-2 flex items-center justify-between gap-3',
                    children: [
                      e.jsx('div', {
                        className: 'text-2xl font-black text-slate-900',
                        children: F.title
                      }),
                      e.jsx('div', {
                        className:
                          'rounded-full border bg-white/80 px-3 py-1 text-[11px] font-bold',
                        style: { borderColor: `${F.color}33`, color: F.color },
                        children: F.badge
                      })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'mt-3 text-sm leading-6 text-slate-600',
                    children: F.hint
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
      g === 'ptm' &&
        R &&
        N !== 'idle' &&
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
                      children: [e.jsx(na, { size: 12 }), 'Asociación comercial']
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
                      value: q,
                      onChange: (m) =>
                        T({
                          orangeAssociationNv: m.target.value,
                          orangeAssociationError: '',
                          orangeAssociationData: null
                        }),
                      onKeyDown: (m) => m.key === 'Enter' && (n == null ? void 0 : n(q)),
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
                  onClick: () => (n == null ? void 0 : n(q)),
                  disabled: x || !q.trim(),
                  className:
                    'h-11 px-5 rounded-xl bg-amber-500 text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2',
                  children: [
                    x
                      ? e.jsx('span', {
                          className:
                            'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                        })
                      : e.jsx(na, { size: 15 }),
                    'Validar asociación'
                  ]
                })
              ]
            }),
            y &&
              e.jsxs('div', {
                className:
                  'mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2',
                children: [e.jsx(je, { size: 16 }), y]
              }),
            L &&
              e.jsx('div', {
                className: 'mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3',
                children: [
                  { label: 'Cliente Orange', value: L.cliente || '—' },
                  { label: 'Vendedor', value: L.vendedor || '—' },
                  { label: 'Centro costo', value: L.ccosto || '—' },
                  { label: 'División', value: L.division || '—' }
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
      Le &&
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
                      children: [e.jsx(je, { size: 12 }), 'N.V. entregada bloqueada']
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
                o &&
                  e.jsx('button', {
                    type: 'button',
                    onClick: p,
                    className:
                      'h-11 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-sm hover:bg-orange-600',
                    children: 'Solicitar reapertura'
                  })
              ]
            }),
            i &&
              e.jsxs('div', {
                className: 'mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3',
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700',
                    children: 'Solicitud pendiente'
                  }),
                  e.jsx('div', {
                    className: 'mt-1 text-sm font-semibold text-slate-800',
                    children: i.motivo
                  }),
                  e.jsxs('div', {
                    className: 'mt-1 text-xs text-slate-500',
                    children: [
                      'Solicitada por ',
                      i.solicitada_por_nombre || 'Usuario',
                      ' el ',
                      String(i.solicitada_at || '').slice(0, 10) || '—'
                    ]
                  })
                ]
              })
          ]
        }),
      g === 'varios' &&
        N === 'create' &&
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
                      value: Q,
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
                              value: ae,
                              onChange: (m) => b(m.target.value),
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
                          value: ae,
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
                      value: X,
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
                      value: _,
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
      N !== 'idle' &&
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
                  children: e.jsx(ta, {
                    items: Ct.map((m) => ({ value: m, label: m, color: Oe(m) })),
                    active: A,
                    onSelect: (m) => T({ estado: m })
                  })
                }),
                e.jsxs('button', {
                  type: 'button',
                  onClick: () => T({ urgente: !G }),
                  className: `w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-3.5 border-2 transition-all ${G ? 'bg-red-50 border-red-400 shadow-sm shadow-red-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`,
                  children: [
                    e.jsxs('span', {
                      className: 'flex items-center gap-2.5',
                      children: [
                        e.jsx('span', {
                          className: `text-xl transition-transform ${G ? 'scale-110' : 'opacity-40 grayscale'}`,
                          children: '🚨'
                        }),
                        e.jsxs('span', {
                          className: 'flex flex-col items-start',
                          children: [
                            e.jsx('span', {
                              className: `text-sm font-bold ${G ? 'text-red-600' : 'text-gray-700'}`,
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
                      className: `relative w-12 h-6 rounded-full transition-colors shrink-0 ${G ? 'bg-red-500' : 'bg-gray-300'}`,
                      children: e.jsx('span', {
                        className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${G ? 'translate-x-6' : ''}`
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
                          value: C,
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
                              value: w,
                              onChange: (m) => T({ transportista: m.target.value }),
                              className: 'field-input',
                              children: [
                                e.jsx('option', { value: '', children: '— Seleccionar —' }),
                                (w && !t.includes(w) ? [w, ...t] : t).map((m) =>
                                  e.jsx('option', { value: m, children: m }, m)
                                )
                              ]
                            })
                          : e.jsx('input', {
                              type: 'text',
                              value: w,
                              onChange: (m) => T({ transportista: m.target.value }),
                              placeholder: 'Nombre transportista',
                              className: 'field-input'
                            })
                      ]
                    }),
                    N === 'update' &&
                      e.jsxs('div', {
                        children: [
                          e.jsxs('label', {
                            className: 'field-label',
                            children: [
                              'Fecha Compromiso ',
                              K.has('fechaCompromiso')
                                ? e.jsx('span', {
                                    className: 'ml-1 normal-case',
                                    style: { color: ne },
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
                            value: D,
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
                            K.has('fechaFacturacion') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: ne },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: P,
                          onChange: (m) => {
                            (T({ fechaFacturacion: m.target.value }), re('fechaFacturacion'));
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
                            K.has('fechaDespacho') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: ne },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: V,
                          onChange: (m) => {
                            (T({ fechaDespacho: m.target.value }), re('fechaDespacho'));
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
                          value: f,
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
                              value: H,
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
                          value: Z,
                          onChange: (m) => T({ numeroEnvio: m.target.value }),
                          className: 'field-input'
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            N === 'update' &&
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
                    children: _a.map((m) => {
                      const W = k === m,
                        de =
                          m === 'PROBLEMAS DE DIRECCIÓN'
                            ? xa
                            : m === 'PROBLEMAS DE TRANSPORTE'
                              ? fa
                              : je;
                      return e.jsxs(
                        'button',
                        {
                          type: 'button',
                          onClick: () =>
                            T({
                              incidencia: W ? '' : m,
                              estadoIncidencia: W ? 'ABIERTA' : d || 'ABIERTA'
                            }),
                          className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${W ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                          children: [e.jsx(de, { size: 14 }), m]
                        },
                        m
                      );
                    })
                  }),
                  k &&
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
                              value: d,
                              onChange: (m) => T({ estadoIncidencia: m.target.value }),
                              className: 'field-input',
                              children: wa.map((m) => e.jsx('option', { value: m, children: m }, m))
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
                              value: k,
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
                              value: j,
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
                children: S.map((m, W) =>
                  e.jsxs(
                    'p',
                    {
                      className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                      children: [e.jsx('span', { children: '⚠' }), m]
                    },
                    W
                  )
                )
              }),
            B &&
              !B.success &&
              e.jsx('div', {
                className: 'bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up',
                children: e.jsxs('p', {
                  className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                  children: [e.jsx('span', { children: '⚠' }), B.message]
                })
              })
          ]
        })
    ]
  });
}
function Dt({ toast: a }) {
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
function Ot(a) {
  const t = a.nvs.map((r) => r.nv).join(' · '),
    s = a.fecha_comprometida ? ` · Compromiso ${a.fecha_comprometida}` : ' · sin fecha';
  return `${a.ticket} · NV ${t || '—'}${s}`;
}
function Pe(a, t = {}) {
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
function Tt({ operador: a }) {
  const [t, s] = h.useState([]),
    [r, n] = h.useState(!0),
    [o, p] = h.useState(''),
    [i, l] = h.useState(''),
    [g, u] = h.useState(!1),
    [c, v] = h.useState(''),
    [N, A] = h.useState(!1),
    [C, w] = h.useState([]),
    [D, O] = h.useState(''),
    [E, P] = h.useState(''),
    [V, Y] = h.useState(!1),
    f = h.useCallback(async () => {
      (n(!0), p(''));
      try {
        s(await _t());
      } catch (_) {
        p((_ == null ? void 0 : _.message) || 'Error al cargar consolidados');
      } finally {
        n(!1);
      }
    }, []);
  h.useEffect(() => {
    f();
  }, [f]);
  const I = (_) => {
      (l(_), setTimeout(() => l(''), 3e3));
    },
    H = async () => {
      const _ = c.trim();
      if (_) {
        if (C.some((R) => R.nv === _)) {
          I(`La NV ${_} ya está en la lista`);
          return;
        }
        A(!0);
        try {
          const R = await da(_);
          if (!R) {
            I(`NV ${_} no existe en la base`);
            return;
          }
          (w((q) => [...q, { nv: R.nv, canal: R.canal, cliente: R.cliente }]), v(''));
        } finally {
          A(!1);
        }
      }
    },
    Z = async () => {
      if (C.length === 0) {
        I('Agrega al menos una NV');
        return;
      }
      Y(!0);
      const _ = await Ce({
        fecha_comprometida: D || null,
        observacion: E || null,
        created_by: a || null,
        nvs: C
      });
      if ((Y(!1), !_.ok)) {
        I(_.error || 'Error al crear');
        return;
      }
      (I(`✓ ${_.ticket || 'Consolidado'} creado`), w([]), O(''), P(''), u(!1), f());
    },
    G = async (_, R) => {
      const q = await Ce(Pe(_, { fecha_comprometida: R || null }));
      if (!q.ok) {
        I(q.error || 'Error');
        return;
      }
      s((L) => L.map((x) => (x.id === _.id ? { ...x, fecha_comprometida: R || null } : x)));
    },
    U = async (_) => {
      const R = _.estado === 'cerrado' ? 'abierto' : 'cerrado',
        q = await Ce(Pe(_, { estado: R }));
      if (!q.ok) {
        I(q.error || 'Error');
        return;
      }
      s((L) => L.map((x) => (x.id === _.id ? { ...x, estado: R } : x)));
    },
    Q = async (_) => {
      if (!confirm(`¿Eliminar ${_.ticket}? Las NVs volverán a medirse con las 48 hrs.`)) return;
      const R = await wt(_.id);
      if (!R.ok) {
        I(R.error || 'Error');
        return;
      }
      (I(`${_.ticket} eliminado`), s((q) => q.filter((L) => L.id !== _.id)));
    },
    ae = async (_, R) => {
      const q = _.nvs
          .filter((x) => x.id !== R)
          .map((x) => ({ nv: x.nv, canal: x.canal, cliente: x.cliente })),
        L = await Ce(Pe(_, { nvs: q }));
      if (!L.ok) {
        I(L.error || 'Error');
        return;
      }
      s((x) => x.map((y) => (y.id === _.id ? { ...y, nvs: y.nvs.filter((k) => k.id !== R) } : y)));
    },
    X = async (_, R, q) => {
      const L = R.trim();
      if (!L) return;
      const x = await da(L);
      if (!x) {
        I(`NV ${L} no existe`);
        return;
      }
      const y = [
          ..._.nvs.map((d) => ({ nv: d.nv, canal: d.canal, cliente: d.cliente })),
          { nv: x.nv, canal: x.canal, cliente: x.cliente }
        ],
        k = await Ce(Pe(_, { nvs: y }));
      if (!k.ok) {
        I(k.error || 'Error');
        return;
      }
      (q(), f());
    };
  return e.jsxs('div', {
    className: 'anim-fade-up',
    children: [
      i &&
        e.jsx('div', {
          className:
            'fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] shadow-lg',
          children: i
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
          !g &&
            e.jsx('button', {
              onClick: () => u(!0),
              className: 'px-3 py-2 rounded-lg text-white text-[13px] font-semibold',
              style: { background: ne },
              children: '+ Nuevo consolidado'
            })
        ]
      }),
      g &&
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
                  value: c,
                  onChange: (_) => v(_.target.value),
                  onKeyDown: (_) => {
                    _.key === 'Enter' && (_.preventDefault(), H());
                  },
                  placeholder: 'N° NV (ej. 5646)',
                  className: 'inp flex-1 min-w-[160px]'
                }),
                e.jsx('button', {
                  onClick: H,
                  disabled: N,
                  className:
                    'px-3 py-2 rounded-lg bg-gray-800 text-white text-[13px] font-medium disabled:opacity-50',
                  children: N ? 'Validando…' : 'Agregar NV'
                })
              ]
            }),
            C.length > 0 &&
              e.jsx('div', {
                className: 'flex flex-wrap gap-1.5 mb-3',
                children: C.map((_) =>
                  e.jsxs(
                    'span',
                    {
                      className:
                        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-200 text-[12px]',
                      children: [
                        e.jsx('b', { children: _.nv }),
                        ' ',
                        e.jsx('span', {
                          className: 'text-gray-400',
                          children: _.cliente || _.canal
                        }),
                        e.jsx('button', {
                          onClick: () => w((R) => R.filter((q) => q.nv !== _.nv)),
                          className: 'text-gray-400 hover:text-red-600',
                          children: '×'
                        })
                      ]
                    },
                    _.nv
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
                      value: D,
                      onChange: (_) => O(_.target.value),
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
                      onChange: (_) => P(_.target.value),
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
                  onClick: Z,
                  disabled: V || C.length === 0,
                  className:
                    'px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-50',
                  style: { background: ne },
                  children: V ? 'Creando…' : 'Crear consolidado'
                }),
                e.jsx('button', {
                  onClick: () => {
                    (u(!1), w([]), O(''), P(''), v(''));
                  },
                  className:
                    'px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-[13px]',
                  children: 'Cancelar'
                })
              ]
            })
          ]
        }),
      o && e.jsx('p', { className: 'text-[13px] text-red-600 mb-3', children: o }),
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
              children: t.map((_) =>
                e.jsx(
                  It,
                  { c: _, onSetFecha: G, onToggle: U, onEliminar: Q, onQuitarNv: ae, onAddNv: X },
                  _.id
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
function It({ c: a, onSetFecha: t, onToggle: s, onEliminar: r, onQuitarNv: n, onAddNv: o }) {
  const [p, i] = h.useState(''),
    l = a.estado === 'cerrado';
  return e.jsxs('div', {
    className: `rounded-xl border p-4 ${l ? 'border-gray-200 bg-gray-50/60' : 'border-gray-200 bg-white'}`,
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between gap-2 flex-wrap mb-2',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsx('span', {
                className: 'px-2 py-0.5 rounded-lg text-white text-[12px] font-bold',
                style: { background: l ? '#6b7280' : ne },
                children: a.ticket
              }),
              e.jsx('span', {
                className: `text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${l ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`,
                children: l ? 'Cerrado' : 'Abierto'
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
                    onChange: (g) => t(a, g.target.value),
                    className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg'
                  })
                ]
              }),
              e.jsx('button', {
                onClick: () => s(a),
                className:
                  'text-[12px] px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50',
                children: l ? 'Reabrir' : 'Cerrar'
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
            : a.nvs.map((g) =>
                e.jsxs(
                  'span',
                  {
                    className:
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px]',
                    children: [
                      e.jsx('b', { children: g.nv }),
                      ' ',
                      e.jsx('span', { className: 'text-gray-400', children: g.cliente || g.canal }),
                      e.jsx('button', {
                        onClick: () => g.id && n(a, g.id),
                        className: 'text-gray-400 hover:text-red-600',
                        children: '×'
                      })
                    ]
                  },
                  g.id
                )
              )
      }),
      e.jsxs('div', {
        className: 'flex gap-2 items-center',
        children: [
          e.jsx('input', {
            value: p,
            onChange: (g) => i(g.target.value),
            onKeyDown: (g) => {
              g.key === 'Enter' && (g.preventDefault(), o(a, p, () => i('')));
            },
            placeholder: '+ Agregar NV',
            className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg flex-1 max-w-[200px]'
          }),
          e.jsx('button', {
            onClick: () => o(a, p, () => i('')),
            className: 'text-[12px] px-2 py-1 rounded-lg bg-gray-800 text-white',
            children: 'Agregar'
          })
        ]
      }),
      e.jsx('p', {
        className: 'mt-2 text-[11px] text-gray-400 font-mono select-all',
        children: Ot(a)
      })
    ]
  });
}
const ve = (a) => (a ? String(a).slice(0, 10) : ''),
  $t = ['Entregado', 'En Proceso', 'Shipping', 'Currier', 'En Ruta'],
  ma = 60,
  Pt = 80;
function Vt(a, t) {
  const s = new Date(a);
  let r = 0;
  const n = s.getDay();
  for (n === 0 ? s.setDate(s.getDate() + 1) : n === 6 && s.setDate(s.getDate() + 2); r < t;) {
    s.setDate(s.getDate() + 1);
    const o = s.getDay();
    o !== 0 && o !== 6 && r++;
  }
  return s;
}
function Ft(a, t) {
  const s = t || a;
  if (!s) return '';
  const r = new Date(s + 'T12:00:00');
  if (isNaN(r.getTime())) return '';
  const n = Vt(r, 2);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}
const Ue = [
  { label: 'Registrada', dateKey: 'fecha_registro_nv' },
  { label: 'Aprobada', dateKey: 'fecha_aprobacion' },
  { label: 'En Proceso', dateKey: 'fecha_en_proceso' },
  { label: 'Shipping', dateKey: 'fecha_shipping' },
  { label: 'Despachada', dateKey: 'fecha_despacho' },
  { label: 'En Ruta', dateKey: 'fecha_en_ruta' },
  { label: 'Entregada', dateKey: 'fecha_entregado' }
];
function Mt(a, t) {
  if (!a || !t) return null;
  const s = new Date(a).getTime(),
    r = new Date(t).getTime();
  if (isNaN(s) || isNaN(r)) return null;
  const n = Math.round((r - s) / 864e5);
  return n >= 0 ? n : null;
}
function qt({ data: a }) {
  const t = Ue.map((r) => ve(a[r.dateKey]));
  let s = -1;
  for (let r = t.length - 1; r >= 0; r--)
    if (t[r]) {
      s = r;
      break;
    }
  return e.jsx('div', {
    className: 'flex flex-col gap-0',
    children: Ue.map((r, n) => {
      const o = t[n],
        p = !!o,
        i = n === s,
        l = n > 0 ? t[n - 1] : '',
        g = n > 0 && o && l ? Mt(l, o) : null,
        u = g !== null && g > 3;
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
                    style: { background: p ? (u ? '#ef4444' : '#22c55e') : '#e5e7eb' }
                  }),
                n === 0 && e.jsx('div', { className: 'h-1' }),
                e.jsx('div', {
                  className: `rounded-full shrink-0 flex items-center justify-center transition-all ${i ? 'w-5 h-5 ring-4 ring-orange-100' : p ? 'w-4 h-4' : 'w-3.5 h-3.5 border-2 border-gray-300'}`,
                  style: { background: i ? '#f57c00' : p ? '#22c55e' : 'transparent' },
                  children:
                    p &&
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
                n < Ue.length - 1 &&
                  e.jsx('div', {
                    className: 'w-0.5 flex-1 min-h-[8px]',
                    style: { background: p && t[n + 1] ? '#22c55e' : '#e5e7eb' }
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
                      className: `text-[12px] font-semibold ${i ? 'text-orange-600' : p ? 'text-gray-800' : 'text-gray-400'}`,
                      children: r.label
                    }),
                    g !== null &&
                      e.jsxs('span', {
                        className: `text-[10px] font-bold px-1.5 py-0.5 rounded-full ${u ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`,
                        children: [g, 'd']
                      })
                  ]
                }),
                o &&
                  e.jsx('span', { className: 'text-[11px] text-gray-400 font-medium', children: o })
              ]
            })
          ]
        },
        r.label
      );
    })
  });
}
function Lt({
  item: a,
  puedeEscribir: t,
  puedeEliminar: s,
  puedeAprobarReapertura: r,
  opts: n,
  onClose: o,
  onSaved: p,
  onDeleted: i
}) {
  const [l, g] = h.useState(null),
    [u, c] = h.useState(!0),
    [v, N] = h.useState({}),
    [A, C] = h.useState(!1),
    [w, D] = h.useState(!1),
    [O, E] = h.useState(!1),
    [P, V] = h.useState(null),
    [Y, f] = h.useState([]),
    [I, H] = h.useState(!1),
    [Z, G] = h.useState(''),
    [U, Q] = h.useState(''),
    [ae, X] = h.useState(!1),
    [_, R] = h.useState(!1),
    q = h.useMemo(
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
  h.useEffect(() => {
    let b = !0;
    return (
      g(q),
      c(!1),
      pt(a.id, { canal: a.canal, nv: a.nv }).then(($) => {
        b && (g($.found ? $.data : null), N({}), c(!1));
      }),
      () => {
        b = !1;
      }
    );
  }, [a, q]);
  const L = h.useCallback(async () => {
    if (!(a != null && a.id)) return (f([]), []);
    H(!0);
    try {
      const b = await Da(a.id);
      return (f(b), b);
    } catch {
      return (f([]), []);
    } finally {
      H(!1);
    }
  }, [a == null ? void 0 : a.id]);
  h.useEffect(() => {
    L();
  }, [L]);
  const x = (b) => (b in v ? v[b] : ((l == null ? void 0 : l[b]) ?? '' ?? '')),
    y = (b, $) => {
      N((F) => {
        const z = { ...F, [b]: $ };
        return (
          b === 'fecha_aprobacion_real' &&
            (z.fecha_compromiso = Ft(ve(l == null ? void 0 : l.fecha_aprobacion), $)),
          z
        );
      });
    },
    k = h.useMemo(() => {
      const b = {};
      return (
        Object.keys(v).forEach(($) => {
          const F = (l == null ? void 0 : l[$]) ?? '';
          String(v[$] ?? '') !== String(F ?? '') && (b[$] = v[$]);
        }),
        b
      );
    }, [v, l]),
    d = {
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
    j = async () => {
      (C(!0), V(null));
      const b = { id: a.id };
      Object.entries(k).forEach(([F, z]) => {
        b[d[F] || F] = F === 'urgente' ? String(z) === 'true' : z;
      });
      const $ = await ka(b);
      (C(!1),
        $.ok
          ? (V({ success: !0, message: 'Cambios guardados' }),
            p == null ||
              p({
                ...a,
                estado: x('estado') || a.estado,
                transportista: x('transportista'),
                urgente: String(x('urgente')) === 'true'
              }),
            setTimeout(o, 700))
          : V({ success: !1, message: $.message || $.error || 'No se pudo guardar' }));
    },
    S = async () => {
      D(!0);
      const b = await yt(a.id);
      (D(!1),
        b.ok
          ? (Ve.success(`NV ${a.nv} eliminada`), i == null || i(a), o())
          : (V({ success: !1, message: b.error || 'No se pudo eliminar' }), E(!1)));
    },
    B = (n == null ? void 0 : n.transportistas) || [],
    K = String(x('urgente')) === 'true',
    T = Me.includes(x('estado')) || !!x('incidencia'),
    J = Y.find((b) => b.estado === 'PENDIENTE') || null,
    re = (l == null ? void 0 : l.estado) === 'Entregado',
    ce = async () => {
      const b = String(Z || '').trim();
      if (!b) {
        V({ success: !1, message: 'Debes indicar el motivo de la reapertura.' });
        return;
      }
      X(!0);
      const $ = await Oa(a.id, b);
      (X(!1),
        $.ok
          ? (G(''),
            await L(),
            V({ success: !0, message: $.message || 'Solicitud de reapertura enviada.' }))
          : V({
              success: !1,
              message: $.message || $.error || 'No se pudo solicitar la reapertura.'
            }));
    },
    oe = async (b) => {
      if (!(J != null && J.id)) return;
      R(!0);
      const $ = await jt(J.id, b, U);
      if ((R(!1), !$.ok)) {
        V({ success: !1, message: $.message || $.error || 'No se pudo resolver la solicitud.' });
        return;
      }
      const F = await Te(a.canal, a.nv);
      (F.found &&
        (g(F.data),
        N({}),
        p == null ||
          p({
            ...a,
            estado: F.data.estado || a.estado,
            transportista: F.data.transportista || a.transportista,
            urgente: String(F.data.urgente) === 'true' || F.data.urgente === !0,
            reabierta: F.data.reabierta === !0,
            motivoReapertura: F.data.motivo_reapertura || ''
          })),
        Q(''),
        await L(),
        V({ success: !0, message: $.message || 'Solicitud resuelta correctamente.' }));
    };
  return Ye.createPortal(
    e.jsxs('div', {
      className: 'panel-portal fixed inset-0 z-[120] flex justify-end',
      onClick: o,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (b) => b.stopPropagation(),
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
                          style: { background: Oe(a.estado) }
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
                  onClick: o,
                  className:
                    'w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 text-lg',
                  children: '✕'
                })
              ]
            }),
            e.jsx('div', {
              className: 'flex-1 overflow-y-auto min-h-0',
              children:
                !l && u
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
                  : l
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
                                  { l: 'Cliente', v: l.cliente },
                                  { l: 'Vendedor', v: l.vendedor },
                                  { l: 'C. Costo', v: l.ccosto || l.centro_costo },
                                  { l: 'División', v: l.division }
                                ]
                                  .filter((b) => b.v)
                                  .map((b) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className: 'bg-gray-50 rounded-lg px-3 py-2',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[9px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5',
                                            children: b.l
                                          }),
                                          e.jsx('div', {
                                            className:
                                              'text-[13px] text-gray-800 font-medium truncate',
                                            title: b.v || '',
                                            children: b.v
                                          })
                                        ]
                                      },
                                      b.l
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
                                children: e.jsx(qt, { data: l })
                              })
                            ]
                          }),
                          (l == null ? void 0 : l.reabierta) &&
                            e.jsx('section', {
                              className:
                                'rounded-xl border border-orange-200 bg-orange-50/80 px-4 py-3',
                              children: e.jsxs('div', {
                                className: 'flex items-start gap-3',
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'mt-0.5 h-9 w-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center',
                                    children: e.jsx(ha, { size: 16 })
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
                                        children: l.motivo_reapertura || 'Sin motivo informado.'
                                      }),
                                      l.fecha_reapertura &&
                                        e.jsxs('div', {
                                          className: 'mt-1 text-xs text-slate-500',
                                          children: ['Aprobada el ', ve(l.fecha_reapertura)]
                                        })
                                    ]
                                  })
                                ]
                              })
                            }),
                          re
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
                                        : J
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
                                                            children: J.motivo
                                                          }),
                                                          e.jsxs('div', {
                                                            className:
                                                              'mt-1 text-xs text-slate-500',
                                                            children: [
                                                              'Solicitada por',
                                                              ' ',
                                                              J.solicitada_por_nombre || 'Usuario',
                                                              ' el',
                                                              ' ',
                                                              ve(J.solicitada_at)
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
                                                        onChange: (b) => Q(b.target.value),
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
                                                            onClick: () => oe(!0),
                                                            disabled: _,
                                                            className:
                                                              'rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50',
                                                            children: _
                                                              ? 'Procesando...'
                                                              : 'Aprobar y reabrir'
                                                          }),
                                                          e.jsx('button', {
                                                            type: 'button',
                                                            onClick: () => oe(!1),
                                                            disabled: _,
                                                            className:
                                                              'rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 disabled:opacity-50',
                                                            children: _
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
                                                    value: Z,
                                                    onChange: (b) => G(b.target.value),
                                                    className: 'field-input min-h-[96px] resize-y',
                                                    placeholder:
                                                      'Motivo obligatorio de reapertura: por qué se necesita devolver esta N.V. a En Proceso...'
                                                  }),
                                                  e.jsx('button', {
                                                    type: 'button',
                                                    onClick: ce,
                                                    disabled: ae,
                                                    className:
                                                      'w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50',
                                                    children: ae
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
                                          children: e.jsx(ta, {
                                            items: Ea.map((b) => ({
                                              value: b,
                                              label: b,
                                              color: Oe(b)
                                            })),
                                            active: x('estado'),
                                            onSelect: (b) => y('estado', b)
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
                                                  value: x('tipo_despacho'),
                                                  onChange: (b) =>
                                                    y('tipo_despacho', b.target.value),
                                                  className: 'field-input',
                                                  children: [
                                                    e.jsx('option', { value: '', children: '—' }),
                                                    (
                                                      (n == null ? void 0 : n.tiposDespacho) || Ca
                                                    ).map((b) =>
                                                      e.jsx('option', { value: b, children: b }, b)
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
                                                B.length > 0
                                                  ? e.jsxs('select', {
                                                      value: x('transportista'),
                                                      onChange: (b) =>
                                                        y('transportista', b.target.value),
                                                      className: 'field-input',
                                                      children: [
                                                        e.jsx('option', {
                                                          value: '',
                                                          children: '—'
                                                        }),
                                                        (x('transportista') &&
                                                        !B.includes(x('transportista'))
                                                          ? [x('transportista'), ...B]
                                                          : B
                                                        ).map((b) =>
                                                          e.jsx(
                                                            'option',
                                                            { value: b, children: b },
                                                            b
                                                          )
                                                        )
                                                      ]
                                                    })
                                                  : e.jsx('input', {
                                                      type: 'text',
                                                      value: x('transportista'),
                                                      onChange: (b) =>
                                                        y('transportista', b.target.value),
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
                                              onClick: () => y('urgente', K ? 'false' : 'true'),
                                              className: `relative w-11 h-6 rounded-full transition-colors ${K ? 'bg-red-500' : 'bg-gray-200'}`,
                                              children: e.jsx('span', {
                                                className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${K ? 'translate-x-5' : ''}`
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
                                                  value: x('fecha_aprobacion_real'),
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
                                                        color: x('fecha_compromiso')
                                                          ? ne
                                                          : '#9ca3af'
                                                      },
                                                      children: '(auto)'
                                                    })
                                                  ]
                                                }),
                                                e.jsx('input', {
                                                  type: 'date',
                                                  value: x('fecha_compromiso'),
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
                                                  value: x('fecha_facturacion'),
                                                  onChange: (b) =>
                                                    y('fecha_facturacion', b.target.value),
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
                                                  value: x('fecha_despacho'),
                                                  onChange: (b) =>
                                                    y('fecha_despacho', b.target.value),
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
                                                  value: x('factura'),
                                                  onChange: (b) => y('factura', b.target.value),
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
                                                  value: x('guia'),
                                                  onChange: (b) => y('guia', b.target.value),
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
                                                  value: x('numero_envio'),
                                                  onChange: (b) =>
                                                    y('numero_envio', b.target.value),
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
                                                  value: x('bultos'),
                                                  onChange: (b) => y('bultos', b.target.value),
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
                                                      value: x('valor_factura'),
                                                      onChange: (b) =>
                                                        y(
                                                          'valor_factura',
                                                          b.target.value.replace(/[^0-9.]/g, '')
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
                                            children: _a.map((b) => {
                                              const $ = x('incidencia') === b,
                                                F =
                                                  b === 'PROBLEMAS DE DIRECCIÓN'
                                                    ? xa
                                                    : b === 'PROBLEMAS DE TRANSPORTE'
                                                      ? fa
                                                      : je;
                                              return e.jsxs(
                                                'button',
                                                {
                                                  type: 'button',
                                                  onClick: () => {
                                                    const z = !$;
                                                    (y('incidencia', z ? b : ''),
                                                      y(
                                                        'estado_incidencia',
                                                        (z && x('estado_incidencia')) || 'ABIERTA'
                                                      ),
                                                      z || y('observaciones_incidencia', ''));
                                                  },
                                                  className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${$ ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                                                  children: [e.jsx(F, { size: 14 }), b]
                                                },
                                                b
                                              );
                                            })
                                          }),
                                          x('incidencia') &&
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
                                                      value: x('estado_incidencia') || 'ABIERTA',
                                                      onChange: (b) =>
                                                        y('estado_incidencia', b.target.value),
                                                      className: 'field-input',
                                                      children: wa.map((b) =>
                                                        e.jsx(
                                                          'option',
                                                          { value: b, children: b },
                                                          b
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
                                                      value: x('observaciones_incidencia'),
                                                      onChange: (b) =>
                                                        y(
                                                          'observaciones_incidencia',
                                                          b.target.value
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
                          P &&
                            e.jsxs('div', {
                              className: `rounded-xl px-3.5 py-3 text-[13px] ${P.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`,
                              children: [P.success ? '✓ ' : '⚠ ', P.message]
                            })
                        ]
                      })
                    : e.jsx('div', {
                        className: 'py-20 text-center text-sm text-gray-400',
                        children: 'No se pudieron cargar los datos de esta NV.'
                      })
            }),
            l &&
              ((t && !re) || s) &&
              e.jsxs('div', {
                className: 'shrink-0 bg-white border-t border-gray-200 p-4 space-y-2',
                children: [
                  t &&
                    !re &&
                    Object.keys(k).length > 0 &&
                    e.jsx('button', {
                      onClick: j,
                      disabled: A,
                      className:
                        'w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60',
                      style: { background: ne },
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
                        : `Guardar ${Object.keys(k).length} cambio${Object.keys(k).length !== 1 ? 's' : ''}`
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
                                  disabled: w,
                                  className:
                                    'flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60',
                                  children: w ? 'Eliminando…' : 'Sí, eliminar'
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
const Bt = h.memo(function ({ i: t, onOpen: s }) {
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
              style: { background: Oe(t.estado) }
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
function zt({ puedeEscribir: a, puedeEliminar: t, puedeAprobarReapertura: s }) {
  const [r, n] = h.useState([]),
    [o, p] = h.useState(!0),
    [i, l] = h.useState('Todos'),
    [g, u] = h.useState(''),
    [c, v] = h.useState(null),
    [N, A] = h.useState([]),
    [C, w] = h.useState(!1),
    [D, O] = h.useState(null),
    [E, P] = h.useState(null),
    [V, Y] = h.useState(!1),
    [f, I] = h.useState(ma),
    H = h.useRef(null),
    Z = h.useRef(0),
    G = h.useRef(''),
    U = h.useRef(null),
    Q = h.useRef(null);
  h.useEffect(() => {
    G.current = g;
  }, [g]);
  const ae = h.useCallback((x = !1) => {
    (U.current && (clearTimeout(U.current), (U.current = null)),
      p(!0),
      ze({ force: x, full: !1, limit: 400 })
        .then((y) => {
          (n(y),
            p(!1),
            (U.current = setTimeout(() => {
              (typeof document < 'u' && document.hidden) ||
                G.current.trim().length >= 2 ||
                ze({ force: x, full: !0 })
                  .then((k) => {
                    if (G.current.trim().length >= 2) {
                      Q.current = k;
                      return;
                    }
                    n((d) => (k.length >= d.length ? k : d));
                  })
                  .catch(() => {});
            }, 1200)));
        })
        .catch(() => {
          (n([]), p(!1));
        }));
  }, []);
  h.useEffect(
    () => (
      ae(),
      () => {
        U.current && clearTimeout(U.current);
      }
    ),
    [ae]
  );
  const X = g.trim().length >= 2;
  (h.useEffect(() => {
    const x = g.trim();
    if (x.length < 2) {
      if ((A([]), Q.current)) {
        const y = Q.current;
        ((Q.current = null), n((k) => (y.length >= k.length ? y : k)));
      }
      U.current ||
        (U.current = setTimeout(() => {
          G.current.trim().length >= 2 ||
            ze({ full: !0 })
              .then((y) => {
                n((k) => (y.length >= k.length ? y : k));
              })
              .catch(() => {})
              .finally(() => {
                U.current = null;
              });
        }, 400));
      return;
    }
    A(ct(r, x, { limit: 120 }));
  }, [g, r]),
    h.useEffect(() => {
      const x = g.trim();
      if (x.length < 2) {
        (v(null), w(!1));
        return;
      }
      w(!0);
      const y = Z.current + 1;
      Z.current = y;
      const k = setTimeout(() => {
        it(x, { limit: 120 })
          .then((d) => {
            Z.current === y && v(d);
          })
          .catch(() => {
            Z.current === y && v([]);
          })
          .finally(() => {
            Z.current === y && w(!1);
          });
      }, 220);
      return () => clearTimeout(k);
    }, [g]));
  const _ = h.useCallback(async () => {
      Y(!0);
      try {
        const x = await bt();
        if (!x.length) {
          Ve.warning('No hay operaciones para exportar.');
          return;
        }
        (za({ filename: 'Operaciones_NV', sheets: [{ name: 'Notas de Venta', rows: x }] }),
          Ve.success(`Exportadas ${x.length} N.V. a Excel`));
      } catch (x) {
        Ve.error('No se pudo exportar: ' + ((x == null ? void 0 : x.message) || 'error'));
      } finally {
        Y(!1);
      }
    }, []),
    R = h.useMemo(
      () =>
        X ? dt(N, c || [], g, { limit: 160 }) : r.filter((x) => i === 'Todos' || x.estado === i),
      [X, N, c, g, r, i]
    ),
    q = h.useMemo(() => R.slice(0, f), [R, f]),
    L = h.useMemo(() => {
      const x = {};
      return (
        r.forEach((y) => {
          x[y.estado] = (x[y.estado] || 0) + 1;
        }),
        x
      );
    }, [r]);
  return (
    h.useEffect(() => {
      I((x) => {
        const y = Math.min(R.length, ma);
        return x === y && x <= R.length ? x : y;
      });
    }, [X, i, g, R.length]),
    h.useEffect(() => {
      !D ||
        E ||
        Aa()
          .then(P)
          .catch(() => {});
    }, [D, E]),
    h.useEffect(() => {
      if (f >= R.length) return;
      const x = H.current;
      if (!x) return;
      const y = new IntersectionObserver(
        (k) => {
          k.some((d) => d.isIntersecting) && I((d) => Math.min(d + Pt, R.length));
        },
        { root: null, rootMargin: '240px 0px', threshold: 0 }
      );
      return (y.observe(x), () => y.disconnect());
    }, [f, R.length]),
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
              value: g,
              onChange: (x) => u(x.target.value),
              placeholder: 'Buscar por NV, cliente, guía o factura (cualquier estado)…',
              className:
                'w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none bg-white'
            }),
            C &&
              e.jsx(Ae, {
                size: 16,
                className: 'absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin'
              })
          ]
        }),
        !X &&
          (() => {
            const x = Me.filter((y) => (L[y] || 0) > 0).map((y) => ({
              value: y,
              label: y,
              color: Oe(y),
              count: L[y] || 0
            }));
            return x.length === 0
              ? null
              : e.jsx(ta, {
                  items: x,
                  active: i,
                  inline: !0,
                  onSelect: (y) => l(i === y ? 'Todos' : y)
                });
          })(),
        e.jsxs('div', {
          className: 'flex items-center justify-between gap-2 flex-wrap',
          children: [
            e.jsx('span', {
              className: 'text-[12px] text-gray-400',
              children: X
                ? `${q.length} de ${R.length} resultado${R.length !== 1 ? 's' : ''} · búsqueda en todos los estados`
                : `${q.length} de ${R.length} activas visibles · total activas ${r.length}`
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsxs('button', {
                  onClick: _,
                  disabled: V,
                  className:
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition-colors',
                  title: 'Descargar TODAS las N.V. (todas las columnas) a Excel',
                  children: [
                    V
                      ? e.jsx(Ae, { size: 14, className: 'animate-spin' })
                      : e.jsx(Ma, { size: 14 }),
                    V ? 'Exportando…' : 'Exportar Excel'
                  ]
                }),
                e.jsx('button', {
                  onClick: () => ae(!0),
                  className:
                    'inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-orange-600 font-medium',
                  children: '↻ Recargar'
                })
              ]
            })
          ]
        }),
        (o && !X) || (C && !c)
          ? e.jsx('div', {
              className: 'py-16 flex justify-center',
              children: e.jsx(Ae, { className: 'animate-spin text-orange-500', size: 30 })
            })
          : R.length === 0
            ? e.jsx('div', {
                className: 'text-center py-16 text-gray-400 text-sm',
                children: X
                  ? 'Sin N.V. que coincidan con la búsqueda.'
                  : 'Sin N.V. activas para este filtro.'
              })
            : e.jsxs('div', {
                className: 'space-y-2',
                children: [
                  q.map((x) => e.jsx(Bt, { i: x, onOpen: O }, x.key)),
                  f < R.length &&
                    e.jsx('div', {
                      ref: H,
                      className: 'flex items-center justify-center py-4',
                      children: e.jsxs('div', {
                        className:
                          'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-500 shadow-sm',
                        children: [
                          e.jsx(Ae, { size: 14, className: 'animate-spin text-orange-500' }),
                          'Cargando más N.V...'
                        ]
                      })
                    })
                ]
              }),
        D &&
          e.jsx(Lt, {
            item: D,
            puedeEscribir: a,
            puedeEliminar: t,
            puedeAprobarReapertura: s,
            opts: E,
            onClose: () => O(null),
            onSaved: (x) => {
              (n((y) => y.map((k) => (k.key === x.key ? { ...k, ...x } : k))),
                v((y) => y && y.map((k) => (k.key === x.key ? { ...k, ...x } : k))));
            },
            onDeleted: (x) => {
              (n((y) => y.filter((k) => k.key !== x.key)),
                v((y) => y && y.filter((k) => k.key !== x.key)));
            }
          })
      ]
    })
  );
}
function Ut({ canal: a, nv: t, onClose: s }) {
  var o;
  const r = Ta(),
    n = (((o = He.find((p) => p.value === a)) == null ? void 0 : o.label) || a || '').toUpperCase();
  return Ye.createPortal(
    e.jsxs('div', {
      className: 'fixed inset-0 z-[60] flex items-center justify-center p-4',
      onClick: s,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (p) => p.stopPropagation(),
          className:
            'relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden anim-fade-up',
          children: [
            e.jsxs('div', {
              className: 'px-6 pt-6 pb-5 text-center',
              children: [
                e.jsx('div', {
                  className:
                    'w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-4',
                  children: e.jsx(je, { size: 26 })
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
                  style: { background: ne },
                  children: [e.jsx(La, { size: 16 }), ' Ir a Carga Masiva']
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
function Gt({
  item: a,
  puedeEscribir: t,
  puedeAprobarReapertura: s,
  motivo: r,
  onMotivoChange: n,
  onRequestReopen: o,
  requesting: p,
  onClose: i
}) {
  if (!a) return null;
  const l = a.estado === 'Entregado',
    g = l
      ? 'ALERTA CRITICA: N.V. ENTREGADA Y BLOQUEADA'
      : 'ALERTA CRITICA: N.V. DUPLICADA DETECTADA';
  return e.jsx(Ga, {
    titulo: l ? 'N.V. entregada detectada' : 'N.V. ya registrada',
    onClose: i,
    fullscreen: !0,
    children: e.jsx('div', {
      className:
        'flex min-h-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-5 sm:px-8 sm:py-8',
      children: e.jsxs('div', {
        className: 'mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-6',
        children: [
          e.jsxs('div', {
            className: `rounded-[2rem] border-2 px-5 py-6 sm:px-8 sm:py-8 shadow-2xl ${l ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`,
            children: [
              e.jsx('div', {
                className: `mb-5 rounded-2xl border px-4 py-4 sm:px-6 ${l ? 'border-red-200 bg-red-100 text-red-800' : 'border-amber-200 bg-amber-100 text-amber-800'}`,
                children: e.jsx('div', {
                  className:
                    'text-lg sm:text-3xl font-black uppercase tracking-[0.18em] leading-tight text-center',
                  children: g
                })
              }),
              e.jsxs('div', {
                className: 'flex flex-col gap-5 sm:flex-row sm:items-start',
                children: [
                  e.jsx('div', {
                    className: `mt-0.5 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl ${l ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`,
                    children: l ? e.jsx(ga, { size: 34 }) : e.jsx(je, { size: 34 })
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
                          l
                            ? ' QUEDA BLOQUEADA PARA NO ALTERAR OTIF Y SLA UNA VEZ ENTREGADA.'
                            : ' EL FORMULARIO YA QUEDO EN MODO ACTUALIZACION PARA EVITAR GENERAR UN DUPLICADO.'
                        ]
                      }),
                      a.reabierta &&
                        e.jsxs('div', {
                          className:
                            'mt-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-orange-700',
                          children: [e.jsx(ha, { size: 14 }), 'N.V. reabierta']
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
                        ve(a.pendingRequest.solicitada_at)
                      ]
                    })
                  ]
                })
            ]
          }),
          l &&
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
                  onClick: o,
                  disabled: p,
                  className:
                    'mt-4 w-full rounded-2xl bg-orange-500 px-4 py-4 text-base font-black uppercase tracking-[0.12em] text-white disabled:opacity-50',
                  children: p ? 'Enviando solicitud...' : 'Enviar solicitud de reapertura'
                })
              ]
            }),
          !t &&
            l &&
            !s &&
            e.jsx('div', {
              className:
                'rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm sm:text-base text-slate-500 shadow-xl',
              children: 'Necesitas permisos de gestión para solicitar la reapertura de esta N.V.'
            }),
          e.jsx('div', {
            className: 'flex justify-center pt-2',
            children: e.jsx('button', {
              onClick: i,
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
function Kt({ puedeEscribir: a, puedeAprobarReapertura: t }) {
  var x, y, k;
  const s = be(),
    [r, n] = h.useState(null),
    [o, p] = h.useState(null),
    [i, l] = h.useState([]),
    [g, u] = h.useState(null),
    [c, v] = h.useState(null),
    [N, A] = h.useState(''),
    [C, w] = h.useState(!1),
    [D, O] = h.useState([]),
    [E, P] = h.useState(null),
    [V, Y] = h.useState(null);
  (h.useEffect(() => {
    Aa()
      .then(n)
      .catch(() => {});
  }, []),
    h.useEffect(() => {
      Ba()
        .then(l)
        .catch(() => l([]));
    }, []),
    h.useEffect(() => {
      if (!o) return;
      const d = setTimeout(() => p(null), 3e3);
      return () => clearTimeout(d);
    }, [o]));
  const f = (x = s.lookupResult) != null && x.found ? s.lookupResult : null,
    I = ((y = f == null ? void 0 : f.data) == null ? void 0 : y.estado) === 'Entregado',
    H = D.find((d) => d.estado === 'PENDIENTE') || null,
    Z = h.useMemo(
      () =>
        s.mode !== 'update' || !(f != null && f.data)
          ? !1
          : String(s.estado || '') !== String(f.data.estado || '') ||
            !!s.urgente != !!f.data.urgente ||
            String(s.fechaFacturacion || '') !== String(ve(f.data.fecha_facturacion) || '') ||
            String(s.fechaDespacho || '') !== String(ve(f.data.fecha_despacho) || ''),
      [
        s.mode,
        s.estado,
        s.urgente,
        s.fechaFacturacion,
        s.fechaDespacho,
        f == null ? void 0 : f.data
      ]
    ),
    G =
      s.mode === 'update' &&
      (E == null ? void 0 : E.permitida) === !1 &&
      (V == null ? void 0 : V.permitida) === !0 &&
      Z;
  h.useEffect(() => {
    var j;
    let d = !1;
    if (!(f != null && f.row) || !a) {
      (P(null), Y(null));
      return;
    }
    return (
      Promise.all([
        vt(f.row),
        Nt(
          f.row,
          s.estado || ((j = f == null ? void 0 : f.data) == null ? void 0 : j.estado) || null
        )
      ])
        .then(([S, B]) => {
          d || (P(S), Y(B));
        })
        .catch(() => {
          d ||
            (P({ permitida: !1, message: 'No se pudo validar el acceso IAM para esta N.V.' }),
            Y({ permitida: !1, message: 'No se pudo validar la transición de estado.' }));
        }),
      () => {
        d = !0;
      }
    );
  }, [
    f == null ? void 0 : f.row,
    (k = f == null ? void 0 : f.data) == null ? void 0 : k.estado,
    a,
    s.estado
  ]);
  const U = h.useCallback(async (d) => {
      if (!d) return (O([]), []);
      try {
        const j = await Da(d);
        return (O(j), j);
      } catch {
        return (O([]), []);
      }
    }, []),
    Q = h.useCallback(
      (d, j = D) => {
        if (!d) return;
        const S = j.find((B) => B.estado === 'PENDIENTE') || null;
        v({ ...d, pendingRequest: S });
      },
      [D]
    ),
    ae = h.useCallback(
      async (d) => {
        var S, B, K;
        (s.patch({ lookupResult: { found: !0, row: d.row, data: d.data } }), s.applyFound(d.data));
        const j = s.canal === 'ptm' && ia((S = d.data) == null ? void 0 : S.cliente);
        (s.patch({
          orangeAssociationRequired: j,
          orangeAssociationError: '',
          orangeAssociationData: null,
          orangeAssociationNv: ((B = d.data) == null ? void 0 : B.nv_orange) || ''
        }),
          j && (K = d.data) != null && K.nv_orange && (await _(d.data.nv_orange)));
      },
      [s]
    );
  h.useEffect(() => {
    if (!(f != null && f.row)) {
      O([]);
      return;
    }
    U(f.row);
  }, [f == null ? void 0 : f.row, U]);
  const X = h.useCallback(() => {
      var S, B;
      const d = be.getState(),
        j =
          (S = d.lookupResult) != null && S.found
            ? d.lookupResult.data
            : (B = d.lookupResult) == null
              ? void 0
              : B.autoFill;
      return {
        vendedor: (j == null ? void 0 : j.vendedor) || '',
        ccosto: (j == null ? void 0 : j.ccosto) || (j == null ? void 0 : j.centro_costo) || '',
        centro_costo:
          (j == null ? void 0 : j.centro_costo) || (j == null ? void 0 : j.ccosto) || '',
        division: (j == null ? void 0 : j.division) || ''
      };
    }, []),
    _ = h.useCallback(
      async (d) => {
        const j = String(d || '').trim();
        if (!j)
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
          orangeAssociationNv: j,
          orangeAssociationLoading: !0,
          orangeAssociationError: ''
        });
        try {
          const S = await mt(j, X());
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
      [X, s]
    ),
    R = async () => {
      var S, B, K, T, J, re, ce;
      const d = String(s.nv || '').trim();
      if (!d) return;
      s.patch({ lookupLoading: !0, submitResult: null, errors: [] });
      const j = await Te(s.canal, d);
      if (j.found) {
        await ae(j);
        const oe = ((S = j.data) == null ? void 0 : S.estado) === 'Entregado' ? await U(j.row) : [];
        $t.includes((B = j.data) == null ? void 0 : B.estado) &&
          Q(
            {
              id: j.row,
              canal: s.canal,
              nv: d,
              estado: (K = j.data) == null ? void 0 : K.estado,
              reabierta: ((T = j.data) == null ? void 0 : T.reabierta) === !0,
              motivo_reapertura: ((J = j.data) == null ? void 0 : J.motivo_reapertura) || ''
            },
            oe
          );
      } else if (s.canal !== 'varios' && !((re = j.autoFill) != null && re.cliente)) {
        (s.patch({
          lookupLoading: !1,
          lookupResult: null,
          mode: 'idle',
          orangeAssociationRequired: !1,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        }),
          u({ canal: s.canal, nv: d }));
        return;
      } else {
        (v(null),
          O([]),
          s.patch({ lookupResult: { found: !1, autoFill: j.autoFill } }),
          s.applyNew(j.autoFill || {}));
        const oe = s.canal === 'ptm' && ia((ce = j.autoFill) == null ? void 0 : ce.cliente);
        s.patch({
          orangeAssociationRequired: oe,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        });
      }
      s.patch({ lookupLoading: !1 });
    },
    q = async () => {
      const d = (f == null ? void 0 : f.row) || (c == null ? void 0 : c.id),
        j = String(N || '').trim();
      if (!d) return;
      if (!j) {
        s.patch({
          submitResult: { success: !1, message: 'Debes indicar el motivo de la reapertura.' }
        });
        return;
      }
      w(!0);
      const S = await Oa(d, j);
      if ((w(!1), !S.ok)) {
        const K = S.message || S.error || 'No se pudo solicitar la reapertura.';
        (s.patch({ submitResult: { success: !1, message: K } }), p({ type: 'error', message: K }));
        return;
      }
      const B = await U(d);
      (A(''),
        f != null &&
          f.data &&
          Q(
            {
              id: f.row,
              canal: s.canal,
              nv: s.nv,
              estado: f.data.estado,
              reabierta: f.data.reabierta === !0,
              motivo_reapertura: f.data.motivo_reapertura || ''
            },
            B
          ),
        s.patch({
          submitResult: { success: !0, message: S.message || 'Solicitud de reapertura enviada.' }
        }),
        p({ type: 'success', message: S.message || 'Solicitud de reapertura enviada.' }));
    },
    L = async () => {
      var J, re, ce, oe, b, $, F;
      const d = be.getState();
      if (d.mode === 'idle') return;
      if (!d.estado) {
        d.patch({ submitResult: { success: !1, message: 'Falta el Estado' } });
        return;
      }
      if (
        d.mode === 'update' &&
        f != null &&
        f.row &&
        (E == null ? void 0 : E.permitida) === !1 &&
        !G
      ) {
        (d.patch({
          submitResult: {
            success: !1,
            message: E.message || 'No tienes permisos IAM para editar esta N.V.'
          }
        }),
          p({
            type: 'error',
            message: E.message || 'No tienes permisos IAM para editar esta N.V.'
          }));
        return;
      }
      if (
        (J = d.lookupResult) != null &&
        J.found &&
        ((ce = (re = d.lookupResult) == null ? void 0 : re.data) == null ? void 0 : ce.estado) ===
          'Entregado'
      ) {
        const z = await U(d.lookupResult.row);
        (Q(
          {
            id: d.lookupResult.row,
            canal: d.canal,
            nv: d.nv,
            estado: d.lookupResult.data.estado,
            reabierta: d.lookupResult.data.reabierta === !0,
            motivo_reapertura: d.lookupResult.data.motivo_reapertura || ''
          },
          z
        ),
          d.patch({
            submitResult: {
              success: !1,
              message:
                'La N.V. está entregada y bloqueada. Solicita reapertura para volver a gestionarla.'
            }
          }));
        return;
      }
      if (d.orangeAssociationRequired && (!d.orangeAssociationNv || !d.orangeAssociationData)) {
        d.patch({
          submitResult: {
            success: !1,
            message: 'Debes asociar una N.V. Orange válida para este cliente PTM.'
          }
        });
        return;
      }
      d.patch({ submitting: !0, submitResult: null });
      const j =
          (oe = d.lookupResult) != null && oe.found
            ? d.lookupResult.data
            : (b = d.lookupResult) == null
              ? void 0
              : b.autoFill,
        S = d.orangeAssociationData,
        B = {
          id: d.mode === 'update' ? (($ = d.lookupResult) == null ? void 0 : $.row) : null,
          mode: d.mode,
          canal: d.canal,
          nv: d.nv,
          cliente: (S == null ? void 0 : S.cliente) || (j == null ? void 0 : j.cliente) || '',
          vendedor: (S == null ? void 0 : S.vendedor) || (j == null ? void 0 : j.vendedor) || '',
          division: (S == null ? void 0 : S.division) || (j == null ? void 0 : j.division) || '',
          centro_costo:
            (S == null ? void 0 : S.ccosto) ||
            (j == null ? void 0 : j.ccosto) ||
            (j == null ? void 0 : j.centro_costo) ||
            '',
          nvOrangeAsociada: d.orangeAssociationRequired
            ? d.orangeAssociationNv
            : (j == null ? void 0 : j.nv_orange) || '',
          estado: d.estado,
          urgente: d.urgente,
          tipoDespacho: d.tipoDespacho,
          transportista: d.transportista,
          fechaCompromiso: d.fechaCompromiso,
          fechaAprobacion: d.fechaAprobacion,
          fechaAprobacionReal: d.fechaAprobacionReal,
          fechaFacturacion: d.fechaFacturacion,
          fechaDespacho: d.fechaDespacho,
          factura: d.factura,
          guia: d.guia,
          bultos: d.bultos,
          valorFactura: d.valorFactura,
          numeroEnvio: d.numeroEnvio,
          incidencia: d.incidencia,
          estadoIncidencia: d.incidencia ? d.estadoIncidencia || 'ABIERTA' : '',
          observacionesIncidencia: d.observacionesIncidencia,
          variosTipo: d.variosTipo,
          variosCliente: d.variosCliente,
          variosVendedor: d.variosVendedor,
          variosDivision: d.variosDivision,
          variosCcosto: d.variosCcosto
        },
        K = await ka(B);
      if ((be.getState().patch({ submitting: !1 }), K.ok)) {
        (v(null),
          O([]),
          p({
            type: 'success',
            message: `NV ${B.nv} ${B.mode === 'update' ? 'actualizada' : 'creada'}`
          }),
          be.getState().reset());
        return;
      }
      let T = K.message || K.error || 'No se pudo guardar';
      if (K.duplicate || K.locked) {
        const z = await Te(d.canal, d.nv);
        if (z.found) {
          await ae(z);
          const Le =
            ((F = z.data) == null ? void 0 : F.estado) === 'Entregado' ? await U(z.row) : [];
          Q(
            {
              id: z.row,
              canal: d.canal,
              nv: d.nv,
              estado: z.data.estado,
              reabierta: z.data.reabierta === !0,
              motivo_reapertura: z.data.motivo_reapertura || ''
            },
            Le
          );
        }
      }
      (be.getState().patch({ submitResult: { success: !1, message: T } }),
        p({ type: 'error', message: T }));
    };
  return e.jsxs('div', {
    className: 'pb-24',
    children: [
      e.jsx(kt, {
        options: r,
        transportistasOpts: (r == null ? void 0 : r.transportistas) || [],
        vendedoresMaestro: i,
        onLookup: R,
        onLookupOrange: _,
        canRequestReopen: a,
        onOpenReopen: () => {
          var d, j, S;
          return Q({
            id: f == null ? void 0 : f.row,
            canal: s.canal,
            nv: s.nv,
            estado: (d = f == null ? void 0 : f.data) == null ? void 0 : d.estado,
            reabierta: ((j = f == null ? void 0 : f.data) == null ? void 0 : j.reabierta) === !0,
            motivo_reapertura:
              ((S = f == null ? void 0 : f.data) == null ? void 0 : S.motivo_reapertura) || ''
          });
        },
        latestReopenRequest: H
      }),
      g && e.jsx(Ut, { canal: g.canal, nv: g.nv, onClose: () => u(null) }),
      c &&
        e.jsx(Gt, {
          item: c,
          puedeEscribir: a,
          puedeAprobarReapertura: t,
          motivo: N,
          onMotivoChange: A,
          onRequestReopen: q,
          requesting: C,
          onClose: () => v(null)
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
                    !G &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold',
                      children: E.message || 'Sin acceso IAM para editar esta N.V.'
                    }),
                  s.mode === 'update' &&
                    (E == null ? void 0 : E.permitida) === !1 &&
                    G &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold',
                      children:
                        (V == null ? void 0 : V.message) ||
                        'Tienes permiso para cambiar estado, pero no para editar otros campos de esta N.V.'
                    }),
                  I &&
                    a &&
                    e.jsxs('button', {
                      onClick: () => {
                        var d, j, S;
                        return Q({
                          id: f == null ? void 0 : f.row,
                          canal: s.canal,
                          nv: s.nv,
                          estado: (d = f == null ? void 0 : f.data) == null ? void 0 : d.estado,
                          reabierta:
                            ((j = f == null ? void 0 : f.data) == null ? void 0 : j.reabierta) ===
                            !0,
                          motivo_reapertura:
                            ((S = f == null ? void 0 : f.data) == null
                              ? void 0
                              : S.motivo_reapertura) || '',
                          pendingRequest: H
                        });
                      },
                      className:
                        'px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-black text-sm flex items-center gap-2',
                      children: [e.jsx(Ze, { size: 16 }), 'Solicitar reapertura']
                    }),
                  e.jsxs('button', {
                    onClick: L,
                    disabled:
                      s.submitting ||
                      I ||
                      (s.mode === 'update' && (E == null ? void 0 : E.permitida) === !1 && !G),
                    className:
                      'px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2',
                    children: [
                      s.submitting
                        ? e.jsx(Ae, { size: 16, className: 'animate-spin' })
                        : e.jsx(qa, { size: 16 }),
                      I
                        ? 'N.V. bloqueada'
                        : s.mode === 'update' && (E == null ? void 0 : E.permitida) === !1 && !G
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
      e.jsx(Dt, { toast: o })
    ]
  });
}
function Wt() {
  const { user: a } = ba();
  return e.jsx(Tt, { operador: (a == null ? void 0 : a.nombre) || '' });
}
const Ht = ['angelica@ptm.cl'];
function Yt(a) {
  return a
    ? a.rol === 'ADMIN' ||
        a.es_admin_delegado === !0 ||
        Ht.includes((a.email || '').trim().toLowerCase())
    : !1;
}
function ls() {
  const { hasPermission: a, user: t } = ba(),
    s = a('manage_panel'),
    r = a('approve_panel_reopen_nv') || a('manage_roles'),
    n = Yt(t),
    [o, p] = h.useState('buscar'),
    i = [
      { v: 'buscar', label: 'Buscar', hint: 'Seguimiento y consulta', icon: Qe, accent: '#2563eb' },
      { v: 'ingresar', label: 'Ingresar', hint: 'Registro operativo', icon: Ge, accent: ne },
      ...(s
        ? [
            {
              v: 'consolidados',
              label: 'Consolidados',
              hint: 'Agrupación comercial',
              icon: Fa,
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
            children: i.map((l) => {
              const g = l.icon,
                u = o === l.v;
              return e.jsxs(
                'button',
                {
                  type: 'button',
                  onClick: () => p(l.v),
                  className: `group relative overflow-hidden rounded-[1.15rem] border px-4 py-3.5 text-left transition-all duration-200 ${u ? 'bg-white text-slate-700 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]' : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/80'}`,
                  style: u ? { borderColor: `${l.accent}26` } : void 0,
                  'aria-pressed': u,
                  children: [
                    u &&
                      e.jsx('div', {
                        className: 'absolute inset-x-4 top-0 h-[2px] rounded-full',
                        style: { background: l.accent }
                      }),
                    e.jsx('div', {
                      className: `absolute inset-0 pointer-events-none transition-opacity ${u ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`,
                      style: {
                        background: `radial-gradient(circle at top right, ${l.accent}14, transparent 42%)`
                      }
                    }),
                    e.jsxs('div', {
                      className: 'relative flex items-center gap-3',
                      children: [
                        e.jsx('div', {
                          className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${u ? 'bg-white' : 'border-slate-200 bg-white/90 text-slate-500'}`,
                          style: u
                            ? {
                                borderColor: `${l.accent}26`,
                                color: l.accent,
                                background: `${l.accent}10`
                              }
                            : void 0,
                          children: e.jsx(g, { size: 18 })
                        }),
                        e.jsxs('div', {
                          className: 'min-w-0 flex-1',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center justify-between gap-3',
                              children: [
                                e.jsx('div', {
                                  className: `text-sm font-black tracking-tight ${u ? 'text-slate-900' : 'text-slate-800'}`,
                                  children: l.label
                                }),
                                u &&
                                  e.jsx('span', {
                                    className:
                                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
                                    style: { background: `${l.accent}12`, color: l.accent },
                                    children: 'Activo'
                                  })
                              ]
                            }),
                            e.jsx('div', {
                              className: `mt-1 text-[12px] leading-5 ${u ? 'text-slate-500' : 'text-slate-400'}`,
                              children: l.hint
                            })
                          ]
                        })
                      ]
                    })
                  ]
                },
                l.v
              );
            })
          })
        ]
      }),
      o === 'buscar' &&
        e.jsx(zt, { puedeEscribir: s, puedeEliminar: n, puedeAprobarReapertura: r }),
      o === 'ingresar' && e.jsx(Kt, { puedeEscribir: s, puedeAprobarReapertura: r }),
      o === 'consolidados' && s && e.jsx(Wt, {})
    ]
  });
}
export { ls as default };
