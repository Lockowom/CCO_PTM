const TONES = {
  info: 'border-blue-400/30 bg-blue-500/10 text-blue-100',
  warning: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
  danger: 'border-red-400/30 bg-red-500/10 text-red-100',
  success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
};

const SystemBanner = ({ tone = 'info', title, children, action }) => (
  <aside
    role={tone === 'danger' ? 'alert' : 'status'}
    className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${TONES[tone] || TONES.info}`}
  >
    <div>
      <strong>{title}</strong>
      {children ? <div className="mt-0.5 opacity-90">{children}</div> : null}
    </div>
    {action}
  </aside>
);

export default SystemBanner;
