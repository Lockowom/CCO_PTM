import { j as e } from './query-vendor-B1MP_4YJ.js';
import { r as i } from './react-vendor-C8fdn38R.js';
import { u as se, s as c } from './index-BOtfZs_6.js';
import { s as ae } from './storageUrl-DkqIB62M.js';
import {
  t as p,
  v as re,
  x as D,
  X as B,
  g as le,
  at as L,
  a$ as P,
  b0 as O,
  R as V,
  aH as oe,
  n as ie,
  b1 as ne,
  b2 as ce,
  b3 as de,
  Q as xe,
  av as pe,
  E as me,
  a as he
} from './ui-vendor-D-9zQVt7.js';
import './supabase-vendor-jY4wIOEF.js';
import './animation-vendor-BwUUObbT.js';
const j = 'fichas-productos';
async function ue(a) {
  try {
    const b = await createImageBitmap(a),
      d = 1600;
    let { width: l, height: x } = b;
    if (l > d || x > d) {
      const h = Math.min(d / l, d / x);
      ((l = Math.round(l * h)), (x = Math.round(x * h)));
    }
    const m = document.createElement('canvas');
    return (
      (m.width = l),
      (m.height = x),
      m.getContext('2d').drawImage(b, 0, 0, l, x),
      (await new Promise((h) => m.toBlob(h, 'image/jpeg', 0.82))) || a
    );
  } catch {
    return a;
  }
}
const ye = () => {
  const { user: a, hasPermission: b } = se(),
    d =
      (a == null ? void 0 : a.rol) === 'ADMIN' ||
      (a == null ? void 0 : a.es_admin_delegado) ||
      b('manage_fichas'),
    [l, x] = i.useState(''),
    [m, N] = i.useState([]),
    [S, h] = i.useState(!1),
    [o, T] = i.useState(null),
    [r, C] = i.useState(null),
    [X, U] = i.useState(!1),
    [E, M] = i.useState(!1),
    [q, F] = i.useState(null),
    I = i.useRef(null);
  i.useEffect(() => {
    const t = l.trim();
    if (t.length < 2) {
      N([]);
      return;
    }
    h(!0);
    const s = setTimeout(async () => {
      const { data: g, error: _ } = await c.rpc('search_productos', { p_query: t, p_limit: 30 });
      (_ ? (p.error('Error buscando productos'), N([])) : N(g || []), h(!1));
    }, 400);
    return () => clearTimeout(s);
  }, [l]);
  const v = i.useCallback(async (t) => {
      U(!0);
      const { data: s, error: g } = await c.rpc('get_ficha_producto', { p_codigo: t });
      (g ? (p.error('No se pudo cargar la ficha'), C(null)) : C(s), U(!1));
    }, []),
    G = (t) => {
      (T(t), v(t));
    },
    H = () => {
      (T(null), C(null));
    },
    K = async (t) => {
      var g, _, R;
      const s = (g = t.target.files) == null ? void 0 : g[0];
      if (((t.target.value = ''), !(!s || !o))) {
        if (!s.type.startsWith('image/')) {
          p.error('El archivo debe ser una imagen');
          return;
        }
        M(!0);
        try {
          const f = await ue(s),
            z = `${o}/${crypto.randomUUID()}.jpg`,
            { error: $ } = await c.storage
              .from(j)
              .upload(z, f, { contentType: 'image/jpeg', upsert: !1 });
          if ($) throw $;
          const { data: ee } = c.storage.from(j).getPublicUrl(z),
            te = (((_ = r == null ? void 0 : r.imagenes) == null ? void 0 : _.length) || 0) === 0,
            { error: A } = await c
              .from('tms_fichas_imagenes')
              .insert({
                codigo_producto: o,
                imagen_url: ee.publicUrl,
                storage_path: z,
                es_principal: te,
                creado_por: (a == null ? void 0 : a.id) || null,
                creado_nombre: (a == null ? void 0 : a.nombre) || null
              });
          if (A) throw (await c.storage.from(j).remove([z]), A);
          (p.success('Foto agregada'), await v(o));
        } catch (f) {
          (console.error(f),
            p.error(
              (R = f == null ? void 0 : f.message) != null && R.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : 'Error al subir la foto'
            ));
        } finally {
          M(!1);
        }
      }
    },
    Q = async (t) => {
      if (confirm('¿Eliminar esta foto?'))
        try {
          await c.storage.from(j).remove([t.storage_path]);
          const { error: s } = await c.from('tms_fichas_imagenes').delete().eq('id', t.id);
          if (s) throw s;
          (p.success('Foto eliminada'), await v(o));
        } catch {
          p.error('No se pudo eliminar');
        }
    },
    W = async (t) => {
      try {
        await c.from('tms_fichas_imagenes').update({ es_principal: !1 }).eq('codigo_producto', o);
        const { error: s } = await c
          .from('tms_fichas_imagenes')
          .update({ es_principal: !0 })
          .eq('id', t.id);
        if (s) throw s;
        await v(o);
      } catch {
        p.error('No se pudo marcar como principal');
      }
    },
    w = (r == null ? void 0 : r.imagenes) || [],
    y = w.find((t) => t.es_principal) || w[0] || null,
    [J, Y] = i.useState({});
  i.useEffect(() => {
    let t = !0;
    return (
      ae(
        j,
        ((r == null ? void 0 : r.imagenes) || []).map((s) => s.storage_path)
      ).then((s) => {
        t && Y(s);
      }),
      () => {
        t = !1;
      }
    );
  }, [r]);
  const u = (t) => (t && J[t.storage_path]) || '',
    k = (r == null ? void 0 : r.partidas) || [],
    n = (r == null ? void 0 : r.header) || (o ? { codigo_producto: o } : null),
    Z = (t) => t && new Date(t) < new Date();
  return e.jsxs('div', {
    className: 'min-h-screen bg-slate-50 font-sans text-slate-900',
    children: [
      e.jsx('div', {
        className: 'bg-white/80 backdrop-blur-2xl border-b border-slate-200 sticky top-0 z-20',
        children: e.jsxs('div', {
          className: 'max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3 mb-4',
              children: [
                e.jsx('div', {
                  className:
                    'w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20',
                  children: e.jsx(re, { size: 22 })
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('h1', {
                      className: 'text-lg sm:text-2xl font-black tracking-tight leading-none',
                      children: 'Ficha Técnica'
                    }),
                    e.jsx('p', {
                      className:
                        'text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1',
                      children: 'Presentación del producto'
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'relative',
              children: [
                e.jsx(D, {
                  className: `absolute left-4 top-1/2 -translate-y-1/2 ${S ? 'animate-pulse text-orange-500' : 'text-slate-400'}`,
                  size: 18
                }),
                e.jsx('input', {
                  type: 'text',
                  inputMode: 'search',
                  value: l,
                  onChange: (t) => x(t.target.value),
                  placeholder: 'Buscar por código o nombre del producto...',
                  className: `w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white font-mono uppercase text-sm
                         outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:font-sans placeholder:normal-case placeholder:text-slate-300`,
                  autoFocus: !0
                }),
                l &&
                  e.jsx('button', {
                    onClick: () => x(''),
                    className:
                      'absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 p-1',
                    children: e.jsx(B, { size: 18 })
                  })
              ]
            })
          ]
        })
      }),
      e.jsxs('div', {
        className: 'max-w-5xl mx-auto px-4 sm:px-6 py-6',
        children: [
          !o &&
            e.jsxs(e.Fragment, {
              children: [
                l.trim().length < 2 &&
                  e.jsxs('div', {
                    className: 'text-center py-20 text-slate-400',
                    children: [
                      e.jsx(le, { size: 48, className: 'mx-auto mb-4 text-slate-200' }),
                      e.jsx('p', {
                        className: 'font-bold',
                        children: 'Escribe un código para ver su ficha técnica'
                      })
                    ]
                  }),
                l.trim().length >= 2 &&
                  m.length === 0 &&
                  !S &&
                  e.jsxs('div', {
                    className: 'text-center py-20 text-slate-400',
                    children: [
                      e.jsx(D, { size: 40, className: 'mx-auto mb-4 text-slate-200' }),
                      e.jsxs('p', {
                        className: 'font-bold',
                        children: ['Sin resultados para "', l, '"']
                      })
                    ]
                  }),
                e.jsx('div', {
                  className: 'grid gap-2.5',
                  children: m.map((t) =>
                    e.jsxs(
                      'button',
                      {
                        onClick: () => G(t.codigo_producto),
                        className:
                          'group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-lg text-left transition-all active:scale-[0.99]',
                        children: [
                          e.jsx('div', {
                            className: `w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${t.tiene_foto ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-300'}`,
                            children: t.tiene_foto ? e.jsx(L, { size: 22 }) : e.jsx(P, { size: 22 })
                          }),
                          e.jsxs('div', {
                            className: 'min-w-0 flex-1',
                            children: [
                              e.jsx('p', {
                                className:
                                  'font-mono text-xs font-black text-orange-500 uppercase tracking-wider',
                                children: t.codigo_producto
                              }),
                              e.jsx('p', {
                                className:
                                  'font-bold text-slate-900 text-sm leading-tight truncate',
                                children: t.producto || '—'
                              }),
                              e.jsx('p', {
                                className:
                                  'text-[10px] font-black text-slate-400 uppercase tracking-wide mt-0.5',
                                children: t.unidad_medida || ''
                              })
                            ]
                          }),
                          e.jsx(O, {
                            size: 18,
                            className:
                              'rotate-180 text-slate-300 group-hover:text-orange-500 transition-colors'
                          })
                        ]
                      },
                      t.codigo_producto
                    )
                  )
                })
              ]
            }),
          o &&
            e.jsxs('div', {
              children: [
                e.jsxs('button', {
                  onClick: H,
                  className:
                    'flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 mb-4 transition-colors',
                  children: [e.jsx(O, { size: 18 }), ' Volver a la búsqueda']
                }),
                X
                  ? e.jsxs('div', {
                      className: 'flex flex-col items-center justify-center py-24 gap-3',
                      children: [
                        e.jsx(V, { className: 'animate-spin text-orange-500', size: 28 }),
                        e.jsx('p', {
                          className: 'text-slate-400 font-bold text-xs uppercase tracking-widest',
                          children: 'Cargando ficha...'
                        })
                      ]
                    })
                  : e.jsxs('div', {
                      className: 'space-y-5',
                      children: [
                        e.jsx('div', {
                          className:
                            'bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden',
                          children: e.jsxs('div', {
                            className: 'grid sm:grid-cols-2 gap-0',
                            children: [
                              e.jsx('div', {
                                className:
                                  'relative bg-slate-100 aspect-square sm:aspect-auto sm:min-h-[280px] flex items-center justify-center',
                                children: y
                                  ? e.jsx('img', {
                                      src: u(y),
                                      alt: (n == null ? void 0 : n.producto) || o,
                                      className: 'w-full h-full object-cover cursor-zoom-in',
                                      onClick: () => u(y) && F(u(y))
                                    })
                                  : e.jsxs('div', {
                                      className: 'text-center text-slate-300 p-8',
                                      children: [
                                        e.jsx(P, { size: 56, className: 'mx-auto mb-3' }),
                                        e.jsx('p', {
                                          className: 'font-bold text-sm',
                                          children: 'Sin presentación'
                                        })
                                      ]
                                    })
                              }),
                              e.jsxs('div', {
                                className: 'p-5 sm:p-7 flex flex-col justify-center',
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'font-mono text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-2',
                                    children: (n == null ? void 0 : n.codigo_producto) || o
                                  }),
                                  e.jsx('h2', {
                                    className:
                                      'text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-4',
                                    children: (n == null ? void 0 : n.producto) || '—'
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex flex-wrap gap-2',
                                    children: [
                                      e.jsxs('span', {
                                        className:
                                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-wide',
                                        children: [
                                          e.jsx(oe, { size: 13 }),
                                          ' U. Medida: ',
                                          (n == null ? void 0 : n.unidad_medida) || '—'
                                        ]
                                      }),
                                      e.jsxs('span', {
                                        className:
                                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 text-[11px] font-black uppercase tracking-wide',
                                        children: [
                                          e.jsx(ie, { size: 13 }),
                                          ' ',
                                          k.length,
                                          ' partida',
                                          k.length === 1 ? '' : 's'
                                        ]
                                      })
                                    ]
                                  })
                                ]
                              })
                            ]
                          })
                        }),
                        e.jsxs('div', {
                          className: 'bg-white rounded-3xl border border-slate-200 shadow-sm p-5',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center justify-between mb-4',
                              children: [
                                e.jsxs('h3', {
                                  className: 'flex items-center gap-2 font-black text-slate-900',
                                  children: [
                                    e.jsx(L, { size: 18, className: 'text-orange-500' }),
                                    ' Galería de presentación'
                                  ]
                                }),
                                d &&
                                  e.jsxs('button', {
                                    onClick: () => {
                                      var t;
                                      return (t = I.current) == null ? void 0 : t.click();
                                    },
                                    disabled: E,
                                    className:
                                      'flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all active:scale-95',
                                    children: [
                                      E
                                        ? e.jsx(V, { size: 16, className: 'animate-spin' })
                                        : e.jsx(ne, { size: 16 }),
                                      E ? 'Subiendo...' : 'Agregar / Tomar foto'
                                    ]
                                  })
                              ]
                            }),
                            e.jsx('input', {
                              ref: I,
                              type: 'file',
                              accept: 'image/*',
                              capture: 'environment',
                              onChange: K,
                              className: 'hidden'
                            }),
                            w.length === 0
                              ? e.jsxs('div', {
                                  className: 'text-center py-12 text-slate-300',
                                  children: [
                                    e.jsx(P, { size: 44, className: 'mx-auto mb-3' }),
                                    e.jsx('p', {
                                      className: 'font-bold text-sm',
                                      children: d
                                        ? 'Aún no hay fotos. Agrega la primera presentación.'
                                        : 'Este producto no tiene fotos todavía.'
                                    })
                                  ]
                                })
                              : e.jsx('div', {
                                  className: 'grid grid-cols-3 sm:grid-cols-4 gap-2.5',
                                  children: w.map((t) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className:
                                          'relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100',
                                        children: [
                                          e.jsx('img', {
                                            src: u(t),
                                            alt: '',
                                            className: 'w-full h-full object-cover cursor-zoom-in',
                                            onClick: () => u(t) && F(u(t))
                                          }),
                                          t.es_principal &&
                                            e.jsxs('span', {
                                              className:
                                                'absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black uppercase',
                                              children: [e.jsx(ce, { size: 10 }), ' Principal']
                                            }),
                                          d &&
                                            e.jsxs('div', {
                                              className:
                                                'absolute inset-x-0 bottom-0 p-1.5 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity',
                                              children: [
                                                !t.es_principal &&
                                                  e.jsx('button', {
                                                    onClick: () => W(t),
                                                    title: 'Marcar como principal',
                                                    className:
                                                      'p-1.5 rounded-lg bg-white/90 text-amber-600 hover:bg-white active:scale-90',
                                                    children: e.jsx(de, { size: 14 })
                                                  }),
                                                e.jsx('button', {
                                                  onClick: () => Q(t),
                                                  title: 'Eliminar',
                                                  className:
                                                    'p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-white active:scale-90',
                                                  children: e.jsx(xe, { size: 14 })
                                                })
                                              ]
                                            })
                                        ]
                                      },
                                      t.id
                                    )
                                  )
                                })
                          ]
                        }),
                        e.jsxs('div', {
                          className: 'bg-white rounded-3xl border border-slate-200 shadow-sm p-5',
                          children: [
                            e.jsxs('h3', {
                              className: 'flex items-center gap-2 font-black text-slate-900 mb-4',
                              children: [
                                e.jsx(pe, { size: 18, className: 'text-orange-500' }),
                                ' Partidas / Tallas'
                              ]
                            }),
                            k.length === 0
                              ? e.jsx('p', {
                                  className: 'text-slate-400 font-bold text-sm py-6 text-center',
                                  children: 'Sin partidas registradas para este código.'
                                })
                              : e.jsx('div', {
                                  className: 'overflow-x-auto custom-scrollbar -mx-1',
                                  children: e.jsxs('table', {
                                    className: 'w-full text-left border-collapse min-w-[460px]',
                                    children: [
                                      e.jsx('thead', {
                                        children: e.jsxs('tr', {
                                          className: 'border-b-2 border-slate-100',
                                          children: [
                                            e.jsx('th', {
                                              className:
                                                'px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest',
                                              children: 'Partida / Talla'
                                            }),
                                            e.jsx('th', {
                                              className:
                                                'px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest',
                                              children: 'Fecha Venc.'
                                            }),
                                            e.jsx('th', {
                                              className:
                                                'px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right',
                                              children: 'Disponible'
                                            }),
                                            e.jsx('th', {
                                              className:
                                                'px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right',
                                              children: 'Stock Total'
                                            })
                                          ]
                                        })
                                      }),
                                      e.jsx('tbody', {
                                        className: 'divide-y divide-slate-50',
                                        children: k.map((t, s) =>
                                          e.jsxs(
                                            'tr',
                                            {
                                              className: 'hover:bg-slate-50/60',
                                              children: [
                                                e.jsx('td', {
                                                  className: 'px-3 py-3',
                                                  children: e.jsx('span', {
                                                    className:
                                                      'font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1.5 rounded-lg inline-block',
                                                    children:
                                                      t.partida && t.partida.trim()
                                                        ? t.partida
                                                        : 'S/P'
                                                  })
                                                }),
                                                e.jsx('td', {
                                                  className: 'px-3 py-3',
                                                  children: t.fecha_vencimiento
                                                    ? e.jsxs('span', {
                                                        className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black ${Z(t.fecha_vencimiento) ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`,
                                                        children: [
                                                          e.jsx(me, { size: 12 }),
                                                          ' ',
                                                          t.fecha_vencimiento
                                                        ]
                                                      })
                                                    : e.jsx('span', {
                                                        className: 'text-slate-300 font-bold',
                                                        children: '—'
                                                      })
                                                }),
                                                e.jsx('td', {
                                                  className: 'px-3 py-3 text-right',
                                                  children: e.jsx('span', {
                                                    className: `font-black ${(t.disponible || 0) > 0 ? 'text-emerald-600' : 'text-slate-300'}`,
                                                    children: t.disponible || 0
                                                  })
                                                }),
                                                e.jsx('td', {
                                                  className:
                                                    'px-3 py-3 text-right font-black text-slate-900',
                                                  children: t.stock_total || 0
                                                })
                                              ]
                                            },
                                            s
                                          )
                                        )
                                      })
                                    ]
                                  })
                                })
                          ]
                        }),
                        !d &&
                          e.jsxs('p', {
                            className:
                              'flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 py-2',
                            children: [
                              e.jsx(he, { size: 14 }),
                              ' Solo administradores pueden editar las fotos.'
                            ]
                          })
                      ]
                    })
              ]
            })
        ]
      }),
      q &&
        e.jsxs('div', {
          className: 'fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4',
          onClick: () => F(null),
          children: [
            e.jsx('button', {
              className: 'absolute top-4 right-4 text-white/80 hover:text-white p-2',
              children: e.jsx(B, { size: 28 })
            }),
            e.jsx('img', {
              src: q,
              alt: '',
              className: 'max-w-full max-h-full object-contain rounded-xl'
            })
          ]
        })
    ]
  });
};
export { ye as default };
