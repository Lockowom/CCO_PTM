
function mapPeso(row, headers) {
  // Asumimos estructura: Codigo(0), Descripcion(1), Peso(2), Largo(3), Ancho(4), Alto(5)
  // Ajustar índices según hoja real si es diferente
  return {
    codigo_producto: String(row[0]).trim(),
    descripcion: String(row[1]).trim(),
    peso_unitario: parseFloat(String(row[2]).replace(',', '.')) || 0,
    largo: parseFloat(String(row[3]).replace(',', '.')) || 0,
    ancho: parseFloat(String(row[4]).replace(',', '.')) || 0,
    alto: parseFloat(String(row[5]).replace(',', '.')) || 0
  };
}

function mapUbicaciones(row, headers) {
  // Estructura Ubicaciones según LotesSeries.gs:
  // 0: Ubicacion, 1: Codigo, 2: Serie, 3: Partida, 4: Pieza, 5: Venc, 6: Talla, 7: Color, 8: Cant, 9: Desc
  return {
    ubicacion: String(row[0]).trim(),
    codigo_producto: String(row[1]).trim(),
    serie: String(row[2]).trim(),
    partida: String(row[3]).trim(),
    pieza: String(row[4]).trim(),
    fecha_venc: row[5] instanceof Date ? row[5] : null,
    cantidad: parseFloat(String(row[8]).replace(',', '.')) || 0,
    descripcion: String(row[9]).trim(),
    usuario: String(row[11] || 'Sistema') // A veces usuario está más allá
  };
}
