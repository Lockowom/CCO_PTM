import { s as _, L as D, w as W } from './index-BGSkqVb2.js';
const C = 'tms_operaciones_vigentes',
  K = 'tms_operaciones',
  ce = 60 * 1e3,
  le = 5 * 60 * 1e3,
  ue = 20 * 1e3,
  de = 3 * 60 * 1e3,
  fe = 5 * 60 * 1e3,
  _e = 10 * 60 * 1e3;
let H = { ts: 0, data: null, promise: null },
  j = { ts: 0, data: null, promise: null },
  te = { ts: 0, data: null, promise: null },
  oe = { ts: 0, data: null, promise: null },
  E = { ts: 0, data: null, promise: null };
const I = new Map(),
  k = new Map(),
  F = new Map();
function G() {
  ((H = { ts: 0, data: null, promise: null }),
    (j = { ts: 0, data: null, promise: null }),
    (te = { ts: 0, data: null, promise: null }),
    (oe = { ts: 0, data: null, promise: null }),
    (E = { ts: 0, data: null, promise: null }),
    I.clear(),
    k.clear(),
    F.clear());
}
function pe(e, a) {
  return !!e && Object.prototype.hasOwnProperty.call(e, 'value') && Date.now() - e.ts < a;
}
function Z(e, a, t) {
  const n = e.get(a);
  return n ? (n.promise ? n.promise : pe(n, t) ? n.value : (e.delete(a), null)) : null;
}
function L(e, a, t) {
  return (e.set(a, { ts: Date.now(), value: t }), t);
}
function X(e, a, t) {
  return (e.set(a, { ts: Date.now(), promise: t }), t);
}
function x(e) {
  return Math.round(Math.max(0, performance.now() - e));
}
function me(e) {
  const a = String(
    (e == null ? void 0 : e.message) || (e == null ? void 0 : e.details) || e || ''
  ).toLowerCase();
  return (
    (e == null ? void 0 : e.name) === 'AbortError' ||
    a.includes('request was aborted') ||
    a.includes('signal is aborted')
  );
}
function ge(e = {}) {
  return {
    id: (e == null ? void 0 : e.id) ?? null,
    mode: (e == null ? void 0 : e.mode) || null,
    canal: (e == null ? void 0 : e.canal) || null,
    nv: b((e == null ? void 0 : e.nv) || ''),
    estado: (e == null ? void 0 : e.estado) || null,
    urgente: (e == null ? void 0 : e.urgente) === !0,
    transportista: (e == null ? void 0 : e.transportista) || null,
    hasIncidencia: !!String((e == null ? void 0 : e.incidencia) || '').trim(),
    reabierta: (e == null ? void 0 : e.reabierta) === !0
  };
}
async function O(
  e,
  a,
  { screen: t = 'PanelIngresar', payload: n = null, slowMs: o = 900, message: s = '' } = {}
) {
  const c = performance.now();
  try {
    const r = await a(),
      i = x(c);
    return (
      i >= o &&
        D.performance({
          module: 'panel',
          screen: t,
          action: e,
          message: s || `Operacion lenta de lectura: ${e}`,
          durationMs: i,
          status: 'ok',
          payload: n
        }),
      r
    );
  } catch (r) {
    throw (
      me(r) ||
        D.error(r, {
          module: 'panel',
          screen: t,
          action: e,
          message: `Fallo operacion de lectura: ${e}`,
          durationMs: x(c),
          status: 'error',
          payload: n
        }),
      r
    );
  }
}
function he(e) {
  return /timed out acquiring connection|connection pool/i.test(
    String((e == null ? void 0 : e.message) || e || '')
  );
}
async function z(e, { ms: a, label: t, attempts: n = 3, signal: o } = {}) {
  let s;
  for (let c = 0; c < n; c += 1) {
    if (
      ((s = await W(e(), { ms: a, label: t, signal: o })),
      !he(s == null ? void 0 : s.error) || c === n - 1)
    )
      return s;
    const r = 180 * 2 ** c + Math.floor(Math.random() * 70);
    (D.warn(s.error, {
      module: 'panel',
      screen: 'PanelIngresar',
      action: 'pool_acquire_retry',
      message: `Reintento de lectura por saturación transitoria del pool: ${t}`,
      attempt: c + 1,
      delayMs: r
    }),
      await new Promise((i) => setTimeout(i, r)));
  }
  return s;
}
async function T(e, a, { screen: t = 'PanelIngresar', payload: n = null, message: o = '' } = {}) {
  const s = performance.now();
  try {
    const c = await a(),
      r = x(s);
    return (c == null ? void 0 : c.ok) === !1
      ? (D.error(new Error(c.error || c.message || `Operacion fallida: ${e}`), {
          module: 'panel',
          screen: t,
          action: e,
          message: `Operacion fallida: ${e}`,
          durationMs: r,
          status: 'failed',
          payload: n,
          context: { result: c }
        }),
        c)
      : (D.audit({
          module: 'panel',
          screen: t,
          action: e,
          message: o || `Operacion ejecutada: ${e}`,
          durationMs: r,
          status: 'ok',
          payload: n
        }),
        c);
  } catch (c) {
    throw (
      D.error(c, {
        module: 'panel',
        screen: t,
        action: e,
        message: `Fallo operacion critica: ${e}`,
        durationMs: x(s),
        status: 'error',
        payload: n
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
  Le = ['N.V ANTICIPADA', 'DEMO', 'REGALO', 'BOLETA', 'GUÍA SALIDA'],
  Me = ['PROBLEMAS DE DIRECCIÓN', 'PROBLEMAS DE TRANSPORTE', 'PROBLEMA DE ARMADO', 'OTRO'],
  $e = ['ABIERTA', 'EN GESTIÓN', 'RESUELTA'],
  ve = ['En Proceso', 'Shipping', 'En Ruta', 'Entregado'],
  Q = ['En Proceso', 'Shipping', 'En Ruta'],
  Ve = [
    { value: 'REZAGADA_COMERCIAL', label: 'Rezagada comercial' },
    { value: 'RETIRO_CLIENTE', label: 'Retiro de cliente' }
  ],
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
  Fe = (e) => Ee[e] || '#9ca3af',
  ye = '#ea580c',
  w = (e) => (e ? String(e).slice(0, 10) : ''),
  b = (e) => {
    const a = String(e ?? '').trim();
    return /^\d+\.0+$/.test(a) ? a.split('.')[0] : a;
  },
  N = (e) =>
    String(e || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase(),
  S = (e) =>
    N(e)
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  Ce = new Set(['de', 'del', 'la', 'las', 'los']),
  ee = (e) =>
    S(e)
      .split(' ')
      .filter((a) => a && !Ce.has(a)),
  Se = (e) =>
    e === 'ptm'
      ? 'nv_ptm'
      : e === 'orange'
        ? 'nv_orange'
        : e === 'farmapack'
          ? 'nv_farmapack'
          : 'varios',
  U = (e) => (e.nv_ptm ? 'ptm' : e.nv_orange ? 'orange' : e.nv_farmapack ? 'farmapack' : 'varios'),
  M = (e) => (e.nv_ptm ? String(e.nv_ptm) : e.nv_orange || e.nv_farmapack || e.varios || ''),
  qe = (e) => N(e).includes('orange'),
  R =
    'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,estado,transportista,fecha_compromiso,guia,factura,fecha_aprobacion,fecha_aprobacion_real,urgente,fecha_estado,reabierta,motivo_reapertura,shipping_subestado,shipping_pausa_desde,shipping_pausa_motivo,shipping_pausa_elegible_sla';
function q(e) {
  const a = U(e),
    t = M(e);
  return {
    id: e.id,
    key: `${a}:${t}`,
    canal: a,
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
    motivoReapertura: e.motivo_reapertura || '',
    shippingSubestado: e.shipping_subestado || '',
    shippingPausaDesde: e.shipping_pausa_desde || '',
    shippingPausaMotivo: e.shipping_pausa_motivo || '',
    shippingPausaElegibleSla: e.shipping_pausa_elegible_sla === !0
  };
}
function Oe(e) {
  return S(e).split(' ').filter(Boolean);
}
function Ne(e) {
  const a = b((e == null ? void 0 : e.nv) || ''),
    t = N((e == null ? void 0 : e.guia) || ''),
    n = N((e == null ? void 0 : e.factura) || ''),
    o = S((e == null ? void 0 : e.cliente) || ''),
    s = S((e == null ? void 0 : e.vendedor) || ''),
    c = S((e == null ? void 0 : e.transportista) || ''),
    r = N((e == null ? void 0 : e.canal) || ''),
    i = N((e == null ? void 0 : e.estado) || ''),
    d = [a, t, n, o, s, c, r, i].filter(Boolean).join(' '),
    l = new Set(d.split(' ').filter(Boolean));
  return {
    nv: a,
    guia: t,
    factura: n,
    cliente: o,
    vendedor: s,
    transportista: c,
    canal: r,
    estado: i,
    searchable: d,
    words: l
  };
}
function we(e, a) {
  const t = String(a || '').trim();
  if (!t) return Number.NEGATIVE_INFINITY;
  const n = b(t),
    o = N(t),
    s = S(t),
    c = Oe(t),
    r = Ne(e);
  let i = 0;
  if (
    (r.nv &&
      n &&
      (r.nv === n ? (i += 2e4) : r.nv.startsWith(n) ? (i += 12e3) : r.nv.includes(n) && (i += 8e3)),
    r.guia &&
      o &&
      (r.guia === o
        ? (i += 15e3)
        : r.guia.startsWith(o)
          ? (i += 9e3)
          : r.guia.includes(o) && (i += 4500)),
    r.factura &&
      o &&
      (r.factura === o
        ? (i += 15e3)
        : r.factura.startsWith(o)
          ? (i += 9e3)
          : r.factura.includes(o) && (i += 4500)),
    s &&
      (r.cliente === s
        ? (i += 7e3)
        : r.cliente.startsWith(s)
          ? (i += 4800)
          : r.cliente.includes(s) && (i += 2800),
      r.vendedor === s
        ? (i += 6500)
        : r.vendedor.startsWith(s)
          ? (i += 4400)
          : r.vendedor.includes(s) && (i += 2400),
      r.transportista === s
        ? (i += 5e3)
        : r.transportista.startsWith(s)
          ? (i += 3200)
          : r.transportista.includes(s) && (i += 1800)),
    c.length > 0)
  ) {
    let d = 0;
    (c.forEach((l) => {
      if (r.words.has(l)) {
        ((d += 1), (i += 950));
        return;
      }
      for (const u of r.words)
        if (u.startsWith(l)) {
          ((d += 0.6), (i += 360));
          return;
        }
      r.searchable.includes(l) && (i += 120);
    }),
      d >= c.length && (i += 1600));
  }
  return (
    o && r.searchable.includes(o) && (i += 600),
    e != null && e.urgente && (i += 45),
    (i += Math.min(y(e) / 1e9, 120)),
    i
  );
}
function B(e, a, t = 200) {
  const n = new Map();
  return (
    (e || []).forEach((o) => {
      if (!(o != null && o.key)) return;
      const s = we(o, a);
      if (!Number.isFinite(s) || s <= 0) return;
      const c = n.get(o.key);
      (!c || s > c.score || (s === c.score && y(o) > y(c.item))) &&
        n.set(o.key, { item: o, score: s });
    }),
    Array.from(n.values())
      .sort((o, s) => s.score - o.score || y(s.item) - y(o.item))
      .slice(0, t)
      .map(({ item: o }) => o)
  );
}
function y(e) {
  return (
    Date.parse((e == null ? void 0 : e.fecha_estado) || '') ||
    Date.parse((e == null ? void 0 : e.fecha_aprobacion_real) || '') ||
    Date.parse((e == null ? void 0 : e.fecha_aprobacion) || '') ||
    0
  );
}
async function Be({ force: e = !1, full: a = !0, limit: t = 400 } = {}) {
  return O(
    'lista_activas',
    async () => {
      const n = Date.now(),
        o = a ? H : j;
      if (!e && o.data && n - o.ts < ce) return o.data;
      if (!e && o.promise) return o.promise;
      const s = async () => {
        if (!a) {
          const { data: l, error: u } = await _.from(C)
            .select(R)
            .in('estado', Q)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .limit(t);
          if (u) throw u;
          const f = (l || []).map(q);
          return ((j = { ts: Date.now(), data: f, promise: null }), f);
        }
        const c = [];
        let r = 0;
        const i = 500;
        for (;;) {
          const { data: l, error: u } = await _.from(C)
            .select(R)
            .in('estado', Q)
            .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
            .order('id', { ascending: !1 })
            .range(r, r + i - 1);
          if (u) throw u;
          if (!l || l.length === 0 || (c.push(...l), l.length < i)) break;
          r += i;
        }
        const d = c.map(q);
        return ((H = { ts: Date.now(), data: d, promise: null }), d);
      };
      return (
        (o.promise = s().catch((c) => {
          throw ((o.promise = null), c);
        })),
        o.promise
      );
    },
    {
      payload: { force: e, full: a, limit: a ? null : t },
      slowMs: 700,
      message: 'Carga de N.V. activas del Panel'
    }
  );
}
async function Ge(e, { limit: a = 300, signal: t } = {}) {
  return O(
    'buscar_operaciones',
    async () => {
      const n = String(e || '').trim();
      if (n.length < 2) return [];
      const o = `${a}:${S(n) || N(n)}`,
        s = Z(I, o, ue);
      if (s) return s;
      const c = n.replace(/[(),*]/g, ' ').trim();
      if (!c) return [];
      const i = (async () => {
        if (/^\d{4,}$/.test(c)) {
          const p = await z(
            () =>
              _.from(K)
                .select(R)
                .or(`nv_ptm.eq.${Number(c)},nv_orange.eq.${c},nv_farmapack.eq.${c},varios.eq.${c}`)
                .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                .order('id', { ascending: !1 })
                .limit(4),
            { ms: 2500, label: 'Busqueda exacta de N.V. del Panel', signal: t }
          );
          if (p != null && p.error) throw p.error;
          const v = B((p.data || []).map(q), n, Math.min(a, 20));
          if (v.length) return L(I, o, v);
          const P = Math.min(a, 60),
            A = `${c}%`,
            V = await z(
              () =>
                _.from(C)
                  .select(R)
                  .or(
                    `nv_ptm.eq.${Number(c)},nv_orange.ilike.${A},nv_farmapack.ilike.${A},varios.ilike.${A},guia.ilike.${A},factura.ilike.${A}`
                  )
                  .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
                  .order('id', { ascending: !1 })
                  .limit(P),
              { ms: 3e3, label: 'Busqueda numerica del Panel', signal: t }
            );
          if (V != null && V.error) throw V.error;
          const ie = B((V.data || []).map(q), n, a);
          return L(I, o, ie);
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
          (({ data: f, error: g } = await W(
            _.from(C)
              .select(R)
              .or(u.join(','))
              .order('fecha_estado', { ascending: !1, nullsFirst: !1 })
              .limit(a),
            { ms: 4e3, label: 'Busqueda remota amplia del Panel', signal: t }
          )),
          g)
        ) {
          const p = Math.min(a, 60),
            v = `${c}*`,
            P =
              c.length >= 4
                ? _.from(C).select(R).ilike('cliente', v).limit(p)
                : _.from(C)
                    .select(R)
                    .or(`nv_orange.ilike.${v},nv_farmapack.ilike.${v},varios.ilike.${v}`)
                    .limit(p),
            A = await W(P, {
              ms: 2500,
              label: 'Fallback acotado de busqueda del Panel',
              signal: t
            });
          if (A != null && A.error) throw g;
          ((f = A.data || []), (g = null));
        }
        const m = new Map();
        (f || []).forEach((p) => {
          const v = M(p);
          if (!v) return;
          const P = `${U(p)}:${v}`;
          m.has(P) || m.set(P, q(p));
        });
        const h = B(Array.from(m.values()), n, a);
        return L(I, o, h);
      })().catch((d) => {
        throw (I.delete(o), d);
      });
      return X(I, o, i);
    },
    {
      payload: { term: String(e || '').trim(), limit: a },
      slowMs: 450,
      message: 'Busqueda remota de operaciones del Panel'
    }
  );
}
function Ue(e, a, { limit: t = 120 } = {}) {
  const n = String(a || '').trim();
  return n.length < 2 ? [] : B(e || [], n, t);
}
function xe(e, a, t, { limit: n = 160 } = {}) {
  return B([...(e || []), ...(a || [])], t, n);
}
async function We({ force: e = !1, includeHistoricos: a = !1 } = {}) {
  return O(
    'cargar_opciones',
    async () => {
      const t = Date.now(),
        n = a ? te : oe;
      if (!e && n.data && t - n.ts < le) return n.data;
      if (!e && n.promise) return n.promise;
      const o = async () => {
        const s = new Set(),
          { data: c } = await _.from('tms_panel_transportistas')
            .select('nombre')
            .eq('activo', !0)
            .order('nombre', { ascending: !0 });
        if (
          ((c || []).forEach((d) => {
            const l = (d.nombre || '').trim();
            l && s.add(l);
          }),
          a)
        ) {
          let d = 0;
          const l = 1e3;
          for (;;) {
            const { data: u, error: f } = await _.from(C)
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
                m && s.add(m);
              }),
              u.length < l)
            )
              break;
            d += l;
          }
        }
        const r = [...s].sort((d, l) => d.localeCompare(l, 'es')),
          i = { estados: ve, transportistas: r, tiposDespacho: Ae };
        return ((n.data = i), (n.ts = Date.now()), (n.promise = null), i);
      };
      return (
        (n.promise = o().catch((s) => {
          throw ((n.promise = null), s);
        })),
        n.promise
      );
    },
    {
      payload: { force: e, includeHistoricos: a },
      slowMs: 1200,
      message: 'Carga de opciones del formulario Panel'
    }
  );
}
const se =
  'id,nv_ptm,nv_orange,nv_farmapack,varios,cliente,vendedor,centro_costo,division,estado,transportista,tipo_despacho,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso,fecha_facturacion,fecha_despacho,fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,factura,guia,bultos,valor_factura,numero_envio,urgente,incidencia,estado_incidencia,observaciones_incidencia,reabierta,fecha_reapertura,motivo_reapertura,shipping_subestado,shipping_pausa_desde,shipping_pausa_hasta,shipping_pausa_motivo,shipping_pausa_total_segundos,shipping_pausa_elegible_sla,incidencia_area,incidencia_origen,incidencia_reportada_at';
async function Y(e, a) {
  const t = b(a);
  if (!t) return null;
  const n = `${String(e).toLowerCase()}:${t}`,
    o = Z(F, n, fe);
  if (o) return o;
  const c = (async () => {
    const { data: r } = await _.from('tms_nv_catalogo')
      .select('cliente, vendedor, fecha_aprobacion, centro_costo, division')
      .eq('canal', String(e).toLowerCase())
      .eq('nv', t)
      .limit(1);
    return L(F, n, (r && r[0]) || null);
  })().catch((r) => {
    throw (F.delete(n), r);
  });
  return X(F, n, c);
}
async function be() {
  const e = Date.now();
  if (E.data && e - E.ts < _e) return E.data;
  if (E.promise) return E.promise;
  const a = async () => {
    const { data: t } = await _.from('tms_panel_vendedores')
        .select('nombre, centro_costo, division')
        .eq('activo', !0)
        .order('nombre', { ascending: !0 }),
      n = t || [];
    return ((E = { ts: Date.now(), data: n, promise: null }), n);
  };
  return (
    (E.promise = a().catch((t) => {
      throw ((E.promise = null), t);
    })),
    E.promise
  );
}
async function J(e) {
  const a = String(e || '').trim();
  if (!a) return null;
  const t = await be();
  if (!t || t.length === 0) return null;
  const n = S(a),
    o = ee(a),
    c = t
      .map((r) => {
        const i = S(r.nombre),
          d = ee(r.nombre),
          l = i === n,
          u = !l && (i.includes(n) || n.includes(i)),
          f = o.filter((p) => d.includes(p)).length,
          g = o.length > 0 && o.every((p) => d.includes(p)),
          m = d.length > 0 && d.every((p) => o.includes(p));
        let h = 0;
        return (
          l ? (h += 1e3) : u ? (h += 700) : (g || m) && (h += 500),
          (h += f * 100),
          (h -= Math.abs(i.length - n.length)),
          { ...r, score: h }
        );
      })
      .filter((r) => r.score >= 200)
      .sort((r, i) => i.score - r.score)[0];
  return c ? { centro_costo: c.centro_costo || '', division: c.division || '' } : null;
}
async function ae(e, a) {
  return O(
    'lookup_nv',
    async () => {
      const t = b(a);
      if (!t)
        return { found: !1, autoFill: { cliente: '', vendedor: '', ccosto: '', division: '' } };
      const n = `${String(e).toLowerCase()}:${t}`,
        o = Z(k, n, de);
      if (o) return o;
      const c = (async () => {
        const r = Se(e),
          [i, d] = await Promise.all([
            z(
              () => {
                let p = _.from(K).select(se).order('fecha_estado', { ascending: !1 }).limit(1);
                return e === 'ptm' && /^\d+$/.test(t) ? p.eq(r, Number(t)) : p.eq(r, t);
              },
              { ms: 2500, label: 'Lookup exacto de N.V. del Panel' }
            ),
            Y(e, t)
          ]);
        if (i != null && i.error) throw i.error;
        const l = (i == null ? void 0 : i.data) || [],
          u = l && l.length ? l[0] : null,
          f = (u == null ? void 0 : u.cliente) || (d == null ? void 0 : d.cliente) || '',
          g = (u == null ? void 0 : u.vendedor) || (d == null ? void 0 : d.vendedor) || '';
        let m =
            (u == null ? void 0 : u.centro_costo) || (d == null ? void 0 : d.centro_costo) || '',
          h = (u == null ? void 0 : u.division) || (d == null ? void 0 : d.division) || '';
        if (g && (!m || !h)) {
          const p = await J(g);
          p && ((m = m || p.centro_costo || ''), (h = h || p.division || ''));
        }
        if (u) {
          const p = {
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
              division: h,
              fecha_compromiso: w(u.fecha_compromiso),
              fecha_registro_nv: w(u.fecha_registro_nv)
            }
          };
          return L(k, n, p);
        }
        return L(k, n, {
          found: !1,
          autoFill: { cliente: f, vendedor: g, ccosto: m, division: h }
        });
      })().catch((r) => {
        throw (k.delete(n), r);
      });
      return X(k, n, c);
    },
    { payload: { canal: e, nv: b(a) }, slowMs: 550, message: 'Lookup de N.V. en Panel' }
  );
}
async function He(e, { canal: a = null, nv: t = null } = {}) {
  return O(
    'lookup_nv_by_id',
    async () => {
      if (!e) return ae(a, t);
      const { data: n, error: o } = await _.from(K).select(se).eq('id', e).limit(1);
      if (o) throw o;
      const s = n && n.length ? n[0] : null;
      if (!s) return ae(a, t);
      const c = a || U(s),
        r = t || M(s),
        i = await Y(c, r),
        d = (s == null ? void 0 : s.cliente) || (i == null ? void 0 : i.cliente) || '',
        l = (s == null ? void 0 : s.vendedor) || (i == null ? void 0 : i.vendedor) || '';
      let u = (s == null ? void 0 : s.centro_costo) || (i == null ? void 0 : i.centro_costo) || '',
        f = (s == null ? void 0 : s.division) || (i == null ? void 0 : i.division) || '';
      if (l && (!u || !f)) {
        const m = await J(l);
        m && ((u = u || m.centro_costo || ''), (f = f || m.division || ''));
      }
      return {
        found: !0,
        row: s.id,
        data: {
          ...s,
          canal: c,
          nv: r,
          estado: s.estado,
          cliente: d,
          vendedor: l,
          ccosto: u,
          division: f,
          fecha_compromiso: w(s.fecha_compromiso),
          fecha_registro_nv: w(s.fecha_registro_nv)
        }
      };
    },
    {
      payload: { id: e, canal: a, nv: b(t) },
      slowMs: 350,
      message: 'Lookup de N.V. por id en Panel'
    }
  );
}
async function je(e, a = {}) {
  const t = b(e);
  if (!t) return null;
  const n = await Y('orange', t);
  if (!n) return null;
  let o = n.centro_costo || '',
    s = n.division || '';
  const c = n.vendedor || a.vendedor || '';
  if (c && (!o || !s)) {
    const r = await J(c);
    r && ((o = o || r.centro_costo || ''), (s = s || r.division || ''));
  }
  return (
    (o = o || a.ccosto || a.centro_costo || ''),
    (s = s || a.division || ''),
    {
      nv: t,
      cliente: n.cliente || '',
      vendedor: n.vendedor || a.vendedor || '',
      ccosto: o,
      division: s,
      fecha_aprobacion: w(n.fecha_aprobacion)
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
  Te = [
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
  re = (e) => {
    const a = String(e).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return a ? `${a[3]}/${a[2]}/${a[1]}` : String(e);
  },
  Pe = (e) => {
    const a = String(e).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    return a ? `${a[3]}/${a[2]}/${a[1]} ${a[4]}:${a[5]}` : re(e);
  };
async function ze() {
  return O(
    'exportar_operaciones',
    async () => {
      const e = ne.map((o) => o[0]).join(','),
        a = [];
      let t = 0;
      const n = 1e3;
      for (;;) {
        const { data: o, error: s } = await _.from(C)
          .select(e)
          .order('id', { ascending: !0 })
          .range(t, t + n - 1);
        if (s) throw s;
        if (!o || o.length === 0 || (a.push(...o), o.length < n)) break;
        t += n;
      }
      return a.map((o) => {
        const s = {};
        ne.forEach(([l, u]) => {
          let f = o[l];
          (l === 'urgente'
            ? (f = f === !0 ? 'SÍ' : 'NO')
            : f == null || f === ''
              ? (f = '')
              : Ie.has(l)
                ? (f = re(f))
                : Re.has(l) && (f = Pe(f)),
            (s[u] = f));
        });
        const c = U(o),
          r = M(o),
          i = (o.nv_ptm && o.nv_orange) || '',
          d = {
            'CANAL OPERACIÓN': String(c || '').toUpperCase(),
            'N.V OPERACIÓN': r || '',
            'N.V ORANGE ASOCIADA PTM': i,
            'PTM CON ASOCIACIÓN ORANGE': o.nv_ptm ? (o.nv_orange ? 'SÍ' : 'NO') : ''
          };
        return (
          Te.forEach(([, l]) => {
            s[l] = d[l] || '';
          }),
          s
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
function $(e, a) {
  return a
    ? { ok: !1, error: a.message, message: a.message }
    : e && typeof e == 'object'
      ? e
      : { ok: !0 };
}
async function Ke(e) {
  var t;
  const a = {
    ...e,
    id:
      (e == null ? void 0 : e.id) ??
      ((e == null ? void 0 : e.mode) === 'update'
        ? (t = e == null ? void 0 : e.lookup) == null
          ? void 0
          : t.row
        : null)
  };
  return T(
    'guardar_nv',
    async () => {
      const { data: n, error: o } = await _.rpc('guardar_nv', { p: a }),
        s = $(n, o);
      return ((s == null ? void 0 : s.ok) !== !1 && G(), s);
    },
    { payload: ge(a), message: 'Guardado de N.V. en Panel' }
  );
}
async function Ze(e) {
  if (!e) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: a, error: t } = await _.rpc('iam_puede_editar_nv', { p_id: e });
  return t
    ? { permitida: !1, message: t.message || 'No se pudo validar el acceso IAM.' }
    : a || { permitida: !1, message: 'No se pudo validar el acceso IAM.' };
}
async function Xe(e, a = null) {
  if (!e) return { permitida: !1, message: 'N.V. no encontrada.' };
  const { data: t, error: n } = await _.rpc('iam_puede_cambiar_estado_nv', {
    p_id: e,
    p_estado: a
  });
  return n
    ? { permitida: !1, message: n.message || 'No se pudo validar la transición de estado.' }
    : t || { permitida: !1, message: 'No se pudo validar la transición de estado.' };
}
async function Ye(e, a) {
  return T(
    'corregir_estado_nv_a_shipping',
    async () => {
      const { data: t, error: n } = await _.rpc('corregir_estado_nv_a_shipping', {
          p_id: e,
          p_motivo: a
        }),
        o = $(t, n);
      return ((o == null ? void 0 : o.ok) !== !1 && G(), o);
    },
    {
      payload: { id: e, motivoLength: String(a || '').trim().length },
      message: 'Correccion auditada de estado N.V. a Shipping'
    }
  );
}
async function Je(e, a = null, t = '') {
  return T(
    a ? 'pausar_shipping_nv' : 'reactivar_shipping_nv',
    async () => {
      const { data: n, error: o } = await _.rpc('gestionar_pausa_shipping_nv', {
          p_id: e,
          p_subestado: a || null,
          p_motivo: t || null
        }),
        s = $(n, o);
      return ((s == null ? void 0 : s.ok) !== !1 && G(), s);
    },
    {
      payload: { id: e, subestado: a, motivoLength: String(t || '').trim().length },
      message: a ? 'Pausa operativa de Shipping' : 'Reactivacion de N.V. en Shipping'
    }
  );
}
async function Qe(e, a) {
  return T(
    'reportar_incidencia_armado_nv',
    async () => {
      const { data: t, error: n } = await _.rpc('reportar_incidencia_armado_nv', {
          p_id: e,
          p_observacion: a
        }),
        o = $(t, n);
      return ((o == null ? void 0 : o.ok) !== !1 && G(), o);
    },
    {
      payload: { id: e, observacionLength: String(a || '').trim().length },
      message: 'Incidencia post-entrega asignada a Bodega'
    }
  );
}
async function ea(e) {
  return O(
    'listar_reaperturas_nv',
    async () => {
      if (!e) return [];
      const { data: a, error: t } = await _.from('tms_nv_reaperturas')
        .select(
          'id, operacion_id, nv, canal, estado_origen, motivo, estado, solicitada_por, solicitada_por_nombre, solicitada_at, resuelta_por, resuelta_por_nombre, resuelta_at, observacion_resolucion'
        )
        .eq('operacion_id', e)
        .order('solicitada_at', { ascending: !1 });
      if (t) throw t;
      return a || [];
    },
    { payload: { operacionId: e }, slowMs: 450, message: 'Consulta de historial de reaperturas' }
  );
}
async function aa(e, a) {
  return T(
    'solicitar_reapertura_nv',
    async () => {
      const { data: t, error: n } = await _.rpc('solicitar_reapertura_nv', {
        p_operacion_id: e,
        p_motivo: a
      });
      return $(t, n);
    },
    {
      payload: { id: e, motivoLength: String(a || '').trim().length },
      message: 'Solicitud de reapertura de N.V.'
    }
  );
}
async function na(e) {
  return T(
    'eliminar_nv',
    async () => {
      const { data: a, error: t } = await _.rpc('eliminar_nv', { p_id: e }),
        n = $(a, t);
      return ((n == null ? void 0 : n.ok) !== !1 && G(), n);
    },
    { payload: { id: e }, message: 'Eliminacion de N.V. en Panel' }
  );
}
async function ta() {
  return O(
    'listar_consolidados',
    async () => {
      const [{ data: e }, { data: a }] = await Promise.all([
          _.from('tms_consolidados')
            .select('id, ticket, fecha_comprometida, estado, observacion, created_by, created_at')
            .order('id', { ascending: !1 }),
          _.from('tms_consolidado_nvs').select('id, consolidado_id, nv, canal, cliente')
        ]),
        t = {};
      return (
        (a || []).forEach((n) => {
          (t[n.consolidado_id] = t[n.consolidado_id] || []).push({
            id: n.id,
            nv: n.nv,
            canal: n.canal,
            cliente: n.cliente
          });
        }),
        (e || []).map((n) => ({ ...n, nvs: t[n.id] || [] }))
      );
    },
    {
      payload: { feature: 'consolidados' },
      slowMs: 700,
      message: 'Carga de consolidados del Panel'
    }
  );
}
async function oa(e) {
  return T(
    'guardar_consolidado',
    async () => {
      const { data: a, error: t } = await _.rpc('guardar_consolidado', { p: e });
      return t ? { ok: !1, error: t.message } : a || { ok: !0 };
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
async function sa(e) {
  return T(
    'eliminar_consolidado',
    async () => {
      const { data: a, error: t } = await _.rpc('eliminar_consolidado', { p_id: e });
      return t ? { ok: !1, error: t.message } : a || { ok: !0 };
    },
    { payload: { id: e }, message: 'Eliminacion de consolidado' }
  );
}
async function ra(e) {
  return O(
    'buscar_nv_basico',
    async () => {
      const a = String(e).trim();
      if (!a) return null;
      const t = [];
      (/^\d+$/.test(a) && t.push(`nv_ptm.eq.${Number(a)}`),
        t.push(`nv_orange.eq.${a}`, `nv_farmapack.eq.${a}`, `varios.ilike.*${a}*`));
      const { data: n } = await _.from(C)
        .select('nv_ptm,nv_orange,nv_farmapack,varios,cliente,estado,fecha_estado')
        .or(t.join(','))
        .order('fecha_estado', { ascending: !1 })
        .limit(1);
      if (!n || n.length === 0) return null;
      const o = n[0];
      return { nv: M(o), canal: U(o), cliente: o.cliente || null, estado: o.estado || null };
    },
    {
      payload: { nv: String(e || '').trim() },
      slowMs: 400,
      message: 'Busqueda basica de N.V. para consolidados'
    }
  );
}
export {
  ye as A,
  De as C,
  $e as E,
  Me as I,
  Ve as S,
  Ae as T,
  Le as V,
  Be as a,
  ra as b,
  Fe as c,
  Ue as d,
  sa as e,
  Ge as f,
  oa as g,
  ze as h,
  xe as i,
  Q as j,
  Xe as k,
  ta as l,
  ea as m,
  qe as n,
  We as o,
  Ze as p,
  je as q,
  He as r,
  ae as s,
  aa as t,
  Ke as u,
  Je as v,
  Qe as w,
  Ye as x,
  na as y
};
