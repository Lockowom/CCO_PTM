// PR-012 · InlineAlert (TXT 03 §3). Aviso inline (formularios/paneles).
// Diferente del toast (resultado) y del banner global (offline/degradación).

import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

const STYLES = {
  info: { cls: 'border-sky-500/30 bg-sky-500/10 text-sky-300', Icon: Info },
  success: { cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', Icon: CheckCircle2 },
  warning: { cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300', Icon: AlertTriangle },
  error: { cls: 'border-red-500/30 bg-red-500/10 text-red-300', Icon: XCircle },
};

const InlineAlert = ({ tone = 'info', title = null, children, className = '' }) => {
  const { cls, Icon } = STYLES[tone] || STYLES.info;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-3 text-sm ${cls} ${className}`}>
      <div className="flex items-start gap-2">
        <Icon size={16} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          {title && <p className="font-bold mb-0.5">{title}</p>}
          <div className="leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default InlineAlert;