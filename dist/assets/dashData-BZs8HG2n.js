import { s as w, L as Ie } from './index-DpKQy1E-.js';
function M(a, o = '') {
  return a ? (typeof a == 'string' && a.length >= 10 ? a.slice(0, 10) : String(a)) : o;
}
function rt(a, o = '—') {
  if (!a) return o;
  const s = String(a).slice(0, 10),
    n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return n ? `${n[3]}-${n[2]}-${n[1]}` : String(a);
}
function lt() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}
function Ga(a, o) {
  const s = new Date(a + 'T12:00:00');
  s.setDate(s.getDate() + o);
  const n = s.getFullYear(),
    d = String(s.getMonth() + 1).padStart(2, '0'),
    r = String(s.getDate()).padStart(2, '0');
  return `${n}-${d}-${r}`;
}
function dt(a) {
  if (!a) return '245,124,0';
  const o = a.replace('#', ''),
    s = parseInt(o, 16);
  return isNaN(s) || o.length < 6 ? '245,124,0' : `${(s >> 16) & 255},${(s >> 8) & 255},${s & 255}`;
}
const u = {
    EN_PROCESO: 'En Proceso',
    SHIPPING: 'Shipping',
    EN_RUTA: 'En Ruta',
    ENTREGADO: 'Entregado',
    RECIBIDO_CONFORME: 'Recibido Conforme',
    RECIBIDO_OBS: 'Recibido C/OBS'
  },
  qe = {
    'EN PROCESO': u.EN_PROCESO,
    'EN SHIPPING': u.SHIPPING,
    'P / VENDEDOR': u.SHIPPING,
    'P / STOCK': u.EN_PROCESO,
    'P / RETIRO': u.SHIPPING,
    CURRIER: u.EN_RUTA,
    Currier: u.EN_RUTA,
    'EN RUTA': u.EN_RUTA,
    ENTREGADO: u.ENTREGADO,
    'RECIBIDO CONFORME': u.ENTREGADO,
    'RECIBIDO C/OBS': u.ENTREGADO,
    'Recibido Conforme': u.ENTREGADO,
    'Recibido C/OBS': u.ENTREGADO
  };
function ft(a) {
  return a ? qe[a] || a : '';
}
const pt = {
  [u.EN_PROCESO]: '#f59e0b',
  [u.SHIPPING]: '#8b5cf6',
  [u.EN_RUTA]: '#06b6d4',
  [u.ENTREGADO]: '#22c55e',
  [u.RECIBIDO_CONFORME]: '#16a34a',
  [u.RECIBIDO_OBS]: '#15803d'
};
function Ua(a, o) {
  const s = new Date(a);
  let n = 0;
  const d = s.getDay();
  for (d === 0 ? s.setDate(s.getDate() + 1) : d === 6 && s.setDate(s.getDate() + 2); n < o;) {
    s.setDate(s.getDate() + 1);
    const r = s.getDay();
    r !== 0 && r !== 6 && n++;
  }
  return s;
}
function z(a, o) {
  const s = o || a;
  if (!s) return '';
  const n = new Date(s + 'T12:00:00');
  if (isNaN(n.getTime())) return '';
  const d = Ua(n, 2),
    r = d.getFullYear(),
    f = String(d.getMonth() + 1).padStart(2, '0'),
    c = String(d.getDate()).padStart(2, '0');
  return `${r}-${f}-${c}`;
}
const W = '2026-07-20',
  ut = '20 Jul 2026',
  q = 'tms_operaciones_vigentes',
  Ha = 60 * 1e3,
  za = 45 * 1e3,
  Ba = 2 * 60 * 1e3,
  Ze = 'cco:panel-dashboard:v2:',
  Va = 15 * 1e3,
  Ka = 10 * 1e3;
let y = { ts: 0, data: null, promise: null };
const K = new Map(),
  re = new Map(),
  le = new Map();
function Xe(a, o) {
  return !!a && Object.prototype.hasOwnProperty.call(a, 'value') && Date.now() - a.ts < o;
}
function ke(a, o, s) {
  const n = a.get(o);
  return n ? (n.promise ? n.promise : Xe(n, s) ? n.value : (a.delete(o), null)) : null;
}
function Le(a, o, s) {
  return (a.set(o, { ts: Date.now(), value: s }), s);
}
function $e(a, o, s) {
  return (a.set(o, { ts: Date.now(), promise: s }), s);
}
function ja(a) {
  if (typeof window > 'u' || !window.sessionStorage) return null;
  try {
    const o = window.sessionStorage.getItem(`${Ze}${a}`);
    if (!o) return null;
    const s = JSON.parse(o);
    return Xe(s, Ba) ? s.value : null;
  } catch {
    return null;
  }
}
function Ya(a, o) {
  if (!(typeof window > 'u' || !window.sessionStorage))
    try {
      window.sessionStorage.setItem(`${Ze}${a}`, JSON.stringify({ ts: Date.now(), value: o }));
    } catch {}
}
function Ja(a) {
  const o = Number((a == null ? void 0 : a.status) || (a == null ? void 0 : a.statusCode) || 0);
  return (
    [408, 429, 500, 502, 503, 504].includes(o) ||
    /network|fetch|timeout|connection pool|temporar/i.test(
      String((a == null ? void 0 : a.message) || a || '')
    )
  );
}
async function Qe(a, o = 3) {
  let s;
  for (let n = 0; n < o; n += 1)
    try {
      return await a();
    } catch (d) {
      if (((s = d), !Ja(d) || n === o - 1)) throw d;
      const r = 250 * 2 ** n + Math.floor(Math.random() * 100);
      (Ie.warn(d, {
        module: 'panel',
        screen: 'PanelDashboard',
        action: 'dashboard_retry',
        message: 'Reintento de carga del dashboard por error transitorio',
        attempt: n + 1,
        delayMs: r
      }),
        await new Promise((f) => setTimeout(f, r)));
    }
  throw s;
}
function We(a) {
  return Math.round(Math.max(0, performance.now() - a));
}
async function j(
  a,
  o,
  { screen: s = 'PanelDashboard', payload: n = null, slowMs: d = 1200, message: r = '' } = {}
) {
  const f = performance.now();
  try {
    const c = await o(),
      l = We(f);
    return (
      l >= d &&
        Ie.performance({
          module: 'panel',
          screen: s,
          action: a,
          message: r || `Operacion lenta del dashboard: ${a}`,
          durationMs: l,
          status: 'ok',
          payload: n
        }),
      c
    );
  } catch (c) {
    throw (
      Ie.error(c, {
        module: 'panel',
        screen: s,
        action: a,
        message: `Fallo operacion de dashboard: ${a}`,
        durationMs: We(f),
        status: 'error',
        payload: n
      }),
      c
    );
  }
}
function I(a) {
  return a.fecha_aprobacion_real || a.fecha_aprobacion || null;
}
function ea(a, o, s) {
  if (!o || !s) return !0;
  const n = I(a);
  if (!n) return !1;
  const d = String(n).slice(0, 10);
  return d >= o && d <= s;
}
function Pe(a, o) {
  if (!a || !o) return null;
  const s = new Date(a).getTime(),
    n = new Date(o).getTime();
  if (isNaN(s) || isNaN(n)) return null;
  const d = (n - s) / (1e3 * 60 * 60 * 24);
  return d < 0 || d > 365 ? null : d;
}
function Wa(a) {
  const s = [
    { nombre: 'En Proceso → Shipping', from: (l) => I(l), to: (l) => l.fecha_shipping },
    { nombre: 'Shipping → En Ruta', from: (l) => l.fecha_shipping, to: (l) => l.fecha_en_ruta },
    { nombre: 'En Ruta → Entregado', from: (l) => l.fecha_en_ruta, to: (l) => l.fecha_entregado }
  ].map((l) => {
    let m = 0,
      _ = 0;
    return (
      a.forEach((S) => {
        const i = Pe(l.from(S), l.to(S));
        i !== null && ((m += i), _++);
      }),
      { nombre: l.nombre, dias: _ > 0 ? +(m / _).toFixed(1) : null, n: _ }
    );
  });
  let n = 0,
    d = 0;
  a.forEach((l) => {
    const m = l.fecha_entregado || l.fecha_despacho,
      _ = Pe(I(l), m);
    _ !== null && ((n += _), d++);
  });
  const r = d > 0 ? +(n / d).toFixed(1) : null,
    f = s.filter((l) => l.dias !== null),
    c = f.length > 0 ? f.reduce((l, m) => (m.dias > l.dias ? m : l)) : null;
  return {
    etapas: s,
    leadTimeTotal: r,
    leadTimeTotalN: d,
    cuelloBotella: c ? { nombre: c.nombre, dias: c.dias } : null
  };
}
const de = ['NULA', 'REFACTURADO', 'RECHAZADO'];
function B(a) {
  return a && (qe[a] || a);
}
const fe = [u.EN_PROCESO],
  A = [u.EN_PROCESO, u.SHIPPING, u.EN_RUTA],
  qa = [u.EN_RUTA, u.ENTREGADO],
  N = [u.ENTREGADO],
  J = [u.EN_PROCESO, u.SHIPPING, u.EN_RUTA, u.ENTREGADO],
  Za = [...J, 'NULA', 'REFACTURADO', 'RECHAZADO'];
function Xa(a) {
  return a.fecha_shipping || a.fecha_en_ruta || a.fecha_entregado || a.fecha_despacho || null;
}
function b(a) {
  const o = a.fecha_compromiso || z(a.fecha_aprobacion, a.fecha_aprobacion_real);
  if (!o) return null;
  const s = I(a),
    n = Math.ceil(Math.max(0, Number(a.shipping_pausa_total_segundos) || 0) / 86400),
    d = (c) => (n > 0 ? Ga(String(c).slice(0, 10), n) : String(c).slice(0, 10));
  if (!s) return { fecha: d(o), diasAtraso: 0, pausaDias: n };
  const r = new Date(o).getTime(),
    f = new Date(s).getTime();
  if (f > r) {
    const c = Math.round((f - r) / 864e5);
    return { fecha: d(s.split('T')[0]), diasAtraso: c, pausaDias: n };
  }
  return { fecha: d(o), diasAtraso: 0, pausaDias: n };
}
function U(a) {
  return (
    !!(a != null && a.shipping_subestado) &&
    (a == null ? void 0 : a.shipping_pausa_elegible_sla) === !0
  );
}
function pe(a, o) {
  if (de.includes(a.estado || '') || U(a)) return null;
  const s = b(a);
  if (!s) return null;
  const n = new Date(s.fecha + 'T23:59:59').getTime();
  if (fe.includes(a.estado || '')) return o > n ? !1 : null;
  const d = Xa(a);
  return d ? new Date(d).getTime() <= n : null;
}
function H(a) {
  const o = new Date(a + 'T12:00:00');
  if (isNaN(o.getTime())) return '';
  const s = o.getDay(),
    n = o.getDate() - s + (s === 0 ? -6 : 1),
    d = new Date(o.getFullYear(), o.getMonth(), n);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}
function Qa(a) {
  const o = new Date(`${a}T12:00:00`),
    s = new Date(o);
  s.setDate(o.getDate() + 6);
  const n = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    d = String(o.getDate()).padStart(2, '0'),
    r = String(s.getDate()).padStart(2, '0'),
    f = n[o.getMonth()],
    c = n[s.getMonth()];
  return f === c ? `${d}–${r} ${f}` : `${d} ${f}–${r} ${c}`;
}
function et(a, o, s = Date.now()) {
  const n = {},
    d = (r) => (
      n[r] ||
        (n[r] = { aprobadas: 0, entregadas: 0, tardanza: [], fillrateOk: 0, fillrateTotal: 0 }),
      n[r]
    );
  return (
    a.forEach((r) => {
      const f = I(r);
      if (!f) return;
      const c = String(f).slice(0, 10);
      if (c < W) return;
      const l = H(c);
      if (!l) return;
      const m = d(l);
      m.aprobadas += 1;
      const _ = pe(r, s);
      if ((_ !== null && ((m.fillrateTotal += 1), _ && (m.fillrateOk += 1)), r.fecha_despacho)) {
        const S = b(r);
        if (S) {
          const i = (new Date(r.fecha_despacho).getTime() - new Date(S.fecha).getTime()) / 864e5;
          i > 0 && i <= 30 && m.tardanza.push(i);
        }
      }
    }),
    o.forEach((r) => {
      if (!r.fecha_entregado) return;
      const f = String(r.fecha_entregado).slice(0, 10);
      if (f < W) return;
      const c = H(f);
      c && (d(c).entregadas += 1);
    }),
    Object.entries(n)
      .sort(([r], [f]) => r.localeCompare(f))
      .map(([r, f]) => {
        const c =
            f.tardanza.length > 0
              ? +(f.tardanza.reduce((m, _) => m + _, 0) / f.tardanza.length).toFixed(1)
              : 0,
          l = f.fillrateTotal > 0 ? +((f.fillrateOk / f.fillrateTotal) * 100).toFixed(1) : 0;
        return {
          semana: Qa(r),
          semanaInicio: r,
          aprobadas: f.aprobadas,
          entregadas: f.entregadas,
          aprobadasDia: +(f.aprobadas / 5).toFixed(1),
          entregadasDia: +(f.entregadas / 5).toFixed(1),
          balanceCola: f.entregadas - f.aprobadas,
          tardanza: c,
          fillRate: l
        };
      })
  );
}
function at(a) {
  if (!a) return 0;
  const o = Date.now() - new Date(a).getTime();
  return Number.isNaN(o) ? 0 : o / (1e3 * 60 * 60);
}
function tt(a, o = '') {
  const s = `${a || ''} ${o || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return s.includes('direccion') || s.includes('domicilio') || s.includes('contacto')
    ? 'direccion'
    : s.includes('transport') ||
        s.includes('courier') ||
        s.includes('currier') ||
        s.includes('ruta') ||
        s.includes('flete')
      ? 'transporte'
      : 'otro';
}
const ye =
    'nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,division,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_en_proceso,incidencia,estado_incidencia,observaciones_incidencia,dias_incidencia,guia,factura,urgente,reabierta,motivo_reapertura,fecha_reapertura,shipping_subestado,shipping_pausa_desde,shipping_pausa_motivo,shipping_pausa_total_segundos,shipping_pausa_elegible_sla,incidencia_area,incidencia_origen',
  nt = 'nv_ptm,nv_orange,nv_farmapack,varios,fecha_entregado';
async function ue(a, o, s) {
  const n = [];
  let d = 0;
  const r = 1e3;
  for (;;) {
    let f = w
      .from(q)
      .select(a)
      .order('id', { ascending: !0 })
      .range(d, d + r - 1);
    o && s
      ? (f = f.or(
          `and(fecha_aprobacion_real.gte.${o},fecha_aprobacion_real.lte.${s}),and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${o},fecha_aprobacion.lte.${s})`
        ))
      : o
        ? (f = f.or(
            `fecha_aprobacion_real.gte.${o},and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${o})`
          ))
        : s &&
          (f = f.or(
            `fecha_aprobacion_real.lte.${s},and(fecha_aprobacion_real.is.null,fecha_aprobacion.lte.${s})`
          ));
    const { data: c, error: l } = await f;
    if (l) throw l;
    if (!c || c.length === 0 || (n.push(...c), c.length < r)) break;
    d += r;
  }
  return n;
}
async function ot(a, o, s, n) {
  if (!new Set(['fecha_entregado']).has(o)) throw new Error('Columna de evento no permitida.');
  const r = [];
  let f = 0;
  const c = 1e3;
  for (;;) {
    let l = w
      .from(q)
      .select(a)
      .not(o, 'is', null)
      .order(o, { ascending: !0 })
      .order('id', { ascending: !0 })
      .range(f, f + c - 1);
    (s && (l = l.gte(o, s)), n && (l = l.lte(o, n)));
    const { data: m, error: _ } = await l;
    if (_) throw _;
    if (!m || m.length === 0 || (r.push(...m), m.length < c)) break;
    f += c;
  }
  return r;
}
const st = [
  u.EN_PROCESO,
  'EN PROCESO',
  'P / VENDEDOR',
  'P / STOCK',
  'P / RETIRO',
  u.SHIPPING,
  'SHIPPING',
  'EN SHIPPING',
  'Currier',
  'CURRIER',
  u.EN_RUTA,
  'EN RUTA'
];
function Me(a) {
  const o = a.nv_ptm ? 'ptm' : a.nv_orange ? 'orange' : a.nv_farmapack ? 'farmapack' : 'varios',
    s = a.nv_ptm ? String(a.nv_ptm) : a.nv_orange || a.nv_farmapack || a.varios || '';
  return `${o}:${s}`;
}
async function _e(a) {
  const o = [];
  let s = 0;
  const n = 1e3;
  for (;;) {
    const { data: d, error: r } = await w
      .from(q)
      .select(a)
      .in('estado', st)
      .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
      .order('id', { ascending: !1 })
      .range(s, s + n - 1);
    if (r) throw r;
    if (!d || d.length === 0 || (o.push(...d), d.length < n)) break;
    s += n;
  }
  return o;
}
async function aa() {
  return j(
    'fetch_consolidado_keys',
    async () => {
      const a = Date.now();
      if (y.data && a - y.ts < Ha) return y.data;
      if (y.promise) return y.promise;
      const o = async () => {
        const { data: s, error: n } = await w.from('tms_consolidado_nvs').select('nv, canal'),
          d = n ? new Set() : new Set((s || []).map((r) => `${r.canal || 'ptm'}:${r.nv}`));
        return ((y = { ts: Date.now(), data: d, promise: null }), d);
      };
      return (
        (y.promise = o().catch((s) => {
          throw ((y.promise = null), s);
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
async function _t(a, o, { force: s = !1 } = {}) {
  return j(
    'fetch_dashboard_data',
    async () => {
      const n = `${a || ''}:${o || ''}`;
      if (s) K.delete(n);
      else {
        const f = ke(K, n, za);
        if (f) return f;
        const c = ja(n);
        if (c) return (K.set(n, { ts: Date.now(), value: c }), c);
      }
      const r = Qe(async () => {
        const f = !a || a < W ? W : a,
          c = !o || o >= W,
          [l, m, _, S] = await Promise.all([
            ue(ye, a, o),
            _e(ye),
            c ? ot(nt, 'fecha_entregado', f, o) : Promise.resolve([]),
            aa()
          ]),
          i = (e) => {
            ((e.estado = B(e.estado)),
              (e._consolidado = S.has(Me(e))),
              e.fecha_compromiso ||
                (e.fecha_compromiso = z(e.fecha_aprobacion, e.fecha_aprobacion_real) || null));
          };
        (m.forEach(i),
          l.forEach(i),
          _.forEach((e) => {
            e._consolidado = S.has(Me(e));
          }));
        const D = m,
          h = D.filter((e) => ea(e, a, o)),
          E = l.filter((e) => !e._consolidado),
          T = D.filter((e) => !e._consolidado),
          k = _.filter((e) => !e._consolidado),
          O = l.length,
          L = l.filter((e) => e.nv_ptm).length,
          Z = l.filter((e) => e.nv_orange).length,
          X = l.filter((e) => e.nv_farmapack).length,
          Q = l.filter((e) => e.varios).length,
          R = {};
        (l.forEach((e) => {
          const t = e.estado || 'null';
          R[t] = (R[t] || 0) + 1;
        }),
          A.forEach((e) => {
            R[e] = 0;
          }),
          h.forEach((e) => {
            const t = e.estado || 'null';
            R[t] = (R[t] || 0) + 1;
          }));
        const Y = l.filter((e) => N.includes(e.estado)).length,
          he = R.NULA || 0,
          oa = R.REFACTURADO || 0,
          sa = R.RECHAZADO || 0,
          ia = D.filter((e) => !U(e)).length,
          Fe = O - he - oa - sa,
          ca = Fe > 0 ? ((Y / Fe) * 100).toFixed(1) : '0',
          ra = E.filter((e) => N.includes(e.estado) && e.fecha_despacho && e.fecha_compromiso);
        let xe = 0,
          ee = 0,
          ge = 0;
        ra.forEach((e) => {
          const t = b(e);
          if (!t) return;
          const p = new Date(e.fecha_despacho),
            g = new Date(t.fecha),
            v = (p.getTime() - g.getTime()) / (1e3 * 60 * 60 * 24);
          Math.abs(v) > 30 || (v > 0 ? ((xe += v), ee++) : ge++);
        });
        const la = ee > 0 ? (xe / ee).toFixed(1) : '0',
          Ge = ee + ge,
          da = Ge > 0 ? ((ge / Ge) * 100).toFixed(0) : '0',
          fa = (e) => {
            const t = String((e == null ? void 0 : e.incidencia) || '').trim(),
              p = String((e == null ? void 0 : e.estado_incidencia) || '')
                .trim()
                .toUpperCase();
            return t.length > 0 && p !== 'RESUELTA';
          },
          Ue = E.filter(fa),
          pa = Ue.length,
          He = Date.now();
        let ae = 0,
          me = 0;
        E.forEach((e) => {
          const t = pe(e, He);
          t === !0 ? ae++ : t === !1 && me++;
        });
        const Ee = ae + me,
          ua = {
            pct: Ee > 0 ? ((ae / Ee) * 100).toFixed(1) : null,
            cumple: ae,
            noCumple: me,
            evaluables: Ee
          },
          _a = new Date().toISOString().split('T')[0],
          ha = H(_a),
          ga = Date.now(),
          ze = E.filter((e) => {
            if (!e.fecha_registro_nv || de.includes(e.estado || '')) return !1;
            const t =
              typeof e.fecha_registro_nv == 'string'
                ? e.fecha_registro_nv.split('T')[0]
                : new Date(e.fecha_registro_nv).toISOString().split('T')[0];
            return H(t) === ha;
          });
        let te = 0,
          ne = 0;
        ze.forEach((e) => {
          if (U(e)) return;
          const t = b(e);
          if (!t) return;
          const p = new Date(t.fecha + 'T23:59:59').getTime();
          if (fe.includes(e.estado)) ga > p && ne++;
          else {
            const g = e.fecha_shipping || e.fecha_en_ruta || e.fecha_entregado;
            g && (new Date(g).getTime() <= p ? te++ : ne++);
          }
        });
        const ve = te + ne,
          ma = {
            pct: ve > 0 ? ((te / ve) * 100).toFixed(1) : null,
            cumple: te,
            noCumple: ne,
            evaluables: ve,
            totalSemana: ze.filter((e) => !U(e)).length
          },
          oe = T.filter((e) => !!e.shipping_subestado),
          Ea = {
            total: O,
            countNvPtm: L,
            nvVarios: Q,
            nvOrange: Z,
            nvFarmapack: X,
            estadoCounts: R,
            entregadas: Y,
            activas: ia,
            tasaEntrega: ca,
            leadTimeTardanza: la,
            pctAtiempo: da,
            incidencias: pa,
            fillRateShipping: ua,
            cumplimientoNV: ma,
            shippingPausadas: {
              total: oe.length,
              excluidasSla: oe.filter(U).length,
              rezagadaComercial: oe.filter((e) => e.shipping_subestado === 'REZAGADA_COMERCIAL')
                .length,
              retiroCliente: oe.filter((e) => e.shipping_subestado === 'RETIRO_CLIENTE').length
            }
          },
          $ = {},
          Be = (e) => {
            const t = e.estado || 'null';
            ($[t] || ($[t] = { farmapack: 0, orange: 0, ptm: 0, varios: 0, total: 0 }),
              e.nv_farmapack && $[t].farmapack++,
              e.nv_orange && $[t].orange++,
              e.nv_ptm && $[t].ptm++,
              e.varios && $[t].varios++,
              $[t].total++);
          };
        (l.forEach((e) => {
          A.includes(e.estado || '') || Be(e);
        }),
          h.forEach((e) => {
            A.includes(e.estado || '') && Be(e);
          }));
        const va = Object.entries($)
            .map(([e, t]) => ({ estado: e, ...t }))
            .filter((e) => J.includes(e.estado))
            .sort((e, t) => J.indexOf(e.estado) - J.indexOf(t.estado)),
          Se = {};
        l.forEach((e) => {
          const t = e.division || 'SIN DIVISIÓN';
          Se[t] = (Se[t] || 0) + 1;
        });
        const Sa = Object.entries(Se)
            .map(([e, t]) => ({ division: e, cantidad: t }))
            .sort((e, t) => t.cantidad - e.cantidad),
          De = {};
        l.forEach((e) => {
          const t = e.transportista || 'SIN TRANSPORTISTA';
          De[t] = (De[t] || 0) + 1;
        });
        const Da = Object.entries(De)
            .map(([e, t]) => ({ transportista: e, cantidad: t }))
            .sort((e, t) => t.cantidad - e.cantidad),
          ba = et(E, k, He),
          be = {};
        h.forEach((e) => {
          A.includes(e.estado || '') && (be[e.estado] = (be[e.estado] || 0) + 1);
        });
        const Ta = Object.entries(be)
            .map(([e, t]) => ({ estado: e, count: t }))
            .sort((e, t) => t.count - e.count),
          V = {};
        E.forEach((e) => {
          if (!N.includes(e.estado) || !e.fecha_despacho || !e.fecha_compromiso) return;
          const t = I(e);
          if (!t) return;
          const p = H(t);
          if (!p) return;
          V[p] || (V[p] = { tardanzaSum: 0, tardanzaCount: 0, atiempoCount: 0 });
          const g = b(e);
          if (!g) return;
          const v = new Date(e.fecha_despacho),
            G = new Date(g.fecha),
            C = (v.getTime() - G.getTime()) / (1e3 * 60 * 60 * 24);
          Math.abs(C) > 30 ||
            (C > 0 ? ((V[p].tardanzaSum += C), V[p].tardanzaCount++) : V[p].atiempoCount++);
        });
        const Aa = Object.entries(V)
            .sort(([e], [t]) => e.localeCompare(t))
            .map(([e, t]) => {
              const p = new Date(e + 'T12:00:00'),
                g = Math.ceil(
                  ((p.getTime() - new Date(p.getFullYear(), 0, 1).getTime()) / 864e5 + 1) / 7
                ),
                v = t.tardanzaCount + t.atiempoCount;
              return {
                semana: `Semana ${g}`,
                dias: t.tardanzaCount > 0 ? +(t.tardanzaSum / t.tardanzaCount).toFixed(1) : 0,
                count: v,
                pctAtiempo: v > 0 ? +((t.atiempoCount / v) * 100).toFixed(0) : 0
              };
            }),
          Oa = A,
          Ve = new Date();
        Ve.setHours(0, 0, 0, 0);
        const Na = Ve.getTime(),
          Ra = 1e3 * 60 * 60 * 24;
        let Te = 0,
          Ae = 0,
          Oe = 0;
        const Ne = [];
        (T.forEach((e) => {
          if (U(e) || !Oa.includes(e.estado || '')) return;
          const t = b(e);
          if (!t) return;
          const p = new Date(t.fecha + 'T12:00:00');
          p.setHours(0, 0, 0, 0);
          const g = Math.round((p.getTime() - Na) / Ra);
          g > 1 ||
            (g < 0 ? Te++ : g === 0 ? Ae++ : g === 1 && Oe++,
            Ne.push({
              nv:
                (e.nv_ptm && String(e.nv_ptm)) || e.nv_orange || e.nv_farmapack || e.varios || '—',
              cliente: e.cliente || '—',
              vendedor: e.vendedor || '—',
              transportista: e.transportista || '—',
              estado: e.estado || '—',
              division: e.division || '—',
              fecha_compromiso: e.fecha_compromiso,
              diasVencido: -g
            }));
        }),
          Ne.sort((e, t) => t.diasVencido - e.diasVencido));
        const Ca = { vencidos: Te, hoy: Ae, manana: Oe, total: Te + Ae + Oe, detalle: Ne },
          Re = {},
          P = (e) => {
            Re[e] = (Re[e] || 0) + 1;
          },
          se = [];
        (l.forEach((e) => {
          const t = [],
            p = String(e.estado || '').trim(),
            g = de.includes(p);
          p
            ? Za.includes(p) || (t.push(`Estado no reconocido: "${p}"`), P('Estado no reconocido'))
            : (t.push('Sin estado'), P('Sin estado'));
          const v = N.includes(p);
          if (!g && !v) {
            (e.cliente || (t.push('Sin cliente'), P('Sin cliente')),
              e.vendedor || (t.push('Sin vendedor'), P('Sin vendedor')),
              e.division || (t.push('Sin división'), P('Sin división')),
              qa.includes(p) &&
                !e.transportista &&
                (t.push('Sin transportista'), P('Sin transportista')));
            const G = e.fecha_compromiso || z(e.fecha_aprobacion, e.fecha_aprobacion_real);
            A.includes(p) && !G && (t.push('Sin fecha compromiso'), P('Sin fecha compromiso'));
            const C = I(e);
            (C &&
              e.fecha_despacho &&
              new Date(e.fecha_despacho).getTime() < new Date(C).getTime() &&
              (t.push('Despacho anterior a la aprobación'), P('Fecha incoherente')),
              e.fecha_entregado &&
                e.fecha_despacho &&
                new Date(e.fecha_entregado).getTime() < new Date(e.fecha_despacho).getTime() &&
                (t.push('Entrega anterior al despacho'), P('Fecha incoherente')));
          }
          t.length > 0 &&
            se.push({
              nv:
                (e.nv_ptm && String(e.nv_ptm)) || e.nv_orange || e.nv_farmapack || e.varios || '—',
              cliente: e.cliente || '—',
              estado: p || '—',
              division: e.division || '—',
              vendedor: e.vendedor || '—',
              problemas: t
            });
        }),
          se.sort((e, t) => t.problemas.length - e.problemas.length));
        const wa = { total: se.length, porTipo: Re, detalle: se };
        let Ce = 0,
          ie = 0;
        E.forEach((e) => {
          if (!N.includes(e.estado) || !e.fecha_despacho || !e.fecha_compromiso) return;
          const t = b(e);
          if (!t) return;
          ie++;
          const p = new Date(e.fecha_despacho),
            g = new Date(t.fecha);
          p.getTime() <= g.getTime() && !0 && Ce++;
        });
        const Ia = { pct: ie > 0 ? +((Ce / ie) * 100).toFixed(1) : null, cumple: Ce, total: ie },
          F = {};
        E.forEach((e) => {
          const t = (e.transportista || '').trim();
          if (
            !(!t || t === 'SIN TRANSPORTISTA') &&
            (F[t] || (F[t] = { total: 0, entregadas: 0, aTiempo: 0, tardanzaSum: 0, tardanzaN: 0 }),
            F[t].total++,
            N.includes(e.estado) && (F[t].entregadas++, e.fecha_despacho && e.fecha_compromiso))
          ) {
            const p = b(e);
            if (p) {
              const g =
                (new Date(e.fecha_despacho).getTime() - new Date(p.fecha).getTime()) / 864e5;
              Math.abs(g) <= 30 &&
                (g <= 0 ? F[t].aTiempo++ : ((F[t].tardanzaSum += g), F[t].tardanzaN++));
            }
          }
        });
        const Pa = Object.entries(F)
            .map(([e, t]) => ({
              nombre: e,
              total: t.total,
              entregadas: t.entregadas,
              pctATiempo:
                t.aTiempo + t.tardanzaN > 0
                  ? +((t.aTiempo / (t.aTiempo + t.tardanzaN)) * 100).toFixed(0)
                  : null,
              tardanzaProm: t.tardanzaN > 0 ? +(t.tardanzaSum / t.tardanzaN).toFixed(1) : null
            }))
            .sort((e, t) => t.total - e.total)
            .slice(0, 10),
          x = {};
        E.forEach((e) => {
          const t = (e.vendedor || '').trim();
          if (
            !(!t || t === '—') &&
            (x[t] || (x[t] = { total: 0, entregadas: 0, aTiempo: 0, activas: 0, reabiertas: 0 }),
            x[t].total++,
            N.includes(e.estado) && x[t].entregadas++,
            A.includes(e.estado) && x[t].activas++,
            e.reabierta === !0 && x[t].reabiertas++,
            N.includes(e.estado) && e.fecha_despacho && e.fecha_compromiso)
          ) {
            const p = b(e);
            if (p) {
              const g =
                (new Date(e.fecha_despacho).getTime() - new Date(p.fecha).getTime()) / 864e5;
              g <= 0 && Math.abs(g) <= 30 && x[t].aTiempo++;
            }
          }
        });
        const Ke = Object.entries(
            Ue.reduce((e, t) => {
              const g = (t.vendedor || 'Sin vendedor').trim() || 'Sin vendedor';
              e[g] ||
                (e[g] = {
                  vendedor: g,
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
              const v = e[g];
              ((v.total += 1),
                v.clientes.add(t.cliente || 'Sin cliente'),
                t.transportista && v.transportistas.add(t.transportista));
              const G = tt(t.incidencia, t.observaciones_incidencia);
              (G === 'direccion'
                ? (v.direccion += 1)
                : G === 'transporte'
                  ? (v.transporte += 1)
                  : (v.otros += 1),
                (v.tipos[t.incidencia] = (v.tipos[t.incidencia] || 0) + 1));
              const C = t.fecha_aprobacion_real || t.fecha_aprobacion || t.fecha_estado,
                ce = at(C);
              (ce > 48 && (v.fuera48h += 1), ce > v.maxHoras && (v.maxHoras = ce));
              const Je = Number(t.dias_incidencia) || Math.max(0, Math.floor(ce / 24));
              return (Je > v.maxDias && (v.maxDias = Je), e);
            }, {})
          )
            .map(([, e]) => {
              var t;
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
                  ((t = Object.entries(e.tipos).sort((p, g) => g[1] - p[1])[0]) == null
                    ? void 0
                    : t[0]) || '—'
              };
            })
            .sort((e, t) => t.fuera48h - e.fuera48h || t.total - e.total || t.maxDias - e.maxDias)
            .slice(0, 12),
          ya = Ke.reduce((e, t) => ((e[t.vendedor] = t), e), {}),
          Ma = Object.entries(x)
            .map(([e, t]) => {
              const p = ya[e];
              return {
                nombre: e,
                total: t.total,
                entregadas: t.entregadas,
                activas: t.activas,
                reabiertas: t.reabiertas,
                pctATiempo:
                  t.entregadas > 0 ? +((t.aTiempo / t.entregadas) * 100).toFixed(0) : null,
                erroresActivos: (p == null ? void 0 : p.total) || 0,
                errores48h: (p == null ? void 0 : p.fuera48h) || 0,
                errorPrincipal: (p == null ? void 0 : p.topTipo) || '—'
              };
            })
            .sort(
              (e, t) =>
                t.errores48h - e.errores48h ||
                t.erroresActivos - e.erroresActivos ||
                t.reabiertas - e.reabiertas ||
                t.total - e.total
            )
            .slice(0, 10),
          ka = { [u.EN_PROCESO]: 3, [u.SHIPPING]: 2, [u.EN_RUTA]: 3, [u.ENTREGADO]: 5 },
          je = [],
          La = Date.now();
        A.forEach((e) => {
          const t = ka[e] || 5,
            p = [];
          (m.forEach((g) => {
            if (g.estado !== e || g._consolidado || U(g)) return;
            const v = g.fecha_estado || g.fecha_registro_nv;
            if (!v) return;
            if ((La - new Date(v).getTime()) / (1e3 * 60 * 60 * 24) > t) {
              const C =
                (g.nv_ptm && String(g.nv_ptm)) || g.nv_orange || g.nv_farmapack || g.varios || '?';
              p.push(C);
            }
          }),
            p.length > 0 && je.push({ estado: e, cantidad: p.length, nvs: p.slice(0, 5) }));
        });
        const $a = je,
          Fa = [
            { etapa: u.EN_PROCESO, incluye: [...fe, u.SHIPPING, u.EN_RUTA, u.ENTREGADO] },
            { etapa: u.SHIPPING, incluye: [u.SHIPPING, u.EN_RUTA, u.ENTREGADO] },
            { etapa: u.EN_RUTA, incluye: [u.EN_RUTA, u.ENTREGADO] },
            { etapa: u.ENTREGADO, incluye: [u.ENTREGADO] }
          ].map(({ etapa: e, incluye: t }) => {
            let p = 0;
            return (
              l.forEach((g) => {
                t.includes(g.estado || '') && p++;
              }),
              h.forEach((g) => {
                A.includes(g.estado || '') && t.includes(g.estado || '') && p++;
              }),
              { etapa: e, cantidad: p }
            );
          }),
          we = {};
        l.forEach((e) => {
          const t = e.estado || 'Sin estado';
          if (!J.includes(t)) return;
          const p = (e.transportista || '').trim() || 'Sin transportista',
            g = `${t}|||${p}`;
          we[g] = (we[g] || 0) + 1;
        });
        const xa = Object.entries(we)
            .map(([e, t]) => {
              const [p, g] = e.split('|||');
              return { estado: p, transportista: g, cantidad: t };
            })
            .sort((e, t) => t.cantidad - e.cantidad),
          Ye = {
            kpis: Ea,
            estadoTable: va,
            divisions: Sa,
            transportistas: Da,
            weeklyTrend: ba,
            estadoResumen: Ta,
            leadTimeSemanal: Aa,
            alertas: Ca,
            calidad: wa,
            tiemposCiclo: Wa(E),
            otif: Ia,
            rankingTransportistas: Pa,
            rankingVendedores: Ma,
            incidenciasPorVendedor: Ke,
            alertasOperacionales: $a,
            funnelEstados: Fa,
            heatmapData: xa
          };
        return (Ya(n, Ye), Le(K, n, Ye));
      }).catch((f) => {
        throw (K.delete(n), f);
      });
      return $e(K, n, r);
    },
    {
      payload: { dateFrom: a || null, dateTo: o || null },
      slowMs: 1800,
      message: 'Carga principal de datos del dashboard del Panel'
    }
  );
}
async function ht(a, o) {
  return j(
    'fetch_dashboard_export_rows',
    async () =>
      (await Qe(() => ue(ye, a, o)))
        .map((n) => ({
          nv: (n.nv_ptm && String(n.nv_ptm)) || n.nv_orange || n.nv_farmapack || n.varios || '—',
          canal: n.nv_ptm
            ? 'PTM'
            : n.nv_orange
              ? 'Orange'
              : n.nv_farmapack
                ? 'Farmapack'
                : 'Varios',
          cliente: n.cliente || '—',
          vendedor: n.vendedor || '—',
          transportista: n.transportista || '—',
          estado: B(n.estado) || 'Sin estado',
          division: n.division || '—',
          tipo_despacho: n.tipo_despacho || '—',
          fecha_registro_nv: n.fecha_registro_nv || null,
          fecha_aprobacion: I(n),
          fecha_compromiso:
            n.fecha_compromiso || z(n.fecha_aprobacion, n.fecha_aprobacion_real) || null,
          fecha_shipping: n.fecha_shipping || null,
          fecha_en_ruta: n.fecha_en_ruta || null,
          fecha_despacho: n.fecha_despacho || null,
          fecha_entregado: n.fecha_entregado || null,
          guia: n.guia || '—',
          factura: n.factura || '—',
          urgente: n.urgente === !0 || String(n.urgente) === 'true',
          reabierta: n.reabierta === !0,
          motivo_reapertura: n.motivo_reapertura || '',
          fecha_reapertura: n.fecha_reapertura || null,
          incidencia: n.incidencia || '',
          estado_incidencia: n.estado_incidencia || '',
          observaciones_incidencia: n.observaciones_incidencia || '',
          shipping_subestado: n.shipping_subestado || '',
          shipping_pausa_desde: n.shipping_pausa_desde || null,
          shipping_pausa_motivo: n.shipping_pausa_motivo || '',
          shipping_pausa_elegible_sla: n.shipping_pausa_elegible_sla === !0
        }))
        .sort((n, d) =>
          String(d.fecha_aprobacion || '').localeCompare(String(n.fecha_aprobacion || ''))
        ),
    {
      payload: { dateFrom: a || null, dateTo: o || null },
      slowMs: 1600,
      message: 'Carga de detalle para exportación PDF del dashboard'
    }
  );
}
async function gt(a, o) {
  return j(
    'get_incidencias_activas',
    async () => {
      const s = `${a || ''}:${o || ''}`,
        n = ke(re, s, Va);
      if (n) return n;
      const r = (async () => {
        const f =
          'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, incidencia, estado_incidencia, observaciones_incidencia, dias_incidencia, fecha_aprobacion, fecha_aprobacion_real, incidencia_area, incidencia_origen, incidencia_reportada_at';
        if (!w) return [];
        const c = [];
        let l = 0;
        const m = 1e3;
        for (;;) {
          let _ = w
            .from(q)
            .select(f)
            .not('incidencia', 'is', null)
            .neq('estado_incidencia', 'RESUELTA')
            .order('id', { ascending: !0 })
            .range(l, l + m - 1);
          (a &&
            (_ = _.or(
              `fecha_aprobacion_real.gte.${a},and(fecha_aprobacion_real.is.null,fecha_aprobacion.gte.${a})`
            )),
            o &&
              (_ = _.or(
                `fecha_aprobacion_real.lte.${o},and(fecha_aprobacion_real.is.null,fecha_aprobacion.lte.${o})`
              )));
          const { data: S, error: i } = await _;
          if (i || !S || S.length === 0 || (c.push(...S), S.length < m)) break;
          l += m;
        }
        return Le(
          re,
          s,
          c
            .map((_) => ({
              nv:
                (_.nv_ptm && String(_.nv_ptm)) || _.nv_orange || _.nv_farmapack || _.varios || '—',
              fecha:
                _.incidencia_reportada_at || _.fecha_aprobacion_real || _.fecha_aprobacion || null,
              cliente: _.cliente || '—',
              vendedor: _.vendedor || '—',
              transportista: _.transportista || '—',
              estado: B(_.estado) || '—',
              incidencia: _.incidencia || '—',
              estado_incidencia: _.estado_incidencia || '—',
              observaciones: _.observaciones_incidencia || '—',
              area: _.incidencia_area || 'OPERACIONES',
              origen: _.incidencia_origen || 'OPERACION',
              reportada_at: _.incidencia_reportada_at || null,
              dias: _.dias_incidencia || 0
            }))
            .sort((_, S) => S.dias - _.dias)
        );
      })().catch((f) => {
        throw (re.delete(s), f);
      });
      return $e(re, s, r);
    },
    {
      payload: { dateFrom: a || null, dateTo: o || null },
      slowMs: 900,
      message: 'Carga de incidencias activas del dashboard'
    }
  );
}
async function mt(a, o, s) {
  return j(
    'get_operaciones_por_estado',
    async () => {
      const n =
          'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_despacho, fecha_compromiso, division, fecha_aprobacion, fecha_aprobacion_real, fecha_registro_nv, fecha_shipping, fecha_en_ruta, fecha_entregado, tipo_despacho, fecha_estado, reabierta, motivo_reapertura, fecha_reapertura, shipping_subestado, shipping_pausa_desde, shipping_pausa_hasta, shipping_pausa_motivo, shipping_pausa_total_segundos, shipping_pausa_elegible_sla',
        d = a === 'ACTIVAS',
        r = a === 'SHIPPING_PAUSADAS',
        f = d || r || A.includes(a),
        c = f ? await _e(n) : await ue(n, o, s),
        l = r ? await aa() : null,
        m = r ? c.filter((i) => !l.has(Me(i))) : c,
        _ = f && !d && !r ? m.filter((i) => ea(i, o, s)) : m;
      return (
        _.forEach((i) => {
          i.estado = B(i.estado);
        }),
        _.filter((i) => {
          if (a === 'ACTIVAS') return A.includes(i.estado || '');
          if (a === 'SHIPPING_PAUSADAS') return i.estado === u.SHIPPING && !!i.shipping_subestado;
          if (a === 'TARDIAS') {
            if (!N.includes(i.estado) || !i.fecha_despacho || !i.fecha_compromiso) return !1;
            const D = b(i);
            if (!D) return !1;
            const h =
              (new Date(i.fecha_despacho).getTime() - new Date(D.fecha).getTime()) /
              (1e3 * 60 * 60 * 24);
            return h > 0 && Math.abs(h) <= 30;
          }
          if (a === 'ATIEMPO') {
            if (!N.includes(i.estado) || !i.fecha_despacho || !i.fecha_compromiso) return !1;
            const D = b(i);
            if (!D) return !1;
            const h =
              (new Date(i.fecha_despacho).getTime() - new Date(D.fecha).getTime()) /
              (1e3 * 60 * 60 * 24);
            return h <= 0 && Math.abs(h) <= 30;
          }
          if (a === 'ENTREGADAS') return N.includes(i.estado);
          if (a === 'FILLRATE_CUMPLE') return pe(i, Date.now()) === !0;
          if (a === 'FILLRATE_NOCUMPLE') return pe(i, Date.now()) === !1;
          if (a === 'NVCUMPLE' || a === 'NVNOCUMPLE') {
            if (!i.fecha_registro_nv || de.includes(i.estado || '')) return !1;
            const D =
                typeof i.fecha_registro_nv == 'string'
                  ? i.fecha_registro_nv.split('T')[0]
                  : new Date(i.fecha_registro_nv).toISOString().split('T')[0],
              h = H(new Date().toISOString().split('T')[0]);
            if (H(D) !== h) return !1;
            const E = b(i);
            if (!E) return !1;
            const T = new Date(E.fecha + 'T23:59:59').getTime();
            if (fe.includes(i.estado)) return a === 'NVNOCUMPLE' && Date.now() > T;
            const k = i.fecha_shipping || i.fecha_en_ruta || i.fecha_entregado;
            if (!k) return !1;
            const O = new Date(k).getTime() <= T;
            return a === 'NVCUMPLE' ? O : !O;
          }
          return a === 'CANAL:PTM'
            ? !!i.nv_ptm
            : a === 'CANAL:ORANGE'
              ? !!i.nv_orange
              : a === 'CANAL:FARMAPACK'
                ? !!i.nv_farmapack
                : a === 'CANAL:VARIOS'
                  ? !!i.varios
                  : a === 'null' || a === 'SIN ESTADO'
                    ? !i.estado
                    : i.estado === a;
        })
          .map((i) => {
            let D = null;
            if (i.fecha_aprobacion && i.fecha_aprobacion_real) {
              const O = new Date(i.fecha_aprobacion),
                L = new Date(i.fecha_aprobacion_real);
              D = Math.round((L.getTime() - O.getTime()) / (1e3 * 60 * 60 * 24));
            }
            let h = null;
            const E = b(i),
              T = (E == null ? void 0 : E.fecha) || i.fecha_compromiso,
              k = (E == null ? void 0 : E.diasAtraso) || 0;
            if (i.fecha_despacho && T) {
              const O = new Date(i.fecha_despacho),
                L = new Date(T);
              h = Math.round((O.getTime() - L.getTime()) / (1e3 * 60 * 60 * 24));
            }
            return {
              nv:
                (i.nv_ptm && String(i.nv_ptm)) || i.nv_orange || i.nv_farmapack || i.varios || '—',
              cliente: i.cliente || '—',
              vendedor: i.vendedor || '—',
              transportista: i.transportista || '—',
              division: i.division || '—',
              fecha_registro_nv: i.fecha_registro_nv || null,
              fecha_aprobacion: i.fecha_aprobacion || null,
              fecha_aprobacion_real: i.fecha_aprobacion_real || null,
              dif_aprobacion: D,
              fecha_despacho: i.fecha_despacho || null,
              fecha_compromiso: i.fecha_compromiso || null,
              fecha_promesa_efectiva: T || null,
              dias_atraso_ingreso: k,
              dias_entrega: h,
              tipo_despacho: i.tipo_despacho || null,
              reabierta: i.reabierta === !0,
              motivo_reapertura: i.motivo_reapertura || '',
              fecha_reapertura: i.fecha_reapertura || null,
              estado: i.estado || '',
              shipping_subestado: i.shipping_subestado || '',
              shipping_pausa_desde: i.shipping_pausa_desde || null,
              shipping_pausa_hasta: i.shipping_pausa_hasta || null,
              shipping_pausa_motivo: i.shipping_pausa_motivo || '',
              shipping_pausa_total_segundos: Number(i.shipping_pausa_total_segundos) || 0,
              shipping_pausa_elegible_sla: i.shipping_pausa_elegible_sla === !0
            };
          })
          .sort((i, D) => (D.fecha_aprobacion || '').localeCompare(i.fecha_aprobacion || ''))
      );
    },
    {
      payload: { estado: a, dateFrom: o || null, dateTo: s || null },
      slowMs: 1100,
      message: 'Detalle de operaciones por estado en dashboard'
    }
  );
}
async function Et() {
  return { operadores: [], total: 0 };
}
async function vt(a = 6) {
  const o = new Date();
  o.setMonth(o.getMonth() - a);
  const s = o.toISOString().split('T')[0],
    d = await ue(
      'estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_entregado,fecha_estado,fecha_registro_nv,fecha_shipping,fecha_en_ruta,nv_ptm,nv_orange,nv_farmapack,varios,shipping_subestado,shipping_pausa_total_segundos,shipping_pausa_elegible_sla',
      s
    );
  d.forEach((c) => {
    ((c.estado = B(c.estado)),
      c.fecha_compromiso ||
        (c.fecha_compromiso = z(c.fecha_aprobacion, c.fecha_aprobacion_real) || null));
  });
  const r = {},
    f = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return (
    d.forEach((c) => {
      const l = I(c);
      if (!l) return;
      const m = new Date(l),
        _ = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
      r[_] ||
        (r[_] = {
          label: `${f[m.getMonth()]} ${m.getFullYear()}`,
          entregadas: 0,
          aTiempo: 0,
          totalEval: 0,
          otifCumple: 0,
          otifTotal: 0,
          ltSum: 0,
          ltN: 0,
          activas: 0
        });
      const S = r[_];
      if ((A.includes(c.estado) && S.activas++, N.includes(c.estado))) {
        if ((S.entregadas++, c.fecha_despacho && c.fecha_compromiso)) {
          const h = b(c);
          if (h) {
            const E = (new Date(c.fecha_despacho).getTime() - new Date(h.fecha).getTime()) / 864e5;
            Math.abs(E) <= 30 &&
              (S.totalEval++, E <= 0 && S.aTiempo++, S.otifTotal++, E <= 0 && S.otifCumple++);
          }
        }
        const i = c.fecha_entregado || c.fecha_despacho,
          D = Pe(I(c), i);
        D !== null && ((S.ltSum += D), S.ltN++);
      }
    }),
    Object.entries(r)
      .sort(([c], [l]) => c.localeCompare(l))
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
const ta =
  'nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,transportista,estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_despacho,fecha_facturacion,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,fecha_estado';
async function St(a = 25) {
  if (!w) return [];
  const { data: o, error: s } = await w
    .from(q)
    .select(ta)
    .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
    .limit(a);
  return s || !o ? [] : o.map((n) => na(n));
}
function na(a) {
  const o = M(a.fecha_compromiso) || z(M(a.fecha_aprobacion), M(a.fecha_aprobacion_real));
  return {
    ...a,
    estado: B(a.estado) || a.estado,
    fecha_compromiso: o || null,
    nv: a.nv_ptm ? String(a.nv_ptm) : a.nv_orange || a.nv_farmapack || a.varios || '—',
    fecha_entrega: a.fecha_entregado,
    fecha_creacion: a.fecha_registro_nv
  };
}
async function Dt(a, o = 'ptm', s = 60) {
  if (!w || !a) return [];
  const { data: n, error: d } = await w.rpc('nv_bitacora', {
    p_nv: String(a),
    p_canal: o ? String(o).toLowerCase() : null,
    p_limit: s
  });
  return d || !n
    ? []
    : n.map((r) => ({
        id: r.id,
        accion: r.accion,
        operador: r.operador || 'Sistema',
        campos: r.campos || '',
        estadoAnterior: r.estado_anterior,
        estadoNuevo: r.estado_nuevo,
        exito: r.exito !== !1,
        timestamp: r.ts
      }));
}
async function bt() {
  return (await _e(ta + ',fecha_estado')).map((o) => na(o));
}
async function Tt() {
  return j(
    'fetch_tv_estados',
    async () => {
      const a = 'default',
        o = ke(le, a, Ka);
      if (o) return o;
      const n = (async () => {
        const d = await _e(
            'nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, transportista, estado, fecha_compromiso, fecha_estado, fecha_despacho, fecha_entregado, fecha_aprobacion, fecha_aprobacion_real, urgente, shipping_subestado, shipping_pausa_desde, shipping_pausa_motivo, shipping_pausa_elegible_sla'
          ),
          r = Date.now(),
          f = 1e3 * 60 * 60 * 24,
          c = (h) => (h ? Math.floor((r - new Date(h + 'T12:00:00').getTime()) / f) : null),
          l = {},
          m = [];
        let _ = 0;
        const S = [u.ENTREGADO, u.RECIBIDO_CONFORME, u.RECIBIDO_OBS];
        d.forEach((h) => {
          const E = B(h.estado) || 'Sin estado';
          if (S.includes(E)) return;
          const T =
              (h.nv_ptm && String(h.nv_ptm)) || h.nv_orange || h.nv_farmapack || h.varios || '?',
            k = h.nv_ptm ? 'PTM' : h.nv_orange ? 'Orange' : h.nv_farmapack ? 'Farmapack' : 'Varios',
            O = h.urgente === !0 || String(h.urgente) === 'true',
            L = M(h.fecha_estado),
            Z = M(h.fecha_aprobacion),
            X = M(h.fecha_aprobacion_real),
            Q = X || Z,
            R = h.fecha_compromiso || z(h.fecha_aprobacion, h.fecha_aprobacion_real),
            Y = {
              nv: T,
              canal: k,
              cliente: h.cliente || '—',
              vendedor: h.vendedor || '—',
              transportista: h.transportista || '—',
              fecha_compromiso: M(R),
              fecha_estado: L,
              fecha_despacho: M(h.fecha_despacho),
              fecha_entregado: M(h.fecha_entregado),
              fecha_aprobacion: Z,
              fecha_aprobacion_real: X,
              fecha_aprob_efectiva: Q,
              diasEnEstado: c(L),
              diasDesdeAprobacion: c(Q),
              shippingSubestado: h.shipping_subestado || '',
              shippingPausaDesde: h.shipping_pausa_desde || '',
              shippingPausaMotivo: h.shipping_pausa_motivo || '',
              shippingPausaElegibleSla: h.shipping_pausa_elegible_sla === !0,
              urgente: O
            };
          (l[E] || (l[E] = []), l[E].push(Y));
          const he = [u.ENTREGADO, u.RECIBIDO_CONFORME, u.RECIBIDO_OBS].includes(E);
          (O && !he && m.push(Y), _++);
        });
        const D = A.filter((h) => {
          var E;
          return (((E = l[h]) == null ? void 0 : E.length) || 0) > 0;
        }).map((h) => ({
          estado: h,
          cantidad: l[h].length,
          nvs: l[h].sort((E, T) => (T.urgente ? 1 : 0) - (E.urgente ? 1 : 0))
        }));
        return Le(le, a, { estados: D, total: _, urgentes: m });
      })().catch((d) => {
        throw (le.delete(a), d);
      });
      return $e(le, a, n);
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
  pt as E,
  ut as W,
  Tt as a,
  u as b,
  z as c,
  St as d,
  _t as e,
  Dt as f,
  Et as g,
  vt as h,
  bt as i,
  W as j,
  lt as k,
  Ga as l,
  rt as m,
  ft as n,
  dt as o,
  mt as p,
  gt as q,
  ht as r,
  M as s
};
