// Comprime/redimensiona una imagen en el cliente (máx 1600px, JPEG 0.82) para
// evitar subir fotos de móvil de 10-15MB y respetar el límite del bucket (8MB).
// Extraído del patrón usado en ProductDatasheet.jsx para reutilizarlo en evidencias.
export async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const MAX = 1600;
    let { width, height } = bitmap;
    if (width > MAX || height > MAX) {
      const ratio = Math.min(MAX / width, MAX / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
    return blob || file;
  } catch (_) {
    // Si el navegador no soporta createImageBitmap (raro), subimos el original.
    return file;
  }
}
