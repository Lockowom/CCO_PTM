const ProgressBar = ({ value = 0, label = 'Progreso', showValue = true }) => {
  const safe = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        {showValue ? <span>{Math.round(safe)}%</span> : null}
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
      >
        <div
          className="h-full rounded-full bg-orange-500 transition-[width] duration-[var(--motion-normal)]"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
