var nx = Object.defineProperty;
var ix = (e, t, r) =>
  t in e ? nx(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : (e[t] = r);
var ji = (e, t, r) => ix(e, typeof t != 'symbol' ? t + '' : t, r);
import { r as v, g as rp, b as Tu, c as ax } from './react-vendor-CczoB5o5.js';
var np = { exports: {} },
  ip = {},
  ap = { exports: {} },
  op = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ln = v;
function ox(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var lx = typeof Object.is == 'function' ? Object.is : ox,
  ux = ln.useState,
  cx = ln.useEffect,
  sx = ln.useLayoutEffect,
  fx = ln.useDebugValue;
function dx(e, t) {
  var r = t(),
    n = ux({ inst: { value: r, getSnapshot: t } }),
    i = n[0].inst,
    a = n[1];
  return (
    sx(
      function () {
        ((i.value = r), (i.getSnapshot = t), ll(i) && a({ inst: i }));
      },
      [e, r, t]
    ),
    cx(
      function () {
        return (
          ll(i) && a({ inst: i }),
          e(function () {
            ll(i) && a({ inst: i });
          })
        );
      },
      [e]
    ),
    fx(r),
    r
  );
}
function ll(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var r = t();
    return !lx(e, r);
  } catch {
    return !0;
  }
}
function vx(e, t) {
  return t();
}
var hx =
  typeof window > 'u' || typeof window.document > 'u' || typeof window.document.createElement > 'u'
    ? vx
    : dx;
op.useSyncExternalStore = ln.useSyncExternalStore !== void 0 ? ln.useSyncExternalStore : hx;
ap.exports = op;
var px = ap.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Za = v,
  mx = px;
function yx(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var gx = typeof Object.is == 'function' ? Object.is : yx,
  bx = mx.useSyncExternalStore,
  xx = Za.useRef,
  wx = Za.useEffect,
  Ax = Za.useMemo,
  Px = Za.useDebugValue;
ip.useSyncExternalStoreWithSelector = function (e, t, r, n, i) {
  var a = xx(null);
  if (a.current === null) {
    var o = { hasValue: !1, value: null };
    a.current = o;
  } else o = a.current;
  a = Ax(
    function () {
      function u(h) {
        if (!c) {
          if (((c = !0), (s = h), (h = n(h)), i !== void 0 && o.hasValue)) {
            var p = o.value;
            if (i(p, h)) return (f = p);
          }
          return (f = h);
        }
        if (((p = f), gx(s, h))) return p;
        var m = n(h);
        return i !== void 0 && i(p, m) ? ((s = h), p) : ((s = h), (f = m));
      }
      var c = !1,
        s,
        f,
        d = r === void 0 ? null : r;
      return [
        function () {
          return u(t());
        },
        d === null
          ? void 0
          : function () {
              return u(d());
            }
      ];
    },
    [t, r, n, i]
  );
  var l = bx(e, a[0], a[1]);
  return (
    wx(
      function () {
        ((o.hasValue = !0), (o.value = l));
      },
      [l]
    ),
    Px(l),
    l
  );
};
np.exports = ip;
var lp = np.exports;
const kW = rp(lp);
function up(e) {
  var t,
    r,
    n = '';
  if (typeof e == 'string' || typeof e == 'number') n += e;
  else if (typeof e == 'object')
    if (Array.isArray(e)) {
      var i = e.length;
      for (t = 0; t < i; t++) e[t] && (r = up(e[t])) && (n && (n += ' '), (n += r));
    } else for (r in e) e[r] && (n && (n += ' '), (n += r));
  return n;
}
function Z() {
  for (var e, t, r = 0, n = '', i = arguments.length; r < i; r++)
    (e = arguments[r]) && (t = up(e)) && (n && (n += ' '), (n += t));
  return n;
}
var Ox = [
  'dangerouslySetInnerHTML',
  'onCopy',
  'onCopyCapture',
  'onCut',
  'onCutCapture',
  'onPaste',
  'onPasteCapture',
  'onCompositionEnd',
  'onCompositionEndCapture',
  'onCompositionStart',
  'onCompositionStartCapture',
  'onCompositionUpdate',
  'onCompositionUpdateCapture',
  'onFocus',
  'onFocusCapture',
  'onBlur',
  'onBlurCapture',
  'onChange',
  'onChangeCapture',
  'onBeforeInput',
  'onBeforeInputCapture',
  'onInput',
  'onInputCapture',
  'onReset',
  'onResetCapture',
  'onSubmit',
  'onSubmitCapture',
  'onInvalid',
  'onInvalidCapture',
  'onLoad',
  'onLoadCapture',
  'onError',
  'onErrorCapture',
  'onKeyDown',
  'onKeyDownCapture',
  'onKeyPress',
  'onKeyPressCapture',
  'onKeyUp',
  'onKeyUpCapture',
  'onAbort',
  'onAbortCapture',
  'onCanPlay',
  'onCanPlayCapture',
  'onCanPlayThrough',
  'onCanPlayThroughCapture',
  'onDurationChange',
  'onDurationChangeCapture',
  'onEmptied',
  'onEmptiedCapture',
  'onEncrypted',
  'onEncryptedCapture',
  'onEnded',
  'onEndedCapture',
  'onLoadedData',
  'onLoadedDataCapture',
  'onLoadedMetadata',
  'onLoadedMetadataCapture',
  'onLoadStart',
  'onLoadStartCapture',
  'onPause',
  'onPauseCapture',
  'onPlay',
  'onPlayCapture',
  'onPlaying',
  'onPlayingCapture',
  'onProgress',
  'onProgressCapture',
  'onRateChange',
  'onRateChangeCapture',
  'onSeeked',
  'onSeekedCapture',
  'onSeeking',
  'onSeekingCapture',
  'onStalled',
  'onStalledCapture',
  'onSuspend',
  'onSuspendCapture',
  'onTimeUpdate',
  'onTimeUpdateCapture',
  'onVolumeChange',
  'onVolumeChangeCapture',
  'onWaiting',
  'onWaitingCapture',
  'onAuxClick',
  'onAuxClickCapture',
  'onClick',
  'onClickCapture',
  'onContextMenu',
  'onContextMenuCapture',
  'onDoubleClick',
  'onDoubleClickCapture',
  'onDrag',
  'onDragCapture',
  'onDragEnd',
  'onDragEndCapture',
  'onDragEnter',
  'onDragEnterCapture',
  'onDragExit',
  'onDragExitCapture',
  'onDragLeave',
  'onDragLeaveCapture',
  'onDragOver',
  'onDragOverCapture',
  'onDragStart',
  'onDragStartCapture',
  'onDrop',
  'onDropCapture',
  'onMouseDown',
  'onMouseDownCapture',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseMoveCapture',
  'onMouseOut',
  'onMouseOutCapture',
  'onMouseOver',
  'onMouseOverCapture',
  'onMouseUp',
  'onMouseUpCapture',
  'onSelect',
  'onSelectCapture',
  'onTouchCancel',
  'onTouchCancelCapture',
  'onTouchEnd',
  'onTouchEndCapture',
  'onTouchMove',
  'onTouchMoveCapture',
  'onTouchStart',
  'onTouchStartCapture',
  'onPointerDown',
  'onPointerDownCapture',
  'onPointerMove',
  'onPointerMoveCapture',
  'onPointerUp',
  'onPointerUpCapture',
  'onPointerCancel',
  'onPointerCancelCapture',
  'onPointerEnter',
  'onPointerEnterCapture',
  'onPointerLeave',
  'onPointerLeaveCapture',
  'onPointerOver',
  'onPointerOverCapture',
  'onPointerOut',
  'onPointerOutCapture',
  'onGotPointerCapture',
  'onGotPointerCaptureCapture',
  'onLostPointerCapture',
  'onLostPointerCaptureCapture',
  'onScroll',
  'onScrollCapture',
  'onWheel',
  'onWheelCapture',
  'onAnimationStart',
  'onAnimationStartCapture',
  'onAnimationEnd',
  'onAnimationEndCapture',
  'onAnimationIteration',
  'onAnimationIterationCapture',
  'onTransitionEnd',
  'onTransitionEndCapture'
];
function Mu(e) {
  if (typeof e != 'string') return !1;
  var t = Ox;
  return t.includes(e);
}
var Sx = [
    'aria-activedescendant',
    'aria-atomic',
    'aria-autocomplete',
    'aria-busy',
    'aria-checked',
    'aria-colcount',
    'aria-colindex',
    'aria-colspan',
    'aria-controls',
    'aria-current',
    'aria-describedby',
    'aria-details',
    'aria-disabled',
    'aria-errormessage',
    'aria-expanded',
    'aria-flowto',
    'aria-haspopup',
    'aria-hidden',
    'aria-invalid',
    'aria-keyshortcuts',
    'aria-label',
    'aria-labelledby',
    'aria-level',
    'aria-live',
    'aria-modal',
    'aria-multiline',
    'aria-multiselectable',
    'aria-orientation',
    'aria-owns',
    'aria-placeholder',
    'aria-posinset',
    'aria-pressed',
    'aria-readonly',
    'aria-relevant',
    'aria-required',
    'aria-roledescription',
    'aria-rowcount',
    'aria-rowindex',
    'aria-rowspan',
    'aria-selected',
    'aria-setsize',
    'aria-sort',
    'aria-valuemax',
    'aria-valuemin',
    'aria-valuenow',
    'aria-valuetext',
    'className',
    'color',
    'height',
    'id',
    'lang',
    'max',
    'media',
    'method',
    'min',
    'name',
    'style',
    'target',
    'width',
    'role',
    'tabIndex',
    'accentHeight',
    'accumulate',
    'additive',
    'alignmentBaseline',
    'allowReorder',
    'alphabetic',
    'amplitude',
    'arabicForm',
    'ascent',
    'attributeName',
    'attributeType',
    'autoReverse',
    'azimuth',
    'baseFrequency',
    'baselineShift',
    'baseProfile',
    'bbox',
    'begin',
    'bias',
    'by',
    'calcMode',
    'capHeight',
    'clip',
    'clipPath',
    'clipPathUnits',
    'clipRule',
    'colorInterpolation',
    'colorInterpolationFilters',
    'colorProfile',
    'colorRendering',
    'contentScriptType',
    'contentStyleType',
    'cursor',
    'cx',
    'cy',
    'd',
    'decelerate',
    'descent',
    'diffuseConstant',
    'direction',
    'display',
    'divisor',
    'dominantBaseline',
    'dur',
    'dx',
    'dy',
    'edgeMode',
    'elevation',
    'enableBackground',
    'end',
    'exponent',
    'externalResourcesRequired',
    'fill',
    'fillOpacity',
    'fillRule',
    'filter',
    'filterRes',
    'filterUnits',
    'floodColor',
    'floodOpacity',
    'focusable',
    'fontFamily',
    'fontSize',
    'fontSizeAdjust',
    'fontStretch',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'format',
    'from',
    'fx',
    'fy',
    'g1',
    'g2',
    'glyphName',
    'glyphOrientationHorizontal',
    'glyphOrientationVertical',
    'glyphRef',
    'gradientTransform',
    'gradientUnits',
    'hanging',
    'horizAdvX',
    'horizOriginX',
    'href',
    'ideographic',
    'imageRendering',
    'in2',
    'in',
    'intercept',
    'k1',
    'k2',
    'k3',
    'k4',
    'k',
    'kernelMatrix',
    'kernelUnitLength',
    'kerning',
    'keyPoints',
    'keySplines',
    'keyTimes',
    'lengthAdjust',
    'letterSpacing',
    'lightingColor',
    'limitingConeAngle',
    'local',
    'markerEnd',
    'markerHeight',
    'markerMid',
    'markerStart',
    'markerUnits',
    'markerWidth',
    'mask',
    'maskContentUnits',
    'maskUnits',
    'mathematical',
    'mode',
    'numOctaves',
    'offset',
    'opacity',
    'operator',
    'order',
    'orient',
    'orientation',
    'origin',
    'overflow',
    'overlinePosition',
    'overlineThickness',
    'paintOrder',
    'panose1',
    'pathLength',
    'patternContentUnits',
    'patternTransform',
    'patternUnits',
    'pointerEvents',
    'pointsAtX',
    'pointsAtY',
    'pointsAtZ',
    'preserveAlpha',
    'preserveAspectRatio',
    'primitiveUnits',
    'r',
    'radius',
    'refX',
    'refY',
    'renderingIntent',
    'repeatCount',
    'repeatDur',
    'requiredExtensions',
    'requiredFeatures',
    'restart',
    'result',
    'rotate',
    'rx',
    'ry',
    'seed',
    'shapeRendering',
    'slope',
    'spacing',
    'specularConstant',
    'specularExponent',
    'speed',
    'spreadMethod',
    'startOffset',
    'stdDeviation',
    'stemh',
    'stemv',
    'stitchTiles',
    'stopColor',
    'stopOpacity',
    'strikethroughPosition',
    'strikethroughThickness',
    'string',
    'stroke',
    'strokeDasharray',
    'strokeDashoffset',
    'strokeLinecap',
    'strokeLinejoin',
    'strokeMiterlimit',
    'strokeOpacity',
    'strokeWidth',
    'surfaceScale',
    'systemLanguage',
    'tableValues',
    'targetX',
    'targetY',
    'textAnchor',
    'textDecoration',
    'textLength',
    'textRendering',
    'to',
    'transform',
    'u1',
    'u2',
    'underlinePosition',
    'underlineThickness',
    'unicode',
    'unicodeBidi',
    'unicodeRange',
    'unitsPerEm',
    'vAlphabetic',
    'values',
    'vectorEffect',
    'version',
    'vertAdvY',
    'vertOriginX',
    'vertOriginY',
    'vHanging',
    'vIdeographic',
    'viewTarget',
    'visibility',
    'vMathematical',
    'widths',
    'wordSpacing',
    'writingMode',
    'x1',
    'x2',
    'x',
    'xChannelSelector',
    'xHeight',
    'xlinkActuate',
    'xlinkArcrole',
    'xlinkHref',
    'xlinkRole',
    'xlinkShow',
    'xlinkTitle',
    'xlinkType',
    'xmlBase',
    'xmlLang',
    'xmlns',
    'xmlnsXlink',
    'xmlSpace',
    'y1',
    'y2',
    'y',
    'yChannelSelector',
    'z',
    'zoomAndPan',
    'ref',
    'key',
    'angle'
  ],
  Ex = new Set(Sx);
function cp(e) {
  return typeof e != 'string' ? !1 : Ex.has(e);
}
function sp(e) {
  return typeof e == 'string' && e.startsWith('data-');
}
function Ve(e) {
  if (typeof e != 'object' || e === null) return {};
  var t = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (cp(r) || sp(r)) && (t[r] = e[r]);
  return t;
}
function Dr(e) {
  if (e == null) return null;
  if (v.isValidElement(e) && typeof e.props == 'object' && e.props !== null) {
    var t = e.props;
    return Ve(t);
  }
  return typeof e == 'object' && !Array.isArray(e) ? Ve(e) : null;
}
function Ye(e) {
  var t = {};
  for (var r in e)
    Object.prototype.hasOwnProperty.call(e, r) && (cp(r) || sp(r) || Mu(r)) && (t[r] = e[r]);
  return t;
}
function Ix(e) {
  return e == null
    ? null
    : v.isValidElement(e)
      ? Ye(e.props)
      : typeof e == 'object' && !Array.isArray(e)
        ? Ye(e)
        : null;
}
var kx = ['children', 'width', 'height', 'viewBox', 'className', 'style', 'title', 'desc'];
function $l() {
  return (
    ($l = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    $l.apply(null, arguments)
  );
}
function Cx(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = jx(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function jx(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var Du = v.forwardRef((e, t) => {
    var r = e.children,
      n = e.width,
      i = e.height,
      a = e.viewBox,
      o = e.className,
      l = e.style,
      u = e.title,
      c = e.desc,
      s = Cx(e, kx),
      f = a || { width: n, height: i, x: 0, y: 0 },
      d = Z('recharts-surface', o);
    return v.createElement(
      'svg',
      $l({}, Ye(s), {
        className: d,
        width: n,
        height: i,
        style: l,
        viewBox: ''.concat(f.x, ' ').concat(f.y, ' ').concat(f.width, ' ').concat(f.height),
        ref: t
      }),
      v.createElement('title', null, u),
      v.createElement('desc', null, c),
      r
    );
  }),
  _x = ['children', 'className'];
function Nl() {
  return (
    (Nl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Nl.apply(null, arguments)
  );
}
function Tx(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = Mx(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function Mx(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var fe = v.forwardRef((e, t) => {
  var r = e.children,
    n = e.className,
    i = Tx(e, _x),
    a = Z('recharts-layer', n);
  return v.createElement('g', Nl({ className: a }, Ye(i), { ref: t }), r);
});
function Ll(e) {
  return e === '__proto__';
}
const Dx = /\.|(\[(?:[^[\]]*|(["'])(?:(?!\2)[^\\]|\\.)*?\2)\])/;
function fp(e) {
  switch (typeof e) {
    case 'number':
    case 'symbol':
      return !1;
    case 'string':
      return e === '' || e.startsWith('.') || e.endsWith('.') ? !1 : Dx.test(e);
    default:
      return !1;
  }
}
function $u(e) {
  var t;
  return typeof e == 'string' || typeof e == 'symbol'
    ? e
    : Object.is((t = e == null ? void 0 : e.valueOf) == null ? void 0 : t.call(e), -0)
      ? '-0'
      : String(e);
}
function dp(e) {
  if (e == null) return '';
  if (typeof e == 'string') return e;
  if (Array.isArray(e)) return e.map(dp).join(',');
  const t = String(e);
  return t === '0' && Object.is(Number(e), -0) ? '-0' : t;
}
function Nu(e) {
  if (Array.isArray(e)) return e.map($u);
  if (typeof e == 'symbol') return [e];
  e = dp(e);
  const t = [],
    r = e.length;
  if (r === 0) return t;
  let n = 0,
    i = '',
    a = '',
    o = !1;
  for (e.charCodeAt(0) === 46 && t.push(''); n < r;) {
    const l = e[n];
    if (a) l === '\\' && n + 1 < r ? (n++, (i += e[n])) : l === a ? (a = '') : (i += l);
    else if (o)
      l === '"' || l === "'" ? (a = l) : l === ']' ? ((o = !1), t.push(i), (i = '')) : (i += l);
    else if (l === '[') ((o = !0), i && (t.push(i), (i = '')));
    else if (l === '.') {
      i && (t.push(i), (i = ''));
      const u = e[n + 1];
      (u === void 0 || u === '.') && t.push('');
    } else i += l;
    n++;
  }
  return (i && t.push(i), t);
}
function Mt(e, t, r) {
  if (e == null) return r;
  switch (typeof t) {
    case 'string': {
      if (Ll(t)) return r;
      const n = e[t];
      return n === void 0 ? (fp(t) && !Object.hasOwn(e, t) ? Mt(e, Nu(t), r) : r) : n;
    }
    case 'number':
    case 'symbol': {
      typeof t == 'number' && (t = $u(t));
      const n = e[t];
      return n === void 0 ? r : n;
    }
    default: {
      if (Array.isArray(t)) return $x(e, t, r);
      if ((Object.is(t == null ? void 0 : t.valueOf(), -0) ? (t = '-0') : (t = String(t)), Ll(t)))
        return r;
      const n = e[t];
      return n === void 0 ? r : n;
    }
  }
}
function $x(e, t, r) {
  if (t.length === 0) return r;
  let n = e;
  for (let i = 0; i < t.length; i++) {
    if (n == null || Ll(t[i])) return r;
    n = n[t[i]];
  }
  return n === void 0 ? r : n;
}
var Nx = 4;
function Vt(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Nx,
    r = 10 ** t,
    n = Math.round(e * r) / r;
  return Object.is(n, -0) ? 0 : n;
}
function De(e) {
  for (var t = arguments.length, r = new Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++)
    r[n - 1] = arguments[n];
  return e.reduce((i, a, o) => {
    var l = r[o - 1];
    return typeof l == 'string' ? i + l + a : l !== void 0 ? i + Vt(l) + a : i + a;
  }, '');
}
var je = (e) => (e === 0 ? 0 : e > 0 ? 1 : -1),
  bt = (e) => typeof e == 'number' && e != +e,
  $r = (e) => typeof e == 'string' && e.length > 1 && e.indexOf('%') === e.length - 1,
  T = (e) => (typeof e == 'number' || e instanceof Number) && !bt(e),
  ut = (e) => T(e) || typeof e == 'string',
  Lx = 0,
  Vn = (e) => {
    var t = ++Lx;
    return ''.concat(e || '').concat(t);
  },
  Be = function (t, r) {
    var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0,
      i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
    if (!T(t) && typeof t != 'string') return n;
    var a;
    if ($r(t)) {
      if (r == null) return n;
      var o = t.indexOf('%');
      a = (r * parseFloat(t.slice(0, o))) / 100;
    } else a = +t;
    return (bt(a) && (a = n), i && r != null && a > r && (a = r), a);
  },
  vp = (e) => {
    if (!Array.isArray(e)) return !1;
    for (var t = e.length, r = {}, n = 0; n < t; n++)
      if (!r[String(e[n])]) r[String(e[n])] = !0;
      else return !0;
    return !1;
  };
function ae(e, t, r) {
  return T(e) && T(t) ? Vt(e + r * (t - e)) : t;
}
function hp(e, t, r) {
  if (!(!e || !e.length))
    return e.find((n) => n && (typeof t == 'function' ? t(n) : Mt(n, t)) === r);
}
var ue = (e) => e === null || typeof e > 'u',
  ai = (e) => (ue(e) ? e : ''.concat(e.charAt(0).toUpperCase()).concat(e.slice(1)));
function Ue(e) {
  return e != null;
}
function dr() {}
function Lu(e) {
  if (e)
    return {
      x: e.x,
      y: e.y,
      upperWidth: 'upperWidth' in e ? e.upperWidth : e.width,
      lowerWidth: 'lowerWidth' in e ? e.lowerWidth : e.width,
      width: e.width,
      height: e.height
    };
}
function Hs(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function St(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Hs(Object(r), !0).forEach(function (n) {
          Rx(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Hs(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Rx(e, t, r) {
  return (
    (t = Bx(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Bx(e) {
  var t = zx(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function zx(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var pp = (e) => {
    var t = e.viewBox,
      r = e.position,
      n = e.offset,
      i = n === void 0 ? 0 : n,
      a = e.parentViewBox,
      o = e.clamp,
      l = Lu(t),
      u = l.x,
      c = l.y,
      s = l.height,
      f = l.upperWidth,
      d = l.lowerWidth,
      h = u,
      p = u + (f - d) / 2,
      m = (h + p) / 2,
      y = (f + d) / 2,
      g = h + f / 2,
      x = s >= 0 ? 1 : -1,
      A = x * i,
      w = x > 0 ? 'end' : 'start',
      P = x > 0 ? 'start' : 'end',
      b = f >= 0 ? 1 : -1,
      S = b * i,
      E = b > 0 ? 'end' : 'start',
      C = b > 0 ? 'start' : 'end',
      k = a;
    if (r === 'top') {
      var j = { x: h + f / 2, y: c - A, horizontalAnchor: 'middle', verticalAnchor: w };
      return (o && k && ((j.height = Math.max(c - k.y, 0)), (j.width = f)), j);
    }
    if (r === 'bottom') {
      var I = { x: p + d / 2, y: c + s + A, horizontalAnchor: 'middle', verticalAnchor: P };
      return (o && k && ((I.height = Math.max(k.y + k.height - (c + s), 0)), (I.width = d)), I);
    }
    if (r === 'left') {
      var R = { x: m - S, y: c + s / 2, horizontalAnchor: E, verticalAnchor: 'middle' };
      return (o && k && ((R.width = Math.max(R.x - k.x, 0)), (R.height = s)), R);
    }
    if (r === 'right') {
      var D = { x: m + y + S, y: c + s / 2, horizontalAnchor: C, verticalAnchor: 'middle' };
      return (o && k && ((D.width = Math.max(k.x + k.width - D.x, 0)), (D.height = s)), D);
    }
    var $ = o && k ? { width: y, height: s } : {};
    return r === 'insideLeft'
      ? St({ x: m + S, y: c + s / 2, horizontalAnchor: C, verticalAnchor: 'middle' }, $)
      : r === 'insideRight'
        ? St({ x: m + y - S, y: c + s / 2, horizontalAnchor: E, verticalAnchor: 'middle' }, $)
        : r === 'insideTop'
          ? St({ x: h + f / 2, y: c + A, horizontalAnchor: 'middle', verticalAnchor: P }, $)
          : r === 'insideBottom'
            ? St({ x: p + d / 2, y: c + s - A, horizontalAnchor: 'middle', verticalAnchor: w }, $)
            : r === 'insideTopLeft'
              ? St({ x: h + S, y: c + A, horizontalAnchor: C, verticalAnchor: P }, $)
              : r === 'insideTopRight'
                ? St({ x: h + f - S, y: c + A, horizontalAnchor: E, verticalAnchor: P }, $)
                : r === 'insideBottomLeft'
                  ? St({ x: p + S, y: c + s - A, horizontalAnchor: C, verticalAnchor: w }, $)
                  : r === 'insideBottomRight'
                    ? St({ x: p + d - S, y: c + s - A, horizontalAnchor: E, verticalAnchor: w }, $)
                    : r && typeof r == 'object' && (T(r.x) || $r(r.x)) && (T(r.y) || $r(r.y))
                      ? St(
                          {
                            x: u + Be(r.x, y),
                            y: c + Be(r.y, s),
                            horizontalAnchor: 'end',
                            verticalAnchor: 'end'
                          },
                          $
                        )
                      : St(
                          {
                            x: g,
                            y: c + s / 2,
                            horizontalAnchor: 'middle',
                            verticalAnchor: 'middle'
                          },
                          $
                        );
  },
  Wx = ['top', 'left', 'right', 'bottom'];
function Ru(e) {
  return e == null ? !1 : typeof e == 'object' ? !0 : Wx.includes(e);
}
var mp = v.createContext(null),
  Fx = () => v.useContext(mp);
function ie(e) {
  return function () {
    return e;
  };
}
const yp = Math.cos,
  Ji = Math.sin,
  wt = Math.sqrt,
  ea = Math.PI,
  Qa = 2 * ea,
  Rl = Math.PI,
  Bl = 2 * Rl,
  Pr = 1e-6,
  Kx = Bl - Pr;
function gp(e) {
  this._ += e[0];
  for (let t = 1, r = e.length; t < r; ++t) this._ += arguments[t] + e[t];
}
function Ux(e) {
  let t = Math.floor(e);
  if (!(t >= 0)) throw new Error(`invalid digits: ${e}`);
  if (t > 15) return gp;
  const r = 10 ** t;
  return function (n) {
    this._ += n[0];
    for (let i = 1, a = n.length; i < a; ++i) this._ += Math.round(arguments[i] * r) / r + n[i];
  };
}
class Hx {
  constructor(t) {
    ((this._x0 = this._y0 = this._x1 = this._y1 = null),
      (this._ = ''),
      (this._append = t == null ? gp : Ux(t)));
  }
  moveTo(t, r) {
    this._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +r)}`;
  }
  closePath() {
    this._x1 !== null && ((this._x1 = this._x0), (this._y1 = this._y0), this._append`Z`);
  }
  lineTo(t, r) {
    this._append`L${(this._x1 = +t)},${(this._y1 = +r)}`;
  }
  quadraticCurveTo(t, r, n, i) {
    this._append`Q${+t},${+r},${(this._x1 = +n)},${(this._y1 = +i)}`;
  }
  bezierCurveTo(t, r, n, i, a, o) {
    this._append`C${+t},${+r},${+n},${+i},${(this._x1 = +a)},${(this._y1 = +o)}`;
  }
  arcTo(t, r, n, i, a) {
    if (((t = +t), (r = +r), (n = +n), (i = +i), (a = +a), a < 0))
      throw new Error(`negative radius: ${a}`);
    let o = this._x1,
      l = this._y1,
      u = n - t,
      c = i - r,
      s = o - t,
      f = l - r,
      d = s * s + f * f;
    if (this._x1 === null) this._append`M${(this._x1 = t)},${(this._y1 = r)}`;
    else if (d > Pr)
      if (!(Math.abs(f * u - c * s) > Pr) || !a) this._append`L${(this._x1 = t)},${(this._y1 = r)}`;
      else {
        let h = n - o,
          p = i - l,
          m = u * u + c * c,
          y = h * h + p * p,
          g = Math.sqrt(m),
          x = Math.sqrt(d),
          A = a * Math.tan((Rl - Math.acos((m + d - y) / (2 * g * x))) / 2),
          w = A / x,
          P = A / g;
        (Math.abs(w - 1) > Pr && this._append`L${t + w * s},${r + w * f}`,
          this
            ._append`A${a},${a},0,0,${+(f * h > s * p)},${(this._x1 = t + P * u)},${(this._y1 = r + P * c)}`);
      }
  }
  arc(t, r, n, i, a, o) {
    if (((t = +t), (r = +r), (n = +n), (o = !!o), n < 0)) throw new Error(`negative radius: ${n}`);
    let l = n * Math.cos(i),
      u = n * Math.sin(i),
      c = t + l,
      s = r + u,
      f = 1 ^ o,
      d = o ? i - a : a - i;
    (this._x1 === null
      ? this._append`M${c},${s}`
      : (Math.abs(this._x1 - c) > Pr || Math.abs(this._y1 - s) > Pr) && this._append`L${c},${s}`,
      n &&
        (d < 0 && (d = (d % Bl) + Bl),
        d > Kx
          ? this
              ._append`A${n},${n},0,1,${f},${t - l},${r - u}A${n},${n},0,1,${f},${(this._x1 = c)},${(this._y1 = s)}`
          : d > Pr &&
            this
              ._append`A${n},${n},0,${+(d >= Rl)},${f},${(this._x1 = t + n * Math.cos(a))},${(this._y1 = r + n * Math.sin(a))}`));
  }
  rect(t, r, n, i) {
    this
      ._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +r)}h${(n = +n)}v${+i}h${-n}Z`;
  }
  toString() {
    return this._;
  }
}
function Bu(e) {
  let t = 3;
  return (
    (e.digits = function (r) {
      if (!arguments.length) return t;
      if (r == null) t = null;
      else {
        const n = Math.floor(r);
        if (!(n >= 0)) throw new RangeError(`invalid digits: ${r}`);
        t = n;
      }
      return e;
    }),
    () => new Hx(t)
  );
}
function zu(e) {
  return typeof e == 'object' && 'length' in e ? e : Array.from(e);
}
function bp(e) {
  this._context = e;
}
bp.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    this._point = 0;
  },
  lineEnd: function () {
    ((this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        ((this._point = 1), this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t));
        break;
      case 1:
        this._point = 2;
      default:
        this._context.lineTo(e, t);
        break;
    }
  }
};
function Ja(e) {
  return new bp(e);
}
function xp(e) {
  return e[0];
}
function wp(e) {
  return e[1];
}
function Ap(e, t) {
  var r = ie(!0),
    n = null,
    i = Ja,
    a = null,
    o = Bu(l);
  ((e = typeof e == 'function' ? e : e === void 0 ? xp : ie(e)),
    (t = typeof t == 'function' ? t : t === void 0 ? wp : ie(t)));
  function l(u) {
    var c,
      s = (u = zu(u)).length,
      f,
      d = !1,
      h;
    for (n == null && (a = i((h = o()))), c = 0; c <= s; ++c)
      (!(c < s && r((f = u[c]), c, u)) === d && ((d = !d) ? a.lineStart() : a.lineEnd()),
        d && a.point(+e(f, c, u), +t(f, c, u)));
    if (h) return ((a = null), h + '' || null);
  }
  return (
    (l.x = function (u) {
      return arguments.length ? ((e = typeof u == 'function' ? u : ie(+u)), l) : e;
    }),
    (l.y = function (u) {
      return arguments.length ? ((t = typeof u == 'function' ? u : ie(+u)), l) : t;
    }),
    (l.defined = function (u) {
      return arguments.length ? ((r = typeof u == 'function' ? u : ie(!!u)), l) : r;
    }),
    (l.curve = function (u) {
      return arguments.length ? ((i = u), n != null && (a = i(n)), l) : i;
    }),
    (l.context = function (u) {
      return arguments.length ? (u == null ? (n = a = null) : (a = i((n = u))), l) : n;
    }),
    l
  );
}
function _i(e, t, r) {
  var n = null,
    i = ie(!0),
    a = null,
    o = Ja,
    l = null,
    u = Bu(c);
  ((e = typeof e == 'function' ? e : e === void 0 ? xp : ie(+e)),
    (t = typeof t == 'function' ? t : ie(t === void 0 ? 0 : +t)),
    (r = typeof r == 'function' ? r : r === void 0 ? wp : ie(+r)));
  function c(f) {
    var d,
      h,
      p,
      m = (f = zu(f)).length,
      y,
      g = !1,
      x,
      A = new Array(m),
      w = new Array(m);
    for (a == null && (l = o((x = u()))), d = 0; d <= m; ++d) {
      if (!(d < m && i((y = f[d]), d, f)) === g)
        if ((g = !g)) ((h = d), l.areaStart(), l.lineStart());
        else {
          for (l.lineEnd(), l.lineStart(), p = d - 1; p >= h; --p) l.point(A[p], w[p]);
          (l.lineEnd(), l.areaEnd());
        }
      g &&
        ((A[d] = +e(y, d, f)),
        (w[d] = +t(y, d, f)),
        l.point(n ? +n(y, d, f) : A[d], r ? +r(y, d, f) : w[d]));
    }
    if (x) return ((l = null), x + '' || null);
  }
  function s() {
    return Ap().defined(i).curve(o).context(a);
  }
  return (
    (c.x = function (f) {
      return arguments.length ? ((e = typeof f == 'function' ? f : ie(+f)), (n = null), c) : e;
    }),
    (c.x0 = function (f) {
      return arguments.length ? ((e = typeof f == 'function' ? f : ie(+f)), c) : e;
    }),
    (c.x1 = function (f) {
      return arguments.length
        ? ((n = f == null ? null : typeof f == 'function' ? f : ie(+f)), c)
        : n;
    }),
    (c.y = function (f) {
      return arguments.length ? ((t = typeof f == 'function' ? f : ie(+f)), (r = null), c) : t;
    }),
    (c.y0 = function (f) {
      return arguments.length ? ((t = typeof f == 'function' ? f : ie(+f)), c) : t;
    }),
    (c.y1 = function (f) {
      return arguments.length
        ? ((r = f == null ? null : typeof f == 'function' ? f : ie(+f)), c)
        : r;
    }),
    (c.lineX0 = c.lineY0 =
      function () {
        return s().x(e).y(t);
      }),
    (c.lineY1 = function () {
      return s().x(e).y(r);
    }),
    (c.lineX1 = function () {
      return s().x(n).y(t);
    }),
    (c.defined = function (f) {
      return arguments.length ? ((i = typeof f == 'function' ? f : ie(!!f)), c) : i;
    }),
    (c.curve = function (f) {
      return arguments.length ? ((o = f), a != null && (l = o(a)), c) : o;
    }),
    (c.context = function (f) {
      return arguments.length ? (f == null ? (a = l = null) : (l = o((a = f))), c) : a;
    }),
    c
  );
}
class Pp {
  constructor(t, r) {
    ((this._context = t), (this._x = r));
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    ((this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      (this._line = 1 - this._line));
  }
  point(t, r) {
    switch (((t = +t), (r = +r), this._point)) {
      case 0: {
        ((this._point = 1), this._line ? this._context.lineTo(t, r) : this._context.moveTo(t, r));
        break;
      }
      case 1:
        this._point = 2;
      default: {
        this._x
          ? this._context.bezierCurveTo(
              (this._x0 = (this._x0 + t) / 2),
              this._y0,
              this._x0,
              r,
              t,
              r
            )
          : this._context.bezierCurveTo(
              this._x0,
              (this._y0 = (this._y0 + r) / 2),
              t,
              this._y0,
              t,
              r
            );
        break;
      }
    }
    ((this._x0 = t), (this._y0 = r));
  }
}
function Vx(e) {
  return new Pp(e, !0);
}
function Yx(e) {
  return new Pp(e, !1);
}
const Wu = {
    draw(e, t) {
      const r = wt(t / ea);
      (e.moveTo(r, 0), e.arc(0, 0, r, 0, Qa));
    }
  },
  Gx = {
    draw(e, t) {
      const r = wt(t / 5) / 2;
      (e.moveTo(-3 * r, -r),
        e.lineTo(-r, -r),
        e.lineTo(-r, -3 * r),
        e.lineTo(r, -3 * r),
        e.lineTo(r, -r),
        e.lineTo(3 * r, -r),
        e.lineTo(3 * r, r),
        e.lineTo(r, r),
        e.lineTo(r, 3 * r),
        e.lineTo(-r, 3 * r),
        e.lineTo(-r, r),
        e.lineTo(-3 * r, r),
        e.closePath());
    }
  },
  Op = wt(1 / 3),
  qx = Op * 2,
  Xx = {
    draw(e, t) {
      const r = wt(t / qx),
        n = r * Op;
      (e.moveTo(0, -r), e.lineTo(n, 0), e.lineTo(0, r), e.lineTo(-n, 0), e.closePath());
    }
  },
  Zx = {
    draw(e, t) {
      const r = wt(t),
        n = -r / 2;
      e.rect(n, n, r, r);
    }
  },
  Qx = 0.8908130915292852,
  Sp = Ji(ea / 10) / Ji((7 * ea) / 10),
  Jx = Ji(Qa / 10) * Sp,
  ew = -yp(Qa / 10) * Sp,
  tw = {
    draw(e, t) {
      const r = wt(t * Qx),
        n = Jx * r,
        i = ew * r;
      (e.moveTo(0, -r), e.lineTo(n, i));
      for (let a = 1; a < 5; ++a) {
        const o = (Qa * a) / 5,
          l = yp(o),
          u = Ji(o);
        (e.lineTo(u * r, -l * r), e.lineTo(l * n - u * i, u * n + l * i));
      }
      e.closePath();
    }
  },
  ul = wt(3),
  rw = {
    draw(e, t) {
      const r = -wt(t / (ul * 3));
      (e.moveTo(0, r * 2), e.lineTo(-ul * r, -r), e.lineTo(ul * r, -r), e.closePath());
    }
  },
  rt = -0.5,
  nt = wt(3) / 2,
  zl = 1 / wt(12),
  nw = (zl / 2 + 1) * 3,
  iw = {
    draw(e, t) {
      const r = wt(t / nw),
        n = r / 2,
        i = r * zl,
        a = n,
        o = r * zl + r,
        l = -a,
        u = o;
      (e.moveTo(n, i),
        e.lineTo(a, o),
        e.lineTo(l, u),
        e.lineTo(rt * n - nt * i, nt * n + rt * i),
        e.lineTo(rt * a - nt * o, nt * a + rt * o),
        e.lineTo(rt * l - nt * u, nt * l + rt * u),
        e.lineTo(rt * n + nt * i, rt * i - nt * n),
        e.lineTo(rt * a + nt * o, rt * o - nt * a),
        e.lineTo(rt * l + nt * u, rt * u - nt * l),
        e.closePath());
    }
  };
function aw(e, t) {
  let r = null,
    n = Bu(i);
  ((e = typeof e == 'function' ? e : ie(e || Wu)),
    (t = typeof t == 'function' ? t : ie(t === void 0 ? 64 : +t)));
  function i() {
    let a;
    if ((r || (r = a = n()), e.apply(this, arguments).draw(r, +t.apply(this, arguments)), a))
      return ((r = null), a + '' || null);
  }
  return (
    (i.type = function (a) {
      return arguments.length ? ((e = typeof a == 'function' ? a : ie(a)), i) : e;
    }),
    (i.size = function (a) {
      return arguments.length ? ((t = typeof a == 'function' ? a : ie(+a)), i) : t;
    }),
    (i.context = function (a) {
      return arguments.length ? ((r = a ?? null), i) : r;
    }),
    i
  );
}
function ta() {}
function ra(e, t, r) {
  e._context.bezierCurveTo(
    (2 * e._x0 + e._x1) / 3,
    (2 * e._y0 + e._y1) / 3,
    (e._x0 + 2 * e._x1) / 3,
    (e._y0 + 2 * e._y1) / 3,
    (e._x0 + 4 * e._x1 + t) / 6,
    (e._y0 + 4 * e._y1 + r) / 6
  );
}
function Ep(e) {
  this._context = e;
}
Ep.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x0 = this._x1 = this._y0 = this._y1 = NaN), (this._point = 0));
  },
  lineEnd: function () {
    switch (this._point) {
      case 3:
        ra(this, this._x1, this._y1);
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    ((this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        ((this._point = 1), this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t));
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        ((this._point = 3),
          this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6));
      default:
        ra(this, e, t);
        break;
    }
    ((this._x0 = this._x1), (this._x1 = e), (this._y0 = this._y1), (this._y1 = t));
  }
};
function ow(e) {
  return new Ep(e);
}
function Ip(e) {
  this._context = e;
}
Ip.prototype = {
  areaStart: ta,
  areaEnd: ta,
  lineStart: function () {
    ((this._x0 =
      this._x1 =
      this._x2 =
      this._x3 =
      this._x4 =
      this._y0 =
      this._y1 =
      this._y2 =
      this._y3 =
      this._y4 =
        NaN),
      (this._point = 0));
  },
  lineEnd: function () {
    switch (this._point) {
      case 1: {
        (this._context.moveTo(this._x2, this._y2), this._context.closePath());
        break;
      }
      case 2: {
        (this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3),
          this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3),
          this._context.closePath());
        break;
      }
      case 3: {
        (this.point(this._x2, this._y2),
          this.point(this._x3, this._y3),
          this.point(this._x4, this._y4));
        break;
      }
    }
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        ((this._point = 1), (this._x2 = e), (this._y2 = t));
        break;
      case 1:
        ((this._point = 2), (this._x3 = e), (this._y3 = t));
        break;
      case 2:
        ((this._point = 3),
          (this._x4 = e),
          (this._y4 = t),
          this._context.moveTo(
            (this._x0 + 4 * this._x1 + e) / 6,
            (this._y0 + 4 * this._y1 + t) / 6
          ));
        break;
      default:
        ra(this, e, t);
        break;
    }
    ((this._x0 = this._x1), (this._x1 = e), (this._y0 = this._y1), (this._y1 = t));
  }
};
function lw(e) {
  return new Ip(e);
}
function kp(e) {
  this._context = e;
}
kp.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x0 = this._x1 = this._y0 = this._y1 = NaN), (this._point = 0));
  },
  lineEnd: function () {
    ((this._line || (this._line !== 0 && this._point === 3)) && this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        var r = (this._x0 + 4 * this._x1 + e) / 6,
          n = (this._y0 + 4 * this._y1 + t) / 6;
        this._line ? this._context.lineTo(r, n) : this._context.moveTo(r, n);
        break;
      case 3:
        this._point = 4;
      default:
        ra(this, e, t);
        break;
    }
    ((this._x0 = this._x1), (this._x1 = e), (this._y0 = this._y1), (this._y1 = t));
  }
};
function uw(e) {
  return new kp(e);
}
function Cp(e) {
  this._context = e;
}
Cp.prototype = {
  areaStart: ta,
  areaEnd: ta,
  lineStart: function () {
    this._point = 0;
  },
  lineEnd: function () {
    this._point && this._context.closePath();
  },
  point: function (e, t) {
    ((e = +e),
      (t = +t),
      this._point ? this._context.lineTo(e, t) : ((this._point = 1), this._context.moveTo(e, t)));
  }
};
function cw(e) {
  return new Cp(e);
}
function Vs(e) {
  return e < 0 ? -1 : 1;
}
function Ys(e, t, r) {
  var n = e._x1 - e._x0,
    i = t - e._x1,
    a = (e._y1 - e._y0) / (n || (i < 0 && -0)),
    o = (r - e._y1) / (i || (n < 0 && -0)),
    l = (a * i + o * n) / (n + i);
  return (Vs(a) + Vs(o)) * Math.min(Math.abs(a), Math.abs(o), 0.5 * Math.abs(l)) || 0;
}
function Gs(e, t) {
  var r = e._x1 - e._x0;
  return r ? ((3 * (e._y1 - e._y0)) / r - t) / 2 : t;
}
function cl(e, t, r) {
  var n = e._x0,
    i = e._y0,
    a = e._x1,
    o = e._y1,
    l = (a - n) / 3;
  e._context.bezierCurveTo(n + l, i + l * t, a - l, o - l * r, a, o);
}
function na(e) {
  this._context = e;
}
na.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN), (this._point = 0));
  },
  lineEnd: function () {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
      case 3:
        cl(this, this._t0, Gs(this, this._t0));
        break;
    }
    ((this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (e, t) {
    var r = NaN;
    if (((e = +e), (t = +t), !(e === this._x1 && t === this._y1))) {
      switch (this._point) {
        case 0:
          ((this._point = 1), this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t));
          break;
        case 1:
          this._point = 2;
          break;
        case 2:
          ((this._point = 3), cl(this, Gs(this, (r = Ys(this, e, t))), r));
          break;
        default:
          cl(this, this._t0, (r = Ys(this, e, t)));
          break;
      }
      ((this._x0 = this._x1),
        (this._x1 = e),
        (this._y0 = this._y1),
        (this._y1 = t),
        (this._t0 = r));
    }
  }
};
function jp(e) {
  this._context = new _p(e);
}
(jp.prototype = Object.create(na.prototype)).point = function (e, t) {
  na.prototype.point.call(this, t, e);
};
function _p(e) {
  this._context = e;
}
_p.prototype = {
  moveTo: function (e, t) {
    this._context.moveTo(t, e);
  },
  closePath: function () {
    this._context.closePath();
  },
  lineTo: function (e, t) {
    this._context.lineTo(t, e);
  },
  bezierCurveTo: function (e, t, r, n, i, a) {
    this._context.bezierCurveTo(t, e, n, r, a, i);
  }
};
function sw(e) {
  return new na(e);
}
function fw(e) {
  return new jp(e);
}
function Tp(e) {
  this._context = e;
}
Tp.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x = []), (this._y = []));
  },
  lineEnd: function () {
    var e = this._x,
      t = this._y,
      r = e.length;
    if (r)
      if (
        (this._line ? this._context.lineTo(e[0], t[0]) : this._context.moveTo(e[0], t[0]), r === 2)
      )
        this._context.lineTo(e[1], t[1]);
      else
        for (var n = qs(e), i = qs(t), a = 0, o = 1; o < r; ++a, ++o)
          this._context.bezierCurveTo(n[0][a], i[0][a], n[1][a], i[1][a], e[o], t[o]);
    ((this._line || (this._line !== 0 && r === 1)) && this._context.closePath(),
      (this._line = 1 - this._line),
      (this._x = this._y = null));
  },
  point: function (e, t) {
    (this._x.push(+e), this._y.push(+t));
  }
};
function qs(e) {
  var t,
    r = e.length - 1,
    n,
    i = new Array(r),
    a = new Array(r),
    o = new Array(r);
  for (i[0] = 0, a[0] = 2, o[0] = e[0] + 2 * e[1], t = 1; t < r - 1; ++t)
    ((i[t] = 1), (a[t] = 4), (o[t] = 4 * e[t] + 2 * e[t + 1]));
  for (i[r - 1] = 2, a[r - 1] = 7, o[r - 1] = 8 * e[r - 1] + e[r], t = 1; t < r; ++t)
    ((n = i[t] / a[t - 1]), (a[t] -= n), (o[t] -= n * o[t - 1]));
  for (i[r - 1] = o[r - 1] / a[r - 1], t = r - 2; t >= 0; --t) i[t] = (o[t] - i[t + 1]) / a[t];
  for (a[r - 1] = (e[r] + i[r - 1]) / 2, t = 0; t < r - 1; ++t) a[t] = 2 * e[t + 1] - i[t + 1];
  return [i, a];
}
function dw(e) {
  return new Tp(e);
}
function eo(e, t) {
  ((this._context = e), (this._t = t));
}
eo.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x = this._y = NaN), (this._point = 0));
  },
  lineEnd: function () {
    (0 < this._t && this._t < 1 && this._point === 2 && this._context.lineTo(this._x, this._y),
      (this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      this._line >= 0 && ((this._t = 1 - this._t), (this._line = 1 - this._line)));
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        ((this._point = 1), this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t));
        break;
      case 1:
        this._point = 2;
      default: {
        if (this._t <= 0) (this._context.lineTo(this._x, t), this._context.lineTo(e, t));
        else {
          var r = this._x * (1 - this._t) + e * this._t;
          (this._context.lineTo(r, this._y), this._context.lineTo(r, t));
        }
        break;
      }
    }
    ((this._x = e), (this._y = t));
  }
};
function vw(e) {
  return new eo(e, 0.5);
}
function hw(e) {
  return new eo(e, 0);
}
function pw(e) {
  return new eo(e, 1);
}
function Nr(e, t) {
  if ((o = e.length) > 1)
    for (var r = 1, n, i, a = e[t[0]], o, l = a.length; r < o; ++r)
      for (i = a, a = e[t[r]], n = 0; n < l; ++n)
        a[n][1] += a[n][0] = isNaN(i[n][1]) ? i[n][0] : i[n][1];
}
function Wl(e) {
  for (var t = e.length, r = new Array(t); --t >= 0;) r[t] = t;
  return r;
}
function mw(e, t) {
  return e[t];
}
function yw(e) {
  const t = [];
  return ((t.key = e), t);
}
function gw() {
  var e = ie([]),
    t = Wl,
    r = Nr,
    n = mw;
  function i(a) {
    var o = Array.from(e.apply(this, arguments), yw),
      l,
      u = o.length,
      c = -1,
      s;
    for (const f of a) for (l = 0, ++c; l < u; ++l) (o[l][c] = [0, +n(f, o[l].key, c, a)]).data = f;
    for (l = 0, s = zu(t(o)); l < u; ++l) o[s[l]].index = l;
    return (r(o, s), o);
  }
  return (
    (i.keys = function (a) {
      return arguments.length ? ((e = typeof a == 'function' ? a : ie(Array.from(a))), i) : e;
    }),
    (i.value = function (a) {
      return arguments.length ? ((n = typeof a == 'function' ? a : ie(+a)), i) : n;
    }),
    (i.order = function (a) {
      return arguments.length
        ? ((t = a == null ? Wl : typeof a == 'function' ? a : ie(Array.from(a))), i)
        : t;
    }),
    (i.offset = function (a) {
      return arguments.length ? ((r = a ?? Nr), i) : r;
    }),
    i
  );
}
function bw(e, t) {
  if ((n = e.length) > 0) {
    for (var r, n, i = 0, a = e[0].length, o; i < a; ++i) {
      for (o = r = 0; r < n; ++r) o += e[r][i][1] || 0;
      if (o) for (r = 0; r < n; ++r) e[r][i][1] /= o;
    }
    Nr(e, t);
  }
}
function xw(e, t) {
  if ((i = e.length) > 0) {
    for (var r = 0, n = e[t[0]], i, a = n.length; r < a; ++r) {
      for (var o = 0, l = 0; o < i; ++o) l += e[o][r][1] || 0;
      n[r][1] += n[r][0] = -l / 2;
    }
    Nr(e, t);
  }
}
function ww(e, t) {
  if (!(!((o = e.length) > 0) || !((a = (i = e[t[0]]).length) > 0))) {
    for (var r = 0, n = 1, i, a, o; n < a; ++n) {
      for (var l = 0, u = 0, c = 0; l < o; ++l) {
        for (
          var s = e[t[l]], f = s[n][1] || 0, d = s[n - 1][1] || 0, h = (f - d) / 2, p = 0;
          p < l;
          ++p
        ) {
          var m = e[t[p]],
            y = m[n][1] || 0,
            g = m[n - 1][1] || 0;
          h += y - g;
        }
        ((u += f), (c += h * f));
      }
      ((i[n - 1][1] += i[n - 1][0] = r), u && (r -= c / u));
    }
    ((i[n - 1][1] += i[n - 1][0] = r), Nr(e, t));
  }
}
var Aw = ['type', 'size', 'sizeType'];
function Fl() {
  return (
    (Fl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Fl.apply(null, arguments)
  );
}
function Xs(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Zs(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Xs(Object(r), !0).forEach(function (n) {
          Pw(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Xs(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Pw(e, t, r) {
  return (
    (t = Ow(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Ow(e) {
  var t = Sw(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Sw(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Ew(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = Iw(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function Iw(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var Mp = {
    symbolCircle: Wu,
    symbolCross: Gx,
    symbolDiamond: Xx,
    symbolSquare: Zx,
    symbolStar: tw,
    symbolTriangle: rw,
    symbolWye: iw
  },
  kw = Math.PI / 180,
  Cw = (e) => {
    var t = 'symbol'.concat(ai(e));
    return Mp[t] || Wu;
  },
  jw = (e, t, r) => {
    if (t === 'area') return e;
    switch (r) {
      case 'cross':
        return (5 * e * e) / 9;
      case 'diamond':
        return (0.5 * e * e) / Math.sqrt(3);
      case 'square':
        return e * e;
      case 'star': {
        var n = 18 * kw;
        return 1.25 * e * e * (Math.tan(n) - Math.tan(n * 2) * Math.tan(n) ** 2);
      }
      case 'triangle':
        return (Math.sqrt(3) * e * e) / 4;
      case 'wye':
        return ((21 - 10 * Math.sqrt(3)) * e * e) / 8;
      default:
        return (Math.PI * e * e) / 4;
    }
  },
  _w = (e, t) => {
    Mp['symbol'.concat(ai(e))] = t;
  },
  Dp = (e) => {
    var t = e.type,
      r = t === void 0 ? 'circle' : t,
      n = e.size,
      i = n === void 0 ? 64 : n,
      a = e.sizeType,
      o = a === void 0 ? 'area' : a,
      l = Ew(e, Aw),
      u = Zs(Zs({}, l), {}, { type: r, size: i, sizeType: o }),
      c = 'circle';
    typeof r == 'string' && (c = r);
    var s = () => {
        var m = Cw(c),
          y = aw()
            .type(m)
            .size(jw(i, o, c)),
          g = y();
        if (g !== null) return g;
      },
      f = u.className,
      d = u.cx,
      h = u.cy,
      p = Ye(u);
    return T(d) && T(h) && T(i)
      ? v.createElement(
          'path',
          Fl({}, p, {
            className: Z('recharts-symbols', f),
            transform: 'translate('.concat(d, ', ').concat(h, ')'),
            d: s()
          })
        )
      : null;
  };
Dp.registerSymbol = _w;
var $p = (e) => 'radius' in e && 'startAngle' in e && 'endAngle' in e,
  Fu = (e, t) => {
    if (!e || typeof e == 'function' || typeof e == 'boolean') return null;
    var r = e;
    if ((v.isValidElement(e) && (r = e.props), typeof r != 'object' && typeof r != 'function'))
      return null;
    var n = {};
    return (
      Object.keys(r).forEach((i) => {
        Mu(i) && typeof r[i] == 'function' && (n[i] = (a) => r[i](r, a));
      }),
      n
    );
  },
  Tw = (e, t, r) => (n) => (e(t, r, n), null),
  oi = (e, t, r) => {
    if (e === null || (typeof e != 'object' && typeof e != 'function')) return null;
    var n = null;
    return (
      Object.keys(e).forEach((i) => {
        var a = e[i];
        Mu(i) && typeof a == 'function' && (n || (n = {}), (n[i] = Tw(a, t, r)));
      }),
      n
    );
  };
function Qs(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Mw(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Qs(Object(r), !0).forEach(function (n) {
          Dw(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Qs(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Dw(e, t, r) {
  return (
    (t = $w(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function $w(e) {
  var t = Nw(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Nw(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function ge(e, t) {
  var r = Mw({}, e),
    n = t,
    i = Object.keys(t),
    a = i.reduce((o, l) => (o[l] === void 0 && n[l] !== void 0 && (o[l] = n[l]), o), r);
  return a;
}
function ia() {
  return (
    (ia = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    ia.apply(null, arguments)
  );
}
function Js(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Np(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Js(Object(r), !0).forEach(function (n) {
          Lw(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Js(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Lw(e, t, r) {
  return (
    (t = Rw(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Rw(e) {
  var t = Bw(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Bw(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var at = 32,
  zw = {
    align: 'center',
    iconSize: 14,
    inactiveColor: '#ccc',
    layout: 'horizontal',
    verticalAlign: 'middle',
    labelStyle: {}
  };
function Ww(e) {
  if (typeof e == 'object' && e !== null && 'strokeDasharray' in e)
    return String(e.strokeDasharray);
}
function Fw(e) {
  var t = e.data,
    r = e.iconType,
    n = e.inactiveColor,
    i = at / 2,
    a = at / 6,
    o = at / 3,
    l = t.inactive ? n : t.color,
    u = r ?? t.type;
  if (u === 'none') return null;
  if (u === 'plainline')
    return v.createElement('line', {
      strokeWidth: 4,
      fill: 'none',
      stroke: l,
      strokeDasharray: Ww(t.payload),
      x1: 0,
      y1: i,
      x2: at,
      y2: i,
      className: 'recharts-legend-icon'
    });
  if (u === 'line')
    return v.createElement('path', {
      strokeWidth: 4,
      fill: 'none',
      stroke: l,
      d: 'M0,'
        .concat(i, 'h')
        .concat(
          o,
          `
            A`
        )
        .concat(a, ',')
        .concat(a, ',0,1,1,')
        .concat(2 * o, ',')
        .concat(
          i,
          `
            H`
        )
        .concat(at, 'M')
        .concat(2 * o, ',')
        .concat(
          i,
          `
            A`
        )
        .concat(a, ',')
        .concat(a, ',0,1,1,')
        .concat(o, ',')
        .concat(i),
      className: 'recharts-legend-icon'
    });
  if (u === 'rect')
    return v.createElement('path', {
      stroke: 'none',
      fill: l,
      d: 'M0,'
        .concat(at / 8, 'h')
        .concat(at, 'v')
        .concat((at * 3) / 4, 'h')
        .concat(-at, 'z'),
      className: 'recharts-legend-icon'
    });
  if (v.isValidElement(t.legendIcon)) {
    var c = Np({}, t);
    return (delete c.legendIcon, v.cloneElement(t.legendIcon, c));
  }
  return v.createElement(Dp, { fill: l, cx: i, cy: i, size: at, sizeType: 'diameter', type: u });
}
function Kw(e) {
  var t = e.payload,
    r = e.iconSize,
    n = e.layout,
    i = e.formatter,
    a = e.inactiveColor,
    o = e.iconType,
    l = e.labelStyle,
    u = { x: 0, y: 0, width: at, height: at },
    c = {
      display: n === 'horizontal' ? 'inline-block' : 'block',
      marginRight: 10,
      whiteSpace: 'nowrap'
    },
    s = { display: 'inline-block', verticalAlign: 'middle', marginRight: 4 };
  return t.map((f, d) => {
    var h,
      p,
      m = f.formatter || i,
      y = Z({ 'recharts-legend-item': !0, ['legend-item-'.concat(d)]: !0, inactive: f.inactive });
    if (f.type === 'none') return null;
    var g = typeof l == 'object' ? Np({}, l) : {};
    ((g.color = f.inactive ? a : g.color || f.color),
      ((h = g.whiteSpace) !== null && h !== void 0) || (g.whiteSpace = 'normal'),
      ((p = g.overflowWrap) !== null && p !== void 0) || (g.overflowWrap = 'break-word'));
    var x = m ? m(f.value, f, d) : f.value;
    return v.createElement(
      'li',
      ia({ className: y, style: c, key: 'legend-item-'.concat(d) }, oi(e, f, d)),
      v.createElement(
        Du,
        {
          width: r,
          height: r,
          viewBox: u,
          style: s,
          'aria-label': f.value == null ? 'legend icon' : ''.concat(f.value, ' legend icon')
        },
        v.createElement(Fw, { data: f, iconType: o, inactiveColor: a })
      ),
      v.createElement('span', { className: 'recharts-legend-item-text', style: g }, x)
    );
  });
}
var Uw = (e) => {
  var t = ge(e, zw),
    r = t.payload,
    n = t.layout,
    i = t.align;
  if (!r || !r.length) return null;
  var a = { padding: 0, margin: 0, textAlign: n === 'horizontal' ? i : 'left' };
  return v.createElement(
    'ul',
    { className: 'recharts-default-legend', style: a },
    v.createElement(Kw, ia({}, t, { payload: r }))
  );
};
function Hw(e, t) {
  const r = new Map();
  for (let n = 0; n < e.length; n++) {
    const i = e[n],
      a = t(i, n, e);
    r.has(a) || r.set(a, i);
  }
  return Array.from(r.values());
}
function Vw(e, t) {
  return function (...r) {
    return e.apply(this, r.slice(0, t));
  };
}
function Lp(e) {
  return e;
}
function Yw(e) {
  return function (t) {
    return Mt(t, e);
  };
}
function Kl(e) {
  return e == null || (typeof e != 'object' && typeof e != 'function');
}
function Gw(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function Ul(e) {
  return Object.getOwnPropertySymbols(e).filter((t) =>
    Object.prototype.propertyIsEnumerable.call(e, t)
  );
}
function Yn(e) {
  return e == null
    ? e === void 0
      ? '[object Undefined]'
      : '[object Null]'
    : Object.prototype.toString.call(e);
}
const Rp = '[object RegExp]',
  Ku = '[object String]',
  Uu = '[object Number]',
  Hu = '[object Boolean]',
  Bp = '[object Arguments]',
  zp = '[object Symbol]',
  Wp = '[object Date]',
  Fp = '[object Map]',
  Kp = '[object Set]',
  Up = '[object Array]',
  qw = '[object Function]',
  Hp = '[object ArrayBuffer]',
  Gi = '[object Object]',
  Xw = '[object Error]',
  Vp = '[object DataView]',
  Yp = '[object Uint8Array]',
  Gp = '[object Uint8ClampedArray]',
  qp = '[object Uint16Array]',
  Xp = '[object Uint32Array]',
  Zw = '[object BigUint64Array]',
  Zp = '[object Int8Array]',
  Qp = '[object Int16Array]',
  Jp = '[object Int32Array]',
  Qw = '[object BigInt64Array]',
  em = '[object Float32Array]',
  tm = '[object Float64Array]',
  ef =
    (typeof globalThis == 'object' && globalThis) ||
    (typeof window == 'object' && window) ||
    (typeof self == 'object' && self) ||
    (typeof global == 'object' && global) ||
    (function () {
      return this;
    })();
function Hl(e) {
  return typeof ef.Buffer < 'u' && ef.Buffer.isBuffer(e);
}
function Jw(e, t) {
  return Er(e, void 0, e, new Map(), t);
}
function Er(e, t, r, n = new Map(), i = void 0) {
  const a = i == null ? void 0 : i(e, t, r, n);
  if (a !== void 0) return a;
  if (Kl(e)) return e;
  if (n.has(e)) return n.get(e);
  if (Array.isArray(e)) {
    const o = new Array(e.length);
    n.set(e, o);
    for (let l = 0; l < e.length; l++) o[l] = Er(e[l], l, r, n, i);
    return (
      Object.hasOwn(e, 'index') && (o.index = e.index),
      Object.hasOwn(e, 'input') && (o.input = e.input),
      o
    );
  }
  if (e instanceof Date) return new Date(e.getTime());
  if (e instanceof RegExp) {
    const o = new RegExp(e.source, e.flags);
    return ((o.lastIndex = e.lastIndex), o);
  }
  if (e instanceof Map) {
    const o = new Map();
    n.set(e, o);
    for (const [l, u] of e) o.set(l, Er(u, l, r, n, i));
    return o;
  }
  if (e instanceof Set) {
    const o = new Set();
    n.set(e, o);
    for (const l of e) o.add(Er(l, void 0, r, n, i));
    return o;
  }
  if (Hl(e)) return e.subarray();
  if (Gw(e)) {
    const o = new (Object.getPrototypeOf(e).constructor)(e.length);
    n.set(e, o);
    for (let l = 0; l < e.length; l++) o[l] = Er(e[l], l, r, n, i);
    return o;
  }
  if (
    e instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer < 'u' && e instanceof SharedArrayBuffer)
  )
    return e.slice(0);
  if (e instanceof DataView) {
    const o = new DataView(e.buffer.slice(0), e.byteOffset, e.byteLength);
    return (n.set(e, o), mt(o, e, r, n, i), o);
  }
  if (typeof File < 'u' && e instanceof File) {
    const o = new File([e], e.name, { type: e.type });
    return (n.set(e, o), mt(o, e, r, n, i), o);
  }
  if (typeof Blob < 'u' && e instanceof Blob) {
    const o = new Blob([e], { type: e.type });
    return (n.set(e, o), mt(o, e, r, n, i), o);
  }
  if (e instanceof Error) {
    const o = structuredClone(e);
    return (
      n.set(e, o),
      (o.message = e.message),
      (o.name = e.name),
      (o.stack = e.stack),
      (o.cause = e.cause),
      (o.constructor = e.constructor),
      mt(o, e, r, n, i),
      o
    );
  }
  if (e instanceof Boolean) {
    const o = new Boolean(e.valueOf());
    return (n.set(e, o), mt(o, e, r, n, i), o);
  }
  if (e instanceof Number) {
    const o = new Number(e.valueOf());
    return (n.set(e, o), mt(o, e, r, n, i), o);
  }
  if (e instanceof String) {
    const o = new String(e.valueOf());
    return (n.set(e, o), mt(o, e, r, n, i), o);
  }
  if (typeof e == 'object' && eA(e)) {
    const o = Object.create(Object.getPrototypeOf(e));
    return (n.set(e, o), mt(o, e, r, n, i), o);
  }
  return e;
}
function mt(e, t, r = e, n, i) {
  const a = [...Object.keys(t), ...Ul(t)];
  for (let o = 0; o < a.length; o++) {
    const l = a[o],
      u = Object.getOwnPropertyDescriptor(e, l);
    (u == null || u.writable) && (e[l] = Er(t[l], l, r, n, i));
  }
}
function eA(e) {
  switch (Yn(e)) {
    case Bp:
    case Up:
    case Hp:
    case Vp:
    case Hu:
    case Wp:
    case em:
    case tm:
    case Zp:
    case Qp:
    case Jp:
    case Fp:
    case Uu:
    case Gi:
    case Rp:
    case Kp:
    case Ku:
    case zp:
    case Yp:
    case Gp:
    case qp:
    case Xp:
      return !0;
    default:
      return !1;
  }
}
function tA(e) {
  return Er(e, void 0, e, new Map(), void 0);
}
function Wn(e, t) {
  return e === t || (Number.isNaN(e) && Number.isNaN(t));
}
function rm(e) {
  return e !== null && (typeof e == 'object' || typeof e == 'function');
}
function nm(e, t, r) {
  return typeof r != 'function'
    ? nm(e, t, () => {})
    : Vl(
        e,
        t,
        function n(i, a, o, l, u, c) {
          const s = r(i, a, o, l, u, c);
          return s !== void 0 ? !!s : Vl(i, a, n, c, !1);
        },
        new Map(),
        !0
      );
}
function Vl(e, t, r, n, i = !1) {
  if (t === e) return !0;
  switch (typeof t) {
    case 'object':
      return rA(e, t, r, n);
    case 'function':
      return Object.keys(t).length > 0 ? Vl(e, { ...t }, r, n, i) : Wn(e, t);
    default:
      return rm(e) && i ? (typeof t == 'string' ? t === '' : !0) : Wn(e, t);
  }
}
function rA(e, t, r, n) {
  if (t == null) return !0;
  if (Array.isArray(t)) return im(e, t, r, n);
  if (t instanceof Map) return nA(e, t, r, n);
  if (t instanceof Set) return iA(e, t, r, n);
  const i = Object.keys(t);
  if (e == null || Kl(e)) return i.length === 0;
  if (i.length === 0) return !0;
  if (n != null && n.has(t)) return n.get(t) === e;
  n == null || n.set(t, e);
  try {
    for (let a = 0; a < i.length; a++) {
      const o = i[a];
      if (
        (!Kl(e) && !(o in e)) ||
        (t[o] === void 0 && e[o] !== void 0) ||
        (t[o] === null && e[o] !== null) ||
        !r(e[o], t[o], o, e, t, n)
      )
        return !1;
    }
    return !0;
  } finally {
    n == null || n.delete(t);
  }
}
function nA(e, t, r, n) {
  if (t.size === 0) return !0;
  if (!(e instanceof Map)) return !1;
  for (const [i, a] of t.entries()) if (r(e.get(i), a, i, e, t, n) === !1) return !1;
  return !0;
}
function im(e, t, r, n) {
  if (t.length === 0) return !0;
  if (!Array.isArray(e)) return !1;
  const i = new Set();
  for (let a = 0; a < t.length; a++) {
    const o = t[a];
    let l = !1;
    for (let u = 0; u < e.length; u++) {
      if (i.has(u)) continue;
      const c = e[u];
      let s = !1;
      if ((r(c, o, a, e, t, n) && (s = !0), s)) {
        (i.add(u), (l = !0));
        break;
      }
    }
    if (!l) return !1;
  }
  return !0;
}
function iA(e, t, r, n) {
  return t.size === 0 ? !0 : e instanceof Set ? im([...e], [...t], r, n) : !1;
}
function am(e, t) {
  return nm(e, t, () => {});
}
function aA(e) {
  return ((e = tA(e)), (t) => am(t, e));
}
function oA(e, t) {
  return Jw(e, (r, n, i, a) => {
    if (typeof e == 'object') {
      if (Yn(e) === '[object Object]' && typeof e.constructor != 'function') {
        const o = {};
        return (a.set(e, o), mt(o, e, i, a), o);
      }
      switch (Object.prototype.toString.call(e)) {
        case Uu:
        case Ku:
        case Hu: {
          const o = new e.constructor(e == null ? void 0 : e.valueOf());
          return (mt(o, e), o);
        }
        case Bp: {
          const o = {};
          return (mt(o, e), (o.length = e.length), (o[Symbol.iterator] = e[Symbol.iterator]), o);
        }
        default:
          return;
      }
    }
  });
}
function lA(e) {
  return oA(e);
}
const uA = /^(?:0|[1-9]\d*)$/;
function om(e, t = Number.MAX_SAFE_INTEGER) {
  switch (typeof e) {
    case 'number':
      return Number.isInteger(e) && e >= 0 && e < t;
    case 'symbol':
      return !1;
    case 'string':
      return uA.test(e);
  }
}
function cA(e) {
  return e !== null && typeof e == 'object' && Yn(e) === '[object Arguments]';
}
function sA(e, t) {
  let r;
  if (
    (Array.isArray(t)
      ? (r = t)
      : typeof t == 'string' && fp(t) && !(t in Object(e))
        ? (r = Nu(t))
        : (r = [t]),
    r.length === 0)
  )
    return !1;
  let n = e;
  for (let i = 0; i < r.length; i++) {
    const a = r[i];
    if (
      (n == null || !Object.hasOwn(n, a)) &&
      !((Array.isArray(n) || cA(n)) && om(a) && a < n.length)
    )
      return !1;
    n = n[a];
  }
  return !0;
}
function fA(e, t) {
  switch (typeof e) {
    case 'object':
      Object.is(e == null ? void 0 : e.valueOf(), -0) && (e = '-0');
      break;
    case 'number':
      e = $u(e);
      break;
  }
  return (
    (t = lA(t)),
    function (r) {
      const n = Mt(r, e);
      return n === void 0 ? sA(r, e) : t === void 0 ? n === void 0 : am(n, t);
    }
  );
}
function dA(e) {
  if (e == null) return Lp;
  switch (typeof e) {
    case 'function':
      return e;
    case 'object':
      return Array.isArray(e) && e.length === 2 ? fA(e[0], e[1]) : aA(e);
    case 'string':
    case 'symbol':
    case 'number':
      return Yw(e);
  }
}
function vA(e) {
  return Number.isSafeInteger(e) && e >= 0;
}
function lm(e) {
  return e != null && typeof e != 'function' && vA(e.length);
}
function hA(e) {
  return typeof e == 'object' && e !== null;
}
function pA(e) {
  return hA(e) && lm(e);
}
function tf(e, t = Lp) {
  return pA(e) ? Hw(Array.from(e), Vw(dA(t), 1)) : [];
}
function um(e, t, r) {
  return t === !0 ? tf(e, r) : typeof t == 'function' ? tf(e, t) : e;
}
var Vu = v.createContext(null),
  mA = (e) => e,
  ee = () => {
    var e = v.useContext(Vu);
    return e ? e.store.dispatch : mA;
  },
  qi = () => {},
  yA = () => qi,
  gA = (e, t) => e === t;
function M(e) {
  var t = v.useContext(Vu),
    r = v.useMemo(
      () =>
        t
          ? (n) => {
              if (n != null) return e(n);
            }
          : qi,
      [t, e]
    );
  return lp.useSyncExternalStoreWithSelector(
    t ? t.subscription.addNestedSub : yA,
    t ? t.store.getState : qi,
    t ? t.store.getState : qi,
    r,
    gA
  );
}
function bA(e, t = `expected a function, instead received ${typeof e}`) {
  if (typeof e != 'function') throw new TypeError(t);
}
function xA(e, t = 'expected all items to be functions, instead received the following types: ') {
  if (!e.every((r) => typeof r == 'function')) {
    const r = e
      .map((n) => (typeof n == 'function' ? `function ${n.name || 'unnamed'}()` : typeof n))
      .join(', ');
    throw new TypeError(`${t}[${r}]`);
  }
}
var rf = (e) => (Array.isArray(e) ? e : [e]);
function wA(e) {
  const t = Array.isArray(e[0]) ? e[0] : e;
  return (
    xA(
      t,
      'createSelector expects all input-selectors to be functions, but received the following types: '
    ),
    t
  );
}
function AA(e, t) {
  const r = [],
    { length: n } = e;
  for (let i = 0; i < n; i++) r.push(e[i].apply(null, t));
  return r;
}
var PA = class {
    constructor(e) {
      this.value = e;
    }
    deref() {
      return this.value;
    }
  },
  OA = () => (typeof WeakRef > 'u' ? PA : WeakRef),
  cm = OA(),
  SA = 0,
  nf = 1;
function Ti() {
  return { s: SA, v: void 0, o: null, p: null };
}
function EA(e) {
  return e instanceof cm ? e.deref() : e;
}
function sm(e, t = {}) {
  let r = Ti();
  const { resultEqualityCheck: n } = t;
  let i,
    a = 0;
  function o() {
    let l = r;
    const { length: u } = arguments;
    for (let f = 0, d = u; f < d; f++) {
      const h = arguments[f];
      if (typeof h == 'function' || (typeof h == 'object' && h !== null)) {
        let p = l.o;
        p === null && (l.o = p = new WeakMap());
        const m = p.get(h);
        m === void 0 ? ((l = Ti()), p.set(h, l)) : (l = m);
      } else {
        let p = l.p;
        p === null && (l.p = p = new Map());
        const m = p.get(h);
        m === void 0 ? ((l = Ti()), p.set(h, l)) : (l = m);
      }
    }
    const c = l;
    let s;
    if (l.s === nf) s = l.v;
    else if (((s = e.apply(null, arguments)), a++, n)) {
      const f = EA(i);
      (f != null && n(f, s) && ((s = f), a !== 0 && a--),
        (i = (typeof s == 'object' && s !== null) || typeof s == 'function' ? new cm(s) : s));
    }
    return ((c.s = nf), (c.v = s), s);
  }
  return (
    (o.clearCache = () => {
      ((r = Ti()), o.resetResultsCount());
    }),
    (o.resultsCount = () => a),
    (o.resetResultsCount = () => {
      a = 0;
    }),
    o
  );
}
function IA(e, ...t) {
  const r = typeof e == 'function' ? { memoize: e, memoizeOptions: t } : e,
    n = (...i) => {
      let a = 0,
        o = 0,
        l,
        u = {},
        c = i.pop();
      (typeof c == 'object' && ((u = c), (c = i.pop())),
        bA(
          c,
          `createSelector expects an output function after the inputs, but received: [${typeof c}]`
        ));
      const s = { ...r, ...u },
        { memoize: f, memoizeOptions: d = [], argsMemoize: h = sm, argsMemoizeOptions: p = [] } = s,
        m = rf(d),
        y = rf(p),
        g = wA(i),
        x = f(
          function () {
            return (a++, c.apply(null, arguments));
          },
          ...m
        ),
        A = h(
          function () {
            o++;
            const P = AA(g, arguments);
            return ((l = x.apply(null, P)), l);
          },
          ...y
        );
      return Object.assign(A, {
        resultFunc: c,
        memoizedResultFunc: x,
        dependencies: g,
        dependencyRecomputations: () => o,
        resetDependencyRecomputations: () => {
          o = 0;
        },
        lastResult: () => l,
        recomputations: () => a,
        resetRecomputations: () => {
          a = 0;
        },
        memoize: f,
        argsMemoize: h
      });
    };
  return (Object.assign(n, { withTypes: () => n }), n);
}
var O = IA(sm);
function kA(e, t = 1) {
  const r = [],
    n = Math.floor(t),
    i = (a, o) => {
      for (let l = 0; l < a.length; l++) {
        const u = a[l];
        Array.isArray(u) && o < n ? i(u, o + 1) : r.push(u);
      }
    };
  return (i(e, 0), r);
}
function Yl(e, t, r) {
  return rm(r) &&
    ((typeof t == 'number' && lm(r) && om(t) && t < r.length) || (typeof t == 'string' && t in r))
    ? Wn(r[t], e)
    : !1;
}
function af(e) {
  return typeof e == 'symbol' ? 1 : e === null ? 2 : e === void 0 ? 3 : e !== e ? 4 : 0;
}
const CA = (e, t, r) => {
  if (e !== t) {
    const n = af(e),
      i = af(t);
    if (n === i && n === 0) {
      if (e < t) return r === 'desc' ? 1 : -1;
      if (e > t) return r === 'desc' ? -1 : 1;
    }
    return r === 'desc' ? i - n : n - i;
  }
  return 0;
};
function fm(e) {
  return typeof e == 'symbol' || e instanceof Symbol;
}
const jA = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
  _A = /^\w*$/;
function TA(e, t) {
  return Array.isArray(e)
    ? !1
    : typeof e == 'number' || typeof e == 'boolean' || e == null || fm(e)
      ? !0
      : (typeof e == 'string' && (_A.test(e) || !jA.test(e))) || t != null;
}
function MA(e, t, r, n) {
  if (e == null) return [];
  ((r = r),
    Array.isArray(e) || (e = Object.values(e)),
    Array.isArray(t) || (t = t == null ? [null] : [t]),
    t.length === 0 && (t = [null]),
    Array.isArray(r) || (r = r == null ? [] : [r]),
    (r = r.map((l) => String(l))));
  const i = (l, u) => {
      let c = l;
      for (let s = 0; s < u.length && c != null; ++s) c = c[u[s]];
      return c;
    },
    a = (l, u) =>
      u == null || l == null
        ? u
        : typeof l == 'object' && 'key' in l
          ? Object.hasOwn(u, l.key)
            ? u[l.key]
            : i(u, l.path)
          : typeof l == 'function'
            ? l(u)
            : Array.isArray(l)
              ? i(u, l)
              : typeof u == 'object'
                ? u[l]
                : u,
    o = t.map(
      (l) => (
        Array.isArray(l) && l.length === 1 && (l = l[0]),
        l == null || typeof l == 'function' || Array.isArray(l) || TA(l)
          ? l
          : { key: l, path: Nu(l) }
      )
    );
  return e
    .map((l) => ({ original: l, criteria: o.map((u) => a(u, l)) }))
    .slice()
    .sort((l, u) => {
      for (let c = 0; c < o.length; c++) {
        const s = CA(l.criteria[c], u.criteria[c], r[c]);
        if (s !== 0) return s;
      }
      return 0;
    })
    .map((l) => l.original);
}
function to(e, ...t) {
  const r = t.length;
  return (
    r > 1 && Yl(e, t[0], t[1]) ? (t = []) : r > 2 && Yl(t[0], t[1], t[2]) && (t = [t[0]]),
    MA(e, kA(t), ['asc'])
  );
}
var dm = (e) => e.legend.settings,
  DA = (e) => e.legend.size,
  $A = (e) => e.legend.payload,
  NA = O([$A, dm], (e, t) => {
    var r = t.itemSorter,
      n = e.flat(1);
    return r ? to(n, r) : n;
  });
function LA() {
  return M(NA);
}
function RA(e, t) {
  return FA(e) || WA(e, t) || zA(e, t) || BA();
}
function BA() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zA(e, t) {
  if (e) {
    if (typeof e == 'string') return of(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? of(e, t)
          : void 0
    );
  }
}
function of(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function WA(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function FA(e) {
  if (Array.isArray(e)) return e;
}
var Mi = 1;
function lf(e, t) {
  return (
    Math.abs(e.height - t.height) > Mi ||
    Math.abs(e.left - t.left) > Mi ||
    Math.abs(e.top - t.top) > Mi ||
    Math.abs(e.width - t.width) > Mi
  );
}
function uf(e) {
  var t = e.getBoundingClientRect();
  return { height: t.height, left: t.left, top: t.top, width: t.width };
}
function vm() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [],
    t = v.useState({ height: 0, left: 0, top: 0, width: 0 }),
    r = RA(t, 2),
    n = r[0],
    i = r[1],
    a = v.useRef(null),
    o = v.useRef(n);
  o.current = n;
  var l = v.useCallback(
    (u) => {
      if ((a.current != null && (a.current.disconnect(), (a.current = null)), u != null)) {
        var c = uf(u);
        if ((lf(c, o.current) && i(c), typeof ResizeObserver < 'u')) {
          var s = new ResizeObserver(() => {
            var f = uf(u);
            lf(f, o.current) && i(f);
          });
          (s.observe(u), (a.current = s));
        }
      }
    },
    [...e]
  );
  return (
    v.useEffect(
      () => () => {
        var u;
        (u = a.current) === null || u === void 0 || u.disconnect();
      },
      []
    ),
    [n, l]
  );
}
function Me(e) {
  return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var KA = (typeof Symbol == 'function' && Symbol.observable) || '@@observable',
  cf = KA,
  sl = () => Math.random().toString(36).substring(7).split('').join('.'),
  UA = {
    INIT: `@@redux/INIT${sl()}`,
    REPLACE: `@@redux/REPLACE${sl()}`,
    PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${sl()}`
  },
  aa = UA;
function Yu(e) {
  if (typeof e != 'object' || e === null) return !1;
  let t = e;
  for (; Object.getPrototypeOf(t) !== null;) t = Object.getPrototypeOf(t);
  return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null;
}
function hm(e, t, r) {
  if (typeof e != 'function') throw new Error(Me(2));
  if (
    (typeof t == 'function' && typeof r == 'function') ||
    (typeof r == 'function' && typeof arguments[3] == 'function')
  )
    throw new Error(Me(0));
  if ((typeof t == 'function' && typeof r > 'u' && ((r = t), (t = void 0)), typeof r < 'u')) {
    if (typeof r != 'function') throw new Error(Me(1));
    return r(hm)(e, t);
  }
  let n = e,
    i = t,
    a = new Map(),
    o = a,
    l = 0,
    u = !1;
  function c() {
    o === a &&
      ((o = new Map()),
      a.forEach((y, g) => {
        o.set(g, y);
      }));
  }
  function s() {
    if (u) throw new Error(Me(3));
    return i;
  }
  function f(y) {
    if (typeof y != 'function') throw new Error(Me(4));
    if (u) throw new Error(Me(5));
    let g = !0;
    c();
    const x = l++;
    return (
      o.set(x, y),
      function () {
        if (g) {
          if (u) throw new Error(Me(6));
          ((g = !1), c(), o.delete(x), (a = null));
        }
      }
    );
  }
  function d(y) {
    if (!Yu(y)) throw new Error(Me(7));
    if (typeof y.type > 'u') throw new Error(Me(8));
    if (typeof y.type != 'string') throw new Error(Me(17));
    if (u) throw new Error(Me(9));
    try {
      ((u = !0), (i = n(i, y)));
    } finally {
      u = !1;
    }
    return (
      (a = o).forEach((x) => {
        x();
      }),
      y
    );
  }
  function h(y) {
    if (typeof y != 'function') throw new Error(Me(10));
    ((n = y), d({ type: aa.REPLACE }));
  }
  function p() {
    const y = f;
    return {
      subscribe(g) {
        if (typeof g != 'object' || g === null) throw new Error(Me(11));
        function x() {
          const w = g;
          w.next && w.next(s());
        }
        return (x(), { unsubscribe: y(x) });
      },
      [cf]() {
        return this;
      }
    };
  }
  return (
    d({ type: aa.INIT }),
    { dispatch: d, subscribe: f, getState: s, replaceReducer: h, [cf]: p }
  );
}
function HA(e) {
  Object.keys(e).forEach((t) => {
    const r = e[t];
    if (typeof r(void 0, { type: aa.INIT }) > 'u') throw new Error(Me(12));
    if (typeof r(void 0, { type: aa.PROBE_UNKNOWN_ACTION() }) > 'u') throw new Error(Me(13));
  });
}
function pm(e) {
  const t = Object.keys(e),
    r = {};
  for (let a = 0; a < t.length; a++) {
    const o = t[a];
    typeof e[o] == 'function' && (r[o] = e[o]);
  }
  const n = Object.keys(r);
  let i;
  try {
    HA(r);
  } catch (a) {
    i = a;
  }
  return function (o = {}, l) {
    if (i) throw i;
    let u = !1;
    const c = {};
    for (let s = 0; s < n.length; s++) {
      const f = n[s],
        d = r[f],
        h = o[f],
        p = d(h, l);
      if (typeof p > 'u') throw (l && l.type, new Error(Me(14)));
      ((c[f] = p), (u = u || p !== h));
    }
    return ((u = u || n.length !== Object.keys(o).length), u ? c : o);
  };
}
function oa(...e) {
  return e.length === 0
    ? (t) => t
    : e.length === 1
      ? e[0]
      : e.reduce(
          (t, r) =>
            (...n) =>
              t(r(...n))
        );
}
function VA(...e) {
  return (t) => (r, n) => {
    const i = t(r, n);
    let a = () => {
      throw new Error(Me(15));
    };
    const o = { getState: i.getState, dispatch: (u, ...c) => a(u, ...c) },
      l = e.map((u) => u(o));
    return ((a = oa(...l)(i.dispatch)), { ...i, dispatch: a });
  };
}
function mm(e) {
  return Yu(e) && 'type' in e && typeof e.type == 'string';
}
var ym = Symbol.for('immer-nothing'),
  sf = Symbol.for('immer-draftable'),
  ze = Symbol.for('immer-state');
function yt(e, ...t) {
  throw new Error(`[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`);
}
var Je = Object,
  un = Je.getPrototypeOf,
  la = 'constructor',
  ro = 'prototype',
  Gl = 'configurable',
  ua = 'enumerable',
  Xi = 'writable',
  Gn = 'value',
  Zt = (e) => !!e && !!e[ze];
function ct(e) {
  var t;
  return e ? gm(e) || io(e) || !!e[sf] || !!((t = e[la]) != null && t[sf]) || ao(e) || oo(e) : !1;
}
var YA = Je[ro][la].toString(),
  ff = new WeakMap();
function gm(e) {
  if (!e || !Gu(e)) return !1;
  const t = un(e);
  if (t === null || t === Je[ro]) return !0;
  const r = Je.hasOwnProperty.call(t, la) && t[la];
  if (r === Object) return !0;
  if (!Jr(r)) return !1;
  let n = ff.get(r);
  return (n === void 0 && ((n = Function.toString.call(r)), ff.set(r, n)), n === YA);
}
function no(e, t, r = !0) {
  li(e) === 0
    ? (r ? Reflect.ownKeys(e) : Je.keys(e)).forEach((i) => {
        t(i, e[i], e);
      })
    : e.forEach((n, i) => t(i, n, e));
}
function li(e) {
  const t = e[ze];
  return t ? t.type_ : io(e) ? 1 : ao(e) ? 2 : oo(e) ? 3 : 0;
}
var fl = (e, t, r = li(e)) => (r === 2 ? e.has(t) : Je[ro].hasOwnProperty.call(e, t)),
  ql = (e, t, r = li(e)) => (r === 2 ? e.get(t) : e[t]),
  ca = (e, t, r, n = li(e)) => {
    n === 2 ? e.set(t, r) : n === 3 ? e.add(r) : (e[t] = r);
  };
function GA(e, t) {
  return e === t ? e !== 0 || 1 / e === 1 / t : e !== e && t !== t;
}
var io = Array.isArray,
  ao = (e) => e instanceof Map,
  oo = (e) => e instanceof Set,
  Gu = (e) => typeof e == 'object',
  Jr = (e) => typeof e == 'function',
  dl = (e) => typeof e == 'boolean';
function qA(e) {
  const t = +e;
  return Number.isInteger(t) && String(t) === e;
}
var Ut = (e) => e.copy_ || e.base_,
  qu = (e) => (e.modified_ ? e.copy_ : e.base_);
function Xl(e, t) {
  if (ao(e)) return new Map(e);
  if (oo(e)) return new Set(e);
  if (io(e)) return Array[ro].slice.call(e);
  const r = gm(e);
  if (t === !0 || (t === 'class_only' && !r)) {
    const n = Je.getOwnPropertyDescriptors(e);
    delete n[ze];
    let i = Reflect.ownKeys(n);
    for (let a = 0; a < i.length; a++) {
      const o = i[a],
        l = n[o];
      (l[Xi] === !1 && ((l[Xi] = !0), (l[Gl] = !0)),
        (l.get || l.set) && (n[o] = { [Gl]: !0, [Xi]: !0, [ua]: l[ua], [Gn]: e[o] }));
    }
    return Je.create(un(e), n);
  } else {
    const n = un(e);
    if (n !== null && r) return { ...e };
    const i = Je.create(n);
    return Je.assign(i, e);
  }
}
function Xu(e, t = !1) {
  return (
    lo(e) ||
      Zt(e) ||
      !ct(e) ||
      (li(e) > 1 && Je.defineProperties(e, { set: Di, add: Di, clear: Di, delete: Di }),
      Je.freeze(e),
      t &&
        no(
          e,
          (r, n) => {
            Xu(n, !0);
          },
          !1
        )),
    e
  );
}
function XA() {
  yt(2);
}
var Di = { [Gn]: XA };
function lo(e) {
  return e === null || !Gu(e) ? !0 : Je.isFrozen(e);
}
var sa = 'MapSet',
  Zl = 'Patches',
  df = 'ArrayMethods',
  bm = {};
function Lr(e) {
  const t = bm[e];
  return (t || yt(0, e), t);
}
var vf = (e) => !!bm[e],
  qn,
  xm = () => qn,
  ZA = (e, t) => ({
    drafts_: [],
    parent_: e,
    immer_: t,
    canAutoFreeze_: !0,
    unfinalizedDrafts_: 0,
    handledSet_: new Set(),
    processedForPatches_: new Set(),
    mapSetPlugin_: vf(sa) ? Lr(sa) : void 0,
    arrayMethodsPlugin_: vf(df) ? Lr(df) : void 0
  });
function hf(e, t) {
  t &&
    ((e.patchPlugin_ = Lr(Zl)),
    (e.patches_ = []),
    (e.inversePatches_ = []),
    (e.patchListener_ = t));
}
function Ql(e) {
  (Jl(e), e.drafts_.forEach(QA), (e.drafts_ = null));
}
function Jl(e) {
  e === qn && (qn = e.parent_);
}
var pf = (e) => (qn = ZA(qn, e));
function QA(e) {
  const t = e[ze];
  t.type_ === 0 || t.type_ === 1 ? t.revoke_() : (t.revoked_ = !0);
}
function mf(e, t) {
  t.unfinalizedDrafts_ = t.drafts_.length;
  const r = t.drafts_[0];
  if (e !== void 0 && e !== r) {
    (r[ze].modified_ && (Ql(t), yt(4)), ct(e) && (e = yf(t, e)));
    const { patchPlugin_: i } = t;
    i && i.generateReplacementPatches_(r[ze].base_, e, t);
  } else e = yf(t, r);
  return (
    JA(t, e, !0),
    Ql(t),
    t.patches_ && t.patchListener_(t.patches_, t.inversePatches_),
    e !== ym ? e : void 0
  );
}
function yf(e, t) {
  if (lo(t)) return t;
  const r = t[ze];
  if (!r) return fa(t, e.handledSet_, e);
  if (!uo(r, e)) return t;
  if (!r.modified_) return r.base_;
  if (!r.finalized_) {
    const { callbacks_: n } = r;
    if (n) for (; n.length > 0;) n.pop()(e);
    Pm(r, e);
  }
  return r.copy_;
}
function JA(e, t, r = !1) {
  !e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && Xu(t, r);
}
function wm(e) {
  ((e.finalized_ = !0), e.scope_.unfinalizedDrafts_--);
}
var uo = (e, t) => e.scope_ === t,
  eP = [];
function Am(e, t, r, n) {
  const i = Ut(e),
    a = e.type_;
  if (n !== void 0 && ql(i, n, a) === t) {
    ca(i, n, r, a);
    return;
  }
  if (!e.draftLocations_) {
    const l = (e.draftLocations_ = new Map());
    no(i, (u, c) => {
      if (Zt(c)) {
        const s = l.get(c) || [];
        (s.push(u), l.set(c, s));
      }
    });
  }
  const o = e.draftLocations_.get(t) ?? eP;
  for (const l of o) ca(i, l, r, a);
}
function tP(e, t, r) {
  e.callbacks_.push(function (i) {
    var l;
    const a = t;
    if (!a || !uo(a, i)) return;
    (l = i.mapSetPlugin_) == null || l.fixSetContents(a);
    const o = qu(a);
    (Am(e, a.draft_ ?? a, o, r), Pm(a, i));
  });
}
function Pm(e, t) {
  var n;
  if (
    e.modified_ &&
    !e.finalized_ &&
    (e.type_ === 3 ||
      (e.type_ === 1 && e.allIndicesReassigned_) ||
      (((n = e.assigned_) == null ? void 0 : n.size) ?? 0) > 0)
  ) {
    const { patchPlugin_: i } = t;
    if (i) {
      const a = i.getPath(e);
      a && i.generatePatches_(e, a, t);
    }
    wm(e);
  }
}
function rP(e, t, r) {
  const { scope_: n } = e;
  if (Zt(r)) {
    const i = r[ze];
    uo(i, n) &&
      i.callbacks_.push(function () {
        Zi(e);
        const o = qu(i);
        Am(e, r, o, t);
      });
  } else
    ct(r) &&
      e.callbacks_.push(function () {
        const a = Ut(e);
        e.type_ === 3
          ? a.has(r) && fa(r, n.handledSet_, n)
          : ql(a, t, e.type_) === r &&
            n.drafts_.length > 1 &&
            (e.assigned_.get(t) ?? !1) === !0 &&
            e.copy_ &&
            fa(ql(e.copy_, t, e.type_), n.handledSet_, n);
      });
}
function fa(e, t, r) {
  return (
    (!r.immer_.autoFreeze_ && r.unfinalizedDrafts_ < 1) ||
      Zt(e) ||
      t.has(e) ||
      !ct(e) ||
      lo(e) ||
      (t.add(e),
      no(e, (n, i) => {
        if (Zt(i)) {
          const a = i[ze];
          if (uo(a, r)) {
            const o = qu(a);
            (ca(e, n, o, e.type_), wm(a));
          }
        } else ct(i) && fa(i, t, r);
      })),
    e
  );
}
function nP(e, t) {
  const r = io(e),
    n = {
      type_: r ? 1 : 0,
      scope_: t ? t.scope_ : xm(),
      modified_: !1,
      finalized_: !1,
      assigned_: void 0,
      parent_: t,
      base_: e,
      draft_: null,
      copy_: null,
      revoke_: null,
      isManual_: !1,
      callbacks_: void 0
    };
  let i = n,
    a = da;
  r && ((i = [n]), (a = Xn));
  const { revoke: o, proxy: l } = Proxy.revocable(i, a);
  return ((n.draft_ = l), (n.revoke_ = o), [l, n]);
}
var da = {
    get(e, t) {
      if (t === ze) return e;
      let r = e.scope_.arrayMethodsPlugin_;
      const n = e.type_ === 1 && typeof t == 'string';
      if (n && r != null && r.isArrayOperationMethod(t)) return r.createMethodInterceptor(e, t);
      const i = Ut(e);
      if (!fl(i, t, e.type_)) return aP(e, i, t);
      const a = i[t];
      if (
        e.finalized_ ||
        !ct(a) ||
        (n && e.operationMethod && r != null && r.isMutatingArrayMethod(e.operationMethod) && qA(t))
      )
        return a;
      if (a === vl(e.base_, t) || iP(e, t, a)) {
        Zi(e);
        const o = e.type_ === 1 ? +t : t,
          l = tu(e.scope_, a, e, o);
        return (e.copy_[o] = l);
      }
      return a;
    },
    has(e, t) {
      return t in Ut(e);
    },
    ownKeys(e) {
      return Reflect.ownKeys(Ut(e));
    },
    set(e, t, r) {
      const n = Om(Ut(e), t);
      if (n != null && n.set) return (n.set.call(e.draft_, r), !0);
      if (!e.modified_) {
        const i = vl(Ut(e), t),
          a = i == null ? void 0 : i[ze];
        if (a && a.base_ === r) return ((e.copy_[t] = r), e.assigned_.set(t, !1), !0);
        if (GA(r, i) && (r !== void 0 || fl(e.base_, t, e.type_))) return !0;
        (Zi(e), eu(e));
      }
      return (
        (e.copy_[t] === r && (r !== void 0 || fl(e.copy_, t, e.type_))) ||
          (Number.isNaN(r) && Number.isNaN(e.copy_[t])) ||
          ((e.copy_[t] = r), e.assigned_.set(t, !0), rP(e, t, r)),
        !0
      );
    },
    deleteProperty(e, t) {
      return (
        Zi(e),
        vl(e.base_, t) !== void 0 || t in e.base_
          ? (e.assigned_.set(t, !1), eu(e))
          : e.assigned_.delete(t),
        e.copy_ && delete e.copy_[t],
        !0
      );
    },
    getOwnPropertyDescriptor(e, t) {
      const r = Ut(e),
        n = Reflect.getOwnPropertyDescriptor(r, t);
      return n && { [Xi]: !0, [Gl]: e.type_ !== 1 || t !== 'length', [ua]: n[ua], [Gn]: r[t] };
    },
    defineProperty() {
      yt(11);
    },
    getPrototypeOf(e) {
      return un(e.base_);
    },
    setPrototypeOf() {
      yt(12);
    }
  },
  Xn = {};
for (let e in da) {
  let t = da[e];
  Xn[e] = function () {
    const r = arguments;
    return ((r[0] = r[0][0]), t.apply(this, r));
  };
}
Xn.deleteProperty = function (e, t) {
  return Xn.set.call(this, e, t, void 0);
};
Xn.set = function (e, t, r) {
  return da.set.call(this, e[0], t, r, e[0]);
};
function vl(e, t) {
  const r = e[ze];
  return (r ? Ut(r) : e)[t];
}
function iP(e, t, r) {
  var n;
  return e.type_ !== 1 ||
    !e.allIndicesReassigned_ ||
    ((n = e.assigned_) != null && n.get(t)) ||
    !ct(r) ||
    r[ze]
    ? !1
    : e.baseRefs_.has(r);
}
function aP(e, t, r) {
  var i;
  const n = Om(t, r);
  return n ? (Gn in n ? n[Gn] : (i = n.get) == null ? void 0 : i.call(e.draft_)) : void 0;
}
function Om(e, t) {
  if (!(t in e)) return;
  let r = un(e);
  for (; r;) {
    const n = Object.getOwnPropertyDescriptor(r, t);
    if (n) return n;
    r = un(r);
  }
}
function eu(e) {
  e.modified_ || ((e.modified_ = !0), e.parent_ && eu(e.parent_));
}
function Zi(e) {
  e.copy_ ||
    ((e.assigned_ = new Map()), (e.copy_ = Xl(e.base_, e.scope_.immer_.useStrictShallowCopy_)));
}
var oP = class {
  constructor(e) {
    ((this.autoFreeze_ = !0),
      (this.useStrictShallowCopy_ = !1),
      (this.useStrictIteration_ = !1),
      (this.produce = (t, r, n) => {
        if (Jr(t) && !Jr(r)) {
          const a = r;
          r = t;
          const o = this;
          return function (u = a, ...c) {
            return o.produce(u, (s) => r.call(this, s, ...c));
          };
        }
        (Jr(r) || yt(6), n !== void 0 && !Jr(n) && yt(7));
        let i;
        if (ct(t)) {
          const a = pf(this),
            o = tu(a, t, void 0);
          let l = !0;
          try {
            ((i = r(o)), (l = !1));
          } finally {
            l ? Ql(a) : Jl(a);
          }
          return (hf(a, n), mf(i, a));
        } else if (!t || !Gu(t)) {
          if (
            ((i = r(t)),
            i === void 0 && (i = t),
            i === ym && (i = void 0),
            this.autoFreeze_ && Xu(i, !0),
            n)
          ) {
            const a = [],
              o = [];
            (Lr(Zl).generateReplacementPatches_(t, i, { patches_: a, inversePatches_: o }),
              n(a, o));
          }
          return i;
        } else yt(1, t);
      }),
      (this.produceWithPatches = (t, r) => {
        if (Jr(t)) return (o, ...l) => this.produceWithPatches(o, (u) => t(u, ...l));
        let n, i;
        return [
          this.produce(t, r, (o, l) => {
            ((n = o), (i = l));
          }),
          n,
          i
        ];
      }),
      dl(e == null ? void 0 : e.autoFreeze) && this.setAutoFreeze(e.autoFreeze),
      dl(e == null ? void 0 : e.useStrictShallowCopy) &&
        this.setUseStrictShallowCopy(e.useStrictShallowCopy),
      dl(e == null ? void 0 : e.useStrictIteration) &&
        this.setUseStrictIteration(e.useStrictIteration));
  }
  createDraft(e) {
    (ct(e) || yt(8), Zt(e) && (e = ot(e)));
    const t = pf(this),
      r = tu(t, e, void 0);
    return ((r[ze].isManual_ = !0), Jl(t), r);
  }
  finishDraft(e, t) {
    const r = e && e[ze];
    (!r || !r.isManual_) && yt(9);
    const { scope_: n } = r;
    return (hf(n, t), mf(void 0, n));
  }
  setAutoFreeze(e) {
    this.autoFreeze_ = e;
  }
  setUseStrictShallowCopy(e) {
    this.useStrictShallowCopy_ = e;
  }
  setUseStrictIteration(e) {
    this.useStrictIteration_ = e;
  }
  shouldUseStrictIteration() {
    return this.useStrictIteration_;
  }
  applyPatches(e, t) {
    let r;
    for (r = t.length - 1; r >= 0; r--) {
      const i = t[r];
      if (i.path.length === 0 && i.op === 'replace') {
        e = i.value;
        break;
      }
    }
    r > -1 && (t = t.slice(r + 1));
    const n = Lr(Zl).applyPatches_;
    return Zt(e) ? n(e, t) : this.produce(e, (i) => n(i, t));
  }
};
function tu(e, t, r, n) {
  const [i, a] = ao(t) ? Lr(sa).proxyMap_(t, r) : oo(t) ? Lr(sa).proxySet_(t, r) : nP(t, r);
  return (
    ((r == null ? void 0 : r.scope_) ?? xm()).drafts_.push(i),
    (a.callbacks_ = (r == null ? void 0 : r.callbacks_) ?? []),
    (a.key_ = n),
    r && n !== void 0
      ? tP(r, a, n)
      : a.callbacks_.push(function (u) {
          var s;
          (s = u.mapSetPlugin_) == null || s.fixSetContents(a);
          const { patchPlugin_: c } = u;
          a.modified_ && c && c.generatePatches_(a, [], u);
        }),
    i
  );
}
function ot(e) {
  return (Zt(e) || yt(10, e), Sm(e));
}
function Sm(e) {
  if (!ct(e) || lo(e)) return e;
  const t = e[ze];
  let r,
    n = !0;
  if (t) {
    if (!t.modified_) return t.base_;
    ((t.finalized_ = !0),
      (r = Xl(e, t.scope_.immer_.useStrictShallowCopy_)),
      (n = t.scope_.immer_.shouldUseStrictIteration()));
  } else r = Xl(e, !0);
  return (
    no(
      r,
      (i, a) => {
        ca(r, i, Sm(a));
      },
      n
    ),
    t && (t.finalized_ = !1),
    r
  );
}
var lP = new oP(),
  Em = lP.produce,
  Q = (e) => e;
function Im(e) {
  return ({ dispatch: r, getState: n }) =>
    (i) =>
    (a) =>
      typeof a == 'function' ? a(r, n, e) : i(a);
}
var uP = Im(),
  cP = Im,
  sP =
    typeof window < 'u' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : function () {
          if (arguments.length !== 0)
            return typeof arguments[0] == 'object' ? oa : oa.apply(null, arguments);
        };
function tt(e, t) {
  function r(...n) {
    if (t) {
      let i = t(...n);
      if (!i) throw new Error(et(0));
      return {
        type: e,
        payload: i.payload,
        ...('meta' in i && { meta: i.meta }),
        ...('error' in i && { error: i.error })
      };
    }
    return { type: e, payload: n[0] };
  }
  return ((r.toString = () => `${e}`), (r.type = e), (r.match = (n) => mm(n) && n.type === e), r);
}
var km = class Rn extends Array {
  constructor(...t) {
    (super(...t), Object.setPrototypeOf(this, Rn.prototype));
  }
  static get [Symbol.species]() {
    return Rn;
  }
  concat(...t) {
    return super.concat.apply(this, t);
  }
  prepend(...t) {
    return t.length === 1 && Array.isArray(t[0])
      ? new Rn(...t[0].concat(this))
      : new Rn(...t.concat(this));
  }
};
function gf(e) {
  return ct(e) ? Em(e, () => {}) : e;
}
function $i(e, t, r) {
  return e.has(t) ? e.get(t) : e.set(t, r(t)).get(t);
}
function fP(e) {
  return typeof e == 'boolean';
}
var dP = () =>
    function (t) {
      const {
        thunk: r = !0,
        immutableCheck: n = !0,
        serializableCheck: i = !0,
        actionCreatorCheck: a = !0
      } = t ?? {};
      let o = new km();
      return (r && (fP(r) ? o.push(uP) : o.push(cP(r.extraArgument))), o);
    },
  Cm = 'RTK_autoBatch',
  oe = () => (e) => ({ payload: e, meta: { [Cm]: !0 } }),
  bf = (e) => (t) => {
    setTimeout(t, e);
  },
  vP = (e, t) => (r) => {
    let n = !1;
    const i = () => {
        n || ((n = !0), cancelAnimationFrame(a), clearTimeout(o), r());
      },
      a = e(i),
      o = setTimeout(i, t);
  },
  jm =
    (e = { type: 'raf' }) =>
    (t) =>
    (...r) => {
      const n = t(...r);
      let i = !0,
        a = !1,
        o = !1;
      const l = new Set(),
        u =
          e.type === 'tick'
            ? queueMicrotask
            : e.type === 'raf'
              ? typeof window < 'u' && window.requestAnimationFrame
                ? vP(window.requestAnimationFrame, 100)
                : bf(10)
              : e.type === 'callback'
                ? e.queueNotification
                : bf(e.timeout),
        c = () => {
          ((o = !1), a && ((a = !1), l.forEach((s) => s())));
        };
      return Object.assign({}, n, {
        subscribe(s) {
          const f = () => i && s(),
            d = n.subscribe(f);
          return (
            l.add(s),
            () => {
              (d(), l.delete(s));
            }
          );
        },
        dispatch(s) {
          var f;
          try {
            return (
              (i = !((f = s == null ? void 0 : s.meta) != null && f[Cm])),
              (a = !i),
              a && (o || ((o = !0), u(c))),
              n.dispatch(s)
            );
          } finally {
            i = !0;
          }
        }
      });
    },
  hP = (e) =>
    function (r) {
      const { autoBatch: n = !0 } = r ?? {};
      let i = new km(e);
      return (n && i.push(jm(typeof n == 'object' ? n : void 0)), i);
    };
function pP(e) {
  const t = dP(),
    {
      reducer: r = void 0,
      middleware: n,
      devTools: i = !0,
      preloadedState: a = void 0,
      enhancers: o = void 0
    } = e || {};
  let l;
  if (typeof r == 'function') l = r;
  else if (Yu(r)) l = pm(r);
  else throw new Error(et(1));
  let u;
  typeof n == 'function' ? (u = n(t)) : (u = t());
  let c = oa;
  i && (c = sP({ trace: !1, ...(typeof i == 'object' && i) }));
  const s = VA(...u),
    f = hP(s);
  let d = typeof o == 'function' ? o(f) : f();
  const h = c(...d);
  return hm(l, a, h);
}
function _m(e) {
  const t = {},
    r = [];
  let n;
  const i = {
    addCase(a, o) {
      const l = typeof a == 'string' ? a : a.type;
      if (!l) throw new Error(et(28));
      if (l in t) throw new Error(et(29));
      return ((t[l] = o), i);
    },
    addAsyncThunk(a, o) {
      return (
        o.pending && (t[a.pending.type] = o.pending),
        o.rejected && (t[a.rejected.type] = o.rejected),
        o.fulfilled && (t[a.fulfilled.type] = o.fulfilled),
        o.settled && r.push({ matcher: a.settled, reducer: o.settled }),
        i
      );
    },
    addMatcher(a, o) {
      return (r.push({ matcher: a, reducer: o }), i);
    },
    addDefaultCase(a) {
      return ((n = a), i);
    }
  };
  return (e(i), [t, r, n]);
}
function mP(e) {
  return typeof e == 'function';
}
function yP(e, t) {
  let [r, n, i] = _m(t),
    a;
  if (mP(e)) a = () => gf(e());
  else {
    const l = gf(e);
    a = () => l;
  }
  function o(l = a(), u) {
    let c = [r[u.type], ...n.filter(({ matcher: s }) => s(u)).map(({ reducer: s }) => s)];
    return (
      c.filter((s) => !!s).length === 0 && (c = [i]),
      c.reduce((s, f) => {
        if (f)
          if (Zt(s)) {
            const h = f(s, u);
            return h === void 0 ? s : h;
          } else {
            if (ct(s)) return Em(s, (d) => f(d, u));
            {
              const d = f(s, u);
              if (d === void 0) {
                if (s === null) return s;
                throw Error('A case reducer on a non-draftable value must not return undefined');
              }
              return d;
            }
          }
        return s;
      }, l)
    );
  }
  return ((o.getInitialState = a), o);
}
var gP = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW',
  bP = (e = 21) => {
    let t = '',
      r = e;
    for (; r--;) t += gP[(Math.random() * 64) | 0];
    return t;
  },
  xP = Symbol.for('rtk-slice-createasyncthunk');
function wP(e, t) {
  return `${e}/${t}`;
}
function AP({ creators: e } = {}) {
  var r;
  const t = (r = e == null ? void 0 : e.asyncThunk) == null ? void 0 : r[xP];
  return function (i) {
    const { name: a, reducerPath: o = a } = i;
    if (!a) throw new Error(et(11));
    const l = (typeof i.reducers == 'function' ? i.reducers(OP()) : i.reducers) || {},
      u = Object.keys(l),
      c = {
        sliceCaseReducersByName: {},
        sliceCaseReducersByType: {},
        actionCreators: {},
        sliceMatchers: []
      },
      s = {
        addCase(w, P) {
          const b = typeof w == 'string' ? w : w.type;
          if (!b) throw new Error(et(12));
          if (b in c.sliceCaseReducersByType) throw new Error(et(13));
          return ((c.sliceCaseReducersByType[b] = P), s);
        },
        addMatcher(w, P) {
          return (c.sliceMatchers.push({ matcher: w, reducer: P }), s);
        },
        exposeAction(w, P) {
          return ((c.actionCreators[w] = P), s);
        },
        exposeCaseReducer(w, P) {
          return ((c.sliceCaseReducersByName[w] = P), s);
        }
      };
    u.forEach((w) => {
      const P = l[w],
        b = { reducerName: w, type: wP(a, w), createNotation: typeof i.reducers == 'function' };
      EP(P) ? kP(b, P, s, t) : SP(b, P, s);
    });
    function f() {
      const [w = {}, P = [], b = void 0] =
          typeof i.extraReducers == 'function' ? _m(i.extraReducers) : [i.extraReducers],
        S = { ...w, ...c.sliceCaseReducersByType };
      return yP(i.initialState, (E) => {
        for (let C in S) E.addCase(C, S[C]);
        for (let C of c.sliceMatchers) E.addMatcher(C.matcher, C.reducer);
        for (let C of P) E.addMatcher(C.matcher, C.reducer);
        b && E.addDefaultCase(b);
      });
    }
    const d = (w) => w,
      h = new Map(),
      p = new WeakMap();
    let m;
    function y(w, P) {
      return (m || (m = f()), m(w, P));
    }
    function g() {
      return (m || (m = f()), m.getInitialState());
    }
    function x(w, P = !1) {
      function b(E) {
        let C = E[w];
        return (typeof C > 'u' && P && (C = $i(p, b, g)), C);
      }
      function S(E = d) {
        const C = $i(h, P, () => new WeakMap());
        return $i(C, E, () => {
          const k = {};
          for (const [j, I] of Object.entries(i.selectors ?? {}))
            k[j] = PP(I, E, () => $i(p, E, g), P);
          return k;
        });
      }
      return {
        reducerPath: w,
        getSelectors: S,
        get selectors() {
          return S(b);
        },
        selectSlice: b
      };
    }
    const A = {
      name: a,
      reducer: y,
      actions: c.actionCreators,
      caseReducers: c.sliceCaseReducersByName,
      getInitialState: g,
      ...x(o),
      injectInto(w, { reducerPath: P, ...b } = {}) {
        const S = P ?? o;
        return (w.inject({ reducerPath: S, reducer: y }, b), { ...A, ...x(S, !0) });
      }
    };
    return A;
  };
}
function PP(e, t, r, n) {
  function i(a, ...o) {
    let l = t(a);
    return (typeof l > 'u' && n && (l = r()), e(l, ...o));
  }
  return ((i.unwrapped = e), i);
}
var We = AP();
function OP() {
  function e(t, r) {
    return { _reducerDefinitionType: 'asyncThunk', payloadCreator: t, ...r };
  }
  return (
    (e.withTypes = () => e),
    {
      reducer(t) {
        return Object.assign(
          {
            [t.name](...r) {
              return t(...r);
            }
          }[t.name],
          { _reducerDefinitionType: 'reducer' }
        );
      },
      preparedReducer(t, r) {
        return { _reducerDefinitionType: 'reducerWithPrepare', prepare: t, reducer: r };
      },
      asyncThunk: e
    }
  );
}
function SP({ type: e, reducerName: t, createNotation: r }, n, i) {
  let a, o;
  if ('reducer' in n) {
    if (r && !IP(n)) throw new Error(et(17));
    ((a = n.reducer), (o = n.prepare));
  } else a = n;
  i.addCase(e, a)
    .exposeCaseReducer(t, a)
    .exposeAction(t, o ? tt(e, o) : tt(e));
}
function EP(e) {
  return e._reducerDefinitionType === 'asyncThunk';
}
function IP(e) {
  return e._reducerDefinitionType === 'reducerWithPrepare';
}
function kP({ type: e, reducerName: t }, r, n, i) {
  if (!i) throw new Error(et(18));
  const { payloadCreator: a, fulfilled: o, pending: l, rejected: u, settled: c, options: s } = r,
    f = i(e, a, s);
  (n.exposeAction(t, f),
    o && n.addCase(f.fulfilled, o),
    l && n.addCase(f.pending, l),
    u && n.addCase(f.rejected, u),
    c && n.addMatcher(f.settled, c),
    n.exposeCaseReducer(t, {
      fulfilled: o || Ni,
      pending: l || Ni,
      rejected: u || Ni,
      settled: c || Ni
    }));
}
function Ni() {}
var CP = 'task',
  Tm = 'listener',
  Mm = 'completed',
  Zu = 'cancelled',
  jP = `task-${Zu}`,
  _P = `task-${Mm}`,
  ru = `${Tm}-${Zu}`,
  TP = `${Tm}-${Mm}`,
  co = class {
    constructor(e) {
      ji(this, 'code');
      ji(this, 'name', 'TaskAbortError');
      ji(this, 'message');
      ((this.code = e), (this.message = `${CP} ${Zu} (reason: ${e})`));
    }
  },
  Qu = (e, t) => {
    if (typeof e != 'function') throw new TypeError(et(32));
  },
  va = () => {},
  Dm = (e, t = va) => (e.catch(t), e),
  $m = (e, t) => (
    e.addEventListener('abort', t, { once: !0 }),
    () => e.removeEventListener('abort', t)
  ),
  _r = (e) => {
    if (e.aborted) throw new co(e.reason);
  };
function Nm(e, t) {
  let r = va;
  return new Promise((n, i) => {
    const a = () => i(new co(e.reason));
    if (e.aborted) {
      a();
      return;
    }
    ((r = $m(e, a)), t.finally(() => r()).then(n, i));
  }).finally(() => {
    r = va;
  });
}
var MP = async (e, t) => {
    try {
      return (await Promise.resolve(), { status: 'ok', value: await e() });
    } catch (r) {
      return { status: r instanceof co ? 'cancelled' : 'rejected', error: r };
    } finally {
      t == null || t();
    }
  },
  ha = (e) => (t) => Dm(Nm(e, t).then((r) => (_r(e), r))),
  Lm = (e) => {
    const t = ha(e);
    return (r) => t(new Promise((n) => setTimeout(n, r)));
  },
  { assign: rn } = Object,
  xf = {},
  so = 'listenerMiddleware',
  DP = (e, t) => {
    const r = (n) => $m(e, () => n.abort(e.reason));
    return (n, i) => {
      Qu(n);
      const a = new AbortController();
      r(a);
      const o = MP(
        async () => {
          (_r(e), _r(a.signal));
          const l = await n({ pause: ha(a.signal), delay: Lm(a.signal), signal: a.signal });
          return (_r(a.signal), l);
        },
        () => a.abort(_P)
      );
      return (
        i != null && i.autoJoin && t.push(o.catch(va)),
        {
          result: ha(e)(o),
          cancel() {
            a.abort(jP);
          }
        }
      );
    };
  },
  $P = (e, t) => {
    const r = async (n, i) => {
      _r(t);
      let a = () => {};
      const l = [
        new Promise((u, c) => {
          let s = e({
            predicate: n,
            effect: (f, d) => {
              (d.unsubscribe(), u([f, d.getState(), d.getOriginalState()]));
            }
          });
          a = () => {
            (s(), c());
          };
        })
      ];
      i != null && l.push(new Promise((u) => setTimeout(u, i, null)));
      try {
        const u = await Nm(t, Promise.race(l));
        return (_r(t), u);
      } finally {
        a();
      }
    };
    return (n, i) => Dm(r(n, i));
  },
  Rm = (e) => {
    let { type: t, actionCreator: r, matcher: n, predicate: i, effect: a } = e;
    if (t) i = tt(t).match;
    else if (r) ((t = r.type), (i = r.match));
    else if (n) i = n;
    else if (!i) throw new Error(et(21));
    return (Qu(a), { predicate: i, type: t, effect: a });
  },
  Bm = rn(
    (e) => {
      const { type: t, predicate: r, effect: n } = Rm(e);
      return {
        id: bP(),
        effect: n,
        type: t,
        predicate: r,
        pending: new Set(),
        unsubscribe: () => {
          throw new Error(et(22));
        }
      };
    },
    { withTypes: () => Bm }
  ),
  wf = (e, t) => {
    const { type: r, effect: n, predicate: i } = Rm(t);
    return Array.from(e.values()).find(
      (a) => (typeof r == 'string' ? a.type === r : a.predicate === i) && a.effect === n
    );
  },
  nu = (e) => {
    e.pending.forEach((t) => {
      t.abort(ru);
    });
  },
  NP = (e, t) => () => {
    for (const r of t.keys()) nu(r);
    e.clear();
  },
  Af = (e, t, r) => {
    try {
      e(t, r);
    } catch (n) {
      setTimeout(() => {
        throw n;
      }, 0);
    }
  },
  zm = rn(tt(`${so}/add`), { withTypes: () => zm }),
  LP = tt(`${so}/removeAll`),
  Wm = rn(tt(`${so}/remove`), { withTypes: () => Wm }),
  RP = (...e) => {
    console.error(`${so}/error`, ...e);
  },
  ui = (e = {}) => {
    const t = new Map(),
      r = new Map(),
      n = (h) => {
        const p = r.get(h) ?? 0;
        r.set(h, p + 1);
      },
      i = (h) => {
        const p = r.get(h) ?? 1;
        p === 1 ? r.delete(h) : r.set(h, p - 1);
      },
      { extra: a, onError: o = RP } = e;
    Qu(o);
    const l = (h) => (
        (h.unsubscribe = () => t.delete(h.id)),
        t.set(h.id, h),
        (p) => {
          (h.unsubscribe(), p != null && p.cancelActive && nu(h));
        }
      ),
      u = (h) => {
        const p = wf(t, h) ?? Bm(h);
        return l(p);
      };
    rn(u, { withTypes: () => u });
    const c = (h) => {
      const p = wf(t, h);
      return (p && (p.unsubscribe(), h.cancelActive && nu(p)), !!p);
    };
    rn(c, { withTypes: () => c });
    const s = async (h, p, m, y) => {
        const g = new AbortController(),
          x = $P(u, g.signal),
          A = [];
        try {
          (h.pending.add(g),
            n(h),
            await Promise.resolve(
              h.effect(
                p,
                rn({}, m, {
                  getOriginalState: y,
                  condition: (w, P) => x(w, P).then(Boolean),
                  take: x,
                  delay: Lm(g.signal),
                  pause: ha(g.signal),
                  extra: a,
                  signal: g.signal,
                  fork: DP(g.signal, A),
                  unsubscribe: h.unsubscribe,
                  subscribe: () => {
                    t.set(h.id, h);
                  },
                  cancelActiveListeners: () => {
                    h.pending.forEach((w, P, b) => {
                      w !== g && (w.abort(ru), b.delete(w));
                    });
                  },
                  cancel: () => {
                    (g.abort(ru), h.pending.delete(g));
                  },
                  throwIfCancelled: () => {
                    _r(g.signal);
                  }
                })
              )
            ));
        } catch (w) {
          w instanceof co || Af(o, w, { raisedBy: 'effect' });
        } finally {
          (await Promise.all(A), g.abort(TP), i(h), h.pending.delete(g));
        }
      },
      f = NP(t, r);
    return {
      middleware: (h) => (p) => (m) => {
        if (!mm(m)) return p(m);
        if (zm.match(m)) return u(m.payload);
        if (LP.match(m)) {
          f();
          return;
        }
        if (Wm.match(m)) return c(m.payload);
        let y = h.getState();
        const g = () => {
          if (y === xf) throw new Error(et(23));
          return y;
        };
        let x;
        try {
          if (((x = p(m)), t.size > 0)) {
            const A = h.getState(),
              w = Array.from(t.values());
            for (const P of w) {
              let b = !1;
              try {
                b = P.predicate(m, A, y);
              } catch (S) {
                ((b = !1), Af(o, S, { raisedBy: 'predicate' }));
              }
              b && s(P, m, h, g);
            }
          }
        } finally {
          y = xf;
        }
        return x;
      },
      startListening: u,
      stopListening: c,
      clearListeners: f
    };
  };
function et(e) {
  return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var BP = {
    layoutType: 'horizontal',
    width: 0,
    height: 0,
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
    scale: 1
  },
  Fm = We({
    name: 'chartLayout',
    initialState: BP,
    reducers: {
      setLayout(e, t) {
        e.layoutType = t.payload;
      },
      setChartSize(e, t) {
        ((e.width = t.payload.width), (e.height = t.payload.height));
      },
      setMargin(e, t) {
        var r, n, i, a;
        ((e.margin.top = (r = t.payload.top) !== null && r !== void 0 ? r : 0),
          (e.margin.right = (n = t.payload.right) !== null && n !== void 0 ? n : 0),
          (e.margin.bottom = (i = t.payload.bottom) !== null && i !== void 0 ? i : 0),
          (e.margin.left = (a = t.payload.left) !== null && a !== void 0 ? a : 0));
      },
      setScale(e, t) {
        e.scale = t.payload;
      }
    }
  }),
  fo = Fm.actions,
  zP = fo.setMargin,
  WP = fo.setLayout,
  FP = fo.setChartSize,
  KP = fo.setScale,
  UP = Fm.reducer;
function Km(e, t, r) {
  return Array.isArray(e) && e && t + r !== 0 ? e.slice(t, r + 1) : e;
}
function H(e) {
  return Number.isFinite(e);
}
function Dt(e) {
  return typeof e == 'number' && e > 0 && Number.isFinite(e);
}
function Pf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Ge(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Pf(Object(r), !0).forEach(function (n) {
          HP(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Pf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function HP(e, t, r) {
  return (
    (t = VP(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function VP(e) {
  var t = YP(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function YP(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function X(e, t, r) {
  return ue(e) || ue(t) ? r : ut(t) ? Mt(e, t, r) : typeof t == 'function' ? t(e) : r;
}
var GP = (e, t, r) => {
    if (t && r) {
      var n = r.width,
        i = r.height,
        a = t.align,
        o = t.verticalAlign,
        l = t.layout,
        u = t.position,
        c = t.offset,
        s = c === void 0 ? 0 : c;
      if (u != null) {
        if (Ru(u)) {
          if (u === 'top' && T(e.top)) return Ge(Ge({}, e), {}, { top: e.top + (i || 0) + s });
          if (u === 'bottom' && T(e.bottom))
            return Ge(Ge({}, e), {}, { bottom: e.bottom + (i || 0) + s });
          if (u === 'left' && T(e.left)) return Ge(Ge({}, e), {}, { left: e.left + (n || 0) + s });
          if (u === 'right' && T(e.right))
            return Ge(Ge({}, e), {}, { right: e.right + (n || 0) + s });
        }
        return e;
      }
      if ((l === 'vertical' || (l === 'horizontal' && o === 'middle')) && a !== 'center' && T(e[a]))
        return Ge(Ge({}, e), {}, { [a]: e[a] + (n || 0) });
      if ((l === 'horizontal' || (l === 'vertical' && a === 'center')) && o !== 'middle' && T(e[o]))
        return Ge(Ge({}, e), {}, { [o]: e[o] + (i || 0) });
    }
    return e;
  },
  At = (e, t) =>
    (e === 'horizontal' && t === 'xAxis') ||
    (e === 'vertical' && t === 'yAxis') ||
    (e === 'centric' && t === 'angleAxis') ||
    (e === 'radial' && t === 'radiusAxis'),
  Um = (e, t, r, n) => {
    if (n) return e.map((l) => l.coordinate);
    var i,
      a,
      o = e.map(
        (l) => (l.coordinate === t && (i = !0), l.coordinate === r && (a = !0), l.coordinate)
      );
    return (i || o.push(t), a || o.push(r), o);
  },
  Hm = (e, t, r) => {
    if (!e) return null;
    var n = e.duplicateDomain,
      i = e.type,
      a = e.range,
      o = e.scale,
      l = e.realScaleType,
      u = e.isCategorical,
      c = e.categoricalDomain,
      s = e.tickCount,
      f = e.ticks,
      d = e.niceTicks,
      h = e.axisType;
    if (!o) return null;
    var p = l === 'scaleBand' && o.bandwidth ? o.bandwidth() / 2 : 2,
      m = i === 'category' && o.bandwidth ? o.bandwidth() / p : 0;
    if (((m = h === 'angleAxis' && a && a.length >= 2 ? je(a[0] - a[1]) * 2 * m : m), f || d)) {
      var y = (f || d || [])
        .map((g, x) => {
          var A = n ? n.indexOf(g) : g,
            w = o.map(A);
          return H(w) ? { coordinate: w + m, value: g, offset: m, index: x } : null;
        })
        .filter(Ue);
      return y;
    }
    return u && c
      ? c
          .map((g, x) => {
            var A = o.map(g);
            return H(A) ? { coordinate: A + m, value: g, index: x, offset: m } : null;
          })
          .filter(Ue)
      : o.ticks && s != null
        ? o
            .ticks(s)
            .map((g, x) => {
              var A = o.map(g);
              return H(A) ? { coordinate: A + m, value: g, index: x, offset: m } : null;
            })
            .filter(Ue)
        : o
            .domain()
            .map((g, x) => {
              var A = o.map(g);
              return H(A) ? { coordinate: A + m, value: n ? n[g] : g, index: x, offset: m } : null;
            })
            .filter(Ue);
  },
  qP = (e, t) => {
    if (!t || t.length !== 2 || !T(t[0]) || !T(t[1])) return e;
    var r = Math.min(t[0], t[1]),
      n = Math.max(t[0], t[1]),
      i = [e[0], e[1]];
    return (
      (!T(e[0]) || e[0] < r) && (i[0] = r),
      (!T(e[1]) || e[1] > n) && (i[1] = n),
      i[0] > n && (i[0] = n),
      i[1] < r && (i[1] = r),
      i
    );
  },
  XP = (e) => {
    var t,
      r = e.length;
    if (!(r <= 0)) {
      var n = (t = e[0]) === null || t === void 0 ? void 0 : t.length;
      if (!(n == null || n <= 0))
        for (var i = 0; i < n; ++i)
          for (var a = 0, o = 0, l = 0; l < r; ++l) {
            var u = e[l],
              c = u == null ? void 0 : u[i];
            if (c != null) {
              var s = c[1],
                f = c[0],
                d = bt(s) ? f : s;
              d >= 0 ? ((c[0] = a), (a += d), (c[1] = a)) : ((c[0] = o), (o += d), (c[1] = o));
            }
          }
    }
  },
  ZP = (e) => {
    var t,
      r = e.length;
    if (!(r <= 0)) {
      var n = (t = e[0]) === null || t === void 0 ? void 0 : t.length;
      if (!(n == null || n <= 0))
        for (var i = 0; i < n; ++i)
          for (var a = 0, o = 0; o < r; ++o) {
            var l = e[o],
              u = l == null ? void 0 : l[i];
            if (u != null) {
              var c = bt(u[1]) ? u[0] : u[1];
              c >= 0 ? ((u[0] = a), (a += c), (u[1] = a)) : ((u[0] = 0), (u[1] = 0));
            }
          }
    }
  },
  QP = { sign: XP, expand: bw, none: Nr, silhouette: xw, wiggle: ww, positive: ZP },
  JP = (e, t, r) => {
    var n,
      i = (n = QP[r]) !== null && n !== void 0 ? n : Nr,
      a = gw()
        .keys(t)
        .value((l, u) => Number(X(l, u, 0)))
        .order(Wl)
        .offset(i),
      o = a(e);
    return (
      o.forEach((l, u) => {
        l.forEach((c, s) => {
          var f = X(e[s], t[u], 0);
          Array.isArray(f) &&
            f.length === 2 &&
            T(f[0]) &&
            T(f[1]) &&
            ((c[0] = f[0]), (c[1] = f[1]));
        });
      }),
      o
    );
  };
function Vm(e) {
  return e == null ? void 0 : String(e);
}
function pa(e) {
  var t = e.axis,
    r = e.ticks,
    n = e.bandSize,
    i = e.entry,
    a = e.index,
    o = e.dataKey;
  if (t.type === 'category') {
    if (!t.allowDuplicatedCategory && t.dataKey && !ue(i[t.dataKey])) {
      var l = hp(r, 'value', i[t.dataKey]);
      if (l) return l.coordinate + n / 2;
    }
    return r != null && r[a] ? r[a].coordinate + n / 2 : null;
  }
  var u = X(i, ue(o) ? t.dataKey : o),
    c = t.scale.map(u);
  return T(c) ? c : null;
}
var Of = (e) => {
    var t = e.axis,
      r = e.ticks,
      n = e.offset,
      i = e.bandSize,
      a = e.entry,
      o = e.index;
    if (t.type === 'category') return r[o] ? r[o].coordinate + n : null;
    var l = X(a, t.dataKey, t.scale.domain()[o]);
    if (ue(l)) return null;
    var u = t.scale.map(l);
    return T(u) ? u - i / 2 + n : null;
  },
  eO = (e) => {
    var t = e.numericAxis,
      r = t.scale.domain();
    if (t.type === 'number') {
      var n = Math.min(r[0], r[1]),
        i = Math.max(r[0], r[1]);
      return n <= 0 && i >= 0 ? 0 : i < 0 ? i : n;
    }
    return r[0];
  },
  tO = (e) => {
    var t = e.flat(2).filter(T);
    return [Math.min(...t), Math.max(...t)];
  },
  rO = (e) => [e[0] === 1 / 0 ? 0 : e[0], e[1] === -1 / 0 ? 0 : e[1]],
  nO = (e, t, r) => {
    if (!(e == null || Object.keys(e).length === 0))
      return rO(
        Object.keys(e).reduce(
          (n, i) => {
            var a = e[i];
            if (!a) return n;
            var o = a.stackedData,
              l = o.reduce(
                (u, c) => {
                  var s = Km(c, t, r),
                    f = tO(s);
                  return !H(f[0]) || !H(f[1]) ? u : [Math.min(u[0], f[0]), Math.max(u[1], f[1])];
                },
                [1 / 0, -1 / 0]
              );
            return [Math.min(l[0], n[0]), Math.max(l[1], n[1])];
          },
          [1 / 0, -1 / 0]
        )
      );
  },
  Sf = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/,
  Ef = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/,
  cr = (e, t, r) => {
    if (e && e.scale && e.scale.bandwidth) {
      var n = e.scale.bandwidth();
      if (!r || n > 0) return n;
    }
    if (e && t && t.length >= 2) {
      for (var i = to(t, (m) => m.coordinate), a = [], o = 0, l = 1, u = i.length; l < u; l++) {
        var c,
          s,
          f =
            (((c = i[l]) === null || c === void 0 ? void 0 : c.coordinate) || 0) -
            (((s = i[l - 1]) === null || s === void 0 ? void 0 : s.coordinate) || 0);
        (a.push(f), (o = Math.max(f, o)));
      }
      var d = o * 1e-4,
        h = 1 / 0;
      for (var p of a) p > d && (h = Math.min(p, h));
      return h === 1 / 0 ? 0 : h;
    }
    return r ? void 0 : 0;
  };
function If(e) {
  var t = e.tooltipEntrySettings,
    r = e.dataKey,
    n = e.payload,
    i = e.value,
    a = e.name;
  return Ge(Ge({}, t), {}, { dataKey: r, payload: n, value: i, name: a });
}
function vr(e, t) {
  if (e != null) return String(e);
  if (typeof t == 'string') return t;
}
var iO = (e, t) => {
    if (t === 'horizontal') return e.relativeX;
    if (t === 'vertical') return e.relativeY;
  },
  aO = (e, t) => (t === 'centric' ? e.angle : e.radius),
  Rt = (e) => e.layout.width,
  Bt = (e) => e.layout.height,
  oO = (e) => e.layout.scale,
  Ju = (e) => e.layout.margin,
  vo = O(
    (e) => e.cartesianAxis.xAxis,
    (e) => Object.values(e)
  ),
  ho = O(
    (e) => e.cartesianAxis.yAxis,
    (e) => Object.values(e)
  ),
  Ym = 'data-recharts-item-index',
  Gm = 'data-recharts-item-id',
  ci = 60,
  ec = 30;
function kf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Li(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? kf(Object(r), !0).forEach(function (n) {
          lO(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : kf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function lO(e, t, r) {
  return (
    (t = uO(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function uO(e) {
  var t = cO(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function cO(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var sO = (e) => e.brush.height;
function fO(e) {
  var t = ho(e);
  return t.reduce((r, n) => {
    if (n.orientation === 'left' && !n.mirror && !n.hide) {
      var i = typeof n.width == 'number' ? n.width : ci;
      return r + i;
    }
    return r;
  }, 0);
}
function dO(e) {
  var t = ho(e);
  return t.reduce((r, n) => {
    if (n.orientation === 'right' && !n.mirror && !n.hide) {
      var i = typeof n.width == 'number' ? n.width : ci;
      return r + i;
    }
    return r;
  }, 0);
}
function vO(e) {
  var t = vo(e);
  return t.reduce((r, n) => {
    if (n.orientation === 'top' && !n.mirror && !n.hide) {
      var i = typeof n.height == 'number' ? n.height : ec;
      return r + i;
    }
    return r;
  }, 0);
}
function hO(e) {
  var t = vo(e);
  return t.reduce((r, n) => {
    if (n.orientation === 'bottom' && !n.mirror && !n.hide) {
      var i = typeof n.height == 'number' ? n.height : ec;
      return r + i;
    }
    return r;
  }, 0);
}
var Se = O([Rt, Bt, Ju, sO, fO, dO, vO, hO, dm, DA], (e, t, r, n, i, a, o, l, u, c) => {
    var s = { left: (r.left || 0) + i, right: (r.right || 0) + a },
      f = { top: (r.top || 0) + o, bottom: (r.bottom || 0) + l },
      d = Li(Li({}, f), s),
      h = d.bottom;
    ((d.bottom += n), (d = GP(d, u, c)));
    var p = e - d.left - d.right,
      m = t - d.top - d.bottom;
    return Li(Li({ brushBottom: h }, d), {}, { width: Math.max(p, 0), height: Math.max(m, 0) });
  }),
  qm = O(Se, (e) => ({ x: e.left, y: e.top, width: e.width, height: e.height })),
  tc = O(Rt, Bt, (e, t) => ({ x: 0, y: 0, width: e, height: t })),
  pO = v.createContext(null),
  Ee = () => v.useContext(pO) != null,
  po = (e) => e.brush,
  mo = O([po, Se, Ju], (e, t, r) => ({
    height: e.height,
    x: T(e.x) ? e.x : t.left,
    y: T(e.y) ? e.y : t.top + t.height + t.brushBottom - ((r == null ? void 0 : r.bottom) || 0),
    width: T(e.width) ? e.width : t.width
  }));
function mO(e, t, { signal: r, edges: n } = {}) {
  let i,
    a = null;
  const o = n != null && n.includes('leading'),
    l = n == null || n.includes('trailing'),
    u = () => {
      a !== null && (e.apply(i, a), (i = void 0), (a = null));
    },
    c = () => {
      (l && u(), h());
    };
  let s = null;
  const f = () => {
      (s != null && clearTimeout(s),
        (s = setTimeout(() => {
          ((s = null), c());
        }, t)));
    },
    d = () => {
      s !== null && (clearTimeout(s), (s = null));
    },
    h = () => {
      (d(), (i = void 0), (a = null));
    },
    p = () => {
      u();
    },
    m = function (...y) {
      if (r != null && r.aborted) return;
      ((i = this), (a = y));
      const g = s == null;
      (f(), o && g && u());
    };
  return (
    (m.schedule = f),
    (m.cancel = h),
    (m.flush = p),
    r == null || r.addEventListener('abort', h, { once: !0 }),
    m
  );
}
function yO(e, t = 0, r = {}) {
  typeof r != 'object' && (r = {});
  const { leading: n = !1, trailing: i = !0, maxWait: a } = r,
    o = Array(2);
  (n && (o[0] = 'leading'), i && (o[1] = 'trailing'));
  let l,
    u = null;
  const c = mO(
      function (...d) {
        ((l = e.apply(this, d)), (u = null));
      },
      t,
      { edges: o }
    ),
    s = function (...d) {
      return a != null && (u === null && (u = Date.now()), Date.now() - u >= a)
        ? ((l = e.apply(this, d)), (u = Date.now()), c.cancel(), c.schedule(), l)
        : (c.apply(this, d), l);
    },
    f = () => (c.flush(), l);
  return ((s.cancel = c.cancel), (s.flush = f), s);
}
function gO(e, t = 0, r = {}) {
  const { leading: n = !0, trailing: i = !0 } = r;
  return yO(e, t, { leading: n, maxWait: t, trailing: i });
}
var ma = function (t, r) {
    for (var n = arguments.length, i = new Array(n > 2 ? n - 2 : 0), a = 2; a < n; a++)
      i[a - 2] = arguments[a];
    if (
      typeof console < 'u' &&
      console.warn &&
      (r === void 0 && console.warn('LogUtils requires an error message argument'), !t)
    )
      if (r === void 0)
        console.warn(
          'Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.'
        );
      else {
        var o = 0;
        console.warn(r.replace(/%s/g, () => i[o++]));
      }
  },
  Ct = {
    width: '100%',
    height: '100%',
    debounce: 0,
    minWidth: 0,
    initialDimension: { width: -1, height: -1 }
  },
  Xm = (e, t, r) => {
    var n = r.width,
      i = n === void 0 ? Ct.width : n,
      a = r.height,
      o = a === void 0 ? Ct.height : a,
      l = r.aspect,
      u = r.maxHeight,
      c = $r(i) ? e : Number(i),
      s = $r(o) ? t : Number(o);
    return (
      l && l > 0 && (c ? (s = c / l) : s && (c = s * l), u && s != null && s > u && (s = u)),
      { calculatedWidth: c, calculatedHeight: s }
    );
  },
  bO = { width: 0, height: 0, overflow: 'visible' },
  xO = { width: 0, overflowX: 'visible' },
  wO = { height: 0, overflowY: 'visible' },
  AO = {},
  PO = (e) => {
    var t = e.width,
      r = e.height,
      n = $r(t),
      i = $r(r);
    return n && i ? bO : n ? xO : i ? wO : AO;
  };
function OO(e) {
  var t = e.width,
    r = e.height,
    n = e.aspect,
    i = t,
    a = r;
  return (
    i === void 0 && a === void 0
      ? ((i = Ct.width), (a = Ct.height))
      : i === void 0
        ? (i = n && n > 0 ? void 0 : Ct.width)
        : a === void 0 && (a = n && n > 0 ? void 0 : Ct.height),
    { width: i, height: a }
  );
}
var SO = [
  'aspect',
  'initialDimension',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxHeight',
  'children',
  'debounce',
  'id',
  'className',
  'onResize',
  'style'
];
function ya() {
  return (
    (ya = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    ya.apply(null, arguments)
  );
}
function Cf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function jf(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Cf(Object(r), !0).forEach(function (n) {
          EO(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Cf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function EO(e, t, r) {
  return (
    (t = IO(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function IO(e) {
  var t = kO(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function kO(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function CO(e, t) {
  return MO(e) || TO(e, t) || _O(e, t) || jO();
}
function jO() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _O(e, t) {
  if (e) {
    if (typeof e == 'string') return _f(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? _f(e, t)
          : void 0
    );
  }
}
function _f(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function TO(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function MO(e) {
  if (Array.isArray(e)) return e;
}
function DO(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = $O(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function $O(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var Zm = v.createContext(Ct.initialDimension);
function NO(e) {
  return Dt(e.width) && Dt(e.height);
}
function Qm(e) {
  var t = e.children,
    r = e.width,
    n = e.height,
    i = v.useMemo(() => ({ width: r, height: n }), [r, n]);
  return NO(i) ? v.createElement(Zm.Provider, { value: i }, t) : null;
}
var rc = () => v.useContext(Zm),
  LO = v.forwardRef((e, t) => {
    var r = e.aspect,
      n = e.initialDimension,
      i = n === void 0 ? Ct.initialDimension : n,
      a = e.width,
      o = e.height,
      l = e.minWidth,
      u = l === void 0 ? Ct.minWidth : l,
      c = e.minHeight,
      s = e.maxHeight,
      f = e.children,
      d = e.debounce,
      h = d === void 0 ? Ct.debounce : d,
      p = e.id,
      m = e.className,
      y = e.onResize,
      g = e.style,
      x = g === void 0 ? {} : g,
      A = DO(e, SO),
      w = v.useRef(null),
      P = v.useRef();
    ((P.current = y), v.useImperativeHandle(t, () => w.current));
    var b = v.useState({ containerWidth: i.width, containerHeight: i.height }),
      S = CO(b, 2),
      E = S[0],
      C = S[1],
      k = v.useCallback((z, W) => {
        C((B) => {
          var Y = Math.round(z),
            K = Math.round(W);
          return B.containerWidth === Y && B.containerHeight === K
            ? B
            : { containerWidth: Y, containerHeight: K };
        });
      }, []);
    v.useEffect(() => {
      if (w.current == null || typeof ResizeObserver > 'u') return dr;
      var z = (pe) => {
        var be,
          de = pe[0];
        if (de != null) {
          var Ke = de.contentRect,
            Xe = Ke.width,
            ht = Ke.height;
          (k(Xe, ht), (be = P.current) === null || be === void 0 || be.call(P, Xe, ht));
        }
      };
      h > 0 && (z = gO(z, h, { trailing: !0, leading: !1 }));
      var W = new ResizeObserver(z),
        B = w.current.getBoundingClientRect(),
        Y = B.width,
        K = B.height;
      return (
        k(Y, K),
        W.observe(w.current),
        () => {
          W.disconnect();
        }
      );
    }, [k, h]);
    var j = E.containerWidth,
      I = E.containerHeight;
    ma(!r || r > 0, 'The aspect(%s) must be greater than zero.', r);
    var R = Xm(j, I, { width: a, height: o, aspect: r, maxHeight: s }),
      D = R.calculatedWidth,
      $ = R.calculatedHeight;
    return (
      ma(
        j < 0 || I < 0 || (D != null && D > 0) || ($ != null && $ > 0),
        `The width(%s) and height(%s) of chart should be greater than 0,
       please check the style of container, or the props width(%s) and height(%s),
       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the
       height and width.`,
        D,
        $,
        a,
        o,
        u,
        c,
        r
      ),
      v.createElement(
        'div',
        ya(
          {
            id: p ? ''.concat(p) : void 0,
            className: Z('recharts-responsive-container', m),
            style: jf(
              jf({}, x),
              {},
              { width: a, height: o, minWidth: u, minHeight: c, maxHeight: s }
            ),
            ref: w
          },
          A
        ),
        v.createElement(
          'div',
          { style: PO({ width: a, height: o }) },
          v.createElement(Qm, { width: D, height: $ }, f)
        )
      )
    );
  }),
  CW = v.forwardRef((e, t) => {
    var r = rc();
    if (Dt(r.width) && Dt(r.height)) return e.children;
    var n = OO({ width: e.width, height: e.height, aspect: e.aspect }),
      i = n.width,
      a = n.height,
      o = Xm(void 0, void 0, { width: i, height: a, aspect: e.aspect, maxHeight: e.maxHeight }),
      l = o.calculatedWidth,
      u = o.calculatedHeight;
    return T(l) && T(u)
      ? v.createElement(Qm, { width: l, height: u }, e.children)
      : v.createElement(LO, ya({}, e, { width: i, height: a, ref: t }));
  }),
  si = () => {
    var e,
      t = Ee(),
      r = M(qm),
      n = M(mo),
      i = (e = M(po)) === null || e === void 0 ? void 0 : e.padding;
    return !t || !n || !i
      ? r
      : {
          width: n.width - i.left - i.right,
          height: n.height - i.top - i.bottom,
          x: i.left,
          y: i.top
        };
  },
  RO = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, brushBottom: 0 },
  Jm = () => {
    var e;
    return (e = M(Se)) !== null && e !== void 0 ? e : RO;
  },
  nc = () => M(Rt),
  ic = () => M(Bt),
  BO = () => M((e) => e.layout.margin),
  q = (e) => e.layout.layoutType,
  hr = () => M(q),
  ac = () => {
    var e = hr();
    if (e === 'horizontal' || e === 'vertical') return e;
  },
  oc = (e) => {
    var t = e.layout.layoutType;
    if (t === 'centric' || t === 'radial') return t;
  },
  zO = () => M(oc),
  WO = () => {
    var e = hr();
    return e !== void 0;
  },
  fi = (e) => {
    var t = ee(),
      r = Ee(),
      n = e.width,
      i = e.height,
      a = rc(),
      o = n,
      l = i;
    return (
      a && ((o = a.width > 0 ? a.width : n), (l = a.height > 0 ? a.height : i)),
      v.useEffect(() => {
        !r && Dt(o) && Dt(l) && t(FP({ width: o, height: l }));
      }, [t, r, o, l]),
      null
    );
  },
  FO = {
    settings: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      itemSorter: 'value',
      position: void 0,
      offset: 0
    },
    size: { width: 0, height: 0 },
    payload: []
  },
  ey = We({
    name: 'legend',
    initialState: FO,
    reducers: {
      setLegendSize(e, t) {
        ((e.size.width = t.payload.width), (e.size.height = t.payload.height));
      },
      setLegendSettings(e, t) {
        ((e.settings.align = t.payload.align),
          (e.settings.layout = t.payload.layout),
          (e.settings.verticalAlign = t.payload.verticalAlign),
          (e.settings.itemSorter = t.payload.itemSorter),
          (e.settings.position = t.payload.position),
          (e.settings.offset = t.payload.offset));
      },
      addLegendPayload: {
        reducer(e, t) {
          e.payload.push(Q(t.payload));
        },
        prepare: oe()
      },
      replaceLegendPayload: {
        reducer(e, t) {
          var r = t.payload,
            n = r.prev,
            i = r.next,
            a = ot(e).payload.indexOf(Q(n));
          a > -1 && (e.payload[a] = Q(i));
        },
        prepare: oe()
      },
      removeLegendPayload: {
        reducer(e, t) {
          var r = ot(e).payload.indexOf(Q(t.payload));
          r > -1 && e.payload.splice(r, 1);
        },
        prepare: oe()
      }
    }
  }),
  di = ey.actions,
  Tf = di.setLegendSize,
  KO = di.setLegendSettings,
  ty = di.addLegendPayload,
  ry = di.replaceLegendPayload,
  ny = di.removeLegendPayload,
  UO = ey.reducer,
  HO = {};
/**
 * @license React
 * use-sync-external-store-with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var vi = v;
function VO(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var YO = typeof Object.is == 'function' ? Object.is : VO,
  GO = vi.useSyncExternalStore,
  qO = vi.useRef,
  XO = vi.useEffect,
  ZO = vi.useMemo,
  QO = vi.useDebugValue;
HO.useSyncExternalStoreWithSelector = function (e, t, r, n, i) {
  var a = qO(null);
  if (a.current === null) {
    var o = { hasValue: !1, value: null };
    a.current = o;
  } else o = a.current;
  a = ZO(
    function () {
      function u(h) {
        if (!c) {
          if (((c = !0), (s = h), (h = n(h)), i !== void 0 && o.hasValue)) {
            var p = o.value;
            if (i(p, h)) return (f = p);
          }
          return (f = h);
        }
        if (((p = f), YO(s, h))) return p;
        var m = n(h);
        return i !== void 0 && i(p, m) ? ((s = h), p) : ((s = h), (f = m));
      }
      var c = !1,
        s,
        f,
        d = r === void 0 ? null : r;
      return [
        function () {
          return u(t());
        },
        d === null
          ? void 0
          : function () {
              return u(d());
            }
      ];
    },
    [t, r, n, i]
  );
  var l = GO(e, a[0], a[1]);
  return (
    XO(
      function () {
        ((o.hasValue = !0), (o.value = l));
      },
      [l]
    ),
    QO(l),
    l
  );
};
function JO(e) {
  e();
}
function e1() {
  let e = null,
    t = null;
  return {
    clear() {
      ((e = null), (t = null));
    },
    notify() {
      JO(() => {
        let r = e;
        for (; r;) (r.callback(), (r = r.next));
      });
    },
    get() {
      const r = [];
      let n = e;
      for (; n;) (r.push(n), (n = n.next));
      return r;
    },
    subscribe(r) {
      let n = !0;
      const i = (t = { callback: r, next: null, prev: t });
      return (
        i.prev ? (i.prev.next = i) : (e = i),
        function () {
          !n ||
            e === null ||
            ((n = !1),
            i.next ? (i.next.prev = i.prev) : (t = i.prev),
            i.prev ? (i.prev.next = i.next) : (e = i.next));
        }
      );
    }
  };
}
var Mf = { notify() {}, get: () => [] };
function t1(e, t) {
  let r,
    n = Mf,
    i = 0,
    a = !1;
  function o(m) {
    s();
    const y = n.subscribe(m);
    let g = !1;
    return () => {
      g || ((g = !0), y(), f());
    };
  }
  function l() {
    n.notify();
  }
  function u() {
    p.onStateChange && p.onStateChange();
  }
  function c() {
    return a;
  }
  function s() {
    (i++, r || ((r = e.subscribe(u)), (n = e1())));
  }
  function f() {
    (i--, r && i === 0 && (r(), (r = void 0), n.clear(), (n = Mf)));
  }
  function d() {
    a || ((a = !0), s());
  }
  function h() {
    a && ((a = !1), f());
  }
  const p = {
    addNestedSub: o,
    notifyNestedSubs: l,
    handleChangeWrapper: u,
    isSubscribed: c,
    trySubscribe: d,
    tryUnsubscribe: h,
    getListeners: () => n
  };
  return p;
}
var r1 = () =>
    typeof window < 'u' &&
    typeof window.document < 'u' &&
    typeof window.document.createElement < 'u',
  n1 = r1(),
  i1 = () => typeof navigator < 'u' && navigator.product === 'ReactNative',
  a1 = i1(),
  o1 = () => (n1 || a1 ? v.useLayoutEffect : v.useEffect),
  l1 = o1();
function Df(e, t) {
  return e === t ? e !== 0 || t !== 0 || 1 / e === 1 / t : e !== e && t !== t;
}
function u1(e, t) {
  if (Df(e, t)) return !0;
  if (typeof e != 'object' || e === null || typeof t != 'object' || t === null) return !1;
  const r = Object.keys(e),
    n = Object.keys(t);
  if (r.length !== n.length) return !1;
  for (let i = 0; i < r.length; i++)
    if (!Object.prototype.hasOwnProperty.call(t, r[i]) || !Df(e[r[i]], t[r[i]])) return !1;
  return !0;
}
var hl = Symbol.for('react-redux-context'),
  pl = typeof globalThis < 'u' ? globalThis : {};
function c1() {
  if (!v.createContext) return {};
  const e = pl[hl] ?? (pl[hl] = new Map());
  let t = e.get(v.createContext);
  return (t || ((t = v.createContext(null)), e.set(v.createContext, t)), t);
}
var s1 = c1();
function f1(e) {
  const { children: t, context: r, serverState: n, store: i } = e,
    a = v.useMemo(() => {
      const u = t1(i);
      return { store: i, subscription: u, getServerState: n ? () => n : void 0 };
    }, [i, n]),
    o = v.useMemo(() => i.getState(), [i]);
  l1(() => {
    const { subscription: u } = a;
    return (
      (u.onStateChange = u.notifyNestedSubs),
      u.trySubscribe(),
      o !== i.getState() && u.notifyNestedSubs(),
      () => {
        (u.tryUnsubscribe(), (u.onStateChange = void 0));
      }
    );
  }, [a, o]);
  const l = r || s1;
  return v.createElement(l.Provider, { value: a }, t);
}
var d1 = f1,
  v1 = new Set([
    'axisLine',
    'tickLine',
    'activeBar',
    'activeDot',
    'activeLabel',
    'activeShape',
    'allowEscapeViewBox',
    'background',
    'cursor',
    'dot',
    'label',
    'line',
    'margin',
    'padding',
    'position',
    'shape',
    'style',
    'tick',
    'wrapperStyle',
    'radius',
    'throttledEvents'
  ]);
function h1(e, t) {
  return e == null && t == null
    ? !0
    : typeof e == 'number' && typeof t == 'number'
      ? e === t || (e !== e && t !== t)
      : e === t;
}
function Fr(e, t) {
  var r = new Set([...Object.keys(e), ...Object.keys(t)]);
  for (var n of r)
    if (v1.has(n)) {
      if (e[n] == null && t[n] == null) continue;
      if (!u1(e[n], t[n])) return !1;
    } else if (!h1(e[n], t[n])) return !1;
  return !0;
}
var p1 = O([Rt, Bt, Ju], (e, t, r) => ({
  x: r.left || 0,
  y: r.top || 0,
  width: Math.max(e - (r.left || 0) - (r.right || 0), 0),
  height: Math.max(t - (r.top || 0) - (r.bottom || 0), 0)
}));
function m1(e, t) {
  var r;
  if (e === 'start' && t === 'start') return '';
  var n = { start: '0', middle: '-50%', end: '-100%' },
    i = { start: '0', middle: '-50%', end: '-100%' },
    a = e === 'inherit' ? '0' : n[e],
    o = (r = i[t]) !== null && r !== void 0 ? r : '0';
  return 'translate('.concat(a, ', ').concat(o, ')');
}
var y1 = ['contextPayload'];
function iu() {
  return (
    (iu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    iu.apply(null, arguments)
  );
}
function g1(e, t) {
  return A1(e) || w1(e, t) || x1(e, t) || b1();
}
function b1() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function x1(e, t) {
  if (e) {
    if (typeof e == 'string') return $f(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? $f(e, t)
          : void 0
    );
  }
}
function $f(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function w1(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function A1(e) {
  if (Array.isArray(e)) return e;
}
function Nf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function cn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Nf(Object(r), !0).forEach(function (n) {
          P1(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Nf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function P1(e, t, r) {
  return (
    (t = O1(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function O1(e) {
  var t = S1(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function S1(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function E1(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = I1(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function I1(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function k1(e) {
  return e.value;
}
function C1(e) {
  var t = e.contextPayload,
    r = E1(e, y1),
    n = um(t, e.payloadUniqBy, k1),
    i = cn(cn({}, r), {}, { payload: n });
  return v.isValidElement(e.content)
    ? v.cloneElement(e.content, i)
    : typeof e.content == 'function'
      ? v.createElement(e.content, i)
      : v.createElement(Uw, i);
}
function j1(e) {
  return e === 'left' || e === 'right' || e === 'insideLeft' || e === 'insideRight'
    ? 'vertical'
    : 'horizontal';
}
function _1(e, t) {
  return t == null ? null : Ru(t) ? p1(e) : qm(e);
}
function T1(e, t, r) {
  return e === 'top'
    ? { top: r.height + t }
    : e === 'bottom'
      ? { top: -r.height - t }
      : e === 'left'
        ? { left: r.width + t }
        : e === 'right'
          ? { left: -r.width - t }
          : {};
}
function M1(e, t, r, n, i, a) {
  var o = t.layout,
    l = t.align,
    u = t.verticalAlign,
    c,
    s;
  return (
    (!e || ((e.left === void 0 || e.left === null) && (e.right === void 0 || e.right === null))) &&
      (l === 'center' && o === 'vertical'
        ? (c = { left: ((n || 0) - a.width) / 2 })
        : (c = l === 'right' ? { right: (r && r.right) || 0 } : { left: (r && r.left) || 0 })),
    (!e || ((e.top === void 0 || e.top === null) && (e.bottom === void 0 || e.bottom === null))) &&
      (u === 'middle'
        ? (s = { top: ((i || 0) - a.height) / 2 })
        : (s = u === 'bottom' ? { bottom: (r && r.bottom) || 0 } : { top: (r && r.top) || 0 })),
    cn(cn({}, c), s)
  );
}
function D1(e) {
  var t = e.align,
    r = e.layout,
    n = e.verticalAlign,
    i = e.itemSorter,
    a = e.position,
    o = e.offset,
    l = ee();
  return (
    v.useLayoutEffect(() => {
      l(KO({ align: t, layout: r, verticalAlign: n, itemSorter: i, position: a, offset: o }));
    }, [l, t, r, n, i, a, o]),
    null
  );
}
function $1(e) {
  var t = e.width,
    r = e.height,
    n = ee();
  return (
    v.useLayoutEffect(() => {
      n(Tf({ width: t, height: r }));
    }, [n, t, r]),
    v.useLayoutEffect(
      () => () => {
        n(Tf({ width: 0, height: 0 }));
      },
      [n]
    ),
    null
  );
}
function N1(e, t, r, n) {
  return e === 'vertical' && t != null
    ? { height: t }
    : e === 'horizontal'
      ? { width: r || n }
      : null;
}
var L1 = {
  align: 'center',
  iconSize: 14,
  inactiveColor: '#ccc',
  itemSorter: 'value',
  labelStyle: {},
  layout: 'auto',
  verticalAlign: 'bottom',
  offset: 0
};
function R1(e) {
  var t,
    r,
    n,
    i,
    a,
    o,
    l,
    u,
    c = ge(e, L1),
    s = e.layout && e.layout !== 'auto' ? e.layout : j1(c.position),
    f = LA(),
    d = Fx(),
    h = BO(),
    p = M((K) => _1(K, c.position)),
    m = c.width,
    y = c.height,
    g = c.wrapperStyle,
    x = c.portal,
    A = x == null && (c.position == null || Ru(c.position)),
    w = vm([f]),
    P = g1(w, 2),
    b = P[0],
    S = P[1],
    E = nc(),
    C = ic();
  if (E == null || C == null || (c.position != null && p == null)) return null;
  var k = E - ((h == null ? void 0 : h.left) || 0) - ((h == null ? void 0 : h.right) || 0),
    j = N1(s, y, m, k),
    I =
      c.position == null
        ? null
        : pp({
            viewBox: p ?? { x: 0, y: 0, width: E, height: C },
            position: c.position,
            offset: (t = c.offset) !== null && t !== void 0 ? t : 0
          }),
    R = T1(c.position, (r = c.offset) !== null && r !== void 0 ? r : 0, b),
    D =
      s === 'vertical'
        ? ((n = p == null ? void 0 : p.width) !== null && n !== void 0 ? n : 0) / 2
        : (i = p == null ? void 0 : p.width) !== null && i !== void 0
          ? i
          : 0,
    $ =
      s === 'horizontal'
        ? ((a = p == null ? void 0 : p.height) !== null && a !== void 0 ? a : 0) / 2
        : (o = p == null ? void 0 : p.height) !== null && o !== void 0
          ? o
          : 0,
    z = I
      ? {
          width: 'max-content',
          height: 'max-content',
          maxWidth: D,
          maxHeight: $,
          overflowY: 'auto',
          top: I.y + ((l = R.top) !== null && l !== void 0 ? l : 0),
          left: I.x + ((u = R.left) !== null && u !== void 0 ? u : 0),
          transform: m1(I.horizontalAnchor, I.verticalAnchor)
        }
      : M1(g, c, h, E, C, b),
    W = x
      ? g
      : cn(
          cn(
            {
              position: 'absolute',
              width: (j == null ? void 0 : j.width) || m || 'auto',
              height: (j == null ? void 0 : j.height) || y || 'auto'
            },
            z
          ),
          g
        ),
    B = x ?? d;
  if (B == null || f == null) return null;
  var Y = v.createElement(
    'div',
    { className: 'recharts-legend-wrapper', style: W, ref: S },
    v.createElement(D1, {
      layout: s,
      align: c.align,
      verticalAlign: c.verticalAlign,
      itemSorter: c.itemSorter,
      position: c.position,
      offset: c.offset
    }),
    A && v.createElement($1, b),
    v.createElement(
      C1,
      iu({}, c, { layout: s }, j, { margin: h, chartWidth: E, chartHeight: C, contextPayload: f })
    )
  );
  return Tu.createPortal(Y, B);
}
var B1 = v.memo(R1, Fr);
B1.displayName = 'Legend';
function au() {
  return (
    (au = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    au.apply(null, arguments)
  );
}
function Lf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function kn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Lf(Object(r), !0).forEach(function (n) {
          z1(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Lf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function z1(e, t, r) {
  return (
    (t = W1(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function W1(e) {
  var t = F1(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function F1(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function K1(e, t) {
  return Y1(e) || V1(e, t) || H1(e, t) || U1();
}
function U1() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function H1(e, t) {
  if (e) {
    if (typeof e == 'string') return Rf(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Rf(e, t)
          : void 0
    );
  }
}
function Rf(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function V1(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function Y1(e) {
  if (Array.isArray(e)) return e;
}
function G1(e) {
  return Array.isArray(e) && ut(e[0]) && ut(e[1]) ? e.join(' ~ ') : e;
}
var Vr = {
  separator: ' : ',
  contentStyle: {
    margin: 0,
    padding: 10,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    whiteSpace: 'nowrap'
  },
  itemStyle: { display: 'block', paddingTop: 4, paddingBottom: 4, color: '#000' },
  labelStyle: {},
  accessibilityLayer: !1
};
function q1(e, t) {
  return t == null ? e : to(e, t);
}
var X1 = (e) => {
    var t = e.separator,
      r = t === void 0 ? Vr.separator : t,
      n = e.contentStyle,
      i = e.itemStyle,
      a = e.labelStyle,
      o = a === void 0 ? Vr.labelStyle : a,
      l = e.payload,
      u = e.formatter,
      c = e.itemSorter,
      s = e.wrapperClassName,
      f = e.labelClassName,
      d = e.label,
      h = e.labelFormatter,
      p = e.accessibilityLayer,
      m = p === void 0 ? Vr.accessibilityLayer : p,
      y = () => {
        if (l && l.length) {
          var E = { padding: 0, margin: 0 },
            C = q1(l, c),
            k = C.map((j, I) => {
              if (!j || j.type === 'none') return null;
              var R = j.formatter || u || G1,
                D = j.value,
                $ = j.name,
                z = D,
                W = $;
              if (R) {
                var B = R(D, $, j, I, l);
                if (Array.isArray(B)) {
                  var Y = K1(B, 2);
                  ((z = Y[0]), (W = Y[1]));
                } else if (B != null) z = B;
                else return null;
              }
              var K = kn(kn({}, Vr.itemStyle), {}, { color: j.color || Vr.itemStyle.color }, i);
              return v.createElement(
                'li',
                { className: 'recharts-tooltip-item', key: 'tooltip-item-'.concat(I), style: K },
                ut(W)
                  ? v.createElement('span', { className: 'recharts-tooltip-item-name' }, W)
                  : null,
                ut(W)
                  ? v.createElement('span', { className: 'recharts-tooltip-item-separator' }, r)
                  : null,
                v.createElement('span', { className: 'recharts-tooltip-item-value' }, z),
                v.createElement('span', { className: 'recharts-tooltip-item-unit' }, j.unit || '')
              );
            });
          return v.createElement('ul', { className: 'recharts-tooltip-item-list', style: E }, k);
        }
        return null;
      },
      g = kn(kn({}, Vr.contentStyle), n),
      x = kn({ margin: 0 }, o),
      A = !ue(d),
      w = A ? d : '',
      P = Z('recharts-default-tooltip', s),
      b = Z('recharts-tooltip-label', f);
    A && h && l !== void 0 && l !== null && (w = h(d, l));
    var S = m ? { role: 'status', 'aria-live': 'assertive' } : {};
    return v.createElement(
      'div',
      au({ className: P, style: g }, S),
      v.createElement('p', { className: b, style: x }, v.isValidElement(w) ? w : ''.concat(w)),
      y()
    );
  },
  Cn = 'recharts-tooltip-wrapper',
  Z1 = { visibility: 'hidden' };
function Q1(e) {
  var t = e.coordinate,
    r = e.translateX,
    n = e.translateY;
  return Z(Cn, {
    [''.concat(Cn, '-right')]: T(r) && t && T(t.x) && r >= t.x,
    [''.concat(Cn, '-left')]: T(r) && t && T(t.x) && r < t.x,
    [''.concat(Cn, '-bottom')]: T(n) && t && T(t.y) && n >= t.y,
    [''.concat(Cn, '-top')]: T(n) && t && T(t.y) && n < t.y
  });
}
function Bf(e) {
  var t = e.allowEscapeViewBox,
    r = e.coordinate,
    n = e.key,
    i = e.offset,
    a = e.position,
    o = e.reverseDirection,
    l = e.tooltipDimension,
    u = e.viewBox,
    c = e.viewBoxDimension;
  if (a && T(a[n])) return a[n];
  var s = r[n] - l - (i > 0 ? i : 0),
    f = r[n] + i;
  if (t[n]) return o[n] ? s : f;
  var d = u[n];
  if (d == null) return 0;
  if (o[n]) {
    var h = s,
      p = d;
    return h < p ? Math.max(f, d) : Math.max(s, d);
  }
  if (c == null) return 0;
  var m = f + l,
    y = d + c;
  return m > y ? Math.max(s, d) : Math.max(f, d);
}
function J1(e) {
  var t = e.translateX,
    r = e.translateY,
    n = e.useTranslate3d;
  return {
    transform: n
      ? 'translate3d('.concat(t, 'px, ').concat(r, 'px, 0)')
      : 'translate('.concat(t, 'px, ').concat(r, 'px)')
  };
}
function eS(e) {
  var t = e.allowEscapeViewBox,
    r = e.coordinate,
    n = e.offsetTop,
    i = e.offsetLeft,
    a = e.position,
    o = e.reverseDirection,
    l = e.tooltipBox,
    u = e.useTranslate3d,
    c = e.viewBox,
    s,
    f,
    d;
  return (
    l && l.height > 0 && l.width > 0 && r
      ? ((f = Bf({
          allowEscapeViewBox: t,
          coordinate: r,
          key: 'x',
          offset: i,
          position: a,
          reverseDirection: o,
          tooltipDimension: l.width,
          viewBox: c,
          viewBoxDimension: c.width
        })),
        (d = Bf({
          allowEscapeViewBox: t,
          coordinate: r,
          key: 'y',
          offset: n,
          position: a,
          reverseDirection: o,
          tooltipDimension: l.height,
          viewBox: c,
          viewBoxDimension: c.height
        })),
        (s = J1({ translateX: f, translateY: d, useTranslate3d: u })))
      : (s = Z1),
    { cssProperties: s, cssClasses: Q1({ translateX: f, translateY: d, coordinate: r }) }
  );
}
var tS = () =>
    !(typeof window < 'u' && window.document && window.document.createElement && window.setTimeout),
  hi = { isSsr: tS() };
function rS(e, t) {
  return oS(e) || aS(e, t) || iS(e, t) || nS();
}
function nS() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function iS(e, t) {
  if (e) {
    if (typeof e == 'string') return zf(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? zf(e, t)
          : void 0
    );
  }
}
function zf(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function aS(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function oS(e) {
  if (Array.isArray(e)) return e;
}
function iy() {
  var e = v.useState(() =>
      hi.isSsr || !window.matchMedia
        ? !1
        : window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ),
    t = rS(e, 2),
    r = t[0],
    n = t[1];
  return (
    v.useEffect(() => {
      if (window.matchMedia) {
        var i = window.matchMedia('(prefers-reduced-motion: reduce)'),
          a = () => {
            n(i.matches);
          };
        return (
          i.addEventListener('change', a),
          () => {
            i.removeEventListener('change', a);
          }
        );
      }
    }, []),
    r
  );
}
function Wf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Yr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Wf(Object(r), !0).forEach(function (n) {
          lS(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Wf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function lS(e, t, r) {
  return (
    (t = uS(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function uS(e) {
  var t = cS(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function cS(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function sS(e, t) {
  return hS(e) || vS(e, t) || dS(e, t) || fS();
}
function fS() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function dS(e, t) {
  if (e) {
    if (typeof e == 'string') return Ff(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Ff(e, t)
          : void 0
    );
  }
}
function Ff(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function vS(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function hS(e) {
  if (Array.isArray(e)) return e;
}
function pS(e) {
  if (
    !(e.prefersReducedMotion && e.isAnimationActive === 'auto') &&
    e.isAnimationActive &&
    e.active
  ) {
    var t = typeof e.animationEasing == 'string' ? e.animationEasing : 'ease';
    return 'transform '.concat(e.animationDuration, 'ms ').concat(t);
  }
}
function mS(e) {
  var t,
    r,
    n,
    i,
    a,
    o,
    l = iy(),
    u = v.useState(() => ({ dismissed: !1, dismissedAtCoordinate: { x: 0, y: 0 } })),
    c = sS(u, 2),
    s = c[0],
    f = c[1];
  (v.useEffect(() => {
    var g = (x) => {
      if (x.key === 'Escape') {
        var A, w, P, b;
        f({
          dismissed: !0,
          dismissedAtCoordinate: {
            x:
              (A = (w = e.coordinate) === null || w === void 0 ? void 0 : w.x) !== null &&
              A !== void 0
                ? A
                : 0,
            y:
              (P = (b = e.coordinate) === null || b === void 0 ? void 0 : b.y) !== null &&
              P !== void 0
                ? P
                : 0
          }
        });
      }
    };
    return (
      document.addEventListener('keydown', g),
      () => {
        document.removeEventListener('keydown', g);
      }
    );
  }, [
    (t = e.coordinate) === null || t === void 0 ? void 0 : t.x,
    (r = e.coordinate) === null || r === void 0 ? void 0 : r.y
  ]),
    s.dismissed &&
      (((n = (i = e.coordinate) === null || i === void 0 ? void 0 : i.x) !== null && n !== void 0
        ? n
        : 0) !== s.dismissedAtCoordinate.x ||
        ((a = (o = e.coordinate) === null || o === void 0 ? void 0 : o.y) !== null && a !== void 0
          ? a
          : 0) !== s.dismissedAtCoordinate.y) &&
      f(Yr(Yr({}, s), {}, { dismissed: !1 })));
  var d = eS({
      allowEscapeViewBox: e.allowEscapeViewBox,
      coordinate: e.coordinate,
      offsetLeft: typeof e.offset == 'number' ? e.offset : e.offset.x,
      offsetTop: typeof e.offset == 'number' ? e.offset : e.offset.y,
      position: e.position,
      reverseDirection: e.reverseDirection,
      tooltipBox: e.lastBoundingBox,
      useTranslate3d: e.useTranslate3d,
      viewBox: e.viewBox
    }),
    h = d.cssClasses,
    p = d.cssProperties,
    m = e.hasPortalFromProps
      ? {}
      : Yr(
          Yr(
            {
              transition: pS({
                prefersReducedMotion: l,
                isAnimationActive: e.isAnimationActive,
                active: e.active,
                animationDuration: e.animationDuration,
                animationEasing: e.animationEasing
              })
            },
            p
          ),
          {},
          { pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }
        ),
    y = Yr(
      Yr({}, m),
      {},
      { visibility: !s.dismissed && e.active && e.hasPayload ? 'visible' : 'hidden' },
      e.wrapperStyle
    );
  return v.createElement(
    'div',
    {
      xmlns: 'http://www.w3.org/1999/xhtml',
      tabIndex: -1,
      className: h,
      style: y,
      ref: e.innerRef
    },
    e.children
  );
}
var yS = v.memo(mS),
  ay = () => {
    var e;
    return (e = M((t) => t.rootProps.accessibilityLayer)) !== null && e !== void 0 ? e : !0;
  };
function ou() {
  return (
    (ou = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    ou.apply(null, arguments)
  );
}
function Kf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Uf(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Kf(Object(r), !0).forEach(function (n) {
          gS(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Kf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function gS(e, t, r) {
  return (
    (t = bS(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function bS(e) {
  var t = xS(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function xS(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var Hf = {
    curveBasisClosed: lw,
    curveBasisOpen: uw,
    curveBasis: ow,
    curveBumpX: Vx,
    curveBumpY: Yx,
    curveLinearClosed: cw,
    curveLinear: Ja,
    curveMonotoneX: sw,
    curveMonotoneY: fw,
    curveNatural: dw,
    curveStep: vw,
    curveStepAfter: pw,
    curveStepBefore: hw
  },
  ga = (e) => H(e.x) && H(e.y),
  Vf = (e) => e.base != null && ga(e.base) && ga(e),
  jn = (e) => e.x,
  _n = (e) => e.y,
  wS = (e, t) => {
    if (typeof e == 'function') return e;
    var r = 'curve'.concat(ai(e));
    if ((r === 'curveMonotone' || r === 'curveBump') && t) {
      var n = Hf[''.concat(r).concat(t === 'vertical' ? 'Y' : 'X')];
      if (n) return n;
    }
    return Hf[r] || Ja;
  },
  Yf = { connectNulls: !1, type: 'linear' },
  AS = (e) => {
    var t = e.type,
      r = t === void 0 ? Yf.type : t,
      n = e.points,
      i = n === void 0 ? [] : n,
      a = e.baseLine,
      o = e.layout,
      l = e.connectNulls,
      u = l === void 0 ? Yf.connectNulls : l,
      c = wS(r, o),
      s = u ? i.filter(ga) : i;
    if (Array.isArray(a)) {
      var f,
        d = i.map((g, x) => Uf(Uf({}, g), {}, { base: a[x] }));
      o === 'vertical'
        ? (f = _i()
            .y(_n)
            .x1(jn)
            .x0((g) => g.base.x))
        : (f = _i()
            .x(jn)
            .y1(_n)
            .y0((g) => g.base.y));
      var h = f.defined(Vf).curve(c),
        p = u ? d.filter(Vf) : d;
      return h(p);
    }
    var m;
    o === 'vertical' && T(a)
      ? (m = _i().y(_n).x1(jn).x0(a))
      : T(a)
        ? (m = _i().x(jn).y1(_n).y0(a))
        : (m = Ap().x(jn).y(_n));
    var y = m.defined(ga).curve(c);
    return y(s);
  },
  nn = (e) => {
    var t = e.className,
      r = e.points,
      n = e.path,
      i = e.pathRef,
      a = hr();
    if ((!r || !r.length) && !n) return null;
    var o = {
        type: e.type,
        points: e.points,
        baseLine: e.baseLine,
        layout: e.layout || a,
        connectNulls: e.connectNulls
      },
      l = r && r.length ? AS(o) : n;
    return v.createElement(
      'path',
      ou({}, Ve(e), Fu(e), {
        className: Z('recharts-curve', t),
        d: l === null ? void 0 : l,
        ref: i
      })
    );
  },
  PS = ['x', 'y', 'top', 'left', 'width', 'height', 'className'];
function lu() {
  return (
    (lu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    lu.apply(null, arguments)
  );
}
function Gf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function OS(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Gf(Object(r), !0).forEach(function (n) {
          SS(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Gf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function SS(e, t, r) {
  return (
    (t = ES(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function ES(e) {
  var t = IS(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function IS(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function kS(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = CS(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function CS(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var jS = (e, t, r, n, i, a) =>
    'M'.concat(e, ',').concat(i, 'v').concat(n, 'M').concat(a, ',').concat(t, 'h').concat(r),
  _S = (e) => {
    var t = e.x,
      r = t === void 0 ? 0 : t,
      n = e.y,
      i = n === void 0 ? 0 : n,
      a = e.top,
      o = a === void 0 ? 0 : a,
      l = e.left,
      u = l === void 0 ? 0 : l,
      c = e.width,
      s = c === void 0 ? 0 : c,
      f = e.height,
      d = f === void 0 ? 0 : f,
      h = e.className,
      p = kS(e, PS),
      m = OS({ x: r, y: i, top: o, left: u, width: s, height: d }, p);
    return !T(r) || !T(i) || !T(s) || !T(d) || !T(o) || !T(u)
      ? null
      : v.createElement(
          'path',
          lu({}, Ye(m), { className: Z('recharts-cross', h), d: jS(r, i, s, d, o, u) })
        );
  };
function TS(e, t, r, n) {
  var i = n / 2;
  return {
    stroke: 'none',
    fill: '#ccc',
    x: e === 'horizontal' ? t.x - i : r.left + 0.5,
    y: e === 'horizontal' ? r.top + 0.5 : t.y - i,
    width: e === 'horizontal' ? n : r.width - 1,
    height: e === 'horizontal' ? r.height - 1 : n
  };
}
var ba = 1e-4,
  oy = (e, t) => [0, 3 * e, 3 * t - 6 * e, 3 * e - 3 * t + 1],
  ly = (e, t) => e.map((r, n) => r * t ** n).reduce((r, n) => r + n),
  qf = (e, t) => (r) => {
    var n = oy(e, t);
    return ly(n, r);
  },
  MS = (e, t) => (r) => {
    var n = oy(e, t),
      i = [...n.map((a, o) => a * o).slice(1), 0];
    return ly(i, r);
  },
  DS = (e) => {
    var t,
      r = e.split('(');
    if (r.length !== 2 || r[0] !== 'cubic-bezier') return null;
    var n =
      (t = r[1]) === null || t === void 0 || (t = t.split(')')[0]) === null || t === void 0
        ? void 0
        : t.split(',');
    if (n == null || n.length !== 4) return null;
    var i = n.map((a) => parseFloat(a));
    return [i[0], i[1], i[2], i[3]];
  },
  $S = function () {
    for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++) r[n] = arguments[n];
    if (r.length === 1)
      switch (r[0]) {
        case 'linear':
          return [0, 0, 1, 1];
        case 'ease':
          return [0.25, 0.1, 0.25, 1];
        case 'ease-in':
          return [0.42, 0, 1, 1];
        case 'ease-out':
          return [0.42, 0, 0.58, 1];
        case 'ease-in-out':
          return [0, 0, 0.58, 1];
        default: {
          var i = DS(r[0]);
          if (i) return i;
        }
      }
    return r.length === 4 ? r : [0, 0, 1, 1];
  },
  NS = (e, t, r, n) => {
    var i = qf(e, r),
      a = qf(t, n),
      o = MS(e, r),
      l = (c) => (c > 1 ? 1 : c < 0 ? 0 : c),
      u = (c) => {
        for (var s = c > 1 ? 1 : c, f = s, d = 0; d < 8; ++d) {
          var h = i(f) - s,
            p = o(f);
          if (Math.abs(h - s) < ba || p < ba) return a(f);
          f = l(f - h / p);
        }
        return a(f);
      };
    return ((u.isStepper = !1), u);
  },
  Xf = function () {
    return NS(...$S(...arguments));
  },
  LS = function () {
    for (
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
        r = t.stiff,
        n = r === void 0 ? 100 : r,
        i = t.damping,
        a = i === void 0 ? 8 : i,
        o = t.dt,
        l = o === void 0 ? 16.67 : o,
        u = 1,
        c = [0],
        s = 0,
        f = 0,
        d = 1e4,
        h = 0;
      h < d;
    ) {
      var p = -(s - u) * n,
        m = f * a;
      if (
        ((f += ((p - m) * l) / 1e3),
        (s += (f * l) / 1e3),
        c.push(s),
        Math.abs(s - u) < ba && Math.abs(f) < ba)
      )
        break;
      h++;
    }
    c[c.length - 1] = u;
    var y = c.length - 1;
    return (g) => {
      var x, A, w;
      if (g <= 0) return 0;
      if (g >= 1) return u;
      var P = g * y,
        b = Math.floor(P),
        S = P - b;
      return (
        ((x = c[b]) !== null && x !== void 0 ? x : 0) +
        (((A = c[b + 1]) !== null && A !== void 0 ? A : 0) -
          ((w = c[b]) !== null && w !== void 0 ? w : 0)) *
          S
      );
    };
  },
  RS = (e) => {
    if (typeof e == 'string')
      switch (e) {
        case 'ease':
        case 'ease-in-out':
        case 'ease-out':
        case 'ease-in':
        case 'linear':
          return Xf(e);
        case 'spring':
          return LS();
        default:
          if (e.split('(')[0] === 'cubic-bezier') return Xf(e);
      }
    return typeof e == 'function' ? e : null;
  },
  BS = (e, t, r) => {
    var n,
      i = (a) => {
        var o = t.tick(a);
        if (t.getState() === 'active') {
          if ((r(t.getInterpolated()), t.getProgress() === 1)) {
            (t.complete(), (n = void 0));
            return;
          }
          n = e.setTimeout(i, o);
          return;
        }
        n = e.setTimeout(i, o);
      };
    return (
      (n = e.setTimeout(i, 0)),
      () => {
        var a;
        return (a = n) === null || a === void 0 ? void 0 : a();
      }
    );
  },
  uy = v.createContext(BS);
uy.Provider;
function zS(e) {
  var t = v.useContext(uy);
  return v.useMemo(() => e ?? t, [e, t]);
}
function WS(e, t, r) {
  return (
    (t = FS(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function FS(e) {
  var t = KS(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function KS(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var Zf = 'init',
  Qf = 'pending',
  Jf = 'active',
  US = 'completed';
function ml(e) {
  return Math.max(0, e);
}
class HS {
  getAnimationStartedTime() {
    return this.animationStartedTime;
  }
  getBeginStartedTime() {
    return this.beginStartedTime;
  }
  constructor(t) {
    var r;
    (WS(this, 'state', Zf),
      (this.animationId = t.animationId),
      (this.onAnimationEnd = t.onAnimationEnd),
      (this.animationDuration = ml(t.animationDuration)),
      (this.animationBegin = ml(t.animationBegin)),
      (this.progress = 0),
      (this.from = t.from),
      (this.to = t.to),
      (this.easing = t.easing),
      (r = t.onAnimationStart) === null || r === void 0 || r.call(t));
  }
  getState() {
    return this.state;
  }
  getEasing() {
    return this.easing;
  }
  getAnimationDuration() {
    return this.animationDuration;
  }
  tick(t) {
    if (this.getState() === Zf)
      return ((this.state = Qf), (this.beginStartedTime = t), this.animationBegin);
    if (this.getState() === Qf) {
      if (this.beginStartedTime == null) throw new Error();
      var r = t - this.beginStartedTime;
      return r >= this.animationBegin
        ? ((this.state = Jf), (this.animationStartedTime = t), this.nextAnimationUpdate(0))
        : ml(this.animationBegin - r);
    }
    if (this.getState() === Jf) {
      if (this.animationStartedTime == null) throw new Error();
      var n = t - this.animationStartedTime;
      return (this.setProgress(n / this.animationDuration), this.nextAnimationUpdate(n));
    }
    return 0;
  }
  setProgress(t) {
    this.progress = Math.min(1, Math.max(0, t));
  }
  getProgress() {
    return this.progress;
  }
  complete() {
    if (((this.progress = 1), this.state === 'active')) {
      var t;
      (t = this.onAnimationEnd) === null || t === void 0 || t.call(this);
    }
    this.state = US;
  }
  getFrom() {
    return this.from;
  }
  getTo() {
    return this.to;
  }
  getAnimationId() {
    return this.animationId;
  }
  getAnimationBegin() {
    return this.animationBegin;
  }
}
class VS extends HS {
  nextAnimationUpdate() {
    return 0;
  }
  getInterpolated() {
    return this.easing(ae(this.getFrom(), this.getTo(), this.getProgress()));
  }
}
class YS {
  setTimeout(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0,
      n = performance.now(),
      i = null,
      a = (o) => {
        o - n >= r ? t(o) : (i = requestAnimationFrame(a));
      };
    return (
      (i = requestAnimationFrame(a)),
      () => {
        i != null && cancelAnimationFrame(i);
      }
    );
  }
}
function GS(e, t) {
  return QS(e) || ZS(e, t) || XS(e, t) || qS();
}
function qS() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function XS(e, t) {
  if (e) {
    if (typeof e == 'string') return ed(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? ed(e, t)
          : void 0
    );
  }
}
function ed(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function ZS(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function QS(e) {
  if (Array.isArray(e)) return e;
}
var JS = {
    begin: 0,
    duration: 1e3,
    easing: 'ease',
    isActive: !0,
    canBegin: !0,
    onAnimationEnd: () => {},
    onAnimationStart: () => {}
  },
  td = 0,
  yl = 1;
function cy(e) {
  var t = ge(e, JS),
    r = t.animationId,
    n = t.isActive,
    i = t.canBegin,
    a = t.duration,
    o = t.easing,
    l = t.begin,
    u = t.onAnimationEnd,
    c = t.onAnimationStart,
    s = t.children,
    f = iy(),
    d = n === 'auto' ? !hi.isSsr && !f : n,
    h = zS(t.animationController),
    p = v.useState(d ? td : yl),
    m = GS(p, 2),
    y = m[0],
    g = m[1];
  return (
    v.useEffect(() => {
      d || g(yl);
    }, [d]),
    v.useEffect(() => {
      var x = RS(o);
      if (!d || !i || x == null) return dr;
      var A = new YS(),
        w = new VS({
          animationId: r,
          easing: x,
          animationDuration: a,
          animationBegin: l,
          onAnimationStart: c,
          onAnimationEnd: u,
          from: td,
          to: yl
        });
      return h(A, w, g);
    }, [h, r, d, i, a, o, l, c, u]),
    s(Number(y))
  );
}
function sy(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'animation-',
    r = v.useRef(Vn(t)),
    n = v.useRef(e);
  return (n.current !== e && ((r.current = Vn(t)), (n.current = e)), r.current);
}
var eE = (e) => e.replace(/([A-Z])/g, (t) => '-'.concat(t.toLowerCase())),
  tE = (e, t, r) => e.map((n) => ''.concat(eE(n), ' ').concat(t, 'ms ').concat(r)).join(','),
  rE = ['radius'],
  nE = ['radius'],
  rd,
  nd,
  id,
  ad,
  od,
  ld,
  ud,
  cd,
  sd,
  fd;
function dd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function vd(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? dd(Object(r), !0).forEach(function (n) {
          iE(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : dd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function iE(e, t, r) {
  return (
    (t = aE(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function aE(e) {
  var t = oE(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function oE(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function xa() {
  return (
    (xa = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    xa.apply(null, arguments)
  );
}
function hd(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = lE(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function lE(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function uE(e, t) {
  return dE(e) || fE(e, t) || sE(e, t) || cE();
}
function cE() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function sE(e, t) {
  if (e) {
    if (typeof e == 'string') return pd(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? pd(e, t)
          : void 0
    );
  }
}
function pd(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function fE(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function dE(e) {
  if (Array.isArray(e)) return e;
}
function Et(e, t) {
  return (
    t || (t = e.slice(0)),
    Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }))
  );
}
var md = (e, t, r, n, i) => {
    var a = Vt(r),
      o = Vt(n),
      l = Math.min(Math.abs(a) / 2, Math.abs(o) / 2),
      u = o >= 0 ? 1 : -1,
      c = a >= 0 ? 1 : -1,
      s = (o >= 0 && a >= 0) || (o < 0 && a < 0) ? 1 : 0,
      f;
    if (l > 0 && Array.isArray(i)) {
      for (var d = [0, 0, 0, 0], h = 0, p = 4; h < p; h++) {
        var m,
          y = (m = i[h]) !== null && m !== void 0 ? m : 0;
        d[h] = y > l ? l : y;
      }
      ((f = De(rd || (rd = Et(['M', ',', ''])), e, t + u * d[0])),
        d[0] > 0 &&
          (f += De(
            nd || (nd = Et(['A ', ',', ',0,0,', ',', ',', ''])),
            d[0],
            d[0],
            s,
            e + c * d[0],
            t
          )),
        (f += De(id || (id = Et(['L ', ',', ''])), e + r - c * d[1], t)),
        d[1] > 0 &&
          (f += De(
            ad ||
              (ad = Et([
                'A ',
                ',',
                ',0,0,',
                `,
        `,
                ',',
                ''
              ])),
            d[1],
            d[1],
            s,
            e + r,
            t + u * d[1]
          )),
        (f += De(od || (od = Et(['L ', ',', ''])), e + r, t + n - u * d[2])),
        d[2] > 0 &&
          (f += De(
            ld ||
              (ld = Et([
                'A ',
                ',',
                ',0,0,',
                `,
        `,
                ',',
                ''
              ])),
            d[2],
            d[2],
            s,
            e + r - c * d[2],
            t + n
          )),
        (f += De(ud || (ud = Et(['L ', ',', ''])), e + c * d[3], t + n)),
        d[3] > 0 &&
          (f += De(
            cd ||
              (cd = Et([
                'A ',
                ',',
                ',0,0,',
                `,
        `,
                ',',
                ''
              ])),
            d[3],
            d[3],
            s,
            e,
            t + n - u * d[3]
          )),
        (f += 'Z'));
    } else if (l > 0 && i === +i && i > 0) {
      var g = Math.min(l, i);
      f = De(
        sd ||
          (sd = Et([
            'M ',
            ',',
            `
            A `,
            ',',
            ',0,0,',
            ',',
            ',',
            `
            L `,
            ',',
            `
            A `,
            ',',
            ',0,0,',
            ',',
            ',',
            `
            L `,
            ',',
            `
            A `,
            ',',
            ',0,0,',
            ',',
            ',',
            `
            L `,
            ',',
            `
            A `,
            ',',
            ',0,0,',
            ',',
            ',',
            ' Z'
          ])),
        e,
        t + u * g,
        g,
        g,
        s,
        e + c * g,
        t,
        e + r - c * g,
        t,
        g,
        g,
        s,
        e + r,
        t + u * g,
        e + r,
        t + n - u * g,
        g,
        g,
        s,
        e + r - c * g,
        t + n,
        e + c * g,
        t + n,
        g,
        g,
        s,
        e,
        t + n - u * g
      );
    } else f = De(fd || (fd = Et(['M ', ',', ' h ', ' v ', ' h ', ' Z'])), e, t, r, n, -r);
    return f;
  },
  yd = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: 0,
    isAnimationActive: !1,
    isUpdateAnimationActive: !1,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease'
  },
  fy = (e) => {
    var t = ge(e, yd),
      r = v.useRef(null),
      n = v.useState(-1),
      i = uE(n, 2),
      a = i[0],
      o = i[1];
    v.useEffect(() => {
      if (r.current && r.current.getTotalLength)
        try {
          var B = r.current.getTotalLength();
          B && o(B);
        } catch {}
    }, []);
    var l = t.x,
      u = t.y,
      c = t.width,
      s = t.height,
      f = t.radius,
      d = t.className,
      h = t.animationEasing,
      p = t.animationDuration,
      m = t.animationBegin,
      y = t.isAnimationActive,
      g = t.isUpdateAnimationActive,
      x = v.useRef(c),
      A = v.useRef(s),
      w = v.useRef(l),
      P = v.useRef(u),
      b = v.useMemo(() => ({ x: l, y: u, width: c, height: s, radius: f }), [l, u, c, s, f]),
      S = sy(b, 'rectangle-');
    if (l !== +l || u !== +u || c !== +c || s !== +s || c === 0 || s === 0) return null;
    var E = Z('recharts-rectangle', d);
    if (!g) {
      var C = Ye(t);
      C.radius;
      var k = hd(C, rE);
      return v.createElement(
        'path',
        xa({}, k, {
          x: Vt(l),
          y: Vt(u),
          width: Vt(c),
          height: Vt(s),
          radius: typeof f == 'number' ? f : void 0,
          className: E,
          d: md(l, u, c, s, f)
        })
      );
    }
    var j = x.current,
      I = A.current,
      R = w.current,
      D = P.current,
      $ = '0px '.concat(a === -1 ? 1 : a, 'px'),
      z = ''.concat(a, 'px ').concat(a, 'px'),
      W = tE(['strokeDasharray'], p, typeof h == 'string' ? h : yd.animationEasing);
    return v.createElement(
      cy,
      { animationId: S, key: S, canBegin: a > 0, duration: p, easing: h, isActive: g, begin: m },
      (B) => {
        var Y = ae(j, c, B),
          K = ae(I, s, B),
          pe = ae(R, l, B),
          be = ae(D, u, B);
        r.current && ((x.current = Y), (A.current = K), (w.current = pe), (P.current = be));
        var de;
        y
          ? B > 0
            ? (de = { transition: W, strokeDasharray: z })
            : (de = { strokeDasharray: $ })
          : (de = { strokeDasharray: z });
        var Ke = Ye(t);
        Ke.radius;
        var Xe = hd(Ke, nE);
        return v.createElement(
          'path',
          xa({}, Xe, {
            radius: typeof f == 'number' ? f : void 0,
            className: E,
            d: md(pe, be, Y, K, f),
            ref: r,
            style: vd(vd({}, de), t.style)
          })
        );
      }
    );
  };
function gd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function bd(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? gd(Object(r), !0).forEach(function (n) {
          vE(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : gd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function vE(e, t, r) {
  return (
    (t = hE(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function hE(e) {
  var t = pE(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function pE(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var wa = Math.PI / 180,
  mE = (e) => (e * 180) / Math.PI,
  xe = (e, t, r, n) => ({ x: e + Math.cos(-wa * n) * r, y: t + Math.sin(-wa * n) * r }),
  dy = function (t, r) {
    var n =
      arguments.length > 2 && arguments[2] !== void 0
        ? arguments[2]
        : { top: 0, right: 0, bottom: 0, left: 0 };
    return (
      Math.min(
        Math.abs(t - (n.left || 0) - (n.right || 0)),
        Math.abs(r - (n.top || 0) - (n.bottom || 0))
      ) / 2
    );
  },
  yE = (e, t) => {
    var r = e.x,
      n = e.y,
      i = t.x,
      a = t.y;
    return Math.sqrt((r - i) ** 2 + (n - a) ** 2);
  },
  gE = (e, t) => {
    var r = e.x,
      n = e.y,
      i = t.cx,
      a = t.cy,
      o = yE({ x: r, y: n }, { x: i, y: a });
    if (o <= 0) return { radius: o, angle: 0 };
    var l = (r - i) / o,
      u = Math.acos(l);
    return (n > a && (u = 2 * Math.PI - u), { radius: o, angle: mE(u), angleInRadian: u });
  },
  bE = (e) => {
    var t = e.startAngle,
      r = e.endAngle,
      n = Math.floor(t / 360),
      i = Math.floor(r / 360),
      a = Math.min(n, i);
    return { startAngle: t - a * 360, endAngle: r - a * 360 };
  },
  xE = (e, t) => {
    var r = t.startAngle,
      n = t.endAngle,
      i = Math.floor(r / 360),
      a = Math.floor(n / 360),
      o = Math.min(i, a);
    return e + o * 360;
  },
  wE = (e, t) => {
    var r = e.relativeX,
      n = e.relativeY,
      i = gE({ x: r, y: n }, t),
      a = i.radius,
      o = i.angle,
      l = t.innerRadius,
      u = t.outerRadius;
    if (a < l || a > u || a === 0) return null;
    var c = bE(t),
      s = c.startAngle,
      f = c.endAngle,
      d = o,
      h;
    if (s <= f) {
      for (; d > f;) d -= 360;
      for (; d < s;) d += 360;
      h = d >= s && d <= f;
    } else {
      for (; d > s;) d -= 360;
      for (; d < f;) d += 360;
      h = d >= f && d <= s;
    }
    return h ? bd(bd({}, t), {}, { radius: a, angle: xE(d, t) }) : null;
  };
function vy(e) {
  var t = e.cx,
    r = e.cy,
    n = e.radius,
    i = e.startAngle,
    a = e.endAngle,
    o = xe(t, r, n, i),
    l = xe(t, r, n, a);
  return { points: [o, l], cx: t, cy: r, radius: n, startAngle: i, endAngle: a };
}
var xd, wd, Ad, Pd, Od, Sd, Ed;
function uu() {
  return (
    (uu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    uu.apply(null, arguments)
  );
}
function Ir(e, t) {
  return (
    t || (t = e.slice(0)),
    Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }))
  );
}
var AE = (e, t) => {
    var r = je(t - e),
      n = Math.min(Math.abs(t - e), 359.999);
    return r * n;
  },
  Ri = (e) => {
    var t = e.cx,
      r = e.cy,
      n = e.radius,
      i = e.angle,
      a = e.sign,
      o = e.isExternal,
      l = e.cornerRadius,
      u = e.cornerIsExternal,
      c = l * (o ? 1 : -1) + n,
      s = Math.asin(l / c) / wa,
      f = u ? i : i + a * s,
      d = xe(t, r, c, f),
      h = xe(t, r, n, f),
      p = u ? i - a * s : i,
      m = xe(t, r, c * Math.cos(s * wa), p);
    return { center: d, circleTangency: h, lineTangency: m, theta: s };
  },
  hy = (e) => {
    var t = e.cx,
      r = e.cy,
      n = e.innerRadius,
      i = e.outerRadius,
      a = e.startAngle,
      o = e.endAngle,
      l = AE(a, o),
      u = a + l,
      c = xe(t, r, i, a),
      s = xe(t, r, i, u),
      f = De(
        xd ||
          (xd = Ir([
            'M ',
            ',',
            `
    A `,
            ',',
            `,0,
    `,
            ',',
            `,
    `,
            ',',
            `
  `
          ])),
        c.x,
        c.y,
        i,
        i,
        +(Math.abs(l) > 180),
        +(a > u),
        s.x,
        s.y
      );
    if (n > 0) {
      var d = xe(t, r, n, a),
        h = xe(t, r, n, u);
      f += De(
        wd ||
          (wd = Ir([
            'L ',
            ',',
            `
            A `,
            ',',
            `,0,
            `,
            ',',
            `,
            `,
            ',',
            ' Z'
          ])),
        h.x,
        h.y,
        n,
        n,
        +(Math.abs(l) > 180),
        +(a <= u),
        d.x,
        d.y
      );
    } else f += De(Ad || (Ad = Ir(['L ', ',', ' Z'])), t, r);
    return f;
  },
  PE = (e) => {
    var t = e.cx,
      r = e.cy,
      n = e.innerRadius,
      i = e.outerRadius,
      a = e.cornerRadius,
      o = e.forceCornerRadius,
      l = e.cornerIsExternal,
      u = e.startAngle,
      c = e.endAngle,
      s = je(c - u),
      f = Ri({ cx: t, cy: r, radius: i, angle: u, sign: s, cornerRadius: a, cornerIsExternal: l }),
      d = f.circleTangency,
      h = f.lineTangency,
      p = f.theta,
      m = Ri({ cx: t, cy: r, radius: i, angle: c, sign: -s, cornerRadius: a, cornerIsExternal: l }),
      y = m.circleTangency,
      g = m.lineTangency,
      x = m.theta,
      A = l ? Math.abs(u - c) : Math.abs(u - c) - p - x;
    if (A < 0)
      return o
        ? De(
            Pd ||
              (Pd = Ir([
                'M ',
                ',',
                `
        a`,
                ',',
                ',0,0,1,',
                `,0
        a`,
                ',',
                ',0,0,1,',
                `,0
      `
              ])),
            h.x,
            h.y,
            a,
            a,
            a * 2,
            a,
            a,
            -a * 2
          )
        : hy({ cx: t, cy: r, innerRadius: n, outerRadius: i, startAngle: u, endAngle: c });
    var w = De(
      Od ||
        (Od = Ir([
          'M ',
          ',',
          `
    A`,
          ',',
          ',0,0,',
          ',',
          ',',
          `
    A`,
          ',',
          ',0,',
          ',',
          ',',
          ',',
          `
    A`,
          ',',
          ',0,0,',
          ',',
          ',',
          `
  `
        ])),
      h.x,
      h.y,
      a,
      a,
      +(s < 0),
      d.x,
      d.y,
      i,
      i,
      +(A > 180),
      +(s < 0),
      y.x,
      y.y,
      a,
      a,
      +(s < 0),
      g.x,
      g.y
    );
    if (n > 0) {
      var P = Ri({
          cx: t,
          cy: r,
          radius: n,
          angle: u,
          sign: s,
          isExternal: !0,
          cornerRadius: a,
          cornerIsExternal: l
        }),
        b = P.circleTangency,
        S = P.lineTangency,
        E = P.theta,
        C = Ri({
          cx: t,
          cy: r,
          radius: n,
          angle: c,
          sign: -s,
          isExternal: !0,
          cornerRadius: a,
          cornerIsExternal: l
        }),
        k = C.circleTangency,
        j = C.lineTangency,
        I = C.theta,
        R = l ? Math.abs(u - c) : Math.abs(u - c) - E - I;
      if (R < 0 && a === 0) return ''.concat(w, 'L').concat(t, ',').concat(r, 'Z');
      w += De(
        Sd ||
          (Sd = Ir([
            'L',
            ',',
            `
      A`,
            ',',
            ',0,0,',
            ',',
            ',',
            `
      A`,
            ',',
            ',0,',
            ',',
            ',',
            ',',
            `
      A`,
            ',',
            ',0,0,',
            ',',
            ',',
            'Z'
          ])),
        j.x,
        j.y,
        a,
        a,
        +(s < 0),
        k.x,
        k.y,
        n,
        n,
        +(R > 180),
        +(s > 0),
        b.x,
        b.y,
        a,
        a,
        +(s < 0),
        S.x,
        S.y
      );
    } else w += De(Ed || (Ed = Ir(['L', ',', 'Z'])), t, r);
    return w;
  },
  OE = {
    cx: 0,
    cy: 0,
    innerRadius: 0,
    outerRadius: 0,
    startAngle: 0,
    endAngle: 0,
    cornerRadius: 0,
    forceCornerRadius: !1,
    cornerIsExternal: !1
  },
  py = (e) => {
    var t = ge(e, OE),
      r = t.cx,
      n = t.cy,
      i = t.innerRadius,
      a = t.outerRadius,
      o = t.cornerRadius,
      l = t.forceCornerRadius,
      u = t.cornerIsExternal,
      c = t.startAngle,
      s = t.endAngle,
      f = t.className;
    if (a < i || c === s) return null;
    var d = Z('recharts-sector', f),
      h = a - i,
      p = Be(o, h, 0, !0),
      m;
    return (
      p > 0 && Math.abs(c - s) < 360
        ? (m = PE({
            cx: r,
            cy: n,
            innerRadius: i,
            outerRadius: a,
            cornerRadius: Math.min(p, h / 2),
            forceCornerRadius: l,
            cornerIsExternal: u,
            startAngle: c,
            endAngle: s
          }))
        : (m = hy({ cx: r, cy: n, innerRadius: i, outerRadius: a, startAngle: c, endAngle: s })),
      v.createElement('path', uu({}, Ye(t), { className: d, d: m }))
    );
  };
function SE(e, t, r) {
  if (e === 'horizontal')
    return [
      { x: t.x, y: r.top },
      { x: t.x, y: r.top + r.height }
    ];
  if (e === 'vertical')
    return [
      { x: r.left, y: t.y },
      { x: r.left + r.width, y: t.y }
    ];
  if ($p(t)) {
    if (e === 'centric') {
      var n = t.cx,
        i = t.cy,
        a = t.innerRadius,
        o = t.outerRadius,
        l = t.angle,
        u = xe(n, i, a, l),
        c = xe(n, i, o, l);
      return [
        { x: u.x, y: u.y },
        { x: c.x, y: c.y }
      ];
    }
    return vy(t);
  }
}
function EE(e) {
  return fm(e) ? NaN : Number(e);
}
function gl(e) {
  return e
    ? ((e = EE(e)),
      e === 1 / 0 || e === -1 / 0 ? (e < 0 ? -1 : 1) * Number.MAX_VALUE : e === e ? e : 0)
    : e === 0
      ? e
      : 0;
}
function my(e, t, r) {
  (r && typeof r != 'number' && Yl(e, t, r) && (t = r = void 0),
    (e = gl(e)),
    t === void 0 ? ((t = e), (e = 0)) : (t = gl(t)),
    (r = r === void 0 ? (e < t ? 1 : -1) : gl(r)));
  const n = Math.max(Math.ceil((t - e) / (r || 1)), 0),
    i = new Array(n);
  for (let a = 0; a < n; a++) ((i[a] = e), (e += r));
  return i;
}
var Pt = (e) => e.chartData,
  pi = O([Pt], (e) => {
    var t = e.chartData != null ? e.chartData.length - 1 : 0;
    return {
      chartData: e.chartData,
      computedData: e.computedData,
      dataEndIndex: t,
      dataStartIndex: 0
    };
  }),
  mi = (e, t, r, n) => (n ? pi(e) : Pt(e)),
  yy = (e, t, r) => (r ? pi(e) : Pt(e)),
  IE = O([mi], (e) => {
    var t = e.chartData,
      r = e.dataStartIndex,
      n = e.dataEndIndex;
    return t != null ? t.slice(r, n + 1) : [];
  }),
  kE = O([pi], (e) => {
    var t = e.chartData,
      r = e.dataStartIndex,
      n = e.dataEndIndex;
    return t != null ? t.slice(r, n + 1) : [];
  }),
  CE = O([Pt], (e) => {
    var t = e.chartData,
      r = e.dataStartIndex,
      n = e.dataEndIndex;
    return t != null ? t.slice(r, n + 1) : [];
  });
function lc(e, t) {
  return ME(e) || TE(e, t) || _E(e, t) || jE();
}
function jE() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _E(e, t) {
  if (e) {
    if (typeof e == 'string') return Id(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Id(e, t)
          : void 0
    );
  }
}
function Id(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function TE(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function ME(e) {
  if (Array.isArray(e)) return e;
}
function _t(e) {
  if (Array.isArray(e) && e.length === 2) {
    var t = lc(e, 2),
      r = t[0],
      n = t[1];
    if (H(r) && H(n)) return !0;
  }
  return !1;
}
function kd(e, t, r) {
  return r ? e : [Math.min(e[0], t[0]), Math.max(e[1], t[1])];
}
function gy(e, t) {
  if (t && typeof e != 'function' && Array.isArray(e) && e.length === 2) {
    var r = lc(e, 2),
      n = r[0],
      i = r[1],
      a,
      o;
    if (H(n)) a = n;
    else if (typeof n == 'function') return;
    if (H(i)) o = i;
    else if (typeof i == 'function') return;
    var l = [a, o];
    if (_t(l)) return l;
  }
}
function DE(e, t, r) {
  if (!(!r && t == null)) {
    if (typeof e == 'function' && t != null)
      try {
        var n = e(t, r);
        if (_t(n)) return kd(n, t, r);
      } catch {}
    if (Array.isArray(e) && e.length === 2) {
      var i = lc(e, 2),
        a = i[0],
        o = i[1],
        l,
        u;
      if (a === 'auto') t != null && (l = Math.min(...t));
      else if (T(a)) l = a;
      else if (typeof a == 'function')
        try {
          t != null && (l = a(t == null ? void 0 : t[0]));
        } catch {}
      else if (typeof a == 'string' && Sf.test(a)) {
        var c = Sf.exec(a);
        if (c == null || c[1] == null || t == null) l = void 0;
        else {
          var s = +c[1];
          l = t[0] - s;
        }
      } else l = t == null ? void 0 : t[0];
      if (o === 'auto') t != null && (u = Math.max(...t));
      else if (T(o)) u = o;
      else if (typeof o == 'function')
        try {
          t != null && (u = o(t == null ? void 0 : t[1]));
        } catch {}
      else if (typeof o == 'string' && Ef.test(o)) {
        var f = Ef.exec(o);
        if (f == null || f[1] == null || t == null) u = void 0;
        else {
          var d = +f[1];
          u = t[1] + d;
        }
      } else u = t == null ? void 0 : t[1];
      var h = [l, u];
      if (_t(h)) return t == null ? h : kd(h, t, r);
    }
  }
}
var yn = 1e9,
  $E = {
    precision: 20,
    rounding: 4,
    toExpNeg: -7,
    toExpPos: 21,
    LN10: '2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286'
  },
  cc,
  se = !0,
  st = '[DecimalError] ',
  Tr = st + 'Invalid argument: ',
  uc = st + 'Exponent out of range: ',
  gn = Math.floor,
  Or = Math.pow,
  NE = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
  Qe,
  Ce = 1e7,
  le = 7,
  by = 9007199254740991,
  Aa = gn(by / le),
  L = {};
L.absoluteValue = L.abs = function () {
  var e = new this.constructor(this);
  return (e.s && (e.s = 1), e);
};
L.comparedTo = L.cmp = function (e) {
  var t,
    r,
    n,
    i,
    a = this;
  if (((e = new a.constructor(e)), a.s !== e.s)) return a.s || -e.s;
  if (a.e !== e.e) return (a.e > e.e) ^ (a.s < 0) ? 1 : -1;
  for (n = a.d.length, i = e.d.length, t = 0, r = n < i ? n : i; t < r; ++t)
    if (a.d[t] !== e.d[t]) return (a.d[t] > e.d[t]) ^ (a.s < 0) ? 1 : -1;
  return n === i ? 0 : (n > i) ^ (a.s < 0) ? 1 : -1;
};
L.decimalPlaces = L.dp = function () {
  var e = this,
    t = e.d.length - 1,
    r = (t - e.e) * le;
  if (((t = e.d[t]), t)) for (; t % 10 == 0; t /= 10) r--;
  return r < 0 ? 0 : r;
};
L.dividedBy = L.div = function (e) {
  return qt(this, new this.constructor(e));
};
L.dividedToIntegerBy = L.idiv = function (e) {
  var t = this,
    r = t.constructor;
  return re(qt(t, new r(e), 0, 1), r.precision);
};
L.equals = L.eq = function (e) {
  return !this.cmp(e);
};
L.exponent = function () {
  return we(this);
};
L.greaterThan = L.gt = function (e) {
  return this.cmp(e) > 0;
};
L.greaterThanOrEqualTo = L.gte = function (e) {
  return this.cmp(e) >= 0;
};
L.isInteger = L.isint = function () {
  return this.e > this.d.length - 2;
};
L.isNegative = L.isneg = function () {
  return this.s < 0;
};
L.isPositive = L.ispos = function () {
  return this.s > 0;
};
L.isZero = function () {
  return this.s === 0;
};
L.lessThan = L.lt = function (e) {
  return this.cmp(e) < 0;
};
L.lessThanOrEqualTo = L.lte = function (e) {
  return this.cmp(e) < 1;
};
L.logarithm = L.log = function (e) {
  var t,
    r = this,
    n = r.constructor,
    i = n.precision,
    a = i + 5;
  if (e === void 0) e = new n(10);
  else if (((e = new n(e)), e.s < 1 || e.eq(Qe))) throw Error(st + 'NaN');
  if (r.s < 1) throw Error(st + (r.s ? 'NaN' : '-Infinity'));
  return r.eq(Qe) ? new n(0) : ((se = !1), (t = qt(Zn(r, a), Zn(e, a), a)), (se = !0), re(t, i));
};
L.minus = L.sub = function (e) {
  var t = this;
  return ((e = new t.constructor(e)), t.s == e.s ? Ay(t, e) : xy(t, ((e.s = -e.s), e)));
};
L.modulo = L.mod = function (e) {
  var t,
    r = this,
    n = r.constructor,
    i = n.precision;
  if (((e = new n(e)), !e.s)) throw Error(st + 'NaN');
  return r.s ? ((se = !1), (t = qt(r, e, 0, 1).times(e)), (se = !0), r.minus(t)) : re(new n(r), i);
};
L.naturalExponential = L.exp = function () {
  return wy(this);
};
L.naturalLogarithm = L.ln = function () {
  return Zn(this);
};
L.negated = L.neg = function () {
  var e = new this.constructor(this);
  return ((e.s = -e.s || 0), e);
};
L.plus = L.add = function (e) {
  var t = this;
  return ((e = new t.constructor(e)), t.s == e.s ? xy(t, e) : Ay(t, ((e.s = -e.s), e)));
};
L.precision = L.sd = function (e) {
  var t,
    r,
    n,
    i = this;
  if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(Tr + e);
  if (((t = we(i) + 1), (n = i.d.length - 1), (r = n * le + 1), (n = i.d[n]), n)) {
    for (; n % 10 == 0; n /= 10) r--;
    for (n = i.d[0]; n >= 10; n /= 10) r++;
  }
  return e && t > r ? t : r;
};
L.squareRoot = L.sqrt = function () {
  var e,
    t,
    r,
    n,
    i,
    a,
    o,
    l = this,
    u = l.constructor;
  if (l.s < 1) {
    if (!l.s) return new u(0);
    throw Error(st + 'NaN');
  }
  for (
    e = we(l),
      se = !1,
      i = Math.sqrt(+l),
      i == 0 || i == 1 / 0
        ? ((t = jt(l.d)),
          (t.length + e) % 2 == 0 && (t += '0'),
          (i = Math.sqrt(t)),
          (e = gn((e + 1) / 2) - (e < 0 || e % 2)),
          i == 1 / 0
            ? (t = '5e' + e)
            : ((t = i.toExponential()), (t = t.slice(0, t.indexOf('e') + 1) + e)),
          (n = new u(t)))
        : (n = new u(i.toString())),
      r = u.precision,
      i = o = r + 3;
    ;
  )
    if (
      ((a = n),
      (n = a.plus(qt(l, a, o + 2)).times(0.5)),
      jt(a.d).slice(0, o) === (t = jt(n.d)).slice(0, o))
    ) {
      if (((t = t.slice(o - 3, o + 1)), i == o && t == '4999')) {
        if ((re(a, r + 1, 0), a.times(a).eq(l))) {
          n = a;
          break;
        }
      } else if (t != '9999') break;
      o += 4;
    }
  return ((se = !0), re(n, r));
};
L.times = L.mul = function (e) {
  var t,
    r,
    n,
    i,
    a,
    o,
    l,
    u,
    c,
    s = this,
    f = s.constructor,
    d = s.d,
    h = (e = new f(e)).d;
  if (!s.s || !e.s) return new f(0);
  for (
    e.s *= s.s,
      r = s.e + e.e,
      u = d.length,
      c = h.length,
      u < c && ((a = d), (d = h), (h = a), (o = u), (u = c), (c = o)),
      a = [],
      o = u + c,
      n = o;
    n--;
  )
    a.push(0);
  for (n = c; --n >= 0;) {
    for (t = 0, i = u + n; i > n;)
      ((l = a[i] + h[n] * d[i - n - 1] + t), (a[i--] = (l % Ce) | 0), (t = (l / Ce) | 0));
    a[i] = ((a[i] + t) % Ce) | 0;
  }
  for (; !a[--o];) a.pop();
  return (t ? ++r : a.shift(), (e.d = a), (e.e = r), se ? re(e, f.precision) : e);
};
L.toDecimalPlaces = L.todp = function (e, t) {
  var r = this,
    n = r.constructor;
  return (
    (r = new n(r)),
    e === void 0
      ? r
      : ($t(e, 0, yn), t === void 0 ? (t = n.rounding) : $t(t, 0, 8), re(r, e + we(r) + 1, t))
  );
};
L.toExponential = function (e, t) {
  var r,
    n = this,
    i = n.constructor;
  return (
    e === void 0
      ? (r = Rr(n, !0))
      : ($t(e, 0, yn),
        t === void 0 ? (t = i.rounding) : $t(t, 0, 8),
        (n = re(new i(n), e + 1, t)),
        (r = Rr(n, !0, e + 1))),
    r
  );
};
L.toFixed = function (e, t) {
  var r,
    n,
    i = this,
    a = i.constructor;
  return e === void 0
    ? Rr(i)
    : ($t(e, 0, yn),
      t === void 0 ? (t = a.rounding) : $t(t, 0, 8),
      (n = re(new a(i), e + we(i) + 1, t)),
      (r = Rr(n.abs(), !1, e + we(n) + 1)),
      i.isneg() && !i.isZero() ? '-' + r : r);
};
L.toInteger = L.toint = function () {
  var e = this,
    t = e.constructor;
  return re(new t(e), we(e) + 1, t.rounding);
};
L.toNumber = function () {
  return +this;
};
L.toPower = L.pow = function (e) {
  var t,
    r,
    n,
    i,
    a,
    o,
    l = this,
    u = l.constructor,
    c = 12,
    s = +(e = new u(e));
  if (!e.s) return new u(Qe);
  if (((l = new u(l)), !l.s)) {
    if (e.s < 1) throw Error(st + 'Infinity');
    return l;
  }
  if (l.eq(Qe)) return l;
  if (((n = u.precision), e.eq(Qe))) return re(l, n);
  if (((t = e.e), (r = e.d.length - 1), (o = t >= r), (a = l.s), o)) {
    if ((r = s < 0 ? -s : s) <= by) {
      for (
        i = new u(Qe), t = Math.ceil(n / le + 4), se = !1;
        r % 2 && ((i = i.times(l)), jd(i.d, t)), (r = gn(r / 2)), r !== 0;
      )
        ((l = l.times(l)), jd(l.d, t));
      return ((se = !0), e.s < 0 ? new u(Qe).div(i) : re(i, n));
    }
  } else if (a < 0) throw Error(st + 'NaN');
  return (
    (a = a < 0 && e.d[Math.max(t, r)] & 1 ? -1 : 1),
    (l.s = 1),
    (se = !1),
    (i = e.times(Zn(l, n + c))),
    (se = !0),
    (i = wy(i)),
    (i.s = a),
    i
  );
};
L.toPrecision = function (e, t) {
  var r,
    n,
    i = this,
    a = i.constructor;
  return (
    e === void 0
      ? ((r = we(i)), (n = Rr(i, r <= a.toExpNeg || r >= a.toExpPos)))
      : ($t(e, 1, yn),
        t === void 0 ? (t = a.rounding) : $t(t, 0, 8),
        (i = re(new a(i), e, t)),
        (r = we(i)),
        (n = Rr(i, e <= r || r <= a.toExpNeg, e))),
    n
  );
};
L.toSignificantDigits = L.tosd = function (e, t) {
  var r = this,
    n = r.constructor;
  return (
    e === void 0
      ? ((e = n.precision), (t = n.rounding))
      : ($t(e, 1, yn), t === void 0 ? (t = n.rounding) : $t(t, 0, 8)),
    re(new n(r), e, t)
  );
};
L.toString =
  L.valueOf =
  L.val =
  L.toJSON =
  L[Symbol.for('nodejs.util.inspect.custom')] =
    function () {
      var e = this,
        t = we(e),
        r = e.constructor;
      return Rr(e, t <= r.toExpNeg || t >= r.toExpPos);
    };
function xy(e, t) {
  var r,
    n,
    i,
    a,
    o,
    l,
    u,
    c,
    s = e.constructor,
    f = s.precision;
  if (!e.s || !t.s) return (t.s || (t = new s(e)), se ? re(t, f) : t);
  if (((u = e.d), (c = t.d), (o = e.e), (i = t.e), (u = u.slice()), (a = o - i), a)) {
    for (
      a < 0 ? ((n = u), (a = -a), (l = c.length)) : ((n = c), (i = o), (l = u.length)),
        o = Math.ceil(f / le),
        l = o > l ? o + 1 : l + 1,
        a > l && ((a = l), (n.length = 1)),
        n.reverse();
      a--;
    )
      n.push(0);
    n.reverse();
  }
  for (l = u.length, a = c.length, l - a < 0 && ((a = l), (n = c), (c = u), (u = n)), r = 0; a;)
    ((r = ((u[--a] = u[a] + c[a] + r) / Ce) | 0), (u[a] %= Ce));
  for (r && (u.unshift(r), ++i), l = u.length; u[--l] == 0;) u.pop();
  return ((t.d = u), (t.e = i), se ? re(t, f) : t);
}
function $t(e, t, r) {
  if (e !== ~~e || e < t || e > r) throw Error(Tr + e);
}
function jt(e) {
  var t,
    r,
    n,
    i = e.length - 1,
    a = '',
    o = e[0];
  if (i > 0) {
    for (a += o, t = 1; t < i; t++)
      ((n = e[t] + ''), (r = le - n.length), r && (a += ir(r)), (a += n));
    ((o = e[t]), (n = o + ''), (r = le - n.length), r && (a += ir(r)));
  } else if (o === 0) return '0';
  for (; o % 10 === 0;) o /= 10;
  return a + o;
}
var qt = (function () {
  function e(n, i) {
    var a,
      o = 0,
      l = n.length;
    for (n = n.slice(); l--;) ((a = n[l] * i + o), (n[l] = (a % Ce) | 0), (o = (a / Ce) | 0));
    return (o && n.unshift(o), n);
  }
  function t(n, i, a, o) {
    var l, u;
    if (a != o) u = a > o ? 1 : -1;
    else
      for (l = u = 0; l < a; l++)
        if (n[l] != i[l]) {
          u = n[l] > i[l] ? 1 : -1;
          break;
        }
    return u;
  }
  function r(n, i, a) {
    for (var o = 0; a--;) ((n[a] -= o), (o = n[a] < i[a] ? 1 : 0), (n[a] = o * Ce + n[a] - i[a]));
    for (; !n[0] && n.length > 1;) n.shift();
  }
  return function (n, i, a, o) {
    var l,
      u,
      c,
      s,
      f,
      d,
      h,
      p,
      m,
      y,
      g,
      x,
      A,
      w,
      P,
      b,
      S,
      E,
      C = n.constructor,
      k = n.s == i.s ? 1 : -1,
      j = n.d,
      I = i.d;
    if (!n.s) return new C(n);
    if (!i.s) throw Error(st + 'Division by zero');
    for (
      u = n.e - i.e, S = I.length, P = j.length, h = new C(k), p = h.d = [], c = 0;
      I[c] == (j[c] || 0);
    )
      ++c;
    if (
      (I[c] > (j[c] || 0) && --u,
      a == null ? (x = a = C.precision) : o ? (x = a + (we(n) - we(i)) + 1) : (x = a),
      x < 0)
    )
      return new C(0);
    if (((x = (x / le + 2) | 0), (c = 0), S == 1))
      for (s = 0, I = I[0], x++; (c < P || s) && x--; c++)
        ((A = s * Ce + (j[c] || 0)), (p[c] = (A / I) | 0), (s = (A % I) | 0));
    else {
      for (
        s = (Ce / (I[0] + 1)) | 0,
          s > 1 && ((I = e(I, s)), (j = e(j, s)), (S = I.length), (P = j.length)),
          w = S,
          m = j.slice(0, S),
          y = m.length;
        y < S;
      )
        m[y++] = 0;
      ((E = I.slice()), E.unshift(0), (b = I[0]), I[1] >= Ce / 2 && ++b);
      do
        ((s = 0),
          (l = t(I, m, S, y)),
          l < 0
            ? ((g = m[0]),
              S != y && (g = g * Ce + (m[1] || 0)),
              (s = (g / b) | 0),
              s > 1
                ? (s >= Ce && (s = Ce - 1),
                  (f = e(I, s)),
                  (d = f.length),
                  (y = m.length),
                  (l = t(f, m, d, y)),
                  l == 1 && (s--, r(f, S < d ? E : I, d)))
                : (s == 0 && (l = s = 1), (f = I.slice())),
              (d = f.length),
              d < y && f.unshift(0),
              r(m, f, y),
              l == -1 &&
                ((y = m.length), (l = t(I, m, S, y)), l < 1 && (s++, r(m, S < y ? E : I, y))),
              (y = m.length))
            : l === 0 && (s++, (m = [0])),
          (p[c++] = s),
          l && m[0] ? (m[y++] = j[w] || 0) : ((m = [j[w]]), (y = 1)));
      while ((w++ < P || m[0] !== void 0) && x--);
    }
    return (p[0] || p.shift(), (h.e = u), re(h, o ? a + we(h) + 1 : a));
  };
})();
function wy(e, t) {
  var r,
    n,
    i,
    a,
    o,
    l,
    u = 0,
    c = 0,
    s = e.constructor,
    f = s.precision;
  if (we(e) > 16) throw Error(uc + we(e));
  if (!e.s) return new s(Qe);
  for (se = !1, l = f, o = new s(0.03125); e.abs().gte(0.1);) ((e = e.times(o)), (c += 5));
  for (
    n = ((Math.log(Or(2, c)) / Math.LN10) * 2 + 5) | 0,
      l += n,
      r = i = a = new s(Qe),
      s.precision = l;
    ;
  ) {
    if (
      ((i = re(i.times(e), l)),
      (r = r.times(++u)),
      (o = a.plus(qt(i, r, l))),
      jt(o.d).slice(0, l) === jt(a.d).slice(0, l))
    ) {
      for (; c--;) a = re(a.times(a), l);
      return ((s.precision = f), t == null ? ((se = !0), re(a, f)) : a);
    }
    a = o;
  }
}
function we(e) {
  for (var t = e.e * le, r = e.d[0]; r >= 10; r /= 10) t++;
  return t;
}
function bl(e, t, r) {
  if (t > e.LN10.sd())
    throw ((se = !0), r && (e.precision = r), Error(st + 'LN10 precision limit exceeded'));
  return re(new e(e.LN10), t);
}
function ir(e) {
  for (var t = ''; e--;) t += '0';
  return t;
}
function Zn(e, t) {
  var r,
    n,
    i,
    a,
    o,
    l,
    u,
    c,
    s,
    f = 1,
    d = 10,
    h = e,
    p = h.d,
    m = h.constructor,
    y = m.precision;
  if (h.s < 1) throw Error(st + (h.s ? 'NaN' : '-Infinity'));
  if (h.eq(Qe)) return new m(0);
  if ((t == null ? ((se = !1), (c = y)) : (c = t), h.eq(10)))
    return (t == null && (se = !0), bl(m, c));
  if (
    ((c += d), (m.precision = c), (r = jt(p)), (n = r.charAt(0)), (a = we(h)), Math.abs(a) < 15e14)
  ) {
    for (; (n < 7 && n != 1) || (n == 1 && r.charAt(1) > 3);)
      ((h = h.times(e)), (r = jt(h.d)), (n = r.charAt(0)), f++);
    ((a = we(h)), n > 1 ? ((h = new m('0.' + r)), a++) : (h = new m(n + '.' + r.slice(1))));
  } else
    return (
      (u = bl(m, c + 2, y).times(a + '')),
      (h = Zn(new m(n + '.' + r.slice(1)), c - d).plus(u)),
      (m.precision = y),
      t == null ? ((se = !0), re(h, y)) : h
    );
  for (l = o = h = qt(h.minus(Qe), h.plus(Qe), c), s = re(h.times(h), c), i = 3; ;) {
    if (
      ((o = re(o.times(s), c)),
      (u = l.plus(qt(o, new m(i), c))),
      jt(u.d).slice(0, c) === jt(l.d).slice(0, c))
    )
      return (
        (l = l.times(2)),
        a !== 0 && (l = l.plus(bl(m, c + 2, y).times(a + ''))),
        (l = qt(l, new m(f), c)),
        (m.precision = y),
        t == null ? ((se = !0), re(l, y)) : l
      );
    ((l = u), (i += 2));
  }
}
function Cd(e, t) {
  var r, n, i;
  for (
    (r = t.indexOf('.')) > -1 && (t = t.replace('.', '')),
      (n = t.search(/e/i)) > 0
        ? (r < 0 && (r = n), (r += +t.slice(n + 1)), (t = t.substring(0, n)))
        : r < 0 && (r = t.length),
      n = 0;
    t.charCodeAt(n) === 48;
  )
    ++n;
  for (i = t.length; t.charCodeAt(i - 1) === 48;) --i;
  if (((t = t.slice(n, i)), t)) {
    if (
      ((i -= n),
      (r = r - n - 1),
      (e.e = gn(r / le)),
      (e.d = []),
      (n = (r + 1) % le),
      r < 0 && (n += le),
      n < i)
    ) {
      for (n && e.d.push(+t.slice(0, n)), i -= le; n < i;) e.d.push(+t.slice(n, (n += le)));
      ((t = t.slice(n)), (n = le - t.length));
    } else n -= i;
    for (; n--;) t += '0';
    if ((e.d.push(+t), se && (e.e > Aa || e.e < -Aa))) throw Error(uc + r);
  } else ((e.s = 0), (e.e = 0), (e.d = [0]));
  return e;
}
function re(e, t, r) {
  var n,
    i,
    a,
    o,
    l,
    u,
    c,
    s,
    f = e.d;
  for (o = 1, a = f[0]; a >= 10; a /= 10) o++;
  if (((n = t - o), n < 0)) ((n += le), (i = t), (c = f[(s = 0)]));
  else {
    if (((s = Math.ceil((n + 1) / le)), (a = f.length), s >= a)) return e;
    for (c = a = f[s], o = 1; a >= 10; a /= 10) o++;
    ((n %= le), (i = n - le + o));
  }
  if (
    (r !== void 0 &&
      ((a = Or(10, o - i - 1)),
      (l = ((c / a) % 10) | 0),
      (u = t < 0 || f[s + 1] !== void 0 || c % a),
      (u =
        r < 4
          ? (l || u) && (r == 0 || r == (e.s < 0 ? 3 : 2))
          : l > 5 ||
            (l == 5 &&
              (r == 4 ||
                u ||
                (r == 6 && ((n > 0 ? (i > 0 ? c / Or(10, o - i) : 0) : f[s - 1]) % 10) & 1) ||
                r == (e.s < 0 ? 8 : 7))))),
    t < 1 || !f[0])
  )
    return (
      u
        ? ((a = we(e)),
          (f.length = 1),
          (t = t - a - 1),
          (f[0] = Or(10, (le - (t % le)) % le)),
          (e.e = gn(-t / le) || 0))
        : ((f.length = 1), (f[0] = e.e = e.s = 0)),
      e
    );
  if (
    (n == 0
      ? ((f.length = s), (a = 1), s--)
      : ((f.length = s + 1),
        (a = Or(10, le - n)),
        (f[s] = i > 0 ? (((c / Or(10, o - i)) % Or(10, i)) | 0) * a : 0)),
    u)
  )
    for (;;)
      if (s == 0) {
        (f[0] += a) == Ce && ((f[0] = 1), ++e.e);
        break;
      } else {
        if (((f[s] += a), f[s] != Ce)) break;
        ((f[s--] = 0), (a = 1));
      }
  for (n = f.length; f[--n] === 0;) f.pop();
  if (se && (e.e > Aa || e.e < -Aa)) throw Error(uc + we(e));
  return e;
}
function Ay(e, t) {
  var r,
    n,
    i,
    a,
    o,
    l,
    u,
    c,
    s,
    f,
    d = e.constructor,
    h = d.precision;
  if (!e.s || !t.s) return (t.s ? (t.s = -t.s) : (t = new d(e)), se ? re(t, h) : t);
  if (((u = e.d), (f = t.d), (n = t.e), (c = e.e), (u = u.slice()), (o = c - n), o)) {
    for (
      s = o < 0,
        s ? ((r = u), (o = -o), (l = f.length)) : ((r = f), (n = c), (l = u.length)),
        i = Math.max(Math.ceil(h / le), l) + 2,
        o > i && ((o = i), (r.length = 1)),
        r.reverse(),
        i = o;
      i--;
    )
      r.push(0);
    r.reverse();
  } else {
    for (i = u.length, l = f.length, s = i < l, s && (l = i), i = 0; i < l; i++)
      if (u[i] != f[i]) {
        s = u[i] < f[i];
        break;
      }
    o = 0;
  }
  for (s && ((r = u), (u = f), (f = r), (t.s = -t.s)), l = u.length, i = f.length - l; i > 0; --i)
    u[l++] = 0;
  for (i = f.length; i > o;) {
    if (u[--i] < f[i]) {
      for (a = i; a && u[--a] === 0;) u[a] = Ce - 1;
      (--u[a], (u[i] += Ce));
    }
    u[i] -= f[i];
  }
  for (; u[--l] === 0;) u.pop();
  for (; u[0] === 0; u.shift()) --n;
  return u[0] ? ((t.d = u), (t.e = n), se ? re(t, h) : t) : new d(0);
}
function Rr(e, t, r) {
  var n,
    i = we(e),
    a = jt(e.d),
    o = a.length;
  return (
    t
      ? (r && (n = r - o) > 0
          ? (a = a.charAt(0) + '.' + a.slice(1) + ir(n))
          : o > 1 && (a = a.charAt(0) + '.' + a.slice(1)),
        (a = a + (i < 0 ? 'e' : 'e+') + i))
      : i < 0
        ? ((a = '0.' + ir(-i - 1) + a), r && (n = r - o) > 0 && (a += ir(n)))
        : i >= o
          ? ((a += ir(i + 1 - o)), r && (n = r - i - 1) > 0 && (a = a + '.' + ir(n)))
          : ((n = i + 1) < o && (a = a.slice(0, n) + '.' + a.slice(n)),
            r && (n = r - o) > 0 && (i + 1 === o && (a += '.'), (a += ir(n)))),
    e.s < 0 ? '-' + a : a
  );
}
function jd(e, t) {
  if (e.length > t) return ((e.length = t), !0);
}
function Py(e) {
  var t, r, n;
  function i(a) {
    var o = this;
    if (!(o instanceof i)) return new i(a);
    if (((o.constructor = i), a instanceof i)) {
      ((o.s = a.s), (o.e = a.e), (o.d = (a = a.d) ? a.slice() : a));
      return;
    }
    if (typeof a == 'number') {
      if (a * 0 !== 0) throw Error(Tr + a);
      if (a > 0) o.s = 1;
      else if (a < 0) ((a = -a), (o.s = -1));
      else {
        ((o.s = 0), (o.e = 0), (o.d = [0]));
        return;
      }
      if (a === ~~a && a < 1e7) {
        ((o.e = 0), (o.d = [a]));
        return;
      }
      return Cd(o, a.toString());
    } else if (typeof a != 'string') throw Error(Tr + a);
    if ((a.charCodeAt(0) === 45 ? ((a = a.slice(1)), (o.s = -1)) : (o.s = 1), NE.test(a))) Cd(o, a);
    else throw Error(Tr + a);
  }
  if (
    ((i.prototype = L),
    (i.ROUND_UP = 0),
    (i.ROUND_DOWN = 1),
    (i.ROUND_CEIL = 2),
    (i.ROUND_FLOOR = 3),
    (i.ROUND_HALF_UP = 4),
    (i.ROUND_HALF_DOWN = 5),
    (i.ROUND_HALF_EVEN = 6),
    (i.ROUND_HALF_CEIL = 7),
    (i.ROUND_HALF_FLOOR = 8),
    (i.clone = Py),
    (i.config = i.set = LE),
    e === void 0 && (e = {}),
    e)
  )
    for (n = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'LN10'], t = 0; t < n.length;)
      e.hasOwnProperty((r = n[t++])) || (e[r] = this[r]);
  return (i.config(e), i);
}
function LE(e) {
  if (!e || typeof e != 'object') throw Error(st + 'Object expected');
  var t,
    r,
    n,
    i = ['precision', 1, yn, 'rounding', 0, 8, 'toExpNeg', -1 / 0, 0, 'toExpPos', 0, 1 / 0];
  for (t = 0; t < i.length; t += 3)
    if ((n = e[(r = i[t])]) !== void 0)
      if (gn(n) === n && n >= i[t + 1] && n <= i[t + 2]) this[r] = n;
      else throw Error(Tr + r + ': ' + n);
  if ((n = e[(r = 'LN10')]) !== void 0)
    if (n == Math.LN10) this[r] = new this(n);
    else throw Error(Tr + r + ': ' + n);
  return this;
}
var cc = Py($E);
Qe = new cc(1);
const G = cc;
function Oy(e) {
  var t;
  return (e === 0 ? (t = 1) : (t = Math.floor(new G(e).abs().log(10).toNumber()) + 1), t);
}
function Sy(e, t, r) {
  for (var n = new G(e), i = 0, a = []; n.lt(t) && i < 1e5;)
    (a.push(n.toNumber()), (n = n.add(r)), i++);
  return a;
}
function Qn(e, t) {
  return WE(e) || zE(e, t) || BE(e, t) || RE();
}
function RE() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function BE(e, t) {
  if (e) {
    if (typeof e == 'string') return _d(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? _d(e, t)
          : void 0
    );
  }
}
function _d(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function zE(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function WE(e) {
  if (Array.isArray(e)) return e;
}
var Ey = (e) => {
    var t = Qn(e, 2),
      r = t[0],
      n = t[1],
      i = r,
      a = n;
    return (r > n && ((i = n), (a = r)), [i, a]);
  },
  sc = (e, t, r) => {
    if (e.lte(0)) return new G(0);
    var n = Oy(e.toNumber()),
      i = new G(10).pow(n),
      a = e.div(i),
      o = n !== 1 ? 0.05 : 0.1,
      l = new G(Math.ceil(a.div(o).toNumber())).add(r).mul(o),
      u = l.mul(i);
    return t ? new G(u.toNumber()) : new G(Math.ceil(u.toNumber()));
  },
  Iy = (e, t, r) => {
    var n;
    if (e.lte(0)) return new G(0);
    var i = [1, 2, 2.5, 5],
      a = e.toNumber(),
      o = Math.floor(new G(a).abs().log(10).toNumber()),
      l = new G(10).pow(o),
      u = e.div(l).toNumber(),
      c = i.findIndex((h) => h >= u - 1e-10);
    if ((c === -1 && ((l = l.mul(10)), (c = 0)), (c += r), c >= i.length)) {
      var s = Math.floor(c / i.length);
      ((c %= i.length), (l = l.mul(new G(10).pow(s))));
    }
    var f = (n = i[c]) !== null && n !== void 0 ? n : 1,
      d = new G(f).mul(l);
    return t ? d : new G(Math.ceil(d.toNumber()));
  },
  FE = (e, t, r) => {
    var n = new G(1),
      i = new G(e);
    if (!i.isint() && r) {
      var a = Math.abs(e);
      a < 1
        ? ((n = new G(10).pow(Oy(e) - 1)), (i = new G(Math.floor(i.div(n).toNumber())).mul(n)))
        : a > 1 && (i = new G(Math.floor(e)));
    } else e === 0 ? (i = new G(Math.floor((t - 1) / 2))) : r || (i = new G(Math.floor(e)));
    for (var o = Math.floor((t - 1) / 2), l = [], u = 0; u < t; u++)
      l.push(i.add(new G(u - o).mul(n)).toNumber());
    return l;
  },
  ky = function (t, r, n, i) {
    var a = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0,
      o = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : sc;
    if (!Number.isFinite((r - t) / (n - 1)))
      return { step: new G(0), tickMin: new G(0), tickMax: new G(0) };
    var l = o(new G(r).sub(t).div(n - 1), i, a),
      u;
    t <= 0 && r >= 0
      ? (u = new G(0))
      : ((u = new G(t).add(r).div(2)), (u = u.sub(new G(u).mod(l))));
    var c = Math.ceil(u.sub(t).div(l).toNumber()),
      s = Math.ceil(new G(r).sub(u).div(l).toNumber()),
      f = c + s + 1;
    return f > n
      ? ky(t, r, n, i, a + 1, o)
      : (f < n && ((s = r > 0 ? s + (n - f) : s), (c = r > 0 ? c : c + (n - f))),
        { step: l, tickMin: u.sub(new G(c).mul(l)), tickMax: u.add(new G(s).mul(l)) });
  },
  Td = function (t) {
    var r = Qn(t, 2),
      n = r[0],
      i = r[1],
      a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6,
      o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
      l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 'auto',
      u = Math.max(a, 2),
      c = Ey([n, i]),
      s = Qn(c, 2),
      f = s[0],
      d = s[1];
    if (f === -1 / 0 || d === 1 / 0) {
      var h = d === 1 / 0 ? [f, ...Array(a - 1).fill(1 / 0)] : [...Array(a - 1).fill(-1 / 0), d];
      return n > i ? h.reverse() : h;
    }
    if (f === d) return FE(f, a, o);
    var p = l === 'snap125' ? Iy : sc,
      m = ky(f, d, u, o, 0, p),
      y = m.step,
      g = m.tickMin,
      x = m.tickMax,
      A = Sy(g, x.add(new G(0.1).mul(y)), y);
    return n > i ? A.reverse() : A;
  },
  Md = function (t, r) {
    var n = Qn(t, 2),
      i = n[0],
      a = n[1],
      o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
      l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 'auto',
      u = Ey([i, a]),
      c = Qn(u, 2),
      s = c[0],
      f = c[1];
    if (s === -1 / 0 || f === 1 / 0) return [i, a];
    if (s === f) return [s];
    var d = l === 'snap125' ? Iy : sc,
      h = Math.max(r, 2),
      p = d(new G(f).sub(s).div(h - 1), o, 0),
      m = [...Sy(new G(s), new G(f), p), f];
    if (o === !1) {
      m = m.map((g) => Math.round(g));
      var y = m.length - 1;
      y > 0 && m[y] === m[y - 1] && (m = m.slice(0, y));
    }
    return i > a ? m.reverse() : m;
  },
  Cy = (e) => e.rootProps.maxBarSize,
  KE = (e) => e.rootProps.barGap,
  jy = (e) => e.rootProps.barCategoryGap,
  UE = (e) => e.rootProps.barSize,
  yi = (e) => e.rootProps.stackOffset,
  _y = (e) => e.rootProps.reverseStackOrder,
  fc = (e) => e.options.chartName,
  dc = (e) => e.rootProps.syncId,
  Ty = (e) => e.rootProps.syncMethod,
  vc = (e) => e.options.eventEmitter,
  HE = (e) => e.rootProps.baseValue,
  ye = {
    grid: -100,
    barBackground: -50,
    area: 100,
    cursorRectangle: 200,
    bar: 300,
    line: 400,
    axis: 500,
    scatter: 600,
    activeBar: 1e3,
    cursorLine: 1100,
    activeDot: 1200,
    label: 2e3
  },
  br = {
    allowDecimals: !1,
    allowDataOverflow: !1,
    angleAxisId: 0,
    reversed: !1,
    scale: 'auto',
    tick: !0,
    type: 'auto'
  },
  It = {
    allowDataOverflow: !1,
    allowDecimals: !1,
    allowDuplicatedCategory: !0,
    includeHidden: !1,
    radiusAxisId: 0,
    reversed: !1,
    scale: 'auto',
    tick: !0,
    tickCount: 5,
    type: 'auto'
  },
  yo = (e, t) => {
    if (!(!e || !t)) return e != null && e.reversed ? [t[1], t[0]] : t;
  };
function go(e, t, r) {
  if (r !== 'auto') return r;
  if (e != null) return At(e, t) ? 'category' : 'number';
}
function Dd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Pa(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Dd(Object(r), !0).forEach(function (n) {
          VE(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Dd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function VE(e, t, r) {
  return (
    (t = YE(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function YE(e) {
  var t = GE(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function GE(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var $d = {
    allowDataOverflow: br.allowDataOverflow,
    allowDecimals: br.allowDecimals,
    allowDuplicatedCategory: !1,
    dataKey: void 0,
    domain: void 0,
    id: br.angleAxisId,
    includeHidden: !1,
    name: void 0,
    reversed: br.reversed,
    scale: br.scale,
    tick: br.tick,
    tickCount: void 0,
    ticks: void 0,
    type: br.type,
    unit: void 0,
    niceTicks: 'auto'
  },
  Nd = {
    allowDataOverflow: It.allowDataOverflow,
    allowDecimals: It.allowDecimals,
    allowDuplicatedCategory: It.allowDuplicatedCategory,
    dataKey: void 0,
    domain: void 0,
    id: It.radiusAxisId,
    includeHidden: It.includeHidden,
    name: void 0,
    reversed: It.reversed,
    scale: It.scale,
    tick: It.tick,
    tickCount: It.tickCount,
    ticks: void 0,
    type: It.type,
    unit: void 0,
    niceTicks: 'auto'
  },
  qE = (e, t) => {
    if (t != null) return e.polarAxis.angleAxis[t];
  },
  hc = O([qE, oc], (e, t) => {
    var r;
    if (e != null) return e;
    var n = (r = go(t, 'angleAxis', $d.type)) !== null && r !== void 0 ? r : 'category';
    return Pa(Pa({}, $d), {}, { type: n });
  }),
  XE = (e, t) => e.polarAxis.radiusAxis[t],
  pc = O([XE, oc], (e, t) => {
    var r;
    if (e != null) return e;
    var n = (r = go(t, 'radiusAxis', Nd.type)) !== null && r !== void 0 ? r : 'category';
    return Pa(Pa({}, Nd), {}, { type: n });
  }),
  bo = (e) => e.polarOptions,
  mc = O([Rt, Bt, Se], dy),
  My = O([bo, mc], (e, t) => {
    if (e != null) return Be(e.innerRadius, t, 0);
  }),
  Dy = O([bo, mc], (e, t) => {
    if (e != null) return Be(e.outerRadius, t, t * 0.8);
  }),
  ZE = (e) => {
    if (e == null) return [0, 0];
    var t = e.startAngle,
      r = e.endAngle;
    return [t, r];
  },
  $y = O([bo], ZE);
O([hc, $y], yo);
var Ny = O([mc, My, Dy], (e, t, r) => {
  if (!(e == null || t == null || r == null)) return [t, r];
});
O([pc, Ny], yo);
var Ly = O([q, bo, My, Dy, Rt, Bt], (e, t, r, n, i, a) => {
    if (!((e !== 'centric' && e !== 'radial') || t == null || r == null || n == null)) {
      var o = t.cx,
        l = t.cy,
        u = t.startAngle,
        c = t.endAngle;
      return {
        cx: Be(o, i, i / 2),
        cy: Be(l, a, a / 2),
        innerRadius: r,
        outerRadius: n,
        startAngle: u,
        endAngle: c,
        clockWise: !1
      };
    }
  }),
  ve = (e, t) => t,
  gi = (e, t, r) => r;
function xo(e) {
  return e == null ? void 0 : e.id;
}
function Ry(e, t, r) {
  var n = t.chartData,
    i = n === void 0 ? [] : n,
    a = r.allowDuplicatedCategory,
    o = r.dataKey,
    l = new Map();
  return (
    e.forEach((u) => {
      var c,
        s = (c = u.data) !== null && c !== void 0 ? c : i;
      if (!(s == null || s.length === 0)) {
        var f = xo(u);
        s.forEach((d, h) => {
          var p = o == null || a ? h : String(X(d, o, null)),
            m = X(d, u.dataKey, 0),
            y;
          (l.has(p) ? (y = l.get(p)) : (y = {}), Object.assign(y, { [f]: m }), l.set(p, y));
        });
      }
    }),
    Array.from(l.values())
  );
}
function wo(e) {
  return 'stackId' in e && e.stackId != null && e.dataKey != null;
}
var bi = (e, t) => (e === t ? !0 : e == null || t == null ? !1 : e[0] === t[0] && e[1] === t[1]);
function Ao(e, t) {
  return Array.isArray(e) && Array.isArray(t) && e.length === 0 && t.length === 0 ? !0 : e === t;
}
function QE(e, t) {
  if (e.length === t.length) {
    for (var r = 0; r < e.length; r++) if (e[r] !== t[r]) return !1;
    return !0;
  }
  return !1;
}
var _e = (e) => {
    var t = q(e);
    return t === 'horizontal'
      ? 'xAxis'
      : t === 'vertical'
        ? 'yAxis'
        : t === 'centric'
          ? 'angleAxis'
          : 'radiusAxis';
  },
  bn = (e) => e.tooltip.settings.axisId;
function yc(e) {
  if (e != null) {
    var t = e.ticks,
      r = e.bandwidth,
      n = e.range(),
      i = [Math.min(...n), Math.max(...n)];
    return {
      domain: () => e.domain(),
      range: (function (a) {
        function o() {
          return a.apply(this, arguments);
        }
        return (
          (o.toString = function () {
            return a.toString();
          }),
          o
        );
      })(() => i),
      rangeMin: () => i[0],
      rangeMax: () => i[1],
      isInRange(a) {
        var o = i[0],
          l = i[1];
        return o <= l ? a >= o && a <= l : a >= l && a <= o;
      },
      bandwidth: r ? () => r.call(e) : void 0,
      ticks: t ? (a) => t.call(e, a) : void 0,
      map: (a, o) => {
        var l = e(a);
        if (l != null) {
          if (e.bandwidth && o !== null && o !== void 0 && o.position) {
            var u = e.bandwidth();
            switch (o.position) {
              case 'middle':
                l += u / 2;
                break;
              case 'end':
                l += u;
                break;
            }
          }
          return l;
        }
      }
    };
  }
}
var By = (e, t) => {
  if (t != null)
    switch (e) {
      case 'linear': {
        if (!_t(t)) {
          for (var r, n, i = 0; i < t.length; i++) {
            var a = t[i];
            H(a) && ((r === void 0 || a < r) && (r = a), (n === void 0 || a > n) && (n = a));
          }
          return r !== void 0 && n !== void 0 ? [r, n] : void 0;
        }
        return t;
      }
      default:
        return t;
    }
};
function lr(e, t) {
  return e == null || t == null ? NaN : e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function JE(e, t) {
  return e == null || t == null ? NaN : t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
function gc(e) {
  let t, r, n;
  e.length !== 2
    ? ((t = lr), (r = (l, u) => lr(e(l), u)), (n = (l, u) => e(l) - u))
    : ((t = e === lr || e === JE ? e : eI), (r = e), (n = e));
  function i(l, u, c = 0, s = l.length) {
    if (c < s) {
      if (t(u, u) !== 0) return s;
      do {
        const f = (c + s) >>> 1;
        r(l[f], u) < 0 ? (c = f + 1) : (s = f);
      } while (c < s);
    }
    return c;
  }
  function a(l, u, c = 0, s = l.length) {
    if (c < s) {
      if (t(u, u) !== 0) return s;
      do {
        const f = (c + s) >>> 1;
        r(l[f], u) <= 0 ? (c = f + 1) : (s = f);
      } while (c < s);
    }
    return c;
  }
  function o(l, u, c = 0, s = l.length) {
    const f = i(l, u, c, s - 1);
    return f > c && n(l[f - 1], u) > -n(l[f], u) ? f - 1 : f;
  }
  return { left: i, center: o, right: a };
}
function eI() {
  return 0;
}
function zy(e) {
  return e === null ? NaN : +e;
}
function* tI(e, t) {
  for (let r of e) r != null && (r = +r) >= r && (yield r);
}
const rI = gc(lr),
  xi = rI.right;
gc(zy).center;
class Ld extends Map {
  constructor(t, r = aI) {
    if (
      (super(),
      Object.defineProperties(this, { _intern: { value: new Map() }, _key: { value: r } }),
      t != null)
    )
      for (const [n, i] of t) this.set(n, i);
  }
  get(t) {
    return super.get(Rd(this, t));
  }
  has(t) {
    return super.has(Rd(this, t));
  }
  set(t, r) {
    return super.set(nI(this, t), r);
  }
  delete(t) {
    return super.delete(iI(this, t));
  }
}
function Rd({ _intern: e, _key: t }, r) {
  const n = t(r);
  return e.has(n) ? e.get(n) : r;
}
function nI({ _intern: e, _key: t }, r) {
  const n = t(r);
  return e.has(n) ? e.get(n) : (e.set(n, r), r);
}
function iI({ _intern: e, _key: t }, r) {
  const n = t(r);
  return (e.has(n) && ((r = e.get(n)), e.delete(n)), r);
}
function aI(e) {
  return e !== null && typeof e == 'object' ? e.valueOf() : e;
}
function oI(e = lr) {
  if (e === lr) return Wy;
  if (typeof e != 'function') throw new TypeError('compare is not a function');
  return (t, r) => {
    const n = e(t, r);
    return n || n === 0 ? n : (e(r, r) === 0) - (e(t, t) === 0);
  };
}
function Wy(e, t) {
  return (e == null || !(e >= e)) - (t == null || !(t >= t)) || (e < t ? -1 : e > t ? 1 : 0);
}
const lI = Math.sqrt(50),
  uI = Math.sqrt(10),
  cI = Math.sqrt(2);
function Oa(e, t, r) {
  const n = (t - e) / Math.max(0, r),
    i = Math.floor(Math.log10(n)),
    a = n / Math.pow(10, i),
    o = a >= lI ? 10 : a >= uI ? 5 : a >= cI ? 2 : 1;
  let l, u, c;
  return (
    i < 0
      ? ((c = Math.pow(10, -i) / o),
        (l = Math.round(e * c)),
        (u = Math.round(t * c)),
        l / c < e && ++l,
        u / c > t && --u,
        (c = -c))
      : ((c = Math.pow(10, i) * o),
        (l = Math.round(e / c)),
        (u = Math.round(t / c)),
        l * c < e && ++l,
        u * c > t && --u),
    u < l && 0.5 <= r && r < 2 ? Oa(e, t, r * 2) : [l, u, c]
  );
}
function cu(e, t, r) {
  if (((t = +t), (e = +e), (r = +r), !(r > 0))) return [];
  if (e === t) return [e];
  const n = t < e,
    [i, a, o] = n ? Oa(t, e, r) : Oa(e, t, r);
  if (!(a >= i)) return [];
  const l = a - i + 1,
    u = new Array(l);
  if (n)
    if (o < 0) for (let c = 0; c < l; ++c) u[c] = (a - c) / -o;
    else for (let c = 0; c < l; ++c) u[c] = (a - c) * o;
  else if (o < 0) for (let c = 0; c < l; ++c) u[c] = (i + c) / -o;
  else for (let c = 0; c < l; ++c) u[c] = (i + c) * o;
  return u;
}
function su(e, t, r) {
  return ((t = +t), (e = +e), (r = +r), Oa(e, t, r)[2]);
}
function fu(e, t, r) {
  ((t = +t), (e = +e), (r = +r));
  const n = t < e,
    i = n ? su(t, e, r) : su(e, t, r);
  return (n ? -1 : 1) * (i < 0 ? 1 / -i : i);
}
function Bd(e, t) {
  let r;
  for (const n of e) n != null && (r < n || (r === void 0 && n >= n)) && (r = n);
  return r;
}
function zd(e, t) {
  let r;
  for (const n of e) n != null && (r > n || (r === void 0 && n >= n)) && (r = n);
  return r;
}
function Fy(e, t, r = 0, n = 1 / 0, i) {
  if (
    ((t = Math.floor(t)),
    (r = Math.floor(Math.max(0, r))),
    (n = Math.floor(Math.min(e.length - 1, n))),
    !(r <= t && t <= n))
  )
    return e;
  for (i = i === void 0 ? Wy : oI(i); n > r;) {
    if (n - r > 600) {
      const u = n - r + 1,
        c = t - r + 1,
        s = Math.log(u),
        f = 0.5 * Math.exp((2 * s) / 3),
        d = 0.5 * Math.sqrt((s * f * (u - f)) / u) * (c - u / 2 < 0 ? -1 : 1),
        h = Math.max(r, Math.floor(t - (c * f) / u + d)),
        p = Math.min(n, Math.floor(t + ((u - c) * f) / u + d));
      Fy(e, t, h, p, i);
    }
    const a = e[t];
    let o = r,
      l = n;
    for (Tn(e, r, t), i(e[n], a) > 0 && Tn(e, r, n); o < l;) {
      for (Tn(e, o, l), ++o, --l; i(e[o], a) < 0;) ++o;
      for (; i(e[l], a) > 0;) --l;
    }
    (i(e[r], a) === 0 ? Tn(e, r, l) : (++l, Tn(e, l, n)),
      l <= t && (r = l + 1),
      t <= l && (n = l - 1));
  }
  return e;
}
function Tn(e, t, r) {
  const n = e[t];
  ((e[t] = e[r]), (e[r] = n));
}
function sI(e, t, r) {
  if (((e = Float64Array.from(tI(e))), !(!(n = e.length) || isNaN((t = +t))))) {
    if (t <= 0 || n < 2) return zd(e);
    if (t >= 1) return Bd(e);
    var n,
      i = (n - 1) * t,
      a = Math.floor(i),
      o = Bd(Fy(e, a).subarray(0, a + 1)),
      l = zd(e.subarray(a + 1));
    return o + (l - o) * (i - a);
  }
}
function fI(e, t, r = zy) {
  if (!(!(n = e.length) || isNaN((t = +t)))) {
    if (t <= 0 || n < 2) return +r(e[0], 0, e);
    if (t >= 1) return +r(e[n - 1], n - 1, e);
    var n,
      i = (n - 1) * t,
      a = Math.floor(i),
      o = +r(e[a], a, e),
      l = +r(e[a + 1], a + 1, e);
    return o + (l - o) * (i - a);
  }
}
function dI(e, t, r) {
  ((e = +e), (t = +t), (r = (i = arguments.length) < 2 ? ((t = e), (e = 0), 1) : i < 3 ? 1 : +r));
  for (var n = -1, i = Math.max(0, Math.ceil((t - e) / r)) | 0, a = new Array(i); ++n < i;)
    a[n] = e + n * r;
  return a;
}
function ft(e, t) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(e);
      break;
    default:
      this.range(t).domain(e);
      break;
  }
  return this;
}
function tr(e, t) {
  switch (arguments.length) {
    case 0:
      break;
    case 1: {
      typeof e == 'function' ? this.interpolator(e) : this.range(e);
      break;
    }
    default: {
      (this.domain(e), typeof t == 'function' ? this.interpolator(t) : this.range(t));
      break;
    }
  }
  return this;
}
const du = Symbol('implicit');
function bc() {
  var e = new Ld(),
    t = [],
    r = [],
    n = du;
  function i(a) {
    let o = e.get(a);
    if (o === void 0) {
      if (n !== du) return n;
      e.set(a, (o = t.push(a) - 1));
    }
    return r[o % r.length];
  }
  return (
    (i.domain = function (a) {
      if (!arguments.length) return t.slice();
      ((t = []), (e = new Ld()));
      for (const o of a) e.has(o) || e.set(o, t.push(o) - 1);
      return i;
    }),
    (i.range = function (a) {
      return arguments.length ? ((r = Array.from(a)), i) : r.slice();
    }),
    (i.unknown = function (a) {
      return arguments.length ? ((n = a), i) : n;
    }),
    (i.copy = function () {
      return bc(t, r).unknown(n);
    }),
    ft.apply(i, arguments),
    i
  );
}
function xc() {
  var e = bc().unknown(void 0),
    t = e.domain,
    r = e.range,
    n = 0,
    i = 1,
    a,
    o,
    l = !1,
    u = 0,
    c = 0,
    s = 0.5;
  delete e.unknown;
  function f() {
    var d = t().length,
      h = i < n,
      p = h ? i : n,
      m = h ? n : i;
    ((a = (m - p) / Math.max(1, d - u + c * 2)),
      l && (a = Math.floor(a)),
      (p += (m - p - a * (d - u)) * s),
      (o = a * (1 - u)),
      l && ((p = Math.round(p)), (o = Math.round(o))));
    var y = dI(d).map(function (g) {
      return p + a * g;
    });
    return r(h ? y.reverse() : y);
  }
  return (
    (e.domain = function (d) {
      return arguments.length ? (t(d), f()) : t();
    }),
    (e.range = function (d) {
      return arguments.length ? (([n, i] = d), (n = +n), (i = +i), f()) : [n, i];
    }),
    (e.rangeRound = function (d) {
      return (([n, i] = d), (n = +n), (i = +i), (l = !0), f());
    }),
    (e.bandwidth = function () {
      return o;
    }),
    (e.step = function () {
      return a;
    }),
    (e.round = function (d) {
      return arguments.length ? ((l = !!d), f()) : l;
    }),
    (e.padding = function (d) {
      return arguments.length ? ((u = Math.min(1, (c = +d))), f()) : u;
    }),
    (e.paddingInner = function (d) {
      return arguments.length ? ((u = Math.min(1, d)), f()) : u;
    }),
    (e.paddingOuter = function (d) {
      return arguments.length ? ((c = +d), f()) : c;
    }),
    (e.align = function (d) {
      return arguments.length ? ((s = Math.max(0, Math.min(1, d))), f()) : s;
    }),
    (e.copy = function () {
      return xc(t(), [n, i]).round(l).paddingInner(u).paddingOuter(c).align(s);
    }),
    ft.apply(f(), arguments)
  );
}
function Ky(e) {
  var t = e.copy;
  return (
    (e.padding = e.paddingOuter),
    delete e.paddingInner,
    delete e.paddingOuter,
    (e.copy = function () {
      return Ky(t());
    }),
    e
  );
}
function vI() {
  return Ky(xc.apply(null, arguments).paddingInner(1));
}
function wc(e, t, r) {
  ((e.prototype = t.prototype = r), (r.constructor = e));
}
function Uy(e, t) {
  var r = Object.create(e.prototype);
  for (var n in t) r[n] = t[n];
  return r;
}
function wi() {}
var Jn = 0.7,
  Sa = 1 / Jn,
  an = '\\s*([+-]?\\d+)\\s*',
  ei = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*',
  Tt = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*',
  hI = /^#([0-9a-f]{3,8})$/,
  pI = new RegExp(`^rgb\\(${an},${an},${an}\\)$`),
  mI = new RegExp(`^rgb\\(${Tt},${Tt},${Tt}\\)$`),
  yI = new RegExp(`^rgba\\(${an},${an},${an},${ei}\\)$`),
  gI = new RegExp(`^rgba\\(${Tt},${Tt},${Tt},${ei}\\)$`),
  bI = new RegExp(`^hsl\\(${ei},${Tt},${Tt}\\)$`),
  xI = new RegExp(`^hsla\\(${ei},${Tt},${Tt},${ei}\\)$`),
  Wd = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
wc(wi, ti, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: Fd,
  formatHex: Fd,
  formatHex8: wI,
  formatHsl: AI,
  formatRgb: Kd,
  toString: Kd
});
function Fd() {
  return this.rgb().formatHex();
}
function wI() {
  return this.rgb().formatHex8();
}
function AI() {
  return Hy(this).formatHsl();
}
function Kd() {
  return this.rgb().formatRgb();
}
function ti(e) {
  var t, r;
  return (
    (e = (e + '').trim().toLowerCase()),
    (t = hI.exec(e))
      ? ((r = t[1].length),
        (t = parseInt(t[1], 16)),
        r === 6
          ? Ud(t)
          : r === 3
            ? new qe(
                ((t >> 8) & 15) | ((t >> 4) & 240),
                ((t >> 4) & 15) | (t & 240),
                ((t & 15) << 4) | (t & 15),
                1
              )
            : r === 8
              ? Bi((t >> 24) & 255, (t >> 16) & 255, (t >> 8) & 255, (t & 255) / 255)
              : r === 4
                ? Bi(
                    ((t >> 12) & 15) | ((t >> 8) & 240),
                    ((t >> 8) & 15) | ((t >> 4) & 240),
                    ((t >> 4) & 15) | (t & 240),
                    (((t & 15) << 4) | (t & 15)) / 255
                  )
                : null)
      : (t = pI.exec(e))
        ? new qe(t[1], t[2], t[3], 1)
        : (t = mI.exec(e))
          ? new qe((t[1] * 255) / 100, (t[2] * 255) / 100, (t[3] * 255) / 100, 1)
          : (t = yI.exec(e))
            ? Bi(t[1], t[2], t[3], t[4])
            : (t = gI.exec(e))
              ? Bi((t[1] * 255) / 100, (t[2] * 255) / 100, (t[3] * 255) / 100, t[4])
              : (t = bI.exec(e))
                ? Yd(t[1], t[2] / 100, t[3] / 100, 1)
                : (t = xI.exec(e))
                  ? Yd(t[1], t[2] / 100, t[3] / 100, t[4])
                  : Wd.hasOwnProperty(e)
                    ? Ud(Wd[e])
                    : e === 'transparent'
                      ? new qe(NaN, NaN, NaN, 0)
                      : null
  );
}
function Ud(e) {
  return new qe((e >> 16) & 255, (e >> 8) & 255, e & 255, 1);
}
function Bi(e, t, r, n) {
  return (n <= 0 && (e = t = r = NaN), new qe(e, t, r, n));
}
function PI(e) {
  return (
    e instanceof wi || (e = ti(e)),
    e ? ((e = e.rgb()), new qe(e.r, e.g, e.b, e.opacity)) : new qe()
  );
}
function vu(e, t, r, n) {
  return arguments.length === 1 ? PI(e) : new qe(e, t, r, n ?? 1);
}
function qe(e, t, r, n) {
  ((this.r = +e), (this.g = +t), (this.b = +r), (this.opacity = +n));
}
wc(
  qe,
  vu,
  Uy(wi, {
    brighter(e) {
      return (
        (e = e == null ? Sa : Math.pow(Sa, e)),
        new qe(this.r * e, this.g * e, this.b * e, this.opacity)
      );
    },
    darker(e) {
      return (
        (e = e == null ? Jn : Math.pow(Jn, e)),
        new qe(this.r * e, this.g * e, this.b * e, this.opacity)
      );
    },
    rgb() {
      return this;
    },
    clamp() {
      return new qe(Mr(this.r), Mr(this.g), Mr(this.b), Ea(this.opacity));
    },
    displayable() {
      return (
        -0.5 <= this.r &&
        this.r < 255.5 &&
        -0.5 <= this.g &&
        this.g < 255.5 &&
        -0.5 <= this.b &&
        this.b < 255.5 &&
        0 <= this.opacity &&
        this.opacity <= 1
      );
    },
    hex: Hd,
    formatHex: Hd,
    formatHex8: OI,
    formatRgb: Vd,
    toString: Vd
  })
);
function Hd() {
  return `#${kr(this.r)}${kr(this.g)}${kr(this.b)}`;
}
function OI() {
  return `#${kr(this.r)}${kr(this.g)}${kr(this.b)}${kr((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Vd() {
  const e = Ea(this.opacity);
  return `${e === 1 ? 'rgb(' : 'rgba('}${Mr(this.r)}, ${Mr(this.g)}, ${Mr(this.b)}${e === 1 ? ')' : `, ${e})`}`;
}
function Ea(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function Mr(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function kr(e) {
  return ((e = Mr(e)), (e < 16 ? '0' : '') + e.toString(16));
}
function Yd(e, t, r, n) {
  return (
    n <= 0 ? (e = t = r = NaN) : r <= 0 || r >= 1 ? (e = t = NaN) : t <= 0 && (e = NaN),
    new gt(e, t, r, n)
  );
}
function Hy(e) {
  if (e instanceof gt) return new gt(e.h, e.s, e.l, e.opacity);
  if ((e instanceof wi || (e = ti(e)), !e)) return new gt();
  if (e instanceof gt) return e;
  e = e.rgb();
  var t = e.r / 255,
    r = e.g / 255,
    n = e.b / 255,
    i = Math.min(t, r, n),
    a = Math.max(t, r, n),
    o = NaN,
    l = a - i,
    u = (a + i) / 2;
  return (
    l
      ? (t === a
          ? (o = (r - n) / l + (r < n) * 6)
          : r === a
            ? (o = (n - t) / l + 2)
            : (o = (t - r) / l + 4),
        (l /= u < 0.5 ? a + i : 2 - a - i),
        (o *= 60))
      : (l = u > 0 && u < 1 ? 0 : o),
    new gt(o, l, u, e.opacity)
  );
}
function SI(e, t, r, n) {
  return arguments.length === 1 ? Hy(e) : new gt(e, t, r, n ?? 1);
}
function gt(e, t, r, n) {
  ((this.h = +e), (this.s = +t), (this.l = +r), (this.opacity = +n));
}
wc(
  gt,
  SI,
  Uy(wi, {
    brighter(e) {
      return (
        (e = e == null ? Sa : Math.pow(Sa, e)),
        new gt(this.h, this.s, this.l * e, this.opacity)
      );
    },
    darker(e) {
      return (
        (e = e == null ? Jn : Math.pow(Jn, e)),
        new gt(this.h, this.s, this.l * e, this.opacity)
      );
    },
    rgb() {
      var e = (this.h % 360) + (this.h < 0) * 360,
        t = isNaN(e) || isNaN(this.s) ? 0 : this.s,
        r = this.l,
        n = r + (r < 0.5 ? r : 1 - r) * t,
        i = 2 * r - n;
      return new qe(
        xl(e >= 240 ? e - 240 : e + 120, i, n),
        xl(e, i, n),
        xl(e < 120 ? e + 240 : e - 120, i, n),
        this.opacity
      );
    },
    clamp() {
      return new gt(Gd(this.h), zi(this.s), zi(this.l), Ea(this.opacity));
    },
    displayable() {
      return (
        ((0 <= this.s && this.s <= 1) || isNaN(this.s)) &&
        0 <= this.l &&
        this.l <= 1 &&
        0 <= this.opacity &&
        this.opacity <= 1
      );
    },
    formatHsl() {
      const e = Ea(this.opacity);
      return `${e === 1 ? 'hsl(' : 'hsla('}${Gd(this.h)}, ${zi(this.s) * 100}%, ${zi(this.l) * 100}%${e === 1 ? ')' : `, ${e})`}`;
    }
  })
);
function Gd(e) {
  return ((e = (e || 0) % 360), e < 0 ? e + 360 : e);
}
function zi(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function xl(e, t, r) {
  return (
    (e < 60 ? t + ((r - t) * e) / 60 : e < 180 ? r : e < 240 ? t + ((r - t) * (240 - e)) / 60 : t) *
    255
  );
}
const Ac = (e) => () => e;
function EI(e, t) {
  return function (r) {
    return e + r * t;
  };
}
function II(e, t, r) {
  return (
    (e = Math.pow(e, r)),
    (t = Math.pow(t, r) - e),
    (r = 1 / r),
    function (n) {
      return Math.pow(e + n * t, r);
    }
  );
}
function kI(e) {
  return (e = +e) == 1
    ? Vy
    : function (t, r) {
        return r - t ? II(t, r, e) : Ac(isNaN(t) ? r : t);
      };
}
function Vy(e, t) {
  var r = t - e;
  return r ? EI(e, r) : Ac(isNaN(e) ? t : e);
}
const qd = (function e(t) {
  var r = kI(t);
  function n(i, a) {
    var o = r((i = vu(i)).r, (a = vu(a)).r),
      l = r(i.g, a.g),
      u = r(i.b, a.b),
      c = Vy(i.opacity, a.opacity);
    return function (s) {
      return ((i.r = o(s)), (i.g = l(s)), (i.b = u(s)), (i.opacity = c(s)), i + '');
    };
  }
  return ((n.gamma = e), n);
})(1);
function CI(e, t) {
  t || (t = []);
  var r = e ? Math.min(t.length, e.length) : 0,
    n = t.slice(),
    i;
  return function (a) {
    for (i = 0; i < r; ++i) n[i] = e[i] * (1 - a) + t[i] * a;
    return n;
  };
}
function jI(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function _I(e, t) {
  var r = t ? t.length : 0,
    n = e ? Math.min(r, e.length) : 0,
    i = new Array(n),
    a = new Array(r),
    o;
  for (o = 0; o < n; ++o) i[o] = xn(e[o], t[o]);
  for (; o < r; ++o) a[o] = t[o];
  return function (l) {
    for (o = 0; o < n; ++o) a[o] = i[o](l);
    return a;
  };
}
function TI(e, t) {
  var r = new Date();
  return (
    (e = +e),
    (t = +t),
    function (n) {
      return (r.setTime(e * (1 - n) + t * n), r);
    }
  );
}
function Ia(e, t) {
  return (
    (e = +e),
    (t = +t),
    function (r) {
      return e * (1 - r) + t * r;
    }
  );
}
function MI(e, t) {
  var r = {},
    n = {},
    i;
  ((e === null || typeof e != 'object') && (e = {}),
    (t === null || typeof t != 'object') && (t = {}));
  for (i in t) i in e ? (r[i] = xn(e[i], t[i])) : (n[i] = t[i]);
  return function (a) {
    for (i in r) n[i] = r[i](a);
    return n;
  };
}
var hu = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
  wl = new RegExp(hu.source, 'g');
function DI(e) {
  return function () {
    return e;
  };
}
function $I(e) {
  return function (t) {
    return e(t) + '';
  };
}
function NI(e, t) {
  var r = (hu.lastIndex = wl.lastIndex = 0),
    n,
    i,
    a,
    o = -1,
    l = [],
    u = [];
  for (e = e + '', t = t + ''; (n = hu.exec(e)) && (i = wl.exec(t));)
    ((a = i.index) > r && ((a = t.slice(r, a)), l[o] ? (l[o] += a) : (l[++o] = a)),
      (n = n[0]) === (i = i[0])
        ? l[o]
          ? (l[o] += i)
          : (l[++o] = i)
        : ((l[++o] = null), u.push({ i: o, x: Ia(n, i) })),
      (r = wl.lastIndex));
  return (
    r < t.length && ((a = t.slice(r)), l[o] ? (l[o] += a) : (l[++o] = a)),
    l.length < 2
      ? u[0]
        ? $I(u[0].x)
        : DI(t)
      : ((t = u.length),
        function (c) {
          for (var s = 0, f; s < t; ++s) l[(f = u[s]).i] = f.x(c);
          return l.join('');
        })
  );
}
function xn(e, t) {
  var r = typeof t,
    n;
  return t == null || r === 'boolean'
    ? Ac(t)
    : (r === 'number'
        ? Ia
        : r === 'string'
          ? (n = ti(t))
            ? ((t = n), qd)
            : NI
          : t instanceof ti
            ? qd
            : t instanceof Date
              ? TI
              : jI(t)
                ? CI
                : Array.isArray(t)
                  ? _I
                  : (typeof t.valueOf != 'function' && typeof t.toString != 'function') || isNaN(t)
                    ? MI
                    : Ia)(e, t);
}
function Pc(e, t) {
  return (
    (e = +e),
    (t = +t),
    function (r) {
      return Math.round(e * (1 - r) + t * r);
    }
  );
}
function LI(e, t) {
  t === void 0 && ((t = e), (e = xn));
  for (var r = 0, n = t.length - 1, i = t[0], a = new Array(n < 0 ? 0 : n); r < n;)
    a[r] = e(i, (i = t[++r]));
  return function (o) {
    var l = Math.max(0, Math.min(n - 1, Math.floor((o *= n))));
    return a[l](o - l);
  };
}
function RI(e) {
  return function () {
    return e;
  };
}
function ka(e) {
  return +e;
}
var Xd = [0, 1];
function He(e) {
  return e;
}
function pu(e, t) {
  return (t -= e = +e)
    ? function (r) {
        return (r - e) / t;
      }
    : RI(isNaN(t) ? NaN : 0.5);
}
function BI(e, t) {
  var r;
  return (
    e > t && ((r = e), (e = t), (t = r)),
    function (n) {
      return Math.max(e, Math.min(t, n));
    }
  );
}
function zI(e, t, r) {
  var n = e[0],
    i = e[1],
    a = t[0],
    o = t[1];
  return (
    i < n ? ((n = pu(i, n)), (a = r(o, a))) : ((n = pu(n, i)), (a = r(a, o))),
    function (l) {
      return a(n(l));
    }
  );
}
function WI(e, t, r) {
  var n = Math.min(e.length, t.length) - 1,
    i = new Array(n),
    a = new Array(n),
    o = -1;
  for (e[n] < e[0] && ((e = e.slice().reverse()), (t = t.slice().reverse())); ++o < n;)
    ((i[o] = pu(e[o], e[o + 1])), (a[o] = r(t[o], t[o + 1])));
  return function (l) {
    var u = xi(e, l, 1, n) - 1;
    return a[u](i[u](l));
  };
}
function Ai(e, t) {
  return t
    .domain(e.domain())
    .range(e.range())
    .interpolate(e.interpolate())
    .clamp(e.clamp())
    .unknown(e.unknown());
}
function Po() {
  var e = Xd,
    t = Xd,
    r = xn,
    n,
    i,
    a,
    o = He,
    l,
    u,
    c;
  function s() {
    var d = Math.min(e.length, t.length);
    return (o !== He && (o = BI(e[0], e[d - 1])), (l = d > 2 ? WI : zI), (u = c = null), f);
  }
  function f(d) {
    return d == null || isNaN((d = +d)) ? a : (u || (u = l(e.map(n), t, r)))(n(o(d)));
  }
  return (
    (f.invert = function (d) {
      return o(i((c || (c = l(t, e.map(n), Ia)))(d)));
    }),
    (f.domain = function (d) {
      return arguments.length ? ((e = Array.from(d, ka)), s()) : e.slice();
    }),
    (f.range = function (d) {
      return arguments.length ? ((t = Array.from(d)), s()) : t.slice();
    }),
    (f.rangeRound = function (d) {
      return ((t = Array.from(d)), (r = Pc), s());
    }),
    (f.clamp = function (d) {
      return arguments.length ? ((o = d ? !0 : He), s()) : o !== He;
    }),
    (f.interpolate = function (d) {
      return arguments.length ? ((r = d), s()) : r;
    }),
    (f.unknown = function (d) {
      return arguments.length ? ((a = d), f) : a;
    }),
    function (d, h) {
      return ((n = d), (i = h), s());
    }
  );
}
function Oc() {
  return Po()(He, He);
}
function FI(e) {
  return Math.abs((e = Math.round(e))) >= 1e21
    ? e.toLocaleString('en').replace(/,/g, '')
    : e.toString(10);
}
function Ca(e, t) {
  if (!isFinite(e) || e === 0) return null;
  var r = (e = t ? e.toExponential(t - 1) : e.toExponential()).indexOf('e'),
    n = e.slice(0, r);
  return [n.length > 1 ? n[0] + n.slice(2) : n, +e.slice(r + 1)];
}
function sn(e) {
  return ((e = Ca(Math.abs(e))), e ? e[1] : NaN);
}
function KI(e, t) {
  return function (r, n) {
    for (
      var i = r.length, a = [], o = 0, l = e[0], u = 0;
      i > 0 &&
      l > 0 &&
      (u + l + 1 > n && (l = Math.max(1, n - u)),
      a.push(r.substring((i -= l), i + l)),
      !((u += l + 1) > n));
    )
      l = e[(o = (o + 1) % e.length)];
    return a.reverse().join(t);
  };
}
function UI(e) {
  return function (t) {
    return t.replace(/[0-9]/g, function (r) {
      return e[+r];
    });
  };
}
var HI = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function ri(e) {
  if (!(t = HI.exec(e))) throw new Error('invalid format: ' + e);
  var t;
  return new Sc({
    fill: t[1],
    align: t[2],
    sign: t[3],
    symbol: t[4],
    zero: t[5],
    width: t[6],
    comma: t[7],
    precision: t[8] && t[8].slice(1),
    trim: t[9],
    type: t[10]
  });
}
ri.prototype = Sc.prototype;
function Sc(e) {
  ((this.fill = e.fill === void 0 ? ' ' : e.fill + ''),
    (this.align = e.align === void 0 ? '>' : e.align + ''),
    (this.sign = e.sign === void 0 ? '-' : e.sign + ''),
    (this.symbol = e.symbol === void 0 ? '' : e.symbol + ''),
    (this.zero = !!e.zero),
    (this.width = e.width === void 0 ? void 0 : +e.width),
    (this.comma = !!e.comma),
    (this.precision = e.precision === void 0 ? void 0 : +e.precision),
    (this.trim = !!e.trim),
    (this.type = e.type === void 0 ? '' : e.type + ''));
}
Sc.prototype.toString = function () {
  return (
    this.fill +
    this.align +
    this.sign +
    this.symbol +
    (this.zero ? '0' : '') +
    (this.width === void 0 ? '' : Math.max(1, this.width | 0)) +
    (this.comma ? ',' : '') +
    (this.precision === void 0 ? '' : '.' + Math.max(0, this.precision | 0)) +
    (this.trim ? '~' : '') +
    this.type
  );
};
function VI(e) {
  e: for (var t = e.length, r = 1, n = -1, i; r < t; ++r)
    switch (e[r]) {
      case '.':
        n = i = r;
        break;
      case '0':
        (n === 0 && (n = r), (i = r));
        break;
      default:
        if (!+e[r]) break e;
        n > 0 && (n = 0);
        break;
    }
  return n > 0 ? e.slice(0, n) + e.slice(i + 1) : e;
}
var ja;
function YI(e, t) {
  var r = Ca(e, t);
  if (!r) return ((ja = void 0), e.toPrecision(t));
  var n = r[0],
    i = r[1],
    a = i - (ja = Math.max(-8, Math.min(8, Math.floor(i / 3))) * 3) + 1,
    o = n.length;
  return a === o
    ? n
    : a > o
      ? n + new Array(a - o + 1).join('0')
      : a > 0
        ? n.slice(0, a) + '.' + n.slice(a)
        : '0.' + new Array(1 - a).join('0') + Ca(e, Math.max(0, t + a - 1))[0];
}
function Zd(e, t) {
  var r = Ca(e, t);
  if (!r) return e + '';
  var n = r[0],
    i = r[1];
  return i < 0
    ? '0.' + new Array(-i).join('0') + n
    : n.length > i + 1
      ? n.slice(0, i + 1) + '.' + n.slice(i + 1)
      : n + new Array(i - n.length + 2).join('0');
}
const Qd = {
  '%': (e, t) => (e * 100).toFixed(t),
  b: (e) => Math.round(e).toString(2),
  c: (e) => e + '',
  d: FI,
  e: (e, t) => e.toExponential(t),
  f: (e, t) => e.toFixed(t),
  g: (e, t) => e.toPrecision(t),
  o: (e) => Math.round(e).toString(8),
  p: (e, t) => Zd(e * 100, t),
  r: Zd,
  s: YI,
  X: (e) => Math.round(e).toString(16).toUpperCase(),
  x: (e) => Math.round(e).toString(16)
};
function Jd(e) {
  return e;
}
var ev = Array.prototype.map,
  tv = ['y', 'z', 'a', 'f', 'p', 'n', 'µ', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
function GI(e) {
  var t =
      e.grouping === void 0 || e.thousands === void 0
        ? Jd
        : KI(ev.call(e.grouping, Number), e.thousands + ''),
    r = e.currency === void 0 ? '' : e.currency[0] + '',
    n = e.currency === void 0 ? '' : e.currency[1] + '',
    i = e.decimal === void 0 ? '.' : e.decimal + '',
    a = e.numerals === void 0 ? Jd : UI(ev.call(e.numerals, String)),
    o = e.percent === void 0 ? '%' : e.percent + '',
    l = e.minus === void 0 ? '−' : e.minus + '',
    u = e.nan === void 0 ? 'NaN' : e.nan + '';
  function c(f, d) {
    f = ri(f);
    var h = f.fill,
      p = f.align,
      m = f.sign,
      y = f.symbol,
      g = f.zero,
      x = f.width,
      A = f.comma,
      w = f.precision,
      P = f.trim,
      b = f.type;
    (b === 'n' ? ((A = !0), (b = 'g')) : Qd[b] || (w === void 0 && (w = 12), (P = !0), (b = 'g')),
      (g || (h === '0' && p === '=')) && ((g = !0), (h = '0'), (p = '=')));
    var S =
        (d && d.prefix !== void 0 ? d.prefix : '') +
        (y === '$' ? r : y === '#' && /[boxX]/.test(b) ? '0' + b.toLowerCase() : ''),
      E = (y === '$' ? n : /[%p]/.test(b) ? o : '') + (d && d.suffix !== void 0 ? d.suffix : ''),
      C = Qd[b],
      k = /[defgprs%]/.test(b);
    w =
      w === void 0
        ? 6
        : /[gprs]/.test(b)
          ? Math.max(1, Math.min(21, w))
          : Math.max(0, Math.min(20, w));
    function j(I) {
      var R = S,
        D = E,
        $,
        z,
        W;
      if (b === 'c') ((D = C(I) + D), (I = ''));
      else {
        I = +I;
        var B = I < 0 || 1 / I < 0;
        if (
          ((I = isNaN(I) ? u : C(Math.abs(I), w)),
          P && (I = VI(I)),
          B && +I == 0 && m !== '+' && (B = !1),
          (R = (B ? (m === '(' ? m : l) : m === '-' || m === '(' ? '' : m) + R),
          (D =
            (b === 's' && !isNaN(I) && ja !== void 0 ? tv[8 + ja / 3] : '') +
            D +
            (B && m === '(' ? ')' : '')),
          k)
        ) {
          for ($ = -1, z = I.length; ++$ < z;)
            if (((W = I.charCodeAt($)), 48 > W || W > 57)) {
              ((D = (W === 46 ? i + I.slice($ + 1) : I.slice($)) + D), (I = I.slice(0, $)));
              break;
            }
        }
      }
      A && !g && (I = t(I, 1 / 0));
      var Y = R.length + I.length + D.length,
        K = Y < x ? new Array(x - Y + 1).join(h) : '';
      switch ((A && g && ((I = t(K + I, K.length ? x - D.length : 1 / 0)), (K = '')), p)) {
        case '<':
          I = R + I + D + K;
          break;
        case '=':
          I = R + K + I + D;
          break;
        case '^':
          I = K.slice(0, (Y = K.length >> 1)) + R + I + D + K.slice(Y);
          break;
        default:
          I = K + R + I + D;
          break;
      }
      return a(I);
    }
    return (
      (j.toString = function () {
        return f + '';
      }),
      j
    );
  }
  function s(f, d) {
    var h = Math.max(-8, Math.min(8, Math.floor(sn(d) / 3))) * 3,
      p = Math.pow(10, -h),
      m = c(((f = ri(f)), (f.type = 'f'), f), { suffix: tv[8 + h / 3] });
    return function (y) {
      return m(p * y);
    };
  }
  return { format: c, formatPrefix: s };
}
var Wi, Ec, Yy;
qI({ thousands: ',', grouping: [3], currency: ['$', ''] });
function qI(e) {
  return ((Wi = GI(e)), (Ec = Wi.format), (Yy = Wi.formatPrefix), Wi);
}
function XI(e) {
  return Math.max(0, -sn(Math.abs(e)));
}
function ZI(e, t) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(sn(t) / 3))) * 3 - sn(Math.abs(e)));
}
function QI(e, t) {
  return ((e = Math.abs(e)), (t = Math.abs(t) - e), Math.max(0, sn(t) - sn(e)) + 1);
}
function Gy(e, t, r, n) {
  var i = fu(e, t, r),
    a;
  switch (((n = ri(n ?? ',f')), n.type)) {
    case 's': {
      var o = Math.max(Math.abs(e), Math.abs(t));
      return (n.precision == null && !isNaN((a = ZI(i, o))) && (n.precision = a), Yy(n, o));
    }
    case '':
    case 'e':
    case 'g':
    case 'p':
    case 'r': {
      n.precision == null &&
        !isNaN((a = QI(i, Math.max(Math.abs(e), Math.abs(t))))) &&
        (n.precision = a - (n.type === 'e'));
      break;
    }
    case 'f':
    case '%': {
      n.precision == null && !isNaN((a = XI(i))) && (n.precision = a - (n.type === '%') * 2);
      break;
    }
  }
  return Ec(n);
}
function pr(e) {
  var t = e.domain;
  return (
    (e.ticks = function (r) {
      var n = t();
      return cu(n[0], n[n.length - 1], r ?? 10);
    }),
    (e.tickFormat = function (r, n) {
      var i = t();
      return Gy(i[0], i[i.length - 1], r ?? 10, n);
    }),
    (e.nice = function (r) {
      r == null && (r = 10);
      var n = t(),
        i = 0,
        a = n.length - 1,
        o = n[i],
        l = n[a],
        u,
        c,
        s = 10;
      for (l < o && ((c = o), (o = l), (l = c), (c = i), (i = a), (a = c)); s-- > 0;) {
        if (((c = su(o, l, r)), c === u)) return ((n[i] = o), (n[a] = l), t(n));
        if (c > 0) ((o = Math.floor(o / c) * c), (l = Math.ceil(l / c) * c));
        else if (c < 0) ((o = Math.ceil(o * c) / c), (l = Math.floor(l * c) / c));
        else break;
        u = c;
      }
      return e;
    }),
    e
  );
}
function qy() {
  var e = Oc();
  return (
    (e.copy = function () {
      return Ai(e, qy());
    }),
    ft.apply(e, arguments),
    pr(e)
  );
}
function Xy(e) {
  var t;
  function r(n) {
    return n == null || isNaN((n = +n)) ? t : n;
  }
  return (
    (r.invert = r),
    (r.domain = r.range =
      function (n) {
        return arguments.length ? ((e = Array.from(n, ka)), r) : e.slice();
      }),
    (r.unknown = function (n) {
      return arguments.length ? ((t = n), r) : t;
    }),
    (r.copy = function () {
      return Xy(e).unknown(t);
    }),
    (e = arguments.length ? Array.from(e, ka) : [0, 1]),
    pr(r)
  );
}
function Zy(e, t) {
  e = e.slice();
  var r = 0,
    n = e.length - 1,
    i = e[r],
    a = e[n],
    o;
  return (
    a < i && ((o = r), (r = n), (n = o), (o = i), (i = a), (a = o)),
    (e[r] = t.floor(i)),
    (e[n] = t.ceil(a)),
    e
  );
}
function rv(e) {
  return Math.log(e);
}
function nv(e) {
  return Math.exp(e);
}
function JI(e) {
  return -Math.log(-e);
}
function ek(e) {
  return -Math.exp(-e);
}
function tk(e) {
  return isFinite(e) ? +('1e' + e) : e < 0 ? 0 : e;
}
function rk(e) {
  return e === 10 ? tk : e === Math.E ? Math.exp : (t) => Math.pow(e, t);
}
function nk(e) {
  return e === Math.E
    ? Math.log
    : (e === 10 && Math.log10) ||
        (e === 2 && Math.log2) ||
        ((e = Math.log(e)), (t) => Math.log(t) / e);
}
function iv(e) {
  return (t, r) => -e(-t, r);
}
function Ic(e) {
  const t = e(rv, nv),
    r = t.domain;
  let n = 10,
    i,
    a;
  function o() {
    return (
      (i = nk(n)),
      (a = rk(n)),
      r()[0] < 0 ? ((i = iv(i)), (a = iv(a)), e(JI, ek)) : e(rv, nv),
      t
    );
  }
  return (
    (t.base = function (l) {
      return arguments.length ? ((n = +l), o()) : n;
    }),
    (t.domain = function (l) {
      return arguments.length ? (r(l), o()) : r();
    }),
    (t.ticks = (l) => {
      const u = r();
      let c = u[0],
        s = u[u.length - 1];
      const f = s < c;
      f && ([c, s] = [s, c]);
      let d = i(c),
        h = i(s),
        p,
        m;
      const y = l == null ? 10 : +l;
      let g = [];
      if (!(n % 1) && h - d < y) {
        if (((d = Math.floor(d)), (h = Math.ceil(h)), c > 0)) {
          for (; d <= h; ++d)
            for (p = 1; p < n; ++p)
              if (((m = d < 0 ? p / a(-d) : p * a(d)), !(m < c))) {
                if (m > s) break;
                g.push(m);
              }
        } else
          for (; d <= h; ++d)
            for (p = n - 1; p >= 1; --p)
              if (((m = d > 0 ? p / a(-d) : p * a(d)), !(m < c))) {
                if (m > s) break;
                g.push(m);
              }
        g.length * 2 < y && (g = cu(c, s, y));
      } else g = cu(d, h, Math.min(h - d, y)).map(a);
      return f ? g.reverse() : g;
    }),
    (t.tickFormat = (l, u) => {
      if (
        (l == null && (l = 10),
        u == null && (u = n === 10 ? 's' : ','),
        typeof u != 'function' &&
          (!(n % 1) && (u = ri(u)).precision == null && (u.trim = !0), (u = Ec(u))),
        l === 1 / 0)
      )
        return u;
      const c = Math.max(1, (n * l) / t.ticks().length);
      return (s) => {
        let f = s / a(Math.round(i(s)));
        return (f * n < n - 0.5 && (f *= n), f <= c ? u(s) : '');
      };
    }),
    (t.nice = () =>
      r(Zy(r(), { floor: (l) => a(Math.floor(i(l))), ceil: (l) => a(Math.ceil(i(l))) }))),
    t
  );
}
function Qy() {
  const e = Ic(Po()).domain([1, 10]);
  return ((e.copy = () => Ai(e, Qy()).base(e.base())), ft.apply(e, arguments), e);
}
function av(e) {
  return function (t) {
    return Math.sign(t) * Math.log1p(Math.abs(t / e));
  };
}
function ov(e) {
  return function (t) {
    return Math.sign(t) * Math.expm1(Math.abs(t)) * e;
  };
}
function kc(e) {
  var t = 1,
    r = e(av(t), ov(t));
  return (
    (r.constant = function (n) {
      return arguments.length ? e(av((t = +n)), ov(t)) : t;
    }),
    pr(r)
  );
}
function Jy() {
  var e = kc(Po());
  return (
    (e.copy = function () {
      return Ai(e, Jy()).constant(e.constant());
    }),
    ft.apply(e, arguments)
  );
}
function lv(e) {
  return function (t) {
    return t < 0 ? -Math.pow(-t, e) : Math.pow(t, e);
  };
}
function ik(e) {
  return e < 0 ? -Math.sqrt(-e) : Math.sqrt(e);
}
function ak(e) {
  return e < 0 ? -e * e : e * e;
}
function Cc(e) {
  var t = e(He, He),
    r = 1;
  function n() {
    return r === 1 ? e(He, He) : r === 0.5 ? e(ik, ak) : e(lv(r), lv(1 / r));
  }
  return (
    (t.exponent = function (i) {
      return arguments.length ? ((r = +i), n()) : r;
    }),
    pr(t)
  );
}
function jc() {
  var e = Cc(Po());
  return (
    (e.copy = function () {
      return Ai(e, jc()).exponent(e.exponent());
    }),
    ft.apply(e, arguments),
    e
  );
}
function ok() {
  return jc.apply(null, arguments).exponent(0.5);
}
function uv(e) {
  return Math.sign(e) * e * e;
}
function lk(e) {
  return Math.sign(e) * Math.sqrt(Math.abs(e));
}
function eg() {
  var e = Oc(),
    t = [0, 1],
    r = !1,
    n;
  function i(a) {
    var o = lk(e(a));
    return isNaN(o) ? n : r ? Math.round(o) : o;
  }
  return (
    (i.invert = function (a) {
      return e.invert(uv(a));
    }),
    (i.domain = function (a) {
      return arguments.length ? (e.domain(a), i) : e.domain();
    }),
    (i.range = function (a) {
      return arguments.length ? (e.range((t = Array.from(a, ka)).map(uv)), i) : t.slice();
    }),
    (i.rangeRound = function (a) {
      return i.range(a).round(!0);
    }),
    (i.round = function (a) {
      return arguments.length ? ((r = !!a), i) : r;
    }),
    (i.clamp = function (a) {
      return arguments.length ? (e.clamp(a), i) : e.clamp();
    }),
    (i.unknown = function (a) {
      return arguments.length ? ((n = a), i) : n;
    }),
    (i.copy = function () {
      return eg(e.domain(), t).round(r).clamp(e.clamp()).unknown(n);
    }),
    ft.apply(i, arguments),
    pr(i)
  );
}
function tg() {
  var e = [],
    t = [],
    r = [],
    n;
  function i() {
    var o = 0,
      l = Math.max(1, t.length);
    for (r = new Array(l - 1); ++o < l;) r[o - 1] = fI(e, o / l);
    return a;
  }
  function a(o) {
    return o == null || isNaN((o = +o)) ? n : t[xi(r, o)];
  }
  return (
    (a.invertExtent = function (o) {
      var l = t.indexOf(o);
      return l < 0 ? [NaN, NaN] : [l > 0 ? r[l - 1] : e[0], l < r.length ? r[l] : e[e.length - 1]];
    }),
    (a.domain = function (o) {
      if (!arguments.length) return e.slice();
      e = [];
      for (let l of o) l != null && !isNaN((l = +l)) && e.push(l);
      return (e.sort(lr), i());
    }),
    (a.range = function (o) {
      return arguments.length ? ((t = Array.from(o)), i()) : t.slice();
    }),
    (a.unknown = function (o) {
      return arguments.length ? ((n = o), a) : n;
    }),
    (a.quantiles = function () {
      return r.slice();
    }),
    (a.copy = function () {
      return tg().domain(e).range(t).unknown(n);
    }),
    ft.apply(a, arguments)
  );
}
function rg() {
  var e = 0,
    t = 1,
    r = 1,
    n = [0.5],
    i = [0, 1],
    a;
  function o(u) {
    return u != null && u <= u ? i[xi(n, u, 0, r)] : a;
  }
  function l() {
    var u = -1;
    for (n = new Array(r); ++u < r;) n[u] = ((u + 1) * t - (u - r) * e) / (r + 1);
    return o;
  }
  return (
    (o.domain = function (u) {
      return arguments.length ? (([e, t] = u), (e = +e), (t = +t), l()) : [e, t];
    }),
    (o.range = function (u) {
      return arguments.length ? ((r = (i = Array.from(u)).length - 1), l()) : i.slice();
    }),
    (o.invertExtent = function (u) {
      var c = i.indexOf(u);
      return c < 0 ? [NaN, NaN] : c < 1 ? [e, n[0]] : c >= r ? [n[r - 1], t] : [n[c - 1], n[c]];
    }),
    (o.unknown = function (u) {
      return (arguments.length && (a = u), o);
    }),
    (o.thresholds = function () {
      return n.slice();
    }),
    (o.copy = function () {
      return rg().domain([e, t]).range(i).unknown(a);
    }),
    ft.apply(pr(o), arguments)
  );
}
function ng() {
  var e = [0.5],
    t = [0, 1],
    r,
    n = 1;
  function i(a) {
    return a != null && a <= a ? t[xi(e, a, 0, n)] : r;
  }
  return (
    (i.domain = function (a) {
      return arguments.length
        ? ((e = Array.from(a)), (n = Math.min(e.length, t.length - 1)), i)
        : e.slice();
    }),
    (i.range = function (a) {
      return arguments.length
        ? ((t = Array.from(a)), (n = Math.min(e.length, t.length - 1)), i)
        : t.slice();
    }),
    (i.invertExtent = function (a) {
      var o = t.indexOf(a);
      return [e[o - 1], e[o]];
    }),
    (i.unknown = function (a) {
      return arguments.length ? ((r = a), i) : r;
    }),
    (i.copy = function () {
      return ng().domain(e).range(t).unknown(r);
    }),
    ft.apply(i, arguments)
  );
}
const Al = new Date(),
  Pl = new Date();
function Ie(e, t, r, n) {
  function i(a) {
    return (e((a = arguments.length === 0 ? new Date() : new Date(+a))), a);
  }
  return (
    (i.floor = (a) => (e((a = new Date(+a))), a)),
    (i.ceil = (a) => (e((a = new Date(a - 1))), t(a, 1), e(a), a)),
    (i.round = (a) => {
      const o = i(a),
        l = i.ceil(a);
      return a - o < l - a ? o : l;
    }),
    (i.offset = (a, o) => (t((a = new Date(+a)), o == null ? 1 : Math.floor(o)), a)),
    (i.range = (a, o, l) => {
      const u = [];
      if (((a = i.ceil(a)), (l = l == null ? 1 : Math.floor(l)), !(a < o) || !(l > 0))) return u;
      let c;
      do (u.push((c = new Date(+a))), t(a, l), e(a));
      while (c < a && a < o);
      return u;
    }),
    (i.filter = (a) =>
      Ie(
        (o) => {
          if (o >= o) for (; e(o), !a(o);) o.setTime(o - 1);
        },
        (o, l) => {
          if (o >= o)
            if (l < 0) for (; ++l <= 0;) for (; t(o, -1), !a(o););
            else for (; --l >= 0;) for (; t(o, 1), !a(o););
        }
      )),
    r &&
      ((i.count = (a, o) => (Al.setTime(+a), Pl.setTime(+o), e(Al), e(Pl), Math.floor(r(Al, Pl)))),
      (i.every = (a) => (
        (a = Math.floor(a)),
        !isFinite(a) || !(a > 0)
          ? null
          : a > 1
            ? i.filter(n ? (o) => n(o) % a === 0 : (o) => i.count(0, o) % a === 0)
            : i
      ))),
    i
  );
}
const _a = Ie(
  () => {},
  (e, t) => {
    e.setTime(+e + t);
  },
  (e, t) => t - e
);
_a.every = (e) => (
  (e = Math.floor(e)),
  !isFinite(e) || !(e > 0)
    ? null
    : e > 1
      ? Ie(
          (t) => {
            t.setTime(Math.floor(t / e) * e);
          },
          (t, r) => {
            t.setTime(+t + r * e);
          },
          (t, r) => (r - t) / e
        )
      : _a
);
_a.range;
const Yt = 1e3,
  lt = Yt * 60,
  Gt = lt * 60,
  Qt = Gt * 24,
  _c = Qt * 7,
  cv = Qt * 30,
  Ol = Qt * 365,
  Cr = Ie(
    (e) => {
      e.setTime(e - e.getMilliseconds());
    },
    (e, t) => {
      e.setTime(+e + t * Yt);
    },
    (e, t) => (t - e) / Yt,
    (e) => e.getUTCSeconds()
  );
Cr.range;
const Tc = Ie(
  (e) => {
    e.setTime(e - e.getMilliseconds() - e.getSeconds() * Yt);
  },
  (e, t) => {
    e.setTime(+e + t * lt);
  },
  (e, t) => (t - e) / lt,
  (e) => e.getMinutes()
);
Tc.range;
const Mc = Ie(
  (e) => {
    e.setUTCSeconds(0, 0);
  },
  (e, t) => {
    e.setTime(+e + t * lt);
  },
  (e, t) => (t - e) / lt,
  (e) => e.getUTCMinutes()
);
Mc.range;
const Dc = Ie(
  (e) => {
    e.setTime(e - e.getMilliseconds() - e.getSeconds() * Yt - e.getMinutes() * lt);
  },
  (e, t) => {
    e.setTime(+e + t * Gt);
  },
  (e, t) => (t - e) / Gt,
  (e) => e.getHours()
);
Dc.range;
const $c = Ie(
  (e) => {
    e.setUTCMinutes(0, 0, 0);
  },
  (e, t) => {
    e.setTime(+e + t * Gt);
  },
  (e, t) => (t - e) / Gt,
  (e) => e.getUTCHours()
);
$c.range;
const Pi = Ie(
  (e) => e.setHours(0, 0, 0, 0),
  (e, t) => e.setDate(e.getDate() + t),
  (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * lt) / Qt,
  (e) => e.getDate() - 1
);
Pi.range;
const Oo = Ie(
  (e) => {
    e.setUTCHours(0, 0, 0, 0);
  },
  (e, t) => {
    e.setUTCDate(e.getUTCDate() + t);
  },
  (e, t) => (t - e) / Qt,
  (e) => e.getUTCDate() - 1
);
Oo.range;
const ig = Ie(
  (e) => {
    e.setUTCHours(0, 0, 0, 0);
  },
  (e, t) => {
    e.setUTCDate(e.getUTCDate() + t);
  },
  (e, t) => (t - e) / Qt,
  (e) => Math.floor(e / Qt)
);
ig.range;
function Kr(e) {
  return Ie(
    (t) => {
      (t.setDate(t.getDate() - ((t.getDay() + 7 - e) % 7)), t.setHours(0, 0, 0, 0));
    },
    (t, r) => {
      t.setDate(t.getDate() + r * 7);
    },
    (t, r) => (r - t - (r.getTimezoneOffset() - t.getTimezoneOffset()) * lt) / _c
  );
}
const So = Kr(0),
  Ta = Kr(1),
  uk = Kr(2),
  ck = Kr(3),
  fn = Kr(4),
  sk = Kr(5),
  fk = Kr(6);
So.range;
Ta.range;
uk.range;
ck.range;
fn.range;
sk.range;
fk.range;
function Ur(e) {
  return Ie(
    (t) => {
      (t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 7 - e) % 7)), t.setUTCHours(0, 0, 0, 0));
    },
    (t, r) => {
      t.setUTCDate(t.getUTCDate() + r * 7);
    },
    (t, r) => (r - t) / _c
  );
}
const Eo = Ur(0),
  Ma = Ur(1),
  dk = Ur(2),
  vk = Ur(3),
  dn = Ur(4),
  hk = Ur(5),
  pk = Ur(6);
Eo.range;
Ma.range;
dk.range;
vk.range;
dn.range;
hk.range;
pk.range;
const Nc = Ie(
  (e) => {
    (e.setDate(1), e.setHours(0, 0, 0, 0));
  },
  (e, t) => {
    e.setMonth(e.getMonth() + t);
  },
  (e, t) => t.getMonth() - e.getMonth() + (t.getFullYear() - e.getFullYear()) * 12,
  (e) => e.getMonth()
);
Nc.range;
const Lc = Ie(
  (e) => {
    (e.setUTCDate(1), e.setUTCHours(0, 0, 0, 0));
  },
  (e, t) => {
    e.setUTCMonth(e.getUTCMonth() + t);
  },
  (e, t) => t.getUTCMonth() - e.getUTCMonth() + (t.getUTCFullYear() - e.getUTCFullYear()) * 12,
  (e) => e.getUTCMonth()
);
Lc.range;
const Jt = Ie(
  (e) => {
    (e.setMonth(0, 1), e.setHours(0, 0, 0, 0));
  },
  (e, t) => {
    e.setFullYear(e.getFullYear() + t);
  },
  (e, t) => t.getFullYear() - e.getFullYear(),
  (e) => e.getFullYear()
);
Jt.every = (e) =>
  !isFinite((e = Math.floor(e))) || !(e > 0)
    ? null
    : Ie(
        (t) => {
          (t.setFullYear(Math.floor(t.getFullYear() / e) * e),
            t.setMonth(0, 1),
            t.setHours(0, 0, 0, 0));
        },
        (t, r) => {
          t.setFullYear(t.getFullYear() + r * e);
        }
      );
Jt.range;
const er = Ie(
  (e) => {
    (e.setUTCMonth(0, 1), e.setUTCHours(0, 0, 0, 0));
  },
  (e, t) => {
    e.setUTCFullYear(e.getUTCFullYear() + t);
  },
  (e, t) => t.getUTCFullYear() - e.getUTCFullYear(),
  (e) => e.getUTCFullYear()
);
er.every = (e) =>
  !isFinite((e = Math.floor(e))) || !(e > 0)
    ? null
    : Ie(
        (t) => {
          (t.setUTCFullYear(Math.floor(t.getUTCFullYear() / e) * e),
            t.setUTCMonth(0, 1),
            t.setUTCHours(0, 0, 0, 0));
        },
        (t, r) => {
          t.setUTCFullYear(t.getUTCFullYear() + r * e);
        }
      );
er.range;
function ag(e, t, r, n, i, a) {
  const o = [
    [Cr, 1, Yt],
    [Cr, 5, 5 * Yt],
    [Cr, 15, 15 * Yt],
    [Cr, 30, 30 * Yt],
    [a, 1, lt],
    [a, 5, 5 * lt],
    [a, 15, 15 * lt],
    [a, 30, 30 * lt],
    [i, 1, Gt],
    [i, 3, 3 * Gt],
    [i, 6, 6 * Gt],
    [i, 12, 12 * Gt],
    [n, 1, Qt],
    [n, 2, 2 * Qt],
    [r, 1, _c],
    [t, 1, cv],
    [t, 3, 3 * cv],
    [e, 1, Ol]
  ];
  function l(c, s, f) {
    const d = s < c;
    d && ([c, s] = [s, c]);
    const h = f && typeof f.range == 'function' ? f : u(c, s, f),
      p = h ? h.range(c, +s + 1) : [];
    return d ? p.reverse() : p;
  }
  function u(c, s, f) {
    const d = Math.abs(s - c) / f,
      h = gc(([, , y]) => y).right(o, d);
    if (h === o.length) return e.every(fu(c / Ol, s / Ol, f));
    if (h === 0) return _a.every(Math.max(fu(c, s, f), 1));
    const [p, m] = o[d / o[h - 1][2] < o[h][2] / d ? h - 1 : h];
    return p.every(m);
  }
  return [l, u];
}
const [mk, yk] = ag(er, Lc, Eo, ig, $c, Mc),
  [gk, bk] = ag(Jt, Nc, So, Pi, Dc, Tc);
function Sl(e) {
  if (0 <= e.y && e.y < 100) {
    var t = new Date(-1, e.m, e.d, e.H, e.M, e.S, e.L);
    return (t.setFullYear(e.y), t);
  }
  return new Date(e.y, e.m, e.d, e.H, e.M, e.S, e.L);
}
function El(e) {
  if (0 <= e.y && e.y < 100) {
    var t = new Date(Date.UTC(-1, e.m, e.d, e.H, e.M, e.S, e.L));
    return (t.setUTCFullYear(e.y), t);
  }
  return new Date(Date.UTC(e.y, e.m, e.d, e.H, e.M, e.S, e.L));
}
function Mn(e, t, r) {
  return { y: e, m: t, d: r, H: 0, M: 0, S: 0, L: 0 };
}
function xk(e) {
  var t = e.dateTime,
    r = e.date,
    n = e.time,
    i = e.periods,
    a = e.days,
    o = e.shortDays,
    l = e.months,
    u = e.shortMonths,
    c = Dn(i),
    s = $n(i),
    f = Dn(a),
    d = $n(a),
    h = Dn(o),
    p = $n(o),
    m = Dn(l),
    y = $n(l),
    g = Dn(u),
    x = $n(u),
    A = {
      a: W,
      A: B,
      b: Y,
      B: K,
      c: null,
      d: pv,
      e: pv,
      f: Kk,
      g: Jk,
      G: tC,
      H: zk,
      I: Wk,
      j: Fk,
      L: og,
      m: Uk,
      M: Hk,
      p: pe,
      q: be,
      Q: gv,
      s: bv,
      S: Vk,
      u: Yk,
      U: Gk,
      V: qk,
      w: Xk,
      W: Zk,
      x: null,
      X: null,
      y: Qk,
      Y: eC,
      Z: rC,
      '%': yv
    },
    w = {
      a: de,
      A: Ke,
      b: Xe,
      B: ht,
      c: null,
      d: mv,
      e: mv,
      f: oC,
      g: mC,
      G: gC,
      H: nC,
      I: iC,
      j: aC,
      L: ug,
      m: lC,
      M: uC,
      p: pt,
      q: In,
      Q: gv,
      s: bv,
      S: cC,
      u: sC,
      U: fC,
      V: dC,
      w: vC,
      W: hC,
      x: null,
      X: null,
      y: pC,
      Y: yC,
      Z: bC,
      '%': yv
    },
    P = {
      a: k,
      A: j,
      b: I,
      B: R,
      c: D,
      d: vv,
      e: vv,
      f: Nk,
      g: dv,
      G: fv,
      H: hv,
      I: hv,
      j: Tk,
      L: $k,
      m: _k,
      M: Mk,
      p: C,
      q: jk,
      Q: Rk,
      s: Bk,
      S: Dk,
      u: Sk,
      U: Ek,
      V: Ik,
      w: Ok,
      W: kk,
      x: $,
      X: z,
      y: dv,
      Y: fv,
      Z: Ck,
      '%': Lk
    };
  ((A.x = b(r, A)),
    (A.X = b(n, A)),
    (A.c = b(t, A)),
    (w.x = b(r, w)),
    (w.X = b(n, w)),
    (w.c = b(t, w)));
  function b(N, V) {
    return function (U) {
      var _ = [],
        Ne = -1,
        te = 0,
        F = N.length,
        Ze,
        gr,
        Us;
      for (U instanceof Date || (U = new Date(+U)); ++Ne < F;)
        N.charCodeAt(Ne) === 37 &&
          (_.push(N.slice(te, Ne)),
          (gr = sv[(Ze = N.charAt(++Ne))]) != null
            ? (Ze = N.charAt(++Ne))
            : (gr = Ze === 'e' ? ' ' : '0'),
          (Us = V[Ze]) && (Ze = Us(U, gr)),
          _.push(Ze),
          (te = Ne + 1));
      return (_.push(N.slice(te, Ne)), _.join(''));
    };
  }
  function S(N, V) {
    return function (U) {
      var _ = Mn(1900, void 0, 1),
        Ne = E(_, N, (U += ''), 0),
        te,
        F;
      if (Ne != U.length) return null;
      if ('Q' in _) return new Date(_.Q);
      if ('s' in _) return new Date(_.s * 1e3 + ('L' in _ ? _.L : 0));
      if (
        (V && !('Z' in _) && (_.Z = 0),
        'p' in _ && (_.H = (_.H % 12) + _.p * 12),
        _.m === void 0 && (_.m = 'q' in _ ? _.q : 0),
        'V' in _)
      ) {
        if (_.V < 1 || _.V > 53) return null;
        ('w' in _ || (_.w = 1),
          'Z' in _
            ? ((te = El(Mn(_.y, 0, 1))),
              (F = te.getUTCDay()),
              (te = F > 4 || F === 0 ? Ma.ceil(te) : Ma(te)),
              (te = Oo.offset(te, (_.V - 1) * 7)),
              (_.y = te.getUTCFullYear()),
              (_.m = te.getUTCMonth()),
              (_.d = te.getUTCDate() + ((_.w + 6) % 7)))
            : ((te = Sl(Mn(_.y, 0, 1))),
              (F = te.getDay()),
              (te = F > 4 || F === 0 ? Ta.ceil(te) : Ta(te)),
              (te = Pi.offset(te, (_.V - 1) * 7)),
              (_.y = te.getFullYear()),
              (_.m = te.getMonth()),
              (_.d = te.getDate() + ((_.w + 6) % 7))));
      } else
        ('W' in _ || 'U' in _) &&
          ('w' in _ || (_.w = 'u' in _ ? _.u % 7 : 'W' in _ ? 1 : 0),
          (F = 'Z' in _ ? El(Mn(_.y, 0, 1)).getUTCDay() : Sl(Mn(_.y, 0, 1)).getDay()),
          (_.m = 0),
          (_.d =
            'W' in _ ? ((_.w + 6) % 7) + _.W * 7 - ((F + 5) % 7) : _.w + _.U * 7 - ((F + 6) % 7)));
      return 'Z' in _ ? ((_.H += (_.Z / 100) | 0), (_.M += _.Z % 100), El(_)) : Sl(_);
    };
  }
  function E(N, V, U, _) {
    for (var Ne = 0, te = V.length, F = U.length, Ze, gr; Ne < te;) {
      if (_ >= F) return -1;
      if (((Ze = V.charCodeAt(Ne++)), Ze === 37)) {
        if (
          ((Ze = V.charAt(Ne++)),
          (gr = P[Ze in sv ? V.charAt(Ne++) : Ze]),
          !gr || (_ = gr(N, U, _)) < 0)
        )
          return -1;
      } else if (Ze != U.charCodeAt(_++)) return -1;
    }
    return _;
  }
  function C(N, V, U) {
    var _ = c.exec(V.slice(U));
    return _ ? ((N.p = s.get(_[0].toLowerCase())), U + _[0].length) : -1;
  }
  function k(N, V, U) {
    var _ = h.exec(V.slice(U));
    return _ ? ((N.w = p.get(_[0].toLowerCase())), U + _[0].length) : -1;
  }
  function j(N, V, U) {
    var _ = f.exec(V.slice(U));
    return _ ? ((N.w = d.get(_[0].toLowerCase())), U + _[0].length) : -1;
  }
  function I(N, V, U) {
    var _ = g.exec(V.slice(U));
    return _ ? ((N.m = x.get(_[0].toLowerCase())), U + _[0].length) : -1;
  }
  function R(N, V, U) {
    var _ = m.exec(V.slice(U));
    return _ ? ((N.m = y.get(_[0].toLowerCase())), U + _[0].length) : -1;
  }
  function D(N, V, U) {
    return E(N, t, V, U);
  }
  function $(N, V, U) {
    return E(N, r, V, U);
  }
  function z(N, V, U) {
    return E(N, n, V, U);
  }
  function W(N) {
    return o[N.getDay()];
  }
  function B(N) {
    return a[N.getDay()];
  }
  function Y(N) {
    return u[N.getMonth()];
  }
  function K(N) {
    return l[N.getMonth()];
  }
  function pe(N) {
    return i[+(N.getHours() >= 12)];
  }
  function be(N) {
    return 1 + ~~(N.getMonth() / 3);
  }
  function de(N) {
    return o[N.getUTCDay()];
  }
  function Ke(N) {
    return a[N.getUTCDay()];
  }
  function Xe(N) {
    return u[N.getUTCMonth()];
  }
  function ht(N) {
    return l[N.getUTCMonth()];
  }
  function pt(N) {
    return i[+(N.getUTCHours() >= 12)];
  }
  function In(N) {
    return 1 + ~~(N.getUTCMonth() / 3);
  }
  return {
    format: function (N) {
      var V = b((N += ''), A);
      return (
        (V.toString = function () {
          return N;
        }),
        V
      );
    },
    parse: function (N) {
      var V = S((N += ''), !1);
      return (
        (V.toString = function () {
          return N;
        }),
        V
      );
    },
    utcFormat: function (N) {
      var V = b((N += ''), w);
      return (
        (V.toString = function () {
          return N;
        }),
        V
      );
    },
    utcParse: function (N) {
      var V = S((N += ''), !0);
      return (
        (V.toString = function () {
          return N;
        }),
        V
      );
    }
  };
}
var sv = { '-': '', _: ' ', 0: '0' },
  Te = /^\s*\d+/,
  wk = /^%/,
  Ak = /[\\^$*+?|[\]().{}]/g;
function J(e, t, r) {
  var n = e < 0 ? '-' : '',
    i = (n ? -e : e) + '',
    a = i.length;
  return n + (a < r ? new Array(r - a + 1).join(t) + i : i);
}
function Pk(e) {
  return e.replace(Ak, '\\$&');
}
function Dn(e) {
  return new RegExp('^(?:' + e.map(Pk).join('|') + ')', 'i');
}
function $n(e) {
  return new Map(e.map((t, r) => [t.toLowerCase(), r]));
}
function Ok(e, t, r) {
  var n = Te.exec(t.slice(r, r + 1));
  return n ? ((e.w = +n[0]), r + n[0].length) : -1;
}
function Sk(e, t, r) {
  var n = Te.exec(t.slice(r, r + 1));
  return n ? ((e.u = +n[0]), r + n[0].length) : -1;
}
function Ek(e, t, r) {
  var n = Te.exec(t.slice(r, r + 2));
  return n ? ((e.U = +n[0]), r + n[0].length) : -1;
}
function Ik(e, t, r) {
  var n = Te.exec(t.slice(r, r + 2));
  return n ? ((e.V = +n[0]), r + n[0].length) : -1;
}
function kk(e, t, r) {
  var n = Te.exec(t.slice(r, r + 2));
  return n ? ((e.W = +n[0]), r + n[0].length) : -1;
}
function fv(e, t, r) {
  var n = Te.exec(t.slice(r, r + 4));
  return n ? ((e.y = +n[0]), r + n[0].length) : -1;
}
function dv(e, t, r) {
  var n = Te.exec(t.slice(r, r + 2));
  return n ? ((e.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3)), r + n[0].length) : -1;
}
function Ck(e, t, r) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(r, r + 6));
  return n ? ((e.Z = n[1] ? 0 : -(n[2] + (n[3] || '00'))), r + n[0].length) : -1;
}
function jk(e, t, r) {
  var n = Te.exec(t.slice(r, r + 1));
  return n ? ((e.q = n[0] * 3 - 3), r + n[0].length) : -1;
}
function _k(e, t, r) {
  var n = Te.exec(t.slice(r, r + 2));
  return n ? ((e.m = n[0] - 1), r + n[0].length) : -1;
}
function vv(e, t, r) {
  var n = Te.exec(t.slice(r, r + 2));
  return n ? ((e.d = +n[0]), r + n[0].length) : -1;
}
function Tk(e, t, r) {
  var n = Te.exec(t.slice(r, r + 3));
  return n ? ((e.m = 0), (e.d = +n[0]), r + n[0].length) : -1;
}
function hv(e, t, r) {
  var n = Te.exec(t.slice(r, r + 2));
  return n ? ((e.H = +n[0]), r + n[0].length) : -1;
}
function Mk(e, t, r) {
  var n = Te.exec(t.slice(r, r + 2));
  return n ? ((e.M = +n[0]), r + n[0].length) : -1;
}
function Dk(e, t, r) {
  var n = Te.exec(t.slice(r, r + 2));
  return n ? ((e.S = +n[0]), r + n[0].length) : -1;
}
function $k(e, t, r) {
  var n = Te.exec(t.slice(r, r + 3));
  return n ? ((e.L = +n[0]), r + n[0].length) : -1;
}
function Nk(e, t, r) {
  var n = Te.exec(t.slice(r, r + 6));
  return n ? ((e.L = Math.floor(n[0] / 1e3)), r + n[0].length) : -1;
}
function Lk(e, t, r) {
  var n = wk.exec(t.slice(r, r + 1));
  return n ? r + n[0].length : -1;
}
function Rk(e, t, r) {
  var n = Te.exec(t.slice(r));
  return n ? ((e.Q = +n[0]), r + n[0].length) : -1;
}
function Bk(e, t, r) {
  var n = Te.exec(t.slice(r));
  return n ? ((e.s = +n[0]), r + n[0].length) : -1;
}
function pv(e, t) {
  return J(e.getDate(), t, 2);
}
function zk(e, t) {
  return J(e.getHours(), t, 2);
}
function Wk(e, t) {
  return J(e.getHours() % 12 || 12, t, 2);
}
function Fk(e, t) {
  return J(1 + Pi.count(Jt(e), e), t, 3);
}
function og(e, t) {
  return J(e.getMilliseconds(), t, 3);
}
function Kk(e, t) {
  return og(e, t) + '000';
}
function Uk(e, t) {
  return J(e.getMonth() + 1, t, 2);
}
function Hk(e, t) {
  return J(e.getMinutes(), t, 2);
}
function Vk(e, t) {
  return J(e.getSeconds(), t, 2);
}
function Yk(e) {
  var t = e.getDay();
  return t === 0 ? 7 : t;
}
function Gk(e, t) {
  return J(So.count(Jt(e) - 1, e), t, 2);
}
function lg(e) {
  var t = e.getDay();
  return t >= 4 || t === 0 ? fn(e) : fn.ceil(e);
}
function qk(e, t) {
  return ((e = lg(e)), J(fn.count(Jt(e), e) + (Jt(e).getDay() === 4), t, 2));
}
function Xk(e) {
  return e.getDay();
}
function Zk(e, t) {
  return J(Ta.count(Jt(e) - 1, e), t, 2);
}
function Qk(e, t) {
  return J(e.getFullYear() % 100, t, 2);
}
function Jk(e, t) {
  return ((e = lg(e)), J(e.getFullYear() % 100, t, 2));
}
function eC(e, t) {
  return J(e.getFullYear() % 1e4, t, 4);
}
function tC(e, t) {
  var r = e.getDay();
  return ((e = r >= 4 || r === 0 ? fn(e) : fn.ceil(e)), J(e.getFullYear() % 1e4, t, 4));
}
function rC(e) {
  var t = e.getTimezoneOffset();
  return (t > 0 ? '-' : ((t *= -1), '+')) + J((t / 60) | 0, '0', 2) + J(t % 60, '0', 2);
}
function mv(e, t) {
  return J(e.getUTCDate(), t, 2);
}
function nC(e, t) {
  return J(e.getUTCHours(), t, 2);
}
function iC(e, t) {
  return J(e.getUTCHours() % 12 || 12, t, 2);
}
function aC(e, t) {
  return J(1 + Oo.count(er(e), e), t, 3);
}
function ug(e, t) {
  return J(e.getUTCMilliseconds(), t, 3);
}
function oC(e, t) {
  return ug(e, t) + '000';
}
function lC(e, t) {
  return J(e.getUTCMonth() + 1, t, 2);
}
function uC(e, t) {
  return J(e.getUTCMinutes(), t, 2);
}
function cC(e, t) {
  return J(e.getUTCSeconds(), t, 2);
}
function sC(e) {
  var t = e.getUTCDay();
  return t === 0 ? 7 : t;
}
function fC(e, t) {
  return J(Eo.count(er(e) - 1, e), t, 2);
}
function cg(e) {
  var t = e.getUTCDay();
  return t >= 4 || t === 0 ? dn(e) : dn.ceil(e);
}
function dC(e, t) {
  return ((e = cg(e)), J(dn.count(er(e), e) + (er(e).getUTCDay() === 4), t, 2));
}
function vC(e) {
  return e.getUTCDay();
}
function hC(e, t) {
  return J(Ma.count(er(e) - 1, e), t, 2);
}
function pC(e, t) {
  return J(e.getUTCFullYear() % 100, t, 2);
}
function mC(e, t) {
  return ((e = cg(e)), J(e.getUTCFullYear() % 100, t, 2));
}
function yC(e, t) {
  return J(e.getUTCFullYear() % 1e4, t, 4);
}
function gC(e, t) {
  var r = e.getUTCDay();
  return ((e = r >= 4 || r === 0 ? dn(e) : dn.ceil(e)), J(e.getUTCFullYear() % 1e4, t, 4));
}
function bC() {
  return '+0000';
}
function yv() {
  return '%';
}
function gv(e) {
  return +e;
}
function bv(e) {
  return Math.floor(+e / 1e3);
}
var Gr, sg, fg;
xC({
  dateTime: '%x, %X',
  date: '%-m/%-d/%Y',
  time: '%-I:%M:%S %p',
  periods: ['AM', 'PM'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
});
function xC(e) {
  return ((Gr = xk(e)), (sg = Gr.format), Gr.parse, (fg = Gr.utcFormat), Gr.utcParse, Gr);
}
function wC(e) {
  return new Date(e);
}
function AC(e) {
  return e instanceof Date ? +e : +new Date(+e);
}
function Rc(e, t, r, n, i, a, o, l, u, c) {
  var s = Oc(),
    f = s.invert,
    d = s.domain,
    h = c('.%L'),
    p = c(':%S'),
    m = c('%I:%M'),
    y = c('%I %p'),
    g = c('%a %d'),
    x = c('%b %d'),
    A = c('%B'),
    w = c('%Y');
  function P(b) {
    return (
      u(b) < b
        ? h
        : l(b) < b
          ? p
          : o(b) < b
            ? m
            : a(b) < b
              ? y
              : n(b) < b
                ? i(b) < b
                  ? g
                  : x
                : r(b) < b
                  ? A
                  : w
    )(b);
  }
  return (
    (s.invert = function (b) {
      return new Date(f(b));
    }),
    (s.domain = function (b) {
      return arguments.length ? d(Array.from(b, AC)) : d().map(wC);
    }),
    (s.ticks = function (b) {
      var S = d();
      return e(S[0], S[S.length - 1], b ?? 10);
    }),
    (s.tickFormat = function (b, S) {
      return S == null ? P : c(S);
    }),
    (s.nice = function (b) {
      var S = d();
      return (
        (!b || typeof b.range != 'function') && (b = t(S[0], S[S.length - 1], b ?? 10)),
        b ? d(Zy(S, b)) : s
      );
    }),
    (s.copy = function () {
      return Ai(s, Rc(e, t, r, n, i, a, o, l, u, c));
    }),
    s
  );
}
function PC() {
  return ft.apply(
    Rc(gk, bk, Jt, Nc, So, Pi, Dc, Tc, Cr, sg).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]),
    arguments
  );
}
function OC() {
  return ft.apply(
    Rc(mk, yk, er, Lc, Eo, Oo, $c, Mc, Cr, fg).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]),
    arguments
  );
}
function Io() {
  var e = 0,
    t = 1,
    r,
    n,
    i,
    a,
    o = He,
    l = !1,
    u;
  function c(f) {
    return f == null || isNaN((f = +f))
      ? u
      : o(i === 0 ? 0.5 : ((f = (a(f) - r) * i), l ? Math.max(0, Math.min(1, f)) : f));
  }
  ((c.domain = function (f) {
    return arguments.length
      ? (([e, t] = f), (r = a((e = +e))), (n = a((t = +t))), (i = r === n ? 0 : 1 / (n - r)), c)
      : [e, t];
  }),
    (c.clamp = function (f) {
      return arguments.length ? ((l = !!f), c) : l;
    }),
    (c.interpolator = function (f) {
      return arguments.length ? ((o = f), c) : o;
    }));
  function s(f) {
    return function (d) {
      var h, p;
      return arguments.length ? (([h, p] = d), (o = f(h, p)), c) : [o(0), o(1)];
    };
  }
  return (
    (c.range = s(xn)),
    (c.rangeRound = s(Pc)),
    (c.unknown = function (f) {
      return arguments.length ? ((u = f), c) : u;
    }),
    function (f) {
      return ((a = f), (r = f(e)), (n = f(t)), (i = r === n ? 0 : 1 / (n - r)), c);
    }
  );
}
function mr(e, t) {
  return t.domain(e.domain()).interpolator(e.interpolator()).clamp(e.clamp()).unknown(e.unknown());
}
function dg() {
  var e = pr(Io()(He));
  return (
    (e.copy = function () {
      return mr(e, dg());
    }),
    tr.apply(e, arguments)
  );
}
function vg() {
  var e = Ic(Io()).domain([1, 10]);
  return (
    (e.copy = function () {
      return mr(e, vg()).base(e.base());
    }),
    tr.apply(e, arguments)
  );
}
function hg() {
  var e = kc(Io());
  return (
    (e.copy = function () {
      return mr(e, hg()).constant(e.constant());
    }),
    tr.apply(e, arguments)
  );
}
function Bc() {
  var e = Cc(Io());
  return (
    (e.copy = function () {
      return mr(e, Bc()).exponent(e.exponent());
    }),
    tr.apply(e, arguments)
  );
}
function SC() {
  return Bc.apply(null, arguments).exponent(0.5);
}
function pg() {
  var e = [],
    t = He;
  function r(n) {
    if (n != null && !isNaN((n = +n))) return t((xi(e, n, 1) - 1) / (e.length - 1));
  }
  return (
    (r.domain = function (n) {
      if (!arguments.length) return e.slice();
      e = [];
      for (let i of n) i != null && !isNaN((i = +i)) && e.push(i);
      return (e.sort(lr), r);
    }),
    (r.interpolator = function (n) {
      return arguments.length ? ((t = n), r) : t;
    }),
    (r.range = function () {
      return e.map((n, i) => t(i / (e.length - 1)));
    }),
    (r.quantiles = function (n) {
      return Array.from({ length: n + 1 }, (i, a) => sI(e, a / n));
    }),
    (r.copy = function () {
      return pg(t).domain(e);
    }),
    tr.apply(r, arguments)
  );
}
function ko() {
  var e = 0,
    t = 0.5,
    r = 1,
    n = 1,
    i,
    a,
    o,
    l,
    u,
    c = He,
    s,
    f = !1,
    d;
  function h(m) {
    return isNaN((m = +m))
      ? d
      : ((m = 0.5 + ((m = +s(m)) - a) * (n * m < n * a ? l : u)),
        c(f ? Math.max(0, Math.min(1, m)) : m));
  }
  ((h.domain = function (m) {
    return arguments.length
      ? (([e, t, r] = m),
        (i = s((e = +e))),
        (a = s((t = +t))),
        (o = s((r = +r))),
        (l = i === a ? 0 : 0.5 / (a - i)),
        (u = a === o ? 0 : 0.5 / (o - a)),
        (n = a < i ? -1 : 1),
        h)
      : [e, t, r];
  }),
    (h.clamp = function (m) {
      return arguments.length ? ((f = !!m), h) : f;
    }),
    (h.interpolator = function (m) {
      return arguments.length ? ((c = m), h) : c;
    }));
  function p(m) {
    return function (y) {
      var g, x, A;
      return arguments.length ? (([g, x, A] = y), (c = LI(m, [g, x, A])), h) : [c(0), c(0.5), c(1)];
    };
  }
  return (
    (h.range = p(xn)),
    (h.rangeRound = p(Pc)),
    (h.unknown = function (m) {
      return arguments.length ? ((d = m), h) : d;
    }),
    function (m) {
      return (
        (s = m),
        (i = m(e)),
        (a = m(t)),
        (o = m(r)),
        (l = i === a ? 0 : 0.5 / (a - i)),
        (u = a === o ? 0 : 0.5 / (o - a)),
        (n = a < i ? -1 : 1),
        h
      );
    }
  );
}
function mg() {
  var e = pr(ko()(He));
  return (
    (e.copy = function () {
      return mr(e, mg());
    }),
    tr.apply(e, arguments)
  );
}
function yg() {
  var e = Ic(ko()).domain([0.1, 1, 10]);
  return (
    (e.copy = function () {
      return mr(e, yg()).base(e.base());
    }),
    tr.apply(e, arguments)
  );
}
function gg() {
  var e = kc(ko());
  return (
    (e.copy = function () {
      return mr(e, gg()).constant(e.constant());
    }),
    tr.apply(e, arguments)
  );
}
function zc() {
  var e = Cc(ko());
  return (
    (e.copy = function () {
      return mr(e, zc()).exponent(e.exponent());
    }),
    tr.apply(e, arguments)
  );
}
function EC() {
  return zc.apply(null, arguments).exponent(0.5);
}
const bg = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      scaleBand: xc,
      scaleDiverging: mg,
      scaleDivergingLog: yg,
      scaleDivergingPow: zc,
      scaleDivergingSqrt: EC,
      scaleDivergingSymlog: gg,
      scaleIdentity: Xy,
      scaleImplicit: du,
      scaleLinear: qy,
      scaleLog: Qy,
      scaleOrdinal: bc,
      scalePoint: vI,
      scalePow: jc,
      scaleQuantile: tg,
      scaleQuantize: rg,
      scaleRadial: eg,
      scaleSequential: dg,
      scaleSequentialLog: vg,
      scaleSequentialPow: Bc,
      scaleSequentialQuantile: pg,
      scaleSequentialSqrt: SC,
      scaleSequentialSymlog: hg,
      scaleSqrt: ok,
      scaleSymlog: Jy,
      scaleThreshold: ng,
      scaleTime: PC,
      scaleUtc: OC,
      tickFormat: Gy
    },
    Symbol.toStringTag,
    { value: 'Module' }
  )
);
function IC(e) {
  var t = bg;
  if (e in t && typeof t[e] == 'function') return t[e]();
  var r = 'scale'.concat(ai(e));
  if (r in t && typeof t[r] == 'function') return t[r]();
}
function xv(e, t, r) {
  if (typeof e == 'function') return e.copy().domain(t).range(r);
  if (e != null) {
    var n = IC(e);
    if (n != null) return (n.domain(t).range(r), n);
  }
}
function Wc(e, t, r, n) {
  if (!(r == null || n == null))
    return typeof e.scale == 'function' ? xv(e.scale, r, n) : xv(t, r, n);
}
function kC(e) {
  return 'scale'.concat(ai(e));
}
function CC(e) {
  return kC(e) in bg;
}
var xg = (e, t, r) => {
  if (e != null) {
    var n = e.scale,
      i = e.type;
    if (n === 'auto')
      return i === 'category' &&
        r &&
        (r.indexOf('LineChart') >= 0 ||
          r.indexOf('AreaChart') >= 0 ||
          (r.indexOf('ComposedChart') >= 0 && !t))
        ? 'point'
        : i === 'category'
          ? 'band'
          : 'linear';
    if (typeof n == 'string') return CC(n) ? n : 'point';
  }
};
function jC(e, t) {
  for (var r = 0, n = e.length, i = e[0] < e[e.length - 1]; r < n;) {
    var a = Math.floor((r + n) / 2);
    (i ? e[a] < t : e[a] > t) ? (r = a + 1) : (n = a);
  }
  return r;
}
function wg(e, t) {
  if (e) {
    var r = t ?? e.domain(),
      n = r.map((a) => {
        var o;
        return (o = e(a)) !== null && o !== void 0 ? o : 0;
      }),
      i = e.range();
    if (!(r.length === 0 || i.length < 2))
      return (a) => {
        var o,
          l,
          u = jC(n, a);
        if (u <= 0) return r[0];
        if (u >= r.length) return r[r.length - 1];
        var c = (o = n[u - 1]) !== null && o !== void 0 ? o : 0,
          s = (l = n[u]) !== null && l !== void 0 ? l : 0;
        return Math.abs(a - c) <= Math.abs(a - s) ? r[u - 1] : r[u];
      };
  }
}
function _C(e) {
  if (e != null)
    return 'invert' in e && typeof e.invert == 'function' ? e.invert.bind(e) : wg(e, void 0);
}
function wv(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Da(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? wv(Object(r), !0).forEach(function (n) {
          TC(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : wv(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function TC(e, t, r) {
  return (
    (t = MC(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function MC(e) {
  var t = DC(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function DC(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Ag(e, t) {
  return RC(e) || LC(e, t) || NC(e, t) || $C();
}
function $C() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function NC(e, t) {
  if (e) {
    if (typeof e == 'string') return Av(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Av(e, t)
          : void 0
    );
  }
}
function Av(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function LC(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function RC(e) {
  if (Array.isArray(e)) return e;
}
var mu = [0, 'auto'],
  Ae = {
    allowDataOverflow: !1,
    allowDecimals: !0,
    allowDuplicatedCategory: !0,
    angle: 0,
    dataKey: void 0,
    domain: void 0,
    height: 30,
    hide: !0,
    id: 0,
    includeHidden: !1,
    interval: 'preserveEnd',
    minTickGap: 5,
    mirror: !1,
    name: void 0,
    orientation: 'bottom',
    padding: { left: 0, right: 0 },
    reversed: !1,
    scale: 'auto',
    tick: !0,
    tickCount: 5,
    tickFormatter: void 0,
    ticks: void 0,
    type: 'category',
    unit: void 0,
    niceTicks: 'auto'
  },
  Pg = (e, t) => e.cartesianAxis.xAxis[t],
  zt = (e, t) => {
    var r = Pg(e, t);
    return r ?? Ae;
  },
  Pe = {
    allowDataOverflow: !1,
    allowDecimals: !0,
    allowDuplicatedCategory: !0,
    angle: 0,
    dataKey: void 0,
    domain: mu,
    hide: !0,
    id: 0,
    includeHidden: !1,
    interval: 'preserveEnd',
    minTickGap: 5,
    mirror: !1,
    name: void 0,
    orientation: 'left',
    padding: { top: 0, bottom: 0 },
    reversed: !1,
    scale: 'auto',
    tick: !0,
    tickCount: 5,
    tickFormatter: void 0,
    ticks: void 0,
    type: 'number',
    unit: void 0,
    niceTicks: 'auto',
    width: ci
  },
  Og = (e, t) => e.cartesianAxis.yAxis[t],
  Wt = (e, t) => {
    var r = Og(e, t);
    return r ?? Pe;
  },
  BC = {
    domain: [0, 'auto'],
    includeHidden: !1,
    reversed: !1,
    allowDataOverflow: !1,
    allowDuplicatedCategory: !1,
    dataKey: void 0,
    id: 0,
    name: '',
    range: [64, 64],
    scale: 'auto',
    type: 'number',
    unit: ''
  },
  Fc = (e, t) => {
    var r = e.cartesianAxis.zAxis[t];
    return r ?? BC;
  },
  he = (e, t, r) => {
    switch (t) {
      case 'xAxis':
        return zt(e, r);
      case 'yAxis':
        return Wt(e, r);
      case 'zAxis':
        return Fc(e, r);
      case 'angleAxis':
        return hc(e, r);
      case 'radiusAxis':
        return pc(e, r);
      default:
        throw new Error('Unexpected axis type: '.concat(t));
    }
  },
  zC = (e, t, r) => {
    switch (t) {
      case 'xAxis':
        return zt(e, r);
      case 'yAxis':
        return Wt(e, r);
      default:
        throw new Error('Unexpected axis type: '.concat(t));
    }
  },
  wn = (e, t, r) => {
    switch (t) {
      case 'xAxis':
        return zt(e, r);
      case 'yAxis':
        return Wt(e, r);
      case 'angleAxis':
        return hc(e, r);
      case 'radiusAxis':
        return pc(e, r);
      default:
        throw new Error('Unexpected axis type: '.concat(t));
    }
  },
  Sg = (e) =>
    e.graphicalItems.cartesianItems.some((t) => t.type === 'bar') ||
    e.graphicalItems.polarItems.some((t) => t.type === 'radialBar');
function Kc(e, t) {
  return (r) => {
    switch (e) {
      case 'xAxis':
        return 'xAxisId' in r && r.xAxisId === t;
      case 'yAxis':
        return 'yAxisId' in r && r.yAxisId === t;
      case 'zAxis':
        return 'zAxisId' in r && r.zAxisId === t;
      case 'angleAxis':
        return 'angleAxisId' in r && r.angleAxisId === t;
      case 'radiusAxis':
        return 'radiusAxisId' in r && r.radiusAxisId === t;
      default:
        return !1;
    }
  };
}
var Oi = (e) => e.graphicalItems.cartesianItems,
  WC = O([ve, gi], Kc),
  Uc = (e, t, r) =>
    e.filter(r).filter((n) => ((t == null ? void 0 : t.includeHidden) === !0 ? !0 : !n.hide)),
  An = O([Oi, he, WC], Uc, { memoizeOptions: { resultEqualityCheck: Ao } }),
  Eg = O([An], (e) => e.filter((t) => t.type === 'area' || t.type === 'bar').filter(wo)),
  Ig = (e) => e.filter((t) => !('stackId' in t) || t.stackId === void 0),
  FC = O([An], Ig),
  Hc = (e) =>
    e
      .map((t) => t.data)
      .filter(Boolean)
      .flat(1),
  KC = O([An], (e) => e.some((t) => !t.data)),
  kg = O([An], Hc, { memoizeOptions: { resultEqualityCheck: Ao } }),
  Vc = (e, t) => {
    var r = t.chartData,
      n = r === void 0 ? [] : r,
      i = t.dataStartIndex,
      a = t.dataEndIndex;
    return e.length > 0 ? e : n.slice(i, a + 1);
  },
  Yc = O([kg, mi], Vc),
  Cg = (e, t, r) =>
    (t == null ? void 0 : t.dataKey) != null
      ? e.map((n) => ({ value: X(n, t.dataKey) }))
      : r.length > 0
        ? r.map((n) => n.dataKey).flatMap((n) => e.map((i) => ({ value: X(i, n) })))
        : e.map((n) => ({ value: n })),
  jg = (e, t, r, n, i, a) => {
    var o = n.chartData,
      l = o === void 0 ? [] : o,
      u = n.dataStartIndex,
      c = n.dataEndIndex,
      s = Cg(e, t, r);
    if (i && (t == null ? void 0 : t.dataKey) != null && a.length > 0) {
      var f = l.slice(u, c + 1),
        d = f.map((h) => ({ value: X(h, t.dataKey) })).filter((h) => h.value != null);
      return [...d, ...s];
    }
    return s;
  },
  Si = O([Yc, he, An, mi, KC, kg], jg);
function on(e) {
  if (ut(e) || e instanceof Date) {
    var t = Number(e);
    if (H(t)) return t;
  }
}
function Pv(e) {
  if (Array.isArray(e)) {
    var t = [on(e[0]), on(e[1])];
    return _t(t) ? t : void 0;
  }
  var r = on(e);
  if (r != null) return [r, r];
}
function xt(e) {
  return e.map(on).filter(Ue);
}
function UC(e, t) {
  var r = on(e),
    n = on(t);
  return r == null && n == null ? 0 : r == null ? -1 : n == null ? 1 : r - n;
}
var HC = O([Si], (e) => (e == null ? void 0 : e.map((t) => t.value).sort(UC)));
function _g(e, t) {
  switch (e) {
    case 'xAxis':
      return t.direction === 'x';
    case 'yAxis':
      return t.direction === 'y';
    default:
      return !1;
  }
}
function VC(e, t, r) {
  if (!r) return [];
  if (!r.length) return [];
  var n;
  if (typeof t == 'number' && !bt(t)) n = t;
  else if (Array.isArray(t)) {
    var i = xt(t);
    i.length > 0 && (n = Math.max(...i));
  }
  return n == null
    ? []
    : xt(
        r.flatMap((a) => {
          var o = X(e, a.dataKey),
            l,
            u;
          if (Array.isArray(o)) {
            var c = Ag(o, 2);
            ((l = c[0]), (u = c[1]));
          } else l = u = o;
          if (!(!H(l) || !H(u))) return [n - l, n + u];
        })
      );
}
var ke = (e) => {
    var t = _e(e),
      r = bn(e);
    return wn(e, t, r);
  },
  vn = O([ke], (e) => (e == null ? void 0 : e.dataKey)),
  YC = O([Eg, mi, ke], Ry),
  Tg = (e, t, r, n) => {
    var i = {},
      a = t.reduce((o, l) => {
        if (l.stackId == null) return o;
        var u = o[l.stackId];
        return (u == null && (u = []), u.push(l), (o[l.stackId] = u), o);
      }, i);
    return Object.fromEntries(
      Object.entries(a).map((o) => {
        var l = Ag(o, 2),
          u = l[0],
          c = l[1],
          s = n ? [...c].reverse() : c,
          f = s.map(xo);
        return [u, { stackedData: JP(e, f, r), graphicalItems: s }];
      })
    );
  },
  $a = O([YC, Eg, yi, _y], Tg),
  Mg = (e, t, r, n) => {
    var i = t.dataStartIndex,
      a = t.dataEndIndex;
    if (n == null && r !== 'zAxis') return nO(e, i, a);
  },
  GC = O([he], (e) => e.allowDataOverflow),
  Gc = (e) => {
    var t;
    if (e == null || !('domain' in e)) return mu;
    if (e.domain != null) return e.domain;
    if ('ticks' in e && e.ticks != null) {
      if (e.type === 'number') {
        var r = xt(e.ticks);
        return [Math.min(...r), Math.max(...r)];
      }
      if (e.type === 'category') return e.ticks.map(String);
    }
    return (t = e == null ? void 0 : e.domain) !== null && t !== void 0 ? t : mu;
  },
  qc = O([he], Gc),
  Xc = O([qc, GC], gy),
  qC = O([$a, Pt, ve, Xc], Mg, { memoizeOptions: { resultEqualityCheck: bi } }),
  Co = (e) => e.errorBars,
  XC = (e, t, r) =>
    e
      .flatMap((n) => t[n.id])
      .filter(Boolean)
      .filter((n) => _g(r, n)),
  Na = function () {
    for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++) r[n] = arguments[n];
    var i = r.filter(Boolean);
    if (i.length !== 0) {
      var a = i.flat(),
        o = Math.min(...a),
        l = Math.max(...a);
      return [o, l];
    }
  },
  Zc = function (t, r, n, i, a) {
    var o = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : [],
      l,
      u;
    if (
      (n.length > 0 &&
        n.forEach((c) => {
          var s,
            f = c.data != null ? [...c.data] : o,
            d = (s = i[c.id]) === null || s === void 0 ? void 0 : s.filter((h) => _g(a, h));
          f.forEach((h) => {
            var p,
              m = X(h, (p = r.dataKey) !== null && p !== void 0 ? p : c.dataKey),
              y = VC(h, m, d);
            if (y.length >= 2) {
              var g = Math.min(...y),
                x = Math.max(...y);
              ((l == null || g < l) && (l = g), (u == null || x > u) && (u = x));
            }
            var A = Pv(m);
            A != null &&
              ((l = l == null ? A[0] : Math.min(l, A[0])),
              (u = u == null ? A[1] : Math.max(u, A[1])));
          });
        }),
      (r == null ? void 0 : r.dataKey) != null &&
        n.length === 0 &&
        t.forEach((c) => {
          var s = Pv(X(c, r.dataKey));
          s != null &&
            ((l = l == null ? s[0] : Math.min(l, s[0])),
            (u = u == null ? s[1] : Math.max(u, s[1])));
        }),
      H(l) && H(u))
    )
      return [l, u];
  },
  ZC = O([Yc, he, FC, Co, ve, IE], Zc, { memoizeOptions: { resultEqualityCheck: bi } });
function QC(e) {
  var t = e.value;
  if (ut(t) || t instanceof Date) return t;
}
var JC = (e, t, r) => {
    var n = e.map(QC).filter((i) => i != null);
    return r && (t.dataKey == null || (t.allowDuplicatedCategory && vp(n)))
      ? my(0, e.length)
      : t.allowDuplicatedCategory
        ? n
        : Array.from(new Set(n));
  },
  Dg = (e) => e.referenceElements.dots,
  Pn = (e, t, r) =>
    e
      .filter((n) => n.ifOverflow === 'extendDomain')
      .filter((n) => (t === 'xAxis' ? n.xAxisId === r : n.yAxisId === r)),
  ej = O([Dg, ve, gi], Pn),
  $g = (e) => e.referenceElements.areas,
  tj = O([$g, ve, gi], Pn),
  Ng = (e) => e.referenceElements.lines,
  rj = O([Ng, ve, gi], Pn),
  Lg = (e, t) => {
    if (e != null) {
      var r = xt(e.map((n) => (t === 'xAxis' ? n.x : n.y)));
      if (r.length !== 0) return [Math.min(...r), Math.max(...r)];
    }
  },
  nj = O(ej, ve, Lg),
  Rg = (e, t) => {
    if (e != null) {
      var r = xt(e.flatMap((n) => [t === 'xAxis' ? n.x1 : n.y1, t === 'xAxis' ? n.x2 : n.y2]));
      if (r.length !== 0) return [Math.min(...r), Math.max(...r)];
    }
  },
  ij = O([tj, ve], Rg);
function aj(e) {
  var t;
  if (e.x != null) return xt([e.x]);
  var r = (t = e.segment) === null || t === void 0 ? void 0 : t.map((n) => n.x);
  return r == null || r.length === 0 ? [] : xt(r);
}
function oj(e) {
  var t;
  if (e.y != null) return xt([e.y]);
  var r = (t = e.segment) === null || t === void 0 ? void 0 : t.map((n) => n.y);
  return r == null || r.length === 0 ? [] : xt(r);
}
var Bg = (e, t) => {
    if (e != null) {
      var r = e.flatMap((n) => (t === 'xAxis' ? aj(n) : oj(n)));
      if (r.length !== 0) return [Math.min(...r), Math.max(...r)];
    }
  },
  lj = O([rj, ve], Bg),
  uj = O(nj, lj, ij, (e, t, r) => Na(e, r, t)),
  Qc = (e, t, r, n, i, a, o, l, u) => {
    if (r != null) return r;
    var c = (o === 'vertical' && l === 'xAxis') || (o === 'horizontal' && l === 'yAxis'),
      s = c ? Na(n, a, i) : Na(a, i),
      f = DE(t, s, e.allowDataOverflow);
    return f ?? (e.allowDataOverflow && s == null && u != null ? u : f);
  },
  cj = (e) => {
    if (!(e == null || e.type !== 'number' || !('ticks' in e) || e.ticks == null)) {
      var t = xt(e.ticks);
      if (t.length !== 0) return [Math.min(...t), Math.max(...t)];
    }
  },
  sj = O([he], cj, { memoizeOptions: { resultEqualityCheck: bi } }),
  fj = O([he, qc, Xc, qC, ZC, uj, q, ve, sj], Qc, { memoizeOptions: { resultEqualityCheck: bi } }),
  dj = [0, 1],
  Jc = (e, t, r, n, i, a, o) => {
    if (!((e == null || r == null || r.length === 0) && o === void 0)) {
      var l = e.dataKey,
        u = e.type,
        c = At(t, a);
      if (c && l == null) {
        var s;
        return my(0, (s = r == null ? void 0 : r.length) !== null && s !== void 0 ? s : 0);
      }
      return u === 'category' ? JC(n, e, c) : i === 'expand' && !c ? dj : o;
    }
  },
  es = O([he, q, Yc, Si, yi, ve, fj], Jc),
  yr = O([he, Sg, fc], xg),
  ts = (e, t, r) => {
    var n = t.niceTicks;
    if (n !== 'none') {
      var i = Gc(t),
        a = Array.isArray(i) && (i[0] === 'auto' || i[1] === 'auto');
      if ((n === 'snap125' || n === 'adaptive') && t != null && t.tickCount && _t(e)) {
        if (a) return Td(e, t.tickCount, t.allowDecimals, n);
        if (t.type === 'number') return Md(e, t.tickCount, t.allowDecimals, n);
      }
      if (n === 'auto' && r === 'linear' && t != null && t.tickCount) {
        if (a && _t(e)) return Td(e, t.tickCount, t.allowDecimals, 'adaptive');
        if (t.type === 'number' && _t(e)) return Md(e, t.tickCount, t.allowDecimals, 'adaptive');
      }
    }
  },
  rs = O([es, wn, yr], ts),
  ns = (e, t, r, n) => {
    if (
      n !== 'angleAxis' &&
      (e == null ? void 0 : e.type) === 'number' &&
      _t(t) &&
      Array.isArray(r) &&
      r.length > 0
    ) {
      var i,
        a,
        o = t[0],
        l = (i = r[0]) !== null && i !== void 0 ? i : 0,
        u = t[1],
        c = (a = r[r.length - 1]) !== null && a !== void 0 ? a : 0;
      return [Math.min(o, l), Math.max(u, c)];
    }
    return t;
  },
  vj = O([he, es, rs, ve], ns),
  hj = O(Si, he, (e, t) => {
    if (!(!t || t.type !== 'number')) {
      var r = 1 / 0,
        n = Array.from(xt(e.map((f) => f.value))).sort((f, d) => f - d),
        i = n[0],
        a = n[n.length - 1];
      if (i == null || a == null) return 1 / 0;
      var o = a - i;
      if (o === 0) return 1 / 0;
      for (var l = 0; l < n.length - 1; l++) {
        var u = n[l],
          c = n[l + 1];
        if (!(u == null || c == null)) {
          var s = c - u;
          r = Math.min(r, s);
        }
      }
      return r / o;
    }
  }),
  zg = O(
    hj,
    q,
    jy,
    Se,
    (e, t, r, n, i) => i,
    (e, t, r, n, i) => {
      if (!H(e)) return 0;
      var a = t === 'vertical' ? n.height : n.width;
      if (i === 'gap') return (e * a) / 2;
      if (i === 'no-gap') {
        var o = Be(r, e * a),
          l = (e * a) / 2;
        return l - o - ((l - o) / a) * o;
      }
      return 0;
    }
  ),
  pj = (e, t, r) => {
    var n = zt(e, t);
    return n == null || typeof n.padding != 'string' ? 0 : zg(e, 'xAxis', t, r, n.padding);
  },
  mj = (e, t, r) => {
    var n = Wt(e, t);
    return n == null || typeof n.padding != 'string' ? 0 : zg(e, 'yAxis', t, r, n.padding);
  },
  yj = O(zt, pj, (e, t) => {
    var r, n;
    if (e == null) return { left: 0, right: 0 };
    var i = e.padding;
    return typeof i == 'string'
      ? { left: t, right: t }
      : {
          left: ((r = i.left) !== null && r !== void 0 ? r : 0) + t,
          right: ((n = i.right) !== null && n !== void 0 ? n : 0) + t
        };
  }),
  gj = O(Wt, mj, (e, t) => {
    var r, n;
    if (e == null) return { top: 0, bottom: 0 };
    var i = e.padding;
    return typeof i == 'string'
      ? { top: t, bottom: t }
      : {
          top: ((r = i.top) !== null && r !== void 0 ? r : 0) + t,
          bottom: ((n = i.bottom) !== null && n !== void 0 ? n : 0) + t
        };
  }),
  Wg = O([Se, yj, mo, po, (e, t, r) => r], (e, t, r, n, i) => {
    var a = n.padding;
    return i ? [a.left, r.width - a.right] : [e.left + t.left, e.left + e.width - t.right];
  }),
  Fg = O([Se, q, gj, mo, po, (e, t, r) => r], (e, t, r, n, i, a) => {
    var o = i.padding;
    return a
      ? [n.height - o.bottom, o.top]
      : t === 'horizontal'
        ? [e.top + e.height - r.bottom, e.top + r.top]
        : [e.top + r.top, e.top + e.height - r.bottom];
  }),
  Ei = (e, t, r, n) => {
    var i;
    switch (t) {
      case 'xAxis':
        return Wg(e, r, n);
      case 'yAxis':
        return Fg(e, r, n);
      case 'zAxis':
        return (i = Fc(e, r)) === null || i === void 0 ? void 0 : i.range;
      case 'angleAxis':
        return $y(e);
      case 'radiusAxis':
        return Ny(e, r);
      default:
        return;
    }
  },
  Kg = O([he, Ei], yo),
  bj = O([yr, vj], By),
  is = O([he, yr, bj, Kg], Wc),
  Ug = (e, t, r, n) => {
    if (!(r == null || r.dataKey == null)) {
      var i = r.type,
        a = r.scale,
        o = At(e, n);
      if (o && (i === 'number' || a !== 'auto')) return t.map((l) => l.value);
    }
  },
  as = O([q, Si, wn, ve], Ug),
  hn = O([is], yc);
O([is], _C);
O([is, HC], wg);
O([An, Co, ve], XC);
function Hg(e, t) {
  return e.id < t.id ? -1 : e.id > t.id ? 1 : 0;
}
var jo = (e, t) => t,
  _o = (e, t, r) => r,
  xj = O(vo, jo, _o, (e, t, r) =>
    e
      .filter((n) => n.orientation === t)
      .filter((n) => n.mirror === r)
      .sort(Hg)
  ),
  wj = O(ho, jo, _o, (e, t, r) =>
    e
      .filter((n) => n.orientation === t)
      .filter((n) => n.mirror === r)
      .sort(Hg)
  ),
  Vg = (e, t) => {
    var r = typeof t.height == 'number' ? t.height : ec;
    return { width: e.width, height: r };
  },
  Aj = (e, t) => {
    var r = typeof t.width == 'number' ? t.width : ci;
    return { width: r, height: e.height };
  },
  Yg = O(Se, zt, Vg),
  Pj = (e, t, r) => {
    switch (t) {
      case 'top':
        return e.top;
      case 'bottom':
        return r - e.bottom;
      default:
        return 0;
    }
  },
  Oj = (e, t, r) => {
    switch (t) {
      case 'left':
        return e.left;
      case 'right':
        return r - e.right;
      default:
        return 0;
    }
  },
  Sj = O(Bt, Se, xj, jo, _o, (e, t, r, n, i) => {
    var a = {},
      o;
    return (
      r.forEach((l) => {
        var u = Vg(t, l);
        o == null && (o = Pj(t, n, e));
        var c = (n === 'top' && !i) || (n === 'bottom' && i);
        ((a[l.id] = o - Number(c) * u.height), (o += (c ? -1 : 1) * u.height));
      }),
      a
    );
  }),
  Ej = O(Rt, Se, wj, jo, _o, (e, t, r, n, i) => {
    var a = {},
      o;
    return (
      r.forEach((l) => {
        var u = Aj(t, l);
        o == null && (o = Oj(t, n, e));
        var c = (n === 'left' && !i) || (n === 'right' && i);
        ((a[l.id] = o - Number(c) * u.width), (o += (c ? -1 : 1) * u.width));
      }),
      a
    );
  }),
  Ij = (e, t) => {
    var r = zt(e, t);
    if (r != null) return Sj(e, r.orientation, r.mirror);
  },
  kj = O([Se, zt, Ij, (e, t) => t], (e, t, r, n) => {
    if (t != null) {
      var i = r == null ? void 0 : r[n];
      return i == null ? { x: e.left, y: 0 } : { x: e.left, y: i };
    }
  }),
  Cj = (e, t) => {
    var r = Wt(e, t);
    if (r != null) return Ej(e, r.orientation, r.mirror);
  },
  jj = O([Se, Wt, Cj, (e, t) => t], (e, t, r, n) => {
    if (t != null) {
      var i = r == null ? void 0 : r[n];
      return i == null ? { x: 0, y: e.top } : { x: i, y: e.top };
    }
  }),
  Gg = O(Se, Wt, (e, t) => {
    var r = typeof t.width == 'number' ? t.width : ci;
    return { width: r, height: e.height };
  }),
  Ov = (e, t, r) => {
    switch (t) {
      case 'xAxis':
        return Yg(e, r).width;
      case 'yAxis':
        return Gg(e, r).height;
      default:
        return;
    }
  },
  qg = (e, t, r, n) => {
    if (r != null) {
      var i = r.allowDuplicatedCategory,
        a = r.type,
        o = r.dataKey,
        l = At(e, n),
        u = t.map((s) => s.value),
        c = u.filter((s) => s != null);
      if (o && l && a === 'category' && i && vp(c)) return u;
    }
  },
  os = O([q, Si, he, ve], qg),
  Sv = O([q, zC, yr, hn, os, as, Ei, rs, ve], (e, t, r, n, i, a, o, l, u) => {
    if (t != null) {
      var c = At(e, u);
      return {
        angle: t.angle,
        interval: t.interval,
        minTickGap: t.minTickGap,
        orientation: t.orientation,
        tick: t.tick,
        tickCount: t.tickCount,
        tickFormatter: t.tickFormatter,
        ticks: t.ticks,
        type: t.type,
        unit: t.unit,
        axisType: u,
        categoricalDomain: a,
        duplicateDomain: i,
        isCategorical: c,
        niceTicks: l,
        range: o,
        realScaleType: r,
        scale: n
      };
    }
  }),
  _j = (e, t, r, n, i, a, o, l, u) => {
    if (!(t == null || n == null)) {
      var c = At(e, u),
        s = t.type,
        f = t.ticks,
        d = t.tickCount,
        h = r === 'scaleBand' && typeof n.bandwidth == 'function' ? n.bandwidth() / 2 : 2,
        p = s === 'category' && n.bandwidth ? n.bandwidth() / h : 0;
      p = u === 'angleAxis' && a != null && a.length >= 2 ? je(a[0] - a[1]) * 2 * p : p;
      var m = f || i;
      return m
        ? m
            .map((y, g) => {
              var x = o ? o.indexOf(y) : y,
                A = n.map(x);
              return H(A) ? { index: g, coordinate: A + p, value: y, offset: p } : null;
            })
            .filter(Ue)
        : c && l
          ? l
              .map((y, g) => {
                var x = n.map(y);
                return H(x) ? { coordinate: x + p, value: y, index: g, offset: p } : null;
              })
              .filter(Ue)
          : n.ticks
            ? n
                .ticks(d)
                .map((y, g) => {
                  var x = n.map(y);
                  return H(x) ? { coordinate: x + p, value: y, index: g, offset: p } : null;
                })
                .filter(Ue)
            : n
                .domain()
                .map((y, g) => {
                  var x = n.map(y);
                  return H(x)
                    ? { coordinate: x + p, value: o ? o[y] : y, index: g, offset: p }
                    : null;
                })
                .filter(Ue);
    }
  },
  Xg = O([q, wn, yr, hn, rs, Ei, os, as, ve], _j),
  Tj = (e, t, r, n, i, a, o) => {
    if (!(t == null || r == null || n == null || n[0] === n[1])) {
      var l = At(e, o),
        u = t.tickCount,
        c = 0;
      return (
        (c =
          o === 'angleAxis' && (n == null ? void 0 : n.length) >= 2 ? je(n[0] - n[1]) * 2 * c : c),
        l && a
          ? a
              .map((s, f) => {
                var d = r.map(s);
                return H(d) ? { coordinate: d + c, value: s, index: f, offset: c } : null;
              })
              .filter(Ue)
          : r.ticks
            ? r
                .ticks(u)
                .map((s, f) => {
                  var d = r.map(s);
                  return H(d) ? { coordinate: d + c, value: s, index: f, offset: c } : null;
                })
                .filter(Ue)
            : r
                .domain()
                .map((s, f) => {
                  var d = r.map(s);
                  return H(d)
                    ? { coordinate: d + c, value: i ? i[s] : s, index: f, offset: c }
                    : null;
                })
                .filter(Ue)
      );
    }
  },
  Nt = O([q, wn, hn, Ei, os, as, ve], Tj),
  Lt = O(he, hn, (e, t) => {
    if (!(e == null || t == null)) return Da(Da({}, e), {}, { scale: t });
  }),
  Mj = O([he, yr, es, Kg], Wc),
  Dj = O([Mj], yc);
O(
  (e, t, r) => Fc(e, r),
  Dj,
  (e, t) => {
    if (!(e == null || t == null)) return Da(Da({}, e), {}, { scale: t });
  }
);
var $j = O([q, vo, ho], (e, t, r) => {
    switch (e) {
      case 'horizontal':
        return t.some((n) => n.reversed) ? 'right-to-left' : 'left-to-right';
      case 'vertical':
        return r.some((n) => n.reversed) ? 'bottom-to-top' : 'top-to-bottom';
      case 'centric':
      case 'radial':
        return 'left-to-right';
      default:
        return;
    }
  }),
  Nj = (e, t, r) => {
    var n;
    return (n = e.renderedTicks[t]) === null || n === void 0 ? void 0 : n[r];
  };
O([Nj], (e) => {
  if (!(!e || e.length === 0))
    return (t) => {
      var r,
        n = 1 / 0,
        i = e[0];
      for (var a of e) {
        var o = Math.abs(a.coordinate - t);
        o < n && ((n = o), (i = a));
      }
      return (r = i) === null || r === void 0 ? void 0 : r.value;
    };
});
var Zg = (e) => e.options.defaultTooltipEventType,
  Qg = (e) => e.options.validateTooltipEventTypes;
function Jg(e, t, r) {
  if (e == null) return t;
  var n = e ? 'axis' : 'item';
  return r == null ? t : r.includes(n) ? n : t;
}
function Ii(e, t) {
  var r = Zg(e),
    n = Qg(e);
  return Jg(t, r, n);
}
function Lj(e) {
  return M((t) => Ii(t, e));
}
var e0 = (e, t) => {
    var r,
      n = Number(t);
    if (!(bt(n) || t == null))
      return n >= 0
        ? e == null || (r = e[n]) === null || r === void 0
          ? void 0
          : r.value
        : void 0;
  },
  Rj = (e) => e.tooltip.settings,
  or = { active: !1, index: null, dataKey: void 0, graphicalItemId: void 0, coordinate: void 0 },
  Bj = {
    itemInteraction: { click: or, hover: or },
    axisInteraction: { click: or, hover: or },
    keyboardInteraction: or,
    syncInteraction: {
      active: !1,
      index: null,
      dataKey: void 0,
      label: void 0,
      coordinate: void 0,
      sourceViewBox: void 0,
      graphicalItemId: void 0
    },
    tooltipItemPayloads: [],
    settings: { shared: void 0, trigger: 'hover', axisId: 0, active: !1, defaultIndex: void 0 }
  },
  t0 = We({
    name: 'tooltip',
    initialState: Bj,
    reducers: {
      addTooltipEntrySettings: {
        reducer(e, t) {
          e.tooltipItemPayloads.push(Q(t.payload));
        },
        prepare: oe()
      },
      replaceTooltipEntrySettings: {
        reducer(e, t) {
          var r = t.payload,
            n = r.prev,
            i = r.next,
            a = ot(e).tooltipItemPayloads.indexOf(Q(n));
          a > -1 && (e.tooltipItemPayloads[a] = Q(i));
        },
        prepare: oe()
      },
      removeTooltipEntrySettings: {
        reducer(e, t) {
          var r = ot(e).tooltipItemPayloads.indexOf(Q(t.payload));
          r > -1 && e.tooltipItemPayloads.splice(r, 1);
        },
        prepare: oe()
      },
      setTooltipSettingsState(e, t) {
        e.settings = t.payload;
      },
      setActiveMouseOverItemIndex(e, t) {
        ((e.syncInteraction.active = !1),
          (e.syncInteraction.sourceViewBox = void 0),
          (e.keyboardInteraction.active = !1),
          (e.itemInteraction.hover.active = !0),
          (e.itemInteraction.hover.index = t.payload.activeIndex),
          (e.itemInteraction.hover.dataKey = t.payload.activeDataKey),
          (e.itemInteraction.hover.graphicalItemId = t.payload.activeGraphicalItemId),
          (e.itemInteraction.hover.coordinate = t.payload.activeCoordinate));
      },
      mouseLeaveChart(e) {
        ((e.itemInteraction.hover.active = !1), (e.axisInteraction.hover.active = !1));
      },
      mouseLeaveItem(e) {
        e.itemInteraction.hover.active = !1;
      },
      setActiveClickItemIndex(e, t) {
        ((e.syncInteraction.active = !1),
          (e.syncInteraction.sourceViewBox = void 0),
          (e.itemInteraction.click.active = !0),
          (e.keyboardInteraction.active = !1),
          (e.itemInteraction.click.index = t.payload.activeIndex),
          (e.itemInteraction.click.dataKey = t.payload.activeDataKey),
          (e.itemInteraction.click.graphicalItemId = t.payload.activeGraphicalItemId),
          (e.itemInteraction.click.coordinate = t.payload.activeCoordinate));
      },
      setMouseOverAxisIndex(e, t) {
        ((e.syncInteraction.active = !1),
          (e.syncInteraction.sourceViewBox = void 0),
          (e.axisInteraction.hover.active = !0),
          (e.keyboardInteraction.active = !1),
          (e.axisInteraction.hover.index = t.payload.activeIndex),
          (e.axisInteraction.hover.dataKey = t.payload.activeDataKey),
          (e.axisInteraction.hover.coordinate = t.payload.activeCoordinate));
      },
      setMouseClickAxisIndex(e, t) {
        ((e.syncInteraction.active = !1),
          (e.syncInteraction.sourceViewBox = void 0),
          (e.keyboardInteraction.active = !1),
          (e.axisInteraction.click.active = !0),
          (e.axisInteraction.click.index = t.payload.activeIndex),
          (e.axisInteraction.click.dataKey = t.payload.activeDataKey),
          (e.axisInteraction.click.coordinate = t.payload.activeCoordinate));
      },
      setSyncInteraction(e, t) {
        e.syncInteraction = t.payload;
      },
      setKeyboardInteraction(e, t) {
        ((e.keyboardInteraction.active = t.payload.active),
          (e.keyboardInteraction.index = t.payload.activeIndex),
          (e.keyboardInteraction.coordinate = t.payload.activeCoordinate));
      }
    }
  }),
  dt = t0.actions,
  zj = dt.addTooltipEntrySettings,
  Wj = dt.replaceTooltipEntrySettings,
  Fj = dt.removeTooltipEntrySettings,
  Kj = dt.setTooltipSettingsState,
  r0 = dt.setActiveMouseOverItemIndex,
  Uj = dt.mouseLeaveItem,
  n0 = dt.mouseLeaveChart,
  Hj = dt.setActiveClickItemIndex,
  i0 = dt.setMouseOverAxisIndex,
  Vj = dt.setMouseClickAxisIndex,
  Bn = dt.setSyncInteraction,
  La = dt.setKeyboardInteraction,
  Yj = t0.reducer;
function Ev(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Fi(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Ev(Object(r), !0).forEach(function (n) {
          Gj(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Ev(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Gj(e, t, r) {
  return (
    (t = qj(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function qj(e) {
  var t = Xj(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Xj(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Zj(e, t, r) {
  return t === 'axis'
    ? r === 'click'
      ? e.axisInteraction.click
      : e.axisInteraction.hover
    : r === 'click'
      ? e.itemInteraction.click
      : e.itemInteraction.hover;
}
function Qj(e) {
  return e.index != null;
}
var a0 = (e, t, r, n) => {
  if (t == null) return or;
  var i = Zj(e, t, r);
  if (i == null) return or;
  if (i.active) return i;
  if (e.keyboardInteraction.active) return e.keyboardInteraction;
  if (e.syncInteraction.active && e.syncInteraction.index != null) return e.syncInteraction;
  var a = e.settings.active === !0;
  if (Qj(i)) {
    if (a) return Fi(Fi({}, i), {}, { active: !0 });
  } else if (n != null)
    return { active: !0, coordinate: void 0, dataKey: void 0, index: n, graphicalItemId: void 0 };
  return Fi(Fi({}, or), {}, { coordinate: i.coordinate });
};
function Jj(e) {
  if (typeof e == 'number') return Number.isFinite(e) ? e : void 0;
  if (e instanceof Date) {
    var t = e.valueOf();
    return Number.isFinite(t) ? t : void 0;
  }
  var r = Number(e);
  return Number.isFinite(r) ? r : void 0;
}
function e_(e, t) {
  var r = Jj(e),
    n = t[0],
    i = t[1];
  if (r === void 0) return !1;
  var a = Math.min(n, i),
    o = Math.max(n, i);
  return r >= a && r <= o;
}
function t_(e, t, r) {
  if (r == null || t == null) return !0;
  var n = X(e, t);
  return n == null || !_t(r) ? !0 : e_(n, r);
}
var Fn = (e, t, r, n) => {
    var i = e == null ? void 0 : e.index;
    if (i == null) return null;
    var a = Number(i);
    if (!H(a)) return i;
    var o = 0,
      l = 1 / 0;
    t.length > 0 && (l = t.length - 1);
    var u = Math.max(o, Math.min(a, l)),
      c = t[u];
    return c == null || t_(c, r, n) ? String(u) : null;
  },
  o0 = (e, t, r, n, i, a, o) => {
    if (a != null) {
      var l = o[0],
        u = l == null ? void 0 : l.getPosition(a);
      if (u != null) return u;
      var c = i == null ? void 0 : i[Number(a)];
      if (c)
        switch (r) {
          case 'horizontal':
            return { x: c.coordinate, y: (n.top + t) / 2 };
          default:
            return { x: (n.left + e) / 2, y: c.coordinate };
        }
    }
  },
  l0 = (e, t, r, n) => {
    if (t === 'axis') return e.tooltipItemPayloads;
    if (e.tooltipItemPayloads.length === 0) return [];
    var i;
    if (
      (r === 'hover'
        ? (i = e.itemInteraction.hover.graphicalItemId)
        : (i = e.itemInteraction.click.graphicalItemId),
      e.syncInteraction.active && i == null)
    )
      return e.tooltipItemPayloads;
    if (i == null && (n != null || e.keyboardInteraction.active)) {
      var a = e.tooltipItemPayloads[0];
      return a != null ? [a] : [];
    }
    return e.tooltipItemPayloads.filter((o) => {
      var l;
      return ((l = o.settings) === null || l === void 0 ? void 0 : l.graphicalItemId) === i;
    });
  },
  u0 = (e) => e.options.tooltipPayloadSearcher,
  On = (e) => e.tooltip;
function Iv(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function kv(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Iv(Object(r), !0).forEach(function (n) {
          r_(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Iv(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function r_(e, t, r) {
  return (
    (t = n_(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function n_(e) {
  var t = i_(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function i_(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function a_(e) {
  if (typeof e == 'string' || typeof e == 'number') return e;
}
function o_(e) {
  if (typeof e == 'string' || typeof e == 'number' || typeof e == 'boolean') return e;
}
function l_(e) {
  if (typeof e == 'string' || typeof e == 'number') return e;
  if (typeof e == 'function') return (t) => e(t);
}
function Cv(e) {
  if (typeof e == 'string') return e;
}
function u_(e) {
  if (!(e == null || typeof e != 'object')) {
    var t = 'name' in e ? a_(e.name) : void 0,
      r = 'unit' in e ? o_(e.unit) : void 0,
      n = 'dataKey' in e ? l_(e.dataKey) : void 0,
      i = 'payload' in e ? e.payload : void 0,
      a = 'color' in e ? Cv(e.color) : void 0,
      o = 'fill' in e ? Cv(e.fill) : void 0;
    return { name: t, unit: r, dataKey: n, payload: i, color: a, fill: o };
  }
}
function c_(e, t) {
  return e ?? t;
}
var c0 = (e, t, r, n, i, a, o) => {
    if (!(t == null || a == null)) {
      var l = r.chartData,
        u = r.computedData,
        c = r.dataStartIndex,
        s = r.dataEndIndex,
        f = [];
      return e.reduce((d, h) => {
        var p,
          m = h.dataDefinedOnItem,
          y = h.settings,
          g = c_(m, l),
          x = Array.isArray(g) ? Km(g, c, s) : g,
          A = (p = y == null ? void 0 : y.dataKey) !== null && p !== void 0 ? p : n,
          w = y == null ? void 0 : y.nameKey,
          P;
        if (
          (n && Array.isArray(x) && !Array.isArray(x[0]) && o === 'axis'
            ? ((P = hp(x, n, i)), P == null && (P = a(x, t, u, w)))
            : (P = a(x, t, u, w)),
          Array.isArray(P))
        )
          P.forEach((S) => {
            var E,
              C,
              k = u_(S),
              j = k == null ? void 0 : k.name,
              I = k == null ? void 0 : k.dataKey,
              R = k == null ? void 0 : k.payload,
              D = kv(
                kv({}, y),
                {},
                {
                  name: j,
                  unit: k == null ? void 0 : k.unit,
                  color:
                    (E = k == null ? void 0 : k.color) !== null && E !== void 0
                      ? E
                      : y == null
                        ? void 0
                        : y.color,
                  fill:
                    (C = k == null ? void 0 : k.fill) !== null && C !== void 0
                      ? C
                      : y == null
                        ? void 0
                        : y.fill
                }
              );
            d.push(
              If({
                tooltipEntrySettings: D,
                dataKey: I,
                payload: R,
                value: X(R, I),
                name: j == null ? void 0 : String(j)
              })
            );
          });
        else {
          var b;
          d.push(
            If({
              tooltipEntrySettings: y,
              dataKey: A,
              payload: P,
              value: X(P, A),
              name: (b = X(P, w)) !== null && b !== void 0 ? b : y == null ? void 0 : y.name
            })
          );
        }
        return d;
      }, f);
    }
  },
  ls = O([ke, Sg, fc], xg),
  s_ = O([(e) => e.graphicalItems.cartesianItems, (e) => e.graphicalItems.polarItems], (e, t) => [
    ...e,
    ...t
  ]),
  f_ = O([_e, bn], Kc),
  Hr = O([s_, ke, f_], Uc, { memoizeOptions: { resultEqualityCheck: Ao } }),
  d_ = O([Hr], (e) => e.filter(wo)),
  s0 = O([Hr], Hc, { memoizeOptions: { resultEqualityCheck: Ao } }),
  v_ = O([Hr], (e) => e.some((t) => !t.data)),
  Br = O([s0, Pt], Vc),
  h_ = O([d_, Pt, ke], Ry),
  us = O([Br, ke, Hr, Pt, v_, s0], jg),
  f0 = O([ke], Gc),
  p_ = O([ke], (e) => e.allowDataOverflow),
  d0 = O([f0, p_], gy),
  m_ = O([Hr], (e) => e.filter(wo)),
  y_ = O([h_, m_, yi, _y], Tg),
  g_ = O([y_, Pt, _e, d0], Mg),
  b_ = O([Hr], Ig),
  x_ = O([Br, ke, b_, Co, _e, CE], Zc, { memoizeOptions: { resultEqualityCheck: bi } }),
  w_ = O([Dg, _e, bn], Pn),
  A_ = O([w_, _e], Lg),
  P_ = O([$g, _e, bn], Pn),
  O_ = O([P_, _e], Rg),
  S_ = O([Ng, _e, bn], Pn),
  E_ = O([S_, _e], Bg),
  I_ = O([A_, E_, O_], Na),
  k_ = O([ke, f0, d0, g_, x_, I_, q, _e], Qc),
  pn = O([ke, q, Br, us, yi, _e, k_], Jc),
  C_ = O([pn, ke, ls], ts),
  j_ = O([ke, pn, C_, _e], ns),
  v0 = (e) => {
    var t = _e(e),
      r = bn(e),
      n = !1;
    return Ei(e, t, r, n);
  },
  h0 = O([ke, v0], yo),
  __ = O([ke, ls, j_, h0], Wc),
  p0 = O([__], yc),
  T_ = O([q, us, ke, _e], qg),
  M_ = O([q, us, ke, _e], Ug),
  D_ = (e, t, r, n, i, a, o, l) => {
    if (t) {
      var u = t.type,
        c = At(e, l);
      if (n) {
        var s = r === 'scaleBand' && n.bandwidth ? n.bandwidth() / 2 : 2,
          f = u === 'category' && n.bandwidth ? n.bandwidth() / s : 0;
        return (
          (f =
            l === 'angleAxis' && i != null && (i == null ? void 0 : i.length) >= 2
              ? je(i[0] - i[1]) * 2 * f
              : f),
          c && o
            ? o
                .map((d, h) => {
                  var p = n.map(d);
                  return H(p) ? { coordinate: p + f, value: d, index: h, offset: f } : null;
                })
                .filter(Ue)
            : n
                .domain()
                .map((d, h) => {
                  var p = n.map(d);
                  return H(p)
                    ? { coordinate: p + f, value: a ? a[d] : d, index: h, offset: f }
                    : null;
                })
                .filter(Ue)
        );
      }
    }
  },
  rr = O([q, ke, ls, p0, v0, T_, M_, _e], D_),
  cs = O([Zg, Qg, Rj], (e, t, r) => Jg(r.shared, e, t)),
  m0 = (e) => e.tooltip.settings.trigger,
  ss = (e) => e.tooltip.settings.defaultIndex,
  ki = O([On, cs, m0, ss], a0),
  sr = O([ki, Br, vn, pn], Fn),
  y0 = O([rr, sr], e0),
  fs = O([ki], (e) => {
    if (e) return e.dataKey;
  }),
  g0 = O([ki], (e) => {
    if (e) return e.graphicalItemId;
  }),
  b0 = O([On, cs, m0, ss], l0),
  $_ = O([Rt, Bt, q, Se, rr, ss, b0], o0),
  N_ = O([ki, $_], (e, t) => (e != null && e.coordinate ? e.coordinate : t)),
  L_ = O([ki], (e) => {
    var t;
    return (t = e == null ? void 0 : e.active) !== null && t !== void 0 ? t : !1;
  }),
  R_ = O([b0, sr, Pt, vn, y0, u0, cs], c0),
  B_ = O([R_], (e) => {
    if (e != null) {
      var t = e.map((r) => r.payload).filter((r) => r != null);
      return Array.from(new Set(t));
    }
  });
function jv(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function _v(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? jv(Object(r), !0).forEach(function (n) {
          z_(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : jv(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function z_(e, t, r) {
  return (
    (t = W_(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function W_(e) {
  var t = F_(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function F_(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var K_ = () => M(ke),
  U_ = () => {
    var e = K_(),
      t = M(rr),
      r = M(p0);
    return cr(!e || !r ? void 0 : _v(_v({}, e), {}, { scale: r }), t);
  };
function Tv(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function qr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Tv(Object(r), !0).forEach(function (n) {
          H_(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Tv(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function H_(e, t, r) {
  return (
    (t = V_(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function V_(e) {
  var t = Y_(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Y_(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var G_ = (e, t, r, n) => {
    var i = t.find((a) => a && a.index === r);
    if (i) {
      if (e === 'horizontal') return { x: i.coordinate, y: n.relativeY };
      if (e === 'vertical') return { x: n.relativeX, y: i.coordinate };
    }
    return { x: 0, y: 0 };
  },
  q_ = (e, t, r, n) => {
    var i = t.find((c) => c && c.index === r);
    if (i) {
      if (e === 'centric') {
        var a = i.coordinate,
          o = n.radius;
        return qr(qr(qr({}, n), xe(n.cx, n.cy, o, a)), {}, { angle: a, radius: o });
      }
      var l = i.coordinate,
        u = n.angle;
      return qr(qr(qr({}, n), xe(n.cx, n.cy, l, u)), {}, { angle: u, radius: l });
    }
    return {
      angle: 0,
      clockWise: !1,
      cx: 0,
      cy: 0,
      endAngle: 0,
      innerRadius: 0,
      outerRadius: 0,
      radius: 0,
      startAngle: 0,
      x: 0,
      y: 0
    };
  };
function X_(e, t) {
  var r = e.relativeX,
    n = e.relativeY;
  return r >= t.left && r <= t.left + t.width && n >= t.top && n <= t.top + t.height;
}
var x0 = (e, t, r, n, i) => {
    var a,
      o = (a = t == null ? void 0 : t.length) !== null && a !== void 0 ? a : 0;
    if (o <= 1 || e == null) return 0;
    if (n === 'angleAxis' && i != null && Math.abs(Math.abs(i[1] - i[0]) - 360) <= 1e-6)
      for (
        var l = i[1] - i[0],
          u = ($, z, W) => [e, e + l, e - l].some((B) => (W ? B >= $ : B > $) && B <= z),
          c = 0;
        c < o;
        c++
      ) {
        var s,
          f,
          d,
          h,
          p,
          m =
            c > 0
              ? (s = r[c - 1]) === null || s === void 0
                ? void 0
                : s.coordinate
              : (f = r[o - 1]) === null || f === void 0
                ? void 0
                : f.coordinate,
          y = (d = r[c]) === null || d === void 0 ? void 0 : d.coordinate,
          g =
            c >= o - 1
              ? (h = r[0]) === null || h === void 0
                ? void 0
                : h.coordinate
              : (p = r[c + 1]) === null || p === void 0
                ? void 0
                : p.coordinate,
          x = void 0;
        if (!(m == null || y == null || g == null))
          if (je(y - m) !== je(g - y)) {
            var A = [];
            if (je(g - y) === je(i[1] - i[0])) {
              x = g;
              var w = y + i[1] - i[0];
              ((A[0] = Math.min(w, (w + m) / 2)), (A[1] = Math.max(w, (w + m) / 2)));
            } else {
              x = m;
              var P = g + i[1] - i[0];
              ((A[0] = Math.min(y, (P + y) / 2)), (A[1] = Math.max(y, (P + y) / 2)));
            }
            var b = [Math.min(y, (x + y) / 2), Math.max(y, (x + y) / 2)];
            if (u(b[0], b[1], !1) || u(A[0], A[1], !0)) {
              var S;
              return (S = r[c]) === null || S === void 0 ? void 0 : S.index;
            }
          } else {
            var E = Math.min(m, g),
              C = Math.max(m, g);
            if (u((E + y) / 2, (C + y) / 2, !1)) {
              var k;
              return (k = r[c]) === null || k === void 0 ? void 0 : k.index;
            }
          }
      }
    else if (t)
      for (var j = 0; j < o; j++) {
        var I = t[j];
        if (I != null) {
          var R = t[j + 1],
            D = t[j - 1];
          if (
            (j === 0 && R != null && e <= (I.coordinate + R.coordinate) / 2) ||
            (j === o - 1 && D != null && e > (I.coordinate + D.coordinate) / 2) ||
            (j > 0 &&
              j < o - 1 &&
              D != null &&
              R != null &&
              e > (I.coordinate + D.coordinate) / 2 &&
              e <= (I.coordinate + R.coordinate) / 2)
          )
            return I.index;
        }
      }
    return -1;
  },
  w0 = () => M(fc),
  ds = (e, t) => t,
  A0 = (e, t, r) => r,
  vs = (e, t, r, n) => n,
  Z_ = O(rr, (e) => to(e, (t) => t.coordinate)),
  hs = O([On, ds, A0, vs], a0),
  ps = O([hs, Br, vn, pn], Fn),
  Q_ = (e, t, r) => {
    if (t != null) {
      var n = On(e);
      return t === 'axis'
        ? r === 'hover'
          ? n.axisInteraction.hover.dataKey
          : n.axisInteraction.click.dataKey
        : r === 'hover'
          ? n.itemInteraction.hover.dataKey
          : n.itemInteraction.click.dataKey;
    }
  },
  P0 = O([On, ds, A0, vs], l0),
  Ra = O([Rt, Bt, q, Se, rr, vs, P0], o0),
  J_ = O([hs, Ra], (e, t) => {
    var r;
    return (r = e.coordinate) !== null && r !== void 0 ? r : t;
  }),
  O0 = O([rr, ps], e0),
  eT = O([P0, ps, Pt, vn, O0, u0, ds], c0),
  tT = O([hs, ps], (e, t) => ({ isActive: e.active && t != null, activeIndex: t })),
  rT = (e, t, r, n, i, a, o) => {
    if (!(!e || !r || !n || !i) && X_(e, o)) {
      var l = iO(e, t),
        u = x0(l, a, i, r, n),
        c = G_(t, i, u, e);
      return { activeIndex: String(u), activeCoordinate: c };
    }
  },
  nT = (e, t, r, n, i, a, o) => {
    if (!(!e || !n || !i || !a || !r)) {
      var l = wE(e, r);
      if (l) {
        var u = aO(l, t),
          c = x0(u, o, a, n, i),
          s = q_(t, a, c, l);
        return { activeIndex: String(c), activeCoordinate: s };
      }
    }
  },
  iT = (e, t, r, n, i, a, o, l) => {
    if (!(!e || !t || !n || !i || !a))
      return t === 'horizontal' || t === 'vertical'
        ? rT(e, t, n, i, a, o, l)
        : nT(e, t, r, n, i, a, o);
  },
  aT = O(
    (e) => e.zIndex.zIndexMap,
    (e, t) => t,
    (e, t, r) => r,
    (e, t, r) => {
      if (t != null) {
        var n = e[t];
        if (n != null) return r ? n.panoramaElement : n.element;
      }
    }
  ),
  oT = O(
    (e) => e.zIndex.zIndexMap,
    (e) => {
      var t = Object.keys(e)
          .map((n) => parseInt(n, 10))
          .concat(Object.values(ye)),
        r = Array.from(new Set(t));
      return r.sort((n, i) => n - i);
    },
    { memoizeOptions: { resultEqualityCheck: QE } }
  );
function Mv(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Dv(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Mv(Object(r), !0).forEach(function (n) {
          lT(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Mv(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function lT(e, t, r) {
  return (
    (t = uT(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function uT(e) {
  var t = cT(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function cT(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var sT = {},
  fT = {
    zIndexMap: Object.values(ye).reduce(
      (e, t) =>
        Dv(Dv({}, e), {}, { [t]: { element: void 0, panoramaElement: void 0, consumers: 0 } }),
      sT
    )
  },
  dT = new Set(Object.values(ye));
function vT(e) {
  return dT.has(e);
}
var S0 = We({
    name: 'zIndex',
    initialState: fT,
    reducers: {
      registerZIndexPortal: {
        reducer: (e, t) => {
          var r = t.payload.zIndex;
          e.zIndexMap[r]
            ? (e.zIndexMap[r].consumers += 1)
            : (e.zIndexMap[r] = { consumers: 1, element: void 0, panoramaElement: void 0 });
        },
        prepare: oe()
      },
      unregisterZIndexPortal: {
        reducer: (e, t) => {
          var r = t.payload.zIndex;
          e.zIndexMap[r] &&
            ((e.zIndexMap[r].consumers -= 1),
            e.zIndexMap[r].consumers <= 0 && !vT(r) && delete e.zIndexMap[r]);
        },
        prepare: oe()
      },
      registerZIndexPortalElement: {
        reducer: (e, t) => {
          var r = t.payload,
            n = r.zIndex,
            i = r.element,
            a = r.isPanorama;
          e.zIndexMap[n]
            ? a
              ? (e.zIndexMap[n].panoramaElement = Q(i))
              : (e.zIndexMap[n].element = Q(i))
            : (e.zIndexMap[n] = {
                consumers: 0,
                element: a ? void 0 : Q(i),
                panoramaElement: a ? Q(i) : void 0
              });
        },
        prepare: oe()
      },
      unregisterZIndexPortalElement: {
        reducer: (e, t) => {
          var r = t.payload.zIndex;
          e.zIndexMap[r] &&
            (t.payload.isPanorama
              ? (e.zIndexMap[r].panoramaElement = void 0)
              : (e.zIndexMap[r].element = void 0));
        },
        prepare: oe()
      }
    }
  }),
  To = S0.actions,
  hT = To.registerZIndexPortal,
  Il = To.unregisterZIndexPortal,
  pT = To.registerZIndexPortalElement,
  mT = To.unregisterZIndexPortalElement,
  yT = S0.reducer;
function Fe(e) {
  var t = e.zIndex,
    r = e.children,
    n = WO(),
    i = n && t !== void 0 && t !== 0,
    a = Ee(),
    o = v.useRef(void 0),
    l = v.useRef(new Set()),
    u = ee(),
    c = M((f) => aT(f, t, a));
  if (
    (v.useLayoutEffect(() => {
      if (!i) {
        var f = l.current;
        (f.forEach((h) => {
          u(Il({ zIndex: h }));
        }),
          f.clear(),
          (o.current = void 0));
        return;
      }
      if ((l.current.has(t) || (u(hT({ zIndex: t })), l.current.add(t)), c)) {
        o.current = c;
        var d = l.current;
        d.forEach((h) => {
          h !== t && (u(Il({ zIndex: h })), d.delete(h));
        });
      }
    }, [u, t, i, c]),
    v.useLayoutEffect(() => {
      var f = l.current;
      return () => {
        (f.forEach((d) => {
          u(Il({ zIndex: d }));
        }),
          f.clear());
      };
    }, [u]),
    !i)
  )
    return r;
  var s = c ?? o.current;
  return s ? Tu.createPortal(r, s) : null;
}
function yu() {
  return (
    (yu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    yu.apply(null, arguments)
  );
}
function $v(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Ki(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? $v(Object(r), !0).forEach(function (n) {
          gT(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : $v(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function gT(e, t, r) {
  return (
    (t = bT(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function bT(e) {
  var t = xT(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function xT(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function wT(e) {
  var t = e.cursor,
    r = e.cursorComp,
    n = e.cursorProps;
  return v.isValidElement(t) ? v.cloneElement(t, n) : v.createElement(r, n);
}
function AT(e) {
  var t,
    r = e.coordinate,
    n = e.payload,
    i = e.index,
    a = e.offset,
    o = e.tooltipAxisBandSize,
    l = e.layout,
    u = e.cursor,
    c = e.tooltipEventType,
    s = e.chartName,
    f = r,
    d = n,
    h = i;
  if (!u || !f || (s !== 'ScatterChart' && c !== 'axis')) return null;
  var p, m, y;
  if (s === 'ScatterChart') ((p = f), (m = _S), (y = ye.cursorLine));
  else if (s === 'BarChart') ((p = TS(l, f, a, o)), (m = fy), (y = ye.cursorRectangle));
  else if (l === 'radial' && $p(f)) {
    var g = vy(f),
      x = g.cx,
      A = g.cy,
      w = g.radius,
      P = g.startAngle,
      b = g.endAngle;
    ((p = { cx: x, cy: A, startAngle: P, endAngle: b, innerRadius: w, outerRadius: w }),
      (m = py),
      (y = ye.cursorLine));
  } else ((p = { points: SE(l, f, a) }), (m = nn), (y = ye.cursorLine));
  var S = typeof u == 'object' && 'className' in u ? u.className : void 0,
    E = Ki(
      Ki(Ki(Ki({ stroke: '#ccc', pointerEvents: 'none' }, a), p), Dr(u)),
      {},
      { payload: d, payloadIndex: h, className: Z('recharts-tooltip-cursor', S) }
    );
  return v.createElement(
    Fe,
    { zIndex: (t = e.zIndex) !== null && t !== void 0 ? t : y },
    v.createElement(wT, { cursor: u, cursorComp: m, cursorProps: E })
  );
}
function PT(e) {
  var t = U_(),
    r = Jm(),
    n = hr(),
    i = w0();
  return t == null || r == null || n == null || i == null
    ? null
    : v.createElement(
        AT,
        yu({}, e, { offset: r, layout: n, tooltipAxisBandSize: t, chartName: i })
      );
}
var E0 = v.createContext(null),
  OT = () => v.useContext(E0),
  I0 = { exports: {} };
(function (e) {
  var t = Object.prototype.hasOwnProperty,
    r = '~';
  function n() {}
  Object.create && ((n.prototype = Object.create(null)), new n().__proto__ || (r = !1));
  function i(u, c, s) {
    ((this.fn = u), (this.context = c), (this.once = s || !1));
  }
  function a(u, c, s, f, d) {
    if (typeof s != 'function') throw new TypeError('The listener must be a function');
    var h = new i(s, f || u, d),
      p = r ? r + c : c;
    return (
      u._events[p]
        ? u._events[p].fn
          ? (u._events[p] = [u._events[p], h])
          : u._events[p].push(h)
        : ((u._events[p] = h), u._eventsCount++),
      u
    );
  }
  function o(u, c) {
    --u._eventsCount === 0 ? (u._events = new n()) : delete u._events[c];
  }
  function l() {
    ((this._events = new n()), (this._eventsCount = 0));
  }
  ((l.prototype.eventNames = function () {
    var c = [],
      s,
      f;
    if (this._eventsCount === 0) return c;
    for (f in (s = this._events)) t.call(s, f) && c.push(r ? f.slice(1) : f);
    return Object.getOwnPropertySymbols ? c.concat(Object.getOwnPropertySymbols(s)) : c;
  }),
    (l.prototype.listeners = function (c) {
      var s = r ? r + c : c,
        f = this._events[s];
      if (!f) return [];
      if (f.fn) return [f.fn];
      for (var d = 0, h = f.length, p = new Array(h); d < h; d++) p[d] = f[d].fn;
      return p;
    }),
    (l.prototype.listenerCount = function (c) {
      var s = r ? r + c : c,
        f = this._events[s];
      return f ? (f.fn ? 1 : f.length) : 0;
    }),
    (l.prototype.emit = function (c, s, f, d, h, p) {
      var m = r ? r + c : c;
      if (!this._events[m]) return !1;
      var y = this._events[m],
        g = arguments.length,
        x,
        A;
      if (y.fn) {
        switch ((y.once && this.removeListener(c, y.fn, void 0, !0), g)) {
          case 1:
            return (y.fn.call(y.context), !0);
          case 2:
            return (y.fn.call(y.context, s), !0);
          case 3:
            return (y.fn.call(y.context, s, f), !0);
          case 4:
            return (y.fn.call(y.context, s, f, d), !0);
          case 5:
            return (y.fn.call(y.context, s, f, d, h), !0);
          case 6:
            return (y.fn.call(y.context, s, f, d, h, p), !0);
        }
        for (A = 1, x = new Array(g - 1); A < g; A++) x[A - 1] = arguments[A];
        y.fn.apply(y.context, x);
      } else {
        var w = y.length,
          P;
        for (A = 0; A < w; A++)
          switch ((y[A].once && this.removeListener(c, y[A].fn, void 0, !0), g)) {
            case 1:
              y[A].fn.call(y[A].context);
              break;
            case 2:
              y[A].fn.call(y[A].context, s);
              break;
            case 3:
              y[A].fn.call(y[A].context, s, f);
              break;
            case 4:
              y[A].fn.call(y[A].context, s, f, d);
              break;
            default:
              if (!x) for (P = 1, x = new Array(g - 1); P < g; P++) x[P - 1] = arguments[P];
              y[A].fn.apply(y[A].context, x);
          }
      }
      return !0;
    }),
    (l.prototype.on = function (c, s, f) {
      return a(this, c, s, f, !1);
    }),
    (l.prototype.once = function (c, s, f) {
      return a(this, c, s, f, !0);
    }),
    (l.prototype.removeListener = function (c, s, f, d) {
      var h = r ? r + c : c;
      if (!this._events[h]) return this;
      if (!s) return (o(this, h), this);
      var p = this._events[h];
      if (p.fn) p.fn === s && (!d || p.once) && (!f || p.context === f) && o(this, h);
      else {
        for (var m = 0, y = [], g = p.length; m < g; m++)
          (p[m].fn !== s || (d && !p[m].once) || (f && p[m].context !== f)) && y.push(p[m]);
        y.length ? (this._events[h] = y.length === 1 ? y[0] : y) : o(this, h);
      }
      return this;
    }),
    (l.prototype.removeAllListeners = function (c) {
      var s;
      return (
        c
          ? ((s = r ? r + c : c), this._events[s] && o(this, s))
          : ((this._events = new n()), (this._eventsCount = 0)),
        this
      );
    }),
    (l.prototype.off = l.prototype.removeListener),
    (l.prototype.addListener = l.prototype.on),
    (l.prefixed = r),
    (l.EventEmitter = l),
    (e.exports = l));
})(I0);
var ST = I0.exports;
const ET = rp(ST);
var ni = new ET(),
  gu = 'recharts.syncEvent.tooltip',
  Nv = 'recharts.syncEvent.brush',
  Mo = (e, t) => {
    if (t && Array.isArray(e)) {
      var r = Number.parseInt(t, 10);
      if (!bt(r)) return e[r];
    }
  },
  IT = {
    chartName: '',
    tooltipPayloadSearcher: () => {},
    eventEmitter: void 0,
    defaultTooltipEventType: 'axis'
  },
  k0 = We({
    name: 'options',
    initialState: IT,
    reducers: {
      createEventEmitter: (e) => {
        e.eventEmitter == null && (e.eventEmitter = Symbol('rechartsEventEmitter'));
      }
    }
  }),
  kT = k0.reducer,
  CT = k0.actions.createEventEmitter;
function jT(e) {
  return e.tooltip.syncInteraction;
}
var _T = { chartData: void 0, computedData: void 0, dataStartIndex: 0, dataEndIndex: 0 },
  C0 = We({
    name: 'chartData',
    initialState: _T,
    reducers: {
      setChartData(e, t) {
        if (((e.chartData = Q(t.payload)), t.payload == null)) {
          ((e.dataStartIndex = 0), (e.dataEndIndex = 0));
          return;
        }
        t.payload.length > 0 &&
          e.dataEndIndex !== t.payload.length - 1 &&
          (e.dataEndIndex = t.payload.length - 1);
      },
      setComputedData(e, t) {
        e.computedData = t.payload;
      },
      setDataStartEndIndexes(e, t) {
        var r = t.payload,
          n = r.startIndex,
          i = r.endIndex;
        (n != null && (e.dataStartIndex = n), i != null && (e.dataEndIndex = i));
      }
    }
  }),
  ms = C0.actions,
  Lv = ms.setChartData,
  TT = ms.setDataStartEndIndexes;
ms.setComputedData;
var MT = C0.reducer,
  DT = ['x', 'y'];
function Rv(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Xr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Rv(Object(r), !0).forEach(function (n) {
          $T(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Rv(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function $T(e, t, r) {
  return (
    (t = NT(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function NT(e) {
  var t = LT(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function LT(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function RT(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = BT(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function BT(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function zT() {
  var e = M(dc),
    t = M(vc),
    r = ee(),
    n = M(Ty),
    i = M(rr),
    a = hr(),
    o = si(),
    l = M((u) => u.rootProps.className);
  v.useEffect(() => {
    if (e == null) return dr;
    var u = (c, s, f) => {
      if (t !== f && e === c) {
        if (s.payload.active === !1) {
          r(
            Bn({
              active: !1,
              coordinate: void 0,
              dataKey: void 0,
              index: null,
              label: void 0,
              sourceViewBox: void 0,
              graphicalItemId: void 0
            })
          );
          return;
        }
        if (n === 'index') {
          var d;
          if (
            o &&
            s !== null &&
            s !== void 0 &&
            (d = s.payload) !== null &&
            d !== void 0 &&
            d.coordinate &&
            s.payload.sourceViewBox
          ) {
            var h = s.payload.coordinate,
              p = h.x,
              m = h.y,
              y = RT(h, DT),
              g = s.payload.sourceViewBox,
              x = g.x,
              A = g.y,
              w = g.width,
              P = g.height,
              b = Xr(
                Xr({}, y),
                {},
                {
                  x: o.x + (w ? (p - x) / w : 0) * o.width,
                  y: o.y + (P ? (m - A) / P : 0) * o.height
                }
              );
            r(Xr(Xr({}, s), {}, { payload: Xr(Xr({}, s.payload), {}, { coordinate: b }) }));
          } else r(s);
          return;
        }
        if (i != null) {
          var S;
          if (typeof n == 'function') {
            var E = {
                activeTooltipIndex: s.payload.index == null ? void 0 : Number(s.payload.index),
                isTooltipActive: s.payload.active,
                activeIndex: s.payload.index == null ? void 0 : Number(s.payload.index),
                activeLabel: s.payload.label,
                activeDataKey: s.payload.dataKey,
                activeCoordinate: s.payload.coordinate
              },
              C = n(i, E);
            S = i[C];
          } else n === 'value' && (S = i.find((W) => String(W.value) === s.payload.label));
          var k = s.payload.coordinate;
          if (k == null || o == null) {
            r(
              Bn({
                active: !1,
                coordinate: void 0,
                dataKey: void 0,
                index: null,
                label: void 0,
                sourceViewBox: void 0,
                graphicalItemId: void 0
              })
            );
            return;
          }
          if (S == null) {
            r(
              Bn({
                active: !1,
                coordinate: void 0,
                dataKey: void 0,
                index: null,
                label: void 0,
                sourceViewBox: s.payload.sourceViewBox,
                graphicalItemId: void 0
              })
            );
            return;
          }
          var j = k.x,
            I = k.y,
            R = Math.min(j, o.x + o.width),
            D = Math.min(I, o.y + o.height),
            $ = {
              x: a === 'horizontal' ? S.coordinate : R,
              y: a === 'horizontal' ? D : S.coordinate
            },
            z = Bn({
              active: s.payload.active,
              coordinate: $,
              dataKey: s.payload.dataKey,
              index: String(S.index),
              label: s.payload.label,
              sourceViewBox: s.payload.sourceViewBox,
              graphicalItemId: s.payload.graphicalItemId
            });
          r(z);
        }
      }
    };
    return (
      ni.on(gu, u),
      () => {
        ni.off(gu, u);
      }
    );
  }, [l, r, t, e, n, i, a, o]);
}
function WT() {
  var e = M(dc),
    t = M(vc),
    r = ee();
  v.useEffect(() => {
    if (e == null) return dr;
    var n = (i, a, o) => {
      t !== o && e === i && r(TT(a));
    };
    return (
      ni.on(Nv, n),
      () => {
        ni.off(Nv, n);
      }
    );
  }, [r, t, e]);
}
function FT() {
  var e = ee();
  (v.useEffect(() => {
    e(CT());
  }, [e]),
    zT(),
    WT());
}
function KT(e, t, r, n, i, a) {
  var o = M((p) => Q_(p, e, t)),
    l = M(g0),
    u = M(vc),
    c = M(dc),
    s = M(Ty),
    f = M(jT),
    d = (f == null ? void 0 : f.sourceViewBox) != null,
    h = si();
  v.useEffect(() => {
    if (!d && c != null && u != null) {
      var p = Bn({
        active: a,
        coordinate: r,
        dataKey: o,
        index: i,
        label: typeof n == 'number' ? String(n) : n,
        sourceViewBox: h,
        graphicalItemId: l
      });
      ni.emit(gu, c, p, u);
    }
  }, [d, r, o, l, i, n, u, c, s, a, h]);
}
function Bv(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function zv(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Bv(Object(r), !0).forEach(function (n) {
          UT(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Bv(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function UT(e, t, r) {
  return (
    (t = HT(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function HT(e) {
  var t = VT(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function VT(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function YT(e, t) {
  return ZT(e) || XT(e, t) || qT(e, t) || GT();
}
function GT() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qT(e, t) {
  if (e) {
    if (typeof e == 'string') return Wv(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Wv(e, t)
          : void 0
    );
  }
}
function Wv(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function XT(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function ZT(e) {
  if (Array.isArray(e)) return e;
}
function QT(e) {
  return e.dataKey;
}
function JT(e, t) {
  return v.isValidElement(e)
    ? v.cloneElement(e, t)
    : typeof e == 'function'
      ? v.createElement(e, t)
      : v.createElement(X1, t);
}
var Fv = [],
  eM = {
    allowEscapeViewBox: { x: !1, y: !1 },
    animationDuration: 400,
    animationEasing: 'ease',
    axisId: 0,
    contentStyle: {},
    cursor: !0,
    filterNull: !0,
    includeHidden: !1,
    isAnimationActive: 'auto',
    itemSorter: 'name',
    itemStyle: {},
    labelStyle: {},
    offset: 10,
    reverseDirection: { x: !1, y: !1 },
    separator: ' : ',
    trigger: 'hover',
    useTranslate3d: !1,
    wrapperStyle: {}
  };
function jW(e) {
  var t,
    r,
    n = ge(e, eM),
    i = n.active,
    a = n.allowEscapeViewBox,
    o = n.animationDuration,
    l = n.animationEasing,
    u = n.content,
    c = n.filterNull,
    s = n.isAnimationActive,
    f = n.offset,
    d = n.payloadUniqBy,
    h = n.position,
    p = n.reverseDirection,
    m = n.useTranslate3d,
    y = n.wrapperStyle,
    g = n.cursor,
    x = n.shared,
    A = n.trigger,
    w = n.defaultIndex,
    P = n.portal,
    b = n.axisId,
    S = ee(),
    E = typeof w == 'number' ? String(w) : w;
  v.useEffect(() => {
    S(Kj({ shared: x, trigger: A, axisId: b, active: i, defaultIndex: E }));
  }, [S, x, A, b, i, E]);
  var C = si(),
    k = ay(),
    j = Lj(x),
    I = (t = M((U) => tT(U, j, A, E))) !== null && t !== void 0 ? t : {},
    R = I.activeIndex,
    D = I.isActive,
    $ = M((U) => eT(U, j, A, E)),
    z = M((U) => O0(U, j, A, E)),
    W = M((U) => J_(U, j, A, E)),
    B = $,
    Y = OT(),
    K = (r = i ?? D) !== null && r !== void 0 ? r : !1,
    pe = vm([B, K]),
    be = YT(pe, 2),
    de = be[0],
    Ke = be[1],
    Xe = j === 'axis' ? z : void 0;
  KT(j, A, W, Xe, R, K);
  var ht = P ?? Y;
  if (ht == null || C == null || j == null) return null;
  var pt = B ?? Fv;
  (K || (pt = Fv),
    c &&
      pt.length &&
      (pt = um(
        pt.filter((U) => U.value != null && (U.hide !== !0 || n.includeHidden)),
        d,
        QT
      )));
  var In = pt.length > 0,
    N = zv(
      zv({}, n),
      {},
      { payload: pt, label: Xe, active: K, activeIndex: R, coordinate: W, accessibilityLayer: k }
    ),
    V = v.createElement(
      yS,
      {
        allowEscapeViewBox: a,
        animationDuration: o,
        animationEasing: l,
        isAnimationActive: s,
        active: K,
        coordinate: W,
        hasPayload: In,
        offset: f,
        position: h,
        reverseDirection: p,
        useTranslate3d: m,
        viewBox: C,
        wrapperStyle: y,
        lastBoundingBox: de,
        innerRef: Ke,
        hasPortalFromProps: !!P
      },
      JT(u, N)
    );
  return v.createElement(
    v.Fragment,
    null,
    Tu.createPortal(V, ht),
    K &&
      v.createElement(PT, { cursor: g, tooltipEventType: j, coordinate: W, payload: pt, index: R })
  );
}
var Do = (e) => null;
Do.displayName = 'Cell';
function tM(e, t, r) {
  return (
    (t = rM(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function rM(e) {
  var t = nM(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function nM(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
class iM {
  constructor(t) {
    (tM(this, 'cache', new Map()), (this.maxSize = t));
  }
  get(t) {
    var r = this.cache.get(t);
    return (r !== void 0 && (this.cache.delete(t), this.cache.set(t, r)), r);
  }
  set(t, r) {
    if (this.cache.has(t)) this.cache.delete(t);
    else if (this.cache.size >= this.maxSize) {
      var n = this.cache.keys().next().value;
      n != null && this.cache.delete(n);
    }
    this.cache.set(t, r);
  }
  clear() {
    this.cache.clear();
  }
  size() {
    return this.cache.size;
  }
}
function Kv(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function aM(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Kv(Object(r), !0).forEach(function (n) {
          oM(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Kv(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function oM(e, t, r) {
  return (
    (t = lM(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function lM(e) {
  var t = uM(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function uM(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var cM = { cacheSize: 2e3, enableCache: !0 },
  j0 = aM({}, cM),
  Uv = new iM(j0.cacheSize),
  sM = {
    position: 'absolute',
    top: '-20000px',
    left: 0,
    padding: 0,
    margin: 0,
    border: 'none',
    whiteSpace: 'pre'
  },
  Hv = 'recharts_measurement_span';
function fM(e, t) {
  var r = t.fontSize || '',
    n = t.fontFamily || '',
    i = t.fontWeight || '',
    a = t.fontStyle || '',
    o = t.letterSpacing || '',
    l = t.textTransform || '';
  return ''
    .concat(e, '|')
    .concat(r, '|')
    .concat(n, '|')
    .concat(i, '|')
    .concat(a, '|')
    .concat(o, '|')
    .concat(l);
}
var Vv = (e, t) => {
    try {
      var r = document.getElementById(Hv);
      (r ||
        ((r = document.createElement('span')),
        r.setAttribute('id', Hv),
        r.setAttribute('aria-hidden', 'true'),
        document.body.appendChild(r)),
        Object.assign(r.style, sM, t),
        (r.textContent = ''.concat(e)));
      var n = r.getBoundingClientRect();
      return { width: n.width, height: n.height };
    } catch {
      return { width: 0, height: 0 };
    }
  },
  Kn = function (t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (t == null || hi.isSsr) return { width: 0, height: 0 };
    if (!j0.enableCache) return Vv(t, r);
    var n = fM(t, r),
      i = Uv.get(n);
    if (i) return i;
    var a = Vv(t, r);
    return (Uv.set(n, a), a);
  },
  _0;
function Ba(e, t) {
  return pM(e) || hM(e, t) || vM(e, t) || dM();
}
function dM() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vM(e, t) {
  if (e) {
    if (typeof e == 'string') return Yv(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Yv(e, t)
          : void 0
    );
  }
}
function Yv(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function hM(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t === 0)) {
        if (Object(r) !== r) return;
        u = !1;
      } else for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function pM(e) {
  if (Array.isArray(e)) return e;
}
function mM(e, t, r) {
  return (
    (t = yM(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function yM(e) {
  var t = gM(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function gM(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var Gv = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/,
  qv = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/,
  bM = /^(px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q)$/,
  xM = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/,
  wM = {
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    pt: 96 / 72,
    pc: 96 / 6,
    in: 96,
    Q: 96 / (2.54 * 40),
    px: 1
  },
  AM = ['cm', 'mm', 'pt', 'pc', 'in', 'Q', 'px'];
function PM(e) {
  return AM.includes(e);
}
var tn = 'NaN';
function OM(e, t) {
  return e * wM[t];
}
class $e {
  static parse(t) {
    var r,
      n = (r = xM.exec(t)) !== null && r !== void 0 ? r : [],
      i = Ba(n, 3),
      a = i[1],
      o = i[2];
    return a == null ? $e.NaN : new $e(parseFloat(a), o ?? '');
  }
  constructor(t, r) {
    ((this.num = t),
      (this.unit = r),
      (this.num = t),
      (this.unit = r),
      bt(t) && (this.unit = ''),
      r !== '' && !bM.test(r) && ((this.num = NaN), (this.unit = '')),
      PM(r) && ((this.num = OM(t, r)), (this.unit = 'px')));
  }
  add(t) {
    return this.unit !== t.unit ? new $e(NaN, '') : new $e(this.num + t.num, this.unit);
  }
  subtract(t) {
    return this.unit !== t.unit ? new $e(NaN, '') : new $e(this.num - t.num, this.unit);
  }
  multiply(t) {
    return this.unit !== '' && t.unit !== '' && this.unit !== t.unit
      ? new $e(NaN, '')
      : new $e(this.num * t.num, this.unit || t.unit);
  }
  divide(t) {
    return this.unit !== '' && t.unit !== '' && this.unit !== t.unit
      ? new $e(NaN, '')
      : new $e(this.num / t.num, this.unit || t.unit);
  }
  toString() {
    return ''.concat(this.num).concat(this.unit);
  }
  isNaN() {
    return bt(this.num);
  }
}
_0 = $e;
mM($e, 'NaN', new _0(NaN, ''));
function T0(e) {
  if (e == null || e.includes(tn)) return tn;
  for (var t = e; t.includes('*') || t.includes('/');) {
    var r,
      n = (r = Gv.exec(t)) !== null && r !== void 0 ? r : [],
      i = Ba(n, 4),
      a = i[1],
      o = i[2],
      l = i[3],
      u = $e.parse(a ?? ''),
      c = $e.parse(l ?? ''),
      s = o === '*' ? u.multiply(c) : u.divide(c);
    if (s.isNaN()) return tn;
    t = t.replace(Gv, s.toString());
  }
  for (; t.includes('+') || /.-\d+(?:\.\d+)?/.test(t);) {
    var f,
      d = (f = qv.exec(t)) !== null && f !== void 0 ? f : [],
      h = Ba(d, 4),
      p = h[1],
      m = h[2],
      y = h[3],
      g = $e.parse(p ?? ''),
      x = $e.parse(y ?? ''),
      A = m === '+' ? g.add(x) : g.subtract(x);
    if (A.isNaN()) return tn;
    t = t.replace(qv, A.toString());
  }
  return t;
}
var Xv = /\(([^()]*)\)/;
function SM(e) {
  for (var t = e, r; (r = Xv.exec(t)) != null;) {
    var n = r,
      i = Ba(n, 2),
      a = i[1];
    t = t.replace(Xv, T0(a));
  }
  return t;
}
function EM(e) {
  var t = e.replace(/\s+/g, '');
  return ((t = SM(t)), (t = T0(t)), t);
}
function IM(e) {
  try {
    return EM(e);
  } catch {
    return tn;
  }
}
function kl(e) {
  var t = IM(e.slice(5, -1));
  return t === tn ? '' : t;
}
var kM = [
    'x',
    'y',
    'lineHeight',
    'capHeight',
    'fill',
    'scaleToFit',
    'textAnchor',
    'verticalAnchor'
  ],
  CM = ['dx', 'dy', 'angle', 'className', 'breakAll'];
function bu() {
  return (
    (bu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    bu.apply(null, arguments)
  );
}
function Zv(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = jM(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function jM(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Qv(e, t) {
  return DM(e) || MM(e, t) || TM(e, t) || _M();
}
function _M() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function TM(e, t) {
  if (e) {
    if (typeof e == 'string') return Jv(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Jv(e, t)
          : void 0
    );
  }
}
function Jv(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function MM(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t === 0)) {
        if (Object(r) !== r) return;
        u = !1;
      } else for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function DM(e) {
  if (Array.isArray(e)) return e;
}
var M0 = /[ \f\n\r\t\v\u2028\u2029]+/,
  D0 = (e) => {
    var t = e.children,
      r = e.breakAll,
      n = e.style;
    try {
      var i = [];
      ue(t) || (r ? (i = t.toString().split('')) : (i = t.toString().split(M0)));
      var a = i.map((l) => ({ word: l, width: Kn(l, n).width })),
        o = r ? 0 : Kn(' ', n).width;
      return { wordsWithComputedWidth: a, spaceWidth: o };
    } catch {
      return null;
    }
  };
function $0(e) {
  return e === 'start' || e === 'middle' || e === 'end' || e === 'inherit';
}
function $M(e) {
  return ue(e) || typeof e == 'string' || typeof e == 'number' || typeof e == 'boolean';
}
var N0 = (e, t, r, n) =>
    e.reduce((i, a) => {
      var o = a.word,
        l = a.width,
        u = i[i.length - 1];
      if (u && l != null && (t == null || n || u.width + l + r < Number(t)))
        (u.words.push(o), (u.width += l + r));
      else {
        var c = { words: [o], width: l };
        i.push(c);
      }
      return i;
    }, []),
  L0 = (e) => e.reduce((t, r) => (t.width > r.width ? t : r)),
  NM = '…',
  eh = (e, t, r, n, i, a, o, l) => {
    var u = e.slice(0, t),
      c = D0({ breakAll: r, style: n, children: u + NM });
    if (!c) return [!1, []];
    var s = N0(c.wordsWithComputedWidth, a, o, l),
      f = s.length > i || L0(s).width > Number(a);
    return [f, s];
  },
  LM = (e, t, r, n, i) => {
    var a = e.maxLines,
      o = e.children,
      l = e.style,
      u = e.breakAll,
      c = T(a),
      s = String(o),
      f = N0(t, n, r, i);
    if (!c || i) return f;
    var d = f.length > a || L0(f).width > Number(n);
    if (!d) return f;
    for (var h = 0, p = s.length - 1, m = 0, y; h <= p && m <= s.length - 1;) {
      var g = Math.floor((h + p) / 2),
        x = g - 1,
        A = eh(s, x, u, l, a, n, r, i),
        w = Qv(A, 2),
        P = w[0],
        b = w[1],
        S = eh(s, g, u, l, a, n, r, i),
        E = Qv(S, 1),
        C = E[0];
      if ((!P && !C && (h = g + 1), P && C && (p = g - 1), !P && C)) {
        y = b;
        break;
      }
      m++;
    }
    return y || f;
  },
  th = (e) => {
    var t = ue(e) ? [] : e.toString().split(M0);
    return [{ words: t, width: void 0 }];
  },
  RM = (e) => {
    var t = e.width,
      r = e.scaleToFit,
      n = e.children,
      i = e.style,
      a = e.breakAll,
      o = e.maxLines;
    if ((t || r) && !hi.isSsr) {
      var l,
        u,
        c = D0({ breakAll: a, children: n, style: i });
      if (c) {
        var s = c.wordsWithComputedWidth,
          f = c.spaceWidth;
        ((l = s), (u = f));
      } else return th(n);
      return LM({ breakAll: a, children: n, maxLines: o, style: i }, l, u, t, !!r);
    }
    return th(n);
  },
  R0 = '#808080',
  BM = {
    angle: 0,
    breakAll: !1,
    capHeight: '0.71em',
    fill: R0,
    lineHeight: '1em',
    scaleToFit: !1,
    textAnchor: 'start',
    verticalAnchor: 'end',
    x: 0,
    y: 0
  },
  $o = v.forwardRef((e, t) => {
    var r = ge(e, BM),
      n = r.x,
      i = r.y,
      a = r.lineHeight,
      o = r.capHeight,
      l = r.fill,
      u = r.scaleToFit,
      c = r.textAnchor,
      s = r.verticalAnchor,
      f = Zv(r, kM),
      d = v.useMemo(
        () =>
          RM({
            breakAll: f.breakAll,
            children: f.children,
            maxLines: f.maxLines,
            scaleToFit: u,
            style: f.style,
            width: f.width
          }),
        [f.breakAll, f.children, f.maxLines, u, f.style, f.width]
      ),
      h = f.dx,
      p = f.dy,
      m = f.angle,
      y = f.className,
      g = f.breakAll,
      x = Zv(f, CM);
    if (!ut(n) || !ut(i) || d.length === 0) return null;
    var A = Number(n) + (T(h) ? h : 0),
      w = Number(i) + (T(p) ? p : 0);
    if (!H(A) || !H(w)) return null;
    var P;
    switch (s) {
      case 'start':
        P = kl('calc('.concat(o, ')'));
        break;
      case 'middle':
        P = kl(
          'calc('
            .concat((d.length - 1) / 2, ' * -')
            .concat(a, ' + (')
            .concat(o, ' / 2))')
        );
        break;
      default:
        P = kl('calc('.concat(d.length - 1, ' * -').concat(a, ')'));
        break;
    }
    var b = [],
      S = d[0];
    if (u && S != null) {
      var E = S.width,
        C = f.width;
      b.push('scale('.concat(T(C) && T(E) ? C / E : 1, ')'));
    }
    return (
      m && b.push('rotate('.concat(m, ', ').concat(A, ', ').concat(w, ')')),
      b.length && (x.transform = b.join(' ')),
      v.createElement(
        'text',
        bu({}, Ye(x), {
          ref: t,
          x: A,
          y: w,
          className: Z('recharts-text', y),
          textAnchor: c,
          fill: l.includes('url') ? R0 : l
        }),
        d.map((k, j) => {
          var I = k.words.join(g ? '' : ' ');
          return v.createElement(
            'tspan',
            { x: A, dy: j === 0 ? P : a, key: ''.concat(I, '-').concat(j) },
            I
          );
        })
      )
    );
  });
$o.displayName = 'Text';
var zM = ['labelRef'],
  WM = ['content'];
function rh(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = FM(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function FM(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function nh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Sr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? nh(Object(r), !0).forEach(function (n) {
          KM(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : nh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function KM(e, t, r) {
  return (
    (t = UM(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function UM(e) {
  var t = HM(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function HM(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Ht() {
  return (
    (Ht = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Ht.apply(null, arguments)
  );
}
var B0 = v.createContext(null),
  z0 = (e) => {
    var t = e.x,
      r = e.y,
      n = e.upperWidth,
      i = e.lowerWidth,
      a = e.width,
      o = e.height,
      l = e.children,
      u = v.useMemo(
        () => ({ x: t, y: r, upperWidth: n, lowerWidth: i, width: a, height: o }),
        [t, r, n, i, a, o]
      );
    return v.createElement(B0.Provider, { value: u }, l);
  },
  W0 = () => {
    var e = v.useContext(B0),
      t = si();
    return e || (t ? Lu(t) : void 0);
  },
  F0 = v.createContext(null),
  VM = (e) => {
    var t = e.cx,
      r = e.cy,
      n = e.innerRadius,
      i = e.outerRadius,
      a = e.startAngle,
      o = e.endAngle,
      l = e.clockWise,
      u = e.children,
      c = v.useMemo(
        () => ({
          cx: t,
          cy: r,
          innerRadius: n,
          outerRadius: i,
          startAngle: a,
          endAngle: o,
          clockWise: l
        }),
        [t, r, n, i, a, o, l]
      );
    return v.createElement(F0.Provider, { value: c }, u);
  },
  YM = () => {
    var e = v.useContext(F0),
      t = M(Ly);
    return e || t;
  },
  GM = (e) => {
    var t = e.value,
      r = e.formatter,
      n = ue(e.children) ? t : e.children;
    return typeof r == 'function' ? r(n) : n;
  },
  No = (e) => e != null && typeof e == 'function',
  qM = (e, t) => {
    var r = je(t - e),
      n = Math.min(Math.abs(t - e), 360);
    return r * n;
  },
  XM = (e, t, r, n, i) => {
    var a = e.offset,
      o = e.className,
      l = i.cx,
      u = i.cy,
      c = i.innerRadius,
      s = i.outerRadius,
      f = i.startAngle,
      d = i.endAngle,
      h = i.clockWise,
      p = (c + s) / 2,
      m = qM(f, d),
      y = m >= 0 ? 1 : -1,
      g,
      x;
    switch (t) {
      case 'insideStart':
        ((g = f + y * a), (x = h));
        break;
      case 'insideEnd':
        ((g = d - y * a), (x = !h));
        break;
      case 'end':
        ((g = d + y * a), (x = h));
        break;
      default:
        throw new Error('Unsupported position '.concat(t));
    }
    x = m <= 0 ? x : !x;
    var A = xe(l, u, p, g),
      w = xe(l, u, p, g + (x ? 1 : -1) * 359),
      P = 'M'
        .concat(A.x, ',')
        .concat(
          A.y,
          `
    A`
        )
        .concat(p, ',')
        .concat(p, ',0,1,')
        .concat(
          x ? 0 : 1,
          `,
    `
        )
        .concat(w.x, ',')
        .concat(w.y),
      b = ue(e.id) ? Vn('recharts-radial-line-') : e.id;
    return v.createElement(
      'text',
      Ht({}, n, { dominantBaseline: 'central', className: Z('recharts-radial-bar-label', o) }),
      v.createElement('defs', null, v.createElement('path', { id: b, d: P })),
      v.createElement('textPath', { xlinkHref: '#'.concat(b) }, r)
    );
  },
  ZM = (e, t, r) => {
    var n = e.cx,
      i = e.cy,
      a = e.innerRadius,
      o = e.outerRadius,
      l = e.startAngle,
      u = e.endAngle,
      c = (l + u) / 2;
    if (r === 'outside') {
      var s = xe(n, i, o + t, c),
        f = s.x,
        d = s.y;
      return { x: f, y: d, textAnchor: f >= n ? 'start' : 'end', verticalAnchor: 'middle' };
    }
    if (r === 'center') return { x: n, y: i, textAnchor: 'middle', verticalAnchor: 'middle' };
    if (r === 'centerTop') return { x: n, y: i, textAnchor: 'middle', verticalAnchor: 'start' };
    if (r === 'centerBottom') return { x: n, y: i, textAnchor: 'middle', verticalAnchor: 'end' };
    var h = (a + o) / 2,
      p = xe(n, i, h, c),
      m = p.x,
      y = p.y;
    return { x: m, y, textAnchor: 'middle', verticalAnchor: 'middle' };
  },
  en = (e) => e != null && 'cx' in e && T(e.cx),
  QM = { angle: 0, offset: 5, zIndex: ye.label, position: 'middle', textBreakAll: !1 };
function JM(e) {
  if (!en(e)) return e;
  var t = e.cx,
    r = e.cy,
    n = e.outerRadius,
    i = n * 2;
  return { x: t - n, y: r - n, width: i, upperWidth: i, lowerWidth: i, height: i };
}
function ar(e) {
  var t,
    r,
    n = ge(e, QM),
    i = n.viewBox,
    a = n.parentViewBox,
    o = n.position,
    l = n.value,
    u = n.children,
    c = n.content,
    s = n.className,
    f = s === void 0 ? '' : s,
    d = n.textBreakAll,
    h = n.labelRef,
    p = YM(),
    m = W0(),
    y = o === 'center' ? m : (p ?? m),
    g,
    x,
    A;
  i == null ? (g = y) : en(i) ? (g = i) : (g = Lu(i));
  var w = JM(g);
  if (!g || (ue(l) && ue(u) && !v.isValidElement(c) && typeof c != 'function')) return null;
  var P = en(g) && (o === 'insideStart' || o === 'insideEnd' || o === 'end');
  if (en(g)) P || (A = ZM(g, n.offset, n.position));
  else if (w) {
    var b = pp({
      viewBox: w,
      position: o,
      offset: n.offset,
      parentViewBox: en(a) ? void 0 : a,
      clamp: !0
    });
    A = Sr(
      Sr(
        { x: b.x, y: b.y, textAnchor: b.horizontalAnchor, verticalAnchor: b.verticalAnchor },
        b.width !== void 0 ? { width: b.width } : {}
      ),
      b.height !== void 0 ? { height: b.height } : {}
    );
  }
  var S = Sr(
    Sr(
      Sr(
        Sr({}, ((t = A) === null || t === void 0 ? void 0 : t.x) !== void 0 ? { x: A.x } : {}),
        ((r = A) === null || r === void 0 ? void 0 : r.y) !== void 0 ? { y: A.y } : {}
      ),
      n
    ),
    {},
    { viewBox: g }
  );
  if (v.isValidElement(c)) {
    S.labelRef;
    var E = rh(S, zM);
    return v.cloneElement(c, E);
  }
  if (typeof c == 'function') {
    S.content;
    var C = rh(S, WM);
    if (((x = v.createElement(c, C)), v.isValidElement(x))) return x;
  } else x = GM(n);
  var k = Ye(n);
  return P && en(g)
    ? XM(n, o, x, k, g)
    : A == null
      ? null
      : v.createElement(
          Fe,
          { zIndex: n.zIndex },
          v.createElement(
            $o,
            Ht({ ref: h, className: Z('recharts-label', f) }, k, A, {
              textAnchor: $0(k.textAnchor) ? k.textAnchor : A.textAnchor,
              breakAll: d
            }),
            x
          )
        );
}
ar.displayName = 'Label';
var eD = (e, t, r) => {
  if (!e) return null;
  var n = { viewBox: t, labelRef: r };
  return e === !0
    ? v.createElement(ar, Ht({ key: 'label-implicit' }, n))
    : ut(e)
      ? v.createElement(ar, Ht({ key: 'label-implicit', value: e }, n))
      : v.isValidElement(e)
        ? e.type === ar
          ? v.cloneElement(e, Sr({ key: 'label-implicit' }, n))
          : v.createElement(ar, Ht({ key: 'label-implicit', content: e }, n))
        : No(e)
          ? v.createElement(ar, Ht({ key: 'label-implicit', content: e }, n))
          : e && typeof e == 'object'
            ? v.createElement(ar, Ht({}, e, { key: 'label-implicit' }, n))
            : null;
};
function K0(e) {
  var t = e.label,
    r = e.labelRef,
    n = W0();
  return eD(t, n, r) || null;
}
var tD = ['valueAccessor'],
  rD = ['dataKey', 'clockWise', 'id', 'textBreakAll', 'zIndex'];
function za() {
  return (
    (za = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    za.apply(null, arguments)
  );
}
function ih(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = nD(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function nD(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var iD = (e) => {
    var t = Array.isArray(e.value) ? e.value[e.value.length - 1] : e.value;
    if ($M(t)) return t;
  },
  U0 = v.createContext(void 0),
  ys = U0.Provider,
  H0 = v.createContext(void 0),
  aD = H0.Provider;
function oD() {
  return v.useContext(U0);
}
function lD() {
  return v.useContext(H0);
}
function Qi(e) {
  var t = e.valueAccessor,
    r = t === void 0 ? iD : t,
    n = ih(e, tD),
    i = n.dataKey;
  n.clockWise;
  var a = n.id,
    o = n.textBreakAll,
    l = n.zIndex,
    u = ih(n, rD),
    c = oD(),
    s = lD(),
    f = c || s;
  return !f || !f.length
    ? null
    : v.createElement(
        Fe,
        { zIndex: l ?? ye.label },
        v.createElement(
          fe,
          { className: 'recharts-label-list' },
          f.map((d, h) => {
            var p,
              m = ue(i) ? r(d, h) : X(d.payload, i),
              y = ue(a) ? {} : { id: ''.concat(a, '-').concat(h) };
            return v.createElement(
              ar,
              za({ key: 'label-'.concat(h) }, Ye(d), u, y, {
                fill: (p = n.fill) !== null && p !== void 0 ? p : d.fill,
                parentViewBox: d.parentViewBox,
                value: m,
                textBreakAll: o,
                viewBox: d.viewBox,
                index: h,
                zIndex: 0
              })
            );
          })
        )
      );
}
Qi.displayName = 'LabelList';
function Lo(e) {
  var t = e.label;
  return t
    ? t === !0
      ? v.createElement(Qi, { key: 'labelList-implicit' })
      : v.isValidElement(t) || No(t)
        ? v.createElement(Qi, { key: 'labelList-implicit', content: t })
        : typeof t == 'object'
          ? v.createElement(Qi, za({ key: 'labelList-implicit' }, t, { type: String(t.type) }))
          : null
    : null;
}
function xu() {
  return (
    (xu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    xu.apply(null, arguments)
  );
}
var V0 = (e) => {
    var t = e.cx,
      r = e.cy,
      n = e.r,
      i = e.className,
      a = Z('recharts-dot', i);
    return T(t) && T(r) && T(n)
      ? v.createElement('circle', xu({}, Ve(e), Fu(e), { className: a, cx: t, cy: r, r: n }))
      : null;
  },
  Y0 = (e) => e.graphicalItems.polarItems,
  uD = O([ve, gi], Kc),
  Ro = O([Y0, he, uD], Uc),
  cD = O([Ro], Hc),
  Bo = O([cD, pi], Vc),
  sD = O([Bo, he, Ro], Cg);
O([Bo, he, Ro], (e, t, r) =>
  r.length > 0
    ? e
        .flatMap((n) =>
          r.flatMap((i) => {
            var a,
              o = X(n, (a = t.dataKey) !== null && a !== void 0 ? a : i.dataKey);
            return { value: o, errorDomain: [] };
          })
        )
        .filter(Boolean)
    : (t == null ? void 0 : t.dataKey) != null
      ? e.map((n) => ({ value: X(n, t.dataKey), errorDomain: [] }))
      : e.map((n) => ({ value: n, errorDomain: [] }))
);
var ah = () => {},
  fD = O([Bo, he, Ro, Co, ve, kE], Zc),
  dD = O([he, qc, Xc, ah, fD, ah, q, ve], Qc),
  G0 = O([he, q, Bo, sD, yi, ve, dD], Jc),
  vD = O([G0, wn, yr], ts),
  hD = O([he, G0, vD, ve], ns);
O([yr, hD], By);
var pD = { radiusAxis: {}, angleAxis: {} },
  q0 = We({
    name: 'polarAxis',
    initialState: pD,
    reducers: {
      addRadiusAxis(e, t) {
        e.radiusAxis[t.payload.id] = Q(t.payload);
      },
      removeRadiusAxis(e, t) {
        delete e.radiusAxis[t.payload.id];
      },
      addAngleAxis(e, t) {
        e.angleAxis[t.payload.id] = Q(t.payload);
      },
      removeAngleAxis(e, t) {
        delete e.angleAxis[t.payload.id];
      }
    }
  }),
  zo = q0.actions;
zo.addRadiusAxis;
zo.removeRadiusAxis;
zo.addAngleAxis;
zo.removeAngleAxis;
var mD = q0.reducer;
function X0(e) {
  return e && typeof e == 'object' && 'className' in e && typeof e.className == 'string'
    ? e.className
    : '';
}
function oh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function lh(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? oh(Object(r), !0).forEach(function (n) {
          yD(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : oh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function yD(e, t, r) {
  return (
    (t = gD(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function gD(e) {
  var t = bD(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function bD(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var xD = (e, t) => t,
  gs = O([Y0, xD], (e, t) => e.filter((r) => r.type === 'pie').find((r) => r.id === t)),
  wD = [],
  bs = (e, t, r) => ((r == null ? void 0 : r.length) === 0 ? wD : r),
  Z0 = O([pi, gs, bs], (e, t, r) => {
    var n = e.chartData;
    if (t != null) {
      var i;
      if (
        ((t == null ? void 0 : t.data) != null && t.data.length > 0 ? (i = t.data) : (i = n),
        (!i || !i.length) &&
          r != null &&
          (i = r.map((a) => lh(lh({}, t.presentationProps), a.props))),
        i != null)
      )
        return i;
    }
  }),
  AD = O([Z0, gs, bs], (e, t, r) => {
    if (!(e == null || t == null))
      return e.map((n, i) => {
        var a,
          o = X(n, t.nameKey, t.name),
          l;
        return (
          r != null &&
          (a = r[i]) !== null &&
          a !== void 0 &&
          (a = a.props) !== null &&
          a !== void 0 &&
          a.fill
            ? (l = r[i].props.fill)
            : typeof n == 'object' && n != null && 'fill' in n
              ? (l = n.fill)
              : (l = t.fill),
          { value: vr(o, t.dataKey), dataKey: t.dataKey, color: l, payload: n, type: t.legendType }
        );
      });
  }),
  PD = O([Z0, gs, bs, Se], (e, t, r, n) => {
    if (!(t == null || e == null))
      return D$({ offset: n, pieSettings: t, displayedData: e, cells: r });
  }),
  Q0 = { exports: {} },
  ne = {};
/**
 * @license React
 * react-is.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var xs = Symbol.for('react.transitional.element'),
  ws = Symbol.for('react.portal'),
  Wo = Symbol.for('react.fragment'),
  Fo = Symbol.for('react.strict_mode'),
  Ko = Symbol.for('react.profiler'),
  Uo = Symbol.for('react.consumer'),
  Ho = Symbol.for('react.context'),
  Vo = Symbol.for('react.forward_ref'),
  Yo = Symbol.for('react.suspense'),
  Go = Symbol.for('react.suspense_list'),
  qo = Symbol.for('react.memo'),
  Xo = Symbol.for('react.lazy'),
  OD = Symbol.for('react.view_transition'),
  SD = Symbol.for('react.client.reference');
function vt(e) {
  if (typeof e == 'object' && e !== null) {
    var t = e.$$typeof;
    switch (t) {
      case xs:
        switch (((e = e.type), e)) {
          case Wo:
          case Ko:
          case Fo:
          case Yo:
          case Go:
          case OD:
            return e;
          default:
            switch (((e = e && e.$$typeof), e)) {
              case Ho:
              case Vo:
              case Xo:
              case qo:
                return e;
              case Uo:
                return e;
              default:
                return t;
            }
        }
      case ws:
        return t;
    }
  }
}
ne.ContextConsumer = Uo;
ne.ContextProvider = Ho;
ne.Element = xs;
ne.ForwardRef = Vo;
ne.Fragment = Wo;
ne.Lazy = Xo;
ne.Memo = qo;
ne.Portal = ws;
ne.Profiler = Ko;
ne.StrictMode = Fo;
ne.Suspense = Yo;
ne.SuspenseList = Go;
ne.isContextConsumer = function (e) {
  return vt(e) === Uo;
};
ne.isContextProvider = function (e) {
  return vt(e) === Ho;
};
ne.isElement = function (e) {
  return typeof e == 'object' && e !== null && e.$$typeof === xs;
};
ne.isForwardRef = function (e) {
  return vt(e) === Vo;
};
ne.isFragment = function (e) {
  return vt(e) === Wo;
};
ne.isLazy = function (e) {
  return vt(e) === Xo;
};
ne.isMemo = function (e) {
  return vt(e) === qo;
};
ne.isPortal = function (e) {
  return vt(e) === ws;
};
ne.isProfiler = function (e) {
  return vt(e) === Ko;
};
ne.isStrictMode = function (e) {
  return vt(e) === Fo;
};
ne.isSuspense = function (e) {
  return vt(e) === Yo;
};
ne.isSuspenseList = function (e) {
  return vt(e) === Go;
};
ne.isValidElementType = function (e) {
  return (
    typeof e == 'string' ||
    typeof e == 'function' ||
    e === Wo ||
    e === Ko ||
    e === Fo ||
    e === Yo ||
    e === Go ||
    (typeof e == 'object' &&
      e !== null &&
      (e.$$typeof === Xo ||
        e.$$typeof === qo ||
        e.$$typeof === Ho ||
        e.$$typeof === Uo ||
        e.$$typeof === Vo ||
        e.$$typeof === SD ||
        e.getModuleId !== void 0))
  );
};
ne.typeOf = vt;
Q0.exports = ne;
var ED = Q0.exports,
  uh = (e) => (typeof e == 'string' ? e : e ? e.displayName || e.name || 'Component' : ''),
  ch = null,
  Cl = null,
  J0 = (e) => {
    if (e === ch && Array.isArray(Cl)) return Cl;
    var t = [];
    return (
      v.Children.forEach(e, (r) => {
        ue(r) || (ED.isFragment(r) ? (t = t.concat(J0(r.props.children))) : t.push(r));
      }),
      (Cl = t),
      (ch = e),
      t
    );
  };
function As(e, t) {
  var r = [],
    n = [];
  return (
    Array.isArray(t) ? (n = t.map((i) => uh(i))) : (n = [uh(t)]),
    J0(e).forEach((i) => {
      var a = Mt(i, 'type.displayName') || Mt(i, 'type.name');
      a && n.indexOf(a) !== -1 && r.push(i);
    }),
    r
  );
}
var Ps = (e) => (e && typeof e == 'object' && 'clipDot' in e ? !!e.clipDot : !0);
function sh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function fh(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? sh(Object(r), !0).forEach(function (n) {
          ID(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : sh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function ID(e, t, r) {
  return (
    (t = kD(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function kD(e) {
  var t = CD(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function CD(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function eb(e, t) {
  return fh(fh({}, t), e);
}
function jD(e) {
  return v.isValidElement(e) ? e.props : e;
}
function _D(e, t) {
  return v.cloneElement(e, eb(jD(e), t));
}
function TD(e) {
  if ('index' in e) {
    var t = e.index;
    return typeof t == 'number' || typeof t == 'string' ? t : void 0;
  }
}
function MD(e) {
  return 'isActive' in e && e.isActive === !0;
}
function Zo(e) {
  var t = e.option,
    r = e.DefaultShape,
    n = e.shapeProps,
    i = e.activeClassName,
    a = i === void 0 ? 'recharts-active-shape' : i,
    o = e.inActiveClassName,
    l = o === void 0 ? 'recharts-shape' : o,
    u = TD(n),
    c;
  return (
    v.isValidElement(t)
      ? (c = _D(t, n))
      : t === r
        ? (c = v.createElement(r, n))
        : typeof t == 'function'
          ? (c = t(n, u))
          : typeof t == 'object'
            ? (c = v.createElement(r, eb(t, n)))
            : (c = v.createElement(r, n)),
    MD(n) ? v.createElement(fe, { className: a }, c) : v.createElement(fe, { className: l }, c)
  );
}
var Os = (e, t, r) => {
    var n = ee();
    return (i, a) => (o) => {
      (e == null || e(i, a, o),
        n(
          r0({
            activeIndex: String(a),
            activeDataKey: t,
            activeCoordinate: i.tooltipPosition,
            activeGraphicalItemId: r
          })
        ));
    };
  },
  Ss = (e) => {
    var t = ee();
    return (r, n) => (i) => {
      (e == null || e(r, n, i), t(Uj()));
    };
  },
  Es = (e, t, r) => {
    var n = ee();
    return (i, a) => (o) => {
      (e == null || e(i, a, o),
        n(
          Hj({
            activeIndex: String(a),
            activeDataKey: t,
            activeCoordinate: i.tooltipPosition,
            activeGraphicalItemId: r
          })
        ));
    };
  };
function Qo(e) {
  var t = e.tooltipEntrySettings,
    r = ee(),
    n = Ee(),
    i = v.useRef(null);
  return (
    v.useLayoutEffect(() => {
      n ||
        (i.current === null ? r(zj(t)) : i.current !== t && r(Wj({ prev: i.current, next: t })),
        (i.current = t));
    }, [t, r, n]),
    v.useLayoutEffect(
      () => () => {
        i.current && (r(Fj(i.current)), (i.current = null));
      },
      [r]
    ),
    null
  );
}
function Is(e) {
  var t = e.legendPayload,
    r = ee(),
    n = Ee(),
    i = v.useRef(null);
  return (
    v.useLayoutEffect(() => {
      n ||
        (i.current === null ? r(ty(t)) : i.current !== t && r(ry({ prev: i.current, next: t })),
        (i.current = t));
    }, [r, n, t]),
    v.useLayoutEffect(
      () => () => {
        i.current && (r(ny(i.current)), (i.current = null));
      },
      [r]
    ),
    null
  );
}
function DD(e) {
  var t = e.legendPayload,
    r = ee(),
    n = M(q),
    i = v.useRef(null);
  return (
    v.useLayoutEffect(() => {
      (n !== 'centric' && n !== 'radial') ||
        (i.current === null ? r(ty(t)) : i.current !== t && r(ry({ prev: i.current, next: t })),
        (i.current = t));
    }, [r, n, t]),
    v.useLayoutEffect(
      () => () => {
        i.current && (r(ny(i.current)), (i.current = null));
      },
      [r]
    ),
    null
  );
}
function $D(e, t) {
  return BD(e) || RD(e, t) || LD(e, t) || ND();
}
function ND() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function LD(e, t) {
  if (e) {
    if (typeof e == 'string') return dh(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? dh(e, t)
          : void 0
    );
  }
}
function dh(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function RD(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function BD(e) {
  if (Array.isArray(e)) return e;
}
var Jo = 'index',
  ks = 'append';
function Cs(e, t) {
  var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [],
    n = [];
  for (var i of r) n.push({ status: 'removed', prev: i });
  for (var a = 0; a < t.length; a++) {
    var o = e[a],
      l = t[a];
    o != null
      ? n.push({ status: 'matched', prev: o, next: l })
      : n.push({ status: 'added', next: l });
  }
  return n;
}
function zD(e, t) {
  var r = e.length / t.length,
    n = t.map((i, a) => e[Math.floor(a * r)]);
  return Cs(n, t);
}
function WD(e, t) {
  var r = t.map((n, i) => e[i]);
  return Cs(r, t);
}
function FD(e, t) {
  for (var r = new Map(), n = 0; n < e.length; n++) {
    var i = e[n];
    if (i != null) {
      var a = t(i, n);
      a != null && !r.has(a) && r.set(a, i);
    }
  }
  return r;
}
function KD(e, t, r) {
  var n = FD(e, r),
    i = new Set(),
    a = t.map((f, d) => {
      var h = r(f, d);
      if (h != null) {
        var p = n.get(h);
        if (p !== void 0) return (i.add(h), p);
      }
    }),
    o = [];
  for (var l of n) {
    var u = $D(l, 2),
      c = u[0],
      s = u[1];
    i.has(c) || o.push(s);
  }
  return Cs(a, t, o);
}
function wu(e, t, r) {
  return t == null
    ? null
    : e == null
      ? t.map((n) => ({ status: 'added', next: n }))
      : r === Jo
        ? zD(e, t)
        : r === ks
          ? WD(e, t)
          : KD(e, t, r);
}
function tb(e, t) {
  var r = v.useRef(e),
    n = v.useRef(t.current),
    i = v.useRef(!0);
  r.current !== e && ((r.current = e), (n.current = t.current), (i.current = !1));
  var a = v.useCallback(
    function (o, l) {
      var u = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (l === 0) {
        i.current = !0;
        return;
      }
      (l === 1 && (n.current = o), l > 0 && i.current && u && (t.current = o));
    },
    [t]
  );
  return { startValue: n.current, syncStepValue: a };
}
function UD(e, t) {
  return GD(e) || YD(e, t) || VD(e, t) || HD();
}
function HD() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function VD(e, t) {
  if (e) {
    if (typeof e == 'string') return vh(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? vh(e, t)
          : void 0
    );
  }
}
function vh(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function YD(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function GD(e) {
  if (Array.isArray(e)) return e;
}
function el(e, t) {
  var r = v.useState(!1),
    n = UD(r, 2),
    i = n[0],
    a = n[1],
    o = v.useCallback(() => {
      (typeof e == 'function' && e(), a(!0));
    }, [e]),
    l = v.useCallback(() => {
      (typeof t == 'function' && t(), a(!1));
    }, [t]);
  return { isAnimating: i, handleAnimationStart: o, handleAnimationEnd: l };
}
function tl(e) {
  var t,
    r = e.animationInput,
    n = e.animationIdPrefix,
    i = e.items,
    a = e.previousItemsRef,
    o = e.isAnimationActive,
    l = e.animationBegin,
    u = e.animationDuration,
    c = e.animationEasing,
    s = e.onAnimationStart,
    f = e.onAnimationEnd,
    d = e.animationInterpolateFn,
    h = e.animationMatchBy,
    p = e.shouldUpdatePreviousRef,
    m = e.children,
    y = e.layout,
    g = sy(r, n),
    x = tb(g, a),
    A = (t = x.startValue) !== null && t !== void 0 ? t : null,
    w = wu(A, i, h ?? Jo);
  return v.createElement(
    cy,
    {
      animationId: g,
      begin: l,
      duration: u,
      isActive: o,
      easing: c,
      onAnimationEnd: f,
      onAnimationStart: s,
      key: g
    },
    (P) => {
      var b = A == null,
        S = i == null ? i : d(w, P, y),
        E = p ? p(P) : P > 0;
      return (x.syncStepValue(S, P, E), S == null ? null : m(S, P, b));
    }
  );
}
var jl;
function qD(e, t) {
  return JD(e) || QD(e, t) || ZD(e, t) || XD();
}
function XD() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ZD(e, t) {
  if (e) {
    if (typeof e == 'string') return hh(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? hh(e, t)
          : void 0
    );
  }
}
function hh(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function QD(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function JD(e) {
  if (Array.isArray(e)) return e;
}
var e$ = () => {
    var e = v.useState(() => Vn('uid-')),
      t = qD(e, 1),
      r = t[0];
    return r;
  },
  rb = (jl = ax.useId) !== null && jl !== void 0 ? jl : e$;
function t$(e, t) {
  var r = rb();
  return t || (e ? ''.concat(e, '-').concat(r) : r);
}
var r$ = v.createContext(void 0),
  rl = (e) => {
    var t = e.id,
      r = e.type,
      n = e.children,
      i = t$('recharts-'.concat(r), t);
    return v.createElement(r$.Provider, { value: i }, n(i));
  },
  n$ = { cartesianItems: [], polarItems: [] },
  nb = We({
    name: 'graphicalItems',
    initialState: n$,
    reducers: {
      addCartesianGraphicalItem: {
        reducer(e, t) {
          e.cartesianItems.push(Q(t.payload));
        },
        prepare: oe()
      },
      replaceCartesianGraphicalItem: {
        reducer(e, t) {
          var r = t.payload,
            n = r.prev,
            i = r.next,
            a = ot(e).cartesianItems.indexOf(Q(n));
          a > -1 && (e.cartesianItems[a] = Q(i));
        },
        prepare: oe()
      },
      removeCartesianGraphicalItem: {
        reducer(e, t) {
          var r = ot(e).cartesianItems.indexOf(Q(t.payload));
          r > -1 && e.cartesianItems.splice(r, 1);
        },
        prepare: oe()
      },
      addPolarGraphicalItem: {
        reducer(e, t) {
          e.polarItems.push(Q(t.payload));
        },
        prepare: oe()
      },
      removePolarGraphicalItem: {
        reducer(e, t) {
          var r = ot(e).polarItems.indexOf(Q(t.payload));
          r > -1 && e.polarItems.splice(r, 1);
        },
        prepare: oe()
      },
      replacePolarGraphicalItem: {
        reducer(e, t) {
          var r = t.payload,
            n = r.prev,
            i = r.next,
            a = ot(e).polarItems.indexOf(Q(n));
          a > -1 && (e.polarItems[a] = Q(i));
        },
        prepare: oe()
      }
    }
  }),
  Sn = nb.actions,
  i$ = Sn.addCartesianGraphicalItem,
  a$ = Sn.replaceCartesianGraphicalItem,
  o$ = Sn.removeCartesianGraphicalItem,
  l$ = Sn.addPolarGraphicalItem,
  u$ = Sn.removePolarGraphicalItem,
  c$ = Sn.replacePolarGraphicalItem,
  s$ = nb.reducer,
  f$ = (e) => {
    var t = ee(),
      r = v.useRef(null);
    return (
      v.useLayoutEffect(() => {
        (r.current === null ? t(i$(e)) : r.current !== e && t(a$({ prev: r.current, next: e })),
          (r.current = e));
      }, [t, e]),
      v.useLayoutEffect(
        () => () => {
          r.current && (t(o$(r.current)), (r.current = null));
        },
        [t]
      ),
      null
    );
  },
  js = v.memo(f$),
  d$ = (e) => {
    var t = ee(),
      r = v.useRef(null);
    return (
      v.useLayoutEffect(() => {
        (r.current === null ? t(l$(e)) : r.current !== e && t(c$({ prev: r.current, next: e })),
          (r.current = e));
      }, [t, e]),
      v.useLayoutEffect(
        () => () => {
          r.current && (t(u$(r.current)), (r.current = null));
        },
        [t]
      ),
      null
    );
  },
  v$ = v.memo(d$),
  h$ = ['key'],
  p$ = ['onMouseEnter', 'onClick', 'onMouseLeave'],
  m$ = ['id'],
  y$ = ['id'];
function zr() {
  return (
    (zr = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    zr.apply(null, arguments)
  );
}
function nl(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = g$(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function g$(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function ph(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ce(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? ph(Object(r), !0).forEach(function (n) {
          b$(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : ph(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function b$(e, t, r) {
  return (
    (t = x$(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function x$(e) {
  var t = w$(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function w$(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var ib = py;
function A$(e) {
  var t = v.useMemo(() => As(e.children, Do), [e.children]),
    r = M((n) => AD(n, e.id, t));
  return r == null ? null : v.createElement(DD, { legendPayload: r });
}
function P$(e) {
  if (!(e == null || typeof e == 'boolean' || typeof e == 'function')) {
    if (v.isValidElement(e)) {
      var t,
        r = (t = e.props) === null || t === void 0 ? void 0 : t.fill;
      return typeof r == 'string' ? r : void 0;
    }
    var n = e.fill;
    return typeof n == 'string' ? n : void 0;
  }
}
var O$ = v.memo((e) => {
    var t = e.dataKey,
      r = e.nameKey,
      n = e.sectors,
      i = e.stroke,
      a = e.strokeWidth,
      o = e.fill,
      l = e.name,
      u = e.hide,
      c = e.tooltipType,
      s = e.formatter,
      f = e.id,
      d = e.activeShape,
      h = P$(d),
      p = n.map((y) => {
        var g = y.tooltipPayload;
        return h == null || g == null ? g : g.map((x) => ce(ce({}, x), {}, { color: h, fill: h }));
      }),
      m = {
        dataDefinedOnItem: p,
        getPosition: (y) => {
          var g;
          return (g = n[Number(y)]) === null || g === void 0 ? void 0 : g.tooltipPosition;
        },
        settings: {
          stroke: i,
          strokeWidth: a,
          fill: o,
          dataKey: t,
          nameKey: r,
          name: vr(l, t),
          hide: u,
          type: c,
          color: o,
          unit: '',
          formatter: s,
          graphicalItemId: f
        }
      };
    return v.createElement(Qo, { tooltipEntrySettings: m });
  }),
  S$ = (e, t) => (e > t ? 'start' : e < t ? 'end' : 'middle'),
  E$ = (e, t, r) => Be(typeof t == 'function' ? t(e) : t, r, r * 0.8),
  I$ = (e, t, r) => {
    var n = t.top,
      i = t.left,
      a = t.width,
      o = t.height,
      l = dy(a, o),
      u = i + Be(e.cx, a, a / 2),
      c = n + Be(e.cy, o, o / 2),
      s = Be(e.innerRadius, l, 0),
      f = E$(r, e.outerRadius, l),
      d = e.maxRadius || Math.sqrt(a * a + o * o) / 2;
    return { cx: u, cy: c, innerRadius: s, outerRadius: f, maxRadius: d };
  },
  k$ = (e, t) => {
    var r = je(t - e),
      n = Math.min(Math.abs(t - e), 360);
    return r * n;
  },
  C$ = (e, t) => {
    if (v.isValidElement(e)) return v.cloneElement(e, t);
    if (typeof e == 'function') return e(t);
    var r = Z('recharts-pie-label-line', typeof e != 'boolean' ? e.className : '');
    t.key;
    var n = nl(t, h$);
    return v.createElement(nn, zr({}, n, { type: 'linear', className: r }));
  },
  j$ = (e, t, r) => {
    if (v.isValidElement(e)) return v.cloneElement(e, t);
    var n = r;
    if (typeof e == 'function' && ((n = e(t)), v.isValidElement(n))) return n;
    var i = Z('recharts-pie-label-text', X0(e));
    return v.createElement($o, zr({}, t, { alignmentBaseline: 'middle', className: i }), n);
  };
function _$(e) {
  var t = e.sectors,
    r = e.props,
    n = e.showLabels,
    i = r.label,
    a = r.labelLine,
    o = r.dataKey;
  if (!n || !i || !t) return null;
  var l = Ve(r),
    u = Dr(i),
    c = Dr(a),
    s =
      (typeof i == 'object' &&
        'offsetRadius' in i &&
        typeof i.offsetRadius == 'number' &&
        i.offsetRadius) ||
      20,
    f = t.map((d, h) => {
      var p = (d.startAngle + d.endAngle) / 2,
        m = xe(d.cx, d.cy, d.outerRadius + s, p),
        y = ce(
          ce(ce(ce({}, l), d), {}, { stroke: 'none' }, u),
          {},
          { index: h, textAnchor: S$(m.x, d.cx) },
          m
        ),
        g = ce(
          ce(ce(ce({}, l), d), {}, { fill: 'none', stroke: d.fill }, c),
          {},
          { index: h, points: [xe(d.cx, d.cy, d.outerRadius, p), m], key: 'line' }
        );
      return v.createElement(
        Fe,
        {
          zIndex: ye.label,
          key: 'label-'
            .concat(d.startAngle, '-')
            .concat(d.endAngle, '-')
            .concat(d.midAngle, '-')
            .concat(h)
        },
        v.createElement(fe, null, a && C$(a, g), j$(i, y, X(d, o)))
      );
    });
  return v.createElement(fe, { className: 'recharts-pie-labels' }, f);
}
function T$(e) {
  var t = e.sectors,
    r = e.props,
    n = e.showLabels,
    i = r.label;
  return typeof i == 'object' && i != null && 'position' in i
    ? v.createElement(Lo, { label: i })
    : v.createElement(_$, { sectors: t, props: r, showLabels: n });
}
function M$(e) {
  var t = e.sectors,
    r = e.activeShape,
    n = e.inactiveShape,
    i = e.allOtherPieProps,
    a = e.shape,
    o = e.id,
    l = e.animationElapsedTime,
    u = e.isAnimating,
    c = e.isEntrance,
    s = M(sr),
    f = M(fs),
    d = M(g0),
    h = i.onMouseEnter,
    p = i.onClick,
    m = i.onMouseLeave,
    y = nl(i, p$),
    g = Os(h, i.dataKey, o),
    x = Ss(m),
    A = Es(p, i.dataKey, o);
  return t == null || t.length === 0
    ? null
    : v.createElement(
        v.Fragment,
        null,
        t.map((w, P) => {
          if (
            (w == null ? void 0 : w.startAngle) === 0 &&
            (w == null ? void 0 : w.endAngle) === 0 &&
            t.length !== 1
          )
            return null;
          var b = d == null || d === o,
            S = String(P) === s && (f == null || i.dataKey === f) && b,
            E = s ? n : null,
            C = r && S ? r : E,
            k = ce(
              ce({}, w),
              {},
              {
                stroke: w.stroke,
                tabIndex: -1,
                index: P,
                isActive: S,
                animationElapsedTime: l,
                isAnimating: u,
                isEntrance: c,
                [Ym]: P,
                [Gm]: o
              }
            );
          return v.createElement(
            fe,
            zr(
              {
                key: 'sector-'
                  .concat(w == null ? void 0 : w.startAngle, '-')
                  .concat(w == null ? void 0 : w.endAngle, '-')
                  .concat(w.midAngle, '-')
                  .concat(P),
                tabIndex: -1,
                className: 'recharts-pie-sector'
              },
              oi(y, w, P),
              { onMouseEnter: g(w, P), onMouseLeave: x(w, P), onClick: A(w, P) }
            ),
            v.createElement(Zo, { option: C ?? a, DefaultShape: ib, shapeProps: k })
          );
        })
      );
}
function D$(e) {
  var t,
    r = e.pieSettings,
    n = e.displayedData,
    i = e.cells,
    a = e.offset,
    o = r.cornerRadius,
    l = r.startAngle,
    u = r.endAngle,
    c = r.dataKey,
    s = r.nameKey,
    f = r.tooltipType,
    d = Math.abs(r.minAngle),
    h = k$(l, u),
    p = Math.abs(h),
    m = n.length <= 1 ? 0 : (t = r.paddingAngle) !== null && t !== void 0 ? t : 0,
    y = n.filter((E) => X(E, c, 0) !== 0).length,
    g = (p >= 360 ? y : y - 1) * m,
    x = n.reduce((E, C) => {
      var k = X(C, c, 0);
      return E + (T(k) ? k : 0);
    }, 0),
    A =
      d > 0 &&
      x > 0 &&
      n.some((E) => {
        var C = X(E, c, 0),
          k = (T(C) ? C : 0) / x;
        return C !== 0 && k * p < d;
      }),
    w = A ? d : 0,
    P = p - y * w - g,
    b;
  if (x > 0) {
    var S;
    b = n.map((E, C) => {
      var k = X(E, c, 0),
        j = X(E, s, C),
        I = I$(r, a, E),
        R = (T(k) ? k : 0) / x,
        D,
        $ = ce(ce({}, E), i && i[C] && i[C].props),
        z = $ != null && 'fill' in $ && typeof $.fill == 'string' ? $.fill : r.fill;
      C ? (D = S.endAngle + je(h) * m * (k !== 0 ? 1 : 0)) : (D = l);
      var W = D + je(h) * ((k !== 0 ? w : 0) + R * P),
        B = (D + W) / 2,
        Y = (I.innerRadius + I.outerRadius) / 2,
        K = [
          {
            name: j,
            value: k,
            payload: $,
            dataKey: c,
            type: f,
            color: z,
            fill: z,
            graphicalItemId: r.id
          }
        ],
        pe = xe(I.cx, I.cy, Y, B);
      return (
        (S = ce(
          ce(
            ce(
              ce({}, r.presentationProps),
              {},
              {
                percent: R,
                cornerRadius: typeof o == 'string' ? parseFloat(o) : o,
                name: j,
                tooltipPayload: K,
                midAngle: B,
                middleRadius: Y,
                tooltipPosition: pe
              },
              $
            ),
            I
          ),
          {},
          {
            value: k,
            dataKey: c,
            startAngle: D,
            endAngle: W,
            payload: $,
            paddingAngle: k !== 0 ? je(h) * m : 0
          }
        )),
        S
      );
    });
  }
  return b;
}
function $$(e) {
  var t = e.showLabels,
    r = e.sectors,
    n = e.children,
    i = v.useMemo(
      () =>
        !t || !r
          ? []
          : r.map((a) => ({
              value: a.value,
              payload: a.payload,
              clockWise: !1,
              parentViewBox: void 0,
              viewBox: {
                cx: a.cx,
                cy: a.cy,
                innerRadius: a.innerRadius,
                outerRadius: a.outerRadius,
                startAngle: a.startAngle,
                endAngle: a.endAngle,
                clockWise: !1
              },
              fill: a.fill
            })),
      [r, t]
    );
  return v.createElement(aD, { value: t ? i : void 0 }, n);
}
var N$ = (e, t) => {
  if (e == null) return [];
  var r = [],
    n = e.find((a) => a.status !== 'removed'),
    i = n ? n.next.startAngle : 0;
  return (
    e.forEach((a, o) => {
      if (a.status !== 'removed') {
        var l = o > 0 ? Mt(a.next, 'paddingAngle', 0) : 0;
        if (a.status === 'matched') {
          var u = ae(a.prev.endAngle - a.prev.startAngle, a.next.endAngle - a.next.startAngle, t),
            c = ce(ce({}, a.next), {}, { startAngle: i + l, endAngle: i + u + l });
          (r.push(c), (i = c.endAngle));
        } else {
          var s = ae(0, a.next.endAngle - a.next.startAngle, t),
            f = ce(ce({}, a.next), {}, { startAngle: i + l, endAngle: i + s + l });
          (r.push(f), (i = f.endAngle));
        }
      }
    }),
    r
  );
};
function L$(e) {
  var t,
    r,
    n,
    i,
    a = e.props,
    o = e.previousSectorsRef,
    l = e.id,
    u = a.sectors,
    c = a.activeShape,
    s = a.inactiveShape,
    f = a.animationInterpolateFn,
    d = el(a.onAnimationStart, a.onAnimationEnd),
    h = d.isAnimating,
    p = d.handleAnimationStart,
    m = d.handleAnimationEnd,
    y = zO();
  if (y == null) return null;
  var g = u[0];
  return v.createElement(
    $$,
    { showLabels: !h, sectors: u },
    v.createElement(
      tl,
      {
        animationInput: a,
        animationIdPrefix: 'recharts-pie-',
        items: u,
        previousItemsRef: o,
        isAnimationActive: a.isAnimationActive,
        animationBegin: a.animationBegin,
        animationDuration: a.animationDuration,
        animationEasing: a.animationEasing,
        onAnimationStart: p,
        onAnimationEnd: m,
        animationInterpolateFn: f,
        animationMatchBy: a.animationMatchBy,
        layout: y
      },
      (x, A, w) =>
        v.createElement(
          fe,
          null,
          v.createElement(M$, {
            sectors: x,
            activeShape: c,
            inactiveShape: s,
            allOtherPieProps: a,
            shape: a.shape,
            id: l,
            animationElapsedTime: A,
            isAnimating: h || A < 1,
            isEntrance: w
          })
        )
    ),
    v.createElement(T$, { showLabels: !h, sectors: u, props: a }),
    v.createElement(
      VM,
      {
        cx: (t = g == null ? void 0 : g.cx) !== null && t !== void 0 ? t : 0,
        cy: (r = g == null ? void 0 : g.cy) !== null && r !== void 0 ? r : 0,
        innerRadius: (n = g == null ? void 0 : g.innerRadius) !== null && n !== void 0 ? n : 0,
        outerRadius: (i = g == null ? void 0 : g.outerRadius) !== null && i !== void 0 ? i : 0,
        startAngle: a.startAngle,
        endAngle: a.endAngle,
        clockWise: !1
      },
      a.children
    )
  );
}
var R$ = {
  animationBegin: 400,
  animationDuration: 1500,
  animationEasing: 'ease',
  animationInterpolateFn: N$,
  animationMatchBy: ks,
  cx: '50%',
  cy: '50%',
  dataKey: 'value',
  endAngle: 360,
  fill: '#808080',
  hide: !1,
  innerRadius: 0,
  isAnimationActive: 'auto',
  label: !1,
  labelLine: !0,
  legendType: 'rect',
  minAngle: 0,
  nameKey: 'name',
  outerRadius: '80%',
  paddingAngle: 0,
  rootTabIndex: 0,
  shape: ib,
  startAngle: 0,
  stroke: '#fff',
  zIndex: ye.area
};
function B$(e) {
  var t = e.id,
    r = nl(e, m$),
    n = e.hide,
    i = e.className,
    a = e.rootTabIndex,
    o = v.useMemo(() => As(e.children, Do), [e.children]),
    l = M((s) => PD(s, t, o)),
    u = v.useRef(null),
    c = Z('recharts-pie', i);
  return n || l == null
    ? ((u.current = null), v.createElement(fe, { tabIndex: a, className: c }))
    : v.createElement(
        Fe,
        { zIndex: e.zIndex },
        v.createElement(O$, {
          dataKey: e.dataKey,
          nameKey: e.nameKey,
          sectors: l,
          stroke: e.stroke,
          strokeWidth: e.strokeWidth,
          fill: e.fill,
          name: e.name,
          hide: e.hide,
          tooltipType: e.tooltipType,
          formatter: e.formatter,
          id: t,
          activeShape: e.activeShape
        }),
        v.createElement(
          fe,
          { tabIndex: a, className: c },
          v.createElement(L$, {
            props: ce(ce({}, r), {}, { sectors: l }),
            previousSectorsRef: u,
            id: t
          })
        )
      );
}
function z$(e) {
  var t = ge(e, R$),
    r = t.id,
    n = nl(t, y$),
    i = Ve(n);
  return v.createElement(rl, { id: r, type: 'pie' }, (a) =>
    v.createElement(
      v.Fragment,
      null,
      v.createElement(v$, {
        type: 'pie',
        id: a,
        data: n.data,
        dataKey: n.dataKey,
        hide: n.hide,
        angleAxisId: 0,
        radiusAxisId: 0,
        name: n.name,
        nameKey: n.nameKey,
        tooltipType: n.tooltipType,
        legendType: n.legendType,
        fill: n.fill,
        cx: n.cx,
        cy: n.cy,
        startAngle: n.startAngle,
        endAngle: n.endAngle,
        paddingAngle: n.paddingAngle,
        minAngle: n.minAngle,
        innerRadius: n.innerRadius,
        outerRadius: n.outerRadius,
        cornerRadius: n.cornerRadius,
        presentationProps: i,
        maxRadius: t.maxRadius
      }),
      v.createElement(A$, zr({}, n, { id: a })),
      v.createElement(B$, zr({}, n, { id: a }))
    )
  );
}
var W$ = z$;
W$.displayName = 'Pie';
var F$ = ['points'];
function mh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function _l(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? mh(Object(r), !0).forEach(function (n) {
          K$(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : mh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function K$(e, t, r) {
  return (
    (t = U$(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function U$(e) {
  var t = H$(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function H$(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Wa() {
  return (
    (Wa = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Wa.apply(null, arguments)
  );
}
function V$(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = Y$(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function Y$(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function G$(e) {
  var t = e.option,
    r = e.dotProps,
    n = e.className;
  if (v.isValidElement(t)) return v.cloneElement(t, r);
  if (typeof t == 'function') return t(r);
  var i = Z(n, typeof t != 'boolean' ? t.className : ''),
    a = r ?? {};
  a.points;
  var o = V$(a, F$);
  return v.createElement(V0, Wa({}, o, { className: i }));
}
function q$(e, t) {
  return e == null ? !1 : t ? !0 : e.length === 1;
}
function ab(e) {
  var t = e.points,
    r = e.dot,
    n = e.className,
    i = e.dotClassName,
    a = e.dataKey,
    o = e.baseProps,
    l = e.needClip,
    u = e.clipPathId,
    c = e.zIndex,
    s = c === void 0 ? ye.scatter : c;
  if (!q$(t, r)) return null;
  var f = Ps(r),
    d = Ix(r),
    h = t.map((m, y) => {
      var g,
        x,
        A = _l(
          _l(_l({ r: 3 }, o), d),
          {},
          {
            index: y,
            cx: (g = m.x) !== null && g !== void 0 ? g : void 0,
            cy: (x = m.y) !== null && x !== void 0 ? x : void 0,
            dataKey: a,
            value: m.value,
            payload: m.payload,
            points: t
          }
        );
      return v.createElement(G$, { key: 'dot-'.concat(y), option: r, dotProps: A, className: i });
    }),
    p = {};
  return (
    l && u != null && (p.clipPath = 'url(#clipPath-'.concat(f ? '' : 'dots-').concat(u, ')')),
    v.createElement(Fe, { zIndex: s }, v.createElement(fe, Wa({ className: n }, p), h))
  );
}
function yh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Ui(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? yh(Object(r), !0).forEach(function (n) {
          X$(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : yh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function X$(e, t, r) {
  return (
    (t = Z$(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Z$(e) {
  var t = Q$(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Q$(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var ob = 0,
  J$ = { xAxis: {}, yAxis: {}, zAxis: {} },
  lb = We({
    name: 'cartesianAxis',
    initialState: J$,
    reducers: {
      addXAxis: {
        reducer(e, t) {
          e.xAxis[t.payload.id] = Q(t.payload);
        },
        prepare: oe()
      },
      replaceXAxis: {
        reducer(e, t) {
          var r = t.payload,
            n = r.prev,
            i = r.next;
          e.xAxis[n.id] !== void 0 &&
            (n.id !== i.id && delete e.xAxis[n.id], (e.xAxis[i.id] = Q(i)));
        },
        prepare: oe()
      },
      removeXAxis: {
        reducer(e, t) {
          delete e.xAxis[t.payload.id];
        },
        prepare: oe()
      },
      addYAxis: {
        reducer(e, t) {
          e.yAxis[t.payload.id] = Q(t.payload);
        },
        prepare: oe()
      },
      replaceYAxis: {
        reducer(e, t) {
          var r = t.payload,
            n = r.prev,
            i = r.next;
          e.yAxis[n.id] !== void 0 &&
            (n.id !== i.id && delete e.yAxis[n.id], (e.yAxis[i.id] = Q(i)));
        },
        prepare: oe()
      },
      removeYAxis: {
        reducer(e, t) {
          delete e.yAxis[t.payload.id];
        },
        prepare: oe()
      },
      addZAxis: {
        reducer(e, t) {
          e.zAxis[t.payload.id] = Q(t.payload);
        },
        prepare: oe()
      },
      replaceZAxis: {
        reducer(e, t) {
          var r = t.payload,
            n = r.prev,
            i = r.next;
          e.zAxis[n.id] !== void 0 &&
            (n.id !== i.id && delete e.zAxis[n.id], (e.zAxis[i.id] = Q(i)));
        },
        prepare: oe()
      },
      removeZAxis: {
        reducer(e, t) {
          delete e.zAxis[t.payload.id];
        },
        prepare: oe()
      },
      updateYAxisWidth(e, t) {
        var r = t.payload,
          n = r.id,
          i = r.width,
          a = e.yAxis[n];
        if (a) {
          var o,
            l = a.widthHistory || [];
          if (
            l.length === 3 &&
            l[0] === l[2] &&
            i === l[1] &&
            i !== a.width &&
            Math.abs(i - ((o = l[0]) !== null && o !== void 0 ? o : 0)) <= 1
          )
            return;
          var u = [...l, i].slice(-3);
          e.yAxis[n] = Ui(Ui({}, a), {}, { width: i, widthHistory: u });
        }
      },
      updateXAxisHeight(e, t) {
        var r = t.payload,
          n = r.id,
          i = r.height,
          a = e.xAxis[n];
        if (a) {
          var o,
            l = a.heightHistory || [];
          if (
            l.length === 3 &&
            l[0] === l[2] &&
            i === l[1] &&
            i !== a.height &&
            Math.abs(i - ((o = l[0]) !== null && o !== void 0 ? o : 0)) <= 1
          )
            return;
          var u = [...l, i].slice(-3);
          e.xAxis[n] = Ui(Ui({}, a), {}, { height: i, heightHistory: u });
        }
      }
    }
  }),
  Ot = lb.actions,
  eN = Ot.addXAxis,
  tN = Ot.replaceXAxis,
  rN = Ot.removeXAxis,
  nN = Ot.addYAxis,
  iN = Ot.replaceYAxis,
  aN = Ot.removeYAxis;
Ot.addZAxis;
Ot.replaceZAxis;
Ot.removeZAxis;
var oN = Ot.updateYAxisWidth,
  lN = Ot.updateXAxisHeight,
  uN = lb.reducer,
  cN = O([Se], (e) => ({ top: e.top, bottom: e.bottom, left: e.left, right: e.right })),
  sN = O([cN, Rt, Bt], (e, t, r) => {
    if (!(!e || t == null || r == null))
      return {
        x: e.left,
        y: e.top,
        width: Math.max(0, t - e.left - e.right),
        height: Math.max(0, r - e.top - e.bottom)
      };
  }),
  il = () => M(sN),
  fN = () => M(B_);
function gh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Tl(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? gh(Object(r), !0).forEach(function (n) {
          dN(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : gh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function dN(e, t, r) {
  return (
    (t = vN(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function vN(e) {
  var t = hN(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function hN(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var pN = (e) => {
  var t = e.point,
    r = e.childIndex,
    n = e.mainColor,
    i = e.activeDot,
    a = e.dataKey,
    o = e.clipPath;
  if (i === !1 || t.x == null || t.y == null) return null;
  var l = {
      index: r,
      dataKey: a,
      cx: t.x,
      cy: t.y,
      r: 4,
      fill: n ?? 'none',
      strokeWidth: 2,
      stroke: '#fff',
      payload: t.payload,
      value: t.value
    },
    u = Tl(Tl(Tl({}, l), Dr(i)), Fu(i)),
    c;
  return (
    v.isValidElement(i)
      ? (c = v.cloneElement(i, u))
      : typeof i == 'function'
        ? (c = i(u))
        : (c = v.createElement(V0, u)),
    v.createElement(fe, { className: 'recharts-active-dot', clipPath: o }, c)
  );
};
function Au(e) {
  var t = e.points,
    r = e.mainColor,
    n = e.activeDot,
    i = e.itemDataKey,
    a = e.clipPath,
    o = e.zIndex,
    l = o === void 0 ? ye.activeDot : o,
    u = M(sr),
    c = fN();
  if (t == null || c == null) return null;
  var s = t.find((f) => c.includes(f.payload));
  return ue(s)
    ? null
    : v.createElement(
        Fe,
        { zIndex: l },
        v.createElement(pN, {
          point: s,
          childIndex: Number(u),
          mainColor: r,
          dataKey: i,
          activeDot: n,
          clipPath: a
        })
      );
}
function mN(e, t) {
  return xN(e) || bN(e, t) || gN(e, t) || yN();
}
function yN() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gN(e, t) {
  if (e) {
    if (typeof e == 'string') return bh(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? bh(e, t)
          : void 0
    );
  }
}
function bh(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function bN(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function xN(e) {
  if (Array.isArray(e)) return e;
}
var xh = (e, t, r) => {
    var n = r ?? e;
    if (!ue(n)) return Be(n, t, 0);
  },
  wN = (e, t, r) => {
    var n = {},
      i = e.filter(wo),
      a = e.filter((c) => c.stackId == null),
      o = i.reduce((c, s) => {
        var f = c[s.stackId];
        return (f == null && (f = []), f.push(s), (c[s.stackId] = f), c);
      }, n),
      l = Object.entries(o).map((c) => {
        var s,
          f = mN(c, 2),
          d = f[0],
          h = f[1],
          p = h.map((y) => y.dataKey),
          m = xh(t, r, (s = h[0]) === null || s === void 0 ? void 0 : s.barSize);
        return { stackId: d, dataKeys: p, barSize: m };
      }),
      u = a.map((c) => {
        var s = [c.dataKey].filter((d) => d != null),
          f = xh(t, r, c.barSize);
        return { stackId: void 0, dataKeys: s, barSize: f };
      });
    return [...l, ...u];
  };
function wh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Hi(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? wh(Object(r), !0).forEach(function (n) {
          AN(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : wh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function AN(e, t, r) {
  return (
    (t = PN(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function PN(e) {
  var t = ON(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function ON(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function SN(e, t, r, n, i) {
  var a,
    o = n.length;
  if (!(o < 1)) {
    var l = Be(e, r, 0, !0),
      u,
      c = [];
    if (H((a = n[0]) === null || a === void 0 ? void 0 : a.barSize)) {
      var s = !1,
        f = r / o,
        d = n.reduce((x, A) => x + (A.barSize || 0), 0);
      ((d += (o - 1) * l),
        d >= r && ((d -= (o - 1) * l), (l = 0)),
        d >= r && f > 0 && ((s = !0), (f *= 0.9), (d = o * f)));
      var h = Math.round((r - d) / 2),
        p = { offset: h - l, size: 0 };
      u = n.reduce((x, A) => {
        var w,
          P = {
            stackId: A.stackId,
            dataKeys: A.dataKeys,
            position: {
              offset: p.offset + p.size + l,
              size: s ? f : (w = A.barSize) !== null && w !== void 0 ? w : 0
            }
          },
          b = [...x, P];
        return ((p = P.position), b);
      }, c);
    } else {
      var m = Be(t, r, 0, !0);
      r - 2 * m - (o - 1) * l <= 0 && (l = 0);
      var y = (r - 2 * m - (o - 1) * l) / o;
      y > 1 && (y = Math.round(y));
      var g = H(i) ? Math.min(y, i) : y;
      u = n.reduce(
        (x, A, w) => [
          ...x,
          {
            stackId: A.stackId,
            dataKeys: A.dataKeys,
            position: { offset: m + (o * (y - g)) / 2 + (g + l) * w, size: g }
          }
        ],
        c
      );
    }
    return u;
  }
}
var EN = (e, t, r, n, i, a, o) => {
    var l = ue(o) ? t : o,
      u = SN(r, n, i !== a ? i : a, e, l);
    return (
      i !== a &&
        u != null &&
        (u = u.map((c) =>
          Hi(
            Hi({}, c),
            {},
            { position: Hi(Hi({}, c.position), {}, { offset: c.position.offset - i / 2 }) }
          )
        )),
      u
    );
  },
  IN = (e, t) => {
    var r = xo(t);
    if (!(!e || r == null || t == null)) {
      var n = t.stackId;
      if (n != null) {
        var i = e[n];
        if (i) {
          var a = i.stackedData;
          if (a) return a.find((o) => o.key === r);
        }
      }
    }
  },
  kN = (e, t) => {
    if (!(e == null || t == null)) {
      var r = e.find(
        (n) => n.stackId === t.stackId && t.dataKey != null && n.dataKeys.includes(t.dataKey)
      );
      if (r != null) return r.position;
    }
  };
function CN(e, t) {
  return e && typeof e == 'object' && 'zIndex' in e && typeof e.zIndex == 'number' && H(e.zIndex)
    ? e.zIndex
    : t;
}
var ub = (e) => {
    var t = e.chartData,
      r = ee(),
      n = Ee();
    return (
      v.useEffect(
        () =>
          n
            ? () => {}
            : (r(Lv(t)),
              () => {
                r(Lv(void 0));
              }),
        [t, r, n]
      ),
      null
    );
  },
  Ah = { x: 0, y: 0, width: 0, height: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
  cb = We({
    name: 'brush',
    initialState: Ah,
    reducers: {
      setBrushSettings(e, t) {
        return t.payload == null ? Ah : t.payload;
      }
    }
  });
cb.actions.setBrushSettings;
var jN = cb.reducer,
  _N = (e, t) => {
    var r = e.x,
      n = e.y,
      i = t.x,
      a = t.y;
    return {
      x: Math.min(r, i),
      y: Math.min(n, a),
      width: Math.abs(i - r),
      height: Math.abs(a - n)
    };
  },
  TN = (e) => {
    var t = e.x1,
      r = e.y1,
      n = e.x2,
      i = e.y2;
    return _N({ x: t, y: r }, { x: n, y: i });
  };
function MN(e) {
  return ((e % 180) + 180) % 180;
}
var DN = function (t) {
    var r = t.width,
      n = t.height,
      i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0,
      a = MN(i),
      o = (a * Math.PI) / 180,
      l = Math.atan(n / r),
      u = o > l && o < Math.PI - l ? n / Math.sin(o) : r / Math.cos(o);
    return Math.abs(u);
  },
  $N = { dots: [], areas: [], lines: [] },
  sb = We({
    name: 'referenceElements',
    initialState: $N,
    reducers: {
      addDot: (e, t) => {
        e.dots.push(t.payload);
      },
      removeDot: (e, t) => {
        var r = ot(e).dots.findIndex((n) => n === t.payload);
        r !== -1 && e.dots.splice(r, 1);
      },
      addArea: (e, t) => {
        e.areas.push(t.payload);
      },
      removeArea: (e, t) => {
        var r = ot(e).areas.findIndex((n) => n === t.payload);
        r !== -1 && e.areas.splice(r, 1);
      },
      addLine: (e, t) => {
        e.lines.push(Q(t.payload));
      },
      removeLine: (e, t) => {
        var r = ot(e).lines.findIndex((n) => n === t.payload);
        r !== -1 && e.lines.splice(r, 1);
      }
    }
  }),
  En = sb.actions;
En.addDot;
En.removeDot;
En.addArea;
En.removeArea;
var NN = En.addLine,
  LN = En.removeLine,
  RN = sb.reducer;
function BN(e, t) {
  return KN(e) || FN(e, t) || WN(e, t) || zN();
}
function zN() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function WN(e, t) {
  if (e) {
    if (typeof e == 'string') return Ph(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Ph(e, t)
          : void 0
    );
  }
}
function Ph(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function FN(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function KN(e) {
  if (Array.isArray(e)) return e;
}
var fb = v.createContext(void 0),
  UN = (e) => {
    var t = e.children,
      r = v.useState(''.concat(Vn('recharts'), '-clip')),
      n = BN(r, 1),
      i = n[0],
      a = il();
    if (a == null) return null;
    var o = a.x,
      l = a.y,
      u = a.width,
      c = a.height;
    return v.createElement(
      fb.Provider,
      { value: i },
      v.createElement(
        'defs',
        null,
        v.createElement(
          'clipPath',
          { id: i },
          v.createElement('rect', { x: o, y: l, height: c, width: u })
        )
      ),
      t
    );
  },
  HN = () => v.useContext(fb);
class VN {
  constructor(t) {
    var r = t.x,
      n = t.y;
    ((this.xAxisScale = r), (this.yAxisScale = n));
  }
  map(t, r) {
    var n,
      i,
      a = r.position;
    return {
      x: (n = this.xAxisScale.map(t.x, { position: a })) !== null && n !== void 0 ? n : 0,
      y: (i = this.yAxisScale.map(t.y, { position: a })) !== null && i !== void 0 ? i : 0
    };
  }
  mapWithFallback(t, r) {
    var n,
      i,
      a = r.position,
      o = r.fallback,
      l,
      u;
    return (
      o === 'rangeMin'
        ? (l = this.yAxisScale.rangeMin())
        : o === 'rangeMax'
          ? (l = this.yAxisScale.rangeMax())
          : (l = 0),
      o === 'rangeMin'
        ? (u = this.xAxisScale.rangeMin())
        : o === 'rangeMax'
          ? (u = this.xAxisScale.rangeMax())
          : (u = 0),
      {
        x: (n = this.xAxisScale.map(t.x, { position: a })) !== null && n !== void 0 ? n : u,
        y: (i = this.yAxisScale.map(t.y, { position: a })) !== null && i !== void 0 ? i : l
      }
    );
  }
  isInRange(t) {
    var r = t.x,
      n = t.y,
      i = r == null || this.xAxisScale.isInRange(r),
      a = n == null || this.yAxisScale.isInRange(n);
    return i && a;
  }
}
function Oh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Sh(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Oh(Object(r), !0).forEach(function (n) {
          YN(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Oh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function YN(e, t, r) {
  return (
    (t = GN(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function GN(e) {
  var t = qN(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function qN(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Fa() {
  return (
    (Fa = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Fa.apply(null, arguments)
  );
}
var XN = (e, t) => {
    var r;
    if (v.isValidElement(e)) r = v.cloneElement(e, t);
    else if (typeof e == 'function') r = e(t);
    else {
      if (!H(t.x1) || !H(t.y1) || !H(t.x2) || !H(t.y2)) return null;
      r = v.createElement('line', Fa({}, t, { className: 'recharts-reference-line-line' }));
    }
    return r;
  },
  ZN = (e, t, r, n, i, a) => {
    var o = a.x,
      l = a.width,
      u = i.map(e, { position: r });
    if (!H(u) || (t === 'discard' && !i.isInRange(u))) return null;
    var c = [
      { x: o + l, y: u },
      { x: o, y: u }
    ];
    return n === 'left' ? c.reverse() : c;
  },
  QN = (e, t, r, n, i, a) => {
    var o = a.y,
      l = a.height,
      u = i.map(e, { position: r });
    if (!H(u) || (t === 'discard' && !i.isInRange(u))) return null;
    var c = [
      { x: u, y: o + l },
      { x: u, y: o }
    ];
    return n === 'top' ? c.reverse() : c;
  },
  JN = (e, t, r, n) => {
    var i = [
      n.mapWithFallback(e[0], { position: r, fallback: 'rangeMin' }),
      n.mapWithFallback(e[1], { position: r, fallback: 'rangeMax' })
    ];
    return t === 'discard' && i.some((a) => !n.isInRange(a)) ? null : i;
  },
  eL = (e, t, r, n, i, a, o) => {
    var l = o.x,
      u = o.y,
      c = o.segment,
      s = o.ifOverflow,
      f = ut(l),
      d = ut(u);
    return d
      ? ZN(u, s, n, a, t, r)
      : f
        ? QN(l, s, n, i, e, r)
        : c != null && c.length === 2
          ? JN(c, s, n, new VN({ x: e, y: t }))
          : null;
  };
function tL(e) {
  var t = ee();
  return (
    v.useEffect(
      () => (
        t(NN(e)),
        () => {
          t(LN(e));
        }
      )
    ),
    null
  );
}
function rL(e) {
  var t = e.xAxisId,
    r = e.yAxisId,
    n = e.shape,
    i = e.className,
    a = e.ifOverflow,
    o = Ee(),
    l = HN(),
    u = M((S) => zt(S, t)),
    c = M((S) => Wt(S, r)),
    s = M((S) => hn(S, 'xAxis', t, o)),
    f = M((S) => hn(S, 'yAxis', r, o)),
    d = si();
  if (!l || !d || u == null || c == null || s == null || f == null) return null;
  var h = eL(s, f, d, e.position, u.orientation, c.orientation, e);
  if (!h) return null;
  var p = h[0],
    m = h[1];
  if (p == null || m == null) return null;
  var y = p.x,
    g = p.y,
    x = m.x,
    A = m.y,
    w = a === 'hidden' ? 'url(#'.concat(l, ')') : void 0,
    P = Sh(Sh({ clipPath: w }, Ye(e)), {}, { x1: y, y1: g, x2: x, y2: A }),
    b = TN({ x1: y, y1: g, x2: x, y2: A });
  return v.createElement(
    Fe,
    { zIndex: e.zIndex },
    v.createElement(
      fe,
      { className: Z('recharts-reference-line', i) },
      XN(n, P),
      v.createElement(
        z0,
        Fa({}, b, { lowerWidth: b.width, upperWidth: b.width }),
        v.createElement(K0, { label: e.label }),
        e.children
      )
    )
  );
}
var nL = {
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  fill: 'none',
  label: !1,
  stroke: '#ccc',
  fillOpacity: 1,
  strokeWidth: 1,
  position: 'middle',
  zIndex: ye.line
};
function iL(e) {
  var t = ge(e, nL);
  return v.createElement(
    v.Fragment,
    null,
    v.createElement(tL, {
      yAxisId: t.yAxisId,
      xAxisId: t.xAxisId,
      ifOverflow: t.ifOverflow,
      x: t.x,
      y: t.y,
      segment: t.segment
    }),
    v.createElement(rL, t)
  );
}
iL.displayName = 'ReferenceLine';
function aL() {}
function Eh(e) {
  if (!e || typeof e != 'object') return !1;
  const t = Object.getPrototypeOf(e);
  return t === null || t === Object.prototype || Object.getPrototypeOf(t) === null
    ? Object.prototype.toString.call(e) === '[object Object]'
    : !1;
}
function oL(e, t, r) {
  return zn(e, t, void 0, void 0, void 0, void 0, r);
}
function zn(e, t, r, n, i, a, o) {
  const l = o(e, t, r, n, i, a);
  if (l !== void 0) return l;
  if (typeof e == typeof t)
    switch (typeof e) {
      case 'bigint':
      case 'string':
      case 'boolean':
      case 'symbol':
      case 'undefined':
        return e === t;
      case 'number':
        return e === t || Object.is(e, t);
      case 'function':
        return e === t;
      case 'object':
        return Un(e, t, a, o);
    }
  return Un(e, t, a, o);
}
function Un(e, t, r, n) {
  if (Object.is(e, t)) return !0;
  let i = Yn(e),
    a = Yn(t);
  if ((i === '[object Arguments]' && (i = Gi), a === '[object Arguments]' && (a = Gi), i !== a))
    return !1;
  switch (i) {
    case Ku:
      return e.toString() === t.toString();
    case Uu:
      return Wn(e.valueOf(), t.valueOf());
    case Hu:
    case Wp:
    case zp:
      return Object.is(e.valueOf(), t.valueOf());
    case Rp:
      return e.source === t.source && e.flags === t.flags;
    case qw:
      return e === t;
  }
  r = r ?? new Map();
  const o = r.get(e),
    l = r.get(t);
  if (o != null && l != null) return o === t;
  (r.set(e, t), r.set(t, e));
  try {
    switch (i) {
      case Fp:
        if (e.size !== t.size) return !1;
        for (const [u, c] of e.entries())
          if (!t.has(u) || !zn(c, t.get(u), u, e, t, r, n)) return !1;
        return !0;
      case Kp: {
        if (e.size !== t.size) return !1;
        const u = Array.from(e.values()),
          c = Array.from(t.values());
        for (let s = 0; s < u.length; s++) {
          const f = u[s],
            d = c.findIndex((h) => zn(f, h, void 0, e, t, r, n));
          if (d === -1) return !1;
          c.splice(d, 1);
        }
        return !0;
      }
      case Up:
      case Yp:
      case Gp:
      case qp:
      case Xp:
      case Zw:
      case Zp:
      case Qp:
      case Jp:
      case Qw:
      case em:
      case tm:
        if (Hl(e) !== Hl(t) || e.length !== t.length) return !1;
        for (let u = 0; u < e.length; u++) if (!zn(e[u], t[u], u, e, t, r, n)) return !1;
        return !0;
      case Hp:
        return e.byteLength !== t.byteLength ? !1 : Un(new Uint8Array(e), new Uint8Array(t), r, n);
      case Vp:
        return e.byteLength !== t.byteLength || e.byteOffset !== t.byteOffset
          ? !1
          : Un(new Uint8Array(e), new Uint8Array(t), r, n);
      case Xw:
        return e.name === t.name && e.message === t.message;
      case Gi: {
        if (!(Un(e.constructor, t.constructor, r, n) || (Eh(e) && Eh(t)))) return !1;
        const u = [...Object.keys(e), ...Ul(e)],
          c = [...Object.keys(t), ...Ul(t)];
        if (u.length !== c.length) return !1;
        for (let s = 0; s < u.length; s++) {
          const f = u[s],
            d = e[f];
          if (!Object.hasOwn(t, f)) return !1;
          const h = t[f];
          if (!zn(d, h, f, e, t, r, n)) return !1;
        }
        return !0;
      }
      default:
        return !1;
    }
  } finally {
    (r.delete(e), r.delete(t));
  }
}
function lL(e, t) {
  return oL(e, t, aL);
}
function db(e, t) {
  if (t < 1) return [];
  if (t === 1) return e;
  for (var r = [], n = 0; n < e.length; n += t) {
    var i = e[n];
    i !== void 0 && r.push(i);
  }
  return r;
}
function uL(e, t, r) {
  var n = { width: e.width + t.width, height: e.height + t.height };
  return DN(n, r);
}
function cL(e, t, r) {
  var n = r === 'width',
    i = e.x,
    a = e.y,
    o = e.width,
    l = e.height;
  return t === 1
    ? { start: n ? i : a, end: n ? i + o : a + l }
    : { start: n ? i + o : a + l, end: n ? i : a };
}
function ii(e, t, r, n, i) {
  if (e * t < e * n || e * t > e * i) return !1;
  var a = r();
  return e * (t - (e * a) / 2 - n) >= 0 && e * (t + (e * a) / 2 - i) <= 0;
}
function sL(e, t) {
  return db(e, t + 1);
}
function fL(e, t, r, n, i) {
  for (
    var a = (n || []).slice(),
      o = t.start,
      l = t.end,
      u = 0,
      c = 1,
      s = o,
      f = function () {
        var p = n == null ? void 0 : n[u];
        if (p === void 0) return { v: db(n, c) };
        var m = u,
          y,
          g = () => (y === void 0 && (y = r(p, m)), y),
          x = p.coordinate,
          A = u === 0 || ii(e, x, g, s, l);
        (A || ((u = 0), (s = o), (c += 1)), A && ((s = x + e * (g() / 2 + i)), (u += c)));
      },
      d;
    c <= a.length;
  )
    if (((d = f()), d)) return d.v;
  return [];
}
function dL(e, t, r, n, i) {
  var a = (n || []).slice(),
    o = a.length;
  if (o === 0) return [];
  for (var l = t.start, u = t.end, c = 1; c <= o; c++) {
    for (
      var s = (o - 1) % c,
        f = l,
        d = !0,
        h = function () {
          var w = n[m];
          if (w == null) return 0;
          var P = m,
            b,
            S = () => (b === void 0 && (b = r(w, P)), b),
            E = w.coordinate,
            C = m === s || ii(e, E, S, f, u);
          if (!C) return ((d = !1), 1);
          C && (f = E + e * (S() / 2 + i));
        },
        p,
        m = s;
      m < o && ((p = h()), !(p !== 0 && p === 1));
      m += c
    );
    if (d) {
      for (var y = [], g = s; g < o; g += c) {
        var x = n[g];
        x != null && y.push(x);
      }
      return y;
    }
  }
  return [];
}
function Ih(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Le(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Ih(Object(r), !0).forEach(function (n) {
          vL(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Ih(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function vL(e, t, r) {
  return (
    (t = hL(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function hL(e) {
  var t = pL(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function pL(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function mL(e, t, r, n, i) {
  for (
    var a = (n || []).slice(),
      o = a.length,
      l = t.start,
      u = t.end,
      c = function (d) {
        var h = a[d];
        if (h == null) return 1;
        var p = h,
          m,
          y = () => (m === void 0 && (m = r(h, d)), m);
        if (d === o - 1) {
          var g = e * (p.coordinate + (e * y()) / 2 - u);
          a[d] = p = Le(Le({}, p), {}, { tickCoord: g > 0 ? p.coordinate - g * e : p.coordinate });
        } else a[d] = p = Le(Le({}, p), {}, { tickCoord: p.coordinate });
        if (p.tickCoord != null) {
          var x = ii(e, p.tickCoord, y, l, u);
          x && ((u = p.tickCoord - e * (y() / 2 + i)), (a[d] = Le(Le({}, p), {}, { isShow: !0 })));
        }
      },
      s = o - 1;
    s >= 0;
    s--
  )
    c(s);
  return a;
}
function yL(e, t, r, n, i, a) {
  var o = (n || []).slice(),
    l = o.length,
    u = t.start,
    c = t.end;
  if (a) {
    var s = n[l - 1];
    if (s != null) {
      var f = r(s, l - 1),
        d = e * (s.coordinate + (e * f) / 2 - c);
      if (
        ((o[l - 1] = s =
          Le(Le({}, s), {}, { tickCoord: d > 0 ? s.coordinate - d * e : s.coordinate })),
        s.tickCoord != null)
      ) {
        var h = ii(e, s.tickCoord, () => f, u, c);
        h && ((c = s.tickCoord - e * (f / 2 + i)), (o[l - 1] = Le(Le({}, s), {}, { isShow: !0 })));
      }
    }
  }
  for (
    var p = a ? l - 1 : l,
      m = function (x) {
        var A = o[x];
        if (A == null) return 1;
        var w = A,
          P,
          b = () => (P === void 0 && (P = r(A, x)), P);
        if (x === 0) {
          var S = e * (w.coordinate - (e * b()) / 2 - u);
          o[x] = w = Le(Le({}, w), {}, { tickCoord: S < 0 ? w.coordinate - S * e : w.coordinate });
        } else o[x] = w = Le(Le({}, w), {}, { tickCoord: w.coordinate });
        if (w.tickCoord != null) {
          var E = ii(e, w.tickCoord, b, u, c);
          E && ((u = w.tickCoord + e * (b() / 2 + i)), (o[x] = Le(Le({}, w), {}, { isShow: !0 })));
        }
      },
      y = 0;
    y < p;
    y++
  )
    m(y);
  return o;
}
function _s(e, t, r) {
  var n = e.tick,
    i = e.ticks,
    a = e.viewBox,
    o = e.minTickGap,
    l = e.orientation,
    u = e.interval,
    c = e.tickFormatter,
    s = e.unit,
    f = e.angle;
  if (!i || !i.length || !n) return [];
  if (T(u) || hi.isSsr) {
    var d;
    return (d = sL(i, T(u) ? u : 0)) !== null && d !== void 0 ? d : [];
  }
  var h = [],
    p = l === 'top' || l === 'bottom' ? 'width' : 'height',
    m = s && p === 'width' ? Kn(s, { fontSize: t, letterSpacing: r }) : { width: 0, height: 0 },
    y = (P, b) => {
      var S = typeof c == 'function' ? c(P.value, b) : P.value;
      return p === 'width'
        ? uL(Kn(S, { fontSize: t, letterSpacing: r }), m, f)
        : Kn(S, { fontSize: t, letterSpacing: r })[p];
    },
    g = i[0],
    x = i[1],
    A = i.length >= 2 && g != null && x != null ? je(x.coordinate - g.coordinate) : 1,
    w = cL(a, A, p);
  return u === 'equidistantPreserveStart'
    ? fL(A, w, y, i, o)
    : u === 'equidistantPreserveEnd'
      ? dL(A, w, y, i, o)
      : (u === 'preserveStart' || u === 'preserveStartEnd'
          ? (h = yL(A, w, y, i, o, u === 'preserveStartEnd'))
          : (h = mL(A, w, y, i, o)),
        h.filter((P) => P.isShow));
}
var gL = (e) => {
    var t = e.ticks,
      r = e.label,
      n = e.labelGapWithTick,
      i = n,
      a = e.tickSize,
      o = a === void 0 ? 0 : a,
      l = e.tickMargin,
      u = l === void 0 ? 0 : l,
      c = 0;
    if (t) {
      Array.from(t).forEach((h) => {
        if (h) {
          var p = h.getBoundingClientRect();
          p.width > c && (c = p.width);
        }
      });
      var s = r ? r.getBoundingClientRect().width : 0,
        f = o + u,
        d = c + f + s + (r ? i : 0);
      return Math.round(d);
    }
    return 0;
  },
  bL = (e) => {
    var t = e.ticks,
      r = e.label,
      n = e.labelGapWithTick,
      i = n,
      a = e.tickSize,
      o = a === void 0 ? 0 : a,
      l = e.tickMargin,
      u = l === void 0 ? 0 : l,
      c = 0;
    if (t) {
      Array.from(t).forEach((h) => {
        if (h) {
          var p = h.getBoundingClientRect();
          p.height > c && (c = p.height);
        }
      });
      var s = r ? r.getBoundingClientRect().height : 0,
        f = o + u,
        d = c + f + s + (r ? i : 0);
      return Math.round(d);
    }
    return 0;
  },
  xL = { xAxis: {}, yAxis: {} },
  vb = We({
    name: 'renderedTicks',
    initialState: xL,
    reducers: {
      setRenderedTicks: (e, t) => {
        var r = t.payload,
          n = r.axisType,
          i = r.axisId,
          a = r.ticks;
        e[n][i] = Q(a);
      },
      removeRenderedTicks: (e, t) => {
        var r = t.payload,
          n = r.axisType,
          i = r.axisId;
        delete e[n][i];
      }
    }
  }),
  hb = vb.actions,
  wL = hb.setRenderedTicks,
  AL = hb.removeRenderedTicks,
  PL = vb.reducer,
  OL = ['axisLine', 'width', 'height', 'className', 'hide', 'ticks', 'axisType', 'axisId'];
function kh(e, t) {
  return kL(e) || IL(e, t) || EL(e, t) || SL();
}
function SL() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function EL(e, t) {
  if (e) {
    if (typeof e == 'string') return Ch(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Ch(e, t)
          : void 0
    );
  }
}
function Ch(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function IL(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function kL(e) {
  if (Array.isArray(e)) return e;
}
function CL(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = jL(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function jL(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Wr() {
  return (
    (Wr = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Wr.apply(null, arguments)
  );
}
function jh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function me(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? jh(Object(r), !0).forEach(function (n) {
          _L(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : jh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function _L(e, t, r) {
  return (
    (t = TL(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function TL(e) {
  var t = ML(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function ML(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var Xt = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  viewBox: { x: 0, y: 0, width: 0, height: 0 },
  orientation: 'bottom',
  ticks: [],
  stroke: '#666',
  tickLine: !0,
  axisLine: !0,
  tick: !0,
  mirror: !1,
  minTickGap: 5,
  tickSize: 6,
  tickMargin: 2,
  interval: 'preserveEnd',
  zIndex: ye.axis
};
function DL(e) {
  var t = e.x,
    r = e.y,
    n = e.width,
    i = e.height,
    a = e.orientation,
    o = e.mirror,
    l = e.axisLine,
    u = e.otherSvgProps;
  if (!l) return null;
  var c = me(me(me({}, u), Ve(l)), {}, { fill: 'none' });
  if (a === 'top' || a === 'bottom') {
    var s = +((a === 'top' && !o) || (a === 'bottom' && o));
    c = me(me({}, c), {}, { x1: t, y1: r + s * i, x2: t + n, y2: r + s * i });
  } else {
    var f = +((a === 'left' && !o) || (a === 'right' && o));
    c = me(me({}, c), {}, { x1: t + f * n, y1: r, x2: t + f * n, y2: r + i });
  }
  return v.createElement(
    'line',
    Wr({}, c, { className: Z('recharts-cartesian-axis-line', Mt(l, 'className')) })
  );
}
function $L(e, t, r, n, i, a, o, l, u) {
  var c,
    s,
    f,
    d,
    h,
    p,
    m = l ? -1 : 1,
    y = e.tickSize || o,
    g = T(e.tickCoord) ? e.tickCoord : e.coordinate;
  switch (a) {
    case 'top':
      ((c = s = e.coordinate), (d = r + +!l * i), (f = d - m * y), (p = f - m * u), (h = g));
      break;
    case 'left':
      ((f = d = e.coordinate), (s = t + +!l * n), (c = s - m * y), (h = c - m * u), (p = g));
      break;
    case 'right':
      ((f = d = e.coordinate), (s = t + +l * n), (c = s + m * y), (h = c + m * u), (p = g));
      break;
    default:
      ((c = s = e.coordinate), (d = r + +l * i), (f = d + m * y), (p = f + m * u), (h = g));
      break;
  }
  return { line: { x1: c, y1: f, x2: s, y2: d }, tick: { x: h, y: p } };
}
function NL(e, t) {
  switch (e) {
    case 'left':
      return t ? 'start' : 'end';
    case 'right':
      return t ? 'end' : 'start';
    default:
      return 'middle';
  }
}
function LL(e, t) {
  switch (e) {
    case 'left':
    case 'right':
      return 'middle';
    case 'top':
      return t ? 'start' : 'end';
    default:
      return t ? 'end' : 'start';
  }
}
function RL(e) {
  var t = e.option,
    r = e.tickProps,
    n = e.value,
    i,
    a = Z(r.className, 'recharts-cartesian-axis-tick-value');
  if (v.isValidElement(t)) i = v.cloneElement(t, me(me({}, r), {}, { className: a }));
  else if (typeof t == 'function') i = t(me(me({}, r), {}, { className: a }));
  else {
    var o = 'recharts-cartesian-axis-tick-value';
    (typeof t != 'boolean' && (o = Z(o, X0(t))),
      (i = v.createElement($o, Wr({}, r, { className: o }), n)));
  }
  return i;
}
function BL(e) {
  var t = e.ticks,
    r = e.axisType,
    n = e.axisId,
    i = ee(),
    a = v.useRef(null);
  return (
    v.useEffect(() => {
      if (!(n == null || r == null)) {
        var o = t.map((u) => ({
            value: u.value,
            coordinate: u.coordinate,
            offset: u.offset,
            index: u.index
          })),
          l = a.current;
        (l != null && l.axisId === n && l.axisType === r && lL(l.ticks, o)) ||
          ((a.current = { ticks: o, axisId: n, axisType: r }),
          i(wL({ ticks: o, axisId: n, axisType: r })));
      }
    }, [i, t, n, r]),
    v.useEffect(
      () =>
        n == null || r == null
          ? dr
          : () => {
              i(AL({ axisId: n, axisType: r }));
            },
      [i, n, r]
    ),
    null
  );
}
var zL = v.forwardRef((e, t) => {
    var r = e.ticks,
      n = r === void 0 ? [] : r,
      i = e.tick,
      a = e.tickLine,
      o = e.stroke,
      l = e.tickFormatter,
      u = e.unit,
      c = e.padding,
      s = e.tickTextProps,
      f = e.orientation,
      d = e.mirror,
      h = e.x,
      p = e.y,
      m = e.width,
      y = e.height,
      g = e.tickSize,
      x = e.tickMargin,
      A = e.fontSize,
      w = e.letterSpacing,
      P = e.getTicksConfig,
      b = e.events,
      S = e.axisType,
      E = e.axisId,
      C = _s(me(me({}, P), {}, { ticks: n }), A, w),
      k = Ve(P),
      j = Dr(i),
      I = $0(k.textAnchor) ? k.textAnchor : NL(f, d),
      R = LL(f, d),
      D = {};
    typeof a == 'object' && (D = a);
    var $ = me(me({}, k), {}, { fill: 'none' }, D),
      z = C.map((Y) => me({ entry: Y }, $L(Y, h, p, m, y, f, g, d, x))),
      W = z.map((Y) => {
        var K = Y.entry,
          pe = Y.line;
        return v.createElement(
          fe,
          {
            className: 'recharts-cartesian-axis-tick',
            key: 'tick-'.concat(K.value, '-').concat(K.coordinate, '-').concat(K.tickCoord)
          },
          a &&
            v.createElement(
              'line',
              Wr({}, $, pe, {
                className: Z('recharts-cartesian-axis-tick-line', Mt(a, 'className'))
              })
            )
        );
      }),
      B = z.map((Y, K) => {
        var pe,
          be,
          de = Y.entry,
          Ke = Y.tick,
          Xe = me(
            me(
              me(me({ verticalAnchor: R }, k), {}, { textAnchor: I, stroke: 'none', fill: o }, Ke),
              {},
              { index: K, payload: de, visibleTicksCount: C.length, tickFormatter: l, padding: c },
              s
            ),
            {},
            {
              angle:
                (pe =
                  (be = s == null ? void 0 : s.angle) !== null && be !== void 0 ? be : k.angle) !==
                  null && pe !== void 0
                  ? pe
                  : 0
            }
          ),
          ht = me(me({}, Xe), j);
        return v.createElement(
          fe,
          Wr(
            {
              className: 'recharts-cartesian-axis-tick-label',
              key: 'tick-label-'
                .concat(de.value, '-')
                .concat(de.coordinate, '-')
                .concat(de.tickCoord)
            },
            oi(b, de, K)
          ),
          i &&
            v.createElement(RL, {
              option: i,
              tickProps: ht,
              value: ''.concat(typeof l == 'function' ? l(de.value, K) : de.value).concat(u || '')
            })
        );
      });
    return v.createElement(
      'g',
      { className: 'recharts-cartesian-axis-ticks recharts-'.concat(S, '-ticks') },
      v.createElement(BL, { ticks: C, axisId: E, axisType: S }),
      B.length > 0 &&
        v.createElement(
          Fe,
          { zIndex: ye.label },
          v.createElement(
            'g',
            {
              className: 'recharts-cartesian-axis-tick-labels recharts-'.concat(S, '-tick-labels'),
              ref: t
            },
            B
          )
        ),
      W.length > 0 &&
        v.createElement(
          'g',
          { className: 'recharts-cartesian-axis-tick-lines recharts-'.concat(S, '-tick-lines') },
          W
        )
    );
  }),
  WL = v.forwardRef((e, t) => {
    var r = e.axisLine,
      n = e.width,
      i = e.height,
      a = e.className,
      o = e.hide,
      l = e.ticks,
      u = e.axisType,
      c = e.axisId,
      s = CL(e, OL),
      f = v.useState(''),
      d = kh(f, 2),
      h = d[0],
      p = d[1],
      m = v.useState(''),
      y = kh(m, 2),
      g = y[0],
      x = y[1],
      A = v.useRef(null);
    v.useImperativeHandle(t, () => ({
      getCalculatedWidth: () => {
        var P;
        return gL({
          ticks: A.current,
          label: (P = e.labelRef) === null || P === void 0 ? void 0 : P.current,
          labelGapWithTick: 5,
          tickSize: e.tickSize,
          tickMargin: e.tickMargin
        });
      },
      getCalculatedHeight: () => {
        var P;
        return bL({
          ticks: A.current,
          label: (P = e.labelRef) === null || P === void 0 ? void 0 : P.current,
          labelGapWithTick: 5,
          tickSize: e.tickSize,
          tickMargin: e.tickMargin
        });
      }
    }));
    var w = v.useCallback(
      (P) => {
        if (P) {
          var b = P.getElementsByClassName('recharts-cartesian-axis-tick-value');
          A.current = b;
          var S = b[0];
          if (S) {
            var E = window.getComputedStyle(S),
              C = E.fontSize,
              k = E.letterSpacing;
            (C !== h || k !== g) && (p(C), x(k));
          }
        }
      },
      [h, g]
    );
    return o || (n != null && n <= 0) || (i != null && i <= 0)
      ? null
      : v.createElement(
          Fe,
          { zIndex: e.zIndex },
          v.createElement(
            fe,
            { className: Z('recharts-cartesian-axis', a) },
            v.createElement(DL, {
              x: e.x,
              y: e.y,
              width: n,
              height: i,
              orientation: e.orientation,
              mirror: e.mirror,
              axisLine: r,
              otherSvgProps: Ve(e)
            }),
            v.createElement(zL, {
              ref: w,
              axisType: u,
              events: s,
              fontSize: h,
              getTicksConfig: e,
              height: e.height,
              letterSpacing: g,
              mirror: e.mirror,
              orientation: e.orientation,
              padding: e.padding,
              stroke: e.stroke,
              tick: e.tick,
              tickFormatter: e.tickFormatter,
              tickLine: e.tickLine,
              tickMargin: e.tickMargin,
              tickSize: e.tickSize,
              tickTextProps: e.tickTextProps,
              ticks: l,
              unit: e.unit,
              width: e.width,
              x: e.x,
              y: e.y,
              axisId: c
            }),
            v.createElement(
              z0,
              {
                x: e.x,
                y: e.y,
                width: e.width,
                height: e.height,
                lowerWidth: e.width,
                upperWidth: e.width
              },
              v.createElement(K0, { label: e.label, labelRef: e.labelRef }),
              e.children
            )
          )
        );
  }),
  Ts = v.forwardRef((e, t) => {
    var r = ge(e, Xt);
    return v.createElement(WL, Wr({}, r, { ref: t }));
  });
Ts.displayName = 'CartesianAxis';
var FL = { grid: { stroke: '#ccc', fill: 'none' } },
  pb = v.createContext(FL);
pb.Provider;
var KL = () => v.useContext(pb),
  UL = ['x1', 'y1', 'x2', 'y2', 'key'],
  HL = ['offset'],
  VL = ['xAxisId', 'yAxisId'],
  YL = ['xAxisId', 'yAxisId'];
function _h(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Re(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? _h(Object(r), !0).forEach(function (n) {
          GL(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : _h(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function GL(e, t, r) {
  return (
    (t = qL(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function qL(e) {
  var t = XL(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function XL(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function jr() {
  return (
    (jr = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    jr.apply(null, arguments)
  );
}
function Ka(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = ZL(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function ZL(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var QL = (e) => {
  var t = e.fill;
  if (!t || t === 'none') return null;
  var r = e.fillOpacity,
    n = e.x,
    i = e.y,
    a = e.width,
    o = e.height,
    l = e.ry;
  return v.createElement('rect', {
    x: n,
    y: i,
    ry: l,
    width: a,
    height: o,
    stroke: 'none',
    fill: t,
    fillOpacity: r,
    className: 'recharts-cartesian-grid-bg'
  });
};
function mb(e) {
  var t = e.option,
    r = e.lineItemProps,
    n;
  if (v.isValidElement(t)) n = v.cloneElement(t, r);
  else if (typeof t == 'function') n = t(r);
  else {
    var i,
      a = r.x1,
      o = r.y1,
      l = r.x2,
      u = r.y2,
      c = r.key,
      s = Ka(r, UL),
      f = (i = Ve(s)) !== null && i !== void 0 ? i : {};
    f.offset;
    var d = Ka(f, HL),
      h = Array.isArray(d.strokeDasharray) ? d.strokeDasharray.join(',') : d.strokeDasharray;
    n = v.createElement(
      'line',
      jr({}, d, { strokeDasharray: h, x1: a, y1: o, x2: l, y2: u, fill: 'none', key: c })
    );
  }
  return n;
}
function JL(e) {
  var t = e.x,
    r = e.width,
    n = e.horizontal,
    i = n === void 0 ? !0 : n,
    a = e.horizontalPoints;
  if (!i || !a || !a.length) return null;
  (e.xAxisId, e.yAxisId);
  var o = Ka(e, VL),
    l = a.map((u, c) => {
      var s = Re(
        Re({}, o),
        {},
        { x1: t, y1: u, x2: t + r, y2: u, key: 'line-'.concat(c), index: c }
      );
      return v.createElement(mb, { key: 'line-'.concat(c), option: i, lineItemProps: s });
    });
  return v.createElement('g', { className: 'recharts-cartesian-grid-horizontal' }, l);
}
function eR(e) {
  var t = e.y,
    r = e.height,
    n = e.vertical,
    i = n === void 0 ? !0 : n,
    a = e.verticalPoints;
  if (!i || !a || !a.length) return null;
  (e.xAxisId, e.yAxisId);
  var o = Ka(e, YL),
    l = a.map((u, c) => {
      var s = Re(
        Re({}, o),
        {},
        { x1: u, y1: t, x2: u, y2: t + r, key: 'line-'.concat(c), index: c }
      );
      return v.createElement(mb, { option: i, lineItemProps: s, key: 'line-'.concat(c) });
    });
  return v.createElement('g', { className: 'recharts-cartesian-grid-vertical' }, l);
}
function tR(e) {
  var t = e.horizontalFill,
    r = e.fillOpacity,
    n = e.x,
    i = e.y,
    a = e.width,
    o = e.height,
    l = e.horizontalPoints,
    u = e.horizontal,
    c = u === void 0 ? !0 : u;
  if (!c || !t || !t.length || l == null) return null;
  var s = l.map((d) => Math.round(d + i - i)).sort((d, h) => d - h);
  i !== s[0] && s.unshift(0);
  var f = s.map((d, h) => {
    var p = s[h + 1],
      m = p == null,
      y = m ? i + o - d : p - d;
    if (y <= 0) return null;
    var g = h % t.length;
    return v.createElement('rect', {
      key: 'react-'.concat(h),
      y: d,
      x: n,
      height: y,
      width: a,
      stroke: 'none',
      fill: t[g],
      fillOpacity: r,
      className: 'recharts-cartesian-grid-bg'
    });
  });
  return v.createElement('g', { className: 'recharts-cartesian-gridstripes-horizontal' }, f);
}
function rR(e) {
  var t = e.vertical,
    r = t === void 0 ? !0 : t,
    n = e.verticalFill,
    i = e.fillOpacity,
    a = e.x,
    o = e.y,
    l = e.width,
    u = e.height,
    c = e.verticalPoints;
  if (!r || !n || !n.length) return null;
  var s = c.map((d) => Math.round(d + a - a)).sort((d, h) => d - h);
  a !== s[0] && s.unshift(0);
  var f = s.map((d, h) => {
    var p = s[h + 1],
      m = p == null,
      y = m ? a + l - d : p - d;
    if (y <= 0) return null;
    var g = h % n.length;
    return v.createElement('rect', {
      key: 'react-'.concat(h),
      x: d,
      y: o,
      width: y,
      height: u,
      stroke: 'none',
      fill: n[g],
      fillOpacity: i,
      className: 'recharts-cartesian-grid-bg'
    });
  });
  return v.createElement('g', { className: 'recharts-cartesian-gridstripes-vertical' }, f);
}
var nR = (e, t) => {
    var r = e.xAxis,
      n = e.width,
      i = e.height,
      a = e.offset;
    return Um(
      _s(Re(Re(Re({}, Xt), r), {}, { ticks: Hm(r), viewBox: { x: 0, y: 0, width: n, height: i } })),
      a.left,
      a.left + a.width,
      t
    );
  },
  iR = (e, t) => {
    var r = e.yAxis,
      n = e.width,
      i = e.height,
      a = e.offset;
    return Um(
      _s(Re(Re(Re({}, Xt), r), {}, { ticks: Hm(r), viewBox: { x: 0, y: 0, width: n, height: i } })),
      a.top,
      a.top + a.height,
      t
    );
  },
  aR = {
    horizontal: !0,
    vertical: !0,
    horizontalPoints: [],
    verticalPoints: [],
    verticalFill: [],
    horizontalFill: [],
    xAxisId: 0,
    yAxisId: 0,
    syncWithTicks: !1,
    zIndex: ye.grid
  };
function oR(e) {
  var t,
    r,
    n,
    i,
    a,
    o,
    l = nc(),
    u = ic(),
    c = Jm(),
    s = Re(
      Re({}, ge(e, aR)),
      {},
      {
        x: T(e.x) ? e.x : c.left,
        y: T(e.y) ? e.y : c.top,
        width: T(e.width) ? e.width : c.width,
        height: T(e.height) ? e.height : c.height
      }
    ),
    f = s.xAxisId,
    d = s.yAxisId,
    h = s.x,
    p = s.y,
    m = s.width,
    y = s.height,
    g = s.syncWithTicks,
    x = s.horizontalValues,
    A = s.verticalValues,
    w = Ee(),
    P = M((W) => Sv(W, 'xAxis', f, w)),
    b = M((W) => Sv(W, 'yAxis', d, w)),
    S = KL(),
    E = {
      stroke: (t = s.stroke) !== null && t !== void 0 ? t : S.grid.stroke,
      strokeWidth: (r = s.strokeWidth) !== null && r !== void 0 ? r : S.grid.strokeWidth,
      strokeOpacity: (n = s.strokeOpacity) !== null && n !== void 0 ? n : S.grid.strokeOpacity,
      strokeDasharray: (i = s.strokeDasharray) !== null && i !== void 0 ? i : S.grid.strokeDasharray
    };
  if (!Dt(m) || !Dt(y) || !T(h) || !T(p)) return null;
  var C = s.verticalCoordinatesGenerator || nR,
    k = s.horizontalCoordinatesGenerator || iR,
    j = s.horizontalPoints,
    I = s.verticalPoints;
  if ((!j || !j.length) && typeof k == 'function') {
    var R = x && x.length,
      D = k(
        {
          yAxis: b ? Re(Re({}, b), {}, { ticks: R ? x : b.ticks }) : void 0,
          width: l ?? m,
          height: u ?? y,
          offset: c
        },
        R ? !0 : g
      );
    (ma(
      Array.isArray(D),
      'horizontalCoordinatesGenerator should return Array but instead it returned ['.concat(
        typeof D,
        ']'
      )
    ),
      Array.isArray(D) && (j = D));
  }
  if ((!I || !I.length) && typeof C == 'function') {
    var $ = A && A.length,
      z = C(
        {
          xAxis: P ? Re(Re({}, P), {}, { ticks: $ ? A : P.ticks }) : void 0,
          width: l ?? m,
          height: u ?? y,
          offset: c
        },
        $ ? !0 : g
      );
    (ma(
      Array.isArray(z),
      'verticalCoordinatesGenerator should return Array but instead it returned ['.concat(
        typeof z,
        ']'
      )
    ),
      Array.isArray(z) && (I = z));
  }
  return v.createElement(
    Fe,
    { zIndex: s.zIndex },
    v.createElement(
      'g',
      { className: 'recharts-cartesian-grid' },
      v.createElement(QL, {
        fill: (a = s.fill) !== null && a !== void 0 ? a : S.grid.fill,
        fillOpacity: (o = s.fillOpacity) !== null && o !== void 0 ? o : S.grid.fillOpacity,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        ry: s.ry
      }),
      v.createElement(tR, jr({}, s, { horizontalPoints: j })),
      v.createElement(rR, jr({}, s, { verticalPoints: I })),
      v.createElement(JL, jr({}, s, E, { offset: c, horizontalPoints: j, xAxis: P, yAxis: b })),
      v.createElement(eR, jr({}, s, E, { offset: c, verticalPoints: I, xAxis: P, yAxis: b }))
    )
  );
}
oR.displayName = 'CartesianGrid';
var lR = [
  'animationElapsedTime',
  'isAnimating',
  'isEntrance',
  'visibleLength',
  'strokeDasharray',
  'connectNulls'
];
function Pu() {
  return (
    (Pu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Pu.apply(null, arguments)
  );
}
function uR(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = cR(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function cR(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function sR(e) {
  try {
    return (e && e.getTotalLength && e.getTotalLength()) || 0;
  } catch {
    return 0;
  }
}
function yb(e, t) {
  return ''.concat(t, 'px ').concat(e, 'px');
}
function fR(e) {
  return e.length % 2 !== 0 ? [...e, ...e] : e;
}
function dR(e, t) {
  for (var r = [], n = 0; n < t; ++n) r.push(...e);
  return r;
}
function vR(e, t, r) {
  var n = fR(r),
    i = n.reduce((h, p) => h + p, 0);
  if (!i) return yb(t, e);
  for (
    var a = Math.floor(e / i), o = e % i, l = [], u = 0, c = 0;
    u < n.length;
    c += (s = n[u]) !== null && s !== void 0 ? s : 0, ++u
  ) {
    var s,
      f = n[u];
    if (f != null && c + f > o) {
      l = [...n.slice(0, u), o - c];
      break;
    }
  }
  var d = l.length % 2 === 0 ? [0, t] : [t];
  return [...dR(n, a), ...l, ...d].map((h) => ''.concat(h, 'px')).join(', ');
}
function hR(e, t, r) {
  if (e) {
    var n = ''
      .concat(e)
      .split(/[,\s]+/gim)
      .map((i) => parseFloat(i));
    return vR(r, t, n);
  }
  return yb(t, r);
}
function pR(e) {
  (e.animationElapsedTime, e.isAnimating, e.isEntrance);
  var t = e.visibleLength,
    r = e.strokeDasharray,
    n = e.connectNulls,
    i = uR(e, lR),
    a = n ?? !1,
    o;
  if (t != null) {
    var l,
      u = i.pathRef,
      c = sR((l = u == null ? void 0 : u.current) !== null && l !== void 0 ? l : null);
    o = hR(r, c, t);
  } else r != null && (o = String(r));
  return v.createElement(nn, Pu({}, i, { connectNulls: a, strokeDasharray: o }));
}
function mR(e) {
  var t = v.useRef(0),
    r = v.useRef(0),
    n = v.useRef(!1),
    i = v.useRef(e);
  return (
    i.current !== e && ((t.current = r.current), (i.current = e)),
    v.useCallback((a, o) => {
      if (n.current) return null;
      var l = Math.min(Vt(t.current + a * o), o);
      return a > 0 && o > 0 && ((r.current = Math.max(r.current, l)), l >= o)
        ? ((n.current = !0), null)
        : l;
    }, [])
  );
}
var yR = {},
  gb = We({
    name: 'errorBars',
    initialState: yR,
    reducers: {
      addErrorBar: (e, t) => {
        var r = t.payload,
          n = r.itemId,
          i = r.errorBar;
        (e[n] || (e[n] = []), e[n].push(i));
      },
      replaceErrorBar: (e, t) => {
        var r = t.payload,
          n = r.itemId,
          i = r.prev,
          a = r.next;
        e[n] &&
          (e[n] = e[n].map((o) =>
            o.dataKey === i.dataKey && o.direction === i.direction ? a : o
          ));
      },
      removeErrorBar: (e, t) => {
        var r = t.payload,
          n = r.itemId,
          i = r.errorBar;
        e[n] && (e[n] = e[n].filter((a) => a.dataKey !== i.dataKey || a.direction !== i.direction));
      }
    }
  }),
  Ms = gb.actions;
Ms.addErrorBar;
Ms.replaceErrorBar;
Ms.removeErrorBar;
var gR = gb.reducer,
  bR = ['children'];
function xR(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = wR(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function wR(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var AR = {
    data: [],
    xAxisId: 'xAxis-0',
    yAxisId: 'yAxis-0',
    dataPointFormatter: () => ({ x: 0, y: 0, value: 0 }),
    errorBarOffset: 0
  },
  PR = v.createContext(AR);
function bb(e) {
  var t = e.children,
    r = xR(e, bR);
  return v.createElement(PR.Provider, { value: r }, t);
}
function al(e, t) {
  var r,
    n,
    i = M((c) => zt(c, e)),
    a = M((c) => Wt(c, t)),
    o =
      (r = i == null ? void 0 : i.allowDataOverflow) !== null && r !== void 0
        ? r
        : Ae.allowDataOverflow,
    l =
      (n = a == null ? void 0 : a.allowDataOverflow) !== null && n !== void 0
        ? n
        : Pe.allowDataOverflow,
    u = o || l;
  return { needClip: u, needClipX: o, needClipY: l };
}
function Ds(e) {
  var t = e.xAxisId,
    r = e.yAxisId,
    n = e.clipPathId,
    i = il(),
    a = al(t, r),
    o = a.needClipX,
    l = a.needClipY,
    u = a.needClip,
    c = M((A) => Wg(A, t, !1)),
    s = M((A) => Fg(A, r, !1));
  if (!u || !i) return null;
  var f = i.x,
    d = i.y,
    h = i.width,
    p = i.height,
    m = o && c ? Math.min(c[0], c[1]) : f - h / 2,
    y = l && s ? Math.min(s[0], s[1]) : d - p / 2,
    g = o && c ? Math.abs(c[1] - c[0]) : h * 2,
    x = l && s ? Math.abs(s[1] - s[0]) : p * 2;
  return v.createElement(
    'clipPath',
    { id: 'clipPath-'.concat(n) },
    v.createElement('rect', { x: m, y, width: g, height: x })
  );
}
var xb = (e, t, r, n) => Lt(e, 'xAxis', t, n),
  wb = (e, t, r, n) => Nt(e, 'xAxis', t, n),
  Ab = (e, t, r, n) => Lt(e, 'yAxis', r, n),
  Pb = (e, t, r, n) => Nt(e, 'yAxis', r, n),
  OR = O([q, xb, Ab, wb, Pb], (e, t, r, n, i) => (At(e, 'xAxis') ? cr(t, n, !1) : cr(r, i, !1))),
  SR = (e, t, r, n, i) => i;
function ER(e) {
  return e.type === 'line';
}
var IR = O([Oi, SR], (e, t) => e.filter(ER).find((r) => r.id === t)),
  kR = O([q, xb, Ab, wb, Pb, IR, OR, mi], (e, t, r, n, i, a, o, l) => {
    var u = l.chartData,
      c = l.dataStartIndex,
      s = l.dataEndIndex;
    if (!(
      a == null ||
      t == null ||
      r == null ||
      n == null ||
      i == null ||
      n.length === 0 ||
      i.length === 0 ||
      o == null ||
      (e !== 'horizontal' && e !== 'vertical')
    )) {
      var f = a.dataKey,
        d = a.data,
        h;
      if (
        (d != null && d.length > 0 ? (h = d) : (h = u == null ? void 0 : u.slice(c, s + 1)),
        h != null)
      )
        return qR({
          layout: e,
          xAxis: t,
          yAxis: r,
          xAxisTicks: n,
          yAxisTicks: i,
          dataKey: f,
          bandSize: o,
          displayedData: h
        });
    }
  });
function Ob(e) {
  var t = Dr(e),
    r = 3,
    n = 2;
  if (t != null) {
    var i = t.r,
      a = t.strokeWidth,
      o = Number(i),
      l = Number(a);
    return (
      (Number.isNaN(o) || o < 0) && (o = r),
      (Number.isNaN(l) || l < 0) && (l = n),
      { r: o, strokeWidth: l }
    );
  }
  return { r, strokeWidth: n };
}
var CR = ['id'],
  jR = ['type', 'layout', 'connectNulls', 'needClip', 'shape', 'strokeDasharray'],
  _R = [
    'activeDot',
    'animateNewValues',
    'animationBegin',
    'animationDuration',
    'animationEasing',
    'connectNulls',
    'dot',
    'hide',
    'isAnimationActive',
    'label',
    'legendType',
    'xAxisId',
    'yAxisId',
    'id'
  ];
function Ua() {
  return (
    (Ua = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Ua.apply(null, arguments)
  );
}
function $s(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = TR(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function TR(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Th(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function kt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Th(Object(r), !0).forEach(function (n) {
          MR(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Th(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function MR(e, t, r) {
  return (
    (t = DR(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function DR(e) {
  var t = $R(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function $R(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function NR(e) {
  try {
    return (e && e.getTotalLength && e.getTotalLength()) || 0;
  } catch {
    return 0;
  }
}
function LR(e) {
  var t = 0,
    r = 0;
  for (var n of e)
    n.status === 'matched' &&
      n.prev.x != null &&
      n.next.x != null &&
      ((t += n.next.x - n.prev.x), r++);
  return r > 0 ? t / r : 0;
}
var RR = (e, t) => {
    if (e == null) return [];
    if (t === 1) return e.flatMap((l) => (l.status === 'removed' ? [] : [l.next]));
    var r = LR(e),
      n = [];
    for (var i of e)
      if (i.status === 'matched')
        n.push(
          kt(kt({}, i.next), {}, { x: ae(i.prev.x, i.next.x, t), y: ae(i.prev.y, i.next.y, t) })
        );
      else if (i.status === 'added')
        if (i.next.x != null) {
          var a = i.next.x - r;
          n.push(kt(kt({}, i.next), {}, { x: ae(a, i.next.x, t), y: i.next.y }));
        } else n.push(i.next);
      else if (i.status === 'removed' && i.prev.x != null) {
        var o = i.prev.x + r;
        n.push(kt(kt({}, i.prev), {}, { x: ae(i.prev.x, o, t), y: i.prev.y }));
      }
    return n;
  },
  Ns = {
    activeDot: !0,
    animateNewValues: !0,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
    animationInterpolateFn: RR,
    animationMatchBy: Jo,
    connectNulls: !1,
    dot: !0,
    fill: '#fff',
    hide: !1,
    isAnimationActive: 'auto',
    label: !1,
    legendType: 'line',
    shape: pR,
    stroke: '#3182bd',
    strokeWidth: 1,
    xAxisId: 0,
    yAxisId: 0,
    zIndex: ye.line,
    type: 'linear'
  },
  BR = (e) => {
    var t = e.dataKey,
      r = e.name,
      n = e.stroke,
      i = e.legendType,
      a = e.hide;
    return [{ inactive: a, dataKey: t, type: i, color: n, value: vr(r, t), payload: e }];
  },
  zR = v.memo((e) => {
    var t = e.dataKey,
      r = e.data,
      n = e.stroke,
      i = e.strokeWidth,
      a = e.fill,
      o = e.name,
      l = e.hide,
      u = e.unit,
      c = e.formatter,
      s = e.tooltipType,
      f = e.id,
      d = {
        dataDefinedOnItem: r,
        getPosition: dr,
        settings: {
          stroke: n,
          strokeWidth: i,
          fill: a,
          dataKey: t,
          nameKey: void 0,
          name: vr(o, t),
          hide: l,
          type: s,
          color: n,
          unit: u,
          formatter: c,
          graphicalItemId: f
        }
      };
    return v.createElement(Qo, { tooltipEntrySettings: d });
  });
function WR(e) {
  var t = e.clipPathId,
    r = e.points,
    n = e.props,
    i = n.dot,
    a = n.dataKey,
    o = n.needClip;
  n.id;
  var l = $s(n, CR),
    u = Ve(l);
  return v.createElement(ab, {
    points: r,
    dot: i,
    className: 'recharts-line-dots',
    dotClassName: 'recharts-line-dot',
    dataKey: a,
    baseProps: u,
    needClip: o,
    clipPathId: t
  });
}
function FR(e) {
  var t = e.showLabels,
    r = e.children,
    n = e.points,
    i = v.useMemo(
      () =>
        n == null
          ? void 0
          : n.map((a) => {
              var o,
                l,
                u = {
                  x: (o = a.x) !== null && o !== void 0 ? o : 0,
                  y: (l = a.y) !== null && l !== void 0 ? l : 0,
                  width: 0,
                  lowerWidth: 0,
                  upperWidth: 0,
                  height: 0
                };
              return kt(
                kt({}, u),
                {},
                {
                  value: a.value,
                  payload: a.payload,
                  viewBox: u,
                  parentViewBox: void 0,
                  fill: void 0
                }
              );
            }),
      [n]
    );
  return v.createElement(ys, { value: t ? i : void 0 }, r);
}
function KR(e) {
  var t = e.clipPathId,
    r = e.pathRef,
    n = e.points,
    i = e.props,
    a = e.animationElapsedTime,
    o = e.isAnimating,
    l = e.isEntrance,
    u = e.visibleLength,
    c = i.type,
    s = i.layout,
    f = i.connectNulls,
    d = i.needClip,
    h = i.shape,
    p = i.strokeDasharray,
    m = $s(i, jR),
    y = kt(
      kt({}, Ye(m)),
      {},
      {
        fill: 'none',
        className: 'recharts-line-curve',
        clipPath: d ? 'url(#clipPath-'.concat(t, ')') : void 0,
        points: n,
        type: c,
        layout: s,
        connectNulls: f,
        strokeDasharray: p ?? i.strokeDasharray,
        pathRef: r,
        animationElapsedTime: a,
        isAnimating: o,
        isEntrance: i.animateNewValues ? l : !1,
        visibleLength: u
      }
    );
  return v.createElement(
    v.Fragment,
    null,
    (n == null ? void 0 : n.length) > 1 &&
      v.createElement(Zo, { option: h, DefaultShape: Ns.shape, shapeProps: y }),
    v.createElement(WR, { points: n, clipPathId: t, props: i })
  );
}
function UR(e) {
  var t = e.clipPathId,
    r = e.props,
    n = e.pathRef,
    i = e.previousPointsRef,
    a = r.points,
    o = r.isAnimationActive,
    l = r.animationBegin,
    u = r.animationDuration,
    c = r.animationEasing,
    s = r.animationMatchBy,
    f = r.animationInterpolateFn,
    d = r.layout,
    h = NR(n.current),
    p = el(r.onAnimationStart, r.onAnimationEnd),
    m = p.isAnimating,
    y = p.handleAnimationStart,
    g = p.handleAnimationEnd,
    x = !m,
    A = mR(a),
    w = v.useCallback((P) => P > 0 && h > 0, [h]);
  return v.createElement(
    FR,
    { points: a, showLabels: x },
    r.children,
    v.createElement(
      tl,
      {
        animationInput: a,
        animationIdPrefix: 'recharts-line-',
        items: a,
        previousItemsRef: i,
        isAnimationActive: o,
        animationBegin: l,
        animationDuration: u,
        animationEasing: c,
        onAnimationStart: y,
        onAnimationEnd: g,
        animationInterpolateFn: f,
        animationMatchBy: s,
        shouldUpdatePreviousRef: w,
        layout: d
      },
      (P, b, S) => {
        var E = m || b < 1,
          C = E ? A(b, h) : null;
        return v.createElement(KR, {
          props: r,
          points: P,
          clipPathId: t,
          pathRef: n,
          animationElapsedTime: b,
          isAnimating: E,
          isEntrance: S,
          visibleLength: C
        });
      }
    ),
    v.createElement(Lo, { label: r.label })
  );
}
function HR(e) {
  var t = e.clipPathId,
    r = e.props,
    n = v.useRef(null),
    i = v.useRef(null);
  return v.createElement(UR, { props: r, clipPathId: t, previousPointsRef: n, pathRef: i });
}
var VR = (e, t) => {
  var r, n;
  return {
    x: (r = e.x) !== null && r !== void 0 ? r : void 0,
    y: (n = e.y) !== null && n !== void 0 ? n : void 0,
    value: e.value,
    errorVal: X(e.payload, t)
  };
};
class YR extends v.Component {
  render() {
    var t = this.props,
      r = t.hide,
      n = t.dot,
      i = t.points,
      a = t.className,
      o = t.xAxisId,
      l = t.yAxisId,
      u = t.top,
      c = t.left,
      s = t.width,
      f = t.height,
      d = t.id,
      h = t.needClip,
      p = t.zIndex;
    if (r) return null;
    var m = Z('recharts-line', a),
      y = d,
      g = Ob(n),
      x = g.r,
      A = g.strokeWidth,
      w = Ps(n),
      P = x * 2 + A,
      b = h ? 'url(#clipPath-'.concat(w ? '' : 'dots-').concat(y, ')') : void 0;
    return v.createElement(
      Fe,
      { zIndex: p },
      v.createElement(
        fe,
        { className: m },
        h &&
          v.createElement(
            'defs',
            null,
            v.createElement(Ds, { clipPathId: y, xAxisId: o, yAxisId: l }),
            !w &&
              v.createElement(
                'clipPath',
                { id: 'clipPath-dots-'.concat(y) },
                v.createElement('rect', { x: c - P / 2, y: u - P / 2, width: s + P, height: f + P })
              )
          ),
        v.createElement(
          bb,
          { xAxisId: o, yAxisId: l, data: i, dataPointFormatter: VR, errorBarOffset: 0 },
          v.createElement(HR, { props: this.props, clipPathId: y })
        )
      ),
      v.createElement(Au, {
        activeDot: this.props.activeDot,
        points: i,
        mainColor: this.props.stroke,
        itemDataKey: this.props.dataKey,
        clipPath: b
      })
    );
  }
}
function GR(e) {
  var t = ge(e, Ns),
    r = t.activeDot,
    n = t.animateNewValues,
    i = t.animationBegin,
    a = t.animationDuration,
    o = t.animationEasing,
    l = t.connectNulls,
    u = t.dot,
    c = t.hide,
    s = t.isAnimationActive,
    f = t.label,
    d = t.legendType,
    h = t.xAxisId,
    p = t.yAxisId,
    m = t.id,
    y = $s(t, _R),
    g = al(h, p),
    x = g.needClip,
    A = il(),
    w = hr(),
    P = Ee(),
    b = M((j) => kR(j, h, p, P, m));
  if ((w !== 'horizontal' && w !== 'vertical') || b == null || A == null) return null;
  var S = A.height,
    E = A.width,
    C = A.x,
    k = A.y;
  return v.createElement(
    YR,
    Ua({}, y, {
      id: m,
      connectNulls: l,
      dot: u,
      activeDot: r,
      animateNewValues: n,
      animationBegin: i,
      animationDuration: a,
      animationEasing: o,
      isAnimationActive: s,
      hide: c,
      label: f,
      legendType: d,
      xAxisId: h,
      yAxisId: p,
      points: b,
      layout: w,
      height: S,
      width: E,
      left: C,
      top: k,
      needClip: x
    })
  );
}
function qR(e) {
  var t = e.layout,
    r = e.xAxis,
    n = e.yAxis,
    i = e.xAxisTicks,
    a = e.yAxisTicks,
    o = e.dataKey,
    l = e.bandSize,
    u = e.displayedData;
  return u
    .map((c, s) => {
      var f = X(c, o);
      if (t === 'horizontal') {
        var d = pa({ axis: r, ticks: i, bandSize: l, entry: c, index: s }),
          h = ue(f) ? null : n.scale.map(f);
        return { x: d, y: h ?? null, value: f, payload: c };
      }
      var p = ue(f) ? null : r.scale.map(f),
        m = pa({ axis: n, ticks: a, bandSize: l, entry: c, index: s });
      return p == null || m == null ? null : { x: p, y: m, value: f, payload: c };
    })
    .filter(Boolean);
}
function XR(e) {
  var t = ge(e, Ns),
    r = Ee();
  return v.createElement(rl, { id: t.id, type: 'line' }, (n) =>
    v.createElement(
      v.Fragment,
      null,
      v.createElement(Is, { legendPayload: BR(t) }),
      v.createElement(zR, {
        dataKey: t.dataKey,
        data: t.data,
        stroke: t.stroke,
        strokeWidth: t.strokeWidth,
        fill: t.fill,
        name: t.name,
        hide: t.hide,
        unit: t.unit,
        formatter: t.formatter,
        tooltipType: t.tooltipType,
        id: n
      }),
      v.createElement(js, {
        type: 'line',
        id: n,
        data: t.data,
        xAxisId: t.xAxisId,
        yAxisId: t.yAxisId,
        zAxisId: 0,
        dataKey: t.dataKey,
        hide: t.hide,
        isPanorama: r
      }),
      v.createElement(GR, Ua({}, t, { id: n }))
    )
  );
}
var ZR = v.memo(XR, Fr);
ZR.displayName = 'Line';
function Ft(e, t) {
  var r, n;
  return (r =
    (n = e.graphicalItems.cartesianItems.find((i) => i.id === t)) === null || n === void 0
      ? void 0
      : n.xAxisId) !== null && r !== void 0
    ? r
    : ob;
}
function Kt(e, t) {
  var r, n;
  return (r =
    (n = e.graphicalItems.cartesianItems.find((i) => i.id === t)) === null || n === void 0
      ? void 0
      : n.yAxisId) !== null && r !== void 0
    ? r
    : ob;
}
var Sb = (e, t, r) => Lt(e, 'xAxis', Ft(e, t), r),
  Eb = (e, t, r) => Nt(e, 'xAxis', Ft(e, t), r),
  Ib = (e, t, r) => Lt(e, 'yAxis', Kt(e, t), r),
  kb = (e, t, r) => Nt(e, 'yAxis', Kt(e, t), r),
  QR = O([q, Sb, Ib, Eb, kb], (e, t, r, n, i) => (At(e, 'xAxis') ? cr(t, n, !1) : cr(r, i, !1))),
  JR = (e, t) => t,
  Ls = O([Oi, JR], (e, t) => e.filter((r) => r.type === 'area').find((r) => r.id === t)),
  Cb = (e) => {
    var t = q(e),
      r = At(t, 'xAxis');
    return r ? 'yAxis' : 'xAxis';
  },
  e2 = (e, t) => {
    var r = Cb(e);
    return r === 'yAxis' ? Kt(e, t) : Ft(e, t);
  },
  jb = (e, t, r) => $a(e, Cb(e), e2(e, t), r),
  t2 = O([Ls, jb], (e, t) => {
    var r;
    if (!(e == null || t == null)) {
      var n = e.stackId,
        i = xo(e);
      if (!(n == null || i == null)) {
        var a = (r = t[n]) === null || r === void 0 ? void 0 : r.stackedData,
          o = a == null ? void 0 : a.find((l) => l.key === i);
        if (o != null) return o.map((l) => [l[0], l[1]]);
      }
    }
  }),
  r2 = O([Ls, jb], (e, t) => {
    if (!(e == null || e.stackId == null || t == null)) {
      var r = t[e.stackId];
      if (r != null) return r.graphicalItems.map((n) => n.dataKey).filter(Ue);
    }
  }),
  n2 = O([q, Sb, Ib, Eb, kb, t2, yy, QR, Ls, HE, r2], (e, t, r, n, i, a, o, l, u, c, s) => {
    var f = o.chartData,
      d = o.dataStartIndex,
      h = o.dataEndIndex;
    if (!(
      u == null ||
      (e !== 'horizontal' && e !== 'vertical') ||
      t == null ||
      r == null ||
      n == null ||
      i == null ||
      n.length === 0 ||
      i.length === 0 ||
      l == null
    )) {
      var p = u.data,
        m;
      if ((p && p.length > 0 ? (m = p) : (m = f == null ? void 0 : f.slice(d, h + 1)), m != null))
        return C2({
          layout: e,
          xAxis: t,
          yAxis: r,
          xAxisTicks: n,
          yAxisTicks: i,
          dataStartIndex: d,
          areaSettings: u,
          stackedData: a,
          displayedData: m,
          chartBaseValue: c,
          bandSize: l,
          stackDataKeys: s
        });
    }
  }),
  i2 = [
    'animationElapsedTime',
    'isAnimating',
    'isEntrance',
    'layout',
    'isRange',
    'stroke',
    'connectNulls'
  ],
  a2 = ['id', 'baseLine'];
function Hn() {
  return (
    (Hn = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Hn.apply(null, arguments)
  );
}
function Mh(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = o2(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function o2(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function l2(e) {
  var t,
    r,
    n = e.alpha,
    i = e.baseLine,
    a = e.points,
    o = e.strokeWidth,
    l = (t = a[0]) === null || t === void 0 ? void 0 : t.x,
    u = (r = a[a.length - 1]) === null || r === void 0 ? void 0 : r.x;
  if (!H(l) || !H(u)) return null;
  var c = n * Math.abs(l - u),
    s = Math.max(...a.map((f) => f.y || 0));
  return (
    T(i)
      ? (s = Math.max(i, s))
      : i && Array.isArray(i) && i.length && (s = Math.max(...i.map((f) => f.y || 0), s)),
    T(s)
      ? v.createElement('rect', {
          x: l < u ? l : l - c,
          y: 0,
          width: c,
          height: Math.floor(s + (o ? parseInt(''.concat(o), 10) : 1))
        })
      : null
  );
}
function u2(e) {
  var t,
    r,
    n = e.alpha,
    i = e.baseLine,
    a = e.points,
    o = e.strokeWidth,
    l = (t = a[0]) === null || t === void 0 ? void 0 : t.y,
    u = (r = a[a.length - 1]) === null || r === void 0 ? void 0 : r.y;
  if (!H(l) || !H(u)) return null;
  var c = n * Math.abs(l - u),
    s = Math.max(...a.map((f) => f.x || 0));
  return (
    T(i)
      ? (s = Math.max(i, s))
      : i && Array.isArray(i) && i.length && (s = Math.max(...i.map((f) => f.x || 0), s)),
    T(s)
      ? v.createElement('rect', {
          x: 0,
          y: l < u ? l : l - c,
          width: s + (o ? parseInt(''.concat(o), 10) : 1),
          height: Math.floor(c)
        })
      : null
  );
}
function c2(e) {
  var t = e.alpha,
    r = e.layout,
    n = e.points,
    i = e.baseLine,
    a = e.strokeWidth;
  return r === 'vertical'
    ? v.createElement(u2, { alpha: t, points: n, baseLine: i, strokeWidth: a })
    : v.createElement(l2, { alpha: t, points: n, baseLine: i, strokeWidth: a });
}
function s2(e) {
  var t = e.animationElapsedTime,
    r = t === void 0 ? 1 : t,
    n = e.isAnimating,
    i = n === void 0 ? !1 : n,
    a = e.isEntrance,
    o = a === void 0 ? !1 : a,
    l = e.layout,
    u = e.isRange,
    c = e.stroke,
    s = e.connectNulls,
    f = Mh(e, i2),
    d = l === 'vertical' ? 'vertical' : 'horizontal',
    h = s ?? !1,
    p = rb(),
    m = f.id,
    y = f.baseLine,
    g = Mh(f, a2),
    x = Ve(g),
    A = v.createElement(
      nn,
      Hn({}, f, {
        id: m,
        baseLine: y,
        connectNulls: h,
        stroke: 'none',
        className: 'recharts-area-area',
        layout: d
      })
    ),
    w =
      c !== 'none' &&
      v.createElement(
        nn,
        Hn({}, x, {
          className: 'recharts-area-curve',
          layout: d,
          type: f.type,
          connectNulls: h,
          fill: 'none',
          stroke: c,
          points: f.points
        })
      ),
    P =
      c !== 'none' &&
      u &&
      Array.isArray(y) &&
      v.createElement(
        nn,
        Hn({}, x, {
          className: 'recharts-area-curve',
          layout: d,
          type: f.type,
          connectNulls: h,
          fill: 'none',
          stroke: c,
          points: y
        })
      );
  if (o && (i || r < 1)) {
    var b;
    return v.createElement(
      fe,
      null,
      v.createElement(
        'defs',
        null,
        v.createElement(
          'clipPath',
          { id: p },
          v.createElement(c2, {
            alpha: r,
            points: (b = f.points) !== null && b !== void 0 ? b : [],
            baseLine: y,
            layout: d,
            strokeWidth: f.strokeWidth
          })
        )
      ),
      v.createElement(fe, { clipPath: 'url(#'.concat(p, ')') }, A, w, P)
    );
  }
  return v.createElement(v.Fragment, null, A, w, P);
}
var f2 = ['id'],
  d2 = [
    'activeDot',
    'animationBegin',
    'animationDuration',
    'animationEasing',
    'connectNulls',
    'dot',
    'fill',
    'fillOpacity',
    'hide',
    'isAnimationActive',
    'legendType',
    'stroke',
    'xAxisId',
    'yAxisId'
  ];
function Ha() {
  return (
    (Ha = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Ha.apply(null, arguments)
  );
}
function _b(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = v2(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function v2(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Dh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function mn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Dh(Object(r), !0).forEach(function (n) {
          h2(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Dh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function h2(e, t, r) {
  return (
    (t = p2(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function p2(e) {
  var t = m2(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function m2(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var y2 = (e, t) =>
    e == null
      ? []
      : t === 1
        ? e.flatMap((r) => (r.status === 'removed' ? [] : [r.next]))
        : e.flatMap((r) =>
            r.status === 'matched'
              ? [
                  mn(
                    mn({}, r.next),
                    {},
                    { x: ae(r.prev.x, r.next.x, t), y: ae(r.prev.y, r.next.y, t) }
                  )
                ]
              : r.status === 'added'
                ? [r.next]
                : []
          ),
  Tb = {
    activeDot: !0,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
    animationMatchBy: Jo,
    animationInterpolateFn: y2,
    connectNulls: !1,
    dot: !1,
    fill: '#3182bd',
    fillOpacity: 0.6,
    hide: !1,
    isAnimationActive: 'auto',
    legendType: 'line',
    stroke: '#3182bd',
    strokeWidth: 1,
    type: 'linear',
    label: !1,
    shape: s2,
    xAxisId: 0,
    yAxisId: 0,
    zIndex: ye.area
  };
function Va(e, t) {
  return e && e !== 'none' ? e : t;
}
var g2 = (e) => {
    var t = e.dataKey,
      r = e.name,
      n = e.stroke,
      i = e.fill,
      a = e.legendType,
      o = e.hide;
    return [{ inactive: o, dataKey: t, type: a, color: Va(n, i), value: vr(r, t), payload: e }];
  },
  b2 = v.memo((e) => {
    var t = e.dataKey,
      r = e.data,
      n = e.stroke,
      i = e.strokeWidth,
      a = e.fill,
      o = e.name,
      l = e.hide,
      u = e.unit,
      c = e.formatter,
      s = e.tooltipType,
      f = e.id,
      d = {
        dataDefinedOnItem: r,
        getPosition: dr,
        settings: {
          stroke: n,
          strokeWidth: i,
          fill: a,
          dataKey: t,
          nameKey: void 0,
          name: vr(o, t),
          hide: l,
          type: s,
          color: Va(n, a),
          unit: u,
          formatter: c,
          graphicalItemId: f
        }
      };
    return v.createElement(Qo, { tooltipEntrySettings: d });
  });
function x2(e) {
  var t = e.clipPathId,
    r = e.points,
    n = e.props,
    i = n.needClip,
    a = n.dot,
    o = n.dataKey,
    l = Ve(n);
  return v.createElement(ab, {
    points: r,
    dot: a,
    className: 'recharts-area-dots',
    dotClassName: 'recharts-area-dot',
    dataKey: o,
    baseProps: l,
    needClip: i,
    clipPathId: t
  });
}
function w2(e) {
  var t = e.showLabels,
    r = e.children,
    n = e.points,
    i = n.map((a) => {
      var o,
        l,
        u = {
          x: (o = a.x) !== null && o !== void 0 ? o : 0,
          y: (l = a.y) !== null && l !== void 0 ? l : 0,
          width: 0,
          lowerWidth: 0,
          upperWidth: 0,
          height: 0
        };
      return mn(
        mn({}, u),
        {},
        { value: a.value, payload: a.payload, parentViewBox: void 0, viewBox: u, fill: void 0 }
      );
    });
  return v.createElement(ys, { value: t ? i : void 0 }, r);
}
function A2(e) {
  var t = e.points,
    r = e.baseLine,
    n = e.needClip,
    i = e.clipPathId,
    a = e.props,
    o = e.animationElapsedTime,
    l = e.isAnimating,
    u = e.isEntrance,
    c = a.layout,
    s = a.type,
    f = a.stroke,
    d = a.connectNulls,
    h = a.isRange,
    p = a.shape,
    m = a.id,
    y = _b(a, f2),
    g = Ye(y),
    x = mn(
      mn({}, g),
      {},
      {
        id: m,
        points: t,
        connectNulls: d,
        type: s,
        baseLine: r,
        layout: c,
        stroke: f,
        isRange: h,
        animationElapsedTime: o,
        isAnimating: l,
        isEntrance: u
      }
    );
  return v.createElement(
    v.Fragment,
    null,
    (t == null ? void 0 : t.length) > 1 &&
      v.createElement(
        fe,
        { clipPath: n ? 'url(#clipPath-'.concat(i, ')') : void 0 },
        v.createElement(Zo, { option: p, DefaultShape: Tb.shape, shapeProps: x })
      ),
    v.createElement(x2, { points: t, props: y, clipPathId: i })
  );
}
function P2(e, t, r) {
  if (T(e)) {
    var n = T(t) ? t : void 0;
    return ae(n, e, r);
  }
  if (ue(e) || bt(e)) {
    var i = T(t) ? t : void 0;
    return ae(i, 0, r);
  }
  return e;
}
function O2(e) {
  var t = e.needClip,
    r = e.clipPathId,
    n = e.props,
    i = e.previousPointsRef,
    a = e.previousBaselineRef,
    o = n.points,
    l = n.baseLine,
    u = n.isAnimationActive,
    c = n.animationBegin,
    s = n.animationDuration,
    f = n.animationEasing,
    d = n.animationMatchBy,
    h = n.animationInterpolateFn,
    p = v.useMemo(() => ({ points: o, baseLine: l }), [o, l]),
    m = tb(p, a),
    y = ac(),
    g = el(n.onAnimationStart, n.onAnimationEnd),
    x = g.isAnimating,
    A = g.handleAnimationStart,
    w = g.handleAnimationEnd,
    P = m.startValue;
  if (y == null) return null;
  var b;
  return (
    Array.isArray(l) && Array.isArray(P)
      ? (b = wu(P, l, d))
      : Array.isArray(l)
        ? (b = wu(null, l, d))
        : (b = null),
    v.createElement(
      tl,
      {
        animationInput: p,
        animationIdPrefix: 'recharts-area-',
        items: o,
        previousItemsRef: i,
        isAnimationActive: u,
        animationBegin: c,
        animationDuration: s,
        animationEasing: f,
        onAnimationStart: A,
        onAnimationEnd: w,
        animationInterpolateFn: h,
        animationMatchBy: d,
        layout: y
      },
      (S, E, C) => {
        var k;
        return (
          E === 1 ? (k = l) : Array.isArray(l) ? (k = h(b, E, y)) : (k = C ? l : P2(l, P, E)),
          m.syncStepValue(k, E),
          v.createElement(
            w2,
            { showLabels: !x, points: o },
            n.children,
            v.createElement(A2, {
              points: S,
              baseLine: k,
              needClip: t,
              clipPathId: r,
              props: n,
              animationElapsedTime: E,
              isAnimating: x || E < 1,
              isEntrance: C
            }),
            v.createElement(Lo, { label: n.label })
          )
        );
      }
    )
  );
}
function S2(e) {
  var t = e.needClip,
    r = e.clipPathId,
    n = e.props,
    i = v.useRef(null),
    a = v.useRef();
  return v.createElement(O2, {
    needClip: t,
    clipPathId: r,
    props: n,
    previousPointsRef: i,
    previousBaselineRef: a
  });
}
class E2 extends v.PureComponent {
  render() {
    var t = this.props,
      r = t.hide,
      n = t.dot,
      i = t.points,
      a = t.className,
      o = t.top,
      l = t.left,
      u = t.needClip,
      c = t.xAxisId,
      s = t.yAxisId,
      f = t.width,
      d = t.height,
      h = t.id,
      p = t.baseLine,
      m = t.zIndex;
    if (r) return null;
    var y = Z('recharts-area', a),
      g = h,
      x = Ob(n),
      A = x.r,
      w = x.strokeWidth,
      P = Ps(n),
      b = A * 2 + w,
      S = u ? 'url(#clipPath-'.concat(P ? '' : 'dots-').concat(g, ')') : void 0;
    return v.createElement(
      Fe,
      { zIndex: m },
      v.createElement(
        fe,
        { className: y },
        u &&
          v.createElement(
            'defs',
            null,
            v.createElement(Ds, { clipPathId: g, xAxisId: c, yAxisId: s }),
            !P &&
              v.createElement(
                'clipPath',
                { id: 'clipPath-dots-'.concat(g) },
                v.createElement('rect', { x: l - b / 2, y: o - b / 2, width: f + b, height: d + b })
              )
          ),
        v.createElement(S2, { needClip: u, clipPathId: g, props: this.props })
      ),
      v.createElement(Au, {
        points: i,
        mainColor: Va(this.props.stroke, this.props.fill),
        itemDataKey: this.props.dataKey,
        activeDot: this.props.activeDot,
        clipPath: S
      }),
      this.props.isRange &&
        Array.isArray(p) &&
        v.createElement(Au, {
          points: p,
          mainColor: Va(this.props.stroke, this.props.fill),
          itemDataKey: this.props.dataKey,
          activeDot: this.props.activeDot,
          clipPath: S
        })
    );
  }
}
function I2(e) {
  var t,
    r = e.activeDot,
    n = e.animationBegin,
    i = e.animationDuration,
    a = e.animationEasing,
    o = e.connectNulls,
    l = e.dot,
    u = e.fill,
    c = e.fillOpacity,
    s = e.hide,
    f = e.isAnimationActive,
    d = e.legendType,
    h = e.stroke,
    p = e.xAxisId,
    m = e.yAxisId,
    y = _b(e, d2),
    g = hr(),
    x = w0(),
    A = al(p, m),
    w = A.needClip,
    P = Ee(),
    b = (t = M(($) => n2($, e.id, P))) !== null && t !== void 0 ? t : {},
    S = b.points,
    E = b.isRange,
    C = b.baseLine,
    k = il();
  if (
    (g !== 'horizontal' && g !== 'vertical') ||
    k == null ||
    (x !== 'AreaChart' && x !== 'ComposedChart')
  )
    return null;
  var j = k.height,
    I = k.width,
    R = k.x,
    D = k.y;
  return !S || !S.length
    ? null
    : v.createElement(
        E2,
        Ha({}, y, {
          activeDot: r,
          animationBegin: n,
          animationDuration: i,
          animationEasing: a,
          baseLine: C,
          connectNulls: o,
          dot: l,
          fill: u,
          fillOpacity: c,
          height: j,
          hide: s,
          layout: g,
          isAnimationActive: f,
          isRange: E,
          legendType: d,
          needClip: w,
          points: S,
          stroke: h,
          width: I,
          left: R,
          top: D,
          xAxisId: p,
          yAxisId: m
        })
      );
}
var k2 = (e, t, r, n, i) => {
  var a = r ?? t;
  if (T(a)) return a;
  var o = e === 'horizontal' ? i : n,
    l = o.scale.domain();
  if (o.type === 'number') {
    var u = Math.max(l[0], l[1]),
      c = Math.min(l[0], l[1]);
    return a === 'dataMin' ? c : a === 'dataMax' || u < 0 ? u : Math.max(Math.min(l[0], l[1]), 0);
  }
  return a === 'dataMin' ? l[0] : a === 'dataMax' ? l[1] : l[0];
};
function C2(e) {
  var t = e.areaSettings,
    r = t.connectNulls,
    n = t.baseValue,
    i = t.dataKey,
    a = e.stackedData,
    o = e.layout,
    l = e.chartBaseValue,
    u = e.xAxis,
    c = e.yAxis,
    s = e.displayedData,
    f = e.dataStartIndex,
    d = e.xAxisTicks,
    h = e.yAxisTicks,
    p = e.bandSize,
    m = e.stackDataKeys,
    y = a && a.length,
    g = k2(o, l, n, u, c),
    x = o === 'horizontal',
    A = !1,
    w = s.map((b, S) => {
      var E, C, k, j;
      if (y) j = a[f + S];
      else {
        var I = X(b, i);
        Array.isArray(I) ? ((j = I), (A = !0)) : (j = [g, I]);
      }
      var R =
          (E = (C = j) === null || C === void 0 ? void 0 : C[1]) !== null && E !== void 0
            ? E
            : null,
        D = X(b, i),
        $ = y && D == null && m != null && m.length > 0 && m.every((B) => X(b, B) == null),
        z = R == null || (y && !r && D == null) || $;
      if (x) {
        var W;
        return {
          x: pa({ axis: u, ticks: d, bandSize: p, entry: b, index: S }),
          y: z ? null : (W = c.scale.map(R)) !== null && W !== void 0 ? W : null,
          value: j,
          payload: b
        };
      }
      return {
        x: z ? null : (k = u.scale.map(R)) !== null && k !== void 0 ? k : null,
        y: pa({ axis: c, ticks: h, bandSize: p, entry: b, index: S }),
        value: j,
        payload: b
      };
    }),
    P;
  return (
    y || A
      ? (P = w.map((b) => {
          var S,
            E = Array.isArray(b.value) ? b.value[0] : null;
          if (x) {
            var C;
            return {
              x: b.x,
              y:
                E != null && b.y != null && (C = c.scale.map(E)) !== null && C !== void 0
                  ? C
                  : null,
              payload: b.payload
            };
          }
          return {
            x: E != null && (S = u.scale.map(E)) !== null && S !== void 0 ? S : null,
            y: b.y,
            payload: b.payload
          };
        }))
      : (P = x ? c.scale.map(g) : u.scale.map(g)),
    { points: w, baseLine: P ?? 0, isRange: A }
  );
}
function j2(e) {
  var t = ge(e, Tb),
    r = Ee();
  return v.createElement(rl, { id: t.id, type: 'area' }, (n) =>
    v.createElement(
      v.Fragment,
      null,
      v.createElement(Is, { legendPayload: g2(t) }),
      v.createElement(b2, {
        dataKey: t.dataKey,
        data: t.data,
        stroke: t.stroke,
        strokeWidth: t.strokeWidth,
        fill: t.fill,
        name: t.name,
        hide: t.hide,
        unit: t.unit,
        formatter: t.formatter,
        tooltipType: t.tooltipType,
        id: n
      }),
      v.createElement(js, {
        type: 'area',
        id: n,
        data: t.data,
        dataKey: t.dataKey,
        xAxisId: t.xAxisId,
        yAxisId: t.yAxisId,
        zAxisId: 0,
        stackId: Vm(t.stackId),
        hide: t.hide,
        barSize: void 0,
        baseValue: t.baseValue,
        isPanorama: r,
        connectNulls: t.connectNulls
      }),
      v.createElement(I2, Ha({}, t, { id: n }))
    )
  );
}
var _2 = v.memo(j2, Fr);
_2.displayName = 'Area';
var T2 = 'Invariant failed';
function M2(e, t) {
  throw new Error(T2);
}
var D2 = ['option'];
function $2(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = N2(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function N2(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var Rs = fy;
function Bs(e) {
  var t = e.option,
    r = $2(e, D2);
  return v.createElement(Zo, {
    option: t,
    DefaultShape: Rs,
    shapeProps: r,
    activeClassName: 'recharts-active-bar',
    inActiveClassName: 'recharts-inactive-bar'
  });
}
var L2 = function (t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    return (n, i) => {
      if (T(t)) return t;
      var a = T(n) || ue(n);
      return a ? t(n, i) : (a || M2(), r);
    };
  },
  R2 = (e, t, r) => r,
  B2 = (e, t) => t,
  Ci = O([Oi, B2], (e, t) => e.filter((r) => r.type === 'bar').find((r) => r.id === t)),
  z2 = O([Ci], (e) => (e == null ? void 0 : e.maxBarSize)),
  W2 = (e, t, r, n) => n,
  F2 = O([q, Oi, Ft, Kt, R2], (e, t, r, n, i) =>
    t
      .filter((a) => (e === 'horizontal' ? a.xAxisId === r : a.yAxisId === n))
      .filter((a) => a.isPanorama === i)
      .filter((a) => a.hide === !1)
      .filter((a) => a.type === 'bar')
  ),
  K2 = (e, t, r) => {
    var n = q(e),
      i = Ft(e, t),
      a = Kt(e, t);
    if (!(i == null || a == null))
      return n === 'horizontal' ? $a(e, 'yAxis', a, r) : $a(e, 'xAxis', i, r);
  },
  U2 = (e, t) => {
    var r = q(e),
      n = Ft(e, t),
      i = Kt(e, t);
    if (!(n == null || i == null))
      return r === 'horizontal' ? Ov(e, 'xAxis', n) : Ov(e, 'yAxis', i);
  },
  H2 = O([F2, UE, U2], wN),
  V2 = (e, t, r) => {
    var n,
      i,
      a = Ci(e, t);
    if (a == null) return 0;
    var o = Ft(e, t),
      l = Kt(e, t);
    if (o == null || l == null) return 0;
    var u = q(e),
      c = Cy(e),
      s = a.maxBarSize,
      f = ue(s) ? c : s,
      d,
      h;
    return (
      u === 'horizontal'
        ? ((d = Lt(e, 'xAxis', o, r)), (h = Nt(e, 'xAxis', o, r)))
        : ((d = Lt(e, 'yAxis', l, r)), (h = Nt(e, 'yAxis', l, r))),
      (n = (i = cr(d, h, !0)) !== null && i !== void 0 ? i : f) !== null && n !== void 0 ? n : 0
    );
  },
  Mb = (e, t, r) => {
    var n = q(e),
      i = Ft(e, t),
      a = Kt(e, t);
    if (!(i == null || a == null)) {
      var o, l;
      return (
        n === 'horizontal'
          ? ((o = Lt(e, 'xAxis', i, r)), (l = Nt(e, 'xAxis', i, r)))
          : ((o = Lt(e, 'yAxis', a, r)), (l = Nt(e, 'yAxis', a, r))),
        cr(o, l)
      );
    }
  },
  Y2 = O([H2, Cy, KE, jy, V2, Mb, z2], EN),
  G2 = (e, t, r) => {
    var n = Ft(e, t);
    if (n != null) return Lt(e, 'xAxis', n, r);
  },
  q2 = (e, t, r) => {
    var n = Kt(e, t);
    if (n != null) return Lt(e, 'yAxis', n, r);
  },
  X2 = (e, t, r) => {
    var n = Ft(e, t);
    if (n != null) return Nt(e, 'xAxis', n, r);
  },
  Z2 = (e, t, r) => {
    var n = Kt(e, t);
    if (n != null) return Nt(e, 'yAxis', n, r);
  },
  Q2 = O([Y2, Ci], kN),
  J2 = O([K2, Ci], IN),
  eB = O(
    [Se, tc, G2, q2, X2, Z2, Q2, q, yy, Mb, J2, Ci, W2],
    (e, t, r, n, i, a, o, l, u, c, s, f, d) => {
      var h = u.chartData,
        p = u.dataStartIndex,
        m = u.dataEndIndex;
      if (!(
        f == null ||
        o == null ||
        t == null ||
        (l !== 'horizontal' && l !== 'vertical') ||
        r == null ||
        n == null ||
        i == null ||
        a == null ||
        c == null
      )) {
        var y = f.data,
          g;
        if (
          (y != null && y.length > 0 ? (g = y) : (g = h == null ? void 0 : h.slice(p, m + 1)),
          g != null)
        )
          return MB({
            layout: l,
            barSettings: f,
            pos: o,
            parentViewBox: t,
            bandSize: c,
            xAxis: r,
            yAxis: n,
            xAxisTicks: i,
            yAxisTicks: a,
            stackedData: s,
            displayedData: g,
            offset: e,
            cells: d,
            dataStartIndex: p
          });
      }
    }
  ),
  tB = ['index'];
function Ou() {
  return (
    (Ou = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Ou.apply(null, arguments)
  );
}
function rB(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = nB(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function nB(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var Db = v.createContext(void 0),
  iB = (e) => {
    var t = v.useContext(Db);
    if (t != null) return t.stackId;
    if (e != null) return Vm(e);
  },
  aB = (e, t) => 'recharts-bar-stack-clip-path-'.concat(e, '-').concat(t),
  oB = (e) => {
    var t = v.useContext(Db);
    if (t != null) {
      var r = t.stackId;
      return 'url(#'.concat(aB(r, e), ')');
    }
  },
  $b = (e) => {
    var t = e.index,
      r = rB(e, tB),
      n = oB(t);
    return v.createElement(fe, Ou({ className: 'recharts-bar-stack-layer', clipPath: n }, r));
  },
  lB = ['onMouseEnter', 'onMouseLeave', 'onClick'],
  uB = ['value', 'background', 'tooltipPosition'],
  cB = ['id'],
  sB = ['onMouseEnter', 'onClick', 'onMouseLeave'];
function $h(e, t) {
  return hB(e) || vB(e, t) || dB(e, t) || fB();
}
function fB() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function dB(e, t) {
  if (e) {
    if (typeof e == 'string') return Nh(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Nh(e, t)
          : void 0
    );
  }
}
function Nh(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function vB(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function hB(e) {
  if (Array.isArray(e)) return e;
}
function fr() {
  return (
    (fr = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    fr.apply(null, arguments)
  );
}
function Lh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Oe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Lh(Object(r), !0).forEach(function (n) {
          pB(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Lh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function pB(e, t, r) {
  return (
    (t = mB(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function mB(e) {
  var t = yB(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function yB(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Ya(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = gB(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function gB(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var bB = (e) => {
    var t = e.dataKey,
      r = e.name,
      n = e.fill,
      i = e.legendType,
      a = e.hide;
    return [{ inactive: a, dataKey: t, type: i, color: n, value: vr(r, t), payload: e }];
  },
  xB = v.memo((e) => {
    var t = e.dataKey,
      r = e.stroke,
      n = e.strokeWidth,
      i = e.fill,
      a = e.name,
      o = e.hide,
      l = e.unit,
      u = e.formatter,
      c = e.tooltipType,
      s = e.id,
      f = {
        dataDefinedOnItem: void 0,
        getPosition: dr,
        settings: {
          stroke: r,
          strokeWidth: n,
          fill: i,
          dataKey: t,
          nameKey: void 0,
          name: vr(a, t),
          hide: o,
          type: c,
          color: i,
          unit: l,
          formatter: u,
          graphicalItemId: s
        }
      };
    return v.createElement(Qo, { tooltipEntrySettings: f });
  });
function wB(e) {
  var t = M(sr),
    r = e.data,
    n = e.dataKey,
    i = e.background,
    a = e.allOtherBarProps,
    o = a.onMouseEnter,
    l = a.onMouseLeave,
    u = a.onClick,
    c = Ya(a, lB),
    s = Os(o, n, a.id),
    f = Ss(l),
    d = Es(u, n, a.id);
  if (!i || r == null) return null;
  var h = Dr(i);
  return v.createElement(
    Fe,
    { zIndex: CN(i, ye.barBackground) },
    r.map((p, m) => {
      p.value;
      var y = p.background;
      p.tooltipPosition;
      var g = Ya(p, uB);
      if (!y) return null;
      var x = s(p, p.originalDataIndex),
        A = f(p, p.originalDataIndex),
        w = d(p, p.originalDataIndex),
        P = Oe(
          Oe(
            Oe(
              Oe(
                Oe({ option: i, isActive: String(p.originalDataIndex) === t }, g),
                {},
                { fill: '#eee' },
                y
              ),
              h
            ),
            oi(c, p, m)
          ),
          {},
          {
            onMouseEnter: x,
            onMouseLeave: A,
            onClick: w,
            dataKey: n,
            index: m,
            className: 'recharts-bar-background-rectangle'
          }
        );
      return v.createElement(Bs, fr({ key: 'background-bar-'.concat(m) }, P));
    })
  );
}
function AB(e) {
  var t = e.showLabels,
    r = e.children,
    n = e.rects,
    i =
      n == null
        ? void 0
        : n.map((a) => {
            var o = {
              x: a.x,
              y: a.y,
              width: a.width,
              lowerWidth: a.width,
              upperWidth: a.width,
              height: a.height
            };
            return Oe(
              Oe({}, o),
              {},
              {
                value: a.value,
                payload: a.payload,
                parentViewBox: a.parentViewBox,
                viewBox: o,
                fill: a.fill
              }
            );
          });
  return v.createElement(ys, { value: t ? i : void 0 }, r);
}
function PB(e) {
  var t = e.shape,
    r = e.activeBar,
    n = e.baseProps,
    i = e.entry,
    a = e.index,
    o = e.dataKey,
    l = M(sr),
    u = M(fs),
    c = r && String(i.originalDataIndex) === l && (u == null || o === u),
    s = l != null && (String(i.originalDataIndex) !== l || (u != null && o !== u)),
    f = v.useState(!1),
    d = $h(f, 2),
    h = d[0],
    p = d[1],
    m = v.useState(!1),
    y = $h(m, 2),
    g = y[0],
    x = y[1];
  v.useEffect(() => {
    var E;
    return (
      c
        ? (p(!0),
          (E = requestAnimationFrame(() => {
            x(!0);
          })))
        : (x(!1), s && p(!1)),
      () => {
        cancelAnimationFrame(E);
      }
    );
  }, [c, s]);
  var A = v.useCallback(() => {
      c || p(!1);
    }, [c]),
    w = c && g,
    P = c || h,
    b;
  c ? (r === !0 ? (b = t) : (b = r)) : (b = t);
  var S = v.createElement(
    Bs,
    fr({}, n, { name: String(n.name) }, i, {
      isActive: w,
      option: b,
      index: a,
      dataKey: o,
      animationElapsedTime: e.animationElapsedTime,
      isAnimating: e.isAnimating,
      isEntrance: e.isEntrance,
      onTransitionEnd: A
    })
  );
  return P
    ? v.createElement(
        Fe,
        { zIndex: ye.activeBar },
        v.createElement($b, { index: i.originalDataIndex }, S)
      )
    : S;
}
function OB(e) {
  var t = e.shape,
    r = e.baseProps,
    n = e.entry,
    i = e.index,
    a = e.dataKey;
  return v.createElement(
    Bs,
    fr({}, r, { name: String(r.name) }, n, {
      isActive: !1,
      option: t,
      index: i,
      dataKey: a,
      animationElapsedTime: e.animationElapsedTime,
      isAnimating: e.isAnimating,
      isEntrance: e.isEntrance
    })
  );
}
function SB(e) {
  var t,
    r = e.data,
    n = e.props,
    i = e.animationElapsedTime,
    a = e.isAnimating,
    o = e.isEntrance,
    l = (t = Ve(n)) !== null && t !== void 0 ? t : {},
    u = l.id,
    c = Ya(l, cB),
    s = n.shape,
    f = n.dataKey,
    d = n.activeBar,
    h = n.onMouseEnter,
    p = n.onClick,
    m = n.onMouseLeave,
    y = Ya(n, sB),
    g = Os(h, f, u),
    x = Ss(m),
    A = Es(p, f, u);
  return r
    ? v.createElement(
        v.Fragment,
        null,
        r.map((w, P) =>
          v.createElement(
            $b,
            fr(
              {
                index: w.originalDataIndex,
                key: 'rectangle-'
                  .concat(w == null ? void 0 : w.x, '-')
                  .concat(w == null ? void 0 : w.y, '-')
                  .concat(w == null ? void 0 : w.value, '-')
                  .concat(P),
                className: 'recharts-bar-rectangle'
              },
              oi(y, w, P),
              {
                onMouseEnter: g(w, w.originalDataIndex),
                onMouseLeave: x(w, w.originalDataIndex),
                onClick: A(w, w.originalDataIndex)
              }
            ),
            d
              ? v.createElement(PB, {
                  shape: s,
                  activeBar: d,
                  baseProps: c,
                  entry: w,
                  index: P,
                  dataKey: f,
                  animationElapsedTime: i,
                  isAnimating: a,
                  isEntrance: o
                })
              : v.createElement(OB, {
                  shape: s,
                  baseProps: c,
                  entry: w,
                  index: P,
                  dataKey: f,
                  animationElapsedTime: i,
                  isAnimating: a,
                  isEntrance: o
                })
          )
        )
      )
    : null;
}
var EB = (e, t, r) =>
  e == null
    ? []
    : t === 1
      ? e.flatMap((n) => (n.status === 'removed' ? [] : [n.next]))
      : e.flatMap((n) => {
          if (n.status === 'removed')
            return r === 'horizontal'
              ? [
                  Oe(
                    Oe({}, n.prev),
                    {},
                    {
                      height: ae(n.prev.height, 0, t),
                      y: ae(n.prev.y, n.prev.y + n.prev.height, t)
                    }
                  )
                ]
              : [Oe(Oe({}, n.prev), {}, { width: ae(n.prev.width, 0, t) })];
          if (n.status === 'matched')
            return [
              Oe(
                Oe({}, n.next),
                {},
                {
                  x: ae(n.prev.x, n.next.x, t),
                  y: ae(n.prev.y, n.next.y, t),
                  width: ae(n.prev.width, n.next.width, t),
                  height: ae(n.prev.height, n.next.height, t)
                }
              )
            ];
          var i = n.next;
          return r === 'horizontal'
            ? [Oe(Oe({}, i), {}, { height: ae(0, i.height, t), y: ae(i.stackedBarStart, i.y, t) })]
            : [Oe(Oe({}, i), {}, { width: ae(0, i.width, t), x: ae(i.stackedBarStart, i.x, t) })];
        });
function IB(e) {
  var t = e.props,
    r = e.previousRectanglesRef,
    n = t.data,
    i = t.isAnimationActive,
    a = t.animationBegin,
    o = t.animationDuration,
    l = t.animationEasing,
    u = t.animationInterpolateFn,
    c = t.layout,
    s = el(t.onAnimationStart, t.onAnimationEnd),
    f = s.isAnimating,
    d = s.handleAnimationStart,
    h = s.handleAnimationEnd;
  return v.createElement(
    AB,
    { showLabels: !f, rects: n },
    v.createElement(
      tl,
      {
        animationInput: n,
        animationIdPrefix: 'recharts-bar-',
        items: n,
        previousItemsRef: r,
        isAnimationActive: i,
        animationBegin: a,
        animationDuration: o,
        animationEasing: l,
        onAnimationStart: d,
        onAnimationEnd: h,
        animationInterpolateFn: u,
        animationMatchBy: t.animationMatchBy,
        layout: c
      },
      (p, m, y) =>
        v.createElement(
          fe,
          null,
          v.createElement(SB, {
            props: t,
            data: p,
            animationElapsedTime: m,
            isAnimating: f || m < 1,
            isEntrance: y
          })
        )
    ),
    v.createElement(Lo, { label: t.label }),
    t.children
  );
}
function kB(e) {
  var t = v.useRef(null);
  return v.createElement(IB, { previousRectanglesRef: t, props: e });
}
var Nb = 0,
  CB = (e, t) => {
    var r = Array.isArray(e.value) ? e.value[1] : e.value;
    return { x: e.x, y: e.y, value: r, errorVal: X(e, t) };
  };
class jB extends v.PureComponent {
  render() {
    var t = this.props,
      r = t.hide,
      n = t.data,
      i = t.dataKey,
      a = t.className,
      o = t.xAxisId,
      l = t.yAxisId,
      u = t.needClip,
      c = t.background,
      s = t.id;
    if (r || n == null) return null;
    var f = Z('recharts-bar', a),
      d = s;
    return v.createElement(
      fe,
      { className: f, id: s },
      u &&
        v.createElement(
          'defs',
          null,
          v.createElement(Ds, { clipPathId: d, xAxisId: o, yAxisId: l })
        ),
      v.createElement(
        fe,
        {
          className: 'recharts-bar-rectangles',
          clipPath: u ? 'url(#clipPath-'.concat(d, ')') : void 0
        },
        v.createElement(wB, { data: n, dataKey: i, background: c, allOtherBarProps: this.props }),
        v.createElement(kB, this.props)
      )
    );
  }
}
var _B = {
  activeBar: !1,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'ease',
  animationInterpolateFn: EB,
  animationMatchBy: ks,
  background: !1,
  hide: !1,
  isAnimationActive: 'auto',
  label: !1,
  legendType: 'rect',
  minPointSize: Nb,
  shape: Rs,
  xAxisId: 0,
  yAxisId: 0,
  zIndex: ye.bar
};
function TB(e) {
  var t = e.xAxisId,
    r = e.yAxisId,
    n = e.hide,
    i = e.legendType,
    a = e.minPointSize,
    o = e.activeBar,
    l = e.animationBegin,
    u = e.animationDuration,
    c = e.animationEasing,
    s = e.isAnimationActive,
    f = al(t, r),
    d = f.needClip,
    h = hr(),
    p = Ee(),
    m = As(e.children, Do),
    y = M((A) => eB(A, e.id, p, m));
  if (h !== 'vertical' && h !== 'horizontal') return null;
  var g,
    x = y == null ? void 0 : y[0];
  return (
    x == null || x.height == null || x.width == null
      ? (g = 0)
      : (g = h === 'vertical' ? x.height / 2 : x.width / 2),
    v.createElement(
      bb,
      { xAxisId: t, yAxisId: r, data: y, dataPointFormatter: CB, errorBarOffset: g },
      v.createElement(
        jB,
        fr({}, e, {
          layout: h,
          needClip: d,
          data: y,
          xAxisId: t,
          yAxisId: r,
          hide: n,
          legendType: i,
          minPointSize: a,
          activeBar: o,
          animationBegin: l,
          animationDuration: u,
          animationEasing: c,
          isAnimationActive: s
        })
      )
    )
  );
}
function MB(e) {
  var t = e.layout,
    r = e.barSettings,
    n = r.dataKey,
    i = r.minPointSize,
    a = r.hasCustomShape,
    o = e.pos,
    l = e.bandSize,
    u = e.xAxis,
    c = e.yAxis,
    s = e.xAxisTicks,
    f = e.yAxisTicks,
    d = e.stackedData,
    h = e.displayedData,
    p = e.offset,
    m = e.cells,
    y = e.parentViewBox,
    g = e.dataStartIndex,
    x = t === 'horizontal' ? c : u,
    A = d ? x.scale.domain() : null,
    w = eO({ numericAxis: x }),
    P = x.scale.map(w);
  return h
    .map((b, S) => {
      var E, C, k, j, I, R;
      if (d) {
        var D = d[S + g];
        if (D == null) return null;
        E = qP(D, A);
      } else ((E = X(b, n)), Array.isArray(E) || (E = [w, E]));
      var $ = L2(i, Nb)(E[1], S);
      if (t === 'horizontal') {
        var z,
          W = c.scale.map(E[0]),
          B = c.scale.map(E[1]);
        if (W == null || B == null) return null;
        ((C = Of({ axis: u, ticks: s, bandSize: l, offset: o.offset, entry: b, index: S })),
          (k = (z = B ?? W) !== null && z !== void 0 ? z : void 0),
          (j = o.size));
        var Y = W - B;
        if (
          ((I = bt(Y) ? 0 : Y),
          (R = { x: C, y: p.top, width: j, height: p.height }),
          Math.abs($) > 0 && Math.abs(I) < Math.abs($))
        ) {
          var K = je(I || $) * (Math.abs($) - Math.abs(I));
          ((k -= K), (I += K));
        }
      } else {
        var pe = u.scale.map(E[0]),
          be = u.scale.map(E[1]);
        if (pe == null || be == null) return null;
        if (
          ((C = pe),
          (k = Of({ axis: c, ticks: f, bandSize: l, offset: o.offset, entry: b, index: S })),
          (j = be - pe),
          (I = o.size),
          (R = { x: p.left, y: k, width: p.width, height: I }),
          Math.abs($) > 0 && Math.abs(j) < Math.abs($))
        ) {
          var de = je(j || $) * (Math.abs($) - Math.abs(j));
          j += de;
        }
      }
      if (C == null || k == null || j == null || I == null || (!a && (j === 0 || I === 0)))
        return null;
      var Ke = Oe(
        Oe({}, b),
        {},
        {
          stackedBarStart: P,
          x: C,
          y: k,
          width: j,
          height: I,
          value: d ? E : E[1],
          payload: b,
          background: R,
          tooltipPosition: { x: C + j / 2, y: k + I / 2 },
          parentViewBox: y,
          originalDataIndex: S
        },
        m && m[S] && m[S].props
      );
      return Ke;
    })
    .filter(Boolean);
}
function DB(e) {
  var t = ge(e, _B),
    r = iB(t.stackId),
    n = Ee();
  return v.createElement(rl, { id: t.id, type: 'bar' }, (i) =>
    v.createElement(
      v.Fragment,
      null,
      v.createElement(Is, { legendPayload: bB(t) }),
      v.createElement(xB, {
        dataKey: t.dataKey,
        stroke: t.stroke,
        strokeWidth: t.strokeWidth,
        fill: t.fill,
        name: t.name,
        hide: t.hide,
        unit: t.unit,
        formatter: t.formatter,
        tooltipType: t.tooltipType,
        id: i
      }),
      v.createElement(js, {
        type: 'bar',
        id: i,
        data: void 0,
        xAxisId: t.xAxisId,
        yAxisId: t.yAxisId,
        zAxisId: 0,
        dataKey: t.dataKey,
        stackId: r,
        hide: t.hide,
        barSize: t.barSize,
        minPointSize: t.minPointSize,
        maxBarSize: t.maxBarSize,
        isPanorama: n,
        hasCustomShape: t.shape != null && t.shape !== Rs
      }),
      v.createElement(Fe, { zIndex: t.zIndex }, v.createElement(TB, fr({}, t, { id: i })))
    )
  );
}
var $B = v.memo(DB, Fr);
$B.displayName = 'Bar';
var NB = ['domain', 'range'],
  LB = ['domain', 'range'];
function Rh(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = RB(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function RB(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Bh(e, t) {
  return e === t
    ? !0
    : Array.isArray(e) && e.length === 2 && Array.isArray(t) && t.length === 2
      ? e[0] === t[0] && e[1] === t[1]
      : !1;
}
function Lb(e, t) {
  if (e === t) return !0;
  var r = e.domain,
    n = e.range,
    i = Rh(e, NB),
    a = t.domain,
    o = t.range,
    l = Rh(t, LB);
  return !Bh(r, a) || !Bh(n, o) ? !1 : Fr(i, l);
}
var BB = ['type'],
  zB = ['dangerouslySetInnerHTML', 'ticks', 'scale'],
  WB = ['id', 'scale'];
function Su() {
  return (
    (Su = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Su.apply(null, arguments)
  );
}
function zh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Wh(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? zh(Object(r), !0).forEach(function (n) {
          FB(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : zh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function FB(e, t, r) {
  return (
    (t = KB(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function KB(e) {
  var t = UB(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function UB(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Eu(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = HB(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function HB(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function VB(e) {
  var t = ee(),
    r = v.useRef(null),
    n = ac(),
    i = e.type,
    a = Eu(e, BB),
    o = go(n, 'xAxis', i),
    l = v.useMemo(() => {
      if (o != null) return Wh(Wh({}, a), {}, { type: o });
    }, [a, o]);
  return (
    v.useLayoutEffect(() => {
      l != null &&
        (r.current === null ? t(eN(l)) : r.current !== l && t(tN({ prev: r.current, next: l })),
        (r.current = l));
    }, [l, t]),
    v.useLayoutEffect(
      () => () => {
        r.current && (t(rN(r.current)), (r.current = null));
      },
      [t]
    ),
    null
  );
}
var YB = (e) => {
    var t = e.xAxisId,
      r = e.className,
      n = e.height,
      i = e.label,
      a = v.useRef(null),
      o = v.useRef(null),
      l = M(tc),
      u = Ee(),
      c = ee(),
      s = 'xAxis',
      f = M((g) => Xg(g, s, t, u)),
      d = M((g) => Yg(g, t)),
      h = M((g) => kj(g, t)),
      p = M((g) => Pg(g, t));
    if (
      (v.useLayoutEffect(() => {
        if (!(n !== 'auto' || !d || No(i) || v.isValidElement(i) || p == null)) {
          var g = a.current;
          if (g) {
            var x = g.getCalculatedHeight();
            Math.round(d.height) !== Math.round(x) && c(lN({ id: t, height: x }));
          }
        }
      }, [f, d, c, i, t, n, p]),
      d == null || h == null || p == null)
    )
      return null;
    (e.dangerouslySetInnerHTML, e.ticks, e.scale);
    var m = Eu(e, zB);
    (p.id, p.scale);
    var y = Eu(p, WB);
    return v.createElement(
      Ts,
      Su({}, m, y, {
        ref: a,
        labelRef: o,
        x: h.x,
        y: h.y,
        width: d.width,
        height: d.height,
        className: Z('recharts-'.concat(s, ' ').concat(s), r),
        viewBox: l,
        ticks: f,
        axisType: s,
        axisId: t
      })
    );
  },
  GB = {
    allowDataOverflow: Ae.allowDataOverflow,
    allowDecimals: Ae.allowDecimals,
    allowDuplicatedCategory: Ae.allowDuplicatedCategory,
    angle: Ae.angle,
    axisLine: Xt.axisLine,
    height: Ae.height,
    hide: !1,
    includeHidden: Ae.includeHidden,
    interval: Ae.interval,
    label: !1,
    minTickGap: Ae.minTickGap,
    mirror: Ae.mirror,
    orientation: Ae.orientation,
    padding: Ae.padding,
    reversed: Ae.reversed,
    scale: Ae.scale,
    tick: Ae.tick,
    tickCount: Ae.tickCount,
    tickLine: Xt.tickLine,
    tickSize: Xt.tickSize,
    type: Ae.type,
    niceTicks: Ae.niceTicks,
    xAxisId: 0
  },
  qB = (e) => {
    var t = ge(e, GB);
    return v.createElement(
      v.Fragment,
      null,
      v.createElement(VB, {
        allowDataOverflow: t.allowDataOverflow,
        allowDecimals: t.allowDecimals,
        allowDuplicatedCategory: t.allowDuplicatedCategory,
        angle: t.angle,
        dataKey: t.dataKey,
        domain: t.domain,
        height: t.height,
        hide: t.hide,
        id: t.xAxisId,
        includeHidden: t.includeHidden,
        interval: t.interval,
        minTickGap: t.minTickGap,
        mirror: t.mirror,
        name: t.name,
        orientation: t.orientation,
        padding: t.padding,
        reversed: t.reversed,
        scale: t.scale,
        tick: t.tick,
        tickCount: t.tickCount,
        tickFormatter: t.tickFormatter,
        ticks: t.ticks,
        type: t.type,
        unit: t.unit,
        niceTicks: t.niceTicks
      }),
      v.createElement(YB, t)
    );
  },
  XB = v.memo(qB, Lb);
XB.displayName = 'XAxis';
var ZB = ['type'],
  QB = ['dangerouslySetInnerHTML', 'ticks', 'scale'],
  JB = ['id', 'scale'];
function Iu() {
  return (
    (Iu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Iu.apply(null, arguments)
  );
}
function Fh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Kh(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Fh(Object(r), !0).forEach(function (n) {
          ez(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Fh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function ez(e, t, r) {
  return (
    (t = tz(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function tz(e) {
  var t = rz(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function rz(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function ku(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = nz(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function nz(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function iz(e) {
  var t = ee(),
    r = v.useRef(null),
    n = ac(),
    i = e.type,
    a = ku(e, ZB),
    o = go(n, 'yAxis', i),
    l = v.useMemo(() => {
      if (o != null) return Kh(Kh({}, a), {}, { type: o });
    }, [o, a]);
  return (
    v.useLayoutEffect(() => {
      l != null &&
        (r.current === null ? t(nN(l)) : r.current !== l && t(iN({ prev: r.current, next: l })),
        (r.current = l));
    }, [l, t]),
    v.useLayoutEffect(
      () => () => {
        r.current && (t(aN(r.current)), (r.current = null));
      },
      [t]
    ),
    null
  );
}
function az(e) {
  var t = e.yAxisId,
    r = e.className,
    n = e.width,
    i = e.label,
    a = v.useRef(null),
    o = v.useRef(null),
    l = M(tc),
    u = Ee(),
    c = ee(),
    s = 'yAxis',
    f = M((g) => Gg(g, t)),
    d = M((g) => jj(g, t)),
    h = M((g) => Xg(g, s, t, u)),
    p = M((g) => Og(g, t));
  if (
    (v.useLayoutEffect(() => {
      if (!(n !== 'auto' || !f || No(i) || v.isValidElement(i) || p == null)) {
        var g = a.current;
        if (g) {
          var x = g.getCalculatedWidth();
          Math.round(f.width) !== Math.round(x) && c(oN({ id: t, width: x }));
        }
      }
    }, [h, f, c, i, t, n, p]),
    f == null || d == null || p == null)
  )
    return null;
  (e.dangerouslySetInnerHTML, e.ticks, e.scale);
  var m = ku(e, QB);
  (p.id, p.scale);
  var y = ku(p, JB);
  return v.createElement(
    Ts,
    Iu({}, m, y, {
      ref: a,
      labelRef: o,
      x: d.x,
      y: d.y,
      tickTextProps: n === 'auto' ? { width: void 0 } : { width: n },
      width: f.width,
      height: f.height,
      className: Z('recharts-'.concat(s, ' ').concat(s), r),
      viewBox: l,
      ticks: h,
      axisType: s,
      axisId: t
    })
  );
}
var oz = {
    allowDataOverflow: Pe.allowDataOverflow,
    allowDecimals: Pe.allowDecimals,
    allowDuplicatedCategory: Pe.allowDuplicatedCategory,
    angle: Pe.angle,
    axisLine: Xt.axisLine,
    hide: !1,
    includeHidden: Pe.includeHidden,
    interval: Pe.interval,
    label: !1,
    minTickGap: Pe.minTickGap,
    mirror: Pe.mirror,
    orientation: Pe.orientation,
    padding: Pe.padding,
    reversed: Pe.reversed,
    scale: Pe.scale,
    tick: Pe.tick,
    tickCount: Pe.tickCount,
    tickLine: Xt.tickLine,
    tickSize: Xt.tickSize,
    type: Pe.type,
    niceTicks: Pe.niceTicks,
    width: Pe.width,
    yAxisId: 0
  },
  lz = (e) => {
    var t = ge(e, oz);
    return v.createElement(
      v.Fragment,
      null,
      v.createElement(iz, {
        interval: t.interval,
        id: t.yAxisId,
        scale: t.scale,
        type: t.type,
        domain: t.domain,
        allowDataOverflow: t.allowDataOverflow,
        dataKey: t.dataKey,
        allowDuplicatedCategory: t.allowDuplicatedCategory,
        allowDecimals: t.allowDecimals,
        tickCount: t.tickCount,
        padding: t.padding,
        includeHidden: t.includeHidden,
        reversed: t.reversed,
        ticks: t.ticks,
        width: t.width,
        orientation: t.orientation,
        mirror: t.mirror,
        hide: t.hide,
        unit: t.unit,
        name: t.name,
        angle: t.angle,
        minTickGap: t.minTickGap,
        tick: t.tick,
        tickFormatter: t.tickFormatter,
        niceTicks: t.niceTicks
      }),
      v.createElement(az, t)
    );
  },
  uz = v.memo(lz, Lb);
uz.displayName = 'YAxis';
var cz = (e, t) => t,
  zs = O([cz, q, Ly, _e, h0, rr, Z_, Se], iT);
function sz(e) {
  return 'getBBox' in e.currentTarget && typeof e.currentTarget.getBBox == 'function';
}
function Ws(e) {
  var t = e.currentTarget.getBoundingClientRect(),
    r,
    n;
  if (sz(e)) {
    var i = e.currentTarget.getBBox();
    ((r = i.width > 0 ? t.width / i.width : 1), (n = i.height > 0 ? t.height / i.height : 1));
  } else {
    var a = e.currentTarget;
    ((r = a.offsetWidth > 0 ? t.width / a.offsetWidth : 1),
      (n = a.offsetHeight > 0 ? t.height / a.offsetHeight : 1));
  }
  var o = (l, u) => ({
    relativeX: Math.round((l - t.left) / r),
    relativeY: Math.round((u - t.top) / n)
  });
  return 'touches' in e
    ? Array.from(e.touches).map((l) => o(l.clientX, l.clientY))
    : o(e.clientX, e.clientY);
}
var Rb = tt('mouseClick'),
  Bb = ui();
Bb.startListening({
  actionCreator: Rb,
  effect: (e, t) => {
    var r = e.payload,
      n = zs(t.getState(), Ws(r));
    (n == null ? void 0 : n.activeIndex) != null &&
      t.dispatch(
        Vj({
          activeIndex: n.activeIndex,
          activeDataKey: void 0,
          activeCoordinate: n.activeCoordinate
        })
      );
  }
});
var Cu = tt('mouseMove'),
  zb = ui(),
  Zr = null,
  xr = null,
  Ml = null;
zb.startListening({
  actionCreator: Cu,
  effect: (e, t) => {
    var r = e.payload,
      n = t.getState(),
      i = n.eventSettings,
      a = i.throttleDelay,
      o = i.throttledEvents,
      l = o === 'all' || (o == null ? void 0 : o.includes('mousemove'));
    (Zr !== null && (cancelAnimationFrame(Zr), (Zr = null)),
      xr !== null && (typeof a != 'number' || !l) && (clearTimeout(xr), (xr = null)),
      (Ml = Ws(r)));
    var u = () => {
      var c = t.getState(),
        s = Ii(c, c.tooltip.settings.shared);
      if (!Ml) {
        ((Zr = null), (xr = null));
        return;
      }
      if (s === 'axis') {
        var f = zs(c, Ml);
        (f == null ? void 0 : f.activeIndex) != null
          ? t.dispatch(
              i0({
                activeIndex: f.activeIndex,
                activeDataKey: void 0,
                activeCoordinate: f.activeCoordinate
              })
            )
          : t.dispatch(n0());
      }
      ((Zr = null), (xr = null));
    };
    if (!l) {
      u();
      return;
    }
    a === 'raf'
      ? (Zr = requestAnimationFrame(u))
      : typeof a == 'number' && xr === null && (xr = setTimeout(u, a));
  }
});
function fz(e, t) {
  return t instanceof HTMLElement
    ? 'HTMLElement <'.concat(t.tagName, ' class="').concat(t.className, '">')
    : t === window
      ? 'global.window'
      : e === 'children' && typeof t == 'object' && t !== null
        ? '<<CHILDREN>>'
        : t;
}
var Uh = {
    accessibilityLayer: !0,
    barCategoryGap: '10%',
    barGap: 4,
    barSize: void 0,
    className: void 0,
    maxBarSize: void 0,
    stackOffset: 'none',
    syncId: void 0,
    syncMethod: 'index',
    baseValue: void 0,
    reverseStackOrder: !1
  },
  Wb = We({
    name: 'rootProps',
    initialState: Uh,
    reducers: {
      updateOptions: (e, t) => {
        var r;
        ((e.accessibilityLayer = t.payload.accessibilityLayer),
          (e.barCategoryGap = t.payload.barCategoryGap),
          (e.barGap = (r = t.payload.barGap) !== null && r !== void 0 ? r : Uh.barGap),
          (e.barSize = t.payload.barSize),
          (e.maxBarSize = t.payload.maxBarSize),
          (e.stackOffset = t.payload.stackOffset),
          (e.syncId = t.payload.syncId),
          (e.syncMethod = t.payload.syncMethod),
          (e.className = t.payload.className),
          (e.baseValue = t.payload.baseValue),
          (e.reverseStackOrder = t.payload.reverseStackOrder));
      }
    }
  }),
  dz = Wb.reducer,
  vz = Wb.actions.updateOptions,
  hz = null,
  pz = {
    updatePolarOptions: (e, t) =>
      e === null
        ? t.payload
        : ((e.startAngle = t.payload.startAngle),
          (e.endAngle = t.payload.endAngle),
          (e.cx = t.payload.cx),
          (e.cy = t.payload.cy),
          (e.innerRadius = t.payload.innerRadius),
          (e.outerRadius = t.payload.outerRadius),
          e)
  },
  Fb = We({ name: 'polarOptions', initialState: hz, reducers: pz }),
  mz = Fb.actions.updatePolarOptions,
  yz = Fb.reducer,
  Kb = tt('keyDown'),
  Ub = tt('focus'),
  Hb = tt('blur'),
  ol = ui(),
  Qr = null,
  wr = null,
  Vi = null;
ol.startListening({
  actionCreator: Kb,
  effect: (e, t) => {
    ((Vi = e.payload), Qr !== null && (cancelAnimationFrame(Qr), (Qr = null)));
    var r = t.getState(),
      n = r.eventSettings,
      i = n.throttleDelay,
      a = n.throttledEvents,
      o = a === 'all' || a.includes('keydown');
    wr !== null && (typeof i != 'number' || !o) && (clearTimeout(wr), (wr = null));
    var l = () => {
      try {
        var u = t.getState(),
          c = u.rootProps.accessibilityLayer !== !1;
        if (!c) return;
        var s = u.tooltip.keyboardInteraction,
          f = Vi;
        if (f !== 'ArrowRight' && f !== 'ArrowLeft' && f !== 'Enter') return;
        var d = Fn(s, Br(u), vn(u), pn(u)),
          h = d == null ? -1 : Number(d),
          p = !Number.isFinite(h) || h < 0,
          m = rr(u),
          y = Br(u),
          g = Ii(u, u.tooltip.settings.shared);
        if (f === 'Enter') {
          if (p) return;
          var x = Ra(u, g, 'hover', String(s.index));
          t.dispatch(La({ active: !s.active, activeIndex: s.index, activeCoordinate: x }));
          return;
        }
        var A = $j(u),
          w = A === 'left-to-right' ? 1 : -1,
          P = f === 'ArrowRight' ? 1 : -1,
          b;
        if (p) {
          var S = vn(u),
            E = pn(u),
            C = P * w,
            k = ($) => ({
              active: !1,
              index: String($),
              dataKey: void 0,
              graphicalItemId: void 0,
              coordinate: void 0
            });
          if (((b = -1), C > 0)) {
            for (var j = 0; j < y.length; j++)
              if (Fn(k(j), y, S, E) != null) {
                b = j;
                break;
              }
          } else
            for (var I = y.length - 1; I >= 0; I--)
              if (Fn(k(I), y, S, E) != null) {
                b = I;
                break;
              }
          if (b < 0) return;
        } else {
          b = h + P * w;
          var R = (m == null ? void 0 : m.length) || y.length;
          if (R === 0 || b >= R || b < 0) return;
        }
        var D = Ra(u, g, 'hover', String(b));
        t.dispatch(La({ active: !0, activeIndex: b.toString(), activeCoordinate: D }));
      } finally {
        ((Qr = null), (wr = null));
      }
    };
    if (!o) {
      l();
      return;
    }
    i === 'raf'
      ? (Qr = requestAnimationFrame(l))
      : typeof i == 'number' &&
        wr === null &&
        (l(),
        (Vi = null),
        (wr = setTimeout(() => {
          Vi ? l() : ((wr = null), (Qr = null));
        }, i)));
  }
});
ol.startListening({
  actionCreator: Ub,
  effect: (e, t) => {
    var r = t.getState(),
      n = r.rootProps.accessibilityLayer !== !1;
    if (n) {
      var i = r.tooltip.keyboardInteraction;
      if (!i.active && i.index == null) {
        var a = '0',
          o = Ii(r, r.tooltip.settings.shared),
          l = Ra(r, o, 'hover', String(a));
        t.dispatch(La({ active: !0, activeIndex: a, activeCoordinate: l }));
      }
    }
  }
});
ol.startListening({
  actionCreator: Hb,
  effect: (e, t) => {
    var r = t.getState(),
      n = r.rootProps.accessibilityLayer !== !1;
    if (n) {
      var i = r.tooltip.keyboardInteraction;
      i.active &&
        t.dispatch(La({ active: !1, activeIndex: i.index, activeCoordinate: i.coordinate }));
    }
  }
});
function Vb(e) {
  e.persist();
  var t = e.currentTarget;
  return new Proxy(e, {
    get: (r, n) => {
      if (n === 'currentTarget') return t;
      var i = Reflect.get(r, n);
      return typeof i == 'function' ? i.bind(r) : i;
    }
  });
}
var it = tt('externalEvent'),
  Yb = ui(),
  Yi = new Map(),
  Nn = new Map(),
  Dl = new Map();
Yb.startListening({
  actionCreator: it,
  effect: (e, t) => {
    var r = e.payload,
      n = r.handler,
      i = r.reactEvent;
    if (n != null) {
      var a = i.type,
        o = Vb(i);
      Dl.set(a, { handler: n, reactEvent: o });
      var l = Yi.get(a);
      l !== void 0 && (cancelAnimationFrame(l), Yi.delete(a));
      var u = t.getState(),
        c = u.eventSettings,
        s = c.throttleDelay,
        f = c.throttledEvents,
        d = f,
        h = d === 'all' || (d == null ? void 0 : d.includes(a)),
        p = Nn.get(a);
      p !== void 0 && (typeof s != 'number' || !h) && (clearTimeout(p), Nn.delete(a));
      var m = () => {
        var x = Dl.get(a);
        try {
          if (!x) return;
          var A = x.handler,
            w = x.reactEvent,
            P = t.getState(),
            b = {
              activeCoordinate: N_(P),
              activeDataKey: fs(P),
              activeIndex: sr(P),
              activeLabel: y0(P),
              activeTooltipIndex: sr(P),
              isTooltipActive: L_(P)
            };
          A && A(b, w);
        } finally {
          (Yi.delete(a), Nn.delete(a), Dl.delete(a));
        }
      };
      if (!h) {
        m();
        return;
      }
      if (s === 'raf') {
        var y = requestAnimationFrame(m);
        Yi.set(a, y);
      } else if (typeof s == 'number') {
        if (!Nn.has(a)) {
          m();
          var g = setTimeout(m, s);
          Nn.set(a, g);
        }
      } else m();
    }
  }
});
var gz = O([On], (e) => e.tooltipItemPayloads),
  bz = O([gz, (e, t) => t, (e, t, r) => r], (e, t, r) => {
    if (t != null) {
      var n = e.find((a) => a.settings.graphicalItemId === r);
      if (n != null) {
        var i = n.getPosition;
        if (i != null) return i(t);
      }
    }
  }),
  Gb = tt('touchMove'),
  qb = ui(),
  Ar = null,
  nr = null,
  Hh = null,
  Ln = null;
qb.startListening({
  actionCreator: Gb,
  effect: (e, t) => {
    var r = e.payload;
    if (!(r.touches == null || r.touches.length === 0)) {
      Ln = Vb(r);
      var n = t.getState(),
        i = n.eventSettings,
        a = i.throttleDelay,
        o = i.throttledEvents,
        l = o === 'all' || o.includes('touchmove');
      (Ar !== null && (cancelAnimationFrame(Ar), (Ar = null)),
        nr !== null && (typeof a != 'number' || !l) && (clearTimeout(nr), (nr = null)),
        (Hh = Array.from(r.touches).map((c) =>
          Ws({ clientX: c.clientX, clientY: c.clientY, currentTarget: r.currentTarget })
        )));
      var u = () => {
        if (Ln != null) {
          var c = t.getState(),
            s = Ii(c, c.tooltip.settings.shared);
          if (s === 'axis') {
            var f,
              d = (f = Hh) === null || f === void 0 ? void 0 : f[0];
            if (d == null) {
              ((Ar = null), (nr = null));
              return;
            }
            var h = zs(c, d);
            (h == null ? void 0 : h.activeIndex) != null &&
              t.dispatch(
                i0({
                  activeIndex: h.activeIndex,
                  activeDataKey: void 0,
                  activeCoordinate: h.activeCoordinate
                })
              );
          } else if (s === 'item') {
            var p,
              m = Ln.touches[0];
            if (document.elementFromPoint == null || m == null) return;
            var y = document.elementFromPoint(m.clientX, m.clientY);
            if (!y || !y.getAttribute) return;
            var g = y.getAttribute(Ym),
              x = (p = y.getAttribute(Gm)) !== null && p !== void 0 ? p : void 0,
              A = Hr(c).find((b) => b.id === x);
            if (g == null || A == null || x == null) return;
            var w = A.dataKey,
              P = bz(c, g, x);
            t.dispatch(
              r0({
                activeDataKey: w,
                activeIndex: g,
                activeCoordinate: P,
                activeGraphicalItemId: x
              })
            );
          }
          ((Ar = null), (nr = null));
        }
      };
      if (!l) {
        u();
        return;
      }
      a === 'raf'
        ? (Ar = requestAnimationFrame(u))
        : typeof a == 'number' &&
          nr === null &&
          (u(),
          (Ln = null),
          (nr = setTimeout(() => {
            Ln ? u() : ((nr = null), (Ar = null));
          }, a)));
    }
  }
});
var Fs = {
    throttleDelay: 'raf',
    throttledEvents: ['mousemove', 'touchmove', 'pointermove', 'scroll', 'wheel']
  },
  Xb = We({
    name: 'eventSettings',
    initialState: Fs,
    reducers: {
      setEventSettings: (e, t) => {
        (t.payload.throttleDelay != null && (e.throttleDelay = t.payload.throttleDelay),
          t.payload.throttledEvents != null && (e.throttledEvents = Q(t.payload.throttledEvents)));
      }
    }
  }),
  xz = Xb.actions.setEventSettings,
  wz = Xb.reducer,
  Az = pm({
    brush: jN,
    cartesianAxis: uN,
    chartData: MT,
    errorBars: gR,
    eventSettings: wz,
    graphicalItems: s$,
    layout: UP,
    legend: UO,
    options: kT,
    polarAxis: mD,
    polarOptions: yz,
    referenceElements: RN,
    renderedTicks: PL,
    rootProps: dz,
    tooltip: Yj,
    zIndex: yT
  }),
  Pz = function (t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Chart';
    return pP({
      reducer: Az,
      preloadedState: t,
      middleware: (n) => {
        var i;
        return n({
          serializableCheck: !1,
          immutableCheck: !['commonjs', 'es6', 'production'].includes(
            (i = 'es6') !== null && i !== void 0 ? i : ''
          )
        }).concat([Bb.middleware, zb.middleware, ol.middleware, Yb.middleware, qb.middleware]);
      },
      enhancers: (n) => {
        var i = n;
        return (typeof n == 'function' && (i = n()), i.concat(jm({ type: 'raf' })));
      },
      devTools: { serialize: { replacer: fz }, name: 'recharts-'.concat(r) }
    });
  };
function Zb(e) {
  var t = e.preloadedState,
    r = e.children,
    n = e.reduxStoreName,
    i = Ee(),
    a = v.useRef(null);
  if (i) return r;
  a.current == null && (a.current = Pz(t, n));
  var o = Vu;
  return v.createElement(d1, { context: o, store: a.current }, r);
}
function Oz(e) {
  var t = e.layout,
    r = e.margin,
    n = ee(),
    i = Ee();
  return (
    v.useEffect(() => {
      i || (n(WP(t)), n(zP(r)));
    }, [n, i, t, r]),
    null
  );
}
var Qb = v.memo(Oz, Fr);
function Jb(e) {
  var t = ee();
  return (
    v.useEffect(() => {
      t(vz(e));
    }, [t, e]),
    null
  );
}
var Sz = (e) => {
    var t = ee();
    return (
      v.useEffect(() => {
        t(xz(e));
      }, [t, e]),
      null
    );
  },
  ex = v.memo(Sz, Fr);
function Vh(e) {
  var t = e.zIndex,
    r = e.isPanorama,
    n = v.useRef(null),
    i = ee();
  return (
    v.useLayoutEffect(
      () => (
        n.current && i(pT({ zIndex: t, element: n.current, isPanorama: r })),
        () => {
          i(mT({ zIndex: t, isPanorama: r }));
        }
      ),
      [i, t, r]
    ),
    v.createElement('g', { tabIndex: -1, ref: n, className: 'recharts-zIndex-layer_'.concat(t) })
  );
}
function Yh(e) {
  var t = e.children,
    r = e.isPanorama,
    n = M(oT);
  if (!n || n.length === 0) return t;
  var i = n.filter((o) => o < 0),
    a = n.filter((o) => o > 0);
  return v.createElement(
    v.Fragment,
    null,
    i.map((o) => v.createElement(Vh, { key: o, zIndex: o, isPanorama: r })),
    t,
    a.map((o) => v.createElement(Vh, { key: o, zIndex: o, isPanorama: r }))
  );
}
var Ez = ['children'];
function Iz(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = kz(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function kz(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Ga() {
  return (
    (Ga = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Ga.apply(null, arguments)
  );
}
var Cz = { width: '100%', height: '100%', display: 'block' },
  jz = v.forwardRef((e, t) => {
    var r = nc(),
      n = ic(),
      i = ay();
    if (!Dt(r) || !Dt(n)) return null;
    var a = e.children,
      o = e.otherAttributes,
      l = e.title,
      u = e.desc,
      c,
      s;
    return (
      o != null &&
        (typeof o.tabIndex == 'number' ? (c = o.tabIndex) : (c = i ? 0 : void 0),
        typeof o.role == 'string' ? (s = o.role) : (s = i ? 'application' : void 0)),
      v.createElement(
        Du,
        Ga({}, o, {
          title: l,
          desc: u,
          role: s,
          tabIndex: c,
          width: r,
          height: n,
          style: Cz,
          ref: t
        }),
        a
      )
    );
  }),
  _z = (e) => {
    var t = e.children,
      r = M(mo);
    if (!r) return null;
    var n = r.width,
      i = r.height,
      a = r.y,
      o = r.x;
    return v.createElement(Du, { width: n, height: i, x: o, y: a }, t);
  },
  Gh = v.forwardRef((e, t) => {
    var r = e.children,
      n = Iz(e, Ez),
      i = Ee();
    return i
      ? v.createElement(_z, null, v.createElement(Yh, { isPanorama: !0 }, r))
      : v.createElement(jz, Ga({ ref: t }, n), v.createElement(Yh, { isPanorama: !1 }, r));
  });
function Tz(e, t) {
  return Nz(e) || $z(e, t) || Dz(e, t) || Mz();
}
function Mz() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Dz(e, t) {
  if (e) {
    if (typeof e == 'string') return qh(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? qh(e, t)
          : void 0
    );
  }
}
function qh(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function $z(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function Nz(e) {
  if (Array.isArray(e)) return e;
}
function Lz() {
  var e = ee(),
    t = v.useState(null),
    r = Tz(t, 2),
    n = r[0],
    i = r[1],
    a = M(oO);
  return (
    v.useEffect(() => {
      if (n != null) {
        var o = n.getBoundingClientRect(),
          l = o.width / n.offsetWidth;
        H(l) && l !== a && e(KP(l));
      }
    }, [n, e, a]),
    i
  );
}
function Xh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Rz(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Xh(Object(r), !0).forEach(function (n) {
          Bz(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Xh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Bz(e, t, r) {
  return (
    (t = zz(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function zz(e) {
  var t = Wz(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Wz(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function ur() {
  return (
    (ur = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    ur.apply(null, arguments)
  );
}
function qa(e, t) {
  return Hz(e) || Uz(e, t) || Kz(e, t) || Fz();
}
function Fz() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kz(e, t) {
  if (e) {
    if (typeof e == 'string') return Zh(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return (
      r === 'Object' && e.constructor && (r = e.constructor.name),
      r === 'Map' || r === 'Set'
        ? Array.from(e)
        : r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
          ? Zh(e, t)
          : void 0
    );
  }
}
function Zh(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Uz(e, t) {
  var r = e == null ? null : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (r != null) {
    var n,
      i,
      a,
      o,
      l = [],
      u = !0,
      c = !1;
    try {
      if (((a = (r = r.call(e)).next), t !== 0))
        for (; !(u = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); u = !0);
    } catch (s) {
      ((c = !0), (i = s));
    } finally {
      try {
        if (!u && r.return != null && ((o = r.return()), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function Hz(e) {
  if (Array.isArray(e)) return e;
}
var Vz = () => (FT(), null);
function Xa(e) {
  if (typeof e == 'number') return e;
  if (typeof e == 'string') {
    var t = parseFloat(e);
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}
var Yz = v.forwardRef((e, t) => {
    var r,
      n,
      i = v.useRef(null),
      a = v.useState({
        containerWidth: Xa((r = e.style) === null || r === void 0 ? void 0 : r.width),
        containerHeight: Xa((n = e.style) === null || n === void 0 ? void 0 : n.height)
      }),
      o = qa(a, 2),
      l = o[0],
      u = o[1],
      c = v.useCallback((f, d) => {
        u((h) => {
          var p = Math.round(f),
            m = Math.round(d);
          return h.containerWidth === p && h.containerHeight === m
            ? h
            : { containerWidth: p, containerHeight: m };
        });
      }, []),
      s = v.useCallback(
        (f) => {
          if (
            (typeof t == 'function' && t(f),
            i.current != null && (i.current.disconnect(), (i.current = null)),
            f != null && typeof ResizeObserver < 'u')
          ) {
            var d = f.getBoundingClientRect(),
              h = d.width,
              p = d.height;
            c(h, p);
            var m = (g) => {
                var x = g[0];
                if (x != null) {
                  var A = x.contentRect,
                    w = A.width,
                    P = A.height;
                  c(w, P);
                }
              },
              y = new ResizeObserver(m);
            (y.observe(f), (i.current = y));
          }
        },
        [t, c]
      );
    return (
      v.useEffect(
        () => () => {
          var f = i.current;
          f != null && f.disconnect();
        },
        [c]
      ),
      v.createElement(
        v.Fragment,
        null,
        v.createElement(fi, { width: l.containerWidth, height: l.containerHeight }),
        v.createElement('div', ur({ ref: s }, e))
      )
    );
  }),
  Gz = v.forwardRef((e, t) => {
    var r = e.width,
      n = e.height,
      i = v.useState({ containerWidth: Xa(r), containerHeight: Xa(n) }),
      a = qa(i, 2),
      o = a[0],
      l = a[1],
      u = v.useCallback((s, f) => {
        l((d) => {
          var h = Math.round(s),
            p = Math.round(f);
          return d.containerWidth === h && d.containerHeight === p
            ? d
            : { containerWidth: h, containerHeight: p };
        });
      }, []),
      c = v.useCallback(
        (s) => {
          if ((typeof t == 'function' && t(s), s != null)) {
            var f = s.getBoundingClientRect(),
              d = f.width,
              h = f.height;
            u(d, h);
          }
        },
        [t, u]
      );
    return v.createElement(
      v.Fragment,
      null,
      v.createElement(fi, { width: o.containerWidth, height: o.containerHeight }),
      v.createElement('div', ur({ ref: c }, e))
    );
  }),
  qz = v.forwardRef((e, t) => {
    var r = e.width,
      n = e.height;
    return v.createElement(
      v.Fragment,
      null,
      v.createElement(fi, { width: r, height: n }),
      v.createElement('div', ur({ ref: t }, e))
    );
  }),
  Xz = v.forwardRef((e, t) => {
    var r = e.width,
      n = e.height;
    return typeof r == 'string' || typeof n == 'string'
      ? v.createElement(Gz, ur({}, e, { ref: t }))
      : typeof r == 'number' && typeof n == 'number'
        ? v.createElement(qz, ur({}, e, { width: r, height: n, ref: t }))
        : v.createElement(
            v.Fragment,
            null,
            v.createElement(fi, { width: r, height: n }),
            v.createElement('div', ur({ ref: t }, e))
          );
  });
function Zz(e) {
  return e ? Yz : Xz;
}
var Qz = v.forwardRef((e, t) => {
    var r = e.children,
      n = e.className,
      i = e.height,
      a = e.onClick,
      o = e.onContextMenu,
      l = e.onDoubleClick,
      u = e.onMouseDown,
      c = e.onMouseEnter,
      s = e.onMouseLeave,
      f = e.onMouseMove,
      d = e.onMouseUp,
      h = e.onTouchEnd,
      p = e.onTouchMove,
      m = e.onTouchStart,
      y = e.style,
      g = e.width,
      x = e.responsive,
      A = e.dispatchTouchEvents,
      w = A === void 0 ? !0 : A,
      P = v.useRef(null),
      b = ee(),
      S = v.useState(null),
      E = qa(S, 2),
      C = E[0],
      k = E[1],
      j = v.useState(null),
      I = qa(j, 2),
      R = I[0],
      D = I[1],
      $ = Lz(),
      z = rc(),
      W = (z == null ? void 0 : z.width) > 0 ? z.width : g,
      B = (z == null ? void 0 : z.height) > 0 ? z.height : i,
      Y = v.useCallback(
        (F) => {
          ($(F), typeof t == 'function' && t(F), k(F), D(F), F != null && (P.current = F));
        },
        [$, t, k, D]
      ),
      K = v.useCallback(
        (F) => {
          (b(Rb(F)), b(it({ handler: a, reactEvent: F })));
        },
        [b, a]
      ),
      pe = v.useCallback(
        (F) => {
          (b(Cu(F)), b(it({ handler: c, reactEvent: F })));
        },
        [b, c]
      ),
      be = v.useCallback(
        (F) => {
          (b(n0()), b(it({ handler: s, reactEvent: F })));
        },
        [b, s]
      ),
      de = v.useCallback(
        (F) => {
          (b(Cu(F)), b(it({ handler: f, reactEvent: F })));
        },
        [b, f]
      ),
      Ke = v.useCallback(() => {
        b(Ub());
      }, [b]),
      Xe = v.useCallback(() => {
        b(Hb());
      }, [b]),
      ht = v.useCallback(
        (F) => {
          b(Kb(F.key));
        },
        [b]
      ),
      pt = v.useCallback(
        (F) => {
          b(it({ handler: o, reactEvent: F }));
        },
        [b, o]
      ),
      In = v.useCallback(
        (F) => {
          b(it({ handler: l, reactEvent: F }));
        },
        [b, l]
      ),
      N = v.useCallback(
        (F) => {
          b(it({ handler: u, reactEvent: F }));
        },
        [b, u]
      ),
      V = v.useCallback(
        (F) => {
          b(it({ handler: d, reactEvent: F }));
        },
        [b, d]
      ),
      U = v.useCallback(
        (F) => {
          b(it({ handler: m, reactEvent: F }));
        },
        [b, m]
      ),
      _ = v.useCallback(
        (F) => {
          (w && b(Gb(F)), b(it({ handler: p, reactEvent: F })));
        },
        [b, w, p]
      ),
      Ne = v.useCallback(
        (F) => {
          b(it({ handler: h, reactEvent: F }));
        },
        [b, h]
      ),
      te = Zz(x);
    return v.createElement(
      E0.Provider,
      { value: C },
      v.createElement(
        mp.Provider,
        { value: R },
        v.createElement(
          te,
          {
            width: W ?? (y == null ? void 0 : y.width),
            height: B ?? (y == null ? void 0 : y.height),
            className: Z('recharts-wrapper', n),
            style: Rz({ position: 'relative', cursor: 'default', width: W, height: B }, y),
            onClick: K,
            onContextMenu: pt,
            onDoubleClick: In,
            onFocus: Ke,
            onBlur: Xe,
            onKeyDown: ht,
            onMouseDown: N,
            onMouseEnter: pe,
            onMouseLeave: be,
            onMouseMove: de,
            onMouseUp: V,
            onTouchEnd: Ne,
            onTouchMove: _,
            onTouchStart: U,
            ref: Y
          },
          v.createElement(Vz, null),
          r
        )
      )
    );
  }),
  Jz = [
    'width',
    'height',
    'responsive',
    'children',
    'className',
    'style',
    'compact',
    'title',
    'desc'
  ];
function eW(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = tW(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function tW(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var tx = v.forwardRef((e, t) => {
  var r = e.width,
    n = e.height,
    i = e.responsive,
    a = e.children,
    o = e.className,
    l = e.style,
    u = e.compact,
    c = e.title,
    s = e.desc,
    f = eW(e, Jz),
    d = Ve(f);
  return u
    ? v.createElement(
        v.Fragment,
        null,
        v.createElement(fi, { width: r, height: n }),
        v.createElement(Gh, { otherAttributes: d, title: c, desc: s }, a)
      )
    : v.createElement(
        Qz,
        {
          className: o,
          style: l,
          width: r,
          height: n,
          responsive: i ?? !1,
          onClick: e.onClick,
          onMouseLeave: e.onMouseLeave,
          onMouseEnter: e.onMouseEnter,
          onMouseMove: e.onMouseMove,
          onMouseDown: e.onMouseDown,
          onMouseUp: e.onMouseUp,
          onContextMenu: e.onContextMenu,
          onDoubleClick: e.onDoubleClick,
          onTouchStart: e.onTouchStart,
          onTouchMove: e.onTouchMove,
          onTouchEnd: e.onTouchEnd
        },
        v.createElement(
          Gh,
          { otherAttributes: d, title: c, desc: s, ref: t },
          v.createElement(UN, null, a)
        )
      );
});
function ju() {
  return (
    (ju = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    ju.apply(null, arguments)
  );
}
function Qh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function rW(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Qh(Object(r), !0).forEach(function (n) {
          nW(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Qh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function nW(e, t, r) {
  return (
    (t = iW(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function iW(e) {
  var t = aW(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function aW(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var oW = { top: 5, right: 5, bottom: 5, left: 5 },
  lW = rW(
    {
      accessibilityLayer: !0,
      barCategoryGap: '10%',
      barGap: 4,
      layout: 'horizontal',
      margin: oW,
      responsive: !1,
      reverseStackOrder: !1,
      stackOffset: 'none',
      syncMethod: 'index'
    },
    Fs
  ),
  Ks = v.forwardRef(function (t, r) {
    var n,
      i = ge(t.categoricalChartProps, lW),
      a = t.chartName,
      o = t.defaultTooltipEventType,
      l = t.validateTooltipEventTypes,
      u = t.tooltipPayloadSearcher,
      c = t.categoricalChartProps,
      s = {
        chartName: a,
        defaultTooltipEventType: o,
        validateTooltipEventTypes: l,
        tooltipPayloadSearcher: u,
        eventEmitter: void 0
      };
    return v.createElement(
      Zb,
      {
        preloadedState: { options: s },
        reduxStoreName: (n = c.id) !== null && n !== void 0 ? n : a
      },
      v.createElement(ub, { chartData: c.data }),
      v.createElement(Qb, { layout: i.layout, margin: i.margin }),
      v.createElement(ex, { throttleDelay: i.throttleDelay, throttledEvents: i.throttledEvents }),
      v.createElement(Jb, {
        baseValue: i.baseValue,
        accessibilityLayer: i.accessibilityLayer,
        barCategoryGap: i.barCategoryGap,
        maxBarSize: i.maxBarSize,
        stackOffset: i.stackOffset,
        barGap: i.barGap,
        barSize: i.barSize,
        syncId: i.syncId,
        syncMethod: i.syncMethod,
        className: i.className,
        reverseStackOrder: i.reverseStackOrder
      }),
      v.createElement(tx, ju({}, i, { ref: r }))
    );
  }),
  uW = ['axis'],
  _W = v.forwardRef((e, t) =>
    v.createElement(Ks, {
      chartName: 'LineChart',
      defaultTooltipEventType: 'axis',
      validateTooltipEventTypes: uW,
      tooltipPayloadSearcher: Mo,
      categoricalChartProps: e,
      ref: t
    })
  ),
  cW = ['axis', 'item'],
  TW = v.forwardRef((e, t) =>
    v.createElement(Ks, {
      chartName: 'BarChart',
      defaultTooltipEventType: 'axis',
      validateTooltipEventTypes: cW,
      tooltipPayloadSearcher: Mo,
      categoricalChartProps: e,
      ref: t
    })
  );
function sW(e) {
  var t = ee();
  return (
    v.useEffect(() => {
      t(mz(e));
    }, [t, e]),
    null
  );
}
var fW = ['layout'];
function _u() {
  return (
    (_u = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    _u.apply(null, arguments)
  );
}
function dW(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = vW(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function vW(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Jh(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function hW(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Jh(Object(r), !0).forEach(function (n) {
          pW(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Jh(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function pW(e, t, r) {
  return (
    (t = mW(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function mW(e) {
  var t = yW(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function yW(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var gW = { top: 5, right: 5, bottom: 5, left: 5 },
  rx = hW(
    {
      accessibilityLayer: !0,
      stackOffset: 'none',
      barCategoryGap: '10%',
      barGap: 4,
      margin: gW,
      reverseStackOrder: !1,
      syncMethod: 'index',
      layout: 'radial',
      responsive: !1,
      cx: '50%',
      cy: '50%',
      innerRadius: 0,
      outerRadius: '80%'
    },
    Fs
  ),
  bW = v.forwardRef(function (t, r) {
    var n,
      i = ge(t.categoricalChartProps, rx),
      a = i.layout,
      o = dW(i, fW),
      l = t.chartName,
      u = t.defaultTooltipEventType,
      c = t.validateTooltipEventTypes,
      s = t.tooltipPayloadSearcher,
      f = {
        chartName: l,
        defaultTooltipEventType: u,
        validateTooltipEventTypes: c,
        tooltipPayloadSearcher: s,
        eventEmitter: void 0
      };
    return v.createElement(
      Zb,
      {
        preloadedState: { options: f },
        reduxStoreName: (n = i.id) !== null && n !== void 0 ? n : l
      },
      v.createElement(ub, { chartData: i.data }),
      v.createElement(Qb, { layout: a, margin: i.margin }),
      v.createElement(ex, { throttleDelay: i.throttleDelay, throttledEvents: i.throttledEvents }),
      v.createElement(Jb, {
        baseValue: void 0,
        accessibilityLayer: i.accessibilityLayer,
        barCategoryGap: i.barCategoryGap,
        maxBarSize: i.maxBarSize,
        stackOffset: i.stackOffset,
        barGap: i.barGap,
        barSize: i.barSize,
        syncId: i.syncId,
        syncMethod: i.syncMethod,
        className: i.className,
        reverseStackOrder: i.reverseStackOrder
      }),
      v.createElement(sW, {
        cx: i.cx,
        cy: i.cy,
        startAngle: i.startAngle,
        endAngle: i.endAngle,
        innerRadius: i.innerRadius,
        outerRadius: i.outerRadius
      }),
      v.createElement(tx, _u({}, o, { ref: r }))
    );
  });
function ep(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function tp(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? ep(Object(r), !0).forEach(function (n) {
          xW(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : ep(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function xW(e, t, r) {
  return (
    (t = wW(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function wW(e) {
  var t = AW(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function AW(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var PW = ['item'],
  OW = tp(tp({}, rx), {}, { layout: 'centric', startAngle: 0, endAngle: 360 }),
  MW = v.forwardRef((e, t) => {
    var r = ge(e, OW);
    return v.createElement(bW, {
      chartName: 'PieChart',
      defaultTooltipEventType: 'item',
      validateTooltipEventTypes: PW,
      tooltipPayloadSearcher: Mo,
      categoricalChartProps: r,
      ref: t
    });
  }),
  SW = ['axis'],
  DW = v.forwardRef((e, t) =>
    v.createElement(Ks, {
      chartName: 'AreaChart',
      defaultTooltipEventType: 'axis',
      validateTooltipEventTypes: SW,
      tooltipPayloadSearcher: Mo,
      categoricalChartProps: e,
      ref: t
    })
  );
export {
  DW as A,
  TW as B,
  oR as C,
  B1 as L,
  MW as P,
  CW as R,
  jW as T,
  XB as X,
  uz as Y,
  _2 as a,
  W$ as b,
  Z as c,
  Do as d,
  _W as e,
  ZR as f,
  $B as g,
  iL as h,
  kW as u
};
