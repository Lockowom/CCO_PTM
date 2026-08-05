const value = (input) => {
  if (input === null || input === undefined || input === '') return '—';
  return String(input);
};

const dateValue = (input) => {
  if (!input) return '—';
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return String(input).slice(0, 10);
  return parsed.toLocaleDateString('es-CL');
};

const numberValue = (input) => (input === null || input === undefined ? '—' : String(input));

const sectionTitle = (text) => ({ text, style: 'sectionTitle' });

const simpleTable = (headers, rows, widths) => ({
  table: {
    headerRows: 1,
    widths,
    body: [
      headers.map((header) => ({ text: header, style: 'tableHeader' })),
      ...rows.map((row) => row.map((cell) => ({ text: value(cell), style: 'tableCell' })))
    ]
  },
  layout: 'lightHorizontalLines',
  margin: [0, 0, 0, 12]
});

export async function exportPanelDashboardPDF({
  range,
  kpis,
  estadoTable = [],
  weekly = [],
  leadTime = [],
  tiemposCiclo,
  otif,
  divisions = [],
  transportistas = [],
  rankTransp = [],
  rankVend = [],
  alertas = {},
  alertasOperacionales = [],
  calidad = {},
  operaciones = []
}) {
  const pdfMakeMod = await import('pdfmake/build/pdfmake');
  const pdfFontsMod = await import('pdfmake/build/vfs_fonts');
  const pdfMake = pdfMakeMod.default || pdfMakeMod;
  const fonts = pdfFontsMod.default || pdfFontsMod;
  pdfMake.vfs = fonts.pdfMake?.vfs || fonts.vfs || pdfMake.vfs;

  const generatedAt = new Date().toLocaleString('es-CL');
  const rangeLabel = `${range?.from || 'Inicio'} al ${range?.to || 'Hoy'}`;
  const content = [
    { text: 'INFORME OPERACIONAL - PANEL PTM', style: 'title' },
    { text: `Período filtrado: ${rangeLabel}`, style: 'subtitle' },
    { text: `Generado: ${generatedAt} | N.V. incluidas: ${operaciones.length}`, style: 'metadata' },
    sectionTitle('Resumen ejecutivo'),
    simpleTable(
      ['Indicador', 'Resultado', 'Indicador', 'Resultado'],
      [
        ['N.V. totales', kpis?.total, 'N.V. activas (vista actual)', kpis?.activas],
        ['Entregadas', kpis?.entregadas, 'Tasa de entrega', `${kpis?.tasaEntrega ?? '0'}%`],
        [
          'A tiempo',
          `${kpis?.pctAtiempo ?? '0'}%`,
          'Tardanza promedio',
          `${kpis?.leadTimeTardanza ?? '0'} días`
        ],
        [
          'Incidencias activas',
          kpis?.incidencias,
          'OTIF',
          otif?.pct === null || otif?.pct === undefined ? '—' : `${otif.pct}%`
        ],
        [
          'Fill rate shipping',
          kpis?.fillRateShipping?.pct === null || kpis?.fillRateShipping?.pct === undefined
            ? '—'
            : `${kpis.fillRateShipping.pct}%`,
          'Cumplimiento N.V.',
          kpis?.cumplimientoNV?.pct === null || kpis?.cumplimientoNV?.pct === undefined
            ? '—'
            : `${kpis.cumplimientoNV.pct}%`
        ]
      ],
      ['27%', '23%', '27%', '23%']
    ),
    sectionTitle('Estado de las N.V.'),
    simpleTable(
      ['Estado', 'PTM', 'Orange', 'Farmapack', 'Varios', 'Total'],
      estadoTable.map((item) => [
        item.estado,
        item.ptm,
        item.orange,
        item.farmapack,
        item.varios,
        item.total
      ]),
      ['*', 'auto', 'auto', 'auto', 'auto', 'auto']
    ),
    sectionTitle('Tendencia y tiempos de ciclo'),
    simpleTable(
      ['Semana', 'Aprobadas', 'Entregadas', 'Tardanza promedio', 'Fill rate'],
      weekly.map((item) => [
        item.semana,
        item.aprobadas,
        item.entregadas,
        `${numberValue(item.tardanza)} días`,
        `${numberValue(item.fillRate)}%`
      ]),
      ['*', 'auto', 'auto', 'auto', 'auto']
    ),
    simpleTable(
      ['Etapa', 'Promedio', 'N.V. evaluadas'],
      (tiemposCiclo?.etapas || []).map((item) => [
        item.nombre,
        item.dias === null ? '—' : `${item.dias} días`,
        item.n
      ]),
      ['*', 'auto', 'auto']
    ),
    ...(leadTime.length
      ? [
          simpleTable(
            ['Semana', 'Tardanza promedio', 'N.V. evaluadas', 'A tiempo'],
            leadTime.map((item) => [
              item.semana,
              `${numberValue(item.dias)} días`,
              item.count,
              `${numberValue(item.pctAtiempo)}%`
            ]),
            ['*', 'auto', 'auto', 'auto']
          )
        ]
      : []),
    sectionTitle('Alertas y calidad de datos'),
    simpleTable(
      ['Alertas vencidas', 'Vencen hoy', 'Vencen mañana', 'Total alertas', 'Problemas de calidad'],
      [
        [
          alertas.vencidos || 0,
          alertas.hoy || 0,
          alertas.manana || 0,
          alertas.total || 0,
          calidad.total || 0
        ]
      ],
      ['20%', '20%', '20%', '20%', '20%']
    )
  ];

  if (alertas.detalle?.length) {
    content.push(sectionTitle('Detalle de alertas de riesgo'));
    content.push(
      simpleTable(
        ['N.V.', 'Cliente', 'Estado', 'Transportista', 'Fecha compromiso', 'Días vencido'],
        alertas.detalle.map((item) => [
          item.nv,
          item.cliente,
          item.estado,
          item.transportista,
          dateValue(item.fecha_compromiso),
          item.diasVencido
        ]),
        ['auto', '*', 'auto', '*', 'auto', 'auto']
      )
    );
  }

  if (alertasOperacionales.length) {
    content.push(sectionTitle('N.V. estancadas por estado'));
    content.push(
      simpleTable(
        ['Estado', 'Cantidad', 'Muestra de N.V.'],
        alertasOperacionales.map((item) => [
          item.estado,
          item.cantidad,
          (item.nvs || []).join(', ')
        ]),
        ['30%', '15%', '55%']
      )
    );
  }

  content.push(sectionTitle('Distribución y rankings'));
  content.push(
    simpleTable(
      ['División', 'Cantidad', 'Transportista', 'Cantidad'],
      Array.from({ length: Math.max(divisions.length, transportistas.length) }, (_, index) => [
        divisions[index]?.division || '—',
        divisions[index]?.cantidad ?? '—',
        transportistas[index]?.transportista || '—',
        transportistas[index]?.cantidad ?? '—'
      ]),
      ['35%', '15%', '35%', '15%']
    )
  );
  content.push(
    simpleTable(
      ['Transportista', 'Total', 'Entregadas', '% a tiempo', 'Tardanza'],
      rankTransp.map((item) => [
        item.nombre,
        item.total,
        item.entregadas,
        item.pctATiempo === null ? '—' : `${item.pctATiempo}%`,
        item.tardanzaProm === null ? '—' : `${item.tardanzaProm} días`
      ]),
      ['*', 'auto', 'auto', 'auto', 'auto']
    )
  );
  content.push(
    simpleTable(
      ['Vendedor', 'Total', 'Entregadas', 'Activas', 'Reabiertas', 'Errores activos'],
      rankVend.map((item) => [
        item.nombre,
        item.total,
        item.entregadas,
        item.activas,
        item.reabiertas,
        item.erroresActivos
      ]),
      ['*', 'auto', 'auto', 'auto', 'auto', 'auto']
    )
  );

  content.push({
    text: 'Detalle completo de N.V. del período filtrado',
    style: 'sectionTitle',
    pageBreak: 'before'
  });
  content.push(
    simpleTable(
      [
        'N.V.',
        'Canal',
        'Cliente',
        'Vendedor',
        'Estado',
        'Transportista',
        'División',
        'Aprobación',
        'Compromiso',
        'Despacho',
        'Entregado'
      ],
      operaciones.map((item) => [
        item.nv,
        item.canal,
        item.cliente,
        item.vendedor,
        item.estado,
        item.transportista,
        item.division,
        dateValue(item.fecha_aprobacion),
        dateValue(item.fecha_compromiso),
        dateValue(item.fecha_despacho),
        dateValue(item.fecha_entregado)
      ]),
      [34, 35, 105, 75, 65, 85, 60, 52, 52, 52, 52]
    )
  );

  const incidentRows = operaciones.filter(
    (item) => item.incidencia || item.reabierta || item.urgente
  );
  if (incidentRows.length) {
    content.push({
      text: 'Observaciones operacionales asociadas',
      style: 'sectionTitle',
      pageBreak: 'before'
    });
    content.push(
      simpleTable(
        ['N.V.', 'Guía', 'Factura', 'Urgente', 'Reabierta', 'Incidencia / observación'],
        incidentRows.map((item) => [
          item.nv,
          item.guia,
          item.factura,
          item.urgente ? 'Sí' : 'No',
          item.reabierta ? `Sí - ${item.motivo_reapertura || 'sin motivo'}` : 'No',
          [item.incidencia, item.estado_incidencia, item.observaciones_incidencia]
            .filter(Boolean)
            .join(' | ') || '—'
        ]),
        ['auto', 'auto', 'auto', 'auto', '25%', '*']
      )
    );
  }

  pdfMake
    .createPdf({
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [28, 48, 28, 38],
      header: () => ({
        text: 'CCO - Panel PTM',
        margin: [28, 18, 28, 0],
        fontSize: 8,
        color: '#64748b'
      }),
      footer: (currentPage, pageCount) => ({
        text: `Informe operacional | ${rangeLabel} | Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        margin: [0, 8, 0, 0],
        fontSize: 8,
        color: '#64748b'
      }),
      content,
      defaultStyle: { fontSize: 8, color: '#1f2937' },
      styles: {
        title: {
          fontSize: 18,
          bold: true,
          color: '#0f172a',
          alignment: 'center',
          margin: [0, 0, 0, 4]
        },
        subtitle: { fontSize: 10, color: '#475569', alignment: 'center', margin: [0, 0, 0, 2] },
        metadata: { fontSize: 8, color: '#64748b', alignment: 'center', margin: [0, 0, 0, 14] },
        sectionTitle: { fontSize: 12, bold: true, color: '#163D63', margin: [0, 10, 0, 5] },
        tableHeader: {
          bold: true,
          fontSize: 7,
          color: '#ffffff',
          fillColor: '#163D63',
          margin: [3, 3, 3, 3]
        },
        tableCell: { fontSize: 7, margin: [3, 3, 3, 3] }
      }
    })
    .download(`Panel_PTM_${range?.from || 'inicio'}_${range?.to || 'hoy'}.pdf`);
}
