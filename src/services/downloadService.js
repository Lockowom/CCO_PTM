import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const DOWNLOAD_EVENT = 'cco:download-progress';

const notify = (detail) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DOWNLOAD_EVENT, { detail }));
  }
};

const safeFilename = (value, fallback = 'Informe.pdf') => {
  const name = String(value || fallback)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_\.]+|[_\.]+$/g, '');
  return name || fallback;
};

const blobToBase64 = async (blob) => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
};

const browserDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const webShareFile = async (blob, filename) => {
  if (
    typeof File === 'undefined' ||
    typeof navigator === 'undefined' ||
    typeof navigator.share !== 'function'
  ) {
    return false;
  }
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
  if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
    return false;
  }
  await navigator.share({ title: filename, files: [file] });
  return true;
};

export async function saveReportBlob(blob, requestedFilename, options = {}) {
  const filename = safeFilename(requestedFilename);
  const label = options.label || 'informe';
  notify({ visible: true, phase: 'saving', progress: 72, label, filename });

  if (!Capacitor.isNativePlatform()) {
    browserDownload(blob, filename);
    notify({ visible: true, phase: 'done', progress: 100, label, filename });
    return { filename, platform: 'web' };
  }

  // Compatibilidad OTA: los equipos con la APK anterior todavía no tienen los
  // plugins nativos. En ellos usamos Web Share o la descarga clásica y evitamos
  // romper los informes mientras se instala la APK renovada.
  if (!Capacitor.isPluginAvailable('Filesystem')) {
    const shared = await webShareFile(blob, filename).catch(() => false);
    if (!shared) browserDownload(blob, filename);
    notify({ visible: true, phase: 'done', progress: 100, label, filename });
    return { filename, platform: shared ? 'web-share' : 'web-fallback' };
  }

  const data = await blobToBase64(blob);
  let result;
  let directory = Directory.Documents;
  const path = `CCO/${filename}`;

  try {
    result = await Filesystem.writeFile({ path, data, directory, recursive: true });
  } catch (documentsError) {
    directory = Directory.Cache;
    result = await Filesystem.writeFile({ path: filename, data, directory, recursive: true });
    console.warn('No se pudo guardar en Documentos; se usó caché compartible.', documentsError);
  }

  notify({ visible: true, phase: 'sharing', progress: 92, label, filename });
  if (Capacitor.isPluginAvailable('Share')) {
    await Share.share({
      title: filename,
      text: `Informe generado desde CCO: ${filename}`,
      url: result.uri,
      dialogTitle: 'Abrir, guardar o compartir informe'
    });
  }
  notify({ visible: true, phase: 'done', progress: 100, label, filename });
  return { filename, uri: result.uri, directory, platform: 'native' };
}

export async function downloadPdfDocument(pdfDocument, filename, options = {}) {
  const safeName = safeFilename(filename, 'Informe.pdf');
  notify({
    visible: true,
    phase: 'generating',
    progress: 18,
    label: options.label || 'PDF',
    filename: safeName
  });
  const blob = await new Promise((resolve, reject) => {
    try {
      pdfDocument.getBlob((generatedBlob) => {
        if (generatedBlob) resolve(generatedBlob);
        else reject(new Error('El PDF se generó vacío.'));
      });
    } catch (error) {
      reject(error);
    }
  });
  notify({
    visible: true,
    phase: 'generated',
    progress: 58,
    label: options.label || 'PDF',
    filename: safeName
  });
  try {
    return await saveReportBlob(blob, safeName, options);
  } catch (error) {
    notify({
      visible: true,
      phase: 'error',
      progress: 100,
      label: options.label || 'PDF',
      filename: safeName,
      message: error.message
    });
    throw error;
  }
}

export { DOWNLOAD_EVENT };
