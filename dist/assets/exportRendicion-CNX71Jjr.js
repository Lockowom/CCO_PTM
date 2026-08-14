const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/pdfmake-CkMY3Ap1.js',
      'assets/react-vendor-CByR7_Pi.js',
      'assets/vfs_fonts-8ICcZKi6.js'
    ])
) => i.map((i) => d[i]);
import { s as b, _ as h } from './index-BGSkqVb2.js';
async function g(e) {
  const { data: o, error: n } = await b.functions.invoke('rendiciones-publicas', { body: e });
  if (n)
    throw new Error(
      (o == null ? void 0 : o.error) || n.message || 'No se pudo conectar con rendiciones.'
    );
  if (!(o != null && o.ok))
    throw new Error((o == null ? void 0 : o.error) || 'No se pudo completar la operación.');
  return o;
}
const O = {
  bootstrap: (e) => g({ action: 'bootstrap', token: e }),
  submit: (e, o, n, i = '') =>
    g({ action: 'submit', token: e, payload: o, website: i, t_ms: Date.now() - n }),
  view: (e, o, n) => g({ action: 'view', token: e, report_id: o, view_token: n }),
  async upload(e, o, n, i, t) {
    const r = new FormData();
    return (
      r.append('action', 'upload'),
      e && r.append('token', e),
      r.append('view_token', o),
      r.append('report_id', n),
      r.append('item_id', i),
      r.append('file', t, t.name || 'evidencia.jpg'),
      g(r)
    );
  }
};
async function p(e, o = {}) {
  const { data: n, error: i } = await b.rpc(e, o);
  if (i) throw i;
  return n;
}
const A = {
  dashboard: (e = 200) => p('rendicion_admin_dashboard', { p_limit: e }),
  colaboradoresDetalle: () => p('rendicion_admin_colaboradores_detalle'),
  detalle: (e) => p('rendicion_admin_detalle', { p_id: e }),
  completarCabecera: (e, o) => p('rendicion_admin_completar_cabecera', { p_id: e, p_payload: o }),
  async eliminar(e) {
    const o = await p('rendicion_admin_eliminar', { p_id: e }),
      n = Array.isArray(o == null ? void 0 : o.storage_paths) ? o.storage_paths : [];
    if (n.length) {
      const { error: i } = await b.storage.from('rendicion-evidencias').remove(n);
      i && console.error('No se pudieron limpiar todas las evidencias:', i);
    }
    return o;
  },
  crearLink: (e, o, n) =>
    p('rendicion_admin_crear_link', {
      p_nombre: e,
      p_expires_at: o || null,
      p_max_submissions: n ? Number(n) : null
    }),
  toggleLink: (e, o) => p('rendicion_admin_toggle_link', { p_id: e, p_activo: o }),
  guardarCatalogo: (e, o) =>
    p('rendicion_admin_guardar_catalogo', {
      p_tipo: e,
      p_id: o.id || null,
      p_codigo: o.codigo || null,
      p_nombre: o.nombre,
      p_activo: o.activo ?? !0
    }),
  guardarColaboradorDetalle: (e) =>
    p('rendicion_admin_guardar_colaborador_detalle', {
      p_id: e.id || null,
      p_nombre: e.nombre,
      p_rut: e.rut || null,
      p_direccion_area: e.direccion_area || null,
      p_unidad: e.unidad || null,
      p_tecnico: e.tecnico || null,
      p_activo: e.activo ?? !0
    })
};
async function y(e) {
  var s, u;
  if (!((s = e == null ? void 0 : e.type) != null && s.startsWith('image/')))
    throw new Error('El archivo debe ser una imagen.');
  if (/heic|heif/i.test(e.type)) {
    if (e.size > 1572864)
      throw new Error('La imagen HEIC supera 1,5 MB. Reduce su tamaño antes de subirla.');
    return e;
  }
  const o = await createImageBitmap(e),
    n = Math.min(1, 1600 / Math.max(o.width, o.height)),
    i = document.createElement('canvas');
  ((i.width = Math.max(1, Math.round(o.width * n))),
    (i.height = Math.max(1, Math.round(o.height * n))),
    i.getContext('2d', { alpha: !1 }).drawImage(o, 0, 0, i.width, i.height),
    (u = o.close) == null || u.call(o));
  let t = 0.8,
    r;
  do ((r = await new Promise((a) => i.toBlob(a, 'image/jpeg', t))), (t -= 0.12));
  while ((r == null ? void 0 : r.size) > 1572864 && t >= 0.4);
  if (!r || r.size > 1572864) throw new Error('No fue posible reducir la foto a 1,5 MB.');
  return new File([r], `${e.name.replace(/\.[^.]+$/, '') || 'evidencia'}.jpg`, {
    type: 'image/jpeg'
  });
}
const L = /[\u200B-\u200D\uFEFF]/g,
  C = new RegExp('\\p{Cc}', 'gu'),
  T = ['Fondo por rendir', 'Rendición de gastos', 'Fondo fijo', 'Anticipo', 'Reembolso'],
  N = [
    'Factura',
    'Boleta',
    'Boleta de honorarios',
    'Voucher/comprobante',
    'Comprobante de transferencia',
    'Sin documento'
  ];
function _(e) {
  return String(e ?? '')
    .normalize('NFKC')
    .replace(L, '')
    .replace(C, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function R(e) {
  return new RegExp('\\p{L}', 'u').test(_(e));
}
function F(e) {
  const o = {};
  return (
    e.solicitante_tecnico_id ||
      (o.solicitante_tecnico_id = 'Selecciona tu nombre desde técnicos de Postventa.'),
    !Array.isArray(e.items) || e.items.length < 1 || e.items.length > 15
      ? ((o.items = 'Debes ingresar entre 1 y 15 gastos.'), o)
      : (e.items.forEach((n, i) => {
          const t = `items.${i}`;
          (n.fecha || (o[`${t}.fecha`] = 'Selecciona la fecha.'),
            n.categoria_codigo || (o[`${t}.categoria_codigo`] = 'Selecciona la categoría.'),
            n.subcategoria_codigo ||
              (o[`${t}.subcategoria_codigo`] = 'Selecciona la subcategoría.'),
            (!R(n.descripcion) || _(n.descripcion).length < 3) &&
              (o[`${t}.descripcion`] = 'La descripción debe contener letras reales.'),
            (!Number.isFinite(Number(n.monto)) || Number(n.monto) <= 0) &&
              (o[`${t}.monto`] = 'Ingresa un monto positivo.'),
            N.includes(n.tipo_documento) || (o[`${t}.tipo_documento`] = 'Selecciona el documento.'),
            n.numero_documento &&
              !/[\p{L}\p{N}]/u.test(_(n.numero_documento)) &&
              (o[`${t}.numero_documento`] = 'El número debe contener letras o dígitos reales.'));
        }),
        o)
  );
}
function x() {
  return {
    client_id: crypto.randomUUID(),
    fecha: new Date().toLocaleDateString('en-CA'),
    categoria_codigo: '',
    subcategoria_codigo: '',
    descripcion: '',
    monto: '',
    tipo_documento: '',
    numero_documento: '',
    photos: []
  };
}
function d(e) {
  const o = _(e);
  return /^[=+\-@]/.test(o) ? `'${o}` : o;
}
const m = (e) => `$ ${Math.round(Number(e || 0)).toLocaleString('es-CL')}`,
  f = (e) => (e ? new Date(`${String(e).slice(0, 10)}T12:00:00`).toLocaleDateString('es-CL') : '');
async function w(e) {
  try {
    const o = await fetch(e).then((n) => n.blob());
    return await new Promise((n, i) => {
      const t = new FileReader();
      ((t.onload = () => n(t.result)), (t.onerror = i), t.readAsDataURL(o));
    });
  } catch {
    return '';
  }
}
const I = (e) => _(e) || '-',
  E = (e, o = 110) => ({
    table: {
      widths: [o, '*'],
      body: e.map(([n, i]) => [
        { text: n, bold: !0, fontSize: 7, border: [!1, !1, !1, !1], margin: [0, 1.3, 4, 0] },
        {
          text: I(i),
          fontSize: 8.4,
          border: [!1, !1, !1, !0],
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
function S(e, o = {}) {
  const n = o.logo || '',
    i = o.evidenceImages || [],
    t = e.rendicion,
    r = [...(e.items || [])];
  for (; r.length < 15;) r.push(null);
  const s = [
      ['Nº', 'FECHA', 'Nº BOL/FAC', 'Detalle Descripción de gasto', 'CC', 'Categoría', 'Total'].map(
        (a) => ({ text: a, bold: !0, alignment: 'center', fillColor: '#f3f4f6' })
      ),
      ...r.map((a, c) =>
        a
          ? [
              String(c + 1),
              f(a.fecha),
              d(a.numero_documento || ''),
              d(a.descripcion),
              d(t.centro_costo_codigo),
              d(a.categoria_nombre),
              { text: m(a.monto), alignment: 'right' }
            ]
          : [String(c + 1), '', '', '', '', '', '']
      )
    ],
    u = [];
  for (let a = 0; a < i.length; a += 4)
    u.push({
      columns: i.slice(a, a + 4).map((c) => {
        var l;
        return {
          width: 120,
          stack: [
            { image: c.image, fit: [110, 145] },
            {
              text: `Gasto ${((l = e.items.find((D) => D.id === c.item_id)) == null ? void 0 : l.orden) || ''}`,
              alignment: 'center',
              margin: [0, 4]
            }
          ]
        };
      }),
      columnGap: 8,
      margin: [0, 0, 0, 12]
    });
  return {
    pageSize: 'A4',
    pageMargins: [20, 18, 20, 28],
    defaultStyle: { fontSize: 8, color: '#111827' },
    background: (a, c) =>
      a === 1
        ? {
            canvas: [
              {
                type: 'rect',
                x: 8,
                y: 8,
                w: c.width - 16,
                h: c.height - 22,
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
              n
                ? { image: n, width: 120, margin: [4, 0, 0, 2] }
                : { text: 'ptm health care', fontSize: 24, bold: !0, color: '#f05a16' },
              {
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: 'PLANILLA DE RENDICIÓN DE GASTOS',
                        bold: !0,
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
              E(
                [
                  ['RESPONSABLE RENDICIÓN', t.responsable_nombre],
                  ['RUT DEL RESPONSABLE', t.responsable_rut],
                  ['DIRECCIÓN - ÁREA', t.direccion_area],
                  ['UNIDAD', t.unidad],
                  ['CENTRO DE COSTO', t.centro_costo_nombre],
                  ['TÉCNICO', t.solicitante_tecnico_nombre || t.tecnico],
                  ['DETALLE', t.detalle]
                ],
                112
              )
            ]
          },
          {
            width: 190,
            stack: [
              E(
                [
                  ['FECHA DE LA RENDICIÓN', f(t.fecha_rendicion)],
                  ['Nº FOLIO SOLICITUD', t.folio_texto || t.folio],
                  [
                    'FONDO POR RENDIR',
                    t.tipo_fondo === 'Fondo por rendir' ? m(t.fondo_por_rendir) : '-'
                  ]
                ],
                98
              )
            ]
          }
        ],
        columnGap: 22
      },
      {
        table: { headerRows: 1, widths: [18, 52, 62, '*', 34, 65, 58], body: s },
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
              { text: 'Total General', bold: !0, alignment: 'right' },
              { text: m(t.total), bold: !0, alignment: 'right' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [300, 0, 0, 0]
      },
      ...(i.length
        ? [
            {
              text: 'EVIDENCIAS ADJUNTAS',
              bold: !0,
              fontSize: 12,
              pageBreak: 'before',
              margin: [0, 0, 0, 10]
            },
            ...u
          ]
        : [])
    ],
    footer: (a, c) => ({
      text: `${t.folio_texto || ''} · Página ${a} de ${c}`,
      alignment: 'center',
      fontSize: 7,
      color: '#64748b'
    })
  };
}
async function P(e) {
  var c;
  const o = await h(
      () => import('./pdfmake-CkMY3Ap1.js').then((l) => l.p),
      __vite__mapDeps([0, 1])
    ),
    n = await h(() => import('./vfs_fonts-8ICcZKi6.js').then((l) => l.v), __vite__mapDeps([2, 1])),
    i = o.default || o,
    t = n.default || n,
    r = e.rendicion;
  i.vfs = ((c = t.pdfMake) == null ? void 0 : c.vfs) || t.vfs || i.vfs;
  const s = await w('/logo-ptm.png'),
    u = await Promise.all(
      (e.fotos || []).slice(0, 10).map(async (l) => ({ ...l, image: await w(l.url) }))
    ),
    a = S(e, { logo: s, evidenceImages: u.filter((l) => l.image) });
  i.createPdf(a).download(`${r.folio_texto || 'Rendicion'}.pdf`);
}
async function $(e) {
  const o = await h(() => import('./xlsx-B2eTCt_Q.js'), []),
    n = o.default || o,
    i = e.rendicion,
    t = [
      ['ptm health care', '', 'PLANILLA DE RENDICIÓN DE GASTOS'],
      [],
      [
        'RESPONSABLE RENDICIÓN',
        d(i.responsable_nombre),
        '',
        '',
        'FECHA DE LA RENDICIÓN',
        f(i.fecha_rendicion)
      ],
      [
        'RUT DEL RESPONSABLE',
        d(i.responsable_rut || ''),
        '',
        '',
        'Nº FOLIO SOLICITUD',
        d(i.folio_texto || i.folio)
      ],
      [
        'DIRECCIÓN - ÁREA',
        d(i.direccion_area || ''),
        '',
        '',
        'FONDO POR RENDIR',
        i.tipo_fondo === 'Fondo por rendir' ? Number(i.fondo_por_rendir) : ''
      ],
      ['UNIDAD', d(i.unidad || '')],
      ['CENTRO DE COSTO', d(i.centro_costo_nombre || '')],
      ['TÉCNICO', d(i.solicitante_tecnico_nombre || i.tecnico || '')],
      ['DETALLE', d(i.detalle || '')],
      [],
      ['Nº', 'FECHA', 'Nº BOL/FAC', 'Detalle Descripción de gasto', 'CC', 'Categoría', 'Total']
    ];
  (e.items || []).forEach((a, c) =>
    t.push([
      c + 1,
      new Date(`${a.fecha}T12:00:00`),
      d(a.numero_documento || ''),
      d(a.descripcion),
      d(i.centro_costo_codigo),
      d(a.categoria_nombre),
      Number(a.monto)
    ])
  );
  const r = 12;
  for (; t.length < r - 1 + 15;) t.push([t.length - (r - 2), '', '', '', '', '', '']);
  t.push(['', '', '', '', '', 'Total General', { f: `SUM(G${r}:G${r + 14})` }]);
  const s = n.utils.aoa_to_sheet(t);
  ((s['!cols'] = [
    { wch: 7 },
    { wch: 14 },
    { wch: 18 },
    { wch: 52 },
    { wch: 12 },
    { wch: 20 },
    { wch: 16 }
  ]),
    (s['!merges'] = [n.utils.decode_range('C1:G1'), n.utils.decode_range('B9:G9')]));
  for (let a = 0; a < 7; a += 1) {
    const c = s[n.utils.encode_cell({ r: r - 2, c: a })];
    c &&
      (c.s = {
        font: { bold: !0 },
        alignment: { horizontal: 'center' },
        fill: { fgColor: { rgb: 'F3F4F6' } },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      });
  }
  for (let a = r - 1; a < t.length; a += 1) {
    const c = s[n.utils.encode_cell({ r: a, c: 6 })];
    c && (c.z = '$ #,##0');
  }
  const u = n.utils.book_new();
  (n.utils.book_append_sheet(u, s, 'Rendición'),
    n.writeFile(u, `${i.folio_texto || 'Rendicion'}.xlsx`));
}
export { N as T, $ as a, A as b, _ as c, P as d, x as e, T as f, R as h, y as o, O as r, F as v };
