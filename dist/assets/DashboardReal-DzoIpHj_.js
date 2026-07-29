import { j as e } from './query-vendor-CojWQiBV.js';
import { r as l } from './react-vendor-CA7EHQ1X.js';
import {
  am as ye,
  ax as Ne,
  ao as W,
  ap as q,
  aq as Y,
  ar as J,
  as as Me,
  ay as Q,
  az as Fe,
  bF as je,
  aA as ze,
  aw as Ue
} from './ui-vendor-C7KFTQPV.js';
import {
  k as ve,
  l as Be,
  m as F,
  n as Ke,
  o as Ge,
  p as Xe,
  q as He,
  t as We,
  v as qe,
  s as X
} from './index-e6bbcg0S.js';
import './supabase-vendor-jY4wIOEF.js';
function Ye(s) {
  const t = s.toUpperCase();
  return t === 'ENTREGADO'
    ? 'badge badge-entregado'
    : t.includes('PROCESO') || t === 'EN SHIPPING'
      ? 'badge badge-proceso'
      : t.includes('RUTA')
        ? 'badge badge-ruta'
        : t.includes('VENDEDOR')
          ? 'badge badge-vendedor'
          : t.includes('RETIRO')
            ? 'badge badge-retiro'
            : t.includes('STOCK')
              ? 'badge badge-stock'
              : t === 'NULA' || t === 'NULL'
                ? 'badge badge-nula'
                : 'badge badge-default';
}
function Je({ data: s, onSelectEstado: t }) {
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
          children: s.map((n, r) =>
            e.jsxs(
              'tr',
              {
                onClick: () => (t == null ? void 0 : t(n.estado)),
                className: t ? 'cursor-pointer hover:bg-orange-50' : '',
                children: [
                  e.jsxs('td', { className: 'text-gray-400 text-xs', children: [r + 1, '.'] }),
                  e.jsx('td', {
                    className: 'text-left',
                    children: e.jsx('span', { className: Ye(n.estado), children: n.estado })
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
const Qe = l.memo(Je);
function Ze({ data: s }) {
  return e.jsxs('div', {
    className: 'bg-white rounded-xl p-4 shadow-sm',
    children: [
      e.jsx('h3', {
        className: 'text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide',
        children: 'Tendencia Semanal'
      }),
      e.jsx(ye, {
        width: '100%',
        height: 300,
        children: e.jsxs(Ne, {
          data: s,
          children: [
            e.jsx(W, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
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
const es = l.memo(Ze),
  H = {
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
function ss(s) {
  return s > 3 ? '#c62828' : s > 1 ? '#f57c00' : '#2e7d32';
}
function ts(s) {
  return s >= 80 ? '#2e7d32' : s >= 50 ? '#f57c00' : '#c62828';
}
function as({ data: s }) {
  const [t, n] = l.useState('barras'),
    [r, a] = l.useState('dias'),
    c = H[r],
    x = {
      contentStyle: { borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      formatter: (d, h, m) => {
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
                children: Object.keys(H).map((d) =>
                  e.jsx(
                    'button',
                    {
                      onClick: () => a(d),
                      className: `px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${r === d ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`,
                      children: H[d].label
                    },
                    d
                  )
                )
              }),
              e.jsxs('div', {
                className: 'flex rounded-lg bg-gray-100 p-0.5',
                children: [
                  e.jsx('button', {
                    onClick: () => n('barras'),
                    title: 'Barras',
                    className: `px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${t === 'barras' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`,
                    children: '▮ Barras'
                  }),
                  e.jsx('button', {
                    onClick: () => n('linea'),
                    title: 'Tendencia',
                    className: `px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${t === 'linea' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`,
                    children: '╱ Tendencia'
                  })
                ]
              })
            ]
          })
        ]
      }),
      e.jsx(ye, {
        width: '100%',
        height: 200,
        children:
          t === 'barras'
            ? e.jsxs(Fe, {
                data: s,
                children: [
                  e.jsx(W, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
                  e.jsx(q, {
                    dataKey: 'semana',
                    tick: { fontSize: 9 },
                    interval: 'preserveStartEnd'
                  }),
                  e.jsx(Y, {
                    tick: { fontSize: 10 },
                    domain: r === 'pctAtiempo' ? [0, 100] : void 0
                  }),
                  e.jsx(J, { ...x }),
                  e.jsx(je, { y: 0, stroke: '#ccc' }),
                  e.jsx(ze, {
                    dataKey: r,
                    radius: [4, 4, 0, 0],
                    children: s.map((d, h) =>
                      e.jsx(Ue, { fill: r === 'dias' ? ss(d.dias) : ts(d.pctAtiempo) }, h)
                    )
                  })
                ]
              })
            : e.jsxs(Ne, {
                data: s,
                children: [
                  e.jsx(W, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
                  e.jsx(q, {
                    dataKey: 'semana',
                    tick: { fontSize: 9 },
                    interval: 'preserveStartEnd'
                  }),
                  e.jsx(Y, {
                    tick: { fontSize: 10 },
                    domain: r === 'pctAtiempo' ? [0, 100] : void 0
                  }),
                  e.jsx(J, { ...x }),
                  e.jsx(je, { y: 0, stroke: '#ccc' }),
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
const ns = l.memo(as);
function be(s, t) {
  return typeof window > 'u' ? t : localStorage.getItem(s) || t;
}
function rs(s, t) {
  (localStorage.setItem('panel_filter_from', s), localStorage.setItem('panel_filter_to', t));
}
function ls({ onFilter: s, defaultFrom: t, defaultTo: n }) {
  const [r, a] = l.useState(() => be('panel_filter_from', t)),
    [c, f] = l.useState(() => be('panel_filter_to', n));
  function x(m, i) {
    (a(m), f(i), rs(m, i), s(m, i));
  }
  const d = [
    { label: 'Última semana', days: 7 },
    { label: 'Último mes', days: 30 },
    { label: 'Últimos 3 meses', days: 90 },
    { label: 'Año completo', days: 365 }
  ];
  function h(m) {
    const i = ve();
    x(Be(i, -m), i);
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
            onChange: (m) => f(m.target.value),
            className:
              'px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400'
          }),
          e.jsx('button', {
            onClick: () => x(r, c),
            className:
              'px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition',
            children: 'Filtrar'
          })
        ]
      }),
      e.jsx('div', {
        className: 'flex gap-1',
        children: d.map((m) =>
          e.jsx(
            'button',
            {
              onClick: () => h(m.days),
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
const we = {
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
  S = (s) => F(s, '—'),
  E = (s) => F(s, '');
function cs(s, t) {
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
    a = t.map((i) =>
      [
        i.nv,
        i.cliente,
        i.vendedor,
        i.transportista,
        i.tipo_despacho || '',
        i.division,
        i.reabierta ? 'SI' : 'NO',
        i.motivo_reapertura || '',
        E(i.fecha_registro_nv),
        E(i.fecha_aprobacion),
        E(i.fecha_aprobacion_real),
        i.dif_aprobacion === null ? '' : i.dif_aprobacion,
        E(i.fecha_compromiso),
        E(i.fecha_promesa_efectiva),
        i.dias_atraso_ingreso > 0 ? i.dias_atraso_ingreso : '',
        E(i.fecha_despacho),
        i.dias_entrega === null ? '' : i.dias_entrega
      ]
        .map(r)
        .join(';')
    ),
    c =
      '\uFEFF' +
      [n.join(';'), ...a].join(`\r
`),
    f = new Blob([c], { type: 'text/csv;charset=utf-8;' }),
    x = URL.createObjectURL(f),
    d = document.createElement('a'),
    h = (we[s] || s).replace(/[^\wáéíóúñ]+/gi, '_').replace(/^_+|_+$/g, ''),
    m = new Date().toISOString().slice(0, 10);
  ((d.href = x), (d.download = `NVs_${h}_${m}.csv`), d.click(), URL.revokeObjectURL(x));
}
const u = 'bg-white',
  w = 'bg-blue-50/60',
  N = 'bg-amber-50/60';
function is({ estado: s, data: t, loading: n, onClose: r }) {
  return (
    l.useEffect(() => {
      function a(c) {
        c.key === 'Escape' && r();
      }
      return (
        s && (document.addEventListener('keydown', a), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', a), (document.body.style.overflow = ''));
        }
      );
    }, [s, r]),
    s
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
                          we[s] ||
                          e.jsxs(e.Fragment, {
                            children: [
                              'Notas de Venta — ',
                              e.jsx('span', { style: { color: '#f57c00' }, children: s })
                            ]
                          })
                      }),
                      e.jsx('p', {
                        className: 'text-xs text-gray-400',
                        children: n ? 'Cargando...' : `${t.length} registro(s)`
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
                        t.length > 0 &&
                        e.jsxs('button', {
                          onClick: () => cs(s, t),
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
                  : t.length === 0
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
                                    className: `${u} px-3 py-1 text-[10px] font-semibold text-gray-400 text-left border-b border-gray-100`,
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
                                  e.jsx('th', { className: `${u} px-3 py-2`, children: 'N.V' }),
                                  e.jsx('th', { className: `${u} px-3 py-2`, children: 'Cliente' }),
                                  e.jsx('th', {
                                    className: `${u} px-3 py-2`,
                                    children: 'Vendedor'
                                  }),
                                  e.jsx('th', {
                                    className: `${u} px-3 py-2`,
                                    children: 'Transportista'
                                  }),
                                  e.jsx('th', {
                                    className: `${u} px-3 py-2`,
                                    children: 'Tipo Desp.'
                                  }),
                                  e.jsx('th', {
                                    className: `${u} px-3 py-2`,
                                    children: 'División'
                                  }),
                                  e.jsx('th', {
                                    className: `${u} px-3 py-2 text-center`,
                                    children: 'Reab.'
                                  }),
                                  e.jsx('th', { className: `${u} px-3 py-2`, children: 'Motivo' }),
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
                            children: t.map((a, c) =>
                              e.jsxs(
                                'tr',
                                {
                                  className: 'border-t border-gray-100 hover:bg-orange-50/50',
                                  children: [
                                    e.jsx('td', {
                                      className: `${u} px-3 py-2 font-semibold`,
                                      style: { color: '#f57c00' },
                                      children: a.nv
                                    }),
                                    e.jsx('td', {
                                      className: `${u} px-3 py-2`,
                                      children: a.cliente
                                    }),
                                    e.jsx('td', {
                                      className: `${u} px-3 py-2`,
                                      children: a.vendedor
                                    }),
                                    e.jsx('td', {
                                      className: `${u} px-3 py-2`,
                                      children: a.transportista
                                    }),
                                    e.jsx('td', {
                                      className: `${u} px-3 py-2`,
                                      children:
                                        a.tipo_despacho ||
                                        e.jsx('span', { className: 'text-gray-300', children: '—' })
                                    }),
                                    e.jsx('td', {
                                      className: `${u} px-3 py-2`,
                                      children: a.division
                                    }),
                                    e.jsx('td', {
                                      className: `${u} px-3 py-2 text-center`,
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
                                      className: `${u} px-3 py-2`,
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
                                      children: S(a.fecha_registro_nv)
                                    }),
                                    e.jsx('td', {
                                      className: `${w} px-3 py-2 whitespace-nowrap`,
                                      children: S(a.fecha_aprobacion)
                                    }),
                                    e.jsx('td', {
                                      className: `${w} px-3 py-2 whitespace-nowrap`,
                                      children: S(a.fecha_aprobacion_real)
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
                                      children: S(a.fecha_compromiso)
                                    }),
                                    e.jsx('td', {
                                      className: `${N} px-3 py-2 whitespace-nowrap`,
                                      children:
                                        a.dias_atraso_ingreso > 0
                                          ? e.jsx('span', {
                                              className: 'font-medium text-red-600',
                                              children: S(a.fecha_promesa_efectiva)
                                            })
                                          : S(a.fecha_promesa_efectiva)
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
                                      children: S(a.fecha_despacho)
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
const ds = (s) => F(s, '—');
function os({ open: s, data: t, loading: n, onClose: r }) {
  return (
    l.useEffect(() => {
      function a(c) {
        c.key === 'Escape' && r();
      }
      return (
        s && (document.addEventListener('keydown', a), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', a), (document.body.style.overflow = ''));
        }
      );
    }, [s, r]),
    s
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
                        children: n ? 'Cargando...' : `${t.length} incidencia(s) no resuelta(s)`
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
                  : t.length === 0
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
                            children: t.map((a, c) =>
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
                                      children: ds(a.fecha)
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
const xs = (s) => F(s, '—');
function ms(s) {
  return s > 0 ? 'bg-red-50' : s === 0 ? 'bg-orange-50' : 'bg-yellow-50';
}
function hs(s) {
  return s > 0
    ? { background: '#ffebee', color: '#c62828' }
    : s === 0
      ? { background: '#fff3e0', color: '#e65100' }
      : { background: '#fffde7', color: '#f9a825' };
}
function ps({ open: s, data: t, onClose: n }) {
  return (
    l.useEffect(() => {
      function r(a) {
        a.key === 'Escape' && n();
      }
      return (
        s && (document.addEventListener('keydown', r), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', r), (document.body.style.overflow = ''));
        }
      );
    }, [s, n]),
    s
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
                          t.vencidos > 0 &&
                            e.jsxs('span', {
                              className: 'inline-block px-2 py-0.5 rounded text-xs font-bold',
                              style: { background: '#ffebee', color: '#c62828' },
                              children: [t.vencidos, ' vencido', t.vencidos !== 1 ? 's' : '']
                            }),
                          t.hoy > 0 &&
                            e.jsxs('span', {
                              className: 'inline-block px-2 py-0.5 rounded text-xs font-bold',
                              style: { background: '#fff3e0', color: '#e65100' },
                              children: [t.hoy, ' vence hoy']
                            }),
                          t.manana > 0 &&
                            e.jsxs('span', {
                              className: 'inline-block px-2 py-0.5 rounded text-xs font-bold',
                              style: { background: '#fffde7', color: '#f9a825' },
                              children: [t.manana, ' vence mañana']
                            }),
                          t.total === 0 &&
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
                  t.detalle.length === 0
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
                            children: t.detalle.map((r, a) =>
                              e.jsxs(
                                'tr',
                                {
                                  className: `border-t border-gray-100 ${ms(r.diasVencido)}`,
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
                                        style: hs(r.diasVencido),
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
                                      children: xs(r.fecha_compromiso)
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
function fs({ open: s, data: t, onClose: n }) {
  if (
    (l.useEffect(() => {
      function a(c) {
        c.key === 'Escape' && n();
      }
      return (
        s && (document.addEventListener('keydown', a), (document.body.style.overflow = 'hidden')),
        () => {
          (document.removeEventListener('keydown', a), (document.body.style.overflow = ''));
        }
      );
    }, [s, n]),
    !s)
  )
    return null;
  const r = Object.entries(t.porTipo).sort((a, c) => c[1] - a[1]);
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
                      children: [t.total, ' registro(s) con datos incompletos o incoherentes']
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
            t.detalle.length === 0
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
                      children: t.detalle.map((a, c) =>
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
                                  children: a.problemas.map((f, x) =>
                                    e.jsx(
                                      'span',
                                      {
                                        className:
                                          'inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100',
                                        children: f
                                      },
                                      x
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
function us({ kpis: s, onSelect: t }) {
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
            onClick: () => t('CANAL:PTM'),
            children: [
              e.jsx('div', { className: 'text-xs text-gray-400', children: 'N° NV PTM' }),
              e.jsx('div', {
                className: 'text-2xl font-bold',
                style: { color: '#f57c00' },
                children: s == null ? void 0 : s.countNvPtm.toLocaleString('es-CL')
              })
            ]
          }),
          e.jsxs('div', {
            className: 'cursor-pointer hover:opacity-70 transition-opacity',
            onClick: () => t('CANAL:ORANGE'),
            children: [
              e.jsx('div', { className: 'text-xs text-gray-400', children: 'N.V Orange' }),
              e.jsx('div', {
                className: 'text-2xl font-bold text-gray-800',
                children: s == null ? void 0 : s.nvOrange.toLocaleString('es-CL')
              })
            ]
          }),
          e.jsxs('div', {
            className: 'cursor-pointer hover:opacity-70 transition-opacity',
            onClick: () => t('CANAL:FARMAPACK'),
            children: [
              e.jsx('div', { className: 'text-xs text-gray-400', children: 'N.V Farmapack' }),
              e.jsx('div', {
                className: 'text-2xl font-bold text-gray-800',
                children: s == null ? void 0 : s.nvFarmapack.toLocaleString('es-CL')
              })
            ]
          }),
          e.jsxs('div', {
            className: 'cursor-pointer hover:opacity-70 transition-opacity',
            onClick: () => t('CANAL:VARIOS'),
            children: [
              e.jsx('div', { className: 'text-xs text-gray-400', children: 'Varios' }),
              e.jsx('div', {
                className: 'text-2xl font-bold text-gray-800',
                children: s == null ? void 0 : s.nvVarios.toLocaleString('es-CL')
              })
            ]
          })
        ]
      })
    ]
  });
}
function js(s) {
  return s === 1 ? 1 : 1 - Math.pow(2, -10 * s);
}
function bs({
  end: s,
  duration: t = 1200,
  decimals: n = 0,
  prefix: r = '',
  suffix: a = '',
  className: c
}) {
  const [f, x] = l.useState('0'),
    d = l.useRef(0),
    h = l.useRef(0);
  return (
    l.useEffect(() => {
      const m = d.current,
        i = s - m;
      if (i === 0) return;
      const g = performance.now(),
        A = (k) => {
          const $ = k - g,
            _ = Math.min($ / t, 1),
            L = m + i * js(_);
          (x(L.toFixed(n)), _ < 1 ? (h.current = requestAnimationFrame(A)) : (d.current = s));
        };
      return ((h.current = requestAnimationFrame(A)), () => cancelAnimationFrame(h.current));
    }, [s, t, n]),
    e.jsxs('span', { className: c, children: [r, f, a] })
  );
}
function gs({ children: s, glowColor: t = '245,124,0', className: n = '', onClick: r }) {
  const a = l.useRef(null),
    c = (f) => {
      const x = a.current;
      if (!x) return;
      const d = x.getBoundingClientRect();
      (x.style.setProperty('--mx', `${f.clientX - d.left}px`),
        x.style.setProperty('--my', `${f.clientY - d.top}px`));
    };
  return e.jsxs('div', {
    ref: a,
    onMouseMove: c,
    onClick: r,
    className: `bento-card ${n}`,
    style: { '--glow': t },
    children: [
      e.jsx('span', { className: 'bento-card-glow', 'aria-hidden': !0 }),
      e.jsx('div', { className: 'bento-card-content', children: s })
    ]
  });
}
function ys({ title: s, value: t, subtitle: n, color: r = '#f57c00', icon: a, onClick: c }) {
  const f = typeof t == 'number',
    x = typeof t == 'string' && /^\d+([.,]\d+)?%$/.test(t),
    d = f ? t : x ? parseFloat(t.replace(',', '.')) : null;
  return e.jsxs(gs, {
    glowColor: Ke(r),
    onClick: c,
    className: `kpi-card${c ? ' cursor-pointer' : ''}`,
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between mb-2',
        children: [
          e.jsx('span', {
            className: 'text-xs font-semibold uppercase tracking-wide text-gray-500',
            children: s
          }),
          a && e.jsx('span', { className: 'text-xl', children: a })
        ]
      }),
      e.jsx('div', {
        className: 'text-3xl font-bold',
        style: { color: r },
        children: d !== null ? e.jsx(bs, { end: d, decimals: x ? 1 : 0, suffix: x ? '%' : '' }) : t
      }),
      n && e.jsx('div', { className: 'text-xs text-gray-400 mt-1', children: n })
    ]
  });
}
const M = l.memo(ys);
function Ns({ kpis: s, onDetalle: t }) {
  return e.jsxs('div', {
    className: 'grid grid-cols-2 md:grid-cols-4 gap-3',
    children: [
      e.jsx(M, {
        title: 'NVs Activas',
        value: (s == null ? void 0 : s.activas) || 0,
        subtitle: 'Backlog en vivo · no depende del rango',
        color: '#1565c0',
        icon: '📦',
        onClick: () => t('ACTIVAS')
      }),
      e.jsx(M, {
        title: 'Tardanza Prom.',
        value: `${s == null ? void 0 : s.leadTimeTardanza} días`,
        subtitle: 'Solo entregas tardías',
        color: '#c62828',
        icon: '🕐',
        onClick: () => t('TARDIAS')
      }),
      e.jsx(M, {
        title: 'A Tiempo',
        value: `${s == null ? void 0 : s.pctAtiempo}%`,
        subtitle: 'Entregado ≤ compromiso',
        color: '#2e7d32',
        icon: '✅',
        onClick: () => t('ATIEMPO')
      }),
      e.jsx(M, {
        title: 'Fill Rate',
        value:
          (s == null ? void 0 : s.fillRateShipping.pct) !== null &&
          (s == null ? void 0 : s.fillRateShipping.pct) !== void 0
            ? `${s.fillRateShipping.pct}%`
            : 'Sin datos',
        subtitle:
          (s == null ? void 0 : s.fillRateShipping.pct) !== null &&
          (s == null ? void 0 : s.fillRateShipping.pct) !== void 0
            ? `Salió de En Proceso ≤ compromiso (${s.fillRateShipping.evaluables} eval.)`
            : 'Sin datos suficientes',
        color: '#f57c00',
        icon: '📋',
        onClick: () => t('FILLRATE_NOCUMPLE')
      })
    ]
  });
}
function vs({ calidadData: s, onOpen: t }) {
  return s.total > 0
    ? e.jsxs('button', {
        onClick: t,
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
                      s.total,
                      ' registro',
                      s.total !== 1 ? 's' : '',
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
function ws({ tiemposCiclo: s }) {
  return s
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
                    children: s.leadTimeTotal !== null ? `${s.leadTimeTotal} d` : '—'
                  }),
                  e.jsxs('p', {
                    className: 'text-[10px] text-gray-400',
                    children: ['Aprobación → entrega · n=', s.leadTimeTotalN]
                  })
                ]
              }),
              s.etapas.map((t) =>
                e.jsxs(
                  'div',
                  {
                    className: 'rounded-xl border border-gray-200 p-3.5',
                    children: [
                      e.jsx('p', {
                        className:
                          'text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate',
                        children: t.nombre
                      }),
                      e.jsx('p', {
                        className: 'mt-1 text-2xl font-bold text-gray-800',
                        children: t.dias !== null ? `${t.dias} d` : '—'
                      }),
                      e.jsxs('p', { className: 'text-[10px] text-gray-400', children: ['n=', t.n] })
                    ]
                  },
                  t.nombre
                )
              )
            ]
          }),
          s.cuelloBotella &&
            e.jsxs('div', {
              className:
                'mb-4 inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-[12px] text-red-700',
              children: [
                e.jsx('span', { children: '🚨 Cuello de botella:' }),
                e.jsx('strong', { children: s.cuelloBotella.nombre }),
                e.jsxs('span', { children: ['(', s.cuelloBotella.dias, ' d)'] })
              ]
            }),
          e.jsx('div', {
            className: 'space-y-2.5',
            children: (() => {
              const t = Math.max(1, ...s.etapas.map((n) => n.dias ?? 0));
              return s.etapas.map((n) => {
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
                            width: n.dias !== null ? `${Math.max(6, (n.dias / t) * 100)}%` : '0%',
                            background:
                              ((r = s.cuelloBotella) == null ? void 0 : r.nombre) === n.nombre
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
function As({
  min: s = 0,
  max: t = 30,
  step: n = 1,
  value: r,
  onChange: a,
  label: c,
  suffix: f = '',
  color: x = '#f57c00'
}) {
  const d = l.useRef(null),
    [h, m] = l.useState(!1),
    [i, g] = l.useState(0),
    A = ((r - s) / (t - s)) * 100,
    k = l.useCallback(
      (v) => {
        const D = d.current;
        if (!D) return r;
        const I = D.getBoundingClientRect(),
          C = (v - I.left) / I.width,
          U = Math.max(0, Math.min(1, C));
        C < 0 ? g(Math.max(-1, C * 2)) : C > 1 ? g(Math.min(1, (C - 1) * 2)) : g(0);
        const B = s + U * (t - s),
          K = Math.round(B / n) * n;
        return Math.max(s, Math.min(t, K));
      },
      [s, t, n, r]
    ),
    $ = (v) => {
      (m(!0), v.target.setPointerCapture(v.pointerId), a(k(v.clientX)));
    },
    _ = (v) => {
      h && a(k(v.clientX));
    },
    L = () => {
      (m(!1), g(0));
    };
  l.useEffect(() => {
    h || g(0);
  }, [h]);
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
              style: { color: x },
              children: [r, f]
            })
          ]
        }),
      e.jsxs('div', {
        ref: d,
        onPointerDown: $,
        onPointerMove: _,
        onPointerUp: L,
        className: 'relative h-6 flex items-center cursor-pointer touch-none',
        children: [
          e.jsx('div', { className: 'absolute left-0 right-0 h-1.5 rounded-full bg-gray-200' }),
          e.jsx('div', {
            className: 'absolute left-0 h-1.5 rounded-full origin-left',
            style: {
              width: `${A}%`,
              background: x,
              transform: z,
              transition: h
                ? 'none'
                : 'transform 0.5s cubic-bezier(0.16, 1.4, 0.3, 1), width 0.2s ease'
            }
          }),
          e.jsx('div', {
            className: 'absolute w-4 h-4 rounded-full bg-white shadow-md border-2 -translate-x-1/2',
            style: {
              left: `${A}%`,
              borderColor: x,
              transform: `translateX(-50%) scale(${h ? 1.25 : 1})`,
              transition: h ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1.4, 0.3, 1)'
            }
          })
        ]
      })
    ]
  });
}
function Cs({ alertasOp: s }) {
  const [t, n] = l.useState(1),
    r = l.useMemo(() => Math.max(1, ...s.map((c) => c.cantidad)), [s]),
    a = l.useMemo(() => s.filter((c) => c.cantidad >= t), [s, t]);
  return s.length === 0
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
                children: e.jsx(As, {
                  min: 1,
                  max: r,
                  value: Math.min(t, r),
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
                children: ['Ningún estado supera el umbral de ', t, ' NV', t !== 1 ? 's' : '', '.']
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
function Ts({ rankTransp: s, rankVend: t }) {
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
function Ss({ data: s = [], onOpenIncidencias: t }) {
  const n = s.reduce((a, c) => a + (c.total || 0), 0),
    r = s.reduce((a, c) => a + (c.fuera48h || 0), 0);
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
                onClick: t,
                className:
                  'rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-bold hover:bg-slate-800 transition-colors',
                children: 'Ver incidencias activas'
              })
            ]
          })
        ]
      }),
      s.length === 0
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
                  children: s.map((a) =>
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
function ks({ auditKpis: s }) {
  return s.length === 0
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
                children: s
                  .filter((t) => t.nombre.toUpperCase() !== 'ADMIN')
                  .map((t) =>
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
                                  children: t.nombre.charAt(0).toUpperCase()
                                }),
                                t.nombre
                              ]
                            })
                          }),
                          e.jsx('td', {
                            children: e.jsx('span', {
                              className: 'text-green-600 font-semibold',
                              children: t.creates
                            })
                          }),
                          e.jsx('td', {
                            children: e.jsx('span', {
                              className: 'text-blue-600 font-semibold',
                              children: t.updates
                            })
                          }),
                          e.jsx('td', {
                            children: e.jsx('span', {
                              className: 'text-purple-600 font-semibold',
                              children: t.bulkUpdates
                            })
                          }),
                          e.jsx('td', {
                            children:
                              t.conflicts > 0
                                ? e.jsx('span', {
                                    className: 'text-red-600 font-semibold',
                                    children: t.conflicts
                                  })
                                : e.jsx('span', { className: 'text-gray-300', children: '0' })
                          }),
                          e.jsx('td', {
                            children: e.jsx('span', {
                              className: 'font-bold',
                              style: { color: '#f57c00' },
                              children: t.total
                            })
                          })
                        ]
                      },
                      t.nombre
                    )
                  )
              })
            ]
          })
        ]
      });
}
function Es({ divisions: s }) {
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
              children: s.map((t) =>
                e.jsxs(
                  'tr',
                  {
                    children: [
                      e.jsx('td', { className: 'font-medium text-left', children: t.division }),
                      e.jsx('td', {
                        children: e.jsx('span', {
                          className: 'font-bold',
                          style: { color: '#f57c00' },
                          children: t.cantidad.toLocaleString('es-CL')
                        })
                      })
                    ]
                  },
                  t.division
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
function $s({ tendencia: s }) {
  return s.length === 0
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
              s.map((t) =>
                e.jsxs(
                  'div',
                  {
                    className: 'flex items-center gap-3',
                    children: [
                      e.jsx('span', {
                        className: 'w-20 shrink-0 text-[12px] text-gray-600 text-right font-medium',
                        children: t.label
                      }),
                      e.jsxs('div', {
                        className: 'flex-1 flex gap-1',
                        children: [
                          e.jsx('div', {
                            className: 'flex-1 h-5 bg-gray-100 rounded overflow-hidden',
                            title: `OTIF: ${t.otif ?? '—'}%`,
                            children: e.jsx('div', {
                              className:
                                'h-full rounded flex items-center justify-end pr-1.5 text-[10px] font-semibold text-white transition-all',
                              style: {
                                width: `${Math.max(4, t.otif ?? 0)}%`,
                                background: '#0d47a1'
                              },
                              children: t.otif != null ? `${t.otif}%` : ''
                            })
                          }),
                          e.jsx('div', {
                            className: 'flex-1 h-5 bg-gray-100 rounded overflow-hidden',
                            title: `A Tiempo: ${t.pctATiempo ?? '—'}%`,
                            children: e.jsx('div', {
                              className:
                                'h-full rounded flex items-center justify-end pr-1.5 text-[10px] font-semibold text-white transition-all',
                              style: {
                                width: `${Math.max(4, t.pctATiempo ?? 0)}%`,
                                background: '#2e7d32'
                              },
                              children: t.pctATiempo != null ? `${t.pctATiempo}%` : ''
                            })
                          })
                        ]
                      })
                    ]
                  },
                  t.label
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
                children: s.map((t) =>
                  e.jsxs(
                    'tr',
                    {
                      children: [
                        e.jsx('td', { className: 'font-medium text-left', children: t.label }),
                        e.jsx('td', {
                          children: e.jsx('span', {
                            className: 'font-bold',
                            style: { color: '#f57c00' },
                            children: t.entregadas
                          })
                        }),
                        e.jsx('td', {
                          children:
                            t.otif != null
                              ? e.jsxs('span', {
                                  className: `font-semibold ${t.otif >= 80 ? 'text-green-600' : t.otif >= 50 ? 'text-amber-600' : 'text-red-600'}`,
                                  children: [t.otif, '%']
                                })
                              : e.jsx('span', { className: 'text-gray-300', children: '—' })
                        }),
                        e.jsx('td', {
                          children:
                            t.pctATiempo != null
                              ? e.jsxs('span', {
                                  className: `font-semibold ${t.pctATiempo >= 80 ? 'text-green-600' : t.pctATiempo >= 50 ? 'text-amber-600' : 'text-red-600'}`,
                                  children: [t.pctATiempo, '%']
                                })
                              : e.jsx('span', { className: 'text-gray-300', children: '—' })
                        }),
                        e.jsx('td', {
                          children:
                            t.leadTime != null
                              ? e.jsxs('span', {
                                  className: 'font-semibold text-gray-700',
                                  children: [t.leadTime, 'd']
                                })
                              : e.jsx('span', { className: 'text-gray-300', children: '—' })
                        })
                      ]
                    },
                    t.label
                  )
                )
              })
            ]
          })
        ]
      });
}
const Z = '2026-01-01',
  ee = ve();
function ge() {
  return typeof window > 'u'
    ? { from: Z, to: ee }
    : {
        from: localStorage.getItem('panel_filter_from') || Z,
        to: localStorage.getItem('panel_filter_to') || ee
      };
}
function Is() {
  const [s, t] = l.useState(null),
    [n, r] = l.useState([]),
    [a, c] = l.useState([]),
    [f, x] = l.useState([]),
    [d, h] = l.useState([]),
    [m, i] = l.useState([]),
    [g, A] = l.useState([]),
    [k, $] = l.useState(null),
    [_, L] = l.useState(null),
    [z, v] = l.useState([]),
    [D, I] = l.useState([]),
    [C, U] = l.useState([]),
    [B, K] = l.useState([]),
    [Ae, Ce] = l.useState([]),
    [Te, Se] = l.useState([]),
    [O, se] = l.useState(!0),
    [te, ae] = l.useState(null),
    [G, ke] = l.useState(''),
    [j, Ee] = l.useState(ge),
    [ne, re] = l.useState(null),
    [$e, le] = l.useState([]),
    [_e, ce] = l.useState(!1),
    [ie, de] = l.useState(!1),
    [Le, oe] = l.useState([]),
    [Re, xe] = l.useState(!1),
    [me, Ve] = l.useState(!1),
    [De, Ie] = l.useState({ vencidos: 0, hoy: 0, manana: 0, total: 0, detalle: [] }),
    [he, pe] = l.useState(!1),
    [fe, Oe] = l.useState({ total: 0, porTipo: {}, detalle: [] }),
    P = l.useCallback(
      async (o) => {
        (re(o), ce(!0));
        try {
          const b = await Ge(o, j.from, j.to);
          le(b);
        } catch (b) {
          (console.error('Error cargando detalle:', b), le([]));
        }
        ce(!1);
      },
      [j]
    ),
    Pe = l.useCallback(async () => {
      (de(!0), xe(!0));
      try {
        const o = await Xe(j.from, j.to);
        oe(o);
      } catch (o) {
        (console.error('Error cargando incidencias:', o), oe([]));
      }
      xe(!1);
    }, [j]),
    y = l.useCallback(async (o, b) => {
      (se(!0), ae(null), Ee({ from: o, to: b }));
      try {
        const p = await He(o, b);
        (t(p.kpis),
          r(p.estadoTable),
          c(p.divisions),
          x(p.transportistas),
          h(p.weeklyTrend),
          i(p.estadoResumen),
          A(p.leadTimeSemanal),
          $(p.tiemposCiclo),
          L(p.otif),
          v(p.rankingTransportistas),
          I(p.rankingVendedores),
          U(p.incidenciasPorVendedor || []),
          K(p.alertasOperacionales),
          Ie(p.alertas),
          Oe(p.calidad),
          ke(new Date().toLocaleString('es-CL')));
      } catch (p) {
        (console.error('Error loading data:', p),
          ae('Error al cargar los datos. Verifica tu conexión e intenta de nuevo.'));
      }
      se(!1);
    }, []);
  l.useEffect(() => {
    const o = ge();
    (y(o.from, o.to),
      We()
        .then((b) => {
          b.operadores.length > 0 && Ce(b.operadores);
        })
        .catch(() => {}),
      qe(6)
        .then((b) => Se(b))
        .catch(() => {}));
  }, [y]);
  const R = l.useRef(j);
  (l.useEffect(() => {
    R.current = j;
  }, [j]),
    l.useEffect(() => {
      if (!X) return;
      let o = null;
      const b = () => {
          (typeof document < 'u' && document.hidden) ||
            (o && clearTimeout(o), (o = setTimeout(() => y(R.current.from, R.current.to), 2500)));
        },
        p = X.channel('tms-oper-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_operaciones' }, b)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tms_operaciones_sync' },
            b
          )
          .subscribe();
      return () => {
        (o && clearTimeout(o), X.removeChannel(p));
      };
    }, [y]));
  const [ue, V] = l.useState(120),
    T = l.useRef(120);
  return (
    l.useEffect(() => {
      ((T.current = 120), V(120));
      const o = setInterval(() => {
        if (((T.current -= 1), V(T.current), T.current <= 0)) {
          if (((T.current = 120), V(120), typeof document < 'u' && document.hidden)) return;
          y(j.from, j.to);
        }
      }, 1e3);
      return () => clearInterval(o);
    }, [y, j]),
    l.useEffect(() => {
      const o = () => {
        typeof document < 'u' &&
          !document.hidden &&
          ((T.current = 120), V(120), y(R.current.from, R.current.to));
      };
      return (
        document.addEventListener('visibilitychange', o),
        () => document.removeEventListener('visibilitychange', o)
      );
    }, [y]),
    O && !s
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
      : te && !s
        ? e.jsx('div', {
            className: 'dash-root min-h-screen flex items-center justify-center bg-gray-50',
            children: e.jsxs('div', {
              className: 'text-center max-w-md',
              children: [
                e.jsx('p', {
                  className: 'text-red-600 text-lg font-semibold mb-2',
                  children: 'Error de carga'
                }),
                e.jsx('p', { className: 'text-gray-500 mb-4', children: te }),
                e.jsx('button', {
                  onClick: () => y(j.from, j.to),
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
                        e.jsx(ls, { onFilter: y, defaultFrom: Z, defaultTo: ee }),
                        e.jsxs('button', {
                          onClick: () => {
                            ((T.current = 120), V(120), y(j.from, j.to));
                          },
                          disabled: O,
                          className:
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-700 transition-colors disabled:opacity-50',
                          title: 'Actualizar ahora',
                          children: [
                            e.jsx('svg', {
                              className: `w-3.5 h-3.5 ${O ? 'animate-spin' : ''}`,
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
                              children: [Math.floor(ue / 60), ':', String(ue % 60).padStart(2, '0')]
                            })
                          ]
                        }),
                        G &&
                          e.jsx('span', {
                            className: 'text-[10px] text-gray-400 hidden sm:inline',
                            children: G
                          })
                      ]
                    })
                  ]
                })
              }),
              e.jsxs('main', {
                className: 'max-w-[1400px] mx-auto px-4 py-6 space-y-6',
                children: [
                  O &&
                    e.jsx('div', {
                      className: 'fixed top-0 left-0 w-full h-1 bg-orange-100 z-[100]',
                      children: e.jsx('div', {
                        className: 'h-full bg-orange-500 animate-pulse w-1/2'
                      })
                    }),
                  e.jsx(us, { kpis: s, onSelect: P }),
                  e.jsx(Ns, { kpis: s, onDetalle: P }),
                  e.jsx(vs, { calidadData: fe, onOpen: () => pe(!0) }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
                    children: [
                      e.jsxs('div', {
                        className: 'space-y-4',
                        children: [
                          e.jsx(Qe, { data: n, onSelectEstado: P }),
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
                                  children: m.map((o) =>
                                    e.jsxs(
                                      'tr',
                                      {
                                        onClick: () => P(o.estado),
                                        className: 'cursor-pointer hover:bg-orange-50',
                                        children: [
                                          e.jsx('td', {
                                            className: 'font-medium text-left',
                                            children: o.estado
                                          }),
                                          e.jsx('td', { className: 'font-bold', children: o.count })
                                        ]
                                      },
                                      o.estado
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
                        children: [e.jsx(es, { data: d }), e.jsx(ns, { data: g })]
                      })
                    ]
                  }),
                  e.jsx(ws, { tiemposCiclo: k }),
                  e.jsx(Cs, { alertasOp: B }),
                  e.jsx(Ss, { data: C, onOpenIncidencias: Pe }),
                  e.jsx(Ts, { rankTransp: z, rankVend: D }),
                  e.jsx(ks, { auditKpis: Ae }),
                  e.jsx(Es, { divisions: a }),
                  e.jsx($s, { tendencia: Te }),
                  e.jsxs('div', {
                    className: 'text-center text-xs text-gray-400 py-4',
                    children: ['Fecha de la última actualización: ', G]
                  })
                ]
              }),
              ne && e.jsx(is, { estado: ne, data: $e, loading: _e, onClose: () => re(null) }),
              ie && e.jsx(os, { open: ie, data: Le, loading: Re, onClose: () => de(!1) }),
              me && e.jsx(ps, { open: me, data: De, onClose: () => Ve(!1) }),
              he && e.jsx(fs, { open: he, data: fe, onClose: () => pe(!1) })
            ]
          })
  );
}
export { Is as default };
