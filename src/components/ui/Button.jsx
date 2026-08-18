// PR-012 · Botón primitivo compartido (TXT 03 §3).
// Evita repetir la misma clase en cada módulo. Variantes: primary (naranja CCO),
// secondary, ghost, danger, success. Soporta loading y disabled.

import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40 shadow-sm',
  secondary:
    'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-500/40 border border-slate-700',
  ghost: 'bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/40 shadow-sm',
  success:
    'bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500/40 shadow-sm',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon = null,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center font-semibold transition-colors duration-150
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-50
      disabled:cursor-not-allowed active:scale-[0.98]
      ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
    {...rest}
  >
    {loading ? (
      <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
    ) : (
      Icon && <Icon size={size === 'sm' ? 14 : 16} />
    )}
    {children}
  </button>
);

export default Button;