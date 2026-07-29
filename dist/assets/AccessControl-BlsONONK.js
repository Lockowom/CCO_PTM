import { u as Ss, d as Ee, c as Re, j as e } from './query-vendor-CojWQiBV.js';
import { s as F, y as zs, A as ss, z as is, u as Ke } from './index-CMd8_LWN.js';
import { r as n, R as Q, e as Gs, u as Vs } from './react-vendor-CA7EHQ1X.js';
import {
  u as Bs,
  K as W,
  R as re,
  bs as Ks,
  bR as As,
  bS as ze,
  bT as He,
  a as me,
  $ as ns,
  z as Fe,
  aU as Js,
  bU as Qs,
  bV as Es,
  bW as Rs,
  Y as le,
  a9 as Ne,
  bX as Oe,
  bK as qe,
  bY as Ge,
  J as Ve,
  bZ as Be,
  X as cs,
  b_ as Ws,
  aD as Hs,
  aE as Ys,
  ah as Ps,
  t as b,
  W as Xs,
  g as Zs,
  N as xe,
  P as B,
  L as as,
  o as ts,
  aK as ea,
  c as Je,
  E as sa,
  F as aa,
  b$ as ta,
  j as la,
  af as ra,
  D as oa,
  bz as ia,
  a$ as na,
  a8 as $s,
  c0 as ca,
  G as da,
  c1 as Is,
  e as xa,
  c2 as ds,
  d as Ms,
  aL as Ds,
  aT as ma,
  b7 as Ts,
  c3 as Os,
  aC as pa,
  ak as ua,
  bH as ba,
  c4 as ls,
  aF as ga,
  b5 as qs,
  c5 as Ls,
  aO as rs,
  c6 as os,
  S as ha,
  V as ja,
  s as va
} from './ui-vendor-C7KFTQPV.js';
import {
  r as Us,
  l as Fs,
  c as xs,
  a as fa,
  b as Na,
  s as wa,
  f as ya,
  d as _a,
  e as ka,
  p as Ca,
  g as Sa,
  h as za,
  i as Aa,
  t as Ea,
  j as Ra,
  k as Pa,
  m as $a,
  n as Ia,
  o as Ma,
  q as Da,
  u as Ta,
  v as Oa,
  w as qa,
  x as La,
  y as ms,
  z as Ua,
  A as Fa,
  B as ps,
  C as Ga,
  D as Va,
  E as Ba,
  F as Ka,
  G as Ja,
  H as Qa,
  I as Wa,
  J as us,
  K as Ha
} from './iamService-CRibdE6t.js';
import './supabase-vendor-jY4wIOEF.js';
const bs = { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' },
  gs = { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' },
  hs = { background: '#1e293b', border: '1px solid #f59e0b', color: '#f8fafc' },
  js = (r) => {
    if (!r) return 'Nunca';
    const c = new Date(r);
    if (isNaN(c.getTime())) return '—';
    const p = Math.floor((Date.now() - c.getTime()) / 6e4);
    if (p < 1) return 'Ahora';
    if (p < 60) return `hace ${p} min`;
    const u = Math.floor(p / 60);
    if (u < 24) return `hace ${u} h`;
    const l = Math.floor(u / 24);
    return l < 30 ? `hace ${l} d` : c.toLocaleDateString('es-CL');
  },
  Ya = ({ embedded: r = !1 }) => {
    const c = Ss(),
      p = n.useRef(null),
      u = n.useRef(null),
      [l, m] = n.useState(''),
      [w, i] = n.useState(''),
      [h, S] = n.useState(''),
      [k, d] = n.useState('recientes'),
      [_, x] = n.useState('cards'),
      [y, I] = n.useState(() => new Set()),
      [O, N] = n.useState(''),
      [E, M] = n.useState(!1),
      [D, K] = n.useState(null),
      [t, j] = n.useState({
        nombre: '',
        email: '',
        password: '',
        rol: '',
        activo: !0,
        es_admin_delegado: !1
      }),
      [C, f] = n.useState(!1);
    Bs(() => {
      E &&
        u.current &&
        Zs.from(u.current, {
          scale: 0.95,
          opacity: 0,
          y: 20,
          duration: 0.3,
          ease: 'back.out(1.2)',
          clearProps: 'all'
        });
    }, [E]);
    const { data: v = [], isLoading: A } = Ee({
        queryKey: ['roles_catalogo'],
        queryFn: async () => {
          const { data: a, error: s } = await F.from('tms_roles')
            .select('id, nombre, descripcion, landing_page, permisos_json')
            .order('nombre');
          if (s) throw s;
          return a || [];
        }
      }),
      P = Q.useMemo(() => Object.fromEntries(v.map((a) => [a.id, a])), [v]),
      { data: R = [], isLoading: we } = Ee({
        queryKey: ['admin_users'],
        queryFn: async () => {
          const { data: a, error: s } = await F.from('tms_usuarios')
            .select(
              'id, auth_uid, id_usuario, nombre, email, rol, activo, es_admin_delegado, created_at, last_seen'
            )
            .order('created_at', { ascending: !1 });
          if (s) throw s;
          return a || [];
        }
      }),
      { data: H = [], isLoading: Qe } = Ee({
        queryKey: ['iam_user_scopes'],
        queryFn: () => Fs(),
        staleTime: 30 * 1e3
      });
    Q.useEffect(() => {
      let a = {};
      const s = (g) => {
          (a[g] && clearTimeout(a[g]),
            (a[g] = setTimeout(() => c.invalidateQueries({ queryKey: [g] }), 800)));
        },
        o = F.channel('admin_users_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_usuarios' }, () =>
            s('admin_users')
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_roles' }, () =>
            s('roles_catalogo')
          )
          .subscribe((g, z) => {
            z && console.error('Realtime subscription error:', z);
          });
      return () => {
        (Object.values(a).forEach((g) => clearTimeout(g)), F.removeChannel(o));
      };
    }, [c]);
    const Y = Q.useCallback(
        (a) => {
          var s;
          return Array.isArray((s = P[a]) == null ? void 0 : s.permisos_json)
            ? P[a].permisos_json
            : [];
        },
        [P]
      ),
      ye = Q.useMemo(() => {
        const a = new Map();
        return (
          H.forEach((s) => {
            const o = a.get(s.user_id) || [];
            (o.push(s), a.set(s.user_id, o));
          }),
          a
        );
      }, [H]),
      oe = Q.useCallback(
        (a) => {
          const s = Y(a == null ? void 0 : a.rol),
            o = a != null && a.auth_uid ? ye.get(a.auth_uid) || [] : [],
            g = s.includes('manage_panel'),
            z = s.includes('manage_roles'),
            T =
              g ||
              s.includes('view_panel') ||
              s.includes('panel_ingresar') ||
              s.includes('panel_info') ||
              s.includes('panel_tv') ||
              s.includes('panel_builder');
          return {
            permisos: s,
            scoped: o,
            scopeCount: o.length,
            hasManagePanel: g,
            hasManageRoles: z,
            hasPanelAccess: T,
            needsReloginNotice:
              g ||
              z ||
              (a == null ? void 0 : a.es_admin_delegado) ||
              (a == null ? void 0 : a.rol) === 'ADMIN'
          };
        },
        [Y, ye]
      ),
      _e = Q.useCallback(async () => {
        (await Us(),
          await Promise.all([
            c.invalidateQueries({ queryKey: ['admin_users'] }),
            c.invalidateQueries({ queryKey: ['roles_catalogo'] }),
            c.invalidateQueries({ queryKey: ['iam_user_scopes'] })
          ]));
      }, [c]),
      ie = Re({
        mutationFn: async (a) => {
          var z;
          const s = {
              id: (D == null ? void 0 : D.id) || null,
              nombre: a.nombre,
              email: a.email,
              rol: a.rol,
              activo: a.activo,
              es_admin_delegado: a.es_admin_delegado,
              password: ((z = a.password) == null ? void 0 : z.trim()) || null
            },
            { data: o, error: g } = await F.rpc('guardar_usuario', { p: s });
          if (g) throw g;
          if (o && o.ok === !1) throw new Error(o.error || 'No se pudo guardar');
          return o;
        },
        onSuccess: async (a, s) => {
          await _e();
          const o = oe(s);
          (b.success(`Usuario ${D ? 'actualizado' : 'creado'} exitosamente`, { style: bs }),
            o.needsReloginNotice &&
              b(
                'IAM sincronizado. El usuario debe cerrar sesión y volver a ingresar para tomar los permisos nuevos. Si su operación será acotada, configúrala en Ámbitos.',
                { style: hs, duration: 7e3 }
              ),
            M(!1));
        },
        onError: (a) => b.error('Error al guardar usuario: ' + a.message, { style: gs })
      }),
      Pe = Re({
        mutationFn: async (a) => {
          const { error: s } = await F.rpc('eliminar_usuario_completo', { p_id: a });
          if (s) throw s;
        },
        onSuccess: () => {
          (c.invalidateQueries({ queryKey: ['admin_users'] }),
            b.success('Usuario eliminado (cuenta, accesos y rastros anonimizados)'));
        },
        onError: (a) => b.error('Error al eliminar: ' + a.message)
      }),
      $ = Re({
        mutationFn: async ({ ids: a, accion: s, valor: o = null }) => {
          const { data: g, error: z } = await F.rpc('usuarios_bulk', {
            p_ids: a,
            p_accion: s,
            p_valor: o
          });
          if (z) throw z;
          return g;
        },
        onSuccess: async (a, s) => {
          await _e();
          const o =
            {
              activar: 'activado(s)',
              desactivar: 'desactivado(s)',
              rol: 'reasignado(s)',
              eliminar: 'eliminado(s)'
            }[s.accion] || 'actualizado(s)';
          (b.success(`${(a == null ? void 0 : a.n) ?? s.ids.length} usuario(s) ${o}`, {
            style: bs
          }),
            (s.accion === 'rol' || s.accion === 'activar' || s.accion === 'desactivar') &&
              b(
                'Permisos efectivos refrescados. Los usuarios impactados deben volver a iniciar sesión; si operan por centro de costo, revisa también la pestaña Ámbitos.',
                { style: hs, duration: 7e3 }
              ),
            s.accion !== '__toggle' && (I(new Set()), N('')));
        },
        onError: (a) => b.error('Error en la acción: ' + a.message, { style: gs })
      }),
      V = (a = null) => {
        (K(a),
          f(!1),
          j({
            nombre: (a == null ? void 0 : a.nombre) || '',
            email: (a == null ? void 0 : a.email) || '',
            password: '',
            rol: (a == null ? void 0 : a.rol) || '',
            activo: a ? a.activo : !0,
            es_admin_delegado: (a == null ? void 0 : a.es_admin_delegado) || !1
          }),
          M(!0));
      },
      J = (a) => {
        if ((a.preventDefault(), !t.nombre || !t.email || !t.rol)) {
          b.error('Completa los campos requeridos');
          return;
        }
        ie.mutate(t);
      },
      $e = (a) => {
        window.confirm('¿Eliminar este usuario permanentemente?') && Pe.mutate(a);
      },
      Ie = (a, s) => {
        (s == null || s.stopPropagation(),
          $.mutate({ ids: [a.id], accion: a.activo ? 'desactivar' : 'activar' }));
      },
      Me = (a, s) => {
        (s == null || s.stopPropagation(),
          I((o) => {
            const g = new Set(o);
            return (g.has(a) ? g.delete(a) : g.add(a), g);
          }));
      },
      We = () => I(new Set()),
      X = Q.useMemo(() => {
        const a = R.filter((g) => {
            var L, Te;
            const z =
                !l ||
                ((L = g.nombre) == null ? void 0 : L.toLowerCase().includes(l.toLowerCase())) ||
                ((Te = g.email) == null ? void 0 : Te.toLowerCase().includes(l.toLowerCase())),
              T = !w || g.rol === w,
              he = !h || (h === 'active' ? g.activo : !g.activo);
            return z && T && he;
          }),
          s = (g) => {
            var z;
            return ((z = P[g.rol]) == null ? void 0 : z.nombre) || g.rol || '';
          },
          o =
            {
              recientes: (g, z) => new Date(z.created_at) - new Date(g.created_at),
              nombre: (g, z) => (g.nombre || '').localeCompare(z.nombre || ''),
              rol: (g, z) => s(g).localeCompare(s(z)),
              ultimo: (g, z) => new Date(z.last_seen || 0) - new Date(g.last_seen || 0),
              estado: (g, z) => Number(z.activo) - Number(g.activo)
            }[k] || (() => 0);
        return [...a].sort(o);
      }, [R, l, w, h, k, P]),
      be = X.map((a) => a.id),
      ke = be.length > 0 && be.every((a) => y.has(a)),
      De = () => {
        I((a) => {
          const s = new Set(a);
          return (ke ? be.forEach((o) => s.delete(o)) : be.forEach((o) => s.add(o)), s);
        });
      },
      ge = (a, s = null) => {
        const o = [...y];
        o.length !== 0 &&
          ((a === 'eliminar' &&
            !window.confirm(
              `¿Eliminar ${o.length} usuario(s) permanentemente? Esta acción no se puede deshacer.`
            )) ||
            $.mutate({ ids: o, accion: a, valor: s }));
      },
      ne = Q.useMemo(
        () => ({
          total: R.length,
          active: R.filter((a) => a.activo).length,
          admins: R.filter((a) => {
            var s;
            return (
              ((s = a.rol) == null ? void 0 : s.toUpperCase()) === 'ADMIN' || a.es_admin_delegado
            );
          }).length,
          supervisors: R.filter((a) => {
            var s;
            return ((s = a.rol) == null ? void 0 : s.toUpperCase()) === 'SUPERVISOR';
          }).length,
          panel: R.filter((a) => oe(a).hasManagePanel).length
        }),
        [oe, R]
      ),
      Ce = (a) => {
        switch (a == null ? void 0 : a.toUpperCase()) {
          case 'ADMIN':
            return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
          case 'SUPERVISOR':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
          case 'OPERADOR':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          default:
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
      },
      Se = (a) => {
        switch (a == null ? void 0 : a.toUpperCase()) {
          case 'ADMIN':
            return e.jsx(ze, { size: 14 });
          case 'SUPERVISOR':
            return e.jsx(He, { size: 14 });
          case 'OPERADOR':
            return e.jsx(Xs, { size: 14 });
          default:
            return e.jsx(W, { size: 14 });
        }
      },
      Z = ({ icon: a, label: s, value: o, glowColor: g }) =>
        e.jsxs('div', {
          className:
            'bg-white backdrop-blur-xl rounded-2xl p-3 sm:p-5 border border-slate-200 relative overflow-hidden group',
          children: [
            e.jsx('div', {
              className: `absolute top-0 right-0 w-24 h-24 bg-${g}-500/10 rounded-full blur-2xl group-hover:bg-${g}-500/20 transition-all`
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-2 sm:gap-4 relative z-10',
              children: [
                e.jsx('div', {
                  className: `p-2 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-${g}-400 shadow-sm`,
                  children: a
                }),
                e.jsxs('div', {
                  className: 'min-w-0',
                  children: [
                    e.jsx('p', {
                      className:
                        'text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 truncate',
                      children: s
                    }),
                    e.jsx('p', {
                      className: 'text-2xl sm:text-3xl font-black text-slate-900',
                      children: o
                    })
                  ]
                })
              ]
            })
          ]
        });
    return e.jsxs('div', {
      ref: p,
      className: r
        ? 'space-y-4 sm:space-y-8 text-slate-700 relative'
        : 'space-y-4 sm:space-y-8 bg-slate-50 min-h-[calc(100vh-80px)] p-3 sm:p-6 text-slate-700',
      children: [
        e.jsx('div', {
          className: 'absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0',
          children: e.jsx('div', {
            className:
              'absolute top-[-10%] w-[800px] h-[400px] bg-orange-500/10 blur-[100px] rounded-full'
          })
        }),
        e.jsxs('div', {
          className:
            'flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10',
          children: [
            !r &&
              e.jsxs('div', {
                children: [
                  e.jsxs('h1', {
                    className:
                      'text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3',
                    children: [
                      e.jsx('div', {
                        className:
                          'bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/30 shadow-sm',
                        children: e.jsx(W, { className: 'text-orange-400', size: 28 })
                      }),
                      'Control de ',
                      e.jsx('span', { className: 'text-orange-400', children: 'Accesos' })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'text-slate-500 text-sm mt-2 font-medium',
                    children: 'Administración centralizada de usuarios y roles del sistema'
                  })
                ]
              }),
            e.jsxs('div', {
              className: 'flex gap-3 md:ml-auto',
              children: [
                e.jsx('button', {
                  onClick: () => c.invalidateQueries({ queryKey: ['admin_users'] }),
                  className:
                    'p-3 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-600 rounded-xl transition-all shadow-sm',
                  title: 'Actualizar lista',
                  children: e.jsx(re, {
                    size: 20,
                    className: we ? 'animate-spin text-orange-400' : ''
                  })
                }),
                e.jsxs('button', {
                  onClick: () => V(),
                  className:
                    'bg-orange-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-md transition-all active:scale-95',
                  children: [e.jsx(Ks, { size: 20 }), ' Nuevo Usuario']
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 relative z-10',
          children: [
            e.jsx(Z, {
              icon: e.jsx(W, { size: 24 }),
              label: 'Total Usuarios',
              value: ne.total,
              glowColor: 'orange'
            }),
            e.jsx(Z, {
              icon: e.jsx(As, { size: 24 }),
              label: 'Activos',
              value: ne.active,
              glowColor: 'emerald'
            }),
            e.jsx(Z, {
              icon: e.jsx(ze, { size: 24 }),
              label: 'Admins',
              value: ne.admins,
              glowColor: 'rose'
            }),
            e.jsx(Z, {
              icon: e.jsx(He, { size: 24 }),
              label: 'Supervisores',
              value: ne.supervisors,
              glowColor: 'amber'
            }),
            e.jsx(Z, {
              icon: e.jsx(me, { size: 24 }),
              label: 'Gestionan Panel',
              value: ne.panel,
              glowColor: 'blue'
            })
          ]
        }),
        e.jsx('div', {
          className:
            'rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] text-slate-700 relative z-10',
          children: e.jsxs('div', {
            className: 'flex items-start gap-2.5',
            children: [
              e.jsx(ns, { size: 16, className: 'text-amber-500 shrink-0 mt-0.5' }),
              e.jsxs('p', {
                children: [
                  'La pestaña ',
                  e.jsx('b', { children: 'Usuarios' }),
                  ' define el rol global. Si el usuario opera sobre datos acotados, completa también ',
                  e.jsx('b', { children: 'Ámbitos' }),
                  '. Después de cambios críticos de rol o privilegios, el usuario debe ',
                  e.jsx('b', { children: 'cerrar sesión y volver a entrar' }),
                  '.'
                ]
              })
            ]
          })
        }),
        e.jsxs('div', {
          className:
            'bg-white backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-2xl flex flex-col lg:flex-row gap-3 items-stretch lg:items-center sticky top-4 z-30',
          children: [
            e.jsxs('div', {
              className: 'flex-1 relative w-full group',
              children: [
                e.jsx(Fe, {
                  className:
                    'absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors',
                  size: 20
                }),
                e.jsx('input', {
                  type: 'text',
                  placeholder: 'Buscar por nombre o email...',
                  className:
                    'w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all text-slate-900 placeholder-slate-500 font-medium',
                  value: l,
                  onChange: (a) => m(a.target.value)
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0',
              children: [
                e.jsxs('select', {
                  className:
                    'px-3 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold text-slate-700 cursor-pointer text-sm',
                  value: w,
                  onChange: (a) => i(a.target.value),
                  children: [
                    e.jsx('option', { value: '', children: 'Todos los roles' }),
                    v.map((a) => e.jsx('option', { value: a.id, children: a.nombre }, a.id))
                  ]
                }),
                e.jsxs('select', {
                  className:
                    'px-3 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold text-slate-700 cursor-pointer text-sm',
                  value: h,
                  onChange: (a) => S(a.target.value),
                  children: [
                    e.jsx('option', { value: '', children: 'Todos los estados' }),
                    e.jsx('option', { value: 'active', children: 'Activos' }),
                    e.jsx('option', { value: 'inactive', children: 'Inactivos' })
                  ]
                }),
                e.jsxs('select', {
                  className:
                    'px-3 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold text-slate-700 cursor-pointer text-sm',
                  value: k,
                  onChange: (a) => d(a.target.value),
                  title: 'Ordenar',
                  children: [
                    e.jsx('option', { value: 'recientes', children: 'Más recientes' }),
                    e.jsx('option', { value: 'nombre', children: 'Nombre (A-Z)' }),
                    e.jsx('option', { value: 'rol', children: 'Rol' }),
                    e.jsx('option', { value: 'ultimo', children: 'Último acceso' }),
                    e.jsx('option', { value: 'estado', children: 'Estado' })
                  ]
                }),
                e.jsxs('div', {
                  className: 'flex bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0',
                  children: [
                    e.jsx('button', {
                      onClick: () => x('cards'),
                      title: 'Tarjetas',
                      className: `p-2 rounded-lg transition-colors ${_ === 'cards' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-700'}`,
                      children: e.jsx(Js, { size: 18 })
                    }),
                    e.jsx('button', {
                      onClick: () => x('table'),
                      title: 'Tabla',
                      className: `p-2 rounded-lg transition-colors ${_ === 'table' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-700'}`,
                      children: e.jsx(Qs, { size: 18 })
                    })
                  ]
                })
              ]
            })
          ]
        }),
        y.size > 0 &&
          e.jsxs('div', {
            className:
              'sticky top-24 z-30 bg-slate-900 text-white rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-xl relative anim-fade-up',
            children: [
              e.jsxs('span', {
                className: 'font-black text-sm',
                children: [y.size, ' seleccionado(s)']
              }),
              e.jsx('button', {
                onClick: We,
                className: 'text-slate-300 hover:text-white text-xs font-bold underline',
                children: 'Limpiar'
              }),
              e.jsx('div', { className: 'h-5 w-px bg-white/20 mx-1' }),
              e.jsxs('button', {
                onClick: () => ge('activar'),
                disabled: $.isPending,
                className:
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black hover:bg-emerald-500/30 disabled:opacity-50',
                children: [e.jsx(Es, { size: 14 }), ' Activar']
              }),
              e.jsxs('button', {
                onClick: () => ge('desactivar'),
                disabled: $.isPending,
                className:
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-500/20 text-slate-200 border border-slate-400/30 text-xs font-black hover:bg-slate-500/30 disabled:opacity-50',
                children: [e.jsx(Rs, { size: 14 }), ' Desactivar']
              }),
              e.jsx('div', {
                className: 'inline-flex items-center gap-1.5',
                children: e.jsxs('select', {
                  value: O,
                  onChange: (a) => {
                    const s = a.target.value;
                    (N(s), s && ge('rol', s));
                  },
                  className:
                    'px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-xs font-bold outline-none cursor-pointer',
                  children: [
                    e.jsx('option', {
                      value: '',
                      className: 'text-slate-900',
                      children: 'Cambiar rol a…'
                    }),
                    v.map((a) =>
                      e.jsx(
                        'option',
                        { value: a.id, className: 'text-slate-900', children: a.nombre },
                        a.id
                      )
                    )
                  ]
                })
              }),
              e.jsxs('button', {
                onClick: () => ge('eliminar'),
                disabled: $.isPending,
                className:
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-black hover:bg-rose-500/30 disabled:opacity-50 ml-auto',
                children: [e.jsx(le, { size: 14 }), ' Eliminar']
              }),
              $.isPending && e.jsx(Ne, { size: 16, className: 'animate-spin' })
            ]
          }),
        e.jsxs('div', {
          className:
            'flex items-center justify-between text-xs font-bold text-slate-400 relative z-10 px-1',
          children: [
            e.jsxs('span', { children: [X.length, ' de ', R.length, ' usuarios'] }),
            X.length > 0 &&
              e.jsxs('button', {
                onClick: De,
                className:
                  'inline-flex items-center gap-1.5 hover:text-orange-500 transition-colors',
                children: [
                  ke ? e.jsx(Oe, { size: 15 }) : e.jsx(qe, { size: 15 }),
                  ' Seleccionar todos'
                ]
              })
          ]
        }),
        e.jsx('div', {
          className: 'relative z-10',
          children:
            we || A
              ? e.jsxs('div', {
                  className: 'flex flex-col items-center justify-center py-32 space-y-4',
                  children: [
                    e.jsx('div', {
                      className:
                        'w-16 h-16 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin'
                    }),
                    e.jsx('p', {
                      className: 'text-slate-500 font-bold animate-pulse',
                      children: 'Cargando directorio...'
                    })
                  ]
                })
              : X.length === 0
                ? e.jsxs('div', {
                    className:
                      'flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200',
                    children: [
                      e.jsx('div', {
                        className: 'bg-slate-50 p-6 rounded-full mb-4 border border-slate-200',
                        children: e.jsx(Fe, { size: 48, className: 'text-slate-500' })
                      }),
                      e.jsx('h3', {
                        className: 'text-xl font-bold text-slate-900',
                        children: 'No se encontraron usuarios'
                      }),
                      e.jsx('p', {
                        className: 'text-slate-500 mt-1',
                        children: 'Intenta ajustar los filtros de búsqueda'
                      })
                    ]
                  })
                : _ === 'table'
                  ? e.jsx('div', {
                      className:
                        'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden',
                      children: e.jsx('div', {
                        className: 'overflow-x-auto',
                        children: e.jsxs('table', {
                          className: 'w-full text-sm',
                          children: [
                            e.jsx('thead', {
                              children: e.jsxs('tr', {
                                className:
                                  'bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-black',
                                children: [
                                  e.jsx('th', {
                                    className: 'p-3 w-10',
                                    children: e.jsx('button', {
                                      onClick: De,
                                      children: ke
                                        ? e.jsx(Oe, { size: 16, className: 'text-orange-600' })
                                        : e.jsx(qe, { size: 16, className: 'text-slate-300' })
                                    })
                                  }),
                                  e.jsx('th', { className: 'p-3 text-left', children: 'Usuario' }),
                                  e.jsx('th', {
                                    className: 'p-3 text-left hidden sm:table-cell',
                                    children: 'Rol'
                                  }),
                                  e.jsx('th', {
                                    className: 'p-3 text-left hidden lg:table-cell',
                                    children: 'IAM'
                                  }),
                                  e.jsx('th', { className: 'p-3 text-left', children: 'Estado' }),
                                  e.jsx('th', {
                                    className: 'p-3 text-left hidden md:table-cell',
                                    children: 'Último acceso'
                                  }),
                                  e.jsx('th', { className: 'p-3 text-right', children: 'Acciones' })
                                ]
                              })
                            }),
                            e.jsx('tbody', {
                              children: X.map((a) => {
                                var g, z;
                                const s = y.has(a.id),
                                  o = oe(a);
                                return e.jsxs(
                                  'tr',
                                  {
                                    className: `border-b border-slate-100 last:border-0 transition-colors ${s ? 'bg-orange-50/60' : 'hover:bg-slate-50'}`,
                                    children: [
                                      e.jsx('td', {
                                        className: 'p-3',
                                        children: e.jsx('button', {
                                          onClick: (T) => Me(a.id, T),
                                          children: s
                                            ? e.jsx(Oe, { size: 16, className: 'text-orange-600' })
                                            : e.jsx(qe, { size: 16, className: 'text-slate-300' })
                                        })
                                      }),
                                      e.jsx('td', {
                                        className: 'p-3',
                                        children: e.jsxs('div', {
                                          className: 'flex items-center gap-2.5 min-w-0',
                                          children: [
                                            e.jsx('div', {
                                              className: `w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${Ce(a.rol)}`,
                                              children:
                                                (g = a.nombre) == null
                                                  ? void 0
                                                  : g.charAt(0).toUpperCase()
                                            }),
                                            e.jsxs('div', {
                                              className: 'min-w-0',
                                              children: [
                                                e.jsxs('div', {
                                                  className:
                                                    'font-bold text-slate-900 truncate flex items-center gap-1.5',
                                                  children: [
                                                    a.nombre,
                                                    (a.rol === 'ADMIN' || a.es_admin_delegado) &&
                                                      e.jsx(ze, {
                                                        size: 12,
                                                        className: 'text-amber-500'
                                                      })
                                                  ]
                                                }),
                                                e.jsx('div', {
                                                  className: 'text-xs text-slate-400 truncate',
                                                  children: a.email
                                                })
                                              ]
                                            })
                                          ]
                                        })
                                      }),
                                      e.jsx('td', {
                                        className: 'p-3 hidden sm:table-cell',
                                        children: e.jsxs('span', {
                                          className: `inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold ${Ce(a.rol)}`,
                                          children: [
                                            Se(a.rol),
                                            ((z = P[a.rol]) == null ? void 0 : z.nombre) || a.rol
                                          ]
                                        })
                                      }),
                                      e.jsx('td', {
                                        className: 'p-3 hidden lg:table-cell',
                                        children: e.jsxs('div', {
                                          className: 'flex flex-wrap gap-1.5',
                                          children: [
                                            o.hasManagePanel &&
                                              e.jsxs('span', {
                                                className:
                                                  'inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 text-[11px] font-black text-blue-700',
                                                children: [e.jsx(me, { size: 11 }), 'manage_panel']
                                              }),
                                            o.scopeCount > 0
                                              ? e.jsxs('span', {
                                                  className:
                                                    'inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-black text-emerald-700',
                                                  children: [
                                                    e.jsx(Ge, { size: 11 }),
                                                    o.scopeCount,
                                                    ' ámbito(s)'
                                                  ]
                                                })
                                              : e.jsx('span', {
                                                  className:
                                                    'inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500',
                                                  children: 'Global por rol'
                                                })
                                          ]
                                        })
                                      }),
                                      e.jsx('td', {
                                        className: 'p-3',
                                        children: e.jsxs('button', {
                                          onClick: (T) => Ie(a, T),
                                          title: a.activo ? 'Desactivar' : 'Activar',
                                          className: `inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-black border transition-colors ${a.activo ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`,
                                          children: [
                                            e.jsx('span', {
                                              className: `w-1.5 h-1.5 rounded-full ${a.activo ? 'bg-emerald-500' : 'bg-slate-400'}`
                                            }),
                                            a.activo ? 'Activo' : 'Inactivo'
                                          ]
                                        })
                                      }),
                                      e.jsx('td', {
                                        className:
                                          'p-3 hidden md:table-cell text-xs text-slate-500 whitespace-nowrap',
                                        children: e.jsxs('span', {
                                          className: 'inline-flex items-center gap-1',
                                          children: [
                                            e.jsx(Ve, { size: 12, className: 'text-slate-300' }),
                                            js(a.last_seen)
                                          ]
                                        })
                                      }),
                                      e.jsx('td', {
                                        className: 'p-3',
                                        children: e.jsxs('div', {
                                          className: 'flex items-center justify-end gap-1',
                                          children: [
                                            e.jsx('button', {
                                              onClick: () => V(a),
                                              className:
                                                'p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors',
                                              title: 'Editar',
                                              children: e.jsx(Be, { size: 16 })
                                            }),
                                            e.jsx('button', {
                                              onClick: () => $e(a.id),
                                              className:
                                                'p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors',
                                              title: 'Eliminar',
                                              children: e.jsx(le, { size: 16 })
                                            })
                                          ]
                                        })
                                      })
                                    ]
                                  },
                                  a.id
                                );
                              })
                            })
                          ]
                        })
                      })
                    })
                  : e.jsx('div', {
                      className:
                        'grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6',
                      children: X.map((a) => {
                        var g, z;
                        const s = y.has(a.id),
                          o = oe(a);
                        return e.jsxs(
                          'div',
                          {
                            className: `group bg-white backdrop-blur-md rounded-3xl border shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden relative ${s ? 'border-orange-400 ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-600'}`,
                            children: [
                              e.jsx('div', {
                                className: `h-24 w-full absolute top-0 left-0 transition-colors ${a.activo ? 'bg-gradient-to-b from-orange-500/10 to-transparent' : 'bg-slate-100'}`
                              }),
                              e.jsx('button', {
                                onClick: (T) => Me(a.id, T),
                                className:
                                  'absolute top-3 left-3 z-20 p-1 rounded-lg bg-white/80 backdrop-blur border border-slate-200 shadow-sm',
                                children: s
                                  ? e.jsx(Oe, { size: 18, className: 'text-orange-600' })
                                  : e.jsx(qe, { size: 18, className: 'text-slate-300' })
                              }),
                              e.jsxs('div', {
                                className: 'p-4 sm:p-6 relative pt-6 sm:pt-8',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex justify-between items-start mb-4',
                                    children: [
                                      e.jsx('div', {
                                        className: `w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border shadow-lg transform group-hover:scale-110 transition-transform duration-300
                      ${a.rol === 'ADMIN' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : a.rol === 'SUPERVISOR' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-orange-500/20 border-orange-500/30 text-orange-400'}`,
                                        children:
                                          (g = a.nombre) == null
                                            ? void 0
                                            : g.charAt(0).toUpperCase()
                                      }),
                                      e.jsxs('div', {
                                        className: 'flex flex-col items-end gap-2',
                                        children: [
                                          e.jsx('button', {
                                            onClick: (T) => Ie(a, T),
                                            title: a.activo ? 'Desactivar' : 'Activar',
                                            className: `px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${a.activo ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`,
                                            children: a.activo ? 'Activo' : 'Inactivo'
                                          }),
                                          (a.rol === 'ADMIN' || a.es_admin_delegado) &&
                                            e.jsx('span', {
                                              className: `p-1.5 rounded-lg border ${a.es_admin_delegado ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`,
                                              title: a.es_admin_delegado
                                                ? 'Administrador Delegado'
                                                : 'Administrador',
                                              children: e.jsx(ze, { size: 14 })
                                            })
                                        ]
                                      })
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className: 'space-y-1 mb-4',
                                    children: [
                                      e.jsx('h3', {
                                        className:
                                          'font-black text-xl text-slate-900 leading-tight truncate',
                                        title: a.nombre,
                                        children: a.nombre
                                      }),
                                      e.jsx('p', {
                                        className: 'text-sm text-slate-500 truncate font-medium',
                                        children: a.email
                                      }),
                                      e.jsxs('p', {
                                        className:
                                          'text-[11px] text-slate-400 font-bold flex items-center gap-1',
                                        children: [
                                          e.jsx(Ve, { size: 11 }),
                                          ' Último acceso: ',
                                          js(a.last_seen)
                                        ]
                                      })
                                    ]
                                  }),
                                  e.jsx('div', {
                                    className: 'flex items-center gap-2 mb-6',
                                    children: e.jsxs('div', {
                                      className: `flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border ${Ce(a.rol)}`,
                                      children: [
                                        Se(a.rol),
                                        e.jsx('span', {
                                          className: 'font-bold text-xs truncate',
                                          children:
                                            ((z = P[a.rol]) == null ? void 0 : z.nombre) || a.rol
                                        })
                                      ]
                                    })
                                  }),
                                  e.jsxs('div', {
                                    className: 'mb-5 flex flex-wrap gap-2',
                                    children: [
                                      o.hasManagePanel &&
                                        e.jsxs('span', {
                                          className:
                                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-blue-200 bg-blue-50 text-[11px] font-black text-blue-700',
                                          children: [e.jsx(me, { size: 12 }), 'Gestiona Panel']
                                        }),
                                      o.scopeCount > 0
                                        ? e.jsxs('span', {
                                            className:
                                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-200 bg-emerald-50 text-[11px] font-black text-emerald-700',
                                            children: [
                                              e.jsx(Ge, { size: 12 }),
                                              o.scopeCount,
                                              ' ámbito(s) activo(s)'
                                            ]
                                          })
                                        : e.jsx('span', {
                                            className:
                                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500',
                                            children: 'Sin ámbitos acotados'
                                          })
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex gap-3 pt-4 border-t border-slate-200',
                                    children: [
                                      e.jsxs('button', {
                                        onClick: () => V(a),
                                        className:
                                          'flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2',
                                        children: [e.jsx(Be, { size: 16 }), ' Editar']
                                      }),
                                      e.jsx('button', {
                                        onClick: () => $e(a.id),
                                        className:
                                          'p-2.5 text-slate-500 bg-slate-50 hover:bg-rose-500/10 border border-slate-200 hover:border-rose-500/30 hover:text-rose-400 rounded-xl transition-colors',
                                        title: 'Eliminar usuario',
                                        children: e.jsx(le, { size: 18 })
                                      })
                                    ]
                                  })
                                ]
                              })
                            ]
                          },
                          a.id
                        );
                      })
                    })
        }),
        E &&
          e.jsx('div', {
            className:
              'fixed inset-0 bg-slate-50/40 backdrop-blur-sm z-50 flex items-center justify-center p-4',
            children: e.jsxs('div', {
              ref: u,
              className:
                'bg-white border border-slate-200 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden relative max-h-[92vh] overflow-y-auto',
              children: [
                e.jsx('div', {
                  className:
                    'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-purple-500'
                }),
                e.jsxs('div', {
                  className:
                    'px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h2', {
                          className: 'text-2xl font-black text-slate-900 flex items-center gap-2',
                          children: D ? 'Editar Perfil' : 'Nuevo Usuario'
                        }),
                        e.jsx('p', {
                          className: 'text-slate-500 text-sm font-medium',
                          children: 'Configura los datos de acceso'
                        })
                      ]
                    }),
                    e.jsx('button', {
                      onClick: () => M(!1),
                      className:
                        'bg-slate-100 p-2 rounded-full border border-slate-200 text-slate-500 hover:text-rose-400 hover:border-rose-400/30 transition-all hover:rotate-90',
                      children: e.jsx(cs, { size: 20 })
                    })
                  ]
                }),
                e.jsxs('form', {
                  onSubmit: J,
                  className: 'p-4 sm:p-8 space-y-4 sm:space-y-6',
                  children: [
                    e.jsxs('div', {
                      className: 'space-y-5',
                      children: [
                        e.jsxs('div', {
                          className: 'group',
                          children: [
                            e.jsx('label', {
                              className:
                                'block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2',
                              children: 'Nombre Completo'
                            }),
                            e.jsxs('div', {
                              className: 'relative',
                              children: [
                                e.jsx(W, {
                                  className:
                                    'absolute left-4 top-1/2 -translate-y-1/2 text-slate-500',
                                  size: 20
                                }),
                                e.jsx('input', {
                                  type: 'text',
                                  required: !0,
                                  className:
                                    'w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all font-bold text-slate-900 placeholder-slate-600',
                                  placeholder: 'Ej: Juan Pérez',
                                  value: t.nombre,
                                  onChange: (a) => j({ ...t, nombre: a.target.value })
                                })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          className: 'group',
                          children: [
                            e.jsx('label', {
                              className:
                                'block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2',
                              children: 'Email Corporativo'
                            }),
                            e.jsxs('div', {
                              className: 'relative',
                              children: [
                                e.jsx('div', {
                                  className:
                                    'absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black',
                                  children: '@'
                                }),
                                e.jsx('input', {
                                  type: 'email',
                                  required: !0,
                                  className:
                                    'w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all font-bold text-slate-900 placeholder-slate-600',
                                  placeholder: 'usuario@empresa.com',
                                  value: t.email,
                                  onChange: (a) => j({ ...t, email: a.target.value })
                                })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          className: 'group',
                          children: [
                            e.jsx('label', {
                              className:
                                'block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2',
                              children: D ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial'
                            }),
                            e.jsxs('div', {
                              className: 'relative',
                              children: [
                                e.jsx(Ws, {
                                  className:
                                    'absolute left-4 top-1/2 -translate-y-1/2 text-slate-500',
                                  size: 20
                                }),
                                e.jsx('input', {
                                  type: C ? 'text' : 'password',
                                  required: !D,
                                  minLength: 6,
                                  className:
                                    'w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all font-bold text-slate-900 placeholder-slate-600',
                                  value: t.password,
                                  onChange: (a) => j({ ...t, password: a.target.value }),
                                  placeholder: D ? '••••••••' : 'Mínimo 6 caracteres'
                                }),
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => f(!C),
                                  className:
                                    'absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors',
                                  children: C ? e.jsx(Hs, { size: 20 }) : e.jsx(Ys, { size: 20 })
                                })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          className: 'grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6',
                          children: [
                            e.jsxs('div', {
                              className: 'group',
                              children: [
                                e.jsx('label', {
                                  className:
                                    'block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2',
                                  children: 'Rol de Acceso'
                                }),
                                e.jsxs('div', {
                                  className: 'relative',
                                  children: [
                                    e.jsxs('select', {
                                      required: !0,
                                      className:
                                        'w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all font-bold text-slate-900 appearance-none cursor-pointer',
                                      value: t.rol,
                                      onChange: (a) => j({ ...t, rol: a.target.value }),
                                      children: [
                                        e.jsx('option', {
                                          value: '',
                                          disabled: !0,
                                          children: 'Seleccionar...'
                                        }),
                                        v.map((a) =>
                                          e.jsx('option', { value: a.id, children: a.nombre }, a.id)
                                        )
                                      ]
                                    }),
                                    e.jsx('div', {
                                      className:
                                        'absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500',
                                      children: e.jsx(He, { size: 16 })
                                    })
                                  ]
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2',
                                  children: 'Estado'
                                }),
                                e.jsxs('div', {
                                  onClick: () => j({ ...t, activo: !t.activo }),
                                  className: `h-[52px] w-full rounded-xl flex items-center px-4 cursor-pointer transition-all border ${t.activo ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`,
                                  children: [
                                    e.jsx('div', {
                                      className: `w-12 h-6 rounded-full relative transition-colors ${t.activo ? 'bg-emerald-500' : 'bg-slate-200'}`,
                                      children: e.jsx('div', {
                                        className: `absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${t.activo ? 'translate-x-6' : 'translate-x-0'}`
                                      })
                                    }),
                                    e.jsx('span', {
                                      className: `ml-3 font-bold text-sm ${t.activo ? 'text-emerald-600' : 'text-slate-500'}`,
                                      children: t.activo ? 'Activo' : 'Inactivo'
                                    })
                                  ]
                                })
                              ]
                            })
                          ]
                        }),
                        t.rol &&
                          (() => {
                            var he;
                            const a = P[t.rol];
                            if (!a) return null;
                            const s = a.permisos_json || [],
                              { modulos: o } = zs(s),
                              g =
                                ((he = ss.find((L) => L.value === a.landing_page)) == null
                                  ? void 0
                                  : he.label) || a.landing_page,
                              z = s.includes('manage_panel'),
                              T = s.includes('manage_roles');
                            return e.jsxs('div', {
                              className:
                                'bg-orange-50 rounded-xl p-4 border border-orange-100 text-xs space-y-2',
                              children: [
                                e.jsxs('div', {
                                  className: 'font-black text-orange-800',
                                  children: [
                                    'Este rol otorga ',
                                    s.length,
                                    ' permiso(s) · verá ',
                                    o.length,
                                    ' ',
                                    'módulo(s)',
                                    a.descripcion
                                      ? e.jsxs('span', {
                                          className: 'font-medium text-orange-500',
                                          children: [' ', '— ', a.descripcion]
                                        })
                                      : null
                                  ]
                                }),
                                e.jsxs('div', {
                                  className: 'flex flex-wrap gap-1.5',
                                  children: [
                                    o.map((L) =>
                                      e.jsxs(
                                        'span',
                                        {
                                          title: L.rutas.map((Te) => Te.label).join(`
`),
                                          className: `px-2 py-0.5 rounded-md border font-bold ${L.soloAdmin ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-orange-700 border-orange-200'}`,
                                          children: [L.label, ' · ', L.rutas.length]
                                        },
                                        L.id
                                      )
                                    ),
                                    o.length === 0 &&
                                      e.jsx('span', {
                                        className: 'text-orange-400 font-medium',
                                        children:
                                          'Sin accesos — configura los permisos del rol en la pestaña Roles.'
                                      })
                                  ]
                                }),
                                g &&
                                  e.jsxs('div', {
                                    className: 'text-orange-600',
                                    children: ['Página de inicio: ', e.jsx('b', { children: g })]
                                  }),
                                o.some((L) => L.soloAdmin) &&
                                  e.jsx('div', {
                                    className: 'text-orange-600 text-[11px]',
                                    children:
                                      'Las rutas de Configuración además requieren rol ADMIN.'
                                  }),
                                (z || T) &&
                                  e.jsxs('div', {
                                    className:
                                      'rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700',
                                    children: [
                                      'Rol crítico: después de guardar, el usuario debe cerrar sesión y volver a entrar. Si su operación debe restringirse por centro de costo, complétala en la pestaña ',
                                      e.jsx('b', { children: 'Ámbitos' }),
                                      '.'
                                    ]
                                  })
                              ]
                            });
                          })(),
                        e.jsxs('div', {
                          className:
                            'bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 mt-4 flex items-start gap-3',
                          children: [
                            e.jsx('div', {
                              className:
                                'bg-amber-500/20 text-amber-400 p-2 rounded-lg flex-shrink-0 mt-1',
                              children: e.jsx(ze, { size: 20 })
                            }),
                            e.jsxs('div', {
                              className: 'flex-1',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex justify-between items-center mb-1',
                                  children: [
                                    e.jsx('label', {
                                      className: 'text-sm font-bold text-amber-400 block',
                                      children: 'Delegar Administración'
                                    }),
                                    e.jsx('div', {
                                      onClick: () =>
                                        j((a) => ({
                                          ...a,
                                          es_admin_delegado: !a.es_admin_delegado
                                        })),
                                      className: `w-10 h-5 rounded-full relative cursor-pointer transition-colors ${t.es_admin_delegado ? 'bg-amber-500' : 'bg-slate-200'}`,
                                      children: e.jsx('div', {
                                        className: `absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${t.es_admin_delegado ? 'translate-x-5' : 'translate-x-0'}`
                                      })
                                    })
                                  ]
                                }),
                                e.jsx('p', {
                                  className:
                                    'text-[11px] text-amber-500/80 leading-tight font-medium',
                                  children:
                                    'Otorga accesos totales sin cambiar el rol visual original.'
                                })
                              ]
                            })
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'pt-6 flex gap-4 border-t border-slate-200',
                      children: [
                        e.jsx('button', {
                          type: 'button',
                          onClick: () => M(!1),
                          className:
                            'flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition-colors',
                          children: 'Cancelar'
                        }),
                        e.jsxs('button', {
                          type: 'submit',
                          disabled: ie.isPending,
                          className:
                            'flex-[2] py-4 bg-orange-600 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] disabled:opacity-70 disabled:scale-100',
                          children: [
                            ie.isPending
                              ? e.jsx(Ne, { className: 'animate-spin', size: 20 })
                              : e.jsx(Ps, { size: 20 }),
                            ie.isPending ? 'Guardando...' : 'Confirmar Cambios'
                          ]
                        })
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
  ee = (r) => {
    var c, p;
    return (
      ((p = (c = is.find((u) => u.id === r)) == null ? void 0 : c.permissions) == null
        ? void 0
        : p.map((u) => u.id)) || []
    );
  },
  se = (r) => Array.from(new Set(r)),
  Xa = se(is.flatMap((r) => r.permissions.map((c) => c.id))),
  Za = [
    'analisis_tab_resumen',
    'analisis_tab_antiguos',
    'analisis_tab_antiguos_disp',
    'analisis_tab_no_activos',
    'analisis_tab_duplicados',
    'analisis_tab_anomalias',
    'analisis_tab_detalle'
  ],
  et = [
    'conteo_tab_contar',
    'conteo_tab_sesiones',
    'conteo_tab_conciliacion',
    'conteo_tab_ajuste',
    'conteo_tab_bloques',
    'conteo_tab_proyeccion'
  ],
  st = [
    'pv_tab_tickets',
    'pv_tab_bandeja',
    'pv_tab_calendario',
    'pv_tab_nuevo',
    'pv_tab_dashboard',
    'pv_tab_tecnicos'
  ],
  at = [
    {
      id: 'ADMIN',
      nombre: 'Administrador',
      descripcion: 'Administracion integral del sistema, seguridad, configuracion y soporte.',
      landingPage: '/admin/users',
      defaultTeamCode: 'ROL_ADMIN',
      scopeStrategy: 'global',
      permissions: Xa
    },
    {
      id: 'CONTROL_CALIDAD',
      nombre: 'Control Calidad',
      descripcion: 'Operacion y dictamen de calidad, inbound controlado y consulta transversal.',
      landingPage: '/quality/monitoreo',
      defaultTeamCode: 'ROL_CONTROL_CALIDAD',
      scopeStrategy: 'global',
      permissions: se([
        'view_entry',
        'process_entry',
        'view_reception',
        'process_reception',
        'manage_monitoreo',
        'manage_quality',
        'view_acciones_calidad',
        'view_batches',
        'view_locations',
        'view_addresses',
        'view_fichas',
        'view_carteles',
        'view_historial_nv',
        'panel_info',
        'panel_tv'
      ])
    },
    {
      id: 'GERENCIA',
      nombre: 'Gerencia',
      descripcion:
        'Vision ejecutiva con gestion amplia de panel, calidad, postventa y reportabilidad.',
      landingPage: '/panel',
      defaultTeamCode: 'ROL_GERENCIA',
      scopeStrategy: 'global',
      permissions: se([
        'view_entry',
        'process_entry',
        'view_reception',
        'process_reception',
        'manage_data_import',
        'view_batches',
        'view_locations',
        'view_addresses',
        'view_fichas',
        'export_data',
        'view_historial_nv',
        'view_dispatch_control',
        'view_sales_status',
        'manage_monitoreo',
        'manage_quality',
        'view_acciones_calidad',
        'view_postventa',
        'manage_postventa',
        'supervise_postventa',
        ...st,
        'view_panel',
        'manage_panel',
        'approve_panel_reopen_nv',
        'panel_ingresar',
        'panel_info',
        'panel_tv',
        'panel_builder',
        'view_workflows'
      ])
    },
    {
      id: 'INVENTARIO_',
      nombre: 'Inventario',
      descripcion: 'Rol operativo de bodega extendido para inventario, recepcion y control fisico.',
      landingPage: '/inventory/traspasos',
      defaultTeamCode: 'ROL_INVENTARIO',
      scopeStrategy: 'global',
      permissions: se([
        'view_stock',
        'manage_inventory',
        'view_traspasos',
        'view_carteles',
        'view_insumos',
        'manage_insumos',
        'manage_locations',
        'view_analisis',
        ...Za,
        'view_conteo',
        'manage_conteo',
        ...et,
        'view_entry',
        'process_entry',
        'view_reception',
        'process_reception',
        'manage_data_import',
        'view_batches',
        'view_locations',
        'view_addresses'
      ])
    },
    {
      id: 'OPERADOR',
      nombre: 'Operador Bodega',
      descripcion: 'Operacion diaria de bodega, consultas logisticas y herramientas de conteo.',
      landingPage: '/mobile/pda',
      defaultTeamCode: 'ROL_OPERADOR',
      scopeStrategy: 'global',
      permissions: se([
        'view_stock',
        'manage_inventory',
        'view_traspasos',
        'view_carteles',
        'view_insumos',
        'view_conteo',
        'manage_conteo',
        'conteo_tab_contar',
        'view_entry',
        'view_reception',
        'view_batches',
        'view_locations',
        'view_addresses',
        'view_sales_status'
      ])
    },
    {
      id: 'OPERARIO_3',
      nombre: 'Operario 3',
      descripcion:
        'Rol legacy de apoyo operativo, traspasos, recepcion, consultas y carga puntual.',
      landingPage: '/inventory/traspasos',
      defaultTeamCode: 'ROL_OPERARIO_3',
      scopeStrategy: 'global',
      permissions: se([
        'view_stock',
        'view_traspasos',
        'view_batches',
        'view_addresses',
        'view_locations',
        'view_entry',
        'view_reception',
        'manage_data_import',
        'view_carteles'
      ])
    },
    {
      id: 'SUPERVISOR',
      nombre: 'Supervisor',
      descripcion:
        'Jefatura operativa del panel con control de estados, reaperturas y consulta ejecutiva.',
      landingPage: '/panel/ingresar',
      defaultTeamCode: 'ROL_SUPERVISOR',
      scopeStrategy: 'global',
      permissions: se([
        'view_panel',
        'manage_panel',
        'approve_panel_reopen_nv',
        'panel_ingresar',
        'panel_info',
        'panel_tv',
        'view_historial_nv',
        'view_dispatch_control',
        'view_sales_status',
        'export_data',
        'view_batches',
        'view_locations',
        'view_addresses',
        'pv_tab_tickets',
        'pv_tab_dashboard'
      ])
    },
    {
      id: 'SUPERVISOR_',
      nombre: 'Supervisor Legacy',
      descripcion: 'Supervisor legado alineado al nuevo estandar con apoyo en inbound y consultas.',
      landingPage: '/panel/ingresar',
      defaultTeamCode: 'ROL_SUPERVISOR_LEGACY',
      scopeStrategy: 'global',
      permissions: se([
        'view_panel',
        'manage_panel',
        'approve_panel_reopen_nv',
        'panel_ingresar',
        'panel_info',
        'panel_tv',
        'view_historial_nv',
        'view_dispatch_control',
        'view_sales_status',
        'view_entry',
        'process_entry',
        'view_reception',
        'manage_data_import',
        'view_batches',
        'view_locations',
        'view_addresses',
        'view_fichas'
      ])
    }
  ],
  tt = Object.fromEntries(at.map((r) => [r.id, r]));
function Ye(r) {
  return tt[r] || null;
}
(ee('inventario'),
  ee('inbound'),
  ee('queries'),
  ee('quality'),
  ee('panel'),
  ee('asistente'),
  ee('postventa'),
  ee('admin'));
const lt = {
    dashboard: e.jsx(oa, { size: 16 }),
    tms: e.jsx(ra, { size: 16 }),
    inbound: e.jsx(la, { size: 16 }),
    outbound: e.jsx(ta, { size: 16 }),
    queries: e.jsx(Fe, { size: 16 }),
    analytics: e.jsx(aa, { size: 16 }),
    quality: e.jsx(Je, { size: 16 }),
    admin: e.jsx(sa, { size: 16 })
  },
  vs = is.map((r) => ({ ...r, icon: lt[r.id] || e.jsx(xe, { size: 16 }) })),
  ce = ({ embedded: r = !1 }) => {
    const { refreshPermissions: c } = Ke(),
      p = Ss(),
      u = Q.useRef(),
      [l, m] = n.useState(null),
      [w, i] = n.useState(!1),
      [h, S] = n.useState(!1),
      { data: k = [], isLoading: d } = Ee({
        queryKey: ['admin_roles'],
        queryFn: async () => {
          const { data: t, error: j } = await F.from('tms_roles').select('*').order('nombre');
          if (j) throw j;
          const { data: C } = await F.from('tms_usuarios').select('rol'),
            f = {};
          return (
            (C || []).forEach((v) => {
              f[v.rol] = (f[v.rol] || 0) + 1;
            }),
            t.map((v) => ({ ...v, usuarios: f[v.id] || 0, permisos: v.permisos_json || [] }))
          );
        }
      }),
      _ = Re({
        mutationFn: async (t) => {
          const j = h ? t.nombre.toUpperCase().replace(/\s+/g, '_') : t.id,
            C = t.id === 'ADMIN' ? 'Administrador' : t.nombre,
            { error: f } = await F.from('tms_roles').upsert(
              {
                id: j,
                nombre: C,
                descripcion: t.descripcion,
                landing_page: t.landing_page || null,
                permisos_json: t.permisos || []
              },
              { onConflict: 'id' }
            );
          if (f) throw f;
          return t;
        },
        onSuccess: async () => {
          (await p.invalidateQueries({ queryKey: ['admin_roles'] }),
            await c(),
            b.success('Rol guardado exitosamente'),
            i(!1),
            S(!1));
        },
        onError: (t) => {
          b.error(`Error al guardar: ${t.message}`);
        }
      }),
      x = Re({
        mutationFn: async (t) => {
          const { error: j } = await F.from('tms_roles').delete().eq('id', t);
          if (j) throw j;
        },
        onSuccess: async () => {
          (await p.invalidateQueries({ queryKey: ['admin_roles'] }),
            await c(),
            b.success('Rol eliminado'),
            m(null));
        },
        onError: (t) => {
          b.error(`Error al eliminar: ${t.message}`);
        }
      }),
      { data: y = [] } = Ee({
        queryKey: ['rol_usuarios', (l == null ? void 0 : l.id) || ''],
        enabled: !!(l != null && l.id),
        queryFn: async () => {
          const { data: t } = await F.from('tms_usuarios')
            .select('nombre, activo')
            .eq('rol', l.id)
            .order('nombre');
          return t || [];
        }
      }),
      I = () => {
        (m({
          id: '',
          nombre: 'Nuevo Rol',
          descripcion: 'Descripción del rol',
          landing_page: '',
          usuarios: 0,
          permisos: []
        }),
          S(!0),
          i(!0));
      },
      O = (t, j) => {
        (j == null || j.stopPropagation(),
          m({
            id: '',
            nombre: `${t.nombre} (copia)`,
            descripcion: t.descripcion || '',
            landing_page: t.landing_page || '',
            usuarios: 0,
            permisos: [...(t.permisos || [])]
          }),
          S(!0),
          i(!0));
      },
      N = () => {
        _.mutate(l);
      },
      E = () => {
        const t = Ye(l == null ? void 0 : l.id);
        t &&
          (m((j) => ({
            ...j,
            nombre: t.nombre,
            descripcion: t.descripcion,
            landing_page: t.landingPage,
            permisos: [...t.permissions]
          })),
          b.success(`Plantilla oficial cargada para ${t.id}`));
      },
      M = (t) => {
        confirm('¿Eliminar este rol?') && x.mutate(t);
      },
      D = (t) => {
        w &&
          m((j) => {
            const C = j.permisos || [],
              f = C.includes(t) ? C.filter((v) => v !== t) : [...C, t];
            return { ...j, permisos: f };
          });
      },
      K = (t) => {
        if (!w) return;
        const C = vs.find((f) => f.id === t).permissions.map((f) => f.id);
        m((f) => {
          const v = f.permisos || [],
            P = C.every((R) => v.includes(R))
              ? v.filter((R) => !C.includes(R))
              : [...new Set([...v, ...C])];
          return { ...f, permisos: P };
        });
      };
    return d
      ? e.jsx('div', {
          className: 'flex items-center justify-center h-96',
          children: e.jsx(Ne, { className: 'animate-spin text-emerald-500', size: 40 })
        })
      : e.jsxs('div', {
          ref: u,
          className: r
            ? 'flex flex-col space-y-4 sm:space-y-6'
            : 'h-full flex flex-col space-y-4 sm:space-y-6 bg-slate-50 p-3 sm:p-6 min-h-screen',
          children: [
            !r &&
              e.jsxs('div', {
                className:
                  'flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden',
                children: [
                  e.jsx('div', {
                    className:
                      'absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60'
                  }),
                  e.jsx('div', {
                    className:
                      'absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center gap-3 sm:gap-6 relative z-10',
                    children: [
                      e.jsxs('div', {
                        className:
                          'w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 border border-emerald-100 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10 flex-shrink-0',
                        children: [
                          e.jsx(xe, { size: 24, className: 'sm:hidden', strokeWidth: 2.5 }),
                          e.jsx(xe, { size: 32, className: 'hidden sm:block', strokeWidth: 2.5 })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'min-w-0',
                        children: [
                          e.jsxs('h1', {
                            className:
                              'text-xl sm:text-4xl font-black text-slate-900 tracking-tight',
                            children: [
                              'Roles y ',
                              e.jsx('span', { className: 'text-emerald-600', children: 'Permisos' })
                            ]
                          }),
                          e.jsx('p', {
                            className: 'text-slate-500 font-bold mt-1 text-sm sm:text-lg',
                            children: 'Gestión de accesos y perfiles'
                          })
                        ]
                      })
                    ]
                  }),
                  !l &&
                    !h &&
                    e.jsxs('button', {
                      onClick: I,
                      className:
                        'bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-1 transition-all active:scale-95 relative z-10',
                      children: [e.jsx(B, { size: 24 }), ' Nuevo Rol']
                    })
                ]
              }),
            e.jsx('div', {
              className: 'flex flex-col gap-8 flex-1',
              children:
                (!l || h) && !w
                  ? e.jsxs('div', {
                      className:
                        'grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8',
                      children: [
                        k.map((t) => {
                          var j;
                          return e.jsxs(
                            'div',
                            {
                              onClick: () => m(t),
                              className:
                                'bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 p-4 sm:p-8 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-emerald-200 hover:-translate-y-2 transition-all group relative overflow-hidden',
                              children: [
                                e.jsx('div', {
                                  className:
                                    'absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity',
                                  children: e.jsx(xe, { size: 80, className: 'text-emerald-600' })
                                }),
                                e.jsxs('div', {
                                  className: 'flex justify-between items-start mb-6 relative z-10',
                                  children: [
                                    e.jsx('div', {
                                      className: `w-14 h-14 rounded-2xl flex items-center justify-center ${t.id === 'ADMIN' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`,
                                      children:
                                        t.id === 'ADMIN'
                                          ? e.jsx(as, { size: 28 })
                                          : e.jsx(W, { size: 28 })
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2',
                                      children: [
                                        t.id !== 'ADMIN' &&
                                          e.jsxs('span', {
                                            className:
                                              'bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full',
                                            children: [t.usuarios, ' usuarios']
                                          }),
                                        e.jsx('button', {
                                          onClick: (C) => O(t, C),
                                          title: 'Duplicar rol (mismos permisos)',
                                          className:
                                            'p-2 rounded-xl border border-slate-100 text-slate-300 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all',
                                          children: e.jsx(ts, { size: 16 })
                                        })
                                      ]
                                    })
                                  ]
                                }),
                                e.jsx('h3', {
                                  className:
                                    'text-2xl font-black text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors tracking-tight',
                                  children: t.nombre
                                }),
                                e.jsx('p', {
                                  className:
                                    'text-base text-slate-500 font-medium mb-8 line-clamp-2 h-12 leading-relaxed',
                                  children: t.descripcion || 'Sin descripción'
                                }),
                                e.jsxs('div', {
                                  className:
                                    'flex items-center justify-between border-t border-slate-50 pt-6 mt-auto',
                                  children: [
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest',
                                      children: [
                                        e.jsx(xe, { size: 16, className: 'text-emerald-500/50' }),
                                        ((j = t.permisos) == null ? void 0 : j.length) || 0,
                                        ' permisos'
                                      ]
                                    }),
                                    e.jsxs('span', {
                                      className:
                                        'text-emerald-600 text-sm font-black flex items-center gap-2 group-hover:translate-x-2 transition-transform uppercase tracking-widest',
                                      children: ['Editar ', e.jsx(Be, { size: 16 })]
                                    })
                                  ]
                                })
                              ]
                            },
                            t.id
                          );
                        }),
                        e.jsxs('button', {
                          onClick: I,
                          className:
                            'bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 p-8 flex flex-col items-center justify-center gap-6 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group min-h-[300px]',
                          children: [
                            e.jsx('div', {
                              className:
                                'w-20 h-20 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center group-hover:border-emerald-200 group-hover:bg-white transition-all shadow-inner',
                              children: e.jsx(B, { size: 40, strokeWidth: 3 })
                            }),
                            e.jsx('span', {
                              className: 'font-black text-xl uppercase tracking-tighter',
                              children: 'Crear Nuevo Rol'
                            })
                          ]
                        })
                      ]
                    })
                  : e.jsxs('div', {
                      className:
                        'bg-white rounded-2xl sm:rounded-[3rem] border border-slate-200 shadow-[0_30px_100px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden flex-1',
                      children: [
                        (() => {
                          const t = Ye(l == null ? void 0 : l.id);
                          return t
                            ? e.jsxs('div', {
                                className:
                                  'mx-4 mt-4 sm:mx-10 sm:mt-10 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-900',
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'font-black uppercase tracking-wider text-[11px] text-orange-700',
                                    children: 'Plantilla Oficial Frontend'
                                  }),
                                  e.jsxs('div', {
                                    className: 'mt-1 font-semibold',
                                    children: [
                                      'Este rol tiene blueprint central en `src/config/iamBlueprints.js` con landing `',
                                      t.landingPage,
                                      '` y ',
                                      t.permissions.length,
                                      ' permiso(s).'
                                    ]
                                  })
                                ]
                              })
                            : null;
                        })(),
                        e.jsxs('div', {
                          className:
                            'p-4 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start bg-slate-50/30 gap-4',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-8 flex-1',
                              children: [
                                e.jsx('button', {
                                  onClick: () => {
                                    (m(null), i(!1), S(!1));
                                  },
                                  className:
                                    'p-4 bg-white hover:bg-slate-100 rounded-[1.5rem] text-slate-400 hover:text-slate-900 transition-all border border-slate-200 shadow-sm',
                                  children: e.jsx(ea, { size: 28 })
                                }),
                                e.jsx('div', {
                                  className: 'flex-1 mr-12',
                                  children: w
                                    ? e.jsxs('div', {
                                        className:
                                          'flex flex-col sm:flex-row gap-4 sm:gap-8 items-start',
                                        children: [
                                          e.jsxs('div', {
                                            className: 'flex-1 w-full',
                                            children: [
                                              e.jsx('label', {
                                                className:
                                                  'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block',
                                                children: 'Nombre del Rol'
                                              }),
                                              e.jsx('input', {
                                                type: 'text',
                                                value: l.nombre,
                                                onChange: (t) =>
                                                  m({ ...l, nombre: t.target.value }),
                                                disabled: l.id === 'ADMIN',
                                                className:
                                                  'w-full text-3xl font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-emerald-500 outline-none px-0 py-2 transition-all disabled:opacity-50',
                                                placeholder: 'Nombre del Rol',
                                                autoFocus: !0
                                              })
                                            ]
                                          }),
                                          e.jsxs('div', {
                                            className: 'flex-[2]',
                                            children: [
                                              e.jsx('label', {
                                                className:
                                                  'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block',
                                                children: 'Descripción'
                                              }),
                                              e.jsx('input', {
                                                type: 'text',
                                                value: l.descripcion || '',
                                                onChange: (t) =>
                                                  m({ ...l, descripcion: t.target.value }),
                                                className:
                                                  'w-full text-xl text-slate-600 font-bold bg-transparent border-b-2 border-slate-200 focus:border-emerald-500 outline-none px-0 py-2 transition-all',
                                                placeholder: 'Descripción breve del rol'
                                              })
                                            ]
                                          }),
                                          e.jsxs('div', {
                                            className: 'flex-1 w-full',
                                            children: [
                                              e.jsx('label', {
                                                className:
                                                  'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block',
                                                children: 'Página de inicio'
                                              }),
                                              e.jsxs('select', {
                                                value: l.landing_page || '',
                                                onChange: (t) =>
                                                  m({ ...l, landing_page: t.target.value }),
                                                className:
                                                  'w-full text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 focus:border-emerald-500 outline-none rounded-xl px-3 py-2.5 transition-all',
                                                children: [
                                                  e.jsx('option', {
                                                    value: '',
                                                    children: '— Por defecto —'
                                                  }),
                                                  ss.map((t) =>
                                                    e.jsx(
                                                      'option',
                                                      { value: t.value, children: t.label },
                                                      t.value
                                                    )
                                                  )
                                                ]
                                              }),
                                              h &&
                                                l.nombre &&
                                                e.jsxs('p', {
                                                  className:
                                                    'text-[10px] text-slate-400 font-bold mt-1.5',
                                                  children: [
                                                    'ID del rol: ',
                                                    l.nombre.toUpperCase().replace(/\s+/g, '_')
                                                  ]
                                                })
                                            ]
                                          })
                                        ]
                                      })
                                    : e.jsxs('div', {
                                        children: [
                                          e.jsxs('div', {
                                            className: 'flex items-center gap-4',
                                            children: [
                                              e.jsx('h2', {
                                                className:
                                                  'text-4xl font-black text-slate-900 tracking-tight',
                                                children: l.nombre
                                              }),
                                              l.id === 'ADMIN' &&
                                                e.jsxs('span', {
                                                  className:
                                                    'bg-orange-50 border border-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2',
                                                  children: [
                                                    e.jsx(as, { size: 12, strokeWidth: 3 }),
                                                    ' Sistema'
                                                  ]
                                                })
                                            ]
                                          }),
                                          e.jsx('p', {
                                            className:
                                              'text-slate-500 mt-2 text-xl font-medium leading-relaxed',
                                            children: l.descripcion
                                          })
                                        ]
                                      })
                                })
                              ]
                            }),
                            e.jsx('div', {
                              className: 'flex gap-4',
                              children: w
                                ? e.jsxs(e.Fragment, {
                                    children: [
                                      Ye(l == null ? void 0 : l.id) &&
                                        e.jsxs('button', {
                                          onClick: E,
                                          className:
                                            'px-6 py-4 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all',
                                          children: [e.jsx(ts, { size: 20 }), ' Cargar Plantilla']
                                        }),
                                      e.jsx('button', {
                                        onClick: () => {
                                          (i(!1), S(!1), h && m(null));
                                        },
                                        className:
                                          'px-8 py-4 text-slate-500 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-widest transition-all',
                                        children: 'Cancelar'
                                      }),
                                      e.jsxs('button', {
                                        onClick: N,
                                        disabled: _.isPending,
                                        className:
                                          'px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50',
                                        children: [
                                          _.isPending
                                            ? e.jsx(Ne, { className: 'animate-spin', size: 20 })
                                            : e.jsx(Ps, { size: 20 }),
                                          _.isPending ? 'Guardando...' : 'Guardar Cambios'
                                        ]
                                      })
                                    ]
                                  })
                                : e.jsxs(e.Fragment, {
                                    children: [
                                      e.jsx('button', {
                                        onClick: () => M(l.id),
                                        disabled: l.id === 'ADMIN' || l.usuarios > 0,
                                        className:
                                          'p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 rounded-2xl transition-all disabled:opacity-10 shadow-sm',
                                        title: 'Eliminar Rol',
                                        children: e.jsx(le, { size: 24 })
                                      }),
                                      e.jsxs('button', {
                                        onClick: () => i(!0),
                                        className:
                                          'px-8 py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all',
                                        children: [e.jsx(Be, { size: 20 }), ' Editar Permisos']
                                      })
                                    ]
                                  })
                            })
                          ]
                        }),
                        e.jsx('div', {
                          className: 'flex-1 overflow-y-auto bg-slate-50/50 p-3 sm:p-12',
                          children: e.jsxs('div', {
                            className: 'max-w-7xl mx-auto',
                            children: [
                              (() => {
                                var C;
                                const { modulos: t } = zs(l.permisos || []),
                                  j =
                                    (C = ss.find((f) => f.value === l.landing_page)) == null
                                      ? void 0
                                      : C.label;
                                return e.jsxs('div', {
                                  className: 'grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8',
                                  children: [
                                    e.jsxs('div', {
                                      className:
                                        'lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5',
                                      children: [
                                        e.jsxs('h4', {
                                          className:
                                            'text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3',
                                          children: [
                                            'Accesos que otorga ',
                                            w ? '(se actualiza al marcar permisos)' : ''
                                          ]
                                        }),
                                        e.jsxs('div', {
                                          className: 'flex flex-wrap gap-2',
                                          children: [
                                            t.map((f) =>
                                              e.jsxs(
                                                'span',
                                                {
                                                  title: f.rutas.map((v) => v.label).join(`
`),
                                                  className: `px-3 py-1.5 rounded-xl border text-xs font-black ${f.soloAdmin ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`,
                                                  children: [
                                                    f.label,
                                                    ' · ',
                                                    f.rutas.length,
                                                    ' pantalla(s)'
                                                  ]
                                                },
                                                f.id
                                              )
                                            ),
                                            t.length === 0 &&
                                              e.jsx('span', {
                                                className: 'text-slate-400 text-sm font-bold',
                                                children:
                                                  'Sin accesos aún — marca permisos abajo y verás aquí qué pantallas desbloquean.'
                                              })
                                          ]
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-500',
                                          children: [
                                            j &&
                                              e.jsxs('span', {
                                                children: [
                                                  'Inicio: ',
                                                  e.jsx('b', {
                                                    className: 'text-slate-700',
                                                    children: j
                                                  })
                                                ]
                                              }),
                                            e.jsxs('span', {
                                              children: [
                                                (l.permisos || []).length,
                                                ' permiso(s) marcados'
                                              ]
                                            }),
                                            t.some((f) => f.soloAdmin) &&
                                              e.jsx('span', {
                                                className: 'text-orange-600 font-bold',
                                                children: 'Configuración requiere además rol ADMIN'
                                              })
                                          ]
                                        })
                                      ]
                                    }),
                                    e.jsxs('div', {
                                      className: 'bg-white rounded-2xl border border-slate-200 p-5',
                                      children: [
                                        e.jsxs('h4', {
                                          className:
                                            'text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3',
                                          children: ['Usuarios con este rol (', y.length, ')']
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'flex flex-wrap gap-1.5 max-h-24 overflow-y-auto',
                                          children: [
                                            y.map((f, v) =>
                                              e.jsx(
                                                'span',
                                                {
                                                  className: `px-2.5 py-1 rounded-lg border text-[11px] font-bold ${f.activo ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'}`,
                                                  children: f.nombre
                                                },
                                                v
                                              )
                                            ),
                                            y.length === 0 &&
                                              e.jsx('span', {
                                                className: 'text-slate-400 text-xs font-bold',
                                                children: 'Nadie tiene este rol todavía.'
                                              })
                                          ]
                                        })
                                      ]
                                    })
                                  ]
                                });
                              })(),
                              e.jsxs('div', {
                                className: 'flex items-center justify-between mb-10',
                                children: [
                                  e.jsxs('h3', {
                                    className:
                                      'text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3',
                                    children: [
                                      e.jsx(xe, { size: 20, className: 'text-emerald-500' }),
                                      ' Configuración de Accesos por Módulo'
                                    ]
                                  }),
                                  w &&
                                    e.jsx('p', {
                                      className: 'text-xs font-bold text-slate-400 italic',
                                      children: 'Haz clic en un módulo o permiso para alternar'
                                    })
                                ]
                              }),
                              e.jsx('div', {
                                className:
                                  'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8',
                                children: vs.map((t) => {
                                  const j = t.permissions.map((A) => A.id),
                                    C = j.filter((A) => {
                                      var P;
                                      return (P = l.permisos) == null ? void 0 : P.includes(A);
                                    }).length,
                                    f = C === j.length,
                                    v = C === 0;
                                  return e.jsxs(
                                    'div',
                                    {
                                      className: `bg-white rounded-[2.5rem] border transition-all duration-500 ${f ? 'border-emerald-500 shadow-xl shadow-emerald-500/5' : 'border-slate-100 shadow-sm'}`,
                                      children: [
                                        e.jsxs('div', {
                                          className: `p-6 border-b transition-colors rounded-t-[2.5rem] flex items-center justify-between ${f ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50 border-slate-100'}`,
                                          children: [
                                            e.jsxs('div', {
                                              className: 'flex items-center gap-4',
                                              children: [
                                                e.jsx('div', {
                                                  className: `p-3 rounded-2xl transition-all ${f ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : v ? 'bg-white text-slate-300 border border-slate-100' : 'bg-orange-50 text-orange-500 border border-orange-100'}`,
                                                  children: t.icon
                                                }),
                                                e.jsxs('div', {
                                                  children: [
                                                    e.jsx('h4', {
                                                      className: `text-lg font-black tracking-tight ${f ? 'text-emerald-700' : 'text-slate-900'}`,
                                                      children: t.label
                                                    }),
                                                    !w &&
                                                      e.jsxs('span', {
                                                        className: `text-[10px] font-black uppercase tracking-widest ${f ? 'text-emerald-500' : 'text-slate-400'}`,
                                                        children: [C, ' de ', j.length, ' activos']
                                                      })
                                                  ]
                                                })
                                              ]
                                            }),
                                            w &&
                                              e.jsx('button', {
                                                onClick: () => K(t.id),
                                                className: `text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all ${f ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-200'}`,
                                                children: f ? 'Ninguno' : 'Todos'
                                              })
                                          ]
                                        }),
                                        e.jsx('div', {
                                          className: 'p-6 space-y-3',
                                          children: t.permissions.map((A) => {
                                            var R;
                                            const P =
                                              (R = l.permisos) == null ? void 0 : R.includes(A.id);
                                            return e.jsxs(
                                              'div',
                                              {
                                                role: 'checkbox',
                                                'aria-checked': P,
                                                className: `flex items-start gap-4 p-3 rounded-2xl transition-all ${w ? 'cursor-pointer hover:bg-slate-50 active:scale-[0.98]' : 'cursor-default opacity-80'}`,
                                                onClick: () => w && D(A.id),
                                                children: [
                                                  e.jsx('div', {
                                                    className: `mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${P ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-slate-200'}`,
                                                    children:
                                                      P && e.jsx(Je, { size: 14, strokeWidth: 4 })
                                                  }),
                                                  e.jsx('div', {
                                                    children: e.jsx('span', {
                                                      className: `text-sm block leading-tight tracking-tight ${P ? 'text-slate-900 font-black' : 'text-slate-500 font-bold'}`,
                                                      children: A.label
                                                    })
                                                  })
                                                ]
                                              },
                                              A.id
                                            );
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
            })
          ]
        });
  };
function pe({ filas: r = 5 }) {
  return e.jsx('div', {
    className: 'divide-y divide-slate-100',
    'aria-busy': 'true',
    'aria-label': 'Cargando',
    children: Array.from({ length: r }).map((c, p) =>
      e.jsxs(
        'div',
        {
          className: 'flex items-center gap-3 px-4 py-3',
          children: [
            e.jsx('div', { className: 'w-9 h-9 rounded-xl pda-skeleton shrink-0' }),
            e.jsxs('div', {
              className: 'flex-1 space-y-2',
              children: [
                e.jsx('div', { className: 'h-3 w-2/5 rounded pda-skeleton' }),
                e.jsx('div', { className: 'h-2.5 w-3/5 rounded pda-skeleton' })
              ]
            }),
            e.jsx('div', { className: 'h-6 w-16 rounded-lg pda-skeleton shrink-0' })
          ]
        },
        p
      )
    )
  });
}
function ue({ mensaje: r, onRetry: c }) {
  return e.jsxs('div', {
    className: 'py-12 text-center px-4',
    children: [
      e.jsx(ns, { size: 28, className: 'mx-auto text-red-400 mb-2' }),
      e.jsx('p', { className: 'text-slate-600 text-sm font-bold', children: 'No se pudo cargar' }),
      r &&
        e.jsx('p', {
          className: 'text-slate-400 text-[12px] mt-0.5 max-w-md mx-auto break-words',
          children: r
        }),
      c &&
        e.jsxs('button', {
          onClick: c,
          className:
            'mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50',
          children: [e.jsx(re, { size: 14 }), ' Reintentar']
        })
    ]
  });
}
function G({ children: r }) {
  return e.jsxs('div', {
    className: 'py-12 text-center text-slate-400 text-sm px-4 flex flex-col items-center gap-2',
    children: [e.jsx(ia, { size: 26, className: 'text-slate-300' }), e.jsx('span', { children: r })]
  });
}
const fs = [
    { id: 'centro_costo', label: 'Centro de costo' },
    { id: 'bodega', label: 'Bodega' }
  ],
  Ns = (r) => {
    if (!r) return null;
    const c = new Date(r);
    return isNaN(c)
      ? null
      : c.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  },
  je =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white',
  Ae = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';
function rt() {
  const { hasPermission: r, user: c, loading: p, isAuthenticated: u } = Ke(),
    l =
      r('manage_roles') ||
      (c == null ? void 0 : c.rol) === 'ADMIN' ||
      (c == null ? void 0 : c.es_admin_delegado),
    [m, w] = n.useState({ usuarios: [], roles: [], centros_costo: [] }),
    [i, h] = n.useState([]),
    [S, k] = n.useState(!0),
    [d, _] = n.useState(null),
    [x, y] = n.useState({
      userId: '',
      role: '',
      scopeType: 'centro_costo',
      scopeCode: '',
      expires: ''
    }),
    [I, O] = n.useState(!1),
    N = n.useCallback(async () => {
      if (p || !u || !l) {
        (w({ usuarios: [], roles: [], centros_costo: [] }), h([]), k(!1), _(null));
        return;
      }
      (k(!0), _(null));
      try {
        const [t, j] = await Promise.all([xs(), Fs()]);
        (w(t), h(j));
      } catch (t) {
        _(t.message || 'No se pudo cargar');
      } finally {
        k(!1);
      }
    }, [p, u, l]);
  n.useEffect(() => {
    N();
  }, [N]);
  const E = n.useMemo(
      () => (x.scopeType === 'centro_costo' ? m.centros_costo || [] : []),
      [x.scopeType, m.centros_costo]
    ),
    M = async () => {
      if (!x.userId || !x.role || !x.scopeCode) {
        b.error('Usuario, rol y código de ámbito son obligatorios');
        return;
      }
      O(!0);
      const t = await fa(x.userId, x.role, x.scopeType, x.scopeCode, x.expires || null);
      (O(!1),
        t != null && t.ok
          ? (b.success(t.accion === 'actualizado' ? 'Asignación actualizada' : 'Ámbito asignado'),
            y({ ...x, scopeCode: '', expires: '' }),
            N())
          : b.error((t == null ? void 0 : t.error) || 'Error al asignar'));
    },
    D = async (t) => {
      if (!window.confirm('¿Revocar esta asignación con ámbito?')) return;
      const j = await Na(t);
      j != null && j.ok
        ? (b.success('Revocada'), h((C) => C.filter((f) => f.id !== t)))
        : b.error((j == null ? void 0 : j.error) || 'Error');
    },
    K = (t) => {
      var j;
      return ((j = fs.find((C) => C.id === t)) == null ? void 0 : j.label) || t;
    };
  return e.jsxs('div', {
    className: 'space-y-4',
    children: [
      e.jsxs('div', {
        className: 'rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3 flex gap-3',
        children: [
          e.jsx(na, { size: 18, className: 'text-sky-500 shrink-0 mt-0.5' }),
          e.jsxs('p', {
            className: 'text-[12.5px] text-slate-600 leading-relaxed',
            children: [
              'Un ',
              e.jsx('b', { children: 'ámbito' }),
              ' otorga un rol ',
              e.jsx('b', { children: 'solo sobre ciertos datos' }),
              ' (p. ej. el centro de costo',
              ' ',
              e.jsx('span', { className: 'font-mono', children: '150' }),
              '). El permiso hace ',
              e.jsx('b', { children: 'visible' }),
              ' el módulo, y el',
              ' ',
              e.jsx('b', { children: 'filtrado por dato' }),
              ' se aplica donde el módulo adopte',
              e.jsx('span', { className: 'font-mono', children: ' can_on_scope' }),
              ' /',
              ' ',
              e.jsx('span', { className: 'font-mono', children: 'mis_scopes' }),
              '. El rol',
              e.jsx('b', { children: ' global' }),
              ' del usuario se gestiona en la pestaña ',
              e.jsx('b', { children: 'Usuarios' }),
              '; aquí se agregan grants ',
              e.jsx('b', { children: 'acotados' }),
              '.'
            ]
          })
        ]
      }),
      l &&
        e.jsxs('div', {
          className: 'rounded-2xl border border-slate-200 bg-white p-4',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-2 mb-3',
              children: [
                e.jsx(B, { size: 15, className: 'text-orange-500' }),
                e.jsx('h3', {
                  className: 'text-[12px] font-black text-slate-600 uppercase tracking-wide',
                  children: 'Otorgar rol con ámbito'
                })
              ]
            }),
            e.jsxs('div', {
              className: 'grid sm:grid-cols-2 lg:grid-cols-5 gap-3',
              children: [
                e.jsxs('label', {
                  className: 'block',
                  children: [
                    e.jsx('span', { className: Ae, children: 'Usuario' }),
                    e.jsxs('select', {
                      value: x.userId,
                      onChange: (t) => y({ ...x, userId: t.target.value }),
                      className: `${je} mt-1`,
                      children: [
                        e.jsx('option', { value: '', children: '—' }),
                        m.usuarios.map((t) =>
                          e.jsxs(
                            'option',
                            { value: t.id, children: [t.nombre, ' · ', t.correo] },
                            t.id
                          )
                        )
                      ]
                    })
                  ]
                }),
                e.jsxs('label', {
                  className: 'block',
                  children: [
                    e.jsx('span', { className: Ae, children: 'Rol' }),
                    e.jsxs('select', {
                      value: x.role,
                      onChange: (t) => y({ ...x, role: t.target.value }),
                      className: `${je} mt-1`,
                      children: [
                        e.jsx('option', { value: '', children: '—' }),
                        m.roles.map((t) =>
                          e.jsxs(
                            'option',
                            { value: t.codigo, children: [t.codigo, ' · ', t.nombre] },
                            t.codigo
                          )
                        )
                      ]
                    })
                  ]
                }),
                e.jsxs('label', {
                  className: 'block',
                  children: [
                    e.jsx('span', { className: Ae, children: 'Eje' }),
                    e.jsx('select', {
                      value: x.scopeType,
                      onChange: (t) => y({ ...x, scopeType: t.target.value, scopeCode: '' }),
                      className: `${je} mt-1`,
                      children: fs.map((t) =>
                        e.jsx('option', { value: t.id, children: t.label }, t.id)
                      )
                    })
                  ]
                }),
                e.jsxs('label', {
                  className: 'block',
                  children: [
                    e.jsx('span', { className: Ae, children: 'Código de ámbito' }),
                    E.length > 0
                      ? e.jsxs('select', {
                          value: x.scopeCode,
                          onChange: (t) => y({ ...x, scopeCode: t.target.value }),
                          className: `${je} mt-1`,
                          children: [
                            e.jsx('option', { value: '', children: '—' }),
                            E.map((t) => e.jsx('option', { value: t, children: t }, t))
                          ]
                        })
                      : e.jsx('input', {
                          value: x.scopeCode,
                          onChange: (t) => y({ ...x, scopeCode: t.target.value.trim() }),
                          placeholder: 'código',
                          className: `${je} mt-1`
                        })
                  ]
                }),
                e.jsxs('label', {
                  className: 'block',
                  children: [
                    e.jsx('span', { className: Ae, children: 'Expira (opcional)' }),
                    e.jsx('input', {
                      type: 'date',
                      value: x.expires,
                      onChange: (t) => y({ ...x, expires: t.target.value }),
                      className: `${je} mt-1`
                    })
                  ]
                })
              ]
            }),
            e.jsx('div', {
              className: 'mt-3 flex justify-end',
              children: e.jsxs('button', {
                onClick: M,
                disabled: I,
                className:
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50',
                children: [e.jsx(B, { size: 16 }), ' ', I ? 'Asignando…' : 'Asignar ámbito']
              })
            })
          ]
        }),
      e.jsxs('div', {
        className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
        children: [
          e.jsxs('div', {
            className:
              'px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5',
            children: [e.jsx(ts, { size: 12 }), ' Asignaciones con ámbito (', i.length, ')']
          }),
          S
            ? e.jsx(pe, {})
            : d
              ? e.jsx(ue, { mensaje: d, onRetry: N })
              : i.length === 0
                ? e.jsx(G, {
                    children: 'Sin asignaciones acotadas. Todos operan con su rol global.'
                  })
                : e.jsx('div', {
                    className: 'divide-y divide-slate-100',
                    children: i.map((t) =>
                      e.jsxs(
                        'div',
                        {
                          className: 'flex items-center gap-3 px-4 py-2.5 text-[13px]',
                          children: [
                            e.jsx($s, { size: 15, className: 'text-slate-300 shrink-0' }),
                            e.jsxs('div', {
                              className: 'min-w-0',
                              children: [
                                e.jsx('div', {
                                  className: 'font-bold text-slate-800 truncate',
                                  children: t.usuario || '—'
                                }),
                                e.jsx('div', {
                                  className: 'text-[11px] text-slate-400 truncate',
                                  children: t.correo
                                })
                              ]
                            }),
                            e.jsxs('span', {
                              className:
                                'inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0',
                              children: [
                                e.jsx(me, { size: 11, className: 'text-orange-500' }),
                                t.role
                              ]
                            }),
                            e.jsxs('span', {
                              className:
                                'inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 shrink-0',
                              children: [
                                e.jsx(Ge, { size: 11 }),
                                K(t.scope_type),
                                ': ',
                                e.jsx('span', { className: 'font-mono', children: t.scope_code })
                              ]
                            }),
                            Ns(t.expires_at) &&
                              e.jsxs('span', {
                                className:
                                  'inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 shrink-0',
                                children: [e.jsx(Ve, { size: 10 }), ' expira ', Ns(t.expires_at)]
                              }),
                            l &&
                              e.jsx('button', {
                                onClick: () => D(t.id),
                                'aria-label': 'Revocar asignación de ámbito',
                                title: 'Revocar',
                                className:
                                  'ml-auto w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0',
                                children: e.jsx(le, { size: 15 })
                              })
                          ]
                        },
                        t.id
                      )
                    )
                  })
        ]
      })
    ]
  });
}
const ot = (r) => {
    if (!r) return '—';
    const c = new Date(r);
    return isNaN(c)
      ? '—'
      : c.toLocaleString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
  },
  it = (r = '') => /Android|iPhone|iPad|Mobile|CCO|Capacitor/i.test(r),
  nt = (r = '') =>
    /Android/i.test(r)
      ? 'Android'
      : /iPhone|iPad/i.test(r)
        ? 'iOS'
        : /Edg/i.test(r)
          ? 'Edge'
          : /Chrome/i.test(r)
            ? 'Chrome'
            : /Firefox/i.test(r)
              ? 'Firefox'
              : /Safari/i.test(r)
                ? 'Safari'
                : 'Navegador';
function ct() {
  const [r, c] = n.useState([]),
    [p, u] = n.useState(!0),
    [l, m] = n.useState(null),
    [w, i] = n.useState(null),
    h = n.useCallback(async () => {
      (u(!0), m(null));
      try {
        c(await wa());
      } catch (d) {
        m(d.message || 'No autorizado');
      } finally {
        u(!1);
      }
    }, []);
  n.useEffect(() => {
    h();
  }, [h]);
  const S = async (d) => {
      if (
        !window.confirm(
          `¿Forzar el cierre de sesión de ${d.nombre}? Se revocarán sus sesiones activas.`
        )
      )
        return;
      i(d.auth_uid);
      const _ = await ya(d.auth_uid);
      (i(null),
        _ != null && _.ok
          ? (b.success(`Sesión revocada (${_.revocadas || 0})`), h())
          : b.error((_ == null ? void 0 : _.error) || 'Error'));
    },
    k = (d) => d.estado === 'online' || d.estado === 'conectado';
  return e.jsxs('div', {
    className: 'space-y-4',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between',
        children: [
          e.jsxs('p', {
            className: 'text-[13px] text-slate-500',
            children: [
              'Sesiones activas (Supabase Auth) con presencia y último acceso. ',
              r.length,
              ' en total.'
            ]
          }),
          e.jsxs('button', {
            onClick: h,
            className:
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50',
            children: [e.jsx(re, { size: 14 }), ' Actualizar']
          })
        ]
      }),
      e.jsx('div', {
        className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
        children: p
          ? e.jsx(pe, {})
          : l
            ? e.jsx(ue, { mensaje: l, onRetry: h })
            : r.length === 0
              ? e.jsx(G, { children: 'No hay sesiones activas.' })
              : e.jsx('div', {
                  className: 'divide-y divide-slate-100',
                  children: r.map((d) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex items-center gap-3 px-4 py-3 text-[13px]',
                        children: [
                          e.jsxs('div', {
                            className: 'relative shrink-0',
                            children: [
                              e.jsx('div', {
                                className:
                                  'w-9 h-9 rounded-xl bg-slate-100 grid place-items-center text-slate-400',
                                children: it(d.user_agent)
                                  ? e.jsx(ca, { size: 17 })
                                  : e.jsx(da, { size: 17 })
                              }),
                              e.jsx(Is, {
                                size: 9,
                                className: `absolute -bottom-0.5 -right-0.5 rounded-full ${k(d) ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 fill-slate-300'}`
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'min-w-0 flex-1',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2 flex-wrap',
                                children: [
                                  e.jsx('span', {
                                    className: 'font-black text-slate-800 truncate',
                                    children: d.nombre
                                  }),
                                  e.jsx('span', {
                                    className:
                                      'text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5',
                                    children: d.rol
                                  }),
                                  d.mfa &&
                                    e.jsxs('span', {
                                      className:
                                        'inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5',
                                      children: [e.jsx(me, { size: 9 }), '2FA']
                                    }),
                                  d.aal === 'aal2' &&
                                    e.jsx('span', {
                                      className:
                                        'text-[10px] font-bold text-sky-600 bg-sky-50 rounded px-1.5 py-0.5',
                                      children: 'AAL2'
                                    }),
                                  d.modulo &&
                                    e.jsxs('span', {
                                      className: 'text-[10px] text-slate-400',
                                      children: ['· ', d.modulo]
                                    })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'text-[11px] text-slate-400 truncate',
                                children: [
                                  nt(d.user_agent),
                                  ' · ',
                                  d.ip || 's/IP',
                                  ' · visto',
                                  ' ',
                                  ot(d.refreshed_at || d.created_at)
                                ]
                              })
                            ]
                          }),
                          e.jsxs('button', {
                            onClick: () => S(d),
                            disabled: w === d.auth_uid,
                            className:
                              'shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-[12px] font-bold hover:bg-red-50 disabled:opacity-50',
                            children: [
                              e.jsx(xa, { size: 13 }),
                              ' ',
                              w === d.auth_uid ? '…' : 'Cerrar'
                            ]
                          })
                        ]
                      },
                      d.session_id
                    )
                  )
                })
      }),
      e.jsxs('p', {
        className: 'text-[11px] text-slate-400 flex items-center gap-1.5',
        children: [
          e.jsx($s, { size: 12 }),
          ' «Cerrar» revoca las sesiones (refresh tokens) y avisa al equipo por realtime para el cierre inmediato.'
        ]
      })
    ]
  });
}
const dt = (r) => {
    if (!r) return '—';
    const c = new Date(r);
    return isNaN(c)
      ? '—'
      : c.toLocaleString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
  },
  Le =
    'border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400 bg-white',
  xt = {
    INSERT: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    UPDATE: 'text-amber-700 bg-amber-50 border-amber-100',
    DELETE: 'text-red-700 bg-red-50 border-red-100',
    FORCE_LOGOUT: 'text-purple-700 bg-purple-50 border-purple-100'
  };
function mt(r, c) {
  const p = r || {},
    u = c || {},
    l = Array.from(new Set([...Object.keys(p), ...Object.keys(u)])).sort(),
    m = [];
  for (const w of l) {
    const i = p[w],
      h = u[w],
      S = i === void 0 ? void 0 : JSON.stringify(i),
      k = h === void 0 ? void 0 : JSON.stringify(h);
    S !== k &&
      m.push({
        k: w,
        tipo: S === void 0 ? 'add' : k === void 0 ? 'del' : 'mod',
        antes: S,
        despues: k
      });
  }
  return m;
}
function pt({ r }) {
  const [c, p] = n.useState(!1),
    u = n.useMemo(() => (r.antes || r.despues ? mt(r.antes, r.despues) : []), [r]),
    l = xt[r.accion] || 'text-slate-600 bg-slate-50 border-slate-200';
  return e.jsxs('div', {
    className: 'text-[13px]',
    children: [
      e.jsxs('button', {
        onClick: () => p((m) => !m),
        'aria-label': c ? 'Contraer detalle' : 'Ver detalle del evento',
        'aria-expanded': c,
        className: 'w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-left',
        children: [
          u.length > 0
            ? c
              ? e.jsx(Ms, { size: 14, className: 'text-slate-400 shrink-0' })
              : e.jsx(Ds, { size: 14, className: 'text-slate-400 shrink-0' })
            : e.jsx('span', { className: 'w-3.5 shrink-0' }),
          e.jsx('span', {
            className: `text-[10px] font-black rounded px-1.5 py-0.5 border shrink-0 ${l}`,
            children: r.accion
          }),
          e.jsx('span', {
            className: 'font-mono text-[11px] text-slate-500 shrink-0',
            children: r.tabla
          }),
          e.jsxs('span', {
            className: 'text-slate-600 truncate',
            children: [
              'reg. ',
              e.jsx('span', { className: 'font-mono text-[11px]', children: r.registro_id || '—' })
            ]
          }),
          e.jsxs('span', {
            className: 'ml-auto text-slate-500 shrink-0 truncate max-w-[160px]',
            children: [r.actor, r.actor_rol ? ` · ${r.actor_rol}` : '']
          }),
          e.jsx('span', {
            className: 'text-[11px] text-slate-400 shrink-0 tabular-nums',
            children: dt(r.ts)
          })
        ]
      }),
      c &&
        u.length > 0 &&
        e.jsx('div', {
          className: 'px-4 pb-3 pl-11',
          children: e.jsx('div', {
            className:
              'rounded-xl border border-slate-100 bg-slate-50/60 divide-y divide-slate-100 overflow-hidden',
            children: u.map((m) =>
              e.jsxs(
                'div',
                {
                  className: 'flex items-start gap-2 px-3 py-1.5 text-[12px]',
                  children: [
                    m.tipo === 'add'
                      ? e.jsx(B, { size: 12, className: 'text-emerald-500 mt-0.5 shrink-0' })
                      : m.tipo === 'del'
                        ? e.jsx(ma, { size: 12, className: 'text-red-500 mt-0.5 shrink-0' })
                        : e.jsx(Ts, { size: 11, className: 'text-amber-500 mt-0.5 shrink-0' }),
                    e.jsx('span', {
                      className: 'font-mono font-bold text-slate-600 shrink-0',
                      children: m.k
                    }),
                    e.jsxs('span', {
                      className: 'min-w-0 break-all',
                      children: [
                        m.antes !== void 0 &&
                          e.jsx('span', {
                            className: 'text-red-500 line-through mr-2',
                            children: m.antes
                          }),
                        m.despues !== void 0 &&
                          e.jsx('span', { className: 'text-emerald-600', children: m.despues })
                      ]
                    })
                  ]
                },
                m.k
              )
            )
          })
        })
    ]
  });
}
function ut() {
  const [r, c] = n.useState([]),
    [p, u] = n.useState({ tablas: [], acciones: [], total: 0 }),
    [l, m] = n.useState({ tabla: '', accion: '', desde: '', hasta: '' }),
    [w, i] = n.useState(!0),
    [h, S] = n.useState(null),
    k = n.useCallback(async () => {
      (i(!0), S(null));
      try {
        c(
          await _a({ tabla: l.tabla, accion: l.accion, desde: l.desde, hasta: l.hasta, limit: 300 })
        );
      } catch (d) {
        S(d.message || 'No autorizado');
      } finally {
        i(!1);
      }
    }, [l]);
  return (
    n.useEffect(() => {
      k();
    }, [k]),
    n.useEffect(() => {
      ka()
        .then(u)
        .catch(() => {});
    }, []),
    e.jsxs('div', {
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          className: 'flex items-center gap-2 flex-wrap',
          children: [
            e.jsxs('select', {
              value: l.tabla,
              onChange: (d) => m({ ...l, tabla: d.target.value }),
              className: Le,
              children: [
                e.jsx('option', { value: '', children: 'Todas las tablas' }),
                p.tablas.map((d) => e.jsx('option', { value: d, children: d }, d))
              ]
            }),
            e.jsxs('select', {
              value: l.accion,
              onChange: (d) => m({ ...l, accion: d.target.value }),
              className: Le,
              children: [
                e.jsx('option', { value: '', children: 'Toda acción' }),
                p.acciones.map((d) => e.jsx('option', { value: d, children: d }, d))
              ]
            }),
            e.jsx('input', {
              type: 'date',
              value: l.desde,
              onChange: (d) => m({ ...l, desde: d.target.value }),
              className: Le
            }),
            e.jsx('input', {
              type: 'date',
              value: l.hasta,
              onChange: (d) => m({ ...l, hasta: d.target.value }),
              className: Le
            }),
            e.jsxs('button', {
              onClick: k,
              className:
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50',
              children: [e.jsx(re, { size: 14 }), ' Aplicar']
            }),
            e.jsxs('span', {
              className: 'ml-auto text-[11px] text-slate-400 inline-flex items-center gap-1.5',
              children: [e.jsx(ds, { size: 13 }), ' ', p.total, ' eventos registrados']
            })
          ]
        }),
        e.jsx('div', {
          className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
          children: w
            ? e.jsx(pe, {})
            : h
              ? e.jsx(ue, { mensaje: h, onRetry: k })
              : r.length === 0
                ? e.jsx(G, { children: 'Sin registros para el filtro.' })
                : e.jsx('div', {
                    className: 'divide-y divide-slate-100',
                    children: r.map((d) => e.jsx(pt, { r: d }, d.id))
                  })
        }),
        e.jsx('p', {
          className: 'text-[11px] text-slate-400',
          children:
            'Clic en un evento para ver el diff (antes → después). Cubre roles, usuarios y ámbitos IAM.'
        })
      ]
    })
  );
}
const de = ({ label: r, value: c }) =>
  e.jsxs('div', {
    className: 'rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center',
    children: [
      e.jsx('div', {
        className: 'text-lg font-black text-slate-800 tabular-nums',
        children: c ?? '—'
      }),
      e.jsx('div', {
        className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wide',
        children: r
      })
    ]
  });
function bt(r) {
  const c = [];
  for (const p of r.split(`
`)) {
    const u = p.trim();
    if (!u) continue;
    const l = u.split(/[,\t;]/).map((S) => S.trim()),
      [m, w, i, h] = l;
    (!m && !w) || c.push({ nombre: m || '', email: w || '', rol: i || '', password: h || void 0 });
  }
  return c;
}
function gt() {
  var I, O;
  const [r, c] = n.useState({}),
    [p, u] = n.useState(!1),
    [l, m] = n.useState(''),
    [w, i] = n.useState(!1),
    [h, S] = n.useState(null),
    k = n.useCallback(async () => {
      try {
        c(await Ca());
      } catch (N) {
        b.error(N.message || 'No autorizado');
      }
    }, []);
  n.useEffect(() => {
    k();
  }, [k]);
  const d = n.useMemo(() => bt(l), [l]),
    _ = async () => {
      u(!0);
      const N = await Us();
      (u(!1),
        N != null && N.ok
          ? (b.success(`Permisos recalculados (${N.filas} filas)`), k())
          : b.error((N == null ? void 0 : N.error) || 'Error'));
    },
    x = async () => {
      var E;
      if (d.length === 0) {
        b.error('Pega al menos una fila (nombre, email, rol)');
        return;
      }
      if (
        !window.confirm(`¿Cargar ${d.length} usuario(s)? Se crearán identidades reales de acceso.`)
      )
        return;
      (i(!0), S(null));
      const N = await Sa(d);
      (i(!1),
        N != null && N.ok
          ? (S(N),
            b.success(
              `${N.creados} creados · ${N.actualizados} actualizados${(E = N.errores) != null && E.length ? ` · ${N.errores.length} con error` : ''}`
            ),
            k())
          : b.error((N == null ? void 0 : N.error) || 'Error en la carga'));
    },
    y = () => {
      var E;
      const N = ((h == null ? void 0 : h.detalle) || [])
        .filter((M) => M.password)
        .map((M) => `${M.email}	${M.password}`).join(`
`);
      if (!N) {
        b.info('No hay contraseñas generadas');
        return;
      }
      ((E = navigator.clipboard) == null || E.writeText(N), b.success('Credenciales copiadas'));
    };
  return e.jsxs('div', {
    className: 'space-y-4',
    children: [
      e.jsxs('div', {
        className: 'rounded-2xl border border-slate-200 bg-white p-4',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between mb-3',
            children: [
              e.jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(Os, { size: 16, className: 'text-orange-500' }),
                  e.jsx('h3', {
                    className: 'text-[12px] font-black text-slate-600 uppercase tracking-wide',
                    children: 'Permisos efectivos (escala)'
                  })
                ]
              }),
              e.jsxs('button', {
                onClick: _,
                disabled: p,
                className:
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50',
                children: [
                  p ? e.jsx(Ne, { size: 14, className: 'animate-spin' }) : e.jsx(re, { size: 14 }),
                  ' ',
                  'Recalcular ahora'
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-3 sm:grid-cols-7 gap-2',
            children: [
              e.jsx(de, { label: 'Usuarios', value: r.usuarios }),
              e.jsx(de, { label: 'Roles', value: r.roles }),
              e.jsx(de, { label: 'Permisos', value: r.permisos }),
              e.jsx(de, { label: 'Asignaciones', value: r.asignaciones }),
              e.jsx(de, { label: 'Con ámbito', value: r.con_ambito }),
              e.jsx(de, { label: 'Filas MV', value: r.filas_mv }),
              e.jsx(de, { label: 'Pares efect.', value: r.pares_efectivos })
            ]
          }),
          e.jsxs('p', {
            className: 'text-[11px] text-slate-400 mt-2 flex items-center gap-1.5',
            children: [
              e.jsx(pa, { size: 12 }),
              ' La vista materializada',
              ' ',
              e.jsx('code', { className: 'font-mono', children: 'iam.mv_user_permissions' }),
              ' se refresca automáticamente cada 5 min (pg_cron) y aquí a demanda. El gate de permisos usa la vista viva (sin retraso en revocaciones).'
            ]
          })
        ]
      }),
      e.jsxs('div', {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 space-y-3',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsx(W, { size: 16, className: 'text-orange-500' }),
              e.jsx('h3', {
                className: 'text-[12px] font-black text-slate-600 uppercase tracking-wide',
                children: 'Carga masiva de usuarios'
              })
            ]
          }),
          e.jsxs('p', {
            className: 'text-[12px] text-slate-500',
            children: [
              'Una línea por usuario:',
              ' ',
              e.jsx('code', {
                className: 'font-mono bg-slate-50 border border-slate-200 rounded px-1',
                children: 'nombre, email, rol[, contraseña]'
              }),
              '. Si omites la contraseña, se genera y se te muestra para distribuirla. El email existente',
              ' ',
              e.jsx('b', { children: 'actualiza' }),
              ' (no duplica).'
            ]
          }),
          e.jsx('textarea', {
            value: l,
            onChange: (N) => m(N.target.value),
            rows: 7,
            placeholder: `Juan Pérez, juan@ptm.cl, OPERADOR
María Soto, maria@ptm.cl, SUPERVISOR_, Clave123`,
            className:
              'w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-mono outline-none focus:border-orange-400 resize-y'
          }),
          e.jsxs('div', {
            className: 'flex items-center justify-between',
            children: [
              e.jsxs('span', {
                className: 'text-[12px] text-slate-400',
                children: [d.length, ' fila(s) detectada(s)']
              }),
              e.jsxs('button', {
                onClick: x,
                disabled: w || d.length === 0,
                className:
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50',
                children: [
                  w ? e.jsx(Ne, { size: 16, className: 'animate-spin' }) : e.jsx(ua, { size: 16 }),
                  ' ',
                  'Cargar usuarios'
                ]
              })
            ]
          }),
          h &&
            e.jsxs('div', {
              className: 'rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-2',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3 text-[13px] font-bold',
                  children: [
                    e.jsxs('span', {
                      className: 'inline-flex items-center gap-1 text-emerald-600',
                      children: [e.jsx(Je, { size: 14 }), ' ', h.creados, ' creados']
                    }),
                    e.jsxs('span', {
                      className: 'inline-flex items-center gap-1 text-sky-600',
                      children: [e.jsx(re, { size: 13 }), ' ', h.actualizados, ' actualizados']
                    }),
                    ((I = h.errores) == null ? void 0 : I.length) > 0 &&
                      e.jsxs('span', {
                        className: 'inline-flex items-center gap-1 text-red-500',
                        children: [e.jsx(ns, { size: 13 }), ' ', h.errores.length, ' error(es)']
                      }),
                    (h.detalle || []).some((N) => N.password) &&
                      e.jsxs('button', {
                        onClick: y,
                        className:
                          'ml-auto inline-flex items-center gap-1 text-[12px] font-bold text-orange-600 hover:text-orange-700',
                        children: [e.jsx(ba, { size: 12 }), ' Copiar credenciales']
                      })
                  ]
                }),
                ((O = h.errores) == null ? void 0 : O.length) > 0 &&
                  e.jsx('ul', {
                    className: 'text-[12px] text-red-500 space-y-0.5',
                    children: h.errores.map((N, E) =>
                      e.jsxs(
                        'li',
                        { className: 'font-mono', children: [N.email, ': ', N.error] },
                        E
                      )
                    )
                  }),
                (h.detalle || []).filter((N) => N.password).length > 0 &&
                  e.jsxs('div', {
                    className: 'text-[12px] text-slate-600',
                    children: [
                      e.jsx('p', {
                        className: 'font-bold mb-1',
                        children: 'Contraseñas generadas (distribúyelas de forma segura):'
                      }),
                      e.jsx('ul', {
                        className: 'font-mono space-y-0.5',
                        children: h.detalle
                          .filter((N) => N.password)
                          .map((N, E) =>
                            e.jsxs('li', { children: [N.email, ' → ', N.password] }, E)
                          )
                      })
                    ]
                  })
              ]
            })
        ]
      })
    ]
  });
}
const ae =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white',
  te = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide',
  ht = JSON.stringify(
    {
      all: [
        {
          any: [
            { attr: 'ctx.sin_limite_centro', op: 'eq', value: !0 },
            { attr: 'row.centro_costo', op: 'in', value: 'ctx.centros_costo' }
          ]
        },
        { attr: 'row.estado', op: 'nin', value: ['DESPACHADO', 'ENTREGADO'] }
      ]
    },
    null,
    2
  );
function jt({ data: r, onClose: c, onSave: p }) {
  const u = !!r.codigo,
    [l, m] = n.useState({
      codigo: r.codigo || '',
      recurso: r.recurso || 'nv',
      accion: r.accion || 'editar',
      descripcion: r.descripcion || '',
      activo: r.activo !== !1,
      condicion: JSON.stringify(r.condicion || {}, null, 2)
    }),
    w = () => {
      let i;
      try {
        i = JSON.parse(l.condicion || '{}');
      } catch {
        b.error('La condición no es JSON válido');
        return;
      }
      if (!l.codigo || !l.recurso || !l.accion) {
        b.error('Código, recurso y acción son obligatorios');
        return;
      }
      p({ ...l, condicion: i });
    };
  return e.jsxs('div', {
    className: 'fixed inset-0 z-[130] flex items-center justify-center p-4',
    onClick: c,
    children: [
      e.jsx('div', { className: 'absolute inset-0 bg-slate-900/40 backdrop-blur-sm' }),
      e.jsxs('div', {
        onClick: (i) => i.stopPropagation(),
        className:
          'relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between mb-3',
            children: [
              e.jsx('h3', {
                className: 'text-[15px] font-black text-slate-800',
                children: u ? `Editar política ${r.codigo}` : 'Nueva política'
              }),
              e.jsx('button', {
                onClick: c,
                className: 'text-slate-400 hover:text-slate-600',
                children: e.jsx(cs, { size: 18 })
              })
            ]
          }),
          e.jsxs('div', {
            className: 'space-y-3',
            children: [
              e.jsxs('div', {
                className: 'grid grid-cols-3 gap-2',
                children: [
                  e.jsxs('label', {
                    className: 'block col-span-1',
                    children: [
                      e.jsx('span', { className: te, children: 'Recurso' }),
                      e.jsx('input', {
                        value: l.recurso,
                        onChange: (i) => m({ ...l, recurso: i.target.value.trim() }),
                        className: `${ae} mt-1`
                      })
                    ]
                  }),
                  e.jsxs('label', {
                    className: 'block col-span-1',
                    children: [
                      e.jsx('span', { className: te, children: 'Acción' }),
                      e.jsx('input', {
                        value: l.accion,
                        onChange: (i) => m({ ...l, accion: i.target.value.trim() }),
                        className: `${ae} mt-1`
                      })
                    ]
                  }),
                  e.jsxs('label', {
                    className: 'block col-span-1',
                    children: [
                      e.jsx('span', { className: te, children: 'Activa' }),
                      e.jsxs('select', {
                        value: l.activo ? '1' : '0',
                        onChange: (i) => m({ ...l, activo: i.target.value === '1' }),
                        className: `${ae} mt-1`,
                        children: [
                          e.jsx('option', { value: '1', children: 'Sí' }),
                          e.jsx('option', { value: '0', children: 'No' })
                        ]
                      })
                    ]
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: te, children: 'Código' }),
                  e.jsx('input', {
                    disabled: u,
                    value: l.codigo,
                    onChange: (i) => m({ ...l, codigo: i.target.value.trim() }),
                    placeholder: 'nv_editar_ambito',
                    className: `${ae} mt-1 ${u ? 'bg-slate-50 text-slate-400' : ''}`
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: te, children: 'Descripción' }),
                  e.jsx('input', {
                    value: l.descripcion,
                    onChange: (i) => m({ ...l, descripcion: i.target.value }),
                    className: `${ae} mt-1`
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      e.jsx('span', { className: te, children: 'Condición (JSON DSL)' }),
                      e.jsx('button', {
                        onClick: () => m({ ...l, condicion: ht }),
                        className: 'text-[11px] font-bold text-orange-600 hover:text-orange-700',
                        children: 'Insertar plantilla'
                      })
                    ]
                  }),
                  e.jsx('textarea', {
                    value: l.condicion,
                    onChange: (i) => m({ ...l, condicion: i.target.value }),
                    rows: 10,
                    className: `${ae} mt-1 font-mono text-[12px] resize-y`
                  })
                ]
              }),
              e.jsxs('p', {
                className: 'text-[11px] text-slate-400',
                children: [
                  'Combinadores: ',
                  e.jsx('code', { children: 'all' }),
                  ' / ',
                  e.jsx('code', { children: 'any' }),
                  ' / ',
                  e.jsx('code', { children: 'not' }),
                  '. Hoja:',
                  ' ',
                  e.jsx('code', { children: '{attr, op, value}' }),
                  '. Ops: eq, neq, in, nin, contains, gt/lt/gte/lte, is_null, not_null. Referencias: ',
                  e.jsx('code', { children: 'ctx.*' }),
                  ' y ',
                  e.jsx('code', { children: 'row.*' }),
                  '.'
                ]
              }),
              e.jsx('button', {
                onClick: w,
                className:
                  'w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600',
                children: 'Guardar política'
              })
            ]
          })
        ]
      })
    ]
  });
}
function vt({ p: r, onToggle: c, onEdit: p }) {
  const [u, l] = n.useState(!1);
  return e.jsxs('div', {
    className: 'text-[13px]',
    children: [
      e.jsxs('div', {
        className: 'flex items-center gap-2.5 px-4 py-2.5',
        children: [
          e.jsx('button', {
            onClick: () => l((m) => !m),
            'aria-label': u ? 'Contraer condición' : 'Ver condición',
            'aria-expanded': u,
            className: 'text-slate-400 shrink-0',
            children: u ? e.jsx(Ms, { size: 15 }) : e.jsx(Ds, { size: 15 })
          }),
          e.jsx('span', {
            className: `w-2 h-2 rounded-full shrink-0 ${r.activo ? 'bg-emerald-500' : 'bg-slate-300'}`
          }),
          e.jsxs('div', {
            className: 'min-w-0 flex-1',
            children: [
              e.jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx('span', { className: 'font-black text-slate-800', children: r.codigo }),
                  e.jsxs('span', {
                    className:
                      'text-[10px] font-mono text-slate-400 bg-slate-100 rounded px-1.5 py-0.5',
                    children: [r.recurso, '·', r.accion]
                  }),
                  r.es_sistema &&
                    e.jsx('span', {
                      className:
                        'text-[9px] font-bold text-slate-400 bg-slate-100 rounded px-1 py-0.5',
                      children: 'sistema'
                    })
                ]
              }),
              e.jsx('div', {
                className: 'text-[11px] text-slate-400 truncate',
                children: r.descripcion
              })
            ]
          }),
          e.jsx('button', {
            onClick: () => c(r),
            title: r.activo ? 'Desactivar' : 'Activar',
            className: `w-8 h-8 rounded-lg grid place-items-center shrink-0 ${r.activo ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`,
            children: r.activo ? e.jsx(Es, { size: 15 }) : e.jsx(Rs, { size: 15 })
          }),
          e.jsx('button', {
            onClick: () => p(r),
            className:
              'w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-400 shrink-0',
            children: e.jsx(Ts, { size: 14 })
          })
        ]
      }),
      u &&
        e.jsx('pre', {
          className:
            'mx-4 mb-3 ml-11 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-[11px] font-mono text-slate-600 overflow-x-auto',
          children: JSON.stringify(r.condicion, null, 2)
        })
    ]
  });
}
function ft() {
  var j, C, f;
  const [r, c] = n.useState([]),
    [p, u] = n.useState(!0),
    [l, m] = n.useState(null),
    [w, i] = n.useState(null),
    [h, S] = n.useState(''),
    [k, d] = n.useState(''),
    [_, x] = n.useState([]),
    [y, I] = n.useState(null),
    [O, N] = n.useState(!1),
    E = n.useCallback(async () => {
      (u(!0), m(null));
      try {
        c(await za());
      } catch (v) {
        m(v.message || 'No autorizado');
      } finally {
        u(!1);
      }
    }, []);
  n.useEffect(() => {
    (E(),
      xs()
        .then((v) => x(v.usuarios || []))
        .catch(() => {}));
  }, [E]);
  const M = async (v) => {
      const A = await Aa(v);
      A != null && A.ok
        ? (b.success('Política guardada'), i(null), E())
        : b.error((A == null ? void 0 : A.error) || 'Error');
    },
    D = async (v) => {
      const A = await Ea(v.id, !v.activo);
      A != null && A.ok
        ? c((P) => P.map((R) => (R.id === v.id ? { ...R, activo: !v.activo } : R)))
        : b.error((A == null ? void 0 : A.error) || 'Error');
    },
    K = async () => {
      if (!h) {
        b.error('Ingresa el ID de una N.V. (tms_operaciones.id)');
        return;
      }
      (N(!0), I(null));
      try {
        I(await Ra(Number(h), k || null));
      } catch (v) {
        b.error(v.message || 'Error');
      } finally {
        N(!1);
      }
    },
    t = y == null ? void 0 : y.contexto;
  return e.jsxs('div', {
    className: 'space-y-4',
    children: [
      e.jsxs('div', {
        className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between px-4 py-2.5 border-b border-slate-100',
            children: [
              e.jsxs('span', {
                className:
                  'text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5',
                children: [e.jsx(ds, { size: 12 }), ' Políticas condicionales (', r.length, ')']
              }),
              e.jsxs('button', {
                onClick: () => i({}),
                className:
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[12px] font-bold hover:bg-orange-600',
                children: [e.jsx(B, { size: 14 }), ' Nueva']
              })
            ]
          }),
          p
            ? e.jsx(pe, {})
            : l
              ? e.jsx(ue, { mensaje: l, onRetry: E })
              : r.length === 0
                ? e.jsx(G, { children: 'Sin políticas.' })
                : e.jsx('div', {
                    className: 'divide-y divide-slate-100',
                    children: r.map((v) =>
                      e.jsx(vt, { p: v, onToggle: D, onEdit: (A) => i(A) }, v.id)
                    )
                  })
        ]
      }),
      e.jsxs('div', {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 space-y-3',
        children: [
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              e.jsx(ls, { size: 16, className: 'text-orange-500' }),
              e.jsx('h3', {
                className: 'text-[12px] font-black text-slate-600 uppercase tracking-wide',
                children: 'Probador — ¿puede editar una N.V.?'
              })
            ]
          }),
          e.jsxs('div', {
            className: 'flex flex-wrap items-end gap-2',
            children: [
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: te, children: 'ID de N.V. (tms_operaciones.id)' }),
                  e.jsx('input', {
                    value: h,
                    onChange: (v) => S(v.target.value.replace(/\D/g, '')),
                    inputMode: 'numeric',
                    placeholder: '1234',
                    className: `${ae} mt-1 w-40`
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: te, children: 'Como usuario' }),
                  e.jsxs('select', {
                    value: k,
                    onChange: (v) => d(v.target.value),
                    className: `${ae} mt-1 w-56`,
                    children: [
                      e.jsx('option', { value: '', children: '— yo (admin) —' }),
                      _.map((v) => e.jsx('option', { value: v.id, children: v.nombre }, v.id))
                    ]
                  })
                ]
              }),
              e.jsxs('button', {
                onClick: K,
                disabled: O,
                className:
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 disabled:opacity-50',
                children: [e.jsx(ls, { size: 15 }), ' ', O ? 'Evaluando…' : 'Evaluar']
              })
            ]
          }),
          y &&
            (y.error
              ? e.jsx('p', {
                  className: 'text-red-500 text-[13px] font-semibold',
                  children: y.error
                })
              : e.jsxs('div', {
                  className: `rounded-xl border p-3 ${y.permitida ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'}`,
                  children: [
                    e.jsx('div', {
                      className: 'flex items-center gap-2 font-black text-[14px] mb-2',
                      children: y.permitida
                        ? e.jsxs(e.Fragment, {
                            children: [
                              e.jsx(Je, { size: 17, className: 'text-emerald-600' }),
                              e.jsx('span', {
                                className: 'text-emerald-700',
                                children: 'PERMITIDO'
                              })
                            ]
                          })
                        : e.jsxs(e.Fragment, {
                            children: [
                              e.jsx(as, { size: 16, className: 'text-red-500' }),
                              e.jsx('span', { className: 'text-red-600', children: 'DENEGADO' })
                            ]
                          })
                    }),
                    e.jsxs('div', {
                      className: 'grid sm:grid-cols-2 gap-3 text-[12px]',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('p', {
                              className: 'font-bold text-slate-500 mb-1',
                              children: 'N.V.'
                            }),
                            e.jsxs('ul', {
                              className: 'text-slate-600 space-y-0.5',
                              children: [
                                e.jsxs('li', {
                                  children: [
                                    'Centro de costo:',
                                    ' ',
                                    e.jsx('b', {
                                      className: 'font-mono',
                                      children:
                                        ((j = y.nv) == null ? void 0 : j.centro_costo) || '—'
                                    })
                                  ]
                                }),
                                e.jsxs('li', {
                                  children: [
                                    'Estado: ',
                                    e.jsx('b', {
                                      children: ((C = y.nv) == null ? void 0 : C.estado) || '—'
                                    })
                                  ]
                                }),
                                e.jsxs('li', {
                                  children: [
                                    'Vendedor: ',
                                    ((f = y.nv) == null ? void 0 : f.vendedor) || '—'
                                  ]
                                })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsx('p', {
                              className: 'font-bold text-slate-500 mb-1',
                              children: 'Contexto del usuario'
                            }),
                            e.jsxs('ul', {
                              className: 'text-slate-600 space-y-0.5',
                              children: [
                                e.jsxs('li', {
                                  children: [
                                    'Rol: ',
                                    e.jsx('b', { children: (t == null ? void 0 : t.rol) || '—' }),
                                    (t == null ? void 0 : t.es_admin) &&
                                      e.jsx('span', {
                                        className: 'ml-1 text-[10px] font-bold text-orange-600',
                                        children: 'admin'
                                      })
                                  ]
                                }),
                                e.jsxs('li', {
                                  children: [
                                    'Sin límite de centro: ',
                                    e.jsx('b', {
                                      children: t != null && t.sin_limite_centro ? 'sí' : 'no'
                                    })
                                  ]
                                }),
                                e.jsxs('li', {
                                  children: [
                                    'Centros:',
                                    ' ',
                                    e.jsx('span', {
                                      className: 'font-mono',
                                      children:
                                        ((t == null ? void 0 : t.centros_costo) || []).join(', ') ||
                                        '(ninguno)'
                                    })
                                  ]
                                })
                              ]
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }))
        ]
      }),
      w && e.jsx(jt, { data: w, onClose: () => i(null), onSave: M })
    ]
  });
}
const ws = (r) => {
    if (!r) return '—';
    const c = new Date(r);
    return isNaN(c)
      ? '—'
      : c.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  },
  ve =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white',
  fe = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';
function Nt({ usuarios: r, roles: c, onClose: p, onSave: u }) {
  const [l, m] = n.useState({
      delegador: '',
      delegado: '',
      role: '',
      desde: '',
      hasta: '',
      motivo: ''
    }),
    w = () => {
      if (!l.delegador || !l.delegado || !l.hasta) {
        b.error('Delegador, cobertura y fecha de término son obligatorios');
        return;
      }
      if (l.delegador === l.delegado) {
        b.error('El delegador y la cobertura deben ser distintos');
        return;
      }
      u({
        delegador: l.delegador,
        delegado: l.delegado,
        role: l.role || null,
        motivo: l.motivo || null,
        desde: l.desde ? new Date(l.desde).toISOString() : null,
        hasta: new Date(l.hasta).toISOString()
      });
    };
  return e.jsxs('div', {
    className: 'fixed inset-0 z-[130] flex items-center justify-center p-4',
    onClick: p,
    children: [
      e.jsx('div', { className: 'absolute inset-0 bg-slate-900/40 backdrop-blur-sm' }),
      e.jsxs('div', {
        onClick: (i) => i.stopPropagation(),
        className: 'relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between mb-3',
            children: [
              e.jsx('h3', {
                className: 'text-[15px] font-black text-slate-800',
                children: 'Nueva delegación'
              }),
              e.jsx('button', {
                onClick: p,
                className: 'text-slate-400 hover:text-slate-600',
                children: e.jsx(cs, { size: 18 })
              })
            ]
          }),
          e.jsxs('div', {
            className: 'space-y-3',
            children: [
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: fe, children: 'Delegador (presta permisos)' }),
                  e.jsxs('select', {
                    value: l.delegador,
                    onChange: (i) => m({ ...l, delegador: i.target.value }),
                    className: `${ve} mt-1`,
                    children: [
                      e.jsx('option', { value: '', children: '—' }),
                      r.map((i) => e.jsx('option', { value: i.id, children: i.nombre }, i.id))
                    ]
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: fe, children: 'Cobertura (recibe permisos)' }),
                  e.jsxs('select', {
                    value: l.delegado,
                    onChange: (i) => m({ ...l, delegado: i.target.value }),
                    className: `${ve} mt-1`,
                    children: [
                      e.jsx('option', { value: '', children: '—' }),
                      r.map((i) => e.jsx('option', { value: i.id, children: i.nombre }, i.id))
                    ]
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: fe, children: 'Rol específico (opcional)' }),
                  e.jsxs('select', {
                    value: l.role,
                    onChange: (i) => m({ ...l, role: i.target.value }),
                    className: `${ve} mt-1`,
                    children: [
                      e.jsx('option', { value: '', children: 'Todos los roles del delegador' }),
                      c.map((i) =>
                        e.jsx('option', { value: i.codigo, children: i.codigo }, i.codigo)
                      )
                    ]
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-2 gap-2',
                children: [
                  e.jsxs('label', {
                    className: 'block',
                    children: [
                      e.jsx('span', { className: fe, children: 'Desde' }),
                      e.jsx('input', {
                        type: 'date',
                        value: l.desde,
                        onChange: (i) => m({ ...l, desde: i.target.value }),
                        className: `${ve} mt-1`
                      })
                    ]
                  }),
                  e.jsxs('label', {
                    className: 'block',
                    children: [
                      e.jsx('span', { className: fe, children: 'Hasta' }),
                      e.jsx('input', {
                        type: 'date',
                        value: l.hasta,
                        onChange: (i) => m({ ...l, hasta: i.target.value }),
                        className: `${ve} mt-1`
                      })
                    ]
                  })
                ]
              }),
              e.jsxs('label', {
                className: 'block',
                children: [
                  e.jsx('span', { className: fe, children: 'Motivo' }),
                  e.jsx('input', {
                    value: l.motivo,
                    onChange: (i) => m({ ...l, motivo: i.target.value }),
                    placeholder: 'Vacaciones, licencia…',
                    className: `${ve} mt-1`
                  })
                ]
              }),
              e.jsx('button', {
                onClick: w,
                className:
                  'w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600',
                children: 'Crear delegación'
              })
            ]
          })
        ]
      })
    ]
  });
}
function wt() {
  const [r, c] = n.useState([]),
    [p, u] = n.useState({ usuarios: [], roles: [] }),
    [l, m] = n.useState(!0),
    [w, i] = n.useState(null),
    [h, S] = n.useState(!1),
    k = n.useCallback(async () => {
      (m(!0), i(null));
      try {
        c(await Pa(!1));
      } catch (x) {
        i(x.message || 'No autorizado');
      } finally {
        m(!1);
      }
    }, []);
  n.useEffect(() => {
    (k(),
      xs()
        .then(u)
        .catch(() => {}));
  }, [k]);
  const d = async (x) => {
      const y = await $a(x);
      y != null && y.ok
        ? (b.success('Delegación creada'), S(!1), k())
        : b.error((y == null ? void 0 : y.error) || 'Error');
    },
    _ = async (x) => {
      if (
        !window.confirm('¿Revocar esta delegación? La cobertura perderá los permisos de inmediato.')
      )
        return;
      const y = await Ia(x);
      y != null && y.ok
        ? (b.success('Revocada'), k())
        : b.error((y == null ? void 0 : y.error) || 'Error');
    };
  return e.jsxs('div', {
    className: 'space-y-4',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between',
        children: [
          e.jsx('p', {
            className: 'text-[13px] text-slate-500',
            children:
              'Sustituciones: un delegador presta sus permisos a otro durante una ventana (vacaciones, licencias). Caducan solas.'
          }),
          e.jsxs('button', {
            onClick: () => S(!0),
            className:
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600',
            children: [e.jsx(B, { size: 16 }), ' Nueva']
          })
        ]
      }),
      e.jsx('div', {
        className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
        children: l
          ? e.jsx(pe, {})
          : w
            ? e.jsx(ue, { mensaje: w, onRetry: k })
            : r.length === 0
              ? e.jsx(G, { children: 'Sin delegaciones.' })
              : e.jsx('div', {
                  className: 'divide-y divide-slate-100',
                  children: r.map((x) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex items-center gap-3 px-4 py-2.5 text-[13px]',
                        children: [
                          e.jsx(Is, {
                            size: 9,
                            className: `shrink-0 rounded-full ${x.vigente ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 fill-slate-300'}`
                          }),
                          e.jsxs('div', {
                            className: 'min-w-0 flex-1',
                            children: [
                              e.jsxs('div', {
                                className:
                                  'flex items-center gap-1.5 flex-wrap font-bold text-slate-800',
                                children: [
                                  e.jsx('span', {
                                    className: 'truncate',
                                    children: x.delegador_nombre
                                  }),
                                  e.jsx(ga, { size: 12, className: 'text-slate-300' }),
                                  e.jsx('span', {
                                    className: 'truncate',
                                    children: x.delegado_nombre
                                  }),
                                  x.role &&
                                    e.jsx('span', {
                                      className:
                                        'text-[10px] font-mono text-slate-500 bg-slate-100 rounded px-1.5 py-0.5',
                                      children: x.role
                                    })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'text-[11px] text-slate-400 flex items-center gap-1',
                                children: [
                                  e.jsx(qs, { size: 11 }),
                                  ' ',
                                  ws(x.desde),
                                  ' → ',
                                  ws(x.hasta),
                                  x.motivo ? ` · ${x.motivo}` : ''
                                ]
                              })
                            ]
                          }),
                          x.vigente
                            ? e.jsx('span', {
                                className:
                                  'text-[10px] font-black text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5 shrink-0',
                                children: 'VIGENTE'
                              })
                            : x.activo
                              ? e.jsx('span', {
                                  className:
                                    'text-[10px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 shrink-0',
                                  children: 'programada/vencida'
                                })
                              : e.jsx('span', {
                                  className:
                                    'text-[10px] font-bold text-red-400 bg-red-50 rounded px-1.5 py-0.5 shrink-0',
                                  children: 'revocada'
                                }),
                          x.activo &&
                            e.jsx('button', {
                              onClick: () => _(x.id),
                              'aria-label': 'Revocar delegación',
                              title: 'Revocar',
                              className:
                                'w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0',
                              children: e.jsx(le, { size: 15 })
                            })
                        ]
                      },
                      x.id
                    )
                  )
                })
      }),
      h && e.jsx(Nt, { usuarios: p.usuarios, roles: p.roles, onClose: () => S(!1), onSave: d })
    ]
  });
}
const Xe =
    'border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400 bg-white',
  yt = (r) => {
    if (!r) return '—';
    const c = new Date(r);
    return isNaN(c)
      ? '—'
      : c.toLocaleString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
  },
  ys = (r) => {
    if (!r) return '';
    const c = Math.floor((Date.now() - new Date(r).getTime()) / 1e3);
    return c < 60
      ? 'hace instantes'
      : c < 3600
        ? `hace ${Math.floor(c / 60)} min`
        : c < 86400
          ? `hace ${Math.floor(c / 3600)} h`
          : `hace ${Math.floor(c / 86400)} d`;
  },
  Ue = ({ label: r, value: c }) =>
    e.jsxs('div', {
      className: 'rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center',
      children: [
        e.jsx('div', {
          className: 'text-lg font-black text-slate-800 tabular-nums',
          children: c ?? '—'
        }),
        e.jsx('div', {
          className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wide',
          children: r
        })
      ]
    });
function _t() {
  const [r, c] = n.useState([]),
    [p, u] = n.useState({}),
    [l, m] = n.useState({ desde: '', hasta: '', q: '' }),
    [w, i] = n.useState(!0),
    [h, S] = n.useState(null),
    k = n.useCallback(async () => {
      (i(!0), S(null));
      try {
        c(await Ma({ desde: l.desde, hasta: l.hasta, q: l.q, limit: 400 }));
      } catch (_) {
        S(_.message || 'No autorizado');
      } finally {
        i(!1);
      }
    }, [l]);
  (n.useEffect(() => {
    k();
  }, [k]),
    n.useEffect(() => {
      Da()
        .then(u)
        .catch(() => {});
    }, []));
  const d = (_) => (_ || '?').charAt(0).toUpperCase();
  return e.jsxs('div', {
    className: 'space-y-4',
    children: [
      e.jsxs('div', {
        className: 'grid grid-cols-2 sm:grid-cols-4 gap-2',
        children: [
          e.jsx(Ue, { label: 'Ingresos totales', value: p.total }),
          e.jsx(Ue, { label: 'Usuarios', value: p.usuarios }),
          e.jsx(Ue, { label: 'Hoy', value: p.hoy }),
          e.jsx(Ue, { label: 'Últimos 7 días', value: p.semana })
        ]
      }),
      e.jsxs('div', {
        className: 'flex items-center gap-2 flex-wrap',
        children: [
          e.jsxs('div', {
            className: 'relative',
            children: [
              e.jsx(Fe, {
                size: 14,
                className: 'absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400'
              }),
              e.jsx('input', {
                value: l.q,
                onChange: (_) => m({ ...l, q: _.target.value }),
                placeholder: 'Nombre, email o rol',
                className: `${Xe} pl-8 w-56`
              })
            ]
          }),
          e.jsx('input', {
            type: 'date',
            value: l.desde,
            onChange: (_) => m({ ...l, desde: _.target.value }),
            className: Xe
          }),
          e.jsx('input', {
            type: 'date',
            value: l.hasta,
            onChange: (_) => m({ ...l, hasta: _.target.value }),
            className: Xe
          }),
          e.jsxs('button', {
            onClick: k,
            className:
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50',
            children: [e.jsx(re, { size: 14 }), ' Aplicar']
          }),
          p.ultimo &&
            e.jsxs('span', {
              className: 'ml-auto text-[11px] text-slate-400 inline-flex items-center gap-1.5',
              children: [e.jsx(Ve, { size: 12 }), ' último ingreso ', ys(p.ultimo)]
            })
        ]
      }),
      e.jsx('div', {
        className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
        children: w
          ? e.jsx(pe, {})
          : h
            ? e.jsx(ue, { mensaje: h, onRetry: k })
            : r.length === 0
              ? e.jsx(G, { children: 'Sin ingresos para el filtro.' })
              : e.jsx('div', {
                  className: 'divide-y divide-slate-100',
                  children: r.map((_) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex items-center gap-3 px-4 py-2.5 text-[13px]',
                        children: [
                          e.jsx('div', {
                            className:
                              'w-9 h-9 rounded-xl bg-slate-900 text-white font-black grid place-items-center shrink-0',
                            children: d(_.nombre)
                          }),
                          e.jsxs('div', {
                            className: 'min-w-0 flex-1',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2 flex-wrap',
                                children: [
                                  e.jsx('span', {
                                    className: 'font-black text-slate-800 truncate',
                                    children: _.nombre || '(sin nombre)'
                                  }),
                                  e.jsx('span', {
                                    className:
                                      'text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5',
                                    children: _.rol
                                  }),
                                  _.usuario_activo === !1 &&
                                    e.jsx('span', {
                                      className:
                                        'text-[10px] font-bold text-red-500 bg-red-50 rounded px-1.5 py-0.5',
                                      children: 'usuario inactivo'
                                    })
                                ]
                              }),
                              e.jsx('div', {
                                className: 'text-[11px] text-slate-400 truncate',
                                children: _.email
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'text-right shrink-0',
                            children: [
                              e.jsxs('div', {
                                className:
                                  'text-[12px] text-slate-600 tabular-nums inline-flex items-center gap-1',
                                children: [
                                  e.jsx(Ls, { size: 12, className: 'text-emerald-500' }),
                                  ' ',
                                  yt(_.fecha)
                                ]
                              }),
                              e.jsx('div', {
                                className: 'text-[10px] text-slate-400',
                                children: ys(_.fecha)
                              })
                            ]
                          })
                        ]
                      },
                      _.id
                    )
                  )
                })
      }),
      e.jsxs('p', {
        className: 'text-[11px] text-slate-400 flex items-center gap-1.5',
        children: [
          e.jsx(qs, { size: 12 }),
          ' Registra los ',
          e.jsx('b', { children: 'ingresos exitosos' }),
          ' (Supabase Auth). Se muestran los 400 más recientes según el filtro.'
        ]
      })
    ]
  });
}
const q =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white',
  U = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide',
  Ze = { id: '', codigo: '', nombre: '', departamento_id: '', activo: !0 },
  es = {
    id: '',
    codigo: '',
    nombre: '',
    tipo: 'static',
    activo: !0,
    regla: { team_ids: [], department_ids: [], user_ids: [] }
  };
function _s({ active: r, icon: c, label: p, onClick: u }) {
  return e.jsxs('button', {
    onClick: u,
    className: `px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border flex items-center gap-1.5 transition-colors ${r ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`,
    children: [e.jsx(c, { size: 15 }), ' ', p]
  });
}
function ks({ rows: r, onRemove: c, dynamic: p = !1 }) {
  return r.length
    ? e.jsx('div', {
        className: 'divide-y divide-slate-100',
        children: r.map((u) =>
          e.jsxs(
            'div',
            {
              className: 'flex items-center gap-3 px-4 py-2.5 text-[13px]',
              children: [
                e.jsx(os, { size: 15, className: 'text-slate-300 shrink-0' }),
                e.jsxs('div', {
                  className: 'min-w-0',
                  children: [
                    e.jsx('div', {
                      className: 'font-bold text-slate-800 truncate',
                      children: u.nombre
                    }),
                    e.jsx('div', {
                      className: 'text-[11px] text-slate-400 truncate',
                      children: u.correo
                    })
                  ]
                }),
                p &&
                  u.dinamico &&
                  e.jsxs('span', {
                    className:
                      'ml-auto inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-100 px-2 py-1 text-[11px] font-bold text-sky-700',
                    children: [e.jsx(ha, { size: 11 }), ' dinámico']
                  }),
                c &&
                  (!p || !u.dinamico) &&
                  e.jsx('button', {
                    onClick: () => c(u.id),
                    className:
                      'ml-auto w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0',
                    title: 'Quitar',
                    children: e.jsx(le, { size: 15 })
                  })
              ]
            },
            u.id
          )
        )
      })
    : e.jsx(G, { children: 'Sin miembros asignados.' });
}
function Cs({ rows: r, roles: c, form: p, setForm: u, onAssign: l, onRemove: m, canEdit: w }) {
  return e.jsxs('div', {
    className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
    children: [
      e.jsxs('div', {
        className:
          'px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5',
        children: [e.jsx(me, { size: 12 }), ' Roles heredables']
      }),
      w &&
        e.jsxs('div', {
          className: 'p-4 grid sm:grid-cols-3 gap-3 border-b border-slate-100',
          children: [
            e.jsxs('label', {
              className: 'block',
              children: [
                e.jsx('span', { className: U, children: 'Rol' }),
                e.jsxs('select', {
                  value: p.role,
                  onChange: (i) => u((h) => ({ ...h, role: i.target.value })),
                  className: `${q} mt-1`,
                  children: [
                    e.jsx('option', { value: '', children: '—' }),
                    c.map((i) =>
                      e.jsxs(
                        'option',
                        { value: i.codigo, children: [i.codigo, ' · ', i.nombre] },
                        i.codigo
                      )
                    )
                  ]
                })
              ]
            }),
            e.jsxs('label', {
              className: 'block',
              children: [
                e.jsx('span', { className: U, children: 'Ámbito' }),
                e.jsxs('select', {
                  value: p.scopeType,
                  onChange: (i) => u((h) => ({ ...h, scopeType: i.target.value, scopeCode: '' })),
                  className: `${q} mt-1`,
                  children: [
                    e.jsx('option', { value: 'global', children: 'Global' }),
                    e.jsx('option', { value: 'centro_costo', children: 'Centro de costo' }),
                    e.jsx('option', { value: 'bodega', children: 'Bodega' })
                  ]
                })
              ]
            }),
            e.jsxs('label', {
              className: 'block',
              children: [
                e.jsx('span', { className: U, children: 'Código ámbito' }),
                e.jsx('input', {
                  value: p.scopeCode,
                  disabled: p.scopeType === 'global',
                  onChange: (i) => u((h) => ({ ...h, scopeCode: i.target.value.trim() })),
                  className: `${q} mt-1 disabled:bg-slate-50`,
                  placeholder: p.scopeType === 'global' ? 'No aplica' : 'código'
                })
              ]
            }),
            e.jsx('div', {
              className: 'sm:col-span-3 flex justify-end',
              children: e.jsxs('button', {
                onClick: l,
                className:
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600',
                children: [e.jsx(B, { size: 16 }), ' Asignar rol']
              })
            })
          ]
        }),
      r.length
        ? e.jsx('div', {
            className: 'divide-y divide-slate-100',
            children: r.map((i) =>
              e.jsxs(
                'div',
                {
                  className: 'flex items-center gap-3 px-4 py-2.5 text-[13px]',
                  children: [
                    e.jsxs('span', {
                      className:
                        'inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0',
                      children: [e.jsx(me, { size: 11, className: 'text-orange-500' }), i.role]
                    }),
                    e.jsx('span', {
                      className: 'text-[11px] text-slate-500',
                      children:
                        i.scope_type === 'global'
                          ? 'Global'
                          : `${i.scope_type}: ${i.scope_code || '—'}`
                    }),
                    w &&
                      e.jsx('button', {
                        onClick: () => m(i.id),
                        className:
                          'ml-auto w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0',
                        title: 'Revocar',
                        children: e.jsx(le, { size: 15 })
                      })
                  ]
                },
                i.id
              )
            )
          })
        : e.jsx(G, { children: 'Sin roles heredables asignados.' })
    ]
  });
}
function kt() {
  var Se, Z, a;
  const { hasPermission: r, user: c } = Ke(),
    p =
      r('manage_roles') ||
      (c == null ? void 0 : c.rol) === 'ADMIN' ||
      (c == null ? void 0 : c.es_admin_delegado),
    [u, l] = n.useState('teams'),
    [m, w] = n.useState({ usuarios: [], roles: [], departamentos: [] }),
    [i, h] = n.useState([]),
    [S, k] = n.useState([]),
    [d, _] = n.useState(null),
    [x, y] = n.useState(null),
    [I, O] = n.useState([]),
    [N, E] = n.useState([]),
    [M, D] = n.useState([]),
    [K, t] = n.useState([]),
    [j, C] = n.useState(Ze),
    [f, v] = n.useState(es),
    [A, P] = n.useState(''),
    [R, we] = n.useState(''),
    [H, Qe] = n.useState({ role: '', scopeType: 'global', scopeCode: '' }),
    [Y, ye] = n.useState({ role: '', scopeType: 'global', scopeCode: '' }),
    [oe, _e] = n.useState(!0),
    [ie, Pe] = n.useState(null),
    $ = n.useCallback(async () => {
      (_e(!0), Pe(null));
      try {
        const [s, o, g] = await Promise.all([Ta(), Oa(), qa()]);
        (w(s), h(o), k(g), !d && o[0] && _(o[0]), !x && g[0] && y(g[0]));
      } catch (s) {
        Pe(s.message || 'No se pudo cargar la administración organizacional');
      } finally {
        _e(!1);
      }
    }, [x, d]),
    V = n.useCallback(async (s) => {
      if (s)
        try {
          const [o, g] = await Promise.all([La(s.id), ms('team', s.id)]);
          (O(o),
            D(g),
            C({
              id: s.id,
              codigo: s.codigo || '',
              nombre: s.nombre || '',
              departamento_id: s.departamento_id || '',
              activo: s.activo !== !1
            }));
        } catch (o) {
          b.error(o.message || 'No se pudo cargar el detalle del equipo');
        }
    }, []),
    J = n.useCallback(async (s) => {
      var o, g, z;
      if (s)
        try {
          const [T, he] = await Promise.all([Ua(s.id), ms('group', s.id)]);
          (E(T),
            t(he),
            v({
              id: s.id,
              codigo: s.codigo || '',
              nombre: s.nombre || '',
              tipo: s.tipo || 'static',
              activo: s.activo !== !1,
              regla: {
                user_ids: ((o = s.regla) == null ? void 0 : o.user_ids) || [],
                team_ids: ((g = s.regla) == null ? void 0 : g.team_ids) || [],
                department_ids: ((z = s.regla) == null ? void 0 : z.department_ids) || []
              }
            }));
        } catch (T) {
          b.error(T.message || 'No se pudo cargar el detalle del grupo');
        }
    }, []);
  (n.useEffect(() => {
    $();
  }, [$]),
    n.useEffect(() => {
      d != null && d.id && V(d);
    }, [d == null ? void 0 : d.id, V]),
    n.useEffect(() => {
      x != null && x.id && J(x);
    }, [x == null ? void 0 : x.id, J]));
  const $e = n.useMemo(() => {
      const s = new Set(I.map((o) => o.id));
      return m.usuarios.filter((o) => !s.has(o.id));
    }, [m.usuarios, I]),
    Ie = n.useMemo(() => {
      const s = new Set(N.map((o) => o.id));
      return m.usuarios.filter((o) => !s.has(o.id));
    }, [m.usuarios, N]),
    Me = async () => {
      const s = await Va(j);
      if (!(s != null && s.ok))
        return b.error((s == null ? void 0 : s.error) || 'No se pudo guardar el equipo');
      (b.success('Equipo guardado'), await $());
    },
    We = async () => {
      if (!(d != null && d.id) || !window.confirm('¿Eliminar este equipo?')) return;
      const s = await Ba(d.id);
      if (!(s != null && s.ok))
        return b.error((s == null ? void 0 : s.error) || 'No se pudo eliminar el equipo');
      (b.success('Equipo eliminado'), _(null), C(Ze), O([]), D([]), await $());
    },
    X = async () => {
      const s = await Ka(f);
      if (!(s != null && s.ok))
        return b.error((s == null ? void 0 : s.error) || 'No se pudo guardar el grupo');
      (b.success('Grupo guardado'), await $());
    },
    be = async () => {
      if (!(x != null && x.id) || !window.confirm('¿Eliminar este grupo?')) return;
      const s = await Ja(x.id);
      if (!(s != null && s.ok))
        return b.error((s == null ? void 0 : s.error) || 'No se pudo eliminar el grupo');
      (b.success('Grupo eliminado'), y(null), v(es), E([]), t([]), await $());
    },
    ke = async () => {
      if (!(d != null && d.id) || !A) return;
      const s = await Qa(d.id, A);
      if (!(s != null && s.ok))
        return b.error((s == null ? void 0 : s.error) || 'No se pudo agregar el miembro');
      (P(''), b.success('Miembro agregado al equipo'), await V(d), await $());
    },
    De = async () => {
      if (!(x != null && x.id) || !R) return;
      const s = await Wa(x.id, R);
      if (!(s != null && s.ok))
        return b.error((s == null ? void 0 : s.error) || 'No se pudo agregar el miembro');
      (we(''), b.success('Miembro agregado al grupo'), await J(x), await $());
    },
    ge = async () => {
      if (!(d != null && d.id) || !H.role) return b.error('Selecciona un rol');
      const s = await us({
        principalType: 'team',
        principalId: d.id,
        role: H.role,
        scopeType: H.scopeType,
        scopeCode: H.scopeCode || null
      });
      if (!(s != null && s.ok))
        return b.error((s == null ? void 0 : s.error) || 'No se pudo asignar el rol');
      (b.success('Rol asignado al equipo'),
        Qe({ role: '', scopeType: 'global', scopeCode: '' }),
        await V(d),
        await $());
    },
    ne = async () => {
      if (!(x != null && x.id) || !Y.role) return b.error('Selecciona un rol');
      const s = await us({
        principalType: 'group',
        principalId: x.id,
        role: Y.role,
        scopeType: Y.scopeType,
        scopeCode: Y.scopeCode || null
      });
      if (!(s != null && s.ok))
        return b.error((s == null ? void 0 : s.error) || 'No se pudo asignar el rol');
      (b.success('Rol asignado al grupo'),
        ye({ role: '', scopeType: 'global', scopeCode: '' }),
        await J(x),
        await $());
    },
    Ce = async () => {
      const s = await Ha((x == null ? void 0 : x.tipo) === 'dynamic' ? x.id : null);
      if (!(s != null && s.ok))
        return b.error(
          (s == null ? void 0 : s.error) || 'No se pudieron refrescar los grupos dinámicos'
        );
      (b.success(`Refresh OK: ${s.miembros_actualizados || 0} membresías recalculadas`),
        x != null && x.id && (await J(x)),
        await $());
    };
  return oe
    ? e.jsx(pe, {})
    : ie
      ? e.jsx(ue, { mensaje: ie, onRetry: $ })
      : e.jsxs('div', {
          className: 'space-y-4',
          children: [
            e.jsx('div', {
              className:
                'rounded-2xl border border-slate-200 bg-sky-50/60 px-4 py-3 text-[12.5px] text-slate-600',
              children:
                '`Teams` y `Groups` permiten heredar roles IAM a varios usuarios a la vez. Los equipos agrupan personas operativas; los grupos pueden ser `static` o `dynamic`.'
            }),
            e.jsxs('div', {
              className: 'flex gap-2 flex-wrap',
              children: [
                e.jsx(_s, {
                  active: u === 'teams',
                  icon: W,
                  label: 'Equipos',
                  onClick: () => l('teams')
                }),
                e.jsx(_s, {
                  active: u === 'groups',
                  icon: rs,
                  label: 'Grupos',
                  onClick: () => l('groups')
                }),
                u === 'groups' &&
                  e.jsxs('button', {
                    onClick: Ce,
                    className:
                      'ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50',
                    children: [e.jsx(re, { size: 14 }), ' Refrescar dinámicos']
                  })
              ]
            }),
            u === 'teams' &&
              e.jsxs('div', {
                className: 'grid xl:grid-cols-[320px,1fr] gap-4',
                children: [
                  e.jsxs('div', {
                    className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
                    children: [
                      e.jsxs('div', {
                        className:
                          'px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5',
                        children: [e.jsx(W, { size: 12 }), ' Equipos (', i.length, ')']
                      }),
                      i.length
                        ? e.jsx('div', {
                            className: 'divide-y divide-slate-100',
                            children: i.map((s) =>
                              e.jsxs(
                                'button',
                                {
                                  onClick: () => _(s),
                                  className: `w-full text-left px-4 py-3 hover:bg-slate-50 ${(d == null ? void 0 : d.id) === s.id ? 'bg-orange-50/70' : ''}`,
                                  children: [
                                    e.jsx('div', {
                                      className: 'font-bold text-slate-800',
                                      children: s.nombre
                                    }),
                                    e.jsxs('div', {
                                      className: 'text-[11px] text-slate-500',
                                      children: [
                                        s.codigo,
                                        ' · ',
                                        s.departamento || 'Sin departamento',
                                        ' · ',
                                        s.miembros,
                                        ' miembro(s)'
                                      ]
                                    })
                                  ]
                                },
                                s.id
                              )
                            )
                          })
                        : e.jsx(G, { children: 'No hay equipos creados.' })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'space-y-4',
                    children: [
                      p &&
                        e.jsxs('div', {
                          className: 'rounded-2xl border border-slate-200 bg-white p-4',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center justify-between mb-3',
                              children: [
                                e.jsx('h3', {
                                  className:
                                    'text-[12px] font-black text-slate-600 uppercase tracking-wide',
                                  children: j.id ? 'Editar equipo' : 'Nuevo equipo'
                                }),
                                j.id
                                  ? e.jsx('button', {
                                      onClick: () => C(Ze),
                                      className:
                                        'text-xs font-bold text-slate-400 hover:text-slate-600',
                                      children: 'Limpiar'
                                    })
                                  : null
                              ]
                            }),
                            e.jsxs('div', {
                              className: 'grid sm:grid-cols-3 gap-3',
                              children: [
                                e.jsxs('label', {
                                  className: 'block',
                                  children: [
                                    e.jsx('span', { className: U, children: 'Código' }),
                                    e.jsx('input', {
                                      value: j.codigo,
                                      onChange: (s) =>
                                        C((o) => ({ ...o, codigo: s.target.value.toUpperCase() })),
                                      className: `${q} mt-1`
                                    })
                                  ]
                                }),
                                e.jsxs('label', {
                                  className: 'block',
                                  children: [
                                    e.jsx('span', { className: U, children: 'Nombre' }),
                                    e.jsx('input', {
                                      value: j.nombre,
                                      onChange: (s) => C((o) => ({ ...o, nombre: s.target.value })),
                                      className: `${q} mt-1`
                                    })
                                  ]
                                }),
                                e.jsxs('label', {
                                  className: 'block',
                                  children: [
                                    e.jsx('span', { className: U, children: 'Departamento' }),
                                    e.jsxs('select', {
                                      value: j.departamento_id,
                                      onChange: (s) =>
                                        C((o) => ({ ...o, departamento_id: s.target.value })),
                                      className: `${q} mt-1`,
                                      children: [
                                        e.jsx('option', { value: '', children: '—' }),
                                        m.departamentos.map((s) =>
                                          e.jsx('option', { value: s.id, children: s.nombre }, s.id)
                                        )
                                      ]
                                    })
                                  ]
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              className: 'mt-3 flex items-center justify-between',
                              children: [
                                e.jsxs('label', {
                                  className:
                                    'text-[12px] font-semibold text-slate-500 inline-flex items-center gap-2',
                                  children: [
                                    e.jsx('input', {
                                      type: 'checkbox',
                                      checked: j.activo,
                                      onChange: (s) =>
                                        C((o) => ({ ...o, activo: s.target.checked }))
                                    }),
                                    'Activo'
                                  ]
                                }),
                                e.jsxs('div', {
                                  className: 'flex gap-2',
                                  children: [
                                    j.id &&
                                      e.jsx('button', {
                                        onClick: We,
                                        className:
                                          'px-3 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50',
                                        children: 'Eliminar'
                                      }),
                                    e.jsx('button', {
                                      onClick: Me,
                                      className:
                                        'px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600',
                                      children: 'Guardar equipo'
                                    })
                                  ]
                                })
                              ]
                            })
                          ]
                        }),
                      d
                        ? e.jsxs(e.Fragment, {
                            children: [
                              p &&
                                e.jsxs('div', {
                                  className: 'rounded-2xl border border-slate-200 bg-white p-4',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2 mb-3',
                                      children: [
                                        e.jsx(B, { size: 15, className: 'text-orange-500' }),
                                        e.jsx('h3', {
                                          className:
                                            'text-[12px] font-black text-slate-600 uppercase tracking-wide',
                                          children: 'Agregar miembro'
                                        })
                                      ]
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex gap-2',
                                      children: [
                                        e.jsxs('select', {
                                          value: A,
                                          onChange: (s) => P(s.target.value),
                                          className: q,
                                          children: [
                                            e.jsx('option', { value: '', children: '—' }),
                                            $e.map((s) =>
                                              e.jsxs(
                                                'option',
                                                {
                                                  value: s.id,
                                                  children: [s.nombre, ' · ', s.correo]
                                                },
                                                s.id
                                              )
                                            )
                                          ]
                                        }),
                                        e.jsx('button', {
                                          onClick: ke,
                                          className:
                                            'px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800',
                                          children: 'Agregar'
                                        })
                                      ]
                                    })
                                  ]
                                }),
                              e.jsxs('div', {
                                className:
                                  'rounded-2xl border border-slate-200 bg-white overflow-hidden',
                                children: [
                                  e.jsxs('div', {
                                    className:
                                      'px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5',
                                    children: [e.jsx(os, { size: 12 }), ' Miembros del equipo']
                                  }),
                                  e.jsx(ks, {
                                    rows: I,
                                    onRemove: p
                                      ? async (s) => {
                                          const o = await Fa(d.id, s);
                                          if (!(o != null && o.ok))
                                            return b.error(
                                              (o == null ? void 0 : o.error) || 'No se pudo quitar'
                                            );
                                          (b.success('Miembro removido'), await V(d), await $());
                                        }
                                      : null
                                  })
                                ]
                              }),
                              e.jsx(Cs, {
                                rows: M,
                                roles: m.roles,
                                form: H,
                                setForm: Qe,
                                onAssign: ge,
                                onRemove: p
                                  ? async (s) => {
                                      const o = await ps(s);
                                      if (!(o != null && o.ok))
                                        return b.error(
                                          (o == null ? void 0 : o.error) || 'No se pudo revocar'
                                        );
                                      (b.success('Asignación revocada'), await V(d), await $());
                                    }
                                  : null,
                                canEdit: p
                              })
                            ]
                          })
                        : e.jsx(G, {
                            children:
                              'Selecciona un equipo para administrar miembros y roles heredables.'
                          })
                    ]
                  })
                ]
              }),
            u === 'groups' &&
              e.jsxs('div', {
                className: 'grid xl:grid-cols-[320px,1fr] gap-4',
                children: [
                  e.jsxs('div', {
                    className: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
                    children: [
                      e.jsxs('div', {
                        className:
                          'px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5',
                        children: [e.jsx(rs, { size: 12 }), ' Grupos (', S.length, ')']
                      }),
                      S.length
                        ? e.jsx('div', {
                            className: 'divide-y divide-slate-100',
                            children: S.map((s) =>
                              e.jsxs(
                                'button',
                                {
                                  onClick: () => y(s),
                                  className: `w-full text-left px-4 py-3 hover:bg-slate-50 ${(x == null ? void 0 : x.id) === s.id ? 'bg-orange-50/70' : ''}`,
                                  children: [
                                    e.jsx('div', {
                                      className: 'font-bold text-slate-800',
                                      children: s.nombre
                                    }),
                                    e.jsxs('div', {
                                      className: 'text-[11px] text-slate-500',
                                      children: [
                                        s.codigo,
                                        ' · ',
                                        s.tipo,
                                        ' · ',
                                        s.miembros,
                                        ' miembro(s)'
                                      ]
                                    })
                                  ]
                                },
                                s.id
                              )
                            )
                          })
                        : e.jsx(G, { children: 'No hay grupos creados.' })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'space-y-4',
                    children: [
                      p &&
                        e.jsxs('div', {
                          className: 'rounded-2xl border border-slate-200 bg-white p-4',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center justify-between mb-3',
                              children: [
                                e.jsx('h3', {
                                  className:
                                    'text-[12px] font-black text-slate-600 uppercase tracking-wide',
                                  children: f.id ? 'Editar grupo' : 'Nuevo grupo'
                                }),
                                f.id
                                  ? e.jsx('button', {
                                      onClick: () => v(es),
                                      className:
                                        'text-xs font-bold text-slate-400 hover:text-slate-600',
                                      children: 'Limpiar'
                                    })
                                  : null
                              ]
                            }),
                            e.jsxs('div', {
                              className: 'grid sm:grid-cols-3 gap-3',
                              children: [
                                e.jsxs('label', {
                                  className: 'block',
                                  children: [
                                    e.jsx('span', { className: U, children: 'Código' }),
                                    e.jsx('input', {
                                      value: f.codigo,
                                      onChange: (s) =>
                                        v((o) => ({ ...o, codigo: s.target.value.toUpperCase() })),
                                      className: `${q} mt-1`
                                    })
                                  ]
                                }),
                                e.jsxs('label', {
                                  className: 'block',
                                  children: [
                                    e.jsx('span', { className: U, children: 'Nombre' }),
                                    e.jsx('input', {
                                      value: f.nombre,
                                      onChange: (s) => v((o) => ({ ...o, nombre: s.target.value })),
                                      className: `${q} mt-1`
                                    })
                                  ]
                                }),
                                e.jsxs('label', {
                                  className: 'block',
                                  children: [
                                    e.jsx('span', { className: U, children: 'Tipo' }),
                                    e.jsxs('select', {
                                      value: f.tipo,
                                      onChange: (s) => v((o) => ({ ...o, tipo: s.target.value })),
                                      className: `${q} mt-1`,
                                      children: [
                                        e.jsx('option', { value: 'static', children: 'static' }),
                                        e.jsx('option', { value: 'dynamic', children: 'dynamic' })
                                      ]
                                    })
                                  ]
                                })
                              ]
                            }),
                            f.tipo === 'dynamic' &&
                              e.jsxs('div', {
                                className: 'grid sm:grid-cols-3 gap-3 mt-3',
                                children: [
                                  e.jsxs('label', {
                                    className: 'block',
                                    children: [
                                      e.jsx('span', { className: U, children: 'User IDs' }),
                                      e.jsx('input', {
                                        value: (
                                          ((Se = f.regla) == null ? void 0 : Se.user_ids) || []
                                        ).join(','),
                                        onChange: (s) =>
                                          v((o) => ({
                                            ...o,
                                            regla: {
                                              ...(o.regla || {}),
                                              user_ids: s.target.value
                                                .split(',')
                                                .map((g) => g.trim())
                                                .filter(Boolean)
                                            }
                                          })),
                                        className: `${q} mt-1`,
                                        placeholder: 'uuid,uuid'
                                      })
                                    ]
                                  }),
                                  e.jsxs('label', {
                                    className: 'block',
                                    children: [
                                      e.jsx('span', { className: U, children: 'Team IDs' }),
                                      e.jsx('input', {
                                        value: (
                                          ((Z = f.regla) == null ? void 0 : Z.team_ids) || []
                                        ).join(','),
                                        onChange: (s) =>
                                          v((o) => ({
                                            ...o,
                                            regla: {
                                              ...(o.regla || {}),
                                              team_ids: s.target.value
                                                .split(',')
                                                .map((g) => g.trim())
                                                .filter(Boolean)
                                            }
                                          })),
                                        className: `${q} mt-1`,
                                        placeholder: 'uuid,uuid'
                                      })
                                    ]
                                  }),
                                  e.jsxs('label', {
                                    className: 'block',
                                    children: [
                                      e.jsx('span', { className: U, children: 'Department IDs' }),
                                      e.jsx('input', {
                                        value: (
                                          ((a = f.regla) == null ? void 0 : a.department_ids) || []
                                        ).join(','),
                                        onChange: (s) =>
                                          v((o) => ({
                                            ...o,
                                            regla: {
                                              ...(o.regla || {}),
                                              department_ids: s.target.value
                                                .split(',')
                                                .map((g) => g.trim())
                                                .filter(Boolean)
                                            }
                                          })),
                                        className: `${q} mt-1`,
                                        placeholder: 'uuid,uuid'
                                      })
                                    ]
                                  })
                                ]
                              }),
                            e.jsxs('div', {
                              className: 'mt-3 flex items-center justify-between',
                              children: [
                                e.jsxs('label', {
                                  className:
                                    'text-[12px] font-semibold text-slate-500 inline-flex items-center gap-2',
                                  children: [
                                    e.jsx('input', {
                                      type: 'checkbox',
                                      checked: f.activo,
                                      onChange: (s) =>
                                        v((o) => ({ ...o, activo: s.target.checked }))
                                    }),
                                    'Activo'
                                  ]
                                }),
                                e.jsxs('div', {
                                  className: 'flex gap-2',
                                  children: [
                                    f.id &&
                                      e.jsx('button', {
                                        onClick: be,
                                        className:
                                          'px-3 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50',
                                        children: 'Eliminar'
                                      }),
                                    e.jsx('button', {
                                      onClick: X,
                                      className:
                                        'px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600',
                                      children: 'Guardar grupo'
                                    })
                                  ]
                                })
                              ]
                            })
                          ]
                        }),
                      x
                        ? e.jsxs(e.Fragment, {
                            children: [
                              p &&
                                x.tipo === 'static' &&
                                e.jsxs('div', {
                                  className: 'rounded-2xl border border-slate-200 bg-white p-4',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2 mb-3',
                                      children: [
                                        e.jsx(B, { size: 15, className: 'text-orange-500' }),
                                        e.jsx('h3', {
                                          className:
                                            'text-[12px] font-black text-slate-600 uppercase tracking-wide',
                                          children: 'Agregar miembro'
                                        })
                                      ]
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex gap-2',
                                      children: [
                                        e.jsxs('select', {
                                          value: R,
                                          onChange: (s) => we(s.target.value),
                                          className: q,
                                          children: [
                                            e.jsx('option', { value: '', children: '—' }),
                                            Ie.map((s) =>
                                              e.jsxs(
                                                'option',
                                                {
                                                  value: s.id,
                                                  children: [s.nombre, ' · ', s.correo]
                                                },
                                                s.id
                                              )
                                            )
                                          ]
                                        }),
                                        e.jsx('button', {
                                          onClick: De,
                                          className:
                                            'px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800',
                                          children: 'Agregar'
                                        })
                                      ]
                                    })
                                  ]
                                }),
                              e.jsxs('div', {
                                className:
                                  'rounded-2xl border border-slate-200 bg-white overflow-hidden',
                                children: [
                                  e.jsxs('div', {
                                    className:
                                      'px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5',
                                    children: [e.jsx(os, { size: 12 }), ' Miembros del grupo']
                                  }),
                                  e.jsx(ks, {
                                    rows: N,
                                    dynamic: x.tipo === 'dynamic',
                                    onRemove:
                                      p && x.tipo === 'static'
                                        ? async (s) => {
                                            const o = await Ga(x.id, s);
                                            if (!(o != null && o.ok))
                                              return b.error(
                                                (o == null ? void 0 : o.error) ||
                                                  'No se pudo quitar'
                                              );
                                            (b.success('Miembro removido'), await J(x), await $());
                                          }
                                        : null
                                  })
                                ]
                              }),
                              e.jsx(Cs, {
                                rows: K,
                                roles: m.roles,
                                form: Y,
                                setForm: ye,
                                onAssign: ne,
                                onRemove: p
                                  ? async (s) => {
                                      const o = await ps(s);
                                      if (!(o != null && o.ok))
                                        return b.error(
                                          (o == null ? void 0 : o.error) || 'No se pudo revocar'
                                        );
                                      (b.success('Asignación revocada'), await J(x), await $());
                                    }
                                  : null,
                                canEdit: p
                              })
                            ]
                          })
                        : e.jsx(G, {
                            children:
                              'Selecciona un grupo para administrar miembros y roles heredables.'
                          })
                    ]
                  })
                ]
              })
          ]
        });
}
const Ct = [
  { id: 'usuarios', label: 'Usuarios', icon: W, path: '/admin/users' },
  { id: 'roles', label: 'Roles y Permisos', icon: xe, path: '/admin/roles' },
  { id: 'scopes', label: 'Ámbitos', icon: Ge, path: '/admin/roles?vista=scopes' },
  { id: 'teams', label: 'Equipos y Grupos', icon: rs, path: '/admin/roles?vista=teams' },
  {
    id: 'sesiones',
    label: 'Sesiones',
    icon: va,
    path: '/admin/roles?vista=sesiones',
    soloAdmin: !0
  },
  { id: 'accesos', label: 'Accesos', icon: Ls, path: '/admin/roles?vista=accesos', soloAdmin: !0 },
  {
    id: 'auditoria',
    label: 'Auditoría',
    icon: ds,
    path: '/admin/roles?vista=auditoria',
    soloAdmin: !0
  },
  { id: 'escala', label: 'Escala', icon: Os, path: '/admin/roles?vista=escala', soloAdmin: !0 },
  {
    id: 'politicas',
    label: 'Políticas',
    icon: ls,
    path: '/admin/roles?vista=politicas',
    soloAdmin: !0
  },
  {
    id: 'delegaciones',
    label: 'Delegaciones',
    icon: As,
    path: '/admin/roles?vista=delegaciones',
    soloAdmin: !0
  }
];
function $t() {
  const r = Gs(),
    c = Vs(),
    { user: p } = Ke(),
    u =
      (p == null ? void 0 : p.rol) === 'ADMIN' || (p == null ? void 0 : p.es_admin_delegado) === !0,
    l = r.pathname.includes('/roles'),
    m = new URLSearchParams(r.search).get('vista'),
    i = l
      ? [
          'scopes',
          'teams',
          'sesiones',
          'accesos',
          'auditoria',
          'escala',
          'politicas',
          'delegaciones'
        ].includes(m)
        ? m
        : 'roles'
      : 'usuarios';
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
                children: e.jsx(ja, { size: 22 })
              }),
              e.jsxs('div', {
                className: 'min-w-0',
                children: [
                  e.jsxs('h1', {
                    className: 'text-xl sm:text-3xl font-black text-slate-900 tracking-tight',
                    children: [
                      'Identidad y ',
                      e.jsx('span', { className: 'text-orange-600', children: 'Seguridad' })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'text-xs sm:text-sm text-slate-500',
                    children:
                      'Control de accesos: usuarios, roles, permisos, ámbitos, sesiones, auditoría, políticas y delegaciones'
                  })
                ]
              })
            ]
          })
        ]
      }),
      e.jsx('div', {
        className: 'flex gap-2 flex-wrap',
        children: Ct.filter((h) => !h.soloAdmin || u).map(({ id: h, label: S, icon: k, path: d }) =>
          e.jsxs(
            'button',
            {
              onClick: () => c(d),
              className: `px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border flex items-center gap-1.5 transition-colors ${i === h ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`,
              children: [e.jsx(k, { size: 15 }), ' ', S]
            },
            h
          )
        )
      }),
      i === 'usuarios' && e.jsx(Ya, { embedded: !0 }),
      i === 'roles' && e.jsx(ce, { embedded: !0 }),
      i === 'scopes' && e.jsx(rt, {}),
      i === 'teams' && e.jsx(kt, {}),
      i === 'sesiones' && (u ? e.jsx(ct, {}) : e.jsx(ce, { embedded: !0 })),
      i === 'accesos' && (u ? e.jsx(_t, {}) : e.jsx(ce, { embedded: !0 })),
      i === 'auditoria' && (u ? e.jsx(ut, {}) : e.jsx(ce, { embedded: !0 })),
      i === 'escala' && (u ? e.jsx(gt, {}) : e.jsx(ce, { embedded: !0 })),
      i === 'politicas' && (u ? e.jsx(ft, {}) : e.jsx(ce, { embedded: !0 })),
      i === 'delegaciones' && (u ? e.jsx(wt, {}) : e.jsx(ce, { embedded: !0 }))
    ]
  });
}
export { $t as default };
