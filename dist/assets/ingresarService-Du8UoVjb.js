import { s as p, L as k, w as U } from './index-puW0B3h7.js';
const C = 'tms_operaciones_vigentes',
  K = 'tms_operaciones',
  ce = 60 * 1e3,
  le = 5 * 60 * 1e3,
  ue = 20 * 1e3,
  de = 3 * 60 * 1e3,
  fe = 5 * 60 * 1e3,
  _e = 10 * 60 * 1e3;
let W = { ts: 0, data: null, promise: null },
  H = { ts: 0, data: null, promise: null },
  ae = { ts: 0, data: null, promise: null },
  te = { ts: 0, data: null, promise: null },
  E = { ts: 0, data: null, promise: null };
const b = new Map(),
  P = new Map(),
  V = new Map();
function re() {
  ((W = { ts: 0, data: null, promise: null }),
    (H = { ts: 0, data: null, promise: null }),
    (ae = { ts: 0, data: null, promise: null }),
    (te = { ts: 0, data: null, promise: null }),
    (E = { ts: 0, data: null, promise: null }),
    b.clear(),
    P.clear(),
    V.clear());
}
function pe(e, n) {
  return !!e && Object.prototype.hasOwnProperty.call(e, 'value') && Date.now() - e.ts < n;
}
function z(e, n, t) {
  const a = e.get(n);
  return a ? (a.promise ? a.promise : pe(a, t) ? a.value : (e.delete(n), null)) : null;
}
function D(e, n, t) {
  return (e.set(n, { ts: Date.now(), value: t }), t);
}
function X(e, n, t) {
  return (e.set(n, { ts: Date.now(), promise: t }), t);
}
function G(e) {
  return Math.round(Math.max(0, performance.now() - e));
}
function me(e) {
  const n = String(
    (e == null ? void 0 : e.message) || (e == null ? void 0 : e.details) || e || ''
  ).toLowerCase();
  return (
    (e == null ? void 0 : e.name) === 'AbortError' ||
    n.includes('request was aborted') ||
    n.includes('signal is aborted')
  );
}
function ge(e = {}) {
  return {
    id: (e == null ? void 0 : e.id) ?? null,
    mode: (e == null ? void 0 : e.mode) || null,
    canal: (e == null ? void 0 : e.canal) || null,
    nv: T((e == null ? void 0 : e.nv) || ''),
    estado: (e == null ? void 0 : e.estado) || null,
    urgente: (e == null ? void 0 : e.urgente) === !0,
    transportista: (e == null ? void 0 : e.transportista) || null,
    hasIncidencia: !!String((e == null ? void 0 : e.incidencia) || '').trim(),
    reabierta: (e == null ? void 0 : e.reabierta) === !0
  };
}
async function S(
  e,
  n,
  { screen: t = 'PanelIngresar', payload: a = null, slowMs: r = 900, message: o = '' } = {}
) {
  const c = performance.now();
  try {
    const s = await n(),
      i = G(c);
    return (
      i >= r &&
        k.performance({
          module: 'panel',
          screen: t,
          action: e,
          message: o || `Operacion lenta de lectura: ${e}`,
          durationMs: i,
          status: 'ok',
          payload: a
        }),
      s
    );
  } catch (s) {
    throw (
      me(s) ||
        k.error(s, {
          module: 'panel',
          screen: t,
          action: e,
          message: `Fallo operacion de lectura: ${e}`,
          durationMs: G(c),
          status: 'error',
          payload: a
        }),
      s
    );
  }
}
function ve(e) {
  return /timed out acquiring connection|connection pool/i.test(
    String((e == null ? void 0 : e.message) || e || '')
  );
}
async function j(e, { ms: n, label: t, attempts: a = 3, signal: r } = {}) {
  let o;
  for (let c = 0; c < a; c += 1) {
    if (
      ((o = await U(e(), { ms: n, label: t, signal: r })),
      !ve(o == null ? void 0 : o.error) || c === a - 1)
    )
      return o;
    const s = 180 * 2 ** c + Math.floor(Math.random() * 70);
    (k.warn(o.error, {
      module: 'panel',
      screen: 'PanelIngresar',
      action: 'pool_acquire_retry',
      message: `Reintento de lectura por saturación transitoria del pool: ${t}`,
      attempt: c + 1,
      delayMs: s
    }),
      await new Promise((i) => setTimeout(i, s)));
  }
  return o;
}
async function $(e, n, { screen: t = 'PanelIngresar', payload: a = null, message: r = '' } = {}) {
  const o = performance.now();
  try {
    const c = await n(),
      s = G(o);
    return (c == null ? void 0 : c.ok) === !1
      ? (k.error(new Error(c.error || c.message || `Operacion fallida: ${e}`), {
          module: 'panel',
          screen: t,
          action: e,
          message: `Operacion fallida: ${e}`,
          durationMs: s,
          status: 'failed',
          payload: a,
          context: { result: c }
        }),
        c)
      : (k.audit({
          module: 'panel',
          screen: t,
          action: e,
          message: r || `Operacion ejecutada: ${e}`,
          durationMs: s,
          status: 'ok',
          payload: a
        }),
        c);
  } catch (c) {
    throw (
      k.error(c, {
        module: 'panel',
        screen: t,
        action: e,
        message: `Fallo operacion critica: ${e}`,
        durationMs: G(o),
        status: 'error',
        payload: a
      }),
      c
    );
  }
}
const De = [
    { value: 'ptm', label: 'PTM', color: '#ea580c' },
    { value: 'orange', label: 'Orange', color: '#f59e0b' },
    { value: 'farmapack', label: 'Farmapack', color: '#0f766e' },
    { value: 'varios', label: 'Varios', color: '#4f46e5' }
  ],
  $e = ['N.V ANTICIPADA', 'DEMO', 'REGALO', 'BOLETA', 'GUÍA SALIDA'],
  Me = ['PROBLEMAS DE DIRECCIÓN', 'PROBLEMAS DE TRANSPORTE', 'OTRO'],
  Le = ['ABIERTA', 'EN GESTIÓN', 'RESUELTA'],
  he = ['En Proceso', 'Shipping', 'Currier', 'En Ruta', 'Entregado'],
  J = ['En Proceso', 'Shipping', 'Currier', 'En Ruta'],
  Ae = ['Courier - Inyección', 'Directo', 'Courier (Retiro / Pick-up)'],
  Ee = {
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
  Ve = (e) => Ee[e] || '#9ca3af',
  Fe = '#ea580c',
  w = (e) => (e ? String(e).slice(0, 10) : ''),
  T = (e) => {
    const n = String(e ?? '').trim();
    return /^\d+\.0+$/.test(n) ? n.split('.')[0] : n;
  },
  N = (e) =>
    String(e || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase(),
  O = (e) =>
    N(e)
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  Ce = new Set(['de', 'del', 'la', 'las', 'los']),
  Q = (e) =>
    O(e)
      .split(' ')
      .filter((n) => n && !Ce.has(n)),
  Oe = (e) =>
    e === 'ptm'
      ? 'nv_ptm'
      : e === 'orange'
        ? 'nv_orange'
        : e === 'farmapack'
          ? 'nv_farmapack'
          : 'varios',
  y = (e) => (e.nv_ptm ? 'ptm' : e.nv_orange ? 'orange' : e.nv_farmapack ? 'farmapack' : 'varios'),
  M = (e) => (e.nv_ptm ? String(e.nv_ptm) : e.nv_orange || e.nv_farmapack || e.varios || ''),
  qe = (e) => N(e).includes('orange'),
  I =
    'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,estado,transportista,fecha_compromiso,guia,factura,fecha_aprobacion,fecha_aprobacion_real,urgente,fecha_estado,reabierta,motivo_reapertura';
function q(e) {
  const n = y(e),
    t = M(e);
  return {
    id: e.id,
    key: `${n}:${t}`,
    canal: n,
    nv: t,
    cliente: e.cliente || '',
    vendedor: e.vendedor || '',
    estado: e.estado || '',
    transportista: e.transportista || '',
    fechaCompromiso: w(e.fecha_compromiso),
    guia: e.guia || '',
    factura: e.factura || '',
    fechaAprobacion: w(e.fecha_aprobacion),
    fechaAprobacionReal: w(e.fecha_aprobacion_real),
    urgente: e.urgente === !0,
    _estado: e.estado,
    reabierta: e.reabierta === !0,
    motivoReapertura: e.motivo_reapertura || ''
  };
}
function Se(e) {
  return O(e).split(' ').filter(Boolean);
}
function Ne(e) {
  const n = T((e == null ? void 0 : e.nv) || ''),
    t = N((e == null ? void 0 : e.guia) || ''),
    a = N((e == null ? void 0 : e.factura) || ''),
    r = O((e == null ? void 0 : e.cliente) || ''),
    o = O((e == null ? void 0 : e.vendedor) || ''),
    c = O((e == null ? void 0 : e.transportista) || ''),
    s = N((e == null ? void 0 : e.canal) || ''),
    i = N((e == null ? void 0 : e.estado) || ''),
    d = [n, t, a, r, o, c, s, i].filter(Boolean).join(' '),
    l = new Set(d.split(' ').filter(Boolean));
  return {
    nv: n,
    guia: t,
    factura: a,
    cliente: r,
    vendedor: o,
    transportista: c,
    canal: s,
    estado: i,
    searchable: d,
    words: l
  };
}
function we(e, n) {
  const t = String(n || '').trim();
  if (!t) return Number.NEGATIVE_INFINITY;
  const a = T(t),
    r = N(t),
    o = O(t),
    c = Se(t),
    s = Ne(e);
  let i = 0;
  if (
    (s.nv &&
      a &&
      (s.nv === a ? (i += 2e4) : s.nv.startsWith(a) ? (i += 12e3) : s.nv.includes(a) && (i += 8e3)),
    s.guia &&
      r &&
      (s.guia === r
        ? (i += 15e3)
        : s.guia.startsWith(r)
          ? (i += 9e3)
          : s.guia.includes(r) && (i += 4500)),
    s.factura &&
      r &&
      (s.factura === r
        ? (i += 15e3)
        : s.factura.startsWith(r)
          ? (i += 9e3)
          : s.factura.includes(r) && (i += 4500)),
    o &&
      (s.cliente === o
        ? (i += 7e3)
        : s.cliente.startsWith(o)
          ? (i += 4800)
          : s.cliente.includes(o) && (i += 2800),
      s.vendedor === o
        ? (i += 6500)
        : s.vendedor.startsWith(o)
          ? (i += 4400)
          : s.vendedor.includes(o) && (i += 2400),
      s.transportista === o
        ? (i += 5e3)
        : s.transportista.startsWith(o)
          ? (i += 3200)
          : s.transportista.includes(o) && (i += 1800)),
    c.length > 0)
  ) {
    let d = 0;
    (c.forEach((l) => {
      if (s.words.has(l)) {
        ((d += 1), (i += 950));
        return;
      }
      for (const u of s.words)
        if (u.startsWith(l)) {
          ((d += 0.6), (i += 360));
          return;
        }
      s.searchable.includes(l) && (i += 120);
    }),
      d >= c.length && (i += 1600));
  }
  return (
    r && s.searchable.includes(r) && (i += 600),
    e != null && e.urgente && (i += 45),
    (i += Math.min(F(e) / 1e9, 120)),
    i
  );
}
function B(e, n, t = 200) {
  const a = new Map();
  return (
    (e || []).forEach((r) => {
      if (!(r != null && r.key)) return;
      const o = we(r, n);
      if (!Number.isFinite(o) || o <= 0) return;
      const c = a.get(r.key);
      (!c || o > c.score || (o === c.score && F(r) > F(c.item))) &&
        a.set(r.key, { item: r, score: o });
    }),
    Array.from(a.values())
      .sort((r, o) => o.score - r.score || F(o.item) - F(r.item))
      .slice(0, t)
      .map(({ item: r }) => r)
  );
}
function F(e) {
  return (
    Date.parse((e == null ? void 0 : e.fecha_estado) || '') ||
    Date.parse((e == null ? void 0 : e.fecha_aprobacion_real) || '') ||
    Date.parse((e == null ? void 0 : e.fecha_aprobacion) || '') ||
    0
  );
}
async function Be({ force: e = !1, full: n = !0, limit: t = 400 } = {}) {
  return S(
    'lista_activas',
    async () => {
      const a = Date.now(),
        r = n ? W : H;
      if (!e && r.data && a - r.ts < ce) return r.data;
      if (!e && r.promise) return r.promise;
      const o = async () => {
        if (!n) {
          const { data: l, error: u } = await p
            .from(C)
            .select(I)
            .in('estado', J)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .limit(t);
          if (u) throw u;
          const f = (l || []).map(q);
          return ((H = { ts: Date.now(), data: f, promise: null }), f);
        }
        const c = [];
        let s = 0;
        const i = 500;
        for (;;) {
          const { data: l, error: u } = await p
            .from(C)
            .select(I)
            .in('estado', J)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .range(s, s + i - 1);
          if (u) throw u;
          if (!l || l.length === 0 || (c.push(...l), l.length < i)) break;
          s += i;
        }
        const d = c.map(q);
        return ((W = { ts: Date.now(), data: d, promise: null }), d);
      };
      return (
        (r.promise = o().catch((c) => {
          throw ((r.promise = null), c);
        })),
        r.promise
      );
    },
    {
      payload: { force: e, full: n, limit: n ? null : t },
      slowMs: 700,
      message: 'Carga de N.V. activas del Panel'
    }
  );
}
async function ye(e, { limit: n = 300, signal: t } = {}) {
  return S(
    'buscar_operaciones',
    async () => {
      const a = String(e || '').trim();
      if (a.length < 2) return [];
      const r = `${n}:${O(a) || N(a)}`,
        o = z(b, r, ue);
      if (o) return o;
      const c = a.replace(/[(),*]/g, ' ').trim();
      if (!c) return [];
      const i = (async () => {
        if (/^\d{4,}$/.test(c)) {
          const _ = await j(
            () =>
              p
                .from(K)
                .select(I)
                .or(`nv_ptm.eq.${Number(c)},nv_orange.eq.${c},nv_farmapack.eq.${c},varios.eq.${c}`)
                .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                .order('id', { ascending: !1 })
                .limit(4),
            { ms: 2500, label: 'Busqueda exacta de N.V. del Panel', signal: t }
          );
          if (_ != null && _.error) throw _.error;
          const h = B((_.data || []).map(q), a, Math.min(n, 20));
          if (h.length) return D(b, r, h);
          const R = Math.min(n, 60),
            A = `${c}%`,
            L = await j(
              () =>
                p
                  .from(C)
                  .select(I)
                  .or(
                    `nv_ptm.eq.${Number(c)},nv_orange.ilike.${A},nv_farmapack.ilike.${A},varios.ilike.${A},guia.ilike.${A},factura.ilike.${A}`
                  )
                  .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                  .order('id', { ascending: !1 })
                  .limit(R),
              { ms: 3e3, label: 'Busqueda numerica del Panel', signal: t }
            );
          if (L != null && L.error) throw L.error;
          const ie = B((L.data || []).map(q), a, n);
          return D(b, r, ie);
        }
        const l = `*${c}*`,
          u = [];
        u.push(
          `nv_orange.ilike.${l}`,
          `nv_farmapack.ilike.${l}`,
          `varios.ilike.${l}`,
          `cliente.ilike.${l}`,
          `vendedor.ilike.${l}`,
          `guia.ilike.${l}`,
          `factura.ilike.${l}`,
          `transportista.ilike.${l}`
        );
        let f = null,
          g = null;
        if (
          (({ data: f, error: g } = await U(
            p
              .from(C)
              .select(I)
              .or(u.join(','))
              .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
              .limit(n),
            { ms: 4e3, label: 'Busqueda remota amplia del Panel', signal: t }
          )),
          g)
        ) {
          const _ = Math.min(n, 60),
            h = `${c}*`,
            R =
              c.length >= 4
                ? p.from(C).select(I).ilike('cliente', h).limit(_)
                : p
                    .from(C)
                    .select(I)
                    .or(`nv_orange.ilike.${h},nv_farmapack.ilike.${h},varios.ilike.${h}`)
                    .limit(_),
            A = await U(R, {
              ms: 2500,
              label: 'Fallback acotado de busqueda del Panel',
              signal: t
            });
          if (A != null && A.error) throw g;
          ((f = A.data || []), (g = null));
        }
        const m = new Map();
        (f || []).forEach((_) => {
          const h = M(_);
          if (!h) return;
          const R = `${y(_)}:${h}`;
          m.has(R) || m.set(R, q(_));
        });
        const v = B(Array.from(m.values()), a, n);
        return D(b, r, v);
      })().catch((d) => {
        throw (b.delete(r), d);
      });
      return X(b, r, i);
    },
    {
      payload: { term: String(e || '').trim(), limit: n },
      slowMs: 450,
      message: 'Busqueda remota de operaciones del Panel'
    }
  );
}
function Ge(e, n, { limit: t = 120 } = {}) {
  const a = String(n || '').trim();
  return a.length < 2 ? [] : B(e || [], a, t);
}
function xe(e, n, t, { limit: a = 160 } = {}) {
  return B([...(e || []), ...(n || [])], t, a);
}
async function Ue({ force: e = !1, includeHistoricos: n = !1 } = {}) {
  return S(
    'cargar_opciones',
    async () => {
      const t = Date.now(),
        a = n ? ae : te;
      if (!e && a.data && t - a.ts < le) return a.data;
      if (!e && a.promise) return a.promise;
      const r = async () => {
        const o = new Set(),
          { data: c } = await p
            .from('tms_panel_transportistas')
            .select('nombre')
            .eq('activo', !0)
            .order('nombre', { ascending: !0 });
        if (
          ((c || []).forEach((d) => {
            const l = (d.nombre || '').trim();
            l && o.add(l);
          }),
          n)
        ) {
          let d = 0;
          const l = 1e3;
          for (;;) {
            const { data: u, error: f } = await p
              .from(C)
              .select('transportista')
              .not('transportista', 'is', null)
              .order('id', { ascending: !0 })
              .range(d, d + l - 1);
            if (
              f ||
              !u ||
              u.length === 0 ||
              (u.forEach((g) => {
                const m = (g.transportista || '').trim();
                m && o.add(m);
              }),
              u.length < l)
            )
              break;
            d += l;
          }
        }
        const s = [...o].sort((d, l) => d.localeCompare(l, 'es')),
          i = { estados: he, transportistas: s, tiposDespacho: Ae };
        return ((a.data = i), (a.ts = Date.now()), (a.promise = null), i);
      };
      return (
        (a.promise = r().catch((o) => {
          throw ((a.promise = null), o);
        })),
        a.promise
      );
    },
    {
      payload: { force: e, includeHistoricos: n },
      slowMs: 1200,
      message: 'Carga de opciones del formulario Panel'
    }
  );
}
const oe =
  'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,centro_costo,division,estado,transportista,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_facturacion,fecha_despacho,fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,factura,guia,bultos,valor_factura,numero_envio,urgente,incidencia,estado_incidencia,observaciones_incidencia,reabierta,fecha_reapertura,motivo_reapertura';
async function Z(e, n) {
  const t = T(n);
  if (!t) return null;
  const a = `${String(e).toLowerCase()}:${t}`,
    r = z(V, a, fe);
  if (r) return r;
  const c = (async () => {
    const { data: s } = await p
      .from('tms_nv_catalogo')
      .select('cliente, vendedor, fecha_aprobacion, centro_costo, division')
      .eq('canal', String(e).toLowerCase())
      .eq('nv', t)
      .limit(1);
    return D(V, a, (s && s[0]) || null);
  })().catch((s) => {
    throw (V.delete(a), s);
  });
  return X(V, a, c);
}
async function Te() {
  const e = Date.now();
  if (E.data && e - E.ts < _e) return E.data;
  if (E.promise) return E.promise;
  const n = async () => {
    const { data: t } = await p
        .from('tms_panel_vendedores')
        .select('nombre, centro_costo, division')
        .eq('activo', !0)
        .order('nombre', { ascending: !0 }),
      a = t || [];
    return ((E = { ts: Date.now(), data: a, promise: null }), a);
  };
  return (
    (E.promise = n().catch((t) => {
      throw ((E.promise = null), t);
    })),
    E.promise
  );
}
async function Y(e) {
  const n = String(e || '').trim();
  if (!n) return null;
  const t = await Te();
  if (!t || t.length === 0) return null;
  const a = O(n),
    r = Q(n),
    c = t
      .map((s) => {
        const i = O(s.nombre),
          d = Q(s.nombre),
          l = i === a,
          u = !l && (i.includes(a) || a.includes(i)),
          f = r.filter((_) => d.includes(_)).length,
          g = r.length > 0 && r.every((_) => d.includes(_)),
          m = d.length > 0 && d.every((_) => r.includes(_));
        let v = 0;
        return (
          l ? (v += 1e3) : u ? (v += 700) : (g || m) && (v += 500),
          (v += f * 100),
          (v -= Math.abs(i.length - a.length)),
          { ...s, score: v }
        );
      })
      .filter((s) => s.score >= 200)
      .sort((s, i) => i.score - s.score)[0];
  return c ? { centro_costo: c.centro_costo || '', division: c.division || '' } : null;
}
async function ee(e, n) {
  return S(
    'lookup_nv',
    async () => {
      const t = T(n);
      if (!t)
        return { found: !1, autoFill: { cliente: '', vendedor: '', ccosto: '', division: '' } };
      const a = `${String(e).toLowerCase()}:${t}`,
        r = z(P, a, de);
      if (r) return r;
      const c = (async () => {
        const s = Oe(e),
          [i, d] = await Promise.all([
            j(
              () => {
                let _ = p.from(K).select(oe).order('fecha_estado', { ascending: !1 }).limit(1);
                return e === 'ptm' && /^\d+$/.test(t) ? _.eq(s, Number(t)) : _.eq(s, t);
              },
              { ms: 2500, label: 'Lookup exacto de N.V. del Panel' }
            ),
            Z(e, t)
          ]);
        if (i != null && i.error) throw i.error;
        const l = (i == null ? void 0 : i.data) || [],
          u = l && l.length ? l[0] : null,
          f = (u == null ? void 0 : u.cliente) || (d == null ? void 0 : d.cliente) || '',
          g = (u == null ? void 0 : u.vendedor) || (d == null ? void 0 : d.vendedor) || '';
        let m =
            (u == null ? void 0 : u.centro_costo) || (d == null ? void 0 : d.centro_costo) || '',
          v = (u == null ? void 0 : u.division) || (d == null ? void 0 : d.division) || '';
        if (g && (!m || !v)) {
          const _ = await Y(g);
          _ && ((m = m || _.centro_costo || ''), (v = v || _.division || ''));
        }
        if (u) {
          const _ = {
            found: !0,
            row: u.id,
            data: {
              ...u,
              canal: e,
              nv: M(u),
              estado: u.estado,
              cliente: f,
              vendedor: g,
              ccosto: m,
              division: v,
              fecha_compromiso: w(u.fecha_compromiso),
              fecha_registro_nv: w(u.fecha_registro_nv)
            }
          };
          return D(P, a, _);
        }
        return D(P, a, {
          found: !1,
          autoFill: { cliente: f, vendedor: g, ccosto: m, division: v }
        });
      })().catch((s) => {
        throw (P.delete(a), s);
      });
      return X(P, a, c);
    },
    { payload: { canal: e, nv: T(n) }, slowMs: 550, message: 'Lookup de N.V. en Panel' }
  );
}
async function We(e, { canal: n = null, nv: t = null } = {}) {
  return S(
    'lookup_nv_by_id',
    async () => {
      if (!e) return ee(n, t);
      const { data: a, error: r } = await p.from(K).select(oe).eq('id', e).limit(1);
      if (r) throw r;
      const o = a && a.length ? a[0] : null;
      if (!o) return ee(n, t);
      const c = n || y(o),
        s = t || M(o),
        i = await Z(c, s),
        d = (o == null ? void 0 : o.cliente) || (i == null ? void 0 : i.cliente) || '',
        l = (o == null ? void 0 : o.vendedor) || (i == null ? void 0 : i.vendedor) || '';
      let u = (o == null ? void 0 : o.centro_costo) || (i == null ? void 0 : i.centro_costo) || '',
        f = (o == null ? void 0 : o.division) || (i == null ? void 0 : i.division) || '';
      if (l && (!u || !f)) {
        const m = await Y(l);
        m && ((u = u || m.centro_costo || ''), (f = f || m.division || ''));
      }
      return {
        found: !0,
        row: o.id,
        data: {
          ...o,
          canal: c,
          nv: s,
          estado: o.estado,
          cliente: d,
          vendedor: l,
          ccosto: u,
          division: f,
          fecha_compromiso: w(o.fecha_compromiso),
          fecha_registro_nv: w(o.fecha_registro_nv)
        }
      };
    },
    {
      payload: { id: e, canal: n, nv: T(t) },
      slowMs: 350,
      message: 'Lookup de N.V. por id en Panel'
    }
  );
}
async function He(e, n = {}) {
  const t = T(e);
  if (!t) return null;
  const a = await Z('orange', t);
  if (!a) return null;
  let r = a.centro_costo || '',
    o = a.division || '';
  const c = a.vendedor || n.vendedor || '';
  if (c && (!r || !o)) {
    const s = await Y(c);
    s && ((r = r || s.centro_costo || ''), (o = o || s.division || ''));
  }
  return (
    (r = r || n.ccosto || n.centro_costo || ''),
    (o = o || n.division || ''),
    {
      nv: t,
      cliente: a.cliente || '',
      vendedor: a.vendedor || n.vendedor || '',
      ccosto: r,
      division: o,
      fecha_aprobacion: w(a.fecha_aprobacion)
    }
  );
}
const ne = [
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
  be = [
    ['canal_operacion', 'CANAL OPERACIÓN'],
    ['nv_operacion', 'N.V OPERACIÓN'],
    ['nv_orange_asociada_ptm', 'N.V ORANGE ASOCIADA PTM'],
    ['tiene_asociacion_orange', 'PTM CON ASOCIACIÓN ORANGE']
  ],
  Ie = new Set([
    'fecha_aprobacion',
    'fecha_aprobacion_real',
    'fecha_despacho',
    'fecha_compromiso',
    'fecha_en_proceso',
    'fecha_shipping',
    'fecha_en_ruta',
    'fecha_entregado'
  ]),
  Re = new Set(['fecha_estado', 'fecha_registro_nv', 'created_at', 'updated_at']),
  se = (e) => {
    const n = String(e).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return n ? `${n[3]}/${n[2]}/${n[1]}` : String(e);
  },
  Pe = (e) => {
    const n = String(e).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    return n ? `${n[3]}/${n[2]}/${n[1]} ${n[4]}:${n[5]}` : se(e);
  };
async function je() {
  return S(
    'exportar_operaciones',
    async () => {
      const e = ne.map((r) => r[0]).join(','),
        n = [];
      let t = 0;
      const a = 1e3;
      for (;;) {
        const { data: r, error: o } = await p
          .from(C)
          .select(e)
          .order('id', { ascending: !0 })
          .range(t, t + a - 1);
        if (o) throw o;
        if (!r || r.length === 0 || (n.push(...r), r.length < a)) break;
        t += a;
      }
      return n.map((r) => {
        const o = {};
        ne.forEach(([l, u]) => {
          let f = r[l];
          (l === 'urgente'
            ? (f = f === !0 ? 'SÍ' : 'NO')
            : f == null || f === ''
              ? (f = '')
              : Ie.has(l)
                ? (f = se(f))
                : Re.has(l) && (f = Pe(f)),
            (o[u] = f));
        });
        const c = y(r),
          s = M(r),
          i = (r.nv_ptm && r.nv_orange) || '',
          d = {
            'CANAL OPERACIÓN': String(c || '').toUpperCase(),
            'N.V OPERACIÓN': s || '',
            'N.V ORANGE ASOCIADA PTM': i,
            'PTM CON ASOCIACIÓN ORANGE': r.nv_ptm ? (r.nv_orange ? 'SÍ' : 'NO') : ''
          };
        return (
          be.forEach(([, l]) => {
            o[l] = d[l] || '';
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
function x(e, n) {
  return n
    ? { ok: !1, error: n.message, message: n.message }
    : e && typeof e == 'object'
      ? e
      : { ok: !0 };
}
async function Ke(e) {
  var t;
  const n = {
    ...e,
    id:
      (e == null ? void 0 : e.id) ??
      ((e == null ? void 0 : e.mode) === 'update'
        ? (t = e == null ? void 0 : e.lookup) == null
          ? void 0
          : t.row
        : null)
  };
  return $(
    'guardar_nv',
    async () => {
      const { data: a, error: r } = await p.rpc('guardar_nv', { p: n }),
        o = x(a, r);
      return ((o == null ? void 0 : o.ok) !== !1 && re(), o);
    },
    { payload: ge(n), message: 'Guardado de N.V. en Panel' }
  );
}
async function ze(e) {
  if (!e) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: n, error: t } = await p.rpc('iam_puede_editar_nv', { p_id: e });
  return t
    ? { permitida: !1, message: t.message || 'No se pudo validar el acceso IAM.' }
    : n || { permitida: !1, message: 'No se pudo validar el acceso IAM.' };
}
async function Xe(e, n = null) {
  if (!e) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: t, error: a } = await p.rpc('iam_puede_cambiar_estado_nv', {
    p_id: e,
    p_estado: n
  });
  return a
    ? { permitida: !1, message: a.message || 'No se pudo validar la transición de estado.' }
    : t || { permitida: !1, message: 'No se pudo validar la transición de estado.' };
}
async function Ze(e) {
  return S(
    'listar_reaperturas_nv',
    async () => {
      if (!e) return [];
      const { data: n, error: t } = await p
        .from('tms_nv_reaperturas')
        .select(
          'id, operacion_id, nv, canal, estado_origen, motivo, estado, solicitada_por, solicitada_por_nombre, solicitada_at, resuelta_por, resuelta_por_nombre, resuelta_at, observacion_resolucion'
        )
        .eq('operacion_id', e)
        .order('solicitada_at', { ascending: !1 });
      if (t) throw t;
      return n || [];
    },
    { payload: { operacionId: e }, slowMs: 450, message: 'Consulta de historial de reaperturas' }
  );
}
async function Ye(e, n) {
  return $(
    'solicitar_reapertura_nv',
    async () => {
      const { data: t, error: a } = await p.rpc('solicitar_reapertura_nv', {
        p_operacion_id: e,
        p_motivo: n
      });
      return x(t, a);
    },
    {
      payload: { id: e, motivoLength: String(n || '').trim().length },
      message: 'Solicitud de reapertura de N.V.'
    }
  );
}
async function Je(e, n, t = '') {
  return $(
    'resolver_reapertura_nv',
    async () => {
      const { data: a, error: r } = await p.rpc('resolver_reapertura_nv', {
        p_request_id: e,
        p_aprobar: n,
        p_observacion: t || null
      });
      return x(a, r);
    },
    {
      payload: { requestId: e, aprobar: n, observacionLength: String(t || '').trim().length },
      message: 'Resolucion de solicitud de reapertura'
    }
  );
}
async function Qe(e) {
  return $(
    'eliminar_nv',
    async () => {
      const { data: n, error: t } = await p.rpc('eliminar_nv', { p_id: e }),
        a = x(n, t);
      return ((a == null ? void 0 : a.ok) !== !1 && re(), a);
    },
    { payload: { id: e }, message: 'Eliminacion de N.V. en Panel' }
  );
}
async function en() {
  return S(
    'listar_consolidados',
    async () => {
      const [{ data: e }, { data: n }] = await Promise.all([
          p
            .from('tms_consolidados')
            .select('id, ticket, fecha_comprometida, estado, observacion, created_by, created_at')
            .order('id', { ascending: !1 }),
          p.from('tms_consolidado_nvs').select('id, consolidado_id, nv, canal, cliente')
        ]),
        t = {};
      return (
        (n || []).forEach((a) => {
          (t[a.consolidado_id] = t[a.consolidado_id] || []).push({
            id: a.id,
            nv: a.nv,
            canal: a.canal,
            cliente: a.cliente
          });
        }),
        (e || []).map((a) => ({ ...a, nvs: t[a.id] || [] }))
      );
    },
    {
      payload: { feature: 'consolidados' },
      slowMs: 700,
      message: 'Carga de consolidados del Panel'
    }
  );
}
async function nn(e) {
  return $(
    'guardar_consolidado',
    async () => {
      const { data: n, error: t } = await p.rpc('guardar_consolidado', { p: e });
      return t ? { ok: !1, error: t.message } : n || { ok: !0 };
    },
    {
      payload: {
        id: (e == null ? void 0 : e.id) ?? null,
        ticket: (e == null ? void 0 : e.ticket) || '',
        nvs: Array.isArray(e == null ? void 0 : e.nvs) ? e.nvs.length : 0
      },
      message: 'Guardado de consolidado'
    }
  );
}
async function an(e) {
  return $(
    'eliminar_consolidado',
    async () => {
      const { data: n, error: t } = await p.rpc('eliminar_consolidado', { p_id: e });
      return t ? { ok: !1, error: t.message } : n || { ok: !0 };
    },
    { payload: { id: e }, message: 'Eliminacion de consolidado' }
  );
}
async function tn(e) {
  return S(
    'buscar_nv_basico',
    async () => {
      const n = String(e).trim();
      if (!n) return null;
      const t = [];
      (/^\d+$/.test(n) && t.push(`nv_ptm.eq.${Number(n)}`),
        t.push(`nv_orange.eq.${n}`, `nv_farmapack.eq.${n}`, `varios.ilike.*${n}*`));
      const { data: a } = await p
        .from(C)
        .select('nv_ptm,nv_orange,nv_farmapack,varios,cliente,estado,fecha_estado')
        .or(t.join(','))
        .order('fecha_estado', { ascending: !1 })
        .limit(1);
      if (!a || a.length === 0) return null;
      const r = a[0];
      return { nv: M(r), canal: y(r), cliente: r.cliente || null, estado: r.estado || null };
    },
    {
      payload: { nv: String(e || '').trim() },
      slowMs: 400,
      message: 'Busqueda basica de N.V. para consolidados'
    }
  );
}
export {
  Fe as A,
  De as C,
  Le as E,
  Me as I,
  Ae as T,
  $e as V,
  Be as a,
  tn as b,
  Ve as c,
  Ge as d,
  an as e,
  ye as f,
  nn as g,
  je as h,
  xe as i,
  J as j,
  Xe as k,
  en as l,
  Ze as m,
  qe as n,
  Ue as o,
  ze as p,
  He as q,
  We as r,
  he as s,
  ee as t,
  Ye as u,
  Ke as v,
  Je as w,
  Qe as x
};
