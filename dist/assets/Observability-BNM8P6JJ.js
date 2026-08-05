import { d as D, j as e } from './query-vendor-BNjBrM5A.js';
import { r as m } from './react-vendor-6aw4XXjH.js';
import { u as q, g as Q } from './animation-vendor-JfdD7EdN.js';
import { s as w } from './index-BOgf3xmh.js';
import { Q as I } from './QueryErrorState-Bjb0rXX1.js';
import {
  aN as F,
  R as P,
  aJ as B,
  x as K,
  l as H,
  Y as J,
  bL as V,
  a6 as U,
  bZ as W
} from './ui-vendor-naG2PYVT.js';
import './supabase-vendor-4Fjsfb0a.js';
const M = [
    { value: '24h', label: '24 horas' },
    { value: '72h', label: '72 horas' },
    { value: '7d', label: '7 días' }
  ],
  Y = {
    error: 'bg-rose-100 text-rose-700 border-rose-200',
    warn: 'bg-amber-100 text-amber-700 border-amber-200',
    info: 'bg-sky-100 text-sky-700 border-sky-200'
  },
  G = {
    critical: 'bg-rose-100 text-rose-700 border-rose-200',
    high: 'bg-amber-100 text-amber-700 border-amber-200',
    medium: 'bg-sky-100 text-sky-700 border-sky-200'
  },
  E = {
    application: 'Aplicación',
    audit: 'Auditoría',
    performance: 'Rendimiento',
    query: 'Query',
    mutation: 'Mutación',
    frontend: 'Frontend',
    realtime: 'Realtime',
    presence: 'Presencia'
  },
  $ = (a) => {
    if (!a) return '—';
    const l = new Date(a);
    return Number.isNaN(l.getTime())
      ? '—'
      : l.toLocaleString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
  },
  R = (a) => {
    if (!a) return '—';
    const l = Date.now() - new Date(a).getTime();
    if (!Number.isFinite(l)) return '—';
    const i = Math.floor(l / 6e4);
    if (i < 1) return 'Ahora';
    if (i < 60) return `Hace ${i} min`;
    const n = Math.floor(i / 60);
    return n < 24 ? `Hace ${n} h` : `Hace ${Math.floor(n / 24)} d`;
  },
  L = (a) =>
    a == null
      ? '—'
      : a < 1e3
        ? `${a} ms`
        : a < 6e4
          ? `${(a / 1e3).toFixed(1)} s`
          : `${(a / 6e4).toFixed(1)} min`;
function Z(a) {
  const l = Date.now(),
    i = { '24h': 24 * 60 * 60 * 1e3, '72h': 72 * 60 * 60 * 1e3, '7d': 7 * 24 * 60 * 60 * 1e3 };
  return new Date(l - (i[a] || i['24h'])).toISOString();
}
function T(a) {
  return Y[a] || 'bg-slate-100 text-slate-700 border-slate-200';
}
function z(a, l, i = 5) {
  const n = new Map();
  return (
    a.forEach((c) => {
      const o = l(c);
      o && n.set(o, (n.get(o) || 0) + 1);
    }),
    Array.from(n.entries())
      .map(([c, o]) => ({ key: c, count: o }))
      .sort((c, o) => o.count - c.count)
      .slice(0, i)
  );
}
async function X({ lookback: a, level: l, kind: i, moduleFilter: n, search: c }) {
  const o = Z(a);
  let x = w
    .from('system_logs')
    .select(
      'id, created_at, level, kind, module, screen, action, route, status, message, error_name, stack, payload, context, browser, duration_ms, app_version, commit_sha, build_number, correlation_id, session_id, handled, fingerprint, usuario_nombre, usuario_email, rol',
      { count: 'exact' }
    )
    .gte('created_at', o)
    .order('created_at', { ascending: !1 })
    .limit(300);
  if (
    (l !== 'all' && (x = x.eq('level', l)),
    i !== 'all' && (x = x.eq('kind', i)),
    n !== 'all' && (x = x.eq('module', n)),
    c.trim())
  ) {
    const s = c.trim().replace(/[%*,]/g, ' ').slice(0, 60);
    x = x.or(
      `message.ilike.*${s}*,usuario_nombre.ilike.*${s}*,usuario_email.ilike.*${s}*,action.ilike.*${s}*,screen.ilike.*${s}*`
    );
  }
  const g = w
      .from('system_logs')
      .select('id', { count: 'exact', head: !0 })
      .gte('created_at', o)
      .eq('level', 'error'),
    S = w
      .from('system_logs')
      .select('id', { count: 'exact', head: !0 })
      .gte('created_at', o)
      .gte('duration_ms', 1e3),
    j = w
      .from('system_logs')
      .select('id', { count: 'exact', head: !0 })
      .gte('created_at', o)
      .eq('level', 'warn'),
    C = w
      .from('system_alerts')
      .select(
        'id, created_at, status, severity, rule_code, scope_key, titulo, mensaje, payload, occurrences, first_seen_at, last_seen_at, notified_at'
      )
      .gte('created_at', o)
      .order('created_at', { ascending: !1 })
      .limit(20),
    [{ data: r, error: N, count: t }, p, b, h, f] = await Promise.all([x, g, S, j, C]);
  if (N) throw N;
  if (p.error) throw p.error;
  if (b.error) throw b.error;
  if (h.error) throw h.error;
  if (f.error) throw f.error;
  const d = r || [],
    v = f.data || [],
    k = d.filter((s) => s.level === 'error'),
    A = new Set(d.map((s) => s.usuario_email || s.usuario_nombre || s.rol).filter(Boolean)).size,
    _ = (() => {
      const s = d.map((u) => Number(u.duration_ms)).filter((u) => Number.isFinite(u) && u > 0);
      return s.length ? Math.round(s.reduce((u, O) => u + O, 0) / s.length) : null;
    })();
  return {
    logs: d,
    totals: {
      total: t || 0,
      errors: p.count || 0,
      warns: h.count || 0,
      slow: b.count || 0,
      openAlerts: v.filter((s) => s.status === 'open').length,
      usersAffected: A,
      avgDuration: _
    },
    alerts: v,
    topFingerprints: z(k, (s) => s.fingerprint || s.message, 6),
    topModules: z(d, (s) => s.module, 6),
    topActions: z(
      d.filter((s) => Number(s.duration_ms) >= 1e3),
      (s) => `${s.module}.${s.action}`,
      6
    ),
    lastError: k[0] || null,
    modules: Array.from(new Set(d.map((s) => s.module).filter(Boolean))).sort(),
    kinds: Array.from(new Set(d.map((s) => s.kind).filter(Boolean))).sort()
  };
}
const y = ({ icon: a, label: l, value: i, tone: n = 'slate', helper: c }) =>
  e.jsx('div', {
    className: 'bg-white rounded-2xl border border-slate-200 p-4 shadow-sm',
    children: e.jsxs('div', {
      className: 'flex items-start justify-between gap-3',
      children: [
        e.jsxs('div', {
          className: 'min-w-0',
          children: [
            e.jsx('p', {
              className: 'text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-bold',
              children: l
            }),
            e.jsx('p', {
              className: 'text-2xl sm:text-3xl font-black text-slate-900 mt-1',
              children: i
            }),
            c ? e.jsx('p', { className: 'text-[11px] text-slate-400 mt-1', children: c }) : null
          ]
        }),
        e.jsx('div', {
          className: `w-11 h-11 rounded-xl flex items-center justify-center ${n === 'rose' ? 'bg-rose-50 text-rose-500' : n === 'amber' ? 'bg-amber-50 text-amber-500' : n === 'sky' ? 'bg-sky-50 text-sky-500' : n === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-500'}`,
          children: a
        })
      ]
    })
  });
function ee(a) {
  return G[a] || 'bg-slate-100 text-slate-700 border-slate-200';
}
function ie() {
  var _;
  const a = m.useRef(null),
    [l, i] = m.useState('24h'),
    [n, c] = m.useState('all'),
    [o, x] = m.useState('all'),
    [g, S] = m.useState('all'),
    [j, C] = m.useState(''),
    [r, N] = m.useState(null);
  q(
    () => {
      Q.from(a.current, {
        y: 16,
        opacity: 0,
        duration: 0.35,
        ease: 'power3.out',
        clearProps: 'all'
      });
    },
    { scope: a }
  );
  const {
      data: t,
      isLoading: p,
      isFetching: b,
      error: h,
      refetch: f
    } = D({
      queryKey: ['observability_snapshot', l, n, o, g, j],
      queryFn: () => X({ lookback: l, level: n, kind: o, moduleFilter: g, search: j }),
      refetchInterval: 15e3
    }),
    d = (t == null ? void 0 : t.logs) || [],
    v = (t == null ? void 0 : t.alerts) || [],
    k = m.useMemo(() => (t == null ? void 0 : t.modules) || [], [t]),
    A = m.useMemo(() => (t == null ? void 0 : t.kinds) || [], [t]);
  return e.jsxs('div', {
    ref: a,
    className: 'space-y-4 sm:space-y-6 bg-slate-50 min-h-screen text-slate-700 p-3 sm:p-6',
    children: [
      e.jsxs('div', {
        className: 'flex flex-col lg:flex-row lg:items-end justify-between gap-4',
        children: [
          e.jsxs('div', {
            children: [
              e.jsxs('h1', {
                className: 'text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3',
                children: [
                  e.jsx('div', {
                    className:
                      'w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white grid place-items-center shadow-lg',
                    children: e.jsx(F, { size: 22 })
                  }),
                  'Centro de Observabilidad'
                ]
              }),
              e.jsx('p', {
                className: 'text-sm text-slate-500 mt-2',
                children: 'Errores, lentitud y trazabilidad técnica del CCO en una sola vista.'
              })
            ]
          }),
          e.jsxs('button', {
            onClick: () => f(),
            disabled: b,
            className:
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-slate-300',
            children: [e.jsx(P, { size: 16, className: b ? 'animate-spin' : '' }), 'Actualizar']
          })
        ]
      }),
      e.jsxs('div', {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-2 text-slate-700',
            children: [
              e.jsx(B, { size: 16 }),
              e.jsx('span', {
                className: 'text-sm font-black uppercase tracking-wide',
                children: 'Filtros'
              })
            ]
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className:
                      'block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5',
                    children: 'Ventana'
                  }),
                  e.jsx('select', {
                    value: l,
                    onChange: (s) => i(s.target.value),
                    className:
                      'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400',
                    children: M.map((s) =>
                      e.jsx('option', { value: s.value, children: s.label }, s.value)
                    )
                  })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className:
                      'block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5',
                    children: 'Severidad'
                  }),
                  e.jsxs('select', {
                    value: n,
                    onChange: (s) => c(s.target.value),
                    className:
                      'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400',
                    children: [
                      e.jsx('option', { value: 'all', children: 'Todas' }),
                      e.jsx('option', { value: 'error', children: 'Error' }),
                      e.jsx('option', { value: 'warn', children: 'Warn' }),
                      e.jsx('option', { value: 'info', children: 'Info' })
                    ]
                  })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className:
                      'block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5',
                    children: 'Tipo'
                  }),
                  e.jsxs('select', {
                    value: o,
                    onChange: (s) => x(s.target.value),
                    className:
                      'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400',
                    children: [
                      e.jsx('option', { value: 'all', children: 'Todos' }),
                      A.map((s) => e.jsx('option', { value: s, children: E[s] || s }, s))
                    ]
                  })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className:
                      'block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5',
                    children: 'Módulo'
                  }),
                  e.jsxs('select', {
                    value: g,
                    onChange: (s) => S(s.target.value),
                    className:
                      'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400',
                    children: [
                      e.jsx('option', { value: 'all', children: 'Todos' }),
                      k.map((s) => e.jsx('option', { value: s, children: s }, s))
                    ]
                  })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className:
                      'block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5',
                    children: 'Buscar'
                  }),
                  e.jsxs('div', {
                    className: 'relative',
                    children: [
                      e.jsx(K, { size: 16, className: 'absolute left-3 top-3 text-slate-400' }),
                      e.jsx('input', {
                        value: j,
                        onChange: (s) => C(s.target.value),
                        placeholder: 'usuario, mensaje, acción',
                        className:
                          'w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400'
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }),
      h
        ? e.jsx(I, {
            error: h,
            onRetry: f,
            className: 'rounded-2xl border border-slate-200 bg-white'
          })
        : null,
      !h &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsxs('div', {
              className: 'grid grid-cols-2 xl:grid-cols-5 gap-3',
              children: [
                e.jsx(y, {
                  icon: e.jsx(H, { size: 20 }),
                  label: 'Eventos en ventana',
                  value: (t == null ? void 0 : t.totals.total) ?? (p ? '…' : 0),
                  tone: 'sky',
                  helper: `Vista ${((_ = M.find((s) => s.value === l)) == null ? void 0 : _.label) || l}`
                }),
                e.jsx(y, {
                  icon: e.jsx(F, { size: 20 }),
                  label: 'Errores',
                  value: (t == null ? void 0 : t.totals.errors) ?? (p ? '…' : 0),
                  tone: 'rose',
                  helper: 'Severidad crítica detectada'
                }),
                e.jsx(y, {
                  icon: e.jsx(J, { size: 20 }),
                  label: 'Warnings',
                  value: (t == null ? void 0 : t.totals.warns) ?? (p ? '…' : 0),
                  tone: 'amber',
                  helper: 'Eventos degradados o recuperables'
                }),
                e.jsx(y, {
                  icon: e.jsx(V, { size: 20 }),
                  label: 'Operaciones lentas',
                  value: (t == null ? void 0 : t.totals.slow) ?? (p ? '…' : 0),
                  tone: 'emerald',
                  helper: '>= 1000 ms registrados'
                }),
                e.jsx(y, {
                  icon: e.jsx(U, { size: 20 }),
                  label: 'Usuarios afectados',
                  value: (t == null ? void 0 : t.totals.usersAffected) ?? (p ? '…' : 0),
                  helper: `Promedio: ${L(t == null ? void 0 : t.totals.avgDuration)}`
                })
              ]
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-1 xl:grid-cols-3 gap-4',
              children: [
                e.jsxs('div', {
                  className: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
                  children: [
                    e.jsx('h3', {
                      className: 'text-sm font-black uppercase tracking-wide text-slate-500 mb-3',
                      children: 'Top errores'
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children:
                        ((t == null ? void 0 : t.topFingerprints) || []).length === 0
                          ? e.jsx('p', {
                              className: 'text-sm text-slate-400 py-6 text-center',
                              children: 'Sin errores en el rango actual.'
                            })
                          : t.topFingerprints.map((s, u) =>
                              e.jsx(
                                'div',
                                {
                                  className:
                                    'rounded-xl border border-slate-100 bg-slate-50 px-3 py-2',
                                  children: e.jsxs('div', {
                                    className: 'flex items-start justify-between gap-3',
                                    children: [
                                      e.jsx('p', {
                                        className:
                                          'text-[12px] font-semibold text-slate-700 leading-5',
                                        children: s.key
                                      }),
                                      e.jsxs('span', {
                                        className: 'text-[11px] font-black text-rose-600 shrink-0',
                                        children: [s.count, 'x']
                                      })
                                    ]
                                  })
                                },
                                `${s.key}-${u}`
                              )
                            )
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
                  children: [
                    e.jsx('h3', {
                      className: 'text-sm font-black uppercase tracking-wide text-slate-500 mb-3',
                      children: 'Módulos más ruidosos'
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children: ((t == null ? void 0 : t.topModules) || []).map((s) =>
                        e.jsxs(
                          'div',
                          {
                            className:
                              'flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2',
                            children: [
                              e.jsx('span', {
                                className: 'text-[12px] font-semibold text-slate-700',
                                children: s.key
                              }),
                              e.jsx('span', {
                                className: 'text-[11px] font-black text-slate-500',
                                children: s.count
                              })
                            ]
                          },
                          s.key
                        )
                      )
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
                  children: [
                    e.jsx('h3', {
                      className: 'text-sm font-black uppercase tracking-wide text-slate-500 mb-3',
                      children: 'Acciones lentas'
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children:
                        ((t == null ? void 0 : t.topActions) || []).length === 0
                          ? e.jsx('p', {
                              className: 'text-sm text-slate-400 py-6 text-center',
                              children: 'Sin lentitud relevante en la ventana actual.'
                            })
                          : t.topActions.map((s) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2',
                                  children: [
                                    e.jsx('span', {
                                      className: 'text-[12px] font-semibold text-slate-700',
                                      children: s.key
                                    }),
                                    e.jsx('span', {
                                      className: 'text-[11px] font-black text-amber-600',
                                      children: s.count
                                    })
                                  ]
                                },
                                s.key
                              )
                            )
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden',
              children: [
                e.jsxs('div', {
                  className:
                    'px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h3', {
                          className: 'text-sm font-black uppercase tracking-wide text-slate-500',
                          children: 'Alertas automáticas'
                        }),
                        e.jsx('p', {
                          className: 'text-[12px] text-slate-400 mt-1',
                          children:
                            'Alertas materializadas desde `system_logs` con cooldown anti-spam.'
                        })
                      ]
                    }),
                    e.jsxs('span', {
                      className: 'text-[11px] font-black text-slate-500 uppercase tracking-wide',
                      children: ['Abiertas: ', (t == null ? void 0 : t.totals.openAlerts) ?? 0]
                    })
                  ]
                }),
                v.length === 0
                  ? e.jsx('div', {
                      className: 'py-12 text-center text-slate-400 text-sm',
                      children: 'Aún no hay alertas materializadas en la ventana actual.'
                    })
                  : e.jsx('div', {
                      className: 'divide-y divide-slate-100',
                      children: v.map((s) =>
                        e.jsx(
                          'div',
                          {
                            className: 'px-4 py-3',
                            children: e.jsxs('div', {
                              className: 'flex flex-col lg:flex-row lg:items-center gap-3',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2 min-w-0',
                                  children: [
                                    e.jsx('span', {
                                      className: `text-[10px] font-black uppercase rounded-lg border px-2 py-1 ${ee(s.severity)}`,
                                      children: s.severity
                                    }),
                                    e.jsx('span', {
                                      className:
                                        'text-[10px] font-black uppercase rounded-lg border px-2 py-1 bg-slate-100 text-slate-600 border-slate-200',
                                      children: s.status
                                    }),
                                    e.jsx('span', {
                                      className: 'text-[11px] font-mono text-slate-400',
                                      children: $(s.created_at)
                                    })
                                  ]
                                }),
                                e.jsxs('div', {
                                  className: 'flex-1 min-w-0',
                                  children: [
                                    e.jsx('p', {
                                      className: 'text-[13px] font-bold text-slate-800 truncate',
                                      children: s.titulo
                                    }),
                                    e.jsx('p', {
                                      className: 'text-[12px] text-slate-500 truncate mt-0.5',
                                      children: s.mensaje
                                    })
                                  ]
                                }),
                                e.jsxs('div', {
                                  className:
                                    'flex items-center gap-3 text-[11px] text-slate-400 shrink-0',
                                  children: [
                                    e.jsx('span', { children: s.rule_code }),
                                    e.jsxs('span', { children: [s.occurrences, 'x'] }),
                                    e.jsx('span', { children: R(s.last_seen_at || s.created_at) })
                                  ]
                                })
                              ]
                            })
                          },
                          s.id
                        )
                      )
                    })
              ]
            }),
            e.jsxs('div', {
              className: 'rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden',
              children: [
                e.jsxs('div', {
                  className:
                    'px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h3', {
                          className: 'text-sm font-black uppercase tracking-wide text-slate-500',
                          children: 'Eventos recientes'
                        }),
                        e.jsxs('p', {
                          className: 'text-[12px] text-slate-400 mt-1',
                          children: ['Últimos ', d.length, ' registros según los filtros actuales.']
                        })
                      ]
                    }),
                    t != null && t.lastError
                      ? e.jsxs('div', {
                          className: 'text-right',
                          children: [
                            e.jsx('p', {
                              className:
                                'text-[10px] font-black uppercase tracking-wide text-rose-500',
                              children: 'Último error'
                            }),
                            e.jsxs('p', {
                              className: 'text-[12px] text-slate-500',
                              children: [
                                R(t.lastError.created_at),
                                ' · ',
                                t.lastError.module,
                                '.',
                                t.lastError.action
                              ]
                            })
                          ]
                        })
                      : null
                  ]
                }),
                p
                  ? e.jsx('div', {
                      className: 'py-14 text-center text-slate-400 text-sm',
                      children: 'Cargando observabilidad…'
                    })
                  : d.length === 0
                    ? e.jsx('div', {
                        className: 'py-14 text-center text-slate-400 text-sm',
                        children: 'No hay logs para los filtros seleccionados.'
                      })
                    : e.jsx('div', {
                        className: 'divide-y divide-slate-100 max-h-[70vh] overflow-y-auto',
                        children: d.map((s) =>
                          e.jsx(
                            'button',
                            {
                              type: 'button',
                              onClick: () => N(s),
                              className:
                                'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors',
                              children: e.jsxs('div', {
                                className: 'flex flex-col xl:flex-row xl:items-center gap-3',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 min-w-0',
                                    children: [
                                      e.jsx('span', {
                                        className: `text-[10px] font-black uppercase rounded-lg border px-2 py-1 ${T(s.level)}`,
                                        children: s.level
                                      }),
                                      e.jsx('span', {
                                        className:
                                          'text-[10px] font-black uppercase rounded-lg border px-2 py-1 bg-slate-100 text-slate-600 border-slate-200',
                                        children: E[s.kind] || s.kind
                                      }),
                                      e.jsx('span', {
                                        className: 'text-[11px] font-mono text-slate-400 shrink-0',
                                        children: $(s.created_at)
                                      })
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex-1 min-w-0',
                                    children: [
                                      e.jsx('p', {
                                        className: 'text-[13px] font-bold text-slate-800 truncate',
                                        children: s.message
                                      }),
                                      e.jsxs('p', {
                                        className: 'text-[11px] text-slate-500 truncate mt-0.5',
                                        children: [
                                          s.module,
                                          '.',
                                          s.action,
                                          ' · ',
                                          s.screen || 'sin pantalla',
                                          ' ·',
                                          ' ',
                                          s.route || 'sin ruta'
                                        ]
                                      })
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className:
                                      'flex items-center gap-3 text-[11px] text-slate-400 shrink-0',
                                    children: [
                                      e.jsx('span', {
                                        children: s.usuario_nombre || s.usuario_email || 's/usuario'
                                      }),
                                      e.jsxs('span', {
                                        children: [
                                          e.jsx(W, { size: 12, className: 'inline mr-1' }),
                                          L(s.duration_ms)
                                        ]
                                      })
                                    ]
                                  })
                                ]
                              })
                            },
                            s.id
                          )
                        )
                      })
              ]
            })
          ]
        }),
      r &&
        e.jsx('div', {
          className: 'fixed inset-0 z-[120] bg-slate-950/55 backdrop-blur-sm p-4 overflow-y-auto',
          children: e.jsxs('div', {
            className:
              'max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden',
            children: [
              e.jsxs('div', {
                className:
                  'px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4',
                children: [
                  e.jsxs('div', {
                    className: 'min-w-0',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center gap-2 flex-wrap',
                        children: [
                          e.jsx('span', {
                            className: `text-[10px] font-black uppercase rounded-lg border px-2 py-1 ${T(r.level)}`,
                            children: r.level
                          }),
                          e.jsx('span', {
                            className:
                              'text-[10px] font-black uppercase rounded-lg border px-2 py-1 bg-slate-100 text-slate-600 border-slate-200',
                            children: E[r.kind] || r.kind
                          }),
                          e.jsx('span', {
                            className: 'text-[11px] font-mono text-slate-400',
                            children: $(r.created_at)
                          })
                        ]
                      }),
                      e.jsx('h3', {
                        className: 'text-lg font-black text-slate-900 mt-2',
                        children: r.message
                      }),
                      e.jsxs('p', {
                        className: 'text-sm text-slate-500 mt-1',
                        children: [
                          r.module,
                          '.',
                          r.action,
                          ' · ',
                          r.screen || 'sin pantalla',
                          ' ',
                          '· ',
                          r.route || 'sin ruta'
                        ]
                      })
                    ]
                  }),
                  e.jsx('button', {
                    onClick: () => N(null),
                    className:
                      'px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200',
                    children: 'Cerrar'
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'p-5 grid grid-cols-1 xl:grid-cols-2 gap-4',
                children: [
                  e.jsxs('div', {
                    className: 'space-y-4',
                    children: [
                      e.jsxs('section', {
                        className: 'rounded-2xl border border-slate-200 p-4',
                        children: [
                          e.jsx('h4', {
                            className:
                              'text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3',
                            children: 'Contexto operativo'
                          }),
                          e.jsxs('div', {
                            className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm',
                            children: [
                              e.jsxs('div', {
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'text-slate-400 block text-[11px] uppercase font-bold',
                                    children: 'Usuario'
                                  }),
                                  e.jsx('span', {
                                    className: 'font-semibold text-slate-800',
                                    children: r.usuario_nombre || '—'
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'text-slate-400 block text-[11px] uppercase font-bold',
                                    children: 'Email'
                                  }),
                                  e.jsx('span', {
                                    className: 'font-semibold text-slate-800',
                                    children: r.usuario_email || '—'
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'text-slate-400 block text-[11px] uppercase font-bold',
                                    children: 'Rol'
                                  }),
                                  e.jsx('span', {
                                    className: 'font-semibold text-slate-800',
                                    children: r.rol || '—'
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'text-slate-400 block text-[11px] uppercase font-bold',
                                    children: 'Duración'
                                  }),
                                  e.jsx('span', {
                                    className: 'font-semibold text-slate-800',
                                    children: L(r.duration_ms)
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'text-slate-400 block text-[11px] uppercase font-bold',
                                    children: 'Status'
                                  }),
                                  e.jsx('span', {
                                    className: 'font-semibold text-slate-800',
                                    children: r.status || '—'
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'text-slate-400 block text-[11px] uppercase font-bold',
                                    children: 'Versión'
                                  }),
                                  e.jsx('span', {
                                    className: 'font-semibold text-slate-800',
                                    children: r.app_version || '—'
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'text-slate-400 block text-[11px] uppercase font-bold',
                                    children: 'Correlation ID'
                                  }),
                                  e.jsx('span', {
                                    className: 'font-mono text-[12px] text-slate-700 break-all',
                                    children: r.correlation_id || '—'
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'text-slate-400 block text-[11px] uppercase font-bold',
                                    children: 'Fingerprint'
                                  }),
                                  e.jsx('span', {
                                    className: 'font-mono text-[12px] text-slate-700 break-all',
                                    children: r.fingerprint || '—'
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsxs('section', {
                        className: 'rounded-2xl border border-slate-200 p-4',
                        children: [
                          e.jsx('h4', {
                            className:
                              'text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3',
                            children: 'Payload'
                          }),
                          e.jsx('pre', {
                            className:
                              'text-[12px] leading-5 bg-slate-950 text-slate-100 rounded-2xl p-4 overflow-auto max-h-[260px]',
                            children: JSON.stringify(r.payload || {}, null, 2)
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'space-y-4',
                    children: [
                      e.jsxs('section', {
                        className: 'rounded-2xl border border-slate-200 p-4',
                        children: [
                          e.jsx('h4', {
                            className:
                              'text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3',
                            children: 'Context'
                          }),
                          e.jsx('pre', {
                            className:
                              'text-[12px] leading-5 bg-slate-950 text-slate-100 rounded-2xl p-4 overflow-auto max-h-[260px]',
                            children: JSON.stringify(r.context || {}, null, 2)
                          })
                        ]
                      }),
                      e.jsxs('section', {
                        className: 'rounded-2xl border border-slate-200 p-4',
                        children: [
                          e.jsx('h4', {
                            className:
                              'text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3',
                            children: 'Stack / navegador'
                          }),
                          e.jsx('pre', {
                            className:
                              'text-[12px] leading-5 bg-slate-950 text-slate-100 rounded-2xl p-4 overflow-auto max-h-[260px]',
                            children:
                              r.stack ||
                              JSON.stringify(r.browser || {}, null, 2) ||
                              'Sin stack registrado'
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        })
    ]
  });
}
export { ie as default };
