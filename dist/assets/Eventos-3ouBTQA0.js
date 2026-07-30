import { j as e } from './query-vendor-B1MP_4YJ.js';
import { r } from './react-vendor-C8fdn38R.js';
import {
  B as J,
  c7 as Y,
  bL as q,
  b as U,
  bg as W,
  Z as ee,
  R as se,
  C as ae,
  c as te,
  bY as le,
  P as ne,
  aQ as re,
  Q as oe,
  _ as ie,
  t as u,
  X as de
} from './ui-vendor-D-9zQVt7.js';
import {
  u as ce,
  F as xe,
  G as me,
  H as pe,
  I as he,
  J as ge,
  K as E,
  M as be,
  N as ue,
  O as je,
  P as ve
} from './index-Dil3U0Ub.js';
import './supabase-vendor-jY4wIOEF.js';
import './animation-vendor-BwUUObbT.js';
const Ne = ['OT', 'TICKET_PV', 'NV', 'CALIDAD', 'CONTEO'],
  j = (a) =>
    a == null
      ? '—'
      : a < 1
        ? `${Math.round(a * 60)} min`
        : a < 48
          ? `${Number(a).toFixed(1)} h`
          : `${(a / 24).toFixed(1)} d`,
  S = (a) => {
    if (!a) return '—';
    const i = new Date(a);
    return isNaN(i)
      ? '—'
      : i.toLocaleString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
  },
  fe = {
    OT: '#06b6d4',
    TICKET_PV: '#7c3aed',
    NV: '#f59e0b',
    CALIDAD: '#ef4444',
    CONTEO: '#10b981'
  },
  A = {
    'in-app': { l: 'In-app', c: '#2563eb' },
    push: { l: 'Push', c: '#7c3aed' },
    correo: { l: 'Correo', c: '#0891b2' }
  },
  g =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400',
  b = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';
function $e() {
  const { hasPermission: a, user: i } = ce(),
    m =
      a('manage_eventos') ||
      (i == null ? void 0 : i.rol) === 'ADMIN' ||
      (i == null ? void 0 : i.es_admin_delegado),
    [x, t] = r.useState('mis'),
    [c, n] = r.useState([]),
    [w, R] = r.useState([]),
    [v, O] = r.useState([]),
    [h, y] = r.useState([]),
    [$, N] = r.useState(null),
    [k, z] = r.useState('todos'),
    [M, T] = r.useState(!1),
    p = r.useCallback(async () => {
      const [s, l, o, Z] = await Promise.all([xe({ agregado: k }), me(), pe({}), he()]);
      (n(s), R(l), O(o), y(Z));
    }, [k]);
  r.useEffect(() => {
    p();
  }, [p]);
  const _ = async (s, l) => {
      const o = await s;
      return o != null && o.ok
        ? (u.success(l), !0)
        : (u.error((o == null ? void 0 : o.error) || 'Error'), !1);
    },
    I = async (s) => {
      (await _(E(s), 'Regla guardada')) && (N(null), p());
    },
    L = async (s) => {
      window.confirm('¿Eliminar la regla?') && (await _(be(s), 'Regla eliminada')) && p();
    },
    D = async (s) => {
      (await _(E({ ...s, activo: !s.activo }), 'Actualizada')) && p();
    },
    F = async (s) => {
      (await ue(s), y((l) => l.filter((o) => o.id !== s)));
    },
    B = async () => {
      (await je(), y([]), u.success('Marcadas como leídas'));
    },
    V = async () => {
      T(!0);
      const s = await ve();
      (T(!1),
        s.ok
          ? (u.success(`Push enviados: ${s.enviados}/${s.total || 0}`), p())
          : u.error('No se pudo despachar'));
    },
    C = r.useMemo(
      () => v.filter((s) => s.canal === 'push' && s.estado === 'pendiente').length,
      [v]
    ),
    G = [
      ['mis', `Mis notificaciones${h.length ? ` (${h.length})` : ''}`, J],
      ['stream', 'Stream de eventos', Y],
      ['metricas', 'Métricas / SLA', q],
      ['reglas', `Reglas (${w.length})`, U],
      ['bandeja', 'Bandeja de salida', W]
    ],
    [f, K] = r.useState('OT'),
    [d, H] = r.useState(null),
    [Q, P] = r.useState(!1);
  r.useEffect(() => {
    x === 'metricas' &&
      (P(!0),
      ge(f)
        .then((s) => {
          (H(s), P(!1));
        })
        .catch(() => P(!1)));
  }, [x, f]);
  const X = r.useMemo(
    () =>
      Math.max(
        1,
        ...((d == null ? void 0 : d.por_estado) || []).map((s) => Number(s.dwell_prom_horas) || 0)
      ),
    [d]
  );
  return e.jsxs('div', {
    className: 'anim-fade-up space-y-4 max-w-[1200px] mx-auto pb-16',
    children: [
      e.jsxs('div', {
        className: 'flex items-start justify-between gap-3 flex-wrap',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-3',
            children: [
              e.jsx('div', {
                className:
                  'w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center shadow-lg shadow-orange-500/20',
                children: e.jsx(ee, { size: 22 })
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('h1', {
                    className: 'text-xl font-black text-slate-800 leading-tight',
                    children: 'Eventos y Notificaciones'
                  }),
                  e.jsx('p', {
                    className: 'text-[13px] text-slate-500',
                    children:
                      'Motor de eventos del sistema · reglas · entrega in-app y push (Capgo/FCM)'
                  })
                ]
              })
            ]
          }),
          e.jsxs('button', {
            onClick: p,
            className:
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50',
            children: [e.jsx(se, { size: 15 }), ' Actualizar']
          })
        ]
      }),
      e.jsx('div', {
        className: 'flex gap-1 flex-wrap',
        children: G.map(([s, l, o]) =>
          e.jsxs(
            'button',
            {
              onClick: () => t(s),
              className: `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-colors ${x === s ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`,
              children: [e.jsx(o, { size: 14 }), ' ', l]
            },
            s
          )
        )
      }),
      x === 'mis' &&
        e.jsxs('div', {
          className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
          children: [
            e.jsxs('div', {
              className: 'px-4 py-2.5 border-b border-slate-100 flex items-center justify-between',
              children: [
                e.jsxs('span', {
                  className: 'text-[11px] font-black text-slate-400 uppercase',
                  children: ['Sin leer (', h.length, ')']
                }),
                h.length > 0 &&
                  e.jsxs('button', {
                    onClick: B,
                    className:
                      'text-[12px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1',
                    children: [e.jsx(ae, { size: 14 }), ' Marcar todas']
                  })
              ]
            }),
            h.length === 0
              ? e.jsx('div', {
                  className: 'py-14 text-center text-slate-400 text-sm',
                  children: 'No tienes notificaciones sin leer.'
                })
              : e.jsx('div', {
                  className: 'divide-y divide-slate-100',
                  children: h.map((s) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex items-start gap-3 px-4 py-3 hover:bg-slate-50',
                        children: [
                          e.jsx('span', {
                            className: 'w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0'
                          }),
                          e.jsxs('div', {
                            className: 'min-w-0 flex-1',
                            children: [
                              e.jsx('div', {
                                className: 'font-bold text-[13px] text-slate-800',
                                children: s.titulo
                              }),
                              e.jsx('div', {
                                className: 'text-[12px] text-slate-500',
                                children: s.mensaje
                              }),
                              e.jsx('div', {
                                className: 'text-[10px] text-slate-400 mt-0.5',
                                children: S(s.creado_en)
                              })
                            ]
                          }),
                          e.jsx('button', {
                            onClick: () => F(s.id),
                            title: 'Marcar leída',
                            className:
                              'w-8 h-8 rounded-lg hover:bg-white grid place-items-center text-slate-400 shrink-0',
                            children: e.jsx(te, { size: 16 })
                          })
                        ]
                      },
                      s.id
                    )
                  )
                })
          ]
        }),
      x === 'stream' &&
        e.jsxs('div', {
          className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
          children: [
            e.jsxs('div', {
              className: 'px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 flex-wrap',
              children: [
                e.jsx('span', {
                  className: 'text-[11px] font-black text-slate-400 uppercase mr-1',
                  children: 'Filtrar'
                }),
                ['todos', 'OT', 'TICKET_PV', 'NV', 'CALIDAD', 'CONTEO'].map((s) =>
                  e.jsx(
                    'button',
                    {
                      onClick: () => z(s),
                      className: `text-[11px] font-bold px-2 py-1 rounded-lg ${k === s ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-100'}`,
                      children: s
                    },
                    s
                  )
                )
              ]
            }),
            c.length === 0
              ? e.jsx('div', {
                  className: 'py-14 text-center text-slate-400 text-sm',
                  children:
                    'Aún no hay eventos. Se generan al operar los procesos (crear/mover órdenes, tickets, N.V., etc.).'
                })
              : e.jsx('div', {
                  className: 'divide-y divide-slate-100 max-h-[60vh] overflow-y-auto',
                  children: c.map((s) => {
                    var l;
                    return e.jsxs(
                      'div',
                      {
                        className: 'flex items-center gap-3 px-4 py-2.5 text-[12px]',
                        children: [
                          e.jsx('span', {
                            className:
                              'text-[10px] font-black text-white rounded px-1.5 py-0.5 shrink-0',
                            style: { background: fe[s.agregado] || '#64748b' },
                            children: s.agregado
                          }),
                          e.jsx('span', {
                            className: 'font-mono font-bold text-slate-700',
                            children: s.nombre
                          }),
                          e.jsx('span', {
                            className: 'text-slate-400 font-mono text-[11px]',
                            children: s.agregado_id
                          }),
                          ((l = s.payload) == null ? void 0 : l.hasta) &&
                            e.jsxs('span', {
                              className: 'text-slate-500',
                              children: [
                                s.payload.desde || '(inicio)',
                                ' → ',
                                e.jsx('b', { children: s.payload.hasta })
                              ]
                            }),
                          e.jsxs('span', {
                            className: 'ml-auto text-[10px] text-slate-400 shrink-0',
                            children: [s.actor || '—', ' · ', S(s.creado_en)]
                          })
                        ]
                      },
                      s.id
                    );
                  })
                })
          ]
        }),
      x === 'metricas' &&
        e.jsxs('div', {
          className: 'space-y-3',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-1.5 flex-wrap',
              children: [
                e.jsx('span', {
                  className: 'text-[11px] font-black text-slate-400 uppercase mr-1',
                  children: 'Proceso'
                }),
                Ne.map((s) =>
                  e.jsx(
                    'button',
                    {
                      onClick: () => K(s),
                      className: `text-[12px] font-bold px-2.5 py-1.5 rounded-lg ${f === s ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`,
                      children: s
                    },
                    s
                  )
                )
              ]
            }),
            Q
              ? e.jsx('div', {
                  className: 'py-12 text-center text-slate-400 text-sm',
                  children: 'Calculando…'
                })
              : !d || d.transiciones === 0
                ? e.jsxs('div', {
                    className:
                      'rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center',
                    children: [
                      e.jsxs('p', {
                        className: 'text-slate-500 text-sm font-semibold',
                        children: ['Aún no hay datos de ', f]
                      }),
                      e.jsx('p', {
                        className: 'text-slate-400 text-[12px] mt-0.5',
                        children:
                          'Las métricas se calculan del historial del motor; se llenan al operar el proceso.'
                      })
                    ]
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsx('div', {
                        className: 'grid grid-cols-2 sm:grid-cols-4 gap-2.5',
                        children: [
                          ['Entidades', d.entidades],
                          ['Transiciones', d.transiciones],
                          ['Lead prom.', j(d.lead_prom_horas)],
                          ['Lead mediana', j(d.lead_p50_horas)]
                        ].map(([s, l]) =>
                          e.jsxs(
                            'div',
                            {
                              className: 'rounded-2xl border border-slate-200 bg-white p-3',
                              children: [
                                e.jsx('div', {
                                  className: 'text-[10px] font-bold text-slate-400 uppercase',
                                  children: s
                                }),
                                e.jsx('div', {
                                  className: 'text-xl font-black text-slate-800 mt-0.5',
                                  children: l
                                })
                              ]
                            },
                            s
                          )
                        )
                      }),
                      e.jsxs('div', {
                        className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
                        children: [
                          e.jsxs('div', {
                            className:
                              'px-4 py-2.5 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase flex items-center gap-1.5',
                            children: [
                              e.jsx(le, { size: 12 }),
                              ' Permanencia por estado (cuellos de botella)'
                            ]
                          }),
                          (d.por_estado || []).length === 0
                            ? e.jsx('div', {
                                className: 'py-8 text-center text-slate-400 text-sm',
                                children: 'Sin transiciones completas todavía.'
                              })
                            : e.jsx('div', {
                                className: 'divide-y divide-slate-100',
                                children: d.por_estado.map((s, l) =>
                                  e.jsxs(
                                    'div',
                                    {
                                      className: 'px-4 py-2.5',
                                      children: [
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center justify-between text-[12px] mb-1',
                                          children: [
                                            e.jsxs('span', {
                                              className:
                                                'font-bold text-slate-700 inline-flex items-center gap-1.5',
                                              children: [
                                                l === 0 &&
                                                  e.jsx('span', {
                                                    className:
                                                      'text-[9px] font-black text-red-600 bg-red-50 rounded px-1.5 py-0.5',
                                                    children: 'TOPE'
                                                  }),
                                                s.estado
                                              ]
                                            }),
                                            e.jsxs('span', {
                                              className: 'text-slate-500',
                                              children: [
                                                'prom ',
                                                e.jsx('b', {
                                                  className: 'text-slate-800',
                                                  children: j(s.dwell_prom_horas)
                                                }),
                                                ' · med',
                                                ' ',
                                                j(s.dwell_p50_horas),
                                                ' · máx ',
                                                j(s.dwell_max_horas),
                                                ' ·',
                                                ' ',
                                                s.transiciones,
                                                '×'
                                              ]
                                            })
                                          ]
                                        }),
                                        e.jsx('div', {
                                          className:
                                            'h-2 rounded-full bg-slate-100 overflow-hidden',
                                          children: e.jsx('div', {
                                            className: 'h-full rounded-full',
                                            style: {
                                              width: `${Math.round(((Number(s.dwell_prom_horas) || 0) / X) * 100)}%`,
                                              background: l === 0 ? '#ef4444' : '#f97316'
                                            }
                                          })
                                        })
                                      ]
                                    },
                                    s.estado
                                  )
                                )
                              })
                        ]
                      })
                    ]
                  })
          ]
        }),
      x === 'reglas' &&
        e.jsxs('div', {
          className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
          children: [
            e.jsxs('div', {
              className: 'px-4 py-2.5 border-b border-slate-100 flex items-center justify-between',
              children: [
                e.jsx('span', {
                  className: 'text-[11px] font-black text-slate-400 uppercase',
                  children: 'Reglas de notificación'
                }),
                m &&
                  e.jsxs('button', {
                    onClick: () => N({}),
                    className:
                      'text-[12px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1',
                    children: [e.jsx(ne, { size: 14 }), ' Nueva regla']
                  })
              ]
            }),
            w.length === 0
              ? e.jsx('div', {
                  className: 'py-14 text-center text-slate-400 text-sm',
                  children: 'Sin reglas.'
                })
              : e.jsx('div', {
                  className: 'divide-y divide-slate-100',
                  children: w.map((s) => {
                    const l = A[s.canal] || { l: s.canal, c: '#64748b' };
                    return e.jsxs(
                      'div',
                      {
                        className: 'flex items-center gap-3 px-4 py-3',
                        children: [
                          e.jsx('button', {
                            onClick: () => m && D(s),
                            disabled: !m,
                            className: `w-9 h-5 rounded-full shrink-0 relative transition-colors ${s.activo ? 'bg-emerald-400' : 'bg-slate-200'}`,
                            children: e.jsx('span', {
                              className: `absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.activo ? 'left-4' : 'left-0.5'}`
                            })
                          }),
                          e.jsxs('div', {
                            className: 'min-w-0 flex-1',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2 flex-wrap',
                                children: [
                                  e.jsx('span', {
                                    className: 'font-bold text-[13px] text-slate-800',
                                    children: s.nombre
                                  }),
                                  e.jsx('span', {
                                    className:
                                      'text-[9px] font-black text-white rounded px-1.5 py-0.5',
                                    style: { background: l.c },
                                    children: l.l
                                  }),
                                  s.destinatario_rol &&
                                    e.jsxs('span', {
                                      className: 'text-[10px] font-mono text-slate-400',
                                      children: ['→ ', s.destinatario_rol]
                                    })
                                ]
                              }),
                              e.jsx('div', {
                                className: 'text-[11px] font-mono text-slate-400 truncate',
                                children: s.evento_patron
                              }),
                              e.jsxs('div', {
                                className: 'text-[11px] text-slate-500 truncate',
                                children: ['“', s.titulo_tpl, '” · ', s.mensaje_tpl]
                              })
                            ]
                          }),
                          m &&
                            e.jsxs('div', {
                              className: 'flex items-center gap-0.5 shrink-0',
                              children: [
                                e.jsx('button', {
                                  onClick: () => N(s),
                                  className:
                                    'w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-400',
                                  children: e.jsx(re, { size: 14 })
                                }),
                                e.jsx('button', {
                                  onClick: () => L(s.id),
                                  className:
                                    'w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400',
                                  children: e.jsx(oe, { size: 14 })
                                })
                              ]
                            })
                        ]
                      },
                      s.id
                    );
                  })
                }),
            e.jsxs('div', {
              className: 'px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400',
              children: [
                'Patrón = regex POSIX contra el nombre del evento (ej. ',
                e.jsx('code', { children: '^OT\\.registrar_pod$' }),
                '). Placeholders en plantillas: ',
                e.jsx('code', { children: '{agregado} {id} {desde} {hasta} {actor}' }),
                '.'
              ]
            })
          ]
        }),
      x === 'bandeja' &&
        e.jsxs('div', {
          className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
          children: [
            e.jsxs('div', {
              className:
                'px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap',
              children: [
                e.jsx('span', {
                  className: 'text-[11px] font-black text-slate-400 uppercase',
                  children: 'Notificaciones generadas'
                }),
                m &&
                  e.jsxs('button', {
                    onClick: V,
                    disabled: M || !C,
                    className:
                      'text-[12px] font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5',
                    children: [
                      e.jsx(ie, { size: 13 }),
                      ' ',
                      M ? 'Enviando…' : `Enviar push pendientes${C ? ` (${C})` : ''}`
                    ]
                  })
              ]
            }),
            v.length === 0
              ? e.jsx('div', {
                  className: 'py-14 text-center text-slate-400 text-sm',
                  children: 'Sin notificaciones generadas todavía.'
                })
              : e.jsx('div', {
                  className: 'divide-y divide-slate-100 max-h-[60vh] overflow-y-auto',
                  children: v.map((s) => {
                    const l = A[s.canal] || { l: s.canal, c: '#64748b' },
                      o =
                        s.estado === 'pendiente'
                          ? 'text-amber-600 bg-amber-50'
                          : s.estado === 'leido'
                            ? 'text-slate-500 bg-slate-100'
                            : s.estado === 'enviado'
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-red-600 bg-red-50';
                    return e.jsxs(
                      'div',
                      {
                        className: 'flex items-center gap-3 px-4 py-2.5 text-[12px]',
                        children: [
                          e.jsx('span', {
                            className:
                              'text-[9px] font-black text-white rounded px-1.5 py-0.5 shrink-0',
                            style: { background: l.c },
                            children: l.l
                          }),
                          e.jsxs('div', {
                            className: 'min-w-0 flex-1',
                            children: [
                              e.jsx('span', {
                                className: 'font-bold text-slate-700',
                                children: s.titulo
                              }),
                              ' ',
                              e.jsx('span', { className: 'text-slate-500', children: s.mensaje })
                            ]
                          }),
                          s.destinatario_rol &&
                            e.jsx('span', {
                              className: 'text-[10px] font-mono text-slate-400 shrink-0',
                              children: s.destinatario_rol
                            }),
                          e.jsx('span', {
                            className: `text-[9px] font-black rounded px-1.5 py-0.5 shrink-0 ${o}`,
                            children: s.estado
                          }),
                          e.jsx('span', {
                            className: 'text-[10px] text-slate-400 shrink-0 w-20 text-right',
                            children: S(s.creado_en)
                          })
                        ]
                      },
                      s.id
                    );
                  })
                })
          ]
        }),
      $ && e.jsx(we, { data: $, onClose: () => N(null), onSave: I })
    ]
  });
}
function we({ data: a, onClose: i, onSave: m }) {
  const x = !!a.id,
    [t, c] = r.useState({
      id: a.id || '',
      nombre: a.nombre || '',
      evento_patron: a.evento_patron || '',
      canal: a.canal || 'in-app',
      destinatario_rol: a.destinatario_rol || 'ADMIN',
      titulo_tpl: a.titulo_tpl || '{agregado} {id}',
      mensaje_tpl: a.mensaje_tpl || '{agregado} {id}: {desde} → {hasta}',
      activo: a.activo !== !1,
      orden: a.orden || 0
    });
  return e.jsxs('div', {
    className: 'fixed inset-0 z-[130] flex items-center justify-center p-4',
    onClick: i,
    children: [
      e.jsx('div', { className: 'absolute inset-0 bg-slate-900/40 backdrop-blur-sm' }),
      e.jsxs('div', {
        onClick: (n) => n.stopPropagation(),
        className:
          'relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between mb-3',
            children: [
              e.jsx('h3', {
                className: 'text-[15px] font-black text-slate-800',
                children: x ? 'Editar regla' : 'Nueva regla'
              }),
              e.jsx('button', {
                onClick: i,
                className: 'text-slate-400',
                children: e.jsx(de, { size: 18 })
              })
            ]
          }),
          e.jsxs('div', {
            className: 'space-y-3',
            children: [
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: b, children: 'Nombre' }),
                  e.jsx('input', {
                    value: t.nombre,
                    onChange: (n) => c({ ...t, nombre: n.target.value }),
                    className: `${g} mt-1`,
                    placeholder: 'Entrega registrada'
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: b, children: 'Patrón de evento (regex)' }),
                  e.jsx('input', {
                    value: t.evento_patron,
                    onChange: (n) => c({ ...t, evento_patron: n.target.value }),
                    className: `${g} mt-1 font-mono text-[13px]`,
                    placeholder: '^OT\\.registrar_pod$'
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-2 gap-2',
                children: [
                  e.jsxs('label', {
                    className: 'block',
                    children: [
                      e.jsx('span', { className: b, children: 'Canal' }),
                      e.jsxs('select', {
                        value: t.canal,
                        onChange: (n) => c({ ...t, canal: n.target.value }),
                        className: `${g} mt-1`,
                        children: [
                          e.jsx('option', { value: 'in-app', children: 'In-app' }),
                          e.jsx('option', { value: 'push', children: 'Push (Capgo/FCM)' }),
                          e.jsx('option', { value: 'correo', children: 'Correo' })
                        ]
                      })
                    ]
                  }),
                  e.jsxs('label', {
                    className: 'block',
                    children: [
                      e.jsx('span', { className: b, children: 'Rol destino' }),
                      e.jsx('input', {
                        value: t.destinatario_rol,
                        onChange: (n) => c({ ...t, destinatario_rol: n.target.value }),
                        className: `${g} mt-1`,
                        placeholder: 'ADMIN'
                      })
                    ]
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: b, children: 'Título (plantilla)' }),
                  e.jsx('input', {
                    value: t.titulo_tpl,
                    onChange: (n) => c({ ...t, titulo_tpl: n.target.value }),
                    className: `${g} mt-1`
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: b, children: 'Mensaje (plantilla)' }),
                  e.jsx('textarea', {
                    rows: 2,
                    value: t.mensaje_tpl,
                    onChange: (n) => c({ ...t, mensaje_tpl: n.target.value }),
                    className: `${g} mt-1 resize-none`
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'flex items-center gap-3',
                children: [
                  e.jsxs('label', {
                    className: 'flex items-center gap-2 text-[13px] text-slate-600',
                    children: [
                      e.jsx('input', {
                        type: 'checkbox',
                        checked: t.activo,
                        onChange: (n) => c({ ...t, activo: n.target.checked })
                      }),
                      ' ',
                      'Activa'
                    ]
                  }),
                  e.jsxs('label', {
                    className: 'flex items-center gap-2 text-[13px] text-slate-600 ml-auto',
                    children: [
                      'Orden',
                      ' ',
                      e.jsx('input', {
                        type: 'number',
                        value: t.orden,
                        onChange: (n) => c({ ...t, orden: n.target.value }),
                        className: 'w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm'
                      })
                    ]
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'text-[10px] text-slate-400',
                children: [
                  'Placeholders: ',
                  e.jsx('code', { children: '{agregado} {id} {desde} {hasta} {actor}' })
                ]
              }),
              e.jsx('button', {
                onClick: () =>
                  t.nombre && t.evento_patron ? m(t) : u.error('Nombre y patrón son obligatorios'),
                className:
                  'w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600',
                children: 'Guardar'
              })
            ]
          })
        ]
      })
    ]
  });
}
export { $e as default };
