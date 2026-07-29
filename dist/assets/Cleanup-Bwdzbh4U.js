import { j as e } from './query-vendor-CojWQiBV.js';
import { r as i } from './react-vendor-CA7EHQ1X.js';
import { s as u } from './index-CyreZcpi.js';
import { $ as x, Y as p, R as b, _ as g } from './ui-vendor-C7KFTQPV.js';
import './supabase-vendor-jY4wIOEF.js';
const v = () => {
  const [t, o] = i.useState(!1),
    [s, l] = i.useState(null),
    [a, d] = i.useState({ cleanNV: !1, cleanPartidas: !1, cleanSeries: !1, cleanFarmapack: !1 }),
    r = (n) => {
      d({ ...a, [n.target.name]: n.target.checked });
    },
    h = async () => {
      if (
        !window.confirm(`⚠️ ADVERTENCIA CRÍTICA ⚠️

Estás a punto de ELIMINAR PERMANENTEMENTE datos operativos.
Esta acción NO SE PUEDE DESHACER.

¿Estás absolutamente seguro de continuar?`)
      )
        return;
      if (prompt("Para confirmar, escribe 'BORRAR' en mayúsculas:") !== 'BORRAR') {
        alert('Acción cancelada.');
        return;
      }
      (o(!0), l(null));
      try {
        const { data: c, error: m } = await u.rpc('clean_operational_data', {
          p_clean_nv: a.cleanNV,
          p_clean_partidas: a.cleanPartidas,
          p_clean_series: a.cleanSeries,
          p_clean_farmapack: a.cleanFarmapack
        });
        if (m) throw m;
        (l({ type: 'success', message: c || 'Limpieza realizada con éxito.' }),
          d({ cleanNV: !1, cleanPartidas: !1, cleanSeries: !1, cleanFarmapack: !1 }));
      } catch (c) {
        l({ type: 'error', message: 'Error al limpiar datos: ' + c.message });
      } finally {
        o(!1);
      }
    };
  return e.jsxs('div', {
    className: 'max-w-2xl mx-auto space-y-4 sm:space-y-6 p-3 sm:p-0',
    children: [
      e.jsx('div', {
        className: 'bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg',
        children: e.jsxs('div', {
          className: 'flex items-start',
          children: [
            e.jsx(x, { className: 'text-red-500 mr-3 flex-shrink-0', size: 24 }),
            e.jsxs('div', {
              children: [
                e.jsx('h3', {
                  className: 'text-red-800 font-bold text-lg',
                  children: 'Zona de Peligro: Limpieza de Datos'
                }),
                e.jsx('p', {
                  className: 'text-red-700 text-sm mt-1',
                  children:
                    'Esta herramienta permite eliminar masivamente registros de las tablas operativas. Úsala con extrema precaución, idealmente solo para reiniciar entornos de prueba o limpiezas anuales.'
                })
              ]
            })
          ]
        })
      }),
      e.jsxs('div', {
        className: 'bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6',
        children: [
          e.jsxs('h4', {
            className: 'text-slate-800 font-bold mb-4 flex items-center gap-2',
            children: [
              e.jsx(p, { size: 20, className: 'text-slate-500' }),
              ' Selecciona qué datos eliminar'
            ]
          }),
          e.jsxs('div', {
            className: 'space-y-4 mb-8',
            children: [
              e.jsxs('label', {
                className:
                  'flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors',
                children: [
                  e.jsx('input', {
                    type: 'checkbox',
                    name: 'cleanNV',
                    checked: a.cleanNV,
                    onChange: r,
                    className: 'w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300'
                  }),
                  e.jsxs('div', {
                    className: 'ml-3',
                    children: [
                      e.jsx('span', {
                        className: 'block text-sm font-bold text-slate-700',
                        children: 'Notas de Venta + Entregas TMS'
                      }),
                      e.jsx('span', {
                        className: 'block text-xs text-slate-500',
                        children:
                          'Elimina N.V. Diarias y sus entregas asociadas en el planificador.'
                      })
                    ]
                  })
                ]
              }),
              e.jsxs('label', {
                className:
                  'flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors',
                children: [
                  e.jsx('input', {
                    type: 'checkbox',
                    name: 'cleanPartidas',
                    checked: a.cleanPartidas,
                    onChange: r,
                    className: 'w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300'
                  }),
                  e.jsxs('div', {
                    className: 'ml-3',
                    children: [
                      e.jsx('span', {
                        className: 'block text-sm font-bold text-slate-700',
                        children: 'Partidas'
                      }),
                      e.jsx('span', {
                        className: 'block text-xs text-slate-500',
                        children: 'Elimina el detalle de partidas/líneas de venta.'
                      })
                    ]
                  })
                ]
              }),
              e.jsxs('label', {
                className:
                  'flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors',
                children: [
                  e.jsx('input', {
                    type: 'checkbox',
                    name: 'cleanSeries',
                    checked: a.cleanSeries,
                    onChange: r,
                    className: 'w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300'
                  }),
                  e.jsxs('div', {
                    className: 'ml-3',
                    children: [
                      e.jsx('span', {
                        className: 'block text-sm font-bold text-slate-700',
                        children: 'Series'
                      }),
                      e.jsx('span', {
                        className: 'block text-xs text-slate-500',
                        children: 'Elimina el registro de series de productos.'
                      })
                    ]
                  })
                ]
              }),
              e.jsxs('label', {
                className:
                  'flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors',
                children: [
                  e.jsx('input', {
                    type: 'checkbox',
                    name: 'cleanFarmapack',
                    checked: a.cleanFarmapack,
                    onChange: r,
                    className: 'w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300'
                  }),
                  e.jsxs('div', {
                    className: 'ml-3',
                    children: [
                      e.jsx('span', {
                        className: 'block text-sm font-bold text-slate-700',
                        children: 'Farmapack'
                      }),
                      e.jsx('span', {
                        className: 'block text-xs text-slate-500',
                        children: 'Elimina datos de integración Farmapack.'
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          e.jsxs('button', {
            onClick: h,
            disabled: t || !Object.values(a).some(Boolean),
            className:
              'w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2',
            children: [
              t ? e.jsx(b, { className: 'animate-spin' }) : e.jsx(p, {}),
              t ? 'Eliminando...' : 'Ejecutar Limpieza'
            ]
          }),
          s &&
            e.jsxs('div', {
              className: `mt-4 p-4 rounded-lg flex items-center gap-2 ${s.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`,
              children: [
                s.type === 'success' ? e.jsx(g, { size: 20 }) : e.jsx(x, { size: 20 }),
                e.jsx('span', { children: s.message })
              ]
            })
        ]
      })
    ]
  });
};
export { v as default };
