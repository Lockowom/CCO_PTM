// PR-014 · MobileQuickActions (TXT 04 §6). Acciones rápidas flotantes sobre la
// BottomNav (escaneo, nuevo, etc.). Targets táctiles ≥44px.

const MobileQuickActions = ({ actions = [], className = '' }) => {
  if (actions.length === 0) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-24 z-[var(--z-sticky)] flex justify-center gap-3 ${className}`}
      aria-label="Acciones rápidas"
    >
      {actions.map((a, i) => (
        <button
          key={i}
          onClick={a.onClick}
          aria-label={a.label}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-glow-accent)] active:scale-95 transition-transform"
        >
          {a.icon}
        </button>
      ))}
    </div>
  );
};

export default MobileQuickActions;