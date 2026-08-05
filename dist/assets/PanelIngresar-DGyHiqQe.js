import { j as e } from './query-vendor-BNjBrM5A.js';
import { r as b, b as Ye, u as Oa } from './react-vendor-6aw4XXjH.js';
import {
  X as Ta,
  S as Ue,
  ai as Ia,
  x as Qe,
  p as Pa,
  aj as Va,
  ak as oa,
  Y as je,
  al as xa,
  ah as fa,
  n as $a,
  t as $e,
  a7 as Ae,
  am as Fa,
  a0 as Ze,
  an as Ma,
  ao as ha,
  ap as ga,
  aq as La
} from './ui-vendor-naG2PYVT.js';
import { s as L, L as ye, w as me, u as ba } from './index-BOgf3xmh.js';
import { f as qa } from './configService-BHYk7m0u.js';
import { e as Ba } from './exportExcel-D85v870c.js';
import { c as za } from './index-DH2X3u_W.js';
import { g as J } from './animation-vendor-JfdD7EdN.js';
import './supabase-vendor-4Fjsfb0a.js';
import './xlsx-B2eTCt_Q.js';
import './charts-vendor-7leLLwOT.js';
function Ua({ titulo: a, onClose: t, children: s, maxWidth: r = 'max-w-3xl', fullscreen: n = !1 }) {
  return (
    b.useEffect(() => {
      const o = (i) => i.key === 'Escape' && (t == null ? void 0 : t());
      document.addEventListener('keydown', o);
      const d = document.body.style.overflow;
      return (
        (document.body.style.overflow = 'hidden'),
        () => {
          (document.removeEventListener('keydown', o), (document.body.style.overflow = d));
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
const se = 'tms_operaciones_vigentes',
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
  ie = { ts: 0, data: null, promise: null };
const ge = new Map(),
  Ne = new Map(),
  Se = new Map();
function ja() {
  ((Ge = { ts: 0, data: null, promise: null }),
    (Ke = { ts: 0, data: null, promise: null }),
    (va = { ts: 0, data: null, promise: null }),
    (Na = { ts: 0, data: null, promise: null }),
    (ie = { ts: 0, data: null, promise: null }),
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
function _e(a, t, s) {
  return (a.set(t, { ts: Date.now(), value: s }), s);
}
function ea(a, t, s) {
  return (a.set(t, { ts: Date.now(), promise: s }), s);
}
function Fe(a) {
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
async function pe(
  a,
  t,
  { screen: s = 'PanelIngresar', payload: r = null, slowMs: n = 900, message: o = '' } = {}
) {
  const d = performance.now();
  try {
    const i = await t(),
      l = Fe(d);
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
        durationMs: Fe(d),
        status: 'error',
        payload: r
      }),
      i
    );
  }
}
function Ja(a) {
  return /timed out acquiring connection|connection pool/i.test(
    String((a == null ? void 0 : a.message) || a || '')
  );
}
async function We(a, { ms: t, label: s, attempts: r = 3 } = {}) {
  let n;
  for (let o = 0; o < r; o += 1) {
    if (
      ((n = await me(a(), { ms: t, label: s })), !Ja(n == null ? void 0 : n.error) || o === r - 1)
    )
      return n;
    const d = 180 * 2 ** o + Math.floor(Math.random() * 70);
    (ye.warn(n.error, {
      module: 'panel',
      screen: 'PanelIngresar',
      action: 'pool_acquire_retry',
      message: `Reintento de lectura por saturación transitoria del pool: ${s}`,
      attempt: o + 1,
      delayMs: d
    }),
      await new Promise((i) => setTimeout(i, d)));
  }
  return n;
}
async function we(a, t, { screen: s = 'PanelIngresar', payload: r = null, message: n = '' } = {}) {
  const o = performance.now();
  try {
    const d = await t(),
      i = Fe(o);
    return (d == null ? void 0 : d.ok) === !1
      ? (ye.error(new Error(d.error || d.message || `Operacion fallida: ${a}`), {
          module: 'panel',
          screen: s,
          action: a,
          message: `Operacion fallida: ${a}`,
          durationMs: i,
          status: 'failed',
          payload: r,
          context: { result: d }
        }),
        d)
      : (ye.audit({
          module: 'panel',
          screen: s,
          action: a,
          message: n || `Operacion ejecutada: ${a}`,
          durationMs: i,
          status: 'ok',
          payload: r
        }),
        d);
  } catch (d) {
    throw (
      ye.error(d, {
        module: 'panel',
        screen: s,
        action: a,
        message: `Fallo operacion critica: ${a}`,
        durationMs: Fe(o),
        status: 'error',
        payload: r
      }),
      d
    );
  }
}
const He = [
    { value: 'ptm', label: 'PTM', color: '#ea580c' },
    { value: 'orange', label: 'Orange', color: '#f59e0b' },
    { value: 'farmapack', label: 'Farmapack', color: '#0f766e' },
    { value: 'varios', label: 'Varios', color: '#4f46e5' }
  ],
  et = ['N.V ANTICIPADA', 'DEMO', 'REGALO', 'BOLETA', 'GUÍA SALIDA'],
  ya = ['PROBLEMAS DE DIRECCIÓN', 'PROBLEMAS DE TRANSPORTE', 'OTRO'],
  _a = ['ABIERTA', 'EN GESTIÓN', 'RESUELTA'],
  wa = ['En Proceso', 'Shipping', 'Currier', 'En Ruta', 'Entregado'],
  Me = ['En Proceso', 'Shipping', 'Currier', 'En Ruta'],
  Ea = ['Courier - Inyección', 'Directo', 'Courier (Retiro / Pick-up)'],
  at = {
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
  Oe = (a) => at[a] || '#9ca3af',
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
  tt = new Set(['de', 'del', 'la', 'las', 'los']),
  la = (a) =>
    ue(a)
      .split(' ')
      .filter((t) => t && !tt.has(t)),
  st = (a) =>
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
function Re(a) {
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
function rt(a) {
  return ue(a).split(' ').filter(Boolean);
}
function nt(a) {
  const t = he((a == null ? void 0 : a.nv) || ''),
    s = xe((a == null ? void 0 : a.guia) || ''),
    r = xe((a == null ? void 0 : a.factura) || ''),
    n = ue((a == null ? void 0 : a.cliente) || ''),
    o = ue((a == null ? void 0 : a.vendedor) || ''),
    d = ue((a == null ? void 0 : a.transportista) || ''),
    i = xe((a == null ? void 0 : a.canal) || ''),
    l = xe((a == null ? void 0 : a.estado) || ''),
    x = [t, s, r, n, o, d, i, l].filter(Boolean).join(' '),
    m = new Set(x.split(' ').filter(Boolean));
  return {
    nv: t,
    guia: s,
    factura: r,
    cliente: n,
    vendedor: o,
    transportista: d,
    canal: i,
    estado: l,
    searchable: x,
    words: m
  };
}
function ot(a, t) {
  const s = String(t || '').trim();
  if (!s) return Number.NEGATIVE_INFINITY;
  const r = he(s),
    n = xe(s),
    o = ue(s),
    d = rt(s),
    i = nt(a);
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
    d.length > 0)
  ) {
    let x = 0;
    (d.forEach((m) => {
      if (i.words.has(m)) {
        ((x += 1), (l += 950));
        return;
      }
      for (const c of i.words)
        if (c.startsWith(m)) {
          ((x += 0.6), (l += 360));
          return;
        }
      i.searchable.includes(m) && (l += 120);
    }),
      x >= d.length && (l += 1600));
  }
  return (
    n && i.searchable.includes(n) && (l += 600),
    a != null && a.urgente && (l += 45),
    (l += Math.min(ke(a) / 1e9, 120)),
    l
  );
}
function De(a, t, s = 200) {
  const r = new Map();
  return (
    (a || []).forEach((n) => {
      if (!(n != null && n.key)) return;
      const o = ot(n, t);
      if (!Number.isFinite(o) || o <= 0) return;
      const d = r.get(n.key);
      (!d || o > d.score || (o === d.score && ke(n) > ke(d.item))) &&
        r.set(n.key, { item: n, score: o });
    }),
    Array.from(r.values())
      .sort((n, o) => o.score - n.score || ke(o.item) - ke(n.item))
      .slice(0, s)
      .map(({ item: n }) => n)
  );
}
function ke(a) {
  return (
    Date.parse((a == null ? void 0 : a.fecha_estado) || '') ||
    Date.parse((a == null ? void 0 : a.fecha_aprobacion_real) || '') ||
    Date.parse((a == null ? void 0 : a.fecha_aprobacion) || '') ||
    0
  );
}
async function lt({ force: a = !1, full: t = !0, limit: s = 400 } = {}) {
  return pe(
    'lista_activas',
    async () => {
      const r = Date.now(),
        n = t ? Ge : Ke;
      if (!a && n.data && r - n.ts < Ga) return n.data;
      if (!a && n.promise) return n.promise;
      const o = async () => {
        if (!t) {
          const { data: m, error: c } = await L.from(se)
            .select(le)
            .in('estado', Me)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .limit(s);
          if (c) throw c;
          const g = (m || []).map(Re);
          return ((Ke = { ts: Date.now(), data: g, promise: null }), g);
        }
        const d = [];
        let i = 0;
        const l = 500;
        for (;;) {
          const { data: m, error: c } = await L.from(se)
            .select(le)
            .in('estado', Me)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .range(i, i + l - 1);
          if (c) throw c;
          if (!m || m.length === 0 || (d.push(...m), m.length < l)) break;
          i += l;
        }
        const x = d.map(Re);
        return ((Ge = { ts: Date.now(), data: x, promise: null }), x);
      };
      return (
        (n.promise = o().catch((d) => {
          throw ((n.promise = null), d);
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
        n = Je(ge, r, Wa);
      if (n) return n;
      const o = s.replace(/[(),*]/g, ' ').trim();
      if (!o) return [];
      const i = (async () => {
        if (/^\d{4,}$/.test(o)) {
          const A = await We(
            () =>
              L.from(Xe)
                .select(le)
                .or(`nv_ptm.eq.${Number(o)},nv_orange.eq.${o},nv_farmapack.eq.${o},varios.eq.${o}`)
                .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                .order('id', { ascending: !1 })
                .limit(4),
            { ms: 2500, label: 'Busqueda exacta de N.V. del Panel' }
          );
          if (A != null && A.error) throw A.error;
          const _ = De((A.data || []).map(Re), s, Math.min(t, 20));
          if (_.length) return _e(ge, r, _);
          const R = Math.min(t, 60),
            D = `${o}%`,
            C = await We(
              () =>
                L.from(se)
                  .select(le)
                  .or(
                    `nv_ptm.eq.${Number(o)},nv_orange.ilike.${D},nv_farmapack.ilike.${D},varios.ilike.${D},guia.ilike.${D},factura.ilike.${D}`
                  )
                  .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                  .order('id', { ascending: !1 })
                  .limit(R),
              { ms: 3e3, label: 'Busqueda numerica del Panel' }
            );
          if (C != null && C.error) throw C.error;
          const V = De((C.data || []).map(Re), s, t);
          return _e(ge, r, V);
        }
        const x = `*${o}*`,
          m = [];
        m.push(
          `nv_orange.ilike.${x}`,
          `nv_farmapack.ilike.${x}`,
          `varios.ilike.${x}`,
          `cliente.ilike.${x}`,
          `vendedor.ilike.${x}`,
          `guia.ilike.${x}`,
          `factura.ilike.${x}`,
          `transportista.ilike.${x}`
        );
        let c = null,
          g = null;
        if (
          (({ data: c, error: g } = await me(
            L.from(se)
              .select(le)
              .or(m.join(','))
              .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
              .limit(t),
            { ms: 4e3, label: 'Busqueda remota amplia del Panel' }
          )),
          g)
        ) {
          const A = Math.min(t, 60),
            _ = `${o}*`,
            D = (
              await Promise.allSettled([
                me(L.from(se).select(le).ilike('nv_orange', _).limit(A), {
                  ms: 2500,
                  label: 'Fallback nv_orange Panel'
                }),
                me(L.from(se).select(le).ilike('nv_farmapack', _).limit(A), {
                  ms: 2500,
                  label: 'Fallback nv_farmapack Panel'
                }),
                me(L.from(se).select(le).ilike('varios', _).limit(A), {
                  ms: 2500,
                  label: 'Fallback varios Panel'
                }),
                me(L.from(se).select(le).ilike('guia', _).limit(A), {
                  ms: 2500,
                  label: 'Fallback guia Panel'
                }),
                me(L.from(se).select(le).ilike('factura', _).limit(A), {
                  ms: 2500,
                  label: 'Fallback factura Panel'
                }),
                o.length >= 4
                  ? me(L.from(se).select(le).ilike('cliente', _).limit(A), {
                      ms: 2500,
                      label: 'Fallback cliente Panel'
                    })
                  : Promise.resolve({ data: [] })
              ])
            )
              .filter((C) => {
                var V;
                return (
                  C.status === 'fulfilled' && Array.isArray((V = C.value) == null ? void 0 : V.data)
                );
              })
              .flatMap((C) => C.value.data || []);
          if (D.length) ((c = D), (g = null));
          else throw g;
        }
        const v = new Map();
        (c || []).forEach((A) => {
          const _ = Ee(A);
          if (!_) return;
          const R = `${Ie(A)}:${_}`;
          v.has(R) || v.set(R, Re(A));
        });
        const S = De(Array.from(v.values()), s, t);
        return _e(ge, r, S);
      })().catch((l) => {
        throw (ge.delete(r), l);
      });
      return ea(ge, r, i);
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
async function Ca({ force: a = !1, includeHistoricos: t = !1 } = {}) {
  return pe(
    'cargar_opciones',
    async () => {
      const s = Date.now(),
        r = t ? va : Na;
      if (!a && r.data && s - r.ts < Ka) return r.data;
      if (!a && r.promise) return r.promise;
      const n = async () => {
        const o = new Set(),
          { data: d } = await L.from('tms_panel_transportistas')
            .select('nombre')
            .eq('activo', !0)
            .order('nombre', { ascending: !0 });
        if (
          ((d || []).forEach((x) => {
            const m = (x.nombre || '').trim();
            m && o.add(m);
          }),
          t)
        ) {
          let x = 0;
          const m = 1e3;
          for (;;) {
            const { data: c, error: g } = await L.from(se)
              .select('transportista')
              .not('transportista', 'is', null)
              .order('id', { ascending: !0 })
              .range(x, x + m - 1);
            if (
              g ||
              !c ||
              c.length === 0 ||
              (c.forEach((v) => {
                const S = (v.transportista || '').trim();
                S && o.add(S);
              }),
              c.length < m)
            )
              break;
            x += m;
          }
        }
        const i = [...o].sort((x, m) => x.localeCompare(m, 'es')),
          l = { estados: wa, transportistas: i, tiposDespacho: Ea };
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
const Aa =
  'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,centro_costo,division,estado,transportista,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_facturacion,fecha_despacho,fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,factura,guia,bultos,valor_factura,numero_envio,urgente,incidencia,estado_incidencia,observaciones_incidencia,reabierta,fecha_reapertura,motivo_reapertura';
async function aa(a, t) {
  const s = he(t);
  if (!s) return null;
  const r = `${String(a).toLowerCase()}:${s}`,
    n = Je(Se, r, Ya);
  if (n) return n;
  const d = (async () => {
    const { data: i } = await L.from('tms_nv_catalogo')
      .select('cliente, vendedor, fecha_aprobacion, centro_costo, division')
      .eq('canal', String(a).toLowerCase())
      .eq('nv', s)
      .limit(1);
    return _e(Se, r, (i && i[0]) || null);
  })().catch((i) => {
    throw (Se.delete(r), i);
  });
  return ea(Se, r, d);
}
async function ut() {
  const a = Date.now();
  if (ie.data && a - ie.ts < Qa) return ie.data;
  if (ie.promise) return ie.promise;
  const t = async () => {
    const { data: s } = await L.from('tms_panel_vendedores')
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
async function ta(a) {
  const t = String(a || '').trim();
  if (!t) return null;
  const s = await ut();
  if (!s || s.length === 0) return null;
  const r = ue(t),
    n = la(t),
    d = s
      .map((i) => {
        const l = ue(i.nombre),
          x = la(i.nombre),
          m = l === r,
          c = !m && (l.includes(r) || r.includes(l)),
          g = n.filter((_) => x.includes(_)).length,
          v = n.length > 0 && n.every((_) => x.includes(_)),
          S = x.length > 0 && x.every((_) => n.includes(_));
        let A = 0;
        return (
          m ? (A += 1e3) : c ? (A += 700) : (v || S) && (A += 500),
          (A += g * 100),
          (A -= Math.abs(l.length - r.length)),
          { ...i, score: A }
        );
      })
      .filter((i) => i.score >= 200)
      .sort((i, l) => l.score - i.score)[0];
  return d ? { centro_costo: d.centro_costo || '', division: d.division || '' } : null;
}
async function Te(a, t) {
  return pe(
    'lookup_nv',
    async () => {
      const s = he(t);
      if (!s)
        return { found: !1, autoFill: { cliente: '', vendedor: '', ccosto: '', division: '' } };
      const r = `${String(a).toLowerCase()}:${s}`,
        n = Je(Ne, r, Ha);
      if (n) return n;
      const d = (async () => {
        const i = st(a),
          [l, x] = await Promise.all([
            We(
              () => {
                let _ = L.from(Xe).select(Aa).order('fecha_estado', { ascending: !1 }).limit(1);
                return a === 'ptm' && /^\d+$/.test(s) ? _.eq(i, Number(s)) : _.eq(i, s);
              },
              { ms: 2500, label: 'Lookup exacto de N.V. del Panel' }
            ),
            aa(a, s)
          ]);
        if (l != null && l.error) throw l.error;
        const m = (l == null ? void 0 : l.data) || [],
          c = m && m.length ? m[0] : null,
          g = (c == null ? void 0 : c.cliente) || (x == null ? void 0 : x.cliente) || '',
          v = (c == null ? void 0 : c.vendedor) || (x == null ? void 0 : x.vendedor) || '';
        let S =
            (c == null ? void 0 : c.centro_costo) || (x == null ? void 0 : x.centro_costo) || '',
          A = (c == null ? void 0 : c.division) || (x == null ? void 0 : x.division) || '';
        if (v && (!S || !A)) {
          const _ = await ta(v);
          _ && ((S = S || _.centro_costo || ''), (A = A || _.division || ''));
        }
        if (c) {
          const _ = {
            found: !0,
            row: c.id,
            data: {
              ...c,
              canal: a,
              nv: Ee(c),
              estado: c.estado,
              cliente: g,
              vendedor: v,
              ccosto: S,
              division: A,
              fecha_compromiso: fe(c.fecha_compromiso),
              fecha_registro_nv: fe(c.fecha_registro_nv)
            }
          };
          return _e(Ne, r, _);
        }
        return _e(Ne, r, {
          found: !1,
          autoFill: { cliente: g, vendedor: v, ccosto: S, division: A }
        });
      })().catch((i) => {
        throw (Ne.delete(r), i);
      });
      return ea(Ne, r, d);
    },
    { payload: { canal: a, nv: he(t) }, slowMs: 550, message: 'Lookup de N.V. en Panel' }
  );
}
async function pt(a, { canal: t = null, nv: s = null } = {}) {
  return pe(
    'lookup_nv_by_id',
    async () => {
      if (!a) return Te(t, s);
      const { data: r, error: n } = await L.from(Xe).select(Aa).eq('id', a).limit(1);
      if (n) throw n;
      const o = r && r.length ? r[0] : null;
      if (!o) return Te(t, s);
      const d = t || Ie(o),
        i = s || Ee(o),
        l = await aa(d, i),
        x = (o == null ? void 0 : o.cliente) || (l == null ? void 0 : l.cliente) || '',
        m = (o == null ? void 0 : o.vendedor) || (l == null ? void 0 : l.vendedor) || '';
      let c = (o == null ? void 0 : o.centro_costo) || (l == null ? void 0 : l.centro_costo) || '',
        g = (o == null ? void 0 : o.division) || (l == null ? void 0 : l.division) || '';
      if (m && (!c || !g)) {
        const S = await ta(m);
        S && ((c = c || S.centro_costo || ''), (g = g || S.division || ''));
      }
      return {
        found: !0,
        row: o.id,
        data: {
          ...o,
          canal: d,
          nv: i,
          estado: o.estado,
          cliente: x,
          vendedor: m,
          ccosto: c,
          division: g,
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
  const r = await aa('orange', s);
  if (!r) return null;
  let n = r.centro_costo || '',
    o = r.division || '';
  const d = r.vendedor || t.vendedor || '';
  if (d && (!n || !o)) {
    const i = await ta(d);
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
  Sa = (a) => {
    const t = String(a).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return t ? `${t[3]}/${t[2]}/${t[1]}` : String(a);
  },
  gt = (a) => {
    const t = String(a).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    return t ? `${t[3]}/${t[2]}/${t[1]} ${t[4]}:${t[5]}` : Sa(a);
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
        const { data: n, error: o } = await L.from(se)
          .select(a)
          .order('id', { ascending: !0 })
          .range(s, s + r - 1);
        if (o) throw o;
        if (!n || n.length === 0 || (t.push(...n), n.length < r)) break;
        s += r;
      }
      return t.map((n) => {
        const o = {};
        ca.forEach(([m, c]) => {
          let g = n[m];
          (m === 'urgente'
            ? (g = g === !0 ? 'SÍ' : 'NO')
            : g == null || g === ''
              ? (g = '')
              : ft.has(m)
                ? (g = Sa(g))
                : ht.has(m) && (g = gt(g)),
            (o[c] = g));
        });
        const d = Ie(n),
          i = Ee(n),
          l = (n.nv_ptm && n.nv_orange) || '',
          x = {
            'CANAL OPERACIÓN': String(d || '').toUpperCase(),
            'N.V OPERACIÓN': i || '',
            'N.V ORANGE ASOCIADA PTM': l,
            'PTM CON ASOCIACIÓN ORANGE': n.nv_ptm ? (n.nv_orange ? 'SÍ' : 'NO') : ''
          };
        return (
          xt.forEach(([, m]) => {
            o[m] = x[m] || '';
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
function Le(a, t) {
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
      const { data: r, error: n } = await L.rpc('guardar_nv', { p: t }),
        o = Le(r, n);
      return ((o == null ? void 0 : o.ok) !== !1 && ja(), o);
    },
    { payload: Xa(t), message: 'Guardado de N.V. en Panel' }
  );
}
async function vt(a) {
  if (!a) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: t, error: s } = await L.rpc('iam_puede_editar_nv', { p_id: a });
  return s
    ? { permitida: !1, message: s.message || 'No se pudo validar el acceso IAM.' }
    : t || { permitida: !1, message: 'No se pudo validar el acceso IAM.' };
}
async function Nt(a, t = null) {
  if (!a) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: s, error: r } = await L.rpc('iam_puede_cambiar_estado_nv', {
    p_id: a,
    p_estado: t
  });
  return r
    ? { permitida: !1, message: r.message || 'No se pudo validar la transición de estado.' }
    : s || { permitida: !1, message: 'No se pudo validar la transición de estado.' };
}
async function Ra(a) {
  return pe(
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
  return we(
    'solicitar_reapertura_nv',
    async () => {
      const { data: s, error: r } = await L.rpc('solicitar_reapertura_nv', {
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
async function jt(a, t, s = '') {
  return we(
    'resolver_reapertura_nv',
    async () => {
      const { data: r, error: n } = await L.rpc('resolver_reapertura_nv', {
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
async function yt(a) {
  return we(
    'eliminar_nv',
    async () => {
      const { data: t, error: s } = await L.rpc('eliminar_nv', { p_id: a }),
        r = Le(t, s);
      return ((r == null ? void 0 : r.ok) !== !1 && ja(), r);
    },
    { payload: { id: a }, message: 'Eliminacion de N.V. en Panel' }
  );
}
async function _t() {
  return pe(
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
  return we(
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
async function wt(a) {
  return we(
    'eliminar_consolidado',
    async () => {
      const { data: t, error: s } = await L.rpc('eliminar_consolidado', { p_id: a });
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
      const { data: r } = await L.from(se)
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
  Ct = [ae.EN_PROCESO, ae.SHIPPING, ae.CURRIER, ae.EN_RUTA, ae.ENTREGADO];
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
    d = String(n.getMonth() + 1).padStart(2, '0'),
    i = String(n.getDate()).padStart(2, '0');
  return `${o}-${d}-${i}`;
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
    const o = b.useRef([]),
      d = b.useRef([]),
      i = b.useRef([]),
      l = b.useRef([]);
    (b.useEffect(() => {
      var g;
      const c = () => {
        o.current.forEach((v, S) => {
          var Q;
          if (!(v != null && v.parentElement)) return;
          const A = v.parentElement,
            _ = A.getBoundingClientRect(),
            { width: R, height: D } = _;
          if (R === 0 || D === 0) return;
          const C = ((R * R) / 4 + D * D) / (2 * D),
            V = Math.ceil(2 * C) + 2,
            $ = Math.ceil(C - Math.sqrt(Math.max(0, C * C - (R * R) / 4))) + 1,
            Y = V - $;
          ((v.style.width = `${V}px`),
            (v.style.height = `${V}px`),
            (v.style.bottom = `-${$}px`),
            J.set(v, { xPercent: -50, scale: 0, transformOrigin: `50% ${Y}px` }));
          const f = A.querySelector('.pc-label'),
            I = A.querySelector('.pc-label-hover');
          (f && J.set(f, { y: 0 }),
            I && J.set(I, { y: D + 12, opacity: 0 }),
            (Q = d.current[S]) == null || Q.kill());
          const W = J.timeline({ paused: !0 });
          (W.to(v, { scale: 1.2, xPercent: -50, duration: 2, ease: n, overwrite: 'auto' }, 0),
            f && W.to(f, { y: -(D + 8), duration: 2, ease: n, overwrite: 'auto' }, 0),
            I &&
              (J.set(I, { y: Math.ceil(D + 100), opacity: 0 }),
              W.to(I, { y: 0, opacity: 1, duration: 2, ease: n, overwrite: 'auto' }, 0)),
            (d.current[S] = W));
        });
      };
      return (
        c(),
        window.addEventListener('resize', c),
        (g = document.fonts) != null && g.ready && document.fonts.ready.then(c).catch(() => {}),
        () => window.removeEventListener('resize', c)
      );
    }, [a, n]),
      b.useEffect(() => {
        a.forEach((c, g) => {
          var V;
          const v = l.current[g],
            S = d.current[g],
            A = o.current[g],
            _ = v == null ? void 0 : v.querySelector('.pc-label'),
            R = v == null ? void 0 : v.querySelector('.pc-label-hover'),
            D = t === c.value,
            C = c.color || r;
          if (((V = i.current[g]) == null || V.kill(), !(!v || !A || !S))) {
            if (D) {
              ((v.style.background = C),
                (v.style.color = '#ffffff'),
                J.set(A, { scale: 1.2, xPercent: -50 }),
                _ && J.set(_, { y: -(v.offsetHeight + 8) }),
                R && J.set(R, { y: 0, opacity: 1 }),
                S.progress(1).pause());
              return;
            }
            ((v.style.background = ''),
              (v.style.color = ''),
              J.set(A, { scale: 0, xPercent: -50 }),
              _ && J.set(_, { y: 0 }),
              R && J.set(R, { y: v.offsetHeight + 12, opacity: 0 }),
              S.progress(0).pause());
          }
        });
      }, [t, a, r]));
    const x = (c) => {
        var v, S;
        if (t === ((v = a[c]) == null ? void 0 : v.value)) return;
        const g = d.current[c];
        g &&
          ((S = i.current[c]) == null || S.kill(),
          (i.current[c] = g.tweenTo(g.duration(), { duration: 0.3, ease: n, overwrite: 'auto' })));
      },
      m = (c) => {
        var v, S;
        if (t === ((v = a[c]) == null ? void 0 : v.value)) return;
        const g = d.current[c];
        g &&
          ((S = i.current[c]) == null || S.kill(),
          (i.current[c] = g.tweenTo(0, { duration: 0.2, ease: n, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: 'pc-track',
      children: a.map((c, g) => {
        const v = t === c.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(c.value),
            onMouseEnter: () => x(g),
            onMouseLeave: () => m(g),
            className: `pc-pill ${v ? 'pc-active' : ''}`,
            'aria-pressed': v,
            ref: (S) => {
              l.current[g] = S;
            },
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (S) => {
                  o.current[g] = S;
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
  sa = ({ items: a, active: t, onSelect: s, inline: r = !1, ease: n = 'power3.easeOut' }) => {
    const o = b.useRef([]),
      d = b.useRef([]),
      i = b.useRef([]);
    b.useEffect(() => {
      var c;
      const m = () => {
        o.current.forEach((g, v) => {
          var W;
          if (!(g != null && g.parentElement)) return;
          const S = g.parentElement,
            A = S.getBoundingClientRect(),
            { width: _, height: R } = A;
          if (_ === 0 || R === 0) return;
          const D = ((_ * _) / 4 + R * R) / (2 * R),
            C = Math.ceil(2 * D) + 2,
            V = Math.ceil(D - Math.sqrt(Math.max(0, D * D - (_ * _) / 4))) + 1,
            $ = C - V;
          ((g.style.width = `${C}px`),
            (g.style.height = `${C}px`),
            (g.style.bottom = `-${V}px`),
            J.set(g, { xPercent: -50, scale: 0, transformOrigin: `50% ${$}px` }));
          const Y = S.querySelector('.pc-label'),
            f = S.querySelector('.pc-label-hover');
          (Y && J.set(Y, { y: 0 }),
            f && J.set(f, { y: R + 12, opacity: 0 }),
            (W = d.current[v]) == null || W.kill());
          const I = J.timeline({ paused: !0 });
          (I.to(g, { scale: 1.2, xPercent: -50, duration: 2, ease: n, overwrite: 'auto' }, 0),
            Y && I.to(Y, { y: -(R + 8), duration: 2, ease: n, overwrite: 'auto' }, 0),
            f &&
              (J.set(f, { y: Math.ceil(R + 100), opacity: 0 }),
              I.to(f, { y: 0, opacity: 1, duration: 2, ease: n, overwrite: 'auto' }, 0)),
            (d.current[v] = I));
        });
      };
      return (
        m(),
        window.addEventListener('resize', m),
        (c = document.fonts) != null && c.ready && document.fonts.ready.then(m).catch(() => {}),
        () => window.removeEventListener('resize', m)
      );
    }, [a, n]);
    const l = (m) => {
        var g, v;
        if (t === ((g = a[m]) == null ? void 0 : g.value)) return;
        const c = d.current[m];
        c &&
          ((v = i.current[m]) == null || v.kill(),
          (i.current[m] = c.tweenTo(c.duration(), { duration: 0.3, ease: n, overwrite: 'auto' })));
      },
      x = (m) => {
        var g, v;
        if (t === ((g = a[m]) == null ? void 0 : g.value)) return;
        const c = d.current[m];
        c &&
          ((v = i.current[m]) == null || v.kill(),
          (i.current[m] = c.tweenTo(0, { duration: 0.2, ease: n, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: `pc-track pc-estado${r ? ' pc-inline' : ''}`,
      children: a.map((m, c) => {
        const g = t === m.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(m.value),
            onMouseEnter: () => l(c),
            onMouseLeave: () => x(c),
            className: `pc-pill ${g ? 'pc-active' : ''}`,
            style: g ? { background: m.color, color: '#fff' } : void 0,
            title: m.label,
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (v) => {
                  o.current[c] = v;
                },
                style: { background: m.color }
              }),
              e.jsxs('span', {
                className: 'pc-label-stack',
                children: [
                  e.jsxs('span', {
                    className: 'pc-label',
                    children: [
                      e.jsx('span', { className: 'pc-dot', style: { background: m.color } }),
                      m.label,
                      m.count != null && e.jsx('span', { className: 'pc-count', children: m.count })
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
                      m.label,
                      m.count != null &&
                        e.jsx('span', { className: 'pc-count pc-count-on', children: m.count })
                    ]
                  })
                ]
              })
            ]
          },
          m.value
        );
      })
    });
  };
function Rt({
  options: a,
  transportistasOpts: t,
  vendedoresMaestro: s,
  onLookup: r,
  onLookupOrange: n,
  canRequestReopen: o,
  onOpenReopen: d,
  latestReopenRequest: i
}) {
  var ra, na;
  const l = be(),
    {
      canal: x,
      nv: m,
      lookupResult: c,
      lookupLoading: g,
      mode: v,
      estado: S,
      tipoDespacho: A,
      transportista: _,
      fechaCompromiso: R,
      fechaAprobacion: D,
      fechaAprobacionReal: C,
      fechaFacturacion: V,
      fechaDespacho: $,
      factura: Y,
      guia: f,
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
      orangeAssociationData: O,
      orangeAssociationLoading: E,
      orangeAssociationError: F,
      incidencia: Z,
      estadoIncidencia: u,
      observacionesIncidencia: N,
      errors: k,
      submitResult: q,
      autoFilledDates: G,
      patch: T,
      markAutoFilled: X,
      clearAutoFilled: re,
      recalcCompromiso: ce
    } = l;
  (b.useEffect(() => {
    if (v === 'idle') return;
    const p = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }),
      K = At(S),
      de = S.toUpperCase() === ae.SHIPPING.toUpperCase(),
      Be = {},
      Pe = [];
    (K && !$ && ((Be.fechaDespacho = p), Pe.push('fechaDespacho')),
      (de || K) && !V && ((Be.fechaFacturacion = p), Pe.push('fechaFacturacion')),
      Pe.length > 0 && (T(Be), X(Pe)));
  }, [S, v]),
    b.useEffect(() => {
      v !== 'idle' && ce();
    }, [C, v]));
  const oe = b.useMemo(() => {
      const p = new Map();
      return (s.forEach((K) => p.set(K.nombre.trim().toLowerCase(), K)), p);
    }, [s]),
    h = (p) => {
      const K = oe.get(p.trim().toLowerCase());
      T(
        K
          ? {
              variosVendedor: p,
              variosDivision: K.division || '',
              variosCcosto: K.centro_costo || ''
            }
          : { variosVendedor: p }
      );
    },
    P = ((ra = He.find((p) => p.value === x)) == null ? void 0 : ra.color) || ne,
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
    }[x] || {
      eyebrow: 'Canal',
      title: 'Operación',
      hint: 'Selecciona un canal para comenzar.',
      tone: 'from-slate-500/10 to-slate-500/10 border-slate-200',
      badge: 'Selección',
      color: ne
    },
    B = c
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
    qe =
      (c == null ? void 0 : c.found) &&
      ((na = c == null ? void 0 : c.data) == null ? void 0 : na.estado) === 'Entregado';
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
                            style: { border: `1px solid ${P}33`, background: `${P}12`, color: P },
                            children: [e.jsx(Ue, { size: 12 }), 'Identificación']
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
                            className: `inline-block h-2.5 w-2.5 rounded-full ${v === 'idle' ? 'bg-slate-300' : c != null && c.found ? 'bg-blue-500' : 'bg-emerald-500'}`
                          }),
                          v === 'idle'
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
                        active: x,
                        onSelect: (p) =>
                          T({
                            canal: p,
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
                                value: m,
                                onChange: (p) => {
                                  const K = p.target.value;
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
                                onKeyDown: (p) => p.key === 'Enter' && r(),
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
                        disabled: g || !m.trim(),
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
                              children: [e.jsx(Pa, { size: 16 }), ' Buscar N.V.']
                            })
                      })
                    ]
                  }),
                  c &&
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
                                    children: c.found
                                      ? e.jsx(Va, { size: 18 })
                                      : e.jsx(Ue, { size: 18 })
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
                                children: c.found ? 'Actualizar' : 'Crear'
                              })
                            ]
                          }),
                          (() => {
                            const p = c.found ? c.data : c.autoFill;
                            if (!p) return null;
                            const K = [
                              { l: 'Cliente', v: p.cliente },
                              { l: 'Vendedor', v: p.vendedor },
                              { l: 'C. Costo', v: p.ccosto || p.centro_costo },
                              { l: 'División', v: p.division }
                            ].filter((de) => de.v);
                            return K.length === 0
                              ? null
                              : e.jsx('div', {
                                  className: 'mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5',
                                  children: K.map((de) =>
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
      x === 'ptm' &&
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
                      onChange: (p) =>
                        T({
                          orangeAssociationNv: p.target.value,
                          orangeAssociationError: '',
                          orangeAssociationData: null
                        }),
                      onKeyDown: (p) => p.key === 'Enter' && (n == null ? void 0 : n(w)),
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
                  disabled: E || !w.trim(),
                  className:
                    'h-11 px-5 rounded-xl bg-amber-500 text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2',
                  children: [
                    E
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
                children: [e.jsx(je, { size: 16 }), F]
              }),
            O &&
              e.jsx('div', {
                className: 'mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3',
                children: [
                  { label: 'Cliente Orange', value: O.cliente || '—' },
                  { label: 'Vendedor', value: O.vendedor || '—' },
                  { label: 'Centro costo', value: O.ccosto || '—' },
                  { label: 'División', value: O.division || '—' }
                ].map((p) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-[10px] uppercase tracking-[0.16em] text-amber-700 font-bold',
                          children: p.label
                        }),
                        e.jsx('div', {
                          className: 'mt-1 text-sm font-semibold text-slate-800 truncate',
                          children: p.value
                        })
                      ]
                    },
                    p.label
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
                    onClick: d,
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
      x === 'varios' &&
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
                  children: et.map((p) =>
                    e.jsx(
                      'button',
                      {
                        type: 'button',
                        onClick: () => T({ variosTipo: p }),
                        className: `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${U === p ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'}`,
                        children: p
                      },
                      p
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
                      onChange: (p) => T({ variosCliente: p.target.value }),
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
                              onChange: (p) => h(p.target.value),
                              className: 'field-input',
                              placeholder: 'Selecciona o escribe'
                            }),
                            e.jsx('datalist', {
                              id: 'vendedores-list',
                              children: s.map((p) => e.jsx('option', { value: p.nombre }, p.id))
                            })
                          ]
                        })
                      : e.jsx('input', {
                          type: 'text',
                          value: z,
                          onChange: (p) => T({ variosVendedor: p.target.value }),
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
                      onChange: (p) => T({ variosDivision: p.target.value }),
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
                      onChange: (p) => T({ variosCcosto: p.target.value }),
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
                      onChange: (p) => T({ fechaAprobacionReal: p.target.value }),
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
                    items: Ct.map((p) => ({ value: p, label: p, color: Oe(p) })),
                    active: S,
                    onSelect: (p) => T({ estado: p })
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
                          value: A,
                          onChange: (p) => T({ tipoDespacho: p.target.value }),
                          className: 'field-input',
                          children: [
                            e.jsx('option', { value: '', children: '— Seleccionar —' }),
                            (
                              (a == null ? void 0 : a.tiposDespacho) || [
                                'Courier - Inyección',
                                'Directo',
                                'Courier (Retiro / Pick-up)'
                              ]
                            ).map((p) => e.jsx('option', { value: p, children: p }, p))
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
                              onChange: (p) => T({ transportista: p.target.value }),
                              className: 'field-input',
                              children: [
                                e.jsx('option', { value: '', children: '— Seleccionar —' }),
                                (_ && !t.includes(_) ? [_, ...t] : t).map((p) =>
                                  e.jsx('option', { value: p, children: p }, p)
                                )
                              ]
                            })
                          : e.jsx('input', {
                              type: 'text',
                              value: _,
                              onChange: (p) => T({ transportista: p.target.value }),
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
                          onChange: (p) => T({ fechaAprobacionReal: p.target.value }),
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
                                style: { color: ne },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: V,
                          onChange: (p) => {
                            (T({ fechaFacturacion: p.target.value }), re('fechaFacturacion'));
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
                                style: { color: ne },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: $,
                          onChange: (p) => {
                            (T({ fechaDespacho: p.target.value }), re('fechaDespacho'));
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
                          onChange: (p) => T({ factura: p.target.value }),
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
                          onChange: (p) => T({ guia: p.target.value }),
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
                          onChange: (p) => T({ bultos: p.target.value }),
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
                              onChange: (p) =>
                                T({ valorFactura: p.target.value.replace(/[^0-9.]/g, '') }),
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
                          onChange: (p) => T({ numeroEnvio: p.target.value }),
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
                    children: ya.map((p) => {
                      const K = Z === p,
                        de =
                          p === 'PROBLEMAS DE DIRECCIÓN'
                            ? xa
                            : p === 'PROBLEMAS DE TRANSPORTE'
                              ? fa
                              : je;
                      return e.jsxs(
                        'button',
                        {
                          type: 'button',
                          onClick: () =>
                            T({
                              incidencia: K ? '' : p,
                              estadoIncidencia: K ? 'ABIERTA' : u || 'ABIERTA'
                            }),
                          className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${K ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                          children: [e.jsx(de, { size: 14 }), p]
                        },
                        p
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
                              value: u,
                              onChange: (p) => T({ estadoIncidencia: p.target.value }),
                              className: 'field-input',
                              children: _a.map((p) => e.jsx('option', { value: p, children: p }, p))
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
                              onChange: (p) => T({ observacionesIncidencia: p.target.value }),
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
            k.length > 0 &&
              e.jsx('div', {
                className: 'bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up',
                children: k.map((p, K) =>
                  e.jsxs(
                    'p',
                    {
                      className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                      children: [e.jsx('span', { children: '⚠' }), p]
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
function Ve(a, t = {}) {
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
  const [t, s] = b.useState([]),
    [r, n] = b.useState(!0),
    [o, d] = b.useState(''),
    [i, l] = b.useState(''),
    [x, m] = b.useState(!1),
    [c, g] = b.useState(''),
    [v, S] = b.useState(!1),
    [A, _] = b.useState([]),
    [R, D] = b.useState(''),
    [C, V] = b.useState(''),
    [$, Y] = b.useState(!1),
    f = b.useCallback(async () => {
      (n(!0), d(''));
      try {
        s(await _t());
      } catch (y) {
        d((y == null ? void 0 : y.message) || 'Error al cargar consolidados');
      } finally {
        n(!1);
      }
    }, []);
  b.useEffect(() => {
    f();
  }, [f]);
  const I = (y) => {
      (l(y), setTimeout(() => l(''), 3e3));
    },
    W = async () => {
      const y = c.trim();
      if (y) {
        if (A.some((j) => j.nv === y)) {
          I(`La NV ${y} ya está en la lista`);
          return;
        }
        S(!0);
        try {
          const j = await da(y);
          if (!j) {
            I(`NV ${y} no existe en la base`);
            return;
          }
          (_((w) => [...w, { nv: j.nv, canal: j.canal, cliente: j.cliente }]), g(''));
        } finally {
          S(!1);
        }
      }
    },
    Q = async () => {
      if (A.length === 0) {
        I('Agrega al menos una NV');
        return;
      }
      Y(!0);
      const y = await Ce({
        fecha_comprometida: R || null,
        observacion: C || null,
        created_by: a || null,
        nvs: A
      });
      if ((Y(!1), !y.ok)) {
        I(y.error || 'Error al crear');
        return;
      }
      (I(`✓ ${y.ticket || 'Consolidado'} creado`), _([]), D(''), V(''), m(!1), f());
    },
    H = async (y, j) => {
      const w = await Ce(Ve(y, { fecha_comprometida: j || null }));
      if (!w.ok) {
        I(w.error || 'Error');
        return;
      }
      s((O) => O.map((E) => (E.id === y.id ? { ...E, fecha_comprometida: j || null } : E)));
    },
    U = async (y) => {
      const j = y.estado === 'cerrado' ? 'abierto' : 'cerrado',
        w = await Ce(Ve(y, { estado: j }));
      if (!w.ok) {
        I(w.error || 'Error');
        return;
      }
      s((O) => O.map((E) => (E.id === y.id ? { ...E, estado: j } : E)));
    },
    ee = async (y) => {
      if (!confirm(`¿Eliminar ${y.ticket}? Las NVs volverán a medirse con las 48 hrs.`)) return;
      const j = await wt(y.id);
      if (!j.ok) {
        I(j.error || 'Error');
        return;
      }
      (I(`${y.ticket} eliminado`), s((w) => w.filter((O) => O.id !== y.id)));
    },
    z = async (y, j) => {
      const w = y.nvs
          .filter((E) => E.id !== j)
          .map((E) => ({ nv: E.nv, canal: E.canal, cliente: E.cliente })),
        O = await Ce(Ve(y, { nvs: w }));
      if (!O.ok) {
        I(O.error || 'Error');
        return;
      }
      s((E) => E.map((F) => (F.id === y.id ? { ...F, nvs: F.nvs.filter((Z) => Z.id !== j) } : F)));
    },
    te = async (y, j, w) => {
      const O = j.trim();
      if (!O) return;
      const E = await da(O);
      if (!E) {
        I(`NV ${O} no existe`);
        return;
      }
      const F = [
          ...y.nvs.map((u) => ({ nv: u.nv, canal: u.canal, cliente: u.cliente })),
          { nv: E.nv, canal: E.canal, cliente: E.cliente }
        ],
        Z = await Ce(Ve(y, { nvs: F }));
      if (!Z.ok) {
        I(Z.error || 'Error');
        return;
      }
      (w(), f());
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
          !x &&
            e.jsx('button', {
              onClick: () => m(!0),
              className: 'px-3 py-2 rounded-lg text-white text-[13px] font-semibold',
              style: { background: ne },
              children: '+ Nuevo consolidado'
            })
        ]
      }),
      x &&
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
            A.length > 0 &&
              e.jsx('div', {
                className: 'flex flex-wrap gap-1.5 mb-3',
                children: A.map((y) =>
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
                      onChange: (y) => D(y.target.value),
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
                  disabled: $ || A.length === 0,
                  className:
                    'px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-50',
                  style: { background: ne },
                  children: $ ? 'Creando…' : 'Crear consolidado'
                }),
                e.jsx('button', {
                  onClick: () => {
                    (m(!1), _([]), D(''), V(''), g(''));
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
              children: t.map((y) =>
                e.jsx(
                  It,
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
function It({ c: a, onSetFecha: t, onToggle: s, onEliminar: r, onQuitarNv: n, onAddNv: o }) {
  const [d, i] = b.useState(''),
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
                    onChange: (x) => t(a, x.target.value),
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
            : a.nvs.map((x) =>
                e.jsxs(
                  'span',
                  {
                    className:
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px]',
                    children: [
                      e.jsx('b', { children: x.nv }),
                      ' ',
                      e.jsx('span', { className: 'text-gray-400', children: x.cliente || x.canal }),
                      e.jsx('button', {
                        onClick: () => x.id && n(a, x.id),
                        className: 'text-gray-400 hover:text-red-600',
                        children: '×'
                      })
                    ]
                  },
                  x.id
                )
              )
      }),
      e.jsxs('div', {
        className: 'flex gap-2 items-center',
        children: [
          e.jsx('input', {
            value: d,
            onChange: (x) => i(x.target.value),
            onKeyDown: (x) => {
              x.key === 'Enter' && (x.preventDefault(), o(a, d, () => i('')));
            },
            placeholder: '+ Agregar NV',
            className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg flex-1 max-w-[200px]'
          }),
          e.jsx('button', {
            onClick: () => o(a, d, () => i('')),
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
  Pt = ['Entregado', 'En Proceso', 'Shipping', 'Currier', 'En Ruta'],
  ma = 60,
  Vt = 80;
function $t(a, t) {
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
  const n = $t(r, 2);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}
const ze = [
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
function Lt({ data: a }) {
  const t = ze.map((r) => ve(a[r.dateKey]));
  let s = -1;
  for (let r = t.length - 1; r >= 0; r--)
    if (t[r]) {
      s = r;
      break;
    }
  return e.jsx('div', {
    className: 'flex flex-col gap-0',
    children: ze.map((r, n) => {
      const o = t[n],
        d = !!o,
        i = n === s,
        l = n > 0 ? t[n - 1] : '',
        x = n > 0 && o && l ? Mt(l, o) : null,
        m = x !== null && x > 3;
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
                    style: { background: d ? (m ? '#ef4444' : '#22c55e') : '#e5e7eb' }
                  }),
                n === 0 && e.jsx('div', { className: 'h-1' }),
                e.jsx('div', {
                  className: `rounded-full shrink-0 flex items-center justify-center transition-all ${i ? 'w-5 h-5 ring-4 ring-orange-100' : d ? 'w-4 h-4' : 'w-3.5 h-3.5 border-2 border-gray-300'}`,
                  style: { background: i ? '#f57c00' : d ? '#22c55e' : 'transparent' },
                  children:
                    d &&
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
                n < ze.length - 1 &&
                  e.jsx('div', {
                    className: 'w-0.5 flex-1 min-h-[8px]',
                    style: { background: d && t[n + 1] ? '#22c55e' : '#e5e7eb' }
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
                      className: `text-[12px] font-semibold ${i ? 'text-orange-600' : d ? 'text-gray-800' : 'text-gray-400'}`,
                      children: r.label
                    }),
                    x !== null &&
                      e.jsxs('span', {
                        className: `text-[10px] font-bold px-1.5 py-0.5 rounded-full ${m ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`,
                        children: [x, 'd']
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
function qt({
  item: a,
  puedeEscribir: t,
  puedeEliminar: s,
  puedeAprobarReapertura: r,
  opts: n,
  onClose: o,
  onSaved: d,
  onDeleted: i
}) {
  const [l, x] = b.useState(null),
    [m, c] = b.useState(!0),
    [g, v] = b.useState({}),
    [S, A] = b.useState(!1),
    [_, R] = b.useState(!1),
    [D, C] = b.useState(!1),
    [V, $] = b.useState(null),
    [Y, f] = b.useState([]),
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
    let h = !0;
    return (
      x(w),
      c(!1),
      pt(a.id, { canal: a.canal, nv: a.nv }).then((P) => {
        h && (x(P.found ? P.data : null), v({}), c(!1));
      }),
      () => {
        h = !1;
      }
    );
  }, [a, w]);
  const O = b.useCallback(async () => {
    if (!(a != null && a.id)) return (f([]), []);
    W(!0);
    try {
      const h = await Ra(a.id);
      return (f(h), h);
    } catch {
      return (f([]), []);
    } finally {
      W(!1);
    }
  }, [a == null ? void 0 : a.id]);
  b.useEffect(() => {
    O();
  }, [O]);
  const E = (h) => (h in g ? g[h] : ((l == null ? void 0 : l[h]) ?? '' ?? '')),
    F = (h, P) => {
      v((M) => {
        const B = { ...M, [h]: P };
        return (
          h === 'fecha_aprobacion_real' &&
            (B.fecha_compromiso = Ft(ve(l == null ? void 0 : l.fecha_aprobacion), P)),
          B
        );
      });
    },
    Z = b.useMemo(() => {
      const h = {};
      return (
        Object.keys(g).forEach((P) => {
          const M = (l == null ? void 0 : l[P]) ?? '';
          String(g[P] ?? '') !== String(M ?? '') && (h[P] = g[P]);
        }),
        h
      );
    }, [g, l]),
    u = {
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
      (A(!0), $(null));
      const h = { id: a.id };
      Object.entries(Z).forEach(([M, B]) => {
        h[u[M] || M] = M === 'urgente' ? String(B) === 'true' : B;
      });
      const P = await ka(h);
      (A(!1),
        P.ok
          ? ($({ success: !0, message: 'Cambios guardados' }),
            d == null ||
              d({
                ...a,
                estado: E('estado') || a.estado,
                transportista: E('transportista'),
                urgente: String(E('urgente')) === 'true'
              }),
            setTimeout(o, 700))
          : $({ success: !1, message: P.message || P.error || 'No se pudo guardar' }));
    },
    k = async () => {
      R(!0);
      const h = await yt(a.id);
      (R(!1),
        h.ok
          ? ($e.success(`NV ${a.nv} eliminada`), i == null || i(a), o())
          : ($({ success: !1, message: h.error || 'No se pudo eliminar' }), C(!1)));
    },
    q = (n == null ? void 0 : n.transportistas) || [],
    G = String(E('urgente')) === 'true',
    T = Me.includes(E('estado')) || !!E('incidencia'),
    X = Y.find((h) => h.estado === 'PENDIENTE') || null,
    re = (l == null ? void 0 : l.estado) === 'Entregado',
    ce = async () => {
      const h = String(Q || '').trim();
      if (!h) {
        $({ success: !1, message: 'Debes indicar el motivo de la reapertura.' });
        return;
      }
      te(!0);
      const P = await Da(a.id, h);
      (te(!1),
        P.ok
          ? (H(''),
            await O(),
            $({ success: !0, message: P.message || 'Solicitud de reapertura enviada.' }))
          : $({
              success: !1,
              message: P.message || P.error || 'No se pudo solicitar la reapertura.'
            }));
    },
    oe = async (h) => {
      if (!(X != null && X.id)) return;
      j(!0);
      const P = await jt(X.id, h, U);
      if ((j(!1), !P.ok)) {
        $({ success: !1, message: P.message || P.error || 'No se pudo resolver la solicitud.' });
        return;
      }
      const M = await Te(a.canal, a.nv);
      (M.found &&
        (x(M.data),
        v({}),
        d == null ||
          d({
            ...a,
            estado: M.data.estado || a.estado,
            transportista: M.data.transportista || a.transportista,
            urgente: String(M.data.urgente) === 'true' || M.data.urgente === !0,
            reabierta: M.data.reabierta === !0,
            motivoReapertura: M.data.motivo_reapertura || ''
          })),
        ee(''),
        await O(),
        $({ success: !0, message: P.message || 'Solicitud resuelta correctamente.' }));
    };
  return Ye.createPortal(
    e.jsxs('div', {
      className: 'panel-portal fixed inset-0 z-[120] flex justify-end',
      onClick: o,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (h) => h.stopPropagation(),
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
                !l && m
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
                                  .filter((h) => h.v)
                                  .map((h) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className: 'bg-gray-50 rounded-lg px-3 py-2',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[9px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5',
                                            children: h.l
                                          }),
                                          e.jsx('div', {
                                            className:
                                              'text-[13px] text-gray-800 font-medium truncate',
                                            title: h.v || '',
                                            children: h.v
                                          })
                                        ]
                                      },
                                      h.l
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
                                children: e.jsx(Lt, { data: l })
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
                                                              ve(X.solicitada_at)
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
                                                        onChange: (h) => ee(h.target.value),
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
                                                            disabled: y,
                                                            className:
                                                              'rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50',
                                                            children: y
                                                              ? 'Procesando...'
                                                              : 'Aprobar y reabrir'
                                                          }),
                                                          e.jsx('button', {
                                                            type: 'button',
                                                            onClick: () => oe(!1),
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
                                                    onChange: (h) => H(h.target.value),
                                                    className: 'field-input min-h-[96px] resize-y',
                                                    placeholder:
                                                      'Motivo obligatorio de reapertura: por qué se necesita devolver esta N.V. a En Proceso...'
                                                  }),
                                                  e.jsx('button', {
                                                    type: 'button',
                                                    onClick: ce,
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
                                            items: wa.map((h) => ({
                                              value: h,
                                              label: h,
                                              color: Oe(h)
                                            })),
                                            active: E('estado'),
                                            onSelect: (h) => F('estado', h)
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
                                                  value: E('tipo_despacho'),
                                                  onChange: (h) =>
                                                    F('tipo_despacho', h.target.value),
                                                  className: 'field-input',
                                                  children: [
                                                    e.jsx('option', { value: '', children: '—' }),
                                                    (
                                                      (n == null ? void 0 : n.tiposDespacho) || Ea
                                                    ).map((h) =>
                                                      e.jsx('option', { value: h, children: h }, h)
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
                                                      value: E('transportista'),
                                                      onChange: (h) =>
                                                        F('transportista', h.target.value),
                                                      className: 'field-input',
                                                      children: [
                                                        e.jsx('option', {
                                                          value: '',
                                                          children: '—'
                                                        }),
                                                        (E('transportista') &&
                                                        !q.includes(E('transportista'))
                                                          ? [E('transportista'), ...q]
                                                          : q
                                                        ).map((h) =>
                                                          e.jsx(
                                                            'option',
                                                            { value: h, children: h },
                                                            h
                                                          )
                                                        )
                                                      ]
                                                    })
                                                  : e.jsx('input', {
                                                      type: 'text',
                                                      value: E('transportista'),
                                                      onChange: (h) =>
                                                        F('transportista', h.target.value),
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
                                                  value: E('fecha_aprobacion_real'),
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
                                                        color: E('fecha_compromiso')
                                                          ? ne
                                                          : '#9ca3af'
                                                      },
                                                      children: '(auto)'
                                                    })
                                                  ]
                                                }),
                                                e.jsx('input', {
                                                  type: 'date',
                                                  value: E('fecha_compromiso'),
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
                                                  value: E('fecha_facturacion'),
                                                  onChange: (h) =>
                                                    F('fecha_facturacion', h.target.value),
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
                                                  value: E('fecha_despacho'),
                                                  onChange: (h) =>
                                                    F('fecha_despacho', h.target.value),
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
                                                  value: E('factura'),
                                                  onChange: (h) => F('factura', h.target.value),
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
                                                  value: E('guia'),
                                                  onChange: (h) => F('guia', h.target.value),
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
                                                  value: E('numero_envio'),
                                                  onChange: (h) =>
                                                    F('numero_envio', h.target.value),
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
                                                  value: E('bultos'),
                                                  onChange: (h) => F('bultos', h.target.value),
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
                                                      value: E('valor_factura'),
                                                      onChange: (h) =>
                                                        F(
                                                          'valor_factura',
                                                          h.target.value.replace(/[^0-9.]/g, '')
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
                                            children: ya.map((h) => {
                                              const P = E('incidencia') === h,
                                                M =
                                                  h === 'PROBLEMAS DE DIRECCIÓN'
                                                    ? xa
                                                    : h === 'PROBLEMAS DE TRANSPORTE'
                                                      ? fa
                                                      : je;
                                              return e.jsxs(
                                                'button',
                                                {
                                                  type: 'button',
                                                  onClick: () => {
                                                    const B = !P;
                                                    (F('incidencia', B ? h : ''),
                                                      F(
                                                        'estado_incidencia',
                                                        (B && E('estado_incidencia')) || 'ABIERTA'
                                                      ),
                                                      B || F('observaciones_incidencia', ''));
                                                  },
                                                  className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${P ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                                                  children: [e.jsx(M, { size: 14 }), h]
                                                },
                                                h
                                              );
                                            })
                                          }),
                                          E('incidencia') &&
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
                                                      value: E('estado_incidencia') || 'ABIERTA',
                                                      onChange: (h) =>
                                                        F('estado_incidencia', h.target.value),
                                                      className: 'field-input',
                                                      children: _a.map((h) =>
                                                        e.jsx(
                                                          'option',
                                                          { value: h, children: h },
                                                          h
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
                                                      value: E('observaciones_incidencia'),
                                                      onChange: (h) =>
                                                        F(
                                                          'observaciones_incidencia',
                                                          h.target.value
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
            l &&
              ((t && !re) || s) &&
              e.jsxs('div', {
                className: 'shrink-0 bg-white border-t border-gray-200 p-4 space-y-2',
                children: [
                  t &&
                    !re &&
                    Object.keys(Z).length > 0 &&
                    e.jsx('button', {
                      onClick: N,
                      disabled: S,
                      className:
                        'w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60',
                      style: { background: ne },
                      children: S
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
                                  onClick: k,
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
const Bt = b.memo(function ({ i: t, onOpen: s }) {
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
  const [r, n] = b.useState([]),
    [o, d] = b.useState(!0),
    [i, l] = b.useState('Todos'),
    [x, m] = b.useState(''),
    [c, g] = b.useState(null),
    [v, S] = b.useState([]),
    [A, _] = b.useState(!1),
    [R, D] = b.useState(null),
    [C, V] = b.useState(null),
    [$, Y] = b.useState(!1),
    [f, I] = b.useState(ma),
    W = b.useRef(null),
    Q = b.useRef(0),
    H = b.useCallback((j = !1) => {
      (d(!0),
        lt({ force: j, full: !1, limit: 400 })
          .then((w) => {
            (n(w), d(!1));
          })
          .catch(() => {
            (n([]), d(!1));
          }));
    }, []);
  b.useEffect(() => {
    H();
  }, [H]);
  const U = x.trim().length >= 2;
  (b.useEffect(() => {
    const j = x.trim();
    if (j.length < 2) {
      S([]);
      return;
    }
    S(ct(r, j, { limit: 120 }));
  }, [x, r]),
    b.useEffect(() => {
      const j = x.trim();
      if (j.length < 2) {
        (g(null), _(!1));
        return;
      }
      _(!0);
      const w = Q.current + 1;
      Q.current = w;
      const O = setTimeout(() => {
        it(j, { limit: 120 })
          .then((E) => {
            Q.current === w && g(E);
          })
          .catch(() => {
            Q.current === w && g([]);
          })
          .finally(() => {
            Q.current === w && _(!1);
          });
      }, 220);
      return () => clearTimeout(O);
    }, [x]));
  const ee = b.useCallback(async () => {
      Y(!0);
      try {
        const j = await bt();
        if (!j.length) {
          $e.warning('No hay operaciones para exportar.');
          return;
        }
        (Ba({ filename: 'Operaciones_NV', sheets: [{ name: 'Notas de Venta', rows: j }] }),
          $e.success(`Exportadas ${j.length} N.V. a Excel`));
      } catch (j) {
        $e.error('No se pudo exportar: ' + ((j == null ? void 0 : j.message) || 'error'));
      } finally {
        Y(!1);
      }
    }, []),
    z = b.useMemo(
      () =>
        U ? dt(v, c || [], x, { limit: 160 }) : r.filter((j) => i === 'Todos' || j.estado === i),
      [U, v, c, x, r, i]
    ),
    te = b.useMemo(() => z.slice(0, f), [z, f]),
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
    }, [U, i, x, z.length]),
    b.useEffect(() => {
      !R ||
        C ||
        Ca()
          .then(V)
          .catch(() => {});
    }, [R, C]),
    b.useEffect(() => {
      if (f >= z.length) return;
      const j = W.current;
      if (!j) return;
      const w = new IntersectionObserver(
        (O) => {
          O.some((E) => E.isIntersecting) && I((E) => Math.min(E + Vt, z.length));
        },
        { root: null, rootMargin: '240px 0px', threshold: 0 }
      );
      return (w.observe(j), () => w.disconnect());
    }, [f, z.length]),
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
              value: x,
              onChange: (j) => m(j.target.value),
              placeholder: 'Buscar por NV, cliente, guía o factura (cualquier estado)…',
              className:
                'w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none bg-white'
            }),
            A &&
              e.jsx(Ae, {
                size: 16,
                className: 'absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin'
              })
          ]
        }),
        !U &&
          (() => {
            const j = Me.filter((w) => (y[w] || 0) > 0).map((w) => ({
              value: w,
              label: w,
              color: Oe(w),
              count: y[w] || 0
            }));
            return j.length === 0
              ? null
              : e.jsx(sa, {
                  items: j,
                  active: i,
                  inline: !0,
                  onSelect: (w) => l(i === w ? 'Todos' : w)
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
                  disabled: $,
                  className:
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition-colors',
                  title: 'Descargar TODAS las N.V. (todas las columnas) a Excel',
                  children: [
                    $
                      ? e.jsx(Ae, { size: 14, className: 'animate-spin' })
                      : e.jsx(Fa, { size: 14 }),
                    $ ? 'Exportando…' : 'Exportar Excel'
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
        (o && !U) || (A && !c)
          ? e.jsx('div', {
              className: 'py-16 flex justify-center',
              children: e.jsx(Ae, { className: 'animate-spin text-orange-500', size: 30 })
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
                  te.map((j) => e.jsx(Bt, { i: j, onOpen: D }, j.key)),
                  f < z.length &&
                    e.jsx('div', {
                      ref: W,
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
        R &&
          e.jsx(qt, {
            item: R,
            puedeEscribir: a,
            puedeEliminar: t,
            puedeAprobarReapertura: s,
            opts: C,
            onClose: () => D(null),
            onSaved: (j) => {
              (n((w) => w.map((O) => (O.key === j.key ? { ...O, ...j } : O))),
                g((w) => w && w.map((O) => (O.key === j.key ? { ...O, ...j } : O))));
            },
            onDeleted: (j) => {
              (n((w) => w.filter((O) => O.key !== j.key)),
                g((w) => w && w.filter((O) => O.key !== j.key)));
            }
          })
      ]
    })
  );
}
function Ut({ canal: a, nv: t, onClose: s }) {
  var o;
  const r = Oa(),
    n = (((o = He.find((d) => d.value === a)) == null ? void 0 : o.label) || a || '').toUpperCase();
  return Ye.createPortal(
    e.jsxs('div', {
      className: 'fixed inset-0 z-[60] flex items-center justify-center p-4',
      onClick: s,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (d) => d.stopPropagation(),
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
  requesting: d,
  onClose: i
}) {
  if (!a) return null;
  const l = a.estado === 'Entregado',
    x = l
      ? 'ALERTA CRITICA: N.V. ENTREGADA Y BLOQUEADA'
      : 'ALERTA CRITICA: N.V. DUPLICADA DETECTADA';
  return e.jsx(Ua, {
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
                  children: x
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
                  onChange: (m) => n(m.target.value),
                  className: 'field-input mt-4 min-h-[160px] resize-y',
                  placeholder:
                    'Observación obligatoria: explica por qué se necesita reabrir esta N.V. entregada...'
                }),
                e.jsx('button', {
                  type: 'button',
                  onClick: o,
                  disabled: d,
                  className:
                    'mt-4 w-full rounded-2xl bg-orange-500 px-4 py-4 text-base font-black uppercase tracking-[0.12em] text-white disabled:opacity-50',
                  children: d ? 'Enviando solicitud...' : 'Enviar solicitud de reapertura'
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
  var E, F, Z;
  const s = be(),
    [r, n] = b.useState(null),
    [o, d] = b.useState(null),
    [i, l] = b.useState([]),
    [x, m] = b.useState(null),
    [c, g] = b.useState(null),
    [v, S] = b.useState(''),
    [A, _] = b.useState(!1),
    [R, D] = b.useState([]),
    [C, V] = b.useState(null),
    [$, Y] = b.useState(null);
  (b.useEffect(() => {
    Ca()
      .then(n)
      .catch(() => {});
  }, []),
    b.useEffect(() => {
      qa()
        .then(l)
        .catch(() => l([]));
    }, []),
    b.useEffect(() => {
      if (!o) return;
      const u = setTimeout(() => d(null), 3e3);
      return () => clearTimeout(u);
    }, [o]));
  const f = (E = s.lookupResult) != null && E.found ? s.lookupResult : null,
    I = ((F = f == null ? void 0 : f.data) == null ? void 0 : F.estado) === 'Entregado',
    W = R.find((u) => u.estado === 'PENDIENTE') || null,
    Q = b.useMemo(
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
    H =
      s.mode === 'update' &&
      (C == null ? void 0 : C.permitida) === !1 &&
      ($ == null ? void 0 : $.permitida) === !0 &&
      Q;
  b.useEffect(() => {
    var N;
    let u = !1;
    if (!(f != null && f.row) || !a) {
      (V(null), Y(null));
      return;
    }
    return (
      Promise.all([
        vt(f.row),
        Nt(
          f.row,
          s.estado || ((N = f == null ? void 0 : f.data) == null ? void 0 : N.estado) || null
        )
      ])
        .then(([k, q]) => {
          u || (V(k), Y(q));
        })
        .catch(() => {
          u ||
            (V({ permitida: !1, message: 'No se pudo validar el acceso IAM para esta N.V.' }),
            Y({ permitida: !1, message: 'No se pudo validar la transición de estado.' }));
        }),
      () => {
        u = !0;
      }
    );
  }, [
    f == null ? void 0 : f.row,
    (Z = f == null ? void 0 : f.data) == null ? void 0 : Z.estado,
    a,
    s.estado
  ]);
  const U = b.useCallback(async (u) => {
      if (!u) return (D([]), []);
      try {
        const N = await Ra(u);
        return (D(N), N);
      } catch {
        return (D([]), []);
      }
    }, []),
    ee = b.useCallback(
      (u, N = R) => {
        if (!u) return;
        const k = N.find((q) => q.estado === 'PENDIENTE') || null;
        g({ ...u, pendingRequest: k });
      },
      [R]
    ),
    z = b.useCallback(
      async (u) => {
        var k, q, G;
        (s.patch({ lookupResult: { found: !0, row: u.row, data: u.data } }), s.applyFound(u.data));
        const N = s.canal === 'ptm' && ia((k = u.data) == null ? void 0 : k.cliente);
        (s.patch({
          orangeAssociationRequired: N,
          orangeAssociationError: '',
          orangeAssociationData: null,
          orangeAssociationNv: ((q = u.data) == null ? void 0 : q.nv_orange) || ''
        }),
          N && (G = u.data) != null && G.nv_orange && (await y(u.data.nv_orange)));
      },
      [s]
    );
  b.useEffect(() => {
    if (!(f != null && f.row)) {
      D([]);
      return;
    }
    U(f.row);
  }, [f == null ? void 0 : f.row, U]);
  const te = b.useCallback(() => {
      var k, q;
      const u = be.getState(),
        N =
          (k = u.lookupResult) != null && k.found
            ? u.lookupResult.data
            : (q = u.lookupResult) == null
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
      async (u) => {
        const N = String(u || '').trim();
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
          const k = await mt(N, te());
          return k
            ? (s.patch({
                orangeAssociationData: k,
                orangeAssociationLoading: !1,
                orangeAssociationError: ''
              }),
              k)
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
      var k, q, G, T, X, re, ce;
      const u = String(s.nv || '').trim();
      if (!u) return;
      s.patch({ lookupLoading: !0, submitResult: null, errors: [] });
      const N = await Te(s.canal, u);
      if (N.found) {
        await z(N);
        const oe = ((k = N.data) == null ? void 0 : k.estado) === 'Entregado' ? await U(N.row) : [];
        Pt.includes((q = N.data) == null ? void 0 : q.estado) &&
          ee(
            {
              id: N.row,
              canal: s.canal,
              nv: u,
              estado: (G = N.data) == null ? void 0 : G.estado,
              reabierta: ((T = N.data) == null ? void 0 : T.reabierta) === !0,
              motivo_reapertura: ((X = N.data) == null ? void 0 : X.motivo_reapertura) || ''
            },
            oe
          );
      } else if (s.canal !== 'varios' && !((re = N.autoFill) != null && re.cliente)) {
        (s.patch({
          lookupLoading: !1,
          lookupResult: null,
          mode: 'idle',
          orangeAssociationRequired: !1,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        }),
          m({ canal: s.canal, nv: u }));
        return;
      } else {
        (g(null),
          D([]),
          s.patch({ lookupResult: { found: !1, autoFill: N.autoFill } }),
          s.applyNew(N.autoFill || {}));
        const oe = s.canal === 'ptm' && ia((ce = N.autoFill) == null ? void 0 : ce.cliente);
        s.patch({
          orangeAssociationRequired: oe,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        });
      }
      s.patch({ lookupLoading: !1 });
    },
    w = async () => {
      const u = (f == null ? void 0 : f.row) || (c == null ? void 0 : c.id),
        N = String(v || '').trim();
      if (!u) return;
      if (!N) {
        s.patch({
          submitResult: { success: !1, message: 'Debes indicar el motivo de la reapertura.' }
        });
        return;
      }
      _(!0);
      const k = await Da(u, N);
      if ((_(!1), !k.ok)) {
        const G = k.message || k.error || 'No se pudo solicitar la reapertura.';
        (s.patch({ submitResult: { success: !1, message: G } }), d({ type: 'error', message: G }));
        return;
      }
      const q = await U(u);
      (S(''),
        f != null &&
          f.data &&
          ee(
            {
              id: f.row,
              canal: s.canal,
              nv: s.nv,
              estado: f.data.estado,
              reabierta: f.data.reabierta === !0,
              motivo_reapertura: f.data.motivo_reapertura || ''
            },
            q
          ),
        s.patch({
          submitResult: { success: !0, message: k.message || 'Solicitud de reapertura enviada.' }
        }),
        d({ type: 'success', message: k.message || 'Solicitud de reapertura enviada.' }));
    },
    O = async () => {
      var X, re, ce, oe, h, P, M;
      const u = be.getState();
      if (u.mode === 'idle') return;
      if (!u.estado) {
        u.patch({ submitResult: { success: !1, message: 'Falta el Estado' } });
        return;
      }
      if (
        u.mode === 'update' &&
        f != null &&
        f.row &&
        (C == null ? void 0 : C.permitida) === !1 &&
        !H
      ) {
        (u.patch({
          submitResult: {
            success: !1,
            message: C.message || 'No tienes permisos IAM para editar esta N.V.'
          }
        }),
          d({
            type: 'error',
            message: C.message || 'No tienes permisos IAM para editar esta N.V.'
          }));
        return;
      }
      if (
        (X = u.lookupResult) != null &&
        X.found &&
        ((ce = (re = u.lookupResult) == null ? void 0 : re.data) == null ? void 0 : ce.estado) ===
          'Entregado'
      ) {
        const B = await U(u.lookupResult.row);
        (ee(
          {
            id: u.lookupResult.row,
            canal: u.canal,
            nv: u.nv,
            estado: u.lookupResult.data.estado,
            reabierta: u.lookupResult.data.reabierta === !0,
            motivo_reapertura: u.lookupResult.data.motivo_reapertura || ''
          },
          B
        ),
          u.patch({
            submitResult: {
              success: !1,
              message:
                'La N.V. está entregada y bloqueada. Solicita reapertura para volver a gestionarla.'
            }
          }));
        return;
      }
      if (u.orangeAssociationRequired && (!u.orangeAssociationNv || !u.orangeAssociationData)) {
        u.patch({
          submitResult: {
            success: !1,
            message: 'Debes asociar una N.V. Orange válida para este cliente PTM.'
          }
        });
        return;
      }
      u.patch({ submitting: !0, submitResult: null });
      const N =
          (oe = u.lookupResult) != null && oe.found
            ? u.lookupResult.data
            : (h = u.lookupResult) == null
              ? void 0
              : h.autoFill,
        k = u.orangeAssociationData,
        q = {
          id: u.mode === 'update' ? ((P = u.lookupResult) == null ? void 0 : P.row) : null,
          mode: u.mode,
          canal: u.canal,
          nv: u.nv,
          cliente: (k == null ? void 0 : k.cliente) || (N == null ? void 0 : N.cliente) || '',
          vendedor: (k == null ? void 0 : k.vendedor) || (N == null ? void 0 : N.vendedor) || '',
          division: (k == null ? void 0 : k.division) || (N == null ? void 0 : N.division) || '',
          centro_costo:
            (k == null ? void 0 : k.ccosto) ||
            (N == null ? void 0 : N.ccosto) ||
            (N == null ? void 0 : N.centro_costo) ||
            '',
          nvOrangeAsociada: u.orangeAssociationRequired
            ? u.orangeAssociationNv
            : (N == null ? void 0 : N.nv_orange) || '',
          estado: u.estado,
          urgente: u.urgente,
          tipoDespacho: u.tipoDespacho,
          transportista: u.transportista,
          fechaCompromiso: u.fechaCompromiso,
          fechaAprobacion: u.fechaAprobacion,
          fechaAprobacionReal: u.fechaAprobacionReal,
          fechaFacturacion: u.fechaFacturacion,
          fechaDespacho: u.fechaDespacho,
          factura: u.factura,
          guia: u.guia,
          bultos: u.bultos,
          valorFactura: u.valorFactura,
          numeroEnvio: u.numeroEnvio,
          incidencia: u.incidencia,
          estadoIncidencia: u.incidencia ? u.estadoIncidencia || 'ABIERTA' : '',
          observacionesIncidencia: u.observacionesIncidencia,
          variosTipo: u.variosTipo,
          variosCliente: u.variosCliente,
          variosVendedor: u.variosVendedor,
          variosDivision: u.variosDivision,
          variosCcosto: u.variosCcosto
        },
        G = await ka(q);
      if ((be.getState().patch({ submitting: !1 }), G.ok)) {
        (g(null),
          D([]),
          d({
            type: 'success',
            message: `NV ${q.nv} ${q.mode === 'update' ? 'actualizada' : 'creada'}`
          }),
          be.getState().reset());
        return;
      }
      let T = G.message || G.error || 'No se pudo guardar';
      if (G.duplicate || G.locked) {
        const B = await Te(u.canal, u.nv);
        if (B.found) {
          await z(B);
          const qe =
            ((M = B.data) == null ? void 0 : M.estado) === 'Entregado' ? await U(B.row) : [];
          ee(
            {
              id: B.row,
              canal: u.canal,
              nv: u.nv,
              estado: B.data.estado,
              reabierta: B.data.reabierta === !0,
              motivo_reapertura: B.data.motivo_reapertura || ''
            },
            qe
          );
        }
      }
      (be.getState().patch({ submitResult: { success: !1, message: T } }),
        d({ type: 'error', message: T }));
    };
  return e.jsxs('div', {
    className: 'pb-24',
    children: [
      e.jsx(Rt, {
        options: r,
        transportistasOpts: (r == null ? void 0 : r.transportistas) || [],
        vendedoresMaestro: i,
        onLookup: j,
        onLookupOrange: y,
        canRequestReopen: a,
        onOpenReopen: () => {
          var u, N, k;
          return ee({
            id: f == null ? void 0 : f.row,
            canal: s.canal,
            nv: s.nv,
            estado: (u = f == null ? void 0 : f.data) == null ? void 0 : u.estado,
            reabierta: ((N = f == null ? void 0 : f.data) == null ? void 0 : N.reabierta) === !0,
            motivo_reapertura:
              ((k = f == null ? void 0 : f.data) == null ? void 0 : k.motivo_reapertura) || ''
          });
        },
        latestReopenRequest: W
      }),
      x && e.jsx(Ut, { canal: x.canal, nv: x.nv, onClose: () => m(null) }),
      c &&
        e.jsx(Gt, {
          item: c,
          puedeEscribir: a,
          puedeAprobarReapertura: t,
          motivo: v,
          onMotivoChange: S,
          onRequestReopen: w,
          requesting: A,
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
                    (C == null ? void 0 : C.permitida) === !1 &&
                    !H &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold',
                      children: C.message || 'Sin acceso IAM para editar esta N.V.'
                    }),
                  s.mode === 'update' &&
                    (C == null ? void 0 : C.permitida) === !1 &&
                    H &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold',
                      children:
                        ($ == null ? void 0 : $.message) ||
                        'Tienes permiso para cambiar estado, pero no para editar otros campos de esta N.V.'
                    }),
                  I &&
                    a &&
                    e.jsxs('button', {
                      onClick: () => {
                        var u, N, k;
                        return ee({
                          id: f == null ? void 0 : f.row,
                          canal: s.canal,
                          nv: s.nv,
                          estado: (u = f == null ? void 0 : f.data) == null ? void 0 : u.estado,
                          reabierta:
                            ((N = f == null ? void 0 : f.data) == null ? void 0 : N.reabierta) ===
                            !0,
                          motivo_reapertura:
                            ((k = f == null ? void 0 : f.data) == null
                              ? void 0
                              : k.motivo_reapertura) || '',
                          pendingRequest: W
                        });
                      },
                      className:
                        'px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-black text-sm flex items-center gap-2',
                      children: [e.jsx(Ze, { size: 16 }), 'Solicitar reapertura']
                    }),
                  e.jsxs('button', {
                    onClick: O,
                    disabled:
                      s.submitting ||
                      I ||
                      (s.mode === 'update' && (C == null ? void 0 : C.permitida) === !1 && !H),
                    className:
                      'px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2',
                    children: [
                      s.submitting
                        ? e.jsx(Ae, { size: 16, className: 'animate-spin' })
                        : e.jsx(Ma, { size: 16 }),
                      I
                        ? 'N.V. bloqueada'
                        : s.mode === 'update' && (C == null ? void 0 : C.permitida) === !1 && !H
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
    [o, d] = b.useState('buscar'),
    i = [
      { v: 'buscar', label: 'Buscar', hint: 'Seguimiento y consulta', icon: Qe, accent: '#2563eb' },
      { v: 'ingresar', label: 'Ingresar', hint: 'Registro operativo', icon: Ue, accent: ne },
      ...(s
        ? [
            {
              v: 'consolidados',
              label: 'Consolidados',
              hint: 'Agrupación comercial',
              icon: $a,
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
              const x = l.icon,
                m = o === l.v;
              return e.jsxs(
                'button',
                {
                  type: 'button',
                  onClick: () => d(l.v),
                  className: `group relative overflow-hidden rounded-[1.15rem] border px-4 py-3.5 text-left transition-all duration-200 ${m ? 'bg-white text-slate-700 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]' : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/80'}`,
                  style: m ? { borderColor: `${l.accent}26` } : void 0,
                  'aria-pressed': m,
                  children: [
                    m &&
                      e.jsx('div', {
                        className: 'absolute inset-x-4 top-0 h-[2px] rounded-full',
                        style: { background: l.accent }
                      }),
                    e.jsx('div', {
                      className: `absolute inset-0 pointer-events-none transition-opacity ${m ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`,
                      style: {
                        background: `radial-gradient(circle at top right, ${l.accent}14, transparent 42%)`
                      }
                    }),
                    e.jsxs('div', {
                      className: 'relative flex items-center gap-3',
                      children: [
                        e.jsx('div', {
                          className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${m ? 'bg-white' : 'border-slate-200 bg-white/90 text-slate-500'}`,
                          style: m
                            ? {
                                borderColor: `${l.accent}26`,
                                color: l.accent,
                                background: `${l.accent}10`
                              }
                            : void 0,
                          children: e.jsx(x, { size: 18 })
                        }),
                        e.jsxs('div', {
                          className: 'min-w-0 flex-1',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center justify-between gap-3',
                              children: [
                                e.jsx('div', {
                                  className: `text-sm font-black tracking-tight ${m ? 'text-slate-900' : 'text-slate-800'}`,
                                  children: l.label
                                }),
                                m &&
                                  e.jsx('span', {
                                    className:
                                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
                                    style: { background: `${l.accent}12`, color: l.accent },
                                    children: 'Activo'
                                  })
                              ]
                            }),
                            e.jsx('div', {
                              className: `mt-1 text-[12px] leading-5 ${m ? 'text-slate-500' : 'text-slate-400'}`,
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
