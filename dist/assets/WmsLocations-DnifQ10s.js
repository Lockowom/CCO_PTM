import { d as P, j as a } from './query-vendor-BNjBrM5A.js';
import { r as C, b as B, R as q } from './react-vendor-6aw4XXjH.js';
import { u as H } from './warehouseStore-BJj2xS2T.js';
import { u as J, s as G } from './index-BOgf3xmh.js';
import { C as X } from './CalidadBadge-Dqgqyxy5.js';
import {
  m as Q,
  x as W,
  X as Z,
  aS as Y,
  a1 as ee,
  R as te,
  n as se,
  g as ne,
  aM as ie,
  d as oe
} from './ui-vendor-naG2PYVT.js';
import './index-DH2X3u_W.js';
import './charts-vendor-7leLLwOT.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
import './calidadService-DKsWhgj7.js';
function le(l, h, e) {
  const s = new Array(l);
  return new Proxy(s, {
    get(n, t, o) {
      if (typeof t == 'string') {
        const i = t.charCodeAt(0);
        if (i >= 48 && i <= 57) {
          const r = +t;
          if (Number.isInteger(r) && r >= 0 && r < l) {
            let c = n[r];
            if (!c) {
              const d = h[r * 2];
              c = n[r] = {
                index: r,
                key: e(r),
                start: d,
                size: h[r * 2 + 1],
                end: d + h[r * 2 + 1],
                lane: 0
              };
            }
            return c;
          }
        }
        if (t === 'length') return l;
      }
      return Reflect.get(n, t, o);
    }
  });
}
function T(l, h, e) {
  let s = e.initialDeps ?? [],
    n,
    t = !0;
  function o() {
    const i = l();
    return (
      (i.length !== s.length || i.some((c, d) => s[d] !== c)) &&
        ((s = i),
        (n = h(...i)),
        e != null && e.onChange && !(t && e.skipInitialOnChange) && e.onChange(n),
        (t = !1)),
      n
    );
  }
  return (
    (o.updateDeps = (i) => {
      s = i;
    }),
    o
  );
}
function K(l, h) {
  if (l === void 0) throw new Error('Unexpected undefined');
  return l;
}
const re = (l, h) => Math.abs(l - h) < 1.01,
  ae = (l, h, e) => {
    let s;
    return function (...n) {
      (l.clearTimeout(s), (s = l.setTimeout(() => h.apply(this, n), e)));
    };
  };
let k;
const R = () => {
    if (k !== void 0) return k;
    if (typeof navigator > 'u') return (k = !1);
    if (/iP(hone|od|ad)/.test(navigator.userAgent)) return (k = !0);
    const l = navigator.maxTouchPoints;
    return (k = navigator.platform === 'MacIntel' && l !== void 0 && l > 0);
  },
  V = (l) => {
    const { offsetWidth: h, offsetHeight: e } = l;
    return { width: h, height: e };
  },
  ce = (l) => l,
  he = (l) => {
    const h = Math.max(l.startIndex - l.overscan, 0),
      s = Math.min(l.endIndex + l.overscan, l.count - 1) - h + 1,
      n = new Array(s);
    for (let t = 0; t < s; t++) n[t] = h + t;
    return n;
  },
  de = (l, h) => {
    const e = l.scrollElement;
    if (!e) return;
    const s = l.targetWindow;
    if (!s) return;
    const n = (o) => {
      const { width: i, height: r } = o;
      h({ width: Math.round(i), height: Math.round(r) });
    };
    if ((n(V(e)), !s.ResizeObserver)) return () => {};
    const t = new s.ResizeObserver((o) => {
      const i = () => {
        const r = o[0];
        if (r != null && r.borderBoxSize) {
          const c = r.borderBoxSize[0];
          if (c) {
            n({ width: c.inlineSize, height: c.blockSize });
            return;
          }
        }
        n(V(e));
      };
      l.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(i) : i();
    });
    return (
      t.observe(e, { box: 'border-box' }),
      () => {
        t.unobserve(e);
      }
    );
  },
  N = { passive: !0 },
  ue = typeof window > 'u' ? !0 : 'onscrollend' in window,
  fe = (l, h, e) => {
    const s = l.scrollElement;
    if (!s) return;
    const n = l.targetWindow;
    if (!n) return;
    const t = l.options.useScrollendEvent && ue;
    let o = 0;
    const i = t ? null : ae(n, () => h(o, !1), l.options.isScrollingResetDelay),
      r = (f) => () => {
        ((o = e(s)), i == null || i(), h(o, f));
      },
      c = r(!0),
      d = r(!1);
    return (
      s.addEventListener('scroll', c, N),
      t && s.addEventListener('scrollend', d, N),
      () => {
        (s.removeEventListener('scroll', c), t && s.removeEventListener('scrollend', d));
      }
    );
  },
  me = (l, h) =>
    fe(l, h, (e) => {
      const { horizontal: s, isRtl: n } = l.options;
      return s ? e.scrollLeft * ((n && -1) || 1) : e.scrollTop;
    }),
  ge = (l, h, e) => {
    if (e.options.useCachedMeasurements) {
      const s = e.indexFromElement(l),
        n = e.options.getItemKey(s);
      return e.itemSizeCache.get(n) ?? e.options.estimateSize(s);
    }
    if (h != null && h.borderBoxSize) {
      const s = h.borderBoxSize[0];
      if (s) return Math.round(s[e.options.horizontal ? 'inlineSize' : 'blockSize']);
    }
    if (!h) {
      const s = e.indexFromElement(l),
        n = e.options.getItemKey(s),
        t = e.itemSizeCache.get(n);
      if (t !== void 0) return t;
    }
    return l[e.options.horizontal ? 'offsetWidth' : 'offsetHeight'];
  },
  pe = (l, { adjustments: h = 0, behavior: e }, s) => {
    var n, t;
    (t = (n = s.scrollElement) == null ? void 0 : n.scrollTo) == null ||
      t.call(n, { [s.options.horizontal ? 'left' : 'top']: l + h, behavior: e });
  },
  xe = pe;
class be {
  constructor(h) {
    ((this.unsubs = []),
      (this.scrollElement = null),
      (this.targetWindow = null),
      (this.isScrolling = !1),
      (this.scrollState = null),
      (this.measurementsCache = []),
      (this._flatMeasurements = null),
      (this.itemSizeCache = new Map()),
      (this.itemSizeCacheVersion = 0),
      (this.laneAssignments = new Map()),
      (this.pendingMin = null),
      (this.prevLanes = void 0),
      (this.lanesChangedFlag = !1),
      (this.lanesSettling = !1),
      (this.pendingScrollAnchor = null),
      (this.scrollRect = null),
      (this.scrollOffset = null),
      (this.scrollDirection = null),
      (this.scrollAdjustments = 0),
      (this._iosDeferredAdjustment = 0),
      (this._iosTouching = !1),
      (this._iosJustTouchEnded = !1),
      (this._iosTouchEndTimerId = null),
      (this._intendedScrollOffset = null),
      (this.elementsCache = new Map()),
      (this.now = () => {
        var e, s, n;
        return (
          ((n =
            (s = (e = this.targetWindow) == null ? void 0 : e.performance) == null
              ? void 0
              : s.now) == null
            ? void 0
            : n.call(s)) ?? Date.now()
        );
      }),
      (this.observer = (() => {
        let e = null;
        const s = () =>
          e ||
          (!this.targetWindow || !this.targetWindow.ResizeObserver
            ? null
            : (e = new this.targetWindow.ResizeObserver((n) => {
                n.forEach((t) => {
                  const o = () => {
                    const i = t.target,
                      r = this.indexFromElement(i);
                    if (!i.isConnected) {
                      this.observer.unobserve(i);
                      for (const [c, d] of this.elementsCache)
                        if (d === i) {
                          this.elementsCache.delete(c);
                          break;
                        }
                      return;
                    }
                    this.shouldMeasureDuringScroll(r) &&
                      this.resizeItem(r, this.options.measureElement(i, t, this));
                  };
                  this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(o) : o();
                });
              })));
        return {
          disconnect: () => {
            var n;
            ((n = s()) == null || n.disconnect(), (e = null));
          },
          observe: (n) => {
            var t;
            return (t = s()) == null ? void 0 : t.observe(n, { box: 'border-box' });
          },
          unobserve: (n) => {
            var t;
            return (t = s()) == null ? void 0 : t.unobserve(n);
          }
        };
      })()),
      (this.range = null),
      (this.setOptions = (e) => {
        var s, n;
        const t = {
          debug: !1,
          initialOffset: 0,
          overscan: 1,
          paddingStart: 0,
          paddingEnd: 0,
          scrollPaddingStart: 0,
          scrollPaddingEnd: 0,
          horizontal: !1,
          getItemKey: ce,
          rangeExtractor: he,
          onChange: () => {},
          measureElement: ge,
          initialRect: { width: 0, height: 0 },
          scrollMargin: 0,
          gap: 0,
          indexAttribute: 'data-index',
          initialMeasurementsCache: [],
          lanes: 1,
          anchorTo: 'start',
          followOnAppend: !1,
          scrollEndThreshold: 1,
          isScrollingResetDelay: 150,
          enabled: !0,
          isRtl: !1,
          useScrollendEvent: !1,
          useAnimationFrameWithResizeObserver: !1,
          laneAssignmentMode: 'estimate',
          useCachedMeasurements: !1
        };
        for (const u in e) {
          const S = e[u];
          S !== void 0 && (t[u] = S);
        }
        const o = this.options;
        let i = null,
          r = null,
          c = !1;
        if (
          o !== void 0 &&
          o.enabled &&
          t.enabled &&
          t.anchorTo === 'end' &&
          this.scrollElement !== null
        ) {
          const u = o.count,
            S = t.count,
            w = this.getMeasurements(),
            b = u > 0 ? (((s = w[0]) == null ? void 0 : s.key) ?? o.getItemKey(0)) : null,
            v = u > 0 ? (((n = w[u - 1]) == null ? void 0 : n.key) ?? o.getItemKey(u - 1)) : null;
          if (S !== u || (u > 0 && S > 0 && (t.getItemKey(0) !== b || t.getItemKey(S - 1) !== v))) {
            c = !0;
            const I = u > 0 ? (this.getVirtualItemForOffset(this.getScrollOffset()) ?? w[0]) : null;
            I && (i = [I.key, this.getScrollOffset() - I.start]);
            const j = t.followOnAppend === !0 ? 'auto' : t.followOnAppend || null;
            j &&
              S > u &&
              this.isAtEnd(o.scrollEndThreshold) &&
              (u === 0 || t.getItemKey(S - 1) !== v) &&
              (r = j);
          }
        }
        ((this.options = t), c && ((this.pendingMin = 0), this.itemSizeCacheVersion++));
        let d = !1,
          f = 0;
        if (i && this.scrollOffset !== null) {
          const [u, S] = i,
            w = this.getMeasurements(),
            { count: b, getItemKey: v } = this.options;
          let g = 0;
          for (; g < b && v(g) !== u;) g++;
          if (g < b) {
            const x = w[g];
            if (x) {
              const I = Math.max(0, x.start + S);
              I !== this.scrollOffset &&
                ((f = I - this.scrollOffset), (this.scrollOffset = I), (d = !0));
            }
          }
        }
        (d || r) && (this.pendingScrollAnchor = [d ? i[0] : null, d ? i[1] : 0, r, f]);
      }),
      (this.notify = (e) => {
        var s, n;
        (n = (s = this.options).onChange) == null || n.call(s, this, e);
      }),
      (this.maybeNotify = T(
        () => (
          this.calculateRange(),
          [
            this.isScrolling,
            this.range ? this.range.startIndex : null,
            this.range ? this.range.endIndex : null
          ]
        ),
        (e) => {
          this.notify(e);
        },
        {
          key: !1,
          debug: () => this.options.debug,
          initialDeps: [
            this.isScrolling,
            this.range ? this.range.startIndex : null,
            this.range ? this.range.endIndex : null
          ]
        }
      )),
      (this.cleanup = () => {
        (this.unsubs.filter(Boolean).forEach((e) => e()),
          (this.unsubs = []),
          this.observer.disconnect(),
          this.rafId != null &&
            this.targetWindow &&
            (this.targetWindow.cancelAnimationFrame(this.rafId), (this.rafId = null)),
          (this.scrollState = null),
          (this._iosDeferredAdjustment = 0),
          (this._iosTouching = !1),
          (this._iosJustTouchEnded = !1),
          (this.scrollElement = null),
          (this.targetWindow = null));
      }),
      (this._didMount = () => () => {
        this.cleanup();
      }),
      (this._willUpdate = () => {
        var e;
        const s = this.options.enabled ? this.options.getScrollElement() : null;
        if (this.scrollElement !== s) {
          if ((this.cleanup(), !s)) {
            this.maybeNotify();
            return;
          }
          if (
            ((this.scrollElement = s),
            this.scrollElement && 'ownerDocument' in this.scrollElement
              ? (this.targetWindow = this.scrollElement.ownerDocument.defaultView)
              : (this.targetWindow =
                  ((e = this.scrollElement) == null ? void 0 : e.window) ?? null),
            this.elementsCache.forEach((t) => {
              this.observer.observe(t);
            }),
            this.unsubs.push(
              this.options.observeElementRect(this, (t) => {
                ((this.scrollRect = t), this.maybeNotify());
              })
            ),
            this.unsubs.push(
              this.options.observeElementOffset(this, (t, o) => {
                if (o && this._intendedScrollOffset === null && t === this.scrollOffset) return;
                (this._intendedScrollOffset !== null &&
                  Math.abs(t - this._intendedScrollOffset) < 1.5 &&
                  (t = this._intendedScrollOffset),
                  (this._intendedScrollOffset = null),
                  (this.scrollAdjustments = 0));
                const i = this.getScrollOffset();
                ((this.scrollDirection = o
                  ? i === t
                    ? this.scrollDirection
                    : i < t
                      ? 'forward'
                      : 'backward'
                  : null),
                  (this.scrollOffset = t),
                  (this.isScrolling = o),
                  this._flushIosDeferredIfReady(),
                  this.scrollState && this.scheduleScrollReconcile(),
                  this.maybeNotify());
              })
            ),
            'addEventListener' in this.scrollElement)
          ) {
            const t = this.scrollElement,
              o = () => {
                ((this._iosTouching = !0),
                  (this._iosJustTouchEnded = !1),
                  this._iosTouchEndTimerId !== null &&
                    this.targetWindow != null &&
                    (this.targetWindow.clearTimeout(this._iosTouchEndTimerId),
                    (this._iosTouchEndTimerId = null)));
              },
              i = () => {
                ((this._iosTouching = !1),
                  !(!R() || this.targetWindow == null) &&
                    ((this._iosJustTouchEnded = !0),
                    (this._iosTouchEndTimerId = this.targetWindow.setTimeout(() => {
                      ((this._iosJustTouchEnded = !1),
                        (this._iosTouchEndTimerId = null),
                        this._flushIosDeferredIfReady());
                    }, 150))));
              };
            (t.addEventListener('touchstart', o, N),
              t.addEventListener('touchend', i, N),
              this.unsubs.push(() => {
                (t.removeEventListener('touchstart', o),
                  t.removeEventListener('touchend', i),
                  this._iosTouchEndTimerId !== null &&
                    this.targetWindow != null &&
                    (this.targetWindow.clearTimeout(this._iosTouchEndTimerId),
                    (this._iosTouchEndTimerId = null)));
              }));
          }
          this._scrollToOffset(this.getScrollOffset(), { adjustments: void 0, behavior: void 0 });
        }
        const n = this.pendingScrollAnchor;
        if (((this.pendingScrollAnchor = null), n && this.scrollElement && this.options.enabled)) {
          const [t, o, i, r] = n;
          (t !== null &&
            !i &&
            (R() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded)
              ? r !== 0 && (this._iosDeferredAdjustment += r)
              : this._scrollToOffset(this.getScrollOffset(), {
                  adjustments: void 0,
                  behavior: void 0
                })),
            i && this.scrollToEnd({ behavior: i }));
        }
      }),
      (this._flushIosDeferredIfReady = () => {
        if (
          this._iosDeferredAdjustment === 0 ||
          this.isScrolling ||
          this._iosTouching ||
          this._iosJustTouchEnded
        )
          return;
        const e = this.getScrollOffset(),
          s = this.getMaxScrollOffset();
        if (e < 0 || e > s) return;
        if (this._iosDeferredAdjustment < 0 && e >= s - 1) {
          this._iosDeferredAdjustment = 0;
          return;
        }
        const n = this._iosDeferredAdjustment;
        ((this._iosDeferredAdjustment = 0),
          this._scrollToOffset(e, {
            adjustments: (this.scrollAdjustments += n),
            behavior: void 0
          }));
      }),
      (this.rafId = null),
      (this.getSize = () =>
        this.options.enabled
          ? ((this.scrollRect = this.scrollRect ?? this.options.initialRect),
            this.scrollRect[this.options.horizontal ? 'width' : 'height'])
          : ((this.scrollRect = null), 0)),
      (this.getScrollOffset = () =>
        this.options.enabled
          ? ((this.scrollOffset =
              this.scrollOffset ??
              (typeof this.options.initialOffset == 'function'
                ? this.options.initialOffset()
                : this.options.initialOffset)),
            this.scrollOffset)
          : ((this.scrollOffset = null), 0)),
      (this.getMeasurementOptions = T(
        () => [
          this.options.count,
          this.options.paddingStart,
          this.options.scrollMargin,
          this.options.getItemKey,
          this.options.enabled,
          this.options.lanes,
          this.options.laneAssignmentMode,
          this.options.gap
        ],
        (e, s, n, t, o, i, r, c) => (
          this.prevLanes !== void 0 && this.prevLanes !== i && (this.lanesChangedFlag = !0),
          (this.prevLanes = i),
          (this.pendingMin = null),
          {
            count: e,
            paddingStart: s,
            scrollMargin: n,
            getItemKey: t,
            enabled: o,
            lanes: i,
            laneAssignmentMode: r,
            gap: c
          }
        ),
        { key: !1 }
      )),
      (this.getMeasurements = T(
        () => [this.getMeasurementOptions(), this.itemSizeCacheVersion],
        (
          {
            count: e,
            paddingStart: s,
            scrollMargin: n,
            getItemKey: t,
            enabled: o,
            lanes: i,
            laneAssignmentMode: r,
            gap: c
          },
          d
        ) => {
          const f = this.itemSizeCache;
          if (!o)
            return (
              (this.measurementsCache = []),
              this.itemSizeCache.clear(),
              this.laneAssignments.clear(),
              []
            );
          if (this.laneAssignments.size > e)
            for (const g of this.laneAssignments.keys()) g >= e && this.laneAssignments.delete(g);
          (this.lanesChangedFlag &&
            ((this.lanesChangedFlag = !1),
            (this.lanesSettling = !0),
            (this.measurementsCache = []),
            this.itemSizeCache.clear(),
            this.laneAssignments.clear(),
            (this.pendingMin = null)),
            this.measurementsCache.length === 0 &&
              !this.lanesSettling &&
              ((this.measurementsCache = this.options.initialMeasurementsCache),
              this.measurementsCache.forEach((g) => {
                this.itemSizeCache.set(g.key, g.size);
              })));
          const u = this.lanesSettling ? 0 : (this.pendingMin ?? 0);
          if (
            ((this.pendingMin = null),
            this.lanesSettling && this.measurementsCache.length === e && (this.lanesSettling = !1),
            i === 1)
          ) {
            const g = e * 2;
            let x = this._flatMeasurements;
            if (!x || x.length < g) {
              const _ = new Float64Array(g);
              (x && u > 0 && _.set(x.subarray(0, u * 2)), (x = _), (this._flatMeasurements = x));
            }
            let I;
            if (u === 0) I = s + n;
            else {
              const _ = u - 1;
              I = x[_ * 2] + x[_ * 2 + 1] + c;
            }
            for (let _ = u; _ < e; _++) {
              const m = t(_),
                p = f.get(m),
                y = typeof p == 'number' ? p : this.options.estimateSize(_);
              ((x[_ * 2] = I), (x[_ * 2 + 1] = y), (I += y + c));
            }
            const j = le(e, x, t);
            return ((this.measurementsCache = j), j);
          }
          const S = this.measurementsCache.slice(0, u),
            w = new Array(i).fill(void 0),
            b = new Float64Array(i);
          let v = 0;
          for (let g = 0; g < u; g++) {
            const x = S[g];
            x && (w[x.lane] === void 0 && v++, (w[x.lane] = g), (b[x.lane] = x.end));
          }
          for (let g = u; g < e; g++) {
            const x = t(g),
              I = this.laneAssignments.get(g);
            let j, _;
            const m = r === 'estimate' || f.has(x);
            if (I !== void 0 && this.options.lanes > 1) {
              j = I;
              const E = w[j],
                O = E !== void 0 ? S[E] : void 0;
              _ = O ? O.end + c : s + n;
            } else if (v === i) {
              let E = 0,
                O = b[0],
                M = w[0];
              for (let A = 1; A < i; A++) {
                const F = b[A];
                (F < O || (F === O && w[A] < M)) && ((E = A), (O = F), (M = w[A]));
              }
              ((j = E), (_ = O + c), m && this.laneAssignments.set(g, j));
            } else ((j = g % this.options.lanes), (_ = s + n), m && this.laneAssignments.set(g, j));
            const p = f.get(x),
              y = typeof p == 'number' ? p : this.options.estimateSize(g),
              z = _ + y;
            ((S[g] = { index: g, start: _, size: y, end: z, key: x, lane: j }),
              w[j] === void 0 && v++,
              (w[j] = g),
              (b[j] = z));
          }
          return ((this.measurementsCache = S), S);
        },
        { key: !1, debug: () => this.options.debug }
      )),
      (this.calculateRange = T(
        () => [this.getMeasurements(), this.getSize(), this.getScrollOffset(), this.options.lanes],
        (e, s, n, t) =>
          e.length === 0 || s === 0
            ? ((this.range = null), null)
            : ((this.range = Se(
                e,
                s,
                n,
                t,
                t === 1 && this._flatMeasurements != null ? this._flatMeasurements : null
              )),
              this.range),
        { key: !1, debug: () => this.options.debug }
      )),
      (this.getVirtualIndexes = T(
        () => {
          let e = null,
            s = null;
          const n = this.calculateRange();
          return (
            n && ((e = n.startIndex), (s = n.endIndex)),
            this.maybeNotify.updateDeps([this.isScrolling, e, s]),
            [this.options.rangeExtractor, this.options.overscan, this.options.count, e, s]
          );
        },
        (e, s, n, t, o) =>
          t === null || o === null ? [] : e({ startIndex: t, endIndex: o, overscan: s, count: n }),
        { key: !1, debug: () => this.options.debug }
      )),
      (this.indexFromElement = (e) => {
        const s = this.options.indexAttribute,
          n = e.getAttribute(s);
        return n
          ? parseInt(n, 10)
          : (console.warn(`Missing attribute name '${s}={index}' on measured element.`), -1);
      }),
      (this.shouldMeasureDuringScroll = (e) => {
        var s;
        if (!this.scrollState || this.scrollState.behavior !== 'smooth') return !0;
        const n =
          this.scrollState.index ??
          ((s = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)) == null
            ? void 0
            : s.index);
        if (n !== void 0 && this.range) {
          const t = Math.max(
              this.options.overscan,
              Math.ceil((this.range.endIndex - this.range.startIndex) / 2)
            ),
            o = Math.max(0, n - t),
            i = Math.min(this.options.count - 1, n + t);
          return e >= o && e <= i;
        }
        return !0;
      }),
      (this.measureElement = (e) => {
        if (!e) {
          this.elementsCache.forEach((o, i) => {
            o.isConnected || (this.observer.unobserve(o), this.elementsCache.delete(i));
          });
          return;
        }
        const s = this.indexFromElement(e),
          n = this.options.getItemKey(s),
          t = this.elementsCache.get(n);
        (t !== e &&
          (t && this.observer.unobserve(t), this.observer.observe(e), this.elementsCache.set(n, e)),
          (!this.isScrolling || this.scrollState) &&
            this.shouldMeasureDuringScroll(s) &&
            this.resizeItem(s, this.options.measureElement(e, void 0, this)));
      }),
      (this.resizeItem = (e, s) => {
        var n, t;
        if (e < 0 || e >= this.options.count) return;
        let o, i, r;
        const c = this._flatMeasurements;
        if (this.options.lanes === 1 && c !== null)
          ((r = this.options.getItemKey(e)), (i = c[e * 2]), (o = c[e * 2 + 1]));
        else {
          const u = this.measurementsCache[e];
          if (!u) return;
          ((r = u.key), (i = u.start), (o = u.size));
        }
        const d = this.itemSizeCache.get(r) ?? o,
          f = s - d;
        if (f !== 0) {
          const u =
              this.options.anchorTo === 'end' &&
              ((n = this.scrollState) == null ? void 0 : n.behavior) !== 'smooth' &&
              this.getVirtualDistanceFromEnd() <= this.options.scrollEndThreshold,
            S = u ? this.getTotalSize() : 0,
            w = this.getScrollOffset() + this.scrollAdjustments,
            v = !this.itemSizeCache.has(r)
              ? i < w
              : i + d <= w && this.scrollDirection !== 'backward',
            g =
              ((t = this.scrollState) == null ? void 0 : t.behavior) !== 'smooth' &&
              (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0
                ? this.shouldAdjustScrollPositionOnItemSizeChange(
                    this.measurementsCache[e] ?? {
                      index: e,
                      key: r,
                      start: i,
                      size: o,
                      end: i + o,
                      lane: 0
                    },
                    f,
                    this
                  )
                : v);
          ((this.pendingMin === null || e < this.pendingMin) && (this.pendingMin = e),
            this.itemSizeCache.set(r, s),
            this.itemSizeCacheVersion++);
          let x = !1;
          (u
            ? (x = this.applyScrollAdjustment(this.getTotalSize() - S))
            : g && (x = this.applyScrollAdjustment(f)),
            this.notify(x));
        }
      }),
      (this.getVirtualItems = T(
        () => [this.getVirtualIndexes(), this.getMeasurements()],
        (e, s) => {
          const n = [];
          for (let t = 0, o = e.length; t < o; t++) {
            const i = e[t],
              r = s[i];
            n.push(r);
          }
          return n;
        },
        { key: !1, debug: () => this.options.debug }
      )),
      (this.getVirtualItemForOffset = (e) => {
        const s = this.getMeasurements();
        if (s.length === 0) return;
        const n = this._flatMeasurements,
          t = this.options.lanes === 1 && n != null,
          o = $(0, s.length - 1, t ? (i) => n[i * 2] : (i) => K(s[i]).start, e);
        return K(s[o]);
      }),
      (this.getMaxScrollOffset = () => {
        if (!this.scrollElement) return 0;
        if ('scrollHeight' in this.scrollElement)
          return this.options.horizontal
            ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth
            : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
        {
          const e = this.scrollElement.document.documentElement;
          return this.options.horizontal
            ? e.scrollWidth - this.scrollElement.innerWidth
            : e.scrollHeight - this.scrollElement.innerHeight;
        }
      }),
      (this.getVirtualDistanceFromEnd = () =>
        Math.max(this.getTotalSize() - this.getSize() - this.getScrollOffset(), 0)),
      (this.getDistanceFromEnd = () =>
        Math.max(this.getMaxScrollOffset() - this.getScrollOffset(), 0)),
      (this.isAtEnd = (e = this.options.scrollEndThreshold) => this.getDistanceFromEnd() <= e),
      (this.getOffsetForAlignment = (e, s, n = 0) => {
        if (!this.scrollElement) return 0;
        const t = this.getSize(),
          o = this.getScrollOffset();
        (s === 'auto' && (s = e >= o + t ? 'end' : 'start'),
          s === 'center' ? (e += (n - t) / 2) : s === 'end' && (e -= t));
        const i = this.getMaxScrollOffset();
        return Math.max(Math.min(i, e), 0);
      }),
      (this.getOffsetForIndex = (e, s = 'auto') => {
        e = Math.max(0, Math.min(e, this.options.count - 1));
        const n = this.getSize(),
          t = this.getScrollOffset(),
          o = this.measurementsCache[e];
        if (!o) return;
        if (s === 'auto')
          if (o.end >= t + n - this.options.scrollPaddingEnd) s = 'end';
          else if (o.start <= t + this.options.scrollPaddingStart) s = 'start';
          else return [t, s];
        if (s === 'end' && e === this.options.count - 1) return [this.getMaxScrollOffset(), s];
        const i =
          s === 'end'
            ? o.end + this.options.scrollPaddingEnd
            : o.start - this.options.scrollPaddingStart;
        return [this.getOffsetForAlignment(i, s, o.size), s];
      }),
      (this.scrollToOffset = (e, { align: s = 'start', behavior: n = 'auto' } = {}) => {
        this._iosDeferredAdjustment = 0;
        const t = this.getOffsetForAlignment(e, s),
          o = this.now();
        ((this.scrollState = {
          index: null,
          align: s,
          behavior: n,
          startedAt: o,
          lastTargetOffset: t,
          stableFrames: 0
        }),
          this._scrollToOffset(t, { adjustments: void 0, behavior: n }),
          this.scheduleScrollReconcile());
      }),
      (this.scrollToIndex = (e, { align: s = 'auto', behavior: n = 'auto' } = {}) => {
        ((this._iosDeferredAdjustment = 0), (e = Math.max(0, Math.min(e, this.options.count - 1))));
        const t = this.getOffsetForIndex(e, s);
        if (!t) return;
        const [o, i] = t,
          r = this.now();
        ((this.scrollState = {
          index: e,
          align: i,
          behavior: n,
          startedAt: r,
          lastTargetOffset: o,
          stableFrames: 0
        }),
          this._scrollToOffset(o, { adjustments: void 0, behavior: n }),
          this.scheduleScrollReconcile());
      }),
      (this.scrollBy = (e, { behavior: s = 'auto' } = {}) => {
        const n = this.getScrollOffset() + e,
          t = this.now();
        ((this.scrollState = {
          index: null,
          align: 'start',
          behavior: s,
          startedAt: t,
          lastTargetOffset: n,
          stableFrames: 0
        }),
          this._scrollToOffset(n, { adjustments: void 0, behavior: s }),
          this.scheduleScrollReconcile());
      }),
      (this.scrollToEnd = ({ behavior: e = 'auto' } = {}) => {
        if (this.options.count > 0) {
          this.scrollToIndex(this.options.count - 1, { align: 'end', behavior: e });
          return;
        }
        this.scrollToOffset(Math.max(this.getTotalSize() - this.getSize(), 0), { behavior: e });
      }),
      (this.getTotalSize = () => {
        var e;
        const s = this.getMeasurements();
        let n;
        if (s.length === 0) n = this.options.paddingStart;
        else if (this.options.lanes === 1) {
          const t = s.length - 1,
            o = this._flatMeasurements;
          o != null
            ? (n = o[t * 2] + o[t * 2 + 1])
            : (n = ((e = s[t]) == null ? void 0 : e.end) ?? 0);
        } else {
          const t = Array(this.options.lanes).fill(null);
          let o = s.length - 1;
          for (; o >= 0 && t.some((i) => i === null);) {
            const i = s[o];
            (t[i.lane] === null && (t[i.lane] = i.end), o--);
          }
          n = Math.max(...t.filter((i) => i !== null));
        }
        return Math.max(n - this.options.scrollMargin + this.options.paddingEnd, 0);
      }),
      (this.takeSnapshot = () => {
        const e = [];
        if (this.itemSizeCache.size === 0) return e;
        const s = this.getMeasurements();
        for (const n of s)
          n &&
            this.itemSizeCache.has(n.key) &&
            e.push({
              index: n.index,
              key: n.key,
              start: n.start,
              size: n.size,
              end: n.end,
              lane: n.lane
            });
        return e;
      }),
      (this._scrollToOffset = (e, { adjustments: s, behavior: n }) => {
        ((this._intendedScrollOffset = e + (s ?? 0)),
          this.options.scrollToFn(e, { behavior: n, adjustments: s }, this));
      }),
      (this.measure = () => {
        ((this.pendingMin = null),
          this.itemSizeCache.clear(),
          this.laneAssignments.clear(),
          this.itemSizeCacheVersion++,
          this.notify(!1));
      }),
      this.setOptions(h));
  }
  applyScrollAdjustment(h, e) {
    return h === 0
      ? !1
      : R() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded)
        ? ((this._iosDeferredAdjustment += h), !1)
        : (this._scrollToOffset(this.getScrollOffset(), {
            adjustments: (this.scrollAdjustments += h),
            behavior: e
          }),
          this.scrollOffset !== null &&
            ((this.scrollOffset += this.scrollAdjustments),
            this.scrollOffset < 0 && (this.scrollOffset = 0),
            (this.scrollAdjustments = 0)),
          !0);
  }
  scheduleScrollReconcile() {
    if (!this.targetWindow) {
      this.scrollState = null;
      return;
    }
    this.rafId == null &&
      (this.rafId = this.targetWindow.requestAnimationFrame(() => {
        ((this.rafId = null), this.reconcileScroll());
      }));
  }
  reconcileScroll() {
    if (!this.scrollState || !this.scrollElement) return;
    if (this.now() - this.scrollState.startedAt > 5e3) {
      this.scrollState = null;
      return;
    }
    const s =
        this.scrollState.index != null
          ? this.getOffsetForIndex(this.scrollState.index, this.scrollState.align)
          : void 0,
      n = s ? s[0] : this.scrollState.lastTargetOffset,
      t = 1,
      o = n !== this.scrollState.lastTargetOffset;
    if (!o && re(n, this.getScrollOffset())) {
      if ((this.scrollState.stableFrames++, this.scrollState.stableFrames >= t)) {
        (this.getScrollOffset() !== n &&
          this._scrollToOffset(n, { adjustments: void 0, behavior: 'auto' }),
          (this.scrollState = null));
        return;
      }
    } else if (((this.scrollState.stableFrames = 0), o)) {
      const i = this.getSize() || 600,
        r = Math.abs(n - this.getScrollOffset()),
        c = this.scrollState.behavior === 'smooth' && r > i;
      ((this.scrollState.lastTargetOffset = n),
        c || (this.scrollState.behavior = 'auto'),
        this._scrollToOffset(n, { adjustments: void 0, behavior: c ? 'smooth' : 'auto' }));
    }
    this.scheduleScrollReconcile();
  }
}
const $ = (l, h, e, s) => {
  for (; l <= h;) {
    const n = ((l + h) / 2) | 0,
      t = e(n);
    if (t < s) l = n + 1;
    else if (t > s) h = n - 1;
    else return n;
  }
  return l > 0 ? l - 1 : 0;
};
function ve(l, h, e) {
  let s = 0;
  for (; s <= h;) {
    const n = ((s + h) / 2) | 0,
      t = l[n * 2];
    if (t < e) s = n + 1;
    else if (t > e) h = n - 1;
    else return n;
  }
  return s > 0 ? s - 1 : 0;
}
function Se(l, h, e, s, n) {
  const t = l.length - 1;
  if (l.length <= s) return { startIndex: 0, endIndex: t };
  if (s === 1 && n !== null) {
    const c = ve(n, t, e);
    let d = c;
    const f = e + h;
    for (; d < t && n[d * 2] + n[d * 2 + 1] < f;) d++;
    return { startIndex: c, endIndex: d };
  }
  let i = $(0, t, (c) => l[c].start, e),
    r = i;
  if (s === 1) for (; r < t && l[r].end < e + h;) r++;
  else if (s > 1) {
    const c = Array(s).fill(0);
    for (; r < t && c.some((f) => f < e + h);) {
      const f = l[r];
      ((c[f.lane] = f.end), r++);
    }
    const d = Array(s).fill(e + h);
    for (; i >= 0 && d.some((f) => f >= e);) {
      const f = l[i];
      ((d[f.lane] = f.start), i--);
    }
    ((i = Math.max(0, i - (i % s))), (r = Math.min(t, r + (s - 1 - (r % s)))));
  }
  return { startIndex: i, endIndex: r };
}
const L = typeof document < 'u' ? C.useLayoutEffect : C.useEffect;
function ye({
  useFlushSync: l = !0,
  directDomUpdates: h = !1,
  directDomUpdatesMode: e = 'transform',
  ...s
}) {
  const n = C.useReducer((d) => d + 1, 0)[1],
    t = C.useRef({
      enabled: h,
      mode: e,
      container: null,
      lastSize: null,
      lastPositions: new WeakMap(),
      prevRange: null
    });
  ((t.current.enabled = h), (t.current.mode = e));
  const o = (d) => {
      const f = t.current;
      if (!f.enabled || !f.container) return;
      const u = d.getTotalSize();
      if (u !== f.lastSize) {
        f.lastSize = u;
        const S = d.options.horizontal ? 'width' : 'height';
        f.container.style[S] = `${u}px`;
      }
    },
    i = (d) => {
      const f = t.current;
      if (!f.enabled || !f.container) return;
      o(d);
      const u = !!d.options.horizontal,
        S = f.mode === 'transform',
        w = u ? 'left' : 'top',
        b = d.options.scrollMargin,
        v = d.getVirtualItems();
      for (const g of v) {
        const x = g.start - b,
          I = d.elementsCache.get(g.key);
        I &&
          f.lastPositions.get(I) !== x &&
          (f.lastPositions.set(I, x),
          S
            ? (I.style.transform = u ? `translate3d(${x}px, 0, 0)` : `translate3d(0, ${x}px, 0)`)
            : (I.style[w] = `${x}px`));
      }
    },
    r = {
      ...s,
      onChange: (d, f) => {
        var u;
        const S = t.current;
        let w = !0;
        if (S.enabled) {
          i(d);
          const b = d.range,
            v = S.prevRange;
          ((w =
            !v ||
            v.isScrolling !== d.isScrolling ||
            v.startIndex !== (b == null ? void 0 : b.startIndex) ||
            v.endIndex !== (b == null ? void 0 : b.endIndex)),
            w &&
              (S.prevRange = b
                ? { startIndex: b.startIndex, endIndex: b.endIndex, isScrolling: d.isScrolling }
                : null));
        }
        (w && (l && f ? B.flushSync(n) : n()), (u = s.onChange) == null || u.call(s, d, f));
      }
    },
    [c] = C.useState(() => {
      const d = new be(r);
      return Object.assign(d, {
        containerRef: (f) => {
          const u = t.current;
          if (((u.container = f), (u.lastSize = null), f && u.enabled)) {
            const S = d.getTotalSize();
            u.lastSize = S;
            const w = d.options.horizontal ? 'width' : 'height';
            f.style[w] = `${S}px`;
          }
        }
      });
    });
  return (
    c.setOptions(r),
    L(() => c._didMount(), []),
    L(() => (o(c), c._willUpdate())),
    L(() => {
      i(c);
    }),
    c
  );
}
function we(l) {
  return ye({ observeElementRect: de, observeElementOffset: me, scrollToFn: xe, ...l });
}
function Ee() {
  const { user: l, loading: h, hasPermission: e } = J(),
    n =
      (l == null ? void 0 : l.rol) === 'ADMIN' ||
      (l == null ? void 0 : l.es_admin_delegado) === !0 ||
      [
        'manage_quality',
        'manage_monitoreo',
        'view_acciones_calidad',
        'manage_inventory',
        'view_locations',
        'manage_locations',
        'view_stock',
        'manage_stock',
        'view_inventario'
      ].some((t) => e(t));
  return !h && n;
}
function Ie() {
  const l = Ee(),
    { data: h = [], isLoading: e } = P({
      queryKey: ['calidad_flags'],
      enabled: l,
      meta: { module: 'quality', action: 'calidad_flags_query', table: 'tms_calidad_flags' },
      queryFn: async () => {
        const { data: o, error: i } = await G.from('tms_calidad_flags')
          .select('codigo_producto, partida, ubicacion, estado_calidad, severidad, nota')
          .eq('vigente', !0);
        if (i) throw i;
        return o || [];
      },
      staleTime: 6e4,
      gcTime: 10 * 6e4,
      refetchOnWindowFocus: !1,
      retry: 1,
      retryDelay: (o) => Math.min(500 * 2 ** o, 2e3)
    }),
    { byCodigo: s, byCodigoUbic: n } = C.useMemo(() => {
      const o = new Map(),
        i = new Map();
      for (const r of h) {
        const c = (r.codigo_producto || '').toUpperCase(),
          d = o.get(c);
        if (((!d || r.severidad > d.severidad) && o.set(c, r), r.ubicacion)) {
          const f = `${c}::${(r.ubicacion || '').toUpperCase()}`,
            u = i.get(f);
          (!u || r.severidad > u.severidad) && i.set(f, r);
        }
      }
      return { byCodigo: o, byCodigoUbic: i };
    }, [h]);
  function t(o, i) {
    const r = (o || '').toUpperCase();
    if (i) {
      const c = n.get(`${r}::${(i || '').toUpperCase()}`);
      if (c) return c;
    }
    return s.get(r) || null;
  }
  return { flags: h, isLoading: e, byCodigo: s, byCodigoUbic: n, flagForItem: t };
}
const D = 92,
  U = 44,
  _e = q.memo(({ group: l, searchQuery: h, isExpanded: e, onToggle: s, flagForItem: n }) => {
    const t = l.matchingItems,
      o = l.allItems.length,
      i = l.allItems.reduce((b, v) => b + (Number(v.cantidad) || 0), 0),
      r = t.reduce((b, v) => b + (Number(v.cantidad) || 0), 0),
      c = h.length > 0,
      d = c ? t : l.allItems,
      f = e ? d : d.slice(0, 1),
      u = c ? r : i,
      S = c ? t.length : o,
      w = u > 0;
    return a.jsxs('div', {
      className:
        'bg-white border border-slate-200/70 rounded-2xl hover:border-amber-200 hover:shadow-[0_4px_20px_-8px_rgba(245,158,11,0.25)] transition-all overflow-hidden',
      children: [
        a.jsxs('div', {
          className:
            'flex items-center gap-3 px-4 sm:px-5 py-3.5 cursor-pointer select-none hover:bg-amber-50/30 transition-colors',
          onClick: s,
          children: [
            a.jsx('div', {
              className: `w-1 self-stretch rounded-full shrink-0 ${w ? 'bg-emerald-400' : 'bg-slate-200'}`
            }),
            a.jsxs('div', {
              className: 'min-w-0 flex-1',
              children: [
                a.jsxs('div', {
                  className: 'flex items-center gap-2 flex-wrap',
                  children: [
                    a.jsx('span', {
                      className: `text-sm sm:text-base font-black font-mono tracking-tight ${w ? 'text-slate-900' : 'text-slate-400'}`,
                      children: l.ubicacion
                    }),
                    c &&
                      t.length < o &&
                      a.jsxs('span', {
                        className:
                          'text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100',
                        children: [t.length, '/', o]
                      })
                  ]
                }),
                a.jsxs('div', {
                  className: 'flex items-center gap-1 mt-0.5 text-xs text-slate-400',
                  children: [
                    a.jsx(ne, { size: 11 }),
                    a.jsx('span', { className: 'font-bold text-slate-500', children: S }),
                    a.jsx('span', { children: S === 1 ? 'SKU' : 'SKUs' })
                  ]
                })
              ]
            }),
            a.jsxs('div', {
              className: 'text-right shrink-0',
              children: [
                a.jsx('span', {
                  className: `text-lg sm:text-xl font-black tabular-nums ${w ? 'text-slate-900' : 'text-slate-300'}`,
                  children: u
                }),
                a.jsx('span', {
                  className: 'text-[10px] text-slate-400 font-medium ml-0.5',
                  children: 'uds'
                })
              ]
            }),
            a.jsx('div', {
              className:
                'w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0',
              children: e ? a.jsx(ie, { size: 14 }) : a.jsx(oe, { size: 14 })
            })
          ]
        }),
        f.length > 0 &&
          a.jsxs('div', {
            className: 'border-t border-slate-100',
            children: [
              f.map((b, v) => {
                const g = n ? n(b.codigo, b.ubicacion || l.ubicacion) : null;
                return a.jsxs(
                  'div',
                  {
                    className: `flex items-center gap-3 px-4 sm:px-5 py-2.5 text-sm ${v > 0 ? 'border-t border-slate-50' : ''} hover:bg-amber-50/20 transition-colors`,
                    children: [
                      a.jsx('span', {
                        className:
                          'text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 shrink-0',
                        children: b.codigo
                      }),
                      g && a.jsx(X, { estado: g.estado_calidad, size: 'xs', title: g.nota }),
                      a.jsx('span', {
                        className: 'text-slate-500 truncate flex-1 min-w-0',
                        children: b.descripcion
                      }),
                      a.jsx('span', {
                        className: 'text-sm font-black text-slate-800 tabular-nums shrink-0',
                        children: Number(b.cantidad) || 0
                      })
                    ]
                  },
                  b.id || v
                );
              }),
              !e &&
                d.length > 1 &&
                a.jsxs('button', {
                  onClick: (b) => {
                    (b.stopPropagation(), s());
                  },
                  className:
                    'w-full py-2 text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50/30 transition-colors border-t border-slate-50',
                  children: ['+', d.length - 1, ' más']
                })
            ]
          })
      ]
    });
  }),
  Le = () => {
    const { inventory: l, stats: h, loading: e, fetchWarehouseData: s } = H(),
      { flagForItem: n } = Ie(),
      [t, o] = C.useState(''),
      [i, r] = C.useState('all'),
      [c, d] = C.useState(!0),
      [f, u] = C.useState(new Set()),
      S = C.useRef(null),
      w = C.useRef(null);
    (C.useEffect(() => {
      s();
    }, [s]),
      C.useEffect(() => {
        const m = (p) => {
          var y;
          (p.ctrlKey || p.metaKey) &&
            p.key === 'k' &&
            (p.preventDefault(), (y = w.current) == null || y.focus());
        };
        return (
          window.addEventListener('keydown', m),
          () => window.removeEventListener('keydown', m)
        );
      }, []));
    const b = C.useMemo(() => {
        const m = {};
        return (
          Object.entries(l).forEach(([p, y]) => {
            (m[p] || (m[p] = { ubicacion: p, allItems: [], matchingItems: [] }),
              (m[p].allItems = y));
          }),
          m
        );
      }, [l]),
      v = C.useMemo(() => {
        const m = t.toLowerCase().trim();
        if (!m) return [];
        let p = Object.values(b);
        return (
          (p = p.map((y) => {
            let z;
            return (
              m
                ? (z = y.allItems.filter(
                    (E) =>
                      (E.ubicacion || '').toLowerCase().includes(m) ||
                      (E.codigo || '').toLowerCase().includes(m) ||
                      (E.descripcion || '').toLowerCase().includes(m)
                  ))
                : (z = y.allItems),
              { ...y, matchingItems: z }
            );
          })),
          m && (p = p.filter((y) => y.matchingItems.length > 0)),
          i === 'stock'
            ? (p = p.filter((y) =>
                (m ? y.matchingItems : y.allItems).some((E) => Number(E.cantidad) > 0)
              ))
            : i === 'empty' &&
              (p = p.filter(
                (y) => y.allItems.reduce((z, E) => z + (Number(E.cantidad) || 0), 0) === 0
              )),
          p.sort((y, z) => {
            const E = y.ubicacion.localeCompare(z.ubicacion);
            return c ? E : -E;
          }),
          p
        );
      }, [b, t, i, c]),
      g = C.useMemo(() => {
        const m = v.length,
          p = v.reduce((z, E) => z + (t ? E.matchingItems : E.allItems).length, 0),
          y = v.reduce(
            (z, E) =>
              z +
              (t ? E.matchingItems : E.allItems).reduce((O, M) => O + (Number(M.cantidad) || 0), 0),
            0
          );
        return { totalLocations: m, totalItems: p, totalStock: y };
      }, [v, t]),
      x = C.useCallback((m) => {
        u((p) => {
          const y = new Set(p);
          return (y.has(m) ? y.delete(m) : y.add(m), y);
        });
      }, []),
      I = we({
        count: v.length,
        getScrollElement: () => S.current,
        estimateSize: (m) => {
          const p = v[m];
          if (!p) return D;
          const y = f.has(p.ubicacion),
            E = t.toLowerCase().trim() ? p.matchingItems : p.allItems;
          return y
            ? D + E.length * U + 8
            : D + (E.length > 0 ? U : 0) + (E.length > 1 ? 32 : 0) + 8;
        },
        overscan: 8
      });
    C.useEffect(() => {
      I.measure();
    }, [f, t, i]);
    const j = C.useCallback(() => {
        const m = ['Ubicacion', 'Codigo', 'Descripcion', 'Cantidad'],
          p = [];
        v.forEach((M) => {
          (t ? M.matchingItems : M.allItems).forEach((A) => {
            p.push([
              `"${(A.ubicacion || '').replace(/"/g, '""')}"`,
              `"${(A.codigo || '').replace(/"/g, '""')}"`,
              `"${(A.descripcion || '').replace(/"/g, '""')}"`,
              A.cantidad || 0
            ]);
          });
        });
        const y = [m, ...p].map((M) => M.join(',')).join(`
`),
          z = new Blob(['\uFEFF' + y], { type: 'text/csv;charset=utf-8;' }),
          E = URL.createObjectURL(z),
          O = document.createElement('a');
        (O.setAttribute('href', E),
          O.setAttribute(
            'download',
            `WMS_UBICACIONES_${new Date().toISOString().slice(0, 10)}.csv`
          ),
          document.body.appendChild(O),
          O.click(),
          document.body.removeChild(O),
          URL.revokeObjectURL(E));
      }, [v, t]),
      _ = [
        { key: 'all', label: 'Todos' },
        { key: 'stock', label: 'Con stock' },
        { key: 'empty', label: 'Vacías' }
      ];
    return a.jsxs('div', {
      className: 'h-full flex flex-col bg-[#F9FAFB] overflow-hidden',
      children: [
        a.jsx('header', {
          className: 'shrink-0 px-4 pt-6 sm:pt-8 pb-4',
          children: a.jsxs('div', {
            className: 'max-w-2xl mx-auto text-center',
            children: [
              a.jsx('div', {
                className:
                  'inline-flex w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm items-center justify-center mb-3',
                children: a.jsx(Q, { className: 'text-amber-500', size: 28, strokeWidth: 2.2 })
              }),
              a.jsx('h1', {
                className: 'text-2xl sm:text-4xl font-black tracking-tighter',
                children: a.jsx('span', {
                  className:
                    'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent',
                  children: 'Ubicaciones'
                })
              }),
              a.jsx('p', {
                className: 'text-xs sm:text-sm text-slate-400 mt-1 font-medium',
                children: 'Escribe y los resultados aparecen al instante'
              }),
              a.jsxs('div', {
                className: 'relative mt-5 group',
                children: [
                  a.jsx('div', {
                    className:
                      'absolute -inset-1.5 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-[1.4rem] blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500'
                  }),
                  a.jsxs('div', {
                    className:
                      'relative flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl px-4 h-14 sm:h-16 shadow-sm transition-all duration-300 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100/70 focus-within:-translate-y-0.5',
                    children: [
                      a.jsx(W, {
                        size: 20,
                        className:
                          'text-slate-300 group-focus-within:text-amber-500 transition-colors shrink-0'
                      }),
                      a.jsx('input', {
                        ref: w,
                        type: 'text',
                        autoFocus: !0,
                        placeholder: 'Buscar ubicación, SKU o descripción...',
                        className:
                          'flex-1 min-w-0 bg-transparent outline-none text-base sm:text-lg font-medium text-slate-900 placeholder:text-slate-300',
                        value: t,
                        onChange: (m) => o(m.target.value)
                      }),
                      t
                        ? a.jsxs(a.Fragment, {
                            children: [
                              a.jsxs('span', {
                                className:
                                  'text-[11px] text-slate-400 font-mono font-bold shrink-0 tabular-nums',
                                children: [g.totalLocations, ' ubic.']
                              }),
                              a.jsx('button', {
                                onClick: () => {
                                  var m;
                                  (o(''), (m = w.current) == null || m.focus());
                                },
                                className:
                                  'w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shrink-0',
                                children: a.jsx(Z, { size: 13 })
                              })
                            ]
                          })
                        : a.jsx('span', {
                            className:
                              'hidden sm:inline text-[10px] text-slate-300 font-mono shrink-0',
                            children: 'Ctrl K'
                          })
                    ]
                  })
                ]
              }),
              a.jsxs('div', {
                className: 'flex items-center justify-center flex-wrap gap-2 mt-4',
                children: [
                  a.jsx('div', {
                    className: 'flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5',
                    children: _.map((m) =>
                      a.jsx(
                        'button',
                        {
                          onClick: () => r(m.key),
                          className: `px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${i === m.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`,
                          children: m.label
                        },
                        m.key
                      )
                    )
                  }),
                  a.jsxs('button', {
                    onClick: () => d((m) => !m),
                    className:
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all',
                    children: [a.jsx(Y, { size: 13 }), ' ', c ? 'A→Z' : 'Z→A']
                  }),
                  a.jsxs('button', {
                    onClick: j,
                    className:
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all',
                    children: [
                      a.jsx(ee, { size: 13 }),
                      ' ',
                      a.jsx('span', { className: 'hidden sm:inline', children: 'Exportar' })
                    ]
                  }),
                  a.jsx('button', {
                    onClick: () => s(!0),
                    className:
                      'w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all',
                    title: 'Actualizar',
                    children: a.jsx(te, { size: 14, className: e ? 'animate-spin' : '' })
                  })
                ]
              })
            ]
          })
        }),
        a.jsx('main', {
          ref: S,
          className: 'flex-1 overflow-y-auto px-3 sm:px-4 pb-6',
          children: a.jsx('div', {
            className: 'max-w-3xl mx-auto',
            children: t.trim()
              ? e && v.length === 0
                ? a.jsxs('div', {
                    className: 'flex flex-col items-center justify-center py-28',
                    children: [
                      a.jsx('div', {
                        className:
                          'w-11 h-11 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mb-5'
                      }),
                      a.jsx('p', {
                        className: 'text-xs font-bold text-slate-400 uppercase tracking-widest',
                        children: 'Cargando datos...'
                      })
                    ]
                  })
                : v.length === 0
                  ? a.jsxs('div', {
                      className: 'flex flex-col items-center justify-center py-28',
                      children: [
                        a.jsx(se, { size: 40, className: 'text-slate-200 mb-4' }),
                        a.jsx('h3', {
                          className: 'text-base font-bold text-slate-400 mb-1',
                          children: 'Sin resultados'
                        }),
                        a.jsxs('p', {
                          className: 'text-xs text-slate-300',
                          children: ['No se encontró "', t, '"']
                        })
                      ]
                    })
                  : a.jsx('div', {
                      className: 'relative',
                      style: { height: `${I.getTotalSize()}px` },
                      children: I.getVirtualItems().map((m) => {
                        const p = v[m.index];
                        return a.jsx(
                          'div',
                          {
                            'data-index': m.index,
                            ref: I.measureElement,
                            className: 'absolute top-0 left-0 w-full',
                            style: { transform: `translateY(${m.start}px)`, paddingBottom: '8px' },
                            children: a.jsx(_e, {
                              group: p,
                              searchQuery: t,
                              isExpanded: f.has(p.ubicacion),
                              onToggle: () => x(p.ubicacion),
                              flagForItem: n
                            })
                          },
                          p.ubicacion
                        );
                      })
                    })
              : a.jsxs('div', {
                  className: 'flex flex-col items-center justify-center py-28 text-center',
                  children: [
                    a.jsx(W, { size: 40, className: 'text-slate-200 mb-4' }),
                    a.jsx('h3', {
                      className: 'text-base font-bold text-slate-400 mb-1',
                      children: 'Empieza a escribir'
                    }),
                    a.jsx('p', {
                      className: 'text-xs text-slate-300',
                      children: 'Busca por ubicación, SKU o descripción para ver resultados'
                    })
                  ]
                })
          })
        })
      ]
    });
  };
export { Le as default };
