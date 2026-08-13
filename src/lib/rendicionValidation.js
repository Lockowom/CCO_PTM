const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
const CONTROL = /\p{Cc}/gu;

export const TIPOS_FONDO = [
  'Fondo por rendir',
  'Rendición de gastos',
  'Fondo fijo',
  'Anticipo',
  'Reembolso'
];

export const TIPOS_DOCUMENTO = [
  'Factura',
  'Boleta',
  'Boleta de honorarios',
  'Voucher/comprobante',
  'Comprobante de transferencia',
  'Sin documento'
];

export function cleanHumanText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(ZERO_WIDTH, '')
    .replace(CONTROL, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasRealLetters(value) {
  return /\p{L}/u.test(cleanHumanText(value));
}

export function validateRendicion(payload) {
  const errors = {};
  if (!payload.centro_costo_id) errors.centro_costo_id = 'Selecciona un centro de costo.';
  if (!payload.solicitante_tecnico_id)
    errors.solicitante_tecnico_id = 'Selecciona tu nombre desde técnicos de Postventa.';
  if (!/^[0-9]{1,2}(\.?[0-9]{3}){2}-[0-9Kk]$/.test(cleanHumanText(payload.solicitante_rut)))
    errors.solicitante_rut = 'Ingresa un RUT válido, por ejemplo 12.345.678-9.';
  if (!hasRealLetters(payload.solicitante_direccion_area))
    errors.solicitante_direccion_area = 'Ingresa una dirección o área con texto real.';
  if (!TIPOS_FONDO.includes(payload.tipo_fondo)) errors.tipo_fondo = 'Selecciona un tipo de fondo.';
  if (
    payload.tipo_fondo === 'Fondo por rendir' &&
    (!Number.isFinite(Number(payload.fondo_por_rendir)) || Number(payload.fondo_por_rendir) <= 0)
  )
    errors.fondo_por_rendir = 'Ingresa el monto positivo del fondo por rendir.';
  if (payload.detalle && !hasRealLetters(payload.detalle))
    errors.detalle = 'Escribe texto real; espacios o símbolos no son válidos.';
  if (!Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > 15) {
    errors.items = 'Debes ingresar entre 1 y 15 gastos.';
    return errors;
  }
  payload.items.forEach((item, index) => {
    const prefix = `items.${index}`;
    if (!item.fecha) errors[`${prefix}.fecha`] = 'Selecciona la fecha.';
    if (!item.categoria_codigo) errors[`${prefix}.categoria_codigo`] = 'Selecciona la categoría.';
    if (!item.subcategoria_codigo)
      errors[`${prefix}.subcategoria_codigo`] = 'Selecciona la subcategoría.';
    if (!hasRealLetters(item.descripcion) || cleanHumanText(item.descripcion).length < 3) {
      errors[`${prefix}.descripcion`] = 'La descripción debe contener letras reales.';
    }
    if (!Number.isFinite(Number(item.monto)) || Number(item.monto) <= 0)
      errors[`${prefix}.monto`] = 'Ingresa un monto positivo.';
    if (!TIPOS_DOCUMENTO.includes(item.tipo_documento))
      errors[`${prefix}.tipo_documento`] = 'Selecciona el documento.';
    if (item.numero_documento && !/[\p{L}\p{N}]/u.test(cleanHumanText(item.numero_documento))) {
      errors[`${prefix}.numero_documento`] = 'El número debe contener letras o dígitos reales.';
    }
  });
  return errors;
}

export function emptyRendicionItem() {
  return {
    client_id: crypto.randomUUID(),
    fecha: new Date().toLocaleDateString('en-CA'),
    categoria_codigo: '',
    subcategoria_codigo: '',
    descripcion: '',
    monto: '',
    tipo_documento: '',
    numero_documento: '',
    photos: []
  };
}

export function excelSafe(value) {
  const text = cleanHumanText(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}
