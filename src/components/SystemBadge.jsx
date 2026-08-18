import PropTypes from 'prop-types';

/**
 * BRANDING-001 (V1 §7)
 * Badge "SYSTEM" como cápsula visual premium.
 * No es texto pegado: fondo de acento, bordes suaves, padding horizontal,
 * tracking amplio, estilo "etiqueta tech" con punto de estado.
 */
export default function SystemBadge({ children = 'SYSTEM', className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center gap-1',
        'px-1.5 py-0.5',
        'text-[0.5rem] font-black uppercase tracking-[0.1em]',
        'bg-[--brand-system-bg] text-[--brand-system-fg]',
        'rounded-full leading-none',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden className="block h-1 w-2.5 rounded bg-[--brand-system-fg] opacity-90" />
      {children}
    </span>
  );
}

SystemBadge.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
