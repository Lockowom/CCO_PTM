import { s as k, L as we } from './index-CJpoExlo.js';
function M(t, o = '') {
  return t ? (typeof t == 'string' && t.length >= 10 ? t.slice(0, 10) : String(t)) : o;
}
function et(t, o = '—') {
  if (!t) return o;
  const n = String(t).slice(0, 10),
    s = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  return s ? `${s[3]}-${s[2]}-${s[1]}` : String(t);
}
function at() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}
function tt(t, o) {
  const n = new Date(t + 'T12:00:00');
  n.setDate(n.getDate() + o);
  const s = n.getFullYear(),
    f = String(n.getMonth() + 1).padStart(2, '0'),
    h = String(n.getDate()).padStart(2, '0');
  return `${s}-${f}-${h}`;
}
function nt(t) {
  if (!t) return '245,124,0';
  const o = t.replace('#', ''),
    n = parseInt(o, 16);
  return isNaN(n) || o.length < 6 ? '245,124,0' : `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
const l = {
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
    'EN PROCESO': l.EN_PROCESO,
    'EN SHIPPING': l.SHIPPING,
    'EN RUTA': l.EN_RUTA,
    ENTREGADO: l.ENTREGADO,
    'RECIBIDO CONFORME': l.ENTREGADO,
    'RECIBIDO C/OBS': l.ENTREGADO,
    'Recibido Conforme': l.ENTREGADO,
    'Recibido C/OBS': l.ENTREGADO
  };
function ot(t) {
  return t ? Je[t] || t : '';
}
const st = {
  [l.EN_PROCESO]: '#f59e0b',
  [l.P_VENDEDOR]: '#d97706',
  [l.P_STOCK]: '#b45309',
  [l.P_RETIRO]: '#92400e',
  [l.SHIPPING]: '#8b5cf6',
  [l.CURRIER]: '#7c3aed',
  [l.EN_RUTA]: '#06b6d4',
  [l.ENTREGADO]: '#22c55e',
  [l.RECIBIDO_CONFORME]: '#16a34a',
  [l.RECIBIDO_OBS]: '#15803d'
};
function ka(t, o) {
  const n = new Date(t);
  let s = 0;
  const f = n.getDay();
  for (f === 0 ? n.setDate(n.getDate() + 1) : f === 6 && n.setDate(n.getDate() + 2); s < o;) {
    n.setDate(n.getDate() + 1);
    const h = n.getDay();
    h !== 0 && h !== 6 && s++;
  }
  return n;
}
function x(t, o) {
  const n = o || t;
  if (!n) return '';
  const s = new Date(n + 'T12:00:00');
  if (isNaN(s.getTime())) return '';
  const f = ka(s, 2),
    h = f.getFullYear(),
    E = String(f.getMonth() + 1).padStart(2, '0'),
    i = String(f.getDate()).padStart(2, '0');
  return `${h}-${E}-${i}`;
}
const le = 'tms_operaciones_vigentes',
  Fa = 60 * 1e3,
  $a = 45 * 1e3,
  La = 2 * 60 * 1e3,
  Ye = 'cco:panel-dashboard:',
  Ua = 15 * 1e3,
  xa = 10 * 1e3;
let y = { ts: 0, data: null, promise: null };
const K = new Map(),
  oe = new Map(),
  se = new Map();
function Ze(t, o) {
  return !!t && Object.prototype.hasOwnProperty.call(t, 'value') && Date.now() - t.ts < o;
}
function ye(t, o, n) {
  const s = t.get(o);
  return s ? (s.promise ? s.promise : Ze(s, n) ? s.value : (t.delete(o), null)) : null;
}
function Me(t, o, n) {
  return (t.set(o, { ts: Date.now(), value: n }), n);
}
function ke(t, o, n) {
  return (t.set(o, { ts: Date.now(), promise: n }), n);
}
function Ga(t) {
  if (typeof window > 'u' || !window.sessionStorage) return null;
  try {
    const o = window.sessionStorage.getItem(`${Ye}${t}`);
    if (!o) return null;
    const n = JSON.parse(o);
    return Ze(n, La) ? n.value : null;
  } catch {
    return null;
  }
}
function Va(t, o) {
  if (!(typeof window > 'u' || !window.sessionStorage))
    try {
      window.sessionStorage.setItem(`${Ye}${t}`, JSON.stringify({ ts: Date.now(), value: o }));
    } catch {}
}
function za(t) {
  const o = Number((t == null ? void 0 : t.status) || (t == null ? void 0 : t.statusCode) || 0);
  return (
    [408, 429, 500, 502, 503, 504].includes(o) ||
    /network|fetch|timeout|connection pool|temporar/i.test(
      String((t == null ? void 0 : t.message) || t || '')
    )
  );
}
async function qe(t, o = 3) {
  let n;
  for (let s = 0; s < o; s += 1)
    try {
      return await t();
    } catch (f) {
      if (((n = f), !za(f) || s === o - 1)) throw f;
      const h = 250 * 2 ** s + Math.floor(Math.random() * 100);
      (we.warn(f, {
        module: 'panel',
        screen: 'PanelDashboard',
        action: 'dashboard_retry',
        message: 'Reintento de carga del dashboard por error transitorio',
        attempt: s + 1,
        delayMs: h
      }),
        await new Promise((E) => setTimeout(E, h)));
    }
  throw n;
}
function je(t) {
  return Math.round(Math.max(0, performance.now() - t));
}
async function H(
  t,
  o,
  { screen: n = 'PanelDashboard', payload: s = null, slowMs: f = 1200, message: h = '' } = {}
) {
  const E = performance.now();
  try {
    const i = await o(),
      u = je(E);
    return (
      u >= f &&
        we.performance({
          module: 'panel',
          screen: n,
          action: t,
          message: h || `Operacion lenta del dashboard: ${t}`,
          durationMs: u,
          status: 'ok',
          payload: s
        }),
      i
    );
  } catch (i) {
    throw (
      we.error(i, {
        module: 'panel',
        screen: n,
        action: t,
        message: `Fallo operacion de dashboard: ${t}`,
        durationMs: je(E),
        status: 'error',
        payload: s
      }),
      i
    );
  }
}
function w(t) {
  return t.fecha_aprobacion_real || t.fecha_aprobacion || null;
}
function We(t, o, n) {
  if (!o || !n) return !0;
  const s = w(t);
  if (!s) return !1;
  const f = String(s).slice(0, 10);
  return f >= o && f <= n;
}
function Ie(t, o) {
  if (!t || !o) return null;
  const n = new Date(t).getTime(),
    s = new Date(o).getTime();
  if (isNaN(n) || isNaN(s)) return null;
  const f = (s - n) / (1e3 * 60 * 60 * 24);
  return f < 0 || f > 365 ? null : f;
}
function Ha(t) {
  const n = [
    { nombre: 'En Proceso → Shipping', from: (u) => w(u), to: (u) => u.fecha_shipping },
    { nombre: 'Shipping → En Ruta', from: (u) => u.fecha_shipping, to: (u) => u.fecha_en_ruta },
    { nombre: 'En Ruta → Entregado', from: (u) => u.fecha_en_ruta, to: (u) => u.fecha_entregado }
  ].map((u) => {
    let c = 0,
      p = 0;
    return (
      t.forEach((m) => {
        const S = Ie(u.from(m), u.to(m));
        S !== null && ((c += S), p++);
      }),
      { nombre: u.nombre, dias: p > 0 ? +(c / p).toFixed(1) : null, n: p }
    );
  });
  let s = 0,
    f = 0;
  t.forEach((u) => {
    const c = u.fecha_entregado || u.fecha_despacho,
      p = Ie(w(u), c);
    p !== null && ((s += p), f++);
  });
  const h = f > 0 ? +(s / f).toFixed(1) : null,
    E = n.filter((u) => u.dias !== null),
    i = E.length > 0 ? E.reduce((u, c) => (c.dias > u.dias ? c : u)) : null;
  return {
    etapas: n,
    leadTimeTotal: h,
    leadTimeTotalN: f,
    cuelloBotella: i ? { nombre: i.nombre, dias: i.dias } : null
  };
}
const ce = ['NULA', 'REFACTURADO', 'RECHAZADO'];
function G(t) {
  return t && (Je[t] || t);
}
const Xe = [l.P_VENDEDOR, l.P_STOCK, l.P_RETIRO],
  ie = [l.EN_PROCESO, ...Xe],
  O = [l.EN_PROCESO, ...Xe, l.SHIPPING, l.CURRIER, l.EN_RUTA],
  Ba = [l.CURRIER, l.EN_RUTA, l.ENTREGADO],
  R = [l.ENTREGADO],
  j = [
    l.EN_PROCESO,
    l.P_VENDEDOR,
    l.P_STOCK,
    l.P_RETIRO,
    l.SHIPPING,
    l.CURRIER,
    l.EN_RUTA,
    l.ENTREGADO
  ],
  Ka = [...j, 'NULA', 'REFACTURADO', 'RECHAZADO'];
function ja(t) {
  return t.fecha_shipping || t.fecha_en_ruta || t.fecha_entregado || t.fecha_despacho || null;
}
function b(t) {
  const o = t.fecha_compromiso || x(t.fecha_aprobacion, t.fecha_aprobacion_real);
  if (!o) return null;
  const n = w(t);
  if (!n) return { fecha: o, diasAtraso: 0 };
  const s = new Date(o).getTime(),
    f = new Date(n).getTime();
  if (f > s) {
    const h = Math.round((f - s) / 864e5);
    return { fecha: n.split('T')[0], diasAtraso: h };
  }
  return { fecha: o, diasAtraso: 0 };
}
function re(t, o) {
  if (ce.includes(t.estado || '')) return null;
  const n = b(t);
  if (!n) return null;
  const s = new Date(n.fecha + 'T23:59:59').getTime();
  if (ie.includes(t.estado || '')) return o > s ? !1 : null;
  const f = ja(t);
  return f ? new Date(f).getTime() <= s : null;
}
function z(t) {
  const o = new Date(t + 'T12:00:00');
  if (isNaN(o.getTime())) return '';
  const n = o.getDay(),
    s = o.getDate() - n + (n === 0 ? -6 : 1),
    f = new Date(o.getFullYear(), o.getMonth(), s);
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
const Pe =
  'nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,division,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_en_proceso,incidencia,estado_incidencia,observaciones_incidencia,dias_incidencia,guia,factura,urgente,reabierta,motivo_reapertura,fecha_reapertura';
async function fe(t, o, n) {
  const s = [];
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
    const { data: i, error: u } = await E;
    if (u) throw u;
    if (!i || i.length === 0 || (s.push(...i), i.length < h)) break;
    f += h;
  }
  return s;
}
const Za = [
  l.EN_PROCESO,
  'EN PROCESO',
  l.P_VENDEDOR,
  l.P_STOCK,
  l.P_RETIRO,
  l.SHIPPING,
  'SHIPPING',
  'EN SHIPPING',
  l.CURRIER,
  'CURRIER',
  l.EN_RUTA,
  'EN RUTA'
];
function qa(t) {
  const o = t.nv_ptm ? 'ptm' : t.nv_orange ? 'orange' : t.nv_farmapack ? 'farmapack' : 'varios',
    n = t.nv_ptm ? String(t.nv_ptm) : t.nv_orange || t.nv_farmapack || t.varios || '';
  return `${o}:${n}`;
}
async function de(t) {
  const o = [];
  let n = 0;
  const s = 1e3;
  for (;;) {
    const { data: f, error: h } = await k
      .from(le)
      .select(t)
      .in('estado', Za)
      .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
      .order('id', { ascending: !1 })
      .range(n, n + s - 1);
    if (h) throw h;
    if (!f || f.length === 0 || (o.push(...f), f.length < s)) break;
    n += s;
  }
  return o;
}
async function Wa() {
  return H(
    'fetch_consolidado_keys',
    async () => {
      const t = Date.now();
      if (y.data && t - y.ts < Fa) return y.data;
      if (y.promise) return y.promise;
      const o = async () => {
        const { data: n, error: s } = await k.from('consolidado_nvs').select('nv, canal'),
          f = s ? new Set() : new Set((n || []).map((h) => `${h.canal || 'ptm'}:${h.nv}`));
        return ((y = { ts: Date.now(), data: f, promise: null }), f);
      };
      return (
        (y.promise = o().catch((n) => {
          throw ((y.promise = null), n);
        })),
        y.promise
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
  return H(
    'fetch_dashboard_data',
    async () => {
      const n = `${t || ''}:${o || ''}`,
        s = ye(K, n, $a);
      if (s) return s;
      const f = Ga(n);
      if (f) return (K.set(n, { ts: Date.now(), value: f }), f);
      const E = qe(async () => {
        const [i, u, c] = await Promise.all([fe(Pe, t, o), de(Pe), Wa()]),
          p = (e) => {
            ((e.estado = G(e.estado)),
              (e._consolidado = c.has(qa(e))),
              e.fecha_compromiso ||
                (e.fecha_compromiso = x(e.fecha_aprobacion, e.fecha_aprobacion_real) || null));
          };
        (u.forEach(p), i.forEach(p));
        const m = u,
          S = m.filter((e) => We(e, t, o)),
          D = i.filter((e) => !e._consolidado),
          _ = m.filter((e) => !e._consolidado),
          v = i.length,
          I = i.filter((e) => e.nv_ptm).length,
          pe = i.filter((e) => e.nv_orange).length,
          J = i.filter((e) => e.nv_farmapack).length,
          Y = i.filter((e) => e.varios).length,
          A = {};
        (i.forEach((e) => {
          const a = e.estado || 'null';
          A[a] = (A[a] || 0) + 1;
        }),
          O.forEach((e) => {
            A[e] = 0;
          }),
          S.forEach((e) => {
            const a = e.estado || 'null';
            A[a] = (A[a] || 0) + 1;
          }));
        const B = i.filter((e) => R.includes(e.estado)).length,
          Z = A.NULA || 0,
          ue = A.REFACTURADO || 0,
          q = A.RECHAZADO || 0,
          he = m.length,
          Fe = v - Z - ue - q,
          aa = Fe > 0 ? ((B / Fe) * 100).toFixed(1) : '0',
          ta = D.filter((e) => R.includes(e.estado) && e.fecha_despacho && e.fecha_compromiso);
        let $e = 0,
          W = 0,
          _e = 0;
        ta.forEach((e) => {
          const a = b(e);
          if (!a) return;
          const r = new Date(e.fecha_despacho),
            d = new Date(a.fecha),
            g = (r.getTime() - d.getTime()) / (1e3 * 60 * 60 * 24);
          Math.abs(g) > 30 || (g > 0 ? (($e += g), W++) : _e++);
        });
        const na = W > 0 ? ($e / W).toFixed(1) : '0',
          Le = W + _e,
          oa = Le > 0 ? ((_e / Le) * 100).toFixed(0) : '0',
          sa = (e) => {
            const a = String((e == null ? void 0 : e.incidencia) || '').trim(),
              r = String((e == null ? void 0 : e.estado_incidencia) || '')
                .trim()
                .toUpperCase();
            return a.length > 0 && r !== 'RESUELTA';
          },
          Ue = D.filter(sa),
          ca = Ue.length,
          xe = Date.now();
        let X = 0,
          me = 0;
        D.forEach((e) => {
          const a = re(e, xe);
          a === !0 ? X++ : a === !1 && me++;
        });
        const ge = X + me,
          ia = {
            pct: ge > 0 ? ((X / ge) * 100).toFixed(1) : null,
            cumple: X,
            noCumple: me,
            evaluables: ge
          },
          ra = new Date().toISOString().split('T')[0],
          la = z(ra),
          fa = Date.now(),
          Ge = D.filter((e) => {
            if (!e.fecha_registro_nv || ce.includes(e.estado || '')) return !1;
            const a =
              typeof e.fecha_registro_nv == 'string'
                ? e.fecha_registro_nv.split('T')[0]
                : new Date(e.fecha_registro_nv).toISOString().split('T')[0];
            return z(a) === la;
          });
        let Q = 0,
          ee = 0;
        Ge.forEach((e) => {
          const a = b(e);
          if (!a) return;
          const r = new Date(a.fecha + 'T23:59:59').getTime();
          if (ie.includes(e.estado)) fa > r && ee++;
          else {
            const d = e.fecha_shipping || e.fecha_en_ruta || e.fecha_entregado;
            d && (new Date(d).getTime() <= r ? Q++ : ee++);
          }
        });
        const Ee = Q + ee,
          da = {
            pct: Ee > 0 ? ((Q / Ee) * 100).toFixed(1) : null,
            cumple: Q,
            noCumple: ee,
            evaluables: Ee,
            totalSemana: Ge.length
          },
          pa = {
            total: v,
            countNvPtm: I,
            nvVarios: Y,
            nvOrange: pe,
            nvFarmapack: J,
            estadoCounts: A,
            entregadas: B,
            activas: he,
            tasaEntrega: aa,
            leadTimeTardanza: na,
            pctAtiempo: oa,
            incidencias: ca,
            fillRateShipping: ia,
            cumplimientoNV: da
          },
          F = {},
          Ve = (e) => {
            const a = e.estado || 'null';
            (F[a] || (F[a] = { farmapack: 0, orange: 0, ptm: 0, varios: 0, total: 0 }),
              e.nv_farmapack && F[a].farmapack++,
              e.nv_orange && F[a].orange++,
              e.nv_ptm && F[a].ptm++,
              e.varios && F[a].varios++,
              F[a].total++);
          };
        (i.forEach((e) => {
          O.includes(e.estado || '') || Ve(e);
        }),
          S.forEach((e) => {
            O.includes(e.estado || '') && Ve(e);
          }));
        const ua = Object.entries(F)
            .map(([e, a]) => ({ estado: e, ...a }))
            .filter((e) => j.includes(e.estado))
            .sort((e, a) => j.indexOf(e.estado) - j.indexOf(a.estado)),
          ve = {};
        i.forEach((e) => {
          const a = e.division || 'SIN DIVISIÓN';
          ve[a] = (ve[a] || 0) + 1;
        });
        const ha = Object.entries(ve)
            .map(([e, a]) => ({ division: e, cantidad: a }))
            .sort((e, a) => a.cantidad - e.cantidad),
          Se = {};
        i.forEach((e) => {
          const a = e.transportista || 'SIN TRANSPORTISTA';
          Se[a] = (Se[a] || 0) + 1;
        });
        const _a = Object.entries(Se)
            .map(([e, a]) => ({ transportista: e, cantidad: a }))
            .sort((e, a) => a.cantidad - e.cantidad),
          $ = {};
        D.forEach((e) => {
          const a = w(e);
          if (!a) return;
          const r = z(a);
          if (!r) return;
          ($[r] ||
            ($[r] = { aprobadas: 0, entregadas: 0, tardanza: [], fillrateOk: 0, fillrateTotal: 0 }),
            $[r].aprobadas++,
            R.includes(e.estado) && $[r].entregadas++);
          const d = re(e, xe);
          if ((d !== null && ($[r].fillrateTotal++, d && $[r].fillrateOk++), e.fecha_despacho)) {
            const g = b(e);
            if (g) {
              const N = new Date(e.fecha_despacho),
                T = new Date(g.fecha),
                C = (N.getTime() - T.getTime()) / (1e3 * 60 * 60 * 24);
              C > 0 && C <= 30 && $[r].tardanza.push(C);
            }
          }
        });
        const ma = Object.entries($)
            .sort(([e], [a]) => e.localeCompare(a))
            .map(([e, a]) => {
              const r = new Date(e + 'T12:00:00'),
                d = r.getDate(),
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
                N = `${String(d).padStart(2, '0')}-${g[r.getMonth()]}`,
                T =
                  a.tardanza.length > 0
                    ? +(a.tardanza.reduce((ne, Ma) => ne + Ma, 0) / a.tardanza.length).toFixed(1)
                    : 0,
                C = a.fillrateTotal > 0 ? +((a.fillrateOk / a.fillrateTotal) * 100).toFixed(1) : 0;
              return {
                semana: N,
                entregadas: a.entregadas,
                aprobadas: a.aprobadas,
                tardanza: T,
                fillRate: C
              };
            }),
          De = {};
        S.forEach((e) => {
          O.includes(e.estado || '') && (De[e.estado] = (De[e.estado] || 0) + 1);
        });
        const ga = Object.entries(De)
            .map(([e, a]) => ({ estado: e, count: a }))
            .sort((e, a) => a.count - e.count),
          V = {};
        D.forEach((e) => {
          if (!R.includes(e.estado) || !e.fecha_despacho || !e.fecha_compromiso) return;
          const a = w(e);
          if (!a) return;
          const r = z(a);
          if (!r) return;
          V[r] || (V[r] = { tardanzaSum: 0, tardanzaCount: 0, atiempoCount: 0 });
          const d = b(e);
          if (!d) return;
          const g = new Date(e.fecha_despacho),
            N = new Date(d.fecha),
            T = (g.getTime() - N.getTime()) / (1e3 * 60 * 60 * 24);
          Math.abs(T) > 30 ||
            (T > 0 ? ((V[r].tardanzaSum += T), V[r].tardanzaCount++) : V[r].atiempoCount++);
        });
        const Ea = Object.entries(V)
            .sort(([e], [a]) => e.localeCompare(a))
            .map(([e, a]) => {
              const r = new Date(e + 'T12:00:00'),
                d = Math.ceil(
                  ((r.getTime() - new Date(r.getFullYear(), 0, 1).getTime()) / 864e5 + 1) / 7
                ),
                g = a.tardanzaCount + a.atiempoCount;
              return {
                semana: `Semana ${d}`,
                dias: a.tardanzaCount > 0 ? +(a.tardanzaSum / a.tardanzaCount).toFixed(1) : 0,
                count: g,
                pctAtiempo: g > 0 ? +((a.atiempoCount / g) * 100).toFixed(0) : 0
              };
            }),
          va = O,
          ze = new Date();
        ze.setHours(0, 0, 0, 0);
        const Sa = ze.getTime(),
          Da = 1e3 * 60 * 60 * 24;
        let Te = 0,
          be = 0,
          Oe = 0;
        const Re = [];
        (_.forEach((e) => {
          if (!va.includes(e.estado || '')) return;
          const a = b(e);
          if (!a) return;
          const r = new Date(a.fecha + 'T12:00:00');
          r.setHours(0, 0, 0, 0);
          const d = Math.round((r.getTime() - Sa) / Da);
          d > 1 ||
            (d < 0 ? Te++ : d === 0 ? be++ : d === 1 && Oe++,
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
        const Ta = { vencidos: Te, hoy: be, manana: Oe, total: Te + be + Oe, detalle: Re },
          Ae = {},
          P = (e) => {
            Ae[e] = (Ae[e] || 0) + 1;
          },
          ae = [];
        (i.forEach((e) => {
          const a = [],
            r = String(e.estado || '').trim(),
            d = ce.includes(r);
          r
            ? Ka.includes(r) || (a.push(`Estado no reconocido: "${r}"`), P('Estado no reconocido'))
            : (a.push('Sin estado'), P('Sin estado'));
          const g = R.includes(r);
          if (!d && !g) {
            (e.cliente || (a.push('Sin cliente'), P('Sin cliente')),
              e.vendedor || (a.push('Sin vendedor'), P('Sin vendedor')),
              e.division || (a.push('Sin división'), P('Sin división')),
              Ba.includes(r) &&
                !e.transportista &&
                (a.push('Sin transportista'), P('Sin transportista')));
            const N = e.fecha_compromiso || x(e.fecha_aprobacion, e.fecha_aprobacion_real);
            O.includes(r) && !N && (a.push('Sin fecha compromiso'), P('Sin fecha compromiso'));
            const T = w(e);
            (T &&
              e.fecha_despacho &&
              new Date(e.fecha_despacho).getTime() < new Date(T).getTime() &&
              (a.push('Despacho anterior a la aprobación'), P('Fecha incoherente')),
              e.fecha_entregado &&
                e.fecha_despacho &&
                new Date(e.fecha_entregado).getTime() < new Date(e.fecha_despacho).getTime() &&
                (a.push('Entrega anterior al despacho'), P('Fecha incoherente')));
          }
          a.length > 0 &&
            ae.push({
              nv:
                (e.nv_ptm && String(e.nv_ptm)) || e.nv_orange || e.nv_farmapack || e.varios || '—',
              cliente: e.cliente || '—',
              estado: r || '—',
              division: e.division || '—',
              vendedor: e.vendedor || '—',
              problemas: a
            });
        }),
          ae.sort((e, a) => a.problemas.length - e.problemas.length));
        const ba = { total: ae.length, porTipo: Ae, detalle: ae };
        let Ne = 0,
          te = 0;
        D.forEach((e) => {
          if (!R.includes(e.estado) || !e.fecha_despacho || !e.fecha_compromiso) return;
          const a = b(e);
          if (!a) return;
          te++;
          const r = new Date(e.fecha_despacho),
            d = new Date(a.fecha);
          r.getTime() <= d.getTime() && !0 && Ne++;
        });
        const Oa = { pct: te > 0 ? +((Ne / te) * 100).toFixed(1) : null, cumple: Ne, total: te },
          L = {};
        D.forEach((e) => {
          const a = (e.transportista || '').trim();
          if (
            !(!a || a === 'SIN TRANSPORTISTA') &&
            (L[a] || (L[a] = { total: 0, entregadas: 0, aTiempo: 0, tardanzaSum: 0, tardanzaN: 0 }),
            L[a].total++,
            R.includes(e.estado) && (L[a].entregadas++, e.fecha_despacho && e.fecha_compromiso))
          ) {
            const r = b(e);
            if (r) {
              const d =
                (new Date(e.fecha_despacho).getTime() - new Date(r.fecha).getTime()) / 864e5;
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
            R.includes(e.estado) && U[a].entregadas++,
            O.includes(e.estado) && U[a].activas++,
            e.reabierta === !0 && U[a].reabiertas++,
            R.includes(e.estado) && e.fecha_despacho && e.fecha_compromiso)
          ) {
            const r = b(e);
            if (r) {
              const d =
                (new Date(e.fecha_despacho).getTime() - new Date(r.fecha).getTime()) / 864e5;
              d <= 0 && Math.abs(d) <= 30 && U[a].aTiempo++;
            }
          }
        });
        const He = Object.entries(
            Ue.reduce((e, a) => {
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
                C = Ja(T);
              (C > 48 && (g.fuera48h += 1), C > g.maxHoras && (g.maxHoras = C));
              const ne = Number(a.dias_incidencia) || Math.max(0, Math.floor(C / 24));
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
                  ((a = Object.entries(e.tipos).sort((r, d) => d[1] - r[1])[0]) == null
                    ? void 0
                    : a[0]) || '—'
              };
            })
            .sort((e, a) => a.fuera48h - e.fuera48h || a.total - e.total || a.maxDias - e.maxDias)
            .slice(0, 12),
          Aa = He.reduce((e, a) => ((e[a.vendedor] = a), e), {}),
          Na = Object.entries(U)
            .map(([e, a]) => {
              const r = Aa[e];
              return {
                nombre: e,
                total: a.total,
                entregadas: a.entregadas,
                activas: a.activas,
                reabiertas: a.reabiertas,
                pctATiempo:
                  a.entregadas > 0 ? +((a.aTiempo / a.entregadas) * 100).toFixed(0) : null,
                erroresActivos: (r == null ? void 0 : r.total) || 0,
                errores48h: (r == null ? void 0 : r.fuera48h) || 0,
                errorPrincipal: (r == null ? void 0 : r.topTipo) || '—'
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
          Ca = {
            [l.EN_PROCESO]: 3,
            [l.P_VENDEDOR]: 3,
            [l.P_STOCK]: 3,
            [l.P_RETIRO]: 3,
            [l.SHIPPING]: 2,
            [l.CURRIER]: 2,
            [l.EN_RUTA]: 3,
            [l.ENTREGADO]: 5
          },
          Be = [],
          wa = Date.now();
        O.forEach((e) => {
          const a = Ca[e] || 5,
            r = [];
          (u.forEach((d) => {
            if (d.estado !== e || d._consolidado) return;
            const g = d.fecha_estado || d.fecha_registro_nv;
            if (!g) return;
            if ((wa - new Date(g).getTime()) / (1e3 * 60 * 60 * 24) > a) {
              const T =
                (d.nv_ptm && String(d.nv_ptm)) || d.nv_orange || d.nv_farmapack || d.varios || '?';
              r.push(T);
            }
          }),
            r.length > 0 && Be.push({ estado: e, cantidad: r.length, nvs: r.slice(0, 5) }));
        });
        const Ia = Be,
          Pa = [
            {
              etapa: l.EN_PROCESO,
              incluye: [...ie, l.SHIPPING, l.CURRIER, l.EN_RUTA, l.ENTREGADO]
            },
            { etapa: l.SHIPPING, incluye: [l.SHIPPING, l.CURRIER, l.EN_RUTA, l.ENTREGADO] },
            { etapa: l.EN_RUTA, incluye: [l.EN_RUTA, l.ENTREGADO] },
            { etapa: l.ENTREGADO, incluye: [l.ENTREGADO] }
          ].map(({ etapa: e, incluye: a }) => {
            let r = 0;
            return (
              i.forEach((d) => {
                a.includes(d.estado || '') && r++;
              }),
              S.forEach((d) => {
                O.includes(d.estado || '') && a.includes(d.estado || '') && r++;
              }),
              { etapa: e, cantidad: r }
            );
          }),
          Ce = {};
        i.forEach((e) => {
          const a = e.estado || 'Sin estado';
          if (!j.includes(a)) return;
          const r = (e.transportista || '').trim() || 'Sin transportista',
            d = `${a}|||${r}`;
          Ce[d] = (Ce[d] || 0) + 1;
        });
        const ya = Object.entries(Ce)
            .map(([e, a]) => {
              const [r, d] = e.split('|||');
              return { estado: r, transportista: d, cantidad: a };
            })
            .sort((e, a) => a.cantidad - e.cantidad),
          Ke = {
            kpis: pa,
            estadoTable: ua,
            divisions: ha,
            transportistas: _a,
            weeklyTrend: ma,
            estadoResumen: ga,
            leadTimeSemanal: Ea,
            alertas: Ta,
            calidad: ba,
            tiemposCiclo: Ha(D),
            otif: Oa,
            rankingTransportistas: Ra,
            rankingVendedores: Na,
            incidenciasPorVendedor: He,
            alertasOperacionales: Ia,
            funnelEstados: Pa,
            heatmapData: ya
          };
        return (Va(n, Ke), Me(K, n, Ke));
      }).catch((i) => {
        throw (K.delete(n), i);
      });
      return ke(K, n, E);
    },
    {
      payload: { dateFrom: t || null, dateTo: o || null },
      slowMs: 1800,
      message: 'Carga principal de datos del dashboard del Panel'
    }
  );
}
async function it(t, o) {
  return H(
    'fetch_dashboard_export_rows',
    async () =>
      (await qe(() => fe(Pe, t, o)))
        .map((s) => ({
          nv: (s.nv_ptm && String(s.nv_ptm)) || s.nv_orange || s.nv_farmapack || s.varios || '—',
          canal: s.nv_ptm
            ? 'PTM'
            : s.nv_orange
              ? 'Orange'
              : s.nv_farmapack
                ? 'Farmapack'
                : 'Varios',
          cliente: s.cliente || '—',
          vendedor: s.vendedor || '—',
          transportista: s.transportista || '—',
          estado: G(s.estado) || 'Sin estado',
          division: s.division || '—',
          tipo_despacho: s.tipo_despacho || '—',
          fecha_registro_nv: s.fecha_registro_nv || null,
          fecha_aprobacion: w(s),
          fecha_compromiso:
            s.fecha_compromiso || x(s.fecha_aprobacion, s.fecha_aprobacion_real) || null,
          fecha_shipping: s.fecha_shipping || null,
          fecha_en_ruta: s.fecha_en_ruta || null,
          fecha_despacho: s.fecha_despacho || null,
          fecha_entregado: s.fecha_entregado || null,
          guia: s.guia || '—',
          factura: s.factura || '—',
          urgente: s.urgente === !0 || String(s.urgente) === 'true',
          reabierta: s.reabierta === !0,
          motivo_reapertura: s.motivo_reapertura || '',
          fecha_reapertura: s.fecha_reapertura || null,
          incidencia: s.incidencia || '',
          estado_incidencia: s.estado_incidencia || '',
          observaciones_incidencia: s.observaciones_incidencia || ''
        }))
        .sort((s, f) =>
          String(f.fecha_aprobacion || '').localeCompare(String(s.fecha_aprobacion || ''))
        ),
    {
      payload: { dateFrom: t || null, dateTo: o || null },
      slowMs: 1600,
      message: 'Carga de detalle para exportación PDF del dashboard'
    }
  );
}
async function rt(t, o) {
  return H(
    'get_incidencias_activas',
    async () => {
      const n = `${t || ''}:${o || ''}`,
        s = ye(oe, n, Ua);
      if (s) return s;
      const h = (async () => {
        const E =
          'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, incidencia, estado_incidencia, observaciones_incidencia, dias_incidencia, fecha_aprobacion, fecha_aprobacion_real';
        if (!k) return [];
        const i = [];
        let u = 0;
        const c = 1e3;
        for (;;) {
          let p = k
            .from(le)
            .select(E)
            .not('incidencia', 'is', null)
            .neq('estado_incidencia', 'RESUELTA')
            .order('id', { ascending: !0 })
            .range(u, u + c - 1);
          (t &&
            (p = p.or(
              `fecha_aprobacion_real.gte.${t},and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${t})`
            )),
            o &&
              (p = p.or(
                `fecha_aprobacion_real.lte.${o},and(fecha_aprobacion_real.is.null,fecha_aprobacion.lte.${o})`
              )));
          const { data: m, error: S } = await p;
          if (S || !m || m.length === 0 || (i.push(...m), m.length < c)) break;
          u += c;
        }
        return Me(
          oe,
          n,
          i
            .map((p) => ({
              nv:
                (p.nv_ptm && String(p.nv_ptm)) || p.nv_orange || p.nv_farmapack || p.varios || '—',
              fecha: p.fecha_aprobacion_real || p.fecha_aprobacion || null,
              cliente: p.cliente || '—',
              vendedor: p.vendedor || '—',
              transportista: p.transportista || '—',
              estado: G(p.estado) || '—',
              incidencia: p.incidencia || '—',
              estado_incidencia: p.estado_incidencia || '—',
              observaciones: p.observaciones_incidencia || '—',
              dias: p.dias_incidencia || 0
            }))
            .sort((p, m) => m.dias - p.dias)
        );
      })().catch((E) => {
        throw (oe.delete(n), E);
      });
      return ke(oe, n, h);
    },
    {
      payload: { dateFrom: t || null, dateTo: o || null },
      slowMs: 900,
      message: 'Carga de incidencias activas del dashboard'
    }
  );
}
async function lt(t, o, n) {
  return H(
    'get_operaciones_por_estado',
    async () => {
      const s =
          'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_despacho, fecha_compromiso, division, fecha_aprobacion, fecha_aprobacion_real, fecha_registro_nv, fecha_shipping, fecha_en_ruta, fecha_entregado, tipo_despacho, fecha_estado, reabierta, motivo_reapertura, fecha_reapertura',
        f = t === 'ACTIVAS',
        h = f || O.includes(t),
        E = h ? await de(s) : await fe(s, o, n),
        i = h && !f ? E.filter((c) => We(c, o, n)) : E;
      return (
        i.forEach((c) => {
          c.estado = G(c.estado);
        }),
        i
          .filter((c) => {
            if (t === 'ACTIVAS') return O.includes(c.estado || '');
            if (t === 'TARDIAS') {
              if (!R.includes(c.estado) || !c.fecha_despacho || !c.fecha_compromiso) return !1;
              const p = b(c);
              if (!p) return !1;
              const m =
                (new Date(c.fecha_despacho).getTime() - new Date(p.fecha).getTime()) /
                (1e3 * 60 * 60 * 24);
              return m > 0 && Math.abs(m) <= 30;
            }
            if (t === 'ATIEMPO') {
              if (!R.includes(c.estado) || !c.fecha_despacho || !c.fecha_compromiso) return !1;
              const p = b(c);
              if (!p) return !1;
              const m =
                (new Date(c.fecha_despacho).getTime() - new Date(p.fecha).getTime()) /
                (1e3 * 60 * 60 * 24);
              return m <= 0 && Math.abs(m) <= 30;
            }
            if (t === 'ENTREGADAS') return R.includes(c.estado);
            if (t === 'FILLRATE_CUMPLE') return re(c, Date.now()) === !0;
            if (t === 'FILLRATE_NOCUMPLE') return re(c, Date.now()) === !1;
            if (t === 'NVCUMPLE' || t === 'NVNOCUMPLE') {
              if (!c.fecha_registro_nv || ce.includes(c.estado || '')) return !1;
              const p =
                  typeof c.fecha_registro_nv == 'string'
                    ? c.fecha_registro_nv.split('T')[0]
                    : new Date(c.fecha_registro_nv).toISOString().split('T')[0],
                m = z(new Date().toISOString().split('T')[0]);
              if (z(p) !== m) return !1;
              const S = b(c);
              if (!S) return !1;
              const D = new Date(S.fecha + 'T23:59:59').getTime();
              if (ie.includes(c.estado)) return t === 'NVNOCUMPLE' && Date.now() > D;
              const _ = c.fecha_shipping || c.fecha_en_ruta || c.fecha_entregado;
              if (!_) return !1;
              const v = new Date(_).getTime() <= D;
              return t === 'NVCUMPLE' ? v : !v;
            }
            return t === 'CANAL:PTM'
              ? !!c.nv_ptm
              : t === 'CANAL:ORANGE'
                ? !!c.nv_orange
                : t === 'CANAL:FARMAPACK'
                  ? !!c.nv_farmapack
                  : t === 'CANAL:VARIOS'
                    ? !!c.varios
                    : t === 'null' || t === 'SIN ESTADO'
                      ? !c.estado
                      : c.estado === t;
          })
          .map((c) => {
            let p = null;
            if (c.fecha_aprobacion && c.fecha_aprobacion_real) {
              const v = new Date(c.fecha_aprobacion),
                I = new Date(c.fecha_aprobacion_real);
              p = Math.round((I.getTime() - v.getTime()) / (1e3 * 60 * 60 * 24));
            }
            let m = null;
            const S = b(c),
              D = (S == null ? void 0 : S.fecha) || c.fecha_compromiso,
              _ = (S == null ? void 0 : S.diasAtraso) || 0;
            if (c.fecha_despacho && D) {
              const v = new Date(c.fecha_despacho),
                I = new Date(D);
              m = Math.round((v.getTime() - I.getTime()) / (1e3 * 60 * 60 * 24));
            }
            return {
              nv:
                (c.nv_ptm && String(c.nv_ptm)) || c.nv_orange || c.nv_farmapack || c.varios || '—',
              cliente: c.cliente || '—',
              vendedor: c.vendedor || '—',
              transportista: c.transportista || '—',
              division: c.division || '—',
              fecha_registro_nv: c.fecha_registro_nv || null,
              fecha_aprobacion: c.fecha_aprobacion || null,
              fecha_aprobacion_real: c.fecha_aprobacion_real || null,
              dif_aprobacion: p,
              fecha_despacho: c.fecha_despacho || null,
              fecha_compromiso: c.fecha_compromiso || null,
              fecha_promesa_efectiva: D || null,
              dias_atraso_ingreso: _,
              dias_entrega: m,
              tipo_despacho: c.tipo_despacho || null,
              reabierta: c.reabierta === !0,
              motivo_reapertura: c.motivo_reapertura || '',
              fecha_reapertura: c.fecha_reapertura || null
            };
          })
          .sort((c, p) => (p.fecha_aprobacion || '').localeCompare(c.fecha_aprobacion || ''))
      );
    },
    {
      payload: { estado: t, dateFrom: o || null, dateTo: n || null },
      slowMs: 1100,
      message: 'Detalle de operaciones por estado en dashboard'
    }
  );
}
async function ft() {
  return { operadores: [], total: 0 };
}
async function dt(t = 6) {
  const o = new Date();
  o.setMonth(o.getMonth() - t);
  const n = o.toISOString().split('T')[0],
    f = await fe(
      'estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_entregado,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,nv_ptm,nv_orange,nv_farmapack,varios',
      n
    );
  f.forEach((i) => {
    ((i.estado = G(i.estado)),
      i.fecha_compromiso ||
        (i.fecha_compromiso = x(i.fecha_aprobacion, i.fecha_aprobacion_real) || null));
  });
  const h = {},
    E = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return (
    f.forEach((i) => {
      const u = w(i);
      if (!u) return;
      const c = new Date(u),
        p = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}`;
      h[p] ||
        (h[p] = {
          label: `${E[c.getMonth()]} ${c.getFullYear()}`,
          entregadas: 0,
          aTiempo: 0,
          totalEval: 0,
          otifCumple: 0,
          otifTotal: 0,
          ltSum: 0,
          ltN: 0,
          activas: 0
        });
      const m = h[p];
      if ((O.includes(i.estado) && m.activas++, R.includes(i.estado))) {
        if ((m.entregadas++, i.fecha_despacho && i.fecha_compromiso)) {
          const _ = b(i);
          if (_) {
            const v = (new Date(i.fecha_despacho).getTime() - new Date(_.fecha).getTime()) / 864e5;
            Math.abs(v) <= 30 &&
              (m.totalEval++, v <= 0 && m.aTiempo++, m.otifTotal++, v <= 0 && m.otifCumple++);
          }
        }
        const S = i.fecha_entregado || i.fecha_despacho,
          D = Ie(w(i), S);
        D !== null && ((m.ltSum += D), m.ltN++);
      }
    }),
    Object.entries(h)
      .sort(([i], [u]) => i.localeCompare(u))
      .map(([, i]) => ({
        label: i.label,
        entregadas: i.entregadas,
        pctATiempo: i.totalEval > 0 ? +((i.aTiempo / i.totalEval) * 100).toFixed(0) : null,
        otif: i.otifTotal > 0 ? +((i.otifCumple / i.otifTotal) * 100).toFixed(0) : null,
        leadTime: i.ltN > 0 ? +(i.ltSum / i.ltN).toFixed(1) : null,
        activas: i.activas
      }))
  );
}
const Qe =
  'nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_estado';
async function pt(t = 25) {
  if (!k) return [];
  const { data: o, error: n } = await k
    .from(le)
    .select(Qe)
    .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
    .limit(t);
  return n || !o ? [] : o.map((s) => ea(s));
}
function ea(t) {
  const o = M(t.fecha_compromiso) || x(M(t.fecha_aprobacion), M(t.fecha_aprobacion_real));
  return {
    ...t,
    estado: G(t.estado) || t.estado,
    fecha_compromiso: o || null,
    nv: t.nv_ptm ? String(t.nv_ptm) : t.nv_orange || t.nv_farmapack || t.varios || '—',
    fecha_entrega: t.fecha_entregado,
    fecha_creacion: t.fecha_registro_nv
  };
}
async function ut(t, o = 'ptm', n = 60) {
  if (!k || !t) return [];
  const { data: s, error: f } = await k.rpc('nv_bitacora', {
    p_nv: String(t),
    p_canal: o ? String(o).toLowerCase() : null,
    p_limit: n
  });
  return f || !s
    ? []
    : s.map((h) => ({
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
async function ht() {
  return (await de(Qe + ',fecha_estado')).map((o) => ea(o));
}
async function _t() {
  return H(
    'fetch_tv_estados',
    async () => {
      const t = 'default',
        o = ye(se, t, xa);
      if (o) return o;
      const s = (async () => {
        const f = await de(
            'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_compromiso, fecha_estado, fecha_despacho, fecha_entregado, fecha_aprobacion, fecha_aprobacion_real, urgente'
          ),
          h = Date.now(),
          E = 1e3 * 60 * 60 * 24,
          i = (_) => (_ ? Math.floor((h - new Date(_ + 'T12:00:00').getTime()) / E) : null),
          u = {},
          c = [];
        let p = 0;
        const m = [l.ENTREGADO, l.RECIBIDO_CONFORME, l.RECIBIDO_OBS];
        f.forEach((_) => {
          const v = G(_.estado) || 'Sin estado';
          if (m.includes(v)) return;
          const I =
              (_.nv_ptm && String(_.nv_ptm)) || _.nv_orange || _.nv_farmapack || _.varios || '?',
            pe = _.nv_ptm
              ? 'PTM'
              : _.nv_orange
                ? 'Orange'
                : _.nv_farmapack
                  ? 'Farmapack'
                  : 'Varios',
            J = _.urgente === !0 || String(_.urgente) === 'true',
            Y = M(_.fecha_estado),
            A = M(_.fecha_aprobacion),
            B = M(_.fecha_aprobacion_real),
            Z = B || A,
            ue = _.fecha_compromiso || x(_.fecha_aprobacion, _.fecha_aprobacion_real),
            q = {
              nv: I,
              canal: pe,
              cliente: _.cliente || '—',
              vendedor: _.vendedor || '—',
              transportista: _.transportista || '—',
              fecha_compromiso: M(ue),
              fecha_estado: Y,
              fecha_despacho: M(_.fecha_despacho),
              fecha_entregado: M(_.fecha_entregado),
              fecha_aprobacion: A,
              fecha_aprobacion_real: B,
              fecha_aprob_efectiva: Z,
              diasEnEstado: i(Y),
              diasDesdeAprobacion: i(Z),
              urgente: J
            };
          (u[v] || (u[v] = []), u[v].push(q));
          const he = [l.ENTREGADO, l.RECIBIDO_CONFORME, l.RECIBIDO_OBS].includes(v);
          (J && !he && c.push(q), p++);
        });
        const D = O.filter((_) => {
          var v;
          return (((v = u[_]) == null ? void 0 : v.length) || 0) > 0;
        }).map((_) => ({
          estado: _,
          cantidad: u[_].length,
          nvs: u[_].sort((v, I) => (I.urgente ? 1 : 0) - (v.urgente ? 1 : 0))
        }));
        return Me(se, t, { estados: D, total: p, urgentes: c });
      })().catch((f) => {
        throw (se.delete(t), f);
      });
      return ke(se, t, s);
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
  _t as a,
  l as b,
  x as c,
  pt as d,
  ct as e,
  ut as f,
  ft as g,
  dt as h,
  ht as i,
  at as j,
  tt as k,
  et as l,
  nt as m,
  ot as n,
  lt as o,
  rt as p,
  it as q,
  M as s
};
