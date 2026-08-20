import Skeleton from './Skeleton';

const ROWS = [0, 1, 2, 3, 4];

const SkeletonPreset = ({ type = 'page' }) => {
  if (type === 'table') {
    return (
      <div className="space-y-2" aria-label="Cargando tabla" aria-busy="true">
        <Skeleton className="h-10 w-full" />
        {ROWS.map((row) => (
          <Skeleton key={row} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (type === 'cards') {
    return (
      <div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Cargando indicadores"
        aria-busy="true"
      >
        {ROWS.slice(0, 4).map((row) => (
          <Skeleton key={row} className="h-28 w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-4" aria-label="Cargando pantalla" aria-busy="true">
      <Skeleton className="h-20 w-full" />
      <SkeletonPreset type="cards" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
};

export default SkeletonPreset;
