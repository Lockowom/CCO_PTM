const NA = '—';
const text = (value) =>
  value === null || value === undefined || value === '' ? NA : String(value);
const pct = (value) => (value === null || value === undefined ? NA : `${value}%`);
const days = (value) => (value === null || value === undefined ? NA : `${value} días`);
const shippingLabel = (value) =>
  value === 'REZAGADA_COMERCIAL'
    ? 'Rezagada comercial'
    : value === 'RETIRO_CLIENTE'
      ? 'Retiro de cliente'
      : value || '';

const orange = '#f57c00';
const navy = '#0d1b2a';
const border = '#e5e7eb';

const table = (headers, rows, widths) => ({
  table: {
    headerRows: 1,
    widths,
    body: [
      headers.map((item) => ({ text: item, style: 'headerCell' })),
      ...rows.map((row) => row.map((item) => ({ text: text(item), style: 'cell' })))
    ]
  },
  layout: {
    hLineColor: () => border,
    vLineColor: () => border,
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5
  },
  margin: [0, 0, 0, 10]
});

const card = (label, value, note, color = navy) => ({
  table: {
    widths: ['*'],
    body: [
      [
        {
          fillColor: '#ffffff',
          margin: [9, 8, 9, 8],
          stack: [
            { text: label.toUpperCase(), fontSize: 6.5, bold: true, color: '#64748b' },
            { text: text(value), fontSize: 17, bold: true, color, margin: [0, 5, 0, 2] },
            { text: note || '', fontSize: 6.5, color: '#94a3b8' }
          ]
        }
      ]
    ]
  },
  layout: {
    hLineColor: () => border,
    vLineColor: () => border,
    hLineWidth: () => 0.6,
    vLineWidth: () => 0.6
  }
});

export async function downloadPanelDashboardPDF({
  range,
  kpis,
  estadoTable = [],
  resumen = [],
  weekly = [],
  leadTime = [],
  tiemposCiclo,
  alertas = {},
  calidad = {},
  alertasOperacionales = [],
  rankTransp = [],
  rankVend = [],
  divisions = [],
  operaciones = [],
  shippingPausadas = []
}) {
  const pdfMakeMod = await import('pdfmake/build/pdfmake');
  const pdfFontsMod = await import('pdfmake/build/vfs_fonts');
  const pdfMake = pdfMakeMod.default || pdfMakeMod;
  const fonts = pdfFontsMod.default || pdfFontsMod;
  pdfMake.vfs = fonts.pdfMake?.vfs || fonts.vfs || pdfMake.vfs;

  const rangeLabel = `${range?.from || 'Inicio'} al ${range?.to || 'Hoy'}`;
  const now = new Date().toLocaleString('es-CL');
  const content = [
    {
      columns: [
        {
          width: 30,
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'PTM',
                  bold: true,
                  color: '#ffffff',
                  alignment: 'center',
                  margin: [0, 7, 0, 7],
                  fillColor: orange
                }
              ]
            ]
          },
          layout: 'noBorders'
        },
        {
          width: '*',
          margin: [9, 0, 0, 0],
          stack: [
            { text: 'PANEL\nDASHBOARD', bold: true, fontSize: 14, color: navy },
            { text: 'RESUMEN OPERACIONAL', fontSize: 6.5, color: '#94a3b8' }
          ]
        },
        {
          width: 'auto',
          alignment: 'right',
          stack: [
            { text: 'PERÍODO FILTRADO', fontSize: 6.5, bold: true, color: '#94a3b8' },
            { text: rangeLabel, fontSize: 9, bold: true, color: navy },
            { text: `Actualizado: ${now}`, fontSize: 6.5, color: '#94a3b8', margin: [0, 3, 0, 0] }
          ]
        }
      ],
      margin: [0, 0, 0, 14]
    },
    {
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            {
              text: [
                { text: 'N.V. PTM\n', style: 'tiny' },
                { text: text(kpis?.countNvPtm), style: 'nota' }
              ],
              margin: [8, 8, 8, 8]
            },
            {
              text: [
                { text: 'N.V. ORANGE\n', style: 'tiny' },
                { text: text(kpis?.nvOrange), style: 'nota' }
              ],
              margin: [8, 8, 8, 8]
            },
            {
              text: [
                { text: 'N.V. FARMAPACK\n', style: 'tiny' },
                { text: text(kpis?.nvFarmapack), style: 'nota' }
              ],
              margin: [8, 8, 8, 8]
            },
            {
              text: [
                { text: 'VARIOS\n', style: 'tiny' },
                { text: text(kpis?.nvVarios), style: 'nota' }
              ],
              margin: [8, 8, 8, 8]
            }
          ]
        ]
      },
      layout: {
        hLineColor: () => border,
        vLineColor: () => border,
        hLineWidth: () => 0.6,
        vLineWidth: () => 0.6
      },
      margin: [0, 0, 0, 12]
    },
    {
      columns: [
        card('N.V. activas', kpis?.activas, 'Backlog en vivo - no depende del rango', '#1264c5'),
        card('Tardanza prom.', days(kpis?.leadTimeTardanza), 'Solo entregas tardías', '#e11d48'),
        card('A tiempo', pct(kpis?.pctAtiempo), 'Entregado según compromiso', '#15803d'),
        card(
          'Fill rate',
          pct(kpis?.fillRateShipping?.pct),
          'Salida de En Proceso según compromiso',
          orange
        ),
        card(
          'Shipping pausadas',
          kpis?.shippingPausadas?.total || 0,
          `${kpis?.shippingPausadas?.rezagadaComercial || 0} comercial · ${kpis?.shippingPausadas?.retiroCliente || 0} retiro · ${kpis?.shippingPausadas?.excluidasSla || 0} excluidas de SLA`,
          '#7c3aed'
        )
      ],
      columnGap: 7,
      margin: [0, 0, 0, 12]
    },
    {
      text: calidad?.total
        ? `⚠ Datos con ${calidad.total} observación(es) de calidad.`
        : '✓ Datos consistentes - sin problemas detectados',
      color: calidad?.total ? '#b45309' : '#15803d',
      fillColor: calidad?.total ? '#fffbeb' : '#ecfdf5',
      margin: [8, 7, 8, 7],
      fontSize: 8,
      bold: true
    },
    { text: 'ESTADO DE NOTAS DE VENTA', style: 'section' },
    table(
      ['Estado', 'N.V. PTM', 'N.V. Orange', 'N.V. Farmapack', 'Varios', 'Total'],
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
    { text: 'ENTRADAS VS SALIDAS REALES POR SEMANA', style: 'section' },
    {
      text: 'Aprobadas por fecha de aprobación. Entregadas por fecha real de entrega. Promedio diario calculado sobre 5 días hábiles.',
      fontSize: 6.5,
      color: '#64748b',
      margin: [0, 0, 0, 4]
    },
    table(
      [
        'Semana',
        'Aprobadas',
        'Prom./día',
        'Entregadas',
        'Prom./día',
        'Balance cola',
        'Tardanza',
        'Fill rate'
      ],
      weekly.map((item) => [
        item.semana,
        item.aprobadas,
        item.aprobadasDia,
        item.entregadas,
        item.entregadasDia,
        item.balanceCola >= 0 ? `-${item.balanceCola}` : `+${Math.abs(item.balanceCola)}`,
        days(item.tardanza),
        pct(item.fillRate)
      ]),
      ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']
    ),
    { text: 'TARDANZA PROMEDIO POR SEMANA', style: 'section' },
    table(
      ['Semana', 'Tardanza (días)', '% a tiempo', 'N.V. evaluadas'],
      leadTime.map((item) => [item.semana, item.dias, pct(item.pctAtiempo), item.count]),
      ['*', 'auto', 'auto', 'auto']
    ),
    { text: 'TIEMPOS DE CICLO', style: 'section' },
    table(
      ['Etapa', 'Días promedio', 'N.V. evaluadas'],
      (tiemposCiclo?.etapas || []).map((item) => [
        item.nombre,
        item.dias === null ? NA : days(item.dias),
        item.n
      ]),
      ['*', 'auto', 'auto']
    )
  ];

  if (alertasOperacionales.length) {
    content.push({ text: 'ALERTAS OPERACIONALES', style: 'section' });
    content.push(
      table(
        ['Vencidas', 'Vencen hoy', 'Vencen mañana', 'Total'],
        [[alertas.vencidos || 0, alertas.hoy || 0, alertas.manana || 0, alertas.total || 0]],
        ['25%', '25%', '25%', '25%']
      )
    );
    content.push(
      table(
        ['Estado', 'N.V. estancadas', 'Muestra'],
        alertasOperacionales.map((item) => [
          item.estado,
          item.cantidad,
          (item.nvs || []).join(', ')
        ]),
        ['30%', '20%', '50%']
      )
    );
  }
  content.push({ text: 'SHIPPING PAUSADAS — BACKLOG EN VIVO', style: 'section' });
  content.push({
    text: 'Este bloque es una fotografía operacional al momento de descargar y no depende del rango de aprobación seleccionado.',
    fontSize: 6.5,
    color: '#64748b',
    margin: [0, 0, 0, 4]
  });
  content.push(
    table(
      ['N.V.', 'Cliente', 'Subestado', 'Pausa desde', 'Motivo', 'Medición SLA'],
      shippingPausadas.map((item) => [
        item.nv,
        item.cliente,
        shippingLabel(item.shipping_subestado),
        item.shipping_pausa_desde ? String(item.shipping_pausa_desde).slice(0, 10) : NA,
        item.shipping_pausa_motivo || NA,
        item.shipping_pausa_elegible_sla ? 'Excluida temporalmente' : 'Contabiliza'
      ]),
      [45, 120, 80, 60, '*', 85]
    )
  );
  content.push({ text: 'RANKINGS Y DISTRIBUCIÓN', style: 'section' });
  content.push(
    table(
      ['Transportista', 'N.V.', '% a tiempo', 'Tardanza'],
      rankTransp.map((item) => [
        item.nombre,
        item.total,
        pct(item.pctATiempo),
        days(item.tardanzaProm)
      ]),
      ['*', 'auto', 'auto', 'auto']
    )
  );
  content.push(
    table(
      ['Vendedor', 'N.V.', 'Activas', 'Reab.', 'Errores', '% a tiempo'],
      rankVend.map((item) => [
        item.nombre,
        item.total,
        item.activas,
        item.reabiertas,
        item.erroresActivos,
        pct(item.pctATiempo)
      ]),
      ['*', 'auto', 'auto', 'auto', 'auto', 'auto']
    )
  );
  content.push(
    table(
      ['División', 'Cantidad', 'Estado activo', 'Cantidad'],
      Array.from({ length: Math.max(divisions.length, resumen.length) }, (_, index) => [
        divisions[index]?.division || NA,
        divisions[index]?.cantidad ?? NA,
        resumen[index]?.estado || NA,
        resumen[index]?.count ?? NA
      ]),
      ['35%', '15%', '35%', '15%']
    )
  );

  content.push({
    text: 'DETALLE DE N.V. DEL PERÍODO FILTRADO',
    style: 'section',
    pageBreak: 'before'
  });
  content.push(
    table(
      [
        'N.V.',
        'Canal',
        'Cliente',
        'Vendedor',
        'Estado',
        'Transportista',
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
        item.shipping_subestado
          ? `${item.estado} · ${shippingLabel(item.shipping_subestado)}`
          : item.estado,
        item.transportista,
        item.fecha_aprobacion ? String(item.fecha_aprobacion).slice(0, 10) : NA,
        item.fecha_compromiso ? String(item.fecha_compromiso).slice(0, 10) : NA,
        item.fecha_despacho ? String(item.fecha_despacho).slice(0, 10) : NA,
        item.fecha_entregado ? String(item.fecha_entregado).slice(0, 10) : NA
      ]),
      [34, 35, 115, 75, 65, 85, 52, 52, 52, 52]
    )
  );

  pdfMake
    .createPdf({
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [22, 24, 22, 26],
      content,
      footer: (currentPage, pageCount) => ({
        text: `CCO | Panel PTM | ${rangeLabel} | Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        color: '#94a3b8',
        fontSize: 7,
        margin: [0, 5, 0, 0]
      }),
      defaultStyle: { fontSize: 8, color: navy },
      styles: {
        tiny: { fontSize: 6.5, bold: true, color: '#94a3b8' },
        nota: { fontSize: 14, bold: true, color: orange },
        section: { fontSize: 9, bold: true, color: navy, margin: [0, 9, 0, 4] },
        headerCell: {
          fontSize: 7,
          bold: true,
          color: '#ffffff',
          fillColor: orange,
          margin: [4, 4, 4, 4],
          alignment: 'center'
        },
        cell: { fontSize: 7, margin: [4, 3, 4, 3], alignment: 'center' }
      }
    })
    .download(`Panel_PTM_${range?.from || 'inicio'}_${range?.to || 'hoy'}.pdf`);
}
