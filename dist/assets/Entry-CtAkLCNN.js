import { u as H, c as X, j as e } from './query-vendor-BNjBrM5A.js';
import { r as n } from './react-vendor-6aw4XXjH.js';
import { u as Z, s as _, c as P } from './index-C8hdJ7IR.js';
import { u as ee, g as p } from './animation-vendor-JfdD7EdN.js';
import {
  aE as U,
  aw as ae,
  au as se,
  ag as q,
  aF as F,
  Y as te,
  a7 as B,
  Q as M,
  aG as re,
  an as le,
  t as m
} from './ui-vendor-naG2PYVT.js';
import { u as oe } from './useRealtimeTable-CSrOtoes.js';
import './supabase-vendor-4Fjsfb0a.js';
const be = () => {
  const { user: i } = Z(),
    G = H(),
    [l, b] = n.useState([]),
    [y, S] = n.useState(!0),
    [K, j] = n.useState(!1),
    [I, f] = n.useState(null),
    [O, C] = n.useState(null),
    R = n.useRef(null),
    L = n.useRef(null),
    T = n.useRef(null),
    v = n.useRef([]);
  oe('wms_putaway_ubicaciones', [['putaway_visual']]);
  const [o, g] = n.useState({
      ubicacion: '',
      codigo: '',
      serie: '',
      partida: '',
      pieza: '',
      fecha_vencimiento: '',
      talla: '',
      color: '',
      descripcion: ''
    }),
    $ = n.useRef(null);
  (ee(
    () => {
      p.from(R.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.out',
        clearProps: 'all'
      });
    },
    { scope: R }
  ),
    n.useEffect(() => {
      if (l.length > 0) {
        const a = v.current[0];
        a &&
          p.fromTo(
            a,
            { y: -20, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
          );
      }
    }, [l.length]),
    n.useEffect(() => {
      const a = () => S(!0),
        t = () => S(!1);
      return (
        window.addEventListener('online', a),
        window.addEventListener('offline', t),
        S(navigator.onLine),
        () => {
          (window.removeEventListener('online', a), window.removeEventListener('offline', t));
        }
      );
    }, []),
    n.useEffect(() => {
      const a = localStorage.getItem('wms_entry_queue');
      if (a)
        try {
          const t = JSON.parse(a);
          b(
            t.map((r) => {
              var c, x;
              return {
                ...r,
                id:
                  typeof r.id == 'string' &&
                  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                    r.id
                  )
                    ? r.id
                    : ((x = (c = globalThis.crypto) == null ? void 0 : c.randomUUID) == null
                        ? void 0
                        : x.call(c)) || `${Date.now()}-${Math.random()}`
              };
            })
          );
        } catch (t) {
          console.error('Entry data load error:', t);
        }
    }, []),
    n.useEffect(() => {
      localStorage.setItem('wms_entry_queue', JSON.stringify(l));
    }, [l]));
  const N = n.useRef(new Map()),
    w = n.useRef(null),
    k = n.useRef(null),
    h = n.useRef('');
  n.useEffect(() => {
    const a = o.codigo;
    if ((k.current && clearTimeout(k.current), !a || a.length < 3)) {
      (j(!1), h.current && !a && (g((t) => ({ ...t, descripcion: '' })), f(null)), (h.current = a));
      return;
    }
    if (a !== h.current) {
      if (N.current.has(a)) {
        const t = N.current.get(a);
        (g((r) => ({ ...r, descripcion: t || '' })),
          f(t ? null : 'SKU NO ENCONTRADO'),
          j(!1),
          (h.current = a));
        return;
      }
      return (
        (k.current = setTimeout(async () => {
          w.current && w.current.abort();
          const t = new AbortController();
          ((w.current = t), j(!0), f(null));
          try {
            const { data: r, error: c } = await _.from('tms_matriz_codigos')
              .select('producto')
              .eq('codigo_producto', a)
              .maybeSingle()
              .abortSignal(t.signal);
            if (t.signal.aborted) return;
            if (r != null && r.producto) {
              (N.current.set(a, r.producto),
                g((d) => (d.codigo === a ? { ...d, descripcion: r.producto } : d)),
                (h.current = a),
                j(!1));
              return;
            }
            const { data: x } = await _.from('wms_ubicaciones')
              .select('descripcion')
              .eq('codigo', a)
              .limit(1)
              .maybeSingle()
              .abortSignal(t.signal);
            if (t.signal.aborted) return;
            (x != null && x.descripcion
              ? (N.current.set(a, x.descripcion),
                g((d) => (d.codigo === a ? { ...d, descripcion: x.descripcion } : d)))
              : (N.current.set(a, ''),
                g((d) => (d.codigo === a ? { ...d, descripcion: '' } : d)),
                f('SKU NO ENCONTRADO')),
              (h.current = a));
          } catch (r) {
            if ((r == null ? void 0 : r.name) === 'AbortError') return;
            console.error('Desc lookup error:', r);
          } finally {
            t.signal.aborted || j(!1);
          }
        }, 400)),
        () => {
          (k.current && clearTimeout(k.current), w.current && w.current.abort());
        }
      );
    }
  }, [o.codigo]);
  const Q = async () => {
      if (!o.ubicacion || o.ubicacion.length < 3) {
        C(null);
        return;
      }
      try {
        const { data: a, error: t } = await _.from('wms_ubicaciones')
          .select('ubicacion')
          .eq('ubicacion', o.ubicacion)
          .limit(1)
          .maybeSingle();
        if (t) {
          console.error('Ubicacion validation error:', t);
          return;
        }
        C(a ? null : '⚠ Ubicación no registrada en el sistema');
      } catch (a) {
        console.error('Ubicacion validation error:', a);
      }
    },
    u = (a) => {
      const { name: t, value: r } = a.target;
      let c = r;
      (t === 'ubicacion'
        ? (c = r.toUpperCase().slice(0, 12))
        : t === 'codigo' && (c = r.toUpperCase().slice(0, 20)),
        g((x) => ({ ...x, [t]: c })));
    },
    V = (a) => {
      var r, c;
      if ((a.preventDefault(), !o.ubicacion || !o.codigo)) {
        (f('Faltan campos obligatorios (Ubicación y Código)'),
          p.to(L.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 }));
        return;
      }
      const t = {
        id:
          ((c = (r = globalThis.crypto) == null ? void 0 : r.randomUUID) == null
            ? void 0
            : c.call(r)) || `${Date.now()}-${Math.random()}`,
        ...o,
        timestamp: new Date().toISOString()
      };
      (b([t, ...l]),
        p.fromTo('.add-btn', { scale: 0.95 }, { scale: 1, duration: 0.2, ease: 'power2.out' }),
        g((x) => ({
          ...x,
          codigo: '',
          serie: '',
          partida: '',
          pieza: '',
          fecha_vencimiento: '',
          talla: '',
          color: '',
          descripcion: ''
        })),
        f(null),
        C(null),
        $.current && $.current.focus());
    },
    W = (a, t) => {
      const r = v.current[t];
      p.to(r, {
        x: 50,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          (b(l.filter((c) => c.id !== a)), p.set(r, { x: 0, opacity: 1 }));
        }
      });
    },
    J = () => {
      window.confirm('¿Limpiar toda la cola?') &&
        p.to(v.current, {
          y: 20,
          opacity: 0,
          stagger: 0.05,
          duration: 0.3,
          onComplete: () => b([])
        });
    },
    z = (a) =>
      a.map((t) => ({
        id: t.id,
        ubicacion: t.ubicacion,
        codigo: t.codigo,
        descripcion: t.descripcion || null,
        serie: t.serie || null,
        partida: t.partida || null,
        pieza: t.pieza || null,
        fecha_vencimiento: t.fecha_vencimiento || null,
        talla: t.talla || null,
        color: t.color || null,
        creado_por: (i == null ? void 0 : i.id) || null,
        creado_por_nombre: (i == null ? void 0 : i.nombre) || (i == null ? void 0 : i.email) || null
      })),
    A = X({
      mutationFn: async () => {
        const a = z(l),
          { error: t } = await _.from('wms_putaway_ubicaciones').insert(a);
        if (t) throw t;
        if (i)
          try {
            await _.from('tms_historial_cargas').insert([
              {
                usuario_id: i.id,
                usuario_nombre: i.nombre || i.email || 'Usuario Desconocido',
                modulo: 'Put Away visual',
                tabla_destino: 'wms_putaway_ubicaciones',
                registros_totales: l.length,
                registros_nuevos: l.length,
                registros_actualizados: 0,
                registros_error: 0
              }
            ]);
          } catch (r) {
            console.error('Entry operation error:', r);
          }
      },
      onSuccess: () => {
        (m.success(`✅ ${l.length} ubicaciones visuales guardadas. El inventario no cambió.`),
          p.to(T.current, { y: 10, duration: 0.1, yoyo: !0, repeat: 1 }),
          b([]),
          G.invalidateQueries({ queryKey: ['putaway_visual'] }));
      },
      onError: async (a) => {
        var r, c, x;
        if (
          !navigator.onLine ||
          ((r = a.message) == null ? void 0 : r.includes('Failed to fetch')) ||
          ((c = a.message) == null ? void 0 : c.includes('NetworkError')) ||
          ((x = a.message) == null ? void 0 : x.includes('ERR_INTERNET_DISCONNECTED')) ||
          a.code === 'PGRST301'
        )
          try {
            const d = z(l);
            (await P({
              tableName: 'wms_putaway_ubicaciones',
              data: d,
              onConflict: 'id',
              userId: (i == null ? void 0 : i.id) || null
            }))
              ? (m.info(
                  `📦 ${l.length} registros guardados offline. Se sincronizarán al recuperar conexión.`,
                  { duration: 6e3 }
                ),
                b([]))
              : m.error('Cola offline llena. No se pudieron guardar los datos.');
          } catch (d) {
            (console.error('[Entry] Error al encolar offline:', d),
              m.error('Error al guardar offline: ' + d.message));
          }
        else m.error('Error al guardar: ' + a.message);
      }
    }),
    Y = async () => {
      if (
        l.length !== 0 &&
        window.confirm(`¿Guardar ${l.length} ubicaciones visuales? El inventario no se modificará.`)
      ) {
        if (!navigator.onLine) {
          try {
            const a = z(l);
            (await P({
              tableName: 'wms_putaway_ubicaciones',
              data: a,
              onConflict: 'id',
              userId: (i == null ? void 0 : i.id) || null
            }))
              ? (m.info(
                  `📦 ${l.length} registros guardados offline. Se sincronizarán automáticamente.`,
                  { duration: 6e3 }
                ),
                b([]))
              : m.error('Cola offline llena. Conecta a internet para sincronizar.');
          } catch (a) {
            (console.error('[Entry] Error al encolar offline:', a),
              m.error('Error al guardar offline: ' + a.message));
          }
          return;
        }
        A.mutate();
      }
    },
    D = !!(o.ubicacion && o.codigo),
    E = ['serie', 'partida', 'pieza', 'fecha_vencimiento', 'talla', 'color'].filter(
      (a) => !!o[a]
    ).length,
    s = {
      navy: '#0D1B2A',
      blue: '#163D63',
      slate: '#475569',
      soft: '#E2E8F0',
      orange: '#FF6D00',
      amber: '#FFB26B'
    };
  return e.jsx('div', {
    ref: R,
    className: 'min-h-screen bg-slate-50 px-3 pb-20 pt-3 text-slate-700 sm:px-6 sm:pt-6',
    children: e.jsxs('div', {
      className: 'mx-auto max-w-[1680px] space-y-4 sm:space-y-6',
      children: [
        e.jsxs('div', {
          className:
            'relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.35)] sm:p-6 md:p-8',
          children: [
            e.jsx('div', {
              className: 'absolute inset-x-0 top-0 h-1',
              style: {
                background: `linear-gradient(90deg, ${s.navy} 0%, ${s.blue} 35%, ${s.orange} 72%, ${s.amber} 100%)`
              }
            }),
            e.jsx('div', {
              className: 'absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl',
              style: { background: `${s.orange}14` }
            }),
            e.jsxs('div', {
              className:
                'relative z-10 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between',
              children: [
                e.jsxs('div', {
                  className: 'flex items-start gap-4',
                  children: [
                    e.jsx('div', {
                      className:
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-[0_20px_35px_-28px_rgba(13,27,42,0.75)]',
                      style: {
                        borderColor: `${s.blue}30`,
                        background: `linear-gradient(135deg, ${s.navy} 0%, ${s.blue} 100%)`,
                        color: '#fff'
                      },
                      children: e.jsx(U, { size: 28, strokeWidth: 2.4 })
                    }),
                    e.jsxs('div', {
                      className: 'space-y-3',
                      children: [
                        e.jsxs('div', {
                          className:
                            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]',
                          style: {
                            border: `1px solid ${s.soft}`,
                            background: '#fff',
                            color: s.slate
                          },
                          children: [
                            e.jsx('span', {
                              className: 'rounded-md px-2 py-0.5 text-[9px] text-white',
                              style: { background: s.orange },
                              children: 'SYSTEM'
                            }),
                            'CCO OPERACIONAL'
                          ]
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsxs('h2', {
                              className: 'text-2xl font-black tracking-tight sm:text-4xl',
                              style: { color: s.navy },
                              children: [
                                'Ingreso de ',
                                e.jsx('span', { style: { color: s.orange }, children: 'Mercancía' })
                              ]
                            }),
                            e.jsx('p', {
                              className: 'mt-1 text-sm font-medium sm:text-base',
                              style: { color: s.slate },
                              children:
                                'Centro Control Operacional. Registra entradas en ubicaciones, valida SKU y consolida la cola antes del guardado final.'
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'grid gap-3 sm:grid-cols-3 xl:min-w-[620px]',
                  children: [
                    e.jsxs('div', {
                      className: 'rounded-2xl border border-slate-200 bg-slate-50/80 p-4',
                      children: [
                        e.jsx('div', {
                          className: 'text-[11px] font-bold uppercase tracking-[0.18em]',
                          style: { color: s.slate },
                          children: 'Estado'
                        }),
                        e.jsxs('div', {
                          className: `mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${y ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`,
                          children: [
                            y ? e.jsx(ae, { size: 14 }) : e.jsx(se, { size: 14 }),
                            y ? 'Sistema en línea' : 'Sin conexión'
                          ]
                        }),
                        e.jsx('p', {
                          className: 'mt-3 text-xs text-slate-500',
                          children: y
                            ? 'Las asignaciones visuales se enviarán a Supabase al guardar.'
                            : 'Se usará la cola offline y se sincronizará al recuperar conexión.'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'rounded-2xl border border-slate-200 bg-slate-50/80 p-4',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400',
                          children: 'Cola actual'
                        }),
                        e.jsxs('div', {
                          className: 'mt-2 flex items-end gap-2',
                          children: [
                            e.jsx('span', {
                              className: 'text-3xl font-black tracking-tight text-slate-900',
                              children: l.length
                            }),
                            e.jsx('span', {
                              className: 'pb-1 text-xs font-semibold text-slate-400',
                              children: 'registros'
                            })
                          ]
                        }),
                        e.jsx('p', {
                          className: 'mt-3 text-xs text-slate-500',
                          children:
                            l.length > 0
                              ? 'Asignaciones visuales listas para guardar sin cambiar el inventario.'
                              : 'La cola está limpia y lista para una nueva captura.'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'rounded-2xl border border-slate-200 bg-slate-50/80 p-4',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400',
                          children: 'Captura'
                        }),
                        e.jsxs('div', {
                          className:
                            'mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700',
                          children: [
                            D
                              ? e.jsx(U, { size: 14, className: 'text-emerald-600' })
                              : e.jsx(q, { size: 14, className: 'text-amber-500' }),
                            D ? 'Lista para agregar' : 'Completa obligatorios'
                          ]
                        }),
                        e.jsxs('p', {
                          className: 'mt-3 text-xs text-slate-500',
                          children: [
                            E,
                            ' detalle',
                            E === 1 ? '' : 's',
                            ' opcional',
                            E === 1 ? '' : 'es',
                            ' cargado',
                            E === 1 ? '' : 's',
                            '.'
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
        e.jsxs('div', {
          className: 'grid grid-cols-1 gap-4 xl:grid-cols-[430px_minmax(0,1fr)] xl:gap-6',
          children: [
            e.jsx('div', {
              className: 'space-y-4',
              children: e.jsxs('div', {
                className:
                  'rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.35)] sm:p-6',
                children: [
                  e.jsxs('div', {
                    className: 'mb-5 flex items-start justify-between gap-3',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('div', {
                            className:
                              'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                            style: {
                              border: `1px solid ${s.soft}`,
                              background: `${s.blue}08`,
                              color: s.blue
                            },
                            children: 'Paso 1'
                          }),
                          e.jsx('h3', {
                            className: 'mt-3 text-lg font-black tracking-tight sm:text-xl',
                            style: { color: s.navy },
                            children: 'Datos del producto'
                          }),
                          e.jsx('p', {
                            className: 'mt-1 text-sm',
                            style: { color: s.slate },
                            children:
                              'Asigna una ubicación visual al SKU. Este flujo no descuenta ni modifica cantidades de inventario.'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'rounded-2xl px-3 py-2 text-right',
                        style: { border: `1px solid ${s.soft}`, background: `${s.orange}08` },
                        children: [
                          e.jsx('div', {
                            className: 'text-[11px] font-bold uppercase tracking-[0.18em]',
                            style: { color: s.slate },
                            children: 'Flujo'
                          }),
                          e.jsx('div', {
                            className: 'mt-1 text-sm font-black',
                            style: { color: s.navy },
                            children: 'Put Away'
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsxs('form', {
                    ref: L,
                    onSubmit: V,
                    className: 'space-y-5',
                    children: [
                      e.jsxs('div', {
                        className: 'grid grid-cols-2 gap-3 rounded-2xl p-3',
                        style: { border: `1px solid ${s.soft}`, background: `${s.blue}06` },
                        children: [
                          e.jsxs('div', {
                            className: 'rounded-2xl bg-white px-3 py-3 shadow-sm',
                            children: [
                              e.jsx('div', {
                                className: 'text-[10px] font-bold uppercase tracking-[0.18em]',
                                style: { color: s.slate },
                                children: 'Ubicación'
                              }),
                              e.jsx('div', {
                                className: 'mt-2 truncate text-sm font-black',
                                style: { color: s.navy },
                                children: o.ubicacion || 'Pendiente'
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'rounded-2xl bg-white px-3 py-3 shadow-sm',
                            children: [
                              e.jsx('div', {
                                className: 'text-[10px] font-bold uppercase tracking-[0.18em]',
                                style: { color: s.slate },
                                children: 'SKU'
                              }),
                              e.jsx('div', {
                                className: 'mt-2 truncate text-sm font-black',
                                style: { color: s.navy },
                                children: o.codigo || 'Pendiente'
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsxs('label', {
                            className:
                              'block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider',
                            children: [
                              'Ubicación ',
                              e.jsx('span', { className: 'text-wms-danger', children: '*' }),
                              ' (RACK-POS-NIVEL)'
                            ]
                          }),
                          e.jsx('div', {
                            className: 'flex gap-2',
                            children: e.jsxs('div', {
                              className: 'relative group/input flex-1',
                              children: [
                                e.jsx('input', {
                                  type: 'text',
                                  name: 'ubicacion',
                                  className:
                                    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-lg font-bold uppercase outline-none transition-all placeholder:text-slate-400 focus:bg-white',
                                  style: { color: s.navy },
                                  placeholder: 'AA-01-01A',
                                  value: o.ubicacion,
                                  onChange: u,
                                  onBlur: Q,
                                  maxLength: 12,
                                  required: !0,
                                  autoFocus: !0
                                }),
                                e.jsx(F, {
                                  className:
                                    'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                                  style: { color: s.slate },
                                  size: 20
                                })
                              ]
                            })
                          }),
                          O &&
                            e.jsxs('div', {
                              className:
                                'mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2 text-xs text-amber-700 font-medium',
                              children: [
                                e.jsx(te, { size: 14, className: 'text-amber-500 shrink-0' }),
                                O
                              ]
                            })
                        ]
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsxs('label', {
                            className:
                              'block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider',
                            children: [
                              'Código ',
                              e.jsx('span', { className: 'text-wms-danger', children: '*' }),
                              ' (Max 20)'
                            ]
                          }),
                          e.jsx('div', {
                            className: 'flex gap-2',
                            children: e.jsxs('div', {
                              className: 'relative group/input flex-1',
                              children: [
                                e.jsx('input', {
                                  ref: $,
                                  type: 'text',
                                  name: 'codigo',
                                  className:
                                    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-lg font-bold uppercase outline-none transition-all placeholder:text-slate-400 focus:bg-white',
                                  style: { color: s.navy },
                                  placeholder: 'SKU-123...',
                                  value: o.codigo,
                                  onChange: u,
                                  maxLength: 20,
                                  required: !0
                                }),
                                K
                                  ? e.jsx(B, {
                                      className:
                                        'loading-spinner absolute right-3 top-1/2 -translate-y-1/2',
                                      style: { color: s.orange },
                                      size: 20
                                    })
                                  : e.jsx(F, {
                                      className:
                                        'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                                      style: { color: s.slate },
                                      size: 20
                                    })
                              ]
                            })
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            className:
                              'block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider',
                            children: 'Descripción (Automático)'
                          }),
                          e.jsx('textarea', {
                            name: 'descripcion',
                            rows: '2',
                            className:
                              'desc-field w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold transition-colors focus:outline-none',
                            style: { color: s.slate },
                            placeholder: 'Se llenará automáticamente...',
                            value: o.descripcion,
                            readOnly: !0,
                            tabIndex: '-1'
                          })
                        ]
                      }),
                      e.jsx('div', {
                        className: 'rounded-[1.5rem] p-4',
                        style: { border: `1px solid ${s.soft}`, background: `${s.blue}06` },
                        children: e.jsxs('div', {
                          className: 'grid grid-cols-2 gap-3 sm:gap-4',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                                  children: 'Serie'
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  name: 'serie',
                                  value: o.serie,
                                  onChange: u,
                                  className:
                                    'w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none placeholder:text-slate-400',
                                  style: { color: s.navy },
                                  placeholder: 'S/N...'
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                                  children: 'Partida'
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  name: 'partida',
                                  value: o.partida,
                                  onChange: u,
                                  className:
                                    'w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none placeholder:text-slate-400',
                                  style: { color: s.navy },
                                  placeholder: 'Lote...'
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                                  children: 'Pieza'
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  name: 'pieza',
                                  value: o.pieza,
                                  onChange: u,
                                  className:
                                    'w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none placeholder:text-slate-400',
                                  style: { color: s.navy },
                                  placeholder: 'Ej: Motor...'
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                                  children: 'Vencimiento'
                                }),
                                e.jsx('div', {
                                  className: 'relative',
                                  children: e.jsx('input', {
                                    type: 'date',
                                    name: 'fecha_vencimiento',
                                    value: o.fecha_vencimiento,
                                    onChange: u,
                                    className:
                                      'w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none',
                                    style: { color: s.navy }
                                  })
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                                  children: 'Talla'
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  name: 'talla',
                                  value: o.talla,
                                  onChange: u,
                                  className:
                                    'w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none placeholder:text-slate-400',
                                  style: { color: s.navy },
                                  placeholder: 'S, M, L...'
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                                  children: 'Color'
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  name: 'color',
                                  value: o.color,
                                  onChange: u,
                                  className:
                                    'w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none placeholder:text-slate-400',
                                  style: { color: s.navy },
                                  placeholder: 'Rojo...'
                                })
                              ]
                            })
                          ]
                        })
                      }),
                      I &&
                        e.jsxs('div', {
                          className:
                            'p-3 bg-wms-danger/10 border border-wms-danger/30 rounded-lg flex items-center gap-2 text-sm text-wms-danger',
                          children: [e.jsx(q, { size: 16 }), I]
                        }),
                      e.jsxs('button', {
                        className:
                          'add-btn mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-black text-white shadow-[0_22px_40px_-24px_rgba(13,27,42,0.85)] transition-all active:scale-95 sm:text-lg',
                        style: {
                          background: `linear-gradient(135deg, ${s.navy} 0%, ${s.blue} 46%, ${s.orange} 100%)`
                        },
                        children: [
                          e.jsx(U, { size: 24 }),
                          e.jsx('span', { children: 'AGREGAR A COLA' })
                        ]
                      })
                    ]
                  })
                ]
              })
            }),
            e.jsx('div', {
              className: 'min-w-0',
              children: e.jsxs('div', {
                ref: T,
                className:
                  'flex h-[560px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_22px_55px_-38px_rgba(15,23,42,0.35)] sm:h-[760px]',
                children: [
                  e.jsx('div', {
                    className: 'border-b border-slate-200 bg-white p-5 sm:p-6',
                    children: e.jsxs('div', {
                      className:
                        'flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('div', {
                              className:
                                'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                              style: {
                                border: `1px solid ${s.soft}`,
                                background: `${s.blue}08`,
                                color: s.blue
                              },
                              children: 'Paso 2'
                            }),
                            e.jsx('h3', {
                              className: 'mt-3 text-lg font-black tracking-tight sm:text-xl',
                              style: { color: s.navy },
                              children: 'Cola de procesamiento'
                            }),
                            e.jsx('p', {
                              className: 'mt-1 text-sm',
                              style: { color: s.slate },
                              children:
                                'Revisa las asignaciones visuales antes de guardarlas. El stock no cambia.'
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          className: 'grid gap-3 sm:grid-cols-2',
                          children: [
                            e.jsxs('div', {
                              className:
                                'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3',
                              children: [
                                e.jsx('div', {
                                  className:
                                    'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400',
                                  children: 'Registros'
                                }),
                                e.jsx('div', {
                                  className: 'mt-1 text-2xl font-black text-slate-900',
                                  children: l.length
                                })
                              ]
                            }),
                            e.jsxs('button', {
                              onClick: J,
                              disabled: l.length === 0,
                              className:
                                'inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50',
                              children: [e.jsx(M, { size: 15 }), 'Vaciar todo']
                            })
                          ]
                        })
                      ]
                    })
                  }),
                  e.jsx('div', {
                    className: 'flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-5',
                    children:
                      l.length === 0
                        ? e.jsxs('div', {
                            className:
                              'flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 px-6 text-center text-slate-500',
                            children: [
                              e.jsx('div', {
                                className:
                                  'mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-50',
                                children: e.jsx(re, { size: 44, className: 'opacity-25' })
                              }),
                              e.jsx('p', {
                                className: 'text-xl font-black text-slate-900',
                                children: 'La cola está vacía'
                              }),
                              e.jsx('p', {
                                className: 'mt-2 max-w-md text-sm',
                                children:
                                  'Agrega productos desde el formulario para asignar una ubicación visual. El stock no cambia.'
                              })
                            ]
                          })
                        : ((v.current = []), null) ||
                          e.jsx('div', {
                            className: 'space-y-3',
                            children: l.map((a, t) =>
                              e.jsx(
                                'div',
                                {
                                  ref: (r) => {
                                    r && (v.current[t] = r);
                                  },
                                  className:
                                    'group rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-[0_18px_40px_-32px_rgba(13,27,42,0.32)]',
                                  children: e.jsxs('div', {
                                    className:
                                      'flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'flex min-w-0 gap-4',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white',
                                            style: {
                                              background: `linear-gradient(135deg, ${s.blue} 0%, ${s.orange} 100%)`
                                            },
                                            children: l.length - t
                                          }),
                                          e.jsxs('div', {
                                            className: 'min-w-0 flex-1',
                                            children: [
                                              e.jsxs('div', {
                                                className:
                                                  'grid gap-3 md:grid-cols-2 xl:grid-cols-3',
                                                children: [
                                                  e.jsxs('div', {
                                                    className: 'min-w-0',
                                                    children: [
                                                      e.jsx('p', {
                                                        className:
                                                          'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400',
                                                        children: 'Ubicación'
                                                      }),
                                                      e.jsx('p', {
                                                        className:
                                                          'mt-1 truncate font-mono text-lg font-black text-slate-900',
                                                        children: a.ubicacion
                                                      })
                                                    ]
                                                  }),
                                                  e.jsxs('div', {
                                                    className: 'min-w-0',
                                                    children: [
                                                      e.jsx('p', {
                                                        className:
                                                          'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400',
                                                        children: 'Código'
                                                      }),
                                                      e.jsx('p', {
                                                        className:
                                                          'mt-1 truncate font-mono text-lg font-black',
                                                        style: { color: s.orange },
                                                        children: a.codigo
                                                      }),
                                                      a.descripcion &&
                                                        e.jsx('p', {
                                                          className:
                                                            'mt-1 truncate text-xs text-slate-500',
                                                          children: a.descripcion
                                                        })
                                                    ]
                                                  }),
                                                  e.jsxs('div', {
                                                    children: [
                                                      e.jsx('p', {
                                                        className:
                                                          'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400',
                                                        children: 'Captura'
                                                      }),
                                                      e.jsx('p', {
                                                        className:
                                                          'mt-1 text-sm font-semibold text-slate-500',
                                                        children: new Date(
                                                          a.timestamp
                                                        ).toLocaleTimeString('es-CL', {
                                                          hour: '2-digit',
                                                          minute: '2-digit'
                                                        })
                                                      })
                                                    ]
                                                  })
                                                ]
                                              }),
                                              (a.serie ||
                                                a.partida ||
                                                a.pieza ||
                                                a.fecha_vencimiento ||
                                                a.talla ||
                                                a.color) &&
                                                e.jsxs('div', {
                                                  className: 'mt-3 flex flex-wrap gap-2',
                                                  children: [
                                                    a.serie &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border px-2.5 py-1 text-[11px] font-bold',
                                                        style: {
                                                          borderColor: `${s.blue}25`,
                                                          background: `${s.blue}10`,
                                                          color: s.blue
                                                        },
                                                        children: ['Serie: ', a.serie]
                                                      }),
                                                    a.partida &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700',
                                                        children: ['Partida: ', a.partida]
                                                      }),
                                                    a.pieza &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600',
                                                        children: ['Pieza: ', a.pieza]
                                                      }),
                                                    a.fecha_vencimiento &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700',
                                                        children: ['Vence: ', a.fecha_vencimiento]
                                                      }),
                                                    a.talla &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600',
                                                        children: ['Talla: ', a.talla]
                                                      }),
                                                    a.color &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600',
                                                        children: ['Color: ', a.color]
                                                      })
                                                  ]
                                                })
                                            ]
                                          })
                                        ]
                                      }),
                                      e.jsx('button', {
                                        onClick: () => W(a.id, t),
                                        className:
                                          'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700',
                                        children: e.jsx(M, { size: 18 })
                                      })
                                    ]
                                  })
                                },
                                a.id
                              )
                            )
                          })
                  }),
                  e.jsxs('div', {
                    className: 'border-t border-slate-200 bg-white p-5 sm:p-6',
                    children: [
                      e.jsx('button', {
                        onClick: Y,
                        disabled: l.length === 0 || A.isPending,
                        className:
                          'flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-lg font-black text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_22px_40px_-24px_rgba(13,27,42,0.85)]',
                        style: {
                          background: `linear-gradient(135deg, ${s.navy} 0%, ${s.blue} 50%, ${s.orange} 100%)`
                        },
                        children: A.isPending
                          ? e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(B, { size: 24, className: 'animate-spin' }),
                                ' GUARDANDO...'
                              ]
                            })
                          : e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(le, { size: 24 }),
                                ' GUARDAR UBICACIONES VISUALES (',
                                l.length,
                                ')'
                              ]
                            })
                      }),
                      e.jsx('p', {
                        className: 'mt-3 text-center text-xs text-slate-400',
                        children: y
                          ? 'Se guardará una referencia visual. No se descuenta ni modifica stock.'
                          : 'Se guardará en la cola offline como referencia visual para sincronización posterior.'
                      })
                    ]
                  })
                ]
              })
            })
          ]
        })
      ]
    })
  });
};
export { be as default };
