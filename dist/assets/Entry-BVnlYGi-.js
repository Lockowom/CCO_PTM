import { u as Y, c as H, j as e } from './query-vendor-BNjBrM5A.js';
import { r as i } from './react-vendor-6aw4XXjH.js';
import { u as X, s as w, c as L } from './index-Cm4s-gCR.js';
import { u as Z, g as u } from './animation-vendor-JfdD7EdN.js';
import {
  aE as z,
  aw as ee,
  au as se,
  ag as q,
  aF as P,
  Y as ae,
  a7 as F,
  Q as B,
  aG as te,
  an as re,
  t as x
} from './ui-vendor-CTbhg6u_.js';
import { u as le } from './useRealtimeTable-CNfBCB1j.js';
import './supabase-vendor-4Fjsfb0a.js';
const me = () => {
  const { user: c } = X(),
    G = Y(),
    [l, p] = i.useState([]),
    [b, E] = i.useState(!0),
    [K, h] = i.useState(!1),
    [A, g] = i.useState(null),
    [U, _] = i.useState(null),
    S = i.useRef(null),
    I = i.useRef(null),
    O = i.useRef(null),
    y = i.useRef([]);
  le('wms_putaway_ubicaciones', [['putaway_visual']]);
  const [d, m] = i.useState({
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
    C = i.useRef(null);
  (Z(
    () => {
      u.from(S.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.out',
        clearProps: 'all'
      });
    },
    { scope: S }
  ),
    i.useEffect(() => {
      if (l.length > 0) {
        const s = y.current[0];
        s &&
          u.fromTo(
            s,
            { y: -20, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
          );
      }
    }, [l.length]),
    i.useEffect(() => {
      const s = () => E(!0),
        t = () => E(!1);
      return (
        window.addEventListener('online', s),
        window.addEventListener('offline', t),
        E(navigator.onLine),
        () => {
          (window.removeEventListener('online', s), window.removeEventListener('offline', t));
        }
      );
    }, []),
    i.useEffect(() => {
      const s = localStorage.getItem('wms_entry_queue');
      if (s)
        try {
          const t = JSON.parse(s);
          p(
            t.map((r) => {
              var o, n;
              return {
                ...r,
                id:
                  typeof r.id == 'string' &&
                  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                    r.id
                  )
                    ? r.id
                    : ((n = (o = globalThis.crypto) == null ? void 0 : o.randomUUID) == null
                        ? void 0
                        : n.call(o)) || `${Date.now()}-${Math.random()}`
              };
            })
          );
        } catch (t) {
          console.error('Entry data load error:', t);
        }
    }, []),
    i.useEffect(() => {
      localStorage.setItem('wms_entry_queue', JSON.stringify(l));
    }, [l]));
  const j = i.useRef(new Map()),
    v = i.useRef(null),
    N = i.useRef(null),
    f = i.useRef('');
  i.useEffect(() => {
    const s = d.codigo;
    if ((N.current && clearTimeout(N.current), !s || s.length < 3)) {
      (h(!1), f.current && !s && (m((t) => ({ ...t, descripcion: '' })), g(null)), (f.current = s));
      return;
    }
    if (s !== f.current) {
      if (j.current.has(s)) {
        const t = j.current.get(s);
        (m((r) => ({ ...r, descripcion: t || '' })),
          g(t ? null : 'SKU NO ENCONTRADO'),
          h(!1),
          (f.current = s));
        return;
      }
      return (
        (N.current = setTimeout(async () => {
          v.current && v.current.abort();
          const t = new AbortController();
          ((v.current = t), h(!0), g(null));
          try {
            const { data: r } = await w
              .from('tms_matriz_codigos')
              .select('producto')
              .eq('codigo_producto', s)
              .maybeSingle()
              .abortSignal(t.signal);
            if (t.signal.aborted) return;
            if (r != null && r.producto) {
              (j.current.set(s, r.producto),
                m((n) => (n.codigo === s ? { ...n, descripcion: r.producto } : n)),
                (f.current = s),
                h(!1));
              return;
            }
            const { data: o } = await w
              .from('wms_ubicaciones')
              .select('descripcion')
              .eq('codigo', s)
              .limit(1)
              .maybeSingle()
              .abortSignal(t.signal);
            if (t.signal.aborted) return;
            (o != null && o.descripcion
              ? (j.current.set(s, o.descripcion),
                m((n) => (n.codigo === s ? { ...n, descripcion: o.descripcion } : n)))
              : (j.current.set(s, ''),
                m((n) => (n.codigo === s ? { ...n, descripcion: '' } : n)),
                g('SKU NO ENCONTRADO')),
              (f.current = s));
          } catch (r) {
            if ((r == null ? void 0 : r.name) === 'AbortError') return;
            console.error('Desc lookup error:', r);
          } finally {
            t.signal.aborted || h(!1);
          }
        }, 400)),
        () => {
          (N.current && clearTimeout(N.current), v.current && v.current.abort());
        }
      );
    }
  }, [d.codigo]);
  const M = async () => {
      if (!d.ubicacion || d.ubicacion.length < 3) {
        _(null);
        return;
      }
      try {
        const { data: s, error: t } = await w
          .from('wms_ubicaciones')
          .select('ubicacion')
          .eq('ubicacion', d.ubicacion)
          .limit(1)
          .maybeSingle();
        if (t) {
          console.error('Ubicacion validation error:', t);
          return;
        }
        _(s ? null : '⚠ Ubicación no registrada en el sistema');
      } catch (s) {
        console.error('Ubicacion validation error:', s);
      }
    },
    D = (s) => {
      const { name: t, value: r } = s.target;
      let o = r;
      (t === 'ubicacion'
        ? (o = r.toUpperCase().slice(0, 12))
        : t === 'codigo' && (o = r.toUpperCase().slice(0, 20)),
        m((n) => ({ ...n, [t]: o })));
    },
    Q = (s) => {
      var r, o;
      if ((s.preventDefault(), !d.ubicacion || !d.codigo)) {
        (g('Faltan campos obligatorios (Ubicación y Código)'),
          u.to(I.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 }));
        return;
      }
      const t = {
        id:
          ((o = (r = globalThis.crypto) == null ? void 0 : r.randomUUID) == null
            ? void 0
            : o.call(r)) || `${Date.now()}-${Math.random()}`,
        ...d,
        timestamp: new Date().toISOString()
      };
      (p([t, ...l]),
        u.fromTo('.add-btn', { scale: 0.95 }, { scale: 1, duration: 0.2, ease: 'power2.out' }),
        m((n) => ({
          ...n,
          codigo: '',
          serie: '',
          partida: '',
          pieza: '',
          fecha_vencimiento: '',
          talla: '',
          color: '',
          descripcion: ''
        })),
        g(null),
        _(null),
        C.current && C.current.focus());
    },
    V = (s, t) => {
      const r = y.current[t];
      u.to(r, {
        x: 50,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          (p(l.filter((o) => o.id !== s)), u.set(r, { x: 0, opacity: 1 }));
        }
      });
    },
    W = () => {
      window.confirm('¿Limpiar toda la cola?') &&
        u.to(y.current, {
          y: 20,
          opacity: 0,
          stagger: 0.05,
          duration: 0.3,
          onComplete: () => p([])
        });
    },
    R = (s) =>
      s.map((t) => ({
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
        creado_por: (c == null ? void 0 : c.id) || null,
        creado_por_nombre: (c == null ? void 0 : c.nombre) || (c == null ? void 0 : c.email) || null
      })),
    $ = H({
      mutationFn: async () => {
        const s = R(l),
          { error: t } = await w.from('wms_putaway_ubicaciones').insert(s);
        if (t) throw t;
        if (c)
          try {
            await w
              .from('tms_historial_cargas')
              .insert([
                {
                  usuario_id: c.id,
                  usuario_nombre: c.nombre || c.email || 'Usuario Desconocido',
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
        (x.success(`✅ ${l.length} ubicaciones visuales guardadas. El inventario no cambió.`),
          u.to(O.current, { y: 10, duration: 0.1, yoyo: !0, repeat: 1 }),
          p([]),
          G.invalidateQueries({ queryKey: ['putaway_visual'] }));
      },
      onError: async (s) => {
        var r, o, n;
        if (
          !navigator.onLine ||
          ((r = s.message) == null ? void 0 : r.includes('Failed to fetch')) ||
          ((o = s.message) == null ? void 0 : o.includes('NetworkError')) ||
          ((n = s.message) == null ? void 0 : n.includes('ERR_INTERNET_DISCONNECTED')) ||
          s.code === 'PGRST301'
        )
          try {
            const k = R(l);
            (await L({
              tableName: 'wms_putaway_ubicaciones',
              data: k,
              onConflict: 'id',
              userId: (c == null ? void 0 : c.id) || null
            }))
              ? (x.info(
                  `📦 ${l.length} registros guardados offline. Se sincronizarán al recuperar conexión.`,
                  { duration: 6e3 }
                ),
                p([]))
              : x.error('Cola offline llena. No se pudieron guardar los datos.');
          } catch (k) {
            (console.error('[Entry] Error al encolar offline:', k),
              x.error('Error al guardar offline: ' + k.message));
          }
        else x.error('Error al guardar: ' + s.message);
      }
    }),
    J = async () => {
      if (
        l.length !== 0 &&
        window.confirm(`¿Guardar ${l.length} ubicaciones visuales? El inventario no se modificará.`)
      ) {
        if (!navigator.onLine) {
          try {
            const s = R(l);
            (await L({
              tableName: 'wms_putaway_ubicaciones',
              data: s,
              onConflict: 'id',
              userId: (c == null ? void 0 : c.id) || null
            }))
              ? (x.info(
                  `📦 ${l.length} registros guardados offline. Se sincronizarán automáticamente.`,
                  { duration: 6e3 }
                ),
                p([]))
              : x.error('Cola offline llena. Conecta a internet para sincronizar.');
          } catch (s) {
            (console.error('[Entry] Error al encolar offline:', s),
              x.error('Error al guardar offline: ' + s.message));
          }
          return;
        }
        $.mutate();
      }
    },
    T = !!(d.ubicacion && d.codigo),
    a = {
      navy: '#0D1B2A',
      blue: '#163D63',
      slate: '#475569',
      soft: '#E2E8F0',
      orange: '#FF6D00',
      amber: '#FFB26B'
    };
  return e.jsx('div', {
    ref: S,
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
                background: `linear-gradient(90deg, ${a.navy} 0%, ${a.blue} 35%, ${a.orange} 72%, ${a.amber} 100%)`
              }
            }),
            e.jsx('div', {
              className: 'absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl',
              style: { background: `${a.orange}14` }
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
                        borderColor: `${a.blue}30`,
                        background: `linear-gradient(135deg, ${a.navy} 0%, ${a.blue} 100%)`,
                        color: '#fff'
                      },
                      children: e.jsx(z, { size: 28, strokeWidth: 2.4 })
                    }),
                    e.jsxs('div', {
                      className: 'space-y-3',
                      children: [
                        e.jsxs('div', {
                          className:
                            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]',
                          style: {
                            border: `1px solid ${a.soft}`,
                            background: '#fff',
                            color: a.slate
                          },
                          children: [
                            e.jsx('span', {
                              className: 'rounded-md px-2 py-0.5 text-[9px] text-white',
                              style: { background: a.orange },
                              children: 'SYSTEM'
                            }),
                            'CCO OPERACIONAL'
                          ]
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsxs('h2', {
                              className: 'text-2xl font-black tracking-tight sm:text-4xl',
                              style: { color: a.navy },
                              children: [
                                'Ingreso de ',
                                e.jsx('span', { style: { color: a.orange }, children: 'Mercancía' })
                              ]
                            }),
                            e.jsx('p', {
                              className: 'mt-1 text-sm font-medium sm:text-base',
                              style: { color: a.slate },
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
                          style: { color: a.slate },
                          children: 'Estado'
                        }),
                        e.jsxs('div', {
                          className: `mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${b ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`,
                          children: [
                            b ? e.jsx(ee, { size: 14 }) : e.jsx(se, { size: 14 }),
                            b ? 'Sistema en línea' : 'Sin conexión'
                          ]
                        }),
                        e.jsx('p', {
                          className: 'mt-3 text-xs text-slate-500',
                          children: b
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
                            T
                              ? e.jsx(z, { size: 14, className: 'text-emerald-600' })
                              : e.jsx(q, { size: 14, className: 'text-amber-500' }),
                            T ? 'Lista para agregar' : 'Completa obligatorios'
                          ]
                        }),
                        e.jsx('p', {
                          className: 'mt-3 text-xs text-slate-500',
                          children: 'Solo se requiere ubicación y código para la referencia visual.'
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
                              border: `1px solid ${a.soft}`,
                              background: `${a.blue}08`,
                              color: a.blue
                            },
                            children: 'Paso 1'
                          }),
                          e.jsx('h3', {
                            className: 'mt-3 text-lg font-black tracking-tight sm:text-xl',
                            style: { color: a.navy },
                            children: 'Datos del producto'
                          }),
                          e.jsx('p', {
                            className: 'mt-1 text-sm',
                            style: { color: a.slate },
                            children:
                              'Asigna una ubicación visual al SKU. Este flujo no descuenta ni modifica cantidades de inventario.'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'rounded-2xl px-3 py-2 text-right',
                        style: { border: `1px solid ${a.soft}`, background: `${a.orange}08` },
                        children: [
                          e.jsx('div', {
                            className: 'text-[11px] font-bold uppercase tracking-[0.18em]',
                            style: { color: a.slate },
                            children: 'Flujo'
                          }),
                          e.jsx('div', {
                            className: 'mt-1 text-sm font-black',
                            style: { color: a.navy },
                            children: 'Put Away'
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsxs('form', {
                    ref: I,
                    onSubmit: Q,
                    className: 'space-y-5',
                    children: [
                      e.jsxs('div', {
                        className: 'grid grid-cols-2 gap-3 rounded-2xl p-3',
                        style: { border: `1px solid ${a.soft}`, background: `${a.blue}06` },
                        children: [
                          e.jsxs('div', {
                            className: 'rounded-2xl bg-white px-3 py-3 shadow-sm',
                            children: [
                              e.jsx('div', {
                                className: 'text-[10px] font-bold uppercase tracking-[0.18em]',
                                style: { color: a.slate },
                                children: 'Ubicación'
                              }),
                              e.jsx('div', {
                                className: 'mt-2 truncate text-sm font-black',
                                style: { color: a.navy },
                                children: d.ubicacion || 'Pendiente'
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'rounded-2xl bg-white px-3 py-3 shadow-sm',
                            children: [
                              e.jsx('div', {
                                className: 'text-[10px] font-bold uppercase tracking-[0.18em]',
                                style: { color: a.slate },
                                children: 'SKU'
                              }),
                              e.jsx('div', {
                                className: 'mt-2 truncate text-sm font-black',
                                style: { color: a.navy },
                                children: d.codigo || 'Pendiente'
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
                                  style: { color: a.navy },
                                  placeholder: 'AA-01-01A',
                                  value: d.ubicacion,
                                  onChange: D,
                                  onBlur: M,
                                  maxLength: 12,
                                  required: !0,
                                  autoFocus: !0
                                }),
                                e.jsx(P, {
                                  className:
                                    'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                                  style: { color: a.slate },
                                  size: 20
                                })
                              ]
                            })
                          }),
                          U &&
                            e.jsxs('div', {
                              className:
                                'mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2 text-xs text-amber-700 font-medium',
                              children: [
                                e.jsx(ae, { size: 14, className: 'text-amber-500 shrink-0' }),
                                U
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
                                  ref: C,
                                  type: 'text',
                                  name: 'codigo',
                                  className:
                                    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-lg font-bold uppercase outline-none transition-all placeholder:text-slate-400 focus:bg-white',
                                  style: { color: a.navy },
                                  placeholder: 'SKU-123...',
                                  value: d.codigo,
                                  onChange: D,
                                  maxLength: 20,
                                  required: !0
                                }),
                                K
                                  ? e.jsx(F, {
                                      className:
                                        'loading-spinner absolute right-3 top-1/2 -translate-y-1/2',
                                      style: { color: a.orange },
                                      size: 20
                                    })
                                  : e.jsx(P, {
                                      className:
                                        'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                                      style: { color: a.slate },
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
                            style: { color: a.slate },
                            placeholder: 'Se llenará automáticamente...',
                            value: d.descripcion,
                            readOnly: !0,
                            tabIndex: '-1'
                          })
                        ]
                      }),
                      A &&
                        e.jsxs('div', {
                          className:
                            'p-3 bg-wms-danger/10 border border-wms-danger/30 rounded-lg flex items-center gap-2 text-sm text-wms-danger',
                          children: [e.jsx(q, { size: 16 }), A]
                        }),
                      e.jsxs('button', {
                        className:
                          'add-btn mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-black text-white shadow-[0_22px_40px_-24px_rgba(13,27,42,0.85)] transition-all active:scale-95 sm:text-lg',
                        style: {
                          background: `linear-gradient(135deg, ${a.navy} 0%, ${a.blue} 46%, ${a.orange} 100%)`
                        },
                        children: [
                          e.jsx(z, { size: 24 }),
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
                ref: O,
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
                                border: `1px solid ${a.soft}`,
                                background: `${a.blue}08`,
                                color: a.blue
                              },
                              children: 'Paso 2'
                            }),
                            e.jsx('h3', {
                              className: 'mt-3 text-lg font-black tracking-tight sm:text-xl',
                              style: { color: a.navy },
                              children: 'Cola de procesamiento'
                            }),
                            e.jsx('p', {
                              className: 'mt-1 text-sm',
                              style: { color: a.slate },
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
                              onClick: W,
                              disabled: l.length === 0,
                              className:
                                'inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50',
                              children: [e.jsx(B, { size: 15 }), 'Vaciar todo']
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
                                children: e.jsx(te, { size: 44, className: 'opacity-25' })
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
                        : ((y.current = []), null) ||
                          e.jsx('div', {
                            className: 'space-y-3',
                            children: l.map((s, t) =>
                              e.jsx(
                                'div',
                                {
                                  ref: (r) => {
                                    r && (y.current[t] = r);
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
                                              background: `linear-gradient(135deg, ${a.blue} 0%, ${a.orange} 100%)`
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
                                                        children: s.ubicacion
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
                                                        style: { color: a.orange },
                                                        children: s.codigo
                                                      }),
                                                      s.descripcion &&
                                                        e.jsx('p', {
                                                          className:
                                                            'mt-1 truncate text-xs text-slate-500',
                                                          children: s.descripcion
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
                                                          s.timestamp
                                                        ).toLocaleTimeString('es-CL', {
                                                          hour: '2-digit',
                                                          minute: '2-digit'
                                                        })
                                                      })
                                                    ]
                                                  })
                                                ]
                                              }),
                                              (s.serie ||
                                                s.partida ||
                                                s.pieza ||
                                                s.fecha_vencimiento ||
                                                s.talla ||
                                                s.color) &&
                                                e.jsxs('div', {
                                                  className: 'mt-3 flex flex-wrap gap-2',
                                                  children: [
                                                    s.serie &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border px-2.5 py-1 text-[11px] font-bold',
                                                        style: {
                                                          borderColor: `${a.blue}25`,
                                                          background: `${a.blue}10`,
                                                          color: a.blue
                                                        },
                                                        children: ['Serie: ', s.serie]
                                                      }),
                                                    s.partida &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700',
                                                        children: ['Partida: ', s.partida]
                                                      }),
                                                    s.pieza &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600',
                                                        children: ['Pieza: ', s.pieza]
                                                      }),
                                                    s.fecha_vencimiento &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700',
                                                        children: ['Vence: ', s.fecha_vencimiento]
                                                      }),
                                                    s.talla &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600',
                                                        children: ['Talla: ', s.talla]
                                                      }),
                                                    s.color &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600',
                                                        children: ['Color: ', s.color]
                                                      })
                                                  ]
                                                })
                                            ]
                                          })
                                        ]
                                      }),
                                      e.jsx('button', {
                                        onClick: () => V(s.id, t),
                                        className:
                                          'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700',
                                        children: e.jsx(B, { size: 18 })
                                      })
                                    ]
                                  })
                                },
                                s.id
                              )
                            )
                          })
                  }),
                  e.jsxs('div', {
                    className: 'border-t border-slate-200 bg-white p-5 sm:p-6',
                    children: [
                      e.jsx('button', {
                        onClick: J,
                        disabled: l.length === 0 || $.isPending,
                        className:
                          'flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-lg font-black text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_22px_40px_-24px_rgba(13,27,42,0.85)]',
                        style: {
                          background: `linear-gradient(135deg, ${a.navy} 0%, ${a.blue} 50%, ${a.orange} 100%)`
                        },
                        children: $.isPending
                          ? e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(F, { size: 24, className: 'animate-spin' }),
                                ' GUARDANDO...'
                              ]
                            })
                          : e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(re, { size: 24 }),
                                ' GUARDAR UBICACIONES VISUALES (',
                                l.length,
                                ')'
                              ]
                            })
                      }),
                      e.jsx('p', {
                        className: 'mt-3 text-center text-xs text-slate-400',
                        children: b
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
export { me as default };
