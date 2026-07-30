import { j as e } from './query-vendor-B1MP_4YJ.js';
import { r } from './react-vendor-C8fdn38R.js';
import { s as te } from './index-D3K83tgM.js';
import { s as Q, c as oe, f as ie, n as ae, E as se } from './dashData-DV-hugLV.js';
import { e as le } from './formulaEngine-CFaRJv6o.js';
import './supabase-vendor-jY4wIOEF.js';
import './ui-vendor-D-9zQVt7.js';
import './animation-vendor-BwUUObbT.js';
const X = [
  { key: 'fecha_aprobacion', label: 'N.V Creada en Sistema' },
  { key: 'fecha_registro_nv', label: 'Registrada en Base de Datos' },
  { key: 'fecha_en_proceso', label: 'En Proceso' },
  { key: 'fecha_shipping', label: 'Shipping' },
  { key: 'fecha_en_ruta', label: 'En Ruta' },
  { key: 'fecha_entregado', label: 'Entregado' }
];
function ne(a) {
  if (!a) return '—';
  const s = new Date(typeof a == 'string' && a.length === 10 ? a + 'T12:00:00' : a);
  return isNaN(s.getTime())
    ? String(a)
    : s.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }).replace('.', '');
}
function ce(a) {
  if (a == null || a === '') return '—';
  const s = Number(a);
  return isNaN(s) ? String(a) : '$' + s.toLocaleString('es-CL');
}
function de(a) {
  const s = String(a).toUpperCase();
  return ['CRITICA', 'FAIL', 'TRUE', 'RIESGO', 'RISK', 'VENCIDA'].includes(s)
    ? { bg: '#fef2f2', fg: '#b91c1c', dot: '#ef4444' }
    : ['ALTA', 'PEND', 'MEDIA'].includes(s)
      ? { bg: '#fffbeb', fg: '#b45309', dot: '#f59e0b' }
      : ['OK', 'NORMAL', 'FALSE', 'FINALIZADA'].includes(s)
        ? { bg: '#f0fdf4', fg: '#15803d', dot: '#22c55e' }
        : { bg: '#eff6ff', fg: '#1d4ed8', dot: '#3b82f6' };
}
function V({ texto: a, big: s }) {
  const i = de(a);
  return e.jsxs('span', {
    className: `inline-flex items-center gap-1.5 rounded-full font-bold ${s ? 'px-3 py-1 text-[13px]' : 'px-2 py-0.5 text-[11px]'}`,
    style: { background: i.bg, color: i.fg },
    children: [
      e.jsx('span', {
        className: 'rounded-full',
        style: { background: i.dot, width: s ? 8 : 6, height: s ? 8 : 6 }
      }),
      a
    ]
  });
}
function C({ valor: a, label: s, tono: i = 'slate' }) {
  const v = {
    slate: 'text-slate-800',
    red: 'text-red-600',
    amber: 'text-amber-600',
    green: 'text-emerald-600'
  };
  return e.jsxs('div', {
    className: 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center',
    children: [
      e.jsx('div', { className: `text-xl font-bold tabular-nums ${v[i]}`, children: a }),
      e.jsx('div', {
        className: 'text-[10px] uppercase tracking-wide text-slate-400 mt-0.5',
        children: s
      })
    ]
  });
}
function xe({ r: a, est: s, color: i, nv: v, canal: x, children: $ }) {
  const [m, E] = r.useState([]),
    [S, B] = r.useState(!1),
    [P, T] = r.useState(!1),
    y = r.useMemo(() => {
      const n = Q(a.fecha_compromiso) || oe(Q(a.fecha_aprobacion), Q(a.fecha_aprobacion_real));
      return {
        ...a,
        fecha_compromiso: n || null,
        fecha_entrega: a.fecha_entregado,
        fecha_creacion: a.fecha_registro_nv
      };
    }, [a]),
    p = (n) => le(n, y).value,
    H = String(s).toLowerCase(),
    d = H.includes('recibido') || H.includes('entregad'),
    j = p('PRIORIDAD_OPERACIONAL(fecha_compromiso, estado)'),
    k = p('DATEDIFF(fecha_aprobacion, fecha_entrega)'),
    O = a.urgente === !0 || String(a.urgente) === 'true',
    w = d ? null : p('HOURS_DIFF(NOW(), fecha_compromiso)'),
    I = d ? null : p('DATEDIFF(NOW(), fecha_compromiso)'),
    U = !d && p('RIESGO_OTIF(fecha_compromiso, estado)') === !0,
    F = !d && typeof w == 'number' && w < 0,
    R = a.fecha_entregado || a.fecha_en_ruta || a.fecha_despacho || null,
    b =
      d && R && y.fecha_compromiso
        ? le('DATEDIFF(fecha_compromiso, entrega)', { ...y, entrega: R }).value
        : null,
    u = b == null ? null : b <= 0;
  r.useEffect(() => {
    let n = !0;
    return (
      T(!1),
      ie(v, x)
        .then((g) => {
          n && E(g);
        })
        .catch(() => {
          n && E([]);
        })
        .finally(() => {
          n && T(!0);
        }),
      () => {
        n = !1;
      }
    );
  }, [v, x]);
  const q = X.reduce((n, g, N) => (a[g.key] ? N : n), -1);
  return e.jsxs('div', {
    className:
      'anim-fade-up px-4 py-4 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100',
    children: [
      e.jsxs('div', {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
        style: { background: `linear-gradient(135deg, ${i}0d 0%, #ffffff 60%)` },
        children: [
          e.jsxs('div', {
            className: 'flex items-start justify-between gap-3 flex-wrap',
            children: [
              e.jsxs('div', {
                className: 'min-w-0',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2 flex-wrap',
                    children: [
                      e.jsx('span', {
                        className: 'text-[11px] font-medium text-slate-400 uppercase',
                        children: x
                      }),
                      e.jsxs('h2', {
                        className: 'text-lg font-bold text-slate-900',
                        children: ['NV ', v]
                      })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'text-sm text-slate-600 mt-0.5 truncate',
                    children: a.cliente || '—'
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'flex items-center gap-2 flex-wrap justify-end',
                children: [
                  e.jsx('span', {
                    className:
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold text-white',
                    style: { background: i },
                    children: s
                  }),
                  !d &&
                    j &&
                    j !== 'FINALIZADA' &&
                    j !== 'NORMAL' &&
                    e.jsx(V, { texto: j, big: !0 }),
                  !d && F && e.jsx(V, { texto: 'VENCIDA', big: !0 }),
                  !d && U && !F && e.jsx(V, { texto: 'RIESGO OTIF', big: !0 }),
                  d && u === !0 && e.jsx(V, { texto: 'A TIEMPO', big: !0 }),
                  d && u === !1 && e.jsx(V, { texto: `TARDE +${b}d`, big: !0 }),
                  O && e.jsx(V, { texto: '🚨 URGENTE', big: !0 })
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-4 text-[13px]',
            children: [
              e.jsx(Z, { icon: '🚚', label: 'Transportista', value: a.transportista || '—' }),
              e.jsx(Z, { icon: '📦', label: 'Bultos', value: a.bultos ?? '—' }),
              e.jsx(Z, { icon: '💰', label: 'Valor factura', value: ce(a.valor_factura) }),
              e.jsx(Z, { icon: '📅', label: 'Compromiso', value: ne(y.fecha_compromiso) })
            ]
          })
        ]
      }),
      e.jsx('div', {
        className: 'grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3',
        children: d
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsx(C, {
                  valor: u == null ? '—' : u ? 'A tiempo' : 'Tarde',
                  label: 'OTIF (puntualidad)',
                  tono: u == null ? 'slate' : u ? 'green' : 'red'
                }),
                e.jsx(C, {
                  valor: b == null ? '—' : b <= 0 ? `${b}d` : `+${b}d`,
                  label: 'Desfase vs compromiso',
                  tono: b != null && b > 0 ? 'red' : 'green'
                }),
                e.jsx(C, { valor: k == null ? '—' : `${k}d`, label: 'Lead time' }),
                e.jsx(C, { valor: 'FINALIZADA', label: 'Estado', tono: 'green' })
              ]
            })
          : e.jsxs(e.Fragment, {
              children: [
                e.jsx(C, {
                  valor: w == null ? '—' : `${Math.round(Math.abs(w))}h`,
                  label: F ? 'Vencida hace' : 'Restantes',
                  tono: F ? 'red' : typeof w == 'number' && w < 24 ? 'amber' : 'green'
                }),
                e.jsx(C, {
                  valor: I == null ? '—' : `${I}d`,
                  label: 'Días compromiso',
                  tono: typeof I == 'number' && I < 0 ? 'red' : 'slate'
                }),
                e.jsx(C, { valor: k == null ? '—' : `${k}d`, label: 'Lead time' }),
                e.jsx(C, {
                  valor: j || '—',
                  label: 'Prioridad',
                  tono: j === 'CRITICA' ? 'red' : j === 'ALTA' ? 'amber' : 'slate'
                })
              ]
            })
      }),
      e.jsx('div', {
        className: 'mt-4 rounded-xl border border-slate-200 bg-white p-4 overflow-x-auto',
        children: e.jsx('div', {
          className: 'flex items-start min-w-[560px]',
          children: X.map((n, g) => {
            const N = a[n.key],
              W = d || !!N,
              z = !d && g === q,
              t = z ? '#f59e0b' : W ? '#22c55e' : '#cbd5e1',
              o = d || g < q;
            return e.jsxs(
              'div',
              {
                className: 'flex-1 flex flex-col items-center relative',
                children: [
                  g < X.length - 1 &&
                    e.jsx('span', {
                      className: 'absolute top-[7px] left-1/2 w-full h-0.5',
                      style: { background: o ? '#22c55e' : '#e2e8f0' }
                    }),
                  e.jsx('span', {
                    className: 'relative z-10 rounded-full',
                    style: {
                      width: 14,
                      height: 14,
                      background: t,
                      boxShadow: z ? '0 0 0 4px #f59e0b22' : 'none'
                    }
                  }),
                  e.jsx('span', {
                    className: `text-[10px] mt-1.5 font-medium ${W ? 'text-slate-700' : 'text-slate-300'}`,
                    children: n.label
                  }),
                  e.jsx('span', {
                    className: 'text-[9px] text-slate-400',
                    children: N ? ne(N) : ''
                  })
                ]
              },
              n.key
            );
          })
        })
      }),
      e.jsxs('div', {
        className: 'mt-3 rounded-xl border border-slate-200 bg-white p-4',
        children: [
          e.jsx('h3', {
            className: 'text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2',
            children: 'Actividad'
          }),
          P
            ? m.length === 0
              ? e.jsx('p', {
                  className: 'text-[12px] text-slate-400',
                  children: 'Sin actividad registrada para esta NV.'
                })
              : e.jsx('ul', {
                  className: 'space-y-2',
                  role: 'list',
                  'aria-label': 'Historial de actividad de la NV',
                  children: m.map((n) => {
                    const g =
                        n.accion === 'create'
                          ? 'creó la N.V.'
                          : n.accion === 'estado'
                            ? 'cambió estado'
                            : n.accion === 'update'
                              ? 'editó'
                              : n.accion === 'bulkUpdate'
                                ? 'actualizó'
                                : n.accion,
                      N = new Date(n.timestamp).toLocaleString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    return e.jsxs(
                      'li',
                      {
                        className: 'flex items-start gap-2.5 text-[12px]',
                        children: [
                          e.jsx('span', {
                            className:
                              'flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0 mt-0.5',
                            children: String(n.operador || '?')
                              .charAt(0)
                              .toUpperCase()
                          }),
                          e.jsxs('div', {
                            className: 'min-w-0',
                            children: [
                              e.jsxs('span', {
                                className: 'text-slate-700',
                                children: [
                                  e.jsx('b', { children: n.operador }),
                                  ' ',
                                  g,
                                  n.campos
                                    ? e.jsxs('span', {
                                        className: 'text-slate-400',
                                        children: [' · ', n.campos]
                                      })
                                    : ''
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'text-[10px] text-slate-400',
                                children: [N, n.exito === !1 ? ' · falló' : '']
                              })
                            ]
                          })
                        ]
                      },
                      n.id
                    );
                  })
                })
            : e.jsx('p', { className: 'text-[12px] text-slate-300', children: 'Cargando…' })
        ]
      }),
      $ &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsx('button', {
              onClick: () => B((n) => !n),
              className: 'mt-3 text-[12px] text-blue-600 hover:text-blue-800 font-medium',
              children: S ? '▲ Ocultar todos los campos' : '▼ Ver todos los campos'
            }),
            S && e.jsx('div', { className: 'mt-3 anim-fade-up', children: $ })
          ]
        })
    ]
  });
}
function Z({ icon: a, label: s, value: i }) {
  return e.jsxs('div', {
    className: 'flex items-center gap-2 min-w-0',
    children: [
      e.jsx('span', { className: 'text-base shrink-0', children: a }),
      e.jsxs('div', {
        className: 'min-w-0',
        children: [
          e.jsx('div', {
            className: 'text-[10px] text-slate-400 uppercase tracking-wide',
            children: s
          }),
          e.jsx('div', {
            className: 'text-[13px] font-medium text-slate-700 truncate',
            children: String(i)
          })
        ]
      })
    ]
  });
}
const ue = 'tms_operaciones_vigentes',
  L = 50,
  me = [
    'id',
    'nv_ptm',
    'nv_orange',
    'nv_farmapack',
    'varios',
    'factura',
    'guia',
    'numero_envio',
    'cliente',
    'vendedor',
    'division',
    'centro_costo',
    'transportista',
    'tipo_despacho',
    'estado',
    'fecha_aprobacion',
    'fecha_aprobacion_real',
    'fecha_compromiso',
    'fecha_facturacion',
    'fecha_despacho',
    'fecha_registro_nv',
    'fecha_en_proceso',
    'fecha_shipping',
    'fecha_en_ruta',
    'fecha_entregado',
    'fecha_estado',
    'valor_factura',
    'bultos',
    'incidencia',
    'estado_incidencia',
    'observaciones_incidencia',
    'dias_incidencia',
    'urgente',
    'costo_flete',
    'valor_nv',
    'fillrate',
    'empresa_transporte'
  ];
function pe(a) {
  return a
    .replace(/[(),]/g, ' ')
    .replace(/[%_\\]/g, (s) => '\\' + s)
    .trim();
}
const fe = [
    { label: 'NV PTM', col: 'nv_ptm', numeric: !0 },
    { label: 'NV Orange', col: 'nv_orange' },
    { label: 'NV Farmapack', col: 'nv_farmapack' },
    { label: 'Factura', col: 'factura' },
    { label: 'Guía', col: 'guia' },
    { label: 'Varios', col: 'varios' },
    { label: 'N° Envío', col: 'numero_envio' }
  ],
  ee = 'ptm_info_historial',
  re = 6;
function he() {
  try {
    const a = localStorage.getItem(ee);
    if (!a) return [];
    const s = JSON.parse(a);
    return Array.isArray(s) ? s.filter((i) => typeof i == 'string').slice(0, re) : [];
  } catch {
    return [];
  }
}
const h = (a) => Q(a, '—'),
  Y = (a) => {
    if (a == null || a === '') return '—';
    const s = Number(a);
    return isNaN(s)
      ? String(a)
      : s.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  };
function be(a) {
  return a.nv_ptm
    ? 'PTM'
    : a.nv_orange
      ? 'Orange'
      : a.nv_farmapack
        ? 'Farmapack'
        : a.varios
          ? 'Varios'
          : '—';
}
function ge(a) {
  return String(a.nv_ptm || a.nv_orange || a.nv_farmapack || a.varios || '—');
}
function Ee() {
  const [a, s] = r.useState(''),
    [i, v] = r.useState(''),
    [x, $] = r.useState(''),
    [m, E] = r.useState([]),
    [S, B] = r.useState(!1),
    [P, T] = r.useState(!1),
    [y, p] = r.useState(''),
    [H, d] = r.useState(null),
    [j, k] = r.useState([]),
    [O, w] = r.useState(L),
    [I, U] = r.useState(!1),
    F = !1;
  r.useEffect(() => {
    k(he());
  }, []);
  const R = r.useCallback((t) => {
      const o = t.trim();
      o.length < 2 ||
        k((_) => {
          const c = [o, ..._.filter((f) => f.toLowerCase() !== o.toLowerCase())].slice(0, re);
          try {
            localStorage.setItem(ee, JSON.stringify(c));
          } catch {}
          return c;
        });
    }, []),
    b = r.useCallback(() => {
      k([]);
      try {
        localStorage.removeItem(ee);
      } catch {}
    }, []),
    u = r.useCallback(
      async (t = L) => {
        const o = a.trim();
        if (!o && !i && !x) {
          p('Ingresa un término de búsqueda o un rango de fechas.');
          return;
        }
        if (!te) {
          p('Supabase no configurado.');
          return;
        }
        (t > L ? U(!0) : (B(!0), d(null)), p(''), T(!0), w(t));
        try {
          let c = te.from(ue).select(me.join(','));
          if (
            (i && (c = c.gte('fecha_registro_nv', i + 'T00:00:00')),
            x && (c = c.lte('fecha_registro_nv', x + 'T23:59:59')),
            o)
          ) {
            const M = pe(o),
              G = /^\d+$/.test(o),
              K = [];
            for (const J of fe)
              J.numeric ? G && K.push(`${J.col}.eq.${o}`) : M && K.push(`${J.col}.ilike.%${M}%`);
            K.length > 0 && (c = c.or(K.join(',')));
          }
          c = c.order('fecha_registro_nv', { ascending: !1 }).limit(t);
          const { data: f, error: A } = await c;
          A
            ? (p('Error en la búsqueda: ' + A.message), E([]))
            : (E(f || []), o && ((f == null ? void 0 : f.length) ?? 0) > 0 && R(o));
        } catch (c) {
          (p('Error: ' + (c instanceof Error ? c.message : 'desconocido')), E([]));
        } finally {
          (B(!1), U(!1));
        }
      },
      [a, i, x, R]
    );
  r.useEffect(() => {
    if (a.trim().length < 2 && !i && !x) return;
    const o = setTimeout(() => {
      u(L);
    }, 300);
    return () => clearTimeout(o);
  }, [a, i, x, u]);
  const q = r.useCallback(() => {
      u(O + L);
    }, [u, O]),
    n = m.length >= O,
    g = r.useCallback(
      (t) => {
        t.key === 'Enter' && u(L);
      },
      [u]
    ),
    N = r.useCallback((t) => {
      s(t);
    }, []),
    W = r.useCallback(
      (t) => {
        (s(t), t.trim() === '' && !i && !x && (E([]), T(!1), p(''), d(null)));
      },
      [i, x]
    ),
    z = r.useMemo(() => {
      const t = {};
      return (
        m.forEach((o) => {
          const _ = ae(o.estado) || 'Sin estado';
          t[_] = (t[_] || 0) + 1;
        }),
        t
      );
    }, [m]);
  return e.jsxs('div', {
    className: 'min-h-screen bg-gradient-to-br from-slate-50 to-blue-50',
    children: [
      e.jsx('header', {
        className: 'bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30',
        children: e.jsxs('div', {
          className: 'max-w-7xl mx-auto px-4 py-3 flex items-center justify-between',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsx('div', {
                  className:
                    'w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm',
                  children: 'PTM'
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('h1', {
                      className: 'text-lg font-bold text-slate-800',
                      children: 'Info NV'
                    }),
                    e.jsx('p', {
                      className: 'text-xs text-slate-500',
                      children: 'Buscador universal de notas de venta'
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                F,
                e.jsx('span', { className: 'text-xs text-slate-400 font-mono', children: 'v1.1' })
              ]
            })
          ]
        })
      }),
      e.jsxs('main', {
        className: 'max-w-7xl mx-auto px-4 py-6',
        children: [
          e.jsxs('div', {
            className: 'bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6',
            children: [
              e.jsxs('div', {
                className: 'flex flex-col md:flex-row gap-3',
                children: [
                  e.jsxs('div', {
                    className: 'flex-1 relative',
                    children: [
                      e.jsx('svg', {
                        className:
                          'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400',
                        fill: 'none',
                        viewBox: '0 0 24 24',
                        stroke: 'currentColor',
                        children: e.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          strokeWidth: 2,
                          d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                        })
                      }),
                      e.jsx('input', {
                        type: 'text',
                        value: a,
                        onChange: (t) => W(t.target.value),
                        onKeyDown: g,
                        placeholder:
                          'Buscar por NV PTM, Orange, Farmapack, Factura, Guía, Varios, N° Envío...',
                        className:
                          'w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm outline-none transition'
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center gap-1.5',
                        children: [
                          e.jsx('label', {
                            className: 'text-xs text-slate-500 whitespace-nowrap',
                            children: 'Desde'
                          }),
                          e.jsx('input', {
                            type: 'date',
                            'aria-label': 'Fecha desde (registro de NV)',
                            value: i,
                            onChange: (t) => v(t.target.value),
                            className:
                              'px-2 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center gap-1.5',
                        children: [
                          e.jsx('label', {
                            className: 'text-xs text-slate-500 whitespace-nowrap',
                            children: 'Hasta'
                          }),
                          e.jsx('input', {
                            type: 'date',
                            'aria-label': 'Fecha hasta (registro de NV)',
                            value: x,
                            onChange: (t) => $(t.target.value),
                            className:
                              'px-2 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsx('div', {
                    className: 'flex gap-2',
                    children: e.jsxs('button', {
                      onClick: () => u(L),
                      disabled: S,
                      className:
                        'px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition flex items-center gap-2',
                      children: [
                        S
                          ? e.jsxs('svg', {
                              className: 'w-4 h-4 animate-spin',
                              viewBox: '0 0 24 24',
                              fill: 'none',
                              children: [
                                e.jsx('circle', {
                                  cx: '12',
                                  cy: '12',
                                  r: '10',
                                  stroke: 'currentColor',
                                  strokeWidth: '4',
                                  className: 'opacity-25'
                                }),
                                e.jsx('path', {
                                  d: 'M4 12a8 8 0 018-8',
                                  stroke: 'currentColor',
                                  strokeWidth: '4',
                                  strokeLinecap: 'round',
                                  className: 'opacity-75'
                                })
                              ]
                            })
                          : e.jsx('svg', {
                              className: 'w-4 h-4',
                              fill: 'none',
                              viewBox: '0 0 24 24',
                              stroke: 'currentColor',
                              children: e.jsx('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: 2,
                                d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                              })
                            }),
                        'Buscar'
                      ]
                    })
                  })
                ]
              }),
              e.jsx('p', {
                className: 'mt-2 text-xs text-slate-400',
                children:
                  'Busca por: NV PTM, NV Orange, NV Farmapack, Factura, Guía, Varios o N° de Envío. La búsqueda es instantánea mientras escribes.'
              }),
              j.length > 0 &&
                e.jsxs('div', {
                  className: 'mt-3 flex items-center gap-2 flex-wrap',
                  children: [
                    e.jsxs('span', {
                      className:
                        'text-xs font-medium text-slate-400 inline-flex items-center gap-1',
                      children: [
                        e.jsx('svg', {
                          className: 'w-3.5 h-3.5',
                          fill: 'none',
                          viewBox: '0 0 24 24',
                          stroke: 'currentColor',
                          children: e.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                          })
                        }),
                        'Recientes:'
                      ]
                    }),
                    j.map((t) =>
                      e.jsx(
                        'button',
                        {
                          onClick: () => N(t),
                          className:
                            'px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 text-xs font-medium transition border border-slate-200',
                          children: t
                        },
                        t
                      )
                    ),
                    e.jsx('button', {
                      onClick: b,
                      className: 'text-xs text-slate-400 hover:text-red-500 transition ml-1',
                      title: 'Borrar historial',
                      children: 'Limpiar'
                    })
                  ]
                })
            ]
          }),
          y &&
            e.jsx('div', {
              className: 'mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm',
              children: y
            }),
          m.length > 0 &&
            e.jsxs('div', {
              className: 'mb-4 flex flex-wrap items-center gap-2',
              children: [
                e.jsxs('span', {
                  className: 'text-sm font-medium text-slate-600',
                  children: [m.length, ' resultado', m.length !== 1 ? 's' : '']
                }),
                e.jsx('span', { className: 'text-slate-300', children: '|' }),
                Object.entries(z).map(([t, o]) =>
                  e.jsxs(
                    'span',
                    {
                      className:
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white',
                      style: { backgroundColor: se[t] || '#6b7280' },
                      children: [t, ' (', o, ')']
                    },
                    t
                  )
                )
              ]
            }),
          P &&
            !S &&
            m.length === 0 &&
            !y &&
            e.jsxs('div', {
              className: 'text-center py-16',
              children: [
                e.jsx('svg', {
                  className: 'mx-auto w-16 h-16 text-slate-300 mb-4',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  stroke: 'currentColor',
                  children: e.jsx('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 1.5,
                    d: 'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  })
                }),
                e.jsx('p', {
                  className: 'text-slate-500 text-sm',
                  children: 'No se encontraron resultados'
                }),
                e.jsx('p', {
                  className: 'text-slate-400 text-xs mt-1',
                  children: 'Intenta con otro término o ajusta las fechas'
                })
              ]
            }),
          !P &&
            !S &&
            e.jsxs('div', {
              className: 'text-center py-20',
              children: [
                e.jsx('svg', {
                  className: 'mx-auto w-20 h-20 text-blue-200 mb-4',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  stroke: 'currentColor',
                  children: e.jsx('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 1.5,
                    d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  })
                }),
                e.jsx('p', {
                  className: 'text-slate-500',
                  children: 'Ingresa un término para buscar información de notas de venta'
                }),
                e.jsx('p', {
                  className: 'text-slate-400 text-xs mt-1',
                  children: 'Puedes buscar por cualquier número de NV, factura, guía o N° de envío'
                })
              ]
            }),
          m.length > 0 &&
            e.jsxs('div', {
              className: 'space-y-3',
              children: [
                m.map((t) => {
                  const o = ae(t.estado) || 'Sin estado',
                    _ = be(t),
                    c = ge(t),
                    f = H === t.id,
                    A = se[o] || '#6b7280',
                    M = t.urgente === !0 || String(t.urgente) === 'true';
                  return e.jsxs(
                    'div',
                    {
                      className: `bg-white rounded-xl border shadow-sm overflow-hidden transition hover:shadow-md ${M ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`,
                      style: { borderLeft: `4px solid ${A}` },
                      children: [
                        e.jsxs('button', {
                          onClick: () => d(f ? null : t.id),
                          'aria-expanded': f,
                          'aria-label': `NV ${c} — ${o}. ${f ? 'Contraer' : 'Expandir'} detalle`,
                          className:
                            'w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer',
                          children: [
                            e.jsx('span', {
                              className:
                                'shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white',
                              style: { backgroundColor: A },
                              children: o
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2 min-w-0 shrink-0',
                              children: [
                                e.jsx('span', {
                                  className: 'text-xs font-medium text-slate-400',
                                  children: _
                                }),
                                e.jsx('span', {
                                  className: 'font-bold text-slate-800 text-sm',
                                  children: c
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              className: 'hidden sm:flex flex-col min-w-0 flex-1',
                              children: [
                                e.jsx('span', {
                                  className: 'text-sm text-slate-700 font-medium truncate',
                                  children: t.cliente || '—'
                                }),
                                e.jsx('span', {
                                  className: 'text-xs text-slate-400 truncate',
                                  children:
                                    [t.vendedor, t.transportista]
                                      .filter((G) => G && G !== '—')
                                      .join(' · ') || ' '
                                })
                              ]
                            }),
                            e.jsx('span', {
                              className: 'text-xs text-slate-400 whitespace-nowrap',
                              children: h(t.fecha_registro_nv)
                            }),
                            M &&
                              e.jsx('span', {
                                className:
                                  'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded animate-pulse',
                                children: '🚨 URGENTE'
                              }),
                            e.jsx('svg', {
                              className: `w-5 h-5 text-slate-400 transition-transform shrink-0 ${f ? 'rotate-180' : ''}`,
                              fill: 'none',
                              viewBox: '0 0 24 24',
                              stroke: 'currentColor',
                              children: e.jsx('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: 2,
                                d: 'M19 9l-7 7-7-7'
                              })
                            })
                          ]
                        }),
                        f &&
                          e.jsx(xe, {
                            r: t,
                            est: o,
                            color: A,
                            nv: c,
                            canal: _,
                            children: e.jsxs('div', {
                              className:
                                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3',
                              children: [
                                e.jsxs(D, {
                                  titulo: 'Identificación',
                                  children: [
                                    e.jsx(l, { label: 'Canal', value: _ }),
                                    e.jsx(l, { label: 'NV PTM', value: t.nv_ptm }),
                                    e.jsx(l, { label: 'NV Orange', value: t.nv_orange }),
                                    e.jsx(l, { label: 'NV Farmapack', value: t.nv_farmapack }),
                                    e.jsx(l, { label: 'Varios', value: t.varios }),
                                    e.jsx(l, { label: 'Factura', value: t.factura }),
                                    e.jsx(l, { label: 'Guía', value: t.guia }),
                                    e.jsx(l, { label: 'N° Envío', value: t.numero_envio })
                                  ]
                                }),
                                e.jsxs(D, {
                                  titulo: 'Comercial',
                                  children: [
                                    e.jsx(l, { label: 'Cliente', value: t.cliente }),
                                    e.jsx(l, { label: 'Vendedor', value: t.vendedor }),
                                    e.jsx(l, { label: 'División', value: t.division }),
                                    e.jsx(l, { label: 'Centro Costo', value: t.centro_costo }),
                                    e.jsx(l, { label: 'Tipo Despacho', value: t.tipo_despacho }),
                                    e.jsx(l, { label: 'Transportista', value: t.transportista }),
                                    e.jsx(l, {
                                      label: 'Emp. Transporte',
                                      value: t.empresa_transporte
                                    })
                                  ]
                                }),
                                e.jsxs(D, {
                                  titulo: 'Valores',
                                  children: [
                                    e.jsx(l, { label: 'Valor Factura', value: Y(t.valor_factura) }),
                                    e.jsx(l, { label: 'Valor NV', value: Y(t.valor_nv) }),
                                    e.jsx(l, { label: 'Costo Flete', value: Y(t.costo_flete) }),
                                    e.jsx(l, { label: 'Bultos', value: t.bultos }),
                                    e.jsx(l, { label: 'Fill Rate', value: t.fillrate })
                                  ]
                                }),
                                e.jsxs(D, {
                                  titulo: 'Estado',
                                  children: [
                                    e.jsx(l, {
                                      label: 'Estado',
                                      value: o,
                                      highlight: !0,
                                      color: A
                                    }),
                                    e.jsx(l, {
                                      label: 'Urgente',
                                      value:
                                        t.urgente === !0 || String(t.urgente) === 'true'
                                          ? 'Sí'
                                          : 'No'
                                    }),
                                    e.jsx(l, { label: 'Incidencia', value: t.incidencia }),
                                    e.jsx(l, {
                                      label: 'Estado Incidencia',
                                      value: t.estado_incidencia
                                    }),
                                    e.jsx(l, {
                                      label: 'Obs. Incidencia',
                                      value: t.observaciones_incidencia
                                    }),
                                    e.jsx(l, { label: 'Días Incidencia', value: t.dias_incidencia })
                                  ]
                                }),
                                e.jsxs(D, {
                                  titulo: 'Fechas Clave',
                                  children: [
                                    e.jsx(l, {
                                      label: 'Registro NV',
                                      value: h(t.fecha_registro_nv)
                                    }),
                                    e.jsx(l, {
                                      label: 'Fecha de Creación de N.V',
                                      value: h(t.fecha_aprobacion)
                                    }),
                                    e.jsx(l, {
                                      label: 'Aprob. Real',
                                      value: h(t.fecha_aprobacion_real)
                                    }),
                                    e.jsx(l, { label: 'Compromiso', value: h(t.fecha_compromiso) }),
                                    e.jsx(l, {
                                      label: 'Facturación',
                                      value: h(t.fecha_facturacion)
                                    })
                                  ]
                                }),
                                e.jsxs(D, {
                                  titulo: 'Fechas Logística',
                                  children: [
                                    e.jsx(l, { label: 'En Proceso', value: h(t.fecha_en_proceso) }),
                                    e.jsx(l, { label: 'Shipping', value: h(t.fecha_shipping) }),
                                    e.jsx(l, { label: 'Despacho', value: h(t.fecha_despacho) }),
                                    e.jsx(l, { label: 'En Ruta', value: h(t.fecha_en_ruta) }),
                                    e.jsx(l, { label: 'Entregado', value: h(t.fecha_entregado) }),
                                    e.jsx(l, {
                                      label: 'Últ. cambio estado',
                                      value: h(t.fecha_estado)
                                    })
                                  ]
                                })
                              ]
                            })
                          })
                      ]
                    },
                    t.id
                  );
                }),
                n &&
                  e.jsx('div', {
                    className: 'text-center pt-2',
                    children: e.jsx('button', {
                      onClick: q,
                      disabled: I,
                      className:
                        'px-4 py-2 text-[13px] rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50',
                      children: I ? 'Cargando…' : `Cargar más (${m.length})`
                    })
                  })
              ]
            })
        ]
      })
    ]
  });
}
function D({ titulo: a, children: s }) {
  return e.jsxs('div', {
    children: [
      e.jsx('h3', {
        className:
          'text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1',
        children: a
      }),
      e.jsx('div', { className: 'space-y-1', children: s })
    ]
  });
}
function l({ label: a, value: s, highlight: i, color: v }) {
  const x = s == null || s === '' ? '—' : String(s);
  return x === '—'
    ? null
    : e.jsxs('div', {
        className: 'flex items-baseline gap-2 text-sm',
        children: [
          e.jsx('span', { className: 'text-slate-400 text-xs w-28 shrink-0', children: a }),
          i
            ? e.jsx('span', {
                className: 'font-semibold px-1.5 py-0.5 rounded text-white text-xs',
                style: { backgroundColor: v },
                children: x
              })
            : e.jsx('span', { className: 'text-slate-700 font-medium', children: x })
        ]
      });
}
export { Ee as default };
