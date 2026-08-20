const Timeline = ({ items = [] }) => (
  <ol className="space-y-0" aria-label="Historial">
    {items.map((item, index) => (
      <li
        key={item.id ?? index}
        className="relative grid grid-cols-[20px_1fr] gap-3 pb-5 last:pb-0"
      >
        {index < items.length - 1 ? (
          <span className="absolute left-[9px] top-4 h-full w-px bg-slate-700" aria-hidden="true" />
        ) : null}
        <span
          className="relative mt-1 h-5 w-5 rounded-full border-4 border-slate-950 bg-orange-500"
          aria-hidden="true"
        />
        <div>
          <div className="font-medium text-slate-100">{item.title}</div>
          {item.description ? <p className="text-sm text-slate-400">{item.description}</p> : null}
          {item.time ? <time className="text-xs text-slate-500">{item.time}</time> : null}
        </div>
      </li>
    ))}
  </ol>
);

export default Timeline;
