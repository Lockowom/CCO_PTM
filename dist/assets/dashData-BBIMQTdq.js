import { s as k, L as ze } from './index-Cpmu9M5B.js';
function M(t, o = '') {
  return t ? (typeof t == 'string' && t.length >= 10 ? t.slice(0, 10) : String(t)) : o;
}
function ja(t, o = '—') {
  if (!t) return o;
  const n = String(t).slice(0, 10),
    r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  return r ? `${r[3]}-${r[2]}-${r[1]}` : String(t);
}
function Ya() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}
function Ja(t, o) {
  const n = new Date(t + 'T12:00:00');
  n.setDate(n.getDate() + o);
  const r = n.getFullYear(),
    d = String(n.getMonth() + 1).padStart(2, '0'),
    h = String(n.getDate()).padStart(2, '0');
  return `${r}-${d}-${h}`;
}
function Za(t) {
  if (!t) return '245,124,0';
  const o = t.replace('#', ''),
    n = parseInt(o, 16);
  return isNaN(n) || o.length < 6 ? '245,124,0' : `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
const i = {
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
  Ke = {
    'EN PROCESO': i.EN_PROCESO,
    'EN SHIPPING': i.SHIPPING,
    'EN RUTA': i.EN_RUTA,
    ENTREGADO: i.ENTREGADO,
    'RECIBIDO CONFORME': i.ENTREGADO,
    'RECIBIDO C/OBS': i.ENTREGADO,
    'Recibido Conforme': i.ENTREGADO,
    'Recibido C/OBS': i.ENTREGADO
  };
function Wa(t) {
  return t ? Ke[t] || t : '';
}
const qa = {
  [i.EN_PROCESO]: '#f59e0b',
  [i.P_VENDEDOR]: '#d97706',
  [i.P_STOCK]: '#b45309',
  [i.P_RETIRO]: '#92400e',
  [i.SHIPPING]: '#8b5cf6',
  [i.CURRIER]: '#7c3aed',
  [i.EN_RUTA]: '#06b6d4',
  [i.ENTREGADO]: '#22c55e',
  [i.RECIBIDO_CONFORME]: '#16a34a',
  [i.RECIBIDO_OBS]: '#15803d'
};
function wa(t, o) {
  const n = new Date(t);
  let r = 0;
  const d = n.getDay();
  for (d === 0 ? n.setDate(n.getDate() + 1) : d === 6 && n.setDate(n.getDate() + 2); r < o;) {
    n.setDate(n.getDate() + 1);
    const h = n.getDay();
    h !== 0 && h !== 6 && r++;
  }
  return n;
}
function V(t, o) {
  const n = o || t;
  if (!n) return '';
  const r = new Date(n + 'T12:00:00');
  if (isNaN(r.getTime())) return '';
  const d = wa(r, 2),
    h = d.getFullYear(),
    _ = String(d.getMonth() + 1).padStart(2, '0'),
    l = String(d.getDate()).padStart(2, '0');
  return `${h}-${_}-${l}`;
}
const fe = 'tms_operaciones_vigentes',
  Ia = 60 * 1e3,
  Pa = 15 * 1e3,
  Ma = 15 * 1e3,
  ya = 10 * 1e3;
let P = { ts: 0, data: null, promise: null };
const oe = new Map(),
  se = new Map(),
  ce = new Map();
function ka(t, o) {
  return !!t && Object.prototype.hasOwnProperty.call(t, 'value') && Date.now() - t.ts < o;
}
function we(t, o, n) {
  const r = t.get(o);
  return r ? (r.promise ? r.promise : ka(r, n) ? r.value : (t.delete(o), null)) : null;
}
function Ie(t, o, n) {
  return (t.set(o, { ts: Date.now(), value: n }), n);
}
function Pe(t, o, n) {
  return (t.set(o, { ts: Date.now(), promise: n }), n);
}
function He(t) {
  return Math.round(Math.max(0, performance.now() - t));
}
async function K(
  t,
  o,
  { screen: n = 'PanelDashboard', payload: r = null, slowMs: d = 1200, message: h = '' } = {}
) {
  const _ = performance.now();
  try {
    const l = await o(),
      u = He(_);
    return (
      u >= d &&
        ze.performance({
          module: 'panel',
          screen: n,
          action: t,
          message: h || `Operacion lenta del dashboard: ${t}`,
          durationMs: u,
          status: 'ok',
          payload: r
        }),
      l
    );
  } catch (l) {
    throw (
      ze.error(l, {
        module: 'panel',
        screen: n,
        action: t,
        message: `Fallo operacion de dashboard: ${t}`,
        durationMs: He(_),
        status: 'error',
        payload: r
      }),
      l
    );
  }
}
function y(t) {
  return t.fecha_aprobacion_real || t.fecha_aprobacion || null;
}
function je(t, o, n) {
  if (!o || !n) return !0;
  const r = y(t);
  if (!r) return !1;
  const d = String(r).slice(0, 10);
  return d >= o && d <= n;
}
function Ce(t, o) {
  if (!t || !o) return null;
  const n = new Date(t).getTime(),
    r = new Date(o).getTime();
  if (isNaN(n) || isNaN(r)) return null;
  const d = (r - n) / (1e3 * 60 * 60 * 24);
  return d < 0 || d > 365 ? null : d;
}
function Fa(t) {
  const n = [
    { nombre: 'En Proceso → Shipping', from: (u) => y(u), to: (u) => u.fecha_shipping },
    { nombre: 'Shipping → En Ruta', from: (u) => u.fecha_shipping, to: (u) => u.fecha_en_ruta },
    { nombre: 'En Ruta → Entregado', from: (u) => u.fecha_en_ruta, to: (u) => u.fecha_entregado }
  ].map((u) => {
    let s = 0,
      p = 0;
    return (
      t.forEach((g) => {
        const v = Ce(u.from(g), u.to(g));
        v !== null && ((s += v), p++);
      }),
      { nombre: u.nombre, dias: p > 0 ? +(s / p).toFixed(1) : null, n: p }
    );
  });
  let r = 0,
    d = 0;
  t.forEach((u) => {
    const s = u.fecha_entregado || u.fecha_despacho,
      p = Ce(y(u), s);
    p !== null && ((r += p), d++);
  });
  const h = d > 0 ? +(r / d).toFixed(1) : null,
    _ = n.filter((u) => u.dias !== null),
    l = _.length > 0 ? _.reduce((u, s) => (s.dias > u.dias ? s : u)) : null;
  return {
    etapas: n,
    leadTimeTotal: h,
    leadTimeTotalN: d,
    cuelloBotella: l ? { nombre: l.nombre, dias: l.dias } : null
  };
}
const ie = ['NULA', 'REFACTURADO', 'RECHAZADO'];
function z(t) {
  return t && (Ke[t] || t);
}
const Ye = [i.P_VENDEDOR, i.P_STOCK, i.P_RETIRO],
  re = [i.EN_PROCESO, ...Ye],
  R = [i.EN_PROCESO, ...Ye, i.SHIPPING, i.CURRIER, i.EN_RUTA],
  $a = [i.CURRIER, i.EN_RUTA, i.ENTREGADO],
  A = [i.ENTREGADO],
  B = [
    i.EN_PROCESO,
    i.P_VENDEDOR,
    i.P_STOCK,
    i.P_RETIRO,
    i.SHIPPING,
    i.CURRIER,
    i.EN_RUTA,
    i.ENTREGADO
  ],
  Ua = [...B, 'NULA', 'REFACTURADO', 'RECHAZADO'];
function La(t) {
  return t.fecha_shipping || t.fecha_en_ruta || t.fecha_entregado || t.fecha_despacho || null;
}
function T(t) {
  const o = t.fecha_compromiso || V(t.fecha_aprobacion, t.fecha_aprobacion_real);
  if (!o) return null;
  const n = y(t);
  if (!n) return { fecha: o, diasAtraso: 0 };
  const r = new Date(o).getTime(),
    d = new Date(n).getTime();
  if (d > r) {
    const h = Math.round((d - r) / 864e5);
    return { fecha: n.split('T')[0], diasAtraso: h };
  }
  return { fecha: o, diasAtraso: 0 };
}
function le(t, o) {
  if (ie.includes(t.estado || '')) return null;
  const n = T(t);
  if (!n) return null;
  const r = new Date(n.fecha + 'T23:59:59').getTime();
  if (re.includes(t.estado || '')) return o > r ? !1 : null;
  const d = La(t);
  return d ? new Date(d).getTime() <= r : null;
}
function x(t) {
  const o = new Date(t + 'T12:00:00');
  if (isNaN(o.getTime())) return '';
  const n = o.getDay(),
    r = o.getDate() - n + (n === 0 ? -6 : 1),
    d = new Date(o.getFullYear(), o.getMonth(), r);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}
function Ga(t) {
  if (!t) return 0;
  const o = Date.now() - new Date(t).getTime();
  return Number.isNaN(o) ? 0 : o / (1e3 * 60 * 60);
}
function xa(t, o = '') {
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
const Be =
  'nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,division,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_en_proceso,incidencia,estado_incidencia,observaciones_incidencia,dias_incidencia,guia,factura,urgente,reabierta,motivo_reapertura,fecha_reapertura';
async function Me(t, o, n) {
  const r = [];
  let d = 0;
  const h = 1e3;
  for (;;) {
    let _ = k
      .from(fe)
      .select(t)
      .order('id', { ascending: !0 })
      .range(d, d + h - 1);
    o && n
      ? (_ = _.or(
          `and(fecha_aprobacion_real.gte.${o},fecha_aprobacion_real.lte.${n}),and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${o},fecha_aprobacion.lte.${n})`
        ))
      : o
        ? (_ = _.or(
            `fecha_aprobacion_real.gte.${o},and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${o})`
          ))
        : n &&
          (_ = _.or(
            `fecha_aprobacion_real.lte.${n},and(fecha_aprobacion_real.is.null,fecha_aprobacion.lte.${n})`
          ));
    const { data: l, error: u } = await _;
    if (u) throw u;
    if (!l || l.length === 0 || (r.push(...l), l.length < h)) break;
    d += h;
  }
  return r;
}
const Va = [
  i.EN_PROCESO,
  'EN PROCESO',
  i.P_VENDEDOR,
  i.P_STOCK,
  i.P_RETIRO,
  i.SHIPPING,
  'SHIPPING',
  'EN SHIPPING',
  i.CURRIER,
  'CURRIER',
  i.EN_RUTA,
  'EN RUTA'
];
function za(t) {
  const o = t.nv_ptm ? 'ptm' : t.nv_orange ? 'orange' : t.nv_farmapack ? 'farmapack' : 'varios',
    n = t.nv_ptm ? String(t.nv_ptm) : t.nv_orange || t.nv_farmapack || t.varios || '';
  return `${o}:${n}`;
}
async function de(t) {
  const o = [];
  let n = 0;
  const r = 1e3;
  for (;;) {
    const { data: d, error: h } = await k
      .from(fe)
      .select(t)
      .in('estado', Va)
      .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
      .order('id', { ascending: !1 })
      .range(n, n + r - 1);
    if (h) throw h;
    if (!d || d.length === 0 || (o.push(...d), d.length < r)) break;
    n += r;
  }
  return o;
}
async function Ha() {
  return K(
    'fetch_consolidado_keys',
    async () => {
      const t = Date.now();
      if (P.data && t - P.ts < Ia) return P.data;
      if (P.promise) return P.promise;
      const o = async () => {
        const { data: n, error: r } = await k.from('consolidado_nvs').select('nv, canal'),
          d = r ? new Set() : new Set((n || []).map((h) => `${h.canal || 'ptm'}:${h.nv}`));
        return ((P = { ts: Date.now(), data: d, promise: null }), d);
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
async function Qa(t, o) {
  return K(
    'fetch_dashboard_data',
    async () => {
      const n = `${t || ''}:${o || ''}`,
        r = we(oe, n, Pa);
      if (r) return r;
      const h = (async () => {
        const [_, l, u] = await Promise.all([Me(Be, t, o), de(Be), Ha()]),
          s = (e) => {
            ((e.estado = z(e.estado)),
              (e._consolidado = u.has(za(e))),
              e.fecha_compromiso ||
                (e.fecha_compromiso = V(e.fecha_aprobacion, e.fecha_aprobacion_real) || null));
          };
        (l.forEach(s), _.forEach(s));
        const p = l,
          g = p.filter((e) => je(e, t, o)),
          v = _.filter((e) => !e._consolidado),
          O = p.filter((e) => !e._consolidado),
          m = _.length,
          D = _.filter((e) => e.nv_ptm).length,
          w = _.filter((e) => e.nv_orange).length,
          pe = _.filter((e) => e.nv_farmapack).length,
          j = _.filter((e) => e.varios).length,
          b = {};
        (_.forEach((e) => {
          const a = e.estado || 'null';
          b[a] = (b[a] || 0) + 1;
        }),
          R.forEach((e) => {
            b[e] = 0;
          }),
          g.forEach((e) => {
            const a = e.estado || 'null';
            b[a] = (b[a] || 0) + 1;
          }));
        const H = _.filter((e) => A.includes(e.estado)).length,
          Y = b.NULA || 0,
          J = b.REFACTURADO || 0,
          ue = b.RECHAZADO || 0,
          Z = p.length,
          W = m - Y - J - ue,
          We = W > 0 ? ((H / W) * 100).toFixed(1) : '0',
          qe = v.filter((e) => A.includes(e.estado) && e.fecha_despacho && e.fecha_compromiso);
        let ye = 0,
          q = 0,
          he = 0;
        qe.forEach((e) => {
          const a = T(e);
          if (!a) return;
          const c = new Date(e.fecha_despacho),
            f = new Date(a.fecha),
            E = (c.getTime() - f.getTime()) / (1e3 * 60 * 60 * 24);
          Math.abs(E) > 30 || (E > 0 ? ((ye += E), q++) : he++);
        });
        const Qe = q > 0 ? (ye / q).toFixed(1) : '0',
          ke = q + he,
          Xe = ke > 0 ? ((he / ke) * 100).toFixed(0) : '0',
          ea = (e) => {
            const a = String((e == null ? void 0 : e.incidencia) || '').trim(),
              c = String((e == null ? void 0 : e.estado_incidencia) || '')
                .trim()
                .toUpperCase();
            return a.length > 0 && c !== 'RESUELTA';
          },
          Fe = v.filter(ea),
          aa = Fe.length,
          $e = Date.now();
        let Q = 0,
          _e = 0;
        v.forEach((e) => {
          const a = le(e, $e);
          a === !0 ? Q++ : a === !1 && _e++;
        });
        const me = Q + _e,
          ta = {
            pct: me > 0 ? ((Q / me) * 100).toFixed(1) : null,
            cumple: Q,
            noCumple: _e,
            evaluables: me
          },
          na = new Date().toISOString().split('T')[0],
          oa = x(na),
          sa = Date.now(),
          Ue = v.filter((e) => {
            if (!e.fecha_registro_nv || ie.includes(e.estado || '')) return !1;
            const a =
              typeof e.fecha_registro_nv == 'string'
                ? e.fecha_registro_nv.split('T')[0]
                : new Date(e.fecha_registro_nv).toISOString().split('T')[0];
            return x(a) === oa;
          });
        let X = 0,
          ee = 0;
        Ue.forEach((e) => {
          const a = T(e);
          if (!a) return;
          const c = new Date(a.fecha + 'T23:59:59').getTime();
          if (re.includes(e.estado)) sa > c && ee++;
          else {
            const f = e.fecha_shipping || e.fecha_en_ruta || e.fecha_entregado;
            f && (new Date(f).getTime() <= c ? X++ : ee++);
          }
        });
        const ge = X + ee,
          ca = {
            pct: ge > 0 ? ((X / ge) * 100).toFixed(1) : null,
            cumple: X,
            noCumple: ee,
            evaluables: ge,
            totalSemana: Ue.length
          },
          ia = {
            total: m,
            countNvPtm: D,
            nvVarios: j,
            nvOrange: w,
            nvFarmapack: pe,
            estadoCounts: b,
            entregadas: H,
            activas: Z,
            tasaEntrega: We,
            leadTimeTardanza: Qe,
            pctAtiempo: Xe,
            incidencias: aa,
            fillRateShipping: ta,
            cumplimientoNV: ca
          },
          F = {},
          Le = (e) => {
            const a = e.estado || 'null';
            (F[a] || (F[a] = { farmapack: 0, orange: 0, ptm: 0, varios: 0, total: 0 }),
              e.nv_farmapack && F[a].farmapack++,
              e.nv_orange && F[a].orange++,
              e.nv_ptm && F[a].ptm++,
              e.varios && F[a].varios++,
              F[a].total++);
          };
        (_.forEach((e) => {
          R.includes(e.estado || '') || Le(e);
        }),
          g.forEach((e) => {
            R.includes(e.estado || '') && Le(e);
          }));
        const ra = Object.entries(F)
            .map(([e, a]) => ({ estado: e, ...a }))
            .filter((e) => B.includes(e.estado))
            .sort((e, a) => B.indexOf(e.estado) - B.indexOf(a.estado)),
          Ee = {};
        _.forEach((e) => {
          const a = e.division || 'SIN DIVISIÓN';
          Ee[a] = (Ee[a] || 0) + 1;
        });
        const la = Object.entries(Ee)
            .map(([e, a]) => ({ division: e, cantidad: a }))
            .sort((e, a) => a.cantidad - e.cantidad),
          ve = {};
        _.forEach((e) => {
          const a = e.transportista || 'SIN TRANSPORTISTA';
          ve[a] = (ve[a] || 0) + 1;
        });
        const fa = Object.entries(ve)
            .map(([e, a]) => ({ transportista: e, cantidad: a }))
            .sort((e, a) => a.cantidad - e.cantidad),
          $ = {};
        v.forEach((e) => {
          const a = y(e);
          if (!a) return;
          const c = x(a);
          if (!c) return;
          ($[c] ||
            ($[c] = { aprobadas: 0, entregadas: 0, tardanza: [], fillrateOk: 0, fillrateTotal: 0 }),
            $[c].aprobadas++,
            A.includes(e.estado) && $[c].entregadas++);
          const f = le(e, $e);
          if ((f !== null && ($[c].fillrateTotal++, f && $[c].fillrateOk++), e.fecha_despacho)) {
            const E = T(e);
            if (E) {
              const N = new Date(e.fecha_despacho),
                S = new Date(E.fecha),
                C = (N.getTime() - S.getTime()) / (1e3 * 60 * 60 * 24);
              C > 0 && C <= 30 && $[c].tardanza.push(C);
            }
          }
        });
        const da = Object.entries($)
            .sort(([e], [a]) => e.localeCompare(a))
            .map(([e, a]) => {
              const c = new Date(e + 'T12:00:00'),
                f = c.getDate(),
                E = [
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
                N = `${String(f).padStart(2, '0')}-${E[c.getMonth()]}`,
                S =
                  a.tardanza.length > 0
                    ? +(a.tardanza.reduce((ne, Ca) => ne + Ca, 0) / a.tardanza.length).toFixed(1)
                    : 0,
                C = a.fillrateTotal > 0 ? +((a.fillrateOk / a.fillrateTotal) * 100).toFixed(1) : 0;
              return {
                semana: N,
                entregadas: a.entregadas,
                aprobadas: a.aprobadas,
                tardanza: S,
                fillRate: C
              };
            }),
          De = {};
        g.forEach((e) => {
          R.includes(e.estado || '') && (De[e.estado] = (De[e.estado] || 0) + 1);
        });
        const pa = Object.entries(De)
            .map(([e, a]) => ({ estado: e, count: a }))
            .sort((e, a) => a.count - e.count),
          G = {};
        v.forEach((e) => {
          if (!A.includes(e.estado) || !e.fecha_despacho || !e.fecha_compromiso) return;
          const a = y(e);
          if (!a) return;
          const c = x(a);
          if (!c) return;
          G[c] || (G[c] = { tardanzaSum: 0, tardanzaCount: 0, atiempoCount: 0 });
          const f = T(e);
          if (!f) return;
          const E = new Date(e.fecha_despacho),
            N = new Date(f.fecha),
            S = (E.getTime() - N.getTime()) / (1e3 * 60 * 60 * 24);
          Math.abs(S) > 30 ||
            (S > 0 ? ((G[c].tardanzaSum += S), G[c].tardanzaCount++) : G[c].atiempoCount++);
        });
        const ua = Object.entries(G)
            .sort(([e], [a]) => e.localeCompare(a))
            .map(([e, a]) => {
              const c = new Date(e + 'T12:00:00'),
                f = Math.ceil(
                  ((c.getTime() - new Date(c.getFullYear(), 0, 1).getTime()) / 864e5 + 1) / 7
                ),
                E = a.tardanzaCount + a.atiempoCount;
              return {
                semana: `Semana ${f}`,
                dias: a.tardanzaCount > 0 ? +(a.tardanzaSum / a.tardanzaCount).toFixed(1) : 0,
                count: E,
                pctAtiempo: E > 0 ? +((a.atiempoCount / E) * 100).toFixed(0) : 0
              };
            }),
          ha = R,
          Ge = new Date();
        Ge.setHours(0, 0, 0, 0);
        const _a = Ge.getTime(),
          ma = 1e3 * 60 * 60 * 24;
        let Se = 0,
          Te = 0,
          Oe = 0;
        const Re = [];
        (O.forEach((e) => {
          if (!ha.includes(e.estado || '')) return;
          const a = T(e);
          if (!a) return;
          const c = new Date(a.fecha + 'T12:00:00');
          c.setHours(0, 0, 0, 0);
          const f = Math.round((c.getTime() - _a) / ma);
          f > 1 ||
            (f < 0 ? Se++ : f === 0 ? Te++ : f === 1 && Oe++,
            Re.push({
              nv:
                (e.nv_ptm && String(e.nv_ptm)) || e.nv_orange || e.nv_farmapack || e.varios || '—',
              cliente: e.cliente || '—',
              vendedor: e.vendedor || '—',
              transportista: e.transportista || '—',
              estado: e.estado || '—',
              division: e.division || '—',
              fecha_compromiso: e.fecha_compromiso,
              diasVencido: -f
            }));
        }),
          Re.sort((e, a) => a.diasVencido - e.diasVencido));
        const ga = { vencidos: Se, hoy: Te, manana: Oe, total: Se + Te + Oe, detalle: Re },
          Ae = {},
          I = (e) => {
            Ae[e] = (Ae[e] || 0) + 1;
          },
          ae = [];
        (_.forEach((e) => {
          const a = [],
            c = String(e.estado || '').trim(),
            f = ie.includes(c);
          c
            ? Ua.includes(c) || (a.push(`Estado no reconocido: "${c}"`), I('Estado no reconocido'))
            : (a.push('Sin estado'), I('Sin estado'));
          const E = A.includes(c);
          if (!f && !E) {
            (e.cliente || (a.push('Sin cliente'), I('Sin cliente')),
              e.vendedor || (a.push('Sin vendedor'), I('Sin vendedor')),
              e.division || (a.push('Sin división'), I('Sin división')),
              $a.includes(c) &&
                !e.transportista &&
                (a.push('Sin transportista'), I('Sin transportista')));
            const N = e.fecha_compromiso || V(e.fecha_aprobacion, e.fecha_aprobacion_real);
            R.includes(c) && !N && (a.push('Sin fecha compromiso'), I('Sin fecha compromiso'));
            const S = y(e);
            (S &&
              e.fecha_despacho &&
              new Date(e.fecha_despacho).getTime() < new Date(S).getTime() &&
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
              estado: c || '—',
              division: e.division || '—',
              vendedor: e.vendedor || '—',
              problemas: a
            });
        }),
          ae.sort((e, a) => a.problemas.length - e.problemas.length));
        const Ea = { total: ae.length, porTipo: Ae, detalle: ae };
        let be = 0,
          te = 0;
        v.forEach((e) => {
          if (!A.includes(e.estado) || !e.fecha_despacho || !e.fecha_compromiso) return;
          const a = T(e);
          if (!a) return;
          te++;
          const c = new Date(e.fecha_despacho),
            f = new Date(a.fecha);
          c.getTime() <= f.getTime() && !0 && be++;
        });
        const va = { pct: te > 0 ? +((be / te) * 100).toFixed(1) : null, cumple: be, total: te },
          U = {};
        v.forEach((e) => {
          const a = (e.transportista || '').trim();
          if (
            !(!a || a === 'SIN TRANSPORTISTA') &&
            (U[a] || (U[a] = { total: 0, entregadas: 0, aTiempo: 0, tardanzaSum: 0, tardanzaN: 0 }),
            U[a].total++,
            A.includes(e.estado) && (U[a].entregadas++, e.fecha_despacho && e.fecha_compromiso))
          ) {
            const c = T(e);
            if (c) {
              const f =
                (new Date(e.fecha_despacho).getTime() - new Date(c.fecha).getTime()) / 864e5;
              Math.abs(f) <= 30 &&
                (f <= 0 ? U[a].aTiempo++ : ((U[a].tardanzaSum += f), U[a].tardanzaN++));
            }
          }
        });
        const Da = Object.entries(U)
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
          L = {};
        v.forEach((e) => {
          const a = (e.vendedor || '').trim();
          if (
            !(!a || a === '—') &&
            (L[a] || (L[a] = { total: 0, entregadas: 0, aTiempo: 0, activas: 0, reabiertas: 0 }),
            L[a].total++,
            A.includes(e.estado) && L[a].entregadas++,
            R.includes(e.estado) && L[a].activas++,
            e.reabierta === !0 && L[a].reabiertas++,
            A.includes(e.estado) && e.fecha_despacho && e.fecha_compromiso)
          ) {
            const c = T(e);
            if (c) {
              const f =
                (new Date(e.fecha_despacho).getTime() - new Date(c.fecha).getTime()) / 864e5;
              f <= 0 && Math.abs(f) <= 30 && L[a].aTiempo++;
            }
          }
        });
        const xe = Object.entries(
            Fe.reduce((e, a) => {
              const f = (a.vendedor || 'Sin vendedor').trim() || 'Sin vendedor';
              e[f] ||
                (e[f] = {
                  vendedor: f,
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
              const E = e[f];
              ((E.total += 1),
                E.clientes.add(a.cliente || 'Sin cliente'),
                a.transportista && E.transportistas.add(a.transportista));
              const N = xa(a.incidencia, a.observaciones_incidencia);
              (N === 'direccion'
                ? (E.direccion += 1)
                : N === 'transporte'
                  ? (E.transporte += 1)
                  : (E.otros += 1),
                (E.tipos[a.incidencia] = (E.tipos[a.incidencia] || 0) + 1));
              const S = a.fecha_aprobacion_real || a.fecha_aprobacion || a.fecha_estado,
                C = Ga(S);
              (C > 48 && (E.fuera48h += 1), C > E.maxHoras && (E.maxHoras = C));
              const ne = Number(a.dias_incidencia) || Math.max(0, Math.floor(C / 24));
              return (ne > E.maxDias && (E.maxDias = ne), e);
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
                  ((a = Object.entries(e.tipos).sort((c, f) => f[1] - c[1])[0]) == null
                    ? void 0
                    : a[0]) || '—'
              };
            })
            .sort((e, a) => a.fuera48h - e.fuera48h || a.total - e.total || a.maxDias - e.maxDias)
            .slice(0, 12),
          Sa = xe.reduce((e, a) => ((e[a.vendedor] = a), e), {}),
          Ta = Object.entries(L)
            .map(([e, a]) => {
              const c = Sa[e];
              return {
                nombre: e,
                total: a.total,
                entregadas: a.entregadas,
                activas: a.activas,
                reabiertas: a.reabiertas,
                pctATiempo:
                  a.entregadas > 0 ? +((a.aTiempo / a.entregadas) * 100).toFixed(0) : null,
                erroresActivos: (c == null ? void 0 : c.total) || 0,
                errores48h: (c == null ? void 0 : c.fuera48h) || 0,
                errorPrincipal: (c == null ? void 0 : c.topTipo) || '—'
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
          Oa = {
            [i.EN_PROCESO]: 3,
            [i.P_VENDEDOR]: 3,
            [i.P_STOCK]: 3,
            [i.P_RETIRO]: 3,
            [i.SHIPPING]: 2,
            [i.CURRIER]: 2,
            [i.EN_RUTA]: 3,
            [i.ENTREGADO]: 5
          },
          Ve = [],
          Ra = Date.now();
        R.forEach((e) => {
          const a = Oa[e] || 5,
            c = [];
          (l.forEach((f) => {
            if (f.estado !== e || f._consolidado) return;
            const E = f.fecha_estado || f.fecha_registro_nv;
            if (!E) return;
            if ((Ra - new Date(E).getTime()) / (1e3 * 60 * 60 * 24) > a) {
              const S =
                (f.nv_ptm && String(f.nv_ptm)) || f.nv_orange || f.nv_farmapack || f.varios || '?';
              c.push(S);
            }
          }),
            c.length > 0 && Ve.push({ estado: e, cantidad: c.length, nvs: c.slice(0, 5) }));
        });
        const Aa = Ve,
          ba = [
            {
              etapa: i.EN_PROCESO,
              incluye: [...re, i.SHIPPING, i.CURRIER, i.EN_RUTA, i.ENTREGADO]
            },
            { etapa: i.SHIPPING, incluye: [i.SHIPPING, i.CURRIER, i.EN_RUTA, i.ENTREGADO] },
            { etapa: i.EN_RUTA, incluye: [i.EN_RUTA, i.ENTREGADO] },
            { etapa: i.ENTREGADO, incluye: [i.ENTREGADO] }
          ].map(({ etapa: e, incluye: a }) => {
            let c = 0;
            return (
              _.forEach((f) => {
                a.includes(f.estado || '') && c++;
              }),
              g.forEach((f) => {
                R.includes(f.estado || '') && a.includes(f.estado || '') && c++;
              }),
              { etapa: e, cantidad: c }
            );
          }),
          Ne = {};
        _.forEach((e) => {
          const a = e.estado || 'Sin estado';
          if (!B.includes(a)) return;
          const c = (e.transportista || '').trim() || 'Sin transportista',
            f = `${a}|||${c}`;
          Ne[f] = (Ne[f] || 0) + 1;
        });
        const Na = Object.entries(Ne)
          .map(([e, a]) => {
            const [c, f] = e.split('|||');
            return { estado: c, transportista: f, cantidad: a };
          })
          .sort((e, a) => a.cantidad - e.cantidad);
        return Ie(oe, n, {
          kpis: ia,
          estadoTable: ra,
          divisions: la,
          transportistas: fa,
          weeklyTrend: da,
          estadoResumen: pa,
          leadTimeSemanal: ua,
          alertas: ga,
          calidad: Ea,
          tiemposCiclo: Fa(v),
          otif: va,
          rankingTransportistas: Da,
          rankingVendedores: Ta,
          incidenciasPorVendedor: xe,
          alertasOperacionales: Aa,
          funnelEstados: ba,
          heatmapData: Na
        });
      })().catch((_) => {
        throw (oe.delete(n), _);
      });
      return Pe(oe, n, h);
    },
    {
      payload: { dateFrom: t || null, dateTo: o || null },
      slowMs: 1800,
      message: 'Carga principal de datos del dashboard del Panel'
    }
  );
}
async function Xa(t, o) {
  return K(
    'get_incidencias_activas',
    async () => {
      const n = `${t || ''}:${o || ''}`,
        r = we(se, n, Ma);
      if (r) return r;
      const h = (async () => {
        const _ =
          'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, incidencia, estado_incidencia, observaciones_incidencia, dias_incidencia, fecha_aprobacion, fecha_aprobacion_real';
        if (!k) return [];
        const l = [];
        let u = 0;
        const s = 1e3;
        for (;;) {
          let p = k
            .from(fe)
            .select(_)
            .not('incidencia', 'is', null)
            .neq('estado_incidencia', 'RESUELTA')
            .order('id', { ascending: !0 })
            .range(u, u + s - 1);
          (t &&
            (p = p.or(
              `fecha_aprobacion_real.gte.${t},and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${t})`
            )),
            o &&
              (p = p.or(
                `fecha_aprobacion_real.lte.${o},and(fecha_aprobacion_real.is.null,fecha_aprobacion.lte.${o})`
              )));
          const { data: g, error: v } = await p;
          if (v || !g || g.length === 0 || (l.push(...g), g.length < s)) break;
          u += s;
        }
        return Ie(
          se,
          n,
          l
            .map((p) => ({
              nv:
                (p.nv_ptm && String(p.nv_ptm)) || p.nv_orange || p.nv_farmapack || p.varios || '—',
              fecha: p.fecha_aprobacion_real || p.fecha_aprobacion || null,
              cliente: p.cliente || '—',
              vendedor: p.vendedor || '—',
              transportista: p.transportista || '—',
              estado: z(p.estado) || '—',
              incidencia: p.incidencia || '—',
              estado_incidencia: p.estado_incidencia || '—',
              observaciones: p.observaciones_incidencia || '—',
              dias: p.dias_incidencia || 0
            }))
            .sort((p, g) => g.dias - p.dias)
        );
      })().catch((_) => {
        throw (se.delete(n), _);
      });
      return Pe(se, n, h);
    },
    {
      payload: { dateFrom: t || null, dateTo: o || null },
      slowMs: 900,
      message: 'Carga de incidencias activas del dashboard'
    }
  );
}
async function et(t, o, n) {
  return K(
    'get_operaciones_por_estado',
    async () => {
      const r =
          'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_despacho, fecha_compromiso, division, fecha_aprobacion, fecha_aprobacion_real, fecha_registro_nv, fecha_shipping, fecha_en_ruta, fecha_entregado, tipo_despacho, fecha_estado, reabierta, motivo_reapertura, fecha_reapertura',
        d = t === 'ACTIVAS',
        h = d || R.includes(t),
        _ = h ? await de(r) : await Me(r, o, n),
        l = h && !d ? _.filter((s) => je(s, o, n)) : _;
      return (
        l.forEach((s) => {
          s.estado = z(s.estado);
        }),
        l
          .filter((s) => {
            if (t === 'ACTIVAS') return R.includes(s.estado || '');
            if (t === 'TARDIAS') {
              if (!A.includes(s.estado) || !s.fecha_despacho || !s.fecha_compromiso) return !1;
              const p = T(s);
              if (!p) return !1;
              const g =
                (new Date(s.fecha_despacho).getTime() - new Date(p.fecha).getTime()) /
                (1e3 * 60 * 60 * 24);
              return g > 0 && Math.abs(g) <= 30;
            }
            if (t === 'ATIEMPO') {
              if (!A.includes(s.estado) || !s.fecha_despacho || !s.fecha_compromiso) return !1;
              const p = T(s);
              if (!p) return !1;
              const g =
                (new Date(s.fecha_despacho).getTime() - new Date(p.fecha).getTime()) /
                (1e3 * 60 * 60 * 24);
              return g <= 0 && Math.abs(g) <= 30;
            }
            if (t === 'ENTREGADAS') return A.includes(s.estado);
            if (t === 'FILLRATE_CUMPLE') return le(s, Date.now()) === !0;
            if (t === 'FILLRATE_NOCUMPLE') return le(s, Date.now()) === !1;
            if (t === 'NVCUMPLE' || t === 'NVNOCUMPLE') {
              if (!s.fecha_registro_nv || ie.includes(s.estado || '')) return !1;
              const p =
                  typeof s.fecha_registro_nv == 'string'
                    ? s.fecha_registro_nv.split('T')[0]
                    : new Date(s.fecha_registro_nv).toISOString().split('T')[0],
                g = x(new Date().toISOString().split('T')[0]);
              if (x(p) !== g) return !1;
              const v = T(s);
              if (!v) return !1;
              const O = new Date(v.fecha + 'T23:59:59').getTime();
              if (re.includes(s.estado)) return t === 'NVNOCUMPLE' && Date.now() > O;
              const m = s.fecha_shipping || s.fecha_en_ruta || s.fecha_entregado;
              if (!m) return !1;
              const D = new Date(m).getTime() <= O;
              return t === 'NVCUMPLE' ? D : !D;
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
            let p = null;
            if (s.fecha_aprobacion && s.fecha_aprobacion_real) {
              const D = new Date(s.fecha_aprobacion),
                w = new Date(s.fecha_aprobacion_real);
              p = Math.round((w.getTime() - D.getTime()) / (1e3 * 60 * 60 * 24));
            }
            let g = null;
            const v = T(s),
              O = (v == null ? void 0 : v.fecha) || s.fecha_compromiso,
              m = (v == null ? void 0 : v.diasAtraso) || 0;
            if (s.fecha_despacho && O) {
              const D = new Date(s.fecha_despacho),
                w = new Date(O);
              g = Math.round((D.getTime() - w.getTime()) / (1e3 * 60 * 60 * 24));
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
              dif_aprobacion: p,
              fecha_despacho: s.fecha_despacho || null,
              fecha_compromiso: s.fecha_compromiso || null,
              fecha_promesa_efectiva: O || null,
              dias_atraso_ingreso: m,
              dias_entrega: g,
              tipo_despacho: s.tipo_despacho || null,
              reabierta: s.reabierta === !0,
              motivo_reapertura: s.motivo_reapertura || '',
              fecha_reapertura: s.fecha_reapertura || null
            };
          })
          .sort((s, p) => (p.fecha_aprobacion || '').localeCompare(s.fecha_aprobacion || ''))
      );
    },
    {
      payload: { estado: t, dateFrom: o || null, dateTo: n || null },
      slowMs: 1100,
      message: 'Detalle de operaciones por estado en dashboard'
    }
  );
}
async function at() {
  return { operadores: [], total: 0 };
}
async function tt(t = 6) {
  const o = new Date();
  o.setMonth(o.getMonth() - t);
  const n = o.toISOString().split('T')[0],
    d = await Me(
      'estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_entregado,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,nv_ptm,nv_orange,nv_farmapack,varios',
      n
    );
  d.forEach((l) => {
    ((l.estado = z(l.estado)),
      l.fecha_compromiso ||
        (l.fecha_compromiso = V(l.fecha_aprobacion, l.fecha_aprobacion_real) || null));
  });
  const h = {},
    _ = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return (
    d.forEach((l) => {
      const u = y(l);
      if (!u) return;
      const s = new Date(u),
        p = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}`;
      h[p] ||
        (h[p] = {
          label: `${_[s.getMonth()]} ${s.getFullYear()}`,
          entregadas: 0,
          aTiempo: 0,
          totalEval: 0,
          otifCumple: 0,
          otifTotal: 0,
          ltSum: 0,
          ltN: 0,
          activas: 0
        });
      const g = h[p];
      if ((R.includes(l.estado) && g.activas++, A.includes(l.estado))) {
        if ((g.entregadas++, l.fecha_despacho && l.fecha_compromiso)) {
          const m = T(l);
          if (m) {
            const D = (new Date(l.fecha_despacho).getTime() - new Date(m.fecha).getTime()) / 864e5;
            Math.abs(D) <= 30 &&
              (g.totalEval++, D <= 0 && g.aTiempo++, g.otifTotal++, D <= 0 && g.otifCumple++);
          }
        }
        const v = l.fecha_entregado || l.fecha_despacho,
          O = Ce(y(l), v);
        O !== null && ((g.ltSum += O), g.ltN++);
      }
    }),
    Object.entries(h)
      .sort(([l], [u]) => l.localeCompare(u))
      .map(([, l]) => ({
        label: l.label,
        entregadas: l.entregadas,
        pctATiempo: l.totalEval > 0 ? +((l.aTiempo / l.totalEval) * 100).toFixed(0) : null,
        otif: l.otifTotal > 0 ? +((l.otifCumple / l.otifTotal) * 100).toFixed(0) : null,
        leadTime: l.ltN > 0 ? +(l.ltSum / l.ltN).toFixed(1) : null,
        activas: l.activas
      }))
  );
}
const Je =
  'nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_estado';
async function nt(t = 25) {
  if (!k) return [];
  const { data: o, error: n } = await k
    .from(fe)
    .select(Je)
    .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
    .limit(t);
  return n || !o ? [] : o.map((r) => Ze(r));
}
function Ze(t) {
  const o = M(t.fecha_compromiso) || V(M(t.fecha_aprobacion), M(t.fecha_aprobacion_real));
  return {
    ...t,
    estado: z(t.estado) || t.estado,
    fecha_compromiso: o || null,
    nv: t.nv_ptm ? String(t.nv_ptm) : t.nv_orange || t.nv_farmapack || t.varios || '—',
    fecha_entrega: t.fecha_entregado,
    fecha_creacion: t.fecha_registro_nv
  };
}
async function ot(t, o = 'ptm', n = 60) {
  if (!k || !t) return [];
  const { data: r, error: d } = await k.rpc('nv_bitacora', {
    p_nv: String(t),
    p_canal: o ? String(o).toLowerCase() : null,
    p_limit: n
  });
  return d || !r
    ? []
    : r.map((h) => ({
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
async function st() {
  return (await de(Je + ',fecha_estado')).map((o) => Ze(o));
}
async function ct() {
  return K(
    'fetch_tv_estados',
    async () => {
      const t = 'default',
        o = we(ce, t, ya);
      if (o) return o;
      const r = (async () => {
        const d = await de(
            'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_compromiso, fecha_estado, fecha_despacho, fecha_entregado, fecha_aprobacion, fecha_aprobacion_real, urgente'
          ),
          h = Date.now(),
          _ = 1e3 * 60 * 60 * 24,
          l = (m) => (m ? Math.floor((h - new Date(m + 'T12:00:00').getTime()) / _) : null),
          u = {},
          s = [];
        let p = 0;
        const g = [i.ENTREGADO, i.RECIBIDO_CONFORME, i.RECIBIDO_OBS];
        d.forEach((m) => {
          const D = z(m.estado) || 'Sin estado';
          if (g.includes(D)) return;
          const w =
              (m.nv_ptm && String(m.nv_ptm)) || m.nv_orange || m.nv_farmapack || m.varios || '?',
            pe = m.nv_ptm
              ? 'PTM'
              : m.nv_orange
                ? 'Orange'
                : m.nv_farmapack
                  ? 'Farmapack'
                  : 'Varios',
            j = m.urgente === !0 || String(m.urgente) === 'true',
            b = M(m.fecha_estado),
            H = M(m.fecha_aprobacion),
            Y = M(m.fecha_aprobacion_real),
            J = Y || H,
            ue = m.fecha_compromiso || V(m.fecha_aprobacion, m.fecha_aprobacion_real),
            Z = {
              nv: w,
              canal: pe,
              cliente: m.cliente || '—',
              vendedor: m.vendedor || '—',
              transportista: m.transportista || '—',
              fecha_compromiso: M(ue),
              fecha_estado: b,
              fecha_despacho: M(m.fecha_despacho),
              fecha_entregado: M(m.fecha_entregado),
              fecha_aprobacion: H,
              fecha_aprobacion_real: Y,
              fecha_aprob_efectiva: J,
              diasEnEstado: l(b),
              diasDesdeAprobacion: l(J),
              urgente: j
            };
          (u[D] || (u[D] = []), u[D].push(Z));
          const W = [i.ENTREGADO, i.RECIBIDO_CONFORME, i.RECIBIDO_OBS].includes(D);
          (j && !W && s.push(Z), p++);
        });
        const O = R.filter((m) => {
          var D;
          return (((D = u[m]) == null ? void 0 : D.length) || 0) > 0;
        }).map((m) => ({
          estado: m,
          cantidad: u[m].length,
          nvs: u[m].sort((D, w) => (w.urgente ? 1 : 0) - (D.urgente ? 1 : 0))
        }));
        return Ie(ce, t, { estados: O, total: p, urgentes: s });
      })().catch((d) => {
        throw (ce.delete(t), d);
      });
      return Pe(ce, t, r);
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
  qa as E,
  ct as a,
  i as b,
  V as c,
  nt as d,
  Qa as e,
  ot as f,
  at as g,
  tt as h,
  st as i,
  Ya as j,
  Ja as k,
  ja as l,
  Za as m,
  Wa as n,
  et as o,
  Xa as p,
  M as s
};
