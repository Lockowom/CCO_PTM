const Tooltip = ({ content, children }) => (
  <span className="group relative inline-flex">
    {children}
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-max max-w-64 -translate-x-1/2 rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 shadow-xl group-hover:block group-focus-within:block"
    >
      {content}
    </span>
  </span>
);

export default Tooltip;
