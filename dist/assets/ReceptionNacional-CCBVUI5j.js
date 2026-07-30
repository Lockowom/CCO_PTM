import { u as Pe, d as Le, c as ze, j as e } from './query-vendor-B1MP_4YJ.js';
import { r as x } from './react-vendor-C8fdn38R.js';
import { u as Fe, s as A } from './index-DsXGZokt.js';
import { u as Me } from './useRealtimeTable-qFXHl6ee.js';
import { u as $e } from './useBarcodeScanner-Dfikr0QI.js';
import { u as Ue, g as Be } from './animation-vendor-BwUUObbT.js';
import { l as Ge } from './logUpload-BGFBP96J.js';
import {
  f as ae,
  am as Ve,
  P as ue,
  V as fe,
  ar as qe,
  an as ge,
  x as Ke,
  aJ as He,
  a7 as je,
  ab as Xe,
  Q as le,
  aK as Qe,
  ah as Je,
  aL as We,
  at as re,
  ag as Ne,
  aG as Ye,
  X as Ze,
  a1 as es,
  t as b
} from './ui-vendor-D-9zQVt7.js';
import { utils as k, writeFile as we } from './xlsx-B2eTCt_Q.js';
import {
  R as ve,
  B as ss,
  C as ts,
  X as as,
  Y as ls,
  T as ye,
  L as rs,
  g as _e,
  P as os,
  b as ns,
  d as cs
} from './charts-vendor-BPHLCusR.js';
import './supabase-vendor-jY4wIOEF.js';
const ds = ['3-4', '1HCX20', '1HCX40', '2HCX40', 'LCL', 'AEREO'],
  Ce = {
    EN_REVISION: {
      label: 'En Revisión',
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50'
    },
    COMPLETADO: {
      label: 'Completado',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50'
    },
    PENDIENTE: {
      label: 'Pendiente',
      color: 'bg-slate-400',
      textColor: 'text-slate-600',
      bgLight: 'bg-slate-50'
    }
  },
  oe = 1e3;
async function Ee(c) {
  const R = [];
  let I = 0;
  for (;;) {
    const O = I + oe - 1,
      { data: U, error: u } = await A.from('tms_recepcion_items_nacionales')
        .select('id, reff, descripcion, um, cantidad, serie, lote, box, fecha_vencimiento')
        .eq('recepcion_id', c)
        .order('id', { ascending: !0 })
        .range(I, O);
    if (u) throw u;
    const g = U || [];
    if ((R.push(...g), g.length < oe)) break;
    I += oe;
  }
  return R;
}
const ys = () => {
    var me, he, be;
    const { user: c } = Fe(),
      R = Pe(),
      { startScan: I, isScanning: O } = $e(),
      U = x.useRef(null),
      u =
        (c == null ? void 0 : c.rol) === 'ADMIN' ||
        (c == null ? void 0 : c.es_admin_delegado) === !0 ||
        (c == null ? void 0 : c.rol) === 'CONTROL_CALIDAD',
      [g, T] = x.useState('dashboard'),
      [j, q] = x.useState(null),
      [p, D] = x.useState({ search: '', estado: '', desde: '', hasta: '' }),
      [is, xs] = x.useState(!1),
      [m, B] = x.useState(null),
      [n, N] = x.useState({
        fecha_recepcion: new Date().toLocaleDateString('en-CA'),
        proveedor: '',
        oc: '',
        cant_bultos: '',
        pallets_usados: '',
        tipo_contenedor: '3-4',
        notas: ''
      }),
      [d, P] = x.useState([]),
      [f, w] = x.useState({
        reff: '',
        cantidad: 1,
        serie: '',
        lote: '',
        box: '',
        fecha_vencimiento: ''
      }),
      K = 'cco_recepcion_nacional_draft',
      [v, H] = x.useState(null),
      [Q, J] = x.useState(!1),
      [X, W] = x.useState(''),
      [ne, L] = x.useState(!1);
    (x.useEffect(() => {
      var s;
      try {
        const t = localStorage.getItem(K);
        if (t) {
          const a = JSON.parse(t);
          a && (((s = a.items) != null && s.length) || a.header) && H(a);
        }
      } catch {}
    }, []),
      x.useEffect(() => {
        if (g !== 'form' || (j !== null && !ne)) return;
        const s = n || {},
          t =
            (d == null ? void 0 : d.length) > 0 ||
            s.proveedor ||
            s.oc ||
            s.cant_bultos ||
            s.pallets_usados ||
            (s.notas || '').trim();
        try {
          if (t) {
            const a = { header: n, items: d, editingId: j, ts: Date.now() };
            (localStorage.setItem(K, JSON.stringify(a)),
              H(a),
              J(!0),
              W(
                new Date().toLocaleTimeString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              ));
          } else (localStorage.removeItem(K), H(null), J(!1), W(''));
        } catch {}
      }, [n, d, g, j, ne]));
    const ce = () => {
        try {
          localStorage.removeItem(K);
        } catch {}
        (H(null), J(!1), W(''), L(!1));
      },
      Y = () =>
        u ? !0 : (b.error('Solo Control Calidad o Administrador pueden modificar recepciones'), !1),
      Se = () => {
        Y() &&
          v &&
          (N((s) => ({ ...s, ...v.header })),
          P(Array.isArray(v.items) ? v.items : []),
          q(v.editingId ?? null),
          L(!0),
          T('form'));
      },
      G = (s) => (s || '').trim().toUpperCase(),
      Z = x.useMemo(() => {
        const s = {};
        for (const t of d) {
          const a = G(t.serie);
          a && (s[a] = (s[a] || 0) + 1);
        }
        return new Set(Object.keys(s).filter((t) => s[t] > 1));
      }, [d]);
    (Ue(
      () => {
        Be.from(U.current, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          ease: 'power3.out',
          clearProps: 'all'
        });
      },
      { scope: U }
    ),
      x.useEffect(() => {
        g === 'form' && !u && (T('dashboard'), q(null));
      }, [g, u]),
      Me('tms_recepciones_nacionales', [['recepciones_nac']]));
    const { data: z = [], isLoading: ke } = Le({
        queryKey: ['recepciones_nac'],
        queryFn: async () => {
          const { data: s, error: t } = await A.from('tms_recepciones_nacionales')
            .select(
              'id, fecha_recepcion, proveedor, oc, cant_bultos, pallets_usados, tipo_contenedor, estado, notas, items_count, usuario_nombre, created_at, calidad_estado, calidad_folio, calidad_disposicion'
            )
            .order('created_at', { ascending: !1 });
          if (t) throw t;
          return s || [];
        }
      }),
      y = x.useMemo(
        () =>
          z.filter((s) => {
            if (p.search) {
              const t = p.search.toLowerCase();
              if (!(
                (s.proveedor || '').toLowerCase().includes(t) ||
                (s.oc || '').toLowerCase().includes(t)
              ))
                return !1;
            }
            return !(
              (p.estado && s.estado !== p.estado) ||
              (p.desde && s.fecha_recepcion < p.desde) ||
              (p.hasta && s.fecha_recepcion > p.hasta)
            );
          }),
        [z, p]
      ),
      F = !!(p.search || p.estado || p.desde || p.hasta),
      C = x.useMemo(() => {
        const s = y,
          t = s.length,
          a = s.filter((_) => _.estado === 'EN_REVISION').length,
          l = s.filter((_) => _.estado === 'COMPLETADO').length,
          i = s.reduce((_, V) => _ + (V.cant_bultos || 0), 0),
          h = s.reduce((_, V) => _ + (V.pallets_usados || 0), 0),
          S = t > 0 ? (h / t).toFixed(1) : 0,
          M = t > 0 ? Math.round(i / t) : 0,
          r = z.length,
          o = z.reduce((_, V) => _ + (V.pallets_usados || 0), 0),
          te = r > 0 ? (o / r).toFixed(1) : 0;
        return {
          total: t,
          enRevision: a,
          completados: l,
          totalBultos: i,
          totalPallets: h,
          promPallets: S,
          promBultos: M,
          globalTotal: r,
          globalPromPallets: te
        };
      }, [y, z]),
      E = x.useMemo(() => {
        const s = y,
          t = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          a = {};
        (s.forEach((r) => {
          const o = r.proveedor || 'N/A';
          (a[o] || (a[o] = { proveedor: o, bultos: 0, pallets: 0, recepciones: 0, promPallets: 0 }),
            (a[o].bultos += r.cant_bultos || 0),
            (a[o].pallets += r.pallets_usados || 0),
            (a[o].recepciones += 1));
        }),
          Object.values(a).forEach((r) => {
            r.promPallets =
              r.recepciones > 0 ? parseFloat((r.pallets / r.recepciones).toFixed(1)) : 0;
          }));
        const l = Object.values(a)
            .sort((r, o) => o.bultos - r.bultos)
            .slice(0, 10),
          i = {};
        s.forEach((r) => {
          if (!r.fecha_recepcion) return;
          const o = r.fecha_recepcion.slice(0, 7);
          (i[o] || (i[o] = { mes: o, bultos: 0, pallets: 0, recepciones: 0 }),
            (i[o].bultos += r.cant_bultos || 0),
            (i[o].pallets += r.pallets_usados || 0),
            (i[o].recepciones += 1));
        });
        const h = Object.values(i).sort((r, o) => r.mes.localeCompare(o.mes));
        h.forEach((r) => {
          const [o, te] = r.mes.split('-');
          r.label = `${t[parseInt(te) - 1]} ${o.slice(2)}`;
        });
        const S = {};
        s.forEach((r) => {
          const o = r.tipo_contenedor || 'N/A';
          S[o] = (S[o] || 0) + 1;
        });
        const M = Object.entries(S).map(([r, o]) => ({ name: r, value: o }));
        return { porProveedor: l, porMes: h, porTipo: M };
      }, [y]),
      ee = ze({
        mutationFn: async () => {
          if (!u)
            throw new Error('Solo Control Calidad o Administrador pueden guardar recepciones');
          if (!n.proveedor) throw new Error('Proveedor es obligatorio');
          if (d.length === 0) throw new Error('Agrega al menos un ítem');
          let s = j;
          if (j) {
            const { error: l } = await A.from('tms_recepciones_nacionales')
              .update({
                fecha_recepcion: n.fecha_recepcion,
                proveedor: n.proveedor.toUpperCase(),
                oc: n.oc || null,
                cant_bultos: parseInt(n.cant_bultos) || 0,
                pallets_usados: parseInt(n.pallets_usados) || 0,
                tipo_contenedor: n.tipo_contenedor,
                notas: n.notas || null,
                items_count: d.length,
                estado: n.oc ? 'COMPLETADO' : 'EN_REVISION',
                updated_at: new Date().toISOString()
              })
              .eq('id', j);
            if (l) throw l;
            await A.from('tms_recepcion_items_nacionales').delete().eq('recepcion_id', j);
          } else {
            const { data: l, error: i } = await A.from('tms_recepciones_nacionales')
              .insert({
                fecha_recepcion: n.fecha_recepcion,
                proveedor: n.proveedor.toUpperCase(),
                oc: n.oc || null,
                cant_bultos: parseInt(n.cant_bultos) || 0,
                pallets_usados: parseInt(n.pallets_usados) || 0,
                tipo_contenedor: n.tipo_contenedor,
                notas: n.notas || null,
                productos: d.map((h) => h.reff).join(', '),
                cantidades: d.map((h) => h.cantidad).join(', '),
                items_count: d.length,
                estado: n.oc ? 'COMPLETADO' : 'EN_REVISION',
                usuario_nombre:
                  (c == null ? void 0 : c.nombre) || (c == null ? void 0 : c.email) || 'Usuario'
              })
              .select('id')
              .single();
            if (i) throw i;
            s = l.id;
          }
          const t = d.map((l) => ({
              recepcion_id: s,
              reff: l.reff.toUpperCase(),
              descripcion: l.descripcion || null,
              um: l.um || 'UNI',
              cantidad: parseInt(l.cantidad) || 1,
              serie: l.serie || null,
              lote: l.lote || null,
              box: l.box || null,
              fecha_vencimiento: l.fecha_vencimiento || null
            })),
            { error: a } = await A.from('tms_recepcion_items_nacionales').insert(t);
          if (a) throw a;
        },
        onSuccess: (s, t) => {
          (b.success(j ? 'Recepción actualizada' : 'Recepción guardada correctamente'),
            R.invalidateQueries({ queryKey: ['recepciones_nac'] }),
            Ge({
              modulo: 'Recepción Productos Nacionales',
              tablaDestino: 'tms_recepciones_nacionales + tms_recepcion_items_nacionales',
              totalRegistros: d.length + 1,
              nuevos: j ? 0 : d.length + 1,
              actualizados: j ? d.length + 1 : 0,
              usuarioNombre: (c == null ? void 0 : c.nombre) || (c == null ? void 0 : c.email)
            }),
            ce(),
            se(),
            T('dashboard'));
        },
        onError: (s) => {
          b.error('Error: ' + s.message);
        }
      }),
      de = async (s, t) => {
        if (
          Y() &&
          window.confirm(`¿Eliminar la recepción de ${t}? Se borrarán también todos sus ítems.`)
        )
          try {
            const { data: a, error: l } = await A.rpc('eliminar_recepcion_completa', {
              p_id: s,
              p_origen: 'NACIONAL'
            });
            if (l) throw l;
            if (!(a != null && a.ok))
              throw new Error((a == null ? void 0 : a.error) || 'No se pudo eliminar la recepción');
            (b.success(`Recepción de ${t} eliminada`),
              R.invalidateQueries({ queryKey: ['recepciones_nac'] }),
              (m == null ? void 0 : m.id) === s && B(null));
          } catch (a) {
            b.error('Error al eliminar: ' + a.message);
          }
      },
      Ae = () => {
        const s = (f.reff || '').trim().toUpperCase();
        if (!s) {
          b.error('El código REFF es obligatorio');
          return;
        }
        if (parseInt(f.cantidad) <= 0) {
          b.error('La cantidad debe ser mayor a 0');
          return;
        }
        const t = G(f.serie);
        if (t) {
          const l = d.findIndex((i) => G(i.serie) === t);
          if (
            l !== -1 &&
            !window.confirm(`⚠ La serie ${f.serie.trim()} ya está registrada (fila ${l + 1}).

¿Agregarla de todos modos? Quedará marcada como duplicada.`)
          )
            return;
        }
        const a = Date.now();
        (P((l) => [
          ...l,
          { ...f, reff: s, cantidad: parseInt(f.cantidad) || 1, descripcion: '', um: 'UNI', _id: a }
        ]),
          w({ reff: '', cantidad: 1, serie: '', lote: '', box: '', fecha_vencimiento: '' }),
          L(!0),
          b.success('Ítem agregado y guardado ✓', { duration: 1500 }),
          Ie(s)
            .then((l) => {
              l && P((i) => i.map((h) => (h._id === a ? { ...h, descripcion: l } : h)));
            })
            .catch((l) => console.error('[Reception] Falló lookup de descripción:', l)));
      },
      Re = (s) => {
        (P((t) => t.filter((a, l) => l !== s)), L(!0));
      },
      Ie = async (s) => {
        try {
          const { data: t } = await A.from('tms_matriz_codigos')
            .select('producto')
            .eq('codigo_producto', s.toUpperCase())
            .maybeSingle();
          return (t == null ? void 0 : t.producto) || '';
        } catch {
          return '';
        }
      },
      ie = (s) => {
        I({
          onScan: (t) => {
            const a = t.trim();
            (w((l) => ({ ...l, [s]: a })), b.success(`${s.toUpperCase()} escaneado: ${a}`));
          },
          onError: (t) => b.error(t)
        });
      },
      Oe = async (s) => {
        try {
          const t = await Ee(s.id);
          B({ ...s, items: t || [] });
        } catch {
          b.error('Error cargando detalle');
        }
      },
      xe = async (s) => {
        if (Y())
          try {
            const t = await Ee(s.id);
            (N({
              fecha_recepcion: s.fecha_recepcion || new Date().toLocaleDateString('en-CA'),
              proveedor: s.proveedor || '',
              oc: s.oc || '',
              cant_bultos: s.cant_bultos || '',
              pallets_usados: s.pallets_usados || '',
              tipo_contenedor: s.tipo_contenedor || '3-4',
              notas: s.notas || ''
            }),
              P((t || []).map((a) => ({ ...a, _id: a.id }))),
              q(s.id),
              L(!1),
              B(null),
              T('form'));
          } catch {
            b.error('Error cargando datos');
          }
      },
      Te = (s, t) => {
        const a = t.map((r) => ({
            CODIGO: r.reff,
            DESCRIPCION: r.descripcion || '',
            'U.M': r.um || 'UNI',
            CANTIDAD: r.cantidad,
            SERIE: r.serie || '',
            PARTIDA: r.lote || '',
            VENCIMIENTO: r.fecha_vencimiento || ''
          })),
          l = k.book_new(),
          i = k.json_to_sheet(a);
        ((i['!cols'] = [
          { wch: 16 },
          { wch: 50 },
          { wch: 6 },
          { wch: 10 },
          { wch: 16 },
          { wch: 16 }
        ]),
          k.book_append_sheet(l, i, 'Detalle Items'));
        const h = [
            {
              'FECHA RECEPCION': s.fecha_recepcion,
              PROVEEDOR: s.proveedor,
              OC: s.oc || '',
              'CANT BULTOS': s.cant_bultos,
              'PALLETS USADOS': s.pallets_usados,
              'TIPO CONTENEDOR': s.tipo_contenedor,
              ESTADO: s.estado,
              'TOTAL ITEMS': t.length,
              'TOTAL CANTIDAD': t.reduce((r, o) => r + (o.cantidad || 0), 0)
            }
          ],
          S = k.json_to_sheet(h);
        ((S['!cols'] = [
          { wch: 18 },
          { wch: 20 },
          { wch: 14 },
          { wch: 14 },
          { wch: 16 },
          { wch: 18 },
          { wch: 14 },
          { wch: 14 },
          { wch: 16 }
        ]),
          k.book_append_sheet(l, S, 'Resumen'));
        const M = `RecepcionNacional_${s.proveedor}_${s.fecha_recepcion || 'sin-fecha'}.xlsx`;
        (we(l, M), b.success(`Archivo descargado: ${M}`));
      },
      De = () => {
        if (y.length === 0) {
          b.error('No hay recepciones para exportar');
          return;
        }
        const s = y.map((l) => ({
            'FECHA RECEPCION': l.fecha_recepcion,
            PROVEEDOR: l.proveedor,
            OC: l.oc || '',
            'CANT BULTOS': l.cant_bultos || 0,
            'PALLETS USADOS': l.pallets_usados || 0,
            'TIPO CONT': l.tipo_contenedor || '',
            ESTADO: l.estado,
            ITEMS: l.items_count || 0
          })),
          t = k.book_new(),
          a = k.json_to_sheet(s);
        ((a['!cols'] = [
          { wch: 18 },
          { wch: 22 },
          { wch: 14 },
          { wch: 14 },
          { wch: 16 },
          { wch: 12 },
          { wch: 14 },
          { wch: 8 }
        ]),
          k.book_append_sheet(t, a, 'Recepciones'),
          we(t, `Recepciones_Nacionales_${new Date().toLocaleDateString('en-CA')}.xlsx`),
          b.success('Reporte exportado'));
      },
      se = () => {
        (N({
          fecha_recepcion: new Date().toLocaleDateString('en-CA'),
          proveedor: '',
          oc: '',
          cant_bultos: '',
          pallets_usados: '',
          tipo_contenedor: '3-4',
          notas: ''
        }),
          P([]),
          w({ reff: '', cantidad: 1, serie: '', lote: '', box: '', fecha_vencimiento: '' }),
          q(null),
          L(!1));
      },
      pe = (s) => {
        if (!s) return '-';
        const t = s.split('-');
        return `${t[2]}/${t[1]}/${t[0]}`;
      };
    return e.jsxs('div', {
      ref: U,
      className: 'space-y-4 min-h-screen bg-gray-50 p-3 sm:p-5 text-slate-700 pb-20',
      children: [
        e.jsxs('div', {
          className:
            'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white px-4 sm:px-6 py-4 sm:py-5 rounded-lg border border-slate-200 shadow-sm',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsx('div', {
                  className:
                    'w-9 h-9 sm:w-10 sm:h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white flex-shrink-0',
                  children: e.jsx(ae, { size: 18 })
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('h2', {
                      className: 'text-base sm:text-xl font-bold text-slate-800',
                      children: 'Recepción Productos Nacionales'
                    }),
                    e.jsx('p', {
                      className: 'text-[10px] sm:text-xs text-slate-400 mt-0.5',
                      children: 'Nacionales — Revisión y registro'
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex gap-2',
              children: [
                g === 'dashboard' &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs('button', {
                        onClick: De,
                        className:
                          'px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors',
                        children: [e.jsx(Ve, { size: 14 }), ' Exportar']
                      }),
                      u
                        ? e.jsxs('button', {
                            onClick: () => {
                              (se(), T('form'));
                            },
                            className:
                              'px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors',
                            children: [e.jsx(ue, { size: 14 }), ' Nueva Recepción']
                          })
                        : e.jsx('span', {
                            className:
                              'px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold',
                            children: 'Solo lectura'
                          })
                    ]
                  }),
                g === 'form' &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs(
                        'span',
                        {
                          className: `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border ${Q ? 'bg-emerald-50 border-emerald-200 text-emerald-700 anim-saved' : 'bg-slate-50 border-slate-200 text-slate-400'}`,
                          title:
                            'Tu progreso se guarda solo en este dispositivo; puedes recargar o cerrar sin perderlo.',
                          children: [
                            e.jsx(fe, { size: 14 }),
                            ' ',
                            Q ? `Guardado ${X}` : 'Se guardará solo'
                          ]
                        },
                        X
                      ),
                      e.jsxs('button', {
                        onClick: () => {
                          (se(), T('dashboard'));
                        },
                        className:
                          'px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors',
                        children: [e.jsx(qe, { size: 14 }), ' Volver']
                      })
                    ]
                  })
              ]
            })
          ]
        }),
        g === 'dashboard' &&
          e.jsxs(e.Fragment, {
            children: [
              v &&
                u &&
                e.jsxs('div', {
                  className:
                    'flex flex-col sm:flex-row sm:items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3',
                  children: [
                    e.jsxs('div', {
                      className: 'flex-1 min-w-0',
                      children: [
                        e.jsxs('p', {
                          className: 'text-sm font-bold text-amber-800 flex items-center gap-1.5',
                          children: [e.jsx(ge, { size: 15 }), ' Tienes una recepción sin terminar']
                        }),
                        e.jsxs('p', {
                          className: 'text-xs text-amber-700 mt-0.5',
                          children: [
                            ((me = v.items) == null ? void 0 : me.length) || 0,
                            ' ítem(s)',
                            (he = v.header) != null && he.proveedor
                              ? ` · ${v.header.proveedor}`
                              : '',
                            ' — se guardó automáticamente. Puedes continuar donde quedaste.'
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 shrink-0',
                      children: [
                        e.jsx('button', {
                          onClick: Se,
                          className:
                            'px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors',
                          children: 'Continuar'
                        }),
                        e.jsx('button', {
                          onClick: () => {
                            window.confirm(
                              '¿Descartar el borrador guardado? Se perderá lo no registrado.'
                            ) && ce();
                          },
                          className:
                            'px-3 py-2 bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors',
                          children: 'Descartar'
                        })
                      ]
                    })
                  ]
                }),
              e.jsxs('div', {
                className:
                  'grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shadow-sm',
                children: [
                  e.jsx($, {
                    label: 'Recepciones',
                    value: C.total,
                    sub: F ? `de ${C.globalTotal}` : null
                  }),
                  e.jsx($, { label: 'En Revisión', value: C.enRevision, accent: 'text-amber-600' }),
                  e.jsx($, { label: 'Completados', value: C.completados, accent: 'text-teal-600' }),
                  e.jsx($, { label: 'Total Bultos', value: C.totalBultos.toLocaleString() }),
                  e.jsx($, {
                    label: 'Prom. Pallets',
                    value: C.promPallets,
                    accent: 'text-slate-800',
                    sub: F ? `global: ${C.globalPromPallets}` : null
                  }),
                  e.jsx($, { label: 'Prom. Bultos', value: C.promBultos })
                ]
              }),
              e.jsxs('div', {
                className:
                  'flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm',
                children: [
                  e.jsxs('div', {
                    className: 'relative flex-1',
                    children: [
                      e.jsx(Ke, {
                        className: 'absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400',
                        size: 15
                      }),
                      e.jsx('input', {
                        type: 'text',
                        placeholder: 'Buscar proveedor u OC...',
                        value: p.search,
                        onChange: (s) => D((t) => ({ ...t, search: s.target.value })),
                        className:
                          'w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 transition-colors'
                      })
                    ]
                  }),
                  e.jsxs('select', {
                    value: p.estado,
                    onChange: (s) => D((t) => ({ ...t, estado: s.target.value })),
                    className:
                      'px-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400',
                    children: [
                      e.jsx('option', { value: '', children: 'Todos los estados' }),
                      e.jsx('option', { value: 'EN_REVISION', children: 'En Revisión' }),
                      e.jsx('option', { value: 'COMPLETADO', children: 'Completado' }),
                      e.jsx('option', { value: 'PENDIENTE', children: 'Pendiente' })
                    ]
                  }),
                  e.jsx('input', {
                    type: 'date',
                    value: p.desde,
                    onChange: (s) => D((t) => ({ ...t, desde: s.target.value })),
                    className:
                      'px-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400'
                  }),
                  e.jsx('span', {
                    className: 'text-slate-300 text-xs self-center hidden md:block',
                    children: '—'
                  }),
                  e.jsx('input', {
                    type: 'date',
                    value: p.hasta,
                    onChange: (s) => D((t) => ({ ...t, hasta: s.target.value })),
                    className:
                      'px-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400'
                  }),
                  F &&
                    e.jsx('button', {
                      onClick: () => D({ search: '', estado: '', desde: '', hasta: '' }),
                      className:
                        'px-2 py-2 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors whitespace-nowrap',
                      children: 'Limpiar'
                    })
                ]
              }),
              F &&
                e.jsxs('div', {
                  className: 'flex items-center gap-2 text-xs text-slate-500 px-1',
                  children: [
                    e.jsx(He, { size: 12 }),
                    e.jsxs('span', {
                      children: [
                        'Mostrando ',
                        e.jsx('b', { className: 'text-slate-700', children: y.length }),
                        ' de',
                        ' ',
                        z.length,
                        p.search &&
                          e.jsxs('span', {
                            children: [
                              ' ',
                              '· Proveedor: ',
                              e.jsx('b', { className: 'text-slate-700', children: p.search })
                            ]
                          })
                      ]
                    })
                  ]
                }),
              e.jsxs('div', {
                className: 'grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4',
                children: [
                  e.jsxs('div', {
                    className:
                      'lg:col-span-8 bg-white p-3 sm:p-5 rounded-lg border border-slate-200 shadow-sm',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center justify-between mb-4',
                        children: [
                          e.jsx('h3', {
                            className: 'text-sm font-semibold text-slate-700',
                            children: 'Volumen mensual'
                          }),
                          F &&
                            e.jsx('span', {
                              className:
                                'text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded',
                              children: 'Filtrado'
                            })
                        ]
                      }),
                      E.porMes.length > 0
                        ? e.jsx(ve, {
                            width: '100%',
                            height: 240,
                            children: e.jsxs(ss, {
                              data: E.porMes,
                              barGap: 4,
                              barSize: 18,
                              children: [
                                e.jsx(ts, {
                                  strokeDasharray: '3 3',
                                  stroke: '#f1f5f9',
                                  vertical: !1
                                }),
                                e.jsx(as, {
                                  dataKey: 'label',
                                  tick: { fontSize: 11, fill: '#94a3b8' },
                                  axisLine: !1,
                                  tickLine: !1
                                }),
                                e.jsx(ls, {
                                  tick: { fontSize: 11, fill: '#cbd5e1' },
                                  axisLine: !1,
                                  tickLine: !1
                                }),
                                e.jsx(ye, {
                                  contentStyle: {
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0',
                                    fontSize: 12,
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                                  },
                                  cursor: { fill: '#f8fafc' }
                                }),
                                e.jsx(rs, {
                                  wrapperStyle: { fontSize: 11 },
                                  iconType: 'circle',
                                  iconSize: 8
                                }),
                                e.jsx(_e, {
                                  dataKey: 'bultos',
                                  fill: '#0f766e',
                                  name: 'Bultos',
                                  radius: [3, 3, 0, 0]
                                }),
                                e.jsx(_e, {
                                  dataKey: 'pallets',
                                  fill: '#94a3b8',
                                  name: 'Pallets',
                                  radius: [3, 3, 0, 0]
                                })
                              ]
                            })
                          })
                        : e.jsx('div', {
                            className:
                              'h-[240px] flex items-center justify-center text-slate-300 text-sm',
                            children: 'Sin datos'
                          })
                    ]
                  }),
                  e.jsxs('div', {
                    className:
                      'lg:col-span-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm',
                    children: [
                      e.jsx('h3', {
                        className: 'text-sm font-semibold text-slate-700 mb-4',
                        children: 'Tipo contenedor'
                      }),
                      E.porTipo.length > 0
                        ? e.jsx(ve, {
                            width: '100%',
                            height: 240,
                            children: e.jsxs(os, {
                              children: [
                                e.jsx(ns, {
                                  data: E.porTipo,
                                  cx: '50%',
                                  cy: '50%',
                                  innerRadius: 45,
                                  outerRadius: 80,
                                  paddingAngle: 2,
                                  dataKey: 'value',
                                  label: ({ name: s, percent: t }) =>
                                    `${s} ${(t * 100).toFixed(0)}%`,
                                  labelLine: !1,
                                  style: { fontSize: 10, fontWeight: 600 },
                                  children: E.porTipo.map((s, t) =>
                                    e.jsx(
                                      cs,
                                      {
                                        fill: [
                                          '#0f766e',
                                          '#475569',
                                          '#0284c7',
                                          '#d97706',
                                          '#dc2626',
                                          '#7c3aed'
                                        ][t % 6]
                                      },
                                      t
                                    )
                                  )
                                }),
                                e.jsx(ye, {
                                  contentStyle: {
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0',
                                    fontSize: 12
                                  }
                                })
                              ]
                            })
                          })
                        : e.jsx('div', {
                            className:
                              'h-[240px] flex items-center justify-center text-slate-300 text-sm',
                            children: 'Sin datos'
                          })
                    ]
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden',
                children: [
                  e.jsxs('div', {
                    className:
                      'px-5 py-3 border-b border-slate-100 flex items-center justify-between',
                    children: [
                      e.jsx('h3', {
                        className: 'text-sm font-semibold text-slate-700',
                        children: 'Análisis por proveedor'
                      }),
                      F &&
                        e.jsx('span', {
                          className: 'text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded',
                          children: 'Filtrado'
                        })
                    ]
                  }),
                  E.porProveedor.length > 0
                    ? e.jsx('div', {
                        className: 'overflow-x-auto',
                        children: e.jsxs('table', {
                          className: 'w-full text-xs',
                          children: [
                            e.jsx('thead', {
                              children: e.jsxs('tr', {
                                className: 'bg-slate-50 border-b border-slate-200',
                                children: [
                                  e.jsx('th', {
                                    className:
                                      'px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider',
                                    children: 'Proveedor'
                                  }),
                                  e.jsx('th', {
                                    className:
                                      'px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider',
                                    children: 'Recepciones'
                                  }),
                                  e.jsx('th', {
                                    className:
                                      'px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider',
                                    children: 'Bultos'
                                  }),
                                  e.jsx('th', {
                                    className:
                                      'px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider',
                                    children: 'Pallets'
                                  }),
                                  e.jsx('th', {
                                    className:
                                      'px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider',
                                    children: 'Prom. Pallets'
                                  }),
                                  e.jsx('th', {
                                    className:
                                      'px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider w-[200px]',
                                    children: 'Distribución'
                                  })
                                ]
                              })
                            }),
                            e.jsx('tbody', {
                              children: E.porProveedor.map((s, t) => {
                                const a = Math.max(...E.porProveedor.map((i) => i.bultos)),
                                  l = a > 0 ? (s.bultos / a) * 100 : 0;
                                return e.jsxs(
                                  'tr',
                                  {
                                    className: `border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${t % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`,
                                    onClick: () => D((i) => ({ ...i, search: s.proveedor })),
                                    children: [
                                      e.jsx('td', {
                                        className: 'px-4 py-2.5 font-semibold text-slate-800',
                                        children: s.proveedor
                                      }),
                                      e.jsx('td', {
                                        className:
                                          'px-4 py-2.5 text-right text-slate-600 tabular-nums',
                                        children: s.recepciones
                                      }),
                                      e.jsx('td', {
                                        className:
                                          'px-4 py-2.5 text-right font-semibold text-slate-800 tabular-nums',
                                        children: s.bultos.toLocaleString()
                                      }),
                                      e.jsx('td', {
                                        className:
                                          'px-4 py-2.5 text-right text-slate-600 tabular-nums',
                                        children: s.pallets
                                      }),
                                      e.jsx('td', {
                                        className: 'px-4 py-2.5 text-right',
                                        children: e.jsx('span', {
                                          className:
                                            'inline-block bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded',
                                          children: s.promPallets
                                        })
                                      }),
                                      e.jsx('td', {
                                        className: 'px-4 py-2.5',
                                        children: e.jsxs('div', {
                                          className: 'flex items-center gap-2',
                                          children: [
                                            e.jsx('div', {
                                              className:
                                                'flex-1 h-2 bg-slate-100 rounded-full overflow-hidden',
                                              children: e.jsx('div', {
                                                className:
                                                  'h-full bg-teal-600 rounded-full transition-all duration-500',
                                                style: { width: `${l}%` }
                                              })
                                            }),
                                            e.jsxs('span', {
                                              className:
                                                'text-[10px] text-slate-400 w-8 text-right tabular-nums',
                                              children: [Math.round(l), '%']
                                            })
                                          ]
                                        })
                                      })
                                    ]
                                  },
                                  s.proveedor
                                );
                              })
                            })
                          ]
                        })
                      })
                    : e.jsx('div', {
                        className: 'p-8 text-center text-slate-300 text-sm',
                        children: 'Sin datos'
                      })
                ]
              }),
              e.jsxs('div', {
                className: 'bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden',
                children: [
                  e.jsx('div', {
                    className: 'px-5 py-3 border-b border-slate-100',
                    children: e.jsx('h3', {
                      className: 'text-sm font-semibold text-slate-700',
                      children: 'Registro de recepciones'
                    })
                  }),
                  e.jsx('div', {
                    className: 'overflow-x-auto',
                    children: e.jsxs('table', {
                      className: 'w-full text-xs',
                      children: [
                        e.jsx('thead', {
                          children: e.jsxs('tr', {
                            className: 'bg-slate-50 border-b border-slate-200',
                            children: [
                              e.jsx('th', {
                                className:
                                  'px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]',
                                children: 'Fecha'
                              }),
                              e.jsx('th', {
                                className:
                                  'px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider',
                                children: 'Proveedor'
                              }),
                              e.jsx('th', {
                                className:
                                  'px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                                children: 'OC'
                              }),
                              e.jsx('th', {
                                className:
                                  'px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                                children: 'Bultos'
                              }),
                              e.jsx('th', {
                                className:
                                  'px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                                children: 'Pallets'
                              }),
                              e.jsx('th', {
                                className:
                                  'px-4 py-2.5 text-center font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                                children: 'Tipo'
                              }),
                              e.jsx('th', {
                                className:
                                  'px-4 py-2.5 text-center font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                                children: 'Estado'
                              }),
                              e.jsx('th', {
                                className:
                                  'px-4 py-2.5 text-center font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                                children: 'Calidad'
                              }),
                              e.jsx('th', {
                                className:
                                  'px-4 py-2.5 text-center font-semibold text-slate-500 uppercase tracking-wider w-16'
                              })
                            ]
                          })
                        }),
                        e.jsx('tbody', {
                          children: ke
                            ? e.jsx('tr', {
                                children: e.jsxs('td', {
                                  colSpan: 9,
                                  className: 'px-4 py-12 text-center text-slate-300',
                                  children: [
                                    e.jsx(je, { size: 20, className: 'animate-spin mx-auto mb-2' }),
                                    'Cargando...'
                                  ]
                                })
                              })
                            : y.length === 0
                              ? e.jsx('tr', {
                                  children: e.jsx('td', {
                                    colSpan: 9,
                                    className: 'px-4 py-12 text-center text-slate-300',
                                    children: 'Sin resultados'
                                  })
                                })
                              : y.map((s, t) => {
                                  const a = Ce[s.estado] || Ce.PENDIENTE;
                                  return e.jsxs(
                                    'tr',
                                    {
                                      className: `border-b border-slate-100 hover:bg-slate-50 transition-colors ${t % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`,
                                      children: [
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 text-slate-600 tabular-nums whitespace-nowrap',
                                          children: pe(s.fecha_recepcion)
                                        }),
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 font-semibold text-slate-800 max-w-[160px] truncate',
                                          children: s.proveedor
                                        }),
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap',
                                          children:
                                            s.oc ||
                                            e.jsx('span', {
                                              className: 'text-slate-300',
                                              children: '—'
                                            })
                                        }),
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 text-right tabular-nums text-slate-700 whitespace-nowrap',
                                          children: s.cant_bultos || 0
                                        }),
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 text-right tabular-nums text-slate-700 whitespace-nowrap',
                                          children: s.pallets_usados || 0
                                        }),
                                        e.jsx('td', {
                                          className: 'px-4 py-2.5 text-center',
                                          children: e.jsx('span', {
                                            className:
                                              'text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded',
                                            children: s.tipo_contenedor
                                          })
                                        }),
                                        e.jsx('td', {
                                          className: 'px-4 py-2.5 text-center',
                                          children: e.jsx('span', {
                                            className: `text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.estado === 'COMPLETADO' ? 'bg-teal-50 text-teal-700 border border-teal-200' : s.estado === 'EN_REVISION' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`,
                                            children: a.label
                                          })
                                        }),
                                        e.jsx('td', {
                                          className: 'px-4 py-2.5 text-center whitespace-nowrap',
                                          children:
                                            s.calidad_estado === 'CONFORME'
                                              ? e.jsx('span', {
                                                  className:
                                                    'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200',
                                                  title: s.calidad_folio || '',
                                                  children: '✓ Conforme'
                                                })
                                              : s.calidad_estado === 'NO_CONFORME'
                                                ? e.jsx('span', {
                                                    className:
                                                      'text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200',
                                                    title:
                                                      s.calidad_disposicion ||
                                                      s.calidad_folio ||
                                                      '',
                                                    children: '✕ No conforme'
                                                  })
                                                : e.jsx('span', {
                                                    className:
                                                      'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200',
                                                    children: 'Pendiente'
                                                  })
                                        }),
                                        e.jsx('td', {
                                          className: 'px-4 py-2.5 text-center',
                                          children: e.jsxs('div', {
                                            className: 'flex items-center justify-center gap-0.5',
                                            children: [
                                              e.jsx('button', {
                                                onClick: () => Oe(s),
                                                className:
                                                  'p-1 hover:bg-slate-100 rounded transition-colors',
                                                title: 'Ver detalle',
                                                children: e.jsx(Xe, {
                                                  size: 14,
                                                  className: 'text-slate-400 hover:text-slate-600'
                                                })
                                              }),
                                              u &&
                                                e.jsxs(e.Fragment, {
                                                  children: [
                                                    e.jsx('button', {
                                                      onClick: () => xe(s),
                                                      className:
                                                        'p-1 hover:bg-slate-100 rounded transition-colors',
                                                      title: 'Editar',
                                                      children: e.jsx(ae, {
                                                        size: 14,
                                                        className:
                                                          'text-slate-400 hover:text-amber-600'
                                                      })
                                                    }),
                                                    e.jsx('button', {
                                                      onClick: () => de(s.id, s.proveedor),
                                                      className:
                                                        'p-1 hover:bg-red-50 rounded transition-colors',
                                                      title: 'Eliminar',
                                                      children: e.jsx(le, {
                                                        size: 14,
                                                        className:
                                                          'text-slate-400 hover:text-red-500'
                                                      })
                                                    })
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
                        })
                      ]
                    })
                  })
                ]
              })
            ]
          }),
        g === 'form' &&
          e.jsxs('div', {
            className: 'grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6',
            children: [
              e.jsx('div', {
                className: 'xl:col-span-1 space-y-4 sm:space-y-6',
                children: e.jsxs('div', {
                  className: 'bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200',
                  children: [
                    e.jsxs('h3', {
                      className: 'font-black text-slate-900 text-lg mb-5 flex items-center gap-2',
                      children: [
                        e.jsx('span', {
                          className:
                            'w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 text-sm font-black',
                          children: '1'
                        }),
                        'DATOS DE RECEPCIÓN'
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'space-y-4',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsxs('label', {
                              className:
                                'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                              children: [
                                'Fecha Recepción ',
                                e.jsx('span', { className: 'text-red-500', children: '*' })
                              ]
                            }),
                            e.jsxs('div', {
                              className: 'relative',
                              children: [
                                e.jsx(Qe, {
                                  className:
                                    'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
                                  size: 16
                                }),
                                e.jsx('input', {
                                  type: 'date',
                                  value: n.fecha_recepcion,
                                  onChange: (s) =>
                                    N((t) => ({ ...t, fecha_recepcion: s.target.value })),
                                  className:
                                    'w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400',
                                  required: !0
                                })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsxs('label', {
                              className:
                                'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                              children: [
                                'Proveedor ',
                                e.jsx('span', { className: 'text-red-500', children: '*' })
                              ]
                            }),
                            e.jsxs('div', {
                              className: 'relative',
                              children: [
                                e.jsx(Je, {
                                  className:
                                    'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
                                  size: 16
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  value: n.proveedor,
                                  onChange: (s) =>
                                    N((t) => ({ ...t, proveedor: s.target.value.toUpperCase() })),
                                  className:
                                    'w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-400',
                                  placeholder: 'SAIKANG, BCF...',
                                  required: !0
                                })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsxs('label', {
                              className:
                                'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                              children: [
                                'OC ',
                                e.jsx('span', {
                                  className: 'text-amber-500 text-[9px]',
                                  children: '(después de revisión)'
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              className: 'relative',
                              children: [
                                e.jsx(We, {
                                  className:
                                    'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
                                  size: 16
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  value: n.oc,
                                  onChange: (s) => N((t) => ({ ...t, oc: s.target.value })),
                                  className:
                                    'w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400',
                                  placeholder: '21073...'
                                })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          className: 'grid grid-cols-2 gap-3',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsxs('label', {
                                  className:
                                    'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                                  children: [
                                    'Cant Bultos ',
                                    e.jsx('span', { className: 'text-red-500', children: '*' })
                                  ]
                                }),
                                e.jsx('input', {
                                  type: 'number',
                                  value: n.cant_bultos,
                                  onChange: (s) =>
                                    N((t) => ({ ...t, cant_bultos: s.target.value })),
                                  className:
                                    'w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400',
                                  placeholder: '0',
                                  min: '0'
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                                  children: 'Pallets Usados'
                                }),
                                e.jsx('input', {
                                  type: 'number',
                                  value: n.pallets_usados,
                                  onChange: (s) =>
                                    N((t) => ({ ...t, pallets_usados: s.target.value })),
                                  className:
                                    'w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400',
                                  placeholder: '0',
                                  min: '0'
                                })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsx('label', {
                              className:
                                'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                              children: 'Tipo Contenedor'
                            }),
                            e.jsx('select', {
                              value: n.tipo_contenedor,
                              onChange: (s) =>
                                N((t) => ({ ...t, tipo_contenedor: s.target.value })),
                              className:
                                'w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400',
                              children: ds.map((s) => e.jsx('option', { value: s, children: s }, s))
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsx('label', {
                              className:
                                'block text-[10px] font-bold text-slate-500 uppercase mb-1',
                              children: 'Notas'
                            }),
                            e.jsx('textarea', {
                              rows: 2,
                              value: n.notas,
                              onChange: (s) => N((t) => ({ ...t, notas: s.target.value })),
                              className:
                                'w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 resize-none',
                              placeholder: 'Observaciones...'
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              }),
              e.jsxs('div', {
                className: 'xl:col-span-2 space-y-6',
                children: [
                  e.jsxs('div', {
                    className:
                      'bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border-2 border-emerald-200',
                    children: [
                      e.jsxs('h3', {
                        className:
                          'font-black text-slate-900 text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3',
                        children: [
                          e.jsx('span', {
                            className:
                              'w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 text-sm sm:text-base font-black',
                            children: '2'
                          }),
                          'AGREGAR ÍTEMS'
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'mb-5',
                        children: [
                          e.jsxs('label', {
                            className:
                              'block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider',
                            children: [
                              'Código REFF ',
                              e.jsx('span', { className: 'text-red-500', children: '*' })
                            ]
                          }),
                          e.jsx('input', {
                            type: 'text',
                            value: f.reff,
                            onChange: (s) =>
                              w((t) => ({ ...t, reff: s.target.value.toUpperCase() })),
                            className:
                              'w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono font-black uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all',
                            placeholder: 'CMS60D1'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'grid grid-cols-2 gap-5 mb-5',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('label', {
                                className:
                                  'block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider',
                                children: 'Cantidad'
                              }),
                              e.jsx('input', {
                                type: 'number',
                                value: f.cantidad,
                                onChange: (s) => w((t) => ({ ...t, cantidad: s.target.value })),
                                className:
                                  'w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-black outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all',
                                min: '1'
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('label', {
                                className:
                                  'block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider',
                                children: 'Box / Caja'
                              }),
                              e.jsx('input', {
                                type: 'text',
                                value: f.box,
                                onChange: (s) => w((t) => ({ ...t, box: s.target.value })),
                                className:
                                  'w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all',
                                placeholder: 'B1...'
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsx('div', {
                        className: 'border-t-2 border-dashed border-emerald-200 my-6'
                      }),
                      e.jsxs('p', {
                        className:
                          'text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2',
                        children: [e.jsx(re, { size: 14 }), ' CAMPOS CON ESCÁNER DE CÁMARA']
                      }),
                      e.jsxs('div', {
                        className: 'mb-5',
                        children: [
                          e.jsx('label', {
                            className:
                              'block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider',
                            children: 'N° Serie'
                          }),
                          e.jsxs('div', {
                            className: 'flex gap-3',
                            children: [
                              e.jsx('input', {
                                type: 'text',
                                value: f.serie,
                                onChange: (s) => w((t) => ({ ...t, serie: s.target.value })),
                                className:
                                  'flex-1 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all',
                                placeholder: '26010500018...'
                              }),
                              e.jsxs('button', {
                                type: 'button',
                                onClick: () => ie('serie'),
                                disabled: O,
                                className:
                                  'px-5 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 min-w-[120px]',
                                children: [
                                  e.jsx(re, { size: 20 }),
                                  e.jsx('span', {
                                    className: 'hidden sm:inline',
                                    children: 'ESCANEAR'
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'mb-6',
                        children: [
                          e.jsx('label', {
                            className:
                              'block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider',
                            children: 'Lote / Partida'
                          }),
                          e.jsxs('div', {
                            className: 'flex gap-3',
                            children: [
                              e.jsx('input', {
                                type: 'text',
                                value: f.lote,
                                onChange: (s) => w((t) => ({ ...t, lote: s.target.value })),
                                className:
                                  'flex-1 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all',
                                placeholder: 'LOTE-2026...'
                              }),
                              e.jsxs('button', {
                                type: 'button',
                                onClick: () => ie('lote'),
                                disabled: O,
                                className:
                                  'px-5 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 min-w-[120px]',
                                children: [
                                  e.jsx(re, { size: 20 }),
                                  e.jsx('span', {
                                    className: 'hidden sm:inline',
                                    children: 'ESCANEAR'
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'mb-6',
                        children: [
                          e.jsx('label', {
                            className:
                              'block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider',
                            children: 'Fecha de Vencimiento'
                          }),
                          e.jsx('input', {
                            type: 'date',
                            value: f.fecha_vencimiento,
                            onChange: (s) =>
                              w((t) => ({ ...t, fecha_vencimiento: s.target.value })),
                            className:
                              'w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all'
                          })
                        ]
                      }),
                      e.jsxs('button', {
                        type: 'button',
                        onClick: Ae,
                        className:
                          'w-full bg-emerald-50 border-2 border-emerald-400 hover:bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.97] hover:shadow-md',
                        children: [e.jsx(ue, { size: 22 }), ' AGREGAR ÍTEM']
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className:
                      'bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden',
                    children: [
                      e.jsxs('div', {
                        className:
                          'p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50',
                        children: [
                          e.jsxs('h3', {
                            className:
                              'font-black text-slate-900 text-sm flex items-center gap-2 flex-wrap',
                            children: [
                              'ÍTEMS REGISTRADOS',
                              e.jsx('span', {
                                className:
                                  'bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold',
                                children: d.length
                              }),
                              Z.size > 0 &&
                                e.jsxs('span', {
                                  className:
                                    'inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 border border-red-300 rounded-full px-2 py-0.5',
                                  title: 'Hay series repetidas — revísalas (marcadas en rojo)',
                                  children: [
                                    e.jsx(Ne, { size: 12 }),
                                    ' ',
                                    Z.size,
                                    ' serie(s) duplicada(s)'
                                  ]
                                }),
                              Q &&
                                e.jsxs(
                                  'span',
                                  {
                                    className:
                                      'anim-saved inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-full px-2 py-0.5',
                                    title:
                                      'Tu progreso se guarda solo en este dispositivo; puedes recargar sin perderlo',
                                    children: [e.jsx(fe, { size: 12 }), ' Guardado ', X]
                                  },
                                  X
                                )
                            ]
                          }),
                          d.length > 0 &&
                            e.jsxs('span', {
                              className: 'text-xs font-bold text-slate-500',
                              children: [
                                'Total: ',
                                d.reduce((s, t) => s + (parseInt(t.cantidad) || 0), 0),
                                ' unidades'
                              ]
                            })
                        ]
                      }),
                      e.jsx('div', {
                        className: 'max-h-[400px] overflow-y-auto overflow-x-auto',
                        children:
                          d.length === 0
                            ? e.jsxs('div', {
                                className: 'p-8 text-center text-slate-400',
                                children: [
                                  e.jsx(Ye, { size: 40, className: 'mx-auto mb-2 opacity-30' }),
                                  e.jsx('p', { className: 'font-bold', children: 'Sin ítems' }),
                                  e.jsx('p', {
                                    className: 'text-xs',
                                    children: 'Usa el formulario de arriba para agregar productos'
                                  })
                                ]
                              })
                            : e.jsxs('table', {
                                className: 'w-full text-sm min-w-[500px]',
                                children: [
                                  e.jsx('thead', {
                                    children: e.jsxs('tr', {
                                      className: 'bg-emerald-700 text-white text-xs uppercase',
                                      children: [
                                        e.jsx('th', {
                                          className: 'px-2 sm:px-3 py-2 text-left',
                                          children: '#'
                                        }),
                                        e.jsx('th', {
                                          className: 'px-2 sm:px-3 py-2 text-left',
                                          children: 'REFF'
                                        }),
                                        e.jsx('th', {
                                          className: 'px-2 sm:px-3 py-2 text-center',
                                          children: 'Cant'
                                        }),
                                        e.jsx('th', {
                                          className: 'px-2 sm:px-3 py-2 text-left',
                                          children: 'Serie'
                                        }),
                                        e.jsx('th', {
                                          className: 'px-2 sm:px-3 py-2 text-left',
                                          children: 'Lote'
                                        }),
                                        e.jsx('th', {
                                          className: 'px-2 sm:px-3 py-2 text-left',
                                          children: 'Vence'
                                        }),
                                        e.jsx('th', {
                                          className: 'px-2 sm:px-3 py-2 text-left',
                                          children: 'Box'
                                        }),
                                        e.jsx('th', {
                                          className: 'px-2 sm:px-3 py-2 text-center',
                                          children: '-'
                                        })
                                      ]
                                    })
                                  }),
                                  e.jsx('tbody', {
                                    children: d.map((s, t) => {
                                      const a = !!G(s.serie) && Z.has(G(s.serie));
                                      return e.jsxs(
                                        'tr',
                                        {
                                          className: `border-b border-slate-100 ${a ? 'bg-red-50 hover:bg-red-100/70' : t % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}`,
                                          children: [
                                            e.jsx('td', {
                                              className: 'px-3 py-2 text-slate-400 text-xs',
                                              children: t + 1
                                            }),
                                            e.jsx('td', {
                                              className:
                                                'px-3 py-2 font-mono font-bold text-slate-900',
                                              children: s.reff
                                            }),
                                            e.jsx('td', {
                                              className:
                                                'px-3 py-2 text-center font-bold text-emerald-700',
                                              children: s.cantidad
                                            }),
                                            e.jsxs('td', {
                                              className:
                                                'px-3 py-2 font-mono text-xs text-slate-600',
                                              children: [
                                                e.jsx('span', {
                                                  className: a ? 'text-red-700 font-bold' : '',
                                                  children: s.serie || '-'
                                                }),
                                                a &&
                                                  e.jsxs('span', {
                                                    className:
                                                      'ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-black text-red-700 bg-red-100 border border-red-300 rounded px-1 align-middle',
                                                    title: 'Serie repetida en esta recepción',
                                                    children: [e.jsx(Ne, { size: 9 }), ' DUPLICADA']
                                                  })
                                              ]
                                            }),
                                            e.jsx('td', {
                                              className:
                                                'px-3 py-2 font-mono text-xs text-slate-600',
                                              children: s.lote || '-'
                                            }),
                                            e.jsx('td', {
                                              className:
                                                'px-3 py-2 text-xs text-slate-600 whitespace-nowrap',
                                              children: s.fecha_vencimiento || '-'
                                            }),
                                            e.jsx('td', {
                                              className: 'px-3 py-2 text-xs text-slate-600',
                                              children: s.box || '-'
                                            }),
                                            e.jsx('td', {
                                              className: 'px-3 py-2 text-center',
                                              children: e.jsx('button', {
                                                onClick: () => Re(t),
                                                className:
                                                  'p-1 text-slate-400 hover:text-red-500 transition-colors',
                                                children: e.jsx(le, { size: 14 })
                                              })
                                            })
                                          ]
                                        },
                                        s._id || t
                                      );
                                    })
                                  })
                                ]
                              })
                      }),
                      d.length > 0 &&
                        e.jsx('div', {
                          className: 'p-4 border-t border-slate-100 bg-slate-50/50',
                          children:
                            u &&
                            e.jsx('button', {
                              onClick: () => ee.mutate(),
                              disabled: ee.isPending,
                              className:
                                'w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-lg active:scale-[0.98]',
                              children: ee.isPending
                                ? e.jsxs(e.Fragment, {
                                    children: [
                                      e.jsx(je, { size: 22, className: 'animate-spin' }),
                                      ' GUARDANDO...'
                                    ]
                                  })
                                : e.jsxs(e.Fragment, {
                                    children: [
                                      e.jsx(ge, { size: 22 }),
                                      ' ',
                                      j ? 'ACTUALIZAR' : 'GUARDAR',
                                      ' RECEPCIÓN (',
                                      d.length,
                                      ' ítems)'
                                    ]
                                  })
                            })
                        })
                    ]
                  })
                ]
              })
            ]
          }),
        m &&
          e.jsx('div', {
            className: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4',
            onClick: () => B(null),
            children: e.jsxs('div', {
              className:
                'bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden',
              onClick: (s) => s.stopPropagation(),
              children: [
                e.jsxs('div', {
                  className: 'p-4 sm:p-6 bg-slate-800 text-white flex justify-between items-start',
                  children: [
                    e.jsxs('div', {
                      className: 'min-w-0 flex-1',
                      children: [
                        e.jsxs('h3', {
                          className: 'text-lg sm:text-xl font-black truncate',
                          children: ['Recepción — ', m.proveedor]
                        }),
                        e.jsxs('div', {
                          className:
                            'flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-300',
                          children: [
                            e.jsxs('span', { children: ['📅 ', pe(m.fecha_recepcion)] }),
                            m.oc && e.jsxs('span', { children: ['📋 OC: ', m.oc] }),
                            e.jsxs('span', { children: ['📦 ', m.cant_bultos || 0, ' bultos'] }),
                            e.jsxs('span', {
                              children: ['🏗️ ', m.pallets_usados || 0, ' pallets']
                            }),
                            e.jsxs('span', { children: ['🚛 ', m.tipo_contenedor] })
                          ]
                        })
                      ]
                    }),
                    e.jsx('button', {
                      onClick: () => B(null),
                      className: 'p-2 hover:bg-white/10 rounded-lg transition-colors',
                      children: e.jsx(Ze, { size: 20 })
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'p-4 bg-slate-50 border-b border-slate-200 flex gap-3',
                  children: [
                    u &&
                      e.jsxs('button', {
                        onClick: () => xe(m),
                        className:
                          'px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors',
                        children: [e.jsx(ae, { size: 16 }), ' EDITAR']
                      }),
                    e.jsxs('button', {
                      onClick: () => Te(m, m.items),
                      className:
                        'px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors',
                      children: [e.jsx(es, { size: 16 }), ' DESCARGAR EXCEL']
                    }),
                    u &&
                      e.jsxs('button', {
                        onClick: () => de(m.id, m.proveedor),
                        className:
                          'px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ml-auto',
                        children: [e.jsx(le, { size: 16 }), ' ELIMINAR']
                      })
                  ]
                }),
                e.jsx('div', {
                  className: 'overflow-auto max-h-[50vh]',
                  children: e.jsxs('table', {
                    className: 'w-full text-sm',
                    children: [
                      e.jsx('thead', {
                        className: 'sticky top-0',
                        children: e.jsxs('tr', {
                          className: 'bg-purple-800 text-white text-xs uppercase tracking-wider',
                          children: [
                            e.jsx('th', {
                              className: 'px-2 sm:px-4 py-3 text-left font-bold',
                              children: 'CÓDIGO'
                            }),
                            e.jsx('th', {
                              className: 'px-2 sm:px-4 py-3 text-left font-bold',
                              children: 'DESCRIPCIÓN'
                            }),
                            e.jsx('th', {
                              className: 'px-2 sm:px-4 py-3 text-center font-bold',
                              children: 'U.M'
                            }),
                            e.jsx('th', {
                              className: 'px-2 sm:px-4 py-3 text-center font-bold',
                              children: 'CANTIDAD'
                            }),
                            e.jsx('th', {
                              className: 'px-2 sm:px-4 py-3 text-left font-bold',
                              children: 'SERIE'
                            }),
                            e.jsx('th', {
                              className: 'px-2 sm:px-4 py-3 text-left font-bold',
                              children: 'PARTIDA'
                            }),
                            e.jsx('th', {
                              className: 'px-2 sm:px-4 py-3 text-left font-bold',
                              children: 'VENCE'
                            })
                          ]
                        })
                      }),
                      e.jsx('tbody', {
                        children: (m.items || []).map((s, t) =>
                          e.jsxs(
                            'tr',
                            {
                              className: `border-b border-slate-100 ${t % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}`,
                              children: [
                                e.jsx('td', {
                                  className:
                                    'px-2 sm:px-4 py-2.5 font-mono font-bold text-slate-800',
                                  children: s.reff
                                }),
                                e.jsx('td', {
                                  className:
                                    'px-2 sm:px-4 py-2.5 text-slate-600 truncate max-w-[300px]',
                                  children: s.descripcion || '-'
                                }),
                                e.jsx('td', {
                                  className: 'px-2 sm:px-4 py-2.5 text-center text-slate-500',
                                  children: s.um || 'UNI'
                                }),
                                e.jsx('td', {
                                  className:
                                    'px-2 sm:px-4 py-2.5 text-center font-bold text-slate-900',
                                  children: s.cantidad
                                }),
                                e.jsx('td', {
                                  className: 'px-2 sm:px-4 py-2.5 font-mono text-xs text-slate-600',
                                  children: s.serie || ''
                                }),
                                e.jsx('td', {
                                  className: 'px-2 sm:px-4 py-2.5 font-mono text-xs text-slate-600',
                                  children: s.lote || ''
                                }),
                                e.jsx('td', {
                                  className:
                                    'px-2 sm:px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap',
                                  children: s.fecha_vencimiento || ''
                                })
                              ]
                            },
                            s.id || t
                          )
                        )
                      })
                    ]
                  })
                }),
                e.jsxs('div', {
                  className:
                    'p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-sm',
                  children: [
                    e.jsxs('span', {
                      className: 'font-bold text-slate-500',
                      children: [
                        'Total ítems: ',
                        ((be = m.items) == null ? void 0 : be.length) || 0
                      ]
                    }),
                    e.jsxs('span', {
                      className: 'font-bold text-slate-700',
                      children: [
                        'Total cantidad:',
                        ' ',
                        (m.items || []).reduce((s, t) => s + (t.cantidad || 0), 0)
                      ]
                    })
                  ]
                })
              ]
            })
          })
      ]
    });
  },
  $ = ({ label: c, value: R, accent: I, sub: O }) =>
    e.jsxs('div', {
      className: 'bg-white px-2 sm:px-4 py-2.5 sm:py-3 text-center',
      children: [
        e.jsx('p', {
          className:
            'text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1 truncate',
          children: c
        }),
        e.jsx('p', {
          className: `text-lg sm:text-2xl font-bold tabular-nums ${I || 'text-slate-800'}`,
          children: R
        }),
        O &&
          e.jsx('p', { className: 'text-[9px] sm:text-[10px] text-slate-400 mt-0.5', children: O })
      ]
    });
export { ys as default };
