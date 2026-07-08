// Documento formal del "Informe de Monitoreo a Calidad" en Word (.docx) y PDF.
// Librerías pesadas (docx, pdfmake) por import dinámico (solo al exportar).
// Formato de control documental ISO 13485 (encabezado/pie + logo) vía docIso.
import { isoPageMargins, isoPdfHeader, isoPdfFooter, isoWordHeaderFooter } from './docIso';

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

const DICT_LABEL = {
  LIBERAR: 'Liberado', CUARENTENA: 'Cuarentena', REPROCESO: 'Reproceso',
  RECHAZAR: 'Rechazado', BAJA: 'Baja',
};

// Estadísticas del informe a partir de sus ítems.
function stats(items) {
  const c = (fn) => items.filter(fn).length;
  const cond = [...new Set(items.map(i => i.condicion_observada).filter(Boolean))];
  return {
    total: items.length,
    dictaminados: c(i => i.dictamen),
    pendientes: c(i => !i.dictamen),
    problema: c(i => i.condicion_observada && i.condicion_observada !== 'OK'),
    noReg: c(i => i.no_registrado),
    rojo: c(i => i.semaforo === 'ROJO'),
    naranja: c(i => i.semaforo === 'NARANJA'),
    verde: c(i => i.semaforo === 'VERDE'),
    porDictamen: ['LIBERAR', 'CUARENTENA', 'REPROCESO', 'RECHAZAR', 'BAJA']
      .map(d => ({ d, n: c(i => i.dictamen === d) })).filter(x => x.n > 0),
    porCondicion: cond.map(x => ({ x, n: c(i => i.condicion_observada === x) })),
  };
}

// ── Word (.docx) ────────────────────────────────────────────────────────────
export async function exportInformeMonitoreoWord(informe, items = []) {
  const docx = await import('docx');
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow,
    TableCell, WidthType, AlignmentType,
  } = docx;
  const { header, footer } = isoWordHeaderFooter(docx, 'monitoreo');
  const s = stats(items);

  const kvRow = (k, v) => new TableRow({ children: [
    new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: k, bold: true })] })] }),
    new TableCell({ width: { size: 65, type: WidthType.PERCENTAGE }, children: [new Paragraph(String(v ?? '—'))] }),
  ] });

  const th = (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 18 })] })] });
  const td = (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t ?? '—'), size: 18 })] })] });

  const children = [];
  children.push(new Paragraph({ text: 'INFORME DE MONITOREO A CALIDAD', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
  children.push(new Paragraph({ text: informe.numero || '', alignment: AlignmentType.CENTER }));
  children.push(new Paragraph(''));

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    kvRow('Fecha', informe.fecha),
    kvRow('Bodega', informe.bodega),
    kvRow('Analista', informe.analista_nombre),
    kvRow('Periodicidad', informe.periodicidad),
    kvRow('Estado', (informe.estado || '').replace('_', ' ')),
  ] }));
  children.push(new Paragraph(''));

  children.push(new Paragraph({ text: '1. RESUMEN EJECUTIVO', heading: HeadingLevel.HEADING_2 }));
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    kvRow('Total de ítems', s.total),
    kvRow('Dictaminados', s.dictaminados),
    kvRow('Pendientes', s.pendientes),
    kvRow('Con problema (condición ≠ OK)', s.problema),
    kvRow('No registrados en sistema', s.noReg),
    kvRow('Semáforo vencimiento (🔴/🟠/🟢)', `${s.rojo} / ${s.naranja} / ${s.verde}`),
    ...s.porDictamen.map(x => kvRow(`Dictamen · ${DICT_LABEL[x.d] || x.d}`, x.n)),
  ] }));
  children.push(new Paragraph(''));

  children.push(new Paragraph({ text: '2. DETALLE DE ÍTEMS', heading: HeadingLevel.HEADING_2 }));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: ['SKU', 'Producto', 'Lote/Serie', 'Ubic.', 'Cant', 'Afect.', 'Condición', 'Dictamen'].map(th) }),
      ...items.map(it => new TableRow({ children: [
        td(it.codigo_producto), td(it.producto), td(it.partida), td(it.ubicacion),
        td(it.cantidad), td(it.cantidad_afectada || 0),
        td((it.no_registrado ? 'NO REG · ' : '') + (it.condicion_observada || '')),
        td(it.dictamen ? (DICT_LABEL[it.dictamen] || it.dictamen) : 'Pendiente'),
      ] })),
    ],
  }));
  children.push(new Paragraph(''));

  children.push(new Paragraph(''));
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [
    new TableCell({ children: [
      new Paragraph('_______________________________'),
      new Paragraph({ children: [new TextRun({ text: informe.analista_nombre || 'Nombre / Firma', bold: true })] }),
      new Paragraph('Analista — Monitoreo'),
    ] }),
    new TableCell({ children: [
      new Paragraph('_______________________________'),
      new Paragraph({ children: [new TextRun({ text: 'Nombre / Firma', bold: true })] }),
      new Paragraph('Calidad — Dictamen'),
    ] }),
  ] })] }));

  const doc = new Document({ sections: [{ headers: { default: header }, footers: { default: footer }, children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${informe.numero || 'Informe_Monitoreo'}.docx`);
}

// ── PDF (pdfmake) ────────────────────────────────────────────────────────────
export async function exportInformeMonitoreoPDF(informe, items = []) {
  const pdfMakeMod = await import('pdfmake/build/pdfmake');
  const pdfFontsMod = await import('pdfmake/build/vfs_fonts');
  const pdfMake = pdfMakeMod.default || pdfMakeMod;
  const fonts = pdfFontsMod.default || pdfFontsMod;
  pdfMake.vfs = fonts.pdfMake?.vfs || fonts.vfs || pdfMake.vfs;
  const s = stats(items);

  const kv = (k, v) => [{ text: k, bold: true }, { text: String(v ?? '—') }];
  const content = [];
  content.push({ text: 'INFORME DE MONITOREO A CALIDAD', style: 'title' });
  content.push({ text: informe.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' });

  content.push({
    table: { widths: ['35%', '65%'], body: [
      kv('Fecha', informe.fecha), kv('Bodega', informe.bodega),
      kv('Analista', informe.analista_nombre), kv('Periodicidad', informe.periodicidad),
      kv('Estado', (informe.estado || '').replace('_', ' ')),
    ] },
    layout: 'lightHorizontalLines', margin: [0, 0, 0, 12],
  });

  content.push({ text: '1. Resumen ejecutivo', style: 'h2' });
  content.push({
    table: { widths: ['60%', '40%'], body: [
      kv('Total de ítems', s.total), kv('Dictaminados', s.dictaminados),
      kv('Pendientes', s.pendientes), kv('Con problema (condición ≠ OK)', s.problema),
      kv('No registrados en sistema', s.noReg),
      kv('Semáforo vencimiento (R/N/V)', `${s.rojo} / ${s.naranja} / ${s.verde}`),
      ...s.porDictamen.map(x => kv(`Dictamen · ${DICT_LABEL[x.d] || x.d}`, x.n)),
    ] },
    layout: 'lightHorizontalLines', margin: [0, 0, 0, 12],
  });

  content.push({ text: '2. Detalle de ítems', style: 'h2' });
  content.push({
    table: {
      headerRows: 1,
      widths: ['auto', '*', 'auto', 'auto', 22, 22, 'auto', 'auto'],
      body: [
        ['SKU', 'Producto', 'Lote/Serie', 'Ubic.', 'Cant', 'Afe.', 'Condición', 'Dictamen'].map(t => ({ text: t, bold: true, fontSize: 8 })),
        ...items.map(it => [
          { text: it.codigo_producto || '', fontSize: 8 },
          { text: it.producto || '', fontSize: 8 },
          { text: it.partida || '', fontSize: 8 },
          { text: it.ubicacion || '', fontSize: 8 },
          { text: String(it.cantidad ?? ''), fontSize: 8 },
          { text: String(it.cantidad_afectada || 0), fontSize: 8 },
          { text: (it.no_registrado ? 'NO REG · ' : '') + (it.condicion_observada || ''), fontSize: 8 },
          { text: it.dictamen ? (DICT_LABEL[it.dictamen] || it.dictamen) : 'Pendiente', fontSize: 8 },
        ]),
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 16],
  });

  content.push({
    columns: [
      { stack: [{ text: '_______________________________', margin: [0, 20, 0, 0] }, { text: informe.analista_nombre || 'Nombre / Firma', bold: true }, { text: 'Analista — Monitoreo', fontSize: 9, color: '#64748b' }] },
      { stack: [{ text: '_______________________________', margin: [0, 20, 0, 0] }, { text: 'Nombre / Firma', bold: true }, { text: 'Calidad — Dictamen', fontSize: 9, color: '#64748b' }] },
    ],
    columnGap: 24,
  });

  pdfMake.createPdf({
    pageMargins: isoPageMargins,
    header: isoPdfHeader('monitoreo'),
    footer: isoPdfFooter('monitoreo'),
    content,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: true, margin: [0, 10, 0, 4] },
    },
  }).download(`${informe.numero || 'Informe_Monitoreo'}.pdf`);
}
