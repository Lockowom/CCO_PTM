import { j as e } from './query-vendor-BNjBrM5A.js';
import { r as i, R as w } from './react-vendor-6aw4XXjH.js';
import { s as k } from './index-DC1UTG7q.js';
import { x as C, X as _, ah as E, g as S, d as R } from './ui-vendor-CTbhg6u_.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
const g = {
    'En Proceso': '#f59e0b',
    'P / VENDEDOR': '#d97706',
    'P / STOCK': '#b45309',
    'P / RETIRO': '#92400e',
    Shipping: '#8b5cf6',
    Currier: '#7c3aed',
    'En Ruta': '#06b6d4',
    Entregado: '#22c55e',
    NULA: '#94a3b8',
    REFACTURADO: '#94a3b8',
    RECHAZADO: '#94a3b8',
    'Sin estado': '#64748b'
  },
  T = (a) => (a == null || a === '' ? '—' : String(a)),
  o = (a) => (a ? String(a).slice(0, 10) : '—');
function h({ titulo: a, children: c }) {
  return w.Children.toArray(c).filter(Boolean).length === 0
    ? null
    : e.jsxs('div', {
        children: [
          e.jsx('h3', {
            className:
              'text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1',
            children: a
          }),
          e.jsx('div', { className: 'space-y-1', children: c })
        ]
      });
}
function t({ label: a, value: c, color: x }) {
  const d = T(c);
  return d === '—'
    ? null
    : e.jsxs('div', {
        className: 'flex items-baseline gap-2 text-sm',
        children: [
          e.jsx('span', { className: 'text-slate-400 text-xs w-28 shrink-0', children: a }),
          x
            ? e.jsx('span', {
                className: 'font-black px-1.5 py-0.5 rounded text-white text-xs',
                style: { backgroundColor: x },
                children: d
              })
            : e.jsx('span', { className: 'text-slate-700 font-bold', children: d })
        ]
      });
}
function A() {
  const [a, c] = i.useState(''),
    [x, d] = i.useState(null),
    [r, p] = i.useState([]),
    [N, f] = i.useState(!1),
    [b, j] = i.useState(''),
    m = a.trim();
  i.useEffect(() => {
    if (m.length < 3) {
      (p([]), j(''));
      return;
    }
    (f(!0), j(''));
    const s = setTimeout(async () => {
      const { data: n, error: l } = await k.rpc('buscar_nv_publico', { p_q: m });
      if (l) {
        const u = /rate.?limit/i.test(l.message || '') || l.code === 'P0001';
        (j(
          u
            ? 'Demasiadas consultas seguidas. Espera un momento e intenta de nuevo.'
            : 'No se pudo consultar. Intenta nuevamente.'
        ),
          p([]));
      } else p(n || []);
      f(!1);
    }, 300);
    return () => clearTimeout(s);
  }, [m]);
  const v = m.length >= 3,
    y = i.useMemo(() => {
      const s = {};
      return (
        r.forEach((n) => {
          const l = n.estado || 'Sin estado';
          s[l] = (s[l] || 0) + 1;
        }),
        s
      );
    }, [r]);
  return e.jsxs('div', {
    className: 'min-h-screen bg-slate-50',
    style: { fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
    children: [
      e.jsx('header', {
        className: 'bg-white border-b border-slate-200',
        children: e.jsxs('div', {
          className: 'max-w-3xl mx-auto px-4 py-4 flex items-center gap-3',
          children: [
            e.jsx('div', {
              className:
                'w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0',
              style: { background: 'linear-gradient(135deg, #f57c00, #e65100)' },
              children: 'PTM'
            }),
            e.jsxs('div', {
              children: [
                e.jsx('h1', {
                  className: 'text-lg font-black text-slate-800 leading-tight',
                  children: 'Consulta tu Nota de Venta'
                }),
                e.jsx('p', {
                  className: 'text-xs text-slate-400',
                  children: 'Seguimiento de estado y despacho · PTM'
                })
              ]
            })
          ]
        })
      }),
      e.jsxs('main', {
        className: 'max-w-3xl mx-auto px-4 py-6 space-y-4',
        children: [
          e.jsxs('div', {
            className: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-4',
            children: [
              e.jsxs('div', {
                className: 'relative',
                children: [
                  e.jsx(C, {
                    size: 18,
                    className: 'absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
                  }),
                  e.jsx('input', {
                    value: a,
                    onChange: (s) => c(s.target.value),
                    autoFocus: !0,
                    placeholder: 'N° de NV, Factura, Guía o N° de envío…',
                    className:
                      'w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none transition'
                  }),
                  a &&
                    e.jsx('button', {
                      onClick: () => {
                        (c(''), d(null));
                      },
                      className:
                        'absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600',
                      children: e.jsx(_, { size: 16 })
                    })
                ]
              }),
              e.jsxs('p', {
                className: 'mt-2 text-xs text-slate-400',
                children: [
                  'Ingresa el ',
                  e.jsx('b', { children: 'número exacto' }),
                  ' de tu nota de venta, factura, guía o N° de envío.'
                ]
              })
            ]
          }),
          r.length > 0 &&
            e.jsxs('div', {
              className: 'flex flex-wrap items-center gap-2',
              children: [
                e.jsxs('span', {
                  className: 'text-sm font-black text-slate-600',
                  children: [r.length, ' resultado', r.length !== 1 ? 's' : '']
                }),
                e.jsx('span', { className: 'text-slate-300', children: '|' }),
                Object.entries(y).map(([s, n]) =>
                  e.jsxs(
                    'span',
                    {
                      className:
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white',
                      style: { backgroundColor: g[s] || '#64748b' },
                      children: [s, ' (', n, ')']
                    },
                    s
                  )
                )
              ]
            }),
          !v &&
            e.jsxs('div', {
              className: 'text-center py-16',
              children: [
                e.jsx('div', {
                  className:
                    'w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-400 mx-auto mb-4',
                  children: e.jsx(E, { size: 30 })
                }),
                e.jsx('p', {
                  className: 'text-slate-600 font-black',
                  children: 'Consulta el estado de tu pedido'
                }),
                e.jsx('p', {
                  className: 'text-slate-400 text-xs mt-1',
                  children: 'Ingresa tu número de nota de venta, factura o guía'
                })
              ]
            }),
          b && e.jsx('div', { className: 'text-center text-sm text-red-500 py-4', children: b }),
          v &&
            !N &&
            !b &&
            r.length === 0 &&
            e.jsxs('div', {
              className: 'text-center py-16',
              children: [
                e.jsx('div', {
                  className:
                    'w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-4',
                  children: e.jsx(S, { size: 30 })
                }),
                e.jsx('p', {
                  className: 'text-slate-500 text-sm font-bold',
                  children: 'No se encontraron resultados'
                }),
                e.jsx('p', {
                  className: 'text-slate-400 text-xs mt-1',
                  children: 'Verifica el número e intenta de nuevo'
                })
              ]
            }),
          r.length > 0 &&
            e.jsx('div', {
              className: 'space-y-3',
              children: r.map((s) => {
                const n = s.estado || 'Sin estado',
                  l = g[n] || '#64748b',
                  u = x === s.id;
                return e.jsxs(
                  'div',
                  {
                    className:
                      'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition hover:shadow-md',
                    style: { borderLeft: `4px solid ${l}` },
                    children: [
                      e.jsxs('button', {
                        onClick: () => d(u ? null : s.id),
                        className: 'w-full text-left px-4 py-3 flex items-center gap-3',
                        children: [
                          e.jsx('span', {
                            className:
                              'shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black text-white',
                            style: { backgroundColor: l },
                            children: n
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2 min-w-0 shrink-0',
                            children: [
                              e.jsx('span', {
                                className: 'text-xs font-bold text-slate-400',
                                children: s.canal
                              }),
                              e.jsx('span', {
                                className: 'font-black text-slate-800 text-sm',
                                children: s.nv
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'hidden sm:flex flex-col min-w-0 flex-1',
                            children: [
                              e.jsx('span', {
                                className: 'text-sm text-slate-700 font-bold truncate',
                                children: s.cliente || '—'
                              }),
                              e.jsx('span', {
                                className: 'text-xs text-slate-400 truncate',
                                children:
                                  s.transportista && s.transportista !== '—' ? s.transportista : ' '
                              })
                            ]
                          }),
                          e.jsx('span', {
                            className: 'text-xs text-slate-400 whitespace-nowrap hidden sm:inline',
                            children: o(s.fecha_registro_nv)
                          }),
                          e.jsx(R, {
                            size: 18,
                            className: `text-slate-400 transition-transform shrink-0 ${u ? 'rotate-180' : ''}`
                          })
                        ]
                      }),
                      u &&
                        e.jsx('div', {
                          className: 'px-4 pb-5 pt-1 border-t border-slate-100',
                          children: e.jsxs('div', {
                            className: 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-3',
                            children: [
                              e.jsxs(h, {
                                titulo: 'Identificación',
                                children: [
                                  e.jsx(t, { label: 'Canal', value: s.canal }),
                                  e.jsx(t, { label: 'NV PTM', value: s.nv_ptm }),
                                  e.jsx(t, { label: 'NV Orange', value: s.nv_orange }),
                                  e.jsx(t, { label: 'NV Farmapack', value: s.nv_farmapack }),
                                  e.jsx(t, { label: 'Varios', value: s.varios }),
                                  e.jsx(t, { label: 'Factura', value: s.factura }),
                                  e.jsx(t, { label: 'Guía', value: s.guia }),
                                  e.jsx(t, { label: 'N° Envío', value: s.numero_envio }),
                                  e.jsx(t, { label: 'Cliente', value: s.cliente }),
                                  e.jsx(t, { label: 'Vendedor', value: s.vendedor }),
                                  e.jsx(t, { label: 'Centro Costo', value: s.centro_costo })
                                ]
                              }),
                              e.jsxs(h, {
                                titulo: 'Despacho',
                                children: [
                                  e.jsx(t, { label: 'Estado', value: n, color: l }),
                                  e.jsx(t, { label: 'Tipo Despacho', value: s.tipo_despacho }),
                                  e.jsx(t, { label: 'Transportista', value: s.transportista }),
                                  e.jsx(t, { label: 'Bultos', value: s.bultos })
                                ]
                              }),
                              e.jsxs(h, {
                                titulo: 'Fechas Clave',
                                children: [
                                  e.jsx(t, { label: 'Registro NV', value: o(s.fecha_registro_nv) }),
                                  e.jsx(t, { label: 'Creación N.V', value: o(s.fecha_aprobacion) }),
                                  e.jsx(t, { label: 'Compromiso', value: o(s.fecha_compromiso) }),
                                  e.jsx(t, { label: 'Facturación', value: s.fecha_facturacion })
                                ]
                              }),
                              e.jsxs(h, {
                                titulo: 'Fechas Logística',
                                children: [
                                  e.jsx(t, { label: 'En Proceso', value: o(s.fecha_en_proceso) }),
                                  e.jsx(t, { label: 'Shipping', value: o(s.fecha_shipping) }),
                                  e.jsx(t, { label: 'Despacho', value: o(s.fecha_despacho) }),
                                  e.jsx(t, { label: 'En Ruta', value: o(s.fecha_en_ruta) }),
                                  e.jsx(t, { label: 'Entregado', value: o(s.fecha_entregado) })
                                ]
                              })
                            ]
                          })
                        })
                    ]
                  },
                  s.id
                );
              })
            }),
          e.jsx('p', {
            className: 'text-center text-[11px] text-slate-300 py-6',
            children: 'PTM · Consulta pública de notas de venta'
          })
        ]
      })
    ]
  });
}
export { A as default };
