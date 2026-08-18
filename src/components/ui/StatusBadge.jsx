// PR-012 · StatusBadge (TXT 03 §3). Etiqueta de estado semántico reutilizable.
// Usa colores de estado por tono, no por nombre de estado (los estados se
// mapean en el SSOT de estados, no aquí).

const TONES = {
  ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  accent: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const DOTS = {
  ok: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-sky-400',
  accent: 'bg-violet-400',
  neutral: 'bg-slate-400',
};

const StatusBadge = ({
  tone = 'neutral',
  dot = true,
  label,
  className = '',
  title,
}) => (
  <span
    title={title}
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold
      ${TONES[tone] || TONES.neutral} ${className}`}
  >
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOTS[tone] || DOTS.neutral}`} />}
    {label}
  </span>
);

export default StatusBadge;