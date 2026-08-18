// PR-014 · MobileAppShell (TXT 04 §2). Contenedor móvil a 100dvh con safe-area.
// Envuelve TopBar + contenido + BottomNav + QuickActions. Convive con el Layout
// actual bajo feature flag `mobile_shell_v2` (CUTOVER en RELEASE B).

const MobileAppShell = ({ topBar, children, bottomNav = null, quickActions = null }) => (
  <div
    className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--surface-base)] text-slate-100 font-sans"
    style={{
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}
  >
    {topBar}
    <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-safe">
      {children}
    </main>
    {quickActions}
    {bottomNav}
  </div>
);

export default MobileAppShell;