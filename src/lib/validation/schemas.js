// Esquemas zod por formulario. Reutilizan los límites centrales de limits.js.
// Validan SOLO los campos relevantes de seguridad/integridad; los objetos zod ignoran
// claves desconocidas, por lo que los esquemas conviven con estado de formulario más amplio.
import { z } from 'zod';
import { LIMITS } from './limits';

const trimmed = (max, label) =>
  z.string().trim().min(1, `${label} es obligatorio`).max(max, `${label} excede ${max} caracteres`);

const optionalText = (max) =>
  z.string().trim().max(max, `Excede ${max} caracteres`).optional().or(z.literal(''));

// Coerción tolerante para inputs numéricos (vienen como string del DOM).
const num = (min, max, label) =>
  z.coerce
    .number({ invalid_type_error: `${label} debe ser numérico` })
    .min(min, `${label} debe ser ≥ ${min}`)
    .max(max, `${label} debe ser ≤ ${max}`);

export const userSchema = z.object({
  nombre: trimmed(LIMITS.NOMBRE, 'Nombre'),
  email: z.string().trim().email('Email inválido').max(LIMITS.EMAIL, 'Email demasiado largo'),
  rol: trimmed(40, 'Rol'),
  // En edición la contraseña es opcional (vacía = no cambiar); en creación se valida aparte.
  password: z
    .string()
    .min(LIMITS.PASSWORD_MIN, `La contraseña debe tener al menos ${LIMITS.PASSWORD_MIN} caracteres`)
    .max(LIMITS.PASSWORD_MAX, 'Contraseña demasiado larga')
    .optional()
    .or(z.literal('')),
});

export const roleSchema = z.object({
  nombre: trimmed(LIMITS.NOMBRE, 'Nombre del rol'),
  descripcion: optionalText(LIMITS.DESC),
});

export const driverSchema = z.object({
  nombre: trimmed(LIMITS.NOMBRE, 'Nombre'),
  apellido: optionalText(LIMITS.APELLIDO),
  rut: optionalText(LIMITS.RUT),
  telefono: optionalText(LIMITS.TELEFONO),
  vehiculo_patente: optionalText(LIMITS.PATENTE),
});

export const receptionSchema = z.object({
  proveedor: trimmed(LIMITS.PROVEEDOR, 'Proveedor'),
  oc: optionalText(LIMITS.OC),
  cant_bultos: num(0, LIMITS.CANT_MAX, 'Cantidad de bultos'),
  pallets_usados: num(0, LIMITS.CANT_MAX, 'Pallets usados'),
  notas: optionalText(LIMITS.NOTAS),
});

export const cubingSchema = z.object({
  codigo_producto: trimmed(LIMITS.CODIGO, 'Código de producto'),
  descripcion: optionalText(LIMITS.DESC),
  unidad_medida: optionalText(LIMITS.UNIDAD_MEDIDA),
  peso_unitario: num(0, LIMITS.PESO_MAX, 'Peso unitario'),
  largo: num(0, LIMITS.DIM_MAX, 'Largo'),
  ancho: num(0, LIMITS.DIM_MAX, 'Ancho'),
  alto: num(0, LIMITS.DIM_MAX, 'Alto'),
  observaciones: optionalText(LIMITS.NOTAS),
});

export const routeSchema = z.object({
  rutaNombre: trimmed(LIMITS.RUTA_NOMBRE, 'Nombre de ruta'),
});

export const ticketSchema = z.object({
  asunto: trimmed(LIMITS.ASUNTO, 'Asunto'),
  descripcion: trimmed(LIMITS.NOTAS, 'Descripción'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email inválido').max(LIMITS.EMAIL, 'Email demasiado largo'),
  password: z.string().min(1, 'Ingresa tu contraseña').max(LIMITS.PASSWORD_MAX, 'Contraseña demasiado larga'),
});
