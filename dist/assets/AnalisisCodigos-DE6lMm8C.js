import { d as K, u as X, c as M, j as e } from './query-vendor-BNjBrM5A.js';
import { i as le, r as N, L as W } from './react-vendor-6aw4XXjH.js';
import {
  aT as re,
  a9 as ce,
  R as O,
  U as V,
  n as F,
  a3 as de,
  Y as xe,
  b8 as pe,
  x as Z,
  a1 as H,
  t as $,
  bo as U,
  _ as R,
  X as L,
  bj as ue,
  bn as me
} from './ui-vendor-CTbhg6u_.js';
import { s as P, _ as Y, u as J, p as ge } from './index-Cm4s-gCR.js';
import { e as ee } from './exportExcel-D85v870c.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
import './xlsx-B2eTCt_Q.js';
function te() {
  return K({
    queryKey: ['analisis_resumen'],
    queryFn: async () => {
      const { data: a, error: s } = await P.rpc('analisis_codigos_resumen');
      if (s) throw s;
      return a || {};
    },
    staleTime: 6e4
  });
}
function se(a = 'todos', s = '') {
  return K({
    queryKey: ['analisis_codigos', a, s || ''],
    queryFn: async () => {
      const u = [];
      for (let i = 0; ; i += 1e3) {
        const r = P.rpc('analisis_codigos', { p_filtro: a, p_q: s || '' }),
          { data: o, error: g } = await (r.range ? r.range(i, i + 1e3 - 1) : r);
        if (g) throw g;
        if ((u.push(...(o || [])), !o || o.length < 1e3)) break;
      }
      return u;
    },
    staleTime: 6e4
  });
}
const be = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
async function he({
  tipo: a,
  rows: s,
  accion: m = 'DESCONTAR',
  obs: u = '',
  cantidadDe: i = 'disponible'
}) {
  const { data: r, error: o } = await P.from('tms_emil_sync')
    .select('rev,data')
    .eq('space', 'default')
    .maybeSingle();
  if (o) throw o;
  const g = r != null && r.data && typeof r.data == 'object' ? r.data : {},
    c = Array.isArray(g[a]) ? g[a] : [],
    x = new Set(
      c.map((l) =>
        String(l.sku || '')
          .trim()
          .toUpperCase()
      )
    ),
    f = Date.now(),
    y = [];
  let p = 0;
  for (const l of s) {
    const v = String(l.codigo || '').trim();
    if (!v) continue;
    if (x.has(v.toUpperCase())) {
      p += 1;
      continue;
    }
    x.add(v.toUpperCase());
    const C = Number(i === 'total' ? l.stock_total : l.disponible) || 0,
      k = {
        id: be(),
        createdAt: f,
        estadoAt: f,
        sku: v,
        descripcion: l.producto || '',
        um: l.unidad_medida || 'UNI',
        lotes: [{ cantidad: String(C), partida: '', serie: '' }],
        folder: '',
        estado: 'PENDIENTE',
        asunto: ''
      };
    (a === 'traspasos'
      ? ((k.origen = ''), (k.destino = ''))
      : ((k.accion = m),
        (k.obs = u),
        l.ps_equivalente &&
          ((k.destSku = l.ps_equivalente),
          (k.destDesc = l.producto || ''),
          (k.destPartida = ''),
          (k.destSerie = ''),
          (k.destVenc = ''))),
      y.push(k));
  }
  if (y.length) {
    const { error: l } = await P.from('tms_emil_sync').upsert(
      {
        space: 'default',
        rev: f,
        data: { ...g, [a]: [...y, ...c] },
        updated_at: new Date().toISOString()
      },
      { onConflict: 'space' }
    );
    if (l) throw l;
  }
  try {
    localStorage.setItem('module', a);
  } catch {}
  return { agregados: y.length, omitidos: p };
}
function fe() {
  return M({ mutationFn: he });
}
function ve() {
  const a = X();
  return M({
    mutationFn: async (s) => {
      let m = 0;
      for (let u = 0; u < s.length; u += 800) {
        const i = s.slice(u, u + 800),
          { data: r, error: o } = await P.rpc('bulk_upsert', {
            p_table: 'tms_productos_activo',
            p_data: i,
            p_conflict_keys: 'codigo_producto'
          });
        if (o) throw o;
        if (r != null && r.error) throw new Error(r.error);
        m += (r == null ? void 0 : r.inserted) || 0;
      }
      return { insertados: m, total: s.length };
    },
    onSuccess: () => {
      (a.invalidateQueries({ queryKey: ['analisis_resumen'] }),
        a.invalidateQueries({ queryKey: ['analisis_codigos'] }));
    }
  });
}
const ae = 'CONSOLIDADO';
function je() {
  const a = X();
  return M({
    mutationFn: async (s) => {
      const { error: m } = await P.from('tms_inventario_general').delete().eq('bodega', ae);
      if (m) throw m;
      let u = 0;
      for (let i = 0; i < s.length; i += 800) {
        const r = s.slice(i, i + 800),
          { data: o, error: g } = await P.rpc('bulk_upsert', {
            p_table: 'tms_inventario_general',
            p_data: r,
            p_conflict_keys: 'bodega,codigo_producto'
          });
        if (g) throw g;
        if (o != null && o.error) throw new Error(o.error);
        u += (o == null ? void 0 : o.inserted) || 0;
      }
      return { insertados: u, total: s.length };
    },
    onSuccess: () => {
      (a.invalidateQueries({ queryKey: ['analisis_resumen'] }),
        a.invalidateQueries({ queryKey: ['analisis_codigos'] }));
    }
  });
}
const z = (a) => {
  const s = Number(
    String(a ?? '')
      .replace(/\./g, '')
      .replace(',', '.')
  );
  return Number.isFinite(s) ? s : Number(a) || 0;
};
async function Ne(a) {
  const s = await Y(() => import('./xlsx-B2eTCt_Q.js'), []),
    m = s.read(await a.arrayBuffer());
  for (const u of m.SheetNames) {
    const i = s.utils.sheet_to_json(m.Sheets[u], { header: 1, defval: '' });
    for (let r = 0; r < Math.min(i.length, 10); r++) {
      const o = i[r].map((b) => String(b || '').toLowerCase()),
        g = o.findIndex((b) => /cod/.test(b) && /prod/.test(b)),
        c = o.findIndex((b) => /disponible/.test(b));
      if (g === -1 || c === -1) continue;
      const x = (b) => o.findIndex((_) => b.test(_)),
        f = x(/^producto$|descrip/),
        y = x(/medida|u\.?m\b/),
        p = x(/reserva/),
        l = x(/transitoria/),
        v = x(/consign/),
        C = x(/stock.*total|total.*stock/),
        k = new Map();
      for (let b = r + 1; b < i.length; b++) {
        const _ = String(i[b][g] ?? '').trim();
        if (!_) continue;
        const T = z(i[b][c]),
          S = p >= 0 ? z(i[b][p]) : 0,
          n = l >= 0 ? z(i[b][l]) : 0,
          t = v >= 0 ? z(i[b][v]) : 0;
        k.set(_, {
          bodega: ae,
          codigo_producto: _,
          producto: f >= 0 ? String(i[b][f] ?? '').trim() : '',
          unidad_medida: y >= 0 ? String(i[b][y] ?? '').trim() : '',
          disponible: T,
          reserva: S,
          transitoria: n,
          consignacion: t,
          stock_total: C >= 0 ? z(i[b][C]) : T + S + n + t
        });
      }
      if (k.size) return [...k.values()];
    }
  }
  throw new Error(
    'No se encontró una hoja con las columnas "Cod. Producto" y "Disponible" (formato del reporte de stock IW del ERP).'
  );
}
async function ye(a) {
  const s = await Y(() => import('./xlsx-B2eTCt_Q.js'), []),
    m = s.read(await a.arrayBuffer());
  for (const u of m.SheetNames) {
    const i = s.utils.sheet_to_json(m.Sheets[u], { header: 1, defval: '' });
    for (let r = 0; r < Math.min(i.length, 10); r++) {
      const o = i[r].map((p) => String(p || '').toLowerCase()),
        g = o.findIndex((p) => /c[oó]d/.test(p) && /prod/.test(p)),
        c = o.findIndex((p) => /activo/.test(p));
      if (g === -1 || c === -1) continue;
      const x = o.findIndex((p) => /descrip|^producto$/.test(p)),
        f = o.findIndex((p) => /medida|u\.?m\b/.test(p)),
        y = new Map();
      for (let p = r + 1; p < i.length; p++) {
        const l = String(i[p][g] ?? '').trim();
        l &&
          y.set(l, {
            codigo_producto: l,
            producto: x >= 0 ? String(i[p][x] ?? '').trim() : '',
            unidad_medida: f >= 0 ? String(i[p][f] ?? '').trim() : '',
            activo: /^s[ií]/i.test(String(i[p][c] ?? '').trim())
          });
      }
      if (y.size) return [...y.values()];
    }
  }
  throw new Error(
    'No se encontró una hoja con las columnas "Código producto" y "Activo" (formato de la hoja ACTIVO del ERP).'
  );
}
const B = [
    'resumen',
    'antiguos',
    'antiguos_disp',
    'no_activos_stock',
    'duplicados',
    'anomalias',
    'detalle'
  ],
  h = (a) => Number(a || 0).toLocaleString('es-CL'),
  A = (a, s) => (Number(s) > 0 ? `${((Number(a) / Number(s)) * 100).toFixed(1)}%` : '—'),
  G = (a) =>
    a ? new Date(a).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : 'nunca',
  _e = {
    'Nuevo (P)': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Nuevo (S)': 'bg-sky-100 text-sky-700 border-sky-200',
    Antiguo: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  Ce = {
    Si: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    No: 'bg-rose-100 text-rose-700 border-rose-200',
    'No encontrado': 'bg-slate-100 text-slate-500 border-slate-200'
  },
  D = (a) => ({
    'Cod. Producto': a.codigo,
    Producto: a.producto || '',
    'U. Medida': a.unidad_medida || '',
    Disponible: Number(a.disponible || 0),
    Reserva: Number(a.reserva || 0),
    Transitoria: Number(a.transitoria || 0),
    Consignación: Number(a.consignacion || 0),
    'Stock Total': Number(a.stock_total || 0),
    'Estado Código': a.estado,
    'Antiguo con Disponible': a.antiguo_disponible ? '⚠ Sí' : '',
    '¿Existe con P/S?': a.duplicado || '',
    'Código P/S equivalente': a.ps_equivalente || '',
    'Producto Activo': a.activo,
    'No Activo con Stock': a.no_activo_stock ? '⚠ Sí' : '',
    Anomalía: a.anomalia || ''
  });
function qe() {
  const { user: a, hasPermission: s } = J(),
    u =
      (a == null ? void 0 : a.rol) === 'ADMIN' ||
      (a == null ? void 0 : a.es_admin_delegado) ||
      s('manage_data_import') ||
      s('manage_inventory'),
    [i] = le(),
    [r, o] = N.useState(i.get('tab') || 'resumen');
  N.useEffect(() => {
    const x = i.get('tab');
    x && x !== r ? o(x) : !x && r !== 'resumen' && o('resumen');
  }, [i]);
  const g = (x) => ge(s, '/inventory/analisis', x),
    c = B.includes(r) && g(r) ? r : B.find((x) => g(x)) || 'resumen';
  return e.jsxs('div', {
    className: 'min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-700',
    children: [
      e.jsxs('div', {
        className:
          'relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4',
        children: [
          e.jsx('div', {
            className:
              'absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500'
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-3 sm:gap-4 min-w-0',
            children: [
              e.jsx('div', {
                className:
                  'w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0',
                children: e.jsx(re, { size: 22 })
              }),
              e.jsxs('div', {
                className: 'min-w-0',
                children: [
                  e.jsxs('h1', {
                    className: 'text-xl sm:text-3xl font-black text-slate-900 tracking-tight',
                    children: [
                      'Análisis de ',
                      e.jsx('span', { className: 'text-orange-600', children: 'Códigos' })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'text-xs sm:text-sm text-slate-500',
                    children:
                      'Actualización a nomenclatura P/S · antiguos con stock · duplicados · anomalías'
                  })
                ]
              })
            ]
          })
        ]
      }),
      c === 'resumen' && e.jsx(ke, { canCargar: u }),
      c === 'antiguos' &&
        e.jsx(I, { filtro: 'antiguos', titulo: 'Códigos antiguos (faltan actualizar a P/S)' }),
      c === 'antiguos_disp' &&
        e.jsx(I, {
          filtro: 'antiguos_disp',
          titulo: 'Antiguos que AÚN tienen Disponible',
          alerta: !0
        }),
      c === 'no_activos_stock' &&
        e.jsx(I, {
          filtro: 'no_activos_stock',
          titulo: 'Productos NO activos con stock',
          alerta: !0
        }),
      c === 'duplicados' &&
        e.jsx(I, {
          filtro: 'duplicados',
          titulo: 'Antiguos duplicados (la descripción ya existe con P/S)'
        }),
      c === 'anomalias' &&
        e.jsx(I, {
          filtro: 'anomalias',
          titulo: 'Anomalías (códigos mal escritos)',
          conDiagnostico: !0
        }),
      c === 'detalle' && e.jsx(Te, {})
    ]
  });
}
function ke({ canCargar: a }) {
  const { data: s = {}, isLoading: m, refetch: u, isFetching: i } = te(),
    r = ve(),
    o = je(),
    g = N.useRef(null),
    c = N.useRef(null),
    [x, f] = N.useState(!1),
    [y, p] = N.useState(!1),
    l = async (_) => {
      var S;
      const T = (S = _.target.files) == null ? void 0 : S[0];
      if (((_.target.value = ''), !!T)) {
        f(!0);
        try {
          const n = await ye(T),
            t = await r.mutateAsync(n);
          $.success(`Catálogo ACTIVO cargado: ${h(t.total)} códigos`);
        } catch (n) {
          $.error(n.message || 'No se pudo cargar el catálogo');
        } finally {
          f(!1);
        }
      }
    },
    v = async (_) => {
      var S;
      const T = (S = _.target.files) == null ? void 0 : S[0];
      if (((_.target.value = ''), !!T)) {
        p(!0);
        try {
          const n = await Ne(T),
            t = await o.mutateAsync(n);
          $.success(`Stock cargado: ${h(t.total)} SKUs (reemplazó la carga anterior)`);
        } catch (n) {
          $.error(n.message || 'No se pudo cargar el reporte de stock');
        } finally {
          p(!1);
        }
      }
    },
    C = !m && Number(s.total || 0) === 0,
    k = !m && Number(s.activo_filas || 0) === 0,
    b = ({ label: _, value: T, sub: S, tone: n }) =>
      e.jsxs('div', {
        className: `rounded-2xl border p-4 ${n === 'alert' ? 'bg-rose-50 border-rose-200' : n === 'ok' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`,
        children: [
          e.jsx('div', {
            className: 'text-[11px] font-bold text-slate-500 uppercase tracking-wide',
            children: _
          }),
          e.jsx('div', {
            className: `text-2xl font-black ${n === 'alert' ? 'text-rose-600' : n === 'ok' ? 'text-emerald-600' : 'text-slate-900'}`,
            children: m ? '…' : h(T)
          }),
          S && e.jsx('div', { className: 'text-[11px] text-slate-400 font-bold', children: S })
        ]
      });
  return e.jsxs('div', {
    className: 'space-y-4',
    children: [
      e.jsxs('div', {
        className: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between flex-wrap gap-2',
            children: [
              e.jsxs('h2', {
                className: 'font-black text-slate-900 flex items-center gap-2',
                children: [
                  e.jsx(ce, { size: 17, className: 'text-orange-500' }),
                  ' Fuentes de datos'
                ]
              }),
              e.jsxs('button', {
                onClick: () => u(),
                className:
                  'px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1.5',
                children: [
                  e.jsx(O, { size: 13, className: i ? 'animate-spin' : '' }),
                  ' Actualizar'
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'grid sm:grid-cols-2 gap-3',
            children: [
              e.jsxs('div', {
                className: `rounded-xl border p-4 ${C ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`,
                children: [
                  e.jsx('div', {
                    className: 'font-bold text-slate-800 text-sm',
                    children: '1 · Reporte de stock (ERP)'
                  }),
                  e.jsxs('div', {
                    className: 'text-xs text-slate-500 mt-0.5',
                    children: [h(s.total), ' SKUs · última carga: ', G(s.stock_cargado_el)]
                  }),
                  C &&
                    e.jsx('div', {
                      className: 'text-xs font-bold text-amber-700 mt-1',
                      children: '⚠ Aún no hay stock cargado: el análisis saldrá vacío.'
                    }),
                  a &&
                    e.jsxs('button', {
                      onClick: () => {
                        var _;
                        return (_ = c.current) == null ? void 0 : _.click();
                      },
                      disabled: y,
                      className:
                        'mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 disabled:opacity-50',
                      children: [
                        y
                          ? e.jsx(O, { size: 13, className: 'animate-spin' })
                          : e.jsx(V, { size: 13 }),
                        ' ',
                        'Cargar reporte de stock (Excel IW)'
                      ]
                    }),
                  e.jsx('input', {
                    ref: c,
                    type: 'file',
                    accept: '.xlsx,.xls,.csv',
                    onChange: v,
                    className: 'hidden'
                  }),
                  e.jsxs('p', {
                    className: 'text-[10px] text-slate-400 mt-1.5',
                    children: [
                      'Detecta las columnas por nombre ("Cod. Producto", "Disponible", …) y reemplaza la carga anterior. Alternativa:',
                      ' ',
                      e.jsx(W, {
                        to: '/inbound/data-import',
                        className: 'underline',
                        children: 'Carga Masiva → Consolidado'
                      }),
                      ' ',
                      '(requiere columna Bodega).'
                    ]
                  })
                ]
              }),
              e.jsxs('div', {
                className: `rounded-xl border p-4 ${k ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`,
                children: [
                  e.jsx('div', {
                    className: 'font-bold text-slate-800 text-sm',
                    children: '2 · Catálogo ACTIVO (Si/No del ERP)'
                  }),
                  e.jsxs('div', {
                    className: 'text-xs text-slate-500 mt-0.5',
                    children: [
                      h(s.activo_filas),
                      ' códigos · última carga: ',
                      G(s.activo_cargado_el)
                    ]
                  }),
                  k &&
                    e.jsx('div', {
                      className: 'text-xs font-bold text-amber-700 mt-1',
                      children: '⚠ Sin catálogo, todo saldrá "No encontrado".'
                    }),
                  a &&
                    e.jsxs('button', {
                      onClick: () => {
                        var _;
                        return (_ = g.current) == null ? void 0 : _.click();
                      },
                      disabled: x,
                      className:
                        'mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 disabled:opacity-50',
                      children: [
                        x
                          ? e.jsx(O, { size: 13, className: 'animate-spin' })
                          : e.jsx(V, { size: 13 }),
                        ' ',
                        'Cargar catálogo ACTIVO (Excel)'
                      ]
                    }),
                  e.jsx('input', {
                    ref: g,
                    type: 'file',
                    accept: '.xlsx,.xls,.csv',
                    onChange: l,
                    className: 'hidden'
                  }),
                  e.jsx('p', {
                    className: 'text-[10px] text-slate-400 mt-1.5',
                    children:
                      'Se actualiza por código (upsert): columnas "Código producto", "Descripción", "U. medida" y "Producto Activo".'
                  })
                ]
              })
            ]
          })
        ]
      }),
      e.jsxs('div', {
        className: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3',
        children: [
          e.jsxs('h2', {
            className: 'font-black text-slate-900 flex items-center gap-2',
            children: [
              e.jsx(F, { size: 17, className: 'text-orange-500' }),
              ' Resumen de actualización de códigos'
            ]
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-2 sm:grid-cols-4 gap-3',
            children: [
              e.jsx(b, { label: 'Total de códigos', value: s.total, sub: '100%' }),
              e.jsx(b, {
                label: 'Nuevos con P',
                value: s.nuevos_p,
                sub: A(s.nuevos_p, s.total),
                tone: 'ok'
              }),
              e.jsx(b, {
                label: 'Nuevos con S',
                value: s.nuevos_s,
                sub: A(s.nuevos_s, s.total),
                tone: 'ok'
              }),
              e.jsx(b, {
                label: 'Antiguos (faltan P/S)',
                value: s.antiguos,
                sub: A(s.antiguos, s.total)
              })
            ]
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-2 sm:grid-cols-4 gap-3',
            children: [
              e.jsx(b, {
                label: 'Antiguos con Disponible',
                value: s.antiguos_disp,
                sub: `${A(s.antiguos_disp, s.antiguos)} de los antiguos`,
                tone: 'alert'
              }),
              e.jsx(b, {
                label: 'Antiguos sin Disponible',
                value: s.antiguos_sin_disp,
                sub: 'solo renombrar'
              }),
              e.jsx(b, {
                label: 'Antiguos duplicados',
                value: s.antiguos_dup,
                sub: 'descripción ya existe con P/S'
              }),
              e.jsx(b, {
                label: 'Anomalías',
                value: s.anomalias,
                sub: 'códigos mal escritos',
                tone: Number(s.anomalias) > 0 ? 'alert' : void 0
              })
            ]
          })
        ]
      }),
      e.jsxs('div', {
        className: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3',
        children: [
          e.jsxs('h2', {
            className: 'font-black text-slate-900 flex items-center gap-2',
            children: [
              e.jsx(de, { size: 17, className: 'text-orange-500' }),
              ' Estado Activo / No Activo'
            ]
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-2 sm:grid-cols-4 gap-3',
            children: [
              e.jsx(b, {
                label: 'Productos activos (Si)',
                value: s.activos,
                sub: A(s.activos, s.total),
                tone: 'ok'
              }),
              e.jsx(b, {
                label: 'No activos (No)',
                value: s.no_activos,
                sub: A(s.no_activos, s.total)
              }),
              e.jsx(b, {
                label: 'No encontrados en ACTIVO',
                value: s.no_encontrados,
                sub: A(s.no_encontrados, s.total)
              }),
              e.jsx(b, {
                label: 'NO activos que AÚN tienen stock',
                value: s.no_activos_stock,
                sub: `${A(s.no_activos_stock, s.no_activos)} de los no activos`,
                tone: 'alert'
              })
            ]
          })
        ]
      })
    ]
  });
}
const q = [];
function I({ filtro: a, titulo: s, alerta: m = !1, conDiagnostico: u = !1 }) {
  const [i, r] = N.useState(''),
    [o, g] = N.useState('');
  N.useEffect(() => {
    const C = setTimeout(() => r(o.trim()), 400);
    return () => clearTimeout(C);
  }, [o]);
  const { data: c = q, isLoading: x } = se(a, i),
    [f, y] = N.useState(q),
    [p, l] = N.useState(() => new Set()),
    v = () =>
      ee({
        filename: `analisis_${a}`,
        sheets: [{ name: s.slice(0, 30), rows: (f.length ? f : c).map(D) }]
      });
  return e.jsxs('div', {
    className: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between flex-wrap gap-3',
        children: [
          e.jsxs('h2', {
            className: 'font-black text-slate-900 flex items-center gap-2',
            children: [
              m
                ? e.jsx(xe, { size: 17, className: 'text-rose-500' })
                : u
                  ? e.jsx(pe, { size: 17, className: 'text-amber-500' })
                  : e.jsx(F, { size: 17, className: 'text-orange-500' }),
              s,
              ' ',
              e.jsxs('span', {
                className: 'text-slate-400 font-bold text-sm',
                children: [
                  '(',
                  f.length !== c.length ? `${h(f.length)} de ${h(c.length)}` : h(c.length),
                  ')'
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsxs('div', {
                className: 'relative',
                children: [
                  e.jsx(Z, {
                    size: 14,
                    className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                  }),
                  e.jsx('input', {
                    value: o,
                    onChange: (C) => g(C.target.value),
                    placeholder: 'Buscar código o producto…',
                    className: 'pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-56'
                  })
                ]
              }),
              e.jsxs('button', {
                onClick: v,
                disabled: !c.length,
                className:
                  'px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1.5',
                children: [e.jsx(H, { size: 13 }), ' Excel']
              })
            ]
          })
        ]
      }),
      e.jsx(oe, { sel: p, setSel: l, rows: c }),
      e.jsx(ne, { rows: c, isLoading: x, conDiagnostico: u, sel: p, setSel: l, onProcesadas: y })
    ]
  });
}
function oe({ sel: a, setSel: s, rows: m }) {
  const [u, i] = N.useState(null);
  if (!a.size) return null;
  const r = m.filter((o) => a.has(o.codigo));
  return e.jsxs('div', {
    className:
      'flex items-center gap-2 flex-wrap bg-orange-50 border border-orange-200 rounded-xl px-3 py-2',
    children: [
      e.jsxs('span', {
        className: 'text-xs font-black text-orange-700',
        children: [h(a.size), ' seleccionado', a.size === 1 ? '' : 's']
      }),
      e.jsxs('button', {
        onClick: () => i('correo'),
        className:
          'px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 inline-flex items-center gap-1.5',
        children: [e.jsx(U, { size: 13 }), ' Correo Actualización de Códigos']
      }),
      e.jsxs('button', {
        onClick: () => i('ajustes'),
        className:
          'px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 inline-flex items-center gap-1.5',
        children: [e.jsx(R, { size: 13 }), ' Generar Ajuste']
      }),
      e.jsxs('button', {
        onClick: () => i('traspasos'),
        className:
          'px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 inline-flex items-center gap-1.5',
        children: [e.jsx(R, { size: 13 }), ' Generar Traspaso']
      }),
      e.jsxs('button', {
        onClick: () => s(new Set()),
        className:
          'px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-500 hover:bg-slate-50 inline-flex items-center gap-1',
        children: [e.jsx(L, { size: 13 }), ' Limpiar']
      }),
      (u === 'traspasos' || u === 'ajustes') &&
        e.jsx(we, {
          tipo: u,
          rows: r,
          onClose: (o) => {
            (i(null), o && s(new Set()));
          }
        }),
      u === 'correo' && e.jsx(Se, { rows: r, onClose: () => i(null) })
    ]
  });
}
function Se({ rows: a, onClose: s }) {
  const { user: m } = J(),
    [u, i] = N.useState(() => {
      try {
        return localStorage.getItem('analisis_correo_dest') || '';
      } catch {
        return '';
      }
    });
  N.useEffect(() => {
    try {
      localStorage.setItem('analisis_correo_dest', u);
    } catch {}
  }, [u]);
  const [r, o] = N.useState(''),
    [g, c] = N.useState(() => {
      const n = {};
      return (
        a.forEach((t) => {
          n[t.codigo] = {
            tipo: (t.ps_equivalente || '').trim().toUpperCase().endsWith('S') ? 'S' : 'P',
            venc: '',
            nuevo: t.ps_equivalente || ''
          };
        }),
        n
      );
    }),
    x = (n, t, d) => c((w) => ({ ...w, [n]: { ...w[n], [t]: d } })),
    f = a.filter((n) => {
      var t, d;
      return (
        ((t = g[n.codigo]) == null ? void 0 : t.tipo) === 'P' &&
        !((d = g[n.codigo]) != null && d.venc)
      );
    }),
    y = new Date().toLocaleDateString('es-CL'),
    p = (n) => (n ? n.split('-').reverse().join('-') : 'POR DEFINIR'),
    l = `Actualización de códigos a nomenclatura P/S — ${a.length} código(s)`,
    v = [
      'Estimados:',
      '',
      `Se solicita la ACTUALIZACIÓN DE CÓDIGOS a la nomenclatura P/S de los siguientes productos (${y}):`,
      '',
      ...a.flatMap((n) => {
        const t = g[n.codigo] || {};
        return [
          `• ${n.codigo} — ${n.producto || ''} (${n.unidad_medida || 'UNI'})`,
          `   Stock: Disponible ${h(n.disponible)} · Total ${h(n.stock_total)}`,
          `   Crear con: ${t.tipo}${t.tipo === 'P' ? ` · Vencimiento: ${p(t.venc)}` : ''}${t.nuevo ? ` · Código nuevo: ${t.nuevo}` : ' · Código nuevo: POR CREAR'}`
        ];
      }),
      ...(r.trim() ? ['', `Observaciones: ${r.trim()}`] : []),
      '',
      'Atentamente,',
      (m == null ? void 0 : m.nombre) || '',
      'Generado desde CCO · Análisis de Códigos'
    ].join(`
`),
    C = 'padding:3px 8px;border:1px solid #cbd5e1',
    k = (n) => {
      const t = g[n.codigo] || {};
      return `<tr><td style="${C};font-family:monospace">${n.codigo}</td><td style="${C}">${(n.producto || '').replace(/</g, '&lt;')}</td><td style="${C}">${n.unidad_medida || ''}</td><td style="${C};text-align:right">${h(n.disponible)}</td><td style="${C};text-align:right">${h(n.stock_total)}</td><td style="${C};text-align:center;font-weight:bold;color:${t.tipo === 'P' ? '#c2410c' : '#0369a1'}">${t.tipo}</td><td style="${C};text-align:center">${t.tipo === 'P' ? p(t.venc) : '—'}</td><td style="${C};font-family:monospace;font-weight:bold">${t.nuevo || 'POR CREAR'}</td></tr>`;
    },
    b = `<p>Estimados:</p><p>Se solicita la <b>ACTUALIZACIÓN DE CÓDIGOS</b> a la nomenclatura P/S de los siguientes productos (${y}):</p>
<table style="border-collapse:collapse;font-size:13px"><tr>${['Código antiguo', 'Descripción', 'UM', 'Disponible', 'Stock Total', 'Crear con', 'Vencimiento', 'Código nuevo'].map((n) => `<th style="padding:4px 8px;border:1px solid #94a3b8;background:#f1f5f9;text-align:left">${n}</th>`).join('')}</tr>${a.map(k).join('')}</table>${r.trim() ? `<p><b>Observaciones:</b> ${r.trim().replace(/</g, '&lt;')}</p>` : ''}<p>Atentamente,<br/>${(m == null ? void 0 : m.nombre) || ''}<br/><span style="color:#94a3b8;font-size:11px">Generado desde CCO · Análisis de Códigos</span></p>`,
    _ = () =>
      f.length
        ? ($.error(`Falta la fecha de vencimiento en ${h(f.length)} código(s) que se crean con P.`),
          !1)
        : !0,
    T = async () => {
      var n;
      if (_())
        try {
          ((n = navigator.clipboard) != null && n.write && typeof ClipboardItem < 'u'
            ? await navigator.clipboard.write([
                new ClipboardItem({
                  'text/html': new Blob([b], { type: 'text/html' }),
                  'text/plain': new Blob([v], { type: 'text/plain' })
                })
              ])
            : await navigator.clipboard.writeText(v),
            $.success('Correo copiado — pégalo en Outlook (mantiene la tabla)'));
        } catch {
          try {
            (await navigator.clipboard.writeText(v), $.success('Correo copiado (texto plano)'));
          } catch {
            $.error('No se pudo copiar');
          }
        }
    },
    S = () => {
      if (!_()) return;
      const n = `mailto:${encodeURIComponent(u)}?subject=${encodeURIComponent(l)}&body=${encodeURIComponent(v)}`;
      if (n.length > 7500) {
        $.info('Selección muy grande para abrir directo: usa "Copiar" y pégalo en el correo.');
        return;
      }
      window.location.href = n;
    };
  return e.jsx('div', {
    className:
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto',
    onClick: s,
    children: e.jsxs('div', {
      className: 'bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-4xl my-auto',
      onClick: (n) => n.stopPropagation(),
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between px-5 py-4 border-b border-slate-100',
          children: [
            e.jsxs('h3', {
              className: 'font-black text-slate-800 flex items-center gap-2',
              children: [
                e.jsx(U, { size: 17, className: 'text-indigo-500' }),
                ' Correo · Actualización de Códigos (',
                h(a.length),
                ')'
              ]
            }),
            e.jsx('button', {
              onClick: s,
              className: 'p-1.5 rounded-lg hover:bg-slate-100 text-slate-400',
              children: e.jsx(L, { size: 18 })
            })
          ]
        }),
        e.jsxs('div', {
          className: 'p-5 space-y-3 max-h-[70vh] overflow-y-auto',
          children: [
            e.jsxs('div', {
              className: 'grid sm:grid-cols-2 gap-3',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: 'text-[11px] font-bold text-slate-500 uppercase',
                      children: 'Para (opcional)'
                    }),
                    e.jsx('input', {
                      value: u,
                      onChange: (n) => i(n.target.value),
                      placeholder: 'correo@ptm.cl; otro@ptm.cl',
                      className: 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm'
                    })
                  ]
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: 'text-[11px] font-bold text-slate-500 uppercase',
                      children: 'Observaciones (opcional)'
                    }),
                    e.jsx('input', {
                      value: r,
                      onChange: (n) => o(n.target.value),
                      placeholder: 'Comentario general del correo…',
                      className: 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm'
                    })
                  ]
                })
              ]
            }),
            e.jsx('div', {
              className: 'overflow-x-auto rounded-xl border border-slate-100',
              children: e.jsxs('table', {
                className: 'w-full text-xs',
                children: [
                  e.jsx('thead', {
                    children: e.jsxs('tr', {
                      className:
                        'text-left text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/60',
                      children: [
                        e.jsx('th', { className: 'py-2 px-3', children: 'Código antiguo' }),
                        e.jsx('th', { className: 'py-2 pr-3', children: 'Producto' }),
                        e.jsx('th', { className: 'py-2 pr-3 text-right', children: 'Disp.' }),
                        e.jsx('th', { className: 'py-2 pr-3', children: 'Crear con' }),
                        e.jsx('th', { className: 'py-2 pr-3', children: 'Vencimiento' }),
                        e.jsx('th', { className: 'py-2 pr-3', children: 'Código nuevo' })
                      ]
                    })
                  }),
                  e.jsx('tbody', {
                    children: a.map((n) => {
                      const t = g[n.codigo] || {};
                      return e.jsxs(
                        'tr',
                        {
                          className: 'border-b border-slate-50 align-middle',
                          children: [
                            e.jsx('td', {
                              className:
                                'py-1.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap',
                              children: n.codigo
                            }),
                            e.jsx('td', {
                              className: 'py-1.5 pr-3 text-slate-600 max-w-[16rem] truncate',
                              title: n.producto || '',
                              children: n.producto || '—'
                            }),
                            e.jsx('td', {
                              className: 'py-1.5 pr-3 text-right font-bold',
                              children: h(n.disponible)
                            }),
                            e.jsx('td', {
                              className: 'py-1.5 pr-3',
                              children: e.jsxs('select', {
                                value: t.tipo,
                                onChange: (d) => x(n.codigo, 'tipo', d.target.value),
                                className: `px-2 py-1 rounded-lg border text-xs font-black ${t.tipo === 'P' ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-sky-300 bg-sky-50 text-sky-700'}`,
                                children: [
                                  e.jsx('option', { value: 'P', children: 'P (con vencimiento)' }),
                                  e.jsx('option', { value: 'S', children: 'S (sin vencimiento)' })
                                ]
                              })
                            }),
                            e.jsx('td', {
                              className: 'py-1.5 pr-3',
                              children:
                                t.tipo === 'P'
                                  ? e.jsx('input', {
                                      type: 'date',
                                      value: t.venc,
                                      onChange: (d) => x(n.codigo, 'venc', d.target.value),
                                      className: `px-2 py-1 rounded-lg border text-xs ${t.venc ? 'border-slate-200' : 'border-rose-300 bg-rose-50'}`
                                    })
                                  : e.jsx('span', { className: 'text-slate-300', children: '—' })
                            }),
                            e.jsx('td', {
                              className: 'py-1.5 pr-3',
                              children: e.jsx('input', {
                                value: t.nuevo,
                                onChange: (d) => x(n.codigo, 'nuevo', d.target.value),
                                placeholder: 'POR CREAR',
                                className:
                                  'px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono w-36'
                              })
                            })
                          ]
                        },
                        n.codigo
                      );
                    })
                  })
                ]
              })
            }),
            f.length > 0 &&
              e.jsxs('p', {
                className: 'text-xs font-bold text-rose-600',
                children: [
                  '⚠ Falta la fecha de vencimiento en ',
                  h(f.length),
                  ' código(s) con creación P.'
                ]
              }),
            e.jsxs('div', {
              className: 'rounded-xl border border-slate-100 bg-slate-50/60 p-3',
              children: [
                e.jsx('div', {
                  className: 'text-[11px] font-bold text-slate-400 uppercase mb-1',
                  children: 'Vista previa'
                }),
                e.jsx('pre', {
                  className:
                    'text-[11px] text-slate-600 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto',
                  children: v
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: 'flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100',
          children: [
            e.jsx('button', {
              onClick: s,
              className:
                'px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50',
              children: 'Cerrar'
            }),
            e.jsxs('button', {
              onClick: T,
              className:
                'px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 inline-flex items-center gap-1.5',
              children: [e.jsx(me, { size: 13 }), ' Copiar (con tabla)']
            }),
            e.jsxs('button', {
              onClick: S,
              className:
                'px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 inline-flex items-center gap-1.5',
              children: [e.jsx(U, { size: 13 }), ' Abrir en correo']
            })
          ]
        })
      ]
    })
  });
}
function we({ tipo: a, rows: s, onClose: m }) {
  const u = fe(),
    i = a === 'ajustes',
    [r, o] = N.useState('DESCONTAR'),
    [g, c] = N.useState('disponible'),
    [x, f] = N.useState('Actualización de código a nomenclatura P/S'),
    y = s.filter((l) => l.ps_equivalente).length,
    p = async () => {
      try {
        const l = await u.mutateAsync({
          tipo: a,
          rows: s,
          accion: r,
          obs: i ? x : '',
          cantidadDe: g
        });
        ($.success(
          `${h(l.agregados)} registro(s) enviados a ${i ? 'Ajustes' : 'Traspasos'}${l.omitidos ? ` · ${h(l.omitidos)} ya estaban en la lista` : ''}. Ábrelos en Inventario → Traspasos y Ajustes.`
        ),
          m(!0));
      } catch (l) {
        $.error(l.message || 'No se pudo enviar la selección');
      }
    };
  return e.jsx('div', {
    className: 'fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4',
    onClick: () => m(!1),
    children: e.jsxs('div', {
      className: 'bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-4',
      onClick: (l) => l.stopPropagation(),
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between',
          children: [
            e.jsxs('h3', {
              className: 'font-black text-slate-900 flex items-center gap-2',
              children: [
                e.jsx(R, { size: 16, className: 'text-orange-500' }),
                ' Generar',
                ' ',
                i ? 'Ajuste' : 'Traspaso',
                ' (',
                h(s.length),
                ')'
              ]
            }),
            e.jsx('button', {
              onClick: () => m(!1),
              className: 'text-slate-400 hover:text-slate-600',
              children: e.jsx(L, { size: 18 })
            })
          ]
        }),
        e.jsxs('div', {
          className:
            'max-h-36 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50 text-xs',
          children: [
            s
              .slice(0, 12)
              .map((l) =>
                e.jsxs(
                  'div',
                  {
                    className: 'px-3 py-1.5 flex items-center justify-between gap-2',
                    children: [
                      e.jsx('span', {
                        className: 'font-mono font-bold text-slate-700',
                        children: l.codigo
                      }),
                      e.jsx('span', {
                        className: 'text-slate-400 truncate flex-1',
                        children: l.producto
                      }),
                      l.ps_equivalente &&
                        e.jsxs('span', {
                          className: 'text-indigo-600 font-bold whitespace-nowrap',
                          children: ['→ ', l.ps_equivalente]
                        })
                    ]
                  },
                  l.codigo
                )
              ),
            s.length > 12 &&
              e.jsxs('div', {
                className: 'px-3 py-1.5 text-slate-400',
                children: ['… y ', h(s.length - 12), ' más']
              })
          ]
        }),
        e.jsxs('div', {
          className: 'space-y-2 text-xs',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3 flex-wrap',
              children: [
                e.jsx('span', {
                  className: 'font-black text-slate-600',
                  children: 'Cantidad a usar:'
                }),
                e.jsxs('label', {
                  className: 'inline-flex items-center gap-1.5 font-bold text-slate-600',
                  children: [
                    e.jsx('input', {
                      type: 'radio',
                      checked: g === 'disponible',
                      onChange: () => c('disponible')
                    }),
                    ' ',
                    'Disponible'
                  ]
                }),
                e.jsxs('label', {
                  className: 'inline-flex items-center gap-1.5 font-bold text-slate-600',
                  children: [
                    e.jsx('input', {
                      type: 'radio',
                      checked: g === 'total',
                      onChange: () => c('total')
                    }),
                    ' ',
                    'Stock Total'
                  ]
                })
              ]
            }),
            i &&
              e.jsxs(e.Fragment, {
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-3 flex-wrap',
                    children: [
                      e.jsx('span', {
                        className: 'font-black text-slate-600',
                        children: 'Acción:'
                      }),
                      e.jsxs('select', {
                        value: r,
                        onChange: (l) => o(l.target.value),
                        className: 'px-2 py-1.5 rounded-lg border border-slate-200 font-bold',
                        children: [
                          e.jsx('option', {
                            value: 'DESCONTAR',
                            children: 'DESCONTAR (quitar stock)'
                          }),
                          e.jsx('option', { value: 'SUMAR', children: 'SUMAR (agregar stock)' })
                        ]
                      })
                    ]
                  }),
                  e.jsx('input', {
                    value: x,
                    onChange: (l) => f(l.target.value),
                    placeholder: 'Observación (opcional)',
                    className: 'w-full px-3 py-2 rounded-xl border border-slate-200'
                  }),
                  y > 0 &&
                    e.jsxs('p', {
                      className: 'text-indigo-600 font-bold',
                      children: [
                        h(y),
                        ' tienen código P/S equivalente: van como recodificación (destino = código nuevo).'
                      ]
                    })
                ]
              }),
            e.jsxs('p', {
              className: 'text-slate-400',
              children: [
                'Quedan como ',
                e.jsx('b', { children: 'PENDIENTE' }),
                ' en el módulo; ahí completas',
                ' ',
                i ? 'partidas y observaciones' : 'origen, destino y partidas',
                ' antes de enviar el correo.'
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: 'flex items-center justify-between gap-2',
          children: [
            e.jsxs(W, {
              to: '/inventory/traspasos',
              className:
                'text-xs font-black text-slate-500 hover:text-orange-600 inline-flex items-center gap-1',
              children: [e.jsx(ue, { size: 13 }), ' Abrir Traspasos y Ajustes']
            }),
            e.jsxs('div', {
              className: 'flex gap-2',
              children: [
                e.jsx('button', {
                  onClick: () => m(!1),
                  className:
                    'px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50',
                  children: 'Cancelar'
                }),
                e.jsxs('button', {
                  onClick: p,
                  disabled: u.isPending,
                  className:
                    'px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 disabled:opacity-50 inline-flex items-center gap-1.5',
                  children: [
                    u.isPending
                      ? e.jsx(O, { size: 13, className: 'animate-spin' })
                      : e.jsx(R, { size: 13 }),
                    ' ',
                    'Enviar'
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  });
}
const Q = { um: '', estado: '', activo: '', dup: '', alerta: '', stock: '' },
  Ae = new Set(['disponible', 'reserva', 'transitoria', 'consignacion', 'stock_total']);
function ne({ rows: a, isLoading: s, conDiagnostico: m, sel: u, setSel: i, onProcesadas: r }) {
  const [o, g] = N.useState(200),
    [c, x] = N.useState(Q),
    [f, y] = N.useState({ col: 'codigo', dir: 1 }),
    p = N.useMemo(
      () => ({
        um: [...new Set(a.map((t) => t.unidad_medida || '—'))].sort(),
        estado: [...new Set(a.map((t) => t.estado))].sort(),
        activo: [...new Set(a.map((t) => t.activo))].sort()
      }),
      [a]
    ),
    l = N.useMemo(() => {
      let t = a;
      (c.um && (t = t.filter((j) => (j.unidad_medida || '—') === c.um)),
        c.estado && (t = t.filter((j) => j.estado === c.estado)),
        c.activo && (t = t.filter((j) => j.activo === c.activo)),
        c.dup && (t = t.filter((j) => (j.duplicado === 'Sí (duplicado)') == (c.dup === 'si'))),
        c.alerta === 'antiguo_disp'
          ? (t = t.filter((j) => j.antiguo_disponible))
          : c.alerta === 'no_activo_stock'
            ? (t = t.filter((j) => j.no_activo_stock))
            : c.alerta === 'anomalia'
              ? (t = t.filter((j) => j.anomalia))
              : c.alerta === 'sin' &&
                (t = t.filter((j) => !j.antiguo_disponible && !j.no_activo_stock && !j.anomalia)),
        c.stock === 'disp'
          ? (t = t.filter((j) => Number(j.disponible) > 0))
          : c.stock === 'con'
            ? (t = t.filter((j) => Number(j.stock_total) > 0))
            : c.stock === 'sin' && (t = t.filter((j) => Number(j.stock_total) === 0)));
      const { col: d, dir: w } = f;
      return [...t].sort((j, E) =>
        Ae.has(d)
          ? (Number(j[d] || 0) - Number(E[d] || 0)) * w
          : String(j[d] ?? '').localeCompare(String(E[d] ?? ''), 'es') * w
      );
    }, [a, c, f]);
  N.useEffect(() => {
    r == null || r(l);
  }, [l, r]);
  const v = N.useMemo(
      () =>
        l.reduce(
          (t, d) => ({
            disponible: t.disponible + Number(d.disponible || 0),
            reserva: t.reserva + Number(d.reserva || 0),
            transitoria: t.transitoria + Number(d.transitoria || 0),
            consignacion: t.consignacion + Number(d.consignacion || 0),
            stock_total: t.stock_total + Number(d.stock_total || 0)
          }),
          { disponible: 0, reserva: 0, transitoria: 0, consignacion: 0, stock_total: 0 }
        ),
      [l]
    ),
    C = l.slice(0, o),
    k = Object.values(c).some(Boolean),
    b = l.length > 0 && l.every((t) => u.has(t.codigo)),
    _ = () =>
      i((t) => {
        const d = new Set(t);
        return (b ? l.forEach((w) => d.delete(w.codigo)) : l.forEach((w) => d.add(w.codigo)), d);
      }),
    T = (t) =>
      i((d) => {
        const w = new Set(d);
        return (w.has(t) ? w.delete(t) : w.add(t), w);
      }),
    S = ({ valor: t, onChange: d, opts: w, label: j }) =>
      e.jsxs('select', {
        value: t,
        onChange: (E) => {
          (d(E.target.value), g(200));
        },
        className: `px-2 py-1.5 rounded-lg border text-[11px] font-bold ${t ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500'}`,
        children: [
          e.jsx('option', { value: '', children: j }),
          w.map(([E, ie]) => e.jsx('option', { value: E, children: ie }, E))
        ]
      }),
    n = ({ col: t, children: d, right: w }) =>
      e.jsxs('th', {
        className: `py-2 pr-2 cursor-pointer select-none whitespace-nowrap hover:text-slate-600 ${w ? 'text-right' : ''}`,
        onClick: () => y((j) => ({ col: t, dir: j.col === t ? -j.dir : 1 })),
        title: 'Ordenar',
        children: [d, f.col === t ? (f.dir === 1 ? ' ▲' : ' ▼') : '']
      });
  return e.jsxs('div', {
    className: 'space-y-2',
    children: [
      a.length > 0 &&
        e.jsxs('div', {
          className: 'flex items-center gap-1.5 flex-wrap',
          children: [
            e.jsx(S, {
              valor: c.estado,
              onChange: (t) => x((d) => ({ ...d, estado: t })),
              label: 'Estado: todos',
              opts: p.estado.map((t) => [t, t])
            }),
            e.jsx(S, {
              valor: c.activo,
              onChange: (t) => x((d) => ({ ...d, activo: t })),
              label: 'Activo: todos',
              opts: p.activo.map((t) => [t, t])
            }),
            e.jsx(S, {
              valor: c.um,
              onChange: (t) => x((d) => ({ ...d, um: t })),
              label: 'UM: todas',
              opts: p.um.map((t) => [t, t])
            }),
            e.jsx(S, {
              valor: c.dup,
              onChange: (t) => x((d) => ({ ...d, dup: t })),
              label: 'Duplicado: todos',
              opts: [
                ['si', 'Con P/S equivalente'],
                ['no', 'Sin equivalente']
              ]
            }),
            e.jsx(S, {
              valor: c.alerta,
              onChange: (t) => x((d) => ({ ...d, alerta: t })),
              label: 'Alertas: todas',
              opts: [
                ['antiguo_disp', '⚠ Antiguo c/Disponible'],
                ['no_activo_stock', '⚠ No activo c/Stock'],
                ['anomalia', '⚠ Anomalía'],
                ['sin', 'Sin alertas']
              ]
            }),
            e.jsx(S, {
              valor: c.stock,
              onChange: (t) => x((d) => ({ ...d, stock: t })),
              label: 'Stock: todo',
              opts: [
                ['disp', 'Con Disponible > 0'],
                ['con', 'Con Stock Total > 0'],
                ['sin', 'Sin stock']
              ]
            }),
            k &&
              e.jsxs('button', {
                onClick: () => {
                  (x(Q), g(200));
                },
                className:
                  'px-2 py-1.5 rounded-lg text-[11px] font-black text-slate-500 hover:text-rose-600 inline-flex items-center gap-1',
                children: [e.jsx(L, { size: 12 }), ' Quitar filtros']
              })
          ]
        }),
      e.jsxs('div', {
        className: 'overflow-x-auto',
        children: [
          s &&
            e.jsx('div', {
              className: 'text-slate-400 text-center py-10',
              children: 'Calculando análisis…'
            }),
          !s &&
            !a.length &&
            e.jsx('div', {
              className: 'text-slate-400 text-center py-10',
              children:
                'Sin resultados. ¿Está cargado el stock? (Resumen → Cargar reporte de stock)'
            }),
          !s &&
            a.length > 0 &&
            !l.length &&
            e.jsx('div', {
              className: 'text-slate-400 text-center py-10',
              children: 'Ningún registro pasa los filtros aplicados.'
            }),
          !s &&
            l.length > 0 &&
            e.jsxs('table', {
              className: 'w-full text-xs',
              children: [
                e.jsx('thead', {
                  children: e.jsxs('tr', {
                    className:
                      'text-left text-slate-400 uppercase tracking-wide border-b border-slate-100',
                    children: [
                      e.jsx('th', {
                        className: 'py-2 pr-2 w-6',
                        children: e.jsx('input', {
                          type: 'checkbox',
                          checked: b,
                          onChange: _,
                          title: 'Seleccionar todo (lo filtrado)'
                        })
                      }),
                      e.jsx(n, { col: 'codigo', children: 'Código' }),
                      e.jsx(n, { col: 'producto', children: 'Producto' }),
                      e.jsx(n, { col: 'unidad_medida', children: 'UM' }),
                      e.jsx(n, { col: 'disponible', right: !0, children: 'Disp.' }),
                      e.jsx(n, { col: 'reserva', right: !0, children: 'Res.' }),
                      e.jsx(n, { col: 'transitoria', right: !0, children: 'Trans.' }),
                      e.jsx(n, { col: 'consignacion', right: !0, children: 'Consig.' }),
                      e.jsx(n, { col: 'stock_total', right: !0, children: 'Total' }),
                      e.jsx(n, { col: 'estado', children: 'Estado' }),
                      e.jsx(n, { col: 'activo', children: 'Activo' }),
                      e.jsx('th', { className: 'py-2 pr-2', children: 'Duplicado / P·S equiv.' }),
                      e.jsx('th', { className: 'py-2', children: m ? 'Diagnóstico' : 'Alertas' })
                    ]
                  })
                }),
                e.jsx('tbody', {
                  children: C.map((t) =>
                    e.jsxs(
                      'tr',
                      {
                        className: `border-b border-slate-50 hover:bg-slate-50/60 ${u.has(t.codigo) ? 'bg-orange-50/60' : ''}`,
                        children: [
                          e.jsx('td', {
                            className: 'py-1.5 pr-2',
                            children: e.jsx('input', {
                              type: 'checkbox',
                              checked: u.has(t.codigo),
                              onChange: () => T(t.codigo)
                            })
                          }),
                          e.jsx('td', {
                            className:
                              'py-1.5 pr-3 font-mono font-bold text-slate-800 whitespace-nowrap',
                            children: t.codigo
                          }),
                          e.jsx('td', {
                            className: 'py-1.5 pr-3 text-slate-600 max-w-[26rem] truncate',
                            title: t.producto || '',
                            children: t.producto || '—'
                          }),
                          e.jsx('td', {
                            className: 'py-1.5 pr-2 text-slate-400',
                            children: t.unidad_medida || ''
                          }),
                          e.jsx('td', {
                            className: `py-1.5 pr-2 text-right font-bold ${Number(t.disponible) > 0 ? 'text-slate-800' : 'text-slate-300'}`,
                            children: h(t.disponible)
                          }),
                          e.jsx('td', {
                            className: 'py-1.5 pr-2 text-right text-slate-500',
                            children: h(t.reserva)
                          }),
                          e.jsx('td', {
                            className: 'py-1.5 pr-2 text-right text-slate-500',
                            children: h(t.transitoria)
                          }),
                          e.jsx('td', {
                            className: 'py-1.5 pr-2 text-right text-slate-500',
                            children: h(t.consignacion)
                          }),
                          e.jsx('td', {
                            className: `py-1.5 pr-2 text-right font-black ${Number(t.stock_total) > 0 ? 'text-slate-900' : 'text-slate-300'}`,
                            children: h(t.stock_total)
                          }),
                          e.jsx('td', {
                            className: 'py-1.5 pr-2',
                            children: e.jsx('span', {
                              className: `inline-block px-1.5 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap ${_e[t.estado] || ''}`,
                              children: t.estado
                            })
                          }),
                          e.jsx('td', {
                            className: 'py-1.5 pr-2',
                            children: e.jsx('span', {
                              className: `inline-block px-1.5 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap ${Ce[t.activo] || ''}`,
                              children: t.activo
                            })
                          }),
                          e.jsx('td', {
                            className: 'py-1.5 pr-2 whitespace-nowrap',
                            children:
                              t.duplicado === 'Sí (duplicado)'
                                ? e.jsxs('span', {
                                    className: 'text-indigo-600 font-bold',
                                    children: [
                                      '→ ',
                                      e.jsx('span', {
                                        className: 'font-mono',
                                        children: t.ps_equivalente
                                      })
                                    ]
                                  })
                                : t.estado === 'Antiguo'
                                  ? e.jsx('span', { className: 'text-slate-300', children: 'No' })
                                  : ''
                          }),
                          e.jsx('td', {
                            className: 'py-1.5',
                            children: m
                              ? e.jsx('span', { className: 'text-amber-700', children: t.anomalia })
                              : e.jsxs('span', {
                                  className: 'flex flex-wrap gap-1',
                                  children: [
                                    t.antiguo_disponible &&
                                      e.jsx('span', {
                                        className:
                                          'px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold',
                                        children: '⚠ Antiguo c/Disp.'
                                      }),
                                    t.no_activo_stock &&
                                      e.jsx('span', {
                                        className:
                                          'px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold',
                                        children: '⚠ No activo c/Stock'
                                      }),
                                    t.anomalia &&
                                      e.jsx('span', {
                                        className:
                                          'px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold',
                                        title: t.anomalia,
                                        children: '⚠ Anomalía'
                                      })
                                  ]
                                })
                          })
                        ]
                      },
                      t.codigo
                    )
                  )
                }),
                e.jsx('tfoot', {
                  children: e.jsxs('tr', {
                    className: 'border-t-2 border-slate-200 font-black text-slate-700',
                    children: [
                      e.jsx('td', { className: 'py-2' }),
                      e.jsxs('td', {
                        className: 'py-2 pr-3',
                        children: ['TOTAL (', h(l.length), ')']
                      }),
                      e.jsx('td', {}),
                      e.jsx('td', {}),
                      e.jsx('td', { className: 'py-2 pr-2 text-right', children: h(v.disponible) }),
                      e.jsx('td', { className: 'py-2 pr-2 text-right', children: h(v.reserva) }),
                      e.jsx('td', {
                        className: 'py-2 pr-2 text-right',
                        children: h(v.transitoria)
                      }),
                      e.jsx('td', {
                        className: 'py-2 pr-2 text-right',
                        children: h(v.consignacion)
                      }),
                      e.jsx('td', {
                        className: 'py-2 pr-2 text-right',
                        children: h(v.stock_total)
                      }),
                      e.jsx('td', { colSpan: 4 })
                    ]
                  })
                })
              ]
            }),
          !s &&
            l.length > o &&
            e.jsx('div', {
              className: 'text-center pt-3',
              children: e.jsxs('button', {
                onClick: () => g((t) => t + 500),
                className:
                  'px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50',
                children: ['Mostrar más (', h(l.length - o), ' restantes)']
              })
            })
        ]
      })
    ]
  });
}
function Te() {
  const [a, s] = N.useState(''),
    [m, u] = N.useState('');
  N.useEffect(() => {
    const p = setTimeout(() => s(m.trim()), 400);
    return () => clearTimeout(p);
  }, [m]);
  const { data: i = q, isLoading: r } = se('todos', a),
    { data: o = {} } = te(),
    [g, c] = N.useState(q),
    [x, f] = N.useState(() => new Set()),
    y = () => {
      const p = i.map(D),
        l = [
          { Categoría: 'Total de códigos', Cantidad: Number(o.total || 0), '% del Total': '100%' },
          {
            Categoría: 'Nuevos con P',
            Cantidad: Number(o.nuevos_p || 0),
            '% del Total': A(o.nuevos_p, o.total)
          },
          {
            Categoría: 'Nuevos con S',
            Cantidad: Number(o.nuevos_s || 0),
            '% del Total': A(o.nuevos_s, o.total)
          },
          {
            Categoría: 'Antiguos (faltan actualizar a P/S)',
            Cantidad: Number(o.antiguos || 0),
            '% del Total': A(o.antiguos, o.total)
          },
          {
            Categoría: 'Antiguos que AÚN tienen Disponible (>0)',
            Cantidad: Number(o.antiguos_disp || 0),
            '% del Total': A(o.antiguos_disp, o.antiguos)
          },
          {
            Categoría: 'Antiguos sin Disponible (solo renombrar)',
            Cantidad: Number(o.antiguos_sin_disp || 0),
            '% del Total': A(o.antiguos_sin_disp, o.antiguos)
          },
          {
            Categoría: 'Antiguos duplicados (descripción ya existe con P/S)',
            Cantidad: Number(o.antiguos_dup || 0),
            '% del Total': A(o.antiguos_dup, o.antiguos)
          },
          {
            Categoría: 'Anomalías (códigos mal escritos)',
            Cantidad: Number(o.anomalias || 0),
            '% del Total': ''
          },
          {
            Categoría: 'Productos activos (Si)',
            Cantidad: Number(o.activos || 0),
            '% del Total': A(o.activos, o.total)
          },
          {
            Categoría: 'Productos no activos (No)',
            Cantidad: Number(o.no_activos || 0),
            '% del Total': A(o.no_activos, o.total)
          },
          {
            Categoría: 'Códigos no encontrados en ACTIVO',
            Cantidad: Number(o.no_encontrados || 0),
            '% del Total': A(o.no_encontrados, o.total)
          },
          {
            Categoría: 'NO activos que AÚN tienen stock',
            Cantidad: Number(o.no_activos_stock || 0),
            '% del Total': A(o.no_activos_stock, o.no_activos)
          }
        ];
      ee({
        filename: 'analisis_codigos',
        sheets: [
          { name: 'Resumen', rows: l },
          { name: 'Detalle', rows: p },
          { name: 'Antiguos con Disponible', rows: i.filter((v) => v.antiguo_disponible).map(D) },
          { name: 'No Activos con Stock', rows: i.filter((v) => v.no_activo_stock).map(D) },
          { name: 'Duplicados', rows: i.filter((v) => v.duplicado === 'Sí (duplicado)').map(D) },
          { name: 'Anomalías', rows: i.filter((v) => v.anomalia).map(D) }
        ]
      });
    };
  return e.jsxs('div', {
    className: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between flex-wrap gap-3',
        children: [
          e.jsxs('h2', {
            className: 'font-black text-slate-900 flex items-center gap-2',
            children: [
              e.jsx(F, { size: 17, className: 'text-orange-500' }),
              ' Detalle completo',
              ' ',
              e.jsxs('span', {
                className: 'text-slate-400 font-bold text-sm',
                children: [
                  '(',
                  g.length !== i.length ? `${h(g.length)} de ${h(i.length)}` : h(i.length),
                  ')'
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsxs('div', {
                className: 'relative',
                children: [
                  e.jsx(Z, {
                    size: 14,
                    className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                  }),
                  e.jsx('input', {
                    value: m,
                    onChange: (p) => u(p.target.value),
                    placeholder: 'Buscar código o producto…',
                    className: 'pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-56'
                  })
                ]
              }),
              e.jsxs('button', {
                onClick: y,
                disabled: !i.length,
                className:
                  'px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 disabled:opacity-40 inline-flex items-center gap-1.5',
                children: [e.jsx(H, { size: 13 }), ' Exportar libro completo (6 hojas)']
              })
            ]
          })
        ]
      }),
      e.jsx(oe, { sel: x, setSel: f, rows: i }),
      e.jsx(ne, { rows: i, isLoading: r, conDiagnostico: !1, sel: x, setSel: f, onProcesadas: c })
    ]
  });
}
export { qe as default };
