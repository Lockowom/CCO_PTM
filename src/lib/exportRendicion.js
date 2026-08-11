import { excelSafe } from './rendicionValidation';

const money = (value) => `$ ${Math.round(Number(value || 0)).toLocaleString('es-CL')}`;
const dateCL = (value) =>
  value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('es-CL') : '';

async function imageDataUrl(url) {
  try {
    const blob = await fetch(url).then((response) => response.blob());
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

export async function downloadRendicionPDF(data) {
  const pdfMakeMod = await import('pdfmake/build/pdfmake');
  const pdfFontsMod = await import('pdfmake/build/vfs_fonts');
  const pdfMake = pdfMakeMod.default || pdfMakeMod;
  const fonts = pdfFontsMod.default || pdfFontsMod;
  pdfMake.vfs = fonts.pdfMake?.vfs || fonts.vfs || pdfMake.vfs;
  const logo = await imageDataUrl('/logo-ptm.png');
  const r = data.rendicion;
  const rows = [...(data.items || [])];
  while (rows.length < 15) rows.push(null);
  const body = [
    ['Nº', 'FECHA', 'Nº BOL/FAC', 'Detalle Descripción de gasto', 'CC', 'Categoría', 'Total'].map(
      (text) => ({ text, bold: true, alignment: 'center', fillColor: '#f3f4f6' })
    ),
    ...rows.map((item, index) =>
      item
        ? [
            String(index + 1),
            dateCL(item.fecha),
            excelSafe(item.numero_documento || ''),
            excelSafe(item.descripcion),
            excelSafe(r.centro_costo_codigo),
            excelSafe(item.categoria_nombre),
            { text: money(item.monto), alignment: 'right' }
          ]
        : [String(index + 1), '', '', '', '', '', '']
    )
  ];
  const evidence = await Promise.all(
    (data.fotos || [])
      .slice(0, 10)
      .map(async (photo) => ({ ...photo, image: await imageDataUrl(photo.url) }))
  );
  const evidenceImages = evidence.filter((photo) => photo.image);
  const evidenceRows = [];
  for (let index = 0; index < evidenceImages.length; index += 4) {
    evidenceRows.push({
      columns: evidenceImages.slice(index, index + 4).map((photo) => ({
        width: 120,
        stack: [
          { image: photo.image, fit: [110, 145] },
          {
            text: `Gasto ${data.items.find((i) => i.id === photo.item_id)?.orden || ''}`,
            alignment: 'center',
            margin: [0, 4]
          }
        ]
      })),
      columnGap: 8,
      margin: [0, 0, 0, 12]
    });
  }
  const doc = {
    pageSize: 'A4',
    pageMargins: [24, 24, 24, 28],
    defaultStyle: { fontSize: 8, color: '#111827' },
    content: [
      {
        table: {
          widths: [120, '*'],
          body: [
            [
              logo
                ? { image: logo, width: 105 }
                : { text: 'ptm', fontSize: 30, bold: true, color: '#f05a16' },
              {
                text: 'PLANILLA DE RENDICIÓN DE GASTOS',
                bold: true,
                alignment: 'center',
                margin: [0, 15]
              }
            ]
          ]
        },
        layout: 'noBorders'
      },
      {
        margin: [0, 12, 0, 10],
        columns: [
          {
            width: '*',
            stack: [
              { text: `RESPONSABLE RENDICIÓN     ${r.responsable_nombre}` },
              {
                text: `CENTRO DE COSTO                 ${r.centro_costo_codigo} · ${r.centro_costo_nombre}`
              },
              { text: `TIPO DE FONDO                       ${r.tipo_fondo}` },
              { text: `DETALLE                                  ${r.detalle || '—'}` }
            ],
            lineHeight: 1.45
          },
          {
            width: 185,
            stack: [
              { text: `FECHA DE LA RENDICIÓN     ${dateCL(r.fecha_rendicion)}` },
              { text: `Nº FOLIO SOLICITUD          ${r.folio_texto || r.folio}` },
              { text: `TOTAL                                 ${money(r.total)}` }
            ],
            lineHeight: 1.45
          }
        ]
      },
      {
        table: { headerRows: 1, widths: [18, 52, 62, '*', 34, 65, 58], body },
        layout: {
          hLineWidth: () => 0.7,
          vLineWidth: () => 0.7,
          hLineColor: () => '#111827',
          vLineColor: () => '#111827',
          paddingTop: () => 4,
          paddingBottom: () => 4,
          paddingLeft: () => 3,
          paddingRight: () => 3
        }
      },
      {
        table: {
          widths: ['*', 58],
          body: [
            [
              { text: 'Total General', bold: true, alignment: 'right' },
              { text: money(r.total), bold: true, alignment: 'right' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [300, 0, 0, 0]
      },
      ...(evidenceImages.length
        ? [
            {
              text: 'EVIDENCIAS ADJUNTAS',
              bold: true,
              fontSize: 12,
              pageBreak: 'before',
              margin: [0, 0, 0, 10]
            },
            ...evidenceRows
          ]
        : [])
    ],
    footer: (page, pages) => ({
      text: `${r.folio_texto || ''} · Página ${page} de ${pages}`,
      alignment: 'center',
      fontSize: 7,
      color: '#64748b'
    })
  };
  pdfMake.createPdf(doc).download(`${r.folio_texto || 'Rendicion'}.pdf`);
}

export async function downloadRendicionExcel(data) {
  const XLSXMod = await import('xlsx');
  const XLSX = XLSXMod.default || XLSXMod;
  const r = data.rendicion;
  const aoa = [
    ['ptm health care', '', 'PLANILLA DE RENDICIÓN DE GASTOS'],
    [],
    [
      'RESPONSABLE RENDICIÓN',
      excelSafe(r.responsable_nombre),
      '',
      '',
      'FECHA DE LA RENDICIÓN',
      dateCL(r.fecha_rendicion)
    ],
    [
      'CENTRO DE COSTO',
      excelSafe(`${r.centro_costo_codigo} · ${r.centro_costo_nombre}`),
      '',
      '',
      'Nº FOLIO SOLICITUD',
      excelSafe(r.folio_texto || r.folio)
    ],
    ['TIPO DE FONDO', excelSafe(r.tipo_fondo)],
    ['DETALLE', excelSafe(r.detalle || '')],
    [],
    ['Nº', 'FECHA', 'Nº BOL/FAC', 'Detalle Descripción de gasto', 'CC', 'Categoría', 'Total']
  ];
  (data.items || []).forEach((item, index) =>
    aoa.push([
      index + 1,
      new Date(`${item.fecha}T12:00:00`),
      excelSafe(item.numero_documento || ''),
      excelSafe(item.descripcion),
      excelSafe(r.centro_costo_codigo),
      excelSafe(item.categoria_nombre),
      Number(item.monto)
    ])
  );
  while (aoa.length < 23) aoa.push([aoa.length - 7, '', '', '', '', '', '']);
  aoa.push(['', '', '', '', '', 'Total General', { f: `SUM(G9:G${aoa.length})` }]);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 7 },
    { wch: 14 },
    { wch: 18 },
    { wch: 52 },
    { wch: 12 },
    { wch: 20 },
    { wch: 16 }
  ];
  ws['!merges'] = [XLSX.utils.decode_range('C1:G1'), XLSX.utils.decode_range('B6:G6')];
  for (let col = 0; col < 7; col += 1) {
    const cell = ws[XLSX.utils.encode_cell({ r: 7, c: col })];
    if (cell)
      cell.s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
        fill: { fgColor: { rgb: 'F3F4F6' } },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
  }
  for (let row = 8; row < aoa.length; row += 1) {
    const amount = ws[XLSX.utils.encode_cell({ r: row, c: 6 })];
    if (amount) amount.z = '$ #,##0';
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rendición');
  XLSX.writeFile(wb, `${r.folio_texto || 'Rendicion'}.xlsx`);
}
