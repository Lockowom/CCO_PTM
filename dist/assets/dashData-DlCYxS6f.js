import { s as k, L as we } from './index-CaJXm3gm.js';
function y(t, o = '') {
  return t ? (typeof t == 'string' && t.length >= 10 ? t.slice(0, 10) : String(t)) : o;
}
function et(t, o = '—') {
  if (!t) return o;
  const n = String(t).slice(0, 10),
    l = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  return l ? `${l[3]}-${l[2]}-${l[1]}` : String(t);
}
function at() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}
function tt(t, o) {
  const n = new Date(t + 'T12:00:00');
  n.setDate(n.getDate() + o);
  const l = n.getFullYear(),
    f = String(n.getMonth() + 1).padStart(2, '0'),
    h = String(n.getDate()).padStart(2, '0');
  return `${l}-${f}-${h}`;
}
function nt(t) {
  if (!t) return '245,124,0';
  const o = t.replace('#', ''),
    n = parseInt(o, 16);
  return isNaN(n) || o.length < 6 ? '245,124,0' : `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
const r = {
    EN_PROCESO: 'En Proceso',
    P_VENDEDOR: 'P / VENDEDOR',
    P_STOCK: 'P / STOCK',
    P_RETIRO: 'P / RETIRO',
    SHIPPING: 'Shipping',
    CURRIER: 'Currier',
    EN_RUTA: 'En Ruta',
    ENTREGADO: 'Entregado',
    RECIBIDO_CONFORME: 'Recibido Conforme',
    RECIBIDO_OBS: 'Recibido C/OBS'
  },
  Je = {
    'EN PROCESO': r.EN_PROCESO,
    'EN SHIPPING': r.SHIPPING,
    'EN RUTA': r.EN_RUTA,
    ENTREGADO: r.ENTREGADO,
    'RECIBIDO CONFORME': r.ENTREGADO,
    'RECIBIDO C/OBS': r.ENTREGADO,
    'Recibido Conforme': r.ENTREGADO,
    'Recibido C/OBS': r.ENTREGADO
  };
function ot(t) {
  return t ? Je[t] || t : '';
}
const st = {
  [r.EN_PROCESO]: '#f59e0b',
  [r.P_VENDEDOR]: '#d97706',
  [r.P_STOCK]: '#b45309',
  [r.P_RETIRO]: '#92400e',
  [r.SHIPPING]: '#8b5cf6',
  [r.CURRIER]: '#7c3aed',
  [r.EN_RUTA]: '#06b6d4',
  [r.ENTREGADO]: '#22c55e',
  [r.RECIBIDO_CONFORME]: '#16a34a',
  [r.RECIBIDO_OBS]: '#15803d'
};
function Ma(t, o) {
  const n = new Date(t);
  let l = 0;
  const f = n.getDay();
  for (f === 0 ? n.setDate(n.getDate() + 1) : f === 6 && n.setDate(n.getDate() + 2); l < o;) {
    n.setDate(n.getDate() + 1);
    const h = n.getDay();
    h !== 0 && h !== 6 && l++;
  }
  return n;
}
function V(t, o) {
  const n = o || t;
  if (!n) return '';
  const l = new Date(n + 'T12:00:00');
  if (isNaN(l.getTime())) return '';
  const f = Ma(l, 2),
    h = f.getFullYear(),
    E = String(f.getMonth() + 1).padStart(2, '0'),
    c = String(f.getDate()).padStart(2, '0');
  return `${h}-${E}-${c}`;
}
const le = 'tms_operaciones_vigentes',
  ka = 60 * 1e3,
  $a = 45 * 1e3,
  Fa = 2 * 60 * 1e3,
  Ye = 'cco:panel-dashboard:',
  La = 15 * 1e3,
  Ua = 10 * 1e3;
let P = { ts: 0, data: null, promise: null };
const B = new Map(),
  oe = new Map(),
  se = new Map();
function Ze(t, o) {
  return !!t && Object.prototype.hasOwnProperty.call(t, 'value') && Date.now() - t.ts < o;
}
function Ie(t, o, n) {
  const l = t.get(o);
  return l ? (l.promise ? l.promise : Ze(l, n) ? l.value : (t.delete(o), null)) : null;
}
function Pe(t, o, n) {
  return (t.set(o, { ts: Date.now(), value: n }), n);
}
function ye(t, o, n) {
  return (t.set(o, { ts: Date.now(), promise: n }), n);
}
function Ga(t) {
  if (typeof window > 'u' || !window.sessionStorage) return null;
  try {
    const o = window.sessionStorage.getItem(`${Ye}${t}`);
    if (!o) return null;
    const n = JSON.parse(o);
    return Ze(n, Fa) ? n.value : null;
  } catch {
    return null;
  }
}
function xa(t, o) {
  if (!(typeof window > 'u' || !window.sessionStorage))
    try {
      window.sessionStorage.setItem(`${Ye}${t}`, JSON.stringify({ ts: Date.now(), value: o }));
    } catch {}
}
function Va(t) {
  const o = Number((t == null ? void 0 : t.status) || (t == null ? void 0 : t.statusCode) || 0);
  return (
    [408, 429, 500, 502, 503, 504].includes(o) ||
    /network|fetch|timeout|connection pool|temporar/i.test(
      String((t == null ? void 0 : t.message) || t || '')
    )
  );
}
async function za(t, o = 3) {
  let n;
  for (let l = 0; l < o; l += 1)
    try {
      return await t();
    } catch (f) {
      if (((n = f), !Va(f) || l === o - 1)) throw f;
      const h = 250 * 2 ** l + Math.floor(Math.random() * 100);
      (we.warn(f, {
        module: 'panel',
        screen: 'PanelDashboard',
        action: 'dashboard_retry',
        message: 'Reintento de carga del dashboard por error transitorio',
        attempt: l + 1,
        delayMs: h
      }),
        await new Promise((E) => setTimeout(E, h)));
    }
  throw n;
}
function Ke(t) {
  return Math.round(Math.max(0, performance.now() - t));
}
async function j(
  t,
  o,
  { screen: n = 'PanelDashboard', payload: l = null, slowMs: f = 1200, message: h = '' } = {}
) {
  const E = performance.now();
  try {
    const c = await o(),
      p = Ke(E);
    return (
      p >= f &&
        we.performance({
          module: 'panel',
          screen: n,
          action: t,
          message: h || `Operacion lenta del dashboard: ${t}`,
          durationMs: p,
          status: 'ok',
          payload: l
        }),
      c
    );
  } catch (c) {
    throw (
      we.error(c, {
        module: 'panel',
        screen: n,
        action: t,
        message: `Fallo operacion de dashboard: ${t}`,
        durationMs: Ke(E),
        status: 'error',
        payload: l
      }),
      c
    );
  }
}
function M(t) {
  return t.fecha_aprobacion_real || t.fecha_aprobacion || null;
}
function We(t, o, n) {
  if (!o || !n) return !0;
  const l = M(t);
  if (!l) return !1;
  const f = String(l).slice(0, 10);
  return f >= o && f <= n;
}
function Ce(t, o) {
  if (!t || !o) return null;
  const n = new Date(t).getTime(),
    l = new Date(o).getTime();
  if (isNaN(n) || isNaN(l)) return null;
  const f = (l - n) / (1e3 * 60 * 60 * 24);
  return f < 0 || f > 365 ? null : f;
}
function Ha(t) {
  const n = [
    { nombre: 'En Proceso → Shipping', from: (p) => M(p), to: (p) => p.fecha_shipping },
    { nombre: 'Shipping → En Ruta', from: (p) => p.fecha_shipping, to: (p) => p.fecha_en_ruta },
    { nombre: 'En Ruta → Entregado', from: (p) => p.fecha_en_ruta, to: (p) => p.fecha_entregado }
  ].map((p) => {
    let s = 0,
      u = 0;
    return (
      t.forEach((m) => {
        const S = Ce(p.from(m), p.to(m));
        S !== null && ((s += S), u++);
      }),
      { nombre: p.nombre, dias: u > 0 ? +(s / u).toFixed(1) : null, n: u }
    );
  });
  let l = 0,
    f = 0;
  t.forEach((p) => {
    const s = p.fecha_entregado || p.fecha_despacho,
      u = Ce(M(p), s);
    u !== null && ((l += u), f++);
  });
  const h = f > 0 ? +(l / f).toFixed(1) : null,
    E = n.filter((p) => p.dias !== null),
    c = E.length > 0 ? E.reduce((p, s) => (s.dias > p.dias ? s : p)) : null;
  return {
    etapas: n,
    leadTimeTotal: h,
    leadTimeTotalN: f,
    cuelloBotella: c ? { nombre: c.nombre, dias: c.dias } : null
  };
}
const ce = ['NULA', 'REFACTURADO', 'RECHAZADO'];
function z(t) {
  return t && (Je[t] || t);
}
const qe = [r.P_VENDEDOR, r.P_STOCK, r.P_RETIRO],
  ie = [r.EN_PROCESO, ...qe],
  R = [r.EN_PROCESO, ...qe, r.SHIPPING, r.CURRIER, r.EN_RUTA],
  Ba = [r.CURRIER, r.EN_RUTA, r.ENTREGADO],
  b = [r.ENTREGADO],
  K = [
    r.EN_PROCESO,
    r.P_VENDEDOR,
    r.P_STOCK,
    r.P_RETIRO,
    r.SHIPPING,
    r.CURRIER,
    r.EN_RUTA,
    r.ENTREGADO
  ],
  Ka = [...K, 'NULA', 'REFACTURADO', 'RECHAZADO'];
function ja(t) {
  return t.fecha_shipping || t.fecha_en_ruta || t.fecha_entregado || t.fecha_despacho || null;
}
function O(t) {
  const o = t.fecha_compromiso || V(t.fecha_aprobacion, t.fecha_aprobacion_real);
  if (!o) return null;
  const n = M(t);
  if (!n) return { fecha: o, diasAtraso: 0 };
  const l = new Date(o).getTime(),
    f = new Date(n).getTime();
  if (f > l) {
    const h = Math.round((f - l) / 864e5);
    return { fecha: n.split('T')[0], diasAtraso: h };
  }
  return { fecha: o, diasAtraso: 0 };
}
function re(t, o) {
  if (ce.includes(t.estado || '')) return null;
  const n = O(t);
  if (!n) return null;
  const l = new Date(n.fecha + 'T23:59:59').getTime();
  if (ie.includes(t.estado || '')) return o > l ? !1 : null;
  const f = ja(t);
  return f ? new Date(f).getTime() <= l : null;
}
function x(t) {
  const o = new Date(t + 'T12:00:00');
  if (isNaN(o.getTime())) return '';
  const n = o.getDay(),
    l = o.getDate() - n + (n === 0 ? -6 : 1),
    f = new Date(o.getFullYear(), o.getMonth(), l);
  return isNaN(f.getTime()) ? '' : f.toISOString().split('T')[0];
}
function Ja(t) {
  if (!t) return 0;
  const o = Date.now() - new Date(t).getTime();
  return Number.isNaN(o) ? 0 : o / (1e3 * 60 * 60);
}
function Ya(t, o = '') {
  const n = `${t || ''} ${o || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return n.includes('direccion') || n.includes('domicilio') || n.includes('contacto')
    ? 'direccion'
    : n.includes('transport') ||
        n.includes('courier') ||
        n.includes('currier') ||
        n.includes('ruta') ||
        n.includes('flete')
      ? 'transporte'
      : 'otro';
}
const je =
  'nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,division,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_en_proceso,incidencia,estado_incidencia,observaciones_incidencia,dias_incidencia,guia,factura,urgente,reabierta,motivo_reapertura,fecha_reapertura';
async function Me(t, o, n) {
  const l = [];
  let f = 0;
  const h = 1e3;
  for (;;) {
    let E = k
      .from(le)
      .select(t)
      .order('id', { ascending: !0 })
      .range(f, f + h - 1);
    o && n
      ? (E = E.or(
          `and(fecha_aprobacion_real.gte.${o},fecha_aprobacion_real.lte.${n}),and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${o},fecha_aprobacion.lte.${n})`
        ))
      : o
        ? (E = E.or(
            `fecha_aprobacion_real.gte.${o},and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${o})`
          ))
        : n &&
          (E = E.or(
            `fecha_aprobacion_real.lte.${n},and(fecha_aprobacion_real.is.null,fecha_aprobacion.lte.${n})`
          ));
    const { data: c, error: p } = await E;
    if (p) throw p;
    if (!c || c.length === 0 || (l.push(...c), c.length < h)) break;
    f += h;
  }
  return l;
}
const Za = [
  r.EN_PROCESO,
  'EN PROCESO',
  r.P_VENDEDOR,
  r.P_STOCK,
  r.P_RETIRO,
  r.SHIPPING,
  'SHIPPING',
  'EN SHIPPING',
  r.CURRIER,
  'CURRIER',
  r.EN_RUTA,
  'EN RUTA'
];
function Wa(t) {
  const o = t.nv_ptm ? 'ptm' : t.nv_orange ? 'orange' : t.nv_farmapack ? 'farmapack' : 'varios',
    n = t.nv_ptm ? String(t.nv_ptm) : t.nv_orange || t.nv_farmapack || t.varios || '';
  return `${o}:${n}`;
}
async function fe(t) {
  const o = [];
  let n = 0;
  const l = 1e3;
  for (;;) {
    const { data: f, error: h } = await k
      .from(le)
      .select(t)
      .in('estado', Za)
      .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
      .order('id', { ascending: !1 })
      .range(n, n + l - 1);
    if (h) throw h;
    if (!f || f.length === 0 || (o.push(...f), f.length < l)) break;
    n += l;
  }
  return o;
}
async function qa() {
  return j(
    'fetch_consolidado_keys',
    async () => {
      const t = Date.now();
      if (P.data && t - P.ts < ka) return P.data;
      if (P.promise) return P.promise;
      const o = async () => {
        const { data: n, error: l } = await k.from('consolidado_nvs').select('nv, canal'),
          f = l ? new Set() : new Set((n || []).map((h) => `${h.canal || 'ptm'}:${h.nv}`));
        return ((P = { ts: Date.now(), data: f, promise: null }), f);
      };
      return (
        (P.promise = o().catch((n) => {
          throw ((P.promise = null), n);
        })),
        P.promise
      );
    },
    {
      payload: { feature: 'consolidados' },
      slowMs: 500,
      message: 'Carga de claves consolidadas para dashboard'
    }
  );
}
async function ct(t, o) {
  return j(
    'fetch_dashboard_data',
    async () => {
      const n = `${t || ''}:${o || ''}`,
        l = Ie(B, n, $a);
      if (l) return l;
      const f = Ga(n);
      if (f) return (B.set(n, { ts: Date.now(), value: f }), f);
      const E = za(async () => {
        const [c, p, s] = await Promise.all([Me(je, t, o), fe(je), qa()]),
          u = (e) => {
            ((e.estado = z(e.estado)),
              (e._consolidado = s.has(Wa(e))),
              e.fecha_compromiso ||
                (e.fecha_compromiso = V(e.fecha_aprobacion, e.fecha_aprobacion_real) || null));
          };
        (p.forEach(u), c.forEach(u));
        const m = p,
          S = m.filter((e) => We(e, t, o)),
          D = c.filter((e) => !e._consolidado),
          _ = m.filter((e) => !e._consolidado),
          v = c.length,
          C = c.filter((e) => e.nv_ptm).length,
          de = c.filter((e) => e.nv_orange).length,
          J = c.filter((e) => e.nv_farmapack).length,
          Y = c.filter((e) => e.varios).length,
          A = {};
        (c.forEach((e) => {
          const a = e.estado || 'null';
          A[a] = (A[a] || 0) + 1;
        }),
          R.forEach((e) => {
            A[e] = 0;
          }),
          S.forEach((e) => {
            const a = e.estado || 'null';
            A[a] = (A[a] || 0) + 1;
          }));
        const H = c.filter((e) => b.includes(e.estado)).length,
          Z = A.NULA || 0,
          ue = A.REFACTURADO || 0,
          W = A.RECHAZADO || 0,
          pe = m.length,
          ke = v - Z - ue - W,
          ea = ke > 0 ? ((H / ke) * 100).toFixed(1) : '0',
          aa = D.filter((e) => b.includes(e.estado) && e.fecha_despacho && e.fecha_compromiso);
        let $e = 0,
          q = 0,
          he = 0;
        aa.forEach((e) => {
          const a = O(e);
          if (!a) return;
          const i = new Date(e.fecha_despacho),
            d = new Date(a.fecha),
            g = (i.getTime() - d.getTime()) / (1e3 * 60 * 60 * 24);
          Math.abs(g) > 30 || (g > 0 ? (($e += g), q++) : he++);
        });
        const ta = q > 0 ? ($e / q).toFixed(1) : '0',
          Fe = q + he,
          na = Fe > 0 ? ((he / Fe) * 100).toFixed(0) : '0',
          oa = (e) => {
            const a = String((e == null ? void 0 : e.incidencia) || '').trim(),
              i = String((e == null ? void 0 : e.estado_incidencia) || '')
                .trim()
                .toUpperCase();
            return a.length > 0 && i !== 'RESUELTA';
          },
          Le = D.filter(oa),
          sa = Le.length,
          Ue = Date.now();
        let X = 0,
          _e = 0;
        D.forEach((e) => {
          const a = re(e, Ue);
          a === !0 ? X++ : a === !1 && _e++;
        });
        const me = X + _e,
          ca = {
            pct: me > 0 ? ((X / me) * 100).toFixed(1) : null,
            cumple: X,
            noCumple: _e,
            evaluables: me
          },
          ia = new Date().toISOString().split('T')[0],
          ra = x(ia),
          la = Date.now(),
          Ge = D.filter((e) => {
            if (!e.fecha_registro_nv || ce.includes(e.estado || '')) return !1;
            const a =
              typeof e.fecha_registro_nv == 'string'
                ? e.fecha_registro_nv.split('T')[0]
                : new Date(e.fecha_registro_nv).toISOString().split('T')[0];
            return x(a) === ra;
          });
        let Q = 0,
          ee = 0;
        Ge.forEach((e) => {
          const a = O(e);
          if (!a) return;
          const i = new Date(a.fecha + 'T23:59:59').getTime();
          if (ie.includes(e.estado)) la > i && ee++;
          else {
            const d = e.fecha_shipping || e.fecha_en_ruta || e.fecha_entregado;
            d && (new Date(d).getTime() <= i ? Q++ : ee++);
          }
        });
        const ge = Q + ee,
          fa = {
            pct: ge > 0 ? ((Q / ge) * 100).toFixed(1) : null,
            cumple: Q,
            noCumple: ee,
            evaluables: ge,
            totalSemana: Ge.length
          },
          da = {
            total: v,
            countNvPtm: C,
            nvVarios: Y,
            nvOrange: de,
            nvFarmapack: J,
            estadoCounts: A,
            entregadas: H,
            activas: pe,
            tasaEntrega: ea,
            leadTimeTardanza: ta,
            pctAtiempo: na,
            incidencias: sa,
            fillRateShipping: ca,
            cumplimientoNV: fa
          },
          $ = {},
          xe = (e) => {
            const a = e.estado || 'null';
            ($[a] || ($[a] = { farmapack: 0, orange: 0, ptm: 0, varios: 0, total: 0 }),
              e.nv_farmapack && $[a].farmapack++,
              e.nv_orange && $[a].orange++,
              e.nv_ptm && $[a].ptm++,
              e.varios && $[a].varios++,
              $[a].total++);
          };
        (c.forEach((e) => {
          R.includes(e.estado || '') || xe(e);
        }),
          S.forEach((e) => {
            R.includes(e.estado || '') && xe(e);
          }));
        const ua = Object.entries($)
            .map(([e, a]) => ({ estado: e, ...a }))
            .filter((e) => K.includes(e.estado))
            .sort((e, a) => K.indexOf(e.estado) - K.indexOf(a.estado)),
          Ee = {};
        c.forEach((e) => {
          const a = e.division || 'SIN DIVISIÓN';
          Ee[a] = (Ee[a] || 0) + 1;
        });
        const pa = Object.entries(Ee)
            .map(([e, a]) => ({ division: e, cantidad: a }))
            .sort((e, a) => a.cantidad - e.cantidad),
          ve = {};
        c.forEach((e) => {
          const a = e.transportista || 'SIN TRANSPORTISTA';
          ve[a] = (ve[a] || 0) + 1;
        });
        const ha = Object.entries(ve)
            .map(([e, a]) => ({ transportista: e, cantidad: a }))
            .sort((e, a) => a.cantidad - e.cantidad),
          F = {};
        D.forEach((e) => {
          const a = M(e);
          if (!a) return;
          const i = x(a);
          if (!i) return;
          (F[i] ||
            (F[i] = { aprobadas: 0, entregadas: 0, tardanza: [], fillrateOk: 0, fillrateTotal: 0 }),
            F[i].aprobadas++,
            b.includes(e.estado) && F[i].entregadas++);
          const d = re(e, Ue);
          if ((d !== null && (F[i].fillrateTotal++, d && F[i].fillrateOk++), e.fecha_despacho)) {
            const g = O(e);
            if (g) {
              const N = new Date(e.fecha_despacho),
                T = new Date(g.fecha),
                w = (N.getTime() - T.getTime()) / (1e3 * 60 * 60 * 24);
              w > 0 && w <= 30 && F[i].tardanza.push(w);
            }
          }
        });
        const _a = Object.entries(F)
            .sort(([e], [a]) => e.localeCompare(a))
            .map(([e, a]) => {
              const i = new Date(e + 'T12:00:00'),
                d = i.getDate(),
                g = [
                  'Ene',
                  'Feb',
                  'Mar',
                  'Abr',
                  'May',
                  'Jun',
                  'Jul',
                  'Ago',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dic'
                ],
                N = `${String(d).padStart(2, '0')}-${g[i.getMonth()]}`,
                T =
                  a.tardanza.length > 0
                    ? +(a.tardanza.reduce((ne, ya) => ne + ya, 0) / a.tardanza.length).toFixed(1)
                    : 0,
                w = a.fillrateTotal > 0 ? +((a.fillrateOk / a.fillrateTotal) * 100).toFixed(1) : 0;
              return {
                semana: N,
                entregadas: a.entregadas,
                aprobadas: a.aprobadas,
                tardanza: T,
                fillRate: w
              };
            }),
          Se = {};
        S.forEach((e) => {
          R.includes(e.estado || '') && (Se[e.estado] = (Se[e.estado] || 0) + 1);
        });
        const ma = Object.entries(Se)
            .map(([e, a]) => ({ estado: e, count: a }))
            .sort((e, a) => a.count - e.count),
          G = {};
        D.forEach((e) => {
          if (!b.includes(e.estado) || !e.fecha_despacho || !e.fecha_compromiso) return;
          const a = M(e);
          if (!a) return;
          const i = x(a);
          if (!i) return;
          G[i] || (G[i] = { tardanzaSum: 0, tardanzaCount: 0, atiempoCount: 0 });
          const d = O(e);
          if (!d) return;
          const g = new Date(e.fecha_despacho),
            N = new Date(d.fecha),
            T = (g.getTime() - N.getTime()) / (1e3 * 60 * 60 * 24);
          Math.abs(T) > 30 ||
            (T > 0 ? ((G[i].tardanzaSum += T), G[i].tardanzaCount++) : G[i].atiempoCount++);
        });
        const ga = Object.entries(G)
            .sort(([e], [a]) => e.localeCompare(a))
            .map(([e, a]) => {
              const i = new Date(e + 'T12:00:00'),
                d = Math.ceil(
                  ((i.getTime() - new Date(i.getFullYear(), 0, 1).getTime()) / 864e5 + 1) / 7
                ),
                g = a.tardanzaCount + a.atiempoCount;
              return {
                semana: `Semana ${d}`,
                dias: a.tardanzaCount > 0 ? +(a.tardanzaSum / a.tardanzaCount).toFixed(1) : 0,
                count: g,
                pctAtiempo: g > 0 ? +((a.atiempoCount / g) * 100).toFixed(0) : 0
              };
            }),
          Ea = R,
          Ve = new Date();
        Ve.setHours(0, 0, 0, 0);
        const va = Ve.getTime(),
          Sa = 1e3 * 60 * 60 * 24;
        let De = 0,
          Te = 0,
          Oe = 0;
        const Re = [];
        (_.forEach((e) => {
          if (!Ea.includes(e.estado || '')) return;
          const a = O(e);
          if (!a) return;
          const i = new Date(a.fecha + 'T12:00:00');
          i.setHours(0, 0, 0, 0);
          const d = Math.round((i.getTime() - va) / Sa);
          d > 1 ||
            (d < 0 ? De++ : d === 0 ? Te++ : d === 1 && Oe++,
            Re.push({
              nv:
                (e.nv_ptm && String(e.nv_ptm)) || e.nv_orange || e.nv_farmapack || e.varios || '—',
              cliente: e.cliente || '—',
              vendedor: e.vendedor || '—',
              transportista: e.transportista || '—',
              estado: e.estado || '—',
              division: e.division || '—',
              fecha_compromiso: e.fecha_compromiso,
              diasVencido: -d
            }));
        }),
          Re.sort((e, a) => a.diasVencido - e.diasVencido));
        const Da = { vencidos: De, hoy: Te, manana: Oe, total: De + Te + Oe, detalle: Re },
          be = {},
          I = (e) => {
            be[e] = (be[e] || 0) + 1;
          },
          ae = [];
        (c.forEach((e) => {
          const a = [],
            i = String(e.estado || '').trim(),
            d = ce.includes(i);
          i
            ? Ka.includes(i) || (a.push(`Estado no reconocido: "${i}"`), I('Estado no reconocido'))
            : (a.push('Sin estado'), I('Sin estado'));
          const g = b.includes(i);
          if (!d && !g) {
            (e.cliente || (a.push('Sin cliente'), I('Sin cliente')),
              e.vendedor || (a.push('Sin vendedor'), I('Sin vendedor')),
              e.division || (a.push('Sin división'), I('Sin división')),
              Ba.includes(i) &&
                !e.transportista &&
                (a.push('Sin transportista'), I('Sin transportista')));
            const N = e.fecha_compromiso || V(e.fecha_aprobacion, e.fecha_aprobacion_real);
            R.includes(i) && !N && (a.push('Sin fecha compromiso'), I('Sin fecha compromiso'));
            const T = M(e);
            (T &&
              e.fecha_despacho &&
              new Date(e.fecha_despacho).getTime() < new Date(T).getTime() &&
              (a.push('Despacho anterior a la aprobación'), I('Fecha incoherente')),
              e.fecha_entregado &&
                e.fecha_despacho &&
                new Date(e.fecha_entregado).getTime() < new Date(e.fecha_despacho).getTime() &&
                (a.push('Entrega anterior al despacho'), I('Fecha incoherente')));
          }
          a.length > 0 &&
            ae.push({
              nv:
                (e.nv_ptm && String(e.nv_ptm)) || e.nv_orange || e.nv_farmapack || e.varios || '—',
              cliente: e.cliente || '—',
              estado: i || '—',
              division: e.division || '—',
              vendedor: e.vendedor || '—',
              problemas: a
            });
        }),
          ae.sort((e, a) => a.problemas.length - e.problemas.length));
        const Ta = { total: ae.length, porTipo: be, detalle: ae };
        let Ae = 0,
          te = 0;
        D.forEach((e) => {
          if (!b.includes(e.estado) || !e.fecha_despacho || !e.fecha_compromiso) return;
          const a = O(e);
          if (!a) return;
          te++;
          const i = new Date(e.fecha_despacho),
            d = new Date(a.fecha);
          i.getTime() <= d.getTime() && !0 && Ae++;
        });
        const Oa = { pct: te > 0 ? +((Ae / te) * 100).toFixed(1) : null, cumple: Ae, total: te },
          L = {};
        D.forEach((e) => {
          const a = (e.transportista || '').trim();
          if (
            !(!a || a === 'SIN TRANSPORTISTA') &&
            (L[a] || (L[a] = { total: 0, entregadas: 0, aTiempo: 0, tardanzaSum: 0, tardanzaN: 0 }),
            L[a].total++,
            b.includes(e.estado) && (L[a].entregadas++, e.fecha_despacho && e.fecha_compromiso))
          ) {
            const i = O(e);
            if (i) {
              const d =
                (new Date(e.fecha_despacho).getTime() - new Date(i.fecha).getTime()) / 864e5;
              Math.abs(d) <= 30 &&
                (d <= 0 ? L[a].aTiempo++ : ((L[a].tardanzaSum += d), L[a].tardanzaN++));
            }
          }
        });
        const Ra = Object.entries(L)
            .map(([e, a]) => ({
              nombre: e,
              total: a.total,
              entregadas: a.entregadas,
              pctATiempo:
                a.aTiempo + a.tardanzaN > 0
                  ? +((a.aTiempo / (a.aTiempo + a.tardanzaN)) * 100).toFixed(0)
                  : null,
              tardanzaProm: a.tardanzaN > 0 ? +(a.tardanzaSum / a.tardanzaN).toFixed(1) : null
            }))
            .sort((e, a) => a.total - e.total)
            .slice(0, 10),
          U = {};
        D.forEach((e) => {
          const a = (e.vendedor || '').trim();
          if (
            !(!a || a === '—') &&
            (U[a] || (U[a] = { total: 0, entregadas: 0, aTiempo: 0, activas: 0, reabiertas: 0 }),
            U[a].total++,
            b.includes(e.estado) && U[a].entregadas++,
            R.includes(e.estado) && U[a].activas++,
            e.reabierta === !0 && U[a].reabiertas++,
            b.includes(e.estado) && e.fecha_despacho && e.fecha_compromiso)
          ) {
            const i = O(e);
            if (i) {
              const d =
                (new Date(e.fecha_despacho).getTime() - new Date(i.fecha).getTime()) / 864e5;
              d <= 0 && Math.abs(d) <= 30 && U[a].aTiempo++;
            }
          }
        });
        const ze = Object.entries(
            Le.reduce((e, a) => {
              const d = (a.vendedor || 'Sin vendedor').trim() || 'Sin vendedor';
              e[d] ||
                (e[d] = {
                  vendedor: d,
                  total: 0,
                  direccion: 0,
                  transporte: 0,
                  otros: 0,
                  fuera48h: 0,
                  clientes: new Set(),
                  transportistas: new Set(),
                  maxHoras: 0,
                  maxDias: 0,
                  tipos: {}
                });
              const g = e[d];
              ((g.total += 1),
                g.clientes.add(a.cliente || 'Sin cliente'),
                a.transportista && g.transportistas.add(a.transportista));
              const N = Ya(a.incidencia, a.observaciones_incidencia);
              (N === 'direccion'
                ? (g.direccion += 1)
                : N === 'transporte'
                  ? (g.transporte += 1)
                  : (g.otros += 1),
                (g.tipos[a.incidencia] = (g.tipos[a.incidencia] || 0) + 1));
              const T = a.fecha_aprobacion_real || a.fecha_aprobacion || a.fecha_estado,
                w = Ja(T);
              (w > 48 && (g.fuera48h += 1), w > g.maxHoras && (g.maxHoras = w));
              const ne = Number(a.dias_incidencia) || Math.max(0, Math.floor(w / 24));
              return (ne > g.maxDias && (g.maxDias = ne), e);
            }, {})
          )
            .map(([, e]) => {
              var a;
              return {
                vendedor: e.vendedor,
                total: e.total,
                direccion: e.direccion,
                transporte: e.transporte,
                otros: e.otros,
                fuera48h: e.fuera48h,
                clientes: e.clientes.size,
                transportistas: e.transportistas.size,
                maxDias: e.maxDias,
                topTipo:
                  ((a = Object.entries(e.tipos).sort((i, d) => d[1] - i[1])[0]) == null
                    ? void 0
                    : a[0]) || '—'
              };
            })
            .sort((e, a) => a.fuera48h - e.fuera48h || a.total - e.total || a.maxDias - e.maxDias)
            .slice(0, 12),
          ba = ze.reduce((e, a) => ((e[a.vendedor] = a), e), {}),
          Aa = Object.entries(U)
            .map(([e, a]) => {
              const i = ba[e];
              return {
                nombre: e,
                total: a.total,
                entregadas: a.entregadas,
                activas: a.activas,
                reabiertas: a.reabiertas,
                pctATiempo:
                  a.entregadas > 0 ? +((a.aTiempo / a.entregadas) * 100).toFixed(0) : null,
                erroresActivos: (i == null ? void 0 : i.total) || 0,
                errores48h: (i == null ? void 0 : i.fuera48h) || 0,
                errorPrincipal: (i == null ? void 0 : i.topTipo) || '—'
              };
            })
            .sort(
              (e, a) =>
                a.errores48h - e.errores48h ||
                a.erroresActivos - e.erroresActivos ||
                a.reabiertas - e.reabiertas ||
                a.total - e.total
            )
            .slice(0, 10),
          Na = {
            [r.EN_PROCESO]: 3,
            [r.P_VENDEDOR]: 3,
            [r.P_STOCK]: 3,
            [r.P_RETIRO]: 3,
            [r.SHIPPING]: 2,
            [r.CURRIER]: 2,
            [r.EN_RUTA]: 3,
            [r.ENTREGADO]: 5
          },
          He = [],
          wa = Date.now();
        R.forEach((e) => {
          const a = Na[e] || 5,
            i = [];
          (p.forEach((d) => {
            if (d.estado !== e || d._consolidado) return;
            const g = d.fecha_estado || d.fecha_registro_nv;
            if (!g) return;
            if ((wa - new Date(g).getTime()) / (1e3 * 60 * 60 * 24) > a) {
              const T =
                (d.nv_ptm && String(d.nv_ptm)) || d.nv_orange || d.nv_farmapack || d.varios || '?';
              i.push(T);
            }
          }),
            i.length > 0 && He.push({ estado: e, cantidad: i.length, nvs: i.slice(0, 5) }));
        });
        const Ca = He,
          Ia = [
            {
              etapa: r.EN_PROCESO,
              incluye: [...ie, r.SHIPPING, r.CURRIER, r.EN_RUTA, r.ENTREGADO]
            },
            { etapa: r.SHIPPING, incluye: [r.SHIPPING, r.CURRIER, r.EN_RUTA, r.ENTREGADO] },
            { etapa: r.EN_RUTA, incluye: [r.EN_RUTA, r.ENTREGADO] },
            { etapa: r.ENTREGADO, incluye: [r.ENTREGADO] }
          ].map(({ etapa: e, incluye: a }) => {
            let i = 0;
            return (
              c.forEach((d) => {
                a.includes(d.estado || '') && i++;
              }),
              S.forEach((d) => {
                R.includes(d.estado || '') && a.includes(d.estado || '') && i++;
              }),
              { etapa: e, cantidad: i }
            );
          }),
          Ne = {};
        c.forEach((e) => {
          const a = e.estado || 'Sin estado';
          if (!K.includes(a)) return;
          const i = (e.transportista || '').trim() || 'Sin transportista',
            d = `${a}|||${i}`;
          Ne[d] = (Ne[d] || 0) + 1;
        });
        const Pa = Object.entries(Ne)
            .map(([e, a]) => {
              const [i, d] = e.split('|||');
              return { estado: i, transportista: d, cantidad: a };
            })
            .sort((e, a) => a.cantidad - e.cantidad),
          Be = {
            kpis: da,
            estadoTable: ua,
            divisions: pa,
            transportistas: ha,
            weeklyTrend: _a,
            estadoResumen: ma,
            leadTimeSemanal: ga,
            alertas: Da,
            calidad: Ta,
            tiemposCiclo: Ha(D),
            otif: Oa,
            rankingTransportistas: Ra,
            rankingVendedores: Aa,
            incidenciasPorVendedor: ze,
            alertasOperacionales: Ca,
            funnelEstados: Ia,
            heatmapData: Pa
          };
        return (xa(n, Be), Pe(B, n, Be));
      }).catch((c) => {
        throw (B.delete(n), c);
      });
      return ye(B, n, E);
    },
    {
      payload: { dateFrom: t || null, dateTo: o || null },
      slowMs: 1800,
      message: 'Carga principal de datos del dashboard del Panel'
    }
  );
}
async function it(t, o) {
  return j(
    'get_incidencias_activas',
    async () => {
      const n = `${t || ''}:${o || ''}`,
        l = Ie(oe, n, La);
      if (l) return l;
      const h = (async () => {
        const E =
          'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, incidencia, estado_incidencia, observaciones_incidencia, dias_incidencia, fecha_aprobacion, fecha_aprobacion_real';
        if (!k) return [];
        const c = [];
        let p = 0;
        const s = 1e3;
        for (;;) {
          let u = k
            .from(le)
            .select(E)
            .not('incidencia', 'is', null)
            .neq('estado_incidencia', 'RESUELTA')
            .order('id', { ascending: !0 })
            .range(p, p + s - 1);
          (t &&
            (u = u.or(
              `fecha_aprobacion_real.gte.${t},and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${t})`
            )),
            o &&
              (u = u.or(
                `fecha_aprobacion_real.lte.${o},and(fecha_aprobacion_real.is.null,fecha_aprobacion.lte.${o})`
              )));
          const { data: m, error: S } = await u;
          if (S || !m || m.length === 0 || (c.push(...m), m.length < s)) break;
          p += s;
        }
        return Pe(
          oe,
          n,
          c
            .map((u) => ({
              nv:
                (u.nv_ptm && String(u.nv_ptm)) || u.nv_orange || u.nv_farmapack || u.varios || '—',
              fecha: u.fecha_aprobacion_real || u.fecha_aprobacion || null,
              cliente: u.cliente || '—',
              vendedor: u.vendedor || '—',
              transportista: u.transportista || '—',
              estado: z(u.estado) || '—',
              incidencia: u.incidencia || '—',
              estado_incidencia: u.estado_incidencia || '—',
              observaciones: u.observaciones_incidencia || '—',
              dias: u.dias_incidencia || 0
            }))
            .sort((u, m) => m.dias - u.dias)
        );
      })().catch((E) => {
        throw (oe.delete(n), E);
      });
      return ye(oe, n, h);
    },
    {
      payload: { dateFrom: t || null, dateTo: o || null },
      slowMs: 900,
      message: 'Carga de incidencias activas del dashboard'
    }
  );
}
async function rt(t, o, n) {
  return j(
    'get_operaciones_por_estado',
    async () => {
      const l =
          'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_despacho, fecha_compromiso, division, fecha_aprobacion, fecha_aprobacion_real, fecha_registro_nv, fecha_shipping, fecha_en_ruta, fecha_entregado, tipo_despacho, fecha_estado, reabierta, motivo_reapertura, fecha_reapertura',
        f = t === 'ACTIVAS',
        h = f || R.includes(t),
        E = h ? await fe(l) : await Me(l, o, n),
        c = h && !f ? E.filter((s) => We(s, o, n)) : E;
      return (
        c.forEach((s) => {
          s.estado = z(s.estado);
        }),
        c
          .filter((s) => {
            if (t === 'ACTIVAS') return R.includes(s.estado || '');
            if (t === 'TARDIAS') {
              if (!b.includes(s.estado) || !s.fecha_despacho || !s.fecha_compromiso) return !1;
              const u = O(s);
              if (!u) return !1;
              const m =
                (new Date(s.fecha_despacho).getTime() - new Date(u.fecha).getTime()) /
                (1e3 * 60 * 60 * 24);
              return m > 0 && Math.abs(m) <= 30;
            }
            if (t === 'ATIEMPO') {
              if (!b.includes(s.estado) || !s.fecha_despacho || !s.fecha_compromiso) return !1;
              const u = O(s);
              if (!u) return !1;
              const m =
                (new Date(s.fecha_despacho).getTime() - new Date(u.fecha).getTime()) /
                (1e3 * 60 * 60 * 24);
              return m <= 0 && Math.abs(m) <= 30;
            }
            if (t === 'ENTREGADAS') return b.includes(s.estado);
            if (t === 'FILLRATE_CUMPLE') return re(s, Date.now()) === !0;
            if (t === 'FILLRATE_NOCUMPLE') return re(s, Date.now()) === !1;
            if (t === 'NVCUMPLE' || t === 'NVNOCUMPLE') {
              if (!s.fecha_registro_nv || ce.includes(s.estado || '')) return !1;
              const u =
                  typeof s.fecha_registro_nv == 'string'
                    ? s.fecha_registro_nv.split('T')[0]
                    : new Date(s.fecha_registro_nv).toISOString().split('T')[0],
                m = x(new Date().toISOString().split('T')[0]);
              if (x(u) !== m) return !1;
              const S = O(s);
              if (!S) return !1;
              const D = new Date(S.fecha + 'T23:59:59').getTime();
              if (ie.includes(s.estado)) return t === 'NVNOCUMPLE' && Date.now() > D;
              const _ = s.fecha_shipping || s.fecha_en_ruta || s.fecha_entregado;
              if (!_) return !1;
              const v = new Date(_).getTime() <= D;
              return t === 'NVCUMPLE' ? v : !v;
            }
            return t === 'CANAL:PTM'
              ? !!s.nv_ptm
              : t === 'CANAL:ORANGE'
                ? !!s.nv_orange
                : t === 'CANAL:FARMAPACK'
                  ? !!s.nv_farmapack
                  : t === 'CANAL:VARIOS'
                    ? !!s.varios
                    : t === 'null' || t === 'SIN ESTADO'
                      ? !s.estado
                      : s.estado === t;
          })
          .map((s) => {
            let u = null;
            if (s.fecha_aprobacion && s.fecha_aprobacion_real) {
              const v = new Date(s.fecha_aprobacion),
                C = new Date(s.fecha_aprobacion_real);
              u = Math.round((C.getTime() - v.getTime()) / (1e3 * 60 * 60 * 24));
            }
            let m = null;
            const S = O(s),
              D = (S == null ? void 0 : S.fecha) || s.fecha_compromiso,
              _ = (S == null ? void 0 : S.diasAtraso) || 0;
            if (s.fecha_despacho && D) {
              const v = new Date(s.fecha_despacho),
                C = new Date(D);
              m = Math.round((v.getTime() - C.getTime()) / (1e3 * 60 * 60 * 24));
            }
            return {
              nv:
                (s.nv_ptm && String(s.nv_ptm)) || s.nv_orange || s.nv_farmapack || s.varios || '—',
              cliente: s.cliente || '—',
              vendedor: s.vendedor || '—',
              transportista: s.transportista || '—',
              division: s.division || '—',
              fecha_registro_nv: s.fecha_registro_nv || null,
              fecha_aprobacion: s.fecha_aprobacion || null,
              fecha_aprobacion_real: s.fecha_aprobacion_real || null,
              dif_aprobacion: u,
              fecha_despacho: s.fecha_despacho || null,
              fecha_compromiso: s.fecha_compromiso || null,
              fecha_promesa_efectiva: D || null,
              dias_atraso_ingreso: _,
              dias_entrega: m,
              tipo_despacho: s.tipo_despacho || null,
              reabierta: s.reabierta === !0,
              motivo_reapertura: s.motivo_reapertura || '',
              fecha_reapertura: s.fecha_reapertura || null
            };
          })
          .sort((s, u) => (u.fecha_aprobacion || '').localeCompare(s.fecha_aprobacion || ''))
      );
    },
    {
      payload: { estado: t, dateFrom: o || null, dateTo: n || null },
      slowMs: 1100,
      message: 'Detalle de operaciones por estado en dashboard'
    }
  );
}
async function lt() {
  return { operadores: [], total: 0 };
}
async function ft(t = 6) {
  const o = new Date();
  o.setMonth(o.getMonth() - t);
  const n = o.toISOString().split('T')[0],
    f = await Me(
      'estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_entregado,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,nv_ptm,nv_orange,nv_farmapack,varios',
      n
    );
  f.forEach((c) => {
    ((c.estado = z(c.estado)),
      c.fecha_compromiso ||
        (c.fecha_compromiso = V(c.fecha_aprobacion, c.fecha_aprobacion_real) || null));
  });
  const h = {},
    E = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return (
    f.forEach((c) => {
      const p = M(c);
      if (!p) return;
      const s = new Date(p),
        u = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}`;
      h[u] ||
        (h[u] = {
          label: `${E[s.getMonth()]} ${s.getFullYear()}`,
          entregadas: 0,
          aTiempo: 0,
          totalEval: 0,
          otifCumple: 0,
          otifTotal: 0,
          ltSum: 0,
          ltN: 0,
          activas: 0
        });
      const m = h[u];
      if ((R.includes(c.estado) && m.activas++, b.includes(c.estado))) {
        if ((m.entregadas++, c.fecha_despacho && c.fecha_compromiso)) {
          const _ = O(c);
          if (_) {
            const v = (new Date(c.fecha_despacho).getTime() - new Date(_.fecha).getTime()) / 864e5;
            Math.abs(v) <= 30 &&
              (m.totalEval++, v <= 0 && m.aTiempo++, m.otifTotal++, v <= 0 && m.otifCumple++);
          }
        }
        const S = c.fecha_entregado || c.fecha_despacho,
          D = Ce(M(c), S);
        D !== null && ((m.ltSum += D), m.ltN++);
      }
    }),
    Object.entries(h)
      .sort(([c], [p]) => c.localeCompare(p))
      .map(([, c]) => ({
        label: c.label,
        entregadas: c.entregadas,
        pctATiempo: c.totalEval > 0 ? +((c.aTiempo / c.totalEval) * 100).toFixed(0) : null,
        otif: c.otifTotal > 0 ? +((c.otifCumple / c.otifTotal) * 100).toFixed(0) : null,
        leadTime: c.ltN > 0 ? +(c.ltSum / c.ltN).toFixed(1) : null,
        activas: c.activas
      }))
  );
}
const Xe =
  'nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_estado';
async function dt(t = 25) {
  if (!k) return [];
  const { data: o, error: n } = await k
    .from(le)
    .select(Xe)
    .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
    .limit(t);
  return n || !o ? [] : o.map((l) => Qe(l));
}
function Qe(t) {
  const o = y(t.fecha_compromiso) || V(y(t.fecha_aprobacion), y(t.fecha_aprobacion_real));
  return {
    ...t,
    estado: z(t.estado) || t.estado,
    fecha_compromiso: o || null,
    nv: t.nv_ptm ? String(t.nv_ptm) : t.nv_orange || t.nv_farmapack || t.varios || '—',
    fecha_entrega: t.fecha_entregado,
    fecha_creacion: t.fecha_registro_nv
  };
}
async function ut(t, o = 'ptm', n = 60) {
  if (!k || !t) return [];
  const { data: l, error: f } = await k.rpc('nv_bitacora', {
    p_nv: String(t),
    p_canal: o ? String(o).toLowerCase() : null,
    p_limit: n
  });
  return f || !l
    ? []
    : l.map((h) => ({
        id: h.id,
        accion: h.accion,
        operador: h.operador || 'Sistema',
        campos: h.campos || '',
        estadoAnterior: h.estado_anterior,
        estadoNuevo: h.estado_nuevo,
        exito: h.exito !== !1,
        timestamp: h.ts
      }));
}
async function pt() {
  return (await fe(Xe + ',fecha_estado')).map((o) => Qe(o));
}
async function ht() {
  return j(
    'fetch_tv_estados',
    async () => {
      const t = 'default',
        o = Ie(se, t, Ua);
      if (o) return o;
      const l = (async () => {
        const f = await fe(
            'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_compromiso, fecha_estado, fecha_despacho, fecha_entregado, fecha_aprobacion, fecha_aprobacion_real, urgente'
          ),
          h = Date.now(),
          E = 1e3 * 60 * 60 * 24,
          c = (_) => (_ ? Math.floor((h - new Date(_ + 'T12:00:00').getTime()) / E) : null),
          p = {},
          s = [];
        let u = 0;
        const m = [r.ENTREGADO, r.RECIBIDO_CONFORME, r.RECIBIDO_OBS];
        f.forEach((_) => {
          const v = z(_.estado) || 'Sin estado';
          if (m.includes(v)) return;
          const C =
              (_.nv_ptm && String(_.nv_ptm)) || _.nv_orange || _.nv_farmapack || _.varios || '?',
            de = _.nv_ptm
              ? 'PTM'
              : _.nv_orange
                ? 'Orange'
                : _.nv_farmapack
                  ? 'Farmapack'
                  : 'Varios',
            J = _.urgente === !0 || String(_.urgente) === 'true',
            Y = y(_.fecha_estado),
            A = y(_.fecha_aprobacion),
            H = y(_.fecha_aprobacion_real),
            Z = H || A,
            ue = _.fecha_compromiso || V(_.fecha_aprobacion, _.fecha_aprobacion_real),
            W = {
              nv: C,
              canal: de,
              cliente: _.cliente || '—',
              vendedor: _.vendedor || '—',
              transportista: _.transportista || '—',
              fecha_compromiso: y(ue),
              fecha_estado: Y,
              fecha_despacho: y(_.fecha_despacho),
              fecha_entregado: y(_.fecha_entregado),
              fecha_aprobacion: A,
              fecha_aprobacion_real: H,
              fecha_aprob_efectiva: Z,
              diasEnEstado: c(Y),
              diasDesdeAprobacion: c(Z),
              urgente: J
            };
          (p[v] || (p[v] = []), p[v].push(W));
          const pe = [r.ENTREGADO, r.RECIBIDO_CONFORME, r.RECIBIDO_OBS].includes(v);
          (J && !pe && s.push(W), u++);
        });
        const D = R.filter((_) => {
          var v;
          return (((v = p[_]) == null ? void 0 : v.length) || 0) > 0;
        }).map((_) => ({
          estado: _,
          cantidad: p[_].length,
          nvs: p[_].sort((v, C) => (C.urgente ? 1 : 0) - (v.urgente ? 1 : 0))
        }));
        return Pe(se, t, { estados: D, total: u, urgentes: s });
      })().catch((f) => {
        throw (se.delete(t), f);
      });
      return ye(se, t, l);
    },
    {
      screen: 'PanelTV',
      payload: { source: 'tv_estados' },
      slowMs: 1200,
      message: 'Carga de estados para Modo TV'
    }
  );
}
export {
  st as E,
  ht as a,
  r as b,
  V as c,
  dt as d,
  ct as e,
  ut as f,
  lt as g,
  ft as h,
  pt as i,
  at as j,
  tt as k,
  et as l,
  nt as m,
  ot as n,
  rt as o,
  it as p,
  y as s
};
