const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/pdfmake-pNuCVKVo.js',
      'assets/react-vendor-6aw4XXjH.js',
      'assets/vfs_fonts-CfcbzCvn.js'
    ])
) => i.map((i) => d[i]);
import { j as e } from './query-vendor-BNjBrM5A.js';
import { r as c } from './react-vendor-6aw4XXjH.js';
import {
  R as Re,
  e as De,
  C as oe,
  X as de,
  Y as ie,
  T as xe,
  L as We,
  f as me,
  B as qe,
  h as $e,
  g as Ye,
  d as Je
} from './charts-vendor-7leLLwOT.js';
import {
  j as Pe,
  k as Qe,
  l as ne,
  m as Ze,
  o as et,
  p as tt,
  e as st,
  q as at,
  g as nt,
  h as rt
} from './dashData-CKgNSMhO.js';
import { _ as Ee, s as le } from './index-BHpd9hND.js';
import { t as _e } from './ui-vendor-naG2PYVT.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
function lt(t) {
  const s = t.toUpperCase();
  return s === 'ENTREGADO'
    ? 'badge badge-entregado'
    : s.includes('PROCESO') || s === 'EN SHIPPING'
      ? 'badge badge-proceso'
      : s.includes('RUTA')
        ? 'badge badge-ruta'
        : s.includes('VENDEDOR')
          ? 'badge badge-vendedor'
          : s.includes('RETIRO')
            ? 'badge badge-retiro'
            : s.includes('STOCK')
              ? 'badge badge-stock'
              : s === 'NULA' || s === 'NULL'
                ? 'badge badge-nula'
                : 'badge badge-default';
}
function ct({ data: t, onSelectEstado: s }) {
  return e.jsx('div', {
    className: 'table-container',
    children: e.jsxs('table', {
      children: [
        e.jsx('thead', {
          children: e.jsxs('tr', {
            children: [
              e.jsx('th', { className: 'w-10', children: '#' }),
              e.jsx('th', { className: 'text-left', children: 'Estado' }),
              e.jsx('th', { children: 'N° NV PTM' }),
              e.jsx('th', { children: 'N.V Orange' }),
              e.jsx('th', { children: 'N.V Farmapack' }),
              e.jsx('th', { children: 'Varios' }),
              e.jsx('th', { children: 'Total' })
            ]
          })
        }),
        e.jsx('tbody', {
          children: t.map((n, l) =>
            e.jsxs(
              'tr',
              {
                onClick: () => (s == null ? void 0 : s(n.estado)),
                className: s ? 'cursor-pointer hover:bg-orange-50' : '',
                children: [
                  e.jsxs('td', { className: 'text-gray-400 text-xs', children: [l + 1, '.'] }),
                  e.jsx('td', {
                    className: 'text-left',
                    children: e.jsx('span', { className: lt(n.estado), children: n.estado })
                  }),
                  e.jsx('td', {
                    className: 'font-bold',
                    style: { color: '#f57c00' },
                    children: n.ptm.toLocaleString('es-CL')
                  }),
                  e.jsx('td', {
                    className: 'font-medium',
                    children:
                      n.orange || e.jsx('span', { className: 'text-gray-300', children: '0' })
                  }),
                  e.jsx('td', {
                    className: 'font-medium',
                    children:
                      n.farmapack || e.jsx('span', { className: 'text-gray-300', children: '0' })
                  }),
                  e.jsx('td', {
                    className: 'font-medium',
                    children:
                      n.varios || e.jsx('span', { className: 'text-gray-300', children: '0' })
                  }),
                  e.jsx('td', { className: 'font-bold', children: n.total.toLocaleString('es-CL') })
                ]
              },
              n.estado
            )
          )
        })
      ]
    })
  });
}
const ot = c.memo(ct);
function dt({ data: t }) {
  return e.jsxs('div', {
    className: 'bg-white rounded-xl p-4 shadow-sm',
    children: [
      e.jsx('h3', {
        className: 'text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide',
        children: 'Tendencia Semanal'
      }),
      e.jsx(Re, {
        width: '100%',
        height: 300,
        children: e.jsxs(De, {
          data: t,
          children: [
            e.jsx(oe, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
            e.jsx(de, { dataKey: 'semana', tick: { fontSize: 10 }, interval: 'preserveStartEnd' }),
            e.jsx(ie, { tick: { fontSize: 10 } }),
            e.jsx(xe, {
              contentStyle: {
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }),
            e.jsx(We, { wrapperStyle: { fontSize: 11 } }),
            e.jsx(me, {
              type: 'monotone',
              dataKey: 'aprobadas',
              stroke: '#f57c00',
              strokeWidth: 2,
              name: 'NVs Aprobadas',
              dot: { r: 3 }
            }),
            e.jsx(me, {
              type: 'monotone',
              dataKey: 'entregadas',
              stroke: '#2e7d32',
              strokeWidth: 2,
              name: 'NVs Entregadas',
              dot: { r: 3 }
            })
          ]
        })
      })
    ]
  });
}
const it = c.memo(dt),
  ce = {
    dias: {
      label: 'Tardanza (días)',
      titulo: 'Tardanza Promedio por Semana (días)',
      unidad: 'días',
      color: '#f57c00'
    },
    pctAtiempo: {
      label: '% A Tiempo',
      titulo: '% Entregas A Tiempo por Semana',
      unidad: '%',
      color: '#2e7d32'
    }
  };
function xt(t) {
  return t > 3 ? '#c62828' : t > 1 ? '#f57c00' : '#2e7d32';
}
function mt(t) {
  return t >= 80 ? '#2e7d32' : t >= 50 ? '#f57c00' : '#c62828';
}
function ht({ data: t }) {
  const [s, n] = c.useState('barras'),
    [l, a] = c.useState('dias'),
    o = ce[l],
    m = {
      contentStyle: { borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      formatter: (i, u, p) => {
        const d = p.payload;
        return [
          `${d.dias} días tarde  ·  ${d.pctAtiempo}% a tiempo  ·  ${d.count} entregas`,
          l === 'dias' ? 'Tardanza' : 'A tiempo'
        ];
      }
    };
  return e.jsxs('div', {
    className: 'bg-white rounded-xl p-4 shadow-sm',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between mb-4 gap-2 flex-wrap',
        children: [
          e.jsx('h3', {
            className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide',
            children: o.titulo
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsx('div', {
                className: 'flex rounded-lg bg-gray-100 p-0.5',
                children: Object.keys(ce).map((i) =>
                  e.jsx(
                    'button',
                    {
                      onClick: () => a(i),
                      className: `px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${l === i ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`,
                      children: ce[i].label
                    },
                    i
                  )
                )
              }),
              e.jsxs('div', {
                className: 'flex rounded-lg bg-gray-100 p-0.5',
                children: [
                  e.jsx('button', {
                    onClick: () => n('barras'),
                    title: 'Barras',
                    className: `px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${s === 'barras' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`,
                    children: '▮ Barras'
                  }),
                  e.jsx('button', {
                    onClick: () => n('linea'),
                    title: 'Tendencia',
                    className: `px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${s === 'linea' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`,
                    children: '╱ Tendencia'
                  })
                ]
              })
            ]
          })
        ]
      }),
      e.jsx(Re, {
        width: '100%',
        height: 200,
        children:
          s === 'barras'
            ? e.jsxs(qe, {
                data: t,
                children: [
                  e.jsx(oe, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
                  e.jsx(de, {
                    dataKey: 'semana',
                    tick: { fontSize: 9 },
                    interval: 'preserveStartEnd'
                  }),
                  e.jsx(ie, {
                    tick: { fontSize: 10 },
                    domain: l === 'pctAtiempo' ? [0, 100] : void 0
                  }),
                  e.jsx(xe, { ...m }),
                  e.jsx($e, { y: 0, stroke: '#ccc' }),
                  e.jsx(Ye, {
                    dataKey: l,
                    radius: [4, 4, 0, 0],
                    children: t.map((i, u) =>
                      e.jsx(Je, { fill: l === 'dias' ? xt(i.dias) : mt(i.pctAtiempo) }, u)
                    )
                  })
                ]
              })
            : e.jsxs(De, {
                data: t,
                children: [
                  e.jsx(oe, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
                  e.jsx(de, {
                    dataKey: 'semana',
                    tick: { fontSize: 9 },
                    interval: 'preserveStartEnd'
                  }),
                  e.jsx(ie, {
                    tick: { fontSize: 10 },
                    domain: l === 'pctAtiempo' ? [0, 100] : void 0
                  }),
                  e.jsx(xe, { ...m }),
                  e.jsx($e, { y: 0, stroke: '#ccc' }),
                  e.jsx(me, {
                    type: 'monotone',
                    dataKey: l,
                    stroke: o.color,
                    strokeWidth: 2.5,
                    dot: { r: 3, fill: o.color },
                    activeDot: { r: 5 }
                  })
                ]
              })
      })
    ]
  });
}
const pt = c.memo(ht);
function Ve(t, s) {
  return typeof window > 'u' ? s : localStorage.getItem(t) || s;
}
function ut(t, s) {
  (localStorage.setItem('panel_filter_from', t), localStorage.setItem('panel_filter_to', s));
}
function ft({ onFilter: t, defaultFrom: s, defaultTo: n }) {
  const [l, a] = c.useState(() => Ve('panel_filter_from', s)),
    [o, h] = c.useState(() => Ve('panel_filter_to', n));
  function m(p, d) {
    (a(p), h(d), ut(p, d), t(p, d));
  }
  const i = [
    { label: 'Última semana', days: 7 },
    { label: 'Último mes', days: 30 },
    { label: 'Últimos 3 meses', days: 90 },
    { label: 'Año completo', days: 365 }
  ];
  function u(p) {
    const d = Pe();
    m(Qe(d, -p), d);
  }
  return e.jsxs('div', {
    className: 'flex flex-wrap items-center gap-3',
    children: [
      e.jsxs('div', {
        className: 'flex items-center gap-2',
        children: [
          e.jsx('input', {
            type: 'date',
            value: l,
            onChange: (p) => a(p.target.value),
            className:
              'px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400'
          }),
          e.jsx('span', { className: 'text-gray-400 text-sm', children: 'a' }),
          e.jsx('input', {
            type: 'date',
            value: o,
            onChange: (p) => h(p.target.value),
            className:
              'px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400'
          }),
          e.jsx('button', {
            onClick: () => m(l, o),
            className:
              'px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition',
            children: 'Filtrar'
          })
        ]
      }),
      e.jsx('div', {
        className: 'flex gap-1',
        children: i.map((p) =>
          e.jsx(
            'button',
            {
              onClick: () => u(p.days),
              className:
                'px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300 transition',
              children: p.label
            },
            p.days
          )
        )
      })
    ]
  });
}
const Ie = {
    ACTIVAS: 'NVs Activas',
    ENTREGADAS: 'Entregadas',
    TARDIAS: 'Entregas Tardías',
    ATIEMPO: 'Entregas A Tiempo',
    'CANAL:PTM': 'N° NV PTM',
    'CANAL:ORANGE': 'N.V Orange',
    'CANAL:FARMAPACK': 'N.V Farmapack',
    'CANAL:VARIOS': 'Varios',
    FILLRATE_CUMPLE: 'Fill Rate — Cumplieron (salió de En Proceso a tiempo)',
    FILLRATE_NOCUMPLE: 'Fill Rate — No Cumplieron (salió de En Proceso atrasado)',
    NVCUMPLE: 'NVs de la Semana — Cumple (salió de En Proceso a tiempo)',
    NVNOCUMPLE: 'NVs de la Semana — No Cumple (salió tarde o sigue en proceso)'
  },
  M = (t) => ne(t, '—'),
  U = (t) => ne(t, '');
function jt(t, s) {
  const n = [
      'N.V',
      'Cliente',
      'Vendedor',
      'Transportista',
      'Tipo Desp.',
      'División',
      'N.V Reabierta',
      'Motivo Reapertura',
      'Fecha N.V',
      'Fecha Creación N.V',
      'Aprob. Real',
      'Dif. (días)',
      'Compromiso',
      'Promesa Efect.',
      'Atraso Ingreso (días)',
      'Despacho',
      'Tiempo (días)'
    ],
    l = (d) => {
      const b = d == null ? '' : String(d);
      return /[";\n]/.test(b) ? `"${b.replace(/"/g, '""')}"` : b;
    },
    a = s.map((d) =>
      [
        d.nv,
        d.cliente,
        d.vendedor,
        d.transportista,
        d.tipo_despacho || '',
        d.division,
        d.reabierta ? 'SI' : 'NO',
        d.motivo_reapertura || '',
        U(d.fecha_registro_nv),
        U(d.fecha_aprobacion),
        U(d.fecha_aprobacion_real),
        d.dif_aprobacion === null ? '' : d.dif_aprobacion,
        U(d.fecha_compromiso),
        U(d.fecha_promesa_efectiva),
        d.dias_atraso_ingreso > 0 ? d.dias_atraso_ingreso : '',
        U(d.fecha_despacho),
        d.dias_entrega === null ? '' : d.dias_entrega
      ]
        .map(l)
        .join(';')
    ),
    o =
      '\uFEFF' +
      [n.join(';'), ...a].join(`\r
`),
    h = new Blob([o], { type: 'text/csv;charset=utf-8;' }),
    m = URL.createObjectURL(h),
    i = document.createElement('a'),
    u = (Ie[t] || t).replace(/[^\wáéíóúñ]+/gi, '_').replace(/^_+|_+$/g, ''),
    p = new Date().toISOString().slice(0, 10);
  ((i.href = m), (i.download = `NVs_${u}_${p}.csv`), i.click(), URL.revokeObjectURL(m));
}
const y = 'bg-white',
  R = 'bg-blue-50/60',
  C = 'bg-amber-50/60';
function bt({ estado: t, data: s, loading: n, onClose: l }) {
  return (
    c.useEffect(() => {
      function a(o) {
        o.key === 'Escape' && l();
      }
      return (
        t && (document.addEventListener('keydown', a), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', a), (document.body.style.overflow = ''));
        }
      );
    }, [t, l]),
    t
      ? e.jsx('div', {
          className: 'fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4',
          onClick: l,
          children: e.jsxs('div', {
            className: 'bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[85vh] flex flex-col',
            onClick: (a) => a.stopPropagation(),
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between px-5 py-4 border-b border-gray-200',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx('h3', {
                        className: 'text-base font-bold text-gray-800',
                        children:
                          Ie[t] ||
                          e.jsxs(e.Fragment, {
                            children: [
                              'Notas de Venta — ',
                              e.jsx('span', { style: { color: '#f57c00' }, children: t })
                            ]
                          })
                      }),
                      e.jsx('p', {
                        className: 'text-xs text-gray-400',
                        children: n ? 'Cargando...' : `${s.length} registro(s)`
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center gap-4',
                    children: [
                      e.jsxs('div', {
                        className: 'hidden md:flex items-center gap-3 text-[10px] text-gray-400',
                        children: [
                          e.jsxs('span', {
                            className: 'inline-flex items-center gap-1',
                            children: [
                              e.jsx('span', {
                                className: 'w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200'
                              }),
                              ' Aprobación'
                            ]
                          }),
                          e.jsxs('span', {
                            className: 'inline-flex items-center gap-1',
                            children: [
                              e.jsx('span', {
                                className:
                                  'w-2.5 h-2.5 rounded bg-amber-100 border border-amber-200'
                              }),
                              ' Logística'
                            ]
                          })
                        ]
                      }),
                      !n &&
                        s.length > 0 &&
                        e.jsxs('button', {
                          onClick: () => jt(t, s),
                          className:
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors',
                          title: 'Descargar este listado en Excel',
                          children: [
                            e.jsxs('svg', {
                              width: '14',
                              height: '14',
                              viewBox: '0 0 24 24',
                              fill: 'none',
                              stroke: 'currentColor',
                              strokeWidth: '2.2',
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              children: [
                                e.jsx('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
                                e.jsx('polyline', { points: '7 10 12 15 17 10' }),
                                e.jsx('line', { x1: '12', y1: '15', x2: '12', y2: '3' })
                              ]
                            }),
                            'Excel'
                          ]
                        }),
                      e.jsx('button', {
                        onClick: l,
                        className: 'text-gray-400 hover:text-gray-700 text-2xl leading-none px-2',
                        'aria-label': 'Cerrar',
                        children: '×'
                      })
                    ]
                  })
                ]
              }),
              e.jsx('div', {
                className: 'overflow-auto p-2',
                children: n
                  ? e.jsx('div', {
                      className: 'flex items-center justify-center py-16',
                      children: e.jsx('div', {
                        className:
                          'w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin'
                      })
                    })
                  : s.length === 0
                    ? e.jsx('p', {
                        className: 'text-center text-gray-400 py-16',
                        children: 'Sin registros en este estado.'
                      })
                    : e.jsxs('table', {
                        className: 'w-full text-sm border-separate border-spacing-0',
                        children: [
                          e.jsxs('thead', {
                            className: 'sticky top-0 z-10',
                            children: [
                              e.jsxs('tr', {
                                children: [
                                  e.jsx('th', {
                                    colSpan: 8,
                                    className: `${y} px-3 py-1 text-[10px] font-semibold text-gray-400 text-left border-b border-gray-100`,
                                    children: 'INFORMACIÓN'
                                  }),
                                  e.jsx('th', {
                                    colSpan: 4,
                                    className: `${R} px-3 py-1 text-[10px] font-semibold text-blue-400 text-left border-b border-blue-100 border-l border-l-blue-200/50`,
                                    children: 'APROBACIÓN'
                                  }),
                                  e.jsx('th', {
                                    colSpan: 5,
                                    className: `${C} px-3 py-1 text-[10px] font-semibold text-amber-500 text-left border-b border-amber-100 border-l border-l-amber-200/50`,
                                    children: 'LOGÍSTICA'
                                  })
                                ]
                              }),
                              e.jsxs('tr', {
                                className: 'text-left text-xs text-gray-500 uppercase',
                                children: [
                                  e.jsx('th', { className: `${y} px-3 py-2`, children: 'N.V' }),
                                  e.jsx('th', { className: `${y} px-3 py-2`, children: 'Cliente' }),
                                  e.jsx('th', {
                                    className: `${y} px-3 py-2`,
                                    children: 'Vendedor'
                                  }),
                                  e.jsx('th', {
                                    className: `${y} px-3 py-2`,
                                    children: 'Transportista'
                                  }),
                                  e.jsx('th', {
                                    className: `${y} px-3 py-2`,
                                    children: 'Tipo Desp.'
                                  }),
                                  e.jsx('th', {
                                    className: `${y} px-3 py-2`,
                                    children: 'División'
                                  }),
                                  e.jsx('th', {
                                    className: `${y} px-3 py-2 text-center`,
                                    children: 'Reab.'
                                  }),
                                  e.jsx('th', { className: `${y} px-3 py-2`, children: 'Motivo' }),
                                  e.jsx('th', {
                                    className: `${R} px-3 py-2 border-l border-l-blue-200/50`,
                                    children: 'Fecha N.V'
                                  }),
                                  e.jsx('th', {
                                    className: `${R} px-3 py-2`,
                                    children: 'Fecha Creación N.V'
                                  }),
                                  e.jsx('th', {
                                    className: `${R} px-3 py-2`,
                                    children: 'Aprob. Real'
                                  }),
                                  e.jsx('th', {
                                    className: `${R} px-3 py-2 text-center`,
                                    children: 'Dif.'
                                  }),
                                  e.jsx('th', {
                                    className: `${C} px-3 py-2 border-l border-l-amber-200/50`,
                                    children: 'Compromiso'
                                  }),
                                  e.jsx('th', {
                                    className: `${C} px-3 py-2`,
                                    children: 'Promesa Efect.'
                                  }),
                                  e.jsx('th', {
                                    className: `${C} px-3 py-2 text-center`,
                                    children: 'Atraso Ingreso'
                                  }),
                                  e.jsx('th', {
                                    className: `${C} px-3 py-2`,
                                    children: 'Despacho'
                                  }),
                                  e.jsx('th', {
                                    className: `${C} px-3 py-2 text-center`,
                                    children: 'Tiempo'
                                  })
                                ]
                              })
                            ]
                          }),
                          e.jsx('tbody', {
                            children: s.map((a, o) =>
                              e.jsxs(
                                'tr',
                                {
                                  className: 'border-t border-gray-100 hover:bg-orange-50/50',
                                  children: [
                                    e.jsx('td', {
                                      className: `${y} px-3 py-2 font-semibold`,
                                      style: { color: '#f57c00' },
                                      children: a.nv
                                    }),
                                    e.jsx('td', {
                                      className: `${y} px-3 py-2`,
                                      children: a.cliente
                                    }),
                                    e.jsx('td', {
                                      className: `${y} px-3 py-2`,
                                      children: a.vendedor
                                    }),
                                    e.jsx('td', {
                                      className: `${y} px-3 py-2`,
                                      children: a.transportista
                                    }),
                                    e.jsx('td', {
                                      className: `${y} px-3 py-2`,
                                      children:
                                        a.tipo_despacho ||
                                        e.jsx('span', { className: 'text-gray-300', children: '—' })
                                    }),
                                    e.jsx('td', {
                                      className: `${y} px-3 py-2`,
                                      children: a.division
                                    }),
                                    e.jsx('td', {
                                      className: `${y} px-3 py-2 text-center`,
                                      children: a.reabierta
                                        ? e.jsx('span', {
                                            className:
                                              'inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700',
                                            children: 'SI'
                                          })
                                        : e.jsx('span', {
                                            className: 'text-gray-300',
                                            children: '—'
                                          })
                                    }),
                                    e.jsx('td', {
                                      className: `${y} px-3 py-2`,
                                      children: a.motivo_reapertura
                                        ? e.jsx('span', {
                                            className: 'line-clamp-2',
                                            title: a.motivo_reapertura,
                                            children: a.motivo_reapertura
                                          })
                                        : e.jsx('span', {
                                            className: 'text-gray-300',
                                            children: '—'
                                          })
                                    }),
                                    e.jsx('td', {
                                      className: `${R} px-3 py-2 whitespace-nowrap border-l border-l-blue-200/30`,
                                      children: M(a.fecha_registro_nv)
                                    }),
                                    e.jsx('td', {
                                      className: `${R} px-3 py-2 whitespace-nowrap`,
                                      children: M(a.fecha_aprobacion)
                                    }),
                                    e.jsx('td', {
                                      className: `${R} px-3 py-2 whitespace-nowrap`,
                                      children: M(a.fecha_aprobacion_real)
                                    }),
                                    e.jsx('td', {
                                      className: `${R} px-3 py-2 text-center`,
                                      children:
                                        a.dif_aprobacion === null
                                          ? e.jsx('span', {
                                              className: 'text-gray-300',
                                              children: '—'
                                            })
                                          : e.jsxs('span', {
                                              className:
                                                'inline-block px-1.5 py-0.5 rounded text-xs font-bold',
                                              style: {
                                                background:
                                                  a.dif_aprobacion === 0 ? '#e8f5e9' : '#fff3e0',
                                                color:
                                                  a.dif_aprobacion === 0 ? '#2e7d32' : '#e65100'
                                              },
                                              title:
                                                'Días de diferencia entre aprobación real y del sistema',
                                              children: [
                                                a.dif_aprobacion > 0
                                                  ? `+${a.dif_aprobacion}`
                                                  : a.dif_aprobacion,
                                                'd'
                                              ]
                                            })
                                    }),
                                    e.jsx('td', {
                                      className: `${C} px-3 py-2 whitespace-nowrap border-l border-l-amber-200/30`,
                                      children: M(a.fecha_compromiso)
                                    }),
                                    e.jsx('td', {
                                      className: `${C} px-3 py-2 whitespace-nowrap`,
                                      children:
                                        a.dias_atraso_ingreso > 0
                                          ? e.jsx('span', {
                                              className: 'font-medium text-red-600',
                                              children: M(a.fecha_promesa_efectiva)
                                            })
                                          : M(a.fecha_promesa_efectiva)
                                    }),
                                    e.jsx('td', {
                                      className: `${C} px-3 py-2 text-center`,
                                      children:
                                        a.dias_atraso_ingreso > 0
                                          ? e.jsxs('span', {
                                              className:
                                                'inline-block px-1.5 py-0.5 rounded text-xs font-bold',
                                              style: { background: '#ffebee', color: '#c62828' },
                                              title:
                                                'NV cayó tarde a logística — compromiso ya estaba vencido al aprobarse',
                                              children: ['+', a.dias_atraso_ingreso, 'd']
                                            })
                                          : e.jsx('span', {
                                              className: 'text-gray-300',
                                              children: '—'
                                            })
                                    }),
                                    e.jsx('td', {
                                      className: `${C} px-3 py-2 whitespace-nowrap`,
                                      children: M(a.fecha_despacho)
                                    }),
                                    e.jsx('td', {
                                      className: `${C} px-3 py-2 text-center`,
                                      children:
                                        a.dias_entrega === null
                                          ? e.jsx('span', {
                                              className: 'text-gray-300',
                                              children: '—'
                                            })
                                          : e.jsx('span', {
                                              className:
                                                'inline-block px-1.5 py-0.5 rounded text-xs font-bold',
                                              style: {
                                                background:
                                                  a.dias_entrega <= 0
                                                    ? '#e8f5e9'
                                                    : a.dias_entrega <= 2
                                                      ? '#fff3e0'
                                                      : '#ffebee',
                                                color:
                                                  a.dias_entrega <= 0
                                                    ? '#2e7d32'
                                                    : a.dias_entrega <= 2
                                                      ? '#e65100'
                                                      : '#c62828'
                                              },
                                              title:
                                                'Días entre despacho y compromiso (positivo = tarde)',
                                              children:
                                                a.dias_entrega <= 0
                                                  ? 'A tiempo'
                                                  : `+${a.dias_entrega}d`
                                            })
                                    })
                                  ]
                                },
                                o
                              )
                            )
                          })
                        ]
                      })
              })
            ]
          })
        })
      : null
  );
}
const gt = (t) => ne(t, '—');
function yt({ open: t, data: s, loading: n, onClose: l }) {
  return (
    c.useEffect(() => {
      function a(o) {
        o.key === 'Escape' && l();
      }
      return (
        t && (document.addEventListener('keydown', a), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', a), (document.body.style.overflow = ''));
        }
      );
    }, [t, l]),
    t
      ? e.jsx('div', {
          className: 'fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4',
          onClick: l,
          children: e.jsxs('div', {
            className: 'bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[85vh] flex flex-col',
            onClick: (a) => a.stopPropagation(),
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between px-5 py-4 border-b border-gray-200',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx('h3', {
                        className: 'text-base font-bold text-gray-800',
                        children: 'Incidencias Activas'
                      }),
                      e.jsx('p', {
                        className: 'text-xs text-gray-400',
                        children: n ? 'Cargando...' : `${s.length} incidencia(s) no resuelta(s)`
                      })
                    ]
                  }),
                  e.jsx('button', {
                    onClick: l,
                    className: 'text-gray-400 hover:text-gray-700 text-2xl leading-none px-2',
                    'aria-label': 'Cerrar',
                    children: '×'
                  })
                ]
              }),
              e.jsx('div', {
                className: 'overflow-auto p-2',
                children: n
                  ? e.jsx('div', {
                      className: 'flex items-center justify-center py-16',
                      children: e.jsx('div', {
                        className:
                          'w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin'
                      })
                    })
                  : s.length === 0
                    ? e.jsx('p', {
                        className: 'text-center text-gray-400 py-16',
                        children: 'No hay incidencias activas.'
                      })
                    : e.jsxs('table', {
                        className: 'w-full text-sm',
                        children: [
                          e.jsx('thead', {
                            className: 'sticky top-0 bg-gray-50',
                            children: e.jsxs('tr', {
                              className: 'text-left text-xs text-gray-500 uppercase',
                              children: [
                                e.jsx('th', { className: 'px-3 py-2', children: 'N.V' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Fecha' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Cliente' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Incidencia' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Estado Inc.' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Días' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Vendedor' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Transportista' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Observaciones' })
                              ]
                            })
                          }),
                          e.jsx('tbody', {
                            children: s.map((a, o) =>
                              e.jsxs(
                                'tr',
                                {
                                  className: 'border-t border-gray-100 hover:bg-red-50',
                                  children: [
                                    e.jsx('td', {
                                      className: 'px-3 py-2 font-semibold',
                                      style: { color: '#c62828' },
                                      children: a.nv
                                    }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2 whitespace-nowrap',
                                      children: gt(a.fecha)
                                    }),
                                    e.jsx('td', { className: 'px-3 py-2', children: a.cliente }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2 font-medium',
                                      children: a.incidencia
                                    }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2',
                                      children: e.jsx('span', {
                                        className:
                                          'inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800',
                                        children: a.estado_incidencia
                                      })
                                    }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2 text-center font-bold',
                                      style: { color: a.dias > 5 ? '#c62828' : '#333' },
                                      children: a.dias
                                    }),
                                    e.jsx('td', { className: 'px-3 py-2', children: a.vendedor }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2',
                                      children: a.transportista
                                    }),
                                    e.jsx('td', {
                                      className:
                                        'px-3 py-2 text-xs text-gray-500 whitespace-normal',
                                      children: a.observaciones
                                    })
                                  ]
                                },
                                o
                              )
                            )
                          })
                        ]
                      })
              })
            ]
          })
        })
      : null
  );
}
const Nt = (t) => ne(t, '—');
function vt(t) {
  return t > 0 ? 'bg-red-50' : t === 0 ? 'bg-orange-50' : 'bg-yellow-50';
}
function wt(t) {
  return t > 0
    ? { background: '#ffebee', color: '#c62828' }
    : t === 0
      ? { background: '#fff3e0', color: '#e65100' }
      : { background: '#fffde7', color: '#f9a825' };
}
function Tt({ open: t, data: s, onClose: n }) {
  return (
    c.useEffect(() => {
      function l(a) {
        a.key === 'Escape' && n();
      }
      return (
        t && (document.addEventListener('keydown', l), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', l), (document.body.style.overflow = ''));
        }
      );
    }, [t, n]),
    t
      ? e.jsx('div', {
          className: 'fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4',
          onClick: n,
          children: e.jsxs('div', {
            className: 'bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[85vh] flex flex-col',
            onClick: (l) => l.stopPropagation(),
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between px-5 py-4 border-b border-gray-200',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx('h3', {
                        className: 'text-base font-bold text-gray-800',
                        children: 'Despachos en Riesgo'
                      }),
                      e.jsxs('div', {
                        className: 'flex gap-3 mt-1',
                        children: [
                          s.vencidos > 0 &&
                            e.jsxs('span', {
                              className: 'inline-block px-2 py-0.5 rounded text-xs font-bold',
                              style: { background: '#ffebee', color: '#c62828' },
                              children: [s.vencidos, ' vencido', s.vencidos !== 1 ? 's' : '']
                            }),
                          s.hoy > 0 &&
                            e.jsxs('span', {
                              className: 'inline-block px-2 py-0.5 rounded text-xs font-bold',
                              style: { background: '#fff3e0', color: '#e65100' },
                              children: [s.hoy, ' vence hoy']
                            }),
                          s.manana > 0 &&
                            e.jsxs('span', {
                              className: 'inline-block px-2 py-0.5 rounded text-xs font-bold',
                              style: { background: '#fffde7', color: '#f9a825' },
                              children: [s.manana, ' vence mañana']
                            }),
                          s.total === 0 &&
                            e.jsx('span', {
                              className: 'text-xs text-green-600 font-medium',
                              children: 'Sin despachos en riesgo'
                            })
                        ]
                      })
                    ]
                  }),
                  e.jsx('button', {
                    onClick: n,
                    className: 'text-gray-400 hover:text-gray-700 text-2xl leading-none px-2',
                    'aria-label': 'Cerrar',
                    children: '×'
                  })
                ]
              }),
              e.jsx('div', {
                className: 'overflow-auto p-2',
                children:
                  s.detalle.length === 0
                    ? e.jsx('p', {
                        className: 'text-center text-gray-400 py-16',
                        children: 'Todos los despachos activos están dentro de plazo.'
                      })
                    : e.jsxs('table', {
                        className: 'w-full text-sm',
                        children: [
                          e.jsx('thead', {
                            className: 'sticky top-0 bg-gray-50',
                            children: e.jsxs('tr', {
                              className: 'text-left text-xs text-gray-500 uppercase',
                              children: [
                                e.jsx('th', { className: 'px-3 py-2', children: 'N.V' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Cliente' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Estado' }),
                                e.jsx('th', {
                                  className: 'px-3 py-2 text-center',
                                  children: 'Días'
                                }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Vendedor' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Transportista' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'División' }),
                                e.jsx('th', { className: 'px-3 py-2', children: 'Compromiso' })
                              ]
                            })
                          }),
                          e.jsx('tbody', {
                            children: s.detalle.map((l, a) =>
                              e.jsxs(
                                'tr',
                                {
                                  className: `border-t border-gray-100 ${vt(l.diasVencido)}`,
                                  children: [
                                    e.jsx('td', {
                                      className: 'px-3 py-2 font-semibold',
                                      style: { color: '#f57c00' },
                                      children: l.nv
                                    }),
                                    e.jsx('td', { className: 'px-3 py-2', children: l.cliente }),
                                    e.jsx('td', { className: 'px-3 py-2', children: l.estado }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2 text-center',
                                      children: e.jsx('span', {
                                        className:
                                          'inline-block px-1.5 py-0.5 rounded text-xs font-bold',
                                        style: wt(l.diasVencido),
                                        children:
                                          l.diasVencido > 0
                                            ? `+${l.diasVencido}d`
                                            : l.diasVencido === 0
                                              ? 'HOY'
                                              : '1d'
                                      })
                                    }),
                                    e.jsx('td', { className: 'px-3 py-2', children: l.vendedor }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2',
                                      children: l.transportista
                                    }),
                                    e.jsx('td', { className: 'px-3 py-2', children: l.division }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2 whitespace-nowrap',
                                      children: Nt(l.fecha_compromiso)
                                    })
                                  ]
                                },
                                a
                              )
                            )
                          })
                        ]
                      })
              })
            ]
          })
        })
      : null
  );
}
function At({ open: t, data: s, onClose: n }) {
  if (
    (c.useEffect(() => {
      function a(o) {
        o.key === 'Escape' && n();
      }
      return (
        t && (document.addEventListener('keydown', a), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', a), (document.body.style.overflow = ''));
        }
      );
    }, [t, n]),
    !t)
  )
    return null;
  const l = Object.entries(s.porTipo).sort((a, o) => o[1] - a[1]);
  return e.jsx('div', {
    className: 'fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4',
    onClick: n,
    children: e.jsxs('div', {
      className: 'bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[85vh] flex flex-col',
      onClick: (a) => a.stopPropagation(),
      children: [
        e.jsxs('div', {
          className: 'px-5 py-4 border-b border-gray-200',
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('h3', {
                      className: 'text-base font-bold text-gray-800',
                      children: '🔍 Calidad de Datos'
                    }),
                    e.jsxs('p', {
                      className: 'text-xs text-gray-400',
                      children: [s.total, ' registro(s) con datos incompletos o incoherentes']
                    })
                  ]
                }),
                e.jsx('button', {
                  onClick: n,
                  className: 'text-gray-400 hover:text-gray-700 text-2xl leading-none px-2',
                  'aria-label': 'Cerrar',
                  children: '×'
                })
              ]
            }),
            l.length > 0 &&
              e.jsx('div', {
                className: 'flex flex-wrap gap-2 mt-3',
                children: l.map(([a, o]) =>
                  e.jsxs(
                    'span',
                    {
                      className:
                        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200',
                      children: [a, e.jsx('span', { className: 'font-bold', children: o })]
                    },
                    a
                  )
                )
              })
          ]
        }),
        e.jsx('div', {
          className: 'overflow-auto p-2',
          children:
            s.detalle.length === 0
              ? e.jsx('p', {
                  className: 'text-center text-gray-400 py-16',
                  children: '✓ Sin problemas de calidad detectados.'
                })
              : e.jsxs('table', {
                  className: 'w-full text-sm',
                  children: [
                    e.jsx('thead', {
                      className: 'sticky top-0 bg-gray-50',
                      children: e.jsxs('tr', {
                        className: 'text-left text-xs text-gray-500 uppercase',
                        children: [
                          e.jsx('th', { className: 'px-3 py-2', children: 'N.V' }),
                          e.jsx('th', { className: 'px-3 py-2', children: 'Cliente' }),
                          e.jsx('th', { className: 'px-3 py-2', children: 'Estado' }),
                          e.jsx('th', { className: 'px-3 py-2', children: 'Vendedor' }),
                          e.jsx('th', { className: 'px-3 py-2', children: 'División' }),
                          e.jsx('th', { className: 'px-3 py-2', children: 'Problemas detectados' })
                        ]
                      })
                    }),
                    e.jsx('tbody', {
                      children: s.detalle.map((a, o) =>
                        e.jsxs(
                          'tr',
                          {
                            className: 'border-t border-gray-100 hover:bg-amber-50/50',
                            children: [
                              e.jsx('td', {
                                className: 'px-3 py-2 font-semibold',
                                style: { color: '#f57c00' },
                                children: a.nv
                              }),
                              e.jsx('td', { className: 'px-3 py-2', children: a.cliente }),
                              e.jsx('td', { className: 'px-3 py-2', children: a.estado }),
                              e.jsx('td', { className: 'px-3 py-2', children: a.vendedor }),
                              e.jsx('td', { className: 'px-3 py-2', children: a.division }),
                              e.jsx('td', {
                                className: 'px-3 py-2',
                                children: e.jsx('div', {
                                  className: 'flex flex-wrap gap-1',
                                  children: a.problemas.map((h, m) =>
                                    e.jsx(
                                      'span',
                                      {
                                        className:
                                          'inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100',
                                        children: h
                                      },
                                      m
                                    )
                                  )
                                })
                              })
                            ]
                          },
                          o
                        )
                      )
                    })
                  ]
                })
        })
      ]
    })
  });
}
function St({ kpis: t, onSelect: s }) {
  return e.jsxs('div', {
    className: 'bg-white rounded-xl p-5 shadow-sm border-l-4',
    style: { borderLeftColor: '#f57c00' },
    children: [
      e.jsx('h2', {
        className: 'text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3',
        children: 'Notas de Venta'
      }),
      e.jsxs('div', {
        className: 'grid grid-cols-4 gap-6',
        children: [
          e.jsxs('div', {
            className: 'cursor-pointer hover:opacity-70 transition-opacity',
            onClick: () => s('CANAL:PTM'),
            children: [
              e.jsx('div', { className: 'text-xs text-gray-400', children: 'N° NV PTM' }),
              e.jsx('div', {
                className: 'text-2xl font-bold',
                style: { color: '#f57c00' },
                children: t == null ? void 0 : t.countNvPtm.toLocaleString('es-CL')
              })
            ]
          }),
          e.jsxs('div', {
            className: 'cursor-pointer hover:opacity-70 transition-opacity',
            onClick: () => s('CANAL:ORANGE'),
            children: [
              e.jsx('div', { className: 'text-xs text-gray-400', children: 'N.V Orange' }),
              e.jsx('div', {
                className: 'text-2xl font-bold text-gray-800',
                children: t == null ? void 0 : t.nvOrange.toLocaleString('es-CL')
              })
            ]
          }),
          e.jsxs('div', {
            className: 'cursor-pointer hover:opacity-70 transition-opacity',
            onClick: () => s('CANAL:FARMAPACK'),
            children: [
              e.jsx('div', { className: 'text-xs text-gray-400', children: 'N.V Farmapack' }),
              e.jsx('div', {
                className: 'text-2xl font-bold text-gray-800',
                children: t == null ? void 0 : t.nvFarmapack.toLocaleString('es-CL')
              })
            ]
          }),
          e.jsxs('div', {
            className: 'cursor-pointer hover:opacity-70 transition-opacity',
            onClick: () => s('CANAL:VARIOS'),
            children: [
              e.jsx('div', { className: 'text-xs text-gray-400', children: 'Varios' }),
              e.jsx('div', {
                className: 'text-2xl font-bold text-gray-800',
                children: t == null ? void 0 : t.nvVarios.toLocaleString('es-CL')
              })
            ]
          })
        ]
      })
    ]
  });
}
function Ct(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function $t({
  end: t,
  duration: s = 1200,
  decimals: n = 0,
  prefix: l = '',
  suffix: a = '',
  className: o
}) {
  const [h, m] = c.useState('0'),
    i = c.useRef(0),
    u = c.useRef(0);
  return (
    c.useEffect(() => {
      const p = i.current,
        d = t - p;
      if (d === 0) return;
      const b = performance.now(),
        _ = (w) => {
          const D = w - b,
            $ = Math.min(D / s, 1),
            V = p + d * Ct($);
          (m(V.toFixed(n)), $ < 1 ? (u.current = requestAnimationFrame(_)) : (i.current = t));
        };
      return ((u.current = requestAnimationFrame(_)), () => cancelAnimationFrame(u.current));
    }, [t, s, n]),
    e.jsxs('span', { className: o, children: [l, h, a] })
  );
}
function Et({ children: t, glowColor: s = '245,124,0', className: n = '', onClick: l }) {
  const a = c.useRef(null),
    o = (h) => {
      const m = a.current;
      if (!m) return;
      const i = m.getBoundingClientRect();
      (m.style.setProperty('--mx', `${h.clientX - i.left}px`),
        m.style.setProperty('--my', `${h.clientY - i.top}px`));
    };
  return e.jsxs('div', {
    ref: a,
    onMouseMove: o,
    onClick: l,
    className: `bento-card ${n}`,
    style: { '--glow': s },
    children: [
      e.jsx('span', { className: 'bento-card-glow', 'aria-hidden': !0 }),
      e.jsx('div', { className: 'bento-card-content', children: t })
    ]
  });
}
function _t({ title: t, value: s, subtitle: n, color: l = '#f57c00', icon: a, onClick: o }) {
  const h = typeof s == 'number',
    m = typeof s == 'string' && /^\d+([.,]\d+)?%$/.test(s),
    i = h ? s : m ? parseFloat(s.replace(',', '.')) : null;
  return e.jsxs(Et, {
    glowColor: Ze(l),
    onClick: o,
    className: `kpi-card${o ? ' cursor-pointer' : ''}`,
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between mb-2',
        children: [
          e.jsx('span', {
            className: 'text-xs font-semibold uppercase tracking-wide text-gray-500',
            children: t
          }),
          a && e.jsx('span', { className: 'text-xl', children: a })
        ]
      }),
      e.jsx('div', {
        className: 'text-3xl font-bold',
        style: { color: l },
        children: i !== null ? e.jsx($t, { end: i, decimals: m ? 1 : 0, suffix: m ? '%' : '' }) : s
      }),
      n && e.jsx('div', { className: 'text-xs text-gray-400 mt-1', children: n })
    ]
  });
}
const se = c.memo(_t);
function Vt({ kpis: t, onDetalle: s }) {
  return e.jsxs('div', {
    className: 'grid grid-cols-2 md:grid-cols-4 gap-3',
    children: [
      e.jsx(se, {
        title: 'NVs Activas',
        value: (t == null ? void 0 : t.activas) || 0,
        subtitle: 'Backlog en vivo · no depende del rango',
        color: '#1565c0',
        icon: '📦',
        onClick: () => s('ACTIVAS')
      }),
      e.jsx(se, {
        title: 'Tardanza Prom.',
        value: `${t == null ? void 0 : t.leadTimeTardanza} días`,
        subtitle: 'Solo entregas tardías',
        color: '#c62828',
        icon: '🕐',
        onClick: () => s('TARDIAS')
      }),
      e.jsx(se, {
        title: 'A Tiempo',
        value: `${t == null ? void 0 : t.pctAtiempo}%`,
        subtitle: 'Entregado ≤ compromiso',
        color: '#2e7d32',
        icon: '✅',
        onClick: () => s('ATIEMPO')
      }),
      e.jsx(se, {
        title: 'Fill Rate',
        value:
          (t == null ? void 0 : t.fillRateShipping.pct) !== null &&
          (t == null ? void 0 : t.fillRateShipping.pct) !== void 0
            ? `${t.fillRateShipping.pct}%`
            : 'Sin datos',
        subtitle:
          (t == null ? void 0 : t.fillRateShipping.pct) !== null &&
          (t == null ? void 0 : t.fillRateShipping.pct) !== void 0
            ? `Salió de En Proceso ≤ compromiso (${t.fillRateShipping.evaluables} eval.)`
            : 'Sin datos suficientes',
        color: '#f57c00',
        icon: '📋',
        onClick: () => s('FILLRATE_NOCUMPLE')
      })
    ]
  });
}
function Lt({ calidadData: t, onOpen: s }) {
  return t.total > 0
    ? e.jsxs('button', {
        onClick: s,
        className:
          'w-full text-left bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between hover:bg-amber-100 transition-colors',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-3',
            children: [
              e.jsx('span', { className: 'text-xl', children: '🔍' }),
              e.jsxs('div', {
                children: [
                  e.jsxs('div', {
                    className: 'text-sm font-semibold text-amber-800',
                    children: [
                      t.total,
                      ' registro',
                      t.total !== 1 ? 's' : '',
                      ' con datos incompletos o incoherentes'
                    ]
                  }),
                  e.jsx('div', {
                    className: 'text-xs text-amber-600',
                    children: 'Clic para ver el detalle y corregir en el Sheet'
                  })
                ]
              })
            ]
          }),
          e.jsx('span', { className: 'text-amber-400 text-lg', children: '→' })
        ]
      })
    : e.jsxs('div', {
        className:
          'w-full bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3',
        children: [
          e.jsx('span', { className: 'text-xl', children: '✓' }),
          e.jsx('div', {
            className: 'text-sm font-medium text-green-700',
            children: 'Datos consistentes — sin problemas detectados'
          })
        ]
      });
}
function Rt({ tiemposCiclo: t }) {
  return t
    ? e.jsxs('div', {
        className: 'table-container',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between mb-4 flex-wrap gap-2',
            children: [
              e.jsx('h3', { className: 'font-bold text-gray-800', children: 'Tiempos de ciclo' }),
              e.jsx('span', {
                className: 'text-[11px] text-gray-400',
                children:
                  'Días promedio · calculado desde fechas por estado. La cobertura del desglose fino crece a medida que las NVs pasan por el flujo nuevo.'
              })
            ]
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-2 md:grid-cols-4 gap-3 mb-5',
            children: [
              e.jsxs('div', {
                className: 'rounded-xl border border-gray-200 p-3.5',
                children: [
                  e.jsx('p', {
                    className: 'text-[11px] font-semibold text-gray-400 uppercase tracking-wider',
                    children: 'Lead time total'
                  }),
                  e.jsx('p', {
                    className: 'mt-1 text-2xl font-bold',
                    style: { color: '#f57c00' },
                    children: t.leadTimeTotal !== null ? `${t.leadTimeTotal} d` : '—'
                  }),
                  e.jsxs('p', {
                    className: 'text-[10px] text-gray-400',
                    children: ['Aprobación → entrega · n=', t.leadTimeTotalN]
                  })
                ]
              }),
              t.etapas.map((s) =>
                e.jsxs(
                  'div',
                  {
                    className: 'rounded-xl border border-gray-200 p-3.5',
                    children: [
                      e.jsx('p', {
                        className:
                          'text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate',
                        children: s.nombre
                      }),
                      e.jsx('p', {
                        className: 'mt-1 text-2xl font-bold text-gray-800',
                        children: s.dias !== null ? `${s.dias} d` : '—'
                      }),
                      e.jsxs('p', { className: 'text-[10px] text-gray-400', children: ['n=', s.n] })
                    ]
                  },
                  s.nombre
                )
              )
            ]
          }),
          t.cuelloBotella &&
            e.jsxs('div', {
              className:
                'mb-4 inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-[12px] text-red-700',
              children: [
                e.jsx('span', { children: '🚨 Cuello de botella:' }),
                e.jsx('strong', { children: t.cuelloBotella.nombre }),
                e.jsxs('span', { children: ['(', t.cuelloBotella.dias, ' d)'] })
              ]
            }),
          e.jsx('div', {
            className: 'space-y-2.5',
            children: (() => {
              const s = Math.max(1, ...t.etapas.map((n) => n.dias ?? 0));
              return t.etapas.map((n) => {
                var l;
                return e.jsxs(
                  'div',
                  {
                    className: 'flex items-center gap-3',
                    children: [
                      e.jsx('span', {
                        className: 'w-40 shrink-0 text-[12px] text-gray-600 text-right',
                        children: n.nombre
                      }),
                      e.jsx('div', {
                        className: 'flex-1 h-6 bg-gray-100 rounded-md overflow-hidden',
                        children: e.jsx('div', {
                          className:
                            'h-full rounded-md flex items-center justify-end pr-2 text-[11px] font-semibold text-white transition-all',
                          style: {
                            width: n.dias !== null ? `${Math.max(6, (n.dias / s) * 100)}%` : '0%',
                            background:
                              ((l = t.cuelloBotella) == null ? void 0 : l.nombre) === n.nombre
                                ? '#dc2626'
                                : '#f57c00'
                          },
                          children: n.dias !== null ? `${n.dias} d` : ''
                        })
                      }),
                      n.dias === null &&
                        e.jsx('span', {
                          className: 'text-[11px] text-gray-300',
                          children: 'sin datos'
                        })
                    ]
                  },
                  n.nombre
                );
              });
            })()
          })
        ]
      })
    : null;
}
function Dt({
  min: t = 0,
  max: s = 30,
  step: n = 1,
  value: l,
  onChange: a,
  label: o,
  suffix: h = '',
  color: m = '#f57c00'
}) {
  const i = c.useRef(null),
    [u, p] = c.useState(!1),
    [d, b] = c.useState(0),
    _ = ((l - t) / (s - t)) * 100,
    w = c.useCallback(
      (A) => {
        const L = i.current;
        if (!L) return l;
        const g = L.getBoundingClientRect(),
          E = (A - g.left) / g.width,
          F = Math.max(0, Math.min(1, E));
        E < 0 ? b(Math.max(-1, E * 2)) : E > 1 ? b(Math.min(1, (E - 1) * 2)) : b(0);
        const I = t + F * (s - t),
          z = Math.round(I / n) * n;
        return Math.max(t, Math.min(s, z));
      },
      [t, s, n, l]
    ),
    D = (A) => {
      (p(!0), A.target.setPointerCapture(A.pointerId), a(w(A.clientX)));
    },
    $ = (A) => {
      u && a(w(A.clientX));
    },
    V = () => {
      (p(!1), b(0));
    };
  c.useEffect(() => {
    u || b(0);
  }, [u]);
  const P = d !== 0 ? `scaleX(${1 + Math.abs(d) * 0.04}) translateX(${d * 6}px)` : 'scaleX(1)';
  return e.jsxs('div', {
    className: 'select-none w-full',
    children: [
      o &&
        e.jsxs('div', {
          className: 'flex items-center justify-between mb-1.5',
          children: [
            e.jsx('span', { className: 'text-[12px] font-semibold text-gray-600', children: o }),
            e.jsxs('span', {
              className: 'text-[13px] font-bold tabular-nums',
              style: { color: m },
              children: [l, h]
            })
          ]
        }),
      e.jsxs('div', {
        ref: i,
        onPointerDown: D,
        onPointerMove: $,
        onPointerUp: V,
        className: 'relative h-6 flex items-center cursor-pointer touch-none',
        children: [
          e.jsx('div', { className: 'absolute left-0 right-0 h-1.5 rounded-full bg-gray-200' }),
          e.jsx('div', {
            className: 'absolute left-0 h-1.5 rounded-full origin-left',
            style: {
              width: `${_}%`,
              background: m,
              transform: P,
              transition: u
                ? 'none'
                : 'transform 0.5s cubic-bezier(0.16, 1.4, 0.3, 1), width 0.2s ease'
            }
          }),
          e.jsx('div', {
            className: 'absolute w-4 h-4 rounded-full bg-white shadow-md border-2 -translate-x-1/2',
            style: {
              left: `${_}%`,
              borderColor: m,
              transform: `translateX(-50%) scale(${u ? 1.25 : 1})`,
              transition: u ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1.4, 0.3, 1)'
            }
          })
        ]
      })
    ]
  });
}
function Pt({ alertasOp: t }) {
  const [s, n] = c.useState(1),
    l = c.useMemo(() => Math.max(1, ...t.map((o) => o.cantidad)), [t]),
    a = c.useMemo(() => t.filter((o) => o.cantidad >= s), [t, s]);
  return t.length === 0
    ? null
    : e.jsxs('div', {
        className: 'table-container',
        children: [
          e.jsxs('div', {
            className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('h3', {
                    className: 'font-bold text-gray-800',
                    children: 'Alertas Operacionales'
                  }),
                  e.jsx('p', {
                    className: 'text-[11px] text-gray-400',
                    children: 'NVs estancadas más tiempo del umbral en cada estado.'
                  })
                ]
              }),
              e.jsx('div', {
                className: 'w-full sm:w-56 shrink-0',
                children: e.jsx(Dt, {
                  min: 1,
                  max: l,
                  value: Math.min(s, l),
                  onChange: n,
                  label: 'Mínimo de NVs',
                  color: '#c62828'
                })
              })
            ]
          }),
          a.length === 0
            ? e.jsxs('p', {
                className: 'text-[12px] text-gray-400 py-4 text-center',
                children: ['Ningún estado supera el umbral de ', s, ' NV', s !== 1 ? 's' : '', '.']
              })
            : e.jsx('div', {
                className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
                children: a.map((o) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'rounded-xl bg-red-50 p-3 border-glow-red',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between mb-1',
                          children: [
                            e.jsx('span', {
                              className: 'text-[12px] font-semibold text-red-800',
                              children: o.estado
                            }),
                            e.jsx('span', {
                              className: 'text-[14px] font-bold text-red-600',
                              children: o.cantidad
                            })
                          ]
                        }),
                        e.jsxs('p', {
                          className: 'text-[10px] text-red-500 truncate',
                          children: [
                            'NVs: ',
                            o.nvs.join(', '),
                            o.cantidad > o.nvs.length ? ` (+${o.cantidad - o.nvs.length})` : ''
                          ]
                        })
                      ]
                    },
                    o.estado
                  )
                )
              })
        ]
      });
}
function It({ rankTransp: t, rankVend: s }) {
  return e.jsxs('div', {
    className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    children: [
      e.jsx('div', {
        className: 'table-container',
        children: e.jsxs('table', {
          children: [
            e.jsx('thead', {
              children: e.jsxs('tr', {
                children: [
                  e.jsx('th', { className: 'text-left', children: 'Transportista' }),
                  e.jsx('th', { children: 'NVs' }),
                  e.jsx('th', { children: '% A tiempo' }),
                  e.jsx('th', { children: 'Tardanza' })
                ]
              })
            }),
            e.jsx('tbody', {
              children: t.map((n) =>
                e.jsxs(
                  'tr',
                  {
                    children: [
                      e.jsx('td', { className: 'font-medium text-left', children: n.nombre }),
                      e.jsx('td', {
                        children: e.jsx('span', {
                          className: 'font-bold',
                          style: { color: '#f57c00' },
                          children: n.total
                        })
                      }),
                      e.jsx('td', {
                        children:
                          n.pctATiempo !== null
                            ? e.jsxs('span', {
                                className: `font-semibold ${Number(n.pctATiempo) >= 80 ? 'text-green-600' : Number(n.pctATiempo) >= 50 ? 'text-amber-600' : 'text-red-600'}`,
                                children: [n.pctATiempo, '%']
                              })
                            : e.jsx('span', { className: 'text-gray-300', children: '—' })
                      }),
                      e.jsx('td', {
                        children:
                          n.tardanzaProm !== null
                            ? e.jsxs('span', {
                                className: 'text-red-500 text-[12px]',
                                children: [n.tardanzaProm, 'd']
                              })
                            : e.jsx('span', { className: 'text-gray-300', children: '—' })
                      })
                    ]
                  },
                  n.nombre
                )
              )
            })
          ]
        })
      }),
      e.jsx('div', {
        className: 'table-container',
        children: e.jsxs('table', {
          children: [
            e.jsx('thead', {
              children: e.jsxs('tr', {
                children: [
                  e.jsx('th', { className: 'text-left', children: 'Vendedor' }),
                  e.jsx('th', { children: 'NVs' }),
                  e.jsx('th', { children: 'Activas' }),
                  e.jsx('th', { children: 'Reab.' }),
                  e.jsx('th', { children: 'Errores' }),
                  e.jsx('th', { children: '>48h' }),
                  e.jsx('th', { children: '% A tiempo' })
                ]
              })
            }),
            e.jsx('tbody', {
              children: s.map((n) =>
                e.jsxs(
                  'tr',
                  {
                    children: [
                      e.jsx('td', { className: 'font-medium text-left', children: n.nombre }),
                      e.jsx('td', {
                        children: e.jsx('span', {
                          className: 'font-bold',
                          style: { color: '#f57c00' },
                          children: n.total
                        })
                      }),
                      e.jsx('td', {
                        children:
                          n.activas > 0
                            ? e.jsx('span', {
                                className:
                                  'inline-flex items-center gap-1 text-blue-600 font-semibold',
                                children: n.activas
                              })
                            : e.jsx('span', { className: 'text-gray-300', children: '0' })
                      }),
                      e.jsx('td', {
                        children:
                          n.reabiertas > 0
                            ? e.jsx('span', {
                                className:
                                  'inline-flex items-center justify-center min-w-[34px] rounded-full bg-orange-50 px-2 py-0.5 text-orange-700 font-bold',
                                children: n.reabiertas
                              })
                            : e.jsx('span', { className: 'text-gray-300', children: '0' })
                      }),
                      e.jsx('td', {
                        children:
                          n.erroresActivos > 0
                            ? e.jsx('span', {
                                className:
                                  'inline-flex items-center justify-center min-w-[34px] rounded-full bg-orange-100 px-2 py-0.5 text-orange-700 font-bold',
                                children: n.erroresActivos
                              })
                            : e.jsx('span', { className: 'text-gray-300', children: '0' })
                      }),
                      e.jsx('td', {
                        children:
                          n.errores48h > 0
                            ? e.jsx('span', {
                                className:
                                  'inline-flex items-center justify-center min-w-[34px] rounded-full bg-red-100 px-2 py-0.5 text-red-700 font-bold',
                                children: n.errores48h
                              })
                            : e.jsx('span', { className: 'text-gray-300', children: '0' })
                      }),
                      e.jsx('td', {
                        children:
                          n.pctATiempo !== null
                            ? e.jsxs('span', {
                                className: `font-semibold ${Number(n.pctATiempo) >= 80 ? 'text-green-600' : Number(n.pctATiempo) >= 50 ? 'text-amber-600' : 'text-red-600'}`,
                                children: [n.pctATiempo, '%']
                              })
                            : e.jsx('span', { className: 'text-gray-300', children: '—' })
                      })
                    ]
                  },
                  n.nombre
                )
              )
            })
          ]
        })
      })
    ]
  });
}
function Ot({ data: t = [], onOpenIncidencias: s }) {
  const n = t.reduce((a, o) => a + (o.total || 0), 0),
    l = t.reduce((a, o) => a + (o.fuera48h || 0), 0);
  return e.jsxs('section', {
    className: 'bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden',
    children: [
      e.jsxs('div', {
        className:
          'px-5 py-4 border-b border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        children: [
          e.jsxs('div', {
            children: [
              e.jsx('div', {
                className: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400',
                children: 'Ranking automático'
              }),
              e.jsx('h3', {
                className: 'mt-1 text-lg font-black text-gray-900',
                children: 'Ranking de errores por vendedor'
              }),
              e.jsx('p', {
                className: 'mt-1 text-sm text-gray-500',
                children:
                  'Consolida automáticamente las incidencias activas por vendedor para medir errores no contabilizados y su impacto sobre el cumplimiento de 48 horas.'
              })
            ]
          }),
          e.jsxs('div', {
            className: 'flex flex-wrap gap-2',
            children: [
              e.jsxs('div', {
                className: 'rounded-xl border border-orange-100 bg-orange-50 px-3 py-2',
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.16em] text-orange-500',
                    children: 'Activas'
                  }),
                  e.jsx('div', {
                    className: 'mt-1 text-lg font-black text-orange-700',
                    children: n
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'rounded-xl border border-red-100 bg-red-50 px-3 py-2',
                children: [
                  e.jsx('div', {
                    className: 'text-[10px] font-bold uppercase tracking-[0.16em] text-red-500',
                    children: 'Fuera 48h'
                  }),
                  e.jsx('div', { className: 'mt-1 text-lg font-black text-red-700', children: l })
                ]
              }),
              e.jsx('button', {
                type: 'button',
                onClick: s,
                className:
                  'rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-bold hover:bg-slate-800 transition-colors',
                children: 'Ver incidencias activas'
              })
            ]
          })
        ]
      }),
      t.length === 0
        ? e.jsx('div', {
            className: 'px-5 py-14 text-center text-sm text-gray-400',
            children:
              'No hay incidencias activas para agrupar por vendedor en el rango seleccionado.'
          })
        : e.jsx('div', {
            className: 'overflow-x-auto',
            children: e.jsxs('table', {
              className: 'w-full text-sm',
              children: [
                e.jsx('thead', {
                  className: 'bg-gray-50 text-[11px] uppercase tracking-[0.14em] text-gray-400',
                  children: e.jsxs('tr', {
                    children: [
                      e.jsx('th', { className: 'px-4 py-3 text-left', children: 'Vendedor' }),
                      e.jsx('th', { className: 'px-4 py-3 text-center', children: 'Incidencias' }),
                      e.jsx('th', { className: 'px-4 py-3 text-center', children: 'Dirección' }),
                      e.jsx('th', { className: 'px-4 py-3 text-center', children: 'Transporte' }),
                      e.jsx('th', { className: 'px-4 py-3 text-center', children: 'Fuera 48h' }),
                      e.jsx('th', { className: 'px-4 py-3 text-center', children: 'Clientes' }),
                      e.jsx('th', {
                        className: 'px-4 py-3 text-center',
                        children: 'Transportistas'
                      }),
                      e.jsx('th', { className: 'px-4 py-3 text-left', children: 'Principal' }),
                      e.jsx('th', { className: 'px-4 py-3 text-center', children: 'Máx. días' })
                    ]
                  })
                }),
                e.jsx('tbody', {
                  children: t.map((a) =>
                    e.jsxs(
                      'tr',
                      {
                        className: 'border-t border-gray-100 hover:bg-orange-50/40',
                        children: [
                          e.jsx('td', {
                            className: 'px-4 py-3',
                            children: e.jsx('div', {
                              className: 'font-semibold text-gray-800',
                              children: a.vendedor
                            })
                          }),
                          e.jsx('td', {
                            className: 'px-4 py-3 text-center font-black text-orange-600',
                            children: a.total
                          }),
                          e.jsx('td', {
                            className: 'px-4 py-3 text-center',
                            children: a.direccion
                          }),
                          e.jsx('td', {
                            className: 'px-4 py-3 text-center',
                            children: a.transporte
                          }),
                          e.jsx('td', {
                            className: 'px-4 py-3 text-center',
                            children: e.jsx('span', {
                              className: `inline-flex min-w-[44px] items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${a.fuera48h > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`,
                              children: a.fuera48h
                            })
                          }),
                          e.jsx('td', { className: 'px-4 py-3 text-center', children: a.clientes }),
                          e.jsx('td', {
                            className: 'px-4 py-3 text-center',
                            children: a.transportistas
                          }),
                          e.jsx('td', {
                            className: 'px-4 py-3 text-xs text-gray-600',
                            children: a.topTipo
                          }),
                          e.jsx('td', {
                            className: 'px-4 py-3 text-center font-semibold text-gray-700',
                            children: a.maxDias
                          })
                        ]
                      },
                      a.vendedor
                    )
                  )
                })
              ]
            })
          })
    ]
  });
}
function Mt({ auditKpis: t }) {
  return t.length === 0
    ? null
    : e.jsxs('div', {
        className: 'table-container',
        children: [
          e.jsx('h3', {
            className: 'font-bold text-gray-800 mb-3',
            children: 'Actividad por Operador'
          }),
          e.jsx('p', {
            className: 'text-[11px] text-gray-400 mb-3',
            children: 'Registro de operaciones desde la hoja AUDIT.'
          }),
          e.jsxs('table', {
            children: [
              e.jsx('thead', {
                children: e.jsxs('tr', {
                  children: [
                    e.jsx('th', { className: 'text-left', children: 'Operador' }),
                    e.jsx('th', { children: 'Creadas' }),
                    e.jsx('th', { children: 'Actualizadas' }),
                    e.jsx('th', { children: 'Lote' }),
                    e.jsx('th', { children: 'Conflictos' }),
                    e.jsx('th', { children: 'Total' })
                  ]
                })
              }),
              e.jsx('tbody', {
                children: t
                  .filter((s) => s.nombre.toUpperCase() !== 'ADMIN')
                  .map((s) =>
                    e.jsxs(
                      'tr',
                      {
                        children: [
                          e.jsx('td', {
                            className: 'font-medium text-left',
                            children: e.jsxs('span', {
                              className: 'inline-flex items-center gap-2',
                              children: [
                                e.jsx('span', {
                                  className:
                                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0',
                                  style: { background: '#f57c00' },
                                  children: s.nombre.charAt(0).toUpperCase()
                                }),
                                s.nombre
                              ]
                            })
                          }),
                          e.jsx('td', {
                            children: e.jsx('span', {
                              className: 'text-green-600 font-semibold',
                              children: s.creates
                            })
                          }),
                          e.jsx('td', {
                            children: e.jsx('span', {
                              className: 'text-blue-600 font-semibold',
                              children: s.updates
                            })
                          }),
                          e.jsx('td', {
                            children: e.jsx('span', {
                              className: 'text-purple-600 font-semibold',
                              children: s.bulkUpdates
                            })
                          }),
                          e.jsx('td', {
                            children:
                              s.conflicts > 0
                                ? e.jsx('span', {
                                    className: 'text-red-600 font-semibold',
                                    children: s.conflicts
                                  })
                                : e.jsx('span', { className: 'text-gray-300', children: '0' })
                          }),
                          e.jsx('td', {
                            children: e.jsx('span', {
                              className: 'font-bold',
                              style: { color: '#f57c00' },
                              children: s.total
                            })
                          })
                        ]
                      },
                      s.nombre
                    )
                  )
              })
            ]
          })
        ]
      });
}
function kt({ divisions: t }) {
  return e.jsxs('div', {
    className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    children: [
      e.jsx('div', {
        className: 'table-container',
        children: e.jsxs('table', {
          children: [
            e.jsx('thead', {
              children: e.jsxs('tr', {
                children: [
                  e.jsx('th', { className: 'text-left', children: 'División' }),
                  e.jsx('th', { children: 'Cantidad' })
                ]
              })
            }),
            e.jsx('tbody', {
              children: t.map((s) =>
                e.jsxs(
                  'tr',
                  {
                    children: [
                      e.jsx('td', { className: 'font-medium text-left', children: s.division }),
                      e.jsx('td', {
                        children: e.jsx('span', {
                          className: 'font-bold',
                          style: { color: '#f57c00' },
                          children: s.cantidad.toLocaleString('es-CL')
                        })
                      })
                    ]
                  },
                  s.division
                )
              )
            })
          ]
        })
      }),
      e.jsx('div', {})
    ]
  });
}
function Ft({ tendencia: t }) {
  return t.length === 0
    ? null
    : e.jsxs('div', {
        className: 'table-container',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between mb-4 flex-wrap gap-2',
            children: [
              e.jsx('h3', {
                className: 'font-bold text-gray-800',
                children: 'Tendencia Histórica'
              }),
              e.jsx('span', {
                className: 'text-[11px] text-gray-400',
                children: 'Últimos 6 meses · evolución de métricas clave'
              })
            ]
          }),
          e.jsxs('div', {
            className: 'space-y-3 mb-5',
            children: [
              t.map((s) =>
                e.jsxs(
                  'div',
                  {
                    className: 'flex items-center gap-3',
                    children: [
                      e.jsx('span', {
                        className: 'w-20 shrink-0 text-[12px] text-gray-600 text-right font-medium',
                        children: s.label
                      }),
                      e.jsxs('div', {
                        className: 'flex-1 flex gap-1',
                        children: [
                          e.jsx('div', {
                            className: 'flex-1 h-5 bg-gray-100 rounded overflow-hidden',
                            title: `OTIF: ${s.otif ?? '—'}%`,
                            children: e.jsx('div', {
                              className:
                                'h-full rounded flex items-center justify-end pr-1.5 text-[10px] font-semibold text-white transition-all',
                              style: {
                                width: `${Math.max(4, s.otif ?? 0)}%`,
                                background: '#0d47a1'
                              },
                              children: s.otif != null ? `${s.otif}%` : ''
                            })
                          }),
                          e.jsx('div', {
                            className: 'flex-1 h-5 bg-gray-100 rounded overflow-hidden',
                            title: `A Tiempo: ${s.pctATiempo ?? '—'}%`,
                            children: e.jsx('div', {
                              className:
                                'h-full rounded flex items-center justify-end pr-1.5 text-[10px] font-semibold text-white transition-all',
                              style: {
                                width: `${Math.max(4, s.pctATiempo ?? 0)}%`,
                                background: '#2e7d32'
                              },
                              children: s.pctATiempo != null ? `${s.pctATiempo}%` : ''
                            })
                          })
                        ]
                      })
                    ]
                  },
                  s.label
                )
              ),
              e.jsxs('div', {
                className: 'flex items-center gap-4 ml-24 text-[10px] text-gray-400',
                children: [
                  e.jsxs('span', {
                    className: 'flex items-center gap-1',
                    children: [
                      e.jsx('span', {
                        className: 'w-2.5 h-2.5 rounded',
                        style: { background: '#0d47a1' }
                      }),
                      ' OTIF'
                    ]
                  }),
                  e.jsxs('span', {
                    className: 'flex items-center gap-1',
                    children: [
                      e.jsx('span', {
                        className: 'w-2.5 h-2.5 rounded',
                        style: { background: '#2e7d32' }
                      }),
                      ' % A Tiempo'
                    ]
                  })
                ]
              })
            ]
          }),
          e.jsxs('table', {
            children: [
              e.jsx('thead', {
                children: e.jsxs('tr', {
                  children: [
                    e.jsx('th', { className: 'text-left', children: 'Mes' }),
                    e.jsx('th', { children: 'Entregadas' }),
                    e.jsx('th', { children: 'OTIF' }),
                    e.jsx('th', { children: '% A Tiempo' }),
                    e.jsx('th', { children: 'Lead Time' })
                  ]
                })
              }),
              e.jsx('tbody', {
                children: t.map((s) =>
                  e.jsxs(
                    'tr',
                    {
                      children: [
                        e.jsx('td', { className: 'font-medium text-left', children: s.label }),
                        e.jsx('td', {
                          children: e.jsx('span', {
                            className: 'font-bold',
                            style: { color: '#f57c00' },
                            children: s.entregadas
                          })
                        }),
                        e.jsx('td', {
                          children:
                            s.otif != null
                              ? e.jsxs('span', {
                                  className: `font-semibold ${s.otif >= 80 ? 'text-green-600' : s.otif >= 50 ? 'text-amber-600' : 'text-red-600'}`,
                                  children: [s.otif, '%']
                                })
                              : e.jsx('span', { className: 'text-gray-300', children: '—' })
                        }),
                        e.jsx('td', {
                          children:
                            s.pctATiempo != null
                              ? e.jsxs('span', {
                                  className: `font-semibold ${s.pctATiempo >= 80 ? 'text-green-600' : s.pctATiempo >= 50 ? 'text-amber-600' : 'text-red-600'}`,
                                  children: [s.pctATiempo, '%']
                                })
                              : e.jsx('span', { className: 'text-gray-300', children: '—' })
                        }),
                        e.jsx('td', {
                          children:
                            s.leadTime != null
                              ? e.jsxs('span', {
                                  className: 'font-semibold text-gray-700',
                                  children: [s.leadTime, 'd']
                                })
                              : e.jsx('span', { className: 'text-gray-300', children: '—' })
                        })
                      ]
                    },
                    s.label
                  )
                )
              })
            ]
          })
        ]
      });
}
const zt = (t) => (t == null || t === '' ? '—' : String(t)),
  Y = (t) => {
    if (!t) return '—';
    const s = new Date(t);
    return Number.isNaN(s.getTime()) ? String(t).slice(0, 10) : s.toLocaleDateString('es-CL');
  },
  ae = (t) => (t == null ? '—' : String(t)),
  k = (t) => ({ text: t, style: 'sectionTitle' }),
  v = (t, s, n) => ({
    table: {
      headerRows: 1,
      widths: n,
      body: [
        t.map((l) => ({ text: l, style: 'tableHeader' })),
        ...s.map((l) => l.map((a) => ({ text: zt(a), style: 'tableCell' })))
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 12]
  });
async function Bt({
  range: t,
  kpis: s,
  estadoTable: n = [],
  weekly: l = [],
  leadTime: a = [],
  tiemposCiclo: o,
  otif: h,
  divisions: m = [],
  transportistas: i = [],
  rankTransp: u = [],
  rankVend: p = [],
  alertas: d = {},
  alertasOperacionales: b = [],
  calidad: _ = {},
  operaciones: w = []
}) {
  var F, I, z, J, Q, Z;
  const D = await Ee(
      () => import('./pdfmake-pNuCVKVo.js').then((r) => r.p),
      __vite__mapDeps([0, 1])
    ),
    $ = await Ee(() => import('./vfs_fonts-CfcbzCvn.js').then((r) => r.v), __vite__mapDeps([2, 1])),
    V = D.default || D,
    P = $.default || $;
  V.vfs = ((F = P.pdfMake) == null ? void 0 : F.vfs) || P.vfs || V.vfs;
  const A = new Date().toLocaleString('es-CL'),
    L = `${(t == null ? void 0 : t.from) || 'Inicio'} al ${(t == null ? void 0 : t.to) || 'Hoy'}`,
    g = [
      { text: 'INFORME OPERACIONAL - PANEL PTM', style: 'title' },
      { text: `Período filtrado: ${L}`, style: 'subtitle' },
      { text: `Generado: ${A} | N.V. incluidas: ${w.length}`, style: 'metadata' },
      k('Resumen ejecutivo'),
      v(
        ['Indicador', 'Resultado', 'Indicador', 'Resultado'],
        [
          [
            'N.V. totales',
            s == null ? void 0 : s.total,
            'N.V. activas (vista actual)',
            s == null ? void 0 : s.activas
          ],
          [
            'Entregadas',
            s == null ? void 0 : s.entregadas,
            'Tasa de entrega',
            `${(s == null ? void 0 : s.tasaEntrega) ?? '0'}%`
          ],
          [
            'A tiempo',
            `${(s == null ? void 0 : s.pctAtiempo) ?? '0'}%`,
            'Tardanza promedio',
            `${(s == null ? void 0 : s.leadTimeTardanza) ?? '0'} días`
          ],
          [
            'Incidencias activas',
            s == null ? void 0 : s.incidencias,
            'OTIF',
            (h == null ? void 0 : h.pct) === null || (h == null ? void 0 : h.pct) === void 0
              ? '—'
              : `${h.pct}%`
          ],
          [
            'Fill rate shipping',
            ((I = s == null ? void 0 : s.fillRateShipping) == null ? void 0 : I.pct) === null ||
            ((z = s == null ? void 0 : s.fillRateShipping) == null ? void 0 : z.pct) === void 0
              ? '—'
              : `${s.fillRateShipping.pct}%`,
            'Cumplimiento N.V.',
            ((J = s == null ? void 0 : s.cumplimientoNV) == null ? void 0 : J.pct) === null ||
            ((Q = s == null ? void 0 : s.cumplimientoNV) == null ? void 0 : Q.pct) === void 0
              ? '—'
              : `${s.cumplimientoNV.pct}%`
          ]
        ],
        ['27%', '23%', '27%', '23%']
      ),
      k('Estado de las N.V.'),
      v(
        ['Estado', 'PTM', 'Orange', 'Farmapack', 'Varios', 'Total'],
        n.map((r) => [r.estado, r.ptm, r.orange, r.farmapack, r.varios, r.total]),
        ['*', 'auto', 'auto', 'auto', 'auto', 'auto']
      ),
      k('Tendencia y tiempos de ciclo'),
      v(
        ['Semana', 'Aprobadas', 'Entregadas', 'Tardanza promedio', 'Fill rate'],
        l.map((r) => [
          r.semana,
          r.aprobadas,
          r.entregadas,
          `${ae(r.tardanza)} días`,
          `${ae(r.fillRate)}%`
        ]),
        ['*', 'auto', 'auto', 'auto', 'auto']
      ),
      v(
        ['Etapa', 'Promedio', 'N.V. evaluadas'],
        ((o == null ? void 0 : o.etapas) || []).map((r) => [
          r.nombre,
          r.dias === null ? '—' : `${r.dias} días`,
          r.n
        ]),
        ['*', 'auto', 'auto']
      ),
      ...(a.length
        ? [
            v(
              ['Semana', 'Tardanza promedio', 'N.V. evaluadas', 'A tiempo'],
              a.map((r) => [r.semana, `${ae(r.dias)} días`, r.count, `${ae(r.pctAtiempo)}%`]),
              ['*', 'auto', 'auto', 'auto']
            )
          ]
        : []),
      k('Alertas y calidad de datos'),
      v(
        [
          'Alertas vencidas',
          'Vencen hoy',
          'Vencen mañana',
          'Total alertas',
          'Problemas de calidad'
        ],
        [[d.vencidos || 0, d.hoy || 0, d.manana || 0, d.total || 0, _.total || 0]],
        ['20%', '20%', '20%', '20%', '20%']
      )
    ];
  ((Z = d.detalle) != null &&
    Z.length &&
    (g.push(k('Detalle de alertas de riesgo')),
    g.push(
      v(
        ['N.V.', 'Cliente', 'Estado', 'Transportista', 'Fecha compromiso', 'Días vencido'],
        d.detalle.map((r) => [
          r.nv,
          r.cliente,
          r.estado,
          r.transportista,
          Y(r.fecha_compromiso),
          r.diasVencido
        ]),
        ['auto', '*', 'auto', '*', 'auto', 'auto']
      )
    )),
    b.length &&
      (g.push(k('N.V. estancadas por estado')),
      g.push(
        v(
          ['Estado', 'Cantidad', 'Muestra de N.V.'],
          b.map((r) => [r.estado, r.cantidad, (r.nvs || []).join(', ')]),
          ['30%', '15%', '55%']
        )
      )),
    g.push(k('Distribución y rankings')),
    g.push(
      v(
        ['División', 'Cantidad', 'Transportista', 'Cantidad'],
        Array.from({ length: Math.max(m.length, i.length) }, (r, T) => {
          var K, G, H, B;
          return [
            ((K = m[T]) == null ? void 0 : K.division) || '—',
            ((G = m[T]) == null ? void 0 : G.cantidad) ?? '—',
            ((H = i[T]) == null ? void 0 : H.transportista) || '—',
            ((B = i[T]) == null ? void 0 : B.cantidad) ?? '—'
          ];
        }),
        ['35%', '15%', '35%', '15%']
      )
    ),
    g.push(
      v(
        ['Transportista', 'Total', 'Entregadas', '% a tiempo', 'Tardanza'],
        u.map((r) => [
          r.nombre,
          r.total,
          r.entregadas,
          r.pctATiempo === null ? '—' : `${r.pctATiempo}%`,
          r.tardanzaProm === null ? '—' : `${r.tardanzaProm} días`
        ]),
        ['*', 'auto', 'auto', 'auto', 'auto']
      )
    ),
    g.push(
      v(
        ['Vendedor', 'Total', 'Entregadas', 'Activas', 'Reabiertas', 'Errores activos'],
        p.map((r) => [r.nombre, r.total, r.entregadas, r.activas, r.reabiertas, r.erroresActivos]),
        ['*', 'auto', 'auto', 'auto', 'auto', 'auto']
      )
    ),
    g.push({
      text: 'Detalle completo de N.V. del período filtrado',
      style: 'sectionTitle',
      pageBreak: 'before'
    }),
    g.push(
      v(
        [
          'N.V.',
          'Canal',
          'Cliente',
          'Vendedor',
          'Estado',
          'Transportista',
          'División',
          'Aprobación',
          'Compromiso',
          'Despacho',
          'Entregado'
        ],
        w.map((r) => [
          r.nv,
          r.canal,
          r.cliente,
          r.vendedor,
          r.estado,
          r.transportista,
          r.division,
          Y(r.fecha_aprobacion),
          Y(r.fecha_compromiso),
          Y(r.fecha_despacho),
          Y(r.fecha_entregado)
        ]),
        [34, 35, 105, 75, 65, 85, 60, 52, 52, 52, 52]
      )
    ));
  const E = w.filter((r) => r.incidencia || r.reabierta || r.urgente);
  (E.length &&
    (g.push({
      text: 'Observaciones operacionales asociadas',
      style: 'sectionTitle',
      pageBreak: 'before'
    }),
    g.push(
      v(
        ['N.V.', 'Guía', 'Factura', 'Urgente', 'Reabierta', 'Incidencia / observación'],
        E.map((r) => [
          r.nv,
          r.guia,
          r.factura,
          r.urgente ? 'Sí' : 'No',
          r.reabierta ? `Sí - ${r.motivo_reapertura || 'sin motivo'}` : 'No',
          [r.incidencia, r.estado_incidencia, r.observaciones_incidencia]
            .filter(Boolean)
            .join(' | ') || '—'
        ]),
        ['auto', 'auto', 'auto', 'auto', '25%', '*']
      )
    )),
    V.createPdf({
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [28, 48, 28, 38],
      header: () => ({
        text: 'CCO - Panel PTM',
        margin: [28, 18, 28, 0],
        fontSize: 8,
        color: '#64748b'
      }),
      footer: (r, T) => ({
        text: `Informe operacional | ${L} | Página ${r} de ${T}`,
        alignment: 'center',
        margin: [0, 8, 0, 0],
        fontSize: 8,
        color: '#64748b'
      }),
      content: g,
      defaultStyle: { fontSize: 8, color: '#1f2937' },
      styles: {
        title: {
          fontSize: 18,
          bold: !0,
          color: '#0f172a',
          alignment: 'center',
          margin: [0, 0, 0, 4]
        },
        subtitle: { fontSize: 10, color: '#475569', alignment: 'center', margin: [0, 0, 0, 2] },
        metadata: { fontSize: 8, color: '#64748b', alignment: 'center', margin: [0, 0, 0, 14] },
        sectionTitle: { fontSize: 12, bold: !0, color: '#163D63', margin: [0, 10, 0, 5] },
        tableHeader: {
          bold: !0,
          fontSize: 7,
          color: '#ffffff',
          fillColor: '#163D63',
          margin: [3, 3, 3, 3]
        },
        tableCell: { fontSize: 7, margin: [3, 3, 3, 3] }
      }
    }).download(
      `Panel_PTM_${(t == null ? void 0 : t.from) || 'inicio'}_${(t == null ? void 0 : t.to) || 'hoy'}.pdf`
    ));
}
const he = '2026-01-01',
  pe = Pe();
function Le() {
  return typeof window > 'u'
    ? { from: he, to: pe }
    : {
        from: localStorage.getItem('panel_filter_from') || he,
        to: localStorage.getItem('panel_filter_to') || pe
      };
}
function Jt() {
  const [t, s] = c.useState(null),
    [n, l] = c.useState([]),
    [a, o] = c.useState([]),
    [h, m] = c.useState([]),
    [i, u] = c.useState([]),
    [p, d] = c.useState([]),
    [b, _] = c.useState([]),
    [w, D] = c.useState(null),
    [$, V] = c.useState(null),
    [P, A] = c.useState([]),
    [L, g] = c.useState([]),
    [E, F] = c.useState([]),
    [I, z] = c.useState([]),
    [J, Q] = c.useState([]),
    [Z, r] = c.useState([]),
    [T, K] = c.useState(!0),
    [G, H] = c.useState(null),
    [B, Oe] = c.useState(''),
    [f, Me] = c.useState(Le),
    [X, ue] = c.useState(!1),
    [fe, je] = c.useState(null),
    [ke, be] = c.useState([]),
    [Fe, ge] = c.useState(!1),
    [ye, Ne] = c.useState(!1),
    [ze, ve] = c.useState([]),
    [Be, we] = c.useState(!1),
    [Te, Ue] = c.useState(!1),
    [re, Ke] = c.useState({ vencidos: 0, hoy: 0, manana: 0, total: 0, detalle: [] }),
    [Ae, Se] = c.useState(!1),
    [ee, Ge] = c.useState({ total: 0, porTipo: {}, detalle: [] }),
    te = c.useCallback(
      async (x) => {
        (je(x), ge(!0));
        try {
          const N = await et(x, f.from, f.to);
          be(N);
        } catch (N) {
          (console.error('Error cargando detalle:', N), be([]));
        }
        ge(!1);
      },
      [f]
    ),
    He = c.useCallback(async () => {
      (Ne(!0), we(!0));
      try {
        const x = await tt(f.from, f.to);
        ve(x);
      } catch (x) {
        (console.error('Error cargando incidencias:', x), ve([]));
      }
      we(!1);
    }, [f]),
    S = c.useCallback(async (x, N) => {
      (K(!0), H(null), Me({ from: x, to: N }));
      try {
        const j = await st(x, N);
        (s(j.kpis),
          l(j.estadoTable),
          o(j.divisions),
          m(j.transportistas),
          u(j.weeklyTrend),
          d(j.estadoResumen),
          _(j.leadTimeSemanal),
          D(j.tiemposCiclo),
          V(j.otif),
          A(j.rankingTransportistas),
          g(j.rankingVendedores),
          F(j.incidenciasPorVendedor || []),
          z(j.alertasOperacionales),
          Ke(j.alertas),
          Ge(j.calidad),
          Oe(new Date().toLocaleString('es-CL')));
      } catch (j) {
        (console.error('Error loading data:', j),
          H('Error al cargar los datos. Verifica tu conexión e intenta de nuevo.'));
      }
      K(!1);
    }, []),
    Xe = c.useCallback(async () => {
      if (!(!t || X)) {
        ue(!0);
        try {
          const x = await at(f.from, f.to);
          (await Bt({
            range: f,
            kpis: t,
            estadoTable: n,
            weekly: i,
            leadTime: b,
            tiemposCiclo: w,
            otif: $,
            divisions: a,
            transportistas: h,
            rankTransp: P,
            rankVend: L,
            alertas: re,
            alertasOperacionales: I,
            calidad: ee,
            operaciones: x
          }),
            _e.success(`PDF descargado con ${x.length} N.V. del período filtrado.`));
        } catch (x) {
          (console.error('Error exportando PDF del panel:', x),
            _e.error('No se pudo generar el PDF. Intenta nuevamente.'));
        } finally {
          ue(!1);
        }
      }
    }, [re, I, ee, a, n, X, t, b, $, f, P, L, w, h, i]);
  c.useEffect(() => {
    const x = Le();
    (S(x.from, x.to),
      nt()
        .then((N) => {
          N.operadores.length > 0 && Q(N.operadores);
        })
        .catch(() => {}),
      rt(6)
        .then((N) => r(N))
        .catch(() => {}));
  }, [S]);
  const W = c.useRef(f);
  (c.useEffect(() => {
    W.current = f;
  }, [f]),
    c.useEffect(() => {
      if (!le) return;
      let x = null;
      const N = () => {
          (typeof document < 'u' && document.hidden) ||
            (x && clearTimeout(x), (x = setTimeout(() => S(W.current.from, W.current.to), 2500)));
        },
        j = le
          .channel('tms-oper-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_operaciones' }, N)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tms_operaciones_sync' },
            N
          )
          .subscribe();
      return () => {
        (x && clearTimeout(x), le.removeChannel(j));
      };
    }, [S]));
  const [Ce, q] = c.useState(120),
    O = c.useRef(120);
  return (
    c.useEffect(() => {
      ((O.current = 120), q(120));
      const x = setInterval(() => {
        if (((O.current -= 1), q(O.current), O.current <= 0)) {
          if (((O.current = 120), q(120), typeof document < 'u' && document.hidden)) return;
          S(f.from, f.to);
        }
      }, 1e3);
      return () => clearInterval(x);
    }, [S, f]),
    c.useEffect(() => {
      const x = () => {
        typeof document < 'u' &&
          !document.hidden &&
          ((O.current = 120), q(120), S(W.current.from, W.current.to));
      };
      return (
        document.addEventListener('visibilitychange', x),
        () => document.removeEventListener('visibilitychange', x)
      );
    }, [S]),
    T && !t
      ? e.jsx('div', {
          className: 'dash-root min-h-screen flex items-center justify-center bg-gray-50',
          children: e.jsxs('div', {
            className: 'text-center',
            children: [
              e.jsx('div', {
                className:
                  'w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'
              }),
              e.jsx('p', { className: 'text-gray-500', children: 'Cargando dashboard...' })
            ]
          })
        })
      : G && !t
        ? e.jsx('div', {
            className: 'dash-root min-h-screen flex items-center justify-center bg-gray-50',
            children: e.jsxs('div', {
              className: 'text-center max-w-md',
              children: [
                e.jsx('p', {
                  className: 'text-red-600 text-lg font-semibold mb-2',
                  children: 'Error de carga'
                }),
                e.jsx('p', { className: 'text-gray-500 mb-4', children: G }),
                e.jsx('button', {
                  onClick: () => S(f.from, f.to),
                  className:
                    'px-5 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors',
                  children: 'Reintentar'
                })
              ]
            })
          })
        : e.jsxs('div', {
            className: 'dash-root min-h-screen bg-gray-50',
            children: [
              e.jsx('header', {
                className: 'bg-white border-b border-gray-200 sticky top-0 z-40',
                children: e.jsxs('div', {
                  className: 'max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-4',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm',
                          style: { background: 'linear-gradient(135deg, #f57c00, #e65100)' },
                          children: 'PTM'
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsx('h1', {
                              className: 'text-lg font-bold text-gray-800',
                              children: 'PANEL DASHBOARD'
                            }),
                            e.jsx('p', {
                              className: 'text-xs text-gray-400 uppercase tracking-wide',
                              children: 'Resumen Operacional'
                            })
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center gap-4',
                      children: [
                        e.jsx(ft, { onFilter: S, defaultFrom: he, defaultTo: pe }),
                        e.jsxs('button', {
                          onClick: Xe,
                          disabled: T || X || !t,
                          className:
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50',
                          title: 'Descargar informe PDF del período filtrado',
                          children: [
                            e.jsx('svg', {
                              className: `w-3.5 h-3.5 ${X ? 'animate-bounce' : ''}`,
                              fill: 'none',
                              stroke: 'currentColor',
                              viewBox: '0 0 24 24',
                              children: e.jsx('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: 2,
                                d: 'M12 3v12m0 0 4-4m-4 4-4-4m-5 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2'
                              })
                            }),
                            e.jsx('span', { children: X ? 'Generando...' : 'Descargar PDF' })
                          ]
                        }),
                        e.jsxs('button', {
                          onClick: () => {
                            ((O.current = 120), q(120), S(f.from, f.to));
                          },
                          disabled: T,
                          className:
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-700 transition-colors disabled:opacity-50',
                          title: 'Actualizar ahora',
                          children: [
                            e.jsx('svg', {
                              className: `w-3.5 h-3.5 ${T ? 'animate-spin' : ''}`,
                              fill: 'none',
                              stroke: 'currentColor',
                              viewBox: '0 0 24 24',
                              children: e.jsx('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: 2,
                                d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                              })
                            }),
                            e.jsxs('span', {
                              children: [Math.floor(Ce / 60), ':', String(Ce % 60).padStart(2, '0')]
                            })
                          ]
                        }),
                        B &&
                          e.jsx('span', {
                            className: 'text-[10px] text-gray-400 hidden sm:inline',
                            children: B
                          })
                      ]
                    })
                  ]
                })
              }),
              e.jsxs('main', {
                className: 'max-w-[1400px] mx-auto px-4 py-6 space-y-6',
                children: [
                  T &&
                    e.jsx('div', {
                      className: 'fixed top-0 left-0 w-full h-1 bg-orange-100 z-[100]',
                      children: e.jsx('div', {
                        className: 'h-full bg-orange-500 animate-pulse w-1/2'
                      })
                    }),
                  e.jsx(St, { kpis: t, onSelect: te }),
                  e.jsx(Vt, { kpis: t, onDetalle: te }),
                  e.jsx(Lt, { calidadData: ee, onOpen: () => Se(!0) }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
                    children: [
                      e.jsxs('div', {
                        className: 'space-y-4',
                        children: [
                          e.jsx(ot, { data: n, onSelectEstado: te }),
                          e.jsx('div', {
                            className: 'table-container',
                            children: e.jsxs('table', {
                              children: [
                                e.jsx('thead', {
                                  children: e.jsxs('tr', {
                                    children: [
                                      e.jsx('th', { className: 'text-left', children: 'Estado' }),
                                      e.jsx('th', { children: 'Cantidad' })
                                    ]
                                  })
                                }),
                                e.jsx('tbody', {
                                  children: p.map((x) =>
                                    e.jsxs(
                                      'tr',
                                      {
                                        onClick: () => te(x.estado),
                                        className: 'cursor-pointer hover:bg-orange-50',
                                        children: [
                                          e.jsx('td', {
                                            className: 'font-medium text-left',
                                            children: x.estado
                                          }),
                                          e.jsx('td', { className: 'font-bold', children: x.count })
                                        ]
                                      },
                                      x.estado
                                    )
                                  )
                                })
                              ]
                            })
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'space-y-4',
                        children: [e.jsx(it, { data: i }), e.jsx(pt, { data: b })]
                      })
                    ]
                  }),
                  e.jsx(Rt, { tiemposCiclo: w }),
                  e.jsx(Pt, { alertasOp: I }),
                  e.jsx(Ot, { data: E, onOpenIncidencias: He }),
                  e.jsx(It, { rankTransp: P, rankVend: L }),
                  e.jsx(Mt, { auditKpis: J }),
                  e.jsx(kt, { divisions: a }),
                  e.jsx(Ft, { tendencia: Z }),
                  e.jsxs('div', {
                    className: 'text-center text-xs text-gray-400 py-4',
                    children: ['Fecha de la última actualización: ', B]
                  })
                ]
              }),
              fe && e.jsx(bt, { estado: fe, data: ke, loading: Fe, onClose: () => je(null) }),
              ye && e.jsx(yt, { open: ye, data: ze, loading: Be, onClose: () => Ne(!1) }),
              Te && e.jsx(Tt, { open: Te, data: re, onClose: () => Ue(!1) }),
              Ae && e.jsx(At, { open: Ae, data: ee, onClose: () => Se(!1) })
            ]
          })
  );
}
export { Jt as default };
