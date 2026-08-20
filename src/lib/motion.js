/** Presets CCO 2.0. Mantienen movimiento breve y respetan reduced-motion. */
export const motion = {
  fast: { duration: 0.12, ease: 'power2.out' },
  normal: { duration: 0.18, ease: 'power3.out' },
  slow: { duration: 0.24, ease: 'power3.out' },
  pageEnter: { opacity: 1, y: 0, duration: 0.18, ease: 'power3.out' }
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const safeMotion = (preset) =>
  prefersReducedMotion() ? { ...preset, duration: 0 } : preset;
