import { u as bt, d as ft, c as gt, j as e } from './query-vendor-BNjBrM5A.js';
import { r as x } from './react-vendor-6aw4XXjH.js';
import { u as jt, s as L } from './index-AbeXgAVI.js';
import { u as Nt } from './useRealtimeTable-CaF3wVA_.js';
import { u as vt } from './useBarcodeScanner-2pV1KTKF.js';
import { u as wt, g as yt } from './animation-vendor-JfdD7EdN.js';
import { l as Ct } from './logUpload-Bf7oQrVJ.js';
import {
  f as fe,
  am as _t,
  P as Ve,
  V as qe,
  ar as Et,
  an as Ge,
  x as St,
  aJ as Rt,
  a7 as He,
  ab as kt,
  Q as ge,
  aK as It,
  ah as Ot,
  aL as At,
  at as je,
  aM as Dt,
  d as Tt,
  ag as Ke,
  aG as Pt,
  X as Lt,
  a1 as Ft,
  t as h
} from './ui-vendor-naG2PYVT.js';
import { utils as S, writeFile as Ne, read as Mt } from './xlsx-B2eTCt_Q.js';
import {
  R as Xe,
  B as Bt,
  C as zt,
  X as $t,
  Y as Ut,
  T as Qe,
  L as Vt,
  g as Ye,
  P as qt,
  b as Gt,
  d as Ht
} from './charts-vendor-7leLLwOT.js';
import './supabase-vendor-4Fjsfb0a.js';
const Kt = ['3-4', '1HCX20', '1HCX40', '2HCX40', 'LCL', 'AEREO'],
  We = {
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
  ve = 500,
  Je = 1e3,
  K = 250,
  we = 250,
  Xt = {
    reff: ['reff', 'codigo', 'codigo reff', 'cod reff', 'cod. reff', 'codigo producto', 'sku'],
    serie: ['serie', 'n serie', 'nserie', 'nro serie', 'numero serie', 'serial'],
    lote: ['lote', 'partida', 'lote partida', 'lotepartida'],
    fecha_vencimiento: [
      'fecha vencimiento',
      'fecha de vencimiento',
      'vencimiento',
      'vence',
      'fecha venc',
      'f venc'
    ],
    box: ['box', 'caja', 'box caja', 'box/caja'],
    cantidad: ['cantidad', 'cant', 'qty']
  },
  Qt = ['serie', 'lote', 'fecha_vencimiento', 'box', 'cantidad', 'reff'],
  Yt = (i) =>
    String(i || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  ye = (i) => {
    const y = String(i ?? '').trim();
    if (!y) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(y)) return y;
    const w = y.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (w) {
      const [, k, u, C] = w,
        _ = `${C.length === 2 ? `20${C}` : C}-${String(u).padStart(2, '0')}-${String(k).padStart(2, '0')}`,
        U = new Date(`${_}T12:00:00`);
      return Number.isNaN(U.getTime()) ? '' : _;
    }
    const R = new Date(y);
    return Number.isNaN(R.getTime()) ? '' : R.toLocaleDateString('en-CA');
  };
async function Wt(i, y) {
  for (let w = 0; w < i.length; w += ve) {
    const R = i
        .slice(w, w + ve)
        .map((u) => ({
          recepcion_id: y,
          reff: u.reff.toUpperCase(),
          descripcion: u.descripcion || null,
          um: u.um || 'UNI',
          cantidad: parseInt(u.cantidad, 10) || 1,
          serie: u.serie || null,
          lote: u.lote || null,
          box: u.box || null,
          fecha_vencimiento: u.fecha_vencimiento || null
        })),
      { error: k } = await L.from('tms_recepcion_items').insert(R);
    if (k) throw new Error(`Falló el bloque ${Math.floor(w / ve) + 1}: ${k.message}`);
  }
}
async function Ze(i) {
  const { count: y, error: w } = await L.from('tms_recepcion_items')
    .select('*', { count: 'exact', head: !0 })
    .eq('recepcion_id', i);
  if (w) throw w;
  const R = [];
  for (let k = 0; k < (y || 0); k += Je) {
    const u = k + Je - 1,
      { data: C, error: O } = await L.from('tms_recepcion_items')
        .select('id, reff, descripcion, um, cantidad, serie, lote, box, fecha_vencimiento')
        .eq('recepcion_id', i)
        .order('id', { ascending: !0 })
        .range(k, u);
    if (O) throw O;
    R.push(...(C || []));
  }
  return R;
}
const xs = () => {
    var Fe, Me, Be;
    const { user: i } = jt(),
      y = bt(),
      { startScan: w, isScanning: R } = vt(),
      k = x.useRef(null),
      u =
        (i == null ? void 0 : i.rol) === 'ADMIN' ||
        (i == null ? void 0 : i.es_admin_delegado) === !0 ||
        (i == null ? void 0 : i.rol) === 'CONTROL_CALIDAD',
      [C, O] = x.useState('dashboard'),
      [_, U] = x.useState(null),
      [f, V] = x.useState({ search: '', estado: '', desde: '', hasta: '' }),
      [Jt, Zt] = x.useState(!1),
      [g, Q] = x.useState(null),
      [p, A] = x.useState({
        fecha_recepcion: new Date().toLocaleDateString('en-CA'),
        proveedor: '',
        oc: '',
        cant_bultos: '',
        pallets_usados: '',
        tipo_contenedor: '3-4',
        notas: ''
      }),
      [c, F] = x.useState([]),
      [m, D] = x.useState({
        reff: '',
        cantidad: 1,
        serie: '',
        lote: '',
        box: '',
        fecha_vencimiento: ''
      }),
      [Ce, _e] = x.useState(!1),
      [le, J] = x.useState(''),
      [Y, oe] = x.useState(null),
      [Ee, Z] = x.useState(!1),
      ne = x.useRef(null),
      et = x.useRef(null),
      [Se, q] = x.useState(K),
      ee = 'cco_recepcion_import_draft',
      [T, te] = x.useState(null),
      [ce, ie] = x.useState(!1),
      [se, de] = x.useState(''),
      [Re, z] = x.useState(!1);
    (x.useEffect(() => {
      var t;
      try {
        const s = localStorage.getItem(ee);
        if (s) {
          const a = JSON.parse(s);
          a && (((t = a.items) != null && t.length) || a.header) && te(a);
        }
      } catch {}
    }, []),
      x.useEffect(() => {
        if (C !== 'form' || (_ !== null && !Re)) return;
        const t = p || {},
          s =
            (c == null ? void 0 : c.length) > 0 ||
            t.proveedor ||
            t.oc ||
            t.cant_bultos ||
            t.pallets_usados ||
            (t.notas || '').trim();
        try {
          if (s) {
            const a = { header: p, items: c, editingId: _, ts: Date.now() };
            (localStorage.setItem(ee, JSON.stringify(a)),
              te(a),
              ie(!0),
              de(
                new Date().toLocaleTimeString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              ));
          } else (localStorage.removeItem(ee), te(null), ie(!1), de(''));
        } catch {}
      }, [p, c, C, _, Re]));
    const ke = () => {
        try {
          localStorage.removeItem(ee);
        } catch {}
        (te(null), ie(!1), de(''), z(!1));
      },
      xe = () =>
        u ? !0 : (h.error('Solo Control Calidad o Administrador pueden modificar recepciones'), !1),
      tt = () => {
        xe() &&
          T &&
          (A((t) => ({ ...t, ...T.header })),
          F(Array.isArray(T.items) ? T.items : []),
          U(T.editingId ?? null),
          z(!0),
          O('form'));
      },
      $ = (t) => (t || '').trim().toUpperCase(),
      st = x.useMemo(() => {
        const t = new Set();
        for (const s of c) {
          const a = $(s.serie);
          a && t.add(a);
        }
        return t;
      }, [c]),
      pe = x.useMemo(() => {
        const t = {};
        for (const s of c) {
          const a = $(s.serie);
          a && (t[a] = (t[a] || 0) + 1);
        }
        return new Set(Object.keys(t).filter((s) => t[s] > 1));
      }, [c]),
      ae = x.useMemo(() => c.slice(0, Math.min(c.length, Se)), [c, Se]);
    (x.useEffect(() => {
      if (c.length === 0) {
        q(K);
        return;
      }
      q((t) => (c.length <= K ? c.length : Math.min(c.length, Math.max(t, K))));
    }, [c.length]),
      wt(
        () => {
          yt.from(k.current, {
            y: 20,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.out',
            clearProps: 'all'
          });
        },
        { scope: k }
      ),
      x.useEffect(() => {
        C === 'form' && !u && (O('dashboard'), U(null));
      }, [C, u]),
      Nt('tms_recepciones', [['recepciones']]));
    const { data: G = [], isLoading: at } = ft({
        queryKey: ['recepciones'],
        queryFn: async () => {
          const { data: t, error: s } = await L.from('tms_recepciones')
            .select(
              'id, fecha_recepcion, proveedor, oc, cant_bultos, pallets_usados, tipo_contenedor, estado, notas, items_count, usuario_nombre, created_at, calidad_estado, calidad_folio, calidad_disposicion'
            )
            .order('created_at', { ascending: !1 });
          if (s) throw s;
          return t || [];
        }
      }),
      P = x.useMemo(
        () =>
          G.filter((t) => {
            if (f.search) {
              const s = f.search.toLowerCase();
              if (!(
                (t.proveedor || '').toLowerCase().includes(s) ||
                (t.oc || '').toLowerCase().includes(s)
              ))
                return !1;
            }
            return !(
              (f.estado && t.estado !== f.estado) ||
              (f.desde && t.fecha_recepcion < f.desde) ||
              (f.hasta && t.fecha_recepcion > f.hasta)
            );
          }),
        [G, f]
      ),
      H = !!(f.search || f.estado || f.desde || f.hasta),
      M = x.useMemo(() => {
        const t = P,
          s = t.length,
          a = t.filter((E) => E.estado === 'EN_REVISION').length,
          r = t.filter((E) => E.estado === 'COMPLETADO').length,
          l = t.reduce((E, v) => E + (v.cant_bultos || 0), 0),
          d = t.reduce((E, v) => E + (v.pallets_usados || 0), 0),
          b = s > 0 ? (d / s).toFixed(1) : 0,
          j = s > 0 ? Math.round(l / s) : 0,
          o = G.length,
          n = G.reduce((E, v) => E + (v.pallets_usados || 0), 0),
          N = o > 0 ? (n / o).toFixed(1) : 0;
        return {
          total: s,
          enRevision: a,
          completados: r,
          totalBultos: l,
          totalPallets: d,
          promPallets: b,
          promBultos: j,
          globalTotal: o,
          globalPromPallets: N
        };
      }, [P, G]),
      B = x.useMemo(() => {
        const t = P,
          s = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          a = {};
        (t.forEach((o) => {
          const n = o.proveedor || 'N/A';
          (a[n] || (a[n] = { proveedor: n, bultos: 0, pallets: 0, recepciones: 0, promPallets: 0 }),
            (a[n].bultos += o.cant_bultos || 0),
            (a[n].pallets += o.pallets_usados || 0),
            (a[n].recepciones += 1));
        }),
          Object.values(a).forEach((o) => {
            o.promPallets =
              o.recepciones > 0 ? parseFloat((o.pallets / o.recepciones).toFixed(1)) : 0;
          }));
        const r = Object.values(a)
            .sort((o, n) => n.bultos - o.bultos)
            .slice(0, 10),
          l = {};
        t.forEach((o) => {
          if (!o.fecha_recepcion) return;
          const n = o.fecha_recepcion.slice(0, 7);
          (l[n] || (l[n] = { mes: n, bultos: 0, pallets: 0, recepciones: 0 }),
            (l[n].bultos += o.cant_bultos || 0),
            (l[n].pallets += o.pallets_usados || 0),
            (l[n].recepciones += 1));
        });
        const d = Object.values(l).sort((o, n) => o.mes.localeCompare(n.mes));
        d.forEach((o) => {
          const [n, N] = o.mes.split('-');
          o.label = `${s[parseInt(N) - 1]} ${n.slice(2)}`;
        });
        const b = {};
        t.forEach((o) => {
          const n = o.tipo_contenedor || 'N/A';
          b[n] = (b[n] || 0) + 1;
        });
        const j = Object.entries(b).map(([o, n]) => ({ name: o, value: n }));
        return { porProveedor: r, porMes: d, porTipo: j };
      }, [P]),
      me = gt({
        mutationFn: async () => {
          if (!u)
            throw new Error('Solo Control Calidad o Administrador pueden guardar recepciones');
          if (!p.proveedor) throw new Error('Proveedor es obligatorio');
          if (c.length === 0) throw new Error('Agrega al menos un ítem');
          let t = _;
          const s = [
              ...new Set(
                c
                  .map((r) =>
                    String(r.reff || '')
                      .trim()
                      .toUpperCase()
                  )
                  .filter(Boolean)
              )
            ].join(', '),
            a = String(c.length);
          if (_) {
            const { error: r } = await L.from('tms_recepciones')
              .update({
                fecha_recepcion: p.fecha_recepcion,
                proveedor: p.proveedor.toUpperCase(),
                oc: p.oc || null,
                cant_bultos: parseInt(p.cant_bultos) || 0,
                pallets_usados: parseInt(p.pallets_usados) || 0,
                tipo_contenedor: p.tipo_contenedor,
                notas: p.notas || null,
                productos: s || null,
                cantidades: a,
                items_count: c.length,
                estado: p.oc ? 'COMPLETADO' : 'EN_REVISION',
                updated_at: new Date().toISOString()
              })
              .eq('id', _);
            if (r) throw r;
            const { error: l } = await L.from('tms_recepcion_items').delete().eq('recepcion_id', _);
            if (l) throw l;
          } else {
            const { data: r, error: l } = await L.from('tms_recepciones')
              .insert({
                fecha_recepcion: p.fecha_recepcion,
                proveedor: p.proveedor.toUpperCase(),
                oc: p.oc || null,
                cant_bultos: parseInt(p.cant_bultos) || 0,
                pallets_usados: parseInt(p.pallets_usados) || 0,
                tipo_contenedor: p.tipo_contenedor,
                notas: p.notas || null,
                productos: s || null,
                cantidades: a,
                items_count: c.length,
                estado: p.oc ? 'COMPLETADO' : 'EN_REVISION',
                usuario_nombre:
                  (i == null ? void 0 : i.nombre) || (i == null ? void 0 : i.email) || 'Usuario'
              })
              .select('id')
              .single();
            if (l) throw l;
            t = r.id;
          }
          await Wt(c, t);
        },
        onSuccess: (t, s) => {
          (h.success(_ ? 'Recepción actualizada' : 'Recepción guardada correctamente'),
            y.invalidateQueries({ queryKey: ['recepciones'] }),
            Ct({
              modulo: 'Recepción Importaciones',
              tablaDestino: 'tms_recepciones + tms_recepcion_items',
              totalRegistros: c.length + 1,
              nuevos: _ ? 0 : c.length + 1,
              actualizados: _ ? c.length + 1 : 0,
              usuarioNombre: (i == null ? void 0 : i.nombre) || (i == null ? void 0 : i.email)
            }),
            ke(),
            ue(),
            O('dashboard'));
        },
        onError: (t) => {
          h.error('Error: ' + t.message);
        }
      }),
      Ie = async (t, s) => {
        if (
          xe() &&
          window.confirm(`¿Eliminar la recepción de ${s}? Se borrarán también todos sus ítems.`)
        )
          try {
            const { data: a, error: r } = await L.rpc('eliminar_recepcion_completa', {
              p_id: t,
              p_origen: 'IMPORTACION'
            });
            if (r) throw r;
            if (!(a != null && a.ok))
              throw new Error((a == null ? void 0 : a.error) || 'No se pudo eliminar la recepción');
            (h.success(`Recepción de ${s} eliminada`),
              y.invalidateQueries({ queryKey: ['recepciones'] }),
              (g == null ? void 0 : g.id) === t && Q(null));
          } catch (a) {
            h.error('Error al eliminar: ' + a.message);
          }
      },
      rt = () => {
        const t = (m.reff || '').trim().toUpperCase();
        if (!t) {
          h.error('El código REFF es obligatorio');
          return;
        }
        if (parseInt(m.cantidad) <= 0) {
          h.error('La cantidad debe ser mayor a 0');
          return;
        }
        const s = $(m.serie);
        if (s) {
          const r = c.findIndex((l) => $(l.serie) === s);
          if (
            r !== -1 &&
            !window.confirm(`⚠ La serie ${m.serie.trim()} ya está registrada (fila ${r + 1}).

¿Agregarla de todos modos? Quedará marcada como duplicada.`)
          )
            return;
        }
        const a = Date.now();
        (F((r) => [
          ...r,
          { ...m, reff: t, cantidad: parseInt(m.cantidad) || 1, descripcion: '', um: 'UNI', _id: a }
        ]),
          D({ reff: '', cantidad: 1, serie: '', lote: '', box: '', fecha_vencimiento: '' }),
          z(!0),
          h.success('Ítem agregado y guardado ✓', { duration: 1500 }),
          De(t)
            .then((r) => {
              r && F((l) => l.map((d) => (d._id === a ? { ...d, descripcion: r } : d)));
            })
            .catch((r) => console.error('[Reception] Falló lookup de descripción:', r)));
      },
      lt = async (t) => {
        const s = [...new Set(t.map((l) => l.reff).filter(Boolean))];
        if (s.length === 0) return;
        const a = await Promise.all(s.map(async (l) => [l, await De(l)])),
          r = Object.fromEntries(a.filter(([, l]) => l));
        Object.keys(r).length !== 0 &&
          F((l) =>
            l.map((d) => (r[d.reff] && !d.descripcion ? { ...d, descripcion: r[d.reff] } : d))
          );
      },
      Oe = async (t) => {
        if (!t.length) return;
        const s = t.reduce((r, l) => {
          const d = $(l.serie);
          return d && st.has(d) ? r + 1 : r;
        }, 0);
        if (
          s > 0 &&
          !window.confirm(`⚠ Se detectaron ${s} serie(s) ya existentes en esta recepción.

¿Quieres agregarlas de todos modos? Quedarán marcadas como duplicadas.`)
        )
          return;
        const a = t.map((r, l) => ({
          _id: Date.now() + l,
          reff: r.reff,
          cantidad: r.cantidad,
          serie: r.serie,
          lote: r.lote,
          box: r.box,
          fecha_vencimiento: r.fecha_vencimiento,
          descripcion: '',
          um: 'UNI'
        }));
        (F((r) => [...r, ...a]),
          z(!0),
          J(''),
          oe({
            added: a.length,
            reffs: [...new Set(a.map((r) => r.reff))].length,
            defaultsApplied: a.filter((r) => r.reff === (m.reff || '').trim().toUpperCase()).length
          }),
          h.success(`${a.length} serie(s) agregadas masivamente ✓`, { duration: 1800 }),
          lt(a).catch((r) => console.error('[Reception] Falló enrichItemsWithDescriptions:', r)));
      },
      ot = (t) => {
        const s = t.currentTarget;
        s.scrollTop + s.clientHeight >= s.scrollHeight - 180 &&
          q((r) => Math.min(c.length, r + we));
      },
      Ae = (t) => {
        const s = (t || [])
          .map((v) =>
            Array.isArray(v) ? v.map((I) => String(I ?? '').trim()) : [String(v ?? '').trim()]
          )
          .filter((v) => v.some((I) => I !== ''));
        if (s.length === 0) return { rows: [], skipped: 0 };
        const a = s[0],
          r = {};
        let l = !1;
        a.forEach((v, I) => {
          const re = Yt(v);
          Object.entries(Xt).forEach(([W, he]) => {
            !r[W] && he.includes(re) && ((r[W] = I), (l = !0));
          });
        });
        const d = l ? s.slice(1) : s,
          b = (m.reff || '').trim().toUpperCase(),
          j = String(m.lote || '').trim(),
          o = String(m.box || '').trim(),
          n = ye(m.fecha_vencimiento);
        let N = 0;
        return {
          rows: d
            .map((v) => {
              const I = (be) => {
                  if (l && r[be] !== void 0) return v[r[be]] || '';
                  const Ue = Qt.indexOf(be);
                  return (Ue >= 0 && v[Ue]) || '';
                },
                re = String(I('serie') || '').trim(),
                W = String(I('reff') || b)
                  .trim()
                  .toUpperCase(),
                he = String(I('lote') || j).trim(),
                ut = String(I('box') || o).trim(),
                ht = ye(I('fecha_vencimiento') || n),
                ze = String(I('cantidad') || '').trim(),
                $e = (ze && parseInt(ze, 10)) || 1;
              return !re || !W
                ? ((N += 1), null)
                : {
                    reff: W,
                    serie: re,
                    lote: he,
                    box: ut,
                    fecha_vencimiento: ht,
                    cantidad: $e > 0 ? $e : 1
                  };
            })
            .filter(Boolean),
          skipped: N
        };
      },
      nt = async (t) => {
        var a, r, l;
        const s = String(t || '').trim();
        if (!s) {
          h.error('Pega las series o sube un archivo antes de procesar');
          return;
        }
        Z(!0);
        try {
          const d = s
              .split(/\r?\n/)
              .map((N) => N.trim())
              .filter(Boolean),
            b =
              (a = d[0]) != null && a.includes('	')
                ? '	'
                : (r = d[0]) != null && r.includes(';')
                  ? ';'
                  : (l = d[0]) != null && l.includes(',')
                    ? ','
                    : null,
            j = d.map((N) => (b ? N.split(b).map((E) => E.trim()) : [N])),
            { rows: o, skipped: n } = Ae(j);
          if (!o.length) {
            h.error('No encontramos series válidas para agregar');
            return;
          }
          (await Oe(o),
            n > 0 &&
              h.warning(`${n} fila(s) fueron omitidas por faltar serie o REFF`, {
                duration: 2200
              }));
        } finally {
          Z(!1);
        }
      },
      ct = async (t) => {
        var s, a, r;
        if (t) {
          Z(!0);
          try {
            let l = [];
            if (/\.(xlsx|xls)$/i.test(t.name)) {
              const j = await t.arrayBuffer(),
                o = Mt(j, { type: 'array' }),
                n = o.Sheets[o.SheetNames[0]];
              l = S.sheet_to_json(n, { header: 1, defval: '' });
            } else {
              const o = (await t.text())
                  .split(/\r?\n/)
                  .map((N) => N.trim())
                  .filter(Boolean),
                n =
                  (s = o[0]) != null && s.includes('	')
                    ? '	'
                    : (a = o[0]) != null && a.includes(';')
                      ? ';'
                      : (r = o[0]) != null && r.includes(',')
                        ? ','
                        : null;
              l = o.map((N) => (n ? N.split(n).map((E) => E.trim()) : [N]));
            }
            const { rows: d, skipped: b } = Ae(l);
            if (!d.length) {
              h.error('El archivo no trae series válidas');
              return;
            }
            (await Oe(d),
              b > 0 &&
                h.warning(`${b} fila(s) del archivo fueron omitidas por faltar serie o REFF`, {
                  duration: 2200
                }));
          } catch (l) {
            h.error(`No se pudo leer el archivo: ${l.message}`);
          } finally {
            (Z(!1), ne.current && (ne.current.value = ''));
          }
        }
      },
      it = () => {
        const t = (m.reff || '').trim().toUpperCase(),
          s = String(m.lote || '').trim(),
          a = String(m.box || '').trim(),
          r = ye(m.fecha_vencimiento),
          l = [
            {
              REFF: t || 'CMS60D1',
              SERIE: '26010500018',
              LOTE: s || 'LOTE-2026-01',
              VENCE: r || '2026-12-31',
              BOX: a || 'B1',
              CANTIDAD: 1
            },
            {
              REFF: t || 'CMS60D1',
              SERIE: '26010500019',
              LOTE: s || 'LOTE-2026-01',
              VENCE: r || '2026-12-31',
              BOX: a || 'B1',
              CANTIDAD: 1
            }
          ],
          d = [
            {
              CAMPO: 'REFF',
              DESCRIPCION:
                'Código del producto. Si todas las filas usan el mismo producto, puedes dejar el REFF base en pantalla y repetirlo aquí para mayor orden.'
            },
            { CAMPO: 'SERIE', DESCRIPCION: 'Número de serie. Obligatorio.' },
            {
              CAMPO: 'LOTE',
              DESCRIPCION: 'Lote o partida. Opcional; si queda vacío, usa el valor del formulario.'
            },
            {
              CAMPO: 'VENCE',
              DESCRIPCION:
                'Fecha de vencimiento en formato YYYY-MM-DD. Opcional; si queda vacío, usa el valor del formulario.'
            },
            {
              CAMPO: 'BOX',
              DESCRIPCION: 'Caja o box. Opcional; si queda vacío, usa el valor del formulario.'
            },
            { CAMPO: 'CANTIDAD', DESCRIPCION: 'Cantidad por fila. Si queda vacío, se toma 1.' }
          ],
          b = S.book_new(),
          j = S.json_to_sheet(l);
        j['!cols'] = [{ wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 10 }];
        const o = S.json_to_sheet(d);
        ((o['!cols'] = [{ wch: 18 }, { wch: 110 }]),
          S.book_append_sheet(b, j, 'MODELO SERIES'),
          S.book_append_sheet(b, o, 'GUIA'));
        const n = `Modelo_Carga_Series_${t || 'REFF_BASE'}.xlsx`;
        (Ne(b, n), h.success(`Modelo descargado: ${n}`));
      },
      dt = (t) => {
        (F((s) => s.filter((a, r) => r !== t)), z(!0));
      },
      De = async (t) => {
        try {
          const { data: s } = await L.from('tms_matriz_codigos')
            .select('producto')
            .eq('codigo_producto', t.toUpperCase())
            .maybeSingle();
          return (s == null ? void 0 : s.producto) || '';
        } catch {
          return '';
        }
      },
      Te = (t) => {
        w({
          onScan: (s) => {
            const a = s.trim();
            (D((r) => ({ ...r, [t]: a })), h.success(`${t.toUpperCase()} escaneado: ${a}`));
          },
          onError: (s) => h.error(s)
        });
      },
      xt = async (t) => {
        try {
          const s = await Ze(t.id);
          Q({ ...t, items: s || [] });
        } catch {
          h.error('Error cargando detalle');
        }
      },
      Pe = async (t) => {
        if (xe())
          try {
            const s = await Ze(t.id);
            (A({
              fecha_recepcion: t.fecha_recepcion || new Date().toLocaleDateString('en-CA'),
              proveedor: t.proveedor || '',
              oc: t.oc || '',
              cant_bultos: t.cant_bultos || '',
              pallets_usados: t.pallets_usados || '',
              tipo_contenedor: t.tipo_contenedor || '3-4',
              notas: t.notas || ''
            }),
              F((s || []).map((a) => ({ ...a, _id: a.id }))),
              q(Math.min((s == null ? void 0 : s.length) || 0, K) || K),
              U(t.id),
              z(!1),
              Q(null),
              O('form'));
          } catch {
            h.error('Error cargando datos');
          }
      },
      pt = (t, s) => {
        const a = s.map((o) => ({
            CODIGO: o.reff,
            DESCRIPCION: o.descripcion || '',
            'U.M': o.um || 'UNI',
            CANTIDAD: o.cantidad,
            SERIE: o.serie || '',
            PARTIDA: o.lote || '',
            VENCIMIENTO: o.fecha_vencimiento || ''
          })),
          r = S.book_new(),
          l = S.json_to_sheet(a);
        ((l['!cols'] = [
          { wch: 16 },
          { wch: 50 },
          { wch: 6 },
          { wch: 10 },
          { wch: 16 },
          { wch: 16 }
        ]),
          S.book_append_sheet(r, l, 'Detalle Items'));
        const d = [
            {
              'FECHA RECEPCION': t.fecha_recepcion,
              PROVEEDOR: t.proveedor,
              OC: t.oc || '',
              'CANT BULTOS': t.cant_bultos,
              'PALLETS USADOS': t.pallets_usados,
              'TIPO CONTENEDOR': t.tipo_contenedor,
              ESTADO: t.estado,
              'TOTAL ITEMS': s.length,
              'TOTAL CANTIDAD': s.reduce((o, n) => o + (n.cantidad || 0), 0)
            }
          ],
          b = S.json_to_sheet(d);
        ((b['!cols'] = [
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
          S.book_append_sheet(r, b, 'Resumen'));
        const j = `Recepcion_${t.proveedor}_${t.fecha_recepcion || 'sin-fecha'}.xlsx`;
        (Ne(r, j), h.success(`Archivo descargado: ${j}`));
      },
      mt = () => {
        if (P.length === 0) {
          h.error('No hay recepciones para exportar');
          return;
        }
        const t = P.map((r) => ({
            'FECHA RECEPCION': r.fecha_recepcion,
            PROVEEDOR: r.proveedor,
            OC: r.oc || '',
            'CANT BULTOS': r.cant_bultos || 0,
            'PALLETS USADOS': r.pallets_usados || 0,
            'TIPO CONT': r.tipo_contenedor || '',
            ESTADO: r.estado,
            ITEMS: r.items_count || 0
          })),
          s = S.book_new(),
          a = S.json_to_sheet(t);
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
          S.book_append_sheet(s, a, 'Recepciones'),
          Ne(s, `Recepciones_${new Date().toLocaleDateString('en-CA')}.xlsx`),
          h.success('Reporte exportado'));
      },
      ue = () => {
        (A({
          fecha_recepcion: new Date().toLocaleDateString('en-CA'),
          proveedor: '',
          oc: '',
          cant_bultos: '',
          pallets_usados: '',
          tipo_contenedor: '3-4',
          notas: ''
        }),
          F([]),
          D({ reff: '', cantidad: 1, serie: '', lote: '', box: '', fecha_vencimiento: '' }),
          J(''),
          oe(null),
          _e(!1),
          U(null),
          z(!1));
      },
      Le = (t) => {
        if (!t) return '-';
        const s = t.split('-');
        return `${s[2]}/${s[1]}/${s[0]}`;
      };
    return e.jsxs('div', {
      ref: k,
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
                  children: e.jsx(fe, { size: 18 })
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('h2', {
                      className: 'text-base sm:text-xl font-bold text-slate-800',
                      children: 'Recepción Importaciones'
                    }),
                    e.jsx('p', {
                      className: 'text-[10px] sm:text-xs text-slate-400 mt-0.5',
                      children: 'Inbound — Revisión y registro'
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex gap-2',
              children: [
                C === 'dashboard' &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs('button', {
                        onClick: mt,
                        className:
                          'px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors',
                        children: [e.jsx(_t, { size: 14 }), ' Exportar']
                      }),
                      u
                        ? e.jsxs('button', {
                            onClick: () => {
                              (ue(), O('form'));
                            },
                            className:
                              'px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors',
                            children: [e.jsx(Ve, { size: 14 }), ' Nueva Recepción']
                          })
                        : e.jsx('span', {
                            className:
                              'px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold',
                            children: 'Solo lectura'
                          })
                    ]
                  }),
                C === 'form' &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs(
                        'span',
                        {
                          className: `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border ${ce ? 'bg-emerald-50 border-emerald-200 text-emerald-700 anim-saved' : 'bg-slate-50 border-slate-200 text-slate-400'}`,
                          title:
                            'Tu progreso se guarda solo en este dispositivo; puedes recargar o cerrar sin perderlo.',
                          children: [
                            e.jsx(qe, { size: 14 }),
                            ' ',
                            ce ? `Guardado ${se}` : 'Se guardará solo'
                          ]
                        },
                        se
                      ),
                      e.jsxs('button', {
                        onClick: () => {
                          (ue(), O('dashboard'));
                        },
                        className:
                          'px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors',
                        children: [e.jsx(Et, { size: 14 }), ' Volver']
                      })
                    ]
                  })
              ]
            })
          ]
        }),
        C === 'dashboard' &&
          e.jsxs(e.Fragment, {
            children: [
              T &&
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
                          children: [e.jsx(Ge, { size: 15 }), ' Tienes una recepción sin terminar']
                        }),
                        e.jsxs('p', {
                          className: 'text-xs text-amber-700 mt-0.5',
                          children: [
                            ((Fe = T.items) == null ? void 0 : Fe.length) || 0,
                            ' ítem(s)',
                            (Me = T.header) != null && Me.proveedor
                              ? ` · ${T.header.proveedor}`
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
                          onClick: tt,
                          className:
                            'px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors',
                          children: 'Continuar'
                        }),
                        e.jsx('button', {
                          onClick: () => {
                            window.confirm(
                              '¿Descartar el borrador guardado? Se perderá lo no registrado.'
                            ) && ke();
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
                  e.jsx(X, {
                    label: 'Recepciones',
                    value: M.total,
                    sub: H ? `de ${M.globalTotal}` : null
                  }),
                  e.jsx(X, { label: 'En Revisión', value: M.enRevision, accent: 'text-amber-600' }),
                  e.jsx(X, { label: 'Completados', value: M.completados, accent: 'text-teal-600' }),
                  e.jsx(X, { label: 'Total Bultos', value: M.totalBultos.toLocaleString() }),
                  e.jsx(X, {
                    label: 'Prom. Pallets',
                    value: M.promPallets,
                    accent: 'text-slate-800',
                    sub: H ? `global: ${M.globalPromPallets}` : null
                  }),
                  e.jsx(X, { label: 'Prom. Bultos', value: M.promBultos })
                ]
              }),
              e.jsxs('div', {
                className:
                  'flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm',
                children: [
                  e.jsxs('div', {
                    className: 'relative flex-1',
                    children: [
                      e.jsx(St, {
                        className: 'absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400',
                        size: 15
                      }),
                      e.jsx('input', {
                        type: 'text',
                        placeholder: 'Buscar proveedor u OC...',
                        value: f.search,
                        onChange: (t) => V((s) => ({ ...s, search: t.target.value })),
                        className:
                          'w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 transition-colors'
                      })
                    ]
                  }),
                  e.jsxs('select', {
                    value: f.estado,
                    onChange: (t) => V((s) => ({ ...s, estado: t.target.value })),
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
                    value: f.desde,
                    onChange: (t) => V((s) => ({ ...s, desde: t.target.value })),
                    className:
                      'px-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400'
                  }),
                  e.jsx('span', {
                    className: 'text-slate-300 text-xs self-center hidden md:block',
                    children: '—'
                  }),
                  e.jsx('input', {
                    type: 'date',
                    value: f.hasta,
                    onChange: (t) => V((s) => ({ ...s, hasta: t.target.value })),
                    className:
                      'px-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400'
                  }),
                  H &&
                    e.jsx('button', {
                      onClick: () => V({ search: '', estado: '', desde: '', hasta: '' }),
                      className:
                        'px-2 py-2 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors whitespace-nowrap',
                      children: 'Limpiar'
                    })
                ]
              }),
              H &&
                e.jsxs('div', {
                  className: 'flex items-center gap-2 text-xs text-slate-500 px-1',
                  children: [
                    e.jsx(Rt, { size: 12 }),
                    e.jsxs('span', {
                      children: [
                        'Mostrando ',
                        e.jsx('b', { className: 'text-slate-700', children: P.length }),
                        ' de',
                        ' ',
                        G.length,
                        f.search &&
                          e.jsxs('span', {
                            children: [
                              ' ',
                              '· Proveedor: ',
                              e.jsx('b', { className: 'text-slate-700', children: f.search })
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
                          H &&
                            e.jsx('span', {
                              className:
                                'text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded',
                              children: 'Filtrado'
                            })
                        ]
                      }),
                      B.porMes.length > 0
                        ? e.jsx(Xe, {
                            width: '100%',
                            height: 240,
                            children: e.jsxs(Bt, {
                              data: B.porMes,
                              barGap: 4,
                              barSize: 18,
                              children: [
                                e.jsx(zt, {
                                  strokeDasharray: '3 3',
                                  stroke: '#f1f5f9',
                                  vertical: !1
                                }),
                                e.jsx($t, {
                                  dataKey: 'label',
                                  tick: { fontSize: 11, fill: '#94a3b8' },
                                  axisLine: !1,
                                  tickLine: !1
                                }),
                                e.jsx(Ut, {
                                  tick: { fontSize: 11, fill: '#cbd5e1' },
                                  axisLine: !1,
                                  tickLine: !1
                                }),
                                e.jsx(Qe, {
                                  contentStyle: {
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0',
                                    fontSize: 12,
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                                  },
                                  cursor: { fill: '#f8fafc' }
                                }),
                                e.jsx(Vt, {
                                  wrapperStyle: { fontSize: 11 },
                                  iconType: 'circle',
                                  iconSize: 8
                                }),
                                e.jsx(Ye, {
                                  dataKey: 'bultos',
                                  fill: '#0f766e',
                                  name: 'Bultos',
                                  radius: [3, 3, 0, 0]
                                }),
                                e.jsx(Ye, {
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
                      B.porTipo.length > 0
                        ? e.jsx(Xe, {
                            width: '100%',
                            height: 240,
                            children: e.jsxs(qt, {
                              children: [
                                e.jsx(Gt, {
                                  data: B.porTipo,
                                  cx: '50%',
                                  cy: '50%',
                                  innerRadius: 45,
                                  outerRadius: 80,
                                  paddingAngle: 2,
                                  dataKey: 'value',
                                  label: ({ name: t, percent: s }) =>
                                    `${t} ${(s * 100).toFixed(0)}%`,
                                  labelLine: !1,
                                  style: { fontSize: 10, fontWeight: 600 },
                                  children: B.porTipo.map((t, s) =>
                                    e.jsx(
                                      Ht,
                                      {
                                        fill: [
                                          '#0f766e',
                                          '#475569',
                                          '#0284c7',
                                          '#d97706',
                                          '#dc2626',
                                          '#7c3aed'
                                        ][s % 6]
                                      },
                                      s
                                    )
                                  )
                                }),
                                e.jsx(Qe, {
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
                      H &&
                        e.jsx('span', {
                          className: 'text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded',
                          children: 'Filtrado'
                        })
                    ]
                  }),
                  B.porProveedor.length > 0
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
                              children: B.porProveedor.map((t, s) => {
                                const a = Math.max(...B.porProveedor.map((l) => l.bultos)),
                                  r = a > 0 ? (t.bultos / a) * 100 : 0;
                                return e.jsxs(
                                  'tr',
                                  {
                                    className: `border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${s % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`,
                                    onClick: () => V((l) => ({ ...l, search: t.proveedor })),
                                    children: [
                                      e.jsx('td', {
                                        className: 'px-4 py-2.5 font-semibold text-slate-800',
                                        children: t.proveedor
                                      }),
                                      e.jsx('td', {
                                        className:
                                          'px-4 py-2.5 text-right text-slate-600 tabular-nums',
                                        children: t.recepciones
                                      }),
                                      e.jsx('td', {
                                        className:
                                          'px-4 py-2.5 text-right font-semibold text-slate-800 tabular-nums',
                                        children: t.bultos.toLocaleString()
                                      }),
                                      e.jsx('td', {
                                        className:
                                          'px-4 py-2.5 text-right text-slate-600 tabular-nums',
                                        children: t.pallets
                                      }),
                                      e.jsx('td', {
                                        className: 'px-4 py-2.5 text-right',
                                        children: e.jsx('span', {
                                          className:
                                            'inline-block bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded',
                                          children: t.promPallets
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
                                                style: { width: `${r}%` }
                                              })
                                            }),
                                            e.jsxs('span', {
                                              className:
                                                'text-[10px] text-slate-400 w-8 text-right tabular-nums',
                                              children: [Math.round(r), '%']
                                            })
                                          ]
                                        })
                                      })
                                    ]
                                  },
                                  t.proveedor
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
                          children: at
                            ? e.jsx('tr', {
                                children: e.jsxs('td', {
                                  colSpan: 9,
                                  className: 'px-4 py-12 text-center text-slate-300',
                                  children: [
                                    e.jsx(He, { size: 20, className: 'animate-spin mx-auto mb-2' }),
                                    'Cargando...'
                                  ]
                                })
                              })
                            : P.length === 0
                              ? e.jsx('tr', {
                                  children: e.jsx('td', {
                                    colSpan: 9,
                                    className: 'px-4 py-12 text-center text-slate-300',
                                    children: 'Sin resultados'
                                  })
                                })
                              : P.map((t, s) => {
                                  const a = We[t.estado] || We.PENDIENTE;
                                  return e.jsxs(
                                    'tr',
                                    {
                                      className: `border-b border-slate-100 hover:bg-slate-50 transition-colors ${s % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`,
                                      children: [
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 text-slate-600 tabular-nums whitespace-nowrap',
                                          children: Le(t.fecha_recepcion)
                                        }),
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 font-semibold text-slate-800 max-w-[160px] truncate',
                                          children: t.proveedor
                                        }),
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap',
                                          children:
                                            t.oc ||
                                            e.jsx('span', {
                                              className: 'text-slate-300',
                                              children: '—'
                                            })
                                        }),
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 text-right tabular-nums text-slate-700 whitespace-nowrap',
                                          children: t.cant_bultos || 0
                                        }),
                                        e.jsx('td', {
                                          className:
                                            'px-4 py-2.5 text-right tabular-nums text-slate-700 whitespace-nowrap',
                                          children: t.pallets_usados || 0
                                        }),
                                        e.jsx('td', {
                                          className: 'px-4 py-2.5 text-center',
                                          children: e.jsx('span', {
                                            className:
                                              'text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded',
                                            children: t.tipo_contenedor
                                          })
                                        }),
                                        e.jsx('td', {
                                          className: 'px-4 py-2.5 text-center',
                                          children: e.jsx('span', {
                                            className: `text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.estado === 'COMPLETADO' ? 'bg-teal-50 text-teal-700 border border-teal-200' : t.estado === 'EN_REVISION' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`,
                                            children: a.label
                                          })
                                        }),
                                        e.jsx('td', {
                                          className: 'px-4 py-2.5 text-center whitespace-nowrap',
                                          children:
                                            t.calidad_estado === 'CONFORME'
                                              ? e.jsx('span', {
                                                  className:
                                                    'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200',
                                                  title: t.calidad_folio || '',
                                                  children: '✓ Conforme'
                                                })
                                              : t.calidad_estado === 'NO_CONFORME'
                                                ? e.jsx('span', {
                                                    className:
                                                      'text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200',
                                                    title:
                                                      t.calidad_disposicion ||
                                                      t.calidad_folio ||
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
                                                onClick: () => xt(t),
                                                className:
                                                  'p-1 hover:bg-slate-100 rounded transition-colors',
                                                title: 'Ver detalle',
                                                children: e.jsx(kt, {
                                                  size: 14,
                                                  className: 'text-slate-400 hover:text-slate-600'
                                                })
                                              }),
                                              u &&
                                                e.jsxs(e.Fragment, {
                                                  children: [
                                                    e.jsx('button', {
                                                      onClick: () => Pe(t),
                                                      className:
                                                        'p-1 hover:bg-slate-100 rounded transition-colors',
                                                      title: 'Editar',
                                                      children: e.jsx(fe, {
                                                        size: 14,
                                                        className:
                                                          'text-slate-400 hover:text-amber-600'
                                                      })
                                                    }),
                                                    e.jsx('button', {
                                                      onClick: () => Ie(t.id, t.proveedor),
                                                      className:
                                                        'p-1 hover:bg-red-50 rounded transition-colors',
                                                      title: 'Eliminar',
                                                      children: e.jsx(ge, {
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
                                    t.id
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
        C === 'form' &&
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
                                e.jsx(It, {
                                  className:
                                    'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
                                  size: 16
                                }),
                                e.jsx('input', {
                                  type: 'date',
                                  value: p.fecha_recepcion,
                                  onChange: (t) =>
                                    A((s) => ({ ...s, fecha_recepcion: t.target.value })),
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
                                e.jsx(Ot, {
                                  className:
                                    'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
                                  size: 16
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  value: p.proveedor,
                                  onChange: (t) =>
                                    A((s) => ({ ...s, proveedor: t.target.value.toUpperCase() })),
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
                                e.jsx(At, {
                                  className:
                                    'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
                                  size: 16
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  value: p.oc,
                                  onChange: (t) => A((s) => ({ ...s, oc: t.target.value })),
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
                                  value: p.cant_bultos,
                                  onChange: (t) =>
                                    A((s) => ({ ...s, cant_bultos: t.target.value })),
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
                                  value: p.pallets_usados,
                                  onChange: (t) =>
                                    A((s) => ({ ...s, pallets_usados: t.target.value })),
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
                              value: p.tipo_contenedor,
                              onChange: (t) =>
                                A((s) => ({ ...s, tipo_contenedor: t.target.value })),
                              className:
                                'w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400',
                              children: Kt.map((t) => e.jsx('option', { value: t, children: t }, t))
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
                              value: p.notas,
                              onChange: (t) => A((s) => ({ ...s, notas: t.target.value })),
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
                            value: m.reff,
                            onChange: (t) =>
                              D((s) => ({ ...s, reff: t.target.value.toUpperCase() })),
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
                                value: m.cantidad,
                                onChange: (t) => D((s) => ({ ...s, cantidad: t.target.value })),
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
                                value: m.box,
                                onChange: (t) => D((s) => ({ ...s, box: t.target.value })),
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
                        children: [e.jsx(je, { size: 14 }), ' CAMPOS CON ESCÁNER DE CÁMARA']
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
                                value: m.serie,
                                onChange: (t) => D((s) => ({ ...s, serie: t.target.value })),
                                className:
                                  'flex-1 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all',
                                placeholder: '26010500018...'
                              }),
                              e.jsxs('button', {
                                type: 'button',
                                onClick: () => Te('serie'),
                                disabled: R,
                                className:
                                  'px-5 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 min-w-[120px]',
                                children: [
                                  e.jsx(je, { size: 20 }),
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
                                value: m.lote,
                                onChange: (t) => D((s) => ({ ...s, lote: t.target.value })),
                                className:
                                  'flex-1 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all',
                                placeholder: 'LOTE-2026...'
                              }),
                              e.jsxs('button', {
                                type: 'button',
                                onClick: () => Te('lote'),
                                disabled: R,
                                className:
                                  'px-5 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 min-w-[120px]',
                                children: [
                                  e.jsx(je, { size: 20 }),
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
                            value: m.fecha_vencimiento,
                            onChange: (t) =>
                              D((s) => ({ ...s, fecha_vencimiento: t.target.value })),
                            className:
                              'w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className:
                          'mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden',
                        children: [
                          e.jsxs('button', {
                            type: 'button',
                            onClick: () => _e((t) => !t),
                            className:
                              'w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-100/80 transition-colors',
                            children: [
                              e.jsxs('div', {
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'text-xs font-black uppercase tracking-wider text-slate-700',
                                    children: 'Carga masiva de series'
                                  }),
                                  e.jsx('div', {
                                    className: 'text-[11px] text-slate-500 mt-1',
                                    children:
                                      'Pega desde Excel o sube un archivo con series. Usa el REFF actual como base y permite también `lote`, `vence`, `box`, `cantidad` y `reff`.'
                                  })
                                ]
                              }),
                              e.jsx('div', {
                                className: 'shrink-0 text-slate-400',
                                children: Ce ? e.jsx(Dt, { size: 18 }) : e.jsx(Tt, { size: 18 })
                              })
                            ]
                          }),
                          Ce &&
                            e.jsxs('div', {
                              className: 'border-t border-slate-200 bg-white p-4 space-y-3',
                              children: [
                                e.jsxs('div', {
                                  className:
                                    'rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] text-emerald-800',
                                  children: [
                                    e.jsx('div', {
                                      className: 'font-black uppercase tracking-wider mb-1',
                                      children: 'Formatos soportados'
                                    }),
                                    e.jsx('div', {
                                      children: '1. Una serie por línea: `26010500018`'
                                    }),
                                    e.jsx('div', {
                                      children:
                                        '2. Varias columnas: `serie | lote | fecha vencimiento | box | cantidad | reff`'
                                    }),
                                    e.jsx('div', {
                                      children:
                                        '3. Con encabezados: `Serie`, `Lote`, `Vence`, `Box`, `Cantidad`, `REFF`'
                                    }),
                                    e.jsx('div', {
                                      children:
                                        '4. Modelo ordenado: descarga el Excel `MODELO SERIES`, complétalo y vuelve a subirlo aquí mismo.'
                                    })
                                  ]
                                }),
                                e.jsxs('div', {
                                  className: 'grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]',
                                  children: [
                                    e.jsxs('div', {
                                      className:
                                        'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2',
                                      children: [
                                        e.jsx('span', {
                                          className:
                                            'font-black text-slate-600 uppercase tracking-wider',
                                          children: 'REFF base'
                                        }),
                                        e.jsx('div', {
                                          className: 'mt-1 font-mono text-slate-800',
                                          children:
                                            m.reff ||
                                            'Debes completar el REFF o incluirlo en el archivo'
                                        })
                                      ]
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2',
                                      children: [
                                        e.jsx('span', {
                                          className:
                                            'font-black text-slate-600 uppercase tracking-wider',
                                          children: 'Defaults heredados'
                                        }),
                                        e.jsxs('div', {
                                          className: 'mt-1 text-slate-600',
                                          children: [
                                            'Lote: ',
                                            m.lote || '—',
                                            ' · Vence:',
                                            ' ',
                                            m.fecha_vencimiento || '—',
                                            ' · Box: ',
                                            m.box || '—'
                                          ]
                                        })
                                      ]
                                    })
                                  ]
                                }),
                                e.jsx('textarea', {
                                  value: le,
                                  onChange: (t) => J(t.target.value),
                                  className:
                                    'w-full min-h-[160px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-mono text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100',
                                  placeholder: `Pega aquí una serie por línea o columnas:
Serie	Lote	Vence	Box	Cantidad
26010500018	LOTE-1	2026-12-31	B1	1`
                                }),
                                e.jsxs('div', {
                                  className:
                                    'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex flex-wrap items-center gap-2',
                                      children: [
                                        e.jsx('button', {
                                          type: 'button',
                                          onClick: () => nt(le),
                                          disabled: Ee,
                                          className:
                                            'px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-colors disabled:opacity-50',
                                          children: Ee
                                            ? 'Procesando...'
                                            : 'Agregar series masivamente'
                                        }),
                                        e.jsx('button', {
                                          type: 'button',
                                          onClick: it,
                                          className:
                                            'px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-sm font-bold text-emerald-700 transition-colors',
                                          children: 'Descargar modelo'
                                        }),
                                        e.jsxs('label', {
                                          className:
                                            'px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors cursor-pointer',
                                          children: [
                                            e.jsx('input', {
                                              ref: ne,
                                              type: 'file',
                                              accept: '.csv,.tsv,.txt,.xlsx,.xls',
                                              className: 'hidden',
                                              onChange: (t) => {
                                                var s;
                                                return ct(
                                                  (s = t.target.files) == null ? void 0 : s[0]
                                                );
                                              }
                                            }),
                                            'Subir archivo'
                                          ]
                                        }),
                                        (le || Y) &&
                                          e.jsx('button', {
                                            type: 'button',
                                            onClick: () => {
                                              (J(''), oe(null));
                                            },
                                            className:
                                              'px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-red-500 transition-colors',
                                            children: 'Limpiar'
                                          })
                                      ]
                                    }),
                                    Y &&
                                      e.jsxs('div', {
                                        className:
                                          'text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2',
                                        children: [
                                          Y.added,
                                          ' serie(s) agregadas · ',
                                          Y.reffs,
                                          ' ',
                                          'REFF únicos · ',
                                          Y.defaultsApplied,
                                          ' usando REFF base'
                                        ]
                                      })
                                  ]
                                })
                              ]
                            })
                        ]
                      }),
                      e.jsxs('button', {
                        type: 'button',
                        onClick: rt,
                        className:
                          'w-full bg-emerald-50 border-2 border-emerald-400 hover:bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.97] hover:shadow-md',
                        children: [e.jsx(Ve, { size: 22 }), ' AGREGAR ÍTEM']
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
                                children: c.length
                              }),
                              pe.size > 0 &&
                                e.jsxs('span', {
                                  className:
                                    'inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 border border-red-300 rounded-full px-2 py-0.5',
                                  title: 'Hay series repetidas — revísalas (marcadas en rojo)',
                                  children: [
                                    e.jsx(Ke, { size: 12 }),
                                    ' ',
                                    pe.size,
                                    ' serie(s) duplicada(s)'
                                  ]
                                }),
                              ce &&
                                e.jsxs(
                                  'span',
                                  {
                                    className:
                                      'anim-saved inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-full px-2 py-0.5',
                                    title:
                                      'Tu progreso se guarda solo en este dispositivo; puedes recargar sin perderlo',
                                    children: [e.jsx(qe, { size: 12 }), ' Guardado ', se]
                                  },
                                  se
                                )
                            ]
                          }),
                          c.length > 0 &&
                            e.jsxs('span', {
                              className: 'text-xs font-bold text-slate-500',
                              children: [
                                'Total: ',
                                c.reduce((t, s) => t + (parseInt(s.cantidad) || 0), 0),
                                ' unidades'
                              ]
                            })
                        ]
                      }),
                      e.jsx('div', {
                        ref: et,
                        onScroll: ot,
                        className: 'max-h-[400px] overflow-y-auto overflow-x-auto',
                        children:
                          c.length === 0
                            ? e.jsxs('div', {
                                className: 'p-8 text-center text-slate-400',
                                children: [
                                  e.jsx(Pt, { size: 40, className: 'mx-auto mb-2 opacity-30' }),
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
                                    children: ae.map((t, s) => {
                                      const a = !!$(t.serie) && pe.has($(t.serie));
                                      return e.jsxs(
                                        'tr',
                                        {
                                          className: `border-b border-slate-100 ${a ? 'bg-red-50 hover:bg-red-100/70' : s % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}`,
                                          children: [
                                            e.jsx('td', {
                                              className: 'px-3 py-2 text-slate-400 text-xs',
                                              children: s + 1
                                            }),
                                            e.jsx('td', {
                                              className:
                                                'px-3 py-2 font-mono font-bold text-slate-900',
                                              children: t.reff
                                            }),
                                            e.jsx('td', {
                                              className:
                                                'px-3 py-2 text-center font-bold text-emerald-700',
                                              children: t.cantidad
                                            }),
                                            e.jsxs('td', {
                                              className:
                                                'px-3 py-2 font-mono text-xs text-slate-600',
                                              children: [
                                                e.jsx('span', {
                                                  className: a ? 'text-red-700 font-bold' : '',
                                                  children: t.serie || '-'
                                                }),
                                                a &&
                                                  e.jsxs('span', {
                                                    className:
                                                      'ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-black text-red-700 bg-red-100 border border-red-300 rounded px-1 align-middle',
                                                    title: 'Serie repetida en esta recepción',
                                                    children: [e.jsx(Ke, { size: 9 }), ' DUPLICADA']
                                                  })
                                              ]
                                            }),
                                            e.jsx('td', {
                                              className:
                                                'px-3 py-2 font-mono text-xs text-slate-600',
                                              children: t.lote || '-'
                                            }),
                                            e.jsx('td', {
                                              className:
                                                'px-3 py-2 text-xs text-slate-600 whitespace-nowrap',
                                              children: t.fecha_vencimiento || '-'
                                            }),
                                            e.jsx('td', {
                                              className: 'px-3 py-2 text-xs text-slate-600',
                                              children: t.box || '-'
                                            }),
                                            e.jsx('td', {
                                              className: 'px-3 py-2 text-center',
                                              children: e.jsx('button', {
                                                onClick: () => dt(s),
                                                className:
                                                  'p-1 text-slate-400 hover:text-red-500 transition-colors',
                                                children: e.jsx(ge, { size: 14 })
                                              })
                                            })
                                          ]
                                        },
                                        t._id || s
                                      );
                                    })
                                  })
                                ]
                              })
                      }),
                      c.length > ae.length &&
                        e.jsxs('div', {
                          className:
                            'px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 flex items-center justify-between gap-3',
                          children: [
                            e.jsxs('span', {
                              children: ['Mostrando ', ae.length, ' de ', c.length, ' ítems']
                            }),
                            e.jsxs('button', {
                              type: 'button',
                              onClick: () => q((t) => Math.min(c.length, t + we)),
                              className:
                                'text-emerald-700 hover:text-emerald-800 transition-colors',
                              children: ['Cargar ', Math.min(we, c.length - ae.length), ' más']
                            }),
                            e.jsxs('button', {
                              type: 'button',
                              onClick: () => q(c.length),
                              className: 'text-slate-600 hover:text-slate-900 transition-colors',
                              children: ['Mostrar todas (', c.length, ')']
                            })
                          ]
                        }),
                      c.length > 0 &&
                        u &&
                        e.jsx('div', {
                          className: 'p-4 border-t border-slate-100 bg-slate-50/50',
                          children: e.jsx('button', {
                            onClick: () => me.mutate(),
                            disabled: me.isPending,
                            className:
                              'w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-lg active:scale-[0.98]',
                            children: me.isPending
                              ? e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx(He, { size: 22, className: 'animate-spin' }),
                                    ' GUARDANDO...'
                                  ]
                                })
                              : e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx(Ge, { size: 22 }),
                                    ' ',
                                    _ ? 'ACTUALIZAR' : 'GUARDAR',
                                    ' RECEPCIÓN (',
                                    c.length,
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
        g &&
          e.jsx('div', {
            className: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4',
            onClick: () => Q(null),
            children: e.jsxs('div', {
              className:
                'bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden',
              onClick: (t) => t.stopPropagation(),
              children: [
                e.jsxs('div', {
                  className: 'p-4 sm:p-6 bg-slate-800 text-white flex justify-between items-start',
                  children: [
                    e.jsxs('div', {
                      className: 'min-w-0 flex-1',
                      children: [
                        e.jsxs('h3', {
                          className: 'text-lg sm:text-xl font-black truncate',
                          children: ['Recepción — ', g.proveedor]
                        }),
                        e.jsxs('div', {
                          className:
                            'flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-300',
                          children: [
                            e.jsxs('span', { children: ['📅 ', Le(g.fecha_recepcion)] }),
                            g.oc && e.jsxs('span', { children: ['📋 OC: ', g.oc] }),
                            e.jsxs('span', { children: ['📦 ', g.cant_bultos || 0, ' bultos'] }),
                            e.jsxs('span', {
                              children: ['🏗️ ', g.pallets_usados || 0, ' pallets']
                            }),
                            e.jsxs('span', { children: ['🚛 ', g.tipo_contenedor] })
                          ]
                        })
                      ]
                    }),
                    e.jsx('button', {
                      onClick: () => Q(null),
                      className: 'p-2 hover:bg-white/10 rounded-lg transition-colors',
                      children: e.jsx(Lt, { size: 20 })
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'p-4 bg-slate-50 border-b border-slate-200 flex gap-3',
                  children: [
                    u &&
                      e.jsxs('button', {
                        onClick: () => Pe(g),
                        className:
                          'px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors',
                        children: [e.jsx(fe, { size: 16 }), ' EDITAR']
                      }),
                    e.jsxs('button', {
                      onClick: () => pt(g, g.items),
                      className:
                        'px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors',
                      children: [e.jsx(Ft, { size: 16 }), ' DESCARGAR EXCEL']
                    }),
                    u &&
                      e.jsxs('button', {
                        onClick: () => Ie(g.id, g.proveedor),
                        className:
                          'px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ml-auto',
                        children: [e.jsx(ge, { size: 16 }), ' ELIMINAR']
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
                        children: (g.items || []).map((t, s) =>
                          e.jsxs(
                            'tr',
                            {
                              className: `border-b border-slate-100 ${s % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}`,
                              children: [
                                e.jsx('td', {
                                  className:
                                    'px-2 sm:px-4 py-2.5 font-mono font-bold text-slate-800',
                                  children: t.reff
                                }),
                                e.jsx('td', {
                                  className:
                                    'px-2 sm:px-4 py-2.5 text-slate-600 truncate max-w-[300px]',
                                  children: t.descripcion || '-'
                                }),
                                e.jsx('td', {
                                  className: 'px-2 sm:px-4 py-2.5 text-center text-slate-500',
                                  children: t.um || 'UNI'
                                }),
                                e.jsx('td', {
                                  className:
                                    'px-2 sm:px-4 py-2.5 text-center font-bold text-slate-900',
                                  children: t.cantidad
                                }),
                                e.jsx('td', {
                                  className: 'px-2 sm:px-4 py-2.5 font-mono text-xs text-slate-600',
                                  children: t.serie || ''
                                }),
                                e.jsx('td', {
                                  className: 'px-2 sm:px-4 py-2.5 font-mono text-xs text-slate-600',
                                  children: t.lote || ''
                                }),
                                e.jsx('td', {
                                  className:
                                    'px-2 sm:px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap',
                                  children: t.fecha_vencimiento || ''
                                })
                              ]
                            },
                            t.id || s
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
                        ((Be = g.items) == null ? void 0 : Be.length) || 0
                      ]
                    }),
                    e.jsxs('span', {
                      className: 'font-bold text-slate-700',
                      children: [
                        'Total cantidad:',
                        ' ',
                        (g.items || []).reduce((t, s) => t + (s.cantidad || 0), 0)
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
  X = ({ label: i, value: y, accent: w, sub: R }) =>
    e.jsxs('div', {
      className: 'bg-white px-2 sm:px-4 py-2.5 sm:py-3 text-center',
      children: [
        e.jsx('p', {
          className:
            'text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1 truncate',
          children: i
        }),
        e.jsx('p', {
          className: `text-lg sm:text-2xl font-bold tabular-nums ${w || 'text-slate-800'}`,
          children: y
        }),
        R &&
          e.jsx('p', { className: 'text-[9px] sm:text-[10px] text-slate-400 mt-0.5', children: R })
      ]
    });
export { xs as default };
