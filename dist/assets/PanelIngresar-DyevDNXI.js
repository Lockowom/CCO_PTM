import { j as e } from './query-vendor-CzTZLhyg.js';
import { r as c, b as Ve, u as Ke } from './react-vendor-CByR7_Pi.js';
import {
  X as ia,
  S as De,
  ar as ca,
  z as Fe,
  r as da,
  as as ua,
  at as qe,
  a2 as ge,
  au as We,
  an as Ye,
  p as pa,
  t as Ae,
  a7 as we,
  aq as xa,
  a9 as $e,
  av as ma,
  aw as Ie,
  ax as Qe,
  ap as ha
} from './ui-vendor-DggzEJgL.js';
import { u as Ze } from './index-DpKQy1E-.js';
import {
  C as Oe,
  A as de,
  V as ga,
  c as Ee,
  I as Xe,
  E as Je,
  l as ba,
  b as Be,
  g as ye,
  e as fa,
  a as va,
  d as Na,
  f as ja,
  h as ya,
  i as wa,
  o as ea,
  j as aa,
  p as Ea,
  k as Sa,
  m as sa,
  n as Le,
  q as Ca,
  S as Te,
  r as _a,
  T as Ra,
  s as Pe,
  t as ta,
  u as ra,
  v as na,
  w as Aa,
  x as ka,
  y as Da
} from './ingresarService-_cVRia8V.js';
import { f as Ia } from './configService-CG_zb7ud.js';
import { e as Oa } from './exportExcel-CrAs1BHm.js';
import { c as Ta } from './index-BlrY7iKz.js';
import { g as ae } from './animation-vendor-DqxLxWcj.js';
import './supabase-vendor-4Fjsfb0a.js';
import './xlsx-B2eTCt_Q.js';
import './charts-vendor-C4xrueP1.js';
function Pa({ titulo: a, onClose: s, children: t, maxWidth: u = 'max-w-3xl', fullscreen: d = !1 }) {
  return (
    c.useEffect(() => {
      const j = (w) => w.key === 'Escape' && (s == null ? void 0 : s());
      document.addEventListener('keydown', j);
      const f = document.body.style.overflow;
      return (
        (document.body.style.overflow = 'hidden'),
        () => {
          (document.removeEventListener('keydown', j), (document.body.style.overflow = f));
        }
      );
    }, [s]),
    Ve.createPortal(
      e.jsx('div', {
        className: `fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex justify-center ${d ? 'items-stretch p-0' : 'items-end sm:items-center p-0 sm:p-4'}`,
        onClick: s,
        style: { animation: 'panelBackdropIn 0.2s ease both' },
        children: e.jsxs('div', {
          className: `bg-white w-full shadow-2xl overflow-hidden flex flex-col ${d ? 'h-screen max-w-none rounded-none' : `${u} sm:rounded-2xl rounded-t-2xl max-h-[88vh]`}`,
          onClick: (j) => j.stopPropagation(),
          style: {
            paddingBottom: 'env(safe-area-inset-bottom)',
            animation: 'panelModalIn 0.28s cubic-bezier(0.16,1,0.3,1) both'
          },
          children: [
            e.jsxs('div', {
              className: `flex items-center justify-between border-b border-slate-100 shrink-0 ${d ? 'px-6 py-4 sm:px-8' : 'px-5 py-3'}`,
              children: [
                e.jsx('h3', {
                  className: `font-black text-slate-800 ${d ? 'text-lg sm:text-2xl' : ''}`,
                  children: a
                }),
                e.jsx('button', {
                  onClick: s,
                  className: `rounded-lg hover:bg-slate-100 text-slate-400 ${d ? 'p-2.5' : 'p-1.5'}`,
                  children: e.jsx(ia, { size: d ? 22 : 18 })
                })
              ]
            }),
            e.jsx('div', { className: `overflow-y-auto ${d ? 'flex-1' : ''}`, children: t })
          ]
        })
      }),
      document.body
    )
  );
}
const F = {
    EN_PROCESO: 'En Proceso',
    SHIPPING: 'Shipping',
    EN_RUTA: 'En Ruta',
    ENTREGADO: 'Entregado',
    RECIBIDO_CONFORME: 'Recibido Conforme',
    RECIBIDO_OBS: 'Recibido C/OBS'
  },
  Va = {
    'EN PROCESO': F.EN_PROCESO,
    'EN SHIPPING': F.SHIPPING,
    'P / VENDEDOR': F.SHIPPING,
    'P / STOCK': F.EN_PROCESO,
    'P / RETIRO': F.SHIPPING,
    CURRIER: F.EN_RUTA,
    Currier: F.EN_RUTA,
    'EN RUTA': F.EN_RUTA,
    ENTREGADO: F.ENTREGADO,
    'RECIBIDO CONFORME': F.ENTREGADO,
    'RECIBIDO C/OBS': F.ENTREGADO,
    'Recibido Conforme': F.ENTREGADO,
    'Recibido C/OBS': F.ENTREGADO
  };
function la(a) {
  return a ? Va[a] || a : '';
}
const Fa = [F.EN_RUTA, F.ENTREGADO, F.RECIBIDO_CONFORME, F.RECIBIDO_OBS],
  $a = { [F.EN_PROCESO]: F.SHIPPING, [F.SHIPPING]: F.EN_RUTA, [F.EN_RUTA]: F.ENTREGADO },
  Ma = [
    { value: 'REZAGADA_COMERCIAL', label: 'Rezagada comercial' },
    { value: 'RETIRO_CLIENTE', label: 'Retiro de cliente' }
  ];
function Me(a) {
  return $a[la(a)] || null;
}
function oa(a, { nuevo: s = !1, pausada: t = !1 } = {}) {
  if (s) return [F.EN_PROCESO];
  const u = la(a),
    d = t ? null : Me(u);
  return d ? [u, d] : [u].filter(Boolean);
}
function za(a) {
  const s = (a || '').toUpperCase();
  return Fa.some((t) => t.toUpperCase() === s);
}
function qa(a, s) {
  const t = new Date(a);
  let u = 0;
  const d = t.getDay();
  for (d === 0 ? t.setDate(t.getDate() + 1) : d === 6 && t.setDate(t.getDate() + 2); u < s;) {
    t.setDate(t.getDate() + 1);
    const j = t.getDay();
    j !== 0 && j !== 6 && u++;
  }
  return t;
}
function Ue(a, s) {
  const t = s || a;
  if (!t) return '';
  const u = new Date(t + 'T12:00:00');
  if (isNaN(u.getTime())) return '';
  const d = qa(u, 2),
    j = d.getFullYear(),
    f = String(d.getMonth() + 1).padStart(2, '0'),
    w = String(d.getDate()).padStart(2, '0');
  return `${j}-${f}-${w}`;
}
const Ge = {
    nv: '',
    lookupResult: null,
    lookupLoading: !1,
    mode: 'idle',
    orangeAssociationRequired: !1,
    orangeAssociationNv: '',
    orangeAssociationData: null,
    orangeAssociationLoading: !1,
    orangeAssociationError: '',
    estado: F.EN_PROCESO,
    shippingSubestado: '',
    shippingPausaMotivo: '',
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
  he = Ta((a) => ({
    canal: 'ptm',
    ...Ge,
    patch: (s) => a(s),
    markAutoFilled: (s) =>
      a((t) => {
        const u = new Set(t.autoFilledDates);
        return (s.forEach((d) => u.add(d)), { autoFilledDates: u });
      }),
    clearAutoFilled: (s) =>
      a((t) => {
        const u = new Set(t.autoFilledDates);
        return (u.delete(s), { autoFilledDates: u });
      }),
    reset: () =>
      a({
        ...Ge,
        variosTipo: '',
        variosCliente: '',
        variosVendedor: '',
        variosDivision: '',
        variosCcosto: ''
      }),
    applyFound: (s) =>
      a(() => {
        const t = s.fecha_compromiso || Ue(s.fecha_aprobacion, s.fecha_aprobacion_real),
          u = !s.fecha_compromiso && !!t;
        return {
          mode: 'update',
          estado: s.estado || F.EN_PROCESO,
          shippingSubestado: s.shipping_subestado || '',
          shippingPausaMotivo: s.shipping_pausa_motivo || '',
          tipoDespacho: s.tipo_despacho || '',
          transportista: s.transportista || '',
          fechaCompromiso: t,
          fechaAprobacion: s.fecha_aprobacion || '',
          fechaAprobacionReal: s.fecha_aprobacion_real || '',
          fechaFacturacion: s.fecha_facturacion || '',
          fechaDespacho: s.fecha_despacho || '',
          factura: s.factura || '',
          guia: s.guia || '',
          bultos: s.bultos ? String(s.bultos) : '',
          valorFactura: s.valor_factura ? String(s.valor_factura) : '',
          numeroEnvio: s.numero_envio || '',
          urgente: String(s.urgente) === 'true' || s.urgente === !0,
          incidencia: s.incidencia || '',
          estadoIncidencia: s.estado_incidencia || 'ABIERTA',
          observacionesIncidencia: s.observaciones_incidencia || '',
          orangeAssociationNv: s.nv_orange || '',
          autoFilledDates: u ? new Set(['fechaCompromiso']) : new Set()
        };
      }),
    applyNew: (s) =>
      a(() => {
        const t = (s && s.fecha_compromiso) || '';
        return {
          mode: 'create',
          estado: F.EN_PROCESO,
          shippingSubestado: '',
          shippingPausaMotivo: '',
          tipoDespacho: '',
          transportista: '',
          fechaCompromiso: t,
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
          autoFilledDates: t ? new Set(['fechaCompromiso']) : new Set()
        };
      }),
    recalcCompromiso: () =>
      a((s) => {
        if (s.mode === 'idle') return s;
        const t = Ue(s.fechaAprobacion, s.fechaAprobacionReal);
        if (!t || t === s.fechaCompromiso) return s;
        const u = new Set(s.autoFilledDates);
        return (u.add('fechaCompromiso'), { fechaCompromiso: t, autoFilledDates: u });
      })
  })),
  Ba = ({
    items: a,
    active: s,
    onSelect: t,
    accent: u = '#ea580c',
    ease: d = 'power3.easeOut'
  }) => {
    const j = c.useRef([]),
      f = c.useRef([]),
      w = c.useRef([]),
      y = c.useRef([]);
    (c.useEffect(() => {
      var v;
      const p = () => {
        j.current.forEach((x, _) => {
          var J;
          if (!(x != null && x.parentElement)) return;
          const M = x.parentElement,
            $ = M.getBoundingClientRect(),
            { width: P, height: D } = $;
          if (P === 0 || D === 0) return;
          const E = ((P * P) / 4 + D * D) / (2 * D),
            B = Math.ceil(2 * E) + 2,
            z = Math.ceil(E - Math.sqrt(Math.max(0, E * E - (P * P) / 4))) + 1,
            O = B - z;
          ((x.style.width = `${B}px`),
            (x.style.height = `${B}px`),
            (x.style.bottom = `-${z}px`),
            ae.set(x, { xPercent: -50, scale: 0, transformOrigin: `50% ${O}px` }));
          const i = M.querySelector('.pc-label'),
            T = M.querySelector('.pc-label-hover');
          (i && ae.set(i, { y: 0 }),
            T && ae.set(T, { y: D + 12, opacity: 0 }),
            (J = f.current[_]) == null || J.kill());
          const Y = ae.timeline({ paused: !0 });
          (Y.to(x, { scale: 1.2, xPercent: -50, duration: 2, ease: d, overwrite: 'auto' }, 0),
            i && Y.to(i, { y: -(D + 8), duration: 2, ease: d, overwrite: 'auto' }, 0),
            T &&
              (ae.set(T, { y: Math.ceil(D + 100), opacity: 0 }),
              Y.to(T, { y: 0, opacity: 1, duration: 2, ease: d, overwrite: 'auto' }, 0)),
            (f.current[_] = Y));
        });
      };
      return (
        p(),
        window.addEventListener('resize', p),
        (v = document.fonts) != null && v.ready && document.fonts.ready.then(p).catch(() => {}),
        () => window.removeEventListener('resize', p)
      );
    }, [a, d]),
      c.useEffect(() => {
        a.forEach((p, v) => {
          var B;
          const x = y.current[v],
            _ = f.current[v],
            M = j.current[v],
            $ = x == null ? void 0 : x.querySelector('.pc-label'),
            P = x == null ? void 0 : x.querySelector('.pc-label-hover'),
            D = s === p.value,
            E = p.color || u;
          if (((B = w.current[v]) == null || B.kill(), !(!x || !M || !_))) {
            if (D) {
              ((x.style.background = E),
                (x.style.color = '#ffffff'),
                ae.set(M, { scale: 1.2, xPercent: -50 }),
                $ && ae.set($, { y: -(x.offsetHeight + 8) }),
                P && ae.set(P, { y: 0, opacity: 1 }),
                _.progress(1).pause());
              return;
            }
            ((x.style.background = ''),
              (x.style.color = ''),
              ae.set(M, { scale: 0, xPercent: -50 }),
              $ && ae.set($, { y: 0 }),
              P && ae.set(P, { y: x.offsetHeight + 12, opacity: 0 }),
              _.progress(0).pause());
          }
        });
      }, [s, a, u]));
    const o = (p) => {
        var x, _;
        if (s === ((x = a[p]) == null ? void 0 : x.value)) return;
        const v = f.current[p];
        v &&
          ((_ = w.current[p]) == null || _.kill(),
          (w.current[p] = v.tweenTo(v.duration(), { duration: 0.3, ease: d, overwrite: 'auto' })));
      },
      g = (p) => {
        var x, _;
        if (s === ((x = a[p]) == null ? void 0 : x.value)) return;
        const v = f.current[p];
        v &&
          ((_ = w.current[p]) == null || _.kill(),
          (w.current[p] = v.tweenTo(0, { duration: 0.2, ease: d, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: 'pc-track',
      children: a.map((p, v) => {
        const x = s === p.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => t(p.value),
            onMouseEnter: () => o(v),
            onMouseLeave: () => g(v),
            className: `pc-pill ${x ? 'pc-active' : ''}`,
            'aria-pressed': x,
            ref: (_) => {
              y.current[v] = _;
            },
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (_) => {
                  j.current[v] = _;
                },
                style: { background: p.color || u }
              }),
              e.jsxs('span', {
                className: 'pc-label-stack',
                children: [
                  e.jsx('span', { className: 'pc-label', children: p.label }),
                  e.jsx('span', {
                    className: 'pc-label-hover',
                    'aria-hidden': 'true',
                    children: p.label
                  })
                ]
              })
            ]
          },
          p.value
        );
      })
    });
  },
  ze = ({ items: a, active: s, onSelect: t, inline: u = !1, ease: d = 'power3.easeOut' }) => {
    const j = c.useRef([]),
      f = c.useRef([]),
      w = c.useRef([]);
    c.useEffect(() => {
      var p;
      const g = () => {
        j.current.forEach((v, x) => {
          var Y;
          if (!(v != null && v.parentElement)) return;
          const _ = v.parentElement,
            M = _.getBoundingClientRect(),
            { width: $, height: P } = M;
          if ($ === 0 || P === 0) return;
          const D = (($ * $) / 4 + P * P) / (2 * P),
            E = Math.ceil(2 * D) + 2,
            B = Math.ceil(D - Math.sqrt(Math.max(0, D * D - ($ * $) / 4))) + 1,
            z = E - B;
          ((v.style.width = `${E}px`),
            (v.style.height = `${E}px`),
            (v.style.bottom = `-${B}px`),
            ae.set(v, { xPercent: -50, scale: 0, transformOrigin: `50% ${z}px` }));
          const O = _.querySelector('.pc-label'),
            i = _.querySelector('.pc-label-hover');
          (O && ae.set(O, { y: 0 }),
            i && ae.set(i, { y: P + 12, opacity: 0 }),
            (Y = f.current[x]) == null || Y.kill());
          const T = ae.timeline({ paused: !0 });
          (T.to(v, { scale: 1.2, xPercent: -50, duration: 2, ease: d, overwrite: 'auto' }, 0),
            O && T.to(O, { y: -(P + 8), duration: 2, ease: d, overwrite: 'auto' }, 0),
            i &&
              (ae.set(i, { y: Math.ceil(P + 100), opacity: 0 }),
              T.to(i, { y: 0, opacity: 1, duration: 2, ease: d, overwrite: 'auto' }, 0)),
            (f.current[x] = T));
        });
      };
      return (
        g(),
        window.addEventListener('resize', g),
        (p = document.fonts) != null && p.ready && document.fonts.ready.then(g).catch(() => {}),
        () => window.removeEventListener('resize', g)
      );
    }, [a, d]);
    const y = (g) => {
        var v, x;
        if (s === ((v = a[g]) == null ? void 0 : v.value)) return;
        const p = f.current[g];
        p &&
          ((x = w.current[g]) == null || x.kill(),
          (w.current[g] = p.tweenTo(p.duration(), { duration: 0.3, ease: d, overwrite: 'auto' })));
      },
      o = (g) => {
        var v, x;
        if (s === ((v = a[g]) == null ? void 0 : v.value)) return;
        const p = f.current[g];
        p &&
          ((x = w.current[g]) == null || x.kill(),
          (w.current[g] = p.tweenTo(0, { duration: 0.2, ease: d, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: `pc-track pc-estado${u ? ' pc-inline' : ''}`,
      children: a.map((g, p) => {
        const v = s === g.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => t(g.value),
            onMouseEnter: () => y(p),
            onMouseLeave: () => o(p),
            className: `pc-pill ${v ? 'pc-active' : ''}`,
            style: v ? { background: g.color, color: '#fff' } : void 0,
            title: g.label,
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (x) => {
                  j.current[p] = x;
                },
                style: { background: g.color }
              }),
              e.jsxs('span', {
                className: 'pc-label-stack',
                children: [
                  e.jsxs('span', {
                    className: 'pc-label',
                    children: [
                      e.jsx('span', { className: 'pc-dot', style: { background: g.color } }),
                      g.label,
                      g.count != null && e.jsx('span', { className: 'pc-count', children: g.count })
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
                      g.label,
                      g.count != null &&
                        e.jsx('span', { className: 'pc-count pc-count-on', children: g.count })
                    ]
                  })
                ]
              })
            ]
          },
          g.value
        );
      })
    });
  };
function La({
  options: a,
  transportistasOpts: s,
  vendedoresMaestro: t,
  onLookup: u,
  onLookupOrange: d,
  canRequestReopen: j,
  onOpenReopen: f,
  latestReopenRequest: w
}) {
  var Ce, Ne, je, _e;
  const y = he(),
    {
      canal: o,
      nv: g,
      lookupResult: p,
      lookupLoading: v,
      mode: x,
      estado: _,
      shippingSubestado: M,
      shippingPausaMotivo: $,
      tipoDespacho: P,
      transportista: D,
      fechaCompromiso: E,
      fechaAprobacion: B,
      fechaAprobacionReal: z,
      fechaFacturacion: O,
      fechaDespacho: i,
      factura: T,
      guia: Y,
      bultos: J,
      valorFactura: ee,
      numeroEnvio: K,
      urgente: Q,
      variosTipo: L,
      variosCliente: re,
      variosVendedor: b,
      variosDivision: m,
      variosCcosto: N,
      orangeAssociationRequired: A,
      orangeAssociationNv: I,
      orangeAssociationData: Z,
      orangeAssociationLoading: ne,
      orangeAssociationError: r,
      incidencia: h,
      estadoIncidencia: R,
      observacionesIncidencia: k,
      errors: q,
      submitResult: se,
      autoFilledDates: te,
      patch: C,
      markAutoFilled: ue,
      clearAutoFilled: le,
      recalcCompromiso: V
    } = y;
  (c.useEffect(() => {
    if (x === 'idle') return;
    const l = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }),
      U = za(_),
      ce = _.toUpperCase() === F.SHIPPING.toUpperCase(),
      n = {},
      S = [];
    (U && !i && ((n.fechaDespacho = l), S.push('fechaDespacho')),
      (ce || U) && !O && ((n.fechaFacturacion = l), S.push('fechaFacturacion')),
      S.length > 0 && (C(n), ue(S)));
  }, [_, x]),
    c.useEffect(() => {
      x !== 'idle' && V();
    }, [z, x]));
  const H = c.useMemo(() => {
      const l = new Map();
      return (t.forEach((U) => l.set(U.nombre.trim().toLowerCase(), U)), l);
    }, [t]),
    pe = (l) => {
      const U = H.get(l.trim().toLowerCase());
      C(
        U
          ? {
              variosVendedor: l,
              variosDivision: U.division || '',
              variosCcosto: U.centro_costo || ''
            }
          : { variosVendedor: l }
      );
    },
    me = ((Ce = Oe.find((l) => l.value === o)) == null ? void 0 : Ce.color) || de,
    oe = {
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
    }[o] || {
      eyebrow: 'Canal',
      title: 'Operación',
      hint: 'Selecciona un canal para comenzar.',
      tone: 'from-slate-500/10 to-slate-500/10 border-slate-200',
      badge: 'Selección',
      color: de
    },
    xe = p
      ? p.found
        ? {
            container: 'bg-blue-50 text-blue-700 border-blue-200',
            iconWrap: 'bg-blue-100 text-blue-700',
            title: 'NV encontrada',
            description: `Fila ${p.row} lista para actualizar en el panel.`
          }
        : {
            container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            iconWrap: 'bg-emerald-100 text-emerald-700',
            title: 'NV nueva',
            description: 'No existe una coincidencia previa; el flujo continúa como creación.'
          }
      : null,
    W =
      (p == null ? void 0 : p.found) &&
      ((Ne = p == null ? void 0 : p.data) == null ? void 0 : Ne.estado) === 'Entregado',
    ie = ((je = p == null ? void 0 : p.data) == null ? void 0 : je.estado) || F.EN_PROCESO,
    Se = !!((_e = p == null ? void 0 : p.data) != null && _e.shipping_subestado),
    fe = oa(ie, { nuevo: x === 'create', pausada: Se }),
    ve = Me(ie);
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
                            style: {
                              border: `1px solid ${me}33`,
                              background: `${me}12`,
                              color: me
                            },
                            children: [e.jsx(De, { size: 12 }), 'Identificación']
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
                            className: `inline-block h-2.5 w-2.5 rounded-full ${x === 'idle' ? 'bg-slate-300' : p != null && p.found ? 'bg-blue-500' : 'bg-emerald-500'}`
                          }),
                          x === 'idle'
                            ? 'Pendiente de consulta'
                            : p != null && p.found
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
                          e.jsx(ca, { size: 15, className: 'text-slate-400' }),
                          e.jsx('label', {
                            className:
                              'text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em]',
                            children: 'Canal operativo'
                          })
                        ]
                      }),
                      e.jsx(Ba, {
                        items: Oe,
                        active: o,
                        onSelect: (l) =>
                          C({
                            canal: l,
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
                              e.jsx(Fe, {
                                size: 18,
                                className: 'absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                              }),
                              e.jsx('input', {
                                type: 'text',
                                inputMode: 'numeric',
                                value: g,
                                onChange: (l) => {
                                  const U = l.target.value;
                                  !U.trim() && x !== 'idle'
                                    ? C({
                                        nv: U,
                                        mode: 'idle',
                                        lookupResult: null,
                                        submitResult: null,
                                        errors: []
                                      })
                                    : C({ nv: U });
                                },
                                onKeyDown: (l) => l.key === 'Enter' && u(),
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
                        onClick: u,
                        disabled: v || !g.trim(),
                        className:
                          'h-14 min-w-[152px] px-5 rounded-2xl text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_16px_30px_-18px_rgba(24,24,27,0.8)] inline-flex items-center justify-center gap-2',
                        style: {
                          background: `linear-gradient(135deg, ${oe.color} 0%, #18181b 100%)`
                        },
                        children: v
                          ? e.jsx('span', {
                              className:
                                'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                            })
                          : e.jsxs(e.Fragment, {
                              children: [e.jsx(da, { size: 16 }), ' Buscar N.V.']
                            })
                      })
                    ]
                  }),
                  p &&
                    e.jsx('div', {
                      className: 'mt-4 anim-fade-up',
                      children: e.jsxs('div', {
                        className: `rounded-[1.35rem] border p-4 ${xe.container}`,
                        children: [
                          e.jsxs('div', {
                            className:
                              'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-start gap-3',
                                children: [
                                  e.jsx('div', {
                                    className: `h-10 w-10 rounded-2xl flex items-center justify-center ${xe.iconWrap}`,
                                    children: p.found
                                      ? e.jsx(ua, { size: 18 })
                                      : e.jsx(De, { size: 18 })
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx('div', {
                                        className: 'text-sm font-black',
                                        children: xe.title
                                      }),
                                      e.jsx('div', {
                                        className: 'text-xs mt-0.5 opacity-90',
                                        children: xe.description
                                      })
                                    ]
                                  })
                                ]
                              }),
                              e.jsx('div', {
                                className:
                                  'rounded-full border border-current/20 bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
                                children: p.found ? 'Actualizar' : 'Crear'
                              })
                            ]
                          }),
                          (() => {
                            const l = p.found ? p.data : p.autoFill;
                            if (!l) return null;
                            const U = [
                              { l: 'Cliente', v: l.cliente },
                              { l: 'Vendedor', v: l.vendedor },
                              { l: 'C. Costo', v: l.ccosto || l.centro_costo },
                              { l: 'División', v: l.division }
                            ].filter((ce) => ce.v);
                            return U.length === 0
                              ? null
                              : e.jsx('div', {
                                  className: 'mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5',
                                  children: U.map((ce) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className:
                                          'rounded-2xl border border-white/60 bg-white/70 px-3.5 py-3',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[10px] uppercase tracking-[0.16em] opacity-60 font-bold',
                                            children: ce.l
                                          }),
                                          e.jsx('div', {
                                            className: 'text-[13px] mt-1 font-semibold truncate',
                                            children: ce.v
                                          })
                                        ]
                                      },
                                      ce.l
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
                className: `relative rounded-[1.5rem] border bg-gradient-to-br ${oe.tone} p-4 sm:p-5`,
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500',
                    children: oe.eyebrow
                  }),
                  e.jsxs('div', {
                    className: 'mt-2 flex items-center justify-between gap-3',
                    children: [
                      e.jsx('div', {
                        className: 'text-2xl font-black text-slate-900',
                        children: oe.title
                      }),
                      e.jsx('div', {
                        className:
                          'rounded-full border bg-white/80 px-3 py-1 text-[11px] font-bold',
                        style: { borderColor: `${oe.color}33`, color: oe.color },
                        children: oe.badge
                      })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'mt-3 text-sm leading-6 text-slate-600',
                    children: oe.hint
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
      o === 'ptm' &&
        A &&
        x !== 'idle' &&
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
                      children: [e.jsx(qe, { size: 12 }), 'Asociación comercial']
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
                      value: I,
                      onChange: (l) =>
                        C({
                          orangeAssociationNv: l.target.value,
                          orangeAssociationError: '',
                          orangeAssociationData: null
                        }),
                      onKeyDown: (l) => l.key === 'Enter' && (d == null ? void 0 : d(I)),
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
                  onClick: () => (d == null ? void 0 : d(I)),
                  disabled: ne || !I.trim(),
                  className:
                    'h-11 px-5 rounded-xl bg-amber-500 text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2',
                  children: [
                    ne
                      ? e.jsx('span', {
                          className:
                            'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                        })
                      : e.jsx(qe, { size: 15 }),
                    'Validar asociación'
                  ]
                })
              ]
            }),
            r &&
              e.jsxs('div', {
                className:
                  'mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2',
                children: [e.jsx(ge, { size: 16 }), r]
              }),
            Z &&
              e.jsx('div', {
                className: 'mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3',
                children: [
                  { label: 'Cliente Orange', value: Z.cliente || '—' },
                  { label: 'Vendedor', value: Z.vendedor || '—' },
                  { label: 'Centro costo', value: Z.ccosto || '—' },
                  { label: 'División', value: Z.division || '—' }
                ].map((l) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-[10px] uppercase tracking-[0.16em] text-amber-700 font-bold',
                          children: l.label
                        }),
                        e.jsx('div', {
                          className: 'mt-1 text-sm font-semibold text-slate-800 truncate',
                          children: l.value
                        })
                      ]
                    },
                    l.label
                  )
                )
              })
          ]
        }),
      W &&
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
                      children: [e.jsx(ge, { size: 12 }), 'N.V. entregada bloqueada']
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
                j &&
                  e.jsx('button', {
                    type: 'button',
                    onClick: f,
                    className:
                      'h-11 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-sm hover:bg-orange-600',
                    children: 'Solicitar reapertura'
                  })
              ]
            }),
            w &&
              e.jsxs('div', {
                className: 'mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3',
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700',
                    children: 'Solicitud pendiente'
                  }),
                  e.jsx('div', {
                    className: 'mt-1 text-sm font-semibold text-slate-800',
                    children: w.motivo
                  }),
                  e.jsxs('div', {
                    className: 'mt-1 text-xs text-slate-500',
                    children: [
                      'Solicitada por ',
                      w.solicitada_por_nombre || 'Usuario',
                      ' el',
                      ' ',
                      String(w.solicitada_at || '').slice(0, 10) || '—'
                    ]
                  })
                ]
              })
          ]
        }),
      o === 'varios' &&
        x === 'create' &&
        e.jsxs('section', {
          className: 'bg-white rounded-2xl border border-orange-200 p-5 anim-fade-up',
          children: [
            e.jsxs('h2', {
              className: 'text-[11px] font-semibold text-orange-500 uppercase tracking-wider mb-4',
              children: [L || 'Varios', ' — Datos Manuales']
            }),
            e.jsxs('div', {
              className: 'mb-4',
              children: [
                e.jsx('label', { className: 'field-label', children: 'Tipo *' }),
                e.jsx('div', {
                  className: 'flex flex-wrap gap-2',
                  children: ga.map((l) =>
                    e.jsx(
                      'button',
                      {
                        type: 'button',
                        onClick: () => C({ variosTipo: l }),
                        className: `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${L === l ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'}`,
                        children: l
                      },
                      l
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
                      value: re,
                      onChange: (l) => C({ variosCliente: l.target.value }),
                      className: 'field-input',
                      placeholder: 'Ej: Hospital Regional'
                    })
                  ]
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', { className: 'field-label', children: 'Vendedor *' }),
                    t.length > 0
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx('input', {
                              type: 'text',
                              list: 'vendedores-list',
                              value: b,
                              onChange: (l) => pe(l.target.value),
                              className: 'field-input',
                              placeholder: 'Selecciona o escribe'
                            }),
                            e.jsx('datalist', {
                              id: 'vendedores-list',
                              children: t.map((l) => e.jsx('option', { value: l.nombre }, l.id))
                            })
                          ]
                        })
                      : e.jsx('input', {
                          type: 'text',
                          value: b,
                          onChange: (l) => C({ variosVendedor: l.target.value }),
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
                      value: m,
                      onChange: (l) => C({ variosDivision: l.target.value }),
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
                      value: N,
                      onChange: (l) => C({ variosCcosto: l.target.value }),
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
                      value: z,
                      onChange: (l) => C({ fechaAprobacionReal: l.target.value }),
                      className: 'field-input'
                    })
                  ]
                })
              ]
            })
          ]
        }),
      x !== 'idle' &&
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
                  children: e.jsx(ze, {
                    items: fe.map((l) => ({ value: l, label: l, color: Ee(l) })),
                    active: _,
                    onSelect: (l) => C({ estado: l })
                  })
                }),
                e.jsx('div', {
                  className:
                    'mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600',
                  children:
                    x === 'create'
                      ? 'Toda N.V. nueva comienza en En Proceso.'
                      : Se
                        ? 'La N.V. está pausada en Shipping. Debes reactivarla antes de avanzar.'
                        : ve
                          ? `Flujo bloqueado: el único avance permitido es ${ie} → ${ve}.`
                          : 'Estado final: cualquier reapertura requiere autorización.'
                }),
                _ === F.SHIPPING &&
                  e.jsxs('div', {
                    className: 'mb-5 rounded-2xl border border-violet-200 bg-violet-50/60 p-4',
                    children: [
                      e.jsxs('div', {
                        className: 'flex flex-col gap-1 mb-3',
                        children: [
                          e.jsx('span', {
                            className:
                              'text-[11px] font-black uppercase tracking-[0.14em] text-violet-700',
                            children: 'Situación especial en Shipping'
                          }),
                          e.jsx('span', {
                            className: 'text-xs text-slate-600',
                            children:
                              'Estas opciones pausan el reloj SLA si la N.V. todavía estaba dentro de plazo. No cambian el estado principal.'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'grid grid-cols-1 sm:grid-cols-3 gap-2',
                        children: [
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => C({ shippingSubestado: '', shippingPausaMotivo: '' }),
                            className: `rounded-xl border px-3 py-3 text-xs font-bold ${M ? 'border-slate-200 bg-white text-slate-600' : 'border-emerald-500 bg-emerald-500 text-white'}`,
                            children: 'Activa para despacho'
                          }),
                          Ma.map((l) =>
                            e.jsx(
                              'button',
                              {
                                type: 'button',
                                onClick: () => C({ shippingSubestado: l.value }),
                                className: `rounded-xl border px-3 py-3 text-xs font-bold ${M === l.value ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`,
                                children: l.label
                              },
                              l.value
                            )
                          )
                        ]
                      }),
                      M &&
                        e.jsxs('div', {
                          className: 'mt-3',
                          children: [
                            e.jsx('label', {
                              className: 'field-label',
                              children: 'Motivo obligatorio'
                            }),
                            e.jsx('textarea', {
                              value: $,
                              onChange: (l) => C({ shippingPausaMotivo: l.target.value }),
                              className: 'field-input min-h-[76px] resize-y',
                              placeholder:
                                'Indica por qué queda rezagada y quién debe resolverlo...'
                            })
                          ]
                        })
                    ]
                  }),
                e.jsxs('button', {
                  type: 'button',
                  onClick: () => C({ urgente: !Q }),
                  className: `w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-3.5 border-2 transition-all ${Q ? 'bg-red-50 border-red-400 shadow-sm shadow-red-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`,
                  children: [
                    e.jsxs('span', {
                      className: 'flex items-center gap-2.5',
                      children: [
                        e.jsx('span', {
                          className: `text-xl transition-transform ${Q ? 'scale-110' : 'opacity-40 grayscale'}`,
                          children: '🚨'
                        }),
                        e.jsxs('span', {
                          className: 'flex flex-col items-start',
                          children: [
                            e.jsx('span', {
                              className: `text-sm font-bold ${Q ? 'text-red-600' : 'text-gray-700'}`,
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
                      className: `relative w-12 h-6 rounded-full transition-colors shrink-0 ${Q ? 'bg-red-500' : 'bg-gray-300'}`,
                      children: e.jsx('span', {
                        className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${Q ? 'translate-x-6' : ''}`
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
                          value: P,
                          onChange: (l) => C({ tipoDespacho: l.target.value }),
                          className: 'field-input',
                          children: [
                            e.jsx('option', { value: '', children: '— Seleccionar —' }),
                            (
                              (a == null ? void 0 : a.tiposDespacho) || [
                                'Courier - Inyección',
                                'Directo',
                                'Courier (Retiro / Pick-up)'
                              ]
                            ).map((l) => e.jsx('option', { value: l, children: l }, l))
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Transportista' }),
                        s.length > 0
                          ? e.jsxs('select', {
                              value: D,
                              onChange: (l) => C({ transportista: l.target.value }),
                              className: 'field-input',
                              children: [
                                e.jsx('option', { value: '', children: '— Seleccionar —' }),
                                (D && !s.includes(D) ? [D, ...s] : s).map((l) =>
                                  e.jsx('option', { value: l, children: l }, l)
                                )
                              ]
                            })
                          : e.jsx('input', {
                              type: 'text',
                              value: D,
                              onChange: (l) => C({ transportista: l.target.value }),
                              placeholder: 'Nombre transportista',
                              className: 'field-input'
                            })
                      ]
                    }),
                    x === 'update' &&
                      e.jsxs('div', {
                        children: [
                          e.jsxs('label', {
                            className: 'field-label',
                            children: [
                              'Fecha Compromiso',
                              ' ',
                              te.has('fechaCompromiso')
                                ? e.jsx('span', {
                                    className: 'ml-1 normal-case',
                                    style: { color: de },
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
                            value: E,
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
                          value: B,
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
                          value: z,
                          onChange: (l) => C({ fechaAprobacionReal: l.target.value }),
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
                            'Fecha Facturación',
                            ' ',
                            te.has('fechaFacturacion') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: de },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: O,
                          onChange: (l) => {
                            (C({ fechaFacturacion: l.target.value }), le('fechaFacturacion'));
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
                            'Fecha Despacho',
                            ' ',
                            te.has('fechaDespacho') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: de },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: i,
                          onChange: (l) => {
                            (C({ fechaDespacho: l.target.value }), le('fechaDespacho'));
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
                          value: T,
                          onChange: (l) => C({ factura: l.target.value }),
                          className: 'field-input'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Guía' }),
                        e.jsx('input', {
                          type: 'text',
                          value: Y,
                          onChange: (l) => C({ guia: l.target.value }),
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
                          value: J,
                          onChange: (l) => C({ bultos: l.target.value }),
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
                              value: ee,
                              onChange: (l) =>
                                C({ valorFactura: l.target.value.replace(/[^0-9.]/g, '') }),
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
                          value: K,
                          onChange: (l) => C({ numeroEnvio: l.target.value }),
                          className: 'field-input'
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            x === 'update' &&
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
                    children: Xe.map((l) => {
                      const U = h === l,
                        ce =
                          l === 'PROBLEMAS DE DIRECCIÓN'
                            ? We
                            : l === 'PROBLEMAS DE TRANSPORTE'
                              ? Ye
                              : ge;
                      return e.jsxs(
                        'button',
                        {
                          type: 'button',
                          onClick: () =>
                            C({
                              incidencia: U ? '' : l,
                              estadoIncidencia: U ? 'ABIERTA' : R || 'ABIERTA'
                            }),
                          className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${U ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                          children: [e.jsx(ce, { size: 14 }), l]
                        },
                        l
                      );
                    })
                  }),
                  h &&
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
                              value: R,
                              onChange: (l) => C({ estadoIncidencia: l.target.value }),
                              className: 'field-input',
                              children: Je.map((l) => e.jsx('option', { value: l, children: l }, l))
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
                              value: h,
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
                              value: k,
                              onChange: (l) => C({ observacionesIncidencia: l.target.value }),
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
            q.length > 0 &&
              e.jsx('div', {
                className: 'bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up',
                children: q.map((l, U) =>
                  e.jsxs(
                    'p',
                    {
                      className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                      children: [e.jsx('span', { children: '⚠' }), l]
                    },
                    U
                  )
                )
              }),
            se &&
              !se.success &&
              e.jsx('div', {
                className: 'bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up',
                children: e.jsxs('p', {
                  className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                  children: [e.jsx('span', { children: '⚠' }), se.message]
                })
              })
          ]
        })
    ]
  });
}
function Ua({ toast: a }) {
  if (!a) return null;
  const s = a.type === 'success';
  return e.jsx('div', {
    className: `fixed top-4 left-1/2 z-[80] w-[min(92vw,56rem)] -translate-x-1/2 rounded-2xl border-2 px-6 py-5 shadow-2xl anim-pop ${s ? 'border-emerald-200 bg-emerald-600 text-white' : 'border-red-200 bg-red-600 text-white'}`,
    children: e.jsxs('div', {
      className: 'flex items-start gap-3',
      children: [
        e.jsx('div', { className: 'text-2xl leading-none', children: s ? '✓' : '⚠' }),
        e.jsxs('div', {
          className: 'min-w-0',
          children: [
            e.jsx('div', {
              className: 'text-[11px] font-black uppercase tracking-[0.24em] opacity-90',
              children: s ? 'Operacion confirmada' : 'Alerta del panel'
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
function Ga(a) {
  const s = a.nvs.map((u) => u.nv).join(' · '),
    t = a.fecha_comprometida ? ` · Compromiso ${a.fecha_comprometida}` : ' · sin fecha';
  return `${a.ticket} · NV ${s || '—'}${t}`;
}
function Re(a, s = {}) {
  return {
    ...{
      id: a.id,
      fecha_comprometida: a.fecha_comprometida || null,
      estado: a.estado,
      observacion: a.observacion || null,
      nvs: a.nvs.map((u) => ({ nv: u.nv, canal: u.canal, cliente: u.cliente }))
    },
    ...s
  };
}
function Ha({ operador: a }) {
  const [s, t] = c.useState([]),
    [u, d] = c.useState(!0),
    [j, f] = c.useState(''),
    [w, y] = c.useState(''),
    [o, g] = c.useState(!1),
    [p, v] = c.useState(''),
    [x, _] = c.useState(!1),
    [M, $] = c.useState([]),
    [P, D] = c.useState(''),
    [E, B] = c.useState(''),
    [z, O] = c.useState(!1),
    i = c.useCallback(async () => {
      (d(!0), f(''));
      try {
        t(await ba());
      } catch (b) {
        f((b == null ? void 0 : b.message) || 'Error al cargar consolidados');
      } finally {
        d(!1);
      }
    }, []);
  c.useEffect(() => {
    i();
  }, [i]);
  const T = (b) => {
      (y(b), setTimeout(() => y(''), 3e3));
    },
    Y = async () => {
      const b = p.trim();
      if (b) {
        if (M.some((m) => m.nv === b)) {
          T(`La NV ${b} ya está en la lista`);
          return;
        }
        _(!0);
        try {
          const m = await Be(b);
          if (!m) {
            T(`NV ${b} no existe en la base`);
            return;
          }
          ($((N) => [...N, { nv: m.nv, canal: m.canal, cliente: m.cliente }]), v(''));
        } finally {
          _(!1);
        }
      }
    },
    J = async () => {
      if (M.length === 0) {
        T('Agrega al menos una NV');
        return;
      }
      O(!0);
      const b = await ye({
        fecha_comprometida: P || null,
        observacion: E || null,
        created_by: a || null,
        nvs: M
      });
      if ((O(!1), !b.ok)) {
        T(b.error || 'Error al crear');
        return;
      }
      (T(`✓ ${b.ticket || 'Consolidado'} creado`), $([]), D(''), B(''), g(!1), i());
    },
    ee = async (b, m) => {
      const N = await ye(Re(b, { fecha_comprometida: m || null }));
      if (!N.ok) {
        T(N.error || 'Error');
        return;
      }
      t((A) => A.map((I) => (I.id === b.id ? { ...I, fecha_comprometida: m || null } : I)));
    },
    K = async (b) => {
      const m = b.estado === 'cerrado' ? 'abierto' : 'cerrado',
        N = await ye(Re(b, { estado: m }));
      if (!N.ok) {
        T(N.error || 'Error');
        return;
      }
      t((A) => A.map((I) => (I.id === b.id ? { ...I, estado: m } : I)));
    },
    Q = async (b) => {
      if (!confirm(`¿Eliminar ${b.ticket}? Las NVs volverán a medirse con las 48 hrs.`)) return;
      const m = await fa(b.id);
      if (!m.ok) {
        T(m.error || 'Error');
        return;
      }
      (T(`${b.ticket} eliminado`), t((N) => N.filter((A) => A.id !== b.id)));
    },
    L = async (b, m) => {
      const N = b.nvs
          .filter((I) => I.id !== m)
          .map((I) => ({ nv: I.nv, canal: I.canal, cliente: I.cliente })),
        A = await ye(Re(b, { nvs: N }));
      if (!A.ok) {
        T(A.error || 'Error');
        return;
      }
      t((I) =>
        I.map((Z) => (Z.id === b.id ? { ...Z, nvs: Z.nvs.filter((ne) => ne.id !== m) } : Z))
      );
    },
    re = async (b, m, N) => {
      const A = m.trim();
      if (!A) return;
      const I = await Be(A);
      if (!I) {
        T(`NV ${A} no existe`);
        return;
      }
      const Z = [
          ...b.nvs.map((r) => ({ nv: r.nv, canal: r.canal, cliente: r.cliente })),
          { nv: I.nv, canal: I.canal, cliente: I.cliente }
        ],
        ne = await ye(Re(b, { nvs: Z }));
      if (!ne.ok) {
        T(ne.error || 'Error');
        return;
      }
      (N(), i());
    };
  return e.jsxs('div', {
    className: 'anim-fade-up',
    children: [
      w &&
        e.jsx('div', {
          className:
            'fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] shadow-lg',
          children: w
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
          !o &&
            e.jsx('button', {
              onClick: () => g(!0),
              className: 'px-3 py-2 rounded-lg text-white text-[13px] font-semibold',
              style: { background: de },
              children: '+ Nuevo consolidado'
            })
        ]
      }),
      o &&
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
                  value: p,
                  onChange: (b) => v(b.target.value),
                  onKeyDown: (b) => {
                    b.key === 'Enter' && (b.preventDefault(), Y());
                  },
                  placeholder: 'N° NV (ej. 5646)',
                  className: 'inp flex-1 min-w-[160px]'
                }),
                e.jsx('button', {
                  onClick: Y,
                  disabled: x,
                  className:
                    'px-3 py-2 rounded-lg bg-gray-800 text-white text-[13px] font-medium disabled:opacity-50',
                  children: x ? 'Validando…' : 'Agregar NV'
                })
              ]
            }),
            M.length > 0 &&
              e.jsx('div', {
                className: 'flex flex-wrap gap-1.5 mb-3',
                children: M.map((b) =>
                  e.jsxs(
                    'span',
                    {
                      className:
                        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-200 text-[12px]',
                      children: [
                        e.jsx('b', { children: b.nv }),
                        ' ',
                        e.jsx('span', {
                          className: 'text-gray-400',
                          children: b.cliente || b.canal
                        }),
                        e.jsx('button', {
                          onClick: () => $((m) => m.filter((N) => N.nv !== b.nv)),
                          className: 'text-gray-400 hover:text-red-600',
                          children: '×'
                        })
                      ]
                    },
                    b.nv
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
                      value: P,
                      onChange: (b) => D(b.target.value),
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
                      onChange: (b) => B(b.target.value),
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
                  disabled: z || M.length === 0,
                  className:
                    'px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-50',
                  style: { background: de },
                  children: z ? 'Creando…' : 'Crear consolidado'
                }),
                e.jsx('button', {
                  onClick: () => {
                    (g(!1), $([]), D(''), B(''), v(''));
                  },
                  className:
                    'px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-[13px]',
                  children: 'Cancelar'
                })
              ]
            })
          ]
        }),
      j && e.jsx('p', { className: 'text-[13px] text-red-600 mb-3', children: j }),
      u
        ? e.jsx('p', {
            className: 'text-[13px] text-gray-400 py-8 text-center',
            children: 'Cargando…'
          })
        : s.length === 0
          ? e.jsx('p', {
              className: 'text-[13px] text-gray-400 py-8 text-center',
              children: 'Aún no hay consolidados.'
            })
          : e.jsx('div', {
              className: 'space-y-3',
              children: s.map((b) =>
                e.jsx(
                  Ka,
                  { c: b, onSetFecha: ee, onToggle: K, onEliminar: Q, onQuitarNv: L, onAddNv: re },
                  b.id
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
function Ka({ c: a, onSetFecha: s, onToggle: t, onEliminar: u, onQuitarNv: d, onAddNv: j }) {
  const [f, w] = c.useState(''),
    y = a.estado === 'cerrado';
  return e.jsxs('div', {
    className: `rounded-xl border p-4 ${y ? 'border-gray-200 bg-gray-50/60' : 'border-gray-200 bg-white'}`,
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between gap-2 flex-wrap mb-2',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsx('span', {
                className: 'px-2 py-0.5 rounded-lg text-white text-[12px] font-bold',
                style: { background: y ? '#6b7280' : de },
                children: a.ticket
              }),
              e.jsx('span', {
                className: `text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${y ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`,
                children: y ? 'Cerrado' : 'Abierto'
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
                    onChange: (o) => s(a, o.target.value),
                    className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg'
                  })
                ]
              }),
              e.jsx('button', {
                onClick: () => t(a),
                className:
                  'text-[12px] px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50',
                children: y ? 'Reabrir' : 'Cerrar'
              }),
              e.jsx('button', {
                onClick: () => u(a),
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
            : a.nvs.map((o) =>
                e.jsxs(
                  'span',
                  {
                    className:
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px]',
                    children: [
                      e.jsx('b', { children: o.nv }),
                      ' ',
                      e.jsx('span', { className: 'text-gray-400', children: o.cliente || o.canal }),
                      e.jsx('button', {
                        onClick: () => o.id && d(a, o.id),
                        className: 'text-gray-400 hover:text-red-600',
                        children: '×'
                      })
                    ]
                  },
                  o.id
                )
              )
      }),
      e.jsxs('div', {
        className: 'flex gap-2 items-center',
        children: [
          e.jsx('input', {
            value: f,
            onChange: (o) => w(o.target.value),
            onKeyDown: (o) => {
              o.key === 'Enter' && (o.preventDefault(), j(a, f, () => w('')));
            },
            placeholder: '+ Agregar NV',
            className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg flex-1 max-w-[200px]'
          }),
          e.jsx('button', {
            onClick: () => j(a, f, () => w('')),
            className: 'text-[12px] px-2 py-1 rounded-lg bg-gray-800 text-white',
            children: 'Agregar'
          })
        ]
      }),
      e.jsx('p', {
        className: 'mt-2 text-[11px] text-gray-400 font-mono select-all',
        children: Ga(a)
      })
    ]
  });
}
const be = (a) => (a ? String(a).slice(0, 10) : ''),
  Wa = ['Entregado', 'En Proceso', 'Shipping', 'En Ruta'],
  He = 60,
  Ya = 80;
function Qa(a, s) {
  const t = new Date(a);
  let u = 0;
  const d = t.getDay();
  for (d === 0 ? t.setDate(t.getDate() + 1) : d === 6 && t.setDate(t.getDate() + 2); u < s;) {
    t.setDate(t.getDate() + 1);
    const j = t.getDay();
    j !== 0 && j !== 6 && u++;
  }
  return t;
}
function Za(a, s) {
  const t = s || a;
  if (!t) return '';
  const u = new Date(t + 'T12:00:00');
  if (isNaN(u.getTime())) return '';
  const d = Qa(u, 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const ke = [
  { label: 'Registrada', dateKey: 'fecha_registro_nv' },
  { label: 'Aprobada', dateKey: 'fecha_aprobacion' },
  { label: 'En Proceso', dateKey: 'fecha_en_proceso' },
  { label: 'Shipping', dateKey: 'fecha_shipping' },
  { label: 'Despachada', dateKey: 'fecha_despacho' },
  { label: 'En Ruta', dateKey: 'fecha_en_ruta' },
  { label: 'Entregada', dateKey: 'fecha_entregado' }
];
function Xa(a, s) {
  if (!a || !s) return null;
  const t = new Date(a).getTime(),
    u = new Date(s).getTime();
  if (isNaN(t) || isNaN(u)) return null;
  const d = Math.round((u - t) / 864e5);
  return d >= 0 ? d : null;
}
function Ja({ data: a }) {
  const s = ke.map((u) => be(a[u.dateKey]));
  let t = -1;
  for (let u = s.length - 1; u >= 0; u--)
    if (s[u]) {
      t = u;
      break;
    }
  return e.jsx('div', {
    className: 'flex flex-col gap-0',
    children: ke.map((u, d) => {
      const j = s[d],
        f = !!j,
        w = d === t,
        y = d > 0 ? s[d - 1] : '',
        o = d > 0 && j && y ? Xa(y, j) : null,
        g = o !== null && o > 3;
      return e.jsxs(
        'div',
        {
          className: 'flex items-start gap-3',
          style: { minHeight: 44 },
          children: [
            e.jsxs('div', {
              className: 'flex flex-col items-center w-5 shrink-0',
              children: [
                d > 0 &&
                  e.jsx('div', {
                    className: 'w-0.5 h-3',
                    style: { background: f ? (g ? '#ef4444' : '#22c55e') : '#e5e7eb' }
                  }),
                d === 0 && e.jsx('div', { className: 'h-1' }),
                e.jsx('div', {
                  className: `rounded-full shrink-0 flex items-center justify-center transition-all ${w ? 'w-5 h-5 ring-4 ring-orange-100' : f ? 'w-4 h-4' : 'w-3.5 h-3.5 border-2 border-gray-300'}`,
                  style: { background: w ? '#f57c00' : f ? '#22c55e' : 'transparent' },
                  children:
                    f &&
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
                d < ke.length - 1 &&
                  e.jsx('div', {
                    className: 'w-0.5 flex-1 min-h-[8px]',
                    style: { background: f && s[d + 1] ? '#22c55e' : '#e5e7eb' }
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
                      className: `text-[12px] font-semibold ${w ? 'text-orange-600' : f ? 'text-gray-800' : 'text-gray-400'}`,
                      children: u.label
                    }),
                    o !== null &&
                      e.jsxs('span', {
                        className: `text-[10px] font-bold px-1.5 py-0.5 rounded-full ${g ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`,
                        children: [o, 'd']
                      })
                  ]
                }),
                j &&
                  e.jsx('span', { className: 'text-[11px] text-gray-400 font-medium', children: j })
              ]
            })
          ]
        },
        u.label
      );
    })
  });
}
function es({
  item: a,
  puedeEscribir: s,
  puedeEliminar: t,
  puedeAprobarReapertura: u,
  opts: d,
  onClose: j,
  onSaved: f,
  onDeleted: w
}) {
  var ce;
  const y = Ke(),
    [o, g] = c.useState(null),
    [p, v] = c.useState(!0),
    [x, _] = c.useState({}),
    [M, $] = c.useState(!1),
    [P, D] = c.useState(!1),
    [E, B] = c.useState(!1),
    [z, O] = c.useState(null),
    [i, T] = c.useState([]),
    [Y, J] = c.useState(!1),
    [ee, K] = c.useState(''),
    [Q, L] = c.useState(!1),
    [re, b] = c.useState(''),
    [m, N] = c.useState(''),
    [A, I] = c.useState(!1),
    [Z, ne] = c.useState(!1),
    [r, h] = c.useState(''),
    [R, k] = c.useState(!1),
    [q, se] = c.useState(''),
    [te, C] = c.useState(!1),
    ue = c.useMemo(
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
        motivo_reapertura: (a == null ? void 0 : a.motivoReapertura) || '',
        shipping_subestado: (a == null ? void 0 : a.shippingSubestado) || '',
        shipping_pausa_desde: (a == null ? void 0 : a.shippingPausaDesde) || '',
        shipping_pausa_motivo: (a == null ? void 0 : a.shippingPausaMotivo) || '',
        shipping_pausa_elegible_sla: (a == null ? void 0 : a.shippingPausaElegibleSla) === !0
      }),
      [a]
    );
  c.useEffect(() => {
    let n = !0;
    return (
      g(ue),
      v(!1),
      _a(a.id, { canal: a.canal, nv: a.nv }).then((S) => {
        n && (g(S.found ? S.data : null), _({}), v(!1));
      }),
      () => {
        n = !1;
      }
    );
  }, [a, ue]);
  const le = c.useCallback(async () => {
    if (!(a != null && a.id)) return (T([]), []);
    J(!0);
    try {
      const n = await sa(a.id);
      return (T(n), n);
    } catch {
      return (T([]), []);
    } finally {
      J(!1);
    }
  }, [a == null ? void 0 : a.id]);
  c.useEffect(() => {
    le();
  }, [le]);
  const V = (n) => (n in x ? x[n] : ((o == null ? void 0 : o[n]) ?? '' ?? '')),
    H = (n, S) => {
      _((G) => {
        const X = { ...G, [n]: S };
        return (
          n === 'fecha_aprobacion_real' &&
            (X.fecha_compromiso = Za(be(o == null ? void 0 : o.fecha_aprobacion), S)),
          X
        );
      });
    },
    pe = c.useMemo(() => {
      const n = {};
      return (
        Object.keys(x).forEach((S) => {
          const G = (o == null ? void 0 : o[S]) ?? '';
          String(x[S] ?? '') !== String(G ?? '') && (n[S] = x[S]);
        }),
        n
      );
    }, [x, o]),
    me = {
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
    oe = async () => {
      ($(!0), O(null));
      const n = { id: a.id };
      Object.entries(pe).forEach(([G, X]) => {
        n[me[G] || G] = G === 'urgente' ? String(X) === 'true' : X;
      });
      const S = await ra(n);
      ($(!1),
        S.ok
          ? (O({ success: !0, message: 'Cambios guardados' }),
            f == null ||
              f({
                ...a,
                estado: V('estado') || a.estado,
                transportista: V('transportista'),
                urgente: String(V('urgente')) === 'true'
              }),
            setTimeout(j, 700))
          : O({ success: !1, message: S.message || S.error || 'No se pudo guardar' }));
    },
    xe = async () => {
      D(!0);
      const n = await Da(a.id);
      (D(!1),
        n.ok
          ? (Ae.success(`NV ${a.nv} eliminada`), w == null || w(a), j())
          : (O({ success: !1, message: n.error || 'No se pudo eliminar' }), B(!1)));
    },
    W = (d == null ? void 0 : d.transportistas) || [],
    ie = String(V('urgente')) === 'true',
    Se = aa.includes(V('estado')) || !!V('incidencia'),
    fe = i.find((n) => n.estado === 'PENDIENTE') || null,
    ve = (o == null ? void 0 : o.estado) === 'Entregado',
    Ce = oa(o == null ? void 0 : o.estado, { pausada: !!(o != null && o.shipping_subestado) }),
    Ne = Me(o == null ? void 0 : o.estado),
    je = async (n) => {
      const S = String(m || '').trim();
      if (n && !S) {
        O({ success: !1, message: 'Debes indicar el motivo de la pausa Shipping.' });
        return;
      }
      I(!0);
      const G = await na(a.id, n, S);
      if ((I(!1), !G.ok)) {
        O({ success: !1, message: G.message || G.error || 'No se pudo actualizar Shipping.' });
        return;
      }
      (g((X) => ({
        ...X,
        shipping_subestado: G.shipping_subestado || '',
        shipping_pausa_desde: G.shipping_pausa_desde || '',
        shipping_pausa_motivo: n ? S : (X == null ? void 0 : X.shipping_pausa_motivo) || S,
        shipping_pausa_elegible_sla: G.shipping_pausa_elegible_sla === !0,
        shipping_pausa_total_segundos:
          G.shipping_pausa_total_segundos ?? (X == null ? void 0 : X.shipping_pausa_total_segundos)
      })),
        b(''),
        N(''),
        O({ success: !0, message: G.message }),
        f == null ||
          f({ ...a, estado: 'Shipping', shippingSubestado: G.shipping_subestado || '' }));
    },
    _e = async () => {
      const n = String(r || '').trim();
      if (n.length < 10 || !/[a-záéíóúüñ]/i.test(n)) {
        O({ success: !1, message: 'Escribe un motivo real de al menos 10 caracteres.' });
        return;
      }
      k(!0);
      const S = await ka(a.id, n);
      if ((k(!1), !S.ok)) {
        O({ success: !1, message: S.message || S.error || 'No se pudo corregir el estado.' });
        return;
      }
      const G = await Pe(a.canal, a.nv),
        X = G.found
          ? G.data
          : {
              ...o,
              estado: 'Shipping',
              fecha_estado: S.fecha_estado || (o == null ? void 0 : o.fecha_estado),
              fecha_en_ruta: '',
              fecha_despacho: '',
              shipping_subestado: ''
            };
      (g(X),
        _({}),
        ne(!1),
        h(''),
        O({ success: !0, message: S.message }),
        f == null || f({ ...a, estado: 'Shipping', shippingSubestado: '', fechaDespacho: '' }));
    },
    l = async () => {
      const n = String(q || '').trim();
      if (!n) {
        O({ success: !1, message: 'Describe el problema detectado en el armado.' });
        return;
      }
      C(!0);
      const S = await Aa(a.id, n);
      if ((C(!1), !S.ok)) {
        O({ success: !1, message: S.message || S.error || 'No se pudo reportar la incidencia.' });
        return;
      }
      (g((G) => ({
        ...G,
        incidencia: 'PROBLEMA DE ARMADO',
        estado_incidencia: 'ABIERTA',
        observaciones_incidencia: n,
        incidencia_area: 'BODEGA',
        incidencia_origen: 'POST_ENTREGA'
      })),
        se(''),
        O({ success: !0, message: S.message }));
    },
    U = async () => {
      const n = String(ee || '').trim();
      if (!n) {
        O({ success: !1, message: 'Debes indicar el motivo de la reapertura.' });
        return;
      }
      L(!0);
      const S = await ta(a.id, n);
      (L(!1),
        S.ok
          ? (K(''),
            await le(),
            O({ success: !0, message: S.message || 'Solicitud de reapertura enviada.' }))
          : O({
              success: !1,
              message: S.message || S.error || 'No se pudo solicitar la reapertura.'
            }));
    };
  return Ve.createPortal(
    e.jsxs('div', {
      className: 'panel-portal fixed inset-0 z-[120] flex justify-end',
      onClick: j,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (n) => n.stopPropagation(),
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
                          style: { background: Ee(a.estado) }
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
                  onClick: j,
                  className:
                    'w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 text-lg',
                  children: '✕'
                })
              ]
            }),
            e.jsx('div', {
              className: 'flex-1 overflow-y-auto min-h-0',
              children:
                !o && p
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
                                  .filter((n) => n.v)
                                  .map((n) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className: 'bg-gray-50 rounded-lg px-3 py-2',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[9px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5',
                                            children: n.l
                                          }),
                                          e.jsx('div', {
                                            className:
                                              'text-[13px] text-gray-800 font-medium truncate',
                                            title: n.v || '',
                                            children: n.v
                                          })
                                        ]
                                      },
                                      n.l
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
                                children: e.jsx(Ja, { data: o })
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
                                    children: e.jsx(Ie, { size: 16 })
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
                          ve
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
                                          children: e.jsx(Qe, { size: 18 })
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
                                    className:
                                      'rounded-2xl border border-amber-200 bg-amber-50/70 p-4',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'flex items-start gap-3',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700',
                                            children: e.jsx(ge, { size: 18 })
                                          }),
                                          e.jsxs('div', {
                                            className: 'min-w-0 flex-1',
                                            children: [
                                              e.jsx('h3', {
                                                className:
                                                  'text-[11px] font-black uppercase tracking-[0.16em] text-amber-800',
                                                children: 'Problema de armado · Bodega'
                                              }),
                                              e.jsx('p', {
                                                className: 'mt-1 text-xs text-slate-600',
                                                children:
                                                  'Registra un error detectado después de la entrega sin reabrir ni modificar el estado de la N.V.'
                                              })
                                            ]
                                          })
                                        ]
                                      }),
                                      (o == null ? void 0 : o.incidencia_origen) ===
                                        'POST_ENTREGA' &&
                                        e.jsxs('div', {
                                          className:
                                            'mt-3 rounded-xl border border-amber-200 bg-white px-3 py-3 text-xs text-slate-700',
                                          children: [
                                            e.jsx('div', {
                                              className: 'font-bold text-amber-800',
                                              children: 'Incidencia abierta asignada a Bodega'
                                            }),
                                            e.jsx('div', {
                                              className: 'mt-1',
                                              children: o.observaciones_incidencia
                                            })
                                          ]
                                        }),
                                      s &&
                                        e.jsxs('div', {
                                          className: 'mt-3 space-y-2',
                                          children: [
                                            e.jsx('textarea', {
                                              value: q,
                                              onChange: (n) => se(n.target.value),
                                              className: 'field-input min-h-[84px] resize-y',
                                              placeholder:
                                                'Describe qué producto se armó mal y cómo fue detectado...'
                                            }),
                                            e.jsx('button', {
                                              type: 'button',
                                              onClick: l,
                                              disabled: te,
                                              className:
                                                'w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50',
                                              children: te
                                                ? 'Reportando...'
                                                : 'Reportar incidencia a Bodega'
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
                                        children: 'Solicitud de reapertura'
                                      }),
                                      Y
                                        ? e.jsx('div', {
                                            className:
                                              'rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500',
                                            children: 'Cargando solicitudes...'
                                          })
                                        : fe
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
                                                        children: e.jsx($e, { size: 16 })
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
                                                            children: fe.motivo
                                                          }),
                                                          e.jsxs('div', {
                                                            className:
                                                              'mt-1 text-xs text-slate-500',
                                                            children: [
                                                              'Solicitada por',
                                                              ' ',
                                                              fe.solicitada_por_nombre || 'Usuario',
                                                              ' el',
                                                              ' ',
                                                              be(fe.solicitada_at)
                                                            ]
                                                          })
                                                        ]
                                                      })
                                                    ]
                                                  })
                                                }),
                                                u &&
                                                  e.jsxs('div', {
                                                    className:
                                                      'rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-4',
                                                    children: [
                                                      e.jsx('div', {
                                                        className:
                                                          'text-[11px] font-black uppercase tracking-[0.16em] text-blue-700',
                                                        children: 'Resolución centralizada'
                                                      }),
                                                      e.jsx('p', {
                                                        className:
                                                          'mt-1 text-xs leading-5 text-blue-700',
                                                        children:
                                                          'Esta solicitud se aprueba o rechaza desde la nueva bandeja, junto a todas las solicitudes pendientes.'
                                                      }),
                                                      e.jsx('button', {
                                                        type: 'button',
                                                        onClick: () => {
                                                          (j(), y('/panel/reaperturas'));
                                                        },
                                                        className:
                                                          'mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700',
                                                        children: 'Abrir bandeja de reaperturas'
                                                      })
                                                    ]
                                                  })
                                              ]
                                            })
                                          : s
                                            ? e.jsxs('div', {
                                                className: 'space-y-3',
                                                children: [
                                                  e.jsx('textarea', {
                                                    value: ee,
                                                    onChange: (n) => K(n.target.value),
                                                    className: 'field-input min-h-[96px] resize-y',
                                                    placeholder:
                                                      'Motivo obligatorio de reapertura: por qué se necesita devolver esta N.V. a En Proceso...'
                                                  }),
                                                  e.jsx('button', {
                                                    type: 'button',
                                                    onClick: U,
                                                    disabled: Q,
                                                    className:
                                                      'w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50',
                                                    children: Q
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
                            : s
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
                                          children: e.jsx(ze, {
                                            items: Ce.map((n) => ({
                                              value: n,
                                              label: n,
                                              color: Ee(n)
                                            })),
                                            active: V('estado'),
                                            onSelect: (n) => H('estado', n)
                                          })
                                        }),
                                        e.jsx('div', {
                                          className:
                                            'mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-600',
                                          children:
                                            o != null && o.shipping_subestado
                                              ? 'Esta N.V. está pausada en Shipping. Reactívala antes de avanzar.'
                                              : Ne
                                                ? `Secuencia obligatoria: desde ${o == null ? void 0 : o.estado} solo se permite avanzar a ${Ne}.`
                                                : 'Estado final bloqueado. Usa reapertura o incidencia post-entrega según corresponda.'
                                        }),
                                        (o == null ? void 0 : o.estado) === 'En Ruta' &&
                                          e.jsxs('div', {
                                            className:
                                              'mb-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4',
                                            children: [
                                              e.jsxs('div', {
                                                className: 'flex items-start gap-3',
                                                children: [
                                                  e.jsx('div', {
                                                    className:
                                                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700',
                                                    children: e.jsx(Ie, { size: 16 })
                                                  }),
                                                  e.jsxs('div', {
                                                    className: 'min-w-0 flex-1',
                                                    children: [
                                                      e.jsx('div', {
                                                        className:
                                                          'text-[10px] font-black uppercase tracking-[0.16em] text-amber-700',
                                                        children: 'Corrección de estado'
                                                      }),
                                                      e.jsx('p', {
                                                        className: 'mt-1 text-xs text-slate-600',
                                                        children:
                                                          'Úsala solo si la N.V. fue enviada a En Ruta por error. Volverá a Shipping y la acción quedará registrada.'
                                                      })
                                                    ]
                                                  })
                                                ]
                                              }),
                                              Z
                                                ? e.jsxs('div', {
                                                    className: 'mt-3 space-y-2',
                                                    children: [
                                                      e.jsx('textarea', {
                                                        value: r,
                                                        onChange: (n) => h(n.target.value),
                                                        maxLength: 500,
                                                        className:
                                                          'field-input min-h-[84px] resize-y',
                                                        placeholder:
                                                          'Motivo obligatorio: explica por qué se debe devolver a Shipping...'
                                                      }),
                                                      e.jsxs('div', {
                                                        className: 'grid grid-cols-2 gap-2',
                                                        children: [
                                                          e.jsx('button', {
                                                            type: 'button',
                                                            onClick: () => {
                                                              (ne(!1), h(''));
                                                            },
                                                            disabled: R,
                                                            className:
                                                              'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 disabled:opacity-50',
                                                            children: 'Cancelar'
                                                          }),
                                                          e.jsx('button', {
                                                            type: 'button',
                                                            onClick: _e,
                                                            disabled: R,
                                                            className:
                                                              'rounded-xl bg-amber-600 px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50',
                                                            children: R
                                                              ? 'Corrigiendo...'
                                                              : 'Confirmar corrección'
                                                          })
                                                        ]
                                                      })
                                                    ]
                                                  })
                                                : e.jsx('button', {
                                                    type: 'button',
                                                    onClick: () => ne(!0),
                                                    className:
                                                      'mt-3 w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100',
                                                    children: 'Corregir y volver a Shipping'
                                                  })
                                            ]
                                          }),
                                        (o == null ? void 0 : o.estado) === 'Shipping' &&
                                          e.jsxs('div', {
                                            className:
                                              'mb-4 rounded-2xl border border-violet-200 bg-violet-50/70 p-4',
                                            children: [
                                              e.jsx('div', {
                                                className:
                                                  'text-[10px] font-black uppercase tracking-[0.16em] text-violet-700',
                                                children: 'Control de Shipping'
                                              }),
                                              o.shipping_subestado
                                                ? e.jsxs('div', {
                                                    className: 'mt-3 space-y-3',
                                                    children: [
                                                      e.jsxs('div', {
                                                        className:
                                                          'rounded-xl border border-violet-200 bg-white px-3 py-3',
                                                        children: [
                                                          e.jsx('div', {
                                                            className:
                                                              'text-sm font-bold text-slate-800',
                                                            children:
                                                              ((ce = Te.find(
                                                                (n) =>
                                                                  n.value === o.shipping_subestado
                                                              )) == null
                                                                ? void 0
                                                                : ce.label) || o.shipping_subestado
                                                          }),
                                                          e.jsx('div', {
                                                            className:
                                                              'mt-1 text-xs text-slate-500',
                                                            children:
                                                              o.shipping_pausa_motivo ||
                                                              'Sin detalle.'
                                                          }),
                                                          e.jsx('div', {
                                                            className:
                                                              'mt-2 text-[11px] font-semibold text-violet-700',
                                                            children: o.shipping_pausa_elegible_sla
                                                              ? 'Pausa válida: temporalmente fuera de SLA/OTIF.'
                                                              : 'El atraso previo se mantiene en los indicadores.'
                                                          })
                                                        ]
                                                      }),
                                                      e.jsx('button', {
                                                        type: 'button',
                                                        onClick: () => je(null),
                                                        disabled: A,
                                                        className:
                                                          'w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50',
                                                        children: A
                                                          ? 'Reactivando...'
                                                          : 'Reactivar N.V. para despacho'
                                                      })
                                                    ]
                                                  })
                                                : e.jsxs('div', {
                                                    className: 'mt-3 space-y-3',
                                                    children: [
                                                      e.jsx('div', {
                                                        className: 'grid grid-cols-2 gap-2',
                                                        children: Te.map((n) =>
                                                          e.jsx(
                                                            'button',
                                                            {
                                                              type: 'button',
                                                              onClick: () => b(n.value),
                                                              className: `rounded-xl border px-3 py-3 text-xs font-bold ${re === n.value ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`,
                                                              children: n.label
                                                            },
                                                            n.value
                                                          )
                                                        )
                                                      }),
                                                      re &&
                                                        e.jsxs(e.Fragment, {
                                                          children: [
                                                            e.jsx('textarea', {
                                                              value: m,
                                                              onChange: (n) => N(n.target.value),
                                                              className:
                                                                'field-input min-h-[76px] resize-y',
                                                              placeholder:
                                                                'Motivo obligatorio y responsable de resolverlo...'
                                                            }),
                                                            e.jsx('button', {
                                                              type: 'button',
                                                              onClick: () => je(re),
                                                              disabled: A,
                                                              className:
                                                                'w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50',
                                                              children: A
                                                                ? 'Guardando...'
                                                                : 'Pausar Shipping'
                                                            })
                                                          ]
                                                        })
                                                    ]
                                                  })
                                            ]
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
                                                  value: V('tipo_despacho'),
                                                  onChange: (n) =>
                                                    H('tipo_despacho', n.target.value),
                                                  className: 'field-input',
                                                  children: [
                                                    e.jsx('option', { value: '', children: '—' }),
                                                    (
                                                      (d == null ? void 0 : d.tiposDespacho) || Ra
                                                    ).map((n) =>
                                                      e.jsx('option', { value: n, children: n }, n)
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
                                                W.length > 0
                                                  ? e.jsxs('select', {
                                                      value: V('transportista'),
                                                      onChange: (n) =>
                                                        H('transportista', n.target.value),
                                                      className: 'field-input',
                                                      children: [
                                                        e.jsx('option', {
                                                          value: '',
                                                          children: '—'
                                                        }),
                                                        (V('transportista') &&
                                                        !W.includes(V('transportista'))
                                                          ? [V('transportista'), ...W]
                                                          : W
                                                        ).map((n) =>
                                                          e.jsx(
                                                            'option',
                                                            { value: n, children: n },
                                                            n
                                                          )
                                                        )
                                                      ]
                                                    })
                                                  : e.jsx('input', {
                                                      type: 'text',
                                                      value: V('transportista'),
                                                      onChange: (n) =>
                                                        H('transportista', n.target.value),
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
                                              onClick: () => H('urgente', ie ? 'false' : 'true'),
                                              className: `relative w-11 h-6 rounded-full transition-colors ${ie ? 'bg-red-500' : 'bg-gray-200'}`,
                                              children: e.jsx('span', {
                                                className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${ie ? 'translate-x-5' : ''}`
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
                                                  value: V('fecha_aprobacion_real'),
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
                                                        color: V('fecha_compromiso')
                                                          ? de
                                                          : '#9ca3af'
                                                      },
                                                      children: '(auto)'
                                                    })
                                                  ]
                                                }),
                                                e.jsx('input', {
                                                  type: 'date',
                                                  value: V('fecha_compromiso'),
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
                                                  value: V('fecha_facturacion'),
                                                  onChange: (n) =>
                                                    H('fecha_facturacion', n.target.value),
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
                                                  value: V('fecha_despacho'),
                                                  onChange: (n) =>
                                                    H('fecha_despacho', n.target.value),
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
                                                  value: V('factura'),
                                                  onChange: (n) => H('factura', n.target.value),
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
                                                  value: V('guia'),
                                                  onChange: (n) => H('guia', n.target.value),
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
                                                  value: V('numero_envio'),
                                                  onChange: (n) =>
                                                    H('numero_envio', n.target.value),
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
                                                  value: V('bultos'),
                                                  onChange: (n) => H('bultos', n.target.value),
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
                                                      value: V('valor_factura'),
                                                      onChange: (n) =>
                                                        H(
                                                          'valor_factura',
                                                          n.target.value.replace(/[^0-9.]/g, '')
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
                                    Se &&
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
                                            children: Xe.map((n) => {
                                              const S = V('incidencia') === n,
                                                G =
                                                  n === 'PROBLEMAS DE DIRECCIÓN'
                                                    ? We
                                                    : n === 'PROBLEMAS DE TRANSPORTE'
                                                      ? Ye
                                                      : ge;
                                              return e.jsxs(
                                                'button',
                                                {
                                                  type: 'button',
                                                  onClick: () => {
                                                    const X = !S;
                                                    (H('incidencia', X ? n : ''),
                                                      H(
                                                        'estado_incidencia',
                                                        (X && V('estado_incidencia')) || 'ABIERTA'
                                                      ),
                                                      X || H('observaciones_incidencia', ''));
                                                  },
                                                  className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${S ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                                                  children: [e.jsx(G, { size: 14 }), n]
                                                },
                                                n
                                              );
                                            })
                                          }),
                                          V('incidencia') &&
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
                                                      value: V('estado_incidencia') || 'ABIERTA',
                                                      onChange: (n) =>
                                                        H('estado_incidencia', n.target.value),
                                                      className: 'field-input',
                                                      children: Je.map((n) =>
                                                        e.jsx(
                                                          'option',
                                                          { value: n, children: n },
                                                          n
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
                                                      value: V('observaciones_incidencia'),
                                                      onChange: (n) =>
                                                        H(
                                                          'observaciones_incidencia',
                                                          n.target.value
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
                          z &&
                            e.jsxs('div', {
                              className: `rounded-xl px-3.5 py-3 text-[13px] ${z.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`,
                              children: [z.success ? '✓ ' : '⚠ ', z.message]
                            })
                        ]
                      })
                    : e.jsx('div', {
                        className: 'py-20 text-center text-sm text-gray-400',
                        children: 'No se pudieron cargar los datos de esta NV.'
                      })
            }),
            o &&
              ((s && !ve) || t) &&
              e.jsxs('div', {
                className: 'shrink-0 bg-white border-t border-gray-200 p-4 space-y-2',
                children: [
                  s &&
                    !ve &&
                    Object.keys(pe).length > 0 &&
                    e.jsx('button', {
                      onClick: oe,
                      disabled: M,
                      className:
                        'w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60',
                      style: { background: de },
                      children: M
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
                        : `Guardar ${Object.keys(pe).length} cambio${Object.keys(pe).length !== 1 ? 's' : ''}`
                    }),
                  t &&
                    (E
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
                                  onClick: () => B(!1),
                                  className:
                                    'flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50',
                                  children: 'Cancelar'
                                }),
                                e.jsx('button', {
                                  onClick: xe,
                                  disabled: P,
                                  className:
                                    'flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60',
                                  children: P ? 'Eliminando…' : 'Sí, eliminar'
                                })
                              ]
                            })
                          ]
                        })
                      : e.jsx('button', {
                          onClick: () => B(!0),
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
const as = c.memo(function ({ i: s, onOpen: t }) {
  var u;
  return e.jsxs('div', {
    onClick: () => t(s),
    className: `w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border bg-white hover:border-gray-300 text-left transition-all cursor-pointer ${s.urgente ? 'border-red-200' : 'border-gray-200'}`,
    children: [
      e.jsxs('span', {
        className: 'min-w-0 flex-1',
        children: [
          e.jsxs('span', {
            className: 'flex items-center gap-2',
            children: [
              e.jsxs('span', {
                className: 'text-[14px] font-semibold text-gray-900',
                children: ['NV ', s.nv]
              }),
              e.jsx('span', {
                className: 'text-[10px] font-medium text-gray-400 uppercase tracking-wide',
                children: s.canal
              }),
              s.urgente && e.jsx('span', { className: 'text-[11px]', children: '🚨' })
            ]
          }),
          e.jsxs('span', {
            className: 'block text-[12px] text-gray-500 truncate mt-0.5',
            children: [s.cliente || '—', s.vendedor ? ` · ${s.vendedor}` : '']
          }),
          (s.guia || s.factura) &&
            e.jsxs('span', {
              className: 'block text-[11px] text-gray-400 truncate mt-0.5',
              children: [
                s.guia ? `Guía: ${s.guia}` : '',
                s.guia && s.factura ? ' · ' : '',
                s.factura ? `Fact: ${s.factura}` : ''
              ]
            }),
          (s.fechaAprobacion || s.fechaAprobacionReal) &&
            e.jsxs('span', {
              className: 'block text-[11px] text-gray-400 truncate mt-0.5',
              children: [
                s.fechaAprobacion ? `Aprob: ${s.fechaAprobacion}` : '',
                s.fechaAprobacion && s.fechaAprobacionReal ? ' · ' : '',
                s.fechaAprobacionReal ? `Real: ${s.fechaAprobacionReal}` : ''
              ]
            })
        ]
      }),
      e.jsxs('span', {
        className: 'flex flex-col items-end gap-1 shrink-0',
        children: [
          e.jsxs('span', {
            className:
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-gray-50 border border-gray-100',
            children: [
              e.jsx('span', {
                className: 'w-1.5 h-1.5 rounded-full',
                style: { background: Ee(s.estado) }
              }),
              e.jsx('span', { className: 'text-gray-600', children: s.estado })
            ]
          }),
          s.shippingSubestado &&
            e.jsxs('span', {
              className:
                'inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700',
              children: [
                '⏸',
                ' ',
                ((u = Te.find((d) => d.value === s.shippingSubestado)) == null
                  ? void 0
                  : u.label) || s.shippingSubestado
              ]
            })
        ]
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
function ss({ puedeEscribir: a, puedeEliminar: s, puedeAprobarReapertura: t }) {
  const [u, d] = c.useState([]),
    [j, f] = c.useState(!0),
    [w, y] = c.useState('Todos'),
    [o, g] = c.useState(''),
    [p, v] = c.useState(null),
    [x, _] = c.useState([]),
    [M, $] = c.useState(!1),
    [P, D] = c.useState(null),
    [E, B] = c.useState(null),
    [z, O] = c.useState(!1),
    [i, T] = c.useState(He),
    Y = c.useRef(null),
    J = c.useRef(0),
    ee = c.useCallback((m = !1) => {
      (f(!0),
        va({ force: m, full: !1, limit: 400 })
          .then((N) => {
            (d(N), f(!1));
          })
          .catch(() => {
            (d([]), f(!1));
          }));
    }, []);
  c.useEffect(() => {
    ee();
  }, [ee]);
  const K = o.trim().length >= 2;
  (c.useEffect(() => {
    const m = o.trim();
    if (m.length < 2) {
      _([]);
      return;
    }
    _(Na(u, m, { limit: 120 }));
  }, [o, u]),
    c.useEffect(() => {
      const m = o.trim();
      if (m.length < 2) {
        (v(null), $(!1));
        return;
      }
      $(!0);
      const N = J.current + 1;
      J.current = N;
      const A = new AbortController(),
        I = setTimeout(() => {
          ja(m, { limit: 120, signal: A.signal })
            .then((Z) => {
              J.current === N && v(Z);
            })
            .catch(() => {
              J.current === N && v([]);
            })
            .finally(() => {
              J.current === N && $(!1);
            });
        }, 450);
      return () => {
        (clearTimeout(I), A.abort());
      };
    }, [o]));
  const Q = c.useCallback(async () => {
      O(!0);
      try {
        const m = await ya();
        if (!m.length) {
          Ae.warning('No hay operaciones para exportar.');
          return;
        }
        (Oa({ filename: 'Operaciones_NV', sheets: [{ name: 'Notas de Venta', rows: m }] }),
          Ae.success(`Exportadas ${m.length} N.V. a Excel`));
      } catch (m) {
        Ae.error('No se pudo exportar: ' + ((m == null ? void 0 : m.message) || 'error'));
      } finally {
        O(!1);
      }
    }, []),
    L = c.useMemo(
      () =>
        K ? wa(x, p || [], o, { limit: 160 }) : u.filter((m) => w === 'Todos' || m.estado === w),
      [K, x, p, o, u, w]
    ),
    re = c.useMemo(() => L.slice(0, i), [L, i]),
    b = c.useMemo(() => {
      const m = {};
      return (
        u.forEach((N) => {
          m[N.estado] = (m[N.estado] || 0) + 1;
        }),
        m
      );
    }, [u]);
  return (
    c.useEffect(() => {
      T((m) => {
        const N = Math.min(L.length, He);
        return m === N && m <= L.length ? m : N;
      });
    }, [K, w, o, L.length]),
    c.useEffect(() => {
      !P ||
        E ||
        ea()
          .then(B)
          .catch(() => {});
    }, [P, E]),
    c.useEffect(() => {
      if (i >= L.length) return;
      const m = Y.current;
      if (!m) return;
      const N = new IntersectionObserver(
        (A) => {
          A.some((I) => I.isIntersecting) && T((I) => Math.min(I + Ya, L.length));
        },
        { root: null, rootMargin: '240px 0px', threshold: 0 }
      );
      return (N.observe(m), () => N.disconnect());
    }, [i, L.length]),
    e.jsxs('div', {
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          className: 'relative',
          children: [
            e.jsx(Fe, {
              size: 16,
              className: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            }),
            e.jsx('input', {
              value: o,
              onChange: (m) => g(m.target.value),
              placeholder: 'Buscar por NV, cliente, guía o factura (cualquier estado)…',
              className:
                'w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none bg-white'
            }),
            M &&
              e.jsx(we, {
                size: 16,
                className: 'absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin'
              })
          ]
        }),
        !K &&
          (() => {
            const m = aa
              .filter((N) => (b[N] || 0) > 0)
              .map((N) => ({ value: N, label: N, color: Ee(N), count: b[N] || 0 }));
            return m.length === 0
              ? null
              : e.jsx(ze, {
                  items: m,
                  active: w,
                  inline: !0,
                  onSelect: (N) => y(w === N ? 'Todos' : N)
                });
          })(),
        e.jsxs('div', {
          className: 'flex items-center justify-between gap-2 flex-wrap',
          children: [
            e.jsx('span', {
              className: 'text-[12px] text-gray-400',
              children: K
                ? `${re.length} de ${L.length} resultado${L.length !== 1 ? 's' : ''} · búsqueda en todos los estados`
                : `${re.length} de ${L.length} activas visibles · total activas ${u.length}`
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsxs('button', {
                  onClick: Q,
                  disabled: z,
                  className:
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition-colors',
                  title: 'Descargar TODAS las N.V. (todas las columnas) a Excel',
                  children: [
                    z
                      ? e.jsx(we, { size: 14, className: 'animate-spin' })
                      : e.jsx(xa, { size: 14 }),
                    z ? 'Exportando…' : 'Exportar Excel'
                  ]
                }),
                e.jsx('button', {
                  onClick: () => ee(!0),
                  className:
                    'inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-orange-600 font-medium',
                  children: '↻ Recargar'
                })
              ]
            })
          ]
        }),
        (j && !K) || (M && !p)
          ? e.jsx('div', {
              className: 'py-16 flex justify-center',
              children: e.jsx(we, { className: 'animate-spin text-orange-500', size: 30 })
            })
          : L.length === 0
            ? e.jsx('div', {
                className: 'text-center py-16 text-gray-400 text-sm',
                children: K
                  ? 'Sin N.V. que coincidan con la búsqueda.'
                  : 'Sin N.V. activas para este filtro.'
              })
            : e.jsxs('div', {
                className: 'space-y-2',
                children: [
                  re.map((m) => e.jsx(as, { i: m, onOpen: D }, m.key)),
                  i < L.length &&
                    e.jsx('div', {
                      ref: Y,
                      className: 'flex items-center justify-center py-4',
                      children: e.jsxs('div', {
                        className:
                          'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-500 shadow-sm',
                        children: [
                          e.jsx(we, { size: 14, className: 'animate-spin text-orange-500' }),
                          'Cargando más N.V...'
                        ]
                      })
                    })
                ]
              }),
        P &&
          e.jsx(es, {
            item: P,
            puedeEscribir: a,
            puedeEliminar: s,
            puedeAprobarReapertura: t,
            opts: E,
            onClose: () => D(null),
            onSaved: (m) => {
              (d((N) => N.map((A) => (A.key === m.key ? { ...A, ...m } : A))),
                v((N) => N && N.map((A) => (A.key === m.key ? { ...A, ...m } : A))));
            },
            onDeleted: (m) => {
              (d((N) => N.filter((A) => A.key !== m.key)),
                v((N) => N && N.filter((A) => A.key !== m.key)));
            }
          })
      ]
    })
  );
}
function ts({ canal: a, nv: s, onClose: t }) {
  var j;
  const u = Ke(),
    d = (((j = Oe.find((f) => f.value === a)) == null ? void 0 : j.label) || a || '').toUpperCase();
  return Ve.createPortal(
    e.jsxs('div', {
      className: 'fixed inset-0 z-[60] flex items-center justify-center p-4',
      onClick: t,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (f) => f.stopPropagation(),
          className:
            'relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden anim-fade-up',
          children: [
            e.jsxs('div', {
              className: 'px-6 pt-6 pb-5 text-center',
              children: [
                e.jsx('div', {
                  className:
                    'w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-4',
                  children: e.jsx(ge, { size: 26 })
                }),
                e.jsx('h3', {
                  className: 'text-[16px] font-black text-gray-900',
                  children: 'Cliente no encontrado'
                }),
                e.jsxs('p', {
                  className: 'mt-2 text-[13px] text-gray-500 leading-relaxed',
                  children: [
                    'La N.V. ',
                    e.jsx('strong', { className: 'text-gray-700', children: s }),
                    ' del canal',
                    ' ',
                    e.jsx('strong', { className: 'text-gray-700', children: d }),
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
                  onClick: () => u('/inbound/data-import'),
                  className:
                    'w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform',
                  style: { background: de },
                  children: [e.jsx(ha, { size: 16 }), ' Ir a Carga Masiva']
                }),
                e.jsx('button', {
                  onClick: t,
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
function rs({
  item: a,
  puedeEscribir: s,
  puedeAprobarReapertura: t,
  motivo: u,
  onMotivoChange: d,
  onRequestReopen: j,
  requesting: f,
  onClose: w
}) {
  if (!a) return null;
  const y = a.estado === 'Entregado',
    o = y
      ? 'ALERTA CRITICA: N.V. ENTREGADA Y BLOQUEADA'
      : 'ALERTA CRITICA: N.V. DUPLICADA DETECTADA';
  return e.jsx(Pa, {
    titulo: y ? 'N.V. entregada detectada' : 'N.V. ya registrada',
    onClose: w,
    fullscreen: !0,
    children: e.jsx('div', {
      className:
        'flex min-h-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-5 sm:px-8 sm:py-8',
      children: e.jsxs('div', {
        className: 'mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-6',
        children: [
          e.jsxs('div', {
            className: `rounded-[2rem] border-2 px-5 py-6 sm:px-8 sm:py-8 shadow-2xl ${y ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`,
            children: [
              e.jsx('div', {
                className: `mb-5 rounded-2xl border px-4 py-4 sm:px-6 ${y ? 'border-red-200 bg-red-100 text-red-800' : 'border-amber-200 bg-amber-100 text-amber-800'}`,
                children: e.jsx('div', {
                  className:
                    'text-lg sm:text-3xl font-black uppercase tracking-[0.18em] leading-tight text-center',
                  children: o
                })
              }),
              e.jsxs('div', {
                className: 'flex flex-col gap-5 sm:flex-row sm:items-start',
                children: [
                  e.jsx('div', {
                    className: `mt-0.5 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl ${y ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`,
                    children: y ? e.jsx(Qe, { size: 34 }) : e.jsx(ge, { size: 34 })
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
                          y
                            ? ' QUEDA BLOQUEADA PARA NO ALTERAR OTIF Y SLA UNA VEZ ENTREGADA.'
                            : ' EL FORMULARIO YA QUEDO EN MODO ACTUALIZACION PARA EVITAR GENERAR UN DUPLICADO.'
                        ]
                      }),
                      a.reabierta &&
                        e.jsxs('div', {
                          className:
                            'mt-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-orange-700',
                          children: [e.jsx(Ie, { size: 14 }), 'N.V. reabierta']
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
          y &&
            s &&
            !a.pendingRequest &&
            e.jsxs('div', {
              className:
                'rounded-[2rem] border border-slate-200 bg-white px-5 py-5 shadow-2xl sm:px-8 sm:py-6',
              children: [
                e.jsxs('div', {
                  className:
                    'flex items-center gap-3 text-base sm:text-xl font-black uppercase text-slate-800',
                  children: [
                    e.jsx($e, { size: 20, className: 'text-orange-600' }),
                    'Solicitar reapertura'
                  ]
                }),
                e.jsx('textarea', {
                  value: u,
                  onChange: (g) => d(g.target.value),
                  className: 'field-input mt-4 min-h-[160px] resize-y',
                  placeholder:
                    'Observación obligatoria: explica por qué se necesita reabrir esta N.V. entregada...'
                }),
                e.jsx('button', {
                  type: 'button',
                  onClick: j,
                  disabled: f,
                  className:
                    'mt-4 w-full rounded-2xl bg-orange-500 px-4 py-4 text-base font-black uppercase tracking-[0.12em] text-white disabled:opacity-50',
                  children: f ? 'Enviando solicitud...' : 'Enviar solicitud de reapertura'
                })
              ]
            }),
          !s &&
            y &&
            !t &&
            e.jsx('div', {
              className:
                'rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm sm:text-base text-slate-500 shadow-xl',
              children: 'Necesitas permisos de gestión para solicitar la reapertura de esta N.V.'
            }),
          e.jsx('div', {
            className: 'flex justify-center pt-2',
            children: e.jsx('button', {
              onClick: w,
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
function ns({ puedeEscribir: a, puedeAprobarReapertura: s }) {
  var I, Z, ne;
  const t = he(),
    [u, d] = c.useState(null),
    [j, f] = c.useState(null),
    [w, y] = c.useState([]),
    [o, g] = c.useState(null),
    [p, v] = c.useState(null),
    [x, _] = c.useState(''),
    [M, $] = c.useState(!1),
    [P, D] = c.useState([]),
    [E, B] = c.useState(null),
    [z, O] = c.useState(null);
  (c.useEffect(() => {
    ea()
      .then(d)
      .catch(() => {});
  }, []),
    c.useEffect(() => {
      Ia()
        .then(y)
        .catch(() => y([]));
    }, []),
    c.useEffect(() => {
      if (!j) return;
      const r = setTimeout(() => f(null), 3e3);
      return () => clearTimeout(r);
    }, [j]));
  const i = (I = t.lookupResult) != null && I.found ? t.lookupResult : null,
    T = ((Z = i == null ? void 0 : i.data) == null ? void 0 : Z.estado) === 'Entregado',
    Y = P.find((r) => r.estado === 'PENDIENTE') || null,
    J = c.useMemo(
      () =>
        t.mode !== 'update' || !(i != null && i.data)
          ? !1
          : String(t.estado || '') !== String(i.data.estado || '') ||
            !!t.urgente != !!i.data.urgente ||
            String(t.fechaFacturacion || '') !== String(be(i.data.fecha_facturacion) || '') ||
            String(t.fechaDespacho || '') !== String(be(i.data.fecha_despacho) || ''),
      [
        t.mode,
        t.estado,
        t.urgente,
        t.fechaFacturacion,
        t.fechaDespacho,
        i == null ? void 0 : i.data
      ]
    ),
    ee =
      t.mode === 'update' &&
      (E == null ? void 0 : E.permitida) === !1 &&
      (z == null ? void 0 : z.permitida) === !0 &&
      J;
  c.useEffect(() => {
    var h;
    let r = !1;
    if (!(i != null && i.row) || !a) {
      (B(null), O(null));
      return;
    }
    return (
      Promise.all([
        Ea(i.row),
        Sa(
          i.row,
          t.estado || ((h = i == null ? void 0 : i.data) == null ? void 0 : h.estado) || null
        )
      ])
        .then(([R, k]) => {
          r || (B(R), O(k));
        })
        .catch(() => {
          r ||
            (B({ permitida: !1, message: 'No se pudo validar el acceso IAM para esta N.V.' }),
            O({ permitida: !1, message: 'No se pudo validar la transición de estado.' }));
        }),
      () => {
        r = !0;
      }
    );
  }, [
    i == null ? void 0 : i.row,
    (ne = i == null ? void 0 : i.data) == null ? void 0 : ne.estado,
    a,
    t.estado
  ]);
  const K = c.useCallback(async (r) => {
      if (!r) return (D([]), []);
      try {
        const h = await sa(r);
        return (D(h), h);
      } catch {
        return (D([]), []);
      }
    }, []),
    Q = c.useCallback(
      (r, h = P) => {
        if (!r) return;
        const R = h.find((k) => k.estado === 'PENDIENTE') || null;
        v({ ...r, pendingRequest: R });
      },
      [P]
    ),
    L = c.useCallback(
      async (r) => {
        var R, k, q;
        (t.patch({ lookupResult: { found: !0, row: r.row, data: r.data } }), t.applyFound(r.data));
        const h = t.canal === 'ptm' && Le((R = r.data) == null ? void 0 : R.cliente);
        (t.patch({
          orangeAssociationRequired: h,
          orangeAssociationError: '',
          orangeAssociationData: null,
          orangeAssociationNv: ((k = r.data) == null ? void 0 : k.nv_orange) || ''
        }),
          h && (q = r.data) != null && q.nv_orange && (await b(r.data.nv_orange)));
      },
      [t]
    );
  c.useEffect(() => {
    if (!(i != null && i.row)) {
      D([]);
      return;
    }
    K(i.row);
  }, [i == null ? void 0 : i.row, K]);
  const re = c.useCallback(() => {
      var R, k;
      const r = he.getState(),
        h =
          (R = r.lookupResult) != null && R.found
            ? r.lookupResult.data
            : (k = r.lookupResult) == null
              ? void 0
              : k.autoFill;
      return {
        vendedor: (h == null ? void 0 : h.vendedor) || '',
        ccosto: (h == null ? void 0 : h.ccosto) || (h == null ? void 0 : h.centro_costo) || '',
        centro_costo:
          (h == null ? void 0 : h.centro_costo) || (h == null ? void 0 : h.ccosto) || '',
        division: (h == null ? void 0 : h.division) || ''
      };
    }, []),
    b = c.useCallback(
      async (r) => {
        const h = String(r || '').trim();
        if (!h)
          return (
            t.patch({
              orangeAssociationNv: '',
              orangeAssociationData: null,
              orangeAssociationLoading: !1,
              orangeAssociationError: ''
            }),
            null
          );
        t.patch({
          orangeAssociationNv: h,
          orangeAssociationLoading: !0,
          orangeAssociationError: ''
        });
        try {
          const R = await Ca(h, re());
          return R
            ? (t.patch({
                orangeAssociationData: R,
                orangeAssociationLoading: !1,
                orangeAssociationError: ''
              }),
              R)
            : (t.patch({
                orangeAssociationData: null,
                orangeAssociationLoading: !1,
                orangeAssociationError: 'No encontramos esa N.V. en el catálogo Orange.'
              }),
              null);
        } catch {
          return (
            t.patch({
              orangeAssociationData: null,
              orangeAssociationLoading: !1,
              orangeAssociationError: 'No se pudo validar la N.V. Orange asociada.'
            }),
            null
          );
        }
      },
      [re, t]
    ),
    m = async () => {
      var R, k, q, se, te, C, ue;
      const r = String(t.nv || '').trim();
      if (!r) return;
      t.patch({ lookupLoading: !0, submitResult: null, errors: [] });
      const h = await Pe(t.canal, r);
      if (h.found) {
        await L(h);
        const le = ((R = h.data) == null ? void 0 : R.estado) === 'Entregado' ? await K(h.row) : [];
        Wa.includes((k = h.data) == null ? void 0 : k.estado) &&
          Q(
            {
              id: h.row,
              canal: t.canal,
              nv: r,
              estado: (q = h.data) == null ? void 0 : q.estado,
              reabierta: ((se = h.data) == null ? void 0 : se.reabierta) === !0,
              motivo_reapertura: ((te = h.data) == null ? void 0 : te.motivo_reapertura) || ''
            },
            le
          );
      } else if (t.canal !== 'varios' && !((C = h.autoFill) != null && C.cliente)) {
        (t.patch({
          lookupLoading: !1,
          lookupResult: null,
          mode: 'idle',
          orangeAssociationRequired: !1,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        }),
          g({ canal: t.canal, nv: r }));
        return;
      } else {
        (v(null),
          D([]),
          t.patch({ lookupResult: { found: !1, autoFill: h.autoFill } }),
          t.applyNew(h.autoFill || {}));
        const le = t.canal === 'ptm' && Le((ue = h.autoFill) == null ? void 0 : ue.cliente);
        t.patch({
          orangeAssociationRequired: le,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        });
      }
      t.patch({ lookupLoading: !1 });
    },
    N = async () => {
      const r = (i == null ? void 0 : i.row) || (p == null ? void 0 : p.id),
        h = String(x || '').trim();
      if (!r) return;
      if (!h) {
        t.patch({
          submitResult: { success: !1, message: 'Debes indicar el motivo de la reapertura.' }
        });
        return;
      }
      $(!0);
      const R = await ta(r, h);
      if (($(!1), !R.ok)) {
        const q = R.message || R.error || 'No se pudo solicitar la reapertura.';
        (t.patch({ submitResult: { success: !1, message: q } }), f({ type: 'error', message: q }));
        return;
      }
      const k = await K(r);
      (_(''),
        i != null &&
          i.data &&
          Q(
            {
              id: i.row,
              canal: t.canal,
              nv: t.nv,
              estado: i.data.estado,
              reabierta: i.data.reabierta === !0,
              motivo_reapertura: i.data.motivo_reapertura || ''
            },
            k
          ),
        t.patch({
          submitResult: { success: !0, message: R.message || 'Solicitud de reapertura enviada.' }
        }),
        f({ type: 'success', message: R.message || 'Solicitud de reapertura enviada.' }));
    },
    A = async () => {
      var ue, le, V, H, pe, me, oe, xe;
      const r = he.getState();
      if (r.mode === 'idle') return;
      if (!r.estado) {
        r.patch({ submitResult: { success: !1, message: 'Falta el Estado' } });
        return;
      }
      const h = ((ue = i == null ? void 0 : i.data) == null ? void 0 : ue.shipping_subestado) || '',
        R = r.mode === 'update' && String(r.shippingSubestado || '') !== String(h);
      if (R && r.shippingSubestado && !String(r.shippingPausaMotivo || '').trim()) {
        r.patch({
          submitResult: { success: !1, message: 'Debes indicar el motivo de la pausa Shipping.' }
        });
        return;
      }
      if (h && r.estado !== 'Shipping') {
        r.patch({
          submitResult: {
            success: !1,
            message: 'Reactiva la N.V. en Shipping y guarda antes de avanzar a En Ruta.'
          }
        });
        return;
      }
      if (
        r.mode === 'update' &&
        i != null &&
        i.row &&
        (E == null ? void 0 : E.permitida) === !1 &&
        !ee
      ) {
        (r.patch({
          submitResult: {
            success: !1,
            message: E.message || 'No tienes permisos IAM para editar esta N.V.'
          }
        }),
          f({
            type: 'error',
            message: E.message || 'No tienes permisos IAM para editar esta N.V.'
          }));
        return;
      }
      if (
        (le = r.lookupResult) != null &&
        le.found &&
        ((H = (V = r.lookupResult) == null ? void 0 : V.data) == null ? void 0 : H.estado) ===
          'Entregado'
      ) {
        const W = await K(r.lookupResult.row);
        (Q(
          {
            id: r.lookupResult.row,
            canal: r.canal,
            nv: r.nv,
            estado: r.lookupResult.data.estado,
            reabierta: r.lookupResult.data.reabierta === !0,
            motivo_reapertura: r.lookupResult.data.motivo_reapertura || ''
          },
          W
        ),
          r.patch({
            submitResult: {
              success: !1,
              message:
                'La N.V. está entregada y bloqueada. Solicita reapertura para volver a gestionarla.'
            }
          }));
        return;
      }
      if (r.orangeAssociationRequired && (!r.orangeAssociationNv || !r.orangeAssociationData)) {
        r.patch({
          submitResult: {
            success: !1,
            message: 'Debes asociar una N.V. Orange válida para este cliente PTM.'
          }
        });
        return;
      }
      r.patch({ submitting: !0, submitResult: null });
      const k =
          (pe = r.lookupResult) != null && pe.found
            ? r.lookupResult.data
            : (me = r.lookupResult) == null
              ? void 0
              : me.autoFill,
        q = r.orangeAssociationData,
        se = {
          id: r.mode === 'update' ? ((oe = r.lookupResult) == null ? void 0 : oe.row) : null,
          mode: r.mode,
          canal: r.canal,
          nv: r.nv,
          cliente: (q == null ? void 0 : q.cliente) || (k == null ? void 0 : k.cliente) || '',
          vendedor: (q == null ? void 0 : q.vendedor) || (k == null ? void 0 : k.vendedor) || '',
          division: (q == null ? void 0 : q.division) || (k == null ? void 0 : k.division) || '',
          centro_costo:
            (q == null ? void 0 : q.ccosto) ||
            (k == null ? void 0 : k.ccosto) ||
            (k == null ? void 0 : k.centro_costo) ||
            '',
          nvOrangeAsociada: r.orangeAssociationRequired
            ? r.orangeAssociationNv
            : (k == null ? void 0 : k.nv_orange) || '',
          estado: r.estado,
          urgente: r.urgente,
          tipoDespacho: r.tipoDespacho,
          transportista: r.transportista,
          fechaCompromiso: r.fechaCompromiso,
          fechaAprobacion: r.fechaAprobacion,
          fechaAprobacionReal: r.fechaAprobacionReal,
          fechaFacturacion: r.fechaFacturacion,
          fechaDespacho: r.fechaDespacho,
          factura: r.factura,
          guia: r.guia,
          bultos: r.bultos,
          valorFactura: r.valorFactura,
          numeroEnvio: r.numeroEnvio,
          incidencia: r.incidencia,
          estadoIncidencia: r.incidencia ? r.estadoIncidencia || 'ABIERTA' : '',
          observacionesIncidencia: r.observacionesIncidencia,
          variosTipo: r.variosTipo,
          variosCliente: r.variosCliente,
          variosVendedor: r.variosVendedor,
          variosDivision: r.variosDivision,
          variosCcosto: r.variosCcosto
        },
        te = await ra(se);
      if ((he.getState().patch({ submitting: !1 }), te.ok)) {
        if (R && se.id) {
          const W = await na(se.id, r.shippingSubestado || null, r.shippingPausaMotivo || '');
          if (!W.ok) {
            const ie =
              W.message ||
              W.error ||
              'Los datos se guardaron, pero no se pudo actualizar la pausa Shipping.';
            (he.getState().patch({ submitResult: { success: !1, message: ie } }),
              f({ type: 'error', message: ie }));
            return;
          }
        }
        (v(null),
          D([]),
          f({
            type: 'success',
            message: `NV ${se.nv} ${se.mode === 'update' ? 'actualizada' : 'creada'}`
          }),
          he.getState().reset());
        return;
      }
      let C = te.message || te.error || 'No se pudo guardar';
      if (te.duplicate || te.locked) {
        const W = await Pe(r.canal, r.nv);
        if (W.found) {
          await L(W);
          const ie =
            ((xe = W.data) == null ? void 0 : xe.estado) === 'Entregado' ? await K(W.row) : [];
          Q(
            {
              id: W.row,
              canal: r.canal,
              nv: r.nv,
              estado: W.data.estado,
              reabierta: W.data.reabierta === !0,
              motivo_reapertura: W.data.motivo_reapertura || ''
            },
            ie
          );
        }
      }
      (he.getState().patch({ submitResult: { success: !1, message: C } }),
        f({ type: 'error', message: C }));
    };
  return e.jsxs('div', {
    className: 'pb-24',
    children: [
      e.jsx(La, {
        options: u,
        transportistasOpts: (u == null ? void 0 : u.transportistas) || [],
        vendedoresMaestro: w,
        onLookup: m,
        onLookupOrange: b,
        canRequestReopen: a,
        onOpenReopen: () => {
          var r, h, R;
          return Q({
            id: i == null ? void 0 : i.row,
            canal: t.canal,
            nv: t.nv,
            estado: (r = i == null ? void 0 : i.data) == null ? void 0 : r.estado,
            reabierta: ((h = i == null ? void 0 : i.data) == null ? void 0 : h.reabierta) === !0,
            motivo_reapertura:
              ((R = i == null ? void 0 : i.data) == null ? void 0 : R.motivo_reapertura) || ''
          });
        },
        latestReopenRequest: Y
      }),
      o && e.jsx(ts, { canal: o.canal, nv: o.nv, onClose: () => g(null) }),
      p &&
        e.jsx(rs, {
          item: p,
          puedeEscribir: a,
          puedeAprobarReapertura: s,
          motivo: x,
          onMotivoChange: _,
          onRequestReopen: N,
          requesting: M,
          onClose: () => v(null)
        }),
      t.mode !== 'idle' &&
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
                  e.jsx('b', { className: 'text-slate-600 uppercase', children: t.canal }),
                  ' · N°',
                  ' ',
                  e.jsx('b', { className: 'text-slate-600', children: t.nv || '—' })
                ]
              }),
              e.jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  t.mode === 'update' &&
                    (E == null ? void 0 : E.permitida) === !1 &&
                    !ee &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold',
                      children: E.message || 'Sin acceso IAM para editar esta N.V.'
                    }),
                  t.mode === 'update' &&
                    (E == null ? void 0 : E.permitida) === !1 &&
                    ee &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold',
                      children:
                        (z == null ? void 0 : z.message) ||
                        'Tienes permiso para cambiar estado, pero no para editar otros campos de esta N.V.'
                    }),
                  T &&
                    a &&
                    e.jsxs('button', {
                      onClick: () => {
                        var r, h, R;
                        return Q({
                          id: i == null ? void 0 : i.row,
                          canal: t.canal,
                          nv: t.nv,
                          estado: (r = i == null ? void 0 : i.data) == null ? void 0 : r.estado,
                          reabierta:
                            ((h = i == null ? void 0 : i.data) == null ? void 0 : h.reabierta) ===
                            !0,
                          motivo_reapertura:
                            ((R = i == null ? void 0 : i.data) == null
                              ? void 0
                              : R.motivo_reapertura) || '',
                          pendingRequest: Y
                        });
                      },
                      className:
                        'px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-black text-sm flex items-center gap-2',
                      children: [e.jsx($e, { size: 16 }), 'Solicitar reapertura']
                    }),
                  e.jsxs('button', {
                    onClick: A,
                    disabled:
                      t.submitting ||
                      T ||
                      (t.mode === 'update' && (E == null ? void 0 : E.permitida) === !1 && !ee),
                    className:
                      'px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2',
                    children: [
                      t.submitting
                        ? e.jsx(we, { size: 16, className: 'animate-spin' })
                        : e.jsx(ma, { size: 16 }),
                      T
                        ? 'N.V. bloqueada'
                        : t.mode === 'update' && (E == null ? void 0 : E.permitida) === !1 && !ee
                          ? 'Sin acceso IAM'
                          : t.mode === 'update'
                            ? 'Actualizar N.V.'
                            : 'Crear N.V.'
                    ]
                  })
                ]
              })
            ]
          })
        }),
      e.jsx(Ua, { toast: j })
    ]
  });
}
function ls() {
  const { user: a } = Ze();
  return e.jsx(Ha, { operador: (a == null ? void 0 : a.nombre) || '' });
}
const os = ['angelica@ptm.cl'];
function is(a) {
  return a
    ? a.rol === 'ADMIN' ||
        a.es_admin_delegado === !0 ||
        os.includes((a.email || '').trim().toLowerCase())
    : !1;
}
function js() {
  const { hasPermission: a, user: s } = Ze(),
    t = a('manage_panel'),
    u = a('approve_panel_reopen_nv') || a('manage_roles'),
    d = is(s),
    [j, f] = c.useState('buscar'),
    w = [
      { v: 'buscar', label: 'Buscar', hint: 'Seguimiento y consulta', icon: Fe, accent: '#2563eb' },
      { v: 'ingresar', label: 'Ingresar', hint: 'Registro operativo', icon: De, accent: de },
      ...(t
        ? [
            {
              v: 'consolidados',
              label: 'Consolidados',
              hint: 'Agrupación comercial',
              icon: pa,
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
            children: w.map((y) => {
              const o = y.icon,
                g = j === y.v;
              return e.jsxs(
                'button',
                {
                  type: 'button',
                  onClick: () => f(y.v),
                  className: `group relative overflow-hidden rounded-[1.15rem] border px-4 py-3.5 text-left transition-all duration-200 ${g ? 'bg-white text-slate-700 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]' : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/80'}`,
                  style: g ? { borderColor: `${y.accent}26` } : void 0,
                  'aria-pressed': g,
                  children: [
                    g &&
                      e.jsx('div', {
                        className: 'absolute inset-x-4 top-0 h-[2px] rounded-full',
                        style: { background: y.accent }
                      }),
                    e.jsx('div', {
                      className: `absolute inset-0 pointer-events-none transition-opacity ${g ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`,
                      style: {
                        background: `radial-gradient(circle at top right, ${y.accent}14, transparent 42%)`
                      }
                    }),
                    e.jsxs('div', {
                      className: 'relative flex items-center gap-3',
                      children: [
                        e.jsx('div', {
                          className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${g ? 'bg-white' : 'border-slate-200 bg-white/90 text-slate-500'}`,
                          style: g
                            ? {
                                borderColor: `${y.accent}26`,
                                color: y.accent,
                                background: `${y.accent}10`
                              }
                            : void 0,
                          children: e.jsx(o, { size: 18 })
                        }),
                        e.jsxs('div', {
                          className: 'min-w-0 flex-1',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center justify-between gap-3',
                              children: [
                                e.jsx('div', {
                                  className: `text-sm font-black tracking-tight ${g ? 'text-slate-900' : 'text-slate-800'}`,
                                  children: y.label
                                }),
                                g &&
                                  e.jsx('span', {
                                    className:
                                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
                                    style: { background: `${y.accent}12`, color: y.accent },
                                    children: 'Activo'
                                  })
                              ]
                            }),
                            e.jsx('div', {
                              className: `mt-1 text-[12px] leading-5 ${g ? 'text-slate-500' : 'text-slate-400'}`,
                              children: y.hint
                            })
                          ]
                        })
                      ]
                    })
                  ]
                },
                y.v
              );
            })
          })
        ]
      }),
      j === 'buscar' &&
        e.jsx(ss, { puedeEscribir: t, puedeEliminar: d, puedeAprobarReapertura: u }),
      j === 'ingresar' && e.jsx(ns, { puedeEscribir: t, puedeAprobarReapertura: u }),
      j === 'consolidados' && t && e.jsx(ls, {})
    ]
  });
}
export { js as default };
