import { j as e } from './query-vendor-BNjBrM5A.js';
import { r as l } from './react-vendor-6aw4XXjH.js';
import {
  R as ve,
  e as we,
  C as X,
  X as q,
  Y,
  T as J,
  L as Me,
  f as Q,
  B as Oe,
  h as be,
  g as Fe,
  d as ze
} from './charts-vendor-7leLLwOT.js';
import {
  j as Ce,
  k as Ue,
  l as F,
  m as Be,
  o as Ke,
  p as He,
  e as Ge,
  g as We,
  h as Xe
} from './dashData-DHv93Vaf.js';
import { s as G } from './index-CyF0yQ6M.js';
import { t as ge } from './ui-vendor-naG2PYVT.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
function qe(t) {
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
function Ye({ data: t, onSelectEstado: s }) {
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
          children: t.map((n, r) =>
            e.jsxs(
              'tr',
              {
                onClick: () => (s == null ? void 0 : s(n.estado)),
                className: s ? 'cursor-pointer hover:bg-orange-50' : '',
                children: [
                  e.jsxs('td', { className: 'text-gray-400 text-xs', children: [r + 1, '.'] }),
                  e.jsx('td', {
                    className: 'text-left',
                    children: e.jsx('span', { className: qe(n.estado), children: n.estado })
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
const Je = l.memo(Ye);
function Qe({ data: t }) {
  return e.jsxs('div', {
    className: 'bg-white rounded-xl p-4 shadow-sm',
    children: [
      e.jsx('h3', {
        className: 'text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide',
        children: 'Tendencia Semanal'
      }),
      e.jsx(ve, {
        width: '100%',
        height: 300,
        children: e.jsxs(we, {
          data: t,
          children: [
            e.jsx(X, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
            e.jsx(q, { dataKey: 'semana', tick: { fontSize: 10 }, interval: 'preserveStartEnd' }),
            e.jsx(Y, { tick: { fontSize: 10 } }),
            e.jsx(J, {
              contentStyle: {
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }),
            e.jsx(Me, { wrapperStyle: { fontSize: 11 } }),
            e.jsx(Q, {
              type: 'monotone',
              dataKey: 'aprobadas',
              stroke: '#f57c00',
              strokeWidth: 2,
              name: 'NVs Aprobadas',
              dot: { r: 3 }
            }),
            e.jsx(Q, {
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
const Ze = l.memo(Qe),
  W = {
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
function et(t) {
  return t > 3 ? '#c62828' : t > 1 ? '#f57c00' : '#2e7d32';
}
function tt(t) {
  return t >= 80 ? '#2e7d32' : t >= 50 ? '#f57c00' : '#c62828';
}
function st({ data: t }) {
  const [s, n] = l.useState('barras'),
    [r, a] = l.useState('dias'),
    c = W[r],
    o = {
      contentStyle: { borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      formatter: (x, p, m) => {
        const i = m.payload;
        return [
          `${i.dias} días tarde  ·  ${i.pctAtiempo}% a tiempo  ·  ${i.count} entregas`,
          r === 'dias' ? 'Tardanza' : 'A tiempo'
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
            children: c.titulo
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsx('div', {
                className: 'flex rounded-lg bg-gray-100 p-0.5',
                children: Object.keys(W).map((x) =>
                  e.jsx(
                    'button',
                    {
                      onClick: () => a(x),
                      className: `px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${r === x ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`,
                      children: W[x].label
                    },
                    x
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
      e.jsx(ve, {
        width: '100%',
        height: 200,
        children:
          s === 'barras'
            ? e.jsxs(Oe, {
                data: t,
                children: [
                  e.jsx(X, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
                  e.jsx(q, {
                    dataKey: 'semana',
                    tick: { fontSize: 9 },
                    interval: 'preserveStartEnd'
                  }),
                  e.jsx(Y, {
                    tick: { fontSize: 10 },
                    domain: r === 'pctAtiempo' ? [0, 100] : void 0
                  }),
                  e.jsx(J, { ...o }),
                  e.jsx(be, { y: 0, stroke: '#ccc' }),
                  e.jsx(Fe, {
                    dataKey: r,
                    radius: [4, 4, 0, 0],
                    children: t.map((x, p) =>
                      e.jsx(ze, { fill: r === 'dias' ? et(x.dias) : tt(x.pctAtiempo) }, p)
                    )
                  })
                ]
              })
            : e.jsxs(we, {
                data: t,
                children: [
                  e.jsx(X, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
                  e.jsx(q, {
                    dataKey: 'semana',
                    tick: { fontSize: 9 },
                    interval: 'preserveStartEnd'
                  }),
                  e.jsx(Y, {
                    tick: { fontSize: 10 },
                    domain: r === 'pctAtiempo' ? [0, 100] : void 0
                  }),
                  e.jsx(J, { ...o }),
                  e.jsx(be, { y: 0, stroke: '#ccc' }),
                  e.jsx(Q, {
                    type: 'monotone',
                    dataKey: r,
                    stroke: c.color,
                    strokeWidth: 2.5,
                    dot: { r: 3, fill: c.color },
                    activeDot: { r: 5 }
                  })
                ]
              })
      })
    ]
  });
}
const at = l.memo(st);
function ye(t, s) {
  return typeof window > 'u' ? s : localStorage.getItem(t) || s;
}
function nt(t, s) {
  (localStorage.setItem('panel_filter_from', t), localStorage.setItem('panel_filter_to', s));
}
function rt({ onFilter: t, defaultFrom: s, defaultTo: n }) {
  const [r, a] = l.useState(() => ye('panel_filter_from', s)),
    [c, h] = l.useState(() => ye('panel_filter_to', n));
  function o(m, i) {
    (a(m), h(i), nt(m, i), t(m, i));
  }
  const x = [
    { label: 'Última semana', days: 7 },
    { label: 'Último mes', days: 30 },
    { label: 'Últimos 3 meses', days: 90 },
    { label: 'Año completo', days: 365 }
  ];
  function p(m) {
    const i = Ce();
    o(Ue(i, -m), i);
  }
  return e.jsxs('div', {
    className: 'flex flex-wrap items-center gap-3',
    children: [
      e.jsxs('div', {
        className: 'flex items-center gap-2',
        children: [
          e.jsx('input', {
            type: 'date',
            value: r,
            onChange: (m) => a(m.target.value),
            className:
              'px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400'
          }),
          e.jsx('span', { className: 'text-gray-400 text-sm', children: 'a' }),
          e.jsx('input', {
            type: 'date',
            value: c,
            onChange: (m) => h(m.target.value),
            className:
              'px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400'
          }),
          e.jsx('button', {
            onClick: () => o(r, c),
            className:
              'px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition',
            children: 'Filtrar'
          })
        ]
      }),
      e.jsx('div', {
        className: 'flex gap-1',
        children: x.map((m) =>
          e.jsx(
            'button',
            {
              onClick: () => p(m.days),
              className:
                'px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300 transition',
              children: m.label
            },
            m.days
          )
        )
      })
    ]
  });
}
const Ae = {
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
  k = (t) => F(t, '—'),
  $ = (t) => F(t, '');
function lt(t, s) {
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
    r = (i) => {
      const g = i == null ? '' : String(i);
      return /[";\n]/.test(g) ? `"${g.replace(/"/g, '""')}"` : g;
    },
    a = s.map((i) =>
      [
        i.nv,
        i.cliente,
        i.vendedor,
        i.transportista,
        i.tipo_despacho || '',
        i.division,
        i.reabierta ? 'SI' : 'NO',
        i.motivo_reapertura || '',
        $(i.fecha_registro_nv),
        $(i.fecha_aprobacion),
        $(i.fecha_aprobacion_real),
        i.dif_aprobacion === null ? '' : i.dif_aprobacion,
        $(i.fecha_compromiso),
        $(i.fecha_promesa_efectiva),
        i.dias_atraso_ingreso > 0 ? i.dias_atraso_ingreso : '',
        $(i.fecha_despacho),
        i.dias_entrega === null ? '' : i.dias_entrega
      ]
        .map(r)
        .join(';')
    ),
    c =
      '\uFEFF' +
      [n.join(';'), ...a].join(`\r
`),
    h = new Blob([c], { type: 'text/csv;charset=utf-8;' }),
    o = URL.createObjectURL(h),
    x = document.createElement('a'),
    p = (Ae[t] || t).replace(/[^\wáéíóúñ]+/gi, '_').replace(/^_+|_+$/g, ''),
    m = new Date().toISOString().slice(0, 10);
  ((x.href = o), (x.download = `NVs_${p}_${m}.csv`), x.click(), URL.revokeObjectURL(o));
}
const j = 'bg-white',
  w = 'bg-blue-50/60',
  N = 'bg-amber-50/60';
function ct({ estado: t, data: s, loading: n, onClose: r }) {
  return (
    l.useEffect(() => {
      function a(c) {
        c.key === 'Escape' && r();
      }
      return (
        t && (document.addEventListener('keydown', a), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', a), (document.body.style.overflow = ''));
        }
      );
    }, [t, r]),
    t
      ? e.jsx('div', {
          className: 'fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4',
          onClick: r,
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
                          Ae[t] ||
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
                          onClick: () => lt(t, s),
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
                        onClick: r,
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
                                    className: `${j} px-3 py-1 text-[10px] font-semibold text-gray-400 text-left border-b border-gray-100`,
                                    children: 'INFORMACIÓN'
                                  }),
                                  e.jsx('th', {
                                    colSpan: 4,
                                    className: `${w} px-3 py-1 text-[10px] font-semibold text-blue-400 text-left border-b border-blue-100 border-l border-l-blue-200/50`,
                                    children: 'APROBACIÓN'
                                  }),
                                  e.jsx('th', {
                                    colSpan: 5,
                                    className: `${N} px-3 py-1 text-[10px] font-semibold text-amber-500 text-left border-b border-amber-100 border-l border-l-amber-200/50`,
                                    children: 'LOGÍSTICA'
                                  })
                                ]
                              }),
                              e.jsxs('tr', {
                                className: 'text-left text-xs text-gray-500 uppercase',
                                children: [
                                  e.jsx('th', { className: `${j} px-3 py-2`, children: 'N.V' }),
                                  e.jsx('th', { className: `${j} px-3 py-2`, children: 'Cliente' }),
                                  e.jsx('th', {
                                    className: `${j} px-3 py-2`,
                                    children: 'Vendedor'
                                  }),
                                  e.jsx('th', {
                                    className: `${j} px-3 py-2`,
                                    children: 'Transportista'
                                  }),
                                  e.jsx('th', {
                                    className: `${j} px-3 py-2`,
                                    children: 'Tipo Desp.'
                                  }),
                                  e.jsx('th', {
                                    className: `${j} px-3 py-2`,
                                    children: 'División'
                                  }),
                                  e.jsx('th', {
                                    className: `${j} px-3 py-2 text-center`,
                                    children: 'Reab.'
                                  }),
                                  e.jsx('th', { className: `${j} px-3 py-2`, children: 'Motivo' }),
                                  e.jsx('th', {
                                    className: `${w} px-3 py-2 border-l border-l-blue-200/50`,
                                    children: 'Fecha N.V'
                                  }),
                                  e.jsx('th', {
                                    className: `${w} px-3 py-2`,
                                    children: 'Fecha Creación N.V'
                                  }),
                                  e.jsx('th', {
                                    className: `${w} px-3 py-2`,
                                    children: 'Aprob. Real'
                                  }),
                                  e.jsx('th', {
                                    className: `${w} px-3 py-2 text-center`,
                                    children: 'Dif.'
                                  }),
                                  e.jsx('th', {
                                    className: `${N} px-3 py-2 border-l border-l-amber-200/50`,
                                    children: 'Compromiso'
                                  }),
                                  e.jsx('th', {
                                    className: `${N} px-3 py-2`,
                                    children: 'Promesa Efect.'
                                  }),
                                  e.jsx('th', {
                                    className: `${N} px-3 py-2 text-center`,
                                    children: 'Atraso Ingreso'
                                  }),
                                  e.jsx('th', {
                                    className: `${N} px-3 py-2`,
                                    children: 'Despacho'
                                  }),
                                  e.jsx('th', {
                                    className: `${N} px-3 py-2 text-center`,
                                    children: 'Tiempo'
                                  })
                                ]
                              })
                            ]
                          }),
                          e.jsx('tbody', {
                            children: s.map((a, c) =>
                              e.jsxs(
                                'tr',
                                {
                                  className: 'border-t border-gray-100 hover:bg-orange-50/50',
                                  children: [
                                    e.jsx('td', {
                                      className: `${j} px-3 py-2 font-semibold`,
                                      style: { color: '#f57c00' },
                                      children: a.nv
                                    }),
                                    e.jsx('td', {
                                      className: `${j} px-3 py-2`,
                                      children: a.cliente
                                    }),
                                    e.jsx('td', {
                                      className: `${j} px-3 py-2`,
                                      children: a.vendedor
                                    }),
                                    e.jsx('td', {
                                      className: `${j} px-3 py-2`,
                                      children: a.transportista
                                    }),
                                    e.jsx('td', {
                                      className: `${j} px-3 py-2`,
                                      children:
                                        a.tipo_despacho ||
                                        e.jsx('span', { className: 'text-gray-300', children: '—' })
                                    }),
                                    e.jsx('td', {
                                      className: `${j} px-3 py-2`,
                                      children: a.division
                                    }),
                                    e.jsx('td', {
                                      className: `${j} px-3 py-2 text-center`,
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
                                      className: `${j} px-3 py-2`,
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
                                      className: `${w} px-3 py-2 whitespace-nowrap border-l border-l-blue-200/30`,
                                      children: k(a.fecha_registro_nv)
                                    }),
                                    e.jsx('td', {
                                      className: `${w} px-3 py-2 whitespace-nowrap`,
                                      children: k(a.fecha_aprobacion)
                                    }),
                                    e.jsx('td', {
                                      className: `${w} px-3 py-2 whitespace-nowrap`,
                                      children: k(a.fecha_aprobacion_real)
                                    }),
                                    e.jsx('td', {
                                      className: `${w} px-3 py-2 text-center`,
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
                                      className: `${N} px-3 py-2 whitespace-nowrap border-l border-l-amber-200/30`,
                                      children: k(a.fecha_compromiso)
                                    }),
                                    e.jsx('td', {
                                      className: `${N} px-3 py-2 whitespace-nowrap`,
                                      children:
                                        a.dias_atraso_ingreso > 0
                                          ? e.jsx('span', {
                                              className: 'font-medium text-red-600',
                                              children: k(a.fecha_promesa_efectiva)
                                            })
                                          : k(a.fecha_promesa_efectiva)
                                    }),
                                    e.jsx('td', {
                                      className: `${N} px-3 py-2 text-center`,
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
                                      className: `${N} px-3 py-2 whitespace-nowrap`,
                                      children: k(a.fecha_despacho)
                                    }),
                                    e.jsx('td', {
                                      className: `${N} px-3 py-2 text-center`,
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
                                c
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
const it = (t) => F(t, '—');
function dt({ open: t, data: s, loading: n, onClose: r }) {
  return (
    l.useEffect(() => {
      function a(c) {
        c.key === 'Escape' && r();
      }
      return (
        t && (document.addEventListener('keydown', a), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', a), (document.body.style.overflow = ''));
        }
      );
    }, [t, r]),
    t
      ? e.jsx('div', {
          className: 'fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4',
          onClick: r,
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
                    onClick: r,
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
                            children: s.map((a, c) =>
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
                                      children: it(a.fecha)
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
                                c
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
const ot = (t) => F(t, '—');
function xt(t) {
  return t > 0 ? 'bg-red-50' : t === 0 ? 'bg-orange-50' : 'bg-yellow-50';
}
function mt(t) {
  return t > 0
    ? { background: '#ffebee', color: '#c62828' }
    : t === 0
      ? { background: '#fff3e0', color: '#e65100' }
      : { background: '#fffde7', color: '#f9a825' };
}
function ht({ open: t, data: s, onClose: n }) {
  return (
    l.useEffect(() => {
      function r(a) {
        a.key === 'Escape' && n();
      }
      return (
        t && (document.addEventListener('keydown', r), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', r), (document.body.style.overflow = ''));
        }
      );
    }, [t, n]),
    t
      ? e.jsx('div', {
          className: 'fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4',
          onClick: n,
          children: e.jsxs('div', {
            className: 'bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[85vh] flex flex-col',
            onClick: (r) => r.stopPropagation(),
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
                            children: s.detalle.map((r, a) =>
                              e.jsxs(
                                'tr',
                                {
                                  className: `border-t border-gray-100 ${xt(r.diasVencido)}`,
                                  children: [
                                    e.jsx('td', {
                                      className: 'px-3 py-2 font-semibold',
                                      style: { color: '#f57c00' },
                                      children: r.nv
                                    }),
                                    e.jsx('td', { className: 'px-3 py-2', children: r.cliente }),
                                    e.jsx('td', { className: 'px-3 py-2', children: r.estado }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2 text-center',
                                      children: e.jsx('span', {
                                        className:
                                          'inline-block px-1.5 py-0.5 rounded text-xs font-bold',
                                        style: mt(r.diasVencido),
                                        children:
                                          r.diasVencido > 0
                                            ? `+${r.diasVencido}d`
                                            : r.diasVencido === 0
                                              ? 'HOY'
                                              : '1d'
                                      })
                                    }),
                                    e.jsx('td', { className: 'px-3 py-2', children: r.vendedor }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2',
                                      children: r.transportista
                                    }),
                                    e.jsx('td', { className: 'px-3 py-2', children: r.division }),
                                    e.jsx('td', {
                                      className: 'px-3 py-2 whitespace-nowrap',
                                      children: ot(r.fecha_compromiso)
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
function pt({ open: t, data: s, onClose: n }) {
  if (
    (l.useEffect(() => {
      function a(c) {
        c.key === 'Escape' && n();
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
  const r = Object.entries(s.porTipo).sort((a, c) => c[1] - a[1]);
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
            r.length > 0 &&
              e.jsx('div', {
                className: 'flex flex-wrap gap-2 mt-3',
                children: r.map(([a, c]) =>
                  e.jsxs(
                    'span',
                    {
                      className:
                        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200',
                      children: [a, e.jsx('span', { className: 'font-bold', children: c })]
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
                      children: s.detalle.map((a, c) =>
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
                                  children: a.problemas.map((h, o) =>
                                    e.jsx(
                                      'span',
                                      {
                                        className:
                                          'inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100',
                                        children: h
                                      },
                                      o
                                    )
                                  )
                                })
                              })
                            ]
                          },
                          c
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
function ft({ kpis: t, onSelect: s }) {
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
function ut(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function jt({
  end: t,
  duration: s = 1200,
  decimals: n = 0,
  prefix: r = '',
  suffix: a = '',
  className: c
}) {
  const [h, o] = l.useState('0'),
    x = l.useRef(0),
    p = l.useRef(0);
  return (
    l.useEffect(() => {
      const m = x.current,
        i = t - m;
      if (i === 0) return;
      const g = performance.now(),
        C = (S) => {
          const L = S - g,
            E = Math.min(L / s, 1),
            _ = m + i * ut(E);
          (o(_.toFixed(n)), E < 1 ? (p.current = requestAnimationFrame(C)) : (x.current = t));
        };
      return ((p.current = requestAnimationFrame(C)), () => cancelAnimationFrame(p.current));
    }, [t, s, n]),
    e.jsxs('span', { className: c, children: [r, h, a] })
  );
}
function bt({ children: t, glowColor: s = '245,124,0', className: n = '', onClick: r }) {
  const a = l.useRef(null),
    c = (h) => {
      const o = a.current;
      if (!o) return;
      const x = o.getBoundingClientRect();
      (o.style.setProperty('--mx', `${h.clientX - x.left}px`),
        o.style.setProperty('--my', `${h.clientY - x.top}px`));
    };
  return e.jsxs('div', {
    ref: a,
    onMouseMove: c,
    onClick: r,
    className: `bento-card ${n}`,
    style: { '--glow': s },
    children: [
      e.jsx('span', { className: 'bento-card-glow', 'aria-hidden': !0 }),
      e.jsx('div', { className: 'bento-card-content', children: t })
    ]
  });
}
function gt({ title: t, value: s, subtitle: n, color: r = '#f57c00', icon: a, onClick: c }) {
  const h = typeof s == 'number',
    o = typeof s == 'string' && /^\d+([.,]\d+)?%$/.test(s),
    x = h ? s : o ? parseFloat(s.replace(',', '.')) : null;
  return e.jsxs(bt, {
    glowColor: Be(r),
    onClick: c,
    className: `kpi-card${c ? ' cursor-pointer' : ''}`,
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
        style: { color: r },
        children: x !== null ? e.jsx(jt, { end: x, decimals: o ? 1 : 0, suffix: o ? '%' : '' }) : s
      }),
      n && e.jsx('div', { className: 'text-xs text-gray-400 mt-1', children: n })
    ]
  });
}
const O = l.memo(gt);
function yt({ kpis: t, onDetalle: s }) {
  return e.jsxs('div', {
    className: 'grid grid-cols-2 md:grid-cols-4 gap-3',
    children: [
      e.jsx(O, {
        title: 'NVs Activas',
        value: (t == null ? void 0 : t.activas) || 0,
        subtitle: 'Backlog en vivo · no depende del rango',
        color: '#1565c0',
        icon: '📦',
        onClick: () => s('ACTIVAS')
      }),
      e.jsx(O, {
        title: 'Tardanza Prom.',
        value: `${t == null ? void 0 : t.leadTimeTardanza} días`,
        subtitle: 'Solo entregas tardías',
        color: '#c62828',
        icon: '🕐',
        onClick: () => s('TARDIAS')
      }),
      e.jsx(O, {
        title: 'A Tiempo',
        value: `${t == null ? void 0 : t.pctAtiempo}%`,
        subtitle: 'Entregado ≤ compromiso',
        color: '#2e7d32',
        icon: '✅',
        onClick: () => s('ATIEMPO')
      }),
      e.jsx(O, {
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
function Nt({ calidadData: t, onOpen: s }) {
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
function vt({ tiemposCiclo: t }) {
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
                var r;
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
                              ((r = t.cuelloBotella) == null ? void 0 : r.nombre) === n.nombre
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
function wt({
  min: t = 0,
  max: s = 30,
  step: n = 1,
  value: r,
  onChange: a,
  label: c,
  suffix: h = '',
  color: o = '#f57c00'
}) {
  const x = l.useRef(null),
    [p, m] = l.useState(!1),
    [i, g] = l.useState(0),
    C = ((r - t) / (s - t)) * 100,
    S = l.useCallback(
      (v) => {
        const P = x.current;
        if (!P) return r;
        const I = P.getBoundingClientRect(),
          A = (v - I.left) / I.width,
          U = Math.max(0, Math.min(1, A));
        A < 0 ? g(Math.max(-1, A * 2)) : A > 1 ? g(Math.min(1, (A - 1) * 2)) : g(0);
        const B = t + U * (s - t),
          K = Math.round(B / n) * n;
        return Math.max(t, Math.min(s, K));
      },
      [t, s, n, r]
    ),
    L = (v) => {
      (m(!0), v.target.setPointerCapture(v.pointerId), a(S(v.clientX)));
    },
    E = (v) => {
      p && a(S(v.clientX));
    },
    _ = () => {
      (m(!1), g(0));
    };
  l.useEffect(() => {
    p || g(0);
  }, [p]);
  const z = i !== 0 ? `scaleX(${1 + Math.abs(i) * 0.04}) translateX(${i * 6}px)` : 'scaleX(1)';
  return e.jsxs('div', {
    className: 'select-none w-full',
    children: [
      c &&
        e.jsxs('div', {
          className: 'flex items-center justify-between mb-1.5',
          children: [
            e.jsx('span', { className: 'text-[12px] font-semibold text-gray-600', children: c }),
            e.jsxs('span', {
              className: 'text-[13px] font-bold tabular-nums',
              style: { color: o },
              children: [r, h]
            })
          ]
        }),
      e.jsxs('div', {
        ref: x,
        onPointerDown: L,
        onPointerMove: E,
        onPointerUp: _,
        className: 'relative h-6 flex items-center cursor-pointer touch-none',
        children: [
          e.jsx('div', { className: 'absolute left-0 right-0 h-1.5 rounded-full bg-gray-200' }),
          e.jsx('div', {
            className: 'absolute left-0 h-1.5 rounded-full origin-left',
            style: {
              width: `${C}%`,
              background: o,
              transform: z,
              transition: p
                ? 'none'
                : 'transform 0.5s cubic-bezier(0.16, 1.4, 0.3, 1), width 0.2s ease'
            }
          }),
          e.jsx('div', {
            className: 'absolute w-4 h-4 rounded-full bg-white shadow-md border-2 -translate-x-1/2',
            style: {
              left: `${C}%`,
              borderColor: o,
              transform: `translateX(-50%) scale(${p ? 1.25 : 1})`,
              transition: p ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1.4, 0.3, 1)'
            }
          })
        ]
      })
    ]
  });
}
function Ct({ alertasOp: t }) {
  const [s, n] = l.useState(1),
    r = l.useMemo(() => Math.max(1, ...t.map((c) => c.cantidad)), [t]),
    a = l.useMemo(() => t.filter((c) => c.cantidad >= s), [t, s]);
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
                children: e.jsx(wt, {
                  min: 1,
                  max: r,
                  value: Math.min(s, r),
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
                children: a.map((c) =>
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
                              children: c.estado
                            }),
                            e.jsx('span', {
                              className: 'text-[14px] font-bold text-red-600',
                              children: c.cantidad
                            })
                          ]
                        }),
                        e.jsxs('p', {
                          className: 'text-[10px] text-red-500 truncate',
                          children: [
                            'NVs: ',
                            c.nvs.join(', '),
                            c.cantidad > c.nvs.length ? ` (+${c.cantidad - c.nvs.length})` : ''
                          ]
                        })
                      ]
                    },
                    c.estado
                  )
                )
              })
        ]
      });
}
function At({ rankTransp: t, rankVend: s }) {
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
function Tt({ data: t = [], onOpenIncidencias: s }) {
  const n = t.reduce((a, c) => a + (c.total || 0), 0),
    r = t.reduce((a, c) => a + (c.fuera48h || 0), 0);
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
                  e.jsx('div', { className: 'mt-1 text-lg font-black text-red-700', children: r })
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
function kt({ auditKpis: t }) {
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
function St({ divisions: t }) {
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
function Et({ tendencia: t }) {
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
function $t(t, s) {
  if (!t) throw new Error('No se encontró el contenido del Dashboard para imprimir.');
  const n = window.open('', '_blank', 'noopener,noreferrer,width=1440,height=900');
  if (!n)
    throw new Error(
      'El navegador bloqueó la ventana de impresión. Habilita las ventanas emergentes.'
    );
  const r = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(
      (c) => c.outerHTML
    ).join(`
`),
    a = `${(s == null ? void 0 : s.from) || 'Inicio'} al ${(s == null ? void 0 : s.to) || 'Hoy'}`;
  return (
    n.document.open(),
    n.document.write(`<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Panel PTM - ${a}</title>
        ${r}
        <style>
          @page { size: A4 landscape; margin: 7mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { width: 100%; margin: 0; background: #f9fafb !important; }
          .dash-root { min-height: auto !important; background: #f9fafb !important; }
          .dash-root header { position: static !important; }
          [data-print-ignore="true"] { display: none !important; }
          .dash-root main { max-width: none !important; padding: 12px !important; }
          .dash-root .grid, .dash-root .table-container, .dash-root section { break-inside: avoid; page-break-inside: avoid; }
        </style>
      </head>
      <body>${t.outerHTML}</body>
    </html>`),
    n.document.close(),
    new Promise((c) => {
      let h = !1;
      const o = () => {
        h || ((h = !0), n.focus(), n.print(), c());
      };
      (n.addEventListener('load', () => setTimeout(o, 350), { once: !0 }),
        setTimeout(() => {
          n.document.readyState === 'complete' && o();
        }, 700));
    })
  );
}
const Z = '2026-01-01',
  ee = Ce();
function Ne() {
  return typeof window > 'u'
    ? { from: Z, to: ee }
    : {
        from: localStorage.getItem('panel_filter_from') || Z,
        to: localStorage.getItem('panel_filter_to') || ee
      };
}
function Ot() {
  const [t, s] = l.useState(null),
    [n, r] = l.useState([]),
    [a, c] = l.useState([]),
    [h, o] = l.useState([]),
    [x, p] = l.useState([]),
    [m, i] = l.useState([]),
    [g, C] = l.useState(null),
    [S, L] = l.useState([]),
    [E, _] = l.useState([]),
    [z, v] = l.useState([]),
    [P, I] = l.useState([]),
    [A, U] = l.useState([]),
    [B, K] = l.useState([]),
    [R, te] = l.useState(!0),
    [se, ae] = l.useState(null),
    [H, Te] = l.useState(''),
    [f, ke] = l.useState(Ne),
    ne = l.useRef(null),
    [re, le] = l.useState(null),
    [Se, ce] = l.useState([]),
    [Ee, ie] = l.useState(!1),
    [de, oe] = l.useState(!1),
    [$e, xe] = l.useState([]),
    [Le, me] = l.useState(!1),
    [he, _e] = l.useState(!1),
    [Re, De] = l.useState({ vencidos: 0, hoy: 0, manana: 0, total: 0, detalle: [] }),
    [pe, fe] = l.useState(!1),
    [ue, Ve] = l.useState({ total: 0, porTipo: {}, detalle: [] }),
    M = l.useCallback(
      async (d) => {
        (le(d), ie(!0));
        try {
          const b = await Ke(d, f.from, f.to);
          ce(b);
        } catch (b) {
          (console.error('Error cargando detalle:', b), ce([]));
        }
        ie(!1);
      },
      [f]
    ),
    Pe = l.useCallback(async () => {
      (oe(!0), me(!0));
      try {
        const d = await He(f.from, f.to);
        xe(d);
      } catch (d) {
        (console.error('Error cargando incidencias:', d), xe([]));
      }
      me(!1);
    }, [f]),
    y = l.useCallback(async (d, b) => {
      (te(!0), ae(null), ke({ from: d, to: b }));
      try {
        const u = await Ge(d, b);
        (s(u.kpis),
          r(u.estadoTable),
          c(u.divisions),
          o(u.weeklyTrend),
          p(u.estadoResumen),
          i(u.leadTimeSemanal),
          C(u.tiemposCiclo),
          L(u.rankingTransportistas),
          _(u.rankingVendedores),
          v(u.incidenciasPorVendedor || []),
          I(u.alertasOperacionales),
          De(u.alertas),
          Ve(u.calidad),
          Te(new Date().toLocaleString('es-CL')));
      } catch (u) {
        (console.error('Error loading data:', u),
          ae('Error al cargar los datos. Verifica tu conexión e intenta de nuevo.'));
      }
      te(!1);
    }, []),
    Ie = l.useCallback(() => {
      if (t)
        try {
          ($t(ne.current, f),
            ge.info(
              'En la ventana abierta, selecciona “Guardar como PDF” para descargar el Dashboard tal como se ve.'
            ));
        } catch (d) {
          (console.error('Error exportando PDF del panel:', d),
            ge.error(d.message || 'No se pudo preparar el PDF. Intenta nuevamente.'));
        }
    }, [t, f]);
  l.useEffect(() => {
    const d = Ne();
    (y(d.from, d.to),
      We()
        .then((b) => {
          b.operadores.length > 0 && U(b.operadores);
        })
        .catch(() => {}),
      Xe(6)
        .then((b) => K(b))
        .catch(() => {}));
  }, [y]);
  const D = l.useRef(f);
  (l.useEffect(() => {
    D.current = f;
  }, [f]),
    l.useEffect(() => {
      if (!G) return;
      let d = null;
      const b = () => {
          (typeof document < 'u' && document.hidden) ||
            (d && clearTimeout(d), (d = setTimeout(() => y(D.current.from, D.current.to), 2500)));
        },
        u = G.channel('tms-oper-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_operaciones' }, b)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tms_operaciones_sync' },
            b
          )
          .subscribe();
      return () => {
        (d && clearTimeout(d), G.removeChannel(u));
      };
    }, [y]));
  const [je, V] = l.useState(120),
    T = l.useRef(120);
  return (
    l.useEffect(() => {
      ((T.current = 120), V(120));
      const d = setInterval(() => {
        if (((T.current -= 1), V(T.current), T.current <= 0)) {
          if (((T.current = 120), V(120), typeof document < 'u' && document.hidden)) return;
          y(f.from, f.to);
        }
      }, 1e3);
      return () => clearInterval(d);
    }, [y, f]),
    l.useEffect(() => {
      const d = () => {
        typeof document < 'u' &&
          !document.hidden &&
          ((T.current = 120), V(120), y(D.current.from, D.current.to));
      };
      return (
        document.addEventListener('visibilitychange', d),
        () => document.removeEventListener('visibilitychange', d)
      );
    }, [y]),
    R && !t
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
      : se && !t
        ? e.jsx('div', {
            className: 'dash-root min-h-screen flex items-center justify-center bg-gray-50',
            children: e.jsxs('div', {
              className: 'text-center max-w-md',
              children: [
                e.jsx('p', {
                  className: 'text-red-600 text-lg font-semibold mb-2',
                  children: 'Error de carga'
                }),
                e.jsx('p', { className: 'text-gray-500 mb-4', children: se }),
                e.jsx('button', {
                  onClick: () => y(f.from, f.to),
                  className:
                    'px-5 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors',
                  children: 'Reintentar'
                })
              ]
            })
          })
        : e.jsxs('div', {
            ref: ne,
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
                        e.jsx(rt, { onFilter: y, defaultFrom: Z, defaultTo: ee }),
                        e.jsxs('button', {
                          onClick: Ie,
                          disabled: R || !t,
                          className:
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50',
                          title: 'Descargar informe PDF del período filtrado',
                          children: [
                            e.jsx('svg', {
                              className: 'w-3.5 h-3.5',
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
                            e.jsx('span', { children: 'Descargar PDF' })
                          ]
                        }),
                        e.jsxs('button', {
                          onClick: () => {
                            ((T.current = 120), V(120), y(f.from, f.to));
                          },
                          disabled: R,
                          className:
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-700 transition-colors disabled:opacity-50',
                          title: 'Actualizar ahora',
                          children: [
                            e.jsx('svg', {
                              className: `w-3.5 h-3.5 ${R ? 'animate-spin' : ''}`,
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
                              children: [Math.floor(je / 60), ':', String(je % 60).padStart(2, '0')]
                            })
                          ]
                        }),
                        H &&
                          e.jsx('span', {
                            className: 'text-[10px] text-gray-400 hidden sm:inline',
                            children: H
                          })
                      ]
                    })
                  ]
                })
              }),
              e.jsxs('main', {
                className: 'max-w-[1400px] mx-auto px-4 py-6 space-y-6',
                children: [
                  R &&
                    e.jsx('div', {
                      className: 'fixed top-0 left-0 w-full h-1 bg-orange-100 z-[100]',
                      children: e.jsx('div', {
                        className: 'h-full bg-orange-500 animate-pulse w-1/2'
                      })
                    }),
                  e.jsx(ft, { kpis: t, onSelect: M }),
                  e.jsx(yt, { kpis: t, onDetalle: M }),
                  e.jsx(Nt, { calidadData: ue, onOpen: () => fe(!0) }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
                    children: [
                      e.jsxs('div', {
                        className: 'space-y-4',
                        children: [
                          e.jsx(Je, { data: n, onSelectEstado: M }),
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
                                  children: x.map((d) =>
                                    e.jsxs(
                                      'tr',
                                      {
                                        onClick: () => M(d.estado),
                                        className: 'cursor-pointer hover:bg-orange-50',
                                        children: [
                                          e.jsx('td', {
                                            className: 'font-medium text-left',
                                            children: d.estado
                                          }),
                                          e.jsx('td', { className: 'font-bold', children: d.count })
                                        ]
                                      },
                                      d.estado
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
                        children: [e.jsx(Ze, { data: h }), e.jsx(at, { data: m })]
                      })
                    ]
                  }),
                  e.jsx(vt, { tiemposCiclo: g }),
                  e.jsx(Ct, { alertasOp: P }),
                  e.jsx(Tt, { data: z, onOpenIncidencias: Pe }),
                  e.jsx(At, { rankTransp: S, rankVend: E }),
                  e.jsx(kt, { auditKpis: A }),
                  e.jsx(St, { divisions: a }),
                  e.jsx(Et, { tendencia: B }),
                  e.jsxs('div', {
                    className: 'text-center text-xs text-gray-400 py-4',
                    children: ['Fecha de la última actualización: ', H]
                  })
                ]
              }),
              re && e.jsx(ct, { estado: re, data: Se, loading: Ee, onClose: () => le(null) }),
              de && e.jsx(dt, { open: de, data: $e, loading: Le, onClose: () => oe(!1) }),
              he && e.jsx(ht, { open: he, data: Re, onClose: () => _e(!1) }),
              pe && e.jsx(pt, { open: pe, data: ue, onClose: () => fe(!1) })
            ]
          })
  );
}
export { Ot as default };
