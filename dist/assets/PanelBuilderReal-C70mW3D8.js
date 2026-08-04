import { j as n } from './query-vendor-AW4268wa.js';
import { r as u, g as Ha, a as oa, i as Wa, R as Ke } from './react-vendor-CczoB5o5.js';
import { s as bt, u as ia } from './index-Cm-QZeNi.js';
import { v as $a, a as Ln, e as Ba, b as Va } from './formulaEngine-CFaRJv6o.js';
import {
  c as yn,
  R as Ft,
  A as qa,
  C as Kt,
  X as Jt,
  Y as Zt,
  T as Ot,
  L as Qt,
  a as Ya,
  P as Xa,
  b as Ga,
  d as Ua,
  e as Ka,
  f as Ja,
  B as Za,
  g as Qa
} from './charts-vendor-Bk5-SXWK.js';
import { d as er, e as tr, g as nr, h as ar, i as rr } from './dashData-Clk2kuOi.js';
import './supabase-vendor-4Fjsfb0a.js';
import './ui-vendor-D9BeWSwh.js';
import './animation-vendor-Bm2mNA5x.js';
function ft(e) {
  const { margin: t, containerPadding: a, containerWidth: s, cols: r } = e;
  return (s - t[0] * (r - 1) - a[0] * 2) / r;
}
function Ge(e, t, a) {
  return Number.isFinite(e) ? Math.round(t * e + Math.max(0, e - 1) * a) : e;
}
function Tt(e, t, a, s, r, l, c) {
  const { margin: i, containerPadding: f, rowHeight: h } = e,
    d = ft(e);
  let g, R, T, b;
  if (
    (c
      ? ((g = Math.round(c.width)), (R = Math.round(c.height)))
      : ((g = Ge(s, d, i[0])), (R = Ge(r, h, i[1]))),
    l
      ? ((T = Math.round(l.top)), (b = Math.round(l.left)))
      : c
        ? ((T = Math.round(c.top)), (b = Math.round(c.left)))
        : ((T = Math.round((h + i[1]) * a + f[1])), (b = Math.round((d + i[0]) * t + f[0]))),
    !l && !c)
  ) {
    if (Number.isFinite(s)) {
      const O = Math.round((d + i[0]) * (t + s) + f[0]) - b - g;
      O !== i[0] && (g += O - i[0]);
    }
    if (Number.isFinite(r)) {
      const O = Math.round((h + i[1]) * (a + r) + f[1]) - T - R;
      O !== i[1] && (R += O - i[1]);
    }
  }
  return { top: T, left: b, width: g, height: R };
}
function sr(e, t, a, s, r) {
  const { margin: l, containerPadding: c, cols: i, rowHeight: f, maxRows: h } = e,
    d = ft(e);
  let g = Math.round((a - c[0]) / (d + l[0])),
    R = Math.round((t - c[1]) / (f + l[1]));
  return ((g = _t(g, 0, i - s)), (R = _t(R, 0, h - r)), { x: g, y: R });
}
function zt(e, t, a) {
  const { margin: s, containerPadding: r, rowHeight: l } = e,
    c = ft(e),
    i = Math.round((a - r[0]) / (c + s[0])),
    f = Math.round((t - r[1]) / (l + s[1]));
  return { x: i, y: f };
}
function or(e, t, a) {
  const { margin: s, rowHeight: r } = e,
    l = ft(e),
    c = Math.max(1, Math.round((t + s[0]) / (l + s[0]))),
    i = Math.max(1, Math.round((a + s[1]) / (r + s[1])));
  return { w: c, h: i };
}
function _t(e, t, a) {
  return Math.max(Math.min(e, a), t);
}
function bn(e, t) {
  return !(
    e.i === t.i ||
    e.x + e.w <= t.x ||
    e.x >= t.x + t.w ||
    e.y + e.h <= t.y ||
    e.y >= t.y + t.h
  );
}
function ut(e, t) {
  for (let a = 0; a < e.length; a++) {
    const s = e[a];
    if (s !== void 0 && bn(s, t)) return s;
  }
}
function la(e, t) {
  return e.filter((a) => bn(a, t));
}
function ir(e, t) {
  return t === 'horizontal' ? ca(e) : t === 'vertical' || t === 'wrap' ? un(e) : [...e];
}
function un(e) {
  return [...e].sort((t, a) => (t.y !== a.y ? t.y - a.y : t.x - a.x));
}
function ca(e) {
  return [...e].sort((t, a) => (t.x !== a.x ? t.x - a.x : t.y - a.y));
}
function Wt(e) {
  let t = 0;
  for (let a = 0; a < e.length; a++) {
    const s = e[a];
    if (s !== void 0) {
      const r = s.y + s.h;
      r > t && (t = r);
    }
  }
  return t;
}
function ct(e, t) {
  for (let a = 0; a < e.length; a++) {
    const s = e[a];
    if (s !== void 0 && s.i === t) return s;
  }
}
function $t(e) {
  return e.filter((t) => t.static === !0);
}
function pt(e) {
  return {
    i: e.i,
    x: e.x,
    y: e.y,
    w: e.w,
    h: e.h,
    minW: e.minW,
    maxW: e.maxW,
    minH: e.minH,
    maxH: e.maxH,
    moved: !!e.moved,
    static: !!e.static,
    isDraggable: e.isDraggable,
    isResizable: e.isResizable,
    resizeHandles: e.resizeHandles,
    constraints: e.constraints,
    isBounded: e.isBounded
  };
}
function ot(e) {
  const t = new Array(e.length);
  for (let a = 0; a < e.length; a++) {
    const s = e[a];
    s !== void 0 && (t[a] = pt(s));
  }
  return t;
}
function lr(e, t) {
  const a = new Array(e.length);
  for (let s = 0; s < e.length; s++) {
    const r = e[s];
    r !== void 0 && (t.i === r.i ? (a[s] = t) : (a[s] = r));
  }
  return a;
}
function cr(e, t, a) {
  let s = ct(e, t);
  return s ? ((s = a(pt(s))), [lr(e, s), s]) : [[...e], null];
}
function vn(e, t) {
  const a = $t(e);
  for (let s = 0; s < e.length; s++) {
    const r = e[s];
    if (r !== void 0)
      if (
        (r.x + r.w > t.cols && (r.x = t.cols - r.w),
        r.x < 0 && ((r.x = 0), (r.w = t.cols)),
        !r.static)
      )
        a.push(r);
      else for (; ut(a, r);) r.y++;
  }
  return e;
}
function dt(e, t, a, s, r, l, c, i, f) {
  if (t.static && t.isDraggable !== !0) return [...e];
  if (t.y === s && t.x === a) return [...e];
  const h = t.x,
    d = t.y;
  (typeof a == 'number' && (t.x = a), typeof s == 'number' && (t.y = s), (t.moved = !0));
  let g = ir(e, c);
  (c === 'vertical' && typeof s == 'number'
    ? d >= s
    : c === 'horizontal' && typeof a == 'number'
      ? h >= a
      : !1) && (g = g.reverse());
  const T = la(g, t),
    b = T.length > 0;
  if (b && f) return ot(e);
  if (b && l) return ((t.x = h), (t.y = d), (t.moved = !1), e);
  let F = [...e];
  for (let O = 0; O < T.length; O++) {
    const M = T[O];
    M !== void 0 && (M.moved || (M.static ? (F = An(F, M, t, r, c)) : (F = An(F, t, M, r, c))));
  }
  return F;
}
function An(e, t, a, s, r, l) {
  const c = r === 'horizontal',
    i = r === 'vertical',
    f = t.static;
  if (s) {
    s = !1;
    const g = {
        x: c ? Math.max(t.x - a.w, 0) : a.x,
        y: i ? Math.max(t.y - a.h, 0) : a.y,
        w: a.w,
        h: a.h,
        i: '-1'
      },
      R = ut(e, g),
      T = R !== void 0 && R.y + R.h > t.y,
      b = R !== void 0 && t.x + t.w > R.x;
    if (!R) return dt(e, a, c ? g.x : void 0, i ? g.y : void 0, s, f, r);
    if (T && i) return dt(e, a, void 0, a.y + 1, s, f, r);
    if (T && r === null) return ((t.y = a.y), (a.y = a.y + a.h), [...e]);
    if (b && c) return dt(e, t, a.x, void 0, s, f, r);
  }
  const h = c ? a.x + 1 : void 0,
    d = i ? a.y + 1 : void 0;
  return h === void 0 && d === void 0 ? [...e] : dt(e, a, h, d, s, f, r);
}
function xt(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
var dr = {
    name: 'gridBounds',
    constrainPosition(e, t, a, { cols: s, maxRows: r }) {
      return { x: xt(t, 0, Math.max(0, s - e.w)), y: xt(a, 0, Math.max(0, r - e.h)) };
    },
    constrainSize(e, t, a, s, { cols: r, maxRows: l }) {
      const c = s === 'w' || s === 'nw' || s === 'sw' ? e.x + e.w : r - e.x,
        i = s === 'n' || s === 'nw' || s === 'ne' ? e.y + e.h : l - e.y;
      return { w: xt(t, 1, Math.max(1, c)), h: xt(a, 1, Math.max(1, i)) };
    }
  },
  ur = {
    name: 'minMaxSize',
    constrainSize(e, t, a) {
      return { w: xt(t, e.minW ?? 1, e.maxW ?? 1 / 0), h: xt(a, e.minH ?? 1, e.maxH ?? 1 / 0) };
    }
  },
  da = [dr, ur];
function Pt(e, t, a, s, r) {
  let l = { x: a, y: s };
  for (const c of e) c.constrainPosition && (l = c.constrainPosition(t, l.x, l.y, r));
  if (t.constraints)
    for (const c of t.constraints) c.constrainPosition && (l = c.constrainPosition(t, l.x, l.y, r));
  return l;
}
function fr(e, t, a, s, r, l) {
  let c = { w: a, h: s };
  for (const i of e) i.constrainSize && (c = i.constrainSize(t, c.w, c.h, r, l));
  if (t.constraints)
    for (const i of t.constraints) i.constrainSize && (c = i.constrainSize(t, c.w, c.h, r, l));
  return c;
}
function ua({ top: e, left: t, width: a, height: s }) {
  const r = `translate(${t}px,${e}px)`;
  return {
    transform: r,
    WebkitTransform: r,
    MozTransform: r,
    msTransform: r,
    OTransform: r,
    width: `${a}px`,
    height: `${s}px`,
    position: 'absolute'
  };
}
function pr({ top: e, left: t, width: a, height: s }) {
  return { top: `${e}px`, left: `${t}px`, width: `${a}px`, height: `${s}px`, position: 'absolute' };
}
function Mn(e) {
  return e * 100 + '%';
}
function mr(e, t, a, s) {
  return e + a > s ? t : a;
}
function fa(e, t, a) {
  return e < 0 ? t : a;
}
function hr(e) {
  return Math.max(0, e);
}
function It(e) {
  return Math.max(0, e);
}
var jn = (e, t, a) => {
    const { left: s, height: r, width: l } = t,
      c = e.top - (r - e.height);
    return { left: s, width: l, height: fa(c, e.height, r), top: It(c) };
  },
  Nn = (e, t, a) => {
    const { top: s, left: r, height: l, width: c } = t;
    return { top: s, height: l, width: mr(e.left, e.width, c, a), left: hr(r) };
  },
  kn = (e, t, a) => {
    const { top: s, height: r, width: l } = t,
      c = e.left + e.width - l;
    return c < 0
      ? { height: r, width: e.left + e.width, top: It(s), left: 0 }
      : { height: r, width: l, top: It(s), left: c };
  },
  Cn = (e, t, a) => {
    const { top: s, left: r, height: l, width: c } = t;
    return { width: c, left: r, height: fa(s, e.height, l), top: It(s) };
  },
  gr = (e, t, a) => jn(e, Nn(e, t, a)),
  xr = (e, t, a) => jn(e, kn(e, t)),
  yr = (e, t, a) => Cn(e, Nn(e, t, a)),
  br = (e, t, a) => Cn(e, kn(e, t)),
  vr = { n: jn, ne: gr, e: Nn, se: yr, s: Cn, sw: br, w: kn, nw: xr };
function jr(e, t, a, s) {
  const r = vr[e];
  return r ? r(t, { ...t, ...a }, s) : a;
}
var Nr = {
    type: 'transform',
    scale: 1,
    calcStyle(e) {
      return ua(e);
    }
  },
  kr = Nr,
  Cr = { cols: 12, rowHeight: 150, margin: [10, 10], containerPadding: null, maxRows: 1 / 0 },
  wr = { enabled: !0, bounded: !1, threshold: 3 },
  Sr = { enabled: !0, handles: ['se'] },
  Rr = { enabled: !1, defaultItem: { w: 1, h: 1 } };
function wn(e, t, a, s, r) {
  const l = s === 'x' ? 'w' : 'h';
  t[s] += 1;
  const c = e.findIndex((f) => f.i === t.i),
    i = r ?? $t(e).length > 0;
  for (let f = c + 1; f < e.length; f++) {
    const h = e[f];
    if (h !== void 0 && !h.static) {
      if (!i && h.y > t.y + t.h) break;
      bn(t, h) && wn(e, h, a + t[l], s, i);
    }
  }
  t[s] = a;
}
function Dr(e, t, a, s) {
  for (
    t.x = Math.max(t.x, 0), t.y = Math.max(t.y, 0), t.y = Math.min(s, t.y);
    t.y > 0 && !ut(e, t);
  )
    t.y--;
  let r;
  for (; (r = ut(e, t)) !== void 0;) wn(a, t, r.y + r.h, 'y');
  return ((t.y = Math.max(t.y, 0)), t);
}
function Er(e, t, a, s) {
  for (t.x = Math.max(t.x, 0), t.y = Math.max(t.y, 0); t.x > 0 && !ut(e, t);) t.x--;
  let r;
  for (; (r = ut(e, t)) !== void 0;)
    if ((wn(s, t, r.x + r.w, 'x'), t.x + t.w > a))
      for (t.x = a - t.w, t.y++; t.x > 0 && !ut(e, t);) t.x--;
  return ((t.x = Math.max(t.x, 0)), t);
}
var Sn = {
    type: 'vertical',
    allowOverlap: !1,
    compact(e, t) {
      const a = $t(e);
      let s = Wt(a);
      const r = un(e),
        l = new Array(e.length);
      for (let c = 0; c < r.length; c++) {
        const i = r[c];
        if (i === void 0) continue;
        let f = pt(i);
        f.static || ((f = Dr(a, f, r, s)), (s = Math.max(s, f.y + f.h)), a.push(f));
        const h = e.indexOf(i);
        ((l[h] = f), (f.moved = !1));
      }
      return l;
    }
  },
  pa = {
    type: 'horizontal',
    allowOverlap: !1,
    compact(e, t) {
      const a = $t(e),
        s = ca(e),
        r = new Array(e.length);
      for (let l = 0; l < s.length; l++) {
        const c = s[l];
        if (c === void 0) continue;
        let i = pt(c);
        i.static || ((i = Er(a, i, t, s)), a.push(i));
        const f = e.indexOf(c);
        ((r[f] = i), (i.moved = !1));
      }
      return r;
    }
  },
  ma = {
    type: null,
    allowOverlap: !1,
    compact(e, t) {
      return ot(e);
    }
  },
  Fr = {
    ...Sn,
    allowOverlap: !0,
    compact(e, t) {
      return ot(e);
    }
  },
  Or = {
    ...pa,
    allowOverlap: !0,
    compact(e, t) {
      return ot(e);
    }
  },
  Tr = { ...ma, allowOverlap: !0 };
function Rn(e, t = !1, a = !1) {
  let s;
  return (
    t
      ? e === 'vertical'
        ? (s = Fr)
        : e === 'horizontal'
          ? (s = Or)
          : (s = Tr)
      : e === 'vertical'
        ? (s = Sn)
        : e === 'horizontal'
          ? (s = pa)
          : (s = ma),
    a ? { ...s, preventCollision: a } : s
  );
}
function ha(e) {
  return Object.keys(e).sort((a, s) => e[a] - e[s]);
}
function _n(e, t) {
  const a = ha(e);
  let s = a[0];
  if (s === void 0) throw new Error('No breakpoints defined');
  for (let r = 1; r < a.length; r++) {
    const l = a[r];
    if (l === void 0) continue;
    const c = e[l];
    t > c && (s = l);
  }
  return s;
}
function In(e, t) {
  const a = t[e];
  if (a === void 0)
    throw new Error(
      `ResponsiveReactGridLayout: \`cols\` entry for breakpoint ${String(e)} is missing!`
    );
  return a;
}
function en(e, t, a, s, r, l) {
  const c = e[a];
  if (c) return ot(c);
  let i = e[s];
  const f = ha(t),
    h = f.slice(f.indexOf(a));
  for (let T = 0; T < h.length; T++) {
    const b = h[T];
    if (b === void 0) continue;
    const F = e[b];
    if (F) {
      i = F;
      break;
    }
  }
  const d = ot(i || []),
    g = vn(d, { cols: r });
  return (typeof l == 'object' && l !== null ? l : Rn(l)).compact(g, r);
}
function Lt(e, t) {
  if (Array.isArray(e)) return e;
  const a = e,
    s = a[t];
  if (s !== void 0) return s;
  const r = Object.keys(a);
  for (const l of r) {
    const c = a[l];
    if (c !== void 0) return c;
  }
  return [10, 10];
}
function ga(e) {
  return function (a, s, r, l, c, i, f) {
    return e(a, s, f);
  };
}
function Bt(e) {
  return function (a, s, r, l) {
    if (!a || !s || typeof a != 'object' || typeof s != 'object') return e(a, s, r, l);
    var c = l.get(a),
      i = l.get(s);
    if (c && i) return c === s && i === a;
    (l.set(a, s), l.set(s, a));
    var f = e(a, s, r, l);
    return (l.delete(a), l.delete(s), f);
  };
}
function xa(e, t) {
  var a = {};
  for (var s in e) a[s] = e[s];
  for (var s in t) a[s] = t[s];
  return a;
}
function Hn(e) {
  return e.constructor === Object || e.constructor == null;
}
function Wn(e) {
  return typeof e.then == 'function';
}
function Vt(e, t) {
  return e === t || (e !== e && t !== t);
}
var zr = '[object Arguments]',
  Pr = '[object Boolean]',
  Lr = '[object Date]',
  Ar = '[object RegExp]',
  Mr = '[object Map]',
  _r = '[object Number]',
  Ir = '[object Object]',
  Hr = '[object Set]',
  Wr = '[object String]',
  $n = Object.prototype.toString;
function qt(e) {
  var t = e.areArraysEqual,
    a = e.areDatesEqual,
    s = e.areMapsEqual,
    r = e.areObjectsEqual,
    l = e.areRegExpsEqual,
    c = e.areSetsEqual,
    i = e.createIsNestedEqual,
    f = i(h);
  function h(d, g, R) {
    if (d === g) return !0;
    if (!d || !g || typeof d != 'object' || typeof g != 'object') return d !== d && g !== g;
    if (Hn(d) && Hn(g)) return r(d, g, f, R);
    var T = Array.isArray(d),
      b = Array.isArray(g);
    if (T || b) return T === b && t(d, g, f, R);
    var F = $n.call(d);
    return F !== $n.call(g)
      ? !1
      : F === Lr
        ? a(d, g, f, R)
        : F === Ar
          ? l(d, g, f, R)
          : F === Mr
            ? s(d, g, f, R)
            : F === Hr
              ? c(d, g, f, R)
              : F === Ir || F === zr
                ? Wn(d) || Wn(g)
                  ? !1
                  : r(d, g, f, R)
                : F === Pr || F === _r || F === Wr
                  ? Vt(d.valueOf(), g.valueOf())
                  : !1;
  }
  return h;
}
function ya(e, t, a, s) {
  var r = e.length;
  if (t.length !== r) return !1;
  for (; r-- > 0;) if (!a(e[r], t[r], r, r, e, t, s)) return !1;
  return !0;
}
var $r = Bt(ya);
function ba(e, t) {
  return Vt(e.valueOf(), t.valueOf());
}
function va(e, t, a, s) {
  var r = e.size === t.size;
  if (!r) return !1;
  if (!e.size) return !0;
  var l = {},
    c = 0;
  return (
    e.forEach(function (i, f) {
      if (r) {
        var h = !1,
          d = 0;
        (t.forEach(function (g, R) {
          (!h && !l[d] && (h = a(f, R, c, d, e, t, s) && a(i, g, f, R, e, t, s)) && (l[d] = !0),
            d++);
        }),
          c++,
          (r = h));
      }
    }),
    r
  );
}
var Br = Bt(va),
  Vr = '_owner',
  qr = Object.prototype.hasOwnProperty;
function ja(e, t, a, s) {
  var r = Object.keys(e),
    l = r.length;
  if (Object.keys(t).length !== l) return !1;
  for (var c; l-- > 0;) {
    if (((c = r[l]), c === Vr)) {
      var i = !!e.$$typeof,
        f = !!t.$$typeof;
      if ((i || f) && i !== f) return !1;
    }
    if (!qr.call(t, c) || !a(e[c], t[c], c, c, e, t, s)) return !1;
  }
  return !0;
}
var Yr = Bt(ja);
function Na(e, t) {
  return e.source === t.source && e.flags === t.flags;
}
function ka(e, t, a, s) {
  var r = e.size === t.size;
  if (!r) return !1;
  if (!e.size) return !0;
  var l = {};
  return (
    e.forEach(function (c, i) {
      if (r) {
        var f = !1,
          h = 0;
        (t.forEach(function (d, g) {
          (!f && !l[h] && (f = a(c, d, i, g, e, t, s)) && (l[h] = !0), h++);
        }),
          (r = f));
      }
    }),
    r
  );
}
var Xr = Bt(ka),
  Ca = Object.freeze({
    areArraysEqual: ya,
    areDatesEqual: ba,
    areMapsEqual: va,
    areObjectsEqual: ja,
    areRegExpsEqual: Na,
    areSetsEqual: ka,
    createIsNestedEqual: ga
  }),
  wa = Object.freeze({
    areArraysEqual: $r,
    areDatesEqual: ba,
    areMapsEqual: Br,
    areObjectsEqual: Yr,
    areRegExpsEqual: Na,
    areSetsEqual: Xr,
    createIsNestedEqual: ga
  }),
  Gr = qt(Ca);
function Qe(e, t) {
  return Gr(e, t, void 0);
}
qt(
  xa(Ca, {
    createIsNestedEqual: function () {
      return Vt;
    }
  })
);
qt(wa);
qt(
  xa(wa, {
    createIsNestedEqual: function () {
      return Vt;
    }
  })
);
function Ur(e) {
  const t =
    typeof globalThis.getComputedStyle == 'function' ? globalThis.getComputedStyle(e) : null;
  if (!t) return e.clientWidth;
  const a = (r) => {
      const l = Number.parseFloat(r);
      return Number.isFinite(l) ? l : 0;
    },
    s = Number.parseFloat(t.width);
  return Number.isFinite(s)
    ? Math.max(0, s)
    : Math.max(0, e.clientWidth - a(t.paddingLeft) - a(t.paddingRight));
}
function Kr(e = {}) {
  const { measureBeforeMount: t = !1, initialWidth: a = 1280 } = e,
    [s, r] = u.useState(a),
    [l, c] = u.useState(!t),
    i = u.useRef(null),
    f = u.useRef(null),
    h = u.useCallback(() => {
      const d = i.current;
      if (d) {
        const g = Math.round(Ur(d));
        (r((R) => (R === g ? R : g)), l || c(!0));
      }
    }, [l]);
  return (
    u.useEffect(() => {
      const d = i.current;
      if (d) {
        if ((h(), typeof ResizeObserver < 'u')) {
          let g = null;
          return (
            (f.current = new ResizeObserver((R) => {
              const T = R[0];
              if (T) {
                const b = Math.round(T.contentRect.width);
                (g !== null && cancelAnimationFrame(g),
                  (g = requestAnimationFrame(() => {
                    (r((F) => (F === b ? F : b)), (g = null));
                  })));
              }
            })),
            f.current.observe(d),
            () => {
              (g !== null && cancelAnimationFrame(g),
                f.current && (f.current.disconnect(), (f.current = null)));
            }
          );
        }
        return () => {
          f.current && (f.current.disconnect(), (f.current = null));
        };
      }
    }, [h]),
    { width: s, mounted: l, containerRef: i, measureWidth: h }
  );
}
var Sa = { exports: {} },
  Jr = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED',
  Zr = Jr,
  Qr = Zr;
function Ra() {}
function Da() {}
Da.resetWarningCache = Ra;
var es = function () {
  function e(s, r, l, c, i, f) {
    if (f !== Qr) {
      var h = new Error(
        'Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types'
      );
      throw ((h.name = 'Invariant Violation'), h);
    }
  }
  e.isRequired = e;
  function t() {
    return e;
  }
  var a = {
    array: e,
    bigint: e,
    bool: e,
    func: e,
    number: e,
    object: e,
    string: e,
    symbol: e,
    any: e,
    arrayOf: t,
    element: e,
    elementType: e,
    instanceOf: t,
    node: e,
    objectOf: t,
    oneOf: t,
    oneOfType: t,
    shape: t,
    exact: t,
    checkPropTypes: Da,
    resetWarningCache: Ra
  };
  return ((a.PropTypes = a), a);
};
Sa.exports = es();
var Dn = Sa.exports;
const B = Ha(Dn);
var ts = {};
function fn(e, t) {
  for (let a = 0, s = e.length; a < s; a++) if (t.apply(t, [e[a], a, e])) return e[a];
}
function Bn(e) {
  return typeof e == 'function' || Object.prototype.toString.call(e) === '[object Function]';
}
function Nt(e) {
  return typeof e == 'number' && !isNaN(e);
}
function ze(e) {
  return parseInt(e, 10);
}
function yt(e, t, a) {
  if (e[t])
    return new Error(`Invalid prop ${t} passed to ${a} - do not set this, set it on the child.`);
}
var tn = ['Moz', 'Webkit', 'O', 'ms'];
function ns(e = 'transform') {
  var t, a;
  if (typeof window > 'u') return '';
  const s =
    (a = (t = window.document) == null ? void 0 : t.documentElement) == null ? void 0 : a.style;
  if (!s || e in s) return '';
  for (let r = 0; r < tn.length; r++) if (Ea(e, tn[r]) in s) return tn[r];
  return '';
}
function Ea(e, t) {
  return t ? `${t}${as(e)}` : e;
}
function as(e) {
  let t = '',
    a = !0;
  for (let s = 0; s < e.length; s++)
    a ? ((t += e[s].toUpperCase()), (a = !1)) : e[s] === '-' ? (a = !0) : (t += e[s]);
  return t;
}
var rs = ns(),
  nn = '';
function ss(e, t) {
  var a;
  nn ||
    (nn =
      (a = fn(
        [
          'matches',
          'webkitMatchesSelector',
          'mozMatchesSelector',
          'msMatchesSelector',
          'oMatchesSelector'
        ],
        function (r) {
          return Bn(e[r]);
        }
      )) != null
        ? a
        : '');
  const s = e[nn];
  return Bn(s) ? !!s.call(e, t) : !1;
}
function Vn(e, t, a) {
  let s = e;
  do {
    if (ss(s, t)) return !0;
    if (s === a) return !1;
    s = s.parentNode;
  } while (s);
  return !1;
}
function an(e, t, a, s) {
  if (!e) return;
  const r = { capture: !0, ...s },
    l = a;
  e.addEventListener
    ? e.addEventListener(t, l, r)
    : e.attachEvent
      ? e.attachEvent('on' + t, l)
      : (e['on' + t] = l);
}
function lt(e, t, a, s) {
  if (!e) return;
  const r = { capture: !0, ...s },
    l = a;
  e.removeEventListener
    ? e.removeEventListener(t, l, r)
    : e.detachEvent
      ? e.detachEvent('on' + t, l)
      : (e['on' + t] = null);
}
function os(e) {
  let t = e.clientHeight;
  const a = e.ownerDocument.defaultView.getComputedStyle(e);
  return ((t += ze(a.borderTopWidth)), (t += ze(a.borderBottomWidth)), t);
}
function is(e) {
  let t = e.clientWidth;
  const a = e.ownerDocument.defaultView.getComputedStyle(e);
  return ((t += ze(a.borderLeftWidth)), (t += ze(a.borderRightWidth)), t);
}
function ls(e) {
  let t = e.clientHeight;
  const a = e.ownerDocument.defaultView.getComputedStyle(e);
  return ((t -= ze(a.paddingTop)), (t -= ze(a.paddingBottom)), t);
}
function cs(e) {
  let t = e.clientWidth;
  const a = e.ownerDocument.defaultView.getComputedStyle(e);
  return ((t -= ze(a.paddingLeft)), (t -= ze(a.paddingRight)), t);
}
function ds(e, t, a) {
  const r = t === t.ownerDocument.body ? { left: 0, top: 0 } : t.getBoundingClientRect(),
    l = (e.clientX + t.scrollLeft - r.left) / a,
    c = (e.clientY + t.scrollTop - r.top) / a;
  return { x: l, y: c };
}
function us(e, t) {
  const a = Fa(e, t, 'px');
  return { [Ea('transform', rs)]: a };
}
function fs(e, t) {
  return Fa(e, t, '');
}
function Fa({ x: e, y: t }, a, s) {
  let r = `translate(${e}${s},${t}${s})`;
  if (a) {
    const l = `${typeof a.x == 'string' ? a.x : a.x + s}`,
      c = `${typeof a.y == 'string' ? a.y : a.y + s}`;
    r = `translate(${l}, ${c})` + r;
  }
  return r;
}
function ps(e, t) {
  return (
    (e.targetTouches && fn(e.targetTouches, (a) => t === a.identifier)) ||
    (e.changedTouches && fn(e.changedTouches, (a) => t === a.identifier))
  );
}
function ms(e) {
  if (e.targetTouches && e.targetTouches[0]) return e.targetTouches[0].identifier;
  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
}
function hs() {
  return typeof __webpack_nonce__ < 'u' ? __webpack_nonce__ : void 0;
}
function gs(e, t) {
  if (!e) return;
  let a = e.getElementById('react-draggable-style-el');
  if (!a) {
    ((a = e.createElement('style')), (a.type = 'text/css'), (a.id = 'react-draggable-style-el'));
    const s = t ?? hs();
    (s && a.setAttribute('nonce', s),
      (a.innerHTML = `.react-draggable-transparent-selection *::-moz-selection {all: inherit;}
`),
      (a.innerHTML += `.react-draggable-transparent-selection *::selection {all: inherit;}
`),
      e.getElementsByTagName('head')[0].appendChild(a));
  }
  e.body && xs(e.body, 'react-draggable-transparent-selection');
}
function qn(e) {
  window.requestAnimationFrame
    ? window.requestAnimationFrame(() => {
        Yn(e);
      })
    : Yn(e);
}
function Yn(e) {
  if (e)
    try {
      e.body && ys(e.body, 'react-draggable-transparent-selection');
      const t = e.selection;
      if (t) t.empty();
      else {
        const a = (e.defaultView || window).getSelection();
        a && a.type !== 'Caret' && a.removeAllRanges();
      }
    } catch {}
}
function xs(e, t) {
  e.classList
    ? e.classList.add(t)
    : e.className.match(new RegExp(`(?:^|\\s)${t}(?!\\S)`)) || (e.className += ` ${t}`);
}
function ys(e, t) {
  e.classList
    ? e.classList.remove(t)
    : (e.className = e.className.replace(new RegExp(`(?:^|\\s)${t}(?!\\S)`, 'g'), ''));
}
function bs(e, t, a) {
  if (!e.props.bounds) return [t, a];
  let { bounds: s } = e.props;
  s = typeof s == 'string' ? s : Ns(s);
  const r = En(e);
  if (typeof s == 'string') {
    const { ownerDocument: l } = r,
      c = l.defaultView;
    if (!c) throw new Error('Cannot resolve the owner window of the draggable node.');
    let i;
    if (
      (s === 'parent' ? (i = r.parentNode) : (i = r.getRootNode().querySelector(s)),
      !(i instanceof c.HTMLElement))
    )
      throw new Error('Bounds selector "' + s + '" could not find an element.');
    const f = i,
      h = c.getComputedStyle(r),
      d = c.getComputedStyle(f);
    s = {
      left: -r.offsetLeft + ze(d.paddingLeft) + ze(h.marginLeft),
      top: -r.offsetTop + ze(d.paddingTop) + ze(h.marginTop),
      right: cs(f) - is(r) - r.offsetLeft + ze(d.paddingRight) - ze(h.marginRight),
      bottom: ls(f) - os(r) - r.offsetTop + ze(d.paddingBottom) - ze(h.marginBottom)
    };
  }
  return (
    Nt(s.right) && (t = Math.min(t, s.right)),
    Nt(s.bottom) && (a = Math.min(a, s.bottom)),
    Nt(s.left) && (t = Math.max(t, s.left)),
    Nt(s.top) && (a = Math.max(a, s.top)),
    [t, a]
  );
}
function Xn(e, t, a) {
  const s = Math.round(t / e[0]) * e[0],
    r = Math.round(a / e[1]) * e[1];
  return [s, r];
}
function vs(e) {
  return e.props.axis === 'both' || e.props.axis === 'x';
}
function js(e) {
  return e.props.axis === 'both' || e.props.axis === 'y';
}
function rn(e, t, a) {
  const s = typeof t == 'number' ? ps(e, t) : null;
  if (typeof t == 'number' && !s) return null;
  const r = En(a),
    l = a.props.offsetParent || r.offsetParent || r.ownerDocument.body;
  return ds(s || e, l, a.props.scale);
}
function sn(e, t, a) {
  const s = !Nt(e.lastX),
    r = En(e);
  return s
    ? { node: r, deltaX: 0, deltaY: 0, lastX: t, lastY: a, x: t, y: a }
    : {
        node: r,
        deltaX: t - e.lastX,
        deltaY: a - e.lastY,
        lastX: e.lastX,
        lastY: e.lastY,
        x: t,
        y: a
      };
}
function on(e, t) {
  const a = e.props.scale;
  return {
    node: t.node,
    x: e.state.x + t.deltaX / a,
    y: e.state.y + t.deltaY / a,
    deltaX: t.deltaX / a,
    deltaY: t.deltaY / a,
    lastX: e.state.x,
    lastY: e.state.y
  };
}
function Ns(e) {
  return { left: e.left, top: e.top, right: e.right, bottom: e.bottom };
}
function En(e) {
  const t = e.findDOMNode();
  if (!t) throw new Error('<DraggableCore>: Unmounted during event!');
  return t;
}
var ks = typeof process < 'u' && ts.DRAGGABLE_DEBUG ? console.log.bind(console) : function () {},
  Ue = ks,
  qe = {
    touch: { start: 'touchstart', move: 'touchmove', stop: 'touchend' },
    mouse: { start: 'mousedown', move: 'mousemove', stop: 'mouseup' }
  },
  rt = qe.mouse,
  it = class extends u.Component {
    constructor() {
      (super(...arguments),
        (this.dragging = !1),
        (this.lastX = NaN),
        (this.lastY = NaN),
        (this.touchIdentifier = null),
        (this.mounted = !1),
        (this.handleDragStart = (e) => {
          if (
            (this.props.onMouseDown(e),
            !this.props.allowAnyClick &&
              ((typeof e.button == 'number' && e.button !== 0) || e.ctrlKey))
          )
            return !1;
          const t = this.findDOMNode();
          if (!t || !t.ownerDocument || !t.ownerDocument.body)
            throw new Error('<DraggableCore> not mounted on DragStart!');
          const { ownerDocument: a } = t;
          if (
            this.props.disabled ||
            !(e.target instanceof a.defaultView.Node) ||
            (this.props.handle && !Vn(e.target, this.props.handle, t)) ||
            (this.props.cancel && Vn(e.target, this.props.cancel, t))
          )
            return;
          e.type === 'touchstart' && !this.props.allowMobileScroll && e.preventDefault();
          const s = ms(e);
          this.touchIdentifier = s;
          const r = rn(e, s, this);
          if (r == null) return;
          const { x: l, y: c } = r,
            i = sn(this, l, c);
          (Ue('DraggableCore: handleDragStart: %j', i),
            Ue('calling', this.props.onStart),
            !(this.props.onStart(e, i) === !1 || this.mounted === !1) &&
              (this.props.enableUserSelectHack && gs(a, this.props.nonce),
              (this.dragging = !0),
              (this.lastX = l),
              (this.lastY = c),
              an(a, rt.move, this.handleDrag),
              an(a, rt.stop, this.handleDragStop)));
        }),
        (this.handleDrag = (e) => {
          const t = rn(e, this.touchIdentifier, this);
          if (t == null) return;
          let { x: a, y: s } = t;
          if (Array.isArray(this.props.grid)) {
            let c = a - this.lastX,
              i = s - this.lastY;
            if ((([c, i] = Xn(this.props.grid, c, i)), !c && !i)) return;
            ((a = this.lastX + c), (s = this.lastY + i));
          }
          const r = sn(this, a, s);
          if (
            (Ue('DraggableCore: handleDrag: %j', r),
            this.props.onDrag(e, r) === !1 || this.mounted === !1)
          ) {
            try {
              this.handleDragStop(new MouseEvent('mouseup'));
            } catch {
              const c = document.createEvent('MouseEvents');
              (c.initMouseEvent('mouseup', !0, !0, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null),
                this.handleDragStop(c));
            }
            return;
          }
          ((this.lastX = a), (this.lastY = s));
        }),
        (this.handleDragStop = (e) => {
          if (!this.dragging) return;
          const t = rn(e, this.touchIdentifier, this);
          if (t == null) return;
          let { x: a, y: s } = t;
          if (Array.isArray(this.props.grid)) {
            let i = a - this.lastX || 0,
              f = s - this.lastY || 0;
            (([i, f] = Xn(this.props.grid, i, f)), (a = this.lastX + i), (s = this.lastY + f));
          }
          const r = sn(this, a, s);
          if (this.props.onStop(e, r) === !1 || this.mounted === !1) return !1;
          const c = this.findDOMNode();
          (c && this.props.enableUserSelectHack && qn(c.ownerDocument),
            Ue('DraggableCore: handleDragStop: %j', r),
            (this.dragging = !1),
            (this.lastX = NaN),
            (this.lastY = NaN),
            c &&
              (Ue('DraggableCore: Removing handlers'),
              lt(c.ownerDocument, rt.move, this.handleDrag),
              lt(c.ownerDocument, rt.stop, this.handleDragStop)));
        }),
        (this.onMouseDown = (e) => ((rt = qe.mouse), this.handleDragStart(e))),
        (this.onMouseUp = (e) => ((rt = qe.mouse), this.handleDragStop(e))),
        (this.onTouchStart = (e) => ((rt = qe.touch), this.handleDragStart(e))),
        (this.onTouchEnd = (e) => ((rt = qe.touch), this.handleDragStop(e))));
    }
    componentDidMount() {
      this.mounted = !0;
      const e = this.findDOMNode();
      e && an(e, qe.touch.start, this.onTouchStart, { passive: !1 });
    }
    componentWillUnmount() {
      this.mounted = !1;
      const e = this.findDOMNode();
      if (e) {
        const { ownerDocument: t } = e;
        (lt(t, qe.mouse.move, this.handleDrag),
          lt(t, qe.touch.move, this.handleDrag),
          lt(t, qe.mouse.stop, this.handleDragStop),
          lt(t, qe.touch.stop, this.handleDragStop),
          lt(e, qe.touch.start, this.onTouchStart, { passive: !1 }),
          this.props.enableUserSelectHack && qn(t));
      }
    }
    findDOMNode() {
      var e;
      if ((e = this.props) != null && e.nodeRef) return this.props.nodeRef.current;
      const t = oa;
      return typeof t.findDOMNode == 'function'
        ? t.findDOMNode(this)
        : (Ue(
            'react-draggable: ReactDOM.findDOMNode is not available in React 19+. You must provide a nodeRef prop. See: https://github.com/react-grid-layout/react-draggable#noderef'
          ),
          null);
    }
    render() {
      return u.cloneElement(u.Children.only(this.props.children), {
        onMouseDown: this.onMouseDown,
        onMouseUp: this.onMouseUp,
        onTouchEnd: this.onTouchEnd
      });
    }
  };
it.displayName = 'DraggableCore';
it.propTypes = {
  allowAnyClick: B.bool,
  allowMobileScroll: B.bool,
  children: B.node.isRequired,
  disabled: B.bool,
  enableUserSelectHack: B.bool,
  offsetParent: function (e, t) {
    if (e[t] && e[t].nodeType !== 1)
      throw new Error("Draggable's offsetParent must be a DOM Node.");
  },
  grid: B.arrayOf(B.number),
  handle: B.string,
  cancel: B.string,
  nodeRef: B.object,
  nonce: B.string,
  onStart: B.func,
  onDrag: B.func,
  onStop: B.func,
  onMouseDown: B.func,
  scale: B.number,
  className: yt,
  style: yt,
  transform: yt
};
it.defaultProps = {
  allowAnyClick: !1,
  allowMobileScroll: !1,
  disabled: !1,
  enableUserSelectHack: !0,
  onStart: function () {},
  onDrag: function () {},
  onStop: function () {},
  onMouseDown: function () {},
  scale: 1
};
var Yt = class extends u.Component {
  constructor(e) {
    (super(e),
      (this.onDragStart = (t, a) => {
        if ((Ue('Draggable: onDragStart: %j', a), this.props.onStart(t, on(this, a)) === !1))
          return !1;
        this.setState({ dragging: !0, dragged: !0 });
      }),
      (this.onDrag = (t, a) => {
        if (!this.state.dragging) return !1;
        Ue('Draggable: onDrag: %j', a);
        const s = on(this, a),
          r = { x: s.x, y: s.y, slackX: 0, slackY: 0 };
        if (this.props.bounds) {
          const { x: c, y: i } = r;
          ((r.x += this.state.slackX), (r.y += this.state.slackY));
          const [f, h] = bs(this, r.x, r.y);
          ((r.x = f),
            (r.y = h),
            (r.slackX = this.state.slackX + (c - r.x)),
            (r.slackY = this.state.slackY + (i - r.y)),
            (s.x = r.x),
            (s.y = r.y),
            (s.deltaX = r.x - this.state.x),
            (s.deltaY = r.y - this.state.y));
        }
        if (this.props.onDrag(t, s) === !1) return !1;
        this.setState(r);
      }),
      (this.onDragStop = (t, a) => {
        if (!this.state.dragging || this.props.onStop(t, on(this, a)) === !1) return !1;
        Ue('Draggable: onDragStop: %j', a);
        const r = { dragging: !1, slackX: 0, slackY: 0 };
        if (!!this.props.position) {
          const { x: c, y: i } = this.props.position;
          ((r.x = c), (r.y = i));
        }
        this.setState(r);
      }),
      (this.state = {
        dragging: !1,
        dragged: !1,
        x: e.position ? e.position.x : e.defaultPosition.x,
        y: e.position ? e.position.y : e.defaultPosition.y,
        prevPropsPosition: { ...e.position },
        slackX: 0,
        slackY: 0,
        isElementSVG: !1
      }),
      e.position &&
        !(e.onDrag || e.onStop) &&
        console.warn(
          'A `position` was applied to this <Draggable>, without drag handlers. This will make this component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the `position` of this element.'
        ));
  }
  static getDerivedStateFromProps({ position: e }, { prevPropsPosition: t }) {
    return e && (!t || e.x !== t.x || e.y !== t.y)
      ? (Ue('Draggable: getDerivedStateFromProps %j', { position: e, prevPropsPosition: t }),
        { x: e.x, y: e.y, prevPropsPosition: { ...e } })
      : null;
  }
  componentDidMount() {
    typeof window.SVGElement < 'u' &&
      this.findDOMNode() instanceof window.SVGElement &&
      this.setState({ isElementSVG: !0 });
  }
  componentWillUnmount() {
    this.state.dragging && this.setState({ dragging: !1 });
  }
  findDOMNode() {
    var e;
    if ((e = this.props) != null && e.nodeRef) return this.props.nodeRef.current;
    const t = oa;
    return typeof t.findDOMNode == 'function' ? t.findDOMNode(this) : null;
  }
  render() {
    const {
      axis: e,
      bounds: t,
      children: a,
      defaultPosition: s,
      defaultClassName: r,
      defaultClassNameDragging: l,
      defaultClassNameDragged: c,
      position: i,
      positionOffset: f,
      scale: h,
      ...d
    } = this.props;
    let g = {},
      R = null;
    const b = !!!i || this.state.dragging,
      F = i || s,
      O = { x: vs(this) && b ? this.state.x : F.x, y: js(this) && b ? this.state.y : F.y };
    this.state.isElementSVG ? (R = fs(O, f)) : (g = us(O, f));
    const M = u.Children.only(a),
      re = yn(M.props.className || '', r, { [l]: this.state.dragging, [c]: this.state.dragged });
    return u.createElement(
      it,
      { ...d, onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop },
      u.cloneElement(M, { className: re, style: { ...M.props.style, ...g }, transform: R })
    );
  }
};
Yt.displayName = 'Draggable';
Yt.propTypes = {
  ...it.propTypes,
  axis: B.oneOf(['both', 'x', 'y', 'none']),
  bounds: B.oneOfType([
    B.shape({ left: B.number, right: B.number, top: B.number, bottom: B.number }),
    B.string,
    B.oneOf([!1])
  ]),
  defaultClassName: B.string,
  defaultClassNameDragging: B.string,
  defaultClassNameDragged: B.string,
  defaultPosition: B.shape({ x: B.number, y: B.number }),
  positionOffset: B.shape({
    x: B.oneOfType([B.number, B.string]),
    y: B.oneOfType([B.number, B.string])
  }),
  position: B.shape({ x: B.number, y: B.number }),
  className: yt,
  style: yt,
  transform: yt
};
Yt.defaultProps = {
  ...it.defaultProps,
  axis: 'both',
  bounds: !1,
  defaultClassName: 'react-draggable',
  defaultClassNameDragging: 'react-draggable-dragging',
  defaultClassNameDragged: 'react-draggable-dragged',
  defaultPosition: { x: 0, y: 0 },
  scale: 1
};
var Cs = Yt;
const ws = Object.freeze(
  Object.defineProperty({ __proto__: null, DraggableCore: it, default: Cs }, Symbol.toStringTag, {
    value: 'Module'
  })
);
var Fn = { exports: {} },
  Ct = {};
const Ss = Wa(ws);
var On = {};
On.__esModule = !0;
On.cloneElement = Ts;
var Rs = Ds(u);
function Ds(e) {
  return e && e.__esModule ? e : { default: e };
}
function Gn(e, t) {
  var a = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    (t &&
      (s = s.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })),
      a.push.apply(a, s));
  }
  return a;
}
function Un(e) {
  for (var t = 1; t < arguments.length; t++) {
    var a = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Gn(Object(a), !0).forEach(function (s) {
          Es(e, s, a[s]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
        : Gn(Object(a)).forEach(function (s) {
            Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(a, s));
          });
  }
  return e;
}
function Es(e, t, a) {
  return (
    (t = Fs(t)) in e
      ? Object.defineProperty(e, t, { value: a, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = a),
    e
  );
}
function Fs(e) {
  var t = Os(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Os(e, t) {
  if (typeof e != 'object' || !e) return e;
  var a = e[Symbol.toPrimitive];
  if (a !== void 0) {
    var s = a.call(e, t);
    if (typeof s != 'object') return s;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Ts(e, t) {
  return (
    t.style && e.props.style && (t.style = Un(Un({}, e.props.style), t.style)),
    t.className && e.props.className && (t.className = e.props.className + ' ' + t.className),
    Rs.default.cloneElement(e, t)
  );
}
var wt = {};
wt.__esModule = !0;
wt.resizableProps = void 0;
var V = zs(Dn);
function zs(e) {
  return e && e.__esModule ? e : { default: e };
}
wt.resizableProps = {
  axis: V.default.oneOf(['both', 'x', 'y', 'none']),
  className: V.default.string,
  children: V.default.element.isRequired,
  draggableOpts: V.default.shape({
    allowAnyClick: V.default.bool,
    cancel: V.default.string,
    children: V.default.node,
    disabled: V.default.bool,
    enableUserSelectHack: V.default.bool,
    offsetParent: typeof Element < 'u' ? V.default.instanceOf(Element) : V.default.any,
    grid: V.default.arrayOf(V.default.number),
    handle: V.default.string,
    nodeRef: V.default.object,
    onStart: V.default.func,
    onDrag: V.default.func,
    onStop: V.default.func,
    onMouseDown: V.default.func,
    scale: V.default.number
  }),
  height: function () {
    for (var e = arguments.length, t = new Array(e), a = 0; a < e; a++) t[a] = arguments[a];
    const s = t[0];
    return s.axis === 'both' || s.axis === 'y'
      ? V.default.number.isRequired(...t)
      : V.default.number(...t);
  },
  handle: V.default.oneOfType([V.default.node, V.default.func]),
  handleSize: V.default.arrayOf(V.default.number),
  lockAspectRatio: V.default.bool,
  maxConstraints: V.default.arrayOf(V.default.number),
  minConstraints: V.default.arrayOf(V.default.number),
  onResizeStop: V.default.func,
  onResizeStart: V.default.func,
  onResize: V.default.func,
  resizeHandles: V.default.arrayOf(V.default.oneOf(['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'])),
  transformScale: V.default.number,
  width: function () {
    for (var e = arguments.length, t = new Array(e), a = 0; a < e; a++) t[a] = arguments[a];
    const s = t[0];
    return s.axis === 'both' || s.axis === 'x'
      ? V.default.number.isRequired(...t)
      : V.default.number(...t);
  }
};
Ct.__esModule = !0;
Ct.default = void 0;
var gt = Oa(u),
  Ps = Ss,
  Ls = On,
  As = wt;
const Ms = [
  'children',
  'className',
  'draggableOpts',
  'width',
  'height',
  'handle',
  'handleSize',
  'lockAspectRatio',
  'axis',
  'minConstraints',
  'maxConstraints',
  'onResize',
  'onResizeStop',
  'onResizeStart',
  'resizeHandles',
  'transformScale'
];
function Oa(e, t) {
  if (typeof WeakMap == 'function')
    var a = new WeakMap(),
      s = new WeakMap();
  return (Oa = function (r, l) {
    if (!l && r && r.__esModule) return r;
    var c,
      i,
      f = { __proto__: null, default: r };
    if (r === null || (typeof r != 'object' && typeof r != 'function')) return f;
    if ((c = l ? s : a)) {
      if (c.has(r)) return c.get(r);
      c.set(r, f);
    }
    for (const h in r)
      h !== 'default' &&
        {}.hasOwnProperty.call(r, h) &&
        ((i = (c = Object.defineProperty) && Object.getOwnPropertyDescriptor(r, h)) &&
        (i.get || i.set)
          ? c(f, h, i)
          : (f[h] = r[h]));
    return f;
  })(e, t);
}
function pn() {
  return (
    (pn = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var a = arguments[t];
            for (var s in a) ({}).hasOwnProperty.call(a, s) && (e[s] = a[s]);
          }
          return e;
        }),
    pn.apply(null, arguments)
  );
}
function _s(e, t) {
  if (e == null) return {};
  var a = {};
  for (var s in e)
    if ({}.hasOwnProperty.call(e, s)) {
      if (t.indexOf(s) !== -1) continue;
      a[s] = e[s];
    }
  return a;
}
function Kn(e, t) {
  var a = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    (t &&
      (s = s.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })),
      a.push.apply(a, s));
  }
  return a;
}
function ln(e) {
  for (var t = 1; t < arguments.length; t++) {
    var a = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Kn(Object(a), !0).forEach(function (s) {
          Is(e, s, a[s]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
        : Kn(Object(a)).forEach(function (s) {
            Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(a, s));
          });
  }
  return e;
}
function Is(e, t, a) {
  return (
    (t = Hs(t)) in e
      ? Object.defineProperty(e, t, { value: a, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = a),
    e
  );
}
function Hs(e) {
  var t = Ws(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Ws(e, t) {
  if (typeof e != 'object' || !e) return e;
  var a = e[Symbol.toPrimitive];
  if (a !== void 0) {
    var s = a.call(e, t);
    if (typeof s != 'object') return s;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
let Tn = class extends gt.Component {
  constructor() {
    (super(...arguments),
      (this.handleRefs = {}),
      (this.lastHandleRect = null),
      (this.slack = null),
      (this.lastSize = null));
  }
  componentWillUnmount() {
    this.resetData();
  }
  resetData() {
    this.lastHandleRect = this.slack = this.lastSize = null;
  }
  runConstraints(t, a) {
    const s = this.props,
      r = s.minConstraints,
      l = s.maxConstraints,
      c = s.lockAspectRatio;
    if (!r && !l && !c) return [t, a];
    if (c) {
      const R = this.props.width / this.props.height,
        T = t - this.props.width,
        b = a - this.props.height;
      Math.abs(T) > Math.abs(b * R) ? (a = t / R) : (t = a * R);
    }
    const i = t,
      f = a;
    let h = this.slack || [0, 0],
      d = h[0],
      g = h[1];
    return (
      (t += d),
      (a += g),
      r && ((t = Math.max(r[0], t)), (a = Math.max(r[1], a))),
      l && ((t = Math.min(l[0], t)), (a = Math.min(l[1], a))),
      (this.slack = [d + (i - t), g + (f - a)]),
      [t, a]
    );
  }
  resizeHandler(t, a) {
    return (s, r) => {
      var l, c, i, f;
      let h = r.node,
        d = r.deltaX,
        g = r.deltaY;
      t === 'onResizeStart' && this.resetData();
      const R = (this.props.axis === 'both' || this.props.axis === 'x') && a !== 'n' && a !== 's',
        T = (this.props.axis === 'both' || this.props.axis === 'y') && a !== 'e' && a !== 'w';
      if (!R && !T) return;
      const b = a[0],
        F = a[a.length - 1],
        O = h.getBoundingClientRect();
      if (this.lastHandleRect != null) {
        if (F === 'w') {
          const w = O.left - this.lastHandleRect.left;
          d += w;
        }
        if (b === 'n') {
          const w = O.top - this.lastHandleRect.top;
          g += w;
        }
      }
      ((this.lastHandleRect = O), F === 'w' && (d = -d), b === 'n' && (g = -g));
      const M = (l = (c = this.lastSize) == null ? void 0 : c.width) != null ? l : this.props.width,
        re = (i = (f = this.lastSize) == null ? void 0 : f.height) != null ? i : this.props.height;
      let se = M + (R ? d / this.props.transformScale : 0),
        ce = re + (T ? g / this.props.transformScale : 0);
      var he = this.runConstraints(se, ce);
      if (((se = he[0]), (ce = he[1]), t === 'onResizeStop' && this.lastSize)) {
        var m = this.lastSize;
        ((se = m.width), (ce = m.height));
      }
      const N = se !== M || ce !== re;
      t !== 'onResizeStop' && (this.lastSize = { width: se, height: ce });
      const y = typeof this.props[t] == 'function' ? this.props[t] : null;
      (y &&
        !(t === 'onResize' && !N) &&
        (s.persist == null || s.persist(),
        y(s, { node: h, size: { width: se, height: ce }, handle: a })),
        t === 'onResizeStop' && this.resetData());
    };
  }
  renderResizeHandle(t, a) {
    const s = this.props.handle;
    if (!s)
      return gt.createElement('span', {
        className: 'react-resizable-handle react-resizable-handle-' + t,
        ref: a
      });
    if (typeof s == 'function') return s(t, a);
    const r = typeof s.type == 'string',
      l = ln({ ref: a }, r ? {} : { handleAxis: t });
    return gt.cloneElement(s, l);
  }
  render() {
    const t = this.props,
      a = t.children,
      s = t.className,
      r = t.draggableOpts;
    (t.width,
      t.height,
      t.handle,
      t.handleSize,
      t.lockAspectRatio,
      t.axis,
      t.minConstraints,
      t.maxConstraints,
      t.onResize,
      t.onResizeStop,
      t.onResizeStart);
    const l = t.resizeHandles;
    t.transformScale;
    const c = _s(t, Ms);
    return (0, Ls.cloneElement)(
      a,
      ln(
        ln({}, c),
        {},
        {
          className: (s ? s + ' ' : '') + 'react-resizable',
          children: [
            ...gt.Children.toArray(a.props.children),
            ...l.map((i) => {
              var f;
              const h =
                (f = this.handleRefs[i]) != null ? f : (this.handleRefs[i] = gt.createRef());
              return gt.createElement(
                Ps.DraggableCore,
                pn({}, r, {
                  nodeRef: h,
                  key: 'resizableHandle-' + i,
                  onStop: this.resizeHandler('onResizeStop', i),
                  onStart: this.resizeHandler('onResizeStart', i),
                  onDrag: this.resizeHandler('onResize', i)
                }),
                this.renderResizeHandle(i, h)
              );
            })
          ]
        }
      )
    );
  }
};
Ct.default = Tn;
Tn.propTypes = As.resizableProps;
Tn.defaultProps = {
  axis: 'both',
  handleSize: [20, 20],
  lockAspectRatio: !1,
  minConstraints: [20, 20],
  maxConstraints: [1 / 0, 1 / 0],
  resizeHandles: ['se'],
  transformScale: 1
};
var Xt = {};
Xt.__esModule = !0;
Xt.default = void 0;
var cn = za(u),
  $s = Ta(Dn),
  Bs = Ta(Ct),
  Vs = wt;
const qs = [
  'handle',
  'handleSize',
  'onResize',
  'onResizeStart',
  'onResizeStop',
  'draggableOpts',
  'minConstraints',
  'maxConstraints',
  'lockAspectRatio',
  'axis',
  'width',
  'height',
  'resizeHandles',
  'style',
  'transformScale'
];
function Ta(e) {
  return e && e.__esModule ? e : { default: e };
}
function za(e, t) {
  if (typeof WeakMap == 'function')
    var a = new WeakMap(),
      s = new WeakMap();
  return (za = function (r, l) {
    if (!l && r && r.__esModule) return r;
    var c,
      i,
      f = { __proto__: null, default: r };
    if (r === null || (typeof r != 'object' && typeof r != 'function')) return f;
    if ((c = l ? s : a)) {
      if (c.has(r)) return c.get(r);
      c.set(r, f);
    }
    for (const h in r)
      h !== 'default' &&
        {}.hasOwnProperty.call(r, h) &&
        ((i = (c = Object.defineProperty) && Object.getOwnPropertyDescriptor(r, h)) &&
        (i.get || i.set)
          ? c(f, h, i)
          : (f[h] = r[h]));
    return f;
  })(e, t);
}
function mn() {
  return (
    (mn = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var a = arguments[t];
            for (var s in a) ({}).hasOwnProperty.call(a, s) && (e[s] = a[s]);
          }
          return e;
        }),
    mn.apply(null, arguments)
  );
}
function Jn(e, t) {
  var a = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    (t &&
      (s = s.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })),
      a.push.apply(a, s));
  }
  return a;
}
function Ht(e) {
  for (var t = 1; t < arguments.length; t++) {
    var a = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Jn(Object(a), !0).forEach(function (s) {
          Ys(e, s, a[s]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
        : Jn(Object(a)).forEach(function (s) {
            Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(a, s));
          });
  }
  return e;
}
function Ys(e, t, a) {
  return (
    (t = Xs(t)) in e
      ? Object.defineProperty(e, t, { value: a, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = a),
    e
  );
}
function Xs(e) {
  var t = Gs(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Gs(e, t) {
  if (typeof e != 'object' || !e) return e;
  var a = e[Symbol.toPrimitive];
  if (a !== void 0) {
    var s = a.call(e, t);
    if (typeof s != 'object') return s;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Us(e, t) {
  if (e == null) return {};
  var a = {};
  for (var s in e)
    if ({}.hasOwnProperty.call(e, s)) {
      if (t.indexOf(s) !== -1) continue;
      a[s] = e[s];
    }
  return a;
}
class Pa extends cn.Component {
  constructor() {
    (super(...arguments),
      (this.state = {
        width: this.props.width,
        height: this.props.height,
        propsWidth: this.props.width,
        propsHeight: this.props.height
      }),
      (this.onResize = (t, a) => {
        const s = a.size;
        this.props.onResize
          ? (t.persist == null || t.persist(),
            this.setState(s, () => this.props.onResize && this.props.onResize(t, a)))
          : this.setState(s);
      }));
  }
  static getDerivedStateFromProps(t, a) {
    return a.propsWidth !== t.width || a.propsHeight !== t.height
      ? { width: t.width, height: t.height, propsWidth: t.width, propsHeight: t.height }
      : null;
  }
  render() {
    const t = this.props,
      a = t.handle,
      s = t.handleSize;
    t.onResize;
    const r = t.onResizeStart,
      l = t.onResizeStop,
      c = t.draggableOpts,
      i = t.minConstraints,
      f = t.maxConstraints,
      h = t.lockAspectRatio,
      d = t.axis;
    (t.width, t.height);
    const g = t.resizeHandles,
      R = t.style,
      T = t.transformScale,
      b = Us(t, qs);
    return cn.createElement(
      Bs.default,
      {
        axis: d,
        draggableOpts: c,
        handle: a,
        handleSize: s,
        height: this.state.height,
        lockAspectRatio: h,
        maxConstraints: f,
        minConstraints: i,
        onResizeStart: r,
        onResize: this.onResize,
        onResizeStop: l,
        resizeHandles: g,
        transformScale: T,
        width: this.state.width
      },
      cn.createElement(
        'div',
        mn({}, b, {
          style: Ht(
            Ht({}, R),
            {},
            { width: this.state.width + 'px', height: this.state.height + 'px' }
          )
        })
      )
    );
  }
}
Xt.default = Pa;
Pa.propTypes = Ht(Ht({}, Vs.resizableProps), {}, { children: $s.default.element });
Fn.exports = function () {
  throw new Error("Don't instantiate Resizable directly! Use require('react-resizable').Resizable");
};
var Ks = (Fn.exports.Resizable = Ct.default);
Fn.exports.ResizableBox = Xt.default;
function Zn(e) {
  const {
      children: t,
      cols: a,
      containerWidth: s,
      margin: r,
      containerPadding: l,
      rowHeight: c,
      maxRows: i,
      isDraggable: f,
      isResizable: h,
      isBounded: d,
      static: g,
      useCSSTransforms: R = !0,
      usePercentages: T = !1,
      transformScale: b = 1,
      positionStrategy: F,
      dragThreshold: O = 0,
      droppingPosition: M,
      className: re = '',
      style: se,
      handle: ce = '',
      cancel: he = '',
      x: m,
      y: N,
      w: y,
      h: C,
      minW: w = 1,
      maxW: v = 1 / 0,
      minH: D = 1,
      maxH: S = 1 / 0,
      i: _,
      resizeHandles: G,
      resizeHandle: X,
      constraints: le = da,
      layoutItem: o,
      layout: k = [],
      onDragStart: x,
      onDrag: K,
      onDragStop: J,
      onResizeStart: ke,
      onResize: Re,
      onResizeStop: z
    } = e,
    [Q, L] = u.useState(!1),
    [fe, U] = u.useState(!1),
    Ce = u.useRef(null),
    Y = u.useRef({ left: 0, top: 0 }),
    be = u.useRef({ top: 0, left: 0, width: 0, height: 0 }),
    we = u.useRef(void 0),
    Be = u.useRef(k);
  Be.current = k;
  const Ee = u.useRef(null),
    xe = u.useRef(null),
    Fe = u.useRef(!1),
    et = u.useRef({ x: 0, y: 0 }),
    de = u.useRef(!1),
    oe = u.useMemo(
      () => ({
        cols: a,
        containerPadding: l,
        containerWidth: s,
        margin: r,
        maxRows: i,
        rowHeight: c
      }),
      [a, l, s, r, i, c]
    ),
    Oe = u.useMemo(
      () => ({
        cols: a,
        maxRows: i,
        containerWidth: s,
        containerHeight: 0,
        rowHeight: c,
        margin: r,
        layout: []
      }),
      [a, i, s, c, r]
    ),
    ve = u.useCallback(() => ({ ...Oe, layout: Be.current }), [Oe]),
    Me = u.useMemo(
      () => o ?? { i: _, x: m, y: N, w: y, h: C, minW: w, maxW: v, minH: D, maxH: S },
      [o, _, m, N, y, C, w, v, D, S]
    ),
    mt = u.useCallback(
      (Z) => {
        if (F != null && F.calcStyle) return F.calcStyle(Z);
        if (R) return ua(Z);
        const ee = pr(Z);
        return T ? { ...ee, left: Mn(Z.left / s), width: Mn(Z.width / s) } : ee;
      },
      [F, R, T, s]
    ),
    We = u.useCallback(
      (Z, { node: ee }) => {
        if (!x) return;
        const { offsetParent: ue } = ee;
        if (!ue) return;
        const ae = ue.getBoundingClientRect(),
          ye = ee.getBoundingClientRect(),
          je = ye.left / b,
          Se = ae.left / b,
          Ne = ye.top / b,
          Pe = ae.top / b;
        let Le;
        if (F != null && F.calcDragPosition) {
          const q = Z;
          Le = F.calcDragPosition(q.clientX, q.clientY, q.clientX - ye.left, q.clientY - ye.top);
        } else Le = { left: je - Se + ue.scrollLeft, top: Ne - Pe + ue.scrollTop };
        if (((Y.current = Le), O > 0)) {
          const q = Z;
          ((et.current = { x: q.clientX, y: q.clientY }),
            (Fe.current = !0),
            (de.current = !1),
            L(!0));
          return;
        }
        L(!0);
        const Ve = zt(oe, Le.top, Le.left),
          { x: H, y: j } = Pt(le, Me, Ve.x, Ve.y, ve());
        x(_, H, j, { e: Z, node: ee, newPosition: Le });
      },
      [x, b, oe, F, O, le, Me, ve, _]
    ),
    tt = u.useCallback(
      (Z, { node: ee, deltaX: ue, deltaY: ae }) => {
        if (!K || !Q) return;
        const ye = Z;
        if (Fe.current && !de.current) {
          const H = ye.clientX - et.current.x,
            j = ye.clientY - et.current.y;
          if (Math.hypot(H, j) < O) return;
          if (((de.current = !0), (Fe.current = !1), x)) {
            const $ = zt(oe, Y.current.top, Y.current.left),
              { x: te, y: ie } = Pt(le, Me, $.x, $.y, ve());
            x(_, te, ie, { e: Z, node: ee, newPosition: Y.current });
          }
        }
        let je = Y.current.top + ae,
          Se = Y.current.left + ue;
        if (d) {
          const { offsetParent: H } = ee;
          if (H) {
            const j = H.clientHeight - Ge(C, c, r[1]);
            je = _t(je, 0, j);
            const q = ft(oe),
              $ = s - Ge(y, q, r[0]);
            Se = _t(Se, 0, $);
          }
        }
        const Ne = { top: je, left: Se };
        Y.current = Ne;
        const Pe = zt(oe, je, Se),
          { x: Le, y: Ve } = Pt(le, Me, Pe.x, Pe.y, ve());
        K(_, Le, Ve, { e: Z, node: ee, newPosition: Ne });
      },
      [K, x, Q, O, d, C, c, r, oe, s, y, _, le, Me, ve]
    ),
    Ye = u.useCallback(
      (Z, { node: ee }) => {
        if (!J || !Q) return;
        const ue = Fe.current;
        if (((Fe.current = !1), (de.current = !1), (et.current = { x: 0, y: 0 }), ue)) {
          (L(!1), (Y.current = { left: 0, top: 0 }));
          return;
        }
        const { left: ae, top: ye } = Y.current,
          je = { top: ye, left: ae };
        (L(!1), (Y.current = { left: 0, top: 0 }));
        const Se = zt(oe, ye, ae),
          { x: Ne, y: Pe } = Pt(le, Me, Se.x, Se.y, ve());
        J(_, Ne, Pe, { e: Z, node: ee, newPosition: je });
      },
      [J, Q, oe, le, Me, ve, _]
    );
  ((Ee.current = We), (xe.current = tt));
  const _e = u.useCallback(
      (Z, { node: ee, size: ue, handle: ae }, ye, je) => {
        const Se = je === 'onResizeStart' ? ke : je === 'onResize' ? Re : z;
        if (!Se) return;
        let Ne;
        (ee ? (Ne = jr(ae, ye, ue, s)) : (Ne = { ...ue, top: ye.top, left: ye.left }),
          (be.current = Ne));
        const Pe = or(oe, Ne.width, Ne.height),
          { w: Le, h: Ve } = fr(le, Me, Pe.w, Pe.h, ae, ve());
        Se(_, Le, Ve, { e: Z.nativeEvent ?? Z, node: ee, size: Ne, handle: ae });
      },
      [ke, Re, z, s, oe, _, le, Me, ve]
    ),
    nt = u.useCallback(
      (Z, ee) => {
        U(!0);
        const ue = Tt(oe, m, N, y, C),
          ae = { ...ee, handle: ee.handle };
        _e(Z, ae, ue, 'onResizeStart');
      },
      [_e, oe, m, N, y, C]
    ),
    at = u.useCallback(
      (Z, ee) => {
        const ue = Tt(oe, m, N, y, C),
          ae = { ...ee, handle: ee.handle };
        _e(Z, ae, ue, 'onResize');
      },
      [_e, oe, m, N, y, C]
    ),
    Xe = u.useCallback(
      (Z, ee) => {
        (U(!1), (be.current = { top: 0, left: 0, width: 0, height: 0 }));
        const ue = Tt(oe, m, N, y, C),
          ae = { ...ee, handle: ee.handle };
        _e(Z, ae, ue, 'onResizeStop');
      },
      [_e, oe, m, N, y, C]
    );
  u.useEffect(() => {
    var ae, ye;
    if (!M) return;
    const Z = Ce.current;
    if (!Z) return;
    const ee = we.current || { left: 0, top: 0 },
      ue = Q && (M.left !== ee.left || M.top !== ee.top);
    if (Q) {
      if (ue) {
        const je = M.left - Y.current.left,
          Se = M.top - Y.current.top,
          Ne = {
            node: Z,
            deltaX: je,
            deltaY: Se,
            lastX: Y.current.left,
            lastY: Y.current.top,
            x: M.left,
            y: M.top
          };
        (ye = xe.current) == null || ye.call(xe, M.e, Ne);
      }
    } else {
      const je = {
        node: Z,
        deltaX: M.left,
        deltaY: M.top,
        lastX: 0,
        lastY: 0,
        x: M.left,
        y: M.top
      };
      (ae = Ee.current) == null || ae.call(Ee, M.e, je);
    }
    we.current = M;
  }, [M, Q, _]);
  const Ie = Tt(oe, m, N, y, C, Q ? Y.current : null, fe ? be.current : null),
    p = Ke.Children.only(t),
    E = ft(oe),
    A = [Ge(w, E, r[0]), Ge(D, c, r[1])],
    I = [Ge(v, E, r[0]), Ge(S, c, r[1])],
    W = p.props,
    P = W.className,
    Ae = W.style;
  let $e = Ke.cloneElement(p, {
    ref: Ce,
    className: yn('react-grid-item', P, re, {
      static: g,
      resizing: fe,
      'react-draggable': f,
      'react-draggable-dragging': Q,
      dropping: !!M,
      cssTransforms: R
    }),
    style: { ...se, ...Ae, ...mt(Ie) }
  });
  const ht = X;
  return (
    ($e = n.jsx(Ks, {
      draggableOpts: { disabled: !h },
      className: h ? void 0 : 'react-resizable-hide',
      width: Ie.width,
      height: Ie.height,
      minConstraints: A,
      maxConstraints: I,
      onResizeStart: nt,
      onResize: at,
      onResizeStop: Xe,
      transformScale: b,
      resizeHandles: G,
      handle: ht,
      children: $e
    })),
    ($e = n.jsx(it, {
      disabled: !f,
      onStart: We,
      onDrag: tt,
      onStop: Ye,
      handle: ce,
      cancel: '.react-resizable-handle' + (he ? ',' + he : ''),
      scale: b,
      nodeRef: Ce,
      children: $e
    })),
    $e
  );
}
var Ze = () => {},
  Qn = 'react-grid-layout',
  La = !1;
try {
  La = /firefox/i.test(navigator.userAgent);
} catch {}
function Js(e, t) {
  const a = Ke.Children.toArray(e),
    s = Ke.Children.toArray(t);
  if (a.length !== s.length) return !1;
  for (let r = 0; r < a.length; r++) {
    const l = a[r],
      c = s[r];
    if ((l == null ? void 0 : l.key) !== (c == null ? void 0 : c.key)) return !1;
  }
  return !0;
}
function ea(e, t, a, s) {
  const r = [],
    l = new Set();
  Ke.Children.forEach(t, (i) => {
    if (!Ke.isValidElement(i) || i.key === null) return;
    const f = String(i.key);
    l.add(f);
    const h = e.find((d) => d.i === f);
    if (h) r.push(pt(h));
    else {
      const g = i.props['data-grid'];
      g
        ? r.push({
            i: f,
            x: g.x ?? 0,
            y: g.y ?? 0,
            w: g.w ?? 1,
            h: g.h ?? 1,
            minW: g.minW,
            maxW: g.maxW,
            minH: g.minH,
            maxH: g.maxH,
            static: g.static,
            isDraggable: g.isDraggable,
            isResizable: g.isResizable,
            resizeHandles: g.resizeHandles,
            isBounded: g.isBounded
          })
        : r.push({ i: f, x: 0, y: Wt(r), w: 1, h: 1 });
    }
  });
  const c = vn(r, { cols: a });
  return s.compact(c, a);
}
function Zs(e) {
  const {
      children: t,
      width: a,
      gridConfig: s,
      dragConfig: r,
      resizeConfig: l,
      dropConfig: c,
      positionStrategy: i = kr,
      compactor: f,
      constraints: h = da,
      layout: d = [],
      droppingItem: g,
      autoSize: R = !0,
      className: T = '',
      style: b = {},
      innerRef: F,
      onLayoutChange: O = Ze,
      onDragStart: M = Ze,
      onDrag: re = Ze,
      onDragStop: se = Ze,
      onResizeStart: ce = Ze,
      onResize: he = Ze,
      onResizeStop: m = Ze,
      onDrop: N = Ze,
      onDropDragOver: y = Ze
    } = e,
    C = u.useMemo(() => ({ ...Cr, ...s }), [s]),
    w = u.useMemo(() => ({ ...wr, ...r }), [r]),
    v = u.useMemo(() => ({ ...Sr, ...l }), [l]),
    D = u.useMemo(() => ({ ...Rr, ...c }), [c]),
    { cols: S, rowHeight: _, maxRows: G, margin: X, containerPadding: le } = C,
    { enabled: o, bounded: k, handle: x, cancel: K, threshold: J } = w,
    { enabled: ke, handles: Re, handleComponent: z } = v,
    { enabled: Q, defaultItem: L, onDragOver: fe } = D,
    U = f ?? Rn('vertical'),
    Ce = U.type,
    Y = U.allowOverlap,
    be = U.preventCollision ?? !1,
    we = u.useMemo(() => g ?? { i: '__dropping-elem__', ...L }, [g, L]),
    Be = i.type === 'transform',
    Ee = i.scale,
    xe = le ?? X,
    [Fe, et] = u.useState(!1),
    [de, oe] = u.useState(() => ea(d, t, S, U)),
    [Oe, ve] = u.useState(null),
    [Me, mt] = u.useState(!1),
    [We, tt] = u.useState(null),
    [Ye, _e] = u.useState(),
    nt = u.useRef(null),
    at = u.useRef(null),
    Xe = u.useRef(null),
    Ie = u.useRef(0),
    p = u.useRef(de),
    E = u.useRef(d),
    A = u.useRef(t),
    I = u.useRef(Ce),
    W = u.useRef(de);
  ((W.current = de),
    u.useEffect(() => {
      (et(!0), Qe(de, d) || O(de));
    }, []),
    u.useEffect(() => {
      if (Oe || We) return;
      const j = !Qe(d, E.current),
        q = !Js(t, A.current),
        $ = Ce !== I.current;
      if (j || q || $) {
        const ie = ea(j ? d : de, t, S, U);
        Qe(ie, de) || oe(ie);
      }
      ((E.current = d), (A.current = t), (I.current = Ce));
    }, [d, t, S, Ce, U, Oe, We, de]),
    u.useEffect(() => {
      if (!Oe && !Qe(de, p.current)) {
        p.current = de;
        const j = de.filter((q) => q.i !== we.i);
        O(j);
      }
    }, [de, Oe, O, we.i]));
  const P = u.useMemo(() => {
      if (!R) return;
      const j = Wt(de),
        q = xe[1];
      return j * _ + (j - 1) * X[1] + q * 2 + 'px';
    }, [R, de, _, X, xe]),
    Ae = u.useCallback(
      (j, q, $, te) => {
        const ie = W.current,
          ne = ct(ie, j);
        if (!ne) return;
        const pe = { w: ne.w, h: ne.h, x: ne.x, y: ne.y, i: j };
        ((nt.current = pt(ne)), (Xe.current = ie), ve(pe), M(ie, ne, ne, null, te.e, te.node));
      },
      [M]
    ),
    $e = u.useCallback(
      (j, q, $, te) => {
        const ie = W.current,
          ne = nt.current,
          pe = ct(ie, j);
        if (!pe) return;
        const De = { w: pe.w, h: pe.h, x: pe.x, y: pe.y, i: j },
          me = dt(ie, pe, q, $, !0, be, Ce, S, Y);
        (re(me, ne, pe, De, te.e, te.node), oe(U.compact(me, S)), ve(De));
      },
      [be, Ce, S, Y, U, re]
    ),
    ht = u.useCallback(
      (j, q, $, te) => {
        if (!Oe) return;
        const ie = W.current,
          ne = nt.current,
          pe = ct(ie, j);
        if (!pe) return;
        const De = dt(ie, pe, q, $, !0, be, Ce, S, Y),
          me = U.compact(De, S);
        se(me, ne, pe, null, te.e, te.node);
        const Te = Xe.current;
        ((nt.current = null), (Xe.current = null), ve(null), oe(me), Te && !Qe(Te, me) && O(me));
      },
      [Oe, be, Ce, S, Y, U, se, O]
    ),
    Z = u.useCallback(
      (j, q, $, te) => {
        const ie = W.current,
          ne = ct(ie, j);
        ne &&
          ((at.current = pt(ne)), (Xe.current = ie), mt(!0), ce(ie, ne, ne, null, te.e, te.node));
      },
      [ce]
    ),
    ee = u.useCallback(
      (j, q, $, te) => {
        const ie = W.current,
          ne = at.current,
          { handle: pe } = te;
        let De = !1,
          me,
          Te;
        const [St, Je] = cr(
          ie,
          j,
          (ge) => (
            (me = ge.x),
            (Te = ge.y),
            ['sw', 'w', 'nw', 'n', 'ne'].includes(pe) &&
              (['sw', 'nw', 'w'].includes(pe) &&
                ((me = ge.x + (ge.w - q)),
                (q = ge.x !== me && me < 0 ? ge.w : q),
                (me = me < 0 ? 0 : me)),
              ['ne', 'n', 'nw'].includes(pe) &&
                ((Te = ge.y + (ge.h - $)),
                ($ = ge.y !== Te && Te < 0 ? ge.h : $),
                (Te = Te < 0 ? 0 : Te)),
              (De = !0)),
            be &&
              !Y &&
              la(ie, { ...ge, w: q, h: $, x: me ?? ge.x, y: Te ?? ge.y }).filter(
                (Dt) => Dt.i !== ge.i
              ).length > 0 &&
              ((Te = ge.y), ($ = ge.h), (me = ge.x), (q = ge.w), (De = !1)),
            (ge.w = q),
            (ge.h = $),
            ge
          )
        );
        if (!Je) return;
        let vt = St;
        De && me !== void 0 && Te !== void 0 && (vt = dt(St, Je, me, Te, !0, be, Ce, S, Y));
        const Rt = { w: Je.w, h: Je.h, x: Je.x, y: Je.y, i: j, static: !0 };
        (he(vt, ne, Je, Rt, te.e, te.node), oe(U.compact(vt, S)), ve(Rt));
      },
      [be, Ce, S, Y, U, he]
    ),
    ue = u.useCallback(
      (j, q, $, te) => {
        const ie = W.current,
          ne = at.current,
          pe = ct(ie, j),
          De = U.compact(ie, S);
        m(De, ne, pe ?? null, null, te.e, te.node);
        const me = Xe.current;
        ((at.current = null),
          (Xe.current = null),
          ve(null),
          mt(!1),
          oe(De),
          me && !Qe(me, De) && O(De));
      },
      [S, U, m, O]
    ),
    ae = u.useCallback(() => {
      const j = W.current;
      if (!j.some((te) => te.i === we.i)) {
        (tt(null), ve(null), _e(void 0));
        return;
      }
      const $ = U.compact(
        j.filter((te) => te.i !== we.i),
        S
      );
      (oe($), tt(null), ve(null), _e(void 0));
    }, [we.i, S, U]),
    ye = u.useCallback(
      (j) => {
        var Pn;
        if (
          (j.preventDefault(),
          j.stopPropagation(),
          La && !((Pn = j.nativeEvent.target) != null && Pn.classList.contains(Qn)))
        )
          return !1;
        const q = fe ? fe(j.nativeEvent) : y(j);
        if (q === !1) return (We && ae(), !1);
        const { dragOffsetX: $ = 0, dragOffsetY: te = 0, ...ie } = q ?? {},
          ne = { ...we, ...ie },
          pe = j.currentTarget.getBoundingClientRect(),
          De = {
            cols: S,
            margin: X,
            maxRows: G,
            rowHeight: _,
            containerWidth: a,
            containerPadding: xe
          },
          me = ft(De),
          Te = Ge(ne.w, me, X[0]),
          St = Ge(ne.h, _, X[1]),
          Je = Te / 2,
          vt = St / 2,
          Rt = j.clientX - pe.left + $ - Je,
          ge = j.clientY - pe.top + te - vt,
          Gt = Math.max(0, Rt),
          Dt = Math.max(0, ge),
          Et = { left: Gt / Ee, top: Dt / Ee, e: j.nativeEvent };
        if (We) Ye && (Ye.left !== Et.left || Ye.top !== Et.top) && _e(Et);
        else {
          const Ut = sr(De, Dt, Gt, ne.w, ne.h);
          (tt(n.jsx('div', {}, ne.i)), _e(Et));
          const _a = W.current.filter((Ia) => Ia.i !== ne.i);
          oe([..._a, { ...ne, x: Ut.x, y: Ut.y, static: !1, isDraggable: !0 }]);
        }
      },
      [We, Ye, we, fe, y, ae, Ee, S, X, G, _, a, xe]
    ),
    je = u.useCallback(
      (j) => {
        (j.preventDefault(),
          j.stopPropagation(),
          Ie.current--,
          Ie.current < 0 && (Ie.current = 0),
          Ie.current === 0 && ae());
      },
      [ae]
    ),
    Se = u.useCallback((j) => {
      (j.preventDefault(), j.stopPropagation(), Ie.current++);
    }, []),
    Ne = u.useCallback(
      (j) => {
        (j.preventDefault(), j.stopPropagation());
        const q = W.current,
          $ = q.find((te) => te.i === we.i);
        ((Ie.current = 0), ae(), N(q, $, j.nativeEvent));
      },
      [we.i, ae, N]
    ),
    Pe = u.useCallback(
      (j, q) => {
        if (!j || !j.key) return null;
        const $ = ct(de, String(j.key));
        if (!$) return null;
        const te = typeof $.isDraggable == 'boolean' ? $.isDraggable : !$.static && o,
          ie = typeof $.isResizable == 'boolean' ? $.isResizable : !$.static && ke,
          ne = $.resizeHandles || [...Re],
          pe = te && k && $.isBounded !== !1,
          De = z;
        return n.jsx(
          Zn,
          {
            containerWidth: a,
            cols: S,
            margin: X,
            containerPadding: xe,
            maxRows: G,
            rowHeight: _,
            cancel: K,
            handle: x,
            onDragStart: Ae,
            onDrag: $e,
            onDragStop: ht,
            onResizeStart: Z,
            onResize: ee,
            onResizeStop: ue,
            isDraggable: te,
            isResizable: ie,
            isBounded: pe,
            useCSSTransforms: Be && Fe,
            usePercentages: !Fe,
            transformScale: Ee,
            positionStrategy: i,
            dragThreshold: J,
            w: $.w,
            h: $.h,
            x: $.x,
            y: $.y,
            i: $.i,
            minH: $.minH,
            minW: $.minW,
            maxH: $.maxH,
            maxW: $.maxW,
            static: $.static,
            droppingPosition: q ? Ye : void 0,
            resizeHandles: ne,
            resizeHandle: De,
            constraints: h,
            layoutItem: $,
            layout: de,
            children: j
          },
          $.i
        );
      },
      [de, a, S, X, xe, G, _, K, x, Ae, $e, ht, Z, ee, ue, o, ke, k, Be, Fe, Ee, i, J, Ye, Re, z, h]
    ),
    Le = () =>
      Oe
        ? n.jsx(Zn, {
            w: Oe.w,
            h: Oe.h,
            x: Oe.x,
            y: Oe.y,
            i: Oe.i,
            className: `react-grid-placeholder ${Me ? 'placeholder-resizing' : ''}`,
            containerWidth: a,
            cols: S,
            margin: X,
            containerPadding: xe,
            maxRows: G,
            rowHeight: _,
            isDraggable: !1,
            isResizable: !1,
            isBounded: !1,
            useCSSTransforms: Be,
            transformScale: Ee,
            constraints: h,
            layout: de,
            children: n.jsx('div', {})
          })
        : null,
    Ve = yn(Qn, T),
    H = { height: P, ...b };
  return n.jsxs('div', {
    ref: F,
    className: Ve,
    style: H,
    onDrop: Q ? Ne : void 0,
    onDragLeave: Q ? je : void 0,
    onDragEnter: Q ? Se : void 0,
    onDragOver: Q ? ye : void 0,
    children: [
      Ke.Children.map(t, (j) => (Ke.isValidElement(j) ? Pe(j) : null)),
      Q && We && Pe(We, !0),
      Le()
    ]
  });
}
var Qs = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  eo = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  dn = () => {};
function to(e, t, a, s) {
  const r = [];
  Ke.Children.forEach(t, (c) => {
    if (!Ke.isValidElement(c) || c.key === null) return;
    const i = String(c.key),
      f = e.find((h) => h.i === i);
    if (f) r.push({ ...f, i });
    else {
      const d = c.props['data-grid'];
      d
        ? r.push({
            i,
            x: d.x ?? 0,
            y: d.y ?? 0,
            w: d.w ?? 1,
            h: d.h ?? 1,
            minW: d.minW,
            maxW: d.maxW,
            minH: d.minH,
            maxH: d.maxH,
            static: d.static,
            isDraggable: d.isDraggable,
            isResizable: d.isResizable,
            resizeHandles: d.resizeHandles,
            isBounded: d.isBounded
          })
        : r.push({ i, x: 0, y: Wt(r), w: 1, h: 1 });
    }
  });
  const l = vn(r, { cols: a });
  return s.compact(l, a);
}
function no(e) {
  const {
      children: t,
      width: a,
      breakpoint: s,
      breakpoints: r = Qs,
      cols: l = eo,
      layouts: c = {},
      rowHeight: i = 150,
      maxRows: f = 1 / 0,
      margin: h = [10, 10],
      containerPadding: d = null,
      compactor: g,
      onBreakpointChange: R = dn,
      onLayoutChange: T = dn,
      onWidthChange: b = dn,
      ...F
    } = e,
    O = g ?? Rn('vertical'),
    M = O.type,
    re = O.allowOverlap,
    se = u.useMemo(() => s ?? _n(r, a), []),
    ce = u.useMemo(() => In(se, l), [se, l]),
    he = u.useMemo(() => en(c, r, se, se, ce, M), []),
    [m, N] = u.useState(se),
    [y, C] = u.useState(ce),
    [w, v] = u.useState(he),
    [D, S] = u.useState(c),
    _ = u.useRef(a),
    G = u.useRef(s),
    X = u.useRef(r),
    le = u.useRef(l),
    o = u.useRef(c),
    k = u.useRef(M),
    x = u.useRef(D);
  u.useEffect(() => {
    x.current = D;
  }, [D]);
  const K = u.useMemo(() => (Qe(c, o.current) ? null : en(c, r, m, m, y, O)), [c, r, m, y, O]),
    J = K ?? w;
  (u.useEffect(() => {
    K !== null && (v(K), S(c), (x.current = c), (o.current = c));
  }, [K, c]),
    u.useEffect(() => {
      if (M !== k.current) {
        const L = O.compact(ot(J), y),
          fe = { ...x.current, [m]: L };
        (v(L), S(fe), (x.current = fe), T(L, fe), (k.current = M));
      }
    }, [M, O, J, y, re, m, T]),
    u.useEffect(() => {
      const L = a !== _.current,
        fe = s !== G.current,
        U = !Qe(r, X.current),
        Ce = !Qe(l, le.current);
      if (L || fe || U || Ce) {
        const Y = s ?? _n(r, a),
          be = In(Y, l),
          we = m;
        if (we !== Y || U || Ce) {
          const xe = { ...x.current };
          xe[we] || (xe[we] = ot(w));
          let Fe = en(xe, r, Y, we, be, O);
          ((Fe = to(Fe, t, be, O)),
            (xe[Y] = Fe),
            N(Y),
            C(be),
            v(Fe),
            S(xe),
            (x.current = xe),
            R(Y, be),
            T(Fe, xe));
        }
        const Be = Lt(h, Y),
          Ee = d ? Lt(d, Y) : null;
        (b(a, Be, be, Ee), (_.current = a), (G.current = s), (X.current = r), (le.current = l));
      }
    }, [a, s, r, l, m, y, w, t, O, M, re, h, d, R, T, b]));
  const ke = u.useCallback(
      (L) => {
        const U = { ...x.current, [m]: L };
        (v(L), S(U), (x.current = U), T(L, U));
      },
      [m, T]
    ),
    Re = u.useMemo(() => Lt(h, m), [h, m]),
    z = u.useMemo(() => (d === null ? null : Lt(d, m)), [d, m]),
    Q = u.useMemo(
      () => ({ cols: y, rowHeight: i, maxRows: f, margin: Re, containerPadding: z }),
      [y, i, f, Re, z]
    );
  return n.jsx(Zs, {
    ...F,
    width: a,
    gridConfig: Q,
    compactor: O,
    onLayoutChange: ke,
    layout: J,
    children: t
  });
}
const ao = [
  { v: '=', l: '=' },
  { v: '!=', l: '≠' },
  { v: '<', l: '<' },
  { v: '<=', l: '≤' },
  { v: '>', l: '>' },
  { v: '>=', l: '≥' },
  { v: 'contains', l: 'contiene' }
];
let ro = Date.now() + 1;
function st() {
  return `page_${ro++}`;
}
const so = {
  critico: { label: 'Crítico', color: '#dc2626', bg: '#fee2e2' },
  enRiesgo: { label: 'En riesgo', color: '#f59e0b', bg: '#fef3c7' },
  mejorando: { label: 'Mejorando', color: '#2563eb', bg: '#dbeafe' },
  ok: { label: 'OK', color: '#16a34a', bg: '#dcfce7' }
};
function oo(e, t, a) {
  if (e == null || isNaN(Number(e))) return null;
  const s = Number(e),
    r = a.higherIsBetter !== !1,
    l = a.okThreshold ?? (r ? 85 : 1),
    c = a.critThreshold ?? (r ? 50 : 5);
  if (r ? s >= l : s <= l) return 'ok';
  const f = t == null || isNaN(Number(t)) ? null : Number(t);
  return f != null && (r ? s > f : s < f)
    ? 'mejorando'
    : (r ? s < c : s > c)
      ? 'critico'
      : 'enRiesgo';
}
const ta = { operador: 1, supervisor: 2, admin: 3 };
function hn(e, t) {
  return (ta[e] || 1) >= (ta[t] || 2);
}
const kt = [
    { key: 'none', label: '(Sin datos — decorativo)', type: 'single', fields: [] },
    {
      key: 'operaciones',
      label: 'Operaciones (NVs) — fila + campos calculados',
      type: 'array',
      fields: [
        { key: 'nv', label: 'N° NV', type: 'string' },
        { key: 'estado', label: 'Estado', type: 'string' },
        { key: 'cliente', label: 'Cliente', type: 'string' },
        { key: 'vendedor', label: 'Vendedor', type: 'string' },
        { key: 'transportista', label: 'Transportista', type: 'string' },
        { key: 'fecha_compromiso', label: 'F. Compromiso', type: 'string' },
        { key: 'fecha_aprobacion', label: 'Fecha Creación N.V', type: 'string' },
        { key: 'fecha_despacho', label: 'F. Despacho', type: 'string' },
        { key: 'fecha_entregado', label: 'F. Entregado', type: 'string' }
      ]
    },
    {
      key: 'kpis',
      label: 'KPIs principales',
      type: 'single',
      fields: [
        { key: 'activas', label: 'NVs Activas', type: 'number' },
        { key: 'entregadas', label: 'Entregadas', type: 'number' },
        { key: 'total', label: 'Total NVs', type: 'number' },
        { key: 'countNvPtm', label: 'NVs PTM', type: 'number' },
        { key: 'nvOrange', label: 'NVs Orange', type: 'number' },
        { key: 'nvFarmapack', label: 'NVs Farmapack', type: 'number' },
        { key: 'nvVarios', label: 'NVs Varios', type: 'number' },
        { key: 'incidencias', label: 'Incidencias', type: 'number' },
        { key: 'tasaEntrega', label: 'Tasa Entrega', type: 'percent' },
        { key: 'pctAtiempo', label: '% A Tiempo', type: 'percent' },
        { key: 'leadTimeTardanza', label: 'Tardanza Promedio', type: 'number' }
      ]
    },
    {
      key: 'fillRate',
      label: 'Fill Rate Shipping',
      type: 'single',
      fields: [
        { key: 'pct', label: 'Porcentaje', type: 'percent' },
        { key: 'cumple', label: 'Cumple', type: 'number' },
        { key: 'noCumple', label: 'No Cumple', type: 'number' },
        { key: 'evaluables', label: 'Evaluables', type: 'number' }
      ]
    },
    {
      key: 'otif',
      label: 'OTIF',
      type: 'single',
      fields: [
        { key: 'pct', label: 'Porcentaje', type: 'percent' },
        { key: 'cumple', label: 'Cumple', type: 'number' },
        { key: 'total', label: 'Total', type: 'number' }
      ]
    },
    {
      key: 'cumplimientoNV',
      label: 'Cumplimiento NV Semanal',
      type: 'single',
      fields: [
        { key: 'pct', label: 'Porcentaje', type: 'percent' },
        { key: 'cumple', label: 'Cumple', type: 'number' },
        { key: 'noCumple', label: 'No Cumple', type: 'number' },
        { key: 'totalSemana', label: 'Total Semana', type: 'number' }
      ]
    },
    {
      key: 'estadoTable',
      label: 'Estados por Canal',
      type: 'array',
      fields: [
        { key: 'estado', label: 'Estado', type: 'string' },
        { key: 'ptm', label: 'PTM', type: 'number' },
        { key: 'orange', label: 'Orange', type: 'number' },
        { key: 'farmapack', label: 'Farmapack', type: 'number' },
        { key: 'varios', label: 'Varios', type: 'number' },
        { key: 'total', label: 'Total', type: 'number' }
      ]
    },
    {
      key: 'resumen',
      label: 'Resumen Estados Activos',
      type: 'array',
      fields: [
        { key: 'estado', label: 'Estado', type: 'string' },
        { key: 'count', label: 'Cantidad', type: 'number' }
      ]
    },
    {
      key: 'divisions',
      label: 'Divisiones',
      type: 'array',
      fields: [
        { key: 'division', label: 'Division', type: 'string' },
        { key: 'cantidad', label: 'Cantidad', type: 'number' }
      ]
    },
    {
      key: 'transportistas',
      label: 'Transportistas',
      type: 'array',
      fields: [
        { key: 'transportista', label: 'Transportista', type: 'string' },
        { key: 'cantidad', label: 'Cantidad', type: 'number' }
      ]
    },
    {
      key: 'weeklyTrend',
      label: 'Tendencia Semanal',
      type: 'array',
      fields: [
        { key: 'semana', label: 'Semana', type: 'string' },
        { key: 'aprobadas', label: 'Aprobadas', type: 'number' },
        { key: 'entregadas', label: 'Entregadas', type: 'number' },
        { key: 'tardanza', label: 'Tardanza', type: 'number' },
        { key: 'fillRate', label: 'Fill Rate', type: 'percent' }
      ]
    },
    {
      key: 'leadTimeSemanal',
      label: 'Lead Time Semanal',
      type: 'array',
      fields: [
        { key: 'semana', label: 'Semana', type: 'string' },
        { key: 'dias', label: 'Dias', type: 'number' },
        { key: 'count', label: 'Cantidad', type: 'number' },
        { key: 'pctAtiempo', label: '% A Tiempo', type: 'percent' }
      ]
    },
    {
      key: 'tiemposCiclo',
      label: 'Tiempos de Ciclo',
      type: 'array',
      fields: [
        { key: 'nombre', label: 'Etapa', type: 'string' },
        { key: 'dias', label: 'Dias', type: 'number' },
        { key: 'n', label: 'Muestra', type: 'number' }
      ]
    },
    {
      key: 'rankingTransportistas',
      label: 'Ranking Transportistas',
      type: 'array',
      fields: [
        { key: 'nombre', label: 'Transportista', type: 'string' },
        { key: 'total', label: 'Total', type: 'number' },
        { key: 'entregadas', label: 'Entregadas', type: 'number' },
        { key: 'pctATiempo', label: '% A Tiempo', type: 'percent' },
        { key: 'tardanzaProm', label: 'Tardanza', type: 'number' }
      ]
    },
    {
      key: 'rankingVendedores',
      label: 'Ranking Vendedores',
      type: 'array',
      fields: [
        { key: 'nombre', label: 'Vendedor', type: 'string' },
        { key: 'total', label: 'Total', type: 'number' },
        { key: 'entregadas', label: 'Entregadas', type: 'number' },
        { key: 'activas', label: 'Activas', type: 'number' },
        { key: 'pctATiempo', label: '% A Tiempo', type: 'percent' }
      ]
    },
    {
      key: 'alertasOperacionales',
      label: 'Alertas Operacionales',
      type: 'array',
      fields: [
        { key: 'estado', label: 'Estado', type: 'string' },
        { key: 'cantidad', label: 'Cantidad', type: 'number' }
      ]
    },
    {
      key: 'auditKpis',
      label: 'KPIs por Operador',
      type: 'array',
      fields: [
        { key: 'nombre', label: 'Operador', type: 'string' },
        { key: 'creates', label: 'Creadas', type: 'number' },
        { key: 'updates', label: 'Actualizadas', type: 'number' },
        { key: 'bulkUpdates', label: 'Lote', type: 'number' },
        { key: 'conflicts', label: 'Conflictos', type: 'number' },
        { key: 'total', label: 'Total', type: 'number' }
      ]
    },
    {
      key: 'tendencia',
      label: 'Tendencia Historica',
      type: 'array',
      fields: [
        { key: 'label', label: 'Mes', type: 'string' },
        { key: 'entregadas', label: 'Entregadas', type: 'number' },
        { key: 'pctATiempo', label: '% A Tiempo', type: 'percent' },
        { key: 'otif', label: 'OTIF', type: 'percent' },
        { key: 'leadTime', label: 'Lead Time', type: 'number' },
        { key: 'activas', label: 'Activas', type: 'number' }
      ]
    },
    {
      key: 'cumplimientoDetalle',
      label: 'Cumplimiento Desglose (Cumple / No Cumple)',
      type: 'array',
      fields: [
        { key: 'label', label: 'Resultado', type: 'string' },
        { key: 'valor', label: 'Cantidad', type: 'number' }
      ]
    },
    {
      key: 'riesgoCompromiso',
      label: 'NV en Riesgo por Plazo de Compromiso',
      type: 'array',
      fields: [
        { key: 'rango', label: 'Rango', type: 'string' },
        { key: 'cantidad', label: 'Cantidad', type: 'number' }
      ]
    },
    {
      key: 'funnelEstados',
      label: 'Funnel del Flujo',
      type: 'array',
      fields: [
        { key: 'etapa', label: 'Etapa', type: 'string' },
        { key: 'cantidad', label: 'Cantidad', type: 'number' }
      ]
    },
    {
      key: 'heatmapData',
      label: 'Heatmap Estado x Transportista',
      type: 'array',
      fields: [
        { key: 'estado', label: 'Estado', type: 'string' },
        { key: 'transportista', label: 'Transportista', type: 'string' },
        { key: 'cantidad', label: 'Cantidad', type: 'number' }
      ]
    }
  ],
  zn = [
    {
      type: 'kpi',
      label: 'Tarjeta KPI',
      icon: '#',
      description: 'Muestra un valor unico grande',
      minW: 2,
      minH: 2,
      defaultW: 3,
      defaultH: 2
    },
    {
      type: 'semaforo',
      label: 'Semáforo',
      icon: '◆',
      description: 'Valor con color e indicador: Crítico / En riesgo / Mejorando / OK',
      minW: 2,
      minH: 2,
      defaultW: 3,
      defaultH: 3
    },
    {
      type: 'bar-chart',
      label: 'Grafico Barras',
      icon: '|',
      description: 'Barras verticales con multiples series',
      minW: 4,
      minH: 4,
      defaultW: 6,
      defaultH: 5
    },
    {
      type: 'line-chart',
      label: 'Grafico Lineas',
      icon: '~',
      description: 'Lineas de tendencia temporal',
      minW: 4,
      minH: 4,
      defaultW: 6,
      defaultH: 5
    },
    {
      type: 'pie-chart',
      label: 'Grafico Torta',
      icon: 'O',
      description: 'Distribucion proporcional',
      minW: 3,
      minH: 4,
      defaultW: 4,
      defaultH: 5
    },
    {
      type: 'donut-chart',
      label: 'Grafico Dona',
      icon: 'D',
      description: 'Torta con hueco central',
      minW: 3,
      minH: 4,
      defaultW: 4,
      defaultH: 5
    },
    {
      type: 'table',
      label: 'Tabla',
      icon: 'T',
      description: 'Tabla con columnas configurables',
      minW: 4,
      minH: 3,
      defaultW: 6,
      defaultH: 5
    },
    {
      type: 'horizontal-bars',
      label: 'Barras Horizontales',
      icon: '=',
      description: 'Barras horizontales comparativas',
      minW: 4,
      minH: 3,
      defaultW: 6,
      defaultH: 4
    },
    {
      type: 'stat-list',
      label: 'Lista de Stats',
      icon: 'L',
      description: 'Lista vertical de etiqueta + valor',
      minW: 3,
      minH: 3,
      defaultW: 4,
      defaultH: 4
    },
    {
      type: 'gauge',
      label: 'Gauge / Medidor',
      icon: 'G',
      description: 'Medidor semicircular para % (OTIF, etc.)',
      minW: 3,
      minH: 3,
      defaultW: 4,
      defaultH: 4
    },
    {
      type: 'heatmap',
      label: 'Heatmap',
      icon: 'H',
      description: 'Matriz de calor (estado vs transportista)',
      minW: 5,
      minH: 4,
      defaultW: 8,
      defaultH: 6
    },
    {
      type: 'funnel',
      label: 'Funnel / Embudo',
      icon: 'V',
      description: 'Embudo de etapas del flujo',
      minW: 3,
      minH: 4,
      defaultW: 5,
      defaultH: 5
    },
    {
      type: 'timeline',
      label: 'Timeline',
      icon: 'I',
      description: 'Línea de tiempo por período',
      minW: 3,
      minH: 4,
      defaultW: 5,
      defaultH: 5
    },
    {
      type: 'area-chart',
      label: 'Gráfico Área',
      icon: '▲',
      description: 'Área rellena de tendencia',
      minW: 4,
      minH: 4,
      defaultW: 6,
      defaultH: 5
    },
    {
      type: 'scorecard',
      label: 'Scorecard',
      icon: 'S',
      description: 'Número grande con comparación vs período anterior',
      minW: 2,
      minH: 2,
      defaultW: 3,
      defaultH: 3
    },
    {
      type: 'text',
      label: 'Texto Libre',
      icon: 'A',
      description: 'Bloque de texto, título o nota',
      minW: 2,
      minH: 1,
      defaultW: 4,
      defaultH: 2
    },
    {
      type: 'divider',
      label: 'Separador',
      icon: '—',
      description: 'Línea divisoria visual',
      minW: 2,
      minH: 1,
      defaultW: 12,
      defaultH: 1
    },
    {
      type: 'image',
      label: 'Imagen / Logo',
      icon: '🖼',
      description: 'Imagen desde URL',
      minW: 2,
      minH: 2,
      defaultW: 3,
      defaultH: 3
    }
  ],
  na = [
    '#f57c00',
    '#1565c0',
    '#2e7d32',
    '#c62828',
    '#6a1b9a',
    '#00838f',
    '#ef6c00',
    '#283593',
    '#558b2f',
    '#ad1457'
  ];
function gn(e) {
  return na[e % na.length];
}
let io = Date.now();
function He() {
  return `w_${io++}`;
}
function lo(e, t = []) {
  const a = kt.find((r) => r.key === e),
    s = a ? [...a.fields] : [];
  if (e === 'operaciones' && t.length) {
    const r = t.map((l) => ({
      key: l.nombre,
      label: `ƒ ${l.nombre}`,
      type: l.tipo === 'numero' ? 'number' : (l.tipo === 'fecha', 'string')
    }));
    return [...s, ...r];
  }
  return s;
}
function aa(e, t) {
  if (e == null) return t === '' || t.toLowerCase() === 'null';
  const a = Number(e),
    s = Number(t);
  return !isNaN(a) && !isNaN(s) && String(e).trim() !== '' && t.trim() !== ''
    ? a === s
    : String(e).toLowerCase() === t.toLowerCase();
}
function co(e, t, a) {
  const s = Number(e),
    r = Number(a),
    l = !isNaN(s) && !isNaN(r) && String(e).trim() !== '' && a.trim() !== '';
  switch (t) {
    case '=':
      return aa(e, a);
    case '!=':
      return !aa(e, a);
    case '<':
      return l && s < r;
    case '<=':
      return l && s <= r;
    case '>':
      return l && s > r;
    case '>=':
      return l && s >= r;
    case 'contains':
      return String(e ?? '')
        .toLowerCase()
        .includes(a.toLowerCase());
    default:
      return !0;
  }
}
function uo(e, t) {
  if (!Array.isArray(e) || !t || t.length === 0) return e;
  const a = t.filter((s) => s.field);
  return a.length === 0 ? e : e.filter((s) => a.every((r) => co(s[r.field], r.op, r.value)));
}
function fo(e, t) {
  var a, s, r, l, c;
  if (e === 'none') return {};
  if (e === 'operaciones') return t.operaciones || [];
  if (e === 'kpis') return t.kpis;
  if (e === 'fillRate') return (a = t.kpis) == null ? void 0 : a.fillRateShipping;
  if (e === 'otif') return t.otif;
  if (e === 'cumplimientoNV') return (s = t.kpis) == null ? void 0 : s.cumplimientoNV;
  if (e === 'tiemposCiclo') return (r = t.tiemposCiclo) == null ? void 0 : r.etapas;
  if (e === 'auditKpis') return t.auditKpis;
  if (e === 'tendencia') return t.tendencia;
  if (e === 'funnelEstados') return t.funnelEstados;
  if (e === 'heatmapData') return t.heatmapData;
  if (e === 'cumplimientoDetalle') {
    const i = (l = t.kpis) == null ? void 0 : l.cumplimientoNV;
    return i
      ? [
          { label: 'Cumple', valor: i.cumple || 0 },
          { label: 'No Cumple', valor: i.noCumple || 0 }
        ]
      : [];
  }
  if (e === 'riesgoCompromiso') {
    const i = ((c = t.alertas) == null ? void 0 : c.detalle) || [],
      f = { 'Vencida >5d': 0, 'Vencida 1-5d': 0, 'Vence hoy': 0, 'Vence mañana': 0 };
    return (
      i.forEach((h) => {
        h.diasVencido > 5
          ? f['Vencida >5d']++
          : h.diasVencido >= 1
            ? f['Vencida 1-5d']++
            : h.diasVencido === 0
              ? f['Vence hoy']++
              : f['Vence mañana']++;
      }),
      Object.entries(f)
        .filter(([, h]) => h > 0)
        .map(([h, d]) => ({ rango: h, cantidad: d }))
    );
  }
  return t[e];
}
async function Aa() {
  const { data: e, error: t } = await bt
    .from('tms_dashboard_layouts')
    .select('id, name, owner, min_role_edit, config')
    .order('updated_at', { ascending: !1 });
  return t || !e
    ? []
    : e.map((a) => ({
        id: a.id,
        name: a.name,
        owner: a.owner,
        minRoleEdit: a.min_role_edit || 'supervisor',
        config: a.config || { widgets: [], gridLayout: [] }
      }));
}
async function At(e) {
  const { error: t } = await bt.rpc('guardar_dashboard', {
    p: { id: e.id, name: e.name, owner: e.owner, min_role_edit: e.minRoleEdit, config: e.config }
  });
  return t ? (console.error('saveDashboard:', t.message), !1) : !0;
}
async function po(e) {
  const { error: t } = await bt.rpc('eliminar_dashboard', { p_id: e });
  return t ? (console.error('deleteDashboard:', t.message), !1) : !0;
}
async function xn(e = !1) {
  let t = bt
    .from('tms_builder_calculated_fields')
    .select('id, nombre, formula, tipo, descripcion, activo, created_by')
    .order('nombre', { ascending: !0 });
  e || (t = t.eq('activo', !0));
  const { data: a, error: s } = await t;
  return s || !a ? [] : a;
}
async function mo(e) {
  const t = (e.nombre || '').trim();
  if (!t) return { ok: !1, error: 'El nombre es obligatorio' };
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t))
    return {
      ok: !1,
      error:
        'El nombre solo acepta letras, números y _ (sin espacios), y no puede empezar con número'
    };
  if (!(e.formula || '').trim()) return { ok: !1, error: 'La fórmula es obligatoria' };
  const { error: a } = await bt.rpc('guardar_campo_calculado', {
    p: {
      id: e.id ?? null,
      nombre: t,
      formula: e.formula.trim(),
      tipo: e.tipo || 'texto',
      descripcion: e.descripcion ?? null,
      activo: e.activo ?? !0,
      created_by: e.created_by ?? null
    }
  });
  return a
    ? {
        ok: !1,
        error: /duplicate|unique/i.test(a.message || '') ? `Ya existe un campo "${t}"` : a.message
      }
    : { ok: !0 };
}
async function ho(e) {
  const { error: t } = await bt.rpc('eliminar_campo_calculado', { p_id: e });
  return t ? (console.error('deleteCalculatedField:', t.message), !1) : !0;
}
function go(e) {
  const t = e.replace('#', '');
  return {
    r: parseInt(t.slice(0, 2), 16) || 0,
    g: parseInt(t.slice(2, 4), 16) || 0,
    b: parseInt(t.slice(4, 6), 16) || 0
  };
}
function xo(e) {
  const t = String(e).toUpperCase();
  return ['CRITICA', 'FAIL', 'TRUE', 'RIESGO', 'RISK'].includes(t)
    ? { bg: '#fef2f2', fg: '#b91c1c', dot: '#ef4444' }
    : ['ALTA', 'PEND', 'MEDIA'].includes(t)
      ? { bg: '#fffbeb', fg: '#b45309', dot: '#f59e0b' }
      : ['OK', 'NORMAL', 'FALSE', 'FINALIZADA'].includes(t)
        ? { bg: '#f0fdf4', fg: '#15803d', dot: '#22c55e' }
        : { bg: '#f3f4f6', fg: '#374151', dot: '#9ca3af' };
}
const ra = [
  '#f57c00',
  '#1565c0',
  '#2e7d32',
  '#c62828',
  '#6a1b9a',
  '#00838f',
  '#ef6c00',
  '#283593',
  '#558b2f',
  '#ad1457'
];
function yo({ widget: e, data: t, editMode: a, onEdit: s, onRemove: r }) {
  var T;
  let l = fo(e.dataSource, t);
  Array.isArray(l) && (T = e.config.filters) != null && T.length && (l = uo(l, e.config.filters));
  const c = () => {
      var b, F, O, M, re, se, ce, he;
      if (!l)
        return n.jsx('div', {
          className: 'flex items-center justify-center h-full text-gray-300 text-sm',
          children: 'Sin datos'
        });
      switch (e.type) {
        case 'kpi': {
          const m = e.config;
          let N;
          if (Array.isArray(l)) {
            const C = m.agg || 'count';
            if (C === 'count')
              if (m.whereField) {
                const w = String(m.whereValue ?? '').toLowerCase();
                N = l.filter(
                  (v) => String((v == null ? void 0 : v[m.whereField]) ?? '').toLowerCase() === w
                ).length;
              } else N = l.length;
            else {
              const w = l
                .map((v) => Number(v == null ? void 0 : v[m.valueField || '']))
                .filter((v) => !isNaN(v));
              C === 'sum'
                ? (N = w.reduce((v, D) => v + D, 0))
                : (N = w.length
                    ? Math.round((w.reduce((v, D) => v + D, 0) / w.length) * 10) / 10
                    : 0);
            }
          } else N = m.valueField ? l[m.valueField] : l;
          const y =
            N == null
              ? '—'
              : e.config.format === 'percent'
                ? `${N}%`
                : e.config.format === 'days'
                  ? `${N} d`
                  : typeof N == 'number'
                    ? N.toLocaleString('es-CL')
                    : String(N);
          return n.jsxs('div', {
            className: 'flex flex-col items-center justify-center h-full gap-1',
            children: [
              e.config.icon && n.jsx('span', { className: 'text-2xl', children: e.config.icon }),
              n.jsx('span', {
                className: 'text-3xl font-bold',
                style: { color: e.config.color || '#f57c00' },
                children: y
              }),
              e.config.subtitle &&
                n.jsx('span', {
                  className: 'text-[11px] text-gray-400 text-center',
                  children: e.config.subtitle
                })
            ]
          });
        }
        case 'semaforo': {
          const m = e.config,
            N = m.valueField ? l[m.valueField] : l,
            y = N == null || N === '' ? null : Number(N);
          let C = null;
          if (m.trendField && Array.isArray(t == null ? void 0 : t.tendencia)) {
            const _ = t.tendencia
              .map((G) => G[m.trendField])
              .filter((G) => G != null && !isNaN(Number(G)))
              .map((G) => Number(G));
            _.length >= 2 && (C = _[_.length - 2]);
          }
          const w = oo(y, C, {
              higherIsBetter: m.higherIsBetter,
              okThreshold: m.okThreshold,
              critThreshold: m.critThreshold
            }),
            v = w ? so[w] : null,
            D =
              y == null
                ? '—'
                : m.format === 'percent'
                  ? `${y}%`
                  : m.format === 'days'
                    ? `${y} d`
                    : y.toLocaleString('es-CL'),
            S = C == null || y == null ? '' : y > C ? '▲' : y < C ? '▼' : '▬';
          return n.jsxs('div', {
            className: 'flex flex-col items-center justify-center h-full gap-1 rounded-lg',
            style: { background: (v == null ? void 0 : v.bg) || '#f3f4f6' },
            children: [
              n.jsx('span', {
                className: 'text-4xl font-extrabold',
                style: { color: (v == null ? void 0 : v.color) || '#9ca3af' },
                children: D
              }),
              v &&
                n.jsx('span', {
                  className:
                    'text-[12px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white',
                  style: { background: v.color },
                  children: v.label
                }),
              m.trendField &&
                C != null &&
                n.jsxs('span', {
                  className: 'text-[11px] font-medium',
                  style: { color: (v == null ? void 0 : v.color) || '#6b7280' },
                  children: [S, ' vs período anterior (', m.format === 'percent' ? `${C}%` : C, ')']
                }),
              m.subtitle &&
                n.jsx('span', {
                  className: 'text-[11px] text-gray-500 text-center',
                  children: m.subtitle
                })
            ]
          });
        }
        case 'bar-chart': {
          const m = Array.isArray(l) ? l : [],
            N = e.config.yFields || [],
            y = e.config.xField || 'label';
          return n.jsx(Ft, {
            width: '100%',
            height: '100%',
            children: n.jsxs(Za, {
              data: m.slice(0, e.config.maxItems || 50),
              margin: { top: 5, right: 10, left: 0, bottom: 5 },
              children: [
                n.jsx(Kt, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
                n.jsx(Jt, { dataKey: y, tick: { fontSize: 10 } }),
                n.jsx(Zt, { tick: { fontSize: 10 } }),
                n.jsx(Ot, { contentStyle: { fontSize: 12 } }),
                e.config.showLegend !== !1 && n.jsx(Qt, { wrapperStyle: { fontSize: 11 } }),
                N.map((C) =>
                  n.jsx(
                    Qa,
                    { dataKey: C.key, name: C.label, fill: C.color, radius: [4, 4, 0, 0] },
                    C.key
                  )
                )
              ]
            })
          });
        }
        case 'line-chart': {
          const m = Array.isArray(l) ? l : [],
            N = e.config.yFields || [],
            y = e.config.xField || 'label';
          return n.jsx(Ft, {
            width: '100%',
            height: '100%',
            children: n.jsxs(Ka, {
              data: m.slice(0, e.config.maxItems || 50),
              margin: { top: 5, right: 10, left: 0, bottom: 5 },
              children: [
                n.jsx(Kt, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
                n.jsx(Jt, { dataKey: y, tick: { fontSize: 10 } }),
                n.jsx(Zt, { tick: { fontSize: 10 } }),
                n.jsx(Ot, { contentStyle: { fontSize: 12 } }),
                e.config.showLegend !== !1 && n.jsx(Qt, { wrapperStyle: { fontSize: 11 } }),
                N.map((C) =>
                  n.jsx(
                    Ja,
                    {
                      type: 'monotone',
                      dataKey: C.key,
                      name: C.label,
                      stroke: C.color,
                      strokeWidth: 2,
                      dot: { r: 3 }
                    },
                    C.key
                  )
                )
              ]
            })
          });
        }
        case 'pie-chart':
        case 'donut-chart': {
          const m = Array.isArray(l) ? l : [],
            N = e.config.labelField || e.config.xField || 'label',
            y =
              e.config.valueField ||
              ((F = (b = e.config.yFields) == null ? void 0 : b[0]) == null ? void 0 : F.key) ||
              'total',
            C = m.slice(0, e.config.maxItems || 10);
          return n.jsx(Ft, {
            width: '100%',
            height: '100%',
            children: n.jsxs(Xa, {
              children: [
                n.jsx(Ga, {
                  data: C,
                  dataKey: y,
                  nameKey: N,
                  cx: '50%',
                  cy: '50%',
                  innerRadius: e.type === 'donut-chart' ? '40%' : 0,
                  outerRadius: '75%',
                  label: ({ name: w, percent: v }) => `${w} ${(v * 100).toFixed(0)}%`,
                  labelLine: { strokeWidth: 1 },
                  children: C.map((w, v) => n.jsx(Ua, { fill: ra[v % ra.length] }, v))
                }),
                n.jsx(Ot, { contentStyle: { fontSize: 12 } })
              ]
            })
          });
        }
        case 'table': {
          const m = Array.isArray(l) ? l : [],
            N = e.config.columns || [],
            y = m.slice(0, e.config.maxItems || 20),
            C = new Set(
              ((t == null ? void 0 : t._calcFields) || [])
                .filter((w) => w.tipo === 'badge')
                .map((w) => w.nombre)
            );
          return n.jsx('div', {
            className: 'overflow-auto h-full',
            children: n.jsxs('table', {
              className: 'w-full text-[12px] border-collapse',
              children: [
                n.jsx('thead', {
                  children: n.jsx('tr', {
                    children: N.map((w) =>
                      n.jsx(
                        'th',
                        {
                          className:
                            'sticky top-0 bg-[#f57c00] text-white px-2 py-1.5 text-left font-semibold text-[11px] uppercase tracking-wide',
                          children: w.label
                        },
                        w.key
                      )
                    )
                  })
                }),
                n.jsx('tbody', {
                  children: y.map((w, v) =>
                    n.jsx(
                      'tr',
                      {
                        className: 'border-b border-gray-100 hover:bg-orange-50/40',
                        children: N.map((D) => {
                          const S = w[D.key];
                          if (C.has(D.key) && S != null && S !== '') {
                            const _ = xo(S);
                            return n.jsx(
                              'td',
                              {
                                className: 'px-2 py-1.5',
                                children: n.jsxs('span', {
                                  className:
                                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                                  style: { background: _.bg, color: _.fg },
                                  children: [
                                    n.jsx('span', {
                                      className: 'w-1.5 h-1.5 rounded-full',
                                      style: { background: _.dot }
                                    }),
                                    String(S)
                                  ]
                                })
                              },
                              D.key
                            );
                          }
                          return n.jsx(
                            'td',
                            {
                              className: 'px-2 py-1.5',
                              children:
                                S != null
                                  ? typeof S == 'number'
                                    ? S.toLocaleString('es-CL')
                                    : String(S)
                                  : '—'
                            },
                            D.key
                          );
                        })
                      },
                      v
                    )
                  )
                })
              ]
            })
          });
        }
        case 'horizontal-bars': {
          const m = Array.isArray(l) ? l : [],
            N = e.config.labelField || e.config.xField || 'nombre',
            y =
              e.config.valueField ||
              ((M = (O = e.config.yFields) == null ? void 0 : O[0]) == null ? void 0 : M.key) ||
              'total',
            C = e.config.color || '#f57c00',
            w = m.slice(0, e.config.maxItems || 10),
            v = Math.max(1, ...w.map((D) => Number(D[y]) || 0));
          return n.jsx('div', {
            className: 'space-y-2 overflow-auto h-full pr-1',
            children: w.map((D, S) =>
              n.jsxs(
                'div',
                {
                  className: 'flex items-center gap-2',
                  children: [
                    n.jsx('span', {
                      className: 'w-28 shrink-0 text-[11px] text-gray-600 text-right truncate',
                      children: D[N]
                    }),
                    n.jsx('div', {
                      className: 'flex-1 h-5 bg-gray-100 rounded overflow-hidden',
                      children: n.jsx('div', {
                        className:
                          'h-full rounded flex items-center justify-end pr-1.5 text-[10px] font-semibold text-white transition-all',
                        style: {
                          width: `${Math.max(6, ((Number(D[y]) || 0) / v) * 100)}%`,
                          background: C
                        },
                        children: D[y] != null ? D[y] : ''
                      })
                    })
                  ]
                },
                S
              )
            )
          });
        }
        case 'stat-list': {
          if (Array.isArray(l)) {
            const N = e.config.labelField || e.config.xField || 'nombre',
              y =
                e.config.valueField ||
                ((se = (re = e.config.yFields) == null ? void 0 : re[0]) == null
                  ? void 0
                  : se.key) ||
                'total',
              C = l.slice(0, e.config.maxItems || 10);
            return n.jsx('div', {
              className: 'space-y-1.5 overflow-auto h-full',
              children: C.map((w, v) =>
                n.jsxs(
                  'div',
                  {
                    className:
                      'flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50',
                    children: [
                      n.jsx('span', { className: 'text-[12px] text-gray-700', children: w[N] }),
                      n.jsx('span', {
                        className: 'text-[13px] font-bold',
                        style: { color: e.config.color || '#f57c00' },
                        children:
                          w[y] != null
                            ? typeof w[y] == 'number'
                              ? w[y].toLocaleString('es-CL')
                              : w[y]
                            : '—'
                      })
                    ]
                  },
                  v
                )
              )
            });
          }
          const m = e.config.columns || [];
          return n.jsx('div', {
            className: 'space-y-1.5 overflow-auto h-full',
            children: m.map((N) =>
              n.jsxs(
                'div',
                {
                  className:
                    'flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50',
                  children: [
                    n.jsx('span', { className: 'text-[12px] text-gray-700', children: N.label }),
                    n.jsx('span', {
                      className: 'text-[13px] font-bold',
                      style: { color: e.config.color || '#f57c00' },
                      children: (l == null ? void 0 : l[N.key]) != null ? l[N.key] : '—'
                    })
                  ]
                },
                N.key
              )
            )
          });
        }
        case 'gauge': {
          const m = e.config.valueField ? l[e.config.valueField] : l,
            N = Number(m),
            y = e.config.min ?? 0,
            C = e.config.max ?? 100;
          if (isNaN(N))
            return n.jsx('div', {
              className: 'flex items-center justify-center h-full text-gray-300 text-sm',
              children: 'Sin datos'
            });
          const w = Math.max(0, Math.min(1, (N - y) / (C - y || 1))),
            v = w * 180,
            D = w >= 0.8 ? '#2e7d32' : w >= 0.5 ? '#f57c00' : '#c62828',
            S = 80,
            _ = (Math.PI * (180 - v)) / 180,
            G = 100 + S * Math.cos(_),
            X = 100 - S * Math.sin(_),
            le = v > 180 ? 1 : 0;
          return n.jsxs('div', {
            className: 'flex flex-col items-center justify-center h-full',
            children: [
              n.jsxs('svg', {
                viewBox: '0 0 200 120',
                className: 'w-full',
                style: { maxHeight: '100%' },
                children: [
                  n.jsx('path', {
                    d: 'M 20 100 A 80 80 0 0 1 180 100',
                    fill: 'none',
                    stroke: '#eee',
                    strokeWidth: '14',
                    strokeLinecap: 'round'
                  }),
                  n.jsx('path', {
                    d: `M 20 100 A 80 80 0 ${le} 1 ${G} ${X}`,
                    fill: 'none',
                    stroke: D,
                    strokeWidth: '14',
                    strokeLinecap: 'round'
                  }),
                  n.jsx('text', {
                    x: '100',
                    y: '92',
                    textAnchor: 'middle',
                    fontSize: '30',
                    fontWeight: 'bold',
                    fill: D,
                    children:
                      e.config.format === 'percent' || C === 100
                        ? `${Math.round(N)}%`
                        : Math.round(N)
                  })
                ]
              }),
              e.config.subtitle &&
                n.jsx('span', {
                  className: 'text-[11px] text-gray-400 text-center -mt-1',
                  children: e.config.subtitle
                })
            ]
          });
        }
        case 'funnel': {
          const m = Array.isArray(l) ? l : [],
            N = e.config.labelField || 'etapa',
            y = e.config.valueField || 'cantidad',
            C = m.slice(0, e.config.maxItems || 10),
            w = Math.max(1, ...C.map((D) => Number(D[y]) || 0)),
            v = e.config.color || '#f57c00';
          return n.jsx('div', {
            className: 'flex flex-col gap-1.5 h-full justify-center overflow-auto py-1',
            children: C.map((D, S) => {
              const _ = Number(D[y]) || 0,
                G = Math.max(15, (_ / w) * 100),
                X = S > 0 ? Number(C[S - 1][y]) || 0 : _,
                le = X > 0 ? Math.round((_ / X) * 100) : 100;
              return n.jsxs(
                'div',
                {
                  className: 'flex flex-col items-center',
                  children: [
                    n.jsxs('div', {
                      className:
                        'h-9 rounded flex items-center justify-center text-white text-[12px] font-semibold transition-all',
                      style: { width: `${G}%`, background: v, opacity: 1 - S * 0.13 },
                      children: [D[N], ': ', _.toLocaleString('es-CL')]
                    }),
                    S > 0 &&
                      n.jsxs('span', { className: 'text-[9px] text-gray-400', children: [le, '%'] })
                  ]
                },
                S
              );
            })
          });
        }
        case 'timeline': {
          const m = Array.isArray(l) ? l : [],
            N = e.config.labelField || 'label',
            y =
              e.config.valueField ||
              ((he = (ce = e.config.yFields) == null ? void 0 : ce[0]) == null ? void 0 : he.key) ||
              'entregadas',
            C = e.config.color || '#f57c00',
            w = m.slice(0, e.config.maxItems || 20);
          return n.jsx('div', {
            className: 'overflow-auto h-full pl-1',
            children: n.jsx('div', {
              className: 'relative pl-4 border-l-2 border-gray-200 space-y-3 py-1',
              children: w.map((v, D) =>
                n.jsxs(
                  'div',
                  {
                    className: 'relative',
                    children: [
                      n.jsx('span', {
                        className:
                          'absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border-2 border-white',
                        style: { background: C }
                      }),
                      n.jsx('div', {
                        className: 'text-[12px] font-semibold text-gray-700',
                        children: v[N]
                      }),
                      n.jsx('div', {
                        className: 'text-[13px] font-bold',
                        style: { color: C },
                        children:
                          v[y] != null
                            ? typeof v[y] == 'number'
                              ? v[y].toLocaleString('es-CL')
                              : v[y]
                            : '—'
                      })
                    ]
                  },
                  D
                )
              )
            })
          });
        }
        case 'heatmap': {
          const m = Array.isArray(l) ? l : [],
            N = e.config.rowField || 'estado',
            y = e.config.colField || 'transportista',
            C = e.config.valueField || 'cantidad',
            w = e.config.maxItems || 8,
            v = [],
            D = {},
            S = {};
          m.forEach((x) => {
            const K = String(x[N] ?? '—'),
              J = String(x[y] ?? '—'),
              ke = Number(x[C]) || 0;
            (v.includes(K) || v.push(K),
              S[K] || (S[K] = {}),
              (S[K][J] = (S[K][J] || 0) + ke),
              (D[J] = (D[J] || 0) + ke));
          });
          const _ = Object.entries(D)
            .sort((x, K) => K[1] - x[1])
            .slice(0, w)
            .map(([x]) => x);
          let G = 1;
          v.forEach((x) =>
            _.forEach((K) => {
              var J;
              G = Math.max(G, ((J = S[x]) == null ? void 0 : J[K]) || 0);
            })
          );
          const X = e.config.color || '#f57c00',
            { r: le, g: o, b: k } = go(X);
          return n.jsx('div', {
            className: 'overflow-auto h-full',
            children: n.jsxs('table', {
              className: 'border-collapse text-[10px]',
              children: [
                n.jsx('thead', {
                  children: n.jsxs('tr', {
                    children: [
                      n.jsx('th', {
                        className:
                          'sticky left-0 bg-white px-1.5 py-1 text-left text-gray-400 font-medium'
                      }),
                      _.map((x) =>
                        n.jsx(
                          'th',
                          {
                            className: 'px-1.5 py-1 text-gray-500 font-medium whitespace-nowrap',
                            style: { maxWidth: 70 },
                            children: n.jsx('div', {
                              className: 'truncate',
                              style: { maxWidth: 70 },
                              title: x,
                              children: x
                            })
                          },
                          x
                        )
                      )
                    ]
                  })
                }),
                n.jsx('tbody', {
                  children: v.map((x) =>
                    n.jsxs(
                      'tr',
                      {
                        children: [
                          n.jsx('td', {
                            className:
                              'sticky left-0 bg-white px-1.5 py-1 text-gray-600 font-medium whitespace-nowrap',
                            children: x
                          }),
                          _.map((K) => {
                            var Re;
                            const J = ((Re = S[x]) == null ? void 0 : Re[K]) || 0,
                              ke = J / G;
                            return n.jsx(
                              'td',
                              {
                                className: 'px-1.5 py-1 text-center font-semibold',
                                style: {
                                  background:
                                    J > 0 ? `rgba(${le},${o},${k},${0.12 + ke * 0.88})` : '#fafafa',
                                  color: ke > 0.55 ? '#fff' : '#444'
                                },
                                title: `${x} / ${K}: ${J}`,
                                children: J || ''
                              },
                              K
                            );
                          })
                        ]
                      },
                      x
                    )
                  )
                })
              ]
            })
          });
        }
        case 'area-chart': {
          const m = Array.isArray(l) ? l : [],
            N = e.config.yFields || [],
            y = e.config.xField || 'label';
          return n.jsx(Ft, {
            width: '100%',
            height: '100%',
            children: n.jsxs(qa, {
              data: m.slice(0, e.config.maxItems || 50),
              margin: { top: 5, right: 10, left: 0, bottom: 5 },
              children: [
                n.jsx(Kt, { strokeDasharray: '3 3', stroke: '#f0f0f0' }),
                n.jsx(Jt, { dataKey: y, tick: { fontSize: 10 } }),
                n.jsx(Zt, { tick: { fontSize: 10 } }),
                n.jsx(Ot, { contentStyle: { fontSize: 12 } }),
                e.config.showLegend !== !1 && n.jsx(Qt, { wrapperStyle: { fontSize: 11 } }),
                N.map((C) =>
                  n.jsx(
                    Ya,
                    {
                      type: 'monotone',
                      dataKey: C.key,
                      name: C.label,
                      stroke: C.color,
                      fill: C.color,
                      fillOpacity: e.config.fillOpacity ?? 0.3,
                      strokeWidth: 2
                    },
                    C.key
                  )
                )
              ]
            })
          });
        }
        case 'scorecard': {
          const m = e.config,
            N = m.valueField ? (l == null ? void 0 : l[m.valueField]) : l,
            y = N == null ? null : Number(N),
            C =
              y == null
                ? '—'
                : m.format === 'percent'
                  ? `${m.prefix || ''}${y}%${m.suffix || ''}`
                  : m.format === 'days'
                    ? `${m.prefix || ''}${y} d${m.suffix || ''}`
                    : `${m.prefix || ''}${y.toLocaleString('es-CL')}${m.suffix || ''}`;
          let w = null;
          (m.comparisonField && l && (w = Number(l[m.comparisonField])),
            w != null && isNaN(w) && (w = null));
          const v = y != null && w != null && w !== 0 ? ((y - w) / Math.abs(w)) * 100 : null,
            D = v != null ? (m.invertComparison ? v < 0 : v > 0) : null,
            S =
              m.fontSize === 'sm'
                ? 'text-2xl'
                : m.fontSize === 'lg'
                  ? 'text-5xl'
                  : m.fontSize === 'xl'
                    ? 'text-6xl'
                    : 'text-4xl';
          return n.jsxs('div', {
            className: `flex flex-col items-${m.textAlign || 'center'} justify-center h-full gap-1`,
            children: [
              n.jsx('span', {
                className: `${S} font-extrabold tabular-nums`,
                style: { color: m.color || '#f57c00' },
                children: C
              }),
              v != null &&
                n.jsxs('span', {
                  className: `text-sm font-semibold ${D ? 'text-green-600' : 'text-red-500'}`,
                  children: [
                    v > 0 ? '▲' : v < 0 ? '▼' : '▬',
                    ' ',
                    Math.abs(v).toFixed(1),
                    '%',
                    m.comparisonLabel &&
                      n.jsx('span', {
                        className: 'text-gray-400 font-normal ml-1',
                        children: m.comparisonLabel
                      })
                  ]
                }),
              m.subtitle &&
                n.jsx('span', { className: 'text-[11px] text-gray-400', children: m.subtitle })
            ]
          });
        }
        case 'text': {
          const m = e.config,
            N =
              m.fontSize === 'sm'
                ? 'text-sm'
                : m.fontSize === 'lg'
                  ? 'text-xl'
                  : m.fontSize === 'xl'
                    ? 'text-2xl'
                    : 'text-base';
          return n.jsx('div', {
            className: `h-full flex items-center ${m.textAlign === 'right' ? 'justify-end' : m.textAlign === 'left' ? 'justify-start' : 'justify-center'} p-2`,
            children: n.jsx('div', {
              className: `${N} whitespace-pre-wrap`,
              style: { color: m.color || '#374151' },
              children: m.content || 'Texto aquí…'
            })
          });
        }
        case 'divider': {
          const m = e.config;
          return n.jsx('div', {
            className: 'h-full flex items-center px-2',
            children: n.jsx('div', {
              className: 'w-full',
              style: {
                borderTop: `${m.borderWidth || 1}px solid ${m.borderColor || m.color || '#e5e7eb'}`,
                borderRadius: m.borderRadius ?? 0
              }
            })
          });
        }
        case 'image': {
          const m = e.config;
          return n.jsx('div', {
            className: 'h-full w-full flex items-center justify-center overflow-hidden p-1',
            children: m.imageUrl
              ? n.jsx('img', {
                  src: m.imageUrl,
                  alt: e.title,
                  className: 'max-h-full max-w-full',
                  style: { objectFit: m.imageFit || 'contain' }
                })
              : n.jsx('div', { className: 'text-gray-300 text-sm', children: 'Sin URL de imagen' })
          });
        }
        default:
          return n.jsx('div', { className: 'text-gray-400 text-sm', children: 'Tipo desconocido' });
      }
    },
    i = e.config,
    f = i.bgColor || void 0,
    h = i.borderColor || void 0,
    d = i.borderWidth ?? void 0,
    g = i.borderRadius ?? 12,
    R = ['text', 'divider', 'image'].includes(e.type);
  return n.jsx('div', {
    className: `h-full flex flex-col overflow-hidden group relative ${R ? '' : 'shadow-sm'}`,
    style: {
      background: f || '#fff',
      border: `${d ?? 1}px solid ${h || '#e5e7eb'}`,
      borderRadius: g
    },
    children: R
      ? n.jsxs(n.Fragment, {
          children: [
            a &&
              n.jsxs('div', {
                className:
                  'absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                children: [
                  n.jsx('button', {
                    onClick: (b) => {
                      (b.stopPropagation(), s());
                    },
                    className:
                      'w-6 h-6 rounded bg-white/80 flex items-center justify-center text-gray-400 hover:text-blue-600 text-[11px] shadow-sm',
                    title: 'Configurar',
                    children: 'C'
                  }),
                  n.jsx('button', {
                    onClick: (b) => {
                      (b.stopPropagation(), r());
                    },
                    className:
                      'w-6 h-6 rounded bg-white/80 flex items-center justify-center text-gray-400 hover:text-red-600 text-[11px] shadow-sm',
                    title: 'Eliminar',
                    children: 'X'
                  })
                ]
              }),
            n.jsx('div', {
              className: 'flex-1 overflow-hidden min-h-0 drag-handle cursor-move',
              children: c()
            })
          ]
        })
      : n.jsxs(n.Fragment, {
          children: [
            n.jsxs('div', {
              className:
                'flex items-center justify-between px-3 py-2 border-b border-gray-100 shrink-0 cursor-move drag-handle',
              children: [
                n.jsx('h3', {
                  className:
                    'text-[12px] font-semibold text-gray-600 uppercase tracking-wide truncate',
                  children: e.title
                }),
                a &&
                  n.jsxs('div', {
                    className:
                      'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                    children: [
                      n.jsx('button', {
                        onClick: (b) => {
                          (b.stopPropagation(), s());
                        },
                        className:
                          'w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 text-[12px]',
                        title: 'Configurar',
                        children: 'C'
                      }),
                      n.jsx('button', {
                        onClick: (b) => {
                          (b.stopPropagation(), r());
                        },
                        className:
                          'w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 text-[12px]',
                        title: 'Eliminar',
                        children: 'X'
                      })
                    ]
                  })
              ]
            }),
            n.jsx('div', { className: 'flex-1 p-3 overflow-hidden min-h-0', children: c() })
          ]
        })
  });
}
const bo = u.memo(
  yo,
  (e, t) => e.widget === t.widget && e.data === t.data && e.editMode === t.editMode
);
function vo({ widget: e, onSave: t, onCancel: a, calcFields: s = [] }) {
  const [r, l] = u.useState(() => JSON.parse(JSON.stringify(e))),
    c = kt.find((o) => o.key === r.dataSource),
    i = c ? { ...c, fields: lo(r.dataSource, s) } : void 0,
    f = (i == null ? void 0 : i.type) || 'single',
    h = (o) => l((k) => ({ ...k, ...o })),
    d = (o) => l((k) => ({ ...k, config: { ...k.config, ...o } })),
    g = () => {
      const o = [...(r.config.yFields || [])],
        k = o.length;
      (o.push({ key: '', label: '', color: gn(k) }), d({ yFields: o }));
    },
    R = (o) => {
      const k = [...(r.config.yFields || [])];
      (k.splice(o, 1), d({ yFields: k }));
    },
    T = (o, k) => {
      const x = [...(r.config.yFields || [])];
      ((x[o] = { ...x[o], ...k }), d({ yFields: x }));
    },
    b = () => {
      const o = [...(r.config.columns || [])];
      (o.push({ key: '', label: '' }), d({ columns: o }));
    },
    F = (o) => {
      const k = [...(r.config.columns || [])];
      (k.splice(o, 1), d({ columns: k }));
    },
    O = (o, k) => {
      const x = [...(r.config.columns || [])];
      ((x[o] = { ...x[o], ...k }), d({ columns: x }));
    },
    M = () => d({ filters: [...(r.config.filters || []), { field: '', op: '=', value: '' }] }),
    re = (o) => {
      const k = [...(r.config.filters || [])];
      (k.splice(o, 1), d({ filters: k }));
    },
    se = (o, k) => {
      const x = [...(r.config.filters || [])];
      ((x[o] = { ...x[o], ...k }), d({ filters: x }));
    },
    ce = ['bar-chart', 'line-chart', 'area-chart'].includes(r.type),
    he = ['pie-chart', 'donut-chart'].includes(r.type),
    m = r.type === 'table',
    N = r.type === 'stat-list',
    y = r.type === 'horizontal-bars',
    C = r.type === 'gauge',
    w = r.type === 'heatmap',
    v = r.type === 'semaforo',
    D = r.type === 'scorecard',
    S = r.type === 'text',
    _ = r.type === 'image',
    G = r.type === 'divider',
    X = ['horizontal-bars', 'funnel', 'timeline'].includes(r.type),
    le = S || _ || G;
  return n.jsx('div', {
    className:
      'fixed inset-0 z-[200] bg-slate-900/20 backdrop-blur-sm flex items-start justify-end',
    onClick: a,
    children: n.jsxs('div', {
      className:
        'w-[420px] max-w-full h-full bg-white shadow-2xl rounded-l-2xl border-l border-slate-200 overflow-auto',
      onClick: (o) => o.stopPropagation(),
      children: [
        n.jsxs('div', {
          className:
            'sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10',
          children: [
            n.jsx('h2', { className: 'font-bold text-gray-800', children: 'Configurar Widget' }),
            n.jsxs('div', {
              className: 'flex gap-2',
              children: [
                n.jsx('button', {
                  onClick: a,
                  className: 'px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg',
                  children: 'Cancelar'
                }),
                n.jsx('button', {
                  onClick: () => t(r),
                  className:
                    'px-3 py-1.5 text-sm bg-[#ea580c] text-white rounded-lg hover:bg-[#c2410c] font-medium',
                  children: 'Guardar'
                })
              ]
            })
          ]
        }),
        n.jsxs('div', {
          className: 'p-4 space-y-4',
          children: [
            n.jsxs('div', {
              children: [
                n.jsx('label', { className: 'field-label', children: 'Titulo' }),
                n.jsx('input', {
                  className: 'field-input',
                  value: r.title,
                  onChange: (o) => h({ title: o.target.value })
                })
              ]
            }),
            n.jsxs('div', {
              children: [
                n.jsx('label', { className: 'field-label', children: 'Tipo de Widget' }),
                n.jsx('select', {
                  className: 'field-input',
                  value: r.type,
                  onChange: (o) => h({ type: o.target.value }),
                  children: zn.map((o) =>
                    n.jsx('option', { value: o.type, children: o.label }, o.type)
                  )
                })
              ]
            }),
            n.jsxs('div', {
              children: [
                n.jsx('label', { className: 'field-label', children: 'Fuente de Datos' }),
                n.jsx('select', {
                  className: 'field-input',
                  value: r.dataSource,
                  onChange: (o) => h({ dataSource: o.target.value }),
                  children: kt.map((o) =>
                    n.jsx('option', { value: o.key, children: o.label }, o.key)
                  )
                }),
                i &&
                  n.jsxs('p', {
                    className: 'text-[10px] text-gray-400 mt-1',
                    children: [
                      'Tipo: ',
                      i.type,
                      ' | Campos: ',
                      i.fields.map((o) => o.key).join(', ')
                    ]
                  })
              ]
            }),
            r.type === 'kpi' &&
              f === 'array' &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Agregación' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.agg || 'count',
                        onChange: (o) => d({ agg: o.target.value }),
                        children: [
                          n.jsx('option', { value: 'count', children: 'Contar filas (COUNT)' }),
                          n.jsx('option', { value: 'sum', children: 'Sumar campo (SUM)' }),
                          n.jsx('option', { value: 'avg', children: 'Promediar campo (AVG)' })
                        ]
                      })
                    ]
                  }),
                  (r.config.agg || 'count') === 'count'
                    ? n.jsxs('div', {
                        className: 'grid grid-cols-2 gap-2',
                        children: [
                          n.jsxs('div', {
                            children: [
                              n.jsx('label', {
                                className: 'field-label',
                                children: 'Filtrar por campo (opcional)'
                              }),
                              n.jsxs('select', {
                                className: 'field-input',
                                value: r.config.whereField || '',
                                onChange: (o) => d({ whereField: o.target.value }),
                                children: [
                                  n.jsx('option', { value: '', children: '— todas —' }),
                                  i == null
                                    ? void 0
                                    : i.fields.map((o) =>
                                        n.jsx('option', { value: o.key, children: o.label }, o.key)
                                      )
                                ]
                              })
                            ]
                          }),
                          n.jsxs('div', {
                            children: [
                              n.jsx('label', { className: 'field-label', children: 'Igual a' }),
                              n.jsx('input', {
                                className: 'field-input',
                                value: r.config.whereValue || '',
                                onChange: (o) => d({ whereValue: o.target.value }),
                                placeholder: 'Ej: CRITICA / true'
                              })
                            ]
                          })
                        ]
                      })
                    : n.jsxs('div', {
                        children: [
                          n.jsxs('label', {
                            className: 'field-label',
                            children: ['Campo a ', r.config.agg === 'avg' ? 'promediar' : 'sumar']
                          }),
                          n.jsxs('select', {
                            className: 'field-input',
                            value: r.config.valueField || '',
                            onChange: (o) => d({ valueField: o.target.value }),
                            children: [
                              n.jsx('option', { value: '', children: '-- seleccionar --' }),
                              i == null
                                ? void 0
                                : i.fields
                                    .filter((o) => o.type === 'number' || o.type === 'percent')
                                    .map((o) =>
                                      n.jsx('option', { value: o.key, children: o.label }, o.key)
                                    )
                            ]
                          })
                        ]
                      }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Icono (emoji)' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.icon || '',
                        onChange: (o) => d({ icon: o.target.value }),
                        placeholder: 'Ej: 🚨'
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Subtitulo' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.subtitle || '',
                        onChange: (o) => d({ subtitle: o.target.value })
                      })
                    ]
                  })
                ]
              }),
            r.type === 'kpi' &&
              f !== 'array' &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Valor' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.valueField || '',
                        onChange: (o) => d({ valueField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields.map((o) =>
                                n.jsxs(
                                  'option',
                                  { value: o.key, children: [o.label, ' (', o.key, ')'] },
                                  o.key
                                )
                              )
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Formato' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.format || 'number',
                        onChange: (o) => d({ format: o.target.value }),
                        children: [
                          n.jsx('option', { value: 'number', children: 'Numero' }),
                          n.jsx('option', { value: 'percent', children: 'Porcentaje (%)' }),
                          n.jsx('option', { value: 'days', children: 'Dias (d)' }),
                          n.jsx('option', { value: 'text', children: 'Texto' })
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Icono (emoji)' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.icon || '',
                        onChange: (o) => d({ icon: o.target.value }),
                        placeholder: 'Ej: 📦'
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Subtitulo' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.subtitle || '',
                        onChange: (o) => d({ subtitle: o.target.value })
                      })
                    ]
                  })
                ]
              }),
            ce &&
              f === 'array' &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo eje X' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.xField || '',
                        onChange: (o) => d({ xField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields.map((o) =>
                                n.jsx('option', { value: o.key, children: o.label }, o.key)
                              )
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Series (eje Y)' }),
                      (r.config.yFields || []).map((o, k) =>
                        n.jsxs(
                          'div',
                          {
                            className: 'flex gap-2 mt-2 items-end',
                            children: [
                              n.jsx('div', {
                                className: 'flex-1',
                                children: n.jsxs('select', {
                                  className: 'field-input text-[12px]',
                                  value: o.key,
                                  onChange: (x) =>
                                    T(k, { key: x.target.value, label: x.target.value }),
                                  children: [
                                    n.jsx('option', { value: '', children: 'campo' }),
                                    i == null
                                      ? void 0
                                      : i.fields
                                          .filter(
                                            (x) => x.type === 'number' || x.type === 'percent'
                                          )
                                          .map((x) =>
                                            n.jsx(
                                              'option',
                                              { value: x.key, children: x.label },
                                              x.key
                                            )
                                          )
                                  ]
                                })
                              }),
                              n.jsx('input', {
                                className: 'w-16 field-input text-[12px]',
                                value: o.label,
                                onChange: (x) => T(k, { label: x.target.value }),
                                placeholder: 'Label'
                              }),
                              n.jsx('input', {
                                type: 'color',
                                className: 'w-8 h-9 rounded cursor-pointer',
                                value: o.color,
                                onChange: (x) => T(k, { color: x.target.value })
                              }),
                              n.jsx('button', {
                                onClick: () => R(k),
                                className: 'text-red-400 hover:text-red-600 text-sm px-1',
                                children: 'X'
                              })
                            ]
                          },
                          k
                        )
                      ),
                      n.jsx('button', {
                        onClick: g,
                        className: 'mt-2 text-[12px] text-blue-600 hover:text-blue-800',
                        children: '+ Agregar serie'
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      n.jsx('input', {
                        type: 'checkbox',
                        checked: r.config.showLegend !== !1,
                        onChange: (o) => d({ showLegend: o.target.checked })
                      }),
                      n.jsx('span', {
                        className: 'text-[12px] text-gray-600',
                        children: 'Mostrar leyenda'
                      })
                    ]
                  })
                ]
              }),
            he &&
              f === 'array' &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Etiqueta' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.labelField || r.config.xField || '',
                        onChange: (o) => d({ labelField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields.map((o) =>
                                n.jsx('option', { value: o.key, children: o.label }, o.key)
                              )
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Valor' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.valueField || '',
                        onChange: (o) => d({ valueField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields
                                .filter((o) => o.type === 'number')
                                .map((o) =>
                                  n.jsx('option', { value: o.key, children: o.label }, o.key)
                                )
                        ]
                      })
                    ]
                  })
                ]
              }),
            m &&
              n.jsxs('div', {
                children: [
                  n.jsx('label', { className: 'field-label', children: 'Columnas' }),
                  (r.config.columns || []).map((o, k) =>
                    n.jsxs(
                      'div',
                      {
                        className: 'flex gap-2 mt-2 items-end',
                        children: [
                          n.jsx('div', {
                            className: 'flex-1',
                            children: n.jsxs('select', {
                              className: 'field-input text-[12px]',
                              value: o.key,
                              onChange: (x) => O(k, { key: x.target.value }),
                              children: [
                                n.jsx('option', { value: '', children: 'campo' }),
                                i == null
                                  ? void 0
                                  : i.fields.map((x) =>
                                      n.jsx('option', { value: x.key, children: x.label }, x.key)
                                    )
                              ]
                            })
                          }),
                          n.jsx('input', {
                            className: 'w-24 field-input text-[12px]',
                            value: o.label,
                            onChange: (x) => O(k, { label: x.target.value }),
                            placeholder: 'Encabezado'
                          }),
                          n.jsx('button', {
                            onClick: () => F(k),
                            className: 'text-red-400 hover:text-red-600 text-sm px-1',
                            children: 'X'
                          })
                        ]
                      },
                      k
                    )
                  ),
                  n.jsx('button', {
                    onClick: b,
                    className: 'mt-2 text-[12px] text-blue-600 hover:text-blue-800',
                    children: '+ Agregar columna'
                  })
                ]
              }),
            f === 'array' &&
              n.jsxs('div', {
                className: 'border-t border-gray-100 pt-3 mt-1',
                children: [
                  n.jsxs('label', {
                    className: 'field-label',
                    children: [
                      'Filtros ',
                      n.jsx('span', {
                        className: 'text-gray-400 font-normal',
                        children: '(deben cumplirse todos)'
                      })
                    ]
                  }),
                  (r.config.filters || []).map((o, k) =>
                    n.jsxs(
                      'div',
                      {
                        className: 'flex gap-1.5 mt-2 items-center',
                        children: [
                          n.jsxs('select', {
                            className: 'field-input text-[12px] flex-1',
                            value: o.field,
                            onChange: (x) => se(k, { field: x.target.value }),
                            children: [
                              n.jsx('option', { value: '', children: 'campo…' }),
                              i == null
                                ? void 0
                                : i.fields.map((x) =>
                                    n.jsx('option', { value: x.key, children: x.label }, x.key)
                                  )
                            ]
                          }),
                          n.jsx('select', {
                            className: 'field-input text-[12px] w-20',
                            value: o.op,
                            onChange: (x) => se(k, { op: x.target.value }),
                            children: ao.map((x) =>
                              n.jsx('option', { value: x.v, children: x.l }, x.v)
                            )
                          }),
                          n.jsx('input', {
                            className: 'field-input text-[12px] w-24',
                            value: o.value,
                            onChange: (x) => se(k, { value: x.target.value }),
                            placeholder: 'valor'
                          }),
                          n.jsx('button', {
                            onClick: () => re(k),
                            className: 'text-red-400 hover:text-red-600 text-sm px-1',
                            children: 'X'
                          })
                        ]
                      },
                      k
                    )
                  ),
                  n.jsx('button', {
                    onClick: M,
                    className: 'mt-2 text-[12px] text-blue-600 hover:text-blue-800',
                    children: '+ Agregar filtro'
                  }),
                  n.jsx('p', {
                    className: 'text-[10px] text-gray-400 mt-1',
                    children:
                      'Ej: prioridad = CRITICA · riesgo_otif = RIESGO · horas_restantes < 12'
                  })
                ]
              }),
            (y || X || N) &&
              f === 'array' &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Etiqueta' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.labelField || r.config.xField || '',
                        onChange: (o) => d({ labelField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields.map((o) =>
                                n.jsx('option', { value: o.key, children: o.label }, o.key)
                              )
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Valor' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.valueField || '',
                        onChange: (o) => d({ valueField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields
                                .filter((o) => o.type !== 'string')
                                .map((o) =>
                                  n.jsx('option', { value: o.key, children: o.label }, o.key)
                                )
                        ]
                      })
                    ]
                  })
                ]
              }),
            C &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Valor' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.valueField || '',
                        onChange: (o) => d({ valueField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields
                                .filter((o) => o.type === 'number' || o.type === 'percent')
                                .map((o) =>
                                  n.jsx('option', { value: o.key, children: o.label }, o.key)
                                )
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    className: 'flex gap-2',
                    children: [
                      n.jsxs('div', {
                        className: 'flex-1',
                        children: [
                          n.jsx('label', { className: 'field-label', children: 'Min' }),
                          n.jsx('input', {
                            type: 'number',
                            className: 'field-input',
                            value: r.config.min ?? 0,
                            onChange: (o) => d({ min: Number(o.target.value) })
                          })
                        ]
                      }),
                      n.jsxs('div', {
                        className: 'flex-1',
                        children: [
                          n.jsx('label', { className: 'field-label', children: 'Max' }),
                          n.jsx('input', {
                            type: 'number',
                            className: 'field-input',
                            value: r.config.max ?? 100,
                            onChange: (o) => d({ max: Number(o.target.value) })
                          })
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Subtitulo' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.subtitle || '',
                        onChange: (o) => d({ subtitle: o.target.value })
                      })
                    ]
                  })
                ]
              }),
            v &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Valor' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.valueField || '',
                        onChange: (o) => d({ valueField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields
                                .filter((o) => o.type === 'number' || o.type === 'percent')
                                .map((o) =>
                                  n.jsxs(
                                    'option',
                                    { value: o.key, children: [o.label, ' (', o.key, ')'] },
                                    o.key
                                  )
                                )
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Formato' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.format || 'percent',
                        onChange: (o) => d({ format: o.target.value }),
                        children: [
                          n.jsx('option', { value: 'percent', children: 'Porcentaje (%)' }),
                          n.jsx('option', { value: 'number', children: 'Numero' }),
                          n.jsx('option', { value: 'days', children: 'Dias (d)' })
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      n.jsx('input', {
                        type: 'checkbox',
                        checked: r.config.higherIsBetter !== !1,
                        onChange: (o) => d({ higherIsBetter: o.target.checked })
                      }),
                      n.jsx('span', {
                        className: 'text-[12px] text-gray-600',
                        children: 'Más alto es mejor (desmarca para lead time / tardanza)'
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    className: 'flex gap-2',
                    children: [
                      n.jsxs('div', {
                        className: 'flex-1',
                        children: [
                          n.jsxs('label', {
                            className: 'field-label',
                            children: [
                              'Umbral OK (',
                              r.config.higherIsBetter !== !1 ? '≥ verde' : '≤ verde',
                              ')'
                            ]
                          }),
                          n.jsx('input', {
                            type: 'number',
                            className: 'field-input',
                            value: r.config.okThreshold ?? '',
                            onChange: (o) =>
                              d({
                                okThreshold: o.target.value === '' ? void 0 : Number(o.target.value)
                              }),
                            placeholder: r.config.higherIsBetter !== !1 ? '85' : '1'
                          })
                        ]
                      }),
                      n.jsxs('div', {
                        className: 'flex-1',
                        children: [
                          n.jsxs('label', {
                            className: 'field-label',
                            children: [
                              'Umbral Crítico (',
                              r.config.higherIsBetter !== !1 ? '< rojo' : '> rojo',
                              ')'
                            ]
                          }),
                          n.jsx('input', {
                            type: 'number',
                            className: 'field-input',
                            value: r.config.critThreshold ?? '',
                            onChange: (o) =>
                              d({
                                critThreshold:
                                  o.target.value === '' ? void 0 : Number(o.target.value)
                              }),
                            placeholder: r.config.higherIsBetter !== !1 ? '50' : '5'
                          })
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', {
                        className: 'field-label',
                        children: 'Campo de tendencia (para “Mejorando”)'
                      }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.trendField || '',
                        onChange: (o) => d({ trendField: o.target.value || void 0 }),
                        children: [
                          n.jsx('option', { value: '', children: '— Sin tendencia —' }),
                          n.jsx('option', {
                            value: 'pctATiempo',
                            children: '% A Tiempo (mensual)'
                          }),
                          n.jsx('option', { value: 'otif', children: 'OTIF (mensual)' }),
                          n.jsx('option', { value: 'leadTime', children: 'Lead Time (mensual)' }),
                          n.jsx('option', {
                            value: 'entregadas',
                            children: 'Entregadas (mensual)'
                          }),
                          n.jsx('option', { value: 'activas', children: 'Activas (mensual)' })
                        ]
                      }),
                      n.jsx('p', {
                        className: 'text-[10px] text-gray-400 mt-1',
                        children:
                          'Compara el último mes vs el anterior (fuente: Tendencia Histórica). Si mejoró → azul “Mejorando”.'
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Subtitulo' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.subtitle || '',
                        onChange: (o) => d({ subtitle: o.target.value })
                      })
                    ]
                  })
                ]
              }),
            w &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Filas' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.rowField || '',
                        onChange: (o) => d({ rowField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields
                                .filter((o) => o.type === 'string')
                                .map((o) =>
                                  n.jsx('option', { value: o.key, children: o.label }, o.key)
                                )
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Columnas' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.colField || '',
                        onChange: (o) => d({ colField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields
                                .filter((o) => o.type === 'string')
                                .map((o) =>
                                  n.jsx('option', { value: o.key, children: o.label }, o.key)
                                )
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Valor' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.valueField || '',
                        onChange: (o) => d({ valueField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields
                                .filter((o) => o.type === 'number')
                                .map((o) =>
                                  n.jsx('option', { value: o.key, children: o.label }, o.key)
                                )
                        ]
                      })
                    ]
                  })
                ]
              }),
            N &&
              f === 'single' &&
              n.jsxs('div', {
                children: [
                  n.jsx('label', { className: 'field-label', children: 'Campos a mostrar' }),
                  (r.config.columns || []).map((o, k) =>
                    n.jsxs(
                      'div',
                      {
                        className: 'flex gap-2 mt-2 items-end',
                        children: [
                          n.jsx('div', {
                            className: 'flex-1',
                            children: n.jsxs('select', {
                              className: 'field-input text-[12px]',
                              value: o.key,
                              onChange: (x) => O(k, { key: x.target.value }),
                              children: [
                                n.jsx('option', { value: '', children: 'campo' }),
                                i == null
                                  ? void 0
                                  : i.fields.map((x) =>
                                      n.jsx('option', { value: x.key, children: x.label }, x.key)
                                    )
                              ]
                            })
                          }),
                          n.jsx('input', {
                            className: 'w-24 field-input text-[12px]',
                            value: o.label,
                            onChange: (x) => O(k, { label: x.target.value }),
                            placeholder: 'Etiqueta'
                          }),
                          n.jsx('button', {
                            onClick: () => F(k),
                            className: 'text-red-400 hover:text-red-600 text-sm px-1',
                            children: 'X'
                          })
                        ]
                      },
                      k
                    )
                  ),
                  n.jsx('button', {
                    onClick: b,
                    className: 'mt-2 text-[12px] text-blue-600 hover:text-blue-800',
                    children: '+ Agregar campo'
                  })
                ]
              }),
            D &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Campo de Valor' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.valueField || '',
                        onChange: (o) => d({ valueField: o.target.value }),
                        children: [
                          n.jsx('option', { value: '', children: '-- seleccionar --' }),
                          i == null
                            ? void 0
                            : i.fields.map((o) =>
                                n.jsx('option', { value: o.key, children: o.label }, o.key)
                              )
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Formato' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.format || 'number',
                        onChange: (o) => d({ format: o.target.value }),
                        children: [
                          n.jsx('option', { value: 'number', children: 'Número' }),
                          n.jsx('option', { value: 'percent', children: 'Porcentaje (%)' }),
                          n.jsx('option', { value: 'days', children: 'Días (d)' })
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', {
                        className: 'field-label',
                        children: 'Campo de comparación'
                      }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.comparisonField || '',
                        onChange: (o) => d({ comparisonField: o.target.value || void 0 }),
                        children: [
                          n.jsx('option', { value: '', children: '— Sin comparación —' }),
                          i == null
                            ? void 0
                            : i.fields
                                .filter((o) => o.type !== 'string')
                                .map((o) =>
                                  n.jsx('option', { value: o.key, children: o.label }, o.key)
                                )
                        ]
                      })
                    ]
                  }),
                  r.config.comparisonField &&
                    n.jsxs(n.Fragment, {
                      children: [
                        n.jsxs('div', {
                          children: [
                            n.jsx('label', {
                              className: 'field-label',
                              children: 'Label comparación'
                            }),
                            n.jsx('input', {
                              className: 'field-input',
                              value: r.config.comparisonLabel || '',
                              onChange: (o) => d({ comparisonLabel: o.target.value }),
                              placeholder: 'vs mes anterior'
                            })
                          ]
                        }),
                        n.jsxs('div', {
                          className: 'flex items-center gap-2',
                          children: [
                            n.jsx('input', {
                              type: 'checkbox',
                              checked: !!r.config.invertComparison,
                              onChange: (o) => d({ invertComparison: o.target.checked })
                            }),
                            n.jsx('span', {
                              className: 'text-[12px] text-gray-600',
                              children: 'Invertir (menos es mejor)'
                            })
                          ]
                        })
                      ]
                    }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Prefijo' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.prefix || '',
                        onChange: (o) => d({ prefix: o.target.value }),
                        placeholder: '$, CLP, etc.'
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Sufijo' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.suffix || '',
                        onChange: (o) => d({ suffix: o.target.value }),
                        placeholder: '%, unid, etc.'
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Subtitulo' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.subtitle || '',
                        onChange: (o) => d({ subtitle: o.target.value })
                      })
                    ]
                  })
                ]
              }),
            S &&
              n.jsx(n.Fragment, {
                children: n.jsxs('div', {
                  children: [
                    n.jsx('label', { className: 'field-label', children: 'Contenido' }),
                    n.jsx('textarea', {
                      className: 'field-input min-h-[80px]',
                      value: r.config.content || '',
                      onChange: (o) => d({ content: o.target.value }),
                      placeholder: 'Escribe tu texto aquí…'
                    })
                  ]
                })
              }),
            _ &&
              n.jsxs(n.Fragment, {
                children: [
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'URL de imagen' }),
                      n.jsx('input', {
                        className: 'field-input',
                        value: r.config.imageUrl || '',
                        onChange: (o) => d({ imageUrl: o.target.value }),
                        placeholder: 'https://...'
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Ajuste' }),
                      n.jsxs('select', {
                        className: 'field-input',
                        value: r.config.imageFit || 'contain',
                        onChange: (o) => d({ imageFit: o.target.value }),
                        children: [
                          n.jsx('option', { value: 'contain', children: 'Contener' }),
                          n.jsx('option', { value: 'cover', children: 'Cubrir' }),
                          n.jsx('option', { value: 'fill', children: 'Estirar' })
                        ]
                      })
                    ]
                  })
                ]
              }),
            r.type === 'area-chart' &&
              n.jsxs('div', {
                children: [
                  n.jsx('label', { className: 'field-label', children: 'Opacidad relleno' }),
                  n.jsx('input', {
                    type: 'range',
                    min: '0',
                    max: '1',
                    step: '0.05',
                    className: 'w-full',
                    value: r.config.fillOpacity ?? 0.3,
                    onChange: (o) => d({ fillOpacity: Number(o.target.value) })
                  }),
                  n.jsx('span', {
                    className: 'text-[11px] text-gray-400',
                    children: (r.config.fillOpacity ?? 0.3).toFixed(2)
                  })
                ]
              }),
            n.jsx('hr', { className: 'border-gray-100' }),
            n.jsx('p', {
              className: 'text-[10px] text-gray-400 uppercase tracking-wider font-semibold',
              children: 'Apariencia'
            }),
            n.jsxs('div', {
              children: [
                n.jsx('label', { className: 'field-label', children: 'Color principal' }),
                n.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    n.jsx('input', {
                      type: 'color',
                      className: 'w-10 h-9 rounded cursor-pointer',
                      value: r.config.color || '#ea580c',
                      onChange: (o) => d({ color: o.target.value })
                    }),
                    n.jsx('span', {
                      className: 'text-[12px] text-gray-400',
                      children: r.config.color || '#ea580c'
                    })
                  ]
                })
              ]
            }),
            (r.type === 'kpi' || D || S) &&
              n.jsxs('div', {
                children: [
                  n.jsx('label', { className: 'field-label', children: 'Tamaño fuente' }),
                  n.jsxs('select', {
                    className: 'field-input',
                    value: r.config.fontSize || 'md',
                    onChange: (o) => d({ fontSize: o.target.value }),
                    children: [
                      n.jsx('option', { value: 'sm', children: 'Pequeño' }),
                      n.jsx('option', { value: 'md', children: 'Mediano' }),
                      n.jsx('option', { value: 'lg', children: 'Grande' }),
                      n.jsx('option', { value: 'xl', children: 'Extra grande' })
                    ]
                  })
                ]
              }),
            (r.type === 'kpi' || D || S) &&
              n.jsxs('div', {
                children: [
                  n.jsx('label', { className: 'field-label', children: 'Alineación' }),
                  n.jsx('div', {
                    className: 'flex gap-1',
                    children: ['left', 'center', 'right'].map((o) =>
                      n.jsx(
                        'button',
                        {
                          type: 'button',
                          onClick: () => d({ textAlign: o }),
                          className: `flex-1 py-1.5 rounded text-[11px] font-medium ${r.config.textAlign === o || (!r.config.textAlign && o === 'center') ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`,
                          children: o === 'left' ? 'Izq' : o === 'center' ? 'Centro' : 'Der'
                        },
                        o
                      )
                    )
                  })
                ]
              }),
            !G &&
              n.jsxs('div', {
                className: 'flex gap-2',
                children: [
                  n.jsxs('div', {
                    className: 'flex-1',
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Fondo' }),
                      n.jsxs('div', {
                        className: 'flex items-center gap-1',
                        children: [
                          n.jsx('input', {
                            type: 'color',
                            className: 'w-8 h-8 rounded cursor-pointer',
                            value: r.config.bgColor || '#ffffff',
                            onChange: (o) => d({ bgColor: o.target.value })
                          }),
                          n.jsx('button', {
                            className: 'text-[10px] text-gray-400 hover:text-gray-600',
                            onClick: () => d({ bgColor: void 0 }),
                            children: 'reset'
                          })
                        ]
                      })
                    ]
                  }),
                  n.jsxs('div', {
                    className: 'flex-1',
                    children: [
                      n.jsx('label', { className: 'field-label', children: 'Borde' }),
                      n.jsxs('div', {
                        className: 'flex items-center gap-1',
                        children: [
                          n.jsx('input', {
                            type: 'color',
                            className: 'w-8 h-8 rounded cursor-pointer',
                            value: r.config.borderColor || '#e5e7eb',
                            onChange: (o) => d({ borderColor: o.target.value })
                          }),
                          n.jsx('input', {
                            type: 'number',
                            className: 'field-input w-14 text-[11px]',
                            value: r.config.borderWidth ?? 1,
                            onChange: (o) => d({ borderWidth: Number(o.target.value) }),
                            min: 0,
                            max: 8
                          })
                        ]
                      })
                    ]
                  })
                ]
              }),
            n.jsxs('div', {
              children: [
                n.jsx('label', { className: 'field-label', children: 'Radio bordes (px)' }),
                n.jsx('input', {
                  type: 'range',
                  min: '0',
                  max: '24',
                  className: 'w-full',
                  value: r.config.borderRadius ?? 12,
                  onChange: (o) => d({ borderRadius: Number(o.target.value) })
                }),
                n.jsxs('span', {
                  className: 'text-[11px] text-gray-400',
                  children: [r.config.borderRadius ?? 12, 'px']
                })
              ]
            }),
            f === 'array' &&
              !le &&
              n.jsxs('div', {
                children: [
                  n.jsx('label', { className: 'field-label', children: 'Items max' }),
                  n.jsx('input', {
                    type: 'number',
                    className: 'field-input',
                    value: r.config.maxItems || '',
                    onChange: (o) =>
                      d({ maxItems: o.target.value ? Number(o.target.value) : void 0 }),
                    placeholder: 'Sin limite'
                  })
                ]
              })
          ]
        })
      ]
    })
  });
}
function jo({ onAdd: e, onClose: t }) {
  const [a, s] = u.useState('type'),
    [r, l] = u.useState(null);
  return n.jsx('div', {
    className:
      'fixed inset-0 z-[200] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center',
    onClick: t,
    children: n.jsxs('div', {
      className: 'bg-white rounded-2xl shadow-xl w-[500px] max-w-[95vw] max-h-[80vh] overflow-auto',
      onClick: (c) => c.stopPropagation(),
      children: [
        n.jsxs('div', {
          className: 'sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between',
          children: [
            n.jsx('h2', {
              className: 'font-bold text-gray-800',
              children: a === 'type' ? 'Elegir tipo de widget' : 'Elegir fuente de datos'
            }),
            n.jsx('button', {
              onClick: t,
              className: 'text-gray-400 hover:text-gray-600 text-lg',
              children: 'X'
            })
          ]
        }),
        a === 'type' &&
          n.jsx('div', {
            className: 'p-4 grid grid-cols-2 gap-3',
            children: zn.map((c) =>
              n.jsxs(
                'button',
                {
                  onClick: () => {
                    (l(c.type), s('source'));
                  },
                  className:
                    'text-left p-4 rounded-xl border border-gray-200 hover:border-[#ea580c] hover:bg-orange-50/50 transition-all',
                  children: [
                    n.jsx('div', {
                      className:
                        'w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-mono font-bold text-gray-600 mb-2',
                      children: c.icon
                    }),
                    n.jsx('div', {
                      className: 'text-sm font-semibold text-gray-800',
                      children: c.label
                    }),
                    n.jsx('div', {
                      className: 'text-[11px] text-gray-400 mt-0.5',
                      children: c.description
                    })
                  ]
                },
                c.type
              )
            )
          }),
        a === 'source' &&
          r &&
          n.jsxs('div', {
            className: 'p-4 space-y-2',
            children: [
              n.jsx('button', {
                onClick: () => s('type'),
                className: 'text-[12px] text-blue-600 hover:text-blue-800 mb-2',
                children: '← Volver a tipos'
              }),
              kt.map((c) =>
                n.jsxs(
                  'button',
                  {
                    onClick: () => {
                      (e(r, c.key), t());
                    },
                    className:
                      'w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#ea580c] hover:bg-orange-50/50 transition-all',
                    children: [
                      n.jsx('div', {
                        className: 'text-sm font-semibold text-gray-800',
                        children: c.label
                      }),
                      n.jsxs('div', {
                        className: 'text-[10px] text-gray-400',
                        children: [
                          c.type === 'single' ? 'Valor unico' : 'Lista',
                          ' | ',
                          c.fields.map((i) => i.label).join(', ')
                        ]
                      })
                    ]
                  },
                  c.key
                )
              )
            ]
          })
      ]
    })
  });
}
function No({
  layouts: e,
  activeId: t,
  rol: a,
  onSelect: s,
  onCreate: r,
  onDelete: l,
  onRename: c,
  onSetMinRole: i,
  onClose: f
}) {
  const [h, d] = u.useState(null),
    [g, R] = u.useState(''),
    T = a === 'admin';
  return n.jsx('div', {
    className:
      'fixed inset-0 z-[200] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center',
    onClick: f,
    children: n.jsxs('div', {
      className: 'bg-white rounded-2xl shadow-xl w-[420px] max-w-[95vw] max-h-[70vh] overflow-auto',
      onClick: (b) => b.stopPropagation(),
      children: [
        n.jsxs('div', {
          className: 'sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between',
          children: [
            n.jsx('h2', { className: 'font-bold text-gray-800', children: 'Mis Dashboards' }),
            n.jsx('button', {
              onClick: f,
              className: 'text-gray-400 hover:text-gray-600 text-lg',
              children: 'X'
            })
          ]
        }),
        n.jsxs('div', {
          className: 'p-4 space-y-2',
          children: [
            n.jsx('p', {
              className: 'text-[11px] text-gray-400 mb-1',
              children: 'Compartidos entre todos los usuarios (guardados en Supabase).'
            }),
            e.map((b) => {
              const F = hn(a, b.minRoleEdit || 'supervisor');
              return n.jsxs(
                'div',
                {
                  className: `flex items-center gap-2 p-3 rounded-xl border transition-all ${b.id === t ? 'border-[#ea580c] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`,
                  children: [
                    h === b.id
                      ? n.jsx('input', {
                          autoFocus: !0,
                          className: 'flex-1 field-input text-sm',
                          value: g,
                          onChange: (O) => R(O.target.value),
                          onBlur: () => {
                            (c(b.id, g), d(null));
                          },
                          onKeyDown: (O) => {
                            O.key === 'Enter' && (c(b.id, g), d(null));
                          }
                        })
                      : n.jsxs('button', {
                          onClick: () => s(b.id),
                          className: 'flex-1 text-left min-w-0',
                          children: [
                            n.jsx('span', {
                              className: 'text-sm font-medium text-gray-800',
                              children: b.name
                            }),
                            n.jsxs('span', {
                              className: 'text-[10px] text-gray-400 ml-2',
                              children: [
                                (b.pages || []).reduce((O, M) => {
                                  var re;
                                  return O + (((re = M.widgets) == null ? void 0 : re.length) || 0);
                                }, 0),
                                ' widgets · ',
                                (b.pages || []).length,
                                ' hoja(s)'
                              ]
                            }),
                            n.jsxs('span', {
                              className: 'block text-[10px] text-gray-400 mt-0.5',
                              children: [
                                'Editan: ',
                                n.jsxs('span', {
                                  className: 'font-medium',
                                  children: [b.minRoleEdit || 'supervisor', '+']
                                }),
                                !F &&
                                  n.jsx('span', {
                                    className: 'text-amber-500 ml-1',
                                    children: '· solo lectura para ti'
                                  })
                              ]
                            })
                          ]
                        }),
                    T &&
                      n.jsxs('select', {
                        value: b.minRoleEdit || 'supervisor',
                        onChange: (O) => i(b.id, O.target.value),
                        className:
                          'text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-500',
                        title: 'Rol mínimo para editar',
                        children: [
                          n.jsx('option', { value: 'operador', children: 'operador+' }),
                          n.jsx('option', { value: 'supervisor', children: 'supervisor+' }),
                          n.jsx('option', { value: 'admin', children: 'admin' })
                        ]
                      }),
                    F &&
                      n.jsx('button', {
                        onClick: () => {
                          (d(b.id), R(b.name));
                        },
                        className: 'text-[11px] text-blue-500 hover:text-blue-700 px-1',
                        children: 'Renombrar'
                      }),
                    e.length > 1 &&
                      F &&
                      n.jsx('button', {
                        onClick: () => l(b.id),
                        className: 'text-[11px] text-red-400 hover:text-red-600 px-1',
                        children: 'Eliminar'
                      })
                  ]
                },
                b.id
              );
            }),
            n.jsx('button', {
              onClick: r,
              className:
                'w-full p-3 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-[#ea580c] hover:text-[#ea580c] transition-colors text-sm font-medium',
              children: '+ Nuevo Dashboard'
            })
          ]
        })
      ]
    })
  });
}
function ko(e, t) {
  var l, c;
  const a = e.toLowerCase(),
    s = [],
    r = (i) => {
      if (!i) return !1;
      const f = [
        'valueField',
        'whereField',
        'labelField',
        'xField',
        'rowField',
        'colField',
        'comparisonField',
        'trendField'
      ];
      for (const h of f) if (i[h] && String(i[h]).toLowerCase() === a) return !0;
      return !!(
        (Array.isArray(i.columns) && i.columns.some((h) => String(h.key).toLowerCase() === a)) ||
        (Array.isArray(i.yFields) && i.yFields.some((h) => String(h.key).toLowerCase() === a))
      );
    };
  for (const i of t) {
    const f =
      ((l = i.config) == null ? void 0 : l.pages) ||
      ((c = i.config) != null && c.widgets ? [{ name: 'Hoja 1', widgets: i.config.widgets }] : []);
    for (const h of f)
      for (const d of h.widgets || [])
        d.dataSource === 'operaciones' && r(d.config) && s.push(`${i.name} › ${d.title || d.type}`);
  }
  return s;
}
const Co = [
    { value: 'texto', label: 'Texto' },
    { value: 'numero', label: 'Número' },
    { value: 'fecha', label: 'Fecha' },
    { value: 'badge', label: 'Badge (semáforo)' }
  ],
  wo = [
    {
      label: 'Horas restantes',
      insert: 'HOURS_DIFF(NOW(), fecha_compromiso)',
      hint: 'horas hasta el compromiso'
    },
    {
      label: 'Prioridad',
      insert: 'PRIORIDAD_OPERACIONAL(fecha_compromiso, estado)',
      hint: 'CRITICA/ALTA/MEDIA/NORMAL'
    },
    {
      label: 'Riesgo OTIF',
      insert: 'RIESGO_OTIF(fecha_compromiso, estado)',
      hint: 'true si <24h y no entregado'
    },
    {
      label: 'OTIF status',
      insert: 'OTIF_STATUS(fecha_entrega, fecha_compromiso, estado)',
      hint: 'OK/FAIL/RISK/PEND'
    },
    {
      label: 'Antigüedad NV',
      insert: 'NV_ANTIGUEDAD(fecha_creacion)',
      hint: 'horas desde creación'
    },
    {
      label: 'Lead time',
      insert: 'DATEDIFF(fecha_aprobacion, fecha_entrega)',
      hint: 'días aprobación→entrega'
    },
    {
      label: 'Días hábiles',
      insert: 'BUSINESS_DAYS(fecha_aprobacion, fecha_compromiso)',
      hint: 'días hábiles entre fechas'
    },
    {
      label: 'IF / condición',
      insert: 'IF(estado = "Entregado", "ok", "pendiente")',
      hint: 'condición'
    }
  ];
function So(e) {
  const t = String(e).toUpperCase();
  return ['CRITICA', 'FAIL', 'TRUE', 'RIESGO', 'RISK'].includes(t)
    ? { bg: '#fef2f2', fg: '#b91c1c', dot: '#ef4444' }
    : ['ALTA', 'PEND', 'MEDIA'].includes(t)
      ? { bg: '#fffbeb', fg: '#b45309', dot: '#f59e0b' }
      : ['OK', 'NORMAL', 'FALSE', 'FINALIZADA'].includes(t)
        ? { bg: '#f0fdf4', fg: '#15803d', dot: '#22c55e' }
        : { bg: '#f3f4f6', fg: '#374151', dot: '#9ca3af' };
}
const sa = { nombre: '', formula: '', tipo: 'texto', descripcion: '', activo: !0 };
function Ro({ editable: e, onClose: t }) {
  const [a, s] = u.useState([]),
    [r, l] = u.useState([]),
    [c, i] = u.useState([]),
    [f, h] = u.useState(0),
    [d, g] = u.useState({ ...sa }),
    [R, T] = u.useState(!0),
    [b, F] = u.useState(!1),
    [O, M] = u.useState(''),
    { user: re } = ia(),
    se = (re == null ? void 0 : re.nombre) || '',
    ce = async () => {
      T(!0);
      const [o, k, x] = await Promise.all([xn(!0), er(25), Aa()]);
      (s(o), l(k), i(x), T(!1));
    };
  u.useEffect(() => {
    ce();
  }, []);
  const he = r[f] || {},
    m = u.useMemo(() => (d.formula.trim() ? $a(d.formula) : { ok: !1, error: '' }), [d.formula]),
    N = u.useMemo(() => {
      const o = new Set();
      return (
        Object.keys(he).forEach((k) => o.add(k.toLowerCase())),
        a.forEach((k) => {
          k.id !== d.id && o.add(k.nombre.toLowerCase());
        }),
        o
      );
    }, [he, a, d.id]),
    y = u.useMemo(() => (m.ok ? Ln(d.formula) : []), [d.formula, m.ok]),
    C = u.useMemo(
      () => (r.length === 0 ? [] : y.filter((o) => !N.has(o.toLowerCase()))),
      [y, N, r.length]
    ),
    w = u.useMemo(() => new Set(a.map((o) => o.nombre.toLowerCase())), [a]),
    v = u.useMemo(() => y.filter((o) => w.has(o.toLowerCase())), [y, w]),
    D = u.useMemo(
      () => (!d.formula.trim() || !m.ok ? null : Ba(d.formula, he)),
      [d.formula, m.ok, he]
    ),
    S = (o) => g((k) => ({ ...k, formula: k.formula ? `${k.formula} ${o}` : o })),
    _ = (o) =>
      g({
        id: o.id,
        nombre: o.nombre,
        formula: o.formula,
        tipo: o.tipo,
        descripcion: o.descripcion || '',
        activo: o.activo
      }),
    G = () => {
      (g({ ...sa }), M(''));
    },
    X = async () => {
      if ((M(''), !m.ok)) {
        M(m.error || 'Fórmula inválida');
        return;
      }
      F(!0);
      const o = await mo({ ...d, created_by: se });
      if ((F(!1), !o.ok)) {
        M(o.error || 'No se pudo guardar');
        return;
      }
      (G(), await ce());
    },
    le = async (o) => {
      const k = ko(o.nombre, c),
        x = a
          .filter(
            (J) =>
              J.id !== o.id &&
              Ln(J.formula).some((ke) => ke.toLowerCase() === o.nombre.toLowerCase())
          )
          .map((J) => J.nombre);
      let K = `¿Eliminar el campo calculado "${o.nombre}"?`;
      ((k.length || x.length) &&
        ((K += `

⚠ Afectará:`),
        x.forEach((J) => {
          K += `
• Campo calculado: ${J}`;
        }),
        k.forEach((J) => {
          K += `
• Widget: ${J}`;
        }),
        (K += `

Esos widgets/campos quedarán sin este dato.`)),
        confirm(K) && (await ho(o.id), d.id === o.id && G(), await ce()));
    };
  return n.jsx('div', {
    className:
      'fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4',
    onClick: t,
    children: n.jsxs('div', {
      className:
        'bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col',
      onClick: (o) => o.stopPropagation(),
      children: [
        n.jsxs('div', {
          className: 'flex items-center justify-between px-5 py-3.5 border-b border-gray-100',
          children: [
            n.jsxs('div', {
              children: [
                n.jsx('h2', {
                  className: 'text-[15px] font-bold text-gray-900',
                  children: 'Campos Calculados'
                }),
                n.jsx('p', {
                  className: 'text-[11px] text-gray-400',
                  children:
                    'Define métricas con fórmulas — se vuelven columnas disponibles para tus widgets.'
                })
              ]
            }),
            n.jsx('button', {
              onClick: t,
              className: 'w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 text-lg',
              children: '✕'
            })
          ]
        }),
        n.jsxs('div', {
          className: 'flex-1 overflow-auto grid grid-cols-1 md:grid-cols-[260px_1fr]',
          children: [
            n.jsxs('aside', {
              className: 'border-r border-gray-100 p-3 bg-gray-50/50',
              children: [
                n.jsxs('div', {
                  className: 'flex items-center justify-between mb-2',
                  children: [
                    n.jsxs('span', {
                      className: 'text-[11px] font-semibold uppercase tracking-wide text-gray-400',
                      children: ['Campos (', a.length, ')']
                    }),
                    e &&
                      n.jsx('button', {
                        onClick: G,
                        className: 'text-[11px] text-orange-600 font-medium hover:underline',
                        children: '+ Nuevo'
                      })
                  ]
                }),
                R
                  ? n.jsx('p', {
                      className: 'text-[12px] text-gray-400 p-2',
                      children: 'Cargando…'
                    })
                  : a.length === 0
                    ? n.jsx('p', {
                        className: 'text-[12px] text-gray-400 p-2',
                        children: 'Aún no hay campos. Crea el primero →'
                      })
                    : n.jsx('ul', {
                        className: 'space-y-1',
                        children: a.map((o) =>
                          n.jsx(
                            'li',
                            {
                              children: n.jsxs('button', {
                                onClick: () => _(o),
                                className: `w-full text-left px-2.5 py-2 rounded-lg border text-[12px] transition-colors ${d.id === o.id ? 'border-orange-300 bg-orange-50' : 'border-transparent hover:bg-white hover:border-gray-200'}`,
                                children: [
                                  n.jsxs('div', {
                                    className: 'flex items-center gap-1.5',
                                    children: [
                                      n.jsx('code', {
                                        className: 'font-semibold text-gray-800',
                                        children: o.nombre
                                      }),
                                      !o.activo &&
                                        n.jsx('span', {
                                          className: 'text-[9px] text-gray-400',
                                          children: '(inactivo)'
                                        }),
                                      n.jsx('span', {
                                        className: 'ml-auto text-[9px] uppercase text-gray-400',
                                        children: o.tipo
                                      })
                                    ]
                                  }),
                                  o.descripcion &&
                                    n.jsx('div', {
                                      className: 'text-[10px] text-gray-400 truncate mt-0.5',
                                      children: o.descripcion
                                    }),
                                  o.created_by &&
                                    n.jsxs('div', {
                                      className: 'text-[9px] text-gray-300 mt-0.5',
                                      children: ['por ', o.created_by]
                                    })
                                ]
                              })
                            },
                            o.id
                          )
                        )
                      })
              ]
            }),
            n.jsxs('section', {
              className: 'p-5 space-y-4',
              children: [
                !e &&
                  n.jsx('div', {
                    className:
                      'text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2',
                    children:
                      'Modo solo lectura. Necesitas rol supervisor o admin para editar campos calculados.'
                  }),
                n.jsxs('div', {
                  className: 'grid grid-cols-2 gap-3',
                  children: [
                    n.jsxs('div', {
                      children: [
                        n.jsx('label', {
                          className: 'block text-[11px] font-medium text-gray-500 mb-1',
                          children: 'Nombre *'
                        }),
                        n.jsx('input', {
                          value: d.nombre,
                          onChange: (o) => g({ ...d, nombre: o.target.value }),
                          placeholder: 'riesgo_otif',
                          disabled: !e,
                          className:
                            'w-full h-9 px-2.5 text-[13px] font-mono rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200'
                        })
                      ]
                    }),
                    n.jsxs('div', {
                      children: [
                        n.jsx('label', {
                          className: 'block text-[11px] font-medium text-gray-500 mb-1',
                          children: 'Tipo'
                        }),
                        n.jsx('select', {
                          value: d.tipo,
                          onChange: (o) => g({ ...d, tipo: o.target.value }),
                          disabled: !e,
                          className:
                            'w-full h-9 px-2 text-[13px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white',
                          children: Co.map((o) =>
                            n.jsx('option', { value: o.value, children: o.label }, o.value)
                          )
                        })
                      ]
                    })
                  ]
                }),
                n.jsxs('div', {
                  children: [
                    n.jsx('label', {
                      className: 'block text-[11px] font-medium text-gray-500 mb-1',
                      children: 'Descripción'
                    }),
                    n.jsx('input', {
                      value: d.descripcion,
                      onChange: (o) => g({ ...d, descripcion: o.target.value }),
                      placeholder: 'Detecta NV con riesgo de incumplir OTIF',
                      disabled: !e,
                      className:
                        'w-full h-9 px-2.5 text-[13px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200'
                    })
                  ]
                }),
                n.jsxs('div', {
                  children: [
                    n.jsx('label', {
                      className: 'block text-[11px] font-medium text-gray-500 mb-1',
                      children: 'Fórmula *'
                    }),
                    n.jsx('textarea', {
                      value: d.formula,
                      onChange: (o) => g({ ...d, formula: o.target.value }),
                      placeholder: 'IF(RIESGO_OTIF(fecha_compromiso, estado), "RIESGO", "OK")',
                      disabled: !e,
                      rows: 3,
                      className:
                        'w-full px-2.5 py-2 text-[13px] font-mono rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-y'
                    }),
                    d.formula.trim() &&
                      (m.ok
                        ? n.jsx('p', {
                            className: 'text-[11px] text-emerald-600 mt-1',
                            children: '✓ Fórmula válida'
                          })
                        : n.jsxs('p', {
                            className: 'text-[11px] text-red-600 mt-1',
                            children: ['✕ ', m.error || 'Fórmula inválida']
                          })),
                    m.ok &&
                      C.length > 0 &&
                      n.jsxs('p', {
                        className: 'text-[11px] text-amber-600 mt-1',
                        children: [
                          '⚠ Campo(s) no reconocido(s): ',
                          n.jsx('b', { children: C.join(', ') }),
                          ' — revisa el nombre (devolverá vacío).'
                        ]
                      }),
                    m.ok &&
                      v.length > 0 &&
                      n.jsxs('p', {
                        className: 'text-[11px] text-violet-600 mt-1',
                        children: ['⛓ Depende de: ', n.jsx('b', { children: v.join(', ') })]
                      }),
                    e &&
                      n.jsx('div', {
                        className: 'flex flex-wrap gap-1.5 mt-2',
                        children: wo.map((o) =>
                          n.jsxs(
                            'button',
                            {
                              type: 'button',
                              onClick: () => S(o.insert),
                              title: o.hint,
                              className:
                                'px-2 py-1 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700',
                              children: ['+ ', o.label]
                            },
                            o.label
                          )
                        )
                      })
                  ]
                }),
                n.jsxs('div', {
                  className: 'rounded-xl border border-gray-200 bg-gray-50 p-3',
                  children: [
                    n.jsxs('div', {
                      className: 'flex items-center gap-2 mb-2',
                      children: [
                        n.jsx('span', {
                          className:
                            'text-[11px] font-semibold uppercase tracking-wide text-gray-400',
                          children: 'Vista previa'
                        }),
                        r.length > 0 &&
                          n.jsx('select', {
                            value: f,
                            onChange: (o) => h(Number(o.target.value)),
                            className:
                              'ml-auto h-7 px-2 text-[11px] rounded-md border border-gray-200 bg-white',
                            children: r.map((o, k) =>
                              n.jsxs(
                                'option',
                                { value: k, children: ['NV ', o.nv, ' · ', o.estado] },
                                k
                              )
                            )
                          })
                      ]
                    }),
                    d.formula.trim()
                      ? m.ok
                        ? D && !D.ok
                          ? n.jsxs('p', {
                              className: 'text-[12px] text-red-500',
                              children: ['Error: ', D.error]
                            })
                          : n.jsxs('div', {
                              className: 'flex items-center gap-2 text-[13px]',
                              children: [
                                n.jsxs('code', {
                                  className: 'text-gray-500',
                                  children: [d.nombre || 'resultado', ' =']
                                }),
                                d.tipo === 'badge'
                                  ? (() => {
                                      const o = So(D == null ? void 0 : D.value);
                                      return n.jsxs('span', {
                                        className:
                                          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold',
                                        style: { background: o.bg, color: o.fg },
                                        children: [
                                          n.jsx('span', {
                                            className: 'w-2 h-2 rounded-full',
                                            style: { background: o.dot }
                                          }),
                                          String(D == null ? void 0 : D.value)
                                        ]
                                      });
                                    })()
                                  : n.jsx('span', {
                                      className: 'font-semibold text-gray-900',
                                      children: String(D == null ? void 0 : D.value)
                                    })
                              ]
                            })
                        : n.jsx('p', {
                            className: 'text-[12px] text-red-500',
                            children: 'Corrige la fórmula para previsualizar.'
                          })
                      : n.jsx('p', {
                          className: 'text-[12px] text-gray-400',
                          children: 'Escribe una fórmula para ver el resultado.'
                        })
                  ]
                }),
                O && n.jsx('p', { className: 'text-[12px] text-red-600', children: O }),
                e &&
                  n.jsxs('div', {
                    className: 'flex items-center justify-between pt-1',
                    children: [
                      n.jsx('div', {
                        children:
                          d.id != null &&
                          n.jsx('button', {
                            onClick: () => le(a.find((o) => o.id === d.id)),
                            className: 'text-[12px] text-red-500 hover:text-red-700 font-medium',
                            children: 'Eliminar'
                          })
                      }),
                      n.jsxs('div', {
                        className: 'flex items-center gap-2',
                        children: [
                          d.id != null &&
                            n.jsx('button', {
                              onClick: G,
                              className: 'text-[12px] text-gray-500 hover:text-gray-900',
                              children: 'Cancelar edición'
                            }),
                          n.jsx('button', {
                            onClick: X,
                            disabled: b || !m.ok || !d.nombre.trim(),
                            className:
                              'px-4 py-2 rounded-lg bg-orange-600 text-white text-[13px] font-semibold hover:bg-orange-700 disabled:opacity-40',
                            children: b
                              ? 'Guardando…'
                              : d.id != null
                                ? 'Guardar cambios'
                                : 'Crear campo'
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
    })
  });
}
const Do = [
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: '6m', label: '6 meses' },
  { key: '1y', label: '1 año' },
  { key: 'ytd', label: 'Año actual' },
  { key: 'all', label: 'Todo' },
  { key: 'custom', label: 'Personalizado' }
];
function Eo(e) {
  const t = new Date(),
    a = t.toISOString().split('T')[0],
    s = new Date(t);
  switch (e) {
    case '7d':
      s.setDate(s.getDate() - 7);
      break;
    case '30d':
      s.setDate(s.getDate() - 30);
      break;
    case '90d':
      s.setDate(s.getDate() - 90);
      break;
    case '6m':
      s.setMonth(s.getMonth() - 6);
      break;
    case '1y':
      s.setFullYear(s.getFullYear() - 1);
      break;
    case 'ytd':
      return { from: `${t.getFullYear()}-01-01`, to: a };
    case 'all':
      return { from: '2020-01-01', to: a };
    default:
      return { from: '2020-01-01', to: a };
  }
  return { from: s.toISOString().split('T')[0], to: a };
}
const Ma = 'ptm_builder_active';
function Fo() {
  return typeof window > 'u' ? null : localStorage.getItem(Ma);
}
function jt(e) {
  localStorage.setItem(Ma, e);
}
function Mt(e) {
  return {
    id: e.id,
    name: e.name,
    owner: e.owner ?? null,
    minRoleEdit: e.minRoleEdit || 'supervisor',
    config: { pages: e.pages }
  };
}
function Oo(e) {
  var a, s, r;
  const t =
    Array.isArray((a = e.config) == null ? void 0 : a.pages) && e.config.pages.length > 0
      ? e.config.pages.map((l, c) => ({
          id: l.id || st(),
          name: l.name || `Hoja ${c + 1}`,
          widgets: l.widgets || [],
          gridLayout: l.gridLayout || []
        }))
      : [
          {
            id: st(),
            name: 'Hoja 1',
            widgets: ((s = e.config) == null ? void 0 : s.widgets) || [],
            gridLayout: ((r = e.config) == null ? void 0 : r.gridLayout) || []
          }
        ];
  return { id: e.id, name: e.name, owner: e.owner, minRoleEdit: e.minRoleEdit, pages: t };
}
function $o() {
  const [e, t] = u.useState(!1),
    [a, s] = u.useState([]),
    [r, l] = u.useState(''),
    [c, i] = u.useState(''),
    [f, h] = u.useState(null),
    [d, g] = u.useState(!1),
    [R, T] = u.useState(null),
    [b, F] = u.useState(!1),
    [O, M] = u.useState(!1),
    [re, se] = u.useState(null),
    [ce, he] = u.useState(!0),
    [m, N] = u.useState([]),
    [y, C] = u.useState([]),
    [w, v] = u.useState('6m'),
    [D, S] = u.useState(''),
    [_, G] = u.useState(''),
    { user: X, hasPermission: le } = ia(),
    o = le('manage_panel') ? 'admin' : 'viewer',
    [k, x] = u.useState('idle'),
    { width: K, containerRef: J } = Kr({ initialWidth: 1200 }),
    ke = u.useRef({}),
    Re = u.useCallback((p) => {
      const E = p.id;
      (ke.current[E] && clearTimeout(ke.current[E]),
        x('saving'),
        (ke.current[E] = setTimeout(async () => {
          const A = await At(Mt(p));
          (x(A ? 'saved' : 'error'), A && setTimeout(() => x('idle'), 1500));
        }, 700)));
    }, []);
  u.useEffect(() => {
    let p = !1;
    return (
      (async () => {
        const E = await Aa();
        if (p) return;
        if (E.length > 0) {
          const W = E.map(Oo);
          s(W);
          const P = Fo();
          l(P && W.find((Ae) => Ae.id === P) ? P : W[0].id);
          return;
        }
        let A = [];
        try {
          const W = localStorage.getItem('ptm_builder_layouts');
          W && (A = JSON.parse(W));
        } catch {}
        const I =
          A.length > 0
            ? A.map((W) =>
                W.pages
                  ? W
                  : {
                      ...W,
                      pages: [
                        {
                          id: st(),
                          name: 'Hoja 1',
                          widgets: W.widgets || [],
                          gridLayout: W.gridLayout || []
                        }
                      ]
                    }
              )
            : [
                {
                  id: 'dash_' + Date.now(),
                  name: 'Mi Dashboard',
                  owner: (X == null ? void 0 : X.nombre) || '',
                  minRoleEdit: 'supervisor',
                  pages: [{ id: st(), name: 'Hoja 1', widgets: [], gridLayout: [] }]
                }
              ];
        (s(I), l(I[0].id), jt(I[0].id));
        for (const W of I) await At(Mt(W));
        if (A.length > 0)
          try {
            localStorage.removeItem('ptm_builder_layouts');
          } catch {}
      })(),
      () => {
        p = !0;
      }
    );
  }, []);
  const z = u.useMemo(() => a.find((p) => p.id === r) || null, [a, r]),
    Q = u.useMemo(() => (z ? hn(o, z.minRoleEdit || 'supervisor') : !1), [z, o]),
    L = u.useMemo(
      () => (!z || z.pages.length === 0 ? null : z.pages.find((p) => p.id === c) || z.pages[0]),
      [z, c]
    );
  u.useEffect(() => {
    var p;
    z && (z.pages.some((E) => E.id === c) || i(((p = z.pages[0]) == null ? void 0 : p.id) || ''));
  }, [r, z, c]);
  const fe = u.useCallback(
      (p) => {
        s((E) => {
          const A = E.map((W) => (W.id === r ? { ...W, ...p } : W)),
            I = A.find((W) => W.id === r);
          return (I && Re(I), A);
        });
      },
      [r, Re]
    ),
    U = u.useCallback(
      (p) => {
        s((E) => {
          const A = L == null ? void 0 : L.id,
            I = E.map((P) =>
              P.id !== r
                ? P
                : { ...P, pages: P.pages.map((Ae) => (Ae.id === A ? { ...Ae, ...p } : Ae)) }
            ),
            W = I.find((P) => P.id === r);
          return (W && Re(W), I);
        });
      },
      [r, L, Re]
    ),
    Ce = u.useCallback(
      (p) => {
        hn(p, (z == null ? void 0 : z.minRoleEdit) || 'supervisor') || t(!1);
      },
      [z]
    ),
    Y = u.useMemo(() => (w === 'custom' && D && _ ? { from: D, to: _ } : Eo(w)), [w, D, _]),
    be = u.useCallback(async () => {
      he(!0);
      try {
        const [p, E, A, I, W] = await Promise.all([tr(Y.from, Y.to), nr(), ar(6), xn(), rr()]);
        (se({ ...p, auditKpis: E.operadores, tendencia: A }), N(I), C(W));
      } catch (p) {
        console.error('Error loading builder data:', p);
      }
      he(!1);
    }, [Y]),
    we = u.useCallback(async () => {
      try {
        N(await xn());
      } catch {}
    }, []),
    Be = u.useMemo(() => Va(y, m), [y, m]),
    Ee = u.useMemo(() => m.map((p) => ({ nombre: p.nombre, tipo: p.tipo })), [m]),
    xe = u.useMemo(() => re && { ...re, operaciones: Be, _calcFields: Ee }, [re, Be, Ee]);
  u.useEffect(() => {
    be();
  }, [be]);
  const Fe = u.useCallback(
      (p, E) => {
        var Z, ee, ue, ae, ye, je, Se, Ne, Pe, Le, Ve;
        if (!z || !L) return;
        const A = zn.find((H) => H.type === p),
          I = kt.find((H) => H.key === E),
          W = He(),
          P = { color: '#ea580c' };
        if (
          (p === 'kpi' && I.type === 'array'
            ? ((P.agg = 'count'), (P.format = 'number'))
            : p === 'kpi' &&
              I.fields.length > 0 &&
              ((P.valueField = I.fields[0].key),
              (P.format = I.fields[0].type === 'percent' ? 'percent' : 'number')),
          ['bar-chart', 'line-chart'].includes(p) &&
            I.type === 'array' &&
            ((P.xField =
              ((Z = I.fields.find((H) => H.type === 'string')) == null ? void 0 : Z.key) ||
              I.fields[0].key),
            (P.yFields = I.fields
              .filter((H) => H.type === 'number' || H.type === 'percent')
              .slice(0, 2)
              .map((H, j) => ({ key: H.key, label: H.label, color: gn(j) })))),
          [
            'pie-chart',
            'donut-chart',
            'horizontal-bars',
            'stat-list',
            'funnel',
            'timeline'
          ].includes(p) &&
            I.type === 'array' &&
            ((P.labelField =
              ((ee = I.fields.find((H) => H.type === 'string')) == null ? void 0 : ee.key) ||
              I.fields[0].key),
            (P.valueField =
              ((ue = I.fields.find((H) => H.type === 'number')) == null ? void 0 : ue.key) ||
              ((ae = I.fields[1]) == null ? void 0 : ae.key))),
          p === 'gauge')
        ) {
          const H =
            I.fields.find((j) => j.type === 'percent') || I.fields.find((j) => j.type === 'number');
          ((P.valueField = H == null ? void 0 : H.key),
            (P.min = 0),
            (P.max = 100),
            (P.format = 'percent'));
        }
        if (p === 'semaforo') {
          const H =
            I.fields.find((j) => j.type === 'percent') || I.fields.find((j) => j.type === 'number');
          ((P.valueField = H == null ? void 0 : H.key),
            (P.format = (H == null ? void 0 : H.type) === 'percent' ? 'percent' : 'number'),
            (P.higherIsBetter = !0),
            (P.okThreshold = 85),
            (P.critThreshold = 50));
        }
        if (p === 'heatmap') {
          const H = I.fields.filter((j) => j.type === 'string');
          ((P.rowField = (ye = H[0]) == null ? void 0 : ye.key),
            (P.colField =
              ((je = H[1]) == null ? void 0 : je.key) || ((Se = H[0]) == null ? void 0 : Se.key)),
            (P.valueField =
              (Ne = I.fields.find((j) => j.type === 'number')) == null ? void 0 : Ne.key));
        }
        (p === 'table' &&
          (P.columns = I.fields.slice(0, 5).map((H) => ({ key: H.key, label: H.label }))),
          p === 'area-chart' &&
            I.type === 'array' &&
            ((P.xField =
              ((Pe = I.fields.find((H) => H.type === 'string')) == null ? void 0 : Pe.key) ||
              I.fields[0].key),
            (P.yFields = I.fields
              .filter((H) => H.type === 'number' || H.type === 'percent')
              .slice(0, 2)
              .map((H, j) => ({ key: H.key, label: H.label, color: gn(j) }))),
            (P.fillOpacity = 0.3)),
          p === 'scorecard' &&
            ((P.valueField = (Le = I.fields[0]) == null ? void 0 : Le.key),
            (P.format =
              ((Ve = I.fields[0]) == null ? void 0 : Ve.type) === 'percent'
                ? 'percent'
                : 'number')),
          p === 'text' && (P.content = 'Título o nota'),
          p === 'image' && (P.imageFit = 'contain'));
        const Ae = { id: W, type: p, title: I.label, dataSource: E, config: P },
          $e = L.gridLayout.reduce((H, j) => Math.max(H, j.y + j.h), 0),
          ht = { i: W, x: 0, y: $e, w: A.defaultW, h: A.defaultH, minW: A.minW, minH: A.minH };
        (U({ widgets: [...L.widgets, Ae], gridLayout: [...L.gridLayout, ht] }), T(W));
      },
      [z, L, U]
    ),
    et = u.useCallback(
      (p) => {
        L &&
          U({
            widgets: L.widgets.filter((E) => E.id !== p),
            gridLayout: L.gridLayout.filter((E) => E.i !== p)
          });
      },
      [L, U]
    ),
    de = u.useCallback(
      (p) => {
        L && (U({ widgets: L.widgets.map((E) => (E.id === p.id ? p : E)) }), T(null));
      },
      [L, U]
    ),
    oe = u.useCallback(
      (p) => {
        if (!L || !e) return;
        const E = Array.from(p).map((A) => ({
          i: A.i,
          x: A.x,
          y: A.y,
          w: A.w,
          h: A.h,
          minW: A.minW,
          minH: A.minH
        }));
        U({ gridLayout: E });
      },
      [L, e, U]
    ),
    Oe = u.useCallback(() => {
      if (!z) return;
      const p = { id: st(), name: `Hoja ${z.pages.length + 1}`, widgets: [], gridLayout: [] };
      (fe({ pages: [...z.pages, p] }), i(p.id));
    }, [z, fe]),
    ve = u.useCallback(
      (p, E) => {
        z && fe({ pages: z.pages.map((A) => (A.id === p ? { ...A, name: E } : A)) });
      },
      [z, fe]
    ),
    Me = u.useCallback(
      (p) => {
        if (!z || z.pages.length <= 1 || !confirm('¿Eliminar esta hoja y todos sus widgets?'))
          return;
        const E = z.pages.filter((A) => A.id !== p);
        (fe({ pages: E }), c === p && i(E[0].id));
      },
      [z, c, fe]
    ),
    mt = u.useCallback(() => {
      if (!z) return;
      const p = (W, P, Ae, $e) => ({
          id: He(),
          type: 'semaforo',
          title: W,
          dataSource: P,
          config: {
            valueField: Ae,
            format: 'percent',
            higherIsBetter: !0,
            okThreshold: 85,
            critThreshold: 60,
            ...$e
          }
        }),
        E = [
          p('Estado Cumplimiento', 'cumplimientoNV', 'pct', {
            okThreshold: 90,
            critThreshold: 70,
            trendField: 'pctATiempo'
          }),
          p('OTIF', 'otif', 'pct', { okThreshold: 90, critThreshold: 70, trendField: 'otif' }),
          p('Fill Rate', 'fillRate', 'pct', { okThreshold: 85, critThreshold: 60 }),
          p('Tardanza Prom (días)', 'kpis', 'leadTimeTardanza', {
            format: 'days',
            higherIsBetter: !1,
            okThreshold: 1,
            critThreshold: 5,
            trendField: 'leadTime'
          }),
          {
            id: He(),
            type: 'horizontal-bars',
            title: 'NV en riesgo por estado',
            dataSource: 'alertasOperacionales',
            config: { labelField: 'estado', valueField: 'cantidad', color: '#dc2626' }
          },
          {
            id: He(),
            type: 'line-chart',
            title: 'Tendencia % A Tiempo / OTIF',
            dataSource: 'tendencia',
            config: {
              xField: 'label',
              yFields: [
                { key: 'pctATiempo', label: '% A Tiempo', color: '#2563eb' },
                { key: 'otif', label: 'OTIF', color: '#16a34a' }
              ]
            }
          }
        ],
        A = [
          { i: E[0].id, x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
          { i: E[1].id, x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
          { i: E[2].id, x: 6, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
          { i: E[3].id, x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
          { i: E[4].id, x: 0, y: 3, w: 6, h: 5, minW: 4, minH: 3 },
          { i: E[5].id, x: 6, y: 3, w: 6, h: 5, minW: 4, minH: 4 }
        ],
        I = { id: st(), name: 'Cumplimiento', widgets: E, gridLayout: A };
      (fe({ pages: [...z.pages, I] }), i(I.id));
    }, [z, fe]),
    We = u.useCallback(() => {
      if (!z) return;
      const p = [
          {
            id: He(),
            type: 'semaforo',
            title: 'Estado Cumplimiento',
            dataSource: 'cumplimientoNV',
            config: {
              valueField: 'pct',
              format: 'percent',
              higherIsBetter: !0,
              okThreshold: 90,
              critThreshold: 70,
              trendField: 'pctATiempo'
            }
          },
          {
            id: He(),
            type: 'gauge',
            title: 'Fill Rate',
            dataSource: 'fillRate',
            config: { valueField: 'pct', format: 'percent', min: 0, max: 100 }
          },
          {
            id: He(),
            type: 'semaforo',
            title: 'Lead Time Promedio',
            dataSource: 'kpis',
            config: {
              valueField: 'leadTimeTardanza',
              format: 'days',
              higherIsBetter: !1,
              okThreshold: 1,
              critThreshold: 5,
              trendField: 'leadTime',
              suffix: ' días'
            }
          },
          {
            id: He(),
            type: 'scorecard',
            title: 'Tardanza Promedio',
            dataSource: 'kpis',
            config: {
              valueField: 'leadTimeTardanza',
              format: 'days',
              suffix: ' días',
              color: '#dc2626',
              icon: '⏱'
            }
          },
          {
            id: He(),
            type: 'donut-chart',
            title: 'Fecha Compromiso vs Total NV',
            dataSource: 'cumplimientoDetalle',
            config: {
              labelField: 'label',
              valueField: 'valor',
              yFields: [{ key: 'valor', label: 'Cantidad', color: '#16a34a' }],
              colorField: 'label'
            }
          },
          {
            id: He(),
            type: 'horizontal-bars',
            title: 'NV en Riesgo vs Fecha Compromiso',
            dataSource: 'riesgoCompromiso',
            config: { labelField: 'rango', valueField: 'cantidad', color: '#dc2626' }
          },
          {
            id: He(),
            type: 'bar-chart',
            title: 'Lead Time Semanal',
            dataSource: 'leadTimeSemanal',
            config: {
              xField: 'semana',
              yFields: [
                { key: 'dias', label: 'Días promedio', color: '#f59e0b' },
                { key: 'pctAtiempo', label: '% A Tiempo', color: '#16a34a' }
              ]
            }
          },
          {
            id: He(),
            type: 'area-chart',
            title: 'Tardanza Semanal',
            dataSource: 'weeklyTrend',
            config: {
              xField: 'semana',
              yFields: [{ key: 'tardanza', label: 'Tardanza (días)', color: '#dc2626' }],
              fillOpacity: 0.3
            }
          },
          {
            id: He(),
            type: 'line-chart',
            title: 'Tendencia % A Tiempo / OTIF',
            dataSource: 'tendencia',
            config: {
              xField: 'label',
              yFields: [
                { key: 'pctATiempo', label: '% A Tiempo', color: '#2563eb' },
                { key: 'otif', label: 'OTIF', color: '#16a34a' }
              ]
            }
          }
        ],
        E = [
          { i: p[0].id, x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
          { i: p[1].id, x: 3, y: 0, w: 3, h: 4, minW: 3, minH: 3 },
          { i: p[2].id, x: 6, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
          { i: p[3].id, x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
          { i: p[4].id, x: 0, y: 4, w: 5, h: 5, minW: 3, minH: 4 },
          { i: p[5].id, x: 5, y: 4, w: 7, h: 5, minW: 4, minH: 3 },
          { i: p[6].id, x: 0, y: 9, w: 6, h: 5, minW: 4, minH: 4 },
          { i: p[7].id, x: 6, y: 9, w: 6, h: 5, minW: 4, minH: 4 },
          { i: p[8].id, x: 0, y: 14, w: 12, h: 5, minW: 4, minH: 4 }
        ],
        A = { id: st(), name: 'Gráficos Operacionales', widgets: p, gridLayout: E };
      (fe({ pages: [...z.pages, A] }), i(A.id));
    }, [z, fe]),
    tt = (p) => {
      (l(p), jt(p), F(!1), t(!1));
    },
    Ye = async () => {
      const p = {
        id: 'dash_' + Date.now(),
        name: `Dashboard ${a.length + 1}`,
        owner: (X == null ? void 0 : X.nombre) || '',
        minRoleEdit: 'supervisor',
        pages: [{ id: st(), name: 'Hoja 1', widgets: [], gridLayout: [] }]
      };
      (s((E) => [...E, p]), l(p.id), i(p.pages[0].id), jt(p.id), F(!1), await At(Mt(p)));
    },
    _e = async (p) => {
      const E = a.filter((A) => A.id !== p);
      E.length !== 0 && (s(E), r === p && (l(E[0].id), jt(E[0].id)), await po(p));
    },
    nt = (p, E) => {
      s((A) => {
        const I = A.map((P) => (P.id === p ? { ...P, name: E } : P)),
          W = I.find((P) => P.id === p);
        return (W && Re(W), I);
      });
    },
    at = (p, E) => {
      s((A) => {
        const I = A.map((P) => (P.id === p ? { ...P, minRoleEdit: E } : P)),
          W = I.find((P) => P.id === p);
        return (W && Re(W), I);
      });
    },
    Xe = async () => {
      if (!z) return;
      const p = {
        ...JSON.parse(JSON.stringify(z)),
        id: 'dash_' + Date.now(),
        name: z.name + ' (copia)',
        owner: (X == null ? void 0 : X.nombre) || ''
      };
      (s((E) => [...E, p]), l(p.id), jt(p.id), await At(Mt(p)));
    },
    Ie = R ? (L == null ? void 0 : L.widgets.find((p) => p.id === R)) : null;
  return ce
    ? n.jsx('div', {
        className: 'min-h-screen flex items-center justify-center bg-gray-50',
        children: n.jsxs('div', {
          className: 'text-center',
          children: [
            n.jsx('div', {
              className:
                'w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'
            }),
            n.jsx('p', { className: 'text-gray-500', children: 'Cargando datos...' })
          ]
        })
      })
    : n.jsxs('div', {
        className: 'min-h-screen bg-gray-50',
        children: [
          n.jsx('header', {
            className: 'bg-white border-b border-gray-200 sticky top-0 z-50',
            children: n.jsxs('div', {
              className: 'max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between',
              children: [
                n.jsxs('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    n.jsx('div', {
                      className:
                        'w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm',
                      style: { background: 'linear-gradient(135deg, #ea580c, #c2410c)' },
                      children: 'PTM'
                    }),
                    n.jsxs('div', {
                      children: [
                        n.jsxs('h1', {
                          className: 'text-base font-black text-slate-800 tracking-tight',
                          children: [
                            'Dashboard ',
                            n.jsx('span', { className: 'text-orange-600', children: 'Builder' })
                          ]
                        }),
                        n.jsxs('p', {
                          className: 'text-[10px] text-gray-400 uppercase tracking-wide',
                          children: [
                            (z == null ? void 0 : z.name) || '—',
                            ' · ',
                            (L == null ? void 0 : L.name) || '',
                            ' · ',
                            (L == null ? void 0 : L.widgets.length) || 0,
                            ' widgets'
                          ]
                        })
                      ]
                    })
                  ]
                }),
                n.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    n.jsx('span', {
                      className: 'text-[11px] w-14 text-right',
                      style: { color: k === 'error' ? '#c62828' : '#9ca3af' },
                      children:
                        k === 'saving'
                          ? 'Guardando…'
                          : k === 'saved'
                            ? 'Guardado ✓'
                            : k === 'error'
                              ? 'Error'
                              : ''
                    }),
                    n.jsxs('select', {
                      value: o,
                      onChange: (p) => Ce(p.target.value),
                      className:
                        'px-2 py-1.5 text-[12px] rounded-lg border border-gray-200 text-gray-600 bg-white',
                      title: 'Tu rol (decide qué dashboards puedes editar)',
                      children: [
                        n.jsx('option', { value: 'operador', children: 'Operador' }),
                        n.jsx('option', { value: 'supervisor', children: 'Supervisor' }),
                        n.jsx('option', { value: 'admin', children: 'Admin' })
                      ]
                    }),
                    n.jsx('button', {
                      onClick: () => F(!0),
                      className:
                        'px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium',
                      children: 'Dashboards'
                    }),
                    Q &&
                      n.jsx('button', {
                        onClick: Xe,
                        className:
                          'px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium',
                        children: 'Duplicar'
                      }),
                    e &&
                      Q &&
                      n.jsx('button', {
                        onClick: mt,
                        className:
                          'px-3 py-1.5 text-[12px] rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 font-medium',
                        title:
                          "Crea una hoja 'Cumplimiento' con semáforos estándar + riesgo + tendencia",
                        children: 'Plantilla'
                      }),
                    e &&
                      Q &&
                      n.jsx('button', {
                        onClick: We,
                        className:
                          'px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 font-medium transition-colors',
                        title:
                          'Crea una hoja con 6 gráficos: Cumplimiento, Fill Rate, Lead Time, Tardanza, NV en Riesgo',
                        children: 'Gráficos'
                      }),
                    e &&
                      Q &&
                      n.jsx('button', {
                        onClick: () => M(!0),
                        className:
                          'px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 font-medium transition-colors',
                        title:
                          'Define métricas con fórmulas (HORAS_RESTANTES, PRIORIDAD, RIESGO_OTIF…)',
                        children: 'ƒ Campos calc.'
                      }),
                    e &&
                      Q &&
                      n.jsx('button', {
                        onClick: () => g(!0),
                        className:
                          'px-3 py-1.5 text-[12px] rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-medium shadow-sm',
                        children: '+ Agregar Widget'
                      }),
                    Q
                      ? n.jsx('button', {
                          onClick: () => t(!e),
                          className: `px-4 py-1.5 text-[12px] rounded-lg font-semibold transition-all ${e ? 'bg-[#ea580c] text-white hover:bg-[#c2410c]' : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700'}`,
                          children: e ? 'Listo' : 'Editar'
                        })
                      : n.jsx('span', {
                          className:
                            'px-3 py-1.5 text-[12px] rounded-lg bg-gray-100 text-gray-400 font-medium',
                          title: `Requiere rol ${(z == null ? void 0 : z.minRoleEdit) || 'supervisor'}+`,
                          children: 'Solo lectura'
                        })
                  ]
                })
              ]
            })
          }),
          n.jsx('div', {
            className: 'bg-gray-50 border-b border-gray-200 sticky top-[53px] z-40',
            children: n.jsxs('div', {
              className: 'max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-2 flex-wrap',
              children: [
                n.jsx('span', {
                  className:
                    'text-[11px] text-gray-500 font-semibold uppercase tracking-wide shrink-0',
                  children: 'Período:'
                }),
                n.jsx('div', {
                  className: 'flex gap-1 flex-wrap',
                  children: Do.map((p) =>
                    n.jsx(
                      'button',
                      {
                        onClick: () => v(p.key),
                        className: `px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors ${w === p.key ? 'bg-[#ea580c] text-white' : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'}`,
                        children: p.label
                      },
                      p.key
                    )
                  )
                }),
                w === 'custom' &&
                  n.jsxs('div', {
                    className: 'flex items-center gap-1.5 ml-2',
                    children: [
                      n.jsx('input', {
                        type: 'date',
                        className: 'px-2 py-1 text-[12px] border border-gray-200 rounded-md',
                        value: D,
                        onChange: (p) => S(p.target.value)
                      }),
                      n.jsx('span', { className: 'text-gray-400 text-[11px]', children: '→' }),
                      n.jsx('input', {
                        type: 'date',
                        className: 'px-2 py-1 text-[12px] border border-gray-200 rounded-md',
                        value: _,
                        onChange: (p) => G(p.target.value)
                      })
                    ]
                  }),
                n.jsxs('span', {
                  className: 'text-[10px] text-gray-400 ml-auto shrink-0',
                  children: [Y.from, ' — ', Y.to]
                }),
                n.jsx('button', {
                  onClick: be,
                  className:
                    'px-2 py-1 text-[11px] text-gray-500 hover:text-[#ea580c] border border-gray-200 rounded-md hover:border-orange-200',
                  title: 'Refrescar datos',
                  children: '↻'
                })
              ]
            })
          }),
          z &&
            n.jsx('div', {
              className: 'bg-white border-b border-gray-200 sticky top-[93px] z-40',
              children: n.jsxs('div', {
                className: 'max-w-[1600px] mx-auto px-4 flex items-center gap-1 overflow-x-auto',
                children: [
                  z.pages.map((p) => {
                    const E = p.id === (L == null ? void 0 : L.id);
                    return n.jsxs(
                      'div',
                      {
                        className: 'flex items-center shrink-0',
                        children: [
                          f === p.id
                            ? n.jsx('input', {
                                autoFocus: !0,
                                defaultValue: p.name,
                                onBlur: (A) => {
                                  (ve(p.id, A.target.value.trim() || p.name), h(null));
                                },
                                onKeyDown: (A) => {
                                  (A.key === 'Enter' &&
                                    (ve(p.id, A.target.value.trim() || p.name), h(null)),
                                    A.key === 'Escape' && h(null));
                                },
                                className:
                                  'my-1.5 px-2 py-1 text-[12px] border border-orange-300 rounded-md w-28 focus:outline-none'
                              })
                            : n.jsxs('button', {
                                onClick: () => i(p.id),
                                onDoubleClick: () => {
                                  e && Q && h(p.id);
                                },
                                className: `px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${E ? 'border-[#ea580c] text-[#ea580c]' : 'border-transparent text-gray-500 hover:text-gray-800'}`,
                                title: e && Q ? 'Doble clic para renombrar' : void 0,
                                children: [
                                  p.name,
                                  E &&
                                    n.jsxs('span', {
                                      className: 'ml-1.5 text-[10px] text-gray-400',
                                      children: ['(', p.widgets.length, ')']
                                    })
                                ]
                              }),
                          e &&
                            Q &&
                            E &&
                            z.pages.length > 1 &&
                            n.jsx('button', {
                              onClick: () => Me(p.id),
                              className: 'text-gray-300 hover:text-red-500 text-[11px] px-1',
                              title: 'Eliminar hoja',
                              children: '✕'
                            })
                        ]
                      },
                      p.id
                    );
                  }),
                  e &&
                    Q &&
                    n.jsx('button', {
                      onClick: Oe,
                      className:
                        'px-2.5 py-2 text-[12px] text-gray-400 hover:text-[#ea580c] font-medium shrink-0',
                      title: 'Nueva hoja',
                      children: '+ Hoja'
                    })
                ]
              })
            }),
          n.jsxs('main', {
            ref: J,
            className: 'max-w-[1600px] mx-auto px-4 py-4',
            children: [
              L &&
                L.widgets.length === 0 &&
                n.jsxs('div', {
                  className: 'flex flex-col items-center justify-center py-20 text-gray-400',
                  children: [
                    n.jsx('div', {
                      className:
                        'w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4',
                      children: '+'
                    }),
                    n.jsx('p', { className: 'text-lg font-medium mb-2', children: 'Hoja vacía' }),
                    Q
                      ? n.jsxs(n.Fragment, {
                          children: [
                            n.jsx('p', {
                              className: 'text-sm mb-4',
                              children: 'Agrega widgets para empezar a construir esta hoja'
                            }),
                            n.jsx('button', {
                              onClick: () => {
                                (t(!0), g(!0));
                              },
                              className:
                                'px-5 py-2 bg-[#ea580c] text-white rounded-xl font-semibold hover:bg-[#c2410c] transition-colors',
                              children: '+ Agregar primer widget'
                            })
                          ]
                        })
                      : n.jsxs('p', {
                          className: 'text-sm',
                          children: [
                            'No tienes permiso para editar este dashboard (requiere rol ',
                            (z == null ? void 0 : z.minRoleEdit) || 'supervisor',
                            '+).'
                          ]
                        })
                  ]
                }),
              L &&
                L.widgets.length > 0 &&
                n.jsx(
                  no,
                  {
                    className: 'layout',
                    width: K,
                    layouts: { lg: L.gridLayout },
                    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
                    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
                    rowHeight: 60,
                    dragConfig: {
                      enabled: e && Q,
                      handle: '.drag-handle',
                      bounded: !1,
                      threshold: 3
                    },
                    resizeConfig: { enabled: e && Q, handles: ['se'] },
                    onLayoutChange: oe,
                    compactor: Sn,
                    margin: [12, 12],
                    children: L.widgets.map((p) =>
                      n.jsx(
                        'div',
                        {
                          children: n.jsx(bo, {
                            widget: p,
                            data: xe,
                            editMode: e && Q,
                            onEdit: () => T(p.id),
                            onRemove: () => et(p.id)
                          })
                        },
                        p.id
                      )
                    )
                  },
                  L.id
                )
            ]
          }),
          d && n.jsx(jo, { onAdd: Fe, onClose: () => g(!1) }),
          O &&
            n.jsx(Ro, {
              editable: !!Q,
              onClose: () => {
                (M(!1), we());
              }
            }),
          Ie && n.jsx(vo, { widget: Ie, onSave: de, onCancel: () => T(null), calcFields: Ee }),
          b &&
            n.jsx(No, {
              layouts: a,
              activeId: r,
              rol: o,
              onSelect: tt,
              onCreate: Ye,
              onDelete: _e,
              onRename: nt,
              onSetMinRole: at,
              onClose: () => F(!1)
            }),
          n.jsx('style', {
            children: `
        .react-grid-item.react-grid-placeholder {
          background: #ea580c !important;
          opacity: 0.15 !important;
          border-radius: 12px !important;
        }
        .react-grid-item > .react-resizable-handle::after {
          border-right-color: #ea580c !important;
          border-bottom-color: #ea580c !important;
        }
      `
          })
        ]
      });
}
export { $o as default };
