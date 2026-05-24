import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook reutilizable para escaneo de códigos de barras / QR
 * Utiliza @capacitor-mlkit/barcode-scanning en dispositivos nativos (Android/iOS)
 * En web, cae a un modo de input manual
 *
 * Soporta: QR, Code128, Code39, EAN13, EAN8, UPC-A, UPC-E, ITF, Codabar, DataMatrix, PDF417
 */

let BarcodeScanner = null;
let BarcodeFormat = null;

// Lazy import para evitar error en web cuando el plugin no está disponible
const loadScanner = async () => {
  if (!BarcodeScanner) {
    try {
      const module = await import('@capacitor-mlkit/barcode-scanning');
      BarcodeScanner = module.BarcodeScanner;
      BarcodeFormat = module.BarcodeFormat;
    } catch (err) {
      console.warn('Barcode scanner plugin not available:', err.message);
      return false;
    }
  }
  return true;
};

const useBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSupportedDevice, setIsSupportedDevice] = useState(Capacitor.isNativePlatform());

  /**
   * Verifica si el scanner está disponible y solicita permisos
   */
  const checkPermissions = useCallback(async () => {
    const loaded = await loadScanner();
    if (!loaded || !BarcodeScanner) return false;

    try {
      // Verificar soporte
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) {
        setIsSupportedDevice(false);
        return false;
      }

      // Verificar y solicitar permisos de cámara
      let { camera } = await BarcodeScanner.checkPermissions();

      if (camera === 'denied') {
        // Si fue denegado previamente, intentar abrir settings
        return false;
      }

      if (camera !== 'granted') {
        const result = await BarcodeScanner.requestPermissions();
        camera = result.camera;
      }

      return camera === 'granted';
    } catch (err) {
      console.error('Error checking scanner permissions:', err);
      return false;
    }
  }, []);

  /**
   * Inicia el escaneo con la cámara nativa
   * @param {Object} options - Opciones
   * @param {Function} options.onScan - Callback con el valor escaneado (string)
   * @param {Function} options.onError - Callback de error
   * @param {string[]} options.formats - Formatos a detectar (default: todos)
   * @returns {Promise<string|null>} - Valor escaneado o null si se canceló
   */
  const startScan = useCallback(async ({ onScan, onError, formats } = {}) => {
    const loaded = await loadScanner();
    if (!loaded || !BarcodeScanner) {
      onError?.('Scanner no disponible en este dispositivo');
      return null;
    }

    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        onError?.('Permiso de cámara denegado. Actívelo en Configuración.');
        return null;
      }

      setIsScanning(true);

      // Configurar formatos a escanear
      const scanFormats = formats || [
        BarcodeFormat.QrCode,
        BarcodeFormat.Code128,
        BarcodeFormat.Code39,
        BarcodeFormat.Ean13,
        BarcodeFormat.Ean8,
        BarcodeFormat.UpcA,
        BarcodeFormat.UpcE,
        BarcodeFormat.Itf,
        BarcodeFormat.Codabar,
        BarcodeFormat.DataMatrix,
        BarcodeFormat.Pdf417,
      ];

      // Escanear - abre la cámara nativa en fullscreen
      const result = await BarcodeScanner.scan({
        formats: scanFormats,
      });

      setIsScanning(false);

      if (result.barcodes && result.barcodes.length > 0) {
        const scannedValue = result.barcodes[0].rawValue;
        onScan?.(scannedValue);
        return scannedValue;
      }

      return null;
    } catch (err) {
      setIsScanning(false);

      // El usuario canceló el scan (botón atrás)
      if (err.message?.includes('canceled') || err.message?.includes('cancelled')) {
        return null;
      }

      console.error('Scan error:', err);
      onError?.(err.message || 'Error al escanear');
      return null;
    }
  }, [checkPermissions]);

  /**
   * Detiene el escaneo activo (si hay alguno)
   */
  const stopScan = useCallback(async () => {
    if (!BarcodeScanner) return;
    try {
      await BarcodeScanner.stopScan();
    } catch (_) {}
    setIsScanning(false);
  }, []);

  /**
   * Verifica si Google Play Services / ML Kit está disponible
   */
  const installGoogleBarcode = useCallback(async () => {
    const loaded = await loadScanner();
    if (!loaded || !BarcodeScanner) return false;

    try {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
      return true;
    } catch (err) {
      console.error('Error installing barcode module:', err);
      return false;
    }
  }, []);

  return {
    startScan,
    stopScan,
    isScanning,
    isSupportedDevice,
    checkPermissions,
    installGoogleBarcode,
  };
};

export default useBarcodeScanner;
