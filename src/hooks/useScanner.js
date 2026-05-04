import { useEffect, useRef } from 'react';

/**
 * Hook global para interceptar lecturas de escáneres de hardware (PDAs, Zebra, Honeywell)
 * Estos dispositivos emulan un teclado pero escriben muy rápido (< 30ms por tecla).
 * 
 * @param {function} onScanCallback - Función que se ejecuta con el código escaneado
 * @param {number} timeoutMs - Tiempo máximo entre teclas para considerarlo un escáner (default 30ms)
 */
export const useScanner = (onScanCallback, timeoutMs = 30) => {
  const barcodeBuffer = useRef('');
  const lastKeyTime = useRef(Date.now());
  const callbackRef = useRef(onScanCallback);

  // Mantener la referencia actualizada sin causar re-renders ni re-binds del event listener
  useEffect(() => {
    callbackRef.current = onScanCallback;
  }, [onScanCallback]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;
      
      // Si pasó mucho tiempo, resetear el buffer (fue un humano tecleando, no un escáner)
      if (timeDiff > timeoutMs) {
        barcodeBuffer.current = '';
      }

      // Evitar interceptar atajos de teclado (Ctrl+C, etc) o teclas especiales,
      // a menos que sea el 'Enter' que indica el final del escaneo
      if (e.key === 'Enter') {
        if (barcodeBuffer.current.length > 3) { // Asumimos que un código tiene al menos 4 caracteres
          callbackRef.current(barcodeBuffer.current);
          barcodeBuffer.current = '';
          e.preventDefault(); // Evitar que el Enter envíe formularios accidentalmente
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Guardar la tecla en el buffer
        barcodeBuffer.current += e.key;
      }

      lastKeyTime.current = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [timeoutMs]);
};

export default useScanner;
