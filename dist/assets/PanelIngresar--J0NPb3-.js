import { j as e } from './query-vendor-BNjBrM5A.js';
import { r as i, b as ye, u as Ke } from './react-vendor-6aw4XXjH.js';
import {
  X as He,
  S as ve,
  ai as Ye,
  x as we,
  p as We,
  aj as Qe,
  ak as Se,
  Y as ce,
  al as Ve,
  ah as Te,
  n as Ze,
  t as he,
  a7 as ue,
  am as Xe,
  a0 as Ce,
  an as Je,
  ao as Fe,
  ap as $e,
  aq as ea
} from './ui-vendor-CTbhg6u_.js';
import { u as Me } from './index-BcUQjinW.js';
import {
  C as Ne,
  A as te,
  V as aa,
  c as xe,
  I as Pe,
  E as ze,
  l as sa,
  b as Re,
  g as de,
  e as ta,
  a as ra,
  d as na,
  f as la,
  h as oa,
  i as ia,
  o as qe,
  j as Be,
  p as ca,
  k as da,
  m as Le,
  n as _e,
  q as ua,
  r as xa,
  s as pa,
  T as ma,
  t as je,
  u as Ue,
  v as Ge,
  w as ha,
  x as ga
} from './ingresarService-BdJ6SRhY.js';
import { f as ba } from './configService-C_Vbo58S.js';
import { e as fa } from './exportExcel-D85v870c.js';
import { c as va } from './index-DH2X3u_W.js';
import { g as X } from './animation-vendor-JfdD7EdN.js';
import './supabase-vendor-4Fjsfb0a.js';
import './xlsx-B2eTCt_Q.js';
import './charts-vendor-7leLLwOT.js';
function Na({ titulo: a, onClose: t, children: s, maxWidth: u = 'max-w-3xl', fullscreen: c = !1 }) {
  return (
    i.useEffect(() => {
      const y = (C) => C.key === 'Escape' && (t == null ? void 0 : t());
      document.addEventListener('keydown', y);
      const j = document.body.style.overflow;
      return (
        (document.body.style.overflow = 'hidden'),
        () => {
          (document.removeEventListener('keydown', y), (document.body.style.overflow = j));
        }
      );
    }, [t]),
    ye.createPortal(
      e.jsx('div', {
        className: `fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex justify-center ${c ? 'items-stretch p-0' : 'items-end sm:items-center p-0 sm:p-4'}`,
        onClick: t,
        style: { animation: 'panelBackdropIn 0.2s ease both' },
        children: e.jsxs('div', {
          className: `bg-white w-full shadow-2xl overflow-hidden flex flex-col ${c ? 'h-screen max-w-none rounded-none' : `${u} sm:rounded-2xl rounded-t-2xl max-h-[88vh]`}`,
          onClick: (y) => y.stopPropagation(),
          style: {
            paddingBottom: 'env(safe-area-inset-bottom)',
            animation: 'panelModalIn 0.28s cubic-bezier(0.16,1,0.3,1) both'
          },
          children: [
            e.jsxs('div', {
              className: `flex items-center justify-between border-b border-slate-100 shrink-0 ${c ? 'px-6 py-4 sm:px-8' : 'px-5 py-3'}`,
              children: [
                e.jsx('h3', {
                  className: `font-black text-slate-800 ${c ? 'text-lg sm:text-2xl' : ''}`,
                  children: a
                }),
                e.jsx('button', {
                  onClick: t,
                  className: `rounded-lg hover:bg-slate-100 text-slate-400 ${c ? 'p-2.5' : 'p-1.5'}`,
                  children: e.jsx(He, { size: c ? 22 : 18 })
                })
              ]
            }),
            e.jsx('div', { className: `overflow-y-auto ${c ? 'flex-1' : ''}`, children: s })
          ]
        })
      }),
      document.body
    )
  );
}
const ee = {
    EN_PROCESO: 'En Proceso',
    SHIPPING: 'Shipping',
    CURRIER: 'Currier',
    EN_RUTA: 'En Ruta',
    ENTREGADO: 'Entregado',
    RECIBIDO_CONFORME: 'Recibido Conforme',
    RECIBIDO_OBS: 'Recibido C/OBS'
  },
  ja = [ee.CURRIER, ee.EN_RUTA, ee.ENTREGADO, ee.RECIBIDO_CONFORME, ee.RECIBIDO_OBS],
  ya = [ee.EN_PROCESO, ee.SHIPPING, ee.CURRIER, ee.EN_RUTA, ee.ENTREGADO];
function wa(a) {
  const t = (a || '').toUpperCase();
  return ja.some((s) => s.toUpperCase() === t);
}
function Ca(a, t) {
  const s = new Date(a);
  let u = 0;
  const c = s.getDay();
  for (c === 0 ? s.setDate(s.getDate() + 1) : c === 6 && s.setDate(s.getDate() + 2); u < t;) {
    s.setDate(s.getDate() + 1);
    const y = s.getDay();
    y !== 0 && y !== 6 && u++;
  }
  return s;
}
function De(a, t) {
  const s = t || a;
  if (!s) return '';
  const u = new Date(s + 'T12:00:00');
  if (isNaN(u.getTime())) return '';
  const c = Ca(u, 2),
    y = c.getFullYear(),
    j = String(c.getMonth() + 1).padStart(2, '0'),
    C = String(c.getDate()).padStart(2, '0');
  return `${y}-${j}-${C}`;
}
const Ie = {
    nv: '',
    lookupResult: null,
    lookupLoading: !1,
    mode: 'idle',
    orangeAssociationRequired: !1,
    orangeAssociationNv: '',
    orangeAssociationData: null,
    orangeAssociationLoading: !1,
    orangeAssociationError: '',
    estado: ee.EN_PROCESO,
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
  oe = va((a) => ({
    canal: 'ptm',
    ...Ie,
    patch: (t) => a(t),
    markAutoFilled: (t) =>
      a((s) => {
        const u = new Set(s.autoFilledDates);
        return (t.forEach((c) => u.add(c)), { autoFilledDates: u });
      }),
    clearAutoFilled: (t) =>
      a((s) => {
        const u = new Set(s.autoFilledDates);
        return (u.delete(t), { autoFilledDates: u });
      }),
    reset: () =>
      a({
        ...Ie,
        variosTipo: '',
        variosCliente: '',
        variosVendedor: '',
        variosDivision: '',
        variosCcosto: ''
      }),
    applyFound: (t) =>
      a(() => {
        const s = t.fecha_compromiso || De(t.fecha_aprobacion, t.fecha_aprobacion_real),
          u = !t.fecha_compromiso && !!s;
        return {
          mode: 'update',
          estado: t.estado || ee.EN_PROCESO,
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
          autoFilledDates: u ? new Set(['fechaCompromiso']) : new Set()
        };
      }),
    applyNew: (t) =>
      a(() => {
        const s = (t && t.fecha_compromiso) || '';
        return {
          mode: 'create',
          estado: ee.EN_PROCESO,
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
        const s = De(t.fechaAprobacion, t.fechaAprobacionReal);
        if (!s || s === t.fechaCompromiso) return t;
        const u = new Set(t.autoFilledDates);
        return (u.add('fechaCompromiso'), { fechaCompromiso: s, autoFilledDates: u });
      })
  })),
  Ea = ({
    items: a,
    active: t,
    onSelect: s,
    accent: u = '#ea580c',
    ease: c = 'power3.easeOut'
  }) => {
    const y = i.useRef([]),
      j = i.useRef([]),
      C = i.useRef([]),
      x = i.useRef([]);
    (i.useEffect(() => {
      var b;
      const p = () => {
        y.current.forEach((h, S) => {
          var W;
          if (!(h != null && h.parentElement)) return;
          const z = h.parentElement,
            O = z.getBoundingClientRect(),
            { width: _, height: V } = O;
          if (_ === 0 || V === 0) return;
          const E = ((_ * _) / 4 + V * V) / (2 * V),
            M = Math.ceil(2 * E) + 2,
            F = Math.ceil(E - Math.sqrt(Math.max(0, E * E - (_ * _) / 4))) + 1,
            Y = M - F;
          ((h.style.width = `${M}px`),
            (h.style.height = `${M}px`),
            (h.style.bottom = `-${F}px`),
            X.set(h, { xPercent: -50, scale: 0, transformOrigin: `50% ${Y}px` }));
          const l = z.querySelector('.pc-label'),
            D = z.querySelector('.pc-label-hover');
          (l && X.set(l, { y: 0 }),
            D && X.set(D, { y: V + 12, opacity: 0 }),
            (W = j.current[S]) == null || W.kill());
          const K = X.timeline({ paused: !0 });
          (K.to(h, { scale: 1.2, xPercent: -50, duration: 2, ease: c, overwrite: 'auto' }, 0),
            l && K.to(l, { y: -(V + 8), duration: 2, ease: c, overwrite: 'auto' }, 0),
            D &&
              (X.set(D, { y: Math.ceil(V + 100), opacity: 0 }),
              K.to(D, { y: 0, opacity: 1, duration: 2, ease: c, overwrite: 'auto' }, 0)),
            (j.current[S] = K));
        });
      };
      return (
        p(),
        window.addEventListener('resize', p),
        (b = document.fonts) != null && b.ready && document.fonts.ready.then(p).catch(() => {}),
        () => window.removeEventListener('resize', p)
      );
    }, [a, c]),
      i.useEffect(() => {
        a.forEach((p, b) => {
          var M;
          const h = x.current[b],
            S = j.current[b],
            z = y.current[b],
            O = h == null ? void 0 : h.querySelector('.pc-label'),
            _ = h == null ? void 0 : h.querySelector('.pc-label-hover'),
            V = t === p.value,
            E = p.color || u;
          if (((M = C.current[b]) == null || M.kill(), !(!h || !z || !S))) {
            if (V) {
              ((h.style.background = E),
                (h.style.color = '#ffffff'),
                X.set(z, { scale: 1.2, xPercent: -50 }),
                O && X.set(O, { y: -(h.offsetHeight + 8) }),
                _ && X.set(_, { y: 0, opacity: 1 }),
                S.progress(1).pause());
              return;
            }
            ((h.style.background = ''),
              (h.style.color = ''),
              X.set(z, { scale: 0, xPercent: -50 }),
              O && X.set(O, { y: 0 }),
              _ && X.set(_, { y: h.offsetHeight + 12, opacity: 0 }),
              S.progress(0).pause());
          }
        });
      }, [t, a, u]));
    const w = (p) => {
        var h, S;
        if (t === ((h = a[p]) == null ? void 0 : h.value)) return;
        const b = j.current[p];
        b &&
          ((S = C.current[p]) == null || S.kill(),
          (C.current[p] = b.tweenTo(b.duration(), { duration: 0.3, ease: c, overwrite: 'auto' })));
      },
      N = (p) => {
        var h, S;
        if (t === ((h = a[p]) == null ? void 0 : h.value)) return;
        const b = j.current[p];
        b &&
          ((S = C.current[p]) == null || S.kill(),
          (C.current[p] = b.tweenTo(0, { duration: 0.2, ease: c, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: 'pc-track',
      children: a.map((p, b) => {
        const h = t === p.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(p.value),
            onMouseEnter: () => w(b),
            onMouseLeave: () => N(b),
            className: `pc-pill ${h ? 'pc-active' : ''}`,
            'aria-pressed': h,
            ref: (S) => {
              x.current[b] = S;
            },
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (S) => {
                  y.current[b] = S;
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
  Ee = ({ items: a, active: t, onSelect: s, inline: u = !1, ease: c = 'power3.easeOut' }) => {
    const y = i.useRef([]),
      j = i.useRef([]),
      C = i.useRef([]);
    i.useEffect(() => {
      var p;
      const N = () => {
        y.current.forEach((b, h) => {
          var K;
          if (!(b != null && b.parentElement)) return;
          const S = b.parentElement,
            z = S.getBoundingClientRect(),
            { width: O, height: _ } = z;
          if (O === 0 || _ === 0) return;
          const V = ((O * O) / 4 + _ * _) / (2 * _),
            E = Math.ceil(2 * V) + 2,
            M = Math.ceil(V - Math.sqrt(Math.max(0, V * V - (O * O) / 4))) + 1,
            F = E - M;
          ((b.style.width = `${E}px`),
            (b.style.height = `${E}px`),
            (b.style.bottom = `-${M}px`),
            X.set(b, { xPercent: -50, scale: 0, transformOrigin: `50% ${F}px` }));
          const Y = S.querySelector('.pc-label'),
            l = S.querySelector('.pc-label-hover');
          (Y && X.set(Y, { y: 0 }),
            l && X.set(l, { y: _ + 12, opacity: 0 }),
            (K = j.current[h]) == null || K.kill());
          const D = X.timeline({ paused: !0 });
          (D.to(b, { scale: 1.2, xPercent: -50, duration: 2, ease: c, overwrite: 'auto' }, 0),
            Y && D.to(Y, { y: -(_ + 8), duration: 2, ease: c, overwrite: 'auto' }, 0),
            l &&
              (X.set(l, { y: Math.ceil(_ + 100), opacity: 0 }),
              D.to(l, { y: 0, opacity: 1, duration: 2, ease: c, overwrite: 'auto' }, 0)),
            (j.current[h] = D));
        });
      };
      return (
        N(),
        window.addEventListener('resize', N),
        (p = document.fonts) != null && p.ready && document.fonts.ready.then(N).catch(() => {}),
        () => window.removeEventListener('resize', N)
      );
    }, [a, c]);
    const x = (N) => {
        var b, h;
        if (t === ((b = a[N]) == null ? void 0 : b.value)) return;
        const p = j.current[N];
        p &&
          ((h = C.current[N]) == null || h.kill(),
          (C.current[N] = p.tweenTo(p.duration(), { duration: 0.3, ease: c, overwrite: 'auto' })));
      },
      w = (N) => {
        var b, h;
        if (t === ((b = a[N]) == null ? void 0 : b.value)) return;
        const p = j.current[N];
        p &&
          ((h = C.current[N]) == null || h.kill(),
          (C.current[N] = p.tweenTo(0, { duration: 0.2, ease: c, overwrite: 'auto' })));
      };
    return e.jsx('div', {
      className: `pc-track pc-estado${u ? ' pc-inline' : ''}`,
      children: a.map((N, p) => {
        const b = t === N.value;
        return e.jsxs(
          'button',
          {
            type: 'button',
            onClick: () => s(N.value),
            onMouseEnter: () => x(p),
            onMouseLeave: () => w(p),
            className: `pc-pill ${b ? 'pc-active' : ''}`,
            style: b ? { background: N.color, color: '#fff' } : void 0,
            title: N.label,
            children: [
              e.jsx('span', {
                className: 'pc-circle',
                'aria-hidden': 'true',
                ref: (h) => {
                  y.current[p] = h;
                },
                style: { background: N.color }
              }),
              e.jsxs('span', {
                className: 'pc-label-stack',
                children: [
                  e.jsxs('span', {
                    className: 'pc-label',
                    children: [
                      e.jsx('span', { className: 'pc-dot', style: { background: N.color } }),
                      N.label,
                      N.count != null && e.jsx('span', { className: 'pc-count', children: N.count })
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
                      N.label,
                      N.count != null &&
                        e.jsx('span', { className: 'pc-count pc-count-on', children: N.count })
                    ]
                  })
                ]
              })
            ]
          },
          N.value
        );
      })
    });
  };
function ka({
  options: a,
  transportistasOpts: t,
  vendedoresMaestro: s,
  onLookup: u,
  onLookupOrange: c,
  canRequestReopen: y,
  onOpenReopen: j,
  latestReopenRequest: C
}) {
  var ke, Ae;
  const x = oe(),
    {
      canal: w,
      nv: N,
      lookupResult: p,
      lookupLoading: b,
      mode: h,
      estado: S,
      tipoDespacho: z,
      transportista: O,
      fechaCompromiso: _,
      fechaAprobacion: V,
      fechaAprobacionReal: E,
      fechaFacturacion: M,
      fechaDespacho: F,
      factura: Y,
      guia: l,
      bultos: D,
      valorFactura: K,
      numeroEnvio: W,
      urgente: H,
      variosTipo: L,
      variosCliente: J,
      variosVendedor: B,
      variosDivision: ae,
      variosCcosto: g,
      orangeAssociationRequired: m,
      orangeAssociationNv: f,
      orangeAssociationData: A,
      orangeAssociationLoading: v,
      orangeAssociationError: T,
      incidencia: Q,
      estadoIncidencia: r,
      observacionesIncidencia: d,
      errors: k,
      submitResult: P,
      autoFilledDates: U,
      patch: R,
      markAutoFilled: Z,
      clearAutoFilled: se,
      recalcCompromiso: ne
    } = x;
  (i.useEffect(() => {
    if (h === 'idle') return;
    const n = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }),
      G = wa(S),
      le = S.toUpperCase() === ee.SHIPPING.toUpperCase(),
      be = {},
      pe = [];
    (G && !F && ((be.fechaDespacho = n), pe.push('fechaDespacho')),
      (le || G) && !M && ((be.fechaFacturacion = n), pe.push('fechaFacturacion')),
      pe.length > 0 && (R(be), Z(pe)));
  }, [S, h]),
    i.useEffect(() => {
      h !== 'idle' && ne();
    }, [E, h]));
  const re = i.useMemo(() => {
      const n = new Map();
      return (s.forEach((G) => n.set(G.nombre.trim().toLowerCase(), G)), n);
    }, [s]),
    o = (n) => {
      const G = re.get(n.trim().toLowerCase());
      R(
        G
          ? {
              variosVendedor: n,
              variosDivision: G.division || '',
              variosCcosto: G.centro_costo || ''
            }
          : { variosVendedor: n }
      );
    },
    I = ((ke = Ne.find((n) => n.value === w)) == null ? void 0 : ke.color) || te,
    $ = {
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
    }[w] || {
      eyebrow: 'Canal',
      title: 'Operación',
      hint: 'Selecciona un canal para comenzar.',
      tone: 'from-slate-500/10 to-slate-500/10 border-slate-200',
      badge: 'Selección',
      color: te
    },
    q = p
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
    ge =
      (p == null ? void 0 : p.found) &&
      ((Ae = p == null ? void 0 : p.data) == null ? void 0 : Ae.estado) === 'Entregado';
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
                            style: { border: `1px solid ${I}33`, background: `${I}12`, color: I },
                            children: [e.jsx(ve, { size: 12 }), 'Identificación']
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
                            className: `inline-block h-2.5 w-2.5 rounded-full ${h === 'idle' ? 'bg-slate-300' : p != null && p.found ? 'bg-blue-500' : 'bg-emerald-500'}`
                          }),
                          h === 'idle'
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
                          e.jsx(Ye, { size: 15, className: 'text-slate-400' }),
                          e.jsx('label', {
                            className:
                              'text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em]',
                            children: 'Canal operativo'
                          })
                        ]
                      }),
                      e.jsx(Ea, {
                        items: Ne,
                        active: w,
                        onSelect: (n) =>
                          R({
                            canal: n,
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
                              e.jsx(we, {
                                size: 18,
                                className: 'absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                              }),
                              e.jsx('input', {
                                type: 'text',
                                inputMode: 'numeric',
                                value: N,
                                onChange: (n) => {
                                  const G = n.target.value;
                                  !G.trim() && h !== 'idle'
                                    ? R({
                                        nv: G,
                                        mode: 'idle',
                                        lookupResult: null,
                                        submitResult: null,
                                        errors: []
                                      })
                                    : R({ nv: G });
                                },
                                onKeyDown: (n) => n.key === 'Enter' && u(),
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
                        disabled: b || !N.trim(),
                        className:
                          'h-14 min-w-[152px] px-5 rounded-2xl text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_16px_30px_-18px_rgba(24,24,27,0.8)] inline-flex items-center justify-center gap-2',
                        style: {
                          background: `linear-gradient(135deg, ${$.color} 0%, #18181b 100%)`
                        },
                        children: b
                          ? e.jsx('span', {
                              className:
                                'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                            })
                          : e.jsxs(e.Fragment, {
                              children: [e.jsx(We, { size: 16 }), ' Buscar N.V.']
                            })
                      })
                    ]
                  }),
                  p &&
                    e.jsx('div', {
                      className: 'mt-4 anim-fade-up',
                      children: e.jsxs('div', {
                        className: `rounded-[1.35rem] border p-4 ${q.container}`,
                        children: [
                          e.jsxs('div', {
                            className:
                              'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-start gap-3',
                                children: [
                                  e.jsx('div', {
                                    className: `h-10 w-10 rounded-2xl flex items-center justify-center ${q.iconWrap}`,
                                    children: p.found
                                      ? e.jsx(Qe, { size: 18 })
                                      : e.jsx(ve, { size: 18 })
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx('div', {
                                        className: 'text-sm font-black',
                                        children: q.title
                                      }),
                                      e.jsx('div', {
                                        className: 'text-xs mt-0.5 opacity-90',
                                        children: q.description
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
                            const n = p.found ? p.data : p.autoFill;
                            if (!n) return null;
                            const G = [
                              { l: 'Cliente', v: n.cliente },
                              { l: 'Vendedor', v: n.vendedor },
                              { l: 'C. Costo', v: n.ccosto || n.centro_costo },
                              { l: 'División', v: n.division }
                            ].filter((le) => le.v);
                            return G.length === 0
                              ? null
                              : e.jsx('div', {
                                  className: 'mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5',
                                  children: G.map((le) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className:
                                          'rounded-2xl border border-white/60 bg-white/70 px-3.5 py-3',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[10px] uppercase tracking-[0.16em] opacity-60 font-bold',
                                            children: le.l
                                          }),
                                          e.jsx('div', {
                                            className: 'text-[13px] mt-1 font-semibold truncate',
                                            children: le.v
                                          })
                                        ]
                                      },
                                      le.l
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
                className: `relative rounded-[1.5rem] border bg-gradient-to-br ${$.tone} p-4 sm:p-5`,
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500',
                    children: $.eyebrow
                  }),
                  e.jsxs('div', {
                    className: 'mt-2 flex items-center justify-between gap-3',
                    children: [
                      e.jsx('div', {
                        className: 'text-2xl font-black text-slate-900',
                        children: $.title
                      }),
                      e.jsx('div', {
                        className:
                          'rounded-full border bg-white/80 px-3 py-1 text-[11px] font-bold',
                        style: { borderColor: `${$.color}33`, color: $.color },
                        children: $.badge
                      })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'mt-3 text-sm leading-6 text-slate-600',
                    children: $.hint
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
      w === 'ptm' &&
        m &&
        h !== 'idle' &&
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
                      children: [e.jsx(Se, { size: 12 }), 'Asociación comercial']
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
                      value: f,
                      onChange: (n) =>
                        R({
                          orangeAssociationNv: n.target.value,
                          orangeAssociationError: '',
                          orangeAssociationData: null
                        }),
                      onKeyDown: (n) => n.key === 'Enter' && (c == null ? void 0 : c(f)),
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
                  onClick: () => (c == null ? void 0 : c(f)),
                  disabled: v || !f.trim(),
                  className:
                    'h-11 px-5 rounded-xl bg-amber-500 text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2',
                  children: [
                    v
                      ? e.jsx('span', {
                          className:
                            'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                        })
                      : e.jsx(Se, { size: 15 }),
                    'Validar asociación'
                  ]
                })
              ]
            }),
            T &&
              e.jsxs('div', {
                className:
                  'mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2',
                children: [e.jsx(ce, { size: 16 }), T]
              }),
            A &&
              e.jsx('div', {
                className: 'mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3',
                children: [
                  { label: 'Cliente Orange', value: A.cliente || '—' },
                  { label: 'Vendedor', value: A.vendedor || '—' },
                  { label: 'Centro costo', value: A.ccosto || '—' },
                  { label: 'División', value: A.division || '—' }
                ].map((n) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-[10px] uppercase tracking-[0.16em] text-amber-700 font-bold',
                          children: n.label
                        }),
                        e.jsx('div', {
                          className: 'mt-1 text-sm font-semibold text-slate-800 truncate',
                          children: n.value
                        })
                      ]
                    },
                    n.label
                  )
                )
              })
          ]
        }),
      ge &&
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
                      children: [e.jsx(ce, { size: 12 }), 'N.V. entregada bloqueada']
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
                y &&
                  e.jsx('button', {
                    type: 'button',
                    onClick: j,
                    className:
                      'h-11 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-sm hover:bg-orange-600',
                    children: 'Solicitar reapertura'
                  })
              ]
            }),
            C &&
              e.jsxs('div', {
                className: 'mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3',
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700',
                    children: 'Solicitud pendiente'
                  }),
                  e.jsx('div', {
                    className: 'mt-1 text-sm font-semibold text-slate-800',
                    children: C.motivo
                  }),
                  e.jsxs('div', {
                    className: 'mt-1 text-xs text-slate-500',
                    children: [
                      'Solicitada por ',
                      C.solicitada_por_nombre || 'Usuario',
                      ' el ',
                      String(C.solicitada_at || '').slice(0, 10) || '—'
                    ]
                  })
                ]
              })
          ]
        }),
      w === 'varios' &&
        h === 'create' &&
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
                  children: aa.map((n) =>
                    e.jsx(
                      'button',
                      {
                        type: 'button',
                        onClick: () => R({ variosTipo: n }),
                        className: `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${L === n ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'}`,
                        children: n
                      },
                      n
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
                      value: J,
                      onChange: (n) => R({ variosCliente: n.target.value }),
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
                              value: B,
                              onChange: (n) => o(n.target.value),
                              className: 'field-input',
                              placeholder: 'Selecciona o escribe'
                            }),
                            e.jsx('datalist', {
                              id: 'vendedores-list',
                              children: s.map((n) => e.jsx('option', { value: n.nombre }, n.id))
                            })
                          ]
                        })
                      : e.jsx('input', {
                          type: 'text',
                          value: B,
                          onChange: (n) => R({ variosVendedor: n.target.value }),
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
                      value: ae,
                      onChange: (n) => R({ variosDivision: n.target.value }),
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
                      value: g,
                      onChange: (n) => R({ variosCcosto: n.target.value }),
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
                      onChange: (n) => R({ fechaAprobacionReal: n.target.value }),
                      className: 'field-input'
                    })
                  ]
                })
              ]
            })
          ]
        }),
      h !== 'idle' &&
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
                  children: e.jsx(Ee, {
                    items: ya.map((n) => ({ value: n, label: n, color: xe(n) })),
                    active: S,
                    onSelect: (n) => R({ estado: n })
                  })
                }),
                e.jsxs('button', {
                  type: 'button',
                  onClick: () => R({ urgente: !H }),
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
                          value: z,
                          onChange: (n) => R({ tipoDespacho: n.target.value }),
                          className: 'field-input',
                          children: [
                            e.jsx('option', { value: '', children: '— Seleccionar —' }),
                            (
                              (a == null ? void 0 : a.tiposDespacho) || [
                                'Courier - Inyección',
                                'Directo',
                                'Courier (Retiro / Pick-up)'
                              ]
                            ).map((n) => e.jsx('option', { value: n, children: n }, n))
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Transportista' }),
                        t.length > 0
                          ? e.jsxs('select', {
                              value: O,
                              onChange: (n) => R({ transportista: n.target.value }),
                              className: 'field-input',
                              children: [
                                e.jsx('option', { value: '', children: '— Seleccionar —' }),
                                (O && !t.includes(O) ? [O, ...t] : t).map((n) =>
                                  e.jsx('option', { value: n, children: n }, n)
                                )
                              ]
                            })
                          : e.jsx('input', {
                              type: 'text',
                              value: O,
                              onChange: (n) => R({ transportista: n.target.value }),
                              placeholder: 'Nombre transportista',
                              className: 'field-input'
                            })
                      ]
                    }),
                    h === 'update' &&
                      e.jsxs('div', {
                        children: [
                          e.jsxs('label', {
                            className: 'field-label',
                            children: [
                              'Fecha Compromiso ',
                              U.has('fechaCompromiso')
                                ? e.jsx('span', {
                                    className: 'ml-1 normal-case',
                                    style: { color: te },
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
                            value: _,
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
                          value: V,
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
                          onChange: (n) => R({ fechaAprobacionReal: n.target.value }),
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
                            U.has('fechaFacturacion') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: te },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: M,
                          onChange: (n) => {
                            (R({ fechaFacturacion: n.target.value }), se('fechaFacturacion'));
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
                            U.has('fechaDespacho') &&
                              e.jsx('span', {
                                className: 'ml-1 normal-case',
                                style: { color: te },
                                children: '(auto)'
                              })
                          ]
                        }),
                        e.jsx('input', {
                          type: 'date',
                          value: F,
                          onChange: (n) => {
                            (R({ fechaDespacho: n.target.value }), se('fechaDespacho'));
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
                          onChange: (n) => R({ factura: n.target.value }),
                          className: 'field-input'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', { className: 'field-label', children: 'Guía' }),
                        e.jsx('input', {
                          type: 'text',
                          value: l,
                          onChange: (n) => R({ guia: n.target.value }),
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
                          value: D,
                          onChange: (n) => R({ bultos: n.target.value }),
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
                              value: K,
                              onChange: (n) =>
                                R({ valorFactura: n.target.value.replace(/[^0-9.]/g, '') }),
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
                          value: W,
                          onChange: (n) => R({ numeroEnvio: n.target.value }),
                          className: 'field-input'
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            h === 'update' &&
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
                    children: Pe.map((n) => {
                      const G = Q === n,
                        le =
                          n === 'PROBLEMAS DE DIRECCIÓN'
                            ? Ve
                            : n === 'PROBLEMAS DE TRANSPORTE'
                              ? Te
                              : ce;
                      return e.jsxs(
                        'button',
                        {
                          type: 'button',
                          onClick: () =>
                            R({
                              incidencia: G ? '' : n,
                              estadoIncidencia: G ? 'ABIERTA' : r || 'ABIERTA'
                            }),
                          className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${G ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                          children: [e.jsx(le, { size: 14 }), n]
                        },
                        n
                      );
                    })
                  }),
                  Q &&
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
                              value: r,
                              onChange: (n) => R({ estadoIncidencia: n.target.value }),
                              className: 'field-input',
                              children: ze.map((n) => e.jsx('option', { value: n, children: n }, n))
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
                              value: Q,
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
                              value: d,
                              onChange: (n) => R({ observacionesIncidencia: n.target.value }),
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
                children: k.map((n, G) =>
                  e.jsxs(
                    'p',
                    {
                      className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                      children: [e.jsx('span', { children: '⚠' }), n]
                    },
                    G
                  )
                )
              }),
            P &&
              !P.success &&
              e.jsx('div', {
                className: 'bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up',
                children: e.jsxs('p', {
                  className: 'text-[13px] text-red-600 flex items-center gap-1.5',
                  children: [e.jsx('span', { children: '⚠' }), P.message]
                })
              })
          ]
        })
    ]
  });
}
function Aa({ toast: a }) {
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
function Sa(a) {
  const t = a.nvs.map((u) => u.nv).join(' · '),
    s = a.fecha_comprometida ? ` · Compromiso ${a.fecha_comprometida}` : ' · sin fecha';
  return `${a.ticket} · NV ${t || '—'}${s}`;
}
function me(a, t = {}) {
  return {
    ...{
      id: a.id,
      fecha_comprometida: a.fecha_comprometida || null,
      estado: a.estado,
      observacion: a.observacion || null,
      nvs: a.nvs.map((u) => ({ nv: u.nv, canal: u.canal, cliente: u.cliente }))
    },
    ...t
  };
}
function Ra({ operador: a }) {
  const [t, s] = i.useState([]),
    [u, c] = i.useState(!0),
    [y, j] = i.useState(''),
    [C, x] = i.useState(''),
    [w, N] = i.useState(!1),
    [p, b] = i.useState(''),
    [h, S] = i.useState(!1),
    [z, O] = i.useState([]),
    [_, V] = i.useState(''),
    [E, M] = i.useState(''),
    [F, Y] = i.useState(!1),
    l = i.useCallback(async () => {
      (c(!0), j(''));
      try {
        s(await sa());
      } catch (g) {
        j((g == null ? void 0 : g.message) || 'Error al cargar consolidados');
      } finally {
        c(!1);
      }
    }, []);
  i.useEffect(() => {
    l();
  }, [l]);
  const D = (g) => {
      (x(g), setTimeout(() => x(''), 3e3));
    },
    K = async () => {
      const g = p.trim();
      if (g) {
        if (z.some((m) => m.nv === g)) {
          D(`La NV ${g} ya está en la lista`);
          return;
        }
        S(!0);
        try {
          const m = await Re(g);
          if (!m) {
            D(`NV ${g} no existe en la base`);
            return;
          }
          (O((f) => [...f, { nv: m.nv, canal: m.canal, cliente: m.cliente }]), b(''));
        } finally {
          S(!1);
        }
      }
    },
    W = async () => {
      if (z.length === 0) {
        D('Agrega al menos una NV');
        return;
      }
      Y(!0);
      const g = await de({
        fecha_comprometida: _ || null,
        observacion: E || null,
        created_by: a || null,
        nvs: z
      });
      if ((Y(!1), !g.ok)) {
        D(g.error || 'Error al crear');
        return;
      }
      (D(`✓ ${g.ticket || 'Consolidado'} creado`), O([]), V(''), M(''), N(!1), l());
    },
    H = async (g, m) => {
      const f = await de(me(g, { fecha_comprometida: m || null }));
      if (!f.ok) {
        D(f.error || 'Error');
        return;
      }
      s((A) => A.map((v) => (v.id === g.id ? { ...v, fecha_comprometida: m || null } : v)));
    },
    L = async (g) => {
      const m = g.estado === 'cerrado' ? 'abierto' : 'cerrado',
        f = await de(me(g, { estado: m }));
      if (!f.ok) {
        D(f.error || 'Error');
        return;
      }
      s((A) => A.map((v) => (v.id === g.id ? { ...v, estado: m } : v)));
    },
    J = async (g) => {
      if (!confirm(`¿Eliminar ${g.ticket}? Las NVs volverán a medirse con las 48 hrs.`)) return;
      const m = await ta(g.id);
      if (!m.ok) {
        D(m.error || 'Error');
        return;
      }
      (D(`${g.ticket} eliminado`), s((f) => f.filter((A) => A.id !== g.id)));
    },
    B = async (g, m) => {
      const f = g.nvs
          .filter((v) => v.id !== m)
          .map((v) => ({ nv: v.nv, canal: v.canal, cliente: v.cliente })),
        A = await de(me(g, { nvs: f }));
      if (!A.ok) {
        D(A.error || 'Error');
        return;
      }
      s((v) => v.map((T) => (T.id === g.id ? { ...T, nvs: T.nvs.filter((Q) => Q.id !== m) } : T)));
    },
    ae = async (g, m, f) => {
      const A = m.trim();
      if (!A) return;
      const v = await Re(A);
      if (!v) {
        D(`NV ${A} no existe`);
        return;
      }
      const T = [
          ...g.nvs.map((r) => ({ nv: r.nv, canal: r.canal, cliente: r.cliente })),
          { nv: v.nv, canal: v.canal, cliente: v.cliente }
        ],
        Q = await de(me(g, { nvs: T }));
      if (!Q.ok) {
        D(Q.error || 'Error');
        return;
      }
      (f(), l());
    };
  return e.jsxs('div', {
    className: 'anim-fade-up',
    children: [
      C &&
        e.jsx('div', {
          className:
            'fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] shadow-lg',
          children: C
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
          !w &&
            e.jsx('button', {
              onClick: () => N(!0),
              className: 'px-3 py-2 rounded-lg text-white text-[13px] font-semibold',
              style: { background: te },
              children: '+ Nuevo consolidado'
            })
        ]
      }),
      w &&
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
                  onChange: (g) => b(g.target.value),
                  onKeyDown: (g) => {
                    g.key === 'Enter' && (g.preventDefault(), K());
                  },
                  placeholder: 'N° NV (ej. 5646)',
                  className: 'inp flex-1 min-w-[160px]'
                }),
                e.jsx('button', {
                  onClick: K,
                  disabled: h,
                  className:
                    'px-3 py-2 rounded-lg bg-gray-800 text-white text-[13px] font-medium disabled:opacity-50',
                  children: h ? 'Validando…' : 'Agregar NV'
                })
              ]
            }),
            z.length > 0 &&
              e.jsx('div', {
                className: 'flex flex-wrap gap-1.5 mb-3',
                children: z.map((g) =>
                  e.jsxs(
                    'span',
                    {
                      className:
                        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-200 text-[12px]',
                      children: [
                        e.jsx('b', { children: g.nv }),
                        ' ',
                        e.jsx('span', {
                          className: 'text-gray-400',
                          children: g.cliente || g.canal
                        }),
                        e.jsx('button', {
                          onClick: () => O((m) => m.filter((f) => f.nv !== g.nv)),
                          className: 'text-gray-400 hover:text-red-600',
                          children: '×'
                        })
                      ]
                    },
                    g.nv
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
                      value: _,
                      onChange: (g) => V(g.target.value),
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
                      onChange: (g) => M(g.target.value),
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
                  onClick: W,
                  disabled: F || z.length === 0,
                  className:
                    'px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-50',
                  style: { background: te },
                  children: F ? 'Creando…' : 'Crear consolidado'
                }),
                e.jsx('button', {
                  onClick: () => {
                    (N(!1), O([]), V(''), M(''), b(''));
                  },
                  className:
                    'px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-[13px]',
                  children: 'Cancelar'
                })
              ]
            })
          ]
        }),
      y && e.jsx('p', { className: 'text-[13px] text-red-600 mb-3', children: y }),
      u
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
              children: t.map((g) =>
                e.jsx(
                  _a,
                  { c: g, onSetFecha: H, onToggle: L, onEliminar: J, onQuitarNv: B, onAddNv: ae },
                  g.id
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
function _a({ c: a, onSetFecha: t, onToggle: s, onEliminar: u, onQuitarNv: c, onAddNv: y }) {
  const [j, C] = i.useState(''),
    x = a.estado === 'cerrado';
  return e.jsxs('div', {
    className: `rounded-xl border p-4 ${x ? 'border-gray-200 bg-gray-50/60' : 'border-gray-200 bg-white'}`,
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between gap-2 flex-wrap mb-2',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsx('span', {
                className: 'px-2 py-0.5 rounded-lg text-white text-[12px] font-bold',
                style: { background: x ? '#6b7280' : te },
                children: a.ticket
              }),
              e.jsx('span', {
                className: `text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${x ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`,
                children: x ? 'Cerrado' : 'Abierto'
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
                    onChange: (w) => t(a, w.target.value),
                    className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg'
                  })
                ]
              }),
              e.jsx('button', {
                onClick: () => s(a),
                className:
                  'text-[12px] px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50',
                children: x ? 'Reabrir' : 'Cerrar'
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
            : a.nvs.map((w) =>
                e.jsxs(
                  'span',
                  {
                    className:
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px]',
                    children: [
                      e.jsx('b', { children: w.nv }),
                      ' ',
                      e.jsx('span', { className: 'text-gray-400', children: w.cliente || w.canal }),
                      e.jsx('button', {
                        onClick: () => w.id && c(a, w.id),
                        className: 'text-gray-400 hover:text-red-600',
                        children: '×'
                      })
                    ]
                  },
                  w.id
                )
              )
      }),
      e.jsxs('div', {
        className: 'flex gap-2 items-center',
        children: [
          e.jsx('input', {
            value: j,
            onChange: (w) => C(w.target.value),
            onKeyDown: (w) => {
              w.key === 'Enter' && (w.preventDefault(), y(a, j, () => C('')));
            },
            placeholder: '+ Agregar NV',
            className: 'h-8 px-2 text-[12px] border border-gray-200 rounded-lg flex-1 max-w-[200px]'
          }),
          e.jsx('button', {
            onClick: () => y(a, j, () => C('')),
            className: 'text-[12px] px-2 py-1 rounded-lg bg-gray-800 text-white',
            children: 'Agregar'
          })
        ]
      }),
      e.jsx('p', {
        className: 'mt-2 text-[11px] text-gray-400 font-mono select-all',
        children: Sa(a)
      })
    ]
  });
}
const ie = (a) => (a ? String(a).slice(0, 10) : ''),
  Da = ['Entregado', 'En Proceso', 'Shipping', 'Currier', 'En Ruta'],
  Oe = 60,
  Ia = 80;
function Oa(a, t) {
  const s = new Date(a);
  let u = 0;
  const c = s.getDay();
  for (c === 0 ? s.setDate(s.getDate() + 1) : c === 6 && s.setDate(s.getDate() + 2); u < t;) {
    s.setDate(s.getDate() + 1);
    const y = s.getDay();
    y !== 0 && y !== 6 && u++;
  }
  return s;
}
function Va(a, t) {
  const s = t || a;
  if (!s) return '';
  const u = new Date(s + 'T12:00:00');
  if (isNaN(u.getTime())) return '';
  const c = Oa(u, 2);
  return `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}-${String(c.getDate()).padStart(2, '0')}`;
}
const fe = [
  { label: 'Registrada', dateKey: 'fecha_registro_nv' },
  { label: 'Aprobada', dateKey: 'fecha_aprobacion' },
  { label: 'En Proceso', dateKey: 'fecha_en_proceso' },
  { label: 'Shipping', dateKey: 'fecha_shipping' },
  { label: 'Despachada', dateKey: 'fecha_despacho' },
  { label: 'En Ruta', dateKey: 'fecha_en_ruta' },
  { label: 'Entregada', dateKey: 'fecha_entregado' }
];
function Ta(a, t) {
  if (!a || !t) return null;
  const s = new Date(a).getTime(),
    u = new Date(t).getTime();
  if (isNaN(s) || isNaN(u)) return null;
  const c = Math.round((u - s) / 864e5);
  return c >= 0 ? c : null;
}
function Fa({ data: a }) {
  const t = fe.map((u) => ie(a[u.dateKey]));
  let s = -1;
  for (let u = t.length - 1; u >= 0; u--)
    if (t[u]) {
      s = u;
      break;
    }
  return e.jsx('div', {
    className: 'flex flex-col gap-0',
    children: fe.map((u, c) => {
      const y = t[c],
        j = !!y,
        C = c === s,
        x = c > 0 ? t[c - 1] : '',
        w = c > 0 && y && x ? Ta(x, y) : null,
        N = w !== null && w > 3;
      return e.jsxs(
        'div',
        {
          className: 'flex items-start gap-3',
          style: { minHeight: 44 },
          children: [
            e.jsxs('div', {
              className: 'flex flex-col items-center w-5 shrink-0',
              children: [
                c > 0 &&
                  e.jsx('div', {
                    className: 'w-0.5 h-3',
                    style: { background: j ? (N ? '#ef4444' : '#22c55e') : '#e5e7eb' }
                  }),
                c === 0 && e.jsx('div', { className: 'h-1' }),
                e.jsx('div', {
                  className: `rounded-full shrink-0 flex items-center justify-center transition-all ${C ? 'w-5 h-5 ring-4 ring-orange-100' : j ? 'w-4 h-4' : 'w-3.5 h-3.5 border-2 border-gray-300'}`,
                  style: { background: C ? '#f57c00' : j ? '#22c55e' : 'transparent' },
                  children:
                    j &&
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
                c < fe.length - 1 &&
                  e.jsx('div', {
                    className: 'w-0.5 flex-1 min-h-[8px]',
                    style: { background: j && t[c + 1] ? '#22c55e' : '#e5e7eb' }
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
                      className: `text-[12px] font-semibold ${C ? 'text-orange-600' : j ? 'text-gray-800' : 'text-gray-400'}`,
                      children: u.label
                    }),
                    w !== null &&
                      e.jsxs('span', {
                        className: `text-[10px] font-bold px-1.5 py-0.5 rounded-full ${N ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`,
                        children: [w, 'd']
                      })
                  ]
                }),
                y &&
                  e.jsx('span', { className: 'text-[11px] text-gray-400 font-medium', children: y })
              ]
            })
          ]
        },
        u.label
      );
    })
  });
}
function $a({
  item: a,
  puedeEscribir: t,
  puedeEliminar: s,
  puedeAprobarReapertura: u,
  opts: c,
  onClose: y,
  onSaved: j,
  onDeleted: C
}) {
  const [x, w] = i.useState(null),
    [N, p] = i.useState(!0),
    [b, h] = i.useState({}),
    [S, z] = i.useState(!1),
    [O, _] = i.useState(!1),
    [V, E] = i.useState(!1),
    [M, F] = i.useState(null),
    [Y, l] = i.useState([]),
    [D, K] = i.useState(!1),
    [W, H] = i.useState(''),
    [L, J] = i.useState(''),
    [B, ae] = i.useState(!1),
    [g, m] = i.useState(!1),
    f = i.useMemo(
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
  i.useEffect(() => {
    let o = !0;
    return (
      w(f),
      p(!1),
      xa(a.id, { canal: a.canal, nv: a.nv }).then((I) => {
        o && (w(I.found ? I.data : null), h({}), p(!1));
      }),
      () => {
        o = !1;
      }
    );
  }, [a, f]);
  const A = i.useCallback(async () => {
    if (!(a != null && a.id)) return (l([]), []);
    K(!0);
    try {
      const o = await Le(a.id);
      return (l(o), o);
    } catch {
      return (l([]), []);
    } finally {
      K(!1);
    }
  }, [a == null ? void 0 : a.id]);
  i.useEffect(() => {
    A();
  }, [A]);
  const v = (o) => (o in b ? b[o] : ((x == null ? void 0 : x[o]) ?? '' ?? '')),
    T = (o, I) => {
      h(($) => {
        const q = { ...$, [o]: I };
        return (
          o === 'fecha_aprobacion_real' &&
            (q.fecha_compromiso = Va(ie(x == null ? void 0 : x.fecha_aprobacion), I)),
          q
        );
      });
    },
    Q = i.useMemo(() => {
      const o = {};
      return (
        Object.keys(b).forEach((I) => {
          const $ = (x == null ? void 0 : x[I]) ?? '';
          String(b[I] ?? '') !== String($ ?? '') && (o[I] = b[I]);
        }),
        o
      );
    }, [b, x]),
    r = {
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
    d = async () => {
      (z(!0), F(null));
      const o = { id: a.id };
      Object.entries(Q).forEach(([$, q]) => {
        o[r[$] || $] = $ === 'urgente' ? String(q) === 'true' : q;
      });
      const I = await Ge(o);
      (z(!1),
        I.ok
          ? (F({ success: !0, message: 'Cambios guardados' }),
            j == null ||
              j({
                ...a,
                estado: v('estado') || a.estado,
                transportista: v('transportista'),
                urgente: String(v('urgente')) === 'true'
              }),
            setTimeout(y, 700))
          : F({ success: !1, message: I.message || I.error || 'No se pudo guardar' }));
    },
    k = async () => {
      _(!0);
      const o = await ga(a.id);
      (_(!1),
        o.ok
          ? (he.success(`NV ${a.nv} eliminada`), C == null || C(a), y())
          : (F({ success: !1, message: o.error || 'No se pudo eliminar' }), E(!1)));
    },
    P = (c == null ? void 0 : c.transportistas) || [],
    U = String(v('urgente')) === 'true',
    R = Be.includes(v('estado')) || !!v('incidencia'),
    Z = Y.find((o) => o.estado === 'PENDIENTE') || null,
    se = (x == null ? void 0 : x.estado) === 'Entregado',
    ne = async () => {
      const o = String(W || '').trim();
      if (!o) {
        F({ success: !1, message: 'Debes indicar el motivo de la reapertura.' });
        return;
      }
      ae(!0);
      const I = await Ue(a.id, o);
      (ae(!1),
        I.ok
          ? (H(''),
            await A(),
            F({ success: !0, message: I.message || 'Solicitud de reapertura enviada.' }))
          : F({
              success: !1,
              message: I.message || I.error || 'No se pudo solicitar la reapertura.'
            }));
    },
    re = async (o) => {
      if (!(Z != null && Z.id)) return;
      m(!0);
      const I = await ha(Z.id, o, L);
      if ((m(!1), !I.ok)) {
        F({ success: !1, message: I.message || I.error || 'No se pudo resolver la solicitud.' });
        return;
      }
      const $ = await je(a.canal, a.nv);
      ($.found &&
        (w($.data),
        h({}),
        j == null ||
          j({
            ...a,
            estado: $.data.estado || a.estado,
            transportista: $.data.transportista || a.transportista,
            urgente: String($.data.urgente) === 'true' || $.data.urgente === !0,
            reabierta: $.data.reabierta === !0,
            motivoReapertura: $.data.motivo_reapertura || ''
          })),
        J(''),
        await A(),
        F({ success: !0, message: I.message || 'Solicitud resuelta correctamente.' }));
    };
  return ye.createPortal(
    e.jsxs('div', {
      className: 'panel-portal fixed inset-0 z-[120] flex justify-end',
      onClick: y,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (o) => o.stopPropagation(),
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
                          style: { background: xe(a.estado) }
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
                  onClick: y,
                  className:
                    'w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 text-lg',
                  children: '✕'
                })
              ]
            }),
            e.jsx('div', {
              className: 'flex-1 overflow-y-auto min-h-0',
              children:
                !x && N
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
                  : x
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
                                  { l: 'Cliente', v: x.cliente },
                                  { l: 'Vendedor', v: x.vendedor },
                                  { l: 'C. Costo', v: x.ccosto || x.centro_costo },
                                  { l: 'División', v: x.division }
                                ]
                                  .filter((o) => o.v)
                                  .map((o) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className: 'bg-gray-50 rounded-lg px-3 py-2',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-[9px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5',
                                            children: o.l
                                          }),
                                          e.jsx('div', {
                                            className:
                                              'text-[13px] text-gray-800 font-medium truncate',
                                            title: o.v || '',
                                            children: o.v
                                          })
                                        ]
                                      },
                                      o.l
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
                                children: e.jsx(Fa, { data: x })
                              })
                            ]
                          }),
                          (x == null ? void 0 : x.reabierta) &&
                            e.jsx('section', {
                              className:
                                'rounded-xl border border-orange-200 bg-orange-50/80 px-4 py-3',
                              children: e.jsxs('div', {
                                className: 'flex items-start gap-3',
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'mt-0.5 h-9 w-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center',
                                    children: e.jsx(Fe, { size: 16 })
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
                                        children: x.motivo_reapertura || 'Sin motivo informado.'
                                      }),
                                      x.fecha_reapertura &&
                                        e.jsxs('div', {
                                          className: 'mt-1 text-xs text-slate-500',
                                          children: ['Aprobada el ', ie(x.fecha_reapertura)]
                                        })
                                    ]
                                  })
                                ]
                              })
                            }),
                          se
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
                                          children: e.jsx($e, { size: 18 })
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
                                      D
                                        ? e.jsx('div', {
                                            className:
                                              'rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500',
                                            children: 'Cargando solicitudes...'
                                          })
                                        : Z
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
                                                        children: e.jsx(Ce, { size: 16 })
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
                                                            children: Z.motivo
                                                          }),
                                                          e.jsxs('div', {
                                                            className:
                                                              'mt-1 text-xs text-slate-500',
                                                            children: [
                                                              'Solicitada por',
                                                              ' ',
                                                              Z.solicitada_por_nombre || 'Usuario',
                                                              ' el',
                                                              ' ',
                                                              ie(Z.solicitada_at)
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
                                                      'rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-4 space-y-3',
                                                    children: [
                                                      e.jsx('div', {
                                                        className:
                                                          'text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700',
                                                        children: 'Aprobación de reapertura'
                                                      }),
                                                      e.jsx('textarea', {
                                                        value: L,
                                                        onChange: (o) => J(o.target.value),
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
                                                            onClick: () => re(!0),
                                                            disabled: g,
                                                            className:
                                                              'rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50',
                                                            children: g
                                                              ? 'Procesando...'
                                                              : 'Aprobar y reabrir'
                                                          }),
                                                          e.jsx('button', {
                                                            type: 'button',
                                                            onClick: () => re(!1),
                                                            disabled: g,
                                                            className:
                                                              'rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 disabled:opacity-50',
                                                            children: g
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
                                                    value: W,
                                                    onChange: (o) => H(o.target.value),
                                                    className: 'field-input min-h-[96px] resize-y',
                                                    placeholder:
                                                      'Motivo obligatorio de reapertura: por qué se necesita devolver esta N.V. a En Proceso...'
                                                  }),
                                                  e.jsx('button', {
                                                    type: 'button',
                                                    onClick: ne,
                                                    disabled: B,
                                                    className:
                                                      'w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50',
                                                    children: B
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
                                          children: e.jsx(Ee, {
                                            items: pa.map((o) => ({
                                              value: o,
                                              label: o,
                                              color: xe(o)
                                            })),
                                            active: v('estado'),
                                            onSelect: (o) => T('estado', o)
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
                                                  value: v('tipo_despacho'),
                                                  onChange: (o) =>
                                                    T('tipo_despacho', o.target.value),
                                                  className: 'field-input',
                                                  children: [
                                                    e.jsx('option', { value: '', children: '—' }),
                                                    (
                                                      (c == null ? void 0 : c.tiposDespacho) || ma
                                                    ).map((o) =>
                                                      e.jsx('option', { value: o, children: o }, o)
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
                                                P.length > 0
                                                  ? e.jsxs('select', {
                                                      value: v('transportista'),
                                                      onChange: (o) =>
                                                        T('transportista', o.target.value),
                                                      className: 'field-input',
                                                      children: [
                                                        e.jsx('option', {
                                                          value: '',
                                                          children: '—'
                                                        }),
                                                        (v('transportista') &&
                                                        !P.includes(v('transportista'))
                                                          ? [v('transportista'), ...P]
                                                          : P
                                                        ).map((o) =>
                                                          e.jsx(
                                                            'option',
                                                            { value: o, children: o },
                                                            o
                                                          )
                                                        )
                                                      ]
                                                    })
                                                  : e.jsx('input', {
                                                      type: 'text',
                                                      value: v('transportista'),
                                                      onChange: (o) =>
                                                        T('transportista', o.target.value),
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
                                              onClick: () => T('urgente', U ? 'false' : 'true'),
                                              className: `relative w-11 h-6 rounded-full transition-colors ${U ? 'bg-red-500' : 'bg-gray-200'}`,
                                              children: e.jsx('span', {
                                                className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${U ? 'translate-x-5' : ''}`
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
                                                  value: v('fecha_aprobacion_real'),
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
                                                        color: v('fecha_compromiso')
                                                          ? te
                                                          : '#9ca3af'
                                                      },
                                                      children: '(auto)'
                                                    })
                                                  ]
                                                }),
                                                e.jsx('input', {
                                                  type: 'date',
                                                  value: v('fecha_compromiso'),
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
                                                  value: v('fecha_facturacion'),
                                                  onChange: (o) =>
                                                    T('fecha_facturacion', o.target.value),
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
                                                  value: v('fecha_despacho'),
                                                  onChange: (o) =>
                                                    T('fecha_despacho', o.target.value),
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
                                                  value: v('factura'),
                                                  onChange: (o) => T('factura', o.target.value),
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
                                                  value: v('guia'),
                                                  onChange: (o) => T('guia', o.target.value),
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
                                                  value: v('numero_envio'),
                                                  onChange: (o) =>
                                                    T('numero_envio', o.target.value),
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
                                                  value: v('bultos'),
                                                  onChange: (o) => T('bultos', o.target.value),
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
                                                      value: v('valor_factura'),
                                                      onChange: (o) =>
                                                        T(
                                                          'valor_factura',
                                                          o.target.value.replace(/[^0-9.]/g, '')
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
                                    R &&
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
                                            children: Pe.map((o) => {
                                              const I = v('incidencia') === o,
                                                $ =
                                                  o === 'PROBLEMAS DE DIRECCIÓN'
                                                    ? Ve
                                                    : o === 'PROBLEMAS DE TRANSPORTE'
                                                      ? Te
                                                      : ce;
                                              return e.jsxs(
                                                'button',
                                                {
                                                  type: 'button',
                                                  onClick: () => {
                                                    const q = !I;
                                                    (T('incidencia', q ? o : ''),
                                                      T(
                                                        'estado_incidencia',
                                                        (q && v('estado_incidencia')) || 'ABIERTA'
                                                      ),
                                                      q || T('observaciones_incidencia', ''));
                                                  },
                                                  className: `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${I ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'}`,
                                                  children: [e.jsx($, { size: 14 }), o]
                                                },
                                                o
                                              );
                                            })
                                          }),
                                          v('incidencia') &&
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
                                                      value: v('estado_incidencia') || 'ABIERTA',
                                                      onChange: (o) =>
                                                        T('estado_incidencia', o.target.value),
                                                      className: 'field-input',
                                                      children: ze.map((o) =>
                                                        e.jsx(
                                                          'option',
                                                          { value: o, children: o },
                                                          o
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
                                                      value: v('observaciones_incidencia'),
                                                      onChange: (o) =>
                                                        T(
                                                          'observaciones_incidencia',
                                                          o.target.value
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
                          M &&
                            e.jsxs('div', {
                              className: `rounded-xl px-3.5 py-3 text-[13px] ${M.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`,
                              children: [M.success ? '✓ ' : '⚠ ', M.message]
                            })
                        ]
                      })
                    : e.jsx('div', {
                        className: 'py-20 text-center text-sm text-gray-400',
                        children: 'No se pudieron cargar los datos de esta NV.'
                      })
            }),
            x &&
              ((t && !se) || s) &&
              e.jsxs('div', {
                className: 'shrink-0 bg-white border-t border-gray-200 p-4 space-y-2',
                children: [
                  t &&
                    !se &&
                    Object.keys(Q).length > 0 &&
                    e.jsx('button', {
                      onClick: d,
                      disabled: S,
                      className:
                        'w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-60',
                      style: { background: te },
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
                        : `Guardar ${Object.keys(Q).length} cambio${Object.keys(Q).length !== 1 ? 's' : ''}`
                    }),
                  s &&
                    (V
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
                                  onClick: k,
                                  disabled: O,
                                  className:
                                    'flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60',
                                  children: O ? 'Eliminando…' : 'Sí, eliminar'
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
const Ma = i.memo(function ({ i: t, onOpen: s }) {
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
              style: { background: xe(t.estado) }
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
function Pa({ puedeEscribir: a, puedeEliminar: t, puedeAprobarReapertura: s }) {
  const [u, c] = i.useState([]),
    [y, j] = i.useState(!0),
    [C, x] = i.useState('Todos'),
    [w, N] = i.useState(''),
    [p, b] = i.useState(null),
    [h, S] = i.useState([]),
    [z, O] = i.useState(!1),
    [_, V] = i.useState(null),
    [E, M] = i.useState(null),
    [F, Y] = i.useState(!1),
    [l, D] = i.useState(Oe),
    K = i.useRef(null),
    W = i.useRef(0),
    H = i.useCallback((m = !1) => {
      (j(!0),
        ra({ force: m, full: !1, limit: 400 })
          .then((f) => {
            (c(f), j(!1));
          })
          .catch(() => {
            (c([]), j(!1));
          }));
    }, []);
  i.useEffect(() => {
    H();
  }, [H]);
  const L = w.trim().length >= 2;
  (i.useEffect(() => {
    const m = w.trim();
    if (m.length < 2) {
      S([]);
      return;
    }
    S(na(u, m, { limit: 120 }));
  }, [w, u]),
    i.useEffect(() => {
      const m = w.trim();
      if (m.length < 2) {
        (b(null), O(!1));
        return;
      }
      O(!0);
      const f = W.current + 1;
      W.current = f;
      const A = new AbortController(),
        v = setTimeout(() => {
          la(m, { limit: 120, signal: A.signal })
            .then((T) => {
              W.current === f && b(T);
            })
            .catch(() => {
              W.current === f && b([]);
            })
            .finally(() => {
              W.current === f && O(!1);
            });
        }, 450);
      return () => {
        (clearTimeout(v), A.abort());
      };
    }, [w]));
  const J = i.useCallback(async () => {
      Y(!0);
      try {
        const m = await oa();
        if (!m.length) {
          he.warning('No hay operaciones para exportar.');
          return;
        }
        (fa({ filename: 'Operaciones_NV', sheets: [{ name: 'Notas de Venta', rows: m }] }),
          he.success(`Exportadas ${m.length} N.V. a Excel`));
      } catch (m) {
        he.error('No se pudo exportar: ' + ((m == null ? void 0 : m.message) || 'error'));
      } finally {
        Y(!1);
      }
    }, []),
    B = i.useMemo(
      () =>
        L ? ia(h, p || [], w, { limit: 160 }) : u.filter((m) => C === 'Todos' || m.estado === C),
      [L, h, p, w, u, C]
    ),
    ae = i.useMemo(() => B.slice(0, l), [B, l]),
    g = i.useMemo(() => {
      const m = {};
      return (
        u.forEach((f) => {
          m[f.estado] = (m[f.estado] || 0) + 1;
        }),
        m
      );
    }, [u]);
  return (
    i.useEffect(() => {
      D((m) => {
        const f = Math.min(B.length, Oe);
        return m === f && m <= B.length ? m : f;
      });
    }, [L, C, w, B.length]),
    i.useEffect(() => {
      !_ ||
        E ||
        qe()
          .then(M)
          .catch(() => {});
    }, [_, E]),
    i.useEffect(() => {
      if (l >= B.length) return;
      const m = K.current;
      if (!m) return;
      const f = new IntersectionObserver(
        (A) => {
          A.some((v) => v.isIntersecting) && D((v) => Math.min(v + Ia, B.length));
        },
        { root: null, rootMargin: '240px 0px', threshold: 0 }
      );
      return (f.observe(m), () => f.disconnect());
    }, [l, B.length]),
    e.jsxs('div', {
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          className: 'relative',
          children: [
            e.jsx(we, {
              size: 16,
              className: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            }),
            e.jsx('input', {
              value: w,
              onChange: (m) => N(m.target.value),
              placeholder: 'Buscar por NV, cliente, guía o factura (cualquier estado)…',
              className:
                'w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none bg-white'
            }),
            z &&
              e.jsx(ue, {
                size: 16,
                className: 'absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin'
              })
          ]
        }),
        !L &&
          (() => {
            const m = Be.filter((f) => (g[f] || 0) > 0).map((f) => ({
              value: f,
              label: f,
              color: xe(f),
              count: g[f] || 0
            }));
            return m.length === 0
              ? null
              : e.jsx(Ee, {
                  items: m,
                  active: C,
                  inline: !0,
                  onSelect: (f) => x(C === f ? 'Todos' : f)
                });
          })(),
        e.jsxs('div', {
          className: 'flex items-center justify-between gap-2 flex-wrap',
          children: [
            e.jsx('span', {
              className: 'text-[12px] text-gray-400',
              children: L
                ? `${ae.length} de ${B.length} resultado${B.length !== 1 ? 's' : ''} · búsqueda en todos los estados`
                : `${ae.length} de ${B.length} activas visibles · total activas ${u.length}`
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsxs('button', {
                  onClick: J,
                  disabled: F,
                  className:
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition-colors',
                  title: 'Descargar TODAS las N.V. (todas las columnas) a Excel',
                  children: [
                    F
                      ? e.jsx(ue, { size: 14, className: 'animate-spin' })
                      : e.jsx(Xe, { size: 14 }),
                    F ? 'Exportando…' : 'Exportar Excel'
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
        (y && !L) || (z && !p)
          ? e.jsx('div', {
              className: 'py-16 flex justify-center',
              children: e.jsx(ue, { className: 'animate-spin text-orange-500', size: 30 })
            })
          : B.length === 0
            ? e.jsx('div', {
                className: 'text-center py-16 text-gray-400 text-sm',
                children: L
                  ? 'Sin N.V. que coincidan con la búsqueda.'
                  : 'Sin N.V. activas para este filtro.'
              })
            : e.jsxs('div', {
                className: 'space-y-2',
                children: [
                  ae.map((m) => e.jsx(Ma, { i: m, onOpen: V }, m.key)),
                  l < B.length &&
                    e.jsx('div', {
                      ref: K,
                      className: 'flex items-center justify-center py-4',
                      children: e.jsxs('div', {
                        className:
                          'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-500 shadow-sm',
                        children: [
                          e.jsx(ue, { size: 14, className: 'animate-spin text-orange-500' }),
                          'Cargando más N.V...'
                        ]
                      })
                    })
                ]
              }),
        _ &&
          e.jsx($a, {
            item: _,
            puedeEscribir: a,
            puedeEliminar: t,
            puedeAprobarReapertura: s,
            opts: E,
            onClose: () => V(null),
            onSaved: (m) => {
              (c((f) => f.map((A) => (A.key === m.key ? { ...A, ...m } : A))),
                b((f) => f && f.map((A) => (A.key === m.key ? { ...A, ...m } : A))));
            },
            onDeleted: (m) => {
              (c((f) => f.filter((A) => A.key !== m.key)),
                b((f) => f && f.filter((A) => A.key !== m.key)));
            }
          })
      ]
    })
  );
}
function za({ canal: a, nv: t, onClose: s }) {
  var y;
  const u = Ke(),
    c = (((y = Ne.find((j) => j.value === a)) == null ? void 0 : y.label) || a || '').toUpperCase();
  return ye.createPortal(
    e.jsxs('div', {
      className: 'fixed inset-0 z-[60] flex items-center justify-center p-4',
      onClick: s,
      children: [
        e.jsx('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
        e.jsxs('div', {
          onClick: (j) => j.stopPropagation(),
          className:
            'relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden anim-fade-up',
          children: [
            e.jsxs('div', {
              className: 'px-6 pt-6 pb-5 text-center',
              children: [
                e.jsx('div', {
                  className:
                    'w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-4',
                  children: e.jsx(ce, { size: 26 })
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
                    e.jsx('strong', { className: 'text-gray-700', children: c }),
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
                  style: { background: te },
                  children: [e.jsx(ea, { size: 16 }), ' Ir a Carga Masiva']
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
function qa({
  item: a,
  puedeEscribir: t,
  puedeAprobarReapertura: s,
  motivo: u,
  onMotivoChange: c,
  onRequestReopen: y,
  requesting: j,
  onClose: C
}) {
  if (!a) return null;
  const x = a.estado === 'Entregado',
    w = x
      ? 'ALERTA CRITICA: N.V. ENTREGADA Y BLOQUEADA'
      : 'ALERTA CRITICA: N.V. DUPLICADA DETECTADA';
  return e.jsx(Na, {
    titulo: x ? 'N.V. entregada detectada' : 'N.V. ya registrada',
    onClose: C,
    fullscreen: !0,
    children: e.jsx('div', {
      className:
        'flex min-h-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-5 sm:px-8 sm:py-8',
      children: e.jsxs('div', {
        className: 'mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-6',
        children: [
          e.jsxs('div', {
            className: `rounded-[2rem] border-2 px-5 py-6 sm:px-8 sm:py-8 shadow-2xl ${x ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`,
            children: [
              e.jsx('div', {
                className: `mb-5 rounded-2xl border px-4 py-4 sm:px-6 ${x ? 'border-red-200 bg-red-100 text-red-800' : 'border-amber-200 bg-amber-100 text-amber-800'}`,
                children: e.jsx('div', {
                  className:
                    'text-lg sm:text-3xl font-black uppercase tracking-[0.18em] leading-tight text-center',
                  children: w
                })
              }),
              e.jsxs('div', {
                className: 'flex flex-col gap-5 sm:flex-row sm:items-start',
                children: [
                  e.jsx('div', {
                    className: `mt-0.5 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl ${x ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`,
                    children: x ? e.jsx($e, { size: 34 }) : e.jsx(ce, { size: 34 })
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
                          x
                            ? ' QUEDA BLOQUEADA PARA NO ALTERAR OTIF Y SLA UNA VEZ ENTREGADA.'
                            : ' EL FORMULARIO YA QUEDO EN MODO ACTUALIZACION PARA EVITAR GENERAR UN DUPLICADO.'
                        ]
                      }),
                      a.reabierta &&
                        e.jsxs('div', {
                          className:
                            'mt-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-orange-700',
                          children: [e.jsx(Fe, { size: 14 }), 'N.V. reabierta']
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
                        ie(a.pendingRequest.solicitada_at)
                      ]
                    })
                  ]
                })
            ]
          }),
          x &&
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
                    e.jsx(Ce, { size: 20, className: 'text-orange-600' }),
                    'Solicitar reapertura'
                  ]
                }),
                e.jsx('textarea', {
                  value: u,
                  onChange: (N) => c(N.target.value),
                  className: 'field-input mt-4 min-h-[160px] resize-y',
                  placeholder:
                    'Observación obligatoria: explica por qué se necesita reabrir esta N.V. entregada...'
                }),
                e.jsx('button', {
                  type: 'button',
                  onClick: y,
                  disabled: j,
                  className:
                    'mt-4 w-full rounded-2xl bg-orange-500 px-4 py-4 text-base font-black uppercase tracking-[0.12em] text-white disabled:opacity-50',
                  children: j ? 'Enviando solicitud...' : 'Enviar solicitud de reapertura'
                })
              ]
            }),
          !t &&
            x &&
            !s &&
            e.jsx('div', {
              className:
                'rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm sm:text-base text-slate-500 shadow-xl',
              children: 'Necesitas permisos de gestión para solicitar la reapertura de esta N.V.'
            }),
          e.jsx('div', {
            className: 'flex justify-center pt-2',
            children: e.jsx('button', {
              onClick: C,
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
function Ba({ puedeEscribir: a, puedeAprobarReapertura: t }) {
  var v, T, Q;
  const s = oe(),
    [u, c] = i.useState(null),
    [y, j] = i.useState(null),
    [C, x] = i.useState([]),
    [w, N] = i.useState(null),
    [p, b] = i.useState(null),
    [h, S] = i.useState(''),
    [z, O] = i.useState(!1),
    [_, V] = i.useState([]),
    [E, M] = i.useState(null),
    [F, Y] = i.useState(null);
  (i.useEffect(() => {
    qe()
      .then(c)
      .catch(() => {});
  }, []),
    i.useEffect(() => {
      ba()
        .then(x)
        .catch(() => x([]));
    }, []),
    i.useEffect(() => {
      if (!y) return;
      const r = setTimeout(() => j(null), 3e3);
      return () => clearTimeout(r);
    }, [y]));
  const l = (v = s.lookupResult) != null && v.found ? s.lookupResult : null,
    D = ((T = l == null ? void 0 : l.data) == null ? void 0 : T.estado) === 'Entregado',
    K = _.find((r) => r.estado === 'PENDIENTE') || null,
    W = i.useMemo(
      () =>
        s.mode !== 'update' || !(l != null && l.data)
          ? !1
          : String(s.estado || '') !== String(l.data.estado || '') ||
            !!s.urgente != !!l.data.urgente ||
            String(s.fechaFacturacion || '') !== String(ie(l.data.fecha_facturacion) || '') ||
            String(s.fechaDespacho || '') !== String(ie(l.data.fecha_despacho) || ''),
      [
        s.mode,
        s.estado,
        s.urgente,
        s.fechaFacturacion,
        s.fechaDespacho,
        l == null ? void 0 : l.data
      ]
    ),
    H =
      s.mode === 'update' &&
      (E == null ? void 0 : E.permitida) === !1 &&
      (F == null ? void 0 : F.permitida) === !0 &&
      W;
  i.useEffect(() => {
    var d;
    let r = !1;
    if (!(l != null && l.row) || !a) {
      (M(null), Y(null));
      return;
    }
    return (
      Promise.all([
        ca(l.row),
        da(
          l.row,
          s.estado || ((d = l == null ? void 0 : l.data) == null ? void 0 : d.estado) || null
        )
      ])
        .then(([k, P]) => {
          r || (M(k), Y(P));
        })
        .catch(() => {
          r ||
            (M({ permitida: !1, message: 'No se pudo validar el acceso IAM para esta N.V.' }),
            Y({ permitida: !1, message: 'No se pudo validar la transición de estado.' }));
        }),
      () => {
        r = !0;
      }
    );
  }, [
    l == null ? void 0 : l.row,
    (Q = l == null ? void 0 : l.data) == null ? void 0 : Q.estado,
    a,
    s.estado
  ]);
  const L = i.useCallback(async (r) => {
      if (!r) return (V([]), []);
      try {
        const d = await Le(r);
        return (V(d), d);
      } catch {
        return (V([]), []);
      }
    }, []),
    J = i.useCallback(
      (r, d = _) => {
        if (!r) return;
        const k = d.find((P) => P.estado === 'PENDIENTE') || null;
        b({ ...r, pendingRequest: k });
      },
      [_]
    ),
    B = i.useCallback(
      async (r) => {
        var k, P, U;
        (s.patch({ lookupResult: { found: !0, row: r.row, data: r.data } }), s.applyFound(r.data));
        const d = s.canal === 'ptm' && _e((k = r.data) == null ? void 0 : k.cliente);
        (s.patch({
          orangeAssociationRequired: d,
          orangeAssociationError: '',
          orangeAssociationData: null,
          orangeAssociationNv: ((P = r.data) == null ? void 0 : P.nv_orange) || ''
        }),
          d && (U = r.data) != null && U.nv_orange && (await g(r.data.nv_orange)));
      },
      [s]
    );
  i.useEffect(() => {
    if (!(l != null && l.row)) {
      V([]);
      return;
    }
    L(l.row);
  }, [l == null ? void 0 : l.row, L]);
  const ae = i.useCallback(() => {
      var k, P;
      const r = oe.getState(),
        d =
          (k = r.lookupResult) != null && k.found
            ? r.lookupResult.data
            : (P = r.lookupResult) == null
              ? void 0
              : P.autoFill;
      return {
        vendedor: (d == null ? void 0 : d.vendedor) || '',
        ccosto: (d == null ? void 0 : d.ccosto) || (d == null ? void 0 : d.centro_costo) || '',
        centro_costo:
          (d == null ? void 0 : d.centro_costo) || (d == null ? void 0 : d.ccosto) || '',
        division: (d == null ? void 0 : d.division) || ''
      };
    }, []),
    g = i.useCallback(
      async (r) => {
        const d = String(r || '').trim();
        if (!d)
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
          orangeAssociationNv: d,
          orangeAssociationLoading: !0,
          orangeAssociationError: ''
        });
        try {
          const k = await ua(d, ae());
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
      [ae, s]
    ),
    m = async () => {
      var k, P, U, R, Z, se, ne;
      const r = String(s.nv || '').trim();
      if (!r) return;
      s.patch({ lookupLoading: !0, submitResult: null, errors: [] });
      const d = await je(s.canal, r);
      if (d.found) {
        await B(d);
        const re = ((k = d.data) == null ? void 0 : k.estado) === 'Entregado' ? await L(d.row) : [];
        Da.includes((P = d.data) == null ? void 0 : P.estado) &&
          J(
            {
              id: d.row,
              canal: s.canal,
              nv: r,
              estado: (U = d.data) == null ? void 0 : U.estado,
              reabierta: ((R = d.data) == null ? void 0 : R.reabierta) === !0,
              motivo_reapertura: ((Z = d.data) == null ? void 0 : Z.motivo_reapertura) || ''
            },
            re
          );
      } else if (s.canal !== 'varios' && !((se = d.autoFill) != null && se.cliente)) {
        (s.patch({
          lookupLoading: !1,
          lookupResult: null,
          mode: 'idle',
          orangeAssociationRequired: !1,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        }),
          N({ canal: s.canal, nv: r }));
        return;
      } else {
        (b(null),
          V([]),
          s.patch({ lookupResult: { found: !1, autoFill: d.autoFill } }),
          s.applyNew(d.autoFill || {}));
        const re = s.canal === 'ptm' && _e((ne = d.autoFill) == null ? void 0 : ne.cliente);
        s.patch({
          orangeAssociationRequired: re,
          orangeAssociationNv: '',
          orangeAssociationData: null,
          orangeAssociationError: ''
        });
      }
      s.patch({ lookupLoading: !1 });
    },
    f = async () => {
      const r = (l == null ? void 0 : l.row) || (p == null ? void 0 : p.id),
        d = String(h || '').trim();
      if (!r) return;
      if (!d) {
        s.patch({
          submitResult: { success: !1, message: 'Debes indicar el motivo de la reapertura.' }
        });
        return;
      }
      O(!0);
      const k = await Ue(r, d);
      if ((O(!1), !k.ok)) {
        const U = k.message || k.error || 'No se pudo solicitar la reapertura.';
        (s.patch({ submitResult: { success: !1, message: U } }), j({ type: 'error', message: U }));
        return;
      }
      const P = await L(r);
      (S(''),
        l != null &&
          l.data &&
          J(
            {
              id: l.row,
              canal: s.canal,
              nv: s.nv,
              estado: l.data.estado,
              reabierta: l.data.reabierta === !0,
              motivo_reapertura: l.data.motivo_reapertura || ''
            },
            P
          ),
        s.patch({
          submitResult: { success: !0, message: k.message || 'Solicitud de reapertura enviada.' }
        }),
        j({ type: 'success', message: k.message || 'Solicitud de reapertura enviada.' }));
    },
    A = async () => {
      var Z, se, ne, re, o, I, $;
      const r = oe.getState();
      if (r.mode === 'idle') return;
      if (!r.estado) {
        r.patch({ submitResult: { success: !1, message: 'Falta el Estado' } });
        return;
      }
      if (
        r.mode === 'update' &&
        l != null &&
        l.row &&
        (E == null ? void 0 : E.permitida) === !1 &&
        !H
      ) {
        (r.patch({
          submitResult: {
            success: !1,
            message: E.message || 'No tienes permisos IAM para editar esta N.V.'
          }
        }),
          j({
            type: 'error',
            message: E.message || 'No tienes permisos IAM para editar esta N.V.'
          }));
        return;
      }
      if (
        (Z = r.lookupResult) != null &&
        Z.found &&
        ((ne = (se = r.lookupResult) == null ? void 0 : se.data) == null ? void 0 : ne.estado) ===
          'Entregado'
      ) {
        const q = await L(r.lookupResult.row);
        (J(
          {
            id: r.lookupResult.row,
            canal: r.canal,
            nv: r.nv,
            estado: r.lookupResult.data.estado,
            reabierta: r.lookupResult.data.reabierta === !0,
            motivo_reapertura: r.lookupResult.data.motivo_reapertura || ''
          },
          q
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
      const d =
          (re = r.lookupResult) != null && re.found
            ? r.lookupResult.data
            : (o = r.lookupResult) == null
              ? void 0
              : o.autoFill,
        k = r.orangeAssociationData,
        P = {
          id: r.mode === 'update' ? ((I = r.lookupResult) == null ? void 0 : I.row) : null,
          mode: r.mode,
          canal: r.canal,
          nv: r.nv,
          cliente: (k == null ? void 0 : k.cliente) || (d == null ? void 0 : d.cliente) || '',
          vendedor: (k == null ? void 0 : k.vendedor) || (d == null ? void 0 : d.vendedor) || '',
          division: (k == null ? void 0 : k.division) || (d == null ? void 0 : d.division) || '',
          centro_costo:
            (k == null ? void 0 : k.ccosto) ||
            (d == null ? void 0 : d.ccosto) ||
            (d == null ? void 0 : d.centro_costo) ||
            '',
          nvOrangeAsociada: r.orangeAssociationRequired
            ? r.orangeAssociationNv
            : (d == null ? void 0 : d.nv_orange) || '',
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
        U = await Ge(P);
      if ((oe.getState().patch({ submitting: !1 }), U.ok)) {
        (b(null),
          V([]),
          j({
            type: 'success',
            message: `NV ${P.nv} ${P.mode === 'update' ? 'actualizada' : 'creada'}`
          }),
          oe.getState().reset());
        return;
      }
      let R = U.message || U.error || 'No se pudo guardar';
      if (U.duplicate || U.locked) {
        const q = await je(r.canal, r.nv);
        if (q.found) {
          await B(q);
          const ge =
            (($ = q.data) == null ? void 0 : $.estado) === 'Entregado' ? await L(q.row) : [];
          J(
            {
              id: q.row,
              canal: r.canal,
              nv: r.nv,
              estado: q.data.estado,
              reabierta: q.data.reabierta === !0,
              motivo_reapertura: q.data.motivo_reapertura || ''
            },
            ge
          );
        }
      }
      (oe.getState().patch({ submitResult: { success: !1, message: R } }),
        j({ type: 'error', message: R }));
    };
  return e.jsxs('div', {
    className: 'pb-24',
    children: [
      e.jsx(ka, {
        options: u,
        transportistasOpts: (u == null ? void 0 : u.transportistas) || [],
        vendedoresMaestro: C,
        onLookup: m,
        onLookupOrange: g,
        canRequestReopen: a,
        onOpenReopen: () => {
          var r, d, k;
          return J({
            id: l == null ? void 0 : l.row,
            canal: s.canal,
            nv: s.nv,
            estado: (r = l == null ? void 0 : l.data) == null ? void 0 : r.estado,
            reabierta: ((d = l == null ? void 0 : l.data) == null ? void 0 : d.reabierta) === !0,
            motivo_reapertura:
              ((k = l == null ? void 0 : l.data) == null ? void 0 : k.motivo_reapertura) || ''
          });
        },
        latestReopenRequest: K
      }),
      w && e.jsx(za, { canal: w.canal, nv: w.nv, onClose: () => N(null) }),
      p &&
        e.jsx(qa, {
          item: p,
          puedeEscribir: a,
          puedeAprobarReapertura: t,
          motivo: h,
          onMotivoChange: S,
          onRequestReopen: f,
          requesting: z,
          onClose: () => b(null)
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
                    !H &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold',
                      children: E.message || 'Sin acceso IAM para editar esta N.V.'
                    }),
                  s.mode === 'update' &&
                    (E == null ? void 0 : E.permitida) === !1 &&
                    H &&
                    e.jsx('div', {
                      className:
                        'px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold',
                      children:
                        (F == null ? void 0 : F.message) ||
                        'Tienes permiso para cambiar estado, pero no para editar otros campos de esta N.V.'
                    }),
                  D &&
                    a &&
                    e.jsxs('button', {
                      onClick: () => {
                        var r, d, k;
                        return J({
                          id: l == null ? void 0 : l.row,
                          canal: s.canal,
                          nv: s.nv,
                          estado: (r = l == null ? void 0 : l.data) == null ? void 0 : r.estado,
                          reabierta:
                            ((d = l == null ? void 0 : l.data) == null ? void 0 : d.reabierta) ===
                            !0,
                          motivo_reapertura:
                            ((k = l == null ? void 0 : l.data) == null
                              ? void 0
                              : k.motivo_reapertura) || '',
                          pendingRequest: K
                        });
                      },
                      className:
                        'px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-black text-sm flex items-center gap-2',
                      children: [e.jsx(Ce, { size: 16 }), 'Solicitar reapertura']
                    }),
                  e.jsxs('button', {
                    onClick: A,
                    disabled:
                      s.submitting ||
                      D ||
                      (s.mode === 'update' && (E == null ? void 0 : E.permitida) === !1 && !H),
                    className:
                      'px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2',
                    children: [
                      s.submitting
                        ? e.jsx(ue, { size: 16, className: 'animate-spin' })
                        : e.jsx(Je, { size: 16 }),
                      D
                        ? 'N.V. bloqueada'
                        : s.mode === 'update' && (E == null ? void 0 : E.permitida) === !1 && !H
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
      e.jsx(Aa, { toast: y })
    ]
  });
}
function La() {
  const { user: a } = Me();
  return e.jsx(Ra, { operador: (a == null ? void 0 : a.nombre) || '' });
}
const Ua = ['angelica@ptm.cl'];
function Ga(a) {
  return a
    ? a.rol === 'ADMIN' ||
        a.es_admin_delegado === !0 ||
        Ua.includes((a.email || '').trim().toLowerCase())
    : !1;
}
function rs() {
  const { hasPermission: a, user: t } = Me(),
    s = a('manage_panel'),
    u = a('approve_panel_reopen_nv') || a('manage_roles'),
    c = Ga(t),
    [y, j] = i.useState('buscar'),
    C = [
      { v: 'buscar', label: 'Buscar', hint: 'Seguimiento y consulta', icon: we, accent: '#2563eb' },
      { v: 'ingresar', label: 'Ingresar', hint: 'Registro operativo', icon: ve, accent: te },
      ...(s
        ? [
            {
              v: 'consolidados',
              label: 'Consolidados',
              hint: 'Agrupación comercial',
              icon: Ze,
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
            children: C.map((x) => {
              const w = x.icon,
                N = y === x.v;
              return e.jsxs(
                'button',
                {
                  type: 'button',
                  onClick: () => j(x.v),
                  className: `group relative overflow-hidden rounded-[1.15rem] border px-4 py-3.5 text-left transition-all duration-200 ${N ? 'bg-white text-slate-700 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]' : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/80'}`,
                  style: N ? { borderColor: `${x.accent}26` } : void 0,
                  'aria-pressed': N,
                  children: [
                    N &&
                      e.jsx('div', {
                        className: 'absolute inset-x-4 top-0 h-[2px] rounded-full',
                        style: { background: x.accent }
                      }),
                    e.jsx('div', {
                      className: `absolute inset-0 pointer-events-none transition-opacity ${N ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`,
                      style: {
                        background: `radial-gradient(circle at top right, ${x.accent}14, transparent 42%)`
                      }
                    }),
                    e.jsxs('div', {
                      className: 'relative flex items-center gap-3',
                      children: [
                        e.jsx('div', {
                          className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${N ? 'bg-white' : 'border-slate-200 bg-white/90 text-slate-500'}`,
                          style: N
                            ? {
                                borderColor: `${x.accent}26`,
                                color: x.accent,
                                background: `${x.accent}10`
                              }
                            : void 0,
                          children: e.jsx(w, { size: 18 })
                        }),
                        e.jsxs('div', {
                          className: 'min-w-0 flex-1',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center justify-between gap-3',
                              children: [
                                e.jsx('div', {
                                  className: `text-sm font-black tracking-tight ${N ? 'text-slate-900' : 'text-slate-800'}`,
                                  children: x.label
                                }),
                                N &&
                                  e.jsx('span', {
                                    className:
                                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
                                    style: { background: `${x.accent}12`, color: x.accent },
                                    children: 'Activo'
                                  })
                              ]
                            }),
                            e.jsx('div', {
                              className: `mt-1 text-[12px] leading-5 ${N ? 'text-slate-500' : 'text-slate-400'}`,
                              children: x.hint
                            })
                          ]
                        })
                      ]
                    })
                  ]
                },
                x.v
              );
            })
          })
        ]
      }),
      y === 'buscar' &&
        e.jsx(Pa, { puedeEscribir: s, puedeEliminar: c, puedeAprobarReapertura: u }),
      y === 'ingresar' && e.jsx(Ba, { puedeEscribir: s, puedeAprobarReapertura: u }),
      y === 'consolidados' && s && e.jsx(La, {})
    ]
  });
}
export { rs as default };
