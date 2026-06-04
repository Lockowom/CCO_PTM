// Exportación del "Informe de Daños / No Conformidad" a Word (.docx) y PDF.
// Las librerías pesadas (docx, pdfmake) se cargan con import dinámico para no
// inflar el bundle principal (se descargan solo al exportar).

// ── Utilidades de imágenes ─────────────────────────────────────────────────
async function fetchArrayBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  return await r.arrayBuffer();
}

async function fetchDataUrl(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  const blob = await r.blob();
  return await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
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

// Normaliza el modelo común a partir de la cabecera + reporte + hallazgos + evidencias.
function buildModel(informe, hallazgos, evidencias) {
  const rep = informe.reporte || {};
  const evByItem = {};
  (evidencias || []).forEach((ev) => {
    const k = ev.item_id || 'general';
    (evByItem[k] = evByItem[k] || []).push(ev);
  });
  return { rep, evByItem };
}

// ── Word (.docx) ────────────────────────────────────────────────────────────
export async function exportInformeDanosWord(informe, hallazgos = [], evidencias = []) {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow,
    TableCell, WidthType, ImageRun, AlignmentType,
  } = await import('docx');

  const { rep, evByItem } = buildModel(informe, hallazgos, evidencias);

  const kvRow = (k, v) => new TableRow({
    children: [
      new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: k, bold: true })] })] }),
      new TableCell({ width: { size: 65, type: WidthType.PERCENTAGE }, children: [new Paragraph(String(v ?? '—'))] }),
    ],
  });

  const children = [];
  children.push(new Paragraph({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
  if (rep.tipo_producto) children.push(new Paragraph({ text: rep.tipo_producto, alignment: AlignmentType.CENTER }));
  children.push(new Paragraph({ text: informe.numero || '', alignment: AlignmentType.CENTER }));
  children.push(new Paragraph(''));

  // Encabezado (tabla)
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      kvRow('Fecha de recepción', rep.fecha_recepcion || informe.fecha),
      kvRow('Tipo de producto', rep.tipo_producto),
      kvRow('Área responsable', rep.area_responsable),
      kvRow('Clasificación', rep.clasificacion),
      kvRow('Bodega', informe.bodega),
      kvRow('Analista', informe.analista_nombre),
    ],
  }));
  children.push(new Paragraph(''));

  const section = (title, body) => {
    children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2 }));
    if (body) children.push(new Paragraph(String(body)));
  };

  if (rep.antecedentes) section('1. ANTECEDENTES', rep.antecedentes);
  if (rep.descripcion_hallazgo) section('2. DESCRIPCIÓN DEL HALLAZGO', rep.descripcion_hallazgo);

  // Daños identificados (hallazgos + fotos)
  children.push(new Paragraph({ text: '3. DAÑOS IDENTIFICADOS', heading: HeadingLevel.HEADING_2 }));
  let i = 0;
  for (const h of hallazgos) {
    i += 1;
    const titulo = [h.componente_afectado, h.tipo_dano].filter(Boolean).join(' — ') || (h.producto || `Hallazgo ${i}`);
    children.push(new Paragraph({ text: `3.${i} ${titulo}`, heading: HeadingLevel.HEADING_3 }));
    const meta = [];
    if (h.producto || h.codigo_producto) meta.push(`Producto: ${h.producto || ''} ${h.codigo_producto ? `(${h.codigo_producto})` : ''}`.trim());
    if (h.cantidad) meta.push(`Cantidad afectada: ${h.cantidad}`);
    if (h.ubicacion) meta.push(`Ubicación: ${h.ubicacion}`);
    if (h.partida) meta.push(`Lote: ${h.partida}`);
    if (h.tipo_dano) meta.push(`Tipo de daño: ${h.tipo_dano}`);
    if (h.componente_afectado) meta.push(`Componente afectado: ${h.componente_afectado}`);
    if (h.consecuencia) meta.push(`Consecuencia: ${h.consecuencia}`);
    if (h.observaciones) meta.push(`Observaciones: ${h.observaciones}`);
    meta.forEach((m) => children.push(new Paragraph({ children: [new TextRun(m)] })));

    const fotos = evByItem[h.id] || [];
    for (const ev of fotos) {
      try {
        const data = await fetchArrayBuffer(ev.imagen_url);
        children.push(new Paragraph({ children: [new ImageRun({ data, type: 'jpg', transformation: { width: 320, height: 240 } })] }));
        if (ev.descripcion) children.push(new Paragraph({ children: [new TextRun({ text: ev.descripcion, italics: true, size: 18 })] }));
      } catch (_) { /* imagen no disponible: se omite */ }
    }
    children.push(new Paragraph(''));
  }

  // Cuadro resumen
  if (Array.isArray(rep.cuadro_resumen) && rep.cuadro_resumen.length) {
    children.push(new Paragraph({ text: '4. CUADRO RESUMEN DE HALLAZGOS', heading: HeadingLevel.HEADING_2 }));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Indicador', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Valor', bold: true })] })] }),
        ] }),
        ...rep.cuadro_resumen.map((r) => new TableRow({ children: [
          new TableCell({ children: [new Paragraph(String(r.indicador ?? ''))] }),
          new TableCell({ children: [new Paragraph(String(r.valor ?? ''))] }),
        ] })),
      ],
    }));
    children.push(new Paragraph(''));
  }

  if (rep.analisis_causa) section('5. ANÁLISIS Y CAUSA PROBABLE', rep.analisis_causa);

  if (Array.isArray(rep.acciones_recomendadas) && rep.acciones_recomendadas.length) {
    children.push(new Paragraph({ text: '6. ACCIONES RECOMENDADAS', heading: HeadingLevel.HEADING_2 }));
    rep.acciones_recomendadas.filter(Boolean).forEach((a) =>
      children.push(new Paragraph({ text: a, bullet: { level: 0 } })));
    children.push(new Paragraph(''));
  }

  // Firmas
  children.push(new Paragraph(''));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [
      new TableCell({ children: [
        new Paragraph('_______________________________'),
        new Paragraph({ children: [new TextRun({ text: rep.elaborado_por || informe.analista_nombre || 'Nombre / Firma', bold: true })] }),
        new Paragraph('Elaborado por — Control de Operaciones'),
      ] }),
      new TableCell({ children: [
        new Paragraph('_______________________________'),
        new Paragraph({ children: [new TextRun({ text: rep.revisado_por || 'Nombre / Firma', bold: true })] }),
        new Paragraph('Revisado por — Jefatura / Supervisión'),
      ] }),
    ] })],
  }));

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${informe.numero || 'Informe_Danos'}.docx`);
}

// ── PDF (pdfmake) ────────────────────────────────────────────────────────────
export async function exportInformeDanosPDF(informe, hallazgos = [], evidencias = []) {
  const pdfMakeMod = await import('pdfmake/build/pdfmake');
  const pdfFontsMod = await import('pdfmake/build/vfs_fonts');
  const pdfMake = pdfMakeMod.default || pdfMakeMod;
  const fonts = pdfFontsMod.default || pdfFontsMod;
  pdfMake.vfs = fonts.pdfMake?.vfs || fonts.vfs || pdfMake.vfs;

  const { rep, evByItem } = buildModel(informe, hallazgos, evidencias);

  const content = [];
  content.push({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', style: 'title' });
  if (rep.tipo_producto) content.push({ text: rep.tipo_producto, alignment: 'center', margin: [0, 0, 0, 2] });
  content.push({ text: informe.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' });

  const kv = (k, v) => [{ text: k, bold: true }, { text: String(v ?? '—') }];
  content.push({
    table: {
      widths: ['35%', '65%'],
      body: [
        kv('Fecha de recepción', rep.fecha_recepcion || informe.fecha),
        kv('Tipo de producto', rep.tipo_producto),
        kv('Área responsable', rep.area_responsable),
        kv('Clasificación', rep.clasificacion),
        kv('Bodega', informe.bodega),
        kv('Analista', informe.analista_nombre),
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 12],
  });

  const sec = (title, body) => {
    content.push({ text: title, style: 'h2' });
    if (body) content.push({ text: String(body), margin: [0, 0, 0, 8] });
  };

  if (rep.antecedentes) sec('1. ANTECEDENTES', rep.antecedentes);
  if (rep.descripcion_hallazgo) sec('2. DESCRIPCIÓN DEL HALLAZGO', rep.descripcion_hallazgo);

  content.push({ text: '3. DAÑOS IDENTIFICADOS', style: 'h2' });
  let i = 0;
  for (const h of hallazgos) {
    i += 1;
    const titulo = [h.componente_afectado, h.tipo_dano].filter(Boolean).join(' — ') || (h.producto || `Hallazgo ${i}`);
    content.push({ text: `3.${i} ${titulo}`, style: 'h3' });
    const meta = [];
    if (h.producto || h.codigo_producto) meta.push(`Producto: ${h.producto || ''} ${h.codigo_producto ? `(${h.codigo_producto})` : ''}`.trim());
    if (h.cantidad) meta.push(`Cantidad afectada: ${h.cantidad}`);
    if (h.ubicacion) meta.push(`Ubicación: ${h.ubicacion}`);
    if (h.partida) meta.push(`Lote: ${h.partida}`);
    if (h.tipo_dano) meta.push(`Tipo de daño: ${h.tipo_dano}`);
    if (h.componente_afectado) meta.push(`Componente afectado: ${h.componente_afectado}`);
    if (h.consecuencia) meta.push(`Consecuencia: ${h.consecuencia}`);
    if (h.observaciones) meta.push(`Observaciones: ${h.observaciones}`);
    if (meta.length) content.push({ ul: meta, margin: [0, 0, 0, 6] });

    const fotos = evByItem[h.id] || [];
    const imgs = [];
    for (const ev of fotos) {
      try {
        const dataUrl = await fetchDataUrl(ev.imagen_url);
        imgs.push({ image: dataUrl, width: 220, margin: [0, 4, 8, 4] });
      } catch (_) { /* omitir */ }
    }
    if (imgs.length) content.push({ columns: imgs, columnGap: 8, margin: [0, 0, 0, 8] });
  }

  if (Array.isArray(rep.cuadro_resumen) && rep.cuadro_resumen.length) {
    content.push({ text: '4. CUADRO RESUMEN DE HALLAZGOS', style: 'h2' });
    content.push({
      table: {
        widths: ['70%', '30%'],
        body: [
          [{ text: 'Indicador', bold: true }, { text: 'Valor', bold: true }],
          ...rep.cuadro_resumen.map((r) => [String(r.indicador ?? ''), String(r.valor ?? '')]),
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12],
    });
  }

  if (rep.analisis_causa) sec('5. ANÁLISIS Y CAUSA PROBABLE', rep.analisis_causa);

  if (Array.isArray(rep.acciones_recomendadas) && rep.acciones_recomendadas.length) {
    content.push({ text: '6. ACCIONES RECOMENDADAS', style: 'h2' });
    content.push({ ul: rep.acciones_recomendadas.filter(Boolean), margin: [0, 0, 0, 12] });
  }

  content.push({
    columns: [
      { stack: [{ text: '_______________________________', margin: [0, 20, 0, 0] }, { text: rep.elaborado_por || informe.analista_nombre || 'Nombre / Firma', bold: true }, { text: 'Elaborado por — Control de Operaciones', fontSize: 9, color: '#64748b' }] },
      { stack: [{ text: '_______________________________', margin: [0, 20, 0, 0] }, { text: rep.revisado_por || 'Nombre / Firma', bold: true }, { text: 'Revisado por — Jefatura / Supervisión', fontSize: 9, color: '#64748b' }] },
    ],
    columnGap: 24,
  });

  const docDefinition = {
    content,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: true, margin: [0, 10, 0, 4] },
      h3: { fontSize: 11, bold: true, margin: [0, 6, 0, 2] },
    },
  };

  pdfMake.createPdf(docDefinition).download(`${informe.numero || 'Informe_Danos'}.pdf`);
}
