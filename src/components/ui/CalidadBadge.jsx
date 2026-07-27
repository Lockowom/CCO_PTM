import { FLAG_META } from '../../services/calidadService';

/**
 * Badge de estado de calidad (EN AUDITORÍA / CUARENTENA / MALO / LIBERADO).
 * Visible para todos los usuarios donde aparezca el producto.
 */
const CalidadBadge = ({ estado, size = 'sm', title }) => {
  if (!estado) return null;
  const meta = FLAG_META[estado];
  if (!meta) return null;
  const pad = size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5';
  return (
    <span
      title={title || meta.label}
      className={`shrink-0 inline-flex items-center font-black uppercase tracking-wide rounded-md border ${pad} ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
};

export default CalidadBadge;
