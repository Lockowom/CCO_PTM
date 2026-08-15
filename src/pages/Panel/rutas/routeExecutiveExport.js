const number = (value, digits = 0) =>
  Number(value || 0).toLocaleString('es-CL', { maximumFractionDigits: digits });

export async function exportRouteAnalyticsExcel(data) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const summary = data.summary || {};
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['HISTORICO DE DESPACHOS - PTM'],
      ['N.V.', summary.nvs || 0],
      ['Despachos', summary.despachos || 0],
      ['Bultos', summary.bultos || 0],
      ['Kilos', summary.kilos || 0],
      ['Kg/despacho', summary.kg_despacho || 0],
      ['Bultos/despacho', summary.bultos_despacho || 0],
      [],
      ['Nota', data.quality?.nota_volumen || 'Peso no equivale a volumen.']
    ]),
    'Resumen'
  );
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.carriers || []), 'Transportistas');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.destinations || []), 'Destinos');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.weights || []), 'Rangos peso');
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(data.weight_destination || []),
    'Peso x destino'
  );
  XLSX.writeFile(wb, `historico-despachos-ptm-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportRouteAnalyticsPdf(data, findings = []) {
  const [pdfMakeMod, pdfFontsMod] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts')
  ]);
  const pdfMake = pdfMakeMod.default || pdfMakeMod;
  const pdfFonts = pdfFontsMod.default || pdfFontsMod;
  pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs || pdfMake.vfs;
  const s = data.summary || {};
  const top = (data.destinations || []).slice(0, 5);
  const weights = data.weights || [];
  const mainCarrier = data.carriers?.[0];
  const table = (headers, rows, widths) => ({
    table: {
      headerRows: 1,
      widths,
      body: [headers.map((x) => ({ text: x, style: 'th' })), ...rows]
    },
    layout: {
      fillColor: (row) => (row === 0 ? '#f97316' : row % 2 ? '#f8fafc' : null),
      hLineColor: '#cbd5e1',
      vLineColor: '#cbd5e1'
    }
  });
  const doc = {
    pageSize: 'A4',
    pageMargins: [28, 26, 28, 24],
    content: [
      { text: 'HISTÓRICO DE DESPACHOS — PTM', style: 'title' },
      {
        text: `Diagnóstico privado · ${s.desde || 'sin inicio'} a ${s.hasta || 'sin cierre'}`,
        style: 'sub'
      },
      {
        columns: [
          {
            text: `OPERACIÓN\n${number(s.nvs)} N.V.\n${number(s.despachos)} despachos\n${number(s.bultos)} bultos\n${number(s.kilos, 1)} kg`,
            style: 'kpi'
          },
          {
            text: `PROMEDIOS\n${number(s.kg_despacho, 1)} kg/despacho\n${number(s.bultos_despacho, 1)} bultos/despacho`,
            style: 'kpi'
          },
          {
            text: `TRANSPORTE\nPrincipal: ${mainCarrier?.transportista || 'Sin datos'}\n${number(mainCarrier?.porcentaje, 1)}% participación`,
            style: 'kpi'
          }
        ],
        columnGap: 8,
        margin: [0, 12, 0, 12]
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'DESTINOS PRINCIPALES', style: 'h2' },
              table(
                ['Destino', 'N.V.', 'Desp.', 'Kg'],
                top.map((x) => [x.destino, number(x.nvs), number(x.despachos), number(x.kilos, 1)]),
                ['*', 36, 38, 52]
              )
            ]
          },
          {
            width: '*',
            stack: [
              { text: 'PERFIL DE CARGA', style: 'h2' },
              table(
                ['Rango', 'Desp.', '%'],
                weights.map((x) => [
                  x.tramo_peso,
                  number(x.despachos),
                  `${number(x.porcentaje, 1)}%`
                ]),
                ['*', 42, 42]
              )
            ]
          }
        ],
        columnGap: 12
      },
      { text: 'HALLAZGOS', style: 'h2', margin: [0, 14, 0, 4] },
      { ul: findings.slice(0, 5).map((x) => ({ text: x, margin: [0, 1] })) },
      { text: 'LIMITACIÓN CLAVE', style: 'warningTitle', margin: [0, 12, 0, 3] },
      {
        text:
          data.quality?.nota_volumen ||
          'No hay dimensiones históricas completas. Peso no equivale a volumen.',
        style: 'warning'
      },
      {
        text: 'Fase 2: capturar NV · bultos · peso · largo · ancho · alto · m³ · destino · transportista · costo.',
        style: 'footer'
      }
    ],
    styles: {
      title: { fontSize: 18, bold: true, color: '#0f172a' },
      sub: { fontSize: 8, color: '#64748b' },
      kpi: { fontSize: 9, bold: true, color: '#0f172a', fillColor: '#f8fafc', margin: 8 },
      h2: { fontSize: 9, bold: true, color: '#0f172a' },
      th: { bold: true, color: 'white', fontSize: 7 },
      warningTitle: { fontSize: 8, bold: true, color: '#b45309' },
      warning: { fontSize: 8, color: '#92400e', fillColor: '#fff7ed', margin: 6 },
      footer: { fontSize: 7, color: '#64748b', margin: [0, 8, 0, 0] }
    },
    defaultStyle: { fontSize: 7, color: '#334155' }
  };
  pdfMake
    .createPdf(doc)
    .download(`historico-despachos-ptm-${new Date().toISOString().slice(0, 10)}.pdf`);
}
