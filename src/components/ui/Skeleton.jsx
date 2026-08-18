// PR-012 · Skeleton (TXT 03 §3). Shimmer de carga reutilizable para estados
// loading de listas, cards y tablas. Usa la clase .pda-skeleton de index.css.

const Skeleton = ({ lines = 3, className = '' }) => (
  <div aria-busy="true" aria-label="Cargando" className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`pda-skeleton rounded-md ${i === 0 ? 'h-4 w-3/4' : i === lines - 1 ? 'h-4 w-1/2' : 'h-4 w-full'}`}
      />
    ))}
  </div>
);

export default Skeleton;