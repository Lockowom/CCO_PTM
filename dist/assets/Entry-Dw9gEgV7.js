import { u as ne, c as ie, j as e } from './query-vendor-BNjBrM5A.js';
import { r as i } from './react-vendor-6aw4XXjH.js';
import { u as ce, s as _, c as K } from './index-AbeXgAVI.js';
import { u as de, g } from './animation-vendor-JfdD7EdN.js';
import {
  aE as T,
  aw as xe,
  au as ue,
  ag as Q,
  aF as W,
  at as A,
  Y as pe,
  a7 as V,
  Q as J,
  aG as me,
  an as be,
  t as c
} from './ui-vendor-naG2PYVT.js';
import { u as ge } from './useRealtimeTable-CaF3wVA_.js';
import { u as fe } from './useBarcodeScanner-2pV1KTKF.js';
import './supabase-vendor-4Fjsfb0a.js';
const Se = () => {
  const { user: p } = ce(),
    Y = ne(),
    { startScan: S, isScanning: E, isSupportedDevice: $ } = fe(),
    [n, f] = i.useState([]),
    [y, U] = i.useState(!0),
    [H, v] = i.useState(!1),
    [D, h] = i.useState(null),
    [P, z] = i.useState(null),
    I = i.useRef(null),
    O = i.useRef(null),
    q = i.useRef(null),
    N = i.useRef([]);
  ge('wms_ubicaciones', [['inventory']]);
  const [o, d] = i.useState({
      ubicacion: '',
      codigo: '',
      serie: '',
      partida: '',
      pieza: '',
      fecha_vencimiento: '',
      talla: '',
      color: '',
      cantidad: '',
      descripcion: ''
    }),
    F = i.useRef(null),
    X = i.useRef(null);
  (de(
    () => {
      g.from(I.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.out',
        clearProps: 'all'
      });
    },
    { scope: I }
  ),
    i.useEffect(() => {
      if (n.length > 0) {
        const a = N.current[0];
        a &&
          g.fromTo(
            a,
            { y: -20, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
          );
      }
    }, [n.length]),
    i.useEffect(() => {
      const a = () => U(!0),
        t = () => U(!1);
      return (
        window.addEventListener('online', a),
        window.addEventListener('offline', t),
        U(navigator.onLine),
        () => {
          (window.removeEventListener('online', a), window.removeEventListener('offline', t));
        }
      );
    }, []),
    i.useEffect(() => {
      const a = localStorage.getItem('wms_entry_queue');
      if (a)
        try {
          f(JSON.parse(a));
        } catch (t) {
          console.error('Entry data load error:', t);
        }
    }, []),
    i.useEffect(() => {
      localStorage.setItem('wms_entry_queue', JSON.stringify(n));
    }, [n]));
  const w = i.useRef(new Map()),
    k = i.useRef(null),
    C = i.useRef(null),
    j = i.useRef('');
  i.useEffect(() => {
    const a = o.codigo;
    if ((C.current && clearTimeout(C.current), !a || a.length < 3)) {
      (v(!1), j.current && !a && (d((t) => ({ ...t, descripcion: '' })), h(null)), (j.current = a));
      return;
    }
    if (a !== j.current) {
      if (w.current.has(a)) {
        const t = w.current.get(a);
        (d((r) => ({ ...r, descripcion: t || '' })),
          h(t ? null : 'SKU NO ENCONTRADO'),
          v(!1),
          (j.current = a));
        return;
      }
      return (
        (C.current = setTimeout(async () => {
          k.current && k.current.abort();
          const t = new AbortController();
          ((k.current = t), v(!0), h(null));
          try {
            const { data: r, error: u } = await _.from('tms_matriz_codigos')
              .select('producto')
              .eq('codigo_producto', a)
              .maybeSingle()
              .abortSignal(t.signal);
            if (t.signal.aborted) return;
            if (r != null && r.producto) {
              (w.current.set(a, r.producto),
                d((l) => (l.codigo === a ? { ...l, descripcion: r.producto } : l)),
                (j.current = a),
                v(!1));
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
              ? (w.current.set(a, x.descripcion),
                d((l) => (l.codigo === a ? { ...l, descripcion: x.descripcion } : l)))
              : (w.current.set(a, ''),
                d((l) => (l.codigo === a ? { ...l, descripcion: '' } : l)),
                h('SKU NO ENCONTRADO')),
              (j.current = a));
          } catch (r) {
            if ((r == null ? void 0 : r.name) === 'AbortError') return;
            console.error('Desc lookup error:', r);
          } finally {
            t.signal.aborted || v(!1);
          }
        }, 400)),
        () => {
          (C.current && clearTimeout(C.current), k.current && k.current.abort());
        }
      );
    }
  }, [o.codigo]);
  const B = async () => {
      if (!o.ubicacion || o.ubicacion.length < 3) {
        z(null);
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
        z(a ? null : '⚠ Ubicación no registrada en el sistema');
      } catch (a) {
        console.error('Ubicacion validation error:', a);
      }
    },
    Z = () => {
      S({
        onScan: (a) => {
          const t = a.toUpperCase().slice(0, 12);
          (d((r) => ({ ...r, ubicacion: t })),
            c.success(`Ubicación escaneada: ${t}`),
            setTimeout(B, 200));
        },
        onError: (a) => c.error(a)
      });
    },
    ee = () => {
      S({
        onScan: (a) => {
          const t = a.toUpperCase().slice(0, 20);
          (d((r) => ({ ...r, codigo: t })), c.success(`Código escaneado: ${t}`));
        },
        onError: (a) => c.error(a)
      });
    },
    ae = () => {
      if ($)
        S({
          onScan: (a) => {
            (d((t) => ({ ...t, serie: a.trim() })), c.success(`Serie escaneada: ${a.trim()}`));
          },
          onError: (a) => c.error(a)
        });
      else {
        const a = window.prompt('Ingrese o pegue la Serie / S.N.:');
        a && (d((t) => ({ ...t, serie: a.trim() })), c.success(`Serie ingresada: ${a.trim()}`));
      }
    },
    se = () => {
      if ($)
        S({
          onScan: (a) => {
            (d((t) => ({ ...t, partida: a.trim() })), c.success(`Partida escaneada: ${a.trim()}`));
          },
          onError: (a) => c.error(a)
        });
      else {
        const a = window.prompt('Ingrese o pegue la Partida / Lote:');
        a && (d((t) => ({ ...t, partida: a.trim() })), c.success(`Partida ingresada: ${a.trim()}`));
      }
    },
    b = (a) => {
      const { name: t, value: r } = a.target;
      let u = r;
      (t === 'ubicacion'
        ? (u = r.toUpperCase().slice(0, 12))
        : t === 'codigo' && (u = r.toUpperCase().slice(0, 20)),
        d((x) => ({ ...x, [t]: u })));
    },
    te = (a) => {
      if ((a.preventDefault(), !o.ubicacion || !o.codigo || !o.cantidad)) {
        (h('Faltan campos obligatorios (Ubicación, Código, Cantidad)'),
          g.to(O.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 }));
        return;
      }
      if (parseFloat(o.cantidad) <= 0) {
        (h('La cantidad debe ser mayor a 0'),
          g.to(O.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 }));
        return;
      }
      const t = { id: Date.now(), ...o, timestamp: new Date().toISOString() };
      (f([t, ...n]),
        g.fromTo('.add-btn', { scale: 0.95 }, { scale: 1, duration: 0.2, ease: 'power2.out' }),
        d((r) => ({
          ...r,
          codigo: '',
          serie: '',
          partida: '',
          pieza: '',
          fecha_vencimiento: '',
          talla: '',
          color: '',
          cantidad: '',
          descripcion: ''
        })),
        h(null),
        z(null),
        F.current && F.current.focus());
    },
    re = (a, t) => {
      const r = N.current[t];
      g.to(r, {
        x: 50,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          (f(n.filter((u) => u.id !== a)), g.set(r, { x: 0, opacity: 1 }));
        }
      });
    },
    le = () => {
      window.confirm('¿Limpiar toda la cola?') &&
        g.to(N.current, {
          y: 20,
          opacity: 0,
          stagger: 0.05,
          duration: 0.3,
          onComplete: () => f([])
        });
    },
    L = ie({
      mutationFn: async () => {
        const a = n.map((l) => ({
            ubicacion: l.ubicacion,
            codigo: l.codigo,
            descripcion: l.descripcion,
            cantidad: parseFloat(l.cantidad),
            serie: l.serie || null,
            partida: l.partida || null,
            pieza: l.pieza || null,
            fecha_vencimiento: l.fecha_vencimiento || null,
            talla: l.talla || null,
            color: l.color || null
          })),
          { data: t, error: r } = await _.from('wms_ubicaciones')
            .upsert(a, { onConflict: 'ubicacion,codigo' })
            .select('id');
        if (r) throw r;
        const u = t ? t.length : 0,
          x = n.length - u;
        if (p)
          try {
            await _.from('tms_historial_cargas').insert([
              {
                usuario_id: p.id,
                usuario_nombre: p.nombre || p.email || 'Usuario Desconocido',
                modulo: 'Ingreso Manual WMS',
                tabla_destino: 'wms_ubicaciones',
                registros_totales: n.length,
                registros_nuevos: u,
                registros_actualizados: x >= 0 ? x : 0,
                registros_error: 0
              }
            ]);
          } catch (l) {
            console.error('Entry operation error:', l);
          }
      },
      onSuccess: () => {
        (c.success(`✅ ${n.length} registros guardados correctamente.`),
          g.to(q.current, { y: 10, duration: 0.1, yoyo: !0, repeat: 1 }),
          f([]),
          Y.invalidateQueries({ queryKey: ['inventory'] }));
      },
      onError: async (a) => {
        var r, u, x;
        if (
          !navigator.onLine ||
          ((r = a.message) == null ? void 0 : r.includes('Failed to fetch')) ||
          ((u = a.message) == null ? void 0 : u.includes('NetworkError')) ||
          ((x = a.message) == null ? void 0 : x.includes('ERR_INTERNET_DISCONNECTED')) ||
          a.code === 'PGRST301'
        )
          try {
            const l = n.map((m) => ({
              ubicacion: m.ubicacion,
              codigo: m.codigo,
              descripcion: m.descripcion,
              cantidad: parseFloat(m.cantidad),
              serie: m.serie || null,
              partida: m.partida || null,
              pieza: m.pieza || null,
              fecha_vencimiento: m.fecha_vencimiento || null,
              talla: m.talla || null,
              color: m.color || null
            }));
            (await K({
              tableName: 'wms_ubicaciones',
              data: l,
              onConflict: 'ubicacion,codigo',
              userId: (p == null ? void 0 : p.id) || null
            }))
              ? (c.info(
                  `📦 ${n.length} registros guardados offline. Se sincronizarán al recuperar conexión.`,
                  { duration: 6e3 }
                ),
                f([]))
              : c.error('Cola offline llena. No se pudieron guardar los datos.');
          } catch (l) {
            (console.error('[Entry] Error al encolar offline:', l),
              c.error('Error al guardar offline: ' + l.message));
          }
        else c.error('Error al guardar: ' + a.message);
      }
    }),
    oe = async () => {
      if (n.length !== 0 && window.confirm(`¿Guardar ${n.length} registros en ubicaciones?`)) {
        if (!navigator.onLine) {
          try {
            const a = n.map((r) => ({
              ubicacion: r.ubicacion,
              codigo: r.codigo,
              descripcion: r.descripcion,
              cantidad: parseFloat(r.cantidad),
              serie: r.serie || null,
              partida: r.partida || null,
              pieza: r.pieza || null,
              fecha_vencimiento: r.fecha_vencimiento || null,
              talla: r.talla || null,
              color: r.color || null
            }));
            (await K({
              tableName: 'wms_ubicaciones',
              data: a,
              onConflict: 'ubicacion,codigo',
              userId: (p == null ? void 0 : p.id) || null
            }))
              ? (c.info(
                  `📦 ${n.length} registros guardados offline. Se sincronizarán automáticamente.`,
                  { duration: 6e3 }
                ),
                f([]))
              : c.error('Cola offline llena. Conecta a internet para sincronizar.');
          } catch (a) {
            (console.error('[Entry] Error al encolar offline:', a),
              c.error('Error al guardar offline: ' + a.message));
          }
          return;
        }
        L.mutate();
      }
    },
    M = !!(o.ubicacion && o.codigo && o.cantidad && parseFloat(o.cantidad) > 0),
    G = n.reduce((a, t) => a + (parseFloat(t.cantidad) || 0), 0),
    R = ['serie', 'partida', 'pieza', 'fecha_vencimiento', 'talla', 'color'].filter(
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
    ref: I,
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
                      children: e.jsx(T, { size: 28, strokeWidth: 2.4 })
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
                            y ? e.jsx(xe, { size: 14 }) : e.jsx(ue, { size: 14 }),
                            y ? 'Sistema en línea' : 'Sin conexión'
                          ]
                        }),
                        e.jsx('p', {
                          className: 'mt-3 text-xs text-slate-500',
                          children: y
                            ? 'Los movimientos se enviarán a Supabase al guardar.'
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
                              children: n.length
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
                            n.length > 0
                              ? `${G.toFixed(2)} unidades acumuladas listas para guardar.`
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
                            M
                              ? e.jsx(T, { size: 14, className: 'text-emerald-600' })
                              : e.jsx(Q, { size: 14, className: 'text-amber-500' }),
                            M ? 'Lista para agregar' : 'Completa obligatorios'
                          ]
                        }),
                        e.jsxs('p', {
                          className: 'mt-3 text-xs text-slate-500',
                          children: [
                            R,
                            ' detalle',
                            R === 1 ? '' : 's',
                            ' opcional',
                            R === 1 ? '' : 'es',
                            ' cargado',
                            R === 1 ? '' : 's',
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
                              'Captura ubicación, SKU y cantidad con una interfaz corporativa más limpia y enfocada.'
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
                    ref: O,
                    onSubmit: te,
                    className: 'space-y-5',
                    children: [
                      e.jsxs('div', {
                        className: 'grid grid-cols-3 gap-3 rounded-2xl p-3',
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
                          }),
                          e.jsxs('div', {
                            className: 'rounded-2xl bg-white px-3 py-3 shadow-sm',
                            children: [
                              e.jsx('div', {
                                className: 'text-[10px] font-bold uppercase tracking-[0.18em]',
                                style: { color: s.slate },
                                children: 'Cantidad'
                              }),
                              e.jsx('div', {
                                className: 'mt-2 truncate text-sm font-black text-emerald-700',
                                children: o.cantidad || '0'
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
                          e.jsxs('div', {
                            className: 'flex gap-2',
                            children: [
                              e.jsxs('div', {
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
                                    onChange: b,
                                    onBlur: B,
                                    maxLength: 12,
                                    required: !0,
                                    autoFocus: !0
                                  }),
                                  e.jsx(W, {
                                    className:
                                      'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                                    style: { color: s.slate },
                                    size: 20
                                  })
                                ]
                              }),
                              $ &&
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: Z,
                                  disabled: E,
                                  className:
                                    'flex items-center justify-center rounded-2xl border px-3.5 transition-colors hover:text-white disabled:opacity-50',
                                  style: {
                                    borderColor: `${s.orange}50`,
                                    background: `${s.orange}10`,
                                    color: s.orange
                                  },
                                  title: 'Escanear con cámara',
                                  children: e.jsx(A, { size: 20 })
                                })
                            ]
                          }),
                          P &&
                            e.jsxs('div', {
                              className:
                                'mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2 text-xs text-amber-700 font-medium',
                              children: [
                                e.jsx(pe, { size: 14, className: 'text-amber-500 shrink-0' }),
                                P
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
                          e.jsxs('div', {
                            className: 'flex gap-2',
                            children: [
                              e.jsxs('div', {
                                className: 'relative group/input flex-1',
                                children: [
                                  e.jsx('input', {
                                    ref: F,
                                    type: 'text',
                                    name: 'codigo',
                                    className:
                                      'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-lg font-bold uppercase outline-none transition-all placeholder:text-slate-400 focus:bg-white',
                                    style: { color: s.navy },
                                    placeholder: 'SKU-123...',
                                    value: o.codigo,
                                    onChange: b,
                                    maxLength: 20,
                                    required: !0
                                  }),
                                  H
                                    ? e.jsx(V, {
                                        className:
                                          'loading-spinner absolute right-3 top-1/2 -translate-y-1/2',
                                        style: { color: s.orange },
                                        size: 20
                                      })
                                    : e.jsx(W, {
                                        className:
                                          'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                                        style: { color: s.slate },
                                        size: 20
                                      })
                                ]
                              }),
                              $ &&
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: ee,
                                  disabled: E,
                                  className:
                                    'flex items-center justify-center rounded-2xl border px-3.5 transition-colors hover:text-white disabled:opacity-50',
                                  style: {
                                    borderColor: `${s.orange}50`,
                                    background: `${s.orange}10`,
                                    color: s.orange
                                  },
                                  title: 'Escanear con cámara',
                                  children: e.jsx(A, { size: 20 })
                                })
                            ]
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
                      e.jsxs('div', {
                        children: [
                          e.jsxs('label', {
                            className:
                              'block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider',
                            children: [
                              'Cantidad Contada ',
                              e.jsx('span', { className: 'text-wms-danger', children: '*' })
                            ]
                          }),
                          e.jsx('input', {
                            ref: X,
                            type: 'number',
                            name: 'cantidad',
                            className:
                              'w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xl font-black text-emerald-700 outline-none transition-all focus:bg-white',
                            placeholder: '0',
                            min: '0.01',
                            step: '0.01',
                            value: o.cantidad,
                            onChange: b,
                            required: !0
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
                                e.jsxs('div', {
                                  className: 'flex gap-1.5',
                                  children: [
                                    e.jsx('input', {
                                      type: 'text',
                                      name: 'serie',
                                      value: o.serie,
                                      onChange: b,
                                      className:
                                        'min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none placeholder:text-slate-400',
                                      style: { color: s.navy },
                                      placeholder: 'S/N...'
                                    }),
                                    e.jsx('button', {
                                      type: 'button',
                                      onClick: ae,
                                      disabled: E,
                                      className:
                                        'flex shrink-0 items-center justify-center rounded-xl border px-2.5 transition-colors hover:text-white disabled:opacity-50',
                                      style: {
                                        borderColor: `${s.orange}40`,
                                        background: `${s.orange}10`,
                                        color: s.orange
                                      },
                                      title: 'Escanear Serie',
                                      children: e.jsx(A, { size: 16 })
                                    })
                                  ]
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
                                e.jsxs('div', {
                                  className: 'flex gap-1.5',
                                  children: [
                                    e.jsx('input', {
                                      type: 'text',
                                      name: 'partida',
                                      value: o.partida,
                                      onChange: b,
                                      className:
                                        'min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none placeholder:text-slate-400',
                                      style: { color: s.navy },
                                      placeholder: 'Lote...'
                                    }),
                                    e.jsx('button', {
                                      type: 'button',
                                      onClick: se,
                                      disabled: E,
                                      className:
                                        'flex shrink-0 items-center justify-center rounded-xl border px-2.5 transition-colors hover:text-white disabled:opacity-50',
                                      style: {
                                        borderColor: `${s.orange}40`,
                                        background: `${s.orange}10`,
                                        color: s.orange
                                      },
                                      title: 'Escanear Partida',
                                      children: e.jsx(A, { size: 16 })
                                    })
                                  ]
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
                                  onChange: b,
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
                                    onChange: b,
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
                                  onChange: b,
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
                                  onChange: b,
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
                      D &&
                        e.jsxs('div', {
                          className:
                            'p-3 bg-wms-danger/10 border border-wms-danger/30 rounded-lg flex items-center gap-2 text-sm text-wms-danger',
                          children: [e.jsx(Q, { size: 16 }), D]
                        }),
                      e.jsxs('button', {
                        className:
                          'add-btn mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-black text-white shadow-[0_22px_40px_-24px_rgba(13,27,42,0.85)] transition-all active:scale-95 sm:text-lg',
                        style: {
                          background: `linear-gradient(135deg, ${s.navy} 0%, ${s.blue} 46%, ${s.orange} 100%)`
                        },
                        children: [
                          e.jsx(T, { size: 24 }),
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
                ref: q,
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
                                'Revisa los movimientos antes de consolidarlos en ubicaciones.'
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          className: 'grid gap-3 sm:grid-cols-3',
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
                                  children: n.length
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              className:
                                'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3',
                              children: [
                                e.jsx('div', {
                                  className:
                                    'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400',
                                  children: 'Unidades'
                                }),
                                e.jsx('div', {
                                  className: 'mt-1 text-2xl font-black text-emerald-700',
                                  children: G.toFixed(2)
                                })
                              ]
                            }),
                            e.jsxs('button', {
                              onClick: le,
                              disabled: n.length === 0,
                              className:
                                'inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50',
                              children: [e.jsx(J, { size: 15 }), 'Vaciar todo']
                            })
                          ]
                        })
                      ]
                    })
                  }),
                  e.jsx('div', {
                    className: 'flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-5',
                    children:
                      n.length === 0
                        ? e.jsxs('div', {
                            className:
                              'flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 px-6 text-center text-slate-500',
                            children: [
                              e.jsx('div', {
                                className:
                                  'mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-50',
                                children: e.jsx(me, { size: 44, className: 'opacity-25' })
                              }),
                              e.jsx('p', {
                                className: 'text-xl font-black text-slate-900',
                                children: 'La cola está vacía'
                              }),
                              e.jsx('p', {
                                className: 'mt-2 max-w-md text-sm',
                                children:
                                  'Agrega productos desde el formulario para construir el lote que enviarás a ubicaciones.'
                              })
                            ]
                          })
                        : ((N.current = []), null) ||
                          e.jsx('div', {
                            className: 'space-y-3',
                            children: n.map((a, t) =>
                              e.jsx(
                                'div',
                                {
                                  ref: (r) => {
                                    r && (N.current[t] = r);
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
                                            children: n.length - t
                                          }),
                                          e.jsxs('div', {
                                            className: 'min-w-0 flex-1',
                                            children: [
                                              e.jsxs('div', {
                                                className:
                                                  'grid gap-3 md:grid-cols-3 xl:grid-cols-4',
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
                                                        children: 'Cantidad'
                                                      }),
                                                      e.jsx('p', {
                                                        className:
                                                          'mt-1 text-lg font-black text-emerald-700',
                                                        children: a.cantidad
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
                                        onClick: () => re(a.id, t),
                                        className:
                                          'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700',
                                        children: e.jsx(J, { size: 18 })
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
                        onClick: oe,
                        disabled: n.length === 0 || L.isPending,
                        className:
                          'flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-lg font-black text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_22px_40px_-24px_rgba(13,27,42,0.85)]',
                        style: {
                          background: `linear-gradient(135deg, ${s.navy} 0%, ${s.blue} 50%, ${s.orange} 100%)`
                        },
                        children: L.isPending
                          ? e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(V, { size: 24, className: 'animate-spin' }),
                                ' GUARDANDO...'
                              ]
                            })
                          : e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(be, { size: 24 }),
                                ' GUARDAR EN UBICACIONES (',
                                n.length,
                                ')'
                              ]
                            })
                      }),
                      e.jsx('p', {
                        className: 'mt-3 text-center text-xs text-slate-400',
                        children: y
                          ? 'Se aplicará upsert directo sobre `wms_ubicaciones`.'
                          : 'Se guardará en la cola offline para sincronización posterior.'
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
export { Se as default };
