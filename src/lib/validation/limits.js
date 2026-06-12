// Límites de longitud y rango para validación de entrada en formularios.
// Fuente única reutilizada por los esquemas zod (schemas.js) y por los atributos
// maxLength/min/max de los inputs HTML. Mantener alineado con el esquema de la BD.

export const LIMITS = {
  // Texto general
  NOMBRE: 100,
  APELLIDO: 100,
  EMAIL: 254,        // RFC 5321
  PASSWORD_MIN: 6,   // política actual (no se endurece por decisión de negocio)
  PASSWORD_MAX: 128,
  DESC: 500,
  NOTAS: 2000,
  ASUNTO: 150,

  // Identificadores operativos
  CODIGO: 20,
  UBICACION: 12,
  RUT: 12,
  TELEFONO: 20,
  PATENTE: 8,
  PROVEEDOR: 150,
  OC: 60,
  RUTA_NOMBRE: 100,
  UNIDAD_MEDIDA: 20,
  TIPO_EMPAQUE: 30,

  // Rangos numéricos
  CANT_MAX: 1000000,      // cantidades / bultos / pallets
  PESO_MAX: 100000,       // kg
  DIM_MAX: 10000,         // cm (largo/ancho/alto)
};

// Longitud máxima defensiva para cualquier celda de importación masiva (CSV/Excel).
export const IMPORT_CELL_MAX = 1000;
