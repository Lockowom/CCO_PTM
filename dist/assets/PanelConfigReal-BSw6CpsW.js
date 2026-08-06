import { j as e } from './query-vendor-BNjBrM5A.js';
import { r as s } from './react-vendor-6aw4XXjH.js';
import {
  d as G,
  t as J,
  s as K,
  a as Q,
  b as Y,
  c as H,
  e as X,
  f as Z,
  g as W,
  h as ee
} from './configService-BHU6BKp0.js';
import { u as te } from './index-BSnpYyAh.js';
import './supabase-vendor-4Fjsfb0a.js';
import './ui-vendor-CTbhg6u_.js';
import './animation-vendor-JfdD7EdN.js';
const q = '#ea580c',
  ae = { nombre: '', codigo: '', telefono: '', email: '', activo: !0 };
function O({
  noun: r,
  nounNuevo: i,
  editable: c,
  fetchAll: m,
  save: g,
  toggle: b,
  remove: u,
  onAfterWrite: y,
  extraFields: d = []
}) {
  const [h, f] = s.useState([]),
    [T, N] = s.useState(!0),
    [p, a] = s.useState(''),
    [l, D] = s.useState(!0),
    [n, x] = s.useState(null),
    [I, C] = s.useState(''),
    [k, P] = s.useState(!1),
    [v, j] = s.useState(null);
  s.useEffect(() => {
    if (!v) return;
    const t = setTimeout(() => j(null), 3500);
    return () => clearTimeout(t);
  }, [v]);
  const L = s.useCallback(async () => {
    N(!0);
    const t = await m(!0);
    (f(t), N(!1));
  }, [m]);
  s.useEffect(() => {
    L();
  }, [L]);
  const A = s.useCallback(async () => {
      const t = await m(!0);
      (f(t), y == null || y(t));
    }, [m, y]),
    M = s.useMemo(() => {
      const t = p.trim().toLowerCase();
      return h.filter((o) =>
        !l && !o.activo
          ? !1
          : t
            ? [o.nombre, o.codigo, o.telefono, o.email].some((E) =>
                (E || '').toLowerCase().includes(t)
              )
            : !0
      );
    }, [h, p, l]),
    V = s.useMemo(() => ({ total: h.length, activos: h.filter((t) => t.activo).length }), [h]),
    _ = () => {
      const t = { ...ae };
      (d.forEach((o) => {
        t[o.key] = '';
      }),
        x(t),
        C(''));
    },
    F = (t) => {
      const o = {
        id: t.id,
        nombre: t.nombre,
        codigo: t.codigo || '',
        telefono: t.telefono || '',
        email: t.email || '',
        activo: t.activo
      };
      (d.forEach((E) => {
        o[E.key] = t[E.key] || '';
      }),
        x(o),
        C(''));
    },
    R = async () => {
      if (!n) return;
      if (!n.nombre.trim()) {
        C('El nombre es obligatorio');
        return;
      }
      P(!0);
      const t = await g(n);
      if ((P(!1), !t.ok)) {
        C(t.error || 'No se pudo guardar');
        return;
      }
      (j({ message: n.id ? `${z(r)} actualizado` : `${z(r)} creado`, type: 'success' }),
        x(null),
        await A());
    },
    U = async (t) => {
      if (!(await b(t.id, !t.activo))) {
        j({ message: 'No se pudo cambiar el estado', type: 'error' });
        return;
      }
      (j({ message: `${t.nombre} ${t.activo ? 'desactivado' : 'activado'}`, type: 'success' }),
        await A());
    },
    B = async (t) => {
      if (
        !confirm(`¿Eliminar "${t.nombre}"?

Las operaciones históricas que lo usaron conservan el dato (es texto, no referencia). Si solo quieres ocultarlo de los dropdowns, usa "Desactivar".`)
      )
        return;
      if (!(await u(t.id))) {
        j({ message: 'No se pudo eliminar', type: 'error' });
        return;
      }
      (j({ message: `${t.nombre} eliminado`, type: 'success' }), await A());
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs('div', {
        className: 'flex flex-wrap items-center gap-3 mb-4',
        children: [
          e.jsx('div', {
            className: 'relative flex-1 min-w-[200px]',
            children: e.jsx('input', {
              value: p,
              onChange: (t) => a(t.target.value),
              placeholder: 'Buscar por nombre, código, teléfono o email…',
              className:
                'w-full h-9 pl-3 pr-3 text-[13px] rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200'
            })
          }),
          e.jsxs('label', {
            className:
              'flex items-center gap-1.5 text-[12px] text-gray-600 select-none cursor-pointer',
            children: [
              e.jsx('input', {
                type: 'checkbox',
                checked: l,
                onChange: (t) => D(t.target.checked),
                className: 'accent-orange-600'
              }),
              'Mostrar inactivos'
            ]
          }),
          e.jsxs('span', {
            className: 'text-[12px] text-gray-400',
            children: [V.activos, ' activos · ', V.total, ' total']
          }),
          c &&
            e.jsxs('button', {
              onClick: _,
              className: 'h-9 px-3 rounded-md text-white text-[13px] font-medium hover:opacity-90',
              style: { background: q },
              children: ['+ Nuevo ', i]
            })
        ]
      }),
      !c &&
        e.jsxs('div', {
          className:
            'mb-4 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2',
          children: [
            'Modo solo lectura. Para administrar ',
            r,
            'es necesitas rol ',
            e.jsx('b', { children: 'supervisor' }),
            ' o ',
            e.jsx('b', { children: 'admin' }),
            '.'
          ]
        }),
      e.jsx('div', {
        className: 'bg-white border border-gray-200 rounded-lg overflow-hidden',
        children: T
          ? e.jsx('div', {
              className: 'p-8 text-center text-gray-400 text-[13px]',
              children: 'Cargando…'
            })
          : M.length === 0
            ? e.jsxs('div', {
                className: 'p-8 text-center text-gray-400 text-[13px]',
                children: ['Sin ', r, 'es que coincidan.']
              })
            : e.jsxs('table', {
                className: 'w-full text-[13px]',
                children: [
                  e.jsx('thead', {
                    children: e.jsxs('tr', {
                      className:
                        'text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100',
                      children: [
                        e.jsx('th', { className: 'px-4 py-2.5 font-medium', children: 'Nombre' }),
                        d.map((t) =>
                          e.jsx(
                            'th',
                            {
                              className: 'px-4 py-2.5 font-medium hidden sm:table-cell',
                              children: t.label
                            },
                            t.key
                          )
                        ),
                        e.jsx('th', {
                          className: 'px-4 py-2.5 font-medium hidden lg:table-cell',
                          children: 'Código'
                        }),
                        e.jsx('th', {
                          className: 'px-4 py-2.5 font-medium hidden lg:table-cell',
                          children: 'Teléfono'
                        }),
                        e.jsx('th', {
                          className: 'px-4 py-2.5 font-medium hidden lg:table-cell',
                          children: 'Email'
                        }),
                        e.jsx('th', { className: 'px-4 py-2.5 font-medium', children: 'Estado' }),
                        c &&
                          e.jsx('th', {
                            className: 'px-4 py-2.5 font-medium text-right',
                            children: 'Acciones'
                          })
                      ]
                    })
                  }),
                  e.jsx('tbody', {
                    children: M.map((t) =>
                      e.jsxs(
                        'tr',
                        {
                          className: `border-b border-gray-50 last:border-0 ${t.activo ? '' : 'bg-gray-50/60'}`,
                          children: [
                            e.jsx('td', {
                              className: 'px-4 py-2.5 font-medium',
                              children: t.nombre
                            }),
                            d.map((o) =>
                              e.jsx(
                                'td',
                                {
                                  className: 'px-4 py-2.5 text-gray-500 hidden sm:table-cell',
                                  children: t[o.key] || '—'
                                },
                                o.key
                              )
                            ),
                            e.jsx('td', {
                              className: 'px-4 py-2.5 text-gray-500 hidden lg:table-cell',
                              children: t.codigo || '—'
                            }),
                            e.jsx('td', {
                              className: 'px-4 py-2.5 text-gray-500 hidden lg:table-cell',
                              children: t.telefono || '—'
                            }),
                            e.jsx('td', {
                              className: 'px-4 py-2.5 text-gray-500 hidden lg:table-cell',
                              children: t.email || '—'
                            }),
                            e.jsx('td', {
                              className: 'px-4 py-2.5',
                              children: e.jsxs('span', {
                                className: `inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${t.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`,
                                children: [
                                  e.jsx('span', {
                                    className: `h-1.5 w-1.5 rounded-full ${t.activo ? 'bg-green-500' : 'bg-gray-400'}`
                                  }),
                                  t.activo ? 'Activo' : 'Inactivo'
                                ]
                              })
                            }),
                            c &&
                              e.jsx('td', {
                                className: 'px-4 py-2.5',
                                children: e.jsxs('div', {
                                  className: 'flex items-center justify-end gap-2 text-[12px]',
                                  children: [
                                    e.jsx('button', {
                                      onClick: () => F(t),
                                      className: 'text-gray-500 hover:text-gray-900',
                                      children: 'Editar'
                                    }),
                                    e.jsx('button', {
                                      onClick: () => U(t),
                                      className: 'text-gray-500 hover:text-gray-900',
                                      children: t.activo ? 'Desactivar' : 'Activar'
                                    }),
                                    e.jsx('button', {
                                      onClick: () => B(t),
                                      className: 'text-red-500 hover:text-red-700',
                                      children: 'Eliminar'
                                    })
                                  ]
                                })
                              })
                          ]
                        },
                        t.id
                      )
                    )
                  })
                ]
              })
      }),
      n &&
        e.jsx('div', {
          className:
            'fixed inset-0 z-20 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4',
          onClick: () => !k && x(null),
          children: e.jsxs('div', {
            className: 'bg-white rounded-xl shadow-xl w-full max-w-md p-5',
            onClick: (t) => t.stopPropagation(),
            children: [
              e.jsx('h2', {
                className: 'text-[15px] font-semibold mb-4',
                children: n.id ? `Editar ${r}` : `Nuevo ${r}`
              }),
              e.jsxs('div', {
                className: 'space-y-3',
                children: [
                  e.jsx(w, {
                    label: 'Nombre *',
                    children: e.jsx('input', {
                      autoFocus: !0,
                      value: n.nombre,
                      onChange: (t) => x({ ...n, nombre: t.target.value }),
                      className: 'form-inp'
                    })
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-3',
                    children: [
                      e.jsx(w, {
                        label: 'Código',
                        children: e.jsx('input', {
                          value: n.codigo,
                          onChange: (t) => x({ ...n, codigo: t.target.value }),
                          className: 'form-inp'
                        })
                      }),
                      e.jsx(w, {
                        label: 'Teléfono',
                        children: e.jsx('input', {
                          value: n.telefono,
                          onChange: (t) => x({ ...n, telefono: t.target.value }),
                          className: 'form-inp'
                        })
                      })
                    ]
                  }),
                  e.jsx(w, {
                    label: 'Email',
                    children: e.jsx('input', {
                      type: 'email',
                      value: n.email,
                      onChange: (t) => x({ ...n, email: t.target.value }),
                      className: 'form-inp'
                    })
                  }),
                  d.length > 0 &&
                    e.jsx('div', {
                      className: 'grid grid-cols-2 gap-3',
                      children: d.map((t) =>
                        e.jsx(
                          w,
                          {
                            label: t.label,
                            children: e.jsx('input', {
                              value: n[t.key] || '',
                              onChange: (o) => x({ ...n, [t.key]: o.target.value }),
                              placeholder: t.placeholder,
                              className: 'form-inp'
                            })
                          },
                          t.key
                        )
                      )
                    }),
                  e.jsxs('label', {
                    className:
                      'flex items-center gap-2 text-[13px] text-gray-700 select-none cursor-pointer pt-1',
                    children: [
                      e.jsx('input', {
                        type: 'checkbox',
                        checked: n.activo,
                        onChange: (t) => x({ ...n, activo: t.target.checked }),
                        className: 'accent-orange-600'
                      }),
                      'Activo (aparece en los dropdowns)'
                    ]
                  })
                ]
              }),
              I && e.jsx('p', { className: 'text-[12px] text-red-600 mt-3', children: I }),
              e.jsxs('div', {
                className: 'flex items-center justify-end gap-2 mt-5',
                children: [
                  e.jsx('button', {
                    onClick: () => x(null),
                    disabled: k,
                    className:
                      'h-9 px-3 text-[13px] text-gray-500 hover:text-gray-900 disabled:opacity-50',
                    children: 'Cancelar'
                  }),
                  e.jsx('button', {
                    onClick: R,
                    disabled: k,
                    className:
                      'h-9 px-4 rounded-md text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50',
                    style: { background: q },
                    children: k ? 'Guardando…' : 'Guardar'
                  })
                ]
              })
            ]
          })
        }),
      v &&
        e.jsx('div', {
          className: `fixed bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-lg text-[13px] font-medium text-white shadow-lg ${v.type === 'success' ? 'bg-gray-900' : 'bg-red-600'}`,
          children: v.message
        }),
      e.jsx('style', {
        children: `
        .form-inp {
          width: 100%;
          height: 2.25rem;
          padding: 0 0.625rem;
          font-size: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          outline: none;
        }
        .form-inp:focus { box-shadow: 0 0 0 2px #fed7aa; }
      `
      })
    ]
  });
}
function z(r) {
  return r.charAt(0).toUpperCase() + r.slice(1);
}
function w({ label: r, children: i }) {
  return e.jsxs('div', {
    children: [
      e.jsx('label', {
        className: 'block text-[11px] font-medium text-gray-500 mb-1',
        children: r
      }),
      i
    ]
  });
}
const S = '#ea580c';
async function se(r) {
  try {
    await fetch('/api/gas-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'syncTransportistas', data: { transportistas: r } })
    });
  } catch {}
}
function ue() {
  const { hasPermission: r } = te(),
    [i, c] = s.useState('transportistas'),
    m = r('manage_panel'),
    g = s.useCallback((b) => {
      se(b.filter((u) => u.activo).map((u) => u.nombre));
    }, []);
  return r('manage_panel')
    ? e.jsxs('div', {
        className: 'min-h-screen bg-gray-50 text-gray-900',
        children: [
          e.jsx('header', {
            className: 'sticky top-0 z-10 bg-white border-b border-gray-200',
            children: e.jsx('div', {
              className: 'max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3',
              children: e.jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx('span', {
                    className:
                      'inline-flex h-7 w-7 items-center justify-center rounded-md text-white text-[13px] font-bold',
                    style: { background: S },
                    children: 'P'
                  }),
                  e.jsxs('div', {
                    className: 'leading-tight',
                    children: [
                      e.jsx('h1', {
                        className: 'text-[15px] font-semibold',
                        children: 'Configuración'
                      }),
                      e.jsx('p', {
                        className: 'text-[11px] text-gray-400 -mt-0.5',
                        children: 'Mantenedor de catálogos · v1.1'
                      })
                    ]
                  })
                ]
              })
            })
          }),
          e.jsxs('main', {
            className: 'max-w-5xl mx-auto px-4 sm:px-6 py-6',
            children: [
              e.jsxs('nav', {
                className: 'flex items-center gap-1 mb-5 text-[13px]',
                children: [
                  e.jsx($, {
                    active: i === 'transportistas',
                    onClick: () => c('transportistas'),
                    children: 'Transportistas'
                  }),
                  e.jsx($, {
                    active: i === 'vendedores',
                    onClick: () => c('vendedores'),
                    children: 'Vendedores'
                  }),
                  e.jsx($, {
                    active: i === 'auditoria',
                    onClick: () => c('auditoria'),
                    children: 'Auditoría'
                  }),
                  e.jsx('span', {
                    className: 'px-3 py-1.5 rounded-md text-gray-300 cursor-not-allowed',
                    title: 'Acoplado a KPIs — no editable',
                    children: 'Estados'
                  }),
                  e.jsx('span', {
                    className: 'px-3 py-1.5 rounded-md text-gray-300 cursor-not-allowed',
                    title: 'Próximamente',
                    children: 'Usuarios'
                  })
                ]
              }),
              i === 'transportistas' &&
                e.jsx(
                  O,
                  {
                    noun: 'transportista',
                    nounNuevo: 'transportista',
                    editable: m,
                    fetchAll: Q,
                    save: K,
                    toggle: J,
                    remove: G,
                    onAfterWrite: g
                  },
                  'transportistas'
                ),
              i === 'vendedores' &&
                e.jsx(
                  O,
                  {
                    noun: 'vendedor',
                    nounNuevo: 'vendedor',
                    editable: m,
                    fetchAll: Z,
                    save: X,
                    toggle: H,
                    remove: Y,
                    extraFields: [
                      { key: 'centro_costo', label: 'C. Costo', placeholder: 'Ej: 1-06' },
                      { key: 'division', label: 'División', placeholder: 'Ej: DIV. INSTITUCIONAL' }
                    ]
                  },
                  'vendedores'
                ),
              i === 'auditoria' && e.jsx(oe, {})
            ]
          })
        ]
      })
    : e.jsx('div', {
        className: 'min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-4',
        children: e.jsxs('div', {
          className:
            'bg-white border border-gray-200 rounded-xl shadow-sm max-w-sm w-full p-6 text-center',
          children: [
            e.jsx('span', {
              className:
                'inline-flex h-9 w-9 items-center justify-center rounded-md text-white text-[15px] font-bold mb-3',
              style: { background: S },
              children: 'P'
            }),
            e.jsx('h1', {
              className: 'text-[15px] font-semibold',
              children: 'Acceso solo para administradores'
            }),
            e.jsxs('p', {
              className: 'text-[12px] text-gray-400 mt-1',
              children: [
                'Esta sección requiere el permiso ',
                e.jsx('b', { children: 'manage_panel' }),
                '.'
              ]
            })
          ]
        })
      });
}
function $({ active: r, onClick: i, children: c }) {
  return e.jsx('button', {
    onClick: i,
    className: `px-3 py-1.5 rounded-md font-medium transition-colors ${r ? 'text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`,
    style: r ? { background: S } : void 0,
    children: c
  });
}
const re = {
    create: { label: 'Creó', cls: 'bg-emerald-100 text-emerald-700' },
    update: { label: 'Editó', cls: 'bg-blue-100 text-blue-700' },
    estado: { label: 'Cambió estado', cls: 'bg-amber-100 text-amber-700' },
    delete: { label: 'Eliminó', cls: 'bg-rose-100 text-rose-700' }
  },
  ne = [
    ['', 'Todas'],
    ['create', 'Creación'],
    ['update', 'Edición'],
    ['estado', 'Estado'],
    ['delete', 'Eliminación']
  ];
function oe() {
  const [r, i] = s.useState([]),
    [c, m] = s.useState([]),
    [g, b] = s.useState(!0),
    [u, y] = s.useState(''),
    [d, h] = s.useState(''),
    f = s.useCallback(async () => {
      b(!0);
      const [a, l] = await Promise.all([W({ accion: d }), ee()]);
      (i(a), m(l), b(!1));
    }, [d]);
  s.useEffect(() => {
    let a = !0;
    return (
      (async () => a && (await f()))(),
      () => {
        a = !1;
      }
    );
  }, [f]);
  const T = (a) => {
      if (!a) return '—';
      const l = new Date(a);
      return isNaN(l)
        ? String(a)
        : l.toLocaleString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
    },
    N = u.trim().toLowerCase(),
    p = N
      ? r.filter((a) =>
          [a.actor, a.nv, a.accion].some((l) =>
            String(l || '')
              .toLowerCase()
              .includes(N)
          )
        )
      : r;
  return e.jsxs(e.Fragment, {
    children: [
      c.length > 0 &&
        e.jsx('div', {
          className: 'flex flex-wrap items-center gap-2 mb-4',
          children: c.map((a) =>
            e.jsxs(
              'span',
              {
                className:
                  'inline-flex items-center gap-1.5 text-[11px] text-gray-600 bg-white border border-gray-200 rounded-full px-2.5 py-1',
                children: [
                  e.jsx('span', { className: 'font-medium text-gray-900', children: a.nombre }),
                  e.jsxs('span', {
                    className: 'text-gray-400',
                    children: [
                      a.total,
                      ' mov · ',
                      a.creates,
                      'C · ',
                      a.updates,
                      'U · ',
                      a.estados,
                      'E · ',
                      a.deletes,
                      'D'
                    ]
                  })
                ]
              },
              a.nombre
            )
          )
        }),
      e.jsxs('div', {
        className: 'flex flex-wrap items-center gap-2 mb-4',
        children: [
          e.jsx('div', {
            className: 'flex gap-1 p-1 bg-gray-100 rounded-lg',
            children: ne.map(([a, l]) =>
              e.jsx(
                'button',
                {
                  onClick: () => h(a),
                  className: `px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${d === a ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`,
                  style: d === a ? { color: S } : void 0,
                  children: l
                },
                a || 'all'
              )
            )
          }),
          e.jsx('input', {
            value: u,
            onChange: (a) => y(a.target.value),
            placeholder: 'Buscar operador o N.V.…',
            className:
              'flex-1 min-w-[160px] max-w-xs px-3 py-1.5 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-orange-400'
          }),
          e.jsx('button', {
            onClick: f,
            className:
              'px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50',
            children: 'Actualizar'
          })
        ]
      }),
      e.jsx('div', {
        className: 'bg-white border border-gray-200 rounded-lg overflow-hidden',
        children: g
          ? e.jsx('div', {
              className: 'p-8 text-center text-gray-400 text-[13px]',
              children: 'Cargando…'
            })
          : p.length === 0
            ? e.jsxs('div', {
                className: 'p-10 text-center',
                children: [
                  e.jsx('p', {
                    className: 'text-[13px] font-medium text-gray-600',
                    children: 'Aún no hay movimientos registrados'
                  }),
                  e.jsx('p', {
                    className: 'text-[12px] text-gray-400 mt-1 max-w-sm mx-auto',
                    children:
                      'La bitácora se llena automáticamente cada vez que se crea, edita, cambia de estado o elimina una N.V. desde el Panel (Ingresar).'
                  })
                ]
              })
            : e.jsxs('table', {
                className: 'w-full text-[13px]',
                children: [
                  e.jsx('thead', {
                    children: e.jsxs('tr', {
                      className:
                        'text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100',
                      children: [
                        e.jsx('th', { className: 'px-4 py-2.5 font-medium', children: 'Fecha' }),
                        e.jsx('th', { className: 'px-4 py-2.5 font-medium', children: 'Operador' }),
                        e.jsx('th', { className: 'px-4 py-2.5 font-medium', children: 'Acción' }),
                        e.jsx('th', { className: 'px-4 py-2.5 font-medium', children: 'N.V.' })
                      ]
                    })
                  }),
                  e.jsx('tbody', {
                    children: p.map((a) => {
                      const l = re[a.accion] || {
                        label: a.accion || '—',
                        cls: 'bg-gray-100 text-gray-600'
                      };
                      return e.jsxs(
                        'tr',
                        {
                          className: 'border-b border-gray-50 last:border-0',
                          children: [
                            e.jsx('td', {
                              className: 'px-4 py-2.5 text-gray-500 whitespace-nowrap',
                              children: T(a.ts)
                            }),
                            e.jsx('td', {
                              className: 'px-4 py-2.5 font-medium',
                              children: a.actor || '—'
                            }),
                            e.jsx('td', {
                              className: 'px-4 py-2.5',
                              children: e.jsx('span', {
                                className: `inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${l.cls}`,
                                children: l.label
                              })
                            }),
                            e.jsx('td', {
                              className: 'px-4 py-2.5 text-gray-500 font-mono',
                              children: a.nv || '—'
                            })
                          ]
                        },
                        a.id
                      );
                    })
                  })
                ]
              })
      }),
      !g &&
        p.length > 0 &&
        e.jsxs('p', {
          className: 'text-[11px] text-gray-400 mt-2',
          children: [p.length, ' movimiento', p.length !== 1 ? 's' : '', ' · últimos 150']
        })
    ]
  });
}
export { ue as default };
