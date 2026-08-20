const IconButton = ({ label, icon: Icon, size = 44, className = '', ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${className}`}
    style={{ minWidth: size, minHeight: size }}
    {...props}
  >
    {Icon ? <Icon size={18} aria-hidden="true" /> : null}
  </button>
);

export default IconButton;
