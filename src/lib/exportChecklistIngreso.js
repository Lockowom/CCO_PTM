// Documento del CheckList de Ingreso de Calidad en Word (.docx) y PDF, con
// formato de CONTROL DOCUMENTAL ISO 13485 (encabezado/pie en cada página,
// código de documento, revisión, norma, folio como sello).
// Si la tarea es CONFORME → "Certificado de Conformidad" (con folio-sello);
// si es NO CONFORME → "Acta de CheckList (No Conforme)".
// Librerías pesadas (docx, pdfmake) por import dinámico (solo al exportar).
import { LOGO_PTM } from '../assets/logoPtm';

// ── CONTROL DOCUMENTAL — editar con los datos oficiales de la empresa ────────
export const DOC_CONTROL = {
  empresa: 'PTM CHILE LTDA.',
  subtitulo: 'Control de Calidad — Recepción de Insumos Médicos',
  norma: 'ISO 13485:2016',
  codigo: 'FO-CAL-001',        // código del formato controlado
  revision: '01',              // revisión vigente
  fecha_revision: '2026-01',   // fecha de la revisión vigente
  // Logo (data URI PNG). Reemplazar LOGO_PTM en src/assets/logoPtm.js si cambia.
  logo: LOGO_PTM,
  logo_w: 257, logo_h: 77,     // dimensiones nativas del logo (para escalar)
};

// data URI → Uint8Array (para docx ImageRun).
function dataUriToBytes(uri) {
  const b64 = (uri || '').split(',')[1] || '';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

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
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow,
    TableCell, WidthType, AlignmentType, Header, Footer, PageNumber,
    ShadingType, BorderStyle, ImageRun,
  } = await import('docx');

  const D = DOC_CONTROL;
  const conforme = tarea.resultado === 'CONFORME';
  const noBorders = {
    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
  };

  const header = new Header({ children: [
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders, rows: [
      new TableRow({ children: [
        new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, borders: noBorders, children: [
          ...(D.logo ? [new Paragraph({ children: [new ImageRun({ data: dataUriToBytes(D.logo), transformation: { width: 120, height: Math.round(120 * D.logo_h / D.logo_w) } })] })] : []),
          new Paragraph({ children: [new TextRun({ text: D.empresa, bold: true, size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: D.subtitulo, size: 15, color: '64748B' })] }),
        ] }),
        new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, borders: noBorders, children: [
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Código: ${D.codigo}  ·  Rev. ${D.revision}`, size: 15 })] }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${D.norma}  ·  Vig. ${D.fecha_revision}`, size: 15, color: '64748B' })] }),
        ] }),
      ] }),
    ] }),
  ] });

  const footer = new Footer({ children: [
    new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' } }, children: [
      new TextRun({ text: `${D.codigo} · Rev. ${D.revision} · ${D.norma} · Documento controlado · Página `, size: 14, color: '94A3B8' }),
      new TextRun({ children: [PageNumber.CURRENT], size: 14, color: '94A3B8' }),
      new TextRun({ text: ' de ', size: 14, color: '94A3B8' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: '94A3B8' }),
    ] }),
  ] });

  const kvRow = (k, v) => new TableRow({ children: [
    new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: k, bold: true })] })] }),
    new TableCell({ width: { size: 65, type: WidthType.PERCENTAGE }, children: [new Paragraph(String(v ?? '—'))] }),
  ] });
  const th = (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 18 })] })] });
  const td = (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t ?? '—'), size: 18 })] })] });

  const children = [];
  children.push(new Paragraph({ text: tituloDoc(tarea), heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
  children.push(new Paragraph(''));

  // Sello (folio)
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    new TableRow({ children: [ new TableCell({
      shading: { fill: conforme ? 'ECFDF5' : 'FEF2F2', type: ShadingType.CLEAR, color: 'auto' },
      children: [
        new Paragraph({ children: [new TextRun({ text: conforme ? '✓ CERTIFICADO DE CONFORMIDAD' : '✗ RECEPCIÓN NO CONFORME', bold: true, color: conforme ? '047857' : 'BE123C' })] }),
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

  const D = DOC_CONTROL;
  const ans = tarea.checklist || {};
  const conforme = tarea.resultado === 'CONFORME';
  const fechaFin = tarea.completado_en ? new Date(tarea.completado_en).toLocaleString('es-CL') : '—';
  const kv = (k, v) => [{ text: k, bold: true }, { text: String(v ?? '—') }];

  const header = (currentPage, pageCount) => ({
    margin: [40, 18, 40, 0],
    stack: [
      {
        columns: [
          ...(D.logo ? [{ image: D.logo, width: 96, margin: [0, 0, 10, 0] }] : []),
          { width: '*', stack: [
            { text: D.empresa, bold: true, fontSize: 13 },
            { text: D.subtitulo, fontSize: 8, color: '#64748b' },
          ] },
          { width: 'auto', table: { widths: ['auto', 'auto'], body: [
            [{ text: 'Código', bold: true, fontSize: 7 }, { text: D.codigo, fontSize: 7 }],
            [{ text: 'Revisión', bold: true, fontSize: 7 }, { text: D.revision, fontSize: 7 }],
            [{ text: 'Norma', bold: true, fontSize: 7 }, { text: D.norma, fontSize: 7 }],
          ] }, layout: 'noBorders' },
        ],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 6, x2: 515, y2: 6, lineWidth: 0.7, lineColor: '#cbd5e1' }] },
    ],
  });

  const footer = (currentPage, pageCount) => ({
    margin: [40, 8, 40, 0],
    stack: [
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }] },
      { columns: [
        { text: `${D.codigo} · Rev. ${D.revision} · ${D.norma}`, fontSize: 7, color: '#94a3b8' },
        { text: `Documento controlado · Página ${currentPage} de ${pageCount}`, fontSize: 7, color: '#94a3b8', alignment: 'right' },
      ], margin: [0, 4, 0, 0] },
    ],
  });

  const content = [];
  content.push({ text: tituloDoc(tarea), style: 'title', color: conforme ? '#047857' : (tarea.resultado === 'NO_CONFORME' ? '#be123c' : '#0f172a') });

  // Sello (folio) — recuadro tipo timbre
  content.push({
    table: { widths: ['*'], body: [[{
      border: [true, true, true, true],
      fillColor: conforme ? '#ecfdf5' : '#fef2f2',
      margin: [10, 8, 10, 8],
      stack: [
        { text: conforme ? '✓ CERTIFICADO DE CONFORMIDAD' : '✗ RECEPCIÓN NO CONFORME', bold: true, fontSize: 11, color: conforme ? '#047857' : '#be123c' },
        { text: `Folio: ${tarea.folio || '—'}`, bold: true, fontSize: 14, margin: [0, 2, 0, 0] },
        { text: `${tarea.realizado_nombre || ''}${tarea.completado_en ? ' · ' + fechaFin : ''}`, fontSize: 8, color: '#475569', margin: [0, 2, 0, 0] },
      ],
    }]] },
    layout: {
      hLineColor: () => (conforme ? '#a7f3d0' : '#fecaca'),
      vLineColor: () => (conforme ? '#a7f3d0' : '#fecaca'),
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

  pdfMake.createPdf({
    pageMargins: [40, 78, 40, 54],
    header, footer,
    content,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: true, margin: [0, 10, 0, 4] },
    },
  }).download(nombreArchivo(tarea, 'pdf'));
}
