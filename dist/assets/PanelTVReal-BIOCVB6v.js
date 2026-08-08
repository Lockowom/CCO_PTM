import { j as e } from './query-vendor-BNjBrM5A.js';
import { r as l, u as J, b as k } from './react-vendor-6aw4XXjH.js';
import { a as Q, b as n } from './dashData-IjtsrSpm.js';
import { L as X, s as G } from './index-puW0B3h7.js';
import './supabase-vendor-4Fjsfb0a.js';
import './ui-vendor-Da7ysJ4B.js';
import './animation-vendor-JfdD7EdN.js';
function Y(s) {
  return s === 1 ? 1 : 1 - Math.pow(2, -10 * s);
}
function O({
  end: s,
  duration: r = 1200,
  decimals: x = 0,
  prefix: p = '',
  suffix: m = '',
  className: y
}) {
  const [w, E] = l.useState('0'),
    f = l.useRef(0),
    a = l.useRef(0);
  return (
    l.useEffect(() => {
      const g = f.current,
        o = s - g;
      if (o === 0) return;
      const b = performance.now(),
        u = (N) => {
          const j = N - b,
            i = Math.min(j / r, 1),
            h = g + o * Y(i);
          (E(h.toFixed(x)), i < 1 ? (a.current = requestAnimationFrame(u)) : (f.current = s));
        };
      return ((a.current = requestAnimationFrame(u)), () => cancelAnimationFrame(a.current));
    }, [s, r, x]),
    e.jsxs('span', { className: y, children: [p, w, m] })
  );
}
const V = 3e4,
  Z = 8e3,
  ee = 15e3,
  I = {
    [n.EN_PROCESO]: '#f59e0b',
    [n.P_VENDEDOR]: '#d97706',
    [n.P_STOCK]: '#b45309',
    [n.P_RETIRO]: '#92400e',
    [n.SHIPPING]: '#8b5cf6',
    [n.CURRIER]: '#7c3aed',
    [n.EN_RUTA]: '#06b6d4',
    [n.ENTREGADO]: '#22c55e'
  },
  L = {
    [n.EN_PROCESO]: '⚙',
    [n.P_VENDEDOR]: '👤',
    [n.P_STOCK]: '📦',
    [n.P_RETIRO]: '🔄',
    [n.SHIPPING]: '📋',
    [n.CURRIER]: '🚛',
    [n.EN_RUTA]: '🛣',
    [n.ENTREGADO]: '✓'
  };
function D(s) {
  if (s === null) return null;
  const r =
    s > 5
      ? 'bg-red-500/20 text-red-400'
      : s > 2
        ? 'bg-amber-500/20 text-amber-400'
        : 'bg-gray-700/40 text-gray-400';
  return e.jsxs('span', {
    className: `text-[10px] font-bold px-1.5 py-0.5 rounded ${r} tabular-nums`,
    children: [s, 'd']
  });
}
function te({ n: s, estado: r }) {
  const x = I[r] || '#6b7280',
    p = () => {
      if (r === n.EN_RUTA || r === n.CURRIER)
        return e.jsxs('div', {
          className: 'flex items-center gap-1.5',
          children: [
            e.jsx('span', {
              className: 'text-cyan-400 text-xs font-bold',
              children: s.transportista !== '—' ? s.transportista : ''
            }),
            D(s.diasEnEstado)
          ]
        });
      if (r === n.ENTREGADO)
        return e.jsxs('div', {
          className: 'flex items-center gap-1.5',
          children: [
            s.fecha_entregado &&
              e.jsx('span', {
                className: 'text-emerald-400 text-[11px] font-medium',
                children: s.fecha_entregado
              }),
            s.transportista !== '—' &&
              e.jsxs('span', {
                className: 'text-gray-500 text-[10px]',
                children: ['· ', s.transportista]
              })
          ]
        });
      if (r === n.SHIPPING || r === n.EN_PROCESO || r.startsWith('P /')) {
        const m = !!s.fecha_aprobacion_real;
        return e.jsxs('div', {
          className: 'flex flex-col items-end gap-1',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-1.5',
              children: [
                e.jsx('span', {
                  className: 'text-gray-500 text-[9px] uppercase tracking-wide',
                  children: m ? 'Aprob. real' : 'Aprob.'
                }),
                s.fecha_aprob_efectiva
                  ? e.jsx('span', {
                      className: `text-[11px] font-medium ${m ? 'text-emerald-400' : 'text-gray-400'}`,
                      children: s.fecha_aprob_efectiva
                    })
                  : e.jsx('span', { className: 'text-gray-600 text-[10px]', children: 'sin fecha' })
              ]
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-1.5',
              children: [
                s.diasDesdeAprobacion !== null ? D(s.diasDesdeAprobacion) : D(s.diasEnEstado),
                s.fecha_compromiso &&
                  e.jsxs('span', {
                    className: 'text-gray-500 text-[10px]',
                    children: ['comp: ', s.fecha_compromiso]
                  })
              ]
            })
          ]
        });
      }
      return s.transportista !== '—'
        ? e.jsx('span', { className: 'text-gray-500 text-[10px]', children: s.transportista })
        : null;
    };
  return e.jsxs('div', {
    className: `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${s.urgente ? 'spotlight-card bg-red-500/10' : 'bg-white/[0.03] border border-gray-800/40 hover:bg-white/[0.05]'}`,
    children: [
      s.urgente && e.jsx('span', { className: 'text-sm shrink-0', children: '🚨' }),
      e.jsx('div', { className: 'w-1 h-8 rounded-full shrink-0', style: { background: x } }),
      e.jsxs('div', {
        className: 'min-w-0 flex-1',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsx('span', {
                className: 'text-[15px] font-bold tabular-nums',
                style: { color: s.urgente ? '#f87171' : '#e5e7eb' },
                children: s.nv
              }),
              e.jsx('span', {
                className:
                  'text-[8px] uppercase tracking-wider text-gray-500 bg-gray-800/60 rounded px-1.5 py-0.5 font-medium',
                children: s.canal
              })
            ]
          }),
          e.jsxs('p', {
            className: 'text-[11px] text-gray-400 truncate',
            children: [s.cliente, s.vendedor !== '—' ? ` · ${s.vendedor}` : '']
          })
        ]
      }),
      e.jsx('div', {
        className: 'text-right shrink-0 flex flex-col items-end gap-0.5',
        children: p()
      })
    ]
  });
}
function oe() {
  const s = J(),
    [r, x] = l.useState(null),
    [p, m] = l.useState(!0),
    [y, w] = l.useState(''),
    [E, f] = l.useState(null),
    [a, g] = l.useState(null),
    [o, b] = l.useState(!0),
    u = l.useRef(0),
    N = l.useRef(0),
    j = l.useCallback((t) => {
      g((c) => (c === t ? (b(!0), null) : (b(!1), (u.current = Date.now() + ee), t)));
    }, []),
    i = l.useCallback(async () => {
      try {
        const t = await Q();
        (x(t),
          f(null),
          w(
            new Date().toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          ));
      } catch (t) {
        (X.error(t, {
          module: 'panel',
          screen: 'PanelTV',
          action: 'fetch_tv_estados',
          message: 'Fallo la carga de estados para Modo TV'
        }),
          f(t instanceof Error ? t.message : String(t)));
      } finally {
        m(!1);
      }
    }, []);
  (l.useEffect(() => {
    i();
    const t = setInterval(i, V);
    return () => clearInterval(t);
  }, [i]),
    l.useEffect(() => {
      let t;
      const c = G.channel('panel_tv_rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_operaciones' }, () => {
          (clearTimeout(t), (t = setTimeout(i, 1200)));
        })
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tms_operaciones_sync' },
          () => {
            (clearTimeout(t), (t = setTimeout(i, 1200)));
          }
        )
        .subscribe();
      return () => {
        (clearTimeout(t), G.removeChannel(c));
      };
    }, [i]),
    l.useEffect(() => {
      if (!r || r.estados.length === 0) return;
      const t = setInterval(() => {
        if (!o && Date.now() < u.current) return;
        !o && Date.now() >= u.current && b(!0);
        const c = r.estados.map((d) => d.estado);
        c.length !== 0 && ((N.current = (N.current + 1) % c.length), g(c[N.current]));
      }, Z);
      return () => clearInterval(t);
    }, [r, o]));
  const h = (r == null ? void 0 : r.estados) ?? [],
    U = (r == null ? void 0 : r.urgentes) ?? [],
    A = l.useMemo(() => Math.max(...h.map((t) => t.cantidad), 1), [h]),
    R = l.useMemo(() => {
      var t;
      return a === 'URGENTES'
        ? U
        : a
          ? ((t = h.find((c) => c.estado === a)) == null ? void 0 : t.nvs) || []
          : [];
    }, [a, h, U]),
    [S, F] = l.useState({ s: 1, left: 0, top: 0 });
  l.useEffect(() => {
    const t = () => {
      const c = window.innerWidth,
        d = window.innerHeight,
        v = Math.min(c / 1920, d / 1080);
      F({ s: v, left: (c - 1920 * v) / 2, top: (d - 1080 * v) / 2 });
    };
    return (
      t(),
      window.addEventListener('resize', t),
      () => window.removeEventListener('resize', t)
    );
  }, []);
  const T = e.jsx('button', {
    onClick: () => s('/panel'),
    className:
      'absolute top-4 right-4 z-[71] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/15',
    children: '✕ Salir'
  });
  if (p && !r)
    return k.createPortal(
      e.jsxs('div', {
        className: 'fixed inset-0 z-[110] bg-[#0a0a0f] flex items-center justify-center',
        children: [
          T,
          e.jsxs('div', {
            className: 'text-center',
            children: [
              e.jsx('div', {
                className:
                  'w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-6'
              }),
              e.jsx('p', { className: 'text-gray-400 text-2xl', children: 'Cargando…' })
            ]
          })
        ]
      }),
      document.body
    );
  if (!r)
    return k.createPortal(
      e.jsxs('div', {
        className: 'fixed inset-0 z-[110] bg-[#0a0a0f] flex items-center justify-center p-8',
        children: [
          T,
          e.jsxs('div', {
            className: 'text-center max-w-lg',
            children: [
              e.jsx('p', {
                className: 'text-red-400 text-2xl font-semibold mb-2',
                children: 'No se pudo cargar'
              }),
              E &&
                e.jsx('p', {
                  className: 'text-gray-500 text-sm font-mono break-words',
                  children: E
                }),
              e.jsxs('p', {
                className: 'text-gray-600 text-sm mt-4',
                children: ['Reintentando cada ', V / 1e3, 's…']
              })
            ]
          })
        ]
      }),
      document.body
    );
  const { estados: _, total: C, urgentes: P } = r,
    M = _.length || 1,
    H = a === 'URGENTES' ? '#ef4444' : (a && I[a]) || '#6b7280',
    z = a === 'URGENTES' ? 'URGENTES' : a || '';
  return k.createPortal(
    e.jsxs('div', {
      className: 'fixed inset-0 z-[110] overflow-hidden bg-black',
      children: [
        T,
        e.jsxs('div', {
          className: 'overflow-hidden bg-[#0a0a0f] text-white flex flex-col p-5',
          style: {
            position: 'absolute',
            width: 1920,
            height: 1080,
            left: S.left,
            top: S.top,
            transform: `scale(${S.s})`,
            transformOrigin: 'top left',
            fontFamily: "'Inter', system-ui, sans-serif"
          },
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between mb-4 shrink-0',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-4',
                  children: [
                    e.jsx('div', {
                      className:
                        'w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-black text-xl tracking-tight',
                      children: 'PTM'
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('h1', {
                          className: 'text-2xl font-bold tracking-tight leading-tight',
                          children: 'Centro de Control Logístico'
                        }),
                        e.jsx('p', {
                          className: 'text-gray-500 text-xs mt-0.5',
                          children: 'PTM Health Care · Seguimiento en tiempo real'
                        })
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'flex items-center gap-6',
                  children: [
                    e.jsxs('button', {
                      onClick: () => j(a === 'URGENTES' ? null : 'URGENTES'),
                      className: `flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all ${P.length > 0 ? 'bg-red-500/15 border-glow-red' : 'bg-gray-800/40 border-2 border-gray-700/50'} ${a === 'URGENTES' ? 'ring-2 ring-red-400' : ''}`,
                      children: [
                        e.jsx('span', { className: 'text-2xl', children: '🚨' }),
                        e.jsxs('div', {
                          className: 'text-left',
                          children: [
                            e.jsx(O, {
                              end: P.length,
                              className: `text-3xl font-black tabular-nums leading-none ${P.length > 0 ? 'text-red-400' : 'text-gray-500'}`
                            }),
                            e.jsx('p', {
                              className: 'text-gray-400 text-[10px] font-medium',
                              children: 'Urgentes'
                            })
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'text-right',
                      children: [
                        e.jsx(O, {
                          end: C,
                          className: 'text-5xl font-black tabular-nums text-orange-400 leading-none'
                        }),
                        e.jsx('p', {
                          className: 'text-gray-500 text-xs font-medium mt-0.5',
                          children: 'NV activas'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'flex flex-col items-end gap-1 border-l border-gray-800 pl-5',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center gap-1.5',
                          children: [
                            e.jsx('span', {
                              className: 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'
                            }),
                            e.jsx('span', {
                              className: 'text-gray-300 text-xs font-semibold',
                              children: 'EN VIVO'
                            })
                          ]
                        }),
                        e.jsx('span', {
                          className: `text-[11px] font-medium ${o ? 'text-orange-400' : 'text-gray-600'}`,
                          children: o ? '▶ Auto-rotación' : '⏸ Pausado'
                        }),
                        e.jsx('span', {
                          className: 'text-gray-600 text-[10px] font-mono',
                          children: y
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex-1 flex gap-5 min-h-0 overflow-hidden',
              children: [
                e.jsxs('div', {
                  className: `flex flex-col justify-center transition-all ${a ? 'w-[45%]' : 'w-full'}`,
                  style: { gap: `${Math.min(14, Math.max(6, Math.floor(70 / M)))}px` },
                  children: [
                    _.map((t) => {
                      const c = A > 0 ? (t.cantidad / A) * 100 : 0,
                        d = I[t.estado] || '#6b7280',
                        v = L[t.estado] || '●',
                        K = C > 0 ? ((t.cantidad / C) * 100).toFixed(0) : '0',
                        $ = t.nvs.filter((B) => B.urgente).length,
                        W = a === t.estado,
                        q = Math.min(60, Math.max(36, Math.floor(520 / M)));
                      return e.jsxs(
                        'button',
                        {
                          onClick: () => j(a === t.estado ? null : t.estado),
                          className: `flex items-center gap-4 text-left rounded-xl transition-all shrink-0 px-3 py-1 ${W ? 'bg-white/[0.06] ring-2 ring-white/20 scale-[1.01]' : 'hover:bg-white/[0.03]'}`,
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-2 w-36 shrink-0 justify-end',
                              children: [
                                e.jsx('span', { className: 'text-lg', children: v }),
                                e.jsx('span', {
                                  className:
                                    'text-gray-200 text-sm font-semibold text-right truncate',
                                  children: t.estado
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              className:
                                'flex-1 bg-gray-800/40 rounded-lg overflow-hidden relative',
                              style: { height: q },
                              children: [
                                e.jsx('div', {
                                  className:
                                    'h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-between px-4',
                                  style: {
                                    width: `${Math.max(c, 5)}%`,
                                    background: `linear-gradient(90deg, ${d}, ${d}cc)`
                                  },
                                  children: e.jsx(O, {
                                    end: t.cantidad,
                                    className:
                                      'text-xl font-black text-white drop-shadow-lg tabular-nums'
                                  })
                                }),
                                $ > 0 &&
                                  e.jsxs('span', {
                                    className:
                                      'absolute right-12 top-1/2 -translate-y-1/2 text-[10px] text-red-400 font-bold flex items-center gap-0.5 animate-pulse',
                                    children: ['🚨 ', $]
                                  }),
                                e.jsxs('span', {
                                  className:
                                    'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold tabular-nums',
                                  children: [K, '%']
                                })
                              ]
                            })
                          ]
                        },
                        t.estado
                      );
                    }),
                    _.length === 0 &&
                      e.jsx('p', {
                        className: 'text-gray-600 text-2xl text-center',
                        children: 'Sin NVs activas'
                      })
                  ]
                }),
                a &&
                  e.jsxs('div', {
                    className:
                      'w-[55%] bg-[#111118] rounded-2xl border border-gray-800/60 flex flex-col min-h-0 overflow-hidden',
                    children: [
                      e.jsxs('div', {
                        className:
                          'flex items-center justify-between px-5 py-3.5 border-b border-gray-800/60 shrink-0',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-3',
                            children: [
                              e.jsx('div', {
                                className: 'w-4 h-4 rounded-full',
                                style: { background: H }
                              }),
                              e.jsx('h2', {
                                className: 'text-xl font-bold',
                                children:
                                  a === 'URGENTES' ? '🚨 NVs Urgentes' : `${L[a] || ''} ${a}`
                              }),
                              e.jsxs('span', {
                                className: 'text-gray-500 text-base font-medium',
                                children: ['(', R.length, ')']
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-3',
                            children: [
                              a !== 'URGENTES' &&
                                e.jsx('span', {
                                  className: 'text-gray-500 text-xs',
                                  children:
                                    a === n.EN_RUTA || a === n.CURRIER
                                      ? 'Destacado: transportista'
                                      : a === n.ENTREGADO
                                        ? 'Destacado: fecha entrega'
                                        : a === n.SHIPPING ||
                                            a === n.EN_PROCESO ||
                                            (a != null && a.startsWith('P /'))
                                          ? 'Días desde aprobación'
                                          : ''
                                }),
                              e.jsx('button', {
                                onClick: () => j(null),
                                className:
                                  'text-gray-500 hover:text-white text-2xl leading-none px-2 transition-colors',
                                children: '×'
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsx('div', {
                        className: 'flex-1 overflow-y-auto p-3 space-y-1.5',
                        children:
                          R.length === 0
                            ? e.jsx('p', {
                                className: 'text-gray-600 text-center py-8',
                                children: 'Sin NVs'
                              })
                            : R.map((t, c) =>
                                e.jsx(
                                  'div',
                                  {
                                    className: 'anim-list-item',
                                    style: { animationDelay: `${Math.min(c * 40, 400)}ms` },
                                    children: e.jsx(te, { n: t, estado: z })
                                  },
                                  `${t.canal}-${t.nv}-${c}`
                                )
                              )
                      })
                    ]
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
export { oe as default };
