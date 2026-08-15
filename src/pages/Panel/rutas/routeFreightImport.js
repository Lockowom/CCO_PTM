const clean = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();

const aliases = {
  fecha_despacho: ['fecha despacho', 'fecha docto', 'fecha', 'fecha salida'],
  fecha_entrega: ['fecha entrega', 'fecha real entrega', 'entregado'],
  nv: ['nv', 'n v', 'n nv', 'n venta', 'nota venta', 'numero nv'],
  factura: ['factura', 'facturas', 'n factura', 'numero factura'],
  cliente: ['cliente', 'nombre cliente', 'razon social'],
  destino: ['destino', 'localidad', 'pueblo'],
  comuna: ['comuna'],
  ciudad: ['ciudad'],
  region: ['region'],
  transportista: ['transportista', 'empresa transporte', 'transporte', 'proveedor transporte'],
  tipo_transporte: ['tipo transporte', 'modalidad transporte'],
  bultos: ['bultos', 'cantidad bultos', 'n bultos'],
  kilos: ['kilos', 'kg', 'peso', 'peso kg', 'kilogramos'],
  valor_venta: ['valor venta', 'venta neta', 'valor neto', 'monto neto'],
  costo_flete: ['costo flete', 'valor flete', 'flete neto'],
  estado: ['estado', 'estado entrega'],
  observaciones: ['observaciones', 'nota', 'comentario']
};

const aliasLookup = Object.entries(aliases).reduce((map, [field, names]) => {
  names.forEach((name) => map.set(clean(name), field));
  return map;
}, new Map());

const textValue = (value) => {
  const result = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return result || null;
};

const numberValue = (value, money = false) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  let raw = String(value ?? '')
    .replace(/[^0-9,.-]/g, '')
    .trim();
  if (!raw) return null;
  if (raw.includes(',') && raw.includes('.')) {
    raw =
      raw.lastIndexOf(',') > raw.lastIndexOf('.')
        ? raw.replace(/\./g, '').replace(',', '.')
        : raw.replace(/,/g, '');
  } else if (raw.includes(',')) {
    raw = raw.replace(/\./g, '').replace(',', '.');
  } else if (money && /^-?\d{1,3}(\.\d{3})+$/.test(raw)) {
    raw = raw.replace(/\./g, '');
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const dateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toISOString().slice(0, 10);
  if (typeof value === 'number' && value > 20000 && value < 80000) {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
    return date.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  const cl = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (cl) {
    const year = cl[3].length === 2 ? `20${cl[3]}` : cl[3];
    return `${year}-${cl[2].padStart(2, '0')}-${cl[1].padStart(2, '0')}`;
  }
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  return iso ? `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}` : null;
};

const transportType = (value) => {
  const normalized = clean(value).replace(/ /g, '_').toUpperCase();
  if (['PROPIO', 'EXTERNO', 'RETIRO_CLIENTE'].includes(normalized)) return normalized;
  return 'SIN_CLASIFICAR';
};

export function normalizeFreightRows(rows = []) {
  return rows
    .map((source) => {
      const mapped = {};
      Object.entries(source || {}).forEach(([header, value]) => {
        const field = aliasLookup.get(clean(header));
        if (field && mapped[field] == null) mapped[field] = value;
      });
      return {
        fecha_despacho: dateValue(mapped.fecha_despacho),
        fecha_entrega: dateValue(mapped.fecha_entrega),
        nv: textValue(mapped.nv),
        factura: textValue(mapped.factura),
        cliente: textValue(mapped.cliente),
        destino: textValue(mapped.destino),
        comuna: textValue(mapped.comuna),
        ciudad: textValue(mapped.ciudad),
        region: textValue(mapped.region),
        transportista: textValue(mapped.transportista),
        tipo_transporte: transportType(mapped.tipo_transporte),
        bultos: numberValue(mapped.bultos),
        kilos: numberValue(mapped.kilos),
        valor_venta: numberValue(mapped.valor_venta, true),
        costo_flete: numberValue(mapped.costo_flete, true),
        estado: textValue(mapped.estado),
        observaciones: textValue(mapped.observaciones)
      };
    })
    .filter((row) => row.nv || row.factura || row.cliente);
}

export const FREIGHT_TEMPLATE_HEADERS = [
  'FECHA DESPACHO',
  'FECHA ENTREGA',
  'NV',
  'FACTURA',
  'CLIENTE',
  'DESTINO',
  'COMUNA',
  'CIUDAD',
  'REGION',
  'TRANSPORTISTA',
  'TIPO TRANSPORTE',
  'BULTOS',
  'KILOS',
  'VALOR VENTA',
  'COSTO FLETE',
  'ESTADO',
  'OBSERVACIONES'
];
