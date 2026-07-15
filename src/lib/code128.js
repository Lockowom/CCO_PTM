// Generador de CODE 128 (subtipo B) como SVG — para los carteles de bodega.
// Sin dependencias: en el Excel original los códigos de barra eran imágenes
// pegadas a mano; aquí se generan al vuelo desde el código del producto.
// Tabla estándar de patrones (107 símbolos, anchos de barra/espacio).
const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];
const START_B = 104;
const STOP = 106;

// Devuelve la secuencia de módulos (anchos) del código completo, o null si el
// texto tiene caracteres fuera del set B (ASCII 32–127).
function encode128B(text) {
  const vals = [START_B];
  for (const ch of String(text)) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 127) return null;
    vals.push(code - 32);
  }
  let checksum = vals[0];
  for (let i = 1; i < vals.length; i++) checksum += vals[i] * i;
  vals.push(checksum % 103);
  vals.push(STOP);
  return vals.map((v) => PATTERNS[v]).join('');
}

/**
 * SVG de un CODE128-B. `height` en unidades SVG; el ancho se calcula por módulos.
 * Devuelve '' si el texto no es codificable.
 */
export function code128Svg(text, { height = 60, moduleWidth = 2, className = '', cssHeight = '' } = {}) {
  // Se recorta el texto: un espacio al inicio/fin se codificaría como carácter
  // real (valor 0 en el set B) y el lector devolvería un código distinto al impreso.
  const widths = encode128B(String(text ?? '').trim());
  if (!widths) return '';
  const quiet = 12 * moduleWidth; // zona muda (≥10 módulos); 12 = margen extra para lectores exigentes
  let x = quiet;
  let bars = '';
  for (let i = 0; i < widths.length; i++) {
    const w = Number(widths[i]) * moduleWidth;
    if (i % 2 === 0) bars += `<rect x="${x}" y="0" width="${w}" height="${height}" />`;
    x += w;
  }
  const total = x + quiet;
  // Dimensionado explícito (evita que el SVG caiga a ~300px con módulos borrosos):
  //  - cssHeight fijo → el barcode se dibuja a esa altura y su ancho sale de la
  //    proporción, centrado y sin superar el ancho del contenedor (max-width:100%).
  //    Así en celdas anchas (Doble/Único) no queda gigante ni empuja al logo.
  //  - sin cssHeight → llena el ancho (width:100%) conservando proporción.
  const sizeStyle = cssHeight
    ? `display:block;height:${cssHeight};width:auto;max-width:100%;margin:0 auto`
    : `display:block;width:100%;height:auto`;
  const sizeAttr = cssHeight ? '' : ' width="100%"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${height}" class="${className}"${sizeAttr} preserveAspectRatio="xMidYMid meet" style="${sizeStyle}" shape-rendering="crispEdges" fill="#000">${bars}</svg>`;
}
