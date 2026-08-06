import { j as e } from './query-vendor-BNjBrM5A.js';
import { r as c } from './react-vendor-6aw4XXjH.js';
import { w as k, be as L, V as E, a7 as P, aq as z, t as w } from './ui-vendor-naG2PYVT.js';
import { u as _, s as y } from './index-CJpoExlo.js';
import { ak as R, al as q } from './calidadService-PAFf_qhK.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
function H() {
  const { hasPermission: g, user: n } = _(),
    d = g('manage_quality') || g('manage_monitoreo') || (n == null ? void 0 : n.rol) === 'ADMIN',
    [i, f] = c.useState(!1),
    [o, m] = c.useState({ hechos: 0, total: 0 }),
    [l, b] = c.useState(null),
    [j, C] = c.useState({ clasificados: 0, grupos: 0 }),
    x = c.useCallback(async () => {
      try {
        const [{ count: t }, { data: a }] = await Promise.all([
          y.from('tms_producto_categoria').select('*', { count: 'exact', head: !0 }),
          y.from('tms_categorias_calidad').select('codigo').eq('activo', !0)
        ]);
        C({ clasificados: t || 0, grupos: (a || []).length });
      } catch {}
    }, []);
  c.useEffect(() => {
    x();
  }, [x]);
  const S = async () => {
    if (
      d &&
      window.confirm(
        'Cargar/actualizar la clasificación de productos por grupo comercial y reclasificar las recepciones. ¿Continuar?'
      )
    ) {
      (f(!0), b(null), m({ hechos: 0, total: 0 }));
      try {
        const t = await fetch('/data/grupos_calidad.json', { cache: 'no-store' });
        if (!t.ok) throw new Error('No se encontró el archivo de clasificación.');
        const a = await t.json();
        if (!Array.isArray(a) || a.length === 0)
          throw new Error('El archivo de clasificación está vacío.');
        const N = 1500,
          v = [];
        for (let s = 0; s < a.length; s += N) v.push(a.slice(s, s + N));
        m({ hechos: 0, total: a.length });
        let p = 0;
        for (const s of v) {
          const h = await R(s);
          ((p += (h == null ? void 0 : h.procesados) || 0),
            m((u) => ({ ...u, hechos: Math.min(u.total, u.hechos + s.length) })));
        }
        const r = await q();
        (b({
          procesados: p,
          importacion: (r == null ? void 0 : r.importacion) || 0,
          nacional: (r == null ? void 0 : r.nacional) || 0,
          filas: a.length
        }),
          w.success(
            `Clasificación cargada: ${p.toLocaleString()} productos · recepciones reclasificadas`
          ),
          x());
      } catch (t) {
        w.error(t.message || 'No se pudo cargar la clasificación');
      } finally {
        f(!1);
      }
    }
  };
  return e.jsxs('div', {
    className: 'min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 text-slate-700',
    children: [
      e.jsxs('div', {
        className:
          'relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex items-center gap-4',
        children: [
          e.jsx('div', {
            className:
              'w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl grid place-items-center text-emerald-600 shrink-0',
            children: e.jsx(k, { size: 22 })
          }),
          e.jsxs('div', {
            children: [
              e.jsxs('h1', {
                className: 'text-xl sm:text-2xl font-black text-slate-900',
                children: [
                  'Clasificación de ',
                  e.jsx('span', { className: 'text-emerald-600', children: 'Productos' })
                ]
              }),
              e.jsx('p', {
                className: 'text-xs sm:text-sm text-slate-500',
                children: 'Grupos comerciales del ERP para el checklist de Calidad'
              })
            ]
          })
        ]
      }),
      e.jsxs('div', {
        className: 'grid grid-cols-2 sm:grid-cols-3 gap-3',
        children: [
          e.jsxs('div', {
            className: 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center',
            children: [
              e.jsx('div', {
                className: 'text-2xl font-black text-slate-800 tabular-nums',
                children: j.grupos
              }),
              e.jsx('div', {
                className: 'text-[11px] font-bold text-slate-400 uppercase',
                children: 'Grupos activos'
              })
            ]
          }),
          e.jsxs('div', {
            className: 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center',
            children: [
              e.jsx('div', {
                className: 'text-2xl font-black text-slate-800 tabular-nums',
                children: j.clasificados.toLocaleString()
              }),
              e.jsx('div', {
                className: 'text-[11px] font-bold text-slate-400 uppercase',
                children: 'Productos clasificados'
              })
            ]
          })
        ]
      }),
      e.jsxs('div', {
        className: 'rounded-2xl border border-slate-200 bg-white p-5 space-y-4',
        children: [
          e.jsxs('div', {
            className: 'flex items-start gap-2 text-sm text-slate-600',
            children: [
              e.jsx(L, { size: 18, className: 'text-emerald-500 shrink-0 mt-0.5' }),
              e.jsxs('p', {
                children: [
                  'Carga el mapeo ',
                  e.jsx('b', { children: 'producto → grupo comercial' }),
                  ' (desde el maestro del ERP) y',
                  ' ',
                  e.jsx('b', { children: 'reclasifica' }),
                  ' las recepciones ya registradas. Los productos que no estén en el maestro quedan como ',
                  e.jsx('b', { children: 'Sin clasificar' }),
                  ' hasta la próxima carga.'
                ]
              })
            ]
          }),
          i &&
            o.total > 0 &&
            e.jsxs('div', {
              children: [
                e.jsx('div', {
                  className: 'h-2 rounded-full bg-slate-100 overflow-hidden',
                  children: e.jsx('div', {
                    className: 'h-full bg-emerald-500 transition-all',
                    style: { width: `${Math.round((o.hechos / o.total) * 100)}%` }
                  })
                }),
                e.jsxs('p', {
                  className: 'text-[11px] text-slate-400 mt-1 text-center',
                  children: [o.hechos.toLocaleString(), ' / ', o.total.toLocaleString()]
                })
              ]
            }),
          l &&
            e.jsxs('div', {
              className:
                'rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm text-emerald-800 flex items-start gap-2',
              children: [
                e.jsx(E, { size: 18, className: 'shrink-0 mt-0.5 text-emerald-500' }),
                e.jsxs('span', {
                  children: [
                    e.jsx('b', { children: l.procesados.toLocaleString() }),
                    ' productos clasificados. Recepciones reclasificadas: ',
                    l.importacion.toLocaleString(),
                    ' importación ·',
                    ' ',
                    l.nacional.toLocaleString(),
                    ' nacional.'
                  ]
                })
              ]
            }),
          e.jsxs('button', {
            onClick: S,
            disabled: !d || i,
            className:
              'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-50',
            children: [
              i ? e.jsx(P, { size: 18, className: 'animate-spin' }) : e.jsx(z, { size: 18 }),
              i ? 'Cargando…' : 'Cargar / actualizar clasificación'
            ]
          }),
          !d &&
            e.jsx('p', {
              className: 'text-[11px] text-slate-400',
              children: 'Necesitas permiso de gestión de Calidad para cargar la clasificación.'
            })
        ]
      })
    ]
  });
}
export { H as default };
