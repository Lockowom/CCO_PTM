const MobileStickyActionBar = ({ status, children }) => (
  <div className="sticky bottom-0 z-[var(--z-sticky)] border-t border-slate-800 bg-slate-950/95 px-3 pt-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))]">
    {status ? (
      <div className="mb-2 text-center text-xs text-slate-400" role="status">
        {status}
      </div>
    ) : null}
    <div className="flex min-h-12 items-center justify-end gap-2 [&_button]:min-h-12">
      {children}
    </div>
  </div>
);

export default MobileStickyActionBar;
