/** Recorta un timestamp ISO a YYYY-MM-DD. Retorna `fallback` si el valor es falsy o no es string válido. */
export function soloFecha(v, fallback = "") {
  if (!v) return fallback;
  return typeof v === "string" && v.length >= 10 ? v.slice(0, 10) : String(v);
}

/**
 * Formatea una fecha a "DD-MM-YYYY" SIN usar `new Date(...)` → sin corrimiento
 * por zona horaria. `new Date("2026-07-06").toLocaleDateString("es-CL")` da
 * "05-07" en Chile (interpreta UTC y renderiza en UTC-4). Este helper toma el
 * literal YYYY-MM-DD (recorta el timestamp si viene con hora) y lo reordena.
 * Muestra el dato EXACTO guardado. Para nulos devuelve `fallback`.
 */
export function fmtFechaCL(v, fallback = "—") {
  if (!v) return fallback;
  const s = String(v).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(v);
}

/** "Hoy" en hora de Chile como "YYYY-MM-DD". `new Date().toISOString()` da la
 * fecha UTC, que en la tarde/noche chilena (UTC-4/-3) adelanta un día. Ancla a
 * America/Santiago para que el filtro use el día correcto. */
export function hoyChile() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
}

/** Suma (o resta, con N negativo) días a una fecha "YYYY-MM-DD" sin corrimiento
 * de zona horaria (ancla a mediodía local). Devuelve "YYYY-MM-DD". */
export function sumaDias(fecha, dias) {
  const d = new Date(fecha + "T12:00:00");
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Convierte hex (#rrggbb) a "r,g,b". Fallback al naranja PTM. */
export function hexToRgb(hex) {
  if (!hex) return "245,124,0";
  const c = hex.replace("#", "");
  const n = parseInt(c, 16);
  if (isNaN(n) || c.length < 6) return "245,124,0";
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

/** Convierte hex a {r, g, b} numéricos. */
export function hexToRgbObj(hex) {
  const m = hex.replace("#", "");
  return {
    r: parseInt(m.slice(0, 2), 16) || 0,
    g: parseInt(m.slice(2, 4), 16) || 0,
    b: parseInt(m.slice(4, 6), 16) || 0,
  };
}
