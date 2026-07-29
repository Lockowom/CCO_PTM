import { j as s } from './query-vendor-CojWQiBV.js';
import { r } from './react-vendor-CA7EHQ1X.js';
import {
  bx as E,
  R as D,
  b0 as B,
  a9 as F,
  $ as U,
  h as q,
  O as G,
  a5 as A,
  by as J,
  J as Q,
  bt as H,
  t as l
} from './ui-vendor-C7KFTQPV.js';
import { u as W } from './index-CyreZcpi.js';
import {
  ac as Z,
  a2 as K,
  ad as V,
  ae as X,
  af as Y,
  a7 as ee
} from './calidadService-DZa_EFDu.js';
import { u as se } from './useRealtimeTable-DdD_5fkL.js';
import { T as te } from './TrazabilidadModal-BGsIrMwz.js';
import { A as ae } from './AccionIntegracion-CTNRY8TU.js';
import './supabase-vendor-jY4wIOEF.js';
const re = Object.fromEntries(ee.map((t) => [t.id, t.label])),
  le = {
    BAJA: 'bg-rose-100 text-rose-700 border-rose-200',
    RECHAZAR: 'bg-rose-100 text-rose-700 border-rose-200',
    CUARENTENA: 'bg-orange-100 text-orange-700 border-orange-200',
    REPROCESO: 'bg-amber-100 text-amber-700 border-amber-200',
    LIBERAR: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  ue = () => {
    const { user: t, hasPermission: C } = W(),
      h = (t == null ? void 0 : t.rol) === 'ADMIN' || (t == null ? void 0 : t.es_admin_delegado),
      v = C('manage_quality'),
      { data: n = [], isLoading: _, refetch: k, isFetching: f } = Z(),
      { data: d = [] } = K(),
      x = V(),
      w = X();
    se('tms_calidad_acciones', ['calidad_acciones'], { debounceMs: 400 });
    const [c, R] = r.useState('pendientes'),
      [T, b] = r.useState(null),
      [p, m] = r.useState(''),
      [i, j] = r.useState(null),
      z = r.useMemo(() => Object.fromEntries(d.map((e) => [e.codigo, e])), [d]),
      u = r.useMemo(
        () =>
          new Set(
            d
              .filter((e) => Array.isArray(e.roles) && e.roles.includes(t == null ? void 0 : t.rol))
              .map((e) => e.codigo)
          ),
        [d, t == null ? void 0 : t.rol]
      ),
      N = (e) => h || u.has(e.area_responsable),
      y = r.useMemo(
        () =>
          c === 'todas'
            ? n
            : c === 'mi_area'
              ? n.filter((e) => u.has(e.area_responsable))
              : n.filter((e) => e.estado === 'PENDIENTE' || e.estado === 'EN_PROCESO'),
        [n, c, u]
      ),
      O = n.filter((e) => e.estado === 'PENDIENTE' || e.estado === 'EN_PROCESO').length,
      P = async (e) => {
        try {
          (await x.mutateAsync({ accionId: e.id, resolucion: '', estado: 'EN_PROCESO' }),
            l.success('Marcada en proceso'));
        } catch (a) {
          l.error(a.message);
        }
      },
      S = async (e) => {
        if (!p.trim()) {
          l.error('Escribe qué se hizo para cerrar');
          return;
        }
        try {
          (await x.mutateAsync({ accionId: e.id, resolucion: p.trim(), estado: 'RESUELTA' }),
            l.success('Acción resuelta'),
            b(null),
            m(''));
        } catch (a) {
          l.error(a.message);
        }
      },
      I = async (e) => {
        if (confirm(`¿Anular la acción ${e.folio}?`))
          try {
            (await w.mutateAsync(e.id), l.success('Acción anulada'));
          } catch (a) {
            l.error(a.message);
          }
      },
      L = [
        { id: 'pendientes', label: 'Pendientes' },
        { id: 'mi_area', label: 'Mi área' },
        { id: 'todas', label: 'Todas' }
      ];
    return s.jsxs('div', {
      className: 'h-full bg-slate-50 p-3 sm:p-6 min-h-screen',
      children: [
        s.jsxs('div', {
          className:
            'bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-7 mb-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden',
          children: [
            s.jsx('div', {
              className:
                'absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
            }),
            s.jsxs('div', {
              className: 'flex items-center gap-4',
              children: [
                s.jsx('div', {
                  className:
                    'w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600',
                  children: s.jsx(E, { size: 30, strokeWidth: 2.4 })
                }),
                s.jsxs('div', {
                  children: [
                    s.jsxs('h1', {
                      className: 'text-2xl sm:text-3xl font-black text-slate-900 tracking-tight',
                      children: [
                        'Acciones de ',
                        s.jsx('span', { className: 'text-emerald-600', children: 'Calidad' })
                      ]
                    }),
                    s.jsxs('p', {
                      className: 'text-slate-500 font-bold text-sm',
                      children: [
                        'Acciones recomendadas por Calidad, asignadas a cada área · ',
                        O,
                        ' pendiente(s)'
                      ]
                    })
                  ]
                })
              ]
            }),
            s.jsxs('button', {
              onClick: () => k(),
              disabled: f,
              className:
                'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-black flex items-center gap-2 hover:bg-slate-50',
              children: [s.jsx(D, { size: 16, className: f ? 'animate-spin' : '' }), ' Actualizar']
            })
          ]
        }),
        s.jsxs('div', {
          className: 'flex items-center gap-2 mb-5',
          children: [
            s.jsx(B, { size: 15, className: 'text-slate-400' }),
            L.map((e) =>
              s.jsx(
                'button',
                {
                  onClick: () => R(e.id),
                  className: `px-3 py-2 rounded-xl text-xs font-black border transition-colors ${c === e.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`,
                  children: e.label
                },
                e.id
              )
            )
          ]
        }),
        _
          ? s.jsx('div', {
              className: 'flex justify-center py-20',
              children: s.jsx(F, { className: 'animate-spin text-emerald-500', size: 36 })
            })
          : y.length === 0
            ? s.jsxs('div', {
                className: 'flex flex-col items-center justify-center py-20 text-center',
                children: [
                  s.jsx(E, { size: 44, className: 'text-slate-200 mb-4' }),
                  s.jsxs('h3', {
                    className: 'text-base font-bold text-slate-400',
                    children: ['Sin acciones ', c === 'pendientes' ? 'pendientes' : '']
                  }),
                  s.jsx('p', {
                    className: 'text-xs text-slate-300',
                    children:
                      'Las acciones se generan cuando Calidad dictamina un producto y recomienda una acción.'
                  })
                ]
              })
            : s.jsx('div', {
                className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                children: y.map((e) => {
                  const a = Y[e.estado] || {},
                    g = e.estado === 'PENDIENTE' || e.estado === 'EN_PROCESO',
                    o = z[e.area_responsable],
                    $ = T === e.id;
                  return s.jsxs(
                    'div',
                    {
                      className: `bg-white rounded-2xl border p-5 flex flex-col ${g ? 'border-amber-200' : 'border-slate-200'}`,
                      children: [
                        s.jsxs('div', {
                          className: 'flex items-center justify-between gap-2 mb-2',
                          children: [
                            s.jsx('span', {
                              className: 'font-mono font-black text-slate-700 text-sm',
                              children: e.folio || '—'
                            }),
                            s.jsxs('div', {
                              className: 'flex items-center gap-1.5',
                              children: [
                                e.prioridad === 'URGENTE' &&
                                  g &&
                                  s.jsxs('span', {
                                    className:
                                      'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-1',
                                    children: [s.jsx(U, { size: 11 }), ' Urgente']
                                  }),
                                s.jsx('span', {
                                  className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${a.cls}`,
                                  children: a.label || e.estado
                                })
                              ]
                            })
                          ]
                        }),
                        s.jsxs('p', {
                          className: 'font-black text-slate-900 text-sm flex items-center gap-1.5',
                          children: [
                            s.jsx(q, { size: 14, className: 'text-slate-400' }),
                            e.codigo_producto || '—'
                          ]
                        }),
                        s.jsx('p', {
                          className: 'text-xs text-slate-500 truncate',
                          children: e.producto || ''
                        }),
                        s.jsxs('div', {
                          className: 'flex flex-wrap items-center gap-1.5 mt-2',
                          children: [
                            s.jsx('span', {
                              className:
                                'text-[10px] font-black px-2 py-0.5 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200',
                              children: re[e.tipo_accion] || e.tipo_accion
                            }),
                            s.jsxs('span', {
                              className:
                                'text-[10px] font-black px-2 py-0.5 rounded-md border bg-teal-50 text-teal-700 border-teal-200',
                              children: ['→ ', (o == null ? void 0 : o.label) || e.area_responsable]
                            }),
                            e.dictamen &&
                              s.jsx('span', {
                                className: `text-[10px] font-black px-2 py-0.5 rounded-md border ${le[e.dictamen] || 'bg-slate-100 text-slate-600 border-slate-200'}`,
                                children: e.dictamen
                              }),
                            e.bodega_destino &&
                              s.jsxs('span', {
                                className:
                                  'text-[10px] font-black px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200',
                                children: ['BD ', e.bodega_destino]
                              })
                          ]
                        }),
                        e.descripcion &&
                          s.jsxs('p', {
                            className: 'text-xs text-slate-600 mt-2 italic',
                            children: ['“', e.descripcion, '”']
                          }),
                        s.jsx(ae, { accion: e, puedeActuar: N(e) }),
                        s.jsxs('p', {
                          className: 'text-[11px] text-slate-400 mt-2',
                          children: [
                            e.ubicacion ? `${e.ubicacion} · ` : '',
                            e.cantidad != null ? `${e.cantidad} u · ` : '',
                            e.creado_nombre ? `por ${e.creado_nombre}` : '',
                            e.fecha_limite ? ` · límite ${e.fecha_limite}` : ''
                          ]
                        }),
                        s.jsxs('button', {
                          onClick: () => j(e),
                          className:
                            'mt-2 self-start px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 font-black text-[11px] flex items-center gap-1.5 hover:bg-slate-50',
                          children: [s.jsx(G, { size: 12 }), ' Trazabilidad']
                        }),
                        e.estado === 'RESUELTA' &&
                          s.jsxs('p', {
                            className:
                              'text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 mt-2',
                            children: [
                              s.jsx('b', { children: 'Resuelta' }),
                              e.resuelto_nombre ? ` por ${e.resuelto_nombre}` : '',
                              e.resuelto_en
                                ? ` · ${new Date(e.resuelto_en).toLocaleDateString('es-CL')}`
                                : '',
                              e.resolucion ? ` — ${e.resolucion}` : ''
                            ]
                          }),
                        g &&
                          s.jsx('div', {
                            className: 'mt-3 pt-3 border-t border-slate-100',
                            children: $
                              ? s.jsxs('div', {
                                  className: 'space-y-2',
                                  children: [
                                    s.jsx('textarea', {
                                      value: p,
                                      onChange: (M) => m(M.target.value),
                                      rows: 2,
                                      autoFocus: !0,
                                      placeholder: '¿Qué se hizo? (acuse de la acción)',
                                      className:
                                        'w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-400 resize-none'
                                    }),
                                    s.jsxs('div', {
                                      className: 'flex gap-2',
                                      children: [
                                        s.jsxs('button', {
                                          onClick: () => S(e),
                                          disabled: x.isPending,
                                          className:
                                            'flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 disabled:opacity-50',
                                          children: [s.jsx(A, { size: 14 }), ' Confirmar cierre']
                                        }),
                                        s.jsx('button', {
                                          onClick: () => {
                                            (b(null), m(''));
                                          },
                                          className:
                                            'px-3 py-2 rounded-xl border border-slate-200 text-slate-500 font-black text-xs hover:bg-slate-50',
                                          children: 'Cancelar'
                                        })
                                      ]
                                    })
                                  ]
                                })
                              : s.jsxs('div', {
                                  className: 'flex flex-wrap gap-2',
                                  children: [
                                    N(e)
                                      ? s.jsxs(s.Fragment, {
                                          children: [
                                            e.estado === 'PENDIENTE' &&
                                              s.jsxs('button', {
                                                onClick: () => P(e),
                                                disabled: x.isPending,
                                                className:
                                                  'px-3 py-2 rounded-xl border border-slate-200 text-sky-700 font-black text-xs flex items-center gap-1.5 hover:bg-sky-50',
                                                children: [s.jsx(J, { size: 14 }), ' En proceso']
                                              }),
                                            s.jsxs('button', {
                                              onClick: () => {
                                                (b(e.id), m(''));
                                              },
                                              className:
                                                'flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700',
                                              children: [s.jsx(A, { size: 14 }), ' Resolver']
                                            })
                                          ]
                                        })
                                      : s.jsxs('span', {
                                          className:
                                            'text-[11px] text-slate-400 flex items-center gap-1.5',
                                          children: [
                                            s.jsx(Q, { size: 13 }),
                                            ' Esperando a ',
                                            (o == null ? void 0 : o.label) || e.area_responsable
                                          ]
                                        }),
                                    (h || v) &&
                                      s.jsx('button', {
                                        onClick: () => I(e),
                                        title: 'Anular',
                                        className:
                                          'px-3 py-2 rounded-xl border border-slate-200 text-slate-400 font-black text-xs hover:bg-rose-50 hover:text-rose-600',
                                        children: s.jsx(H, { size: 14 })
                                      })
                                  ]
                                })
                          })
                      ]
                    },
                    e.id
                  );
                })
              }),
        i &&
          s.jsx(te, {
            codigo: i.codigo_producto,
            partida: i.partida,
            ubicacion: i.ubicacion,
            producto: i.producto,
            onClose: () => j(null)
          })
      ]
    });
  };
export { ue as default };
