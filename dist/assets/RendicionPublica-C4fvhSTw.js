import { j as e } from './query-vendor-CzTZLhyg.js';
import { i as Q, u as X, r as d } from './react-vendor-CByR7_Pi.js';
import {
  a as f,
  a0 as F,
  ao as Y,
  P as I,
  ap as Z,
  ai as O,
  t as b,
  aa as ee,
  aq as se
} from './ui-vendor-DggzEJgL.js';
import {
  e as D,
  r as S,
  T as ae,
  o as ie,
  c as M,
  v as re,
  d as ne,
  a as oe
} from './exportRendicion-aJhfvaB-.js';
import './index-DpKQy1E-.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-DqxLxWcj.js';
const A = (h) => `$ ${Number(h || 0).toLocaleString('es-CL')}`;
function U({ text: h = 'Cargando formulario seguro…' }) {
  return e.jsx('main', {
    className: 'rp-shell',
    children: e.jsxs('section', {
      className: 'rp-status',
      children: [e.jsx('span', { className: 'rp-spinner' }), e.jsx('h2', { children: h })]
    })
  });
}
function te({ token: h, reportId: g, viewToken: v }) {
  const [p, N] = d.useState(null),
    [t, E] = d.useState('');
  if (
    (d.useEffect(() => {
      S.view(h, g, v)
        .then((o) => N(o.data))
        .catch((o) => E(o.message));
    }, [h, g, v]),
    t)
  )
    return e.jsx('main', {
      className: 'rp-shell',
      children: e.jsxs('section', {
        className: 'rp-status rp-error',
        children: [
          e.jsx(f, {}),
          e.jsx('h2', { children: 'No se pudo abrir la rendición' }),
          e.jsx('p', { children: t })
        ]
      })
    });
  if (!p) return e.jsx(U, { text: 'Abriendo rendición…' });
  const n = p.rendicion;
  return e.jsxs('main', {
    className: 'rp-shell rp-view-shell',
    children: [
      e.jsxs('header', {
        className: 'rp-topbar',
        children: [
          e.jsx('img', { src: '/logo-ptm.png', alt: 'PTM' }),
          e.jsxs('div', {
            children: [
              e.jsx('span', { children: 'Documento protegido' }),
              e.jsx('h1', { children: n.folio_texto })
            ]
          }),
          e.jsxs('div', {
            className: 'rp-actions',
            children: [
              e.jsxs('button', {
                disabled: !n.cabecera_completa,
                title: n.cabecera_completa
                  ? ''
                  : 'Oscar debe completar la rendición antes de exportar',
                onClick: () => ne(p),
                children: [e.jsx(ee, { size: 17 }), ' Descargar PDF']
              }),
              e.jsxs('button', {
                className: 'secondary',
                disabled: !n.cabecera_completa,
                onClick: () => oe(p),
                children: [e.jsx(se, { size: 17 }), ' Excel']
              })
            ]
          })
        ]
      }),
      !n.cabecera_completa &&
        e.jsxs('section', {
          className: 'rp-pending-admin',
          children: [
            e.jsx(f, { size: 20 }),
            e.jsxs('div', {
              children: [
                e.jsx('b', { children: 'Detalle recibido correctamente' }),
                e.jsx('span', {
                  children:
                    'Oscar completará los datos administrativos. La descarga se habilitará después.'
                })
              ]
            })
          ]
        }),
      e.jsxs('section', {
        className: 'rp-paper',
        children: [
          e.jsx('h2', { children: 'PLANILLA DE RENDICIÓN DE GASTOS' }),
          e.jsxs('div', {
            className: 'rp-summary',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Responsable rendición' }),
                  e.jsx('span', { children: n.responsable_nombre })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Fecha de la rendición' }),
                  e.jsx('span', {
                    children: new Date(`${n.fecha_rendicion}T12:00:00`).toLocaleDateString('es-CL')
                  })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'RUT del responsable' }),
                  e.jsx('span', { children: n.responsable_rut || '—' })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Nº folio solicitud' }),
                  e.jsx('span', { children: n.folio_texto })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Dirección - área' }),
                  e.jsx('span', { children: n.direccion_area || '—' })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Fondo por rendir' }),
                  e.jsx('span', {
                    children: n.tipo_fondo === 'Fondo por rendir' ? A(n.fondo_por_rendir) : '—'
                  })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Unidad' }),
                  e.jsx('span', { children: n.unidad || '—' })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Centro de costo' }),
                  e.jsx('span', { children: n.centro_costo_nombre || '—' })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Técnico' }),
                  e.jsx('span', { children: n.solicitante_tecnico_nombre || n.tecnico || '—' })
                ]
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Detalle' }),
                  e.jsx('span', { children: n.detalle || '—' })
                ]
              })
            ]
          }),
          e.jsx('div', {
            className: 'rp-table-wrap',
            children: e.jsxs('table', {
              className: 'rp-table',
              children: [
                e.jsx('thead', {
                  children: e.jsxs('tr', {
                    children: [
                      e.jsx('th', { children: 'Nº' }),
                      e.jsx('th', { children: 'Fecha' }),
                      e.jsx('th', { children: 'Nº Bol/Fac' }),
                      e.jsx('th', { children: 'Detalle descripción de gasto' }),
                      e.jsx('th', { children: 'CC' }),
                      e.jsx('th', { children: 'Categoría' }),
                      e.jsx('th', { children: 'Total' })
                    ]
                  })
                }),
                e.jsx('tbody', {
                  children: p.items.map((o) =>
                    e.jsxs(
                      'tr',
                      {
                        children: [
                          e.jsx('td', { children: o.orden }),
                          e.jsx('td', {
                            children: new Date(`${o.fecha}T12:00:00`).toLocaleDateString('es-CL')
                          }),
                          e.jsx('td', { children: o.numero_documento || '—' }),
                          e.jsxs('td', {
                            children: [
                              o.descripcion,
                              e.jsxs('small', {
                                children: [o.subcategoria_nombre, ' · ', o.tipo_documento]
                              })
                            ]
                          }),
                          e.jsx('td', { children: n.centro_costo_codigo }),
                          e.jsx('td', { children: o.categoria_nombre }),
                          e.jsxs('td', {
                            className: 'money',
                            children: ['$ ', Number(o.monto).toLocaleString('es-CL')]
                          })
                        ]
                      },
                      o.id
                    )
                  )
                }),
                e.jsx('tfoot', {
                  children: e.jsxs('tr', {
                    children: [
                      e.jsx('td', { colSpan: '6', children: 'Total General' }),
                      e.jsxs('td', { children: ['$ ', Number(n.total).toLocaleString('es-CL')] })
                    ]
                  })
                })
              ]
            })
          })
        ]
      }),
      p.fotos.length > 0 &&
        e.jsxs('section', {
          className: 'rp-paper',
          children: [
            e.jsx('h2', { children: 'EVIDENCIAS' }),
            e.jsx('div', {
              className: 'rp-gallery',
              children: p.fotos.map((o) =>
                e.jsxs(
                  'a',
                  {
                    href: o.url,
                    target: '_blank',
                    rel: 'noreferrer',
                    children: [
                      e.jsx('img', { src: o.url, alt: 'Comprobante' }),
                      e.jsxs('span', { children: [e.jsx(O, { size: 15 }), ' Abrir original'] })
                    ]
                  },
                  o.id
                )
              )
            })
          ]
        })
    ]
  });
}
function ue() {
  const { token: h, reportId: g, viewToken: v } = Q(),
    p = X(),
    N = d.useRef(Date.now()),
    [t, E] = d.useState(null),
    [n, o] = d.useState(''),
    [L, V] = d.useState(''),
    [w, $] = d.useState({}),
    [P, z] = d.useState(!1),
    [C, R] = d.useState(null),
    [k, G] = d.useState(''),
    [c, _] = d.useState({ solicitante_tecnico_id: '', items: [D()] });
  d.useEffect(() => {
    ((document.title = 'Rendición de gastos · PTM'),
      document.documentElement.style.setProperty('background', '#f4f7fb'),
      g ||
        S.bootstrap(h)
          .then((s) => {
            var a;
            (E(s.catalogs), o(((a = s.link) == null ? void 0 : a.nombre) || 'Rendición de gastos'));
          })
          .catch((s) => V(s.message)));
  }, [h, g]);
  const q = d.useMemo(() => {
      const s = Object.fromEntries(
        ((t == null ? void 0 : t.subcategorias) || []).map((a) => [a.codigo, a])
      );
      return ((t == null ? void 0 : t.relaciones) || []).reduce((a, i) => {
        var r;
        return ((a[(r = i.categoria_codigo)] || (a[r] = [])).push(s[i.subcategoria_codigo]), a);
      }, {});
    }, [t]),
    T = d.useMemo(() => {
      var s;
      return (
        ((s = t == null ? void 0 : t.tecnicos) == null
          ? void 0
          : s.find((a) => a.id === c.solicitante_tecnico_id)) || null
      );
    }, [t, c.solicitante_tecnico_id]);
  if (g && v) return e.jsx(te, { token: h, reportId: g, viewToken: v });
  if (L)
    return e.jsx('main', {
      className: 'rp-shell',
      children: e.jsxs('section', {
        className: 'rp-status rp-error',
        children: [
          e.jsx(f, {}),
          e.jsx('h2', { children: 'Enlace no disponible' }),
          e.jsx('p', { children: L })
        ]
      })
    });
  if (!t) return e.jsx(U, {});
  const m = (s, a, i) =>
      _((r) => ({
        ...r,
        items: r.items.map((l, u) =>
          u === s
            ? { ...l, [a]: i, ...(a === 'categoria_codigo' ? { subcategoria_codigo: '' } : {}) }
            : l
        )
      })),
    B = (s) => _((a) => ({ ...a, items: a.items.filter((i, r) => r !== s) })),
    H = async (s, a) => {
      const i = c.items.reduce((l, u) => l + u.photos.length, 0),
        r = Math.min(3 - c.items[s].photos.length, 10 - i);
      if (r <= 0) return b.error('Máximo 3 fotos por gasto y 10 por rendición.');
      try {
        const l = [];
        for (const u of [...a].slice(0, r)) l.push(await ie(u));
        (m(s, 'photos', [...c.items[s].photos, ...l]),
          b.success('Foto optimizada y lista para subir.'));
      } catch (l) {
        b.error(l.message);
      }
    },
    W = async (s) => {
      s.preventDefault();
      const a = {
          ...c,
          items: c.items.map(({ photos: r, ...l }) => ({
            ...l,
            descripcion: M(l.descripcion),
            numero_documento: M(l.numero_documento),
            monto: Number(l.monto)
          }))
        },
        i = re(a);
      if (($(i), Object.keys(i).length))
        return b.error('Revisa los campos marcados antes de enviar.');
      z(!0);
      try {
        const r = await S.submit(h, a, N.current, k);
        if (r.ignored) return;
        const l = Object.fromEntries(r.report.items.map((x) => [x.client_id, x.id])),
          u = c.items.flatMap((x) => x.photos.map((K) => ({ photo: K, itemId: l[x.client_id] })));
        let y = 0;
        for (const x of u)
          try {
            await S.upload(h, r.view_token, r.report.id, x.itemId, x.photo);
          } catch {
            y += 1;
          }
        y && b.warning(`La rendición fue creada, pero ${y} foto(s) no pudieron subirse.`);
        const J = h ? `/rendiciones/${h}` : '/rendiciones';
        (R({
          folio: r.report.folio,
          total: r.report.total,
          viewPath: `${J}/ver/${r.report.id}/${r.view_token}`,
          failed: y
        }),
          _({ solicitante_tecnico_id: c.solicitante_tecnico_id, items: [D()] }),
          $({}),
          (N.current = Date.now()));
      } catch (r) {
        b.error(r.message);
      } finally {
        z(!1);
      }
    },
    j = (s) => (w[s] ? e.jsx('small', { className: 'rp-field-error', children: w[s] }) : null);
  return e.jsxs('main', {
    className: 'rp-shell',
    children: [
      e.jsxs('header', {
        className: 'rp-topbar',
        children: [
          e.jsx('img', { src: '/logo-ptm.png', alt: 'PTM' }),
          e.jsxs('div', {
            children: [
              e.jsx('span', { children: 'Formulario público protegido' }),
              e.jsx('h1', { children: 'Rendición de gastos' }),
              e.jsx('p', { children: n })
            ]
          }),
          e.jsxs('div', {
            className: 'rp-security',
            children: [
              e.jsx(f, { size: 20 }),
              ' Fotos privadas',
              e.jsx('br', {}),
              'Datos validados'
            ]
          })
        ]
      }),
      e.jsxs('form', {
        className: 'rp-form',
        onSubmit: W,
        noValidate: !0,
        children: [
          e.jsx('input', {
            className: 'rp-honeypot',
            tabIndex: '-1',
            autoComplete: 'off',
            value: k,
            onChange: (s) => G(s.target.value),
            name: 'website'
          }),
          e.jsxs('section', {
            className: 'rp-identity-strip',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx(f, { size: 20 }),
                  e.jsxs('span', {
                    children: [
                      e.jsx('b', { children: 'Identifica quién envía' }),
                      'Solo se aceptan técnicos registrados en Postventa.'
                    ]
                  })
                ]
              }),
              e.jsxs('label', {
                children: [
                  'Técnico Postventa *',
                  e.jsxs('select', {
                    value: c.solicitante_tecnico_id,
                    onChange: (s) => _({ ...c, solicitante_tecnico_id: s.target.value }),
                    children: [
                      e.jsx('option', { value: '', children: 'Selecciona tu nombre…' }),
                      (t.tecnicos || []).map((s) =>
                        e.jsx('option', { value: s.id, children: s.nombre }, s.id)
                      )
                    ]
                  }),
                  j('solicitante_tecnico_id')
                ]
              }),
              T && e.jsxs('b', { className: 'rp-identity-confirmed', children: ['✓ ', T.nombre] })
            ]
          }),
          e.jsxs('section', {
            className: 'rp-card',
            children: [
              e.jsxs('div', {
                className: 'rp-card-title',
                children: [
                  e.jsx('span', { children: '02' }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('h2', { children: 'Detalle de gastos' }),
                      e.jsx('p', {
                        children:
                          'Agrega hasta 15 líneas. Cada descripción debe contener palabras reales.'
                      })
                    ]
                  }),
                  e.jsxs('b', { children: [c.items.length, '/15'] })
                ]
              }),
              c.items.map((s, a) =>
                e.jsxs(
                  'article',
                  {
                    className: 'rp-expense',
                    children: [
                      e.jsxs('div', {
                        className: 'rp-expense-head',
                        children: [
                          e.jsxs('h3', { children: ['Gasto ', a + 1] }),
                          c.items.length > 1 &&
                            e.jsx('button', {
                              type: 'button',
                              className: 'icon-danger',
                              onClick: () => B(a),
                              'aria-label': 'Eliminar gasto',
                              children: e.jsx(F, { size: 17 })
                            })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'rp-grid rp-grid-item',
                        children: [
                          e.jsxs('label', {
                            children: [
                              'Fecha *',
                              e.jsx('input', {
                                type: 'date',
                                max: new Date().toLocaleDateString('en-CA'),
                                value: s.fecha,
                                onChange: (i) => m(a, 'fecha', i.target.value)
                              }),
                              j(`items.${a}.fecha`)
                            ]
                          }),
                          e.jsxs('label', {
                            children: [
                              'Categoría *',
                              e.jsxs('select', {
                                value: s.categoria_codigo,
                                onChange: (i) => m(a, 'categoria_codigo', i.target.value),
                                children: [
                                  e.jsx('option', { value: '', children: 'Seleccionar…' }),
                                  t.categorias.map((i) =>
                                    e.jsx(
                                      'option',
                                      { value: i.codigo, children: i.nombre },
                                      i.codigo
                                    )
                                  )
                                ]
                              }),
                              j(`items.${a}.categoria_codigo`)
                            ]
                          }),
                          e.jsxs('label', {
                            children: [
                              'Subcategoría *',
                              e.jsxs('select', {
                                disabled: !s.categoria_codigo,
                                value: s.subcategoria_codigo,
                                onChange: (i) => m(a, 'subcategoria_codigo', i.target.value),
                                children: [
                                  e.jsx('option', { value: '', children: 'Seleccionar…' }),
                                  (q[s.categoria_codigo] || [])
                                    .filter(Boolean)
                                    .map((i) =>
                                      e.jsx(
                                        'option',
                                        { value: i.codigo, children: i.nombre },
                                        i.codigo
                                      )
                                    )
                                ]
                              }),
                              j(`items.${a}.subcategoria_codigo`)
                            ]
                          }),
                          e.jsxs('label', {
                            children: [
                              'Monto *',
                              e.jsx('input', {
                                type: 'number',
                                min: '1',
                                max: '999999999',
                                step: '1',
                                inputMode: 'numeric',
                                placeholder: '$ 0',
                                value: s.monto,
                                onChange: (i) => m(a, 'monto', i.target.value)
                              }),
                              j(`items.${a}.monto`)
                            ]
                          }),
                          e.jsxs('label', {
                            className: 'rp-full',
                            children: [
                              'Descripción *',
                              e.jsx('textarea', {
                                maxLength: '800',
                                placeholder: 'Ej.: Compra de materiales para reparación de bodega',
                                value: s.descripcion,
                                onChange: (i) => m(a, 'descripcion', i.target.value)
                              }),
                              j(`items.${a}.descripcion`)
                            ]
                          }),
                          e.jsxs('label', {
                            children: [
                              'Documento *',
                              e.jsxs('select', {
                                value: s.tipo_documento,
                                onChange: (i) => m(a, 'tipo_documento', i.target.value),
                                children: [
                                  e.jsx('option', { value: '', children: 'Seleccionar…' }),
                                  ae.map((i) => e.jsx('option', { children: i }, i))
                                ]
                              }),
                              j(`items.${a}.tipo_documento`)
                            ]
                          }),
                          e.jsxs('label', {
                            children: [
                              'Nº de documento',
                              e.jsx('input', {
                                maxLength: '80',
                                placeholder: 'Ej.: 195987',
                                value: s.numero_documento,
                                onChange: (i) => m(a, 'numero_documento', i.target.value)
                              }),
                              j(`items.${a}.numero_documento`)
                            ]
                          }),
                          e.jsxs('label', {
                            className: 'rp-photo-input',
                            children: [
                              e.jsx('span', { children: 'Escáner de comprobante' }),
                              e.jsx('input', {
                                type: 'file',
                                accept: 'image/jpeg,image/png,image/webp,image/heic,image/heif',
                                capture: 'environment',
                                multiple: !0,
                                onChange: (i) => {
                                  (H(a, i.target.files), (i.target.value = ''));
                                }
                              }),
                              e.jsxs('b', {
                                children: [e.jsx(Y, { size: 18 }), ' Escanear con cámara']
                              }),
                              e.jsxs('small', {
                                children: [
                                  s.photos.length,
                                  '/3 · Captura trasera, recorte y optimización automática'
                                ]
                              })
                            ]
                          }),
                          s.photos.length > 0 &&
                            e.jsx('div', {
                              className: 'rp-previews',
                              children: s.photos.map((i, r) =>
                                e.jsxs(
                                  'figure',
                                  {
                                    children: [
                                      e.jsx('img', {
                                        src: URL.createObjectURL(i),
                                        alt: 'Vista previa'
                                      }),
                                      e.jsx('button', {
                                        type: 'button',
                                        onClick: () =>
                                          m(
                                            a,
                                            'photos',
                                            s.photos.filter((l, u) => u !== r)
                                          ),
                                        children: e.jsx(F, { size: 14 })
                                      })
                                    ]
                                  },
                                  `${i.name}-${r}`
                                )
                              )
                            })
                        ]
                      })
                    ]
                  },
                  s.client_id
                )
              ),
              c.items.length < 15 &&
                e.jsxs('button', {
                  type: 'button',
                  className: 'rp-add',
                  onClick: () => _({ ...c, items: [...c.items, D()] }),
                  children: [e.jsx(I, { size: 18 }), ' Agregar otro gasto']
                }),
              j('items')
            ]
          }),
          e.jsxs('footer', {
            className: 'rp-submit',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx(f, { size: 18 }),
                  e.jsxs('span', {
                    children: [
                      e.jsx('b', { children: 'Envío cifrado' }),
                      e.jsx('small', {
                        children:
                          'Las fotos no son públicas y los enlaces de visualización expiran.'
                      })
                    ]
                  })
                ]
              }),
              e.jsx('button', {
                type: 'submit',
                disabled: P,
                children: P
                  ? e.jsxs(e.Fragment, {
                      children: [e.jsx('span', { className: 'rp-spinner' }), ' Guardando…']
                    })
                  : e.jsxs(e.Fragment, { children: [e.jsx(Z, { size: 19 }), ' Enviar rendición'] })
              })
            ]
          })
        ]
      }),
      C &&
        e.jsx('div', {
          className: 'rp-success-backdrop',
          role: 'dialog',
          'aria-modal': 'true',
          children: e.jsxs('section', {
            className: 'rp-success-card',
            children: [
              e.jsx('span', { className: 'rp-success-check', children: '✓' }),
              e.jsx('small', { children: 'Rendición guardada correctamente' }),
              e.jsx('h2', { children: C.folio }),
              e.jsx('p', {
                children:
                  'Se notificó a Oscar Leiva y el formulario ya quedó limpio para registrar una nueva rendición.'
              }),
              e.jsx('strong', { children: A(C.total) }),
              e.jsxs('div', {
                children: [
                  e.jsxs('button', {
                    type: 'button',
                    onClick: () => p(C.viewPath),
                    children: [e.jsx(O, { size: 17 }), ' Ver comprobante']
                  }),
                  e.jsxs('button', {
                    type: 'button',
                    className: 'primary',
                    onClick: () => R(null),
                    children: [e.jsx(I, { size: 17 }), ' Nueva rendición']
                  })
                ]
              })
            ]
          })
        })
    ]
  });
}
export { ue as default };
