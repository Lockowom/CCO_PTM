// Helpers de fechas del módulo Ingresar (port de lib/format.ts + lib/businessDays.ts).

/** Recorta un timestamp ISO a YYYY-MM-DD. Retorna `fallback` si el valor es falsy o no es string válido. */
export function soloFecha(v, fallback = "") {
  if (!v) return fallback;
  return typeof v === "string" && v.length >= 10 ? v.slice(0, 10) : String(v);
}

/**
 * Formatea una fecha a "DD-MM-YYYY" SIN usar `new Date(...)` → sin corrimiento
 * por zona horaria. Toma el literal YYYY-MM-DD (recorta el timestamp si viene
 * con hora) y lo reordena. Muestra el dato EXACTO guardado. Para nulos devuelve
 * `fallback`.
 */
export function fmtFechaCL(v, fallback = "—") {
  if (!v) return fallback;
  const s = String(v).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(v);
}

/**
 * Suma `days` días hábiles (lun–vie) a `startDate`.
 * Si `startDate` cae en fin de semana, avanza al lunes antes de contar.
 */
export function addBusinessDays(startDate, days) {
  const result = new Date(startDate);
  let added = 0;
  // Si cae en sábado o domingo, avanzar al lunes
  const dow = result.getDay();
  if (dow === 0) result.setDate(result.getDate() + 1);
  else if (dow === 6) result.setDate(result.getDate() + 2);

  while (added < days) {
    result.setDate(result.getDate() + 1);
    const d = result.getDay();
    if (d !== 0 && d !== 6) added++;
  }
  return result;
}

/**
 * Calcula la fecha compromiso: base + 2 días hábiles.
 * Prioridad: `fechaAprobacionReal` > `fechaAprobacion`.
 * Devuelve YYYY-MM-DD o "" si no hay fecha base.
 */
export function calcFechaCompromiso(fechaAprobacion, fechaAprobacionReal) {
  const base = fechaAprobacionReal || fechaAprobacion;
  if (!base) return "";
  const d = new Date(base + "T12:00:00");
  if (isNaN(d.getTime())) return "";
  const result = addBusinessDays(d, 2);
  const y = result.getFullYear();
  const m = String(result.getMonth() + 1).padStart(2, "0");
  const day = String(result.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
