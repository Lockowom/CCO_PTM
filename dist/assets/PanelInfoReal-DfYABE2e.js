import { j as e } from './query-vendor-BNjBrM5A.js';
import { r, i as ie } from './react-vendor-6aw4XXjH.js';
import { s as se } from './index-C8hdJ7IR.js';
import { s as J, c as ce, f as de, n as ae, E as le } from './dashData-BHPpsSJy.js';
import { e as ne } from './formulaEngine-CFaRJv6o.js';
import { ad as xe, a7 as ue } from './ui-vendor-naG2PYVT.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
const Y = [
  { key: 'fecha_aprobacion', label: 'N.V Creada en Sistema' },
  { key: 'fecha_registro_nv', label: 'Registrada en Base de Datos' },
  { key: 'fecha_en_proceso', label: 'En Proceso' },
  { key: 'fecha_shipping', label: 'Shipping' },
  { key: 'fecha_en_ruta', label: 'En Ruta' },
  { key: 'fecha_entregado', label: 'Entregado' }
];
function re(t) {
  if (!t) return '—';
  const a = new Date(typeof t == 'string' && t.length === 10 ? t + 'T12:00:00' : t);
  return isNaN(a.getTime())
    ? String(t)
    : a.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }).replace('.', '');
}
function me(t) {
  if (t == null || t === '') return '—';
  const a = Number(t);
  return isNaN(a) ? String(t) : '$' + a.toLocaleString('es-CL');
}
function fe(t) {
  const a = String(t).toUpperCase();
  return ['CRITICA', 'FAIL', 'TRUE', 'RIESGO', 'RISK', 'VENCIDA'].includes(a)
    ? { bg: '#fef2f2', fg: '#b91c1c', dot: '#ef4444' }
    : ['ALTA', 'PEND', 'MEDIA'].includes(a)
      ? { bg: '#fffbeb', fg: '#b45309', dot: '#f59e0b' }
      : ['OK', 'NORMAL', 'FALSE', 'FINALIZADA'].includes(a)
        ? { bg: '#f0fdf4', fg: '#15803d', dot: '#22c55e' }
        : { bg: '#eff6ff', fg: '#1d4ed8', dot: '#3b82f6' };
}
function O({ texto: t, big: a }) {
  const c = fe(t);
  return e.jsxs('span', {
    className: `inline-flex items-center gap-1.5 rounded-full font-bold ${a ? 'px-3 py-1 text-[13px]' : 'px-2 py-0.5 text-[11px]'}`,
    style: { background: c.bg, color: c.fg },
    children: [
      e.jsx('span', {
        className: 'rounded-full',
        style: { background: c.dot, width: a ? 8 : 6, height: a ? 8 : 6 }
      }),
      t
    ]
  });
}
function E({ valor: t, label: a, tono: c = 'slate' }) {
  const d = {
    slate: 'text-slate-800',
    red: 'text-red-600',
    amber: 'text-amber-600',
    green: 'text-emerald-600'
  };
  return e.jsxs('div', {
    className: 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center',
    children: [
      e.jsx('div', { className: `text-xl font-bold tabular-nums ${d[c]}`, children: t }),
      e.jsx('div', {
        className: 'text-[10px] uppercase tracking-wide text-slate-400 mt-0.5',
        children: a
      })
    ]
  });
}
function pe({ r: t, est: a, color: c, nv: d, canal: p, certificados: i, children: w }) {
  const [m, I] = r.useState([]),
    [L, B] = r.useState(!1),
    [H, T] = r.useState(!1),
    k = r.useMemo(() => {
      const n = J(t.fecha_compromiso) || ce(J(t.fecha_aprobacion), J(t.fecha_aprobacion_real));
      return {
        ...t,
        fecha_compromiso: n || null,
        fecha_entrega: t.fecha_entregado,
        fecha_creacion: t.fecha_registro_nv
      };
    }, [t]),
    h = (n) => ne(n, k).value,
    z = String(a).toLowerCase(),
    u = z.includes('recibido') || z.includes('entregad'),
    N = h('PRIORIDAD_OPERACIONAL(fecha_compromiso, estado)'),
    C = h('DATEDIFF(fecha_aprobacion, fecha_entrega)'),
    M = t.urgente === !0 || String(t.urgente) === 'true',
    S = u ? null : h('HOURS_DIFF(NOW(), fecha_compromiso)'),
    A = u ? null : h('DATEDIFF(NOW(), fecha_compromiso)'),
    U = !u && h('RIESGO_OTIF(fecha_compromiso, estado)') === !0,
    D = !u && typeof S == 'number' && S < 0,
    $ = t.fecha_entregado || t.fecha_en_ruta || t.fecha_despacho || null,
    j =
      u && $ && k.fecha_compromiso
        ? ne('DATEDIFF(fecha_compromiso, entrega)', { ...k, entrega: $ }).value
        : null,
    f = j == null ? null : j <= 0;
  r.useEffect(() => {
    let n = !0;
    return (
      T(!1),
      de(d, p)
        .then((v) => {
          n && I(v);
        })
        .catch(() => {
          n && I([]);
        })
        .finally(() => {
          n && T(!0);
        }),
      () => {
        n = !1;
      }
    );
  }, [d, p]);
  const q = Y.reduce((n, v, _) => (t[v.key] ? _ : n), -1);
  return e.jsxs('div', {
    className:
      'anim-fade-up px-4 py-4 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100',
    children: [
      e.jsxs('div', {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
        style: { background: `linear-gradient(135deg, ${c}0d 0%, #ffffff 60%)` },
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
                        children: p
                      }),
                      e.jsxs('h2', {
                        className: 'text-lg font-bold text-slate-900',
                        children: ['NV ', d]
                      })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'text-sm text-slate-600 mt-0.5 truncate',
                    children: t.cliente || '—'
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'flex items-center gap-2 flex-wrap justify-end',
                children: [
                  e.jsx('span', {
                    className:
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold text-white',
                    style: { background: c },
                    children: a
                  }),
                  !u &&
                    N &&
                    N !== 'FINALIZADA' &&
                    N !== 'NORMAL' &&
                    e.jsx(O, { texto: N, big: !0 }),
                  !u && D && e.jsx(O, { texto: 'VENCIDA', big: !0 }),
                  !u && U && !D && e.jsx(O, { texto: 'RIESGO OTIF', big: !0 }),
                  u && f === !0 && e.jsx(O, { texto: 'A TIEMPO', big: !0 }),
                  u && f === !1 && e.jsx(O, { texto: `TARDE +${j}d`, big: !0 }),
                  M && e.jsx(O, { texto: '🚨 URGENTE', big: !0 })
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-4 text-[13px]',
            children: [
              e.jsx(Q, { icon: '🚚', label: 'Transportista', value: t.transportista || '—' }),
              e.jsx(Q, { icon: '📦', label: 'Bultos', value: t.bultos ?? '—' }),
              e.jsx(Q, { icon: '💰', label: 'Valor factura', value: me(t.valor_factura) }),
              e.jsx(Q, { icon: '📅', label: 'Compromiso', value: re(k.fecha_compromiso) })
            ]
          })
        ]
      }),
      e.jsx('div', {
        className: 'grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3',
        children: u
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsx(E, {
                  valor: f == null ? '—' : f ? 'A tiempo' : 'Tarde',
                  label: 'OTIF (puntualidad)',
                  tono: f == null ? 'slate' : f ? 'green' : 'red'
                }),
                e.jsx(E, {
                  valor: j == null ? '—' : j <= 0 ? `${j}d` : `+${j}d`,
                  label: 'Desfase vs compromiso',
                  tono: j != null && j > 0 ? 'red' : 'green'
                }),
                e.jsx(E, { valor: C == null ? '—' : `${C}d`, label: 'Lead time' }),
                e.jsx(E, { valor: 'FINALIZADA', label: 'Estado', tono: 'green' })
              ]
            })
          : e.jsxs(e.Fragment, {
              children: [
                e.jsx(E, {
                  valor: S == null ? '—' : `${Math.round(Math.abs(S))}h`,
                  label: D ? 'Vencida hace' : 'Restantes',
                  tono: D ? 'red' : typeof S == 'number' && S < 24 ? 'amber' : 'green'
                }),
                e.jsx(E, {
                  valor: A == null ? '—' : `${A}d`,
                  label: 'Días compromiso',
                  tono: typeof A == 'number' && A < 0 ? 'red' : 'slate'
                }),
                e.jsx(E, { valor: C == null ? '—' : `${C}d`, label: 'Lead time' }),
                e.jsx(E, {
                  valor: N || '—',
                  label: 'Prioridad',
                  tono: N === 'CRITICA' ? 'red' : N === 'ALTA' ? 'amber' : 'slate'
                })
              ]
            })
      }),
      i,
      e.jsx('div', {
        className: 'mt-4 rounded-xl border border-slate-200 bg-white p-4 overflow-x-auto',
        children: e.jsx('div', {
          className: 'flex items-start min-w-[560px]',
          children: Y.map((n, v) => {
            const _ = t[n.key],
              W = u || !!_,
              G = !u && v === q,
              s = G ? '#f59e0b' : W ? '#22c55e' : '#cbd5e1',
              o = u || v < q;
            return e.jsxs(
              'div',
              {
                className: 'flex-1 flex flex-col items-center relative',
                children: [
                  v < Y.length - 1 &&
                    e.jsx('span', {
                      className: 'absolute top-[7px] left-1/2 w-full h-0.5',
                      style: { background: o ? '#22c55e' : '#e2e8f0' }
                    }),
                  e.jsx('span', {
                    className: 'relative z-10 rounded-full',
                    style: {
                      width: 14,
                      height: 14,
                      background: s,
                      boxShadow: G ? '0 0 0 4px #f59e0b22' : 'none'
                    }
                  }),
                  e.jsx('span', {
                    className: `text-[10px] mt-1.5 font-medium ${W ? 'text-slate-700' : 'text-slate-300'}`,
                    children: n.label
                  }),
                  e.jsx('span', {
                    className: 'text-[9px] text-slate-400',
                    children: _ ? re(_) : ''
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
          H
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
                    const v =
                        n.accion === 'create'
                          ? 'creó la N.V.'
                          : n.accion === 'estado'
                            ? 'cambió estado'
                            : n.accion === 'update'
                              ? 'editó'
                              : n.accion === 'bulkUpdate'
                                ? 'actualizó'
                                : n.accion,
                      _ = new Date(n.timestamp).toLocaleString('es-CL', {
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
                                  v,
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
                                children: [_, n.exito === !1 ? ' · falló' : '']
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
      w &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsx('button', {
              onClick: () => B((n) => !n),
              className: 'mt-3 text-[12px] text-blue-600 hover:text-blue-800 font-medium',
              children: L ? '▲ Ocultar todos los campos' : '▼ Ver todos los campos'
            }),
            L && e.jsx('div', { className: 'mt-3 anim-fade-up', children: w })
          ]
        })
    ]
  });
}
function Q({ icon: t, label: a, value: c }) {
  return e.jsxs('div', {
    className: 'flex items-center gap-2 min-w-0',
    children: [
      e.jsx('span', { className: 'text-base shrink-0', children: t }),
      e.jsxs('div', {
        className: 'min-w-0',
        children: [
          e.jsx('div', {
            className: 'text-[10px] text-slate-400 uppercase tracking-wide',
            children: a
          }),
          e.jsx('div', {
            className: 'text-[13px] font-medium text-slate-700 truncate',
            children: String(c)
          })
        ]
      })
    ]
  });
}
const he = (t) =>
  t
    ? new Date(t).toLocaleString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';
function be({ operacionId: t }) {
  const [a, c] = r.useState([]),
    [d, p] = r.useState(!0);
  return (
    r.useEffect(() => {
      let i = !0;
      if (!t) {
        (c([]), p(!1));
        return;
      }
      return (
        p(!0),
        se
          .rpc('nv_certificados_salida', { p_operacion_id: t })
          .then(({ data: w, error: m }) => {
            i && c(m ? [] : w || []);
          })
          .finally(() => {
            i && p(!1);
          }),
        () => {
          i = !1;
        }
      );
    }, [t]),
    !d && a.length === 0
      ? null
      : e.jsxs('section', {
          className: 'mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4',
          children: [
            e.jsxs('h3', {
              className:
                'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-700',
              children: [e.jsx(xe, { size: 15 }), ' Informes de salida — Calidad (Hito 3)']
            }),
            d
              ? e.jsxs('div', {
                  className: 'mt-2 flex items-center gap-2 text-xs text-slate-400',
                  children: [
                    e.jsx(ue, { size: 14, className: 'animate-spin' }),
                    ' Cargando informes…'
                  ]
                })
              : e.jsx('div', {
                  className: 'mt-3 space-y-2',
                  children: a.map((i) => {
                    const w = i.resultado === 'NO_CONFORME';
                    return e.jsxs(
                      'article',
                      {
                        className: 'rounded-lg border border-white bg-white p-3 text-sm shadow-sm',
                        children: [
                          e.jsxs('div', {
                            className: 'flex flex-wrap items-center justify-between gap-2',
                            children: [
                              e.jsx('span', {
                                className: 'font-bold text-slate-800',
                                children: i.folio || 'Informe sin folio'
                              }),
                              e.jsx('span', {
                                className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${w ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`,
                                children: i.resultado
                              })
                            ]
                          }),
                          e.jsxs('p', {
                            className: 'mt-1 text-xs text-slate-500',
                            children: [
                              'Finalizado ',
                              he(i.completado_en),
                              ' por ',
                              i.realizado_nombre || '—',
                              '.'
                            ]
                          }),
                          i.disposicion &&
                            e.jsxs('p', {
                              className: 'mt-1 text-xs text-slate-600',
                              children: [
                                e.jsx('b', { children: 'Disposición:' }),
                                ' ',
                                i.disposicion
                              ]
                            }),
                          i.observaciones &&
                            e.jsxs('p', {
                              className: 'mt-1 text-xs text-slate-600',
                              children: [
                                e.jsx('b', { children: 'Observaciones:' }),
                                ' ',
                                i.observaciones
                              ]
                            })
                        ]
                      },
                      i.tarea_id
                    );
                  })
                })
          ]
        })
  );
}
const ge = 'tms_operaciones_vigentes',
  V = 50,
  je = [
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
function ve(t) {
  return t
    .replace(/[(),]/g, ' ')
    .replace(/[%_\\]/g, (a) => '\\' + a)
    .trim();
}
const Ne = [
    { label: 'NV PTM', col: 'nv_ptm', numeric: !0 },
    { label: 'NV Orange', col: 'nv_orange' },
    { label: 'NV Farmapack', col: 'nv_farmapack' },
    { label: 'Factura', col: 'factura' },
    { label: 'Guía', col: 'guia' },
    { label: 'Varios', col: 'varios' },
    { label: 'N° Envío', col: 'numero_envio' }
  ],
  te = 'ptm_info_historial',
  oe = 6;
function _e() {
  try {
    const t = localStorage.getItem(te);
    if (!t) return [];
    const a = JSON.parse(t);
    return Array.isArray(a) ? a.filter((c) => typeof c == 'string').slice(0, oe) : [];
  } catch {
    return [];
  }
}
const g = (t) => J(t, '—'),
  ee = (t) => {
    if (t == null || t === '') return '—';
    const a = Number(t);
    return isNaN(a)
      ? String(t)
      : a.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  };
function ye(t) {
  return t.nv_ptm
    ? 'PTM'
    : t.nv_orange
      ? 'Orange'
      : t.nv_farmapack
        ? 'Farmapack'
        : t.varios
          ? 'Varios'
          : '—';
}
function we(t) {
  return String(t.nv_ptm || t.nv_orange || t.nv_farmapack || t.varios || '—');
}
function Ve() {
  const [t] = ie(),
    [a, c] = r.useState(''),
    [d, p] = r.useState(''),
    [i, w] = r.useState(''),
    [m, I] = r.useState([]),
    [L, B] = r.useState(!1),
    [H, T] = r.useState(!1),
    [k, h] = r.useState(''),
    [z, u] = r.useState(null),
    [N, C] = r.useState([]),
    [M, S] = r.useState(V),
    [A, U] = r.useState(!1),
    D = !1;
  (r.useEffect(() => {
    C(_e());
  }, []),
    r.useEffect(() => {
      var o;
      const s = (o = t.get('nv')) == null ? void 0 : o.trim();
      s && s !== a && c(s);
    }, [a, t]));
  const $ = r.useCallback((s) => {
      const o = s.trim();
      o.length < 2 ||
        C((y) => {
          const x = [o, ...y.filter((b) => b.toLowerCase() !== o.toLowerCase())].slice(0, oe);
          try {
            localStorage.setItem(te, JSON.stringify(x));
          } catch {}
          return x;
        });
    }, []),
    j = r.useCallback(() => {
      C([]);
      try {
        localStorage.removeItem(te);
      } catch {}
    }, []),
    f = r.useCallback(
      async (s = V) => {
        const o = a.trim();
        if (!o && !d && !i) {
          h('Ingresa un término de búsqueda o un rango de fechas.');
          return;
        }
        if (!se) {
          h('Supabase no configurado.');
          return;
        }
        (s > V ? U(!0) : (B(!0), u(null)), h(''), T(!0), S(s));
        try {
          let x = se.from(ge).select(je.join(','));
          if (
            (d && (x = x.gte('fecha_registro_nv', d + 'T00:00:00')),
            i && (x = x.lte('fecha_registro_nv', i + 'T23:59:59')),
            o)
          ) {
            const P = ve(o),
              K = /^\d+$/.test(o),
              Z = [];
            for (const X of Ne)
              X.numeric ? K && Z.push(`${X.col}.eq.${o}`) : P && Z.push(`${X.col}.ilike.%${P}%`);
            Z.length > 0 && (x = x.or(Z.join(',')));
          }
          x = x.order('fecha_registro_nv', { ascending: !1 }).limit(s);
          const { data: b, error: F } = await x;
          F
            ? (h('Error en la búsqueda: ' + F.message), I([]))
            : (I(b || []), o && ((b == null ? void 0 : b.length) ?? 0) > 0 && $(o));
        } catch (x) {
          (h('Error: ' + (x instanceof Error ? x.message : 'desconocido')), I([]));
        } finally {
          (B(!1), U(!1));
        }
      },
      [a, d, i, $]
    );
  r.useEffect(() => {
    if (a.trim().length < 2 && !d && !i) return;
    const o = setTimeout(() => {
      f(V);
    }, 300);
    return () => clearTimeout(o);
  }, [a, d, i, f]);
  const q = r.useCallback(() => {
      f(M + V);
    }, [f, M]),
    n = m.length >= M,
    v = r.useCallback(
      (s) => {
        s.key === 'Enter' && f(V);
      },
      [f]
    ),
    _ = r.useCallback((s) => {
      c(s);
    }, []),
    W = r.useCallback(
      (s) => {
        (c(s), s.trim() === '' && !d && !i && (I([]), T(!1), h(''), u(null)));
      },
      [d, i]
    ),
    G = r.useMemo(() => {
      const s = {};
      return (
        m.forEach((o) => {
          const y = ae(o.estado) || 'Sin estado';
          s[y] = (s[y] || 0) + 1;
        }),
        s
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
                D,
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
                        onChange: (s) => W(s.target.value),
                        onKeyDown: v,
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
                            value: d,
                            onChange: (s) => p(s.target.value),
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
                            value: i,
                            onChange: (s) => w(s.target.value),
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
                      onClick: () => f(V),
                      disabled: L,
                      className:
                        'px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition flex items-center gap-2',
                      children: [
                        L
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
              N.length > 0 &&
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
                    N.map((s) =>
                      e.jsx(
                        'button',
                        {
                          onClick: () => _(s),
                          className:
                            'px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 text-xs font-medium transition border border-slate-200',
                          children: s
                        },
                        s
                      )
                    ),
                    e.jsx('button', {
                      onClick: j,
                      className: 'text-xs text-slate-400 hover:text-red-500 transition ml-1',
                      title: 'Borrar historial',
                      children: 'Limpiar'
                    })
                  ]
                })
            ]
          }),
          k &&
            e.jsx('div', {
              className: 'mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm',
              children: k
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
                Object.entries(G).map(([s, o]) =>
                  e.jsxs(
                    'span',
                    {
                      className:
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white',
                      style: { backgroundColor: le[s] || '#6b7280' },
                      children: [s, ' (', o, ')']
                    },
                    s
                  )
                )
              ]
            }),
          H &&
            !L &&
            m.length === 0 &&
            !k &&
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
          !H &&
            !L &&
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
                m.map((s) => {
                  const o = ae(s.estado) || 'Sin estado',
                    y = ye(s),
                    x = we(s),
                    b = z === s.id,
                    F = le[o] || '#6b7280',
                    P = s.urgente === !0 || String(s.urgente) === 'true';
                  return e.jsxs(
                    'div',
                    {
                      className: `bg-white rounded-xl border shadow-sm overflow-hidden transition hover:shadow-md ${P ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`,
                      style: { borderLeft: `4px solid ${F}` },
                      children: [
                        e.jsxs('button', {
                          onClick: () => u(b ? null : s.id),
                          'aria-expanded': b,
                          'aria-label': `NV ${x} — ${o}. ${b ? 'Contraer' : 'Expandir'} detalle`,
                          className:
                            'w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer',
                          children: [
                            e.jsx('span', {
                              className:
                                'shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white',
                              style: { backgroundColor: F },
                              children: o
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2 min-w-0 shrink-0',
                              children: [
                                e.jsx('span', {
                                  className: 'text-xs font-medium text-slate-400',
                                  children: y
                                }),
                                e.jsx('span', {
                                  className: 'font-bold text-slate-800 text-sm',
                                  children: x
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              className: 'hidden sm:flex flex-col min-w-0 flex-1',
                              children: [
                                e.jsx('span', {
                                  className: 'text-sm text-slate-700 font-medium truncate',
                                  children: s.cliente || '—'
                                }),
                                e.jsx('span', {
                                  className: 'text-xs text-slate-400 truncate',
                                  children:
                                    [s.vendedor, s.transportista]
                                      .filter((K) => K && K !== '—')
                                      .join(' · ') || ' '
                                })
                              ]
                            }),
                            e.jsx('span', {
                              className: 'text-xs text-slate-400 whitespace-nowrap',
                              children: g(s.fecha_registro_nv)
                            }),
                            P &&
                              e.jsx('span', {
                                className:
                                  'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded animate-pulse',
                                children: '🚨 URGENTE'
                              }),
                            e.jsx('svg', {
                              className: `w-5 h-5 text-slate-400 transition-transform shrink-0 ${b ? 'rotate-180' : ''}`,
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
                        b &&
                          e.jsx(pe, {
                            r: s,
                            est: o,
                            color: F,
                            nv: x,
                            canal: y,
                            certificados: e.jsx(be, { operacionId: s.id }),
                            children: e.jsxs('div', {
                              className:
                                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3',
                              children: [
                                e.jsxs(R, {
                                  titulo: 'Identificación',
                                  children: [
                                    e.jsx(l, { label: 'Canal', value: y }),
                                    e.jsx(l, { label: 'NV PTM', value: s.nv_ptm }),
                                    e.jsx(l, { label: 'NV Orange', value: s.nv_orange }),
                                    e.jsx(l, { label: 'NV Farmapack', value: s.nv_farmapack }),
                                    e.jsx(l, { label: 'Varios', value: s.varios }),
                                    e.jsx(l, { label: 'Factura', value: s.factura }),
                                    e.jsx(l, { label: 'Guía', value: s.guia }),
                                    e.jsx(l, { label: 'N° Envío', value: s.numero_envio })
                                  ]
                                }),
                                e.jsxs(R, {
                                  titulo: 'Comercial',
                                  children: [
                                    e.jsx(l, { label: 'Cliente', value: s.cliente }),
                                    e.jsx(l, { label: 'Vendedor', value: s.vendedor }),
                                    e.jsx(l, { label: 'División', value: s.division }),
                                    e.jsx(l, { label: 'Centro Costo', value: s.centro_costo }),
                                    e.jsx(l, { label: 'Tipo Despacho', value: s.tipo_despacho }),
                                    e.jsx(l, { label: 'Transportista', value: s.transportista }),
                                    e.jsx(l, {
                                      label: 'Emp. Transporte',
                                      value: s.empresa_transporte
                                    })
                                  ]
                                }),
                                e.jsxs(R, {
                                  titulo: 'Valores',
                                  children: [
                                    e.jsx(l, {
                                      label: 'Valor Factura',
                                      value: ee(s.valor_factura)
                                    }),
                                    e.jsx(l, { label: 'Valor NV', value: ee(s.valor_nv) }),
                                    e.jsx(l, { label: 'Costo Flete', value: ee(s.costo_flete) }),
                                    e.jsx(l, { label: 'Bultos', value: s.bultos }),
                                    e.jsx(l, { label: 'Fill Rate', value: s.fillrate })
                                  ]
                                }),
                                e.jsxs(R, {
                                  titulo: 'Estado',
                                  children: [
                                    e.jsx(l, {
                                      label: 'Estado',
                                      value: o,
                                      highlight: !0,
                                      color: F
                                    }),
                                    e.jsx(l, {
                                      label: 'Urgente',
                                      value:
                                        s.urgente === !0 || String(s.urgente) === 'true'
                                          ? 'Sí'
                                          : 'No'
                                    }),
                                    e.jsx(l, { label: 'Incidencia', value: s.incidencia }),
                                    e.jsx(l, {
                                      label: 'Estado Incidencia',
                                      value: s.estado_incidencia
                                    }),
                                    e.jsx(l, {
                                      label: 'Obs. Incidencia',
                                      value: s.observaciones_incidencia
                                    }),
                                    e.jsx(l, { label: 'Días Incidencia', value: s.dias_incidencia })
                                  ]
                                }),
                                e.jsxs(R, {
                                  titulo: 'Fechas Clave',
                                  children: [
                                    e.jsx(l, {
                                      label: 'Registro NV',
                                      value: g(s.fecha_registro_nv)
                                    }),
                                    e.jsx(l, {
                                      label: 'Fecha de Creación de N.V',
                                      value: g(s.fecha_aprobacion)
                                    }),
                                    e.jsx(l, {
                                      label: 'Aprob. Real',
                                      value: g(s.fecha_aprobacion_real)
                                    }),
                                    e.jsx(l, { label: 'Compromiso', value: g(s.fecha_compromiso) }),
                                    e.jsx(l, {
                                      label: 'Facturación',
                                      value: g(s.fecha_facturacion)
                                    })
                                  ]
                                }),
                                e.jsxs(R, {
                                  titulo: 'Fechas Logística',
                                  children: [
                                    e.jsx(l, { label: 'En Proceso', value: g(s.fecha_en_proceso) }),
                                    e.jsx(l, { label: 'Shipping', value: g(s.fecha_shipping) }),
                                    e.jsx(l, { label: 'Despacho', value: g(s.fecha_despacho) }),
                                    e.jsx(l, { label: 'En Ruta', value: g(s.fecha_en_ruta) }),
                                    e.jsx(l, { label: 'Entregado', value: g(s.fecha_entregado) }),
                                    e.jsx(l, {
                                      label: 'Últ. cambio estado',
                                      value: g(s.fecha_estado)
                                    })
                                  ]
                                })
                              ]
                            })
                          })
                      ]
                    },
                    s.id
                  );
                }),
                n &&
                  e.jsx('div', {
                    className: 'text-center pt-2',
                    children: e.jsx('button', {
                      onClick: q,
                      disabled: A,
                      className:
                        'px-4 py-2 text-[13px] rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50',
                      children: A ? 'Cargando…' : `Cargar más (${m.length})`
                    })
                  })
              ]
            })
        ]
      })
    ]
  });
}
function R({ titulo: t, children: a }) {
  return e.jsxs('div', {
    children: [
      e.jsx('h3', {
        className:
          'text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1',
        children: t
      }),
      e.jsx('div', { className: 'space-y-1', children: a })
    ]
  });
}
function l({ label: t, value: a, highlight: c, color: d }) {
  const p = a == null || a === '' ? '—' : String(a);
  return p === '—'
    ? null
    : e.jsxs('div', {
        className: 'flex items-baseline gap-2 text-sm',
        children: [
          e.jsx('span', { className: 'text-slate-400 text-xs w-28 shrink-0', children: t }),
          c
            ? e.jsx('span', {
                className: 'font-semibold px-1.5 py-0.5 rounded text-white text-xs',
                style: { backgroundColor: d },
                children: p
              })
            : e.jsx('span', { className: 'text-slate-700 font-medium', children: p })
        ]
      });
}
export { Ve as default };
