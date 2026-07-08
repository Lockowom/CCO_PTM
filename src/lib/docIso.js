// Helper compartido de CONTROL DOCUMENTAL ISO 13485 para los documentos de
// Calidad (Certificado/Acta del CheckList, Informe de Monitoreo, Informe de
// Daños): encabezado con logo + razón social + código/revisión/norma, y pie con
// "Código · Rev · Norma · Documento controlado · Página X de Y".
import { LOGO_PTM } from '../assets/logoPtm';

// ── Editar con los datos oficiales de la empresa ────────────────────────────
export const DOC_CONTROL = {
  empresa: 'PTM CHILE LTDA.',
  subtitulo: 'Control de Calidad — Recepción de Insumos Médicos',
  norma: 'ISO 13485:2016',
  fecha_revision: '2026-01',
  logo: LOGO_PTM,
  logo_w: 257, logo_h: 77,
  // Código/revisión por tipo de documento:
  codigos: {
    checklist:  { codigo: 'FO-CAL-001', revision: '01' },
    monitoreo:  { codigo: 'FO-CAL-002', revision: '01' },
    danos:      { codigo: 'FO-CAL-003', revision: '01' },
  },
};

export function docMeta(tipo) {
  const c = DOC_CONTROL.codigos[tipo] || { codigo: 'FO-CAL-000', revision: '01' };
  return { ...DOC_CONTROL, ...c };
}

// data URI → Uint8Array (para docx ImageRun).
export function dataUriToBytes(uri) {
  const b64 = (uri || '').split(',')[1] || '';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ── PDF (pdfmake) ───────────────────────────────────────────────────────────
export const isoPageMargins = [40, 82, 40, 54];

export function isoPdfHeader(tipo) {
  const D = docMeta(tipo);
  return () => ({
    margin: [40, 16, 40, 0],
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
      { canvas: [{ type: 'line', x1: 0, y1: 8, x2: 515, y2: 8, lineWidth: 0.7, lineColor: '#cbd5e1' }] },
    ],
  });
}

export function isoPdfFooter(tipo) {
  const D = docMeta(tipo);
  return (currentPage, pageCount) => ({
    margin: [40, 8, 40, 0],
    stack: [
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }] },
      { columns: [
        { text: `${D.codigo} · Rev. ${D.revision} · ${D.norma}`, fontSize: 7, color: '#94a3b8' },
        { text: `Documento controlado · Página ${currentPage} de ${pageCount}`, fontSize: 7, color: '#94a3b8', alignment: 'right' },
      ], margin: [0, 4, 0, 0] },
    ],
  });
}

// ── Word (docx) — devuelve { header, footer } listos para la sección ─────────
export function isoWordHeaderFooter(docx, tipo) {
  const {
    Header, Footer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, PageNumber, BorderStyle, ImageRun,
  } = docx;
  const D = docMeta(tipo);
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

  return { header, footer };
}
