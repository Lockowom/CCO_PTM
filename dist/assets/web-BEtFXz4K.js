import { W as a } from './index-BSnpYyAh.js';
import { I as r, N as e } from './WarehousePDA-D02u4ihv.js';
import './query-vendor-BNjBrM5A.js';
import './react-vendor-6aw4XXjH.js';
import './supabase-vendor-4Fjsfb0a.js';
import './ui-vendor-CTbhg6u_.js';
import './animation-vendor-JfdD7EdN.js';
import './useBarcodeScanner-BganZ5ep.js';
import './conteoService-SIY8Tvfr.js';
import './calidadService-CtLsnG2l.js';
class f extends a {
  constructor() {
    (super(...arguments), (this.selectionStarted = !1));
  }
  async impact(t) {
    const i = this.patternForImpact(t == null ? void 0 : t.style);
    this.vibrateWithPattern(i);
  }
  async notification(t) {
    const i = this.patternForNotification(t == null ? void 0 : t.type);
    this.vibrateWithPattern(i);
  }
  async vibrate(t) {
    const i = (t == null ? void 0 : t.duration) || 300;
    this.vibrateWithPattern([i]);
  }
  async selectionStart() {
    this.selectionStarted = !0;
  }
  async selectionChanged() {
    this.selectionStarted && this.vibrateWithPattern([70]);
  }
  async selectionEnd() {
    this.selectionStarted = !1;
  }
  patternForImpact(t = r.Heavy) {
    return t === r.Medium ? [43] : t === r.Light ? [20] : [61];
  }
  patternForNotification(t = e.Success) {
    return t === e.Warning ? [30, 40, 30, 50, 60] : t === e.Error ? [27, 45, 50] : [35, 65, 21];
  }
  vibrateWithPattern(t) {
    if (navigator.vibrate) navigator.vibrate(t);
    else throw this.unavailable('Browser does not support the vibrate API');
  }
}
export { f as HapticsWeb };
