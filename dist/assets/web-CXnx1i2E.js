import { W as a } from './index-CRyr4FS8.js';
import { I as r, N as e } from './WarehousePDA-Fz4WqMeI.js';
import './query-vendor-AW4268wa.js';
import './react-vendor-CczoB5o5.js';
import './supabase-vendor-4Fjsfb0a.js';
import './ui-vendor-D9BeWSwh.js';
import './animation-vendor-Bm2mNA5x.js';
import './useBarcodeScanner-kMWze_Z_.js';
import './conteoService-DPFIGW2c.js';
import './calidadService-CcdGMVTK.js';
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
