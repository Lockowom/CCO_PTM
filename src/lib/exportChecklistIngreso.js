// Documento del CheckList de Ingreso de Calidad en Word (.docx) y PDF, con
// formato de CONTROL DOCUMENTAL ISO 13485 (encabezado/pie compartido en docIso).
// CONFORME → "Certificado de Conformidad" (con folio-sello); NO CONFORME → "Acta".
import { DOC_CONTROL, isoPageMargins, isoPdfHeader, isoPdfFooter, isoWordHeaderFooter } from './docIso';

export { DOC_CONTROL };

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const RESP_LABEL = { OK: 'Conforme', NO: 'No conforme', NA: 'N/A' };
const ORIGEN_LABEL = { IMPORTACION: 'Importación', NACIONAL: 'Nacional' };

function tituloDoc(tarea) {
  if (tarea.resultado === 'CONFORME') return 'CERTIFICADO DE CONFORMIDAD';
  if (tarea.resultado === 'NO_CONFORME') return 'ACTA — CHECKLIST DE INGRESO (NO CONFORME)';
  return 'ACTA — CHECKLIST DE INGRESO';
}

function nombreArchivo(tarea, ext) {
  const base = tarea.folio || `CheckList_${tarea.oc || 'ingreso'}`;
  return `${String(base).replace(/[^\w.-]+/g, '_')}.${ext}`;
}

// ── Word (.docx) ────────────────────────────────────────────────────────────
export async function exportChecklistWord(tarea, niveles = []) {
  const docx = await import('docx');
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow,
    TableCell, WidthType, AlignmentType, ShadingType, BorderStyle,
  } = docx;
  const { header, footer } = isoWordHeaderFooter(docx, 'checklist');
  const conforme = tarea.resultado === 'CONFORME';
  const noBorders = {
    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
  };

  const kvRow = (k, v) => new TableRow({ children: [
    new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: k, bold: true })] })] }),
    new TableCell({ width: { size: 65, type: WidthType.PERCENTAGE }, children: [new Paragraph(String(v ?? '—'))] }),
  ] });
  const th = (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 18 })] })] });
  const td = (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t ?? '—'), size: 18 })] })] });

  const children = [];
  children.push(new Paragraph({ text: tituloDoc(tarea), heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
  children.push(new Paragraph(''));

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    new TableRow({ children: [ new TableCell({
      shading: { fill: conforme ? 'ECFDF5' : 'FEF2F2', type: ShadingType.CLEAR, color: 'auto' },
      children: [
        new Paragraph({ children: [new TextRun({ text: conforme ? 'CERTIFICADO DE CONFORMIDAD — CONFORME' : 'RECEPCIÓN NO CONFORME', bold: true, color: conforme ? '047857' : 'BE123C' })] }),
        new Paragraph({ children: [new TextRun({ text: `Folio: ${tarea.folio || '—'}`, bold: true, size: 26 })] }),
        new Paragraph({ children: [new TextRun({ text: `${tarea.realizado_nombre || ''}${tarea.completado_en ? ' · ' + new Date(tarea.completado_en).toLocaleString('es-CL') : ''}`, size: 16, color: '475569' })] }),
      ],
    }) ] }),
  ] }));
  children.push(new Paragraph(''));

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    kvRow('Proveedor', tarea.proveedor),
    kvRow('Orden de compra', tarea.oc),
    kvRow('Origen', ORIGEN_LABEL[tarea.origen] || tarea.origen),
    kvRow('Fecha de recepción', tarea.fecha_recepcion),
    kvRow('Bultos', tarea.bultos),
    kvRow('Resultado', conforme ? 'CONFORME' : (tarea.resultado === 'NO_CONFORME' ? 'NO CONFORME' : (tarea.estado || '—'))),
    ...(tarea.disposicion ? [kvRow('Disposición / Acción a tomar', tarea.disposicion)] : []),
    kvRow('Responsable de Calidad', tarea.realizado_nombre),
    kvRow('Fecha de finalización', tarea.completado_en ? new Date(tarea.completado_en).toLocaleString('es-CL') : '—'),
  ] }));
  children.push(new Paragraph(''));

  const ans = tarea.checklist || {};
  niveles.forEach((nivel) => {
    children.push(new Paragraph({ text: nivel.titulo, heading: HeadingLevel.HEADING_2 }));
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
      new TableRow({ children: ['Ítem', 'Resultado', 'Nota'].map(th) }),
      ...nivel.params.map(p => new TableRow({ children: [
        td(p.label), td(RESP_LABEL[ans[p.id]?.estado] || '—'), td(ans[p.id]?.nota || ''),
      ] })),
    ] }));
    children.push(new Paragraph(''));
  });

  if (tarea.observaciones) {
    children.push(new Paragraph({ text: 'Observaciones', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph(tarea.observaciones));
    children.push(new Paragraph(''));
  }

  children.push(new Paragraph(''));
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders, rows: [new TableRow({ children: [
    new TableCell({ borders: noBorders, children: [
      new Paragraph('_______________________________'),
      new Paragraph({ children: [new TextRun({ text: tarea.realizado_nombre || 'Nombre / Firma', bold: true })] }),
      new Paragraph('Calidad — Inspección de ingreso'),
    ] }),
    new TableCell({ borders: noBorders, children: [
      new Paragraph('_______________________________'),
      new Paragraph({ children: [new TextRun({ text: 'Nombre / Firma', bold: true })] }),
      new Paragraph('Recepción / Bodega'),
    ] }),
  ] })] }));

  if (tarea.firma_digital) {
    children.push(new Paragraph(''));
    children.push(new Paragraph({ children: [new TextRun({ text: 'FIRMA ELECTRÓNICA', bold: true })] }));
    children.push(new Paragraph({ children: [new TextRun({ text: `Algoritmo: ${tarea.firma_algoritmo || 'HMAC-SHA256'} · Firmado por: ${tarea.firmado_nombre || '—'} · ${tarea.firmado_en ? new Date(tarea.firmado_en).toLocaleString('es-CL') : ''}`, size: 16, color: '475569' })] }));
    children.push(new Paragraph({ children: [new TextRun({ text: tarea.firma_digital, size: 12, color: '94A3B8' })] }));
    children.push(new Paragraph({ children: [new TextRun({ text: `Verificar en: ${window.location.origin}/verificar?folio=${tarea.folio || ''}`, size: 14, color: '475569' })] }));
  }

  const doc = new Document({ sections: [{ headers: { default: header }, footers: { default: footer }, children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, nombreArchivo(tarea, 'docx'));
}

// ── PDF (pdfmake) ────────────────────────────────────────────────────────────
export async function exportChecklistPDF(tarea, niveles = []) {
  const pdfMakeMod = await import('pdfmake/build/pdfmake');
  const pdfFontsMod = await import('pdfmake/build/vfs_fonts');
  const pdfMake = pdfMakeMod.default || pdfMakeMod;
  const fonts = pdfFontsMod.default || pdfFontsMod;
  pdfMake.vfs = fonts.pdfMake?.vfs || fonts.vfs || pdfMake.vfs;

  const ans = tarea.checklist || {};
  const conforme = tarea.resultado === 'CONFORME';
  const fechaFin = tarea.completado_en ? new Date(tarea.completado_en).toLocaleString('es-CL') : '—';
  const kv = (k, v) => [{ text: k, bold: true }, { text: String(v ?? '—') }];
  const content = [];

  content.push({ text: tituloDoc(tarea), style: 'title', color: conforme ? '#047857' : (tarea.resultado === 'NO_CONFORME' ? '#be123c' : '#0f172a') });

  content.push({
    table: { widths: ['*'], body: [[{
      fillColor: conforme ? '#ecfdf5' : '#fef2f2', margin: [10, 8, 10, 8],
      stack: [
        { text: conforme ? 'CERTIFICADO DE CONFORMIDAD — CONFORME' : 'RECEPCIÓN NO CONFORME', bold: true, fontSize: 11, color: conforme ? '#047857' : '#be123c' },
        { text: `Folio: ${tarea.folio || '—'}`, bold: true, fontSize: 14, margin: [0, 2, 0, 0] },
        { text: `${tarea.realizado_nombre || ''}${tarea.completado_en ? ' · ' + fechaFin : ''}`, fontSize: 8, color: '#475569', margin: [0, 2, 0, 0] },
      ],
    }]] },
    layout: {
      hLineColor: () => (conforme ? '#a7f3d0' : '#fecaca'), vLineColor: () => (conforme ? '#a7f3d0' : '#fecaca'),
      hLineWidth: () => 1, vLineWidth: () => 1,
    },
    margin: [0, 6, 0, 12],
  });

  content.push({
    table: { widths: ['35%', '65%'], body: [
      kv('Proveedor', tarea.proveedor), kv('Orden de compra', tarea.oc),
      kv('Origen', ORIGEN_LABEL[tarea.origen] || tarea.origen),
      kv('Fecha de recepción', tarea.fecha_recepcion), kv('Bultos', tarea.bultos),
      kv('Resultado', conforme ? 'CONFORME' : (tarea.resultado === 'NO_CONFORME' ? 'NO CONFORME' : (tarea.estado || '—'))),
      ...(tarea.disposicion ? [kv('Disposición / Acción a tomar', tarea.disposicion)] : []),
      kv('Responsable de Calidad', tarea.realizado_nombre), kv('Fecha de finalización', fechaFin),
    ] },
    layout: 'lightHorizontalLines', margin: [0, 0, 0, 12],
  });

  niveles.forEach((nivel) => {
    content.push({ text: nivel.titulo, style: 'h2' });
    content.push({
      table: { headerRows: 1, widths: ['*', 'auto', '35%'], body: [
        ['Ítem', 'Resultado', 'Nota'].map(t => ({ text: t, bold: true, fontSize: 9 })),
        ...nivel.params.map(p => {
          const e = ans[p.id]?.estado;
          return [
            { text: p.label, fontSize: 9 },
            { text: RESP_LABEL[e] || '—', fontSize: 9, bold: true, color: e === 'NO' ? '#be123c' : (e === 'OK' ? '#047857' : '#64748b') },
            { text: ans[p.id]?.nota || '', fontSize: 9 },
          ];
        }),
      ] },
      layout: 'lightHorizontalLines', margin: [0, 0, 0, 12],
    });
  });

  if (tarea.observaciones) {
    content.push({ text: 'Observaciones', style: 'h2' });
    content.push({ text: tarea.observaciones, margin: [0, 0, 0, 12] });
  }

  content.push({
    columns: [
      { stack: [{ text: '_______________________________', margin: [0, 20, 0, 0] }, { text: tarea.realizado_nombre || 'Nombre / Firma', bold: true }, { text: 'Calidad — Inspección de ingreso', fontSize: 9, color: '#64748b' }] },
      { stack: [{ text: '_______________________________', margin: [0, 20, 0, 0] }, { text: 'Nombre / Firma', bold: true }, { text: 'Recepción / Bodega', fontSize: 9, color: '#64748b' }] },
    ],
    columnGap: 24,
  });

  // Firma electrónica + QR de verificación
  if (tarea.firma_digital) {
    const url = `${window.location.origin}/verificar?folio=${encodeURIComponent(tarea.folio || '')}`;
    content.push({
      columns: [
        { width: '*', stack: [
          { text: 'FIRMA ELECTRÓNICA', bold: true, fontSize: 9, color: '#0f172a' },
          { text: `Algoritmo: ${tarea.firma_algoritmo || 'HMAC-SHA256'}`, fontSize: 8, color: '#475569' },
          { text: `Firmado por: ${tarea.firmado_nombre || '—'}`, fontSize: 8, color: '#475569' },
          { text: `Fecha: ${tarea.firmado_en ? new Date(tarea.firmado_en).toLocaleString('es-CL') : '—'}`, fontSize: 8, color: '#475569' },
          { text: tarea.firma_digital, fontSize: 6, color: '#94a3b8', margin: [0, 2, 0, 0] },
        ] },
        { width: 'auto', stack: [
          { qr: url, fit: 84, foreground: '#0f172a', margin: [0, 2, 0, 0] },
          { text: 'Escanee para verificar', fontSize: 7, alignment: 'center', color: '#64748b' },
        ] },
      ],
      columnGap: 16, margin: [0, 14, 0, 0],
    });
  }

  pdfMake.createPdf({
    pageMargins: isoPageMargins,
    header: isoPdfHeader('checklist'),
    footer: isoPdfFooter('checklist'),
    content,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: true, margin: [0, 10, 0, 4] },
    },
  }).download(nombreArchivo(tarea, 'pdf'));
}
