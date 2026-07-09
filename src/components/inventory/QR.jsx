import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// Genera un QR (PNG data URL) a partir de un texto. Se usa para el código de los
// bloques: el QR apunta a la URL interna del bloque; al escanearlo (cámara nativa
// o lector) se abre la auditoría con todos sus datos.
export function QR({ value, size = 200 }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let vivo = true;
    QRCode.toDataURL(value, { width: size, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => vivo && setSrc(url))
      .catch(() => vivo && setSrc(''));
    return () => { vivo = false; };
  }, [value, size]);
  if (!src) return <div style={{ width: size, height: size }} className="animate-pulse rounded-lg bg-slate-100" />;
  return <img src={src} width={size} height={size} alt="Código QR" className="rounded-lg" />;
}

export function qrDataUrl(value, size = 300) {
  return QRCode.toDataURL(value, { width: size, margin: 1, errorCorrectionLevel: 'M' });
}
