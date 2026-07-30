import { j as e } from './query-vendor-B1MP_4YJ.js';
import { r as h, b as Qe, u as Oa } from './react-vendor-C8fdn38R.js';
import {
  X as Ta,
  S as Ke,
  ai as Ia,
  x as Ze,
  p as Pa,
  aj as Va,
  ak as oa,
  Y as je,
  al as xa,
  ah as fa,
  n as Fa,
  t as $e,
  a7 as Ee,
  am as $a,
  a0 as Xe,
  an as Ma,
  ao as ha,
  ap as ga,
  aq as qa
} from './ui-vendor-D-9zQVt7.js';
import { s as T, L as ke, w as ae, u as ba } from './index-D3K83tgM.js';
import { f as La } from './configService-q7itzlPg.js';
import { e as Ba } from './exportExcel-D85v870c.js';
import { c as za } from './index-CXYp_lIK.js';
import { g as se } from './animation-vendor-BwUUObbT.js';
import './supabase-vendor-jY4wIOEF.js';
import './xlsx-B2eTCt_Q.js';
import './charts-vendor-BPHLCusR.js';
function Ua({ titulo: a, onClose: t, children: s, maxWidth: r = 'max-w-3xl', fullscreen: n = !1 }) {
  return (
    h.useEffect(() => {
      const l = (c) => c.key === 'Escape' && (t == null ? void 0 : t());
      document.addEventListener('keydown', l);
      const p = document.body.style.overflow;
      return (
        (document.body.style.overflow = 'hidden'),
        () => {
          (document.removeEventListener('keydown', l), (document.body.style.overflow = p));
        }
      );
    }, [t]),
    Qe.createPortal(
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
const Z = 'tms_operaciones_vigentes',
  Ae = 'tms_operaciones',
  Ga = 60 * 1e3,
  Ka = 5 * 60 * 1e3,
  Ha = 20 * 1e3,
  Wa = 3 * 60 * 1e3,
  Ya = 5 * 60 * 1e3,
  Qa = 10 * 60 * 1e3;
let He = { ts: 0, data: null, promise: null },
  We = { ts: 0, data: null, promise: null },
  va = { ts: 0, data: null, promise: null },
  Na = { ts: 0, data: null, promise: null },
  ce = { ts: 0, data: null, promise: null };
const ge = new Map(),
  Ne = new Map(),
  Se = new Map();
function ja() {
  ((He = { ts: 0, data: null, promise: null }),
    (We = { ts: 0, data: null, promise: null }),
    (va = { ts: 0, data: null, promise: null }),
    (Na = { ts: 0, data: null, promise: null }),
    (ce = { ts: 0, data: null, promise: null }),
    ge.clear(),
    Ne.clear(),
    Se.clear());
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
function Me(a) {
  return Math.round(Math.max(0, performance.now() - a));
}
function Xa(a = {}) {
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
async function me(
  a,
  t,
  { screen: s = 'PanelIngresar', payload: r = null, slowMs: n = 900, message: l = '' } = {}
) {
  const p = performance.now();
  try {
    const c = await t(),
      o = Me(p);
    return (
      o >= n &&
        ke.performance({
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
      ke.error(c, {
        module: 'panel',
        screen: s,
        action: a,
        message: `Fallo operacion de lectura: ${a}`,
        durationMs: Me(p),
        status: 'error',
        payload: r
      }),
      c
    );
  }
}
async function _e(a, t, { screen: s = 'PanelIngresar', payload: r = null, message: n = '' } = {}) {
  const l = performance.now();
  try {
    const p = await t(),
      c = Me(l);
    return (p == null ? void 0 : p.ok) === !1
      ? (ke.error(new Error(p.error || p.message || `Operacion fallida: ${a}`), {
          module: 'panel',
          screen: s,
          action: a,
          message: `Operacion fallida: ${a}`,
          durationMs: c,
          status: 'failed',
          payload: r,
          context: { result: p }
        }),
        p)
      : (ke.audit({
          module: 'panel',
          screen: s,
          action: a,
          message: n || `Operacion ejecutada: ${a}`,
          durationMs: c,
          status: 'ok',
          payload: r
        }),
        p);
  } catch (p) {
    throw (
      ke.error(p, {
        module: 'panel',
        screen: s,
        action: a,
        message: `Fallo operacion critica: ${a}`,
        durationMs: Me(l),
        status: 'error',
        payload: r
      }),
      p
    );
  }
}
const Ye = [
    { value: 'ptm', label: 'PTM', color: '#ea580c' },
    { value: 'orange', label: 'Orange', color: '#f59e0b' },
    { value: 'farmapack', label: 'Farmapack', color: '#0f766e' },
    { value: 'varios', label: 'Varios', color: '#4f46e5' }
  ],
  Ja = ['N.V ANTICIPADA', 'DEMO', 'REGALO', 'BOLETA', 'GUÍA SALIDA'],
  ya = ['PROBLEMAS DE DIRECCIÓN', 'PROBLEMAS DE TRANSPORTE', 'OTRO'],
  _a = ['ABIERTA', 'EN GESTIÓN', 'RESUELTA'],
  wa = ['En Proceso', 'Shipping', 'Currier', 'En Ruta', 'Entregado'],
  qe = ['En Proceso', 'Shipping', 'Currier', 'En Ruta'],
  Ca = ['Courier - Inyección', 'Directo', 'Courier (Retiro / Pick-up)'],
  et = {
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
  Te = (a) => et[a] || '#9ca3af',
  le = '#ea580c',
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
  pe = (a) =>
    xe(a)
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  at = new Set(['de', 'del', 'la', 'las', 'los']),
  la = (a) =>
    pe(a)
      .split(' ')
      .filter((t) => t && !at.has(t)),
  tt = (a) =>
    a === 'ptm'
      ? 'nv_ptm'
      : a === 'orange'
        ? 'nv_orange'
        : a === 'farmapack'
          ? 'nv_farmapack'
          : 'varios',
  Pe = (a) => (a.nv_ptm ? 'ptm' : a.nv_orange ? 'orange' : a.nv_farmapack ? 'farmapack' : 'varios'),
  we = (a) => (a.nv_ptm ? String(a.nv_ptm) : a.nv_orange || a.nv_farmapack || a.varios || ''),
  ia = (a) => xe(a).includes('orange'),
  Q =
    'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,estado,transportista,fecha_compromiso,guia,factura,fecha_aprobacion,fecha_aprobacion_real,urgente,fecha_estado,reabierta,motivo_reapertura';
function De(a) {
  const t = Pe(a),
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
function st(a) {
  return pe(a).split(' ').filter(Boolean);
}
function rt(a) {
  const t = he((a == null ? void 0 : a.nv) || ''),
    s = xe((a == null ? void 0 : a.guia) || ''),
    r = xe((a == null ? void 0 : a.factura) || ''),
    n = pe((a == null ? void 0 : a.cliente) || ''),
    l = pe((a == null ? void 0 : a.vendedor) || ''),
    p = pe((a == null ? void 0 : a.transportista) || ''),
    c = xe((a == null ? void 0 : a.canal) || ''),
    o = xe((a == null ? void 0 : a.estado) || ''),
    g = [t, s, r, n, l, p, c, o].filter(Boolean).join(' '),
    u = new Set(g.split(' ').filter(Boolean));
  return {
    nv: t,
    guia: s,
    factura: r,
    cliente: n,
    vendedor: l,
    transportista: p,
    canal: c,
    estado: o,
    searchable: g,
    words: u
  };
}
function nt(a, t) {
  const s = String(t || '').trim();
  if (!s) return Number.NEGATIVE_INFINITY;
  const r = he(s),
    n = xe(s),
    l = pe(s),
    p = st(s),
    c = rt(a);
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
    p.length > 0)
  ) {
    let g = 0;
    (p.forEach((u) => {
      if (c.words.has(u)) {
        ((g += 1), (o += 950));
        return;
      }
      for (const i of c.words)
        if (i.startsWith(u)) {
          ((g += 0.6), (o += 360));
          return;
        }
      c.searchable.includes(u) && (o += 120);
    }),
      g >= p.length && (o += 1600));
  }
  return (
    n && c.searchable.includes(n) && (o += 600),
    a != null && a.urgente && (o += 45),
    (o += Math.min(Re(a) / 1e9, 120)),
    o
  );
}
function Oe(a, t, s = 200) {
  const r = new Map();
  return (
    (a || []).forEach((n) => {
      if (!(n != null && n.key)) return;
      const l = nt(n, t);
      if (!Number.isFinite(l) || l <= 0) return;
      const p = r.get(n.key);
      (!p || l > p.score || (l === p.score && Re(n) > Re(p.item))) &&
        r.set(n.key, { item: n, score: l });
    }),
    Array.from(r.values())
      .sort((n, l) => l.score - n.score || Re(l.item) - Re(n.item))
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
async function Ue({ force: a = !1, full: t = !0, limit: s = 400 } = {}) {
  return me(
    'lista_activas',
    async () => {
      const r = Date.now(),
        n = t ? He : We;
      if (!a && n.data && r - n.ts < Ga) return n.data;
      if (!a && n.promise) return n.promise;
      const l = async () => {
        if (!t) {
          const { data: u, error: i } = await T.from(Z)
            .select(Q)
            .in('estado', qe)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .limit(s);
          if (i) throw i;
          const v = (u || []).map(De);
          return ((We = { ts: Date.now(), data: v, promise: null }), v);
        }
        const p = [];
        let c = 0;
        const o = 500;
        for (;;) {
          const { data: u, error: i } = await T.from(Z)
            .select(Q)
            .in('estado', qe)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .range(c, c + o - 1);
          if (i) throw i;
          if (!u || u.length === 0 || (p.push(...u), u.length < o)) break;
          c += o;
        }
        const g = p.map(De);
        return ((He = { ts: Date.now(), data: g, promise: null }), g);
      };
      return (
        (n.promise = l().catch((p) => {
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
async function ot(a, { limit: t = 300 } = {}) {
  return me(
    'buscar_operaciones',
    async () => {
      const s = String(a || '').trim();
      if (s.length < 2) return [];
      const r = `${t}:${pe(s) || xe(s)}`,
        n = Je(ge, r, Ha);
      if (n) return n;
      const l = s.replace(/[(),*]/g, ' ').trim();
      if (!l) return [];
      const c = (async () => {
        if (/^\d{4,}$/.test(l)) {
          const A = await Promise.all([
              ae(
                T.from(Ae)
                  .select(Q)
                  .eq('nv_ptm', Number(l))
                  .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                  .order('id', { ascending: !1 })
                  .limit(1),
                { ms: 2500, label: 'Busqueda exacta nv_ptm Panel' }
              ),
              ae(
                T.from(Ae)
                  .select(Q)
                  .eq('nv_orange', l)
                  .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                  .order('id', { ascending: !1 })
                  .limit(1),
                { ms: 2500, label: 'Busqueda exacta nv_orange Panel' }
              ),
              ae(
                T.from(Ae)
                  .select(Q)
                  .eq('nv_farmapack', l)
                  .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                  .order('id', { ascending: !1 })
                  .limit(1),
                { ms: 2500, label: 'Busqueda exacta nv_farmapack Panel' }
              ),
              ae(
                T.from(Ae)
                  .select(Q)
                  .eq('varios', l)
                  .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                  .order('id', { ascending: !1 })
                  .limit(1),
                { ms: 2500, label: 'Busqueda exacta varios Panel' }
              )
            ]),
            w = A.find((m) => m.error);
          if (w != null && w.error) throw w.error;
          const k = Oe(
            A.flatMap((m) => (m.data || []).map(De)),
            s,
            Math.min(t, 20)
          );
          if (k.length) return ye(ge, r, k);
          const D = Math.min(t, 60),
            C = `${l}%`,
            F = (
              await Promise.allSettled([
                ae(T.from(Z).select(Q).eq('nv_ptm', Number(l)).limit(D), {
                  ms: 2500,
                  label: 'Busqueda numerica nv_ptm Panel'
                }),
                ae(T.from(Z).select(Q).ilike('nv_orange', C).limit(D), {
                  ms: 2500,
                  label: 'Busqueda numerica nv_orange Panel'
                }),
                ae(T.from(Z).select(Q).ilike('nv_farmapack', C).limit(D), {
                  ms: 2500,
                  label: 'Busqueda numerica nv_farmapack Panel'
                }),
                ae(T.from(Z).select(Q).ilike('varios', C).limit(D), {
                  ms: 2500,
                  label: 'Busqueda numerica varios Panel'
                }),
                ae(T.from(Z).select(Q).ilike('guia', C).limit(D), {
                  ms: 2500,
                  label: 'Busqueda numerica guia Panel'
                }),
                ae(T.from(Z).select(Q).ilike('factura', C).limit(D), {
                  ms: 2500,
                  label: 'Busqueda numerica factura Panel'
                })
              ])
            )
              .filter((m) => {
                var I;
                return (
                  m.status === 'fulfilled' && Array.isArray((I = m.value) == null ? void 0 : I.data)
                );
              })
              .flatMap((m) => m.value.data || []),
            G = Oe(F.map(De), s, t);
          return ye(ge, r, G);
        }
        const g = `*${l}*`,
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
        let i = null,
          v = null;
        if (
          (({ data: i, error: v } = await ae(
            T.from(Z)
              .select(Q)
              .or(u.join(','))
              .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
              .limit(t),
            { ms: 4e3, label: 'Busqueda remota amplia del Panel' }
          )),
          v)
        ) {
          const A = Math.min(t, 60),
            w = `${l}*`,
            D = (
              await Promise.allSettled([
                ae(T.from(Z).select(Q).ilike('nv_orange', w).limit(A), {
                  ms: 2500,
                  label: 'Fallback nv_orange Panel'
                }),
                ae(T.from(Z).select(Q).ilike('nv_farmapack', w).limit(A), {
                  ms: 2500,
                  label: 'Fallback nv_farmapack Panel'
                }),
                ae(T.from(Z).select(Q).ilike('varios', w).limit(A), {
                  ms: 2500,
                  label: 'Fallback varios Panel'
                }),
                ae(T.from(Z).select(Q).ilike('guia', w).limit(A), {
                  ms: 2500,
                  label: 'Fallback guia Panel'
                }),
                ae(T.from(Z).select(Q).ilike('factura', w).limit(A), {
                  ms: 2500,
                  label: 'Fallback factura Panel'
                }),
                l.length >= 4
                  ? ae(T.from(Z).select(Q).ilike('cliente', w).limit(A), {
                      ms: 2500,
                      label: 'Fallback cliente Panel'
                    })
                  : Promise.resolve({ data: [] })
              ])
            )
              .filter((C) => {
                var $;
                return (
                  C.status === 'fulfilled' && Array.isArray(($ = C.value) == null ? void 0 : $.data)
                );
              })
              .flatMap((C) => C.value.data || []);
          if (D.length) ((i = D), (v = null));
          else throw v;
        }
        const N = new Map();
        (i || []).forEach((A) => {
          const w = we(A);
          if (!w) return;
          const k = `${Pe(A)}:${w}`;
          N.has(k) || N.set(k, De(A));
        });
        const E = Oe(Array.from(N.values()), s, t);
        return ye(ge, r, E);
      })().catch((o) => {
        throw (ge.delete(r), o);
      });
      return ea(ge, r, c);
    },
    {
      payload: { term: String(a || '').trim(), limit: t },
      slowMs: 450,
      message: 'Busqueda remota de operaciones del Panel'
    }
  );
}
function lt(a, t, { limit: s = 120 } = {}) {
  const r = String(t || '').trim();
  return r.length < 2 ? [] : Oe(a || [], r, s);
}
function it(a, t, s, { limit: r = 160 } = {}) {
  return Oe([...(a || []), ...(t || [])], s, r);
}
async function Ea({ force: a = !1, includeHistoricos: t = !1 } = {}) {
  return me(
    'cargar_opciones',
    async () => {
      const s = Date.now(),
        r = t ? va : Na;
      if (!a && r.data && s - r.ts < Ka) return r.data;
      if (!a && r.promise) return r.promise;
      const n = async () => {
        const l = new Set(),
          { data: p } = await T.from('tms_panel_transportistas')
            .select('nombre')
            .eq('activo', !0)
            .order('nombre', { ascending: !0 });
        if (
          ((p || []).forEach((g) => {
            const u = (g.nombre || '').trim();
            u && l.add(u);
          }),
          t)
        ) {
          let g = 0;
          const u = 1e3;
          for (;;) {
            const { data: i, error: v } = await T.from(Z)
              .select('transportista')
              .not('transportista', 'is', null)
              .order('id', { ascending: !0 })
              .range(g, g + u - 1);
            if (
              v ||
              !i ||
              i.length === 0 ||
              (i.forEach((N) => {
                const E = (N.transportista || '').trim();
                E && l.add(E);
              }),
              i.length < u)
            )
              break;
            g += u;
          }
        }
        const c = [...l].sort((g, u) => g.localeCompare(u, 'es')),
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
  const s = he(t);
  if (!s) return null;
  const r = `${String(a).toLowerCase()}:${s}`,
    n = Je(Se, r, Ya);
  if (n) return n;
  const p = (async () => {
    const { data: c } = await T.from('tms_nv_catalogo')
      .select('cliente, vendedor, fecha_aprobacion, centro_costo, division')
      .eq('canal', String(a).toLowerCase())
      .eq('nv', s)
      .limit(1);
    return ye(Se, r, (c && c[0]) || null);
  })().catch((c) => {
    throw (Se.delete(r), c);
  });
  return ea(Se, r, p);
}
async function ct() {
  const a = Date.now();
  if (ce.data && a - ce.ts < Qa) return ce.data;
  if (ce.promise) return ce.promise;
  const t = async () => {
    const { data: s } = await T.from('tms_panel_vendedores')
        .select('nombre, centro_costo, division')
        .eq('activo', !0)
        .order('nombre', { ascending: !0 }),
      r = s || [];
    return ((ce = { ts: Date.now(), data: r, promise: null }), r);
  };
  return (
    (ce.promise = t().catch((s) => {
      throw ((ce.promise = null), s);
    })),
    ce.promise
  );
}
async function ta(a) {
  const t = String(a || '').trim();
  if (!t) return null;
  const s = await ct();
  if (!s || s.length === 0) return null;
  const r = pe(t),
    n = la(t),
    p = s
      .map((c) => {
        const o = pe(c.nombre),
          g = la(c.nombre),
          u = o === r,
          i = !u && (o.includes(r) || r.includes(o)),
          v = n.filter((w) => g.includes(w)).length,
          N = n.length > 0 && n.every((w) => g.includes(w)),
          E = g.length > 0 && g.every((w) => n.includes(w));
        let A = 0;
        return (
          u ? (A += 1e3) : i ? (A += 700) : (N || E) && (A += 500),
          (A += v * 100),
          (A -= Math.abs(o.length - r.length)),
          { ...c, score: A }
        );
      })
      .filter((c) => c.score >= 200)
      .sort((c, o) => o.score - c.score)[0];
  return p ? { centro_costo: p.centro_costo || '', division: p.division || '' } : null;
}
async function Ie(a, t) {
  return me(
    'lookup_nv',
    async () => {
      const s = he(t);
      if (!s)
        return { found: !1, autoFill: { cliente: '', vendedor: '', ccosto: '', division: '' } };
      const r = `${String(a).toLowerCase()}:${s}`,
        n = Je(Ne, r, Wa);
      if (n) return n;
      const p = (async () => {
        const c = tt(a);
        let o = T.from(Z).select(Aa).order('fecha_estado', { ascending: !1 }).limit(1);
        o = a === 'ptm' && /^\d+$/.test(s) ? o.eq(c, Number(s)) : o.eq(c, s);
        const [{ data: g }, u] = await Promise.all([o, aa(a, s)]),
          i = g && g.length ? g[0] : null,
          v = (i == null ? void 0 : i.cliente) || (u == null ? void 0 : u.cliente) || '',
          N = (i == null ? void 0 : i.vendedor) || (u == null ? void 0 : u.vendedor) || '';
        let E =
            (i == null ? void 0 : i.centro_costo) || (u == null ? void 0 : u.centro_costo) || '',
          A = (i == null ? void 0 : i.division) || (u == null ? void 0 : u.division) || '';
        if (N && (!E || !A)) {
          const w = await ta(N);
          w && ((E = E || w.centro_costo || ''), (A = A || w.division || ''));
        }
        if (i) {
          const w = {
            found: !0,
            row: i.id,
            data: {
              ...i,
              canal: a,
              nv: we(i),
              estado: i.estado,
              cliente: v,
              vendedor: N,
              ccosto: E,
              division: A,
              fecha_compromiso: fe(i.fecha_compromiso),
              fecha_registro_nv: fe(i.fecha_registro_nv)
            }
          };
          return ye(Ne, r, w);
        }
        return ye(Ne, r, {
          found: !1,
          autoFill: { cliente: v, vendedor: N, ccosto: E, division: A }
        });
      })().catch((c) => {
        throw (Ne.delete(r), c);
      });
      return ea(Ne, r, p);
    },
    { payload: { canal: a, nv: he(t) }, slowMs: 550, message: 'Lookup de N.V. en Panel' }
  );
}
async function dt(a, { canal: t = null, nv: s = null } = {}) {
  return me(
    'lookup_nv_by_id',
    async () => {
      if (!a) return Ie(t, s);
      const { data: r, error: n } = await T.from(Ae).select(Aa).eq('id', a).limit(1);
      if (n) throw n;
      const l = r && r.length ? r[0] : null;
      if (!l) return Ie(t, s);
      const p = t || Pe(l),
        c = s || we(l),
        o = await aa(p, c),
        g = (l == null ? void 0 : l.cliente) || (o == null ? void 0 : o.cliente) || '',
        u = (l == null ? void 0 : l.vendedor) || (o == null ? void 0 : o.vendedor) || '';
      let i = (l == null ? void 0 : l.centro_costo) || (o == null ? void 0 : o.centro_costo) || '',
        v = (l == null ? void 0 : l.division) || (o == null ? void 0 : o.division) || '';
      if (u && (!i || !v)) {
        const E = await ta(u);
        E && ((i = i || E.centro_costo || ''), (v = v || E.division || ''));
      }
      return {
        found: !0,
        row: l.id,
        data: {
          ...l,
          canal: p,
          nv: c,
          estado: l.estado,
          cliente: g,
          vendedor: u,
          ccosto: i,
          division: v,
          fecha_compromiso: fe(l.fecha_compromiso),
          fecha_registro_nv: fe(l.fecha_registro_nv)
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
async function ut(a, t = {}) {
  const s = he(a);
  if (!s) return null;
  const r = await aa('orange', s);
  if (!r) return null;
  let n = r.centro_costo || '',
    l = r.division || '';
  const p = r.vendedor || t.vendedor || '';
  if (p && (!n || !l)) {
    const c = await ta(p);
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
  pt = [
    ['canal_operacion', 'CANAL OPERACIÓN'],
    ['nv_operacion', 'N.V OPERACIÓN'],
    ['nv_orange_asociada_ptm', 'N.V ORANGE ASOCIADA PTM'],
    ['tiene_asociacion_orange', 'PTM CON ASOCIACIÓN ORANGE']
  ],
  mt = new Set([
    'fecha_aprobacion',
    'fecha_aprobacion_real',
    'fecha_despacho',
    'fecha_compromiso',
    'fecha_en_proceso',
    'fecha_shipping',
    'fecha_en_ruta',
    'fecha_entregado'
  ]),
  xt = new Set(['fecha_estado', 'fecha_registro_nv', 'created_at', 'updated_at']),
  Sa = (a) => {
    const t = String(a).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return t ? `${t[3]}/${t[2]}/${t[1]}` : String(a);
  },
  ft = (a) => {
    const t = String(a).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    return t ? `${t[3]}/${t[2]}/${t[1]} ${t[4]}:${t[5]}` : Sa(a);
  };
async function ht() {
  return me(
    'exportar_operaciones',
    async () => {
      const a = ca.map((n) => n[0]).join(','),
        t = [];
      let s = 0;
      const r = 1e3;
      for (;;) {
        const { data: n, error: l } = await T.from(Z)
          .select(a)
          .order('id', { ascending: !0 })
          .range(s, s + r - 1);
        if (l) throw l;
        if (!n || n.length === 0 || (t.push(...n), n.length < r)) break;
        s += r;
      }
      return t.map((n) => {
        const l = {};
        ca.forEach(([u, i]) => {
          let v = n[u];
          (u === 'urgente'
            ? (v = v === !0 ? 'SÍ' : 'NO')
            : v == null || v === ''
              ? (v = '')
              : mt.has(u)
                ? (v = Sa(v))
                : xt.has(u) && (v = ft(v)),
            (l[i] = v));
        });
        const p = Pe(n),
          c = we(n),
          o = (n.nv_ptm && n.nv_orange) || '',
          g = {
            'CANAL OPERACIÓN': String(p || '').toUpperCase(),
            'N.V OPERACIÓN': c || '',
            'N.V ORANGE ASOCIADA PTM': o,
            'PTM CON ASOCIACIÓN ORANGE': n.nv_ptm ? (n.nv_orange ? 'SÍ' : 'NO') : ''
          };
        return (
          pt.forEach(([, u]) => {
            l[u] = g[u] || '';
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
function Le(a, t) {
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
      const { data: r, error: n } = await T.rpc('guardar_nv', { p: t }),
        l = Le(r, n);
      return ((l == null ? void 0 : l.ok) !== !1 && ja(), l);
    },
    { payload: Xa(t), message: 'Guardado de N.V. en Panel' }
  );
}
async function gt(a) {
  if (!a) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: t, error: s } = await T.rpc('iam_puede_editar_nv', { p_id: a });
  return s
    ? { permitida: !1, message: s.message || 'No se pudo validar el acceso IAM.' }
    : t || { permitida: !1, message: 'No se pudo validar el acceso IAM.' };
}
async function bt(a, t = null) {
  if (!a) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: s, error: r } = await T.rpc('iam_puede_cambiar_estado_nv', {
    p_id: a,
    p_estado: t
  });
  return r
    ? { permitida: !1, message: r.message || 'No se pudo validar la transición de estado.' }
    : s || { permitida: !1, message: 'No se pudo validar la transición de estado.' };
}
async function ka(a) {
  return me(
    'listar_reaperturas_nv',
    async () => {
      if (!a) return [];
      const { data: t, error: s } = await T.from('tms_nv_reaperturas')
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
      const { data: s, error: r } = await T.rpc('solicitar_reapertura_nv', {
        p_operacion_id: a,
        p_motivo: t
      });
      return Le(s, r);
    },
    {
      payload: { id: a, motivoLength: String(t || '').trim().length },
      message: 'Solicitud de reapertura de N.V.'
    }
  );
}
async function vt(a, t, s = '') {
  return _e(
    'resolver_reapertura_nv',
    async () => {
      const { data: r, error: n } = await T.rpc('resolver_reapertura_nv', {
        p_request_id: a,
        p_aprobar: t,
        p_observacion: s || null
      });
      return Le(r, n);
    },
    {
      payload: { requestId: a, aprobar: t, observacionLength: String(s || '').trim().length },
      message: 'Resolucion de solicitud de reapertura'
    }
  );
}
async function Nt(a) {
  return _e(
    'eliminar_nv',
    async () => {
      const { data: t, error: s } = await T.rpc('eliminar_nv', { p_id: a }),
        r = Le(t, s);
      return ((r == null ? void 0 : r.ok) !== !1 && ja(), r);
    },
    { payload: { id: a }, message: 'Eliminacion de N.V. en Panel' }
  );
}
async function jt() {
  return me(
    'listar_consolidados',
    async () => {
      const [{ data: a }, { data: t }] = await Promise.all([
          T.from('tms_consolidados')
            .select('id, ticket, fecha_comprometida, estado, observacion, created_by, created_at')
            .order('id', { ascending: !1 }),
          T.from('tms_consolidado_nvs').select('id, consolidado_id, nv, canal, cliente')
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
      const { data: t, error: s } = await T.rpc('guardar_consolidado', { p: a });
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
async function yt(a) {
  return _e(
    'eliminar_consolidado',
    async () => {
      const { data: t, error: s } = await T.rpc('eliminar_consolidado', { p_id: a });
      return s ? { ok: !1, error: s.message } : t || { ok: !0 };
    },
    { payload: { id: a }, message: 'Eliminacion de consolidado' }
  );
}
async function da(a) {
  return me(
    'buscar_nv_basico',
    async () => {
      const t = String(a).trim();
      if (!t) return null;
      const s = [];
      (/^\d+$/.test(t) && s.push(`nv_ptm.eq.${Number(t)}`),
        s.push(`nv_orange.eq.${t}`, `nv_farmapack.eq.${t}`, `varios.ilike.*${t}*`));
      const { data: r } = await T.from(Z)
        .select('nv_ptm,nv_orange,nv_farmapack,varios,cliente,estado,fecha_estado')
        .or(s.join(','))
        .order('fecha_estado', { ascending: !1 })
        .limit(1);
      if (!r || r.length === 0) return null;
      const n = r[0];
      return { nv: we(n), canal: Pe(n), cliente: n.cliente || null, estado: n.estado || null };
    },
    {
      payload: { nv: String(a || '').trim() },
      slowMs: 400,
      message: 'Busqueda basica de N.V. para consolidados'
    }
  );
}
const ne = {
    EN_PROCESO: 'En Proceso',
    SHIPPING: 'Shipping',
    CURRIER: 'Currier',
    EN_RUTA: 'En Ruta',
    ENTREGADO: 'Entregado',
    RECIBIDO_CONFORME: 'Recibido Conforme',
    RECIBIDO_OBS: 'Recibido C/OBS'
  },
  _t = [ne.CURRIER, ne.EN_RUTA, ne.ENTREGADO, ne.RECIBIDO_CONFORME, ne.RECIBIDO_OBS],
  wt = [ne.EN_PROCESO, ne.SHIPPING, ne.CURRIER, ne.EN_RUTA, ne.ENTREGADO];
function Ct(a) {
  const t = (a || '').toUpperCase();
  return _t.some((s) => s.toUpperCase() === t);
}
function Et(a, t) {
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
  const n = Et(r, 2),
    l = n.getFullYear(),
    p = String(n.getMonth() + 1).padStart(2, '0'),
    c = String(n.getDate()).padStart(2, '0');
  return `${l}-${p}-${c}`;
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
    estado: ne.EN_PROCESO,
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
  be = za((a) => ({
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
          estado: t.estado || ne.EN_PROCESO,
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
          estado: ne.EN_PROCESO,
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
  At = ({
    items: a,
    active: t,
    onSelect: s,
    accent: r = '#ea580c',
    ease: n = 'power3.easeOut'
  }) => {
    const l = h.useRef([]),
      p = h.useRef([]),
      c = h.useRef([]),
      o = h.useRef([]);
    (h.useEffect(() => {
      var v;
      const i = () => {
        l.current.forEach((N, E) => {
          var J;
          if (!(N != null && N.parentElement)) return;
          const A = N.parentElement,
            w = A.getBoundingClientRect(),
            { width: k, height: D } = w;
          if (k === 0 || D === 0) return;
          const C = ((k * k) / 4 + D * D) / (2 * D),
            $ = Math.ceil(2 * C) + 2,
            F = Math.ceil(C - Math.sqrt(Math.max(0, C * C - (k * k) / 4))) + 1,
            G = $ - F;
          ((N.style.width = `${$}px`),
            (N.style.height = `${$}px`),
            (N.style.bottom = `-${F}px`),
            se.set(N, { xPercent: -50, scale: 0, transformOrigin: `50% ${G}px` }));
          const m = A.querySelector('.pc-label'),
            I = A.querySelector('.pc-label-hover');
          (m && se.set(m, { y: 0 }),
            I && se.set(I, { y: D + 12, opacity: 0 }),
            (J = p.current[E]) == null || J.kill());
          const Y = se.timeline({ paused: !0 });
          (Y.to(N, { scale: 1.2, xPercent: -50, duration: 2, ease: n, overwrite: 'auto' }, 0),
            m && Y.to(m, { y: -(D + 8), duration: 2, ease: n, overwrite: 'auto' }, 0),
            I &&
              (se.set(I, { y: Math.ceil(D + 100), opacity: 0 }),
              Y.to(I, { y: 0, opacity: 1, duration: 2, ease: n, overwrite: 'auto' }, 0)),
            (p.current[E] = Y));
        });
      };
      return (
        i(),
        window.addEventListener('resize', i),
        (v = document.fonts) != null && v.ready && document.fonts.ready.then(i).catch(() => {}),
        () => window.removeEventListener('resize', i)
      );
    }, [a, n]),
      h.useEffect(() => {
        a.forEach((i, v) => {
          var $;
          const N = o.current[v],
            E = p.current[v],
            A = l.current[v],
            w = N == null ? void 0 : N.querySelector('.pc-label'),
            k = N == null ? void 0 : N.querySelector('.pc-label-hover'),
            D = t === i.value,
            C = i.color || r;
          if ((($ = c.current[v]) == null || $.kill(), !(!N || !A || !E))) {
            if (D) {
              ((N.style.background = C),
                (N.style.color = '#ffffff'),
                se.set(A, { scale: 1.2, xPercent: -50 }),
                w && se.set(w, { y: -(N.offsetHeight + 8) }),
                k && se.set(k, { y: 0, opacity: 1 }),
                E.progress(1).pause());
              return;
            }
            ((N.style.background = ''),
              (N.style.color = ''),
              se.set(A, { scale: 0, xPercent: -50 }),
              w && se.set(w, { y: 0 }),
              k && se.set(k, { y: N.offsetHeight + 12, opacity: 0 }),
              E.progress(0).pause());
          }
        });
      }, [t, a, r]));
    const g = (i) => {
        var N, E;
        if (t === ((N = a[i]) == null ? void 0 : N.value)) return;
        const v = p.current[i];
        v &&
          ((E = c.current[i]) == null || E.kill(),
          (c.current[i] = v.tweenTo(v.duration(), { duration: 0.3, ease: n, overwrite: 'auto' })));
      },
      u = (i) => {
        var N, E;
        if (t === ((N = a[i]) == null ? void 0 : N.value)) return;
        const v = p.current[i];
        v &&
          ((E = c.current[i]) == null || E.kill(),
          (c.current[i] = v.tweenTo(0, { duration: 0.2, ease: n, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: 'pc-track',
      children: a.map((i, v) => {
        const N = t === i.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(i.value),
            onMouseEnter: () => g(v),
            onMouseLeave: () => u(v),
            className: `pc-pill ${N ? 'pc-active' : ''}`,
            'aria-pressed': N,
            ref: (E) => {
              o.current[v] = E;
            },
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (E) => {
                  l.current[v] = E;
                },
                style: { background: i.color || r }
              }),
              e.jsxs('span', {
                className: 'pc-label-stack',
                children: [
                  e.jsx('span', { className: 'pc-label', children: i.label }),
                  e.jsx('span', {
                    className: 'pc-label-hover',
                    'aria-hidden': 'true',
                    children: i.label
                  })
                ]
              })
            ]
          },
          i.value
        );
      })
    });
  },
  sa = ({ items: a, active: t, onSelect: s, inline: r = !1, ease: n = 'power3.easeOut' }) => {
    const l = h.useRef([]),
      p = h.useRef([]),
      c = h.useRef([]);
    h.useEffect(() => {
      var i;
      const u = () => {
        l.current.forEach((v, N) => {
          var Y;
          if (!(v != null && v.parentElement)) return;
          const E = v.parentElement,
            A = E.getBoundingClientRect(),
            { width: w, height: k } = A;
          if (w === 0 || k === 0) return;
          const D = ((w * w) / 4 + k * k) / (2 * k),
            C = Math.ceil(2 * D) + 2,
            $ = Math.ceil(D - Math.sqrt(Math.max(0, D * D - (w * w) / 4))) + 1,
            F = C - $;
          ((v.style.width = `${C}px`),
            (v.style.height = `${C}px`),
            (v.style.bottom = `-${$}px`),
            se.set(v, { xPercent: -50, scale: 0, transformOrigin: `50% ${F}px` }));
          const G = E.querySelector('.pc-label'),
            m = E.querySelector('.pc-label-hover');
          (G && se.set(G, { y: 0 }),
            m && se.set(m, { y: k + 12, opacity: 0 }),
            (Y = p.current[N]) == null || Y.kill());
          const I = se.timeline({ paused: !0 });
          (I.to(v, { scale: 1.2, xPercent: -50, duration: 2, ease: n, overwrite: 'auto' }, 0),
            G && I.to(G, { y: -(k + 8), duration: 2, ease: n, overwrite: 'auto' }, 0),
            m &&
              (se.set(m, { y: Math.ceil(k + 100), opacity: 0 }),
              I.to(m, { y: 0, opacity: 1, duration: 2, ease: n, overwrite: 'auto' }, 0)),
            (p.current[N] = I));
        });
      };
      return (
        u(),
        window.addEventListener('resize', u),
        (i = document.fonts) != null && i.ready && document.fonts.ready.then(u).catch(() => {}),
        () => window.removeEventListener('resize', u)
      );
    }, [a, n]);
    const o = (u) => {
        var v, N;
        if (t === ((v = a[u]) == null ? void 0 : v.value)) return;
        const i = p.current[u];
        i &&
          ((N = c.current[u]) == null || N.kill(),
          (c.current[u] = i.tweenTo(i.duration(), { duration: 0.3, ease: n, overwrite: 'auto' })));
      },
      g = (u) => {
        var v, N;
        if (t === ((v = a[u]) == null ? void 0 : v.value)) return;
        const i = p.current[u];
        i &&
          ((N = c.current[u]) == null || N.kill(),
          (c.current[u] = i.tweenTo(0, { duration: 0.2, ease: n, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: `pc-track pc-estado${r ? ' pc-inline' : ''}`,
      children: a.map((u, i) => {
        const v = t === u.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(u.value),
            onMouseEnter: () => o(i),
            onMouseLeave: () => g(i),
            className: `pc-pill ${v ? 'pc-active' : ''}`,
            style: v ? { background: u.color, color: '#fff' } : void 0,
            title: u.label,
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (N) => {
                  l.current[i] = N;
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
function St({
  options: a,
  transportistasOpts: t,
  vendedoresMaestro: s,
  onLookup: r,
  onLookupOrange: n,
  canRequestReopen: l,
  onOpenReopen: p,
  latestReopenRequest: c
}) {
  var ra, na;
  const o = be(),
    {
      canal: g,
      nv: u,
      lookupResult: i,
      lookupLoading: v,
      mode: N,
      estado: E,
      tipoDespacho: A,
      transportista: w,
      fechaCompromiso: k,
      fechaAprobacion: D,
      fechaAprobacionReal: C,
      fechaFacturacion: $,
      fechaDespacho: F,
      factura: G,
      guia: m,
      bultos: I,
      valorFactura: Y,
      numeroEnvio: J,
      urgente: K,
      variosTipo: U,
      variosCliente: X,
      variosVendedor: re,
      variosDivision: ee,
      variosCcosto: _,
      orangeAssociationRequired: R,
      orangeAssociationNv: q,
      orangeAssociationData: L,
      orangeAssociationLoading: f,
      orangeAssociationError: y,
      incidencia: O,
      estadoIncidencia: d,
      observacionesIncidencia: j,
      errors: S,
      submitResult: B,
      autoFilledDates: H,
      patch: P,
      markAutoFilled: te,
      clearAutoFilled: oe,
      recalcCompromiso: de
    } = o;
  (h.useEffect(() => {
    if (N === 'idle') return;
    const x = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }),
      W = Ct(E),
      ue = E.toUpperCase() === ne.SHIPPING.toUpperCase(),
      ze = {},
      Ve = [];
    (W && !F && ((ze.fechaDespacho = x), Ve.push('fechaDespacho')),
      (ue || W) && !$ && ((ze.fechaFacturacion = x), Ve.push('fechaFacturacion')),
      Ve.length > 0 && (P(ze), te(Ve)));
  }, [E, N]),
    h.useEffect(() => {
      N !== 'idle' && de();
    }, [C, N]));
  const ie = h.useMemo(() => {
      const x = new Map();
      return (s.forEach((W) => x.set(W.nombre.trim().toLowerCase(), W)), x);
    }, [s]),
    b = (x) => {
      const W = ie.get(x.trim().toLowerCase());
      P(
        W
          ? {
              variosVendedor: x,
              variosDivision: W.division || '',
              variosCcosto: W.centro_costo || ''
            }
          : { variosVendedor: x }
      );
    },
    V = ((ra = Ye.find((x) => x.value === g)) == null ? void 0 : ra.color) || le,
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
    }[g] || {
      eyebrow: 'Canal',
      title: 'Operación',
      hint: 'Selecciona un canal para comenzar.',
      tone: 'from-slate-500/10 to-slate-500/10 border-slate-200',
      badge: 'Selección',
      color: le
    },
    z = i
      ? i.found
        ? {
            container: 'bg-blue-50 text-blue-700 border-blue-200',
            iconWrap: 'bg-blue-100 text-blue-700',
            title: 'NV encontrada',
            description: `Fila ${i.row} lista para actualizar en el panel.`
          }
        : {
            container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            iconWrap: 'bg-emerald-100 text-emerald-700',
            title: 'NV nueva',
            description: 'No existe una coincidencia previa; el flujo continúa como creación.'
          }
      : null,
    Be =
      (i == null ? void 0 : i.found) &&
      ((na = i == null ? void 0 : i.data) == null ? void 0 : na.estado) === 'Entregado';
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
                            style: { border: `1px solid ${V}33`, background: `${V}12`, color: V },
                            children: [e.jsx(Ke, { size: 12 }), 'Identificación']
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
                            className: `inline-block h-2.5 w-2.5 rounded-full ${N === 'idle' ? 'bg-slate-300' : i != null && i.found ? 'bg-blue-500' : 'bg-emerald-500'}`
                          }),
                          N === 'idle'
                            ? 'Pendiente de consulta'
                            : i != null && i.found
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
                      e.jsx(At, {
                        items: Ye,
                        active: g,
                        onSelect: (x) =>
                          P({
                            canal: x,
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
                              e.jsx(Ze, {
                                size: 18,
                                className: 'absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                              }),
                              e.jsx('input', {
                                type: 'text',
                                inputMode: 'numeric',
                                value: u,
                                onChange: (x) => {
                                  const W = x.target.value;
                                  !W.trim() && N !== 'idle'
                                    ? P({
                                        nv: W,
                                        mode: 'idle',
                                        lookupResult: null,
                                        submitResult: null,
                                        errors: []
                                      })
                                    : P({ nv: W });
                                },
                                onKeyDown: (x) => x.key === 'Enter' && r(),
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
                          background: `linear-gradient(135deg, ${M.color} 0%, #18181b 100%)`
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
                  i &&
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
                                    children: i.found
                                      ? e.jsx(Va, { size: 18 })
                                      : e.jsx(Ke, { size: 18 })
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
                                children: i.found ? 'Actualizar' : 'Crear'
                              })
                            ]
                          }),
                          (() => {
                            const x = i.found ? i.data : i.autoFill;
                            if (!x) return null;
                            const W = [
                              { l: 'Cliente', v: x.cliente },
                              { l: 'Vendedor', v: x.vendedor },
                              { l: 'C. Costo', v: x.ccosto || x.centro_costo },
                              { l: 'División', v: x.division }
                            ].filter((ue) => ue.v);
                            return W.length === 0
                              ? null
                              : e.jsx('div', {
                                  className: 'mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5',
                                  children: W.map((ue) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className:
                                          'rounded-2xl border border-white/60 bg-white/70 px-3.5 py-3',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[10px] uppercase tracking-[0.16em] opacity-60 font-bold',
                                            children: ue.l
                                          }),
                                          e.jsx('div', {
                                            className: 'text-[13px] mt-1 font-semibold truncate',
                                            children: ue.v
                                          })
                                        ]
                                      },
                                      ue.l
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
                      value: q,
                      onChange: (x) =>
                        P({
                          orangeAssociationNv: x.target.value,
                          orangeAssociationError: '',
                          orangeAssociationData: null
                        }),
                      onKeyDown: (x) => x.key === 'Enter' && (n == null ? void 0 : n(q)),
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
                  disabled: f || !q.trim(),
                  className:
                    'h-11 px-5 rounded-xl bg-amber-500 text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2',
                  children: [
                    f
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
                ].map((x) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-[10px] uppercase tracking-[0.16em] text-amber-700 font-bold',
                          children: x.label
                        }),
                        e.jsx('div', {
                          className: 'mt-1 text-sm font-semibold text-slate-800 truncate',
                          children: x.value
                        })
                      ]
                    },
                    x.label
                  )
                )
              })
          ]
        }),
      Be &&
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
                l &&
                  e.jsx('button', {
                    type: 'button',
                    onClick: p,
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
                  children: Ja.map((x) =>
                    e.jsx(
                      'button',
                      {
                        type: 'button',
                        onClick: () => P({ variosTipo: x }),
                        className: `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${U === x ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'}`,
                        children: x
                      },
                      x
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
                      value: X,
                      onChange: (x) => P({ variosCliente: x.target.value }),
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
                              value: re,
                              onChange: (x) => b(x.target.value),
                              className: 'field-input',
                              placeholder: 'Selecciona o escribe'
                            }),
                            e.jsx('datalist', {
                              id: 'vendedores-list',
                              children: s.map((x) => e.jsx('option', { value: x.nombre }, x.id))
                            })
                          ]
                        })
                      : e.jsx('input', {
                          type: 'text',
                          value: re,
                          onChange: (x) => P({ variosVendedor: x.target.value }),
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
                      value: ee,
                      onChange: (x) => P({ variosDivision: x.target.value }),
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
                      onChange: (x) => P({ variosCcosto: x.target.value }),
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
                      value: C,
                      onChange: (x) => P({ fechaAprobacionReal: x.target.value }),
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
                  children: e.jsx(sa, {
                    items: wt.map((x) => ({ value: x, label: x, color: Te(x) })),
                    active: E,
                    onSelect: (x) => P({ estado: x })
                  })
                }),
                e.jsxs('button', {
                  type: 'button',
                  onClick: () => P({ urgente: !K }),
                  className: `w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-3.5 border-2 transition-all ${K ? 'bg-red-50 border-red-400 shadow-sm shadow-red-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`,
                  children: [
                    e.jsxs('span', {
                      className: 'flex items-center gap-2.5',
                      children: [
                        e.jsx('span', {
                          className: `text-xl transition-transform ${K ? 'scale-110' : 'opacity-40 grayscale'}`,
                          children: '🚨'
                        }),
                        e.jsxs('span', {
                          className: 'flex flex-col items-start',
                          children: [
                            e.jsx('span', {
                              className: `text-sm font-bold ${K ? 'text-red-600' : 'text-gray-700'}`,
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
                      className: `relative w-12 h-6 rounded-full transition-colors shrink-0 ${K ? 'bg-red-500' : 'bg-gray-300'}`,
                      children: e.jsx('span', {
                        className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${K ? 'translate-x-6' : ''}`
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
                          value: A,
                          onChange: (x) => P({ tipoDespacho: x.target.value }),
                          className: 'field-input',
                          children: [
                            e.jsx('option', { value: '', children: '— Seleccionar —' }),
                            (
                              (a == null ? void 0 : a.tiposDespacho) || [
                                'Courier - Inyección',
                                'Directo',
                                'Courier (Retiro / Pick-up)'
                              ]
                            ).map((x) => e.jsx('option', { value: x, children: x }, x))
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
                              onChange: (x) => P({ transportista: x.target.value }),
                              className: 'field-input',
                              children: [
                                e.jsx('option', { value: '', children: '— Seleccionar —' }),
                                (w && !t.includes(w) ? [w, ...t] : t).map((x) =>
                                  e.jsx('option', { value: x, children: x }, x)
                                )
                              ]
                            })
                          : e.jsx('input', {
                              type: 'text',
                              value: w,
                              onChange: (x) => P({ transportista: x.target.value }),
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
                              H.has('fechaCompromiso')
                                ? e.jsx('span', {
                                    className: 'ml-1 normal-case',
                                    style: { color: le },
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
                            value: k,
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
                          children: 'Fecha Aprobación Real'
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: C,
                          onChange: (x) => P({ fechaAprobacionReal: x.target.value }),
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
                            H.has('fechaFacturacion') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: le },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: $,
                          onChange: (x) => {
                            (P({ fechaFacturacion: x.target.value }), oe('fechaFacturacion'));
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
                            H.has('fechaDespacho') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: le },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: F,
                          onChange: (x) => {
                            (P({ fechaDespacho: x.target.value }), oe('fechaDespacho'));
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
                          value: G,
                          onChange: (x) => P({ factura: x.target.value }),
                          className: 'field-input'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Guía' }),
                        e.jsx('input', {
                          type: 'text',
                          value: m,
                          onChange: (x) => P({ guia: x.target.value }),
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
                          onChange: (x) => P({ bultos: x.target.value }),
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
                              value: Y,
                              onChange: (x) =>
                                P({ valorFactura: x.target.value.replace(/[^0-9.]/g, '') }),
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
                          value: J,
                          onChange: (x) => P({ numeroEnvio: x.target.value }),
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
                    children: ya.map((x) => {
                      const W = O === x,
                        ue =
                          x === 'PROBLEMAS DE DIRECCIÓN'
                            ? xa
                            : x === 'PROBLEMAS DE TRANSPORTE'
                              ? fa
                              : je;
                      return e.jsxs(
                        'button',
                        {
                          type: 'button',
                          onClick: () =>
                            P({
                              incidencia: W ? '' : x,
                              estadoIncidencia: W ? 'ABIERTA' : d || 'ABIERTA'
                            }),
                          className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${W ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                          children: [e.jsx(ue, { size: 14 }), x]
                        },
                        x
                      );
                    })
                  }),
                  O &&
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
                              onChange: (x) => P({ estadoIncidencia: x.target.value }),
                              className: 'field-input',
                              children: _a.map((x) => e.jsx('option', { value: x, children: x }, x))
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
                              value: O,
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
                              onChange: (x) => P({ observacionesIncidencia: x.target.value }),
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
                children: S.map((x, W) =>
                  e.jsxs(
                    'p',
                    {
                      className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                      children: [e.jsx('span', { children: '⚠' }), x]
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
function Rt({ toast: a }) {
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
function kt(a) {
  const t = a.nvs.map((r) => r.nv).join(' · '),
    s = a.fecha_comprometida ? ` · Compromiso ${a.fecha_comprometida}` : ' · sin fecha';
  return `${a.ticket} · NV ${t || '—'}${s}`;
}
function Fe(a, t = {}) {
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
function Dt({ operador: a }) {
  const [t, s] = h.useState([]),
    [r, n] = h.useState(!0),
    [l, p] = h.useState(''),
    [c, o] = h.useState(''),
    [g, u] = h.useState(!1),
    [i, v] = h.useState(''),
    [N, E] = h.useState(!1),
    [A, w] = h.useState([]),
    [k, D] = h.useState(''),
    [C, $] = h.useState(''),
    [F, G] = h.useState(!1),
    m = h.useCallback(async () => {
      (n(!0), p(''));
      try {
        s(await jt());
      } catch (_) {
        p((_ == null ? void 0 : _.message) || 'Error al cargar consolidados');
      } finally {
        n(!1);
      }
    }, []);
  h.useEffect(() => {
    m();
  }, [m]);
  const I = (_) => {
      (o(_), setTimeout(() => o(''), 3e3));
    },
    Y = async () => {
      const _ = i.trim();
      if (_) {
        if (A.some((R) => R.nv === _)) {
          I(`La NV ${_} ya está en la lista`);
          return;
        }
        E(!0);
        try {
          const R = await da(_);
          if (!R) {
            I(`NV ${_} no existe en la base`);
            return;
          }
          (w((q) => [...q, { nv: R.nv, canal: R.canal, cliente: R.cliente }]), v(''));
        } finally {
          E(!1);
        }
      }
    },
    J = async () => {
      if (A.length === 0) {
        I('Agrega al menos una NV');
        return;
      }
      G(!0);
      const _ = await Ce({
        fecha_comprometida: k || null,
        observacion: C || null,
        created_by: a || null,
        nvs: A
      });
      if ((G(!1), !_.ok)) {
        I(_.error || 'Error al crear');
        return;
      }
      (I(`✓ ${_.ticket || 'Consolidado'} creado`), w([]), D(''), $(''), u(!1), m());
    },
    K = async (_, R) => {
      const q = await Ce(Fe(_, { fecha_comprometida: R || null }));
      if (!q.ok) {
        I(q.error || 'Error');
        return;
      }
      s((L) => L.map((f) => (f.id === _.id ? { ...f, fecha_comprometida: R || null } : f)));
    },
    U = async (_) => {
      const R = _.estado === 'cerrado' ? 'abierto' : 'cerrado',
        q = await Ce(Fe(_, { estado: R }));
      if (!q.ok) {
        I(q.error || 'Error');
        return;
      }
      s((L) => L.map((f) => (f.id === _.id ? { ...f, estado: R } : f)));
    },
    X = async (_) => {
      if (!confirm(`¿Eliminar ${_.ticket}? Las NVs volverán a medirse con las 48 hrs.`)) return;
      const R = await yt(_.id);
      if (!R.ok) {
        I(R.error || 'Error');
        return;
      }
      (I(`${_.ticket} eliminado`), s((q) => q.filter((L) => L.id !== _.id)));
    },
    re = async (_, R) => {
      const q = _.nvs
          .filter((f) => f.id !== R)
          .map((f) => ({ nv: f.nv, canal: f.canal, cliente: f.cliente })),
        L = await Ce(Fe(_, { nvs: q }));
      if (!L.ok) {
        I(L.error || 'Error');
        return;
      }
      s((f) => f.map((y) => (y.id === _.id ? { ...y, nvs: y.nvs.filter((O) => O.id !== R) } : y)));
    },
    ee = async (_, R, q) => {
      const L = R.trim();
      if (!L) return;
      const f = await da(L);
      if (!f) {
        I(`NV ${L} no existe`);
        return;
      }
      const y = [
          ..._.nvs.map((d) => ({ nv: d.nv, canal: d.canal, cliente: d.cliente })),
          { nv: f.nv, canal: f.canal, cliente: f.cliente }
        ],
        O = await Ce(Fe(_, { nvs: y }));
      if (!O.ok) {
        I(O.error || 'Error');
        return;
      }
      (q(), m());
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
          !g &&
            e.jsx('button', {
              onClick: () => u(!0),
              className: 'px-3 py-2 rounded-lg text-white text-[13px] font-semibold',
              style: { background: le },
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
                  value: i,
                  onChange: (_) => v(_.target.value),
                  onKeyDown: (_) => {
                    _.key === 'Enter' && (_.preventDefault(), Y());
                  },
                  placeholder: 'N° NV (ej. 5646)',
                  className: 'inp flex-1 min-w-[160px]'
                }),
                e.jsx('button', {
                  onClick: Y,
                  disabled: N,
                  className:
                    'px-3 py-2 rounded-lg bg-gray-800 text-white text-[13px] font-medium disabled:opacity-50',
                  children: N ? 'Validando…' : 'Agregar NV'
                })
              ]
            }),
            A.length > 0 &&
              e.jsx('div', {
                className: 'flex flex-wrap gap-1.5 mb-3',
                children: A.map((_) =>
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
                      value: k,
                      onChange: (_) => D(_.target.value),
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
                      value: C,
                      onChange: (_) => $(_.target.value),
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
                  onClick: J,
                  disabled: F || A.length === 0,
                  className:
                    'px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-50',
                  style: { background: le },
                  children: F ? 'Creando…' : 'Crear consolidado'
                }),
                e.jsx('button', {
                  onClick: () => {
                    (u(!1), w([]), D(''), $(''), v(''));
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
              children: t.map((_) =>
                e.jsx(
                  Ot,
                  { c: _, onSetFecha: K, onToggle: U, onEliminar: X, onQuitarNv: re, onAddNv: ee },
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
function Ot({ c: a, onSetFecha: t, onToggle: s, onEliminar: r, onQuitarNv: n, onAddNv: l }) {
  const [p, c] = h.useState(''),
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
                style: { background: o ? '#6b7280' : le },
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
                    onChange: (g) => t(a, g.target.value),
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
            onChange: (g) => c(g.target.value),
            onKeyDown: (g) => {
              g.key === 'Enter' && (g.preventDefault(), l(a, p, () => c('')));
            },
            placeholder: '+ Agregar NV',
            className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg flex-1 max-w-[200px]'
          }),
          e.jsx('button', {
            onClick: () => l(a, p, () => c('')),
            className: 'text-[12px] px-2 py-1 rounded-lg bg-gray-800 text-white',
            children: 'Agregar'
          })
        ]
      }),
      e.jsx('p', {
        className: 'mt-2 text-[11px] text-gray-400 font-mono select-all',
        children: kt(a)
      })
    ]
  });
}
const ve = (a) => (a ? String(a).slice(0, 10) : ''),
  Tt = ['Entregado', 'En Proceso', 'Shipping', 'Currier', 'En Ruta'],
  ma = 60,
  It = 80;
function Pt(a, t) {
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
function Vt(a, t) {
  const s = t || a;
  if (!s) return '';
  const r = new Date(s + 'T12:00:00');
  if (isNaN(r.getTime())) return '';
  const n = Pt(r, 2);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}
const Ge = [
  { label: 'Registrada', dateKey: 'fecha_registro_nv' },
  { label: 'Aprobada', dateKey: 'fecha_aprobacion' },
  { label: 'En Proceso', dateKey: 'fecha_en_proceso' },
  { label: 'Shipping', dateKey: 'fecha_shipping' },
  { label: 'Despachada', dateKey: 'fecha_despacho' },
  { label: 'En Ruta', dateKey: 'fecha_en_ruta' },
  { label: 'Entregada', dateKey: 'fecha_entregado' }
];
function Ft(a, t) {
  if (!a || !t) return null;
  const s = new Date(a).getTime(),
    r = new Date(t).getTime();
  if (isNaN(s) || isNaN(r)) return null;
  const n = Math.round((r - s) / 864e5);
  return n >= 0 ? n : null;
}
function $t({ data: a }) {
  const t = Ge.map((r) => ve(a[r.dateKey]));
  let s = -1;
  for (let r = t.length - 1; r >= 0; r--)
    if (t[r]) {
      s = r;
      break;
    }
  return e.jsx('div', {
    className: 'flex flex-col gap-0',
    children: Ge.map((r, n) => {
      const l = t[n],
        p = !!l,
        c = n === s,
        o = n > 0 ? t[n - 1] : '',
        g = n > 0 && l && o ? Ft(o, l) : null,
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
                  className: `rounded-full shrink-0 flex items-center justify-center transition-all ${c ? 'w-5 h-5 ring-4 ring-orange-100' : p ? 'w-4 h-4' : 'w-3.5 h-3.5 border-2 border-gray-300'}`,
                  style: { background: c ? '#f57c00' : p ? '#22c55e' : 'transparent' },
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
                n < Ge.length - 1 &&
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
                      className: `text-[12px] font-semibold ${c ? 'text-orange-600' : p ? 'text-gray-800' : 'text-gray-400'}`,
                      children: r.label
                    }),
                    g !== null &&
                      e.jsxs('span', {
                        className: `text-[10px] font-bold px-1.5 py-0.5 rounded-full ${u ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`,
                        children: [g, 'd']
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
function Mt({
  item: a,
  puedeEscribir: t,
  puedeEliminar: s,
  puedeAprobarReapertura: r,
  opts: n,
  onClose: l,
  onSaved: p,
  onDeleted: c
}) {
  const [o, g] = h.useState(null),
    [u, i] = h.useState(!0),
    [v, N] = h.useState({}),
    [E, A] = h.useState(!1),
    [w, k] = h.useState(!1),
    [D, C] = h.useState(!1),
    [$, F] = h.useState(null),
    [G, m] = h.useState([]),
    [I, Y] = h.useState(!1),
    [J, K] = h.useState(''),
    [U, X] = h.useState(''),
    [re, ee] = h.useState(!1),
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
      i(!1),
      dt(a.id, { canal: a.canal, nv: a.nv }).then((V) => {
        b && (g(V.found ? V.data : null), N({}), i(!1));
      }),
      () => {
        b = !1;
      }
    );
  }, [a, q]);
  const L = h.useCallback(async () => {
    if (!(a != null && a.id)) return (m([]), []);
    Y(!0);
    try {
      const b = await ka(a.id);
      return (m(b), b);
    } catch {
      return (m([]), []);
    } finally {
      Y(!1);
    }
  }, [a == null ? void 0 : a.id]);
  h.useEffect(() => {
    L();
  }, [L]);
  const f = (b) => (b in v ? v[b] : ((o == null ? void 0 : o[b]) ?? '' ?? '')),
    y = (b, V) => {
      N((M) => {
        const z = { ...M, [b]: V };
        return (
          b === 'fecha_aprobacion_real' &&
            (z.fecha_compromiso = Vt(ve(o == null ? void 0 : o.fecha_aprobacion), V)),
          z
        );
      });
    },
    O = h.useMemo(() => {
      const b = {};
      return (
        Object.keys(v).forEach((V) => {
          const M = (o == null ? void 0 : o[V]) ?? '';
          String(v[V] ?? '') !== String(M ?? '') && (b[V] = v[V]);
        }),
        b
      );
    }, [v, o]),
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
      (A(!0), F(null));
      const b = { id: a.id };
      Object.entries(O).forEach(([M, z]) => {
        b[d[M] || M] = M === 'urgente' ? String(z) === 'true' : z;
      });
      const V = await Ra(b);
      (A(!1),
        V.ok
          ? (F({ success: !0, message: 'Cambios guardados' }),
            p == null ||
              p({
                ...a,
                estado: f('estado') || a.estado,
                transportista: f('transportista'),
                urgente: String(f('urgente')) === 'true'
              }),
            setTimeout(l, 700))
          : F({ success: !1, message: V.message || V.error || 'No se pudo guardar' }));
    },
    S = async () => {
      k(!0);
      const b = await Nt(a.id);
      (k(!1),
        b.ok
          ? ($e.success(`NV ${a.nv} eliminada`), c == null || c(a), l())
          : (F({ success: !1, message: b.error || 'No se pudo eliminar' }), C(!1)));
    },
    B = (n == null ? void 0 : n.transportistas) || [],
    H = String(f('urgente')) === 'true',
    P = qe.includes(f('estado')) || !!f('incidencia'),
    te = G.find((b) => b.estado === 'PENDIENTE') || null,
    oe = (o == null ? void 0 : o.estado) === 'Entregado',
    de = async () => {
      const b = String(J || '').trim();
      if (!b) {
        F({ success: !1, message: 'Debes indicar el motivo de la reapertura.' });
        return;
      }
      ee(!0);
      const V = await Da(a.id, b);
      (ee(!1),
        V.ok
          ? (K(''),
            await L(),
            F({ success: !0, message: V.message || 'Solicitud de reapertura enviada.' }))
          : F({
              success: !1,
              message: V.message || V.error || 'No se pudo solicitar la reapertura.'
            }));
    },
    ie = async (b) => {
      if (!(te != null && te.id)) return;
      R(!0);
      const V = await vt(te.id, b, U);
      if ((R(!1), !V.ok)) {
        F({ success: !1, message: V.message || V.error || 'No se pudo resolver la solicitud.' });
        return;
      }
      const M = await Ie(a.canal, a.nv);
      (M.found &&
        (g(M.data),
        N({}),
        p == null ||
          p({
            ...a,
            estado: M.data.estado || a.estado,
            transportista: M.data.transportista || a.transportista,
            urgente: String(M.data.urgente) === 'true' || M.data.urgente === !0,
            reabierta: M.data.reabierta === !0,
            motivoReapertura: M.data.motivo_reapertura || ''
          })),
        X(''),
        await L(),
        F({ success: !0, message: V.message || 'Solicitud resuelta correctamente.' }));
    };
  return Qe.createPortal(
    e.jsxs('div', {
      className: 'panel-portal fixed inset-0 z-[120] flex justify-end',
      onClick: l,
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
                          style: { background: Te(a.estado) }
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
                                children: e.jsx($t, { data: o })
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
                                        children: o.motivo_reapertura || 'Sin motivo informado.'
                                      }),
                                      o.fecha_reapertura &&
                                        e.jsxs('div', {
                                          className: 'mt-1 text-xs text-slate-500',
                                          children: ['Aprobada el ', ve(o.fecha_reapertura)]
                                        })
                                    ]
                                  })
                                ]
                              })
                            }),
                          oe
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
                                        : te
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
                                                        children: e.jsx(Xe, { size: 16 })
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
                                                            children: te.motivo
                                                          }),
                                                          e.jsxs('div', {
                                                            className:
                                                              'mt-1 text-xs text-slate-500',
                                                            children: [
                                                              'Solicitada por',
                                                              ' ',
                                                              te.solicitada_por_nombre || 'Usuario',
                                                              ' el',
                                                              ' ',
                                                              ve(te.solicitada_at)
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
                                                        onChange: (b) => X(b.target.value),
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
                                                            onClick: () => ie(!0),
                                                            disabled: _,
                                                            className:
                                                              'rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50',
                                                            children: _
                                                              ? 'Procesando...'
                                                              : 'Aprobar y reabrir'
                                                          }),
                                                          e.jsx('button', {
                                                            type: 'button',
                                                            onClick: () => ie(!1),
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
                                                    value: J,
                                                    onChange: (b) => K(b.target.value),
                                                    className: 'field-input min-h-[96px] resize-y',
                                                    placeholder:
                                                      'Motivo obligatorio de reapertura: por qué se necesita devolver esta N.V. a En Proceso...'
                                                  }),
                                                  e.jsx('button', {
                                                    type: 'button',
                                                    onClick: de,
                                                    disabled: re,
                                                    className:
                                                      'w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50',
                                                    children: re
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
                                            items: wa.map((b) => ({
                                              value: b,
                                              label: b,
                                              color: Te(b)
                                            })),
                                            active: f('estado'),
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
                                                  value: f('tipo_despacho'),
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
                                                      value: f('transportista'),
                                                      onChange: (b) =>
                                                        y('transportista', b.target.value),
                                                      className: 'field-input',
                                                      children: [
                                                        e.jsx('option', {
                                                          value: '',
                                                          children: '—'
                                                        }),
                                                        (f('transportista') &&
                                                        !B.includes(f('transportista'))
                                                          ? [f('transportista'), ...B]
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
                                                      value: f('transportista'),
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
                                              onClick: () => y('urgente', H ? 'false' : 'true'),
                                              className: `relative w-11 h-6 rounded-full transition-colors ${H ? 'bg-red-500' : 'bg-gray-200'}`,
                                              children: e.jsx('span', {
                                                className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${H ? 'translate-x-5' : ''}`
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
                                                  value: f('fecha_aprobacion_real'),
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
                                                        color: f('fecha_compromiso')
                                                          ? le
                                                          : '#9ca3af'
                                                      },
                                                      children: '(auto)'
                                                    })
                                                  ]
                                                }),
                                                e.jsx('input', {
                                                  type: 'date',
                                                  value: f('fecha_compromiso'),
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
                                                  value: f('fecha_facturacion'),
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
                                                  value: f('fecha_despacho'),
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
                                                  value: f('factura'),
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
                                                  value: f('guia'),
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
                                                  value: f('numero_envio'),
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
                                                  value: f('bultos'),
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
                                                      value: f('valor_factura'),
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
                                    P &&
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
                                            children: ya.map((b) => {
                                              const V = f('incidencia') === b,
                                                M =
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
                                                    const z = !V;
                                                    (y('incidencia', z ? b : ''),
                                                      y(
                                                        'estado_incidencia',
                                                        (z && f('estado_incidencia')) || 'ABIERTA'
                                                      ),
                                                      z || y('observaciones_incidencia', ''));
                                                  },
                                                  className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${V ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                                                  children: [e.jsx(M, { size: 14 }), b]
                                                },
                                                b
                                              );
                                            })
                                          }),
                                          f('incidencia') &&
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
                                                      value: f('estado_incidencia') || 'ABIERTA',
                                                      onChange: (b) =>
                                                        y('estado_incidencia', b.target.value),
                                                      className: 'field-input',
                                                      children: _a.map((b) =>
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
                                                      value: f('observaciones_incidencia'),
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
                          $ &&
                            e.jsxs('div', {
                              className: `rounded-xl px-3.5 py-3 text-[13px] ${$.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`,
                              children: [$.success ? '✓ ' : '⚠ ', $.message]
                            })
                        ]
                      })
                    : e.jsx('div', {
                        className: 'py-20 text-center text-sm text-gray-400',
                        children: 'No se pudieron cargar los datos de esta NV.'
                      })
            }),
            o &&
              ((t && !oe) || s) &&
              e.jsxs('div', {
                className: 'shrink-0 bg-white border-t border-gray-200 p-4 space-y-2',
                children: [
                  t &&
                    !oe &&
                    Object.keys(O).length > 0 &&
                    e.jsx('button', {
                      onClick: j,
                      disabled: E,
                      className:
                        'w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60',
                      style: { background: le },
                      children: E
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
                        : `Guardar ${Object.keys(O).length} cambio${Object.keys(O).length !== 1 ? 's' : ''}`
                    }),
                  s &&
                    (D
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
                                  onClick: () => C(!1),
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
                          onClick: () => C(!0),
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
const qt = h.memo(function ({ i: t, onOpen: s }) {
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
              style: { background: Te(t.estado) }
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
function Lt({ puedeEscribir: a, puedeEliminar: t, puedeAprobarReapertura: s }) {
  const [r, n] = h.useState([]),
    [l, p] = h.useState(!0),
    [c, o] = h.useState('Todos'),
    [g, u] = h.useState(''),
    [i, v] = h.useState(null),
    [N, E] = h.useState([]),
    [A, w] = h.useState(!1),
    [k, D] = h.useState(null),
    [C, $] = h.useState(null),
    [F, G] = h.useState(!1),
    [m, I] = h.useState(ma),
    Y = h.useRef(null),
    J = h.useRef(0),
    K = h.useRef(''),
    U = h.useRef(null),
    X = h.useRef(null);
  h.useEffect(() => {
    K.current = g;
  }, [g]);
  const re = h.useCallback((f = !1) => {
    (U.current && (clearTimeout(U.current), (U.current = null)),
      p(!0),
      Ue({ force: f, full: !1, limit: 400 })
        .then((y) => {
          (n(y),
            p(!1),
            (U.current = setTimeout(() => {
              (typeof document < 'u' && document.hidden) ||
                K.current.trim().length >= 2 ||
                Ue({ force: f, full: !0 })
                  .then((O) => {
                    if (K.current.trim().length >= 2) {
                      X.current = O;
                      return;
                    }
                    n((d) => (O.length >= d.length ? O : d));
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
      re(),
      () => {
        U.current && clearTimeout(U.current);
      }
    ),
    [re]
  );
  const ee = g.trim().length >= 2;
  (h.useEffect(() => {
    const f = g.trim();
    if (f.length < 2) {
      if ((E([]), X.current)) {
        const y = X.current;
        ((X.current = null), n((O) => (y.length >= O.length ? y : O)));
      }
      U.current ||
        (U.current = setTimeout(() => {
          K.current.trim().length >= 2 ||
            Ue({ full: !0 })
              .then((y) => {
                n((O) => (y.length >= O.length ? y : O));
              })
              .catch(() => {})
              .finally(() => {
                U.current = null;
              });
        }, 400));
      return;
    }
    E(lt(r, f, { limit: 120 }));
  }, [g, r]),
    h.useEffect(() => {
      const f = g.trim();
      if (f.length < 2) {
        (v(null), w(!1));
        return;
      }
      w(!0);
      const y = J.current + 1;
      J.current = y;
      const O = setTimeout(() => {
        ot(f, { limit: 120 })
          .then((d) => {
            J.current === y && v(d);
          })
          .catch(() => {
            J.current === y && v([]);
          })
          .finally(() => {
            J.current === y && w(!1);
          });
      }, 220);
      return () => clearTimeout(O);
    }, [g]));
  const _ = h.useCallback(async () => {
      G(!0);
      try {
        const f = await ht();
        if (!f.length) {
          $e.warning('No hay operaciones para exportar.');
          return;
        }
        (Ba({ filename: 'Operaciones_NV', sheets: [{ name: 'Notas de Venta', rows: f }] }),
          $e.success(`Exportadas ${f.length} N.V. a Excel`));
      } catch (f) {
        $e.error('No se pudo exportar: ' + ((f == null ? void 0 : f.message) || 'error'));
      } finally {
        G(!1);
      }
    }, []),
    R = h.useMemo(
      () =>
        ee ? it(N, i || [], g, { limit: 160 }) : r.filter((f) => c === 'Todos' || f.estado === c),
      [ee, N, i, g, r, c]
    ),
    q = h.useMemo(() => R.slice(0, m), [R, m]),
    L = h.useMemo(() => {
      const f = {};
      return (
        r.forEach((y) => {
          f[y.estado] = (f[y.estado] || 0) + 1;
        }),
        f
      );
    }, [r]);
  return (
    h.useEffect(() => {
      I((f) => {
        const y = Math.min(R.length, ma);
        return f === y && f <= R.length ? f : y;
      });
    }, [ee, c, g, R.length]),
    h.useEffect(() => {
      !k ||
        C ||
        Ea()
          .then($)
          .catch(() => {});
    }, [k, C]),
    h.useEffect(() => {
      if (m >= R.length) return;
      const f = Y.current;
      if (!f) return;
      const y = new IntersectionObserver(
        (O) => {
          O.some((d) => d.isIntersecting) && I((d) => Math.min(d + It, R.length));
        },
        { root: null, rootMargin: '240px 0px', threshold: 0 }
      );
      return (y.observe(f), () => y.disconnect());
    }, [m, R.length]),
    e.jsxs('div', {
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          className: 'relative',
          children: [
            e.jsx(Ze, {
              size: 16,
              className: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            }),
            e.jsx('input', {
              value: g,
              onChange: (f) => u(f.target.value),
              placeholder: 'Buscar por NV, cliente, guía o factura (cualquier estado)…',
              className:
                'w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none bg-white'
            }),
            A &&
              e.jsx(Ee, {
                size: 16,
                className: 'absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin'
              })
          ]
        }),
        !ee &&
          (() => {
            const f = qe
              .filter((y) => (L[y] || 0) > 0)
              .map((y) => ({ value: y, label: y, color: Te(y), count: L[y] || 0 }));
            return f.length === 0
              ? null
              : e.jsx(sa, {
                  items: f,
                  active: c,
                  inline: !0,
                  onSelect: (y) => o(c === y ? 'Todos' : y)
                });
          })(),
        e.jsxs('div', {
          className: 'flex items-center justify-between gap-2 flex-wrap',
          children: [
            e.jsx('span', {
              className: 'text-[12px] text-gray-400',
              children: ee
                ? `${q.length} de ${R.length} resultado${R.length !== 1 ? 's' : ''} · búsqueda en todos los estados`
                : `${q.length} de ${R.length} activas visibles · total activas ${r.length}`
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsxs('button', {
                  onClick: _,
                  disabled: F,
                  className:
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition-colors',
                  title: 'Descargar TODAS las N.V. (todas las columnas) a Excel',
                  children: [
                    F
                      ? e.jsx(Ee, { size: 14, className: 'animate-spin' })
                      : e.jsx($a, { size: 14 }),
                    F ? 'Exportando…' : 'Exportar Excel'
                  ]
                }),
                e.jsx('button', {
                  onClick: () => re(!0),
                  className:
                    'inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-orange-600 font-medium',
                  children: '↻ Recargar'
                })
              ]
            })
          ]
        }),
        (l && !ee) || (A && !i)
          ? e.jsx('div', {
              className: 'py-16 flex justify-center',
              children: e.jsx(Ee, { className: 'animate-spin text-orange-500', size: 30 })
            })
          : R.length === 0
            ? e.jsx('div', {
                className: 'text-center py-16 text-gray-400 text-sm',
                children: ee
                  ? 'Sin N.V. que coincidan con la búsqueda.'
                  : 'Sin N.V. activas para este filtro.'
              })
            : e.jsxs('div', {
                className: 'space-y-2',
                children: [
                  q.map((f) => e.jsx(qt, { i: f, onOpen: D }, f.key)),
                  m < R.length &&
                    e.jsx('div', {
                      ref: Y,
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
        k &&
          e.jsx(Mt, {
            item: k,
            puedeEscribir: a,
            puedeEliminar: t,
            puedeAprobarReapertura: s,
            opts: C,
            onClose: () => D(null),
            onSaved: (f) => {
              (n((y) => y.map((O) => (O.key === f.key ? { ...O, ...f } : O))),
                v((y) => y && y.map((O) => (O.key === f.key ? { ...O, ...f } : O))));
            },
            onDeleted: (f) => {
              (n((y) => y.filter((O) => O.key !== f.key)),
                v((y) => y && y.filter((O) => O.key !== f.key)));
            }
          })
      ]
    })
  );
}
function Bt({ canal: a, nv: t, onClose: s }) {
  var l;
  const r = Oa(),
    n = (((l = Ye.find((p) => p.value === a)) == null ? void 0 : l.label) || a || '').toUpperCase();
  return Qe.createPortal(
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
                  style: { background: le },
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
function zt({
  item: a,
  puedeEscribir: t,
  puedeAprobarReapertura: s,
  motivo: r,
  onMotivoChange: n,
  onRequestReopen: l,
  requesting: p,
  onClose: c
}) {
  if (!a) return null;
  const o = a.estado === 'Entregado',
    g = o
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
                  children: g
                })
              }),
              e.jsxs('div', {
                className: 'flex flex-col gap-5 sm:flex-row sm:items-start',
                children: [
                  e.jsx('div', {
                    className: `mt-0.5 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl ${o ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`,
                    children: o ? e.jsx(ga, { size: 34 }) : e.jsx(je, { size: 34 })
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
                    e.jsx(Xe, { size: 20, className: 'text-orange-600' }),
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
                  disabled: p,
                  className:
                    'mt-4 w-full rounded-2xl bg-orange-500 px-4 py-4 text-base font-black uppercase tracking-[0.12em] text-white disabled:opacity-50',
                  children: p ? 'Enviando solicitud...' : 'Enviar solicitud de reapertura'
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
function Ut({ puedeEscribir: a, puedeAprobarReapertura: t }) {
  var f, y, O;
  const s = be(),
    [r, n] = h.useState(null),
    [l, p] = h.useState(null),
    [c, o] = h.useState([]),
    [g, u] = h.useState(null),
    [i, v] = h.useState(null),
    [N, E] = h.useState(''),
    [A, w] = h.useState(!1),
    [k, D] = h.useState([]),
    [C, $] = h.useState(null),
    [F, G] = h.useState(null);
  (h.useEffect(() => {
    Ea()
      .then(n)
      .catch(() => {});
  }, []),
    h.useEffect(() => {
      La()
        .then(o)
        .catch(() => o([]));
    }, []),
    h.useEffect(() => {
      if (!l) return;
      const d = setTimeout(() => p(null), 3e3);
      return () => clearTimeout(d);
    }, [l]));
  const m = (f = s.lookupResult) != null && f.found ? s.lookupResult : null,
    I = ((y = m == null ? void 0 : m.data) == null ? void 0 : y.estado) === 'Entregado',
    Y = k.find((d) => d.estado === 'PENDIENTE') || null,
    J = h.useMemo(
      () =>
        s.mode !== 'update' || !(m != null && m.data)
          ? !1
          : String(s.estado || '') !== String(m.data.estado || '') ||
            !!s.urgente != !!m.data.urgente ||
            String(s.fechaFacturacion || '') !== String(ve(m.data.fecha_facturacion) || '') ||
            String(s.fechaDespacho || '') !== String(ve(m.data.fecha_despacho) || ''),
      [
        s.mode,
        s.estado,
        s.urgente,
        s.fechaFacturacion,
        s.fechaDespacho,
        m == null ? void 0 : m.data
      ]
    ),
    K =
      s.mode === 'update' &&
      (C == null ? void 0 : C.permitida) === !1 &&
      (F == null ? void 0 : F.permitida) === !0 &&
      J;
  h.useEffect(() => {
    var j;
    let d = !1;
    if (!(m != null && m.row) || !a) {
      ($(null), G(null));
      return;
    }
    return (
      Promise.all([
        gt(m.row),
        bt(
          m.row,
          s.estado || ((j = m == null ? void 0 : m.data) == null ? void 0 : j.estado) || null
        )
      ])
        .then(([S, B]) => {
          d || ($(S), G(B));
        })
        .catch(() => {
          d ||
            ($({ permitida: !1, message: 'No se pudo validar el acceso IAM para esta N.V.' }),
            G({ permitida: !1, message: 'No se pudo validar la transición de estado.' }));
        }),
      () => {
        d = !0;
      }
    );
  }, [
    m == null ? void 0 : m.row,
    (O = m == null ? void 0 : m.data) == null ? void 0 : O.estado,
    a,
    s.estado
  ]);
  const U = h.useCallback(async (d) => {
      if (!d) return (D([]), []);
      try {
        const j = await ka(d);
        return (D(j), j);
      } catch {
        return (D([]), []);
      }
    }, []),
    X = h.useCallback(
      (d, j = k) => {
        if (!d) return;
        const S = j.find((B) => B.estado === 'PENDIENTE') || null;
        v({ ...d, pendingRequest: S });
      },
      [k]
    ),
    re = h.useCallback(
      async (d) => {
        var S, B, H;
        (s.patch({ lookupResult: { found: !0, row: d.row, data: d.data } }), s.applyFound(d.data));
        const j = s.canal === 'ptm' && ia((S = d.data) == null ? void 0 : S.cliente);
        (s.patch({
          orangeAssociationRequired: j,
          orangeAssociationError: '',
          orangeAssociationData: null,
          orangeAssociationNv: ((B = d.data) == null ? void 0 : B.nv_orange) || ''
        }),
          j && (H = d.data) != null && H.nv_orange && (await _(d.data.nv_orange)));
      },
      [s]
    );
  h.useEffect(() => {
    if (!(m != null && m.row)) {
      D([]);
      return;
    }
    U(m.row);
  }, [m == null ? void 0 : m.row, U]);
  const ee = h.useCallback(() => {
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
          const S = await ut(j, ee());
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
      [ee, s]
    ),
    R = async () => {
      var S, B, H, P, te, oe, de;
      const d = String(s.nv || '').trim();
      if (!d) return;
      s.patch({ lookupLoading: !0, submitResult: null, errors: [] });
      const j = await Ie(s.canal, d);
      if (j.found) {
        await re(j);
        const ie = ((S = j.data) == null ? void 0 : S.estado) === 'Entregado' ? await U(j.row) : [];
        Tt.includes((B = j.data) == null ? void 0 : B.estado) &&
          X(
            {
              id: j.row,
              canal: s.canal,
              nv: d,
              estado: (H = j.data) == null ? void 0 : H.estado,
              reabierta: ((P = j.data) == null ? void 0 : P.reabierta) === !0,
              motivo_reapertura: ((te = j.data) == null ? void 0 : te.motivo_reapertura) || ''
            },
            ie
          );
      } else if (s.canal !== 'varios' && !((oe = j.autoFill) != null && oe.cliente)) {
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
          D([]),
          s.patch({ lookupResult: { found: !1, autoFill: j.autoFill } }),
          s.applyNew(j.autoFill || {}));
        const ie = s.canal === 'ptm' && ia((de = j.autoFill) == null ? void 0 : de.cliente);
        s.patch({
          orangeAssociationRequired: ie,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        });
      }
      s.patch({ lookupLoading: !1 });
    },
    q = async () => {
      const d = (m == null ? void 0 : m.row) || (i == null ? void 0 : i.id),
        j = String(N || '').trim();
      if (!d) return;
      if (!j) {
        s.patch({
          submitResult: { success: !1, message: 'Debes indicar el motivo de la reapertura.' }
        });
        return;
      }
      w(!0);
      const S = await Da(d, j);
      if ((w(!1), !S.ok)) {
        const H = S.message || S.error || 'No se pudo solicitar la reapertura.';
        (s.patch({ submitResult: { success: !1, message: H } }), p({ type: 'error', message: H }));
        return;
      }
      const B = await U(d);
      (E(''),
        m != null &&
          m.data &&
          X(
            {
              id: m.row,
              canal: s.canal,
              nv: s.nv,
              estado: m.data.estado,
              reabierta: m.data.reabierta === !0,
              motivo_reapertura: m.data.motivo_reapertura || ''
            },
            B
          ),
        s.patch({
          submitResult: { success: !0, message: S.message || 'Solicitud de reapertura enviada.' }
        }),
        p({ type: 'success', message: S.message || 'Solicitud de reapertura enviada.' }));
    },
    L = async () => {
      var te, oe, de, ie, b, V, M;
      const d = be.getState();
      if (d.mode === 'idle') return;
      if (!d.estado) {
        d.patch({ submitResult: { success: !1, message: 'Falta el Estado' } });
        return;
      }
      if (
        d.mode === 'update' &&
        m != null &&
        m.row &&
        (C == null ? void 0 : C.permitida) === !1 &&
        !K
      ) {
        (d.patch({
          submitResult: {
            success: !1,
            message: C.message || 'No tienes permisos IAM para editar esta N.V.'
          }
        }),
          p({
            type: 'error',
            message: C.message || 'No tienes permisos IAM para editar esta N.V.'
          }));
        return;
      }
      if (
        (te = d.lookupResult) != null &&
        te.found &&
        ((de = (oe = d.lookupResult) == null ? void 0 : oe.data) == null ? void 0 : de.estado) ===
          'Entregado'
      ) {
        const z = await U(d.lookupResult.row);
        (X(
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
          (ie = d.lookupResult) != null && ie.found
            ? d.lookupResult.data
            : (b = d.lookupResult) == null
              ? void 0
              : b.autoFill,
        S = d.orangeAssociationData,
        B = {
          id: d.mode === 'update' ? ((V = d.lookupResult) == null ? void 0 : V.row) : null,
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
        H = await Ra(B);
      if ((be.getState().patch({ submitting: !1 }), H.ok)) {
        (v(null),
          D([]),
          p({
            type: 'success',
            message: `NV ${B.nv} ${B.mode === 'update' ? 'actualizada' : 'creada'}`
          }),
          be.getState().reset());
        return;
      }
      let P = H.message || H.error || 'No se pudo guardar';
      if (H.duplicate || H.locked) {
        const z = await Ie(d.canal, d.nv);
        if (z.found) {
          await re(z);
          const Be =
            ((M = z.data) == null ? void 0 : M.estado) === 'Entregado' ? await U(z.row) : [];
          X(
            {
              id: z.row,
              canal: d.canal,
              nv: d.nv,
              estado: z.data.estado,
              reabierta: z.data.reabierta === !0,
              motivo_reapertura: z.data.motivo_reapertura || ''
            },
            Be
          );
        }
      }
      (be.getState().patch({ submitResult: { success: !1, message: P } }),
        p({ type: 'error', message: P }));
    };
  return e.jsxs('div', {
    className: 'pb-24',
    children: [
      e.jsx(St, {
        options: r,
        transportistasOpts: (r == null ? void 0 : r.transportistas) || [],
        vendedoresMaestro: c,
        onLookup: R,
        onLookupOrange: _,
        canRequestReopen: a,
        onOpenReopen: () => {
          var d, j, S;
          return X({
            id: m == null ? void 0 : m.row,
            canal: s.canal,
            nv: s.nv,
            estado: (d = m == null ? void 0 : m.data) == null ? void 0 : d.estado,
            reabierta: ((j = m == null ? void 0 : m.data) == null ? void 0 : j.reabierta) === !0,
            motivo_reapertura:
              ((S = m == null ? void 0 : m.data) == null ? void 0 : S.motivo_reapertura) || ''
          });
        },
        latestReopenRequest: Y
      }),
      g && e.jsx(Bt, { canal: g.canal, nv: g.nv, onClose: () => u(null) }),
      i &&
        e.jsx(zt, {
          item: i,
          puedeEscribir: a,
          puedeAprobarReapertura: t,
          motivo: N,
          onMotivoChange: E,
          onRequestReopen: q,
          requesting: A,
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
                    (C == null ? void 0 : C.permitida) === !1 &&
                    !K &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold',
                      children: C.message || 'Sin acceso IAM para editar esta N.V.'
                    }),
                  s.mode === 'update' &&
                    (C == null ? void 0 : C.permitida) === !1 &&
                    K &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold',
                      children:
                        (F == null ? void 0 : F.message) ||
                        'Tienes permiso para cambiar estado, pero no para editar otros campos de esta N.V.'
                    }),
                  I &&
                    a &&
                    e.jsxs('button', {
                      onClick: () => {
                        var d, j, S;
                        return X({
                          id: m == null ? void 0 : m.row,
                          canal: s.canal,
                          nv: s.nv,
                          estado: (d = m == null ? void 0 : m.data) == null ? void 0 : d.estado,
                          reabierta:
                            ((j = m == null ? void 0 : m.data) == null ? void 0 : j.reabierta) ===
                            !0,
                          motivo_reapertura:
                            ((S = m == null ? void 0 : m.data) == null
                              ? void 0
                              : S.motivo_reapertura) || '',
                          pendingRequest: Y
                        });
                      },
                      className:
                        'px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-black text-sm flex items-center gap-2',
                      children: [e.jsx(Xe, { size: 16 }), 'Solicitar reapertura']
                    }),
                  e.jsxs('button', {
                    onClick: L,
                    disabled:
                      s.submitting ||
                      I ||
                      (s.mode === 'update' && (C == null ? void 0 : C.permitida) === !1 && !K),
                    className:
                      'px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2',
                    children: [
                      s.submitting
                        ? e.jsx(Ee, { size: 16, className: 'animate-spin' })
                        : e.jsx(Ma, { size: 16 }),
                      I
                        ? 'N.V. bloqueada'
                        : s.mode === 'update' && (C == null ? void 0 : C.permitida) === !1 && !K
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
      e.jsx(Rt, { toast: l })
    ]
  });
}
function Gt() {
  const { user: a } = ba();
  return e.jsx(Dt, { operador: (a == null ? void 0 : a.nombre) || '' });
}
const Kt = ['angelica@ptm.cl'];
function Ht(a) {
  return a
    ? a.rol === 'ADMIN' ||
        a.es_admin_delegado === !0 ||
        Kt.includes((a.email || '').trim().toLowerCase())
    : !1;
}
function ns() {
  const { hasPermission: a, user: t } = ba(),
    s = a('manage_panel'),
    r = a('approve_panel_reopen_nv') || a('manage_roles'),
    n = Ht(t),
    [l, p] = h.useState('buscar'),
    c = [
      { v: 'buscar', label: 'Buscar', hint: 'Seguimiento y consulta', icon: Ze, accent: '#2563eb' },
      { v: 'ingresar', label: 'Ingresar', hint: 'Registro operativo', icon: Ke, accent: le },
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
            children: c.map((o) => {
              const g = o.icon,
                u = l === o.v;
              return e.jsxs(
                'button',
                {
                  type: 'button',
                  onClick: () => p(o.v),
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
        e.jsx(Lt, { puedeEscribir: s, puedeEliminar: n, puedeAprobarReapertura: r }),
      l === 'ingresar' && e.jsx(Ut, { puedeEscribir: s, puedeAprobarReapertura: r }),
      l === 'consolidados' && s && e.jsx(Gt, {})
    ]
  });
}
export { ns as default };
