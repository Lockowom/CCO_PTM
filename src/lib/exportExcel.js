import * as XLSX from 'xlsx';

/**
 * Exporta una o varias hojas a un archivo .xlsx.
 *
 * @param {Object} params
 * @param {string} params.filename  Nombre base del archivo (sin extensión).
 * @param {Array<{name: string, rows: Array<Object>}>} params.sheets
 *        Lista de hojas. Cada `rows` es un arreglo de objetos planos
 *        (las claves se usan como encabezados de columna).
 */
export function exportToExcel({ filename, sheets }) {
  const wb = XLSX.utils.book_new();

  (sheets || []).forEach((sheet, idx) => {
    const ws = XLSX.utils.json_to_sheet(sheet.rows || []);
    // Nombre de hoja: máx 31 chars, sin caracteres inválidos de Excel.
    const safeName = (sheet.name || `Hoja${idx + 1}`).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  });

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filename}_${stamp}.xlsx`);
}
