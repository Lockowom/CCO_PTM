import PropTypes from 'prop-types';

/**
 * BRANDING-001 (V1 §25)
 * Status pill opcional bajo el branding: "Operativo".
 * Punto de estado con ping sutil (desactivado con prefers-reduced-motion).
 */
export default function BrandStatusPill({ label = 'Operativo', className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-1.5 py-[2px]',
        'rounded-full',
        'bg-emerald-500/10 border border-emerald-500/25',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span
          aria-hidden
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 brand-status-ping"
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-[8px] font-black uppercase tracking-[0.12em] text-emerald-600 leading-none">
        {label}
      </span>
    </span>
  );
}

BrandStatusPill.propTypes = {
  label: PropTypes.node,
  className: PropTypes.string
};
