import { R as s, a as Yt, r as Mt } from './react-vendor-6aw4XXjH.js';
function Wt(i) {
  if (typeof document > 'u') return;
  let n = document.head || document.getElementsByTagName('head')[0],
    a = document.createElement('style');
  ((a.type = 'text/css'),
    n.appendChild(a),
    a.styleSheet ? (a.styleSheet.cssText = i) : a.appendChild(document.createTextNode(i)));
}
const Xt = (i) => {
    switch (i) {
      case 'success':
        return Qt;
      case 'info':
        return te;
      case 'warning':
        return Jt;
      case 'error':
        return ee;
      default:
        return null;
    }
  },
  Gt = Array(12).fill(0),
  Kt = ({ visible: i, className: n }) =>
    s.createElement(
      'div',
      { className: ['sonner-loading-wrapper', n].filter(Boolean).join(' '), 'data-visible': i },
      s.createElement(
        'div',
        { className: 'sonner-spinner' },
        Gt.map((a, o) =>
          s.createElement('div', { className: 'sonner-loading-bar', key: `spinner-bar-${o}` })
        )
      )
    ),
  Qt = s.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      height: '20',
      width: '20'
    },
    s.createElement('path', {
      fillRule: 'evenodd',
      d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z',
      clipRule: 'evenodd'
    })
  ),
  Jt = s.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      height: '20',
      width: '20'
    },
    s.createElement('path', {
      fillRule: 'evenodd',
      d: 'M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z',
      clipRule: 'evenodd'
    })
  ),
  te = s.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      height: '20',
      width: '20'
    },
    s.createElement('path', {
      fillRule: 'evenodd',
      d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z',
      clipRule: 'evenodd'
    })
  ),
  ee = s.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      height: '20',
      width: '20'
    },
    s.createElement('path', {
      fillRule: 'evenodd',
      d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z',
      clipRule: 'evenodd'
    })
  ),
  ae = s.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '12',
      height: '12',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.5',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    s.createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
    s.createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
  ),
  se = () => {
    const [i, n] = s.useState(document.hidden);
    return (
      s.useEffect(() => {
        const a = () => {
          n(document.hidden);
        };
        return (
          document.addEventListener('visibilitychange', a),
          () => window.removeEventListener('visibilitychange', a)
        );
      }, []),
      i
    );
  };
let wt = 1;
class ne {
  constructor() {
    ((this.subscribe = (n) => (
      this.subscribers.push(n),
      () => {
        const a = this.subscribers.indexOf(n);
        this.subscribers.splice(a, 1);
      }
    )),
      (this.publish = (n) => {
        this.subscribers.forEach((a) => a(n));
      }),
      (this.addToast = (n) => {
        (this.publish(n), (this.toasts = [...this.toasts, n]));
      }),
      (this.create = (n) => {
        var a;
        const { message: o, ...S } = n,
          d =
            typeof (n == null ? void 0 : n.id) == 'number' ||
            ((a = n.id) == null ? void 0 : a.length) > 0
              ? n.id
              : wt++,
          f = this.toasts.find((k) => k.id === d),
          L = n.dismissible === void 0 ? !0 : n.dismissible;
        return (
          this.dismissedToasts.has(d) && this.dismissedToasts.delete(d),
          f
            ? (this.toasts = this.toasts.map((k) =>
                k.id === d
                  ? (this.publish({ ...k, ...n, id: d, title: o }),
                    { ...k, ...n, id: d, dismissible: L, title: o })
                  : k
              ))
            : this.addToast({ title: o, ...S, dismissible: L, id: d }),
          d
        );
      }),
      (this.dismiss = (n) => (
        n
          ? (this.dismissedToasts.add(n),
            requestAnimationFrame(() => this.subscribers.forEach((a) => a({ id: n, dismiss: !0 }))))
          : this.toasts.forEach((a) => {
              this.subscribers.forEach((o) => o({ id: a.id, dismiss: !0 }));
            }),
        n
      )),
      (this.message = (n, a) => this.create({ ...a, message: n })),
      (this.error = (n, a) => this.create({ ...a, message: n, type: 'error' })),
      (this.success = (n, a) => this.create({ ...a, type: 'success', message: n })),
      (this.info = (n, a) => this.create({ ...a, type: 'info', message: n })),
      (this.warning = (n, a) => this.create({ ...a, type: 'warning', message: n })),
      (this.loading = (n, a) => this.create({ ...a, type: 'loading', message: n })),
      (this.promise = (n, a) => {
        if (!a) return;
        let o;
        a.loading !== void 0 &&
          (o = this.create({
            ...a,
            promise: n,
            type: 'loading',
            message: a.loading,
            description: typeof a.description != 'function' ? a.description : void 0
          }));
        const S = Promise.resolve(n instanceof Function ? n() : n);
        let d = o !== void 0,
          f;
        const L = S.then(async (l) => {
            if (((f = ['resolve', l]), s.isValidElement(l)))
              ((d = !1), this.create({ id: o, type: 'default', message: l }));
            else if (re(l) && !l.ok) {
              d = !1;
              const e =
                  typeof a.error == 'function'
                    ? await a.error(`HTTP error! status: ${l.status}`)
                    : a.error,
                v =
                  typeof a.description == 'function'
                    ? await a.description(`HTTP error! status: ${l.status}`)
                    : a.description,
                C = typeof e == 'object' && !s.isValidElement(e) ? e : { message: e };
              this.create({ id: o, type: 'error', description: v, ...C });
            } else if (l instanceof Error) {
              d = !1;
              const e = typeof a.error == 'function' ? await a.error(l) : a.error,
                v = typeof a.description == 'function' ? await a.description(l) : a.description,
                C = typeof e == 'object' && !s.isValidElement(e) ? e : { message: e };
              this.create({ id: o, type: 'error', description: v, ...C });
            } else if (a.success !== void 0) {
              d = !1;
              const e = typeof a.success == 'function' ? await a.success(l) : a.success,
                v = typeof a.description == 'function' ? await a.description(l) : a.description,
                C = typeof e == 'object' && !s.isValidElement(e) ? e : { message: e };
              this.create({ id: o, type: 'success', description: v, ...C });
            }
          })
            .catch(async (l) => {
              if (((f = ['reject', l]), a.error !== void 0)) {
                d = !1;
                const M = typeof a.error == 'function' ? await a.error(l) : a.error,
                  e = typeof a.description == 'function' ? await a.description(l) : a.description,
                  D = typeof M == 'object' && !s.isValidElement(M) ? M : { message: M };
                this.create({ id: o, type: 'error', description: e, ...D });
              }
            })
            .finally(() => {
              (d && (this.dismiss(o), (o = void 0)), a.finally == null || a.finally.call(a));
            }),
          k = () =>
            new Promise((l, M) => L.then(() => (f[0] === 'reject' ? M(f[1]) : l(f[1]))).catch(M));
        return typeof o != 'string' && typeof o != 'number'
          ? { unwrap: k }
          : Object.assign(o, { unwrap: k });
      }),
      (this.custom = (n, a) => {
        const o = (a == null ? void 0 : a.id) || wt++;
        return (this.create({ jsx: n(o), id: o, ...a }), o);
      }),
      (this.getActiveToasts = () => this.toasts.filter((n) => !this.dismissedToasts.has(n.id))),
      (this.subscribers = []),
      (this.toasts = []),
      (this.dismissedToasts = new Set()));
  }
}
const z = new ne(),
  oe = (i, n) => {
    const a = (n == null ? void 0 : n.id) || wt++;
    return (z.addToast({ title: i, ...n, id: a }), a);
  },
  re = (i) =>
    i &&
    typeof i == 'object' &&
    'ok' in i &&
    typeof i.ok == 'boolean' &&
    'status' in i &&
    typeof i.status == 'number',
  ie = oe,
  le = () => z.toasts,
  ce = () => z.getActiveToasts(),
  Ce = Object.assign(
    ie,
    {
      success: z.success,
      info: z.info,
      warning: z.warning,
      error: z.error,
      custom: z.custom,
      message: z.message,
      promise: z.promise,
      dismiss: z.dismiss,
      loading: z.loading
    },
    { getHistory: le, getToasts: ce }
  );
Wt(
  "[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);background:var(--normal-bg);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}"
);
function ut(i) {
  return i.label !== void 0;
}
const de = 3,
  ye = '24px',
  he = '16px',
  jt = 4e3,
  pe = 356,
  ue = 14,
  ke = 45,
  me = 200;
function B(...i) {
  return i.filter(Boolean).join(' ');
}
function fe(i) {
  const [n, a] = i.split('-'),
    o = [];
  return (n && o.push(n), a && o.push(a), o);
}
const ge = (i) => {
  var n, a, o, S, d, f, L, k, l;
  const {
      invert: M,
      toast: e,
      unstyled: v,
      interacting: D,
      setHeights: C,
      visibleToasts: kt,
      heights: $,
      index: y,
      toasts: nt,
      expanded: Y,
      removeToast: ot,
      defaultRichColors: mt,
      closeButton: N,
      style: tt,
      cancelButtonStyle: O,
      actionButtonStyle: ft,
      className: rt = '',
      descriptionClassName: gt = '',
      duration: et,
      position: R,
      gap: it,
      expandByDefault: at,
      classNames: h,
      icons: x,
      closeButtonAriaLabel: I = 'Close toast'
    } = i,
    [F, A] = s.useState(null),
    [U, lt] = s.useState(null),
    [c, m] = s.useState(!1),
    [u, T] = s.useState(!1),
    [W, p] = s.useState(!1),
    [X, ct] = s.useState(!1),
    [dt, G] = s.useState(!1),
    [Rt, vt] = s.useState(0),
    [Bt, Ct] = s.useState(0),
    st = s.useRef(e.duration || et || jt),
    St = s.useRef(null),
    P = s.useRef(null),
    Dt = y === 0,
    Nt = y + 1 <= kt,
    E = e.type,
    K = e.dismissible !== !1,
    Pt = e.className || '',
    It = e.descriptionClassName || '',
    yt = s.useMemo(() => $.findIndex((r) => r.toastId === e.id) || 0, [$, e.id]),
    _t = s.useMemo(() => {
      var r;
      return (r = e.closeButton) != null ? r : N;
    }, [e.closeButton, N]),
    Lt = s.useMemo(() => e.duration || et || jt, [e.duration, et]),
    xt = s.useRef(0),
    Q = s.useRef(0),
    zt = s.useRef(0),
    J = s.useRef(null),
    [Ot, Ft] = R.split('-'),
    Et = s.useMemo(() => $.reduce((r, g, w) => (w >= yt ? r : r + g.height), 0), [$, yt]),
    Ht = se(),
    Ut = e.invert || M,
    bt = E === 'loading';
  ((Q.current = s.useMemo(() => yt * it + Et, [yt, Et])),
    s.useEffect(() => {
      st.current = Lt;
    }, [Lt]),
    s.useEffect(() => {
      m(!0);
    }, []),
    s.useEffect(() => {
      const r = P.current;
      if (r) {
        const g = r.getBoundingClientRect().height;
        return (
          Ct(g),
          C((w) => [{ toastId: e.id, height: g, position: e.position }, ...w]),
          () => C((w) => w.filter((H) => H.toastId !== e.id))
        );
      }
    }, [C, e.id]),
    s.useLayoutEffect(() => {
      if (!c) return;
      const r = P.current,
        g = r.style.height;
      r.style.height = 'auto';
      const w = r.getBoundingClientRect().height;
      ((r.style.height = g),
        Ct(w),
        C((H) =>
          H.find((b) => b.toastId === e.id)
            ? H.map((b) => (b.toastId === e.id ? { ...b, height: w } : b))
            : [{ toastId: e.id, height: w, position: e.position }, ...H]
        ));
    }, [c, e.title, e.description, C, e.id, e.jsx, e.action, e.cancel]));
  const _ = s.useCallback(() => {
    (T(!0),
      vt(Q.current),
      C((r) => r.filter((g) => g.toastId !== e.id)),
      setTimeout(() => {
        ot(e);
      }, me));
  }, [e, ot, C, Q]);
  (s.useEffect(() => {
    if ((e.promise && E === 'loading') || e.duration === 1 / 0 || e.type === 'loading') return;
    let r;
    return (
      Y || D || Ht
        ? (() => {
            if (zt.current < xt.current) {
              const H = new Date().getTime() - xt.current;
              st.current = st.current - H;
            }
            zt.current = new Date().getTime();
          })()
        : (() => {
            st.current !== 1 / 0 &&
              ((xt.current = new Date().getTime()),
              (r = setTimeout(() => {
                (e.onAutoClose == null || e.onAutoClose.call(e, e), _());
              }, st.current)));
          })(),
      () => clearTimeout(r)
    );
  }, [Y, D, e, E, Ht, _]),
    s.useEffect(() => {
      e.delete && (_(), e.onDismiss == null || e.onDismiss.call(e, e));
    }, [_, e.delete]));
  function Zt() {
    var r;
    if (x != null && x.loading) {
      var g;
      return s.createElement(
        'div',
        {
          className: B(
            h == null ? void 0 : h.loader,
            e == null || (g = e.classNames) == null ? void 0 : g.loader,
            'sonner-loader'
          ),
          'data-visible': E === 'loading'
        },
        x.loading
      );
    }
    return s.createElement(Kt, {
      className: B(
        h == null ? void 0 : h.loader,
        e == null || (r = e.classNames) == null ? void 0 : r.loader
      ),
      visible: E === 'loading'
    });
  }
  const $t = e.icon || (x == null ? void 0 : x[E]) || Xt(E);
  var Tt, qt;
  return s.createElement(
    'li',
    {
      tabIndex: 0,
      ref: P,
      className: B(
        rt,
        Pt,
        h == null ? void 0 : h.toast,
        e == null || (n = e.classNames) == null ? void 0 : n.toast,
        h == null ? void 0 : h.default,
        h == null ? void 0 : h[E],
        e == null || (a = e.classNames) == null ? void 0 : a[E]
      ),
      'data-sonner-toast': '',
      'data-rich-colors': (Tt = e.richColors) != null ? Tt : mt,
      'data-styled': !(e.jsx || e.unstyled || v),
      'data-mounted': c,
      'data-promise': !!e.promise,
      'data-swiped': dt,
      'data-removed': u,
      'data-visible': Nt,
      'data-y-position': Ot,
      'data-x-position': Ft,
      'data-index': y,
      'data-front': Dt,
      'data-swiping': W,
      'data-dismissible': K,
      'data-type': E,
      'data-invert': Ut,
      'data-swipe-out': X,
      'data-swipe-direction': U,
      'data-expanded': !!(Y || (at && c)),
      'data-testid': e.testId,
      style: {
        '--index': y,
        '--toasts-before': y,
        '--z-index': nt.length - y,
        '--offset': `${u ? Rt : Q.current}px`,
        '--initial-height': at ? 'auto' : `${Bt}px`,
        ...tt,
        ...e.style
      },
      onDragEnd: () => {
        (p(!1), A(null), (J.current = null));
      },
      onPointerDown: (r) => {
        r.button !== 2 &&
          (bt ||
            !K ||
            ((St.current = new Date()),
            vt(Q.current),
            r.target.setPointerCapture(r.pointerId),
            r.target.tagName !== 'BUTTON' &&
              (p(!0), (J.current = { x: r.clientX, y: r.clientY }))));
      },
      onPointerUp: () => {
        var r, g, w;
        if (X || !K) return;
        J.current = null;
        const H = Number(
            ((r = P.current) == null
              ? void 0
              : r.style.getPropertyValue('--swipe-amount-x').replace('px', '')) || 0
          ),
          ht = Number(
            ((g = P.current) == null
              ? void 0
              : g.style.getPropertyValue('--swipe-amount-y').replace('px', '')) || 0
          ),
          b = new Date().getTime() - ((w = St.current) == null ? void 0 : w.getTime()),
          q = F === 'x' ? H : ht,
          pt = Math.abs(q) / b;
        if (Math.abs(q) >= ke || pt > 0.11) {
          (vt(Q.current),
            e.onDismiss == null || e.onDismiss.call(e, e),
            lt(F === 'x' ? (H > 0 ? 'right' : 'left') : ht > 0 ? 'down' : 'up'),
            _(),
            ct(!0));
          return;
        } else {
          var j, V;
          ((j = P.current) == null || j.style.setProperty('--swipe-amount-x', '0px'),
            (V = P.current) == null || V.style.setProperty('--swipe-amount-y', '0px'));
        }
        (G(!1), p(!1), A(null));
      },
      onPointerMove: (r) => {
        var g, w, H;
        if (
          !J.current ||
          !K ||
          ((g = window.getSelection()) == null ? void 0 : g.toString().length) > 0
        )
          return;
        const b = r.clientY - J.current.y,
          q = r.clientX - J.current.x;
        var pt;
        const j = (pt = i.swipeDirections) != null ? pt : fe(R);
        !F && (Math.abs(q) > 1 || Math.abs(b) > 1) && A(Math.abs(q) > Math.abs(b) ? 'x' : 'y');
        let V = { x: 0, y: 0 };
        const At = (Z) => 1 / (1.5 + Math.abs(Z) / 20);
        if (F === 'y') {
          if (j.includes('top') || j.includes('bottom'))
            if ((j.includes('top') && b < 0) || (j.includes('bottom') && b > 0)) V.y = b;
            else {
              const Z = b * At(b);
              V.y = Math.abs(Z) < Math.abs(b) ? Z : b;
            }
        } else if (F === 'x' && (j.includes('left') || j.includes('right')))
          if ((j.includes('left') && q < 0) || (j.includes('right') && q > 0)) V.x = q;
          else {
            const Z = q * At(q);
            V.x = Math.abs(Z) < Math.abs(q) ? Z : q;
          }
        ((Math.abs(V.x) > 0 || Math.abs(V.y) > 0) && G(!0),
          (w = P.current) == null || w.style.setProperty('--swipe-amount-x', `${V.x}px`),
          (H = P.current) == null || H.style.setProperty('--swipe-amount-y', `${V.y}px`));
      }
    },
    _t && !e.jsx && E !== 'loading'
      ? s.createElement(
          'button',
          {
            'aria-label': I,
            'data-disabled': bt,
            'data-close-button': !0,
            onClick:
              bt || !K
                ? () => {}
                : () => {
                    (_(), e.onDismiss == null || e.onDismiss.call(e, e));
                  },
            className: B(
              h == null ? void 0 : h.closeButton,
              e == null || (o = e.classNames) == null ? void 0 : o.closeButton
            )
          },
          (qt = x == null ? void 0 : x.close) != null ? qt : ae
        )
      : null,
    (E || e.icon || e.promise) &&
      e.icon !== null &&
      ((x == null ? void 0 : x[E]) !== null || e.icon)
      ? s.createElement(
          'div',
          {
            'data-icon': '',
            className: B(
              h == null ? void 0 : h.icon,
              e == null || (S = e.classNames) == null ? void 0 : S.icon
            )
          },
          e.promise || (e.type === 'loading' && !e.icon) ? e.icon || Zt() : null,
          e.type !== 'loading' ? $t : null
        )
      : null,
    s.createElement(
      'div',
      {
        'data-content': '',
        className: B(
          h == null ? void 0 : h.content,
          e == null || (d = e.classNames) == null ? void 0 : d.content
        )
      },
      s.createElement(
        'div',
        {
          'data-title': '',
          className: B(
            h == null ? void 0 : h.title,
            e == null || (f = e.classNames) == null ? void 0 : f.title
          )
        },
        e.jsx ? e.jsx : typeof e.title == 'function' ? e.title() : e.title
      ),
      e.description
        ? s.createElement(
            'div',
            {
              'data-description': '',
              className: B(
                gt,
                It,
                h == null ? void 0 : h.description,
                e == null || (L = e.classNames) == null ? void 0 : L.description
              )
            },
            typeof e.description == 'function' ? e.description() : e.description
          )
        : null
    ),
    s.isValidElement(e.cancel)
      ? e.cancel
      : e.cancel && ut(e.cancel)
        ? s.createElement(
            'button',
            {
              'data-button': !0,
              'data-cancel': !0,
              style: e.cancelButtonStyle || O,
              onClick: (r) => {
                ut(e.cancel) &&
                  K &&
                  (e.cancel.onClick == null || e.cancel.onClick.call(e.cancel, r), _());
              },
              className: B(
                h == null ? void 0 : h.cancelButton,
                e == null || (k = e.classNames) == null ? void 0 : k.cancelButton
              )
            },
            e.cancel.label
          )
        : null,
    s.isValidElement(e.action)
      ? e.action
      : e.action && ut(e.action)
        ? s.createElement(
            'button',
            {
              'data-button': !0,
              'data-action': !0,
              style: e.actionButtonStyle || ft,
              onClick: (r) => {
                ut(e.action) &&
                  (e.action.onClick == null || e.action.onClick.call(e.action, r),
                  !r.defaultPrevented && _());
              },
              className: B(
                h == null ? void 0 : h.actionButton,
                e == null || (l = e.classNames) == null ? void 0 : l.actionButton
              )
            },
            e.action.label
          )
        : null
  );
};
function Vt() {
  if (typeof window > 'u' || typeof document > 'u') return 'ltr';
  const i = document.documentElement.getAttribute('dir');
  return i === 'auto' || !i ? window.getComputedStyle(document.documentElement).direction : i;
}
function ve(i, n) {
  const a = {};
  return (
    [i, n].forEach((o, S) => {
      const d = S === 1,
        f = d ? '--mobile-offset' : '--offset',
        L = d ? he : ye;
      function k(l) {
        ['top', 'right', 'bottom', 'left'].forEach((M) => {
          a[`${f}-${M}`] = typeof l == 'number' ? `${l}px` : l;
        });
      }
      typeof o == 'number' || typeof o == 'string'
        ? k(o)
        : typeof o == 'object'
          ? ['top', 'right', 'bottom', 'left'].forEach((l) => {
              o[l] === void 0
                ? (a[`${f}-${l}`] = L)
                : (a[`${f}-${l}`] = typeof o[l] == 'number' ? `${o[l]}px` : o[l]);
            })
          : k(L);
    }),
    a
  );
}
const Se = s.forwardRef(function (n, a) {
  const {
      id: o,
      invert: S,
      position: d = 'bottom-right',
      hotkey: f = ['altKey', 'KeyT'],
      expand: L,
      closeButton: k,
      className: l,
      offset: M,
      mobileOffset: e,
      theme: v = 'light',
      richColors: D,
      duration: C,
      style: kt,
      visibleToasts: $ = de,
      toastOptions: y,
      dir: nt = Vt(),
      gap: Y = ue,
      icons: ot,
      containerAriaLabel: mt = 'Notifications'
    } = n,
    [N, tt] = s.useState([]),
    O = s.useMemo(
      () => (o ? N.filter((c) => c.toasterId === o) : N.filter((c) => !c.toasterId)),
      [N, o]
    ),
    ft = s.useMemo(
      () => Array.from(new Set([d].concat(O.filter((c) => c.position).map((c) => c.position)))),
      [O, d]
    ),
    [rt, gt] = s.useState([]),
    [et, R] = s.useState(!1),
    [it, at] = s.useState(!1),
    [h, x] = s.useState(
      v !== 'system'
        ? v
        : typeof window < 'u' &&
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
    ),
    I = s.useRef(null),
    F = f.join('+').replace(/Key/g, '').replace(/Digit/g, ''),
    A = s.useRef(null),
    U = s.useRef(!1),
    lt = s.useCallback((c) => {
      tt((m) => {
        var u;
        return (
          ((u = m.find((T) => T.id === c.id)) != null && u.delete) || z.dismiss(c.id),
          m.filter(({ id: T }) => T !== c.id)
        );
      });
    }, []);
  return (
    s.useEffect(
      () =>
        z.subscribe((c) => {
          if (c.dismiss) {
            requestAnimationFrame(() => {
              tt((m) => m.map((u) => (u.id === c.id ? { ...u, delete: !0 } : u)));
            });
            return;
          }
          setTimeout(() => {
            Yt.flushSync(() => {
              tt((m) => {
                const u = m.findIndex((T) => T.id === c.id);
                return u !== -1
                  ? [...m.slice(0, u), { ...m[u], ...c }, ...m.slice(u + 1)]
                  : [c, ...m];
              });
            });
          });
        }),
      [N]
    ),
    s.useEffect(() => {
      if (v !== 'system') {
        x(v);
        return;
      }
      if (
        (v === 'system' &&
          (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? x('dark')
            : x('light')),
        typeof window > 'u')
      )
        return;
      const c = window.matchMedia('(prefers-color-scheme: dark)');
      try {
        c.addEventListener('change', ({ matches: m }) => {
          x(m ? 'dark' : 'light');
        });
      } catch {
        c.addListener(({ matches: u }) => {
          try {
            x(u ? 'dark' : 'light');
          } catch (T) {
            console.error(T);
          }
        });
      }
    }, [v]),
    s.useEffect(() => {
      N.length <= 1 && R(!1);
    }, [N]),
    s.useEffect(() => {
      const c = (m) => {
        var u;
        if (f.every((p) => m[p] || m.code === p)) {
          var W;
          (R(!0), (W = I.current) == null || W.focus());
        }
        m.code === 'Escape' &&
          (document.activeElement === I.current ||
            ((u = I.current) != null && u.contains(document.activeElement))) &&
          R(!1);
      };
      return (
        document.addEventListener('keydown', c),
        () => document.removeEventListener('keydown', c)
      );
    }, [f]),
    s.useEffect(() => {
      if (I.current)
        return () => {
          A.current &&
            (A.current.focus({ preventScroll: !0 }), (A.current = null), (U.current = !1));
        };
    }, [I.current]),
    s.createElement(
      'section',
      {
        ref: a,
        'aria-label': `${mt} ${F}`,
        tabIndex: -1,
        'aria-live': 'polite',
        'aria-relevant': 'additions text',
        'aria-atomic': 'false',
        suppressHydrationWarning: !0
      },
      ft.map((c, m) => {
        var u;
        const [T, W] = c.split('-');
        return O.length
          ? s.createElement(
              'ol',
              {
                key: c,
                dir: nt === 'auto' ? Vt() : nt,
                tabIndex: -1,
                ref: I,
                className: l,
                'data-sonner-toaster': !0,
                'data-sonner-theme': h,
                'data-y-position': T,
                'data-x-position': W,
                style: {
                  '--front-toast-height': `${((u = rt[0]) == null ? void 0 : u.height) || 0}px`,
                  '--width': `${pe}px`,
                  '--gap': `${Y}px`,
                  ...kt,
                  ...ve(M, e)
                },
                onBlur: (p) => {
                  U.current &&
                    !p.currentTarget.contains(p.relatedTarget) &&
                    ((U.current = !1),
                    A.current && (A.current.focus({ preventScroll: !0 }), (A.current = null)));
                },
                onFocus: (p) => {
                  (p.target instanceof HTMLElement && p.target.dataset.dismissible === 'false') ||
                    U.current ||
                    ((U.current = !0), (A.current = p.relatedTarget));
                },
                onMouseEnter: () => R(!0),
                onMouseMove: () => R(!0),
                onMouseLeave: () => {
                  it || R(!1);
                },
                onDragEnd: () => R(!1),
                onPointerDown: (p) => {
                  (p.target instanceof HTMLElement && p.target.dataset.dismissible === 'false') ||
                    at(!0);
                },
                onPointerUp: () => at(!1)
              },
              O.filter((p) => (!p.position && m === 0) || p.position === c).map((p, X) => {
                var ct, dt;
                return s.createElement(ge, {
                  key: p.id,
                  icons: ot,
                  index: X,
                  toast: p,
                  defaultRichColors: D,
                  duration: (ct = y == null ? void 0 : y.duration) != null ? ct : C,
                  className: y == null ? void 0 : y.className,
                  descriptionClassName: y == null ? void 0 : y.descriptionClassName,
                  invert: S,
                  visibleToasts: $,
                  closeButton: (dt = y == null ? void 0 : y.closeButton) != null ? dt : k,
                  interacting: it,
                  position: c,
                  style: y == null ? void 0 : y.style,
                  unstyled: y == null ? void 0 : y.unstyled,
                  classNames: y == null ? void 0 : y.classNames,
                  cancelButtonStyle: y == null ? void 0 : y.cancelButtonStyle,
                  actionButtonStyle: y == null ? void 0 : y.actionButtonStyle,
                  closeButtonAriaLabel: y == null ? void 0 : y.closeButtonAriaLabel,
                  removeToast: lt,
                  toasts: O.filter((G) => G.position == p.position),
                  heights: rt.filter((G) => G.position == p.position),
                  setHeights: gt,
                  expandByDefault: L,
                  gap: Y,
                  expanded: et,
                  swipeDirections: n.swipeDirections
                });
              })
            )
          : null;
      })
    )
  );
});
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var xe = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const be = (i) =>
    i
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .trim(),
  t = (i, n) => {
    const a = Mt.forwardRef(
      (
        {
          color: o = 'currentColor',
          size: S = 24,
          strokeWidth: d = 2,
          absoluteStrokeWidth: f,
          className: L = '',
          children: k,
          ...l
        },
        M
      ) =>
        Mt.createElement(
          'svg',
          {
            ref: M,
            ...xe,
            width: S,
            height: S,
            stroke: o,
            strokeWidth: f ? (Number(d) * 24) / Number(S) : d,
            className: ['lucide', `lucide-${be(i)}`, L].join(' '),
            ...l
          },
          [...n.map(([e, v]) => Mt.createElement(e, v)), ...(Array.isArray(k) ? k : [k])]
        )
    );
    return ((a.displayName = `${i}`), a);
  };
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Le = t('Activity', [['path', { d: 'M22 12h-4l-3 9L9 3l-3 9H2', key: 'd5dnw9' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ze = t('AlertCircle', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['line', { x1: '12', x2: '12', y1: '8', y2: '12', key: '1pkeuh' }],
  ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16', key: '4dfq90' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ee = t('AlertOctagon', [
  [
    'polygon',
    {
      points: '7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2',
      key: 'h1p8hx'
    }
  ],
  ['line', { x1: '12', x2: '12', y1: '8', y2: '12', key: '1pkeuh' }],
  ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16', key: '4dfq90' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const He = t('AlertTriangle', [
  [
    'path',
    {
      d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z',
      key: 'c3ski4'
    }
  ],
  ['path', { d: 'M12 9v4', key: 'juzpu7' }],
  ['path', { d: 'M12 17h.01', key: 'p32p05' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Te = t('Archive', [
  ['rect', { width: '20', height: '5', x: '2', y: '3', rx: '1', key: '1wp1u1' }],
  ['path', { d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8', key: '1s80jp' }],
  ['path', { d: 'M10 12h4', key: 'a56b0p' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const qe = t('ArrowDownToLine', [
  ['path', { d: 'M12 17V3', key: '1cwfxf' }],
  ['path', { d: 'm6 11 6 6 6-6', key: '12ii2o' }],
  ['path', { d: 'M19 21H5', key: '150jfl' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ae = t('ArrowLeftRight', [
  ['path', { d: 'M8 3 4 7l4 4', key: '9rb6wj' }],
  ['path', { d: 'M4 7h16', key: '6tx8e3' }],
  ['path', { d: 'm16 21 4-4-4-4', key: 'siv7j2' }],
  ['path', { d: 'M20 17H4', key: 'h6l3hr' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const je = t('ArrowLeft', [
  ['path', { d: 'm12 19-7-7 7-7', key: '1l729n' }],
  ['path', { d: 'M19 12H5', key: 'x3x0zl' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ve = t('ArrowRight', [
  ['path', { d: 'M5 12h14', key: '1ays0h' }],
  ['path', { d: 'm12 5 7 7-7 7', key: 'xquz4c' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Re = t('ArrowUpCircle', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'm16 12-4-4-4 4', key: '177agl' }],
  ['path', { d: 'M12 16V8', key: '1sbj14' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Be = t('ArrowUpDown', [
  ['path', { d: 'm21 16-4 4-4-4', key: 'f6ql7i' }],
  ['path', { d: 'M17 20V4', key: '1ejh1v' }],
  ['path', { d: 'm3 8 4-4 4 4', key: '11wl7u' }],
  ['path', { d: 'M7 4v16', key: '1glfcx' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const De = t('ArrowUpFromLine', [
  ['path', { d: 'm18 9-6-6-6 6', key: 'kcunyi' }],
  ['path', { d: 'M12 3v14', key: '7cf3v8' }],
  ['path', { d: 'M5 21h14', key: '11awu3' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ne = t('ArrowUpRight', [
  ['path', { d: 'M7 7h10v10', key: '1tivn9' }],
  ['path', { d: 'M7 17 17 7', key: '1vkiza' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Pe = t('ArrowUp', [
  ['path', { d: 'm5 12 7-7 7 7', key: 'hav0vg' }],
  ['path', { d: 'M12 19V5', key: 'x0mq9r' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ie = t('BadgeCheck', [
  [
    'path',
    {
      d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      key: '3c2336'
    }
  ],
  ['path', { d: 'm9 12 2 2 4-4', key: 'dzmm74' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _e = t('Ban', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'm4.9 4.9 14.2 14.2', key: '1m5liu' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Oe = t('BarChart3', [
  ['path', { d: 'M3 3v18h18', key: '1s2lah' }],
  ['path', { d: 'M18 17V9', key: '2bz60n' }],
  ['path', { d: 'M13 17V5', key: '1frdt8' }],
  ['path', { d: 'M8 17v-3', key: '17ska0' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Fe = t('Barcode', [
  ['path', { d: 'M3 5v14', key: '1nt18q' }],
  ['path', { d: 'M8 5v14', key: '1ybrkv' }],
  ['path', { d: 'M12 5v14', key: 's699le' }],
  ['path', { d: 'M17 5v14', key: 'ycjyhj' }],
  ['path', { d: 'M21 5v14', key: 'nzette' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ue = t('Bell', [
  ['path', { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', key: '1qo2s2' }],
  ['path', { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0', key: 'qgo35s' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ze = t('Bot', [
  ['path', { d: 'M12 8V4H8', key: 'hb8ula' }],
  ['rect', { width: '16', height: '12', x: '4', y: '8', rx: '2', key: 'enze0r' }],
  ['path', { d: 'M2 14h2', key: 'vft8re' }],
  ['path', { d: 'M20 14h2', key: '4cs60a' }],
  ['path', { d: 'M15 13v2', key: '1xurst' }],
  ['path', { d: 'M9 13v2', key: 'rq6x2g' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $e = t('Box', [
  [
    'path',
    {
      d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
      key: 'hh9hay'
    }
  ],
  ['path', { d: 'm3.3 7 8.7 5 8.7-5', key: 'g66t2b' }],
  ['path', { d: 'M12 22V12', key: 'd0xqtd' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ye = t('Boxes', [
  [
    'path',
    {
      d: 'M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z',
      key: 'lc1i9w'
    }
  ],
  ['path', { d: 'm7 16.5-4.74-2.85', key: '1o9zyk' }],
  ['path', { d: 'm7 16.5 5-3', key: 'va8pkn' }],
  ['path', { d: 'M7 16.5v5.17', key: 'jnp8gn' }],
  [
    'path',
    {
      d: 'M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z',
      key: '8zsnat'
    }
  ],
  ['path', { d: 'm17 16.5-5-3', key: '8arw3v' }],
  ['path', { d: 'm17 16.5 4.74-2.85', key: '8rfmw' }],
  ['path', { d: 'M17 16.5v5.17', key: 'k6z78m' }],
  [
    'path',
    {
      d: 'M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z',
      key: '1xygjf'
    }
  ],
  ['path', { d: 'M12 8 7.26 5.15', key: '1vbdud' }],
  ['path', { d: 'm12 8 4.74-2.85', key: '3rx089' }],
  ['path', { d: 'M12 13.5V8', key: '1io7kd' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const We = t('Briefcase', [
  ['rect', { width: '20', height: '14', x: '2', y: '7', rx: '2', ry: '2', key: 'eto64e' }],
  ['path', { d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', key: 'zwj3tp' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Xe = t('Building2', [
  ['path', { d: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', key: '1b4qmf' }],
  ['path', { d: 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', key: 'i71pzd' }],
  ['path', { d: 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', key: '10jefs' }],
  ['path', { d: 'M10 6h4', key: '1itunk' }],
  ['path', { d: 'M10 10h4', key: 'tcdvrf' }],
  ['path', { d: 'M10 14h4', key: 'kelpxr' }],
  ['path', { d: 'M10 18h4', key: '1ulq68' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ge = t('Building', [
  ['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2', ry: '2', key: '76otgf' }],
  ['path', { d: 'M9 22v-4h6v4', key: 'r93iot' }],
  ['path', { d: 'M8 6h.01', key: '1dz90k' }],
  ['path', { d: 'M16 6h.01', key: '1x0f13' }],
  ['path', { d: 'M12 6h.01', key: '1vi96p' }],
  ['path', { d: 'M12 10h.01', key: '1nrarc' }],
  ['path', { d: 'M12 14h.01', key: '1etili' }],
  ['path', { d: 'M16 10h.01', key: '1m94wz' }],
  ['path', { d: 'M16 14h.01', key: '1gbofw' }],
  ['path', { d: 'M8 10h.01', key: '19clt8' }],
  ['path', { d: 'M8 14h.01', key: '6423bh' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ke = t('Calculator', [
  ['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2', key: '1nb95v' }],
  ['line', { x1: '8', x2: '16', y1: '6', y2: '6', key: 'x4nwl0' }],
  ['line', { x1: '16', x2: '16', y1: '14', y2: '18', key: 'wjye3r' }],
  ['path', { d: 'M16 10h.01', key: '1m94wz' }],
  ['path', { d: 'M12 10h.01', key: '1nrarc' }],
  ['path', { d: 'M8 10h.01', key: '19clt8' }],
  ['path', { d: 'M12 14h.01', key: '1etili' }],
  ['path', { d: 'M8 14h.01', key: '6423bh' }],
  ['path', { d: 'M12 18h.01', key: 'mhygvu' }],
  ['path', { d: 'M8 18h.01', key: 'lrp35t' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Qe = t('CalendarClock', [
  ['path', { d: 'M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5', key: '1osxxc' }],
  ['path', { d: 'M16 2v4', key: '4m81vk' }],
  ['path', { d: 'M8 2v4', key: '1cmpym' }],
  ['path', { d: 'M3 10h5', key: 'r794hk' }],
  ['path', { d: 'M17.5 17.5 16 16.25V14', key: 're2vv1' }],
  ['path', { d: 'M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z', key: 'ame013' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Je = t('CalendarDays', [
  ['rect', { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2', key: 'eu3xkr' }],
  ['line', { x1: '16', x2: '16', y1: '2', y2: '6', key: 'm3sa8f' }],
  ['line', { x1: '8', x2: '8', y1: '2', y2: '6', key: '18kwsl' }],
  ['line', { x1: '3', x2: '21', y1: '10', y2: '10', key: 'xt86sb' }],
  ['path', { d: 'M8 14h.01', key: '6423bh' }],
  ['path', { d: 'M12 14h.01', key: '1etili' }],
  ['path', { d: 'M16 14h.01', key: '1gbofw' }],
  ['path', { d: 'M8 18h.01', key: 'lrp35t' }],
  ['path', { d: 'M12 18h.01', key: 'mhygvu' }],
  ['path', { d: 'M16 18h.01', key: 'kzsmim' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ta = t('Calendar', [
  ['rect', { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2', key: 'eu3xkr' }],
  ['line', { x1: '16', x2: '16', y1: '2', y2: '6', key: 'm3sa8f' }],
  ['line', { x1: '8', x2: '8', y1: '2', y2: '6', key: '18kwsl' }],
  ['line', { x1: '3', x2: '21', y1: '10', y2: '10', key: 'xt86sb' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ea = t('Camera', [
  [
    'path',
    {
      d: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z',
      key: '1tc9qg'
    }
  ],
  ['circle', { cx: '12', cy: '13', r: '3', key: '1vg3eu' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const aa = t('CheckCheck', [
  ['path', { d: 'M18 6 7 17l-5-5', key: '116fxf' }],
  ['path', { d: 'm22 10-7.5 7.5L13 16', key: 'ke71qq' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const sa = t('CheckCircle2', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'm9 12 2 2 4-4', key: 'dzmm74' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const na = t('CheckCircle', [
  ['path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14', key: 'g774vq' }],
  ['path', { d: 'm9 11 3 3L22 4', key: '1pflzl' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const oa = t('CheckSquare', [
  ['path', { d: 'm9 11 3 3L22 4', key: '1pflzl' }],
  ['path', { d: 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', key: '1jnkn4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ra = t('Check', [['path', { d: 'M20 6 9 17l-5-5', key: '1gmf2c' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ia = t('ChevronDown', [['path', { d: 'm6 9 6 6 6-6', key: 'qrunsl' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const la = t('ChevronLeft', [['path', { d: 'm15 18-6-6 6-6', key: '1wnfg3' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ca = t('ChevronRight', [['path', { d: 'm9 18 6-6-6-6', key: 'mthhwq' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const da = t('ChevronUp', [['path', { d: 'm18 15-6-6-6 6', key: '153udz' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ya = t('CircleDot', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['circle', { cx: '12', cy: '12', r: '1', key: '41hilf' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ha = t('Circle', [['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const pa = t('ClipboardCheck', [
  ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1', key: 'tgr4d6' }],
  [
    'path',
    { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', key: '116196' }
  ],
  ['path', { d: 'm9 14 2 2 4-4', key: 'df797q' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ua = t('ClipboardList', [
  ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1', key: 'tgr4d6' }],
  [
    'path',
    { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', key: '116196' }
  ],
  ['path', { d: 'M12 11h4', key: '1jrz19' }],
  ['path', { d: 'M12 16h4', key: 'n85exb' }],
  ['path', { d: 'M8 11h.01', key: '1dfujw' }],
  ['path', { d: 'M8 16h.01', key: '18s6g9' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ka = t('ClipboardPaste', [
  [
    'path',
    { d: 'M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z', key: '1pp7kr' }
  ],
  [
    'path',
    {
      d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2M11 14h10',
      key: '2ik1ml'
    }
  ],
  ['path', { d: 'm17 10 4 4-4 4', key: 'vp2hj1' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ma = t('Clock3', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['polyline', { points: '12 6 12 12 16.5 12', key: '1aq6pp' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const fa = t('Clock', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['polyline', { points: '12 6 12 12 16 14', key: '68esgv' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ga = t('CloudOff', [
  ['path', { d: 'm2 2 20 20', key: '1ooewy' }],
  ['path', { d: 'M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193', key: 'yfwify' }],
  [
    'path',
    { d: 'M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07', key: 'jlfiyv' }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const va = t('Columns', [
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2', key: '1m3agn' }],
  ['line', { x1: '12', x2: '12', y1: '3', y2: '21', key: '1efggb' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const xa = t('Copy', [
  ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2', key: '17jyea' }],
  ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2', key: 'zix9uf' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ba = t('Crown', [
  ['path', { d: 'm2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14', key: 'zkxr6b' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ma = t('Database', [
  ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3', key: 'msslwz' }],
  ['path', { d: 'M3 5V19A9 3 0 0 0 21 19V5', key: '1wlel7' }],
  ['path', { d: 'M3 12A9 3 0 0 0 21 12', key: 'mv7ke4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const wa = t('Diamond', [
  [
    'path',
    {
      d: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z',
      key: '1f1r0c'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ca = t('DollarSign', [
  ['line', { x1: '12', x2: '12', y1: '2', y2: '22', key: '7eqyqh' }],
  ['path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', key: '1b0p4s' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Sa = t('DownloadCloud', [
  ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242', key: '1pljnt' }],
  ['path', { d: 'M12 12v9', key: '192myk' }],
  ['path', { d: 'm8 17 4 4 4-4', key: '1ul180' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const La = t('Download', [
  ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', key: 'ih7n3h' }],
  ['polyline', { points: '7 10 12 15 17 10', key: '2ggqvy' }],
  ['line', { x1: '12', x2: '12', y1: '15', y2: '3', key: '1vk2je' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const za = t('Eraser', [
  [
    'path',
    {
      d: 'm7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21',
      key: '182aya'
    }
  ],
  ['path', { d: 'M22 21H7', key: 't4ddhn' }],
  ['path', { d: 'm5 11 9 9', key: '1mo9qw' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ea = t('ExternalLink', [
  ['path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', key: 'a6xqqp' }],
  ['polyline', { points: '15 3 21 3 21 9', key: 'mznyad' }],
  ['line', { x1: '10', x2: '21', y1: '14', y2: '3', key: '18c3s4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ha = t('EyeOff', [
  ['path', { d: 'M9.88 9.88a3 3 0 1 0 4.24 4.24', key: '1jxqfv' }],
  [
    'path',
    {
      d: 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68',
      key: '9wicm4'
    }
  ],
  [
    'path',
    { d: 'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61', key: '1jreej' }
  ],
  ['line', { x1: '2', x2: '22', y1: '2', y2: '22', key: 'a6p6uj' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ta = t('Eye', [
  ['path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', key: 'rwhkz3' }],
  ['circle', { cx: '12', cy: '12', r: '3', key: '1v7zrd' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const qa = t('FileBarChart', [
  [
    'path',
    { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', key: '1nnpy2' }
  ],
  ['polyline', { points: '14 2 14 8 20 8', key: '1ew0cm' }],
  ['path', { d: 'M12 18v-4', key: 'q1q25u' }],
  ['path', { d: 'M8 18v-2', key: 'qcmpov' }],
  ['path', { d: 'M16 18v-6', key: '15y0np' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Aa = t('FileCheck2', [
  ['path', { d: 'M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4', key: '702lig' }],
  ['polyline', { points: '14 2 14 8 20 8', key: '1ew0cm' }],
  ['path', { d: 'm3 15 2 2 4-4', key: '1lhrkk' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ja = t('FileDown', [
  [
    'path',
    { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', key: '1nnpy2' }
  ],
  ['polyline', { points: '14 2 14 8 20 8', key: '1ew0cm' }],
  ['path', { d: 'M12 18v-6', key: '17g6i2' }],
  ['path', { d: 'm9 15 3 3 3-3', key: '1npd3o' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Va = t('FileSearch', [
  ['path', { d: 'M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v3', key: 'am10z3' }],
  ['polyline', { points: '14 2 14 8 20 8', key: '1ew0cm' }],
  ['path', { d: 'M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', key: 'ychnub' }],
  ['path', { d: 'm9 18-1.5-1.5', key: '1j6qii' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ra = t('FileSpreadsheet', [
  [
    'path',
    { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', key: '1nnpy2' }
  ],
  ['polyline', { points: '14 2 14 8 20 8', key: '1ew0cm' }],
  ['path', { d: 'M8 13h2', key: 'yr2amv' }],
  ['path', { d: 'M8 17h2', key: '2yhykz' }],
  ['path', { d: 'M14 13h2', key: 'un5t4a' }],
  ['path', { d: 'M14 17h2', key: '10kma7' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ba = t('FileText', [
  [
    'path',
    { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', key: '1nnpy2' }
  ],
  ['polyline', { points: '14 2 14 8 20 8', key: '1ew0cm' }],
  ['line', { x1: '16', x2: '8', y1: '13', y2: '13', key: '14keom' }],
  ['line', { x1: '16', x2: '8', y1: '17', y2: '17', key: '17nazh' }],
  ['line', { x1: '10', x2: '8', y1: '9', y2: '9', key: '1a5vjj' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Da = t('FileType', [
  [
    'path',
    { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', key: '1nnpy2' }
  ],
  ['polyline', { points: '14 2 14 8 20 8', key: '1ew0cm' }],
  ['path', { d: 'M9 13v-1h6v1', key: '1bb014' }],
  ['path', { d: 'M11 18h2', key: '12mj7e' }],
  ['path', { d: 'M12 12v6', key: '3ahymv' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Na = t('FileWarning', [
  [
    'path',
    { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', key: '1nnpy2' }
  ],
  ['path', { d: 'M12 9v4', key: 'juzpu7' }],
  ['path', { d: 'M12 17h.01', key: 'p32p05' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Pa = t('Filter', [
  ['polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3', key: '1yg77f' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ia = t('Flag', [
  ['path', { d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z', key: 'i9b6wo' }],
  ['line', { x1: '4', x2: '4', y1: '22', y2: '15', key: '1cm3nv' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _a = t('FlaskConical', [
  [
    'path',
    {
      d: 'M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2',
      key: 'pzvekw'
    }
  ],
  ['path', { d: 'M8.5 2h7', key: 'csnxdl' }],
  ['path', { d: 'M7 16h10', key: 'wp8him' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Oa = t('FolderOpen', [
  [
    'path',
    {
      d: 'm6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2',
      key: 'usdka0'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Fa = t('Gauge', [
  ['path', { d: 'm12 14 4-4', key: '9kzdfg' }],
  ['path', { d: 'M3.34 19a10 10 0 1 1 17.32 0', key: '19p75a' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ua = t('GitBranch', [
  ['line', { x1: '6', x2: '6', y1: '3', y2: '15', key: '17qcm7' }],
  ['circle', { cx: '18', cy: '6', r: '3', key: '1h7g24' }],
  ['circle', { cx: '6', cy: '18', r: '3', key: 'fqmcym' }],
  ['path', { d: 'M18 9a9 9 0 0 1-9 9', key: 'n2h4wq' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Za = t('Globe2', [
  ['path', { d: 'M21.54 15H17a2 2 0 0 0-2 2v4.54', key: '1djwo0' }],
  [
    'path',
    {
      d: 'M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17',
      key: '1fi5u6'
    }
  ],
  [
    'path',
    { d: 'M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05', key: 'xsiumc' }
  ],
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $a = t('Globe', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20', key: '13o1zl' }],
  ['path', { d: 'M2 12h20', key: '9i4pu4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ya = t('Grid3x3', [
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', key: 'afitv7' }],
  ['path', { d: 'M3 9h18', key: '1pudct' }],
  ['path', { d: 'M3 15h18', key: '5xshup' }],
  ['path', { d: 'M9 3v18', key: 'fh3hqa' }],
  ['path', { d: 'M15 3v18', key: '14nvp0' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Wa = t('Hand', [
  ['path', { d: 'M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0', key: 'aigmz7' }],
  ['path', { d: 'M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2', key: '1n6bmn' }],
  ['path', { d: 'M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8', key: 'a9iiix' }],
  [
    'path',
    {
      d: 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
      key: '1s1gnw'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Xa = t('Hash', [
  ['line', { x1: '4', x2: '20', y1: '9', y2: '9', key: '4lhtct' }],
  ['line', { x1: '4', x2: '20', y1: '15', y2: '15', key: 'vyu0kd' }],
  ['line', { x1: '10', x2: '8', y1: '3', y2: '21', key: '1ggp8o' }],
  ['line', { x1: '16', x2: '14', y1: '3', y2: '21', key: 'weycgp' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ga = t('History', [
  ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', key: '1357e3' }],
  ['path', { d: 'M3 3v5h5', key: '1xhq8a' }],
  ['path', { d: 'M12 7v5l4 2', key: '1fdv2h' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ka = t('Home', [
  ['path', { d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', key: 'y5dka4' }],
  ['polyline', { points: '9 22 9 12 15 12 15 22', key: 'e2us08' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Qa = t('Hourglass', [
  ['path', { d: 'M5 22h14', key: 'ehvnwv' }],
  ['path', { d: 'M5 2h14', key: 'pdyrp9' }],
  [
    'path',
    {
      d: 'M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22',
      key: '1d314k'
    }
  ],
  [
    'path',
    { d: 'M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2', key: '1vvvr6' }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ja = t('ImageOff', [
  ['line', { x1: '2', x2: '22', y1: '2', y2: '22', key: 'a6p6uj' }],
  ['path', { d: 'M10.41 10.41a2 2 0 1 1-2.83-2.83', key: '1bzlo9' }],
  ['line', { x1: '13.5', x2: '6', y1: '13.5', y2: '21', key: '1q0aeu' }],
  ['line', { x1: '18', x2: '21', y1: '12', y2: '15', key: '5mozeu' }],
  [
    'path',
    {
      d: 'M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59',
      key: 'mmje98'
    }
  ],
  ['path', { d: 'M21 15V5a2 2 0 0 0-2-2H9', key: '43el77' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const t1 = t('ImagePlus', [
  ['path', { d: 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7', key: '31hg93' }],
  ['line', { x1: '16', x2: '22', y1: '5', y2: '5', key: 'ez7e4s' }],
  ['line', { x1: '19', x2: '19', y1: '2', y2: '8', key: '1gkr8c' }],
  ['circle', { cx: '9', cy: '9', r: '2', key: 'af1f0g' }],
  ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21', key: '1xmnt7' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const e1 = t('Inbox', [
  ['polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12', key: 'o97t9d' }],
  [
    'path',
    {
      d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
      key: 'oot6mr'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const a1 = t('Info', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'M12 16v-4', key: '1dtifu' }],
  ['path', { d: 'M12 8h.01', key: 'e9boi3' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const s1 = t('KeyRound', [
  ['path', { d: 'M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z', key: '167ctg' }],
  ['circle', { cx: '16.5', cy: '7.5', r: '.5', key: '1kog09' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const n1 = t('Key', [
  ['circle', { cx: '7.5', cy: '15.5', r: '5.5', key: 'yqb3hr' }],
  ['path', { d: 'm21 2-9.6 9.6', key: '1j0ho8' }],
  ['path', { d: 'm15.5 7.5 3 3L22 7l-3-3', key: '1rn1fs' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const o1 = t('Layers', [
  [
    'path',
    {
      d: 'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z',
      key: '8b97xw'
    }
  ],
  ['path', { d: 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', key: 'dd6zsq' }],
  ['path', { d: 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65', key: 'ep9fru' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const r1 = t('LayoutDashboard', [
  ['rect', { width: '7', height: '9', x: '3', y: '3', rx: '1', key: '10lvy0' }],
  ['rect', { width: '7', height: '5', x: '14', y: '3', rx: '1', key: '16une8' }],
  ['rect', { width: '7', height: '9', x: '14', y: '12', rx: '1', key: '1hutg5' }],
  ['rect', { width: '7', height: '5', x: '3', y: '16', rx: '1', key: 'ldoo1y' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const i1 = t('LayoutGrid', [
  ['rect', { width: '7', height: '7', x: '3', y: '3', rx: '1', key: '1g98yp' }],
  ['rect', { width: '7', height: '7', x: '14', y: '3', rx: '1', key: '6d4xhi' }],
  ['rect', { width: '7', height: '7', x: '14', y: '14', rx: '1', key: 'nxv5o0' }],
  ['rect', { width: '7', height: '7', x: '3', y: '14', rx: '1', key: '1bb6yr' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const l1 = t('Layout', [
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2', key: '1m3agn' }],
  ['line', { x1: '3', x2: '21', y1: '9', y2: '9', key: '1vqk6q' }],
  ['line', { x1: '9', x2: '9', y1: '21', y2: '9', key: 'wpwpyp' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const c1 = t('LifeBuoy', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'm4.93 4.93 4.24 4.24', key: '1ymg45' }],
  ['path', { d: 'm14.83 9.17 4.24-4.24', key: '1cb5xl' }],
  ['path', { d: 'm14.83 14.83 4.24 4.24', key: 'q42g0n' }],
  ['path', { d: 'm9.17 14.83-4.24 4.24', key: 'bqpfvv' }],
  ['circle', { cx: '12', cy: '12', r: '4', key: '4exip2' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const d1 = t('Link2', [
  ['path', { d: 'M9 17H7A5 5 0 0 1 7 7h2', key: '8i5ue5' }],
  ['path', { d: 'M15 7h2a5 5 0 1 1 0 10h-2', key: '1b9ql8' }],
  ['line', { x1: '8', x2: '16', y1: '12', y2: '12', key: '1jonct' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const y1 = t('ListChecks', [
  ['path', { d: 'm3 17 2 2 4-4', key: '1jhpwq' }],
  ['path', { d: 'm3 7 2 2 4-4', key: '1obspn' }],
  ['path', { d: 'M13 6h8', key: '15sg57' }],
  ['path', { d: 'M13 12h8', key: 'h98zly' }],
  ['path', { d: 'M13 18h8', key: 'oe0vm4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const h1 = t('List', [
  ['line', { x1: '8', x2: '21', y1: '6', y2: '6', key: '7ey8pc' }],
  ['line', { x1: '8', x2: '21', y1: '12', y2: '12', key: 'rjfblc' }],
  ['line', { x1: '8', x2: '21', y1: '18', y2: '18', key: 'c3b1m8' }],
  ['line', { x1: '3', x2: '3.01', y1: '6', y2: '6', key: '1g7gq3' }],
  ['line', { x1: '3', x2: '3.01', y1: '12', y2: '12', key: '1pjlvk' }],
  ['line', { x1: '3', x2: '3.01', y1: '18', y2: '18', key: '28t2mc' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const p1 = t('Loader2', [['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56', key: '13zald' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const u1 = t('LockKeyhole', [
  ['circle', { cx: '12', cy: '16', r: '1', key: '1au0dj' }],
  ['rect', { x: '3', y: '10', width: '18', height: '12', rx: '2', key: '6s8ecr' }],
  ['path', { d: 'M7 10V7a5 5 0 0 1 10 0v3', key: '1pqi11' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const k1 = t('Lock', [
  ['rect', { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2', key: '1w4ew1' }],
  ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4', key: 'fwvmzm' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const m1 = t('LogIn', [
  ['path', { d: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4', key: 'u53s6r' }],
  ['polyline', { points: '10 17 15 12 10 7', key: '1ail0h' }],
  ['line', { x1: '15', x2: '3', y1: '12', y2: '12', key: 'v6grx8' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const f1 = t('LogOut', [
  ['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', key: '1uf3rs' }],
  ['polyline', { points: '16 17 21 12 16 7', key: '1gabdz' }],
  ['line', { x1: '21', x2: '9', y1: '12', y2: '12', key: '1uyos4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const g1 = t('MailCheck', [
  ['path', { d: 'M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8', key: '12jkf8' }],
  ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7', key: '1ocrg3' }],
  ['path', { d: 'm16 19 2 2 4-4', key: '1b14m6' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const v1 = t('MailOpen', [
  [
    'path',
    {
      d: 'M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z',
      key: '1jhwl8'
    }
  ],
  ['path', { d: 'm22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10', key: '1qfld7' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const x1 = t('Mail', [
  ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2', key: '18n3k1' }],
  ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7', key: '1ocrg3' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const b1 = t('MapPin', [
  ['path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z', key: '2oe9fu' }],
  ['circle', { cx: '12', cy: '10', r: '3', key: 'ilqhr7' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const M1 = t('MapPinned', [
  ['path', { d: 'M18 8c0 4.5-6 9-6 9s-6-4.5-6-9a6 6 0 0 1 12 0', key: 'yrbn30' }],
  ['circle', { cx: '12', cy: '8', r: '2', key: '1822b1' }],
  [
    'path',
    {
      d: 'M8.835 14H5a1 1 0 0 0-.9.7l-2 6c-.1.1-.1.2-.1.3 0 .6.4 1 1 1h18c.6 0 1-.4 1-1 0-.1 0-.2-.1-.3l-2-6a1 1 0 0 0-.9-.7h-3.835',
      key: '112zkj'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const w1 = t('Maximize2', [
  ['polyline', { points: '15 3 21 3 21 9', key: 'mznyad' }],
  ['polyline', { points: '9 21 3 21 3 15', key: '1avn1i' }],
  ['line', { x1: '21', x2: '14', y1: '3', y2: '10', key: 'ota7mn' }],
  ['line', { x1: '3', x2: '10', y1: '21', y2: '14', key: '1atl0r' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const C1 = t('Menu', [
  ['line', { x1: '4', x2: '20', y1: '12', y2: '12', key: '1e0a9i' }],
  ['line', { x1: '4', x2: '20', y1: '6', y2: '6', key: '1owob3' }],
  ['line', { x1: '4', x2: '20', y1: '18', y2: '18', key: 'yk5zj1' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const S1 = t('MessageCircle', [
  ['path', { d: 'm3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z', key: 'v2veuj' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const L1 = t('MessageSquare', [
  ['path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', key: '1lielz' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const z1 = t('Minus', [['path', { d: 'M5 12h14', key: '1ays0h' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const E1 = t('Monitor', [
  ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2', key: '48i651' }],
  ['line', { x1: '8', x2: '16', y1: '21', y2: '21', key: '1svkeh' }],
  ['line', { x1: '12', x2: '12', y1: '17', y2: '21', key: 'vw1qmm' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const H1 = t('Moon', [['path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z', key: 'a7tn18' }]]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const T1 = t('MoveRight', [
  ['path', { d: 'M18 8L22 12L18 16', key: '1r0oui' }],
  ['path', { d: 'M2 12H22', key: '1m8cig' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const q1 = t('PackageCheck', [
  ['path', { d: 'm16 16 2 2 4-4', key: 'gfu2re' }],
  [
    'path',
    {
      d: 'M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14',
      key: 'e7tb2h'
    }
  ],
  ['path', { d: 'm7.5 4.27 9 5.15', key: '1c824w' }],
  ['polyline', { points: '3.29 7 12 12 20.71 7', key: 'ousv84' }],
  ['line', { x1: '12', x2: '12', y1: '22', y2: '12', key: 'a4e8g8' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const A1 = t('PackagePlus', [
  ['path', { d: 'M16 16h6', key: '100bgy' }],
  ['path', { d: 'M19 13v6', key: '85cyf1' }],
  [
    'path',
    {
      d: 'M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14',
      key: 'e7tb2h'
    }
  ],
  ['path', { d: 'm7.5 4.27 9 5.15', key: '1c824w' }],
  ['polyline', { points: '3.29 7 12 12 20.71 7', key: 'ousv84' }],
  ['line', { x1: '12', x2: '12', y1: '22', y2: '12', key: 'a4e8g8' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const j1 = t('PackageSearch', [
  [
    'path',
    {
      d: 'M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14',
      key: 'e7tb2h'
    }
  ],
  ['path', { d: 'm7.5 4.27 9 5.15', key: '1c824w' }],
  ['polyline', { points: '3.29 7 12 12 20.71 7', key: 'ousv84' }],
  ['line', { x1: '12', x2: '12', y1: '22', y2: '12', key: 'a4e8g8' }],
  ['circle', { cx: '18.5', cy: '15.5', r: '2.5', key: 'b5zd12' }],
  ['path', { d: 'M20.27 17.27 22 19', key: '1l4muz' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const V1 = t('Package', [
  ['path', { d: 'm7.5 4.27 9 5.15', key: '1c824w' }],
  [
    'path',
    {
      d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
      key: 'hh9hay'
    }
  ],
  ['path', { d: 'm3.3 7 8.7 5 8.7-5', key: 'g66t2b' }],
  ['path', { d: 'M12 22V12', key: 'd0xqtd' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const R1 = t('Paperclip', [
  [
    'path',
    {
      d: 'm21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48',
      key: '1u3ebp'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const B1 = t('PenLine', [
  ['path', { d: 'M12 20h9', key: 't2du7b' }],
  ['path', { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z', key: 'ymcmye' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const D1 = t('PenSquare', [
  ['path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', key: '1qinfi' }],
  ['path', { d: 'M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z', key: 'w2jsv5' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const N1 = t('PencilLine', [
  ['path', { d: 'M12 20h9', key: 't2du7b' }],
  ['path', { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z', key: 'ymcmye' }],
  ['path', { d: 'm15 5 3 3', key: '1w25hb' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const P1 = t('Pencil', [
  ['path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z', key: '5qss01' }],
  ['path', { d: 'm15 5 4 4', key: '1mk7zo' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const I1 = t('Phone', [
  [
    'path',
    {
      d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
      key: 'foiqr5'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _1 = t('PlayCircle', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['polygon', { points: '10 8 16 12 10 16 10 8', key: '1cimsy' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const O1 = t('Plus', [
  ['path', { d: 'M5 12h14', key: '1ays0h' }],
  ['path', { d: 'M12 5v14', key: 's699le' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const F1 = t('PowerOff', [
  ['path', { d: 'M18.36 6.64A9 9 0 0 1 20.77 15', key: 'dxknvb' }],
  ['path', { d: 'M6.16 6.16a9 9 0 1 0 12.68 12.68', key: '1x7qb5' }],
  ['path', { d: 'M12 2v4', key: '3427ic' }],
  ['path', { d: 'm2 2 20 20', key: '1ooewy' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const U1 = t('Power', [
  ['path', { d: 'M12 2v10', key: 'mnfbl' }],
  ['path', { d: 'M18.4 6.6a9 9 0 1 1-12.77.04', key: 'obofu9' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Z1 = t('Printer', [
  ['polyline', { points: '6 9 6 2 18 2 18 9', key: '1306q4' }],
  [
    'path',
    {
      d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2',
      key: '143wyd'
    }
  ],
  ['rect', { width: '12', height: '8', x: '6', y: '14', key: '5ipwut' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $1 = t('QrCode', [
  ['rect', { width: '5', height: '5', x: '3', y: '3', rx: '1', key: '1tu5fj' }],
  ['rect', { width: '5', height: '5', x: '16', y: '3', rx: '1', key: '1v8r4q' }],
  ['rect', { width: '5', height: '5', x: '3', y: '16', rx: '1', key: '1x03jg' }],
  ['path', { d: 'M21 16h-3a2 2 0 0 0-2 2v3', key: '177gqh' }],
  ['path', { d: 'M21 21v.01', key: 'ents32' }],
  ['path', { d: 'M12 7v3a2 2 0 0 1-2 2H7', key: '8crl2c' }],
  ['path', { d: 'M3 12h.01', key: 'nlz23k' }],
  ['path', { d: 'M12 3h.01', key: 'n36tog' }],
  ['path', { d: 'M12 16v.01', key: '133mhm' }],
  ['path', { d: 'M16 12h1', key: '1slzba' }],
  ['path', { d: 'M21 12v.01', key: '1lwtk9' }],
  ['path', { d: 'M12 21v-1', key: '1880an' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Y1 = t('Radio', [
  ['path', { d: 'M4.9 19.1C1 15.2 1 8.8 4.9 4.9', key: '1vaf9d' }],
  ['path', { d: 'M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5', key: 'u1ii0m' }],
  ['circle', { cx: '12', cy: '12', r: '2', key: '1c9p78' }],
  ['path', { d: 'M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5', key: '1j5fej' }],
  ['path', { d: 'M19.1 4.9C23 8.8 23 15.1 19.1 19', key: '10b0cb' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const W1 = t('RefreshCcw', [
  ['path', { d: 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', key: '14sxne' }],
  ['path', { d: 'M3 3v5h5', key: '1xhq8a' }],
  ['path', { d: 'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16', key: '1hlbsb' }],
  ['path', { d: 'M16 16h5v5', key: 'ccwih5' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const X1 = t('RefreshCw', [
  ['path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', key: 'v9h5vc' }],
  ['path', { d: 'M21 3v5h-5', key: '1q7to0' }],
  ['path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', key: '3uifl3' }],
  ['path', { d: 'M8 16H3v5', key: '1cv678' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const G1 = t('Rocket', [
  [
    'path',
    {
      d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
      key: 'm3kijz'
    }
  ],
  [
    'path',
    {
      d: 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
      key: '1fmvmk'
    }
  ],
  ['path', { d: 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0', key: '1f8sc4' }],
  ['path', { d: 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5', key: 'qeys4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const K1 = t('RotateCcw', [
  ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', key: '1357e3' }],
  ['path', { d: 'M3 3v5h5', key: '1xhq8a' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Q1 = t('Ruler', [
  [
    'path',
    {
      d: 'M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z',
      key: 'icamh8'
    }
  ],
  ['path', { d: 'm14.5 12.5 2-2', key: 'inckbg' }],
  ['path', { d: 'm11.5 9.5 2-2', key: 'fmmyf7' }],
  ['path', { d: 'm8.5 6.5 2-2', key: 'vc6u1g' }],
  ['path', { d: 'm17.5 15.5 2-2', key: 'wo5hmg' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const J1 = t('Save', [
  ['path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', key: '1owoqh' }],
  ['polyline', { points: '17 21 17 13 7 13 7 21', key: '1md35c' }],
  ['polyline', { points: '7 3 7 8 15 8', key: '8nz8an' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ts = t('Scale', [
  ['path', { d: 'm16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', key: '7g6ntu' }],
  ['path', { d: 'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', key: 'ijws7r' }],
  ['path', { d: 'M7 21h10', key: '1b0cd5' }],
  ['path', { d: 'M12 3v18', key: '108xh3' }],
  ['path', { d: 'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2', key: '3gwbw2' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const es = t('ScanLine', [
  ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2', key: 'aa7l1z' }],
  ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2', key: '4qcy5o' }],
  ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2', key: '6vwrx8' }],
  ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2', key: 'ioqczr' }],
  ['path', { d: 'M7 12h10', key: 'b7w52i' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const as = t('Scan', [
  ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2', key: 'aa7l1z' }],
  ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2', key: '4qcy5o' }],
  ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2', key: '6vwrx8' }],
  ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2', key: 'ioqczr' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ss = t('Scissors', [
  ['circle', { cx: '6', cy: '6', r: '3', key: '1lh9wr' }],
  ['path', { d: 'M8.12 8.12 12 12', key: '1alkpv' }],
  ['path', { d: 'M20 4 8.12 15.88', key: 'xgtan2' }],
  ['circle', { cx: '6', cy: '18', r: '3', key: 'fqmcym' }],
  ['path', { d: 'M14.8 14.8 20 20', key: 'ptml3r' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ns = t('ScrollText', [
  [
    'path',
    { d: 'M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4', key: '13a6an' }
  ],
  ['path', { d: 'M19 17V5a2 2 0 0 0-2-2H4', key: 'zz82l3' }],
  ['path', { d: 'M15 8h-5', key: '1khuty' }],
  ['path', { d: 'M15 12h-5', key: 'r7krc0' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const os = t('Search', [
  ['circle', { cx: '11', cy: '11', r: '8', key: '4ej97u' }],
  ['path', { d: 'm21 21-4.3-4.3', key: '1qie3q' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const rs = t('Send', [
  ['path', { d: 'm22 2-7 20-4-9-9-4Z', key: '1q3vgg' }],
  ['path', { d: 'M22 2 11 13', key: 'nzbqef' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const is = t('Settings2', [
  ['path', { d: 'M20 7h-9', key: '3s1dr2' }],
  ['path', { d: 'M14 17H5', key: 'gfn3mx' }],
  ['circle', { cx: '17', cy: '17', r: '3', key: '18b49y' }],
  ['circle', { cx: '7', cy: '7', r: '3', key: 'dfmy0x' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ls = t('Settings', [
  [
    'path',
    {
      d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
      key: '1qme2f'
    }
  ],
  ['circle', { cx: '12', cy: '12', r: '3', key: '1v7zrd' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const cs = t('Share2', [
  ['circle', { cx: '18', cy: '5', r: '3', key: 'gq8acd' }],
  ['circle', { cx: '6', cy: '12', r: '3', key: 'w7nqdw' }],
  ['circle', { cx: '18', cy: '19', r: '3', key: '1xt0gg' }],
  ['line', { x1: '8.59', x2: '15.42', y1: '13.51', y2: '17.49', key: '47mynk' }],
  ['line', { x1: '15.41', x2: '8.59', y1: '6.51', y2: '10.49', key: '1n3mei' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ds = t('ShieldAlert', [
  ['path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10', key: '1irkt0' }],
  ['path', { d: 'M12 8v4', key: '1got3b' }],
  ['path', { d: 'M12 16h.01', key: '1drbdi' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ys = t('ShieldCheck', [
  ['path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10', key: '1irkt0' }],
  ['path', { d: 'm9 12 2 2 4-4', key: 'dzmm74' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const hs = t('ShieldX', [
  ['path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10', key: '1irkt0' }],
  ['path', { d: 'm14.5 9-5 5', key: '1m49dw' }],
  ['path', { d: 'm9.5 9 5 5', key: 'wyx7zg' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ps = t('Shield', [
  ['path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10', key: '1irkt0' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const us = t('Ship', [
  [
    'path',
    {
      d: 'M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      key: 'iegodh'
    }
  ],
  [
    'path',
    { d: 'M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76', key: 'fp8vka' }
  ],
  ['path', { d: 'M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6', key: 'qpkstq' }],
  ['path', { d: 'M12 10v4', key: '1kjpxc' }],
  ['path', { d: 'M12 2v3', key: 'qbqxhf' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ks = t('Siren', [
  ['path', { d: 'M7 12a5 5 0 0 1 5-5v0a5 5 0 0 1 5 5v6H7v-6Z', key: 'rmc51c' }],
  ['path', { d: 'M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2H5v-2Z', key: 'yyvmjy' }],
  ['path', { d: 'M21 12h1', key: 'jtio3y' }],
  ['path', { d: 'M18.5 4.5 18 5', key: 'g5sp9y' }],
  ['path', { d: 'M2 12h1', key: '1uaihz' }],
  ['path', { d: 'M12 2v1', key: '11qlp1' }],
  ['path', { d: 'm4.929 4.929.707.707', key: '1i51kw' }],
  ['path', { d: 'M12 12v6', key: '3ahymv' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ms = t('SkipForward', [
  ['polygon', { points: '5 4 15 12 5 20 5 4', key: '16p6eg' }],
  ['line', { x1: '19', x2: '19', y1: '5', y2: '19', key: 'futhcm' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const fs = t('SlidersHorizontal', [
  ['line', { x1: '21', x2: '14', y1: '4', y2: '4', key: 'obuewd' }],
  ['line', { x1: '10', x2: '3', y1: '4', y2: '4', key: '1q6298' }],
  ['line', { x1: '21', x2: '12', y1: '12', y2: '12', key: '1iu8h1' }],
  ['line', { x1: '8', x2: '3', y1: '12', y2: '12', key: 'ntss68' }],
  ['line', { x1: '21', x2: '16', y1: '20', y2: '20', key: '14d8ph' }],
  ['line', { x1: '12', x2: '3', y1: '20', y2: '20', key: 'm0wm8r' }],
  ['line', { x1: '14', x2: '14', y1: '2', y2: '6', key: '14e1ph' }],
  ['line', { x1: '8', x2: '8', y1: '10', y2: '14', key: '1i6ji0' }],
  ['line', { x1: '16', x2: '16', y1: '18', y2: '22', key: '1lctlv' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const gs = t('Smartphone', [
  ['rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2', key: '1yt0o3' }],
  ['path', { d: 'M12 18h.01', key: 'mhygvu' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const vs = t('Sparkles', [
  [
    'path',
    {
      d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z',
      key: '17u4zn'
    }
  ],
  ['path', { d: 'M5 3v4', key: 'bklmnn' }],
  ['path', { d: 'M19 17v4', key: 'iiml17' }],
  ['path', { d: 'M3 5h4', key: 'nem4j1' }],
  ['path', { d: 'M17 19h4', key: 'lbex7p' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const xs = t('Square', [
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', key: 'afitv7' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const bs = t('Stamp', [
  ['path', { d: 'M5 22h14', key: 'ehvnwv' }],
  [
    'path',
    {
      d: 'M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z',
      key: '1sy9ra'
    }
  ],
  [
    'path',
    { d: 'M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-3-3c-1.66 0-3 1-3 3s1 2 1 3.5V13', key: 'cnxgux' }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ms = t('StarOff', [
  ['path', { d: 'M8.34 8.34 2 9.27l5 4.87L5.82 21 12 17.77 18.18 21l-.59-3.43', key: '16m0ql' }],
  ['path', { d: 'M18.42 12.76 22 9.27l-6.91-1L12 2l-1.44 2.91', key: '1vt8nq' }],
  ['line', { x1: '2', x2: '22', y1: '2', y2: '22', key: 'a6p6uj' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ws = t('Star', [
  [
    'polygon',
    {
      points:
        '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2',
      key: '8f66p6'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Cs = t('Sun', [
  ['circle', { cx: '12', cy: '12', r: '4', key: '4exip2' }],
  ['path', { d: 'M12 2v2', key: 'tus03m' }],
  ['path', { d: 'M12 20v2', key: '1lh1kg' }],
  ['path', { d: 'm4.93 4.93 1.41 1.41', key: '149t6j' }],
  ['path', { d: 'm17.66 17.66 1.41 1.41', key: 'ptbguv' }],
  ['path', { d: 'M2 12h2', key: '1t8f8n' }],
  ['path', { d: 'M20 12h2', key: '1q8mjw' }],
  ['path', { d: 'm6.34 17.66-1.41 1.41', key: '1m8zz5' }],
  ['path', { d: 'm19.07 4.93-1.41 1.41', key: '1shlcs' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ss = t('Tag', [
  [
    'path',
    {
      d: 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z',
      key: '14b2ls'
    }
  ],
  ['path', { d: 'M7 7h.01', key: '7u93v4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ls = t('Tags', [
  [
    'path',
    {
      d: 'M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z',
      key: 'gt587u'
    }
  ],
  ['path', { d: 'M6 9.01V9', key: '1flxpt' }],
  ['path', { d: 'm15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19', key: '1cbfv1' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const zs = t('Target', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['circle', { cx: '12', cy: '12', r: '6', key: '1vlfrh' }],
  ['circle', { cx: '12', cy: '12', r: '2', key: '1c9p78' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Es = t('Terminal', [
  ['polyline', { points: '4 17 10 11 4 5', key: 'akl6gq' }],
  ['line', { x1: '12', x2: '20', y1: '19', y2: '19', key: 'q2wloq' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Hs = t('ThumbsUp', [
  ['path', { d: 'M7 10v12', key: '1qc93n' }],
  [
    'path',
    {
      d: 'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z',
      key: 'y3tblf'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ts = t('Ticket', [
  [
    'path',
    {
      d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
      key: 'qn84l0'
    }
  ],
  ['path', { d: 'M13 5v2', key: 'dyzc3o' }],
  ['path', { d: 'M13 17v2', key: '1ont0d' }],
  ['path', { d: 'M13 11v2', key: '1wjjxi' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const qs = t('Timer', [
  ['line', { x1: '10', x2: '14', y1: '2', y2: '2', key: '14vaq8' }],
  ['line', { x1: '12', x2: '15', y1: '14', y2: '11', key: '17fdiu' }],
  ['circle', { cx: '12', cy: '14', r: '8', key: '1e1u0o' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const As = t('Trash2', [
  ['path', { d: 'M3 6h18', key: 'd0wm0j' }],
  ['path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', key: '4alrt4' }],
  ['path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2', key: 'v07s0e' }],
  ['line', { x1: '10', x2: '10', y1: '11', y2: '17', key: '1uufr5' }],
  ['line', { x1: '14', x2: '14', y1: '11', y2: '17', key: 'xtxkd' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const js = t('TrendingUp', [
  ['polyline', { points: '22 7 13.5 15.5 8.5 10.5 2 17', key: '126l90' }],
  ['polyline', { points: '16 7 22 7 22 13', key: 'kwv8wd' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Vs = t('Truck', [
  ['path', { d: 'M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11', key: 'hs4xqm' }],
  ['path', { d: 'M14 9h4l4 4v4c0 .6-.4 1-1 1h-2', key: '11fp61' }],
  ['circle', { cx: '7', cy: '18', r: '2', key: '19iecd' }],
  ['path', { d: 'M15 18H9', key: '1lyqi6' }],
  ['circle', { cx: '17', cy: '18', r: '2', key: '332jqn' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Rs = t('Undo2', [
  ['path', { d: 'M9 14 4 9l5-5', key: '102s5s' }],
  ['path', { d: 'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11', key: 'llx8ln' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Bs = t('Unlock', [
  ['rect', { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2', key: '1w4ew1' }],
  ['path', { d: 'M7 11V7a5 5 0 0 1 9.9-1', key: '1mm8w8' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ds = t('UploadCloud', [
  ['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242', key: '1pljnt' }],
  ['path', { d: 'M12 12v9', key: '192myk' }],
  ['path', { d: 'm16 16-4-4-4 4', key: '119tzi' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ns = t('Upload', [
  ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', key: 'ih7n3h' }],
  ['polyline', { points: '17 8 12 3 7 8', key: 't8dd8p' }],
  ['line', { x1: '12', x2: '12', y1: '3', y2: '15', key: 'widbto' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ps = t('UserCheck', [
  ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', key: '1yyitq' }],
  ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
  ['polyline', { points: '16 11 18 13 22 9', key: '1pwet4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Is = t('UserPlus', [
  ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', key: '1yyitq' }],
  ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
  ['line', { x1: '19', x2: '19', y1: '8', y2: '14', key: '1bvyxn' }],
  ['line', { x1: '22', x2: '16', y1: '11', y2: '11', key: '1shjgl' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _s = t('User', [
  ['path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', key: '975kel' }],
  ['circle', { cx: '12', cy: '7', r: '4', key: '17ys0d' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Os = t('UsersRound', [
  ['path', { d: 'M18 21a8 8 0 0 0-16 0', key: '3ypg7q' }],
  ['circle', { cx: '10', cy: '8', r: '5', key: 'o932ke' }],
  ['path', { d: 'M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3', key: '10s06x' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Fs = t('Users', [
  ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', key: '1yyitq' }],
  ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
  ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87', key: 'kshegd' }],
  ['path', { d: 'M16 3.13a4 4 0 0 1 0 7.75', key: '1da9ce' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Us = t('Warehouse', [
  [
    'path',
    {
      d: 'M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z',
      key: 'gksnxg'
    }
  ],
  ['path', { d: 'M6 18h12', key: '9pbo8z' }],
  ['path', { d: 'M6 14h12', key: '4cwo0f' }],
  ['rect', { width: '12', height: '12', x: '6', y: '10', key: 'apd30q' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Zs = t('WifiOff', [
  ['line', { x1: '2', x2: '22', y1: '2', y2: '22', key: 'a6p6uj' }],
  ['path', { d: 'M8.5 16.5a5 5 0 0 1 7 0', key: 'sej527' }],
  ['path', { d: 'M2 8.82a15 15 0 0 1 4.17-2.65', key: '11utq1' }],
  ['path', { d: 'M10.66 5c4.01-.36 8.14.9 11.34 3.76', key: 'hxefdu' }],
  ['path', { d: 'M16.85 11.25a10 10 0 0 1 2.22 1.68', key: 'q734kn' }],
  ['path', { d: 'M5 13a10 10 0 0 1 5.24-2.76', key: 'piq4yl' }],
  ['line', { x1: '12', x2: '12.01', y1: '20', y2: '20', key: 'of4bc4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $s = t('Wifi', [
  ['path', { d: 'M5 13a10 10 0 0 1 14 0', key: '6v8j51' }],
  ['path', { d: 'M8.5 16.5a5 5 0 0 1 7 0', key: 'sej527' }],
  ['path', { d: 'M2 8.82a15 15 0 0 1 20 0', key: 'dnpr2z' }],
  ['line', { x1: '12', x2: '12.01', y1: '20', y2: '20', key: 'of4bc4' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ys = t('Workflow', [
  ['rect', { width: '8', height: '8', x: '3', y: '3', rx: '2', key: 'by2w9f' }],
  ['path', { d: 'M7 11v4a2 2 0 0 0 2 2h4', key: 'xkn7yn' }],
  ['rect', { width: '8', height: '8', x: '13', y: '13', rx: '2', key: '1cgmvn' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ws = t('Wrench', [
  [
    'path',
    {
      d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
      key: 'cbrjhi'
    }
  ]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Xs = t('XCircle', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'm15 9-6 6', key: '1uzhvr' }],
  ['path', { d: 'm9 9 6 6', key: 'z0biqf' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Gs = t('X', [
  ['path', { d: 'M18 6 6 18', key: '1bl5f8' }],
  ['path', { d: 'm6 6 12 12', key: 'd8bk6v' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ks = t('Zap', [
  ['polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2', key: '45s27k' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Qs = t('ZoomIn', [
  ['circle', { cx: '11', cy: '11', r: '8', key: '4ej97u' }],
  ['line', { x1: '21', x2: '16.65', y1: '21', y2: '16.65', key: '13gj7c' }],
  ['line', { x1: '11', x2: '11', y1: '8', y2: '14', key: '1vmskp' }],
  ['line', { x1: '8', x2: '14', y1: '11', y2: '11', key: 'durymu' }]
]);
/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Js = t('ZoomOut', [
  ['circle', { cx: '11', cy: '11', r: '8', key: '4ej97u' }],
  ['line', { x1: '21', x2: '16.65', y1: '21', y2: '16.65', key: '13gj7c' }],
  ['line', { x1: '8', x2: '14', y1: '11', y2: '11', key: 'durymu' }]
]);
export {
  Sa as $,
  Pe as A,
  Ue as B,
  aa as C,
  L1 as D,
  fa as E,
  qa as F,
  $a as G,
  Ga as H,
  Fs as I,
  ps as J,
  Ua as K,
  k1 as L,
  C1 as M,
  cs as N,
  s1 as O,
  O1 as P,
  As as Q,
  X1 as R,
  vs as S,
  js as T,
  Ns as U,
  na as V,
  Ws as W,
  Gs as X,
  He as Y,
  Ks as Z,
  rs as _,
  ys as a,
  Ja as a$,
  W1 as a0,
  La as a1,
  Re as a2,
  sa as a3,
  Ze as a4,
  za as a5,
  _s as a6,
  p1 as a7,
  Se as a8,
  Ma as a9,
  z1 as aA,
  i1 as aB,
  q1 as aC,
  B1 as aD,
  A1 as aE,
  $1 as aF,
  $e as aG,
  Q1 as aH,
  a1 as aI,
  Pa as aJ,
  ta as aK,
  Xa as aL,
  da as aM,
  ds as aN,
  Qe as aO,
  I1 as aP,
  P1 as aQ,
  Ge as aR,
  Be as aS,
  Oe as aT,
  Qa as aU,
  Hs as aV,
  Wa as aW,
  us as aX,
  Ya as aY,
  Bs as aZ,
  Ca as a_,
  Ha as aa,
  Ta as ab,
  Ve as ac,
  Aa as ad,
  hs as ae,
  c1 as af,
  ze as ag,
  Vs as ah,
  Xe as ai,
  Ne as aj,
  d1 as ak,
  M1 as al,
  Ra as am,
  J1 as an,
  Rs as ao,
  u1 as ap,
  Ds as aq,
  je as ar,
  ca as as,
  ea as at,
  Zs as au,
  Ye as av,
  $s as aw,
  ga as ax,
  K1 as ay,
  Te as az,
  fs as b,
  Ia as b$,
  la as b0,
  t1 as b1,
  ws as b2,
  Ms as b3,
  ua as b4,
  ja as b5,
  Ie as b6,
  bs as b7,
  Na as b8,
  Is as b9,
  h1 as bA,
  U1 as bB,
  F1 as bC,
  oa as bD,
  zs as bE,
  D1 as bF,
  n1 as bG,
  De as bH,
  gs as bI,
  ha as bJ,
  ns as bK,
  Fa as bL,
  _a as bM,
  m1 as bN,
  Os as bO,
  l1 as bP,
  Ka as bQ,
  Ss as bR,
  ka as bS,
  ms as bT,
  Xs as bU,
  S1 as bV,
  T1 as bW,
  G1 as bX,
  qs as bY,
  ya as bZ,
  ma as b_,
  _e as ba,
  N1 as bb,
  j1 as bc,
  Da as bd,
  y1 as be,
  _1 as bf,
  Ts as bg,
  g1 as bh,
  e1 as bi,
  Ea as bj,
  Ys as bk,
  Oa as bl,
  Ke as bm,
  xa as bn,
  x1 as bo,
  Z1 as bp,
  xs as bq,
  va as br,
  is as bs,
  Je as bt,
  v1 as bu,
  Za as bv,
  R1 as bw,
  Ps as bx,
  ba as by,
  We as bz,
  ra as c,
  Js as c0,
  Qs as c1,
  w1 as c2,
  Cs as c3,
  H1 as c4,
  wa as c5,
  ss as c6,
  Y1 as c7,
  Es as c8,
  Ee as c9,
  ia as d,
  f1 as e,
  pa as f,
  V1 as g,
  ts as h,
  qe as i,
  as as j,
  Ae as k,
  Le as l,
  b1 as m,
  o1 as n,
  ks as o,
  Va as p,
  Ba as q,
  E1 as r,
  Us as s,
  Ce as t,
  Fe as u,
  es as v,
  Ls as w,
  os as x,
  r1 as y,
  ls as z
};
