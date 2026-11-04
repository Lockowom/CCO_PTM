const text = (value) => String(value ?? '').trim();

export const normalizeAssignmentSearch = (value) => text(value).toLocaleLowerCase('es');

export const assignmentItems = (assignment) =>
  Array.isArray(assignment?.skus) ? assignment.skus : [];

export const assignmentReference = (assignment) =>
  `H2-${text(assignment?.id).slice(0, 8).toUpperCase()}`;

export const assignmentLocations = (assignment) => [
  ...new Set(
    assignmentItems(assignment)
      .map((item) => text(item?.ubicacion))
      .filter(Boolean)
  )
];

const assignmentSearchText = (assignment) => {
  const informe = assignment?.informe || {};
  return normalizeAssignmentSearch(
    [
      assignmentReference(assignment),
      assignment?.estado,
      assignment?.prioridad,
      assignment?.motivo,
      assignment?.asignado_nombre,
      assignment?.locked_by_name,
      assignment?.resuelto_nombre,
      informe.numero,
      informe.estado,
      informe.tipo_informe,
      informe.analista_nombre,
      ...assignmentItems(assignment).flatMap((item) => [
        item?.codigo_producto,
        item?.producto,
        item?.ubicacion,
        item?.partida
      ])
    ].join(' ')
  );
};

export const matchesAssignmentQuery = (assignment, query) => {
  const normalizedQuery = normalizeAssignmentSearch(query);
  return !normalizedQuery || assignmentSearchText(assignment).includes(normalizedQuery);
};

const STATE_PRIORITY = { EN_PROCESO: 0, PENDIENTE: 1, RESUELTA: 2, ANULADA: 3 };

export const filterAndSortAssignments = (assignments, { query = '', state = 'TODAS' } = {}) =>
  [...(Array.isArray(assignments) ? assignments : [])]
    .filter((assignment) => state === 'TODAS' || assignment.estado === state)
    .filter((assignment) => matchesAssignmentQuery(assignment, query))
    .sort(
      (a, b) =>
        (STATE_PRIORITY[a.estado] ?? 9) - (STATE_PRIORITY[b.estado] ?? 9) ||
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

export const buildProductExplorerRows = (assignments) => {
  const products = new Map();

  (Array.isArray(assignments) ? assignments : []).forEach((assignment) => {
    assignmentItems(assignment).forEach((item, itemIndex) => {
      const codigo = text(item?.codigo_producto);
      const producto = text(item?.producto);
      const key = codigo || producto || `${assignment.id || 'sin-tarea'}-${itemIndex}`;
      const current = products.get(key) || {
        key,
        codigo: codigo || 'SIN SKU',
        producto: producto || 'Sin descripción',
        tareas: [],
        estancias: new Map(),
        informes: new Map()
      };

      if (!current.tareas.some((task) => task.id === assignment.id)) {
        current.tareas.push(assignment);
      }

      const ubicacion = text(item?.ubicacion) || 'Sin ubicación';
      const partida = text(item?.partida);
      const estanciaKey = `${ubicacion}|${partida}`;
      if (!current.estancias.has(estanciaKey)) {
        current.estancias.set(estanciaKey, {
          ubicacion,
          partida: partida || null,
          cantidad: Number(item?.cantidad) || null,
          unidad_medida: text(item?.unidad_medida) || null
        });
      }

      if (assignment.informe?.id && !current.informes.has(assignment.informe.id)) {
        current.informes.set(assignment.informe.id, assignment.informe);
      }

      products.set(key, current);
    });
  });

  return [...products.values()]
    .map((product) => ({
      ...product,
      estancias: [...product.estancias.values()],
      informes: [...product.informes.values()]
    }))
    .sort(
      (a, b) =>
        b.tareas.length - a.tareas.length ||
        a.codigo.localeCompare(b.codigo, 'es', { numeric: true })
    );
};

export const matchesProductQuery = (product, query) => {
  const normalizedQuery = normalizeAssignmentSearch(query);
  if (!normalizedQuery) return true;
  return normalizeAssignmentSearch(
    [
      product.codigo,
      product.producto,
      ...product.estancias.flatMap((stay) => [stay.ubicacion, stay.partida]),
      ...product.tareas.flatMap((task) => [assignmentReference(task), task.motivo]),
      ...product.informes.flatMap((report) => [report.numero, report.estado, report.tipo_informe])
    ].join(' ')
  ).includes(normalizedQuery);
};
