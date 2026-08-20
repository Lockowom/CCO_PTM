import EmptyState from './EmptyState';
import Skeleton from './Skeleton';

const DataTable = ({
  columns = [],
  rows = [],
  rowKey = 'id',
  loading = false,
  emptyTitle = 'Sin resultados',
  onRowClick
}) => {
  if (loading) return <Skeleton className="h-48 w-full" />;
  if (!rows.length) return <EmptyState title={emptyTitle} />;
  return (
    <div
      className="overflow-x-auto rounded-2xl border border-slate-800"
      role="region"
      aria-label="Tabla de datos"
      tabIndex={0}
    >
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-900/90 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-4 py-3">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row, index) => (
            <tr
              key={row[rowKey] ?? index}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(event) => event.key === 'Enter' && onRowClick?.(row)}
              className={
                onRowClick
                  ? 'cursor-pointer hover:bg-slate-800/50 focus:bg-slate-800/60 focus:outline-none'
                  : ''
              }
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-slate-200">
                  {column.render ? column.render(row[column.key], row) : (row[column.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
