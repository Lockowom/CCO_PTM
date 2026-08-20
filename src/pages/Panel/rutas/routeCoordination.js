export const SECTOR_COLORS = {
  Norte: '#2563eb',
  Centro: '#f97316',
  Nororiente: '#7c3aed',
  Suroriente: '#059669',
  Sur: '#dc2626',
  Surponiente: '#d97706',
  Norponiente: '#0891b2',
  'Fuera de Santiago': '#64748b'
};

export const SECTOR_COMMUNES = {
  Norte: ['Conchalí', 'Huechuraba', 'Independencia', 'Recoleta', 'Quilicura'],
  Centro: ['Santiago'],
  Nororiente: ['Providencia', 'Ñuñoa', 'Las Condes', 'La Reina', 'Vitacura', 'Lo Barnechea'],
  Suroriente: ['Macul', 'Peñalolén', 'La Florida', 'Puente Alto'],
  Sur: [
    'San Miguel',
    'San Joaquín',
    'Pedro Aguirre Cerda',
    'Lo Espejo',
    'La Cisterna',
    'El Bosque',
    'La Granja',
    'La Pintana',
    'San Ramón',
    'San Bernardo'
  ],
  Surponiente: ['Maipú', 'Cerrillos', 'Estación Central', 'Padre Hurtado'],
  Norponiente: ['Cerro Navia', 'Lo Prado', 'Pudahuel', 'Quinta Normal', 'Renca']
};

export const SANTIAGO_COMMUNES = Object.values(SECTOR_COMMUNES).flat();

export const COMMUNE_CENTERS = {
  Santiago: [-33.4489, -70.6693],
  Conchalí: [-33.3849, -70.6754],
  Huechuraba: [-33.3655, -70.6334],
  Independencia: [-33.4155, -70.6653],
  Recoleta: [-33.4064, -70.6392],
  Quilicura: [-33.3576, -70.7299],
  Providencia: [-33.4314, -70.6093],
  Ñuñoa: [-33.4569, -70.5976],
  'Las Condes': [-33.4088, -70.5671],
  'La Reina': [-33.4474, -70.5334],
  Vitacura: [-33.3807, -70.5726],
  'Lo Barnechea': [-33.35, -70.5167],
  Macul: [-33.4862, -70.5996],
  Peñalolén: [-33.4862, -70.5333],
  'La Florida': [-33.5227, -70.5986],
  'Puente Alto': [-33.6117, -70.5758],
  'San Miguel': [-33.4977, -70.6519],
  'San Joaquín': [-33.4961, -70.6287],
  'Pedro Aguirre Cerda': [-33.4925, -70.6764],
  'Lo Espejo': [-33.521, -70.6896],
  'La Cisterna': [-33.5348, -70.6635],
  'El Bosque': [-33.5678, -70.6756],
  'La Granja': [-33.5352, -70.6239],
  'La Pintana': [-33.5833, -70.6333],
  'San Ramón': [-33.5427, -70.6424],
  'San Bernardo': [-33.5922, -70.6996],
  Maipú: [-33.5105, -70.7573],
  Cerrillos: [-33.5023, -70.7165],
  'Estación Central': [-33.4624, -70.7024],
  'Padre Hurtado': [-33.5758, -70.8263],
  'Cerro Navia': [-33.4228, -70.7358],
  'Lo Prado': [-33.4449, -70.725],
  Pudahuel: [-33.4421, -70.7641],
  'Quinta Normal': [-33.428, -70.6996],
  Renca: [-33.4032, -70.7164]
};

export const SECTOR_POLYGONS = {
  Norte: [
    [-33.448, -70.704],
    [-33.448, -70.625],
    [-33.33, -70.615],
    [-33.33, -70.76]
  ],
  Centro: [
    [-33.43, -70.7],
    [-33.43, -70.63],
    [-33.475, -70.63],
    [-33.475, -70.7]
  ],
  Nororiente: [
    [-33.33, -70.625],
    [-33.43, -70.63],
    [-33.5, -70.49],
    [-33.3, -70.43]
  ],
  Suroriente: [
    [-33.43, -70.63],
    [-33.47, -70.63],
    [-33.66, -70.55],
    [-33.49, -70.48]
  ],
  Sur: [
    [-33.47, -70.7],
    [-33.47, -70.63],
    [-33.66, -70.55],
    [-33.68, -70.72]
  ],
  Surponiente: [
    [-33.45, -70.86],
    [-33.47, -70.7],
    [-33.68, -70.72],
    [-33.62, -70.9]
  ],
  Norponiente: [
    [-33.33, -70.76],
    [-33.43, -70.7],
    [-33.47, -70.7],
    [-33.45, -70.86]
  ]
};

const normalized = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export function sectorForCommune(comuna) {
  const target = normalized(comuna);
  for (const [sector, communes] of Object.entries(SECTOR_COMMUNES)) {
    if (communes.some((item) => normalized(item) === target)) return sector;
  }
  return 'Fuera de Santiago';
}

export function pointForStop(item) {
  const lat = Number(item?.latitud);
  const lng = Number(item?.longitud);
  if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0)
    return { lat, lng, approximate: false };
  const match = Object.entries(COMMUNE_CENTERS).find(
    ([commune]) => normalized(commune) === normalized(item?.comuna)
  );
  if (!match) return null;
  return { lat: match[1][0], lng: match[1][1], approximate: true };
}

const distanceSquared = (a, b) => (a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2;

export function optimizeStops(stops = [], origin = null) {
  const pending = stops.map((stop) => ({ stop, point: pointForStop(stop) }));
  const ordered = [];
  // Sin origen configurado no se inventa una coordenada: se usa la primera
  // parada conocida y la UI etiqueta el resultado como aproximado.
  let current = origin || pending.find((entry) => entry.point)?.point;
  if (!current) return [...stops];
  while (pending.length) {
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    pending.forEach((entry, index) => {
      const distance = entry.point
        ? distanceSquared(current, entry.point)
        : Number.MAX_SAFE_INTEGER;
      if (distance < bestDistance) {
        best = index;
        bestDistance = distance;
      }
    });
    const [next] = pending.splice(best, 1);
    ordered.push(next.stop);
    if (next.point) current = next.point;
  }
  return ordered;
}
