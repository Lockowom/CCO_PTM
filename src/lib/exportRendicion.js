import { cleanHumanText, excelSafe } from './rendicionValidation.js';

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

const printable = (value) => cleanHumanText(value) || '-';
const fieldRows = (rows, labelWidth = 110) => ({
  table: {
    widths: [labelWidth, '*'],
    body: rows.map(([label, value]) => [
      {
        text: label,
        bold: true,
        fontSize: 7,
        border: [false, false, false, false],
        margin: [0, 1.3, 4, 0]
      },
      {
        text: printable(value),
        fontSize: 8.4,
        border: [false, false, false, true],
        borderColor: ['#111111', '#111111', '#111111', '#111111'],
        margin: [0, 1.3, 0, 0]
      }
    ])
  },
  layout: {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 1,
    paddingBottom: () => 1
  }
});

export function buildRendicionPdfDefinition(data, options = {}) {
  const logo = options.logo || '';
  const evidenceImages = options.evidenceImages || [];
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
  return {
    pageSize: 'A4',
    pageMargins: [20, 18, 20, 28],
    defaultStyle: { fontSize: 8, color: '#111827' },
    background: (page, pageSize) =>
      page === 1
        ? {
            canvas: [
              {
                type: 'rect',
                x: 8,
                y: 8,
                w: pageSize.width - 16,
                h: pageSize.height - 22,
                lineWidth: 1,
                lineColor: '#111111'
              }
            ]
          }
        : null,
    content: [
      {
        table: {
          widths: [135, '*'],
          body: [
            [
              logo
                ? { image: logo, width: 120, margin: [4, 0, 0, 2] }
                : { text: 'ptm health care', fontSize: 24, bold: true, color: '#f05a16' },
              {
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: 'PLANILLA DE RENDICIÓN DE GASTOS',
                        bold: true,
                        alignment: 'center',
                        fontSize: 9,
                        margin: [0, 2]
                      }
                    ]
                  ]
                },
                layout: {
                  hLineWidth: () => 0.8,
                  vLineWidth: () => 0.8,
                  hLineColor: () => '#111111',
                  vLineColor: () => '#111111',
                  paddingLeft: () => 4,
                  paddingRight: () => 4,
                  paddingTop: () => 0,
                  paddingBottom: () => 0
                },
                margin: [20, 3, 54, 0]
              }
            ]
          ]
        },
        layout: 'noBorders'
      },
      {
        margin: [0, 6, 0, 10],
        columns: [
          {
            width: '*',
            stack: [
              fieldRows(
                [
                  ['RESPONSABLE RENDICIÓN', r.responsable_nombre],
                  ['RUT DEL RESPONSABLE', r.responsable_rut],
                  ['DIRECCIÓN - ÁREA', r.direccion_area],
                  ['UNIDAD', r.unidad],
                  ['CENTRO DE COSTO', r.centro_costo_nombre],
                  ['TÉCNICO', r.tecnico],
                  ['DETALLE', r.detalle]
                ],
                112
              )
            ]
          },
          {
            width: 190,
            stack: [
              fieldRows(
                [
                  ['FECHA DE LA RENDICIÓN', dateCL(r.fecha_rendicion)],
                  ['Nº FOLIO SOLICITUD', r.folio_texto || r.folio],
                  ['FONDO POR RENDIR', r.tipo_fondo === 'Fondo por rendir' ? money(r.total) : '-']
                ],
                98
              )
            ]
          }
        ],
        columnGap: 22
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
}

export async function downloadRendicionPDF(data) {
  const pdfMakeMod = await import('pdfmake/build/pdfmake');
  const pdfFontsMod = await import('pdfmake/build/vfs_fonts');
  const pdfMake = pdfMakeMod.default || pdfMakeMod;
  const fonts = pdfFontsMod.default || pdfFontsMod;
  const r = data.rendicion;
  pdfMake.vfs = fonts.pdfMake?.vfs || fonts.vfs || pdfMake.vfs;
  const logo = await imageDataUrl('/logo-ptm.png');
  const evidence = await Promise.all(
    (data.fotos || [])
      .slice(0, 10)
      .map(async (photo) => ({ ...photo, image: await imageDataUrl(photo.url) }))
  );
  const doc = buildRendicionPdfDefinition(data, {
    logo,
    evidenceImages: evidence.filter((photo) => photo.image)
  });
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
      'RUT DEL RESPONSABLE',
      excelSafe(r.responsable_rut || ''),
      '',
      '',
      'Nº FOLIO SOLICITUD',
      excelSafe(r.folio_texto || r.folio)
    ],
    [
      'DIRECCIÓN - ÁREA',
      excelSafe(r.direccion_area || ''),
      '',
      '',
      'FONDO POR RENDIR',
      r.tipo_fondo === 'Fondo por rendir' ? Number(r.total) : ''
    ],
    ['UNIDAD', excelSafe(r.unidad || '')],
    ['CENTRO DE COSTO', excelSafe(r.centro_costo_nombre || '')],
    ['TÉCNICO', excelSafe(r.tecnico || '')],
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
  const firstItemRow = 12;
  while (aoa.length < firstItemRow - 1 + 15)
    aoa.push([aoa.length - (firstItemRow - 2), '', '', '', '', '', '']);
  aoa.push([
    '',
    '',
    '',
    '',
    '',
    'Total General',
    { f: `SUM(G${firstItemRow}:G${firstItemRow + 14})` }
  ]);
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
  ws['!merges'] = [XLSX.utils.decode_range('C1:G1'), XLSX.utils.decode_range('B9:G9')];
  for (let col = 0; col < 7; col += 1) {
    const cell = ws[XLSX.utils.encode_cell({ r: firstItemRow - 2, c: col })];
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
  for (let row = firstItemRow - 1; row < aoa.length; row += 1) {
    const amount = ws[XLSX.utils.encode_cell({ r: row, c: 6 })];
    if (amount) amount.z = '$ #,##0';
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rendición');
  XLSX.writeFile(wb, `${r.folio_texto || 'Rendicion'}.xlsx`);
}
