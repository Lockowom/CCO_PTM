/**
 * Groups flat order rows by NV (Nota de Venta) into aggregated order objects.
 * Used by SalesOrders, Picking, and Packing modules.
 */
export function groupByNV(rows) {
  const grouped = {};
  (rows || []).forEach(item => {
    const nvId = item.nv;
    if (!grouped[nvId]) {
      grouped[nvId] = {
        ...item,
        items: [],
        total_items: 0,
        total_cantidad: 0,
      };
    }
    grouped[nvId].items.push(item);
    grouped[nvId].total_items++;
    grouped[nvId].total_cantidad += parseInt(item.cantidad) || 0;
  });
  return Object.values(grouped);
}
