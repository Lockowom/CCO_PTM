import { d as B, j as r } from './query-vendor-CojWQiBV.js';
import { r as y, b as $, R as K } from './react-vendor-CA7EHQ1X.js';
import { u as q } from './warehouseStore-4zaQrDZ7.js';
import { u as H, s as J } from './index-CyreZcpi.js';
import { C as G } from './CalidadBadge-Cz9BxEKY.js';
import {
  n as X,
  z as F,
  X as Q,
  b9 as Z,
  a3 as Y,
  R as ee,
  o as te,
  h as se,
  b3 as ne,
  d as ie
} from './ui-vendor-C7KFTQPV.js';
import './supabase-vendor-jY4wIOEF.js';
import './calidadService-DZa_EFDu.js';
function oe(l, c, t) {
  const s = new Array(l);
  return new Proxy(s, {
    get(e, n, o) {
      if (typeof n == 'string') {
        const i = n.charCodeAt(0);
        if (i >= 48 && i <= 57) {
          const a = +n;
          if (Number.isInteger(a) && a >= 0 && a < l) {
            let h = e[a];
            if (!h) {
              const m = c[a * 2];
              h = e[a] = {
                index: a,
                key: t(a),
                start: m,
                size: c[a * 2 + 1],
                end: m + c[a * 2 + 1],
                lane: 0
              };
            }
            return h;
          }
        }
        if (n === 'length') return l;
      }
      return Reflect.get(e, n, o);
    }
  });
}
function k(l, c, t) {
  let s = t.initialDeps ?? [],
    e,
    n = !0;
  function o() {
    const i = l();
    return (
      (i.length !== s.length || i.some((h, m) => s[m] !== h)) &&
        ((s = i),
        (e = c(...i)),
        t != null && t.onChange && !(n && t.skipInitialOnChange) && t.onChange(e),
        (n = !1)),
      e
    );
  }
  return (
    (o.updateDeps = (i) => {
      s = i;
    }),
    o
  );
}
function L(l, c) {
  if (l === void 0) throw new Error('Unexpected undefined');
  return l;
}
const le = (l, c) => Math.abs(l - c) < 1.01,
  re = (l, c, t) => {
    let s;
    return function (...e) {
      (l.clearTimeout(s), (s = l.setTimeout(() => c.apply(this, e), t)));
    };
  };
let N;
const W = () => {
    if (N !== void 0) return N;
    if (typeof navigator > 'u') return (N = !1);
    if (/iP(hone|od|ad)/.test(navigator.userAgent)) return (N = !0);
    const l = navigator.maxTouchPoints;
    return (N = navigator.platform === 'MacIntel' && l !== void 0 && l > 0);
  },
  D = (l) => {
    const { offsetWidth: c, offsetHeight: t } = l;
    return { width: c, height: t };
  },
  ae = (l) => l,
  ce = (l) => {
    const c = Math.max(l.startIndex - l.overscan, 0),
      s = Math.min(l.endIndex + l.overscan, l.count - 1) - c + 1,
      e = new Array(s);
    for (let n = 0; n < s; n++) e[n] = c + n;
    return e;
  },
  he = (l, c) => {
    const t = l.scrollElement;
    if (!t) return;
    const s = l.targetWindow;
    if (!s) return;
    const e = (o) => {
      const { width: i, height: a } = o;
      c({ width: Math.round(i), height: Math.round(a) });
    };
    if ((e(D(t)), !s.ResizeObserver)) return () => {};
    const n = new s.ResizeObserver((o) => {
      const i = () => {
        const a = o[0];
        if (a != null && a.borderBoxSize) {
          const h = a.borderBoxSize[0];
          if (h) {
            e({ width: h.inlineSize, height: h.blockSize });
            return;
          }
        }
        e(D(t));
      };
      l.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(i) : i();
    });
    return (
      n.observe(t, { box: 'border-box' }),
      () => {
        n.unobserve(t);
      }
    );
  },
  T = { passive: !0 },
  de = typeof window > 'u' ? !0 : 'onscrollend' in window,
  ue = (l, c, t) => {
    const s = l.scrollElement;
    if (!s) return;
    const e = l.targetWindow;
    if (!e) return;
    const n = l.options.useScrollendEvent && de;
    let o = 0;
    const i = n ? null : re(e, () => c(o, !1), l.options.isScrollingResetDelay),
      a = (x) => () => {
        ((o = t(s)), i == null || i(), c(o, x));
      },
      h = a(!0),
      m = a(!1);
    return (
      s.addEventListener('scroll', h, T),
      n && s.addEventListener('scrollend', m, T),
      () => {
        (s.removeEventListener('scroll', h), n && s.removeEventListener('scrollend', m));
      }
    );
  },
  me = (l, c) =>
    ue(l, c, (t) => {
      const { horizontal: s, isRtl: e } = l.options;
      return s ? t.scrollLeft * ((e && -1) || 1) : t.scrollTop;
    }),
  fe = (l, c, t) => {
    if (c != null && c.borderBoxSize) {
      const s = c.borderBoxSize[0];
      if (s) return Math.round(s[t.options.horizontal ? 'inlineSize' : 'blockSize']);
    }
    return l[t.options.horizontal ? 'offsetWidth' : 'offsetHeight'];
  },
  ge = (l, { adjustments: c = 0, behavior: t }, s) => {
    var e, n;
    (n = (e = s.scrollElement) == null ? void 0 : e.scrollTo) == null ||
      n.call(e, { [s.options.horizontal ? 'left' : 'top']: l + c, behavior: t });
  },
  pe = ge;
class xe {
  constructor(c) {
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
        var t, s, e;
        return (
          ((e =
            (s = (t = this.targetWindow) == null ? void 0 : t.performance) == null
              ? void 0
              : s.now) == null
            ? void 0
            : e.call(s)) ?? Date.now()
        );
      }),
      (this.observer = (() => {
        let t = null;
        const s = () =>
          t ||
          (!this.targetWindow || !this.targetWindow.ResizeObserver
            ? null
            : (t = new this.targetWindow.ResizeObserver((e) => {
                e.forEach((n) => {
                  const o = () => {
                    const i = n.target,
                      a = this.indexFromElement(i);
                    if (!i.isConnected) {
                      this.observer.unobserve(i);
                      for (const [h, m] of this.elementsCache)
                        if (m === i) {
                          this.elementsCache.delete(h);
                          break;
                        }
                      return;
                    }
                    this.shouldMeasureDuringScroll(a) &&
                      this.resizeItem(a, this.options.measureElement(i, n, this));
                  };
                  this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(o) : o();
                });
              })));
        return {
          disconnect: () => {
            var e;
            ((e = s()) == null || e.disconnect(), (t = null));
          },
          observe: (e) => {
            var n;
            return (n = s()) == null ? void 0 : n.observe(e, { box: 'border-box' });
          },
          unobserve: (e) => {
            var n;
            return (n = s()) == null ? void 0 : n.unobserve(e);
          }
        };
      })()),
      (this.range = null),
      (this.setOptions = (t) => {
        const s = {
          debug: !1,
          initialOffset: 0,
          overscan: 1,
          paddingStart: 0,
          paddingEnd: 0,
          scrollPaddingStart: 0,
          scrollPaddingEnd: 0,
          horizontal: !1,
          getItemKey: ae,
          rangeExtractor: ce,
          onChange: () => {},
          measureElement: fe,
          initialRect: { width: 0, height: 0 },
          scrollMargin: 0,
          gap: 0,
          indexAttribute: 'data-index',
          initialMeasurementsCache: [],
          lanes: 1,
          isScrollingResetDelay: 150,
          enabled: !0,
          isRtl: !1,
          useScrollendEvent: !1,
          useAnimationFrameWithResizeObserver: !1,
          laneAssignmentMode: 'estimate'
        };
        for (const e in t) {
          const n = t[e];
          n !== void 0 && (s[e] = n);
        }
        this.options = s;
      }),
      (this.notify = (t) => {
        var s, e;
        (e = (s = this.options).onChange) == null || e.call(s, this, t);
      }),
      (this.maybeNotify = k(
        () => (
          this.calculateRange(),
          [
            this.isScrolling,
            this.range ? this.range.startIndex : null,
            this.range ? this.range.endIndex : null
          ]
        ),
        (t) => {
          this.notify(t);
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
        (this.unsubs.filter(Boolean).forEach((t) => t()),
          (this.unsubs = []),
          this.observer.disconnect(),
          this.rafId != null &&
            this.targetWindow &&
            (this.targetWindow.cancelAnimationFrame(this.rafId), (this.rafId = null)),
          (this.scrollState = null),
          (this.scrollElement = null),
          (this.targetWindow = null));
      }),
      (this._didMount = () => () => {
        this.cleanup();
      }),
      (this._willUpdate = () => {
        var t;
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
                  ((t = this.scrollElement) == null ? void 0 : t.window) ?? null),
            this.elementsCache.forEach((e) => {
              this.observer.observe(e);
            }),
            this.unsubs.push(
              this.options.observeElementRect(this, (e) => {
                ((this.scrollRect = e), this.maybeNotify());
              })
            ),
            this.unsubs.push(
              this.options.observeElementOffset(this, (e, n) => {
                (this._intendedScrollOffset !== null &&
                  Math.abs(e - this._intendedScrollOffset) < 1.5 &&
                  (e = this._intendedScrollOffset),
                  (this._intendedScrollOffset = null),
                  (this.scrollAdjustments = 0),
                  (this.scrollDirection = n
                    ? this.getScrollOffset() < e
                      ? 'forward'
                      : 'backward'
                    : null),
                  (this.scrollOffset = e),
                  (this.isScrolling = n),
                  this._flushIosDeferredIfReady(),
                  this.scrollState && this.scheduleScrollReconcile(),
                  this.maybeNotify());
              })
            ),
            'addEventListener' in this.scrollElement)
          ) {
            const e = this.scrollElement,
              n = () => {
                ((this._iosTouching = !0),
                  (this._iosJustTouchEnded = !1),
                  this._iosTouchEndTimerId !== null &&
                    this.targetWindow != null &&
                    (this.targetWindow.clearTimeout(this._iosTouchEndTimerId),
                    (this._iosTouchEndTimerId = null)));
              },
              o = () => {
                ((this._iosTouching = !1),
                  !(!W() || this.targetWindow == null) &&
                    ((this._iosJustTouchEnded = !0),
                    (this._iosTouchEndTimerId = this.targetWindow.setTimeout(() => {
                      ((this._iosJustTouchEnded = !1),
                        (this._iosTouchEndTimerId = null),
                        this._flushIosDeferredIfReady());
                    }, 150))));
              };
            (e.addEventListener('touchstart', n, T),
              e.addEventListener('touchend', o, T),
              this.unsubs.push(() => {
                (e.removeEventListener('touchstart', n),
                  e.removeEventListener('touchend', o),
                  this._iosTouchEndTimerId !== null &&
                    this.targetWindow != null &&
                    (this.targetWindow.clearTimeout(this._iosTouchEndTimerId),
                    (this._iosTouchEndTimerId = null)));
              }));
          }
          this._scrollToOffset(this.getScrollOffset(), { adjustments: void 0, behavior: void 0 });
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
        const t = this.getScrollOffset(),
          s = this.getMaxScrollOffset();
        if (t < 0 || t > s) return;
        const e = this._iosDeferredAdjustment;
        ((this._iosDeferredAdjustment = 0),
          this._scrollToOffset(t, {
            adjustments: (this.scrollAdjustments += e),
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
      (this.getFurthestMeasurement = (t, s) => {
        const e = new Map(),
          n = new Map();
        for (let o = s - 1; o >= 0; o--) {
          const i = t[o];
          if (e.has(i.lane)) continue;
          const a = n.get(i.lane);
          if (
            (a == null || i.end > a.end ? n.set(i.lane, i) : i.end < a.end && e.set(i.lane, !0),
            e.size === this.options.lanes)
          )
            break;
        }
        return n.size === this.options.lanes
          ? Array.from(n.values()).sort((o, i) =>
              o.end === i.end ? o.index - i.index : o.end - i.end
            )[0]
          : void 0;
      }),
      (this.getMeasurementOptions = k(
        () => [
          this.options.count,
          this.options.paddingStart,
          this.options.scrollMargin,
          this.options.getItemKey,
          this.options.enabled,
          this.options.lanes,
          this.options.laneAssignmentMode
        ],
        (t, s, e, n, o, i, a) => (
          this.prevLanes !== void 0 && this.prevLanes !== i && (this.lanesChangedFlag = !0),
          (this.prevLanes = i),
          (this.pendingMin = null),
          {
            count: t,
            paddingStart: s,
            scrollMargin: e,
            getItemKey: n,
            enabled: o,
            lanes: i,
            laneAssignmentMode: a
          }
        ),
        { key: !1 }
      )),
      (this.getMeasurements = k(
        () => [this.getMeasurementOptions(), this.itemSizeCacheVersion],
        (
          {
            count: t,
            paddingStart: s,
            scrollMargin: e,
            getItemKey: n,
            enabled: o,
            lanes: i,
            laneAssignmentMode: a
          },
          h
        ) => {
          const m = this.itemSizeCache;
          if (!o)
            return (
              (this.measurementsCache = []),
              this.itemSizeCache.clear(),
              this.laneAssignments.clear(),
              []
            );
          if (this.laneAssignments.size > t)
            for (const f of this.laneAssignments.keys()) f >= t && this.laneAssignments.delete(f);
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
              this.measurementsCache.forEach((f) => {
                this.itemSizeCache.set(f.key, f.size);
              })));
          const x = this.lanesSettling ? 0 : (this.pendingMin ?? 0);
          if (
            ((this.pendingMin = null),
            this.lanesSettling && this.measurementsCache.length === t && (this.lanesSettling = !1),
            i === 1)
          ) {
            const f = this.options.gap,
              v = t * 2;
            let g = this._flatMeasurements;
            if (!g || g.length < v) {
              const w = new Float64Array(v);
              (g && x > 0 && w.set(g.subarray(0, x * 2)), (g = w), (this._flatMeasurements = g));
            }
            let E;
            if (x === 0) E = s + e;
            else {
              const w = x - 1;
              E = g[w * 2] + g[w * 2 + 1] + f;
            }
            for (let w = x; w < t; w++) {
              const M = n(w),
                j = m.get(M),
                d = typeof j == 'number' ? j : this.options.estimateSize(w);
              ((g[w * 2] = E), (g[w * 2 + 1] = d), (E += d + f));
            }
            const C = oe(t, g, n);
            return ((this.measurementsCache = C), C);
          }
          const b = this.measurementsCache.slice(0, x),
            _ = new Array(i).fill(void 0);
          for (let f = 0; f < x; f++) {
            const v = b[f];
            v && (_[v.lane] = f);
          }
          for (let f = x; f < t; f++) {
            const v = n(f),
              g = this.laneAssignments.get(f);
            let E, C;
            const w = a === 'estimate' || m.has(v);
            if (g !== void 0 && this.options.lanes > 1) {
              E = g;
              const u = _[E],
                p = u !== void 0 ? b[u] : void 0;
              C = p ? p.end + this.options.gap : s + e;
            } else {
              const u = this.options.lanes === 1 ? b[f - 1] : this.getFurthestMeasurement(b, f);
              ((C = u ? u.end + this.options.gap : s + e),
                (E = u ? u.lane : f % this.options.lanes),
                this.options.lanes > 1 && w && this.laneAssignments.set(f, E));
            }
            const M = m.get(v),
              j = typeof M == 'number' ? M : this.options.estimateSize(f),
              d = C + j;
            ((b[f] = { index: f, start: C, size: j, end: d, key: v, lane: E }), (_[E] = f));
          }
          return ((this.measurementsCache = b), b);
        },
        { key: !1, debug: () => this.options.debug }
      )),
      (this.calculateRange = k(
        () => [this.getMeasurements(), this.getSize(), this.getScrollOffset(), this.options.lanes],
        (t, s, e, n) =>
          (this.range =
            t.length > 0 && s > 0
              ? be({
                  measurements: t,
                  outerSize: s,
                  scrollOffset: e,
                  lanes: n,
                  flat: n === 1 && this._flatMeasurements != null ? this._flatMeasurements : null
                })
              : null),
        { key: !1, debug: () => this.options.debug }
      )),
      (this.getVirtualIndexes = k(
        () => {
          let t = null,
            s = null;
          const e = this.calculateRange();
          return (
            e && ((t = e.startIndex), (s = e.endIndex)),
            this.maybeNotify.updateDeps([this.isScrolling, t, s]),
            [this.options.rangeExtractor, this.options.overscan, this.options.count, t, s]
          );
        },
        (t, s, e, n, o) =>
          n === null || o === null ? [] : t({ startIndex: n, endIndex: o, overscan: s, count: e }),
        { key: !1, debug: () => this.options.debug }
      )),
      (this.indexFromElement = (t) => {
        const s = this.options.indexAttribute,
          e = t.getAttribute(s);
        return e
          ? parseInt(e, 10)
          : (console.warn(`Missing attribute name '${s}={index}' on measured element.`), -1);
      }),
      (this.shouldMeasureDuringScroll = (t) => {
        var s;
        if (!this.scrollState || this.scrollState.behavior !== 'smooth') return !0;
        const e =
          this.scrollState.index ??
          ((s = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)) == null
            ? void 0
            : s.index);
        if (e !== void 0 && this.range) {
          const n = Math.max(
              this.options.overscan,
              Math.ceil((this.range.endIndex - this.range.startIndex) / 2)
            ),
            o = Math.max(0, e - n),
            i = Math.min(this.options.count - 1, e + n);
          return t >= o && t <= i;
        }
        return !0;
      }),
      (this.measureElement = (t) => {
        if (!t) {
          this.elementsCache.forEach((o, i) => {
            o.isConnected || (this.observer.unobserve(o), this.elementsCache.delete(i));
          });
          return;
        }
        const s = this.indexFromElement(t),
          e = this.options.getItemKey(s),
          n = this.elementsCache.get(e);
        (n !== t &&
          (n && this.observer.unobserve(n), this.observer.observe(t), this.elementsCache.set(e, t)),
          (!this.isScrolling || this.scrollState) &&
            this.shouldMeasureDuringScroll(s) &&
            this.resizeItem(s, this.options.measureElement(t, void 0, this)));
      }),
      (this.resizeItem = (t, s) => {
        var e;
        if (t < 0 || t >= this.options.count) return;
        let n, o, i;
        const a = this._flatMeasurements;
        if (this.options.lanes === 1 && a !== null)
          ((i = this.options.getItemKey(t)), (o = a[t * 2]), (n = a[t * 2 + 1]));
        else {
          const x = this.measurementsCache[t];
          if (!x) return;
          ((i = x.key), (o = x.start), (n = x.size));
        }
        const h = this.itemSizeCache.get(i) ?? n,
          m = s - h;
        m !== 0 &&
          (((e = this.scrollState) == null ? void 0 : e.behavior) !== 'smooth' &&
            (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0
              ? this.shouldAdjustScrollPositionOnItemSizeChange(
                  this.measurementsCache[t] ?? {
                    index: t,
                    key: i,
                    start: o,
                    size: n,
                    end: o + n,
                    lane: 0
                  },
                  m,
                  this
                )
              : o < this.getScrollOffset() + this.scrollAdjustments &&
                this.scrollDirection !== 'backward') &&
            (W() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded)
              ? (this._iosDeferredAdjustment += m)
              : this._scrollToOffset(this.getScrollOffset(), {
                  adjustments: (this.scrollAdjustments += m),
                  behavior: void 0
                })),
          (this.pendingMin === null || t < this.pendingMin) && (this.pendingMin = t),
          this.itemSizeCache.set(i, s),
          this.itemSizeCacheVersion++,
          this.notify(!1));
      }),
      (this.getVirtualItems = k(
        () => [this.getVirtualIndexes(), this.getMeasurements()],
        (t, s) => {
          const e = [];
          for (let n = 0, o = t.length; n < o; n++) {
            const i = t[n],
              a = s[i];
            e.push(a);
          }
          return e;
        },
        { key: !1, debug: () => this.options.debug }
      )),
      (this.getVirtualItemForOffset = (t) => {
        const s = this.getMeasurements();
        if (s.length === 0) return;
        const e = this._flatMeasurements,
          n = this.options.lanes === 1 && e != null,
          o = P(0, s.length - 1, n ? (i) => e[i * 2] : (i) => L(s[i]).start, t);
        return L(s[o]);
      }),
      (this.getMaxScrollOffset = () => {
        if (!this.scrollElement) return 0;
        if ('scrollHeight' in this.scrollElement)
          return this.options.horizontal
            ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth
            : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
        {
          const t = this.scrollElement.document.documentElement;
          return this.options.horizontal
            ? t.scrollWidth - this.scrollElement.innerWidth
            : t.scrollHeight - this.scrollElement.innerHeight;
        }
      }),
      (this.getOffsetForAlignment = (t, s, e = 0) => {
        if (!this.scrollElement) return 0;
        const n = this.getSize(),
          o = this.getScrollOffset();
        (s === 'auto' && (s = t >= o + n ? 'end' : 'start'),
          s === 'center' ? (t += (e - n) / 2) : s === 'end' && (t -= n));
        const i = this.getMaxScrollOffset();
        return Math.max(Math.min(i, t), 0);
      }),
      (this.getOffsetForIndex = (t, s = 'auto') => {
        t = Math.max(0, Math.min(t, this.options.count - 1));
        const e = this.getSize(),
          n = this.getScrollOffset(),
          o = this.measurementsCache[t];
        if (!o) return;
        if (s === 'auto')
          if (o.end >= n + e - this.options.scrollPaddingEnd) s = 'end';
          else if (o.start <= n + this.options.scrollPaddingStart) s = 'start';
          else return [n, s];
        if (s === 'end' && t === this.options.count - 1) return [this.getMaxScrollOffset(), s];
        const i =
          s === 'end'
            ? o.end + this.options.scrollPaddingEnd
            : o.start - this.options.scrollPaddingStart;
        return [this.getOffsetForAlignment(i, s, o.size), s];
      }),
      (this.scrollToOffset = (t, { align: s = 'start', behavior: e = 'auto' } = {}) => {
        const n = this.getOffsetForAlignment(t, s),
          o = this.now();
        ((this.scrollState = {
          index: null,
          align: s,
          behavior: e,
          startedAt: o,
          lastTargetOffset: n,
          stableFrames: 0
        }),
          this._scrollToOffset(n, { adjustments: void 0, behavior: e }),
          this.scheduleScrollReconcile());
      }),
      (this.scrollToIndex = (t, { align: s = 'auto', behavior: e = 'auto' } = {}) => {
        t = Math.max(0, Math.min(t, this.options.count - 1));
        const n = this.getOffsetForIndex(t, s);
        if (!n) return;
        const [o, i] = n,
          a = this.now();
        ((this.scrollState = {
          index: t,
          align: i,
          behavior: e,
          startedAt: a,
          lastTargetOffset: o,
          stableFrames: 0
        }),
          this._scrollToOffset(o, { adjustments: void 0, behavior: e }),
          this.scheduleScrollReconcile());
      }),
      (this.scrollBy = (t, { behavior: s = 'auto' } = {}) => {
        const e = this.getScrollOffset() + t,
          n = this.now();
        ((this.scrollState = {
          index: null,
          align: 'start',
          behavior: s,
          startedAt: n,
          lastTargetOffset: e,
          stableFrames: 0
        }),
          this._scrollToOffset(e, { adjustments: void 0, behavior: s }),
          this.scheduleScrollReconcile());
      }),
      (this.getTotalSize = () => {
        var t;
        const s = this.getMeasurements();
        let e;
        if (s.length === 0) e = this.options.paddingStart;
        else if (this.options.lanes === 1) {
          const n = s.length - 1,
            o = this._flatMeasurements;
          o != null
            ? (e = o[n * 2] + o[n * 2 + 1])
            : (e = ((t = s[n]) == null ? void 0 : t.end) ?? 0);
        } else {
          const n = Array(this.options.lanes).fill(null);
          let o = s.length - 1;
          for (; o >= 0 && n.some((i) => i === null);) {
            const i = s[o];
            (n[i.lane] === null && (n[i.lane] = i.end), o--);
          }
          e = Math.max(...n.filter((i) => i !== null));
        }
        return Math.max(e - this.options.scrollMargin + this.options.paddingEnd, 0);
      }),
      (this.takeSnapshot = () => {
        const t = [];
        if (this.itemSizeCache.size === 0) return t;
        const s = this.getMeasurements();
        for (const e of s)
          e &&
            this.itemSizeCache.has(e.key) &&
            t.push({
              index: e.index,
              key: e.key,
              start: e.start,
              size: e.size,
              end: e.end,
              lane: e.lane
            });
        return t;
      }),
      (this._scrollToOffset = (t, { adjustments: s, behavior: e }) => {
        ((this._intendedScrollOffset = t + (s ?? 0)),
          this.options.scrollToFn(t, { behavior: e, adjustments: s }, this));
      }),
      (this.measure = () => {
        ((this.pendingMin = null),
          this.itemSizeCache.clear(),
          this.laneAssignments.clear(),
          this.itemSizeCacheVersion++,
          this.notify(!1));
      }),
      this.setOptions(c));
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
      e = s ? s[0] : this.scrollState.lastTargetOffset,
      n = 1,
      o = e !== this.scrollState.lastTargetOffset;
    if (!o && le(e, this.getScrollOffset())) {
      if ((this.scrollState.stableFrames++, this.scrollState.stableFrames >= n)) {
        (this.getScrollOffset() !== e &&
          this._scrollToOffset(e, { adjustments: void 0, behavior: 'auto' }),
          (this.scrollState = null));
        return;
      }
    } else if (((this.scrollState.stableFrames = 0), o)) {
      const i = this.getSize() || 600,
        a = Math.abs(e - this.getScrollOffset()),
        h = this.scrollState.behavior === 'smooth' && a > i;
      ((this.scrollState.lastTargetOffset = e),
        h || (this.scrollState.behavior = 'auto'),
        this._scrollToOffset(e, { adjustments: void 0, behavior: h ? 'smooth' : 'auto' }));
    }
    this.scheduleScrollReconcile();
  }
}
const P = (l, c, t, s) => {
  for (; l <= c;) {
    const e = ((l + c) / 2) | 0,
      n = t(e);
    if (n < s) l = e + 1;
    else if (n > s) c = e - 1;
    else return e;
  }
  return l > 0 ? l - 1 : 0;
};
function be({ measurements: l, outerSize: c, scrollOffset: t, lanes: s, flat: e }) {
  const n = l.length - 1,
    o = e ? (m) => e[m * 2] : (m) => l[m].start,
    i = e ? (m) => e[m * 2] + e[m * 2 + 1] : (m) => l[m].end;
  if (l.length <= s) return { startIndex: 0, endIndex: n };
  let a = P(0, n, o, t),
    h = a;
  if (s === 1) for (; h < n && i(h) < t + c;) h++;
  else if (s > 1) {
    const m = Array(s).fill(0);
    for (; h < n && m.some((b) => b < t + c);) {
      const b = l[h];
      ((m[b.lane] = b.end), h++);
    }
    const x = Array(s).fill(t + c);
    for (; a >= 0 && x.some((b) => b >= t);) {
      const b = l[a];
      ((x[b.lane] = b.start), a--);
    }
    ((a = Math.max(0, a - (a % s))), (h = Math.min(n, h + (s - 1 - (h % s)))));
  }
  return { startIndex: a, endIndex: h };
}
const U = typeof document < 'u' ? y.useLayoutEffect : y.useEffect;
function ve({ useFlushSync: l = !0, ...c }) {
  const t = y.useReducer((n) => n + 1, 0)[1],
    s = {
      ...c,
      onChange: (n, o) => {
        var i;
        (l && o ? $.flushSync(t) : t(), (i = c.onChange) == null || i.call(c, n, o));
      }
    },
    [e] = y.useState(() => new xe(s));
  return (e.setOptions(s), U(() => e._didMount(), []), U(() => e._willUpdate()), e);
}
function Se(l) {
  return ve({ observeElementRect: he, observeElementOffset: me, scrollToFn: pe, ...l });
}
function we() {
  const { user: l, loading: c, hasPermission: t } = H(),
    e =
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
      ].some((n) => t(n));
  return !c && e;
}
function ye() {
  const l = we(),
    { data: c = [], isLoading: t } = B({
      queryKey: ['calidad_flags'],
      enabled: l,
      meta: { module: 'quality', action: 'calidad_flags_query', table: 'tms_calidad_flags' },
      queryFn: async () => {
        const { data: o, error: i } = await J.from('tms_calidad_flags')
          .select('codigo_producto, partida, ubicacion, estado_calidad, severidad, nota')
          .eq('vigente', !0);
        if (i) throw i;
        return o || [];
      },
      staleTime: 6e4
    }),
    { byCodigo: s, byCodigoUbic: e } = y.useMemo(() => {
      const o = new Map(),
        i = new Map();
      for (const a of c) {
        const h = (a.codigo_producto || '').toUpperCase(),
          m = o.get(h);
        if (((!m || a.severidad > m.severidad) && o.set(h, a), a.ubicacion)) {
          const x = `${h}::${(a.ubicacion || '').toUpperCase()}`,
            b = i.get(x);
          (!b || a.severidad > b.severidad) && i.set(x, a);
        }
      }
      return { byCodigo: o, byCodigoUbic: i };
    }, [c]);
  function n(o, i) {
    const a = (o || '').toUpperCase();
    if (i) {
      const h = e.get(`${a}::${(i || '').toUpperCase()}`);
      if (h) return h;
    }
    return s.get(a) || null;
  }
  return { flags: c, isLoading: t, byCodigo: s, byCodigoUbic: e, flagForItem: n };
}
const R = 92,
  V = 44,
  Ee = K.memo(({ group: l, searchQuery: c, isExpanded: t, onToggle: s, flagForItem: e }) => {
    const n = l.matchingItems,
      o = l.allItems.length,
      i = l.allItems.reduce((v, g) => v + (Number(g.cantidad) || 0), 0),
      a = n.reduce((v, g) => v + (Number(g.cantidad) || 0), 0),
      h = c.length > 0,
      m = h ? n : l.allItems,
      x = t ? m : m.slice(0, 1),
      b = h ? a : i,
      _ = h ? n.length : o,
      f = b > 0;
    return r.jsxs('div', {
      className:
        'bg-white border border-slate-200/70 rounded-2xl hover:border-amber-200 hover:shadow-[0_4px_20px_-8px_rgba(245,158,11,0.25)] transition-all overflow-hidden',
      children: [
        r.jsxs('div', {
          className:
            'flex items-center gap-3 px-4 sm:px-5 py-3.5 cursor-pointer select-none hover:bg-amber-50/30 transition-colors',
          onClick: s,
          children: [
            r.jsx('div', {
              className: `w-1 self-stretch rounded-full shrink-0 ${f ? 'bg-emerald-400' : 'bg-slate-200'}`
            }),
            r.jsxs('div', {
              className: 'min-w-0 flex-1',
              children: [
                r.jsxs('div', {
                  className: 'flex items-center gap-2 flex-wrap',
                  children: [
                    r.jsx('span', {
                      className: `text-sm sm:text-base font-black font-mono tracking-tight ${f ? 'text-slate-900' : 'text-slate-400'}`,
                      children: l.ubicacion
                    }),
                    h &&
                      n.length < o &&
                      r.jsxs('span', {
                        className:
                          'text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100',
                        children: [n.length, '/', o]
                      })
                  ]
                }),
                r.jsxs('div', {
                  className: 'flex items-center gap-1 mt-0.5 text-xs text-slate-400',
                  children: [
                    r.jsx(se, { size: 11 }),
                    r.jsx('span', { className: 'font-bold text-slate-500', children: _ }),
                    r.jsx('span', { children: _ === 1 ? 'SKU' : 'SKUs' })
                  ]
                })
              ]
            }),
            r.jsxs('div', {
              className: 'text-right shrink-0',
              children: [
                r.jsx('span', {
                  className: `text-lg sm:text-xl font-black tabular-nums ${f ? 'text-slate-900' : 'text-slate-300'}`,
                  children: b
                }),
                r.jsx('span', {
                  className: 'text-[10px] text-slate-400 font-medium ml-0.5',
                  children: 'uds'
                })
              ]
            }),
            r.jsx('div', {
              className:
                'w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0',
              children: t ? r.jsx(ne, { size: 14 }) : r.jsx(ie, { size: 14 })
            })
          ]
        }),
        x.length > 0 &&
          r.jsxs('div', {
            className: 'border-t border-slate-100',
            children: [
              x.map((v, g) => {
                const E = e ? e(v.codigo, v.ubicacion || l.ubicacion) : null;
                return r.jsxs(
                  'div',
                  {
                    className: `flex items-center gap-3 px-4 sm:px-5 py-2.5 text-sm ${g > 0 ? 'border-t border-slate-50' : ''} hover:bg-amber-50/20 transition-colors`,
                    children: [
                      r.jsx('span', {
                        className:
                          'text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 shrink-0',
                        children: v.codigo
                      }),
                      E && r.jsx(G, { estado: E.estado_calidad, size: 'xs', title: E.nota }),
                      r.jsx('span', {
                        className: 'text-slate-500 truncate flex-1 min-w-0',
                        children: v.descripcion
                      }),
                      r.jsx('span', {
                        className: 'text-sm font-black text-slate-800 tabular-nums shrink-0',
                        children: Number(v.cantidad) || 0
                      })
                    ]
                  },
                  v.id || g
                );
              }),
              !t &&
                m.length > 1 &&
                r.jsxs('button', {
                  onClick: (v) => {
                    (v.stopPropagation(), s());
                  },
                  className:
                    'w-full py-2 text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50/30 transition-colors border-t border-slate-50',
                  children: ['+', m.length - 1, ' más']
                })
            ]
          })
      ]
    });
  }),
  Ne = () => {
    const { inventory: l, stats: c, loading: t, fetchWarehouseData: s } = q(),
      { flagForItem: e } = ye(),
      [n, o] = y.useState(''),
      [i, a] = y.useState('all'),
      [h, m] = y.useState(!0),
      [x, b] = y.useState(new Set()),
      _ = y.useRef(null),
      f = y.useRef(null);
    (y.useEffect(() => {
      s();
    }, [s]),
      y.useEffect(() => {
        const d = (u) => {
          var p;
          (u.ctrlKey || u.metaKey) &&
            u.key === 'k' &&
            (u.preventDefault(), (p = f.current) == null || p.focus());
        };
        return (
          window.addEventListener('keydown', d),
          () => window.removeEventListener('keydown', d)
        );
      }, []));
    const v = y.useMemo(() => {
        const d = {};
        return (
          Object.entries(l).forEach(([u, p]) => {
            (d[u] || (d[u] = { ubicacion: u, allItems: [], matchingItems: [] }),
              (d[u].allItems = p));
          }),
          d
        );
      }, [l]),
      g = y.useMemo(() => {
        const d = n.toLowerCase().trim();
        if (!d) return [];
        let u = Object.values(v);
        return (
          (u = u.map((p) => {
            let I;
            return (
              d
                ? (I = p.allItems.filter(
                    (S) =>
                      (S.ubicacion || '').toLowerCase().includes(d) ||
                      (S.codigo || '').toLowerCase().includes(d) ||
                      (S.descripcion || '').toLowerCase().includes(d)
                  ))
                : (I = p.allItems),
              { ...p, matchingItems: I }
            );
          })),
          d && (u = u.filter((p) => p.matchingItems.length > 0)),
          i === 'stock'
            ? (u = u.filter((p) =>
                (d ? p.matchingItems : p.allItems).some((S) => Number(S.cantidad) > 0)
              ))
            : i === 'empty' &&
              (u = u.filter(
                (p) => p.allItems.reduce((I, S) => I + (Number(S.cantidad) || 0), 0) === 0
              )),
          u.sort((p, I) => {
            const S = p.ubicacion.localeCompare(I.ubicacion);
            return h ? S : -S;
          }),
          u
        );
      }, [v, n, i, h]),
      E = y.useMemo(() => {
        const d = g.length,
          u = g.reduce((I, S) => I + (n ? S.matchingItems : S.allItems).length, 0),
          p = g.reduce(
            (I, S) =>
              I +
              (n ? S.matchingItems : S.allItems).reduce((z, O) => z + (Number(O.cantidad) || 0), 0),
            0
          );
        return { totalLocations: d, totalItems: u, totalStock: p };
      }, [g, n]),
      C = y.useCallback((d) => {
        b((u) => {
          const p = new Set(u);
          return (p.has(d) ? p.delete(d) : p.add(d), p);
        });
      }, []),
      w = Se({
        count: g.length,
        getScrollElement: () => _.current,
        estimateSize: (d) => {
          const u = g[d];
          if (!u) return R;
          const p = x.has(u.ubicacion),
            S = n.toLowerCase().trim() ? u.matchingItems : u.allItems;
          return p
            ? R + S.length * V + 8
            : R + (S.length > 0 ? V : 0) + (S.length > 1 ? 32 : 0) + 8;
        },
        overscan: 8
      });
    y.useEffect(() => {
      w.measure();
    }, [x, n, i]);
    const M = y.useCallback(() => {
        const d = ['Ubicacion', 'Codigo', 'Descripcion', 'Cantidad'],
          u = [];
        g.forEach((O) => {
          (n ? O.matchingItems : O.allItems).forEach((A) => {
            u.push([
              `"${(A.ubicacion || '').replace(/"/g, '""')}"`,
              `"${(A.codigo || '').replace(/"/g, '""')}"`,
              `"${(A.descripcion || '').replace(/"/g, '""')}"`,
              A.cantidad || 0
            ]);
          });
        });
        const p = [d, ...u].map((O) => O.join(',')).join(`
`),
          I = new Blob(['\uFEFF' + p], { type: 'text/csv;charset=utf-8;' }),
          S = URL.createObjectURL(I),
          z = document.createElement('a');
        (z.setAttribute('href', S),
          z.setAttribute(
            'download',
            `WMS_UBICACIONES_${new Date().toISOString().slice(0, 10)}.csv`
          ),
          document.body.appendChild(z),
          z.click(),
          document.body.removeChild(z),
          URL.revokeObjectURL(S));
      }, [g, n]),
      j = [
        { key: 'all', label: 'Todos' },
        { key: 'stock', label: 'Con stock' },
        { key: 'empty', label: 'Vacías' }
      ];
    return r.jsxs('div', {
      className: 'h-full flex flex-col bg-[#F9FAFB] overflow-hidden',
      children: [
        r.jsx('header', {
          className: 'shrink-0 px-4 pt-6 sm:pt-8 pb-4',
          children: r.jsxs('div', {
            className: 'max-w-2xl mx-auto text-center',
            children: [
              r.jsx('div', {
                className:
                  'inline-flex w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm items-center justify-center mb-3',
                children: r.jsx(X, { className: 'text-amber-500', size: 28, strokeWidth: 2.2 })
              }),
              r.jsx('h1', {
                className: 'text-2xl sm:text-4xl font-black tracking-tighter',
                children: r.jsx('span', {
                  className:
                    'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent',
                  children: 'Ubicaciones'
                })
              }),
              r.jsx('p', {
                className: 'text-xs sm:text-sm text-slate-400 mt-1 font-medium',
                children: 'Escribe y los resultados aparecen al instante'
              }),
              r.jsxs('div', {
                className: 'relative mt-5 group',
                children: [
                  r.jsx('div', {
                    className:
                      'absolute -inset-1.5 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-[1.4rem] blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500'
                  }),
                  r.jsxs('div', {
                    className:
                      'relative flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl px-4 h-14 sm:h-16 shadow-sm transition-all duration-300 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100/70 focus-within:-translate-y-0.5',
                    children: [
                      r.jsx(F, {
                        size: 20,
                        className:
                          'text-slate-300 group-focus-within:text-amber-500 transition-colors shrink-0'
                      }),
                      r.jsx('input', {
                        ref: f,
                        type: 'text',
                        autoFocus: !0,
                        placeholder: 'Buscar ubicación, SKU o descripción...',
                        className:
                          'flex-1 min-w-0 bg-transparent outline-none text-base sm:text-lg font-medium text-slate-900 placeholder:text-slate-300',
                        value: n,
                        onChange: (d) => o(d.target.value)
                      }),
                      n
                        ? r.jsxs(r.Fragment, {
                            children: [
                              r.jsxs('span', {
                                className:
                                  'text-[11px] text-slate-400 font-mono font-bold shrink-0 tabular-nums',
                                children: [E.totalLocations, ' ubic.']
                              }),
                              r.jsx('button', {
                                onClick: () => {
                                  var d;
                                  (o(''), (d = f.current) == null || d.focus());
                                },
                                className:
                                  'w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shrink-0',
                                children: r.jsx(Q, { size: 13 })
                              })
                            ]
                          })
                        : r.jsx('span', {
                            className:
                              'hidden sm:inline text-[10px] text-slate-300 font-mono shrink-0',
                            children: 'Ctrl K'
                          })
                    ]
                  })
                ]
              }),
              r.jsxs('div', {
                className: 'flex items-center justify-center flex-wrap gap-2 mt-4',
                children: [
                  r.jsx('div', {
                    className: 'flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5',
                    children: j.map((d) =>
                      r.jsx(
                        'button',
                        {
                          onClick: () => a(d.key),
                          className: `px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${i === d.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`,
                          children: d.label
                        },
                        d.key
                      )
                    )
                  }),
                  r.jsxs('button', {
                    onClick: () => m((d) => !d),
                    className:
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all',
                    children: [r.jsx(Z, { size: 13 }), ' ', h ? 'A→Z' : 'Z→A']
                  }),
                  r.jsxs('button', {
                    onClick: M,
                    className:
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all',
                    children: [
                      r.jsx(Y, { size: 13 }),
                      ' ',
                      r.jsx('span', { className: 'hidden sm:inline', children: 'Exportar' })
                    ]
                  }),
                  r.jsx('button', {
                    onClick: () => s(!0),
                    className:
                      'w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all',
                    title: 'Actualizar',
                    children: r.jsx(ee, { size: 14, className: t ? 'animate-spin' : '' })
                  })
                ]
              })
            ]
          })
        }),
        r.jsx('main', {
          ref: _,
          className: 'flex-1 overflow-y-auto px-3 sm:px-4 pb-6',
          children: r.jsx('div', {
            className: 'max-w-3xl mx-auto',
            children: n.trim()
              ? t && g.length === 0
                ? r.jsxs('div', {
                    className: 'flex flex-col items-center justify-center py-28',
                    children: [
                      r.jsx('div', {
                        className:
                          'w-11 h-11 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mb-5'
                      }),
                      r.jsx('p', {
                        className: 'text-xs font-bold text-slate-400 uppercase tracking-widest',
                        children: 'Cargando datos...'
                      })
                    ]
                  })
                : g.length === 0
                  ? r.jsxs('div', {
                      className: 'flex flex-col items-center justify-center py-28',
                      children: [
                        r.jsx(te, { size: 40, className: 'text-slate-200 mb-4' }),
                        r.jsx('h3', {
                          className: 'text-base font-bold text-slate-400 mb-1',
                          children: 'Sin resultados'
                        }),
                        r.jsxs('p', {
                          className: 'text-xs text-slate-300',
                          children: ['No se encontró "', n, '"']
                        })
                      ]
                    })
                  : r.jsx('div', {
                      className: 'relative',
                      style: { height: `${w.getTotalSize()}px` },
                      children: w.getVirtualItems().map((d) => {
                        const u = g[d.index];
                        return r.jsx(
                          'div',
                          {
                            'data-index': d.index,
                            ref: w.measureElement,
                            className: 'absolute top-0 left-0 w-full',
                            style: { transform: `translateY(${d.start}px)`, paddingBottom: '8px' },
                            children: r.jsx(Ee, {
                              group: u,
                              searchQuery: n,
                              isExpanded: x.has(u.ubicacion),
                              onToggle: () => C(u.ubicacion),
                              flagForItem: e
                            })
                          },
                          u.ubicacion
                        );
                      })
                    })
              : r.jsxs('div', {
                  className: 'flex flex-col items-center justify-center py-28 text-center',
                  children: [
                    r.jsx(F, { size: 40, className: 'text-slate-200 mb-4' }),
                    r.jsx('h3', {
                      className: 'text-base font-bold text-slate-400 mb-1',
                      children: 'Empieza a escribir'
                    }),
                    r.jsx('p', {
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
export { Ne as default };
